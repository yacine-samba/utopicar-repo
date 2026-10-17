// Aperçu du flou de bougé d'une image, comme render.mjs (sous-images réparties sur l'ouverture, moyennées)
//   node scripts/mb-apercu.mjs <cut> <dossier> t1 t2 …   (sans attendre un rendu complet : contrôle d'un défilement, d'un bloc qui sort)
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
const ROOT = '/home/user/utopicar-repo/video';
const [cut, out, ...ts] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.mjs': 'text/javascript' };
const server = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', (e) => console.error('PAGEERR', e.message));
await p.goto(`http://127.0.0.1:${server.address().port}/film-${cut}/index.html?render=1`);
await p.waitForFunction(() => window.filmReady === true, null, { timeout: 120000 });
for (const ts_ of ts) {
  const t = Number(ts_);
  const open = await p.evaluate((t) => window.shutter(t), t), K = await p.evaluate((t) => window.samples(t), t);
  const fs_ = [];
  for (let j = 0; j < K; j++) { const tt = t + ((j + 0.5) / K - 0.5) * open / 30; await p.evaluate((x) => window.seek(x), tt); const f = path.join(out, `_s${j}.png`); await p.screenshot({ path: f }); fs_.push(f); }
  execFileSync('python3', ['-c', `
import sys, numpy as np
from PIL import Image
fs = sys.argv[2:]; a = np.mean([np.asarray(Image.open(f).convert('RGB'), dtype=np.float32) for f in fs], axis=0)
Image.fromarray(a.clip(0, 255).astype('uint8')).save(sys.argv[1])`, path.join(out, `mb${t.toFixed(2)}.png`), ...fs_]);
  console.log('→', `mb${t.toFixed(2)}.png`, `(${K} sous-images, ouverture ${open})`);
}
await b.close(); server.close();
