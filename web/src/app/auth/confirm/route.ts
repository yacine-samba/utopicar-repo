import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { suiteSure } from "@/lib/suite";

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
  return NextResponse.redirect(new URL(type === "recovery" ? "/compte?motdepasse=1" : suite, url.origin));
}
