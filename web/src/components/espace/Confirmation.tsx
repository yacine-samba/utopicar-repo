"use client";
import { useRef, useState } from "react";

type Demande = { titre: string; texte?: string; action: string };

/** Confirmation d'une action destructive, aux couleurs de l'espace (au lieu de la fenêtre grise du navigateur).
    `<dialog>` natif : focus piégé, Échap ferme, le focus revient au bouton d'origine. « Annuler » a le focus par défaut.
    Usage : const { confirmer, element } = useConfirmation(); if (!(await confirmer({ … }))) return; … {element} */
export function useConfirmation() {
  const ref = useRef<HTMLDialogElement>(null);
  const reponse = useRef<(ok: boolean) => void>(null);
  const [d, setD] = useState<Demande | null>(null);

  const confirmer = (demande: Demande) =>
    new Promise<boolean>((resoudre) => {
      reponse.current = resoudre;
      setD(demande);
      requestAnimationFrame(() => ref.current?.showModal());
    });
  const fermer = (ok: boolean) => {
    ref.current?.close();
    reponse.current?.(ok);
    reponse.current = null;
  };

  const element = (
    <dialog
      ref={ref}
      aria-labelledby="conf-titre"
      onCancel={(e) => {
        e.preventDefault();
        fermer(false);
      }}
      onClick={(e) => e.target === ref.current && fermer(false)}
      className="m-auto w-[min(92vw,440px)] rounded-3xl border border-line-2 bg-bg1 p-0 text-ink shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      {d && (
        <div className="grid gap-5 p-6">
          <div className="grid gap-2">
            <h2 id="conf-titre" className="font-display text-lg font-semibold">
              {d.titre}
            </h2>
            {d.texte && <p className="text-sm text-ink-2">{d.texte}</p>}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" autoFocus onClick={() => fermer(false)} className="btn btn-sm">
              Annuler
            </button>
            <button type="button" onClick={() => fermer(true)} className="btn btn-sm border-bad/60 bg-bad/15 text-bad hover:border-bad">
              {d.action}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
  return { confirmer, element };
}
