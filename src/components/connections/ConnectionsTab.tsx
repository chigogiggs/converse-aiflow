import { Connection } from "@/integrations/supabase/types/tables";
import { ScrollArea } from "../ui/scroll-area";
import { ConnectionItem } from "../ConnectionItem";
import { Button } from "../ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { FullConnectionsList } from "./FullConnectionsList";
import { Users } from "lucide-react";
import { Card } from "../ui/card";

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
      <Card className="bg-white/50 dark:bg-gray-900/50 border-opacity-50">
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
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No connections yet</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Start connecting with other users to see them here
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {connections.length > 5 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              variant="outline" 
              className="w-full bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setShowAllConnections(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              View All Connections ({connections.length})
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={showAllConnections} onOpenChange={setShowAllConnections}>
        <DialogContent className="max-w-2xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              All Connections
            </DialogTitle>
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