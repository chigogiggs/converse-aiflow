import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
  showFooter?: boolean;
}

export const PageLayout = ({ 
  children, 
  showBackButton = true, 
  title,
  showFooter = true 
}: PageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {(showBackButton || title) && (
            <div className="flex items-center gap-4 mb-6">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              {title && <h1 className="text-2xl font-bold">{title}</h1>}
            </div>
          )}
          {children}
        </div>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};