"use client";
import { useId, useState, type ReactNode } from "react";

export type Question = { cat?: string; q: string; r: ReactNode };

/** Accordéon accessible : bouton annoncé ouvert/fermé, réponse reliée au bouton. */
export function Faq({ questions, premiereOuverte = true }: { questions: Question[]; premiereOuverte?: boolean }) {
  const [ouverte, setOuverte] = useState<number | null>(premiereOuverte ? 0 : null);
  const base = useId();
  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      {questions.map((x, i) => {
        const o = ouverte === i;
        return (
          <div key={x.q} className={`carte overflow-hidden transition ${o ? "border-o/40" : ""}`}>
            <h3 className="m-0">
              <button
                type="button"
                id={`${base}-b${i}`}
                aria-expanded={o}
                aria-controls={`${base}-r${i}`}
                onClick={() => setOuverte(o ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="grid gap-0.5">
                  {x.cat && <small className="text-xs font-medium uppercase tracking-wider text-o2">{x.cat}</small>}
                  <span className="font-display text-lg font-semibold">{x.q}</span>
                </span>
                <span className={`grid size-8 shrink-0 place-items-center rounded-full border border-line-2 text-lg transition ${o ? "rotate-45 text-o2" : ""}`} aria-hidden="true">
                  +
                </span>
              </button>
            </h3>
            <div id={`${base}-r${i}`} role="region" aria-labelledby={`${base}-b${i}`} hidden={!o} className="px-6 pb-6 text-ink-2">
              {x.r}
            </div>
          </div>
        );
      })}
    </div>
  );
}
