import type { Compte } from "./compte";
import { familleEspace, navEspace, nomFormule, texteRestantes, type Icone } from "./espace";
import { ILLIMITE, OFFRES } from "./offres";

/* Visite de bienvenue : ce que l'on montre à quelqu'un qui vient de s'abonner et d'arriver dans l'espace.
   Les données viennent de la formule et du menu réellement affiché (jamais une fonction verrouillée). */

export type EntreeVisite = { href: string; label: string; icone: Icone; desc: string };
export type DonneesBienvenue = {
  prenom: string;
  formule: string;
  benef: boolean;
  restantes: string;
  avantages: string[];
  visite: EntreeVisite[];
  extension: boolean;
};

const DESC_PARTICULIER: Partial<Record<Icone, string>> = {
  analyser: "Collez le lien d'une annonce : verdict, prix à proposer, défauts connus du moteur et questions à poser au vendeur.",
  rapports: "Chaque analyse est gardée. Vous les retrouvez, les comparez et les partagez par lien.",
  favoris: "Les annonces que vous gardez de côté, avec leur prix suivi.",
  credits: "Des analyses en plus à l'unité, si vous dépassez votre quota du mois.",
  compte: "Votre profil d'analyse, votre formule et vos factures.",
};
const DESC_BENEF: Partial<Record<Icone, string>> = {
  analyser: "Collez une annonce : marge nette, prix d'offre, plafond à ne pas dépasser et travaux probables.",
  rapports: "Tous vos rapports chiffrés, triés par marge, avec comparaison côte à côte selon la formule.",
  parc: "Vos achats, frais et ventes : la marge réelle de chaque voiture.",
  recherche: "Les annonces Leboncoin d'un modèle, classées sous la cote, avec alertes par e-mail.",
  messages: "Le premier message aux vendeurs, envoyé pour vous.",
  estimation: "La cote d'un modèle : prix médian, fourchette et délai de vente.",
  cote: "La cote du marché d'un modèle, avec son graphique.",
  favoris: "Les annonces que vous gardez de côté, avec leur prix suivi.",
  compte: "Votre profil d'analyse, votre formule et vos factures.",
};

export function donneesBienvenue(c: Compte): DonneesBienvenue {
  const benef = familleEspace(c) === "benef";
  const o = c.illimite ? ILLIMITE : OFFRES[c.offre.id] ?? c.offre;
  const desc = benef ? DESC_BENEF : DESC_PARTICULIER;
  const visite = navEspace(c)
    .filter((e) => !e.verrou && e.icone !== "accueil" && e.icone !== "admin" && e.icone !== "extension" && desc[e.icone])
    .map((e) => ({ href: e.href, label: e.icone === "compte" ? "Profil et paramètres" : e.label, icone: e.icone, desc: desc[e.icone]! }))
    .slice(0, 6);
  return {
    prenom: c.prenom,
    formule: nomFormule(c),
    benef,
    restantes: texteRestantes(c),
    avantages: o.points.filter((p) => !p.endsWith(":")).slice(0, 4),
    visite,
    extension: c.illimite,
  };
}
