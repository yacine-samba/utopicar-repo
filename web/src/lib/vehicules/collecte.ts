import "server-only";
import { supabaseService } from "@/lib/supabase/service";
import { specCollecte } from "./moteur";

/* Collecte Leboncoin, comme l'outil Garage : quand la base du marché a trop peu d'annonces pour une génération
   (et sa version, son énergie), jusqu'à 1 000 annonces sont relevées sur Leboncoin (Apify, ~0,07 $), puis versées dans la base.
   Demandée seulement par le serveur, après la vérification de la formule, avec un quota par compte et un plafond global. */

export const SEUIL_COLLECTE = 150;
const PAR_JOUR = 4;
const PAR_MOIS = 30;
const TOUS_PAR_JOUR = 40;
const FRAICHE_MS = 7 * 864e5;

export type EtatCollecte = { cle: string; nom: string; statut: "demandee" | "en cours" | "ok" | "erreur" | "quota"; n?: number | null; erreur?: string | null; maj?: string | null };
type LigneCote = { cle: string; nom: string; statut: string; run_id: string | null; n: number | null; maj: string | null; erreur: string | null; demande: string | null };

const versEtat = (c: LigneCote): EtatCollecte => ({
  cle: c.cle, nom: c.nom, n: c.n, maj: c.maj, erreur: c.erreur,
  statut: c.run_id ? "en cours" : c.statut === "ok" ? "ok" : c.statut === "erreur" ? "erreur" : "demandee",
});

/** Où en est la collecte d'une clé (« bmw serie3|e90|essence »). */
export async function etatCollecte(cle: string): Promise<EtatCollecte | null> {
  const { data } = await supabaseService().from("cotes").select("cle, nom, statut, run_id, n, maj, erreur, demande").eq("cle", cle).maybeSingle();
  return data ? versEtat(data as LigneCote) : null;
}

/** Lance la collecte si elle n'est ni en cours, ni récente, et si le quota le permet. null : rien à faire. */
export async function demanderCollecte(userId: string, base: string, gen: string, version: string | null, energie: string): Promise<EtatCollecte | null> {
  const spec = specCollecte(base, gen, version, energie);
  if (!spec) return null;
  const sb = supabaseService();
  const { data: c } = await sb.from("cotes").select("cle, nom, statut, run_id, n, maj, erreur, demande").eq("cle", spec.cle).maybeSingle();
  if (c) {
    const e = versEtat(c as LigneCote);
    if (e.statut === "en cours" || e.statut === "demandee") return e;
    // relevée il y a moins de 7 jours : la base a déjà ce que Leboncoin propose
    if (c.maj && Date.now() - Date.parse(c.maj) < FRAICHE_MS && e.statut === "ok") return null;
    if (e.statut === "erreur" && c.demande && Date.now() - Date.parse(c.demande) < 6 * 3600e3) return e;
  }
  const depuis = (ms: number) => new Date(Date.now() - ms).toISOString();
  const [jour, mois, tous] = await Promise.all([
    sb.from("collectes").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", depuis(864e5)),
    sb.from("collectes").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", depuis(30 * 864e5)),
    sb.from("collectes").select("id", { count: "exact", head: true }).gte("created_at", depuis(864e5)),
  ]);
  if ((jour.count ?? 0) >= PAR_JOUR || (mois.count ?? 0) >= PAR_MOIS || (tous.count ?? 0) >= TOUS_PAR_JOUR) {
    return { cle: spec.cle, nom: spec.nom, statut: "quota", erreur: `Quota de collectes atteint (${PAR_JOUR} par jour, ${PAR_MOIS} par mois). Les résultats viennent de la base actuelle.` };
  }
  const { error } = await sb.rpc("utp_cote_demande", { p: spec });
  if (error) throw new Error(error.message);
  await sb.from("collectes").insert({ user_id: userId, cle: spec.cle });
  return { cle: spec.cle, nom: spec.nom, statut: "demandee" };
}
