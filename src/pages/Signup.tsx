import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { LanguageSelector } from "@/components/LanguageSelector";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Set user preferences
      if (authData.user) {
        const { error: prefError } = await supabase
          .from('user_preferences')
          .insert([
            { user_id: authData.user.id, preferred_language: language }
          ]);

        if (prefError) throw prefError;
      }

      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      
      // Redirect to chat with onboarding flag
      navigate("/chat?onboarding=true");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8 animate-fade-in">
          <Logo className="w-48 h-48" /> {/* Increased size */}
        </div>
        <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Soyle Translator</h2>
          <p className="text-gray-600">Break language barriers with AI-powered translations</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                placeholder="Choose a strong password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
              <LanguageSelector
                value={language}
                onChange={setLanguage}
                label=""
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be your default language for receiving messages
              </p>
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors">
              Create Account
            </Button>
          </form>
          
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
        </div>
      </div>
    </div>
  );
};

export default Signup;