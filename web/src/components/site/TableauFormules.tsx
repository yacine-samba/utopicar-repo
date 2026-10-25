import { centimes, OFFRES, prixParAnalyse, prixTxt, type Offre, type OffreId } from "@/lib/offres";
import { cx } from "@/lib/cx";

/** Comparatif ligne par ligne des formules d'une famille. Seules les lignes où les formules diffèrent sont montrées. */
const OUI = "✓";
const NON = "—";
const LIGNES: [string, (o: Offre) => string][] = [
  ["Prix", (o) => (o.prix ? `${prixTxt(o.prix)} / mois` : "0 €")],
  ["Analyses", (o) => (o.parMois ? `${o.analyses} par mois` : `${o.analyses} offerte${o.analyses > 1 ? "s" : ""}`)],
  ["Prix d'une analyse", (o) => { const p = prixParAnalyse(o); return p ? centimes(p) : "Offerte"; }],
  ["Photos analysées par annonce", (o) => (o.photos ? String(o.photos) : NON)],
  ["Prix à proposer et questions au vendeur", (o) => (o.detail !== "simple" ? OUI : NON)],
  ["Marge nette, prix d'offre et plafond", (o) => (o.famille === "benef" ? OUI : NON)],
  ["Historique des rapports", (o) => (o.historique === Infinity ? "Complet" : o.historique > 1 ? `${o.historique} derniers` : "Le dernier")],
  ["Comparateur de rapports", (o) => (o.comparateur ? OUI : NON)],
  ["Recherche Leboncoin sous la cote et alertes", (o) => (o.recherche ? OUI : NON)],
  ["Gestion du parc et marge réelle", (o) => (o.parc ? OUI : NON)],
  ["Messages automatiques aux vendeurs", (o) => (o.messages ? "Compris" : o.id === "pro" ? `+${prixTxt(OFFRES.pro_messages.prix - OFFRES.pro.prix)} / mois, en option` : NON)],
  ["Tableau de bord", (o) => (o.tableauDeBord === "complet" ? "Complet" : o.tableauDeBord === "simple" ? "Simple" : NON)],
  ["Guides inclus", (o) => (o.guide ? OUI : NON)],
];

export function TableauFormules({ ids, className }: { ids: OffreId[]; className?: string }) {
  const offres = ids.map((id) => OFFRES[id]).filter((o) => !o.cachee);
  const lignes = LIGNES.filter(([, f]) => new Set(offres.map(f)).size > 1 || f === LIGNES[0][1]);
  return (
    <section aria-label="Comparer les formules" className={cx("mx-auto max-w-4xl", className)}>
      <h3 className="mb-4 text-center font-display text-lg font-semibold">Comparer ligne par ligne</h3>
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[340px] border-collapse text-sm">
          <caption className="sr-only">Ce que chaque formule comprend</caption>
          <thead>
            <tr className="border-b border-line bg-glass">
              <th scope="col" className="p-3 text-left font-medium text-ink-3">
                <span className="sr-only">Critère</span>
              </th>
              {offres.map((o) => (
                <th key={o.id} scope="col" className={cx("p-3 text-center font-display font-semibold", o.miseEnAvant && "text-o2")}>
                  {o.nom}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map(([l, f]) => (
              <tr key={l} className="border-b border-line last:border-0">
                <th scope="row" className="p-3 text-left font-normal text-ink-2">{l}</th>
                {offres.map((o) => {
                  const v = f(o);
                  return (
                    <td key={o.id} className={cx("num p-3 text-center", v === OUI ? "text-ok" : v === NON ? "text-ink-3" : "text-ink", o.miseEnAvant && "bg-o/5")}>
                      {v === OUI ? <><span aria-hidden="true">✓</span><span className="sr-only">Oui</span></> : v === NON ? <><span aria-hidden="true">—</span><span className="sr-only">Non</span></> : v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
