"use client";
/* eslint-disable @next/next/no-img-element -- photo de l'annonce de démonstration, servie en local et compressée */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { EXEMPLES, euros, srcSetDemo } from "@/lib/demo";

/* Comment ça marche, en trois actes : un grand mot par écran (Collez, Comparez, Décidez), une phrase, et l'étape jouée
   sur la vraie annonce Clio de la démonstration. Sur tablette et ordinateur, un sélecteur collant en bas de la section
   montre l'acte en cours et mène à l'essai.
   Chaque acte se joue quand il arrive au milieu de l'écran, et se rejoue à chaque passage : la classe « scene » n'est
   posée qu'à ce moment-là (clé changée = scène remontée). Sans JavaScript, en pause ou en mouvement réduit, tout
   s'affiche directement dans son état final. */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const clio = EXEMPLES.clio;
const cote = clio.lignes[0].v ?? clio.prix;
const proposer = clio.lignes[3].v ?? clio.prix;
const LIEN = "leboncoin.fr/ad/voitures/…";

/** Un montant qui monte jusqu'à sa valeur après `apres` secondes (rien à faire si les animations sont coupées). */
function Monte({ valeur, apres = 0 }: { valeur: number; apres?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(valeur);
  useEffect(() => {
    // seulement dans un acte qui se joue
    if (!ref.current?.closest(".scene") || matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-calme")) return;
    let raf = 0;
    const t0 = performance.now() + apres * 1000;
    const pas = (t: number) => {
      const k = Math.max(0, Math.min(1, (t - t0) / 900));
      setV(Math.round(valeur * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(pas);
    };
    raf = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(raf);
  }, [valeur, apres]);
  return <span ref={ref}>{euros(v)}</span>;
}

function Coller() {
  return (
    <div className="carte overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3 text-sm">
        <span className="pas min-w-0 flex-1 truncate rounded-full border border-line-2 bg-champ px-4 py-2 text-ink-2" style={d(0.05)}>
          <span className="tape inline-block whitespace-nowrap" style={d(0.3)}>
            {LIEN}
          </span>
          <span className="clignote-texte ml-0.5 inline-block h-[1.1em] w-px translate-y-[0.2em] bg-o" aria-hidden="true" />
        </span>
        <span className="appui shrink-0 rounded-full bg-o px-4 py-2 font-semibold text-[#160904]">
          Analyser
        </span>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-center">
        <div className="pas relative aspect-[4/3] overflow-hidden rounded-2xl" style={d(1.6)}>
          <img src={clio.photos[0]} srcSet={srcSetDemo(clio.photos[0])} sizes="(max-width: 640px) 90vw, 260px" alt="" loading="lazy" decoding="async" className="zoom-doux size-full object-cover" style={d(1.6)} />
          <span className="balayage absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-o/40 to-transparent" style={d(1.9)} aria-hidden="true" />
        </div>
        <div className="grid gap-1">
          <p className="pas font-display text-lg font-semibold leading-tight" style={d(1.9)}>
            {clio.titre}
          </p>
          <p className="pas num font-display text-2xl font-semibold text-o2" style={d(2.05)}>
            {euros(clio.prix)}
          </p>
          <p className="pas text-sm text-ink-3" style={d(2.2)}>
            {clio.infos}
          </p>
        </div>
      </div>
    </div>
  );
}

function Comparer() {
  const max = Math.max(cote, clio.prix);
  return (
    <div className="carte grid gap-5 p-5 sm:p-6">
      <p className="pas flex items-center gap-2 text-sm text-ink-3" style={d(0.05)}>
        <span className="relative flex size-2" aria-hidden="true">
          <span className="pulse-o absolute inset-0 rounded-full bg-o" />
          <span className="relative size-2 rounded-full bg-o" />
        </span>
        {clio.lignes[0].s}
      </p>
      {(
        [
          ["Cote du marché", cote, "bg-ink-3", 0.25],
          ["Cette annonce", clio.prix, "bg-ok", 0.65],
        ] as const
      ).map(([l, v, c, t]) => (
        <div key={l} className="grid gap-1.5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-ink-2">{l}</span>
            <span className="num font-semibold">
              <Monte valeur={v} apres={t} />
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-line">
            <span className={cx("jauge block h-full rounded-full", c)} style={{ width: `${(v / max) * 100}%`, ...d(t) }} />
          </div>
        </div>
      ))}
      <p className="pas justify-self-start rounded-full bg-ok/15 px-3 py-1 text-sm font-bold text-ok" style={d(1.45)}>
        {euros(cote - clio.prix)} sous la cote
      </p>
      <p className="pas rounded-2xl border border-line bg-creux px-4 py-3 text-sm text-ink-2" style={d(1.6)}>
        {clio.citation.map((c, i) =>
          c.m ? (
            <mark key={i} className="surligne rounded px-0.5 text-ink" style={d(1.9 + i * 0.25)}>
              {c.t}
            </mark>
          ) : (
            <span key={i}>{c.t}</span>
          ),
        )}
      </p>
    </div>
  );
}

function Decider() {
  return (
    <div className="carte grid gap-4 p-5 sm:p-6">
      <p className="pas flex flex-wrap items-center gap-2" style={d(0.1)}>
        <span className="tampon rounded-full bg-[#3ecb7f] px-3 py-1 text-sm font-bold text-[#04140a]" style={d(0.1)}>
          ✓ {clio.verdict}
        </span>
        <span className="text-sm text-ink-3">{clio.phrase}</span>
      </p>
      <div className="pas flex items-baseline justify-between rounded-2xl border border-o/40 bg-o/10 px-4 py-3" style={d(0.5)}>
        <span className="text-sm">{clio.lignes[3].l}</span>
        <span className="num font-display text-2xl font-semibold text-o2">
          <Monte valeur={proposer} apres={0.55} />
        </span>
      </div>
      <div className="grid">
        <span className="passe frappe col-start-1 row-start-1 ml-auto flex w-fit gap-1 rounded-2xl rounded-br-md bg-o/20 px-4 py-3 text-o2" style={d(1.3)} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div className="pas col-start-1 row-start-1 ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-o px-4 py-3 text-sm text-[#160904]" style={d(2.4)}>
          {clio.message}
        </div>
      </div>
      <p className="pas ml-auto text-xs text-ink-3" style={d(2.7)}>
        Premier message rédigé par Utopicar
      </p>
    </div>
  );
}

const ACTES: { id: string; mot: string; texte: ReactNode; Visuel: () => ReactNode }[] = [
  {
    id: "acte-coller",
    mot: "Collez.",
    texte: "Le lien d'une annonce Leboncoin suffit. La Centrale et AutoScout24 : collez le texte de la page.",
    Visuel: Coller,
  },
  {
    id: "acte-comparer",
    mot: "Comparez.",
    texte: "L'annonce face aux voitures comparables réellement en vente : même modèle, à deux ans près, même énergie, kilométrage proche. Et 38 défauts cherchés dans le texte.",
    Visuel: Comparer,
  },
  {
    id: "acte-decider",
    mot: "Décidez.",
    texte: "Un verdict, le prix à proposer et le premier message au vendeur. L'aperçu en 2 secondes, le rapport complet en une minute environ.",
    Visuel: Decider,
  },
];

export function TroisActes() {
  // -1 : aucun acte encore lu (rien ne se joue hors écran)
  const [actif, setActif] = useState(-1);
  // passages : chaque arrivée sur un acte remonte sa scène, qui se rejoue
  const [tour, setTour] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          setActif(refs.current.indexOf(e.target as HTMLElement));
          setTour((t) => t + 1);
        }),
      { rootMargin: "-40% 0px -45% 0px" },
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);
  return (
    // « actes » nomme la frise du défilement de la section : la barre du sélecteur s'y remplit (globals.css)
    <div className="actes relative">
      {ACTES.map(({ id, mot, texte, Visuel }, i) => {
        const joue = actif === i;
        return (
          <article
            key={id}
            id={id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            aria-labelledby={`${id}-t`}
            className="wrap scroll-mt-32 py-12 lg:min-h-[80svh]"
          >
            {/* la clé change à chaque arrivée : la scène repart de zéro */}
            <div key={joue ? `j${tour}` : "repos"} className={cx("grid h-full items-center gap-8 lg:min-h-[inherit] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12", joue ? "scene" : "repos")}>
              <div>
                <p className="pas text-sm font-medium text-o2">
                  <span className="num">0{i + 1}</span> / 03
                </p>
                <h3 id={`${id}-t`} aria-label={mot} className="vue mt-2 font-display text-[clamp(52px,7.2vw,100px)] font-semibold leading-[0.95] tracking-[-0.045em]">
                  <span aria-hidden="true" className="inline-flex overflow-hidden pb-[0.08em]">
                    {[...mot].map((l, k) => (
                      <span key={k} className="lettre inline-block" style={d(0.04 * k)}>
                        {l}
                      </span>
                    ))}
                  </span>
                </h3>
                <p className="pas mt-5 max-w-md text-lg text-ink-2" style={d(0.35)}>
                  {texte}
                </p>
              </div>
              <div className="pas" style={d(0.15)}>
                <Visuel />
              </div>
            </div>
          </article>
        );
      })}
      {/* sélecteur collant : il suit le bas de l'écran tant que la section est lue (tablette et ordinateur ; la barre d'essai fait ce rôle sur téléphone) */}
      <div className="sticky bottom-5 z-20 mt-4 hidden justify-center sm:flex">
        <nav aria-label="Les trois étapes" className="relative flex items-center gap-1 overflow-hidden rounded-full border border-line-2 bg-bg0/80 p-1.5 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.6)] backdrop-blur-md">
          <span className="actes-barre absolute inset-x-0 bottom-0 h-0.5 bg-o/70" aria-hidden="true" />
          {ACTES.map(({ id, mot }, i) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={actif === i ? "step" : undefined}
              className={cx("inline-flex min-h-10 items-center rounded-full px-4 text-sm no-underline transition", actif === i ? "bg-glass font-semibold text-ink ring-1 ring-line-2" : "text-ink-3 hover:text-ink")}
            >
              {mot.replace(".", "")}
            </a>
          ))}
          <a href="#essai" className="btn btn-o btn-sm ml-1 whitespace-nowrap">
            Analyser une annonce
          </a>
        </nav>
      </div>
    </div>
  );
}
