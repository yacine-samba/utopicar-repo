import type { Metadata } from "next";
import Link from "next/link";
import { EnTete } from "@/components/site/EnTete";
import { Pied } from "@/components/site/Pied";
import { CadreSite } from "@/components/site/CadreSite";
import { BoutonRetour } from "@/components/site/BoutonRetour";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

const PISTES = [
  { href: "/analyse", t: "Analyser une annonce", d: "Collez un lien Leboncoin : prix face au marché, défauts du moteur, verdict." },
  { href: "/fiabilite", t: "Fiabilité des modèles", d: "Les moteurs à éviter et ceux qui tiennent, modèle par modèle." },
  { href: "/guide", t: "Le guide de l'achat-revente", d: "Acheter, préparer et revendre une voiture sans y perdre." },
];

export default function Introuvable() {
  return (
    <CadreSite>
      <EnTete />
      <main id="contenu" tabIndex={-1} className="outline-none">
        <div className="wrap grid max-w-3xl justify-items-center py-20 text-center sm:py-28">
          <p className="num font-display text-7xl font-semibold text-o2 sm:text-8xl">404</p>
          <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Cette page n&apos;existe pas</h1>
          <p className="mt-3 max-w-md text-ink-2">Le lien est peut-être ancien, mal copié, ou la page a changé d&apos;adresse.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <BoutonRetour secours="/" className="btn btn-o">
              ← Page précédente
            </BoutonRetour>
            <Link href="/" className="btn">
              Accueil
            </Link>
          </div>
          <ul className="mt-14 grid w-full gap-3 text-left sm:grid-cols-3">
            {PISTES.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="carte grid h-full gap-1.5 p-4 transition hover:border-o/40">
                  <span className="font-medium">{p.t}</span>
                  <span className="text-sm text-ink-3">{p.d}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Pied />
    </CadreSite>
  );
}
