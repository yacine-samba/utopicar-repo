import "server-only";
import { cache } from "react";
import { comptesActifs } from "./supabase/config";
import { supabaseServeur } from "./supabase/serveur";
import { offre, STATUTS_ACTIFS, type Famille, type Offre } from "./offres";

export type Abonnement = { offre: string; statut: string; periode_fin: string | null; annule_fin_periode: boolean };

export type Compte = {
  id: string;
  /** Formule attribuée à la main dans Supabase (profils.formule_offerte), prioritaire sur Stripe. */
  offerte: { jusquAu: string | null } | null;
  email: string;
  prenom: string;
  famille: Famille | null;
  ville: string;
  offre: Offre;
  abonnement: Abonnement | null;
  guide: boolean;
  utilisees: number;
  restantes: number;
};

/** Début de la période de quota : le mois civil en cours, ou depuis toujours pour la formule gratuite. */
export const debutPeriode = (o: Offre) => (o.parMois ? new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString() : "1970-01-01T00:00:00Z");

/** Compte de la personne connectée, lu une seule fois par requête. null si personne n'est connecté. */
export const compteCourant = cache(async (): Promise<Compte | null> => {
  if (!comptesActifs()) return null;
  const sb = await supabaseServeur();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const [{ data: profil }, { data: abo }, { data: achats }] = await Promise.all([
    sb.from("profils").select("prenom, famille, ville, formule_offerte, offerte_jusqu_au").eq("id", user.id).maybeSingle(),
    sb.from("abonnements").select("offre, statut, periode_fin, annule_fin_periode").eq("user_id", user.id).maybeSingle(),
    sb.from("achats").select("produit").eq("user_id", user.id),
  ]);
  const actif = abo && STATUTS_ACTIFS.includes(abo.statut);
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const offerte = profil?.formule_offerte && (!profil.offerte_jusqu_au || profil.offerte_jusqu_au >= aujourdhui) ? (profil.formule_offerte as string) : null;
  const o = offre(offerte ?? (actif ? abo.offre : "gratuit"));
  const { count } = await sb.from("usages").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", debutPeriode(o));
  const utilisees = count ?? 0;
  return {
    id: user.id,
    offerte: offerte ? { jusquAu: profil?.offerte_jusqu_au ?? null } : null,
    email: user.email ?? "",
    prenom: profil?.prenom || "",
    famille: (profil?.famille as Famille) ?? null,
    ville: profil?.ville ?? "",
    offre: o,
    abonnement: abo ?? null,
    guide: o.guide || (achats ?? []).some((a) => a.produit === "guide"),
    utilisees,
    restantes: Math.max(0, o.analyses - utilisees),
  };
});
