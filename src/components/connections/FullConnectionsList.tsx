import { Connection } from "@/integrations/supabase/types/tables";
import { ScrollArea } from "../ui/scroll-area";
import { ConnectionItem } from "../ConnectionItem";

interface FullConnectionsListProps {
  connections: Connection[];
  onSelectConnection: (connectionId: string) => void;
}

export const FullConnectionsList = ({ connections, onSelectConnection }: FullConnectionsListProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-4 p-4">
        {connections.map((connection) => (
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
  );
};