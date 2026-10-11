"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cx } from "@/lib/cx";
import { CRITERES_VIDES, MAX_ANNONCES, MIN_CRITERES, PALIERS, coutRecherche, credits, nbCriteres, actif, type Criteres } from "@/lib/carcrush";
import type { CatMarque } from "@/lib/vehicules/types";
import { AJOUTS, Croix, libelles, type Etape } from "./commun";

export type Compte = { credits: number; illimite: boolean } | null;

/** Récapitulatif avant de lancer : critères modifiables, coût, solde, estimation du nombre d'annonces. */
export function Recap({ c, maj, cat, compte, aller, lancer, enCours, erreur }: {
  c: Criteres; maj: (p: Partial<Criteres>) => void; cat: CatMarque[] | null; compte: Compte; aller: (e: Etape) => void; lancer: () => void; enCours: boolean; erreur: string;
}) {
  const nb = nbCriteres(c);
  const cout = coutRecherche(nb);
  const liste = libelles(c, cat);
  const ajouts = AJOUTS.filter((a) => !actif(c, a.k));
  const [estim, setEstim] = useState<number | null>(null);
  const solde = compte?.credits ?? 0;
  const assez = !!compte && (compte.illimite || solde >= cout);
  const ok = nb >= MIN_CRITERES && actif(c, "modele");

  // estimation gratuite du nombre d'annonces, recalculée quand les critères changent
  const cle = JSON.stringify(c);
  useEffect(() => {
    if (!actif(c, "modele")) return;
    const ctl = new AbortController();
    const t = window.setTimeout(() => {
      fetch("/api/carcrush/apercu", { method: "POST", headers: { "Content-Type": "application/json" }, body: cle, signal: ctl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setEstim(typeof d?.total === "number" ? d.total : null))
        .catch(() => {});
    }, 500);
    return () => {
      window.clearTimeout(t);
      ctl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);

  const retirer = (k: keyof Criteres) => maj(k === "gen" ? { gen: "", phase: "" } : { [k]: CRITERES_VIDES[k] } as Partial<Criteres>);

  return (
    <div className="grid gap-6 pb-40">
      <div className="grid gap-2">
        <h1 className="font-display text-[36px] font-semibold leading-[1.04] tracking-[-0.02em]">
          Votre recherche, <span className="it">avant de lancer.</span>
        </h1>
        <p className="text-ink-3">Retirez, ajoutez, modifiez. Rien n&apos;est débité tant que vous n&apos;avez pas lancé.</p>
      </div>

      <ul className="carte overflow-hidden">
        {liste.map((x) => (
          <li key={x.k} className="flex min-h-[60px] items-center gap-2 border-b border-line py-2 pl-4 pr-2 last:border-b-0">
            <span className="grid min-w-0 flex-1">
              <span className="text-xs font-bold text-ink-3">{x.label}</span>
              <span className="truncate font-display text-[17px] font-semibold">{x.valeur}</span>
            </span>
            <button type="button" onClick={() => aller(x.etape)} className="min-h-11 px-2.5 text-sm font-bold text-o2 hover:underline">
              Modifier<span className="sr-only"> : {x.label}</span>
            </button>
            {x.k !== "modele" && (
              <button type="button" onClick={() => retirer(x.k)} aria-label={`Retirer le critère ${x.label}`} className="grid size-11 place-items-center rounded-xl text-ink-2 hover:bg-glass">
                <Croix className="size-[18px]" />
              </button>
            )}
          </li>
        ))}
        {!liste.length && <li className="p-4 text-ink-3">Aucun critère pour l&apos;instant.</li>}
      </ul>

      {ajouts.length > 0 && (
        <div className="grid gap-2.5">
          <span className="text-[13px] font-bold text-ink-3">Ajouter un critère</span>
          <div className="flex flex-wrap gap-2">
            {ajouts.map((a) => (
              <button key={a.k} type="button" onClick={() => aller(a.etape)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-dashed border-line-2 px-3.5 text-sm font-bold hover:border-o/60">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true" className="size-3.5 text-o2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <section aria-labelledby="cc-cout" className="grid gap-3.5 rounded-[26px] border border-o/50 bg-o/[0.08] p-5">
        <div className="flex items-baseline justify-between">
          <h2 id="cc-cout" className="text-[13px] font-bold text-ink-2">
            Coût de la recherche
          </h2>
          <span aria-live="polite" className="font-display text-[26px] font-semibold text-o2">
            {compte?.illimite ? "Inclus" : cout ? credits(cout) : "—"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {PALIERS.map((p) => (
            <div key={p.cout} className="grid gap-1.5">
              <span className={cx("h-2 rounded-full", p.cout <= cout ? "bg-o" : "bg-line")} />
              <span className={cx("text-xs", p.cout === cout ? "font-bold text-ink" : "text-ink-3")}>
                {p.l} · {credits(p.cout)}
              </span>
            </div>
          ))}
        </div>
        {compte && !compte.illimite && (
          <p className="text-sm text-ink-2">
            Votre solde : <b className="text-ink">{credits(solde)}</b>
            {cout > 0 && assez && <> · après la recherche : <b className="text-ink">{credits(solde - cout)}</b></>}
          </p>
        )}
      </section>

      <ul className="grid gap-3 text-sm text-ink-2">
        <li className="flex items-start gap-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" className="size-[18px] shrink-0">
            <rect x="4" y="3" width="16" height="18" rx="3" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
          <span>
            Jusqu&apos;à <b className="text-ink">{MAX_ANNONCES} annonces</b>, prises dans la base d&apos;annonces Utopicar et comparées à la cote.
            {estim != null && (
              <> {estim === 0 ? "Aucune annonce ne correspond pour l'instant." : `Environ ${estim} annonce${estim > 1 ? "s" : ""} correspond${estim > 1 ? "ent" : ""} en ce moment.`}</>
            )}
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-[18px] shrink-0 text-ok">
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4v5h5" />
          </svg>
          <span>
            Aucune annonce trouvée ? <b className="text-ink">Vos crédits sont rendus automatiquement.</b>
          </span>
        </li>
      </ul>

      <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-b from-transparent to-bg1 to-25% px-5 pb-7 pt-5">
        <div className="mx-auto grid max-w-md gap-2.5">
          {erreur && (
            <p role="alert" className="text-center text-sm text-warn">
              {erreur}
            </p>
          )}
          {!ok ? (
            <>
              <button type="button" disabled className="btn btn-o min-h-14 w-full">
                Lancer la recherche
              </button>
              <p role="status" className="text-center text-sm text-warn">
                {actif(c, "modele") ? `Ajoutez au moins ${MIN_CRITERES} critères pour lancer.` : "Choisissez d'abord une marque et un modèle."}
              </p>
            </>
          ) : !compte ? (
            <Link
              href="/connexion?next=/carcrush"
              onClick={() => {
                try {
                  sessionStorage.setItem("carcrush:retour", "1");
                } catch {
                  /* navigation privée : la recherche sera à refaire */
                }
              }}
              className="btn btn-o min-h-14 w-full"
            >
              Se connecter pour lancer
            </Link>
          ) : !assez ? (
            <>
              <Link href="/app/credits" className="btn btn-o min-h-14 w-full">
                Acheter des crédits
              </Link>
              <p role="status" className="text-center text-sm text-warn">
                Il vous faut {credits(cout)}, il vous en reste {solde}. Retirez des critères ou rechargez.
              </p>
            </>
          ) : (
            <button type="button" onClick={lancer} disabled={enCours} className="btn btn-o min-h-14 w-full">
              {enCours ? "Recherche en cours…" : `Lancer la recherche · ${compte.illimite ? "incluse" : credits(cout)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
