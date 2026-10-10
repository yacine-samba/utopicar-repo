"use client";
/* Suivi du prix d'une annonce analysée : alerte quand elle baisse sous le prix conseillé par le bilan (plafond pour revendre,
   prix raisonnable pour rouler avec), ou quand elle disparaît (vendue). Le prix vient de la base du marché (collectes)
   ou d'une vérification à la demande (import de l'annonce par son lien, sans consommer d'analyse). */
import Link from "next/link";
import { useState } from "react";
import type { Analyse } from "@/lib/analyse/couts";
import { lireAnnonce } from "@/lib/analyse/texte";
import { texteDepuisImport } from "@/lib/analyse/import";
import { SUPABASE_CLE, SUPABASE_URL } from "@/lib/supabase/config";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { cx } from "@/lib/cx";
import { useBilan } from "./Bilan";
import { useProfilAnalyse } from "./ProfilAnalyse";

export type LigneSuivi = { rapport_id: string; annonce: string; titre: string | null; prix_initial: number | null; prix_conseille: number | null; dernier_prix: number | null; statut: "suivi" | "baisse" | "sous_conseille" | "disparue"; verifie_le: string | null };

const eur = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const STATUTS: Record<LigneSuivi["statut"], { l: string; c: string }> = {
  sous_conseille: { l: "Sous votre prix conseillé", c: "border-ok/40 bg-ok/10 text-ok" },
  baisse: { l: "Prix en baisse", c: "border-o/40 bg-o/10 text-o2" },
  disparue: { l: "Disparue (vendue ?)", c: "border-line-2 text-ink-3" },
  suivi: { l: "Inchangé", c: "border-line-2 text-ink-2" },
};

/** Bouton du rapport : suivre le prix de cette annonce. */
export function BoutonSuivi({ a, rapportId, annonce, titre, initial }: { a: Analyse; rapportId: string; annonce: string; titre: string; initial: boolean }) {
  const b = useBilan(a);
  const [suivi, setSuivi] = useState(initial);
  const [occupe, setOccupe] = useState(false);
  const { profil } = useProfilAnalyse();
  // revente : le prix maximum qui garde le bénéfice minimum ; rouler avec : le prix raisonnable à proposer
  const conseille = profil.objectif === "revente" ? (b.argent.plafond != null && b.argent.plafond > 0 ? b.argent.plafond : null) : b.argent.proposer;
  return (
    <button
      type="button"
      disabled={occupe}
      aria-pressed={suivi}
      title={suivi ? "Ne plus suivre le prix" : `Alerte si le prix passe sous ${eur(conseille)}`}
      onClick={async () => {
        setOccupe(true);
        const sb = supabaseNavigateur();
        const { error } = suivi
          ? await sb.from("suivis").delete().eq("rapport_id", rapportId)
          : await sb.from("suivis").insert({ rapport_id: rapportId, annonce, titre: titre.slice(0, 160), prix_initial: b.argent.prix, prix_conseille: conseille, dernier_prix: b.argent.prix });
        if (!error) setSuivi(!suivi);
        setOccupe(false);
      }}
      className={cx("btn btn-sm shrink-0 whitespace-nowrap max-sm:px-3", suivi && "border-o/50 text-o2")}
    >
      {suivi ? "Prix suivi" : "Suivre le prix"}
    </button>
  );
}

/** Carte du tableau de bord : annonces suivies, avec la vérification du prix à la demande. */
export function AnnoncesSuivies({ initiales }: { initiales: LigneSuivi[] }) {
  const [lignes, setLignes] = useState(initiales);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  if (!lignes.length) return null;

  async function verifier(l: LigneSuivi) {
    setEnCours(l.rapport_id);
    setMessage(null);
    const sb = supabaseNavigateur();
    try {
      const { data } = await sb.auth.getSession();
      const r = await fetch(`${SUPABASE_URL}/functions/v1/annonce`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}`, apikey: SUPABASE_CLE },
        body: JSON.stringify({ url: `https://www.leboncoin.fr/ad/voitures/${l.annonce}` }),
      });
      const j = await r.json().catch(() => null);
      if (j?.erreur === "introuvable") await sb.from("suivis").update({ statut: "disparue", verifie_le: new Date().toISOString() }).eq("rapport_id", l.rapport_id);
      else if (r.ok && j?.ok) {
        const prix = lireAnnonce(texteDepuisImport(j)).prix;
        if (prix != null) await sb.rpc("prix_constate", { p_annonce: l.annonce, p_prix: prix });
      } else setMessage(j?.erreur === "trop" ? "Trop de vérifications aujourd'hui : réessayez demain." : j?.erreur === "quota" ? "La vérification demande au moins une analyse disponible." : "Vérification impossible pour le moment.");
      const { data: maj } = await sb.rpc("suivis_verifier");
      if (Array.isArray(maj)) {
        // une annonce introuvable reste « disparue », même si la base du marché l'a vue récemment
        setLignes((maj as LigneSuivi[]).map((x) => (x.rapport_id === l.rapport_id && j?.erreur === "introuvable" ? { ...x, statut: "disparue" } : x)));
      }
    } catch {
      setMessage("Connexion impossible, réessayez.");
    }
    setEnCours(null);
  }

  return (
    <section className="carte p-5 sm:p-6" aria-labelledby="suivis-titre">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="suivis-titre" className="font-display text-lg font-semibold">Annonces suivies</h2>
        <span className="text-sm text-ink-3">alerte sous le prix conseillé par l&apos;analyse</span>
      </div>
      <ul className="divide-y divide-line">
        {lignes.map((l) => {
          const s = STATUTS[l.statut];
          return (
            <li key={l.rapport_id} className="grid gap-1.5 py-3 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4">
              <span className="min-w-0">
                <Link href={`/app/rapports/${l.rapport_id}`} className="block truncate font-medium hover:text-o2">{l.titre || `Annonce ${l.annonce}`}</Link>
                <span className="num text-sm text-ink-3">
                  {eur(l.dernier_prix ?? l.prix_initial)}
                  {l.prix_initial != null && l.dernier_prix != null && l.dernier_prix !== l.prix_initial ? ` (était ${eur(l.prix_initial)})` : ""} · conseillé {eur(l.prix_conseille)}
                  {l.verifie_le ? ` · vérifié le ${new Date(l.verifie_le).toLocaleDateString("fr-FR")}` : ""}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span className={cx("rounded-full border px-2.5 py-0.5 text-xs", s.c)}>{s.l}</span>
                <button type="button" disabled={enCours != null} onClick={() => verifier(l)} className="btn btn-sm">
                  {enCours === l.rapport_id ? "Vérification…" : "Vérifier"}
                </button>
              </span>
            </li>
          );
        })}
      </ul>
      {message && <p role="status" className="mt-2 text-sm text-warn">{message}</p>}
    </section>
  );
}
