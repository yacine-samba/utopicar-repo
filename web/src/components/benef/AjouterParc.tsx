"use client";
import Link from "next/link";
import { useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";

/** Ajoute la voiture d'un rapport au parc (formule Pro). */
export function AjouterParc({ rapportId, titre, prix }: { rapportId: string; titre: string; prix: number | null }) {
  const [etat, setEtat] = useState<"" | "ok" | "err">("");
  if (etat === "ok")
    return (
      <Link href="/app/parc" className="btn">
        Ajoutée au parc : voir le parc
      </Link>
    );
  return (
    <>
      <button
        type="button"
        className="btn"
        onClick={async () => {
          const { error } = await supabaseNavigateur().from("parc").insert({ rapport_id: rapportId, titre: titre.slice(0, 140), prix_achat: prix, statut: "repere" });
          setEtat(error ? "err" : "ok");
        }}
      >
        Ajouter au parc
      </button>
      {etat === "err" && <span role="alert" className="text-sm text-warn">Ajout impossible. Réessayez.</span>}
    </>
  );
}
