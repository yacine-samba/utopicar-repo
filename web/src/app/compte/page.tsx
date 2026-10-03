import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { compteCourant } from "@/lib/compte";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { prixTxt } from "@/lib/offres";
import { confirmerRetour } from "@/lib/stripe-synchro";
import { BoutonPortail, BoutonSupprimer, FormMotDePasse, FormProfil } from "@/components/compte/ActionsCompte";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false } };

const dateFr = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const STATUTS: Record<string, string> = { active: "Active", trialing: "Période d'essai", past_due: "Paiement en attente", canceled: "Résiliée", unpaid: "Impayée", incomplete: "Paiement incomplet" };
const NIVEAUX: Record<string, string> = { bon: "Bonne affaire", correct: "Prix correct", cher: "Trop cher", prudence: "Prudence", eviter: "À éviter", inconnu: "Prix non évalué" };

export default async function Compte({ searchParams }: { searchParams: Promise<{ paiement?: string; motdepasse?: string; session_id?: string }> }) {
  const compte = await compteCourant();
  if (!compte) redirect("/connexion?next=/compte");
  const { paiement, motdepasse, session_id } = await searchParams;
  // Retour de Stripe : l'abonnement est enregistré tout de suite, puis on recharge pour l'afficher.
  if (paiement === "ok" && session_id) {
    await confirmerRetour(session_id, compte.id);
    redirect("/compte?paiement=ok");
  }
  const o = compte.offre;
  const sb = await supabaseServeur();
  const { data: rapports } = await sb.from("rapports").select("id, titre, verdict, prix, created_at, mode").eq("user_id", compte.id).order("created_at", { ascending: false }).limit(5);
  const abo = compte.abonnement;

  return (
    <div className="wrap grid gap-6 py-12">
      <div>
        <span className="kicker">Mon compte</span>
        <h1 className="h-sec mt-5">Bonjour{compte.prenom ? ` ${compte.prenom}` : ""}</h1>
        <p className="mt-2 text-ink-3">{compte.email}</p>
      </div>

      {paiement === "ok" && (
        <p role="status" className="rounded-2xl border border-ok/40 bg-ok/10 p-4 text-ok">
          Merci, votre paiement est confirmé. Si la formule n&apos;apparaît pas encore, <Link href="/compte" className="underline underline-offset-4">actualisez la page</Link> dans quelques secondes.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="carte p-6 sm:p-7" aria-labelledby="c-formule">
          <h2 id="c-formule" className="font-display text-xl font-semibold">Votre formule</h2>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <b className="font-display text-3xl font-semibold">{o.famille === "benef" ? `Benef ${o.nom}` : o.nom}</b>
            <span className="text-ink-3">{o.prix ? `${prixTxt(o.prix)} par mois` : "gratuite"}</span>
          </div>
          {abo && (
            <p className="mt-2 text-sm text-ink-2">
              {STATUTS[abo.statut] ?? abo.statut}
              {abo.periode_fin && (abo.annule_fin_periode ? ` · se termine le ${dateFr(abo.periode_fin)}` : ` · renouvellement le ${dateFr(abo.periode_fin)}`)}
            </p>
          )}
          <div className="mt-6">
            <div className="flex justify-between text-sm">
              <span>Analyses {o.parMois ? "ce mois-ci" : "offertes"}</span>
              <span className="num">
                {compte.utilisees} / {o.analyses}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Analyses utilisées" aria-valuemin={0} aria-valuemax={o.analyses} aria-valuenow={compte.utilisees}>
              <div className="h-full rounded-full bg-gradient-to-r from-o to-o2" style={{ width: `${Math.min(100, (compte.utilisees / o.analyses) * 100)}%` }} />
            </div>
            <p className="mt-2 text-sm text-ink-3">{compte.restantes ? `Il vous reste ${compte.restantes} analyse${compte.restantes > 1 ? "s" : ""}.` : o.prix ? "Vos analyses reviennent le 1er du mois." : "Votre analyse offerte a servi."}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {abo ? <BoutonPortail /> : null}
            <Link href="/tarifs" className={abo ? "btn" : "btn btn-o"}>
              {abo ? "Comparer les formules" : "Choisir une formule"}
            </Link>
          </div>
        </section>

        <section className="carte grid content-start gap-3 p-6 sm:p-7" aria-labelledby="c-acces">
          <h2 id="c-acces" className="font-display text-xl font-semibold">Accès rapides</h2>
          <Link href="/analyse" className="btn justify-between">
            Analyser une annonce <span aria-hidden="true">→</span>
          </Link>
          {o.famille === "benef" && (
            <Link href="/app" className="btn justify-between">
              Espace Benef <span aria-hidden="true">→</span>
            </Link>
          )}
          <Link href="/guide" className="btn justify-between">
            {compte.guide ? "Lire les guides" : "Les guides"} <span aria-hidden="true">→</span>
          </Link>
          <form action="/auth/deconnexion" method="post">
            <button type="submit" className="mt-2 text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
              Se déconnecter
            </button>
          </form>
        </section>
      </div>

      <section className="carte p-6 sm:p-7" aria-labelledby="c-rapports">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="c-rapports" className="font-display text-xl font-semibold">Dernières analyses</h2>
          {o.famille === "benef" && (
            <Link href="/app/rapports" className="text-sm text-o2 underline underline-offset-4">
              Tous les rapports
            </Link>
          )}
        </div>
        {rapports?.length ? (
          <ul className="mt-4 divide-y divide-line">
            {rapports.map((r) => (
              <li key={r.id}>
                <Link href={r.mode === "benef" ? `/app/rapports/${r.id}` : `/analyse/${r.id}`} className="flex flex-wrap items-baseline justify-between gap-2 py-3 hover:text-o2">
                  <span>{r.titre}</span>
                  <span className="text-sm text-ink-3">
                    {r.mode === "benef" ? r.verdict : NIVEAUX[r.verdict ?? ""] ?? r.verdict} · {dateFr(r.created_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-ink-3">
            Aucune analyse pour le moment. <Link href="/analyse" className="text-o2 underline underline-offset-4">Analyser une annonce</Link>
          </p>
        )}
      </section>

      <section className="carte p-6 sm:p-7" aria-labelledby="c-profil">
        <h2 id="c-profil" className="mb-4 font-display text-xl font-semibold">Profil</h2>
        <FormProfil id={compte.id} prenom={compte.prenom} ville={compte.ville} />
      </section>

      <section id="securite" className="carte p-6 sm:p-7" aria-labelledby="c-secu">
        <h2 id="c-secu" className="mb-4 font-display text-xl font-semibold">Sécurité</h2>
        {motdepasse && <p className="mb-3 text-sm text-o2">Choisissez votre nouveau mot de passe.</p>}
        <FormMotDePasse />
        <div className="mt-8 border-t border-line pt-5">
          <BoutonSupprimer />
        </div>
      </section>
    </div>
  );
}
