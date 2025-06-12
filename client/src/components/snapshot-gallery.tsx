import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Images, Shirt, Share } from "lucide-react";
import type { Snapshot } from "@shared/schema";

interface SnapshotGalleryProps {
  onTryOn: (snapshot: Snapshot) => void;
  onShare: (snapshot: Snapshot) => void;
}

export default function SnapshotGallery({ onTryOn, onShare }: SnapshotGalleryProps) {
  const { data: snapshots = [], isLoading } = useQuery<Snapshot[]>({
    queryKey: ['/api/snapshots?limit=8'],
  });

  const formatTime = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Images className="w-5 h-5 mr-2 text-apple-blue" />
          Recent Captures
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="snapshot-card animate-pulse">
              <div className="w-full h-32 bg-muted"></div>
              <CardContent className="p-3">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Images className="w-5 h-5 mr-2 text-apple-blue" />
        Recent Captures
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {snapshots.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Images className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No snapshots captured yet</p>
            <p className="text-sm text-muted-foreground">Start watching to see captured moments</p>
          </div>
        ) : (
          snapshots.map((snapshot) => (
            <Card key={snapshot.id} className="snapshot-card group">
              <div className="relative overflow-hidden">
                <img 
                  src={snapshot.imageUrl}
                  alt="Captured moment"
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              </div>
              
              <CardContent className="p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>{formatTime(snapshot.timestamp.toString())}</span>
                  <span>{snapshot.streamTime}</span>
                </div>
                
                <div className="text-sm font-medium mb-2 truncate">
                  {(snapshot.metadata as any)?.model || 'Unknown Model'}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onTryOn(snapshot)}
                      className="p-1 h-6 w-6 text-apple-purple hover:text-purple-600"
                    >
                      <Shirt className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onShare(snapshot)}
                      className="p-1 h-6 w-6 text-apple-green hover:text-green-600"
                    >
                      <Share className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {snapshot.shareCount || 0} shares
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
