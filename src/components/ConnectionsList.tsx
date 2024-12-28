import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectionsTab } from "./connections/ConnectionsTab";
import { PendingTab } from "./connections/PendingTab";
import { useConnections } from "@/hooks/useConnections";

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
    isLoading 
  } = useConnections();

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