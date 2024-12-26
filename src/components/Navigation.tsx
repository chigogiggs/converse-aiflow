import { useNavigate } from "react-router-dom";
import { MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full py-4 px-6 bg-white border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Logo className="cursor-pointer" onClick={() => navigate("/")} />
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/chat")}
            className="hidden sm:flex"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/connections")}
            className="hidden sm:flex"
          >
            <Users className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};