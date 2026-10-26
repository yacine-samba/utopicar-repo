"use client";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "@/lib/cx";
import type { DefautCatalogue } from "@/lib/analyse/defauts";

/* Les 38 pièges que les règles lisent dans le texte des annonces, en liste à côté d'un aperçu (l'aperçu reste collé
   sur ordinateur pendant qu'on parcourt la liste). Trois onglets par gravité ; survol, focus ou clic sur une ligne
   met l'aperçu à jour. Les coûts sont ceux des règles (lib/analyse/defauts.ts). */

const GROUPES = [
  { id: "piege", l: "Rédhibitoires", cats: ["piege"] },
  { id: "lourd", l: "Grosses dépenses", cats: ["lourd"] },
  { id: "levier", l: "Petits défauts", cats: ["levier", "info"] },
] as const;

const TON = {
  piege: { l: "Rédhibitoire", c: "bg-bad/15 text-bad" },
  lourd: { l: "Grosse dépense ou risque", c: "bg-warn/15 text-warn" },
  levier: { l: "Petit défaut chiffrable", c: "bg-o/15 text-o2" },
  info: { l: "Signal", c: "bg-glass text-ink-2" },
} as const;

/** Échelle commune des barres de coût : la réparation la plus chère des règles. */
const ECHELLE = 1600;
const eur = (v: number) => `${v.toLocaleString("fr-FR")} €`;

function cout(d: DefautCatalogue) {
  if (d.cat === "info") return "Signal relevé, sans coût chiffré";
  if (d.nc || !d.max) return "Non chiffrable sans inspection";
  return `${eur(d.min)} à ${eur(d.max)}`;
}

function Apercu({ d }: { d: DefautCatalogue }) {
  const chiffre = d.cat !== "info" && !d.nc && d.max > 0;
  return (
    <div key={d.k} className="carte scene flex min-h-[19rem] flex-col justify-between gap-8 p-6 sm:p-8">
      <div>
        <span className={cx("pas inline-flex rounded-full px-3 py-1 text-sm font-semibold", TON[d.cat].c)}>{TON[d.cat].l}</span>
        <p className="pas mt-5 font-display text-[clamp(28px,3.4vw,40px)] font-semibold leading-[1.05] tracking-[-0.02em]" style={{ "--d": "0.06s" } as React.CSSProperties}>
          {d.l}
        </p>
      </div>
      <div className="grid gap-3">
        <p className="num font-display text-xl font-semibold">{cout(d)}</p>
        {chiffre && (
          <div className="grid gap-1.5" aria-hidden="true">
            <div className="relative h-2.5 rounded-full bg-line">
              <span
                className="jauge absolute inset-y-0 rounded-full bg-o"
                style={{ left: `${(d.min / ECHELLE) * 100}%`, width: `${Math.max(((d.max - d.min) / ECHELLE) * 100, 1.5)}%`, "--d": "0.1s" } as React.CSSProperties}
              />
            </div>
            <div className="flex justify-between text-xs text-ink-3">
              <span>0 €</span>
              <span>{eur(ECHELLE)}</span>
            </div>
          </div>
        )}
        <p className="text-sm text-ink-3">Repéré dans le texte de l&apos;annonce, avant même de vous déplacer.</p>
      </div>
    </div>
  );
}

export function Pieges({ defauts }: { defauts: DefautCatalogue[] }) {
  const [groupe, setGroupe] = useState<(typeof GROUPES)[number]["id"]>("piege");
  const liste = defauts.filter((d) => (GROUPES.find((g) => g.id === groupe)!.cats as readonly string[]).includes(d.cat));
  const [choix, setChoix] = useState<string | undefined>(liste[0]?.k);
  const actuel = liste.find((d) => d.k === choix) ?? liste[0];
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const ig = GROUPES.findIndex((g) => g.id === groupe);
  const ouvrir = (n: number) => {
    const g = GROUPES[(n + GROUPES.length) % GROUPES.length];
    setGroupe(g.id);
    setChoix(defauts.find((d) => (g.cats as readonly string[]).includes(d.cat))?.k);
    refs.current[(n + GROUPES.length) % GROUPES.length]?.focus();
  };
  const clavier = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") ouvrir(ig + 1);
    else if (e.key === "ArrowLeft") ouvrir(ig - 1);
    else return;
    e.preventDefault();
  };
  if (!actuel) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10">
      <div className="lg:sticky lg:top-36 lg:self-start" aria-live="polite">
        <Apercu d={actuel} />
      </div>
      <div>
        <div role="tablist" aria-label="Gravité" onKeyDown={clavier} className="mb-4 grid grid-cols-3 gap-1 rounded-3xl border border-line p-1 sm:rounded-full">
          {GROUPES.map((g, i) => {
            const n = defauts.filter((d) => (g.cats as readonly string[]).includes(d.cat)).length;
            return (
              <button
                key={g.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${base}-${g.id}`}
                aria-selected={groupe === g.id}
                aria-controls={`${base}-liste`}
                tabIndex={groupe === g.id ? 0 : -1}
                onClick={() => ouvrir(i)}
                className={cx("min-h-10 rounded-full px-2 text-xs leading-tight transition sm:px-4 sm:text-sm", groupe === g.id ? "bg-ink font-semibold text-bg0" : "text-ink-2 hover:text-ink")}
              >
                {g.l} <span className="num opacity-60 max-sm:hidden">{n}</span>
              </button>
            );
          })}
        </div>
        <ul id={`${base}-liste`} role="tabpanel" aria-labelledby={`${base}-${groupe}`} className="grid">
          {liste.map((d) => (
            <li key={d.k}>
              <button
                type="button"
                aria-pressed={actuel.k === d.k}
                onMouseEnter={() => setChoix(d.k)}
                onFocus={() => setChoix(d.k)}
                onClick={() => setChoix(d.k)}
                className={cx(
                  "group flex min-h-14 w-full items-center justify-between gap-4 border-b border-line px-2 py-3 text-left transition",
                  actuel.k === d.k ? "text-ink" : "text-ink-2 hover:text-ink",
                )}
              >
                <span className="min-w-0">
                  <span className={cx("block font-display text-lg leading-tight transition", actuel.k === d.k && "translate-x-1")}>{d.l}</span>
                  <span className="num block text-sm text-ink-3">{cout(d)}</span>
                </span>
                <span
                  className={cx(
                    "grid size-8 shrink-0 place-items-center rounded-full border transition",
                    actuel.k === d.k ? "border-o bg-o text-[#160904]" : "border-line-2 text-ink-3 group-hover:border-o/50",
                  )}
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
