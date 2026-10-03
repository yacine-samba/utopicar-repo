// Inscription publique + accès au guide par lien email uniquement.
// Endpoint public par nature : pas de JWT. Protections : validation stricte, pot de miel,
// limite par IP, jetons aléatoires stockés hachés (SHA-256) avec expiration, contenu jamais
// renvoyé à l'inscription, uniquement à l'ouverture du lien reçu par email.
// Action interne "taches" (cron, clé interne) : renvoi des guides non partis, relance J+2, désinscription respectée.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { contenu, titreGuide } from "./guides.ts";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const PROFILS = new Set(["debutant", "marchand", "garagiste", "particulier", "autre"]);
const BUDGETS = new Set(["moins-2000", "2000-5000", "5000-10000", "plus-10000"]);
const SITES: Record<string, { url: string; nom: string; tu: boolean }> = {
  utopicar: { url: "https://utopicar-garage-yacinesambas-projects.vercel.app", nom: "Utopicar", tu: false },
  ebook: { url: "https://premiere-revente-yacinesambas-projects.vercel.app", nom: "Première Revente", tu: true },
};
const JOURS_VALIDITE = 30;
const MAX_OUVERTURES = 25;
const MAX_TENTATIVES = 400; // couvre les 7 jours de renvoi (toutes les 30 min)
const JOURS_RENVOI = 7;

function cors(origin: string | null) {
  const ok = origin && (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin));
  return { "Access-Control-Allow-Origin": ok ? origin! : SITES.utopicar.url, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "content-type", "Vary": "Origin" };
}
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");
async function sha(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
function jeton() {
  const b = new Uint8Array(32); crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function reglages() {
  const { data } = await sb.from("reglages").select("cle,valeur").in("cle", ["resend_key", "email_notif", "email_from", "email_from_leads", "cle_interne"]);
  return Object.fromEntries((data ?? []).map((r: any) => [r.cle, r.valeur])) as Record<string, string>;
}
async function envoyer(cfg: Record<string, string>, from: string, to: string, subject: string, html: string, text: string, headers?: Record<string, string>) {
  if (!cfg.resend_key) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${cfg.resend_key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [to], subject, html, text, ...(headers ? { headers } : {}) }) });
    if (!r.ok) console.error("resend", r.status, await r.text());
    return r.ok;
  } catch (e) { console.error("resend", String(e)); return false; }
}
async function signature(id: string, cfg: Record<string, string>) { return (await sha(`stop|${id}|${cfg.cle_interne ?? ""}`)).slice(0, 32); }
async function lienStop(site: string, id: string, cfg: Record<string, string>) { return `${SITES[site].url}/guide?stop=${id}.${await signature(id, cfg)}`; }

function notifHtml(titre: string, lignes: string[][]) {
  return `<div style="font-family:Arial,sans-serif;font-size:15px;color:#15110d"><h2 style="margin:0 0 12px">${esc(titre)}</h2><table cellpadding="6" style="border-collapse:collapse">${lignes.map(([k, v]) => `<tr><td style="color:#6b635b">${esc(k)}</td><td><b>${esc(v)}</b></td></tr>`).join("")}</table></div>`;
}
function mailLead(site: string, prenom: string, lien: string, titre: string, stop: string, relance = false) {
  const s = SITES[site];
  const tu = s.tu;
  const t = (vous: string, toi: string) => (tu ? toi : vous);
  const h1 = relance ? t(`Votre guide vous attend, ${prenom}`, `Ton guide t'attend, ${prenom}`) : t(`Votre guide est prêt, ${prenom}`, `Ton guide est prêt, ${prenom}`);
  const intro = relance
    ? t(`Vous n'avez pas encore ouvert le guide <b>« ${esc(titre)} »</b>. Voici un nouveau lien personnel.`, `Tu n'as pas encore ouvert le guide <b>« ${esc(titre)} »</b>. Voici un nouveau lien personnel.`)
    : t(`Voici votre accès personnel au guide <b>« ${esc(titre)} »</b>. Il a été préparé selon l'objectif que vous avez indiqué.`, `Voici ton accès personnel au guide <b>« ${esc(titre)} »</b>. Il a été préparé selon l'objectif que tu as indiqué.`);
  const bouton = t("Ouvrir mon guide", "Ouvrir mon guide");
  const perso = t(`Ce lien est personnel et valable ${JOURS_VALIDITE} jours. Ne le partagez pas.`, `Ce lien est personnel et valable ${JOURS_VALIDITE} jours. Ne le partage pas.`);
  const copie = t("Si le bouton ne marche pas, copiez ce lien dans votre navigateur :", "Si le bouton ne marche pas, copie ce lien dans ton navigateur :");
  const pied = t(`Vous recevez ce message parce que vous avez demandé le guide sur ${esc(s.nom)}.`, `Tu reçois ce message parce que tu as demandé le guide sur ${esc(s.nom)}.`);
  const stopTxt = t("Ne plus recevoir de messages", "Ne plus recevoir de messages");
  const html = `<div style="background:#f5f1ea;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;color:#15110d"><div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#d9481a;font-weight:bold">${esc(s.nom)}</p>
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.2">${esc(h1)}</h1>
<p style="margin:0 0 18px;font-size:16px;line-height:1.5;color:#3b352f">${intro}</p>
<p style="margin:0 0 22px"><a href="${lien}" style="display:inline-block;background:#ff5a1f;color:#160904;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:999px;font-size:16px">${bouton}</a></p>
<p style="margin:0 0 6px;font-size:13px;color:#6b635b">${perso}</p>
<p style="margin:0;font-size:13px;color:#6b635b">${copie}<br><span style="word-break:break-all">${lien}</span></p>
<hr style="border:0;border-top:1px solid #e2dace;margin:22px 0"><p style="margin:0;font-size:13px;color:#6b635b">Yacine — ${esc(s.nom)}<br>${pied} <a href="${stop}" style="color:#6b635b">${stopTxt}</a>.</p></div></div>`;
  const text = `${h1}.\n\n${intro.replace(/<[^>]+>/g, "")}\n${lien}\n\n${perso}\n\nYacine — ${s.nom}\n${pied}\n${stopTxt} : ${stop}`;
  return { html, text };
}
const json = (h: Record<string, string>, d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: h });

async function envoyerGuide(cfg: Record<string, string>, lead: any, relance = false) {
  const site = SITES[lead.site] ? lead.site : "utopicar";
  const t = jeton();
  const token_expire = new Date(Date.now() + JOURS_VALIDITE * 86400_000).toISOString();
  await sb.from("landing_leads").update({ token_hash: await sha(t), token_expire }).eq("id", lead.id);
  const lien = `${SITES[site].url}/guide?t=${t}`;
  const stop = await lienStop(site, lead.id, cfg);
  const titre = titreGuide(site, lead.objectif);
  const m = mailLead(site, lead.prenom, lien, titre, stop, relance);
  const sujet = relance
    ? (SITES[site].tu ? `${lead.prenom}, ton guide « ${titre} » t'attend` : `${lead.prenom}, votre guide « ${titre} » vous attend`)
    : (SITES[site].tu ? `${lead.prenom}, ton guide « ${titre} » est prêt` : `${lead.prenom}, votre guide « ${titre} » est prêt`);
  return await envoyer(cfg, cfg.email_from_leads || `${SITES[site].nom} <onboarding@resend.dev>`, lead.email, sujet, m.html, m.text, { "List-Unsubscribe": `<${stop}>` });
}

async function taches(cfg: Record<string, string>) {
  const res = { renvoyes: 0, echecs: 0, relances: 0 };
  // 1) Guides pas encore partis (domaine pas vérifié, panne) : on réessaie.
  const depuis = new Date(Date.now() - JOURS_RENVOI * 86400_000).toISOString();
  const pause = new Date(Date.now() - 25 * 60_000).toISOString();
  const { data: aRenvoyer } = await sb.from("landing_leads").select("id, email, prenom, site, objectif, envoi_tentatives, dernier_envoi")
    .or("email_envoye.is.null,email_envoye.eq.false").eq("desinscrit", false).gte("created_at", depuis).lt("envoi_tentatives", MAX_TENTATIVES).limit(40);
  for (const lead of aRenvoyer ?? []) {
    if (lead.dernier_envoi && lead.dernier_envoi > pause) continue;
    const ok = await envoyerGuide(cfg, lead);
    await sb.from("landing_leads").update({ email_envoye: ok, envoi_tentatives: (lead.envoi_tentatives ?? 0) + 1, dernier_envoi: new Date().toISOString() }).eq("id", lead.id);
    if (ok) res.renvoyes++; else { res.echecs++; break; } // domaine pas encore prêt : inutile d'insister sur les suivants
  }
  // 2) Relance unique à J+2 si le guide n'a pas été ouvert.
  const ilya48h = new Date(Date.now() - 48 * 3600_000).toISOString();
  const ilya10j = new Date(Date.now() - 10 * 86400_000).toISOString();
  const { data: aRelancer } = await sb.from("landing_leads").select("id, email, prenom, site, objectif, dernier_envoi")
    .eq("email_envoye", true).eq("email_confirme", false).eq("desinscrit", false).is("relance_le", null).lt("dernier_envoi", ilya48h).gte("created_at", ilya10j).limit(40);
  for (const lead of aRelancer ?? []) {
    const ok = await envoyerGuide(cfg, lead, true);
    if (!ok) break;
    await sb.from("landing_leads").update({ relance_le: new Date().toISOString(), dernier_envoi: new Date().toISOString() }).eq("id", lead.id);
    res.relances++;
  }
  if (res.renvoyes && cfg.email_notif) {
    await envoyer(cfg, cfg.email_from || "Notifications <onboarding@resend.dev>", cfg.email_notif, `Guides envoyés en attente : ${res.renvoyes}`, notifHtml("Les guides en attente sont partis", [["Envoyés", String(res.renvoyes)], ["Relances J+2", String(res.relances)]]), `${res.renvoyes} guide(s) envoyé(s)`);
  }
  return res;
}

Deno.serve(async (req) => {
  const h = { ...cors(req.headers.get("origin")), "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
  if (req.method !== "POST") return json(h, { ok: false, erreur: "methode" }, 405);
  let body: any;
  try { body = await req.json(); } catch { return json(h, { ok: false, erreur: "format" }, 400); }
  const cfg = await reglages();

  // ---------- Tâches planifiées (cron interne uniquement) ----------
  if (body.action === "taches") {
    const cle = req.headers.get("x-cle-interne") ?? "";
    if (!cfg.cle_interne || cle.length !== cfg.cle_interne.length || (await sha(cle)) !== (await sha(cfg.cle_interne))) return json(h, { ok: false }, 401);
    return json(h, { ok: true, ...(await taches(cfg)) });
  }

  // ---------- Désinscription (lien en bas de chaque email) ----------
  if (body.action === "stop") {
    const s = clean(body.s, 120);
    const m = /^([0-9a-f-]{36})\.([0-9a-f]{32})$/.exec(s);
    if (!m || (await signature(m[1], cfg)) !== m[2]) return json(h, { ok: false, erreur: "lien" }, 400);
    await sb.from("landing_leads").update({ desinscrit: true, desinscrit_le: new Date().toISOString(), token_hash: null }).eq("id", m[1]);
    return json(h, { ok: true });
  }

  // ---------- Ouverture du guide depuis le lien reçu par email ----------
  if (body.action === "lire") {
    const t = clean(body.t, 100);
    if (!/^[A-Za-z0-9_-]{40,}$/.test(t)) return json(h, { ok: false, erreur: "lien" }, 400);
    const { data: lead } = await sb.from("landing_leads").select("id, prenom, site, profil, objectif, budget, token_expire, ouvertures, email_confirme").eq("token_hash", await sha(t)).maybeSingle();
    if (!lead || !lead.token_expire || new Date(lead.token_expire) < new Date()) return json(h, { ok: false, erreur: "expire" }, 410);
    if ((lead.ouvertures ?? 0) >= MAX_OUVERTURES) return json(h, { ok: false, erreur: "limite" }, 429);
    const maj: Record<string, unknown> = { ouvertures: (lead.ouvertures ?? 0) + 1 };
    if (!lead.email_confirme) { maj.email_confirme = true; maj.confirme_le = new Date().toISOString(); }
    await sb.from("landing_leads").update(maj).eq("id", lead.id);
    return json(h, { ok: true, prenom: lead.prenom, site: lead.site, titre: titreGuide(lead.site, lead.objectif), contenu: contenu(lead.site, lead.objectif, lead.budget, lead.prenom) });
  }

  // ---------- Liste d'attente ebook (depuis la page du guide, avec le jeton) ----------
  if (body.action === "liste_ebook") {
    const t = clean(body.t, 100);
    const { data: lead } = /^[A-Za-z0-9_-]{40,}$/.test(t) ? await sb.from("landing_leads").select("id, prenom, email, interet_ebook, token_expire").eq("token_hash", await sha(t)).maybeSingle() : { data: null };
    if (!lead || new Date(lead.token_expire) < new Date()) return json(h, { ok: false, erreur: "lien" }, 400);
    if (!lead.interet_ebook) {
      await sb.from("landing_leads").update({ interet_ebook: true }).eq("id", lead.id);
      const n = (await sb.from("landing_leads").select("id", { count: "exact", head: true }).eq("interet_ebook", true)).count ?? 0;
      if (cfg.email_notif) await envoyer(cfg, cfg.email_from || "Notifications <onboarding@resend.dev>", cfg.email_notif, `Liste d'attente ebook 5 € : ${lead.prenom} (total ${n})`, notifHtml(`Intéressé par l'ebook à 5 € — total ${n}`, [["Prénom", lead.prenom], ["Email", lead.email]]), `${lead.prenom} ${lead.email} — total ${n}`);
    }
    return json(h, { ok: true });
  }

  // ---------- Inscription ----------
  const site = SITES[body.site] ? body.site : "utopicar";
  if (clean(body.site_web, 200)) return json(h, { ok: true }); // pot de miel
  const prenom = clean(body.prenom, 60);
  const email = clean(body.email, 254).toLowerCase();
  const profil = PROFILS.has(body.profil) ? body.profil : (site === "ebook" ? "debutant" : null);
  const objectif = clean(body.objectif, 80) || null;
  const budget = BUDGETS.has(body.budget) ? body.budget : null;
  const source = clean(body.source, 60) || "landing";
  if (!prenom || !EMAIL_RE.test(email)) return json(h, { ok: false, erreur: "champs" }, 400);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "inconnue";
  const ip_hash = await sha(ip + "|" + (cfg.cle_interne ?? ""));
  const depuis = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await sb.from("landing_leads").select("id", { count: "exact", head: true }).eq("ip_hash", ip_hash).gte("created_at", depuis);
  if ((count ?? 0) >= 6) return json(h, { ok: false, erreur: "trop" }, 429);

  const { data: exist } = await sb.from("landing_leads").select("id, envoi_tentatives").eq("email", email).limit(1).maybeSingle();
  let nouveau = false;
  let id: string;
  let tentatives = 0;
  if (exist) {
    id = exist.id; tentatives = exist.envoi_tentatives ?? 0;
    const maj: Record<string, unknown> = { prenom, site, desinscrit: false, desinscrit_le: null };
    if (profil) maj.profil = profil; if (objectif) maj.objectif = objectif; if (budget) maj.budget = budget;
    await sb.from("landing_leads").update(maj).eq("id", id);
  } else {
    const { data, error } = await sb.from("landing_leads").insert({ email, prenom, profil, objectif, budget, source, site, ip_hash }).select("id").single();
    if (error || !data) { console.error("insert", error?.message); return json(h, { ok: false, erreur: "base" }, 500); }
    id = data.id; nouveau = true;
  }

  const envoye = await envoyerGuide(cfg, { id, email, prenom, site, objectif });
  await sb.from("landing_leads").update({ email_envoye: envoye, envoi_tentatives: tentatives + 1, dernier_envoi: new Date().toISOString() }).eq("id", id);

  if (nouveau && cfg.email_notif) {
    const total = (await sb.from("landing_leads").select("id", { count: "exact", head: true }).eq("site", site)).count ?? 0;
    const lignes = [["Prénom", prenom], ["Email", email], ["Profil", profil ?? "-"], ["Objectif", objectif ?? "-"], ["Budget", budget ?? "-"], ["Site", SITES[site].nom], ["Formulaire", source], ["Email du guide envoyé", envoye ? "oui" : "pas encore (renvoi automatique toutes les 30 min)"]];
    const ok = await envoyer(cfg, cfg.email_from || "Notifications <onboarding@resend.dev>", cfg.email_notif, `Nouvel inscrit ${SITES[site].nom} : ${prenom} (${objectif ?? profil ?? "?"})`, notifHtml(`Nouvel inscrit ${SITES[site].nom} — n°${total}`, lignes), lignes.map(([k, v]) => `${k} : ${v}`).join("\n"));
    await sb.from("landing_leads").update({ notifie: ok }).eq("id", id);
  }
  return json(h, { ok: true, envoye });
});
