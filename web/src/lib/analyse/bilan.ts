/* Bilan d'une annonce, avant le premier message : quatre questions simples, une note sur 100 pondérée selon le profil,
   un verdict, la confiance de l'analyse et ce qu'il faut demander au vendeur. Tout est calculé par l'outil, jamais par l'IA :
   l'IA apporte des faits (photos, version exacte, faiblesses du moteur), l'outil les pèse.
   Principes : on juge la voiture, jamais la personne (pas de « hors cible ») ; un document absent n'est pas un défaut,
   c'est une question à poser ; chaque note dit pourquoi. */
import { carteGrise, coutParticulier, type Analyse } from "./couts";
import { connaissancesDe, estPremium, ORDRE_AVIS, type Connu } from "./connaissances";
import { seuilMarge, type Delai, type ProfilAnalyse } from "./profil";
import { travauxProbables, type BudgetTravaux } from "./travaux";
import { VERDICTS, type TonVerdict, type VerdictCode } from "./verdicts";
import { avecComplements } from "./complements";
import { lireHistorique } from "./historique";
import { vigilance, type Vigilance } from "./vigilance";

export type Raison = { t: string; s: 1 | 0 | -1 };
export type ClePilier = "fiabilite" | "travaux" | "prix" | "rentabilite" | "usage";
export type Pilier = { cle: ClePilier; question: string; score: number | null; reponse: string; sous: string; raisons: Raison[]; ton: TonVerdict };
export type Scenario = { cle: Delai; l: string; delai: string; revente: number | null; marge: number | null };
export type Question = { q: string; pourquoi: string; montant?: number };

export type Bilan = {
  indice: number | null;
  verdict: VerdictCode;
  libelle: string;
  ton: TonVerdict;
  phrase: string;
  action: string;
  piliers: Pilier[];
  limites: string[];
  confiance: { score: number; label: string; ameliorer: string[] };
  travaux: BudgetTravaux;
  connus: Connu[];
  argent: {
    prix: number | null;
    /** Prix médian affiché des annonces comparables (ou son équivalent). */
    marche: number | null;
    /** Prix de vente réaliste entre particuliers (environ 5 % sous l'affiché). */
    realiste: number | null;
    ecartPct: number | null;
    cg: number | null;
    trajet: number | null;
    dist: number | null;
    fraisFixes: number;
    seuil: number;
    travauxRetenus: number;
    scenarios: Scenario[];
    retenu: Scenario | null;
    marge: number | null;
    plafond: number | null;
    offre: number | null;
    cible: number | null;
    proposer: number | null;
    coutReel: number | null;
    mensuel: number | null;
    decote: number | null;
    entretienAn: number | null;
    liquidite: "forte" | "moyenne" | "faible" | "inconnue";
    budgetDepasse: number | null;
  };
  aSavoir: Raison[];
  /** Annonce douteuse : signaux d'arnaque ou de vente à risque. */
  vigilance: Vigilance;
  /** Ce que l'annonce ou le vendeur ont déjà prouvé : les questions à ce sujet ne sont plus posées. */
  connu: { distribution: boolean; entretien: boolean; ct: boolean };
  /** Historique de l'annonce : jours en ligne, baisses de prix, même voiture ailleurs. */
  historique: ReturnType<typeof lireHistorique>;
  questions: Question[];
  message: string;
};

const clamp = (v: number, a = 0, b = 100) => Math.min(b, Math.max(a, v));
const r50 = (v: number) => Math.round(v / 50) * 50;
const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;
const num = (x: unknown) => (typeof x === "number" && isFinite(x) ? x : null);
const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const min1 = (s: string) => (s.charAt(0).toLowerCase() + s.slice(1)).replace(/\.$/, "");

export const tonScore = (s: number | null): TonVerdict => (s == null ? "neutre" : s >= 75 ? "ok" : s >= 55 ? "o" : s >= 40 ? "warn" : "bad");

const DELAIS: Record<Delai, { l: string; delai: string }> = {
  rapide: { l: "Vente rapide", delai: "2 à 3 semaines" },
  normal: { l: "Vente normale", delai: "1 à 2 mois" },
  patient: { l: "En prenant son temps", delai: "2 à 4 mois" },
};

/** Réputation du moteur et de la boîte : celle de l'analyse, sinon relue sur le titre et la version (anciens rapports). */
function connusDe(a: Analyse): Connu[] {
  if (a.fiab.connus) return a.fiab.connus;
  const v = a.ia?.vehicule;
  const texte = [a.faits.titre, v?.version, a.ia?.fiabilite.moteur, a.rapport?.vehicule?.motorisation, a.rapport?.vehicule?.boite ?? a.faits.boite].filter(Boolean).join(" ");
  return connaissancesDe({ texte, titre: [v?.marque, v?.modele].filter(Boolean).join(" "), marque: v?.marque, annee: v?.annee ?? a.faits.annee, km: v?.km ?? a.faits.km, energie: v?.energie || a.faits.energie });
}

/** Le pire avis d'un type (moteur, boîte), sinon le meilleur : c'est lui qui compte. */
function principal(connus: Connu[], type: Connu["type"]) {
  const l = connus.filter((c) => c.type === type).sort((x, y) => ORDRE_AVIS[x.avis] - ORDRE_AVIS[y.avis]);
  if (!l.length) return null;
  return l[0].avis === "eviter" || l[0].avis === "fragile" ? l[0] : l[l.length - 1];
}

/** `travaux` : budget travaux modifié à la main (sans marge de prudence) ; `remise` : le même avec la marge de prudence retenue. */
export function bilan(a0: Analyse, p: ProfilAnalyse, o: { prix?: number | null; distance?: number | null; travaux?: number | null; remise?: number | null } = {}): Bilan {
  // réponses du vendeur, documents et visite ajoutés au rapport : l'annonce relue avec eux
  const a = avecComplements(a0);
  const f = a.faits;
  const ia = a.ia;
  const v = ia?.vehicule;
  const prix = o.prix ?? f.prix ?? num(v?.prix);
  const annee = v?.annee ?? f.annee;
  const km = v?.km ?? f.km;
  const age = annee ? new Date().getFullYear() - annee : null;
  const energie = v?.energie || f.energie;
  const diesel = /diesel|gazole/i.test(energie);
  const electrique = /lectrique/i.test(energie);
  const marque = v?.marque || f.titre.split(/\s+/)[0] || "";
  const premium = estPremium(marque);
  const connus = connusDe(a);
  const budget = travauxProbables(a, connus);
  const neuf = f.recents ?? [];
  const dr = ia?.drapeaux;
  const pieges = new Set(budget.pieges.map((x) => x.cle));
  const flags = {
    gage: !!dr?.gageOuOpposition || pieges.has("admin"),
    compteur: !!dr?.compteurSuspect || pieges.has("compteur"),
    bloquant: !!dr?.defautBloquant || ["culasse", "moteur", "nonroulant", "surchauffe", "districasse"].some((k) => pieges.has(k)),
    sinistre: !!dr?.sinistreGrave || f.defauts.some((d) => d.k === "sinistre"),
    prixHT: !!dr?.prixHT,
  };

  /* ---------- Fiable ? ---------- */
  const fr: Raison[] = [];
  let sf = 68;
  const mo = principal(connus, "moteur");
  const bo = principal(connus, "boite");
  // faiblesse de distribution (courroie, chaîne) déjà traitée d'après l'annonce : la moitié de la pénalité
  const distriRefaite = neuf.includes("distribution") || f.distribution?.statut === "faite";
  if (mo) {
    const traite = (mo.avis === "eviter" || mo.avis === "fragile") && distriRefaite && /courroie|chaîne/i.test(mo.detail);
    sf += { robuste: 14, correct: 2, fragile: -14, eviter: -28 }[mo.avis] / (traite ? 2 : 1);
    fr.push({ t: `${mo.nom} : ${mo.avis === "robuste" ? "moteur réputé robuste" : mo.avis === "correct" ? "pas de défaut majeur connu" : min1(mo.detail)}${traite ? " ; distribution annoncée refaite" : ""}`, s: mo.avis === "robuste" ? 1 : mo.avis === "correct" ? 0 : -1 });
  }
  if (bo) {
    sf += { robuste: 4, correct: 0, fragile: -10, eviter: -18 }[bo.avis];
    fr.push({ t: `${bo.nom} : ${min1(bo.detail)}`, s: bo.avis === "robuste" ? 1 : bo.avis === "correct" ? 0 : -1 });
  }
  const bat = connus.find((c) => c.id === "location-batterie");
  if (bat) fr.push({ t: bat.detail, s: -1 });
  if (a.fiab.k === "fiable") {
    sf += 6;
    fr.push({ t: `${a.fiab.modele} : modèle réputé fiable`, s: 1 });
  }
  const kmVie = mo?.kmVie ?? (electrique ? 300000 : diesel ? 260000 : 220000);
  if (km != null) {
    const r = km / kmVie;
    const d = r < 0.35 ? 6 : r < 0.6 ? 2 : r < 0.8 ? -6 : r < 1 ? -14 : -22;
    sf += d;
    if (d >= 6) fr.push({ t: `${km.toLocaleString("fr-FR")} km : kilométrage faible pour ce moteur`, s: 1 });
    else if (d <= -6) fr.push({ t: `${km.toLocaleString("fr-FR")} km : ${r >= 1 ? "au-delà de la durée de vie habituelle de ce moteur" : "kilométrage élevé, l'usure se fait sentir"}`, s: -1 });
  }
  if (age != null && age > 15) {
    sf -= 5;
    fr.push({ t: `${age} ans : joints, durites et électricité vieillissent`, s: -1 });
  }
  if (f.carnet || f.factures) {
    sf += 8;
    fr.push({ t: `Entretien suivi annoncé (${[f.carnet && "carnet", f.factures && "factures"].filter(Boolean).join(" et ")})`, s: 1 });
  }
  const refaits = neuf.filter((x) => ["distribution", "embrayage", "turbo", "injecteurs", "pompe à eau", "volant moteur", "amortisseurs"].includes(x));
  if (refaits.length) {
    sf += Math.min(6, refaits.length * 2);
    fr.push({ t: `Déjà refait : ${refaits.join(", ")}`, s: 1 });
  }
  if (f.ct?.statut === "vierge" || f.ct?.statut === "ok") sf += 3;
  if (f.proprietaires === 1) {
    sf += 3;
    fr.push({ t: "Première main annoncée", s: 1 });
  }
  const noteIa = num(ia?.fiabilite.note);
  if (noteIa != null && !a.regles) sf = 0.75 * sf + 0.25 * clamp(noteIa * 10);
  if (flags.bloquant) {
    sf = Math.min(sf, 15);
    fr.unshift({ t: "Panne grave annoncée (moteur, culasse, non roulante…)", s: -1 });
  }
  if (flags.compteur) {
    sf = Math.min(sf, 25);
    fr.unshift({ t: "Kilométrage non garanti ou incohérent", s: -1 });
  }
  sf = Math.round(clamp(sf));
  const pFiab: Pilier = {
    cle: "fiabilite", question: "Fiable ?", score: sf, ton: tonScore(sf),
    reponse: sf >= 75 ? "Oui" : sf >= 58 ? "Plutôt oui" : sf >= 42 ? "Moyen" : "Risqué",
    sous: fr.find((x) => x.s === -1)?.t ?? fr.find((x) => x.s === 1)?.t ?? (mo ? mo.nom : "Moteur non reconnu : jugé sur l'âge, le kilométrage et l'entretien"),
    raisons: fr,
  };

  /* ---------- Des travaux ? ---------- */
  const prixRef = prix ?? 8000;
  const probable = o.travaux ?? budget.probable;
  let st = 100 - (probable / Math.max(prixRef, 1000)) * 260;
  if (budget.nc) st -= Math.min(25, 12 * budget.nc);
  if (budget.pieges.length) st = Math.min(st, 10);
  st = Math.round(clamp(st));
  const tr: Raison[] = budget.postes.slice(0, 6).map((x) => ({ t: `${x.libelle}${x.nc ? " (à chiffrer sur place)" : ` : ${eur(x.min)} à ${eur(x.max)}`}${x.proba < 1 ? ` · ${x.proba >= 0.5 ? "probable" : "possible"}` : ""}`, s: x.piege || x.proba >= 0.5 ? -1 : 0 }));
  if (neuf.length) tr.push({ t: `Annoncé neuf ou refait : ${neuf.join(", ")}`, s: 1 });
  const pTrav: Pilier = {
    cle: "travaux", question: "Des travaux ?", score: st, ton: tonScore(st),
    reponse: budget.pieges.length ? "Panne grave" : probable < 150 && !budget.nc ? "Rien de prévu" : `≈ ${eur(probable)}`,
    sous: budget.pieges.length
      ? `${budget.pieges[0].libelle} : impossible à chiffrer sans inspection`
      : probable < 150 && !budget.nc
        ? "Aucun défaut annoncé, entretien à jour d'après l'annonce"
        : `Probable sur 12 mois, entre ${eur(budget.min)} et ${eur(budget.max)}${budget.nc ? ` · ${budget.nc} point${budget.nc > 1 ? "s" : ""} à chiffrer sur place` : ""}`,
    raisons: tr,
  };

  /* ---------- Bon prix ? ---------- */
  const realisteIa = num(ia?.marche.realiste);
  const marche = a.cote ? a.cote.mediane : realisteIa != null ? r50(realisteIa / 0.95) : f.estimSite ? r50((f.estimSite.min + f.estimSite.max) / 2) : null;
  const realiste = a.cote ? r50(a.cote.mediane * 0.95) : realisteIa ?? (marche != null ? r50(marche * 0.95) : null);
  const ecart = marche != null && prix != null ? (marche - prix) / marche : null;
  const pr: Raison[] = [];
  if (a.cote) pr.push({ t: `Cote calculée sur ${a.cote.n} annonces comparables en ligne (moitié entre ${eur(a.cote.p25)} et ${eur(a.cote.p75)})`, s: 0 });
  else if (realisteIa != null) pr.push({ t: `Peu d'annonces comparables : cote estimée, confiance ${ia?.marche.confiance ?? "faible"}`, s: 0 });
  if (f.estimSite && prix != null) pr.push({ t: `Estimation Leboncoin : ${eur(f.estimSite.min)} à ${eur(f.estimSite.max)}`, s: prix <= f.estimSite.max ? (prix < f.estimSite.min ? 1 : 0) : -1 });
  const sp = ecart == null ? null : Math.round(clamp(60 + ecart * 300));
  const pPrix: Pilier = {
    cle: "prix", question: "Bon prix ?", score: sp, ton: tonScore(sp),
    reponse: ecart == null ? "À comparer" : ecart >= 0.08 ? "Très bon prix" : ecart >= 0.03 ? "Bon prix" : ecart >= -0.03 ? "Prix du marché" : ecart >= -0.1 ? "Un peu cher" : "Trop cher",
    sous: ecart == null || marche == null || prix == null ? "Pas assez d'annonces comparables pour juger le prix" : Math.abs(ecart) < 0.03 ? `Au prix des annonces comparables (≈ ${eur(marche)})` : `${eur(Math.abs(marche - prix))} ${ecart > 0 ? "de moins" : "de plus"} que les annonces comparables (${ecart > 0 ? "−" : "+"}${Math.round(Math.abs(ecart) * 100)} %)`,
    raisons: pr,
  };

  /* ---------- Argent : frais, revente, coût d'usage ---------- */
  const cgv = p.objectif === "revente" && p.negociant ? 0 : carteGrise(a, p.tarifCV).v;
  const dist = o.distance ?? num(ia?.distanceKm);
  const trajet = dist != null ? Math.round(dist * 2 * p.kmCost) : null;
  const seuil = seuilMarge(p, prix);
  const prudence = { debutant: 0.3, habitue: 0.2, pro: 0.1 }[p.experience];
  const travauxRetenus = o.remise ?? r50(probable * (1 + prudence));
  const couts = travauxRetenus + (cgv ?? 0) + (trajet ?? 0) + p.fraisFixes;
  const reventes: Record<Delai, number | null> = a.cote
    ? { rapide: r50(a.cote.p25 * 0.98), normal: r50(a.cote.mediane * 0.96), patient: r50(a.cote.p75 * 0.94) }
    : { rapide: num(ia?.marche.reventeRapide), normal: realisteIa, patient: num(ia?.marche.haut) };
  const scenarios: Scenario[] = (["rapide", "normal", "patient"] as Delai[]).map((k) => {
    const rv = reventes[k];
    return { cle: k, ...DELAIS[k], revente: rv, marge: rv != null && prix != null ? Math.round(rv - prix - couts) : null };
  });
  const retenu = scenarios.find((s) => s.cle === p.delai && s.revente != null) ?? scenarios.find((s) => s.cle === "normal" && s.revente != null) ?? scenarios.find((s) => s.revente != null) ?? null;
  const marge = retenu?.marge ?? null;
  const plafond = retenu?.revente != null ? Math.floor((retenu.revente - couts - seuil) / 50) * 50 : null;
  const offre = plafond != null && plafond > 0 ? Math.floor((plafond * 0.94) / 50) * 50 : null;
  const cible = offre != null && plafond != null && plafond > 0 ? Math.min(plafond, r50((offre + plafond) / 2)) : null;
  const n = a.cote?.n ?? null;
  let liquidite: Bilan["argent"]["liquidite"] = n == null ? "inconnue" : n >= 40 ? "forte" : n >= 15 ? "moyenne" : "faible";
  if (prix != null && prix > 25000 && liquidite === "forte") liquidite = "moyenne";

  // Coût d'usage sur 12 mois : décote, entretien courant, travaux probables
  const valeur = realiste ?? prix;
  const proj = a.projection;
  let decote: number | null = null;
  // parKm : perte pour 10 000 km de plus (moteur de cote de l'outil)
  if (proj?.parAn != null && proj.parKm != null) decote = Math.round(Math.max(0, proj.parAn + (proj.parKm * p.kmAn) / 10000));
  else if (proj?.dans1an != null && proj.P != null) decote = Math.round(Math.max(0, (proj.P - proj.dans1an) * (0.6 + (0.4 * p.kmAn) / 15000)));
  else if (valeur != null) decote = Math.round(Math.max(200, valeur * (age == null ? 0.1 : age <= 3 ? 0.15 : age <= 6 ? 0.11 : age <= 10 ? 0.08 : 0.05)));
  const entretienAn = Math.round((premium ? 700 : 450) * clamp(p.kmAn / 15000, 0.6, 1.6) * (electrique ? 0.6 : 1));
  // batterie en location (Zoé, Twizy…) : loyer mensuel en plus, environ 90 € selon le forfait kilométrique
  const loyerBatterie = connus.some((c) => c.id === "location-batterie") ? 90 * 12 : 0;
  const annuel = decote != null ? decote + entretienAn + budget.probable + loyerBatterie : null;
  const mensuel = annuel != null ? Math.round(annuel / 12 / 5) * 5 : null;
  const cp = coutParticulier(a, { tarifCV: p.tarifCV, kmCost: p.kmCost, ville: p.ville }, o.distance ?? null);
  const coutReel = cp.total;
  // prix à proposer (usage) : le prix réaliste moins l'essentiel des travaux probables, sans descendre sous 75 % du prix affiché
  const proposer = realiste != null && prix != null ? Math.max(Math.floor((prix * 0.75) / 50) * 50, Math.min(prix, Math.floor((realiste - budget.probable * 0.8) / 50) * 50)) : null;
  const budgetDepasse = p.budget && prix != null && prix > p.budget ? prix - p.budget : null;

  const piliers: Pilier[] = [pFiab, pTrav, pPrix];
  if (p.objectif === "revente") {
    const sr = marge == null ? null : Math.round(clamp(50 + (50 * (marge - seuil)) / Math.max(seuil, 300)));
    const rr: Raison[] = [];
    if (retenu) rr.push({ t: `${retenu.l} (${retenu.delai}) autour de ${eur(retenu.revente ?? 0)}`, s: 0 });
    rr.push({ t: `Frais comptés : travaux ${eur(travauxRetenus)} (marge de prudence comprise), carte grise ${cgv != null ? eur(cgv) : "inconnue"}, trajet ${trajet != null ? eur(trajet) : "inconnu"}, frais ${eur(p.fraisFixes)}`, s: 0 });
    rr.push({ t: `Revente ${liquidite === "inconnue" ? "difficile à évaluer" : liquidite === "forte" ? "facile : marché large" : liquidite === "moyenne" ? "normale" : "plus lente : marché étroit"}${n != null ? ` (${n} annonces comparables)` : ""}`, s: liquidite === "forte" ? 1 : liquidite === "faible" ? -1 : 0 });
    if (plafond != null) rr.push({ t: plafond > 0 ? `Prix d'achat maximum pour garder ${eur(seuil)} : ${eur(plafond)}` : `Aucun prix d'achat ne laisse ${eur(seuil)}`, s: plafond > 0 && prix != null && plafond >= prix ? 1 : -1 });
    piliers.push({
      cle: "rentabilite", question: "Ça rapporte ?", score: sr, ton: tonScore(sr),
      reponse: marge == null ? "Cote inconnue" : marge >= 0 ? `+${eur(marge)}` : `−${eur(-marge)}`,
      sous: marge == null ? "Sans cote du marché, le bénéfice ne peut pas être calculé" : marge >= seuil ? `Au-dessus de votre minimum de ${eur(seuil)}` : marge >= 0 ? `Sous votre minimum de ${eur(seuil)}` : "Vous perdriez de l'argent au prix affiché",
      raisons: rr,
    });
  } else {
    const su = annuel == null ? null : Math.round(clamp(100 - (annuel / Math.max(prix ?? valeur ?? 5000, 1000)) * 200));
    const ur: Raison[] = [];
    if (decote != null) ur.push({ t: `Perte de valeur estimée : ${eur(decote)} la première année${proj ? " (mesurée sur les annonces du modèle)" : ""}`, s: 0 });
    ur.push({ t: `Entretien courant : environ ${eur(entretienAn)} par an pour ${p.kmAn.toLocaleString("fr-FR")} km`, s: 0 });
    if (budget.probable >= 150) ur.push({ t: `Travaux probables : ${eur(budget.probable)}`, s: -1 });
    if (loyerBatterie) ur.push({ t: "Loyer de batterie : environ 90 € par mois en plus", s: -1 });
    if (p.objectif === "mixte" && valeur != null && decote != null) ur.push({ t: `Valeur de revente dans un an : environ ${eur(Math.max(0, valeur - decote))}`, s: 0 });
    piliers.push({
      cle: "usage", question: p.objectif === "mixte" ? "Combien elle vous coûte ?" : "Combien par mois ?", score: su, ton: tonScore(su),
      reponse: mensuel != null ? `≈ ${eur(mensuel)} / mois` : "À estimer",
      sous: "Hors carburant et assurance : perte de valeur, entretien et travaux probables",
      raisons: ur,
    });
  }

  /* ---------- Note sur 100, selon le profil ---------- */
  const poids: Record<ClePilier, number> =
    p.objectif === "revente" ? { fiabilite: 0.2, travaux: 0.2, prix: 0.2, rentabilite: 0.4, usage: 0 }
    : p.objectif === "mixte" ? { fiabilite: 0.3, travaux: 0.25, prix: 0.25, usage: 0.2, rentabilite: 0 }
    : { fiabilite: 0.35, travaux: 0.3, prix: 0.25, usage: 0.1, rentabilite: 0 };
  poids.travaux = Math.max(0.05, poids.travaux + (p.travaux === "aucun" ? 0.1 : p.travaux === "gros" ? -0.1 : 0));
  if (p.experience === "debutant") poids.fiabilite += 0.05;
  const notes = piliers.filter((x) => x.score != null);
  let indice = notes.length ? Math.round(notes.reduce((s, x) => s + poids[x.cle] * x.score!, 0) / notes.reduce((s, x) => s + poids[x.cle], 0)) : null;
  const caps: { v: number; why: string }[] = [];
  const vig = vigilance(a);
  const arnaque = vig.signaux.some((x) => x.poids === 3);
  if (flags.gage) caps.push({ v: 15, why: "problème de papiers (gage, opposition, carte grise)" });
  if (vig.niveau === "alerte") caps.push({ v: arnaque ? 20 : 40, why: "signaux d'annonce douteuse" });
  else if (vig.niveau === "prudence") caps.push({ v: 70, why: "points de vigilance sur l'annonce" });
  if (flags.compteur) caps.push({ v: 20, why: "kilométrage non garanti" });
  if (flags.bloquant) caps.push({ v: 25, why: "panne grave annoncée" });
  if (flags.sinistre) caps.push({ v: 45, why: "véhicule déclaré gravement endommagé" });
  if (flags.prixHT) caps.push({ v: 55, why: "prix affiché hors taxes" });
  if (p.travaux === "aucun" && prix != null && budget.probable > prix * 0.1) caps.push({ v: 60, why: "plus de travaux que vous n'en acceptez" });
  if (p.objectif === "revente" && marge != null && marge < seuil) caps.push({ v: 64, why: `bénéfice sous votre minimum de ${eur(seuil)}` });
  if (budget.nc && p.experience === "debutant") caps.push({ v: 65, why: "un défaut ne peut pas être chiffré sans inspection" });
  if (p.objectif === "revente" && marge == null) caps.push({ v: 60, why: "bénéfice impossible à calculer sans cote du marché" });
  else if (sp == null) caps.push({ v: 75, why: "prix impossible à comparer au marché" });
  const limites = caps.filter((c) => indice != null && indice > c.v).sort((x, y) => x.v - y.v);
  if (indice != null && limites.length) indice = Math.min(indice, limites[0].v);

  /* ---------- Verdict ---------- */
  const pireNeg = [...pFiab.raisons, ...pTrav.raisons].find((x) => x.s === -1)?.t;
  let verdict: VerdictCode;
  if (flags.gage || flags.compteur || flags.bloquant || arnaque) verdict = "eviter";
  else if (p.objectif === "revente") {
    if (marge == null) verdict = "creuser";
    else if (marge >= seuil) verdict = budget.nc || flags.sinistre ? "creuser" : (indice ?? 0) >= 75 ? "excellente" : "bonne";
    // négociable : le prix maximum reste à moins de 18 % du prix affiché (au-delà, peu de vendeurs suivent)
    else if (plafond != null && plafond > 0 && prix != null && plafond >= prix * 0.82) verdict = "negocier";
    else verdict = "eviter";
  } else {
    const i = indice ?? 0;
    const argumentsChiffres = (sp != null && sp < 55) || (prix != null && budget.probable >= prix * 0.06);
    verdict = i >= 80 ? "excellente" : i >= 65 ? "bonne" : i >= 45 ? (argumentsChiffres ? "negocier" : "creuser") : i >= 35 && !argumentsChiffres ? "creuser" : "eviter";
    if ((verdict === "excellente" || verdict === "bonne") && sp != null && sp < 45) verdict = "negocier";
    if ((verdict === "excellente" || verdict === "bonne") && budget.nc && p.experience !== "pro") verdict = "creuser";
    if ((verdict === "excellente" || verdict === "bonne") && p.travaux === "aucun" && prix != null && budget.probable > prix * 0.1) verdict = "negocier";
    // moteur ou boîte à éviter, sans preuve que le point faible a été traité : on demande d'abord
    if ((verdict === "excellente" || verdict === "bonne") && connus.some((c) => c.avis === "eviter") && !distriRefaite && p.experience !== "pro") verdict = "creuser";
  }
  if (verdict === "excellente" && connus.some((c) => c.avis === "eviter")) verdict = "bonne";
  const nomVoiture = [v?.marque, v?.modele].filter(Boolean).join(" ") || "la voiture";
  const raisonEviter = arnaque ? `Signaux d'arnaque : ${vig.signaux[0].t.charAt(0).toLowerCase()}${vig.signaux[0].t.slice(1)}.` : flags.gage ? "Problème de papiers (gage, opposition ou carte grise)." : flags.compteur ? "Kilométrage non garanti : impossible de savoir ce que vous achetez." : flags.bloquant ? `${budget.pieges[0]?.libelle ?? "Panne grave annoncée"} : réparation impossible à chiffrer.` : null;
  const PHRASES: Record<VerdictCode, [string, string]> =
    p.objectif === "revente"
      ? {
          excellente: [`Il vous resterait environ ${eur(marge ?? 0)}, au-dessus de votre minimum, sur un marché ${liquidite === "faible" ? "étroit mais solide" : "qui se vend bien"}.`, "Écrivez au vendeur maintenant."],
          bonne: [`Il vous resterait environ ${eur(marge ?? 0)} pour ${eur(seuil)} visés.`, "Écrivez au vendeur et faites-vous confirmer les points ci-dessous."],
          negocier: [`Au prix affiché, ${marge != null && marge >= 0 ? `il vous resterait ${eur(marge)}` : `vous perdriez ${eur(-(marge ?? 0))}`}. À ${offre != null ? eur(offre) : "un prix plus bas"}, vous retrouvez votre minimum de ${eur(seuil)}.`, `Visitez, puis proposez ${offre != null ? eur(offre) : "moins"} ; ne dépassez jamais ${plafond != null ? eur(plafond) : "votre plafond"}.`],
          creuser: [marge == null ? "Sans cote fiable du marché, le bénéfice ne peut pas être chiffré." : `Le bénéfice tient (${eur(marge)}), mais ${budget.nc ? "un défaut reste à chiffrer sur place" : "un sinistre est signalé"}.`, "Posez les questions ci-dessous avant de vous déplacer."],
          eviter: [raisonEviter ?? `Même bien négociée, elle ne laisse pas votre minimum de ${eur(seuil)}${plafond != null && plafond > 0 ? ` (il faudrait l'acheter ${eur(plafond)} au plus)` : ""}.`, "Passez à l'annonce suivante."],
        }
      : {
          excellente: [`${maj(nomVoiture)} fiable, bien placée en prix, avec peu de frais à prévoir.`, "Écrivez au vendeur sans tarder."],
          bonne: ["Un bon choix, à confirmer pendant la visite.", "Écrivez au vendeur et posez les questions ci-dessous."],
          negocier: [sp != null && sp < 45 ? `Intéressante, mais affichée au-dessus du marché.${proposer != null ? ` Visez ${eur(proposer)}.` : ""}` : `Intéressante, mais comptez ${eur(budget.probable)} de travaux.${proposer != null ? ` Visez ${eur(proposer)}.` : ""}`, "Visitez, puis négociez avec les arguments chiffrés."],
          creuser: [pireNeg ? `À confirmer : ${pireNeg.charAt(0).toLowerCase()}${pireNeg.slice(1)}.` : "Trop d'inconnues pour trancher.", "Posez les questions ci-dessous avant de vous déplacer."],
          eviter: [raisonEviter ?? (pireNeg ? `${pireNeg}.` : "Trop de risques pour le prix demandé."), "Passez à l'annonce suivante."],
        };
  // annonce douteuse ou signal sérieux (acompte, vendeur à l'étranger…) : on vérifie d'abord, quel que soit le reste
  const aVerifier = vig.niveau === "alerte" || vig.signaux.some((x) => x.poids >= 2);
  if (aVerifier && verdict !== "eviter") verdict = "creuser";
  // trop peu d'informations pour conseiller d'y aller (annonce de quelques lignes, sans cote)
  else if (p.objectif !== "revente" && (verdict === "excellente" || verdict === "bonne") && f.descCourte && sp == null) {
    verdict = "creuser";
    PHRASES.creuser = ["Trop peu d'informations pour juger : annonce de quelques lignes, prix impossible à comparer.", "Demandez la version exacte, l'entretien et des photos avant de vous déplacer."];
  }
  if (aVerifier && verdict === "creuser") PHRASES.creuser = [`Annonce à vérifier avant tout : ${vig.signaux[0].t.charAt(0).toLowerCase()}${vig.signaux[0].t.slice(1)}.`, "Posez les questions ci-dessous et ne versez rien avant d'avoir vu la voiture."];
  const [phrase, action] = PHRASES[verdict];

  /* ---------- Confiance de l'analyse ---------- */
  let conf = 0;
  const ameliorer: string[] = [];
  if (a.cote && a.cote.n >= 20) conf += 30;
  else if (a.cote) conf += 20;
  else if (realisteIa != null) {
    conf += 10;
    ameliorer.push("Peu d'annonces comparables : la cote est estimée");
  } else ameliorer.push("Aucune cote du marché pour ce modèle");
  if (ia?.photos.fournies) conf += 20;
  else ameliorer.push("Ajoutez les photos de l'annonce : état, teinte des éléments, compteur");
  if (!f.descCourte) conf += 10;
  else ameliorer.push("Annonce très courte : peu d'informations du vendeur");
  if (connus.some((c) => c.type === "moteur")) conf += 15;
  else ameliorer.push("Moteur non reconnu : la version exacte (ex. 1.5 dCi 90) affinerait la fiabilité");
  if (km != null && annee) conf += 15;
  if (ia && !a.regles) conf += 10;
  const confiance = { score: conf, label: conf >= 70 ? "Analyse solide" : conf >= 45 ? "Analyse correcte" : "Analyse à confirmer", ameliorer };

  /* ---------- Ce qu'on ne sait pas encore : questions au vendeur ---------- */
  const Q: Question[] = [];
  for (const x of vig.signaux) {
    if (x.cle === "doublon") Q.push({ q: "Pourquoi la voiture est-elle remise en vente ?", pourquoi: x.t });
    else if (x.cle === "prix") Q.push({ q: "Pourquoi ce prix, nettement sous le marché ?", pourquoi: x.t });
    else if (x.cle === "etranger" || x.cle === "livraison") Q.push({ q: "Où et quand puis-je voir et essayer la voiture ?", pourquoi: x.t });
    else if (x.cle === "compteur" || x.cle === "recul") Q.push({ q: "Pouvez-vous m'expliquer l'écart de kilométrage ?", pourquoi: x.t });
  }
  budget.postes.filter((x) => x.nc && x.source === "annonce").forEach((x) => Q.push({ q: `${x.libelle.replace(/\.$/, "")} : a-t-il été diagnostiqué par un garage ?`, pourquoi: "Impossible à chiffrer sans diagnostic", montant: x.max || undefined }));
  connus.filter((c) => c.question && (c.avis === "eviter" || c.avis === "fragile") && !(distriRefaite && /courroie|chaîne|distribution/i.test(c.question))).forEach((c) => Q.push({ q: maj(c.question!), pourquoi: c.nom, montant: c.risque?.[2] }));
  const ed = budget.postes.find((x) => x.cle === "e_distri");
  if (ed) Q.push({ q: "La distribution a-t-elle été faite, à quel kilométrage ?", pourquoi: ed.pourquoi ?? "Entretien arrivé à échéance", montant: ed.max });
  if (age != null && age >= 4 && (!f.ct || f.ct.statut === "mentionné")) Q.push({ q: "Avez-vous un contrôle technique de moins de 6 mois ?", pourquoi: "Obligatoire pour vendre, et il montre les défauts" });
  else if (f.ct?.statut === "à faire") Q.push({ q: "Le contrôle technique sera-t-il fait avant la vente ?", pourquoi: "Il est à la charge du vendeur" });
  if (!f.carnet && !f.factures) Q.push({ q: "Avez-vous les factures d'entretien ?", pourquoi: "Elles prouvent l'entretien et rassurent à la revente" });
  const ee = budget.postes.find((x) => x.cle === "e_embr");
  if (ee) Q.push({ q: "L'embrayage est-il d'origine ?", pourquoi: ee.pourquoi ?? "Kilométrage élevé", montant: ee.max });
  connus.filter((c) => c.question && c.avis !== "eviter" && c.avis !== "fragile" && c.type !== "moteur").forEach((c) => Q.push({ q: maj(c.question!), pourquoi: c.nom }));
  if (!f.proprietaires) Q.push({ q: "Depuis quand l'avez-vous, et pourquoi la vendez-vous ?", pourquoi: "Un long historique rassure" });
  if (f.importe) Q.push({ q: "A-t-elle un historique d'entretien en France ?", pourquoi: "Véhicule importé" });
  const vus = new Set<string>();
  const questions = Q.filter((x) => (vus.has(x.q) ? false : (vus.add(x.q), true))).slice(0, 6);
  const modele = [v?.marque, v?.modele].filter(Boolean).join(" ") || "voiture";
  const qs = questions.slice(0, 2).map((x) => x.q);
  const minQ = (q: string) => q.charAt(0).toLowerCase() + q.slice(1);
  let message = `Bonjour, votre ${modele} est-elle toujours disponible ? ${qs.length ? `J'aurais ${qs.length > 1 ? "deux questions" : "une question"} : ${qs.map(minQ).join(" Et ")} ` : ""}Merci d'avance.`;
  if (message.length > 280 && qs.length > 1) message = `Bonjour, votre ${modele} est-elle toujours disponible ? J'aurais une question : ${minQ(qs[0])} Merci d'avance.`;

  /* ---------- Trois choses à savoir ---------- */
  const tout = [...pFiab.raisons, ...pTrav.raisons.filter((x) => x.s !== 0)];
  const aSavoir: Raison[] = [];
  const neg = tout.find((x) => x.s === -1);
  const pos = tout.find((x) => x.s === 1);
  if (neg) aSavoir.push(neg);
  if (pos) aSavoir.push(pos);
  if (p.objectif === "revente" && marge != null) aSavoir.push({ t: marge >= 0 ? `Bénéfice estimé au prix affiché : ${eur(marge)} (${retenu?.l.toLowerCase()}, ${retenu?.delai})` : `Au prix affiché, perte estimée de ${eur(-marge)} (${retenu?.l.toLowerCase()})`, s: marge >= seuil ? 1 : -1 });
  else if (coutReel != null) aSavoir.push({ t: `Coût réel d'achat : ${eur(coutReel)}${mensuel != null ? `, puis environ ${eur(mensuel)} par mois` : ""}`, s: 0 });
  if (budgetDepasse) aSavoir.push({ t: `${eur(budgetDepasse)} au-dessus de votre budget`, s: -1 });
  const histo = lireHistorique(a.historique, f.prix ?? prix);
  if (histo?.enLigne != null && histo.enLigne >= 30)
    aSavoir.unshift({ t: `En ligne depuis ${histo.enLigne} jours${histo.baisses ? `, prix baissé ${histo.baisses} fois (−${eur(histo.baisse)})` : ""} : le vendeur est sans doute prêt à négocier`, s: 1 });
  else if (histo?.baisse) aSavoir.unshift({ t: `Prix déjà baissé de ${eur(histo.baisse)} depuis la mise en ligne`, s: 1 });
  if (vig.niveau !== "aucune") aSavoir.unshift({ t: vig.signaux[0].t, s: -1 });

  return {
    indice, verdict, libelle: VERDICTS[verdict].l, ton: VERDICTS[verdict].ton, phrase, action, piliers, limites: limites.map((c) => c.why), confiance, travaux: budget, connus,
    argent: { prix, marche, realiste, ecartPct: ecart, cg: cgv, trajet, dist, fraisFixes: p.fraisFixes, seuil, travauxRetenus, scenarios, retenu, marge, plafond, offre, cible, proposer, coutReel, mensuel, decote, entretienAn, liquidite, budgetDepasse },
    aSavoir: aSavoir.slice(0, 4), questions, message, vigilance: vig, historique: histo, connu: { distribution: distriRefaite, entretien: !!(f.carnet || f.factures), ct: f.ct?.statut === "ok" || f.ct?.statut === "vierge" },
  };
}
