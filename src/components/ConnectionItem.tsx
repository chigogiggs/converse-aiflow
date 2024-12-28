import { Connection } from "@/integrations/supabase/types/tables";
import { UserAvatar } from "./UserAvatar";
import { Badge } from "./ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ConnectionItemProps {
  connection: Connection;
  onSelect?: (connectionId: string) => void;
}

export const ConnectionItem = ({ connection, onSelect }: ConnectionItemProps) => {
  const profile = connection.recipient || connection.profiles;
  
  if (!profile) return null;

  // Query for unread messages count
  const { data: unreadCount } = useQuery({
    queryKey: ['unreadMessages', profile.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', profile.id)
        .eq('recipient_id', user.id)
        .eq('read', false);

      return count || 0;
    }
  });

  return (
    <button
      onClick={() => onSelect?.(connection.recipient_id)}
      className="flex items-center space-x-4 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
    >
      <UserAvatar
        src={profile.avatar_url || undefined}
        fallback={profile.display_name?.[0] || "?"}
        size="md"
      />
      <div className="flex-1 text-left">
        <p className="font-medium">{profile.display_name}</p>
        <p className="text-sm text-gray-500">@{profile.username}</p>
      </div>
      {unreadCount && unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute top-2 right-2"
        >
          {unreadCount}
        </Badge>
      )}
    </button>
  );
};