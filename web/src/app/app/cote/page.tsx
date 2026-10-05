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
          Une voiture est cotée sur les annonces du même moteur (une 335i sur des 335i, pas sur des 316i) quand il y en a au moins 25, sinon sur toute sa génération avec la puissance de chacune. Âge au mois près, kilométrage, carrosserie (coupé, Touring, 3 ou 5 portes), finition Leboncoin, boîte et équipements font le reste ; les annonces aberrantes sont écartées. Collez un relevé pour coter toute une page, ou placez une voiture précise sur le graphique.
        </p>
      </div>
      <CoteMarche cat={catalogue()} />
    </div>
  );
}
