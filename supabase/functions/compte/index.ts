// Comptes utopicar.fr : inscription, lien de connexion et mot de passe oublié.
// Tous les emails partent de l'adresse Utopicar (Resend, domaine utopicar.fr) avec des liens vers utopicar.fr :
// Supabase n'envoie plus aucun email, donc plus aucun lien « supabase.co » dans les boîtes de réception.
// Public (pas de JWT) : validation, limites par adresse IP et par email, réponses identiques que le compte existe ou non.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });

const ORIGINES = [/^https:\/\/(www\.)?utopicar\.fr$/, /^https:\/\/utopicar(-[a-z0-9-]+)?\.vercel\.app$/, /^http:\/\/localhost(:\d+)?$/];
const origineSure = (o: string | null) => (o && ORIGINES.some((r) => r.test(o)) ? o : null);

function entetes(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origineSure(origin) ?? "https://utopicar.fr",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Vary": "Origin",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
}

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const suiteSure = (v: unknown, defaut: string) => (typeof v === "string" && /^\/(?![/\\])[\w\-/?=&.%#]*$/.test(v) && v.length < 200 ? v : defaut);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Limite : au plus `max` demandes pour cette clé sur la fenêtre (en minutes). Enregistre la demande. */
async function tropDeDemandes(cle: string, max: number, minutes: number) {
  const depuis = new Date(Date.now() - minutes * 60_000).toISOString();
  const { count } = await sb.from("envois_compte").select("id", { count: "exact", head: true }).eq("cle", cle).gte("created_at", depuis);
  if ((count ?? 0) >= max) return true;
  await sb.from("envois_compte").insert({ cle });
  return false;
}

async function reglages() {
  const { data } = await sb.from("reglages").select("cle,valeur").in("cle", ["resend_key", "email_from_leads", "email_reply"]);
  return Object.fromEntries((data ?? []).map((r) => [r.cle, r.valeur])) as Record<string, string>;
}

function gabarit(titre: string, texte: string, bouton: string, lien: string, bas: string) {
  return `<div style="background:#f5f1ea;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;color:#15110d"><div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:28px">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#d9481a;font-weight:bold">Utopicar</p>
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.2">${titre}</h1>
<p style="margin:0 0 22px;font-size:16px;line-height:1.5;color:#3b352f">${texte}</p>
<p style="margin:0 0 22px"><a href="${lien}" style="display:inline-block;background:#ff5a1f;color:#160904;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:999px;font-size:16px">${bouton}</a></p>
<p style="margin:0;font-size:13px;line-height:1.5;color:#6b635b">${bas}</p>
<hr style="border:0;border-top:1px solid #e2dace;margin:22px 0"><p style="margin:0;font-size:13px;color:#6b635b">Yacine — Utopicar · <a href="https://utopicar.fr" style="color:#6b635b">utopicar.fr</a></p></div></div>`;
}

async function envoyer(to: string, sujet: string, html: string, text: string) {
  const cfg = await reglages();
  if (!cfg.resend_key) throw new Error("resend_key manquante");
  const de = cfg.email_from_leads ? (cfg.email_from_leads.includes("<") ? cfg.email_from_leads : `Utopicar <${cfg.email_from_leads}>`) : "Utopicar <contact@utopicar.fr>";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.resend_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: de, to: [to], subject: sujet, html, text, ...(cfg.email_reply ? { reply_to: cfg.email_reply } : {}) }),
  });
  if (!r.ok) throw new Error(`resend ${r.status} ${await r.text()}`);
}

const existe = async (email: string) => {
  const { data } = await sb.from("profils").select("id").eq("email", email).limit(1);
  return !!data?.length;
};

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const h = entetes(origin);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
  const rep = (corps: Record<string, unknown>, status = 200) => new Response(JSON.stringify(corps), { status, headers: h });
  if (req.method !== "POST") return rep({ erreur: "Méthode non autorisée." }, 405);

  const site = origineSure(origin) ?? "https://utopicar.fr";
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "inconnue";
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return rep({ erreur: "Demande invalide." }, 400);
  }
  const action = String(b.action ?? "");
  const email = String(b.email ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return rep({ erreur: "Indiquez une adresse email valide, par exemple nom@exemple.fr." }, 400);

  try {
    if (action === "inscription") {
      const password = String(b.password ?? "");
      const prenom = String(b.prenom ?? "").trim().slice(0, 60);
      const onboarding = b.onboarding && typeof b.onboarding === "object" && !Array.isArray(b.onboarding) ? (b.onboarding as Record<string, unknown>) : {};
      if (password.length < 8 || password.length > 200) return rep({ erreur: "Le mot de passe doit contenir au moins 8 caractères." }, 400);
      if (await tropDeDemandes(`ip:${ip}:inscription`, 8, 60)) return rep({ erreur: "Trop d'inscriptions depuis cette connexion. Réessayez dans une heure." }, 429);
      const famille = onboarding.famille === "benef" || onboarding.famille === "particulier" ? onboarding.famille : null;
      const { error } = await sb.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { prenom, famille, onboarding } });
      if (error) {
        if (error.status === 422 || /already|exists|registered/i.test(error.message)) return rep({ erreur: "Un compte existe déjà avec cet email. Connectez-vous.", code: "existe" }, 409);
        if (/password/i.test(error.message)) return rep({ erreur: "Ce mot de passe est trop simple : choisissez-en un plus long, avec des lettres et des chiffres." }, 400);
        console.error("createUser", error);
        return rep({ erreur: "L'inscription n'a pas marché. Réessayez dans un instant." }, 500);
      }
      const nom = prenom ? `, ${prenom}` : "";
      const espace = `${site}/app`;
      const texte =
        famille === "benef"
          ? "Votre espace Benef est prêt. Collez le lien d'une annonce Leboncoin : Utopicar récupère l'annonce, calcule la marge nette après frais et vous donne le prix d'achat à ne pas dépasser."
          : "Votre espace est prêt. Collez le lien d'une annonce Leboncoin : Utopicar récupère l'annonce, calcule ce que la voiture va vraiment vous coûter et vous dit quoi vérifier avant d'acheter.";
      await envoyer(
        email,
        `Bienvenue sur Utopicar${nom}`,
        gabarit(`Bienvenue${esc(nom)}`, texte, "Ouvrir mon espace", espace, `Votre adresse de connexion : ${esc(email)}.<br>Vous recevez ce message parce que vous venez de créer votre compte Utopicar.`),
        `Bienvenue${nom}\n\n${texte}\n\nOuvrir mon espace : ${espace}\n\nYacine — Utopicar`,
      ).catch((e) => console.error("bienvenue", e));
      return rep({ ok: true });
    }

    if (action === "lien" || action === "oubli") {
      // Réponse identique que le compte existe ou non : on ne révèle pas qui est inscrit.
      if (await tropDeDemandes(`ip:${ip}:liens`, 12, 60)) return rep({ erreur: "Trop de demandes depuis cette connexion. Réessayez dans une heure." }, 429);
      if (await tropDeDemandes(`email:${email}:${action}`, 3, 15)) return rep({ ok: true });
      if (!(await existe(email))) return rep({ ok: true });
      const type = action === "lien" ? "magiclink" : "recovery";
      const { data, error } = await sb.auth.admin.generateLink({ type, email });
      if (error || !data?.properties?.hashed_token) {
        console.error("generateLink", error);
        return rep({ erreur: "L'envoi n'a pas marché. Réessayez dans un instant." }, 500);
      }
      const suite = action === "lien" ? suiteSure(b.suite, "/app") : "/app/compte?motdepasse=1";
      const lien = `${site}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=${type}&next=${encodeURIComponent(suite)}`;
      if (action === "lien")
        await envoyer(
          email,
          "Votre lien de connexion Utopicar",
          gabarit("Votre lien de connexion", "Cliquez sur le bouton pour vous connecter à votre espace Utopicar. Pas besoin de mot de passe.", "Me connecter", lien, "Ce lien est valable une heure et ne sert qu'une fois. Si vous n'avez rien demandé, ignorez ce message : votre compte ne risque rien."),
          `Votre lien de connexion Utopicar (valable une heure) :\n${lien}\n\nSi vous n'avez rien demandé, ignorez ce message.`,
        );
      else
        await envoyer(
          email,
          "Choisir un nouveau mot de passe",
          gabarit("Nouveau mot de passe", "Cliquez sur le bouton : vous arrivez dans votre compte Utopicar, prêt à choisir un nouveau mot de passe.", "Choisir mon mot de passe", lien, "Ce lien est valable une heure et ne sert qu'une fois. Si vous n'avez rien demandé, ignorez ce message : votre mot de passe actuel reste valable."),
          `Choisir un nouveau mot de passe Utopicar (lien valable une heure) :\n${lien}\n\nSi vous n'avez rien demandé, ignorez ce message.`,
        );
      return rep({ ok: true });
    }

    return rep({ erreur: "Action inconnue." }, 400);
  } catch (e) {
    console.error("compte", e);
    return rep({ erreur: "Le service ne répond pas. Réessayez dans un instant." }, 500);
  }
});
