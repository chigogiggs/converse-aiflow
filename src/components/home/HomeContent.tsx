import { UserSearch } from "@/components/UserSearch";
import { ConnectionsList } from "@/components/ConnectionsList";
import { useNavigate } from "react-router-dom";

interface HomeContentProps {
  userId: string;
}

export const HomeContent = ({ userId }: HomeContentProps) => {
  const navigate = useNavigate();

  const handleSelectConnection = (connectionId: string) => {
    navigate(`/chat?recipient=${connectionId}`);
  };

  return (
    <>
      <div className="animate-fade-in">
        <UserSearch currentUserId={userId} />
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <ConnectionsList onSelectConnection={handleSelectConnection} />
      </div>
    </>
  );
};