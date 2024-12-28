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
import { useEffect } from "react";

interface LanguageDropdownProps {
  recipientId?: string | null;
}

export const LanguageDropdown = ({ recipientId }: LanguageDropdownProps) => {
  const location = useLocation();
  const { updateMessagesLanguage } = useMessages(recipientId || '');

  const handleLanguageChange = async (languageCode: string) => {
    const loadingToast = toast({
      title: "Updating messages language",
      description: "Please wait while we update the messages...",
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      await supabase
        .from('profiles')
        .update({ preferred_language: languageCode })
        .eq('id', user.id);

      if (location.pathname === '/chat' && recipientId) {
        await updateMessagesLanguage(languageCode);
      }

      toast({
        title: "Language updated",
        description: "Messages are now displayed in the selected language.",
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the messages language.",
        variant: "destructive",
      });
    }
  };

  // Subscribe to profile changes to update messages in real-time
  useEffect(() => {
    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${recipientId}`,
        },
        async (payload) => {
          const newLanguage = payload.new.preferred_language;
          if (newLanguage && location.pathname === '/chat') {
            await updateMessagesLanguage(newLanguage);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recipientId, location.pathname]);

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
            className="text-[#C8C8C9] hover:bg-[#403E43] hover:text-[#7E69AB] cursor-pointer"
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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