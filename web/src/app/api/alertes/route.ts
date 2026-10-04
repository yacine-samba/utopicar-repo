import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";

/* Alertes e-mail (recherches suivies sur Leboncoin) : Benef Pro (3 alertes, toutes les 3 h au plus) et mode illimité.
   Les droits et les limites sont vérifiés dans les fonctions de la base (alertes_droits). */
const Corps = z.discriminatedUnion("action", [
  z.object({ action: z.literal("liste") }),
  z.object({
    action: z.literal("enregistrer"),
    alerte: z.object({
      id: z.string().uuid().optional(),
      nom: z.string().trim().min(1).max(80),
      actif: z.boolean(),
      notifier: z.boolean(),
      email: z.string().trim().max(200).optional(),
      intervalle_min: z.number().int().min(60).max(1440),
      filtres: z.record(z.string(), z.unknown()),
    }),
  }),
  z.object({ action: z.literal("basculer"), id: z.string().uuid(), actif: z.boolean().nullable(), notifier: z.boolean().nullable() }),
  z.object({ action: z.literal("retirer"), id: z.string().uuid() }),
  z.object({ action: z.literal("lancer"), id: z.string().uuid() }),
  z.object({ action: z.literal("restaurer"), id: z.string().uuid() }),
]);

export async function POST(req: Request) {
  const c = await compteCourant();
  if (!c) return Response.json({ erreur: "Connectez-vous." }, { status: 401 });
  if (!c.illimite && c.offre.id !== "pro") return Response.json({ erreur: "Les alertes e-mail sont comprises dans Benef Pro." }, { status: 403 });
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ erreur: "Demande invalide." }, { status: 400 });
  const sb = await supabaseServeur();
  const d = r.data;
  const res =
    d.action === "liste" ? await sb.rpc("mes_alertes")
    : d.action === "enregistrer" ? await sb.rpc("alerte_enregistrer", { p: d.alerte })
    : d.action === "basculer" ? await sb.rpc("alerte_basculer", { p_id: d.id, p_actif: d.actif, p_notifier: d.notifier })
    : d.action === "retirer" ? await sb.rpc("alerte_retirer", { p_id: d.id })
    : d.action === "restaurer" ? await sb.rpc("alerte_restaurer", { p_id: d.id })
    : await sb.rpc("alerte_lancer", { p_id: d.id });
  if (res.error) return Response.json({ erreur: res.error.message }, { status: 400 });
  if (d.action === "liste") return Response.json({ alertes: res.data });
  const liste = await sb.rpc("mes_alertes");
  return Response.json({ ok: true, id: d.action === "enregistrer" ? res.data : undefined, alertes: liste.data ?? [] });
}
