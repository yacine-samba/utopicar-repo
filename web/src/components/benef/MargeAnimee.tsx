import type { CSSProperties } from "react";

/* La marge nette qui se calcule sous les yeux, en 2 secondes : revente, moins l'achat, moins les frais, reste la marge.
   Mêmes chiffres que le premier scénario du calculateur (Clio IV bien achetée). CSS seul (classes « scene » de globals.css). */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const REVENTE = 6300;
const largeur = (eur: number) => `${(eur / REVENTE) * 100}%`;

export function MargeAnimee() {
  return (
    <figure className="apparait mx-auto w-full max-w-md text-left">
      <figcaption className="sr-only">
        Exemple : une Clio IV achetée 5 000 €, 630 € de frais, revendue 6 300 €. Marge nette : 670 €. Verdict GO, prix d&apos;offre 4 700 €, à ne pas dépasser : 5 000 €.
      </figcaption>
      <div className="scene carte relative overflow-hidden p-5 shadow-[0_30px_80px_-40px_rgb(255_90_31/0.55)] sm:p-6" aria-hidden="true">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-line-2 px-2.5 py-0.5 text-xs text-ink-3">Exemple · Clio IV 1.5 dCi</span>
          <span className="pas rounded-full border border-ok/50 bg-ok/15 px-2.5 py-0.5 text-xs font-bold text-ok" style={d(1.7)}>
            GO
          </span>
        </div>

        <ul className="mt-5 grid gap-3.5 text-sm">
          {(
            [
              ["Revente réaliste", REVENTE, "bg-ink-3/50", "", 0.1],
              ["Prix d'achat", 5000, "bg-o", "−", 0.45],
              ["Frais : carte grise, CT, préparation", 630, "bg-warn", "−", 0.8],
            ] as const
          ).map(([l, v, cls, signe, delai], i) => (
            <li key={l} className="grid gap-1.5">
              <span className="pas flex justify-between gap-3" style={d(delai)}>
                <span className="text-ink-2">{l}</span>
                <b className="num">
                  {signe}
                  {v.toLocaleString("fr-FR")} €
                </b>
              </span>
              <span className="relative h-2.5 rounded-full bg-glass">
                {/* l'achat part de la gauche, les frais se posent juste après : on voit ce qu'il reste à droite */}
                <span
                  className={`jauge absolute inset-y-0 rounded-full ${cls}`}
                  style={{ left: i === 2 ? largeur(5000) : 0, width: largeur(v), ...d(delai + 0.1) }}
                />
              </span>
            </li>
          ))}
        </ul>

        <div className="pas mt-5 flex items-center justify-between gap-3 rounded-2xl border border-ok/40 bg-ok/10 px-4 py-3" style={d(1.3)}>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-ok">Marge nette</span>
            <span className="text-sm text-ink-2">ce qui vous reste</span>
          </span>
          <span className="num font-display text-3xl font-semibold text-ok">+670 €</span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="pas rounded-xl border border-line px-3 py-2" style={d(1.9)}>
            <dt className="text-xs text-ink-3">Prix d&apos;offre</dt>
            <dd className="num font-display text-lg font-semibold">4 700 €</dd>
          </div>
          <div className="pas rounded-xl border border-line px-3 py-2" style={d(2.05)}>
            <dt className="text-xs text-ink-3">À ne pas dépasser</dt>
            <dd className="num font-display text-lg font-semibold">5 000 €</dd>
          </div>
        </dl>
      </div>
    </figure>
  );
}
