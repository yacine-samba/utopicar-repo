import { PACKS, prixTxt, prixUnite } from "@/lib/offres";
import { BoutonAbonner } from "./BoutonAbonner";
import { cx } from "@/lib/cx";

const unite = (v: number) => `${v.toFixed(2).replace(".", ",")} €`;

/** Les packs de crédits, en lignes cliquables : chacune lance le paiement Stripe du pack. */
export function ListePacks({ compact = false }: { compact?: boolean }) {
  const base = prixUnite(PACKS[0]);
  return (
    <ul className="grid gap-2.5">
      {PACKS.map((p) => {
        const remise = Math.round((1 - prixUnite(p) / base) * 100);
        return (
          <li key={p.id}>
            <BoutonAbonner
              produit={p.id}
              className={cx(
                "group relative flex w-full items-center justify-between gap-3 rounded-2xl border px-4 text-left transition hover:border-o/60 disabled:opacity-60",
                compact ? "min-h-14 py-2.5" : "min-h-16 py-3",
                p.badge === "Conseillé" ? "border-o/50 bg-o/10" : "border-line-2 bg-glass",
              )}
            >
              <span className="grid min-w-0 gap-0.5">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-display font-semibold">
                  {p.credits} analyse{p.credits > 1 ? "s" : ""}
                  {p.badge && <span className={cx("rounded-full px-2 py-px text-[11px] font-semibold", p.badge === "Conseillé" ? "bg-o text-[#160904]" : "bg-ok/15 text-ok")}>{p.badge}</span>}
                </span>
                <span className="text-xs text-ink-3">
                  {p.credits > 1 ? `${unite(prixUnite(p))} l'analyse${remise > 0 ? ` · −${remise} %` : ""}` : "Pour une seule voiture"}
                </span>
              </span>
              <b className="num shrink-0 font-display text-lg">{prixTxt(p.prix)}</b>
            </BoutonAbonner>
          </li>
        );
      })}
    </ul>
  );
}

/** Option sans abonnement, en petit et centrée sous les formules : une ligne, les packs s'ouvrent au clic. */
export function CreditsDiscrets() {
  return (
    <details id="credits" className="group mx-auto w-full max-w-md scroll-mt-24 text-center text-sm text-ink-3">
      <summary className="cursor-pointer list-none rounded-full px-3 py-1.5 hover:text-ink [&::-webkit-details-marker]:hidden">
        Sans abonnement : crédits à l&apos;unité, dès {prixTxt(PACKS[0].prix)} l&apos;analyse ·{" "}
        <span className="text-o2 underline underline-offset-4">voir les packs</span>
      </summary>
      <div className="mt-3 grid gap-2 text-left">
        <ListePacks compact />
        <p className="text-center text-xs">Analyse détaillée avec 3 photos, payée une fois, valable 12 mois.</p>
      </div>
    </details>
  );
}
