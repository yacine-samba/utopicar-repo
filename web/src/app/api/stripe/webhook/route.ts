import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { track } from "@vercel/analytics/server";
import { enregistrerCredits, enregistrerGuide, synchroniser } from "@/lib/stripe-synchro";

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
        await enregistrerGuide(s);
        await enregistrerCredits(s);
        // entonnoir des statistiques Vercel : paiement réussi, par type et montant (sans donnée personnelle)
        await track("paiement_ok", { mode: s.mode, produit: s.metadata?.produit ?? null, montant: (s.amount_total ?? 0) / 100 }).catch(() => undefined);
        if (s.mode === "subscription" && s.subscription) {
          const id = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
          await synchroniser(await stripe().subscriptions.retrieve(id));
        }
        break;
      }
      // Paiement par moyen différé (virement…) : crédité quand il aboutit.
      case "checkout.session.async_payment_succeeded":
        await enregistrerGuide(ev.data.object);
        await enregistrerCredits(ev.data.object);
        break;
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
