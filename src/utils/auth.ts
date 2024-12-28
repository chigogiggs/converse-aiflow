import { supabase } from "@/integrations/supabase/client";

export const checkExistingUsername = async (username: string) => {
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single();

  return existingUser;
};

export const createUserRecords = async (
  userId: string,
  username: string,
  avatarUrl: string,
  language: string
) => {
  try {
    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        display_name: username,
        avatar_url: avatarUrl
      });

    if (profileError) throw profileError;

    // Create user preferences record
    const { error: prefError } = await supabase
      .from('user_preferences')
      .insert([{ 
        user_id: userId, 
        preferred_language: language 
      }]);

    if (prefError) throw prefError;

  } catch (error) {
    console.error('Error creating user records:', error);
    throw error;
  }
};