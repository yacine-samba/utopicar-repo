import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { suiteSure } from "@/lib/suite";
import { supabaseService } from "@/lib/supabase/service";

/** Retour depuis les emails de Supabase : confirmation d'inscription, lien de connexion, nouveau mot de passe. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const suite = suiteSure(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const sb = await supabaseServeur();
  const { error } = code
    ? await sb.auth.exchangeCodeForSession(code)
    : token_hash && type
      ? await sb.auth.verifyOtp({ token_hash, type })
      : { error: new Error("lien incomplet") };
  if (error) return NextResponse.redirect(new URL(`/connexion?erreur=lien&next=${encodeURIComponent(suite)}`, url.origin));
  // Première connexion avec Google ou Apple : la fiche profil est créée avec le prénom donné par le fournisseur.
  if (code && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data } = await sb.auth.getUser();
    const u = data.user;
    if (u) {
      const svc = supabaseService();
      const { data: p } = await svc.from("profils").select("id").eq("id", u.id).maybeSingle();
      if (!p) {
        const m = u.user_metadata ?? {};
        const prenom = String(m.given_name ?? m.first_name ?? String(m.full_name ?? m.name ?? "").split(" ")[0] ?? "").slice(0, 60) || null;
        const nom = String(m.family_name ?? m.last_name ?? "").slice(0, 80) || null;
        await svc.from("profils").insert({ id: u.id, email: u.email, prenom, nom }).then(({ error: e }) => e && console.error("profil oauth", e));
      }
    }
  }
  return NextResponse.redirect(new URL(type === "recovery" ? "/app/compte?motdepasse=1" : suite, url.origin));
}
