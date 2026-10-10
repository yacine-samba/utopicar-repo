import Link from "next/link";
import { cx } from "@/lib/cx";
import { EXEMPLES } from "@/lib/demo";
import { OFFRES, PACKS, prixTxt, type Offre, type OffreId } from "@/lib/offres";

/* « Pourquoi m'abonner ? » : ce que la formule rapporte avant ce qu'elle coûte, puis ce qu'elle débloque, ligne par ligne.
   Tout est vrai et vérifiable :
   - les droits viennent des formules (lib/offres.ts) ;
   - les gains viennent des vrais résultats de l'outil : l'annonce Clio de la démonstration (prix demandé, prix à proposer),
     les coûts de réparation des règles de défauts (embrayage 500 à 900 €), les scénarios du calculateur Benef. */

const e = (v: number) => `${Math.round(v).toLocaleString("fr-FR").replace(/ /g, " ")} €`;
type Cellule = boolean | string;
type Ligne = { l: string; v: (o: Offre) => Cellule };

const PARTICULIER: Ligne[] = [
  { l: "Analyses", v: (o) => (o.parMois ? `${o.analyses} par mois` : `${o.analyses} offerte`) },
  { l: "Verdict et coût réel d'achat", v: () => true },
  { l: "Prix à proposer au vendeur", v: (o) => o.detail !== "simple" },
  { l: "Questions à poser au vendeur", v: (o) => o.detail !== "simple" },
  { l: "Prix du marché détaillé et fiabilité du moteur", v: (o) => o.detail !== "simple" },
  { l: "Analyse des photos", v: (o) => (o.photos ? `${o.photos} par annonce` : false) },
  { l: "Cote détaillée de chaque modèle", v: (o) => o.prix > 0 },
  { l: "Historique de vos analyses", v: (o) => (o.historique === Infinity ? "toutes" : o.historique > 1 ? `${o.historique} dernières` : "la dernière") },
];

const BENEF: Ligne[] = [
  { l: "Analyses par mois", v: (o) => String(o.analyses) },
  { l: "Marge nette, prix d'offre et plafond", v: () => true },
  { l: "Message et arguments de négociation", v: () => true },
  { l: "Photos analysées par annonce", v: (o) => String(o.photos) },
  { l: "Cote détaillée de chaque modèle", v: () => true },
  { l: "Historique des rapports", v: (o) => (o.historique === Infinity ? "complet" : `${o.historique} derniers`) },
  { l: "Comparateur de rapports", v: (o) => o.comparateur },
  { l: "Recherche Leboncoin sous la cote et alertes", v: (o) => o.recherche },
  { l: "Parc, stock et marges réelles", v: (o) => o.parc },
  { l: "Guides inclus", v: (o) => (o.id === "starter" ? "1" : "les 3") },
];

/** Les gains, chiffrés à partir des vrais résultats de l'outil. */
function gains(famille: "particulier" | "benef") {
  if (famille === "particulier") {
    const clio = EXEMPLES.clio;
    const proposer = clio.lignes[3].v ?? clio.prix;
    const negocie = clio.prix - proposer;
    const ess = OFFRES.essentiel.prix;
    return [
      { v: e(negocie), l: "à négocier sur la Clio de l'exemple", s: `affichée ${e(clio.prix)}, prix conseillé ${e(proposer)}`, ton: "ok" as const },
      { v: "500 à 900 €", l: "évités si l'embrayage est à refaire", s: "repéré dans le texte de l'annonce, avant de vous déplacer", ton: "ok" as const },
      { v: `${prixTxt(ess)} / mois`, l: "pour la formule Essentiel", s: `cette seule négociation paie ${Math.floor(negocie / ess)} mois d'abonnement`, ton: "o" as const },
    ];
  }
  // scénarios du calculateur : Clio bien achetée (5 000 + 630 → 6 300) et embrayage oublié (frais 1 430)
  const bonne = 6300 - 5000 - 630;
  const ratee = 6300 - 5000 - 1430;
  const starter = OFFRES.starter.prix;
  return [
    { v: `+${e(bonne)}`, l: "de marge sur une Clio bien achetée", s: "achetée 5 000 €, 630 € de frais, revendue 6 300 €", ton: "ok" as const },
    { v: ratee < 0 ? `−${e(-ratee)}` : e(ratee), l: "si l'embrayage à refaire passe inaperçu", s: "la même voiture : la marge disparaît", ton: "bad" as const },
    { v: `${prixTxt(starter)} / mois`, l: "pour la formule Starter", s: `rentabilisée ${Math.floor(bonne / starter)} fois par une seule voiture bien achetée`, ton: "o" as const },
  ];
}

function Valeur({ c }: { c: Cellule }) {
  if (c === true)
    return (
      <span className="font-bold text-ok">
        ✓<span className="sr-only"> inclus</span>
      </span>
    );
  if (c === false)
    return (
      <span className="text-ink-3">
        –<span className="sr-only"> non inclus</span>
      </span>
    );
  return <span className="font-medium">{c}</span>;
}

export function GainsAbonnement({ famille, ids, credits = false, lien }: { famille: "particulier" | "benef"; ids: OffreId[]; credits?: boolean; lien: string }) {
  const offres = ids.map((id) => OFFRES[id]);
  const lignes = famille === "particulier" ? PARTICULIER : BENEF;
  return (
    <div className="grid gap-8">
      {/* 1. ce que ça rapporte, avant ce que ça coûte */}
      <ul className="grid gap-3 sm:grid-cols-3">
        {gains(famille).map((g) => (
          <li key={g.l} className={cx("vue carte flex flex-col gap-1 p-5", g.ton === "o" && "border-o/50 bg-[linear-gradient(160deg,rgb(255_90_31/0.12),transparent_60%),var(--color-panel)]")}>
            <span className={cx("num font-display text-3xl font-semibold tracking-tight sm:text-4xl", g.ton === "ok" && "text-ok", g.ton === "bad" && "text-bad", g.ton === "o" && "text-o2")}>{g.v}</span>
            <span className="font-medium">{g.l}</span>
            <span className="text-sm text-ink-3">{g.s}</span>
          </li>
        ))}
      </ul>

      {/* 2. ce que chaque formule débloque, ligne par ligne */}
      <div tabIndex={0} role="region" aria-label="Comparatif des formules (faire défiler sur téléphone)" className="vue carte overflow-x-auto p-0">
        {/* compact sur téléphone : les colonnes des formules restent visibles sans défiler sur le côté */}
        <table className="w-full min-w-[300px] border-collapse text-xs sm:text-sm">
          <caption className="sr-only">Ce que chaque formule inclut</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="p-2.5 text-left font-normal text-ink-3 sm:p-4">
                Ce que vous obtenez
              </th>
              {offres.map((o) => (
                <th key={o.id} scope="col" className={cx("w-[22%] p-2 text-center align-bottom sm:w-auto sm:p-4", o.miseEnAvant && "bg-o/8")}>
                  {o.miseEnAvant && <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-o2 sm:text-[11px]">Conseillé</span>}
                  <span className="block font-display text-sm font-semibold sm:text-base">{o.nom}</span>
                  <span className="num block font-display text-base font-semibold sm:text-xl">{o.prix ? prixTxt(o.prix) : "0 €"}</span>
                  <span className="block text-xs font-normal text-ink-3">{o.prix ? "par mois" : "sans carte"}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.l} className="border-b border-line last:border-0">
                <th scope="row" className="p-2.5 text-left font-normal text-ink-2 sm:p-3 sm:pl-4">
                  {l.l}
                </th>
                {offres.map((o) => (
                  <td key={o.id} className={cx("p-2 text-center sm:p-3", o.miseEnAvant && "bg-o/8")}>
                    <Valeur c={l.v(o)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-center">
        <Link href="#essai" className="btn btn-o">
          {famille === "particulier" ? "Essayer gratuitement" : "Chiffrer une annonce gratuitement"}
        </Link>
        <Link href={lien} className="btn">
          Tout comparer
        </Link>
      </div>
      <p className="-mt-4 text-center text-sm text-ink-3">
        Sans engagement, résiliable en deux clics.
        {credits && <> Sans abonnement : {prixTxt(PACKS[0].prix)} l&apos;analyse.</>}
      </p>
    </div>
  );
}
