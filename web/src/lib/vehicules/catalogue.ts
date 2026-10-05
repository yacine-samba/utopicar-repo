import "server-only";
import { CATALOGUE } from "./moteur";
import { phasesDe } from "./phases";
import type { CatMarque } from "./types";

/** Catalogue allégé pour les listes de choix (marque → modèle → génération → version et phase). */
export const catalogue = (): CatMarque[] =>
  CATALOGUE.map((b) => ({
    k: b.key, n: b.name, lbc: b.lbc,
    m: b.models.map((m) => ({
      k: m.key, n: m.name, lbc: m.lbc, rx: m.regex,
      g: m.gens.filter(Boolean).map((g) => {
        const ph = phasesDe(`${b.key} ${m.key}`, g.id);
        return {
          id: g.id, l: g.label, y0: g.y0, y1: g.y1,
          ...(g.v.length > 1 ? { v: g.v.map((v) => ({ id: v.id, l: v.label, y0: v.y0, y1: v.y1, b: v.body })) } : {}),
          ...(ph.length ? { ph } : {}),
        };
      }),
    })),
  }));
