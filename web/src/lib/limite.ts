import "server-only";

/* Limite d'appels par adresse IP, en mémoire (par instance), en plus des quotas de chaque formule.
   Sert aux routes ouvertes aux visiteurs : aperçu d'annonce, analyse. */

const compteurs = new Map<string, Map<string, number[]>>();

/** Adresse IP de la demande (premier maillon de x-forwarded-for), « local » sans proxy. */
export const ipDe = (req: Request) => (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";

/** true si cette IP a dépassé `max` appels sur la fenêtre `fenetreMs` pour la clé donnée (l'appel courant compris). */
export function tropDeDemandes(cle: string, ip: string, max: number, fenetreMs: number): boolean {
  const now = Date.now();
  const vus = compteurs.get(cle) ?? new Map<string, number[]>();
  compteurs.set(cle, vus);
  const l = (vus.get(ip) ?? []).filter((t) => now - t < fenetreMs);
  l.push(now);
  vus.set(ip, l);
  // ménage : les adresses sans appel récent ne restent pas en mémoire
  if (vus.size > 5000) for (const [k, v] of vus) if (!v.some((t) => now - t < fenetreMs)) vus.delete(k);
  return l.length > max;
}
