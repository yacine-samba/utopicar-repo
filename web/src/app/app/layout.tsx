import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { compteCourant } from "@/lib/compte";
import { comptesActifs } from "@/lib/supabase/config";
import { BENEF } from "@/lib/offres";
import { CartesOffres } from "@/components/site/CartesOffres";
import { NavApp } from "@/components/benef/NavApp";

export const metadata: Metadata = { title: "Espace Benef", robots: { index: false } };
// Espace personnel : toujours rendu à la demande (session, formule, quotas).
export const dynamic = "force-dynamic";

export default async function LayoutApp({ children }: { children: ReactNode }) {
  const demo = !comptesActifs() && process.env.UTOPICAR_DEMO === "1";
  const compte = await compteCourant();
  if (!demo && comptesActifs() && !compte) redirect("/connexion?next=/app");
  if (!demo && !comptesActifs())
    return (
      <div className="wrap py-20 text-center">
        <h1 className="h-sec">L&apos;espace Benef ouvre très bientôt</h1>
        <p className="mt-4 text-ink-2">
          En attendant, découvrez <Link href="/benef" className="text-o2 underline underline-offset-4">Benef</Link>.
        </p>
      </div>
    );
  const o = compte?.offre;
  if (compte && o?.famille !== "benef")
    return (
      <div className="wrap py-14">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="kicker">Espace Benef</span>
          <h1 className="h-sec mt-5">
            Choisissez votre formule <span className="it">Benef</span>
          </h1>
          <p className="mt-4 text-lg text-ink-2">L&apos;espace Benef chiffre chaque annonce pour l&apos;achat-revente : marge nette, prix d&apos;offre, historique et tableau de bord.</p>
        </div>
        <CartesOffres ids={BENEF} />
      </div>
    );
  const onglets = [
    { href: "/app", label: "Tableau de bord", ouvert: true },
    { href: "/app/analyser", label: "Analyser", ouvert: true },
    { href: "/app/rapports", label: "Rapports", ouvert: true },
    { href: "/app/comparer", label: "Comparer", ouvert: !!o?.comparateur },
    { href: "/app/parc", label: "Parc", ouvert: !!o?.parc },
    { href: "/app/recherche", label: "Recherche", ouvert: !!o?.recherche },
  ];
  return (
    <div className="wrap py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-3">
          Espace Benef · {o ? <>formule <b className="text-ink">{o.nom}</b> · {compte?.restantes} analyse{(compte?.restantes ?? 0) > 1 ? "s" : ""} restante{(compte?.restantes ?? 0) > 1 ? "s" : ""} ce mois</> : <b className="text-warn">mode démonstration</b>}
        </p>
        {o && o.id !== "pro" && (
          <Link href="/tarifs#benef" className="text-sm text-o2 underline underline-offset-4">
            Changer de formule
          </Link>
        )}
      </div>
      <NavApp onglets={onglets} />
      <div className="mt-8">{children}</div>
    </div>
  );
}
