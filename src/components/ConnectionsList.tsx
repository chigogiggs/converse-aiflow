import { useEffect, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { Connection, Profile } from "@/integrations/supabase/types/tables";
import { MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ConnectionWithProfile = Connection & {
  profiles: Profile | null;
};

export const ConnectionsList = ({ onSelectConnection }: { onSelectConnection: (userId: string) => void }) => {
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('No authenticated user found');
          return;
        }

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

        const connectionsWithProfiles = await Promise.all(
          (connectionsData || []).map(async (connection) => {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select()
                .eq('id', connection.recipient_id)
                .single();

              // If no profile is found, return the connection with a default profile
              return {
                ...connection,
                profiles: profileData || {
                  id: connection.recipient_id,
                  username: 'unknown',
                  display_name: 'Unknown User',
                  avatar_url: null,
                  created_at: null,
                  updated_at: null
                }
              };
            } catch (error) {
              console.error(`Error fetching profile for connection ${connection.id}:`, error);
              // Return connection with default profile on error
              return {
                ...connection,
                profiles: {
                  id: connection.recipient_id,
                  username: 'unknown',
                  display_name: 'Unknown User',
                  avatar_url: null,
                  created_at: null,
                  updated_at: null
                }
              };
            }
          })
        );

        setConnections(connectionsWithProfiles);
      } catch (error) {
        console.error('Error in fetchConnections:', error);
        toast({
          title: "Error",
          description: "Failed to load connections",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
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
    if (!connection.profiles) {
      toast({
        title: "Error",
        description: "Could not find recipient profile",
        variant: "destructive",
      });
      return;
    }
    setSelectedId(connection.id);
    onSelectConnection(connection.recipient_id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)] w-full rounded-md border p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-medium">Active Chats</h3>
        </div>
        {connections.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No active chats found</p>
        ) : (
          connections.map((connection) => (
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
          ))
        )}
      </div>
    </ScrollArea>
  );
};