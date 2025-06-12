import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, Share, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Snapshot } from "@shared/schema";

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: Snapshot | null;
}

export default function VirtualTryOnModal({ isOpen, onClose, snapshot }: VirtualTryOnModalProps) {
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);

  const tryOnMutation = useMutation({
    mutationFn: async (data: { userImageUrl: string; garmentImageUrl: string }) => {
      const response = await apiRequest('POST', '/api/virtual-tryon/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setTryOnResult(data.resultImageUrl);
    },
  });

  const handleTryOn = async () => {
    if (!snapshot) return;
    
    // For demo purposes, using a placeholder user image
    const userImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop";
    
    tryOnMutation.mutate({
      userImageUrl: userImageUrl,
      garmentImageUrl: snapshot.imageUrl
    });
  };

  const handleShare = () => {
    // TODO: Implement sharing to chat or social media
    console.log("Sharing try-on result");
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Downloading try-on result");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wand2 className="w-5 h-5 mr-2 text-apple-purple" />
            Virtual Try-On
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Outfit */}
          <div>
            <h3 className="font-medium mb-3">Selected Outfit</h3>
            {snapshot && (
              <div className="space-y-3">
                <img 
                  src={snapshot.imageUrl}
                  alt="Selected outfit"
                  className="w-full rounded-xl"
                />
                <div className="text-sm text-muted-foreground">
                  <p><strong>Model:</strong> {(snapshot.metadata as any)?.model || 'Unknown'}</p>
                  <p><strong>Designer:</strong> {(snapshot.metadata as any)?.designer || 'Unknown'}</p>
                  <p><strong>Captured:</strong> {snapshot.streamTime}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Try-On Result */}
          <div>
            <h3 className="font-medium mb-3">Your Try-On</h3>
            <div className="w-full h-64 bg-muted rounded-xl flex items-center justify-center">
              {tryOnMutation.isPending ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-apple-purple mb-2 mx-auto" />
                  <p className="text-sm text-muted-foreground">Processing virtual try-on...</p>
                </div>
              ) : tryOnResult ? (
                <img 
                  src={tryOnResult}
                  alt="Try-on result"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-center">
                  <Wand2 className="w-8 h-8 text-apple-purple mb-2 mx-auto" />
                  <p className="text-sm text-muted-foreground">Click "Try On" to see the magic!</p>
                </div>
              )}
            </div>
            
            {tryOnResult && (
              <div className="flex space-x-2 mt-4">
                <Button
                  onClick={handleShare}
                  className="flex-1 apple-button-blue"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={handleDownload}
                  className="flex-1 apple-button-green"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!tryOnResult && (
            <Button
              onClick={handleTryOn}
              disabled={!snapshot || tryOnMutation.isPending}
              className="apple-button-purple"
            >
              {tryOnMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Try On
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
