// Fiche 208 du vrai site (page d'accueil animée exportée, libellés « exemple » retirés) capturée en HD (3×) à quelques
// instants : liste de contrôle, puis fiche complète. Sortie : assets/presente-v/fiche-<ms>.png (carte seule).
// usage : node scripts/capture-fiche208.mjs 300,1200,6000   (depuis video/)
import { chromium } from 'playwright';
import path from 'node:path';
const T = (process.argv[2] || '300,1200,6000').split(',').map(Number);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 3 });
await p.goto('file://' + path.resolve('assets/presente-v/fiche-208.html')); await p.waitForFunction(() => /Lecture/.test(document.body.innerText)); const t0 = Date.now();
for (const ms of T) {
  await p.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
  const box = await p.evaluate(() => { const c = [...document.querySelectorAll('body *')].filter((d) => /Fiche.Utopicar/.test(d.textContent) && /Lecture|Cote/.test(d.textContent) && d.getBoundingClientRect().width > 250).sort((u, v) => u.getBoundingClientRect().width * u.getBoundingClientRect().height - v.getBoundingClientRect().width * v.getBoundingClientRect().height)[0]; const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  await p.screenshot({ path: `assets/presente-v/fiche-${ms}.png`, clip: { x: box.x - 4, y: box.y - 4, width: box.width + 8, height: box.height + 8 } });
  console.log(ms, box);
}
await b.close();
