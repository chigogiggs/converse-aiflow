import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingStep {
  title: string;
  description: string;
  image: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to Soyle Translator",
    description: "Breaking language barriers with AI-powered translations",
    image: "/onboarding-1.svg"
  },
  {
    title: "Speak Your Language",
    description: "Write messages in your preferred language - we handle the translation automatically",
    image: "/onboarding-2.svg"
  },
  {
    title: "Real-Time Translation",
    description: "Your messages are instantly translated to the recipient's preferred language",
    image: "/onboarding-3.svg"
  }
];

export const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-white rounded-2xl p-8 max-w-md mx-4"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{steps[currentStep].title}</h2>
            <p className="text-gray-600 mb-6">{steps[currentStep].description}</p>
            <div className="mb-6">
              <img src={steps[currentStep].image} alt={steps[currentStep].title} className="mx-auto" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};