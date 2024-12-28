import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessageProps {
  message: string;
  isOutgoing: boolean;
  timestamp: string;
  isTranslating?: boolean;
  originalText?: string;
}

export const ChatMessage = ({ 
  message, 
  isOutgoing, 
  timestamp, 
  isTranslating,
  originalText
}: ChatMessageProps) => {
  const [showOriginal, setShowOriginal] = useState(false);

  const toggleOriginal = () => {
    if (originalText) {
      setShowOriginal(!showOriginal);
    }
  };

  return (
    <div
      className={cn(
        "flex w-full mt-2 space-x-3 max-w-md group",
        isOutgoing ? "ml-auto justify-end" : "justify-start"
      )}
    >
      <div>
        <motion.div
          className={cn(
            "relative p-3 rounded-lg cursor-pointer",
            isOutgoing
              ? "bg-indigo-600 text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          )}
          onClick={toggleOriginal}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={showOriginal ? 'original' : 'translated'}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-sm"
            >
              {showOriginal ? originalText : message}
            </motion.p>
          </AnimatePresence>
          {isTranslating && (
            <span className="text-xs opacity-70">Translating...</span>
          )}
        </motion.div>
        <span className="text-xs text-gray-500 leading-none">{timestamp}</span>
      </div>
    </div>
  );
};