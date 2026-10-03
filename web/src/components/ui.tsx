"use client";
import { useEffect, useState, type ReactNode } from "react";

import { cx, inputCls } from "@/lib/cx";
export { cx, inputCls };

export function Panneau({ titre, aside, children, className }: { titre?: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-3xl border border-line bg-panel p-5 backdrop-blur sm:p-6", className)}>
      {titre && (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold tracking-tight">{titre}</h2>
          {aside && <span className="text-sm text-ink-3">{aside}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

export type Ton = "ok" | "warn" | "bad" | "o" | "neutre";
const TONS: Record<Ton, string> = {
  ok: "border-ok/35 bg-ok/10 text-ok",
  warn: "border-warn/35 bg-warn/10 text-warn",
  bad: "border-bad/35 bg-bad/10 text-bad",
  o: "border-o/40 bg-o/10 text-o2",
  neutre: "border-line-2 bg-glass text-ink-2",
};

export function Pastille({ ton = "neutre", children, title }: { ton?: Ton; children: ReactNode; title?: string }) {
  return (
    <span title={title} className={cx("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[13px] leading-6", TONS[ton])}>
      {children}
    </span>
  );
}

export function Copier({ texte, label = "Copier" }: { texte: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texte);
          setOk(true);
          setTimeout(() => setOk(false), 1600);
        } catch {
          /* presse-papiers refusé : rien à faire */
        }
      }}
      className="rounded-full border border-line-2 px-3 py-1 text-sm text-ink-2 transition hover:border-o/50 hover:text-ink"
    >
      {ok ? "Copié" : label}
    </button>
  );
}

/** Réglage gardé dans le navigateur (localStorage), lu après le premier rendu. */
export function useReglages<T extends object>(cle: string, defaut: T) {
  const [v, setV] = useState<T>(defaut);
  useEffect(() => {
    try {
      const s = localStorage.getItem(cle);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique du stockage local après hydratation
      if (s) setV({ ...defaut, ...JSON.parse(s) });
    } catch {
      /* stockage indisponible */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);
  const maj = (p: Partial<T>) =>
    setV((old) => {
      const n = { ...old, ...p };
      try {
        localStorage.setItem(cle, JSON.stringify(n));
      } catch {
        /* stockage indisponible */
      }
      return n;
    });
  return [v, maj] as const;
}

export function Champ({ label, aide, children }: { label: string; aide?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-ink-2">{label}</span>
      {children}
      {aide && <span className="text-xs text-ink-3">{aide}</span>}
    </label>
  );
}
