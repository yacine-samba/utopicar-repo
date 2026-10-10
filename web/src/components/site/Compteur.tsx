"use client";
import { useEffect, useRef, useState } from "react";

/** Un vrai chiffre qui monte de 0 à sa valeur en 0,9 s quand il arrive à l'écran.
    Le serveur rend déjà la valeur finale (sans JavaScript, robots, lecteurs d'écran) ; l'animation ne joue
    que si le chiffre n'est pas encore visible et que les animations ne sont pas réduites. */
export function Compteur({ valeur, className }: { valeur: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(valeur);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-calme")) return;
    if (el.getBoundingClientRect().top < innerHeight) return; // déjà à l'écran : on n'efface pas un chiffre déjà lu
    setV(0);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const pas = (t: number) => {
        const k = Math.min(1, (t - t0) / 900);
        setV(Math.round(valeur * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(pas);
      };
      raf = requestAnimationFrame(pas);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [valeur]);
  return (
    <span ref={ref} className={className}>
      {v.toLocaleString("fr-FR").replace(/ /g, " ")}
    </span>
  );
}
