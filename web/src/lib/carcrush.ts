import * as z from "zod/v4";

/* CarCrush : recherche d'annonces en swipe pour les particuliers (page /carcrush, non reliée au site).
   Règles partagées par la page et l'API : critères, coût en crédits, couleurs, verdict de prix. */

export const MAX_ANNONCES = 30;
export const MIN_CRITERES = 2;

export const COULEURS = [
  { id: "noir", l: "Noir", hex: "#141416", rx: /\b(noire?s?|black|nero|schwarz)\b/ },
  { id: "blanc", l: "Blanc", hex: "#eeece6", rx: /\b(blanche?s?|white|bianco|nacre)\b/ },
  { id: "gris", l: "Gris", hex: "#6e7378", rx: /\b(grise?s?|anthracite|grey|gray|graphite)\b/ },
  { id: "argent", l: "Argent", hex: "#b7babd", rx: /\b(argente?e?s?|silver|alu)\b/ },
  { id: "bleu", l: "Bleu", hex: "#2a5baf", rx: /\b(bleue?s?|blue|blu|marine)\b/ },
  { id: "rouge", l: "Rouge", hex: "#b3261e", rx: /\b(rouges?|red|rosso|bordeaux)\b/ },
  { id: "vert", l: "Vert", hex: "#2f6b3f", rx: /\b(verte?s?|green|kaki)\b/ },
  { id: "jaune", l: "Jaune ou orange", hex: "#e0a526", rx: /\b(jaunes?|yellow|orange)\b/ },
  { id: "marron", l: "Marron ou beige", hex: "#8a6a4a", rx: /\b(marron|brun|beige|bronze|champagne)\b/ },
] as const;
export type CouleurId = (typeof COULEURS)[number]["id"];

export const Criteres = z.object({
  marque: z.string().min(1).max(40),
  modele: z.string().min(1).max(60),
  gen: z.string().max(20).default(""),
  phase: z.string().max(4).default(""),
  finition: z.string().max(40).default(""),
  prixMax: z.number().int().min(500).max(300000).nullable().default(null),
  kmMax: z.number().int().min(1000).max(900000).nullable().default(null),
  anneeMin: z.number().int().min(1980).max(2035).nullable().default(null),
  energie: z.enum(["", "essence", "diesel", "hybride", "electrique", "gpl"]).default(""),
  boite: z.enum(["", "manuelle", "auto"]).default(""),
  portes: z.enum(["", "3", "5"]).default(""),
  couleur: z.enum(["", ...COULEURS.map((c) => c.id)] as [string, ...string[]]).default(""),
  vendeur: z.enum(["", "particulier", "pro"]).default(""),
  dep: z.string().max(60).default(""),
});
export type Criteres = z.infer<typeof Criteres>;

export const CRITERES_VIDES: Criteres = {
  marque: "", modele: "", gen: "", phase: "", finition: "", prixMax: null, kmMax: null, anneeMin: null,
  energie: "", boite: "", portes: "", couleur: "", vendeur: "", dep: "",
};

/** Clés comptées comme critères (le modèle en est un, obligatoire). */
export const CLES: (keyof Criteres)[] = ["modele", "gen", "phase", "finition", "prixMax", "kmMax", "anneeMin", "energie", "boite", "portes", "couleur", "vendeur", "dep"];

export const actif = (c: Criteres, k: keyof Criteres) => {
  if (k === "modele") return !!c.marque && !!c.modele;
  const v = c[k];
  return typeof v === "string" ? v.trim() !== "" : v != null;
};

export const nbCriteres = (c: Criteres) => CLES.filter((k) => actif(c, k)).length;

/** 2 à 3 critères : 1 crédit ; 4 à 6 : 2 crédits ; 7 et plus : 3 crédits. 0 sous le minimum. */
export const coutRecherche = (nb: number) => (nb < MIN_CRITERES ? 0 : nb <= 3 ? 1 : nb <= 6 ? 2 : 3);

export const PALIERS = [
  { cout: 1, l: "2 à 3 critères" },
  { cout: 2, l: "4 à 6 critères" },
  { cout: 3, l: "7 critères et plus" },
];

export const credits = (n: number) => `${n} crédit${n > 1 ? "s" : ""}`;

/** Verdict de prix d'une annonce, d'après son écart à la cote Utopicar ou à l'estimation Leboncoin (le vocabulaire des analyses). */
export type Verdict = "excellente" | "bonne" | "negocier" | "creuser" | "eviter";
export const VERDICTS: Record<Verdict, { l: string; ton: "ok" | "o" | "warn" | "bad" }> = {
  excellente: { l: "Très bonne affaire", ton: "ok" },
  bonne: { l: "Bonne affaire", ton: "ok" },
  negocier: { l: "À négocier", ton: "o" },
  creuser: { l: "À creuser", ton: "warn" },
  eviter: { l: "Trop chère", ton: "bad" },
};

export function verdictPrix(pct: number | null | undefined, douteux: boolean): Verdict {
  // plus de 45 % sous la cote, annonce piège, ou pas de cote : à vérifier avant tout
  if (douteux || pct == null || pct > 0.45) return "creuser";
  if (pct >= 0.12) return "excellente";
  if (pct >= 0.03) return "bonne";
  if (pct >= -0.1) return "negocier";
  return "eviter";
}

/** Annonce telle qu'elle est proposée dans la pile. */
export type AnnonceCC = {
  id: string; titre: string; prix: number; annee: number | null; km: number | null; ch: number | null; energie: string | null; boite: string | null;
  pro: boolean; lieu: string | null; url: string | null; photo: string | null; gen: string;
  /** source : la cote Utopicar (annonces comparables), ou à défaut l'estimation de prix que Leboncoin affiche sur l'annonce */
  cote: { P: number; ecart: number | null; pct: number | null; conf: "forte" | "moyenne" | "faible"; source?: "utopicar" | "leboncoin" } | null;
  verdict: Verdict;
};

export const eur = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/ /g, " ")} €`;
export const kmTxt = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/ /g, " ")} km`;
