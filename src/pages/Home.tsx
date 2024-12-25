import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/UserAvatar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, UserPlus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Fetch current user and their profile
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return null;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      return { ...user, profile };
    },
  });

  // Fetch user's connections with profiles
  const { data: connections = [], isLoading: isLoadingConnections } = useQuery({
    queryKey: ["connections", currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      const { data: connectionsData, error: connectionsError } = await supabase
        .from("connections")
        .select("*")
        .eq("requester_id", currentUser!.id)
        .eq("status", "accepted");

      if (connectionsError) throw connectionsError;

      const connectionsWithProfiles = await Promise.all(
        (connectionsData || []).map(async (connection) => {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", connection.recipient_id)
              .single();

            return {
              ...connection,
              profiles: profile || {
                id: connection.recipient_id,
                username: "unknown",
                display_name: "Unknown User",
                avatar_url: null,
              },
            };
          } catch (error) {
            console.error("Error fetching profile:", error);
            return {
              ...connection,
              profiles: {
                id: connection.recipient_id,
                username: "unknown",
                display_name: "Unknown User",
                avatar_url: null,
              },
            };
          }
        })
      );

      return connectionsWithProfiles;
    },
  });

  // Search for users
  const { data: searchResults = [], isLoading: isLoadingSearch } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    enabled: searchQuery.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", currentUser?.id || '')
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  const handleConnect = async (userId: string) => {
    try {
      const { error } = await supabase.from("connections").insert({
        requester_id: currentUser?.id,
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

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
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

      <Card>
        <CardHeader>
          <CardTitle>Your Connections</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingConnections ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : connections.length > 0 ? (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                >
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      src={connection.profiles?.avatar_url || ""}
                      fallback={connection.profiles?.display_name?.[0] || "?"}
                    />
                    <div>
                      <h3 className="font-medium">
                        {connection.profiles?.display_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        @{connection.profiles?.username}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/chat?userId=${connection.recipient_id}`)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              You haven't connected with anyone yet. Try searching for users above!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;