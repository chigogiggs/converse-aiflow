import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { useMessages } from "@/hooks/useMessages";
import { useEffect, useState } from "react";

interface LanguageDropdownProps {
  recipientId?: string | null;
}

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "tr", name: "Turkish" },
];

export const LanguageDropdown = ({ recipientId }: LanguageDropdownProps) => {
  const location = useLocation();
  const { updateMessagesLanguage } = useMessages(recipientId || '');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  useEffect(() => {
    const fetchCurrentLanguage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', user.id)
        .single();

      if (profile?.preferred_language) {
        setSelectedLanguage(profile.preferred_language);
      }
    };

    fetchCurrentLanguage();
  }, []);

  const handleLanguageChange = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    toast({
      description: "Translating...",
      duration: 2000,
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ preferred_language: languageCode })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (location.pathname === '/chat' && recipientId) {
        await updateMessagesLanguage(languageCode);
      }
    } catch (error: any) {
      console.error('Translation error:', error);
      setSelectedLanguage(selectedLanguage);
      toast({
        description: "Translation failed",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#C8C8C9] hover:bg-[#403E43] hover:text-[#7E69AB]"
        >
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-[#1A1F2C] border-[#7E69AB]/20">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`text-[#C8C8C9] hover:bg-[#403E43] hover:text-[#7E69AB] cursor-pointer ${
              selectedLanguage === lang.code ? 'bg-[#403E43] text-[#7E69AB]' : ''
            }`}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};