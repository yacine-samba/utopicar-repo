import type { Metadata } from "next";
import Link from "next/link";
import { dateTxt, eur, libelle, nb, listeCotes, slugCote } from "@/lib/cotes-publiques";
import { JsonLdFil } from "@/components/site/JsonLd";
import { CotesReservees } from "@/components/site/CotesReservees";
import { accesCotes, compteCourant } from "@/lib/compte";

export const metadata: Metadata = {
  title: "Cote des voitures d'occasion, modèle par modèle",
  description: "La cote des voitures d'occasion, modèle par modèle : réservée aux abonnés Utopicar.",
  // réservée aux abonnés : jamais indexée
  robots: { index: false, follow: false },
};

/** Toutes les cotes publiées : une carte par modèle (génération et énergie). */
export default async function Cotes() {
  const compte = await compteCourant();
  if (!accesCotes(compte)) return <CotesReservees connecte={!!compte} suite="/cote" />;
  const liste = await listeCotes();
  const maj = liste.map((c) => c.maj).filter((d): d is string => !!d).sort().pop() ?? null;
  return (
    <div className="wrap py-14">
      <JsonLdFil etapes={[{ nom: "Accueil", chemin: "/" }, { nom: "Cotes", chemin: "/cote" }]} />
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-ink-3">
        <Link href="/" className="hover:text-ink">
          Accueil
        </Link>{" "}
        › <span aria-current="page">Cotes</span>
      </nav>
      <div className="max-w-3xl">
        <h1 className="h-sec">
          La cote des voitures d&apos;occasion, <span className="it">modèle par modèle</span>
        </h1>
        <p className="mt-4 text-lg text-ink-2">
          Prix demandés sur les annonces Leboncoin en ligne, génération par génération : le prix médian, la fourchette où se situe la moitié des voitures, le prix selon l&apos;année et le kilométrage.
          {maj ? ` Dernier relevé le ${dateTxt(maj)}.` : ""}
        </p>
      </div>
      {liste.length ? (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {liste.map((c) => (
            <li key={c.cle}>
              <Link href={`/cote/${slugCote(c.nom)}`} className="carte flex h-full flex-col gap-1 p-5 transition hover:border-o/50">
                <span className="font-display text-lg font-semibold">{libelle(c.nom)}</span>
                <span className="text-sm text-ink-3">
                  {c.y0} – {c.y1} · {nb(c.n)} annonces
                </span>
                <span className="mt-3 text-sm text-ink-2">
                  Prix médian <b className="num font-display text-xl text-ink">{eur(c.mediane)}</b>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="carte mt-10 p-6 text-ink-2">Les cotes se mettent à jour : revenez dans quelques minutes.</p>
      )}
      <div className="carte mt-12 flex flex-wrap items-center justify-between gap-4 p-6">
        <p className="max-w-xl text-ink-2">
          <b className="text-ink">Une annonce précise en vue ?</b> Collez-la : Utopicar la place sur la cote de sa génération, repère les défauts qui coûtent cher et vous donne le prix à proposer.
        </p>
        <Link href="/#essai" className="btn btn-o">
          Analyser une annonce
        </Link>
      </div>
    </div>
  );
}
