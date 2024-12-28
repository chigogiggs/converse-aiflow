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

        // Get user's preferred language
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('id', user.id)
          .single();

        const preferredLanguage = userProfile?.preferred_language || 'en';

        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
          .order('created_at', { ascending: true })
          .limit(100);

        if (error) throw error;

        const formattedMessages = (data as DatabaseMessage[]).map(msg => {
          const formattedMsg = formatDatabaseMessage(msg, user.id);
          // If the message is from another user, use the translated content
          if (msg.sender_id !== user.id && msg.translations) {
            formattedMsg.text = msg.translations[preferredLanguage] || msg.content;
          }
          return formattedMsg;
        });

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
              const { data: userProfile } = await supabase
                .from('profiles')
                .select('preferred_language')
                .eq('id', user.id)
                .single();

              const preferredLanguage = userProfile?.preferred_language || 'en';

              if (newMessage.sender_id !== user.id) {
                const formattedMsg = formatDatabaseMessage(newMessage, user.id);
                if (newMessage.translations) {
                  formattedMsg.text = newMessage.translations[preferredLanguage] || newMessage.content;
                }
                setMessages(prev => [...prev, formattedMsg]);
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch the last 100 messages again to ensure we have the latest data
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const updatedMessages = (data as DatabaseMessage[]).map(msg => {
        const formattedMsg = formatDatabaseMessage(msg, user.id);
        // Only translate messages from other users
        if (msg.sender_id !== user.id && msg.translations) {
          formattedMsg.text = msg.translations[language] || msg.content;
        }
        return formattedMsg;
      });

      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error updating messages language:', error);
      toast({
        title: "Error",
        description: "Failed to update messages language",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    setMessages,
    sendMessage,
    updateMessagesLanguage
  };
};