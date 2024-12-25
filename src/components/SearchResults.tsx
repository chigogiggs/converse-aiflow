import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Check } from "lucide-react";
import { Profile } from "@/integrations/supabase/types/tables";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

interface SearchResultsProps {
  results: Profile[];
  onConnect: (userId: string) => void;
  searchQuery: string;
}

export const SearchResults = ({ results, onConnect, searchQuery }: SearchResultsProps) => {
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const looksLikeEmail = searchQuery.includes('@');

  const handleConnect = (userId: string) => {
    onConnect(userId);
    setSentRequests([...sentRequests, userId]);
  };

  if (results.length === 0) {
    return (
      <div className="space-y-4 py-8">
        {looksLikeEmail ? (
          <Alert>
            <AlertDescription>
              Email search is not available for privacy reasons. Try searching by username or display name instead.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">
              No users found matching your search criteria.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try searching by username or display name
            </p>
          </div>
        )}
      </div>
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
          <Button 
            onClick={() => handleConnect(user.id)}
            disabled={sentRequests.includes(user.id)}
            variant={sentRequests.includes(user.id) ? "secondary" : "default"}
          >
            {sentRequests.includes(user.id) ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Request Sent
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Connect
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  );
};