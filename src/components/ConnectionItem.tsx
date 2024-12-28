import { UserAvatar } from "./UserAvatar";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";

interface ConnectionItemProps {
  connection: {
    id: string;
    display_name: string;
    avatar_url?: string;
    username?: string;
  };
  onSelect?: (id: string) => void;
  showActions?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  isPending?: boolean;
}

export const ConnectionItem = ({
  connection,
  onSelect,
  showActions = false,
  onAccept,
  onReject,
  isPending = false,
}: ConnectionItemProps) => {
  return (
    <div 
      className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect?.(connection.id)}
    >
      <div className="flex items-center space-x-4">
        <UserAvatar
          src={connection.avatar_url}
          fallback={connection.display_name[0]}
        />
        <div>
          <h3 className="font-medium">{connection.display_name}</h3>
          {connection.username && (
            <p className="text-sm text-gray-500">@{connection.username}</p>
          )}
        </div>
      </div>
      
      {showActions && (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onAccept?.(connection.id);
            }}
          >
            <Check className="h-4 w-4 text-green-500" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onReject?.(connection.id);
            }}
          >
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}
    </div>
  );
};