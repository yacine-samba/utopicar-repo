"use client";
import { useEffect, type RefObject } from "react";

/* Fenêtres de l'espace (paramètres, nouvelle campagne, recherche rapide, sommaire, analyse, photos) :
   tant qu'elle est ouverte, Tab et Maj+Tab tournent dans la fenêtre ; à la fermeture, le focus revient
   sur l'élément qui l'avait ouverte. La touche Échap reste gérée par chaque fenêtre. */

const FOCUSABLES = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function usePiegeFocus(ref: RefObject<HTMLElement | null>, actif: boolean) {
  useEffect(() => {
    if (!actif) return;
    const avant = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const el = ref.current;
    if (!el) return;
    const liste = () => Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLES)).filter((x) => x.getClientRects().length > 0);
    // une fenêtre qui place elle-même le focus (champ de saisie) garde son choix
    const t = setTimeout(() => {
      if (!el.contains(document.activeElement)) (liste()[0] ?? el).focus();
    }, 0);
    const f = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const l = liste();
      if (!l.length) return e.preventDefault();
      const premier = l[0];
      const dernier = l[l.length - 1];
      const ici = document.activeElement;
      if (e.shiftKey && (ici === premier || !el.contains(ici))) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && (ici === dernier || !el.contains(ici))) {
        e.preventDefault();
        premier.focus();
      }
    };
    document.addEventListener("keydown", f);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", f);
      if (avant?.isConnected) avant.focus();
    };
  }, [actif, ref]);
}
