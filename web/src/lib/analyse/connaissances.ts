/* Réputation des moteurs et des boîtes, toutes gammes confondues (citadine, familiale, premium, sportive) : liste fixe,
   jamais par l'IA. Chaque fiche dit ce qui est connu, ce qu'il faut vérifier, la question à poser au vendeur et,
   pour une faiblesse connue, le risque sur 12 mois (probabilité, coût en garage indépendant). Ce sont des réputations
   documentées, pas un diagnostic : un moteur fragile bien entretenu peut être une bonne affaire, et l'inverse. */

export type Avis = "robuste" | "correct" | "fragile" | "eviter";
export type Distribution = "chaine" | "courroie";

export type Connu = {
  id: string;
  type: "moteur" | "boite" | "batterie";
  nom: string;
  avis: Avis;
  detail: string;
  verif: string;
  /** Question courte au vendeur, reprise dans le premier message. */
  question?: string;
  /** Faiblesse connue : probabilité qu'elle coûte dans les 12 mois, coût mini et maxi. */
  risque?: [proba: number, min: number, max: number];
  distri?: Distribution;
  /** Durée de vie habituelle du moteur bien entretenu (km). */
  kmVie?: number;
  /** Page publique /moteur/... qui détaille ce moteur ou cette boîte. */
  slug?: string;
  /** Moteur « correct » dont le point faible reste fréquent à tout âge (AdBlue, refroidisseur) : compté dans les travaux possibles. */
  frequent?: boolean;
};

type Ctx = { t: string; marque: string; annee: number | null; km: number | null; energie: string };
type Fiche = Omit<Connu, "avis"> & { re: RegExp; marques?: string[]; avis: Avis | ((c: Ctx) => Avis | null); si?: (c: Ctx) => boolean; plus?: (c: Ctx) => Partial<Connu> };

const avant = (y: number) => (c: Ctx) => c.annee == null || c.annee <= y;
const PREMIUM = ["audi", "bmw", "mercedes", "mercedes-benz", "volvo", "porsche", "land rover", "land-rover", "jaguar", "lexus", "alfa romeo", "maserati", "mini", "ds", "tesla"];

const FICHES: Fiche[] = [
  /* ---------- Moteurs à la mauvaise réputation (pages /moteur) ---------- */
  {
    id: "puretech", type: "moteur", slug: "puretech", nom: "1.0 / 1.2 PureTech (3 cylindres)", marques: ["peugeot", "citroen", "ds", "opel", "toyota"],
    re: /pure ?tech|\b1[.,][02] ?vti\b|\b(68|72|82) ?ch\b.*\b(208|c3|2008|c-?elysee|301)\b/,
    si: (c) => !/\b(107|108|c1|aygo)\b/.test(c.t) || /\b1[.,]2\b|pure ?tech/.test(c.t),
    avis: (c) => (c.annee != null && c.annee >= 2024 ? "correct" : "eviter"),
    detail: "Courroie de distribution qui baigne dans l'huile et se délite, consommation d'huile fréquente.",
    verif: "Facture du dernier remplacement de courroie, niveau d'huile, fumée bleue, voyant de pression d'huile.",
    question: "la courroie de distribution a-t-elle été changée (facture, kilométrage) ?",
    risque: [0.3, 700, 1300], distri: "courroie", kmVie: 180000,
  },
  {
    id: "thp", type: "moteur", slug: "thp", nom: "1.6 THP (moteur « Prince »)", marques: ["peugeot", "citroen", "ds", "mini"],
    re: /\bthp\b/, avis: (c) => (avant(2013)(c) ? "eviter" : "correct"),
    detail: "Chaîne de distribution qui s'allonge, calamine, consommation d'huile (surtout jusqu'en 2013).",
    verif: "Bruit de chaîne au démarrage à froid, factures de chaîne, consommation d'huile.",
    question: "la chaîne de distribution a-t-elle déjà été remplacée ?",
    risque: [0.25, 900, 1800], distri: "chaine", kmVie: 200000,
  },
  {
    id: "mini-r56", type: "moteur", slug: "thp", nom: "Mini Cooper / Cooper S 1.6 (R55 à R57)", marques: ["mini"],
    re: /\bcooper\b/, si: (c) => c.annee != null && c.annee >= 2006 && c.annee <= 2014,
    avis: (c) => (/\bcooper ?s\b|\bjcw\b|john cooper/.test(c.t) ? "eviter" : "fragile"),
    detail: "Même famille que le 1.6 THP : chaîne de distribution, calamine et consommation d'huile.",
    verif: "Bruit de chaîne à froid (quelques secondes de cliquetis), factures de chaîne, consommation d'huile.",
    question: "la chaîne de distribution a-t-elle déjà été remplacée ?",
    risque: [0.25, 900, 1800], distri: "chaine", kmVie: 190000,
  },
  {
    id: "vti", type: "moteur", slug: "vti", nom: "1.4 / 1.6 VTi (moteur « Prince »)", marques: ["peugeot", "citroen", "ds"],
    re: /\b1[.,][46] ?vti\b/, avis: "eviter",
    detail: "Chaîne de distribution fragile, consommation d'huile.",
    verif: "Bruit de chaîne à froid, factures de chaîne, niveau d'huile.",
    question: "la chaîne de distribution a-t-elle déjà été remplacée ?",
    risque: [0.25, 800, 1600], distri: "chaine", kmVie: 190000,
  },
  {
    id: "ecoboost10", type: "moteur", slug: "ecoboost", nom: "1.0 EcoBoost (3 cylindres)", marques: ["ford"],
    re: /\b1[.,]0 ?(l )?eco ?boost|eco ?boost ?(100|101|125|140)\b|\b(100|125|140) ?ch ?eco ?boost/,
    avis: (c) => (avant(2018)(c) ? "eviter" : "fragile"),
    detail: "Courroie dans l'huile, risques de surchauffe sur les premières années.",
    verif: "Niveau et couleur du liquide de refroidissement, facture de courroie, aucune trace de surchauffe.",
    question: "la courroie a-t-elle été changée, et la voiture a-t-elle déjà chauffé ?",
    risque: [0.25, 900, 3000], distri: "courroie", kmVie: 180000,
  },
  {
    id: "tce12", type: "moteur", slug: "tce", nom: "1.2 TCe 115 / 120 (H5Ft)", marques: ["renault", "dacia", "nissan", "mercedes"],
    re: /\btce ?(115|118|120|125)\b|\b1[.,]2 ?tce\b|\bdig-?t ?115\b/,
    avis: (c) => (avant(2016)(c) ? "eviter" : "fragile"),
    detail: "Consommation d'huile excessive pouvant aller jusqu'à la casse moteur (2012 à 2016 surtout).",
    verif: "Consommation d'huile (la demander), fumée bleue, factures de reprogrammation ou de prise en charge Renault.",
    question: "consomme-t-elle de l'huile entre deux vidanges ?",
    risque: [0.3, 1500, 4000], distri: "chaine", kmVie: 180000,
  },
  {
    id: "d4d20", type: "moteur", slug: "d4d", nom: "2.0 / 2.2 D-4D", marques: ["toyota", "lexus"],
    re: /\b2[.,][02] ?d-?4d\b|\b2[.,]2 ?d-?cat\b/, avis: "eviter",
    detail: "Joint de culasse fragile, consommation d'huile.",
    verif: "Niveau de liquide de refroidissement, fumée, factures de culasse.",
    question: "le joint de culasse a-t-il déjà été changé ?",
    risque: [0.2, 1500, 3000], distri: "chaine", kmVie: 220000,
  },

  /* ---------- Boîtes ---------- */
  {
    id: "robotisee", type: "boite", slug: "boites", nom: "Boîte manuelle robotisée", re: /easytronic|quickshift|\bmmt\b|2-?tronic|\bbmp ?6\b|\betg ?[56]?\b|\begs\b|bo[iî]te manuelle pilot|sensodrive|dualogic|selespeed|durashift/,
    avis: "eviter", detail: "À-coups, actionneur et embrayage fragiles, réparations coûteuses pour une boîte peu agréable.",
    verif: "Passages de vitesses à l'essai, démarrage en côte, factures d'actionneur ou d'embrayage.",
    question: "l'actionneur ou l'embrayage de la boîte ont-ils déjà été changés ?",
    risque: [0.3, 600, 1800],
  },
  {
    id: "powershift", type: "boite", slug: "boites", nom: "Boîte Powershift (DPS6)", marques: ["ford"], re: /powershift|\bdps6\b/, avis: "eviter",
    detail: "Embrayages et calculateur de boîte à problèmes, tremblements au démarrage.", verif: "Tremblements en première, à-coups, factures de boîte.",
    question: "la boîte a-t-elle déjà été réparée (embrayages, calculateur) ?", risque: [0.3, 1000, 2500],
  },
  {
    id: "al4", type: "boite", slug: "boites", nom: "Boîte automatique 4 rapports AL4 / DP0", marques: ["peugeot", "citroen", "renault", "dacia"], re: /\bal4\b|\bdp0\b|\bbva ?4\b/, avis: "fragile",
    detail: "Électrovannes et capteur de pression fragiles, mode dégradé fréquent.", verif: "Passages lents ou brutaux, voyant de boîte, vidanges de boîte.",
    question: "la boîte automatique a-t-elle eu des vidanges ?", risque: [0.25, 800, 2000],
  },
  {
    id: "dq200", type: "boite", nom: "DSG 7 à embrayage à sec (DQ200)", re: /\bdsg ?-?7\b|\bdsg\b.{0,30}\b7\b|\b7 ?rapports\b.{0,40}\b(dsg|s ?-?tronic)\b/,
    si: (c) => /\b1[.,][024568] ?(tsi|tfsi|tdi)\b|\btsi ?(105|110|122|125|140|150)\b|\btdi ?(90|105|110|115|116)\b/.test(c.t),
    avis: "fragile", detail: "Mécatronique et double embrayage à sec fragiles sur les petits moteurs.", verif: "À-coups à basse vitesse, patinage, factures de mécatronique.",
    question: "la mécatronique ou l'embrayage de la boîte ont-ils déjà été changés ?", risque: [0.2, 900, 2200],
  },
  {
    id: "dsg", type: "boite", nom: "Boîte DSG / S tronic à bain d'huile", re: /\bdsg\b|s ?-?tronic/, avis: "correct",
    detail: "Boîte solide si les vidanges sont faites (tous les 60 000 km).", verif: "Facture de vidange de boîte, passages fluides à l'essai.",
    question: "la vidange de la boîte DSG a-t-elle été faite ?", risque: [0.08, 800, 2000],
    plus: (c) => (/\brs ?3\b|\btt ?rs\b|\brs ?q3\b|\bgolf ?r\b|\bs3\b|\bcupra\b/.test(c.t) ? { avis: "robuste", nom: "Boîte S tronic / DSG renforcée", detail: "Boîte renforcée des versions sportives, robuste si les vidanges sont faites." } : {}),
  },
  {
    id: "edc", type: "boite", nom: "Boîte EDC (double embrayage Renault)", marques: ["renault", "dacia", "nissan", "mercedes"], re: /\bedc\b/, avis: "fragile",
    detail: "Embrayages et calculateur à surveiller, surtout sur les petits moteurs.", verif: "À-coups à basse vitesse, patinage, voyant de boîte.",
    question: "la boîte EDC a-t-elle déjà été réparée ?", risque: [0.15, 800, 2000],
  },
  {
    id: "cvt", type: "boite", nom: "Boîte à variation continue (CVT Jatco)", marques: ["nissan", "renault", "mitsubishi", "suzuki"], re: /\bcvt\b|x-?tronic/, avis: "fragile",
    detail: "Courroie et paliers de la boîte qui s'usent, réparation chère.", verif: "Sifflement, à-coups, patinage en accélération, vidanges.",
    question: "la boîte a-t-elle eu des vidanges ?", risque: [0.2, 1200, 3000],
  },
  {
    id: "multitronic", type: "boite", nom: "Boîte Multitronic (CVT Audi)", marques: ["audi"], re: /multitronic/, avis: "eviter",
    detail: "Boîte à variation continue connue pour ses pannes coûteuses.", verif: "À-coups au démarrage, patinage, factures de boîte.",
    question: "la boîte a-t-elle déjà été réparée ?", risque: [0.3, 1500, 3500],
  },
  { id: "eat", type: "boite", nom: "Boîte automatique EAT6 / EAT8 (Aisin)", marques: ["peugeot", "citroen", "ds", "opel", "toyota"], re: /\beat ?[68]\b/, avis: "robuste", detail: "Boîte automatique classique réputée fiable.", verif: "Passages fluides à l'essai." },
  { id: "zf8", type: "boite", nom: "Boîte automatique ZF 8 rapports", marques: ["bmw", "audi", "jaguar", "land rover", "maserati", "alfa romeo"], re: /\bzf\b|8 ?rapports|steptronic|tiptronic ?8/, avis: "robuste", detail: "Boîte automatique de référence, très solide.", verif: "Passages fluides, vidange de boîte conseillée vers 120 000 km." },
  { id: "7g", type: "boite", nom: "Boîte 7G-Tronic / 9G-Tronic", marques: ["mercedes", "mercedes-benz"], re: /[79]g-?tronic/, avis: "correct", detail: "Boîte automatique fiable si vidangée.", verif: "Passages fluides, vidange de boîte." },

  /* ---------- Électrique ---------- */
  {
    id: "location-batterie", type: "batterie", nom: "Batterie en location", re: /location (de |de la )?batterie|batterie (en|a la) location|batterie louee/, avis: "fragile",
    detail: "La batterie n'est pas vendue avec la voiture : un loyer mensuel s'ajoute (souvent 70 à 120 € par mois).",
    verif: "Contrat de location, loyer, possibilité de racheter la batterie.", question: "la batterie est-elle en location ou achetée avec la voiture ?",
  },
  {
    id: "batterie-ev", type: "batterie", nom: "Batterie de traction", re: /\b(electrique|100 ?% electrique|e-?tech electric|zoe|e-?208|e-?2008|id\.?[3457]|model ?[3sxy]|leaf|kona electri|e-?niro|mg4|spring)\b/,
    si: (c) => /lectrique/.test(c.energie) || /\belectrique\b/.test(c.t), avis: "correct",
    detail: "Le prix d'une électrique dépend surtout de l'état de sa batterie.", verif: "Certificat d'état de santé de la batterie (SoH), autonomie réelle, câbles fournis.",
    question: "avez-vous le certificat d'état de santé de la batterie (SoH) ?",
  },

  /* ---------- Moteurs réputés solides ou corrects (toutes gammes) ---------- */
  { id: "1kr", type: "moteur", nom: "1.0 essence Toyota (107, 108, C1, Aygo)", marques: ["peugeot", "citroen", "toyota"], re: /\b(107|108|c1|aygo)\b/, si: (c) => !/\b1[.,]2\b|pure ?tech/.test(c.t), avis: "robuste", detail: "Petit 3 cylindres Toyota à chaîne, réputé increvable.", verif: "Embrayage, joint de boîte.", distri: "chaine", kmVie: 250000 },
  { id: "toyota-hybride", type: "moteur", nom: "Hybride Toyota / Lexus", marques: ["toyota", "lexus"], re: /hybrid|hybride|\bhsd\b/, avis: "robuste", detail: "Système hybride réputé parmi les plus fiables du marché.", verif: "Voyant hybride, ventilateur de batterie propre, entretien suivi.", distri: "chaine", kmVie: 350000 },
  { id: "vvti", type: "moteur", nom: "Essence VVT-i Toyota", marques: ["toyota"], re: /vvt-?i|\b1[.,]33\b|\b1[.,]0 ?vvt/, avis: "robuste", detail: "Moteur essence à chaîne quasi inusable.", verif: "Entretien régulier.", distri: "chaine", kmVie: 300000 },
  { id: "ivtec", type: "moteur", nom: "Essence i-VTEC Honda", marques: ["honda"], re: /i-?vtec|\b1[.,][2-8] ?i\b/, avis: "robuste", detail: "Moteur essence très fiable.", verif: "Entretien régulier.", distri: "chaine", kmVie: 300000 },
  { id: "skyactiv-g", type: "moteur", nom: "Essence Skyactiv-G Mazda", marques: ["mazda"], re: /skyactiv-?g|\be-?skyactiv-?g/, avis: "robuste", detail: "Atmosphérique réputé fiable et sobre.", verif: "Entretien régulier.", distri: "chaine", kmVie: 280000 },
  {
    id: "skyactiv-d", type: "moteur", nom: "2.2 Skyactiv-D", marques: ["mazda"], re: /skyactiv-?d|\b2[.,]2 ?d\b/, avis: (c) => (avant(2018)(c) ? "fragile" : "correct"),
    detail: "Encrassement et dilution de l'huile en usage urbain.", verif: "Niveau d'huile qui monte, régénérations du FAP, usage autoroute ou ville.", question: "la voiture roule-t-elle surtout en ville ou sur route ?", risque: [0.15, 800, 2500], distri: "chaine",
  },
  { id: "d4f", type: "moteur", nom: "1.2 16V Renault (D4F)", marques: ["renault", "dacia"], re: /\b1[.,]2 ?16 ?v\b/, avis: "robuste", detail: "Petit moteur essence simple et solide.", verif: "Distribution tous les 120 000 km ou 6 ans.", distri: "courroie", kmVie: 250000 },
  {
    id: "dci15", type: "moteur", nom: "1.5 dCi (K9K)", marques: ["renault", "dacia", "nissan", "mercedes", "infiniti"], re: /\b1[.,]5 ?dci\b|\bdci ?(65|68|70|75|80|85|86|90|95|100|105|106|110|115)\b|\bblue ?dci\b/,
    avis: (c) => (avant(2008)(c) ? "fragile" : "correct"),
    detail: "Coussinets de bielle et injecteurs fragiles avant 2008 ; ensuite correct (injecteurs, vanne EGR à surveiller).", verif: "Bruit de cliquetis, fumée au démarrage, vidanges régulières.",
    question: "les vidanges ont-elles été faites régulièrement (factures) ?", risque: [0.12, 600, 2500], distri: "courroie", kmVie: 260000,
  },
  { id: "dci16", type: "moteur", nom: "1.6 dCi (R9M)", marques: ["renault", "nissan", "opel", "mercedes"], re: /\b1[.,]6 ?dci\b|\bdci ?(130|160)\b/, avis: "correct", detail: "Diesel moderne à chaîne, sans défaut majeur connu.", verif: "Vanne EGR, FAP en usage urbain.", distri: "chaine", kmVie: 280000 },
  { id: "dci19", type: "moteur", nom: "1.9 dCi (F9Q)", marques: ["renault", "nissan", "volvo", "suzuki"], re: /\b1[.,]9 ?dci\b/, avis: "fragile", detail: "Moteur ancien : turbo, joint de culasse et coussinets à surveiller.", verif: "Fumée, sifflement de turbo, niveau de liquide de refroidissement.", question: "le turbo a-t-il déjà été changé ?", risque: [0.15, 700, 2000], distri: "courroie" },
  { id: "rs-renault", type: "moteur", nom: "2.0 Renault Sport (F4R)", marques: ["renault"], re: /\b(megane|clio)\b.{0,20}\b(rs|r\.s\.?)\b|renault ?sport|\b2[.,]0 ?(16 ?v )?t\b/, avis: "robuste", detail: "Moteur de sportive réputé solide quand il est entretenu.", verif: "Factures, usage circuit, distribution.", distri: "courroie", kmVie: 230000 },
  {
    id: "hdi16", type: "moteur", nom: "1.6 HDi / TDCi (DV6)", marques: ["peugeot", "citroen", "ford", "volvo", "mini", "mazda", "ds"], re: /\b1[.,]6 ?(e-?)?hdi\b|\b(e-?)?hdi ?(90|92|110|112|114|115)\b|\b1[.,]6 ?tdci\b/,
    avis: (c) => (avant(2010)(c) ? "fragile" : "correct"),
    detail: "Avant 2010 : turbo, crépine et joints d'injecteurs (calamine). Ensuite : correct.", verif: "Fumée, sifflement de turbo, odeur de gasoil à chaud, vidanges rapprochées.",
    question: "le turbo et les joints d'injecteurs ont-ils déjà été changés ?", risque: [0.15, 600, 1800], distri: "courroie", kmVie: 250000,
  },
  { id: "hdi14", type: "moteur", nom: "1.4 HDi (DV4)", marques: ["peugeot", "citroen", "ford", "mazda", "suzuki"], re: /\b1[.,]4 ?hdi\b|\bhdi ?(68|70)\b|\b1[.,]4 ?tdci\b/, avis: "correct", detail: "Petit diesel simple et durable.", verif: "Distribution, embrayage.", distri: "courroie", kmVie: 260000 },
  { id: "hdi20", type: "moteur", nom: "2.0 HDi (DW10)", marques: ["peugeot", "citroen", "ds", "ford", "volvo", "fiat"], re: /\b2[.,]0 ?hdi\b|\bhdi ?(136|138|140|150|163)\b/, avis: "robuste", detail: "Diesel endurant.", verif: "Distribution, FAP, injecteurs.", distri: "courroie", kmVie: 320000 },
  {
    id: "bluehdi", type: "moteur", nom: "BlueHDi", marques: ["peugeot", "citroen", "ds", "opel", "toyota", "fiat"], re: /blue ?hdi/, avis: "correct",
    detail: "Diesel moderne ; le circuit AdBlue (réservoir, injecteur) tombe parfois en panne.", verif: "Voyant AdBlue ou « démarrage impossible dans X km », factures du système AdBlue.",
    question: "y a-t-il déjà eu un souci d'AdBlue ?", risque: [0.12, 700, 1500], kmVie: 280000, frequent: true,
  },
  { id: "16v-psa", type: "moteur", nom: "1.4 / 1.6 16V essence (TU, EC5)", marques: ["peugeot", "citroen"], re: /\b1[.,][46] ?16 ?v\b|\b1[.,]4 ?i\b/, avis: "robuste", detail: "Essence atmosphérique simple et solide.", verif: "Distribution, joint de culasse sur les plus vieux.", distri: "courroie", kmVie: 250000 },
  { id: "tdi19", type: "moteur", nom: "1.9 TDI", marques: ["volkswagen", "audi", "seat", "skoda", "ford"], re: /\b1[.,]9 ?tdi\b/, avis: "robuste", detail: "Diesel parmi les plus endurants jamais produits.", verif: "Distribution, embrayage, volant moteur.", distri: "courroie", kmVie: 400000 },
  {
    id: "tdi20", type: "moteur", nom: "2.0 TDI", marques: ["volkswagen", "audi", "seat", "skoda", "cupra"], re: /\b2[.,]0 ?tdi\b|\btdi ?(136|140|143|150|163|170|177|184|190|200|204)\b|\b(30|35|40) ?tdi\b/,
    avis: (c) => (avant(2008)(c) ? "correct" : "robuste"),
    detail: "Les versions à injecteurs-pompes (jusqu'en 2008) sont plus délicates ; les versions common rail sont endurantes.", verif: "Distribution, vanne EGR, FAP.",
    distri: "courroie", kmVie: 320000,
  },
  { id: "tdi16", type: "moteur", nom: "1.6 TDI", marques: ["volkswagen", "audi", "seat", "skoda"], re: /\b1[.,]6 ?tdi\b|\btdi ?(90|105|110|115|116)\b/, avis: "correct", detail: "Diesel sans défaut majeur ; vanne EGR et FAP à surveiller.", verif: "Distribution, EGR.", distri: "courroie", kmVie: 280000 },
  {
    id: "tsi-ea111", type: "moteur", nom: "1.2 / 1.4 TSI (EA111)", marques: ["volkswagen", "audi", "seat", "skoda"], re: /\b1[.,][24] ?t?si\b|\b1[.,]4 ?tfsi\b|\btsi ?(85|90|105|122|140|160|180)\b/,
    avis: (c) => (avant(2012)(c) ? "fragile" : "correct"),
    detail: "Jusqu'en 2012 : chaîne de distribution qui s'allonge. Ensuite : moteur à courroie (EA211), correct.", verif: "Bruit de chaîne à froid (jusqu'en 2012), factures de chaîne.",
    question: "la chaîne de distribution a-t-elle déjà été changée ?", risque: [0.18, 800, 1500], kmVie: 220000,
    plus: (c) => ({ distri: avant(2012)(c) ? "chaine" : "courroie" }),
  },
  {
    id: "tfsi-ea888", type: "moteur", nom: "1.8 / 2.0 TFSI (EA888)", marques: ["volkswagen", "audi", "seat", "skoda", "cupra"], re: /\b(1[.,]8|2[.,]0) ?t?fsi\b|\b2[.,]0 ?tsi\b|\b(40|45) ?tfsi\b|\bgti\b|\bgolf ?r\b|\bs3\b/,
    avis: (c) => (avant(2012)(c) ? "fragile" : "correct"),
    detail: "Jusqu'en 2012 : consommation d'huile (segments) et chaîne. Ensuite : correct, pompe à eau à surveiller.", verif: "Consommation d'huile, bruit de chaîne à froid, fuite de pompe à eau.",
    question: "consomme-t-elle de l'huile entre deux vidanges ?", risque: [0.18, 1200, 3000], distri: "chaine", kmVie: 230000,
  },
  { id: "tfsi25", type: "moteur", nom: "2.5 TFSI 5 cylindres", marques: ["audi", "cupra"], re: /\b2[.,]5 ?tfsi\b|\brs ?3\b|\btt ?rs\b|\brs ?q3\b|\bformentor vz5\b/, avis: "robuste", detail: "Cinq cylindres réputé solide, très recherché : il garde bien sa valeur.", verif: "Factures, usage sur circuit, reprogrammation éventuelle.", question: "la voiture a-t-elle été reprogrammée ou utilisée sur circuit ?", distri: "chaine", kmVie: 250000 },
  { id: "tdi30", type: "moteur", nom: "3.0 TDI V6", marques: ["audi", "volkswagen", "porsche"], re: /\b3[.,]0 ?tdi\b|\b(45|50) ?tdi\b/, avis: "correct", detail: "V6 diesel endurant ; chaînes de distribution à l'arrière à surveiller sur les premières années.", verif: "Bruit de chaîne à froid, factures.", risque: [0.08, 1500, 3500], distri: "chaine", kmVie: 320000 },
  {
    id: "n47", type: "moteur", nom: "2.0 diesel BMW (N47)", marques: ["bmw", "mini"], re: /\b[1-5]?(16|18|20|23|25)d\b|drive(16|18|20|23|25)d\b|\bcooper ?s?d\b/,
    avis: (c) => (c.annee != null && c.annee >= 2007 && c.annee <= 2011 ? "fragile" : "correct"),
    detail: "De 2007 à 2011 : chaîne de distribution (côté boîte) qui casse. Ensuite : correct.", verif: "Bruit de chaîne (sifflement) au ralenti, factures de chaîne.",
    question: "la chaîne de distribution a-t-elle été changée ?", risque: [0.2, 1500, 3000], distri: "chaine", kmVie: 280000,
  },
  { id: "n57", type: "moteur", nom: "3.0 diesel BMW (N57 / B57)", marques: ["bmw"], re: /\b[1-7]?(30|35|40)d\b|drive(30|35|40)d\b|\bm50d\b/, avis: "robuste", detail: "Six cylindres diesel très endurant.", verif: "Entretien suivi, volet de turbulence.", distri: "chaine", kmVie: 350000 },
  {
    id: "n20", type: "moteur", nom: "2.0 essence BMW (N20) et 1.6 (N13)", marques: ["bmw"], re: /\b[1-6]?(14|16|18|20|25|28)i\b|drive(14|16|18|20|25|28)i\b/,
    si: (c) => c.annee != null && c.annee >= 2011 && c.annee <= 2015, avis: "fragile",
    detail: "Guides de chaîne de distribution fragiles sur ces années.", verif: "Bruit de chaîne à froid, factures de chaîne.",
    question: "la chaîne de distribution a-t-elle été changée ?", risque: [0.15, 1500, 3000], distri: "chaine", kmVie: 230000,
  },
  { id: "b48", type: "moteur", nom: "Essence BMW B38 / B48 / B58", marques: ["bmw", "mini"], re: /\b[1-8]?(18|20|30|40)i\b|drive(18|20|30|40)i\b|\bm(135|140|235|240|340|440)i\b|\bm40i\b/, si: (c) => c.annee != null && c.annee >= 2016, avis: "robuste", detail: "Génération de moteurs réputée solide.", verif: "Entretien suivi.", distri: "chaine", kmVie: 260000 },
  {
    id: "n54", type: "moteur", nom: "3.0 biturbo BMW (N54 / N55)", marques: ["bmw"], re: /\b(135|335|435|535)i\b|\bm(135|235)i\b|\b1m\b/,
    avis: (c) => (avant(2010)(c) ? "fragile" : "correct"),
    detail: "N54 (jusqu'en 2010) : pompe haute pression, injecteurs et wastegates. N55 : correct, fuites d'huile classiques.", verif: "Ratés, perte de puissance, fuites d'huile, factures.",
    question: "la pompe haute pression et les injecteurs ont-ils été changés ?", risque: [0.2, 800, 2500], distri: "chaine", kmVie: 250000,
  },
  { id: "s65", type: "moteur", nom: "V8 4.0 BMW M3 (S65)", marques: ["bmw"], re: /\bm3\b/, si: (c) => c.annee != null && c.annee >= 2007 && c.annee <= 2013, avis: "fragile", detail: "Coussinets de bielle à remplacer préventivement : facture indispensable.", verif: "Facture de coussinets, actionneurs de papillons.", question: "les coussinets de bielle ont-ils été remplacés (facture) ?", risque: [0.15, 2500, 4500], distri: "chaine", kmVie: 200000 },
  {
    id: "om651", type: "moteur", nom: "2.1 diesel Mercedes (OM651)", marques: ["mercedes", "mercedes-benz"], re: /\b[a-z]{0,3} ?(180|200|220|250) ?(cdi|d|bluetec)\b/,
    avis: (c) => (avant(2012)(c) ? "fragile" : "correct"),
    detail: "Jusqu'en 2012 : injecteurs (Delphi) et chaîne. Ensuite : correct.", verif: "Ratés au ralenti, fumée, factures d'injecteurs.",
    question: "les injecteurs ont-ils déjà été changés ?", risque: [0.15, 1000, 2500], distri: "chaine", kmVie: 300000,
  },
  { id: "om642", type: "moteur", nom: "V6 3.0 diesel Mercedes (OM642)", marques: ["mercedes", "mercedes-benz"], re: /\b[a-z]{0,3} ?(320|350) ?(cdi|d|bluetec)\b/, avis: "correct", detail: "V6 endurant ; refroidisseur d'huile qui fuit fréquemment.", verif: "Fuite d'huile entre les culasses.", risque: [0.15, 900, 1600], distri: "chaine", kmVie: 330000, frequent: true },
  { id: "tdci20", type: "moteur", nom: "2.0 TDCi", marques: ["ford", "volvo"], re: /\b2[.,]0 ?tdci\b/, avis: "robuste", detail: "Diesel solide.", verif: "Distribution, double volant moteur.", distri: "courroie", kmVie: 300000 },
  { id: "ford-essence", type: "moteur", nom: "Essence Ford 1.25 / 1.4 / 1.6 Ti-VCT", marques: ["ford", "mazda"], re: /\b1[.,](25|4|6) ?(ti-?vct|16 ?v|duratec)\b/, avis: "correct", detail: "Atmosphériques simples.", verif: "Distribution.", distri: "courroie", kmVie: 230000 },
  { id: "ecoboost", type: "moteur", nom: "EcoBoost 1.5 / 1.6 / 2.0 / 2.3", marques: ["ford", "volvo"], re: /\b(1[.,][56]|2[.,][03]) ?eco ?boost\b|\bfocus ?rs\b|\bfocus ?st\b/, avis: "correct", detail: "Turbo essence correct, refroidissement à surveiller.", verif: "Liquide de refroidissement, factures.", kmVie: 220000 },
  { id: "multijet13", type: "moteur", nom: "1.3 Multijet / CDTI", marques: ["fiat", "opel", "lancia", "alfa romeo", "suzuki"], re: /\b1[.,]3\b.{0,6}\b(multijet|mjt|jtd|cdti|ddis)\b|\b(multijet|mjt)\b.{0,6}\b1[.,]3\b/, avis: "robuste", detail: "Petit diesel à chaîne très endurant.", verif: "Vanne EGR, FAP.", distri: "chaine", kmVie: 300000 },
  { id: "twinair", type: "moteur", nom: "0.9 TwinAir", marques: ["fiat", "alfa romeo", "lancia"], re: /twin ?air/, avis: "fragile", detail: "Actuateur MultiAir et consommation réelle élevée.", verif: "Ratés, voyant moteur, consommation.", question: "y a-t-il eu des soucis d'actuateur ou de voyant moteur ?", risque: [0.15, 900, 1800], distri: "courroie" },
  { id: "multiair", type: "moteur", nom: "1.4 MultiAir", marques: ["fiat", "alfa romeo", "jeep", "lancia"], re: /multi ?air/, avis: "fragile", detail: "Actuateur MultiAir fragile.", verif: "Ratés, voyant moteur.", question: "l'actuateur MultiAir a-t-il déjà été changé ?", risque: [0.15, 800, 1500], distri: "courroie" },
  { id: "gdi16", type: "moteur", nom: "1.6 GDi", marques: ["hyundai", "kia"], re: /\b1[.,]6 ?gdi\b/, avis: (c) => (avant(2016)(c) ? "fragile" : "correct"), detail: "Consommation d'huile et usure des segments sur les premières années.", verif: "Consommation d'huile, bruit moteur.", question: "consomme-t-elle de l'huile ?", risque: [0.12, 1500, 4000], distri: "chaine" },
  { id: "crdi", type: "moteur", nom: "1.6 / 1.7 CRDi", marques: ["hyundai", "kia"], re: /\b1[.,][4-7] ?crdi\b/, avis: "correct", detail: "Diesel sans défaut majeur.", verif: "Embrayage, FAP.", distri: "chaine", kmVie: 260000 },
  { id: "volvo5", type: "moteur", nom: "Volvo 5 cylindres (D5, T5)", marques: ["volvo"], re: /\bd5\b|\bt5\b|\b2[.,]4 ?d\b/, avis: "robuste", detail: "Cinq cylindres très endurant.", verif: "Distribution, entretien.", distri: "courroie", kmVie: 350000 },
  { id: "porsche-ims", type: "moteur", nom: "Flat-6 Porsche M96 / M97", marques: ["porsche"], re: /\b911\b|\b996\b|\b997\b|boxster|cayman/, si: (c) => c.annee != null && c.annee <= 2008, avis: "fragile", detail: "Roulement d'arbre intermédiaire (IMS) et ovalisation des cylindres : facture du kit IMS très recherchée.", verif: "Facture du roulement IMS, endoscopie des cylindres.", question: "le roulement IMS a-t-il été remplacé (facture) ?", risque: [0.08, 2500, 15000], distri: "chaine", kmVie: 200000 },
  { id: "suzuki", type: "moteur", nom: "Essence Suzuki 1.2 / 1.3 / 1.5", marques: ["suzuki"], re: /\b1[.,][235]\b|vvt|dualjet/, si: (c) => !/diesel/.test(c.energie) && !/ddis|diesel/.test(c.t), avis: "robuste", detail: "Mécanique simple et solide.", verif: "Rouille, embrayage.", distri: "chaine", kmVie: 250000 },
  { id: "sce-mpi", type: "moteur", nom: "Essence Renault 1.0 SCe / 1.6 MPI / 0.9 et 1.0 TCe", marques: ["renault", "dacia", "nissan"], re: /\b1[.,]0 ?sce\b|\bsce ?(65|70|75)\b|\b1[.,]6 ?(mpi|16 ?v)\b|\b0[.,]9 ?tce\b|\btce ?(90|100)\b/, avis: "correct", detail: "Moteurs simples, sans défaut majeur connu.", verif: "Entretien régulier.", kmVie: 230000 },
  { id: "tce13", type: "moteur", nom: "1.3 TCe (H5H)", marques: ["renault", "dacia", "nissan", "mercedes"], re: /\b1[.,]3 ?tce\b|\btce ?(130|140|160)\b/, avis: "correct", detail: "Turbo essence moderne à chaîne, sans défaut majeur connu.", verif: "Entretien régulier.", distri: "chaine", kmVie: 240000 },
];

const flat = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’‘]/g, "'");
const normMarque = (s: string) => flat(s).replace(/-benz$/, "").trim();

/** Marque lue dans l'annonce (« Marque : Audi »), sinon le premier mot du titre. */
export function marqueDe(texte: string, titre = "") {
  const m = texte.match(/^\s*-?\s*Marque\s*:\s*(.+)$/im)?.[1] ?? titre.split(/\s+/)[0] ?? "";
  return normMarque(m);
}

export const estPremium = (marque: string) => PREMIUM.includes(normMarque(marque));

/** Fiches qui concernent cette annonce : moteur(s), boîte, batterie. Une fiche par identifiant. */
export function connaissancesDe(a: { texte: string; titre?: string; marque?: string; annee: number | null; km?: number | null; energie?: string }): Connu[] {
  const t = flat(`${a.titre ?? ""} ${a.texte}`.slice(0, 3000));
  const marque = normMarque(a.marque || marqueDe(a.texte, a.titre));
  const ctx: Ctx = { t, marque, annee: a.annee, km: a.km ?? null, energie: flat(a.energie ?? "") };
  const out: Connu[] = [];
  for (const f of FICHES) {
    if (f.marques && marque && !f.marques.includes(marque)) continue;
    if (!f.re.test(t) || (f.si && !f.si(ctx))) continue;
    const avis = typeof f.avis === "function" ? f.avis(ctx) : f.avis;
    if (!avis) continue;
    const { id, type, nom, detail, verif, question, risque, distri, kmVie, slug, frequent, plus } = f;
    out.push({ id, type, nom, avis, detail, verif, question, risque, distri, kmVie, slug, frequent, ...(plus ? plus(ctx) : {}) });
  }
  // une boîte précise (DQ200) l'emporte sur la fiche générale (DSG)
  const ids = new Set(out.map((c) => c.id));
  return out.filter((c) => !(c.id === "dsg" && ids.has("dq200")) && !(c.id === "ecoboost" && ids.has("ecoboost10")));
}

export const ORDRE_AVIS: Record<Avis, number> = { eviter: 0, fragile: 1, correct: 2, robuste: 3 };
export const LIBELLE_AVIS: Record<Avis, string> = { eviter: "à éviter", fragile: "fragile", correct: "correct", robuste: "robuste" };
