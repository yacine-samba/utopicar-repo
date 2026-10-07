import "server-only";
import { cache } from "react";
import { comptesActifs } from "./supabase/config";
import { supabaseServeur } from "./supabase/serveur";
import { ILLIMITE, NIVEAU_CREDIT, OFFRES, offre, STATUTS_ACTIFS, type Famille, type Offre } from "./offres";

export type Abonnement = { offre: string; statut: string; periode_fin: string | null; annule_fin_periode: boolean };

export type Compte = {
  id: string;
  /** Formule attribuée à la main dans Supabase (profils.formule_offerte), prioritaire sur Stripe. */
  offerte: { jusquAu: string | null } | null;
  /** Compte illimité (profils.illimite) : tout, sans limite d'analyses. */
  illimite: boolean;
  /** Accès à la page Administration (profils.admin). */
  admin: boolean;
  email: string;
  prenom: string;
  nom: string;
  famille: Famille | null;
  ville: string;
  offre: Offre;
  abonnement: Abonnement | null;
  guide: boolean;
  utilisees: number;
  /** Analyses encore comprises dans la formule (mois en cours, ou au total pour la formule gratuite). */
  restantesFormule: number;
  /** Crédits achetés à l'unité, utilisés quand la formule est épuisée. */
  credits: number;
  /** Total disponible : formule puis crédits. */
  restantes: number;
  /** Favoris affichés (paramètres d'accessibilité, désactivés par défaut). */
  favoris: boolean;
  /** Option « Messages Leboncoin » (Benef Pro, en plus de la formule). */
  messages: boolean;
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
  const [{ data: profil }, { data: abo }, { data: achats }, { data: credits }, { count: achatsCredits }, { data: messages }, { data: droitsAdmin }] = await Promise.all([
    sb.from("profils").select("prenom, nom, famille, ville, formule_offerte, offerte_jusqu_au, illimite, reglages").eq("id", user.id).maybeSingle(),
    sb.from("abonnements").select("offre, statut, periode_fin, annule_fin_periode").eq("user_id", user.id).maybeSingle(),
    sb.from("achats").select("produit").eq("user_id", user.id),
    sb.rpc("mes_credits"),
    sb.from("credits").select("id", { count: "exact", head: true }).eq("user_id", user.id).gt("delta", 0),
    sb.rpc("option_active", { p_uid: user.id, p_option: "messages" }),
    // à part : tant que la colonne admin n'existe pas, cette lecture échoue seule sans bloquer le profil
    sb.from("profils").select("admin").eq("id", user.id).maybeSingle(),
  ]);
  const actif = abo && STATUTS_ACTIFS.includes(abo.statut);
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const offerte = profil?.formule_offerte && (!profil.offerte_jusqu_au || profil.offerte_jusqu_au >= aujourdhui) ? (profil.formule_offerte as string) : null;
  const illimite = !!profil?.illimite;
  let o = illimite ? ILLIMITE : offre(offerte ?? (actif ? abo.offre : "gratuit"));
  const { count } = await sb.from("usages").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", debutPeriode(o));
  const utilisees = count ?? 0;
  const restantesFormule = Math.max(0, o.analyses - utilisees);
  const solde = typeof credits === "number" ? credits : 0;
  // Formule Découverte avec des crédits achetés : historique comme Essentiel, et les analyses payées par crédit ont son niveau.
  if (!illimite && o.prix === 0 && (achatsCredits ?? 0) > 0) o = { ...o, historique: OFFRES.essentiel.historique };
  if (!illimite && o.prix === 0 && restantesFormule <= 0 && solde > 0) o = { ...o, detail: NIVEAU_CREDIT.detail, photos: Math.max(o.photos, NIVEAU_CREDIT.photos) };
  return {
    id: user.id,
    offerte: offerte && !illimite ? { jusquAu: profil?.offerte_jusqu_au ?? null } : null,
    illimite,
    admin: !!droitsAdmin?.admin,
    email: user.email ?? "",
    prenom: profil?.prenom || "",
    nom: profil?.nom || "",
    famille: (profil?.famille as Famille) ?? null,
    ville: profil?.ville ?? "",
    offre: o,
    abonnement: abo ?? null,
    guide: o.guide || (achats ?? []).some((a) => a.produit === "guide"),
    utilisees,
    restantesFormule,
    credits: solde,
    restantes: restantesFormule + solde,
    favoris: (profil?.reglages as { favoris?: boolean } | null)?.favoris === true,
    messages: messages === true,
  };
});
