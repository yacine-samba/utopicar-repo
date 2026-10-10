import Link from "next/link";
import { Rotateur } from "@/components/accueil/Rotateur";
import { Defile } from "@/components/site/Defile";
import { Faq } from "@/components/site/Faq";
import { Essai } from "@/components/accueil/Essai";
import { PreuveAnimee } from "@/components/accueil/PreuveAnimee";
import { ChiffresMarche } from "@/components/site/ChiffresMarche";
import { BarreEssai } from "@/components/site/BarreEssai";
import { fournisseursActifs } from "@/lib/fournisseurs";
import { JsonLdFaq } from "@/components/site/JsonLd";
import { PrixCompact } from "@/components/site/PrixCompact";
import { PARTICULIERS } from "@/lib/offres";

/* Page d'accueil pensée pour la conversion : 67 % des visiteurs sont sur téléphone et arrivent de TikTok.
   Une seule action (coller une annonce), la preuve visible tout de suite (vraie annonce, verdict joué en 2 s), de vrais chiffres,
   presque pas de texte. Ordre : essai et preuve → chiffres → ce qui est vérifié → prix → questions → appel final. */

const MODELES = ["Renault Clio IV", "Peugeot 208", "Toyota Yaris", "Dacia Sandero", "VW Polo V", "Citroën C3", "Ford Fiesta", "Opel Corsa", "Hyundai i20", "Suzuki Swift", "Renault Twingo", "Seat Ibiza", "Kia Rio", "Skoda Fabia"];

/** Les questions qui bloquent l'essai, et seulement elles (le texte brut sert aussi aux données structurées). */
const FAQ: { cat: string; q: string; r: string }[] = [
  { cat: "Prix", q: "C'est vraiment gratuit ?", r: "Oui. L'aperçu est immédiat sans compte, et la première analyse complète est offerte, sans carte bancaire. Ensuite : 4,99 € par mois sans engagement, ou 2,99 € l'analyse à l'unité." },
  { cat: "Annonces", q: "Ça marche sur quelles annonces ?", r: "Leboncoin (le lien suffit), La Centrale et AutoScout24 (collez le texte de la page). Voitures particulières, vendeurs particuliers ou professionnels." },
  { cat: "Fiabilité", q: "Ça remplace un garagiste ?", r: "Non : ça vous évite les mauvais déplacements et vous donne un prix de départ. Pour une voiture chère ou un doute mécanique, l'outil conseille une inspection." },
  { cat: "Délai", q: "Combien de temps ça prend ?", r: "L'aperçu (cote, défauts, moteur) s'affiche en 2 secondes. Le rapport complet, photos lues et questions rédigées, en une minute environ." },
  { cat: "Données", q: "Que faites-vous de mes informations ?", r: "Votre e-mail sert à votre compte, vos analyses restent privées. Pas de revente de données, pas de publicité." },
];

const Coche = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true" className="shrink-0 text-ok">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

export default async function Accueil() {
  const fournisseurs = await fournisseursActifs();
  return (
    <>
      {/* ---------------- héros : le champ d'essai à gauche, la preuve qui se joue à droite ---------------- */}
      <section className="relative overflow-hidden pb-12 pt-10 sm:pt-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] bg-[size:64px_64px] opacity-50 [mask-image:radial-gradient(ellipse_80%_55%_at_50%_0,#000_25%,transparent_78%)]" aria-hidden="true" />
        <div className="wrap grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div className="text-center lg:text-left lg:[&_p.justify-center]:justify-start">
            <h1 className="arrivee mx-auto max-w-[17ch] font-display text-[clamp(36px,5.6vw,62px)] font-semibold leading-[1.02] tracking-[-0.03em] lg:mx-0">
              Voyez en 10 secondes si une occasion est <Rotateur mots={["une vraie affaire", "une arnaque", "à négocier", "au bon prix"]} />
            </h1>
            <p className="arrivee mx-auto mt-5 max-w-xl text-lg text-ink-2 sm:text-xl lg:mx-0" style={{ "--i": 1 } as React.CSSProperties}>
              Cote, défauts, prix à proposer. <b className="font-semibold text-ink">En 10 secondes.</b>
            </p>
            <div className="arrivee mt-7" style={{ "--i": 2 } as React.CSSProperties}>
              <Essai fournisseurs={fournisseurs} depuis="hero" />
            </div>
            <ul className="arrivee mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-2 lg:justify-start" style={{ "--i": 3 } as React.CSSProperties}>
              {["Gratuit", "Sans compte", "Sans carte"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Coche />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <PreuveAnimee />
        </div>
      </section>

      {/* ---------------- vrais chiffres ---------------- */}
      <ChiffresMarche />
      <Defile items={MODELES} label="Modèles analysés" />

      {/* ---------------- ce qui est vérifié : 4 cartes visuelles, une ligne chacune ---------------- */}
      <section className="py-16">
        <div className="wrap">
          <h2 className="apparait h-sec mx-auto mb-10 max-w-2xl text-center">
            Ce qu&apos;on vérifie <span className="it">à votre place</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="carte vue p-6">
              <h3 className="font-display text-xl font-semibold">Prix vs marché</h3>
              <div className="mt-6" aria-hidden="true">
                <div className="relative h-2.5 rounded-full bg-glass">
                  <span className="absolute inset-y-0 left-[38%] w-[20%] rounded-full bg-ok/45" />
                  <span className="absolute -top-[5px] left-[60%] -ml-2.5 size-5 rounded-full border-[3px] border-bg1 bg-o" />
                </div>
                <div className="mt-2 flex justify-between text-xs text-ink-3">
                  <span className="text-ok">cote 6 950 €</span>
                  <span className="text-o2">annonce 7 400 €</span>
                </div>
              </div>
              <p className="sr-only">Exemple : cote 6 950 €, annonce à 7 400 €, au-dessus du marché.</p>
              <Link href="/cote" className="mt-4 inline-block text-sm font-medium text-o2 underline underline-offset-4">
                Voir les cotes par modèle
              </Link>
            </article>
            <article className="carte vue p-6" style={{ "--i": 1 } as React.CSSProperties}>
              <h3 className="font-display text-xl font-semibold">Les mots qui coûtent</h3>
              <p className="mt-4 leading-relaxed text-ink-2">
                « Très bon état, <mark className="rounded bg-bad/20 px-1 text-ink">petit bruit embrayage</mark>, <mark className="rounded bg-bad/20 px-1 text-ink">pneus à prévoir</mark>. »
              </p>
            </article>
            <article className="carte vue p-6">
              <h3 className="font-display text-xl font-semibold">Fiable ou à fuir</h3>
              <ul className="mt-4 flex flex-wrap gap-2 text-sm">
                {(
                  [
                    ["1.5 dCi", true],
                    ["1.33 VVT-i", true],
                    ["1.2 PureTech", false],
                    ["DSG7", false],
                  ] as const
                ).map(([m, ok]) => (
                  <li key={m} className={`rounded-full border px-3 py-1 ${ok ? "border-ok/40 bg-ok/10 text-ok" : "border-bad/40 bg-bad/10 text-bad"}`}>
                    {ok ? "✓" : "✕"} {m}
                    <span className="sr-only">{ok ? " : fiable" : " : à éviter"}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="carte vue p-6" style={{ "--i": 1 } as React.CSSProperties}>
              <h3 className="font-display text-xl font-semibold">Avant d&apos;y aller</h3>
              <ul className="mt-4 grid gap-1.5 text-sm text-ink-2">
                <li className="flex justify-between gap-2">CT de moins de 6 mois <b className="text-ok">OK</b></li>
                <li className="flex justify-between gap-2">Carnet d&apos;entretien <b className="text-warn">À demander</b></li>
                <li className="flex justify-between gap-2">Rapport HistoVec <b className="text-warn">À demander</b></li>
              </ul>
            </article>
          </div>
          <p className="apparait mt-6 text-center text-ink-2">
            Achat-revente ?{" "}
            <Link href="/benef" className="font-medium text-o2 underline underline-offset-4">
              Benef calcule votre marge →
            </Link>
          </p>
        </div>
      </section>

      {/* ---------------- formules ---------------- */}
      <section id="formules" className="scroll-mt-24 py-16">
        <div className="wrap">
          <h2 className="apparait h-sec mx-auto mb-10 max-w-2xl text-center">
            Gratuit pour commencer, <span className="it">sans carte</span>
          </h2>
          <PrixCompact ids={PARTICULIERS} credits lien="/tarifs" />
        </div>
      </section>

      {/* ---------------- questions ---------------- */}
      <section id="faq" className="scroll-mt-24 py-16">
        <div className="wrap">
          <h2 className="apparait h-sec mx-auto mb-10 max-w-2xl text-center">Vos questions</h2>
          <Faq questions={FAQ.map((f) => ({ cat: f.cat, q: f.q, r: <p>{f.r}</p> }))} />
        </div>
      </section>

      {/* ---------------- appel final ---------------- */}
      <section id="appel-final" className="py-16 text-center">
        <div className="wrap">
          <div className="carte apparait mx-auto max-w-3xl px-6 py-12">
            <h2 className="h-sec">
              Votre prochaine voiture, <span className="it">au bon prix</span>
            </h2>
            <Link href="#essai" className="btn btn-o mt-7">
              Analyser une annonce <span aria-hidden="true">→</span>
            </Link>
            <p className="mx-auto mt-8 flex w-fit items-center gap-3 text-left text-sm text-ink-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-o/15 font-display text-o2" aria-hidden="true">
                Y
              </span>
              <span>
                Par <b className="text-ink">Yacine</b>, qui l&apos;utilise pour ses achats-reventes.
              </span>
            </p>
          </div>
        </div>
      </section>
      <BarreEssai />
      <JsonLdFaq questions={FAQ.map(({ q, r }) => ({ q, r }))} />
    </>
  );
}
