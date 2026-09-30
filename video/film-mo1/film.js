// UTOPICAR — la vidéo validée refaite dans la grammaire de la référence 1 : fond marine profond, une phrase courte au
// centre avec un mot d'accent, gros mots isolés par chapitre (lettres qui se floutent et se posent), forme florale
// organique derrière les gros mots, goutte orange lumineuse qui voyage et devient le logo, transition « fleur » qui
// envahit l'écran, verrouillage logo + mot-symbole à la fin. Accent de marque : orange UTOPICAR (le vert de la référence
// est remplacé). Vraie interface en preuve sous les phrases. Repères = mots de Simon (timeline-mo1.json).
// ?hook=voix | sansvoix. Zone sûre TikTok : x 60 → 940, y 220 → 1480. Contrat : window.seek(t) peint la frame t.
import { beats, segs } from '../film-mo/beats.js';
import { loadUI, makeUI } from '../film-mo/ui.js';
import { appIcon } from '../film-mo/icon.js';
const { spring, clamp, lerp, noise } = Motion;
const { el, show, smooth, bump, place, text, marker } = Kit;
const TL = await (await fetch('../timeline-mo1.json')).json();
const M = TL.marks;
const VOICE = (new URLSearchParams(location.search).get('hook') || 'voix') !== 'sansvoix';
const LOGO = await appIcon();
const stage = document.getElementById('stage');
const CX = 540, TY = 700, BY = 860, UY = 1170;
const inWin = (t, a, b) => t >= a && t < b;
await loadUI();

/* ================= fond : halos marine qui respirent ================= */
const bgL = el('div', 'layer', stage);
const halos = [[260, 420, 700, '#0E2E48'], [820, 1300, 800, '#0B2740'], [540, 1800, 900, '#0A2238']].map(([x, y, s, c]) => {
  const h = el('div', 'abs', bgL); Object.assign(h.style, { width: s + 'px', height: s + 'px', borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, transparent 70%)` }); h._p = [x, y]; return h;
});

/* ================= forme florale (8 pétales) ================= */
const FLOWER = (fill) => `<svg viewBox="-100 -100 200 200"><path fill="${fill}" d="${(() => { let d = ''; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, b = (i + 0.5) / 8 * Math.PI * 2, c2 = (i + 1) / 8 * Math.PI * 2; const p = (r, t) => `${(Math.cos(t) * r).toFixed(1)} ${(Math.sin(t) * r).toFixed(1)}`; d += (i ? ' ' : 'M ' + p(58, a)) + ` Q ${p(118, a + 0.18)} ${p(96, b)} Q ${p(118, c2 - 0.18)} ${p(58, c2)}`; } return d + ' Z'; })()}"/></svg>`;
const flowerL = el('div', 'layer', stage);
const blob = el('div', 'flower', flowerL); blob.innerHTML = FLOWER('#12314A');

/* ================= interface + textes ================= */
const uiL = el('div', 'layer', stage);
const txtL = el('div', 'layer', stage);
const shadow = (c) => { c.style.boxShadow = '0 30px 80px -20px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.06)'; };
const BEATS = beats(M, VOICE).map(b => {
  if (b.kind === 'phrase') { b.box = text(txtL, segs(b.text).map(([t, c]) => [t, c]), 'ph'); }
  else if (b.kind === 'big') { b.box = text(txtL, [[b.text, '']], 'big'); }
  else if (b.kind === 'red' || b.kind === 'green') {
    const [n, s] = b.text.split('|'); b.box = text(txtL, [[n, b.kind === 'red' ? 'rd' : 'gr']], 'big'); b.sub = text(txtL, [[s, '']], 'sub');
  }
  if (b.ui) { b.g = makeUI(uiL, b.ui, shadow); }
  return b;
});
const fitW = (box, max = 760) => { const tf = box.style.transform; box.style.transform = 'none'; const r = [...box.querySelectorAll('.ch')].map(c => c.getBoundingClientRect()).filter(r => r.width); const w = r.length ? Math.max(...r.map(x => x.right)) - Math.min(...r.map(x => x.left)) : 0; if (w > max) box.style.fontSize = (parseFloat(getComputedStyle(box).fontSize) * max / w).toFixed(1) + 'px'; box.style.transform = tf; };
const at = (box, y, s = 1) => { box.style.transform = `translate(0px,${(y - box.offsetHeight / 2).toFixed(1)}px) scale(${s.toFixed(4)})`; };
// lettres qui arrivent floues et se posent, puis repartent vers le haut en se floutant (grammaire de la référence)
function letters(box, t, a, b, rate = 0.018, rise = 30, blur = 12) {
  const n = box.chars.length;
  box.chars.forEach((c, i) => {
    const p = spring(t - (a + i * rate), 'snappy'), q = spring(t - (b - 0.24 + i * rate * 0.4), 'snappy');
    c.style.opacity = clamp(p * 1.6 - q * 1.6, 0, 1).toFixed(3);
    c.style.transform = `translateY(${((1 - p) * rise - q * rise).toFixed(1)}px)`;
    const bl = (1 - clamp(p, 0, 1)) * blur + q * blur; c.style.filter = bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : '';
  });
}

/* ================= goutte orange et sa traîne ================= */
const dropL = el('div', 'layer', stage);
const ghosts = [0.06, 0.12, 0.18].map((d, i) => { const g = el('div', 'ghost', dropL); g._d = d; g.style.width = g.style.height = (30 - i * 8) + 'px'; return g; });
const drop = el('div', 'drop', dropL);
// positions de la goutte : un point par battement, autour du texte
const DROP = BEATS.map((b, i) => [b.a, [820, 180, 860, 170, 800, 220][i % 6], [600, 560, 980, 1000, 620, 540][i % 6]]);
function dropAt(t) {
  let x = DROP[0][1], y = DROP[0][2];
  for (let i = 1; i < DROP.length; i++) { const s = spring(t - DROP[i][0], { f: 1.4, z: 0.9 }); x += (DROP[i][1] - DROP[i - 1][1]) * s; y += (DROP[i][2] - DROP[i - 1][2]) * s; }
  return [x + noise(4, t * 0.8) * 14, y + noise(5, t * 0.7) * 14];
}

/* ================= kicker, transitions fleur, fin ================= */
const kick = el('div', 'kick', stage); kick.innerHTML = `<b>UTOPICAR</b><span>Achat-revente</span><span class="pl">C'est parti <i></i></span>`;
const burst = el('div', 'flower', stage); burst.innerHTML = FLOWER('#FF5A1F');
const lock = el('div', 'lock', stage); lock.innerHTML = `${LOGO()}<span class="wm">UTOPICAR</span>`;
const lock2 = el('div', 'lock', stage); lock2.innerHTML = `${LOGO()}<span class="wm">UTOPICAR</span>`;
const cta = el('div', 'cta', stage); cta.innerHTML = `Commente <span class="g">GARAGE</span>`;
const cta2 = text(stage, [["pour recevoir l'accès.", '']], 'sub');
const demo = el('div', 'demo', stage); demo.textContent = 'Données de démonstration';
const BURSTS = [M.voici, M.logo];

window.seek = function (t) {
  // fond vivant
  halos.forEach((h, i) => place(h, h._p[0] + noise(i + 1, t * 0.12) * 80, h._p[1] + noise(i + 7, t * 0.1) * 80, 1 + noise(i + 3, t * 0.2) * 0.08, 0, 1));
  // kicker (ouverture)
  const kq = spring(t - (M.annonce - 0.3), 'default'), ki = spring(t + 2, 'default');
  show(kick, t < M.annonce + 0.4); place(kick, CX, 330 - kq * 60, 1, 0, clamp(ki - kq * 1.4, 0, 1));
  // battements
  let bigOn = null;
  for (const b of BEATS) {
    const on = inWin(t, b.a - 0.05, b.b); if (b.box) show(b.box, on); if (b.sub) show(b.sub, on); if (b.g) show(b.g, on && t >= b.a - 0.05);
    if (!on) continue;
    const hold = b.a === 0 ? -3 : b.a;               // image 0 déjà composée
    if (b.kind === 'phrase') { letters(b.box, t, hold, b.b); at(b.box, b.g ? TY : BY, 1 + smooth(b.a, b.b, t) * 0.04); }
    else if (b.kind === 'big') { letters(b.box, t, hold, b.b, 0.035, 60, 22); at(b.box, BY, 1.06 - 0.06 * spring(t - b.a, 'heavy') + smooth(b.a, b.b, t) * 0.05); bigOn = b; }
    else if (b.kind === 'red' || b.kind === 'green') {
      letters(b.box, t, hold, b.b, 0.035, 60, 22); at(b.box, 780, 1 + smooth(b.a, b.b, t) * 0.05);
      letters(b.sub, t, b.a + 0.3, b.b, 0.02); at(b.sub, 960); bigOn = b;
    }
    if (b.g) {
      const p = spring(t - b.a, 'default'), q = spring(t - (b.b - 0.25), 'default');
      const bl = (1 - clamp(p, 0, 1)) * 14 + q * 14;
      place(b.g, CX + noise(9, t * 0.3) * 6, UY + (b.g._dy || 0) + (1 - p) * 120 - q * 90, (0.9 + 0.1 * p) * (1 + smooth(b.a, b.b, t) * 0.03), 0, clamp(p * 1.8 - q * 1.8, 0, 1), bl);
      b.g.hls.forEach((h, i) => { marker(t, h, b.a + 0.45 + i * 0.15, null); h.style.opacity = '0.85'; });
    }
  }
  // forme florale derrière les gros mots
  const bo = bigOn ? spring(t - bigOn.a, 'default') - spring(t - (bigOn.b - 0.2), 'snappy') : 0;
  show(blob, bo > 0.01); if (bo > 0.01) place(blob, CX, BY, (0.4 + 0.8 * clamp(bo, 0, 1)) * (1 + noise(2, t * 0.5) * 0.04), t * 18, clamp(bo, 0, 1) * 0.9, 2);
  // goutte orange (cachée pendant les transitions et la fin)
  const dOn = t < M.logo - 0.3 && !inWin(t, M.voici - 0.35, M.poche);
  const oOn = inWin(t, M.voici + 0.3, M.poche - 0.15);             // plan logo : la goutte tourne autour du logo
  show(dropL, dOn || oOn);
  if (oOn) {
    const orb = u => { const k = spring(u - (M.voici + 0.3), 'default'), a = (u - M.voici) * 2.4 - 1.2; return [CX + Math.cos(a) * 400 * k, BY + Math.sin(a) * 180 * k]; };
    const [x, y] = orb(t); place(drop, x, y, 1.2, 0, 1);
    ghosts.forEach(g => { const [gx, gy] = orb(t - g._d * 1.5); place(g, gx, gy, 1, 0, 0.35); });
  } else if (dOn) {
    const [x, y] = dropAt(t); place(drop, x, y, 1 + bump(t, DROP.find(d => d[0] <= t && t < d[0] + 0.3)?.[0] ?? -9, 0.1) * 0.4, 0, 1);
    ghosts.forEach(g => { const [gx, gy] = dropAt(t - g._d); place(g, gx, gy, 1, 0, 0.35); });
  }
  // transitions « fleur » : la fleur orange envahit l'écran puis s'efface en grossissant encore
  let bs = 0, bo2 = 0;
  for (const T of BURSTS) { if (inWin(t, T - 0.4, T + 0.35)) { const g = clamp((t - (T - 0.4)) / 0.4, 0, 1); bs = g < 1 ? g * g * 5.5 : 5.5 + (t - T) * 8; bo2 = g < 1 ? 1 : 1 - clamp((t - T) / 0.35, 0, 1); } }
  show(burst, bo2 > 0.01); if (bo2 > 0.01) place(burst, CX, BY, bs, t * 40, bo2);
  // logo (après la première fleur)
  const lb = BEATS.find(b => b.kind === 'lockup');
  const lOn = inWin(t, lb.a, lb.b); show(lock, lOn);
  if (lOn) { const p = spring(t - lb.a, 'heavy'), q = spring(t - (lb.b - 0.25), 'default'); place(lock, CX, BY - q * 300, 0.8 * (1.2 - 0.2 * p) * (1 + smooth(lb.a, lb.b, t) * 0.09), 0, clamp(p * 2 - q * 2, 0, 1), (1 - clamp(p, 0, 1)) * 10 + q * 10); }
  // fin
  const eOn = t >= M.logo; show(lock2, eOn); show(cta, eOn && t >= M.cta - 0.1); show(cta2, eOn && t >= M.cta + 0.3);
  if (eOn) {
    const p = spring(t - M.logo, 'heavy'), push = smooth(M.logo, M.end, t);
    place(lock2, CX, 700 - push * 20, (1.1 - 0.1 * p) * 0.85 * (1 + push * 0.03), 0, clamp(p * 2, 0, 1), (1 - clamp(p, 0, 1)) * 10);
    const c = spring(t - M.cta, 'default'); const beat = Math.max(...[2.4, 1.6, 0.8].map(d => bump(t, M.end - d, 0.16)));   // le CTA bat trois fois : jamais de carton figé
    place(cta, CX, 960 + (1 - c) * 60, (0.9 + 0.1 * c) * (1 + beat * 0.06), 0, clamp(c * 2, 0, 1), (1 - clamp(c, 0, 1)) * 8);
    letters(cta2, t, M.cta + 0.35, 1e9, 0.02); at(cta2, 1080);
  }
  demo.style.opacity = t >= M.annonce - 0.1 ? '1' : '0';
};

await document.fonts.ready;
await document.fonts.load("800 200px 'Archivo'"); await document.fonts.load("600 76px 'Archivo'");
for (const b of BEATS) { if (b.box) fitW(b.box); if (b.sub) fitW(b.sub); }
fitW(cta2);
window.seek(0);
window.filmReady = true;
