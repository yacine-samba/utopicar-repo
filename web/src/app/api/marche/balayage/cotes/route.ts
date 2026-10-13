import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { lienAnnonce, marcheModele, normEn } from "@/lib/vehicules/marche";

/* Cotes d'un modèle du catalogue après un relevé automatique : pour une énergie, chaque génération avec sa cote de
   référence (année et kilométrage médians de ses annonces), ses annonces en base, et les annonces du relevé
   (vues depuis son début) placées sur leur cote, les plus sous la cote d'abord. */
export const maxDuration = 60;

const Corps = z.object({
  base: z.string().min(3).max(80),
  energie: z.enum(["essence", "diesel", "hybride", "electrique"]),
  depuis: z.number().int(),
});

const TOP = 5;
const mediane = (l: number[]) => {
  if (!l.length) return null;
  const s = [...l].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

export async function POST(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous pour calculer les cotes." }, { status: 401 });
  if (!c.illimite) return Response.json({ erreur: "La cote du marché est réservée au compte illimité." }, { status: 403 });
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ erreur: "Demande invalide." }, { status: 400 });
  const { base, energie } = r.data;
  const mm = await marcheModele(base).catch(() => null);
  if (!mm) return Response.json({ erreur: "Modèle inconnu ou base indisponible." }, { status: 400 });
  // une heure de marge : l'heure de l'extension et celle de la base peuvent différer un peu
  const depuis = new Date(r.data.depuis - 3600e3).toISOString();
  const duReleve = (l: { source: string; vu_le: string | null }) => l.source === "releve" && !!l.vu_le && l.vu_le >= depuis;

  const parGen = new Map<string, typeof mm.lignes>();
  for (const l of mm.lignes) if (l.gen && normEn(l.energie) === energie) parGen.set(l.gen, [...(parGen.get(l.gen) ?? []), l]);

  const gens = mm.m.gens
    .filter((g) => parGen.has(g.id))
    .map((g) => {
      const ls = parGen.get(g.id)!;
      const cote = mm.cotes.de(g.id, energie);
      const releve = ls.filter(duReleve);
      const sures = ls.filter((l) => l.genPar !== "puissance");
      // cote de référence : la voiture médiane de la génération (année et kilométrage)
      const annee = mediane(sures.map((l) => l.annee).filter((v): v is number => v != null));
      const km = mediane(sures.map((l) => l.km).filter((v): v is number => v != null));
      const type = { ...sures[0], id: "ref", titre: `${mm.m.marque} ${mm.m.nom}`, texte: "", version: null, finition: null, moteur: null, moteurDeduit: null, ch: null, pro: false, boite: "", carr: null, portes: null, variant: null, varianteEcrite: false, annee, km, prix: 0 };
      const ref = cote && sures.length && annee != null && km != null ? mm.cotes.estimer(type, null) : null;
      const cotees = cote
        ? releve
            .map((l) => ({ l, e: mm.cotes.estimer(l) }))
            .filter((x) => x.e?.P != null && x.e.pct != null)
            .map(({ l, e }) => ({ id: l.id, titre: l.titre, prix: l.prix, annee: l.annee, km: l.km, ch: l.ch, pro: !!l.pro, lieu: l.lieu, url: lienAnnonce(l), P: e!.P!, ecart: e!.ecart, pct: e!.pct!, conf: e!.conf }))
        : [];
      const sous = cotees.filter((a) => a.pct >= 0.05).sort((a, b) => b.pct - a.pct);
      return {
        gen: g.id, label: g.label, y0: g.y0, y1: g.y1,
        nReleve: releve.length, nBase: sures.length, cote: !!cote,
        ref: ref?.P ? { annee, km, P: ref.P, lo: ref.lo, hi: ref.hi, parKm: ref.parKm } : null,
        nCotees: cotees.length, nSous: sous.length, top: sous.slice(0, TOP),
      };
    });
  return Response.json({ base: mm.m.base, nom: `${mm.m.marque} ${mm.m.nom}`, energie, gens });
}
