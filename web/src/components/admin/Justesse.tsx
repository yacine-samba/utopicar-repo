import type { Justesse } from "@/lib/admin";

/* Administration › Justesse : l'analyse a-t-elle raison ? Annonces disparues de Leboncoin (vendues ou retirées) selon leur
   position face à la cote, couverture de la cote, verdicts rendus, retours des utilisateurs. */
export function JustesseAnalyse({ j }: { j: Justesse | null }) {
  if (!j)
    return (
      <section className="carte p-6">
        <h2 className="font-display text-xl font-semibold">Justesse de l&apos;analyse</h2>
        <p className="mt-2 text-sm text-ink-3">Appliquez la migration 20261010120000_analyse_2027.sql pour mesurer la justesse.</p>
      </section>
    );
  const r = j.rapports;
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : "—");
  return (
    <section className="carte grid gap-5 p-6" aria-labelledby="adm-justesse">
      <div>
        <h2 id="adm-justesse" className="font-display text-xl font-semibold">Justesse de l&apos;analyse</h2>
        <p className="mt-1 text-sm text-ink-3">
          Une annonce bien placée face à la cote doit partir plus vite. Mesuré sur les annonces disparues de Leboncoin (vendues ou retirées) de la base du marché ; {j.prix_vus.toLocaleString("fr-FR")} prix suivis.
        </p>
      </div>
      {j.tranches?.length ? (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-3">
              <tr className="border-b border-line">
                {["Position face à la cote", "Annonces", "Disparues", "Jours en ligne (médiane)", "Parties en 15 jours"].map((t) => (
                  <th key={t} scope="col" className="px-3 py-2 font-medium">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {j.tranches.map((x) => (
                <tr key={x.t} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">{x.l}</td>
                  <td className="num px-3 py-2">{x.annonces.toLocaleString("fr-FR")}</td>
                  <td className="num px-3 py-2">{x.disparues.toLocaleString("fr-FR")}</td>
                  <td className="num px-3 py-2">{x.jours_median ?? "—"}</td>
                  <td className="num px-3 py-2">{x.pct_15j != null ? `${x.pct_15j} %` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-ink-3">Pas encore assez d&apos;annonces disparues pour mesurer.</p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line p-4">
          <p className="text-xs text-ink-3">Analyses sans cote du marché</p>
          <p className="num font-display text-2xl font-semibold">{pct(r.sans_cote, r.total)}</p>
          <p className="text-xs text-ink-3">{r.sans_cote} sur {r.total} · à faire baisser en collectant les modèles manquants</p>
        </div>
        <div className="rounded-2xl border border-line p-4">
          <p className="text-xs text-ink-3">Analyses, 30 derniers jours</p>
          <p className="num font-display text-2xl font-semibold">{r.trente_jours}</p>
          <p className="text-xs text-ink-3">{r.avec_bilan} au total avec le nouveau bilan</p>
        </div>
        <div className="rounded-2xl border border-line p-4">
          <p className="text-xs text-ink-3">Verdicts, 90 derniers jours</p>
          <ul className="mt-1 grid gap-0.5 text-sm">
            {Object.entries(j.verdicts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([v, n]) => (
              <li key={v} className="flex justify-between gap-2"><span className="truncate text-ink-2">{v}</span><span className="num">{n}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Retours « ce chiffre est faux » ({j.retours.length})</h3>
        {j.retours.length ? (
          <ul className="grid gap-2 text-sm">
            {j.retours.slice(0, 20).map((x, i) => (
              <li key={i} className="rounded-xl border border-line p-3">
                <span className="text-ink-3">{new Date(x.le).toLocaleDateString("fr-FR")} · {x.champ}</span>
                <span className="block">
                  Outil : <b>{x.outil ?? "—"}</b> · Juste : <b>{x.juste ?? "—"}</b>
                </span>
                {x.commentaire && <span className="block text-ink-2">{x.commentaire}</span>}
                {x.rapport && <span className="block text-xs text-ink-3">rapport {x.rapport}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-3">Aucun retour pour l&apos;instant.</p>
        )}
      </div>
    </section>
  );
}
