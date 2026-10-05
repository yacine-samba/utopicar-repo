import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { lienAnnonce, marcheModele, normBo, normEn } from "@/lib/vehicules/marche";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { cleRecherche, COLONNES_RECHERCHE, MAX_ONGLETS, type Meilleure } from "@/lib/recherches";
import { dansPhase, motorisationDe } from "@/lib/vehicules/phases";
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
  const marqueCle = m.base.split(" ")[0];
  // motorisation et puissance de chaque annonce (relevées par Leboncoin, sinon lues dans le titre et le texte)
  const enrichies = lignes.map((l) => {
    const tx = sansAccent(`${l.titre} ${l.texte ?? ""}`);
    const ch = l.ch ?? (Number(tx.match(/\b(\d{2,3})\s?(?:ch|cv din|chevaux)\b/)?.[1]) || null);
    return { ...l, tx, ch: ch && ch > 40 && ch < 800 ? ch : null, moteur: motorisationDe(marqueCle, l) };
  });
  // base de la génération (et de sa version, de son énergie) : sert aux facettes et à décider d'une collecte Leboncoin
  const deLaGen = enrichies.filter((l) => (!genC || l.gen === genC) && (!f.energie || normEn(l.energie) === f.energie));
  const parVersion = new Map<string, number>();
  deLaGen.forEach((l) => l.variant && parVersion.set(l.variant, (parVersion.get(l.variant) ?? 0) + 1));
  const okVersion = (l: (typeof enrichies)[number]) => !version || l.variant === version;
  const moteurs = new Map<string, number>();
  deLaGen.filter(okVersion).forEach((l) => l.moteur && moteurs.set(l.moteur, (moteurs.get(l.moteur) ?? 0) + 1));
  const okCarr = (l: (typeof enrichies)[number]) =>
    !f.carrosserie || (f.carrosserie === "berline" ? !l.body || l.body === "hayon" || l.body === "berline" : l.body === f.carrosserie);

  const gardees = enrichies.filter((l) => {
    if (f.gen && l.gen !== f.gen) return false;
    if (!okVersion(l) || !okCarr(l)) return false;
    if (f.phase && genC && !dansPhase(m.base, genC, f.phase, l)) return false;
    if (f.moteur && l.moteur !== f.moteur) return false;
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
    const e = cotes.estimer(l);
    const tx = l.tx;
    // plus de 45 % sous la cote : presque toujours pièces, location, acompte ou prix d'appel
    const suspect = !!(e?.pct != null && e.pct > 0.45);
    return {
      id: l.id, titre: l.titre, prix: l.prix, annee: l.annee, km: l.km, energie: l.energie, boite: l.boite, pro: !!l.pro, lieu: l.lieu, source: l.source,
      ch: l.ch, moteur: l.moteur, version: l.varianteEcrite ? versions.find((v) => v.id === l.variant)?.label ?? null : null,
      vu: l.vu_le, url: lienAnnonce(l), gen: l.gen, genLabel: l.genLabel, piege: PIEGES.test(tx) || suspect, suspect,
      cote: e && e.P ? { P: e.P, lo: e.lo, hi: e.hi, ecart: e.ecart, pct: e.pct, conf: e.conf, moinsCherQue: e.moinsCherQue, n: e.nClean, why: e.why, segments: e.segments } : null,
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
  const sousLaCote = avecCote.filter((a) => !a.suspect && (a.cote!.pct ?? 0) >= 0.05).length;
  const recherche = await enregistrer(f, m, filtrees, sousLaCote).catch((e) => {
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
  return Response.json({
    recherche,
    modele: { nom: `${m.marque} ${m.nom}`, gens: m.gens.map(({ id, label, y0, y1 }) => ({ id, label, y0, y1, n: parGen.get(id) ?? 0 })), incertaines: parGen.get("?") ?? 0 },
    versions: versions.map((v) => ({ id: v.id, label: v.label, n: parVersion.get(v.id) ?? 0 })),
    moteurs: [...moteurs].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([l, n]) => ({ l, n })),
    base: deLaGen.length,
    collecte,
    total: lignes.length,
    trouvees: filtrees.length,
    sousLaCote,
    annonces: filtrees.slice(0, 300),
    ms: Date.now() - t0,
  });
}

type Trouvee = { titre: string; prix: number; url: string | null; piege: boolean; cote: { ecart: number | null; pct: number | null } | null };

/** Garde la recherche (une par véhicule), ouverte en onglet ; au plus 8 onglets ouverts, l'historique reste entier. */
async function enregistrer(f: z.infer<typeof Corps>, m: { marque: string; nom: string; gens: { id: string; label: string; v: { id: string; label: string }[] }[] }, trouvees: Trouvee[], sousLaCote: number) {
  const sb = await supabaseServeur();
  const choix = { marque: f.marque, modele: f.modele, gen: f.gen ?? "" };
  const g = f.gen ? m.gens.find((x) => x.id === f.gen) : null;
  const v = f.version && g ? g.v.find((x) => x.id === f.version) : null;
  const nom = `${m.marque} ${g?.label ?? m.nom}${v ? ` ${v.label.replace(/^[A-Z]\d{2,3}\s/, "")}` : ""}`.slice(0, 160);
  // meilleure affaire crédible : ni piège, ni prix trop beau pour être vrai (plus de 40 % sous la cote)
  const top = trouvees.filter((a) => !a.piege && a.cote?.pct != null && a.cote.pct <= 0.4 && a.cote.ecart != null).sort((a, b) => b.cote!.pct! - a.cote!.pct!)[0];
  const meilleure: Meilleure | null = top ? { titre: top.titre.slice(0, 140), prix: top.prix, ecart: Math.round(top.cote!.ecart!), pct: Math.round(top.cote!.pct! * 100), url: top.url } : null;
  const { data, error } = await sb
    .from("recherches")
    .upsert(
      { cle: cleRecherche(choix), nom, criteres: { choix, f: f.saisie ?? {} }, active: true, trouvees: trouvees.length, sous_cote: sousLaCote, meilleure, derniere_le: new Date().toISOString() },
      { onConflict: "user_id,cle" },
    )
    .select(COLONNES_RECHERCHE)
    .single();
  if (error) throw error;
  // journal : chaque lancement, avec ses filtres exacts, pour « Dernières recherches »
  const { error: ej } = await sb.from("recherches_journal").insert({
    recherche_id: data.id, nom, marque: f.marque, modele: f.modele, gen: f.gen || null, criteres: { choix, f: f.saisie ?? {} }, trouvees: trouvees.length, sous_cote: sousLaCote,
  });
  if (ej) console.error("journal des recherches", ej.message);
  // les onglets les plus anciens se ferment ; les recherches restent toutes dans l'historique
  const { data: ouverts0 } = await sb.from("recherches").select("id").eq("active", true).order("derniere_le", { ascending: false });
  const ouverts = ouverts0 ?? [];
  if (ouverts.length > MAX_ONGLETS) await sb.from("recherches").update({ active: false }).in("id", ouverts.slice(MAX_ONGLETS).map((x) => x.id));
  return data;
}
