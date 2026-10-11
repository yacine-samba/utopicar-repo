"use client";
import type { Analyse } from "@/lib/analyse/couts";
import type { ProfilAnalyse } from "@/lib/analyse/profil";
import { ProfilAnalyseFournisseur } from "@/components/analyse/ProfilAnalyse";
import { Bilan, useBilan } from "@/components/analyse/Bilan";

function Contenu({ a }: { a: Analyse }) {
  const b = useBilan(a);
  // vue partagée : le bilan complet, sans le message au vendeur (il appartient à la personne qui a fait l'analyse)
  return <Bilan a={a} b={b} detail="simple" lien={null} />;
}

export function BilanPartage({ a, profil }: { a: Analyse; profil: ProfilAnalyse }) {
  return (
    <ProfilAnalyseFournisseur initial={profil} lecture>
      <Contenu a={a} />
    </ProfilAnalyseFournisseur>
  );
}
