"use client";
/* Cadre de l'espace sur ordinateur : menu latéral repliable, comme sur Claude. Le bouton « panneau » est dans l'en-tête
   du menu (à droite du logo) ; replié, le menu ne garde que les icônes (76 px) et ce bouton en haut. Au survol d'une icône,
   son intitulé s'affiche dans une bulle (classes .bulle / .bulle-seule, globals.css). Le choix est gardé dans le navigateur.
   Les styles du mode replié visent seulement le menu (group/menu sur l'aside) : le contenu de la page n'est jamais touché. */
import { useCallback, useSyncExternalStore, type ReactNode } from "react";
import { Ico } from "./Icones";

const CLE = "utp-menu-replie";
const EVENEMENT = "utp-menu";

function lire() {
  try {
    return localStorage.getItem(CLE) === "1";
  } catch {
    return false;
  }
}
const abonner = (f: () => void) => {
  addEventListener(EVENEMENT, f);
  addEventListener("storage", f);
  return () => {
    removeEventListener(EVENEMENT, f);
    removeEventListener("storage", f);
  };
};

export function CadreEspace({ logo, menu, children }: { logo: ReactNode; menu: ReactNode; children: ReactNode }) {
  const replie = useSyncExternalStore(abonner, lire, () => false);
  const basculer = useCallback(() => {
    try {
      localStorage.setItem(CLE, replie ? "0" : "1");
    } catch {
      /* stockage indisponible : le choix vaut pour cette page seulement */
    }
    dispatchEvent(new Event(EVENEMENT));
  }, [replie]);
  const libelle = replie ? "Ouvrir le menu" : "Replier le menu";
  return (
    <div data-replie={replie} className="min-h-dvh lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:transition-[grid-template-columns] lg:duration-200 lg:data-[replie=true]:grid-cols-[76px_minmax(0,1fr)] motion-reduce:transition-none">
      <aside
        id="menu-lateral"
        data-replie={replie}
        className="group/menu sticky top-0 z-30 hidden h-dvh flex-col gap-5 overflow-y-auto overflow-x-hidden border-r border-line bg-bg0/60 px-4 py-4 lg:flex lg:group-data-[replie=true]/menu:items-center lg:data-[replie=true]:px-3"
      >
        <div className="flex h-10 w-full items-center justify-between gap-2 lg:group-data-[replie=true]/menu:justify-center">
          <div className="min-w-0 lg:group-data-[replie=true]/menu:hidden">{logo}</div>
          <button
            type="button"
            onClick={basculer}
            aria-expanded={!replie}
            aria-controls="menu-lateral"
            aria-label={libelle}
            className="a-bulle grid size-9 shrink-0 place-items-center rounded-lg text-ink-3 transition hover:bg-glass hover:text-ink"
          >
            <Ico nom="panneau" className="size-5" />
            <span className="bulle-seule bulle-bas" aria-hidden="true">
              {libelle}
            </span>
          </button>
        </div>
        {menu}
      </aside>
      {children}
    </div>
  );
}
