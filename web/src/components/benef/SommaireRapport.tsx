"use client";
/* Sommaire du rapport complet : une grille lisible sous l'en-tête (chaque section avec son chiffre clé),
   puis, une fois la grille dépassée, un bouton « Sections » qui la rouvre en fenêtre (en bas sur mobile, dans la colonne de droite sur ordinateur). */
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { cx } from "@/lib/cx";
import { usePiegeFocus } from "@/lib/piege-focus";

export type EntreeSommaire = { id: string; label: string; resume?: string | null; ton?: "ok" | "warn" | "bad" | null; verrou?: string | null };

const rien = () => () => {};
const TON: Record<string, string> = { ok: "bg-ok", warn: "bg-warn", bad: "bg-bad" };

/** Section visible à l'écran (la plus haute dont le titre a passé le tiers supérieur). */
export function useSectionActive(ids: string[]) {
  const [actif, setActif] = useState(ids[0]);
  const cle = ids.join(",");
  useEffect(() => {
    const els = cle.split(",").map((k) => document.getElementById(`r-${k}`)).filter((x): x is HTMLElement => !!x);
    const f = () => {
      const seuil = innerHeight * 0.35;
      let cur = els[0]?.id;
      for (const el of els) if (el.getBoundingClientRect().top <= seuil) cur = el.id;
      if (cur) setActif(cur.slice(2));
    };
    f();
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, [cle]);
  return actif;
}

function Grille({ entrees, actif, onChoix, compacte }: { entrees: EntreeSommaire[]; actif?: string; onChoix?: () => void; compacte?: boolean }) {
  return (
    <ol className={cx("grid grid-cols-2 gap-2", compacte ? "sm:grid-cols-3" : "sm:grid-cols-3 2xl:grid-cols-4")}>
      {entrees.map((x, i) => (
        <li key={x.id} className="min-w-0">
          <a
            href={`#r-${x.id}`}
            onClick={onChoix}
            aria-current={actif === x.id ? "location" : undefined}
            className={cx(
              "group flex h-full min-w-0 gap-2.5 rounded-xl border px-3 py-2.5 transition-colors",
              actif === x.id ? "border-o/60 bg-o/10" : "border-line hover:border-line-2 hover:bg-glass",
            )}
          >
            <span className={cx("num mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold", actif === x.id ? "bg-o text-[#160904]" : "bg-glass text-ink-3")}>{i + 1}</span>
            <span className="grid min-w-0 gap-0.5">
              <span className={cx("truncate text-sm font-semibold", x.verrou ? "text-ink-3" : "text-ink")}>{x.label}</span>
              <span className="flex min-w-0 items-center gap-1.5 text-xs text-ink-3">
                {x.verrou ? (
                  <span className="truncate">🔒 {x.verrou}</span>
                ) : (
                  <>
                    {x.ton && <span className={cx("size-1.5 shrink-0 rounded-full", TON[x.ton])} aria-hidden="true" />}
                    <span className="truncate">{x.resume || "—"}</span>
                  </>
                )}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Barre des sections, collée en haut de l'écran pendant la lecture : des boutons numérotés, clairement cliquables,
    et l'interrupteur « Détail profond » (vue pro par défaut : l'essentiel pour décider). */
export function BarreSections({ entrees, actif, profond, onProfond }: { entrees: EntreeSommaire[]; actif: string; profond: boolean; onProfond: (v: boolean) => void }) {
  const liste = useRef<HTMLOListElement>(null);
  // la section lue reste visible dans la barre (défilement horizontal sur téléphone). Pas de scrollIntoView :
  // il faisait aussi défiler la page jusqu'à la barre, et le rapport sautait de 700 px à l'ouverture.
  useEffect(() => {
    const l = liste.current;
    const el = l?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!l || !el) return;
    const gauche = el.getBoundingClientRect().left - l.getBoundingClientRect().left + l.scrollLeft;
    if (gauche < l.scrollLeft || gauche + el.offsetWidth > l.scrollLeft + l.clientWidth) l.scrollTo({ left: Math.max(0, gauche - 12) });
  }, [actif]);
  return (
    <nav aria-label="Sections du rapport" className="sticky top-16 z-30 -mx-1 grid gap-2 rounded-2xl border border-line-2 bg-bg0/95 px-3 py-2.5 shadow-[0_12px_30px_-18px_rgb(0_0_0/0.9)] backdrop-blur-md lg:top-2">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-semibold">
          Aller à une section <span className="font-normal text-ink-3">· cliquez pour y aller</span>
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <span className={cx(!profond && "font-semibold text-ink", profond && "text-ink-3")}>Vue pro</span>
          <span className="relative inline-flex">
            <input type="checkbox" role="switch" checked={profond} onChange={(e) => onProfond(e.target.checked)} className="peer sr-only" aria-label="Détail profond" />
            <span className="h-6 w-11 rounded-full bg-line-2 transition peer-checked:bg-o peer-focus-visible:ring-2 peer-focus-visible:ring-o/50" aria-hidden="true" />
            <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-ink transition peer-checked:translate-x-5" aria-hidden="true" />
          </span>
          <span className={cx(profond && "font-semibold text-ink", !profond && "text-ink-3")}>Détail profond</span>
        </label>
      </div>
      <ol ref={liste} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {entrees.map((x, i) => (
          <li key={x.id} className="shrink-0">
            <a
              href={`#r-${x.id}`}
              aria-current={actif === x.id ? "location" : undefined}
              className={cx(
                "flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-sm transition",
                actif === x.id ? "border-o bg-o/15 text-ink" : "border-line-2 bg-glass text-ink-2 hover:border-o/50 hover:text-ink",
              )}
            >
              <span className={cx("num grid size-6 place-items-center rounded-full text-xs font-semibold", actif === x.id ? "bg-o text-[#160904]" : "bg-bg1 text-ink-3")}>{i + 1}</span>
              {x.verrou ? <span aria-hidden="true">🔒</span> : x.ton ? <span className={cx("size-1.5 rounded-full", TON[x.ton])} aria-hidden="true" /> : null}
              <span className="whitespace-nowrap font-medium">{x.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Grille « Dans ce rapport », placée sous l'en-tête. */
export function SommaireRapport({ entrees, actif, ancre }: { entrees: EntreeSommaire[]; actif: string; ancre: React.RefObject<HTMLElement | null> }) {
  return (
    <nav ref={ancre} aria-label="Sections du rapport" className="carte grid gap-3 p-4 sm:p-5">
      <h2 className="font-display text-lg font-semibold">Dans ce rapport</h2>
      <Grille entrees={entrees} actif={actif} />
    </nav>
  );
}

/** Bouton « Sections » qui rouvre le sommaire en fenêtre. `flottant` : fixé en bas de l'écran (mobile). */
export function BoutonSections({ entrees, actif, visible, flottant, className }: { entrees: EntreeSommaire[]; actif: string; visible: boolean; flottant?: boolean; className?: string }) {
  const id = useId();
  const [ouvert, setOuvert] = useState(false);
  const bouton = useRef<HTMLButtonElement>(null);
  const boite = useRef<HTMLDivElement>(null);
  usePiegeFocus(boite, ouvert);
  useEffect(() => {
    if (!ouvert) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    addEventListener("keydown", f);
    return () => removeEventListener("keydown", f);
  }, [ouvert]);
  // vrai seulement dans le navigateur : le portail a besoin de document.body
  const monte = useSyncExternalStore(rien, () => true, () => false);
  const i = Math.max(0, entrees.findIndex((x) => x.id === actif));
  const cur = entrees[i];
  const btn = (
      <button
        ref={bouton}
        type="button"
        onClick={() => setOuvert(true)}
        aria-haspopup="dialog"
        aria-hidden={!visible || undefined}
        tabIndex={visible ? undefined : -1}
        className={cx(
          "flex min-w-0 items-center gap-3 rounded-full border border-o/40 bg-bg1 py-2 pl-2 pr-4 text-left transition-all duration-200",
          flottant && "fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-sm lg:bottom-6 shadow-[0_16px_40px_-10px_rgb(0_0_0/0.8)]",
          visible ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0",
          className,
        )}
      >
        <span className="num grid size-8 shrink-0 place-items-center rounded-full bg-o text-sm font-semibold text-[#160904]">{i + 1}</span>
        <span className="grid min-w-0 flex-1 leading-tight">
          <span className="text-xs text-ink-3">Section {i + 1} sur {entrees.length}</span>
          <span className="truncate text-sm font-semibold">{cur?.label}</span>
        </span>
        <span className="shrink-0 text-sm font-semibold text-o2">Sections</span>
      </button>
  );
  return (
    <>
      {/* bouton flottant rendu à la racine de la page : aucun bloc parent ne peut le faire passer dessous */}
      {flottant ? monte && createPortal(btn, document.body) : btn}
      {ouvert &&
        createPortal(
          <div className="fixed inset-0 z-[70] grid items-end bg-black/70 backdrop-blur-sm sm:place-items-center sm:px-4" onClick={() => setOuvert(false)}>
            <div
              ref={boite}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${id}-t`}
              className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border border-line-2 bg-bg1 p-5 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] sm:max-w-2xl sm:rounded-3xl sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 id={`${id}-t`} className="font-display text-xl font-semibold">
                  Aller à une section
                </h2>
                <button type="button" onClick={() => setOuvert(false)} aria-label="Fermer" className="rounded-full px-2 py-1 text-ink-3 hover:text-ink" autoFocus>
                  ✕
                </button>
              </div>
              <Grille entrees={entrees} actif={actif} compacte onChoix={() => setOuvert(false)} />
              <a href="#contenu" onClick={() => setOuvert(false)} className="mt-4 inline-block text-sm text-o2 underline underline-offset-4">
                Revenir en haut du rapport
              </a>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
