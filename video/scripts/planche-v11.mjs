// Planche de la présentation v11 : une image clé par scène (1080×1920), avec les vrais écrans de l'app (main) dans un
// téléphone, le fil des quatre étapes en haut (contexte permanent, comme le titre fixe et le numéro de @flo.vma), le
// texte de l'écran, et le bloc qui compte en gros plan, sorti du téléphone vers nous (comme les pubs d'applis).
// Entrées : assets/presente-v11/ (ecrans/, cartes/, polo-hero0.png), polices du site, logo officiel.
// Sorties : renders/planches-presentev11/fNN.png et planche.png (les dix images, voix et texte sous chacune).
// usage : node scripts/planche-v11.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { chromium } from 'playwright';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'renders', 'planches-presentev11'); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const PAGES = {};
const srv = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (PAGES[u]) { r.writeHead(200, { 'Content-Type': 'text/html' }); return r.end(PAGES[u]); }
  const p = path.join(ROOT, u); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(fs.readFileSync(p));
});
await new Promise((ok) => srv.listen(0, ok));
const BASE = `http://127.0.0.1:${srv.address().port}`;

const ETAPES = ['Analyser', 'Trouver', 'Négocier', 'Revendre'];
const COL = { w: '#f4f1ec', k: '#ff8a4c', r: '#ff6b6b', g: '#3ecb7f' };
const PAL = { o: ['255,90,31,.42', '190,40,20,.34'], r: ['235,45,45,.45', '150,15,30,.42'], v: ['40,200,120,.34', '10,100,70,.4'], n: ['70,90,240,.4', '120,60,220,.3'] };
const A = '/assets/presente-v11';
const nb = (s) => s.replace(/(\d) (\d{3})/g, '$1 $2').replace(/ (€|%)/g, ' $1');

// les dix scènes : voix (texte v11 inspiré des références), texte à l'écran, écran du téléphone, gros plan
const SC = [
  { n: 1, etape: 0, pal: 'r', voix: "Tu fais de l'achat-revente ? Cette Polo à 8 990 euros te ferait perdre 2 458 euros. Je te montre comment le voir avant d'appeler, en quatre étapes.",
    titre: [[['Cette ', 'w'], ['Polo', 'k'], [' à', 'w']], [['8 990 € ?', 'k']]], hero: true },
  { n: 2, etape: 1, pal: 'o', voix: "Étape 1 : analyser. Copie le lien de l'annonce et colle-le dans utopicar.",
    titre: [[['Copie le ', 'w'], ['lien,', 'k']], [['colle-le.', 'w']]], ecran: 'f2', pop: [{ img: 'f2-lien', w: 600, x: 320, y: 1180, ry: 8 }], tel: { ry: -12 } },
  { n: 3, etape: 1, pal: 'o', voix: "L'app la compare à 268 Polo comparables : 1 533 euros au-dessus de la cote.",
    titre: [[['268 ', 'k'], ['Polo', 'w']], [['comparables', 'w']]], ecran: 'f3', pop: [{ img: 'polo-prix', w: 640, x: 280, y: 1210, ry: 8 }], tel: { ry: 12 } },
  { n: 4, etape: 1, pal: 'r', voix: "Verdict : à éviter. Pour garder 750 euros de marge, paie-la 5 750 au plus.",
    titre: [[['À éviter.', 'r']], [['5 750 € ', 'g'], ['max.', 'w']]], ecran: 'f4', pop: [{ img: 'polo-plafond', w: 560, x: 360, y: 1300, ry: 8 }], tel: { ry: -12 } },
  { n: 5, etape: 2, pal: 'o', voix: "Étape 2 : trouver. Lance une recherche : Clio 4, au moins 15 % sous la cote.",
    titre: [[['Clio 4,', 'k']], [['15 % ', 'g'], ['sous la cote', 'w']]], ecran: 'f5', pop: [{ img: 'f5-souscote', w: 560, x: 360, y: 1290, ry: 8 }], tel: { ry: 12 } },
  { n: 6, etape: 2, pal: 'n', voix: "Une annonce passe dessous, tu reçois un mail.",
    titre: [[['Tu reçois', 'w']], [['un ', 'w'], ['mail.', 'k']]], ecran: 'f6', pop: [{ img: 'f6-alerte', w: 520, x: 120, y: 1130, ry: -8 }], tel: { ry: -12, x: 70 } },
  { n: 7, etape: 3, pal: 'v', voix: "Étape 3 : négocier. Cette Clio est 2 064 euros sous la cote. Très bonne affaire.",
    titre: [[['2 064 €', 'g']], [['sous la cote', 'w']]], ecran: 'f7', pop: [{ img: 'clio-prix', w: 640, x: 280, y: 1250, ry: 8 }], tel: { ry: 12 } },
  { n: 8, etape: 3, pal: 'v', voix: "Tu ouvres à 7 400, sans dépasser 7 900, et ton premier message au vendeur est prêt.",
    titre: [[['Ouvre à ', 'w'], ['7 400 €', 'k']]], sous: [[['7 900 € ', 'r'], ['max.', 'w']]], ecran: 'f8', pop: [{ img: 'clio-offre', w: 500, x: 420, y: 1060, ry: 8 }, { img: 'clio-plafond', w: 500, x: 420, y: 1220, ry: 8 }], tel: { ry: -12, x: -70 } },
  { n: 9, etape: 4, pal: 'v', voix: "Étape 4 : revendre. Tu l'achètes, tu l'ajoutes à ton parc, et à la vente tu vois ce qu'elle t'a rapporté, frais payés.",
    titre: [[["Ce qu'elle", 'w']], [["t'a ", 'w'], ['rapporté', 'g']]], ecran: 'f9', pop: [{ img: 'parc-clio-chiffres', w: 520, x: 400, y: 960, ry: 8 }], tel: { ry: -12, x: -80 } },
  { n: 10, etape: 5, pal: 'o', voix: "Ta première analyse est offerte : le lien est en bio. utopicar. Achète juste, revends mieux.", fin: true },
];

const rail = (e) => {
  const pas = 200, x0 = 140, cy = 264;
  const fait = Math.max(0, Math.min(4, e - 1));
  const ligne = `<div style="position:absolute;left:${x0 + 100}px;top:${cy - 2}px;width:${3 * pas}px;height:4px;border-radius:2px;background:rgba(244,241,236,.14)"></div>
    <div style="position:absolute;left:${x0 + 100}px;top:${cy - 2}px;width:${Math.min(3, Math.max(0, e - 1)) * pas}px;height:4px;border-radius:2px;background:#ff5a1f"></div>`;
  return ligne + ETAPES.map((l, i) => {
    const etat = e === 5 || i + 1 < e ? 'fait' : i + 1 === e ? 'actif' : 'avenir';
    const c = etat === 'actif' ? 'background:#ff5a1f;color:#160904;box-shadow:0 0 0 8px rgba(255,90,31,.18)' : etat === 'fait' ? 'background:#3a1a0d;color:#ff8a4c;border:2px solid #ff5a1f' : 'background:#0b0a09;color:rgba(244,241,236,.45);border:2px solid rgba(244,241,236,.28)';
    const t = etat === 'fait' ? '✓' : String(i + 1);
    return `<div style="position:absolute;left:${x0 + i * pas}px;top:${cy - 30}px;width:${pas}px;text-align:center">
      <div style="margin:0 auto;width:60px;height:60px;border-radius:50%;display:grid;place-items:center;font:600 30px/1 Clash;box-sizing:border-box;${c}">${t}</div>
      <div style="margin-top:12px;font:700 27px/1 Satoshi;letter-spacing:-.01em;color:${etat === 'avenir' ? 'rgba(244,241,236,.45)' : etat === 'actif' ? '#f4f1ec' : 'rgba(244,241,236,.72)'}">${l}</div></div>`;
  }).join('') + (e === 0 ? '' : '');
};
const texte = (lignes, top, size = 100) => `<div style="position:absolute;left:140px;top:${top}px;width:800px;text-align:center;font:600 ${size}px/1.04 Clash;letter-spacing:-.03em">${lignes.map((l) => `<div>${l.map(([t, c]) => `<span style="color:${COL[c]}">${nb(t)}</span>`).join('')}</div>`).join('')}</div>`;
const fond = (pal) => { const [a, b] = PAL[pal]; return `<div style="position:absolute;inset:0;background:#0b0a09"></div>
  <div style="position:absolute;left:-500px;top:-200px;width:1700px;height:1700px;background:radial-gradient(circle,rgba(${a}) 0%,rgba(${a.replace(/,[^,]*$/, ',0')}) 58%)"></div>
  <div style="position:absolute;left:100px;top:900px;width:1700px;height:1700px;background:radial-gradient(circle,rgba(${b}) 0%,rgba(${b.replace(/,[^,]*$/, ',0')}) 58%)"></div>
  <div style="position:absolute;inset:0;background:radial-gradient(rgba(244,241,236,.07) 1.4px,transparent 1.6px) 0 0/34px 34px"></div>`; };
const telephone = (ec, t = {}) => { const W = 560, H = Math.round(W * 1688 / 780), b = 16, x = 540 - (W + 2 * b) / 2 + (t.x || 0), y = t.y ?? 620;
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${W + 2 * b}px;height:${H + 2 * b}px;border-radius:78px;background:linear-gradient(145deg,#2b2522,#110e0d 40%,#1d1816);
    box-shadow:0 0 0 2px rgba(255,255,255,.06) inset,0 70px 140px -20px rgba(0,0,0,.75);transform:perspective(2400px) rotateY(${t.ry ?? -12}deg) rotateX(4deg);transform-origin:50% 40%">
    <div style="position:absolute;left:${b}px;top:${b}px;width:${W}px;height:${H}px;border-radius:62px;overflow:hidden;background:#000"><img src="${A}/ecrans/${ec}.png" style="width:100%;display:block"></div></div>`; };
const pop = (p) => { const crop = p.crop ? `height:${Math.round((p.crop[1] - p.crop[0]) * p.w / 1194)}px;` : '';
  const img = p.crop ? `<img src="${A}/cartes/${p.img}.png" style="width:100%;display:block;margin-top:-${Math.round(p.crop[0] * p.w / 1194)}px">` : `<img src="${A}/cartes/${p.img}.png" style="width:100%;display:block">`;
  return `<div style="position:absolute;left:${p.x}px;top:${p.y}px;width:${p.w}px;${crop}border-radius:30px;overflow:hidden;box-shadow:0 50px 100px -10px rgba(0,0,0,.8),0 0 0 2px rgba(255,255,255,.07);transform:perspective(2400px) rotateY(${p.ry}deg) translateZ(60px)">${img}</div>`; };

function page(s) {
  let h = fond(s.pal) + `<div style="position:absolute;inset:0">${rail(s.etape)}</div>`;
  if (s.hero) {
    h += texte(s.titre, 380, 104);
    h += `<img src="${A}/polo-hero0.png" style="position:absolute;left:0px;top:650px;width:1080px">`;
    h += `<div style="position:absolute;left:140px;top:1230px;width:800px;text-align:center;font:600 190px/1 Clash;letter-spacing:-.05em;color:#ff6b6b">${nb('−2 458 €')}</div>
          <div style="position:absolute;left:140px;top:1428px;width:800px;text-align:center;font:500 42px/1 Satoshi;color:rgba(244,241,236,.75)">à la revente</div>`;
  } else if (s.fin) {
    const logo = fs.readFileSync(path.join(ROOT, 'assets/brand/official/utopicar-logo-horizontal-fond-sombre.svg'), 'utf8').replace(/<\?xml[^>]*>/, '');
    h += `<div style="position:absolute;left:150px;top:640px;width:780px">${logo.replace('<svg', '<svg style="width:780px;height:auto;display:block"')}</div>`;
    h += texte([[['Achète juste.', 'w']]], 940, 124);
    h += `<div style="position:absolute;left:140px;top:1080px;width:800px;text-align:center;font:italic 400 140px/1 Instrument;color:#ff8a4c">Revends mieux.</div>`;
    h += `<div style="position:absolute;left:190px;top:1300px;width:700px;height:96px;border-radius:48px;background:#f4f1ec;color:#1c1612;font:700 38px/96px Satoshi;text-align:center">Ta 1re analyse offerte · lien en bio</div>`;
  } else {
    h += telephone(s.ecran, s.tel); h += (s.pop || []).map(pop).join('');
    h += texte(s.titre, 380, s.sous ? 92 : 100);
    if (s.sous) h += texte(s.sous, 480, 92);
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:Clash;font-weight:600;src:url(/assets/fonts-site/ClashDisplay-600.woff2) format('woff2')}
  @font-face{font-family:Satoshi;font-weight:500;src:url(/assets/fonts-site/Satoshi-500.woff2) format('woff2')}
  @font-face{font-family:Satoshi;font-weight:700;src:url(/assets/fonts-site/Satoshi-700.woff2) format('woff2')}
  @font-face{font-family:Instrument;font-style:italic;src:url(/assets/fonts-site/InstrumentSerif-Italic.woff2) format('woff2')}
  html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#0b0a09}</style></head><body>${h}</body></html>`;
}

const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
for (const s of SC) {
  PAGES[`/f${s.n}.html`] = page(s);
  await p.goto(`${BASE}/f${s.n}.html`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(OUT, `f${String(s.n).padStart(2, '0')}.png`) });
}
// la planche : les dix images, l'étape, la voix et le texte de l'écran sous chacune
const libelle = (s) => s.etape === 0 ? 'Accroche' : s.etape === 5 ? 'Fin' : `${s.etape} · ${ETAPES[s.etape - 1]}`;
const ecrit = (s) => s.hero ? 'Cette Polo à 8 990 € ? · −2 458 € à la revente' : s.fin ? 'utopicar · Achète juste. Revends mieux. · Ta 1re analyse offerte · lien en bio' : [...s.titre, ...(s.sous || [])].map((l) => l.map(([t]) => t).join('')).join(' ');
PAGES['/planche.html'] = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Clash;font-weight:600;src:url(/assets/fonts-site/ClashDisplay-600.woff2) format('woff2')}
@font-face{font-family:Satoshi;font-weight:500;src:url(/assets/fonts-site/Satoshi-500.woff2) format('woff2')}
@font-face{font-family:Satoshi;font-weight:700;src:url(/assets/fonts-site/Satoshi-700.woff2) format('woff2')}
body{margin:0;background:#f2efea;font:500 15px/1.4 Satoshi;color:#1c1612;width:1880px}
h1{font:600 34px/1.1 Clash;margin:28px 28px 6px}p.s{margin:0 28px 18px;color:#5b524c;font-size:17px}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:26px 22px;padding:0 28px 30px}
.c img{width:100%;border-radius:14px;display:block;box-shadow:0 6px 18px rgba(0,0,0,.18)}
.e{margin:10px 0 4px;font:700 16px/1 Satoshi;color:#c2410c;text-transform:uppercase;letter-spacing:.06em}
.v{margin:0 0 6px;font-size:15.5px}.t{margin:0;color:#5b524c;font-size:14px}</style></head><body>
<h1>Présentation utopicar v11 · planche du parcours</h1>
<p class="s">Vrais écrans de l'app (version main du 17 oct. 2026) sur la base démo · annonces d'essai, chiffres calculés par l'app avec la cote réelle relue le 17 oct. · une image clé par scène, la voix de Simon et le texte de l'écran dessous.</p>
<div class="g">${SC.map((s) => `<div class="c"><img src="/renders/planches-presentev11/f${String(s.n).padStart(2, '0')}.png"><p class="e">${s.n}. ${libelle(s)}</p><p class="v">« ${nb(s.voix)} »</p><p class="t">Écran : ${nb(ecrit(s))}</p></div>`).join('')}</div></body></html>`;
await p.setViewportSize({ width: 1880, height: 1000 });
await p.goto(`${BASE}/planche.html`, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
await p.screenshot({ path: path.join(OUT, 'planche.png'), fullPage: true });
await b.close(); srv.close();
console.log('→', path.relative(ROOT, OUT));
