import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Connection } from "@/integrations/supabase/types/tables";
import { UserAvatar } from "./UserAvatar";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ConnectionsListProps {
  onSelectConnection: (connectionId: string) => void;
}

export const ConnectionsList = ({ onSelectConnection }: ConnectionsListProps) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: connectionsData, error } = await supabase
          .from('connections')
          .select(`
            *,
            recipient:recipient_id (
              id,
              username,
              display_name,
              avatar_url
            )
          `)
          .eq('requester_id', user.id)
          .eq('status', 'accepted');

        if (error) throw error;

        setConnections(connectionsData || []);
      } catch (error: any) {
        toast({
          title: "Error fetching connections",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchConnections();
  }, [toast]);

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-4 p-4">
        {connections.map((connection) => (
          <button
            key={connection.id}
            onClick={() => onSelectConnection(connection.recipient_id)}
            className="flex items-center space-x-4 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <UserAvatar
              user={{
                avatar_url: connection.recipient?.avatar_url || null,
                display_name: connection.recipient?.display_name || "Unknown User",
              }}
            />
            <div className="flex-1 text-left">
              <p className="font-medium">{connection.recipient?.display_name}</p>
              <p className="text-sm text-gray-500">@{connection.recipient?.username}</p>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};