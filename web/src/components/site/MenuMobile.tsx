"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

export type LienNav = { href: string; label: string };

/** Menu déroulant du téléphone : bouton annoncé, fermeture par Échap et au changement de page. */
export function MenuMobile({ liens, compte }: { liens: LienNav[]; compte: LienNav }) {
  const [ouvert, setOuvert] = useState(false);
  const id = useId();
  const chemin = usePathname();
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fermer le menu quand la page change
  useEffect(() => setOuvert(false), [chemin]);
  useEffect(() => {
    if (!ouvert) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    addEventListener("keydown", f);
    return () => removeEventListener("keydown", f);
  }, [ouvert]);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={ouvert}
        aria-controls={id}
        onClick={() => setOuvert((v) => !v)}
        className="grid size-11 place-items-center rounded-full border border-line-2 bg-glass"
      >
        <span className="sr-only">{ouvert ? "Fermer le menu" : "Ouvrir le menu"}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          {ouvert ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <div id={id} hidden={!ouvert} className="absolute inset-x-0 top-full border-b border-line bg-bg0/95 backdrop-blur">
        <nav aria-label="Menu" className="wrap grid gap-1 py-4">
          {[...liens, compte].map((l) => (
            <Link key={l.href} href={l.href} aria-current={chemin === l.href ? "page" : undefined} className="rounded-xl px-3 py-3 text-lg text-ink-2 hover:bg-glass hover:text-ink aria-[current=page]:text-o2">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
