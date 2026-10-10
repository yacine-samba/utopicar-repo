import type { CSSProperties } from "react";
import { EXEMPLES } from "@/lib/demo";

/* La marge en une image : le prix de revente est une seule barre, qui se découpe sous les yeux en
   achat (orange), frais (jaune) et ce qui reste, la marge (vert). Puis le verdict GO, « à acheter ».
   Une autre voiture que l'accueil (Clio) : une Yaris III, moteur fiable, achetée sous le marché et revendue à sa cote (8 350 €). CSS seul (classes « scene » de globals.css). */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const REVENTE = 8300, ACHAT = 6900, FRAIS = 550;
const MARGE = REVENTE - ACHAT - FRAIS;
const pc = (eur: number) => `${(eur / REVENTE) * 100}%`;
const e = (v: number) => `${v.toLocaleString("fr-FR").replace(/ /g, " ")} €`;

const PARTS = [
  { l: "Achat", v: ACHAT, depart: 0, cls: "bg-o", txt: "text-o3", delai: 0.55 },
  { l: "Frais", v: FRAIS, depart: ACHAT, cls: "bg-[#ffc53d]", txt: "text-[#ffd76e]", delai: 0.85 },
  { l: "Marge", v: MARGE, depart: ACHAT + FRAIS, cls: "bg-[#3ecb7f]", txt: "text-[#7ee2ab]", delai: 1.15 },
];

export function MargeAnimee() {
  return (
    <figure className="arrivee attend mx-auto w-full max-w-[420px]" style={{ "--i": 2 } as CSSProperties}>
      <figcaption className="sr-only">
        Exemple : une Toyota Yaris III revendue {e(REVENTE)}, achetée {e(ACHAT)}, avec {e(FRAIS)} de frais. Il reste {e(MARGE)} de marge nette. Verdict : GO, à acheter.
      </figcaption>
      <div className="scene relative isolate aspect-[4/5] overflow-hidden rounded-[30px] border border-line-2 shadow-[0_40px_100px_-40px_rgb(255_90_31/0.6)]" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- photo d'annonce, servie en local et déjà compressée */}
        <img src={EXEMPLES.yaris.photos[1]} alt="" fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.35)_0%,transparent_25%,transparent_36%,rgb(0_0_0/0.9)_100%)]" />

        <div className="balayage pointer-events-none absolute inset-x-0 top-0 h-[38%] border-b-2 border-o bg-[linear-gradient(180deg,transparent,rgb(255_90_31/0.28))] shadow-[0_6px_24px_rgb(255_90_31/0.55)]" style={d(0.05)} />
        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md">
          <span className="grid">
            <span className="passe col-start-1 row-start-1 flex items-center gap-1.5" style={d(0.05)}>
              <span className="size-1.5 animate-pulse rounded-full bg-o" /> Calcul…
            </span>
            <span className="pas col-start-1 row-start-1 whitespace-nowrap" style={d(1.2)}>
              Yaris III · bien achetée
            </span>
          </span>
        </div>
        <div className="pas absolute right-4 top-4 grid justify-items-center rounded-xl border-2 border-[#3ecb7f] bg-black/45 px-3 py-1 text-[#3ecb7f] backdrop-blur-md" style={d(1.7)}>
          <span className="font-display text-2xl font-bold leading-none tracking-wider">GO</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide">à acheter</span>
        </div>

        <div className="absolute inset-x-4 bottom-4 grid gap-3 text-white">
          {/* le prix de revente, découpé : achat + frais + marge */}
          <div className="rounded-2xl border border-white/15 bg-black/50 p-4 backdrop-blur-md">
            <div className="pas flex items-baseline justify-between text-sm" style={d(0.3)}>
              <span className="text-white/75">Prix de revente</span>
              <b className="num">{e(REVENTE)}</b>
            </div>
            <div className="relative mt-2.5 h-4 overflow-hidden rounded-full bg-white/12">
              {PARTS.map((p) => (
                <span key={p.l} className={`jauge absolute inset-y-0 ${p.cls}`} style={{ left: pc(p.depart), width: pc(p.v), ...d(p.delai) }} />
              ))}
            </div>
            <ul className="mt-2.5 grid grid-cols-3 gap-2 text-xs">
              {PARTS.map((p) => (
                <li key={p.l} className="pas grid" style={d(p.delai + 0.15)}>
                  <span className="flex items-center gap-1.5 text-white/75">
                    <span className={`size-2 rounded-full ${p.cls}`} />
                    {p.l}
                  </span>
                  <b className={`num text-sm ${p.txt}`}>{e(p.v)}</b>
                </li>
              ))}
            </ul>
          </div>

          {/* ce qui reste */}
          <div className="pas flex items-end justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-[#160904]" style={d(1.45)}>
            <span>
              <span className="block text-sm font-semibold text-[#137036]">Marge nette</span>
              <span className="text-xs text-[#160904]/60">ce qui vous reste</span>
            </span>
            <span className="num font-display text-[44px] font-semibold leading-none text-[#137036]">+{e(MARGE)}</span>
          </div>
        </div>
      </div>
    </figure>
  );
}
