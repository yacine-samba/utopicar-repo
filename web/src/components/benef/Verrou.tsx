import Link from "next/link";
import { centimes, GARANTIE, OFFRES, prixParAnalyse, prixTxt, type OffreId } from "@/lib/offres";
import { BoutonAbonner } from "@/components/site/BoutonAbonner";

/** Module réservé à une formule supérieure : le bouton ouvre directement son paiement (ou le portail pour un abonné). */
export function VerrouBenef({ titre, texte, offre }: { titre: string; texte: string; offre: OffreId }) {
  const o = OFFRES[offre];
  const pa = prixParAnalyse(o);
  return (
    <section className="carte mx-auto max-w-2xl p-8 text-center">
      <p className="text-sm font-medium text-o2">Inclus dans Benef {o.nom}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">{titre}</h1>
      <p className="mt-3 text-ink-2">{texte}</p>
      <div className="mx-auto mt-6 w-fit">
        <BoutonAbonner produit={o.id} className="btn btn-o">
          Passer à {o.nom}, {prixTxt(o.prix)} par mois
        </BoutonAbonner>
      </div>
      <p className="mt-3 text-sm text-ink-3">
        {pa ? `${o.analyses} analyses par mois, soit ${centimes(pa)} l'analyse. ` : ""}Sans engagement{GARANTIE ? `, remboursé sous ${GARANTIE.jours} jours` : ""}.{" "}
        <Link href="/tarifs#benef" className="text-o2 underline underline-offset-4">Comparer les formules</Link>
      </p>
    </section>
  );
}
