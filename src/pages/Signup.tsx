import { motion } from "framer-motion";
import { SignupHeader } from "@/components/SignupHeader";
import { SignupForm } from "@/components/SignupForm";

const Signup = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 to-indigo-50 px-4">
      <motion.div 
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <SignupHeader />
        <SignupForm />
      </motion.div>
    </div>
  );
};

export default Signup;