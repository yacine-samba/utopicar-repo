// Planches toutes les 0,1 s : CUT=<projet> node scripts/sheet.mjs <début> <fin> → renders/review/<projet>-planche-0.1s-<début>-<fin>.jpg
// Une planche = 10 s (100 images, 10 par ligne). Lancer plusieurs plages en parallèle : chacune a son dossier _sheet<début>.
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
import { ROOT } from './ui.mjs';
const CUT = process.env.CUT || 'mo6';
const [a, b] = process.argv.slice(2).map(Number);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webp': 'image/webp' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 0.25 });
page.on('pageerror', e => console.error('PAGEERR', e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/film-${CUT}/index.html?render=1`);
await page.waitForFunction(() => window.filmReady === true, null, { timeout: 120000 });
const dir = path.join(ROOT, 'renders', `_sheet-${CUT}-${a}`); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const N = Math.round((b - a) * 10);
for (let i = 0; i < N; i++) { const t = +(a + i / 10).toFixed(2); await page.evaluate(t => window.seek(t), t); await page.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 80 }); }
await browser.close(); server.close();
const out = path.join(ROOT, 'renders', 'review', `${CUT}-planche-0.1s-${a}-${b}.jpg`);
execFileSync('python3', ['-c', `
import glob,sys
from PIL import Image, ImageDraw
fs=sorted(glob.glob('${dir}/f*.jpg')); a=${a}; cols=10; w,h=270,480; lab=22
rows=(len(fs)+cols-1)//cols
S=Image.new('RGB',(cols*(w+4)+4, rows*(h+lab+4)+4),'#1b1f27'); d=ImageDraw.Draw(S)
for i,f in enumerate(fs):
  im=Image.open(f).convert('RGB').resize((w,h)); x=4+(i%cols)*(w+4); y=4+(i//cols)*(h+lab+4)
  S.paste(im,(x,y+lab)); d.text((x+3,y+4),'%.1f s'%(a+i/10),fill='#FFC928')
S.save('${out}',quality=82)
`]);
console.log('→', out);
