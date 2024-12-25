import { Input } from "@/components/ui/input";
import { SignupSlide } from "./SignupSlide";
import { Mail, Lock } from "lucide-react";

interface EmailPasswordSlideProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

export const EmailPasswordSlide = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
}: EmailPasswordSlideProps) => {
  return (
    <SignupSlide
      title="Let's get started"
      description="Enter your email and create a password"
    >
      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="pl-10"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="pl-10"
            placeholder="Choose a strong password"
            required
          />
        </div>
      </div>
    </SignupSlide>
  );
};