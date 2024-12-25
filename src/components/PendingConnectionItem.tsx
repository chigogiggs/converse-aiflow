import { Connection } from "@/integrations/supabase/types/tables";
import { UserAvatar } from "./UserAvatar";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";

interface PendingConnectionItemProps {
  connection: Connection;
  onAccept?: (connectionId: string) => void;
  onReject?: (connectionId: string) => void;
  showActions?: boolean;
}

export const PendingConnectionItem = ({ 
  connection, 
  onAccept, 
  onReject, 
  showActions = false 
}: PendingConnectionItemProps) => {
  if (!connection.profiles) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-4">
        <UserAvatar
          src={connection.profiles.avatar_url || undefined}
          fallback={connection.profiles.display_name?.[0] || "?"}
          size="md"
        />
        <div>
          <p className="font-medium">{connection.profiles.display_name}</p>
          <p className="text-sm text-gray-500">@{connection.profiles.username}</p>
        </div>
      </div>
      {showActions ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onAccept?.(connection.id)}
            className="bg-green-500 hover:bg-green-600"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onReject?.(connection.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Pending</span>
      )}
    </div>
  );
};