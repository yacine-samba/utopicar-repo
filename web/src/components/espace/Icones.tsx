import type { Icone } from "@/lib/espace";

const TRACES: Record<Icone | "plus" | "fermer" | "sortie" | "site" | "lien", string> = {
  accueil: "M3 11.5 12 4l9 7.5M5.5 9.5V20h5v-5.5h3V20h5V9.5",
  analyser: "M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.3-2.2L21 21M7.5 10.5l2 2 4-4",
  rapports: "M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 0v5h5M9 13h6M9 17h6",
  parc: "M4 16.5V12l2-5h12l2 5v4.5M4 16.5h16M4 16.5V19h3v-2.5M17 16.5V19h3v-2.5M7.5 13.5h.01M16.5 13.5h.01",
  rentabilite: "M4 20h16M6 16l4-5 3 3 5-7M15 7h3v3",
  comparer: "M9 4v16M15 4v16M4 8h5M4 12h5M4 16h5M15 8h5M15 12h5M15 16h5",
  recherche: "M4 6h16M7 12h10M10 18h4",
  guide: "M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17ZM5 19.5A2.5 2.5 0 0 1 7.5 17H20",
  compte: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
  plus: "M5 12h.01M12 12h.01M19 12h.01",
  fermer: "M6 6l12 12M18 6 6 18",
  sortie: "M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10",
  site: "M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4",
  lien: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
};

export function Ico({ nom, className = "size-5" }: { nom: keyof typeof TRACES; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={TRACES[nom]} />
    </svg>
  );
}
