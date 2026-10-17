"use client";
import Link from "next/link";
import { useState } from "react";
import { cx } from "@/lib/cx";
import { centimes, GARANTIE, OFFRES, prixParAnalyse, prixTxt, type OffreId } from "@/lib/offres";
import { BoutonAbonner } from "./BoutonAbonner";

/** Une formule, avec sa variante en case à cocher plutôt qu'en carte à part (Pro : « + messages automatiques ») :
    deux cartes presque identiques à 5 € d'écart font douter ; une option se coche. */
export function CarteOffre({ id, variante, actuelle, gratuitBenef }: { id: OffreId; variante?: OffreId; actuelle?: OffreId | null; gratuitBenef?: boolean }) {
  const base = OFFRES[id];
  const v = variante ? OFFRES[variante] : null;
  const [avec, setAvec] = useState(!!v && actuelle === v.id);
  const o = avec && v ? v : base;
  const cette = actuelle === o.id;
  const pa = prixParAnalyse(o);

  // Découverte côté achat-revente : l'analyse offerte est une analyse Benef
  if (gratuitBenef)
    return (
      <li className="carte relative flex flex-col p-6 sm:p-7">
        <h3 className="font-display text-xl font-semibold">Gratuit</h3>
        <p className="mt-1 text-sm text-ink-3">Pour essayer sur une vraie annonce</p>
        <p className="mt-5 flex items-baseline gap-1.5">
          <b className="num font-display text-4xl font-semibold">0&nbsp;€</b>
          <span className="text-ink-3">sans carte bancaire</span>
        </p>
        <ul className="mt-6 grid flex-1 content-start gap-2.5 text-[15px]">
          {["1 analyse Benef offerte", "Marge nette après tous les frais", "Prix d'offre et prix à ne pas dépasser", "Fiabilité du moteur et travaux à prévoir"].map((p) => (
            <li key={p} className="flex gap-2.5"><span className="mt-0.5 text-ok" aria-hidden="true">✓</span><span className="text-ink-2">{p}</span></li>
          ))}
        </ul>
        <div className="mt-7">
          <Link href={`/inscription?next=${encodeURIComponent("/app/analyser?usage=benef")}`} className="btn w-full">Faire mon analyse offerte</Link>
        </div>
      </li>
    );

  return (
    <li className={cx("carte relative flex flex-col p-6 sm:p-7", base.miseEnAvant && "border-o/50 shadow-[0_30px_80px_-40px_rgba(255,90,31,.7)]")}>
      {base.miseEnAvant && <span className="absolute -top-3 left-6 rounded-full bg-o px-3 py-1 text-xs font-semibold text-[#160904]">Conseillé</span>}
      <h3 className="font-display text-xl font-semibold">{base.nom}</h3>
      <p className="mt-1 text-sm text-ink-3">{base.accroche}</p>
      <p className="mt-5 flex items-baseline gap-1.5" aria-live="polite">
        <b className="num font-display text-4xl font-semibold">{prixTxt(o.prix)}</b>
        <span className="text-ink-3">{o.prix ? "par mois" : `pour ${o.analyses} analyse${o.analyses > 1 ? "s" : ""} offerte${o.analyses > 1 ? "s" : ""}`}</span>
      </p>
      {pa ? <p className="num mt-1 text-sm font-medium text-ok">soit {centimes(pa)} l&apos;analyse</p> : null}
      <p className="mt-1 text-sm text-ink-3">{o.prix ? `Sans engagement${GARANTIE ? `, remboursé sous ${GARANTIE.jours} jours` : ", résiliable à tout moment"}` : "Sans carte bancaire, sans abonnement"}</p>
      <ul className="mt-6 grid flex-1 content-start gap-2.5 text-[15px]">
        {base.points.map((p) => (
          <li key={p} className="flex gap-2.5">
            <span className="mt-0.5 text-ok" aria-hidden="true">✓</span>
            <span className={p.endsWith(":") ? "font-semibold" : "text-ink-2"}>{p}</span>
          </li>
        ))}
      </ul>
      {v && (
        <label className={cx("mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition", avec ? "border-o/50 bg-o/10" : "border-line-2 hover:border-o/40")}>
          <input type="checkbox" checked={avec} onChange={(e) => setAvec(e.target.checked)} className="mt-1 size-4 shrink-0 accent-[var(--color-o)]" />
          <span className="text-sm">
            <b className="font-semibold">Messages automatiques aux vendeurs</b>{" "}
            <span className="num whitespace-nowrap text-o2">+{prixTxt(v.prix - base.prix)} par mois</span>
            <span className="mt-0.5 block text-ink-3">Le premier message part tout seul sur les annonces de vos recherches. Réponses dans votre espace.</span>
          </span>
        </label>
      )}
      <div className="mt-6">
        {cette ? (
          <Link href="/app/compte#formule" className="btn w-full">Votre formule actuelle</Link>
        ) : o.prix === 0 ? (
          <Link href="/analyse" className="btn w-full">Faire mon analyse offerte</Link>
        ) : (
          <BoutonAbonner produit={o.id} className={cx("btn w-full", base.miseEnAvant && "btn-o")}>
            Choisir {o.nom}
          </BoutonAbonner>
        )}
      </div>
    </li>
  );
}
