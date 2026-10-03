import Link from "next/link";
import { OFFRES, prixTxt, type OffreId } from "@/lib/offres";

/** Module réservé à une formule supérieure. */
export function VerrouBenef({ titre, texte, offre }: { titre: string; texte: string; offre: OffreId }) {
  const o = OFFRES[offre];
  return (
    <section className="carte mx-auto max-w-2xl p-8 text-center">
      <p className="text-sm font-medium text-o2">Inclus dans Benef {o.nom}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">{titre}</h1>
      <p className="mt-3 text-ink-2">{texte}</p>
      <Link href="/app/compte#formule" className="btn btn-o mt-6">
        Passer à {o.nom}, {prixTxt(o.prix)} par mois
      </Link>
    </section>
  );
}
