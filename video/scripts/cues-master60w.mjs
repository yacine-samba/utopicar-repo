// Repères sonores du film « wow » (window.cues, publiés par film-master60w/film.js) → audio/cues-master60w-{A,B}.json,
// lus par scripts/audio-master60w.py pour poser chaque bruitage sur son image.
//   node scripts/cues-master60w.mjs
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { ROOT } from './ui.mjs';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.otf': 'font/otf', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const hook of ['A', 'B']) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 0.25 });
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/film-master60w/index.html?render=1&hook=${hook}`);
  await page.waitForFunction(() => window.filmReady === true, null, { timeout: 300000 });
  const cues = await page.evaluate(() => window.cues);
  const out = path.join(ROOT, 'audio', `cues-master60w-${hook}.json`);
  fs.writeFileSync(out, JSON.stringify(cues) + '\n');
  console.log(hook, cues.length, 'repères →', path.relative(ROOT, out));
  await page.close();
}
await browser.close(); server.close();
