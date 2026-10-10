import Link from "next/link";

/** Les cotes détaillées sont une création d'Utopicar : réservées aux abonnés (formule payante ou accès illimité).
    Ce que voit un visiteur ou un compte gratuit à la place. */
export function CotesReservees({ connecte, suite }: { connecte: boolean; suite: string }) {
  return (
    <div className="wrap grid min-h-[60vh] place-items-center py-16 text-center">
      <div className="carte max-w-xl px-6 py-12 sm:px-10">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-o/12 text-o2" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <h1 className="h-sec mt-6">
          La cote détaillée, <span className="it">réservée aux abonnés</span>
        </h1>
        <p className="mt-4 text-ink-2">Prix par année, par kilométrage, par boîte et par puissance, génération par génération : inclus dans toutes les formules payantes.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/tarifs" className="btn btn-o">
            Voir les formules
          </Link>
          {!connecte && (
            <Link href={`/connexion?next=${encodeURIComponent(suite)}`} className="btn">
              Se connecter
            </Link>
          )}
        </div>
        <p className="mt-6 text-sm text-ink-3">
          Une annonce en vue ?{" "}
          <Link href="/#essai" className="font-medium text-o2 underline underline-offset-4">
            L&apos;aperçu reste gratuit
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
