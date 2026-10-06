"use client";
import { useState } from "react";
import { lienImportable } from "@/lib/analyse/import";
import { cx } from "@/lib/cx";
import { useAnalyseEnFond } from "./AnalysesEnFond";
import { Ico } from "./Icones";

/** « Analyser » à côté de l'étoile des favoris : lance tout de suite l'analyse de l'annonce, en arrière-plan. */
export function BoutonAnalyserAnnonce({ url, className }: { url: string | null; className?: string }) {
  const fond = useAnalyseEnFond();
  const [lance, setLance] = useState(false);
  if (!url || !lienImportable(url) || !fond?.actif) return null;
  return (
    <button
      type="button"
      disabled={lance}
      onClick={() => {
        setLance(true);
        void fond.lancer(url);
      }}
      title="Analyser cette annonce (en arrière-plan)"
      className={cx("btn btn-sm gap-1.5", lance && "opacity-70", className)}
    >
      <Ico nom="analyser" className="size-4" />
      {lance ? "Analyse lancée" : "Analyser"}
    </button>
  );
}
