import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate(-1)}
      className="mr-2 text-[#C8C8C9] hover:bg-[#403E43] hover:text-[#7E69AB]"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
};