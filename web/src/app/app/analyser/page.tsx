import type { Metadata } from "next";
import Link from "next/link";
import { compteBenef } from "@/lib/benef";
import { familleEspace, texteRestantes } from "@/lib/espace";
import { BENEF, centimes, formuleSuivante, prixParAnalyse } from "@/lib/offres";
import { OutilBenef } from "@/components/benef/OutilBenef";
import { OutilAnalyse } from "@/components/analyse/OutilAnalyse";
import { CartesOffres } from "@/components/site/CartesOffres";
import { DemandeProfil } from "@/components/analyse/ProfilAnalyse";
import { lienPartage } from "@/lib/analyse/import";
import { redirect } from "next/navigation";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { reprendreEssai } from "@/lib/essai";

export const metadata: Metadata = { title: "Analyser une annonce" };

export default async function Page({ searchParams }: { searchParams: Promise<{ lien?: string; url?: string; texte?: string; titre?: string; usage?: string; essai?: string }> }) {
  const sp = await searchParams;
  const c = await compteBenef(sp.usage === "benef" ? "/app/analyser?usage=benef" : "/app/analyser");
  // carte « Gratuit » des tarifs Benef : l'usage achat-revente est enregistré (s'il n'est pas déjà choisi),
  // pour que l'analyse offerte soit une analyse Benef
  if (sp.usage === "benef") {
    if (!c.famille && !c.illimite) await (await supabaseServeur()).from("profils").update({ famille: "benef", updated_at: new Date().toISOString() }).eq("id", c.id);
    redirect(sp.lien ? `/app/analyser?lien=${encodeURIComponent(sp.lien)}` : "/app/analyser");
  }
  // ?lien= (tableau de bord) ou partage depuis une appli (url, texte, titre : voir le manifest)
  const lien = sp.lien ?? lienPartage(sp.url, sp.texte, sp.titre) ?? undefined;
  const partageIllisible = !sp.lien && !lien && !!(sp.url || sp.texte);
  const o = c.offre;
  const suite = c.illimite ? null : formuleSuivante(o.id, familleEspace(c));

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
    return <OutilBenef maxPhotos={o.photos} parc={o.parc} villeCompte={c.ville} lienInitial={lien} restantes={c.illimite ? null : c.restantes} suite={suite?.id ?? null} />;
  }

  // analyse offerte : l'annonce collée avant l'email part toute seule
  const essai = await reprendreEssai(sp.essai, c.email);

  return (
    <>
    <DemandeProfil />
    <OutilAnalyse
      ville={c.ville}
      maxPhotos={o.photos}
      restantes={c.illimite ? null : c.restantes}
      suite={suite?.id ?? null}
      retour="/app/analyser"
      lienInitial={lien}
      essai={essai}
      apres={
        <p className="mb-4 text-sm text-ink-3">
          Analyse enregistrée dans <Link href="/app/rapports" className="text-o2 underline underline-offset-4">Mes analyses</Link>.
        </p>
      }
      entete={
        <div className="grid gap-2">
          <h1 className="font-display text-[clamp(28px,5vw,40px)] font-semibold leading-tight tracking-tight">Analyser une annonce</h1>
          {partageIllisible && <p role="status" className="rounded-2xl border border-warn/40 bg-warn/10 p-3 text-sm text-warn">Le partage ne contenait pas de lien d&apos;annonce Leboncoin, La Centrale ou AutoScout24. Copiez le lien de l&apos;annonce et collez-le ci-dessous.</p>}
          <p className="text-ink-2">
            Collez le lien Leboncoin : l&apos;annonce et ses photos se remplissent toutes seules et l&apos;analyse démarre. Pour un autre site, collez le texte de l&apos;annonce.
          </p>
          <p className="text-sm text-ink-3">
            {c.restantes > 0 ? `${texteRestantes(c)}.` : "Plus d'analyse disponible pour le moment."}{" "}
            {c.restantes === 0 ? (
              <>
                {suite && <Link href={`/app/payer?produit=${suite.id}`} className="font-medium text-o2 underline underline-offset-4">Passer à {suite.nom}{prixParAnalyse(suite) ? `, ${centimes(prixParAnalyse(suite)!)} l'analyse` : ""}</Link>}
                {suite && " ou "}
                <Link href="/app/credits" className="text-o2 underline underline-offset-4">{suite ? "acheter des crédits" : "Acheter des crédits"}</Link>
              </>
            ) : (
              o.prix === 0 && <Link href="/app/compte#formule" className="text-o2 underline underline-offset-4">Voir les formules</Link>
            )}
          </p>
        </div>
      }
    />
    </>
  );
}
