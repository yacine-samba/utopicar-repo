"use client";
import { useEffect, useState } from "react";
import type { CatMarque } from "./types";

let promesse: Promise<CatMarque[]> | null = null;
let charge: CatMarque[] | null = null;

/** Catalogue des véhicules, chargé une seule fois (et mis en cache par le navigateur) ; null pendant le chargement. */
export function useCatalogue(actif = true): CatMarque[] | null {
  const [cat, setCat] = useState<CatMarque[] | null>(charge);
  useEffect(() => {
    if (!actif || charge) return;
    let fini = false;
    promesse ??= fetch("/api/catalogue").then((r) => (r.ok ? (r.json() as Promise<CatMarque[]>) : Promise.reject(new Error(String(r.status)))));
    promesse.then(
      (c) => {
        charge = c;
        if (!fini) setCat(c);
      },
      () => {
        promesse = null; // nouvel essai au prochain affichage
      },
    );
    return () => {
      fini = true;
    };
  }, [actif]);
  return cat;
}
