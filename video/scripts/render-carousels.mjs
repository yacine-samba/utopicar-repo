// Rendu des carrousels TikTok : carousels/carousels.json → renders/carousels/<NN-slug>/<NN-slug>-<1..5>.png (1080x1920)
// + planche par carrousel et vue d'ensemble. usage : node scripts/render-carousels.mjs [indices séparés par des virgules]
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
import { ROOT } from './ui.mjs';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'carousels/carousels.json'), 'utf8'));
const only = process.argv[2] ? process.argv[2].split(',').map(Number) : DATA.carousels.map((_, i) => i);
const OUT = path.join(ROOT, 'renders/carousels'); fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('PAGEERR', e.message));
const issues = [];
for (const c of only) {
  const car = DATA.carousels[c]; const name = `${String(c + 1).padStart(2, '0')}-${car.slug}`; const dir = path.join(OUT, name);
  fs.mkdirSync(dir, { recursive: true });
  for (let s = 0; s < car.slides.length; s++) {
    await page.goto(`${base}/carousels/slide.html?c=${c}&s=${s}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
    if (await page.evaluate(() => window.overflow)) issues.push(`${name} image ${s + 1} : contenu trop haut`);
    await page.screenshot({ path: path.join(dir, `${name}-${s + 1}.png`) });
  }
  execFileSync('python3', ['-c', `
import sys,glob
from PIL import Image
fs=sorted(glob.glob(sys.argv[1]+'/*-[1-5].png')); ims=[Image.open(f).convert('RGB').resize((432,768)) for f in fs]
S=Image.new('RGB',(len(ims)*442+10,788),'#1b1f27')
for i,im in enumerate(ims): S.paste(im,(10+i*442,10))
S.save(sys.argv[1]+'/planche.jpg',quality=88)`, dir]);
  console.log('→', name);
}
execFileSync('python3', ['-c', `
import sys,glob
from PIL import Image
fs=sorted(glob.glob(sys.argv[1]+'/*/planche.jpg')); ims=[Image.open(f) for f in fs]
if ims:
  w=ims[0].width//2; h=ims[0].height//2; cols=2; rows=(len(ims)+1)//2
  S=Image.new('RGB',(cols*w,rows*h),'#1b1f27')
  for i,im in enumerate(ims): S.paste(im.resize((w,h)),((i%cols)*w,(i//cols)*h))
  S.save(sys.argv[1]+'/apercu-30.jpg',quality=85)`, OUT]);
if (issues.length) console.log('À vérifier :\n' + issues.join('\n')); else console.log('Aucun débordement.');
await browser.close(); server.close();
