import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <Input
      type="search"
      placeholder="Search users by name or username..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  );
};