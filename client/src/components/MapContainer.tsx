/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    google: typeof google;
  }
}

interface MapContainerProps {
  onLocationChange?: (location: { lat: number; lng: number }) => void;
  onReady?: () => void;
}

export interface Place {
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  openNow?: boolean;
  types?: string[];
}

export interface MapContainerRef {
  ensureReady: () => Promise<void>;
  searchLocation: (query: string) => Promise<{ 
    success: boolean; 
    location?: { lat: number; lng: number }; 
    address?: string; 
    error?: string;
    technicalError?: string;
    status?: string;
  }>;
  centerMap: (lat: number, lng: number, zoom?: number) => void;
  addMarker: (lat: number, lng: number, label?: string) => void;
  drawRoute: (encodedPolyline: string, bounds?: any) => void;
  clearRoute: () => void;
  setMapType: (type: 'roadmap' | 'satellite' | 'hybrid') => void;
  showPlaces: (places: Place[]) => void;
  clearPlaces: () => void;
}

const MapContainer = forwardRef<MapContainerRef, MapContainerProps>(({ onLocationChange, onReady }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const placeMarkersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const { toast } = useToast();
  
  // Map readiness promise
  const readyPromiseRef = useRef<Promise<void>>();
  const readyResolveRef = useRef<(() => void) | null>(null);
  const readyRejectRef = useRef<((reason: any) => void) | null>(null);
  
  // Initialize the ready promise with timeout
  if (!readyPromiseRef.current) {
    readyPromiseRef.current = new Promise<void>((resolve, reject) => {
      readyResolveRef.current = resolve;
      readyRejectRef.current = reject;
      
      // Reject after 10 seconds if map hasn't initialized
      setTimeout(() => {
        if (readyRejectRef.current === reject) {
          reject(new Error("Map initialization timeout"));
        }
      }, 10000);
    });
  }

  // Clear all markers from the map
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  // Clear all place markers and info windows
  const clearPlaces = () => {
    placeMarkersRef.current.forEach(marker => marker.setMap(null));
    placeMarkersRef.current = [];
    infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
    infoWindowsRef.current = [];
  };

  // Clear the route polyline from the map
  const clearRoute = () => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
  };

  // Expose imperative methods to parent component
  useImperativeHandle(ref, () => ({
    ensureReady: () => {
      return readyPromiseRef.current!;
    },
    
    searchLocation: async (query: string) => {
      if (!window.google) {
        const error = "Google Maps is not loaded yet. Please wait a moment and try again.";
        console.error("[MapContainer] searchLocation failed:", error);
        toast({
          title: "Map Not Ready",
          description: error,
          variant: "destructive",
        });
        return { success: false, error };
      }

      if (!mapInstanceRef.current) {
        const error = "Map is not initialized yet. Please wait a moment.";
        console.error("[MapContainer] searchLocation failed:", error);
        return { success: false, error };
      }

      console.log("[MapContainer] Searching for location:", query);

      return new Promise((resolve) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: query }, (results, status) => {
          console.log("[MapContainer] Geocoding status:", status);
          
          if (status === "OK" && results && results[0]) {
            const location = results[0].geometry.location;
            const latLng = { lat: location.lat(), lng: location.lng() };
            const address = results[0].formatted_address;
            
            console.log("[MapContainer] Location found:", address, latLng);
            
            // Clear previous markers before adding new one
            clearMarkers();
            
            mapInstanceRef.current?.setCenter(location);
            mapInstanceRef.current?.setZoom(14);
            
            const marker = new google.maps.Marker({
              map: mapInstanceRef.current!,
              position: location,
              animation: google.maps.Animation.DROP,
            });
            markersRef.current.push(marker);

            onLocationChange?.(latLng);
            
            toast({
              title: "Location found",
              description: address,
            });
            
            resolve({
              success: true,
              location: latLng,
              address
            });
          } else {
            // Provide detailed error information
            let errorMessage = "Could not find that location.";
            let detailedError = `Geocoding failed with status: ${status}`;
            
            switch (status) {
              case "ZERO_RESULTS":
                errorMessage = `I couldn't find "${query}". Please try a different search term or be more specific.`;
                detailedError = `No results found for query: "${query}"`;
                toast({
                  title: "Location not found",
                  description: errorMessage,
                  variant: "destructive",
                });
                break;
              case "REQUEST_DENIED":
                errorMessage = "The map service is not properly configured. Please check the API key settings.";
                detailedError = "Geocoding API access denied. The API key may not have Geocoding API enabled.";
                toast({
                  title: "Map Configuration Error",
                  description: "The Geocoding API is not enabled. Please enable it in the Google Cloud Console.",
                  variant: "destructive",
                });
                break;
              case "INVALID_REQUEST":
                errorMessage = `The search term "${query}" is not valid. Please try a different search.`;
                detailedError = "Invalid geocoding request";
                break;
              case "OVER_QUERY_LIMIT":
                errorMessage = "Too many map requests. Please try again in a moment.";
                detailedError = "Geocoding API quota exceeded";
                break;
              case "UNKNOWN_ERROR":
                errorMessage = "A temporary error occurred. Please try again.";
                detailedError = "Unknown geocoding error";
                break;
            }
            
            console.error("[MapContainer] Geocoding error:", detailedError);
            
            resolve({
              success: false,
              error: errorMessage,
              technicalError: detailedError,
              status
            });
          }
        });
      });
    },

    centerMap: (lat: number, lng: number, zoom?: number) => {
      if (!mapInstanceRef.current) return;
      
      const latLng = { lat, lng };
      mapInstanceRef.current.setCenter(latLng);
      if (zoom !== undefined) {
        mapInstanceRef.current.setZoom(zoom);
      }
      onLocationChange?.(latLng);
    },

    addMarker: (lat: number, lng: number, label?: string) => {
      if (!mapInstanceRef.current) return;
      
      const marker = new google.maps.Marker({
        map: mapInstanceRef.current,
        position: { lat, lng },
        label: label,
        animation: google.maps.Animation.DROP,
      });
      markersRef.current.push(marker);
    },

    drawRoute: (encodedPolyline: string, bounds?: any) => {
      if (!mapInstanceRef.current || !window.google) return;
      
      // Clear any existing route
      clearRoute();
      
      // Decode the polyline
      const path = google.maps.geometry.encoding.decodePath(encodedPolyline);
      
      // Create and display the polyline with cyan color
      polylineRef.current = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: "#06B6D4", // Cyan color matching the theme
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map: mapInstanceRef.current,
      });
      
      // Fit map to route bounds if provided
      if (bounds) {
        const googleBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(bounds.southwest.lat, bounds.southwest.lng),
          new google.maps.LatLng(bounds.northeast.lat, bounds.northeast.lng)
        );
        mapInstanceRef.current.fitBounds(googleBounds);
      }
      
      console.log("[MapContainer] Route drawn on map");
    },

    clearRoute: () => {
      clearRoute();
      console.log("[MapContainer] Route cleared from map");
    },

    setMapType: (type: 'roadmap' | 'satellite' | 'hybrid') => {
      if (!mapInstanceRef.current) return;
      mapInstanceRef.current.setMapTypeId(type);
      console.log("[MapContainer] Map type changed to:", type);
    },

    showPlaces: (places: Place[]) => {
      if (!mapInstanceRef.current || !window.google) return;

      // Clear existing place markers
      clearPlaces();

      console.log(`[MapContainer] Displaying ${places.length} places on map`);

      // Create markers for each place
      places.forEach((place, index) => {
        const marker = new google.maps.Marker({
          map: mapInstanceRef.current!,
          position: place.location,
          title: place.name,
          animation: google.maps.Animation.DROP,
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }
        });

        // Create info window content
        const ratingStars = place.rating 
          ? '⭐'.repeat(Math.round(place.rating)) 
          : '';
        
        const priceSymbols = place.priceLevel 
          ? '$'.repeat(place.priceLevel) 
          : '';

        const openStatus = place.openNow !== undefined
          ? place.openNow 
            ? '<span style="color: green;">● Open now</span>'
            : '<span style="color: red;">● Closed</span>'
          : '';

        const infoContent = `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${place.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${place.address}</p>
            ${place.rating ? `<div style="margin: 4px 0; font-size: 12px;">${ratingStars} ${place.rating.toFixed(1)} (${place.userRatingsTotal || 0} reviews)</div>` : ''}
            ${priceSymbols ? `<div style="margin: 4px 0; font-size: 12px;">${priceSymbols}</div>` : ''}
            ${openStatus ? `<div style="margin: 4px 0; font-size: 12px;">${openStatus}</div>` : ''}
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent
        });

        // Show info window on marker click
        marker.addListener('click', () => {
          // Close all other info windows
          infoWindowsRef.current.forEach(iw => iw.close());
          infoWindow.open(mapInstanceRef.current!, marker);
        });

        placeMarkersRef.current.push(marker);
        infoWindowsRef.current.push(infoWindow);
      });

      // Fit map to show all markers
      if (places.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        places.forEach(place => {
          bounds.extend(place.location);
        });
        mapInstanceRef.current.fitBounds(bounds);
        
        // Zoom out a bit if only one place
        if (places.length === 1) {
          setTimeout(() => {
            mapInstanceRef.current?.setZoom(15);
          }, 500);
        }
      }
    },

    clearPlaces: () => {
      clearPlaces();
      console.log("[MapContainer] Cleared all place markers");
    }
  }));

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const loadGoogleMaps = () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key is missing');
        toast({
          title: "Configuration Error",
          description: "Google Maps API key is not configured",
          variant: "destructive",
        });
        // Reject the ready promise
        if (readyRejectRef.current) {
          readyRejectRef.current(new Error("Google Maps API key is missing"));
        }
        return;
      }

      if (window.google) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        toast({
          title: "Map Load Error",
          description: "Failed to load Google Maps. Please check your connection.",
          variant: "destructive",
        });
        // Reject the ready promise
        if (readyRejectRef.current) {
          readyRejectRef.current(new Error("Failed to load Google Maps script"));
        }
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!window.google || !mapRef.current) return;

      const defaultCenter = { lat: 40.7128, lng: -74.0060 };
      
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e9e9e9" }]
          }
        ]
      });
      
      // Resolve the ready promise and notify parent
      console.log("[MapContainer] Map initialized and ready");
      if (readyResolveRef.current) {
        readyResolveRef.current();
        // Clear reject ref to prevent timeout from firing
        readyRejectRef.current = null;
      }
      onReady?.();
    };

    loadGoogleMaps();
  }, [toast, onReady]);

  const handleSearch = () => {
    if (!searchValue.trim() || !window.google) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchValue }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        const latLng = { lat: location.lat(), lng: location.lng() };
        
        mapInstanceRef.current?.setCenter(location);
        mapInstanceRef.current?.setZoom(14);
        
        new google.maps.Marker({
          map: mapInstanceRef.current!,
          position: location,
        });

        onLocationChange?.(latLng);
        
        toast({
          title: "Location found",
          description: results[0].formatted_address,
        });
      } else {
        toast({
          title: "Location not found",
          description: "Please try a different search term",
          variant: "destructive",
        });
      }
    });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        mapInstanceRef.current?.setCenter(latLng);
        mapInstanceRef.current?.setZoom(14);
        
        new google.maps.Marker({
          map: mapInstanceRef.current!,
          position: latLng,
        });

        onLocationChange?.(latLng);
        
        toast({
          title: "Current location",
          description: "Centered map on your location",
        });
      },
      () => {
        toast({
          title: "Location access denied",
          description: "Please enable location access",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" data-testid="map-container" />
      
      <button
        onClick={handleCurrentLocation}
        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-md shadow-lg flex items-center justify-center border border-gray-300 hover:bg-gray-50 transition-colors z-[1000]"
        data-testid="button-current-location"
      >
        <MapPin className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
});

MapContainer.displayName = "MapContainer";

export default MapContainer;
