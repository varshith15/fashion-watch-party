import { Info } from "lucide-react";

interface ModelOverlayProps {
  model: {
    name: string;
    agency: string;
    stats: string;
    profileImage: string;
  };
  triviaFact: string;
}

export default function ModelOverlay({ model, triviaFact }: ModelOverlayProps) {
  return (
    <div className="absolute top-4 left-4 fade-in flex flex-col space-y-4">
      {/* Model Information Overlay */}
      <div className="overlay-card">
        <div className="flex items-start space-x-3">
          <img 
            src={model.profileImage}
            alt={model.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white"
          />
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              {model.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {model.agency}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {model.stats}
            </p>
          </div>
        </div>
      </div>

      {/* Trivia Overlay */}
      <div className="overlay-card max-w-xs">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-apple-blue mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm text-apple-blue mb-1">
              Designer Spotlight
            </h4>
            <p className="text-sm text-foreground">
              {triviaFact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
