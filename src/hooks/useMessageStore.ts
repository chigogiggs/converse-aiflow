import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { translateMessage } from "./useMessageTranslation";

export const saveMessage = async (
  text: string,
  translatedText: string,
  sourceLanguage: string,
  targetLanguage: string,
  senderId: string,
  recipientId: string
) => {
  const { data: savedMessage, error: saveError } = await supabase
    .from('messages')
    .insert([{
      content: text,
      translated_content: translatedText,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      sender_id: senderId,
      recipient_id: recipientId
    }])
    .select()
    .single();

  if (saveError) throw saveError;
  return savedMessage;
};