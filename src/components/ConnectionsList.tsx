import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Loader2 } from "lucide-react";
import { Connection, Profile } from "@/integrations/supabase/types/tables";

type ConnectionWithProfile = Connection & {
  profiles: Profile;
};

export const ConnectionsList = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["connections", userId],
    queryFn: async () => {
      const { data: connectionsData, error: connectionsError } = await supabase
        .from("connections")
        .select("*")
        .eq("requester_id", userId)
        .eq("status", "accepted");

      if (connectionsError) throw connectionsError;

      const connectionsWithProfiles = await Promise.all(
        (connectionsData || []).map(async (connection) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", connection.recipient_id)
            .maybeSingle();

          return {
            ...connection,
            profiles: profile || {
              id: connection.recipient_id,
              username: "unknown",
              display_name: "Unknown User",
              avatar_url: null,
              created_at: null,
              updated_at: null,
            },
          };
        })
      );

      return connectionsWithProfiles as ConnectionWithProfile[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Connections</CardTitle>
      </CardHeader>
      <CardContent>
        {connections.length > 0 ? (
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
                  onClick={() =>
                    navigate(`/chat?userId=${connection.recipient_id}`)
                  }
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
  );
};