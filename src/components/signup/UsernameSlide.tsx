import { Input } from "@/components/ui/input";
import { SignupSlide } from "./SignupSlide";
import { User } from "lucide-react";

interface UsernameSlideProps {
  username: string;
  onUsernameChange: (value: string) => void;
}

export const UsernameSlide = ({ username, onUsernameChange }: UsernameSlideProps) => {
  return (
    <SignupSlide
      title="Choose your username"
      description="This is how other users will see you"
    >
      <div className="relative">
        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          className="pl-10"
          placeholder="Choose a username"
          required
        />
      </div>
    </SignupSlide>
  );
};