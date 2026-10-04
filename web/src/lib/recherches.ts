/* Recherches du marché enregistrées : une par véhicule (marque, modèle, génération), avec ses derniers filtres.
   « active » : ouverte en onglet sur la page Recherche ; les autres restent dans l'historique. */
import type { Choix } from "@/components/marche/ChoixVehicule";

export type FiltresRecherche = { energie: string; boite: string; anneeMin: string; anneeMax: string; prixMin: string; prixMax: string; kmMax: string; vendeur: string; mots: string; exclure: string; sousCote: string; fiables: boolean; tri: string };
export type Meilleure = { titre: string; prix: number; ecart: number; pct: number; url: string | null };
export type Recherche = {
  id: string; nom: string; active: boolean; criteres: { choix: Choix; f: FiltresRecherche };
  trouvees: number | null; sous_cote: number | null; meilleure: Meilleure | null; derniere_le: string;
};

export const FILTRES_VIDES: FiltresRecherche = { energie: "", boite: "", anneeMin: "", anneeMax: "", prixMin: "", prixMax: "", kmMax: "", vendeur: "", mots: "", exclure: "", sousCote: "", fiables: true, tri: "ecart" };
export const COLONNES_RECHERCHE = "id, nom, active, criteres, trouvees, sous_cote, meilleure, derniere_le";
export const MAX_ONGLETS = 8;

/** Une recherche par véhicule : changer les filtres met à jour la même recherche, changer de voiture en ouvre une autre. */
export const cleRecherche = (c: Choix) => `${c.marque}|${c.modele}|${c.gen || "*"}`.slice(0, 120);

const eur = (s: string) => `${Number(s).toLocaleString("fr-FR")} €`;

/** Résumé court des filtres, pour les onglets et le tableau de bord. */
export function resumeFiltres(f: Partial<FiltresRecherche>) {
  return [
    f.energie, f.boite === "auto" ? "automatique" : f.boite,
    f.anneeMin || f.anneeMax ? `${f.anneeMin || "…"} – ${f.anneeMax || "…"}` : "",
    f.prixMax ? `≤ ${eur(f.prixMax)}` : "", f.kmMax ? `≤ ${Number(f.kmMax).toLocaleString("fr-FR")} km` : "",
    f.vendeur === "pro" ? "pros" : f.vendeur === "particulier" ? "particuliers" : "",
    f.mots ? `« ${f.mots} »` : "", f.sousCote ? `${f.sousCote} % sous la cote` : "",
  ].filter(Boolean).join(" · ");
}

export function quandRecherche(d: string) {
  const ms = Date.now() - new Date(d).getTime();
  if (ms < 60 * 60000) return `il y a ${Math.max(1, Math.round(ms / 60000))} min`;
  if (ms < 24 * 3600000) return `il y a ${Math.round(ms / 3600000)} h`;
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
