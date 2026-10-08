import type { ReactNode } from "react";
import { EnTete } from "@/components/site/EnTete";
import { Pied } from "@/components/site/Pied";
import { JsonLdSite } from "@/components/site/JsonLd";

/** Site public : en-tête et pied de page. L'espace connecté (/app) a sa propre mise en page. */
export default function LayoutSite({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLdSite />
      <EnTete />
      <main id="contenu" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Pied />
    </>
  );
}
