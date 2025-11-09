import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RealtimeVoiceProps {
  onTranscript?: (transcript: string, isUser: boolean) => void;
  onSearchLocation?: (query: string) => Promise<{ success: boolean; location?: { lat: number; lng: number }; address?: string; error?: string }>;
  onCenterMap?: (lat: number, lng: number, zoom?: number) => void;
  onAddMarker?: (lat: number, lng: number, label?: string) => void;
  onGetDirections?: (origin: string, destination: string) => Promise<{ success: boolean; route?: any; distance?: string; duration?: string; error?: string }>;
  onCompareTransportation?: (origin: string, destination: string) => Promise<{ success: boolean; options?: any[]; error?: string }>;
  onFindNearbyPlaces?: (latitude: number, longitude: number, type?: string, radius?: number) => Promise<{ success: boolean; places?: any[]; count?: number; error?: string }>;
}

export default function RealtimeVoice({ onTranscript, onSearchLocation, onCenterMap, onAddMarker, onGetDirections, onCompareTransportation, onFindNearbyPlaces }: RealtimeVoiceProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const startConversation = async () => {
    setIsConnecting(true);
    
    try {
      // Get ephemeral session key from backend
      const sessionResponse = await fetch("/api/session", {
        method: "POST",
      });

      if (!sessionResponse.ok) {
        throw new Error("Failed to create session");
      }

      const sessionData = await sessionResponse.json();
      const ephemeralKey = sessionData.client_secret.value;

      // Create peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Get user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      localStreamRef.current = stream;
      
      // Add microphone track to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create data channel for events
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;

      dc.addEventListener("open", () => {
        console.log("Data channel opened");
        // Send initial configuration with map interaction tools
        dc.send(JSON.stringify({
          type: "session.update",
          session: {
            instructions: `You are Aroha, a friendly travel companion helping people explore through this interactive map.

Communication style:
- Keep responses SHORT and to the point - 1-2 sentences maximum
- Be warm and conversational, but concise
- Only elaborate if specifically asked for more details
- Share fun facts sparingly - only when highly relevant

Your approach:
1. Answer directly and briefly
2. Use tools immediately when needed
3. Offer one specific suggestion instead of multiple options
4. Save detailed explanations for when users ask "why" or "tell me more"

Visual journey blocks:
- When you use compare_transportation successfully, users see color-coded journey blocks below the chat
- Purple blocks = Metro, Green = Bus, Cyan = Uber/Ola, Gray = Walking
- Each block shows the stage, fare, and duration
- You can reference these visually: "Check the blocks below" or "The purple metro route wins"
- Don't describe every stage verbally - the blocks show the details
- Focus on highlighting the best option or notable tradeoffs
- If blocks can't load or tool fails, stay brief and mention what you found without the visual

Visual place cards:
- When you use find_nearby_places successfully, users see beautiful place cards below the chat
- Each card shows photos, ratings, prices, opening hours, and full details
- Reference them concisely: "Check the cards below for details" or "I found 8 great spots - see the cards"
- Don't read out every detail (name, rating, address) - the cards display everything visually
- Focus on a quick summary: "Found 5 restaurants nearby" or "Here are the top hotels"
- Cards are displayed in a scrollable grid with expand option for full view

Tool usage:
- search_location: Find places or locations
- get_directions: Get routes from A to B (shows route on map)
- compare_transportation: Show all transport options with visual journey blocks (only works for Bengaluru/Bangalore trips; for other cities, use get_directions instead)
- find_nearby_places: Find restaurants, tourist spots, hotels nearby - displays beautiful cards with photos, ratings, and details
- center_map, add_marker: Highlight locations

Example responses:
❌ "I'd be happy to help you find restaurants! There are many great options in that area. Would you prefer casual dining or something more upscale? I can search for Italian, Indian, or local cuisine..."
✅ "Sure! Let me find restaurants nearby." [then use find_nearby_places tool]

❌ "I found several great restaurants in MG Road! First, there's Koshy's Restaurant with a 4.3 star rating located at St. Mark's Road, they're currently open and serve Indian and Continental food. Then there's Truffles with 4.5 stars at..."
✅ "Found 8 restaurants - check the cards below!" [after successful find_nearby_places]

❌ "Getting from A to B is easy! First walk to the metro station which takes about 5 minutes and costs nothing. Then take the purple line metro for 15 rupees which takes 20 minutes. Finally walk 3 minutes to your destination..."
✅ "Metro is your best bet at ₹25 - check the journey blocks below!" [after successful compare_transportation in Bengaluru]

❌ "I can show you directions but transportation cost comparison is only available in Bangalore. However, I can still show you the route on the map if you'd like. Would you prefer to see just the route or would you like more information about your options?"
✅ "It's about 10 km and takes 25 minutes by car." [after get_directions for non-Bengaluru trips]

Always be helpful and friendly, just keep it brief!`,
            voice: "alloy",
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
            tools: [
              {
                type: "function",
                name: "search_location",
                description: "Search for a location on the map by name or address. Use this whenever the user asks about finding a place, getting directions, or wants to see a specific location.",
                parameters: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "The location name or address to search for (e.g., 'Eiffel Tower', 'coffee shop near me', 'New York City')"
                    }
                  },
                  required: ["query"]
                }
              },
              {
                type: "function",
                name: "center_map",
                description: "Center the map on specific coordinates. Use this after finding a location to focus on it.",
                parameters: {
                  type: "object",
                  properties: {
                    latitude: {
                      type: "number",
                      description: "The latitude coordinate"
                    },
                    longitude: {
                      type: "number",
                      description: "The longitude coordinate"
                    },
                    zoom: {
                      type: "number",
                      description: "The zoom level (1-20, default 15)"
                    }
                  },
                  required: ["latitude", "longitude"]
                }
              },
              {
                type: "function",
                name: "add_marker",
                description: "Add a marker to the map at specific coordinates with an optional label.",
                parameters: {
                  type: "object",
                  properties: {
                    latitude: {
                      type: "number",
                      description: "The latitude coordinate"
                    },
                    longitude: {
                      type: "number",
                      description: "The longitude coordinate"
                    },
                    label: {
                      type: "string",
                      description: "Optional label for the marker"
                    }
                  },
                  required: ["latitude", "longitude"]
                }
              },
              {
                type: "function",
                name: "get_directions",
                description: "Get directions and show the route between two locations. Use this when users ask about routes, directions, or how to get from one place to another.",
                parameters: {
                  type: "object",
                  properties: {
                    origin: {
                      type: "string",
                      description: "The starting location (can be an address, place name, or coordinates)"
                    },
                    destination: {
                      type: "string",
                      description: "The destination location (can be an address, place name, or coordinates)"
                    }
                  },
                  required: ["origin", "destination"]
                }
              },
              {
                type: "function",
                name: "compare_transportation",
                description: "Compare all available transportation options (metro, bus, Uber, train) between two locations IN BENGALURU/BANGALORE ONLY with visual journey blocks showing each stage. Use this when BOTH locations are in Bengaluru and users ask about: travel costs, prices, cheapest option, how to get somewhere, or want to compare different ways to travel. For non-Bengaluru trips, use get_directions instead. Displays color-coded blocks showing Walk→Metro→Bus→Uber progression with fares and durations.",
                parameters: {
                  type: "object",
                  properties: {
                    origin: {
                      type: "string",
                      description: "The starting location (can be an address, place name, or coordinates)"
                    },
                    destination: {
                      type: "string",
                      description: "The destination location (can be an address, place name, or coordinates)"
                    }
                  },
                  required: ["origin", "destination"]
                }
              },
              {
                type: "function",
                name: "find_nearby_places",
                description: "Find nearby restaurants, shops, cafes, or other points of interest around a specific location. Use this when users ask to find nearby places, want restaurant recommendations, or are looking for shops/services in an area. Returns up to 20 places with ratings, addresses, and opening hours.",
                parameters: {
                  type: "object",
                  properties: {
                    latitude: {
                      type: "number",
                      description: "The latitude of the center point to search around"
                    },
                    longitude: {
                      type: "number",
                      description: "The longitude of the center point to search around"
                    },
                    type: {
                      type: "string",
                      description: "The type of place to search for. Common types: restaurant, cafe, bar, store, shopping_mall, grocery_or_supermarket, pharmacy, hospital, atm, bank, gas_station, park, gym, museum, tourist_attraction",
                      enum: ["restaurant", "cafe", "bar", "store", "shopping_mall", "grocery_or_supermarket", "pharmacy", "hospital", "atm", "bank", "gas_station", "park", "gym", "museum", "tourist_attraction"]
                    },
                    radius: {
                      type: "number",
                      description: "Search radius in meters (default: 1500, max: 50000). Use smaller radius (500-1000) for immediate area, larger (2000-5000) for broader search."
                    }
                  },
                  required: ["latitude", "longitude"]
                }
              }
            ],
            tool_choice: "auto"
          },
        }));
      });

      dc.addEventListener("message", async (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log("Event received:", event.type);

          if (event.type === "conversation.item.input_audio_transcription.completed") {
            console.log("User said:", event.transcript);
            onTranscript?.(event.transcript, true);
          } else if (event.type === "response.audio_transcript.delta") {
            // AI is speaking
            setIsSpeaking(true);
          } else if (event.type === "response.audio_transcript.done") {
            console.log("AI said:", event.transcript);
            onTranscript?.(event.transcript, false);
            setIsSpeaking(false);
          } else if (event.type === "response.function_call_arguments.done") {
            // AI wants to call a function
            const { call_id, name, arguments: argsString } = event;
            console.log(`Function call: ${name}`, argsString);
            
            try {
              const args = JSON.parse(argsString);
              let result: any = { success: false, error: "Unknown function" };

              // Execute the appropriate function
              if (name === "search_location" && onSearchLocation) {
                result = await onSearchLocation(args.query);
              } else if (name === "center_map" && onCenterMap) {
                onCenterMap(args.latitude, args.longitude, args.zoom);
                result = { success: true, message: "Map centered" };
              } else if (name === "add_marker" && onAddMarker) {
                onAddMarker(args.latitude, args.longitude, args.label);
                result = { success: true, message: "Marker added" };
              } else if (name === "get_directions" && onGetDirections) {
                result = await onGetDirections(args.origin, args.destination);
              } else if (name === "compare_transportation" && onCompareTransportation) {
                result = await onCompareTransportation(args.origin, args.destination);
              } else if (name === "find_nearby_places" && onFindNearbyPlaces) {
                result = await onFindNearbyPlaces(args.latitude, args.longitude, args.type, args.radius);
              }

              // Send function result back to AI
              dc.send(JSON.stringify({
                type: "conversation.item.create",
                item: {
                  type: "function_call_output",
                  call_id: call_id,
                  output: JSON.stringify(result)
                }
              }));

              // Tell AI to respond
              dc.send(JSON.stringify({
                type: "response.create"
              }));

              console.log("Function result sent:", result);
            } catch (error) {
              console.error("Function execution error:", error);
              // Send error back to AI
              dc.send(JSON.stringify({
                type: "conversation.item.create",
                item: {
                  type: "function_call_output",
                  call_id: call_id,
                  output: JSON.stringify({ success: false, error: String(error) })
                }
              }));

              // Tell AI to respond even after error so it remains responsive
              dc.send(JSON.stringify({
                type: "response.create"
              }));
            }
          } else if (event.type === "error") {
            console.error("Realtime API error:", event.error);
            toast({
              title: "Error",
              description: event.error.message || "An error occurred",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Failed to parse event:", error);
        }
      });

      // Handle incoming audio
      pc.addEventListener("track", (e) => {
        console.log("[Audio] Received remote track", e);
        const remoteStream = e.streams[0];
        
        if (audioElementRef.current) {
          console.log("[Audio] Setting srcObject to remote stream");
          audioElementRef.current.srcObject = remoteStream;
          audioElementRef.current.volume = 1.0;
          audioElementRef.current.muted = false;
          
          // Wait for the stream to be ready before playing
          audioElementRef.current.onloadedmetadata = () => {
            console.log("[Audio] Metadata loaded, attempting to play");
            audioElementRef.current!.play()
              .then(() => {
                console.log("[Audio] Audio playing successfully - you should hear sound now!");
              })
              .catch(err => {
                console.error("[Audio] Play failed:", err);
                toast({
                  title: "Audio playback blocked",
                  description: "Click anywhere on the page to enable audio",
                  variant: "destructive",
                });
              });
          };
          
          // Fallback: try playing immediately too
          audioElementRef.current.play()
            .then(() => console.log("[Audio] Immediate play succeeded"))
            .catch(() => console.log("[Audio] Immediate play blocked, waiting for metadata"));
        } else {
          console.error("[Audio] Audio element not found in DOM!");
        }
      });

      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to OpenAI with model query parameter
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!sdpResponse.ok) {
        throw new Error("Failed to connect to OpenAI");
      }

      const answerSdp = await sdpResponse.text();
      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: answerSdp,
      };
      await pc.setRemoteDescription(answer);

      setIsConnected(true);
      setIsConnecting(false);
      
      toast({
        title: "Connected",
        description: "Real-time conversation started. Start speaking!",
      });
    } catch (error) {
      console.error("Connection error:", error);
      setIsConnecting(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to start conversation";
      toast({
        title: "Connection failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopConversation = () => {
    // Stop local microphone tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
    }

    setIsConnected(false);
    setIsSpeaking(false);
    
    toast({
      title: "Disconnected",
      description: "Conversation ended",
    });
  };

  const handleToggle = () => {
    if (isConnected) {
      stopConversation();
    } else {
      startConversation();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      {/* Hidden audio element for playback */}
      <audio 
        ref={(el) => {
          if (el && !audioElementRef.current) {
            audioElementRef.current = el;
            console.log("[Audio] Audio element attached to DOM");
          }
        }}
        autoPlay
        playsInline
        style={{ display: 'none' }}
      />
      
      <div className="flex flex-col items-center gap-2">
        {isConnected && (
          <div className="text-xs text-cyan-400 font-medium px-4 py-2 bg-black/70 border border-cyan-500/30 rounded-full backdrop-blur-sm" data-testid="status-connected">
            {isSpeaking ? (
              <span className="flex items-center gap-2">
                <Volume2 className="w-3 h-3 animate-pulse" />
                AI Speaking...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Mic className="w-3 h-3" />
                Listening...
              </span>
            )}
          </div>
        )}
        
        <div className="relative group">
          <button
            onClick={handleToggle}
            disabled={isConnecting}
            data-testid="button-voice-toggle"
            className={`relative w-20 h-20 rounded-full transition-all duration-300 border-2 flex items-center justify-center ${
              isConnecting
                ? "bg-black/80 border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.6)] animate-pulse cursor-wait"
                : isConnected
                ? "bg-black/80 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] scale-105"
                : "bg-black/70 border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_45px_rgba(6,182,212,0.7)] hover:scale-105 hover:bg-black/85"
            }`}
          >
            {isConnected ? (
              <MicOff 
                className="w-8 h-8 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]"
              />
            ) : (
              <Mic 
                className={`transition-all duration-300 ${
                  isConnecting
                    ? "w-8 h-8 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.9)]"
                    : "w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,1)]"
                }`}
              />
            )}
          </button>
          
          {isConnected && isSpeaking && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.9)]" data-testid="indicator-speaking" />
          )}
        </div>
      </div>
    </div>
  );
}
