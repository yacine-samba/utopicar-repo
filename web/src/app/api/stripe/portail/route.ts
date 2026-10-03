import { compteCourant } from "@/lib/compte";
import { supabaseService } from "@/lib/supabase/service";
import { paiementsActifs, stripe, urlSite } from "@/lib/stripe";

/** Portail Stripe : changer de formule, mettre à jour la carte, télécharger les factures, résilier. */
export async function POST(req: Request) {
  if (!paiementsActifs()) return Response.json({ erreur: "Les paiements ne sont pas encore ouverts." }, { status: 503 });
  const compte = await compteCourant();
  if (!compte) return Response.json({ erreur: "Connectez-vous pour continuer." }, { status: 401 });
  const { data } = await supabaseService().from("profils").select("stripe_customer_id").eq("id", compte.id).maybeSingle();
  if (!data?.stripe_customer_id) return Response.json({ erreur: "Aucun paiement enregistré sur ce compte." }, { status: 404 });
  const p = await stripe().billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${urlSite(req)}/app/compte` });
  return Response.json({ url: p.url });
}
