import { useEffect, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { Connection } from "@/integrations/supabase/types/tables";
import { MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ConnectionWithProfile = Connection & {
  recipient: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    created_at: string | null;
    updated_at: string | null;
  } | null;
};

export const ConnectionsList = ({ onSelectConnection }: { onSelectConnection: (userId: string) => void }) => {
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          return;
        }

        const { data: connectionsData, error: connectionsError } = await supabase
          .from('connections')
          .select(`
            *,
            recipient:profiles!connections_recipient_id_fkey (
              id,
              username,
              display_name,
              avatar_url,
              created_at,
              updated_at
            )
          `)
          .eq('requester_id', user.id)
          .eq('status', 'accepted');

        if (connectionsError) {
          console.error('Error fetching connections:', connectionsError);
          toast({
            title: "Error",
            description: "Failed to load connections",
            variant: "destructive",
          });
          return;
        }

        // Transform the data to handle missing profiles
        const transformedConnections = (connectionsData || []).map(conn => ({
          ...conn,
          recipient: conn.recipient || {
            id: conn.recipient_id,
            username: "unknown",
            display_name: "Unknown User",
            avatar_url: null,
            created_at: null,
            updated_at: null
          }
        })) as ConnectionWithProfile[];

        setConnections(transformedConnections);
      } catch (error) {
        console.error('Error in fetchConnections:', error);
        toast({
          title: "Error",
          description: "Failed to load connections",
          variant: "destructive",
        });
      }
    };

    fetchConnections();

    const channel = supabase
      .channel('connections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections'
        },
        () => fetchConnections()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSelectConnection = (connection: ConnectionWithProfile) => {
    setSelectedId(connection.id);
    onSelectConnection(connection.recipient_id);
  };

  return (
    <ScrollArea className="h-[calc(100vh-12rem)] w-full rounded-md border p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-medium">Active Chats</h3>
        </div>
        {connections.map((connection) => (
          <div
            key={connection.id}
            className={cn(
              "flex items-center space-x-4 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              selectedId === connection.id && "bg-gray-100 dark:bg-gray-800"
            )}
            onClick={() => handleSelectConnection(connection)}
          >
            <UserAvatar
              src={connection.recipient?.avatar_url}
              fallback={connection.recipient?.display_name?.[0] || '?'}
            />
            <div>
              <p className="font-medium">{connection.recipient?.display_name || 'Unknown User'}</p>
              <p className="text-sm text-gray-500">@{connection.recipient?.username || 'unknown'}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};