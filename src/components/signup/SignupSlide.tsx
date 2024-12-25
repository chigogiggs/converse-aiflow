import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SignupSlideProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export const SignupSlide = ({ children, title, description }: SignupSlideProps) => {
  return (
    <motion.div
      className="flex flex-col gap-6 w-full"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-gray-600">{description}</p>}
      </div>
      {children}
    </motion.div>
  );
};