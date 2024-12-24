import { Globe } from "lucide-react";
import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="relative">
        <Globe className="w-8 h-8 text-indigo-600 animate-pulse group-hover:text-indigo-500 transition-colors" />
        <div className="absolute -inset-1 bg-indigo-100 rounded-full blur-sm group-hover:blur-md transition-all opacity-75" />
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
        Soyle Translator
      </span>
    </Link>
  );
};