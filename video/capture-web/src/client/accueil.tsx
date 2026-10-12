/* Le champ d'essai de l'accueil (vrai composant Essai, rendu dans le navigateur) dans la colonne gauche du héros.
   « ?exemple=p208 » (ou clio, yaris) clique tout seul sur l'exemple, comme un visiteur : la fiche joue ses étapes
   puis affiche le résultat (tout de suite si les animations sont réduites). */
import { createRoot } from "react-dom/client";
import type { CSSProperties } from "react";
import { Essai } from "@/components/accueil/Essai";
import { Typographie } from "@/components/site/Typographie";
import { EXEMPLES, euros } from "@/lib/demo";

function Heros() {
  return (
    // mêmes conteneurs que le héros de web/src/app/(site)/page.tsx
    <section className="relative overflow-hidden pb-12 pt-10 sm:pt-16">
      <div className="wrap grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
        <div className="text-center lg:text-left lg:[&_p.justify-center]:justify-start">
          <div className="arrivee mt-7" style={{ "--i": 2 } as CSSProperties}>
            <Essai fournisseurs={[]} depuis="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}

createRoot(document.getElementById("racine")!).render(
  <>
    <Heros />
    <Typographie />
  </>,
);

const cle = new URLSearchParams(location.search).get("exemple") ?? document.documentElement.dataset.exemple;
if (cle && EXEMPLES[cle]) {
  const libelle = `${EXEMPLES[cle].onglet} · ${euros(EXEMPLES[cle].prix)}`;
  const essayer = (n = 0) => {
    const b = [...document.querySelectorAll<HTMLButtonElement>("#essai button")].find((x) => x.textContent?.replace(/\s+/g, " ").trim() === libelle.replace(/\s+/g, " "));
    if (b) {
      b.click();
      // un clic de script compte comme un clic au clavier : Chrome dessinerait l'anneau de focus sur le titre de la fiche,
      // qu'un clic à la souris ne montre pas. On retire ce focus une fois posé (après l'image suivante).
      setTimeout(() => (document.activeElement as HTMLElement | null)?.blur(), 120);
    }
    else if (n < 50) setTimeout(() => essayer(n + 1), 50);
  };
  setTimeout(essayer, Number(document.documentElement.dataset.delai ?? 400));
}
