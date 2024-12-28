import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { useNavigate } from "react-router-dom";

interface UserProfileCardProps {
  user: any;  // Using any for now since we don't have the type
}

export const UserProfileCard = ({ user }: UserProfileCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar
            src={user.profile?.avatar_url || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"}
            fallback={user.profile?.display_name?.[0] || "?"}
            size="lg"
            userId={user.id}
            editable={true}
          />
          <div>
            <CardTitle className="text-2xl font-bold">
              {user.profile?.display_name !== "New User" ? user.profile?.display_name : ""}
            </CardTitle>
            <p className="text-muted-foreground">
              {user.email}
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
  );
};