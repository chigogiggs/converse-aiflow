import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { useNavigate } from "react-router-dom";
import { useConnections } from "@/hooks/useConnections";

interface UserProfileCardProps {
  user: any;  // Using any for now since we don't have the type
}

export const UserProfileCard = ({ user }: UserProfileCardProps) => {
  const navigate = useNavigate();
  const { connections } = useConnections();

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm animate-fade-in hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="space-y-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <UserAvatar
            src={user.profile?.avatar_url || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"}
            fallback={user.profile?.display_name?.[0] || "?"}
            size="lg"
            userId={user.id}
            editable={true}
          />
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {user.profile?.display_name !== "New User" ? user.profile?.display_name : ""}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {user.email}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/settings")}
          className="w-full hover:bg-primary/5 transition-colors"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer" onClick={() => navigate("/connections")}>
            <Users className="h-6 w-6 text-primary mb-2" />
            <p className="text-sm font-medium">Connections</p>
            <p className="text-2xl font-bold">{connections.length}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer" onClick={() => navigate("/chat")}>
            <MessageSquare className="h-6 w-6 text-primary mb-2" />
            <p className="text-sm font-medium">Messages</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};