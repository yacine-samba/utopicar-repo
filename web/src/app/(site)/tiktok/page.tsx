import type { Metadata } from "next";
import Link from "next/link";
import { Calculateur } from "@/components/benef/Calculateur";

// Page d'arrivée du lien en bio TikTok : elle reprend la vidéo « 47 € » (la Polo) et mène à l'analyse offerte.
// Les visites se lisent dans Vercel Analytics sur le chemin /tiktok.
export const metadata: Metadata = {
  title: "1 500 € prévus, 47 € encaissés : le calcul à faire avant d'acheter",
  description: "Calculez votre prix maximum avant d'appeler le vendeur, puis analysez l'annonce. Première analyse offerte, sans carte bancaire.",
  robots: { index: false },
};

// Les chiffres de la vidéo : achat 3 500 €, frais et attente 1 053 €, revendue 4 600 € → 47 €.
// Le calcul à l'envers : 5 000 − 1 450 − 800 = 2 750 € de prix max.
const EXEMPLES = [
  { l: "La Polo de la vidéo", a: 3500, f: 1053, r: 4600 },
  { l: "Achetée au prix max", a: 2750, f: 1450, r: 5000 },
  { l: "Petite citadine", a: 2800, f: 450, r: 3700 },
];

const Coche = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true" className="text-ok">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

export default function TikTok() {
  return (
    <>
      <section className="relative overflow-hidden pb-14 pt-14 text-center sm:pt-20">
        <div className="wrap">
          <span className="kicker arrivee">Vu sur TikTok · achat-revente auto</span>
          <h1 className="arrivee mx-auto mt-6 max-w-[16ch] font-display text-[clamp(36px,6.4vw,72px)] font-semibold leading-[1.03] tracking-[-0.03em]" style={{ "--i": 1 } as React.CSSProperties}>
            1 500 € prévus. <span className="it">47 € encaissés.</span>
          </h1>
          <p className="arrivee mx-auto mt-6 max-w-2xl text-lg text-ink-2 sm:text-xl" style={{ "--i": 2 } as React.CSSProperties}>
            « Revente moins achat », c&apos;est le calcul qui fait perdre la première voiture. Ceux qui gagnent le font à l&apos;envers, avant d&apos;appeler le vendeur. Faites-le ici avec vos chiffres.
          </p>
          <div className="arrivee mt-9 flex flex-wrap justify-center gap-3" style={{ "--i": 3 } as React.CSSProperties}>
            <Link href="#calcul" className="btn btn-o">
              Calculer mon prix max <span aria-hidden="true">↓</span>
            </Link>
            <Link href="/analyse" className="btn">
              Analyser une annonce
            </Link>
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
          </ul>
        </div>
      </section>

      <section id="calcul" className="scroll-mt-24 py-16">
        <div className="wrap">
          <div className="apparait mx-auto mb-10 max-w-2xl text-center">
            <span className="kicker">Le calcul à l&apos;envers</span>
            <h2 className="h-sec mt-5">
              Revente − frais − marge voulue <span className="it">= votre prix max</span>
            </h2>
            <p className="mt-4 text-lg text-ink-2">
              Dans la vidéo : 5 000 − 1 450 − 800 = 2 750 €. L&apos;annonce était à 3 500 € : il fallait passer son tour. Bougez les curseurs, ou partez des exemples.
            </p>
          </div>
          <Calculateur scenarios={EXEMPLES} />
        </div>
      </section>

      <section className="py-16">
        <div className="wrap">
          <div className="apparait mx-auto max-w-3xl">
            <div className="carte grid gap-5 p-7 sm:p-9">
              <span className="kicker w-fit">Vous avez une annonce en tête ?</span>
              <h2 className="font-display text-[clamp(26px,4vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em]">
                Collez-la. Utopicar fait le calcul <span className="it">à votre place.</span>
              </h2>
              <p className="text-lg text-ink-2">
                Cote tirée des annonces réellement en ligne, défauts qui coûtent cher, moteurs à éviter, coût réel et points à vérifier avant de vous déplacer. La première analyse est offerte.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/analyse" className="btn btn-o">
                  Analyser mon annonce <span aria-hidden="true">→</span>
                </Link>
                <Link href="/guide?guide=premiere-revente" className="btn">
                  Lire le guide de la première revente
                </Link>
              </div>
              <p className="text-sm text-ink-3">
                Pour chiffrer chaque annonce en marge nette et prix d&apos;offre : <Link href="/benef" className="text-o2 underline underline-offset-4">découvrir Benef</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
