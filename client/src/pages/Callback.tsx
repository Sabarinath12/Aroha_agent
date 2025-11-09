import { useEffect } from "react";
import { useReplitAuth } from "@/lib/replitAuth";
import { Loader2, MapPin } from "lucide-react";

export default function Callback() {
  const { user, loading } = useReplitAuth();

  useEffect(() => {
    if (!loading && user) {
      window.location.href = "/app";
    }
  }, [loading, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/20 mb-4">
          <MapPin className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
        <p className="text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
}
