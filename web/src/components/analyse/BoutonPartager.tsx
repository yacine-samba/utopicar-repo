"use client";
/* Partager un rapport : un lien public en lecture seule (/r/<jeton>), sans les coordonnées du vendeur, pour demander
   l'avis d'un proche ou d'un mécanicien. Le partage du téléphone s'ouvre quand il existe ; sinon le lien est copié. */
import { useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { cx } from "@/lib/cx";

export function BoutonPartager({ rapportId, initial, titre }: { rapportId: string; initial: string | null; titre: string }) {
  const [jeton, setJeton] = useState(initial);
  const [ouvert, setOuvert] = useState(false);
  const [etat, setEtat] = useState<"" | "copie" | "erreur" | "envoi">("");
  // calculé seulement fenêtre ouverte : jamais pendant le rendu serveur (pas de location)
  const url = ouvert && jeton ? `${location.origin}/r/${jeton}` : "";

  async function partager() {
    setEtat("envoi");
    let j = jeton;
    if (!j) {
      const { data, error } = await supabaseNavigateur().rpc("rapport_partager", { p_id: rapportId });
      if (error || !data) return setEtat("erreur");
      j = data as string;
      setJeton(j);
    }
    const lien = `${location.origin}/r/${j}`;
    setOuvert(true);
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: `Analyse Utopicar : ${titre}`, text: "Qu'en penses-tu ? Voici l'analyse de l'annonce.", url: lien });
        return setEtat("");
      } catch {
        /* partage annulé : on copie */
      }
    }
    try {
      await navigator.clipboard.writeText(lien);
      setEtat("copie");
    } catch {
      setEtat("");
    }
  }

  async function arreter() {
    const { error } = await supabaseNavigateur().rpc("rapport_departager", { p_id: rapportId });
    if (!error) {
      setJeton(null);
      setOuvert(false);
      setEtat("");
    }
  }

  return (
    <div className="relative">
      <button type="button" onClick={partager} disabled={etat === "envoi"} className={cx("btn btn-sm shrink-0 whitespace-nowrap max-sm:px-3", jeton && "border-o/50")} aria-expanded={ouvert}>
        Partager
      </button>
      {ouvert && (
        <div role="dialog" aria-label="Lien de partage" className="absolute right-0 top-full z-40 mt-2 grid w-[min(86vw,340px)] gap-2 rounded-2xl border border-line-2 bg-bg1 p-4 text-sm shadow-[0_20px_60px_-20px_rgb(0_0_0/0.9)]">
          <p className="text-ink-2">{etat === "copie" ? "Lien copié." : "Lien du rapport :"} Il montre le bilan, sans les coordonnées du vendeur.</p>
          {url && <input readOnly value={url} onFocus={(e) => e.target.select()} className="w-full rounded-lg border border-line bg-black/30 px-2 py-1.5 text-xs text-ink-2" aria-label="Lien public du rapport" />}
          <div className="flex flex-wrap justify-between gap-2">
            <button type="button" onClick={arreter} className="text-ink-3 underline underline-offset-4 hover:text-bad">
              Arrêter le partage
            </button>
            <button type="button" onClick={() => setOuvert(false)} className="text-o2">
              Fermer
            </button>
          </div>
        </div>
      )}
      {etat === "erreur" && <span role="status" className="absolute right-0 top-full mt-2 whitespace-nowrap text-xs text-bad">Partage impossible pour le moment.</span>}
    </div>
  );
}
