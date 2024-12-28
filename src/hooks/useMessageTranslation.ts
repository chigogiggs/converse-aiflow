import { supabase } from "@/integrations/supabase/client";

export const translateMessage = async (
  text: string,
  recipientId: string
): Promise<{ translatedText: string; targetLanguage: string }> => {
  // Get recipient's preferred language
  const { data: recipientPrefs, error: prefsError } = await supabase
    .from('user_preferences')
    .select('preferred_language')
    .eq('user_id', recipientId)
    .maybeSingle();

  if (prefsError) throw prefsError;

  // If no preferences exist, use default language
  const targetLanguage = recipientPrefs?.preferred_language || 'en';

  // Get full language name for better translation
  const languageMap: { [key: string]: string } = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'tr': 'Turkish'
  };

  const fullLanguageName = languageMap[targetLanguage] || 'English';

  // Translate the message using our Edge Function
  const { data: translatedMessage, error } = await supabase.functions.invoke('translate-message', {
    body: { 
      text,
      targetLanguage: fullLanguageName
    }
  });

  if (error) throw error;

  return {
    translatedText: translatedMessage.translatedText,
    targetLanguage
  };
};