import { Connection } from "@/integrations/supabase/types/tables";
import { ScrollArea } from "../ui/scroll-area";
import { ConnectionItem } from "../ConnectionItem";

interface ConnectionsTabProps {
  connections: Connection[];
  onSelectConnection: (connectionId: string) => void;
}

export const ConnectionsTab = ({ connections, onSelectConnection }: ConnectionsTabProps) => {
  return (
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
  );
};