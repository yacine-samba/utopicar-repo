/* Ce qui s'ajoute à une analyse après coup : la réponse du vendeur (texte collé), les documents photographiés
   (CT, factures, HistoVec, lus par l'IA) et la visite (défauts constatés, points cochés). L'analyse d'origine ne change
   jamais : le bilan relit l'annonce avec ces ajouts, ce qui permet de montrer l'avant et l'après. */
import type { Analyse } from "./couts";
import type { Defaut } from "./defauts";
import type { Faits } from "./texte";
import type { LectureDocuments } from "./ia";

export type Constat = { libelle: string; montant: number };
export type Complement = {
  le: string;
  type: "reponse" | "document" | "visite";
  /** Texte collé (réponse du vendeur) ou résumé du document lu. */
  texte?: string;
  /** Faits tirés du texte ou du document. */
  faits?: Partial<Pick<Faits, "ct" | "distribution" | "proprietaires" | "carnet" | "factures" | "recents" | "defauts" | "importe">> & { kmReleves?: { km: number; date?: string; source: string }[]; gage?: boolean; sinistre?: boolean };
  /** Visite : défauts constatés sur place et chiffrés. */
  constats?: Constat[];
  /** Visite : points de contrôle vérifiés. */
  coches?: string[];
};

const ORDRE_CT = { "contre-visite": 0, "à faire": 1, mentionné: 2, ok: 3, vierge: 4 } as const;

/** Faits de l'annonce complétés par les réponses, documents et visite, dans l'ordre où ils ont été ajoutés. */
export function faitsComplets(a: Analyse): Faits {
  const l = a.complements ?? [];
  if (!l.length) return a.faits;
  const f: Faits = { ...a.faits, defauts: [...a.faits.defauts], recents: [...(a.faits.recents ?? [])] };
  for (const c of l) {
    const x = c.faits ?? {};
    // un document ou une réponse plus précis remplace ce que disait l'annonce
    if (x.ct && (!f.ct || f.ct.statut === "mentionné" || c.type === "document" || ORDRE_CT[x.ct.statut] < ORDRE_CT[f.ct.statut])) f.ct = x.ct;
    if (x.distribution && (x.distribution.statut !== "mentionnée" || !f.distribution)) f.distribution = x.distribution;
    if (x.proprietaires) f.proprietaires = x.proprietaires;
    if (x.carnet) f.carnet = true;
    if (x.factures) f.factures = true;
    if (x.importe) f.importe = true;
    for (const r of x.recents ?? []) if (!f.recents!.includes(r)) f.recents!.push(r);
    for (const d of x.defauts ?? []) if (!f.defauts.some((y) => y.k === d.k)) f.defauts.push({ ...d, src: c.type === "visite" ? "visite" : "vendeur" });
    if (x.gage) f.defauts.push({ k: "admin", l: "Gage ou opposition signalé", cat: "piege", min: 0, max: 0, nc: true, extrait: "", src: "vendeur" });
    (c.constats ?? []).forEach((k, i) => {
      if (!k.libelle || !(k.montant >= 0)) return;
      const d: Defaut = { k: `visite${f.defauts.length}_${i}`, l: k.libelle, cat: k.montant >= 500 ? "lourd" : "levier", min: k.montant, max: k.montant, nc: false, extrait: "constaté pendant la visite", src: "visite" };
      f.defauts.push(d);
    });
  }
  return f;
}

/** Analyse telle que le bilan doit la lire : faits complétés. */
export const avecComplements = (a: Analyse): Analyse => (a.complements?.length ? { ...a, faits: faitsComplets(a) } : a);

/** Kilométrages relevés dans les documents, pour repérer un compteur qui recule. */
export function compteurIncoherent(a: Analyse): string | null {
  const releves = (a.complements ?? []).flatMap((c) => c.faits?.kmReleves ?? []).filter((r) => r.km > 0 && r.date);
  if (releves.length < 2) return null;
  const tri = [...releves].sort((x, y) => (x.date ?? "").localeCompare(y.date ?? ""));
  for (let i = 1; i < tri.length; i++)
    if (tri[i].km + 1000 < tri[i - 1].km) return `Le kilométrage recule : ${tri[i - 1].km.toLocaleString("fr-FR")} km le ${tri[i - 1].date} (${tri[i - 1].source}), puis ${tri[i].km.toLocaleString("fr-FR")} km le ${tri[i].date} (${tri[i].source}).`;
  const km = a.faits.km;
  const dernier = tri[tri.length - 1];
  if (km != null && dernier.km > km + 2000) return `Un document indique ${dernier.km.toLocaleString("fr-FR")} km, plus que les ${km.toLocaleString("fr-FR")} km de l'annonce.`;
  return null;
}

const dateFr = (d?: string) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d.split("-").reverse().join("/") : d || "");

/** Faits tirés des documents lus par l'IA (CT, factures, HistoVec) : rangés comme ceux d'une annonce. */
export function faitsDocuments(d: LectureDocuments): NonNullable<Complement["faits"]> {
  const out: NonNullable<Complement["faits"]> = { recents: [], defauts: [], kmReleves: [] };
  if (d.ct?.resultat) {
    const defs = d.ct.defaillances ?? [];
    const statut = /contre|defav|défav/i.test(d.ct.resultat) ? "contre-visite" : defs.some((x) => /majeure|critique/i.test(x.niveau)) ? "contre-visite" : defs.length ? "ok" : "vierge";
    out.ct = { statut, dateTxt: dateFr(d.ct.date), moinsDe: null, extrait: `PV de contrôle technique${d.ct.date ? ` du ${dateFr(d.ct.date)}` : ""}` };
    defs.forEach((x, i) => {
      if (!x.libelle) return;
      const grave = /majeure|critique/i.test(x.niveau);
      out.defauts!.push({ k: `ct${i}`, l: `CT : ${x.libelle}`, cat: grave ? "lourd" : "levier", min: Math.max(0, x.coutMin ?? 0), max: Math.max(0, x.coutMax ?? x.coutMin ?? 0), nc: !(x.coutMax && x.coutMax > 0), extrait: x.niveau, src: "vendeur" });
    });
    if (d.ct.km) out.kmReleves!.push({ km: d.ct.km, date: d.ct.date, source: "CT" });
  }
  if (d.distribution?.faite) {
    out.distribution = { statut: "faite", km: d.distribution.km ?? null, dateTxt: dateFr(d.distribution.date), extrait: "facture de distribution" };
    out.recents!.push("distribution");
  }
  if (d.factures) out.factures = true;
  if (d.carnet) out.carnet = true;
  if (d.titulaires && d.titulaires > 0) out.proprietaires = d.titulaires;
  if (d.gage) out.gage = true;
  if (d.sinistre) {
    out.sinistre = true;
    out.defauts!.push({ k: "sinistre", l: "Sinistre déclaré (procédure VE ou VEI)", cat: "lourd", min: 0, max: 0, nc: true, extrait: "HistoVec", src: "vendeur" });
  }
  for (const k of d.kmReleves ?? []) if (k.km > 0) out.kmReleves!.push({ km: k.km, date: k.date, source: k.source || "document" });
  for (const p of d.pieces ?? []) {
    const n = p.toLowerCase();
    const cle = /embray/.test(n) ? "embrayage" : /pneu/.test(n) ? "pneus" : /frein|plaquette|disque/.test(n) ? "freins" : /batter/.test(n) ? "batterie" : /amorti/.test(n) ? "amortisseurs" : /turbo/.test(n) ? "turbo" : /distri|courroie/.test(n) ? "distribution" : /vidange|revision|révision/.test(n) ? "vidange" : null;
    if (cle && !out.recents!.includes(cle)) out.recents!.push(cle);
  }
  return out;
}
