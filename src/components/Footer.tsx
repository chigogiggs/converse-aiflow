import { Github, Heart } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => {
  return (
    <footer className="w-full py-6 px-4 mt-auto border-t bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
        <Logo className="scale-75" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Built with</span>
          <Heart className="h-4 w-4 text-red-500" />
          <span>by</span>
          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium text-foreground hover:underline"
          >
            <Github className="h-4 w-4" />
            Your Team
          </a>
        </div>
      </div>
    </footer>
  );
};