import type { CSSProperties } from "react";
import { CATALOGUE_DEFAUTS, type DefautCatalogue } from "@/lib/analyse/defauts";
import { dentelure } from "@/lib/dentelure";

/* Les 38 pièges que l'outil lit dans le texte des annonces, présentés comme une carte de restaurant : chaque défaut
   et ce qu'il coûte à réparer, en trois groupes par gravité. Les coûts sont ceux des règles (lib/analyse/defauts.ts).
   Une feuille de papier découpée en haut et en bas, posée sur un champ sombre. */

const GROUPES: { titre: string; sous: string; cats: DefautCatalogue["cat"][] }[] = [
  { titre: "Rédhibitoires", sous: "Lus, ils font passer l'annonce", cats: ["piege"] },
  { titre: "Grosses dépenses", sous: "À chiffrer avant de vous déplacer", cats: ["lourd"] },
  { titre: "Petits défauts", sous: "Autant d'arguments pour négocier", cats: ["levier", "info"] },
];

const eur = (v: number) => v.toLocaleString("fr-FR");
function cout(d: DefautCatalogue) {
  if (d.cat === "info") return "signal";
  if (d.nc || !d.max) return "sur inspection";
  return `${eur(d.min)} à ${eur(d.max)} €`;
}

export function CarteReparations() {
  let n = 0;
  return (
    <div className="text-papier-ink" style={{ clipPath: dentelure({ haut: true, bas: true, dents: 44, profondeur: 10 }) }}>
      <div className="bg-papier px-6 pb-14 pt-14 sm:px-10 lg:px-14">
        <h2 id="pieges-t" className="text-center font-display text-[clamp(40px,4.4vw,64px)] font-medium leading-none tracking-[-0.035em]">
          Les {CATALOGUE_DEFAUTS.length} pièges
        </h2>
        <p className="mx-auto mt-4 max-w-[46ch] text-center text-[17px] text-papier-ink-2">
          Ce que l&apos;outil cherche dans le texte de chaque annonce, et ce que chaque défaut coûte à réparer.
        </p>
        <div className="mt-12 gap-14 lg:columns-2">
          {GROUPES.map((g) => (
            <section key={g.titre} className="mb-11 break-inside-avoid" aria-label={g.titre}>
              <h3 className="text-xl font-bold">{g.titre}</h3>
              <p className="text-[15px] text-papier-ink-2">{g.sous}</p>
              <dl className="mt-4 grid gap-3">
                {CATALOGUE_DEFAUTS.filter((d) => g.cats.includes(d.cat)).map((d) => (
                  <div key={d.k} className="apparait flex items-baseline gap-2 text-[17px]" style={{ "--i": n++ % 8 } as CSSProperties}>
                    <dt>{d.l}</dt>
                    <span className="mb-[0.3em] min-w-4 flex-1 border-b-[3px] border-dotted border-papier-ink/25" aria-hidden="true" />
                    <dd className="num shrink-0 text-right font-medium">{cout(d)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
