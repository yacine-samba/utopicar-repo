import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MOTEURS, moteurParSlug } from "@/lib/moteurs";
import { fournisseursActifs } from "@/lib/fournisseurs";
import { Essai } from "@/components/accueil/Essai";
import { Faq } from "@/components/site/Faq";
import { JsonLdFaq, JsonLdFil } from "@/components/site/JsonLd";

/* Guide d'un moteur ou d'une boîte à éviter : le problème, les années, les modèles, quoi vérifier, ce que ça coûte,
   les cotes des modèles concernés et le champ d'analyse. */

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return MOTEURS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const m = moteurParSlug((await params).slug);
  if (!m) return { title: "Guide introuvable", robots: { index: false } };
  return { title: m.titre, description: m.description, alternates: { canonical: `/moteur/${m.slug}` } };
}

export default async function PageMoteur({ params }: Params) {
  const { slug } = await params;
  const m = moteurParSlug(slug);
  if (!m) notFound();
  const fournisseurs = await fournisseursActifs();
  // cotes des marques concernées (toutes pour les boîtes, qui existent partout)
  const faq = [
    { q: `Quel est le problème du ${m.nom} ?`, r: m.probleme.join(" ") },
    { q: `Quelles années du ${m.nom} sont concernées ?`, r: m.annees },
    { q: `Que vérifier avant d'acheter une voiture avec un ${m.nom} ?`, r: m.verifier.join(" ") },
    { q: `Combien coûtent les réparations ?`, r: m.couts.map(([l, v]) => `${l} : ${v}`).join(" ; ") + ". Ordres de grandeur en garage indépendant." },
  ];
  const autres = MOTEURS.filter((x) => x.slug !== m.slug);

  return (
    <div className="wrap py-12">
      <JsonLdFil etapes={[{ nom: "Accueil", chemin: "/" }, { nom: "Moteurs à éviter", chemin: "/moteur" }, { nom: m.nom, chemin: `/moteur/${m.slug}` }]} />
      <JsonLdFaq questions={faq} />
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-ink-3">
        <Link href="/" className="hover:text-ink">
          Accueil
        </Link>{" "}
        ›{" "}
        <Link href="/moteur" className="hover:text-ink">
          Moteurs à éviter
        </Link>{" "}
        › <span aria-current="page">{m.nom}</span>
      </nav>

      <header className="max-w-3xl">
        <h1 className="font-display text-[clamp(30px,5vw,52px)] font-semibold leading-[1.06] tracking-[-0.02em]">{m.titre}</h1>
        <p className="mt-4 text-lg text-ink-2">{m.resume}</p>
      </header>

      <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-labelledby="m-pb" className="carte p-6">
          <h2 id="m-pb" className="font-display text-xl font-semibold">
            Le problème
          </h2>
          <div className="mt-3 grid gap-3 text-ink-2">
            {m.probleme.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <h3 className="mt-6 font-display text-lg font-semibold">Années concernées</h3>
          <p className="mt-1 text-ink-2">{m.annees}</p>
          <h3 className="mt-6 font-display text-lg font-semibold">Modèles équipés</h3>
          <ul className="mt-2 grid gap-1.5 text-ink-2">
            {m.modeles.map((x) => (
              <li key={x} className="flex gap-2.5">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-o" aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
        </section>
        <div className="grid content-start gap-5">
          <section aria-labelledby="m-verif" className="carte border-o/30 p-6">
            <h2 id="m-verif" className="font-display text-xl font-semibold">
              À vérifier avant d&apos;acheter
            </h2>
            <ol className="mt-3 grid gap-2.5 text-ink-2">
              {m.verifier.map((v, i) => (
                <li key={v} className="flex gap-3">
                  <span className="num grid size-6 shrink-0 place-items-center rounded-full border border-o/50 text-xs text-o2" aria-hidden="true">
                    {i + 1}
                  </span>
                  {v}
                </li>
              ))}
            </ol>
          </section>
          <section aria-labelledby="m-couts" className="carte p-6">
            <h2 id="m-couts" className="font-display text-xl font-semibold">
              Ce que ça coûte
            </h2>
            <dl className="mt-3 divide-y divide-line">
              {m.couts.map(([l, v]) => (
                <div key={l} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-ink-2">{l}</dt>
                  <dd className="num shrink-0 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-ink-3">Ordres de grandeur en garage indépendant, pièces et main-d&apos;œuvre.</p>
          </section>
        </div>
      </div>
      <p className="mt-6 max-w-3xl rounded-2xl border border-ok/30 bg-ok/5 px-5 py-4 text-ink">
        <b>Notre conseil :</b> {m.conseil}
      </p>

      <section aria-labelledby="m-essai" className="mt-16 text-center">
        <h2 id="m-essai" className="h-sec">
          Une annonce en vue ? <span className="it">L&apos;outil le repère pour vous</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-ink-2">Collez l&apos;annonce : Utopicar reconnaît le moteur et la boîte, signale ce défaut s&apos;il la concerne et vous donne le prix à proposer.</p>
        <div className="mt-8">
          <Essai fournisseurs={fournisseurs} depuis="cote" retour={`/moteur/${m.slug}`} />
        </div>
      </section>


      <section aria-labelledby="m-faq" className="mt-16">
        <h2 id="m-faq" className="mb-6 text-center font-display text-2xl font-semibold">
          Questions sur le {m.nom}
        </h2>
        <Faq questions={faq.map((x) => ({ q: x.q, r: <p>{x.r}</p> }))} />
      </section>

      <nav aria-labelledby="m-autres" className="mt-16">
        <h2 id="m-autres" className="font-display text-xl font-semibold">
          Les autres moteurs et boîtes à surveiller
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {autres.map((x) => (
            <li key={x.slug}>
              <Link href={`/moteur/${x.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-line-2 px-4 text-sm text-ink-2 transition hover:border-o/50 hover:text-ink">
                {x.nom}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
