import { Connection } from "@/integrations/supabase/types/tables";
import { ScrollArea } from "../ui/scroll-area";
import { ConnectionItem } from "../ConnectionItem";
import { Button } from "../ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { FullConnectionsList } from "./FullConnectionsList";
import { Users } from "lucide-react";

interface ConnectionsTabProps {
  connections: Connection[];
  onSelectConnection: (connectionId: string) => void;
}

export const ConnectionsTab = ({ connections, onSelectConnection }: ConnectionsTabProps) => {
  const [showAllConnections, setShowAllConnections] = useState(false);

  // Sort connections by last message date (most recent first)
  const sortedConnections = [...connections].sort((a, b) => {
    return new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime();
  });

  // Take only the first 5 connections for the preview
  const recentConnections = sortedConnections.slice(0, 5);

  return (
    <>
      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="space-y-4 p-4">
          {recentConnections.map((connection) => (
            <ConnectionItem 
              key={connection.id} 
              connection={connection} 
              onSelect={onSelectConnection}
            />
          ))}
          {connections.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No connections yet
            </p>
          )}
        </div>
      </ScrollArea>
      
      {connections.length > 5 && (
        <div className="p-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowAllConnections(true)}
          >
            <Users className="h-4 w-4 mr-2" />
            View All Connections ({connections.length})
          </Button>
        </div>
      )}

      <Dialog open={showAllConnections} onOpenChange={setShowAllConnections}>
        <DialogContent className="max-w-2xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>All Connections</DialogTitle>
          </DialogHeader>
          <FullConnectionsList 
            connections={connections}
            onSelectConnection={(id) => {
              onSelectConnection(id);
              setShowAllConnections(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};