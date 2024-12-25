import { Connection } from "@/integrations/supabase/types/tables";
import { UserAvatar } from "./UserAvatar";
import { Card } from "./ui/card";

interface ConnectionItemProps {
  connection: Connection;
  onSelect?: (connectionId: string) => void;
}

export const ConnectionItem = ({ connection, onSelect }: ConnectionItemProps) => {
  const profile = connection.recipient || connection.profiles;
  
  if (!profile) return null;

  return (
    <Card
      onClick={() => onSelect?.(connection.recipient_id)}
      className="flex items-center space-x-4 w-full p-4 cursor-pointer transition-all duration-200 
        hover:shadow-md hover:scale-[1.01] bg-white/80 dark:bg-gray-800/80
        border border-gray-200 dark:border-gray-700"
    >
      <UserAvatar
        src={profile.avatar_url || undefined}
        fallback={profile.display_name?.[0] || "?"}
        size="md"
      />
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-gray-100">{profile.display_name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
      </div>
    </Card>
  );
};