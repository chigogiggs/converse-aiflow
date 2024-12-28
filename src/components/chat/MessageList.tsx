import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/ChatMessage";
import { Smile } from "lucide-react";
import { type Message } from "@/hooks/useMessages";

interface MessageListProps {
  messages: Message[];
  searchQuery: string;
  showOriginal: boolean;
  isTyping: boolean;
  outgoingLanguage: string;
}

export const MessageList = ({
  messages,
  searchQuery,
  showOriginal,
  isTyping,
  outgoingLanguage
}: MessageListProps) => {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages
          .filter(message =>
            message.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (message.originalText?.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((message) => (
            <div key={message.id} className="group relative">
              <ChatMessage
                message={showOriginal && message.originalText ? message.originalText : message.text}
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
  );
};