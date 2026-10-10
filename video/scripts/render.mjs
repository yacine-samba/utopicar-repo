// Rendu du film : Chromium peint window.seek(t), FFmpeg encode.
//   node scripts/render.mjs --at 3.2,3.25        images fixes → renders/stills/ (renders/stills-<CUT>/ avec CUT, idem range, contact, strip, phone)
//   node scripts/render.mjs --range 3,5          une image par frame sur l'intervalle → renders/range/
//   node scripts/render.mjs --sheet              contact sheet 2 img/s + une par beat → renders/contact.png, renders/beats.png
//   node scripts/render.mjs --strip 8.3          12 frames autour de t → renders/strip.png
//   node scripts/render.mjs --phone              frames clés réduites à 360 px de large → renders/phone.png
//   node scripts/render.mjs --draft              animatic 540x960 → renders/draft.mp4
//   node scripts/render.mjs --all                film final 1080x1920 → renders/9x16.mp4 (+ audio/mix.wav s'il existe)
//   CUT=launch node scripts/render.mjs --all     version lancement → film-launch/, timeline-launch.json, renders/9x16-launch.mp4
//   CUT=x FMT=square VLANG=en HOOK=B node scripts/render.mjs --all → renders/1x1-x-B-en.mp4 (audio/mix-x-en.wav si présent)
//   CUT=mo4 MB=8 node scripts/render.mjs --all   flou de bougé : jusqu'à 8 sous-images par image (window.shutter, window.samples)
//   CUT=mo4 MB=8 PARTS=3 PART=0|1|2 node scripts/render.mjs --all, puis CUT=mo4 PARTS=3 node scripts/render.mjs --assemble : rendu en parallèle
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn, execFileSync } from 'child_process';
import { ROOT } from './ui.mjs';

const CUT = process.env.CUT ? '-' + process.env.CUT : '';   // CUT=launch → timeline-launch.json, film-launch/, 9x16-launch.mp4
// Déclinaisons (films qui les gèrent) : FMT=vertical|square|desktop, LANG=fr|en…, HOOK=A|B.
// Le film reçoit ?fmt=&lang=&hook= et doit recomposer sa mise en page (pas un recadrage).
const FMT = process.env.FMT || '', LANG = process.env.LANG_V || process.env.VLANG || '', HOOK = process.env.HOOK || '';
const THEME = process.env.THEME || '';   // films qui le gèrent (master60) : THEME=blanc → ?theme=blanc, fichiers suffixés -blanc
const SIZE = { vertical: [1080, 1920], square: [1080, 1080], desktop: [1920, 1080] }[FMT || 'vertical'];
const TAG = { vertical: '9x16', square: '1x1', desktop: '16x9' }[FMT || 'vertical'];
const VAR = (HOOK ? '-' + HOOK : '') + (LANG ? '-' + LANG : '') + (THEME ? '-' + THEME : '');
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, `timeline${CUT}.json`), 'utf8'));
// films dont la durée dépend de l'ouverture (timeline.hooks[HOOK].dur, ex. MO3) ; poster propre à l'ouverture
if (TL.hooks && HOOK && TL.hooks[HOOK]) { TL.dur = TL.hooks[HOOK].dur; if (TL.hooks[HOOK].poster != null) TL.poster = TL.hooks[HOOK].poster; }
const OUT = path.join(ROOT, 'renders');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i < 0 ? null : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const scale = opt('--draft') ? 0.5 : 1;
const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: SIZE[0], height: SIZE[1] }, deviceScaleFactor: scale });
page.on('pageerror', e => console.error('PAGEERR', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
await page.goto(`${base}/film${CUT}/index.html?render=1${FMT ? '&fmt=' + FMT : ''}${LANG ? '&lang=' + LANG : ''}${HOOK ? '&hook=' + HOOK : ''}${THEME ? '&theme=' + THEME : ''}`);
await page.waitForFunction(() => window.filmReady === true, null, { timeout: 60000 });

const cdp = await page.context().newCDPSession(page);
async function frame(t, type = 'png') {
  await page.evaluate(t => window.seek(t), t);
  // PNG sans perte, compression rapide : 2 à 3 fois plus rapide que page.screenshot pour le rendu final
  if (type === 'fast') return Buffer.from((await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true })).data, 'base64');
  return page.screenshot({ type, ...(type === 'jpeg' ? { quality: 92 } : {}) });
}
const fmtT = t => t.toFixed(3).padStart(6, '0');

async function grid(times, file, cols, cellW, label = true) {
  const dir = path.join(OUT, `_cells${CUT}`); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < times.length; i++) fs.writeFileSync(path.join(dir, `c${String(i).padStart(3, '0')}.png`), await frame(times[i]));
  const py = `
import sys,glob
from PIL import Image, ImageDraw, ImageFont
fs=sorted(glob.glob(sys.argv[1]+'/c*.png')); times=[float(x) for x in sys.argv[4].split(',')]
cols=int(sys.argv[3]); cw=int(sys.argv[5]); ch=int(cw*float(sys.argv[7])); pad=8; lab=26 if sys.argv[6]=='1' else 0
rows=(len(fs)+cols-1)//cols
S=Image.new('RGB',(cols*(cw+pad)+pad, rows*(ch+pad+lab)+pad),'#1b1f27')
d=ImageDraw.Draw(S)
try: F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',18)
except: F=None
for i,f in enumerate(fs):
  im=Image.open(f).convert('RGB').resize((cw,ch),Image.LANCZOS); x=pad+(i%cols)*(cw+pad); y=pad+(i//cols)*(ch+pad+lab)
  S.paste(im,(x,y+lab))
  if lab: d.text((x+2,y+2),'%.2fs'%times[i],fill='#FFC928',font=F)
S.save(sys.argv[2])
`;
  execFileSync('python3', ['-c', py, dir, file, String(cols), times.join(','), String(cellW), label ? '1' : '0', String(SIZE[1] / SIZE[0])]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('→', path.relative(ROOT, file));
}

if (opt('--at')) {
  const dir = path.join(OUT, `stills${CUT}`); fs.mkdirSync(dir, { recursive: true });
  for (const t of String(opt('--at')).split(',').map(Number)) { fs.writeFileSync(path.join(dir, `t${fmtT(t)}.png`), await frame(t)); console.log(`→ stills${CUT}/t` + fmtT(t) + '.png'); }
}
if (opt('--range')) {
  const [a, b] = String(opt('--range')).split(',').map(Number); const dir = path.join(OUT, `range${CUT}`); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  for (let f = Math.round(a * TL.fps); f <= Math.round(b * TL.fps); f++) fs.writeFileSync(path.join(dir, `f${String(f).padStart(4, '0')}.png`), await frame(f / TL.fps));
  console.log(`→ range${CUT}/`);
}
if (opt('--sheet')) {
  const two = []; for (let t = 0; t < TL.dur; t += 0.5) two.push(+(t + 0.25).toFixed(3));
  await grid(two, path.join(OUT, `contact${CUT}.png`), 10, 200);
  let beats = []; try { beats = JSON.parse(fs.readFileSync(path.join(ROOT, `beats${CUT}.json`), 'utf8')).beats; } catch (e) { for (let t = 0; t < TL.dur; t += 60 / TL.bpm) beats.push(t); }
  await grid(beats.map(b => +(b + 0.2).toFixed(3)).filter(b => b < TL.dur), path.join(OUT, `beats${CUT}.png`), 10, 200);
}
if (opt('--strip')) {
  const c = Number(opt('--strip')); const ts = []; for (let i = -6; i < 6; i++) ts.push(+(c + i / TL.fps).toFixed(4));
  await grid(ts, path.join(OUT, `strip${CUT}.png`), 6, 260);
}
if (opt('--phone')) {
  const ts = String(opt('--phone') === true ? '0.5,1.6,3.6,4.8,6.5,8.2,9.4,10.6,11.5,14' : opt('--phone')).split(',').map(Number);
  await grid(ts, path.join(OUT, `phone${CUT}.png`), 5, 360);
}
// Rendu en morceaux parallèles : PARTS=3 PART=0..2 … --all écrit renders/_parts/<film>-p<i>.mp4 (vidéo seule),
// puis --assemble les met bout à bout (sans réencodage) avec le son, et écrit le poster.
const PARTS = Number(process.env.PARTS) || 1, PART = Number(process.env.PART) || 0;
const finalName = `${TAG}${CUT}${VAR}.mp4`;
const partFile = (i) => path.join(OUT, '_parts', `${finalName.replace('.mp4', '')}-p${i}.mp4`);
const mixFor = () => {
  // mix le plus précis disponible : ouverture + langue, langue, ouverture, puis mix commun
  const cands = [VAR, LANG ? '-' + LANG : null, HOOK ? '-' + HOOK : null, ''].filter(v => v !== null).map(v => path.join(ROOT, `audio/mix${CUT}${v}.wav`));
  return cands.find(f => fs.existsSync(f)) || cands[cands.length - 1];
};
if (opt('--draft') || opt('--all')) {
  const final = !!opt('--all'), parted = final && PARTS > 1;
  const file = parted ? partFile(PART) : path.join(OUT, final ? finalName : `draft${CUT}${VAR}-${TAG}.mp4`);
  if (parted) fs.mkdirSync(path.dirname(file), { recursive: true });
  const audio = mixFor();
  const withAudio = !parted && fs.existsSync(audio) && !opt('--mute');
  const W = final ? SIZE[0] : SIZE[0] / 2, H = final ? SIZE[1] : SIZE[1] / 2;
  // Flou de bougé (MB=8) : le film déclare window.shutter(t) (0 = image nette, 1 = obturateur ouvert sur toute l'image)
  // et window.samples(t) (sous-images distinctes, diviseur de MB). Chaque image devient MB sous-images réparties sur
  // l'ouverture, moyennées par ffmpeg (tmix), puis une sur MB est gardée. Une image nette est capturée une fois.
  const N = final && Number(process.env.MB) > 1 && await page.evaluate(() => typeof window.shutter === 'function') ? Number(process.env.MB) : 1;
  const hasK = N > 1 && await page.evaluate(() => typeof window.samples === 'function');
  const mb = N > 1 ? `tmix=frames=${N},select=eq(mod(n\\,${N})\\,${N - 1}),setpts=PTS-STARTPTS,` : '';
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(TL.fps * N), '-i', '-',
    ...(withAudio ? ['-i', audio] : []),
    '-vf', `${mb}scale=${W}:${H}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', final ? 'slow' : 'veryfast', '-crf', final ? '16' : '22',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', '-r', String(TL.fps),
    ...(withAudio ? ['-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest'] : []), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(TL.dur * TL.fps); const t0 = Date.now(); let shots = 0;
  const f0 = parted ? Math.floor(PART * n / PARTS) : 0, f1 = parted ? Math.floor((PART + 1) * n / PARTS) : n;
  const send = async (buf) => { if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); };
  for (let f = f0; f < f1; f++) {
    const t = f / TL.fps;
    const open = N > 1 ? await page.evaluate(t => window.shutter(t), t) : 0;
    if (open > 0.001) {
      const K = hasK ? await page.evaluate(t => window.samples(t), t) : N;
      for (let j = 0; j < K; j++) {
        const buf = await frame(t + ((j + 0.5) / K - 0.5) * open / TL.fps, 'fast'); shots++;
        for (let r = 0; r < N / K; r++) await send(buf);
      }
    } else {
      const buf = await frame(t, final ? 'fast' : 'jpeg'); shots++;
      for (let j = 0; j < N; j++) await send(buf);
    }
    if ((f - f0) % 60 === 0) process.stdout.write(`  ${parted ? 'morceau ' + PART + ' · ' : ''}frame ${f}/${n} (${((Date.now() - t0) / 1000).toFixed(0)} s, ${shots} captures)\n`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('→', path.relative(ROOT, file), withAudio ? '(avec audio)' : '(muet)');
  if (final && !parted) fs.writeFileSync(path.join(OUT, `poster${CUT}${VAR}${FMT ? '-' + TAG : ''}.png`), await frame(TL.poster ?? 14.2));
}
if (opt('--assemble')) {
  const parts = []; for (let i = 0; i < PARTS; i++) { if (!fs.existsSync(partFile(i))) throw new Error('morceau manquant : ' + partFile(i)); parts.push(partFile(i)); }
  const list = path.join(OUT, '_parts', 'liste.txt'); fs.writeFileSync(list, parts.map(p => `file '${p}'`).join('\n') + '\n');
  const audio = mixFor(), file = path.join(OUT, finalName);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, ...(fs.existsSync(audio) ? ['-i', audio] : []),
    '-c:v', 'copy', ...(fs.existsSync(audio) ? ['-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest'] : []), '-movflags', '+faststart', file]);
  console.log('→', path.relative(ROOT, file), fs.existsSync(audio) ? '(avec audio)' : '(muet)');
  fs.writeFileSync(path.join(OUT, `poster${CUT}${VAR}${FMT ? '-' + TAG : ''}.png`), await frame(TL.poster ?? 14.2));
}
await browser.close(); server.close();
