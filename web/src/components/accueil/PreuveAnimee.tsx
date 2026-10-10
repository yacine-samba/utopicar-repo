import type { CSSProperties } from "react";
import { EXEMPLES } from "@/lib/demo";

/* L'outil en action sur une vraie annonce, lisible sans explication :
   1. un balayage passe sur la photo (« Analyse… »), puis « 174 Clio comparées » ;
   2. deux barres côte à côte, le prix du marché puis celui de l'annonce, l'écart entre les deux hachuré en vert ;
   3. le verdict dit pourquoi (850 € sous le marché) et le prix à proposer.
   CSS seul (classes « scene », « balayage », « passe », « pas », « jauge » de globals.css).
   Données : la vraie annonce Clio IV de la démonstration (relevée le 3 octobre 2026). */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const ex = EXEMPLES.clio;
const COTE = ex.lignes[0].v ?? 7550;
const PROPOSER = ex.lignes[3].v ?? 6250;
const COMPAREES = Number(/(\d+)/.exec(ex.lignes[0].s)?.[1] ?? 174);
// les barres : le prix du marché fait toute la largeur
const pc = (eur: number) => `${(Math.min(eur, COTE) / COTE) * 100}%`;
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
          {/* 2. le prix face au marché : deux barres côte à côte, l'écart entre les deux en vert */}
          <div className="pas grid gap-2.5 rounded-2xl border border-white/15 bg-black/50 p-4 text-sm backdrop-blur-md" style={d(1.0)}>
            <div className="grid grid-cols-[4.5rem_1fr_4.2rem] items-center gap-2.5">
              <span className="text-white/75">Marché</span>
              <span className="relative h-2.5 rounded-full bg-white/10">
                <span className="jauge absolute inset-0 rounded-full bg-white/80" style={d(1.1)} />
              </span>
              <b className="num text-right">{e(COTE)}</b>
            </div>
            <div className="grid grid-cols-[4.5rem_1fr_4.2rem] items-center gap-2.5">
              <span className="text-white/75">Annonce</span>
              <span className="relative h-2.5 rounded-full bg-white/10">
                <span className="jauge absolute inset-y-0 left-0 rounded-full bg-o" style={{ width: pc(ex.prix), ...d(1.3) }} />
                {/* l'écart : ce que l'annonce coûte de moins que le marché */}
                <span className="pas absolute inset-y-0 right-0 rounded-r-full bg-[repeating-linear-gradient(135deg,#3ecb7f_0_3px,transparent_3px_6px)]" style={{ left: pc(ex.prix), ...d(1.6) }} />
              </span>
              <b className="num text-right text-o3">{e(ex.prix)}</b>
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
