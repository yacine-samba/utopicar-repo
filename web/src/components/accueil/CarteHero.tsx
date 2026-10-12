"use client";
import { useEffect, useState } from "react";
import { PreuveAnimee, type CarteAnalyse } from "./PreuveAnimee";

/** Événement du champ d'essai : la carte à montrer dans l'en-tête (null : revenir à l'exemple ; "charge" : analyse en cours). */
export const EVT_CARTE = "utp-carte-hero";

/** La carte pendant que l'analyse tourne : même gabarit, un balayage en boucle et des barres qui attendent. */
function Chargement() {
  return (
    <figure className="mx-auto w-full max-w-[420px]">
      <figcaption className="sr-only">Analyse de votre annonce en cours…</figcaption>
      <div className="relative isolate aspect-[4/5] overflow-hidden rounded-[30px] border border-line-2 bg-[radial-gradient(120%_90%_at_30%_10%,#3a2a20,#120d0a)] shadow-[0_40px_100px_-40px_rgb(255_90_31/0.6)]" aria-hidden="true">
        <div className="balayage-boucle pointer-events-none absolute inset-x-0 top-0 h-[38%] border-b-2 border-o bg-[linear-gradient(180deg,transparent,rgb(255_90_31/0.28))] shadow-[0_6px_24px_rgb(255_90_31/0.55)]" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 py-1.5 pl-2 pr-3 text-sm font-medium text-white backdrop-blur-md">
          <span className="grid size-5 place-items-center rounded-full bg-white text-[9px] font-bold text-black">lbc</span>
          <span className="size-1.5 animate-pulse rounded-full bg-o" /> Analyse en cours…
        </div>
        <div className="absolute inset-x-4 bottom-4 grid gap-3">
          <div className="grid gap-3 rounded-2xl border border-white/15 bg-black/50 p-4 backdrop-blur-md">
            {[0, 1].map((i) => (
              <div key={i} className="grid grid-cols-[4.5rem_1fr_4.2rem] items-center gap-2.5">
                <span className="h-3 animate-pulse rounded bg-white/20" />
                <span className="h-2.5 animate-pulse rounded-full bg-white/10" />
                <span className="h-3 animate-pulse rounded bg-white/20" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg0 px-4 py-4">
            <span className="h-6 w-28 animate-pulse rounded-full bg-line" />
            <span className="h-8 w-20 animate-pulse rounded bg-line" />
          </div>
        </div>
      </div>
    </figure>
  );
}

/** La carte de l'en-tête : l'exemple au départ, un chargement pendant l'analyse, puis l'annonce que la personne vient
    de scanner (première photo, son prix face au marché, son verdict). La clé change : l'animation se rejoue. */
export function CarteHero({ defaut }: { defaut: CarteAnalyse }) {
  const [carte, setCarte] = useState<{ c: CarteAnalyse | "charge"; n: number }>({ c: defaut, n: 0 });
  useEffect(() => {
    const suivre = (e: Event) => {
      const c = (e as CustomEvent<CarteAnalyse | null | "charge">).detail;
      setCarte((x) => ({ c: c ?? defaut, n: x.n + 1 }));
    };
    addEventListener(EVT_CARTE, suivre);
    return () => removeEventListener(EVT_CARTE, suivre);
  }, [defaut]);
  return (
    <div aria-live="polite">
      {carte.c === "charge" ? <Chargement /> : <PreuveAnimee key={carte.n} carte={carte.c} remplace={carte.n > 0} />}
    </div>
  );
}
