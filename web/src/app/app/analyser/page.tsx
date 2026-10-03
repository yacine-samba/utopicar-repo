import type { Metadata } from "next";
import Link from "next/link";
import { compteBenef } from "@/lib/benef";
import { familleEspace } from "@/lib/espace";
import { BENEF } from "@/lib/offres";
import { OutilBenef } from "@/components/benef/OutilBenef";
import { OutilAnalyse } from "@/components/analyse/OutilAnalyse";
import { CartesOffres } from "@/components/site/CartesOffres";

export const metadata: Metadata = { title: "Analyser une annonce" };

export default async function Page({ searchParams }: { searchParams: Promise<{ lien?: string }> }) {
  const c = await compteBenef("/app/analyser");
  const { lien } = await searchParams;
  const o = c.offre;

  if (familleEspace(c) === "benef") {
    if (o.famille !== "benef")
      return (
        <div className="grid gap-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-semibold">Choisissez votre formule Benef</h1>
            <p className="mt-2 text-ink-2">L&apos;analyse Benef chiffre la marge nette, le prix d&apos;offre et le plafond d&apos;achat de chaque annonce. Sans engagement, résiliable à tout moment.</p>
          </div>
          <CartesOffres ids={BENEF} />
          <p className="text-sm text-ink-3">
            Vous cherchez une voiture pour vous ? <Link href="/app/compte#usage" className="text-o2 underline underline-offset-4">Passez en usage particulier</Link> : votre première analyse est offerte.
          </p>
        </div>
      );
    return <OutilBenef maxPhotos={o.photos} parc={o.parc} villeCompte={c.ville} lienInitial={lien} />;
  }

  return (
    <OutilAnalyse
      ville={c.ville}
      maxPhotos={o.photos}
      retour="/app/analyser"
      lienInitial={lien}
      apres={
        <p className="mb-4 text-sm text-ink-3">
          Analyse enregistrée dans <Link href="/app/rapports" className="text-o2 underline underline-offset-4">Mes analyses</Link>.
        </p>
      }
      entete={
        <div className="grid gap-2">
          <h1 className="font-display text-[clamp(28px,5vw,40px)] font-semibold leading-tight tracking-tight">Analyser une annonce</h1>
          <p className="text-ink-2">
            Collez le lien Leboncoin : l&apos;annonce et ses photos se remplissent toutes seules et l&apos;analyse démarre. Pour un autre site, collez le texte de l&apos;annonce.
          </p>
          <p className="text-sm text-ink-3">
            {c.restantes > 0 ? `${c.restantes} analyse${c.restantes > 1 ? "s" : ""} restante${c.restantes > 1 ? "s" : ""}${o.parMois ? " ce mois" : ""}.` : "Plus d'analyse disponible pour le moment."}{" "}
            {o.prix === 0 && <Link href="/app/compte#formule" className="text-o2 underline underline-offset-4">Voir les formules</Link>}
          </p>
        </div>
      }
    />
  );
}
