import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useProfile = () => {
  const createOrUpdateProfile = async (userId: string, avatarUrl: string) => {
    try {
      // First check if profile exists
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!profile) {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            avatar_url: avatarUrl,
            username: userId.slice(0, 8),
            display_name: 'User'
          }]);

        if (insertError) throw insertError;
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', userId);

        if (updateError) throw updateError;
      }

      return true;
    } catch (error: any) {
      console.error('Profile operation failed:', error);
      throw error;
    }
  };

  return { createOrUpdateProfile };
};