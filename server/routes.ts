import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import rateLimit from "express-rate-limit";
import { compareTransportation, getTransportJourneys } from "./transportation";
import { getReplitUser } from "./auth";

// Blueprint integration: javascript_openai
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const upload = multer({ dest: "uploads/" });

// Rate limiter for session creation to prevent API abuse
// Allows 5 session requests per 15 minutes per IP address
const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: "Too many session requests from this IP, please try again later."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip} on /api/session`);
    res.status(429).json({
      error: "Too many session requests. Please wait before trying again.",
      retryAfter: Math.ceil(15 * 60) // seconds
    });
  },
});

// General API rate limiter to prevent abuse across all endpoints
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: {
    error: "Too many requests from this IP, please slow down."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for non-API routes
    return !req.path.startsWith('/api/');
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply general rate limiting to all API routes
  app.use(apiLimiter);

  // Get current authenticated user
  app.get("/api/user", (req, res) => {
    const user = getReplitUser(req);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Logout endpoint (clears session)
  app.post("/api/logout", (req, res) => {
    // Replit auth is handled via headers, so we just confirm logout
    res.json({ success: true });
  });

  // Create ephemeral session key for WebRTC Realtime API
  // Protected with strict rate limiting to prevent abuse
  app.post("/api/session", sessionLimiter, async (req, res) => {
    try {
      // Log session creation attempts for monitoring
      console.log(`[Security] Session creation requested from IP: ${req.ip}`);
      
      const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "alloy",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`[Security] OpenAI session creation failed for IP: ${req.ip}`, error);
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await response.json();
      console.log(`[Security] Session created successfully for IP: ${req.ip}`);
      res.json(data);
    } catch (error) {
      console.error("Session creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create session";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Get directions between two locations using Google Directions API
  app.post("/api/directions", async (req, res) => {
    try {
      const { origin, destination } = req.body;

      if (!origin || !destination) {
        return res.status(400).json({
          success: false,
          error: "Origin and destination are required"
        });
      }

      const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          error: "Google Maps API key not configured"
        });
      }

      // Call Google Directions API
      const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
      url.searchParams.append("origin", origin);
      url.searchParams.append("destination", destination);
      url.searchParams.append("key", apiKey);

      const response = await fetch(url.toString());
      const data = await response.json();

      console.log(`[Directions] Request from ${origin} to ${destination}, status: ${data.status}`);

      if (data.status === "OK" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];

        return res.json({
          success: true,
          route: {
            polyline: route.overview_polyline.points,
            bounds: route.bounds,
            steps: leg.steps.map((step: any) => ({
              instruction: step.html_instructions,
              distance: step.distance.text,
              duration: step.duration.text,
            })),
          },
          distance: leg.distance.text,
          duration: leg.duration.text,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          startLocation: {
            lat: leg.start_location.lat,
            lng: leg.start_location.lng,
          },
          endLocation: {
            lat: leg.end_location.lat,
            lng: leg.end_location.lng,
          },
        });
      } else if (data.status === "ZERO_RESULTS") {
        return res.json({
          success: false,
          error: "No route found between these locations. They may be too far apart or unreachable by road."
        });
      } else if (data.status === "REQUEST_DENIED") {
        return res.json({
          success: false,
          error: "Directions API is not enabled. Please enable the Directions API in Google Cloud Console."
        });
      } else if (data.status === "OVER_QUERY_LIMIT") {
        return res.json({
          success: false,
          error: "API quota exceeded. Please try again later."
        });
      } else {
        return res.json({
          success: false,
          error: `Directions request failed: ${data.status}`
        });
      }
    } catch (error) {
      console.error("Directions API error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to get directions"
      });
    }
  });

  // Compare transportation options between two locations
  app.post("/api/transportation/compare", async (req, res) => {
    try {
      const { fromLat, fromLng, toLat, toLng, distanceKm } = req.body;

      if (fromLat === undefined || fromLat === null || 
          fromLng === undefined || fromLng === null || 
          toLat === undefined || toLat === null || 
          toLng === undefined || toLng === null || 
          distanceKm === undefined || distanceKm === null) {
        return res.status(400).json({
          success: false,
          error: "Missing required parameters: fromLat, fromLng, toLat, toLng, distanceKm"
        });
      }

      console.log(`[Transportation] Comparing options from (${fromLat}, ${fromLng}) to (${toLat}, ${toLng}), distance: ${distanceKm}km`);

      const options = await compareTransportation(fromLat, fromLng, toLat, toLng, distanceKm);

      return res.json({
        success: true,
        options,
      });
    } catch (error) {
      console.error("Transportation comparison error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to compare transportation options"
      });
    }
  });

  // Get journey progressions with stages (Amazon-style delivery tracking)
  app.post("/api/transportation/journeys", async (req, res) => {
    try {
      const { fromLat, fromLng, toLat, toLng, distanceKm } = req.body;

      if (fromLat === undefined || fromLat === null || 
          fromLng === undefined || fromLng === null || 
          toLat === undefined || toLat === null || 
          toLng === undefined || toLng === null || 
          distanceKm === undefined || distanceKm === null) {
        return res.status(400).json({
          success: false,
          error: "Missing required parameters: fromLat, fromLng, toLat, toLng, distanceKm"
        });
      }

      console.log(`[Transportation] Getting journey progressions from (${fromLat}, ${fromLng}) to (${toLat}, ${toLng}), distance: ${distanceKm}km`);

      const journeys = await getTransportJourneys(fromLat, fromLng, toLat, toLng, distanceKm);

      return res.json({
        success: true,
        journeys,
      });
    } catch (error) {
      console.error("Transportation journeys error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to get transportation journeys"
      });
    }
  });

  // Find nearby places using Google Places API
  app.post("/api/places/nearby", async (req, res) => {
    try {
      const { latitude, longitude, type, radius, keyword } = req.body;

      if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
        return res.status(400).json({
          success: false,
          error: "Latitude and longitude are required"
        });
      }

      const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          error: "Google Maps API key not configured"
        });
      }

      // Build Places API Nearby Search request
      const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
      url.searchParams.append("location", `${latitude},${longitude}`);
      url.searchParams.append("radius", radius ? String(radius) : "1500"); // Default 1.5km
      if (type) {
        url.searchParams.append("type", type);
      }
      if (keyword) {
        url.searchParams.append("keyword", keyword);
      }
      url.searchParams.append("key", apiKey);

      console.log(`[Places] Searching nearby ${type || 'places'} at (${latitude}, ${longitude}), radius: ${radius || 1500}m`);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const places = data.results.slice(0, 20).map((place: any) => ({
          name: place.name,
          address: place.vicinity || place.formatted_address,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          types: place.types,
          priceLevel: place.price_level,
          businessStatus: place.business_status,
          placeId: place.place_id,
          openNow: place.opening_hours?.open_now,
          icon: place.icon,
          photos: place.photos ? place.photos.slice(0, 1).map((photo: any) => ({
            reference: photo.photo_reference,
            width: photo.width,
            height: photo.height
          })) : []
        }));

        console.log(`[Places] Found ${places.length} places`);

        return res.json({
          success: true,
          places,
          count: places.length
        });
      } else if (data.status === "ZERO_RESULTS") {
        return res.json({
          success: true,
          places: [],
          count: 0,
          message: "No places found in this area. Try increasing the search radius or changing the location."
        });
      } else if (data.status === "REQUEST_DENIED") {
        return res.json({
          success: false,
          error: "Places API is not enabled. Please enable the Places API in Google Cloud Console."
        });
      } else if (data.status === "OVER_QUERY_LIMIT") {
        return res.json({
          success: false,
          error: "API quota exceeded. Please try again later."
        });
      } else {
        return res.json({
          success: false,
          error: `Places search failed: ${data.status}`
        });
      }
    } catch (error) {
      console.error("Places API error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to search nearby places"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
