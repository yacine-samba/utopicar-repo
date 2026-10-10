import type { Metadata } from "next";
import Link from "next/link";
import { Calculateur } from "@/components/benef/Calculateur";
import { Peurs } from "@/components/benef/Peurs";
import { CARTE_BENEF, PreuveAnimee } from "@/components/accueil/PreuveAnimee";
import { OutilsBenef } from "@/components/benef/OutilsBenef";
import { TroisTemps } from "@/components/accueil/TroisTemps";
import { GainsAbonnement } from "@/components/site/GainsAbonnement";
import { ChiffresMarche } from "@/components/site/ChiffresMarche";
import { BarreEssai } from "@/components/site/BarreEssai";
import { Faq } from "@/components/site/Faq";
import { Essai } from "@/components/accueil/Essai";
import { fournisseursActifs } from "@/lib/fournisseurs";
import { BENEF, GUIDE } from "@/lib/offres";

export const metadata: Metadata = {
  title: "Benef : l'achat-revente automobile, chiffré avant de vous déplacer",
  description: "Pour vous lancer dans l'achat-revente de voitures ou développer votre activité : marge nette, prix d'offre, historique, tableau de bord et gestion du parc.",
};

/* Page Benef pensée pour la conversion : d'abord essayer (coller une annonce, voir la marge), ensuite seulement les formules.
   Peu de texte, une preuve animée de 2 s, le calculateur à manipuler, puis les réponses aux peurs du débutant. */

const CHAPITRES = ["Les vrais chiffres, avant de rêver", "Commencer sans argent : le mandat de vente", "Les moteurs et les boîtes à fuir"];

const Coche = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true" className="shrink-0 text-ok">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

export default async function Benef() {
  const fournisseurs = await fournisseursActifs();
  return (
    <>
      {/* ---------------- héros : chiffrer une annonce tout de suite, la marge qui se calcule à côté ---------------- */}
      <section className="relative overflow-hidden pb-12 pt-10 sm:pt-16">
        <div className="wrap grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div className="text-center lg:text-left lg:[&_p.justify-center]:justify-start">
            <span className="kicker arrivee">Benef · achat-revente automobile</span>
            <h1 className="arrivee mx-auto mt-5 max-w-[16ch] font-display text-[clamp(36px,5.6vw,64px)] font-semibold leading-[1.03] tracking-[-0.03em] lg:mx-0" style={{ "--i": 1 } as React.CSSProperties}>
              Achetez, revendez, <span className="it">gardez la marge</span>
            </h1>
            <div className="mt-6">
              <TroisTemps etapes={[["lien", "Collez l'annonce"], ["balance", "Frais déduits"], ["verdict", "Votre marge nette"]]} />
            </div>
            <div className="arrivee mt-7" style={{ "--i": 3 } as React.CSSProperties}>
              <Essai fournisseurs={fournisseurs} depuis="benef" familleInitiale="benef" />
            </div>
            <ul className="arrivee mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-2 lg:justify-start" style={{ "--i": 4 } as React.CSSProperties}>
              {["Gratuit", "Sans compte", "Sans engagement"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Coche />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <PreuveAnimee carte={CARTE_BENEF} />
        </div>
      </section>

      <ChiffresMarche />

      {/* ---------------- calculateur : on manipule, on comprend ---------------- */}
      <section id="calculateur" className="scroll-mt-24 py-16">
        <div className="wrap">
          <div className="apparait mx-auto mb-10 max-w-2xl text-center">
            <h2 className="h-sec">
              Combien vous reste&#8209;t&#8209;il <span className="it">vraiment ?</span>
            </h2>
            <p className="mt-3 text-lg text-ink-2">Bougez les curseurs.</p>
          </div>
          <Calculateur />
        </div>
      </section>

      {/* ---------------- les peurs du débutant ---------------- */}
      <section className="py-16">
        <div className="wrap">
          <h2 className="apparait h-sec mx-auto mb-10 max-w-2xl text-center">
            Ce qui fait peur, <span className="it">et ce qui vous protège</span>
          </h2>
          <Peurs />
        </div>
      </section>

      {/* ---------------- ce que vous obtenez : 4 lignes, pas un catalogue ---------------- */}
      <section className="py-16">
        <div className="wrap">
          <h2 className="apparait h-sec mx-auto mb-10 max-w-2xl text-center">
            Tout pour chaque voiture, <span className="it">au même endroit</span>
          </h2>
          <OutilsBenef />
        </div>
      </section>

      {/* ---------------- formules ---------------- */}
      <section id="formules" className="scroll-mt-24 py-16">
        <div className="wrap">
          <div className="apparait mx-auto mb-10 max-w-2xl text-center">
            <h2 className="h-sec">
              Pourquoi s&apos;abonner ? <span className="it">Une voiture suffit</span>
            </h2>
            <p className="mt-3 text-lg text-ink-2">Une seule bonne affaire paie l&apos;abonnement. Une seule erreur évitée aussi.</p>
          </div>
          <GainsAbonnement famille="benef" ids={BENEF} lien="/tarifs#benef" />
        </div>
      </section>

      {/* ---------------- le guide, en aperçu ---------------- */}
      <section id="guide" className="scroll-mt-24 py-16">
        <div className="wrap grid items-center gap-8 lg:grid-cols-2">
          <div className="apparait text-center lg:text-left">
            <h2 className="h-sec">
              16 chapitres, de zéro <span className="it">à votre première revente</span>
            </h2>
            <p className="mt-3 text-lg text-ink-2">Inclus dans toutes les formules Benef, ou {GUIDE.prix}&nbsp;€ seul, à vie.</p>
            <Link href="/guide" className="btn btn-o mt-6">
              Lire les 2 premiers chapitres <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ol className="carte apparait grid divide-y divide-line p-2" style={{ "--i": 1 } as React.CSSProperties}>
            {CHAPITRES.map((c, i) => (
              <li key={c} className="flex items-center gap-4 px-4 py-3">
                <span className="num w-6 font-display text-sm text-o2">{i + 1}</span>
                <span className="flex-1">{c}</span>
                {i < 2 ? <span className="text-xs font-medium text-ok">Offert</span> : <span className="text-xs text-ink-3">Inclus</span>}
              </li>
            ))}
            <li className="px-4 py-3 text-sm text-ink-3">+ 13 chapitres</li>
          </ol>
        </div>
      </section>

      {/* ---------------- questions ---------------- */}
      <section className="py-16">
        <div className="wrap">
          <h2 className="apparait h-sec mx-auto mb-10 max-w-2xl text-center">
            Avant de <span className="it">vous lancer</span>
          </h2>
          <Faq
            questions={[
              { cat: "Budget", q: "Faut-il beaucoup d'argent pour commencer ?", r: <p>Pour une citadine fiable, comptez 4 000 à 6 000 € avec une réserve. Sans ce budget, vous pouvez commencer sans acheter : vendre la voiture d&apos;un particulier contre une commission, avec un mandat écrit. Le guide explique comment.</p> },
              { cat: "Statut", q: "Faut-il un statut ?", r: <p>Pour revendre votre propre voiture de temps en temps, non. Pour acheter et revendre régulièrement, oui : la micro-entreprise est le plus simple pour démarrer. Un comptable ou la CCI valide votre situation.</p> },
              { cat: "Temps", q: "Combien de temps cela demande-t-il ?", r: <p>Plusieurs heures par semaine par voiture : recherche, appels, visite, papiers, revente. C&apos;est un complément de revenu, pas un revenu passif. L&apos;outil réduit surtout le temps perdu sur les mauvaises annonces.</p> },
              { cat: "Résultats", q: "Promettez-vous 1 000 € par mois ?", r: <p>Non. Les résultats dépendent de votre budget, de votre temps et de vos achats. Benef vous donne des chiffres clairs avant chaque achat, pour éviter les erreurs qui coûtent cher.</p> },
              { cat: "Formules", q: "Quelle formule choisir ?", r: <p>Starter pour vos premières voitures, Croissance dès que vous en faites plusieurs par mois, Pro si vous gérez un stock. Vous changez à tout moment.</p> },
            ]}
          />
        </div>
      </section>

      {/* ---------------- appel final ---------------- */}
      <section id="appel-final" className="py-16 text-center">
        <div className="wrap">
          <div className="carte apparait mx-auto max-w-3xl px-6 py-12">
            <h2 className="h-sec">
              Votre prochaine marge, <span className="it">chiffrée avant d&apos;appeler</span>
            </h2>
            <Link href="#essai" className="btn btn-o mt-7">
              Chiffrer une annonce <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
      <BarreEssai libelle="Chiffrer une annonce" />
    </>
  );
}
