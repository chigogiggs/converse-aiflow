import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { EmailPasswordSlide } from "./signup/EmailPasswordSlide";
import { UsernameSlide } from "./signup/UsernameSlide";
import { ProfilePictureSlide } from "./signup/ProfilePictureSlide";
import { LanguageSlide } from "./signup/LanguageSlide";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createUserRecords } from "@/utils/auth";

export const SignupForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("en");
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigate = useNavigate();

  const slides = [
    <EmailPasswordSlide
      key="email-password"
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
    />,
    <UsernameSlide
      key="username"
      username={username}
      onUsernameChange={setUsername}
    />,
    <ProfilePictureSlide
      key="profile-picture"
      avatarUrl={avatarUrl}
      username={username}
      onAvatarChange={setAvatarUrl}
    />,
    <LanguageSlide
      key="language"
      language={language}
      onLanguageChange={setLanguage}
    />
  ];

  const handleSignup = async () => {
    try {
      // First check if username exists
      const { data: existingUser, error: usernameError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle();

      if (usernameError) {
        console.error("Error checking username:", usernameError);
        throw usernameError;
      }

      if (existingUser) {
        toast({
          title: "Username Already Taken",
          description: "Please choose a different username.",
          variant: "destructive",
        });
        return;
      }

      // Try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            preferred_language: language,
            username,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // Create profile and preferences records
        await createUserRecords(signUpData.user.id, username, avatarUrl, language);

        toast({
          title: "Welcome aboard! 🎉",
          description: "Your account has been created successfully.",
        });
        
        navigate("/home");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return email && password;
      case 1:
        return username;
      case 2:
        return true; // Avatar is optional
      case 3:
        return language;
      default:
        return false;
    }
  };

  return (
    <div className="grid gap-6">
      <div className="relative">
        <AnimatePresence mode="wait">
          {slides[currentStep]}
        </AnimatePresence>

        <div className="mt-8 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(current => current - 1)}
            disabled={currentStep === 0}
            className="text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {currentStep < slides.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(current => current + 1)}
              disabled={!canGoNext()}
              className="bg-primary hover:bg-primary/90"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSignup}
              disabled={!canGoNext()}
              className="bg-primary hover:bg-primary/90"
            >
              Create Account
            </Button>
          )}
        </div>
      </div>

      {currentStep === 0 && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
      )}

      {currentStep === 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </button>
        </div>
      )}
    </div>
  );
};
