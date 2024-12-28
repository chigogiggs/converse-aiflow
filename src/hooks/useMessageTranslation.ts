import { supabase } from "@/integrations/supabase/client";

export const translateMessage = async (
  text: string,
  recipientId: string
): Promise<{ translatedText: string; targetLanguage: string }> => {
  try {
    // First check if the user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return {
        translatedText: text,
        targetLanguage: 'en'
      };
    }

    // Try to get existing preferences using maybeSingle()
    const { data: preferences, error: prefsError } = await supabase
      .from('user_preferences')
      .select('preferred_language')
      .eq('user_id', recipientId)
      .maybeSingle();

    if (prefsError) {
      console.error('Error fetching preferences:', prefsError);
      return {
        translatedText: text,
        targetLanguage: 'en'
      };
    }

    // If no preferences exist, create default ones
    if (!preferences) {
      try {
        const { error: createError } = await supabase
          .from('user_preferences')
          .insert([
            { 
              user_id: recipientId,
              preferred_language: 'en' // Default to English
            }
          ]);

        if (createError) {
          console.error('Error creating preferences:', createError);
          return {
            translatedText: text,
            targetLanguage: 'en'
          };
        }

        // For new users, return original text with default language
        return {
          translatedText: text,
          targetLanguage: 'en'
        };
      } catch (error) {
        console.error('Error in preference creation:', error);
        return {
          translatedText: text,
          targetLanguage: 'en'
        };
      }
    }

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

    const targetLanguage = preferences.preferred_language;
    const fullLanguageName = languageMap[targetLanguage] || 'English';

    // Translate using Edge Function
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