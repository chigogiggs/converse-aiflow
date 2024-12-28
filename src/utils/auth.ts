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
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        display_name: username,
        avatar_url: avatarUrl,
        preferred_language: language
      });

    if (profileError) throw profileError;

  } catch (error) {
    console.error('Error creating user records:', error);
    throw error;
  }
};