import "server-only";
import { supabaseService } from "./supabase/service";

/* Limite d'appels par adresse IP ou par compte, en plus des quotas de chaque formule. Sert aux routes ouvertes aux
   visiteurs (aperçu d'annonce, analyse) et aux vérifications à protéger des essais en série (mot de passe, codes).
   Le compteur est dans la base (limite_appel), partagé par toutes les instances du site ; sans clé de service
   (poste de développement) ou si la base ne répond pas, un compteur en mémoire de l'instance prend le relais. */

const compteurs = new Map<string, Map<string, number[]>>();

/** Adresse IP de la demande (premier maillon de x-forwarded-for), « local » sans proxy. */
export const ipDe = (req: Request) => (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";

function enMemoire(cle: string, ip: string, max: number, fenetreMs: number): boolean {
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

/** true si cette IP (ou ce compte) a dépassé `max` appels sur la fenêtre `fenetreMs` pour la clé donnée (l'appel courant compris). */
export async function tropDeDemandes(cle: string, ip: string, max: number, fenetreMs: number): Promise<boolean> {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data, error } = await supabaseService().rpc("limite_appel", { p_cle: cle, p_ident: ip, p_max: max, p_fenetre_s: Math.round(fenetreMs / 1000) });
    if (!error && typeof data === "boolean") return data;
    console.error("limite_appel", error?.message);
  }
  return enMemoire(cle, ip, max, fenetreMs);
}
