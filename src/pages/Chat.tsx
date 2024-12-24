import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Chat</h1>
      <p className="text-lg mb-6">
        Start chatting with people around the world with real-time translation.
      </p>
      <Button onClick={() => navigate("/")}>Back to Home</Button>
    </div>
  );
};

export default Chat;