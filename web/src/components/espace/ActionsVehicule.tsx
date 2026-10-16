"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cx } from "@/lib/cx";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import type { Vehicule } from "@/lib/parc";
import { Ico } from "./Icones";
import { annoncer } from "./Notification";

type Modif = Partial<Pick<Vehicule, "statut" | "date_achat" | "epingle" | "archive">>;

/** Décider sans ouvrir la fiche : acheter ou abandonner une voiture repérée, l'épingler en tête, l'archiver.
    Chaque changement s'annule depuis la notification. Utilisé dans « Votre journée » et la liste du parc. */
export function ActionsVehicule({ v, decider, className }: { v: Pick<Vehicule, "id" | "titre" | "statut" | "date_achat" | "epingle" | "archive">; decider?: boolean; className?: string }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);

  async function changer(m: Modif, avant: Modif, titre: string) {
    setEnCours(true);
    const sb = supabaseNavigateur();
    const { error } = await sb.from("parc").update(m).eq("id", v.id);
    setEnCours(false);
    if (error) {
      annoncer({ titre: "Changement non enregistré", texte: "Réessayez dans un instant.", ton: "warn" });
      return;
    }
    router.refresh();
    annoncer({
      titre,
      action: {
        l: "Annuler",
        onClick: async () => {
          await sb.from("parc").update(avant).eq("id", v.id);
          router.refresh();
        },
      },
    });
  }

  const nom = v.titre || "cette voiture";
  const aujourdhui = new Date().toISOString().slice(0, 10);
  return (
    <div className={cx("relative z-10 flex flex-wrap items-center gap-2", className)}>
      {decider && v.statut === "repere" && (
        <>
          <button
            type="button"
            disabled={enCours}
            className="btn btn-o btn-sm min-h-9"
            onClick={() => changer({ statut: "achete", date_achat: v.date_achat ?? aujourdhui }, { statut: v.statut, date_achat: v.date_achat }, `Achetée : ${nom}`)}
          >
            Acheter
          </button>
          <button
            type="button"
            disabled={enCours}
            className="btn btn-sm min-h-9"
            onClick={() => changer({ statut: "abandonne" }, { statut: v.statut }, `Abandonnée : ${nom}`)}
          >
            Abandonner
          </button>
        </>
      )}
      <button
        type="button"
        disabled={enCours}
        aria-pressed={!!v.epingle}
        aria-label={v.epingle ? `Désépingler ${nom}` : `Épingler ${nom} en tête`}
        title={v.epingle ? "Désépingler" : "Épingler en tête"}
        className={cx("grid size-9 place-items-center rounded-full border transition", v.epingle ? "border-o/50 bg-o/15 text-o2" : "border-line-2 text-ink-3 hover:text-ink")}
        onClick={() => changer({ epingle: !v.epingle }, { epingle: !!v.epingle }, v.epingle ? `Désépinglée : ${nom}` : `Épinglée en tête : ${nom}`)}
      >
        <Ico nom="epingle" className="size-4" />
      </button>
      <button
        type="button"
        disabled={enCours}
        aria-label={v.archive ? `Désarchiver ${nom}` : `Archiver ${nom}`}
        title={v.archive ? "Désarchiver" : "Archiver"}
        className={cx("grid size-9 place-items-center rounded-full border transition", v.archive ? "border-o/50 bg-o/15 text-o2" : "border-line-2 text-ink-3 hover:text-ink")}
        onClick={() => changer({ archive: !v.archive, ...(v.archive ? {} : { epingle: false }) }, { archive: !!v.archive, epingle: !!v.epingle }, v.archive ? `Remise dans le parc : ${nom}` : `Archivée : ${nom}`)}
      >
        <Ico nom="archive" className="size-4" />
      </button>
    </div>
  );
}
