"use client";
/* « Ce chiffre est faux ? » : sur chaque réponse du bilan, la personne dit ce qu'elle sait (prix de vente réel, devis,
   état constaté). Les retours servent à régler l'analyse (page Administration › Justesse). */
import { useState } from "react";
import { supabaseNavigateur } from "@/lib/supabase/navigateur";
import { cx, inputCls } from "@/lib/cx";

export type ChampRetour = "verdict" | "fiabilite" | "travaux" | "prix" | "rentabilite" | "usage" | "cote" | "autre";

export function RetourChiffre({ rapportId, champ, valeur, className }: { rapportId: string; champ: ChampRetour; valeur: string; className?: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [juste, setJuste] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [etat, setEtat] = useState<"" | "envoi" | "ok" | "erreur">("");
  if (etat === "ok") return <p className={cx("text-xs text-ok", className)}>Merci, c&apos;est noté : votre retour sert à régler l&apos;analyse.</p>;
  if (!ouvert)
    return (
      <button type="button" onClick={() => setOuvert(true)} className={cx("text-xs text-ink-3 underline-offset-4 hover:text-o2 hover:underline", className)}>
        Ce chiffre vous semble faux ?
      </button>
    );
  return (
    <form
      className={cx("grid gap-2 rounded-xl border border-line-2 bg-black/20 p-3 text-sm", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        setEtat("envoi");
        const { error } = await supabaseNavigateur()
          .from("retours_analyse")
          .insert({ rapport_id: rapportId, champ, valeur_outil: valeur.slice(0, 80), valeur_juste: juste.trim().slice(0, 80) || null, commentaire: commentaire.trim().slice(0, 600) || null });
        setEtat(error ? "erreur" : "ok");
      }}
    >
      <p className="text-ink-2">
        L&apos;analyse indique <b className="text-ink">{valeur}</b>. Qu&apos;en savez-vous ?
      </p>
      <input value={juste} onChange={(e) => setJuste(e.target.value)} placeholder="La bonne valeur, si vous la connaissez (ex. 6 200 €, devis 900 €)" className={cx(inputCls, "py-1.5 text-sm")} aria-label="Bonne valeur" />
      <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} rows={2} placeholder="Pourquoi (facultatif) : vendue à ce prix, devis du garage, défaut constaté…" className={cx(inputCls, "py-1.5 text-sm")} aria-label="Commentaire" />
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => setOuvert(false)} className="text-xs text-ink-3">
          Annuler
        </button>
        <button type="submit" disabled={etat === "envoi" || (!juste.trim() && !commentaire.trim())} className="btn btn-sm">
          Envoyer
        </button>
      </div>
      {etat === "erreur" && <p role="status" className="text-xs text-bad">Envoi impossible pour le moment.</p>}
    </form>
  );
}
