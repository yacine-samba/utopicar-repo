import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { compteBenef } from "@/lib/benef";
import { confirmerRetour } from "@/lib/stripe-synchro";
import { ContenuGuides } from "@/components/site/ContenuGuides";
import { supabaseServeur } from "@/lib/supabase/serveur";

export const metadata: Metadata = { title: "Guides" };

export default async function Page({ searchParams }: { searchParams: Promise<{ guide?: string; paiement?: string; session_id?: string }> }) {
  const c = await compteBenef("/app/guides");
  const p = await searchParams;
  // Retour de Stripe après l'achat des guides : accès enregistré tout de suite, puis rechargement.
  if (p.paiement === "ok" && p.session_id) {
    await confirmerRetour(p.session_id, c.id);
    redirect("/app/guides?paiement=ok");
  }
  // Premiers pas : « lire le guide » compte comme fait dès la première ouverture de la page.
  const sb = await supabaseServeur();
  const { data: profil } = await sb.from("profils").select("reglages").eq("id", c.id).maybeSingle();
  const reglages = (profil?.reglages as Record<string, unknown> | null) ?? {};
  if (!reglages.guide_ouvert) await sb.from("profils").update({ reglages: { ...reglages, guide_ouvert: true } }).eq("id", c.id);
  return <ContenuGuides compte={c} choix={p.guide} paiement={p.paiement} base="/app/guides" />;
}
