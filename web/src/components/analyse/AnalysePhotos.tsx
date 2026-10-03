"use client";
import { useState } from "react";
import { eur } from "@/lib/analyse/couts";
import type { IaVue } from "@/lib/analyse/ia-schema";
import { cx } from "@/lib/cx";

/* Ce que l'IA a vu sur les photos : note d'état, défauts localisés et chiffrés (avec la photo concernée),
   teinte différente, incohérences, vues à demander au vendeur. Les photos envoyées sont montrées à côté. */

const GRAVITE: Record<string, string> = { lourd: "border-bad/40 bg-bad/10 text-bad", moyen: "border-warn/40 bg-warn/10 text-warn", léger: "border-line-2 bg-glass text-ink-2" };

export function AnalysePhotos({ photos, vignettes = [], regles, chiffrer = true }: { photos: IaVue["photos"] | undefined; vignettes?: string[]; regles?: boolean; chiffrer?: boolean }) {
  const [vue, setVue] = useState<number | null>(null);
  const examinees = !!photos?.fournies && photos.score != null && !regles;
  if (!examinees && !vignettes.length) return null;
  const score = photos?.score ?? null;
  const ton = score == null ? "text-ink" : score >= 75 ? "text-ok" : score >= 50 ? "text-warn" : "text-bad";
  const defauts = photos?.defauts ?? [];

  return (
    <div className="grid gap-4">
      {vignettes.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Photos envoyées">
          {vignettes.map((u, i) => {
            const n = defauts.filter((d) => d.photo === i + 1).length;
            return (
              <li key={i}>
                <button type="button" onClick={() => setVue(vue === i ? null : i)} aria-pressed={vue === i} className={cx("relative block size-20 overflow-hidden rounded-xl border sm:size-24", vue === i ? "border-o" : "border-line-2")}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- photo locale en data URL */}
                  <img src={u} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                  <span className="absolute left-1 top-1 rounded-full bg-black/75 px-1.5 text-[11px]">{i + 1}</span>
                  {n > 0 && <span className="absolute bottom-1 right-1 rounded-full bg-warn px-1.5 text-[11px] font-semibold text-bg0">{n} défaut{n > 1 ? "s" : ""}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {vue != null && vignettes[vue] && (
        <figure className="grid gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- photo locale en data URL */}
          <img src={vignettes[vue]} alt={`Photo ${vue + 1} en grand`} className="max-h-[70vh] w-full rounded-2xl border border-line object-contain" />
          {defauts.some((d) => d.photo === vue + 1) && (
            <figcaption className="text-sm text-ink-2">Sur cette photo : {defauts.filter((d) => d.photo === vue + 1).map((d) => d.libelle).join(" · ")}</figcaption>
          )}
        </figure>
      )}

      {!examinees ? (
        <p className="text-sm text-warn">Les photos n&apos;ont pas pu être examinées cette fois (service d&apos;analyse indisponible). Relancez l&apos;analyse pour avoir l&apos;avis sur l&apos;état.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p>
              État visible : <b className={cx("num font-display text-2xl", ton)}>{score}</b>
              <span className="text-ink-3"> / 100</span>
            </p>
            {photos?.compteurLu != null && <p className="text-sm text-ink-2">Compteur lu sur la photo : <b className="num">{photos.compteurLu.toLocaleString("fr-FR")} km</b></p>}
          </div>
          {photos?.resume && <p className="text-ink-2">{photos.resume}</p>}
          {defauts.length > 0 ? (
            <ul className="grid gap-2">
              {defauts.map((d, i) => (
                <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-line p-3 text-sm">
                  <span className="min-w-0">
                    <span className={cx("mr-2 rounded-full border px-2 py-px text-xs", GRAVITE[d.gravite] ?? GRAVITE.léger)}>{d.gravite}</span>
                    {d.libelle}
                    {d.confiance === "faible" && <span className="text-ink-3"> (à confirmer sur place)</span>}
                    {d.photo ? (
                      <button type="button" onClick={() => setVue(d.photo! - 1)} className="ml-2 text-xs text-o2 underline-offset-4 hover:underline">
                        photo {d.photo}
                      </button>
                    ) : null}
                  </span>
                  {chiffrer && d.coutMax > 0 && <b className="num shrink-0">{d.coutMin && d.coutMin !== d.coutMax ? `${eur(d.coutMin)} à ${eur(d.coutMax)}` : eur(d.coutMax)}</b>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ok">Aucun défaut visible sur les photos.</p>
          )}
          {(photos?.teinte ?? []).length > 0 && <p className="rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm text-warn">Teinte différente : {photos!.teinte!.join(", ")}. Signe possible d&apos;une réparation de carrosserie : demandez pourquoi.</p>}
          {(photos?.incoherences ?? []).length > 0 && <p className="rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm text-warn">Incohérences avec l&apos;annonce : {photos!.incoherences!.join(" ; ")}</p>}
          {(photos?.vuesManquantes ?? []).length > 0 && <p className="text-sm text-ink-3">À demander au vendeur, pour juger : {photos!.vuesManquantes.join(", ")}.</p>}
        </>
      )}
    </div>
  );
}
