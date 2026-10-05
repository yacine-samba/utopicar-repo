import "server-only";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { coteGeneration, estimerDans, generationDe, modeleDe, normEn, normBo, points, reconnaitre, type Cote, type Estimation } from "./moteur";
import { cleMoteur, motorisationDe, moteurDeduit, profilMoteurs, type ProfilMoteurs } from "./phases";

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

// la version Leboncoin (« Série 3 Coupé 335i 306ch Luxe ») rejoint le titre : carrosserie, moteur, puissance et finition y sont lus
const versMoteur = (l: Ligne & { moteur?: string | null; moteurDeduit?: string | null; chMoteur?: number | null }) => ({
  ...l, titre: [l.titre ?? "", l.version].filter(Boolean).join(" "), texte: l.texte ?? "", mec: l.mec ?? "", carr: l.carr ?? "", etat: l.etat ?? "", energie: l.energie ?? "", boite: l.boite ?? "", pro: !!l.pro,
  moteur: l.moteur ?? l.moteurDeduit ?? "", ch: l.ch ?? l.chMoteur ?? null, portes: l.portes ?? null, finition: l.finition ?? "",
});
const sansAccent = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

type LigneCote = Ligne & { gen: string | null; genPar?: string | null; moteur?: string | null; moteurDeduit?: string | null; variant?: string | null; varianteEcrite?: boolean };
/** Ce qui est retenu pour coter une voiture : énergie, motorisation, puissance, carrosserie. */
export type Profil = { energie: string; moteur: string | null; ch: number | null; chDeduit: boolean; carrosserie: string | null };
/** Annonces du même moteur qu'il faut pour une cote à part (sinon : toute la génération, puissance en variable). */
const MIN_MEME_MOTEUR = 25;
const moDe = (l: LigneCote) => l.moteur ?? l.moteurDeduit ?? null;

/** Cotes par génération et énergie, et par motorisation quand elle a assez d'annonces : une 335i n'est pas cotée sur des 316i. */
export class Cotes {
  private cache = new Map<string, Cote | null>();
  private marque: string;
  private modele: string;
  constructor(private base: string, private lignes: LigneCote[]) {
    [this.marque, this.modele] = [base.split(" ")[0], base.split(" ").slice(1).join(" ")];
  }
  // la cote reste propre : seulement les annonces dont la génération est lue (pas celles déduites de la puissance)
  private sures(gen: string, energie: string) {
    return this.lignes.filter((l) => l.gen === gen && l.genPar !== "puissance" && (!energie || normEn(l.energie) === energie));
  }
  /** Cote de la génération (toutes carrosseries, la carrosserie est une variable), ou d'une seule motorisation. */
  de(gen: string, energie: string, moteur?: string | null) {
    const k = `${gen}|${energie}|${moteur ? cleMoteur(moteur) : ""}`;
    if (!this.cache.has(k)) {
      let ls = this.sures(gen, energie);
      if (moteur) ls = ls.filter((l) => { const mo = moDe(l); return !!mo && cleMoteur(mo) === cleMoteur(moteur); });
      const ok = ls.length >= (moteur ? MIN_MEME_MOTEUR : 20);
      this.cache.set(k, ok ? coteGeneration(this.base, gen, energie, this.avecPuissance(gen, ls).map(versMoteur), { toutesCarr: true, libelle: moteur ? `même moteur : ${moteur}` : undefined, finitions: this.finitions(gen) }) : null);
    }
    return this.cache.get(k) ?? null;
  }
  // puissance d'une annonce qui ne la donne pas : celle de sa motorisation dans la génération (335i : 306 ch)
  private avecPuissance(gen: string, ls: LigneCote[]) {
    return ls.map((l) => (l.ch ? l : { ...l, chMoteur: this.chMoteur(gen, normEn(l.energie), moDe(l)) }));
  }
  private gens = new Map<string, LigneCote[]>();
  private parGen(gen: string) {
    if (!this.gens.has(gen)) this.gens.set(gen, this.lignes.filter((x) => x.gen === gen && x.genPar !== "puissance"));
    return this.gens.get(gen)!;
  }
  /** Finitions Leboncoin de la génération (au moins 4 annonces). */
  private finitions(gen: string) {
    const n = new Map<string, number>();
    for (const l of this.parGen(gen)) if (l.finition) n.set(l.finition, (n.get(l.finition) ?? 0) + 1);
    return [...n].filter(([, v]) => v >= 4).map(([f]) => f);
  }
  private chs = new Map<string, number | null>();
  /** Puissance la plus courante d'une motorisation dans une génération (au moins 3 annonces et 60 % d'entre elles). */
  chMoteur(gen: string, energie: string, moteur: string | null): number | null {
    if (!moteur) return null;
    const k = `${gen}|${energie}|${cleMoteur(moteur)}`;
    if (!this.chs.has(k)) {
      const n = new Map<number, number>();
      let tot = 0;
      for (const l of this.lignes) {
        if (l.gen !== gen || !l.ch || (energie && normEn(l.energie) !== energie)) continue;
        const mo = moDe(l);
        if (!mo || cleMoteur(mo) !== cleMoteur(moteur)) continue;
        n.set(l.ch, (n.get(l.ch) ?? 0) + 1);
        tot++;
      }
      let best: number | null = null, nb = 0;
      // 305 et 306 ch : même moteur, comptés ensemble
      n.forEach((_, ch) => { const v = (n.get(ch - 1) ?? 0) + (n.get(ch) ?? 0) + (n.get(ch + 1) ?? 0); if (v > nb || (v === nb && best != null && ch > best)) { best = ch; nb = v; } });
      this.chs.set(k, tot >= 3 && nb / tot >= 0.6 ? best : null);
    }
    return this.chs.get(k) ?? null;
  }
  /** Énergie, motorisation, puissance et carrosserie d'une voiture, complétées par ce que disent les annonces de sa génération. */
  profil(l: LigneCote, vehicule?: { gens: { id: string; v: { id: string; body: string }[] }[] }): Profil {
    const gen = l.gen ?? "";
    let energie = normEn(l.energie);
    // puissance écrite (« 1.5 dCi 90 », « 150 ch ») quand la case puissance est vide
    const tx = sansAccent([l.version, l.titre, l.texte].filter(Boolean).join(" "));
    const lue = Number(tx.match(/\b(\d{2,3})\s?(?:ch|cv)\b/)?.[1] ?? tx.match(/\b(?:dci|tce|sce|hdi|e-?hdi|bluehdi|tdi|tsi|tfsi|puretech|vti|thp|crdi|cdti|tdci|ecoboost|multijet|jtdm?)\s?(\d{2,3})\b/)?.[1]) || null;
    const ch = l.ch ?? (lue && lue > 40 && lue < 800 ? lue : null);
    let moteur = moDe(l) ?? motorisationDe(this.marque, { titre: l.titre ?? "", texte: l.texte, version: l.version, energie }, this.modele);
    const mesLignes = this.parGen(gen);
    // « 1.5 dCi » sans puissance : le nom complet du marché (« 1.5 dCi 90 ») s'il n'y en a qu'un ou presque
    if (moteur && !mesLignes.some((x) => moDe(x) && cleMoteur(moDe(x)!) === cleMoteur(moteur!))) {
      const q = cleMoteur(moteur), n = new Map<string, number>();
      let tot = 0;
      for (const x of mesLignes) { const mo = moDe(x); if (mo && cleMoteur(mo).startsWith(q) && (!ch || x.ch === ch || mo.endsWith(` ${ch}`))) { n.set(mo, (n.get(mo) ?? 0) + 1); tot++; } }
      const [best, nb] = [...n].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
      if (tot && nb / tot >= 0.8) moteur = best;
    }
    // « 2.0 TDI » et 150 ch : le nom du marché « 2.0 TDI 150 »
    if (moteur && ch && !/\d{2,3}$/.test(moteur)) {
      const k = cleMoteur(`${moteur} ${ch}`);
      const x = mesLignes.find((y) => moDe(y) && cleMoteur(moDe(y)!) === k);
      if (x) moteur = moDe(x);
    }
    // puissance seule : la motorisation qui a cette puissance dans la génération
    // (énergie inconnue : celle des énergies où cette puissance désigne un seul moteur)
    if (!moteur && ch) {
      const pm = profilMoteurs(mesLignes.map((x) => ({ moteur: x.moteur ?? null, ch: x.ch, energie: normEn(x.energie) })));
      const t = (energie ? [energie] : ["essence", "diesel", "hybride", "electrique", "gpl"]).map((en) => [en, moteurDeduit(pm, en, ch)] as const).filter(([, mo]) => mo);
      if (t.length === 1) [energie, moteur] = [t[0][0], t[0][1]];
    }
    // énergie non indiquée : celle de la motorisation (une 335i est une essence)
    if (!energie && moteur) {
      const n = new Map<string, number>();
      let tot = 0;
      for (const x of mesLignes) { const mo = moDe(x); if (mo && cleMoteur(mo) === cleMoteur(moteur)) { const e = normEn(x.energie); if (e) { n.set(e, (n.get(e) ?? 0) + 1); tot++; } } }
      const [best, nb] = [...n].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
      if (tot >= 3 && nb / tot >= 0.8) energie = best;
    }
    const chD = ch ? null : this.chMoteur(gen, energie, moteur);
    // carrosserie : seulement une version du catalogue lue dans le texte (E92, Coupé, Touring) ; sinon celle de référence
    const g = vehicule?.gens.find((x) => x.id === gen);
    let carrosserie = l.varianteEcrite && l.variant ? g?.v.find((v) => v.id === l.variant)?.body ?? null : null;
    // sinon les portes : 3 portes, ou 5 portes quand la version par défaut est la 3 portes (A3 → Sportback)
    if (!carrosserie && l.portes && g?.v.length) {
      const b = l.portes <= 3 ? g.v.find((v) => v.body === "3p") : g.v[0].body === "3p" ? g.v.find((v) => v.body === "hayon") : null;
      carrosserie = b?.body ?? null;
    }
    return { energie, moteur, ch: ch ?? chD, chDeduit: !ch && !!chD, carrosserie };
  }
  /** Estimation d'une voiture : cote de sa motorisation quand elle a assez d'annonces, sinon de toute la génération. */
  estimer(l: LigneCote, prix?: number | null, p?: Profil): (Estimation & { profil: Profil }) | null {
    if (!l.gen) return null;
    p ??= this.profil(l, modeleDe(this.base) ?? undefined);
    const a = { ...versMoteur(l), energie: p.energie || l.energie || "", moteur: p.moteur ?? "", ch: p.ch, carrosserie: p.carrosserie };
    for (const mo of p.moteur ? [p.moteur, null] : [null]) {
      const c = this.de(l.gen, p.energie, mo);
      if (!c) continue;
      const e = estimerDans(c, this.base, l.gen, a, prix ?? l.prix);
      if (e?.P) return { ...e, profil: p };
      if (!mo) return e ? { ...e, profil: p } : null;
    }
    return null;
  }
  points(gen: string, energie: string, moteur?: string | null) {
    const c = (moteur ? this.de(gen, energie, moteur) : null) ?? this.de(gen, energie);
    if (c && !(c as { _model?: unknown })._model) estimerDans(c, this.base, gen, { annee: null, km: null }, null); // modèle calculé une fois
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
    // la version Leboncoin (« Série 1 116i 122ch ») fait foi quand le titre est illisible (« BMW E87116i »)
    const v = l.version ? reconnaitre({ titre: l.version }) : null;
    if (v?.modele) return v.base !== m.base;
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
