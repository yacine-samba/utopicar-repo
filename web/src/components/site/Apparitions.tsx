"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Révèle les éléments « .apparait » quand ils entrent dans l'écran, sur toutes les pages. */
export function Apparitions() {
  const chemin = usePathname();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".apparait:not(.vu)"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("vu"));
      return;
    }
    const io = new IntersectionObserver(
      (entrees) =>
        entrees.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("vu");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [chemin]);
  return null;
}
