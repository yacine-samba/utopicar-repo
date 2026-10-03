import type Stripe from "stripe";
import { OFFRES, type OffreId } from "@/lib/offres";
import { supabaseService } from "@/lib/supabase/service";
import { stripe } from "@/lib/stripe";

const parCle = (cle: string | null | undefined) => (Object.values(OFFRES).find((o) => o.lookup && o.lookup === cle)?.id ?? null) as OffreId | null;

async function synchroniser(sub: Stripe.Subscription) {
  const svc = supabaseService();
  let userId = sub.metadata?.user_id || null;
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  if (!userId) {
    const { data } = await svc.from("profils").select("id").eq("stripe_customer_id", customer).maybeSingle();
    userId = data?.id ?? null;
  }
  if (!userId) throw new Error(`Abonnement ${sub.id} sans utilisateur`);
  const item = sub.items.data[0];
  // La clé du prix fait foi : elle suit les changements de formule faits dans le portail.
  const offre = parCle(item?.price.lookup_key) ?? (sub.metadata?.offre as OffreId | undefined);
  if (!offre || !(offre in OFFRES)) throw new Error(`Formule inconnue pour ${sub.id}`);
  const { error } = await svc.from("abonnements").upsert({
    user_id: userId,
    offre,
    statut: sub.status,
    stripe_subscription_id: sub.id,
    periode_fin: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
    annule_fin_periode: sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return new Response("non configuré", { status: 400 });
  let ev: Stripe.Event;
  try {
    ev = await stripe().webhooks.constructEventAsync(await req.text(), sig, secret);
  } catch {
    return new Response("signature invalide", { status: 400 });
  }
  try {
    switch (ev.type) {
      case "checkout.session.completed": {
        const s = ev.data.object;
        if (s.mode === "payment" && s.metadata?.produit === "guide" && s.payment_status === "paid" && s.metadata.user_id) {
          const { error } = await supabaseService()
            .from("achats")
            .upsert({ user_id: s.metadata.user_id, produit: "guide", stripe_session_id: s.id }, { onConflict: "stripe_session_id" });
          if (error) throw error;
        }
        if (s.mode === "subscription" && s.subscription) {
          const id = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
          await synchroniser(await stripe().subscriptions.retrieve(id));
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await synchroniser(ev.data.object);
        break;
    }
  } catch (e) {
    console.error("webhook stripe", ev.type, e);
    return new Response("erreur", { status: 500 });
  }
  return Response.json({ recu: true });
}
