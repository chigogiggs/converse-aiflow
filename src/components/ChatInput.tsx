import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatInputActions } from "./chat/input/ChatInputActions";
import { EmojiPicker } from "./chat/input/EmojiPicker";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTyping?: () => void;
  onVoiceMessage?: () => void;
  onImageUpload?: (file: File) => void;
  replyingTo?: {
    id: string;
    text: string;
    senderName: string;
  } | null;
  onCancelReply?: () => void;
}

export const ChatInput = ({ 
  onSendMessage, 
  onTyping,
  onVoiceMessage,
  onImageUpload,
  replyingTo,
  onCancelReply
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message);
        setMessage("");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (onTyping) {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      onTyping();
      setTypingTimeout(setTimeout(() => {
        setTypingTimeout(null);
      }, 1000));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full max-w-6xl mx-auto bg-white p-4 rounded-lg shadow-sm">
      {replyingTo && (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Replying to {replyingTo.senderName}</span>
            <span className="text-xs text-gray-500 truncate">{replyingTo.text}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelReply}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <ChatInputActions
          onImageClick={handleImageClick}
          onVoiceMessage={onVoiceMessage}
        />
        <div className="relative flex-1">
          <Textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[50px] max-h-[150px] resize-none focus-visible:ring-1 focus-visible:ring-indigo-500 border-gray-200 pr-10"
            enterKeyHint={isMobile ? "enter" : "send"}
          />
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
        <Button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-4 py-2 flex items-center justify-center"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};