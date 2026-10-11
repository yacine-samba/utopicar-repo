"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import { lienImportable } from "@/lib/analyse/import";
import { useAnalyseEnFond } from "./AnalysesEnFond";
import { cx, inputCls } from "@/lib/cx";
import { Ico } from "./Icones";
import { usePiegeFocus } from "@/lib/piege-focus";

/** Bouton « Analyser une annonce » : une fenêtre s'ouvre, on colle le lien, la fenêtre se ferme et l'analyse tourne
    en arrière-plan (notification à la fin, avec le rapport). Sans formule d'analyse, il mène à la page Analyser. */
export function BoutonAnalyser({ className, libelle = "Analyser une annonce", icone = "size-5" }: { className?: string; libelle?: string; icone?: string }) {
  const router = useRouter();
  const fond = useAnalyseEnFond();
  const id = useId();
  const [ouvert, setOuvert] = useState(false);
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  const champ = useRef<HTMLInputElement>(null);
  const boite = useRef<HTMLDivElement>(null);
  usePiegeFocus(boite, ouvert);
  useEffect(() => {
    if (!ouvert) return;
    champ.current?.focus();
    const f = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    addEventListener("keydown", f);
    return () => removeEventListener("keydown", f);
  }, [ouvert]);
  const aller = (brut: string) => {
    const l = lienImportable(brut);
    if (!l) return setErr("Collez le lien d'une annonce Leboncoin, La Centrale ou AutoScout24.");
    setOuvert(false);
    setV("");
    if (fond?.actif) void fond.lancer(l);
    else router.push(`/app/analyser?lien=${encodeURIComponent(l)}`);
  };
  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className={cx("btn btn-o w-full justify-start gap-3", className)}
      >
        <Ico nom="analyser" className={cx("shrink-0", icone)} />
        {libelle}
      </button>
      {ouvert &&
        // rendu à la racine de la page : dans le menu (position sticky), la fenêtre passait sous le contenu
        createPortal(
          <div
            className="fixed inset-0 z-[70] grid place-items-start bg-black/70 px-4 pt-[14vh] backdrop-blur-sm"
            onClick={() => setOuvert(false)}
          >
            <div
              ref={boite}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${id}-t`}
              className="mx-auto w-full max-w-xl rounded-3xl border border-o/30 bg-bg1 p-6 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id={`${id}-t`}
                    className="font-display text-2xl font-semibold"
                  >
                    Analyser une annonce
                  </h2>
                  <p className="mt-1 text-sm text-ink-3">
                    Collez le lien Leboncoin, La Centrale ou AutoScout24.
                    L&apos;analyse tourne en arrière-plan : continuez votre
                    travail, une notification vous prévient quand le rapport est prêt.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOuvert(false)}
                  aria-label="Fermer"
                  className="rounded-full px-2 py-1 text-ink-3 hover:text-ink"
                >
                  ✕
                </button>
              </div>
              <form
                className="mt-5 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  aller(v);
                }}
              >
                <label htmlFor={`${id}-l`} className="sr-only">
                  Lien de l&apos;annonce
                </label>
                <div className="relative">
                  <Ico
                    nom="lien"
                    className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-3"
                  />
                  <input
                    ref={champ}
                    id={`${id}-l`}
                    value={v}
                    onChange={(e) => {
                      setV(e.target.value);
                      setErr("");
                    }}
                    onPaste={(e) => {
                      const t = e.clipboardData.getData("text");
                      if (lienImportable(t)) {
                        e.preventDefault();
                        aller(t);
                      }
                    }}
                    inputMode="url"
                    autoComplete="off"
                    placeholder="https://www.leboncoin.fr/ad/voitures/… ou La Centrale, AutoScout24"
                    className={`${inputCls} pl-12 text-base`}
                  />
                </div>
                {err && (
                  <p role="alert" className="text-sm text-warn">
                    {err}
                  </p>
                )}
                <button type="submit" className="btn btn-o">
                  Analyser
                </button>
              </form>
              <p className="mt-4 text-sm text-ink-3">
                Autre site ?{" "}
                <Link
                  href="/app/analyser"
                  onClick={() => setOuvert(false)}
                  className="text-o2 underline underline-offset-4"
                >
                  Coller le texte de l&apos;annonce
                </Link>
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
