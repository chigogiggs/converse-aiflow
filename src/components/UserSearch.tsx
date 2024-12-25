import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Loader2 } from "lucide-react";
import { Profile } from "@/integrations/supabase/types/tables";

export const UserSearch = ({ currentUserId }: { currentUserId: string }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults = [], isLoading: isLoadingSearch } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    enabled: searchQuery.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", currentUserId)
        .limit(5);

      if (error) throw error;
      return (data || []) as Profile[];
    },
  });

  const handleConnect = async (userId: string) => {
    try {
      const { error } = await supabase.from("connections").insert({
        requester_id: currentUserId,
        recipient_id: userId,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection request sent!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="search"
            placeholder="Search users by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          {isLoadingSearch ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            searchQuery && (
              <div className="space-y-4">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                  >
                    <div className="flex items-center gap-4">
                      <UserAvatar
                        src={user.avatar_url || ""}
                        fallback={user.display_name?.[0] || "?"}
                      />
                      <div>
                        <h3 className="font-medium">{user.display_name}</h3>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleConnect(user.id)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};