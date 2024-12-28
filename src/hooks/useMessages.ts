import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Message, DatabaseMessage } from "@/types/message.types";
import { formatDatabaseMessage, getMessageLanguageContent } from "@/utils/messageUtils";

export const useMessages = (recipientId: string) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !recipientId) return;

        const { data: recipientProfile } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('id', recipientId)
          .single();

        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
          .order('created_at', { ascending: true })
          .limit(100);

        if (error) throw error;

        const formattedMessages = (data as DatabaseMessage[]).map(msg => 
          formatDatabaseMessage(msg, user.id, recipientProfile?.preferred_language)
        );

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

    if (recipientId) {
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
              const newMessage = payload.new as DatabaseMessage;
              const { data: recipientProfile } = await supabase
                .from('profiles')
                .select('preferred_language')
                .eq('id', recipientId)
                .single();

              if (newMessage.sender_id !== user.id) {
                setMessages(prev => [...prev, 
                  formatDatabaseMessage(newMessage, user.id, recipientProfile?.preferred_language)
                ]);
              }
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [recipientId, toast]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !recipientId) return;

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

      const { data: translationsResponse } = await supabase.functions.invoke('translate-message', {
        body: { text }
      });

      if (!translationsResponse?.translations) {
        throw new Error("Failed to get translations");
      }

      const translations = translationsResponse.translations as Record<string, string>;

      const { data: savedMessage, error: saveError } = await supabase
        .from('messages')
        .insert([{
          content: text,
          translations,
          sender_id: user.id,
          recipient_id: recipientId
        }])
        .select()
        .single();

      if (saveError) throw saveError;

      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? formatDatabaseMessage(savedMessage as DatabaseMessage, user.id)
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

  const updateMessagesLanguage = async (language: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setMessages(prev => prev.map(msg => {
      if (msg.isOutgoing) return msg;
      
      return {
        ...msg,
        text: getMessageLanguageContent(msg, language)
      };
    }));
  };

  return {
    messages,
    setMessages,
    sendMessage,
    updateMessagesLanguage
  };
};