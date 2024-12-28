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
      onClick={() => onSelect?.(profile.id)}
      className="flex items-center space-x-4 w-full p-4 rounded-lg hover:bg-accent transition-colors"
    >
      <UserAvatar
        src={profile.avatar_url || undefined}
        fallback={profile.display_name?.[0] || "?"}
        size="md"
      />
      <div className="flex-1 text-left">
        <p className="font-medium">{profile.display_name}</p>
        <p className="text-sm text-muted-foreground">@{profile.username}</p>
      </div>
    </button>
  );
};