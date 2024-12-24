import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">About Us</h1>
      <p className="text-lg mb-6">
        Welcome to our AI-powered chat translation platform. We make communication across languages seamless and natural.
      </p>
      <Button onClick={() => navigate("/")}>Back to Home</Button>
    </div>
  );
};

export default About;