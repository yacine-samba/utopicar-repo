import { NextResponse } from "next/server";
import { lireJetonEmail } from "@/lib/jeton";
import { supabaseService } from "@/lib/supabase/service";

/** Clic sur le lien envoyé à la nouvelle adresse : l'adresse du compte change. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const t = lireJetonEmail(url.searchParams.get("j") ?? "");
  if (!t) return NextResponse.redirect(new URL("/app/compte?email=expire#securite", url.origin));
  const svc = supabaseService();
  const { error } = await svc.auth.admin.updateUserById(t.uid, { email: t.email, email_confirm: true });
  if (error) return NextResponse.redirect(new URL("/app/compte?email=pris#securite", url.origin));
  await svc.from("profils").update({ email: t.email }).eq("id", t.uid);
  return NextResponse.redirect(new URL("/app/compte?email=ok", url.origin));
}
