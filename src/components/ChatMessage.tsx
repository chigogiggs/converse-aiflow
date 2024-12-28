import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageContextMenu } from "./chat/MessageContextMenu";
import { MessageAvatar } from "./chat/message/MessageAvatar";
import { SingleMessageContent } from "./chat/message/SingleMessageContent";
import { ReplyPreview } from "./chat/message/ReplyPreview";
import { Message } from "@/types/message.types";

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
  messageId
}: ChatMessageProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [senderProfile, setSenderProfile] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

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

  const toggleOriginal = () => {
    if (originalText) {
      setShowOriginal(!showOriginal);
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
          <SingleMessageContent
            message={message}
            originalText={originalText}
            isOutgoing={isOutgoing}
            isTranslating={isTranslating}
            onToggleOriginal={toggleOriginal}
            showOriginal={showOriginal}
          />
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