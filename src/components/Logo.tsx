import React from "react";

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ className, onClick }) => {
  return (
    <div className={className} onClick={onClick}>
      <h1 className="text-6xl font-bold text-primary">
        <span className="inline-block">S</span>
        <span className="inline-block -ml-1">T</span>
      </h1>
    </div>
  );
};