import { Logo } from "./Logo";

export const SignupHeader = () => {
  return (
    <div className="flex flex-col space-y-6 text-center">
      <Logo className="mx-auto" />
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Create an account
        </h1>
        <p className="text-base text-muted-foreground">
          Break language barriers with AI-powered translations
        </p>
      </div>
    </div>
  );
};