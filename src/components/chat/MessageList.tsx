import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { Smile } from "lucide-react";
import { Message } from "@/types/message.types";
import { useMessages } from "@/hooks/useMessages";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { MessageSearch } from "./message/MessageSearch";
import { MessageContent } from "./message/MessageContent";

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
  const lastScrollTop = useRef(0);

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
          sender:profiles!messages_sender_id_fkey (
            display_name
          )
        `)
        .in('id', repliedIds);

      if (data) {
        const repliesMap = data.reduce((acc: Record<string, any>, msg) => {
          acc[msg.id] = {
            text: msg.content,
            senderName: msg.sender?.display_name
          };
          return acc;
        }, {});
        setRepliedMessages(repliesMap);
      }
    };

    fetchRepliedMessages();
  }, [messages]);

  const handleScroll = (e: any) => {
    const currentScrollTop = e.target.scrollTop;
    setShowSearch(currentScrollTop < lastScrollTop.current);
    lastScrollTop.current = currentScrollTop;
  };

  return (
    <div className="relative flex-1 h-[calc(100vh-16rem)] bg-gray-900">
      <AnimatePresence>
        {showSearch && (
          <MessageSearch 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
      </AnimatePresence>
      
      <ScrollArea 
        className="h-full px-4 py-2" 
        onScrollCapture={handleScroll}
        ref={scrollRef}
      >
        <MessageContent 
          messages={messages}
          searchQuery={searchQuery}
          isTyping={isTyping}
          outgoingLanguage={outgoingLanguage}
          repliedMessages={repliedMessages}
          onReply={onReply}
        />
      </ScrollArea>
    </div>
  );
};