import { UserSearch } from "@/components/UserSearch";
import { ConnectionsList } from "@/components/ConnectionsList";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HomeContentProps {
  userId: string;
}

export const HomeContent = ({ userId }: HomeContentProps) => {
  const navigate = useNavigate();

  const handleSelectConnection = (connectionId: string) => {
    navigate(`/chat?recipient=${connectionId}`);
  };

  return (
    <div className="space-y-6">
      <Card className="w-full bg-card/50 backdrop-blur-sm animate-fade-in hover:shadow-lg transition-shadow duration-300" style={{ animationDelay: "0.2s" }}>
        <CardHeader>
          <CardTitle>Find Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <UserSearch currentUserId={userId} />
        </CardContent>
      </Card>

      <Card className="w-full bg-card/50 backdrop-blur-sm animate-fade-in hover:shadow-lg transition-shadow duration-300" style={{ animationDelay: "0.3s" }}>
        <CardHeader>
          <CardTitle>Your Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <ConnectionsList onSelectConnection={handleSelectConnection} />
        </CardContent>
      </Card>
    </div>
  );
};