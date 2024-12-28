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
import { useSearchParams, Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const ChatContainer = () => {
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get('recipient');
  
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