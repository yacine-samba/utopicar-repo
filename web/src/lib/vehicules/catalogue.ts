import "server-only";
import { CATALOGUE } from "./moteur";
import type { CatMarque } from "./types";

/** Catalogue allégé pour les listes de choix (marque → modèle → génération). */
export const catalogue = (): CatMarque[] =>
  CATALOGUE.map((b) => ({
    k: b.key, n: b.name, lbc: b.lbc,
    m: b.models.map((m) => ({ k: m.key, n: m.name, lbc: m.lbc, rx: m.regex, g: m.gens.filter(Boolean).map((g) => ({ id: g.id, l: g.label, y0: g.y0, y1: g.y1 })) })),
  }));
