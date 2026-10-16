// Détecteur de textes superposés : peint le film toutes les 0,1 s et relève, image par image,
//  · un sous-titre de la voix posé sur du détail net (texte d'interface) : contrôle sur l'image rendue sans les
//    sous-titres, dans la boîte de chaque lettre (scripts/chevauchements.py) ;
//  · deux textes d'interface lisibles de deux objets différents qui se recouvrent sans que l'un cache l'autre ;
//  · un texte lisible qui sort du cadre ou entre dans les zones réservées (haut 220, bas 440, gauche 60, droite 140).
// Un texte compte comme lisible s'il est affiché, opaque à plus de 25 % et flou de moins de 5 px (calques compris).
//   CUT=presentev7 node scripts/chevauchements.mjs [début] [fin] [pas]  → renders/chevauchements-<CUT>.json
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { ROOT } from './ui.mjs';

const CUT = process.env.CUT ? '-' + process.env.CUT : '';
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, `timeline${CUT}.json`), 'utf8'));
const [a = 0, b = TL.dur, pas = 0.1] = process.argv.slice(2).map(Number);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-lcd-text', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: TL.size[0], height: TL.size[1] } });
page.on('pageerror', (e) => console.error('PAGEERR', e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/film${CUT}/index.html?render=1`);
await page.waitForFunction(() => window.filmReady === true, null, { timeout: 60000 });

const out = [], cadres = [];
const DIR = path.join(ROOT, 'renders', `_sous${CUT}`); fs.rmSync(DIR, { recursive: true, force: true }); fs.mkdirSync(DIR, { recursive: true });
for (let t = a; t < b - 1e-6; t += pas) {
  const tt = Math.round(t * 1000) / 1000;
  const r = await page.evaluate((t) => {
    window.seek(t);
    const ST = document.getElementById('stage');
    const lay = [...ST.children];                       // FOND, scènes, sous-titres, fin…
    const TXT = lay.find((e) => e.style.zIndex === '20');
    // opacité et flou cumulés jusqu'à la scène ; null si caché
    const etat = (el) => {
      let o = 1, bl = 0;
      for (let e = el; e && e !== ST; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden') return null;
        o *= parseFloat(cs.opacity);
        const f = cs.filter; if (f && f !== 'none') { const m = f.match(/blur\(([\d.]+)px\)/); if (m) bl += parseFloat(m[1]); const m2 = f.match(/opacity\(([\d.]+)\)/); if (m2) o *= parseFloat(m2[1]); }
      }
      return { o, bl };
    };
    const lisible = (s) => s && s.o > 0.25 && s.bl < 5;
    // propriétaire : l'objet posé dans la caméra (ou directement dans la scène)
    const proprio = (el) => { let e = el; while (e.parentElement && e.parentElement.parentElement && e.parentElement.parentElement !== ST && !(e.parentElement.style.transformStyle === 'preserve-3d' && e.parentElement.classList.contains('lay'))) e = e.parentElement; return e; };
    const textes = [];
    const walker = document.createTreeWalker(ST, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement; if (el.closest('svg')) continue;
      const s = etat(el); if (!lisible(s)) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      const rs = [...rg.getClientRects()].filter((q) => q.width > 2 && q.height > 2);
      if (!rs.length) continue;
      const cap = TXT && TXT.contains(el);
      textes.push({ el, cap, txt: n.textContent.trim().slice(0, 24), rs, own: cap ? null : proprio(el), s });
    }
    const inter = (p, q) => { const w = Math.min(p.right, q.right) - Math.max(p.left, q.left), h = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top); return w > 0 && h > 0 ? { w, h, x: (Math.max(p.left, q.left) + Math.min(p.right, q.right)) / 2, y: (Math.max(p.top, q.top) + Math.min(p.bottom, q.bottom)) / 2 } : null; };
    const pb = [];
    const caps = textes.filter((x) => x.cap), ui = textes.filter((x) => !x.cap);
    // sous-titres : on renvoie la boîte de chaque lettre visible ; le contrôle se fait sur l'image sans les sous-titres
    // (ce qui est dessous : voile, flou et occultation compris) par scripts/chevauchements.py
    const lettresVues = caps.flatMap((c) => c.rs.map((rc) => [Math.round(rc.left), Math.round(rc.top), Math.round(rc.right), Math.round(rc.bottom)]));
    // interface / interface, objets différents, sans que l'un cache l'autre
    for (let i = 0; i < ui.length; i++) for (let j = i + 1; j < ui.length; j++) {
      const A = ui[i], B = ui[j]; if (A.own === B.own || A.own.contains(B.el) || B.own.contains(A.el)) continue;
      for (const ra of A.rs) for (const rb of B.rs) {
        const k = inter(ra, rb); if (!k || k.w * k.h < 0.15 * Math.min(ra.width * ra.height, rb.width * rb.height)) continue;
        const pile = document.elementsFromPoint(k.x, k.y).filter((e) => !(TXT && TXT.contains(e)) && e.style.zIndex !== '15' && e !== ST);
        const top = pile.find((e) => A.own.contains(e) || B.own.contains(e) || (e.parentElement && e.parentElement !== ST && !e.classList.contains('lay')));
        if (top && (A.own.contains(top) || B.own.contains(top))) continue;      // l'un des deux objets cache l'autre
        pb.push({ type: 'interface/interface', a: A.txt, b: B.txt, x: Math.round(k.x), y: Math.round(k.y) });
      }
    }
    // zones réservées et bords du cadre (textes nets seulement)
    for (const x of textes) for (const r of x.rs) {
      if (r.right < 0 || r.left > 1080 || r.bottom < 0 || r.top > 1920) continue;
      const hors = r.left < 60 - 2 || r.right > 940 + 2 || r.top < 220 - 2 || r.bottom > 1480 + 2;
      if (hors && x.s.o > 0.6) pb.push({ type: 'zone', a: x.txt, cap: x.cap, l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom) });
    }
    return { pb, lettresVues };
  }, tt);
  // image sans les sous-titres, recadrée sur la bande où ils sont
  if (r.lettresVues.length) {
    const y0 = Math.max(0, Math.min(...r.lettresVues.map((q) => q[1])) - 20), y1 = Math.min(TL.size[1], Math.max(...r.lettresVues.map((q) => q[3])) + 20);
    await page.evaluate(() => { document.querySelector('#stage > div[style*="z-index: 20"]').style.visibility = 'hidden'; });
    await page.screenshot({ path: path.join(DIR, `f${tt.toFixed(3)}.png`), clip: { x: 0, y: y0, width: TL.size[0], height: y1 - y0 } });
    await page.evaluate(() => { document.querySelector('#stage > div[style*="z-index: 20"]').style.visibility = ''; });
    cadres.push({ t: tt, y0, lettres: r.lettresVues });
  }
  if (r.pb.length) out.push({ t: tt, pb: r.pb });
  if (Math.round(tt * 10) % 50 === 0) process.stdout.write(`  ${tt.toFixed(1)} s\n`);
}
await browser.close(); server.close();
const file = path.join(ROOT, 'renders', `chevauchements${CUT}.json`);
fs.writeFileSync(file, JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(DIR, 'cadres.json'), JSON.stringify(cadres));
const resume = {}; for (const f of out) for (const p of f.pb) { const k = p.type; resume[k] = (resume[k] || 0) + 1; }
console.log('→', path.relative(ROOT, file), out.length, 'images à problème', JSON.stringify(resume));
