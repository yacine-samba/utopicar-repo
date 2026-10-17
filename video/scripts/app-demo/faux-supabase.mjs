// Faux Supabase pour filmer la vraie app (web/) sur des données de démonstration, sans aucune donnée réelle.
// Répond à l'authentification (GET /auth/v1/user), à PostgREST (/rest/v1/<table>, filtres eq/in/gte/order/limit,
// .single/.maybeSingle, count) et aux fonctions (/rest/v1/rpc/<fn>) à partir de demo.mjs. Journal des requêtes : stdout.
// usage : node faux-supabase.mjs 54321
import http from 'node:http';
import fs from 'node:fs';
import { TABLES, RPC, USER, ANNONCES } from './demo.mjs';
const PORT = +(process.argv[2] || 54321); let NID = 0;
const send = (res, code, body, headers = {}) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Expose-Headers': 'Content-Range', ...headers }); res.end(body === undefined ? '' : JSON.stringify(body)); };
function filtre(rows, q) {
  for (const [k, v] of q) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(k)) continue;
    const m = /^(not\.)?(eq|neq|gt|gte|lt|lte|in|is|like|ilike|cs|ov)\.(.*)$/.exec(v); if (!m) continue;
    const [, neg, op, raw] = m; const val = (x) => (raw === 'null' ? null : raw === 'true' ? true : raw === 'false' ? false : x);
    rows = rows.filter((r) => { const c = r[k]; let ok;
      if (op === 'eq') ok = String(c) === String(val(raw)); else if (op === 'neq') ok = String(c) !== raw;
      else if (op === 'in') ok = raw.replace(/^\(|\)$/g, '').split(',').map((s) => s.replace(/^"|"$/g, '')).includes(String(c));
      else if (op === 'is') ok = raw === 'null' ? c == null : c === val(raw);
      else if (op === 'gte') ok = c >= (isNaN(+raw) ? raw : +raw); else if (op === 'gt') ok = c > (isNaN(+raw) ? raw : +raw);
      else if (op === 'lte') ok = c <= (isNaN(+raw) ? raw : +raw); else if (op === 'lt') ok = c < (isNaN(+raw) ? raw : +raw);
      else ok = true;
      return neg ? !ok : ok; });
  }
  const o = q.get('order'); if (o) { const [col, dir] = o.split(',')[0].split('.'); rows = [...rows].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (dir === 'desc' ? -1 : 1)); }
  const off = +(q.get('offset') || 0), lim = q.get('limit'); rows = rows.slice(off, lim ? off + +lim : undefined);
  return rows;
}
http.createServer((req, res) => {
  let body = ''; req.on('data', (c) => (body += c)); req.on('end', () => {
    const u = new URL(req.url, 'http://x'); const p = u.pathname;
    if (req.method === 'OPTIONS') return send(res, 204);
    console.log(req.method, decodeURIComponent(req.url).slice(0, 300), body ? body.slice(0, 200) : '');
    if (p === '/auth/v1/user') return send(res, 200, USER);
    if (p.startsWith('/auth/v1/token')) return send(res, 200, { access_token: 'demo', token_type: 'bearer', expires_in: 360000, expires_at: 4102444800, refresh_token: 'demo', user: USER });
    if (p.startsWith('/auth/v1/')) return send(res, 200, {});
    if (p.startsWith('/rest/v1/rpc/')) { const fn = p.slice('/rest/v1/rpc/'.length); const r = RPC[fn]; let a = {}; try { a = JSON.parse(body || '{}'); } catch {}
      const out = typeof r === 'function' ? r(a) : r; if (out === undefined) console.log('  ↳ RPC inconnue', fn);
      // DELAIS="cote_marche:8000,…" : une fonction qui répond lentement, pour filmer l'attente de l'analyse
      const d = +((process.env.DELAIS || '').split(',').map((x) => x.split(':')).find(([f]) => f === fn) || [])[1] || 0;
      return d ? setTimeout(() => send(res, 200, out ?? null), d) : send(res, 200, out ?? null); }
    if (p.startsWith('/rest/v1/')) {
      const t = p.slice('/rest/v1/'.length); if (!(t in TABLES)) console.log('  ↳ table inconnue', t);
      if (req.method !== 'GET' && req.method !== 'HEAD') {   // écritures : gardées en mémoire, renvoyées si demandé
        TABLES[t] = TABLES[t] || []; let rows = [];
        let data = []; try { data = body ? JSON.parse(body) : []; } catch {}
        data = Array.isArray(data) ? data : [data];
        if (req.method === 'POST') {
          const conflit = (u.searchParams.get('on_conflict') || '').split(',').filter(Boolean);
          for (const d of data) {
            const ex = conflit.length ? TABLES[t].find((r) => conflit.every((c) => String(r[c]) === String(d[c] ?? (c === 'user_id' ? USER.id : undefined)))) : null;
            if (ex && (req.headers.prefer || '').includes('merge-duplicates')) { Object.assign(ex, d); rows.push(ex); continue; }
            const r = { id: d.id ?? `00000000-0000-4000-9000-${String(200000000000 + ++NID)}`, user_id: USER.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...d };
            TABLES[t].push(r); rows.push(r);
          }
        } else if (req.method === 'PATCH') { rows = filtre(TABLES[t], u.searchParams); rows.forEach((r) => Object.assign(r, data[0] || {})); }
        else if (req.method === 'DELETE') { rows = filtre(TABLES[t], u.searchParams); TABLES[t] = TABLES[t].filter((r) => !rows.includes(r)); }
        const single = (req.headers.accept || '').includes('vnd.pgrst.object');
        if (!(req.headers.prefer || '').includes('return=representation')) return send(res, req.method === 'POST' ? 201 : 204);
        return send(res, 200, single ? rows[0] ?? null : rows);
      }
      const rows = filtre(TABLES[t] || [], u.searchParams);
      const single = (req.headers.accept || '').includes('vnd.pgrst.object');
      const head = { 'Content-Range': `0-${Math.max(0, rows.length - 1)}/${rows.length}` };
      if (req.method === 'HEAD') return send(res, 200, undefined, head);
      if (single) return rows.length ? send(res, 200, rows[0], head) : send(res, 406, { code: 'PGRST116', message: 'no rows' });
      return send(res, 200, rows, head);
    }
    // lecture d'une annonce par son lien (fonction « annonce ») : annonces d'essai de demo.mjs, photos de la Polo 3D ;
    // DELAI_IMPORT (ms) laisse le temps de filmer l'écran « Lecture de l'annonce… »
    if (p === '/functions/v1/annonce') {
      let url = ''; try { url = JSON.parse(body || '{}').url || ''; } catch {}
      const A = ANNONCES.find((x) => url.includes(x.id));
      if (!A) return send(res, 200, { ok: false, erreur: 'introuvable' });
      const photos = A.photos.map((f) => 'data:image/jpeg;base64,' + fs.readFileSync(new URL(`../../assets/presente-v11/annonce/${f}`, import.meta.url)).toString('base64'));
      return setTimeout(() => send(res, 200, { ok: true, src: 'leboncoin', url, ad: A.ad, photos, liens: [], vendeur: A.vendeur }), +(process.env.DELAI_IMPORT || 0));
    }
    send(res, 404, { message: 'faux supabase : ' + p });
  });
}).listen(PORT, '127.0.0.1', () => console.log('faux supabase sur', PORT));
