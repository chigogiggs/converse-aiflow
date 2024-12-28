import { DatabaseMessage, Message } from "@/types/message.types";

export const formatDatabaseMessage = (
  msg: DatabaseMessage, 
  userId: string, 
  preferredLanguage: string = 'en'
): Message => {
  return {
    id: msg.id,
    text: msg.translations?.[preferredLanguage.toLowerCase()] || msg.content,
    originalText: msg.content,
    isOutgoing: msg.sender_id === userId,
    timestamp: new Date(msg.created_at).toLocaleTimeString(),
    senderId: msg.sender_id,
    translations: msg.translations || undefined
  };
};

export const getMessageLanguageContent = (
  message: Message,
  language: string
): string => {
  if (!message.translations || message.isOutgoing) {
    return message.text;
  }
  return message.translations[language.toLowerCase()] || message.text;
};