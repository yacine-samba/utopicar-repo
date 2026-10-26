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
import { CompteurInscrits } from "@/components/site/CompteurInscrits";
import { TroisActes } from "@/components/accueil/TroisActes";
import { SommairePage } from "@/components/site/SommairePage";
import { Pieges } from "@/components/accueil/Pieges";
import { CATALOGUE_DEFAUTS } from "@/lib/analyse/defauts";

/* Page d'accueil pensée pour la conversion : 67 % des visiteurs sont sur téléphone et arrivent de TikTok.
   Une seule action (coller une annonce), la preuve visible tout de suite (vraie annonce, verdict joué en 2 s), de vrais chiffres,
   presque pas de texte. Ordre : essai et preuve → chiffres → comment ça marche en 3 actes → 3 vrais verdicts → ce qui est vérifié
   → l'app → pièges → cote en direct → prix → questions → appel final. Sommaire collant sur tablette et ordinateur. */

const SOMMAIRE: [string, string][] = [
  ["essai", "Essayer"],
  ["comment", "Comment ça marche"],
  ["verdicts", "Verdicts"],
  ["verifie", "Ce qu'on vérifie"],
  ["app", "L'app"],
  ["pieges", "Pièges"],
  ["cote", "La cote"],
  ["formules", "Formules"],
  ["faq", "Questions"],
];

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
      <SommairePage sections={SOMMAIRE} />
      <div className="progression" aria-hidden="true" />
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
            <CompteurInscrits className="mt-3 justify-center lg:justify-start" />
          </div>
          <CarteHero defaut={CARTE_ACCUEIL} />
        </div>
        <a href="#comment" aria-label="Voir comment ça marche" className="mx-auto mt-10 hidden size-11 place-items-center rounded-full border border-line-2 text-ink-3 no-underline transition hover:border-o/50 hover:text-ink lg:grid">
          <svg viewBox="0 0 24 24" className="pousse-bas size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </a>
      </section>

      {/* ---------------- vrais chiffres ---------------- */}
      <ChiffresMarche />
      <Defile items={MODELES} label="Modèles analysés" />

      {/* ---------------- comment ça marche : trois actes en grands mots, un sélecteur collant les suit ---------------- */}
      <section id="comment" aria-labelledby="comment-t" className="scroll-mt-32 pt-20">
        <div className="wrap text-center">
          <p className="kicker">Comment ça marche</p>
          <h2 id="comment-t" className="h-sec mx-auto mt-4 max-w-2xl">
            Trois étapes, <span className="it">une minute</span>
          </h2>
        </div>
        <TroisActes />
      </section>

      {/* ---------------- trois vraies annonces, trois verdicts : l'outil sait aussi dire non ---------------- */}
      <section id="verdicts" className="scroll-mt-32 py-16">
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
      <section id="verifie" className="scroll-mt-32 py-16">
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

      {/* ---------------- visite interactive de l'app : grand titre, puis l'écran se déploie au défilement ---------------- */}
      <section id="app" className="scroll-mt-32 py-20">
        <div className="wrap">
          <div className="apparait mx-auto mb-12 max-w-3xl text-center">
            <h2 className="font-display text-[clamp(40px,7vw,88px)] font-semibold leading-[0.95] tracking-[-0.035em]">
              Dans l&apos;app, <span className="it">en vrai</span>
            </h2>
            <p className="mt-4 text-lg text-ink-2">Cliquez sur un écran.</p>
          </div>
          <div className="deploie mx-auto max-w-4xl">
            <VisiteApp />
          </div>
        </div>
      </section>

      {/* ---------------- les pièges repérés dans le texte des annonces : la vraie liste des règles, avec leur coût ---------------- */}
      <section id="pieges" aria-labelledby="pieges-t" className="scroll-mt-32 py-16">
        <div className="wrap">
          <div className="mx-auto mb-10 max-w-5xl">
            <h2 id="pieges-t" className="h-sec">
              Les pièges <span className="it">qu&apos;on repère</span>
            </h2>
            <p className="mt-3 text-lg text-ink-2">
              {CATALOGUE_DEFAUTS.length} règles lisent le texte de l&apos;annonce, chacune avec son coût de réparation.
            </p>
          </div>
          <div className="mx-auto max-w-5xl">
            <Pieges defauts={CATALOGUE_DEFAUTS} />
          </div>
        </div>
      </section>

      {/* ---------------- la cote en direct : vrais prix médians de la base ---------------- */}
      <section id="cote" className="scroll-mt-32 py-16">
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
      <section id="formules" className="scroll-mt-32 py-16">
        <div className="wrap">
          <div className="apparait mx-auto mb-10 max-w-2xl text-center">
            <h2 className="h-sec">
              Pourquoi s&apos;abonner ? <span className="it">Ça se rembourse</span>
            </h2>
            <p className="mt-3 text-lg text-ink-2">La première analyse est offerte, sans carte. Après, une seule négociation réussie paie des mois d&apos;abonnement.</p>
          </div>
          <GainsAbonnement famille="particulier" ids={PARTICULIERS} credits lien="/tarifs" />
        </div>
      </section>

      {/* ---------------- questions ---------------- */}
      <section id="faq" className="scroll-mt-32 py-16">
        <div className="wrap mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-12">
          <div className="lg:sticky lg:top-36 lg:self-start">
            <h2 className="apparait h-sec">Vos questions</h2>
            <p className="mt-3 text-ink-2">
              Une autre ?{" "}
              <Link href="/legal#contact" className="font-medium text-o2 underline underline-offset-4">
                Écrivez-nous
              </Link>
            </p>
          </div>
          <Faq questions={FAQ.map((f) => ({ cat: f.cat, q: f.q, r: <p>{f.r}</p> }))} />
        </div>
      </section>

      {/* ---------------- appel final ---------------- */}
      <section id="appel-final" className="py-20 text-center">
        <div className="wrap">
          <div className="apparait mx-auto max-w-4xl">
            <h2 className="vue font-display text-[clamp(44px,8vw,104px)] font-semibold leading-[0.95] tracking-[-0.04em]">
              Votre prochaine voiture, <span className="it">au bon prix</span>
            </h2>
            <Link href="#essai" className="btn btn-o mt-9">
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
