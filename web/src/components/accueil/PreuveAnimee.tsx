import type { CSSProperties } from "react";
import { EXEMPLES } from "@/lib/demo";

/* L'outil en action, sans paragraphe : la vraie photo de l'annonce, et par-dessus, en 2 secondes, son prix qui se place
   face au marché puis le verdict. Une douzaine de mots en tout. CSS seul (classes « scene » de globals.css).
   Données : la vraie annonce Clio IV de la démonstration (relevée le 3 octobre 2026). */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const ex = EXEMPLES.clio;
const COTE = ex.lignes[0].v ?? 7550;
const PROPOSER = ex.lignes[3].v ?? 6250;
// échelle de la jauge : 5 500 € à 8 500 €
const pos = (eur: number) => `${((eur - 5500) / 3000) * 100}%`;
const e = (v: number) => `${v.toLocaleString("fr-FR").replace(/ /g, " ")} €`;
const ecart = Math.round(((COTE - ex.prix) / COTE) * 100);

export function PreuveAnimee() {
  return (
    <figure className="arrivee attend mx-auto w-full max-w-[420px]" style={{ "--i": 2 } as CSSProperties}>
      <figcaption className="sr-only">
        Exemple réel : une {ex.titre} à {e(ex.prix)}, {ecart} % sous la cote de {e(COTE)}. Moteur fiable. Verdict : {ex.verdict.toLowerCase()}, proposez {e(PROPOSER)}.
      </figcaption>
      <div className="scene relative isolate aspect-[4/5] overflow-hidden rounded-[30px] border border-line-2 shadow-[0_40px_100px_-40px_rgb(255_90_31/0.6)]" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- photo de l'annonce, servie en local et déjà compressée */}
        <img src={ex.photos[1]} alt="" fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.35)_0%,transparent_28%,transparent_42%,rgb(0_0_0/0.88)_100%)]" />

        {/* l'annonce telle qu'elle est en ligne */}
        <div className="pas absolute left-4 top-4 rounded-2xl border border-white/20 bg-black/45 px-3.5 py-2 text-white backdrop-blur-md" style={d(0.1)}>
          <span className="block text-[11px] uppercase tracking-wider text-white/70">Leboncoin</span>
          <span className="num font-display text-2xl font-semibold leading-none">{e(ex.prix)}</span>
        </div>
        <div className="pas absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[#3ecb7f] px-3 py-1.5 text-sm font-bold text-[#04140a]" style={d(1.35)}>
          ✓ Moteur fiable
        </div>

        <div className="absolute inset-x-4 bottom-4 grid gap-3 text-white">
          {/* le prix face au marché */}
          <div className="pas rounded-2xl border border-white/15 bg-black/45 px-4 pb-3 pt-7 backdrop-blur-md" style={d(0.35)}>
            <div className="relative h-2 rounded-full bg-white/15">
              <span className="jauge absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#3ecb7f,rgb(62_203_127/0.25))]" style={{ width: pos(COTE), ...d(0.45) }} />
              <span className="absolute -top-[22px] text-xs font-semibold text-white/85" style={{ left: pos(COTE), marginLeft: "-30px" }}>
                cote
              </span>
              <span className="absolute -top-1 h-4 w-0.5 rounded bg-white" style={{ left: pos(COTE) }} />
              <span className="curseur absolute -top-[6px] size-5 rounded-full border-[3px] border-white bg-o shadow-[0_0_0_6px_rgb(255_90_31/0.3)]" style={{ left: pos(ex.prix), marginLeft: "-10px", ...d(0.75), "--depart": "-120px" } as CSSProperties} />
            </div>
            <p className="pas mt-2 text-sm font-semibold text-[#7ee2ab]" style={d(1.15)}>
              −{ecart} % sous le marché
            </p>
          </div>

          {/* le verdict */}
          <div className="pas flex items-end justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-[#160904]" style={d(1.7)}>
            <span className="rounded-full bg-[#3ecb7f] px-3 py-1 text-sm font-bold text-[#04140a]">{ex.verdict}</span>
            <span className="text-right">
              <span className="block text-xs font-medium text-[#160904]/60">Proposez</span>
              <span className="num font-display text-[34px] font-semibold leading-none">{e(PROPOSER)}</span>
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
