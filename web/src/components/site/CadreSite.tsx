import type { ReactNode } from "react";
import { themeSite } from "@/lib/theme";

/** Cadre des pages du site public : porte le thème (variables de couleur redéfinies dans globals.css) et peint le fond.
    En clair, la barre de défilement et le fond de la page passent aussi en clair ; ce style disparaît en entrant dans /app. */
export async function CadreSite({ children }: { children: ReactNode }) {
  const theme = await themeSite();
  return (
    <>
      {theme === "clair" && <style>{":root{color-scheme:light}body{background:#f7f2ea}"}</style>}
      <div id="site" data-theme={theme} className="cadre-site">
        {children}
      </div>
    </>
  );
}
