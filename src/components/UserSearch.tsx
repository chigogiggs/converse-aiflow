import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";
import { Profile } from "@/integrations/supabase/types/tables";

export const UserSearch = ({ currentUserId }: { currentUserId: string }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults = [], isLoading: isLoadingSearch } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    enabled: searchQuery.length > 0,
    queryFn: async () => {
      const { data: users, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .neq("id", currentUserId)
        .limit(5);

      if (profilesError) throw profilesError;
      return (profiles || []) as Profile[];
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

      toast.success("Connection request sent!");
    } catch (error: any) {
      toast.error("Failed to send connection request");
      console.error("Error sending connection request:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Find Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="search"
            placeholder="Search users by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          {isLoadingSearch ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            searchQuery && (
              <div className="space-y-4">
                {searchResults.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No users found
                  </p>
                ) : (
                  searchResults.map((user) => (
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
                      <Button onClick={() => handleConnect(user.id)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};