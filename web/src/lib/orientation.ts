/* Ce que la personne a dit d'elle sur le site (pastille « J'achète pour moi » / « Je revends ») : gardé dans le navigateur
   jusqu'à l'inscription, puis dans profils.onboarding. Une seule question, facultative. */

export type Profil = { but?: "achat" | "pro"; famille?: "particulier" | "benef" | null } & Record<string, string | null | undefined>;

export const CLE_PROFIL = "utp-profil";

export function lireProfil(): Profil {
  try {
    return JSON.parse(localStorage.getItem(CLE_PROFIL) || "{}") as Profil;
  } catch {
    return {};
  }
}

export function ecrireProfil(p: Profil) {
  try {
    localStorage.setItem(CLE_PROFIL, JSON.stringify(p));
  } catch {
    /* stockage indisponible */
  }
}

/** Phrase d'accueil du tableau de bord, d'après le profil ; `null` : garder la phrase habituelle. */
export function phraseAccueil(onboarding: unknown, famille: string | null | undefined): string | null {
  const o = (onboarding && typeof onboarding === "object" ? onboarding : {}) as Profil;
  if (o.but === "pro" || famille === "benef") return "Chiffrez chaque annonce avant de vous déplacer : marge nette, prix d'offre, plafond.";
  if (o.but === "achat") return "Collez la prochaine annonce qui vous plaît : vous verrez tout de suite ce qu'il faut regarder.";
  return null;
}
