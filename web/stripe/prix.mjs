// Crée (une seule fois) les produits et les prix Stripe d'Utopicar, retrouvés ensuite par leur « lookup key ».
// Usage : STRIPE_SECRET_KEY=sk_test_... node stripe/prix.mjs
// Relancer ne crée pas de doublon. Pour changer un prix : créez un nouveau prix dans Stripe et déplacez-y la lookup key.
import Stripe from "stripe";

const cle = process.env.STRIPE_SECRET_KEY;
if (!cle) {
  console.error("Définissez STRIPE_SECRET_KEY.");
  process.exit(1);
}
const stripe = new Stripe(cle);

const PRODUITS = [
  { lookup: "utp_essentiel_mois", nom: "Utopicar Essentiel", desc: "Particuliers : 10 analyses par mois, plus de détails.", cents: 499, mensuel: true },
  { lookup: "utp_serenite_mois", nom: "Utopicar Sérénité", desc: "Particuliers : 30 analyses par mois, négociation, contrôle sur place, guide inclus.", cents: 999, mensuel: true },
  { lookup: "utp_starter_mois", nom: "Benef Starter", desc: "Achat-revente : 30 analyses par mois, historique, tableau de bord.", cents: 1499, mensuel: true },
  { lookup: "utp_croissance_mois", nom: "Benef Croissance", desc: "Achat-revente : 100 analyses par mois, historique complet, comparateur.", cents: 2900, mensuel: true },
  { lookup: "utp_pro_mois", nom: "Benef Pro", desc: "Achat-revente : tableau de bord complet, parc, recherche avancée, rapports détaillés.", cents: 5900, mensuel: true },
  { lookup: "utp_guide", nom: "Les guides Utopicar", desc: "Accès à vie aux guides : première revente, tri, reprise, achat d'une occasion.", cents: 900, mensuel: false },
];

for (const p of PRODUITS) {
  const { data } = await stripe.prices.list({ lookup_keys: [p.lookup], limit: 1 });
  if (data[0]) {
    console.log(`déjà là   ${p.lookup} → ${data[0].id}`);
    continue;
  }
  const produit = await stripe.products.create({ name: p.nom, description: p.desc });
  const prix = await stripe.prices.create({
    product: produit.id,
    currency: "eur",
    unit_amount: p.cents,
    lookup_key: p.lookup,
    tax_behavior: "inclusive",
    ...(p.mensuel ? { recurring: { interval: "month" } } : {}),
  });
  console.log(`créé      ${p.lookup} → ${prix.id}`);
}
console.log("\nÀ faire dans le tableau de bord Stripe :");
console.log("- Portail client : autoriser le changement de formule entre les prix ci-dessus et la résiliation.");
console.log("- Webhook vers https://utopicar.fr/api/stripe/webhook : checkout.session.completed, customer.subscription.created/updated/deleted.");
