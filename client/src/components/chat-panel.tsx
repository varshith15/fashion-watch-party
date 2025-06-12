import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebSocket } from "@/hooks/use-websocket";
import { Send, Users, Camera, Shirt } from "lucide-react";
import type { ChatMessage } from "@shared/schema";

export default function ChatPanel() {
  const [message, setMessage] = useState("");
  const [username] = useState("John Doe"); // In real app, get from auth
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages?roomId=main'],
  });

  const { sendMessage, lastMessage } = useWebSocket('/ws');

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'chat') {
      console.log("Received WebSocket message:", lastMessage);
      queryClient.setQueryData(['/api/chat/messages?roomId=main'], (oldData: ChatMessage[] = []) => {
        console.log("Old chat data:", oldData);
        const newData = [...oldData, lastMessage.data];
        console.log("New chat data after update:", newData);
        return newData;
      });
    }
  }, [lastMessage, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessage({
      type: 'chat',
      username,
      contentType: 'text',
      content: message.trim(),
      roomId: 'main'
    });

    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-xl h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-xl h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center">
            <Users className="w-4 h-4 mr-2 text-apple-blue" />
            Watch Party
          </h3>
        </div>
      </div>
      
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="chat-message">
              <div className="w-8 h-8 bg-gradient-to-br from-apple-blue to-apple-orange rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-medium">
                  {getInitials(msg.username)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium">{msg.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                
                {msg.contentType === 'text' && (
                  <p className="text-sm text-foreground">{msg.content}</p>
                )}
                
                {msg.contentType === 'snapshot' && msg.payload && (
                  <div className="bg-muted rounded-lg p-2 mt-2">
                    <img 
                      src={msg.payload.imageUrl}
                      alt="Shared snapshot"
                      className="w-full h-20 object-cover rounded"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {msg.payload.model} • {msg.payload.designer}
                    </p>
                  </div>
                )}
                
                {msg.contentType === 'try-on' && msg.payload && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mt-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shirt className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        Virtual Try-On Result
                      </span>
                    </div>
                    <img 
                      src={msg.payload.resultUrl}
                      alt="Try-on result"
                      className="w-full h-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Chat Input */}
      <div className="p-4 border-t border-border relative z-10">
        <div className="flex items-center space-x-2">
          <Input
            key="chat-input"
            type="text"
            placeholder="Share your thoughts..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            readOnly={false}
            disabled={false}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="icon"
            className="apple-button-blue"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center space-x-4 mt-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-apple-blue"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-apple-purple"
          >
            <Shirt className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
