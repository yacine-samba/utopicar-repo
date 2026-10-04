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
          const sb = supabaseNavigateur();
          // la fiche reprend tout ce que le rapport sait : photos, lien, vendeur, année, kilométrage, énergie, boîte, prix conseillé
          const { data: r } = await sb.from("rapports").select("titre, photos, lien, vendeur, resultat").eq("id", rapportId).maybeSingle();
          const res = (r?.resultat ?? {}) as { faits?: Record<string, unknown>; ia?: { vehicule?: Record<string, unknown>; marche?: { realiste?: number | null; reventeRapide?: number | null } }; rapport?: { marche?: { reventeRapide?: number } } };
          const faits = res.faits ?? {};
          const veh = res.ia?.vehicule ?? {};
          const num = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? Math.round(x) : null);
          const vend = (r?.vendeur ?? {}) as { nom?: string | null; telephone?: string | null };
          const { error } = await sb.from("parc").insert({
            rapport_id: rapportId,
            titre: [veh.marque, veh.modele].filter(Boolean).join(" ").slice(0, 140) || titre.slice(0, 140),
            finition: typeof veh.version === "string" ? veh.version.slice(0, 140) : null,
            prix_achat: prix,
            statut: "repere",
            annee: num(veh.annee ?? faits.annee),
            km: num(veh.km ?? faits.km),
            energie: typeof (veh.energie ?? faits.energie) === "string" ? String(veh.energie ?? faits.energie).slice(0, 30) : null,
            boite: typeof (veh.boite ?? faits.boite) === "string" ? String(veh.boite ?? faits.boite).slice(0, 30) : null,
            localisation: typeof (veh.localisation ?? faits.ville) === "string" ? String(veh.localisation ?? faits.ville).slice(0, 120) : null,
            prix_conseille: num(res.rapport?.marche?.reventeRapide ?? res.ia?.marche?.reventeRapide ?? res.ia?.marche?.realiste),
            lien: r?.lien ?? null,
            photos: (r?.photos ?? []).slice(0, 12),
            vendeur_nom: vend.nom ?? null,
            vendeur_tel: vend.telephone ?? null,
          });
          setEtat(error ? "err" : "ok");
        }}
      >
        Ajouter au parc
      </button>
      {etat === "err" && <span role="alert" className="text-sm text-warn">Ajout impossible. Réessayez.</span>}
    </>
  );
}
