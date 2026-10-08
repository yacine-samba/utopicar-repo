// Temps des événements d'un film (window.EVENTS) → film-<projet>/events.json, pour poser les bruitages sur l'image.
//   CUT=mo9 node scripts/events.mjs
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { ROOT } from './ui.mjs';
const CUT = process.env.CUT || 'mo9';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webp': 'image/webp' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 0.25 });
page.on('pageerror', e => console.error('PAGEERR', e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/film-${CUT}/index.html?render=1`);
await page.waitForFunction(() => window.filmReady === true, null, { timeout: 300000 });
const ev = await page.evaluate(() => window.EVENTS);
await browser.close(); server.close();
const round = (v) => Array.isArray(v) ? v.map(round) : typeof v === 'object' && v ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, round(x)])) : typeof v === 'number' ? Math.round(v * 1000) / 1000 : v;
const out = path.join(ROOT, `film-${CUT}`, 'events.json');
fs.writeFileSync(out, JSON.stringify(round(ev), null, 1) + '\n');
console.log('→', path.relative(ROOT, out));
