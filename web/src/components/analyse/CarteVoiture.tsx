"use client";
import Link from "next/link";
import { cx } from "@/lib/cx";
import { titreVehicule } from "@/lib/titre";
import { Carrousel } from "./Photos";

const dateFr = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/** Carte d'une voiture analysée : photos à faire glisser directement, verdict, prix, lien de l'annonce d'origine. */
export function CarteVoiture({
  href,
  titre,
  photos,
  prix,
  badge,
  sous,
  chiffres,
  lien,
  date,
  coin,
}: {
  href: string;
  titre: string;
  photos: string[];
  prix: number | null;
  badge?: { l: string; ton: string };
  sous?: string;
  chiffres?: { l: string; v: string; ton?: string }[];
  lien?: string | null;
  date: string;
  coin?: React.ReactNode;
}) {
  const t = titreVehicule(titre);
  return (
    <article className="carte group flex h-full flex-col overflow-hidden transition hover:border-o/40">
      <div className="relative">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="block">
          <Carrousel photos={photos} alt={t} />
        </Link>
        {badge && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-bg0/85 backdrop-blur-md">
            <span className={cx("block rounded-full border px-2.5 py-0.5 text-xs font-semibold", badge.ton)}>{badge.l}</span>
          </span>
        )}
        {coin && <div className="absolute right-3 top-3 flex gap-1.5">{coin}</div>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="font-display text-[17px] font-semibold leading-snug group-hover:text-o2">
            {t}
          </Link>
          <b className="num shrink-0 font-display text-lg">{prix != null ? `${prix.toLocaleString("fr-FR")} €` : "—"}</b>
        </div>
        {sous && <p className="text-sm text-ink-3">{sous}</p>}
        {chiffres && chiffres.length > 0 && (
          <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {chiffres.map((c) => (
              <div key={c.l} className="flex items-baseline gap-1.5">
                <dt className="text-ink-3">{c.l}</dt>
                <dd className={cx("num font-medium", c.ton)}>{c.v}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-1 text-xs text-ink-3">
          <span>{dateFr(date)}</span>
          {lien && (
            <a href={lien} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line-2 px-2.5 py-1 text-ink-2 hover:border-o/50 hover:text-ink">
              Annonce d&apos;origine ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
