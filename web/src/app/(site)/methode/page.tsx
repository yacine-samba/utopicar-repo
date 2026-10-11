import type { Metadata } from "next";
import Link from "next/link";
import { supabaseService } from "@/lib/supabase/service";
import type { Justesse } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Comment l'analyse est faite",
  description: "Méthode de l'analyse Utopicar : fiabilité du moteur, travaux à prévoir, prix face au marché, bénéfice ou coût mensuel. Sources, limites, neutralité et mesure de justesse.",
};
// la mesure de justesse change lentement : recalculée une fois par jour
export const revalidate = 86400;

async function mesure(): Promise<Justesse["tranches"]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const { data, error } = await supabaseService().rpc("justesse_analyse");
    return error ? null : ((data as Justesse).tranches ?? null);
  } catch {
    return null;
  }
}

const QUESTIONS = [
  ["Fiable ?", "La réputation du moteur et de la boîte de cette version précise, années comprises (une soixantaine de fiches, de la citadine à la sportive), le kilométrage face à la durée de vie habituelle de ce moteur, l'âge, l'entretien prouvé et les pièces déjà refaites."],
  ["Des travaux ?", "Ce qui est écrit dans l'annonce, ce que montrent les photos, l'entretien arrivé à échéance (distribution, embrayage, révision) et le risque connu du moteur, chacun avec sa probabilité. Vous voyez un montant probable et une fourchette."],
  ["Bon prix ?", "Le prix affiché comparé aux annonces du même modèle réellement en ligne (même génération, même énergie, kilométrage proche), ramenées à l'année et au kilométrage de la voiture."],
  ["Ça rapporte ? / Combien par mois ?", "Pour revendre : le bénéfice dans trois rythmes de revente, tous frais comptés, et le prix à ne pas dépasser. Pour rouler avec : la perte de valeur mesurée sur les annonces du modèle, l'entretien et les travaux probables."],
];

export default async function Methode() {
  const tranches = await mesure();
  const t1 = tranches?.find((x) => x.t === 1);
  const t3 = tranches?.find((x) => x.t === 3);
  const disparues = tranches?.reduce((s, x) => s + x.disparues, 0) ?? 0;
  return (
    <div className="wrap py-14">
      <div className="mx-auto max-w-3xl">
        <span className="kicker">Méthode</span>
        <h1 className="h-sec mt-5">
          Comment l&apos;analyse <span className="it">est faite</span>
        </h1>
        <p className="mt-4 text-lg text-ink-2">
          Avant même le premier message au vendeur, Utopicar répond à quatre questions avec ce que l&apos;on sait : l&apos;annonce, ses photos et le marché. Chaque note dit pourquoi, chaque chiffre dit d&apos;où il vient.
        </p>

        <section className="mt-12 grid gap-4" aria-labelledby="m-questions">
          <h2 id="m-questions" className="font-display text-2xl font-semibold">Quatre questions, une note</h2>
          <ul className="grid gap-3">
            {QUESTIONS.map(([q, r]) => (
              <li key={q} className="carte p-5">
                <b className="font-display text-lg">{q}</b>
                <p className="mt-1 text-ink-2">{r}</p>
              </li>
            ))}
          </ul>
          <p className="text-ink-2">
            La note sur 100 pèse ces quatre réponses selon votre projet : pour revendre, le bénéfice compte le plus ; pour rouler avec, la fiabilité et les travaux. Elle ne déclare jamais une voiture « hors cible » : une citadine à 3 000 € et une sportive à 40 000 € s&apos;analysent de la même façon. Ce qui limite la note est écrit en clair.
          </p>
        </section>

        <section className="mt-12 grid gap-4" aria-labelledby="m-roles">
          <h2 id="m-roles" className="font-display text-2xl font-semibold">Ce que fait l&apos;outil, ce que fait l&apos;IA</h2>
          <p className="text-ink-2">
            Tous les calculs d&apos;argent (cote, travaux, bénéfice, prix à proposer) et toutes les notes sont faits par l&apos;outil, avec des règles fixes et vérifiables. L&apos;IA lit ce que les règles ne lisent pas : les photos (chocs, teinte différente, compteur), la version exacte du moteur, les documents photographiés. Elle n&apos;écrit jamais une note ni un prix.
          </p>
        </section>

        <section className="mt-12 grid gap-4" aria-labelledby="m-annonce">
          <h2 id="m-annonce" className="font-display text-2xl font-semibold">Une annonce douteuse est signalée</h2>
          <p className="text-ink-2">
            Paiement par coupon ou mandat, vendeur à l&apos;étranger, acompte demandé avant la visite, prix très en dessous du marché sans explication, compteur en photo différent de l&apos;annonce, même voiture vue ailleurs à un autre prix : chaque signal est expliqué, avec ce qu&apos;il faut demander. L&apos;historique de l&apos;annonce (jours en ligne, baisses de prix) vient de notre base du marché.
          </p>
        </section>

        <section className="mt-12 grid gap-4" aria-labelledby="m-mesure">
          <h2 id="m-mesure" className="font-display text-2xl font-semibold">Est-ce que ça marche ? On le mesure</h2>
          <p className="text-ink-2">
            Une voiture bien placée face au marché doit partir plus vite. Nous le vérifions sur les annonces qui disparaissent de Leboncoin (vendues ou retirées), selon leur position face à la cote.
          </p>
          {t1?.jours_median != null && t3?.jours_median != null ? (
            <div className="carte grid gap-3 p-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-ink-3">8 % ou plus sous la cote</p>
                <p className="num font-display text-3xl font-semibold text-ok">{t1.jours_median} jours</p>
                <p className="text-sm text-ink-3">en ligne (médiane) · {t1.pct_15j ?? "—"} % partent en 15 jours</p>
              </div>
              <div>
                <p className="text-sm text-ink-3">Au prix de la cote</p>
                <p className="num font-display text-3xl font-semibold">{t3.jours_median} jours</p>
                <p className="text-sm text-ink-3">en ligne (médiane) · {t3.pct_15j ?? "—"} % partent en 15 jours</p>
              </div>
              <p className="text-xs text-ink-3 sm:col-span-2">Mesuré sur {disparues.toLocaleString("fr-FR")} annonces disparues de notre base, mis à jour chaque jour. Échantillon encore modeste : les chiffres se précisent à mesure que la base grandit.</p>
            </div>
          ) : (
            <p className="text-sm text-ink-3">La mesure s&apos;affichera ici dès que la base aura assez d&apos;annonces disparues.</p>
          )}
          <p className="text-ink-2">Chaque rapport permet aussi de nous dire « ce chiffre est faux » : prix de vente réel, devis du garage, défaut constaté. Ces retours servent à régler l&apos;analyse.</p>
        </section>

        <section className="mt-12 grid gap-4" aria-labelledby="m-neutre">
          <h2 id="m-neutre" className="font-display text-2xl font-semibold">Neutre, et honnête sur ses limites</h2>
          <ul className="grid list-disc gap-2 pl-5 text-ink-2 marker:text-o2">
            <li>Aucune commission sur les ventes, aucun partenariat garage ou vendeur : nous ne gagnons rien à ce que vous achetiez une voiture plutôt qu&apos;une autre.</li>
            <li>Quand il manque une information, l&apos;analyse dit « À creuser » et vous donne les questions à poser, plutôt que de faire semblant de savoir.</li>
            <li>Les réputations de moteurs sont des tendances documentées, pas un diagnostic : un moteur fragile bien entretenu peut être une bonne affaire.</li>
            <li>Aucune analyse ne remplace l&apos;essai, la lecture des papiers et, au moindre doute, l&apos;avis d&apos;un mécanicien.</li>
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/analyse" className="btn btn-o">
            Analyser une annonce
          </Link>
          <Link href="/tarifs" className="btn">
            Voir les formules
          </Link>
        </div>
      </div>
    </div>
  );
}
