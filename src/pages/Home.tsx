import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { UserAvatar } from "@/components/UserAvatar";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: suggestedUsers } = useQuery({
    queryKey: ["suggested-users", searchQuery],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id);

      if (searchQuery) {
        query = query.ilike("username", `%${searchQuery}%`);
      }

      const { data } = await query.limit(5);
      return data || [];
    },
  });

  const { data: connections } = useQuery({
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
            profiles: profileData || null
          };
        })
      );

      return connectionsWithProfiles;
    },
  });

  const handleConnect = async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("connections")
      .insert([
        {
          requester_id: user.id,
          recipient_id: userId,
          status: "pending",
        },
      ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Connection request sent!",
    });
  };

  const startChat = (userId: string) => {
    navigate(`/chat?with=${userId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Suggested Users */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="h-6 w-6" />
            {searchQuery ? "Search Results" : "Suggested Users"}
          </h2>
          <div className="grid gap-4">
            {suggestedUsers?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
              >
                <div className="flex items-center gap-4">
                  <UserAvatar
                    src={user.avatar_url}
                    fallback={user.display_name[0]}
                  />
                  <div>
                    <h3 className="font-medium">{user.display_name}</h3>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnect(user.id)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Existing Connections */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Your Connections
          </h2>
          <div className="grid gap-4">
            {connections?.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
              >
                <div className="flex items-center gap-4">
                  <UserAvatar
                    src={connection.profiles?.avatar_url || ''}
                    fallback={connection.profiles?.display_name?.[0] || '?'}
                  />
                  <div>
                    <h3 className="font-medium">
                      {connection.profiles?.display_name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      @{connection.profiles?.username || 'unknown'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => startChat(connection.recipient_id)}
                >
                  Start Chat
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