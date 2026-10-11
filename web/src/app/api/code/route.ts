import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { ipDe, tropDeDemandes } from "@/lib/limite";

/* Code offert (TIKTOK…) saisi par la personne connectée : POST { code } → { ok, analyses } ou { erreur }.
   La règle (code actif, une fois par compte) est dans la fonction utiliser_code (migration 20261011120000). */

const Corps = z.object({ code: z.string().trim().min(3).max(30) });

export async function POST(req: Request) {
  if (tropDeDemandes("code", ipDe(req), 10, 10 * 60_000)) return Response.json({ erreur: "Trop d'essais. Réessayez dans quelques minutes." }, { status: 429 });
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous pour utiliser un code." }, { status: 401 });
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ erreur: "Ce code n'existe pas." }, { status: 400 });
  const { data, error } = await (await supabaseServeur()).rpc("utiliser_code", { p_code: r.data.code });
  if (error) {
    if (error.code === "23505") return Response.json({ erreur: "Ce code a déjà été utilisé sur votre compte." }, { status: 409 });
    if (error.code === "P0002") return Response.json({ erreur: "Ce code n'existe pas ou n'est plus valable." }, { status: 404 });
    console.error("utiliser_code", error);
    return Response.json({ erreur: "Le code n'a pas pu être enregistré. Réessayez dans un instant." }, { status: 500 });
  }
  return Response.json({ ok: true, analyses: data as number });
}
