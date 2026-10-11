import Link from "next/link";
import { cx } from "@/lib/cx";
import { EXEMPLES } from "@/lib/demo";
import { OFFRES, PACKS, prixTxt, type OffreId } from "@/lib/offres";

/* Les tarifs, sans liste de fonctionnalités : pour chaque formule, son prix et ce qu'elle rapporte vraiment.
   Les gains viennent des vrais résultats de l'outil : l'annonce Clio de la démonstration (prix demandé contre prix
   à proposer) et le premier scénario du calculateur Benef (Clio achetée 5 000 €, 630 € de frais, revendue 6 300 €).
   Le détail des fonctionnalités reste sur la page Tarifs. */

const e = (v: number) => `${Math.round(v).toLocaleString("fr-FR").replace(/ /g, " ")} €`;
type Carte = { cle: string; nom: string; prix: string; unite: string; gain: string; detail: string; fort?: boolean };

function cartes(famille: "particulier" | "benef", ids: OffreId[], credits: boolean): Carte[] {
  if (famille === "particulier") {
    const clio = EXEMPLES.clio;
    const negocie = clio.prix - (clio.lignes[3].v ?? clio.prix);
    const liste: Carte[] = ids.map((id) => {
      const o = OFFRES[id];
      if (!o.prix) return { cle: id, nom: o.nom, prix: "0 €", unite: "sans carte", gain: "Vaut-elle le déplacement ?", detail: "1 analyse offerte : le verdict et le coût réel d'achat, avant d'y aller." };
      return {
        cle: id, nom: o.nom, prix: prixTxt(o.prix), unite: "par mois", fort: o.miseEnAvant,
        gain: `${e(negocie)} négociés`,
        detail: `Le prix à proposer, comme sur la Clio de l'exemple. Une seule négociation paie ${Math.floor(negocie / o.prix)} mois.`,
      };
    });
    if (credits) liste.push({ cle: "credits", nom: "À l'unité", prix: prixTxt(PACKS[0].prix), unite: "l'analyse", gain: "Juste quand il faut", detail: "Sans abonnement : une analyse complète pour l'annonce qui vous plaît." });
    return liste;
  }
  const marge = 6300 - 5000 - 630;
  const pourquoi: Record<string, string> = {
    starter: "30 annonces chiffrées par mois : marge nette, prix d'offre et plafond avant d'appeler.",
    croissance: "100 annonces par mois et le comparateur : vous ne gardez que les GO.",
    pro: "La recherche sous la cote, les alertes et le parc : repérer avant les autres, suivre la marge réelle.",
  };
  return ids.map((id) => {
    const o = OFFRES[id];
    return { cle: id, nom: o.nom, prix: prixTxt(o.prix), unite: "par mois", fort: o.miseEnAvant, gain: `Rentabilisé ${Math.floor(marge / o.prix)} fois`, detail: `${pourquoi[id] ?? ""} Une seule voiture bien achetée rapporte ${e(marge)}.` };
  });
}

export function GainsAbonnement({ famille, ids, credits = false, lien }: { famille: "particulier" | "benef"; ids: OffreId[]; credits?: boolean; lien: string }) {
  const liste = cartes(famille, ids, credits);
  return (
    <div className="grid gap-6">
      <ul className={cx("grid gap-3", liste.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
        {liste.map((c) => (
          <li key={c.cle} className={cx("vue carte relative flex flex-col p-6", c.fort && "border-o/60 bg-[linear-gradient(160deg,rgb(255_90_31/0.14),transparent_60%),var(--color-panel)]")}>
            {c.fort && <span className="absolute right-5 top-5 rounded-full bg-o px-2.5 py-0.5 text-xs font-bold text-[#160904]">Conseillé</span>}
            <span className="text-sm font-medium text-ink-2">{c.nom}</span>
            <span className="mt-1 flex items-baseline gap-1.5">
              <span className="num font-display text-3xl font-semibold tracking-tight">{c.prix}</span>
              <span className="text-sm text-ink-3">{c.unite}</span>
            </span>
            {/* ce que la formule rapporte, en premier */}
            <span className="mt-5 font-display text-2xl font-semibold leading-tight text-ok">{c.gain}</span>
            <span className="mt-2 text-sm text-ink-2">{c.detail}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-center gap-3 text-center">
        <Link href="#essai" className="btn btn-o">
          {famille === "particulier" ? "Essayer gratuitement" : "Chiffrer une annonce gratuitement"}
        </Link>
        <Link href={lien} className="btn">
          Le détail des formules
        </Link>
      </div>
      <p className="-mt-2 text-center text-sm text-ink-3">Sans engagement, résiliable en deux clics.</p>
    </div>
  );
}
