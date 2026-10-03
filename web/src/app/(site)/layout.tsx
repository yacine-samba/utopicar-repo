import type { ReactNode } from "react";
import { EnTete } from "@/components/site/EnTete";
import { Pied } from "@/components/site/Pied";
import { Onboarding } from "@/components/site/Onboarding";

/** Site public : en-tête, pied de page et accueil des nouveaux visiteurs. L'espace connecté (/app) a sa propre mise en page. */
export default function LayoutSite({ children }: { children: ReactNode }) {
  return (
    <>
      <EnTete />
      <main id="contenu" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Pied />
      <Onboarding />
    </>
  );
}
