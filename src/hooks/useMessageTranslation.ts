import { supabase } from "@/integrations/supabase/client";

export const translateMessage = async (
  text: string,
  recipientId: string
): Promise<{ translatedText: string; targetLanguage: string }> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return {
        translatedText: text,
        targetLanguage: 'en'
      };
    }

    // Get recipient preferences
    const { data: preferences, error: prefsError } = await supabase
      .from('user_preferences')
      .select('preferred_language')
      .eq('user_id', recipientId)
      .maybeSingle();

    if (prefsError) {
      console.error('Error fetching preferences:', prefsError);
      // Create default preferences if none exist
      const { error: insertError } = await supabase
        .from('user_preferences')
        .insert([
          { 
            user_id: recipientId,
            preferred_language: 'en'
          }
        ]);

      if (insertError) {
        console.error('Error creating preferences:', insertError);
        return {
          translatedText: text,
          targetLanguage: 'en'
        };
      }
    }

    const targetLanguage = preferences?.preferred_language || 'en';

    // Language mapping for better translation
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

    try {
      const { data: translatedMessage, error: translateError } = await supabase.functions.invoke('translate-message', {
        body: { 
          text,
          targetLanguage: fullLanguageName
        }
      });

      if (translateError) throw translateError;

      return {
        translatedText: translatedMessage.translatedText,
        targetLanguage
      };
    } catch (translateError) {
      console.error('Translation error:', translateError);
      return {
        translatedText: text,
        targetLanguage: 'en'
      };
    }
  } catch (error) {
    console.error('General error:', error);
    return {
      translatedText: text,
      targetLanguage: 'en'
    };
  }
};