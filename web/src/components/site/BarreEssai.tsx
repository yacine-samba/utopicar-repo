"use client";
import { useEffect, useState } from "react";

/** Téléphone : dès que le champ d'essai sort de l'écran, une barre en bas ramène à lui en un geste.
    Elle se cache quand le champ (ou l'appel final) est visible, pour ne jamais doubler un bouton à l'écran. */
export function BarreEssai({ libelle = "Analyser une annonce", sous = "gratuit" }: { libelle?: string; sous?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const cibles = [document.getElementById("essai"), document.getElementById("appel-final")].filter((x): x is HTMLElement => !!x);
    if (!cibles.length || !("IntersectionObserver" in window)) return;
    const vues = new Map<Element, boolean>();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => vues.set(e.target, e.isIntersecting));
      // visible seulement après avoir dépassé le champ (pas avant de l'avoir vu)
      const essai = document.getElementById("essai");
      const depasse = !!essai && essai.getBoundingClientRect().bottom < 0;
      setVisible(depasse && ![...vues.values()].some(Boolean));
    });
    cibles.forEach((c) => io.observe(c));
    const defile = () => {
      const essai = document.getElementById("essai");
      if (essai && essai.getBoundingClientRect().bottom >= 0) setVisible(false);
    };
    addEventListener("scroll", defile, { passive: true });
    return () => {
      io.disconnect();
      removeEventListener("scroll", defile);
    };
  }, []);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg0/92 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition duration-300 sm:hidden ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`}
      aria-hidden={!visible}
    >
      <a href="#essai" tabIndex={visible ? 0 : -1} className="btn btn-o w-full whitespace-nowrap">
        {libelle}
        <span className="text-sm font-medium opacity-75">· {sous}</span>
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
