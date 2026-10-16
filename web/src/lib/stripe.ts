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

/** Configuration du portail client Stripe (factures, carte, résiliation, changement de formule).
    Un compte Stripe en mode réel n'en a pas par défaut : elle est créée ici au premier besoin, puis réutilisée. */
async function configurationPortail(site: string) {
  const liste = await stripe().billingPortal.configurations.list({ active: true, limit: 100 });
  // v2 : avec Pro + Messages (la v1 reste en place pour rien, elle n'est plus utilisée)
  const deja = liste.data.find((c) => c.metadata?.utopicar === "v2");
  if (deja) return deja.id;
  const { OFFRES, BENEF } = await import("./offres");
  const ids = (["essentiel", ...BENEF] as const).map((id) => OFFRES[id]);
  const prix = await Promise.all(ids.map((o) => prixParCle(o.lookup!, { nom: `Utopicar ${o.famille === "benef" ? "Benef " : ""}${o.nom}`, euros: o.prix, mensuel: true })));
  const c = await stripe().billingPortal.configurations.create({
    metadata: { utopicar: "v2" },
    default_return_url: `${site}/app/compte`,
    business_profile: { headline: "Utopicar : votre abonnement", privacy_policy_url: `${site}/legal#confidentialite`, terms_of_service_url: `${site}/legal#vente` },
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      customer_update: { enabled: true, allowed_updates: ["email", "address"] },
      subscription_cancel: { enabled: true, mode: "at_period_end", cancellation_reason: { enabled: true, options: ["too_expensive", "unused", "missing_features", "other"] } },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        proration_behavior: "create_prorations",
        products: prix.map((x) => ({ product: typeof x.product === "string" ? x.product : x.product.id, prices: [x.id] })),
      },
    },
  });
  return c.id;
}

/** Lien vers le portail client Stripe de la personne. */
export async function lienPortail(customer: string, site: string) {
  const configuration = await configurationPortail(site);
  return (await stripe().billingPortal.sessions.create({ customer, configuration, return_url: `${site}/app/compte` })).url;
}

/** Adresse publique du site, pour les retours de paiement et les liens des emails. */
export function urlSite(req: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
}

/** Le champ « code promo » de Stripe ne s'affiche que s'il existe au moins un code promo actif : sinon il fait sortir
    du paiement pour aller chercher un code qui n'existe pas. Vérifié au plus toutes les 10 minutes ; en cas d'erreur, affiché. */
let codesPromo: { t: number; v: boolean } | null = null;
export async function codesPromoActifs(): Promise<boolean> {
  if (codesPromo && Date.now() - codesPromo.t < 10 * 60_000) return codesPromo.v;
  try {
    const l = await stripe().promotionCodes.list({ active: true, limit: 1 });
    codesPromo = { t: Date.now(), v: l.data.length > 0 };
  } catch (e) {
    console.error("codes promo stripe", e);
    return true;
  }
  return codesPromo.v;
}
