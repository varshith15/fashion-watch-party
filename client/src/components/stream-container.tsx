import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery } from "@tanstack/react-query";
import FloatingControls from "./floating-controls";
import ModelOverlay from "./model-overlay";
import SnapshotGallery from "./snapshot-gallery";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Maximize } from "lucide-react";
import designersData from '@/data/designers.json';

interface StreamContainerProps {
  onChatToggle: () => void;
  onTryOnOpen: (snapshot: any) => void;
  onShareOpen: (snapshot: any) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function StreamContainer({ onChatToggle, onTryOnOpen, onShareOpen }: StreamContainerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const { sendMessage } = useWebSocket('/ws');
  const [currentTime, setCurrentTime] = useState("02:34");
  const [duration] = useState("08:42");
  const [showControls, setShowControls] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null); // To store the YouTube Player instance
  const videoContainerRef = useRef<HTMLDivElement>(null); // For fullscreen

  useEffect(() => {
    // Load YouTube IFrame Player API script
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      if (iframeRef.current) {
        playerRef.current = new window.YT.Player(iframeRef.current, {
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const onPlayerReady = (event: any) => {
    // Autoplay is handled by iframe src. We can use this for other initializations if needed.
  };

  const onPlayerStateChange = (event: any) => {
    // Update isPlaying state based on player state
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFullScreen = () => {
    if (videoContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      }
    }
  };

  const handleGenerateClip = async () => {
    try {
      // For now, simulate clip generation
      // In a real application, this would involve sending video segment data to a backend service for processing
      console.log("Attempting to generate clip...");
      const response = await fetch('/api/clip/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // In a real scenario, you'd send current stream time, duration, etc.
          streamTime: currentTime,
          duration: "15s", // Example clip duration
          modelName: currentModel.name,
          designerName: currentDesigner.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Clip generated:", data.clipUrl);
        // Optionally, display a toast or add the clip to a gallery
        alert(`Clip Generated! URL: ${data.clipUrl}`);
      } else {
        console.error("Failed to generate clip:", response.statusText);
        alert("Failed to generate clip.");
      }
    } catch (error) {
      console.error("Error generating clip:", error);
      alert("Error generating clip.");
    }
  };

  // Dynamic model and designer data with AI insights
  const [currentModel, setCurrentModel] = useState({
    name: "Sophia Chen",
    agency: "Elite Model Management",
    stats: "Milan Fashion Week veteran • 127 shows",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    id: 1 // Initial ID for Sophia Chen
  });

  const [currentDesigner, setCurrentDesigner] = useState(() => {
    const randomIndex = Math.floor(Math.random() * designersData.length);
    const initialDesigner = designersData[randomIndex];
    return {
      name: initialDesigner.name,
      collection: initialDesigner.collection,
      description: initialDesigner.description,
      id: initialDesigner.id,
    };
  });

  const [triviaFact, setTriviaFact] = useState(
    "This Versace piece features hand-embroidered Italian lace, taking over 200 hours to complete. The silhouette pays homage to 1960s couture."
  );

  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  // Auto-generate trivia every 10 seconds to simulate real-time AI insights
  useEffect(() => {
    if (!isPlaying) return; // Only run if stream is playing

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/ai/analyze-frame', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop" 
          })
        });

        if (response.ok) {
          const data = await response.json();
          setTriviaFact(data.trivia);
          setLastAnalysis(data.analysis);
          setCurrentDesigner({
            name: data.analysis.designerName || "Unknown Designer",
            collection: data.analysis.collection || "Unknown Collection",
            description: data.analysis.description || "No description available.",
            id: data.analysis.designerId || 0 // Add designer ID
          });
          setCurrentModel({
            name: data.analysis.modelName || "Unknown Model",
            agency: currentModel.agency, // Keep hardcoded or fetch from backend if available
            stats: currentModel.stats,   // Keep hardcoded or fetch from backend if available
            profileImage: data.analysis.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", // Default image
            id: data.analysis.modelId || 0 // Add model ID
          });
        }
      } catch (error) {
        console.log("Trivia update failed:", error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleCapture = async () => {
    try {
      // Capture frame from video (simulated for now)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // For demo purposes, we'll use a fashion runway image
      // In production, this would capture the actual video frame
      const capturedImageUrl = `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1515372039744-b8f02a3ae446' : '1469334031218-e382a71b716b'}/?w=800&h=600&fit=crop`;
      
      const snapshotData = {
        imageUrl: capturedImageUrl,
        timestamp: new Date().toISOString(),
        streamTime: currentTime,
        modelName: currentModel.name,
        designerName: currentDesigner.name,
        modelId: currentModel.id,
        designerId: currentDesigner.id
      };

      // Send to backend for AI analysis and storage
      const response = await fetch('/api/snapshots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snapshotData)
      });

      if (response.ok) {
        const snapshot = await response.json();
        console.log("Snapshot captured and analyzed:", snapshot);
        
        // Trigger AI analysis for updated trivia
        const analysisResponse = await fetch('/api/ai/analyze-frame', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: capturedImageUrl })
        });

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          setLastAnalysis(analysisData.analysis);
          setTriviaFact(analysisData.trivia);
        }
      }
    } catch (error) {
      console.error("Failed to capture snapshot:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
        {/* Stream Video Area */}
        <div 
          ref={videoContainerRef}
          className="aspect-video relative cursor-pointer"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <iframe
            ref={iframeRef}
            src="https://www.youtube.com/embed/IfWYDcVfBVo?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&fs=0&disablekb=1&enablejsapi=1"
            className="w-full h-full"
            allow="autoplay; encrypted-media; fullscreen"
            title="Fashion Runway Stream"
          />
          
          {/* Model Information Overlay */}
          <ModelOverlay 
            model={currentModel}
            triviaFact={triviaFact}
          />
          
          {/* Designer Information Overlay */}
          <div className="absolute top-24 right-4 fade-in">
            <div className="overlay-card">
              <div className="text-center">
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {currentDesigner.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {currentDesigner.collection}
                </p>
                <p className="text-xs text-foreground">
                  {currentDesigner.description}
                </p>
              </div>
            </div>
          </div>

          {/* Floating Controls */}
          <FloatingControls 
            onCapture={handleCapture}
            onTryOn={() => onTryOnOpen(null)}
            onShare={() => onShareOpen(null)}
            onChatToggle={onChatToggle}
            onGenerateClip={handleGenerateClip}
          />

          {/* Quick Share to Chat Button */}
          <div className="absolute bottom-20 right-6">
            <button
              onClick={() => {
                const imageUrl = `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1515372039744-b8f02a3ae446' : '1469334031218-e382a71b716b'}/?w=400&h=300&fit=crop`;
                
                // Share directly to chat using existing WebSocket connection
                sendMessage({
                  type: 'chat',
                  username: 'You',
                  contentType: 'snapshot',
                  content: 'Shared a runway moment',
                  roomId: 'main',
                  payload: {
                    imageUrl,
                    model: currentModel.name,
                    designer: currentDesigner.name,
                    timestamp: new Date().toISOString()
                  }
                });
              }}
              className="floating-button bg-apple-green hover:bg-apple-green/90 shadow-lg"
              title="Share to Chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>

          {/* Video Controls Overlay */}
          {showControls && (
            <div className="absolute bottom-6 left-6 right-6 glassmorphism rounded-xl p-4 transition-opacity duration-300">
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handlePlayPause}
                  className="rounded-full shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <div className="flex-1">
                  <div className="w-full h-1 bg-muted rounded-full">
                    <div className="w-1/3 h-full bg-apple-blue rounded-full"></div>
                  </div>
                </div>
                
                <div className="text-sm font-medium text-foreground">
                  <span>{currentTime}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span>{duration}</span>
                </div>
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full shadow-lg"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleFullScreen}
                  className="rounded-full shadow-lg"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Stream Info Bar */}
        <div className="bg-black/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold">
                Milan Fashion Week 2024 - Versace Collection
              </h2>
              <p className="text-gray-300 text-sm">
                Live from Milan • Spring/Summer 2024
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white text-sm font-medium">Versace</div>
                <div className="text-gray-400 text-xs">Designer</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SnapshotGallery 
        onTryOn={onTryOnOpen}
        onShare={onShareOpen}
      />
    </div>
  );
}
