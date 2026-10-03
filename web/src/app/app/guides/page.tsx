import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { compteBenef } from "@/lib/benef";
import { confirmerRetour } from "@/lib/stripe-synchro";
import { ContenuGuides } from "@/components/site/ContenuGuides";

export const metadata: Metadata = { title: "Guides" };

export default async function Page({ searchParams }: { searchParams: Promise<{ guide?: string; paiement?: string; session_id?: string }> }) {
  const c = await compteBenef("/app/guides");
  const p = await searchParams;
  // Retour de Stripe après l'achat des guides : accès enregistré tout de suite, puis rechargement.
  if (p.paiement === "ok" && p.session_id) {
    await confirmerRetour(p.session_id, c.id);
    redirect("/app/guides?paiement=ok");
  }
  return <ContenuGuides compte={c} choix={p.guide} paiement={p.paiement} base="/app/guides" />;
}
