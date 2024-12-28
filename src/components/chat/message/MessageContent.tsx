import { Message } from "@/types/message.types";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/components/ChatMessage";
import { Smile } from "lucide-react";

interface MessageContentProps {
  messages: Message[];
  isTyping: boolean;
  outgoingLanguage: string;
  repliedMessages: Record<string, any>;
  onReply: (message: Message) => void;
}

export const MessageContent = ({
  messages = [],
  isTyping,
  outgoingLanguage,
  repliedMessages,
  onReply
}: MessageContentProps) => {
  if (!messages) return null;

  return (
    <motion.div 
      className="space-y-4 pb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => {
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
  );
};