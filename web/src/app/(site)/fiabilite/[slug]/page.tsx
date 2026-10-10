import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { aEviterPour, MODELES_FIABLES, modeleFiable, type ModeleFiable } from "@/lib/analyse/fiabilite";
import { MOTEURS } from "@/lib/moteurs";
import { fournisseursActifs } from "@/lib/fournisseurs";
import { Essai } from "@/components/accueil/Essai";
import { Faq } from "@/components/site/Faq";
import { JsonLdFaq, JsonLdFil } from "@/components/site/JsonLd";

/* Page « Fiabilité d'un modèle » : les années à viser, les bons moteurs, ceux à éviter, les points à vérifier.
   Tout vient de la liste fixe de l'outil (lib/analyse/fiabilite.ts). Aucun prix : la cote est réservée aux abonnés.
   Pages statiques, une par modèle. */

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return MODELES_FIABLES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const m = modeleFiable((await params).slug);
  if (!m) return { title: "Modèle introuvable", robots: { index: false } };
  return {
    // titre et description courts : Google coupe vers 60 et 155 caractères
    title: `${m.nom} d'occasion : fiabilité et moteurs`,
    description: coupe(`${m.nom} fiable ? Les années à viser (${m.ans[0]}-${m.ans[1]}), les bons moteurs, ceux à éviter et quoi vérifier avant d'acheter.`, 155),
    alternates: { canonical: `/fiabilite/${m.slug}` },
  };
}

/** Coupe un texte à la fin d'un mot, sans dépasser n caractères. */
const coupe = (t: string, n: number) => (t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, "")}…`);
const km = (v: number) => `${v.toLocaleString("fr-FR").replace(/ /g, " ")} km`;

/** Questions-réponses tirées de la liste : affichées sur la page et données à Google (FAQPage). */
function questions(m: ModeleFiable, eviter: string[]) {
  return [
    { q: `La ${m.nom} est-elle fiable ?`, r: `Oui, c'est l'un des modèles que l'outil recommande en occasion, de ${m.ans[0]} à ${m.ans[1]} et jusqu'à environ ${km(m.km)}. ${m.pourquoi}` },
    { q: `Quel moteur choisir sur une ${m.nom} ?`, r: `Les moteurs à viser : ${m.bons}.${eviter.length ? ` À éviter : ${eviter.join(" ; ")}.` : ""}` },
    { q: `Que vérifier avant d'acheter une ${m.nom} d'occasion ?`, r: `${m.verif} Demandez aussi le contrôle technique de moins de 6 mois, les factures d'entretien et le rapport HistoVec.` },
  ];
}

export default async function PageFiabilite({ params }: Params) {
  const m = modeleFiable((await params).slug);
  if (!m) notFound();
  const fournisseurs = await fournisseursActifs();
  // à éviter : les moteurs propres au modèle, puis ceux que l'outil signale pour la marque (boîtes robotisées comprises)
  const eviter = [...new Set([...m.aEviter, ...aEviterPour(m.marque).map((x) => x.texte)])];
  const moteurs = MOTEURS.filter((x) => !x.marques.length || x.marques.some((b) => b.startsWith(m.marque.toLowerCase())));
  const faq = questions(m, eviter);
  const autres = MODELES_FIABLES.filter((x) => x.slug !== m.slug).slice(0, 8);

  return (
    <div className="wrap py-14">
      <JsonLdFil etapes={[{ nom: "Accueil", chemin: "/" }, { nom: "Fiabilité", chemin: "/fiabilite" }, { nom: m.nom, chemin: `/fiabilite/${m.slug}` }]} />
      <JsonLdFaq questions={faq} />
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-ink-3">
        <Link href="/" className="hover:text-ink">
          Accueil
        </Link>{" "}
        ›{" "}
        <Link href="/fiabilite" className="hover:text-ink">
          Fiabilité
        </Link>{" "}
        › <span aria-current="page">{m.nom}</span>
      </nav>

      <div className="max-w-3xl">
        <h1 className="h-sec">
          {m.nom} d&apos;occasion : <span className="it">fiabilité et moteurs</span>
        </h1>
        <p className="mt-4 text-lg text-ink-2">{m.pourquoi}</p>
      </div>

      {/* l'essentiel en quatre cases */}
      <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Années à viser", `${m.ans[0]} – ${m.ans[1]}`],
            ["Jusqu'à", km(m.km)],
            ["Énergies", m.en.join(", ")],
            ["Verdict de l'outil", "Fiable"],
          ] as const
        ).map(([l, v], i) => (
          <div key={l} className="carte flex flex-col p-5">
            <dt className="order-2 text-sm text-ink-3">{l}</dt>
            <dd className={`order-1 font-display text-2xl font-semibold first-letter:uppercase ${i === 3 ? "text-ok" : ""}`}>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="f-bons" className="carte p-6">
          <h2 id="f-bons" className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="grid size-7 place-items-center rounded-full bg-ok/15 text-ok" aria-hidden="true">
              ✓
            </span>
            Les moteurs à prendre
          </h2>
          <p className="mt-3 text-ink-2">{m.bons}</p>
        </section>
        <section aria-labelledby="f-eviter" className="carte p-6">
          <h2 id="f-eviter" className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="grid size-7 place-items-center rounded-full bg-bad/15 text-bad" aria-hidden="true">
              ✕
            </span>
            À éviter
          </h2>
          {eviter.length ? (
            <ul className="mt-3 grid gap-2 text-ink-2">
              {eviter.map((x) => (
                <li key={x} className="flex gap-2">
                  <span className="text-bad" aria-hidden="true">
                    •
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-ink-2">Aucun moteur de ce modèle n&apos;est dans la liste noire de l&apos;outil.</p>
          )}
        </section>
        <section aria-labelledby="f-verif" className="carte p-6 lg:col-span-2">
          <h2 id="f-verif" className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="grid size-7 place-items-center rounded-full bg-warn/15 text-warn" aria-hidden="true">
              !
            </span>
            À vérifier avant d&apos;acheter
          </h2>
          <p className="mt-3 text-ink-2">{m.verif}</p>
          <p className="mt-2 text-sm text-ink-3">Et toujours : contrôle technique de moins de 6 mois, factures d&apos;entretien, rapport HistoVec.</p>
        </section>
      </div>

      {/* passer de la fiche à une annonce précise */}
      <section aria-labelledby="f-essai" className="mt-14 text-center">
        <h2 id="f-essai" className="h-sec">
          Une {m.nom.split(" ").slice(0, 2).join(" ")} <span className="it">en vue ?</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-ink-2">Collez l&apos;annonce : l&apos;outil reconnaît le moteur, chiffre les défauts et vous dit quel prix proposer.</p>
        <div className="mt-8">
          <Essai fournisseurs={fournisseurs} depuis="fiabilite" retour={`/fiabilite/${m.slug}`} />
        </div>
      </section>

      <section aria-labelledby="f-faq" className="mt-16">
        <h2 id="f-faq" className="mb-6 font-display text-2xl font-semibold">
          Questions fréquentes
        </h2>
        <Faq questions={faq.map((x, i) => ({ cat: ["Fiabilité", "Moteurs", "Contrôles"][i], q: x.q, r: <p>{x.r}</p> }))} />
      </section>

      {moteurs.length > 0 && (
        <nav aria-labelledby="f-moteurs" className="mt-14">
          <h2 id="f-moteurs" className="font-display text-xl font-semibold">
            Les moteurs à éviter, en détail
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {moteurs.map((x) => (
              <li key={x.slug}>
                <Link href={`/moteur/${x.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-line-2 px-4 text-sm text-ink-2 transition hover:border-o/50 hover:text-ink">
                  {x.nom}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <nav aria-labelledby="f-autres" className="mt-12">
        <h2 id="f-autres" className="font-display text-xl font-semibold">
          D&apos;autres occasions fiables
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {autres.map((x) => (
            <li key={x.slug}>
              <Link href={`/fiabilite/${x.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-line-2 px-4 text-sm text-ink-2 transition hover:border-o/50 hover:text-ink">
                {x.nom}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
