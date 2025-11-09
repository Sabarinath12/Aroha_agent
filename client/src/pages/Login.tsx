import { useEffect } from "react";
import { useReplitAuth } from "@/lib/replitAuth";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { SiGoogle, SiGithub, SiX, SiApple } from "react-icons/si";
import { Mail } from "lucide-react";

export default function Login() {
  const { user, loading, login } = useReplitAuth();

  useEffect(() => {
    // Check if we just came from logout (don't auto-redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const fromLogout = urlParams.has('from_logout');
    
    if (user && !fromLogout) {
      window.location.href = "/app";
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-lg p-8 shadow-2xl">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/20 mb-4">
              <MapPin className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Sign in to continue your journey with Aroha</p>
          </div>

          {/* Login Section */}
          <div className="space-y-4">
            <Button
              onClick={login}
              className="w-full h-12 bg-cyan-500 hover:bg-cyan-600 text-white font-medium"
              data-testid="button-login-replit"
            >
              Continue with Replit
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-gray-900/50 text-gray-500">Available login methods</span>
              </div>
            </div>

            {/* Login Methods Display */}
            <div className="grid grid-cols-5 gap-2">
              <div className="flex flex-col items-center gap-2 p-3 rounded-md bg-gray-800/30 border border-gray-700/50">
                <SiGoogle className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-500">Google</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-md bg-gray-800/30 border border-gray-700/50">
                <SiGithub className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-500">GitHub</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-md bg-gray-800/30 border border-gray-700/50">
                <SiX className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-500">X</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-md bg-gray-800/30 border border-gray-700/50">
                <SiApple className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-500">Apple</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-md bg-gray-800/30 border border-gray-700/50">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-500">Email</span>
              </div>
            </div>

            <p className="text-xs text-center text-gray-500 mt-4">
              Secure authentication powered by Replit
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <a href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium" data-testid="link-signup">
                Sign up
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          By continuing, you agree to Aroha's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
