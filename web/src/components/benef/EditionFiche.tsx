"use client";
import { useState } from "react";
import type { Vehicule } from "@/lib/parc";
import { FicheParc } from "./FicheParc";

/** Bouton « Modifier la fiche » de la vue détaillée d'une voiture du parc : la fiche s'ouvre sur place. */
export function EditionFiche({ v }: { v: Vehicule }) {
  const [ouverte, setOuverte] = useState(false);
  if (!ouverte)
    return (
      <button type="button" onClick={() => setOuverte(true)} className="btn btn-sm">
        Modifier la fiche, ajouter des photos
      </button>
    );
  return (
    <div className="carte p-5 sm:col-span-full">
      <FicheParc v={v} onFini={() => setOuverte(false)} />
    </div>
  );
}
