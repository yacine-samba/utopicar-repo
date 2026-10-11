// Images fixes d'une page de DA : node scripts/stills.mjs film-mo8/da.html 1,2,3 renders/review/mo8-da
// Chaque scène ?s=<n> est rendue quand la page pose window.ready = true.
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { ROOT } from './ui.mjs';
const [page0, list, prefix] = process.argv.slice(2);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webp': 'image/webp', '.hdr': 'application/octet-stream' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const s of list.split(',')) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('PAGEERR', s, e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('CONSOLE', s, m.text().slice(0, 300)); });
  const t0 = Date.now();
  await page.goto(`http://127.0.0.1:${server.address().port}/${page0}?s=${s}${process.env.QS || ''}`);
  await page.waitForFunction(() => window.ready === true, null, { timeout: 300000 });
  const out = path.resolve(ROOT, `${prefix}-${s}.png`); fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out });
  console.log('→', out, ((Date.now() - t0) / 1000).toFixed(1) + ' s');
  await page.close();
}
await browser.close(); server.close();
