/* Rapport complet au format de l'outil Garage (réponse de l'IA), lu avec tolérance : un champ absent ne casse rien. */
import type { Ia } from "./ia-schema";

type Txt = string | undefined;
type Liste = string[] | undefined;
export type Statut = "ok" | "attention" | "probleme" | "inconnu";

export type Rapport = {
  vehicule?: {
    titreAnnonce?: Txt; marque?: Txt; modele?: Txt; generation?: Txt; finition?: Txt; motorisation?: Txt; versionExacte?: Txt; annee?: number | null;
    premiereImmat?: Txt; km?: number | null; energie?: Txt; boite?: Txt; puissanceFiscale?: number | null; prix?: number | null; prixHT?: boolean;
    localisation?: Txt; distanceKm?: number | null; vendeur?: Txt; enLigneDepuisJours?: number | null; immat?: Txt; etat?: Txt; options?: Liste;
  };
  resume?: Txt; utoscore?: number; niveau?: Txt; justificationScore?: Txt;
  drapeaux?: { compteurSuspect?: boolean; sinistreGrave?: boolean; gageOuOpposition?: boolean; defautBloquant?: boolean; prixHT?: boolean };
  alertes?: Liste;
  annonceDecortiquee?: { sujet?: Txt; statut?: Txt; detail?: Txt }[];
  conclusionAnnonce?: Txt; vraiZeroEuro?: boolean; zeroEuroCommentaire?: Txt; profilAcheteur?: Txt; liquidite?: Txt; difficulteRevente?: Txt;
  scores?: { revente?: number; marge?: number; risqueMecanique?: number; risqueAdministratif?: number; compat0?: number; debutant?: number };
  controles?: { id?: Txt; statut?: Statut; detail?: Txt; source?: Txt }[];
  kmReleves?: { date?: Txt; km?: number; source?: Txt }[];
  histovec?: { fourni?: boolean; premiereImmatFrance?: Txt; nbTitulaires?: number | null; dernierChangementTitulaire?: Txt; sinistres?: Txt; gage?: Txt; opposition?: Txt; vol?: Txt; usage?: Txt; commentaire?: Txt };
  ctAnalyse?: { fourni?: boolean; date?: Txt; resultat?: Txt; kmAuCT?: number | null; defaillances?: { libelle?: Txt; niveau?: Txt; cout?: number }[]; commentaire?: Txt };
  entretienAnalyse?: { suivi?: Txt; interventions?: { date?: Txt; km?: number | null; travaux?: Txt }[]; aPrevoir?: { libelle?: Txt; echeance?: Txt; cout?: number }[]; commentaire?: Txt };
  fiabilite?: { moteur?: Txt; note?: number; problemesConnus?: { libelle?: Txt; gravite?: Txt; aVerifier?: Txt }[]; rappels?: Liste };
  pointsForts?: Liste; aVerifier?: Liste; signauxAnnonce?: Liste; coherencePrix?: Txt;
  visuel?: { visible?: Liste; probable?: Liste; nonVerifiable?: Liste };
  remiseEnEtat?: { minimum?: number; realisteMin?: number; realisteMax?: number; prudent?: number; confiance?: Txt; postes?: { categorie?: Txt; libelle?: Txt; montant?: number }[] };
  marche?: { prixAffiche?: number; bas?: number; realiste?: number; reventeRapide?: number; reventeOptimisee?: number; confiance?: Txt; commentaire?: Txt };
  couts?: { carteGrise?: number; assuranceAn?: number; entretien12mois?: number; commentaire?: Txt };
  structure?: { choix?: Txt; pourquoi?: Txt };
  etatPhotos?: {
    score?: number | null; photosSuffisantes?: boolean; vuesManquantes?: Liste; teinteDifferente?: { constat?: boolean; elements?: Liste; confiance?: Txt };
    defauts?: { libelle?: Txt; zone?: Txt; gravite?: Txt; coutMin?: number; coutMax?: number; confiance?: Txt }[]; incoherences?: Liste; compteurLu?: number | null; resume?: Txt; leviers?: Liste;
  };
  negociation?: { message1?: Txt; relance?: Txt; appel?: Liste; argumentaire?: { argument?: Txt; montant?: number; source?: Txt }[]; annonceOffre?: Txt; contreOffre?: Txt; sortie?: Txt };
  messageVendeur?: Txt; scriptStructure?: Txt; questions?: Liste; leviersNegociation?: Liste; inspection?: Liste; conditionSortie?: Txt; prochaineAction?: Txt;
  risquesCaches?: { administratif?: Liste; mecanique?: Liste; commercial?: Liste; negociation?: Liste; revente?: Liste };
  decision?: { action?: Txt; pourquoi?: Txt; conditions?: Txt };
};

const n = (x: unknown) => (typeof x === "number" && isFinite(x) ? x : typeof x === "string" && x.trim() && isFinite(+x) ? +x : null);
const l = (x: unknown): string[] => (Array.isArray(x) ? x.filter((y) => typeof y === "string" && y.trim()) : []);
const t = (x: unknown) => (typeof x === "string" ? x : "");
const conf = (x: unknown) => (x === "forte" || x === "moyenne" || x === "faible" ? x : "moyenne");

/** Lit la réponse JSON de l'IA (texte libre autour toléré). */
export function lireRapport(txt: string): Rapport {
  const json = txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1);
  const r = JSON.parse(json);
  if (!r || typeof r !== "object" || !r.vehicule) throw new Error("Réponse de l'IA hors format");
  return r as Rapport;
}

/** Vue simplifiée (format des écrans particulier et du calcul existant) tirée du rapport complet. */
export function versIa(r: Rapport): Ia {
  const v = r.vehicule ?? {};
  const m = r.marche ?? {};
  const ep = r.etatPhotos ?? {};
  const ng = r.negociation ?? {};
  const dr = r.drapeaux ?? {};
  const inspecter = dr.defautBloquant || dr.compteurSuspect || r.decision?.action === "abandonne";
  return {
    vehicule: {
      marque: t(v.marque), modele: t(v.modele), generation: t(v.generation), version: t(v.versionExacte) || [v.motorisation, v.finition].filter(Boolean).join(" "),
      annee: n(v.annee), km: n(v.km), energie: t(v.energie), boite: t(v.boite), puissanceFiscale: n(v.puissanceFiscale), prix: n(v.prix),
      localisation: t(v.localisation), vendeur: v.vendeur === "professionnel" ? "professionnel" : v.vendeur === "particulier" ? "particulier" : "inconnu",
    },
    distanceKm: n(v.distanceKm),
    marche: { bas: n(m.bas), realiste: n(m.realiste), haut: n(m.reventeOptimisee), reventeRapide: n(m.reventeRapide), confiance: conf(m.confiance), commentaire: t(m.commentaire) },
    photos: {
      fournies: n(ep.score) != null,
      score: n(ep.score),
      defauts: (ep.defauts ?? []).filter((d) => d?.libelle).map((d) => ({ libelle: t(d.libelle), gravite: d.gravite === "lourd" ? "lourd" : d.gravite === "moyen" ? "moyen" : "léger", coutMin: n(d.coutMin) ?? 0, coutMax: n(d.coutMax) ?? 0, confiance: conf(d.confiance) })),
      vuesManquantes: l(ep.vuesManquantes),
    },
    travaux: (r.entretienAnalyse?.aPrevoir ?? []).filter((x) => x?.libelle).map((x) => ({ libelle: t(x.libelle) + (x.echeance ? ` (${x.echeance})` : ""), type: "entretien", coutMin: n(x.cout) ?? 0, coutMax: n(x.cout) ?? 0 })),
    fiabilite: { moteur: t(r.fiabilite?.moteur), note: n(r.fiabilite?.note) ?? 5, problemesConnus: (r.fiabilite?.problemesConnus ?? []).map((x) => t(x?.libelle)).filter(Boolean) },
    drapeaux: { compteurSuspect: !!dr.compteurSuspect, sinistreGrave: !!dr.sinistreGrave, gageOuOpposition: !!dr.gageOuOpposition, defautBloquant: !!dr.defautBloquant, prixHT: !!(dr.prixHT || v.prixHT) },
    alertes: l(r.alertes),
    pointsForts: l(r.pointsForts),
    questions: l(r.questions),
    messageVendeur: t(ng.message1) || t(r.messageVendeur),
    resume: t(r.resume),
    resumeSimple: t(r.resume),
    synthese: [t(r.justificationScore), t(r.coherencePrix), ...l(r.alertes).slice(0, 2)].filter(Boolean).slice(0, 5),
    negociation: {
      prixOuverture: null,
      arguments: (ng.argumentaire ?? []).filter((x) => x?.argument).map((x) => ({ argument: t(x.argument), montant: n(x.montant) })),
      conseils: [...l(ng.appel), ...l(r.leviersNegociation)].slice(0, 6),
    },
    visite: { aControler: l(r.inspection), documents: ["Carte grise au nom du vendeur", "Contrôle technique de moins de 6 mois", "Certificat de non-gage de moins de 15 jours", "Rapport HistoVec", ...l(r.aVerifier)].slice(0, 9) },
    accompagnement: {
      recommandation: inspecter ? "faites inspecter la voiture" : (r.controles ?? []).some((c) => c?.statut === "probleme") ? "venez accompagné" : "vous pouvez y aller seul",
      pourquoi: t(r.decision?.pourquoi) || t(r.justificationScore),
    },
  };
}

/** Rapport complet minimal à partir de l'analyse par règles (IA indisponible) : même affichage, sections vides signalées. */
export function depuisIa(ia: Ia): Rapport {
  const v = ia.vehicule;
  const bloquant = ia.drapeaux.defautBloquant || ia.drapeaux.compteurSuspect || ia.drapeaux.gageOuOpposition;
  return {
    vehicule: { marque: v.marque, modele: v.modele, versionExacte: v.version, annee: v.annee, km: v.km, energie: v.energie, boite: v.boite, puissanceFiscale: v.puissanceFiscale, prix: v.prix, localisation: v.localisation, vendeur: v.vendeur, distanceKm: ia.distanceKm },
    resume: ia.resume,
    drapeaux: ia.drapeaux,
    alertes: ia.alertes,
    marche: { bas: ia.marche.bas ?? undefined, realiste: ia.marche.realiste ?? undefined, reventeRapide: ia.marche.reventeRapide ?? undefined, reventeOptimisee: ia.marche.haut ?? undefined, confiance: ia.marche.confiance, commentaire: ia.marche.commentaire },
    fiabilite: { moteur: ia.fiabilite.moteur, note: ia.fiabilite.note, problemesConnus: ia.fiabilite.problemesConnus.map((libelle) => ({ libelle, gravite: "moyenne", aVerifier: "" })) },
    pointsForts: ia.pointsForts,
    questions: ia.questions,
    inspection: ia.visite.aControler,
    aVerifier: ia.visite.documents,
    negociation: { message1: ia.messageVendeur, appel: ia.questions, argumentaire: ia.negociation.arguments.map((x) => ({ argument: x.argument, montant: x.montant ?? undefined, source: "annonce" })) },
    leviersNegociation: ia.negociation.conseils,
    decision: { action: bloquant ? "abandonne" : "attends", pourquoi: ia.accompagnement.pourquoi, conditions: "" },
  };
}
