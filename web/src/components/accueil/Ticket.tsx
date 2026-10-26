import type { CSSProperties } from "react";
import { EXEMPLES, euros } from "@/lib/demo";
import { dentelure } from "@/lib/dentelure";

/* Comment ça marche, imprimé comme un ticket : ce que l'outil fait de la vraie annonce Clio de la démonstration,
   étape par étape, avec le temps qu'il y met et ce qu'il en sort. La dernière ligne, inversée, est le résultat :
   le prix à proposer. Les lignes s'impriment l'une après l'autre en arrivant à l'écran (classe « apparait »).
   Le papier garde ses couleurs dans les deux thèmes, comme un vrai ticket. */

const clio = EXEMPLES.clio;
const [, , , proposer] = clio.lignes;
const nb = /(\d+)/.exec(clio.lignes[0].s)?.[1];
const modele = clio.titre.replace("Renault ", "").replace(/ \d.*$/, "");

const GROUPES: { temps: string; lignes: [string, string][] }[] = [
  {
    temps: "Tout de suite",
    lignes: [
      ["Vous collez le lien de l'annonce", "0 s"],
      ["Texte et photos lus", `${clio.nbPhotos} photos`],
    ],
  },
  {
    temps: "En 2 secondes, l'aperçu",
    lignes: [
      [`Cote : ${nb} ${modele} comparables`, euros(clio.lignes[0].v ?? 0)],
      ["Prix demandé par le vendeur", euros(clio.prix)],
      [`Défaut lu : ${clio.lignes[1].s.split(" (")[0].toLowerCase()}`, `+ ${euros(clio.lignes[1].v ?? 0)}`],
      [`Moteur ${clio.fiab.moteur}`, "fiable"],
    ],
  },
  {
    temps: "En une minute environ, le rapport",
    lignes: [
      ["Prix réel, réparations comprises", euros(clio.lignes[2].v ?? 0)],
      ["Questions au vendeur", "rédigées"],
      ["Premier message", "prêt à copier"],
    ],
  },
];

const i = (n: number) => ({ "--i": n }) as CSSProperties;

export function Ticket() {
  let n = 0;
  return (
    <div className="apparait text-papier-ink" style={{ clipPath: dentelure({ bas: true, dents: 26, profondeur: 9 }) }}>
      <div className="bg-papier px-6 pb-10 pt-7 sm:px-8">
        <p className="flex items-baseline justify-between gap-4 text-[15px] text-papier-ink-2">
          <span>{clio.titre}</span>
          <span className="num shrink-0">{euros(clio.prix)}</span>
        </p>
        {GROUPES.map((g) => (
          <div key={g.temps} className="mt-7">
            <p className="apparait font-semibold" style={i(n++)}>
              {g.temps}
            </p>
            <dl className="mt-2 grid gap-2.5">
              {g.lignes.map(([l, v]) => (
                <div key={l} className="apparait flex items-baseline gap-2 text-[17px]" style={i(n++)}>
                  <dt className="min-w-0">{l}</dt>
                  <span className="mb-[0.3em] min-w-4 flex-1 border-b-[3px] border-dotted border-papier-ink/30" aria-hidden="true" />
                  <dd className="num shrink-0 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        {/* la ligne du résultat, inversée */}
        <div className="apparait -mx-6 mt-8 flex items-baseline justify-between gap-4 bg-papier-ink px-6 py-3 text-papier sm:-mx-8 sm:px-8" style={i(n++)}>
          <span className="font-semibold">{proposer.l}</span>
          <span className="num font-display text-2xl font-medium">{euros(proposer.v ?? 0)}</span>
        </div>
      </div>
    </div>
  );
}
