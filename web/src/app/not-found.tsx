import type { Metadata } from "next";
import { EnTete } from "@/components/site/EnTete";
import { Pied } from "@/components/site/Pied";
import { CadreSite } from "@/components/site/CadreSite";
import { Scene404 } from "@/components/site/Scene404";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function Introuvable() {
  return (
    <CadreSite>
      <EnTete />
      <main id="contenu" tabIndex={-1} className="outline-none">
        <Scene404 />
      </main>
      <Pied />
    </CadreSite>
  );
}
