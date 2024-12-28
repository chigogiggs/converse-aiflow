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
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setOutgoingLanguage(profile.preferred_language);
          setIncomingLanguage(profile.preferred_language);
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