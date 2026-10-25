import Link from "next/link";
import { BoutonRetour } from "@/components/site/BoutonRetour";

/* Page introuvable dans l'espace (rapport supprimé, véhicule du parc retiré, lien ancien) : le menu de l'espace reste là. */
export default function IntrouvableEspace() {
  return (
    <section className="carte mx-auto grid max-w-xl justify-items-center p-8 text-center sm:p-10">
      <p className="num font-display text-6xl font-semibold text-o2">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold">Cette page n&apos;existe pas ou plus</h1>
      <p className="mt-2 text-ink-2">Le rapport ou le véhicule a peut-être été supprimé, ou le lien est ancien.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <BoutonRetour secours="/app" className="btn btn-o">
          ← Page précédente
        </BoutonRetour>
        <Link href="/app" className="btn">
          Tableau de bord
        </Link>
      </div>
    </section>
  );
}
