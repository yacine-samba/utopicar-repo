/* Ce qui s'ajoute à une analyse après coup : la réponse du vendeur (texte collé), les documents photographiés
   (CT, factures, HistoVec, lus par l'IA) et la visite (défauts constatés, points cochés). L'analyse d'origine ne change
   jamais : le bilan relit l'annonce avec ces ajouts, ce qui permet de montrer l'avant et l'après. */
import type { Analyse } from "./couts";
import type { Defaut } from "./defauts";
import type { Faits } from "./texte";

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
