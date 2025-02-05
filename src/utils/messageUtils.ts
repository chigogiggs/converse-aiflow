import { DatabaseMessage, Message } from "@/types/message.types";

export const formatDatabaseMessage = (
  msg: DatabaseMessage, 
  userId: string, 
  preferredLanguage: string = 'en'
): Message => {
  return {
    id: msg.id,
    text: msg.content,
    originalText: msg.content,
    isOutgoing: msg.sender_id === userId,
    timestamp: new Date(msg.created_at).toLocaleTimeString(),
    senderId: msg.sender_id,
    translations: msg.translations || undefined,
    read: msg.read || false
  };
};

export const getMessageLanguageContent = (
  message: Message,
  language: string
): string => {
  if (!message.translations || !language) {
    return message.text;
  }
  return message.translations[language.toLowerCase()] || message.text;
};