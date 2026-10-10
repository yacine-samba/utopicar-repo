/* Les trois vraies annonces de la démonstration (relevées le 3 octobre 2026) : affichées sur l'accueil (démo et essai)
   et sur /benef. Partagées entre les composants, sans dépendance à React. */
export type Ligne = { l: string; s: string; v: number | null; sens?: "up" | "dn" | "cle"; avant?: string; sinon?: string };
export type Exemple = {
  onglet: string;
  titre: string;
  prix: number;
  infos: string;
  lieu: string;
  nbPhotos: number;
  photos: string[];
  citation: { t: string; m?: "bad" | "ok" }[];
  fiab: { note: number; moteur: string };
  ton: "ok" | "warn" | "bad";
  verdict: string;
  phrase: string;
  lignes: Ligne[];
  message: string;
};

/* Trois vraies annonces Leboncoin relevées le 3 octobre 2026 (une recherche par modèle) et passées dans l'outil :
   cote, défauts, fiabilité, prix à proposer et message sont ceux qu'il a rendus. Photos de l'annonce, sans plaque lisible. */
export const EXEMPLES: Record<string, Exemple> = {
  clio: {
    onglet: "Clio IV", titre: "Renault Clio IV 0.9 TCe 90", prix: 6700, infos: "2013 · 57 840 km · Essence · Manuelle", lieu: "Particulier · Barcelonnette (04)", nbPhotos: 3,
    photos: ["/images/demo/clio-1.webp", "/images/demo/clio-2.webp", "/images/demo/clio-3.webp"],
    citation: [{ t: "« Seulement 57 840 km, 2 pneus avant neufs. " }, { t: "Distribution à contrôler", m: "bad" }, { t: ". À signaler : " }, { t: "un choc sur le passage de roue avant gauche", m: "bad" }, { t: ". Vendu en l'état. »" }],
    fiab: { note: 8, moteur: "0.9 TCe 90" },
    ton: "ok", verdict: "Bon prix", phrase: "Moins chère que les Clio comparables, choc compris. Moteur de la liste fiable.",
    lignes: [
      { l: "Cote du marché", s: "174 Clio IV comparables en vente", v: 7550 },
      { l: "Défauts repérés dans le texte", s: "Choc de carrosserie (150 à 700 €)", v: 425, sens: "up", avant: "+\u00a0" },
      { l: "Prix réel (prix + réparations)", s: "Sous la cote", v: 7125, sens: "dn" },
      { l: "Prix à proposer", s: "Ouverture conseillée, sans vexer le vendeur", v: 6250, sens: "cle" },
    ],
    message: "Bonjour, votre Renault Clio m'intéresse. Est-elle toujours disponible, et pourriez-vous m'envoyer le contrôle technique et les factures d'entretien ?",
  },
  p208: {
    onglet: "208", titre: "Peugeot 208 1.2 PureTech 110 Allure", prix: 7190, infos: "2016 · 116 789 km · Essence · Manuelle", lieu: "Professionnel · Vitrolles (13)", nbPhotos: 12,
    photos: ["/images/demo/208-1.webp", "/images/demo/208-2.webp", "/images/demo/208-3.webp", "/images/demo/208-4.webp"],
    citation: [{ t: "« Peugeot 208 " }, { t: "1.2 PureTech", m: "bad" }, { t: " Allure 5P 110 ch. Mise en circulation 2016. 116 789 km. » Aucun mot sur l'entretien ni sur la courroie." }],
    fiab: { note: 4, moteur: "1.2 PureTech 110" },
    ton: "bad", verdict: "Déconseillée", phrase: "Moteur à éviter (courroie dans l'huile, consommation d'huile) et prix au-dessus du marché.",
    lignes: [
      { l: "Cote du marché", s: "21 annonces comparables", v: 5950 },
      { l: "Travaux à prévoir", s: "Pneus, freins, révision, contrôle de la courroie", v: 1650, sens: "up", avant: "+\u00a0" },
      { l: "Prix réel (prix + travaux)", s: "Bien au-dessus de la cote", v: 8840, sens: "up" },
      { l: "Prix à proposer", s: "Moteur réputé fragile : mieux vaut passer", v: null, sens: "cle", sinon: "Passez" },
    ],
    message: "Bonjour, avez-vous le carnet d'entretien complet ? La courroie de distribution et la consommation d'huile ont-elles été vérifiées ?",
  },
  yaris: {
    onglet: "Yaris", titre: "Toyota Yaris III 100 VVT-i Dynamic", prix: 10999, infos: "2014 · 97 959 km · Essence · Manuelle", lieu: "Professionnel · Paris (75)", nbPhotos: 12,
    photos: ["/images/demo/yaris-1.webp", "/images/demo/yaris-2.webp", "/images/demo/yaris-3.webp", "/images/demo/yaris-4.webp"],
    citation: [{ t: "« Toyota Yaris 100 VVT-i Dynamic 5p, " }, { t: "garantie Label Toyota Occasions 12 mois", m: "ok" }, { t: ". Caméra de recul, régulateur, écran tactile. »" }],
    fiab: { note: 8, moteur: "1.33 VVT-i" },
    ton: "warn", verdict: "Trop cher", phrase: "Moteur fiable et garantie 12 mois, mais près de 3 000 € au-dessus des Yaris comparables.",
    lignes: [
      { l: "Cote du marché", s: "Estimation Leboncoin : 7 930 à 8 770 €", v: 8350 },
      { l: "Défauts vus sur les photos", s: "Pneus avant usés (250 à 350 €)", v: 300, sens: "up", avant: "+\u00a0" },
      { l: "Prix réel (prix + réparations)", s: "Au-dessus de la cote", v: 11299, sens: "up" },
      { l: "Prix à proposer", s: "À négocier fermement, ou comparer d'autres Yaris", v: 8050, sens: "cle" },
    ],
    message: "Bonjour, je suis intéressé par cette Yaris Dynamic. Avez-vous le CT et l'HistoVec à jour ? Je souhaite valider l'historique d'entretien avant de me déplacer.",
  },
};
export const CLES_EXEMPLES = Object.keys(EXEMPLES);
export const euros = (v: number) => (v < 0 ? "−\u00a0" : "") + Math.abs(Math.round(v)).toLocaleString("fr-FR") + "\u00a0€";
export const TON_EXEMPLE = { ok: "text-ok border-ok/40 bg-ok/10", warn: "text-warn border-warn/40 bg-warn/10", bad: "text-bad border-bad/40 bg-bad/10" };
export const ANNEAU_EXEMPLE = { ok: "var(--color-ok)", warn: "var(--color-warn)", bad: "var(--color-bad)" };

/** Les photos de démonstration existent en 800 et 400 px : le navigateur prend la plus petite qui suffit (téléphone). */
export const srcSetDemo = (u: string) => `${u.replace(/\.webp$/, "-400.webp")} 400w, ${u} 800w`;
