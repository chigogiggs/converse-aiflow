import { Connection } from "@/integrations/supabase/types/tables";
import { ScrollArea } from "../ui/scroll-area";
import { PendingConnectionItem } from "../PendingConnectionItem";

interface PendingTabProps {
  connections: Connection[];
  onAccept?: (connectionId: string) => void;
  onReject?: (connectionId: string) => void;
  showActions?: boolean;
  type?: 'sent' | 'received';
}

export const PendingTab = ({ 
  connections, 
  onAccept, 
  onReject, 
  showActions = false,
  type = 'received'
}: PendingTabProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <div className="space-y-4 p-4">
        {connections.map((connection) => (
          <PendingConnectionItem
            key={connection.id}
            connection={connection}
            onAccept={onAccept}
            onReject={onReject}
            showActions={showActions}
          />
        ))}
        {connections.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No pending requests {type === 'sent' ? 'sent' : 'received'}
          </p>
        )}
      </div>
    </ScrollArea>
  );
};