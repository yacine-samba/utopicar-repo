"use client";
import { useEffect, useState } from "react";

/* Mots qui s'écrivent et s'effacent dans le titre.
   Correction du site d'origine : le dégradé était appliqué au bloc entier (background-clip: text),
   ce qui faisait apparaître en fond les mots « cachés » servant à réserver la place. Ici, seul le mot
   visible porte le dégradé, et la place est réservée par le mot le plus long, invisible et sans dégradé. */
export function Rotateur({ mots }: { mots: string[] }) {
  const [txt, setTxt] = useState(mots[0]);
  useEffect(() => {
    const calme = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-calme") || document.hidden;
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    let actif = true;
    const pause = (ms: number, f: () => void) => {
      t = setTimeout(() => actif && f(), ms);
    };
    const effacer = (s: string) => {
      if (calme()) return pause(1500, () => effacer(s));
      if (s.length) {
        setTxt(s.slice(0, -1));
        return pause(28, () => effacer(s.slice(0, -1)));
      }
      i = (i + 1) % mots.length;
      ecrire(mots[i], 0);
    };
    const ecrire = (m: string, n: number) => {
      if (calme()) {
        setTxt(m);
        return pause(2400, () => effacer(m));
      }
      setTxt(m.slice(0, n + 1));
      if (n + 1 < m.length) return pause(55, () => ecrire(m, n + 1));
      pause(2200, () => effacer(m));
    };
    pause(2400, () => effacer(mots[0]));
    return () => {
      actif = false;
      clearTimeout(t);
    };
  }, [mots]);
  const plusLong = mots.reduce((a, b) => (b.length > a.length ? b : a), "");
  return (
    <>
      {/* nom accessible du titre : la phrase complète, avec tous les mots qui défilent */}
      <span className="sr-only">{mots.length > 1 ? `${mots.slice(0, -1).join(", ")} ou ${mots[mots.length - 1]}` : mots[0]}</span>
      {/* Sur sa propre ligne et centré : la place réservée au mot le plus long ne laisse jamais de vide à côté du titre. */}
      <span className="grid justify-items-center text-center lg:justify-items-start lg:text-left" aria-hidden="true">
        <span className="invisible col-start-1 row-start-1 whitespace-nowrap pr-[.25em] max-[420px]:whitespace-normal">{plusLong}</span>
        <span className="col-start-1 row-start-1 whitespace-nowrap max-[420px]:whitespace-normal">
          <span className="it">{txt}</span>
          <span className="ml-1 inline-block h-[.8em] w-[3px] translate-y-[.06em] rounded-sm bg-o2 animate-[clignote_1s_steps(1)_infinite]" />
        </span>
      </span>
    </>
  );
}
