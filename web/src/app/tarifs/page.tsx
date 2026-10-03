import type { Metadata } from "next";
import Link from "next/link";
import { CartesOffres } from "@/components/site/CartesOffres";
import { BoutonAbonner } from "@/components/site/BoutonAbonner";
import { Faq } from "@/components/site/Faq";
import { compteCourant } from "@/lib/compte";
import { BENEF, GUIDE, PARTICULIERS } from "@/lib/offres";

export const metadata: Metadata = { title: "Tarifs", description: "Formules Utopicar pour les particuliers et formules Benef pour l'achat-revente. Sans engagement." };

export default async function Tarifs({ searchParams }: { searchParams: Promise<{ paiement?: string }> }) {
  const { paiement } = await searchParams;
  const compte = await compteCourant();
  return (
    <div className="wrap py-14">
      <div className="mx-auto max-w-2xl text-center">
        <span className="kicker">Tarifs</span>
        <h1 className="h-sec mt-5">
          Payez seulement <span className="it">ce qui vous sert</span>
        </h1>
        <p className="mt-4 text-lg text-ink-2">Sans engagement, résiliable à tout moment depuis votre compte. Prix toutes taxes comprises.</p>
        {paiement === "annule" && (
          <p role="status" className="mx-auto mt-6 w-fit rounded-2xl border border-warn/40 bg-warn/10 px-4 py-2 text-warn">
            Paiement annulé : rien n&apos;a été débité.
          </p>
        )}
      </div>
      <nav aria-label="Familles de formules" className="mx-auto mt-10 flex w-fit gap-1 rounded-full border border-line-2 bg-glass p-1 text-sm">
        <a href="#particuliers" className="rounded-full px-4 py-2 hover:bg-glass">
          J&apos;achète pour moi
        </a>
        <a href="#benef" className="rounded-full px-4 py-2 hover:bg-glass">
          Achat-revente (Benef)
        </a>
      </nav>

      <section id="particuliers" aria-labelledby="t-part" className="scroll-mt-24 pt-14">
        <h2 id="t-part" className="font-display text-2xl font-semibold">Vous achetez une voiture pour vous</h2>
        <p className="mb-8 mt-1 text-ink-3">Simple et pédagogique : ce que vaut l&apos;annonce, ce qu&apos;elle va vous coûter, ce qu&apos;il faut vérifier.</p>
        <CartesOffres ids={PARTICULIERS} actuelle={compte?.offre.id} />
      </section>

      <section id="benef" aria-labelledby="t-benef" className="scroll-mt-24 pt-20">
        <h2 id="t-benef" className="font-display text-2xl font-semibold">
          Vous faites de l&apos;achat-revente <small className="ml-1 text-base font-medium text-o2">Benef</small>
        </h2>
        <p className="mb-8 mt-1 text-ink-3">
          Rapports complets avec synthèse en un clic, marge et prix d&apos;offre. <Link href="/benef" className="text-o2 underline underline-offset-4">Découvrir Benef</Link>
        </p>
        <CartesOffres ids={BENEF} actuelle={compte?.offre.id} />
      </section>

      <section id="guides" aria-labelledby="t-guide" className="scroll-mt-24 pt-20">
        <div className="carte grid items-center gap-6 p-7 md:grid-cols-[1fr_auto]">
          <div>
            <h2 id="t-guide" className="font-display text-2xl font-semibold">{GUIDE.nom}</h2>
            <p className="mt-2 text-ink-2">
              Quatre guides complets : votre première revente (16 chapitres), trier les annonces, estimer une reprise, acheter une occasion sans vous faire avoir. Accès à vie pour {GUIDE.prix} €, ou inclus dans Sérénité et toutes les formules Benef.
            </p>
          </div>
          <div className="grid gap-2 md:w-60">
            {compte?.guide ? (
              <Link href="/guide" className="btn btn-o">
                Lire les guides
              </Link>
            ) : (
              <BoutonAbonner produit="guide">Acheter pour {GUIDE.prix} €</BoutonAbonner>
            )}
            <Link href="/guide" className="text-center text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
              Lire les premiers chapitres
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="t-faq" className="pt-20">
        <h2 id="t-faq" className="mb-8 text-center font-display text-2xl font-semibold">Paiement et abonnement</h2>
        <Faq
          questions={[
            { q: "Puis-je résilier quand je veux ?", r: <p>Oui, depuis votre compte, en deux clics. L&apos;accès reste ouvert jusqu&apos;à la fin du mois déjà payé, puis rien n&apos;est plus prélevé.</p> },
            { q: "Comment changer de formule ?", r: <p>Depuis votre compte, « Gérer mon abonnement ». Le changement est immédiat et le prix est ajusté au prorata.</p> },
            { q: "Que se passe-t-il quand j'ai utilisé mes analyses du mois ?", r: <p>Elles reviennent le 1er du mois suivant. Vous pouvez aussi passer à la formule supérieure à tout moment.</p> },
            { q: "Le paiement est-il sécurisé ?", r: <p>Le paiement est géré par Stripe. Utopicar ne voit ni ne conserve jamais vos coordonnées bancaires.</p> },
            { q: "Ai-je droit à un remboursement ?", r: <p>Les analyses étant fournies immédiatement, le délai de rétractation ne s&apos;applique pas une fois le service utilisé, comme l&apos;indiquent les <Link href="/legal#vente" className="text-o2 underline underline-offset-4">conditions de vente</Link>. En cas de problème, écrivez-nous : nous trouvons toujours une solution.</p> },
          ]}
          premiereOuverte={false}
        />
      </section>
    </div>
  );
}
