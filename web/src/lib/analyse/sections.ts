/* Sections du rapport complet (outil Garage) et ce que chaque formule Benef en voit.
   Illimité et Pro : tout. Les formules plus basses : une version réduite du même rapport. */
import type { OffreId } from "../offres";
import type { Rapport } from "./rapport";

export const SECTIONS = [
  ["annonce", "Annonce"], ["alertes", "Alertes"], ["etat", "État"], ["nego", "Négociation"], ["prix", "Prix"], ["km", "Kilométrage"], ["controles", "Contrôles"],
  ["papiers", "Papiers"], ["moteur", "Moteur"], ["photos", "Photos"], ["travaux", "Travaux"], ["deal", "Deal"], ["risques", "Risques"], ["decision", "Décision"],
] as const;
export type Section = (typeof SECTIONS)[number][0];

const TOUT = SECTIONS.map((s) => s[0]) as Section[];
export const SECTIONS_PAR_OFFRE: Partial<Record<OffreId, Section[]>> = {
  pro: TOUT,
  croissance: ["annonce", "alertes", "etat", "nego", "prix", "km", "controles", "papiers", "moteur", "photos", "travaux", "decision"],
  starter: ["annonce", "alertes", "etat", "nego", "prix", "controles", "decision"],
};
export const sectionsDe = (o: OffreId) => SECTIONS_PAR_OFFRE[o] ?? SECTIONS_PAR_OFFRE.starter!;
/** Formule la plus basse qui ouvre une section (pour le cadenas). */
export const ouvertePar = (s: Section): OffreId => (SECTIONS_PAR_OFFRE.starter!.includes(s) ? "starter" : SECTIONS_PAR_OFFRE.croissance!.includes(s) ? "croissance" : "pro");

/** Retire du rapport ce que la formule ne couvre pas : rien ne part vers le navigateur sans droit. */
export function filtrerRapport(r: Rapport, o: OffreId): Rapport {
  const ok = new Set(sectionsDe(o));
  const x: Rapport = { ...r };
  if (!ok.has("km")) delete x.kmReleves;
  if (!ok.has("papiers")) { delete x.histovec; delete x.entretienAnalyse; }
  if (!ok.has("moteur")) delete x.fiabilite;
  if (!ok.has("photos")) { delete x.visuel; delete x.signauxAnnonce; }
  if (!ok.has("travaux")) delete x.remiseEnEtat;
  if (!ok.has("deal")) { delete x.structure; delete x.scriptStructure; delete x.leviersNegociation; delete x.conditionSortie; delete x.scores; delete x.zeroEuroCommentaire; }
  if (!ok.has("risques")) delete x.risquesCaches;
  return x;
}
