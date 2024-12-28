import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { translateMessage } from "./useMessageTranslation";
import { saveMessage, updateUserPreferences } from "./useMessageStore";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Message {
  id: string;
  text: string;
  isOutgoing: boolean;
  timestamp: string;
  isTranslating?: boolean;
  originalText?: string;
  isPinned?: boolean;
  isEdited?: boolean;
  senderId?: string;
}

export const useMessages = (recipientId: string) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedMessages = data.map(msg => ({
          id: msg.id,
          text: msg.translated_content || msg.content,
          originalText: msg.translated_content ? msg.content : undefined,
          isOutgoing: msg.sender_id === user.id,
          timestamp: new Date(msg.created_at).toLocaleTimeString(),
          senderId: msg.sender_id
        }));

        setMessages(formattedMessages);
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    };

    fetchMessages();

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${recipientId}`,
        },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new;
            if (newMessage.sender_id !== user.id) {
              setMessages(prev => [...prev, {
                id: newMessage.id,
                text: newMessage.translated_content || newMessage.content,
                originalText: newMessage.translated_content ? newMessage.content : undefined,
                isOutgoing: newMessage.sender_id === user.id,
                timestamp: new Date(newMessage.created_at).toLocaleTimeString(),
                senderId: newMessage.sender_id
              }]);
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [recipientId, toast]);

  const sendMessage = async (text: string, outgoingLanguage: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isOutgoing: true,
      timestamp: new Date().toLocaleTimeString(),
      isTranslating: true,
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get recipient's preferred language from their profile
      const { data: recipientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', recipientId)
        .single();

      if (profileError) {
        console.error("Error fetching recipient profile:", profileError);
        throw new Error("Failed to get recipient's language preference");
      }

      const targetLanguage = recipientProfile.preferred_language;
      const { translatedText } = await translateMessage(text, recipientId);

      const savedMessage = await saveMessage(
        text,
        translatedText,
        outgoingLanguage,
        targetLanguage,
        user.id,
        recipientId
      );

      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { 
              ...msg, 
              id: savedMessage.id,
              text: translatedText,
              originalText: text,
              isTranslating: false 
            }
          : msg
      ));

    } catch (error: any) {
      console.error("Error sending message:", error);
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });

      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }
  };

  return {
    messages,
    setMessages,
    sendMessage
  };
};
