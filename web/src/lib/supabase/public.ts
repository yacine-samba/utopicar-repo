import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_CLE, SUPABASE_URL } from "./config";

/** Client sans session ni cookie, pour les données publiques (pages de cote, plan du site) : peut être mis en cache. */
export const supabasePublic = () => createClient(SUPABASE_URL, SUPABASE_CLE, { auth: { persistSession: false, autoRefreshToken: false } });
