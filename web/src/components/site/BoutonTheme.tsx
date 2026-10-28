"use client";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { cx } from "@/lib/cx";

type Theme = "clair" | "sombre";

type Transition = { ready: Promise<void>; finished: Promise<void> };
type DocTransition = Document & { startViewTransition?: (maj: () => void) => Transition };

/** Bascule clair / sombre du site public : le nouveau thème s'étend en cercle depuis le bouton jusqu'à couvrir la page
    (View Transitions ; changement direct sans elles, en mouvement réduit ou animations en pause). Choix gardé un an
    dans un cookie, puis rendu serveur rafraîchi (fond et barre de défilement). `ligne` : version texte du menu du téléphone. */
export function BoutonTheme({ initial, ligne = false, className }: { initial: Theme; ligne?: boolean; className?: string }) {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>(initial);
  const suivant: Theme = theme === "clair" ? "sombre" : "clair";
  const libelle = suivant === "sombre" ? "Passer en mode sombre" : "Passer en mode clair";
  const appliquer = () => {
    setTheme(suivant);
    document.getElementById("site")?.setAttribute("data-theme", suivant);
    document.documentElement.style.colorScheme = suivant === "clair" ? "light" : "dark";
    document.body.style.background = suivant === "clair" ? "#f7f2ea" : "var(--color-bg0)";
    document.cookie = `utp-theme=${suivant}; path=/; max-age=31536000; samesite=lax`;
  };
  const basculer = (e: MouseEvent<HTMLButtonElement>) => {
    const doc = document as DocTransition;
    const calme = document.documentElement.hasAttribute("data-calme") || matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || calme) {
      appliquer();
      router.refresh();
      return;
    }
    // centre du bouton, et rayon qui atteint le coin de l'écran le plus éloigné
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const rayon = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = doc.startViewTransition(() => flushSync(appliquer));
    t.ready.then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rayon}px at ${x}px ${y}px)`] },
        { duration: 620, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
      ),
    );
    t.finished.then(() => router.refresh());
  };
  const icone =
    suivant === "sombre" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  if (ligne)
    return (
      <button type="button" onClick={basculer} className={cx("flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-lg text-ink-2 hover:bg-glass hover:text-ink", className)}>
        {icone}
        {suivant === "sombre" ? "Mode sombre" : "Mode clair"}
      </button>
    );
  return (
    <button type="button" onClick={basculer} aria-label={libelle} title={libelle} className={cx("grid size-11 place-items-center rounded-full border border-line-2 bg-glass text-ink-2 transition hover:text-ink", className)}>
      {icone}
    </button>
  );
}
