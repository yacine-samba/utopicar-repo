import Link from "next/link";
import type { ReactNode } from "react";
import { Rotateur } from "@/components/accueil/Rotateur";
import { Faq } from "@/components/site/Faq";
import { Essai } from "@/components/accueil/Essai";
import { CARTE_ACCUEIL } from "@/components/accueil/PreuveAnimee";
import { CarteHero } from "@/components/accueil/CarteHero";
import { TroisVerdicts } from "@/components/accueil/TroisVerdicts";
import { VisiteApp } from "@/components/accueil/VisiteApp";
import { BarreEssai } from "@/components/site/BarreEssai";
import { fournisseursActifs } from "@/lib/fournisseurs";
import { JsonLdFaq } from "@/components/site/JsonLd";
import { GainsAbonnement } from "@/components/site/GainsAbonnement";
import { PARTICULIERS } from "@/lib/offres";
import { TroisActes } from "@/components/accueil/TroisActes";
import { Pieges } from "@/components/accueil/Pieges";
import { Fleches } from "@/components/site/Fleches";
import { CATALOGUE_DEFAUTS } from "@/lib/analyse/defauts";

/* Page d'accueil construite comme celle de Google Flow : peu de blocs, une idée par bloc, de grands titres, l'app en grand
   et une seule action (coller une annonce). 67 % des visiteurs sont sur téléphone et arrivent de TikTok.
   Ordre : essai et preuve → comment ça marche en 3 actes → 3 vrais verdicts → l'app → pièges → formules → questions → appel final.
   Chaque bloc suit le même gabarit (titre centré, une phrase au plus) et le même espacement. */

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

/** Un bloc de la page : même espacement partout, titre centré et une phrase au plus dessous. */
function Bloc({ id, titre, phrase, children, large = "max-w-5xl" }: { id: string; titre: ReactNode; phrase?: ReactNode; children: ReactNode; large?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="scroll-mt-24 py-20 sm:py-28">
      <div className="wrap">
        <div className="apparait mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <h2 id={`${id}-t`} className="h-sec">
            {titre}
          </h2>
          {phrase && <p className="mx-auto mt-4 max-w-xl text-lg text-ink-2">{phrase}</p>}
        </div>
        <div className={`mx-auto ${large}`}>{children}</div>
      </div>
    </section>
  );
}

export default async function Accueil() {
  const fournisseurs = await fournisseursActifs();
  return (
    <>
      {/* ---------------- héros : le champ d'essai à gauche, la preuve qui se joue à droite ---------------- */}
      <section className="relative overflow-hidden pb-16 pt-10 sm:pb-24 sm:pt-16">
        <div className="wrap grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div className="text-center lg:text-left">
            <h1 className="arrivee mx-auto max-w-[17ch] font-display text-[clamp(36px,5.6vw,64px)] font-medium leading-[1.02] tracking-[-0.035em] lg:mx-0">
              Voyez en 10 secondes si une occasion est <Rotateur mots={["une vraie affaire", "une arnaque", "à négocier", "au bon prix"]} />
            </h1>
            <div className="arrivee mt-8" style={{ "--i": 1 } as React.CSSProperties}>
              <Essai fournisseurs={fournisseurs} depuis="hero" />
            </div>
            <ul className="arrivee mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-2 lg:justify-start" style={{ "--i": 2 } as React.CSSProperties}>
              {["Aperçu en 2 s", "Sans compte", "Gratuit"].map((t) => (
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

      {/* ---------------- comment ça marche : trois actes en grands mots, un sélecteur collant les suit ---------------- */}
      <section id="comment" aria-labelledby="comment-t" className="scroll-mt-24 pt-20 sm:pt-28">
        <div className="wrap text-center">
          <h2 id="comment-t" className="h-sec mx-auto max-w-3xl">
            Trois étapes, <span className="it">une minute</span>
          </h2>
        </div>
        <TroisActes />
      </section>

      {/* ---------------- trois vraies annonces, trois verdicts : l'outil sait aussi dire non ---------------- */}
      <Bloc
        id="verdicts"
        titre={
          <>
            3 annonces, <span className="it">3 verdicts</span>
          </>
        }
        phrase="L'outil sait aussi dire non."
      >
        <TroisVerdicts />
        <Fleches cible="liste-verdicts" libelle="annonce" className="mt-4 md:hidden" />
      </Bloc>

      {/* ---------------- l'app : l'écran se déploie au défilement, on clique d'un écran à l'autre ---------------- */}
      <Bloc
        id="app"
        titre={
          <>
            Dans l&apos;app, <span className="it">en vrai</span>
          </>
        }
        phrase="Cliquez sur un écran."
        large="max-w-4xl"
      >
        <div className="deploie">
          <VisiteApp />
        </div>
        <p className="mt-8 text-center text-ink-2">
          Achat-revente ?{" "}
          <Link href="/benef" className="font-medium text-o2 underline underline-offset-4">
            Benef calcule votre marge →
          </Link>
        </p>
      </Bloc>

      {/* ---------------- les pièges repérés dans le texte des annonces : la vraie liste des règles, avec leur coût ---------------- */}
      <Bloc
        id="pieges"
        titre={
          <>
            Les pièges <span className="it">qu&apos;on repère</span>
          </>
        }
        phrase={`${CATALOGUE_DEFAUTS.length} règles lisent le texte de l'annonce, chacune avec son coût de réparation.`}
      >
        <Pieges defauts={CATALOGUE_DEFAUTS} />
      </Bloc>

      {/* ---------------- formules ---------------- */}
      <Bloc
        id="formules"
        titre={
          <>
            Pourquoi s&apos;abonner ? <span className="it">Ça se rembourse</span>
          </>
        }
        phrase="La première analyse est offerte, sans carte. Après, une seule négociation réussie paie des mois d'abonnement."
        large="max-w-none"
      >
        <GainsAbonnement famille="particulier" ids={PARTICULIERS} credits lien="/tarifs" />
      </Bloc>

      {/* ---------------- questions ---------------- */}
      <Bloc id="faq" titre="Des questions ?" phrase={<>Une autre ? <Link href="/legal#contact" className="font-medium text-o2 underline underline-offset-4">Écrivez-nous</Link></>} large="max-w-3xl">
        <Faq questions={FAQ.map((f) => ({ cat: f.cat, q: f.q, r: <p>{f.r}</p> }))} />
      </Bloc>

      {/* ---------------- appel final ---------------- */}
      <section id="appel-final" className="pb-28 pt-12 text-center sm:pb-36">
        <div className="wrap">
          <div className="apparait mx-auto max-w-3xl">
            <h2 className="vue h-sec">
              Votre prochaine voiture, <span className="it">au bon prix</span>
            </h2>
            <Link href="#essai" className="btn btn-o mt-9">
              Analyser une annonce <span aria-hidden="true">→</span>
            </Link>
            <p className="mt-6 text-sm text-ink-3">
              Par <b className="font-medium text-ink">Yacine</b>, qui l&apos;utilise pour ses achats-reventes.
            </p>
          </div>
        </div>
      </section>
      <BarreEssai />
      <JsonLdFaq questions={FAQ.map(({ q, r }) => ({ q, r }))} />
    </>
  );
}
