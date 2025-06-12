import { useState } from "react";
import Header from "@/components/header";
import StreamContainer from "@/components/stream-container";
import ChatPanel from "@/components/chat-panel";
import VirtualTryOnModal from "@/components/modals/virtual-try-on-modal";
import ShareModal from "@/components/modals/share-modal";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <StreamContainer
                onChatToggle={() => setIsChatOpen(!isChatOpen)}
                onTryOnOpen={(snapshot) => {
                  setSelectedSnapshot(snapshot);
                  setIsTryOnModalOpen(true);
                }}
                onShareOpen={(snapshot) => {
                  setSelectedSnapshot(snapshot);
                  setIsShareModalOpen(true);
                }}
              />
            </div>
            
            <div className="lg:col-span-1 w-full">
              <ChatPanel />
            </div>
          </div>
        </div>
      </main>

      <VirtualTryOnModal 
        isOpen={isTryOnModalOpen}
        onClose={() => setIsTryOnModalOpen(false)}
        snapshot={selectedSnapshot}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        snapshot={selectedSnapshot}
      />
    </div>
  );
}
