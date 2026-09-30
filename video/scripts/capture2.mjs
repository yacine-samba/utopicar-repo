// Calques supplémentaires de la vraie UI UTOPICAR (données démo) pour les films 60 s (v5 explainer, v6 chat).
// Sortie : assets/ui2/*.png + assets/ui2/layout.json. Viewport 390 px CSS, densité 3.
// Chaque calque est un élément réel de la page, capturé avec une marge (ombres), calques fixes masqués.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { openUI, nav, ROOT } from './ui.mjs';

const OUT = path.join(ROOT, 'assets/ui2');
fs.mkdirSync(OUT, { recursive: true });
const W = 390, VH = 844, S = 3;
const L = { viewport: { w: W, h: VH, scale: S }, shots: {} };
const b = await chromium.launch();
const { page } = await openUI(b, { width: W, height: VH, scale: S, view: 'scan' });
page.on('pageerror', e => console.log('PAGEERR', e.message));
await page.addStyleTag({ content: '.bar,.nav.dock,.launch,#toast{visibility:hidden!important} *{transition:none!important;animation:none!important}' });

async function rect(sel) {
  return page.evaluate((sel) => {
    const el = [...document.querySelectorAll(sel)].find(e => e.offsetParent !== null);
    if (!el) return null; const r = el.getBoundingClientRect();
    return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height };
  }, sel);
}
async function shot(name, sel, pad = 8) {
  const r = await rect(sel); if (!r) { console.log('absent', sel); return; }
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true, clip: { x: Math.max(0, r.x - pad), y: r.y - pad, width: Math.min(W - Math.max(0, r.x - pad), r.w + 2 * pad), height: r.h + 2 * pad } });
  L.shots[name] = { x: Math.max(0, r.x - pad), y: r.y - pad, w: Math.min(W - Math.max(0, r.x - pad), r.w + 2 * pad), h: r.h + 2 * pad };
}
// élément de texte : rectangle relatif à un calque (pour poser un surlignage ou un curseur)
async function rel(name, sel) {
  const r = await rect(sel), o = L.shots[name]; if (!r || !o) return null;
  return { x: r.x - o.x, y: r.y - o.y, w: r.w, h: r.h };
}

// ---------- Rapports (liste) ----------
await nav(page, 'dossiers'); await page.waitForTimeout(900);
await shot('dcard1', '#dlist .dcard:nth-child(1)');
await shot('dcard2', '#dlist .dcard:nth-child(2)');
L.dcard1Fig = await rel('dcard1', '#dlist .dcard:nth-child(1) .fig');
L.dcard2Fig = await rel('dcard2', '#dlist .dcard:nth-child(2) .fig');
L.dcard2Go = await rel('dcard2', '#dlist .dcard:nth-child(2) .tag.solid-ok');

// ---------- Rapport de la Golf ----------
await page.locator('.dcard[data-rep="demo-golf"]').locator('visible=true').first().click();
await page.waitForTimeout(900);
await shot('ticket', '#tkLive', 10);
await shot('tktop', '#tkLive .tk-top', 8);
await shot('plaf', '#tkLive .plafond', 8);
L.ticketTotal = await rel('ticket', '#tkLive .lg.total');
L.ticketPlaf = await rel('ticket', '#tkLive .plafond');
L.ticketTop = await rel('ticket', '#tkLive .tk-top');

// ---------- Analyser ----------
await nav(page, 'scan'); await page.waitForTimeout(600);
await page.fill('#z-annonce-txt', 'Volkswagen Golf VII 1.6 TDI 110 Confortline, 2015, 168 000 km, 9 500 €, Orléans. Distribution faite, CT OK, 2 propriétaires.');
await page.dispatchEvent('#z-annonce-txt', 'input'); await page.waitForTimeout(500);
await shot('dbar', '#dbar', 6);
L.luSel = await page.evaluate(() => {
  const e = [...document.querySelectorAll('#zones *')].find(x => x.children.length === 0 && /Lu sur l.annonce/.test(x.textContent));
  let p = e; while (p && p.parentElement && p.getBoundingClientRect().height < 80) p = p.parentElement;
  p.setAttribute('data-cap', 'lu'); return p.className;
});
await shot('lu', '[data-cap="lu"]', 8);

// ---------- Recherche ----------
await nav(page, 'live'); await page.waitForTimeout(1300);
await shot('qsform', '#qsForm', 10);
L.qsQ = await rel('qsform', '#qs-q');
L.qsGo = await rel('qsform', '#qsGo');
L.qsB = await rel('qsform', '#qsVp .field:nth-child(1) select');
L.qsM = await rel('qsform', '#qsVp .field:nth-child(2) select');
L.qsG = await rel('qsform', '#qsVp .field:nth-child(3) select');
L.qsPmax = await rel('qsform', '#qs-pmax');
L.qsKmax = await rel('qsform', '#qs-kmax');
await shot('schip', '#liveSearches .chip:nth-child(2)', 6);

// ---------- Parc ----------
await nav(page, 'parc'); await page.waitForTimeout(900);
await shot('filters', '#filters', 8);
await page.evaluate(() => [...document.querySelectorAll('#vlist .vrow')].filter(e => e.offsetParent !== null).forEach((e, i) => e.setAttribute('data-cap', 'vrow' + (i + 1))));
for (let i = 1; i <= 5; i++) await shot('vrow' + i, `[data-cap="vrow${i}"]`, 2);
await shot('vlist', '#vlist', 8);

// ---------- Tableau de bord ----------
await nav(page, 'dash'); await page.waitForTimeout(900);
for (let i = 1; i <= 6; i++) await shot('kpi' + i, `#kpis .kpi:nth-child(${i})`, 8);
await shot('kpis', '#kpis', 8);
await shot('best', '.bento .panel.b-8', 10);
await shot('pipe', '.bento .panel.b-4', 10);
await shot('alerts', '.bento .panel.b-6:nth-of-type(3)', 10);
await shot('mchart', '.bento .panel.b-6:nth-of-type(4)', 10);
await shot('lvmini', '#dashLiveP', 10);
L.kpiText = await page.evaluate(() => [...document.querySelectorAll('#kpis .kpi')].map(k => k.innerText.split('\n').map(s => s.trim()).filter(Boolean)));

fs.writeFileSync(path.join(OUT, 'layout.json'), JSON.stringify(L, null, 1));
console.log('ok', Object.keys(L.shots).length, 'calques', L.luSel);
await b.close();
