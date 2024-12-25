import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <div className="relative">
      <Input
        type="search"
        placeholder="Search by username or display name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pr-10"
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Search is limited to usernames and display names only.</p>
            <p>Email search is not available for privacy reasons.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};