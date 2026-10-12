/* Fausse base de démonstration du tableau de bord Benef Pro (master60) : les lignes que TableauComplet
   (web/src/app/app/page.tsx) lit dans Supabase (parc, rapports, annonces_trouvees). Les chiffres affichés
   (grands chiffres, votre journée, âge du stock, marges…) sont ensuite CALCULÉS par le code de l'app
   (lib/parc : statsParc, margeReelle, margePrevue, joursStock), comme sur le site.
   Pour changer un chiffre : modifier ces lignes puis relancer « npm run tout ».

   Ce que ces données font calculer à l'app (date figée au samedi 10 octobre 2026, 10 h 30) :
   - Marge réalisée ce mois 4 860 € (5 ventes en octobre), + 3 870 € par rapport à septembre (1 vente, 990 €)
   - Marge en attente + 6 600 € sur les 8 voitures du stock ; capital immobilisé 23 800 € ; rotation moyenne 23 j
   - Votre journée : 308 à 63 jours (rouge), Captur à 48 jours, affaire GO Yaris + 1 240 €, A3 − 18 % sous la cote
   - Parc : 3 repérées, 2 achetées, 2 en préparation, 4 en vente, 6 vendues */
import { ilYaJours } from "./horloge";
import type { Vehicule } from "@/lib/parc";

/** Le compte affiché (les champs de Compte dont le tableau de bord se sert). */
export const COMPTE = {
  prenom: "Yacine",
  illimite: false,
  messages: false, // option « Messages Leboncoin » non prise
  utilisees: 82,
  offre: { analyses: 400, recherche: true }, // OFFRES.pro
  get restantes() {
    return this.offre.analyses - this.utilisees;
  },
};

/* ---------- Le parc ---------- */
let n = 0;
const v = (x: Partial<Vehicule> & Pick<Vehicule, "titre" | "statut">): Vehicule => ({
  id: `demo-${++n}`,
  immat: null,
  prix_achat: null,
  frais: 0,
  prix_vente: null,
  date_achat: null,
  date_vente: null,
  notes: null,
  rapport_id: null,
  created_at: ilYaJours(90),
  photos: [],
  ...x,
});
/** Voiture en stock depuis `j` jours, avec son prix conseillé (marge prévue = conseillé − achat − frais). */
const stock = (titre: string, statut: Vehicule["statut"], j: number, achat: number, frais: number, marge: number) =>
  v({ titre, statut, prix_achat: achat, frais, prix_conseille: achat + frais + marge, date_achat: ilYaJours(j), created_at: ilYaJours(j + 3) });
/** Voiture vendue il y a `depuis` jours, restée `j` jours en stock. */
const vendue = (titre: string, depuis: number, j: number, achat: number, frais: number, vente: number) =>
  v({ titre, statut: "vendu", prix_achat: achat, frais, prix_vente: vente, date_achat: ilYaJours(depuis + j), date_vente: ilYaJours(depuis), created_at: ilYaJours(depuis + j + 4) });

// L'ordre compte : le graphique « Marge par voiture » montre les marges prévues dans l'ordre du parc (12 barres au plus).
export const PARC: Vehicule[] = [
  // en stock : 8 voitures, 23 800 € d'achats et de frais, 6 600 € de marge prévue
  stock("Citroën C3 PureTech 82 Feel", "en_vente", 21, 2800, 200, 1240),
  stock("Dacia Sandero Stepway TCe 90", "preparation", 9, 2450, 200, 980),
  stock("Renault Captur TCe 90 Intens", "en_vente", 48, 4600, 250, 620),
  stock("Peugeot 308 1.5 BlueHDi 130 Allure", "en_vente", 63, 6900, 300, 450),
  stock("Renault Clio III 1.2 16V 75 Dynamique", "en_vente", 33, 1700, 200, 820),
  stock("Renault Twingo II 1.2 LEV 16V 75", "achete", 5, 1500, 0, 1160),
  stock("Peugeot 206+ 1.1 60 Urban", "preparation", 14, 1150, 150, 690),
  stock("Citroën C1 1.0 68 Attraction", "achete", 2, 1400, 0, 640),
  // vendues : 5 en octobre (4 860 €), 1 en septembre (990 €) ; 23 jours en moyenne de l'achat à la vente
  vendue("Volkswagen Golf VI 1.6 TDI 105 Confortline", 2, 18, 6200, 480, 7800),
  vendue("Peugeot 207 1.4 VTi 95 Active", 4, 26, 3400, 340, 4600),
  vendue("Citroën C4 Picasso 1.6 HDi 110", 6, 41, 4100, 570, 5400),
  vendue("Renault Mégane III 1.5 dCi 110 Bose", 7, 15, 5300, 390, 7100),
  vendue("Ford Fiesta 1.25 82 Trend", 8, 22, 3900, 260, 4900),
  vendue("Toyota Auris 1.33 VVT-i Dynamic", 16, 16, 6500, 410, 7900),
  // repérées cette semaine (au-delà de 7 jours, la page demanderait de décider)
  v({ titre: "Skoda Fabia III 1.0 MPI 75 Ambition", statut: "repere", created_at: ilYaJours(2) }),
  v({ titre: "Kia Picanto 1.0 66 Active", statut: "repere", created_at: ilYaJours(4) }),
  v({ titre: "Opel Corsa E 1.4 90 Enjoy", statut: "repere", created_at: ilYaJours(6) }),
];

/* ---------- Rapports d'analyse Benef ---------- */
export type LigneRapport = { id: string; titre: string; created_at: string; prix: number | null; verdict: string | null; marge: number | null; note: number | null; photos: string[]; lien: string | null };
/** Rapports favorables de la semaine, meilleure marge d'abord (aucun n'est encore dans le parc). */
export const SEMAINE_GO: LigneRapport[] = [
  { id: "demo-r1", titre: "Toyota Yaris 100 VVT-i Dynamic", created_at: ilYaJours(1), prix: 8990, verdict: "Très bonne affaire", marge: 1240, note: 84, photos: [], lien: null },
  { id: "demo-r2", titre: "Renault Clio IV 0.9 TCe 90 Zen", created_at: ilYaJours(3), prix: 7450, verdict: "Bonne affaire", marge: 980, note: 78, photos: [], lien: null },
  { id: "demo-r3", titre: "Peugeot 208 1.6 BlueHDi 100 Active", created_at: ilYaJours(5), prix: 8200, verdict: "Bonne affaire", marge: 760, note: 74, photos: [], lien: null },
];
/** Rapports du mois (une analyse = un rapport) : 9 favorables sur 82. */
const MARGES_GO_MOIS = [1240, 980, 760, 910, 640, 1180, 520, 870, 730];
export const MOIS: { id: string; marge: number | null; verdict: string }[] = Array.from({ length: COMPTE.utilisees }, (_, i) =>
  i < MARGES_GO_MOIS.length
    ? { id: `m${i}`, marge: MARGES_GO_MOIS[i], verdict: i < 3 ? SEMAINE_GO[i].verdict! : i % 2 ? "Bonne affaire" : "À négocier" }
    : { id: `m${i}`, marge: -200 - ((i * 137) % 1900), verdict: i % 3 ? "À creuser" : "À éviter" },
);

/* ---------- Annonces trouvées par ses recherches ces 7 derniers jours ---------- */
type Trouvee = { cle: string; titre: string; prix: number | null; annee: number | null; km: number | null; lieu: string | null; url: string | null; photo: string | null; cote: { P: number | null; pct: number | null } | null; recherche: string | null };
const annonce = (cle: string, titre: string, prix: number, cote: number, annee: number, km: number, lieu: string, recherche: string, num: number): Trouvee => ({
  cle,
  titre,
  prix,
  annee,
  km,
  lieu,
  // lien factice (jamais affiché) : il fait apparaître les boutons « Analyser » et « Voir l'annonce » comme sur le site
  url: `https://www.leboncoin.fr/ad/voitures/100000000${num}`,
  photo: null,
  cote: { P: cote, pct: (cote - prix) / cote },
  recherche,
});
export const FRAIS: Trouvee[] = [
  annonce("demo-a3", "Audi A3 Sportback 35 TFSI S line", 16490, 20100, 2019, 68400, "Lyon 69003", "Audi A3", 1),
  annonce("demo-clio5", "Renault Clio V 1.0 TCe 90 Intens", 12990, 15100, 2021, 41200, "Nantes 44000", "Clio V", 2),
  annonce("demo-polo", "Volkswagen Polo VI 1.0 TSI 95 Lounge", 11490, 13050, 2018, 74900, "Lille 59000", "Polo VI", 3),
  annonce("demo-2008", "Peugeot 2008 II 1.2 PureTech 130 Allure", 15790, 17750, 2020, 52300, "Bordeaux 33000", "2008 II", 4),
];
