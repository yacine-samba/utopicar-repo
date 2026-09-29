// Capture la vraie UI UTOPICAR (données démo) en calques pour le film.
// Sortie : assets/ui/*.png + assets/ui/layout.json (rectangles en px CSS, styles réels).
// Viewport 390 x 567 px CSS (écran du film 660 x 960 px), densité 3.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { openUI, nav, ROOT } from './ui.mjs';

const OUT = path.join(ROOT, 'assets/ui');
fs.mkdirSync(OUT, { recursive: true });
const W = 390, VH = 567, S = 3;
const L = { viewport: { w: W, h: VH, scale: S }, shots: {} };

const b = await chromium.launch();
const { page } = await openUI(b, { width: W, height: VH, scale: S, view: 'scan' });
page.on('pageerror', e => console.log('PAGEERR', e.message));

const hideCSS = (sel) => page.addStyleTag({ content: `${sel}{visibility:hidden!important}` });
async function rect(sel) {
  return page.evaluate((sel) => {
    const el = [...document.querySelectorAll(sel)].find(e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed');
    if (!el) return null; const r = el.getBoundingClientRect();
    return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height };
  }, sel);
}
async function style(sel) {
  return page.evaluate((sel) => {
    const el = [...document.querySelectorAll(sel)].find(e => e.offsetParent !== null); if (!el) return null;
    const c = getComputedStyle(el); const r = el.getBoundingClientRect();
    return { text: el.textContent, x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height, fontSize: c.fontSize, fontWeight: c.fontWeight,
      fontStretch: c.fontStretch, letterSpacing: c.letterSpacing, color: c.color, lineHeight: c.lineHeight, textAlign: c.textAlign, fontVariantNumeric: c.fontVariantNumeric };
  }, sel);
}
// capture d'une zone de la page entière, calques fixes masqués
async function pageShot(name, h, extraHide = []) {
  const tag = await page.addStyleTag({ content: ['.bar', '.nav.dock', '.launch', '#toast', ...extraHide].map(s => `${s}{visibility:hidden!important}`).join('') });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true, clip: { x: 0, y: 0, width: W, height: h } });
  await tag.evaluate(t => t.remove());
  L.shots[name] = { w: W, h };
}
async function elShot(name, sel, omitBackground = false) {
  if (!omitBackground) return padShot(name, sel, 0);
  const loc = page.locator(sel).locator('visible=true').first();
  await loc.screenshot({ path: path.join(OUT, name + '.png'), animations: 'disabled', omitBackground });
  L.shots[name] = await rect(sel);
}
// calques en verre (barre, dock, bouton collant) : capturés en PNG transparent, sans la page derrière ;
// le film recrée le flou avec le même backdrop-filter que le site.
// calque d'élément avec marge (ombres et anneaux hors de la boîte), calques fixes masqués
async function padShot(name, sel, pad = 6) {
  const t = await page.addStyleTag({ content: '.bar,.nav.dock,.launch,#toast{visibility:hidden!important}' });
  const r = await rect(sel);
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true, clip: { x: r.x - pad, y: r.y - pad, width: r.w + 2 * pad, height: r.h + 2 * pad } });
  await t.evaluate(x => x.remove());
  L.shots[name] = { x: r.x - pad, y: r.y - pad, w: r.w + 2 * pad, h: r.h + 2 * pad };
}
const fixedShot = async (name, sel) => {
  await page.evaluate(() => scrollTo(0, 0));
  const t = await page.addStyleTag({ content: `html,body{background:transparent!important} main{visibility:hidden!important} ${sel},${sel} *{visibility:visible!important}` });
  await page.waitForTimeout(100);
  await elShot(name, sel, true);
  L.shots[name].glass = await page.evaluate((sel) => { const e = [...document.querySelectorAll(sel)].find(x => x.offsetParent !== null || getComputedStyle(x).position === 'fixed'); const c = getComputedStyle(e); return { backdrop: c.backdropFilter || c.webkitBackdropFilter, radius: c.borderRadius }; }, sel);
  await t.evaluate(x => x.remove());
};

// ---------- calques communs ----------
await page.addStyleTag({ content: '.nav.dock button[aria-current="page"]{transition:none}' });
await fixedShot('bar', '.bar');
L.logo = await page.evaluate(() => {
  const m = document.querySelector('.brand .mark'); const br = document.querySelector('.brand'); const c = getComputedStyle(br);
  const txt = [...br.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('').trim() || br.innerText.trim();
  return { markHTML: m.outerHTML, markBg: getComputedStyle(m).backgroundColor, markRadius: getComputedStyle(m).borderRadius, text: txt,
    fontWeight: c.fontWeight, fontStretch: c.fontStretch, letterSpacing: c.letterSpacing, fontSize: c.fontSize, color: c.color };
});

// ---------- 1. Analyser : annonce de la Golf ----------
await page.fill('#z-annonce-txt', 'Volkswagen Golf VII 1.6 TDI 110 Confortline, 2015, 168 000 km, 9 500 €, Orléans. Distribution faite, CT OK, 2 propriétaires.');
await page.dispatchEvent('#z-annonce-txt', 'input');
await page.waitForTimeout(400);
await fixedShot('dock-scan', '.nav.dock');
await fixedShot('launch', '.launch');
L.aGo = await rect('#aGo');
L.annonceTxt = await rect('#z-annonce-txt');
await pageShot('scan', 1400);

// ---------- 2. Rapport de la Golf ----------
await nav(page, 'dossiers');
await page.locator('.dcard[data-rep="demo-golf"]').locator('visible=true').first().click();
await page.waitForTimeout(900);
await fixedShot('dock-rapport', '.nav.dock');
await pageShot('rapport', 1150);
const nLg = await page.evaluate(() => document.querySelectorAll('#tkLive .ledger .lg').length);
L.ledger = [];
for (let i = 1; i <= nLg; i++) { await elShot(`lg${i}`, `#tkLive .ledger .lg:nth-child(${i})`); L.ledger.push(`lg${i}`); }
L.total = await style('#tkLive .lg.total .v');
await elShot('plafond', '#tkLive .plafond');
// rectangles du texte lui-même (les éléments sont des blocs pleine largeur)
const textRect = (sel) => page.evaluate((sel) => { const e = document.querySelector(sel); const rg = document.createRange(); rg.selectNodeContents(e); const r = rg.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height }; }, sel);
L.plafFig = await textRect('#tkLive .plafond .fig');
L.plafLabel = await textRect('#tkLive .plafond .cond');
await elShot('pos', '#tkLive .plafond + .small');
L.note = await rect('#tkLive .note');
L.verdict = await rect('#tkLive .verdict');
L.ticket = await rect('#tkLive');
L.tkTop = await rect('#tkLive .tk-top');
L.position = await rect('#tkLive .plafond + .small');
// base : lignes, total et plafond masqués (l'app les fait entrer en cascade)
await pageShot('rapport-base', 1150, ['#tkLive .ledger .lg', '#tkLive .plafond', '#tkLive .plafond + .small']);
// variante : lignes présentes, seul le montant du total masqué (pour le compteur)
await page.addStyleTag({ content: '#tkLive .lg.total .v{visibility:hidden!important}' }).then(async t => {
  await elShot('lgTotalNoV', '#tkLive .lg.total'); await t.evaluate(x => x.remove());
});

// ---------- 3. Recherche en direct ----------
await nav(page, 'live');
await page.waitForTimeout(1200);
await fixedShot('dock-live', '.nav.dock');
L.cards = [];
const cardIds = await page.evaluate(() => [...document.querySelectorAll('#liveList article.lv')].map(a => a.dataset.lv));
for (const id of cardIds.slice(0, 2)) { await padShot(`card-${id}`, `article.lv[data-lv="${id}"]`, 6); L.cards.push(`card-${id}`); }
const cardTop = L.shots[`card-${cardIds[0]}`].y + 6;
L.cardTop = cardTop;
L.liveTabs = await rect('#v-live .tabs');
L.cote = await page.evaluate((id) => {
  const card = document.querySelector(`article.lv[data-lv="${id}"]`);
  const spans = [...card.querySelectorAll('.rt span')];
  const pick = (re) => { const e = spans.find(s => re.test(s.textContent)); if (!e) return null; const r = e.getBoundingClientRect(); return { text: e.textContent.trim(), x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height }; };
  const tag = [...card.querySelectorAll('.tag')].find(t => /Vraie affaire/.test(t.textContent)); const tr = tag && tag.getBoundingClientRect();
  const pr = card.querySelector('.rt .fig').getBoundingClientRect();
  const R = e => { const r = e.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height }; };
  return { title: R(card.querySelector('.bd b.t')), ago: R(card.querySelector('.bd .ago')), cote: pick(/^Cote /), sous: pick(/sous la cote/), prix: { x: pr.x + scrollX, y: pr.y + scrollY, w: pr.width, h: pr.height }, vraie: tr ? { x: tr.x + scrollX, y: tr.y + scrollY, w: tr.width, h: tr.height } : null };
}, cardIds[0]);
await pageShot('live', Math.ceil(cardTop + 1500));
await pageShot('live-base', Math.ceil(cardTop + 1500), ['#liveList article.lv']);

// ---------- 4. Tableau de bord ----------
await nav(page, 'dash');
await page.waitForTimeout(600);
await fixedShot('dock-dash', '.nav.dock');
L.kpis = [];
const nK = await page.evaluate(() => document.querySelectorAll('#kpis .kpi').length);
for (let i = 1; i <= nK; i++) L.kpis.push(await style(`#kpis .kpi:nth-child(${i}) .v`));
L.kpiRects = [];
for (let i = 1; i <= nK; i++) L.kpiRects.push(await rect(`#kpis .kpi:nth-child(${i})`));
L.pipe = await rect('#pipe');
await pageShot('dash', 1150);
await pageShot('dash-base', 1150, ['#kpis .kpi .v']);

// positions des boutons du dock (pour les pressions du curseur)
L.dockBtns = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.nav.dock button')].map(b => { const r = b.getBoundingClientRect(); return [b.dataset.v || b.textContent.trim(), { x: r.x, y: r.y, w: r.width, h: r.height }]; })));

fs.writeFileSync(path.join(OUT, 'layout.json'), JSON.stringify(L, null, 1));
console.log('ok', Object.keys(L.shots).length, 'calques');
await b.close();
