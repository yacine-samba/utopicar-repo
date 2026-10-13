import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { lienAnnonce, marcheModele, normEn } from "@/lib/vehicules/marche";
import { modeleDe, parseCard, reconnaitre } from "@/lib/vehicules/moteur";

/* Relevé automatique des cotes (extension « Relever toutes les cotes ») : l'extension cherche sur Leboncoin un modèle
   dans une énergie (Audi A1 essence, puis diesel, puis hybride, puis le modèle suivant) et envoie ici chaque recherche.
   Le modèle est connu : une annonce au titre trop court (« Superbe voiture 1.4 TFSI ») est rangée sous son modèle au lieu
   d'être perdue ; une annonce dont le titre désigne un autre modèle (rangée au mauvais endroit par le vendeur) est écartée.
   Les annonces rejoignent la base du marché, puis la cote de chaque génération est recalculée dans cette énergie :
   cote de référence (année et kilométrage médians), nombre d'annonces et annonces sous la cote. */
export const maxDuration = 60;

const ENERGIES = ["essence", "diesel", "hybride"] as const;
const Corps = z.object({
  base: z.string().min(3).max(80),
  energie: z.enum(ENERGIES),
  items: z.array(z.object({ u: z.string().max(300), t: z.string().max(200).optional(), f: z.record(z.string(), z.unknown()).optional() })).max(3600),
  enregistrer: z.boolean().optional(),
});

const TOP = 5;
const mediane = (l: number[]) => {
  if (!l.length) return null;
  const s = [...l].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

export async function POST(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous sur utopicar.fr pour relever les cotes." }, { status: 401 });
  if (!c.illimite) return Response.json({ erreur: "Le relevé des cotes est réservé au compte illimité." }, { status: 403 });
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ erreur: "Demande invalide." }, { status: 400 });
  const { base, energie } = r.data;
  const m = modeleDe(base);
  if (!m) return Response.json({ erreur: "Modèle inconnu du catalogue." }, { status: 400 });
  const t0 = Date.now();

  // Annonces de la recherche : prix lu, énergie demandée, et bien ce modèle (le titre fait foi quand il en désigne un autre).
  let ecartees = 0;
  const cartes = r.data.items.map((x) => parseCard(x)).filter((it) => {
    if (!it.prix || !/^\d{6,14}$/.test(it.id)) return false;
    if (it.energie && normEn(it.energie) && normEn(it.energie) !== energie) return (ecartees++, false);
    const x = reconnaitre({ titre: it.titre, annee: it.annee, energie: it.energie });
    if (x.base && x.base !== m.base) return (ecartees++, false);
    return true;
  });
  // titre sans le modèle : le modèle y est ajouté, pour que l'annonce soit retrouvée par la cote de ce modèle
  const avecModele = (titre: string) => (reconnaitre({ titre }).base === m.base ? titre : `${m.marque} ${m.nom} ${titre}`.slice(0, 200));
  const items = cartes.map((it) => ({ ...it, titre: avecModele(it.titre), energie: it.energie || energie }));

  let enregistrees = 0;
  if (r.data.enregistrer !== false && items.length) {
    const p = items.map((it) => ({ id: it.id, titre: it.titre, prix: it.prix, annee: it.annee, km: it.km, energie: it.energie, boite: it.boite, ch: it.ch ?? null, pro: it.pro, cp: it.cp, marque: m.marque, modele: m.nom }));
    const { data, error } = await (await supabaseServeur()).rpc("releve_enregistrer", { p_items: p });
    if (error) return Response.json({ erreur: "Enregistrement impossible : " + error.message }, { status: 500 });
    enregistrees = typeof data === "number" ? data : 0;
  }

  // Cote recalculée avec la base à jour (les annonces de la recherche y sont désormais).
  const mm = await marcheModele(m.base).catch(() => null);
  if (!mm) return Response.json({ erreur: "Base du marché indisponible." }, { status: 503 });
  const ids = new Set(items.map((it) => it.id));
  const parGen = new Map<string, typeof mm.lignes>();
  let incertaines = 0;
  for (const l of mm.lignes) {
    if (normEn(l.energie) !== energie) continue;
    if (!l.gen) {
      if (ids.has(l.id)) incertaines++;
      continue;
    }
    parGen.set(l.gen, [...(parGen.get(l.gen) ?? []), l]);
  }

  const gens = m.gens
    .filter((g) => parGen.has(g.id))
    .map((g) => {
      const ls = parGen.get(g.id)!;
      const cote = mm.cotes.de(g.id, energie);
      const releve = ls.filter((l) => ids.has(l.id));
      const sures = ls.filter((l) => l.genPar !== "puissance");
      // cote de référence : la voiture médiane de la génération (année et kilométrage)
      const annee = mediane(sures.map((l) => l.annee).filter((v): v is number => v != null));
      const km = mediane(sures.map((l) => l.km).filter((v): v is number => v != null));
      const type = { ...sures[0], id: "ref", titre: `${m.marque} ${m.nom}`, texte: "", version: null, finition: null, moteur: null, moteurDeduit: null, ch: null, pro: false, boite: "", carr: null, portes: null, variant: null, varianteEcrite: false, annee, km, prix: 0 };
      const ref = cote && annee != null && km != null ? mm.cotes.estimer(type, null) : null;
      // les annonces de cette recherche, chacune sur sa cote
      const cotees = cote
        ? releve
            .map((l) => ({ l, e: mm.cotes.estimer(l) }))
            .filter((x) => x.e?.P != null && x.e.pct != null)
            .map(({ l, e }) => ({ id: l.id, titre: l.titre, prix: l.prix, annee: l.annee, km: l.km, ch: l.ch, pro: !!l.pro, lieu: l.lieu, url: lienAnnonce(l), P: e!.P!, lo: e!.lo, hi: e!.hi, ecart: e!.ecart, pct: e!.pct!, conf: e!.conf }))
        : [];
      const sous = cotees.filter((a) => a.pct >= 0.05).sort((a, b) => b.pct - a.pct);
      return {
        gen: g.id, label: g.label, y0: g.y0, y1: g.y1,
        nReleve: releve.length, nBase: sures.length, nCote: cote?.n ?? 0, cote: !!cote,
        ref: ref?.P ? { annee, km, P: ref.P, lo: ref.lo, hi: ref.hi, parKm: ref.parKm, parAn: ref.parAn } : null,
        nCotees: cotees.length, nSous: sous.length, top: sous.slice(0, TOP),
      };
    });

  return Response.json({
    base: m.base, nom: `${m.marque} ${m.nom}`, energie,
    recues: r.data.items.length, gardees: items.length, ecartees, incertaines, enregistrees,
    gens, ms: Date.now() - t0,
  });
}
