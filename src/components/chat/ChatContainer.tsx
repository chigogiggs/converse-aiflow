import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/ChatInput";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatSettings } from "./ChatSettings";
import { PinnedMessages } from "./PinnedMessages";
import { MessageList } from "./MessageList";
import { useMessages } from "@/hooks/useMessages";
import { useSearchParams, Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.32))] bg-white rounded-lg shadow-lg overflow-hidden">
      <ChatHeader recipientId={recipientId} />
      
      <PinnedMessages messages={messages} pinnedMessages={pinnedMessages} />

      <MessageList
        messages={messages}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isTyping={isTyping}
        outgoingLanguage={outgoingLanguage}
        onTranslateAll={handleTranslateAll}
        recipientId={recipientId}
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