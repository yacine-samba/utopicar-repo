"use client";
import { DEFAUTS_PRO, type Analyse, type ParamsPro } from "@/lib/analyse/couts";
import { useReglages } from "../ui";
import { ResultatBenef } from "./ResultatBenef";
import { AjouterParc } from "./AjouterParc";

export function RapportEnregistre({ a, id, titre, parc }: { a: Analyse; id: string; titre: string; parc: boolean }) {
  const [reg] = useReglages<ParamsPro>("utp-pro", { ...DEFAUTS_PRO, ville: a.ville || DEFAUTS_PRO.ville });
  return (
    <ResultatBenef
      a={a}
      reg={reg}
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
