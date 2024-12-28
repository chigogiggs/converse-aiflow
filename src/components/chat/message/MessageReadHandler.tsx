import { useEffect } from "react";
import { Message } from "@/types/message.types";
import { supabase } from "@/integrations/supabase/client";

interface MessageReadHandlerProps {
  messages: Message[];
}

export const MessageReadHandler = ({ messages }: MessageReadHandlerProps) => {
  useEffect(() => {
    const markMessagesAsRead = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const unreadMessageIds = messages
        .filter(msg => !msg.isOutgoing && !msg.read)
        .map(msg => msg.id);

      if (unreadMessageIds.length === 0) return;

      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', unreadMessageIds)
        .eq('recipient_id', user.id);

      if (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markMessagesAsRead();
  }, [messages]);

  return null;
};