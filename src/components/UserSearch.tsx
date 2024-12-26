import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";

export const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = []; // Empty array since we removed database functionality

  const handleConnect = async (userId: string) => {
    console.log("Connect clicked for user:", userId);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Find Connections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
          {searchQuery && (
            <SearchResults 
              results={searchResults} 
              onConnect={handleConnect} 
              searchQuery={searchQuery} 
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};