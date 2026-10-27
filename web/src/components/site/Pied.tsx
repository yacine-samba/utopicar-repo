import Link from "next/link";
import { Logo } from "./Logo";
import { BoutonAnimations } from "./BoutonAnimations";

const COLONNES = [
  { titre: "Utopicar", liens: [["/analyse", "Analyser une annonce"], ["/fiabilite", "Occasions fiables"], ["/moteur", "Moteurs à éviter"], ["/tarifs", "Tarifs"], ["/guide", "Guides"], ["/app", "Mon espace"]] },
  { titre: "Benef", liens: [["/benef", "Découvrir Benef"], ["/tarifs#benef", "Formules Benef"], ["/guide?guide=premiere-revente", "Guide de la première revente"]] },
  { titre: "Informations", liens: [["/methode", "Comment l'analyse est faite"], ["/legal#mentions", "Mentions légales"], ["/legal#confidentialite", "Confidentialité"], ["/legal#conditions", "Conditions"], ["/legal#vente", "Conditions de vente"], ["/legal#accessibilite", "Accessibilité"], ["/legal#contact", "Contact"]] },
];

export function Pied() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div className="grid content-start gap-4">
          <Link href="/" aria-label="Utopicar, accueil" className="w-fit">
            <Logo />
          </Link>
          <p className="max-w-xs text-sm text-ink-3">Analyse d&apos;annonces de voitures d&apos;occasion, pour acheter ou revendre au bon prix.</p>
          <BoutonAnimations className="w-fit rounded-full border border-line-2 px-4 py-2 text-sm text-ink-2 hover:text-ink" />
        </div>
        {COLONNES.map((c) => (
          <nav key={c.titre} aria-label={c.titre}>
            <h2 className="mb-3 font-display text-sm font-semibold text-ink">{c.titre}</h2>
            <ul className="grid gap-0.5 text-sm">
              {c.liens.map(([href, l]) => (
                <li key={href}>
                  <Link href={href} className="inline-block py-1.5 text-ink-3 hover:text-ink">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="wrap pb-10 text-xs text-ink-3">
        Estimations indicatives calculées à partir de l&apos;annonce : elles ne remplacent ni l&apos;essai ni l&apos;avis d&apos;un garagiste. Vos données ne sont jamais revendues.
      </p>
    </footer>
  );
}
