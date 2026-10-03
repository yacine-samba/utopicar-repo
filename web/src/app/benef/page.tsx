import type { Metadata } from "next";
import Link from "next/link";
import { Calculateur } from "@/components/benef/Calculateur";
import { Peurs } from "@/components/benef/Peurs";
import { CartesOffres } from "@/components/site/CartesOffres";
import { Faq } from "@/components/site/Faq";
import { Defile } from "@/components/site/Defile";
import { BoutonOnboarding } from "@/components/site/BoutonOnboarding";
import { compteCourant } from "@/lib/compte";
import { BENEF, GUIDE } from "@/lib/offres";

export const metadata: Metadata = {
  title: "Benef : l'achat-revente automobile, chiffré avant de vous déplacer",
  description: "Pour vous lancer dans l'achat-revente de voitures ou développer votre activité : marge nette, prix d'offre, historique, tableau de bord et gestion du parc.",
};

const CHAPITRES = [
  "Les vrais chiffres, avant de rêver",
  "Le cadre légal, dès le départ",
  "Commencer sans argent : le mandat de vente",
  "Quelles voitures viser",
  "Les moteurs et les boîtes à fuir",
  "Trouver les bonnes annonces avant les autres",
  "Estimer le vrai prix de revente",
  "Calculer votre prix maximum avant d'appeler",
  "Le premier contact",
  "L'inspection et l'essai",
  "Négocier sans être désagréable",
  "Payer et récupérer les bons papiers",
  "Préparer la voiture : ce qui rapporte, ce qui ne rapporte pas",
  "Les photos et l'annonce qui vendent",
  "Vendre : appels, visites, paiement, papiers",
  "Votre plan sur 30 jours",
];

export default async function Benef() {
  const compte = await compteCourant();
  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-14 text-center sm:pt-20">
        <div className="wrap">
          <span className="kicker apparait">Benef par Utopicar · achat-revente automobile</span>
          <h1 className="apparait mx-auto mt-6 max-w-[18ch] font-display text-[clamp(36px,6.4vw,72px)] font-semibold leading-[1.03] tracking-[-0.03em]" style={{ "--i": 1 } as React.CSSProperties}>
            Achetez, revendez, <span className="it">gardez la marge</span>
          </h1>
          <p className="apparait mx-auto mt-6 max-w-2xl text-lg text-ink-2 sm:text-xl" style={{ "--i": 2 } as React.CSSProperties}>
            Que vous fassiez votre première revente ou votre centième, Benef chiffre chaque annonce avant que vous ne vous déplaciez : marge nette, prix d&apos;offre et prix à ne pas dépasser.
          </p>
          <div className="apparait mt-9 flex flex-wrap justify-center gap-3" style={{ "--i": 3 } as React.CSSProperties}>
            <Link href="#formules" className="btn btn-o">
              Voir les formules <span aria-hidden="true">→</span>
            </Link>
            <Link href="/app" className="btn">
              Ouvrir l&apos;espace Benef
            </Link>
          </div>
          <p className="apparait mt-5 text-sm text-ink-3" style={{ "--i": 4 } as React.CSSProperties}>
            Pas sûr de la formule ? <BoutonOnboarding className="text-o2 underline underline-offset-4">Répondez à 3 questions</BoutonOnboarding>
          </p>
        </div>
      </section>

      <Defile
        label="Les questions qu'on se pose avant de se lancer"
        items={["« Et si je me faisais arnaquer ? »", "« Je ne sais pas combien payer »", "« Et si la voiture était en mauvais état ? »", "« Faut-il un statut ? »", "« Je n'ai pas le budget »", "« Par où commencer ? »"]}
      />

      <section className="py-20">
        <div className="wrap">
          <div className="apparait mx-auto mb-12 max-w-2xl text-center">
            <span className="kicker">Si vous n&apos;avez pas encore commencé</span>
            <h2 className="h-sec mt-5">
              Ce n&apos;est pas la motivation qui manque. <span className="it">C&apos;est la méthode.</span>
            </h2>
          </div>
          <Peurs />
        </div>
      </section>

      <section id="calculateur" className="scroll-mt-24 py-20">
        <div className="wrap">
          <div className="apparait mx-auto mb-12 max-w-2xl text-center">
            <span className="kicker">Calculateur de marge</span>
            <h2 className="h-sec mt-5">
              Combien vous reste-t-il <span className="it">vraiment ?</span>
            </h2>
            <p className="mt-4 text-lg text-ink-2">500 à 1 000 € par mois, c&apos;est une ou deux voitures bien achetées, pas 10 000 € en une semaine.</p>
          </div>
          <Calculateur />
        </div>
      </section>

      <section className="py-20">
        <div className="wrap">
          <div className="apparait mx-auto mb-12 max-w-2xl text-center">
            <span className="kicker">L&apos;espace Benef</span>
            <h2 className="h-sec mt-5">
              Tout le rapport par défaut, <span className="it">la synthèse en un clic</span>
            </h2>
            <p className="mt-4 text-lg text-ink-2">Chaque analyse affiche l&apos;ensemble des informations. Pressé ? Un bouton affiche instantanément une synthèse déjà rédigée.</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Analyse de véhicule", "Cote, défauts chiffrés, fiabilité du moteur, état sur photos, marge nette, prix d'offre et plafond, verdict GO ou NO GO."],
              ["Historique des rapports", "Retrouvez chaque analyse, avec son verdict et sa marge. Comparez deux ou trois rapports côte à côte (Croissance et Pro)."],
              ["Tableau de bord", "Analyses du mois, meilleures affaires repérées, marge moyenne. Le tableau complet ajoute le stock, la rotation et la marge réelle (Pro)."],
              ["Gestion du parc", "Achats, frais, mise en vente, vente : la marge réelle de chaque voiture et le temps passé en stock (Pro)."],
              ["Recherche avancée", "Filtrez tous vos rapports par marque, verdict, marge, prix et date (Pro)."],
              ["Message et négociation", "Premier message au vendeur, questions à poser, arguments chiffrés et prix d'ouverture."],
            ].map(([t, d], i) => (
              <li key={t} className="carte apparait p-6" style={{ "--i": i % 3 } as React.CSSProperties}>
                <h3 className="font-display text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-ink-2">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="formules" className="scroll-mt-24 py-20">
        <div className="wrap">
          <div className="apparait mx-auto mb-12 max-w-2xl text-center">
            <span className="kicker">Formules Benef</span>
            <h2 className="h-sec mt-5">
              Du premier achat <span className="it">au stock géré</span>
            </h2>
            <p className="mt-4 text-lg text-ink-2">Sans engagement. Changez de formule ou résiliez à tout moment depuis votre compte.</p>
          </div>
          <CartesOffres ids={BENEF} actuelle={compte?.offre.id} />
        </div>
      </section>

      <section id="guide" className="scroll-mt-24 py-20">
        <div className="wrap grid items-start gap-10 lg:grid-cols-2">
          <div className="apparait">
            <span className="kicker">Le guide</span>
            <h2 className="h-sec mt-5">
              16 chapitres, de zéro <span className="it">à votre première revente</span>
            </h2>
            <p className="mt-4 text-lg text-ink-2">La méthode complète, étape par étape, avec les chiffres réels. Inclus dans toutes les formules Benef, ou {GUIDE.prix} € seul, accès à vie.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/guide" className="btn btn-o">
                Lire les premiers chapitres <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <ol className="carte apparait grid gap-0 divide-y divide-line p-2" style={{ "--i": 1 } as React.CSSProperties}>
            {CHAPITRES.map((c, i) => (
              <li key={c} className="flex items-center gap-4 px-4 py-3">
                <span className="num w-6 font-display text-sm text-o2">{i + 1}</span>
                <span className="flex-1">{c}</span>
                {i < 2 ? <span className="text-xs text-ok">Offert</span> : <span className="text-xs text-ink-3">Inclus</span>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20">
        <div className="wrap">
          <div className="apparait mx-auto mb-12 max-w-2xl text-center">
            <span className="kicker">Questions</span>
            <h2 className="h-sec mt-5">
              Avant de <span className="it">vous lancer</span>
            </h2>
          </div>
          <Faq
            questions={[
              { cat: "Budget", q: "Faut-il beaucoup d'argent pour commencer ?", r: <p>Pour une citadine fiable, comptez 4 000 à 6 000 € avec une réserve pour les imprévus. Sans ce budget, vous pouvez commencer sans acheter : vendre la voiture d&apos;un particulier contre une commission, avec un mandat écrit. Le guide explique comment.</p> },
              { cat: "Statut", q: "Faut-il un statut ?", r: <p>Pour revendre votre propre voiture de temps en temps, non. Pour acheter et revendre régulièrement, oui : c&apos;est une activité commerciale. La micro-entreprise est le plus simple pour démarrer. Le guide explique les bases ; un comptable ou la CCI valide votre situation.</p> },
              { cat: "Temps", q: "Combien de temps cela demande-t-il ?", r: <p>Pour une voiture : recherche, appels, visite, papiers, préparation, revente. Comptez plusieurs heures par semaine. C&apos;est un complément de revenu, pas un revenu passif. L&apos;outil réduit surtout le temps perdu sur les mauvaises annonces.</p> },
              { cat: "Résultats", q: "Promettez-vous 1 000 € par mois ?", r: <p>Non. Les résultats dépendent de votre budget, de votre temps et de vos achats. Ce que Benef apporte : des chiffres clairs avant chaque achat, pour éviter les erreurs qui coûtent cher.</p> },
              { cat: "Formules", q: "Quelle formule choisir ?", r: <p>Starter pour vos premières voitures, Croissance dès que vous en faites plusieurs par mois, Pro si vous gérez un stock et voulez suivre vos marges réelles. Vous pouvez changer à tout moment.</p> },
            ]}
          />
        </div>
      </section>
    </>
  );
}
