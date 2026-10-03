import "server-only";
import Stripe from "stripe";

export const paiementsActifs = () => Boolean(process.env.STRIPE_SECRET_KEY);

let client: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY manquante");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/** Prix Stripe retrouvé par sa clé (lookup key), sans identifiant écrit en dur.
    S'il n'existe pas encore (compte Stripe neuf, mode test), il est créé ici avec son produit : rien à préparer à la main. */
export async function prixParCle(cle: string, def: { nom: string; euros: number; mensuel: boolean }) {
  const cherche = async () => (await stripe().prices.list({ lookup_keys: [cle], active: true, limit: 1 })).data[0];
  const trouve = await cherche();
  if (trouve) return trouve;
  try {
    return await stripe().prices.create({
      currency: "eur",
      unit_amount: Math.round(def.euros * 100),
      lookup_key: cle,
      ...(def.mensuel ? { recurring: { interval: "month" as const } } : {}),
      product_data: { name: def.nom },
    });
  } catch (e) {
    // Deux paiements lancés en même temps : l'autre a créé le prix, on le reprend.
    const deja = await cherche();
    if (deja) return deja;
    throw e;
  }
}

/** Adresse publique du site, pour les retours de paiement et les liens des emails. */
export function urlSite(req: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
}
