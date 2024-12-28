import { UserAvatar } from "./UserAvatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "./ui/badge";

interface ConnectionItemProps {
  connection: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  onSelect?: (id: string) => void;
  showActions?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const ConnectionItem = ({ 
  connection,
  onSelect,
  showActions = false,
  onAccept,
  onReject,
}: ConnectionItemProps) => {
  const { data: unreadCount } = useQuery({
    queryKey: ['unreadMessages', connection.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', connection.id)
        .eq('read', false);

      return count || 0;
    },
  });

  return (
    <div 
      className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors relative group"
      onClick={() => onSelect?.(connection.id)}
    >
      <div className="flex items-center space-x-4">
        <UserAvatar
          src={connection.avatar_url}
          fallback={connection.display_name[0]}
        />
        <div>
          <h3 className="font-medium">{connection.display_name}</h3>
          {unreadCount && unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex space-x-2">
          {onAccept && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAccept(connection.id);
              }}
              className="text-green-600 hover:text-green-700"
            >
              Accept
            </button>
          )}
          {onReject && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReject(connection.id);
              }}
              className="text-red-600 hover:text-red-700"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
};