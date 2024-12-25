import { Logo } from "./Logo";

export const SignupHeader = () => {
  return (
    <div className="flex flex-col items-center mb-6">
      <Logo className="mb-2" />
      <p className="text-gray-600">Break language barriers with AI-powered translations</p>
    </div>
  );
};