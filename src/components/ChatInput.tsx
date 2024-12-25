import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { Mic, Send, Image as ImageIcon } from "lucide-react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
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
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={handleImageClick}
      >
        <ImageIcon className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={onVoiceMessage}
      >
        <Mic className="h-5 w-5" />
      </Button>
      <Textarea
        value={message}
        onChange={handleChange}
        placeholder="Type your message..."
        className="min-h-[80px] resize-none"
      />
      <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500">
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};