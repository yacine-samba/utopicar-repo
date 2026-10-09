"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cx } from "@/lib/cx";

type Theme = "clair" | "sombre";

/** Bascule clair / sombre du site public : effet immédiat sur la page, choix gardé un an dans un cookie,
    puis rendu serveur rafraîchi (fond et barre de défilement). `ligne` : version texte du menu du téléphone. */
export function BoutonTheme({ initial, ligne = false, className }: { initial: Theme; ligne?: boolean; className?: string }) {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>(initial);
  const suivant: Theme = theme === "clair" ? "sombre" : "clair";
  const libelle = suivant === "sombre" ? "Passer en mode sombre" : "Passer en mode clair";
  const basculer = () => {
    setTheme(suivant);
    document.getElementById("site")?.setAttribute("data-theme", suivant);
    document.cookie = `utp-theme=${suivant}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
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
