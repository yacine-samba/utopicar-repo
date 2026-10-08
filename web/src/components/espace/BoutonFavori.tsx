"use client";
import { useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { cx } from "@/lib/cx";
import type { NouveauFavori } from "@/lib/favoris";
import { Ico } from "./Icones";
import { usePreferences } from "./Preferences";

/** Étoile « à revoir plus tard » : ajoute ou retire la voiture des favoris, sans passer par le parc. */
export function BoutonFavori({ f, initial, compact, className, onChange }: { f: NouveauFavori; initial: boolean; compact?: boolean; className?: string; onChange?: (actif: boolean) => void }) {
  const [actif, setActif] = useState(initial);
  const [occupe, setOccupe] = useState(false);
  const { favoris } = usePreferences();
  async function basculer() {
    setOccupe(true);
    const sb = supabaseNavigateur();
    const suivant = !actif;
    setActif(suivant);
    const { error } = suivant
      ? await sb.from("favoris").upsert({ ...f, titre: f.titre.slice(0, 200) || "Annonce", lieu: f.lieu?.slice(0, 120) ?? null }, { onConflict: "user_id,cle" })
      : await sb.from("favoris").delete().eq("cle", f.cle);
    if (error) setActif(!suivant);
    else onChange?.(suivant);
    setOccupe(false);
  }
  // favoris désactivés (Compte › Accessibilité) : pas d'étoile
  if (!favoris) return null;
  return (
    <button
      type="button"
      onClick={basculer}
      disabled={occupe}
      aria-pressed={actif}
      aria-label={actif ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={actif ? "Dans vos favoris" : "À revoir plus tard"}
      className={cx(
        compact ? "grid size-9 place-items-center rounded-full border" : "btn btn-sm gap-1.5",
        actif ? "border-o/60 bg-o/12 text-o2" : "border-line-2 text-ink-2 hover:text-ink",
        className,
      )}
    >
      <Ico nom="favoris" plein={actif} className="size-[18px]" />
      {!compact && (actif ? "En favori" : "Favori")}
    </button>
  );
}
