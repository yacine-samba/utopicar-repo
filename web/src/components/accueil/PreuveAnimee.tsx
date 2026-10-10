import type { CSSProperties } from "react";
import { EXEMPLES } from "@/lib/demo";

/* L'outil en action sur une vraie annonce, lisible sans explication :
   1. un balayage passe sur la photo (« Analyse… »), puis « 174 Clio comparées » ;
   2. une jauge « moins cher → plus cher » : le prix du marché d'un côté, le prix demandé glisse à sa place ;
   3. le verdict dit pourquoi (850 € sous le marché) et le prix à proposer.
   CSS seul (classes « scene », « balayage », « passe », « pas », « curseur » de globals.css).
   Données : la vraie annonce Clio IV de la démonstration (relevée le 3 octobre 2026). */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const ex = EXEMPLES.clio;
const COTE = ex.lignes[0].v ?? 7550;
const PROPOSER = ex.lignes[3].v ?? 6250;
const COMPAREES = Number(/(\d+)/.exec(ex.lignes[0].s)?.[1] ?? 174);
// échelle de la jauge : 5 500 € à 8 500 €
const pos = (eur: number) => `${((eur - 5500) / 3000) * 100}%`;
const e = (v: number) => `${v.toLocaleString("fr-FR").replace(/ /g, " ")} €`;

export function PreuveAnimee() {
  return (
    <figure className="arrivee attend mx-auto w-full max-w-[420px]" style={{ "--i": 2 } as CSSProperties}>
      <figcaption className="sr-only">
        Exemple réel : une {ex.titre} à {e(ex.prix)} sur Leboncoin, comparée à {COMPAREES} annonces. Prix du marché : {e(COTE)}, soit {e(COTE - ex.prix)} de moins. Verdict : {ex.verdict.toLowerCase()}, proposez {e(PROPOSER)}.
      </figcaption>
      <div className="scene relative isolate aspect-[4/5] overflow-hidden rounded-[30px] border border-line-2 shadow-[0_40px_100px_-40px_rgb(255_90_31/0.6)]" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- photo de l'annonce, servie en local et déjà compressée */}
        <img src={ex.photos[1]} alt="" fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.4)_0%,transparent_26%,transparent_38%,rgb(0_0_0/0.9)_100%)]" />

        {/* 1. le balayage d'analyse */}
        <div className="balayage pointer-events-none absolute inset-x-0 top-0 h-[38%] border-b-2 border-o bg-[linear-gradient(180deg,transparent,rgb(255_90_31/0.28))] shadow-[0_6px_24px_rgb(255_90_31/0.55)]" style={d(0.15)} />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 py-1.5 pl-2 pr-3 text-sm font-medium text-white backdrop-blur-md">
          <span className="grid size-5 place-items-center rounded-full bg-white text-[9px] font-bold text-black">lbc</span>
          <span className="relative grid">
            <span className="passe col-start-1 row-start-1 flex items-center gap-1.5" style={d(0.1)}>
              <span className="size-1.5 animate-pulse rounded-full bg-o" /> Analyse…
            </span>
            <span className="pas col-start-1 row-start-1 whitespace-nowrap" style={d(1.3)}>
              {COMPAREES} Clio comparées
            </span>
          </span>
        </div>

        <div className="absolute inset-x-4 bottom-4 grid gap-3 text-white">
          {/* 2. le prix face au marché, avec des repères écrits en clair */}
          <div className="pas rounded-2xl border border-white/15 bg-black/50 px-4 pb-3 pt-3 backdrop-blur-md" style={d(1.0)}>
            <div className="relative h-11">
              {/* prix demandé : l'étiquette suit le point */}
              <span className="curseur absolute top-0 grid w-[88px] justify-items-center" style={{ left: pos(ex.prix), marginLeft: "-44px", ...d(1.25), "--depart": "-110px" } as CSSProperties}>
                <span className="num rounded-md bg-o px-1.5 py-0.5 text-xs font-bold text-[#160904]">{e(ex.prix)}</span>
                <span className="mt-0.5 h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-o" />
              </span>
              <div className="absolute inset-x-0 bottom-1 h-2 rounded-full bg-[linear-gradient(90deg,#3ecb7f,#ffc53d_55%,#ff7a7a)] opacity-90" />
              {/* prix du marché */}
              <span className="absolute bottom-0 h-4 w-[3px] rounded bg-white shadow" style={{ left: pos(COTE), marginLeft: "-1.5px" }} />
            </div>
            <div className="relative mt-1 flex h-4 justify-between text-[11px] text-white/65">
              <span>moins cher</span>
              {/* l'étiquette du marché sous son repère */}
              <span className="absolute w-24 text-center font-medium text-white" style={{ left: pos(COTE), marginLeft: "-48px" }}>
                marché <b className="num">{e(COTE)}</b>
              </span>
              <span>plus cher</span>
            </div>
          </div>

          {/* 3. le verdict, et pourquoi */}
          <div className="pas flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-[#160904]" style={d(1.9)}>
            <span className="grid gap-1">
              <span className="w-fit rounded-full bg-[#3ecb7f] px-2.5 py-0.5 text-sm font-bold text-[#04140a]">✓ {ex.verdict}</span>
              <span className="text-xs font-medium text-[#137036]">{e(COTE - ex.prix)} sous le marché</span>
            </span>
            <span className="text-right">
              <span className="block text-xs font-medium text-[#160904]/60">Proposez</span>
              <span className="num font-display text-[32px] font-semibold leading-none">{e(PROPOSER)}</span>
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
