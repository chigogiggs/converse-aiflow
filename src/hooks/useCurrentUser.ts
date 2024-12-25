import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("User fetch error:", userError);
        throw userError;
      }
      if (!user) {
        console.log("No user found");
        return null;
      }

      // Fetch profile with maybeSingle to handle case where profile doesn't exist
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      // Fetch preferences with maybeSingle
      const { data: preferences, error: preferencesError } = await supabase
        .from("user_preferences")
        .select("preferred_language")
        .eq("user_id", user.id)
        .maybeSingle();

      if (preferencesError) {
        console.error("Preferences fetch error:", preferencesError);
      }

      // If no preferences exist, create default preferences
      if (!preferences) {
        const { error: createError } = await supabase
          .from("user_preferences")
          .insert([
            { 
              user_id: user.id,
              preferred_language: "en" // Default to English
            }
          ]);

        if (createError) {
          console.error("Error creating preferences:", createError);
          toast({
            title: "Error",
            description: "Failed to create user preferences",
            variant: "destructive",
          });
        }
      }

      return { ...user, profile, preferences };
    },
    retry: 1,
    meta: {
      errorMessage: "Error loading profile. Please try logging in again."
    }
  });
};