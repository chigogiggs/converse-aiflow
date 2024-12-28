import { Button } from "@/components/ui/button";
import { Users, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm animate-fade-in hover:shadow-lg transition-shadow duration-300" style={{ animationDelay: "0.1s" }}>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          className="w-full h-auto py-4 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity"
          onClick={() => navigate("/chat")}
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Start a New Chat
        </Button>
        <Button
          variant="outline"
          className="w-full h-auto py-4 hover:bg-primary/5 transition-colors"
          onClick={() => navigate("/connections")}
        >
          <Users className="h-5 w-5 mr-2" />
          View All Connections
        </Button>
      </CardContent>
    </Card>
  );
};