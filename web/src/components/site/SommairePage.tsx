"use client";
import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";

/** Sommaire collant sous l'en-tête (tablette et ordinateur) : une pastille par section de la page,
    celle qu'on lit est allumée. Liens d'ancre simples : tout marche sans JavaScript, le script ne fait que l'allumage. */
export function SommairePage({ sections }: { sections: [id: string, label: string][] }) {
  const [actif, setActif] = useState<string | null>(null);
  useEffect(() => {
    const els = sections.map(([id]) => document.getElementById(id)).filter((x): x is HTMLElement => !!x);
    if (!els.length || !("IntersectionObserver" in window)) return;
    // bande fine au milieu de l'écran : la section qui la traverse est celle qu'on lit
    const io = new IntersectionObserver(
      (es) => {
        const vue = es.filter((e) => e.isIntersecting).pop();
        if (vue) setActif(vue.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [sections]);
  return (
    <nav aria-label="Sur cette page" className="sticky top-[68px] z-30 hidden border-b border-line bg-bg0/70 backdrop-blur-md md:block">
      <ul className="wrap flex items-center justify-center gap-1 overflow-x-auto py-2">
        {sections.map(([id, label]) => (
          <li key={id} className="shrink-0">
            <a
              href={`#${id}`}
              aria-current={actif === id ? "location" : undefined}
              className={cx(
                "inline-flex min-h-8 items-center rounded-full px-3.5 text-sm no-underline transition",
                actif === id ? "bg-ink text-bg0 font-medium" : "text-ink-3 hover:bg-glass hover:text-ink",
              )}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
