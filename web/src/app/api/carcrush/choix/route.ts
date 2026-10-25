import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";

/* CarCrush : choix faits en swipant (« garde » : coup de cœur, « passe ») et liste des coups de cœur. */

const Annonce = z.object({
  id: z.string().min(1).max(80),
  titre: z.string().max(140),
  prix: z.number(),
  annee: z.number().nullable(),
  km: z.number().nullable(),
  ch: z.number().nullable(),
  energie: z.string().max(40).nullable(),
  boite: z.string().max(40).nullable(),
  pro: z.boolean(),
  lieu: z.string().max(80).nullable(),
  // liens rendus tels quels dans les coups de cœur : https seulement (pas de « javascript: » glissé par un appel forgé)
  url: z.string().max(500).regex(/^https:\/\//).nullable(),
  photo: z.string().max(600).regex(/^https:\/\//).nullable(),
  photos: z.array(z.string().max(600).regex(/^https:\/\//)).max(3).optional(),
  gen: z.string().max(80),
  cote: z.object({ P: z.number(), ecart: z.number().nullable(), pct: z.number().nullable(), conf: z.enum(["forte", "moyenne", "faible"]), source: z.enum(["utopicar", "leboncoin"]).optional() }).nullable(),
  verdict: z.enum(["excellente", "bonne", "negocier", "creuser", "eviter"]),
  aVerifier: z.array(z.string().max(40)).max(4).optional(),
});
const Choix = z.object({ recherche: z.uuid(), annonce: Annonce, choix: z.enum(["garde", "passe"]) });
const Retrait = z.object({ recherche: z.uuid(), annonce: z.string().min(1).max(80) });

export async function POST(req: Request) {
  if (!(await compteCourant())) return Response.json({ erreur: "Connectez-vous." }, { status: 401 });
  const r = Choix.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ erreur: "Choix invalide." }, { status: 400 });
  const sb = await supabaseServeur();
  const { data: { user } } = await sb.auth.getUser();
  const { error } = await sb.from("carcrush_choix").upsert(
    { user_id: user!.id, recherche_id: r.data.recherche, annonce_id: r.data.annonce.id, choix: r.data.choix, annonce: r.data.annonce },
    { onConflict: "user_id,recherche_id,annonce_id" },
  );
  if (error) {
    console.error("carcrush choix", error.message);
    return Response.json({ erreur: "Choix non enregistré." }, { status: 500 });
  }
  return Response.json({ ok: true });
}

/** Annuler un choix (bouton Retour) ou retirer un coup de cœur. */
export async function DELETE(req: Request) {
  if (!(await compteCourant())) return Response.json({ erreur: "Connectez-vous." }, { status: 401 });
  const r = Retrait.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ erreur: "Demande invalide." }, { status: 400 });
  const sb = await supabaseServeur();
  const { error } = await sb.from("carcrush_choix").delete().eq("recherche_id", r.data.recherche).eq("annonce_id", r.data.annonce);
  if (error) return Response.json({ erreur: "Non retiré." }, { status: 500 });
  return Response.json({ ok: true });
}

/** Tous les coups de cœur, du plus récent au plus ancien. */
export async function GET() {
  if (!(await compteCourant())) return Response.json({ erreur: "Connectez-vous." }, { status: 401 });
  const sb = await supabaseServeur();
  const { data, error } = await sb.from("carcrush_choix").select("recherche_id, annonce, created_at").eq("choix", "garde").order("created_at", { ascending: false }).limit(200);
  if (error) return Response.json({ erreur: "Coups de cœur indisponibles." }, { status: 500 });
  return Response.json({ favoris: data ?? [] });
}
