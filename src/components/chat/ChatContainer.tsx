import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/ChatInput";
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
      <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-900 text-gray-100">
        <Alert variant="destructive" className="max-w-md mb-4 bg-red-900/50 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No recipient selected</AlertTitle>
          <AlertDescription>
            Please select a contact from your connections list to start a chat.
          </AlertDescription>
        </Alert>
        <Link to="/connections">
          <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700">
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
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      <div className="flex-1 overflow-hidden">
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
      </div>

      <div className="sticky bottom-0 border-t border-gray-800 bg-gray-900 p-4">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
};