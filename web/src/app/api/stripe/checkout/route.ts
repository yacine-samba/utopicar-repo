import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { GUIDE, OFFRES, STATUTS_ACTIFS, type OffreId } from "@/lib/offres";
import { comptesActifs } from "@/lib/supabase/config";
import { supabaseService } from "@/lib/supabase/service";
import { paiementsActifs, prixParCle, stripe, urlSite } from "@/lib/stripe";

const Corps = z.object({ produit: z.enum(["essentiel", "serenite", "starter", "croissance", "pro", "guide"]) });

/** Identifiant client Stripe de la personne, créé au premier paiement. */
async function clientStripe(id: string, email: string, prenom: string) {
  const svc = supabaseService();
  const { data } = await svc.from("profils").select("stripe_customer_id").eq("id", id).maybeSingle();
  if (data?.stripe_customer_id) return data.stripe_customer_id as string;
  const c = await stripe().customers.create({ email, name: prenom || undefined, metadata: { user_id: id } });
  await svc.from("profils").update({ stripe_customer_id: c.id }).eq("id", id);
  return c.id;
}

export async function POST(req: Request) {
  if (!comptesActifs() || !paiementsActifs() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return Response.json({ erreur: "Les paiements ne sont pas encore ouverts." }, { status: 503 });
  const compte = await compteCourant();
  if (!compte) return Response.json({ erreur: "Connectez-vous pour continuer.", connexion: true }, { status: 401 });
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ erreur: "Formule inconnue." }, { status: 400 });
  const site = urlSite(req);
  const customer = await clientStripe(compte.id, compte.email, compte.prenom);

  if (r.data.produit === "guide") {
    if (compte.guide) return Response.json({ url: `${site}/guide` });
    const prix = await prixParCle(GUIDE.lookup, { nom: GUIDE.nom, euros: GUIDE.prix, mensuel: false });
    const s = await stripe().checkout.sessions.create({
      mode: "payment",
      customer,
      client_reference_id: compte.id,
      line_items: [{ price: prix.id, quantity: 1 }],
      metadata: { user_id: compte.id, produit: "guide" },
      locale: "fr",
      success_url: `${site}/guide?paiement=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/guide?paiement=annule`,
      custom_text: { submit: { message: "Accès immédiat aux guides après le paiement : vous demandez l'exécution immédiate et renoncez au délai de rétractation pour ce contenu numérique." } },
    });
    return Response.json({ url: s.url });
  }

  // Déjà abonné : le changement de formule passe par le portail Stripe, pour ne jamais payer deux abonnements.
  if (compte.abonnement && STATUTS_ACTIFS.includes(compte.abonnement.statut)) {
    const p = await stripe().billingPortal.sessions.create({ customer, return_url: `${site}/compte` });
    return Response.json({ url: p.url });
  }

  const id = r.data.produit as OffreId;
  const o = OFFRES[id];
  const prix = await prixParCle(o.lookup!, { nom: `Utopicar ${o.famille === "benef" ? "Benef " : ""}${o.nom}`, euros: o.prix, mensuel: true });
  const s = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: compte.id,
    line_items: [{ price: prix.id, quantity: 1 }],
    metadata: { user_id: compte.id, offre: id },
    subscription_data: { metadata: { user_id: compte.id, offre: id } },
    allow_promotion_codes: true,
    locale: "fr",
    success_url: `${site}/compte?paiement=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/tarifs?paiement=annule`,
    custom_text: { submit: { message: "Sans engagement : résiliable à tout moment depuis votre compte. L'accès commence tout de suite." } },
  });
  return Response.json({ url: s.url });
}
