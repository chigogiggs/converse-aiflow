import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-12">
        <Logo />
      </div>
      <h1 className="text-4xl font-bold mb-6 text-center">About Us</h1>
      <p className="text-lg mb-6 text-center max-w-2xl mx-auto">
        Welcome to our AI-powered chat translation platform. We make communication
        across languages seamless and natural.
      </p>
      <div className="flex justify-center">
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    </div>
  );
};

export default About;