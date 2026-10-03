import type { Metadata } from "next";
import { compteBenef } from "@/lib/benef";
import { catalogue } from "@/lib/vehicules/catalogue";
import { VerrouBenef } from "@/components/benef/Verrou";
import { CoteMarche } from "@/components/marche/CoteMarche";

export const metadata: Metadata = { title: "Cote" };

export default async function Page() {
  const c = await compteBenef("/app/cote");
  if (!c.offre.recherche)
    return <VerrouBenef offre="pro" titre="Cote du marché" texte="Collez le relevé de toute une page Leboncoin : chaque annonce est cotée sur sa génération, sur un graphique prix, kilométrage, année, version et options. Placez aussi n'importe quelle voiture face aux annonces comparables." />;
  return (
    <div className="grid gap-6">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-semibold">Cote</h1>
        <p className="mt-2 text-ink-2">
          Le calcul de l&apos;outil Garage : une régression sur les annonces de la même génération et de la même énergie (âge, kilométrage, boîte, version, puissance, équipements), les annonces aberrantes écartées. Collez un relevé pour coter toute une page, ou placez une voiture précise sur le graphique.
        </p>
      </div>
      <CoteMarche cat={catalogue()} />
    </div>
  );
}
