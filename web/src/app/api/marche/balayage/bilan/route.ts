import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";

/* Bilan du relevé automatique des cotes : gardé pour que la page Cote l'affiche (chaque recherche, son nombre de
   résultats, celles que Leboncoin coupe à 100 pages). Le même relevé renvoyé remplace son bilan. */
export const maxDuration = 30;

const Corps = z.object({
  id: z.uuid(),
  debut: z.number().int(),
  fin: z.number().int().nullish(),
  bilan: z.record(z.string(), z.unknown()),
});

export async function POST(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous sur utopicar.fr pour envoyer le relevé." }, { status: 401 });
  if (!c.illimite) return Response.json({ erreur: "Le relevé des cotes est réservé au compte illimité." }, { status: 403 });
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ erreur: "Bilan invalide." }, { status: 400 });
  const { id, debut, fin, bilan } = r.data;
  const { error } = await (await supabaseServeur())
    .from("releves_auto")
    .upsert({ id, debut: new Date(debut).toISOString(), fin: fin ? new Date(fin).toISOString() : null, bilan });
  if (error) return Response.json({ erreur: "Bilan non enregistré : " + error.message }, { status: 500 });
  return Response.json({ ok: true });
}
