"use client";
/* Téléphone, page Tarifs : une fois les cartes dépassées (comparatif, guides, FAQ), une barre en bas garde la formule
   conseillée à portée de pouce. Cachée tant que les cartes sont à l'écran, et pour la formule déjà prise. */
import { useEffect, useState } from "react";
import { centimes, OFFRES, prixParAnalyse, prixTxt, type OffreId } from "@/lib/offres";
import { BoutonAbonner } from "./BoutonAbonner";

export function BarreTarifs({ id, cible, actuelle }: { id: OffreId; cible: string; actuelle?: string | null }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const titre = document.getElementById(cible);
    const cartes = titre?.parentElement?.querySelector("ul");
    if (!titre || !cartes) return;
    const maj = () => {
      const b = cartes.getBoundingClientRect();
      // cartes dépassées, et le panneau de l'onglet est affiché
      setVisible(b.bottom < 0 && titre.offsetParent !== null);
    };
    maj();
    addEventListener("scroll", maj, { passive: true });
    addEventListener("resize", maj);
    return () => {
      removeEventListener("scroll", maj);
      removeEventListener("resize", maj);
    };
  }, [cible]);
  const o = OFFRES[id];
  if (!o || actuelle === id) return null;
  const pa = prixParAnalyse(o);
  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg0/92 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition duration-300 sm:hidden ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`} aria-hidden={!visible} inert={!visible}>
      <div className="flex items-center gap-3">
        <p className="min-w-0 flex-1 text-sm leading-tight">
          <b className="block truncate">{o.famille === "benef" ? "Benef " : ""}{o.nom} · {prixTxt(o.prix)}/mois</b>
          {pa && <span className="text-xs text-ink-3">soit {centimes(pa)} l&apos;analyse</span>}
        </p>
        <div className="shrink-0">
          <BoutonAbonner produit={id} className="btn btn-o btn-sm whitespace-nowrap">Choisir</BoutonAbonner>
        </div>
      </div>
    </div>
  );
}
