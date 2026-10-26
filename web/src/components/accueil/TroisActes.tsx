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

/** Une ligne « lue dans l'annonce », qui arrive avec sa coche. */
function Lu({ l, v, t }: { l: string; v: ReactNode; t: number }) {
  return (
    <div className="pas flex items-baseline justify-between gap-3 border-b border-line py-2 text-sm" style={d(t)}>
      <dt className="flex items-center gap-2 text-ink-3">
        <span className="tampon grid size-4 place-items-center rounded-full bg-ok/15 text-[10px] font-bold text-ok" style={d(t + 0.1)} aria-hidden="true">
          ✓
        </span>
        {l}
      </dt>
      <dd className="num text-right font-medium">{v}</dd>
    </div>
  );
}

function Coller() {
  const [annee, km, energie, boite] = clio.infos.split(" · ");
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-7">
      <div className="grid content-start gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="pas min-w-0 flex-1 truncate rounded-full border border-line-2 bg-champ px-4 py-2.5 text-ink-2" style={d(0.05)}>
            <span className="tape inline-block whitespace-nowrap" style={d(0.3)}>
              {LIEN}
            </span>
            <span className="clignote-texte ml-0.5 inline-block h-[1.1em] w-px translate-y-[0.2em] bg-o" aria-hidden="true" />
          </span>
          <span className="appui shrink-0 rounded-full bg-o px-5 py-2.5 font-semibold text-[#160904]">Analyser</span>
        </div>
        <div className="pas relative aspect-[16/10] overflow-hidden rounded-2xl" style={d(1.5)}>
          <img src={clio.photos[0]} srcSet={srcSetDemo(clio.photos[0])} sizes="(max-width: 1024px) 90vw, 460px" alt="" loading="lazy" decoding="async" className="zoom-doux size-full object-cover" style={d(1.5)} />
          <span className="balayage absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-o/40 to-transparent" style={d(1.8)} aria-hidden="true" />
          <span className="pas absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur" style={d(2.2)}>
            {clio.nbPhotos} photos importées
          </span>
        </div>
      </div>
      <div>
        <p className="pas mb-1 text-xs font-medium uppercase tracking-wider text-o2" style={d(1.7)}>
          Lu dans l&apos;annonce
        </p>
        <dl>
          <Lu l="Modèle" v={clio.titre} t={1.85} />
          <Lu l="Prix" v={<span className="font-display text-base font-semibold text-o2">{euros(clio.prix)}</span>} t={2} />
          <Lu l="Année" v={annee} t={2.15} />
          <Lu l="Kilométrage" v={km} t={2.3} />
          <Lu l="Énergie et boîte" v={`${energie} · ${boite}`} t={2.45} />
          <Lu l="Vendeur" v={clio.lieu} t={2.6} />
        </dl>
      </div>
    </div>
  );
}

function Comparer() {
  const max = Math.max(cote, clio.prix);
  const defaut = clio.lignes[1];
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="grid content-start gap-5">
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
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-2">{l}</span>
              <span className="num font-display text-xl font-semibold">
                <Monte valeur={v} apres={t} />
              </span>
            </div>
            <div className="h-3.5 overflow-hidden rounded-full bg-line">
              <span className={cx("jauge block h-full rounded-full", c)} style={{ width: `${(v / max) * 100}%`, ...d(t) }} />
            </div>
          </div>
        ))}
        <p className="tampon justify-self-start rounded-full bg-ok/15 px-3.5 py-1.5 text-sm font-bold text-ok" style={d(1.45)}>
          {euros(cote - clio.prix)} sous la cote
        </p>
      </div>
      <div className="grid content-start gap-3">
        <p className="pas text-xs font-medium uppercase tracking-wider text-o2" style={d(1.5)}>
          Lu dans le texte
        </p>
        <p className="pas rounded-2xl border border-line bg-creux px-4 py-3 text-sm leading-relaxed text-ink-2" style={d(1.6)}>
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
        <div className="pas flex items-baseline justify-between gap-3 rounded-2xl border border-bad/30 bg-bad/10 px-4 py-3" style={d(2.6)}>
          <span className="min-w-0">
            <span className="block text-sm font-medium">{defaut.l}</span>
            <span className="block text-xs text-ink-3">{defaut.s}</span>
          </span>
          <span className="num shrink-0 font-display text-lg font-semibold text-bad">
            {defaut.avant}
            {euros(defaut.v ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Decider() {
  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="grid content-start gap-4">
        <p className="pas flex flex-wrap items-center gap-2" style={d(0.1)}>
          <span className="tampon rounded-full bg-[#3ecb7f] px-3.5 py-1.5 text-base font-bold text-[#04140a]" style={d(0.1)}>
            ✓ {clio.verdict}
          </span>
        </p>
        <p className="pas text-sm text-ink-2" style={d(0.3)}>
          {clio.phrase}
        </p>
        <dl className="grid">
          {clio.lignes.map((x, i) => {
            const cle = x.sens === "cle";
            return (
              <div key={x.l} className={cx("pas flex items-baseline justify-between gap-3 py-2", cle ? "mt-1 rounded-2xl border border-o/40 bg-o/10 px-4 py-3" : "border-b border-line")} style={d(0.45 + i * 0.15)}>
                <dt className={cx("text-sm", cle ? "font-medium" : "text-ink-2")}>{x.l}</dt>
                <dd className={cx("num font-semibold", cle ? "font-display text-2xl text-o2" : x.sens === "up" ? "text-bad" : x.sens === "dn" ? "text-ok" : "")}>
                  {x.avant}
                  {cle ? <Monte valeur={x.v ?? 0} apres={0.95} /> : euros(x.v ?? 0)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
      <div className="grid content-start gap-2">
        <p className="pas text-xs font-medium uppercase tracking-wider text-o2" style={d(1.2)}>
          Premier message au vendeur
        </p>
        <div className="grid">
          <span className="passe frappe col-start-1 row-start-1 ml-auto flex w-fit gap-1 rounded-2xl rounded-br-md bg-o/20 px-4 py-3 text-o2" style={d(1.3)} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <div className="pas col-start-1 row-start-1 ml-auto max-w-[92%] rounded-2xl rounded-br-md bg-o px-4 py-3 text-sm text-[#160904]" style={d(2.4)}>
            {clio.message}
          </div>
        </div>
        <p className="pas ml-auto text-xs text-ink-3" style={d(2.7)}>
          Rédigé par Utopicar, prêt à copier
        </p>
      </div>
    </div>
  );
}

const ACTES: { id: string; mot: string; titre: string; texte: ReactNode; Visuel: () => ReactNode }[] = [
  {
    id: "acte-coller",
    mot: "Collez.",
    titre: "Collez l'annonce",
    texte: "Le lien d'une annonce Leboncoin suffit. La Centrale et AutoScout24 : collez le texte de la page.",
    Visuel: Coller,
  },
  {
    id: "acte-comparer",
    mot: "Comparez.",
    titre: "Comparée au marché",
    texte: "L'annonce face aux voitures comparables réellement en vente : même modèle, à deux ans près, même énergie, kilométrage proche. Et 38 défauts cherchés dans le texte.",
    Visuel: Comparer,
  },
  {
    id: "acte-decider",
    mot: "Décidez.",
    titre: "Verdict et prix",
    texte: "Un verdict, le prix à proposer et le premier message au vendeur. L'aperçu en 2 secondes, le rapport complet en une minute environ.",
    Visuel: Decider,
  },
];

export function TroisActes() {
  // -1 : aucun acte encore lu (rien ne se joue hors écran)
  const [actif, setActif] = useState(-1);
  // passages : chaque arrivée sur un acte remonte sa scène, qui se rejoue
  const [tour, setTour] = useState(0);
  // mouvement réduit ou animations en pause : les actes restent dans leur état final, sans jamais se remonter
  const [anime, setAnime] = useState(false);
  const refs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const calme = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-calme");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique de la préférence au montage
    setAnime(!calme());
    const suivre = (e: Event) => setAnime(!(e as CustomEvent<boolean>).detail && !matchMedia("(prefers-reduced-motion: reduce)").matches);
    addEventListener("utp-calme", suivre);
    if (!("IntersectionObserver" in window)) return () => removeEventListener("utp-calme", suivre);
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
    return () => {
      io.disconnect();
      removeEventListener("utp-calme", suivre);
    };
  }, []);
  return (
    // « actes » nomme la frise du défilement de la section : la barre du sélecteur s'y remplit (globals.css)
    <div className="actes relative overflow-x-clip">
      {ACTES.map(({ id, mot, titre, texte, Visuel }, i) => {
        const joue = anime && actif === i;
        return (
          <article
            key={id}
            id={id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            aria-labelledby={`${id}-t`}
            className="wrap scroll-mt-32 py-8 lg:py-12"
          >
            {/* la clé change à chaque arrivée : la scène repart de zéro */}
            <div key={joue ? `j${tour}` : "repos"} className={joue ? "scene" : "repos"}>
              {/* le grand mot déborde sur le haut de la fenêtre, à gauche puis à droite, comme une affiche */}
              <h3
                id={`${id}-t`}
                aria-label={mot}
                className={cx(
                  "vue relative z-10 -mb-[0.2em] font-display text-[clamp(56px,13vw,180px)] font-medium leading-[0.85] tracking-[-0.05em]",
                  i % 2 === 1 && "text-right",
                )}
              >
                <span aria-hidden="true" className="inline-flex overflow-hidden pb-[0.06em]">
                  {[...mot].map((l, k) => (
                    <span key={k} className="lettre inline-block" style={d(0.04 * k)}>
                      {l}
                    </span>
                  ))}
                </span>
              </h3>
              <div className="grid gap-4 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:items-end lg:gap-6">
                {/* la fenêtre de l'app, avec deux cartes empilées derrière pour la profondeur */}
                <div className="pas relative lg:order-2" style={d(0.1)}>
                  <span className="absolute inset-y-6 -right-3 left-6 rounded-[26px] border border-line bg-panel/70 sm:-right-5 lg:-right-7" aria-hidden="true" />
                  <span className="absolute inset-y-12 -right-6 left-12 rounded-[26px] border border-line bg-panel/40 sm:-right-10 lg:-right-14" aria-hidden="true" />
                  <div className="carte relative overflow-hidden shadow-[0_30px_80px_-40px_rgb(0_0_0/0.45)]">
                    <div className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-xs text-ink-3">
                      <span className="flex gap-1.5" aria-hidden="true">
                        <i className="size-2.5 rounded-full bg-bad/60" />
                        <i className="size-2.5 rounded-full bg-warn/60" />
                        <i className="size-2.5 rounded-full bg-ok/60" />
                      </span>
                      <span className="truncate">Utopicar · {titre}</span>
                      <span className="num ml-auto shrink-0 font-medium text-o2">0{i + 1} / 03</span>
                    </div>
                    <div className="p-4 sm:p-6">
                      <Visuel />
                    </div>
                  </div>
                </div>
                {/* la phrase dans une petite carte à côté de la fenêtre */}
                <div className="pas carte p-5 lg:order-1" style={d(0.35)}>
                  <p className="font-display text-lg font-semibold">{titre}</p>
                  <p className="mt-2 border-t border-line pt-2 text-[15px] leading-relaxed text-ink-2">{texte}</p>
                </div>
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
