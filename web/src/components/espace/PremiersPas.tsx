import Link from "next/link";
import { cx } from "@/lib/cx";
import { BoutonMasquerPremiersPas } from "./BoutonMasquerPremiersPas";

export type Etape = { l: string; fait: boolean; href: string; bouton: string };

/* Carte « Premiers pas » du tableau de bord : trois étapes cochées d'après la base (rien à cliquer), un anneau de progression,
   le bouton de l'étape suivante. Disparaît quand tout est fait ou quand la personne la masque. */
export function PremiersPas({ etapes }: { etapes: Etape[] }) {
  const faites = etapes.filter((e) => e.fait).length;
  const fini = faites >= etapes.length;
  const suivante = etapes.findIndex((e) => !e.fait);
  const r = 26;
  const tour = 2 * Math.PI * r;
  return (
    <section aria-labelledby="pp-titre" className={cx("carte grid gap-4 p-4 sm:p-6", fini ? "border-ok/40" : "border-o/30")}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative size-12 shrink-0 sm:size-14" aria-hidden="true">
          <svg viewBox="0 0 64 64" className="size-full -rotate-90">
            <circle cx="32" cy="32" r={r} fill="none" stroke="rgb(244 241 236 / .1)" strokeWidth="6" />
            <circle cx="32" cy="32" r={r} fill="none" stroke={fini ? "#3ecb7f" : "#ff5a1f"} strokeWidth="6" strokeLinecap="round" strokeDasharray={tour} strokeDashoffset={tour * (1 - faites / etapes.length)} className="transition-[stroke-dashoffset] duration-700" />
          </svg>
          <span className="num absolute inset-0 grid place-content-center font-display text-xs font-semibold sm:text-sm">
            {faites}/{etapes.length}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 id="pp-titre" className="font-display text-lg font-semibold">
            {fini ? "Vous êtes lancé" : "Premiers pas"}
          </h2>
          <BoutonMasquerPremiersPas className="text-xs text-ink-3 underline-offset-4 hover:text-ink hover:underline">{fini ? "Masquer" : "Masquer cette carte"}</BoutonMasquerPremiersPas>
        </div>
      </div>
      <ol className="grid gap-2">
        {etapes.map((e, i) => (
          <li key={e.l} className={cx("grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-1 py-1.5", i === suivante && "bg-o/5")}>
            <span className={cx("grid size-7 shrink-0 place-items-center rounded-full border text-xs", e.fait ? "border-ok bg-ok/20 text-ok" : i === suivante ? "border-o text-o2" : "border-line-2 text-ink-3")} aria-hidden="true">
              {e.fait ? "✓" : i + 1}
            </span>
            <span className={cx("text-[15px] leading-snug", e.fait && "text-ink-3 line-through")}>
              {e.l}
              {e.fait && <span className="sr-only"> (fait)</span>}
            </span>
            {e.fait ? (
              <span />
            ) : (
              <Link href={e.href} className={cx("btn btn-sm shrink-0 whitespace-nowrap", i === suivante && "btn-o")}>
                {e.bouton}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
