import { GARANTIE } from "@/lib/offres";
import { cx } from "@/lib/cx";

/** Ce qui se passe après le paiement, dit avant de payer : accès, recharge, résiliation, garantie, prix payé. */
export function Rassurance({ className }: { className?: string }) {
  const points: [string, string][] = [
    ["Accès immédiat", "Vos analyses s'ouvrent dès le paiement."],
    ["Rechargées chaque mois", "Le 1er du mois, sans rien faire."],
    ["Résiliable en deux clics", "Depuis votre compte, sans appel ni courrier."],
    GARANTIE ? [`Remboursé sous ${GARANTIE.jours} jours`, "Le premier mois, sur simple e-mail."] : ["Sans engagement", "Vous arrêtez quand vous voulez."],
  ];
  return (
    <section aria-label="Après le paiement" className={cx("grid gap-3", className)}>
      <ul className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {points.map(([t, d]) => (
          <li key={t} className="flex gap-2 rounded-2xl border border-line bg-glass p-3 sm:gap-3 sm:p-4">
            <span className="mt-0.5 text-ok" aria-hidden="true">✓</span>
            <span>
              <b className="block text-sm font-semibold sm:text-[15px]">{t}</b>
              <span className="text-xs text-ink-3 sm:text-sm">{d}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="text-center text-xs text-ink-3">Paiement sécurisé par Stripe : Utopicar ne voit jamais votre carte. Le prix affiché est le prix payé, aucun frais ne s&apos;ajoute.</p>
    </section>
  );
}
