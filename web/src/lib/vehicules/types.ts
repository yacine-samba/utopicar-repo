/* Types partagés serveur / navigateur pour la recherche, la cote et les alertes. */
/** Génération : versions (carrosserie, code châssis) et phases (restylages) quand on les distingue. */
export type CatGen = { id: string; l: string; y0: number; y1: number; v?: { id: string; l: string; y0: number; y1: number; b: string }[]; ph?: { id: string; l: string; y0: number; y1: number }[] };
export type CatModele = { k: string; n: string; lbc: string; rx: string; g: CatGen[] };
export type CatMarque = { k: string; n: string; lbc: string; m: CatModele[] };

export type CoteAnnonce = {
  P: number; lo: number | null; hi: number | null; ecart: number | null; pct: number | null; conf: "forte" | "moyenne" | "faible"; why: string;
  moinsCherQue: number | null; n: number; segments?: string[]; dans1an?: number | null; parKm?: number | null; parAn?: number | null; ajust?: { l: string; eur: number }[];
  comps?: { prix: number; annee: number; km: number; lib: string; id: string | null; pro: 0 | 1; ch?: number | null; carr?: string | null; fin?: string | null }[];
  /** base de calcul (« même moteur : 335i », vide = toute la génération), carrosserie, finition et puissance retenues */
  base?: string; carrosserie?: string | null; finition?: string | null; ch?: number | null;
};
export type PointCote = { prix: number; annee: number; km: number; auto: boolean; pro: boolean; id: string | null; lib: string; segs: string[]; ch: number | null; eq: number };
