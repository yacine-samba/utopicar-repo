import { OFFRES, PACKS, prixTxt, prixUnite } from "@/lib/offres";
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

/** Carte « Crédits à l'unité », à côté des formules particulier. */
export function CarteCredits() {
  const e = OFFRES.essentiel;
  return (
    <li id="credits" className="carte relative flex scroll-mt-24 flex-col p-6 sm:p-7">
      <span className="absolute -top-3 left-6 rounded-full border border-line-2 bg-bg1 px-3 py-1 text-xs font-semibold text-ink-2">Sans abonnement</span>
      <h3 className="font-display text-xl font-semibold">Crédits à l&apos;unité</h3>
      <p className="mt-1 text-sm text-ink-3">Pour analyser quand vous en avez besoin</p>
      <p className="mt-5 flex items-baseline gap-1.5">
        <span className="text-ink-3">dès</span>
        <b className="num font-display text-4xl font-semibold">{prixTxt(PACKS[0].prix)}</b>
      </p>
      <p className="mt-1 text-sm text-ink-3">Payé une fois, valable 12 mois</p>
      <ul className="mt-6 grid content-start gap-2.5 text-[15px]">
        {["Analyse détaillée, comme Essentiel", "Analyse de 3 photos par annonce", "Utilisés seulement quand votre formule est épuisée"].map((t) => (
          <li key={t} className="flex gap-2.5">
            <span className="mt-0.5 text-ok" aria-hidden="true">✓</span>
            <span className="text-ink-2">{t}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex-1 content-end">
        <ListePacks compact />
      </div>
      <p className="mt-3 text-xs text-ink-3">
        Plus de 3 voitures à comparer ? {e.nom} revient à {unite(e.prix / e.analyses)} l&apos;analyse.
      </p>
    </li>
  );
}
