import { useState } from "react";
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
}

export const useMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);

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
      const { data: translatedMessage, error } = await supabase.functions.invoke('translate-message', {
        body: { text, sourceLanguage: outgoingLanguage, targetLanguage: incomingLanguage }
      });

      if (error) throw error;

      // Save message to database
      const { data: savedMessage, error: saveError } = await supabase
        .from('messages')
        .insert([{
          content: text,
          translated_content: translatedMessage.translatedText,
          source_language: outgoingLanguage,
          target_language: incomingLanguage,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          recipient_id: "recipient_id_here" // Replace with actual recipient ID
        }])
        .select()
        .single();

      if (saveError) throw saveError;

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

      toast({
        title: "Message sent",
        description: "Your message has been translated and sent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });

      // Remove the message if translation failed
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }
  };

  return {
    messages,
    setMessages,
    sendMessage
  };
};