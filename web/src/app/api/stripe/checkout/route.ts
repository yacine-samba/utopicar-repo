import * as z from "zod/v4";
import { compteCourant } from "@/lib/compte";
import { GUIDE, OFFRES, OPTION_MESSAGES, pack, PACKS, STATUTS_ACTIFS, type OffreId } from "@/lib/offres";
import { comptesActifs } from "@/lib/supabase/config";
import { supabaseService } from "@/lib/supabase/service";
import { lienPortail, paiementsActifs, prixParCle, stripe, urlSite } from "@/lib/stripe";

// Sérénité n'est plus proposée : elle ne peut plus être souscrite.
const Corps = z.object({ produit: z.enum(["essentiel", "starter", "croissance", "pro", "guide", "messages", ...PACKS.map((p) => p.id)] as [string, ...string[]]) });

/** Identifiant client Stripe de la personne, créé au premier paiement. */
async function clientStripe(id: string, email: string, prenom: string) {
  const svc = supabaseService();
  const { data } = await svc.from("profils").select("stripe_customer_id").eq("id", id).maybeSingle();
  if (data?.stripe_customer_id) return data.stripe_customer_id as string;
  const c = await stripe().customers.create({ email, name: prenom || undefined, metadata: { user_id: id } });
  // upsert : un compte sans fiche profil (ancien compte) recevrait sinon un nouveau client Stripe à chaque paiement
  const { error } = await svc.from("profils").upsert({ id, stripe_customer_id: c.id }, { onConflict: "id" });
  if (error) console.error("profil stripe", error);
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
      success_url: `${site}/app/guides?paiement=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/app/guides?paiement=annule`,
      custom_text: { submit: { message: "Accès immédiat aux guides après le paiement : vous demandez l'exécution immédiate et renoncez au délai de rétractation pour ce contenu numérique." } },
    });
    return Response.json({ url: s.url });
  }

  // Option Messages Leboncoin : un abonnement à part, réservé à Benef Pro.
  if (r.data.produit === "messages") {
    if (compte.messages) return Response.json({ url: `${site}/app/messages` });
    if (compte.offre.id !== "pro" || compte.illimite) return Response.json({ erreur: "L'option Messages Leboncoin s'ajoute à Benef Pro." }, { status: 403 });
    const prix = await prixParCle(OPTION_MESSAGES.lookup, { nom: `Utopicar option ${OPTION_MESSAGES.nom}`, euros: OPTION_MESSAGES.prix, mensuel: true });
    const s = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer,
      client_reference_id: compte.id,
      line_items: [{ price: prix.id, quantity: 1 }],
      metadata: { user_id: compte.id, option: "messages" },
      subscription_data: { metadata: { user_id: compte.id, option: "messages" } },
      locale: "fr",
      success_url: `${site}/app/messages?paiement=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/app/compte?paiement=annule#option-messages`,
      custom_text: { submit: { message: "Sans engagement : résiliable à tout moment depuis votre compte. L'option s'ajoute à Benef Pro." } },
    });
    return Response.json({ url: s.url });
  }

  // Crédits à l'unité : paiement unique, crédités par le webhook (ou au retour sur le site).
  const p = pack(r.data.produit);
  if (p) {
    const prix = await prixParCle(p.lookup, { nom: `Utopicar ${p.nom}`, euros: p.prix, mensuel: false });
    const s = await stripe().checkout.sessions.create({
      mode: "payment",
      customer,
      client_reference_id: compte.id,
      line_items: [{ price: prix.id, quantity: 1 }],
      metadata: { user_id: compte.id, produit: "credits", pack: p.id, credits: String(p.credits) },
      allow_promotion_codes: true,
      locale: "fr",
      success_url: `${site}/app/credits?paiement=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/app/credits?paiement=annule`,
      custom_text: { submit: { message: "Crédits ajoutés tout de suite, valables 12 mois. Vous demandez l'exécution immédiate et renoncez au délai de rétractation pour les analyses utilisées." } },
    });
    return Response.json({ url: s.url });
  }

  // Déjà abonné : le changement de formule passe par le portail Stripe, pour ne jamais payer deux abonnements.
  if (compte.abonnement && STATUTS_ACTIFS.includes(compte.abonnement.statut)) {
    return Response.json({ url: await lienPortail(customer, site) });
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
    success_url: `${site}/app/compte?paiement=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/tarifs?paiement=annule`,
    custom_text: { submit: { message: "Sans engagement : résiliable à tout moment depuis votre compte. L'accès commence tout de suite." } },
  });
  return Response.json({ url: s.url });
}
