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
  // fiche complète (comme l'outil Garage)
  finition?: string | null;
  annee?: number | null;
  km?: number | null;
  energie?: string | null;
  boite?: string | null;
  premiere_immat?: string | null;
  cv?: number | null;
  couleur?: string | null;
  vin?: string | null;
  localisation?: string | null;
  lien?: string | null;
  structure?: Structure;
  commission?: number | null;
  prix_conseille?: number | null;
  note_qualite?: "A" | "B" | "C" | "D" | null;
  ct_date?: string | null;
  vendeur_nom?: string | null;
  vendeur_tel?: string | null;
  frais_detail?: Frais[];
  docs?: Record<string, boolean>;
  photos?: string[];
};

export type Structure = "achat" | "paiement_revente" | "mandat" | "depot" | "intermediation";
export type Frais = { cat: string; label: string; montant: number };

export const STRUCTURES: Record<Structure, string> = {
  achat: "Achat direct",
  paiement_revente: "Paiement à la revente",
  mandat: "Mandat de vente",
  depot: "Dépôt-vente",
  intermediation: "Intermédiation / apport",
};
export const FRAIS_CAT: Record<string, string> = {
  reparation: "Réparation",
  preparation: "Préparation / esthétique",
  consommables: "Consommables",
  ct: "Contrôle technique",
  admin: "Carte grise / admin",
  transport: "Transport / déplacement",
  pub: "Publicité",
  autre: "Autre",
};
/** Papiers à réunir avant de vendre. */
export const DOCS_VENTE: [string, string][] = [
  ["carte_grise", "Carte grise"],
  ["ct", "CT de moins de 6 mois"],
  ["csa", "Non-gage de moins de 15 jours"],
  ["histovec", "Rapport HistoVec"],
  ["cession", "Cerfa de cession"],
];
export const NOTES_QUALITE: Record<string, string> = { A: "A, très bon", B: "B, bon", C: "C, moyen", D: "D, risqué" };

/** Total des frais : somme du détail s'il existe, sinon le montant saisi. */
export const totalFrais = (v: Pick<Vehicule, "frais" | "frais_detail">) => (v.frais_detail?.length ? v.frais_detail.reduce((s, f) => s + (Number(f.montant) || 0), 0) : v.frais || 0);

export const STATUTS_PARC: Record<Vehicule["statut"], string> = {
  repere: "Repérée",
  achete: "Achetée",
  preparation: "En préparation",
  en_vente: "En vente",
  vendu: "Vendue",
  abandonne: "Abandonnée",
};

export const EN_STOCK: Vehicule["statut"][] = ["achete", "preparation", "en_vente"];

const sansAchat = (v: Vehicule) => v.structure === "mandat" || v.structure === "depot" || v.structure === "intermediation";
/** Marge réelle d'une voiture vendue : vente − achat − frais, ou commission − frais pour un mandat, un dépôt-vente ou une intermédiation. */
export const margeReelle = (v: Vehicule) =>
  v.statut !== "vendu" ? null : sansAchat(v) ? (v.commission != null ? v.commission - (v.frais || 0) : null) : v.prix_vente != null && v.prix_achat != null ? v.prix_vente - v.prix_achat - (v.frais || 0) : null;
/** Marge prévue (avant la vente) : prix conseillé − achat − frais. */
export const margePrevue = (v: Vehicule) =>
  v.statut === "vendu" ? null : sansAchat(v) ? (v.commission != null ? v.commission - (v.frais || 0) : null) : v.prix_conseille != null && v.prix_achat != null ? v.prix_conseille - v.prix_achat - (v.frais || 0) : null;
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
