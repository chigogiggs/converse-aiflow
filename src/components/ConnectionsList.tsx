import { useEffect, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { Connection, Profile } from "@/integrations/supabase/types/tables";
import { MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const ConnectionsList = ({ onSelectConnection }: { onSelectConnection: (userId: string) => void }) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<{ [key: string]: Profile }>({});

  useEffect(() => {
    const fetchConnectionsAndProfiles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          return;
        }

        // First get connections
        const { data: connectionsData, error: connectionsError } = await supabase
          .from('connections')
          .select('*')
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

        if (!connectionsData?.length) {
          setConnections([]);
          return;
        }

        // Get all recipient IDs
        const recipientIds = connectionsData.map(conn => conn.recipient_id);

        // Fetch all profiles in a single query
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', recipientIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          toast({
            title: "Error",
            description: "Failed to load user profiles",
            variant: "destructive",
          });
          return;
        }

        // Create a map of profiles for easy lookup
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as { [key: string]: Profile });

        // Combine connections with profiles
        const connectionsWithProfiles = connectionsData.map(connection => ({
          ...connection,
          profiles: profilesMap[connection.recipient_id] || {
            id: connection.recipient_id,
            username: "unknown",
            display_name: "Unknown User",
            avatar_url: null,
            created_at: null,
            updated_at: null
          }
        }));

        setConnections(connectionsWithProfiles);
        setProfiles(profilesMap);
      } catch (error) {
        console.error('Error in fetchConnectionsAndProfiles:', error);
        toast({
          title: "Error",
          description: "Failed to load connections",
          variant: "destructive",
        });
      }
    };

    fetchConnectionsAndProfiles();

    const channel = supabase
      .channel('connections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections'
        },
        () => fetchConnectionsAndProfiles()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSelectConnection = (connection: Connection) => {
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
              src={connection.profiles?.avatar_url}
              fallback={connection.profiles?.display_name?.[0] || '?'}
            />
            <div>
              <p className="font-medium">{connection.profiles?.display_name || 'Unknown User'}</p>
              <p className="text-sm text-gray-500">@{connection.profiles?.username || 'unknown'}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};