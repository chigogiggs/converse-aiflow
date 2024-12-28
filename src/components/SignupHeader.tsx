import { Logo } from "./Logo";

export const SignupHeader = () => {
  return (
    <div className="flex flex-col space-y-2 text-center">
      <Logo className="mx-auto h-6 w-6" />
      <h1 className="text-2xl font-semibold tracking-tight">
        Create an account
      </h1>
      <p className="text-sm text-muted-foreground">
        Break language barriers with AI-powered translations
      </p>
    </div>
  );
};