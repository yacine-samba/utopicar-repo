"use client";
import { useState } from "react";
import { Copier } from "../ui";

type Resultat = { titre: string; texte: string; prix: { cle: string; l: string; delai: string; affiche: number; vente: number }[]; photos: string[]; ia: boolean };
const eur = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;

/** Annonce de revente rédigée : prix d'affichage selon le délai, titre et texte à copier, photos à faire. */
export function AnnonceRevente({ parcId }: { parcId: string }) {
  const [r, setR] = useState<Resultat | null>(null);
  const [etat, setEtat] = useState<"" | "envoi" | string>("");
  async function rediger() {
    setEtat("envoi");
    const x = await fetch(`/api/parc/${parcId}/annonce`, { method: "POST" }).catch(() => null);
    const j = x ? await x.json().catch(() => null) : null;
    if (!x?.ok || !j) return setEtat(j?.erreur ?? "Rédaction impossible pour le moment.");
    setR(j);
    setEtat("");
  }
  return (
    <section className="carte grid gap-4 p-5 sm:p-6" aria-labelledby="ar-t">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 id="ar-t" className="font-display text-xl font-semibold">Annonce de revente</h2>
          <p className="mt-1 text-sm text-ink-3">Prix d&apos;affichage selon le délai visé, texte prêt à publier, photos à faire. Rien n&apos;est inventé : seuls les faits du dossier sont repris.</p>
        </div>
        <button type="button" onClick={rediger} disabled={etat === "envoi"} className="btn btn-o btn-sm">
          {etat === "envoi" ? "Rédaction…" : r ? "Rédiger à nouveau" : "Rédiger l'annonce"}
        </button>
      </div>
      {etat && etat !== "envoi" && <p role="status" className="text-sm text-bad">{etat}</p>}
      {r && (
        <>
          {r.prix.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-3">
              {r.prix.map((p) => (
                <div key={p.cle} className="rounded-2xl border border-line p-3">
                  <p className="text-xs text-ink-3">{p.l} · {p.delai}</p>
                  <p className="num font-display text-xl font-semibold">{eur(p.affiche)}</p>
                  <p className="text-xs text-ink-3">vente visée autour de {eur(p.vente)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm text-ink-3">Titre</h3>
              <Copier texte={r.titre} />
            </div>
            <p className="rounded-xl border border-line bg-black/25 p-3 font-medium">{r.titre}</p>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm text-ink-3">Texte{r.ia ? "" : " (modèle simple : rédaction automatique indisponible)"}</h3>
              <Copier texte={r.texte} />
            </div>
            <p className="whitespace-pre-line rounded-xl border border-line bg-black/25 p-3 text-[15px] text-ink-2">{r.texte}</p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Photos à faire</h3>
            <ol className="grid list-decimal gap-1 pl-5 text-sm text-ink-2 marker:text-o2 sm:columns-2">
              {r.photos.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          </div>
        </>
      )}
    </section>
  );
}
