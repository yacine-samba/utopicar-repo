import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { lienAnnonce, marcheModele, normBo, normEn, type LigneMarche } from "@/lib/vehicules/marche";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { cleFavori } from "@/lib/favoris";
import { cleRecherche, COLONNES_RECHERCHE, MAX_ONGLETS, type Meilleure } from "@/lib/recherches";
import { dansPhase, memeMoteur } from "@/lib/vehicules/phases";
import { demanderCollecte, SEUIL_COLLECTE, type EtatCollecte } from "@/lib/vehicules/collecte";

/* Recherche dans la base du marché, au niveau de l'outil Garage : marque, modèle, génération,
   chaque annonce placée sur la cote de sa génération (régression sur les annonces comparables). Benef Pro et illimité. */
const Corps = z.object({
  marque: z.string().min(1).max(40),
  modele: z.string().min(1).max(60),
  gen: z.string().max(20).optional(),
  // version (code châssis, carrosserie : E91 Touring), phase (restylage), carrosserie quand la génération n'a pas de versions
  version: z.string().max(20).optional(),
  phase: z.string().max(4).optional(),
  carrosserie: z.enum(["", "berline", "break", "coupe", "cabriolet", "3p", "monospace"]).optional(),
  moteur: z.string().max(40).optional(),
  chMin: z.number().int().min(0).max(1500).nullish(),
  chMax: z.number().int().min(0).max(1500).nullish(),
  energie: z.enum(["", "essence", "diesel", "hybride", "electrique", "gpl"]).optional(),
  boite: z.enum(["", "manuelle", "auto"]).optional(),
  anneeMin: z.number().int().min(1980).max(2035).nullish(),
  anneeMax: z.number().int().min(1980).max(2035).nullish(),
  prixMin: z.number().int().min(0).max(500000).nullish(),
  prixMax: z.number().int().min(0).max(500000).nullish(),
  kmMax: z.number().int().min(0).max(900000).nullish(),
  vendeur: z.enum(["", "particulier", "pro"]).optional(),
  mots: z.string().max(120).optional(),
  exclure: z.string().max(120).optional(),
  sousCote: z.number().min(0).max(60).optional(),
  fiables: z.boolean().optional(),
  tri: z.enum(["ecart", "prix", "km", "annee", "recent"]).optional(),
  // filtres tels que saisis (texte des champs), gardés avec la recherche enregistrée pour la rouvrir à l'identique
  saisie: z.record(z.string(), z.union([z.string().max(120), z.boolean()])).optional(),
});

const sansAccent = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const PIEGES = /\b(pour pieces|moteur hs|boite hs|joint de culasse|non roulant|epave|accidente|sans ct|export|marchand|vendu en l.etat)\b/;

export async function POST(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous pour lancer une recherche." }, { status: 401 });
  if (!c.offre.recherche) return Response.json({ erreur: "La recherche dans le marché est incluse dans Benef Pro." }, { status: 403 });
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ erreur: "Choisissez au moins une marque et un modèle." }, { status: 400 });
  const f = r.data;

  const t0 = Date.now();
  let mm;
  try {
    mm = await marcheModele(`${f.marque} ${f.modele}`, f.anneeMin ? f.anneeMin - 1 : null, f.anneeMax ? f.anneeMax + 1 : null);
  } catch (e) {
    return Response.json({ erreur: "Base du marché indisponible : " + (e as Error).message }, { status: 502 });
  }
  if (!mm) return Response.json({ erreur: "Modèle inconnu du catalogue." }, { status: 400 });
  const { m, lignes, cotes } = mm;

  const mots = sansAccent(f.mots ?? "").split(/[\s,]+/).filter((x) => x.length >= 2);
  const exclus = sansAccent(f.exclure ?? "").split(/[\s,]+/).filter((x) => x.length >= 2);
  const parGen = new Map<string, number>();
  lignes.forEach((l) => parGen.set(l.gen ?? "?", (parGen.get(l.gen ?? "?") ?? 0) + 1));

  const genC = f.gen || (m.gens.length === 1 ? m.gens[0].id : "");
  const genObj = genC ? m.gens.find((g) => g.id === genC) : null;
  const versions = genObj?.v && genObj.v.length > 1 ? genObj.v : [];
  const version = f.version && versions.some((v) => v.id === f.version) ? f.version : "";
  const vObj = version ? versions.find((v) => v.id === version) ?? null : null;
  // Leboncoin ne connaît pas les générations : une génération, ce sont ses dates (celles de la version choisie s'il y en a une).
  // Une annonce y entre si sa génération est lue (texte, 1re mise en circulation, puissance) ou, à défaut, si son année y tombe,
  // sauf si elle écrit une autre génération.
  const [gy0, gy1] = genObj ? [vObj?.y0 ?? genObj.y0, vObj?.y1 ?? genObj.y1] : [0, 9999];
  const parAnnee = (l: LigneMarche) => !l.gen && l.annee != null && l.annee >= gy0 && l.annee <= gy1 && (!l.cands.length || l.cands.includes(genC));
  const dansGen = (l: LigneMarche) => !genC || l.gen === genC || parAnnee(l);
  const moteurDe = (l: LigneMarche) => l.moteur ?? l.moteurDeduit;
  // base de la génération (et de sa version, de son énergie) : sert aux facettes et à décider d'une collecte Leboncoin
  const deLaGen = lignes.filter((l) => dansGen(l) && (!f.energie || normEn(l.energie) === f.energie));
  const parVersion = new Map<string, number>();
  deLaGen.forEach((l) => l.variant && parVersion.set(l.variant, (parVersion.get(l.variant) ?? 0) + 1));
  // version : lue dans l'annonce ; sans génération lue, d'après la carrosserie (break, coupé…) ou la version par défaut
  const okVersion = (l: LigneMarche) => !vObj || l.variant === version || (!l.variant && (l.body ? l.body === vObj.body : vObj === versions[0]));
  // motorisations : écrites ou déduites de la puissance, avec leur puissance la plus courante
  const moteurs = new Map<string, { n: number; deduits: number; ch: Map<number, number> }>();
  deLaGen.filter(okVersion).forEach((l) => {
    const mo = moteurDe(l);
    if (!mo) return;
    const x = moteurs.get(mo) ?? { n: 0, deduits: 0, ch: new Map<number, number>() };
    x.n++;
    if (!l.moteur) x.deduits++;
    if (l.ch) x.ch.set(l.ch, (x.ch.get(l.ch) ?? 0) + 1);
    moteurs.set(mo, x);
  });
  const okCarr = (l: LigneMarche) =>
    !f.carrosserie || (f.carrosserie === "berline" ? !l.body || l.body === "hayon" || l.body === "berline" : l.body === f.carrosserie);

  const gardees = lignes.filter((l) => {
    if (f.gen && !dansGen(l)) return false;
    if (!okVersion(l) || !okCarr(l)) return false;
    if (f.phase && genC && !dansPhase(m.base, genC, f.phase, l)) return false;
    if (f.moteur && !memeMoteur(f.moteur, moteurDe(l))) return false;
    // puissance demandée : les annonces sans puissance connue sont écartées (on ne devine pas)
    if (f.chMin && (l.ch == null || l.ch < f.chMin)) return false;
    if (f.chMax && (l.ch == null || l.ch > f.chMax)) return false;
    if (f.energie && normEn(l.energie) !== f.energie) return false;
    if (f.boite && normBo(l.boite) !== (f.boite === "auto" ? "auto" : "manuelle")) return false;
    if (f.anneeMin && (l.annee ?? 0) < f.anneeMin) return false;
    if (f.anneeMax && (l.annee ?? 9999) > f.anneeMax) return false;
    if (f.prixMin && l.prix < f.prixMin) return false;
    if (f.prixMax && l.prix > f.prixMax) return false;
    if (f.kmMax && (l.km ?? 0) > f.kmMax) return false;
    if (f.vendeur === "pro" && !l.pro) return false;
    if (f.vendeur === "particulier" && l.pro) return false;
    const tx = l.tx;
    if (mots.some((w) => !tx.includes(w))) return false;
    if (exclus.some((w) => tx.includes(w))) return false;
    if (f.fiables && PIEGES.test(tx)) return false;
    return true;
  });

  const annonces = gardees.map((l) => {
    // génération d'après l'année seulement : placée sur la cote de la génération choisie, avec un doute affiché
    const doute = !!f.gen && !l.gen;
    const e = cotes.estimer(doute ? { ...l, gen: genC } : l);
    const tx = l.tx;
    // plus de 45 % sous la cote : presque toujours pièces, location, acompte ou prix d'appel
    const suspect = !!(e?.pct != null && e.pct > 0.45);
    return {
      id: l.id, titre: l.titre, prix: l.prix, annee: l.annee, km: l.km, energie: l.energie, boite: l.boite, pro: !!l.pro, lieu: l.lieu, source: l.source,
      ch: l.ch, moteur: moteurDe(l), moteurDeduit: !l.moteur && !!l.moteurDeduit, version: l.varianteEcrite ? versions.find((v) => v.id === l.variant)?.label ?? null : null,
      lbcVersion: l.version ?? null, mec: l.mec ?? null, lbc: l.lbc_min && l.lbc_max ? { min: l.lbc_min, max: l.lbc_max, pos: l.lbc_pos ?? null } : null,
      vu: l.vu_le, url: lienAnnonce(l), gen: l.gen ?? (doute ? genC : null), genLabel: l.genLabel || (doute ? genObj?.label ?? "" : ""),
      genPar: doute ? ("annee" as const) : l.genPar, doute, piege: PIEGES.test(tx) || suspect, suspect,
      cote: e && e.P ? { P: e.P, lo: e.lo, hi: e.hi, ecart: e.ecart, pct: e.pct, conf: doute ? ("faible" as const) : e.conf, moinsCherQue: e.moinsCherQue, n: e.nClean, why: e.why, segments: e.segments } : null,
    };
  });
  const filtrees = annonces.filter((a) => (!f.fiables || !a.suspect) && (!f.sousCote || (a.cote?.pct != null && a.cote.pct * 100 >= f.sousCote)));
  const tri = f.tri ?? "ecart";
  filtrees.sort((a, b) =>
    tri === "prix" ? a.prix - b.prix
    : tri === "km" ? (a.km ?? 1e9) - (b.km ?? 1e9)
    : tri === "annee" ? (b.annee ?? 0) - (a.annee ?? 0)
    : tri === "recent" ? String(b.vu ?? "").localeCompare(String(a.vu ?? ""))
    : (b.cote?.pct ?? -9) - (a.cote?.pct ?? -9),
  );

  const avecCote = annonces.filter((a) => a.cote);
  // les annonces dont la génération n'est qu'une supposition (année de transition) ne comptent pas comme bonnes affaires
  const sousLaCote = avecCote.filter((a) => !a.suspect && !a.doute && (a.cote!.pct ?? 0) >= 0.05).length;
  // résultats gardés avec la recherche : la rouvrir les affiche sans refaire de requête
  const resultat = {
    modele: { nom: `${m.marque} ${m.nom}`, gens: m.gens.map(({ id, label, y0, y1 }) => ({ id, label, y0, y1, n: parGen.get(id) ?? 0 })), incertaines: parGen.get("?") ?? 0 },
    versions: versions.map((v) => ({ id: v.id, label: v.label, n: parVersion.get(v.id) ?? 0 })),
    moteurs: [...moteurs].sort((a, b) => b[1].n - a[1].n).slice(0, 40).map(([l, x]) => ({ l, n: x.n, deduits: x.deduits, ch: [...x.ch].sort((p, q) => q[1] - p[1])[0]?.[0] ?? null })),
    incertaines: deLaGen.filter((l) => !!f.gen && !l.gen).length,
    base: deLaGen.length,
    total: lignes.length,
    trouvees: filtrees.length,
    sousLaCote,
    annonces: filtrees.slice(0, 300),
  };
  const sauve = await enregistrer(f, m, filtrees, sousLaCote, resultat).catch((e) => {
    console.error("recherche enregistrée", (e as Error).message);
    return null;
  });

  // trop peu d'annonces de cette génération en base : collecte Leboncoin (comme l'outil Garage), suivie par la page
  let collecte: EtatCollecte | null = null;
  if (genC && deLaGen.filter(okVersion).length < SEUIL_COLLECTE) {
    collecte = await demanderCollecte(c.id, m.base, genC, version || null, f.energie ?? "").catch((e) => {
      console.error("collecte", (e as Error).message);
      return null;
    });
  }
  return Response.json({ ...resultat, recherche: sauve?.recherche ?? null, journal: sauve?.journal ?? null, collecte, ms: Date.now() - t0 });
}

/** Résultats gardés d'une recherche : un lancement du journal (?j=) ou le dernier lancement d'une recherche (?r=). Aucune requête sur le marché. */
export async function GET(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous." }, { status: 401 });
  if (!c.offre.recherche) return Response.json({ erreur: "La recherche dans le marché est incluse dans Benef Pro." }, { status: 403 });
  const u = new URL(req.url);
  const j = u.searchParams.get("j"), r = u.searchParams.get("r");
  const uuid = /^[0-9a-f-]{36}$/;
  if (!(j && uuid.test(j)) && !(r && uuid.test(r))) return Response.json({ erreur: "Recherche inconnue." }, { status: 400 });
  const sb = await supabaseServeur();
  let q = sb.from("recherches_journal").select("id, recherche_id, criteres, resultat, maj").not("resultat", "is", null);
  q = j ? q.eq("id", j) : q.eq("recherche_id", r!).order("maj", { ascending: false }).limit(1);
  const { data: l } = await q.maybeSingle();
  if (!l) return Response.json({ erreur: "Pas de résultats gardés pour cette recherche." }, { status: 404 });
  const { data: recherche } = l.recherche_id ? await sb.from("recherches").select(COLONNES_RECHERCHE).eq("id", l.recherche_id).maybeSingle() : { data: null };
  return Response.json({ ...(l.resultat as object), recherche, criteres: l.criteres, journal: { id: l.id, le: l.maj }, collecte: null, ms: 0 });
}

/** JSON sans dépendre de l'ordre des clés (jsonb les réordonne). */
const stable = (v: unknown): string =>
  v && typeof v === "object" && !Array.isArray(v)
    ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`).join(",")}}`
    : JSON.stringify(v ?? null);

type Trouvee = {
  id: string; titre: string; prix: number; annee: number | null; km: number | null; ch: number | null; energie: string | null; boite: string | null; moteur: string | null; version: string | null;
  lieu: string | null; url: string | null; pro: boolean; gen: string | null; genLabel: string; piege: boolean; doute: boolean; cote: { P: number; ecart: number | null; pct: number | null } | null;
};

/** Garde la recherche (une par véhicule), son lancement avec ses résultats (journal) et les annonces trouvées. */
async function enregistrer(f: z.infer<typeof Corps>, m: { marque: string; nom: string; gens: { id: string; label: string; v: { id: string; label: string }[] }[] }, trouvees: Trouvee[], sousLaCote: number, resultat: object) {
  const sb = await supabaseServeur();
  const choix = { marque: f.marque, modele: f.modele, gen: f.gen ?? "" };
  const criteres = { choix, f: f.saisie ?? {} };
  const g = f.gen ? m.gens.find((x) => x.id === f.gen) : null;
  const v = f.version && g ? g.v.find((x) => x.id === f.version) : null;
  const nom = `${m.marque} ${g?.label ?? m.nom}${v ? ` ${v.label.replace(/^[A-Z]\d{2,3}\s/, "")}` : ""}`.slice(0, 160);
  const maintenant = new Date().toISOString();
  // meilleure affaire crédible : ni piège, ni prix trop beau pour être vrai (plus de 40 % sous la cote)
  const top = trouvees.filter((a) => !a.piege && !a.doute && a.cote?.pct != null && a.cote.pct <= 0.4 && a.cote.ecart != null).sort((a, b) => b.cote!.pct! - a.cote!.pct!)[0];
  const meilleure: Meilleure | null = top ? { titre: top.titre.slice(0, 140), prix: top.prix, ecart: Math.round(top.cote!.ecart!), pct: Math.round(top.cote!.pct! * 100), url: top.url } : null;
  const { data, error } = await sb
    .from("recherches")
    .upsert({ cle: cleRecherche(choix), nom, criteres, active: true, trouvees: trouvees.length, sous_cote: sousLaCote, meilleure, derniere_le: maintenant }, { onConflict: "user_id,cle" })
    .select(COLONNES_RECHERCHE)
    .single();
  if (error) throw error;

  // journal : chaque lancement avec ses filtres exacts et ses résultats ; les mêmes filtres relancés dans l'heure mettent à jour la même ligne
  const { data: dernier } = await sb.from("recherches_journal").select("id, criteres, created_at").eq("recherche_id", data.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const meme = dernier && stable(dernier.criteres) === stable(criteres) && Date.now() - Date.parse(dernier.created_at) < 3600e3;
  const ligne = { nom, trouvees: trouvees.length, sous_cote: sousLaCote, resultat, maj: maintenant };
  const { data: j, error: ej } = meme
    ? await sb.from("recherches_journal").update(ligne).eq("id", dernier.id).select("id, maj").single()
    : await sb.from("recherches_journal").insert({ ...ligne, recherche_id: data.id, marque: f.marque, modele: f.modele, gen: f.gen || null, criteres }).select("id, maj").single();
  if (ej) console.error("journal des recherches", ej.message);

  // annonces trouvées : gardées pour toujours, même si la recherche est supprimée
  const vues = new Set<string>();
  const lignes = trouvees.slice(0, 300).map((a) => ({
    cle: cleFavori(a.url, `marche:${a.id}`).slice(0, 200), titre: (a.titre || "Annonce").slice(0, 300), prix: a.prix, annee: a.annee, km: a.km, ch: a.ch, energie: a.energie, boite: a.boite,
    moteur: a.moteur, version: a.version, lieu: a.lieu?.slice(0, 120) ?? null, url: a.url?.slice(0, 500) ?? null, marque: f.marque, modele: f.modele, gen: a.gen, gen_label: a.genLabel || null, pro: a.pro,
    cote: a.cote ? { P: a.cote.P, ecart: a.cote.ecart, pct: a.cote.pct } : null, recherche: nom, derniere_le: maintenant,
  })).filter((x) => !vues.has(x.cle) && !!vues.add(x.cle));
  if (lignes.length) {
    const { error: et } = await sb.from("annonces_trouvees").upsert(lignes, { onConflict: "user_id,cle" });
    if (et) console.error("annonces trouvées", et.message);
  }

  // les onglets les plus anciens se ferment ; les recherches restent toutes dans l'historique
  const { data: ouverts0 } = await sb.from("recherches").select("id").eq("active", true).order("derniere_le", { ascending: false });
  const ouverts = ouverts0 ?? [];
  if (ouverts.length > MAX_ONGLETS) await sb.from("recherches").update({ active: false }).in("id", ouverts.slice(MAX_ONGLETS).map((x) => x.id));
  return { recherche: data, journal: j ? { id: j.id as string, le: j.maj as string } : null };
}
