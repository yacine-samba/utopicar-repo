import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { compteCourant } from "@/lib/compte";
import { GUIDE, OFFRES, OPTION_MESSAGES, PACKS, prixTxt, type OffreId } from "@/lib/offres";
import { LancerPaiement } from "@/components/espace/LancerPaiement";

export const metadata: Metadata = { title: "Paiement" };

/* Reprise d'un achat commencé sans compte : « Choisir Essentiel » → inscription → ici → Stripe, sans recliquer.
   Sert aussi de lien direct vers le paiement d'une formule (/app/payer?produit=starter). */
function libelle(p: string): string | null {
  if (p in OFFRES) {
    const o = OFFRES[p as OffreId];
    return o.prix > 0 && !o.cachee ? `${o.famille === "benef" ? "Benef " : ""}${o.nom}, ${prixTxt(o.prix)} par mois` : null;
  }
  const k = PACKS.find((x) => x.id === p);
  if (k) return `${k.nom}, ${prixTxt(k.prix)}`;
  if (p === "guide") return `${GUIDE.nom}, ${prixTxt(GUIDE.prix)}`;
  if (p === "messages") return `Option ${OPTION_MESSAGES.nom}, ${prixTxt(OPTION_MESSAGES.prix)} par mois`;
  return null;
}

export default async function Payer({ searchParams }: { searchParams: Promise<{ produit?: string }> }) {
  const c = await compteCourant();
  if (!c) redirect("/connexion?next=/app/payer");
  const { produit = "" } = await searchParams;
  const l = libelle(produit);
  if (!l) redirect("/tarifs");
  // déjà sur cette formule : rien à payer
  if (produit === c.offre.id && c.offre.prix > 0) redirect("/app/compte#formule");
  return <LancerPaiement produit={produit} libelle={l} />;
}
