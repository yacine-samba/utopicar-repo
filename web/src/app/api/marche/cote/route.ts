import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { lienAnnonce, marcheModele, normEn, type Ligne } from "@/lib/vehicules/marche";
import { generationDe, parseCard, reconnaitre, type Carte, type Estimation } from "@/lib/vehicules/moteur";

/* Cote (mode de l'outil Garage) :
   - relevé collé (extension « Relever la page », Ctrl+V) : chaque annonce reconnue (marque, modèle, génération)
     puis cotée avec les annonces comparables de la base et du relevé, enregistrées pour la suite ;
   - « placer une voiture » : estimation d'une voiture précise, nuage des annonces de sa génération et courbe de cote. */
export const maxDuration = 60;

const Voiture = z.object({
  base: z.string().min(3).max(80),
  gen: z.string().max(20).optional(),
  energie: z.string().max(20).optional(),
  annee: z.number().int().min(1980).max(2035),
  km: z.number().int().min(0).max(900000),
  prix: z.number().int().min(0).max(500000).nullish(),
  boite: z.string().max(20).optional(),
  version: z.string().max(200).optional(),
  ch: z.number().int().min(30).max(800).nullish(),
  portes: z.number().int().min(2).max(5).nullish(),
  /** version du catalogue choisie (« e92 » : coupé) ; sinon lue dans la version */
  carrosserie: z.string().regex(/^[a-z0-9]{1,12}$/).optional(),
});
const Corps = z.object({ releve: z.string().min(10).max(6_000_000).optional(), enregistrer: z.boolean().optional(), voiture: Voiture.optional(), estimation: z.boolean().optional() });

const MAX_POINTS = 900;
const echantillon = <T,>(l: T[], n: number) => (l.length <= n ? l : l.filter((_, i) => i % Math.ceil(l.length / n) === 0));

function lireReleve(txt: string): { items: Carte[]; src: string } | null {
  let o: unknown;
  const t = txt.trim();
  try {
    o = JSON.parse(t.startsWith("UTPRELEVE") ? t.slice(9) : t);
  } catch {
    return null;
  }
  const brut = Array.isArray(o) ? o : (o as { items?: unknown[] })?.items;
  if (!Array.isArray(brut)) return null;
  const items = brut
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    .map((x) => parseCard(x as Parameters<typeof parseCard>[0]))
    .filter((it) => it.prix);
  return { items, src: String((o as { src?: string })?.src ?? "").replace(/^www\./, "") };
}

const resume = (e: Estimation | null) =>
  e && e.P ? { P: e.P, lo: e.lo, hi: e.hi, ecart: e.ecart, pct: e.pct, conf: e.conf, why: e.why, moinsCherQue: e.moinsCherQue, dans1an: e.dans1an, parKm: e.parKm, parAn: e.parAn, ajust: e.ajust, segments: e.segments, n: e.nClean, comps: e.comps, base: e.base, carrosserie: e.carrosserie, finition: e.finition, ch: e.ch } : null;

export async function POST(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous pour calculer une cote." }, { status: 401 });
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ erreur: "Demande invalide." }, { status: 400 });
  // Estimation (toutes les formules Benef) : la cote d'une voiture d'après ses critères, sans les annonces ni le nuage.
  // La cote globale (graphique, comparables, relevés) est réservée au compte illimité.
  const estimation = r.data.estimation === true;
  if (estimation ? !(c.illimite || c.offre.famille === "benef") : !c.illimite)
    return Response.json({ erreur: estimation ? "L'estimation de cote est incluse dans les formules Benef." : "La cote du marché est réservée au compte illimité." }, { status: 403 });

  // ---- Placer une voiture
  if (r.data.voiture) {
    const v = r.data.voiture;
    const mm = await marcheModele(v.base, null, null, estimation && !c.offre.recherche).catch(() => null);
    if (!mm) return Response.json({ erreur: "Modèle inconnu ou base indisponible." }, { status: 400 });
    const a = { titre: `${mm.m.marque} ${mm.m.nom} ${v.version ?? ""}`.trim(), texte: v.version ?? "", annee: v.annee, km: v.km, energie: v.energie ?? "", boite: v.boite ?? "", ch: v.ch ?? null, portes: v.portes ?? null };
    const g = generationDe(mm.m.base, a);
    const gen = v.gen || g?.id;
    if (!gen) return Response.json({ erreur: "Génération incertaine pour cette année : choisissez-la." }, { status: 400 });
    // carrosserie : choisie dans la liste, sinon lue dans la version (« E92 », « coupé », « Touring »)
    const versions = mm.m.gens.find((x) => x.id === gen)?.v ?? [];
    const choisie = v.carrosserie ? versions.find((x) => x.id === v.carrosserie) : undefined;
    const variant = choisie?.id ?? (g?.id === gen ? g.variant : null);
    const ligne = { ...a, id: "voiture", source: "", prix: v.prix ?? 0, gen, genLabel: "", variant, varianteEcrite: !!choisie || (g?.id === gen && !!g?.varianteEcrite) } as unknown as Ligne & { gen: string; variant: string | null; varianteEcrite: boolean };
    const p = mm.cotes.profil(ligne, mm.m);
    const e = mm.cotes.estimer(ligne, v.prix ?? null, p);
    if (!e) return Response.json({ erreur: "Pas assez d'annonces de cette génération (il en faut 20) pour une cote fiable." }, { status: 404 });
    const courbe = [0, 25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 250000]
      .map((km) => ({ km, P: mm.cotes.estimer({ ...ligne, km }, null, p)?.P ?? null }))
      .filter((x) => x.P);
    if (estimation) return Response.json({ nom: e.nom, gen, profil: p, estimation: { ...resume(e), comps: undefined }, points: [], courbe });
    const pts = mm.cotes.points(gen, p.energie, e.base ? p.moteur : null);
    return Response.json({ nom: e.nom, gen, profil: p, estimation: resume(e), points: echantillon(pts, MAX_POINTS), courbe });
  }

  // ---- Relevé collé
  if (!r.data.releve) return Response.json({ erreur: "Collez un relevé." }, { status: 400 });
  if (!c.illimite) return Response.json({ erreur: "Le relevé Leboncoin n'est pas inclus dans votre formule." }, { status: 403 });
  const rel = lireReleve(r.data.releve);
  if (!rel) return Response.json({ erreur: "Relevé illisible : relancez « Relever la page » sur la page de résultats Leboncoin, puis Ctrl+V ici." }, { status: 400 });
  if (!rel.items.length) return Response.json({ erreur: "Aucune annonce avec un prix dans ce relevé." }, { status: 400 });
  const t0 = Date.now();

  const items = rel.items.map((it) => {
    const x = reconnaitre({ titre: it.titre, annee: it.annee, energie: it.energie });
    return { it, base: x.base, marque: x.marque, modele: x.modele };
  });

  // Enregistrement dans la base du marché (les prochaines cotes en profitent).
  let enregistrees = 0;
  if (r.data.enregistrer !== false) {
    const p = items
      .filter(({ it }) => /^\d{6,14}$/.test(it.id))
      .map(({ it, marque, modele }) => ({ id: it.id, titre: it.titre, prix: it.prix, annee: it.annee, km: it.km, energie: it.energie, boite: it.boite, ch: it.ch ?? null, pro: it.pro, cp: it.cp, marque, modele }));
    const { data } = await (await supabaseServeur()).rpc("releve_enregistrer", { p_items: p });
    enregistrees = typeof data === "number" ? data : 0;
  }

  // Un passage par modèle (les plus présents d'abord, 12 au plus) : base + relevé, génération par génération.
  const parModele = new Map<string, typeof items>();
  items.forEach((x) => x.base && parModele.set(x.base, [...(parModele.get(x.base) ?? []), x]));
  const modeles = [...parModele.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 12);
  const groupes: unknown[] = [];
  const cotees = new Map<string, unknown>();

  for (const [base, liste] of modeles) {
    const mm = await marcheModele(base).catch(() => null);
    if (!mm) continue;
    const vus = new Set(mm.lignes.map((l) => l.id));
    const collees = liste.map(({ it }) => {
      const l = { id: it.id, source: "releve", titre: it.titre, texte: null, prix: it.prix!, annee: it.annee, km: it.km, energie: it.energie, boite: it.boite, pro: it.pro, ch: it.ch ?? null, places: null, carr: null, etat: null, lieu: [it.ville, it.cp].filter(Boolean).join(" "), url: it.url || null, vu_le: null };
      const g = generationDe(base, { ...l, texte: "", carr: "", etat: "", energie: l.energie, boite: l.boite });
      return { ...l, gen: g?.id ?? null, genLabel: g?.label ?? "", variant: g?.variant ?? null, varianteEcrite: !!g?.varianteEcrite, body: g?.body ?? null, cands: g?.cands ?? [], genPar: g?.id ? ("texte" as const) : null, moteur: null, moteurDeduit: null, tx: "", badge: it.badge };
    });
    collees.forEach((l) => !vus.has(l.id) && mm.lignes.push(l));
    const parGroupe = new Map<string, typeof collees>();
    collees.forEach((l) => {
      const k = `${l.gen ?? "?"}|${normEn(l.energie)}`;
      parGroupe.set(k, [...(parGroupe.get(k) ?? []), l]);
    });
    for (const [k, ls] of parGroupe) {
      const [gen, en] = k.split("|");
      const cote = gen !== "?" ? mm.cotes.de(gen, en) : null;
      const annonces = ls.map((l) => {
        const e = gen !== "?" ? resume(mm.cotes.estimer(l)) : null;
        const out = { id: l.id, titre: l.titre, prix: l.prix, annee: l.annee, km: l.km, energie: l.energie, boite: l.boite, ch: l.ch, pro: l.pro, lieu: l.lieu, url: lienAnnonce(l), badge: l.badge, cote: e ? { ...e, comps: undefined } : null };
        cotees.set(l.id, out);
        return out;
      });
      groupes.push({
        cle: `${base}|${k}`, base, nom: cote?.nom ?? `${mm.m.marque} ${mm.m.nom}${gen === "?" ? " (génération incertaine)" : ""}${en ? " " + en : ""}`,
        gen: gen === "?" ? null : gen, genLabel: ls[0]?.genLabel ?? "", energie: en, nCote: cote ? (mm.cotes.estimer(ls[0])?.nClean ?? 0) : 0,
        annonces, points: cote ? echantillon(mm.cotes.points(gen, en), MAX_POINTS) : [],
      });
    }
  }
  const inconnues = items.filter((x) => !x.base || !cotees.has(x.it.id)).map(({ it }) => ({ id: it.id, titre: it.titre, prix: it.prix, annee: it.annee, km: it.km, url: it.url }));
  groupes.sort((a, b) => (b as { annonces: unknown[] }).annonces.length - (a as { annonces: unknown[] }).annonces.length);
  return Response.json({ src: rel.src, total: rel.items.length, enregistrees, groupes, inconnues: inconnues.slice(0, 200), nInconnues: inconnues.length, ms: Date.now() - t0 });
}
