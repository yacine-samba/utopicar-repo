import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/** Client « service » : contourne RLS. Réservé aux écritures serveur (quotas, rapports, webhook Stripe). */
export function supabaseService() {
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !cle) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  return createClient(SUPABASE_URL, cle, { auth: { persistSession: false, autoRefreshToken: false } });
}
