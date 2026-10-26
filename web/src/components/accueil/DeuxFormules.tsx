import Link from "next/link";
import { EXEMPLES } from "@/lib/demo";
import { GARANTIE, OFFRES, PACKS, prixTxt } from "@/lib/offres";
import { BoutonAbonner } from "@/components/site/BoutonAbonner";

/* Les deux formules particuliers en deux grands champs de couleur qui se touchent : Découverte à gauche, Essentiel,
   plus large, à droite (la largeur dit laquelle compte, sans badge). Ce que la formule rapporte vient de l'annonce Clio
   de la démonstration (prix demandé contre prix à proposer). L'analyse à l'unité est dite en une ligne dessous. */

const clio = EXEMPLES.clio;
const negocie = clio.prix - (clio.lignes[3].v ?? clio.prix);
const d = OFFRES.gratuit;
const e = OFFRES.essentiel;

export function DeuxFormules() {
  return (
    <div>
      <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-labelledby="formule-decouverte" className="apparait flex min-h-[64svh] flex-col bg-champ-fort p-6 text-[#f4f1ec] sm:p-10 md:min-h-[78svh]">
          <h3 id="formule-decouverte" className="font-display text-[clamp(44px,5vw,76px)] font-medium leading-none tracking-[-0.035em]">
            {d.nom}
          </h3>
          <p className="mt-5 max-w-[26ch] text-[20px] leading-snug text-[#f4f1ec]/80">{d.pour}</p>
          <p className="mt-6 max-w-[38ch] text-[17px] text-[#f4f1ec]/80">Une analyse complète offerte, sans carte : le verdict, le coût réel d&apos;achat et les trois points à vérifier.</p>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-12">
            <p className="num font-display text-[clamp(72px,10vw,150px)] font-medium leading-[0.8] tracking-[-0.04em]">
              0&nbsp;€
            </p>
            <Link href="#essai" className="btn bg-[#f4f1ec] text-[#160904] hover:bg-white">
              Essayer gratuitement
            </Link>
          </div>
        </section>
        <section aria-labelledby="formule-essentiel" className="apparait flex min-h-[64svh] flex-col bg-o p-6 text-[#160904] sm:p-10 md:min-h-[78svh]" style={{ "--i": 1 } as React.CSSProperties}>
          <h3 id="formule-essentiel" className="font-display text-[clamp(44px,5vw,76px)] font-medium leading-none tracking-[-0.035em]">
            {e.nom}
          </h3>
          <p className="mt-5 max-w-[26ch] text-[20px] leading-snug">{e.pour}</p>
          <p className="mt-6 max-w-[44ch] text-[17px]">
            {e.analyses} analyses par mois, le prix à proposer et les questions au vendeur. Sur la Clio de l&apos;exemple, le prix à proposer fait {prixTxt(negocie)} de moins : une seule négociation paie {Math.floor(negocie / e.prix)} mois.
          </p>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-12">
            <p className="num font-display text-[clamp(72px,10vw,150px)] font-medium leading-[0.8] tracking-[-0.04em]">
              {prixTxt(e.prix).replace(" €", "")}
              <span className="ml-2 text-[20px] font-medium tracking-normal">€ par mois</span>
            </p>
            <BoutonAbonner produit={e.id} className="btn bg-[#160904] text-[#f4f1ec] hover:bg-black">
              Choisir {e.nom}
            </BoutonAbonner>
          </div>
        </section>
      </div>
      <p className="wrap mt-6 text-[17px] text-ink-2">
        Sans engagement{GARANTIE ? `, remboursé sous ${GARANTIE.jours} jours` : ""}. Une seule annonce en tête ? {prixTxt(PACKS[0].prix)} l&apos;analyse, sans abonnement.{" "}
        <Link href="/tarifs" className="font-medium text-o2 underline underline-offset-4">
          Toutes les formules
        </Link>
      </p>
    </div>
  );
}
