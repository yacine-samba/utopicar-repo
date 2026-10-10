"use client";
import { useEffect, useState } from "react";
import { cx } from "../ui";
import type { Apercu } from "../analyse/Patience";
import { ANNEAU_EXEMPLE, euros, EXEMPLES, TON_EXEMPLE } from "@/lib/demo";
import { Fourchette } from "../analyse/Fourchette";

/* La fiche qui s'ouvre sous le champ de l'accueil : d'abord trois étapes qui se cochent, puis le résultat ligne par ligne.
   Deux contenus : l'aperçu réel d'une annonce collée (règles et cote de l'outil, sans IA) ou l'un des trois exemples de la démo.
   Les lignes arrivent en cascade avec la classe « arrivee » (animation CSS globale, coupée si les animations sont réduites). */

const TON_BILAN: Record<string, string> = { ok: "text-ok", o: "text-o2", warn: "text-warn", bad: "text-bad", neutre: "text-ink" };

const ETAPES = ["Lecture du texte de l'annonce", "Cote sur les annonces comparables", "Contrôles : moteur, défauts, papiers"];
const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;
const reduit = () => typeof window !== "undefined" && (matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-calme"));

export type Contenu = { type: "apercu"; a: Apercu } | { type: "exemple"; cle: string };

/** Étapes qui se cochent une à une (380 ms chacune), puis `fini`. Immédiat si les animations sont réduites. */
export function useEtapes(actif: boolean, n = ETAPES.length) {
  const [etape, setEtape] = useState(0);
  useEffect(() => {
    if (!actif) return;
    if (reduit()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- résultat immédiat sans animation
      setEtape(n);
      return;
    }
    setEtape(0);
    const t = Array.from({ length: n }, (_, i) => setTimeout(() => setEtape(i + 1), 380 * (i + 1)));
    return () => t.forEach(clearTimeout);
  }, [actif, n]);
  return etape;
}

function Etapes({ etape }: { etape: number }) {
  return (
    <ol className="grid gap-3">
      {ETAPES.map((e, i) => (
        <li key={e} className={cx("flex items-center gap-3 text-sm transition", i < etape ? "text-ink-2" : i === etape ? "text-ink" : "text-ink-3/60")}>
          <span className={cx("grid size-5 shrink-0 place-items-center rounded-full border text-[10px]", i < etape ? "border-ok bg-ok/20 text-ok" : i === etape ? "animate-pulse border-o" : "border-line-2")} aria-hidden="true">
            {i < etape ? "✓" : ""}
          </span>
          {e}
        </li>
      ))}
    </ol>
  );
}

function Ligne({ i, children, className }: { i: number; children: React.ReactNode; className?: string }) {
  return (
    <li className={cx("arrivee py-3", className)} style={{ "--i": i } as React.CSSProperties}>
      {children}
    </li>
  );
}

function Reel({ a }: { a: Apercu }) {
  const mediane = a.cote?.mediane ?? 0;
  const ecart = a.ecart;
  const ton = ecart == null ? "neutre" : ecart >= mediane * 0.05 ? "ok" : ecart <= -mediane * 0.05 ? "bad" : "neutre";
  const infos = [a.annee, a.km != null ? `${a.km.toLocaleString("fr-FR")} km` : null, a.energie, a.boite, a.ville].filter(Boolean).join(" · ");
  return (
    <div className="grid gap-1">
      <p className="arrivee font-display text-lg font-semibold">
        {a.titre || "Votre annonce"}
        {infos && <span className="block text-sm font-normal text-ink-3">{infos}</span>}
      </p>
      <ul className="divide-y divide-line">
        {a.bilan && (
          <Ligne i={1}>
            <div className="flex items-center justify-between gap-3">
              <b className={cx("font-display text-2xl", TON_BILAN[a.bilan.ton] ?? "text-ink")}>{a.bilan.libelle}</b>
              {a.bilan.indice != null && <span className="num rounded-full border border-line-2 px-2.5 py-0.5 text-sm">{a.bilan.indice} / 100</span>}
            </div>
            {a.bilan.vigilance && <p className="mt-2 rounded-xl border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">{a.bilan.vigilance}</p>}
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {a.bilan.piliers.map((p) => (
                <li key={p.question} className="rounded-xl border border-line px-3 py-2">
                  <span className="block text-xs text-ink-3">{p.question}</span>
                  <b className={cx("block text-sm", TON_BILAN[p.ton] ?? "text-ink")}>{p.reponse}</b>
                </li>
              ))}
            </ul>
            {a.bilan.question && (
              <p className="mt-3 text-sm text-ink-2">
                <span className="text-ink-3">À demander au vendeur : </span>
                {a.bilan.question}
              </p>
            )}
          </Ligne>
        )}
        <Ligne i={1}>
          {a.cote && a.prix ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-sm text-ink-2">
                  Prix <b className="num text-ink">{eur(a.prix)}</b> · cote <b className="num text-ink">{eur(a.cote.mediane)}</b>
                </span>
                <b className={cx("num font-display text-lg", ton === "ok" ? "text-ok" : ton === "bad" ? "text-bad" : "text-ink-2")}>
                  {ecart == null || Math.abs(ecart) < mediane * 0.03 ? "Au prix du marché" : ecart > 0 ? `${eur(ecart)} sous la cote` : `${eur(-ecart)} au-dessus`}
                </b>
              </div>
              <Fourchette prix={a.prix} p25={a.cote.p25} p75={a.cote.p75} />
              <p className="mt-2 text-xs text-ink-3">{a.cote.n} annonces comparables en ligne, moitié d&apos;entre elles entre {eur(a.cote.p25)} et {eur(a.cote.p75)}.</p>
            </>
          ) : (
            <p className="text-sm text-ink-2">
              {a.prix ? (
                <>
                  Prix <b className="num text-ink">{eur(a.prix)}</b> · modèle peu courant : la cote se calcule dans le rapport complet.
                </>
              ) : (
                "Prix non trouvé dans le texte : la cote se calcule dans le rapport complet."
              )}
            </p>
          )}
        </Ligne>
        <Ligne i={2} className="flex items-start gap-3">
          <span className={cx("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs", a.fiab.k === "eviter" ? "bg-warn/20 text-warn" : a.fiab.k === "fiable" ? "bg-ok/20 text-ok" : "bg-glass text-ink-3")} aria-hidden="true">
            {a.fiab.k === "eviter" ? "!" : a.fiab.k === "fiable" ? "✓" : "?"}
          </span>
          <span className="text-sm">
            <b className="block">{a.fiab.k === "eviter" ? "Moteur ou boîte à surveiller" : a.fiab.k === "fiable" ? `${a.fiab.modele ?? "Modèle"} : réputé fiable` : "Fiabilité : à préciser dans le rapport"}</b>
            {a.fiab.pourquoi[0] && <span className="text-ink-3">{a.fiab.pourquoi[0]}</span>}
          </span>
        </Ligne>
        <Ligne i={3}>
          <b className="block text-sm">{a.defauts.length ? `${a.defauts.length} point${a.defauts.length > 1 ? "s" : ""} repéré${a.defauts.length > 1 ? "s" : ""} dans le texte` : "Aucun défaut écrit dans l'annonce"}</b>
          {a.defauts.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {a.defauts.map((d) => (
                <li key={d.l} className={cx("rounded-full border px-2.5 py-0.5 text-xs", d.piege ? "border-bad/40 bg-bad/10 text-bad" : "border-warn/40 bg-warn/10 text-warn")}>
                  {d.l}
                </li>
              ))}
            </ul>
          )}
        </Ligne>
        {a.papiers.length > 0 && (
          <Ligne i={4}>
            <p className="text-xs text-ink-3">{a.papiers.join(" · ")}</p>
          </Ligne>
        )}
      </ul>
    </div>
  );
}

function Exemple({ cle }: { cle: string }) {
  const ex = EXEMPLES[cle];
  const r = 30;
  const tour = 2 * Math.PI * r;
  const [plein, setPlein] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPlein(true), reduit() ? 0 : 60);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="grid gap-3">
      <div className="arrivee flex items-center gap-4">
        <div className="relative size-[70px] shrink-0">
          <svg viewBox="0 0 70 70" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="35" cy="35" r={r} fill="none" className="stroke-line" strokeWidth="6" />
            <circle cx="35" cy="35" r={r} fill="none" style={{ stroke: ANNEAU_EXEMPLE[ex.ton] }} strokeWidth="6" strokeLinecap="round" strokeDasharray={tour} strokeDashoffset={tour * (1 - (plein ? ex.fiab.note : 0) / 10)} className="transition-[stroke-dashoffset] duration-1000 ease-out" />
          </svg>
          <span className="absolute inset-0 grid place-content-center text-center leading-none">
            <b className="num font-display text-xl">
              {ex.fiab.note}
              <small className="text-xs text-ink-3">/10</small>
            </b>
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold">
            {ex.titre} <span className="num text-o2">{euros(ex.prix)}</span>
          </p>
          <span className={cx("mt-1 inline-block rounded-full border px-3 py-0.5 text-sm font-semibold", TON_EXEMPLE[ex.ton])}>{ex.verdict}</span>
          <p className="mt-1 text-sm text-ink-2">{ex.phrase}</p>
        </div>
      </div>
      <ul className="divide-y divide-line">
        {ex.lignes.map((l, i) => (
          <Ligne key={l.l} i={i + 1} className={cx("flex items-center justify-between gap-3", l.sens === "cle" && "rounded-xl bg-o/10 px-3")}>
            <span className="text-sm">
              {l.l}
              <small className="block text-xs text-ink-3">{l.s}</small>
            </span>
            <span className={cx("num shrink-0 font-display text-lg font-semibold", l.sens === "up" && "text-bad", l.sens === "dn" && "text-ok", l.sens === "cle" && "text-o2")}>
              {l.v == null ? l.sinon : (l.avant ?? "") + euros(l.v)}
            </span>
          </Ligne>
        ))}
      </ul>
    </div>
  );
}

export function CarteApercu({ contenu, fini, titreRef }: { contenu: Contenu | null; fini: boolean; titreRef?: React.Ref<HTMLParagraphElement> }) {
  const etape = useEtapes(true);
  const pret = fini && etape >= ETAPES.length;
  return (
    <article className="carte p-5 text-left sm:p-6" aria-live="polite" aria-busy={!pret}>
      <p ref={titreRef} tabIndex={-1} className="mb-4 flex justify-between text-xs text-ink-3 outline-none">
        <span>{contenu?.type === "exemple" ? "Fiche Utopicar · exemple" : "Fiche Utopicar · aperçu"}</span>
        <span>{pret ? "en 2 secondes, sans compte" : "Analyse en cours…"}</span>
      </p>
      {!pret || !contenu ? <Etapes etape={etape} /> : contenu.type === "apercu" ? <Reel a={contenu.a} /> : <Exemple cle={contenu.cle} />}
    </article>
  );
}
