import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
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

  return (
    <nav className="h-16 sticky top-0 z-50 w-full bg-[#1A1F2C]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1A1F2C]/60 border-b border-[#7E69AB]/20">
      <div className="container mx-auto h-full flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2 text-[#C8C8C9] hover:bg-[#403E43] hover:text-[#7E69AB]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/connections")}
              className="hidden sm:flex text-[#C8C8C9] hover:bg-[#403E43] hover:text-[#7E69AB]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};