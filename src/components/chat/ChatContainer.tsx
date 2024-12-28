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
import { Message } from "@/types/message.types";

export const ChatContainer = () => {
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get('recipient');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  if (!recipientId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-background text-foreground">
        <Alert variant="destructive" className="max-w-md mb-4 glass-morphism border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No recipient selected</AlertTitle>
          <AlertDescription>
            Please select a contact from your connections list to start a chat.
          </AlertDescription>
        </Alert>
        <Link to="/connections">
          <Button variant="default" className="bg-primary hover:bg-primary/90">
            Go to Connections
          </Button>
        </Link>
      </div>
    );
  }

  const { messages, sendMessage } = useMessages(recipientId);
  const [isTyping, setIsTyping] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTyping = async () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  const handleSendMessage = (text: string) => {
    sendMessage(text);
  };

  const handleTranslateAll = () => {
    // Implementation for translating all messages
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="flex-1 overflow-hidden">
        <PinnedMessages messages={messages} pinnedMessages={pinnedMessages} />

        <MessageList
          messages={messages}
          isTyping={isTyping}
          onTranslateAll={handleTranslateAll}
          recipientId={recipientId}
          onReply={handleReply}
          replyingTo={replyingTo}
        />
      </div>

      <div className="sticky bottom-0 border-t border-border/10 bg-background/95 backdrop-blur-lg p-4">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
};