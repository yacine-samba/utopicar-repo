import { redirect } from "next/navigation";
import { confirmerRetour } from "@/lib/stripe-synchro";
import type { Metadata } from "next";
import { compteCourant } from "@/lib/compte";
import { ContenuGuides } from "@/components/site/ContenuGuides";
import "./guide.css";

export const metadata: Metadata = {
  title: "Les guides",
  description: "Quatre guides complets : première revente, tri des annonces, estimation d'une reprise, achat d'une occasion sans se faire avoir.",
};

// Ancienne fonction d'envoi des guides : les liens déjà reçus par email (lecture et désinscription) restent valables.
const FN = "https://rvdfifhgosovdapdltps.supabase.co/functions/v1/inscription";
async function ancienLien(corps: Record<string, string>) {
  try {
    const r = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps), cache: "no-store" });
    const d = await r.json().catch(() => ({}));
    return r.ok && d.ok ? d : null;
  } catch {
    return null;
  }
}

type Params = { guide?: string; t?: string; stop?: string; paiement?: string; session_id?: string };

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;

  if (p.stop && /^[\w.-]{10,200}$/.test(p.stop)) {
    const ok = await ancienLien({ action: "stop", s: p.stop });
    return (
      <div className="wrap py-20 text-center">
        <h1 className="h-sec">{ok ? "C'est fait" : "Lien non valable"}</h1>
        <p className="mt-4 text-ink-2">{ok ? "Vous ne recevrez plus de messages de notre part." : "Ce lien de désinscription n'est pas valide. Écrivez-nous depuis la page Contact."}</p>
      </div>
    );
  }

  if (p.t && /^[A-Za-z0-9_-]{40,}$/.test(p.t)) {
    const d = await ancienLien({ action: "lire", t: p.t });
    if (d)
      return (
        <div className="wrap py-12">
          <p className="sans-impression mb-6 text-center text-sm text-ink-3">Guide personnel de {d.prenom}, envoyé lors de votre inscription.</p>
          <article className="feuille">
            <div dangerouslySetInnerHTML={{ __html: d.contenu }} />
          </article>
        </div>
      );
  }

  const compte = await compteCourant();
  // Retour de Stripe après l'achat du guide : accès enregistré tout de suite, puis rechargement.
  if (compte && p.paiement === "ok" && p.session_id) {
    await confirmerRetour(p.session_id, compte.id);
    redirect("/app/guides?paiement=ok");
  }
  // Connecté : les guides se lisent dans l'espace.
  if (compte) redirect(`/app/guides${p.guide ? `?guide=${encodeURIComponent(p.guide)}` : ""}`);
  return <ContenuGuides compte={null} choix={p.guide} base="/guide" />;
}
