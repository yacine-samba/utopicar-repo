"use client";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cx } from "@/lib/cx";

export type Avis = { titre: string; texte?: string; ton?: "ok" | "warn"; action?: { l: string; onClick: () => void } };

const rien = () => () => {};

/** Notification qui descend du haut de l'écran (fin d'une recherche, d'une alerte…). Disparaît seule après 8 s.
    Si l'onglet est en arrière-plan, son titre l'annonce aussi jusqu'au retour de la personne. */
export function useNotification() {
  const [avis, setAvis] = useState<(Avis & { n: number }) | null>(null);
  const [visible, setVisible] = useState(false);
  const minuteur = useRef<ReturnType<typeof setTimeout>>(undefined);
  const monte = useSyncExternalStore(rien, () => true, () => false);

  const fermer = useCallback(() => {
    setVisible(false);
    clearTimeout(minuteur.current);
  }, []);

  const notifier = useCallback((a: Avis) => {
    setAvis({ ...a, n: Date.now() });
    requestAnimationFrame(() => setVisible(true));
    clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setVisible(false), 8000);
    if (document.hidden) {
      const avant = document.title;
      document.title = `✓ ${a.titre}`;
      const retour = () => {
        if (document.hidden) return;
        document.title = avant;
        document.removeEventListener("visibilitychange", retour);
      };
      document.addEventListener("visibilitychange", retour);
    }
  }, []);

  useEffect(() => () => clearTimeout(minuteur.current), []);

  const element =
    monte && avis
      ? createPortal(
          <div className="pointer-events-none fixed inset-x-3 top-3 z-[80] flex justify-center" role="status" aria-live="polite">
            <div
              key={avis.n}
              className={cx(
                "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border bg-bg1 p-4 shadow-[0_24px_60px_-16px_rgb(0_0_0/0.85)] transition-all duration-300",
                avis.ton === "warn" ? "border-warn/50" : "border-ok/50",
                visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-6 opacity-0",
              )}
            >
              <span className={cx("mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold", avis.ton === "warn" ? "bg-warn/20 text-warn" : "bg-ok/20 text-ok")} aria-hidden="true">
                {avis.ton === "warn" ? "!" : "✓"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{avis.titre}</p>
                {avis.texte && <p className="mt-0.5 text-sm text-ink-2">{avis.texte}</p>}
                {avis.action && (
                  <button
                    type="button"
                    onClick={() => {
                      avis.action!.onClick();
                      fermer();
                    }}
                    className="mt-2 text-sm font-semibold text-o2 underline-offset-4 hover:underline"
                  >
                    {avis.action.l}
                  </button>
                )}
              </div>
              <button type="button" onClick={fermer} aria-label="Fermer la notification" className="grid size-7 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-glass hover:text-ink">
                ✕
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return { notifier, element };
}
