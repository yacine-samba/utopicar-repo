import "server-only";
import { cookies } from "next/headers";

/* Thème du site public : clair par défaut, sombre au choix (bouton de l'en-tête), mémorisé dans un cookie
   lu par le serveur pour afficher la bonne couleur dès le premier rendu. L'espace connecté (/app) reste sombre. */

export type ThemeSite = "clair" | "sombre";
export const COOKIE_THEME = "utp-theme";

export async function themeSite(): Promise<ThemeSite> {
  return (await cookies()).get(COOKIE_THEME)?.value === "sombre" ? "sombre" : "clair";
}
