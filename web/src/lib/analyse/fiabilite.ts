/* Moteurs et boîtes à éviter, modèles fiables : liste fixe, jamais par l'IA.
   Port de EVITER_GLOBAL / FIABLES / fiabRate de l'outil UTOPICAR Garage. */

const BOITE_FRAGILE: [RegExp, string] = [/\bedc\b|\bdsg\b|powershift|easytronic|quickshift|\bmmt\b|2-?tronic|\bbmp ?6\b|bo[iî]te manuelle pilot[eé]e|\betg ?[56]?\b|\begs\b|i-?shift|\bal4\b|\bdp0\b/, "Boîte robotisée ou automatique réputée fragile"];

const EVITER_GLOBAL: [RegExp, string][] = [
  [/pure ?tech|\b1[.,]2 ?vti\b|\b1[.,]0 ?vti\b|\b(68|72|82) ?ch\b.*\b(208|c3|2008|c-?elysee|301)\b/, "1.0 / 1.2 PureTech ou VTi 3 cylindres : courroie dans l'huile, consommation d'huile"],
  [/\bthp\b/, "1.6 THP : chaîne de distribution et calamine"],
  [/\b1[.,][46] ?vti\b/, "1.4 / 1.6 VTi (moteur Prince) : chaîne de distribution fragile"],
  [/eco ?boost/, "1.0 EcoBoost : courroie dans l'huile, surchauffe"],
  [/\btce ?(115|118|120|125)\b|\b1[.,]2 ?tce\b/, "1.2 TCe 115 / 120 : consommation d'huile, casse moteur"],
  [/\b2[.,][02] ?d-?4d\b/, "2.0 / 2.2 D-4D : joint de culasse"],
  BOITE_FRAGILE,
];

type Fiable = {
  id: string;
  nom: string;
  ans: [number, number];
  km: number;
  en: string[];
  bons: string;
  ev: [RegExp, string, number?][];
  pourquoi: string;
  verif: string;
};

const FIABLES: Fiable[] = [
  { id: "clio", nom: "Renault Clio III et IV", ans: [2006, 2016], km: 200000, en: ["essence", "diesel"], bons: "1.2 16V (75 ch), 0.9 TCe 90, 1.5 dCi 75 / 90 avec factures", ev: [], pourquoi: "La citadine la plus demandée de France, pièces partout, revente en quelques jours.", verif: "dCi : injecteurs et fumée au démarrage. Distribution tous les 120 000 km. Clio IV : voyants et écran." },
  { id: "yaris", nom: "Toyota Yaris II et III", ans: [2006, 2016], km: 190000, en: ["essence", "hybride"], bons: "1.0 et 1.33 VVT-i, hybride 100 ch", ev: [[/\bd-?4d\b/, "1.4 D-4D : injecteurs coûteux"]], pourquoi: "Moteurs essence à chaîne quasi inusables, réputation qui fait vendre toute seule.", verif: "Embrayage, bruits de train avant, rouille sous caisse. Hybride : batterie (voyant, ventilateur)." },
  { id: "aygo", nom: "Toyota Aygo, Citroën C1, Peugeot 107 et 108", ans: [2008, 2018], km: 170000, en: ["essence"], bons: "1.0 VVT-i / 1.0 VTi 68 ch (moteur Toyota)", ev: [], pourquoi: "Trio jumeau au même moteur Toyota. Petit prix, très demandé en ville.", verif: "Embrayage (souvent fatigué), joint de boîte, bruits de vitres arrière." },
  { id: "jazz", nom: "Honda Jazz II et III", ans: [2005, 2015], km: 190000, en: ["essence", "hybride"], bons: "1.2 et 1.4 i-VTEC", ev: [[/\bcvt\b/, "Boîte CVT des premières séries fragile"]], pourquoi: "Parmi les voitures les plus fiables jamais vendues, très grand intérieur.", verif: "Boîte auto à éviter, amortisseurs, bruits de train arrière." },
  { id: "swift", nom: "Suzuki Swift", ans: [2006, 2017], km: 180000, en: ["essence"], bons: "1.2 et 1.3 essence", ev: [], pourquoi: "Mécanique simple et solide, peu d'électronique, entretien peu cher.", verif: "Rouille des passages de roue, embrayage." },
  { id: "mazda2", nom: "Mazda 2", ans: [2008, 2014], km: 180000, en: ["essence"], bons: "1.3 et 1.5 essence", ev: [], pourquoi: "Moteurs atmosphériques fiables, souvent bien entretenue.", verif: "Rouille (bas de caisse, arches), amortisseurs." },
  { id: "sandero", nom: "Dacia Sandero et Logan", ans: [2009, 2018], km: 200000, en: ["essence", "diesel", "gpl"], bons: "1.2 16V, 1.6 MPI, 0.9 TCe 90, 1.5 dCi 75 / 90", ev: [], pourquoi: "Mécanique Renault éprouvée, entretien bon marché.", verif: "Finition légère : bruits, usure intérieure. dCi : injecteurs." },
  { id: "207", nom: "Peugeot 207 et 206+", ans: [2007, 2013], km: 190000, en: ["essence", "diesel"], bons: "1.4 essence 75 ch (8 soupapes), 1.4 HDi 70, 1.6 HDi 90 / 92", ev: [], pourquoi: "Très répandue, pièces bon marché. Uniquement avec les bons moteurs.", verif: "Moteurs THP et VTi à fuir. Électricité (BSI), train arrière, fuite d'huile." },
  { id: "208", nom: "Peugeot 208 diesel", ans: [2012, 2016], km: 200000, en: ["diesel"], bons: "1.4 HDi 68, 1.6 HDi / e-HDi 92, 1.6 BlueHDi", ev: [], pourquoi: "Très demandée. En diesel seulement : les essence de cette tranche sont des PureTech.", verif: "Vanne EGR et FAP, embrayage, écran tactile." },
  { id: "c3", nom: "Citroën C3 II", ans: [2009, 2016], km: 200000, en: ["essence", "diesel"], bons: "1.1 et 1.4 essence (TU), 1.4 HDi, 1.6 HDi / e-HDi", ev: [], pourquoi: "Confortable, facile à revendre. Uniquement avec les bons moteurs.", verif: "Éviter PureTech et VTi. Pare-brise panoramique fissuré, train arrière." },
  { id: "fiesta", nom: "Ford Fiesta VI", ans: [2008, 2017], km: 190000, en: ["essence", "diesel"], bons: "1.25 et 1.4 essence, 1.4 et 1.6 TDCi", ev: [], pourquoi: "Châssis réputé, entretien simple.", verif: "Éviter le 1.0 EcoBoost et la boîte Powershift. Rouille des bas de portes." },
  { id: "i20rio", nom: "Hyundai i20 et Kia Rio", ans: [2009, 2017], km: 180000, en: ["essence", "diesel"], bons: "1.2 et 1.25 essence, 1.4 essence", ev: [], pourquoi: "Fiables, bien équipées, garantie longue d'origine : souvent carnet complet.", verif: "Embrayage, bruit de chaîne à froid." },
  { id: "i10picanto", nom: "Hyundai i10 et Kia Picanto", ans: [2008, 2017], km: 170000, en: ["essence"], bons: "1.0, 1.1 et 1.2 essence", ev: [], pourquoi: "Petit prix, faible consommation.", verif: "Embrayage, amortisseurs." },
  { id: "auris", nom: "Toyota Auris", ans: [2007, 2015], km: 200000, en: ["essence", "hybride", "diesel"], bons: "1.33 et 1.6 VVT-i, hybride 136 ch, 1.4 D-4D", ev: [[/\b(2[.,][02]|2\.2) ?d-?(4d|cat)\b/, "2.0 / 2.2 D-4D : joint de culasse"]], pourquoi: "Compacte fiable, hybride très recherché.", verif: "Éviter 2.0 et 2.2 D-4D et la boîte MMT." },
  { id: "polo", nom: "Volkswagen Polo", ans: [2009, 2016], km: 200000, en: ["essence", "diesel"], bons: "1.4 16V, 1.6 TDI, 1.2 TSI après 2013", ev: [[/\b1[.,]2 ?tsi\b/, "1.2 TSI des premières années : chaîne de distribution", 2012], [/\b1[.,]2\b(?! ?tsi)[^.;\n]{0,10}\b(60|70) ?ch\b/, "1.2 3 cylindres 60 / 70 ch : chaîne et bruit"]], pourquoi: "Image solide, revente facile.", verif: "Éviter la boîte DSG. Chaîne sur 1.2." },
  { id: "twingo", nom: "Renault Twingo II", ans: [2008, 2014], km: 180000, en: ["essence"], bons: "1.2 16V 75 ch", ev: [], pourquoi: "Petit prix, entretien très bon marché.", verif: "Éviter la boîte Quickshift. Embrayage, rouille du hayon." },
  { id: "fabia", nom: "Skoda Fabia II et III", ans: [2008, 2016], km: 200000, en: ["essence", "diesel"], bons: "1.4 16V, 1.6 TDI, 1.2 TSI après 2013", ev: [[/\b1[.,]2\b[^.;\n]{0,8}\b(htp|12 ?v|60 ?ch|70 ?ch)\b/, "1.2 HTP 3 cylindres : chaîne fragile"], [/\b1[.,]2 ?tsi\b/, "1.2 TSI des premières années : chaîne", 2012]], pourquoi: "Mécanique Volkswagen moins chère.", verif: "Éviter DSG. Chaîne sur 1.2." },
];

const FIAB_RE: [string, RegExp | null, RegExp][] = [
  ["yaris", /toyota/, /\byaris\b(?! ?cross)/], ["aygo", null, /\baygo\b/], ["aygo", /citroen/, /\bc1\b/], ["aygo", /peugeot/, /\b10[78]\b/],
  ["jazz", /honda/, /\bjazz\b/], ["swift", /suzuki/, /\bswift\b/], ["mazda2", /mazda/, /\bmazda ?2\b/], ["clio", /renault/, /\bclio\b/],
  ["sandero", /dacia/, /\bsandero\b|\blogan\b/], ["207", /peugeot/, /\b20[67]\b/], ["208", /peugeot/, /\b208\b/], ["c3", /citroen/, /\bc3\b(?! ?(aircross|picasso))/],
  ["fiesta", /ford/, /\bfiesta\b/], ["i20rio", /hyundai|kia/, /\bi20\b|\brio\b/], ["i10picanto", /hyundai|kia/, /\bi10\b|\bpicanto\b/], ["auris", /toyota/, /\bauris\b/],
  ["polo", /volkswagen|\bvw\b/, /\bpolo\b/], ["twingo", /renault/, /\btwingo\b/], ["fabia", /skoda/, /\bfabia\b/],
];

const flatA = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const normEn = (s: string) => {
  s = String(s || "").toLowerCase();
  return /diesel|gazole/.test(s) ? "diesel" : /hybride/.test(s) ? "hybride" : /essence/.test(s) ? "essence" : /lectrique/.test(s) ? "electrique" : /gpl/.test(s) ? "gpl" : "";
};

/* Marques concernées par chaque entrée d'EVITER_GLOBAL (même ordre) ; vide : toutes les marques. Sert aux pages de cote. */
const MARQUES_EVITER: string[][] = [["peugeot", "citroen", "ds", "opel"], ["peugeot", "citroen", "ds", "mini"], ["peugeot", "citroen", "mini"], ["ford"], ["renault", "dacia", "nissan", "mercedes"], ["toyota"], []];

/** Fiche d'un modèle de la liste fiable (pages publiques de cote), si sa tranche d'années recoupe celle de la page. */
export function fiabiliteModele(nom: string, y0: number, y1: number) {
  const t = flatA(nom);
  const id = FIAB_RE.find(([, b, m]) => (!b || b.test(t)) && m.test(t))?.[0];
  const e = id ? FIABLES.find((x) => x.id === id) : null;
  if (!e || e.ans[1] < y0 || e.ans[0] > y1) return null;
  return { nom: e.nom, bons: e.bons, verif: e.verif, pourquoi: e.pourquoi, ans: e.ans, km: e.km, aEviter: e.ev.map(([, why]) => why) };
}

/** Moteurs et boîtes signalés par l'outil pour une marque (boîtes robotisées : toutes les marques). */
export const aEviterPour = (marque: string) => EVITER_GLOBAL.filter((_, i) => !MARQUES_EVITER[i].length || MARQUES_EVITER[i].includes(flatA(marque))).map(([, why]) => why);

export type Fiabilite = {
  k: "fiable" | "limite" | "eviter" | "hors";
  modele: string | null;
  bonsMoteurs: string | null;
  aVerifier: string | null;
  pourquoi: string[];
};

/** Classement : fiable, limite (hors tranche), à éviter (moteur ou boîte), hors liste. */
export function fiabilite(a: { texte: string; annee: number | null; km: number | null; energie: string }): Fiabilite {
  const t = flatA(a.texte.slice(0, 2500));
  const id = FIAB_RE.find(([, b, m]) => (!b || b.test(t)) && m.test(t))?.[0];
  const e = id ? FIABLES.find((x) => x.id === id) ?? null : null;
  const base = { modele: e?.nom ?? null, bonsMoteurs: e?.bons ?? null, aVerifier: e?.verif ?? null };
  const bad: string[] = [];
  EVITER_GLOBAL.forEach(([re, why]) => { if (re.test(t)) bad.push(why); });
  if (e) e.ev.forEach(([re, why, maxY]) => { if (re.test(t) && (!maxY || !a.annee || a.annee <= maxY)) bad.push(why); });
  if (bad.length) return { k: "eviter", ...base, pourquoi: [...new Set(bad)] };
  if (!e) return { k: "hors", ...base, pourquoi: [] };
  const why: string[] = [];
  const en = normEn(a.energie);
  if (en && e.en.length && !e.en.includes(en)) why.push(`${a.energie} déconseillé sur ce modèle`);
  if (a.annee && (a.annee < e.ans[0] || a.annee > e.ans[1])) why.push(`année ${a.annee} hors de la tranche conseillée ${e.ans[0]} – ${e.ans[1]}`);
  if (a.km && a.km > e.km) why.push(`${a.km.toLocaleString("fr-FR")} km, au-delà de ${e.km.toLocaleString("fr-FR")} km`);
  return { k: why.length ? "limite" : "fiable", ...base, pourquoi: why.length ? why : [e.pourquoi] };
}
