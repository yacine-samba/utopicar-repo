"use client";
/* eslint-disable @next/next/no-img-element -- photo de l'annonce de démonstration, servie en local et compressée */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { EXEMPLES, euros, srcSetDemo } from "@/lib/demo";

/* Comment ça marche, en trois actes : un grand mot par écran (Collez, Comparez, Décidez), une phrase, et l'étape jouée
   sur la vraie annonce Clio de la démonstration. Sur tablette et ordinateur, un sélecteur collant en bas de la section
   montre l'acte en cours et mène à l'essai. Les mots grandissent au défilement en CSS natif (classe « vue »). */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;
const clio = EXEMPLES.clio;
const cote = clio.lignes[0].v ?? clio.prix;
const proposer = clio.lignes[3].v ?? clio.prix;

function Coller() {
  return (
    <div className="carte scene overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3 text-sm">
        <span className="pas min-w-0 flex-1 truncate rounded-full border border-line-2 bg-champ px-4 py-2 text-ink-3" style={d(0.1)}>
          leboncoin.fr/ad/voitures/…
        </span>
        <span className="pas shrink-0 rounded-full bg-o px-4 py-2 font-semibold text-[#160904]" style={d(0.4)}>
          Analyser
        </span>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-center">
        <div className="pas relative aspect-[4/3] overflow-hidden rounded-2xl" style={d(0.6)}>
          <img src={clio.photos[0]} srcSet={srcSetDemo(clio.photos[0])} sizes="(max-width: 640px) 90vw, 260px" alt="" loading="lazy" decoding="async" className="size-full object-cover" />
          <span className="balayage absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-o/30 to-transparent" style={d(0.9)} aria-hidden="true" />
        </div>
        <div className="grid gap-1">
          <p className="pas font-display text-lg font-semibold leading-tight" style={d(0.8)}>
            {clio.titre}
          </p>
          <p className="pas num font-display text-2xl font-semibold text-o2" style={d(0.9)}>
            {euros(clio.prix)}
          </p>
          <p className="pas text-sm text-ink-3" style={d(1)}>
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
    <div className="carte scene grid gap-5 p-5 sm:p-6">
      <p className="pas text-sm text-ink-3" style={d(0.1)}>
        {clio.lignes[0].s}
      </p>
      {(
        [
          ["Cote du marché", cote, "bg-ink-3"],
          ["Cette annonce", clio.prix, "bg-ok"],
        ] as const
      ).map(([l, v, c], i) => (
        <div key={l} className="grid gap-1.5">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-ink-2">{l}</span>
            <span className="num font-semibold">{euros(v)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-line">
            <span className={cx("jauge block h-full rounded-full", c)} style={{ width: `${(v / max) * 100}%`, ...d(0.3 + i * 0.3) }} />
          </div>
        </div>
      ))}
      <p className="pas rounded-2xl border border-line bg-creux px-4 py-3 text-sm text-ink-2" style={d(1)}>
        {clio.citation.map((c, i) =>
          c.m ? (
            <mark key={i} className="surligne rounded px-0.5 text-ink" style={d(1.3)}>
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
    <div className="carte scene grid gap-4 p-5 sm:p-6">
      <p className="pas flex flex-wrap items-center gap-2" style={d(0.1)}>
        <span className="rounded-full bg-[#3ecb7f] px-3 py-1 text-sm font-bold text-[#04140a]">✓ {clio.verdict}</span>
        <span className="text-sm text-ink-3">{clio.phrase}</span>
      </p>
      <div className="pas flex items-baseline justify-between rounded-2xl border border-o/40 bg-o/10 px-4 py-3" style={d(0.4)}>
        <span className="text-sm">{clio.lignes[3].l}</span>
        <span className="num font-display text-2xl font-semibold text-o2">{euros(proposer)}</span>
      </div>
      <div className="pas ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-o px-4 py-3 text-sm text-[#160904]" style={d(0.7)}>
        {clio.message}
      </div>
      <p className="pas ml-auto text-xs text-ink-3" style={d(0.9)}>
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
  const [actif, setActif] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) setActif(refs.current.indexOf(e.target as HTMLElement));
        }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);
  return (
    // « actes » nomme la frise du défilement de la section : la barre du sélecteur s'y remplit (globals.css)
    <div className="actes relative">
      {ACTES.map(({ id, mot, texte, Visuel }, i) => (
        <article
          key={id}
          id={id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          aria-labelledby={`${id}-t`}
          className="wrap grid scroll-mt-32 items-center gap-8 py-12 lg:min-h-[80svh] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12"
        >
          <div>
            <p className="text-sm font-medium text-o2">
              <span className="num">0{i + 1}</span> / 03
            </p>
            <h3 id={`${id}-t`} className="vue mt-2 font-display text-[clamp(52px,7.2vw,100px)] font-semibold leading-[0.9] tracking-[-0.045em]">
              {mot}
            </h3>
            <p className="mt-5 max-w-md text-lg text-ink-2">{texte}</p>
          </div>
          <div className="attend">
            <Visuel />
          </div>
        </article>
      ))}
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
