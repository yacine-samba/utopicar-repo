import "server-only";
import { COULEURS, MAX_ANNONCES, verdictPrix, type AnnonceCC, type Criteres } from "./carcrush";
import { lienAnnonce, marcheModele, normBo, normEn, type LigneMarche } from "./vehicules/marche";
import { dansPhase } from "./vehicules/phases";
import { dansDepartements, departementsDe } from "./vehicules/leboncoin";
import { PIEGES } from "./vehicules/pieges";

/* Recherche CarCrush dans la base d'annonces Utopicar (même base et même cote que la recherche du marché de Benef),
   avec les critères d'un particulier. Lecture serveur : seules les 30 annonces de la pile sont renvoyées. */

const sansAccent = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const echapper = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export type ResultatCC = { annonces: AnnonceCC[]; total: number };

/** Annonces en ligne qui répondent aux critères, triées des meilleures affaires aux moins bonnes. null : modèle inconnu. */
export async function chercher(f: Criteres, limite = MAX_ANNONCES): Promise<ResultatCC | null> {
  const mm = await marcheModele(`${f.marque} ${f.modele}`, f.anneeMin ? f.anneeMin - 1 : null, null, true);
  if (!mm) return null;
  const { m, lignes, cotes } = mm;

  const genC = f.gen || (m.gens.length === 1 ? m.gens[0].id : "");
  const genObj = genC ? m.gens.find((g) => g.id === genC) : null;
  const [gy0, gy1] = genObj ? [genObj.y0, genObj.y1] : [0, 9999];
  // comme la recherche du marché : génération lue dans l'annonce, sinon d'après l'année (sauf si elle en écrit une autre)
  const dansGen = (l: LigneMarche) => !f.gen || l.gen === genC || (!l.gen && l.annee != null && l.annee >= gy0 && l.annee <= gy1 && (!l.cands.length || l.cands.includes(genC)));
  const mots = sansAccent(f.finition).split(/[\s,]+/).filter(Boolean).map((w) => new RegExp(`\\b${echapper(w)}\\b`));
  const couleur = COULEURS.find((c) => c.id === f.couleur);
  const deps = departementsDe(f.dep);

  const gardees = lignes.filter((l) => {
    if (l.en_ligne === false) return false;
    if (!dansGen(l)) return false;
    if (f.phase && genC && !dansPhase(m.base, genC, f.phase, l)) return false;
    if (f.energie && normEn(l.energie) !== f.energie) return false;
    if (f.boite && normBo(l.boite) !== (f.boite === "auto" ? "auto" : "manuelle")) return false;
    if (f.anneeMin && (l.annee ?? 0) < f.anneeMin) return false;
    if (f.prixMax && l.prix > f.prixMax) return false;
    if (f.kmMax && (l.km == null || l.km > f.kmMax)) return false;
    // portes et couleur : seulement quand l'annonce les donne (on ne devine pas)
    if (f.portes && (l.portes == null || (f.portes === "3" ? l.portes > 3 : l.portes < 4))) return false;
    if (couleur && !couleur.rx.test(l.tx)) return false;
    if (f.vendeur === "pro" && !l.pro) return false;
    if (f.vendeur === "particulier" && l.pro) return false;
    if (!dansDepartements(l.lieu, deps)) return false;
    if (mots.some((rx) => !rx.test(l.tx))) return false;
    return true;
  });

  // simple comptage (aperçu avant de lancer) : pas de cote à calculer
  if (limite <= 0) return { annonces: [], total: gardees.length };
  const annonces: AnnonceCC[] = gardees.map((l) => {
    const doute = !!f.gen && !l.gen;
    const e = cotes.estimer(doute ? { ...l, gen: genC } : l);
    const cote = e && e.P ? { P: Math.round(e.P), ecart: e.ecart == null ? null : Math.round(e.ecart), pct: e.pct, conf: doute ? ("faible" as const) : e.conf } : null;
    return {
      id: l.id, titre: (l.titre || "Annonce").slice(0, 140), prix: l.prix, annee: l.annee, km: l.km, ch: l.ch, energie: l.energie, boite: l.boite,
      pro: !!l.pro, lieu: l.lieu?.slice(0, 80) ?? null, url: lienAnnonce(l), photo: l.photo?.startsWith("https://") ? l.photo : null,
      gen: l.genLabel || genObj?.label || "",
      cote,
      verdict: verdictPrix(cote?.pct, PIEGES.test(l.tx)),
    };
  });
  // les meilleures affaires d'abord ; les annonces à creuser (sans cote, piège, prix trop beau) à la fin
  const rang = (a: AnnonceCC) => (a.verdict === "creuser" ? -10 : a.cote?.pct ?? -9);
  annonces.sort((a, b) => rang(b) - rang(a));
  return { annonces: annonces.slice(0, limite), total: annonces.length };
}
