import type { Metadata } from "next";
import { FormulaireProfilAnalyse } from "@/components/analyse/ProfilAnalyse";
import Link from "next/link";
import { redirect } from "next/navigation";
import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { guidesPour, GUIDES } from "@/lib/guides";
import { OptionMessages } from "@/components/compte/OptionMessages";
import { familleEspace, nomFormule } from "@/lib/espace";
import { BENEF, PARTICULIERS, prixTxt } from "@/lib/offres";
import { confirmerRetour } from "@/lib/stripe-synchro";
import {
  BoutonPortail,
  BoutonSupprimer,
  ChoixAccessibilite,
  ChoixUsage,
  FormEmail,
  FormMotDePasse,
  FormProfil,
} from "@/components/compte/ActionsCompte";
import { CartesOffres } from "@/components/site/CartesOffres";

export const metadata: Metadata = { title: "Profil et paramètres" };

const dateFr = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const STATUTS: Record<string, string> = {
  active: "Active",
  trialing: "Période d'essai",
  past_due: "Paiement en attente",
  canceled: "Résiliée",
  unpaid: "Impayée",
  incomplete: "Paiement incomplet",
};

export default async function Compte({
  searchParams,
}: {
  searchParams: Promise<{
    paiement?: string;
    motdepasse?: string;
    email?: string;
    session_id?: string;
  }>;
}) {
  const compte = await compteCourant();
  if (!compte) redirect("/connexion?next=/app/compte");
  const { paiement, motdepasse, session_id, email } = await searchParams;
  // Retour de Stripe : l'abonnement est enregistré tout de suite, puis on recharge pour l'afficher.
  if (paiement === "ok" && session_id) {
    // Abonnement confirmé : on arrive sur la visite de bienvenue. Si Stripe n'a pas encore confirmé, on reste sur le compte.
    const ok = await confirmerRetour(session_id, compte.id);
    redirect(ok ? "/app?bienvenue=1" : "/app/compte?paiement=ok");
  }
  const o = compte.offre;
  const abo = compte.abonnement;
  const famille = familleEspace(compte);
  const aboActif =
    !!abo && ["active", "trialing", "past_due"].includes(abo.statut);
  const { data: profil } = await (await supabaseServeur()).from("profils").select("reglages").eq("id", compte.id).maybeSingle();
  const mesGuides = guidesPour(o.id, famille).map((id) => GUIDES.find((g) => g.id === id)!);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">
          Profil et paramètres
        </h1>
        <p className="mt-1 text-ink-3">
          {[compte.prenom, compte.nom].filter(Boolean).join(" ") || "Mon compte"} · {compte.email} · {nomFormule(compte)}
        </p>
        <nav aria-label="Rubriques du profil" className="mt-4 flex flex-wrap gap-2 text-sm">
          {[["#formule", "Formule"], ["#guides", "Voir mes guides"], ["#accessibilite", "Accessibilité"], ["#profil", "Profil"], ["#securite", "Mot de passe et e-mail"]].map(([h, l]) => (
            <a key={h} href={h} className="rounded-full border border-line-2 px-3 py-1.5 text-ink-2 hover:border-o/40 hover:text-ink">{l}</a>
          ))}
        </nav>
      </div>

      {paiement === "ok" && (
        <p
          role="status"
          className="rounded-2xl border border-ok/40 bg-ok/10 p-4 text-ok"
        >
          Merci, votre paiement est confirmé. Si la formule n&apos;apparaît pas
          encore,{" "}
          <Link href="/app/compte" className="underline underline-offset-4">
            actualisez la page
          </Link>{" "}
          dans quelques secondes.
        </p>
      )}
      {email === "ok" && (
        <p role="status" className="rounded-2xl border border-ok/40 bg-ok/10 p-4 text-ok">
          Votre nouvelle adresse e-mail est confirmée : utilisez-la pour vous connecter.
        </p>
      )}
      {(email === "expire" || email === "pris") && (
        <p role="status" className="rounded-2xl border border-warn/40 bg-warn/10 p-4 text-warn">
          {email === "pris" ? "Cette adresse est déjà utilisée par un autre compte." : "Ce lien a expiré ou n'est pas valable : redemandez le changement d'adresse ci-dessous."}
        </p>
      )}
      {motdepasse && (
        <p
          role="status"
          className="rounded-2xl border border-o/40 bg-o/10 p-4 text-o2"
        >
          Vous êtes connecté. Choisissez votre nouveau mot de passe dans la
          section Sécurité, plus bas.
        </p>
      )}

      <section
        id="formule"
        className="carte scroll-mt-24 p-6 sm:p-7"
        aria-labelledby="c-formule"
      >
        <h2 id="c-formule" className="font-display text-xl font-semibold">
          Votre formule
        </h2>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <b className="font-display text-3xl font-semibold">
            {nomFormule(compte)}
          </b>
          <span className="text-ink-3">
            {compte.illimite
              ? "tout est ouvert, sans limite"
              : compte.offerte
                ? "offerte par Utopicar"
                : o.prix
                  ? `${prixTxt(o.prix)} par mois`
                  : "gratuite"}
          </span>
        </div>
        {compte.offerte ? (
          <p className="mt-2 text-sm text-ink-2">
            {compte.offerte.jusquAu
              ? `Jusqu'au ${dateFr(compte.offerte.jusquAu)} inclus.`
              : "Sans date de fin."}
          </p>
        ) : (
          abo && (
            <p className="mt-2 text-sm text-ink-2">
              {STATUTS[abo.statut] ?? abo.statut}
              {abo.periode_fin &&
                (abo.annule_fin_periode
                  ? ` · se termine le ${dateFr(abo.periode_fin)}`
                  : ` · renouvellement le ${dateFr(abo.periode_fin)}`)}
            </p>
          )
        )}
        {compte.illimite ? (
          <p className="mt-6 text-sm text-ink-3">
            {compte.utilisees} analyse{compte.utilisees > 1 ? "s" : ""} ce
            mois-ci. Changez d&apos;espace (particulier ou Benef) ci-dessous.
          </p>
        ) : (
          <div className="mt-6 max-w-xl">
            <div className="flex justify-between text-sm">
              <span>Analyses {o.parMois ? "ce mois-ci" : "offertes"}</span>
              <span className="num">
                {compte.utilisees} / {o.analyses}
              </span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-label="Analyses utilisées"
              aria-valuemin={0}
              aria-valuemax={o.analyses}
              aria-valuenow={compte.utilisees}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-o to-o2"
                style={{
                  width: `${Math.min(100, (compte.utilisees / o.analyses) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-2 text-sm text-ink-3">
              {compte.restantesFormule
                ? `Il vous reste ${compte.restantesFormule} analyse${compte.restantesFormule > 1 ? "s" : ""} dans votre formule.`
                : o.parMois
                  ? "Vos analyses reviennent le 1er du mois."
                  : "Votre analyse offerte a servi."}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <span>
                Crédits à l&apos;unité : <b className="num">{compte.credits}</b>
              </span>
              <Link href="/app/credits" className="text-o2 underline underline-offset-4">
                {compte.credits ? "Voir mes crédits" : "Acheter des crédits"}
              </Link>
            </p>
          </div>
        )}
        {aboActif && (
          <div className="mt-6 flex flex-wrap gap-3">
            <BoutonPortail>Factures, carte et résiliation</BoutonPortail>
          </div>
        )}
      </section>

      {!aboActif && !compte.offerte && (
        <section
          id="usage"
          className="carte scroll-mt-24 p-6 sm:p-7"
          aria-labelledby="c-usage"
        >
          <h2 id="c-usage" className="font-display text-xl font-semibold">
            Utilisation d&apos;Utopicar
          </h2>
          <p className="mb-4 mt-1 text-sm text-ink-3">
            Votre espace, vos outils et vos guides s&apos;adaptent à ce choix.
            Vous pouvez en changer à tout moment.
          </p>
          <ChoixUsage id={compte.id} famille={famille} />
        </section>
      )}

      {!compte.offerte && !compte.illimite && (
        <section aria-labelledby="c-offres" className="grid gap-4">
          <div>
            <h2 id="c-offres" className="font-display text-xl font-semibold">
              {aboActif
                ? "Changer de formule"
                : famille === "benef"
                  ? "Les formules Benef"
                  : "Les formules"}
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              Sans engagement, résiliable à tout moment. Paiement sécurisé par
              Stripe.
              {aboActif
                ? " Le changement passe par votre espace de paiement : vous ne payez jamais deux abonnements."
                : ""}
            </p>
          </div>
          <CartesOffres
            ids={famille === "benef" ? BENEF : PARTICULIERS}
            actuelle={o.id}
            credits={famille !== "benef"}
          />
          <p className="text-sm text-ink-3">
            {famille === "benef"
              ? "Vous cherchez une voiture pour vous ? "
              : "Vous achetez pour revendre ? "}
            <Link
              href={`/tarifs#${famille === "benef" ? "particuliers" : "benef"}`}
              className="text-o2 underline underline-offset-4"
            >
              {famille === "benef"
                ? "Voir les formules particulier"
                : "Voir les formules Benef"}
            </Link>
          </p>
        </section>
      )}

      {famille === "benef" && o.id === "pro" && <OptionMessages actif={compte.messages} illimite={compte.illimite} />}

      <section id="guides" className="carte scroll-mt-24 p-6 sm:p-7" aria-labelledby="c-guides">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="c-guides" className="font-display text-xl font-semibold">Mes guides</h2>
          <Link href="/app/guides" className="btn btn-sm">Voir mes guides</Link>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {mesGuides.map((g) => (
            <li key={g.id}>
              <Link href={`/app/guides?guide=${g.id}`} className="block rounded-2xl border border-line p-4 transition hover:border-o/40">
                <span className="text-xs text-o2">{g.pour}</span>
                <span className="mt-1 block font-medium">{g.titre}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-3">{compte.guide ? "Accès complet aux quatre guides, imprimables en PDF." : compte.guides.length ? `${compte.guides.length} guide${compte.guides.length > 1 ? "s" : ""} ouvert${compte.guides.length > 1 ? "s" : ""} en entier, imprimable${compte.guides.length > 1 ? "s" : ""} en PDF. Les autres : deux chapitres offerts.` : "Les deux premiers chapitres sont offerts."} Les autres guides sont dans la même page.</p>
      </section>

      <section id="analyse" className="carte scroll-mt-24 p-6 sm:p-7" aria-labelledby="c-analyse">
        <h2 id="c-analyse" className="font-display text-xl font-semibold">Mon profil d&apos;analyse</h2>
        <p className="mb-5 mt-1 text-ink-2">Ce que vous voulez faire de la voiture et ce que vous acceptez. La note, les frais et les conseils de chaque rapport en dépendent ; vos rapports déjà enregistrés sont recalculés.</p>
        <FormulaireProfilAnalyse />
        <p className="mt-5 text-sm text-ink-3">
          Besoin d&apos;un rappel ? <Link href="/app?bienvenue=1" className="text-o2 underline underline-offset-4">Revoir la visite de bienvenue</Link>
        </p>
      </section>

      <section id="accessibilite" className="carte scroll-mt-24 p-6 sm:p-7" aria-labelledby="c-acces">
        <h2 id="c-acces" className="mb-4 font-display text-xl font-semibold">Accessibilité</h2>
        <ChoixAccessibilite id={compte.id} reglages={(profil?.reglages as Record<string, unknown> | null) ?? {}} />
      </section>

      <section id="profil" className="carte scroll-mt-24 p-6 sm:p-7" aria-labelledby="c-profil">
        <h2 id="c-profil" className="mb-4 font-display text-xl font-semibold">
          Profil
        </h2>
        <FormProfil prenom={compte.prenom} nom={compte.nom} ville={compte.ville} />
      </section>

      <section
        id="securite"
        className="carte scroll-mt-24 p-6 sm:p-7"
        aria-labelledby="c-secu"
      >
        <h2 id="c-secu" className="mb-4 font-display text-xl font-semibold">
          Sécurité
        </h2>
        <div className="grid gap-8">
          <FormEmail email={compte.email} />
          <FormMotDePasse />
        </div>
        <div className="mt-8 border-t border-line pt-5">
          <BoutonSupprimer />
        </div>
      </section>
    </div>
  );
}
