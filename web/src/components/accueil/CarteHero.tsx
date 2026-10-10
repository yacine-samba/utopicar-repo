"use client";
import { useEffect, useState } from "react";
import { PreuveAnimee, type CarteAnalyse } from "./PreuveAnimee";

/** Événement du champ d'essai : la carte à montrer dans l'en-tête (null : revenir à l'exemple). */
export const EVT_CARTE = "utp-carte-hero";

/** La carte de l'en-tête : l'exemple au départ, puis l'annonce que la personne vient de scanner
    (première photo, son prix face au marché, son verdict). La clé change : l'animation se rejoue. */
export function CarteHero({ defaut }: { defaut: CarteAnalyse }) {
  const [carte, setCarte] = useState<{ c: CarteAnalyse; n: number }>({ c: defaut, n: 0 });
  useEffect(() => {
    const suivre = (e: Event) => {
      const c = (e as CustomEvent<CarteAnalyse | null>).detail;
      setCarte((x) => ({ c: c ?? defaut, n: x.n + 1 }));
    };
    addEventListener(EVT_CARTE, suivre);
    return () => removeEventListener(EVT_CARTE, suivre);
  }, [defaut]);
  return (
    <div aria-live="polite">
      <PreuveAnimee key={carte.n} carte={carte.c} remplace={carte.n > 0} />
    </div>
  );
}
