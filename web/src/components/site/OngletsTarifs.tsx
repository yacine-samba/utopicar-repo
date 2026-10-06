"use client";
import { useEffect, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";

type Famille = "particuliers" | "benef";

/** Tarifs : un seul jeu de formules à la fois. « J'achète pour moi » (par défaut) ou Benef, au survol ou au clic.
    Les liens /tarifs#benef et /tarifs#particuliers ouvrent le bon onglet. */
export function OngletsTarifs({ particuliers, benef }: { particuliers: ReactNode; benef: ReactNode }) {
  const [f, setF] = useState<Famille>("particuliers");
  useEffect(() => {
    const lire = () => {
      const h = location.hash.slice(1);
      if (h === "benef" || h === "particuliers") setF(h);
    };
    lire();
    addEventListener("hashchange", lire);
    return () => removeEventListener("hashchange", lire);
  }, []);
  const choisir = (x: Famille) => {
    setF(x);
    history.replaceState(null, "", `#${x}`);
  };
  const bouton = (x: Famille, l: string) => (
    <button
      type="button"
      role="tab"
      id={`t-${x}`}
      aria-selected={f === x}
      aria-controls={`p-${x}`}
      onClick={() => choisir(x)}
      onMouseEnter={() => setF(x)}
      className={cx("whitespace-nowrap rounded-full px-4 py-2 font-medium transition sm:px-5", f === x ? "bg-o text-[#160904]" : "text-ink-2 hover:text-ink")}
    >
      {l}
    </button>
  );
  return (
    <>
      <div role="tablist" aria-label="Familles de formules" className="mx-auto mt-10 flex w-fit gap-1 rounded-full border border-line-2 bg-glass p-1 text-sm">
        {bouton("particuliers", "J'achète pour moi")}
        {bouton("benef", "Benef (achat-revente)")}
      </div>
      <div id="p-particuliers" role="tabpanel" aria-labelledby="t-particuliers" hidden={f !== "particuliers"} className="pt-12">
        {particuliers}
      </div>
      <div id="p-benef" role="tabpanel" aria-labelledby="t-benef" hidden={f !== "benef"} className="pt-12">
        {benef}
      </div>
    </>
  );
}
