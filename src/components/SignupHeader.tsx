import { Logo } from "./Logo";

export const SignupHeader = () => {
  return (
    <div className="flex flex-col items-center">
      <Logo className="w-48 h-48 mb-2" />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Soyle Translator</h2>
        <p className="text-gray-600">Break language barriers with AI-powered translations</p>
      </div>
    </div>
  );
};