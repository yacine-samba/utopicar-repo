/* Types du moteur de l'outil Garage (moteur.js, porté tel quel). */
export type Gen = { id: string; label: string; y0: number; y1: number; open: boolean };
export type Version = { id: string; label: string; y0: number; y1: number; body: string };
export type ModeleCat = { key: string; name: string; lbc: string; regex: string; gens: (Gen & { v: Version[] })[] };
export type MarqueCat = { key: string; name: string; lbc: string; models: ModeleCat[] };
export type Comparable = { prix: number; annee: number; km: number; lib: string; id: string | null; pro: 0 | 1; ch: number | null; carr: string | null; fin: string | null };
export type Estimation = {
  nom: string; n: number; nClean: number; conf: "forte" | "moyenne" | "faible"; why: string; P: number | null; lo: number | null; hi: number | null;
  ecart: number | null; pct: number | null; moinsCherQue: number | null; dans1an: number | null; parKm: number | null; parAn: number | null;
  ajust: { l: string; eur: number }[]; segments: string[]; ch: number | null; comps: Comparable[]; medProches: number | null; nProches: number; horsGen: number; ecartees: number;
  /** carrosserie et finition retenues pour la voiture, base de calcul (« même moteur : 335i ») */
  carrosserie: string | null; finition: string | null; base: string;
};
export type Cote = { cle: string; nom: string; base: string; gen: string; energie: string; y0: number; y1: number; n: number; incertain?: boolean };
export type Point = { prix: number; annee: number; km: number; auto: boolean; pro: boolean; id: string | null; lib: string; segs: string[]; ch: number | null; eq: number };
export type Carte = { id: string; url: string; titre: string; prix: number | null; annee: number | null; km: number | null; energie: string; boite: string; ville: string; cp: string; pro: boolean; badge: string; ch?: number };
export type AnnonceMoteur = { titre?: string; texte?: string; mec?: string; prix?: number | null; annee?: number | null; km?: number | null; energie?: string; boite?: string; pro?: boolean; ch?: number | null; places?: number | null; carr?: string; id?: string | null; etat?: string; marque?: string; modele?: string;
  /** motorisation (« 335i »), portes, finition Leboncoin, carrosserie reconnue (« coupe ») */
  moteur?: string | null; portes?: number | null; finition?: string | null; carrosserie?: string | null };

export const CATALOGUE: MarqueCat[];
export const SEGMENTS: { k: string; l: string }[];
export function reconnaitre(t: AnnonceMoteur): { marque: string; modele: string; base: string; gen: Gen | null; statut: string; label: string; pourquoi: string };
export function preparerCote(t: AnnonceMoteur, annonces: AnnonceMoteur[]): Cote | null;
export function estimer(c: Cote, t: AnnonceMoteur, prix?: number | null): Estimation | null;
export function points(c: Cote): Point[];
export function generationDe(base: string, a: AnnonceMoteur): { id: string | null; label: string; statut: string; variant: string | null; varianteEcrite: boolean; body: string | null; cands: string[] } | null;
export type SpecCollecte = { cle: string; nom: string; base: string; gen: string; energie: string; y0: number; y1: number; filtres: Record<string, unknown> };
export function specCollecte(base: string, genId: string, variantId: string | null, energie: string): SpecCollecte | null;
export function coteGeneration(base: string, genId: string, energie: string, annonces: AnnonceMoteur[], opts?: { toutesCarr?: boolean; libelle?: string; finitions?: string[] }): Cote | null;
export function estimerDans(c: Cote, base: string, genId: string, a: AnnonceMoteur, prix?: number | null): Estimation | null;
export function modeleDe(base: string): { base: string; marque: string; nom: string; regex: string; gens: (Gen & { v: Version[] })[] } | null;
export function parseCard(it: { u?: string; t?: string; x?: string; f?: Record<string, unknown> }): Carte;
export function normEn(s: unknown): string;
export function normBo(s: unknown): string;
