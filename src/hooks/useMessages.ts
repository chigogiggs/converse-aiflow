import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  translations?: Record<string, string>;
}

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
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedMessages = data.map(msg => ({
          id: msg.id,
          text: msg.translations?.[recipientProfile?.preferred_language?.toLowerCase() || 'english'] || msg.content,
          originalText: msg.content,
          isOutgoing: msg.sender_id === user.id,
          timestamp: new Date(msg.created_at).toLocaleTimeString(),
          senderId: msg.sender_id,
          translations: msg.translations
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
              const newMessage = payload.new;
              const { data: recipientProfile } = await supabase
                .from('profiles')
                .select('preferred_language')
                .eq('id', recipientId)
                .single();

              if (newMessage.sender_id !== user.id) {
                setMessages(prev => [...prev, {
                  id: newMessage.id,
                  text: newMessage.translations?.[recipientProfile?.preferred_language?.toLowerCase() || 'english'] || newMessage.content,
                  originalText: newMessage.content,
                  isOutgoing: newMessage.sender_id === user.id,
                  timestamp: new Date(newMessage.created_at).toLocaleTimeString(),
                  senderId: newMessage.sender_id,
                  translations: newMessage.translations
                }]);
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

      // Get translations for all supported languages
      const { data: translationsResponse } = await supabase.functions.invoke('translate-message', {
        body: { text }
      });

      if (!translationsResponse?.translations) {
        throw new Error("Failed to get translations");
      }

      // Convert language names to lowercase for consistency
      const translations = Object.entries(translationsResponse.translations).reduce((acc, [key, value]) => {
        acc[key.toLowerCase()] = value;
        return acc;
      }, {} as Record<string, string>);

      // Save message with all translations
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
          ? { 
              ...msg, 
              id: savedMessage.id,
              translations,
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

  const updateMessagesLanguage = async (language: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setMessages(prev => prev.map(msg => {
      if (msg.isOutgoing) return msg;
      
      return {
        ...msg,
        text: msg.translations?.[language.toLowerCase()] || msg.text
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