import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/ChatInput";
import { ChatHeader } from "@/components/ChatHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ChatSettings } from "./ChatSettings";
import { ChatSearch } from "./ChatSearch";
import { PinnedMessages } from "./PinnedMessages";
import { MessageList } from "./MessageList";
import { useMessages } from "@/hooks/useMessages";
import { useSearchParams } from "react-router-dom";

export const ChatContainer = () => {
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get('recipient');
  
  if (!recipientId) {
    return <div className="p-4">No recipient selected</div>;
  }

  const { messages, sendMessage } = useMessages(recipientId);
  const [isTyping, setIsTyping] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([]);
  const [outgoingLanguage, setOutgoingLanguage] = useState("en");
  const [incomingLanguage, setIncomingLanguage] = useState("en");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTyping = async () => {
    await supabase.channel('typing_indicator')
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { language: outgoingLanguage }
      });
  };

  const handleSendMessage = (text: string) => {
    sendMessage(text, outgoingLanguage, incomingLanguage);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.32))] bg-white rounded-lg shadow-lg overflow-hidden">
      <ChatHeader
        recipientName="Chat"
        onSettingsClick={() => {}}
      />
      
      <div className="flex items-center gap-2 p-2 border-b">
        <ChatSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <ChatSettings
          outgoingLanguage={outgoingLanguage}
          incomingLanguage={incomingLanguage}
          setOutgoingLanguage={setOutgoingLanguage}
          setIncomingLanguage={setIncomingLanguage}
        />
      </div>

      <PinnedMessages messages={messages} pinnedMessages={pinnedMessages} />

      <MessageList
        messages={messages}
        searchQuery={searchQuery}
        showOriginal={showOriginal}
        isTyping={isTyping}
        outgoingLanguage={outgoingLanguage}
      />

      <div className="mt-auto border-t">
        <div className="flex justify-between items-center p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOriginal(!showOriginal)}
          >
            {showOriginal ? "Show Translated" : "Show Original"}
          </Button>
        </div>
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
};