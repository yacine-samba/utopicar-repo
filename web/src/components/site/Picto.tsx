import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";

/* Pictogrammes des bentos, dessinés trait par trait quand la case arrive à l'écran (classe « trace » de globals.css,
   dans un parent « scene »). Décoratifs : masqués aux lecteurs d'écran, le titre de la case porte le sens. */

export const TRACES = {
  annonce: ["M6 3h9l4 4v8", "M15 3v4h4", "M6 3v18h7", "M9 9h5M9 13h4", "M17.5 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM19.3 19.3 21 21"],
  moteur: ["M4 10h2V8h3V6h6l2 2h2v3h1v5h-1v2h-3l-2 2H9l-2-2H6v-3H4z", "M10 11l2 3 3-4"],
  message: ["M4 5h16v11H9l-5 4z", "M8 9h8M8 12h5"],
  liste: ["M9 4h6v3H9z", "M7 5H5v16h14V5h-2", "M8 12l1.5 1.5L12 11M8 17l1.5 1.5L12 16", "M14 12.5h2M14 17.5h2"],
  voiture: ["M3 15V12l2-5h10l3 3h2a1 1 0 0 1 1 1v4", "M3 15h2M10 15h4M19 15h2", "M7.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM16.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"],
  base: ["M4 20h16", "M6 20v-6M10 20V8M14 20v-9M18 20V5"],
  poignee: ["M3 12l4-4 4 2 3-2 4 2 3 2", "M7 8l-4 4 5 5 2-1 2 2 2-1 2 1 3-3", "M11 10l-2 3"],
  marge: ["M4 18l5-6 4 3 7-8", "M15 7h5v5"],
} as const;

export type NomPicto = keyof typeof TRACES;

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/** Pictogramme seul (les tracés se dessinent l'un après l'autre). */
export function Picto({ nom, className, depart = 0.25 }: { nom: NomPicto; className?: string; depart?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {TRACES[nom].map((p, i) => (
        <path key={i} d={p} pathLength={1} className="trace" style={d(depart + i * 0.18)} />
      ))}
    </svg>
  );
}

/** Pictogramme dans sa tuile orange, en haut à droite d'une case. */
export function TuilePicto({ nom, className }: { nom: NomPicto; className?: string }) {
  return (
    <span className={cx("grid size-11 shrink-0 place-items-center rounded-2xl bg-o/12 text-o2", className)} aria-hidden="true">
      <Picto nom={nom} className="size-6" />
    </span>
  );
}
