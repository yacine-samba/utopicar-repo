import "server-only";
import type Stripe from "stripe";
import { OFFRES, type OffreId } from "@/lib/offres";
import { supabaseService } from "@/lib/supabase/service";
import { stripe } from "@/lib/stripe";

const parCle = (cle: string | null | undefined) => (Object.values(OFFRES).find((o) => o.lookup && o.lookup === cle)?.id ?? null) as OffreId | null;

/** Enregistre l'état d'un abonnement Stripe dans `abonnements` (appelé par le webhook et au retour du paiement). */
export async function synchroniser(sub: Stripe.Subscription) {
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

/** Achat du guide payé : accès enregistré dans `achats`. */
export async function enregistrerGuide(s: Stripe.Checkout.Session) {
  if (s.mode !== "payment" || s.metadata?.produit !== "guide" || s.payment_status !== "paid" || !s.metadata.user_id) return;
  const { error } = await supabaseService().from("achats").upsert({ user_id: s.metadata.user_id, produit: "guide", stripe_session_id: s.id }, { onConflict: "stripe_session_id" });
  if (error) throw error;
}

/** Retour de Stripe Checkout (?session_id=…) : on enregistre tout de suite, sans attendre le webhook.
    La session doit appartenir à la personne connectée. Sans effet si elle est déjà enregistrée. */
export async function confirmerRetour(sessionId: string | undefined, userId: string) {
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return false;
  try {
    const s = await stripe().checkout.sessions.retrieve(sessionId);
    if (s.client_reference_id !== userId) return false;
    if (s.mode === "subscription" && s.subscription) {
      await synchroniser(await stripe().subscriptions.retrieve(typeof s.subscription === "string" ? s.subscription : s.subscription.id));
      return true;
    }
    if (s.mode === "payment") {
      await enregistrerGuide(s);
      return s.payment_status === "paid";
    }
  } catch (e) {
    console.error("retour stripe", e);
  }
  return false;
}
