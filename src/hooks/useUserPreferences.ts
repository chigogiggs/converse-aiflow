import { useState } from "react";

export const useUserPreferences = () => {
  const [outgoingLanguage, setOutgoingLanguage] = useState("en");
  const [incomingLanguage, setIncomingLanguage] = useState("en");

  return {
    outgoingLanguage,
    setOutgoingLanguage,
    incomingLanguage,
    setIncomingLanguage
  };
};