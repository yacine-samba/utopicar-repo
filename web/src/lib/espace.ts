import type { Compte } from "./compte";
import type { Famille } from "./offres";

export type Icone = "accueil" | "analyser" | "rapports" | "parc" | "rentabilite" | "comparer" | "recherche" | "guide" | "compte";
export type EntreeNav = { href: string; label: string; court: string; icone: Icone; verrou?: string; mobile?: boolean };

/** Espace affiché : la famille de la formule payée (ou offerte), sinon l'usage choisi à l'inscription. */
export const familleEspace = (c: Compte): Famille => (c.offre.prix > 0 || c.offerte ? c.offre.famille : (c.famille ?? "particulier"));

/** Menu de l'espace connecté. `mobile` : présent dans la barre du bas du téléphone (5 au plus). */
export function navEspace(c: Compte): EntreeNav[] {
  const o = c.offre;
  if (familleEspace(c) === "particulier")
    return [
      { href: "/app", label: "Accueil", court: "Accueil", icone: "accueil", mobile: true },
      { href: "/app/analyser", label: "Analyser une annonce", court: "Analyser", icone: "analyser", mobile: true },
      { href: "/app/rapports", label: "Mes analyses", court: "Analyses", icone: "rapports", mobile: true },
      { href: "/app/guides", label: "Guides", court: "Guides", icone: "guide", mobile: true },
      { href: "/app/compte", label: "Compte et formule", court: "Compte", icone: "compte", mobile: true },
    ];
  const benef = o.famille === "benef";
  return [
    { href: "/app", label: "Tableau de bord", court: "Accueil", icone: "accueil", mobile: true },
    { href: "/app/analyser", label: "Analyser une annonce", court: "Analyser", icone: "analyser", mobile: true, verrou: benef ? undefined : "Starter" },
    { href: "/app/rapports", label: "Rapports", court: "Rapports", icone: "rapports", mobile: true, verrou: benef ? undefined : "Starter" },
    { href: "/app/parc", label: "Parc", court: "Parc", icone: "parc", mobile: true, verrou: o.parc ? undefined : "Pro" },
    { href: "/app/rentabilite", label: "Rentabilité", court: "Rentabilité", icone: "rentabilite" },
    { href: "/app/comparer", label: "Comparer", court: "Comparer", icone: "comparer", verrou: o.comparateur ? undefined : "Croissance" },
    { href: "/app/recherche", label: "Recherche", court: "Recherche", icone: "recherche", verrou: o.recherche ? undefined : "Pro" },
    { href: "/app/guides", label: "Guides", court: "Guides", icone: "guide" },
    { href: "/app/compte", label: "Compte et formule", court: "Compte", icone: "compte", mobile: true },
  ];
}

export const nomFormule = (c: Compte) => (c.offre.famille === "benef" ? `Benef ${c.offre.nom}` : c.offre.nom);
export const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? "s" : ""}`;
