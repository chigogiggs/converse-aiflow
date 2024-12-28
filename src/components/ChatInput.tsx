import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { Mic, Send, Image as ImageIcon, Smile } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100"
              >
                <Smile className="h-5 w-5 text-gray-600" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 border-none" align="end">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="dark"
              />
            </PopoverContent>
          </Popover>
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
      </div>
    </form>
  );
};