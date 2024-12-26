import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Profile } from "@/integrations/supabase/types/tables";
import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";

export const UserSearch = ({ currentUserId }: { currentUserId: string }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults = [], isLoading: isLoadingSearch } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    enabled: searchQuery.length > 0,
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .neq("id", currentUserId)
        .limit(5);

      if (error) throw error;
      return (profiles || []) as Profile[];
    },
  });

  const handleConnect = async (userId: string) => {
    try {
      const { error } = await supabase.from("connections").insert({
        requester_id: currentUserId,
        recipient_id: userId,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Connection request sent!");
    } catch (error: any) {
      toast.error("Failed to send connection request");
      console.error("Error sending connection request:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Find Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />

          {isLoadingSearch ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            searchQuery && <SearchResults results={searchResults} onConnect={handleConnect} searchQuery={searchQuery} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};