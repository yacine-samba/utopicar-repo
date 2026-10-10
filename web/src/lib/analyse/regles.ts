/* Analyse complète par les seules règles de l'outil, comme l'outil Garage : elle sert quand l'IA ne répond pas
   ou n'est pas configurée. Cote = annonces comparables (cote_marche) ; défauts, fiabilité et coûts = paramètres de l'outil. */
import type { Ia } from "./ia-schema";
import type { Faits } from "./texte";
import type { Fiabilite } from "./fiabilite";

export type Cote = { n: number; p25: number; mediane: number; p75: number };

const champ = (texte: string, nom: string) => texte.match(new RegExp(`^\\s*-?\\s*${nom}\\s*:\\s*(.+)$`, "im"))?.[1].trim() ?? "";

/** Marque et modèle : attributs de l'annonce (« Marque : Peugeot », « Modèle : 208 »), sinon les deux premiers mots du titre. */
export function marqueModele(texte: string, f: Faits) {
  const mots = f.titre.split(/\s+/);
  return { marque: champ(texte, "Marque") || mots[0] || "", modele: champ(texte, "Mod[eè]le") || mots[1] || "" };
}

const arrondi = (v: number) => Math.round(v / 50) * 50;
const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;

/** Fourchette de marché tirée de la cote de l'outil (prix affichés, ventes conclues environ 5 % en dessous). */
export function marcheDepuisCote(c: Cote): Ia["marche"] {
  return {
    bas: arrondi(c.p25 * 0.95),
    realiste: arrondi(c.mediane * 0.95),
    haut: arrondi(c.p75),
    reventeRapide: arrondi(c.p25),
    confiance: c.n >= 20 ? "forte" : c.n >= 8 ? "moyenne" : "faible",
    commentaire: `Cote calculée sur ${c.n} annonces comparables en ligne (même modèle, ±2 ans, même énergie, kilométrage proche) : la moitié sont affichées entre ${eur(c.p25)} et ${eur(c.p75)}. Les ventes se concluent en général environ 5 % sous le prix affiché.`,
  };
}

/** Points de contrôle de toute visite (mode visite, analyse sans IA). */
export const VISITE = [
  "Démarrer moteur froid : pas de fumée, pas de bruit de chaîne ou de claquement",
  "Aucun voyant allumé au tableau de bord une fois le moteur lancé",
  "Embrayage : il ne patine pas en 3e à bas régime, il ne broute pas",
  "Boîte : les vitesses passent sans craquer, marche arrière comprise",
  "Freinage droit, sans vibration ni bruit",
  "Direction : pas de jeu, la voiture ne tire pas d'un côté",
  "Pneus : même marque par essieu, usure régulière, date de moins de 6 ans",
  "Carrosserie : écarts entre éléments réguliers, teinte identique partout",
  "Dessous : pas de fuite d'huile ou de liquide de refroidissement",
  "Climatisation, vitres, fermeture centralisée : tout fonctionne",
];
const DOCUMENTS = [
  "Carte grise au nom du vendeur",
  "Contrôle technique de moins de 6 mois (voiture de plus de 4 ans)",
  "Certificat de non-gage de moins de 15 jours",
  "Rapport HistoVec (propriétaires, sinistres, kilométrages)",
  "Factures d'entretien et carnet",
];

export function iaRegles(texte: string, f: Faits, fiab: Fiabilite, cote: Cote | null): Ia {
  const { marque, modele } = marqueModele(texte, f);
  const marche: Ia["marche"] = cote ? marcheDepuisCote(cote) : { bas: null, realiste: null, haut: null, reventeRapide: null, confiance: "faible", commentaire: "Pas assez d'annonces comparables dans les relevés de l'outil pour chiffrer la cote de ce modèle." };
  const pieges = f.defauts.filter((d) => d.cat === "piege");
  const chiffres = f.defauts.filter((d) => d.cat !== "piege" && !d.nc);
  const ecart = marche.realiste && f.prix ? (f.prix - marche.realiste) / marche.realiste : null;
  const positionPrix =
    ecart == null ? "Le prix n'a pas pu être comparé au marché." : ecart <= -0.08 ? `Le prix est ${Math.round(-ecart * 100)} % sous la cote.` : ecart >= 0.08 ? `Le prix est ${Math.round(ecart * 100)} % au-dessus de la cote.` : "Le prix est dans la cote.";
  const pointsForts = [
    f.carnet && "Carnet d'entretien annoncé",
    f.factures && "Factures annoncées",
    f.proprietaires === 1 && "Première main",
    f.ct?.statut === "vierge" && "Contrôle technique sans défaut annoncé",
    fiab.k === "fiable" && `Modèle de la liste fiable de l'outil${fiab.bonsMoteurs ? ` (${fiab.bonsMoteurs})` : ""}`,
  ].filter(Boolean) as string[];
  const alertes = [...pieges.map((d) => d.l), ...(fiab.k === "eviter" ? fiab.pourquoi : [])];
  const inspecter = pieges.length > 0 || fiab.k === "eviter";
  const accompagne = !inspecter && (chiffres.length >= 2 || f.defauts.some((d) => d.nc));
  const ouverture = marche.realiste && f.prix ? arrondi(Math.min(f.prix, marche.realiste) * 0.93) : null;
  return {
    vehicule: {
      marque, modele, generation: "", version: f.titre, annee: f.annee, km: f.km, energie: f.energie, boite: f.boite,
      puissanceFiscale: f.cv, prix: f.prix, localisation: [f.ville, f.cp].filter(Boolean).join(" "), vendeur: f.pro ? "professionnel" : "particulier",
    },
    distanceKm: null,
    marche,
    photos: { fournies: false, score: null, defauts: [], vuesManquantes: [] },
    travaux: [],
    fiabilite: {
      moteur: fiab.modele ?? (f.titre || "Moteur non identifié"),
      note: fiab.k === "eviter" ? 3 : fiab.k === "fiable" ? 8 : 6,
      problemesConnus: fiab.k === "eviter" ? fiab.pourquoi : fiab.aVerifier ? [fiab.aVerifier] : [],
    },
    drapeaux: { compteurSuspect: false, sinistreGrave: false, gageOuOpposition: false, defautBloquant: pieges.length > 0, prixHT: false },
    alertes,
    pointsForts,
    questions: [
      "Avez-vous les factures d'entretien, et quand la distribution a-t-elle été faite ?",
      "La voiture a-t-elle eu un accident ou une réparation de carrosserie ?",
      "Pouvez-vous m'envoyer le contrôle technique et le rapport HistoVec ?",
      "Depuis combien de temps l'avez-vous, et pourquoi la vendez-vous ?",
      "Y a-t-il un voyant allumé ou un bruit particulier à signaler ?",
    ],
    messageVendeur: `Bonjour, votre ${[marque, modele].filter(Boolean).join(" ") || "voiture"} m'intéresse. Est-elle toujours disponible, et pourriez-vous m'envoyer le contrôle technique et les factures d'entretien ?`,
    resume: `${positionPrix} ${f.defauts.length ? `${f.defauts.length} point${f.defauts.length > 1 ? "s" : ""} relevé${f.defauts.length > 1 ? "s" : ""} dans l'annonce.` : "Aucun défaut relevé dans le texte."}${inspecter ? " Risque mécanique : inspection indispensable." : ""}`,
    resumeSimple: `${positionPrix} ${inspecter ? "Un point grave est signalé : faites inspecter la voiture avant d'acheter." : "Vérifiez les points ci-dessous avant d'acheter."}`,
    synthese: [positionPrix, ...alertes.slice(0, 2), ...pointsForts.slice(0, 2)].slice(0, 5),
    negociation: {
      prixOuverture: ouverture,
      arguments: [
        ...chiffres.slice(0, 5).map((d) => ({ argument: d.l, montant: d.max })),
        ...(ecart != null && ecart > 0.03 && marche.realiste ? [{ argument: "Prix au-dessus des annonces comparables", montant: arrondi((f.prix ?? 0) - marche.realiste) }] : []),
      ],
      conseils: [
        "Venez avec les annonces comparables : la cote se base sur des voitures réellement en vente.",
        "Chiffrez chaque défaut vu sur place et déduisez-le, poliment.",
        "Ne faites pas d'offre avant l'essai et la lecture des papiers.",
      ],
    },
    visite: { aControler: VISITE, documents: DOCUMENTS },
    accompagnement: {
      recommandation: inspecter ? "faites inspecter la voiture" : accompagne ? "venez accompagné" : "vous pouvez y aller seul",
      pourquoi: inspecter ? "Un défaut grave ou un moteur à éviter est signalé." : accompagne ? "Plusieurs points sont à vérifier sur place." : "Rien de grave n'est signalé dans l'annonce.",
    },
  };
}
