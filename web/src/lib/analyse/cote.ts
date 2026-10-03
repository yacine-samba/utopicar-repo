import "server-only";
import { supabaseServeur } from "../supabase/serveur";
import type { Faits } from "./texte";

/* Cote de l'outil, sans IA : annonces comparables réellement en ligne (table marche_annonces, fonction SQL cote_marche),
   prix ramenés à l'année et au kilométrage de la voiture. Les prix affichés se négocient en général d'environ 5 %. */
export type Cote = { n: number; p25: number; mediane: number; p75: number };

const champ = (texte: string, nom: string) => texte.match(new RegExp(`^\\s*-?\\s*${nom}\\s*:\\s*(.+)$`, "im"))?.[1].trim() ?? "";

/** Marque et modèle : attributs de l'annonce (« Marque : Peugeot », « Modèle : 208 »), sinon les deux premiers mots du titre. */
export function marqueModele(texte: string, f: Faits) {
  const mots = f.titre.split(/\s+/);
  return { marque: champ(texte, "Marque") || mots[0] || "", modele: champ(texte, "Mod[eè]le") || mots[1] || "" };
}

export async function coteMarche(texte: string, f: Faits): Promise<Cote | null> {
  const { marque, modele } = marqueModele(texte, f);
  if (!modele || !f.annee) return null;
  const { data, error } = await (await supabaseServeur()).rpc("cote_marche", { p_marque: marque, p_modele: modele, p_annee: f.annee, p_km: f.km, p_energie: f.energie || null });
  if (error) {
    console.error("cote_marche", error);
    return null;
  }
  const c = data as Cote | null;
  return c && c.n >= 5 ? c : null;
}

const arrondi = (v: number) => Math.round(v / 50) * 50;

/** Fourchette de marché affichée : la cote de l'outil remplace l'estimation de l'IA. */
export function marcheDepuisCote(c: Cote) {
  return {
    bas: arrondi(c.p25 * 0.95),
    realiste: arrondi(c.mediane * 0.95),
    haut: arrondi(c.p75),
    reventeRapide: arrondi(c.p25),
    confiance: c.n >= 20 ? "forte" : c.n >= 8 ? "moyenne" : "faible",
    commentaire: `Cote calculée sur ${c.n} annonces comparables en ligne (même modèle, ±2 ans, même énergie, kilométrage proche) : la moitié sont affichées entre ${c.p25.toLocaleString("fr-FR")} et ${c.p75.toLocaleString("fr-FR")} €. Les ventes se concluent en général environ 5 % sous le prix affiché.`,
  };
}
