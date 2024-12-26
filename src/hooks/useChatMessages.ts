import { useState } from "react";

interface Message {
  id: string;
  text: string;
  isOutgoing: boolean;
  timestamp: string;
  isTranslating?: boolean;
  originalText?: string;
}

export const useChatMessages = (selectedConnection: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async (message: string, apiKey: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isOutgoing: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  return { messages, sendMessage };
};