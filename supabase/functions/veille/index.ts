// UTOPICAR : collecte automatique des nouvelles annonces Leboncoin via un acteur Apify.
// Appelée par pg_cron (en-tête x-veille-secret) et par le webhook Apify de fin de run (?k=secret).
import { createClient } from 'npm:@supabase/supabase-js@2';
function encodeBase64(b: Uint8Array) { let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(s); }

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const sb = createClient(SB_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const FN = SB_URL + '/functions/v1/veille';
let APIFY = 'https://api.apify.com/v2'; // remplaçable par le réglage apify_base (tests)
const MAX_PHOTOS = 6;
// Premier passage d'une alerte (nouvelle ou critères modifiés) : toutes les annonces qui correspondent, jusqu'à cette limite.
// Ensuite, seulement celles parues depuis le passage précédent (lecture adaptative, voir collect).
const COLLECTE_MAX = 300;
const VIGNETTES_INITIALES = 40; // collecte complète : vignettes des plus récentes seulement, pas de photos en grand
// Modèles fiables 3 000 – 7 000 € (même liste que dans l'outil). [marque exigée ou null, modèle]
const FIAB: [string, RegExp | null, RegExp][] = [
  ['yaris', /toyota/, /\byaris\b(?! ?cross)/], ['aygo', null, /\baygo\b/], ['aygo', /citroen/, /\bc1\b/], ['aygo', /peugeot/, /\b10[78]\b/],
  ['jazz', /honda/, /\bjazz\b/], ['swift', /suzuki/, /\bswift\b/], ['mazda2', /mazda/, /\bmazda ?2\b/],
  ['clio', /renault/, /\bclio\b/], ['sandero', /dacia/, /\bsandero\b|\blogan\b/], ['207', /peugeot/, /\b20[67]\b/], ['208', /peugeot/, /\b208\b/],
  ['c3', /citroen/, /\bc3\b(?! ?(aircross|picasso))/], ['fiesta', /ford/, /\bfiesta\b/], ['i20rio', /hyundai|kia/, /\bi20\b|\brio\b/], ['i10picanto', /hyundai|kia/, /\bi10\b|\bpicanto\b/],
  ['auris', /toyota/, /\bauris\b/], ['polo', /volkswagen|\bvw\b/, /\bpolo\b/], ['twingo', /renault/, /\btwingo\b/], ['fabia', /skoda/, /\bfabia\b/],
];
const flat = (s: unknown) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function fiab(r: any): string | null {
  const t = flat([r.marque, r.modele, r.titre].filter(Boolean).join(' '));
  for (const [id, b, m] of FIAB) if ((!b || b.test(t)) && m.test(t)) return id;
  return null;
}

const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });
async function reglages(): Promise<Record<string, string>> {
  const { data } = await sb.from('reglages').select('cle,valeur');
  return Object.fromEntries((data || []).map((r: any) => [r.cle, r.valeur]));
}
// « 21 h » en français donnait NaN : la plage horaire bloquait toutes les collectes automatiques
function parisHour(d = new Date()) { return parseInt(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Paris' }).format(d), 10); }
function parisOffsetMin(d: Date) { return (Date.parse(d.toLocaleString('en-US', { timeZone: 'Europe/Paris' })) - Date.parse(d.toLocaleString('en-US', { timeZone: 'UTC' }))) / 60000; }
function parsePub(s: unknown): string | null {
  if (!s) return null; const t = String(s).trim();
  if (/[zZ]|[+-]\d\d:?\d\d$/.test(t)) { const d = new Date(t); return isNaN(+d) ? null : d.toISOString(); }
  const g = new Date(t.replace(' ', 'T') + 'Z'); if (isNaN(+g)) return null;
  return new Date(+g - parisOffsetMin(g) * 60000).toISOString();
}
// coupe sans casser un emoji (une moitié d'emoji rend le JSON invalide pour Postgres)
const cut = (s: unknown, n: number) => Array.from(String(s ?? '')).slice(0, n).join('').replace(/[\ud800-\udfff]/g, '');
const num = (s: unknown) => { if (s == null) return null; if (typeof s === 'number') return isFinite(s) ? s : null; const m = String(s).replace(/[^\d]/g, ''); return m ? Number(m) : null; };
const apifyErr = (st: number, t: string) => st === 401 ? 'Clé Apify refusée : vérifiez-la dans UTOPICAR.' : st === 402 ? 'Crédit Apify épuisé : rechargez le compte ou passez au plan Starter.' : st === 404 ? 'Acteur Apify introuvable.' : `Apify ${st} : ${t.slice(0, 160)}`;

function norm(it: any) {
  const A = Array.isArray(it.attributes) ? it.attributes : [];
  const g = (re: RegExp) => { const a = A.find((x: any) => re.test(String(x?.key || ''))); return a ? (a.value_label ?? a.value ?? null) : null; };
  const pr = Array.isArray(it.price) ? it.price[0] : (it.price && typeof it.price === 'object' ? (it.price.value ?? it.price.amount) : it.price);
  const id = String(it.list_id ?? it.id ?? (String(it.url || '').match(/(\d{6,})/) || [])[1] ?? '');
  const loc = it.location || {};
  let imgs: any = it.images;
  if (imgs && !Array.isArray(imgs)) imgs = imgs.urls_large || imgs.urls || imgs.urls_thumb || [];
  imgs = (imgs || []).map((x: any) => typeof x === 'string' ? x : (x?.url || x?.large || '')).filter((x: string) => /^https?:/.test(x));
  const ownerType = it.owner?.type || it.owner_type || null;
  return {
    id, url: it.url || (id ? `https://www.leboncoin.fr/ad/voitures/${id}` : null),
    titre: cut(it.subject || it.title || '', 200), prix: num(pr),
    annee: num(g(/^regdate$/)), km: num(g(/^mileage$/)), energie: g(/^fuel$/), boite: g(/^gearbox$/), cv: num(g(/^horse_?power$/)),
    marque: g(/^brand$/), modele: g(/^model$/),
    ville: loc.city || String(loc.city_label || '').replace(/\s*\d{5}$/, '') || null, cp: loc.zipcode || null, departement: loc.department_name || null, region: loc.region_name || null,
    lat: typeof loc.lat === 'number' ? loc.lat : null, lng: typeof loc.lng === 'number' ? loc.lng : null,
    vendeur_type: ownerType === 'private' ? 'particulier' : ownerType === 'pro' ? 'professionnel' : ownerType,
    description: cut(it.body || it.description || '', 20000), attributs: A, photos: imgs,
    publie_le: parsePub(it.first_publication_date), details_ok: !!(it.body || it.description), brut: it,
  };
}
function withRule(u: string, rule: string) { try { const x = new URL(u); if (/leboncoin/.test(x.hostname)) x.searchParams.set('rule', rule); return x.toString(); } catch { return u; } }
async function dataUrl(u: string, maxBytes: number) {
  const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error('photo ' + r.status);
  const b = new Uint8Array(await r.arrayBuffer()); if (b.byteLength > maxBytes) throw new Error('photo trop lourde');
  const ct = (r.headers.get('content-type') || 'image/jpeg').split(';')[0];
  return `data:${ct};base64,${encodeBase64(b)}`;
}
async function pool<T>(items: T[], n: number, f: (x: T, i: number) => Promise<void>) {
  let i = 0; await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; try { await f(items[k], k); } catch (_) { /* photo ignorée */ } } }));
}

async function ingest(v: any, items: any[], since: number | null = null, initiale = false) {
  const onlyF = !!(v.filtres && v.filtres.utp && v.filtres.utp.fiables);
  const all = items.map(norm).filter(r => r.id).map(r => ({ ...r, fiab: fiab(r) }));
  const U = (v.filtres && v.filtres.utp) || {};
  let inc: RegExp | null = null, exc: RegExp | null = null;
  try { if (U.inclure) inc = new RegExp(String(U.inclure)); if (U.exclure) exc = new RegExp(String(U.exclure)); } catch (_) { /* motif invalide ignoré */ }
  // Filtres stricts appliqués ici aussi : Leboncoin/l'acteur ne respecte pas toujours le km, le prix ou l'année.
  const F = v.filtres || {};
  const inR = (x: any, lo: any, hi: any) => x == null || ((lo == null || x >= Number(lo)) && (hi == null || x <= Number(hi)));
  const strict = (r: any) => inR(r.km, F.mileage_min, F.mileage_max) && inR(r.prix, F.price_min, F.price_max) && inR(r.annee, F.year_min, F.year_max);
  // fenêtre de temps : seulement les annonces parues pendant l'intervalle choisi (ex. la dernière heure)
  const recent = (r: any) => since == null || !r.publie_le || Date.parse(r.publie_le) >= since;
  const rows = all.filter(r => strict(r) && recent(r) && (!onlyF || r.fiab)
    && (!inc || inc.test(flat([r.marque, r.modele, r.titre].filter(Boolean).join(' '))))
    && (!exc || !exc.test(flat(r.titre + ' ' + String(r.description).slice(0, 600)))));
  if (all.length && !rows.length) return { recues: all.length, nouvelles: 0, fresh: [] as any[] };
  if (!rows.length) return { recues: 0, nouvelles: 0, fresh: [] as any[] };
  const ids = rows.map(r => r.id);
  const { data: old } = await sb.from('annonces').select('id,prix,historique_prix,veilles').in('id', ids);
  const known = new Map((old || []).map((o: any) => [o.id, o]));
  const now = new Date().toISOString(); const fresh: any[] = [];
  for (const r of rows) {
    const o: any = known.get(r.id);
    if (o) {
      const upd: any = { derniere_vue: now };
      if (!(o.veilles || []).includes(v.id)) upd.veilles = [...(o.veilles || []), v.id];
      if (r.prix != null && o.prix != null && r.prix !== o.prix) { upd.prix = r.prix; upd.historique_prix = [...(o.historique_prix || []), { date: now, avant: o.prix, apres: r.prix }]; }
      if (r.description) { upd.description = r.description; upd.attributs = r.attributs; upd.brut = r.brut; upd.details_ok = true; }
      await sb.from('annonces').update(upd).eq('id', r.id);
    } else fresh.push({ ...r, veille_id: v.id, veilles: [v.id], premiere_vue: now, derniere_vue: now, statut: 'nouvelle', source: 'leboncoin' });
  }
  if (fresh.length) {
    const { error } = await sb.from('annonces').upsert(fresh.map(({ photos, ...x }) => ({ ...x, photos })), { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw new Error('insertion : ' + error.message);
    // photos : vignette légère + jusqu'à 6 photos moyennes, stockées en base64 (l'outil ne peut pas charger d'image distante)
    // collecte complète (des centaines d'annonces) : vignettes des plus récentes seulement, sans photos en grand
    const avecPhotos = initiale ? [] : fresh;
    const avecVignette = initiale ? [...fresh].sort((a, b) => String(b.publie_le || '').localeCompare(String(a.publie_le || ''))).slice(0, VIGNETTES_INITIALES) : fresh;
    const jobs: { id: string; idx: number; u: string }[] = [];
    for (const r of avecPhotos) { (r.photos || []).slice(0, MAX_PHOTOS).forEach((u: string, idx: number) => jobs.push({ id: r.id, idx, u })); }
    const thumbs: Record<string, string> = {};
    await pool(avecVignette.filter(r => (r.photos || []).length), 6, async (r: any) => { thumbs[r.id] = await dataUrl(withRule(r.photos[0], 'ad-small'), 120000); });
    const photos: any[] = [];
    await pool(jobs, 8, async (j) => { photos.push({ annonce_id: j.id, idx: j.idx, data: await dataUrl(withRule(j.u, 'ad-image'), 700000) }); });
    for (const [id, t] of Object.entries(thumbs)) await sb.from('annonces').update({ vignette: t }).eq('id', id);
    for (let k = 0; k < photos.length; k += 10) await sb.from('annonce_photos').upsert(photos.slice(k, k + 10), { onConflict: 'annonce_id,idx' });
  }
  return { recues: all.length, nouvelles: fresh.length, fresh: fresh.map(r => ({ id: r.id, url: r.url, titre: r.titre, marque: r.marque, modele: r.modele, prix: r.prix, annee: r.annee, km: r.km, energie: r.energie, boite: r.boite, ville: r.ville, cp: r.cp, fiab: r.fiab, photo: (r.photos || [])[0] || null })) };
}

function runCost(run: any) {
  let c = Number(run?.usageTotalUsd || 0);
  const ev = run?.chargedEventCounts; const pe = run?.pricingInfo?.pricingPerEvent?.actorChargeEvents;
  if (ev && pe) for (const [k, n] of Object.entries(ev)) c += Number(n || 0) * Number(pe[k]?.eventPriceUsd || 0);
  return Math.round(c * 100000) / 100000;
}

// ---------- E-mail des nouvelles annonces (Resend) ----------
const APP_URL = 'https://claude.ai/artifact/8bHqs6YhWoWT2zje3mSF3q';
const SITE_URL = 'https://utopicar.fr/app/alertes'; // alertes créées depuis le site (comptes illimités)
const escH = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[c]);
const fmt = (n: unknown) => n == null ? '' : Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
// destinataire : l'adresse de l'alerte (site), sinon celle des réglages (outil) ; expéditeur : le domaine utopicar.fr vérifié
async function sendMail(R: Record<string, string>, subject: string, html: string, dest?: string | null): Promise<string> {
  const dst = dest || R.email_notif;
  if (!R.resend_key || !dst) return 'non configuré';
  const to = String(dst).split(/[,;\s]+/).filter(Boolean);
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': 'Bearer ' + R.resend_key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: R.email_from || (R.email_from_leads ? `Utopicar <${R.email_from_leads}>` : 'UTOPICAR <onboarding@resend.dev>'), to, subject, html }) });
  if (r.ok) return 'envoyé';
  const t = await r.text(); return `refusé (${r.status}) : ${t.slice(0, 160)}`;
}
function mailNouvelles(v: any, list: any[]) {
  const shown = list.slice(0, 15);
  const card = (a: any) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e5e5e5">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    ${a.photo ? `<td style="padding-right:12px;vertical-align:top"><a href="${escH(a.url)}"><img src="${escH(a.photo)}" width="120" style="border-radius:6px;display:block;width:120px;height:auto" alt=""></a></td>` : ''}
    <td style="vertical-align:top;font:14px/1.45 Arial,sans-serif;color:#1d1d1f">
      <a href="${escH(a.url)}" style="color:#15307f;font-weight:bold;text-decoration:none">${escH(a.titre)}</a><br>
      <b style="font-size:16px">${a.prix != null ? fmt(a.prix) + ' €' : 'Prix non indiqué'}</b><br>
      <span style="color:#555">${[a.annee, a.km != null ? fmt(a.km) + ' km' : '', a.energie, a.boite].filter(Boolean).map(escH).join(' · ')}</span><br>
      <span style="color:#777">${escH([a.ville, a.cp].filter(Boolean).join(' '))}${a.fiab ? ' · <span style="color:#0a7a43">modèle fiable</span>' : ''}</span>
      ${a.cote ? `<br><span style="color:${a.cote.ecart >= 0 ? '#0a7a43' : '#9a3412'};font-weight:bold">${a.cote.ecart >= 0 ? fmt(a.cote.ecart) + ' € sous la cote' : fmt(-a.cote.ecart) + ' € au-dessus de la cote'}</span> <span style="color:#777">(cote ${fmt(a.cote.mediane)} € sur ${a.cote.n} annonces)</span>` : ''}
    </td></tr></table></td></tr>`;
  const html = `<div style="max-width:560px;margin:0 auto;font:14px Arial,sans-serif;color:#1d1d1f">
    <p style="font-size:18px;margin:0 0 4px"><b>${list.length} nouvelle${list.length > 1 ? 's' : ''} annonce${list.length > 1 ? 's' : ''}</b></p>
    <p style="margin:0 0 12px;color:#555">Recherche « ${escH(v.nom)} »</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${shown.map(card).join('')}</table>
    ${list.length > shown.length ? `<p style="color:#555">Et ${list.length - shown.length} autre(s) dans l'outil.</p>` : ''}
    <p style="margin:18px 0"><a href="${v.user_id ? SITE_URL : APP_URL}" style="background:${v.user_id ? '#ff5a1f' : '#15307f'};color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:bold">${v.user_id ? 'Voir mes alertes sur Utopicar' : 'Ouvrir UTOPICAR (cote, état, analyse)'}</a></p>
    <p style="color:#999;font-size:12px">${v.user_id ? 'Envoyé par votre alerte Utopicar. Pour ne plus recevoir ces e-mails, désactivez l\'e-mail de cette alerte dans Mon espace › Alertes.' : 'Envoyé par votre recherche suivie UTOPICAR. Pour ne plus recevoir ces e-mails, décochez « E-mail » sur la recherche dans l\'onglet Recherches.'}</p></div>`;
  const first = list[0];
  const subject = `${list.length} nouvelle${list.length > 1 ? 's' : ''} ${v.nom}${first && first.prix != null ? ` · dès ${fmt(Math.min(...list.map((x: any) => x.prix ?? 1e9)))} €` : ''}`;
  return { subject, html };
}

// Écart à la cote du marché (médiane des annonces comparables) ; « sous_cote » (en %) : seulement les bonnes affaires.
async function avecCote(v: any, list: any[]) {
  const seuil = Number(v.filtres?.utp?.sous_cote) || 0;
  const out: any[] = [];
  for (const a of list) {
    let cote: any = null;
    try {
      const { data } = await sb.rpc('cote_marche', { p_marque: a.marque || '', p_modele: a.modele || a.titre || '', p_annee: a.annee, p_km: a.km, p_energie: a.energie || '' });
      if (data && Number(data.n) >= 5 && Number(data.mediane) > 0 && a.prix != null) cote = { n: data.n, mediane: Math.round(data.mediane), ecart: Math.round(data.mediane - a.prix) };
    } catch (_) { /* sans cote */ }
    // prix aberrant (plus de 55 % sous la cote) : pièces, location, acompte ou prix d'appel, jamais envoyé
    if (cote && a.prix != null && a.prix < cote.mediane * 0.45) continue;
    if (seuil > 0 && !(cote && cote.ecart >= cote.mediane * seuil / 100)) continue;
    out.push({ ...a, cote });
  }
  return out.sort((x, y) => (y.cote?.ecart ?? -1e9) - (x.cote?.ecart ?? -1e9));
}

async function collect(v: any, R: Record<string, string>) {
  const r = await fetch(`${APIFY}/actor-runs/${v.run_id}?token=${encodeURIComponent(R.apify_token || '')}`);
  const t = await r.text(); if (!r.ok) throw new Error(apifyErr(r.status, t));
  const run = JSON.parse(t).data;
  const { data: cur } = await sb.from('veille_passages').select('demandees, initiale').eq('id', v.run_passage).maybeSingle();
  const initiale = !!cur?.initiale;
  if (['READY', 'RUNNING'].includes(run.status)) {
    const age = Date.now() - new Date(v.run_debut || run.startedAt).getTime();
    if (age < (initiale ? 25 : 12) * 60000) return { veille: v.id, run: v.run_id, statut: 'en cours' };
    await fetch(`${APIFY}/actor-runs/${v.run_id}/abort?token=${encodeURIComponent(R.apify_token)}`, { method: 'POST' });
    run.status = 'TIMED-OUT';
  }
  // on « prend » le run pour éviter une double ingestion (webhook + cron)
  const { data: claim } = await sb.from('veilles').update({ run_id: null }).eq('id', v.id).eq('run_id', v.run_id).select('id');
  if (!claim || !claim.length) return { veille: v.id, statut: 'déjà traité' };
  const cout = runCost(run); let res: any = { recues: 0, nouvelles: 0, fresh: [] }; let err: string | null = null; let mail: string | null = null;
  if (run.status === 'SUCCEEDED') {
    try {
      const d = await fetch(`${APIFY}/datasets/${run.defaultDatasetId}/items?token=${encodeURIComponent(R.apify_token)}&clean=true&format=json&limit=${Math.max(200, (Number(cur?.demandees) || 0) + 20)}`);
      const items = await d.json();
      // Fenêtre = la fréquence choisie (toutes les heures : la dernière heure ; 15 min : les 15 dernières minutes),
      // élargie seulement si le passage précédent est plus ancien (pause de nuit, passage raté) pour ne rien perdre.
      const { data: prev } = await sb.from('veille_passages').select('debut').eq('veille_id', v.id).eq('statut', 'ok').neq('id', v.run_passage).order('debut', { ascending: false }).limit(1);
      const every = (Number(v.intervalle_min) || Number(R.frequence_minutes) || 60) * 60000;
      const t0 = Date.parse(v.run_debut || run.startedAt) || Date.now();
      // collecte complète (1er passage ou critères modifiés) : tout est gardé, sans fenêtre de temps
      const since = !initiale && prev && prev.length ? t0 - Math.max(every, t0 - Date.parse(prev[0].debut)) - 5 * 60000 : null;
      res = await ingest(v, Array.isArray(items) ? items : [], since, initiale);
      try {
        const nb = Number(v.nb_par_passage) || 20; const asked = Number(cur?.demandees) || nb;
        const pubs = (Array.isArray(items) ? items : []).map(norm).map((r: any) => r.publie_le ? Date.parse(r.publie_le) : NaN).filter((x: number) => !isNaN(x));
        if (initiale) {
          // après la collecte complète : on lit à peu près ce qui paraît pendant un intervalle, avec de la marge
          const parIntervalle = pubs.filter((t: number) => t >= t0 - every).length;
          // collecte vide (lecture bloquée) : elle reste à faire, le passage suivant la refait en entier
          if (res.recues) res.prochain = pubs.length ? Math.max(5, Math.min(60, Math.ceil(parIntervalle * 1.5) + 3)) : nb;
        } else if (since != null && pubs.length) {
          const recentes = pubs.filter((t: number) => t >= since).length;
          const trou = pubs.length >= asked && Math.min(...pubs) >= since; // tout le lot est dans la fenêtre : il y en a peut-être plus
          res.recentes = recentes;
          res.prochain = trou ? Math.min(60, nb * 2) : Math.max(5, Math.min(nb, Math.ceil(recentes * 1.5) + 3));
        } else res.prochain = nb;
      } catch (_) { /* on garde la lecture complète */ }
      if (!res.recues) err = 'Aucune annonce renvoyée : vérifiez les filtres de la recherche.';
    } catch (e) { err = String((e as Error).message || e); }
  } else err = `Run Apify ${run.status}` + (run.statusMessage ? ` : ${String(run.statusMessage).slice(0, 160)}` : '');
  // pas d'e-mail au tout premier passage d'une recherche (vous êtes devant l'écran, et tout serait « nouveau »)
  // ni à la collecte complète (tout serait « nouveau ») : seulement pour les annonces parues depuis
  const { count: deja } = !err && !initiale && res.nouvelles > 0 ? await sb.from('veille_passages').select('id', { count: 'exact', head: true }).eq('veille_id', v.id).eq('statut', 'ok') : { count: 0 } as any;
  if (!err && !initiale && res.nouvelles > 0 && (deja || 0) > 0 && v.notifier !== false && R.resend_key && (v.email || R.email_notif)) {
    try {
      const list = await avecCote(v, res.fresh || []);
      if (list.length) { const m = mailNouvelles(v, list); mail = await sendMail(R, m.subject, m.html, v.email); } else mail = 'aucune sous la cote';
    } catch (e) { mail = 'erreur : ' + String((e as Error).message || e).slice(0, 160); }
  }
  // Leboncoin renvoie parfois une page vide (lecture bloquée) : un seul nouvel essai tout de suite, pas d'attente jusqu'au prochain passage
  let relance = false;
  if (err && (err.startsWith('Aucune annonce') || err.startsWith('Run Apify'))) {
    const { count: rates } = await sb.from('veille_passages').select('id', { count: 'exact', head: true }).eq('veille_id', v.id).eq('statut', 'erreur').gte('debut', new Date(Date.now() - 20 * 60000).toISOString());
    relance = (rates || 0) === 0;
    if (relance) err += ' Nouvel essai lancé automatiquement.';
  }
  await sb.from('veille_passages').update({ fin: new Date().toISOString(), statut: err ? 'erreur' : 'ok', trouvees: res.recues, recues: res.recues, nouvelles: res.nouvelles, cout_usd: cout, erreur: err, mail, recentes: res.recentes ?? null }).eq('id', v.run_passage);
  await sb.from('veilles').update({ derniere_erreur: err, derniers_nouveaux: res.nouvelles, ...(res.prochain ? { prochain_nb: res.prochain } : {}) }).eq('id', v.id);
  if (relance) { try { await start(v, R); } catch (_) { /* le prochain passage prendra le relais */ } }
  return { veille: v.id, statut: run.status, recues: res.recues, nouvelles: res.nouvelles, cout, err, mail, relance, initiale };
}

async function start(v: any, R: Record<string, string>) {
  const { utp: _utp, ...f } = v.filtres || {};
  // 1er passage (ou critères modifiés : prochain_nb remis à vide) : toutes les annonces qui correspondent ;
  // ensuite, lecture adaptative : seulement ce qui a pu paraître depuis le dernier passage (voir collect)
  const initiale = v.prochain_nb == null;
  const demandees = initiale ? Math.max(20, Math.min(1000, Number(R.collecte_initiale_max) || COLLECTE_MAX)) : Math.max(5, Math.min(60, Number(v.prochain_nb) || Number(v.nb_par_passage) || 20));
  const input = { category: '2', sort: 'newest', max_results: demandees, owner_type: 'private', proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'], apifyProxyCountry: 'FR' }, ...f };
  if (input.mileage_max != null && input.mileage_min == null) (input as any).mileage_min = 0; // l'acteur ignore parfois un max seul
  const hook = [{ eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED', 'ACTOR.RUN.TIMED_OUT', 'ACTOR.RUN.ABORTED'], requestUrl: `${FN}?k=${encodeURIComponent(R.cle_interne)}&veille=${v.id}` }];
  const url = `${APIFY}/acts/${encodeURIComponent(R.apify_actor || 'scrapifier~leboncoin-universal-scraper-vehicles')}/runs?token=${encodeURIComponent(R.apify_token)}&timeout=${initiale ? 900 : 300}&memory=1024&webhooks=${encodeURIComponent(btoa(JSON.stringify(hook)))}`;
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  const t = await r.text();
  if (!r.ok) { const err = apifyErr(r.status, t); await sb.from('veilles').update({ derniere_erreur: err, derniere_execution: new Date().toISOString() }).eq('id', v.id); await sb.from('veille_passages').insert({ veille_id: v.id, fin: new Date().toISOString(), statut: 'erreur', erreur: err }); return { veille: v.id, err }; }
  const run = JSON.parse(t).data;
  const { data: p } = await sb.from('veille_passages').insert({ veille_id: v.id, run_id: run.id, statut: 'en cours', demandees, initiale }).select('id').single();
  await sb.from('veilles').update({ run_id: run.id, run_debut: new Date().toISOString(), run_passage: p?.id, derniere_execution: new Date().toISOString(), derniere_erreur: null }).eq('id', v.id);
  return { veille: v.id, run: run.id, input, initiale };
}


// ---------- Cotes : jusqu'à 1 000 annonces d'un modèle pour estimer le vrai prix de marché ----------
const COTE_MAX = 1000;
function coteRow(c: any, it: any) {
  const r = norm(it); if (!r.id || r.prix == null) return null;
  const A = Array.isArray(it.attributes) ? it.attributes : [];
  const att = (re: RegExp) => { const a = A.find((x: any) => re.test(String(x?.key || ''))); return a ? String(a.value_label ?? a.value ?? '') : ''; };
  const ch = num(att(/^horse_?power_?din$/i)); const pl = num(att(/^seats$/i));
  return { cle: c.cle, id: r.id, prix: r.prix, annee: r.annee, km: r.km, energie: r.energie, boite: r.boite, titre: cut(r.titre, 120), dep: r.departement, vendeur: r.vendeur_type, etat: att(/vehicle_damage|vehicle_condition|condition/i) || null, cv: r.cv, publie_le: r.publie_le,
    texte: cut(r.titre + ' | ' + r.description.replace(/\s+/g, ' '), 700), ch: ch && ch < 700 ? ch : null, places: pl && pl < 10 ? pl : null, carrosserie: att(/^vehicle_type$/i) || null };
}
async function startCote(c: any, R: Record<string, string>) {
  const f = c.filtres || {};
  const input = { category: '2', sort: 'relevance', max_results: COTE_MAX, owner_type: 'all', proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'], apifyProxyCountry: 'FR' }, ...f };
  const hook = [{ eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED', 'ACTOR.RUN.TIMED_OUT', 'ACTOR.RUN.ABORTED'], requestUrl: `${FN}?k=${encodeURIComponent(R.cle_interne)}&cote=${encodeURIComponent(c.cle)}` }];
  const url = `${APIFY}/acts/${encodeURIComponent(R.apify_actor || 'scrapifier~leboncoin-universal-scraper-vehicles')}/runs?token=${encodeURIComponent(R.apify_token)}&timeout=1200&memory=1024&webhooks=${encodeURIComponent(btoa(JSON.stringify(hook)))}`;
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  const t = await r.text();
  if (!r.ok) { const err = apifyErr(r.status, t); await sb.from('cotes').update({ statut: 'erreur', erreur: err }).eq('cle', c.cle); return { cote: c.cle, err }; }
  const run = JSON.parse(t).data;
  await sb.from('cotes').update({ run_id: run.id, run_debut: new Date().toISOString(), statut: 'en cours', erreur: null }).eq('cle', c.cle);
  return { cote: c.cle, run: run.id };
}
async function collectCote(c: any, R: Record<string, string>) {
  const r = await fetch(`${APIFY}/actor-runs/${c.run_id}?token=${encodeURIComponent(R.apify_token || '')}`);
  const t = await r.text(); if (!r.ok) throw new Error(apifyErr(r.status, t));
  const run = JSON.parse(t).data;
  if (['READY', 'RUNNING'].includes(run.status)) {
    const age = Date.now() - new Date(c.run_debut || run.startedAt).getTime();
    if (age < 25 * 60000) return { cote: c.cle, statut: 'en cours' };
    await fetch(`${APIFY}/actor-runs/${c.run_id}/abort?token=${encodeURIComponent(R.apify_token)}`, { method: 'POST' });
    run.status = 'TIMED-OUT';
  }
  const { data: claim } = await sb.from('cotes').update({ run_id: null }).eq('cle', c.cle).eq('run_id', c.run_id).select('cle');
  if (!claim || !claim.length) return { cote: c.cle, statut: 'déjà traité' };
  const cout = runCost(run); let err: string | null = null; let n = 0; let items: any[] = [];
  if (run.status === 'SUCCEEDED') {
    const d = await fetch(`${APIFY}/datasets/${run.defaultDatasetId}/items?token=${encodeURIComponent(R.apify_token)}&clean=true&format=json&limit=${COTE_MAX + 100}`);
    const j = await d.json(); items = Array.isArray(j) ? j : [];
    // modèle au format Leboncoin non reconnu : on relance une fois par mot-clé
    if (!items.length && c.filtres?.vehicle_model && (c.essai || 0) < 1) {
      const f = { ...c.filtres }; const model = String(f.vehicle_model).split('_').slice(1).join(' '); delete f.vehicle_model; f.text = model;
      await sb.from('cotes').update({ filtres: f, essai: 1, cout_usd: cout }).eq('cle', c.cle);
      await sb.from('veille_passages').insert({ fin: new Date().toISOString(), statut: 'ok', recues: 0, trouvees: 0, nouvelles: 0, cout_usd: cout, erreur: 'cote ' + c.cle + ' : relance par mot-clé' });
      return await startCote({ ...c, filtres: f }, R);
    }
    const seen = new Set<string>();
    const rows: any[] = items.map(it => coteRow(c, it)).filter((x: any) => x && !seen.has(x.id) && seen.add(x.id));
    await sb.from('cote_annonces').delete().eq('cle', c.cle);
    for (let k = 0; k < rows.length; k += 100) { const { error } = await sb.from('cote_annonces').insert(rows.slice(k, k + 100)); if (error) err = 'enregistrement : ' + error.message; }
    n = rows.length;
    if (!n) err = 'Aucune annonce trouvée pour ce modèle : vérifiez la recherche.';
  } else err = `Run Apify ${run.status}` + (run.statusMessage ? ` : ${String(run.statusMessage).slice(0, 160)}` : '');
  await sb.from('cotes').update({ statut: err ? 'erreur' : 'ok', erreur: err, n: err && !n ? c.n : n, maj: n ? new Date().toISOString() : c.maj, cout_usd: cout }).eq('cle', c.cle);
  await sb.from('veille_passages').insert({ fin: new Date().toISOString(), statut: err ? 'erreur' : 'ok', recues: n, trouvees: items.length, nouvelles: 0, cout_usd: cout, erreur: err ? 'cote ' + c.cle + ' : ' + err : null });
  return { cote: c.cle, n, cout, err };
}

Deno.serve(async (req) => {
  const u = new URL(req.url); const R = await reglages();
  APIFY = R.apify_base || 'https://api.apify.com/v2';
  const given = req.headers.get('x-veille-secret') || u.searchParams.get('k');
  if (!R.cle_interne || given !== R.cle_interne) return json({ error: 'refusé' }, 401);
  let body: any = {}; try { body = await req.json(); } catch (_) { /* vide */ }
  if (body.test_mail) {
    const demo = [{ titre: 'Renault Clio III 1.2 16V 75 ch (exemple)', prix: 3900, annee: 2010, km: 142000, energie: 'Essence', boite: 'Manuelle', ville: 'Rouen', cp: '76000', fiab: 'clio', url: APP_URL, photo: null }];
    const m = mailNouvelles({ nom: 'E-mail de test' }, demo);
    return json({ mail: await sendMail(R, 'Test UTOPICAR : les alertes e-mail fonctionnent', m.html) });
  }
  const out: any = { collected: [], started: [], notes: [] };
  const { data: veilles } = await sb.from('veilles').select('*').order('created_at');
  for (const v of veilles || []) if (v.run_id) { try { out.collected.push(await collect(v, R)); } catch (e) { out.collected.push({ veille: v.id, err: String((e as Error).message || e) }); await sb.from('veilles').update({ derniere_erreur: String((e as Error).message || e) }).eq('id', v.id); } }
  const { data: cotes } = await sb.from('cotes').select('*');
  for (const c of cotes || []) if (c.run_id) { try { out.collected.push(await collectCote(c, R)); } catch (e) { out.collected.push({ cote: c.cle, err: String((e as Error).message || e) }); } }
  if ((u.searchParams.get('veille') || u.searchParams.get('cote')) && !body.force && !body.cote) return json(out); // appel du webhook : on ramasse seulement
  if (!R.apify_token) { out.notes.push('clé Apify manquante'); return json(out); }
  const force = !!body.force; const h = parisHour();
  const hd = Number(R.heure_debut ?? 7), hf = Number(R.heure_fin ?? 23);
  if (!force && !body.cote && !(h >= hd && h < hf)) { out.notes.push(`hors plage horaire (${hd} h – ${hf} h)`); return json(out); }
  const { data: m } = await sb.from('veille_passages').select('cout_usd').gte('debut', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
  const spent = (m || []).reduce((s: number, x: any) => s + Number(x.cout_usd || 0), 0);
  const budget = Number(R.budget_mensuel_usd || 20);
  if (spent >= budget) { out.notes.push(`budget mensuel atteint (${spent.toFixed(2)} $ / ${budget} $)`); for (const v of veilles || []) if (v.actif) await sb.from('veilles').update({ derniere_erreur: `Budget mensuel atteint (${spent.toFixed(2)} $ sur ${budget} $). Augmentez-le dans UTOPICAR pour reprendre.` }).eq('id', v.id); await sb.from('cotes').update({ statut: 'erreur', erreur: `Budget mensuel Apify atteint (${spent.toFixed(2)} $ sur ${budget} $).` }).eq('statut', 'demandee'); return json(out); }
  // cotes demandées (bouton de l'outil ou nouvelle recherche) : lancées tout de suite, hors plage horaire comprise
  const { data: cq } = await sb.from('cotes').select('*').is('run_id', null).eq('statut', 'demandee');
  for (const c of cq || []) { if (body.cote && body.cote !== c.cle) continue; try { out.started.push(await startCote(c, R)); } catch (e) { out.started.push({ cote: c.cle, err: String((e as Error).message || e) }); } }
  if (body.cote) return json(out);
  const freq = Number(R.frequence_minutes || 15);
  const { data: fresh } = await sb.from('veilles').select('*').is('supprimee_le', null).order('created_at');
  // alertes du site : seulement tant que la formule y donne droit (Benef Pro : 3 alertes, toutes les 3 h au plus souvent)
  const droits = new Map<string, { max: number; freq_min: number; vues: number }>();
  for (const v of fresh || []) {
    if (!v.user_id || droits.has(v.user_id)) continue;
    const { data: d } = await sb.rpc('alertes_droits', { p_uid: v.user_id });
    droits.set(v.user_id, { max: Number(d?.max ?? 0), freq_min: Number(d?.freq_min ?? 1440), vues: 0 });
  }
  for (const v of fresh || []) {
    const dr = v.user_id ? droits.get(v.user_id) : null;
    if (dr && v.actif && ++dr.vues > dr.max) continue; // formule terminée ou au-delà du nombre d'alertes permis
    if (v.run_id) continue;
    if (body.veille_id && body.veille_id !== v.id) continue;
    if (!v.actif && !(force && body.veille_id === v.id)) continue; // recherche ponctuelle : lancée à la demande seulement
    const last = v.derniere_execution ? new Date(v.derniere_execution).getTime() : 0;
    const every = Math.max(Number(v.intervalle_min) || freq, dr ? dr.freq_min : 0); // intervalle propre à la recherche (ex. 120 = toutes les 2 h)
    if (!force && Date.now() - last < (every - 1) * 60000) continue;
    try { out.started.push(await start(v, R)); } catch (e) { out.started.push({ veille: v.id, err: String((e as Error).message || e) }); }
  }
  return json(out);
});
