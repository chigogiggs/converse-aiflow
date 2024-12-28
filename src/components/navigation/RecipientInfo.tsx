import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserAvatar } from "@/components/UserAvatar";

interface RecipientInfoProps {
  recipientId: string | null;
}

export const RecipientInfo = ({ recipientId }: RecipientInfoProps) => {
  const { data: recipientProfile } = useQuery({
    queryKey: ['profile', recipientId],
    queryFn: async () => {
      if (!recipientId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', recipientId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId
  });

  if (!recipientProfile) return null;

  return (
    <div className="flex items-center gap-4">
      <UserAvatar
        src={recipientProfile?.avatar_url}
        fallback={recipientProfile?.display_name?.[0] || "?"}
        size="lg"
      />
      <div className="animate-fade-in">
        <h2 className="text-xl font-semibold text-[#C8C8C9]">{recipientProfile?.display_name}</h2>
        <p className="text-sm text-[#8A898C]">Online</p>
      </div>
    </div>
  );
};