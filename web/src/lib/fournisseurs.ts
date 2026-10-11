import "server-only";
import { SUPABASE_CLE, SUPABASE_URL } from "@/lib/supabase/config";
import type { Fournisseur } from "@/components/compte/ConnexionSociale";

/** Fournisseurs de connexion activés dans Supabase (Google, Apple) : les boutons n'apparaissent que s'ils marchent. */
export async function fournisseursActifs(): Promise<Fournisseur[]> {
  if (!SUPABASE_URL) return [];
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_CLE }, next: { revalidate: 600 } });
    const ext = ((await r.json()) as { external?: Record<string, boolean> }).external ?? {};
    return (["google", "apple"] as const).filter((f) => ext[f]);
  } catch {
    return [];
  }
}
