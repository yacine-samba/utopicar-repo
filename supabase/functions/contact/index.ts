// Formulaire de contact public des sites (mentions légales). Aucun email affiché sur les sites :
// le message est stocké puis transféré par Resend à l'adresse de notification.
// Protections : validation, pot de miel, limite par IP, écriture côté serveur uniquement.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const SITES: Record<string, string> = { utopicar: "Utopicar", ebook: "Bénef" };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
function cors(origin: string | null) {
  const ok = origin && (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) || /^https:\/\/(www\.)?utopicar\.fr$/.test(origin));
  return { "Access-Control-Allow-Origin": ok ? origin! : "https://utopicar.fr", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "content-type", "Vary": "Origin", "Content-Type": "application/json", "Cache-Control": "no-store" };
}
async function sha(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const h = cors(req.headers.get("origin"));
  const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: h });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
  if (req.method !== "POST") return json({ ok: false }, 405);
  let b: any; try { b = await req.json(); } catch { return json({ ok: false, erreur: "format" }, 400); }
  if (clean(b.site_web, 200)) return json({ ok: true });
  const site = SITES[b.site] ? b.site : "utopicar";
  const prenom = clean(b.prenom, 60).replace(/\s+/g, " ");
  const email = clean(b.email, 254).toLowerCase();
  const message = clean(b.message, 3000);
  if (!prenom || !EMAIL_RE.test(email) || message.length < 5) return json({ ok: false, erreur: "champs" }, 400);

  const { data: cfgRows } = await sb.from("reglages").select("cle,valeur").in("cle", ["resend_key", "email_notif", "email_from", "cle_interne"]);
  const cfg = Object.fromEntries((cfgRows ?? []).map((r: any) => [r.cle, r.valeur])) as Record<string, string>;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "inconnue";
  const ip_hash = await sha(ip + "|" + (cfg.cle_interne ?? ""));
  const { count } = await sb.from("contact_messages").select("id", { count: "exact", head: true }).eq("ip_hash", ip_hash).gte("created_at", new Date(Date.now() - 3600_000).toISOString());
  if ((count ?? 0) >= 3) return json({ ok: false, erreur: "trop" }, 429);

  const { data: row, error } = await sb.from("contact_messages").insert({ site, prenom, email, message, ip_hash }).select("id").single();
  if (error) { console.error(error.message); return json({ ok: false, erreur: "base" }, 500); }

  let ok = false;
  if (cfg.resend_key && cfg.email_notif) {
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#15110d"><h2 style="margin:0 0 12px">Message via ${esc(SITES[site])}</h2><p><b>${esc(prenom)}</b> &lt;${esc(email)}&gt;</p><p style="white-space:pre-wrap;background:#f5f1ea;padding:14px;border-radius:10px">${esc(message)}</p><p style="color:#6b635b;font-size:13px">Répondez directement à cet email pour lui répondre.</p></div>`;
    try {
      const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${cfg.resend_key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: cfg.email_from || "Notifications <onboarding@resend.dev>", to: [cfg.email_notif], reply_to: email, subject: `Contact ${SITES[site]} : ${prenom}`, html, text: `${prenom} <${email}>\n\n${message}` }) });
      ok = r.ok; if (!ok) console.error("resend", r.status, await r.text());
    } catch (e) { console.error(String(e)); }
    await sb.from("contact_messages").update({ notifie: ok }).eq("id", row.id);
  }
  return json({ ok: true });
});
