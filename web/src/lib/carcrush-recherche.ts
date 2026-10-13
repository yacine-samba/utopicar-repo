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

/** Photo Leboncoin en taille moyenne (la vignette « ad-small » est floue sur une carte plein écran). */
const enGrand = (u: string) => u.replace(/([?&]rule=)ad-small\b/, "$1ad-image");

/** Les 3 premières photos de l'annonce, sinon sa vignette seule. */
function photosDe(l: LigneMarche): string[] {
  const p = (Array.isArray(l.photos) ? l.photos : []).filter((u) => typeof u === "string" && u.startsWith("https://"));
  if (!p.length && l.photo?.startsWith("https://")) p.push(l.photo);
  return p.slice(0, 3).map(enGrand);
}

/** Portes de l'annonce : la case Leboncoin, sinon le texte (« 5 portes », « 3p »). null : non précisé. */
function portesDe(l: LigneMarche): "3" | "5" | null {
  if (l.portes != null) return l.portes <= 3 ? "3" : "5";
  const m = l.tx.match(/\b([2345])\s?(?:portes?|p)\b/);
  return m ? (Number(m[1]) <= 3 ? "3" : "5") : null;
}

/** Là où une annonce dit la couleur de la carrosserie : le titre et la version, « couleur : gris », et le résumé
    Leboncoin « berline, noir, 5 cv ». Pas toute la description (« intérieur noir », « jantes noires » tromperaient). */
function texteCouleur(l: LigneMarche) {
  const d = sansAccent(l.texte ?? "");
  const dite = [...d.matchAll(/\b(?:couleur|teinte|peinture|coloris)\s*:?\s*([a-z -]{2,25})/g)].map((m) => m[1]);
  const resume = [...d.matchAll(/\b(?:berline|citadine|break|suv|4x4|coupe|cabriolet|monospace|ludospace)\s*,\s*([a-z -]{2,20})\s*,/g)].map((m) => m[1]);
  return [sansAccent(`${l.titre} ${l.version ?? ""}`), ...dite, ...resume].join(" ");
}

/** Couleur demandée écrite dans l'annonce (« oui »), une autre couleur écrite sans elle (« autre »), ou rien (null). */
function couleurDe(l: LigneMarche, c: (typeof COULEURS)[number]): "oui" | "autre" | null {
  const t = texteCouleur(l);
  if (c.rx.test(t)) return "oui";
  return COULEURS.some((x) => x.id !== c.id && x.rx.test(t)) ? "autre" : null;
}

/** Sans cote Utopicar (trop peu d'annonces comparables) : le milieu de la fourchette de prix que Leboncoin affiche sur l'annonce,
    quand la collecte l'a gardée. Confiance faible : c'est l'estimation de Leboncoin, pas une mesure sur le marché. */
function estimationLeboncoin(l: LigneMarche): AnnonceCC["cote"] {
  const lo = l.lbc_min, hi = l.lbc_max;
  if (!lo || !hi || lo < 300 || hi < lo || hi > lo * 2) return null;
  const P = Math.round((lo + hi) / 2);
  return { P, ecart: P - l.prix, pct: (P - l.prix) / P, conf: "faible", source: "leboncoin" };
}

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
    // portes et couleur : écartées seulement quand l'annonce en donne d'autres ; non précisées, elles restent (signalées sur la carte)
    if (f.portes && portesDe(l) != null && portesDe(l) !== f.portes) return false;
    if (couleur && couleurDe(l, couleur) === "autre") return false;
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
    const photos = photosDe(l);
    const e = cotes.estimer(doute ? { ...l, gen: genC } : l);
    const cote = e && e.P
      ? { P: Math.round(e.P), ecart: e.ecart == null ? null : Math.round(e.ecart), pct: e.pct, conf: doute ? ("faible" as const) : e.conf, source: "utopicar" as const }
      : estimationLeboncoin(l);
    return {
      id: l.id, titre: (l.titre || "Annonce").slice(0, 140), prix: l.prix, annee: l.annee, km: l.km, ch: l.ch, energie: l.energie, boite: l.boite,
      pro: !!l.pro, lieu: l.lieu?.slice(0, 80) ?? null, url: lienAnnonce(l)?.replace(/^http:\/\//, "https://") ?? null, photo: l.photo?.startsWith("https://") ? l.photo : null,
      pro: !!l.pro, lieu: l.lieu?.slice(0, 80) ?? null, url: lienAnnonce(l), photo: photos[0] ?? null, photos,
      gen: l.genLabel || genObj?.label || "",
      cote,
      verdict: verdictPrix(cote?.pct, PIEGES.test(l.tx)),
      aVerifier: [
        ...(f.portes && portesDe(l) == null ? ["Portes non précisées"] : []),
        ...(couleur && couleurDe(l, couleur) == null ? ["Couleur non précisée"] : []),
      ],
    };
  });
  // les annonces qui confirment tous les critères d'abord, puis les meilleures affaires ;
  // les annonces à creuser (sans cote, piège, prix trop beau) à la fin
  const rang = (a: AnnonceCC) => (a.verdict === "creuser" ? -10 : a.cote?.pct ?? -9) - (a.aVerifier?.length ? 5 : 0);
  annonces.sort((a, b) => rang(b) - rang(a));
  return { annonces: annonces.slice(0, limite), total: annonces.length };
}
