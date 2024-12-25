import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/UserAvatar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Connection } from "@/integrations/supabase/types/tables";
import { MessageCircle, UserPlus, X } from "lucide-react";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return { ...user, profile };
    },
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: connectionsData } = await supabase
        .from("connections")
        .select("*")
        .eq("requester_id", user.id)
        .eq("status", "accepted");

      if (!connectionsData) return [];

      const connectionsWithProfiles = await Promise.all(
        connectionsData.map(async (connection) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", connection.recipient_id)
            .single();

          return {
            ...connection,
            profiles: profileData
          };
        })
      );

      return connectionsWithProfiles;
    },
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    enabled: searchQuery.length > 0,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", user.id)
        .limit(5);

      return data || [];
    },
  });

  const handleConnect = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("connections").insert({
        requester_id: user.id,
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

  const startChat = (userId: string) => {
    navigate(`/chat?userId=${userId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Find Connections</h1>
          <Input
            type="search"
            placeholder="Search users by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          {searchQuery && (
            <div className="mt-4 space-y-4">
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
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Your Connections</h2>
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
                      {connection.profiles?.display_name || "Unknown User"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      @{connection.profiles?.username || "unknown"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => startChat(connection.recipient_id)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;