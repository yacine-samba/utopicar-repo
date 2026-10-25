import "server-only";
import { supabaseServeur } from "../supabase/serveur";
import { supabaseService } from "../supabase/service";
import type { Faits } from "./texte";
import { marqueModele, type Cote } from "./regles";
import { reconnaitre } from "../vehicules/moteur";

export { marcheDepuisCote, type Cote } from "./regles";

/** Cote de l'outil, sans IA : annonces comparables réellement en ligne (table marche_annonces, fonction SQL cote_marche). */
export async function coteMarche(texte: string, f: Faits): Promise<Cote | null> {
  // le catalogue reconnaît la voiture dans le titre ou le début du texte (« Vends ma belle 208 1.2 PureTech… ») ;
  // sinon, attributs de l'annonce ou deux premiers mots du titre
  const parTitre = reconnaitre({ titre: f.titre });
  const cat = parTitre.modele ? parTitre : reconnaitre({ titre: texte.slice(0, 300) });
  const { marque, modele } = cat.modele ? cat : marqueModele(texte, f);
  if (!modele || !f.annee) return null;
  // lecture serveur : la cote n'est pas ouverte en direct aux comptes ni aux visiteurs (elle l'est encore, le temps du
  // déploiement) ; sans clé de service (poste de développement), au nom de la personne
  const sb = process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseService() : await supabaseServeur();
  const { data, error } = await sb.rpc("cote_marche", { p_marque: marque, p_modele: modele, p_annee: f.annee, p_km: f.km, p_energie: f.energie || null });
  if (error) {
    console.error("cote_marche", error);
    return null;
  }
  const c = data as Cote | null;
  return c && c.n >= 5 ? c : null;
}
