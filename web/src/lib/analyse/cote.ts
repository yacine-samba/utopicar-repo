import "server-only";
import { supabaseServeur } from "../supabase/serveur";
import type { Faits } from "./texte";
import { marqueModele, type Cote } from "./regles";

export { marcheDepuisCote, type Cote } from "./regles";

/** Cote de l'outil, sans IA : annonces comparables réellement en ligne (table marche_annonces, fonction SQL cote_marche). */
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
