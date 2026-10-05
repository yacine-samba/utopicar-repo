"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import { lienLeboncoin } from "@/lib/analyse/import";
import { cx, inputCls } from "@/lib/cx";
import { Ico } from "./Icones";

/** Bouton « Analyser une annonce » toujours visible dans le menu : une fenêtre s'ouvre, on colle le lien,
    l'analyse démarre sur la page complète (photos, puis rapport). */
export function BoutonAnalyser({ className, libelle = "Analyser une annonce", icone = "size-5" }: { className?: string; libelle?: string; icone?: string }) {
  const router = useRouter();
  const id = useId();
  const [ouvert, setOuvert] = useState(false);
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  const champ = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!ouvert) return;
    champ.current?.focus();
    const f = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    addEventListener("keydown", f);
    return () => removeEventListener("keydown", f);
  }, [ouvert]);
  const aller = (brut: string) => {
    const l = lienLeboncoin(brut);
    if (!l)
      return setErr(
        "Collez le lien d'une annonce Leboncoin (il commence par https://www.leboncoin.fr/).",
      );
    setOuvert(false);
    setV("");
    router.push(`/app/analyser?lien=${encodeURIComponent(l)}`);
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
                    Collez le lien Leboncoin : l&apos;annonce, ses photos et le
                    rapport complet s&apos;ouvrent sur une page dédiée.
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
                  Lien de l&apos;annonce Leboncoin
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
                      if (lienLeboncoin(t)) {
                        e.preventDefault();
                        aller(t);
                      }
                    }}
                    inputMode="url"
                    autoComplete="off"
                    placeholder="https://www.leboncoin.fr/ad/voitures/…"
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
                Autre site (La Centrale, AutoScout24) ?{" "}
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
