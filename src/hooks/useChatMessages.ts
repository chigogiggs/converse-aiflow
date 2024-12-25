import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  text: string;
  isOutgoing: boolean;
  timestamp: string;
  isTranslating?: boolean;
}

export const useChatMessages = (selectedConnection: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!selectedConnection) return;

    const fetchMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${selectedConnection},recipient_id.eq.${selectedConnection}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        text: msg.translated_content || msg.content,
        isOutgoing: msg.sender_id === selectedConnection,
        timestamp: new Date(msg.created_at).toLocaleTimeString(),
      }));

      setMessages(formattedMessages);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${selectedConnection}`
        },
        (payload) => {
          const newMessage = payload.new;
          setMessages(prev => [...prev, {
            id: newMessage.id,
            text: newMessage.translated_content || newMessage.content,
            isOutgoing: false,
            timestamp: new Date(newMessage.created_at).toLocaleTimeString(),
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConnection]);

  const sendMessage = async (message: string, apiKey: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedConnection) return;

    const { error } = await supabase
      .from('messages')
      .insert([{
        sender_id: user.id,
        recipient_id: selectedConnection,
        content: message,
        source_language: "en",
        target_language: "en",
      }]);

    if (error) throw error;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: message,
      isOutgoing: true,
      timestamp: new Date().toLocaleTimeString(),
    }]);
  };

  return { messages, sendMessage };
};