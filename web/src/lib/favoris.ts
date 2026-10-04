/* Favoris : une voiture à revoir plus tard, sans l'ajouter au parc. La clé est le lien de l'annonce quand il existe,
   pour qu'une même voiture vue dans la recherche, une alerte ou un rapport ne soit gardée qu'une fois. */
export type CoteFavori = { P: number | null; ecart: number | null; pct: number | null };
export type NouveauFavori = {
  cle: string; titre: string; prix: number | null; annee: number | null; km: number | null; energie: string | null; boite: string | null;
  lieu: string | null; url: string | null; photo: string | null; cote: CoteFavori | null; source: "recherche" | "alerte" | "rapport"; rapport_id?: string | null;
};
export type Favori = NouveauFavori & { id: string; note: string | null; created_at: string };

export const COLONNES_FAVORI = "id, cle, titre, prix, annee, km, energie, boite, lieu, url, photo, cote, source, rapport_id, note, created_at";
export const cleFavori = (url: string | null | undefined, repli: string) => (url && /^https:\/\//.test(url) ? url.split("?")[0].slice(0, 300) : repli.slice(0, 300));
