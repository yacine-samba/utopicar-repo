import Link from "next/link";
import { Essai } from "@/components/accueil/Essai";
import { CARTE_ACCUEIL } from "@/components/accueil/PreuveAnimee";
import { CarteHero } from "@/components/accueil/CarteHero";
import { Ticket } from "@/components/accueil/Ticket";
import { Verdicts } from "@/components/accueil/Verdicts";
import { CarteReparations } from "@/components/accueil/CarteReparations";
import { Chiffres } from "@/components/accueil/Chiffres";
import { DeuxFormules } from "@/components/accueil/DeuxFormules";
import { BarreEssai } from "@/components/site/BarreEssai";
import { fournisseursActifs } from "@/lib/fournisseurs";
import { JsonLdFaq } from "@/components/site/JsonLd";
import { CompteurInscrits } from "@/components/site/CompteurInscrits";

/* Page d'accueil pensée pour la conversion : 67 % des visiteurs sont sur téléphone et arrivent de TikTok.
   L'idée : l'annonce que vous collez devient le rapport. Sur ordinateur, la moitié gauche ne bouge pas : la vraie
   annonce Clio de la démonstration, avec sa cote et son verdict, remplacée par la vôtre dès que vous l'essayez.
   À droite, on lit : le champ d'essai, puis le ticket du rapport. Ensuite la page s'élargit : trois verdicts, la carte
   des réparations (les 38 pièges et leur coût), les chiffres de la base, deux formules, les réponses, un dernier mot.
   Pas de cadres, de dégradés ni d'ombres : des fonds pleins, de grandes tailles, de vraies photos. */

/** Les questions qui bloquent l'essai, et seulement elles (le texte brut sert aussi aux données structurées). */
const FAQ: { q: string; r: string }[] = [
  { q: "C'est vraiment gratuit ?", r: "Oui. L'aperçu est immédiat sans compte, et la première analyse complète est offerte, sans carte bancaire. Ensuite : 4,99 € par mois sans engagement, ou 2,99 € l'analyse à l'unité." },
  { q: "Ça marche sur quelles annonces ?", r: "Leboncoin (le lien suffit), La Centrale et AutoScout24 (collez le texte de la page). Voitures particulières, vendeurs particuliers ou professionnels." },
  { q: "Ça remplace un garagiste ?", r: "Non : ça vous évite les mauvais déplacements et vous donne un prix de départ. Pour une voiture chère ou un doute mécanique, l'outil conseille une inspection." },
  { q: "Combien de temps ça prend ?", r: "L'aperçu (cote, défauts, moteur) s'affiche en 2 secondes. Le rapport complet, photos lues et questions rédigées, en une minute environ." },
  { q: "Que faites-vous de mes informations ?", r: "Votre e-mail sert à votre compte, vos analyses restent privées. Pas de revente de données, pas de publicité." },
];

/** Espace entre deux sections : nettement plus grand que tout écart à l'intérieur d'une section. */
const SECTION = "py-[clamp(88px,11vw,176px)]";

export default async function Accueil() {
  const fournisseurs = await fournisseursActifs();
  return (
    <>
      {/* ---------------- la scène : l'annonce à gauche (fixe sur ordinateur), la lecture à droite ---------------- */}
      <section aria-labelledby="titre" className="relative flex flex-col lg:grid lg:grid-cols-[minmax(0,47fr)_minmax(0,53fr)] lg:grid-rows-[auto_auto]">
        <div className="flex flex-col justify-center px-5 pb-10 pt-8 sm:px-10 lg:col-start-2 lg:row-start-1 lg:min-h-[calc(100svh-68px)] lg:px-14 lg:pb-[clamp(150px,15vw,230px)] xl:px-20">
          <h1 id="titre" className="arrivee max-w-[22ch] font-display text-[clamp(30px,3.6vw,54px)] font-medium leading-[1.04] tracking-[-0.03em]">
            Cette voiture est-elle une bonne affaire ?
          </h1>
          <p className="arrivee mt-5 max-w-[46ch] text-[20px] text-ink-2" style={{ "--i": 1 } as React.CSSProperties}>
            Collez son annonce Leboncoin, La Centrale ou AutoScout24 : en 10 secondes, la cote du marché, les défauts lus dans le texte et le prix à proposer. Gratuit, sans compte ni carte.
          </p>
          <div className="arrivee mt-8 max-w-[560px] [&_#essai]:mx-0 [&_p.justify-center]:justify-start" style={{ "--i": 2 } as React.CSSProperties}>
            <Essai fournisseurs={fournisseurs} depuis="hero" />
          </div>
          <CompteurInscrits className="mt-5" />
        </div>

        {/* la scène : l'annonce, fixe pendant toute la lecture sur ordinateur ; la vôtre la remplace dès que vous essayez */}
        <div className="p-3 lg:sticky lg:top-[68px] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:h-[calc(100svh-68px)] lg:self-start lg:p-5">
          <div className="h-[72svh] max-h-[640px] lg:h-full lg:max-h-none">
            <CarteHero defaut={CARTE_ACCUEIL} plein />
          </div>
        </div>

        {/* le nom en très grand : sous la scène sur téléphone */}
        <p aria-hidden="true" className="mot-geant -mt-1 select-none px-3 font-display text-[22vw] font-medium leading-[0.8] tracking-[-0.055em] text-mot lg:hidden">
          utopicar
        </p>

        {/* ---------------- comment ça marche : le ticket du rapport ---------------- */}
        <div id="comment" className="scroll-mt-24 px-5 pb-[clamp(88px,11vw,176px)] pt-16 sm:px-10 lg:col-start-2 lg:row-start-2 lg:px-14 lg:pt-[clamp(88px,9vw,140px)] xl:px-20">
          <h2 className="apparait font-display text-[clamp(36px,3.6vw,56px)] font-medium leading-none tracking-[-0.035em]">Trois étapes, une minute</h2>
          <p className="apparait mt-5 max-w-[42ch] text-[20px] text-ink-2" style={{ "--i": 1 } as React.CSSProperties}>
            Ce que l&apos;outil a fait de la Clio de l&apos;exemple, une vraie annonce Leboncoin relevée le 3 octobre 2026.
          </p>
          <div className="mt-10 max-w-[480px]">
            <Ticket />
          </div>
        </div>

        {/* le nom en très grand, à cheval sur la scène et la colonne (ordinateur) : il rétrécit un peu quand on descend */}
        <p aria-hidden="true" className="mot-geant pointer-events-none absolute right-14 top-[calc(100svh-68px)] z-10 hidden -translate-y-[calc(100%+36px)] select-none font-display text-[clamp(140px,15.5vw,250px)] font-medium leading-[0.78] tracking-[-0.055em] text-mot lg:block xl:right-20">
          utopicar
        </p>
      </section>

      {/* ---------------- trois vraies annonces, trois verdicts : l'outil sait aussi dire non ---------------- */}
      <section id="verdicts" aria-labelledby="verdicts-t" className={`wrap scroll-mt-24 ${SECTION}`}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
          <h2 id="verdicts-t" className="apparait font-display text-[clamp(36px,4.4vw,64px)] font-medium leading-none tracking-[-0.035em]">
            Trois annonces, trois verdicts
          </h2>
          <p className="apparait max-w-[40ch] text-[20px] text-ink-2 md:justify-self-end" style={{ "--i": 1 } as React.CSSProperties}>
            L&apos;outil sait aussi dire non. Trois vraies annonces, analysées telles quelles.{" "}
            <Link href="#essai" className="font-medium text-o2 underline underline-offset-4">
              Essayez la vôtre
            </Link>
          </p>
        </div>
        <div className="mt-14">
          <Verdicts />
        </div>
      </section>

      {/* ---------------- la carte des réparations : les 38 pièges et leur coût, sur un champ sombre ---------------- */}
      <section id="pieges" aria-labelledby="pieges-t" className={`scroll-mt-24 bg-champ-fort ${SECTION}`}>
        <div className="wrap max-w-[1080px]">
          <CarteReparations />
        </div>
      </section>

      {/* ---------------- les chiffres de la base, et la cote en direct ---------------- */}
      <section id="cote" aria-labelledby="chiffres-t" className={`wrap scroll-mt-24 ${SECTION}`}>
        <Chiffres />
      </section>

      {/* ---------------- deux formules, deux champs de couleur ---------------- */}
      <section id="formules" aria-labelledby="formules-t" className="scroll-mt-24">
        <h2 id="formules-t" className="sr-only">
          Formules
        </h2>
        <DeuxFormules />
      </section>

      {/* ---------------- les réponses, à lire d'un coup d'œil ---------------- */}
      <section id="faq" aria-labelledby="faq-t" className={`wrap scroll-mt-24 ${SECTION}`}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:gap-12">
          <h2 id="faq-t" className="apparait font-display text-[clamp(30px,2.6vw,40px)] font-medium leading-tight tracking-[-0.025em]">
            Vos questions
          </h2>
          <div className="gap-14 md:columns-2">
            {FAQ.map(({ q, r }, i) => (
              <p key={q} className="apparait mb-6 break-inside-avoid text-[17px] leading-relaxed text-ink-2" style={{ "--i": i } as React.CSSProperties}>
                <b className="font-semibold text-ink">{q}</b> {r}
              </p>
            ))}
            <p className="apparait break-inside-avoid text-[17px] leading-relaxed text-ink-2">
              <b className="font-semibold text-ink">Une autre question ?</b>{" "}
              <Link href="/methode" className="font-medium text-o2 underline underline-offset-4">
                Comment l&apos;analyse est faite
              </Link>
              , ou{" "}
              <Link href="/legal#contact" className="font-medium text-o2 underline underline-offset-4">
                écrivez-nous
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- un dernier mot, une action ---------------- */}
      <section id="appel-final" aria-label="Analyser une annonce" className="wrap pb-[12svh] pt-[14svh]">
        <div className="apparait max-w-[38ch] lg:ml-[25%]">
          <p className="text-[clamp(20px,1.7vw,24px)] leading-snug">Votre prochaine voiture, au bon prix : collez son annonce, le verdict arrive tout de suite.</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="#essai" className="btn btn-o">
              Analyser une annonce
            </Link>
            <span className="text-[15px] text-ink-2">Par Yacine, qui l&apos;utilise pour ses achats-reventes.</span>
          </div>
        </div>
      </section>
      <BarreEssai />
      <JsonLdFaq questions={FAQ} />
    </>
  );
}
