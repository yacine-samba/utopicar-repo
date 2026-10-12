"use client";
/* Cadre de l'espace sur ordinateur : menu latéral qui se replie. Replié, il ne montre que les icônes (largeur 76 px) ;
   un bouton rond sur son bord l'ouvre et le ferme. Le choix est gardé dans le navigateur. Les textes du menu se masquent
   par CSS (group-data-[replie=true]/menu) : le menu reste rendu côté serveur. Sur téléphone, rien ne change. */
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

export function CadreEspace({ menu, children }: { menu: ReactNode; children: ReactNode }) {
  const replie = useSyncExternalStore(abonner, lire, () => false);
  const basculer = useCallback(() => {
    try {
      localStorage.setItem(CLE, replie ? "0" : "1");
    } catch {
      /* stockage indisponible : le choix vaut pour cette page seulement */
    }
    dispatchEvent(new Event(EVENEMENT));
  }, [replie]);
  return (
    <div data-replie={replie} className="group/menu min-h-dvh lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:data-[replie=true]:grid-cols-[76px_minmax(0,1fr)] lg:transition-[grid-template-columns] lg:duration-200 motion-reduce:transition-none">
      <div className="sticky top-0 z-30 hidden h-dvh lg:block">
        <aside id="menu-lateral" className="flex h-full flex-col gap-5 overflow-y-auto overflow-x-hidden border-r border-line bg-bg0/60 px-4 py-5 lg:group-data-[replie=true]/menu:items-center lg:group-data-[replie=true]/menu:px-3">
          {menu}
        </aside>
        <button
          type="button"
          onClick={basculer}
          aria-expanded={!replie}
          aria-controls="menu-lateral"
          title={replie ? "Ouvrir le menu" : "Replier le menu"}
          className="absolute -right-3.5 top-7 z-40 grid size-7 place-items-center rounded-full border border-line-2 bg-bg1 text-ink-2 shadow-md transition hover:border-o/50 hover:text-ink"
        >
          <span className="sr-only">{replie ? "Ouvrir le menu" : "Replier le menu"}</span>
          <Ico nom={replie ? "deplier" : "replier"} className="size-4" />
        </button>
      </div>
      {children}
    </div>
  );
}
