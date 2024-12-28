import { useLocation, useSearchParams } from "react-router-dom";
import { BackButton } from "./navigation/BackButton";
import { RecipientInfo } from "./navigation/RecipientInfo";
import { LanguageDropdown } from "./navigation/LanguageDropdown";
import { LogoutButton } from "./navigation/LogoutButton";

export const Navigation = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get('recipient');
  const isHomePage = location.pathname === '/home';

  return (
    <nav className="h-16 sticky top-0 z-50 w-full bg-[#1A1F2C]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1A1F2C]/60 border-b border-[#7E69AB]/20">
      <div className="container mx-auto h-full flex justify-between items-center px-6">
        <div className="flex items-center gap-4">
          {!isHomePage && <BackButton />}
          {recipientId ? (
            <RecipientInfo recipientId={recipientId} />
          ) : (
            isHomePage && (
              <h2 className="text-xl font-semibold text-[#C8C8C9]">Home</h2>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <LanguageDropdown recipientId={recipientId} />
          {isHomePage && <LogoutButton />}
        </div>
      </div>
    </nav>
  );
};