import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { compteBenef } from "@/lib/benef";
import { OFFRES, prixTxt } from "@/lib/offres";
import { confirmerRetour } from "@/lib/stripe-synchro";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { ListePacks } from "@/components/site/CarteCredits";

export const metadata: Metadata = { title: "Crédits" };

const MOTIFS: Record<string, string> = { achat: "Achat", offert: "Offerts par Utopicar", analyse: "Analyse", expiration: "Crédits expirés" };
const dateFr = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/** Crédits à l'unité : solde, packs, historique. */
export default async function Page({ searchParams }: { searchParams: Promise<{ paiement?: string; session_id?: string }> }) {
  const c = await compteBenef("/app/credits");
  const p = await searchParams;
  // Retour de Stripe : crédits ajoutés tout de suite (sans attendre le webhook), puis rechargement.
  if (p.paiement === "ok" && p.session_id) {
    await confirmerRetour(p.session_id, c.id);
    redirect("/app/credits?paiement=ok");
  }
  const { data: mouvements } = await (await supabaseServeur())
    .from("credits")
    .select("id, delta, motif, pack, created_at")
    .eq("user_id", c.id)
    .order("created_at", { ascending: false })
    .limit(30);
  const dernierAchat = (mouvements ?? []).find((m) => m.delta > 0);
  const expire = dernierAchat && c.credits > 0 ? new Date(new Date(dernierAchat.created_at).setFullYear(new Date(dernierAchat.created_at).getFullYear() + 1)).toISOString() : null;
  const e = OFFRES.essentiel;

  return (
    <div className="grid gap-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold">Crédits</h1>
        <p className="mt-2 text-ink-2">
          Analysez sans abonnement : un crédit vaut une analyse détaillée avec 3 photos. Vos crédits servent seulement quand les analyses de votre formule sont épuisées.
        </p>
      </div>

      {p.paiement === "ok" && (
        <p role="status" className="rounded-2xl border border-ok/40 bg-ok/10 p-4 text-ok">
          Merci, vos crédits sont ajoutés. <Link href="/app/analyser" className="underline underline-offset-4">Analyser une annonce</Link>
        </p>
      )}
      {p.paiement === "annule" && (
        <p role="status" className="rounded-2xl border border-warn/40 bg-warn/10 p-4 text-warn">
          Paiement annulé : rien n&apos;a été débité.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <section className="carte grid gap-4 p-6 sm:p-7" aria-labelledby="cr-solde">
          <h2 id="cr-solde" className="text-xs font-medium uppercase tracking-[0.12em] text-ink-3">Votre solde</h2>
          <p className="flex items-baseline gap-2">
            <b className="num font-display text-5xl font-semibold">{c.illimite ? "∞" : c.credits}</b>
            <span className="text-ink-2">crédit{c.credits > 1 ? "s" : ""}</span>
          </p>
          <p className="text-sm text-ink-3">
            {c.illimite
              ? "Votre accès est illimité : vous n'avez pas besoin de crédits."
              : `${c.restantesFormule} analyse${c.restantesFormule > 1 ? "s" : ""} encore comprise${c.restantesFormule > 1 ? "s" : ""} dans votre formule ${c.offre.nom}${c.offre.parMois ? " ce mois-ci" : ""}.`}
            {expire ? ` Crédits valables jusqu'au ${dateFr(expire)}.` : ""}
          </p>
          {c.credits > 0 && (
            <Link href="/app/analyser" className="btn btn-o justify-self-start">
              Analyser une annonce
            </Link>
          )}
        </section>

        <section className="carte grid gap-4 p-6 sm:p-7" aria-labelledby="cr-packs">
          <div>
            <h2 id="cr-packs" className="font-display text-xl font-semibold">Acheter des crédits</h2>
            <p className="mt-1 text-sm text-ink-3">Paiement unique et sécurisé par Stripe. Valables 12 mois après votre dernier achat.</p>
          </div>
          <ListePacks />
          {c.offre.prix === 0 && !c.illimite && (
            <p className="rounded-2xl border border-line p-4 text-sm text-ink-2">
              Vous analysez plus de 3 voitures par mois ? Avec <b>{e.nom}</b>, {e.analyses} analyses par mois pour {prixTxt(e.prix)}, sans engagement.{" "}
              <Link href="/app/compte#formule" className="text-o2 underline underline-offset-4">Voir la formule</Link>
            </p>
          )}
        </section>
      </div>

      {(mouvements ?? []).length > 0 && (
        <section className="carte p-6 sm:p-7" aria-labelledby="cr-histo">
          <h2 id="cr-histo" className="mb-3 font-display text-xl font-semibold">Historique</h2>
          <ul className="grid divide-y divide-line text-sm">
            {(mouvements ?? []).map((m) => (
              <li key={m.id} className="flex items-baseline justify-between gap-3 py-2.5">
                <span className="text-ink-2">
                  {MOTIFS[m.motif] ?? m.motif}
                  <span className="text-ink-3"> · {dateFr(m.created_at)}</span>
                </span>
                <b className={`num ${m.delta > 0 ? "text-ok" : "text-ink-3"}`}>
                  {m.delta > 0 ? "+" : "−"}
                  {Math.abs(m.delta)}
                </b>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
