import { Train, Bus, Car, MapPin, Footprints, ChevronRight } from "lucide-react";

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

interface JourneyProgressCardProps {
  journeys: TransportJourney[];
  origin?: string;
  destination?: string;
}

export function JourneyProgressCard({ journeys, origin, destination }: JourneyProgressCardProps) {
  const getIcon = (mode: string) => {
    switch (mode) {
      case 'metro':
        return <Train className="w-6 h-6" />;
      case 'bus':
        return <Bus className="w-6 h-6" />;
      case 'uber':
        return <Car className="w-6 h-6" />;
      case 'walk':
        return <Footprints className="w-6 h-6" />;
      case 'train':
        return <Train className="w-6 h-6" />;
      default:
        return <MapPin className="w-6 h-6" />;
    }
  };

  const getModeColor = (mode: string): { bg: string; border: string; text: string } => {
    switch (mode) {
      case 'metro':
        return { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-300' };
      case 'bus':
        return { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-300' };
      case 'uber':
        return { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-300' };
      case 'walk':
        return { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-300' };
      case 'train':
        return { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-300' };
      default:
        return { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-300' };
    }
  };

  return (
    <div className="space-y-4" data-testid="card-journey-progress">
      {/* Route Header */}
      {(origin || destination) && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium">{origin || 'Origin'}</span>
          <span>→</span>
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium">{destination || 'Destination'}</span>
        </div>
      )}

      {/* Journey Options - Horizontal Block Layout */}
      <div className="space-y-4">
        {journeys.map((journey, journeyIndex) => (
          <div
            key={journeyIndex}
            className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-5 hover-elevate transition-all"
            data-testid={`card-journey-${journeyIndex}`}
          >
            {/* Journey Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="font-semibold text-white text-base">{journey.journeyName}</h4>
                {journey.recommendation && (
                  <p className="text-xs text-gray-400 mt-1">{journey.recommendation}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-cyan-400 font-bold text-xl">₹{journey.totalFare}</div>
                {journey.totalDuration && (
                  <div className="text-xs text-gray-500">~{journey.totalDuration} mins</div>
                )}
              </div>
            </div>

            {/* Horizontal Block Timeline */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-0 min-w-max">
                {journey.stages.map((stage, stageIndex) => {
                  const isLast = stageIndex === journey.stages.length - 1;
                  const colors = getModeColor(stage.mode);
                  
                  return (
                    <div key={stageIndex} className="flex items-center">
                      {/* Stage Block */}
                      <div className="flex flex-col items-center">
                        {/* Icon Block */}
                        <div 
                          className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center ${colors.bg} ${colors.border} ${colors.text} transition-all hover:scale-105`}
                        >
                          {getIcon(stage.mode)}
                        </div>
                        
                        {/* Stage Details */}
                        <div className="mt-3 text-center min-w-[140px] max-w-[140px]">
                          <div className="font-semibold text-white text-sm mb-1">
                            {stage.stage}
                          </div>
                          {stage.provider && (
                            <div className="text-[10px] text-gray-400 mb-1">
                              {stage.provider}
                            </div>
                          )}
                          <div className={`font-bold text-sm ${colors.text}`}>
                            {stage.fare > 0 ? `₹${stage.fare}` : 'Free'}
                          </div>
                          {stage.duration && (
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              ~{stage.duration} min
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Arrow Connector */}
                      {!isLast && (
                        <div className="flex items-center mx-3 mb-16">
                          <ChevronRight className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
