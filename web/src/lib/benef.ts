import "server-only";
import { redirect } from "next/navigation";
import { compteCourant, type Compte } from "./compte";

/** Compte Benef de la page en cours ; la mise en page /app gère déjà les autres cas. */
export async function compteBenef(chemin: string): Promise<Compte> {
  const c = await compteCourant();
  if (!c) redirect(`/connexion?next=${encodeURIComponent(chemin)}`);
  return c;
}

export const dateCourte = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
