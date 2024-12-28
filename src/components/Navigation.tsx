import { useNavigate, useSearchParams } from "react-router-dom";
import { LogOut, MessageCircle, Users, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { UserAvatar } from "./UserAvatar";

export const Navigation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get('recipient');

  const { data: recipientProfile } = useQuery({
    queryKey: ['profile', recipientId],
    queryFn: async () => {
      if (!recipientId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', recipientId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId
  });

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
    <nav className="h-16 sticky top-0 z-50 w-full bg-white border-b">
      <div className="container mx-auto h-full flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          {recipientProfile ? (
            <>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/home')}
                className="mr-2"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <UserAvatar
                src={recipientProfile?.avatar_url}
                fallback={recipientProfile?.display_name?.[0] || "?"}
                size="lg"
              />
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold">{recipientProfile?.display_name}</h2>
                <p className="text-sm text-gray-500">Online</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        <Button
          variant="secondary"
          onClick={handleLogout}
          className="gap-2 bg-white hover:bg-gray-100 shadow-sm border transition-all duration-200 ease-in-out hover:shadow-md"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </nav>
  );
};