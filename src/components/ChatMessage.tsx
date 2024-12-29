import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageContextMenu } from "./chat/MessageContextMenu";
import { MessageAvatar } from "./chat/message/MessageAvatar";
import { SingleMessageContent } from "./chat/message/SingleMessageContent";
import { ReplyPreview } from "./chat/message/ReplyPreview";
import { Message } from "@/types/message.types";
import { Play, Pause } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isOutgoing: boolean;
  timestamp: string;
  isTranslating?: boolean;
  originalText?: string;
  senderId?: string;
  replyToMessage?: {
    text: string;
    senderName: string;
  };
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onStar?: (messageId: string) => void;
  messageId: string;
  type?: 'text' | 'image' | 'voice';
  mediaContent?: string;
}

export const ChatMessage = ({ 
  message, 
  isOutgoing, 
  timestamp, 
  isTranslating,
  originalText,
  senderId,
  replyToMessage,
  onReply,
  onDelete,
  onPin,
  onStar,
  messageId,
  type = 'text',
  mediaContent
}: ChatMessageProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [senderProfile, setSenderProfile] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (senderId && !isOutgoing) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', senderId)
          .single();
        
        if (profile) {
          setSenderProfile(profile);
        }
      }

      if (isOutgoing) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setCurrentUserProfile(profile);
          }
        }
      }
    };

    fetchProfiles();
  }, [senderId, isOutgoing]);

  useEffect(() => {
    if (type === 'voice' && mediaContent) {
      const audioElement = new Audio(mediaContent);
      audioElement.onended = () => setIsPlaying(false);
      setAudio(audioElement);
    }
  }, [mediaContent, type]);

  const toggleOriginal = () => {
    if (originalText) {
      setShowOriginal(!showOriginal);
    }
  };

  const toggleAudio = () => {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <img 
            src={mediaContent} 
            alt={message}
            className="max-w-xs rounded-lg shadow-md hover:opacity-90 transition-opacity cursor-pointer"
            onClick={() => window.open(mediaContent, '_blank')}
          />
        );
      case 'voice':
        return (
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
            <button
              onClick={toggleAudio}
              className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <span className="text-sm text-gray-600">Voice message</span>
          </div>
        );
      default:
        return (
          <SingleMessageContent
            message={message}
            originalText={originalText}
            isOutgoing={isOutgoing}
            isTranslating={isTranslating}
            onToggleOriginal={toggleOriginal}
            showOriginal={showOriginal}
          />
        );
    }
  };

  return (
    <MessageContextMenu
      message={{
        id: messageId,
        text: message,
        isOutgoing,
        timestamp,
        senderId
      }}
      onReply={onReply || (() => {})}
      onDelete={onDelete || (() => {})}
      onPin={onPin || (() => {})}
      onStar={onStar || (() => {})}
    >
      <div
        className={cn(
          "flex w-full mt-2 space-x-3 max-w-md group",
          isOutgoing ? "ml-auto flex-row-reverse" : ""
        )}
      >
        <MessageAvatar
          avatarUrl={isOutgoing ? currentUserProfile?.avatar_url : senderProfile?.avatar_url}
          displayName={isOutgoing ? currentUserProfile?.display_name : senderProfile?.display_name}
          isOutgoing={isOutgoing}
        />
        <div className={cn("flex flex-col", isOutgoing ? "items-end" : "items-start")}>
          {replyToMessage && (
            <ReplyPreview
              senderName={replyToMessage.senderName}
              text={replyToMessage.text}
              isOutgoing={isOutgoing}
            />
          )}
          {renderContent()}
          <span className={cn(
            "text-xs text-white/70 leading-none mt-1 block",
            isOutgoing ? "text-right" : "text-left"
          )}>
            {timestamp}
          </span>
        </div>
      </div>
    </MessageContextMenu>
  );
};