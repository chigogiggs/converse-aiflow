import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectionsTab } from "./connections/ConnectionsTab";
import { PendingTab } from "./connections/PendingTab";
import { useConnections } from "@/hooks/useConnections";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConnectionsListProps {
  onSelectConnection?: (connectionId: string) => void;
}

export const ConnectionsList = ({ onSelectConnection }: ConnectionsListProps) => {
  const { 
    connections, 
    pendingReceived, 
    pendingSent,
    handleAccept,
    handleReject,
    isLoading,
    refreshConnections 
  } = useConnections();

  useEffect(() => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const channel = supabase
      .channel('connections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `recipient_id=eq.${user.id}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: requesterProfile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', payload.new.requester_id)
              .single();

            toast(`New connection request`, {
              description: `${requesterProfile?.display_name || 'Someone'} wants to connect with you`,
              duration: 5000,
            });
          }
          refreshConnections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Tabs defaultValue="connections" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="connections">
          Connections
        </TabsTrigger>
        <TabsTrigger value="received">
          Received
          {pendingReceived.length > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {pendingReceived.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent">
          Sent
          {pendingSent.length > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {pendingSent.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="connections">
        <ConnectionsTab 
          connections={connections}
          onSelectConnection={onSelectConnection}
          isLoading={isLoading}
        />
      </TabsContent>
      
      <TabsContent value="received">
        <PendingTab
          connections={pendingReceived}
          onAccept={handleAccept}
          onReject={handleReject}
          showActions={true}
          type="received"
        />
      </TabsContent>
      
      <TabsContent value="sent">
        <PendingTab
          connections={pendingSent}
          type="sent"
        />
      </TabsContent>
    </Tabs>
  );
};