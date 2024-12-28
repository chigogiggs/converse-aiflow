import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectionsTab } from "./connections/ConnectionsTab";
import { PendingTab } from "./connections/PendingTab";
import { Badge } from "./ui/badge";
import { useConnections } from "@/hooks/useConnections";

interface ConnectionsListProps {
  onSelectConnection: (connectionId: string) => void;
}

export const ConnectionsList = ({ onSelectConnection }: ConnectionsListProps) => {
  const {
    connections,
    pendingReceived,
    pendingSent,
    handleAccept,
    handleReject,
  } = useConnections();

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