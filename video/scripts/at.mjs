// Planche d'instants choisis d'un film seek(t) : CUT=<projet> node scripts/at.mjs 0,2.5,4.8 renders/review/<projet>-at.jpg [échelle]
// Pour regarder vite quelques images avant de tirer les planches complètes (sheet.mjs).
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
import { ROOT } from './ui.mjs';
const CUT = process.env.CUT || 'mo9';
const [list, outRel, sc] = process.argv.slice(2);
const times = list.split(',').map(Number), scale = Number(sc || 0.4);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webp': 'image/webp' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
page.on('pageerror', e => console.error('PAGEERR', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text().slice(0, 200)); });
await page.goto(`http://127.0.0.1:${server.address().port}/film-${CUT}/index.html?render=1`);
await page.waitForFunction(() => window.filmReady === true, null, { timeout: 300000 });
const dir = path.join(ROOT, 'renders', `_at-${CUT}`); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
for (const [i, t] of times.entries()) { await page.evaluate(t => window.seek(t), t); await page.screenshot({ path: path.join(dir, `f${String(i).padStart(3, '0')}.jpg`), type: 'jpeg', quality: 85 }); }
await browser.close(); server.close();
const out = path.resolve(ROOT, outRel);
execFileSync('python3', ['-c', `
import glob
from PIL import Image, ImageDraw
fs=sorted(glob.glob('${dir}/f*.jpg')); T=${JSON.stringify(times)}; cols=min(6,len(fs)); w,h=360,640; lab=22
rows=(len(fs)+cols-1)//cols
S=Image.new('RGB',(cols*(w+4)+4, rows*(h+lab+4)+4),'#1b1f27'); d=ImageDraw.Draw(S)
for i,f in enumerate(fs):
  im=Image.open(f).convert('RGB').resize((w,h)); x=4+(i%cols)*(w+4); y=4+(i//cols)*(h+lab+4)
  S.paste(im,(x,y+lab)); d.text((x+3,y+4),'%.2f s'%T[i],fill='#FFC928')
S.save('${out}',quality=85)
`]);
console.log('→', out);
