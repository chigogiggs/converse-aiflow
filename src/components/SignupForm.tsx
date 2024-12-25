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
import { checkExistingUsername, createUserRecords } from "@/utils/auth";

export const SignupForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("en");
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      // First check if username exists
      const existingUser = await checkExistingUsername(username);
      if (existingUser) {
        toast({
          title: "Username Already Taken",
          description: "Please choose a different username.",
          variant: "destructive",
        });
        return;
      }

      // Attempt to sign up
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

      if (signUpError) {
        // Handle the case where the user already exists
        if (signUpError.message.includes("User already registered")) {
          toast({
            title: "Account Already Exists",
            description: "This email is already registered. Please try logging in instead.",
            variant: "destructive",
          });
          return;
        }
        throw signUpError;
      }

      if (signUpData.user) {
        // Create profile and preferences records
        await createUserRecords(signUpData.user.id, username, avatarUrl, language);

        // Sign in the user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (signInData.session) {
          toast({
            title: "Welcome aboard! 🎉",
            description: "Your account has been created successfully.",
          });
          
          navigate("/home");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md mx-auto">
      <div className="relative">
        <AnimatePresence mode="wait">
          {slides[currentStep]}
        </AnimatePresence>

        <div className="mt-8 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(current => current - 1)}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? "bg-indigo-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {currentStep < slides.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(current => current + 1)}
              disabled={!canGoNext()}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSignup}
              disabled={!canGoNext()}
            >
              Create Account
            </Button>
          )}
        </div>
      </div>

      {currentStep === 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </div>
  );
};
