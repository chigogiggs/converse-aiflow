import { supabase } from "@/integrations/supabase/client";

export const translateMessage = async (
  text: string,
  recipientId: string
): Promise<{ translatedText: string; targetLanguage: string }> => {
  try {
    // First try to get existing preferences
    let preferences = await supabase
      .from('user_preferences')
      .select('preferred_language')
      .eq('user_id', recipientId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      });

    // If no preferences exist, create them with default values
    if (!preferences) {
      const { data: newPrefs, error: createError } = await supabase
        .from('user_preferences')
        .insert([
          { 
            user_id: recipientId,
            preferred_language: 'en' // Default to English
          }
        ])
        .select('preferred_language')
        .maybeSingle();

      if (createError) {
        console.error('Error creating preferences:', createError);
        throw createError;
      }

      preferences = newPrefs;
    }

    // Use either existing preference or default to English
    const targetLanguage = preferences?.preferred_language || 'en';

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
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return {
      translatedText: text,
      targetLanguage: 'en'
    };
  }
};