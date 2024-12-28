import { Button } from "@/components/ui/button";
import { Users, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
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
  );
};