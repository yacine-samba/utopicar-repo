"use client";
import { useEffect, useState } from "react";
import { eur, kmTxt, type AnnonceCC } from "@/lib/carcrush";
import { Croix, EcartCote, Externe, PastilleVerdict, PhotoAnnonce } from "./commun";

type Favori = { recherche_id: string; annonce: AnnonceCC; created_at: string };

/** Coups de cœur de toutes les recherches : analyser l'annonce, l'ouvrir, la retirer. */
export function Favoris({ onNouvelle }: { onNouvelle: () => void }) {
  const [liste, setListe] = useState<Favori[] | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetch("/api/carcrush/choix")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setListe(d.favoris ?? []))
      .catch(() => {
        setErreur("Vos coups de cœur n'ont pas pu être chargés.");
        setListe([]);
      });
  }, []);

  const retirer = (f: Favori) => {
    setListe((l) => l?.filter((x) => x !== f) ?? null);
    void fetch("/api/carcrush/choix", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recherche: f.recherche_id, annonce: f.annonce.id }) }).catch(() => {});
  };

  return (
    <div className="grid gap-5 pb-32">
      <h1 className="font-display text-[36px] font-semibold leading-[1.04] tracking-[-0.02em]">
        Vos <span className="it">coups de cœur</span>
        {liste && liste.length > 0 && <span className="num"> ({liste.length})</span>}
      </h1>
      {erreur && <p role="alert" className="text-warn">{erreur}</p>}
      {liste === null && <p className="text-ink-3">Chargement…</p>}
      {liste?.length === 0 && !erreur && <p className="text-ink-2">Aucun coup de cœur pour l&apos;instant. Swipez à droite les annonces qui vous plaisent.</p>}
      <ul className="grid gap-3">
        {liste?.map((f) => {
          const a = f.annonce;
          return (
            <li key={`${f.recherche_id}-${a.id}`} className="carte overflow-hidden">
              <div className="flex gap-3.5 p-3.5">
                <PhotoAnnonce src={a.photo} className="relative h-[84px] w-24 shrink-0 rounded-2xl" />
                <div className="grid min-w-0 flex-1 content-start gap-1">
                  <PastilleVerdict v={a.verdict} className="w-fit bg-transparent px-2 text-xs" />
                  <h2 className="line-clamp-2 font-display text-base font-semibold leading-tight">{a.titre}</h2>
                  <p className="text-[13px] text-ink-3">{[a.annee, a.km != null ? kmTxt(a.km) : null, a.lieu].filter(Boolean).join(" · ")}</p>
                  <p className="flex flex-wrap items-baseline gap-x-2 text-xs">
                    <b className="num font-display text-xl font-semibold">{eur(a.prix)}</b>
                    <EcartCote cote={a.cote} />
                  </p>
                </div>
              </div>
              <div className="flex border-t border-line">
                {a.url ? (
                  <a href={`/app/analyser?lien=${encodeURIComponent(a.url)}`} className="flex min-h-12 flex-1 items-center justify-center border-r border-line text-sm font-bold text-o2">
                    Analyser l&apos;annonce
                  </a>
                ) : (
                  <span className="flex-1" />
                )}
                {a.url && (
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex min-h-12 flex-1 items-center justify-center gap-1.5 text-sm font-bold">
                    Leboncoin <Externe />
                    <span className="sr-only">(nouvel onglet)</span>
                  </a>
                )}
                <button type="button" onClick={() => retirer(f)} aria-label={`Retirer ${a.titre} des coups de cœur`} className="grid min-h-12 w-[52px] place-items-center border-l border-line text-ink-2">
                  <Croix className="size-[17px]" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-b from-transparent to-bg1 to-25% px-5 pb-7 pt-5">
        <div className="mx-auto max-w-md">
          <button type="button" onClick={onNouvelle} className="btn btn-o min-h-14 w-full">
            Nouvelle recherche
          </button>
        </div>
      </div>
    </div>
  );
}
