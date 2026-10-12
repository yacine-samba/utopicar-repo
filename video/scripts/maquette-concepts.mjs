// Maquette des 5 concepts : une image 1080×1920 par écran → renders/maquette-concepts/fNN.png
// usage (depuis video/) : node scripts/maquette-master60.mjs [n1,n2,…]
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { ROOT } from './ui.mjs';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const OUT = path.join(ROOT, 'renders/maquette-concepts'); fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on('pageerror', (e) => console.error('PAGEERR', e.message));
const url = (n) => `http://127.0.0.1:${server.address().port}/maquette-concepts/index.html?f=${n}`;
await pg.goto(url(0)); await pg.waitForFunction(() => window.ready === true);
const total = await pg.evaluate(() => window.nFrames);
const list = process.argv[2] ? process.argv[2].split(',').map(Number) : [...Array(total).keys()];
for (const n of list) {
  await pg.goto(url(n)); await pg.waitForFunction(() => window.ready === true);
  await pg.screenshot({ path: path.join(OUT, `f${String(n + 1).padStart(2, '0')}.png`) });
}
console.log(list.length, 'écrans →', path.relative(ROOT, OUT));
await b.close(); server.close();
