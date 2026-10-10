import Link from "next/link";
import { cx } from "@/lib/cx";
import { OFFRES, PACKS, prixTxt, type OffreId } from "@/lib/offres";

/** Les formules en un coup d'œil : un nom, un grand prix, une ligne. Le détail complet reste sur la page Tarifs. */
export function PrixCompact({ ids, credits = false, lien }: { ids: OffreId[]; credits?: boolean; lien: string }) {
  const tuiles: { cle: string; nom: string; prix: string; unite: string; ligne: string; fort: boolean }[] = ids.map((id) => {
    const o = OFFRES[id];
    return { cle: id, nom: o.nom, prix: o.prix ? prixTxt(o.prix) : "0 €", unite: o.prix ? "/ mois" : "", ligne: o.parMois ? `${o.analyses} analyses par mois` : `${o.analyses} analyse offerte`, fort: !!o.miseEnAvant };
  });
  if (credits) tuiles.push({ cle: "credits", nom: "À l'unité", prix: prixTxt(PACKS[0].prix), unite: "", ligne: "sans abonnement", fort: false });
  return (
    <div className="grid gap-4">
      <ul className={cx("grid gap-3", tuiles.length > 2 && "sm:grid-cols-3", tuiles.length === 2 && "sm:grid-cols-2")}>
        {tuiles.map((t) => (
          <li key={t.cle} className={cx("vue carte relative flex flex-col p-5", t.fort && "border-o/60 bg-[linear-gradient(160deg,rgb(255_90_31/0.12),transparent_60%),var(--color-panel)]")}>
            {t.fort && <span className="absolute right-4 top-4 rounded-full bg-o px-2.5 py-0.5 text-xs font-bold text-[#160904]">Conseillé</span>}
            <span className="text-sm font-medium text-ink-2">{t.nom}</span>
            <span className="mt-2 flex items-baseline gap-1.5">
              <span className="num font-display text-4xl font-semibold tracking-tight">{t.prix}</span>
              {t.unite && <span className="text-sm text-ink-3">{t.unite}</span>}
            </span>
            <span className="mt-1 text-sm text-ink-3">{t.ligne}</span>
          </li>
        ))}
      </ul>
      <p className="text-center text-sm text-ink-3">
        Sans engagement.{" "}
        <Link href={lien} className="font-medium text-o2 underline underline-offset-4">
          Tout comparer
        </Link>
      </p>
    </div>
  );
}
