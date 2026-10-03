import Link from "next/link";

export default function Introuvable() {
  return (
    <div className="wrap py-24 text-center">
      <p className="font-display text-7xl font-semibold text-o2">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">Cette page n&apos;existe pas</h1>
      <p className="mt-3 text-ink-2">Le lien est peut-être ancien ou mal copié.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-o">
          Retour à l&apos;accueil
        </Link>
        <Link href="/analyse" className="btn">
          Estimer une affaire
        </Link>
      </div>
    </div>
  );
}
