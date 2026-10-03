/* Calculs d'argent : toujours par l'outil, jamais par l'IA.
   Pro : port de deal() de l'outil UTOPICAR Garage (marge nette, plafond, offre, verdict).
   Particulier : coût réel d'achat (prix + carte grise + trajet + CT + petites réparations). */
import type { Defaut } from "./defauts";
import type { Faits } from "./texte";
import type { Fiabilite } from "./fiabilite";
import type { Ia } from "./ia-schema";

export type Analyse = { faits: Faits; fiab: Fiabilite; ia: Ia | null; iaErreur?: string };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;

/* ---------- postes de travaux : annonce (règles fixes) + photos et entretien (IA) ---------- */
export function postes(a: Analyse): Defaut[] {
  const P: Defaut[] = [...a.faits.defauts];
  const ct = a.faits.ct;
  if (ct?.statut === "contre-visite") P.push({ k: "ct_cv", l: "Contre-visite au contrôle technique", cat: "lourd", min: 100, max: 800, nc: true, src: "annonce", extrait: ct.extrait });
  else if (ct?.statut === "à faire") P.push({ k: "ct_af", l: "CT à faire : défauts inconnus", cat: "lourd", min: 80, max: 500, nc: true, src: "annonce", extrait: ct.extrait });
  if (a.faits.distribution?.statut === "à faire" && !P.some((x) => x.k === "distri"))
    P.push({ k: "distri", l: "Distribution à faire", cat: "lourd", min: 400, max: 750, nc: false, src: "annonce", extrait: a.faits.distribution.extrait });
  a.ia?.photos.defauts.forEach((d, i) =>
    P.push({ k: "ph" + i, l: d.libelle + (d.confiance === "faible" ? " (à confirmer)" : ""), cat: d.gravite === "lourd" ? "lourd" : "levier", min: d.coutMin || 0, max: d.coutMax || d.coutMin || 0, nc: !(d.coutMax > 0), src: "photos", extrait: "", conf: d.confiance === "faible" || d.confiance === "forte" ? d.confiance : "moyenne" }),
  );
  a.ia?.travaux.forEach((t, i) =>
    P.push({ k: "tr" + i, l: t.libelle, cat: t.type === "gros travaux" ? "lourd" : "levier", min: t.coutMin || 0, max: t.coutMax || t.coutMin || 0, nc: !(t.coutMax > 0), src: "ia", extrait: "" }),
  );
  return P;
}

/** Note d'état 0-100 (description + photos). Port de etatCalc. */
export function etat(a: Analyse, P = postes(a)) {
  const f = a.faits;
  const pieges = P.filter((x) => x.cat === "piege");
  let s = 100;
  P.forEach((x) => {
    s -= x.cat === "piege" ? 60 : x.cat === "lourd" ? (x.nc ? 22 : 15) : x.cat === "levier" ? (x.conf === "faible" ? 4 : 8) : 6;
  });
  if (f.carnet || f.factures) s += 5;
  if (f.ct && (f.ct.statut === "vierge" || f.ct.statut === "ok")) s += 4;
  if (f.distribution?.statut === "faite") s += 4;
  const ph = a.ia?.photos.score;
  if (ph != null) s = 0.6 * s + 0.4 * clamp(ph, 0, 100);
  if (f.descCourte && ph == null) s = Math.min(s, 70);
  s = Math.round(clamp(s, 0, 100));
  if (pieges.length) s = Math.min(s, 20);
  const label = pieges.length ? "Piège : " + pieges[0].l.toLowerCase() : s >= 80 ? "Bon état" : s >= 60 ? "Quelques frais" : s >= 40 ? "À remettre en état" : "Risqué";
  return { score: s, label, pieges };
}

/* ---------- carte grise ---------- */
export function carteGrise(a: Analyse, tarifCV: number) {
  const cv = a.faits.cv ?? a.ia?.vehicule.puissanceFiscale ?? null;
  if (cv == null || cv <= 0 || cv > 60) return { v: null as number | null, d: "Puissance fiscale inconnue" };
  const annee = a.faits.annee ?? a.ia?.vehicule.annee ?? null;
  const half = annee != null && new Date().getFullYear() - annee - 0.5 >= 10;
  return {
    v: Math.round(cv * tarifCV * (half ? 0.5 : 1) + 13.76),
    d: `${cv} CV × ${tarifCV.toLocaleString("fr-FR")} €${half ? " ÷ 2 (plus de 10 ans)" : ""} + 13,76 €`,
  };
}

/* ================= PRO : rentabilité ================= */
export type ParamsPro = { margeMin: number; tarifCV: number; kmCost: number; fraisFixes: number; ville: string };
export const DEFAUTS_PRO: ParamsPro = { margeMin: 800, tarifCV: 68.95, kmCost: 0.25, fraisFixes: 150, ville: "Paris" };

export type Verdict = "GO" | "GO SI NÉGOCIÉ" | "GO EN MANDAT UNIQUEMENT" | "À SURVEILLER" | "NO GO";

export function dealPro(a: Analyse, p: ParamsPro, prixSaisi: number | null, distanceSaisie: number | null) {
  const seuil = p.margeMin;
  const P = postes(a);
  const E = etat(a, P);
  const prix = prixSaisi ?? a.faits.prix ?? a.ia?.vehicule.prix ?? null;
  const revente = a.ia?.marche.reventeRapide ?? a.ia?.marche.realiste ?? null;
  const chiffrables = P.filter((x) => x.cat !== "piege" && x.cat !== "info" && !x.nc);
  const remise = chiffrables.reduce((s, x) => s + x.max, 0);
  const nonChiffrables = P.filter((x) => x.nc && x.cat !== "piege").length;
  const cg = carteGrise(a, p.tarifCV);
  const dist = distanceSaisie ?? a.ia?.distanceKm ?? null;
  const trajet = dist != null ? Math.round(dist * 2 * p.kmCost) : null;
  const couts = remise + (cg.v ?? 0) + (trajet ?? 0) + p.fraisFixes;
  const gain = revente != null && prix != null ? Math.round(revente - prix - couts) : null;
  const plafond = revente != null ? Math.round(revente - couts - seuil) : null;
  const offre = plafond != null && plafond > 0 ? Math.floor((plafond * 0.94) / 50) * 50 : null;

  const dr = a.ia?.drapeaux;
  const k = new Set(P.filter((x) => x.cat === "piege").map((x) => x.k));
  const flags = {
    compteurSuspect: !!dr?.compteurSuspect || k.has("compteur"),
    gageOuOpposition: !!dr?.gageOuOpposition || k.has("admin"),
    defautBloquant: !!dr?.defautBloquant || ["culasse", "moteur", "nonroulant", "surchauffe", "districasse"].some((x) => k.has(x)),
    sinistreGrave: !!dr?.sinistreGrave,
    prixHT: !!dr?.prixHT,
  };
  const alertes = (a.ia?.alertes.length ?? 0) + P.filter((x) => x.cat === "lourd").length + (a.faits.ct?.statut === "à faire" ? 1 : 0);

  const margeNote = gain == null ? 40 : Math.round(clamp(50 + (50 * (gain - seuil)) / seuil, 0, 100));
  let note = Math.round(0.5 * E.score + 0.5 * margeNote);
  const caps: { v: number; why: string }[] = [];
  if (flags.gageOuOpposition) caps.push({ v: 20, why: "gage, opposition ou problème de papiers" });
  if (flags.compteurSuspect) caps.push({ v: 25, why: "kilométrage incohérent ou non garanti" });
  if (flags.defautBloquant) caps.push({ v: 40, why: "défaut mécanique bloquant" });
  if (flags.sinistreGrave) caps.push({ v: 45, why: "véhicule gravement endommagé" });
  if (flags.prixHT) caps.push({ v: 55, why: "prix affiché hors taxes" });
  if (gain != null && gain < seuil) caps.push({ v: 59, why: `il vous resterait moins que votre seuil de ${eur(seuil)}` });
  if (nonChiffrables > 0) caps.push({ v: 69, why: "une réparation ne peut pas être chiffrée sans inspection" });
  caps.push({ v: 79, why: "ni HistoVec ni PV de contrôle technique vérifiés" });
  if (alertes > 0) caps.push({ v: 84, why: "au moins une alerte dans le dossier" });
  caps.sort((x, y) => x.v - y.v);
  const cap = caps.find((c) => note > c.v) ? caps[0] : null;
  if (cap) note = Math.min(note, cap.v);

  let verdict: Verdict;
  if (flags.compteurSuspect || flags.gageOuOpposition || flags.defautBloquant) verdict = "NO GO";
  else if (gain == null) verdict = "À SURVEILLER";
  else if (gain >= seuil) verdict = nonChiffrables > 0 || flags.sinistreGrave ? "GO EN MANDAT UNIQUEMENT" : note >= 65 ? "GO" : "À SURVEILLER";
  else if (plafond != null && plafond > 0 && prix != null && plafond >= prix * 0.85) verdict = "GO SI NÉGOCIÉ";
  else verdict = "NO GO";

  const lignes = [
    { l: `Revente à ${p.ville || "Paris"}, en moins de 3 semaines`, d: revente != null ? `Cote IA, confiance ${a.ia?.marche.confiance}` : "Cote indisponible", v: revente, head: true },
    { l: prixSaisi != null ? "Votre prix" : "Prix demandé", d: "", v: prix != null ? -prix : null },
    { l: "Remise en état", d: chiffrables.length ? `${chiffrables.length} poste(s), fourchette haute` : "Aucun poste chiffré", v: -remise },
    { l: "Carte grise", d: cg.d, v: cg.v == null ? null : -cg.v },
    { l: "Trajet", d: dist != null ? `${dist} km × 2 × ${p.kmCost.toLocaleString("fr-FR")} €` : "Distance inconnue", v: trajet == null ? null : -trajet },
    { l: "Frais fixes", d: "CT, nettoyage, annonce", v: -p.fraisFixes },
  ];
  return { prix, revente, remise, cg, trajet, dist, couts, gain, plafond, offre, note, cap, verdict, lignes, postes: P, etat: E, flags, nonChiffrables };
}

/* ================= PARTICULIER : coût réel d'achat ================= */
export type ParamsPart = { tarifCV: number; kmCost: number; ville: string };
export const DEFAUTS_PART: ParamsPart = { tarifCV: 68.95, kmCost: 0.2, ville: "" };

export type Niveau = "bon" | "correct" | "cher" | "prudence" | "eviter" | "inconnu";

export function coutParticulier(a: Analyse, p: ParamsPart, distanceSaisie: number | null) {
  const P = postes(a);
  const E = etat(a, P);
  const prix = a.faits.prix ?? a.ia?.vehicule.prix ?? null;
  const cg = carteGrise(a, p.tarifCV);
  const dist = distanceSaisie ?? a.ia?.distanceKm ?? null;
  const trajet = dist != null ? Math.round(dist * 2 * p.kmCost) : null;

  // CT : obligatoire et à la charge du vendeur (voiture de plus de 4 ans), mais souvent absent.
  const ctOk = a.faits.ct && (a.faits.ct.statut === "ok" || a.faits.ct.statut === "vierge");
  const ct = ctOk ? 0 : 80;

  const petites = P.filter((x) => x.cat === "levier" && !x.nc);
  const repMin = petites.reduce((s, x) => s + x.min, 0);
  const repMax = petites.reduce((s, x) => s + x.max, 0);
  const rep = Math.round((repMin + repMax) / 2);
  // Le CT à faire a sa propre ligne de coût : il ne compte pas comme gros travaux.
  const gros = P.filter((x) => x.k !== "ct_af" && (x.cat === "lourd" || (x.cat === "levier" && x.nc)));

  const total = prix != null ? prix + (cg.v ?? 0) + (trajet ?? 0) + ct + rep : null;

  // Verdict : le pire entre le risque et le prix.
  const pieges = E.pieges;
  const dr = a.ia?.drapeaux;
  const eviter = pieges.length > 0 || !!dr?.compteurSuspect || !!dr?.gageOuOpposition || !!dr?.defautBloquant;
  const prudence = !eviter && (gros.length > 0 || a.fiab.k === "eviter" || !!dr?.sinistreGrave);
  const realiste = a.ia?.marche.realiste ?? null;
  let prixNiveau: Niveau = "inconnu";
  let ecart: number | null = null;
  if (realiste && prix != null) {
    ecart = realiste - (prix + rep);
    const e = ecart / realiste;
    prixNiveau = e > 0.05 ? "bon" : e < -0.08 ? "cher" : "correct";
  }
  const niveau: Niveau = eviter ? "eviter" : prudence ? "prudence" : prixNiveau;

  // Prix raisonnable à proposer : la cote moins les petites réparations, arrondie à 50 €.
  const proposer = realiste && prix != null ? Math.min(prix, Math.floor((realiste - rep) / 50) * 50) : null;

  const lignes = [
    { l: "Prix demandé", d: "", v: prix },
    { l: "Carte grise", d: cg.v == null ? "Puissance fiscale inconnue" : cg.d, v: cg.v },
    { l: "Trajet aller-retour", d: dist != null ? `${dist} km × 2 × ${p.kmCost.toLocaleString("fr-FR")} €` : "Indiquez votre ville", v: trajet },
    { l: "Contrôle technique", d: ctOk ? "CT récent annoncé" : "À prévoir si le vendeur ne le fournit pas", v: ct },
    { l: "Petites réparations", d: petites.length ? `${petites.length} point(s), entre ${eur(repMin)} et ${eur(repMax)}` : "Rien de signalé", v: rep },
  ];
  const incomplet = cg.v == null || trajet == null;
  return { prix, total, incomplet, lignes, cg, trajet, dist, ct, rep, repMin, repMax, petites, gros, pieges, niveau, prixNiveau, ecart, realiste, proposer, etat: E };
}
