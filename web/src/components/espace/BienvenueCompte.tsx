import type { Compte } from "@/lib/compte";
import { donneesBienvenue } from "@/lib/bienvenue";
import { Bienvenue } from "./Bienvenue";

/* Visite de bienvenue, ouverte par /app?bienvenue=1 : on y arrive au retour du paiement d'un abonnement,
   ou depuis Profil › « Revoir la visite ». Sans ce paramètre, elle ne s'ouvre jamais d'elle-même. */
export function BienvenueCompte({ c, actif }: { c: Compte; actif: boolean }) {
  if (!actif) return null;
  return <Bienvenue d={donneesBienvenue(c)} />;
}
