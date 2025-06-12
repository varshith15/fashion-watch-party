import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Camera, Shirt, Share, MessageCircle, Film } from "lucide-react";

interface FloatingControlsProps {
  onCapture: () => void;
  onTryOn: () => void;
  onShare: () => void;
  onChatToggle: () => void;
  onGenerateClip: () => void;
}

export default function FloatingControls({ 
  onCapture, 
  onTryOn, 
  onShare, 
  onChatToggle,
  onGenerateClip
}: FloatingControlsProps) {
  return (
    <div className="absolute bottom-24 right-6 flex flex-col space-y-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onCapture}
            className="floating-button bg-white/20 hover:bg-white/30 backdrop-blur-sm"
          >
            <Camera className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Capture snapshot</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onTryOn}
            className="floating-button bg-apple-purple/80 hover:bg-apple-purple/90"
          >
            <Shirt className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Virtual try-on</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onShare}
            className="floating-button bg-apple-green/80 hover:bg-apple-green/90"
          >
            <Share className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Share snapshot</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onGenerateClip}
            className="floating-button bg-apple-blue/80 hover:bg-apple-blue/90"
          >
            <Film className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Generate Clip</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onChatToggle}
            className="floating-button bg-apple-orange/80 hover:bg-apple-orange/90 relative"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-apple-red rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Toggle chat</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
