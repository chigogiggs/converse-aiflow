import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { Send, Image, Mic } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatInputActions } from "./chat/input/ChatInputActions";
import { EmojiPicker } from "./chat/input/EmojiPicker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string, type?: 'text' | 'image' | 'voice', mediaUrl?: string) => void;
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
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      const input = document.querySelector('textarea');
      if (input) {
        input.setAttribute('enterkeyhint', 'send');
      }
    }
  }, [isMobile]);

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('chat-media')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      onSendMessage(file.name, 'image', publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        setAudioChunks(chunks => [...chunks, e.data]);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const filePath = `${user.id}/${crypto.randomUUID()}.webm`;
        
        const { data, error } = await supabase.storage
          .from('chat-media')
          .upload(filePath, audioBlob);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-media')
          .getPublicUrl(filePath);

        onSendMessage('Voice message', 'voice', publicUrl);
        setAudioChunks([]);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
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
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleImageClick}
            className="rounded-full"
          >
            <Image className="h-5 w-5 text-gray-600" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`rounded-full ${isRecording ? 'bg-red-100 text-red-600' : ''}`}
          >
            <Mic className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        <div className="relative flex-1">
          <Textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[50px] max-h-[150px] resize-none focus-visible:ring-1 focus-visible:ring-indigo-500 border-gray-200 pr-10"
            enterKeyHint={isMobile ? "send" : "enter"}
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