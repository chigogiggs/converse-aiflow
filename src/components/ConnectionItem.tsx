import { Connection } from "@/integrations/supabase/types/tables";
import { UserAvatar } from "./UserAvatar";

interface ConnectionItemProps {
  connection: Connection;
  onSelect?: (connectionId: string) => void;
}

export const ConnectionItem = ({ connection, onSelect }: ConnectionItemProps) => {
  const profile = connection.recipient || connection.profiles;
  
  if (!profile) return null;

  return (
    <button
      onClick={() => onSelect?.(connection.recipient_id)}
      className="flex items-center space-x-4 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <UserAvatar
        src={profile.avatar_url || undefined}
        fallback={profile.display_name?.[0] || "?"}
        size="md"
      />
      <div className="flex-1 text-left">
        <p className="font-medium">{profile.display_name}</p>
        <p className="text-sm text-gray-500">@{profile.username}</p>
      </div>
    </button>
  );
};