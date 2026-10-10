import Link from "next/link";
import { Rotateur } from "@/components/accueil/Rotateur";
import { Defile } from "@/components/site/Defile";
import { Faq } from "@/components/site/Faq";
import { Essai } from "@/components/accueil/Essai";
import { CARTE_ACCUEIL } from "@/components/accueil/PreuveAnimee";
import { CarteHero } from "@/components/accueil/CarteHero";
import { TroisTemps } from "@/components/accueil/TroisTemps";
import { TroisVerdicts } from "@/components/accueil/TroisVerdicts";
import { CoteEnDirect } from "@/components/accueil/CoteEnDirect";
import { Bento } from "@/components/accueil/Bento";
import { VisiteApp } from "@/components/accueil/VisiteApp";
import { ChiffresMarche } from "@/components/site/ChiffresMarche";
import { BarreEssai } from "@/components/site/BarreEssai";
import { fournisseursActifs } from "@/lib/fournisseurs";
import { JsonLdFaq } from "@/components/site/JsonLd";
import { GainsAbonnement } from "@/components/site/GainsAbonnement";
import { PARTICULIERS } from "@/lib/offres";

/* Page d'accueil pensée pour la conversion : 67 % des visiteurs sont sur téléphone et arrivent de TikTok.
   Une seule action (coller une annonce), la preuve visible tout de suite (vraie annonce, verdict joué en 2 s), de vrais chiffres,
   presque pas de texte. Ordre : essai et preuve → chiffres → 3 vrais verdicts → ce qui est vérifié → pièges → cote en direct
   → prix → questions → appel final. */

/** Des vrais libellés de l'outil (lib/analyse/defauts.ts, 38 règles), parmi les plus parlants. */
const PIEGES = ["Joint de culasse signalé", "Moteur à refaire", "Distribution à faire", "Embrayage à changer", "Kilométrage non garanti", "Boîte de vitesses à revoir", "Turbo à changer", "Voyant allumé", "Fuite d'huile", "Fumée à l'échappement", "Problème de papiers", "Rouille", "Choc de carrosserie", "Vendue en l'état"];

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
            <div className="mt-6">
              <TroisTemps etapes={[["lien", "Collez l'annonce"], ["balance", "Comparée au marché"], ["verdict", "Verdict et prix"]]} />
            </div>
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
          <CarteHero defaut={CARTE_ACCUEIL} />
        </div>
      </section>

      {/* ---------------- vrais chiffres ---------------- */}
      <ChiffresMarche />
      <Defile items={MODELES} label="Modèles analysés" />

      {/* ---------------- trois vraies annonces, trois verdicts : l'outil sait aussi dire non ---------------- */}
      <section className="py-16">
        <div className="wrap">
          <div className="mx-auto mb-10 flex max-w-5xl flex-wrap items-end justify-between gap-3">
            <h2 className="h-sec">
              3 annonces, <span className="it">3 verdicts</span>
            </h2>
            <Link href="#essai" className="inline-flex min-h-6 items-center text-sm font-medium text-o2 underline underline-offset-4">
              Essayez la vôtre ↑
            </Link>
          </div>
          <div className="mx-auto max-w-5xl">
            <TroisVerdicts />
          </div>
        </div>
      </section>

      {/* ---------------- ce qui est vérifié, en bento : la vraie cote en case d'ancrage, une idée par case, l'action à part ---------------- */}
      <section className="py-16">
        <div className="wrap">
          <h2 className="h-sec mx-auto mb-10 max-w-2xl text-center">
            Ce qu&apos;on vérifie <span className="it">à votre place</span>
          </h2>
          <div className="mx-auto max-w-5xl">
            <Bento />
          </div>
          <p className="mt-6 text-center text-ink-2">
            Achat-revente ?{" "}
            <Link href="/benef" className="font-medium text-o2 underline underline-offset-4">
              Benef calcule votre marge →
            </Link>
          </p>
        </div>
      </section>

      {/* ---------------- visite interactive de l'app ---------------- */}
      <section className="py-16">
        <div className="wrap">
          <div className="apparait mx-auto mb-10 max-w-2xl text-center">
            <h2 className="h-sec">
              Dans l&apos;app, <span className="it">en vrai</span>
            </h2>
            <p className="mt-3 text-lg text-ink-2">Cliquez sur un écran.</p>
          </div>
          <div className="mx-auto max-w-4xl">
            <VisiteApp />
          </div>
        </div>
      </section>

      {/* ---------------- les pièges repérés dans le texte des annonces ---------------- */}
      <section aria-labelledby="pieges" className="py-10">
        <h2 id="pieges" className="wrap mb-4 text-center font-display text-xl font-semibold">
          Les pièges qu&apos;on repère <span className="text-ink-3">(38 au total)</span>
        </h2>
        <Defile items={PIEGES} label="Exemples de pièges repérés" inverse />
      </section>

      {/* ---------------- la cote en direct : vrais prix médians de la base ---------------- */}
      <section className="py-16">
        <div className="wrap">
          <div className="mx-auto mb-10 flex max-w-5xl flex-wrap items-end justify-between gap-3">
            <h2 className="h-sec">
              La cote <span className="it">en direct</span>
            </h2>
          </div>
          <div className="mx-auto max-w-5xl">
            <CoteEnDirect />
          </div>
        </div>
      </section>

      {/* ---------------- formules ---------------- */}
      <section id="formules" className="scroll-mt-24 py-16">
        <div className="wrap">
          <div className="apparait mx-auto mb-10 max-w-2xl text-center">
            <h2 className="h-sec">
              Pourquoi s&apos;abonner ? <span className="it">Ça se rembourse</span>
            </h2>
            <p className="mt-3 text-lg text-ink-2">La première analyse est offerte, sans carte. Voici ce que la suite vous rapporte.</p>
          </div>
          <GainsAbonnement famille="particulier" ids={PARTICULIERS} credits lien="/tarifs" />
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
