import { Connection } from "@/integrations/supabase/types/tables";
import { ConnectionItem } from "../ConnectionItem";
import { Skeleton } from "../ui/skeleton";

interface ConnectionsTabProps {
  connections: Connection[];
  onSelectConnection?: (connectionId: string) => void;
  isLoading?: boolean;
}

export const ConnectionsTab = ({ 
  connections, 
  onSelectConnection,
  isLoading 
}: ConnectionsTabProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!connections?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No connections yet</p>
        <p className="text-sm">Start connecting with other users!</p>
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