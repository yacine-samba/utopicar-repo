/* Pages publiques « Moteurs et boîtes à éviter » (/moteur/...) : un guide par moteur ou boîte que l'outil signale
   sur chaque annonce (EVITER_GLOBAL de lib/analyse/fiabilite.ts, même ordre : `index`). Textes de référence, prudents :
   ce sont des défauts connus et documentés, pas une fatalité ; les coûts sont des ordres de grandeur en garage indépendant. */

export type Moteur = {
  slug: string;
  /** position dans EVITER_GLOBAL (lien depuis les pages de cote et les rapports) */
  index: number;
  nom: string;
  titre: string;
  description: string;
  resume: string;
  probleme: string[];
  annees: string;
  modeles: string[];
  /** bases du catalogue concernées (« peugeot 208 »), pour relier les pages de cote */
  marques: string[];
  verifier: string[];
  couts: [string, string][];
  conseil: string;
};

export const MOTEURS: Moteur[] = [
  {
    slug: "puretech",
    index: 0,
    nom: "1.0 et 1.2 PureTech / VTi (3 cylindres)",
    titre: "Moteur 1.2 PureTech : problèmes, années concernées et que vérifier",
    description: "Courroie de distribution dans l'huile, consommation d'huile : ce qu'il faut savoir avant d'acheter une Peugeot, Citroën, DS ou Opel 1.2 PureTech d'occasion.",
    resume: "Le 3 cylindres essence de Stellantis équipe des millions de Peugeot, Citroën, DS et Opel. Sa courroie de distribution baigne dans l'huile et se dégrade avant l'heure ; certains moteurs consomment aussi beaucoup d'huile.",
    probleme: [
      "La courroie de distribution tourne dans l'huile moteur. En vieillissant, elle se délite : des morceaux bouchent la crépine de la pompe à huile, la pression chute et le moteur peut casser.",
      "Une consommation d'huile anormale est fréquente. Un moteur qui manque d'huile s'use vite, et un niveau bas aggrave l'usure de la courroie.",
      "Le constructeur a raccourci l'intervalle de remplacement de la courroie et mis en place un programme de prise en charge sous conditions (âge, kilométrage, entretien suivi dans le réseau).",
    ],
    annees: "Moteurs à courroie fabriqués de 2012 à 2022 environ (68 à 130 ch). Les versions 1.0 et 1.2 VTi atmosphériques (68, 72, 82 ch) appartiennent à la même famille.",
    modeles: ["Peugeot 108, 208, 2008, 308, 3008, 5008", "Citroën C1, C3, C3 Aircross, C4, C4 Cactus, C-Elysée", "DS 3, DS 4, DS 7", "Opel Corsa F, Crossland, Grandland"],
    marques: ["peugeot", "citroen", "ds", "opel"],
    verifier: [
      "La facture du dernier remplacement de courroie, avec la date et le kilométrage.",
      "Le carnet d'entretien : vidanges régulières, avec l'huile préconisée.",
      "Le niveau d'huile à la jauge, moteur froid, et l'absence de voyant de pression d'huile.",
      "Une fumée bleue à l'échappement ou une odeur d'huile brûlée.",
      "L'éligibilité au programme de prise en charge du constructeur, à vérifier auprès d'un concessionnaire avec le numéro de série.",
    ],
    couts: [
      ["Remplacement de la courroie de distribution", "600 à 1 000 €"],
      ["Nettoyage de la crépine et du carter", "300 à 600 €"],
      ["Moteur d'échange", "4 000 € et plus"],
    ],
    conseil: "Sans facture de courroie récente, négociez le prix de son remplacement, ou passez votre chemin si le kilométrage est élevé.",
  },
  {
    slug: "thp",
    index: 1,
    nom: "1.6 THP",
    titre: "Moteur 1.6 THP : chaîne de distribution, calamine, que vérifier",
    description: "Chaîne de distribution, calamine, consommation d'huile : les points faibles du 1.6 THP (Peugeot, Citroën, DS, Mini) et ce qu'il faut contrôler avant d'acheter.",
    resume: "Le 1.6 THP turbo essence (moteur « Prince » conçu avec BMW) est vif mais fragile : chaîne de distribution qui s'allonge, calamine et consommation d'huile.",
    probleme: [
      "La chaîne de distribution et son tendeur s'usent : la chaîne s'allonge, ce qui se traduit par un bruit de claquement au démarrage à froid. Laissée en l'état, elle peut sauter une dent et casser le moteur.",
      "L'injection directe encrasse les soupapes d'admission (calamine) : ratés, perte de puissance, voyant moteur.",
      "Consommation d'huile, fuites au niveau du couvre-culasse, pompe à eau et pompe haute pression sont aussi signalées.",
    ],
    annees: "Surtout les moteurs de 2006 à 2012 ; les versions plus récentes ont été améliorées sans être exemptes de défauts.",
    modeles: ["Peugeot 207, 208 GTi, 308, 3008, 5008, 508, RCZ", "Citroën C4, DS3, DS4, DS5", "Mini Cooper S (R56)"],
    marques: ["peugeot", "citroen", "ds", "mini"],
    verifier: [
      "Démarrage moteur froid : un claquement de quelques secondes signale une chaîne à remplacer.",
      "La facture d'un remplacement de chaîne et de tendeur, s'il a été fait.",
      "Le niveau d'huile et l'historique des vidanges (rapprochées, c'est mieux).",
      "L'absence de voyant moteur et de ratés à l'accélération.",
    ],
    couts: [
      ["Kit chaîne de distribution", "1 000 à 1 500 €"],
      ["Décalaminage des soupapes", "400 à 800 €"],
      ["Pompe à eau", "300 à 500 €"],
    ],
    conseil: "Écoutez toujours le démarrage à froid : demandez au vendeur de ne pas faire tourner le moteur avant votre arrivée.",
  },
  {
    slug: "vti-prince",
    index: 2,
    nom: "1.4 et 1.6 VTi (moteur Prince)",
    titre: "Moteur 1.4 / 1.6 VTi : chaîne de distribution et consommation d'huile",
    description: "Les 1.4 et 1.6 VTi atmosphériques (Peugeot, Citroën, Mini) : chaîne, variateur de distribution, consommation d'huile. Que vérifier avant d'acheter.",
    resume: "Version atmosphérique du moteur Prince, le 1.6 VTi 120 ch partage plusieurs faiblesses du THP : chaîne de distribution, variateur et consommation d'huile.",
    probleme: [
      "La chaîne de distribution et le variateur de calage s'usent : bruit au démarrage, voyant moteur, fonctionnement irrégulier.",
      "Une consommation d'huile élevée est fréquente avec le kilométrage.",
    ],
    annees: "Moteurs de 2006 à 2014 environ.",
    modeles: ["Peugeot 207, 208, 308, 2008, 3008", "Citroën C3, C4, DS3, C-Elysée", "Mini Cooper (R56)"],
    marques: ["peugeot", "citroen", "ds", "mini"],
    verifier: [
      "Démarrage à froid sans claquement ni bruit de chaîne.",
      "Factures de distribution et de vidanges.",
      "Niveau d'huile et absence de fumée bleue.",
    ],
    couts: [
      ["Kit chaîne de distribution", "900 à 1 400 €"],
      ["Variateur de calage", "300 à 600 €"],
    ],
    conseil: "Préférez les versions avec facture de chaîne, ou un autre moteur du même modèle (HDi, 1.4 8 soupapes).",
  },
  {
    slug: "ecoboost",
    index: 3,
    nom: "1.0 EcoBoost",
    titre: "Moteur Ford 1.0 EcoBoost : surchauffe, courroie dans l'huile, que vérifier",
    description: "Le 1.0 EcoBoost de Ford (Fiesta, Focus, Puma…) : risques de surchauffe sur les premières années, courroie humide. Ce qu'il faut contrôler avant d'acheter.",
    resume: "Le petit 3 cylindres turbo de Ford est sobre et agréable, mais les premières séries ont connu des surchauffes, et sa courroie de distribution tourne elle aussi dans l'huile.",
    probleme: [
      "Sur les premières années, des fuites de liquide de refroidissement (durites, vase d'expansion) ont pu entraîner une surchauffe et une casse moteur.",
      "La courroie de distribution baigne dans l'huile : elle doit être remplacée à temps et l'huile préconisée respectée.",
    ],
    annees: "Les moteurs de 2012 à 2015 sont les plus exposés à la surchauffe.",
    modeles: ["Ford Fiesta, Focus, B-Max, C-Max, EcoSport, Puma, Kuga"],
    marques: ["ford"],
    verifier: [
      "Le niveau de liquide de refroidissement, moteur froid, et l'absence de traces de fuite.",
      "L'absence d'alerte de température pendant l'essai, y compris après un trajet un peu soutenu.",
      "Les factures : rappel constructeur effectué, vidanges, courroie si le kilométrage l'impose.",
    ],
    couts: [
      ["Remplacement de la courroie de distribution", "700 à 1 100 €"],
      ["Durite ou vase d'expansion", "100 à 300 €"],
      ["Moteur après surchauffe", "3 500 € et plus"],
    ],
    conseil: "Une surchauffe passée se voit rarement : exigez l'historique d'entretien complet.",
  },
  {
    slug: "tce-115-120",
    index: 4,
    nom: "1.2 TCe 115, 120 et 130",
    titre: "Moteur Renault 1.2 TCe 115 / 120 : consommation d'huile et casse",
    description: "Le 1.2 TCe de Renault, Dacia et Nissan (2012-2016) : consommation d'huile pouvant aller jusqu'à la casse. Que vérifier avant d'acheter une Clio, un Captur ou une Mégane.",
    resume: "Le 4 cylindres turbo essence 1.2 TCe (115 à 130 ch) des années 2012 à 2016 est connu pour consommer de l'huile, parfois jusqu'à la casse moteur.",
    probleme: [
      "Une consommation d'huile excessive, liée à la segmentation, use le moteur ; à niveau trop bas, la distribution et les coussinets souffrent, jusqu'à la casse.",
      "Le constructeur a fait évoluer le moteur et a pris en charge certains cas : renseignez-vous auprès du réseau.",
    ],
    annees: "Moteurs fabriqués de 2012 à 2016 environ.",
    modeles: ["Renault Clio IV, Captur, Mégane III et IV, Scénic, Kadjar, Kangoo", "Dacia Duster, Lodgy, Dokker", "Nissan Juke, Qashqai, Pulsar (1.2 DIG-T)"],
    marques: ["renault", "dacia", "nissan", "mercedes"],
    verifier: [
      "Le niveau d'huile à la jauge et le témoin de niveau d'huile.",
      "Les factures de vidange et d'éventuelles interventions du réseau sur le moteur.",
      "L'absence de fumée bleue et de cliquetis moteur.",
    ],
    couts: [
      ["Réfection moteur (segmentation)", "2 000 à 3 500 €"],
      ["Moteur d'échange", "3 500 € et plus"],
    ],
    conseil: "Sur ces années, le 0.9 TCe 90 ou le 1.5 dCi sont des choix plus sûrs pour une Clio ou un Captur.",
  },
  {
    slug: "d-4d",
    index: 5,
    nom: "2.0 et 2.2 D-4D",
    titre: "Moteur Toyota 2.0 / 2.2 D-4D : joint de culasse, que vérifier",
    description: "Les diesels Toyota 2.0 et 2.2 D-4D (Avensis, RAV4, Auris, Corolla Verso) : défaut de joint de culasse et consommation d'huile. Ce qu'il faut contrôler.",
    resume: "Toyota est réputé fiable, sauf ses diesels 2.0 et 2.2 D-4D de la fin des années 2000 : joint de culasse et consommation d'huile.",
    probleme: [
      "Le joint de culasse et la culasse elle-même peuvent se déformer : perte de liquide de refroidissement, surchauffe, fumée blanche.",
      "Une consommation d'huile et l'encrassement de la vanne EGR et du filtre à particules sont aussi signalés.",
    ],
    annees: "Surtout les moteurs de 2006 à 2009 ; Toyota a pris en charge de nombreux cas à l'époque.",
    modeles: ["Toyota Avensis, RAV4, Auris, Corolla, Corolla Verso"],
    marques: ["toyota"],
    verifier: [
      "Le niveau de liquide de refroidissement et l'absence de fumée blanche à chaud.",
      "Les factures : remplacement du joint de culasse ou du moteur par le réseau.",
      "L'absence de voyant moteur et de perte de puissance (EGR, FAP).",
    ],
    couts: [
      ["Joint de culasse et surfaçage", "1 500 à 2 500 €"],
      ["Vanne EGR", "300 à 700 €"],
    ],
    conseil: "Chez Toyota, préférez l'essence ou l'hybride sur ces années, ou le 1.4 D-4D, plus simple.",
  },
  {
    slug: "boites-robotisees",
    index: 6,
    nom: "Boîtes robotisées et à double embrayage",
    titre: "Boîtes EDC, DSG, Powershift : les boîtes automatiques à éviter en occasion",
    description: "EDC, DSG7, Powershift, Easytronic, BMP6, MMT, Quickshift : les boîtes robotisées et à double embrayage réputées fragiles, et comment les tester avant d'acheter.",
    resume: "Beaucoup de boîtes « automatiques » de citadines et compactes sont en fait des boîtes manuelles robotisées ou à double embrayage sec. Elles coûtent cher à réparer quand l'embrayage ou la mécatronique fatigue.",
    probleme: [
      "Les boîtes à double embrayage sec (EDC de Renault, DSG7 DQ200 du groupe Volkswagen, Powershift de Ford) usent leurs embrayages et leur électronique de commande (mécatronique) : à-coups, patinage, voyant, passage en mode dégradé.",
      "Les boîtes manuelles robotisées (Easytronic d'Opel, BMP6 et ETG de Peugeot et Citroën, MMT de Toyota, Quickshift de Renault) sont lentes et leurs actionneurs tombent en panne.",
    ],
    annees: "Toutes années, avec plus de cas sur les premières générations de chaque boîte.",
    modeles: ["Renault et Dacia EDC, Twingo Quickshift", "Volkswagen, Audi, Seat, Skoda DSG7 (7 rapports à sec)", "Ford Powershift", "Opel Easytronic", "Peugeot et Citroën BMP6, ETG, EGS", "Toyota MMT"],
    marques: [],
    verifier: [
      "L'essai : démarrages en côte, marche arrière, manœuvres lentes. Aucun à-coup, aucun patinage, aucun bruit de cliquetis.",
      "L'absence de voyant boîte ou de message de défaut au tableau de bord.",
      "Les factures : vidange de boîte (DSG), remplacement d'embrayage ou de mécatronique.",
    ],
    couts: [
      ["Embrayage double", "1 200 à 2 000 €"],
      ["Mécatronique ou calculateur de boîte", "1 500 à 2 500 €"],
      ["Actionneur de boîte robotisée", "500 à 1 200 €"],
    ],
    conseil: "Une vraie boîte automatique à convertisseur (EAT6, EAT8, AT) ou une boîte manuelle est souvent un meilleur achat.",
  },
];

export const moteurParSlug = (slug: string) => MOTEURS.find((m) => m.slug === slug) ?? null;
export const moteurParIndex = (i: number) => MOTEURS.find((m) => m.index === i) ?? null;
