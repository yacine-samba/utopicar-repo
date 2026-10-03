/* Types partagés serveur / navigateur pour la recherche, la cote et les alertes. */
export type CatGen = { id: string; l: string; y0: number; y1: number };
export type CatModele = { k: string; n: string; lbc: string; rx: string; g: CatGen[] };
export type CatMarque = { k: string; n: string; lbc: string; m: CatModele[] };

export type CoteAnnonce = {
  P: number; lo: number | null; hi: number | null; ecart: number | null; pct: number | null; conf: "forte" | "moyenne" | "faible"; why: string;
  moinsCherQue: number | null; n: number; segments?: string[]; dans1an?: number | null; parKm?: number | null; parAn?: number | null; ajust?: { l: string; eur: number }[];
  comps?: { prix: number; annee: number; km: number; lib: string; id: string | null; pro: 0 | 1 }[];
};
export type PointCote = { prix: number; annee: number; km: number; auto: boolean; pro: boolean; id: string | null; lib: string; segs: string[]; ch: number | null; eq: number };
