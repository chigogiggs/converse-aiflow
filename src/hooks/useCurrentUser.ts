import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/integrations/supabase/types/tables';
import { User } from '@supabase/supabase-js';

interface CurrentUser extends User {
  profile?: Profile;
}

export const useCurrentUser = () => {
  const [data, setData] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileError) throw profileError;
          
          setData({ ...user, profile });
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { data, isLoading, error };
};