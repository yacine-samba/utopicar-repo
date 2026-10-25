"use client";
import { useEffect, useRef } from "react";

/* Case anti-robot Cloudflare Turnstile (le plus souvent invisible). Active seulement si NEXT_PUBLIC_TURNSTILE_SITE_KEY
   est renseignée ; la fonction `compte` vérifie le jeton quand reglages.turnstile_secret l'est aussi. */
export const CLE_TURNSTILE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type Turnstile = { render: (el: HTMLElement, o: Record<string, unknown>) => string; remove: (id: string) => void };
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let chargement: Promise<void> | null = null;
function charger() {
  chargement ??= new Promise((ok, ko) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => ok();
    s.onerror = () => ((chargement = null), ko(new Error("turnstile")));
    document.head.appendChild(s);
  });
  return chargement;
}

/** `onJeton` doit être stable (un setState) : le widget est recréé s'il change. */
export function AntiRobot({ onJeton }: { onJeton: (jeton: string) => void }) {
  const boite = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!CLE_TURNSTILE) return;
    let id: string | null = null;
    let fini = false;
    charger()
      .then(() => {
        if (fini || !boite.current || !window.turnstile) return;
        id = window.turnstile.render(boite.current, {
          sitekey: CLE_TURNSTILE,
          language: "fr",
          theme: "auto",
          callback: (t: string) => onJeton(t),
          "expired-callback": () => onJeton(""),
          "error-callback": () => onJeton(""),
        });
      })
      .catch(() => {});
    return () => {
      fini = true;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, [onJeton]);

  if (!CLE_TURNSTILE) return null;
  return <div ref={boite} className="min-h-[65px]" />;
}
