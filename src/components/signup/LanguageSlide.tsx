import { SignupSlide } from "./SignupSlide";
import { LanguageSelector } from "@/components/LanguageSelector";

interface LanguageSlideProps {
  language: string;
  onLanguageChange: (value: string) => void;
}

export const LanguageSlide = ({ language, onLanguageChange }: LanguageSlideProps) => {
  return (
    <SignupSlide
      title="Choose your language"
      description="Select your preferred language for translations"
    >
      <LanguageSelector
        value={language}
        onChange={onLanguageChange}
        label=""
      />
    </SignupSlide>
  );
};