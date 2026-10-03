/* Lecture de l'annonce par des règles fixes, jamais par l'IA.
   Port de l'outil UTOPICAR Garage (legacy/garage/index.html : flat, frDate, kmIn, descFacts, parseCard). */
import { defautsDesc, type Defaut } from "./defauts";

/** Minuscules sans accents, même longueur que le texte d'origine (les positions restent valables). */
export const flat = (s: string) =>
  String(s || "")
    .toLowerCase()
    .replace(/[àâäá]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[îïí]/g, "i")
    .replace(/[ôöó]/g, "o")
    .replace(/[ùûüú]/g, "u")
    .replace(/ç/g, "c")
    .replace(/[’‘]/g, "'");

const MOIS: Record<string, number> = {
  janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
  janv: 1, fevr: 2, fev: 2, avr: 4, juil: 7, sept: 9, oct: 10, nov: 11, dec: 12,
};
const pad2 = (n: number) => String(n).padStart(2, "0");

export type DateFr = { iso: string; txt: string; prec: "j" | "m" };

/** Date française : 12/05/2026, 05/2026, mai 2026, 2026-05-12. */
export function frDate(s: string): DateFr | null {
  const t = flat(s);
  let m: RegExpMatchArray | null;
  const yOk = (y: number) => y >= 1985 && y <= new Date().getFullYear() + 1;
  if ((m = t.match(/\b(\d{4})-(\d{2})(?:-(\d{2}))?\b/)) && yOk(+m[1]))
    return { iso: `${m[1]}-${m[2]}-${m[3] || "01"}`, txt: m[3] ? `${m[3]}/${m[2]}/${m[1]}` : `${m[2]}/${m[1]}`, prec: m[3] ? "j" : "m" };
  if ((m = t.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})\b/))) {
    let y = +m[3];
    if (y < 100) y += 2000;
    const mo = +m[2], d = +m[1];
    if (yOk(y) && mo >= 1 && mo <= 12 && d >= 1 && d <= 31) return { iso: `${y}-${pad2(mo)}-${pad2(d)}`, txt: `${pad2(d)}/${pad2(mo)}/${y}`, prec: "j" };
  }
  if ((m = t.match(/\b(\d{1,2})[/.-](\d{4})\b/))) {
    const mo = +m[1], y = +m[2];
    if (yOk(y) && mo >= 1 && mo <= 12) return { iso: `${y}-${pad2(mo)}-01`, txt: `${pad2(mo)}/${y}`, prec: "m" };
  }
  if ((m = t.match(/\b(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre|janv|fevr|fev|avr|juil|sept|oct|nov|dec)\.?\s+(\d{4})\b/)) && yOk(+m[2]))
    return { iso: `${m[2]}-${pad2(MOIS[m[1]])}-01`, txt: `${pad2(MOIS[m[1]])}/${m[2]}`, prec: "m" };
  return null;
}

/** Sous-chaîne d'origine autour d'une position, coupée aux limites de ligne. */
export function excerpt(s: string, i: number, len: number) {
  const a = Math.max(0, s.lastIndexOf("\n", i) + 1, i - 30);
  let b = s.indexOf("\n", i);
  if (b < 0 || b > i + len) b = i + len;
  return s.slice(a, Math.min(b, s.length)).replace(/\s+/g, " ").trim();
}

function kmIn(t: string) {
  const m = t.match(/(\d{2,3})[\s.  ]?(\d{3})\s*(?:km|kms|kilo)/) || t.match(/\b(\d{2,3})\s*(?:000|k)\s*(?:km|kms)?\b/);
  if (!m) return null;
  const v = m[2] ? +(m[1] + m[2]) : +m[1] * 1000;
  return v >= 5000 && v <= 400000 ? v : null;
}

/** Fenêtre de texte à partir d'une position, arrêtée à la fin de la phrase. */
function sentence(t: string, i: number, len: number, skip = 0) {
  const w = t.slice(i, i + len).split("\n")[0];
  const k = w.slice(skip).search(/[.;!?](\s|$)|\s[-–•]\s/);
  return k >= 0 ? w.slice(0, skip + k) : w;
}

export type CtStatut = "contre-visite" | "à faire" | "vierge" | "ok" | "mentionné";

export type Faits = {
  titre: string;
  prix: number | null;
  annee: number | null;
  km: number | null;
  energie: string;
  boite: string;
  ville: string;
  cp: string;
  pro: boolean;
  cv: number | null;
  /** Estimation de prix affichée par le site (Leboncoin), si collée avec l'annonce. */
  estimSite: { min: number; max: number } | null;
  ct?: { statut: CtStatut; dateTxt: string; moinsDe: number | null; extrait: string };
  distribution?: { statut: "à faire" | "faite" | "mentionnée"; km: number | null; dateTxt: string; extrait: string };
  proprietaires?: number;
  carnet?: boolean;
  factures?: boolean;
  importe?: boolean;
  defauts: Defaut[];
  /** Description très courte : on ne peut pas juger l'état sur le texte. */
  descCourte: boolean;
};

const nb = (s: string) => {
  const v = Number(String(s).replace(/[\s  .]/g, ""));
  return Number.isFinite(v) ? v : null;
};

/** Faits sûrs lus dans le texte collé : prix, année, km, CT, distribution, entretien, défauts avoués. */
export function lireAnnonce(texte: string): Faits {
  const x = String(texte || "");
  const lines = x.split("\n").map((s) => s.trim()).filter(Boolean);

  const pm = x.match(/Prix\s*:\s*([\d\s  .]+)\s*€/) || x.match(/(\d{1,3}(?:[\s  .]\d{3})+|\d{3,6})\s*€/);
  let prix = pm ? nb(pm[1]) : null;
  if (prix != null && (prix < 300 || prix > 250000)) prix = null;

  const am = x.match(/Ann[ée]e[^:\n"]{0,14}:?\s*"?\s*((?:19[89]|20[0-3])\d)/) || x.match(/(?:^|[·\s(|,])((?:19[89]|20[0-3])\d)(?=[·\s)|,]|$)/m);
  let annee = am ? Number(am[1]) : null;
  if (annee != null && (annee < 1985 || annee > new Date().getFullYear() + 1)) annee = null;

  const km0 = x.match(/Kilom[ée]trage\s*:?\s*"?\s*([\d\s  .]+?)\s*km/i) || x.match(/(\d{1,3}(?:[\s  .]\d{3})+|\d{4,6})\s*km\b/i);
  let km = km0 ? nb(km0[1]) : null;
  if (km != null && (km < 0 || km > 600000)) km = null;

  const en = (x.match(/[ÉE]nergie\s*:?\s*"?\s*([A-Za-zÀ-ÿ ]{3,25}?)\s*(?:"|\n|\.|$)/) || x.match(/\b(Diesel|Essence|Hybride rechargeable|Hybride|[ÉE]lectrique|GPL)\b/i) || [])[1] || "";
  const bo = (x.match(/Bo[iî]te de vitesses?\s*:?\s*"?\s*(Manuelle|Automatique)/i) || x.match(/\b(Manuelle|Automatique)\b/i) || [])[1] || "";
  const loc = x.match(/Situ[ée]e? à\s+(.+?)\s+(\d{5})/) || x.match(/(?:^|\n)\s*([A-ZÀ-Ý][^\n\d€:]{1,45}?)\s+(\d{5})(?=\s|$)/);
  const cvm = x.match(/Puissance fiscale\s*:?\s*(\d{1,2})\s*(?:CV|Cv|cv|ch)?/i) || x.match(/\b(\d{1,2})\s*(?:CV|cv)\b(?!\s*din)/);
  let cv = cvm ? Number(cvm[1]) : null;
  if (cv != null && (cv < 2 || cv > 60)) cv = null;

  const skip = (l: string) =>
    /€/.test(l) ||
    /^(Prix|Ann[ée]e|Kilom|[ÉE]nergie|Bo[iî]te|Situ[ée]|·|Garantie|Annonce)/i.test(l) ||
    /^(À la une|Sponsoris[ée]|Pro|Particulier|Vendeur professionnel\.?|Pack S[ée]r[ée]nit[ée]|Paiement s[ée]curis[ée]|Tr[èe]s bonne affaire|Bonne affaire|Prix [ée]quitable|Prix [ée]lev[ée]|Baisse de prix|Urgent|Nouveau|Livraison possible|Manuelle|Automatique|Diesel|Essence|Hybride|[ÉE]lectrique|\d[\d\s]*(km)?)$/i.test(l) ||
    /^[^\d]{1,45}\s\d{5}(\s|$)/.test(l);
  const titre = (lines.find((l) => l.length >= 4 && !skip(l)) || "").slice(0, 140);

  // Estimation Leboncoin collée avec l'annonce (« Estimation : 6 200 € - 7 400 € »).
  let estimSite: Faits["estimSite"] = null;
  const es = x.match(/estim\w*[^\n\d]{0,40}?(\d{1,3}(?:[\s  .]\d{3})+|\d{3,6})\s*€?\s*(?:-|–|à|et)\s*(\d{1,3}(?:[\s  .]\d{3})+|\d{3,6})\s*€/i);
  if (es) {
    const a = nb(es[1]), b = nb(es[2]);
    if (a && b && b >= a && a > 300) estimSite = { min: a, max: b };
  }

  const f: Faits = {
    titre,
    prix,
    annee,
    km,
    energie: en.trim(),
    boite: bo.trim(),
    ville: loc ? loc[1].trim() : "",
    cp: loc ? loc[2] : "",
    pro: /Vendeur professionnel/i.test(x) || lines.includes("Pro"),
    cv,
    estimSite,
    defauts: [],
    descCourte: x.replace(/\s+/g, " ").trim().length < 120,
  };
  Object.assign(f, descFacts(x));
  return f;
}

/** Premier membre de phrase : coupé à la virgule ou au « et » qui introduit un autre sujet. */
const clause = (w: string) => w.split(/,|\s(?:et|mais)\s/)[0];

const NEG = /\b(non|jamais|aucun|aucune|pas d'?|pas de|sans|zero|ni)\s*$/;

/** Ce que dit la description, lu par des règles fixes : CT, distribution, propriétaires, carnet, défauts avoués. */
function descFacts(txt: string): Partial<Faits> {
  const s = String(txt || "");
  const t = flat(s);
  const out: Partial<Faits> = {};

  // Contrôle technique
  const re = /(\bc\.?\s?t\b\.?|controle technique)/g;
  let m: RegExpExecArray | null;
  const found: { statut: CtStatut; date: DateFr | null; moinsDe: number | null; extrait: string }[] = [];
  while ((m = re.exec(t)) && found.length < 6) {
    const i = m.index, win = sentence(t, i, 110, m[0].length), before = t.slice(Math.max(0, i - 24), i);
    let st: CtStatut | null = null;
    // Le statut se lit dans le membre de phrase du CT (« CT ok, pneus à prévoir » : le CT est ok).
    const statutCt = (w: string): CtStatut | null =>
      /contre[\s-]?visite/.test(w) ? "contre-visite"
      : /(sans|pas de|vendu sans|aucun)\s*$/.test(before) || /\b(a faire|a refaire|a prevoir|perime|expire|non fait|pas fait|pas a jour)\b/.test(w) || /\b(sera|va etre|serait) (fait|realise|effectue|passe|refait)\b/.test(w) ? "à faire"
      : /\b(vierge|ras|r\.a\.s|aucun(e)? (defaut|defaillance|remarque)|sans (defaut|defaillance|remarque)|rien a signaler|nickel)\b/.test(w) ? "vierge"
      : /\b(ok|valide|bon|favorable|fait|passe|a jour|recent|neuf|de moins de \d+ mois|moins de \d+ mois|en cours de validite)\b/.test(w) ? "ok"
      : null;
    st = statutCt(clause(win)) ?? statutCt(win);
    const d = frDate(win);
    const moins = (win.match(/moins de (\d+) mois/) || [])[1];
    if (st || d) found.push({ statut: st || "mentionné", date: d, moinsDe: moins ? +moins : null, extrait: excerpt(s, i, 110) });
  }
  if (found.length) {
    const best = found.find((f) => f.statut === "contre-visite" || f.statut === "à faire") || found.find((f) => f.date) || found[0];
    out.ct = { statut: best.statut, dateTxt: best.date ? best.date.txt : "", moinsDe: best.moinsDe, extrait: best.extrait };
  }

  // Distribution
  const di = t.search(/(courroie|kit|chaine) de distribution|distribution/);
  if (di >= 0) {
    const win = sentence(t, di, 110);
    const statutDi = (w: string) => (/\b(a faire|a prevoir|a changer|a refaire|pas faite|non faite)\b/.test(w) ? "à faire" : /\b(faite|fait|changee|change|refaite|remplacee|neuve|recente|ok)\b/.test(w) ? "faite" : null);
    const st = statutDi(clause(win)) ?? statutDi(win);
    const d = frDate(win);
    const ago = /il y a\s*(?:environ\s*)?\d/.test(win);
    const km = ago ? null : kmIn(win);
    if (st || d || km) out.distribution = { statut: st || "mentionnée", km, dateTxt: d ? d.txt : "", extrait: excerpt(s, di, 110) };
  }

  // Propriétaires
  if (/\b(premiere|1ere|1 ere|1er)\s*main\b/.test(t)) out.proprietaires = 1;
  else if (/\b(deuxieme|2eme|2nde|seconde|2e)\s*main\b/.test(t)) out.proprietaires = 2;
  else if ((m = /\b([1-6])\s*(?:proprietaires?|proprios?|mains)\b/.exec(t))) out.proprietaires = +m[1];

  // Carnet et factures
  if (/carnet (d'?entretien )?(complet|a jour|tamponne|suivi|a l'?appui|dispo)/.test(t) || /entretien (complet|suivi|a jour|constructeur|renault|concession)/.test(t)) out.carnet = true;
  if (/\bfactures?\b/.test(t)) out.factures = true;
  if (/\b(import|importe|immatricule a l'?etranger|plaque etrangere)\b/.test(t) && !NEG.test(t.slice(0, t.search(/\bimport/)).slice(-16))) out.importe = true;

  out.defauts = defautsDesc(s);
  return out;
}
