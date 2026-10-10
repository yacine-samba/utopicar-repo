import type { Metadata } from "next";
import Link from "next/link";
import { MOTEURS } from "@/lib/moteurs";
import { JsonLdFil } from "@/components/site/JsonLd";

export const metadata: Metadata = {
  title: "Moteurs et boîtes à éviter en occasion",
  description: "PureTech, THP, EcoBoost, TCe 115, D-4D, boîtes EDC, DSG et Powershift : les moteurs et boîtes que l'outil signale sur chaque annonce, et ce qu'il faut vérifier avant d'acheter.",
  alternates: { canonical: "/moteur" },
};

/** Index des guides moteurs : ceux que l'outil signale automatiquement dans chaque annonce. */
export default function Moteurs() {
  return (
    <div className="wrap py-14">
      <JsonLdFil etapes={[{ nom: "Accueil", chemin: "/" }, { nom: "Moteurs à éviter", chemin: "/moteur" }]} />
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-ink-3">
        <Link href="/" className="inline-block py-1 hover:text-ink">
          Accueil
        </Link>{" "}
        › <span aria-current="page">Moteurs à éviter</span>
      </nav>
      <div className="max-w-3xl">
        <h1 className="h-sec">
          Les moteurs et boîtes <span className="it">à éviter en occasion</span>
        </h1>
        <p className="mt-4 text-lg text-ink-2">
          Ces moteurs et ces boîtes ne cassent pas tous, mais leurs défauts sont connus et coûtent cher. Utopicar les repère automatiquement dans chaque annonce analysée. Voici, pour chacun, le problème, les années concernées et ce qu&apos;il faut vérifier.
        </p>
      </div>
      <ul className="mt-10 grid gap-4 md:grid-cols-2">
        {MOTEURS.map((m) => (
          <li key={m.slug}>
            <Link href={`/moteur/${m.slug}`} className="carte flex h-full flex-col gap-2 p-6 transition hover:border-o/50">
              <span className="font-display text-xl font-semibold">{m.nom}</span>
              <span className="text-ink-2">{m.resume}</span>
              <span className="mt-auto pt-2 text-sm text-ink-3">{m.modeles.slice(0, 2).join(" · ")}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-ink-2">
        Et à l&apos;inverse, les modèles qui tiennent la route :{" "}
        <Link href="/fiabilite" className="font-medium text-o2 underline underline-offset-4">
          les occasions les plus fiables
        </Link>
        .
      </p>
      <div className="carte mt-12 flex flex-wrap items-center justify-between gap-4 p-6">
        <p className="max-w-xl text-ink-2">
          <b className="text-ink">Une annonce en vue ?</b> Collez-la : l&apos;outil reconnaît le moteur et la boîte, et vous dit s&apos;ils font partie de cette liste.
        </p>
        <Link href="/#essai" className="btn btn-o">
          Analyser une annonce
        </Link>
      </div>
    </div>
  );
}
