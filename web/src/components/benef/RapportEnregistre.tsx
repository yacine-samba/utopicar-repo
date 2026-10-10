"use client";
import type { Analyse } from "@/lib/analyse/couts";
import { paramsPro } from "@/lib/analyse/profil";
import { useProfilAnalyse } from "../analyse/ProfilAnalyse";
import { ResultatBenef } from "./ResultatBenef";
import { AjouterParc } from "./AjouterParc";
import { RapportComplet } from "./RapportComplet";

export function RapportEnregistre({ a, id, titre, parc, parcId = null }: { a: Analyse; id: string; titre: string; parc: boolean; parcId?: string | null }) {
  const { profil } = useProfilAnalyse();
  const reg = { ...paramsPro(profil), ville: profil.ville || a.ville || "Paris" };
  // Rapport au format de l'outil Garage : affichage complet (réduit selon la formule).
  if (a.rapport) return <RapportComplet a={a} r={a.rapport} reg={reg} offre={a.offre ?? "pro"} id={id} parc={parc && !parcId} lien={a.lien} parcId={parcId} />;
  return (
    <ResultatBenef
      a={a}
      actions={
        <>
          <button type="button" onClick={() => print()} className="btn">
            Imprimer ou enregistrer en PDF
          </button>
          {parc && <AjouterParc rapportId={id} titre={titre} prix={a.faits.prix ?? a.ia?.vehicule.prix ?? null} />}
        </>
      }
    />
  );
}
