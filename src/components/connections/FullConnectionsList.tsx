import { useConnections } from "@/hooks/useConnections";
import { ConnectionItem } from "../ConnectionItem";

export const FullConnectionsList = () => {
  const { connections } = useConnections();

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
          />
        );
      })}
    </div>
  );
};