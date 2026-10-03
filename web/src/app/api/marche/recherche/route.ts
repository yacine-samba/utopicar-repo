import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { lienAnnonce, marcheModele, normBo, normEn } from "@/lib/vehicules/marche";

/* Recherche dans la base du marché, au niveau de l'outil Garage : marque, modèle, génération,
   chaque annonce placée sur la cote de sa génération (régression sur les annonces comparables). Benef Pro et illimité. */
const Corps = z.object({
  marque: z.string().min(1).max(40),
  modele: z.string().min(1).max(60),
  gen: z.string().max(20).optional(),
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

  const gardees = lignes.filter((l) => {
    if (f.gen && l.gen !== f.gen) return false;
    if (f.energie && normEn(l.energie) !== f.energie) return false;
    if (f.boite && normBo(l.boite) !== (f.boite === "auto" ? "auto" : "manuelle")) return false;
    if (f.anneeMin && (l.annee ?? 0) < f.anneeMin) return false;
    if (f.anneeMax && (l.annee ?? 9999) > f.anneeMax) return false;
    if (f.prixMin && l.prix < f.prixMin) return false;
    if (f.prixMax && l.prix > f.prixMax) return false;
    if (f.kmMax && (l.km ?? 0) > f.kmMax) return false;
    if (f.vendeur === "pro" && !l.pro) return false;
    if (f.vendeur === "particulier" && l.pro) return false;
    const tx = sansAccent(`${l.titre} ${l.texte ?? ""}`);
    if (mots.some((w) => !tx.includes(w))) return false;
    if (exclus.some((w) => tx.includes(w))) return false;
    if (f.fiables && PIEGES.test(tx)) return false;
    return true;
  });

  const annonces = gardees.map((l) => {
    const e = cotes.estimer(l);
    const tx = sansAccent(`${l.titre} ${l.texte ?? ""}`);
    // plus de 45 % sous la cote : presque toujours pièces, location, acompte ou prix d'appel
    const suspect = !!(e?.pct != null && e.pct > 0.45);
    return {
      id: l.id, titre: l.titre, prix: l.prix, annee: l.annee, km: l.km, energie: l.energie, boite: l.boite, pro: !!l.pro, lieu: l.lieu, source: l.source,
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
  return Response.json({
    modele: { nom: `${m.marque} ${m.nom}`, gens: m.gens.map((g) => ({ ...g, n: parGen.get(g.id) ?? 0 })), incertaines: parGen.get("?") ?? 0 },
    total: lignes.length,
    trouvees: filtrees.length,
    sousLaCote: avecCote.filter((a) => !a.suspect && (a.cote!.pct ?? 0) >= 0.05).length,
    annonces: filtrees.slice(0, 300),
    ms: Date.now() - t0,
  });
}
