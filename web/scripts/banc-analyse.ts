/* Banc d'essai de l'analyse (règles de l'outil, sans IA ni base) : `npm run banc`.
   1. Sans argument : 26 annonces types, chacune avec ce qu'on attend (verdict pour rouler avec et pour revendre,
      moteur reconnu, vigilance). Le script dit ce qui passe et ce qui casse ; à relancer après chaque réglage du bilan.
   2. `npm run banc -- --dossier chemin/` : chaque fichier .txt du dossier est une vraie annonce copiée (texte de la page,
      ou copie de l'extension). Sortie : banc-analyse.csv, à compléter colonne « votre avis » pour mesurer l'écart
      entre l'outil et votre jugement. Une cote facultative se met en première ligne : « COTE 34 6400 7100 7900 »
      (nombre d'annonces, quart bas, médiane, quart haut). */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { lireAnnonce } from "../src/lib/analyse/texte";
import { fiabilite } from "../src/lib/analyse/fiabilite";
import { iaRegles } from "../src/lib/analyse/regles";
import { bilan } from "../src/lib/analyse/bilan";
import { profilParDefaut, type ProfilAnalyse } from "../src/lib/analyse/profil";
import type { Analyse } from "../src/lib/analyse/couts";
import type { VerdictCode } from "../src/lib/analyse/verdicts";

type Cote = { n: number; p25: number; mediane: number; p75: number };
type Cas = {
  nom: string;
  texte: string;
  cote?: Cote;
  /** Verdicts acceptables pour rouler avec (profil particulier débutant) et pour revendre (profil Benef). */
  usage?: VerdictCode[];
  revente?: VerdictCode[];
  /** Fiches moteur ou boîte qui doivent être reconnues, avec leur avis (« puretech:eviter »). */
  connus?: string[];
  vigilance?: "aucune" | "prudence" | "alerte";
};

const A = (o: { t: string; prix: number; marque: string; modele: string; annee: number; km: number; en?: string; bo?: string; cv?: number; ville?: string; d: string }) =>
  `${o.t}\nPrix : ${o.prix.toLocaleString("fr-FR")} €\nMarque : ${o.marque}\nModèle : ${o.modele}\nAnnée : ${o.annee}\nKilométrage : ${o.km.toLocaleString("fr-FR")} km\nÉnergie : ${o.en ?? "Essence"}\nBoîte de vitesse : ${o.bo ?? "Manuelle"}\n${o.cv ? `Puissance fiscale : ${o.cv} CV\n` : ""}Situé à ${o.ville ?? "Lyon 69003"}\nDescription : ${o.d}`;
const C = (n: number, med: number, ecart = 0.12): Cote => ({ n, p25: Math.round(med * (1 - ecart)), mediane: med, p75: Math.round(med * (1 + ecart)) });

const CAS: Cas[] = [
  { nom: "RS3 saine, prix du marché", texte: A({ t: "Audi RS3 Sportback 2.5 TFSI 400 S tronic 7", prix: 41900, marque: "Audi", modele: "RS3", annee: 2018, km: 68000, bo: "Automatique", cv: 32, d: "Carnet complet Audi, factures, pneus neufs, première main." }), cote: C(34, 42900, 0.08), usage: ["excellente", "bonne"], revente: ["negocier", "eviter"], connus: ["tfsi25:robuste", "dsg:robuste"] },
  { nom: "RS3 sous la cote", texte: A({ t: "Audi RS3 8V 2.5 TFSI 367 S tronic", prix: 33500, marque: "Audi", modele: "RS3", annee: 2016, km: 92000, bo: "Automatique", cv: 32, d: "Entretien Audi, factures, vidange boîte faite à 80 000 km." }), cote: C(30, 37900, 0.08), usage: ["excellente", "bonne"], revente: ["bonne", "excellente", "negocier"], connus: ["tfsi25:robuste"] },
  { nom: "Clio dCi embrayage à prévoir", texte: A({ t: "Renault Clio IV 1.5 dCi 90 Business", prix: 5900, marque: "Renault", modele: "Clio", annee: 2014, km: 168000, en: "Diesel", cv: 4, d: "CT ok, quelques rayures sur le pare-choc, vidange faite. Embrayage à prévoir." }), cote: C(120, 6400), usage: ["negocier", "creuser"], revente: ["eviter", "negocier"], connus: ["dci15:correct"] },
  { nom: "Clio essence bien placée", texte: A({ t: "Renault Clio III 1.2 16V 75 Authentique", prix: 3600, marque: "Renault", modele: "Clio", annee: 2010, km: 98000, cv: 4, d: "Distribution faite à 90 000 km, CT vierge, carnet d'entretien complet, deuxième main." }), cote: C(90, 4300), usage: ["excellente", "bonne"], revente: ["bonne", "excellente", "negocier"], connus: ["d4f:robuste"] },
  { nom: "208 PureTech sans preuve de courroie", texte: A({ t: "Peugeot 208 1.2 PureTech 82 Allure", prix: 7500, marque: "Peugeot", modele: "208", annee: 2016, km: 112000, ville: "Paris 75011", d: "Très bon état, CT vierge, entretien suivi." }), cote: C(80, 7900), usage: ["creuser"], revente: ["negocier", "eviter", "creuser"], connus: ["puretech:eviter"] },
  { nom: "208 PureTech courroie refaite", texte: A({ t: "Peugeot 208 1.2 PureTech 110 GT Line", prix: 9900, marque: "Peugeot", modele: "208", annee: 2018, km: 85000, d: "Courroie de distribution changée à 80 000 km (facture), CT ok, entretien Peugeot." }), cote: C(70, 10400), usage: ["bonne", "excellente", "negocier"], connus: ["puretech:eviter"] },
  { nom: "Golf GTI DSG6 entretenue", texte: A({ t: "Volkswagen Golf 7 GTI 2.0 TSI 230 DSG6 Performance", prix: 18500, marque: "Volkswagen", modele: "Golf", annee: 2016, km: 120000, bo: "Automatique", cv: 13, d: "Vidange DSG faite à 100 000 km, factures." }), cote: C(40, 19500), usage: ["bonne", "excellente"], connus: ["dsg:correct", "tfsi-ea888:correct"] },
  { nom: "Polo DSG7 1.2 TSI", texte: A({ t: "Volkswagen Polo 1.2 TSI 90 DSG7 Confortline", prix: 7200, marque: "Volkswagen", modele: "Polo", annee: 2012, km: 140000, bo: "Automatique", d: "Boîte automatique DSG 7 rapports, révisée." }), cote: C(60, 7400), usage: ["creuser", "negocier", "bonne"], connus: ["dq200:fragile", "tsi-ea111:fragile"] },
  { nom: "BMW 320d N47 2009", texte: A({ t: "BMW Série 3 E90 320d 177 Luxe", prix: 6900, marque: "BMW", modele: "Série 3", annee: 2009, km: 210000, en: "Diesel", cv: 8, d: "Bon état général, chaîne de distribution à vérifier, entretien BMW." }), cote: C(55, 7400), usage: ["creuser", "negocier", "eviter"], connus: ["n47:fragile"] },
  { nom: "BMW 330d robuste", texte: A({ t: "BMW Série 3 330d xDrive 258 Luxury", prix: 21900, marque: "BMW", modele: "Série 3", annee: 2015, km: 145000, en: "Diesel", bo: "Automatique", cv: 15, d: "Carnet BMW, factures, boîte ZF 8 rapports vidangée." }), cote: C(25, 23500), usage: ["bonne", "excellente"], connus: ["n57:robuste"] },
  { nom: "Yaris hybride", texte: A({ t: "Toyota Yaris III Hybride 100h Dynamic", prix: 10900, marque: "Toyota", modele: "Yaris", annee: 2017, km: 88000, en: "Hybride", bo: "Automatique", d: "Entretien Toyota, garantie hybride, première main." }), cote: C(90, 11500), usage: ["excellente", "bonne"], connus: ["toyota-hybride:robuste"] },
  { nom: "Zoé batterie en location", texte: A({ t: "Renault Zoe R90 Life", prix: 5900, marque: "Renault", modele: "Zoe", annee: 2018, km: 60000, en: "Électrique", bo: "Automatique", d: "Batterie en location, câble fourni, très bon état." }), cote: C(40, 6900), usage: ["bonne", "negocier", "excellente"], connus: ["location-batterie:fragile"] },
  { nom: "Moteur HS", texte: A({ t: "Peugeot 307 2.0 HDi 110", prix: 900, marque: "Peugeot", modele: "307", annee: 2006, km: 260000, en: "Diesel", d: "Moteur HS, joint de culasse, vendue pour pièces sur plateau." }), cote: C(40, 2500), usage: ["eviter"], revente: ["eviter"] },
  { nom: "Kilométrage non garanti", texte: A({ t: "Renault Mégane III 1.5 dCi 110", prix: 4500, marque: "Renault", modele: "Mégane", annee: 2012, km: 120000, en: "Diesel", d: "Compteur changé, km non garanti, sinon tout fonctionne." }), cote: C(80, 6200), usage: ["eviter"], revente: ["eviter"] },
  { nom: "Arnaque mandat cash", texte: A({ t: "Volkswagen Golf 7 2.0 TDI 150 Carat", prix: 5900, marque: "Volkswagen", modele: "Golf", annee: 2017, km: 90000, en: "Diesel", d: "Je suis actuellement en Belgique pour le travail, la voiture vous est livrée par transporteur. Paiement par coupons Transcash, contactez-moi par mail." }), cote: C(60, 15500), usage: ["eviter"], revente: ["eviter"], vigilance: "alerte" },
  { nom: "Prix trop bas sans explication", texte: A({ t: "Toyota Auris Hybride 136h Design", prix: 6500, marque: "Toyota", modele: "Auris", annee: 2018, km: 80000, en: "Hybride", bo: "Automatique", d: "Très bon état, vente urgente cause départ à l'étranger." }), cote: C(50, 13900), usage: ["creuser", "eviter"], vigilance: "alerte" },
  { nom: "Acompte demandé", texte: A({ t: "Peugeot 3008 1.6 BlueHDi 120 Allure", prix: 15900, marque: "Peugeot", modele: "3008", annee: 2018, km: 95000, en: "Diesel", d: "Beaucoup de demandes : je réserve la voiture contre un virement d'acompte de 500 €." }), cote: C(60, 16500), usage: ["creuser", "eviter"], vigilance: "prudence", connus: ["bluehdi:correct"] },
  { nom: "Twingo Quickshift", texte: A({ t: "Renault Twingo II 1.2 Quickshift Expression", prix: 3200, marque: "Renault", modele: "Twingo", annee: 2011, km: 110000, bo: "Automatique", d: "Boîte quickshift, CT ok." }), cote: C(40, 3600), connus: ["robotisee:eviter"] },
  { nom: "Fiesta Powershift", texte: A({ t: "Ford Fiesta 1.0 EcoBoost 100 Powershift Titanium", prix: 6900, marque: "Ford", modele: "Fiesta", annee: 2015, km: 90000, bo: "Automatique", d: "Bon état, entretien Ford." }), cote: C(50, 7900), usage: ["creuser", "negocier", "eviter"], connus: ["ecoboost10:eviter", "powershift:eviter"] },
  { nom: "Clio RS sportive", texte: A({ t: "Renault Clio IV RS 200 EDC Trophy", prix: 15900, marque: "Renault", modele: "Clio", annee: 2016, km: 70000, bo: "Automatique", cv: 11, d: "Jamais circuit, entretien Renault Sport, factures." }), cote: C(20, 16500), connus: ["rs-renault:robuste", "edc:fragile"] },
  { nom: "M3 E92 coussinets faits", texte: A({ t: "BMW M3 E92 4.0 V8 420 DKG", prix: 39900, marque: "BMW", modele: "M3", annee: 2010, km: 98000, bo: "Automatique", cv: 32, d: "Coussinets de bielle remplacés à 90 000 km (facture), carnet BMW." }), cote: C(12, 41000), connus: ["s65:fragile"] },
  { nom: "Porsche 996 sans facture IMS", texte: A({ t: "Porsche 911 996 Carrera 3.6", prix: 32900, marque: "Porsche", modele: "911", annee: 2003, km: 135000, cv: 24, d: "Belle 996, entretien suivi." }), cote: C(15, 34000), connus: ["porsche-ims:fragile"] },
  { nom: "Mercedes C220 CDI 2010", texte: A({ t: "Mercedes Classe C 220 CDI Avantgarde", prix: 8900, marque: "Mercedes", modele: "Classe C", annee: 2010, km: 190000, en: "Diesel", bo: "Automatique", d: "Factures, 7G-Tronic." }), cote: C(40, 9500), connus: ["om651:fragile", "7g:correct"] },
  { nom: "Sandero GPL économique", texte: A({ t: "Dacia Sandero 1.2 16V 75 GPL Lauréate", prix: 4900, marque: "Dacia", modele: "Sandero", annee: 2013, km: 105000, en: "GPL", d: "Distribution faite, CT ok, carnet." }), cote: C(60, 5300), usage: ["excellente", "bonne"], connus: ["d4f:robuste"] },
  { nom: "Annonce très courte", texte: "Golf 6\nPrix : 6 000 €\nAnnée : 2011\nKilométrage : 160 000 km", usage: ["creuser"] },
  { nom: "Leon Cupra prix haut", texte: A({ t: "Seat Leon Cupra 2.0 TSI 290 DSG", prix: 26900, marque: "Seat", modele: "Leon", annee: 2017, km: 60000, bo: "Automatique", d: "Factures, vidange DSG faite." }), cote: C(25, 23500, 0.08), usage: ["negocier", "creuser"], revente: ["eviter", "negocier"], connus: ["dsg:robuste"] },
];

const PROFILS: Record<"usage" | "revente", ProfilAnalyse> = {
  usage: { ...profilParDefaut("particulier", "Lyon"), rempli: true },
  revente: { ...profilParDefaut("benef", "Lyon"), rempli: true },
};

function analyser(texte: string, cote: Cote | null): Analyse {
  const faits = lireAnnonce(texte);
  const fiab = fiabilite({ texte, annee: faits.annee, km: faits.km, energie: faits.energie });
  return { faits, fiab, cote, ia: iaRegles(texte, faits, fiab, cote), regles: true };
}

const dossier = process.argv.indexOf("--dossier");
if (dossier > 0) {
  const dir = process.argv[dossier + 1];
  const lignes = [["fichier", "titre", "prix", "verdict rouler", "note rouler", "verdict revendre", "note revendre", "bénéfice", "fiable", "travaux", "prix", "vigilance", "moteur et boîte", "votre avis", "commentaire"]];
  for (const nom of readdirSync(dir).filter((x) => x.endsWith(".txt")).sort()) {
    let texte = readFileSync(join(dir, nom), "utf8");
    let cote: Cote | null = null;
    const m = texte.match(/^COTE\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\n/);
    if (m) {
      cote = { n: +m[1], p25: +m[2], mediane: +m[3], p75: +m[4] };
      texte = texte.slice(m[0].length);
    }
    const a = analyser(texte, cote);
    const u = bilan(a, PROFILS.usage);
    const r = bilan(a, PROFILS.revente);
    const rep = (cle: string) => u.piliers.find((x) => x.cle === cle)?.reponse ?? "";
    lignes.push([nom, a.faits.titre, String(a.faits.prix ?? ""), u.libelle, String(u.indice ?? ""), r.libelle, String(r.indice ?? ""), String(r.argent.marge ?? ""), rep("fiabilite"), rep("travaux"), rep("prix"), u.vigilance.niveau, u.connus.map((c) => `${c.nom} (${c.avis})`).join(" ; "), "", ""]);
  }
  const csv = lignes.map((l) => l.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(";")).join("\n");
  writeFileSync("banc-analyse.csv", "﻿" + csv);
  console.log(`${lignes.length - 1} annonce(s) analysée(s) : banc-analyse.csv (séparateur ; pour Excel).`);
} else {
  let ok = 0;
  const echecs: string[] = [];
  for (const c of CAS) {
    const a = analyser(c.texte, c.cote ?? null);
    const u = bilan(a, PROFILS.usage);
    const r = bilan(a, PROFILS.revente);
    const pb: string[] = [];
    if (c.usage && !c.usage.includes(u.verdict)) pb.push(`rouler : ${u.verdict} (attendu ${c.usage.join(" ou ")})`);
    if (c.revente && !c.revente.includes(r.verdict)) pb.push(`revendre : ${r.verdict} (attendu ${c.revente.join(" ou ")})`);
    const vus = new Set(u.connus.map((x) => `${x.id}:${x.avis}`));
    for (const k of c.connus ?? []) if (!vus.has(k)) pb.push(`fiche ${k} non reconnue (vu : ${[...vus].join(", ") || "rien"})`);
    if (c.vigilance && u.vigilance.niveau !== c.vigilance) pb.push(`vigilance : ${u.vigilance.niveau} (attendu ${c.vigilance})`);
    const ligne = `${c.nom.padEnd(36)} rouler ${u.libelle.padEnd(18)} ${String(u.indice ?? "—").padStart(3)}  revendre ${r.libelle.padEnd(18)} ${String(r.indice ?? "—").padStart(3)}  bénéfice ${String(r.argent.marge ?? "—").padStart(7)}`;
    if (pb.length) echecs.push(`✗ ${ligne}\n    ${pb.join("\n    ")}`);
    else {
      ok++;
      console.log(`✓ ${ligne}`);
    }
  }
  if (echecs.length) console.log(`\n${echecs.join("\n")}`);
  console.log(`\n${ok} / ${CAS.length} conformes.`);
  if (echecs.length) process.exitCode = 1;
}
