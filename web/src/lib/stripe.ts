import "server-only";
import Stripe from "stripe";

export const paiementsActifs = () => Boolean(process.env.STRIPE_SECRET_KEY);

let client: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY manquante");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/** Prix Stripe retrouvé par sa clé (lookup key), sans identifiant écrit en dur. */
export async function prixParCle(cle: string) {
  const { data } = await stripe().prices.list({ lookup_keys: [cle], active: true, limit: 1 });
  if (!data[0]) throw new Error(`Prix Stripe introuvable : ${cle}. Lancez « node stripe/prix.mjs ».`);
  return data[0];
}

/** Adresse publique du site, pour les retours de paiement et les liens des emails. */
export function urlSite(req: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
}
