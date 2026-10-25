"use client";
/* Nombre d'inscrits en direct (route /api/stats, sans les comptes de l'équipe ni ceux de test).
   Relu toutes les 30 s tant que la page est affichée ; le chiffre monte jusqu'à sa nouvelle valeur.
   Rien ne s'affiche tant que le chiffre n'est pas connu, ou s'il est sous MINIMUM (un petit nombre dessert plus qu'il ne rassure). */
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

const MINIMUM = 10;
const INTERVALLE = 30_000;
type Stats = { inscrits: number; semaine: number };

export function CompteurInscrits({ className, semaine = true }: { className?: string; semaine?: boolean }) {
  const [s, setS] = useState<Stats | null>(null);
  const [affiche, setAffiche] = useState(0);
  const prec = useRef(0);

  useEffect(() => {
    let fin = false;
    const lire = async () => {
      if (document.visibilityState !== "visible") return;
      const r = await fetch("/api/stats").catch(() => null);
      const j = r?.ok ? ((await r.json().catch(() => null)) as Stats | null) : null;
      if (!fin && j && typeof j.inscrits === "number") setS(j);
    };
    void lire();
    const id = setInterval(lire, INTERVALLE);
    const vis = () => document.visibilityState === "visible" && void lire();
    document.addEventListener("visibilitychange", vis);
    return () => {
      fin = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  // le chiffre monte de l'ancienne valeur à la nouvelle (0,8 s), sauf animations réduites
  useEffect(() => {
    if (!s) return;
    const de = prec.current, a = s.inscrits;
    prec.current = a;
    if (de === a || matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-calme")) return setAffiche(a);
    let raf = 0;
    const t0 = performance.now();
    const pas = (t: number) => {
      const k = Math.min(1, (t - t0) / 800);
      setAffiche(Math.round(de + (a - de) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(pas);
    };
    raf = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(raf);
  }, [s]);

  const visible = !!s && s.inscrits >= MINIMUM;
  return (
    <p className={cx("flex min-h-6 items-center gap-2 text-sm text-ink-2 transition-opacity duration-500", visible ? "opacity-100" : "opacity-0", className)} aria-hidden={!visible} title="Mis à jour en direct">
      {visible && (
        <>
          <span className="relative flex size-2.5 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-ok" />
          </span>
          <span>
            <b className="num font-semibold text-ink">{affiche.toLocaleString("fr-FR")}</b> personnes inscrites
            {semaine && s.semaine >= 3 && <span className="text-ink-3"> · +{s.semaine.toLocaleString("fr-FR")} cette semaine</span>}
          </span>
        </>
      )}
    </p>
  );
}
