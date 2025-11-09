import { MapPin, Mic, Map as MapIcon, Navigation, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="w-full p-6 flex justify-end items-center max-w-7xl mx-auto">
          <Button
            onClick={() => setLocation('/login')}
            variant="ghost"
            className="text-gray-300 hover:text-white border border-blue-500/20 bg-gray-900/20 hover:bg-gray-900/40 hover:border-blue-500/30"
            data-testid="button-login"
          >
            Sign In
          </Button>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8 mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-4 h-4" />
              <span>Voice-Powered Travel Assistant</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Aroha</span>
              <br />
              Your AI Travel Companion
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Have you ever felt anxious while traveling to a new place? We've got you covered! Meet our most advanced travel agent, Aroha!
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-8">
              <Button
                size="lg"
                onClick={() => setLocation('/login')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 px-8 h-12 text-base font-semibold shadow-lg shadow-blue-500/20"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation('/about')}
                className="border-blue-500/30 bg-gray-900/20 text-gray-300 hover:bg-gray-900/40 hover:text-white hover:border-blue-500/50 h-12 px-8 text-base shadow-lg shadow-blue-500/10"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-32">
            <div className="p-6 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Voice Conversations</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Talk naturally with Aroha using real-time voice. No typing needed—just speak and get instant responses.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Mic className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Smart Directions</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Get multi-stage journey plans with Metro, bus, and ride-hailing options, including accurate fare estimates.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <MapIcon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">Discover Places</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Find restaurants, hotels, and attractions nearby with ratings, photos, and real-time information.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases Section */}
          <div className="mt-20">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10">
                <h4 className="text-lg font-semibold text-white mb-2">New to a city?</h4>
                <p className="text-gray-400 text-sm">
                  Navigate the city like a local. Get instant directions, find the best routes, and discover hidden gems without feeling lost or overwhelmed.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10">
                <h4 className="text-lg font-semibold text-white mb-2">Daily Commuters</h4>
                <p className="text-gray-400 text-sm">
                  Find the fastest routes, compare transportation costs, and avoid traffic with real-time journey planning tailored to your schedule.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10">
                <h4 className="text-lg font-semibold text-white mb-2">Exploring & Dining</h4>
                <p className="text-gray-400 text-sm">
                  Discover top-rated restaurants, cafes, and tourist spots nearby. Get recommendations based on ratings, reviews, and your current location.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10">
                <h4 className="text-lg font-semibold text-white mb-2">Business Travelers</h4>
                <p className="text-gray-400 text-sm">
                  Quickly navigate between meetings, find nearby hotels, and get reliable transportation estimates without switching between multiple apps.
                </p>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="mt-20">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto">
                  <span className="text-3xl font-bold text-cyan-400">0</span>
                </div>
                <h4 className="text-xl font-semibold text-white">Zero Setup Required</h4>
                <p className="text-gray-400 text-sm">
                  No downloads, no configuration. Sign in and start talking to Aroha immediately.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto">
                  <span className="text-3xl font-bold text-cyan-400">24/7</span>
                </div>
                <h4 className="text-xl font-semibold text-white">Always Available</h4>
                <p className="text-gray-400 text-sm">
                  Your travel companion is ready whenever you need it, day or night.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto">
                  <span className="text-3xl font-bold text-cyan-400">∞</span>
                </div>
                <h4 className="text-xl font-semibold text-white">Unlimited Queries</h4>
                <p className="text-gray-400 text-sm">
                  Ask as many questions as you need. No limits, no restrictions.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-32 p-12 rounded-2xl bg-gray-900/20 border border-blue-500/20 text-center shadow-lg shadow-blue-500/10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Experience the future of travel navigation with Aroha
            </p>
            <Button
              size="lg"
              onClick={() => setLocation('/login')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 px-10 h-12 text-base font-semibold shadow-lg shadow-blue-500/20"
              data-testid="button-cta-start"
            >
              Get Started Free
            </Button>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-12 mt-20 border-t border-blue-500/10">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Aroha
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
