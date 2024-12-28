import { UserAvatar } from "./UserAvatar";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ConnectionItemProps {
  connection: {
    id: string;
    display_name: string;
    avatar_url?: string;
    username?: string;
  };
  onSelect?: (id: string) => void;
  showActions?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  isPending?: boolean;
}

export const ConnectionItem = ({
  connection,
  onSelect,
  showActions = false,
  onAccept,
  onReject,
  isPending = false,
}: ConnectionItemProps) => {
  // Query to get unread messages count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadMessages', connection.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', connection.id)
        .eq('recipient_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    }
  });

  return (
    <div 
      className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect?.(connection.id)}
    >
      <div className="flex items-center space-x-4">
        <UserAvatar
          src={connection.avatar_url}
          fallback={connection.display_name[0]}
        />
        <div>
          <h3 className="font-medium">{connection.display_name}</h3>
          {connection.username && (
            <p className="text-sm text-gray-500">@{connection.username}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>
      
      {showActions && (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onAccept?.(connection.id);
            }}
          >
            <Check className="h-4 w-4 text-green-500" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onReject?.(connection.id);
            }}
          >
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}
    </div>
  );
};