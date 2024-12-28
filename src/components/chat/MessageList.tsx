import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { Smile } from "lucide-react";
import { Message } from "@/types/message.types";
import { useMessages } from "@/hooks/useMessages";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface MessageListProps {
  messages: Message[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isTyping: boolean;
  outgoingLanguage?: string;
  onTranslateAll?: () => void;
  recipientId: string;
  onReply: (message: Message) => void;
  replyingTo: Message | null;
}

export const MessageList = ({
  messages,
  searchQuery,
  setSearchQuery,
  isTyping,
  outgoingLanguage = 'en',
  onTranslateAll,
  recipientId,
  onReply,
  replyingTo
}: MessageListProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const { updateMessagesLanguage } = useMessages(recipientId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [repliedMessages, setRepliedMessages] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadPreferredLanguage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', user.id)
        .single();

      if (profile?.preferred_language) {
        await updateMessagesLanguage(profile.preferred_language);
      }
    };

    loadPreferredLanguage();
  }, []);

  useEffect(() => {
    const fetchRepliedMessages = async () => {
      const repliedIds = messages
        .filter(msg => msg.replyToId)
        .map(msg => msg.replyToId);

      if (repliedIds.length === 0) return;

      const { data } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          profiles:sender_id (
            display_name
          )
        `)
        .in('id', repliedIds);

      if (data) {
        const repliesMap = data.reduce((acc: Record<string, any>, msg) => {
          acc[msg.id] = {
            text: msg.content,
            senderName: msg.profiles?.display_name
          };
          return acc;
        }, {});
        setRepliedMessages(repliesMap);
      }
    };

    fetchRepliedMessages();
  }, [messages]);

  useEffect(() => {
    const markMessagesAsRead = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('messages')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', recipientId)
        .eq('read', false);
    };

    markMessagesAsRead();
  }, [recipientId, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleScroll = (e: any) => {
    if (e.target.scrollTop > 100) {
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    // Message deletion is handled in the MessageContextMenu component
  };

  const handlePin = async (messageId: string) => {
    // Implement pin functionality
  };

  const handleStar = async (messageId: string) => {
    // Implement star functionality
  };

  return (
    <div className="relative flex-1 h-[calc(100vh-16rem)] bg-gray-900">
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-10 p-2 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700"
          >
            <div className="flex justify-between items-center gap-2">
              <input
                type="search"
                placeholder="Search messages..."
                className="w-full px-3 py-2 rounded-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ScrollArea 
        className="h-full px-4 py-2" 
        onScrollCapture={handleScroll}
        ref={scrollRef}
      >
        <motion.div 
          className="space-y-4 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="popLayout">
            {messages
              .filter(message =>
                !message.is_deleted &&
                (message.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (message.originalText?.toLowerCase().includes(searchQuery.toLowerCase())))
              )
              .map((message, index) => {
                const displayText = message.isOutgoing 
                  ? message.text 
                  : message.text;
                const originalText = message.isOutgoing 
                  ? message.translations?.[outgoingLanguage] 
                  : message.text;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ 
                      opacity: 0, 
                      x: message.isOutgoing ? 20 : -20,
                      scale: 0.9 
                    }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: 1 
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.9,
                      transition: { duration: 0.2 } 
                    }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.1 
                    }}
                    className="group relative"
                  >
                    <ChatMessage
                      messageId={message.id}
                      message={displayText}
                      isOutgoing={message.isOutgoing}
                      timestamp={message.timestamp}
                      isTranslating={message.isTranslating}
                      originalText={originalText}
                      senderId={message.isOutgoing ? undefined : message.senderId}
                      replyToMessage={message.replyToId ? repliedMessages[message.replyToId] : undefined}
                      onReply={() => onReply(message)}
                      onDelete={handleDelete}
                      onPin={handlePin}
                      onStar={handleStar}
                    />
                  </motion.div>
                );
              })}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-sm text-gray-400 italic flex items-center gap-2 p-2 bg-gray-800 rounded-lg"
            >
              <Smile className="h-4 w-4 animate-bounce text-indigo-400" />
              <span>Typing in {outgoingLanguage}...</span>
            </motion.div>
          )}
        </motion.div>
      </ScrollArea>
    </div>
  );
};
