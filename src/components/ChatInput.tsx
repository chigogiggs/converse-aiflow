import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { Mic, Send, Image as ImageIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTyping?: () => void;
  onVoiceMessage?: () => void;
  onImageUpload?: (file: File) => void;
}

export const ChatInput = ({ 
  onSendMessage, 
  onTyping,
  onVoiceMessage,
  onImageUpload 
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

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 w-full bg-white p-4 rounded-lg shadow-sm">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100"
          onClick={handleImageClick}
        >
          <ImageIcon className="h-5 w-5 text-gray-600" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100"
          onClick={onVoiceMessage}
        >
          <Mic className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
      <Textarea
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        placeholder="Type your message..."
        className="flex-1 min-h-[50px] max-h-[150px] resize-none focus-visible:ring-1 focus-visible:ring-indigo-500 border-gray-200"
        enterKeyHint={isMobile ? "enter" : "send"}
      />
      <Button 
        type="submit" 
        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-4 py-2 flex items-center justify-center"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};