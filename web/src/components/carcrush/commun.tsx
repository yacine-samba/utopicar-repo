"use client";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { COULEURS, eur, kmTxt, VERDICTS, type Criteres, type Verdict } from "@/lib/carcrush";
import type { CatMarque } from "@/lib/vehicules/types";

export type Etape = "accueil" | "voiture" | "budget" | "details" | "recap" | "pile" | "vide" | "favoris";

/** Bouton à choix (pastille) : état annoncé aux lecteurs d'écran par aria-pressed. */
export function Choix({ actif, onClick, children, className }: { actif: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[15px] font-semibold transition",
        actif ? "border-o bg-o/15 text-ink" : "border-line-2 bg-glass text-ink hover:border-o/50",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Titre de groupe de choix (légende de fieldset). */
export function Legende({ children }: { children: ReactNode }) {
  return <legend className="mb-2.5 text-[13px] font-bold text-ink-3">{children}</legend>;
}

const TONS = {
  ok: "border-ok/45 text-ok",
  o: "border-o/60 text-o2",
  warn: "border-warn/50 text-warn",
  bad: "border-bad/50 text-bad",
};

export function PastilleVerdict({ v, className }: { v: Verdict; className?: string }) {
  const d = VERDICTS[v];
  return <span className={cx("inline-flex items-center rounded-full border bg-bg0/75 px-3 py-0.5 text-[13px] font-bold backdrop-blur", TONS[d.ton], className)}>{d.l}</span>;
}

export function EcartCote({ cote }: { cote: { ecart: number | null; source?: "utopicar" | "leboncoin" } | null }) {
  if (!cote || cote.ecart == null) return <span className="text-ink-3">Ni cote ni estimation pour cette annonce</span>;
  const sous = cote.ecart >= 0;
  return (
    <span className={cx("inline-flex items-center gap-1.5 font-bold", sous ? "text-ok" : "text-o2")}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={sous ? "M12 5v14M6 13l6 6 6-6" : "M12 19V5M6 11l6-6 6 6"} />
      </svg>
      {/* sans cote Utopicar : l'estimation de Leboncoin, nommée comme telle */}
      {cote.source === "leboncoin"
        ? sous ? `${eur(cote.ecart)} sous l'estimation Leboncoin` : `${eur(-cote.ecart)} au-dessus de l'estimation Leboncoin`
        : sous ? `${eur(cote.ecart)} sous la cote` : `${eur(-cote.ecart)} au-dessus de la cote`}
    </span>
  );
}

export const Coeur = ({ className = "size-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.2 0 3.6 1.2 5.2 3 1.6-1.8 3-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
  </svg>
);
export const Croix = ({ className = "size-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const Fleche = ({ className = "size-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const Externe = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);

/** Photo de l'annonce, ou le symbole Utopicar quand l'annonce n'en a pas. `className` la positionne (absolute ou relative). */
export function PhotoAnnonce({ src, className }: { src: string | null; className?: string }) {
  return (
    <div className={cx("grid place-items-center overflow-hidden bg-[#2a2019]", className)}>
      {src ? (
        // vignettes Leboncoin : domaine externe, pas d'optimisation Next
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" draggable={false} />
      ) : (
        <svg viewBox="282 812 1370 305" className="w-1/2 text-ink/80" aria-hidden="true">
          <path d="M292 1102 C380 1020 500 975 628 970 C760 880 880 828 1030 828 C1160 828 1280 868 1393 912 L1277 972 C1100 1000 880 1015 700 1017 C560 1019 450 1040 388 1102 Z" fill="currentColor" />
          <path d="M1102 1102 L1297 1102 L1640 830 L1425 862 L1503 896 Z" fill="#ff5a1f" />
        </svg>
      )}
    </div>
  );
}

const ENERGIES: Record<string, string> = { essence: "Essence", diesel: "Diesel", hybride: "Hybride", electrique: "Électrique", gpl: "GPL" };

/** Libellé lisible de chaque critère actif, avec l'étape où il se modifie. */
export function libelles(c: Criteres, cat: CatMarque[] | null): { k: keyof Criteres; label: string; valeur: string; etape: Etape }[] {
  const marque = cat?.find((b) => b.k === c.marque);
  const modele = marque?.m.find((m) => m.k === c.modele);
  const gen = modele?.g.find((g) => g.id === c.gen);
  const phase = gen?.ph?.find((p) => p.id === c.phase);
  const out: { k: keyof Criteres; label: string; valeur: string; etape: Etape }[] = [];
  if (c.marque && c.modele) out.push({ k: "modele", label: "Modèle", valeur: `${marque?.n ?? c.marque} ${modele?.n ?? c.modele}`, etape: "voiture" });
  if (c.gen) out.push({ k: "gen", label: "Génération", valeur: gen ? `${gen.l} (${gen.y0} – ${gen.y1})` : c.gen, etape: "voiture" });
  if (c.phase) out.push({ k: "phase", label: "Phase", valeur: phase?.l ?? c.phase, etape: "voiture" });
  if (c.finition.trim()) out.push({ k: "finition", label: "Version ou finition", valeur: c.finition.trim(), etape: "voiture" });
  if (c.prixMax != null) out.push({ k: "prixMax", label: "Budget maximum", valeur: eur(c.prixMax), etape: "budget" });
  if (c.kmMax != null) out.push({ k: "kmMax", label: "Kilométrage maximum", valeur: kmTxt(c.kmMax), etape: "budget" });
  if (c.anneeMin != null) out.push({ k: "anneeMin", label: "Année minimum", valeur: String(c.anneeMin), etape: "budget" });
  if (c.dep.trim()) out.push({ k: "dep", label: "Départements", valeur: c.dep.trim(), etape: "budget" });
  if (c.energie) out.push({ k: "energie", label: "Énergie", valeur: ENERGIES[c.energie], etape: "details" });
  if (c.boite) out.push({ k: "boite", label: "Boîte", valeur: c.boite === "auto" ? "Automatique" : "Manuelle", etape: "details" });
  if (c.portes) out.push({ k: "portes", label: "Portes", valeur: `${c.portes} portes`, etape: "details" });
  if (c.couleur) out.push({ k: "couleur", label: "Couleur", valeur: COULEURS.find((x) => x.id === c.couleur)?.l ?? c.couleur, etape: "details" });
  if (c.vendeur) out.push({ k: "vendeur", label: "Vendeur", valeur: c.vendeur === "pro" ? "Professionnel" : "Particulier", etape: "details" });
  return out;
}

/** Critères qu'on peut encore ajouter depuis le récapitulatif. */
export const AJOUTS: { k: keyof Criteres; label: string; etape: Etape }[] = [
  { k: "gen", label: "Génération", etape: "voiture" },
  { k: "finition", label: "Version ou finition", etape: "voiture" },
  { k: "prixMax", label: "Budget", etape: "budget" },
  { k: "kmMax", label: "Kilométrage", etape: "budget" },
  { k: "anneeMin", label: "Année minimum", etape: "budget" },
  { k: "dep", label: "Départements", etape: "budget" },
  { k: "energie", label: "Énergie", etape: "details" },
  { k: "boite", label: "Boîte", etape: "details" },
  { k: "portes", label: "Portes", etape: "details" },
  { k: "couleur", label: "Couleur", etape: "details" },
  { k: "vendeur", label: "Vendeur", etape: "details" },
];

export { ENERGIES };
