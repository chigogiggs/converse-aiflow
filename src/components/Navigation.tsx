import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const Navigation = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
      
      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
      
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
      // Force navigation to login page even if logout fails
      navigate("/login");
    }
  };

  return (
    <nav className="w-full py-4 px-6 bg-white/50 backdrop-blur-sm border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Logo className="cursor-pointer" onClick={() => navigate("/")} />
        <Button
          variant="ghost"
          className="gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
};