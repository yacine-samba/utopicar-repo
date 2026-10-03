import "server-only";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { coteGeneration, estimerDans, generationDe, modeleDe, normEn, normBo, points, type Cote, type Estimation } from "./moteur";

/* Base du marché (annonces relevées, cotes Garage, recherches suivies) et moteur de cote de l'outil Garage, côté serveur. */

export type Ligne = {
  id: string; source: string; titre: string; texte: string | null; prix: number; annee: number | null; km: number | null;
  energie: string | null; boite: string | null; pro: boolean | null; ch: number | null; places: number | null; carr: string | null; etat: string | null;
  lieu: string | null; url: string | null; vu_le: string | null;
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

const versMoteur = (l: Ligne) => ({ ...l, titre: l.titre ?? "", texte: l.texte ?? "", carr: l.carr ?? "", etat: l.etat ?? "", energie: l.energie ?? "", boite: l.boite ?? "", pro: !!l.pro });

/** Cotes par génération et énergie, calculées une fois pour toutes les annonces d'un modèle. */
export class Cotes {
  private cache = new Map<string, Cote | null>();
  constructor(private base: string, private lignes: (Ligne & { gen: string | null })[]) {}
  de(gen: string, energie: string) {
    const k = gen + "|" + energie;
    if (!this.cache.has(k)) {
      const rows = this.lignes.filter((l) => l.gen === gen && (!energie || normEn(l.energie) === energie)).map(versMoteur);
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

/** Charge un modèle du catalogue, ses annonces et leur génération. */
export async function marcheModele(base: string, y0?: number | null, y1?: number | null) {
  const m = modeleDe(base);
  if (!m) return null;
  const lignes = (await annoncesModele(m.regex, y0 ?? null, y1 ?? null)).map((l) => {
    const g = generationDe(m.base, versMoteur(l));
    return { ...l, gen: g?.id ?? null, genLabel: g?.label ?? "" };
  });
  return { m, lignes, cotes: new Cotes(m.base, lignes) };
}

export { normEn, normBo };
