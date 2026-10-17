/* Formules et droits. Une seule source de vérité : pages tarifs, quotas, filtrage serveur des résultats.
   Les prix Stripe sont retrouvés par leur « lookup key » (stripe/prix.mjs les crée). */

export type Famille = "particulier" | "benef";
export type OffreId = "gratuit" | "essentiel" | "serenite" | "starter" | "croissance" | "pro" | "pro_messages";
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
  /** Formule dont elle a tous les droits (Pro + Messages : ceux de Pro, la base fait la même équivalence). */
  base?: OffreId;
  /** Messages Leboncoin automatiques compris (sinon : option payante sur Pro). */
  messages?: boolean;
  /** Pastille de la carte (« Messages offerts »). */
  badge?: string;
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
    points: ["10 analyses par mois", "Prix raisonnable à proposer", "Questions à poser au vendeur", "Prix du marché détaillé et fiabilité du moteur", "Analyse de 3 photos par annonce", "Historique de vos analyses", "La cote détaillée de chaque modèle"],
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
    accroche: "Pour vous lancer dans l'achat-revente", pour: "Vous achetez et revendez vos premières voitures.",
    analyses: 30, parMois: true, photos: 3, detail: "complet", historique: Infinity, tableauDeBord: "simple",
    parc: false, recherche: false, comparateur: false, guide: true, lookup: "utp_starter_mois", miseEnAvant: true,
    points: ["30 analyses de véhicule par mois", "Marge nette, prix d'offre et prix à ne pas dépasser", "Fiabilité du moteur, travaux à prévoir et kilométrage", "Historique complet de vos rapports", "La cote détaillée de chaque modèle", "Les 3 guides Benef : première revente, tri des annonces, estimation de reprise"],
  },
  croissance: {
    id: "croissance", famille: "benef", nom: "Croissance", prix: 29, cachee: true,
    accroche: "Pour passer à plusieurs voitures par mois", pour: "Vous achetez et revendez régulièrement.",
    analyses: 100, parMois: true, photos: 6, detail: "complet", historique: Infinity, tableauDeBord: "simple",
    parc: false, recherche: false, comparateur: false, guide: true, lookup: "utp_croissance_mois",
    points: ["100 analyses par mois", "Tout Starter, plus :", "Analyse de 6 photos par annonce"],
  },
  pro: {
    id: "pro", famille: "benef", nom: "Pro", prix: 79,
    accroche: "Pour les professionnels en activité", pour: "Vous gérez un stock et suivez vos chiffres.",
    analyses: 400, parMois: true, photos: 6, detail: "complet", historique: Infinity, tableauDeBord: "complet",
    parc: true, recherche: true, comparateur: false, guide: true, lookup: "utp_pro_79", anciennesCles: ["utp_pro_mois"],
    points: ["400 analyses par mois", "Tout Starter, plus :", "Analyse de 6 photos par annonce, le montage du deal et les risques cachés", "Recherche dans les annonces Leboncoin : marque, modèle, génération, sous la cote", "Alertes e-mail sur vos recherches Leboncoin (3 recherches suivies)", "Cote du marché avec graphique", "Tableau de bord complet : marges, stock, rotation", "Gestion du parc : achats, frais, ventes, marge réelle", "Rapports détaillés et export CSV"],
  },
  // Variante de Pro, vendue comme une case à cocher sur la carte Pro (+5 €) : pas une carte à part
  pro_messages: {
    id: "pro_messages", famille: "benef", nom: "Pro + Messages", prix: 84,
    accroche: "Pour contacter les vendeurs avant les autres", pour: "Vous voulez être le premier sur chaque bonne affaire.",
    analyses: 400, parMois: true, photos: 6, detail: "complet", historique: Infinity, tableauDeBord: "complet",
    parc: true, recherche: true, comparateur: false, guide: true, lookup: "utp_pro_messages_84", base: "pro", messages: true,
    points: ["Tout Pro, plus :", "Messages Leboncoin automatiques aux vendeurs", "Un premier message aux vendeurs des annonces de vos recherches, une annonce à la fois", "Jamais deux fois la même annonce ; celles qui refusent le démarchage sont ignorées", "Boîte de réception des réponses", "Un seul abonnement, résiliable à tout moment"],
  },
};

/** Comptes illimités (profils.illimite) : tout Benef Pro, sans limite d'analyses. */
export const ILLIMITE: Offre = { ...OFFRES.pro, nom: "Illimité", prix: 0, analyses: Infinity, lookup: null, anciennesCles: undefined };

export const GUIDE = { lookup: "utp_guide", prix: 9, nom: "Les guides Utopicar" };

/** Option de Benef Pro : premier message automatique aux vendeurs Leboncoin et boîte de réception (acteur Apify à 29 $ par mois).
    Comprise dans la formule Pro + Messages. */
export const OPTION_MESSAGES = { lookup: "utp_option_messages_45", prix: 45, nom: "Messages Leboncoin" };

export const PARTICULIERS: OffreId[] = ["gratuit", "essentiel"];
/** En vente : Starter pour se lancer (conseillé), Pro pour trouver les affaires et gérer le stock ; la page Tarifs ajoute
    devant la carte Gratuit (analyse Benef offerte). Les messages automatiques se cochent sur Pro (VARIANTES). */
export const BENEF: OffreId[] = ["starter", "pro"];
/** Variante d'une formule proposée en case à cocher sur sa carte. */
export const VARIANTES: Partial<Record<OffreId, OffreId>> = { pro: "pro_messages" };

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

/** Garantie du premier mois d'abonnement : remboursé sur simple e-mail dans ce délai, sans justification.
    Affichée sur les tarifs, l'inscription, le paiement Stripe et dans les conditions de vente. null : plus de garantie nulle part. */
export const GARANTIE: { jours: number } | null = { jours: 14 };

/** Prix d'une analyse comprise dans la formule (0,50 € pour Essentiel). */
export const prixParAnalyse = (o: Offre) => (o.prix > 0 && o.analyses > 0 && Number.isFinite(o.analyses) ? o.prix / o.analyses : null);
export const centimes = (v: number) => `${v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\u00a0€`;

/** Quand les analyses sont épuisées : la formule à proposer (moins chère à l'analyse que les crédits), ou null au sommet. */
export function formuleSuivante(id: OffreId | string, famille: Famille): Offre | null {
  const suite: Partial<Record<string, OffreId>> = famille === "benef" ? { gratuit: "starter", essentiel: "starter", starter: "pro", croissance: "pro" } : { gratuit: "essentiel" };
  const s = suite[id];
  return s ? OFFRES[s] : null;
}

/** Statuts Stripe qui donnent accès. */
export const STATUTS_ACTIFS = ["active", "trialing", "past_due"];
