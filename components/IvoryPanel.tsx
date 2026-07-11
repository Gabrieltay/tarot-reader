import { ReactNode } from "react";

interface IvoryPanelProps {
  children: ReactNode;
  className?: string;
}

export default function IvoryPanel({ children, className = "" }: IvoryPanelProps) {
  return (
    <div className={`ivory-panel px-7 py-9 sm:px-12 sm:py-12 ${className}`}>
      {children}
    </div>
  );
}
