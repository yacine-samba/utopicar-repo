/* Budget travaux des 12 prochains mois, par l'outil, jamais par l'IA : ce que dit l'annonce, ce que montrent les photos,
   l'entretien arrivé à échéance d'après l'âge et le kilométrage, et le risque connu du moteur ou de la boîte.
   Chaque poste a une probabilité : « sûr » (écrit ou vu), « probable », « possible ». Le budget probable additionne
   les postes sûrs et le coût moyen de chaque risque pondéré par sa probabilité ; la fourchette va de « rien de plus
   que le sûr » à « tout arrive ». */
import type { Analyse } from "./couts";
import type { Connu } from "./connaissances";
import { estPremium } from "./connaissances";

export type SourcePoste = "annonce" | "photos" | "ia" | "entretien" | "moteur" | "vendeur" | "visite";
export type PosteTravaux = {
  cle: string;
  libelle: string;
  min: number;
  max: number;
  /** 1 = écrit ou vu ; sinon la probabilité que la dépense tombe dans les 12 mois. */
  proba: number;
  source: SourcePoste;
  /** Impossible à chiffrer sans inspection (voyant, bruit, défaut rédhibitoire). */
  nc: boolean;
  /** Défaut rédhibitoire (moteur à refaire, papiers, compteur). */
  piege?: boolean;
  extrait?: string;
  /** Pourquoi ce poste (« 148 000 km sans preuve de remplacement »). */
  pourquoi?: string;
};

export type BudgetTravaux = { postes: PosteTravaux[]; probable: number; min: number; max: number; nc: number; pieges: PosteTravaux[] };

const r50 = (v: number) => Math.round(v / 50) * 50;
const contient = (l: string, re: RegExp) => re.test(l.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""));

export const probaTexte = (p: number) => (p >= 1 ? "sûr" : p >= 0.5 ? "probable" : p >= 0.25 ? "possible" : "peu probable");

/** Postes de travaux d'une analyse. `connus` : réputation du moteur et de la boîte. */
export function travauxProbables(a: Analyse, connus: Connu[]): BudgetTravaux {
  const f = a.faits;
  const ia = a.ia;
  const marque = ia?.vehicule.marque || f.titre.split(/\s+/)[0] || "";
  const coef = estPremium(marque) ? 1.4 : 1;
  const annee = ia?.vehicule.annee ?? f.annee;
  const age = annee ? new Date().getFullYear() - annee : null;
  const km = ia?.vehicule.km ?? f.km;
  const diesel = /diesel|gazole/i.test(ia?.vehicule.energie || f.energie);
  const electrique = /lectrique/i.test(ia?.vehicule.energie || f.energie);
  const auto = /auto/i.test(ia?.vehicule.boite || f.boite);
  const P: PosteTravaux[] = [];
  const deja = (re: RegExp) => P.some((p) => contient(p.libelle, re));
  const neuf = new Set(f.recents ?? []);

  // 1. Écrit dans l'annonce (règles fixes)
  for (const d of f.defauts) {
    if (d.cat === "info") continue;
    P.push({ cle: d.k, libelle: d.l, min: d.min, max: d.max, proba: 1, source: d.src === "visite" || d.src === "vendeur" ? d.src : "annonce", nc: d.nc || d.cat === "piege", piege: d.cat === "piege", extrait: d.extrait });
  }
  if (f.ct?.statut === "contre-visite") P.push({ cle: "ct_cv", libelle: "Contre-visite au contrôle technique", min: 100, max: 800, proba: 1, source: "annonce", nc: true, extrait: f.ct.extrait });
  if (f.distribution?.statut === "à faire" && !P.some((p) => p.cle === "distri"))
    P.push({ cle: "distri", libelle: "Distribution à faire", min: r50(450 * coef), max: r50(850 * coef), proba: 1, source: "annonce", nc: false, extrait: f.distribution.extrait });

  // 2. Vu sur les photos (IA), 3. entretien et travaux relevés par l'IA
  ia?.photos.defauts.forEach((d, i) =>
    P.push({ cle: `ph${i}`, libelle: d.libelle, min: d.coutMin || 0, max: d.coutMax || d.coutMin || 0, proba: d.confiance === "faible" ? 0.5 : 1, source: "photos", nc: !(d.coutMax > 0), pourquoi: d.confiance === "faible" ? "à confirmer sur place" : undefined }),
  );
  ia?.travaux.forEach((t, i) => {
    if ((/distribution|courroie/i.test(t.libelle) && deja(/distribution|courroie/)) || (/embrayage/i.test(t.libelle) && deja(/embrayage/))) return;
    P.push({ cle: `ia${i}`, libelle: t.libelle, min: t.coutMin || 0, max: t.coutMax || t.coutMin || 0, proba: t.type === "gros travaux" ? 0.6 : 0.8, source: "ia", nc: !(t.coutMax > 0) });
  });

  // 4. Entretien arrivé à échéance d'après l'âge et le kilométrage (pas de preuve dans l'annonce)
  const distriConnue = connus.find((c) => c.distri)?.distri;
  // le risque connu du moteur porte déjà sur la courroie (PureTech, EcoBoost) : pas de second poste distribution
  const courroieDejaComptee = connus.some((c) => c.risque && (c.avis === "eviter" || c.avis === "fragile") && /courroie/i.test(c.detail));
  const courroie = distriConnue ? distriConnue === "courroie" : diesel;
  if (!electrique && f.distribution?.statut !== "faite" && !neuf.has("distribution") && !courroieDejaComptee && !deja(/distribution|courroie/) && courroie && km != null) {
    const proba = km >= 150000 ? 0.6 : km >= 110000 ? 0.45 : age != null && age >= 8 && km >= 70000 ? 0.35 : 0;
    if (proba)
      P.push({
        cle: "e_distri", libelle: "Distribution (courroie) à prévoir", min: r50(450 * coef), max: r50(900 * coef), proba: distriConnue ? proba : proba * 0.8, source: "entretien", nc: false,
        pourquoi: `${km.toLocaleString("fr-FR")} km${age != null ? `, ${age} ans` : ""}, aucun remplacement prouvé dans l'annonce`,
      });
  }
  if (!electrique && !auto && km != null && km >= 160000 && !neuf.has("embrayage") && !deja(/embrayage/))
    P.push({
      cle: "e_embr", libelle: diesel ? "Embrayage et volant moteur fatigués" : "Embrayage fatigué", min: r50((diesel ? 700 : 500) * coef), max: r50((diesel ? 1500 : 950) * coef), proba: km >= 200000 ? 0.4 : 0.3, source: "entretien", nc: false,
      pourquoi: `${km.toLocaleString("fr-FR")} km : souvent d'origine à ce kilométrage`,
    });
  if (!f.carnet && !f.factures && !neuf.has("vidange") && !deja(/vidange|revision/))
    P.push({ cle: "e_rev", libelle: "Révision complète (vidange, filtres)", min: r50(150 * coef), max: r50(350 * coef), proba: 0.7, source: "entretien", nc: false, pourquoi: "aucune preuve d'entretien récent dans l'annonce" });
  if (!electrique && km != null && km >= 180000 && !neuf.has("amortisseurs") && !deja(/amortisseur/))
    P.push({ cle: "e_amort", libelle: "Amortisseurs fatigués", min: r50(300 * coef), max: r50(650 * coef), proba: 0.3, source: "entretien", nc: false, pourquoi: `${km.toLocaleString("fr-FR")} km` });

  // 5. Risque connu du moteur ou de la boîte
  for (const c of connus) {
    // risque d'un moteur ou d'une boîte fragile ; pour un moteur « correct », seulement un point faible fréquent (AdBlue, refroidisseur)
    if (!c.risque || c.avis === "robuste" || (c.avis === "correct" && !c.frequent)) continue;
    const [p0, min, max] = c.risque;
    // le risque grandit avec le kilométrage, et un entretien prouvé le réduit
    const usure = km == null ? 1 : km >= 150000 ? 1.3 : km < 60000 ? 0.6 : 1;
    const preuve = f.carnet || f.factures ? 0.75 : 1;
    const proba = Math.min(0.6, p0 * usure * preuve * (c.avis === "eviter" ? 1.2 : 1));
    P.push({ cle: `k_${c.id}`, libelle: `${c.nom} : ${c.detail.charAt(0).toLowerCase()}${c.detail.slice(1).replace(/\.$/, "")}`, min, max, proba, source: "moteur", nc: false, pourquoi: c.avis === "correct" ? `point faible fréquent de ${c.type === "boite" ? "cette boîte" : "ce moteur"}` : `réputation de ${c.type === "boite" ? "la boîte" : "ce moteur"} : ${c.avis === "eviter" ? "à éviter" : "fragile"}` });
  }

  const chiffres = P.filter((p) => !p.nc);
  const probable = r50(chiffres.reduce((s, p) => s + ((p.min + p.max) / 2) * p.proba, 0));
  const min = r50(chiffres.filter((p) => p.proba >= 1).reduce((s, p) => s + p.min, 0));
  const max = r50(chiffres.reduce((s, p) => s + p.max, 0));
  const pieges = P.filter((p) => p.piege);
  return { postes: P.sort((x, y) => Number(!!y.piege) - Number(!!x.piege) || y.proba - x.proba || y.max - x.max), probable, min, max, nc: P.filter((p) => p.nc && !p.piege).length, pieges };
}
