"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import type { EntreeNav } from "@/lib/espace";
import { cx } from "@/lib/cx";
import { Ico } from "./Icones";

const estActif = (chemin: string, href: string) => (href === "/app" ? chemin === "/app" : chemin === href || chemin.startsWith(href + "/"));

/** Menu latéral (ordinateur). */
export function NavCote({ entrees }: { entrees: EntreeNav[] }) {
  const chemin = usePathname();
  return (
    <nav aria-label="Espace" className="grid gap-0.5">
      {entrees.map((e) => {
        const actif = estActif(chemin, e.href);
        return (
          <Link
            key={e.href}
            href={e.href}
            aria-current={actif ? "page" : undefined}
            className={cx(
              "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
              actif ? "bg-o/12 text-ink shadow-[inset_0_0_0_1px_rgb(255_90_31/0.35)]" : "text-ink-2 hover:bg-glass hover:text-ink",
            )}
          >
            <Ico nom={e.icone} className={cx("size-[18px] shrink-0", actif ? "text-o2" : "text-ink-3 group-hover:text-ink-2")} />
            <span className="flex-1">{e.label}</span>
            {e.verrou && (
              <span className="rounded-full border border-line-2 px-2 py-px text-[11px] text-ink-3" title={`Inclus dans ${e.verrou}`}>
                {e.verrou}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/** Téléphone : barre du haut, tiroir pour tout le menu et barre du bas.
    Le tiroir et la barre du bas restent hors de l'en-tête : son flou d'arrière-plan piégerait leur position fixe. */
export function NavMobile({ entrees, pied, gauche, droite }: { entrees: EntreeNav[]; pied: ReactNode; gauche: ReactNode; droite: ReactNode }) {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const id = useId();
  // eslint-disable-next-line react-hooks/set-state-in-effect -- fermer le tiroir quand la page change
  useEffect(() => setOuvert(false), [chemin]);
  useEffect(() => {
    if (!ouvert) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    addEventListener("keydown", f);
    document.documentElement.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", f);
      document.documentElement.style.overflow = "";
    };
  }, [ouvert]);
  const bas = entrees.filter((e) => e.mobile);
  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-line bg-bg0/85 px-4 backdrop-blur-md lg:hidden">
        {gauche}
        <div className="flex items-center gap-2">
          {droite}
          <button type="button" aria-expanded={ouvert} aria-controls={id} onClick={() => setOuvert((v) => !v)} className="grid size-11 place-items-center rounded-full border border-line-2 bg-glass">
            <span className="sr-only">{ouvert ? "Fermer le menu" : "Ouvrir le menu"}</span>
            <Ico nom={ouvert ? "fermer" : "plus"} />
          </button>
        </div>
      </header>
      {/* Tiroir au-dessus de la barre du bas (z-50) et grande marge basse : « Se déconnecter » n'est jamais caché. */}
      <div id={id} hidden={!ouvert} className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto overscroll-contain border-t border-line bg-bg0 lg:hidden">
        <div className="grid gap-6 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5">
          <NavCote entrees={entrees} />
          {pied}
        </div>
      </div>
      <nav aria-label="Raccourcis" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg0/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <ul className="mx-auto grid max-w-lg" style={{ gridTemplateColumns: `repeat(${bas.length}, minmax(0, 1fr))` }}>
          {bas.map((e) => {
            const actif = estActif(chemin, e.href);
            const centre = e.icone === "analyser";
            return (
              <li key={e.href}>
                <Link href={e.href} aria-current={actif ? "page" : undefined} className={cx("flex flex-col items-center gap-1 px-1 pb-2 pt-2 text-[11px] font-medium", actif ? "text-o2" : "text-ink-3")}>
                  <span className={cx("grid size-8 place-items-center rounded-full", centre && "bg-o text-[#160904] shadow-[0_8px_24px_-8px_rgba(255,90,31,.9)]")}>
                    <Ico nom={e.icone} className={centre ? "size-5" : "size-[22px]"} />
                  </span>
                  <span className="truncate">{e.court}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
