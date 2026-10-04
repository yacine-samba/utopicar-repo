import * as z from "zod/v4";
import { createClient } from "@supabase/supabase-js";
import { compteCourant } from "@/lib/compte";
import { SUPABASE_CLE, SUPABASE_URL } from "@/lib/supabase/config";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { supabaseService } from "@/lib/supabase/service";
import { urlSite } from "@/lib/stripe";
import { jetonEmail } from "@/lib/jeton";

/* Profil et sécurité du compte, par le serveur : marche même pour un ancien compte sans fiche profil,
   et sans dépendre des emails de Supabase (désactivés : tous les emails partent d'utopicar.fr). */

const Corps = z.discriminatedUnion("action", [
  z.object({ action: z.literal("profil"), prenom: z.string().trim().max(60), nom: z.string().trim().max(80), ville: z.string().trim().max(80) }),
  z.object({ action: z.literal("motdepasse"), actuel: z.string().max(200).default(""), nouveau: z.string().min(8, "8 caractères au moins.").max(200) }),
  z.object({ action: z.literal("email"), email: z.email("Adresse e-mail invalide.").max(200) }),
]);

const erreur = (t: string, status = 400) => Response.json({ erreur: t }, { status });
const serviceDispo = () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

async function envoyerEmail(dest: string, sujet: string, html: string, texte: string) {
  const { data } = await supabaseService().from("reglages").select("cle,valeur").in("cle", ["resend_key", "email_from_leads"]);
  const R = Object.fromEntries((data ?? []).map((r) => [r.cle, r.valeur])) as Record<string, string>;
  if (!R.resend_key) throw new Error("envoi non configuré");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${R.resend_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: R.email_from_leads ? `Utopicar <${R.email_from_leads}>` : "Utopicar <onboarding@resend.dev>", to: [dest], subject: sujet, html, text: texte }),
  });
  if (!r.ok) throw new Error(`envoi refusé (${r.status})`);
}

export async function POST(req: Request) {
  const c = await compteCourant();
  if (!c) return erreur("Connectez-vous.", 401);
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return erreur(r.error.issues[0]?.message ?? "Demande invalide.");
  const d = r.data;

  if (d.action === "profil") {
    const champs = { prenom: d.prenom || null, nom: d.nom || null, ville: d.ville || null, updated_at: new Date().toISOString() };
    if (serviceDispo()) {
      const { error } = await supabaseService().from("profils").upsert({ id: c.id, email: c.email, ...champs }, { onConflict: "id" });
      if (error) return erreur("Enregistrement impossible, réessayez.", 500);
    } else {
      const { data, error } = await (await supabaseServeur()).from("profils").update(champs).eq("id", c.id).select("id");
      if (error || !data?.length) return erreur("Enregistrement impossible, réessayez.", 500);
    }
    return Response.json({ ok: true });
  }

  if (!serviceDispo()) return erreur("Service indisponible pour le moment.", 503);
  const admin = supabaseService().auth.admin;

  if (d.action === "motdepasse") {
    const { data: u } = await admin.getUserById(c.id);
    const user = u?.user;
    if (!user) return erreur("Compte introuvable.", 404);
    if (d.actuel) {
      // vérifie le mot de passe actuel sans toucher à la session en cours
      const verif = createClient(SUPABASE_URL, SUPABASE_CLE, { auth: { persistSession: false, autoRefreshToken: false } });
      const { error } = await verif.auth.signInWithPassword({ email: user.email!, password: d.actuel });
      if (error) return erreur("Le mot de passe actuel n'est pas le bon.");
    } else {
      // sans mot de passe actuel (compte ouvert par lien e-mail ou Google) : seulement juste après une connexion
      const depuis = user.last_sign_in_at ? Date.now() - new Date(user.last_sign_in_at).getTime() : Infinity;
      if (depuis > 20 * 60_000) return erreur("Indiquez votre mot de passe actuel. Vous n'en avez pas ? Déconnectez-vous puis reconnectez-vous par lien e-mail : vous aurez 20 minutes pour en choisir un.");
    }
    if (d.actuel && d.actuel === d.nouveau) return erreur("Le nouveau mot de passe doit être différent de l'actuel.");
    const { error } = await admin.updateUserById(c.id, { password: d.nouveau });
    if (error) return erreur(/weak|pwned|short/i.test(error.message) ? "Mot de passe trop simple ou déjà connu des pirates : choisissez-en un plus long et plus varié." : "Changement impossible, réessayez.");
    return Response.json({ ok: true });
  }

  // nouvelle adresse e-mail : lien signé envoyé à la nouvelle adresse, le changement se fait au clic (route /api/compte/email)
  if (d.email.toLowerCase() === c.email.toLowerCase()) return erreur("C'est déjà votre adresse.");
  const lien = `${urlSite(req)}/api/compte/email?j=${encodeURIComponent(jetonEmail(c.id, d.email))}`;
  try {
    await envoyerEmail(
      d.email,
      "Confirmez votre nouvelle adresse Utopicar",
      `<div style="font:15px/1.6 Arial,sans-serif;color:#1d1d1f;max-width:520px"><p style="font-size:20px;font-weight:bold">Nouvelle adresse e-mail</p><p>Cliquez sur le bouton pour utiliser cette adresse pour votre compte Utopicar.</p><p><a href="${lien}" style="background:#ff5a1f;color:#160904;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Confirmer cette adresse</a></p><p style="color:#777;font-size:13px">Ce lien est valable une heure. Si vous n'avez rien demandé, ignorez ce message : rien ne change.</p></div>`,
      `Confirmez votre nouvelle adresse Utopicar (lien valable une heure) :\n${lien}\n\nSi vous n'avez rien demandé, ignorez ce message.`,
    );
  } catch (e) {
    console.error("email changement", e);
    return erreur("L'e-mail de confirmation n'a pas pu partir. Réessayez dans un instant.", 502);
  }
  return Response.json({ ok: true });
}
