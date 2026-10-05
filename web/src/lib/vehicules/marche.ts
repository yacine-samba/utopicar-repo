import "server-only";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { coteGeneration, estimerDans, generationDe, modeleDe, normEn, normBo, points, reconnaitre, type Cote, type Estimation } from "./moteur";
import { motorisationDe, moteurDeduit, profilMoteurs, type ProfilMoteurs } from "./phases";

/* Base du marché (annonces relevées, cotes Garage, recherches suivies) et moteur de cote de l'outil Garage, côté serveur. */

export type Ligne = {
  id: string; source: string; titre: string; texte: string | null; prix: number; annee: number | null; km: number | null;
  energie: string | null; boite: string | null; pro: boolean | null; ch: number | null; places: number | null; carr: string | null; etat: string | null;
  lieu: string | null; url: string | null; vu_le: string | null;
  /** critères Leboncoin : version exacte, finition, 1re mise en circulation (AAAA-MM), portes, estimation Leboncoin */
  version?: string | null; finition?: string | null; mec?: string | null; portes?: number | null; lbc_min?: number | null; lbc_max?: number | null; lbc_pos?: string | null;
};

/** Annonce du marché avec sa génération (sûre, déduite ou incertaine) et sa motorisation (écrite ou déduite de la puissance). */
export type LigneMarche = Ligne & {
  gen: string | null; genLabel: string; variant: string | null; varianteEcrite: boolean; body: string | null;
  /** générations possibles quand l'année tombe entre deux (A3 2012 : 8P ou 8V) */
  cands: string[]; genPar: "texte" | "puissance" | null;
  moteur: string | null; moteurDeduit: string | null; tx: string;
};

/** Motif du catalogue (JavaScript, \b) pour Postgres (\y). */
const versPg = (rx: string) => rx.replace(/\\b/g, "\\y");

export const lienAnnonce = (l: { id: string; url: string | null }) => l.url || (/^\d{6,14}$/.test(l.id) ? `https://www.leboncoin.fr/ad/voitures/${l.id}` : null);

/** Annonces d'un modèle sur une plage d'années (jusqu'à 5 000). */
export async function annoncesModele(regex: string, y0: number | null, y1: number | null, limite = 5000): Promise<Ligne[]> {
  const { data, error } = await (await supabaseServeur()).rpc("marche_candidats", { p_regex: versPg(regex), p_marque: null, p_annee_min: y0, p_annee_max: y1, p_limite: limite });
  if (error) throw new Error(error.message);
  return (data ?? []) as Ligne[];
}

// la version Leboncoin (moteur, puissance, finition) complète la description pour la reconnaissance et la cote
const versMoteur = (l: Ligne) => ({
  ...l, titre: l.titre ?? "", texte: [l.version, l.texte].filter(Boolean).join(" | "), mec: l.mec ?? "", carr: l.carr ?? "", etat: l.etat ?? "", energie: l.energie ?? "", boite: l.boite ?? "", pro: !!l.pro,
});
const sansAccent = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Cotes par génération et énergie, calculées une fois pour toutes les annonces d'un modèle. */
export class Cotes {
  private cache = new Map<string, Cote | null>();
  constructor(private base: string, private lignes: (Ligne & { gen: string | null; genPar?: string | null })[]) {}
  de(gen: string, energie: string) {
    const k = gen + "|" + energie;
    if (!this.cache.has(k)) {
      // la cote reste propre : seulement les annonces dont la génération est lue (pas celles déduites de la puissance)
      const rows = this.lignes.filter((l) => l.gen === gen && l.genPar !== "puissance" && (!energie || normEn(l.energie) === energie)).map(versMoteur);
      this.cache.set(k, rows.length >= 20 ? coteGeneration(this.base, gen, energie, rows) : null);
    }
    return this.cache.get(k) ?? null;
  }
  estimer(l: Ligne & { gen: string | null }, prix?: number | null): Estimation | null {
    if (!l.gen) return null;
    const en = normEn(l.energie);
    const c = this.de(l.gen, en);
    if (!c) return null;
    return estimerDans(c, this.base, l.gen, versMoteur(l), prix ?? l.prix);
  }
  points(gen: string, energie: string) {
    const c = this.de(gen, energie);
    return c ? points(c) : [];
  }
}

/** Charge un modèle du catalogue, ses annonces, leur génération et leur motorisation. */
export async function marcheModele(base: string, y0?: number | null, y1?: number | null) {
  const m = modeleDe(base);
  if (!m) return null;
  const marque = base.split(" ")[0], modele = base.split(" ").slice(1).join(" ");
  // annonce rangée dans le mauvais modèle par le vendeur (« BMW Série 1 116i » parmi les Série 3) : le titre fait foi
  const autreModele = (l: Ligne) => {
    const r = reconnaitre({ titre: l.titre });
    return !!r.modele && r.base !== m.base;
  };
  const lignes: LigneMarche[] = (await annoncesModele(m.regex, y0 ?? null, y1 ?? null)).filter((l) => !autreModele(l)).map((l) => {
    const g = generationDe(m.base, versMoteur(l));
    const tx = sansAccent(`${l.titre} ${l.version ?? ""} ${l.texte ?? ""}`);
    // puissance : Leboncoin (DIN), sinon la version Leboncoin ou le texte (« 150 ch »)
    const lue = Number(sansAccent(`${l.version ?? ""} ${l.titre} ${l.texte ?? ""}`).match(/\b(\d{2,3})\s?(?:ch|cv din|chevaux)\b/)?.[1]) || null;
    const ch = l.ch ?? lue;
    return {
      ...l, ch: ch && ch > 40 && ch < 800 ? ch : null, tx,
      gen: g?.id ?? null, genLabel: g?.id ? g.label : "", variant: g?.variant ?? null, varianteEcrite: !!g?.varianteEcrite, body: g?.body ?? null,
      cands: g?.cands ?? [], genPar: g?.id ? "texte" : null,
      moteur: motorisationDe(marque, { ...l, energie: normEn(l.energie) }, modele), moteurDeduit: null,
    };
  });
  resoudreParPuissance(lignes, m.gens);
  if (marque !== "bmw" && marque !== "mercedes") nommerMoteurs(lignes);
  deduireMoteurs(lignes);
  return { m, lignes, cotes: new Cotes(m.base, lignes) };
}

/** Années de transition (A3 2012 : 8P ou 8V) : la puissance et l'énergie départagent, d'après les annonces sûres des années voisines.
    La 8P n'a jamais eu de 2.0 TDI 150 ch, la 8V jamais de 140 ch : une A3 2012 de 150 ch est une 8V. */
function resoudreParPuissance(lignes: LigneMarche[], gens: { id: string; label: string }[]) {
  const sures = new Map<string, LigneMarche[]>();
  for (const l of lignes) {
    if (!l.gen || !l.ch || !l.annee) continue;
    const k = `${normEn(l.energie)}|${l.ch}`;
    sures.set(k, [...(sures.get(k) ?? []), l]);
  }
  for (const l of lignes) {
    if (l.gen || !l.ch || !l.annee || l.cands.length < 2) continue;
    const n = new Map<string, number>();
    for (const d of [-1, 0, 1]) for (const s of sures.get(`${normEn(l.energie)}|${l.ch + d}`) ?? []) {
      if (l.cands.includes(s.gen!) && Math.abs((s.annee ?? 0) - l.annee) <= 2) n.set(s.gen!, (n.get(s.gen!) ?? 0) + 1);
    }
    let best = "", nb = 0, tot = 0;
    n.forEach((v, g) => { tot += v; if (v > nb) { best = g; nb = v; } });
    if (tot >= 4 && nb / tot >= 0.85) {
      l.gen = best;
      l.genLabel = gens.find((g) => g.id === best)?.label ?? best;
      l.genPar = "puissance";
    }
  }
}

/** Noms du marché pour les autres marques : cylindrée + technologie + puissance (« 2.0 TDI 150 », « 1.5 dCi 90 »).
    « TDI 150 », « 35 TDI » (nouvelle appellation Audi) ou « 2.0 TDI » seul y sont rattachés grâce à la puissance Leboncoin. */
function nommerMoteurs(lignes: LigneMarche[]) {
  const CYL = /^(\d\.\d{1,2}) (\S+)$/, TECH_CH = /^(\S+) (\d{2,3})$/, AUDI = /^\d{2} (TDI|TFSI)$/;
  // cylindrée la plus courante pour une technologie et une puissance, dans ce modèle
  const cyl = new Map<string, Map<string, number>>();
  for (const l of lignes) {
    const c = l.moteur?.match(CYL);
    if (!c || !l.ch) continue;
    const k = `${c[2]}|${l.ch}`;
    const x = cyl.get(k) ?? new Map<string, number>();
    x.set(c[1], (x.get(c[1]) ?? 0) + 1);
    cyl.set(k, x);
  }
  const cylDe = (tech: string, ch: number) => {
    let best = "", nb = 0;
    for (const d of [0, -1, 1, -2, 2]) cyl.get(`${tech}|${ch + d}`)?.forEach((n, c) => { if (n > nb) { best = c; nb = n; } });
    return nb >= 2 ? best : "";
  };
  for (const l of lignes) {
    const mo = l.moteur;
    if (!mo) continue;
    const c = mo.match(CYL), t = mo.match(TECH_CH), a = mo.match(AUDI);
    if (c && l.ch) l.moteur = `${c[1]} ${c[2]} ${l.ch}`;
    else if (t) { const cy = cylDe(t[1], l.ch ?? Number(t[2])); l.moteur = `${cy ? cy + " " : ""}${t[1]} ${l.ch ?? t[2]}`; }
    else if (a && l.ch) { const cy = cylDe(a[1], l.ch); if (cy) l.moteur = `${cy} ${a[1]} ${l.ch}`; }
  }
}

/** Motorisation déduite de la puissance et de l'énergie pour les annonces qui ne l'écrivent pas (table apprise par génération). */
function deduireMoteurs(lignes: LigneMarche[]) {
  const parGen = new Map<string, LigneMarche[]>();
  for (const l of lignes) parGen.set(l.gen ?? "*", [...(parGen.get(l.gen ?? "*") ?? []), l]);
  const tout = profilMoteurs(lignes.map((l) => ({ moteur: l.moteur, ch: l.ch, energie: normEn(l.energie) })));
  const profils = new Map<string, ProfilMoteurs>();
  parGen.forEach((ls, g) => profils.set(g, profilMoteurs(ls.map((l) => ({ moteur: l.moteur, ch: l.ch, energie: normEn(l.energie) })))));
  for (const l of lignes) {
    if (l.moteur || !l.ch) continue;
    const en = normEn(l.energie);
    l.moteurDeduit = moteurDeduit(profils.get(l.gen ?? "*") ?? tout, en, l.ch) ?? (l.gen ? null : moteurDeduit(tout, en, l.ch));
  }
}

export { normEn, normBo };
