"use client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/** Revient à la page précédente ; arrivé directement sur la page (lien partagé, nouvel onglet), va à `secours`. */
export function BoutonRetour({ secours, className, children }: { secours: string; className?: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const depuisLeSite = document.referrer.startsWith(location.origin);
        if (depuisLeSite && history.length > 1) router.back();
        else router.push(secours);
      }}
    >
      {children}
    </button>
  );
}
