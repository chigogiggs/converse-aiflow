import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useUserPreferences = () => {
  const [outgoingLanguage, setOutgoingLanguage] = useState("en");
  const [incomingLanguage, setIncomingLanguage] = useState("en");

  useEffect(() => {
    const loadPreferences = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      try {
        // Try to get existing preferences
        const { data: preferences, error } = await supabase
          .from('user_preferences')
          .select('preferred_language')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        // If no preferences exist, create default ones
        if (!preferences) {
          const { error: createError } = await supabase
            .from('user_preferences')
            .insert([
              { 
                user_id: session.user.id,
                preferred_language: "en"
              }
            ]);

          if (createError) throw createError;
          
          setOutgoingLanguage("en");
          setIncomingLanguage("en");
        } else {
          setOutgoingLanguage(preferences.preferred_language);
          setIncomingLanguage(preferences.preferred_language);
        }
      } catch (error: any) {
        console.error('Error loading preferences:', error);
        toast({
          title: "Error loading preferences",
          description: "Using default language settings",
          variant: "destructive",
        });
      }
    };

    loadPreferences();
  }, []);

  return {
    outgoingLanguage,
    setOutgoingLanguage,
    incomingLanguage,
    setIncomingLanguage
  };
};