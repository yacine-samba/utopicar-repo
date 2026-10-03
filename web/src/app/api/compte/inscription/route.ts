import * as z from "zod/v4";
import { supabaseServeur } from "@/lib/supabase/serveur";
import { supabaseService } from "@/lib/supabase/service";
import { urlSite } from "@/lib/stripe";

/* Inscription côté serveur : compte créé déjà confirmé, personne connectée tout de suite, email de bienvenue par Resend.
   Évite l'email de confirmation de Supabase (envoi par défaut limité à quelques messages par heure).
   Sans clé serveur, répond 501 : le formulaire repasse alors par l'inscription Supabase classique. */

const Corps = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(200),
  prenom: z.string().trim().max(60).default(""),
  onboarding: z.record(z.string(), z.unknown()).default({}),
});

const FENETRE = 60 * 60 * 1000;
const vus = new Map<string, number[]>();
function tropDeDemandes(ip: string) {
  const now = Date.now();
  const l = (vus.get(ip) ?? []).filter((t) => now - t < FENETRE);
  l.push(now);
  vus.set(ip, l);
  return l.length > 8;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function bienvenue(email: string, prenom: string, famille: string | null, site: string) {
  try {
    const { data } = await supabaseService().from("reglages").select("cle,valeur").in("cle", ["resend_key", "email_from_leads", "email_reply"]);
    const cfg = Object.fromEntries((data ?? []).map((r) => [r.cle, r.valeur])) as Record<string, string>;
    if (!cfg.resend_key) return;
    const de = cfg.email_from_leads ? (cfg.email_from_leads.includes("<") ? cfg.email_from_leads : `Utopicar <${cfg.email_from_leads}>`) : "Utopicar <onboarding@resend.dev>";
    const outil = famille === "benef" ? `${site}/app` : `${site}/analyse`;
    const nom = prenom ? `, ${prenom}` : "";
    const html = `<div style="background:#f5f1ea;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;color:#15110d"><div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:28px">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#d9481a;font-weight:bold">Utopicar</p>
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.2">Bienvenue${esc(nom)}</h1>
<p style="margin:0 0 18px;font-size:16px;line-height:1.5;color:#3b352f">Votre compte est prêt. Collez le lien d'une annonce Leboncoin : Utopicar récupère l'annonce, estime sa cote, repère les défauts qui coûtent cher et vous dit quoi faire.</p>
<p style="margin:0 0 22px"><a href="${outil}" style="display:inline-block;background:#ff5a1f;color:#160904;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:999px;font-size:16px">Analyser une annonce</a></p>
<p style="margin:0;font-size:14px;color:#6b635b">Formules et guides : <a href="${site}/tarifs" style="color:#d9481a">${site.replace(/^https?:\/\//, "")}/tarifs</a></p>
<hr style="border:0;border-top:1px solid #e2dace;margin:22px 0"><p style="margin:0;font-size:13px;color:#6b635b">Yacine — Utopicar<br>Vous recevez ce message parce que vous venez de créer votre compte.</p></div></div>`;
    const text = `Bienvenue${nom}\n\nVotre compte est prêt. Collez le lien d'une annonce Leboncoin pour l'analyser : ${outil}\n\nFormules et guides : ${site}/tarifs\n\nYacine — Utopicar`;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.resend_key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: de, to: [email], subject: `Bienvenue sur Utopicar${nom}`, html, text, ...(cfg.email_reply ? { reply_to: cfg.email_reply } : {}) }),
    });
    if (!r.ok) console.error("bienvenue", r.status, await r.text());
  } catch (e) {
    console.error("bienvenue", e);
  }
}

export async function POST(req: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return Response.json({ repli: true }, { status: 501 });
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  if (tropDeDemandes(ip)) return Response.json({ erreur: "Trop d'inscriptions depuis cette connexion. Réessayez dans une heure." }, { status: 429 });
  const r = Corps.safeParse(await req.json().catch(() => null));
  if (!r.success) return Response.json({ erreur: "Vérifiez l'adresse email et le mot de passe (8 caractères au moins)." }, { status: 400 });
  const { email, password, prenom, onboarding } = r.data;
  const famille = onboarding.famille === "benef" || onboarding.famille === "particulier" ? (onboarding.famille as string) : null;

  const { error } = await supabaseService().auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { prenom, famille, onboarding },
  });
  if (error) {
    if (error.status === 422 || /already|exists|registered/i.test(error.message)) return Response.json({ erreur: "Un compte existe déjà avec cet email. Connectez-vous." }, { status: 409 });
    if (/password/i.test(error.message)) return Response.json({ erreur: "Ce mot de passe est trop simple. Choisissez-en un plus long." }, { status: 400 });
    console.error("inscription", error);
    return Response.json({ erreur: "L'inscription n'a pas marché. Réessayez dans un instant." }, { status: 500 });
  }

  const sb = await supabaseServeur();
  const { error: e2 } = await sb.auth.signInWithPassword({ email: email.toLowerCase(), password });
  if (e2) console.error("connexion après inscription", e2);
  await bienvenue(email, prenom, famille, urlSite(req));
  return Response.json({ ok: true, connecte: !e2 });
}
