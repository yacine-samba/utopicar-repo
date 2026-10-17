// Séquence HD (3×) de la vraie fiche du site qui se construit (liste de contrôle → fiche complète), pour une carte qui
// suit le contenu (techniques.md § 20). À chaque capture : image de la zone de la carte (360 × 520 px CSS, ×3) et hauteur
// réelle de la carte (DOM). Temps virtuel de Chromium : la page avance d'exactement 1/30 s entre deux captures.
// Sortie : assets/presente-v/seq/f000.jpg… + seq.json [{t, h}] ; rééchantillonné à 30 i/s.
// usage : node scripts/capture-fiche208-seq.mjs 2.6   (depuis video/)
import { chromium } from 'playwright'; import fs from 'node:fs'; import path from 'node:path';
const DUR = +(process.argv[2] || 2.6), OUT = 'assets/presente-v/seq';
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 3 });
const cdp = await p.context().newCDPSession(p);
await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pause' });
await p.goto('file://' + path.resolve('assets/presente-v/fiche-208.html'), { waitUntil: 'commit' });
const step = (ms) => new Promise((res) => { cdp.once('Emulation.virtualTimeBudgetExpired', res); cdp.send('Emulation.setVirtualTimePolicy', { policy: 'advance', budget: ms }); });
let guard = 0; while (!(await p.evaluate(() => !!document.body && /Lecture/.test(document.body.innerText))) && guard++ < 200) await step(10);
const pick = () => p.evaluateHandle(() => [...document.querySelectorAll('body *')].filter((d) => /Fiche.utopicar/i.test(d.textContent) && /Lecture|Cote/.test(d.textContent) && d.getBoundingClientRect().width > 250).sort((u, v) => u.getBoundingClientRect().width * u.getBoundingClientRect().height - v.getBoundingClientRect().width * v.getBoundingClientRect().height)[0]);
const N = Math.round(DUR * 30), seq = [];
for (let i = 0; i < N; i++) {
  const card = await pick(), r = await card.evaluate((c) => { const q = c.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height }; });
  const d = (await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 93, clip: { x: r.x, y: r.y, width: r.w, height: 520, scale: 3 } })).data;
  fs.writeFileSync(path.join(OUT, `f${String(i).padStart(3, '0')}.jpg`), Buffer.from(d, 'base64')); seq.push({ t: +(i / 30).toFixed(3), h: +r.h.toFixed(1) });
  await step(1000 / 30);
}
fs.writeFileSync(path.join(OUT, 'seq.json'), JSON.stringify(seq));
console.log(N, 'images ; hauteurs', seq[0].h, '→', seq[N - 1].h); await b.close();
