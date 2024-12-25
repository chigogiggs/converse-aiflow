import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectionsTab } from "./connections/ConnectionsTab";
import { PendingTab } from "./connections/PendingTab";
import { Badge } from "./ui/badge";
import { useConnections } from "@/hooks/useConnections";
import { Users, UserPlus, Send } from "lucide-react";

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
      <TabsList className="grid w-full grid-cols-3 gap-2 p-1">
        <TabsTrigger value="connections" className="relative flex items-center gap-2">
          <Users className="h-4 w-4" />
          Connected
          {connections.length > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-1 bg-primary text-primary-foreground"
            >
              {connections.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="received" className="relative flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Received
          {pendingReceived.length > 0 && (
            <Badge 
              variant="secondary"
              className="ml-1 bg-destructive text-destructive-foreground animate-pulse"
            >
              {pendingReceived.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent" className="relative flex items-center gap-2">
          <Send className="h-4 w-4" />
          Sent
          {pendingSent.length > 0 && (
            <Badge 
              variant="secondary"
              className="ml-1"
            >
              {pendingSent.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
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
      </div>
    </Tabs>
  );
};