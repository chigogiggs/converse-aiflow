import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useProfile = () => {
  const createOrUpdateProfile = async (userId: string, avatarUrl: string) => {
    try {
      // First check if profile exists using proper query syntax
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select()
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw new Error('Failed to check existing profile');
      }

      if (!profile) {
        // Create new profile with required fields
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            avatar_url: avatarUrl,
            username: userId.slice(0, 8), // Temporary username
            display_name: 'New User' // Default display name
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw new Error('Failed to create new profile');
        }
      } else {
        // Update existing profile's avatar
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw new Error('Failed to update profile');
        }
      }

      return true;
    } catch (error: any) {
      console.error('Profile operation failed:', error);
      throw error;
    }
  };

  return { createOrUpdateProfile };
};