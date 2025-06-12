import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Share, Copy, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Snapshot } from "@shared/schema";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: Snapshot | null;
}

export default function ShareModal({ isOpen, onClose, snapshot }: ShareModalProps) {
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const { toast } = useToast();

  // Generate hashtags when snapshot changes
  const hashtagQuery = useQuery({
    queryKey: ['hashtags', snapshot?.id],
    queryFn: async () => {
      if (!snapshot) return { hashtags: [] };
      
      const response = await apiRequest('POST', '/api/share/generate-hashtags', {
        modelName: snapshot.metadata?.model,
        designerName: snapshot.metadata?.designer,
        eventName: 'Milan Fashion Week 2024'
      });
      return response.json();
    },
    enabled: !!snapshot,
  });

  useEffect(() => {
    if (snapshot && hashtagQuery.data) {
      setHashtags(hashtagQuery.data.hashtags);
      setCaption(
        `Stunning look from ${snapshot.metadata?.designer || 'the runway'}! ✨ ` +
        `${snapshot.metadata?.model || 'Amazing model'} serving elegance on the runway.`
      );
    }
  }, [snapshot, hashtagQuery.data]);

  const shareToSocialMutation = useMutation({
    mutationFn: async (platform: string) => {
      // TODO: Implement actual social media sharing
      console.log(`Sharing to ${platform}:`, { caption, hashtags, snapshot });
      
      // Update share count
      if (snapshot) {
        await apiRequest('POST', `/api/snapshots/${snapshot.id}/share`);
      }
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Shared successfully!",
        description: "Your snapshot has been shared to social media.",
      });
      onClose();
    },
  });

  const copyLinkMutation = useMutation({
    mutationFn: async () => {
      const link = `${window.location.origin}/snapshot/${snapshot?.id}`;
      await navigator.clipboard.writeText(link);
      return link;
    },
    onSuccess: () => {
      toast({
        title: "Link copied!",
        description: "The snapshot link has been copied to your clipboard.",
      });
    },
  });

  const platforms = [
    { name: 'Instagram', icon: 'fab fa-instagram', color: 'text-pink-500' },
    { name: 'Twitter', icon: 'fab fa-twitter', color: 'text-blue-400' },
    { name: 'TikTok', icon: 'fab fa-tiktok', color: 'text-gray-900 dark:text-white' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Share className="w-5 h-5 mr-2 text-apple-green" />
            Share Moment
          </DialogTitle>
        </DialogHeader>
        
        {snapshot && (
          <div className="space-y-6">
            {/* Preview */}
            <div>
              <img 
                src={snapshot.imageUrl}
                alt="Fashion moment to share"
                className="w-full rounded-xl"
              />
            </div>
            
            {/* Caption */}
            <div>
              <label className="block text-sm font-medium mb-2">Caption</label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="resize-none"
                rows={3}
                placeholder="Write a caption for your share..."
              />
            </div>
            
            {/* Auto-generated Hashtags */}
            <div>
              <label className="block text-sm font-medium mb-2">Auto-Generated Hashtags</label>
              {hashtagQuery.isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Generating hashtags...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((hashtag, index) => (
                    <Badge key={index} variant="secondary" className="text-apple-blue">
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Choose Platform</label>
              <div className="grid grid-cols-3 gap-3">
                {platforms.map((platform) => (
                  <Button
                    key={platform.name}
                    variant="outline"
                    onClick={() => shareToSocialMutation.mutate(platform.name.toLowerCase())}
                    disabled={shareToSocialMutation.isPending}
                    className="flex flex-col items-center p-4 h-auto hover:border-apple-blue hover:bg-apple-blue/5"
                  >
                    <i className={`${platform.icon} text-2xl ${platform.color} mb-2`}></i>
                    <span className="text-sm">{platform.name}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => copyLinkMutation.mutate()}
                disabled={copyLinkMutation.isPending}
                className="flex-1"
              >
                {copyLinkMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                Copy Link
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
