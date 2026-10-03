export type Vehicule = {
  id: string;
  titre: string;
  immat: string | null;
  statut: "repere" | "achete" | "preparation" | "en_vente" | "vendu" | "abandonne";
  prix_achat: number | null;
  frais: number;
  prix_vente: number | null;
  date_achat: string | null;
  date_vente: string | null;
  notes: string | null;
  rapport_id: string | null;
  created_at: string;
};

export const STATUTS_PARC: Record<Vehicule["statut"], string> = {
  repere: "Repérée",
  achete: "Achetée",
  preparation: "En préparation",
  en_vente: "En vente",
  vendu: "Vendue",
  abandonne: "Abandonnée",
};

export const EN_STOCK: Vehicule["statut"][] = ["achete", "preparation", "en_vente"];

export const margeReelle = (v: Vehicule) => (v.statut === "vendu" && v.prix_vente != null && v.prix_achat != null ? v.prix_vente - v.prix_achat - (v.frais || 0) : null);
export const joursStock = (v: Vehicule) => {
  if (!v.date_achat) return null;
  const fin = v.statut === "vendu" && v.date_vente ? new Date(v.date_vente) : new Date();
  return Math.max(0, Math.round((fin.getTime() - new Date(v.date_achat).getTime()) / 86400000));
};

/** Chiffres du parc pour le tableau de bord. */
export function statsParc(liste: Vehicule[]) {
  const stock = liste.filter((v) => EN_STOCK.includes(v.statut));
  const vendus = liste.filter((v) => v.statut === "vendu");
  const marges = vendus.map(margeReelle).filter((x): x is number => x != null);
  const rot = vendus.map(joursStock).filter((x): x is number => x != null);
  const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const margeMois = vendus.filter((v) => v.date_vente && new Date(v.date_vente) >= debutMois).map(margeReelle).filter((x): x is number => x != null);
  return {
    enStock: stock.length,
    capital: stock.reduce((s, v) => s + (v.prix_achat ?? 0) + (v.frais || 0), 0),
    vendus: vendus.length,
    margeTotale: marges.reduce((s, x) => s + x, 0),
    margeMoyenne: marges.length ? Math.round(marges.reduce((s, x) => s + x, 0) / marges.length) : null,
    margeMois: margeMois.reduce((s, x) => s + x, 0),
    rotation: rot.length ? Math.round(rot.reduce((s, x) => s + x, 0) / rot.length) : null,
    plusVieux: stock.map(joursStock).filter((x): x is number => x != null).sort((a, b) => b - a)[0] ?? null,
  };
}
