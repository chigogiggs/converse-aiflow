import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recipientId, toast]);

  const sendMessage = async (
    text: string,
    outgoingLanguage: string,
    incomingLanguage: string
  ) => {
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
      // Get recipient's preferred language
      const { data: recipientPrefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('preferred_language')
        .eq('user_id', recipientId)
        .maybeSingle();

      if (prefsError) throw prefsError;

      // If no preferences exist, use default language
      const targetLanguage = recipientPrefs?.preferred_language || 'en';

      // Translate the message using our Edge Function
      const { data: translatedMessage, error } = await supabase.functions.invoke('translate-message', {
        body: { text, targetLanguage }
      });

      if (error) throw error;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get user preferences to check first message status
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('has_sent_first_message')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (prefError) throw prefError;

      const isFirstMessage = !preferences?.has_sent_first_message;

      const { data: savedMessage, error: saveError } = await supabase
        .from('messages')
        .insert([{
          content: text,
          translated_content: translatedMessage.translatedText,
          source_language: outgoingLanguage,
          target_language: targetLanguage,
          sender_id: user.user.id,
          recipient_id: recipientId
        }])
        .select()
        .single();

      if (saveError) throw saveError;

      // Update user preferences if this was their first message
      if (isFirstMessage) {
        const { error: updateError } = await supabase
          .from('user_preferences')
          .upsert({ 
            user_id: user.user.id,
            has_sent_first_message: true,
            preferred_language: outgoingLanguage
          });

        if (updateError) throw updateError;

        toast({
          title: "Message sent",
          description: "Your message has been translated and sent",
        });
      }

      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { 
              ...msg, 
              text: translatedMessage.translatedText,
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