import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Connection } from "@/integrations/supabase/types/tables";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectionsTab } from "./connections/ConnectionsTab";
import { PendingTab } from "./connections/PendingTab";
import { Badge } from "./ui/badge";

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
        .select(`
          *,
          recipient:profiles!connections_profiles_recipient_fk(*)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'accepted');

      if (connectionsError) throw connectionsError;

      // Fetch pending received requests
      const { data: receivedData, error: receivedError } = await supabase
        .from('connections')
        .select(`
          *,
          profiles:profiles!connections_profiles_requester_fk(*)
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending');

      if (receivedError) throw receivedError;

      // Fetch pending sent requests
      const { data: sentData, error: sentError } = await supabase
        .from('connections')
        .select(`
          *,
          profiles:profiles!connections_profiles_recipient_fk(*)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (sentError) throw sentError;

      setConnections(connectionsData as Connection[] || []);
      setPendingReceived(receivedData as Connection[] || []);
      setPendingSent(sentData as Connection[] || []);
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

    // Subscribe to real-time updates for new connection requests
    const channel = supabase
      .channel('connections-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connections',
          filter: `recipient_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        (payload) => {
          console.log('New connection request:', payload);
          toast({
            title: "New Connection Request",
            description: "Someone wants to connect with you!",
          });
          fetchConnections(); // Refresh the connections list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        <TabsTrigger value="connections" className="relative">
          Connected
          {connections.length > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 bg-primary text-primary-foreground"
            >
              {connections.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="received" className="relative">
          Received
          {pendingReceived.length > 0 && (
            <Badge 
              variant="secondary"
              className="ml-2 bg-destructive text-destructive-foreground"
            >
              {pendingReceived.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent">
          Sent
          {pendingSent.length > 0 && (
            <Badge 
              variant="secondary"
              className="ml-2"
            >
              {pendingSent.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="connections">
        <ConnectionsTab 
          connections={connections} 
          onSelectConnection={onSelectConnection} 
        />
      </TabsContent>

      <TabsContent value="received">
        <PendingTab
          connections={pendingReceived}
          onAccept={handleAccept}
          onReject={handleReject}
          showActions
        />
      </TabsContent>

      <TabsContent value="sent">
        <PendingTab
          connections={pendingSent}
        />
      </TabsContent>
    </Tabs>
  );
};