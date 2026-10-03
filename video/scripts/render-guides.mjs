// Guides PDF (A4) : guides/guide-*.html → guides/guide-*.pdf + un aperçu PNG par page (guides/preview/)
// usage : node scripts/render-guides.mjs
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const T = { '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': T[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1.5 });
fs.mkdirSync(path.join(ROOT, 'guides/preview'), { recursive: true });
for (const name of ['guide-debutant', 'guide-pro']) {
  await page.goto(`${base}/guides/${name}.html`); await page.evaluate(() => document.fonts.ready);
  // contrôle : aucune page ne déborde de son format A4
  const over = await page.evaluate(() => [...document.querySelectorAll('.page')].map((p, i) => [i + 1, p.scrollHeight - p.clientHeight]).filter(([, d]) => d > 1));
  if (over.length) console.log(`${name} : débordement page(s) ${over.map(([i, d]) => `${i} (+${d}px)`).join(', ')}`);
  await page.pdf({ path: path.join(ROOT, `guides/${name}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
  const n = await page.evaluate(() => document.querySelectorAll('.page').length);
  for (let i = 0; i < n; i++) {
    const el = (await page.$$('.page'))[i];
    await el.screenshot({ path: path.join(ROOT, `guides/preview/${name}-${i + 1}.png`) });
  }
  console.log(`→ guides/${name}.pdf (${n} pages)`);
}
await browser.close(); server.close();
