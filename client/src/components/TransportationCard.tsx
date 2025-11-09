import { Bus, Train, Car, MapPin, ArrowRight, Clock, IndianRupee } from "lucide-react";

interface TransportOption {
  mode: string;
  provider: string;
  fare: number;
  currency: string;
  duration?: number;
  distance?: number;
  description: string;
  details: string;
}

interface TransportationCardProps {
  options: TransportOption[];
  distance?: string;
  duration?: string;
  origin?: string;
  destination?: string;
}

export function TransportationCard({ options, distance, duration, origin, destination }: TransportationCardProps) {
  const getIcon = (mode: string) => {
    switch (mode) {
      case 'metro':
        return <Train className="w-5 h-5" />;
      case 'bus':
        return <Bus className="w-5 h-5" />;
      case 'train':
        return <Train className="w-5 h-5" />;
      case 'uber':
        return <Car className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'metro':
        return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
      case 'bus':
        return 'from-green-500/20 to-green-600/20 border-green-500/30';
      case 'train':
        return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      case 'uber':
        return 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  const getIconColor = (mode: string) => {
    switch (mode) {
      case 'metro':
        return 'text-purple-400';
      case 'bus':
        return 'text-green-400';
      case 'train':
        return 'text-blue-400';
      case 'uber':
        return 'text-cyan-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-3" data-testid="card-transportation-options">
      {/* Route Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-300 flex-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate font-medium">{origin || 'Origin'}</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
          <div className="flex items-center gap-1.5 text-xs text-gray-300 flex-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate font-medium">{destination || 'Destination'}</span>
          </div>
        </div>
      </div>

      {/* Distance & Duration Info */}
      {(distance || duration) && (
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {distance && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{distance}</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{duration}</span>
            </div>
          )}
        </div>
      )}

      {/* Transportation Options - Simple Card Blocks */}
      <div className="grid grid-cols-3 gap-2">
        {options.map((option, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${getModeColor(option.mode)} border rounded-lg p-3 hover-elevate transition-all text-center`}
            data-testid={`card-transport-option-${index}`}
          >
            <div className={`${getIconColor(option.mode)} flex justify-center mb-2`}>
              {getIcon(option.mode)}
            </div>
            <div className="font-semibold text-white text-xs mb-1 truncate">
              {option.provider}
            </div>
            <div className="flex items-center justify-center gap-1 text-cyan-400 font-bold text-base">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>{option.fare}</span>
            </div>
            {option.duration && (
              <div className="text-[10px] text-gray-500 mt-1">
                ~{option.duration}m
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-[10px] text-gray-500 text-center">
        * Estimated prices for Bengaluru
      </div>
    </div>
  );
}
