/* Profil d'analyse : ce que la personne veut faire de la voiture, et ce qu'elle accepte.
   Il ne juge jamais la voiture « hors cible » : il change l'ordre des priorités, le seuil de bénéfice et les délais.
   Rempli par le questionnaire de la première analyse, modifiable dans Profil › Mon profil d'analyse (profils.reglages.analyse). */
import * as z from "zod/v4";
import type { Famille } from "../offres";
import type { ParamsPro } from "./couts";

export type Objectif = "usage" | "revente" | "mixte";
export type Experience = "debutant" | "habitue" | "pro";
export type Tolerance = "aucun" | "petits" | "gros";
export type Delai = "rapide" | "normal" | "patient";

export const ProfilSchema = z.object({
  objectif: z.enum(["usage", "revente", "mixte"]),
  experience: z.enum(["debutant", "habitue", "pro"]),
  travaux: z.enum(["aucun", "petits", "gros"]),
  /** Revente : bénéfice net minimum par voiture (€). */
  margeMin: z.number().min(0).max(50000),
  /** Revente : bénéfice minimum en % du prix d'achat ; le plus élevé des deux fait foi (0 : pas de règle en %). */
  margePct: z.number().min(0).max(50),
  delai: z.enum(["rapide", "normal", "patient"]),
  /** Usage : kilomètres parcourus par an. */
  kmAn: z.number().min(0).max(150000),
  /** Budget d'achat maximum (0 : non précisé). Information seulement : il ne change jamais la note. */
  budget: z.number().min(0).max(1000000),
  ville: z.string().trim().max(80),
  tarifCV: z.number().min(0).max(100),
  kmCost: z.number().min(0).max(3),
  /** Frais par voiture revendue : CT, nettoyage, photos, annonce. */
  fraisFixes: z.number().min(0).max(5000),
  /** Négociant (déclaration d'achat) : pas de carte grise à son nom à chaque achat. */
  negociant: z.boolean(),
  rempli: z.boolean(),
});
export type ProfilAnalyse = z.infer<typeof ProfilSchema>;

const COMMUN = { margeMin: 750, margePct: 0, delai: "normal" as Delai, kmAn: 12000, budget: 0, ville: "", tarifCV: 68.95, kmCost: 0.2, fraisFixes: 150, negociant: false, rempli: false };

/** Profil par défaut tant que le questionnaire n'est pas rempli : celui de l'espace (particulier ou Benef). */
export function profilParDefaut(famille: Famille | null | undefined, ville = ""): ProfilAnalyse {
  return famille === "benef"
    ? { ...COMMUN, objectif: "revente", experience: "habitue", travaux: "petits", kmCost: 0.25, ville }
    : { ...COMMUN, objectif: "usage", experience: "debutant", travaux: "petits", ville };
}

/** Profil enregistré (lu avec tolérance : un champ manquant prend la valeur par défaut de l'espace). */
export function lireProfilAnalyse(brut: unknown, famille: Famille | null | undefined, ville = ""): ProfilAnalyse {
  const defaut = profilParDefaut(famille, ville);
  if (!brut || typeof brut !== "object") return defaut;
  const fusion = { ...defaut, ...(brut as Record<string, unknown>) };
  const r = ProfilSchema.safeParse(fusion);
  if (r.success) return { ...r.data, ville: r.data.ville || ville };
  // champ invalide : on garde ceux qui passent un par un
  const out: Record<string, unknown> = { ...defaut };
  for (const [k, v] of Object.entries(brut as Record<string, unknown>)) {
    const champ = (ProfilSchema.shape as Record<string, z.ZodType>)[k];
    if (champ?.safeParse(v).success) out[k] = v;
  }
  return out as ProfilAnalyse;
}

export const revend = (p: Pick<ProfilAnalyse, "objectif">) => p.objectif !== "usage";

/** Bénéfice minimum pour ce prix d'achat : le montant, ou le pourcentage s'il est plus élevé. */
export const seuilMarge = (p: Pick<ProfilAnalyse, "margeMin" | "margePct">, prix: number | null) => Math.round(Math.max(p.margeMin, prix != null && p.margePct > 0 ? (prix * p.margePct) / 100 : 0));

export const LIBELLES = {
  objectif: { usage: "Pour rouler avec", revente: "Pour la revendre", mixte: "Rouler, puis revendre" } as Record<Objectif, string>,
  experience: { debutant: "Je débute", habitue: "J'ai l'habitude", pro: "C'est mon métier" } as Record<Experience, string>,
  travaux: { aucun: "Aucun travaux", petits: "Petits travaux", gros: "Même les gros travaux" } as Record<Tolerance, string>,
  delai: { rapide: "en 2 à 3 semaines", normal: "en 1 à 2 mois", patient: "sans être pressé" } as Record<Delai, string>,
};

const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;

/** Résumé en une ligne (« Pour la revendre · bénéfice d'au moins 750 € · en 1 à 2 mois »). */
export function resumeProfil(p: ProfilAnalyse) {
  const l = [LIBELLES.objectif[p.objectif]];
  if (revend(p)) l.push(`bénéfice d'au moins ${eur(p.margeMin)}${p.margePct ? ` ou ${p.margePct} %` : ""}`, LIBELLES.delai[p.delai]);
  else l.push(`${Math.round(p.kmAn / 1000)} 000 km par an`);
  l.push(p.travaux === "aucun" ? "sans travaux" : p.travaux === "petits" ? "petits travaux acceptés" : "gros travaux acceptés");
  if (p.budget) l.push(`budget ${eur(p.budget)}`);
  return l.join(" · ");
}

/** Réglages de calcul des écrans Benef (graphique des marges, tri) tirés du profil. */
export const paramsPro = (p: ProfilAnalyse): ParamsPro => ({ margeMin: p.margeMin, tarifCV: p.tarifCV, kmCost: p.kmCost, fraisFixes: p.fraisFixes, ville: p.ville || "Paris" });
