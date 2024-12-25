import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { UserSearch } from "@/components/UserSearch";
import { ConnectionsList } from "@/components/ConnectionsList";

const Home = () => {
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return null;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      return { ...user, profile };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Please log in to continue</p>
      </div>
    );
  }

  const handleSelectConnection = (connectionId: string) => {
    // Handle connection selection
    console.log("Selected connection:", connectionId);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <UserSearch currentUserId={currentUser.id} />
      <ConnectionsList onSelectConnection={handleSelectConnection} />
    </div>
  );
};

export default Home;