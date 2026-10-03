import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { compteCourant } from "@/lib/compte";
import { familleEspace, nomFormule } from "@/lib/espace";
import { BENEF, PARTICULIERS, prixTxt } from "@/lib/offres";
import { confirmerRetour } from "@/lib/stripe-synchro";
import { BoutonPortail, BoutonSupprimer, ChoixUsage, FormMotDePasse, FormProfil } from "@/components/compte/ActionsCompte";
import { CartesOffres } from "@/components/site/CartesOffres";

export const metadata: Metadata = { title: "Compte et formule" };

const dateFr = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const STATUTS: Record<string, string> = { active: "Active", trialing: "Période d'essai", past_due: "Paiement en attente", canceled: "Résiliée", unpaid: "Impayée", incomplete: "Paiement incomplet" };

export default async function Compte({ searchParams }: { searchParams: Promise<{ paiement?: string; motdepasse?: string; session_id?: string }> }) {
  const compte = await compteCourant();
  if (!compte) redirect("/connexion?next=/app/compte");
  const { paiement, motdepasse, session_id } = await searchParams;
  // Retour de Stripe : l'abonnement est enregistré tout de suite, puis on recharge pour l'afficher.
  if (paiement === "ok" && session_id) {
    await confirmerRetour(session_id, compte.id);
    redirect("/app/compte?paiement=ok");
  }
  const o = compte.offre;
  const abo = compte.abonnement;
  const famille = familleEspace(compte);
  const aboActif = !!abo && ["active", "trialing", "past_due"].includes(abo.statut);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Compte et formule</h1>
        <p className="mt-1 text-ink-3">{compte.email}</p>
      </div>

      {paiement === "ok" && (
        <p role="status" className="rounded-2xl border border-ok/40 bg-ok/10 p-4 text-ok">
          Merci, votre paiement est confirmé. Si la formule n&apos;apparaît pas encore, <Link href="/app/compte" className="underline underline-offset-4">actualisez la page</Link> dans quelques secondes.
        </p>
      )}
      {motdepasse && (
        <p role="status" className="rounded-2xl border border-o/40 bg-o/10 p-4 text-o2">
          Vous êtes connecté. Choisissez votre nouveau mot de passe dans la section Sécurité, plus bas.
        </p>
      )}

      <section id="formule" className="carte scroll-mt-24 p-6 sm:p-7" aria-labelledby="c-formule">
        <h2 id="c-formule" className="font-display text-xl font-semibold">
          Votre formule
        </h2>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <b className="font-display text-3xl font-semibold">{nomFormule(compte)}</b>
          <span className="text-ink-3">{compte.offerte ? "offerte par Utopicar" : o.prix ? `${prixTxt(o.prix)} par mois` : "gratuite"}</span>
        </div>
        {compte.offerte ? (
          <p className="mt-2 text-sm text-ink-2">{compte.offerte.jusquAu ? `Jusqu'au ${dateFr(compte.offerte.jusquAu)} inclus.` : "Sans date de fin."}</p>
        ) : (
          abo && (
            <p className="mt-2 text-sm text-ink-2">
              {STATUTS[abo.statut] ?? abo.statut}
              {abo.periode_fin && (abo.annule_fin_periode ? ` · se termine le ${dateFr(abo.periode_fin)}` : ` · renouvellement le ${dateFr(abo.periode_fin)}`)}
            </p>
          )
        )}
        <div className="mt-6 max-w-xl">
          <div className="flex justify-between text-sm">
            <span>Analyses {o.parMois ? "ce mois-ci" : "offertes"}</span>
            <span className="num">
              {compte.utilisees} / {o.analyses}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Analyses utilisées" aria-valuemin={0} aria-valuemax={o.analyses} aria-valuenow={compte.utilisees}>
            <div className="h-full rounded-full bg-gradient-to-r from-o to-o2" style={{ width: `${Math.min(100, (compte.utilisees / o.analyses) * 100)}%` }} />
          </div>
          <p className="mt-2 text-sm text-ink-3">{compte.restantes ? `Il vous reste ${compte.restantes} analyse${compte.restantes > 1 ? "s" : ""}.` : o.parMois ? "Vos analyses reviennent le 1er du mois." : "Votre analyse offerte a servi."}</p>
        </div>
        {aboActif && (
          <div className="mt-6 flex flex-wrap gap-3">
            <BoutonPortail>Factures, carte et résiliation</BoutonPortail>
          </div>
        )}
      </section>

      {!aboActif && !compte.offerte && (
        <section id="usage" className="carte scroll-mt-24 p-6 sm:p-7" aria-labelledby="c-usage">
          <h2 id="c-usage" className="font-display text-xl font-semibold">
            Votre usage
          </h2>
          <p className="mb-4 mt-1 text-sm text-ink-3">Votre espace, vos outils et vos guides s&apos;adaptent à ce choix. Vous pouvez en changer à tout moment.</p>
          <ChoixUsage id={compte.id} famille={famille} />
        </section>
      )}

      {!compte.offerte && (
        <section aria-labelledby="c-offres" className="grid gap-4">
          <div>
            <h2 id="c-offres" className="font-display text-xl font-semibold">
              {aboActif ? "Changer de formule" : famille === "benef" ? "Les formules Benef" : "Les formules"}
            </h2>
            <p className="mt-1 text-sm text-ink-3">Sans engagement, résiliable à tout moment. Paiement sécurisé par Stripe.{aboActif ? " Le changement passe par votre espace de paiement : vous ne payez jamais deux abonnements." : ""}</p>
          </div>
          <CartesOffres ids={famille === "benef" ? BENEF : PARTICULIERS} actuelle={o.id} />
          <p className="text-sm text-ink-3">
            {famille === "benef" ? "Vous cherchez une voiture pour vous ? " : "Vous achetez pour revendre ? "}
            <Link href={`/tarifs#${famille === "benef" ? "particuliers" : "benef"}`} className="text-o2 underline underline-offset-4">
              {famille === "benef" ? "Voir les formules particulier" : "Voir les formules Benef"}
            </Link>
          </p>
        </section>
      )}

      <section className="carte p-6 sm:p-7" aria-labelledby="c-profil">
        <h2 id="c-profil" className="mb-4 font-display text-xl font-semibold">
          Profil
        </h2>
        <FormProfil id={compte.id} prenom={compte.prenom} ville={compte.ville} />
      </section>

      <section id="securite" className="carte scroll-mt-24 p-6 sm:p-7" aria-labelledby="c-secu">
        <h2 id="c-secu" className="mb-4 font-display text-xl font-semibold">
          Sécurité
        </h2>
        <FormMotDePasse />
        <div className="mt-8 border-t border-line pt-5">
          <BoutonSupprimer />
        </div>
      </section>
    </div>
  );
}
