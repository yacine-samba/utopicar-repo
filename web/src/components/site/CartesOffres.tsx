import Link from "next/link";
import { OFFRES, prixTxt, type OffreId } from "@/lib/offres";
import { BoutonAbonner } from "./BoutonAbonner";
import { cx } from "@/lib/cx";

/** Grille de formules. `actuelle` marque la formule du compte connecté. */
export function CartesOffres({ ids, actuelle }: { ids: OffreId[]; actuelle?: OffreId | null }) {
  return (
    <ul className="grid gap-5 md:grid-cols-3">
      {ids.map((id) => {
        const o = OFFRES[id];
        const cetteOffre = actuelle === id;
        return (
          <li key={id} className={cx("carte relative flex flex-col p-6 sm:p-7", o.miseEnAvant && "border-o/50 shadow-[0_30px_80px_-40px_rgba(255,90,31,.7)]")}>
            {o.miseEnAvant && <span className="absolute -top-3 left-6 rounded-full bg-o px-3 py-1 text-xs font-semibold text-[#160904]">Le plus choisi</span>}
            <h3 className="font-display text-xl font-semibold">{o.nom}</h3>
            <p className="mt-1 text-sm text-ink-3">{o.accroche}</p>
            <p className="mt-5 flex items-baseline gap-1.5">
              <b className="num font-display text-4xl font-semibold">{prixTxt(o.prix)}</b>
              <span className="text-ink-3">{o.prix ? "par mois" : "pour toujours"}</span>
            </p>
            <p className="mt-1 text-sm text-ink-3">{o.prix ? "Sans engagement, résiliable à tout moment" : "Sans carte bancaire"}</p>
            <ul className="mt-6 grid flex-1 content-start gap-2.5 text-[15px]">
              {o.points.map((p) => (
                <li key={p} className="flex gap-2.5">
                  <span className="mt-0.5 text-ok" aria-hidden="true">
                    ✓
                  </span>
                  <span className={p.endsWith(":") ? "font-semibold" : "text-ink-2"}>{p}</span>
                </li>
              ))}
              {o.bientot?.map((p) => (
                <li key={p} className="flex gap-2.5 text-ink-3">
                  <span aria-hidden="true">◌</span>
                  <span>
                    {p} <small className="rounded-full border border-line-2 px-1.5 text-[11px] uppercase tracking-wide">bientôt</small>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-7">
              {cetteOffre ? (
                <Link href="/app/compte#formule" className="btn w-full">
                  Votre formule actuelle
                </Link>
              ) : o.prix === 0 ? (
                <Link href="/analyse" className="btn w-full">
                  Faire mon analyse offerte
                </Link>
              ) : (
                <BoutonAbonner produit={id} className={cx("btn w-full", o.miseEnAvant && "btn-o")}>
                  Choisir {o.nom}
                </BoutonAbonner>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
