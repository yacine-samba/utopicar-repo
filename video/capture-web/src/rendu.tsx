/* Rendu serveur (react-dom/server) des vrais composants de web/, sans Next. Chaque page renvoie le contenu de <body>
   tel que la mise en page de l'app l'entoure (main#contenu de l'espace /app, ou du site public). */
import "./horloge"; // en premier : fige la date avant tout calcul
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Tableau } from "./tableau";
import { bilan } from "@/lib/analyse/bilan";
import type { Analyse } from "@/lib/analyse/couts";
import type { ProfilAnalyse } from "@/lib/analyse/profil";
import { Bilan } from "@/components/analyse/Bilan";
import { ProfilAnalyseFournisseur } from "@/components/analyse/ProfilAnalyse";
import { CartesOffres } from "@/components/site/CartesOffres";
import { BoutonAbonner } from "@/components/site/BoutonAbonner";
import { TroisVerdicts } from "@/components/accueil/TroisVerdicts";
import rapport from "../data/classeA-rapport.json";

/** <main> de l'espace connecté (web/src/app/app/layout.tsx). */
const MainEspace = ({ children }: { children: ReactNode }) => (
  <main id="contenu" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 outline-none sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
    {children}
  </main>
);
/** <main> du site public (web/src/app/(site)/layout.tsx). */
const MainSite = ({ children }: { children: ReactNode }) => (
  <main id="contenu" tabIndex={-1} className="outline-none">
    {children}
  </main>
);

/** Le rapport Benef de la Mercedes Classe A : Bilan nourri par bilan() avec le profil enregistré dans le rapport. */
function RapportMercedes() {
  const a = rapport as unknown as Analyse & { profil: ProfilAnalyse };
  const b = bilan(a, a.profil);
  return (
    <ProfilAnalyseFournisseur initial={a.profil}>
      {/* colonne principale du rapport complet (web/src/components/benef/RapportComplet.tsx) */}
      <div className="grid gap-6 pb-20 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:pb-0">
        <div className="grid min-w-0 gap-5">
          <Bilan a={a} b={b} lien={a.lien ?? null} rapportId="demo" />
        </div>
      </div>
    </ProfilAnalyseFournisseur>
  );
}

export const PAGES: Record<string, { titre: string; zone: "espace" | "site"; corps: () => ReactNode }> = {
  tableau: { titre: "Tableau de bord Benef Pro", zone: "espace", corps: () => <MainEspace><Tableau /></MainEspace> },
  "rapport-mercedes": { titre: "Rapport Benef Mercedes Classe A", zone: "espace", corps: () => <MainEspace><RapportMercedes /></MainEspace> },
  offres: {
    titre: "Formules Starter et Pro",
    zone: "site",
    corps: () => (
      <MainSite>
        <div className="wrap py-14">
          <CartesOffres ids={["starter", "pro"]} />
        </div>
      </MainSite>
    ),
  },
  bouton: {
    titre: "Bouton Essayer 3 jours",
    zone: "site",
    corps: () => (
      <MainSite>
        <div className="wrap py-14">
          <div id="bouton-essai" className="mx-auto w-fit p-8">
            <BoutonAbonner produit="starter" className="btn btn-o">Essayer 3 jours</BoutonAbonner>
          </div>
        </div>
      </MainSite>
    ),
  },
  "trois-verdicts": {
    titre: "Trois annonces, trois verdicts",
    zone: "site",
    corps: () => (
      <MainSite>
        <section className="py-16">
          <div className="wrap">
            <div className="mx-auto max-w-5xl">
              <TroisVerdicts />
            </div>
          </div>
        </section>
      </MainSite>
    ),
  },
};

export const rendre = (nom: string) => renderToStaticMarkup(<>{PAGES[nom].corps()}</>);
/** Chiffres clés recalculés par bilan(), pour vérification. */
export function chiffresBilan() {
  const a = rapport as unknown as Analyse & { profil: ProfilAnalyse };
  const b = bilan(a, a.profil);
  return { libelle: b.libelle, indice: b.indice, phrase: b.phrase, marge: b.argent.marge, plafond: b.argent.plafond, offre: b.argent.offre, cible: b.argent.cible, scenarios: b.argent.scenarios, autres: b.historique?.autres };
}
