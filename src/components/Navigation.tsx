import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { UserAvatar } from "./UserAvatar";
import { toast } from "@/hooks/use-toast";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isHomePage = location.pathname === '/home';

  return (
    <nav className="h-16 sticky top-0 z-50 w-full bg-[#1A1F2C]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1A1F2C]/60 border-b border-[#7E69AB]/20">
      <div className="container mx-auto h-full flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          {!isHomePage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2 text-[#C8C8C9] hover:bg-[#403E43] hover:text-[#7E69AB]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {recipientProfile ? (
            <>
              <UserAvatar
                src={recipientProfile?.avatar_url}
                fallback={recipientProfile?.display_name?.[0] || "?"}
                size="lg"
              />
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-[#C8C8C9]">{recipientProfile?.display_name}</h2>
                <p className="text-sm text-[#8A898C]">Online</p>
              </div>
            </>
          ) : (
            isHomePage && (
              <h2 className="text-xl font-semibold text-[#C8C8C9]">Home</h2>
            )
          )}
        </div>

        {isHomePage && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-[#C8C8C9] hover:bg-[#403E43] hover:text-[#7E69AB]"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </nav>
  );
};