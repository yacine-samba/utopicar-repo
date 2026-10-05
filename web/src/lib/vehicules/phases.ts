/* Phases (restylages) des générations les plus courantes, et motorisations lues dans les annonces.
   Une annonce est dans une phase si elle l'écrit (« phase 2 », « ph2 », « LCI », « restylée », « 7.5 », « 6C »),
   sinon si son année tombe dans la phase. L'année du restylage compte dans les deux phases (les deux se vendaient). */

export type Phase = { id: string; l: string; y0: number; y1: number };
type Ligne = [id: string, y0: number, y1: number, label?: string, rx?: RegExp];

const P2 = (a: number, b: number, c: number): Ligne[] => [["p1", a, b], ["p2", b, c]];
const P3 = (a: number, b: number, c: number, d: number): Ligne[] => [["p1", a, b], ["p2", b, c], ["p3", c, d]];
const MAINTENANT = 2026;

/** Clé : « marque modèle génération » du catalogue (ex. « bmw serie3 e90 »). */
const PHASES: Record<string, Ligne[]> = {
  // BMW (LCI = phase 2)
  "bmw serie1 e87": P2(2004, 2007, 2013), "bmw serie1 f20": P2(2011, 2015, 2019), "bmw serie2 f22": P2(2014, 2017, 2021),
  "bmw serie3 e46": P2(1998, 2001, 2007), "bmw serie3 e90": P2(2005, 2008, 2013), "bmw serie3 f30": P2(2012, 2015, 2020), "bmw serie3 g20": P2(2019, 2022, MAINTENANT),
  "bmw serie4 f32": P2(2013, 2017, 2021), "bmw serie5 e60": P2(2003, 2007, 2010), "bmw serie5 f10": P2(2009, 2013, 2017), "bmw serie5 g30": P2(2017, 2020, 2024),
  "bmw x1 e84": P2(2009, 2012, 2015), "bmw x1 f48": P2(2015, 2019, 2022), "bmw x3 f25": P2(2010, 2014, 2017), "bmw x3 g01": P2(2017, 2021, 2024), "bmw x5 e70": P2(2007, 2010, 2013),
  // Mercedes
  "mercedes classea w169": P2(2004, 2008, 2012), "mercedes classea w176": P2(2012, 2015, 2018), "mercedes classeb w246": P2(2011, 2014, 2018),
  "mercedes classec w203": P2(2000, 2004, 2008), "mercedes classec w204": P2(2007, 2011, 2015), "mercedes classec w205": P2(2014, 2018, 2023),
  "mercedes classee w211": P2(2002, 2006, 2009), "mercedes classee w212": P2(2009, 2013, 2017), "mercedes classee w213": P2(2016, 2020, 2023),
  "mercedes cla c117": P2(2013, 2016, 2019), "mercedes gla x156": P2(2014, 2017, 2019), "mercedes glc x253": P2(2015, 2019, 2023),
  // Audi
  "audi a1 8x": P2(2010, 2014, 2018), "audi a3 8p": P2(2003, 2008, 2013), "audi a3 8v": P2(2012, 2016, 2020), "audi a4 b8": P2(2007, 2011, 2016), "audi a4 b9": P2(2015, 2019, 2024),
  "audi a5 8t": P2(2007, 2011, 2017), "audi a6 c6": P2(2004, 2008, 2011), "audi a6 c7": P2(2011, 2014, 2018), "audi q3 8u": P2(2011, 2014, 2018), "audi q5 8r": P2(2008, 2012, 2017),
  // Volkswagen
  "volkswagen golf 7": [["p1", 2012, 2017, "Golf 7"], ["p2", 2017, 2020, "Golf 7.5", /\b(golf ?)?7[.,]5\b/]],
  "volkswagen golf 8": [["p1", 2019, 2024, "Golf 8"], ["p2", 2024, MAINTENANT, "Golf 8.5", /\b(golf ?)?8[.,]5\b/]],
  "volkswagen polo 5": [["p1", 2009, 2014, "Polo 6R", /\b6r\b/], ["p2", 2014, 2017, "Polo 6C", /\b6c\b/]],
  "volkswagen polo 6": P2(2017, 2021, MAINTENANT), "volkswagen passat b8": P2(2014, 2019, 2024), "volkswagen tiguan 1": P2(2007, 2011, 2016), "volkswagen tiguan 2": P2(2016, 2020, 2024),
  "volkswagen touran 1": P3(2003, 2006, 2010, 2015), "volkswagen troc 1": P2(2017, 2022, MAINTENANT), "volkswagen up 1": P2(2011, 2016, 2023),
  // Renault
  "renault clio 2": P3(1998, 2001, 2003, 2005), "renault clio 3": P2(2005, 2009, 2013), "renault clio 4": P2(2012, 2016, 2019), "renault clio 5": P2(2019, 2023, MAINTENANT),
  "renault megane 2": P2(2002, 2006, 2010), "renault megane 3": P3(2008, 2012, 2014, 2016), "renault megane 4": P2(2016, 2020, 2023),
  "renault captur 1": P2(2013, 2017, 2019), "renault scenic 3": P3(2009, 2012, 2013, 2016), "renault twingo 2": P2(2007, 2012, 2014), "renault twingo 3": P2(2014, 2019, 2024),
  "renault kangoo 2": P2(2008, 2013, 2021), "renault laguna 3": P2(2007, 2010, 2015), "renault kadjar 1": P2(2015, 2018, 2022), "renault zoe 1": P2(2013, 2019, 2024), "renault trafic 3": P2(2014, 2019, MAINTENANT),
  // Peugeot
  "peugeot 206 1": P2(1998, 2003, 2010), "peugeot 207 1": P2(2006, 2009, 2015), "peugeot 208 1": P2(2012, 2015, 2019), "peugeot 208 2": P2(2019, 2023, MAINTENANT),
  "peugeot 307 1": P2(2001, 2005, 2009), "peugeot 308 1": P2(2007, 2011, 2015), "peugeot 308 2": P2(2013, 2017, 2021), "peugeot 407 1": P2(2004, 2008, 2011),
  "peugeot 508 1": P2(2010, 2014, 2018), "peugeot 508 2": P2(2018, 2023, MAINTENANT), "peugeot 2008 1": P2(2013, 2016, 2019), "peugeot 2008 2": P2(2019, 2023, MAINTENANT),
  "peugeot 3008 1": P2(2009, 2013, 2016), "peugeot 3008 2": P2(2016, 2020, 2023), "peugeot 5008 1": P2(2009, 2013, 2017), "peugeot 5008 2": P2(2017, 2020, 2023), "peugeot partner 2": P2(2008, 2015, 2018),
  // Citroën, DS
  "citroen c1 1": P2(2005, 2008, 2014), "citroen c3 2": P2(2009, 2013, 2016), "citroen c3 3": P2(2016, 2020, 2024), "citroen c4 2": P2(2010, 2015, 2018),
  "citroen c4picasso 2": P2(2013, 2016, 2022), "citroen berlingo 2": P3(2008, 2012, 2015, 2018),
  // Dacia
  "dacia sandero 2": P2(2012, 2016, 2020), "dacia duster 1": P2(2010, 2013, 2017), "dacia logan 2": P2(2012, 2016, 2020),
  // Toyota
  "toyota yaris 2": P2(2005, 2009, 2011), "toyota yaris 3": P3(2011, 2014, 2017, 2020), "toyota aygo 1": P3(2005, 2008, 2012, 2014), "toyota aygo 2": P2(2014, 2018, 2022),
  "toyota auris 1": P2(2007, 2010, 2012), "toyota auris 2": P2(2012, 2015, 2019), "toyota rav4 4": P2(2013, 2015, 2018), "toyota chr 1": P2(2016, 2019, 2023),
  // Ford
  "ford fiesta 6": P2(2008, 2013, 2017), "ford fiesta 7": P2(2017, 2021, 2023), "ford focus 2": P2(2004, 2008, 2011), "ford focus 3": P2(2011, 2014, 2018),
  "ford kuga 2": P2(2012, 2016, 2019), "ford cmax 2": P2(2010, 2015, 2019),
  // Opel
  "opel corsa d": P2(2006, 2010, 2014), "opel astra h": P2(2004, 2007, 2010), "opel astra j": P2(2009, 2012, 2018), "opel astra k": P2(2015, 2019, 2021),
  "opel insignia a": P2(2008, 2013, 2017), "opel mokka 1": [["p1", 2012, 2016, "Mokka"], ["p2", 2016, 2019, "Mokka X", /\bmokka ?x\b/]], "opel meriva b": P2(2010, 2014, 2017),
  // Fiat
  "fiat 500 1": P2(2007, 2015, 2024), "fiat panda 3": P2(2012, 2020, 2024),
  "fiat punto 3": [["p1", 2005, 2009, "Grande Punto", /\bgrande ?punto\b/], ["p2", 2009, 2012, "Punto Evo", /\bpunto ?evo\b/], ["p3", 2012, 2018, "Punto (2012 – 2018)"]],
  // Nissan, Seat, Skoda, Hyundai, Kia, Mini, Volvo, Mazda, Suzuki
  "nissan qashqai 1": P2(2007, 2010, 2013), "nissan qashqai 2": P2(2014, 2017, 2021), "nissan juke 1": P2(2010, 2014, 2019), "nissan micra 4": P2(2010, 2013, 2017),
  "seat ibiza 4": P2(2008, 2012, 2017), "seat leon 2": P2(2005, 2009, 2012), "seat leon 3": P2(2012, 2017, 2020),
  "skoda fabia 2": P2(2007, 2010, 2014), "skoda octavia 2": P2(2004, 2008, 2013), "skoda octavia 3": P2(2013, 2017, 2020), "skoda superb 2": P2(2008, 2013, 2015),
  "hyundai i20 1": P2(2009, 2012, 2014), "hyundai i30 2": P2(2012, 2015, 2017), "hyundai tucson 3": P2(2015, 2018, 2020),
  "kia ceed 2": P2(2012, 2015, 2018), "kia picanto 2": P2(2011, 2015, 2017), "kia rio 3": P2(2011, 2015, 2017), "kia sportage 4": P2(2016, 2018, 2021),
  "mini mini 2": P2(2006, 2010, 2015), "mini mini 3": P3(2014, 2018, 2021, 2024), "mini countryman r60": P2(2010, 2014, 2017),
  "volvo xc60 1": P2(2008, 2013, 2017), "mazda cx5 1": P2(2012, 2015, 2017), "suzuki swift 2": P2(2010, 2013, 2017),
};

const NOM = ["", "Phase 1", "Phase 2", "Phase 3", "Phase 4"];
const versListe = (L: Ligne[]): Phase[] => L.map(([id, y0, y1, l]) => ({ id, l: `${l ?? NOM[Number(id.slice(1))]} (${y0} – ${y1 >= MAINTENANT ? "auj." : y1})`, y0, y1 }));

/** Phases d'une génération (vide si on ne les distingue pas). */
export const phasesDe = (base: string, gen: string): Phase[] => {
  const L = PHASES[`${base} ${gen}`];
  return L ? versListe(L) : [];
};

const plat = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Phase écrite dans l'annonce, sinon null. */
function phaseEcrite(L: Ligne[], tx: string): string | null {
  const parNom = L.filter(([, , , , rx]) => rx && rx.test(tx));
  if (parNom.length === 1) return parNom[0][0];
  const m = tx.match(/\b(?:phase|ph)\s?\.?\s?([1-4])\b/);
  if (m && L.some(([id]) => id === `p${m[1]}`)) return `p${m[1]}`;
  // « LCI », « restylée » : la phase 2 quand la génération n'en a que deux
  if (L.length === 2 && /\b(lci|restyl\w*|facelift)\b/.test(tx)) return "p2";
  return null;
}

/** L'annonce est-elle dans cette phase ? (écrit dans l'annonce, sinon par l'année). */
export function dansPhase(base: string, gen: string, phase: string, a: { titre: string; texte?: string | null; annee: number | null }): boolean {
  const L = PHASES[`${base} ${gen}`];
  if (!L) return true;
  const p = L.find(([id]) => id === phase);
  if (!p) return true;
  const ecrite = phaseEcrite(L, plat(`${a.titre} ${a.texte ?? ""}`));
  if (ecrite) return ecrite === phase;
  return a.annee != null && a.annee >= p[1] && a.annee <= p[2];
}

/* ---------- Motorisations : appellation lue dans le titre, puis dans la description ---------- */
const TECH: Record<string, string> = {
  dci: "dCi", tce: "TCe", sce: "SCe", hdi: "HDi", ehdi: "e-HDi", bluehdi: "BlueHDi", puretech: "PureTech", vti: "VTi", thp: "THP", tdi: "TDI", tsi: "TSI", tfsi: "TFSI", fsi: "FSI",
  mpi: "MPI", crdi: "CRDi", cdti: "CDTi", tdci: "TDCi", ecoboost: "EcoBoost", multijet: "Multijet", jtd: "JTD", jtdm: "JTDm", vvti: "VVT-i", d4d: "D-4D", gdi: "GDi", tgdi: "T-GDi",
  cdi: "CDI", dig: "DIG-T", digt: "DIG-T", skyactivg: "Skyactiv-G", skyactivd: "Skyactiv-D", idtec: "i-DTEC", ivtec: "i-VTEC", vtec: "i-VTEC", ecotec: "Ecotec", jtdm2: "JTDm",
};
const TECH_RX = "(e-?hdi|bluehdi|puretech|dci|tce|sce|hdi|vti|thp|tdi|tsi|tfsi|fsi|mpi|crdi|cdti|tdci|ecoboost|multijet|jtdm?|vvt-?i|d-?4d|t-?gdi|gdi|cdi|dig-?t|skyactiv-?[gd]|i-?dtec|i-?vtec|ecotec)";
const RX_CYL = new RegExp(`\\b(\\d)[.,](\\d{1,2})\\s?(?:l\\s)?${TECH_RX}\\b`);
const RX_TECH_CH = new RegExp(`\\b${TECH_RX}\\s?(\\d{2,3})\\b`);
const normTech = (t: string) => TECH[t.replace(/-/g, "")] ?? t.toUpperCase();
const MERCO = /\b(a|b|c|e|s|v|cla|cls|gla|glb|glc|gle|glk|ml|clk|slk|sl)\s?(\d{3})\s?(d|cdi|bluetec|cgi|kompressor|h)?\b/;

/** Motorisation d'une annonce (« 320d », « C 220 d », « 1.5 dCi », « 1.2 PureTech »…), ou null. */
export function motorisationDe(marque: string, a: { titre: string; texte?: string | null }): string | null {
  for (const brut of [a.titre, (a.texte ?? "").slice(0, 900)]) {
    const tx = plat(brut ?? "");
    if (!tx) continue;
    if (marque === "bmw") {
      const x = tx.match(/\b([sx])\s?drive\s?(\d{2})\s?([die])\b/);
      if (x) return `${x[1]}Drive${x[2]}${x[3]}`;
      const m = tx.match(/\b(m?[1-8](?:1[0-8]|2[0-5]|3[0-5]|40|45|50))\s?(xd|xi|sd|d|i|e|is)\b/);
      if (m) return `${m[1].replace(/^m/, "M")}${m[2]}`;
      const mx = tx.match(/\bm([2-8])\b(?! ?sport)/);
      if (mx) return `M${mx[1]}`;
    }
    if (marque === "mercedes") {
      const m = tx.match(MERCO);
      if (m) return `${m[1].toUpperCase()} ${m[2]}${m[3] ? (m[3] === "d" || m[3] === "h" ? ` ${m[3]}` : m[3] === "bluetec" ? " BlueTEC" : ` ${m[3].toUpperCase()}`) : ""}`.replace(" KOMPRESSOR", " Kompressor");
    }
    if (marque === "audi") {
      const m = tx.match(/\b([2-6]\d)\s?(tdi|tfsi|e-tron)\b/);
      if (m && !RX_CYL.test(tx)) return `${m[1]} ${m[2] === "e-tron" ? "e-tron" : m[2].toUpperCase()}`;
    }
    const c = tx.match(RX_CYL);
    if (c) return `${c[1]}.${c[2].length > 1 ? c[2].replace(/0$/, "") : c[2]} ${normTech(c[3])}`;
    const t = tx.match(RX_TECH_CH);
    if (t) return `${normTech(t[1])} ${t[2]}`;
  }
  return null;
}

/** Suggestions avant la première recherche (BMW, Mercedes : appellations du modèle). */
export function motorisationsTypes(marque: string, modele: string): string[] {
  const s = modele.match(/^serie(\d)/);
  if (marque === "bmw" && s) return ["16d", "16i", "18d", "18i", "20d", "20i", "25d", "25i", "30d", "30i", "35d", "35i", "40i"].map((x) => `${s[1]}${x}`);
  const c = modele.match(/^classe([abce])$/);
  if (marque === "mercedes" && c) return ["180", "180 d", "200", "200 d", "220 d", "250", "250 d", "300", "350 d"].map((x) => `${c[1].toUpperCase()} ${x}`);
  return [];
}
