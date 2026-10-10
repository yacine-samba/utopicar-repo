import type { CSSProperties } from "react";
import { EXEMPLES } from "@/lib/demo";

/* La marge, sans paragraphe : une vraie photo, et par-dessus, en 2 secondes, revente − achat − frais = la marge, en très grand.
   Mêmes chiffres que le premier scénario du calculateur. CSS seul (classes « scene » de globals.css). */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const REVENTE = 6300, ACHAT = 5000, FRAIS = 630;
const MARGE = REVENTE - ACHAT - FRAIS;
const pc = (eur: number) => `${(eur / REVENTE) * 100}%`;
const e = (v: number) => `${v.toLocaleString("fr-FR").replace(/ /g, " ")} €`;

export function MargeAnimee() {
  return (
    <figure className="arrivee attend mx-auto w-full max-w-[420px]" style={{ "--i": 2 } as CSSProperties}>
      <figcaption className="sr-only">
        Exemple : une citadine achetée {e(ACHAT)}, {e(FRAIS)} de frais, revendue {e(REVENTE)}. Marge nette : {e(MARGE)}. Verdict : GO.
      </figcaption>
      <div className="scene relative isolate aspect-[4/5] overflow-hidden rounded-[30px] border border-line-2 shadow-[0_40px_100px_-40px_rgb(255_90_31/0.6)]" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- photo d'annonce, servie en local et déjà compressée */}
        <img src={EXEMPLES.yaris.photos[0]} alt="" fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.3)_0%,transparent_25%,transparent_35%,rgb(0_0_0/0.9)_100%)]" />

        <div className="pas absolute right-4 top-4 rotate-0 rounded-xl border-2 border-[#3ecb7f] bg-black/40 px-3 py-1 font-display text-2xl font-bold tracking-wider text-[#3ecb7f] backdrop-blur-md" style={d(1.6)}>
          GO
        </div>

        <div className="absolute inset-x-4 bottom-4 grid gap-3 text-white">
          {/* revente, achat, frais : trois barres, ce qui reste à droite est la marge */}
          <ul className="grid gap-2.5 rounded-2xl border border-white/15 bg-black/45 p-4 text-sm backdrop-blur-md">
            {(
              [
                ["Revente", REVENTE, 0, "bg-white/70", 0.15],
                ["Achat", ACHAT, 0, "bg-o", 0.5],
                ["Frais", FRAIS, ACHAT, "bg-[#ffc53d]", 0.85],
              ] as const
            ).map(([l, v, depart, cls, delai]) => (
              <li key={l} className="grid grid-cols-[4.2rem_1fr_auto] items-center gap-3">
                <span className="pas text-white/75" style={d(delai)}>{l}</span>
                <span className="relative h-2 rounded-full bg-white/12">
                  <span className={`jauge absolute inset-y-0 rounded-full ${cls}`} style={{ left: pc(depart), width: pc(v), ...d(delai + 0.05) }} />
                </span>
                <b className="pas num w-16 text-right" style={d(delai)}>{l === "Revente" ? "" : "−"}{e(v)}</b>
              </li>
            ))}
          </ul>

          {/* ce qui reste */}
          <div className="pas flex items-end justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-[#160904]" style={d(1.25)}>
            <span className="text-sm font-semibold text-[#137036]">Marge nette</span>
            <span className="num font-display text-[44px] font-semibold leading-none text-[#137036]">+{e(MARGE)}</span>
          </div>
        </div>
      </div>
    </figure>
  );
}
