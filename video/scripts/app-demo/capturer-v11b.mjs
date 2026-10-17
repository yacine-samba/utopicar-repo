// Captures complémentaires de la vraie app (main) pour le film v11, sur la base démo :
//  - l'analyse de la Polo image par image (2×, toutes les 0,25 s environ), du clic sur « Analyser ce lien » au rapport :
//    les étapes de l'attente se cochent vraiment dans le film ;
//  - le parc : la Clio « Repérée », l'appui sur « Acheter » (la carte passe « Achetée », l'avis « Achetée : Renault Clio »
//    descend), l'avis en gros plan (3×), l'onglet « Vendues » et la page des ventes à plat, avec la place de la Clio.
// usage : node capturer-v11b.mjs ../../assets/presente-v11/app   (faux Supabase relancé avant : état propre ;
//   DELAI_IMPORT=3500 DELAIS=cote_marche:6000 ; app sur localhost:3100)
import fs from 'node:fs';
import { ouvrir, BASE } from './session.mjs';
const OUT = process.argv[2]; fs.mkdirSync(`${OUT}/seq-analyse`, { recursive: true });
const T = {};
// mêmes nettoyages que capturer-v11.mjs (espace fine → insécable, liens d'accessibilité masqués)
const propre = (p) => p.evaluate(() => { document.activeElement?.blur(); for (const a of document.querySelectorAll('a,button')) if (/Aller au contenu|animations en pause/.test(a.textContent)) a.style.display = 'none';
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.nodeValue.includes(' ')) n.nodeValue = n.nodeValue.replace(/ /g, ' ');
  for (const i of document.querySelectorAll('input')) if (i.value.includes(' ')) i.value = i.value.replace(/ /g, ' '); });
const aPlat = (p) => p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const cs = getComputedStyle(e); if (cs.position === 'fixed') e.style.display = 'none'; else if (cs.position === 'sticky') e.style.position = 'relative'; } scrollTo(0, 0); });

let A = await ouvrir({ sc: 2 }), p = A.p;
// 1. l'analyse de la Polo, image par image
await p.goto(BASE + '/app/analyser', { waitUntil: 'networkidle', timeout: 180000 }); await p.waitForTimeout(1500);
await p.getByPlaceholder(/leboncoin\.fr\/ad\/voitures/).first().fill('https://www.leboncoin.fr/ad/voitures/2873461903'); await p.waitForTimeout(400);
const t0 = Date.now(); await p.getByRole('button', { name: /Analyser ce lien/ }).first().click();
const SEQ = []; let k = 0;
while (!/rapports\//.test(p.url()) && Date.now() - t0 < 60000) {
  await propre(p).catch(() => {});
  const t = (Date.now() - t0) / 1000, f = `seq-analyse/${String(k).padStart(3, '0')}.png`;
  await p.screenshot({ path: `${OUT}/${f}` }).catch(() => {});
  if (/rapports\//.test(p.url())) break;
  SEQ.push({ f, t: +t.toFixed(2) }); k++; await p.waitForTimeout(120);
}
T['seq-analyse'] = SEQ; console.log('analyse :', SEQ.length, 'images en', SEQ.at(-1)?.t, 's');
await p.waitForLoadState('networkidle'); await p.waitForTimeout(1500);
// 2. la Clio : analysée, ajoutée au parc
await p.goto(BASE + '/app/analyser', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
await p.getByPlaceholder(/leboncoin\.fr\/ad\/voitures/).first().fill('https://www.leboncoin.fr/ad/voitures/2870558214');
await p.getByRole('button', { name: /Analyser ce lien/ }).first().click();
await p.waitForURL(/rapports\//, { timeout: 90000 }); await p.waitForLoadState('networkidle'); await p.waitForTimeout(2000);
await p.getByRole('button', { name: /Ajouter au parc/ }).first().click(); await p.waitForTimeout(2500);
// 3. l'avis « Achetée : Renault Clio » en gros plan (3×, téléphone de 430 px) : achat de la Clio (première carte du parc),
//    photo de l'avis, puis « Annuler » dans l'avis (la Clio redevient « Repérée »)
const B = await ouvrir({ w: 430, h: 932, sc: 3 }), q = B.p;
await q.goto(BASE + '/app/parc', { waitUntil: 'networkidle' }); await q.waitForTimeout(1500);
await q.getByRole('button', { name: /^Acheter$/ }).first().click(); await q.waitForTimeout(700); await propre(q);
const avis = await q.getByText('Achetée : Renault Clio').first().evaluateHandle((e) => { let c = e; while (c && !/rounded/.test(c.className || '')) c = c.parentElement; return c || e; });
await avis.asElement().screenshot({ path: `${OUT}/avis-achetee.png` });
await q.getByText('Annuler', { exact: true }).first().click(); await q.waitForTimeout(1500);
await B.b.close();

// 4. le parc : « Repérée », puis « Acheter »
await A.b.close(); A = await ouvrir({ sc: 2 }); p = A.p;
await p.goto(BASE + '/app/parc', { waitUntil: 'networkidle' }); await p.waitForTimeout(2000); await propre(p);
await p.screenshot({ path: `${OUT}/ecran-parc-reperee.png` });
const btn = p.getByRole('button', { name: /^Acheter$/ }).first(); T['acheter'] = await btn.boundingBox();
await btn.click(); await p.waitForTimeout(900); await propre(p);
await p.screenshot({ path: `${OUT}/ecran-parc-achetee.png` });
T['avis'] = await p.getByText('Achetée : Renault Clio').first().evaluate((e) => { let c = e; while (c && !/rounded/.test(c.className || '')) c = c.parentElement; const r = (c || e).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }).catch(() => null);
// 5. onglet « Vendues » : haut de la liste, puis la page entière à plat et la place de la Clio vendue
const onglet = p.getByText('Vendues', { exact: true }).first(); T['onglet-vendues'] = await onglet.boundingBox();
await p.screenshot({ path: `${OUT}/ecran-parc-encours.png` });
await onglet.click(); await p.waitForTimeout(1500); await propre(p);
await p.screenshot({ path: `${OUT}/ecran-parc-vendues2.png` });
await aPlat(p); await p.waitForTimeout(300); await propre(p);
await p.screenshot({ path: `${OUT}/page-parc-vendues.png`, fullPage: true });
T['vendue-clio'] = await p.evaluate(() => { const c = [...document.querySelectorAll('[class*="rounded"], .carte')].filter((e) => /Clio IV 1.5 dCi 75 Zen[\s\S]*Vendue[\s\S]*Marge réelle/.test(e.innerText || '')).sort((a, b) => a.innerText.length - b.innerText.length)[0]; if (!c) return null; const r = c.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; });
T['vendues-haut'] = await p.evaluate(() => document.documentElement.scrollHeight);
await A.b.close();

fs.writeFileSync(`${OUT}/textes-b.json`, JSON.stringify(T, null, 1));
console.log('→', OUT, JSON.stringify({ acheter: T.acheter, avis: T.avis, onglet: T['onglet-vendues'], clio: T['vendue-clio'] }));
