// UTOPICAR : messages Leboncoin automatiques (option de Benef Pro), via l'acteur Apify clearpath/leboncoin-acheteur.
// Appelée toutes les minutes par pg_cron (en-tête x-veille-secret). À chaque appel :
//   1. termine la requête Apify en cours (résultat de l'envoi ou de la boîte de réception) ;
//   2. remplit la file avec les annonces des recherches des campagnes actives (une seule fois par annonce et par compte,
//      annonces qui refusent le démarchage ignorées par défaut) ;
//   3. lance la requête suivante, au plus une toutes les 2 minutes pour tout le site, quel que soit le nombre de comptes
//      (donc 2 minutes au moins entre deux messages d'un même compte).
// Le mot de passe Leboncoin n'est déchiffré qu'ici, en mémoire, pour l'appel à Apify (HTTPS) ; il n'est jamais écrit ni journalisé.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const APIFY = "https://api.apify.com/v2";
const ECART_MS = 120_000; // 2 minutes entre deux requêtes Apify, pour tout le site
const RUN_MAX_MS = 6 * 60_000; // au-delà, la requête est abandonnée
const PAR_CAMPAGNE = 300;

// « pas de démarchage », « démarcheurs s'abstenir », « pros s'abstenir », « pas de marchands », « refuse tout démarchage »…
const REFUS = /(pas|aucun|sans|non|refus\w*)\s+(de\s+|d'|aux?\s+|tout\s+)*(d[ée]march|pro(fessionnel)?s?\b|marchands?|n[ée]gociants?|garag\w*|revendeurs?|achat[- ]revente)|(d[ée]marcheurs?|pros?|professionnels?|marchands?|n[ée]gociants?|garagistes?|revendeurs?)\s+(s'?abst|svp\s+s'?abst|merci\s+de\s+s'?abst|passez\s+votre\s+chemin)|particuliers?\s+(uniquement|seulement)/i;

type Envoi = { id: number; user_id: string; campagne_id: string | null; annonce_id: string; url: string; titre: string | null; prix: number | null; run_id: string | null; traite_le: string | null };

async function reglages() {
  const { data } = await sb.from("reglages").select("cle, valeur");
  return Object.fromEntries((data ?? []).map((r) => [r.cle, r.valeur ?? ""])) as Record<string, string>;
}

const estBlocage = (m: string) => /validation|code|2fa|deux facteurs|double authentification|mot de passe|password|identifiants|authentif|connexion|login|session|bloqu|banni|suspendu/i.test(m);

/** Résultat d'une requête Apify terminée : envoi (statut, conversation) ou boîte de réception. */
async function terminer(token: string) {
  const enCours = (await sb.from("lbc_envois").select("id, user_id, campagne_id, annonce_id, url, titre, prix, run_id, traite_le").eq("statut", "en_cours").limit(5)).data as Envoi[] | null;
  const boites = (await sb.from("lbc_boites").select("user_id, run_id, demande").not("run_id", "is", null).limit(5)).data ?? [];
  let occupe = false;
  for (const job of [...(enCours ?? []).map((e) => ({ k: "envoi" as const, e })), ...boites.map((b) => ({ k: "boite" as const, b }))]) {
    const runId = job.k === "envoi" ? job.e.run_id : job.b.run_id;
    if (!runId) continue;
    const r = await fetch(`${APIFY}/actor-runs/${runId}?token=${encodeURIComponent(token)}`);
    const run = r.ok ? (await r.json()).data : null;
    const debut = run?.startedAt ? Date.parse(run.startedAt) : Date.now();
    if (run && ["READY", "RUNNING"].includes(run.status)) {
      if (Date.now() - debut < RUN_MAX_MS) { occupe = true; continue; }
      await fetch(`${APIFY}/actor-runs/${runId}/abort?token=${encodeURIComponent(token)}`, { method: "POST" });
      run.status = "TIMED-OUT";
    }
    const items: any[] = run?.status === "SUCCEEDED" ? await (await fetch(`${APIFY}/datasets/${run.defaultDatasetId}/items?token=${encodeURIComponent(token)}&clean=true&format=json&limit=500`)).json().catch(() => []) : [];
    const message = String(run?.statusMessage ?? (run ? `Requête Apify ${run.status}` : "Requête Apify introuvable")).slice(0, 400);
    const uid = job.k === "envoi" ? job.e.user_id : job.b.user_id;

    if (job.k === "envoi") {
      const it = (Array.isArray(items) ? items : []).find((x) => x && typeof x === "object");
      const ok = it?.status === "success";
      await sb.from("lbc_envois").update({
        statut: ok ? "envoye" : "erreur",
        raison: ok ? null : String(it?.error ?? it?.message ?? message).slice(0, 400),
        conversation_id: ok ? String(it.conversation_id ?? "").slice(0, 400) || null : null,
        traite_le: new Date().toISOString(),
      }).eq("id", job.e.id);
      await bilanCompte(uid, ok, ok ? "" : String(it?.error ?? it?.message ?? message));
    } else {
      const liste = (Array.isArray(items) ? items : []).filter((x) => x && typeof x === "object");
      if (run?.status === "SUCCEEDED") {
        // conversations : ce que l'acteur renvoie, réduit à l'utile ; annonces déjà contactées : jamais recontactées
        const convs = liste.filter((x) => x.conversation_id || x.conversationId).slice(0, 60).map((x) => ({
          id: String(x.conversation_id ?? x.conversationId),
          nom: String(x.partner_name ?? x.partnerName ?? x.correspondent ?? "").slice(0, 80),
          annonce: String(x.ad_subject ?? x.adSubject ?? x.ad_title ?? x.subject ?? "").slice(0, 160),
          annonce_id: String(x.ad_id ?? x.adId ?? x.list_id ?? "").slice(0, 20),
          dernier: String(x.last_message ?? x.lastMessage ?? x.last_message_text ?? "").slice(0, 300),
          le: x.last_message_date ?? x.lastMessageDate ?? x.updated_at ?? null,
          non_lus: Number(x.unread_count ?? x.unreadCount ?? x.unread ?? 0) || 0,
        }));
        const contactees = new Set<string>();
        for (const x of liste) {
          for (const a of [].concat(x.contacted_ads ?? x.contactedAds ?? [])) {
            const id = String((a as any)?.ad_id ?? (a as any)?.adId ?? (a as any)?.list_id ?? a ?? "").match(/\d{6,14}/)?.[0];
            if (id) contactees.add(id);
          }
          if (x.ad_id && (x.conversation_id || x.conversationId)) contactees.add(String(x.ad_id));
        }
        if (contactees.size) {
          const lignes = [...contactees].map((id) => ({ user_id: uid, annonce_id: id, url: `https://www.leboncoin.fr/ad/voitures/${id}`, statut: "envoye", raison: "Déjà contactée sur Leboncoin", traite_le: new Date().toISOString() }));
          await sb.from("lbc_envois").upsert(lignes, { onConflict: "user_id,annonce_id", ignoreDuplicates: true });
          // celles qui attendaient encore : retirées de la file
          await sb.from("lbc_envois").update({ statut: "annule", raison: "Déjà contactée sur Leboncoin", traite_le: new Date().toISOString() }).eq("user_id", uid).eq("statut", "en_attente").in("annonce_id", [...contactees]);
        }
        await sb.from("lbc_boites").update({ conversations: convs, total: convs.length, non_lus: convs.reduce((s, c) => s + c.non_lus, 0), maj: new Date().toISOString(), demande: null, run_id: null, erreur: null }).eq("user_id", uid);
        await bilanCompte(uid, true, "");
      } else {
        await sb.from("lbc_boites").update({ demande: null, run_id: null, erreur: message }).eq("user_id", uid);
        await bilanCompte(uid, false, message);
      }
    }
  }
  return occupe;
}

/** État du compte Leboncoin après une requête. Connexion refusée (mot de passe, double authentification) : campagnes arrêtées. */
async function bilanCompte(uid: string, ok: boolean, message: string) {
  if (ok) {
    await sb.from("lbc_comptes").update({ statut: "ok", erreur: null }).eq("user_id", uid);
    return;
  }
  if (!estBlocage(message)) return;
  await sb.from("lbc_comptes").update({ statut: "erreur", erreur: message.slice(0, 400) }).eq("user_id", uid);
  await sb.from("lbc_campagnes").update({ actif: false, updated_at: new Date().toISOString() }).eq("user_id", uid).eq("actif", true);
}

/** File : les annonces Leboncoin des recherches des campagnes actives, une fois par annonce et par compte. */
async function remplir() {
  const { data: campagnes } = await sb.from("lbc_campagnes").select("id, user_id, recherche_id, ignorer_refus").eq("actif", true).limit(200);
  for (const c of campagnes ?? []) {
    const { data: ok } = await sb.rpc("option_active", { p_uid: c.user_id, p_option: "messages" });
    if (ok !== true) {
      await sb.from("lbc_campagnes").update({ actif: false }).eq("id", c.id);
      continue;
    }
    const { data: j } = await sb.from("recherches_journal").select("resultat").eq("recherche_id", c.recherche_id).not("resultat", "is", null).order("maj", { ascending: false }).limit(1).maybeSingle();
    const annonces = ((j?.resultat as any)?.annonces ?? []) as { id: string; titre: string; prix: number; url: string | null; piege?: boolean }[];
    const cibles = annonces
      .map((a) => ({ a, id: String(a.url ?? "").match(/leboncoin\.fr\/(?:ad\/)?[a-z_]+\/(\d{6,14})/)?.[1] ?? (/^\d{6,14}$/.test(a.id) ? a.id : null) }))
      .filter((x): x is { a: (typeof annonces)[number]; id: string } => !!x.id && !x.a.piege)
      .slice(0, PAR_CAMPAGNE);
    if (!cibles.length) continue;
    const { data: deja } = await sb.from("lbc_envois").select("annonce_id").eq("user_id", c.user_id).in("annonce_id", cibles.map((x) => x.id));
    const vues = new Set((deja ?? []).map((x) => x.annonce_id));
    const nouvelles = cibles.filter((x) => !vues.has(x.id));
    if (!nouvelles.length) continue;
    // texte de l'annonce (base du marché) pour repérer le refus de démarchage
    const textes = new Map<string, string>();
    if (c.ignorer_refus) {
      const ids = nouvelles.map((x) => x.id);
      const [{ data: ca }, { data: an }] = await Promise.all([
        sb.from("cote_annonces").select("id, texte").in("id", ids),
        sb.from("annonces").select("id, description").in("id", ids),
      ]);
      for (const x of ca ?? []) textes.set(x.id, `${textes.get(x.id) ?? ""} ${x.texte ?? ""}`);
      for (const x of an ?? []) textes.set(x.id, `${textes.get(x.id) ?? ""} ${x.description ?? ""}`);
    }
    const lignes = nouvelles.map(({ a, id }) => {
      const refus = c.ignorer_refus && REFUS.test(`${a.titre ?? ""} ${textes.get(id) ?? ""}`);
      return {
        user_id: c.user_id, campagne_id: c.id, annonce_id: id, url: `https://www.leboncoin.fr/ad/voitures/${id}`,
        titre: String(a.titre ?? "").slice(0, 200), prix: Number.isFinite(a.prix) ? Math.round(a.prix) : null,
        statut: refus ? "ignoree" : "en_attente", raison: refus ? "Refuse le démarchage" : null, traite_le: refus ? new Date().toISOString() : null,
      };
    });
    await sb.from("lbc_envois").upsert(lignes, { onConflict: "user_id,annonce_id", ignoreDuplicates: true });
  }
}

/** Prochaine requête : d'abord une boîte de réception demandée, sinon le plus ancien message en attente d'une campagne active. */
async function lancerSuivante(R: Record<string, string>) {
  const acteur = R.lbc_acteur || "clearpath~leboncoin-acheteur";
  const plafond = Number(R.lbc_max_usd || "1"); // garde-fou : jamais plus de 1 $ par requête sans réglage explicite
  const { data: b } = await sb.from("lbc_boites").select("user_id").not("demande", "is", null).is("run_id", null).order("demande").limit(1).maybeSingle();
  let job: { k: "boite"; uid: string } | { k: "envoi"; e: Envoi; message: string } | null = b ? { k: "boite", uid: b.user_id } : null;
  if (!job) {
    const { data: es } = await sb.from("lbc_envois").select("id, user_id, campagne_id, annonce_id, url, titre, prix, run_id, traite_le, lbc_campagnes!inner(actif, message)").eq("statut", "en_attente").eq("lbc_campagnes.actif", true).order("created_at").limit(1);
    const e = (es ?? [])[0] as (Envoi & { lbc_campagnes: { actif: boolean; message: string } }) | undefined;
    if (e) job = { k: "envoi", e, message: e.lbc_campagnes.message };
  }
  if (!job) return { rien: true };
  const uid = job.k === "boite" ? job.uid : job.e.user_id;

  // créneau global : pris de façon atomique (deux appels simultanés ne lancent jamais deux requêtes)
  const avant = R.lbc_dernier_run ?? "";
  const { data: pris } = await sb.from("reglages").update({ valeur: new Date().toISOString() }).eq("cle", "lbc_dernier_run").eq("valeur", avant).select("cle");
  if (!pris?.length) return { occupe: true };

  const { data: ids } = await sb.rpc("lbc_identifiants", { p_uid: uid });
  const id = (ids ?? [])[0] as { email: string; mdp: string; nom_affiche: string | null } | undefined;
  if (!id?.mdp) {
    if (job.k === "boite") await sb.from("lbc_boites").update({ demande: null, erreur: "Compte Leboncoin non renseigné." }).eq("user_id", uid);
    else await sb.from("lbc_envois").update({ statut: "erreur", raison: "Compte Leboncoin non renseigné.", traite_le: new Date().toISOString() }).eq("id", job.e.id);
    return { erreur: "identifiants" };
  }
  const remplace = (t: string, e: Envoi) => t.replace(/\{titre\}/gi, e.titre || "votre véhicule").replace(/\{prix\}/gi, e.prix != null ? `${e.prix.toLocaleString("fr-FR")} €` : "le prix affiché").slice(0, 2500);
  const entree = job.k === "boite"
    ? { action: "fetchInbox", email: id.email, password: id.mdp, inboxLimit: 50, includeContactedAds: true }
    : { action: "sendMessage", email: id.email, password: id.mdp, adUrl: job.e.url, message: remplace(job.message, job.e), ...(id.nom_affiche ? { senderName: id.nom_affiche } : {}) };
  const r = await fetch(`${APIFY}/acts/${acteur}/runs?token=${encodeURIComponent(R.apify_token)}&timeout=240&memory=512${plafond > 0 ? `&maxTotalChargeUsd=${plafond}` : ""}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entree),
  });
  const t = await r.text();
  if (!r.ok) {
    const err = `Apify ${r.status} : ${t.slice(0, 200)}`;
    if (job.k === "boite") await sb.from("lbc_boites").update({ demande: null, erreur: err }).eq("user_id", uid);
    else await sb.from("lbc_envois").update({ statut: "erreur", raison: err, traite_le: new Date().toISOString() }).eq("id", job.e.id);
    return { erreur: err };
  }
  const run = JSON.parse(t).data;
  if (job.k === "boite") await sb.from("lbc_boites").update({ run_id: run.id }).eq("user_id", uid);
  else await sb.from("lbc_envois").update({ statut: "en_cours", run_id: run.id, traite_le: new Date().toISOString() }).eq("id", job.e.id);
  return { lance: job.k, run: run.id };
}

Deno.serve(async (req) => {
  const R = await reglages();
  if (!R.cle_interne || req.headers.get("x-veille-secret") !== R.cle_interne) return new Response("refusé", { status: 401 });
  if (R.lbc_actif !== "oui" || !R.apify_token) return Response.json({ arret: "désactivé" });
  try {
    const occupe = await terminer(R.apify_token);
    // fin des essais : plus aucun nouvel envoi après la date réglée (les requêtes en cours se terminent)
    if (R.lbc_jusqu_au && Date.now() > Date.parse(R.lbc_jusqu_au)) return Response.json({ arret: "date", jusqu_au: R.lbc_jusqu_au });
    await remplir();
    if (occupe) return Response.json({ occupe: true });
    const dernier = Date.parse(R.lbc_dernier_run || "");
    if (Number.isFinite(dernier) && Date.now() - dernier < ECART_MS) return Response.json({ attente: Math.round((ECART_MS - (Date.now() - dernier)) / 1000) });
    return Response.json(await lancerSuivante(R));
  } catch (e) {
    console.error("messages", String(e).slice(0, 300));
    return Response.json({ erreur: "interne" }, { status: 500 });
  }
});
