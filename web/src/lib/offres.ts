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
  /** Formule retirée de la vente : plus affichée nulle part, mais encore reconnue pour un éventuel abonné. */
  cachee?: boolean;
  /** Anciennes clés de prix Stripe (changement de tarif), pour reconnaître les abonnements déjà pris. */
  anciennesCles?: string[];
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
    parc: false, recherche: false, comparateur: false, guide: true, lookup: "utp_serenite_mois", cachee: true,
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
    id: "pro", famille: "benef", nom: "Pro", prix: 79,
    accroche: "Pour les professionnels en activité", pour: "Vous gérez un stock et suivez vos chiffres.",
    analyses: 400, parMois: true, photos: 6, detail: "complet", historique: Infinity, tableauDeBord: "complet",
    parc: true, recherche: true, comparateur: true, guide: true, lookup: "utp_pro_79", anciennesCles: ["utp_pro_mois"],
    points: ["400 analyses par mois", "Tout Croissance, plus :", "Recherche dans les annonces Leboncoin : marque, modèle, génération, sous la cote", "Alertes e-mail sur vos recherches Leboncoin (3 recherches suivies)", "Cote du marché avec graphique", "Tableau de bord complet : marges, stock, rotation", "Gestion du parc : achats, frais, ventes, marge réelle", "Rapports détaillés et export CSV"],
  },
};

/** Comptes illimités (profils.illimite) : tout Benef Pro, sans limite d'analyses. */
export const ILLIMITE: Offre = { ...OFFRES.pro, nom: "Illimité", prix: 0, analyses: Infinity, lookup: null, anciennesCles: undefined };

export const GUIDE = { lookup: "utp_guide", prix: 9, nom: "Les guides Utopicar" };

export const PARTICULIERS: OffreId[] = ["gratuit", "essentiel"];
export const BENEF: OffreId[] = ["starter", "croissance", "pro"];

export const offre = (id: string | null | undefined): Offre => OFFRES[(id as OffreId) in OFFRES ? (id as OffreId) : "gratuit"];
export const estPayante = (id: string | null | undefined) => offre(id).prix > 0;
export const prixTxt = (p: number) => (p === 0 ? "0\u00a0€" : `${p.toLocaleString("fr-FR", { minimumFractionDigits: p % 1 ? 2 : 0 })}\u00a0€`);

/** Crédits d'analyse à l'unité, payés une fois, sans abonnement. Ils servent quand le quota de la formule est épuisé
    et restent valables 12 mois après le dernier achat. Sur la formule Découverte, une analyse payée par crédit
    a le niveau Essentiel (analyse détaillée, 3 photos). Toujours plus cher à l'unité qu'Essentiel, pour que l'abonnement reste le meilleur choix. */
export type PackId = "credits_1" | "credits_5" | "credits_15";
export type Pack = { id: PackId; nom: string; credits: number; prix: number; lookup: string; badge?: string };
export const PACKS: Pack[] = [
  { id: "credits_1", nom: "1 analyse", credits: 1, prix: 2.99, lookup: "utp_credits_1" },
  { id: "credits_5", nom: "Pack 5 analyses", credits: 5, prix: 9.99, lookup: "utp_credits_5", badge: "Conseillé" },
  { id: "credits_15", nom: "Pack 15 analyses", credits: 15, prix: 19.99, lookup: "utp_credits_15", badge: "Meilleur prix" },
];
export const pack = (id: string | null | undefined) => PACKS.find((p) => p.id === id) ?? null;
/** Ce qu'une analyse payée par crédit apporte au-dessus de la formule Découverte. */
export const NIVEAU_CREDIT = { detail: "detail" as Detail, photos: 3 };
export const prixUnite = (p: Pack) => p.prix / p.credits;

/** Statuts Stripe qui donnent accès. */
export const STATUTS_ACTIFS = ["active", "trialing", "past_due"];
