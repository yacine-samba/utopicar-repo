import type { CSSProperties } from "react";

/* Le fonctionnement en trois pictogrammes reliés : une ligne orange court de l'un à l'autre au chargement.
   Remplace une phrase d'explication. CSS seul (classes « scene », « pas », « jauge » de globals.css). */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

const ICONES = {
  lien: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  balance: "M12 4v16M5 20h14M6 8l-3 6a3 3 0 0 0 6 0L6 8Zm12 0-3 6a3 3 0 0 0 6 0l-3-6ZM6 8h12",
  verdict: "M5 12.5 10 17 19 7",
  compte: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
};

/** `actif` : l'étape mise en avant (la dernière par défaut, le résultat ; la première sur la page d'inscription, « vous êtes ici »). */
export function TroisTemps({ etapes, actif }: { etapes: [keyof typeof ICONES, string][]; actif?: number }) {
  const ici = actif ?? etapes.length - 1;
  return (
    <ol className="scene mx-auto flex w-full max-w-md items-start lg:mx-0" aria-label="Comment ça marche">
      {etapes.map(([icone, l], i) => (
        <li key={l} aria-current={actif !== undefined && i === ici ? "step" : undefined} className="relative flex flex-1 flex-col items-center gap-2 text-center lg:items-start lg:text-left">
          {i > 0 && (
            // du centre du pictogramme précédent au centre de celui-ci (centrés sur téléphone, à gauche sur ordinateur)
            <span className="absolute left-[-50%] right-[50%] top-5 z-0 h-0.5 bg-line-2 lg:left-[calc(-100%+1.25rem)] lg:right-[calc(100%-1.25rem)]" aria-hidden="true">
              <span className="jauge absolute inset-0 bg-o" style={d(0.35 + i * 0.45)} />
            </span>
          )}
          <span
            className={`pas relative z-10 grid size-10 place-items-center rounded-full ${i === ici ? "bg-o text-[#160904]" : "border border-line-2 bg-bg0 text-o2"}`}
            style={d(0.15 + i * 0.45)}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={ICONES[icone]} />
            </svg>
          </span>
          <span className="pas text-sm font-medium text-ink-2" style={d(0.2 + i * 0.45)}>
            {l}
          </span>
        </li>
      ))}
    </ol>
  );
}
