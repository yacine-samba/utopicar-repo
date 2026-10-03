import type { Metadata } from "next";
import Link from "next/link";
import { compteCourant } from "@/lib/compte";
import { contenuGuide, GUIDES, type GuideId } from "@/lib/guides";
import { GUIDE } from "@/lib/offres";
import { BoutonAbonner } from "@/components/site/BoutonAbonner";
import { BoutonImprimer } from "@/components/site/BoutonImprimer";
import "./guide.css";

export const metadata: Metadata = {
  title: "Les guides",
  description: "Quatre guides complets : première revente, tri des annonces, estimation d'une reprise, achat d'une occasion sans se faire avoir.",
};

// Ancienne fonction d'envoi des guides : les liens déjà reçus par email (lecture et désinscription) restent valables.
const FN = "https://rvdfifhgosovdapdltps.supabase.co/functions/v1/inscription";
async function ancienLien(corps: Record<string, string>) {
  try {
    const r = await fetch(FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps), cache: "no-store" });
    const d = await r.json().catch(() => ({}));
    return r.ok && d.ok ? d : null;
  } catch {
    return null;
  }
}

type Params = { guide?: string; t?: string; stop?: string; paiement?: string };

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;

  if (p.stop && /^[\w.-]{10,200}$/.test(p.stop)) {
    const ok = await ancienLien({ action: "stop", s: p.stop });
    return (
      <div className="wrap py-20 text-center">
        <h1 className="h-sec">{ok ? "C'est fait" : "Lien non valable"}</h1>
        <p className="mt-4 text-ink-2">{ok ? "Vous ne recevrez plus de messages de notre part." : "Ce lien de désinscription n'est pas valide. Écrivez-nous depuis la page Contact."}</p>
      </div>
    );
  }

  if (p.t && /^[A-Za-z0-9_-]{40,}$/.test(p.t)) {
    const d = await ancienLien({ action: "lire", t: p.t });
    if (d)
      return (
        <div className="wrap py-12">
          <p className="sans-impression mb-6 text-center text-sm text-ink-3">Guide personnel de {d.prenom}, envoyé lors de votre inscription.</p>
          <article className="feuille">
            <div dangerouslySetInnerHTML={{ __html: d.contenu }} />
          </article>
        </div>
      );
  }

  const compte = await compteCourant();
  const defaut: GuideId = compte?.famille === "particulier" ? "acheter-occasion" : "premiere-revente";
  const id = (GUIDES.find((g) => g.id === p.guide)?.id ?? defaut) as GuideId;
  const complet = !!compte?.guide;
  const g = contenuGuide(id, compte?.prenom ?? "", complet);

  return (
    <div className="wrap py-12">
      <div className="sans-impression mx-auto mb-10 max-w-3xl text-center">
        <span className="kicker">Les guides Utopicar</span>
        <h1 className="h-sec mt-5">
          La méthode complète, <span className="it">chiffres réels</span>
        </h1>
        <p className="mt-4 text-lg text-ink-2">
          {complet ? "Vous avez accès à tous les guides. Bonne lecture." : `Les deux premiers chapitres sont offerts. Accès à vie aux quatre guides pour ${GUIDE.prix} €, ou inclus dans Sérénité et toutes les formules Benef.`}
        </p>
        {p.paiement === "ok" && !complet && (
          <p role="status" className="mx-auto mt-5 w-fit rounded-2xl border border-ok/40 bg-ok/10 px-4 py-2 text-ok">
            Paiement confirmé. L&apos;accès s&apos;ouvre dans quelques secondes : <Link href={`/guide?guide=${id}`} className="underline underline-offset-4">actualisez</Link>.
          </p>
        )}
      </div>

      <nav aria-label="Choisir un guide" className="sans-impression mx-auto mb-8 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {GUIDES.map((x) => (
          <Link key={x.id} href={`/guide?guide=${x.id}`} aria-current={x.id === id ? "page" : undefined} className="carte block p-4 transition hover:border-o/40 aria-[current=page]:border-o/60 aria-[current=page]:bg-o/10">
            <span className="text-xs text-o2">{x.pour}</span>
            <span className="mt-1 block font-display font-semibold leading-snug">{x.titre}</span>
            <span className="mt-1 block text-sm text-ink-3">{x.resume}</span>
          </Link>
        ))}
      </nav>

      <div className="sans-impression mx-auto mb-4 flex max-w-4xl justify-end">{complet && <BoutonImprimer />}</div>
      <article className="feuille mx-auto max-w-4xl" aria-label={g.titre}>
        <div dangerouslySetInnerHTML={{ __html: g.html }} />
      </article>

      {!complet && (
        <section className="sans-impression carte mx-auto mt-8 max-w-4xl p-7 text-center" aria-labelledby="paywall">
          <h2 id="paywall" className="font-display text-2xl font-semibold">
            La suite du guide
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-ink-2">Débloquez tous les chapitres des quatre guides, à vie, imprimables en PDF.</p>
          <div className="mx-auto mt-6 grid max-w-sm gap-3">
            {compte ? (
              <BoutonAbonner produit="guide">Débloquer pour {GUIDE.prix} €</BoutonAbonner>
            ) : (
              <Link href={`/inscription?next=${encodeURIComponent(`/guide?guide=${id}`)}`} className="btn btn-o">
                Créer mon compte pour acheter
              </Link>
            )}
            <Link href="/tarifs" className="text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
              Ou choisir une formule qui l&apos;inclut
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
