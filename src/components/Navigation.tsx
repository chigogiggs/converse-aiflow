import { useNavigate } from "react-router-dom";
import { LogOut, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const Navigation = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      localStorage.clear();
      
      toast({
        title: "Logged out successfully",
        description: "All sessions have been terminated",
      });
      
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Error logging out",
        description: error.message || "An error occurred while logging out",
        variant: "destructive",
      });
      navigate("/login");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full py-4 px-6 bg-white border-b">
      <div className="container mx-auto flex justify-between items-center">
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

          <Button
            variant="ghost"
            className="gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};