import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";

/* Relevé automatique des cotes (extension « Relever toutes les cotes ») : toutes les marques et tous les modèles de
   Leboncoin, dans chaque énergie. L'extension garde les annonces relevées puis les envoie ici par lots : elles rejoignent
   la base du marché, avec la marque et le modèle donnés par Leboncoin. Un titre qui ne nomme pas le modèle
   (« Superbe 1.4 TFSI ») reçoit la marque et le modèle devant, pour que la cote de ce modèle le retrouve. */
export const maxDuration = 60;

const Annonce = z.object({
  i: z.string().regex(/^\d{6,14}$/),
  t: z.string().max(200),
  p: z.number().int().min(500).max(300000),
  a: z.number().int().min(1950).max(2035).nullish(),
  k: z.number().int().min(0).max(250000).nullish(),
  e: z.string().max(40),
  b: z.string().max(30).nullish(),
  c: z.number().int().min(0).max(2000).nullish(),
  pro: z.boolean().nullish(),
  cp: z.string().max(10).nullish(),
  mq: z.string().max(60),
  md: z.string().max(80).nullish(),
});
type Annonce = z.infer<typeof Annonce>;
const Corps = z.object({ items: z.array(Annonce).max(5000) });
// extension 4.5 : lot par recherche, annonces telles que lues sur Leboncoin (u, t, f)
const Ancien = z.object({
  base: z.string().max(80).optional(), energie: z.string().max(40).optional(),
  items: z.array(z.object({ u: z.string().max(300), t: z.string().max(200).optional(), f: z.record(z.string(), z.unknown()).optional() })).max(5000),
});

const plat = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** Annonce de l'extension 4.5 (u, t, f) vers le format ci-dessus ; null si elle n'a ni identifiant ni prix. */
function depuisAncien(x: { u: string; t?: string; f?: Record<string, unknown> }): Annonce | null {
  const f = x.f ?? {};
  const id = (x.u.match(/(\d{6,14})/) ?? [])[1];
  const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null);
  const prix = n(f.prix);
  const energie = typeof f.energie === "string" ? f.energie : "";
  if (!id || prix == null || prix < 500 || prix > 300000) return null;
  return {
    i: id, t: String(x.t ?? "").slice(0, 200), p: prix, a: n(f.annee), k: n(f.km), e: energie,
    b: typeof f.boite === "string" ? f.boite : null, c: n(f.ch), pro: f.pro === true, cp: typeof f.cp === "string" ? f.cp : null,
    mq: typeof f.mq === "string" && f.mq ? f.mq : "?", md: typeof f.md === "string" ? f.md : null,
  };
}

export async function POST(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous sur utopicar.fr pour envoyer le relevé." }, { status: 401 });
  if (!c.illimite) return Response.json({ erreur: "Le relevé des cotes est réservé au compte illimité." }, { status: 403 });
  const corps = await req.json().catch(() => null);
  const r = Corps.safeParse(corps);
  const ancien = r.success ? null : Ancien.safeParse(corps);
  if (!r.success && !ancien?.success) return Response.json({ erreur: "Lot invalide." }, { status: 400 });
  const lot: Annonce[] = r.success ? r.data.items : (ancien?.data?.items ?? []).map(depuisAncien).filter((x): x is Annonce => x !== null);
  if (!lot.length) return Response.json({ enregistrees: 0 });

  const p = lot.map((x) => {
    const titre = plat(x.t);
    const nomme = x.md ? titre.includes(plat(x.md)) : titre.includes(plat(x.mq));
    return {
      id: x.i, titre: (nomme ? x.t : `${x.mq} ${x.md ?? ""} ${x.t}`.replace(/\s+/g, " ")).slice(0, 200),
      prix: x.p, annee: x.a ?? null, km: x.k ?? null, energie: x.e, boite: x.b ?? "", ch: x.c || null, pro: !!x.pro, cp: x.cp ?? "",
      marque: x.mq, modele: x.md ?? "",
    };
  });
  const { data, error } = await (await supabaseServeur()).rpc("releve_enregistrer", { p_items: p });
  if (error) return Response.json({ erreur: "Enregistrement impossible : " + error.message }, { status: 500 });
  return Response.json({ enregistrees: typeof data === "number" ? data : 0 });
}
