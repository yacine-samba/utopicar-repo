"use client";
/* Fiche d'une voiture trouvée (recherche, annonces trouvées, alertes, favoris) : un clic sur la voiture l'ouvre ici,
   sur le site, au lieu d'envoyer vers Leboncoin. On y voit le prix face à la cote, l'essentiel de la voiture,
   ce que l'on sait de son moteur et de sa boîte, puis l'analyse en un bouton. L'annonce d'origine reste un lien discret.
   Flèches ← → (ou boutons) : voiture précédente / suivante de la liste, sans fermer la fiche. */
import Link from "next/link";
import { useEffect, useRef } from "react";
import { connaissancesDe, LIBELLE_AVIS } from "@/lib/analyse/connaissances";
import { lienImportable } from "@/lib/analyse/import";
import { cx } from "@/lib/cx";
import { Ico } from "./Icones";

export type FicheData = {
  id: string;
  titre: string;
  prix: number | null;
  annee: number | null;
  km: number | null;
  ch?: number | null;
  energie: string | null;
  boite: string | null;
  moteur?: string | null;
  version?: string | null;
  lieu: string | null;
  pro?: boolean | null;
  photo: string | null;
  url: string | null;
  marque?: string;
  cote?: { P: number | null; ecart: number | null; pct: number | null; conf?: string; moinsCherQue?: number | null } | null;
  /** annonce douteuse (prix suspect, pièces, location, acompte) */
  alerte?: string | null;
  /** génération déduite de l'année seulement */
  doute?: boolean;
  lbc?: { min: number; max: number; pos: string | null } | null;
};

const eur = (v: number | null | undefined) => (v == null ? "—" : `${Math.round(v).toLocaleString("fr-FR")} €`);
const COULEUR_AVIS = { robuste: "text-ok", correct: "text-ink-2", fragile: "text-warn", eviter: "text-bad" } as const;

export function FicheAnnonce({ fiches, index, onIndex }: { fiches: FicheData[]; index: number | null; onIndex: (i: number | null) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const haut = useRef<HTMLDivElement>(null);
  const a = index != null ? fiches[index] : null;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (a && !d.open) d.showModal();
    if (!a && d.open) d.close();
  }, [a]);
  useEffect(() => haut.current?.scrollTo({ top: 0 }), [index]);

  if (!a || index == null) return <dialog ref={ref} />;
  const n = fiches.length;
  const aller = (i: number) => onIndex(Math.max(0, Math.min(n - 1, i)));
  const c = a.cote;
  const bon = c?.pct != null && c.pct >= 0.05, cher = c?.pct != null && c.pct <= -0.05;
  const lbc = a.url ? lienImportable(a.url) : null;
  const connus = connaissancesDe({ texte: [a.titre, a.moteur, a.version].filter(Boolean).join(" "), titre: a.titre, marque: a.marque, annee: a.annee, km: a.km, energie: a.energie ?? undefined });
  const faits: [string, string | null][] = [
    ["Année", a.annee ? String(a.annee) : null],
    ["Kilométrage", a.km != null ? `${a.km.toLocaleString("fr-FR")} km` : null],
    ["Moteur", [a.moteur, a.ch ? `${a.ch} ch` : null].filter(Boolean).join(" · ") || null],
    ["Énergie", a.energie],
    ["Boîte", a.boite],
    ["Version", a.version ?? null],
    ["Lieu", a.lieu],
    ["Vendeur", a.pro == null ? null : a.pro ? "Professionnel" : "Particulier"],
  ];

  return (
    <dialog
      ref={ref}
      aria-labelledby="fiche-titre"
      onClose={() => onIndex(null)}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") aller(index + 1);
        if (e.key === "ArrowLeft") aller(index - 1);
      }}
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-none overflow-hidden bg-bg1 p-0 text-ink shadow-[-30px_0_80px_-30px_rgb(0_0_0/0.9)] backdrop:bg-black/60 backdrop:backdrop-blur-sm sm:w-[480px] sm:rounded-l-3xl sm:border-l sm:border-line-2"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => aller(index - 1)} disabled={index === 0} aria-label="Voiture précédente" className="grid size-9 place-items-center rounded-full border border-line-2 text-ink-2 enabled:hover:text-ink disabled:opacity-35">
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" onClick={() => aller(index + 1)} disabled={index >= n - 1} aria-label="Voiture suivante" className="grid size-9 place-items-center rounded-full border border-line-2 text-ink-2 enabled:hover:text-ink disabled:opacity-35">
              <span aria-hidden="true">→</span>
            </button>
            <span className="ml-1 text-xs text-ink-3" aria-live="polite">{index + 1} sur {n}</span>
          </div>
          <button type="button" onClick={() => ref.current?.close()} aria-label="Fermer la fiche" className="grid size-9 place-items-center rounded-full border border-line-2 text-ink-2 hover:text-ink">
            <Ico nom="fermer" className="size-4" />
          </button>
        </div>

        <div ref={haut} className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto p-4 sm:p-5">
          {a.photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- photo servie par Leboncoin
            <img src={a.photo} alt="" referrerPolicy="no-referrer" className="aspect-[4/3] w-full rounded-2xl border border-line bg-bg0 object-cover" />
          ) : (
            <div className="grid aspect-[16/7] place-items-center rounded-2xl border border-dashed border-line-2 text-sm text-ink-3">Pas de photo</div>
          )}

          <div className="grid gap-1">
            <h2 id="fiche-titre" className="font-display text-xl font-semibold leading-snug">{a.titre || "Annonce"}</h2>
            <p className="num font-display text-3xl font-semibold">{eur(a.prix)}</p>
          </div>

          {a.alerte && (
            <p role="alert" className="rounded-2xl border border-bad/40 bg-bad/10 p-3 text-sm text-bad">
              {a.alerte}
            </p>
          )}

          <section aria-label="Prix face au marché" className={cx("grid gap-1 rounded-2xl border p-4", bon ? "border-ok/40 bg-ok/10" : cher ? "border-bad/40 bg-bad/10" : "border-line bg-glass")}>
            {c && c.ecart != null ? (
              <>
                <p className={cx("num text-lg font-semibold", bon ? "text-ok" : cher ? "text-bad" : "text-ink")}>
                  {c.ecart >= 0 ? `${eur(c.ecart)} sous la cote` : `${eur(-c.ecart)} au-dessus de la cote`}
                  <span className="font-normal text-ink-3"> ({Math.round(Math.abs(c.pct ?? 0) * 100)} %)</span>
                </p>
                <p className="text-sm text-ink-2">
                  Cote du marché {eur(c.P)}
                  {c.conf ? ` · confiance ${c.conf}` : ""}
                  {c.moinsCherQue != null ? ` · moins chère que ${c.moinsCherQue} % des annonces comparables` : ""}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-2">Pas assez d&apos;annonces comparables pour situer ce prix : l&apos;analyse détaillée le fera avec le texte et les photos.</p>
            )}
            {a.lbc && <p className="text-xs text-ink-3">Estimation affichée par Leboncoin : {eur(a.lbc.min)} – {eur(a.lbc.max)}{a.lbc.pos ? ` · ${a.lbc.pos}` : ""}</p>}
            {a.doute && <p className="text-xs text-warn">Génération déduite de l&apos;année seulement : à vérifier sur la carte grise ou les photos.</p>}
          </section>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {faits.filter(([, v]) => v).map(([l, v]) => (
              <div key={l} className="min-w-0">
                <dt className="text-xs text-ink-3">{l}</dt>
                <dd className="truncate font-medium" title={v ?? undefined}>{v}</dd>
              </div>
            ))}
          </dl>

          {connus.length > 0 && (
            <section aria-label="Ce qu'il faut savoir" className="grid gap-2">
              <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-o2">Ce qu&apos;il faut savoir</h3>
              <ul className="grid gap-2">
                {connus.map((k) => (
                  <li key={k.id} className="rounded-2xl border border-line p-3 text-sm">
                    <p className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">{k.nom}</span>
                      <span className={cx("text-xs font-medium", COULEUR_AVIS[k.avis])}>{LIBELLE_AVIS[k.avis]}</span>
                    </p>
                    <p className="mt-1 text-ink-2">{k.detail}</p>
                    <p className="mt-1 text-xs text-ink-3">À vérifier : {k.verif}</p>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink-3">D&apos;après le titre de l&apos;annonce ; l&apos;analyse complète lit aussi le texte et les photos.</p>
            </section>
          )}
        </div>

        <div className="grid gap-2 border-t border-line bg-bg1 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2">
            {lbc ? (
              <Link href={`/app/analyser?lien=${encodeURIComponent(lbc)}`} className="btn btn-o flex-1 justify-center">
                Analyser cette annonce
              </Link>
            ) : (
              <p className="flex-1 rounded-xl border border-line px-3 py-2 text-center text-sm text-ink-3">{a.url ? "Analyse indisponible pour ce site" : "Lien de l'annonce indisponible"}</p>
            )}
          </div>
          {a.url && (
            <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-center text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
              Voir l&apos;annonce d&apos;origine sur Leboncoin ↗
            </a>
          )}
        </div>
      </div>
    </dialog>
  );
}
