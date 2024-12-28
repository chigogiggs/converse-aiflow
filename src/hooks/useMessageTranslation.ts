import { supabase } from "@/integrations/supabase/client";

export const translateMessage = async (
  text: string,
  recipientId: string
): Promise<{ translatedText: string; targetLanguage: string }> => {
  try {
    // Get recipient's preferred language from their profile
    const { data: recipientProfile, error: profileError } = await supabase
      .from('profiles')
      .select('preferred_language')
      .eq('id', recipientId)
      .single();

    if (profileError) {
      console.error('Error fetching recipient profile:', profileError);
      return {
        translatedText: text,
        targetLanguage: 'en'
      };
    }

    const targetLanguage = recipientProfile.preferred_language;

    try {
      const { data: translatedMessage, error: translateError } = await supabase.functions.invoke('translate-message', {
        body: { 
          text,
          targetLanguage
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