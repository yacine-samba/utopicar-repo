import type { Compte } from "./compte";
import type { Famille } from "./offres";

export type Icone = "accueil" | "analyser" | "rapports" | "parc" | "rentabilite" | "comparer" | "recherche" | "guide" | "compte" | "tri" | "cote" | "alertes" | "credits" | "favoris" | "extension" | "messages" | "estimation" | "admin";
/** `mobile` : dans la barre du bas du téléphone (5 au plus) ; `menu: false` : seulement là (le profil, en bas du menu, mène au compte). */
export type EntreeNav = { href: string; label: string; court: string; icone: Icone; verrou?: string; mobile?: boolean; menu?: boolean };

/** Espace affiché : la famille de la formule payée (ou offerte), sinon l'usage choisi à l'inscription. */
export const familleEspace = (c: Compte): Famille => (c.illimite ? (c.famille ?? "benef") : c.offre.prix > 0 || c.offerte ? c.offre.famille : (c.famille ?? "particulier"));

/** Modules gardés dans le code mais retirés de l'espace (on ne les utilise pas pour l'instant) : Tri rapide, Comparateur.
    La calculette de rentabilité est sur le site public (/benef), les alertes e-mail dans la Recherche, les guides dans le profil. */


/** Menu de l'espace connecté. */
export function navEspace(c: Compte): EntreeNav[] {
  const o = c.offre;
  // favoris : seulement si la personne les a activés (Compte › Accessibilité) ; extension et cote globale : compte illimité
  const favoris: EntreeNav[] = c.favoris ? [{ href: "/app/favoris", label: "Favoris", court: "Favoris", icone: "favoris" }] : [];
  const extension: EntreeNav[] = c.illimite ? [{ href: "/app/extension", label: "Extension Leboncoin", court: "Extension", icone: "extension" }] : [];
  const admin: EntreeNav[] = c.admin ? [{ href: "/app/admin", label: "Administration", court: "Admin", icone: "admin" }] : [];
  const compte: EntreeNav = { href: "/app/compte", label: "Profil et paramètres", court: "Profil", icone: "compte", mobile: true, menu: false };
  if (familleEspace(c) === "particulier")
    return [
      { href: "/app", label: "Accueil", court: "Accueil", icone: "accueil", mobile: true },
      { href: "/app/analyser", label: "Analyser une annonce", court: "Analyser", icone: "analyser", mobile: true },
      { href: "/app/rapports", label: "Mes analyses", court: "Analyses", icone: "rapports", mobile: true },
      ...favoris,
      ...extension,
      ...admin,
      { href: "/app/credits", label: "Crédits", court: "Crédits", icone: "credits", mobile: true },
      compte,
    ];
  const benef = o.famille === "benef";
  return [
    { href: "/app", label: "Tableau de bord", court: "Accueil", icone: "accueil", mobile: true },
    { href: "/app/analyser", label: "Analyser une annonce", court: "Analyser", icone: "analyser", mobile: true, verrou: benef ? undefined : "Starter" },
    { href: "/app/rapports", label: "Rapports", court: "Rapports", icone: "rapports", mobile: true, verrou: benef ? undefined : "Starter" },
    { href: "/app/parc", label: "Parc", court: "Parc", icone: "parc", mobile: true, verrou: o.parc ? undefined : "Pro" },
    { href: "/app/recherche", label: "Recherche", court: "Recherche", icone: "recherche", verrou: o.recherche ? undefined : "Pro" },
    { href: "/app/messages", label: "Messages Leboncoin", court: "Messages", icone: "messages", verrou: c.messages ? undefined : "Option Pro" },
    ...favoris,
    c.illimite
      ? { href: "/app/cote", label: "Cote du marché", court: "Cote", icone: "cote" }
      : { href: "/app/estimation", label: "Estimer une cote", court: "Estimer", icone: "estimation", verrou: benef ? undefined : "Starter" },
    ...extension,
    ...admin,
    compte,
  ];
}

export const nomFormule = (c: Compte) => (c.illimite ? "Accès illimité" : c.offre.famille === "benef" ? `Benef ${c.offre.nom}` : c.offre.nom);
/** « 12 analyses restantes ce mois », ou « Analyses illimitées ». */
export const texteRestantes = (c: Compte) =>
  c.illimite
    ? "Analyses illimitées"
    : `${c.restantes} analyse${c.restantes > 1 ? "s" : ""} restante${c.restantes > 1 ? "s" : ""}${c.credits ? ` dont ${c.credits} crédit${c.credits > 1 ? "s" : ""}` : c.offre.parMois ? " ce mois" : ""}`;
export const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? "s" : ""}`;
