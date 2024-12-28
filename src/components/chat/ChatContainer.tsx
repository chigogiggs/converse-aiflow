import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/ChatInput";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatSettings } from "./ChatSettings";
import { PinnedMessages } from "./PinnedMessages";
import { MessageList } from "./MessageList";
import { useMessages } from "@/hooks/useMessages";
import { useParams, Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ChatContainer = () => {
  const { recipient: recipientId } = useParams();
  
  // Use useQuery to fetch recipient profile
  const { data: recipientProfile } = useQuery({
    queryKey: ['profile', recipientId],
    queryFn: async () => {
      if (!recipientId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', recipientId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId
  });
  
  if (!recipientId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No recipient selected</AlertTitle>
          <AlertDescription>
            Please select a contact from your connections list to start a chat.
          </AlertDescription>
        </Alert>
        <Link to="/connections">
          <Button variant="default">
            Go to Connections
          </Button>
        </Link>
      </div>
    );
  }

  const { messages, sendMessage } = useMessages(recipientId);
  const [isTyping, setIsTyping] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([]);
  const [outgoingLanguage, setOutgoingLanguage] = useState("en");
  const [incomingLanguage, setIncomingLanguage] = useState("en");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTyping = async () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  const handleSendMessage = (text: string) => {
    sendMessage(text, outgoingLanguage, incomingLanguage);
  };

  const handleTranslateAll = () => {
    // Implementation for translating all messages
    // This would trigger a re-render of messages with translations
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.32))] bg-white rounded-lg shadow-lg overflow-hidden">
      <ChatHeader
        recipientName={recipientProfile?.display_name || "Chat"}
        recipientAvatar={recipientProfile?.avatar_url}
      />
      
      <PinnedMessages messages={messages} pinnedMessages={pinnedMessages} />

      <MessageList
        messages={messages}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isTyping={isTyping}
        outgoingLanguage={outgoingLanguage}
        onTranslateAll={handleTranslateAll}
      />

      <div className="mt-auto border-t">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
};