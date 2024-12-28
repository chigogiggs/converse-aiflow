import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { UserProfileCard } from "@/components/home/UserProfileCard";
import { QuickActions } from "@/components/home/QuickActions";
import { HomeContent } from "@/components/home/HomeContent";

const Home = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.log("Auth error or no session:", error);
        navigate("/login");
        return;
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: currentUser, isLoading, error } = useCurrentUser();

  if (error) {
    toast({
      title: "Error loading profile",
      description: "Please try logging in again",
      variant: "destructive",
    });
    navigate("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Please log in to continue</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      <main className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr]">
          <aside className="space-y-6">
            <UserProfileCard user={currentUser} />
            <QuickActions />
          </aside>
          <HomeContent userId={currentUser.id} />
        </div>
      </main>
    </div>
  );
};

export default Home;