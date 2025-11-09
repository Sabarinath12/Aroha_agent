import { useState, useRef } from "react";
import MapContainer, { MapContainerRef } from "@/components/MapContainer";
import RealtimeVoice from "@/components/RealtimeVoice";
import { JourneyProgressCard } from "@/components/JourneyProgressCard";
import PlaceCard from "@/components/PlaceCard";
import { MapPin, X, Map, Satellite, Maximize, Minimize, Store, Navigation, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useReplitAuth } from "@/lib/replitAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JourneyStage {
  stage: string;
  mode: 'walk' | 'metro' | 'uber' | 'bus' | 'train';
  provider?: string;
  fare: number;
  duration?: number;
  description: string;
}

interface TransportJourney {
  journeyName: string;
  totalFare: number;
  totalDuration?: number;
  stages: JourneyStage[];
  recommendation?: string;
}

interface Place {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  userRatingsTotal?: number;
  types?: string[];
  priceLevel?: number;
  businessStatus?: string;
  placeId: string;
  openNow?: boolean;
  icon?: string;
  photos?: Array<{
    reference: string;
    width: number;
    height: number;
  }>;
}

interface ConversationTurn {
  text: string;
  isUser: boolean;
  timestamp: Date;
  journeyData?: {
    journeys: TransportJourney[];
    origin?: string;
    destination?: string;
  };
}

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [lastJourneyData, setLastJourneyData] = useState<ConversationTurn['journeyData'] | null>(null);
  const [isJourneyExpanded, setIsJourneyExpanded] = useState(false);
  const [currentPlaces, setCurrentPlaces] = useState<Place[]>([]);
  const [isPlacesExpanded, setIsPlacesExpanded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<MapContainerRef>(null);
  const { toast } = useToast();
  const { logout, user } = useReplitAuth();

  const handleLocationChange = (location: { lat: number; lng: number }) => {
    setCurrentLocation(location);
    console.log('Location updated:', location);
  };
  
  const handleMapReady = () => {
    console.log("[Home] Map is ready for use");
  };

  const handleShareLiveLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Show the map if not visible
        setIsMapVisible(true);

        // Wait for map to be ready
        if (mapRef.current) {
          await mapRef.current.ensureReady();
          
          // Center map on user's location
          mapRef.current.centerMap(lat, lng, 15);
          
          // Add a marker at user's location
          mapRef.current.addMarker(lat, lng, "Your Location");
        }

        setIsLocating(false);

        toast({
          title: "Location Shared",
          description: "Map centered on your current location.",
        });
      },
      (error) => {
        setIsLocating(false);
        
        let errorMessage = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied. Please enable location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information unavailable.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out.";
        }

        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleTranscript = (text: string, isUser: boolean) => {
    // If this is an AI response and we have journey data, attach it
    if (!isUser && lastJourneyData) {
      setConversation(prev => [...prev, { 
        text, 
        isUser, 
        timestamp: new Date(),
        journeyData: lastJourneyData 
      }]);
      setLastJourneyData(null); // Clear after attaching
    } else {
      setConversation(prev => [...prev, { text, isUser, timestamp: new Date() }]);
    }
  };

  const handleMapTypeChange = (type: 'roadmap' | 'satellite' | 'hybrid') => {
    setMapType(type);
    mapRef.current?.setMapType(type);
  };

  // Helper to wait for map ref to be available
  const waitForMapRef = async (maxWaitMs: number = 1000): Promise<boolean> => {
    const startTime = Date.now();
    while (!mapRef.current && Date.now() - startTime < maxWaitMs) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return mapRef.current !== null;
  };

  // Map interaction handlers for AI
  const handleSearchLocation = async (query: string) => {
    // Show map first so it mounts and creates the ref
    setIsMapVisible(true);
    
    // Wait for the map ref to be available
    const hasRef = await waitForMapRef();
    if (!hasRef) {
      return { success: false, error: "Map component failed to mount" };
    }
    
    try {
      // Wait for map to be ready before searching
      await mapRef.current!.ensureReady();
      return await mapRef.current!.searchLocation(query);
    } catch (error) {
      console.error("Error waiting for map:", error);
      return { success: false, error: "Map initialization error" };
    }
  };

  const handleCenterMap = async (lat: number, lng: number, zoom?: number) => {
    // Show map first
    setIsMapVisible(true);
    
    const hasRef = await waitForMapRef();
    if (!hasRef) return;
    
    try {
      await mapRef.current!.ensureReady();
      mapRef.current!.centerMap(lat, lng, zoom);
    } catch (error) {
      console.error("Error waiting for map:", error);
    }
  };

  const handleAddMarker = async (lat: number, lng: number, label?: string) => {
    // Show map first
    setIsMapVisible(true);
    
    const hasRef = await waitForMapRef();
    if (!hasRef) return;
    
    try {
      await mapRef.current!.ensureReady();
      mapRef.current!.addMarker(lat, lng, label);
    } catch (error) {
      console.error("Error waiting for map:", error);
    }
  };

  const handleGetDirections = async (origin: string, destination: string) => {
    try {
      setIsMapVisible(true); // Show map when getting directions
      
      // Wait for map to be ready
      if (mapRef.current) {
        await mapRef.current.ensureReady();
      }
      
      const response = await fetch("/api/directions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ origin, destination }),
      });

      const data = await response.json();

      if (data.success && data.route && mapRef.current) {
        // Draw the route on the map
        mapRef.current.drawRoute(data.route.polyline, data.route.bounds);
        
        return {
          success: true,
          route: data.route,
          distance: data.distance,
          duration: data.duration,
        };
      } else {
        return {
          success: false,
          error: data.error || "Failed to get directions",
        };
      }
    } catch (error) {
      console.error("Directions error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get directions",
      };
    }
  };

  const handleCompareTransportation = async (origin: string, destination: string) => {
    try {
      // Show the map when comparing transportation
      setIsMapVisible(true);
      
      // Wait for map to be ready
      if (mapRef.current) {
        await mapRef.current.ensureReady();
      }

      // Get distance and route using Google Directions API
      const directionsResponse = await fetch("/api/directions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ origin, destination }),
      });

      const directionsData = await directionsResponse.json();

      if (!directionsData.success) {
        return {
          success: false,
          error: directionsData.error || "Could not calculate distance",
        };
      }

      // Draw the route on the map so user can see the path
      if (directionsData.route && mapRef.current) {
        mapRef.current.drawRoute(directionsData.route.polyline, directionsData.route.bounds);
      }

      // Extract numeric distance and convert to km
      const distanceText = directionsData.distance;
      let distanceKm: number;
      
      if (distanceText.includes('km')) {
        // Distance is in kilometers
        distanceKm = parseFloat(distanceText.replace(/[^0-9.]/g, ''));
      } else if (distanceText.includes('m')) {
        // Distance is in meters, convert to kilometers
        const meters = parseFloat(distanceText.replace(/[^0-9.]/g, ''));
        distanceKm = meters / 1000;
      } else {
        // Fallback: assume kilometers
        distanceKm = parseFloat(distanceText.replace(/[^0-9.]/g, ''));
      }

      // Use coordinates from directions API (no need to search again!)
      const fromLat = directionsData.startLocation.lat;
      const fromLng = directionsData.startLocation.lng;
      const toLat = directionsData.endLocation.lat;
      const toLng = directionsData.endLocation.lng;

      // Call transportation journeys API
      const response = await fetch("/api/transportation/journeys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromLat,
          fromLng,
          toLat,
          toLng,
          distanceKm: distanceKm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store journey data to be attached to next AI response
        const journeyInfo = {
          journeys: data.journeys,
          origin: directionsData.startAddress,
          destination: directionsData.endAddress,
        };
        setLastJourneyData(journeyInfo);

        return {
          success: true,
          journeys: data.journeys,
          distance: directionsData.distance,
          duration: directionsData.duration,
        };
      } else {
        return {
          success: false,
          error: data.error || "Failed to get transportation journeys",
        };
      }
    } catch (error) {
      console.error("Transportation comparison error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to compare transportation",
      };
    }
  };

  const handleFindNearbyPlaces = async (latitude: number, longitude: number, type?: string, radius?: number) => {
    try {
      // Show the map when finding nearby places
      setIsMapVisible(true);
      
      // Wait for map to be ready
      if (mapRef.current) {
        await mapRef.current.ensureReady();
      }

      const response = await fetch("/api/places/nearby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latitude, longitude, type, radius }),
      });

      const data = await response.json();

      if (data.success && data.places && data.places.length > 0 && mapRef.current) {
        // Display places on the map
        mapRef.current.showPlaces(data.places);
        
        // Store places for card display and automatically expand for better visibility
        setCurrentPlaces(data.places);
        setIsPlacesExpanded(true); // Auto-expand to give users better view of place cards
        
        return {
          success: true,
          places: data.places,
          count: data.count,
        };
      } else if (data.success && data.count === 0) {
        // Clear any existing markers when no results found
        if (mapRef.current) {
          mapRef.current.clearPlaces();
        }
        
        // Clear places cards
        setCurrentPlaces([]);
        
        return {
          success: true,
          places: [],
          count: 0,
          message: data.message || "No places found nearby",
        };
      } else {
        // Clear markers on error to avoid showing stale data
        if (mapRef.current) {
          mapRef.current.clearPlaces();
        }
        
        // Clear places cards
        setCurrentPlaces([]);
        
        return {
          success: false,
          error: data.error || "Failed to find nearby places",
        };
      }
    } catch (error) {
      console.error("Find nearby places error:", error);
      
      // Clear markers on exception
      if (mapRef.current) {
        mapRef.current.clearPlaces();
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to find nearby places",
      };
    }
  };

  // Find the most recent journey data from AI messages
  const currentJourneyData = [...conversation]
    .reverse()
    .find(turn => !turn.isUser && turn.journeyData)?.journeyData;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pb-32 bg-gradient-to-br from-gray-900 via-black to-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent" />
      
      <div className="w-full max-w-7xl h-[calc(100vh-10rem)] relative z-10 flex gap-4">
        {/* Conversation Panel - Takes full width when map is hidden */}
        <div 
          className={`transition-all duration-500 ease-in-out ${
            isMapVisible ? "w-1/2" : "w-full"
          }`}
        >
          <div className="h-full flex flex-col rounded-lg border border-gray-800 bg-gray-950/50 backdrop-blur-sm shadow-2xl overflow-hidden relative">
            {/* Settings Menu */}
            <div className="absolute top-3 right-3 z-50">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-gray-900/70 backdrop-blur-sm border border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white"
                    data-testid="button-settings"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900/95 backdrop-blur-xl border-gray-700">
                  {user && (
                    <>
                      <DropdownMenuLabel className="text-gray-400">Account</DropdownMenuLabel>
                      <DropdownMenuItem className="text-gray-300 focus:bg-gray-800 focus:text-white" disabled>
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name || "User"} 
                            className="w-4 h-4 rounded-full border border-gray-600 mr-2"
                          />
                        ) : (
                          <User className="w-4 h-4 mr-2" />
                        )}
                        <span className="font-medium">{user.name}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={() => logout()}
                    className="text-red-400 focus:bg-red-900/20 focus:text-red-300 cursor-pointer"
                    data-testid="menu-item-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Top Section: Conversation Transcripts */}
            {!isJourneyExpanded && (
              <div 
                className={`overflow-y-auto p-6 transition-all duration-500 ${
                  currentJourneyData ? "flex-[1.2]" : "flex-1"
                }`} 
                data-testid="conversation-box"
              >
              {conversation.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6" data-testid="text-empty-state">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-cyan-500/30">
                    <MapPin className="w-10 h-10 text-cyan-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      Hey, {user?.name || "there"}!
                    </h3>
                    <p className="text-gray-400 max-w-md">
                      Click the microphone below to start a conversation with Aroha. 
                      Ask about places to visit, directions, or travel tips!
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    <button
                      onClick={() => handleSearchLocation("Cubbon Park, Bangalore")}
                      className="px-3 py-1.5 text-xs bg-gray-800/50 text-gray-300 rounded-full border border-gray-700 hover-elevate active-elevate-2 transition-all"
                      data-testid="button-example-cubbon"
                    >
                      Show me Cubbon Park
                    </button>
                    <button
                      onClick={() => handleGetDirections("Bangalore", "Indiranagar, Bangalore")}
                      className="px-3 py-1.5 text-xs bg-gray-800/50 text-gray-300 rounded-full border border-gray-700 hover-elevate active-elevate-2 transition-all"
                      data-testid="button-example-indiranagar"
                    >
                      Directions to Indiranagar
                    </button>
                    <button
                      onClick={() => handleSearchLocation("Koramangala, Bangalore")}
                      className="px-3 py-1.5 text-xs bg-gray-800/50 text-gray-300 rounded-full border border-gray-700 hover-elevate active-elevate-2 transition-all"
                      data-testid="button-example-koramangala"
                    >
                      Hidden gems in Koramangala
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversation.map((turn, index) => (
                    <div
                      key={index}
                      className="animate-in fade-in duration-700"
                      data-testid={turn.isUser ? "text-user-message" : "text-ai-message"}
                    >
                      <div className={`flex ${turn.isUser ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl overflow-hidden ${
                            turn.isUser
                              ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-100"
                              : "bg-gray-800/50 border border-gray-700 text-gray-200"
                          }`}
                        >
                          {/* Message header and text */}
                          <div className="px-5 py-3.5">
                            <div className="text-xs font-semibold mb-2 opacity-70 uppercase tracking-wide">
                              {turn.isUser ? "You" : "Aroha"}
                            </div>
                            <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                              {turn.text}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
            
            {/* Bottom Section: Journey Progression Cards */}
            {currentJourneyData && (
              <div 
                className={`${
                  isJourneyExpanded 
                    ? "flex-1" 
                    : "flex-1 border-t border-gray-700/70"
                } bg-gradient-to-b from-gray-900/60 to-gray-950/80 p-6 overflow-y-auto animate-in slide-in-from-bottom duration-500`}
                data-testid="section-journey-cards"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isJourneyExpanded && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsJourneyExpanded(false)}
                        className="text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 -ml-2"
                        data-testid="button-close-journey"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Back to Chat
                      </Button>
                    )}
                    <div className="h-1 w-1 rounded-full bg-cyan-400" />
                    <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">
                      Transportation Options <span className="text-xs text-muted-foreground normal-case">(approximate estimation)</span>
                    </h3>
                  </div>
                  {!isJourneyExpanded && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsJourneyExpanded(true)}
                      className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                      data-testid="button-expand-journey"
                    >
                      <Maximize className="w-4 h-4 mr-2" />
                      Expand
                    </Button>
                  )}
                </div>
                <JourneyProgressCard
                  journeys={currentJourneyData.journeys}
                  origin={currentJourneyData.origin}
                  destination={currentJourneyData.destination}
                />
              </div>
            )}
            
            {/* Places Section: Display Tourist Places, Restaurants, Hotels */}
            {currentPlaces.length > 0 && (
              <div 
                className={`${
                  isPlacesExpanded 
                    ? "flex-1" 
                    : "flex-1 border-t border-gray-700/70"
                } bg-gradient-to-b from-gray-900/60 to-gray-950/80 p-6 overflow-y-auto animate-in slide-in-from-bottom duration-500`}
                data-testid="section-places-cards"
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isPlacesExpanded && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsPlacesExpanded(false)}
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 -ml-2"
                        data-testid="button-close-places"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Back to Chat
                      </Button>
                    )}
                    <div className="h-1 w-1 rounded-full bg-emerald-400" />
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      Nearby Places
                      <span className="text-xs text-muted-foreground normal-case">({currentPlaces.length} found)</span>
                    </h3>
                  </div>
                  {!isPlacesExpanded && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsPlacesExpanded(true)}
                      className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                      data-testid="button-expand-places"
                    >
                      <Maximize className="w-4 h-4 mr-2" />
                      Expand
                    </Button>
                  )}
                </div>
                
                {/* Place Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentPlaces.map((place) => (
                    <PlaceCard
                      key={place.placeId}
                      place={place}
                      onViewOnMap={(lat, lng) => {
                        mapRef.current?.centerMap(lat, lng, 16);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Map Panel - Slides in from right when visible */}
        <div 
          className={`transition-all duration-700 ease-out ${
            isMapVisible ? "w-1/2 opacity-100" : "w-0 opacity-0"
          } overflow-hidden`}
        >
          {isMapVisible && (
            <div className="h-full rounded-lg overflow-hidden border border-gray-800 shadow-2xl relative animate-in fade-in duration-700">
              <div className="absolute top-3 left-3 z-[1000]">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMapVisible(false)}
                  className="bg-white/95 backdrop-blur-sm border border-gray-300 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg"
                  data-testid="button-hide-map"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close Map
                </Button>
              </div>
              
              <div className="absolute bottom-32 right-3 z-[1000] flex flex-col gap-2">
                {/* Share Live Location Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleShareLiveLocation}
                  disabled={isLocating}
                  className="bg-white/95 backdrop-blur-sm border border-gray-300 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg justify-start"
                  data-testid="button-share-location"
                >
                  <Navigation className={`w-4 h-4 mr-2 ${isLocating ? 'animate-pulse' : ''}`} />
                  {isLocating ? 'Locating...' : 'My Location'}
                </Button>
                
                {/* Map Type Switcher */}
                <div className="flex flex-col gap-1 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-md shadow-lg overflow-hidden">
                  <Button
                    size="sm"
                    variant={mapType === 'roadmap' ? 'default' : 'ghost'}
                    onClick={() => handleMapTypeChange('roadmap')}
                    className={`${mapType === 'roadmap' ? 'bg-gray-700 text-white' : 'text-gray-700 hover:bg-gray-100'} justify-start`}
                    data-testid="button-map-roadmap"
                  >
                    <Map className="w-4 h-4 mr-2" />
                    Map
                  </Button>
                  <Button
                    size="sm"
                    variant={mapType === 'satellite' ? 'default' : 'ghost'}
                    onClick={() => handleMapTypeChange('satellite')}
                    className={`${mapType === 'satellite' ? 'bg-gray-700 text-white' : 'text-gray-700 hover:bg-gray-100'} justify-start`}
                    data-testid="button-map-satellite"
                  >
                    <Satellite className="w-4 h-4 mr-2" />
                    Satellite
                  </Button>
                </div>
              </div>
              <MapContainer 
                ref={mapRef} 
                onLocationChange={handleLocationChange}
                onReady={handleMapReady}
              />
            </div>
          )}
        </div>
      </div>
      
      <RealtimeVoice 
        onTranscript={handleTranscript}
        onSearchLocation={handleSearchLocation}
        onCenterMap={handleCenterMap}
        onAddMarker={handleAddMarker}
        onGetDirections={handleGetDirections}
        onCompareTransportation={handleCompareTransportation}
        onFindNearbyPlaces={handleFindNearbyPlaces}
      />
    </div>
  );
}
