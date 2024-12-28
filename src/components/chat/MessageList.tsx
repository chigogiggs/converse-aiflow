import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { Smile, Languages } from "lucide-react";
import { type Message } from "@/hooks/useMessages";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";

interface MessageListProps {
  messages: Message[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isTyping: boolean;
  outgoingLanguage: string;
  onTranslateAll?: () => void;
  recipientId: string;
}

export const MessageList = ({
  messages,
  searchQuery,
  setSearchQuery,
  isTyping,
  outgoingLanguage,
  onTranslateAll,
  recipientId
}: MessageListProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [displayLanguage, setDisplayLanguage] = useState("en");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const markMessagesAsRead = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark all messages from this recipient as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', recipientId)
        .eq('read', false);
    };

    markMessagesAsRead();
  }, [recipientId, messages]);

  const handleScroll = (e: any) => {
    if (e.target.scrollTop > 100) {
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  };

  return (
    <div className="relative flex-1 mt-20">
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-10 p-2 bg-white/80 backdrop-blur-sm border-b"
          >
            <div className="flex justify-between items-center gap-2">
              <input
                type="search"
                placeholder="Search messages..."
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <LanguageSelector
                value={displayLanguage}
                onChange={setDisplayLanguage}
                label=""
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ScrollArea 
        className="h-full p-4" 
        onScrollCapture={handleScroll}
        ref={scrollRef}
      >
        <div className="space-y-4">
          {messages
            .filter(message =>
              message.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (message.originalText?.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map((message) => (
              <div key={message.id} className="group relative">
                <ChatMessage
                  message={message.text}
                  isOutgoing={message.isOutgoing}
                  timestamp={message.timestamp}
                  isTranslating={message.isTranslating}
                  originalText={message.originalText}
                />
              </div>
            ))}
          {isTyping && (
            <div className="text-sm text-gray-500 italic flex items-center gap-2">
              <Smile className="h-4 w-4 animate-bounce" />
              Typing in {outgoingLanguage}...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};