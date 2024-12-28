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
      className="grid gap-4"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="space-y-2">
        <h3 className="font-semibold tracking-tight text-xl">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </motion.div>
  );
};