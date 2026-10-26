import type { CSSProperties } from "react";
import { dateTxt, libelle, listeCotes } from "@/lib/cotes-publiques";
import { CATALOGUE_DEFAUTS } from "@/lib/analyse/defauts";

/* La base du marché, dite sans hausser la voix : quelques chiffres vrais en lignes (le chiffre à gauche, la phrase à
   droite), puis la cote en direct des modèles les plus suivis, en vrai tableau. Sans base joignable, seules les
   lignes qui n'en dépendent pas restent. */

const fr = (v: number) => v.toLocaleString("fr-FR");

export async function Chiffres() {
  const cotes = await listeCotes();
  const annonces = cotes.reduce((s, c) => s + c.n, 0);
  const releve = dateTxt(cotes.map((c) => c.maj).filter((d): d is string => !!d).sort().pop() ?? null);
  const suivies = cotes.filter((c) => c.n > 0 && c.mediane > 0).sort((a, b) => b.n - a.n).slice(0, 6);
  const lignes: [string, string][] = [
    ...(annonces ? ([[fr(annonces), `annonces de voitures relevées${releve ? ` au ${releve}` : ""}, pour comparer chaque prix à de vraies ventes.`]] as [string, string][]) : []),
    ...(cotes.length ? ([[fr(cotes.length), "modèles cotés, génération par génération."]] as [string, string][]) : []),
    [String(CATALOGUE_DEFAUTS.length), "défauts cherchés dans le texte de chaque annonce, chacun avec son coût."],
    ["2 s", "pour l'aperçu : la cote, les défauts, le moteur."],
    ["1 min", "environ pour le rapport complet, photos lues et questions rédigées."],
  ];
  return (
    <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
      <div>
        <h2 id="chiffres-t" className="font-display text-[clamp(30px,2.6vw,40px)] font-medium leading-tight tracking-[-0.025em] sm:pl-[calc(7.5rem+1.5rem)]">
          La base du marché
        </h2>
        <dl className="mt-10 grid gap-7">
          {lignes.map(([v, l], i) => (
            <div key={l} className="apparait grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-6" style={{ "--i": i } as CSSProperties}>
              <dt className="num text-right font-display text-[clamp(24px,2.2vw,32px)] font-medium">{v}</dt>
              <dd className="max-w-[40ch] text-[17px] text-ink-2">{l}</dd>
            </div>
          ))}
        </dl>
      </div>
      {suivies.length > 0 && (
        <div>
          <h2 className="font-display text-[clamp(30px,2.6vw,40px)] font-medium leading-tight tracking-[-0.025em]">La cote en direct</h2>
          <table className="mt-10 w-full text-left text-[16px]">
            <caption className="sr-only">Prix médian des modèles les plus suivis</caption>
            <thead className="text-ink-3">
              <tr className="border-b border-line-2">
                <th scope="col" className="pb-3 font-medium">Modèle</th>
                <th scope="col" className="pb-3 text-right font-medium">Prix médian</th>
                <th scope="col" className="hidden pb-3 text-right font-medium sm:table-cell">Annonces</th>
              </tr>
            </thead>
            <tbody>
              {suivies.map((c) => (
                <tr key={c.cle} className="border-b border-line">
                  <th scope="row" className="py-3 font-medium">
                    {libelle(c.nom)} <span className="font-normal text-ink-3">{c.y0}–{c.y1}</span>
                  </th>
                  <td className="num py-3 text-right font-display text-xl font-medium">{fr(c.mediane)}&nbsp;€</td>
                  <td className="num hidden py-3 text-right text-ink-2 sm:table-cell">{fr(c.n)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-[15px] text-ink-3">Le prix médian seulement : la cote détaillée par année et kilométrage est réservée aux abonnés.</p>
        </div>
      )}
    </div>
  );
}
