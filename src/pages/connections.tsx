import { ConnectionsList } from "@/components/ConnectionsList";
import { Logo } from "@/components/Logo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const ConnectionsPage = () => {
  const navigate = useNavigate();

  const handleSelectConnection = (connectionId: string) => {
    navigate(`/chat?connectionId=${connectionId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <Logo className="cursor-pointer h-12 w-auto" />
        </div>
        
        <Card className="shadow-lg border-opacity-50 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Your Connections
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <ConnectionsList onSelectConnection={handleSelectConnection} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectionsPage;