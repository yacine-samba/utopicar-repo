import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { libelle, listeCotes } from "@/lib/cotes-publiques";
import { EXEMPLES } from "@/lib/demo";
import { cx } from "@/lib/cx";

/* Ce que l'outil vérifie, en bento (pages produit d'Apple, sites Framer) : la taille d'une case dit son importance,
   une seule idée par case, et l'action dans sa propre case.
   Case principale : la base du marché, le nombre d'annonces relevées par modèle (aucun prix : la cote détaillée est réservée aux abonnés).
   Les cases s'animent quand elles arrivent à l'écran (classes « scene », « pas », « monte » de globals.css). */

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

function Case({ className, titre, children, i = 0 }: { className?: string; titre?: ReactNode; children: ReactNode; i?: number }) {
  return (
    <li className={cx("vue attend", className)} style={{ "--i": i } as CSSProperties}>
      <div className="carte scene flex h-full flex-col gap-4 overflow-hidden p-5 sm:p-6">
        {titre && <h3 className="font-display text-lg font-semibold leading-tight">{titre}</h3>}
        {children}
      </div>
    </li>
  );
}

export async function Bento() {
  // les modèles les plus suivis de la base : le nombre d'annonces seulement
  const liste = (await listeCotes()).filter((c) => c.n > 0);
  const total = liste.reduce((t, c) => t + c.n, 0);
  const modeles = [...liste].sort((x, y) => y.n - x.n).slice(0, 7);
  const maxN = Math.max(1, ...modeles.map((m) => m.n));
  const ex = EXEMPLES.clio;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-[auto_auto_auto]">
      {/* 1. la case d'ancrage : la base du marché, modèle par modèle (des nombres d'annonces, aucun prix :
          la cote détaillée est réservée aux abonnés) */}
      {modeles.length >= 3 ? (
        <Case className="sm:col-span-2 lg:col-span-4 lg:row-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-o2">Comparée à de vraies annonces</p>
              <h3 className="mt-1 font-display text-2xl font-semibold">La base du marché</h3>
              <p className="text-sm text-ink-3">relevée sur Leboncoin, génération par génération</p>
            </div>
            <div className="text-right">
              <p className="num font-display text-4xl font-semibold tracking-tight sm:text-5xl">{total.toLocaleString("fr-FR")}</p>
              <p className="text-sm text-ink-3">annonces relevées</p>
            </div>
          </div>
          <ul className="mt-auto grid gap-2.5" aria-label="Annonces relevées par modèle">
            {modeles.map((m, k) => (
              <li key={m.cle} className="grid grid-cols-[minmax(0,9.5rem)_1fr_3.5rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,13rem)_1fr_4rem]">
                <span className="truncate text-ink-2">{libelle(m.nom)}</span>
                <span className="relative h-3 rounded-full bg-glass" aria-hidden="true">
                  <span className="jauge absolute inset-y-0 left-0 rounded-full bg-o/70" style={{ width: `${(m.n / maxN) * 100}%`, ...d(0.15 + k * 0.08) }} />
                </span>
                <span className="num text-right font-semibold">{m.n.toLocaleString("fr-FR")}</span>
              </li>
            ))}
          </ul>
        </Case>
      ) : null}

      {/* 2. les mots qui coûtent : les vraies règles de l'outil (embrayage 500 à 900 €, pneus 150 à 350 €) */}
      <Case className="lg:col-span-2" titre="Les mots qui coûtent" i={1}>
        <p className="leading-relaxed text-ink-2">
          « Très bon état,{" "}
          <mark className="pas rounded bg-bad/20 px-1 text-ink" style={d(0.3)}>embrayage à prévoir</mark>,{" "}
          <mark className="pas rounded bg-bad/20 px-1 text-ink" style={d(0.55)}>pneus à changer</mark>. »
        </p>
        <p className="pas mt-auto text-sm font-semibold text-bad" style={d(0.8)}>
          + 650 à 1 250 € à prévoir
        </p>
      </Case>

      {/* 3. fiable ou à fuir */}
      <Case className="lg:col-span-2" titre="Fiable ou à fuir" i={2}>
        <ul className="flex flex-wrap gap-2 text-sm">
          {(
            [
              ["1.5 dCi", true],
              ["1.33 VVT-i", true],
              ["1.2 PureTech", false],
              ["DSG7", false],
            ] as const
          ).map(([m, ok], k) => (
            <li key={m} className={cx("pas rounded-full border px-3 py-1", ok ? "border-ok/40 bg-ok/10 text-ok" : "border-bad/40 bg-bad/10 text-bad")} style={d(0.2 + k * 0.1)}>
              {ok ? "✓" : "✕"} {m}
              <span className="sr-only">{ok ? " : fiable" : " : à éviter"}</span>
            </li>
          ))}
        </ul>
      </Case>

      {/* 4. le message au vendeur, déjà rédigé */}
      <Case className="lg:col-span-2" titre="Le message au vendeur" i={0}>
        <p className="pas rounded-2xl rounded-bl-md bg-glass px-4 py-3 text-sm text-ink-2" style={d(0.3)}>
          {ex.message}
        </p>
        <p className="pas mt-auto text-sm text-ink-3" style={d(0.6)}>
          Rédigé pour vous, à copier en un clic.
        </p>
      </Case>

      {/* 5. avant d'y aller */}
      <Case className="lg:col-span-2" titre="Avant d'y aller" i={1}>
        <ul className="grid gap-2 text-sm text-ink-2">
          {(
            [
              ["CT de moins de 6 mois", "OK", "text-ok"],
              ["Carnet d'entretien", "À demander", "text-warn"],
              ["Rapport HistoVec", "À demander", "text-warn"],
            ] as const
          ).map(([l, v, cls], k) => (
            <li key={l} className="pas flex justify-between gap-2" style={d(0.25 + k * 0.15)}>
              {l} <b className={cls}>{v}</b>
            </li>
          ))}
        </ul>
      </Case>

      {/* 6. l'action, dans sa propre case */}
      <li className="vue lg:col-span-2" style={{ "--i": 2 } as CSSProperties}>
        <Link href="#essai" className="group flex h-full min-h-40 flex-col justify-between gap-4 rounded-[26px] bg-o p-6 text-[#160904] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-24px_rgb(255_90_31/0.9)]">
          <span className="font-display text-2xl font-semibold leading-tight">Et votre annonce, elle vaut quoi ?</span>
          <span className="flex items-center justify-between font-semibold">
            Analyser en 10 secondes
            <span className="grid size-11 place-items-center rounded-full bg-[#160904] text-o transition group-hover:translate-x-1" aria-hidden="true">
              →
            </span>
          </span>
        </Link>
      </li>
    </ul>
  );
}
