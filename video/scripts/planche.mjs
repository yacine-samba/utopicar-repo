// Capture pleine page d'une planche HTML : node scripts/planche.mjs maquette-hooks/planche-7.html renders/maquette-hooks/planche-7.png [largeur]
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { ROOT } from './ui.mjs';
const [page0, out, w = '2400'] = process.argv.slice(2);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: +w, height: 1200 } });
page.on('pageerror', e => console.error('PAGEERR', e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/${page0}`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
fs.mkdirSync(path.dirname(path.resolve(ROOT, out)), { recursive: true });
await page.screenshot({ path: path.resolve(ROOT, out), fullPage: true });
console.log('→', out); await browser.close(); server.close();
