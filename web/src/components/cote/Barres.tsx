import { eur } from "@/lib/cotes-publiques";

/* Barres horizontales d'une seule série (prix médian par année, par kilométrage…), en vrai tableau :
   lisible au lecteur d'écran et par les moteurs de recherche. Une teinte (l'orange de la marque), pas de légende :
   le titre nomme la série. Les valeurs restent en encre, la barre ne porte que la longueur. */
export function Barres({ titre, colonne, lignes, aide }: { titre: string; colonne: string; lignes: { l: string; v: number; n: number }[]; aide?: string }) {
  if (lignes.length < 2) return null;
  const max = Math.max(...lignes.map((x) => x.v));
  return (
    <figure className="carte p-5 sm:p-6">
      <figcaption>
        <h3 className="font-display text-lg font-semibold">{titre}</h3>
        {aide && <p className="mt-1 text-sm text-ink-3">{aide}</p>}
      </figcaption>
      <table className="mt-4 w-full border-separate border-spacing-y-1.5 text-sm">
        <thead className="sr-only">
          <tr>
            <th scope="col">{colonne}</th>
            <th scope="col">Prix médian</th>
            <th scope="col" className="max-sm:sr-only">Annonces</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((x) => (
            <tr key={x.l} title={`${x.l} : ${eur(x.v)} en médiane, ${x.n} annonces`}>
              <th scope="row" className="w-[32%] min-w-[5.5rem] pr-3 text-left font-normal leading-snug text-ink-2">
                {x.l}
              </th>
              <td className="w-full pr-3">
                <span className="flex items-center gap-2.5">
                  {/* piste de largeur fixe : la barre part de zéro et garde sa proportion, quelle que soit la largeur d'écran */}
                  <span className="relative h-2.5 min-w-0 flex-1" aria-hidden="true">
                    <span className="absolute inset-y-0 left-0 rounded-r-[4px] bg-o/85" style={{ width: `${Math.max(3, (x.v / max) * 100)}%` }} />
                  </span>
                  <b className="num w-[4.75rem] shrink-0 text-right font-semibold text-ink">{eur(x.v)}</b>
                </span>
              </td>
              <td className="num w-12 text-right text-xs text-ink-3 max-sm:sr-only">
                {x.n}
                <span className="sr-only"> annonces</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-right text-[11px] text-ink-3 max-sm:hidden" aria-hidden="true">
        à droite : nombre d&apos;annonces
      </p>
    </figure>
  );
}
