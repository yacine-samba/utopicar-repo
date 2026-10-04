"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Analyse } from "@/lib/analyse/couts";
import { Saisie } from "../Saisie";
import { ResultatParticulier } from "./ResultatParticulier";
import { EnTeteRapport } from "./EnTeteRapport";

export function OutilAnalyse({ ville, maxPhotos, entete, retour = "/analyse", lienInitial, apres, restantes = null }: { ville: string; maxPhotos: number; entete: React.ReactNode; retour?: string; lienInitial?: string; apres?: React.ReactNode; restantes?: number | null }) {
  const router = useRouter();
  const [a, setA] = useState<Analyse | null>(null);
  if (a)
    return (
      <div className="mx-auto grid max-w-3xl gap-5">
        {(a.photosUrls?.length || a.lien) && (
          <EnTeteRapport
            titre={[a.ia?.vehicule.marque, a.ia?.vehicule.modele, a.ia?.vehicule.version].filter(Boolean).join(" ") || a.faits.titre || "Votre annonce"}
            prix={a.faits.prix ?? null}
            photos={a.photosUrls ?? []}
            lien={a.lien ?? null}
            vendeur={a.vendeur ?? null}
            maxPhotos={maxPhotos > 0 ? 12 : 3}
            date=""
            retour={{ onClick: () => (setA(null), scrollTo({ top: 0 })), l: "Nouvelle analyse" }}
          />
        )}
        {a.rapportId && apres}
        <ResultatParticulier
          a={a}
          onNouvelle={() => {
            setA(null);
            scrollTo({ top: 0 });
          }}
        />
      </div>
    );
  return (
    <div className="mx-auto grid max-w-3xl gap-8">
      {entete}
      <div className="carte p-5 sm:p-7">
        <Saisie
          mode="particulier"
          maxPhotos={maxPhotos}
          restantes={restantes}
          villeInitiale={ville}
          villeLabel="Votre ville"
          villeAide="Pour calculer le trajet jusqu'à la voiture."
          bouton="Analyser l'annonce"
          retour={retour}
          lienInitial={lienInitial}
          onResultat={(r) => {
            // rapport enregistré : la page complète s'ouvre (photos d'abord, puis l'analyse)
            if (r.rapportId && !r.demo) return router.push(`/app/rapports/${r.rapportId}`);
            setA(r);
            scrollTo({ top: 0 });
          }}
        />
      </div>
    </div>
  );
}
