import { ConnectionsList } from "@/components/ConnectionsList";
import { useNavigate } from "react-router-dom";

const Connections = () => {
  const navigate = useNavigate();

  const handleSelectConnection = (connectionId: string) => {
    navigate(`/chat?recipient=${connectionId}`);
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-bold mb-6">Your Connections</h1>
      <ConnectionsList onSelectConnection={handleSelectConnection} />
    </div>
  );
};

export default Connections;