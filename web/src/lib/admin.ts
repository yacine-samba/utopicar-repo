import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { supabaseService } from "./supabase/service";
import { OFFRES, STATUTS_ACTIFS, type OffreId } from "./offres";
import { GUIDES, guidesOuverts, type GuideId } from "./guides";

/* Page Administration (/app/admin) : lecture de tous les comptes et des inscrits au guide, cadeaux, envoi des guides.
   Tout passe par la clé service, et seulement après vérification de profils.admin (route /api/admin et page). */

export type CompteAdmin = {
  id: string;
  email: string;
  prenom: string;
  inscritLe: string;
  famille: string | null;
  formule: OffreId;
  /** Formule attribuée à la main (profils.formule_offerte), encore valable. */
  offerte: { id: OffreId; jusquAu: string | null } | null;
  stripe: { offre: string; statut: string; periodeFin: string | null } | null;
  illimite: boolean;
  credits: number;
  analysesMois: number;
  rapports: number;
  /** Guides ouverts en entier (formule, cadeaux, achat des quatre). */
  guides: GuideId[];
  messages: boolean;
};

export type LeadAdmin = {
  id: string;
  email: string;
  prenom: string;
  site: string;
  objectif: string | null;
  budget: string | null;
  source: string | null;
  inscritLe: string;
  envoye: boolean;
  ouvert: boolean;
  ouvertures: number;
  dernierEnvoi: string | null;
  desinscrit: boolean;
  /** Guide qu'il reçoit : choisi depuis l'administration, sinon celui de son profil. */
  guide: GuideId;
  /** Un compte utopicar.fr existe avec la même adresse. */
  compte: boolean;
};

export type JournalAdmin = { id: number; action: string; cible: string | null; details: Record<string, unknown>; le: string };

const debutMois = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();
const ilYa12Mois = () => new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString();

/** Même règle que credits_solde : solde à zéro si le dernier achat ou cadeau a plus de 12 mois. */
function soldeCredits(lignes: { delta: number; created_at: string }[]) {
  const dernier = lignes.filter((l) => l.delta > 0).reduce((m, l) => (l.created_at > m ? l.created_at : m), "");
  if (!dernier || dernier < ilYa12Mois()) return 0;
  return Math.max(0, lignes.reduce((s, l) => s + l.delta, 0));
}

export async function donneesAdmin() {
  const sb = supabaseService();
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const [profils, abos, achats, credits, usages, rapports, options, leads, journal] = await Promise.all([
    sb.from("profils").select("id, email, prenom, famille, formule_offerte, offerte_jusqu_au, illimite, created_at").order("created_at", { ascending: false }).limit(500),
    sb.from("abonnements").select("user_id, offre, statut, periode_fin"),
    sb.from("achats").select("user_id, produit").like("produit", "guide%"),
    sb.from("credits").select("user_id, delta, created_at"),
    sb.from("usages").select("user_id").gte("created_at", debutMois()),
    sb.from("rapports").select("user_id"),
    sb.from("options_comptes").select("user_id, statut, offerte").eq("option", "messages"),
    sb.from("landing_leads").select("id, email, prenom, site, objectif, guide, budget, source, created_at, email_envoye, email_confirme, ouvertures, dernier_envoi, desinscrit").order("created_at", { ascending: false }).limit(500),
    sb.from("journal_admin").select("id, action, cible, details, created_at").order("created_at", { ascending: false }).limit(30),
  ]);
  if (profils.error) throw new Error(`profils : ${profils.error.message}`);

  const parUser = <T extends { user_id: string }>(l: T[] | null) => {
    const m = new Map<string, T[]>();
    for (const x of l ?? []) m.set(x.user_id, [...(m.get(x.user_id) ?? []), x]);
    return m;
  };
  const abo = new Map((abos.data ?? []).map((a) => [a.user_id, a]));
  const ac = parUser(achats.data);
  const cr = parUser(credits.data);
  const us = parUser(usages.data);
  const rp = parUser(rapports.data);
  const msg = new Map((options.data ?? []).map((o) => [o.user_id, o]));

  const comptes: CompteAdmin[] = (profils.data ?? []).map((p) => {
    const a = abo.get(p.id);
    const aboActif = a && STATUTS_ACTIFS.includes(a.statut) ? (a.offre as OffreId) : null;
    const offerte = p.formule_offerte && (!p.offerte_jusqu_au || p.offerte_jusqu_au >= aujourdhui) ? { id: p.formule_offerte as OffreId, jusquAu: p.offerte_jusqu_au as string | null } : null;
    const formule: OffreId = p.illimite ? "pro" : (offerte?.id ?? aboActif ?? "gratuit");
    const m = msg.get(p.id);
    return {
      id: p.id,
      email: p.email ?? "",
      prenom: p.prenom ?? "",
      inscritLe: p.created_at,
      famille: p.famille,
      formule,
      offerte,
      stripe: a ? { offre: a.offre, statut: a.statut, periodeFin: a.periode_fin } : null,
      illimite: !!p.illimite,
      credits: soldeCredits(cr.get(p.id) ?? []),
      analysesMois: us.get(p.id)?.length ?? 0,
      rapports: rp.get(p.id)?.length ?? 0,
      guides: guidesOuverts(!!p.illimite, formule, (ac.get(p.id) ?? []).map((a) => a.produit)),
      messages: !!m && (m.offerte || STATUTS_ACTIFS.includes(m.statut)),
    };
  });

  const emails = new Set(comptes.map((c) => c.email.toLowerCase()));
  const inscrits: LeadAdmin[] = (leads.data ?? []).map((l) => ({
    id: l.id,
    email: l.email,
    prenom: l.prenom ?? "",
    site: l.site ?? "utopicar",
    objectif: l.objectif,
    budget: l.budget,
    source: l.source,
    inscritLe: l.created_at,
    envoye: !!l.email_envoye,
    ouvert: !!l.email_confirme,
    ouvertures: l.ouvertures ?? 0,
    dernierEnvoi: l.dernier_envoi,
    desinscrit: !!l.desinscrit,
    guide: (l.guide as GuideId | null) ?? guideDuProfil(l.site ?? "utopicar", l.objectif),
    compte: emails.has(l.email.toLowerCase()),
  }));

  return {
    comptes,
    inscrits,
    journal: (journal.data ?? []).map((j): JournalAdmin => ({ id: j.id, action: j.action, cible: j.cible, details: (j.details as Record<string, unknown>) ?? {}, le: j.created_at })),
  };
}

export async function noter(adminId: string, action: string, cible: string | null, details: Record<string, unknown> = {}) {
  const { error } = await supabaseService().from("journal_admin").insert({ admin_id: adminId, action, cible, details });
  if (error) console.error("journal_admin", error.message);
}

// ------------------------------------------------------------------ e-mails (Resend, mêmes réglages que les fonctions Supabase)

async function reglages() {
  const { data } = await supabaseService().from("reglages").select("cle,valeur").in("cle", ["resend_key", "email_from_leads", "email_reply", "cle_interne"]);
  return Object.fromEntries((data ?? []).map((r) => [r.cle, r.valeur])) as Record<string, string>;
}

async function envoyer(cfg: Record<string, string>, nom: string, to: string, sujet: string, html: string, text: string, headers?: Record<string, string>) {
  if (!cfg.resend_key) throw new Error("Envoi d'e-mails non configuré (resend_key).");
  const a = cfg.email_from_leads;
  const from = a ? (a.includes("<") ? a : `${nom} <${a}>`) : `${nom} <onboarding@resend.dev>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.resend_key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: sujet, html, text, ...(cfg.email_reply ? { reply_to: cfg.email_reply } : {}), ...(headers ? { headers } : {}) }),
  });
  if (!r.ok) throw new Error(`Envoi refusé par Resend (${r.status}).`);
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function gabarit(marque: string, titre: string, texte: string, bouton: string, lien: string, bas: string) {
  return `<div style="background:#f5f1ea;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;color:#15110d"><div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:28px">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#d9481a;font-weight:bold">${esc(marque)}</p>
<h1 style="margin:0 0 14px;font-size:24px;line-height:1.2">${esc(titre)}</h1>
<p style="margin:0 0 22px;font-size:16px;line-height:1.5;color:#3b352f">${texte}</p>
<p style="margin:0 0 22px"><a href="${lien}" style="display:inline-block;background:#ff5a1f;color:#160904;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:999px;font-size:16px">${esc(bouton)}</a></p>
<p style="margin:0;font-size:13px;line-height:1.5;color:#6b635b">${bas}</p>
<hr style="border:0;border-top:1px solid #e2dace;margin:22px 0"><p style="margin:0;font-size:13px;color:#6b635b">Yacine — ${esc(marque)} · <a href="https://utopicar.fr" style="color:#6b635b">utopicar.fr</a></p></div></div>`;
}

const dateFr = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });

export type Cadeau = { type: "guides"; guide: GuideId } | { type: "formule"; offre: OffreId; jusquAu: string | null } | { type: "credits"; n: number };

/** Prévient un compte de ce qui vient de lui être offert. */
export async function emailCadeau(site: string, dest: { email: string; prenom: string }, c: Cadeau) {
  const cfg = await reglages();
  const p = dest.prenom ? `${dest.prenom}, ` : "";
  let sujet: string, titre: string, texte: string, bouton: string, lien: string;
  if (c.type === "guides") {
    const g = GUIDES.find((x) => x.id === c.guide)!;
    sujet = `${p}votre guide « ${g.titre} » est ouvert`;
    titre = g.titre;
    texte = `Utopicar vous offre le guide <b>« ${esc(g.titre)} »</b> : ${esc(g.resume.charAt(0).toLowerCase() + g.resume.slice(1))} Il se lit dans votre espace et s'imprime en PDF.`;
    bouton = "Lire mon guide";
    lien = `${site}/app/guides?guide=${g.id}`;
  } else if (c.type === "formule") {
    const o = OFFRES[c.offre];
    const nom = o.famille === "benef" ? `Benef ${o.nom}` : o.nom;
    const g = guidesOuverts(false, c.offre, []).length;
    sujet = `${p}la formule ${nom} vous est offerte`;
    titre = `${nom}, offerte`;
    texte = `Utopicar vous offre la formule <b>${esc(nom)}</b> ${c.jusquAu ? `jusqu'au ${dateFr(c.jusquAu)} inclus` : "sans date de fin"} : ${o.analyses} analyses par mois${g ? `, ${g} guide${g > 1 ? "s" : ""} inclus` : ""}. Rien à payer, aucune carte bancaire demandée.`;
    bouton = "Ouvrir mon espace";
    lien = `${site}/app`;
  } else {
    sujet = `${p}${c.n} analyse${c.n > 1 ? "s" : ""} vous ${c.n > 1 ? "sont offertes" : "est offerte"}`;
    titre = `${c.n} crédit${c.n > 1 ? "s" : ""} offert${c.n > 1 ? "s" : ""}`;
    texte = `Utopicar vous offre ${c.n} crédit${c.n > 1 ? "s" : ""} d'analyse. Collez le lien d'une annonce Leboncoin : chaque crédit vaut une analyse détaillée avec 3 photos. Ils restent valables 12 mois.`;
    bouton = "Analyser une annonce";
    lien = `${site}/app/analyser`;
  }
  const bas = `Vous recevez ce message parce que vous avez un compte Utopicar (${esc(dest.email)}).`;
  await envoyer(cfg, "Utopicar", dest.email, sujet, gabarit("Utopicar", titre, texte, bouton, lien, bas), `${titre}\n\n${texte.replace(/<[^>]+>/g, "")}\n\n${bouton} : ${lien}\n\nYacine — Utopicar`);
}

// Inscrits au guide (landing_leads) : même lien personnel que la fonction Supabase « inscription » (/guide?t=…, 30 jours).
const SITES: Record<string, { url: string; nom: string; tu: boolean }> = {
  utopicar: { url: "https://utopicar.fr", nom: "Utopicar", tu: false },
  ebook: { url: "https://utopicar.fr/benef", nom: "Bénef", tu: true },
};
const JOURS_VALIDITE = 30;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

/** Guide que donne le profil (repris de selection et contenu dans supabase/functions/inscription/guides.ts). */
function guideDuProfil(site: string, objectif: string | null): GuideId {
  if (site === "ebook" || objectif === "Me lancer dans l'achat-revente") return "premiere-revente";
  if (objectif === "Estimer des reprises") return "estimer-reprise";
  if (objectif === "Trouver ma prochaine voiture") return "acheter-occasion";
  return "trier-annonces";
}
const OBJECTIF_DU_GUIDE: Record<GuideId, string> = {
  "premiere-revente": "Me lancer dans l'achat-revente",
  "trier-annonces": "Trier plus vite mes annonces",
  "estimer-reprise": "Estimer des reprises",
  "acheter-occasion": "Trouver ma prochaine voiture",
};

/** Repris de supabase/functions/inscription/guides.ts (titreGuide). */
function titreGuide(site: string, objectif: string | null) {
  if (site === "ebook") return "Ta première revente, étape par étape";
  if (objectif === "Estimer des reprises") return "Estimer une reprise en 2 minutes";
  if (objectif === "Me lancer dans l'achat-revente") return "Ta première revente, étape par étape";
  if (objectif === "Trouver ma prochaine voiture") return "Acheter votre prochaine occasion sans vous faire avoir";
  return "Trier 40 annonces en 10 minutes";
}

/** Envoie à un inscrit le guide choisi : nouveau lien personnel (l'ancien cesse de marcher). Refusé s'il s'est désinscrit.
    Le choix est gardé dans landing_leads.guide : la fonction « inscription » sert ce guide à l'ouverture du lien et dans la relance. */
export async function envoyerGuideLead(id: string, guide: GuideId) {
  const sb = supabaseService();
  const { data: l } = await sb.from("landing_leads").select("id, email, prenom, site, objectif, desinscrit, envoi_tentatives").eq("id", id).maybeSingle();
  if (!l) throw new Error("Inscrit introuvable.");
  if (l.desinscrit) throw new Error("Cette personne s'est désinscrite : on ne lui écrit plus.");
  const cfg = await reglages();
  const s = SITES[l.site] ? l.site : "utopicar";
  const S = SITES[s];
  const t = (vous: string, toi: string) => (S.tu ? toi : vous);
  const jeton = randomBytes(32).toString("base64url");
  const lien = `${S.url}/guide?t=${jeton}`;
  const stop = `${S.url}/guide?stop=${l.id}.${sha(`stop|${l.id}|${cfg.cle_interne ?? ""}`).slice(0, 32)}`;
  // même règle que selection() dans la fonction : la première revente sur Bénef garde le guide Bénef
  const titre = guide === "premiere-revente" && s === "ebook" ? titreGuide(s, l.objectif) : titreGuide("utopicar", OBJECTIF_DU_GUIDE[guide]);
  const prenom = l.prenom || t("Bonjour", "Salut");
  const { error } = await sb.from("landing_leads").update({ guide, token_hash: sha(jeton), token_expire: new Date(Date.now() + JOURS_VALIDITE * 86400_000).toISOString() }).eq("id", l.id);
  if (error) throw new Error("Lien personnel impossible à créer.");
  const sujet = t(`${prenom}, votre guide « ${titre} » est prêt`, `${prenom}, ton guide « ${titre} » est prêt`);
  const texte = t(`Voici votre accès personnel au guide <b>« ${esc(titre)} »</b>.`, `Voici ton accès personnel au guide <b>« ${esc(titre)} »</b>.`);
  const perso = t(`Ce lien est personnel et valable ${JOURS_VALIDITE} jours. Ne le partagez pas.`, `Ce lien est personnel et valable ${JOURS_VALIDITE} jours. Ne le partage pas.`);
  const pied = t(`Vous recevez ce message parce que vous avez demandé le guide sur ${S.nom}.`, `Tu reçois ce message parce que tu as demandé le guide sur ${S.nom}.`);
  const bas = `${perso}<br>${pied} <a href="${stop}" style="color:#6b635b">Ne plus recevoir de messages</a>.`;
  await envoyer(
    cfg,
    S.nom,
    l.email,
    sujet,
    gabarit(S.nom, t(`Votre guide est prêt, ${prenom}`, `Ton guide est prêt, ${prenom}`), texte, "Ouvrir mon guide", lien, bas),
    `${texte.replace(/<[^>]+>/g, "")}\n${lien}\n\n${perso}\n\nYacine — ${S.nom}\nNe plus recevoir de messages : ${stop}`,
    { "List-Unsubscribe": `<${stop}>` },
  );
  await sb.from("landing_leads").update({ email_envoye: true, envoi_tentatives: (l.envoi_tentatives ?? 0) + 1, dernier_envoi: new Date().toISOString() }).eq("id", l.id);
  return l.email as string;
}

/** Justesse de l'analyse (fonction SQL justesse_analyse) : vitesse de vente selon la position face à la cote,
    couverture de la cote, verdicts, retours « ce chiffre est faux ». null si la fonction n'est pas encore en base. */
export type Justesse = {
  tranches: { t: number; l: string; annonces: number; disparues: number; jours_median: number | null; pct_15j: number | null }[] | null;
  rapports: { total: number; trente_jours: number; sans_cote: number; avec_bilan: number };
  verdicts: Record<string, number>;
  retours: { champ: string; outil: string | null; juste: string | null; commentaire: string | null; le: string; rapport: string | null }[];
  prix_vus: number;
};
export async function justesseAnalyse(): Promise<Justesse | null> {
  const { data, error } = await supabaseService().rpc("justesse_analyse");
  if (error) {
    console.error("justesse_analyse", error.message);
    return null;
  }
  return data as Justesse;
}
