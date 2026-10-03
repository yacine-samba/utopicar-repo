"use client";
import { useState } from "react";
import type { Analyse } from "@/lib/analyse/couts";
import { Saisie } from "../Saisie";
import { ResultatParticulier } from "./ResultatParticulier";

export function OutilAnalyse({ ville, maxPhotos, entete, retour = "/analyse", lienInitial, apres }: { ville: string; maxPhotos: number; entete: React.ReactNode; retour?: string; lienInitial?: string; apres?: React.ReactNode }) {
  const [a, setA] = useState<Analyse | null>(null);
  if (a)
    return (
      <div className="mx-auto max-w-3xl">
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
          villeInitiale={ville}
          villeLabel="Votre ville"
          villeAide="Pour calculer le trajet jusqu'à la voiture."
          bouton="Analyser l'annonce"
          retour={retour}
          lienInitial={lienInitial}
          onResultat={(r) => {
            setA(r);
            scrollTo({ top: 0 });
          }}
        />
      </div>
    </div>
  );
}
