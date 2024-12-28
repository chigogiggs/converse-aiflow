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

    // Try to get existing preferences
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
        const { data: newPrefs, error: createError } = await supabase
          .from('user_preferences')
          .insert([
            { 
              user_id: recipientId,
              preferred_language: 'en' // Default to English
            }
          ])
          .select()
          .single();

        if (createError) throw createError;

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

        // Translate using Edge Function
        const { data: translatedMessage, error: translateError } = await supabase.functions.invoke('translate-message', {
          body: { 
            text,
            targetLanguage: 'English' // Default for new users
          }
        });

        if (translateError) throw translateError;

        return {
          translatedText: translatedMessage.translatedText,
          targetLanguage: 'en'
        };
      } catch (error) {
        console.error('Error creating preferences:', error);
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

    // Translate the message using Edge Function
    try {
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
    } catch (translateError) {
      console.error('Translation error:', translateError);
      return {
        translatedText: text,
        targetLanguage: 'en'
      };
    }
  } catch (error) {
    console.error('General error:', error);
    // Return original text if anything fails
    return {
      translatedText: text,
      targetLanguage: 'en'
    };
  }
};