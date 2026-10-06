"use client";
/* Alerte e-mail d'une recherche : un simple interrupteur. Allumé la première fois, il crée l'alerte Leboncoin avec les
   critères de la recherche (toutes les 3 heures, e-mail à l'adresse du compte) ; ensuite il la met en pause ou la relance. */
import { useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import type { Recherche } from "@/lib/recherches";
import type { CatMarque } from "@/lib/vehicules/types";
import { cx } from "@/lib/cx";
import { versFiltres, type Formulaire } from "./Alertes";

async function appel(corps: unknown) {
  const r = await fetch("/api/alertes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.erreur ?? "Modification impossible. Réessayez.");
  return j as { id?: string };
}

/** Critères de la recherche au format du formulaire d'alerte. */
function formulaire(r: Recherche): Formulaire {
  const { choix, f } = r.criteres;
  return {
    marque: choix.marque, modele: choix.modele, gen: choix.gen ?? "", energie: f.energie ?? "", boite: f.boite ?? "",
    anneeMin: f.anneeMin ?? "", anneeMax: f.anneeMax ?? "", prixMin: f.prixMin ?? "", prixMax: f.prixMax ?? "", kmMax: f.kmMax ?? "",
    vendeur: f.vendeur === "pro" ? "pro" : f.vendeur === "particulier" ? "particulier" : "tous",
    mots: f.mots ?? "", exclure: f.exclure ?? "", sousCote: f.sousCote ?? "", version: f.version ?? "", moteur: f.moteur ?? "", chMin: f.chMin ?? "", chMax: f.chMax ?? "",
  };
}

export function InterrupteurAlerte({ r, actif: initial, cat, onChange, className }: { r: Recherche; actif: boolean; cat: CatMarque[] | null; onChange?: (alerteId: string, actif: boolean) => void; className?: string }) {
  const [actif, setActif] = useState(initial);
  const [occupe, setOccupe] = useState(false);
  const [err, setErr] = useState("");
  async function basculer() {
    const suivant = !actif;
    setOccupe(true);
    setErr("");
    try {
      let id = r.alerte_id ?? null;
      if (id) await appel({ action: "basculer", id, actif: suivant, notifier: suivant });
      else if (suivant) {
        if (!cat) throw new Error("Catalogue en cours de chargement, réessayez dans un instant.");
        const j = await appel({ action: "enregistrer", alerte: { nom: r.nom.slice(0, 80), actif: true, notifier: true, intervalle_min: 180, filtres: versFiltres(formulaire(r), cat) } });
        id = j.id ?? null;
        if (id) await supabaseNavigateur().from("recherches").update({ alerte_id: id }).eq("id", r.id);
      }
      setActif(suivant);
      if (id) onChange?.(id, suivant);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setOccupe(false);
    }
  }
  return (
    <span className={cx("inline-flex flex-wrap items-center gap-2", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={actif}
        disabled={occupe}
        onClick={basculer}
        title={actif ? "Alerte e-mail active : les nouvelles annonces arrivent par e-mail" : "Recevoir les nouvelles annonces de cette recherche par e-mail"}
        className={cx("flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition", actif ? "border-ok/50 text-ok" : "border-line-2 text-ink-2 hover:text-ink", occupe && "opacity-60")}
      >
        <span className={cx("relative h-4 w-7 rounded-full transition", actif ? "bg-ok" : "bg-line-2")} aria-hidden="true">
          <span className={cx("absolute top-0.5 size-3 rounded-full bg-ink transition", actif ? "left-3.5" : "left-0.5")} />
        </span>
        Alerte e-mail
      </button>
      {err && <span role="alert" className="text-xs text-warn">{err}</span>}
    </span>
  );
}
