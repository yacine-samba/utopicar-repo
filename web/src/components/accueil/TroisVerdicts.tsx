/* eslint-disable @next/next/no-img-element -- photos des annonces de démonstration, servies en local et compressées */
import type { CSSProperties } from "react";
import { EXEMPLES, type Exemple } from "@/lib/demo";

/* Trois vraies annonces, trois verdicts différents : l'outil sait aussi dire non. Une photo, deux barres
   (le marché, l'annonce), un verdict en couleur et en mots, une raison courte. Les barres se remplissent à l'écran. */

const e = (v: number) => `${v.toLocaleString("fr-FR").replace(/ /g, " ")} €`;
const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

const TON = {
  ok: { pill: "bg-[#3ecb7f] text-[#04140a]", signe: "✓", barre: "bg-ok" },
  warn: { pill: "bg-[#ffc53d] text-[#1a1300]", signe: "!", barre: "bg-warn" },
  bad: { pill: "bg-[#ff7a7a] text-[#1a0606]", signe: "✕", barre: "bg-bad" },
} as const;

/** La raison en quelques mots, tirée des vrais résultats de l'analyse. */
function raison(x: Exemple) {
  const cote = x.lignes[0].v ?? 0;
  const ecart = x.prix - cote;
  if (x.ton === "bad") return "Moteur à éviter";
  return ecart < 0 ? `${e(-ecart)} sous le marché` : `${e(ecart)} au-dessus du marché`;
}

export function TroisVerdicts() {
  const liste = [EXEMPLES.clio, EXEMPLES.yaris, EXEMPLES.p208];
  return (
    // téléphone : on fait glisser les cartes (une et demie visible) ; à partir de la tablette, trois colonnes
    <ul className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0" aria-label="Trois annonces analysées">
      {liste.map((x, i) => {
        const cote = x.lignes[0].v ?? x.prix;
        const max = Math.max(cote, x.prix);
        const t = TON[x.ton];
        return (
          <li key={x.titre} className="attend w-[78%] shrink-0 snap-start md:w-auto">
            <article className="carte scene flex h-full flex-col overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={x.photos[0]} alt="" loading="lazy" className="size-full object-cover" />
                <span className={`pas absolute left-3 top-3 rounded-full px-3 py-1 text-sm font-bold shadow ${t.pill}`} style={d(0.5 + i * 0.15)}>
                  {t.signe} {x.verdict}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="font-display text-lg font-semibold leading-tight">{x.titre}</h3>
                <dl className="grid gap-2 text-sm">
                  {(
                    [
                      ["Marché", cote, "bg-ink-3/60"],
                      ["Annonce", x.prix, t.barre],
                    ] as const
                  ).map(([l, v, cls], k) => (
                    <div key={l} className="grid grid-cols-[4.2rem_1fr_4.6rem] items-center gap-2">
                      <dt className="text-ink-3">{l}</dt>
                      <dd className="relative h-2 rounded-full bg-glass" aria-hidden="true">
                        <span className={`jauge absolute inset-y-0 left-0 rounded-full ${cls}`} style={{ width: `${(v / max) * 100}%`, ...d(0.15 + k * 0.2 + i * 0.15) }} />
                      </dd>
                      <dd className="num text-right font-semibold">{e(v)}</dd>
                    </div>
                  ))}
                </dl>
                <p className={`mt-auto text-sm font-semibold ${x.ton === "ok" ? "text-ok" : x.ton === "warn" ? "text-warn" : "text-bad"}`}>{raison(x)}</p>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
