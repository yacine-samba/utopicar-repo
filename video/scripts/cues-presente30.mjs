// Repères sonores de la présentation 30 s (window.cues, publiés par film-presente30/film.js) → audio/cues-presente30.json,
// lus par scripts/audio-presente30.py pour poser chaque bruitage sur son image.
//   node scripts/cues-presente30.mjs
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
import { ROOT } from './ui.mjs';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.otf': 'font/otf', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const hook of ['']) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 0.25 });
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/film-presente30/index.html?render=1`);
  await page.waitForFunction(() => window.filmReady === true, null, { timeout: 300000 });
  const cues = await page.evaluate(() => window.cues);
  const out = path.join(ROOT, 'audio', `cues-presente30.json`);
  fs.writeFileSync(out, JSON.stringify(cues) + '\n');
  console.log(hook, cues.length, 'repères →', path.relative(ROOT, out));
  await page.close();
}
await browser.close(); server.close();
