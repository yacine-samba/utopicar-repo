import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_CLE, SUPABASE_URL } from "./config";

/** Client lié à la session de l'utilisateur (cookies), soumis aux règles RLS. */
export async function supabaseServeur() {
  const jar = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_CLE, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (liste) => {
        try {
          liste.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          /* appel depuis un composant serveur : le proxy rafraîchit la session */
        }
      },
    },
  });
}
