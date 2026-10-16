"use client";
import Link from "next/link";
import { useRef } from "react";
import { BoutonRetour } from "./BoutonRetour";
import { Polo404 } from "./Polo404";
import { STYLES_404 } from "./scene404-styles";

/* Page introuvable : de nuit, une Polo 5 arrêtée sur le bas-côté, warnings allumés, devant le panneau de la page demandée.
   Profondeur au mouvement de la souris (ciel, panneau, voiture à des vitesses différentes) ; tout s'arrête avec les animations réduites. */

const ANALYSE: [string, string][] = [
  ["Kilométrage", "404 404 km"],
  ["Contrôle technique", "introuvable"],
  ["Historique", "aucune trace"],
  ["Vendeur", "ne répond plus"],
];

// ciel étoilé : positions tirées une fois pour toutes (graine fixe), identiques au serveur et au navigateur
const ETOILES = (() => {
  let g = 404;
  const h = () => {
    g = (g + 0x6d2b79f5) | 0;
    let t = Math.imul(g ^ (g >>> 15), 1 | g);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: 70 }, () => ({ x: (h() * 100).toFixed(2), y: (h() * 60).toFixed(2), d: (1 + h() * 1.6).toFixed(1), o: (0.25 + h() * 0.6).toFixed(2) }));
})();

export function Scene404() {
  const ref = useRef<HTMLElement>(null);
  const bouge = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };

  return (
    <section ref={ref} onPointerMove={bouge} className="n404" aria-labelledby="n404-titre">
      <style href="utp-404" precedence="default">{STYLES_404}</style>
      <div className="n404-ciel" aria-hidden="true">
        {ETOILES.map((e, i) => (
          <span key={i} className="n404-etoile" style={{ left: `${e.x}%`, top: `${e.y}%`, width: `${e.d}px`, height: `${e.d}px`, opacity: e.o }} />
        ))}
      </div>
      <div className="n404-lueur" aria-hidden="true" />

      <div className="n404-contenu wrap">
        <div className="n404-texte">
          <p className="n404-kicker">Erreur 404 · page introuvable</p>
          <h1 id="n404-titre" className="font-display">Déjà vendue.</h1>
          <p className="n404-sous">Comme les bonnes affaires sur Leboncoin : cette page est partie avant que vous arriviez.</p>
          <div className="n404-actions">
            <BoutonRetour secours="/" className="n404-btn n404-btn-o">
              ← Page précédente
            </BoutonRetour>
            <Link href="/" className="n404-btn">Accueil</Link>
            <Link href="/analyse" className="n404-btn">Analyser une vraie annonce</Link>
          </div>
        </div>

        <aside className="n404-ticket" aria-label="Analyse express de cette page (pour rire)">
          <p className="n404-ticket-titre">Analyse express de cette page</p>
          <dl>
            {ANALYSE.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd className="num">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="n404-verdict">
            <span>À éviter</span> Elle n&apos;existe pas. Même négociée, c&apos;est trop cher.
          </p>
        </aside>
      </div>

      <div className="n404-scene" aria-hidden="true">
        <div className="n404-panneau">
          <span className="n404-panneau-plaque">
            <span>Page demandée</span>
            <b className="num">404 km</b>
          </span>
          <span className="n404-panneau-plaque n404-panneau-bas">
            <span>Accueil</span>
            <b className="num">0 km</b>
          </span>
          <span className="n404-panneau-pied" />
        </div>
        <div className="n404-route">
          <span className="n404-bande" />
        </div>
        <div className="n404-voiture">
          <Polo404 className="n404-polo" />
        </div>
      </div>
    </section>
  );
}
