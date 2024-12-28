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
    <nav className="h-16 sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="container mx-auto h-full flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2 text-foreground hover:bg-accent hover:text-accent-foreground"
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
                <h2 className="text-xl font-semibold text-foreground">{recipientProfile?.display_name}</h2>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/connections")}
              className="hidden sm:flex text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};