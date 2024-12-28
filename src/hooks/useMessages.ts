import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { translateMessage } from "./useMessageTranslation";
import { saveMessage, updateUserPreferences } from "./useMessageStore";

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
        setIsInitialLoad(false);
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

    // Only subscribe to real-time updates after initial load
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
          if (!user || isInitialLoad) return;

          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new;
            // Only add the message if it's not from the current user
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recipientId, toast, isInitialLoad]);

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

    // Add message to local state immediately
    setMessages(prev => [...prev, newMessage]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get recipient's preferred language
      const { data: recipientPrefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('preferred_language')
        .eq('user_id', recipientId)
        .single();

      if (prefsError) throw prefsError;

      // Translate the message to recipient's preferred language
      const { translatedText, targetLanguage } = await translateMessage(text, recipientId);

      // Save the message with correct target language
      const savedMessage = await saveMessage(
        text,
        translatedText,
        outgoingLanguage,
        recipientPrefs.preferred_language, // Use recipient's preferred language
        user.id,
        recipientId
      );

      // Update user preferences if first message
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('has_sent_first_message')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!preferences?.has_sent_first_message) {
        await updateUserPreferences(user.id, outgoingLanguage);
      }

      // Update the message in the UI
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { 
              ...msg, 
              id: savedMessage.id, // Update with the real ID from the database
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

      // Remove the optimistically added message on error
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }
  };

  return {
    messages,
    setMessages,
    sendMessage
  };
};