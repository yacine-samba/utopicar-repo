/* Calcul du deal, port fidèle de deal() de l'outil Garage : déterministe, jamais par l'IA. */
import { carteGrise, eur, type Analyse, type ParamsPro, type Verdict } from "./couts";
import type { Rapport } from "./rapport";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const num = (x: unknown) => (typeof x === "number" && isFinite(x) ? x : null);

export type Poste = { categorie: string; libelle: string; montant: number };

/** Postes de remise en état de départ : ceux de l'IA, sinon les défauts chiffrés lus par l'outil. */
export function postesDepart(a: Analyse, r: Rapport): Poste[] {
  const ia = (r.remiseEnEtat?.postes ?? []).filter((p) => p?.libelle).map((p) => ({ categorie: p.categorie || "petite mécanique", libelle: p.libelle!, montant: num(p.montant) ?? 0 }));
  if (ia.length) return ia;
  return a.faits.defauts.filter((d) => d.cat !== "piege" && !d.nc).map((d) => ({ categorie: d.cat === "lourd" ? "petite mécanique" : "cosmétique", libelle: d.l, montant: d.max }));
}

export function calculDeal(a: Analyse, r: Rapport, p: ParamsPro, prixSaisi: number | null, remise: number | null) {
  const seuil = p.margeMin;
  const m = r.marche ?? {};
  const prix = prixSaisi ?? a.faits.prix ?? num(r.vehicule?.prix);
  const revente = num(m.reventeRapide) ?? num(m.realiste);
  const cg = carteGrise(a, p.tarifCV);
  const dist = num(r.vehicule?.distanceKm);
  const trajet = dist != null ? Math.round(dist * 2 * p.kmCost) : null;
  const fixes = p.fraisFixes || 0;
  const couts = (remise ?? 0) + (cg.v ?? 0) + (trajet ?? 0) + fixes;
  const gain = revente != null && prix != null ? Math.round(revente - prix - couts) : null;
  const plafond = revente != null ? Math.round(revente - couts - seuil) : null;
  const offre = plafond != null && plafond > 0 ? Math.floor((plafond * 0.94) / 50) * 50 : null;
  const cible = offre != null && plafond != null && plafond > 0 ? Math.min(plafond, Math.round((offre + plafond) / 2 / 50) * 50) : null;
  const coteReal = num(m.realiste);
  let position: { cls: "ok" | "bad" | ""; t: string } | null = null;
  if (coteReal && prix) {
    const e = (coteReal - prix) / coteReal;
    position = e > 0.03 ? { cls: "ok", t: `${eur(coteReal - prix)} sous la cote (${Math.round(e * 100)} %)` } : e < -0.03 ? { cls: "bad", t: `${eur(prix - coteReal)} au-dessus de la cote (${Math.round(-e * 100)} %)` } : { cls: "", t: "Au prix de la cote" };
  }
  const piege = new Set(a.faits.defauts.filter((d) => d.cat === "piege").map((d) => d.k));
  const dr = r.drapeaux ?? {};
  const f = {
    gageOuOpposition: !!dr.gageOuOpposition || piege.has("admin"),
    compteurSuspect: !!dr.compteurSuspect || piege.has("compteur"),
    defautBloquant: !!dr.defautBloquant || ["culasse", "moteur", "nonroulant", "surchauffe", "districasse"].some((k) => piege.has(k)),
    sinistreGrave: !!dr.sinistreGrave,
    prixHT: !!dr.prixHT,
  };
  const nonChiffrables = (r.remiseEnEtat?.postes ?? []).filter((x) => x?.categorie === "non estimable sans inspection").length + a.faits.defauts.filter((d) => d.cat === "piege" || (d.cat === "lourd" && d.nc)).length;
  const alertes = (r.alertes ?? []).length + a.faits.defauts.filter((d) => d.cat !== "levier").length;
  const dossier = num(r.utoscore) ?? 50;
  const margeNote = gain == null ? 40 : Math.round(clamp(50 + (50 * (gain - seuil)) / seuil, 0, 100));
  let note = Math.round(0.5 * clamp(dossier, 0, 100) + 0.5 * margeNote);
  const caps: { v: number; why: string }[] = [];
  if (f.gageOuOpposition) caps.push({ v: 20, why: "gage, opposition ou déclaration de vol" });
  if (f.compteurSuspect) caps.push({ v: 25, why: "kilométrage incohérent, compteur suspect" });
  if (f.defautBloquant) caps.push({ v: 40, why: "défaut mécanique bloquant" });
  if (f.sinistreGrave) caps.push({ v: 45, why: "véhicule déclaré gravement endommagé" });
  if (f.prixHT) caps.push({ v: 55, why: "prix affiché hors taxes" });
  if (gain != null && gain < seuil) caps.push({ v: 59, why: `il vous resterait moins que votre seuil de ${eur(seuil)}` });
  if (nonChiffrables > 0) caps.push({ v: 69, why: "une réparation ou un défaut annoncé ne peut pas être chiffré" });
  // documents absents (CT, HistoVec) : pas de plafond, un professionnel les obtient après le premier contact et les ajoute au dossier
  if (alertes > 0) caps.push({ v: 84, why: "au moins une alerte dans le dossier" });
  caps.sort((x, y) => x.v - y.v);
  const cap = caps.find((c) => note > c.v) ? caps[0] : null;
  if (cap) note = Math.min(note, cap.v);
  let verdict: Verdict;
  if (f.compteurSuspect || f.gageOuOpposition || f.defautBloquant) verdict = "NO GO";
  else if (gain == null) verdict = "À SURVEILLER";
  else if (gain >= seuil) verdict = nonChiffrables > 0 || f.sinistreGrave ? "GO EN MANDAT UNIQUEMENT" : note >= 65 ? "GO" : "À SURVEILLER";
  else if (plafond != null && plafond > 0 && prix != null && plafond >= prix * 0.85) verdict = "GO SI NÉGOCIÉ";
  else verdict = "NO GO";
  const lignes = [
    { l: `Revente à ${p.ville || "Paris"}, en moins de 3 semaines`, d: revente != null ? (a.cote ? `Cote de l'outil sur ${a.cote.n} annonces` : `Cote de l'IA, confiance ${m.confiance || "non précisée"}`) : "Cote manquante", v: revente, tete: true },
    { l: "Prix demandé", d: "", v: prix != null ? -prix : null },
    { l: "Remise en état", d: "Postes ci-dessous, marge de prudence comprise", v: remise == null ? null : -remise },
    { l: "Carte grise", d: cg.d, v: cg.v == null ? null : -cg.v },
    { l: "Trajet", d: dist != null ? `${Math.round(dist).toLocaleString("fr-FR")} km × 2 × ${p.kmCost.toLocaleString("fr-FR")} €` : "Distance inconnue", v: trajet == null ? null : -trajet },
    { l: "Frais fixes", d: "CT, nettoyage, annonce", v: -fixes },
  ];
  return { prix, revente, remise, cg, trajet, fixes, couts, gain, plafond, offre, cible, position, note, dossier, margeNote, caps, cap, verdict, lignes, seuil };
}
