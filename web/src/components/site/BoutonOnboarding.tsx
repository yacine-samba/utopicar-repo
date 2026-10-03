"use client";
import { ouvrirOnboarding } from "./Onboarding";

export function BoutonOnboarding({ children, className = "btn" }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" onClick={ouvrirOnboarding} className={className}>
      {children}
    </button>
  );
}
