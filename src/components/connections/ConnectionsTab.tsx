import { Connection } from "@/integrations/supabase/types/tables";
import { ConnectionItem } from "../ConnectionItem";
import { Skeleton } from "../ui/skeleton";

interface ConnectionsTabProps {
  connections: Connection[];
  onSelectConnection?: (connectionId: string) => void;
}

export const ConnectionsTab = ({ connections, onSelectConnection }: ConnectionsTabProps) => {
  if (!connections?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No connections yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {connections.map((connection) => {
        const connectionProfile = connection.recipient || connection.profiles;
        if (!connectionProfile) return null;
        
        return (
          <ConnectionItem
            key={connection.id}
            connection={{
              id: connectionProfile.id,
              display_name: connectionProfile.display_name,
              avatar_url: connectionProfile.avatar_url,
              username: connectionProfile.username
            }}
            onSelect={onSelectConnection}
          />
        );
      })}
    </div>
  );
};