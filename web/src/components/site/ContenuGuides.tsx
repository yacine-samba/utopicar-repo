import Link from "next/link";
import type { Compte } from "@/lib/compte";
import { contenuGuide, GUIDES, guidesPour, type GuideId } from "@/lib/guides";
import { familleEspace } from "@/lib/espace";
import { GUIDE } from "@/lib/offres";
import { BoutonAbonner } from "./BoutonAbonner";
import { BoutonImprimer } from "./BoutonImprimer";
import "@/app/(site)/guide/guide.css";

/** Les quatre guides : sommaire, guide choisi, et accès complet (payant ou inclus). Sur le site public et dans l'espace. */
export function ContenuGuides({ compte, choix, paiement, base }: { compte: Compte | null; choix?: string; paiement?: string; base: "/guide" | "/app/guides" }) {
  const espace = base === "/app/guides";
  // dans l'espace : d'abord les guides de la formule, les autres plus bas, repliés
  const miens = compte ? (compte.guides.length ? compte.guides : guidesPour(compte.offre.id, familleEspace(compte))) : GUIDES.map((g) => g.id);
  const defaut: GuideId = miens[0];
  const id = (GUIDES.find((g) => g.id === choix)?.id ?? defaut) as GuideId;
  const autres = espace ? GUIDES.filter((g) => !miens.includes(g.id)) : [];
  const complet = !!compte?.guides.includes(id);
  const g = contenuGuide(id, compte?.prenom ?? "", complet);

  return (
    <div className={espace ? "" : "wrap py-12"}>
      <div className={espace ? "sans-impression mb-8 max-w-3xl" : "sans-impression mx-auto mb-10 max-w-3xl text-center"}>
        {!espace && <span className="kicker">Les guides Utopicar</span>}
        {espace && (
          <Link href="/app/compte" className="text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">
            ← Profil et paramètres
          </Link>
        )}
        <h1 className={espace ? "mt-2 font-display text-3xl font-semibold" : "h-sec mt-5"}>
          {espace ? "Mes guides" : <>La méthode complète, <span className="it">chiffres réels</span></>}
        </h1>
        <p className="mt-4 text-lg text-ink-2">
          {compte?.guide
            ? "Vous avez accès à tous les guides. Bonne lecture."
            : compte?.guides.length
              ? `Vos guides s'ouvrent en entier. Pour les autres, les deux premiers chapitres sont offerts, et les quatre guides sont à ${GUIDE.prix}\u00a0€, accès à vie.`
              : `Les deux premiers chapitres sont offerts. Accès à vie aux quatre guides pour ${GUIDE.prix}\u00a0€, ou à ceux de votre formule.`}
        </p>
        {paiement === "ok" && !complet && (
          <p role="status" className="mx-auto mt-5 w-fit rounded-2xl border border-ok/40 bg-ok/10 px-4 py-2 text-ok">
            Paiement confirmé. L&apos;accès s&apos;ouvre dans quelques secondes : <Link href={`${base}?guide=${id}`} className="underline underline-offset-4">actualisez</Link>.
          </p>
        )}
      </div>

      <nav aria-label="Choisir un guide" className="sans-impression mx-auto mb-8 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {GUIDES.filter((x) => !espace || miens.includes(x.id)).map((x) => (
          <Link key={x.id} href={`${base}?guide=${x.id}`} aria-current={x.id === id ? "page" : undefined} className="carte block p-4 transition hover:border-o/40 aria-[current=page]:border-o/60 aria-[current=page]:bg-o/10">
            <span className="text-xs text-o2">{x.pour}</span>
            <span className="mt-1 block font-display font-semibold leading-snug">{x.titre}</span>
            <span className="mt-1 block text-sm text-ink-3">{x.resume}</span>
          </Link>
        ))}
      </nav>
      {autres.length > 0 && (
        <details className="sans-impression mx-auto -mt-4 mb-8 max-w-5xl text-sm text-ink-3" open={autres.some((x) => x.id === id)}>
          <summary className="cursor-pointer hover:text-ink">Les autres guides ({autres.length})</summary>
          <ul className="mt-2 flex flex-wrap gap-2">
            {autres.map((x) => (
              <li key={x.id}>
                <Link href={`${base}?guide=${x.id}`} aria-current={x.id === id ? "page" : undefined} className="block rounded-full border border-line-2 px-3 py-1.5 hover:border-o/40 hover:text-ink aria-[current=page]:border-o/60 aria-[current=page]:text-ink">
                  {x.titre}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}

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
              <BoutonAbonner produit="guide">Débloquer pour {GUIDE.prix}&nbsp;€</BoutonAbonner>
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
