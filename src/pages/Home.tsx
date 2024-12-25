import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, MessageSquare, Settings } from "lucide-react";
import { UserSearch } from "@/components/UserSearch";
import { ConnectionsList } from "@/components/ConnectionsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  
  const { data: currentUser, isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return null;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      return { ...user, profile };
    },
  });

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Please log in to continue</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* User Profile Card */}
        <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar
                src={currentUser.profile?.avatar_url || undefined}
                fallback={currentUser.profile?.display_name?.[0] || "?"}
                className="h-16 w-16"
              />
              <div>
                <CardTitle className="text-2xl font-bold">
                  {currentUser.profile?.display_name}
                </CardTitle>
                <p className="text-muted-foreground">
                  @{currentUser.profile?.username}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Connections</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Messages</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Button
            className="h-auto py-4 px-6"
            onClick={() => navigate("/chat")}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Start a New Chat
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 px-6"
            onClick={() => navigate("/connections")}
          >
            <Users className="h-5 w-5 mr-2" />
            View All Connections
          </Button>
        </div>

        {/* Find Connections Section */}
        <div className="animate-fade-in">
          <UserSearch currentUserId={currentUser.id} />
        </div>

        {/* Connections List */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <ConnectionsList onSelectConnection={(connectionId) => {
            console.log("Selected connection:", connectionId);
            navigate(`/chat?connection=${connectionId}`);
          }} />
        </div>
      </div>
    </div>
  );
};

export default Home;