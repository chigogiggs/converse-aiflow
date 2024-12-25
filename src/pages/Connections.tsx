import { ConnectionsList } from "@/components/ConnectionsList";
import { PageLayout } from "@/components/PageLayout";
import { useNavigate } from "react-router-dom";

const Connections = () => {
  const navigate = useNavigate();

  const handleSelectConnection = (connectionId: string) => {
    navigate(`/chat?recipient=${connectionId}`);
  };

  return (
    <PageLayout title="Your Connections">
      <ConnectionsList onSelectConnection={handleSelectConnection} />
    </PageLayout>
  );
};

export default Connections;