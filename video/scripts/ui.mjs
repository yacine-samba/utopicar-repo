// Ouvre la vraie page UTOPICAR (assets/site/utopicar-live.html) dans Chromium,
// branchée sur une base démo : window.claude est remplacé par un faux db / mcp / sample.
// Le fichier HTML n'est pas modifié.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { demo } from './demo-data.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONT = fs.readFileSync(path.join(ROOT, 'assets/site/Archivo-latin.woff2'));
const FONT_CSS = `@font-face{font-family:'Archivo';font-style:normal;font-weight:400 800;font-stretch:62% 125%;src:url(https://local.font/Archivo.woff2) format('woff2');}`;

function mockClaude(data) {
  const snap = docs => ({ docs: docs.map(d => ({ id: d.id, data: () => JSON.parse(JSON.stringify(d)) })) });
  const coll = name => {
    const q = {
      orderBy: () => q, limit: () => q, where: () => q,
      onSnapshot: (cb) => { setTimeout(() => cb(snap(data[name] || [])), 0); return () => {}; },
      add: async () => ({ id: 'x' }), doc: () => ({ set: async () => {}, update: async () => {}, delete: async () => {} }),
    };
    return q;
  };
  const db = {
    collection: coll,
    doc: (p) => ({
      onSnapshot: (cb) => { setTimeout(() => cb({ exists: p === 'config/params', data: () => data.params }), 0); return () => {}; },
      set: async () => {}, update: async () => {},
    }),
  };
  const mcp = {
    callTool: async (server, tool, args) => {
      const q = String(args && args.query || '');
      let rows = [];
      if (q.includes('utp_etat')) rows = [{ e: data.sql.etat }];
      else if (q.includes('utp_live')) rows = [{ l: data.sql.live }];
      else if (q.includes('utp_cotes')) rows = [{ c: data.sql.cotes }];
      return { payload: rows };
    },
  };
  const sample = { limits: async () => ({}), create: async () => { throw new Error('démo'); } };
  window.claude = { use: async (cap) => ({ db, mcp, sample })[cap] || null };
}

export async function openUI(browser, { width = 390, height = 844, scale = 3, view = 'scan' } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, reducedMotion: 'reduce', colorScheme: 'light', locale: 'fr-FR', timezoneId: 'Europe/Paris' });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date(demo.now));
  await page.route('**/fonts.googleapis.com/**', r => r.fulfill({ contentType: 'text/css', body: FONT_CSS }));
  await page.route('https://local.font/**', r => r.fulfill({ contentType: 'font/woff2', body: FONT }));
  await page.route('**/cdnjs.cloudflare.com/**', r => r.fulfill({ contentType: 'text/javascript', body: '' }));
  await page.addInitScript(({ v }) => { try { localStorage.setItem('utp-view', v); localStorage.setItem('utp-theme', 'light'); } catch (e) {} }, { v: view });
  await page.addInitScript(mockClaude, demo);
  await page.goto('file://' + path.join(ROOT, 'assets/site/utopicar-live.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  return { ctx, page };
}

export async function nav(page, v) {
  await page.evaluate((v) => { const b = [...document.querySelectorAll('.nav.dock button, .nav.top button')].find(b => b.dataset.v === v); b && b.click(); }, v);
  await page.waitForTimeout(500);
}

export { ROOT };
