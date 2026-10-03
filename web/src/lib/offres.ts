/* Formules et droits. Une seule source de vérité : pages tarifs, quotas, filtrage serveur des résultats.
   Les prix Stripe sont retrouvés par leur « lookup key » (stripe/prix.mjs les crée). */

export type Famille = "particulier" | "benef";
export type OffreId = "gratuit" | "essentiel" | "serenite" | "starter" | "croissance" | "pro";
/** Niveau de détail d'une analyse particulier. */
export type Detail = "simple" | "detail" | "complet";

export type Offre = {
  id: OffreId;
  famille: Famille;
  nom: string;
  prix: number; // € par mois, 0 = gratuit
  accroche: string;
  pour: string;
  /** Analyses autorisées : par mois, ou au total pour la formule gratuite. */
  analyses: number;
  parMois: boolean;
  photos: number;
  detail: Detail;
  historique: number; // nombre de rapports conservés et visibles (Infinity = tous)
  tableauDeBord: "aucun" | "simple" | "complet";
  parc: boolean;
  recherche: boolean;
  comparateur: boolean;
  guide: boolean;
  lookup: string | null;
  points: string[];
  bientot?: string[];
  miseEnAvant?: boolean;
};

export const OFFRES: Record<OffreId, Offre> = {
  gratuit: {
    id: "gratuit", famille: "particulier", nom: "Découverte", prix: 0,
    accroche: "Pour vérifier une annonce", pour: "Vous avez une voiture en vue et voulez un avis rapide.",
    analyses: 1, parMois: false, photos: 0, detail: "simple", historique: 1, tableauDeBord: "aucun",
    parc: false, recherche: false, comparateur: false, guide: false, lookup: null,
    points: ["1 analyse complète, présentée simplement", "Verdict clair : bonne affaire ou pas", "Coût réel d'achat : prix, carte grise, trajet, CT, petites réparations", "Les 3 points à vérifier en priorité"],
  },
  essentiel: {
    id: "essentiel", famille: "particulier", nom: "Essentiel", prix: 4.99,
    accroche: "Pour comparer plusieurs annonces", pour: "Vous hésitez entre plusieurs voitures.",
    analyses: 10, parMois: true, photos: 3, detail: "detail", historique: 30, tableauDeBord: "aucun",
    parc: false, recherche: false, comparateur: false, guide: false, lookup: "utp_essentiel_mois",
    points: ["10 analyses par mois", "Prix raisonnable à proposer", "Questions à poser au vendeur", "Prix du marché détaillé et fiabilité du moteur", "Analyse de 3 photos par annonce", "Historique de vos analyses"],
    miseEnAvant: true,
  },
  serenite: {
    id: "serenite", famille: "particulier", nom: "Sérénité", prix: 9.99,
    accroche: "Pour acheter l'esprit tranquille", pour: "Vous voulez être accompagné jusqu'à la signature.",
    analyses: 30, parMois: true, photos: 6, detail: "complet", historique: Infinity, tableauDeBord: "aucun",
    parc: false, recherche: false, comparateur: false, guide: true, lookup: "utp_serenite_mois",
    points: ["30 analyses par mois", "Tout Essentiel, plus :", "Comment négocier, avec vos arguments chiffrés", "Ce qu'il faut contrôler sur place, point par point", "Faut-il y aller seul ou accompagné", "Analyse de 6 photos par annonce", "Le guide « Acheter sans se faire avoir » inclus"],
  },
  starter: {
    id: "starter", famille: "benef", nom: "Starter", prix: 14.99,
    accroche: "Pour vos premières voitures", pour: "Vous vous lancez dans l'achat-revente.",
    analyses: 30, parMois: true, photos: 3, detail: "complet", historique: 20, tableauDeBord: "simple",
    parc: false, recherche: false, comparateur: false, guide: true, lookup: "utp_starter_mois",
    points: ["30 analyses de véhicule par mois", "Marge nette, prix d'offre et plafond", "Historique de vos 20 derniers rapports", "Tableau de bord", "Le guide « Votre première revente » inclus"],
  },
  croissance: {
    id: "croissance", famille: "benef", nom: "Croissance", prix: 29,
    accroche: "Pour passer à plusieurs voitures par mois", pour: "Vous achetez et revendez régulièrement.",
    analyses: 100, parMois: true, photos: 6, detail: "complet", historique: Infinity, tableauDeBord: "simple",
    parc: false, recherche: false, comparateur: true, guide: true, lookup: "utp_croissance_mois",
    points: ["100 analyses par mois", "Tout Starter, plus :", "Historique complet des rapports", "Comparateur de 2 à 3 rapports côte à côte", "Analyse de 6 photos par annonce", "Tous les guides inclus"],
    miseEnAvant: true,
  },
  pro: {
    id: "pro", famille: "benef", nom: "Pro", prix: 59,
    accroche: "Pour les professionnels en activité", pour: "Vous gérez un stock et suivez vos chiffres.",
    analyses: 400, parMois: true, photos: 6, detail: "complet", historique: Infinity, tableauDeBord: "complet",
    parc: true, recherche: true, comparateur: true, guide: true, lookup: "utp_pro_mois",
    points: ["400 analyses par mois", "Tout Croissance, plus :", "Tableau de bord complet : marges, stock, rotation", "Gestion du parc : achats, frais, ventes, marge réelle", "Recherche avancée dans tous vos rapports", "Rapports détaillés et export CSV"],
    bientot: ["Recherches suivies sur Leboncoin"],
  },
};

export const GUIDE = { lookup: "utp_guide", prix: 9, nom: "Les guides Utopicar" };

export const PARTICULIERS: OffreId[] = ["gratuit", "essentiel", "serenite"];
export const BENEF: OffreId[] = ["starter", "croissance", "pro"];

export const offre = (id: string | null | undefined): Offre => OFFRES[(id as OffreId) in OFFRES ? (id as OffreId) : "gratuit"];
export const estPayante = (id: string | null | undefined) => offre(id).prix > 0;
export const prixTxt = (p: number) => (p === 0 ? "0\u00a0€" : `${p.toLocaleString("fr-FR", { minimumFractionDigits: p % 1 ? 2 : 0 })}\u00a0€`);

/** Statuts Stripe qui donnent accès. */
export const STATUTS_ACTIFS = ["active", "trialing", "past_due"];
