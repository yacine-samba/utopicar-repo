import type { ReactNode } from "react";
import type { Viewport } from "next";
import { CadreSite } from "@/components/site/CadreSite";
import { themeSite } from "@/lib/theme";
import { EnTete } from "@/components/site/EnTete";
import { Pied } from "@/components/site/Pied";
import { JsonLdSite } from "@/components/site/JsonLd";

export async function generateViewport(): Promise<Viewport> {
  return { themeColor: (await themeSite()) === "clair" ? "#f7f2ea" : "#0f0d0b" };
}

/** Site public : en-tête et pied de page, thème clair par défaut ou sombre au choix (CadreSite). L'espace connecté (/app) a sa propre mise en page. */
export default function LayoutSite({ children }: { children: ReactNode }) {
  return (
    <CadreSite>
      <JsonLdSite />
      <EnTete />
      <main id="contenu" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Pied />
    </CadreSite>
  );
}
