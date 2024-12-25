import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Profile } from "@/integrations/supabase/types/tables";

interface SearchResultsProps {
  results: Profile[];
  onConnect: (userId: string) => void;
}

export const SearchResults = ({ results, onConnect }: SearchResultsProps) => {
  if (results.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        No users found
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm"
        >
          <div className="flex items-center gap-4">
            <UserAvatar
              src={user.avatar_url || undefined}
              fallback={user.display_name?.[0] || "?"}
            />
            <div>
              <h3 className="font-medium">{user.display_name}</h3>
              <p className="text-sm text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </div>
          <Button onClick={() => onConnect(user.id)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </div>
      ))}
    </div>
  );
};