// Capture HD (3×) du vrai site pour les vidéos : node ui-seq-hd.mjs <dossier_racine> <page.html> <sortie> 400 860 4.6
// Écrit des JPEG pleine page mobile (1200×2580) et times.json ; rééchantillonner ensuite à 30 i/s. Voir techniques.md § 20.
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const [root, page0, outdir, w, h, dur] = process.argv.slice(2);
const server = http.createServer((q, r) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp' }[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const b = await chromium.launch({ executablePath: process.env.CHROMIUM });
const pg = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 3 });
fs.rmSync(outdir, { recursive: true, force: true }); fs.mkdirSync(outdir, { recursive: true });
const cdp = await pg.context().newCDPSession(pg);
await pg.goto(`http://127.0.0.1:${server.address().port}/${page0}`);
const t0 = Date.now(), times = []; let i = 0;
while (Date.now() - t0 < +dur * 1000) { const d = (await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 400, height: 860, scale: 3 }, captureBeyondViewport: false })).data; times.push((Date.now() - t0) / 1000); fs.writeFileSync(path.join(outdir, `f${String(i++).padStart(3, '0')}.jpg`), Buffer.from(d, 'base64')); }
fs.writeFileSync(path.join(outdir, 'times.json'), JSON.stringify(times)); console.log(i, 'images'); await b.close(); server.close();
