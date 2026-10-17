import { OFFRES, VARIANTES, type OffreId } from "@/lib/offres";
import { cx } from "@/lib/cx";
import { CreditsDiscrets } from "./CarteCredits";
import { CarteOffre } from "./CarteOffre";

/** Grille de formules. `actuelle` marque la formule du compte connecté (Pro + Messages : la carte Pro, case cochée) ;
    `credits` ajoute, en petit et centrée sous les cartes, l'option sans abonnement (crédits à l'unité) ;
    `gratuitBenef` ouvre la grille sur l'analyse Benef offerte (trois cartes : gratuit, la conseillée, la plus complète). */
export function CartesOffres({ ids, actuelle, credits = false, gratuitBenef = false }: { ids: OffreId[]; actuelle?: OffreId | null; credits?: boolean; gratuitBenef?: boolean }) {
  const visibles = ids.filter((id) => !OFFRES[id].cachee);
  const n = visibles.length + (gratuitBenef ? 1 : 0);
  const grille = (
    <ul className={cx("grid gap-5", n === 2 ? "mx-auto max-w-4xl md:grid-cols-2" : "md:grid-cols-3")}>
      {gratuitBenef && <CarteOffre id="gratuit" gratuitBenef />}
      {visibles.map((id) => (
        <CarteOffre key={id} id={id} variante={VARIANTES[id]} actuelle={actuelle} />
      ))}
    </ul>
  );
  if (!credits) return grille;
  return (
    <div className="grid gap-6">
      {grille}
      <CreditsDiscrets />
    </div>
  );
}
