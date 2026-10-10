/* Historique d'une annonce dans la base du marché (fonction SQL historique_annonce) : date de publication, prix vus
   au fil des relevés, et la même voiture (même année, même kilométrage exact, même modèle) vue sous un autre numéro. */

export type Historique = {
  publie_le: string | null;
  premiere_vue: string | null;
  derniere_vue: string | null;
  prix: { prix: number; le: string }[];
  autres: { id: string; prix: number | null; lieu: string | null; vu_le: string | null; publie_le: string | null }[];
};

/** Numéro d'une annonce Leboncoin dans son lien (…/ad/voitures/1234567890), sinon null. */
export const numeroLeboncoin = (lien: string | null | undefined) => lien?.match(/leboncoin\.fr\/(?:ad\/[^/]+|[^/]+)\/(\d{6,14})/)?.[1] ?? lien?.match(/leboncoin\.fr\/.*?(\d{8,14})(?:\.htm|\b)/)?.[1] ?? null;

const jours = (d: string | null | undefined) => (d ? Math.max(0, Math.round((Date.now() - Date.parse(d)) / 86400000)) : null);

/** Lecture pour le rapport : depuis combien de jours, combien de baisses, de combien. */
export function lireHistorique(h: Historique | null | undefined, prixActuel: number | null) {
  if (!h) return null;
  const enLigne = jours(h.publie_le ?? h.premiere_vue);
  const prix = [...(h.prix ?? [])].filter((x) => x.prix > 0).sort((a, b) => a.le.localeCompare(b.le));
  const serie = prixActuel != null && prix.length && prix[prix.length - 1].prix !== prixActuel ? [...prix, { prix: prixActuel, le: new Date().toISOString() }] : prix;
  let baisses = 0;
  for (let i = 1; i < serie.length; i++) if (serie[i].prix < serie[i - 1].prix) baisses++;
  const initial = serie[0]?.prix ?? null;
  const baisse = initial != null && prixActuel != null && prixActuel < initial ? initial - prixActuel : 0;
  const autres = (h.autres ?? []).filter((x) => x.id);
  if (enLigne == null && !serie.length && !autres.length) return null;
  return { enLigne, baisses, baisse, initial, serie, autres };
}
