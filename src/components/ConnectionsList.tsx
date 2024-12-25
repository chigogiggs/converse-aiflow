import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Connection } from "@/integrations/supabase/types/tables";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectionItem } from "./ConnectionItem";
import { PendingConnectionItem } from "./PendingConnectionItem";

interface ConnectionsListProps {
  onSelectConnection: (connectionId: string) => void;
}

export const ConnectionsList = ({ onSelectConnection }: ConnectionsListProps) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Connection[]>([]);
  const [pendingSent, setPendingSent] = useState<Connection[]>([]);
  const { toast } = useToast();

  const fetchConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch accepted connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .eq('requester_id', user.id)
        .eq('status', 'accepted');

      if (connectionsError) throw connectionsError;

      // Fetch pending received requests
      const { data: receivedData, error: receivedError } = await supabase
        .from('connections')
        .select('*, profiles!connections_requester_id_fkey(*)')
        .eq('recipient_id', user.id)
        .eq('status', 'pending');

      if (receivedError) throw receivedError;

      // Fetch pending sent requests
      const { data: sentData, error: sentError } = await supabase
        .from('connections')
        .select('*, profiles!connections_recipient_id_fkey(*)')
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (sentError) throw sentError;

      // Get profiles for accepted connections
      const connectionsWithProfiles = await Promise.all(
        connectionsData.map(async (connection) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', connection.recipient_id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            return {
              ...connection,
              recipient: null
            };
          }

          return {
            ...connection,
            recipient: profileData
          };
        })
      );

      setConnections(connectionsWithProfiles);
      setPendingReceived(receivedData);
      setPendingSent(sentData);
    } catch (error: any) {
      toast({
        title: "Error fetching connections",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [toast]);

  const handleAccept = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Connection accepted",
        description: "You can now start chatting!",
      });

      fetchConnections();
    } catch (error: any) {
      toast({
        title: "Error accepting connection",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Connection rejected",
      });

      fetchConnections();
    } catch (error: any) {
      toast({
        title: "Error rejecting connection",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue="connections" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="connections">Connected</TabsTrigger>
        <TabsTrigger value="received">Received</TabsTrigger>
        <TabsTrigger value="sent">Sent</TabsTrigger>
      </TabsList>

      <TabsContent value="connections">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-4 p-4">
            {connections.map((connection) => (
              <ConnectionItem 
                key={connection.id} 
                connection={connection} 
                onSelect={onSelectConnection}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="received">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-4 p-4">
            {pendingReceived.map((connection) => (
              <PendingConnectionItem
                key={connection.id}
                connection={connection}
                onAccept={handleAccept}
                onReject={handleReject}
                showActions
              />
            ))}
            {pendingReceived.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No pending requests received
              </p>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="sent">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-4 p-4">
            {pendingSent.map((connection) => (
              <PendingConnectionItem
                key={connection.id}
                connection={connection}
              />
            ))}
            {pendingSent.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No pending requests sent
              </p>
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};