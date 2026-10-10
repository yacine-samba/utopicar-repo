import type { CSSProperties } from "react";

/* Ce que l'outil répond, joué en 2 secondes : l'annonce se place face au marché, les contrôles tombent, le verdict sort.
   CSS seul (classes « scene », « pas », « jauge », « curseur » dans globals.css), aucune image, aucun script.
   Exemple réel de démonstration, signalé comme tel. Les lecteurs d'écran lisent un résumé en une phrase. */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
// échelle de la jauge : 5 000 € à 9 000 €
const pos = (eur: number) => `${((eur - 5000) / 4000) * 100}%`;

export function PreuveAnimee() {
  return (
    <figure className="apparait mx-auto w-full max-w-md text-left">
      <figcaption className="sr-only">
        Exemple d&apos;analyse : une Renault Clio IV à 7 400 €, au-dessus de la cote de 6 950 €. Moteur fiable, choc de carrosserie de 150 à 700 €, contrôle technique à
        demander. Verdict : à négocier, proposez 6 250 €.
      </figcaption>
      <div className="scene carte relative overflow-hidden p-5 shadow-[0_30px_80px_-40px_rgb(255_90_31/0.55)] sm:p-6" aria-hidden="true">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-line-2 px-2.5 py-0.5 text-xs text-ink-3">Exemple d&apos;analyse</span>
          <span className="flex items-center gap-1.5 text-xs text-ink-3">
            <span className="size-1.5 rounded-full bg-ok" /> 2 s
          </span>
        </div>

        {/* l'annonce */}
        <div className="pas mt-4 flex items-center gap-3" style={d(0.05)}>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-glass">
            <svg viewBox="0 0 24 24" className="size-6 text-ink-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 16.5V12l2-5h12l2 5v4.5M4 16.5h16M4 16.5V19h3v-2.5M17 16.5V19h3v-2.5M7.5 13.5h.01M16.5 13.5h.01" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">Renault Clio IV 0.9 TCe</span>
            <span className="block text-sm text-ink-3">2016 · 98 000 km · Leboncoin</span>
          </span>
          <span className="num font-display text-xl font-semibold">7 400 €</span>
        </div>

        {/* face au marché */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-ink-3">
            <span>Prix du marché</span>
            <span className="num">174 Clio comparables</span>
          </div>
          <div className="relative mt-7 h-2.5 rounded-full bg-glass">
            <span className="jauge absolute inset-y-0 rounded-full bg-ok/45" style={{ left: pos(6600), width: `calc(${pos(7300)} - ${pos(6600)})`, ...d(0.35) }} />
            {/* cote */}
            <span className="pas absolute -top-6 text-xs font-medium text-ok" style={{ left: pos(6950), marginLeft: "-34px", ...d(0.55) }}>
              cote 6 950 €
            </span>
            <span className="pas absolute -top-1 h-[18px] w-0.5 rounded bg-ok" style={{ left: pos(6950), ...d(0.55) }} />
            {/* l'annonce glisse jusqu'à son prix */}
            <span className="curseur absolute -top-[5px] size-5 rounded-full border-[3px] border-bg1 bg-o shadow" style={{ left: pos(7400), marginLeft: "-10px", ...d(0.7), "--depart": "90px" } as CSSProperties} />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-ink-3">
            <span className="num">5 000 €</span>
            <span className="pas font-medium text-o2" style={d(1.3)}>
              450 € au-dessus
            </span>
            <span className="num">9 000 €</span>
          </div>
        </div>

        {/* les contrôles */}
        <ul className="mt-5 grid gap-2 text-sm">
          {(
            [
              ["ok", "✓", "Moteur 0.9 TCe : réputé fiable", 1.1],
              ["warn", "!", "Choc de carrosserie : 150 à 700 €", 1.3],
              ["neutre", "?", "CT de moins de 6 mois : à demander", 1.5],
            ] as const
          ).map(([ton, s, t, delai]) => (
            <li key={t} className="pas flex items-center gap-2.5" style={d(delai)}>
              <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${ton === "ok" ? "bg-ok/20 text-ok" : ton === "warn" ? "bg-warn/20 text-warn" : "bg-glass text-ink-3"}`}>{s}</span>
              <span className="text-ink-2">{t}</span>
            </li>
          ))}
        </ul>

        {/* le verdict */}
        <div className="pas mt-5 flex items-center justify-between gap-3 rounded-2xl border border-o/40 bg-o/10 px-4 py-3" style={d(1.8)}>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-o2">À négocier</span>
            <span className="text-sm text-ink-2">Proposez</span>
          </span>
          <span className="num font-display text-3xl font-semibold">6 250 €</span>
        </div>
      </div>
    </figure>
  );
}
