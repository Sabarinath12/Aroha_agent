import { MapPin, Mic, Brain, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
          <button 
            onClick={() => setLocation('/')}
            className="flex items-center gap-3 hover-elevate rounded-lg px-2 py-1"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-cyan-500/30">
              <MapPin className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-xl font-bold text-white">Aroha</span>
          </button>
          <div className="flex gap-4">
            <Button
              onClick={() => setLocation('/')}
              variant="ghost"
              className="text-gray-300 hover:text-white border border-blue-500/20 bg-gray-900/20 hover:bg-gray-900/40 hover:border-blue-500/30"
              data-testid="button-home"
            >
              Home
            </Button>
            <Button
              onClick={() => setLocation('/login')}
              variant="ghost"
              className="text-gray-300 hover:text-white border border-blue-500/20 bg-gray-900/20 hover:bg-gray-900/40 hover:border-blue-500/30"
              data-testid="button-login-about"
            >
              Sign In
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-20">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Aroha</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Your intelligent travel companion, making navigation in unfamiliar places effortless and stress-free through natural voice conversations.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="mb-20 p-10 rounded-2xl bg-gray-900/20 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-300 leading-relaxed text-center max-w-4xl mx-auto">
              We believe traveling to new places should be exciting, not anxiety-inducing. Aroha was created to be your trusted companion—someone who understands your concerns, speaks your language, and helps you navigate confidently wherever you go. No complex apps, no confusing interfaces—just natural conversation.
            </p>
          </div>

          {/* What Makes Aroha Special */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">What Makes Aroha Special</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10">
                <div className="w-14 h-14 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                  <Mic className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Natural Voice Interface</h3>
                <p className="text-gray-400 leading-relaxed">
                  Powered by OpenAI's latest technology, Aroha understands natural speech and responds in real-time. Talk to Aroha like you would a local friend—ask questions, get recommendations, and navigate with ease.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10">
                <div className="w-14 h-14 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                  <Brain className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Intelligent Journey Planning</h3>
                <p className="text-gray-400 leading-relaxed">
                  Get personalized multi-stage journey options tailored to Bengaluru. Aroha compares Metro, buses, and ride-hailing services with accurate fare estimates, helping you choose the best option for your budget and time.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10">
                <div className="w-14 h-14 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <Globe className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Real-Time Place Discovery</h3>
                <p className="text-gray-400 leading-relaxed">
                  Discover restaurants, hotels, and attractions with detailed information including ratings, photos, opening hours, and user reviews—all presented in an easy-to-understand format.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-gray-900/20 border border-blue-500/20 hover-elevate shadow-lg shadow-blue-500/10">
                <div className="w-14 h-14 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Zero Learning Curve</h3>
                <p className="text-gray-400 leading-relaxed">
                  No tutorials, no manuals, no complex menus. If you can have a conversation, you can use Aroha. Simply speak, and Aroha responds instantly with exactly what you need.
                </p>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Built with Cutting-Edge Technology</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500/30 flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
                <h4 className="text-xl font-semibold text-white">OpenAI Realtime API</h4>
                <p className="text-gray-400">
                  Advanced voice AI with natural language understanding and real-time conversation capabilities
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500/30 flex items-center justify-center mx-auto">
                  <Globe className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-xl font-semibold text-white">Google Maps Platform</h4>
                <p className="text-gray-400">
                  Accurate mapping, directions, and place data powered by the world's most reliable location service
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-xl font-semibold text-white">Real-Time Processing</h4>
                <p className="text-gray-400">
                  WebRTC technology ensures low-latency voice communication for instant, natural conversations
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-12 rounded-2xl bg-gray-900/20 border border-blue-500/20 text-center shadow-lg shadow-blue-500/10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Experience Aroha Today
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join travelers who've discovered stress-free navigation with Aroha
            </p>
            <Button
              size="lg"
              onClick={() => setLocation('/login')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 px-10 h-12 text-base font-semibold shadow-lg shadow-blue-500/20"
              data-testid="button-cta-about"
            >
              Get Started Free
            </Button>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-12 mt-20 border-t border-gray-800">
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-cyan-500/30">
                <MapPin className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-lg font-semibold text-gray-300">Aroha</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 Aroha. Powered by OpenAI & Google Maps.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
