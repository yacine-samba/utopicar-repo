// UTOPICAR — la vidéo validée refaite dans la grammaire de la référence 2 : lumière bleue en barres verticales et
// particules, verre dépoli. Chaque phrase se tape dans un champ en verre (la barre « Hey, AI… » de la référence) avec
// un curseur en verre ; bulle de verre liquide avec les 5 fonctions en orbite ; carte de chargement (barre jaune des vrais
// boutons) pour « 2 secondes » ; comparateur avant/après pour les dossiers ; vraie interface sous cadre de verre ;
// logo + pilule « Commente GARAGE » à la fin. Accent orange UTOPICAR. Repères = mots de Simon (timeline-mo2.json).
// ?hook=voix | sansvoix. Zone sûre TikTok : x 60 → 940, y 220 → 1480. Contrat : window.seek(t) peint la frame t.
import { beats, segs } from '../film-mo/beats.js';
import { loadUI, makeUI } from '../film-mo/ui.js';
import { appIcon } from '../film-mo/icon.js';
const { spring, clamp, lerp, noise } = Motion;
const { el, show, smooth, inOut, bump, place, text, marker, hash } = Kit;
const TL = await (await fetch('../timeline-mo2.json')).json();
const M = TL.marks;
const VOICE = (new URLSearchParams(location.search).get('hook') || 'voix') !== 'sansvoix';
const LOGO = await appIcon();
const stage = document.getElementById('stage');
const CX = 540, PY = 640, BY = 860, UY = 1160;
const inWin = (t, a, b) => t >= a && t < b;
await loadUI();

/* ================= lumière : halo, barres verticales, particules ================= */
const bgL = el('div', 'layer', stage);
const glow = el('div', 'glow', bgL);
const bars = Array.from({ length: 30 }, (_, i) => {
  const b = el('div', 'bar', bgL); const w = 24 + hash(i + 1) * 70, a = 0.12 + hash(i + 9) * 0.4;
  b.style.width = w + 'px'; b.style.background = `linear-gradient(180deg, transparent 0%, rgba(120,190,255,${a}) 35%, rgba(160,220,255,${a * 1.2}) 50%, rgba(80,140,255,${a}) 65%, transparent 100%)`;
  b._x = -60 + i * 40 + hash(i + 3) * 30; b._w = w; return b;
});
const bokeh = Array.from({ length: 36 }, (_, i) => { const d = el('div', 'bk', bgL); const s = 4 + hash(i + 20) * 12; d.style.width = d.style.height = s + 'px'; d.style.filter = `blur(${(hash(i + 40) * 3).toFixed(1)}px)`; d._p = [hash(i + 60) * 1080, hash(i + 80) * 1920, 0.2 + hash(i + 90) * 0.6]; return d; });

/* ================= contenus ================= */
const uiL = el('div', 'layer', stage);
const txtL = el('div', 'layer', stage);
const glass = (c) => c.classList.add('frame');
const PLANE = `<svg viewBox="0 0 100 100"><defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#B9D4FF"/><stop offset="1" stop-color="#5A86FF"/></linearGradient></defs><path d="M10 20 L90 50 L10 80 L28 50 Z" fill="url(#pg)" stroke="rgba(255,255,255,.9)" stroke-width="3" stroke-linejoin="round"/></svg>`;
function pill(parent, s) {
  const p = el('div', 'pill', parent); const tx = el('span', 'tx', p);
  const chars = [];
  for (const [t, c] of segs(s)) { if (t === '\n') { el('br', '', tx); continue; } for (const ch of t) { const sp = el('span', c || '', tx); sp.textContent = ch; chars.push(sp); } }
  const caret = el('span', 'caret', p); p.chars = chars; p.caret = caret; return p;
}
const BEATS = beats(M, VOICE).map(b => {
  if (b.kind === 'phrase') { b.box = pill(txtL, b.text.replace('\n', ' ')); }
  else if (b.kind === 'big') { b.box = text(txtL, [[b.text, '']], 'big'); }
  else if (b.kind === 'red' || b.kind === 'green') { const [n, s] = b.text.split('|'); b.box = text(txtL, [[n, b.kind === 'red' ? 'rd' : 'gr']], 'big'); b.sub = text(txtL, [[s, '']], 'sub'); }
  if (b.ui && b.ui !== 'dock' && b.ui !== 'duo') b.g = makeUI(uiL, b.ui, glass);
  return b;
});
// comparateur avant / après (dossiers) : la Golf à gauche, la Clio révélée par le rideau
const cmp = el('div', 'abs', uiL);
const cA = makeUI(cmp, 'clio', glass);                  // après : la Clio, GO
const beforeWrap = el('div', 'abs', cA); Object.assign(beforeWrap.style, { overflow: 'hidden', height: cA._h + 'px', width: '0px', zIndex: 2 });
const cB = makeUI(beforeWrap, 'golffull', null);         // avant : la Golf, NO GO (même format)
cB.style.left = '0px'; cB.style.top = '0px'; cB.cards[0].style.left = '0px'; cB.cards[0].style.top = '0px';
const cmpDiv = el('div', 'abs', cA); Object.assign(cmpDiv.style, { width: '6px', height: cA._h + 'px', background: '#FFFFFF', boxShadow: '0 0 20px rgba(20,60,200,.6)', zIndex: 3 });
const cmpL = text(uiL, [['NO GO', '']], 'sub'), cmpR = text(uiL, [['GO', '']], 'sub');

// bulle de verre liquide + 5 fonctions en orbite (voici → f1)
const orbL = el('div', 'layer', stage);
const orb = el('div', 'orb', orbL);
const orbLogo = el('div', 'lock', orbL); orbLogo.innerHTML = `${LOGO()}`;
const TAGS = ['Analyser', 'Rapports', 'Recherche en direct', 'Parc', 'Tableau de bord'].map((s, i) => { const g = el('div', 'tag', orbL); g.textContent = s; g._a = i / 5 * Math.PI * 2 - Math.PI / 2; return g; });
const wm = text(orbL, [['UTOPICAR', '']], 'big'); wm.style.fontStretch = '125%'; wm.style.letterSpacing = '.02em';

// carte de chargement (« 2 secondes »)
const load = el('div', 'load', uiL); load.innerHTML = `<div class="t">Analyse du dossier…</div><div class="s">Frais, revente, prix plafond</div><div class="bar2"><i></i></div>`;
const loadBar = load.querySelector('.bar2 i');

const plane = el('div', 'plane', stage); plane.innerHTML = PLANE;
const lock = el('div', 'lock', stage); lock.innerHTML = `${LOGO()}<span class="wm">UTOPICAR</span>`;
const cta = el('div', 'cta', stage); cta.innerHTML = `Commente <span class="g">GARAGE</span>`;
const cta2 = text(stage, [['et reçois ton accès.', '']], 'sub');
const demo = el('div', 'demo', stage); demo.textContent = 'Données de démonstration';

const fitW = (box, max = 760) => { const tf = box.style.transform; box.style.transform = 'none'; const r = [...box.querySelectorAll('.ch')].map(c => c.getBoundingClientRect()).filter(r => r.width); const w = r.length ? Math.max(...r.map(x => x.right)) - Math.min(...r.map(x => x.left)) : 0; if (w > max) box.style.fontSize = (parseFloat(getComputedStyle(box).fontSize) * max / w).toFixed(1) + 'px'; box.style.transform = tf; };
const at = (box, y, s = 1) => { box.style.transform = `translate(0px,${(y - box.offsetHeight / 2).toFixed(1)}px) scale(${s.toFixed(4)})`; };
function letters(box, t, a, b, rate = 0.03, rise = 50, blur = 18) {
  box.chars.forEach((c, i) => {
    const p = spring(t - (a + i * rate), 'snappy'), q = spring(t - (b - 0.24 + i * rate * 0.3), 'snappy');
    c.style.opacity = clamp(p * 1.6 - q * 1.6, 0, 1).toFixed(3);
    c.style.transform = `translateY(${((1 - p) * rise - q * rise).toFixed(1)}px) scale(${(1 + (1 - clamp(p, 0, 1)) * 0.2).toFixed(3)})`;
    const bl = (1 - clamp(p, 0, 1)) * blur + q * blur; c.style.filter = bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : '';
  });
}
// champ en verre : la phrase se tape lettre à lettre (image 0 déjà écrite en partie)
function typed(p, t, a, b) {
  const n = p.chars.length, rate = Math.min(0.035, Math.max(0.018, (b - a - 0.6) / n));
  const k = Math.floor(clamp((t - a) / rate, 0, n));
  p.chars.forEach((c, i) => { c.style.visibility = i < k ? 'visible' : 'hidden'; });
  p.caret.style.opacity = (k < n || Math.floor(t * 2.4) % 2 === 0) ? '1' : '0.15';
  return k / n;
}

window.seek = function (t) {
  // lumière qui dérive, particules qui montent
  place(glow, 940, 1160, 1 + noise(1, t * 0.15) * 0.06, 0, 1);
  bars.forEach((b, i) => { b.style.left = (b._x + noise(i + 3, t * 0.12) * 60) + 'px'; b.style.opacity = (0.7 + noise(i + 30, t * 0.3) * 0.3).toFixed(3); });
  bokeh.forEach((d, i) => { const [x, y, o] = d._p; const yy = ((y - t * (20 + o * 40)) % 1920 + 1920) % 1920; place(d, x + noise(i + 5, t * 0.2) * 30, yy, 1, 0, o * (0.6 + 0.4 * noise(i + 7, t * 0.8))); });
  let planeTo = null, planeOn = false;
  for (const b of BEATS) {
    const on = inWin(t, b.a - 0.05, b.b); if (b.box) show(b.box, on); if (b.sub) show(b.sub, on); if (b.g) show(b.g, on);
    if (!on || b.kind === 'lockup' || b.kind === 'end') continue;
    const a0 = b.a === 0 ? -0.6 : b.a;                 // image 0 : déjà quelques lettres tapées
    if (b.kind === 'phrase') {
      const p = spring(t - (b.a === 0 ? -2 : b.a), 'default'), q = spring(t - (b.b - 0.25), 'default');
      const y = (b.g || b.ui === 'dock' || b.ui === 'duo' ? PY : BY) + (b.ui === 'dock' ? -260 : 0);
      const w = b.box.offsetWidth, sc = Math.min(1, 780 / w);
      place(b.box, CX, y + (1 - p) * 60 - q * 80, sc * (0.92 + 0.08 * p), 0, clamp(p * 2 - q * 2, 0, 1), (1 - clamp(p, 0, 1)) * 10 + q * 12);
      const f = typed(b.box, t, a0 + 0.12, b.b);
      planeTo = [CX + w * sc / 2 - 30, y + 60]; planeOn = true;
    } else if (b.kind === 'big') { letters(b.box, t, b.a, b.b); at(b.box, BY, 1 + smooth(b.a, b.b, t) * 0.05); }
    else { letters(b.box, t, b.a, b.b); at(b.box, 780, 1 + smooth(b.a, b.b, t) * 0.05); letters(b.sub, t, b.a + 0.3, b.b, 0.02, 30, 10); at(b.sub, 960); }
    if (b.g) {
      const p = spring(t - (b.a + 0.1), 'default'), q = spring(t - (b.b - 0.25), 'default');
      place(b.g, CX, UY + (b.g._dy || 0) + (1 - p) * 160 - q * 120, (0.88 + 0.12 * p) * (1 + smooth(b.a, b.b, t) * 0.03), 0, clamp(p * 1.8 - q * 1.8, 0, 1), (1 - clamp(p, 0, 1)) * 16 + q * 16);
      b.g.hls.forEach((h, i) => { marker(t, h, b.a + 0.5 + i * 0.15, null); h.style.opacity = '0.85'; });
    }
  }
  // curseur en verre : suit la fin du champ en cours de frappe
  show(plane, planeOn && planeTo);
  if (planeOn && planeTo) place(plane, planeTo[0] + noise(11, t * 0.9) * 10, planeTo[1] + noise(12, t * 0.8) * 10, 1, -8 + noise(13, t * 0.5) * 6, 1);
  // bulle de verre et fonctions en orbite (voici → f1)
  const oOn = inWin(t, M.voici - 0.05, M.f1); show(orbL, oOn);
  if (oOn) {
    const p = spring(t - M.voici, 'heavy'), q = spring(t - (M.f1 - 0.3), 'default');
    const cy = M.poche <= t ? 1060 : BY, ocy = lerp(BY, 1060, inOut(M.poche, M.poche + 0.6, t));
    place(orb, CX, ocy - q * 200, (0.4 + 0.6 * p) * (1 + noise(3, t * 0.6) * 0.03) * (1 - q * 0.3), t * 6, clamp(p * 2 - q * 2, 0, 1));
    place(orbLogo, CX, ocy - q * 200, (0.6 + 0.4 * p) * (1 - q * 0.3), 0, clamp(p * 2 - q * 2, 0, 1));
    TAGS.forEach((g, i) => {
      const tp = spring(t - (M.voici + 0.35 + i * 0.12), 'default'); const ang = g._a + (t - M.voici) * 0.35;
      place(g, CX + Math.cos(ang) * 270 * tp, ocy + Math.sin(ang) * 340 * tp - q * 200, 0.6 + 0.4 * tp, 0, clamp(tp * 2 - q * 2, 0, 1), (1 - clamp(tp, 0, 1)) * 8);
    });
    const wp = spring(t - (M.voici + 0.2), 'heavy'); show(wm, t < M.poche + 0.2); letters(wm, t, M.voici + 0.2, M.poche + 0.2, 0.03); at(wm, 460, 0.7);
  }
  // « 2 secondes » : carte de chargement
  const lOn = inWin(t, M.deux - 0.05, M.note); show(load, lOn);
  if (lOn) { const p = spring(t - M.deux, 'default'), q = spring(t - (M.note - 0.25), 'default'); place(load, CX, UY - 40 + (1 - p) * 120 - q * 100, 0.9 + 0.1 * p, 0, clamp(p * 2 - q * 2, 0, 1), (1 - clamp(p, 0, 1)) * 12); loadBar.style.width = (clamp((t - M.deux - 0.1) / (M.note - M.deux - 0.35), 0, 1) * 100).toFixed(1) + '%'; }
  // comparateur (dossiers → meilleure)
  const cOn = inWin(t, M.dossiers - 0.05, M.meilleure); show(cmp, cOn); show(cmpL, cOn); show(cmpR, cOn);
  if (cOn) {
    const p = spring(t - M.dossiers, 'default'), q = spring(t - (M.meilleure - 0.25), 'default');
    const r = 1 - inOut(M.comparer - 0.1, M.meilleure - 0.2, t);        // rideau : NO GO → GO
    cmp.style.width = cA._w + 'px'; cmp.style.height = cA._h + 'px'; cA.style.left = '0'; cA.style.top = '0';
    beforeWrap.style.width = (cA._w * r).toFixed(1) + 'px'; cmpDiv.style.left = (cA._w * r - 3).toFixed(1) + 'px';
    place(cmp, CX, UY - 40 + (1 - p) * 160 - q * 120, 0.88 + 0.12 * p, 0, clamp(p * 2 - q * 2, 0, 1), (1 - clamp(p, 0, 1)) * 14);
    at(cmpL, UY - 40 - cA._h / 2 - 70); cmpL.style.transform += ` translateX(${(-260).toFixed(0)}px)`; cmpL.style.opacity = clamp(p * 2 - q * 2, 0, 1) * (0.4 + 0.6 * r);
    at(cmpR, UY - 40 - cA._h / 2 - 70); cmpR.style.transform += ` translateX(${(260).toFixed(0)}px)`; cmpR.style.opacity = clamp(p * 2 - q * 2, 0, 1) * (0.4 + 0.6 * (1 - r));
  }
  // fin
  const eOn = t >= M.logo; show(lock, eOn); show(cta, eOn && t >= M.cta - 0.1); show(cta2, eOn && t >= M.cta + 0.3);
  if (eOn) {
    const p = spring(t - M.logo, 'heavy'), push = smooth(M.logo, M.end, t);
    place(lock, CX, 720 - push * 20, (1.1 - 0.1 * p) * 0.85 * (1 + push * 0.03), 0, clamp(p * 2, 0, 1), (1 - clamp(p, 0, 1)) * 16);
    const c = spring(t - M.cta, 'default'), beat = Math.max(...[2.4, 1.6, 0.8].map(d => bump(t, M.end - d, 0.16)));   // le CTA bat trois fois : jamais de carton figé
    place(cta, CX, 980 + (1 - c) * 60, (0.9 + 0.1 * c) * (1 + beat * 0.05), 0, clamp(c * 2, 0, 1), (1 - clamp(c, 0, 1)) * 10);
    letters(cta2, t, M.cta + 0.35, 1e9, 0.02, 30, 10); at(cta2, 1120);
  }
  demo.style.opacity = t >= M.annonce - 0.1 ? '1' : '0';
};

await document.fonts.ready;
await document.fonts.load("800 190px 'Archivo'"); await document.fonts.load("600 60px 'Archivo'");
for (const b of BEATS) { if (b.box && !b.box.classList.contains('pill')) fitW(b.box); if (b.sub) fitW(b.sub); }
fitW(cta2); fitW(wm);
window.seek(0);
window.filmReady = true;
