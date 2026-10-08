import Link from "next/link";
import { Rotateur } from "@/components/accueil/Rotateur";
import { Demo } from "@/components/accueil/Demo";
import { Defile } from "@/components/site/Defile";
import { Faq } from "@/components/site/Faq";
import { Essai } from "@/components/accueil/Essai";
import { fournisseursActifs } from "@/lib/fournisseurs";
import { JsonLdFaq } from "@/components/site/JsonLd";
import { CartesOffres } from "@/components/site/CartesOffres";
import { Symbole } from "@/components/site/Logo";
import { compteCourant } from "@/lib/compte";
import { PARTICULIERS } from "@/lib/offres";

const MODELES = ["Renault Clio IV", "Peugeot 208", "Toyota Yaris", "Dacia Sandero", "VW Polo V", "Citroën C3", "Ford Fiesta", "Opel Corsa", "Hyundai i20", "Suzuki Swift", "Renault Twingo", "Seat Ibiza", "Kia Rio", "Skoda Fabia"];
const VERIFS = ["Cote du marché", "38 défauts recherchés", "Moteurs à éviter signalés", "Coût réel d'achat", "Prix à proposer", "Questions au vendeur", "Contrôle sur place", "Analyse des photos"];

/** Les trois étapes, chacune avec un petit visuel concret (ce que la personne voit vraiment à cette étape). */
const ETAPES: { t: string; d: string; v: React.ReactNode }[] = [
  {
    t: "Vous collez l'annonce",
    d: "Le lien Leboncoin suffit. Sur un autre site, le texte de la page.",
    v: (
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate rounded-full border border-line-2 bg-glass px-3 py-1.5 text-ink-3">https://www.leboncoin.fr/ad/voitures/2817…</span>
        <span className="shrink-0 rounded-full bg-o px-3 py-1.5 font-display text-xs font-semibold text-[#160904]">Analyser</span>
      </div>
    ),
  },
  {
    t: "Utopicar vérifie",
    d: "La cote sur les annonces comparables, 38 défauts dans le texte, le moteur, les papiers.",
    v: (
      <ul className="grid gap-1.5">
        {[["ok", "Cote : 7 550 € (174 Clio comparables)"], ["warn", "Choc de carrosserie : 150 à 700 €"], ["ok", "Moteur 0.9 TCe : réputé fiable"], ["neutre", "CT de moins de 6 mois : à demander"]].map(([ton, t]) => (
          <li key={t} className="flex items-center gap-2">
            <span className={`grid size-4 shrink-0 place-items-center rounded-full text-[9px] ${ton === "ok" ? "bg-ok/20 text-ok" : ton === "warn" ? "bg-warn/20 text-warn" : "bg-glass text-ink-3"}`}>{ton === "ok" ? "✓" : ton === "warn" ? "!" : "?"}</span>
            <span className="text-ink-2">{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    t: "Vous savez quoi faire",
    d: "Un verdict, le prix à proposer, les questions à poser et ce qu'il faut contrôler sur place.",
    v: (
      <div className="grid gap-2">
        <span className="w-fit rounded-full border border-ok/40 bg-ok/10 px-3 py-1 font-semibold text-ok">Bon prix</span>
        <p className="text-ink-2">
          Proposez <b className="num text-ink">6 250 €</b> · Demandez le CT et les factures avant de vous déplacer.
        </p>
      </div>
    ),
  },
];

/** La FAQ en texte brut, pour les données structurées (Google affiche les questions sous le résultat). */
const FAQ_TEXTE = [
  { q: "L'analyse est-elle vraiment gratuite ?", r: "Oui, la première analyse est offerte, sans carte bancaire : il suffit de créer un compte. Ensuite, la formule Essentiel coûte 4,99 € par mois sans engagement, ou des crédits à l'unité dès 2,99 € l'analyse." },
  { q: "Ça marche sur quelles voitures ?", r: "Sur les annonces de voitures particulières de Leboncoin, La Centrale ou AutoScout24. La cote est la plus précise sur les modèles courants ; sur un modèle rare, l'outil prévient que l'estimation est moins sûre." },
  { q: "Est-ce que ça remplace un garagiste ?", r: "Non. L'outil évite les mauvais déplacements et donne un prix de départ ; il sépare ce qui est écrit dans l'annonce de ce qui reste à vérifier sur place. Pour une voiture chère ou un doute mécanique, il conseille une inspection." },
  { q: "Je colle le lien, ou tout le texte ?", r: "Sur Leboncoin, le lien suffit : l'annonce et ses photos sont récupérées. Sur les autres sites, copiez la page entière et collez-la." },
  { q: "Ça marche aussi sur une annonce de professionnel ?", r: "Oui. L'outil lit le type de vendeur et en tient compte : garantie du professionnel, vente en l'état du particulier, prix à proposer et questions adaptés." },
  { q: "Combien de temps dure une analyse ?", r: "L'aperçu s'affiche en 2 secondes. Le rapport complet, photos lues et questions rédigées, prend environ une minute." },
  { q: "Comment résilier ?", r: "En deux clics depuis votre compte, à tout moment. L'accès reste ouvert jusqu'à la fin du mois déjà payé." },
  { q: "Que faites-vous de mes informations ?", r: "Votre email sert à votre compte, vos analyses restent privées. Pas de revente de données, pas de publicité." },
];

const Coche = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true" className="text-ok">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

export default async function Accueil() {
  const [compte, fournisseurs] = await Promise.all([compteCourant(), fournisseursActifs()]);
  return (
    <>
      {/* ---------------- héros : le champ d'essai est le produit ---------------- */}
      <section className="relative overflow-hidden pb-16 pt-14 text-center sm:pt-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] bg-[size:64px_64px] opacity-50 [mask-image:radial-gradient(ellipse_80%_55%_at_50%_0,#000_25%,transparent_78%)]" aria-hidden="true" />
        <div className="wrap">
          <span className="kicker arrivee">Pour acheter une occasion ou la revendre</span>
          <h1 className="arrivee mx-auto mt-6 max-w-[17ch] font-display text-[clamp(38px,7vw,78px)] font-semibold leading-[1.02] tracking-[-0.03em]" style={{ "--i": 1 } as React.CSSProperties}>
            Voyez en 10 secondes si une occasion est <Rotateur mots={["une vraie affaire", "une arnaque", "à négocier", "au bon prix"]} />
          </h1>
          <p className="arrivee mx-auto mt-6 max-w-2xl text-lg text-ink-2 sm:text-xl" style={{ "--i": 2 } as React.CSSProperties}>
            Collez une annonce Leboncoin, La Centrale ou AutoScout24. Utopicar estime sa cote, repère les défauts qui coûtent cher et vous dit quoi faire.
          </p>
          <div className="arrivee mt-9" style={{ "--i": 3 } as React.CSSProperties}>
            <Essai fournisseurs={fournisseurs} depuis="hero" />
          </div>
          <ul className="arrivee mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-2" style={{ "--i": 4 } as React.CSSProperties}>
            <li className="flex items-center gap-2">
              <Coche />
              Première analyse offerte
            </li>
            <li className="flex items-center gap-2">
              <Coche />
              Sans carte bancaire
            </li>
            <li className="flex items-center gap-2">
              <Coche />
              Résultat en langage clair
            </li>
          </ul>
        </div>
      </section>

      <Defile items={MODELES} label="Modèles analysés" />
      <Defile items={VERIFS} label="Ce que l'outil vérifie" inverse />

      {/* ---------------- démo ---------------- */}
      <section id="demo" className="scroll-mt-24 py-24">
        <div className="wrap">
          <div className="apparait mx-auto mb-10 max-w-2xl text-center">
            <span className="kicker">Démonstration</span>
            <h2 className="h-sec mt-5">
              Regardez l&apos;outil analyser <span className="it">une vraie annonce</span>
            </h2>
            <p className="mt-4 text-lg text-ink-2">À gauche, l&apos;annonce telle qu&apos;elle est sur Leboncoin. À droite, ce qu&apos;Utopicar vous dit en 10 secondes : le prix du marché, les défauts, le moteur, le prix à proposer.</p>
          </div>
          <Demo />
        </div>
      </section>

      {/* ---------------- ce qui est vérifié ---------------- */}
      <section className="py-20">
        <div className="wrap">
          <div className="apparait mx-auto mb-12 max-w-2xl text-center">
            <span className="kicker">Ce que l&apos;outil vérifie</span>
            <h2 className="h-sec mt-5">
              Ce qu&apos;Utopicar vérifie <span className="it">à votre place</span>
            </h2>
            <p className="mt-4 text-lg text-ink-2">Le prix du marché, les défauts, le moteur, le coût réel : ce qu&apos;un acheteur averti vérifie avant d&apos;acheter, fait en 10 secondes.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-6">
            <article className="carte apparait p-6 md:col-span-4">
              <p className="text-sm font-medium text-o2">Cote du marché</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">Le prix de l&apos;annonce, face au marché</h3>
              <p className="mt-2 text-ink-2">Même modèle, même moteur, même âge, même kilométrage. Vous voyez tout de suite si le prix est au-dessus ou en dessous.</p>
              <Link href="/cote" className="mt-2 inline-block text-sm font-medium text-o2 underline underline-offset-4">
                Voir les cotes par modèle
              </Link>
              <svg viewBox="0 0 600 200" className="mt-5 w-full" role="img" aria-label="Exemple : la cote est à 6 950 €, l'annonce à 7 400 €, au-dessus du marché.">
                <defs>
                  <linearGradient id="aire" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#ff5a1f" stopOpacity=".45" />
                    <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[160, 100, 40].map((y) => (
                  <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="rgb(244 241 236 / .08)" />
                ))}
                <path d="M0 160 C60 158 110 150 160 120 S250 30 300 34 S400 110 450 140 S560 158 600 160 Z" fill="url(#aire)" />
                <path d="M0 160 C60 158 110 150 160 120 S250 30 300 34 S400 110 450 140 S560 158 600 160" fill="none" stroke="#ff8a4c" strokeWidth="2.5" />
                <line x1="300" x2="300" y1="30" y2="170" stroke="rgb(244 241 236 / .35)" strokeDasharray="4 5" />
                <text x="306" y="24" fill="#f4f1ec" fontSize="14" className="max-sm:text-[22px]">Cote 6 950 €</text>
                <circle cx="408" cy="118" r="7" fill="#ff5a1f" />
                <text x="420" y="112" fill="#ff8a4c" fontSize="14" className="max-sm:text-[22px]">Annonce 7 400 €</text>
                <text x="4" y="194" fill="rgb(244 241 236 / .62)" fontSize="13" className="max-sm:text-[20px]">5 000 €</text>
                <text x="596" y="194" textAnchor="end" fill="rgb(244 241 236 / .62)" fontSize="13" className="max-sm:text-[20px]">9 000 €</text>
              </svg>
            </article>
            <article className="carte apparait p-6 md:col-span-2" style={{ "--i": 1 } as React.CSSProperties}>
              <p className="text-sm font-medium text-o2">Défauts dans le texte</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">Les mots qui coûtent cher</h3>
              <p className="mt-4 text-lg leading-relaxed text-ink-2">
                « Très bon état, <mark className="rounded bg-bad/20 px-1 text-ink">petit bruit embrayage</mark>, <mark className="rounded bg-bad/20 px-1 text-ink">pneus à prévoir</mark>, <mark className="rounded bg-bad/20 px-1 text-ink">prix ferme</mark>. »
              </p>
            </article>
            <article className="carte apparait p-6 md:col-span-2">
              <p className="text-sm font-medium text-o2">Moteurs et boîtes</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">Fiable ou à fuir</h3>
              <ul className="mt-4 flex flex-wrap gap-2 text-sm">
                {[
                  ["1.5 dCi", true],
                  ["1.33 VVT-i", true],
                  ["1.2 PureTech", false],
                  ["EDC", false],
                  ["DSG7", false],
                  ["1.6 TDI", true],
                ].map(([m, ok]) => (
                  <li key={m as string} className={`rounded-full border px-3 py-1 ${ok ? "border-ok/40 bg-ok/10 text-ok" : "border-bad/40 bg-bad/10 text-bad"}`}>
                    {ok ? "✓" : "✕"} {m}
                    <span className="sr-only">{ok ? " : fiable" : " : à éviter"}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="carte apparait p-6 md:col-span-2" style={{ "--i": 1 } as React.CSSProperties}>
              <p className="text-sm font-medium text-o2">Coût réel</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">Ce que la voiture va vraiment coûter</h3>
              <p className="mt-2 text-ink-2">Prix, carte grise, trajet, contrôle technique et petites réparations : un seul total, sans surprise.</p>
            </article>
            <article className="carte apparait p-6 md:col-span-2" style={{ "--i": 2 } as React.CSSProperties}>
              <p className="text-sm font-medium text-o2">Avant de vous déplacer</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">Quoi demander, quoi vérifier</h3>
              <ul className="mt-3 grid gap-2 text-ink-2">
                <li className="flex justify-between gap-2">
                  CT de moins de 6 mois <b className="text-ok">OK</b>
                </li>
                <li className="flex justify-between gap-2">
                  Carnet d&apos;entretien <b className="text-warn">À demander</b>
                </li>
                <li className="flex justify-between gap-2">
                  Rapport HistoVec <b className="text-warn">À demander</b>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ---------------- deux parcours ---------------- */}
      <section className="py-20">
        <div className="wrap">
          <div className="apparait mx-auto mb-12 max-w-2xl text-center">
            <span className="kicker">Deux façons de l&apos;utiliser</span>
            <h2 className="h-sec mt-5">
              Vous achetez pour vous, <span className="it">ou pour revendre</span>
            </h2>
            <p className="mt-4 text-lg text-ink-2">Dans les deux cas, ça commence pareil : vous collez une annonce. Ce qui change, c&apos;est ce qu&apos;Utopicar vous rend.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <article className="carte apparait flex flex-col p-7">
              <h3 className="font-display text-2xl font-semibold">Vous cherchez votre prochaine voiture</h3>
              <p className="mt-2 text-ink-2">Pas besoin de vous y connaître. Utopicar vous explique simplement ce que vaut l&apos;annonce, ce qu&apos;elle va vous coûter et ce qu&apos;il faut vérifier.</p>
              <ul className="mt-5 grid flex-1 content-start gap-2.5 text-ink-2">
                {["Un verdict clair : bonne affaire, prix correct ou à éviter", "Le coût réel d'achat, frais compris", "Que vérifier, comment négocier, faut-il y aller seul"].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <Coche />
                    {t}
                  </li>
                ))}
              </ul>
              <Link href="#essai" className="btn btn-o mt-7 w-fit">
                Coller une annonce <span aria-hidden="true">→</span>
              </Link>
            </article>
            <article className="carte apparait flex flex-col p-7" style={{ "--i": 1 } as React.CSSProperties}>
              <h3 className="font-display text-2xl font-semibold">
                Vous faites de l&apos;achat-revente <small className="ml-1 text-base font-medium text-o2">Benef</small>
              </h3>
              <p className="mt-2 text-ink-2">Pour ceux qui se lancent comme pour les professionnels : chaque annonce est chiffrée avant de vous déplacer.</p>
              <ul className="mt-5 grid flex-1 content-start gap-2.5 text-ink-2">
                {["Marge nette, prix d'offre et prix à ne pas dépasser", "Historique des rapports et tableau de bord", "Gestion du parc pour les professionnels"].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <Coche />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/benef#essai" className="btn btn-o w-fit">
                  Chiffrer une annonce
                </Link>
                <Link href="/benef" className="btn w-fit">
                  Découvrir Benef
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ---------------- comment ça marche ---------------- */}
      <section className="py-20">
        <div className="wrap">
          <div className="apparait mx-auto mb-12 max-w-2xl text-center">
            <span className="kicker">Comment ça marche</span>
            <h2 className="h-sec mt-5">
              Vous collez l&apos;annonce, <span className="it">Utopicar fait le reste</span>
            </h2>
          </div>
          <ol className="grid gap-5 md:grid-cols-3">
            {ETAPES.map((e, i) => (
              <li key={e.t} className="carte apparait flex flex-col p-6" style={{ "--i": i } as React.CSSProperties}>
                <span className="font-display text-sm font-semibold text-o2">Étape {i + 1}</span>
                <h3 className="mt-2 font-display text-xl font-semibold">{e.t}</h3>
                <p className="mt-2 text-ink-2">{e.d}</p>
                <div className="mt-5 rounded-2xl border border-line bg-black/25 p-4 text-sm" aria-hidden="true">
                  {e.v}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- formules particuliers ---------------- */}
      <section id="formules" className="scroll-mt-24 py-20">
        <div className="wrap">
          <div className="apparait mx-auto mb-12 max-w-2xl text-center">
            <span className="kicker">Formules</span>
            <h2 className="h-sec mt-5">
              Commencez gratuitement, <span className="it">sans carte bancaire</span>
            </h2>
            <p className="mt-4 text-lg text-ink-2">
              Vous faites de l&apos;achat-revente ? Les formules Benef sont <Link href="/tarifs#benef" className="text-o2 underline underline-offset-4">sur la page Tarifs</Link>.
            </p>
          </div>
          <CartesOffres ids={PARTICULIERS} actuelle={compte?.offre.id} credits />
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="scroll-mt-24 py-20">
        <div className="wrap">
          <div className="apparait mx-auto mb-12 max-w-2xl text-center">
            <span className="kicker">Questions fréquentes</span>
            <h2 className="h-sec mt-5">
              Les réponses à <span className="it">vos questions</span>
            </h2>
          </div>
          <Faq
            questions={[
              { cat: "Prix", q: "L'analyse est-elle vraiment gratuite ?", r: <p>Oui, la première analyse est offerte, sans carte bancaire : il suffit de créer un compte. Pour analyser plusieurs annonces, la formule Essentiel coûte 4,99 € par mois, sans engagement. Sans abonnement, vous pouvez aussi acheter des crédits à l&apos;unité, dès 2,99 € l&apos;analyse.</p> },
              { cat: "Annonces", q: "Ça marche sur quelles voitures ?", r: <p>Sur les annonces de voitures particulières de Leboncoin, La Centrale ou AutoScout24 : il suffit de copier le texte de la page. La cote est la plus précise sur les modèles courants. Sur un modèle rare, l&apos;outil vous prévient que l&apos;estimation est moins sûre.</p> },
              { cat: "Fiabilité", q: "Est-ce que ça remplace un garagiste ?", r: <p>Non. L&apos;outil vous évite les mauvais déplacements et vous donne un prix de départ. Il sépare ce qui est écrit dans l&apos;annonce de ce qui reste à vérifier sur place, et vous dit quoi regarder. Pour une voiture chère ou un doute mécanique, il vous conseille de la faire inspecter.</p> },
              { cat: "Lien ou texte", q: "Je colle le lien, ou tout le texte ?", r: <p>Sur Leboncoin, le lien suffit : l&apos;annonce et ses photos sont récupérées toutes seules. Sur les autres sites, copiez la page entière (Ctrl+A, Ctrl+C) et collez-la : le titre, le prix, le kilométrage et la description sont lus dans le texte.</p> },
              { cat: "Vendeurs", q: "Ça marche aussi sur une annonce de professionnel ?", r: <p>Oui. L&apos;outil lit le type de vendeur et en tient compte : un professionnel vend plus cher mais doit une garantie, un particulier vend « en l&apos;état ». Le prix à proposer et les questions à poser changent en conséquence.</p> },
              { cat: "Délai", q: "Combien de temps dure une analyse ?", r: <p>L&apos;aperçu (cote, défauts lus dans le texte, moteur) s&apos;affiche en 2 secondes. Le rapport complet, qui lit aussi les photos et rédige les questions au vendeur, prend environ une minute.</p> },
              { cat: "Abonnement", q: "Comment résilier ?", r: <p>En deux clics depuis votre compte, à tout moment. Vous gardez l&apos;accès jusqu&apos;à la fin du mois déjà payé.</p> },
              { cat: "Données", q: "Que faites-vous de mes informations ?", r: <p>Votre email sert à votre compte, vos analyses restent privées. Pas de revente de données, pas de publicité. Détails dans la <Link href="/legal#confidentialite" className="text-o2 underline underline-offset-4">politique de confidentialité</Link>.</p> },
            ]}
          />
        </div>
      </section>

      {/* ---------------- appel final ---------------- */}
      <section className="py-16 text-center">
        <div className="wrap">
          <div className="carte apparait mx-auto max-w-3xl px-6 py-14">
            <Symbole className="mx-auto h-10 w-auto" />
            <h2 className="h-sec mt-6">
              Votre prochaine voiture, <span className="it">au bon prix</span>
            </h2>
            <p className="mt-3 text-lg text-ink-2">Première analyse offerte, résultat en quelques secondes.</p>
            <Link href="#essai" className="btn btn-o mt-8">
              Analyser une annonce <span aria-hidden="true">→</span>
            </Link>
            <p className="mx-auto mt-10 flex w-fit items-center gap-3 text-left text-sm text-ink-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-o/15 font-display text-o2" aria-hidden="true">
                Y
              </span>
              <span>
                Derrière l&apos;outil : <b className="text-ink">Yacine</b>, qui l&apos;utilise pour ses propres achats-reventes.
              </span>
            </p>
          </div>
        </div>
      </section>
      <JsonLdFaq questions={FAQ_TEXTE} />
    </>
  );
}
