import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { compteBenef } from "@/lib/benef";
import { catalogue } from "@/lib/vehicules/catalogue";
import { VerrouBenef } from "@/components/benef/Verrou";
import { PlacerVoiture } from "@/components/marche/CoteMarche";

export const metadata: Metadata = { title: "Estimer une cote" };

/** Estimation de cote, façon MyTracks : les critères du véhicule, la cote calculée sur notre base d'annonces. Formules Benef. */
export default async function Page() {
  const c = await compteBenef("/app/estimation");
  if (c.illimite) redirect("/app/cote");
  if (c.offre.famille !== "benef")
    return <VerrouBenef offre="starter" titre="Estimer une cote" texte="Renseignez la voiture (modèle, année, kilométrage, motorisation) : sa cote est calculée sur les annonces réelles de notre base." />;
  return (
    <div className="grid gap-6">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-semibold">Estimer une cote</h1>
        <p className="mt-2 text-ink-2">
          Renseignez la voiture : marque, modèle, génération, année, kilométrage, et si vous les connaissez la motorisation, la finition et la puissance. La cote est calculée sur les annonces réelles de notre base (même moteur quand il y en a assez), avec ce que coûtent les kilomètres et ce qu&apos;elle vaudra dans un an.
        </p>
      </div>
      <PlacerVoiture cat={catalogue()} estimation />
    </div>
  );
}
