"use client";
import { useEffect, useState } from "react";

/** Met en pause toutes les animations du site (préférence gardée dans le navigateur). */
export function BoutonAnimations({ className }: { className?: string }) {
  const [calme, setCalme] = useState(false);
  useEffect(() => {
    let v = false;
    try {
      v = localStorage.getItem("utp-calme") === "1";
    } catch {
      /* stockage indisponible */
    }
    document.documentElement.toggleAttribute("data-calme", v);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique de la préférence
    setCalme(v);
    // un autre bouton pause de la page a été actionné
    const suivre = (e: Event) => setCalme((e as CustomEvent<boolean>).detail);
    addEventListener("utp-calme", suivre);
    return () => removeEventListener("utp-calme", suivre);
  }, []);
  return (
    <button
      type="button"
      aria-pressed={calme}
      className={className}
      onClick={() => {
        const v = !calme;
        setCalme(v);
        document.documentElement.toggleAttribute("data-calme", v);
        dispatchEvent(new CustomEvent("utp-calme", { detail: v }));
        try {
          localStorage.setItem("utp-calme", v ? "1" : "0");
        } catch {
          /* stockage indisponible */
        }
      }}
    >
      {calme ? "Relancer les animations" : "Mettre les animations en pause"}
    </button>
  );
}
