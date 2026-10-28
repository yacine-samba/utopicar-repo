"use client";
import { cx } from "@/lib/cx";

/** Flèches ‹ › sous un carrousel qu'on fait glisser : avancent ou reculent d'une carte (la largeur du premier élément). */
export function Fleches({ cible, libelle, className }: { cible: string; libelle: string; className?: string }) {
  const aller = (sens: 1 | -1) => {
    const el = document.getElementById(cible);
    const carte = el?.querySelector("li");
    if (!el || !carte) return;
    const calme = document.documentElement.hasAttribute("data-calme") || matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: sens * (carte.getBoundingClientRect().width + 12), behavior: calme ? "auto" : "smooth" });
  };
  return (
    <div className={cx("flex justify-end", className)}>
      <div className="flex gap-1 rounded-full border border-line-2 p-1">
        <button type="button" onClick={() => aller(-1)} aria-label={`${libelle[0].toUpperCase()}${libelle.slice(1)} précédente`} className="grid size-10 place-items-center rounded-full text-ink-2 transition hover:bg-glass hover:text-ink">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 6-6 6 6 6" />
          </svg>
        </button>
        <button type="button" onClick={() => aller(1)} aria-label={`${libelle[0].toUpperCase()}${libelle.slice(1)} suivante`} className="grid size-10 place-items-center rounded-full text-ink-2 transition hover:bg-glass hover:text-ink">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
