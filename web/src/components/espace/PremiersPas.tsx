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
  return (
    <section aria-labelledby="pp-titre" className={cx("carte grid gap-4 p-4 sm:p-6", fini ? "border-ok/40" : "border-o/30")}>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2 id="pp-titre" className="flex items-baseline gap-3 font-display text-lg font-semibold">
            {fini ? "Vous êtes lancé" : "Premiers pas"}
            <span className={cx("num font-sans text-sm font-medium", fini ? "text-ok" : "text-ink-3")}>
              {faites} sur {etapes.length}
            </span>
          </h2>
          <BoutonMasquerPremiersPas className="text-xs text-ink-3 underline-offset-4 hover:text-ink hover:underline">{fini ? "Masquer" : "Masquer cette carte"}</BoutonMasquerPremiersPas>
        </div>
        <div className="flex gap-1.5" role="progressbar" aria-label="Premiers pas" aria-valuemin={0} aria-valuemax={etapes.length} aria-valuenow={faites}>
          {etapes.map((e, i) => (
            // la barre se remplit de gauche à droite, quel que soit l'ordre dans lequel les étapes sont faites
            <span key={e.l} className={cx("h-1.5 flex-1 rounded-full transition-colors duration-500", i < faites ? (fini ? "bg-ok" : "bg-o") : "bg-line")} />
          ))}
        </div>
      </div>
      <ol className="grid gap-1.5">
        {etapes.map((e, i) => (
          <li key={e.l} className={cx("grid min-h-12 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-2 py-1.5", i === suivante && "bg-o/[0.06]")}>
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
              <Link href={e.href} className={cx("btn btn-sm shrink-0 whitespace-nowrap", i === suivante ? "btn-o shadow-none" : "")}>
                {e.bouton}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
