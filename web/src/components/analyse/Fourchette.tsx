"use client";
import { useEffect, useState } from "react";

/* Le prix de l'annonce placé sur la fourchette du marché (moitié centrale des annonces comparables) : un repère orange
   qui glisse à l'ouverture. Utilisé dans l'aperçu de l'accueil et dans le rapport. */
const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;
const reduit = () => typeof window !== "undefined" && (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-calme"));

export function Fourchette({ prix, p25, p75, legende = true }: { prix: number; p25: number; p75: number; legende?: boolean }) {
  const [pose, setPose] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPose(true), reduit() ? 0 : 50);
    return () => clearTimeout(t);
  }, []);
  // la fourchette occupe le tiers central ; au-delà, le repère s'approche des bords sans les dépasser
  const etendue = Math.max(1, p75 - p25);
  const pos = Math.max(4, Math.min(96, 33 + ((prix - p25) / etendue) * 34));
  return (
    <div className="mt-3" role="img" aria-label={`Prix ${eur(prix)} ; la moitié des annonces comparables se situe entre ${eur(p25)} et ${eur(p75)}.`}>
      <div className="relative h-2 rounded-full bg-[linear-gradient(90deg,rgb(62_203_127/.55),var(--color-line-2)_33%,var(--color-line-2)_67%,rgb(255_122_122/.6))]">
        <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg0 bg-o transition-[left] duration-700 ease-[var(--ease-doux)]" style={{ left: `${pose ? pos : 50}%` }} />
      </div>
      {legende && (
        <div className="mt-1.5 flex justify-between text-[11px] text-ink-3" aria-hidden="true">
          <span>moins cher</span>
          <span>
            cote {eur(p25)} – {eur(p75)}
          </span>
          <span>plus cher</span>
        </div>
      )}
    </div>
  );
}
