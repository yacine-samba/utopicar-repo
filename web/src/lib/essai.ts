import "server-only";
import { supabaseService } from "./supabase/service";
import type { DemandeEssai } from "@/components/analyse/EssaiEmail";

/** Annonce gardée par l'analyse offerte (lien reçu par email) : rendue une seule fois, au titulaire de l'email,
    dans les 7 jours. Marquée utilisée tout de suite, pour qu'un rechargement ne relance pas l'analyse. */
export async function reprendreEssai(id: string | undefined, email: string): Promise<DemandeEssai | undefined> {
  if (!id || !/^[0-9a-f-]{36}$/i.test(id) || !email || !process.env.SUPABASE_SERVICE_ROLE_KEY) return undefined;
  const { data, error } = await supabaseService()
    .from("essais")
    .update({ utilise_le: new Date().toISOString() })
    .eq("id", id)
    .eq("email", email.toLowerCase())
    .is("utilise_le", null)
    .gte("created_at", new Date(Date.now() - 7 * 864e5).toISOString())
    .select("texte,lien,ville")
    .maybeSingle();
  if (error) console.error("essai", error);
  if (!data) return undefined;
  return { texte: data.texte ?? undefined, lien: data.lien ?? undefined, ville: data.ville ?? "" };
}
