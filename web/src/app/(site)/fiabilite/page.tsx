import type { Metadata } from "next";
import Link from "next/link";
import { MODELES_FIABLES } from "@/lib/analyse/fiabilite";
import { JsonLdFil } from "@/components/site/JsonLd";

export const metadata: Metadata = {
  title: "Voitures d'occasion fiables : modèles et moteurs",
  description:
    "Clio, Yaris, Jazz, Swift, Polo, Fabia : les citadines d'occasion les plus fiables, les bons moteurs, ceux à éviter et quoi vérifier avant d'acheter.",
  alternates: { canonical: "/fiabilite" },
};

/** Les modèles fiables de la liste de l'outil : une page par modèle (fiabilité, moteurs, points à vérifier). Aucun prix. */
export default function Fiabilite() {
  return (
    <div className="wrap py-14">
      <JsonLdFil etapes={[{ nom: "Accueil", chemin: "/" }, { nom: "Fiabilité", chemin: "/fiabilite" }]} />
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-ink-3">
        <Link href="/" className="hover:text-ink">
          Accueil
        </Link>{" "}
        › <span aria-current="page">Fiabilité</span>
      </nav>
      <div className="max-w-3xl">
        <h1 className="h-sec">
          Les voitures d&apos;occasion <span className="it">les plus fiables</span>
        </h1>
        <p className="mt-4 text-lg text-ink-2">
          Les modèles que l&apos;outil recommande quand on veut une occasion sans mauvaise surprise : les années à viser, les moteurs à prendre, ceux à éviter et les points à
          contrôler avant d&apos;acheter.
        </p>
      </div>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODELES_FIABLES.map((m) => (
          <li key={m.slug}>
            <Link href={`/fiabilite/${m.slug}`} className="carte group flex h-full flex-col gap-2 p-5 transition hover:-translate-y-0.5 hover:border-o/40">
              <span className="flex items-start justify-between gap-2">
                <span className="font-display text-lg font-semibold leading-tight">{m.nom}</span>
                <span className="text-o2 transition group-hover:translate-x-0.5" aria-hidden="true">
                  →
                </span>
              </span>
              <span className="text-sm text-ink-3">
                {m.ans[0]} à {m.ans[1]} · jusqu&apos;à {m.km.toLocaleString("fr-FR")} km
              </span>
              <span className="text-sm text-ink-2">{m.pourquoi}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-ink-2">
        Les moteurs et boîtes à fuir, toutes marques confondues :{" "}
        <Link href="/moteur" className="font-medium text-o2 underline underline-offset-4">
          la liste des moteurs à éviter
        </Link>
        .
      </p>
    </div>
  );
}
