// Capture du bloc « dossier » de l'écran Analyser (vraie UI, données démo) en 460 px de large :
// en 390 px la rangée de pastilles est écrasée (« Entretien » touche son bord, « Carte grise » déborde).
// Sortie : assets/ui2/dossier-wide.png (densité 3)
import { chromium } from 'playwright';
import path from 'path';
import { openUI, ROOT } from './ui.mjs';
const b = await chromium.launch();
const { page } = await openUI(b, { width: Number(process.env.W || 460), height: 900, scale: 3, view: 'scan' });
await page.fill('#z-annonce-txt', 'Volkswagen Golf VII 1.6 TDI 110 Confortline, 2015, 168 000 km, 9 500 €, Orléans. Distribution faite, CT OK, 2 propriétaires.');
await page.dispatchEvent('#z-annonce-txt', 'input');
await page.waitForTimeout(500);
const r = await page.evaluate(() => {
  const m = document.querySelector('#compV').closest('.dmeta'); const box = m.parentElement;
  const a = box.getBoundingClientRect(); return { x: a.x + scrollX, y: a.y + scrollY, w: a.width, h: a.height, cls: box.className, html: box.innerHTML.slice(0, 300) };
});
console.log(r);
await page.screenshot({ path: path.join(ROOT, 'assets/ui2/dossier-wide.png'), fullPage: true, clip: { x: r.x - 12, y: r.y - 12, width: r.w + 24, height: r.h + 24 } });
await b.close();
