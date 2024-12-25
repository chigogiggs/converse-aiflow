import { Search } from "lucide-react";

interface ChatSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ChatSearch = ({ searchQuery, setSearchQuery }: ChatSearchProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search messages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-8 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
};