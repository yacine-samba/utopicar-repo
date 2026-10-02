// utopicar — MO3 : plus d'humain, gros hooks. Grammaire de la réf. 5 (docs/ref5_style_guide.md) :
// plan-séquence sans coupe, une scène toutes les 1,5–2 s, typo cinétique écrite au mot sur la voix de Simon, fond blanc à
// grille de carrés pâles qui bascule du froid au chaud à la révélation du logo, cartes en perspective, éclats de traits
// dessinés aux moments clés, chiffre géant avec lignes de vitesse, aplat plein cadre sur l'action.
// ?hook=A (scène vécue) | B (chiffre choc) | C (aveu chuchoté). Contrat : window.seek(t) peint la frame t.
import { loadUI, makeUI } from '../film-mo/ui.js';
const { spring, clamp, lerp, noise } = Motion;
const { el, show, smooth, inOut, bump, place, cursor, moveCursor, hash } = Kit;
const TL = await (await fetch('../timeline-mo3.json')).json();
const HOOK = (new URLSearchParams(location.search).get('hook') || 'A').toUpperCase();
const HK = TL.hooks[HOOK] || TL.hooks.A;
const H = HK.H, B0 = HK.B0, END = HK.dur, HR = HK.regions, BR = TL.body.map(([a, b]) => [B0 + a, B0 + b]);
const T = {}; for (const k in TL.ev) T[k] = B0 + TL.ev[k];
const stage = document.getElementById('stage');
const CX = 540;
const inWin = (t, a, b) => t >= a && t < b;
await loadUI();
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const svgBox = (parent, w, h) => { const s = sv('svg', { class: 'g', width: w, height: h, viewBox: `0 0 ${w} ${h}` }); parent.appendChild(s); return s; };
const fmt = v => (v < 0 ? '− ' : v > 0 ? '+ ' : '') + Math.abs(Math.round(v)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
const mix = (c1, c2, k) => { const a = c1.match(/\w\w/g).map(h => parseInt(h, 16)), b = c2.match(/\w\w/g).map(h => parseInt(h, 16)); return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`; };
const INK = '#0C0F14', GRAY = '#C3C8D0', BLUE = '#2447D6', OR = '#FF5A1F', RED = '#D93A3A';

/* ================= fond : grille de carrés pâles, froid → chaud ================= */
const bg = document.getElementById('bg'), cx2 = bg.getContext('2d');
function drawBg(t) {
  const w = smooth(T.zoom + 0.15, T.zoom + 0.55, t);
  cx2.globalAlpha = 1; cx2.fillStyle = '#F6F8FB'; cx2.fillRect(0, 0, 1080, 1920);
  if (w > 0) {
    const g = cx2.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#FFF9F4'); g.addColorStop(0.55, '#FFEFE4'); g.addColorStop(1, '#FFDCC8');
    cx2.globalAlpha = w; cx2.fillStyle = g; cx2.fillRect(0, 0, 1080, 1920);
    const r = cx2.createRadialGradient(540, 1500, 50, 540, 1500, 900); r.addColorStop(0, 'rgba(255,150,110,.22)'); r.addColorStop(1, 'rgba(255,150,110,0)');
    cx2.fillStyle = r; cx2.fillRect(0, 0, 1080, 1920);
  }
  const S = 120, off = t * 16, ox = noise(31, t * 0.15) * 30, r0 = Math.floor(off / S);
  for (let r = r0; r < r0 + 18; r++) for (let c = -1; c < 10; c++) {
    const h = hash(r * 57.3 + c * 13.1); if (h < 0.42) continue;
    const a = (h - 0.42) / 0.58 * (0.6 + 0.4 * noise(r * 7 + c, t * 0.35));
    const x = c * S + ox + 2, y = r * S - off + 2;
    cx2.globalAlpha = 1; cx2.fillStyle = `rgba(${Math.round(lerp(40, 255, w))},${Math.round(lerp(60, 110, w))},${Math.round(lerp(110, 50, w))},${(a * lerp(0.05, 0.07, w)).toFixed(4)})`;
    cx2.fillRect(x, y, S - 4, S - 4);
  }
}

/* ================= calques ================= */
const cam = el('div', '', stage); cam.id = 'cam';
const uiL = el('div', 'layer', cam), gL = el('div', 'layer', cam), capL = el('div', 'layer', cam);
for (const L of [uiL, gL]) { L.style.perspective = '2200px'; L.style.perspectiveOrigin = '540px 900px'; }
const topL = el('div', 'layer', stage);

/* ================= typo cinétique : mot à mot, calée sur la voix ================= */
const CAPS = [];
// s : mots séparés par des espaces, *mot* = accent, | = retour à la ligne ; [t0, t1] = la région de voix
function cap(s, t0, t1, y, cls = '', o = {}) {
  const box = el('div', 'cap ' + cls, capL); const toks = s.split(' ');
  const len = toks.map(k => k.replace(/[*|]/g, '').length + 1); const tot = len.reduce((a, b) => a + b, 0);
  let cum = 0; const words = [];
  toks.forEach((k, i) => {
    if (k === '|') { el('br', '', box); return; }
    const e = el('span', 'w', box); e.textContent = k.replace(/\*/g, '') + (i < toks.length - 1 && toks[i + 1] !== '|' ? ' ' : '');
    words.push({ e, t: t0 - 0.04 + (t1 - t0) * cum / tot * (o.spread ?? 1), acc: k.includes('*') }); cum += len[i];
  });
  if (o.size) box.style.fontSize = o.size + 'px';
  const C = { box, words, t0, y, out: o.out, acc: o.acc || OR, ink: o.ink || INK, keep: o.keep };
  CAPS.push(C); return C;
}
function drawCap(C, t) {
  const on = t >= C.t0 - 0.12 && (C.out == null || t < C.out + 0.05); show(C.box, on); if (!on) return;
  const q = C.out == null ? 0 : clamp(spring(t - (C.out - 0.2), 'snappy'), 0, 1);
  for (const w of C.words) {
    const p = spring(t - w.t, 'snappy'), k = smooth(w.t, w.t + 0.3, t);
    w.e.style.opacity = clamp(p * 1.6 - q * 1.4, 0, 1).toFixed(3);
    w.e.style.color = mix(GRAY, w.acc ? C.acc : C.ink, k);
    w.e.style.transform = `translateY(${((1 - p) * 34 - q * 60).toFixed(1)}px)`;
    const bl = (1 - clamp(p, 0, 1)) * 12 + q * 14; w.e.style.filter = bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : '';
  }
  C.box.style.transform = `translate(0px,${(C.y - C.box.offsetHeight / 2).toFixed(1)}px) scale(${(C.scale || 1).toFixed(4)})`;
}

/* ================= outils graphiques ================= */
function place3(e, x, y, s = 1, rx = 0, ry = 0, rz = 0, o = 1, blur = 0) {
  e.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) translate(-50%,-50%) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotate(${rz.toFixed(2)}deg) scale(${s.toFixed(4)})`;
  e.style.opacity = clamp(o, 0, 1).toFixed(3); e.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
}
// entrée sur ressort, sortie en profondeur (recul + flou) : jamais de fondu seul
function pop(e, t, a, b, x, y, o = {}) {
  const on = t >= a - 0.05 && t < b + 0.12; show(e, on); if (!on) return 0;
  const p = spring(t - a, o.pre || 'default'), q = spring(t - (b - 0.24), 'snappy');
  const dy = o.dy ?? 130, s0 = o.s0 ?? 0.84, up = o.out === 'up';
  const s = (s0 + (1 - s0) * p) * (o.s || 1) * (1 + (o.drift || 0) * smooth(a, b, t)) * (up ? 1 : 1 - 0.32 * q);
  place3(e, x + (o.dx || 0) * (1 - p), y + (1 - p) * dy - (up ? q * 200 : q * 30), s, (o.rx ?? 22) * (1 - p) + (o.rx2 || 0), (o.ry || 0) * (1 - p) + (o.ry2 || 0),
    (o.r || 0) * (1 - p) + (o.rot || 0), clamp(p * 1.8 - q * 1.6, 0, 1), (1 - clamp(p, 0, 1)) * 14 + q * 16);
  return clamp(p, 0, 1);
}
// éclat de traits dessinés (stylo orange) : se tracent du centre vers l'extérieur puis se rétractent
function penBurst(parent, n = 11, r1 = 170, r2 = 300, w = 15, ex = 1, ey = 1) {
  const s = svgBox(parent, 1400, 1400); const g = sv('g', { transform: 'translate(700 700)' }, s);
  s._l = Array.from({ length: n }, (_, i) => {
    const a = i / n * 2 * Math.PI + (hash(i + 1) - 0.5) * 0.35, a1 = r1 * (0.85 + 0.3 * hash(i + 5)), a2 = r2 * (0.8 + 0.35 * hash(i + 9)), L = a2 - a1;
    const l = sv('line', { x1: (Math.cos(a) * a1 * ex).toFixed(1), y1: (Math.sin(a) * a1 * ey).toFixed(1), x2: (Math.cos(a) * a2 * ex).toFixed(1), y2: (Math.sin(a) * a2 * ey).toFixed(1),
      stroke: i % 3 === 1 ? '#FFB08A' : OR, 'stroke-width': (w * (0.65 + 0.6 * hash(i + 3))).toFixed(1), 'stroke-linecap': 'round' }, g); l._L = Math.hypot((a2 - a1) * Math.cos(a) * ex, (a2 - a1) * Math.sin(a) * ey); return l;
  });
  return s;
}
function drawBurst(s, t, t0, x, y, sc = 1, dur = 0.62) {
  const on = t >= t0 && t < t0 + dur; show(s, on); if (!on) return;
  const k = (t - t0) / dur; place(s, x, y, sc * (0.92 + 0.2 * k), k * 8, 1);
  s._l.forEach(l => { const L = l._L, d = inOut(0, 0.38, k), r = inOut(0.32, 1, k); l.setAttribute('stroke-dasharray', `${Math.max(0.01, (d - r) * L).toFixed(1)} ${(L * 3).toFixed(1)}`); l.setAttribute('stroke-dashoffset', (-r * L).toFixed(1)); });
}
// lignes de vitesse (chiffre géant qui glisse)
function speedLines(parent) {
  const s = svgBox(parent, 1080, 700);
  // deux bandes (au-dessus et au-dessous du chiffre) : aucune ligne ne traverse les chiffres
  s._l = Array.from({ length: 9 }, (_, i) => { const yy = i < 5 ? 20 + i * 44 : 500 + (i - 5) * 50; const l = sv('line', { y1: yy, y2: yy, stroke: i % 2 ? '#FF8A5C' : OR, 'stroke-width': 8 + (i % 3) * 3, 'stroke-linecap': 'round' }, s); l._v = 2600 + hash(i + 2) * 1600; l._p = hash(i + 7) * 1400; l._len = 140 + hash(i + 11) * 220; return l; });
  return s;
}
function drawSpeed(s, t, a, b, y) {
  const on = inWin(t, a, b); show(s, on); if (!on) return;
  const o = smooth(a, a + 0.12, t) * (1 - smooth(b - 0.35, b, t));
  place(s, CX, y, 1, 0, o);
  s._l.forEach(l => { const x = 1300 - ((t - a) * l._v + l._p) % 1900; l.setAttribute('x1', x.toFixed(1)); l.setAttribute('x2', (x + l._len).toFixed(1)); });
}
// trait tracé à la main (cercle, soulignement)
function handPath(parent, w, h, d, sw = 9) { const s = svgBox(parent, w, h); s._p = sv('path', { d, fill: 'none', stroke: OR, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-dasharray': 2000, 'stroke-dashoffset': 2000 }, s); return s; }
const CIRCLE = 'M30 90 C 30 26, 330 12, 352 74 C 372 136, 70 168, 36 112 C 18 80, 90 30, 210 24';
// carte d'annonce générique (pas une interface réelle : un objet graphique, sans plateforme ni prix)
const CAR = `<svg viewBox="0 0 124 64" width="150" height="78"><path d="M8 44 L13 31 Q17 23 29 21 L46 12 Q54 8 66 8 L80 8 Q91 8 99 18 L107 28 Q116 30 116 39 L116 46 L8 46 Z" fill="#FFFFFF" stroke="#9AA3AE" stroke-width="5" stroke-linejoin="round"/><circle cx="32" cy="47" r="10" fill="#fff" stroke="#9AA3AE" stroke-width="5"/><circle cx="92" cy="47" r="10" fill="#fff" stroke="#9AA3AE" stroke-width="5"/></svg>`;
function listing(parent) { const e = el('div', 'list', parent); e.innerHTML = `<div class="ph">${CAR}</div><div><div class="t1">Volkswagen Golf VII</div><div class="t2">1.6 TDI · 168 000 km<br>Orléans (45)</div><span class="lbl">l'annonce</span></div>`; return e; }

/* ================= OUVERTURES ================= */
const hk = {};
if (HOOK === 'A') {          // scène vécue : il hésite, il achète
  hk.card = listing(uiL);
  hk.c1 = cap('Mmh…', HR[0][0] - 0.2, HR[0][1], 430, '', { out: HR[1][0] - 0.05, spread: 0.4 });
  hk.c2 = cap('Propre…', HR[1][0], HR[1][1], 430, '', { out: HR[3][0] - 0.05 });
  hk.c3 = cap('Allez.', HR[3][0], HR[3][1], 430, '', { out: H - 0.3 });
  hk.p1 = el('div', 'pill', gL); hk.p1.innerHTML = '<i>✓</i>Propre';
  hk.p2 = el('div', 'pill q', gL); hk.p2.innerHTML = '<i>?</i>Le prix';
  hk.btn = el('div', 'btn', gL); hk.btn.textContent = "J'achète";
  hk.tClick = HR[4][0] + 0.12;
  hk.flat = el('div', 'flat', topL); hk.flatT = el('div', 'flatT', topL); hk.flatT.textContent = 'Acheté.';
  hk.burst = penBurst(topL, 12, 120, 230, 13);
} else if (HOOK === 'B') {   // chiffre choc
  hk.speed = speedLines(gL);   // derrière le chiffre
  hk.giant = el('div', 'giant', gL); hk.giant.textContent = '− 1 200 €'; hk.giant.style.color = RED;
  hk.c1 = cap('sur une voiture…', HR[1][0], HR[1][1], 1180, '', { out: H + 0.15 });
  hk.c2 = cap('*impeccable.*', HR[2][0], HR[2][1], 1330, 'ital', { out: H + 0.15, acc: INK, size: 120 });
  hk.circ = handPath(gL, 400, 190, CIRCLE, 10);
} else {                     // aveu chuchoté
  hk.card = listing(uiL);
  hk.c1 = cap('je vais te montrer…', HR[0][0] - 0.22, HR[0][1], 460, 'whisper', { out: H + 0.15, size: 60 });
  hk.c2 = cap('ma pire voiture.', HR[1][0] - 0.05, HR[2][1], 1390, '', { out: H + 0.15 });
  hk.stamp = el('div', 'stamp', gL); hk.stamp.textContent = 'PIRE';
}

/* ================= pluie de frais (silence), puis « Ouais. Les frais. » ================= */
const FEES = [['Remise en état', -1100], ['Carte grise', -186], ['Trajet', -64], ['Frais fixes', -150]];
const fees = FEES.map(([s, v], i) => { const e = el('div', 'chip', gL); e.innerHTML = `<span>${s}</span><b>${fmt(v)}</b>`; e._t = T.fee0 + i * 0.27; e._v = v; return e; });
const cnt = el('div', 'count', gL);
cap('Ouais.', BR[0][0], BR[0][1], 470, '', { out: BR[1][0] - 0.05 });
cap('Les *frais*.', BR[1][0], BR[1][1], 470, '', { out: T.voiture - 0.08, acc: RED });
const feeOut = T.voiture - 0.1;

/* ================= « Sur une voiture… parfaite. » → zoom à travers le mot ================= */
const card2 = listing(uiL);
const okP = [['CT OK', 330, 1370, -3], ['Propre', 760, 1300, 3]].map(([s, x, y, r]) => { const e = el('div', 'pill', gL); e.innerHTML = `<i>✓</i>${s}`; e._x = x; e._y = y; e._r = r; return e; });
cap('Sur une voiture…', BR[3][0], BR[3][1], 520, '', { out: T.zoom + 0.05 });
const parf = cap('*parfaite.*', BR[4][0], BR[4][1], 790, 'ital', { acc: INK, out: T.zoom + 0.5 });

/* ================= logo + « Maintenant, avant d'acheter, » ================= */
const logo = el('img', 'logo', gL); logo.src = '../assets/brand/official/utopicar-logo-horizontal-fond-clair.svg';
const logoBurst = penBurst(gL, 13, 250, 400, 16);
cap('Maintenant, *avant* d\'acheter,', BR[5][0], BR[5][1], 560, '', { out: T.colle - 0.04, size: 66 });

/* ================= « je colle l'annonce dans utopicar. » ================= */
const pasteCard = makeUI(uiL, 'texte', c => { c.style.boxShadow = '0 50px 100px -40px rgba(20,30,50,.4)'; }, 0.92);
const pasteMask = el('div', 'abs', pasteCard.cards[0]); Object.assign(pasteMask.style, { left: '0', width: '100%', background: '#FFFFFF' });
const launchImg = new Image(); launchImg.src = '../assets/ui/launch.png'; await launchImg.decode();
const launch = el('div', 'abs', uiL); const lk = 700 / (launchImg.naturalWidth / 3);
Kit.crop(launch, launchImg.src, launchImg.naturalWidth, launchImg.naturalHeight, { x: 0, y: 0, w: launchImg.naturalWidth / 3, h: launchImg.naturalHeight / 3 }, lk);
Object.assign(launch.style, { width: 700 + 'px', height: launchImg.naturalHeight / 3 * lk + 'px' });
cap("je colle l'annonce | dans *utopicar*.", BR[6][0], BR[6][1], 470, '', { out: T.deux - 0.04 });
const clickBurst = penBurst(topL, 10, 70, 150, 11);

/* ================= « Deux secondes. » : anneau ================= */
const load = svgBox(gL, 520, 520);
sv('circle', { cx: 260, cy: 260, r: 200, fill: 'none', stroke: 'rgba(12,15,20,.07)', 'stroke-width': 26 }, load);
const ldR = sv('circle', { cx: 260, cy: 260, r: 200, fill: 'none', stroke: OR, 'stroke-width': 26, 'stroke-linecap': 'round', transform: 'rotate(-90 260 260)', 'stroke-dasharray': 2 * Math.PI * 200 }, load);
const ldT = sv('text', { x: 260, y: 305, 'text-anchor': 'middle', class: 'lbl', 'font-size': 140, 'font-weight': 800, fill: INK }, load);
cap('Deux secondes.', BR[7][0], BR[7][1], 470, '', { out: T.note - 0.04 });

/* ================= « 38 sur 100. NO GO. » ================= */
const gauge = svgBox(gL, 620, 620);
sv('circle', { cx: 310, cy: 310, r: 240, fill: 'none', stroke: 'rgba(12,15,20,.07)', 'stroke-width': 34 }, gauge);
const gR = sv('circle', { cx: 310, cy: 310, r: 240, fill: 'none', stroke: RED, 'stroke-width': 34, 'stroke-linecap': 'round', transform: 'rotate(-90 310 310)', 'stroke-dasharray': 2 * Math.PI * 240 }, gauge);
const gT = sv('text', { x: 310, y: 345, 'text-anchor': 'middle', class: 'lbl', 'font-size': 180, 'font-weight': 800, fill: INK }, gauge);
const gS = sv('text', { x: 310, y: 415, 'text-anchor': 'middle', class: 'lbl', 'font-size': 40, fill: '#6B7480' }, gauge); gS.textContent = 'sur 100';
const stamp = el('div', 'stamp', gL); stamp.textContent = 'NO GO';
cap('*38* sur 100.', BR[8][0], BR[8][1], 470, '', { out: T.dit - 0.04, acc: RED });

/* ================= « Il me l'aurait dit. » : la vraie carte ================= */
const golf = makeUI(uiL, 'golffull', c => { c.style.boxShadow = '0 50px 100px -40px rgba(20,30,50,.4)'; }, 0.95);
const golfC = handPath(gL, 400, 190, CIRCLE, 9);
cap("Il me l'aurait dit.", BR[11][0], BR[11][1], 470, '', { out: T.prix - 0.04 });

/* ================= « Et le prix à ne jamais dépasser… » : réglette ================= */
const ruler = svgBox(gL, 800, 420);
const RX = v => 40 + (v - 6000) / (10000 - 6000) * 720;
sv('rect', { x: RX(7500), y: 150, width: RX(10000) - RX(7500), height: 70, rx: 12, fill: 'rgba(217,58,58,.12)' }, ruler);
sv('line', { x1: 40, y1: 185, x2: 760, y2: 185, stroke: 'rgba(12,15,20,.2)', 'stroke-width': 6, 'stroke-linecap': 'round' }, ruler);
[6000, 7000, 8000, 9000, 10000].forEach(v => { sv('line', { x1: RX(v), y1: 165, x2: RX(v), y2: 205, stroke: 'rgba(12,15,20,.3)', 'stroke-width': 3 }, ruler); const l = sv('text', { x: RX(v), y: 266, 'text-anchor': 'middle', class: 'lbl', 'font-size': 34, fill: '#6B7480' }, ruler); l.textContent = (v / 1000) + ' k€'; });
const rLim = sv('line', { x1: RX(7500), y1: 100, x2: RX(7500), y2: 270, stroke: RED, 'stroke-width': 7, 'stroke-dasharray': 170 }, ruler);
const rKnob = sv('g', {}, ruler);
sv('circle', { cx: 0, cy: 185, r: 30, fill: OR, stroke: '#FFFFFF', 'stroke-width': 7 }, rKnob);
const rKnobT = sv('text', { x: 0, y: 350, 'text-anchor': 'middle', class: 'lbl', 'font-size': 46, 'font-weight': 800, fill: INK }, rKnob);
cap('Et le prix à ne *jamais* | dépasser…', BR[12][0], BR[12][1], 470, '', { out: T.sept - 0.04 });

/* ================= « sept mille cinq cents. » : chiffre géant + lignes de vitesse ================= */
const numBurst = penBurst(gL, 14, 300, 420, 16, 1.45, 0.75);   // derrière le chiffre, en ellipse autour
const speed = speedLines(gL);
const g75 = el('div', 'giant', gL); g75.innerHTML = '7 500 <span style="color:#FF5A1F">€</span>'; g75.style.color = INK;
const g75s = el('div', 'sub', gL); g75s.textContent = 'ton prix maximum';

/* ================= « Une Clio, 1 450 € sous la cote ? » : radar ================= */
const radar = svgBox(gL, 760, 760); const rdG = sv('g', { transform: 'translate(380 380)' }, radar);
const rings = [110, 210, 310].map(r => sv('circle', { r, fill: 'rgba(255,90,31,.07)', stroke: 'rgba(255,90,31,.25)', 'stroke-width': 3 }, rdG));
const icon = sv('image', { href: '../assets/brand/official/utopicar-icone-orange.svg', x: -60, y: -60, width: 120, height: 120 }, rdG);
const DOTS = [[-200, -120], [150, -230], [260, 70], [-90, 250], [190, -40], [-280, 90], [60, 180], [-150, 130]].map(([x, y], i) => { const g = sv('g', {}, rdG); sv('circle', { r: i === 4 ? 30 : 24, fill: '#FFFFFF', stroke: i === 4 ? OR : 'rgba(12,15,20,.12)', 'stroke-width': i === 4 ? 6 : 3 }, g); sv('circle', { r: 9, fill: i === 4 ? OR : '#9AA3AE' }, g); g._x = x; g._y = y; return g; });
const dealP = el('div', 'pill or', gL); dealP.innerHTML = '<i>€</i>− 1 450 € sous la cote';
cap('Une Clio,', BR[14][0], BR[14][1], 470, '', { out: BR[15][0] - 0.04 });
cap('*1 450 €* sous la cote ?', BR[15][0], BR[15][1], 470, '', { out: T.sais - 0.04, size: 68 });
const toast = el('div', 'toast', gL);
toast.innerHTML = `<img src="../assets/brand/official/utopicar-icone-noir.svg"><div><div class="t1">Nouvelle affaire · Clio IV 1.5 dCi</div><div class="t2">6 400 € · <b>1 450 € sous la cote</b> · à l'instant</div></div>`;
const pings = [0, 1, 2].map(() => el('div', 'ripple', gL));
cap('je suis le premier prévenu.', BR[16][0], BR[16][1], 1330, 'whisper', { out: T.sais - 0.04 });

/* ================= « Je sais ce qu'il me reste avant d'acheter. Pas après. » ================= */
cap("Je sais ce qu'il me reste | *avant* d'acheter.", BR[17][0], BR[17][1], 820, 'side', { out: T.cta - 0.04 });
const apres = cap('Pas après.', BR[18][0], BR[18][1] + 0.1, 1110, 'big', { out: T.cta - 0.04, spread: 0.6 });
const under = handPath(gL, 660, 80, 'M20 50 C 180 26, 420 22, 640 40', 14);

/* ================= CTA ================= */
const lockE = el('img', 'logo', gL); lockE.src = '../assets/brand/official/utopicar-logo-horizontal-fond-clair.svg';
const ctaT = el('div', 'cta', gL); ctaT.textContent = 'Commente';
const pDeb = el('div', 'ctap', gL); pDeb.textContent = 'DÉBUTANT';
const pOu = el('div', 'cta', gL); pOu.textContent = 'ou'; pOu.style.width = 'auto'; pOu.style.left = '0px';
const pPro = el('div', 'ctap', gL); pPro.textContent = 'PRO';
cap("je t'envoie le guide.", BR[20][0], BR[20][1], 1170, '', { size: 52, ink: '#6B7480' });
const debBurst = penBurst(topL, 11, 150, 260, 13), proBurst = penBurst(topL, 11, 110, 220, 13);

/* ================= curseur, ondes, mention ================= */
const cur = cursor(topL, false);
const rip = el('div', 'ripple', topL);
const demo = el('div', 'demo', topL); demo.textContent = 'Données de démonstration';

/* ================= caméra ================= */
const SC = [0, H, T.voiture - 0.15, T.logo, T.colle, T.deux, T.note, T.dit, T.prix, T.sept, T.clio, T.prem, T.sais, T.cta, END];
const SHAKES = [[T.nogo + 0.06, 1], [T.fee0 + 3 * 0.27 + 0.15, 0.35]];
if (HOOK === 'C') SHAKES.push([HR[1][0] + 0.02, 0.9]);
if (HOOK === 'A') SHAKES.push([hk.tClick, 0.5]);
function camera(t) {
  const i = SC.findLastIndex(c => c <= t); const a = SC[i], b = SC[i + 1] ?? END;
  let s = 1.04 - 0.04 * spring(t - a, 'heavy') + 0.03 * smooth(a, b, t), x = noise(21, t * 0.25) * 7, y = noise(22, t * 0.22) * 7, r = noise(23, t * 0.2) * 0.25;
  // traversée de « parfaite. » : la caméra plonge
  const z = inOut(T.zoom, T.zoom + 0.45, t) * (1 - smooth(T.zoom + 0.45, T.zoom + 0.5, t)); s *= 1 + z * 1.4;
  for (const [ts, k] of SHAKES) { const e = t - ts; if (e > 0 && e < 0.6) { const d = Math.exp(-e * 9) * k; x += Math.sin(e * 70) * 18 * d; y += Math.cos(e * 55) * 14 * d; r += Math.sin(e * 40) * 0.9 * d; } }
  cam.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) scale(${s.toFixed(4)}) rotate(${r.toFixed(3)}deg)`;
}

/* ================= seek ================= */
window.seek = function (t) {
  drawBg(t); camera(t);
  for (const C of CAPS) drawCap(C, t);
  let curOn = false, clickAt = null;

  // ---------- ouvertures ----------
  if (HOOK === 'A') {
    const tc = hk.tClick;
    pop(hk.card, t, -0.32, H + 0.2, CX, 980, { dy: 520, s0: 0.9, rx: 30, rx2: 6, pre: 'default' });
    pop(hk.p1, t, HR[1][0] + 0.05, tc + 0.1, 330, 1240, { pre: 'snappy', dy: 60, s0: 0.5, rx: 0, rot: -4 });
    pop(hk.p2, t, HR[2][0] + 0.1, tc + 0.1, 760, 1250, { pre: 'snappy', dy: 60, s0: 0.5, rx: 0, rot: 3 });
    pop(hk.btn, t, HR[3][0] - 0.25, tc + 0.15, CX, 1400, { pre: 'snappy', dy: 80, s0: 0.6, rx: 0, s: 1 - 0.08 * bump(t, tc - 0.04, 0.12) });
    if (inWin(t, 0.35, tc + 0.2)) {   // il hésite : le curseur tourne autour de l'annonce, puis va cliquer
      const k = [[0.35, 1100, 1500], [0.6, 760, 1080], [1.3, 600, 1020], [1.9, 780, 1120], [2.5, 640, 1060], [HR[3][0] - 0.05, 700, 1240], [HR[3][0] + 0.35, 560, 1410]];
      moveCursor(cur, t, k, [tc], 0.35, tc + 0.2); curOn = true; clickAt = [tc, 560, 1410];
    }
    const f = inOut(tc, tc + 0.28, t), fo = inOut(H - 0.02, H + 0.3, t);   // aplat : cercle depuis le clic, puis volet vers le haut
    show(hk.flat, f > 0 && fo < 1);
    if (f > 0 && fo < 1) { const R = 2400 * f; hk.flat.style.clipPath = `circle(${R.toFixed(0)}px at 560px 1410px)`; hk.flat.style.transform = `translateY(${(-1960 * fo).toFixed(1)}px)`; }
    show(hk.flatT, f > 0.5 && fo < 1);
    if (f > 0.5 && fo < 1) { const p = spring(t - (tc + 0.12), 'heavy'); hk.flatT.style.transform = `translate(0px,${(870 + (1 - p) * 60 - 1960 * fo).toFixed(1)}px) scale(${(1.1 - 0.1 * p).toFixed(4)})`; hk.flatT.style.opacity = clamp(p * 2, 0, 1); }
    drawBurst(hk.burst, t, tc + 0.02, 560, 1410, 1);
  } else if (HOOK === 'B') {
    // − 1 200 € déjà là à l'image 0, glisse avec ses lignes de vitesse
    const on = t < H + 0.14; show(hk.giant, on);
    if (on) { const p = spring(t + 0.22, { f: 2.4, z: 0.9 }), q = inOut(H - 0.16, H + 0.12, t); const x = lerp(820, CX, p) - (t * 18), bl = (1 - p) * 22, fs = hk.gs;
      hk.giant.style.transform = `translate(${(x - hk.giant.offsetWidth / 2).toFixed(1)}px,${(860 - 125 - q * 120).toFixed(1)}px) scale(${(fs * (1 + 0.02 * t) * (1 - 0.3 * q)).toFixed(4)})`;
      hk.giant.style.filter = (bl + q * 18) > 0.3 ? `blur(${(bl + q * 18).toFixed(1)}px)` : ''; hk.giant.style.opacity = (1 - q).toFixed(3); }
    drawSpeed(hk.speed, t, 0, 1.3, 860);
    const tc = HR[2][0] + 0.25, on2 = inWin(t, tc, H + 0.06); show(hk.circ, on2);
    if (on2) { place(hk.circ, CX, 1330, 1.25, 0, 1 - smooth(H - 0.2, H + 0.05, t)); hk.circ._p.setAttribute('stroke-dashoffset', (2000 - 1100 * inOut(tc, tc + 0.55, t)).toFixed(1)); }
  } else {
    const k = inOut(0.0, HR[1][0] + 0.3, t);   // l'annonce sort du flou : on découvre la voiture
    const on = t < H + 0.32; show(hk.card, on);
    if (on) place3(hk.card, CX, 960, 1.35 - 0.3 * k, 8 - 4 * k, -6 + 6 * k, 0, 1 - inOut(H, H + 0.3, t), 6 * (1 - k) + 16 * smooth(H, H + 0.3, t));
    const ts = HR[1][0] + 0.02, so = inWin(t, ts - 0.02, H + 0.08); show(hk.stamp, so);
    if (so) { const s = spring(t - ts, 'snappy'), q = smooth(H - 0.2, H + 0.06, t); place(hk.stamp, CX, 1220, (2.4 - 1.4 * s) * (1 - q * 0.3), -9, clamp(s * 3, 0, 1) * (1 - q), q * 14); }
  }

  // ---------- pluie de frais + compteur ----------
  { let val = 300;
    fees.forEach((e, i) => { const y = 700 + i * 122; pop(e, t, e._t, feeOut, CX + (i % 2 ? 24 : -24), y, { pre: 'snappy', dy: -900, s0: 0.95, rx: 0, r: i % 2 ? 9 : -9, rot: i % 2 ? 1.5 : -1.5 }); if (t >= e._t + 0.15) val += e._v * clamp((t - e._t - 0.15) / 0.22, 0, 1); });
    const a = H + 0.02, on = inWin(t, a, feeOut + 0.15); show(cnt, on);
    if (on) { const p = spring(t - a, 'default'), q = spring(t - (feeOut - 0.2), 'snappy');
      cnt.innerHTML = `${fmt(val)}<small>ce qu'il te reste</small>`; cnt.style.color = val < 0 ? RED : '#0A8F55';
      const kick = Math.max(...fees.map(f => bump(t, f._t + 0.15, 0.1)));
      cnt.style.transform = `translate(0px,${(1150 + (1 - p) * 90 + q * 60).toFixed(1)}px) scale(${(0.9 + 0.1 * p + kick * 0.06 - q * 0.2).toFixed(4)})`; cnt.style.transformOrigin = '400px 50%';
      cnt.style.opacity = clamp(p * 2 - q * 2, 0, 1).toFixed(3); cnt.style.filter = q > 0.02 ? `blur(${(q * 14).toFixed(1)}px)` : ''; } }

  // ---------- la voiture « parfaite », puis la traversée ----------
  { const a = T.voiture - 0.12, z = inOut(T.zoom, T.zoom + 0.42, t);
    const p = pop(card2, t, a, T.zoom + 0.42, CX, 1110, { dy: 300, rx: 26, rx2: 5, ry2: -4 });
    if (p && z > 0) { card2.style.transform += ` scale(${(1 + z * 2).toFixed(3)})`; card2.style.filter = `blur(${(z * 22).toFixed(1)}px)`; card2.style.opacity = (1 - z).toFixed(3); }
    okP.forEach((e, i) => { pop(e, t, a + 0.45 + i * 0.3, T.zoom + 0.1, e._x, e._y, { pre: 'snappy', dy: 60, s0: 0.5, rx: 0, rot: e._r }); });
    // « parfaite. » grossit jusqu'à remplir l'écran (on passe à travers)
    parf.scale = 1 + Math.pow(z, 2.2) * 22; parf.box.style.transformOrigin = `400px ${parf.box.offsetHeight / 2}px`;
    if (z > 0) for (const w of parf.words) { w.e.style.filter = `blur(${(z * 16).toFixed(1)}px)`; w.e.style.opacity = (1 - smooth(0.55, 1, z)).toFixed(3); }
  }

  // ---------- logo + éclat ----------
  { const a = T.logo, b = T.colle + 0.15; const on = inWin(t, a, b); show(logo, on);
    if (on) { const p = spring(t - a, 'heavy'), q = spring(t - (b - 0.3), 'snappy');
      place(logo, CX, 980 - q * 260, (0.7 + 0.3 * p) * (1 - 0.45 * q), 0, clamp(p * 2 - q * 2, 0, 1), (1 - clamp(p, 0, 1)) * 16 + q * 10); }
    drawBurst(logoBurst, t, a + 0.04, CX, 980, 1, 0.7); }

  // ---------- coller l'annonce, cliquer ----------
  const tPaste = T.paste, tClick = T.clic;
  { const b = T.deux + 0.1;
    pop(pasteCard, t, T.colle - 0.1, b, CX, 930, { dy: 420, rx: 28, rx2: 7, ry2: -5 });
    pasteMask.style.top = (pasteCard.cards[0]._h * 0.28 + pasteCard.cards[0]._h * 0.72 * inOut(tPaste, tPaste + 0.45, t)).toFixed(1) + 'px'; pasteMask.style.height = pasteCard.cards[0]._h + 'px';
    pop(launch, t, T.colle + 0.15, b, CX, 1330, { dy: 200, rx: 18, rx2: 4, s: 1 - 0.05 * bump(t, tClick - 0.04, 0.12) });
    if (inWin(t, T.colle + 0.1, b)) { moveCursor(cur, t, [[T.colle + 0.1, 1100, 1550], [T.colle + 0.15, 760, 980], [tPaste + 0.45, 640, 1180], [tClick - 0.55, 470, 1338]], [tPaste - 0.12, tClick], T.colle + 0.1, b); curOn = true; clickAt = t < tClick - 0.05 ? [tPaste - 0.12, 760, 980] : [tClick, 470, 1338]; }
    drawBurst(clickBurst, t, tClick + 0.02, 470, 1338, 1); }

  // ---------- anneau ----------
  { const a = T.deux, b = T.note; const on = inWin(t, a - 0.05, b + 0.12); show(load, on);
    if (on) { const p = spring(t - a, 'default'), q = spring(t - (b - 0.2), 'snappy'); place3(load, CX, 1000, (0.7 + 0.3 * p) * (1 - 0.3 * q), 0, 0, 0, clamp(p * 2 - q * 2, 0, 1), q * 14);
      const k = clamp((t - a - 0.1) / (b - a - 0.35), 0, 1); ldR.setAttribute('stroke-dashoffset', (2 * Math.PI * 200 * (1 - k)).toFixed(1)); ldT.textContent = k < 0.5 ? '2' : k < 1 ? '1' : '✓'; } }

  // ---------- jauge 38 + tampon NO GO ----------
  { const a = T.note, b = T.dit; const on = inWin(t, a - 0.05, b + 0.12); show(gauge, on);
    if (on) { const p = spring(t - a, 'default'), q = spring(t - (b - 0.22), 'snappy'); place3(gauge, CX, 1000, (0.8 + 0.2 * p) * (1 - 0.3 * q), 0, 0, 0, clamp(p * 2 - q * 2, 0, 1), q * 14);
      const k = 0.38 * inOut(a + 0.1, a + 0.9, t); gR.setAttribute('stroke-dashoffset', (2 * Math.PI * 240 * (1 - k)).toFixed(1)); gT.textContent = Math.round(k * 100); }
    const so = inWin(t, T.nogo - 0.02, b + 0.12); show(stamp, so);
    if (so) { const s = spring(t - T.nogo, 'snappy'), q = spring(t - (b - 0.22), 'snappy'); place(stamp, CX, 1010, (2.3 - 1.3 * s) * (1 - 0.3 * q), -10, clamp(s * 3 - q * 2, 0, 1), q * 14); } }

  // ---------- la vraie carte, cercle tracé sur − 1 200 € ----------
  { const a = T.dit - 0.1, b = T.prix + 0.1; pop(golf, t, a, b, CX, 1010, { dy: 380, rx: 26, rx2: 6, drift: 0.03 });
    const tc = BR[11][1] - 0.2, on = inWin(t, tc, b); show(golfC, on);
    if (on) { place(golfC, CX + 112, 1112, 0.9, 0, 1 - smooth(b - 0.3, b, t)); golfC._p.setAttribute('stroke-dashoffset', (2000 - 1100 * inOut(tc, tc + 0.5, t)).toFixed(1)); } }

  // ---------- réglette ----------
  { const a = T.prix, b = T.sept; const on = inWin(t, a - 0.05, b + 0.12); show(ruler, on);
    if (on) { const p = spring(t - a, 'default'), q = spring(t - (b - 0.2), 'snappy'); place3(ruler, CX, 1060, 0.98 * (1 - 0.3 * q), 12 * (1 - p), 0, 0, clamp(p * 2 - q * 2, 0, 1), (1 - clamp(p, 0, 1)) * 10 + q * 14);
      rLim.setAttribute('stroke-dashoffset', (170 * (1 - inOut(a + 0.3, a + 0.8, t))).toFixed(1));
      const v = lerp(9500, 7500, inOut(T.slide, T.slide + 1.0, t)); rKnob.setAttribute('transform', `translate(${RX(v).toFixed(1)} 0)`); rKnobT.textContent = fmt(v).replace('+ ', ''); } }

  // ---------- 7 500 € géant ----------
  { const a = T.sept, b = T.clio; const on = inWin(t, a - 0.05, b + 0.1); show(g75, on); show(g75s, on);
    if (on) { const p = spring(t - a, { f: 2.2, z: 0.85 }), q = spring(t - (b - 0.22), 'snappy');
      const x = lerp(1500, CX, p) - (t - a) * 18, bl = Math.max(0, 1 - p) * 34 + q * 16;
      g75.style.transform = `translate(${(x - g75.offsetWidth / 2).toFixed(1)}px,${(960 - 125).toFixed(1)}px) scale(${(0.86 * (1 - 0.25 * q)).toFixed(4)})`;
      g75.style.filter = bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : ''; g75.style.opacity = clamp(p * 2 - q * 2, 0, 1).toFixed(3);
      const s2 = spring(t - (a + 0.35), 'default'); g75s.style.transform = `translate(0px,${(1140 + (1 - s2) * 40).toFixed(1)}px)`; g75s.style.opacity = clamp(s2 * 2 - q * 2, 0, 1).toFixed(3); }
    drawSpeed(speed, t, a - 0.05, a + 1.1, 960); drawBurst(numBurst, t, a + 0.28, CX, 990, 1, 0.75); }

  // ---------- radar, affaire, notification ----------
  { const a = T.clio, b = T.sais; const on = inWin(t, a - 0.05, b + 0.12); show(radar, on);
    if (on) { const p = spring(t - a, 'default'), q = spring(t - (b - 0.22), 'snappy'); place3(radar, CX, 1060, (0.8 + 0.2 * p) * (1 - 0.3 * q), 24 * (1 - p) + 10, 0, 0, clamp(p * 2 - q * 2, 0, 1), q * 14);
      rings.forEach((r, i) => { const k = ((t - a) * 0.6 + i / 3) % 1; r.setAttribute('r', (60 + k * 300).toFixed(1)); r.setAttribute('opacity', (1 - k).toFixed(2)); });
      const tl = T.cote + 0.55;
      DOTS.forEach((d, i) => { const s = spring(t - (a + 0.15 + i * 0.07), 'snappy'), hl = i === 4 ? bump(t, tl, 0.3) : 0, dim = i === 4 ? 0 : smooth(tl, tl + 0.3, t) * 0.6;
        d.setAttribute('transform', `translate(${d._x} ${d._y}) scale(${(clamp(s, 0, 1.2) * (1 + hl * 0.5)).toFixed(3)})`); d.setAttribute('opacity', (1 - dim).toFixed(2)); }); }
    pop(dealP, t, T.cote + 0.7, T.prem, 700, 1360, { pre: 'snappy', dy: 60, s0: 0.5, rx: 0, rot: -2 });
    pop(toast, t, T.prem, T.sais + 0.1, CX, 760, { pre: 'snappy', dy: -420, s0: 0.95, rx: 0 });
    pings.forEach((r, i) => { const on2 = inWin(t, T.prem + 0.3, T.sais); show(r, on2); if (on2) { const k = ((t - T.prem - 0.3 - i * 0.35) % 1.05 + 1.05) % 1.05; place(r, CX - 315, 760, 0.8 + k * 1.6, 0, (1 - k / 1.05) * 0.7); } }); }

  // ---------- « Pas après. » souligné ----------
  { const tu = BR[18][1] - 0.05, on = inWin(t, tu, T.cta); show(under, on);
    if (on) { place(under, CX, 1205, 1, 0, 1 - smooth(T.cta - 0.25, T.cta, t)); under._p.setAttribute('stroke-dashoffset', (2000 - 640 * inOut(tu, tu + 0.4, t)).toFixed(1)); } }

  // ---------- CTA ----------
  { const a = T.cta, on = t >= a - 0.05; for (const e of [lockE, ctaT, pDeb, pOu, pPro]) show(e, on);
    if (on) { const p = spring(t - a, 'heavy'), beat = Math.max(...[2.2, 1.4].map(d => bump(t, END - d, 0.16)));
      place(lockE, CX, 540 + (1 - p) * 50, (0.85 + 0.15 * p) * 0.9, 0, clamp(p * 2, 0, 1), (1 - clamp(p, 0, 1)) * 12);
      const c = spring(t - (a + 0.12), 'default'); ctaT.style.transform = `translate(0px,${(800 - ctaT.offsetHeight / 2 + (1 - c) * 50).toFixed(1)}px)`; ctaT.style.opacity = clamp(c * 2, 0, 1);
      const wD = pDeb.offsetWidth, wO = pOu.offsetWidth, wP = pPro.offsetWidth, gap = 26, tot = wD + wO + wP + 2 * gap, x0 = CX - tot / 2;
      const d = spring(t - (a + 0.3), 'snappy'), pr = spring(t - (a + 0.45), 'snappy'), o2 = spring(t - (a + 0.38), 'snappy');
      place(pDeb, x0 + wD / 2, 970 + (1 - d) * 60, (0.6 + 0.4 * d) * (1 - 0.1 * bump(t, T.deb - 0.04, 0.12)) * (1 + beat * 0.04), -2, clamp(d * 2, 0, 1));
      place(pOu, x0 + wD + gap + wO / 2, 970 + (1 - o2) * 40, 1, 0, clamp(o2 * 2, 0, 1));
      place(pPro, x0 + wD + wO + 2 * gap + wP / 2, 970 + (1 - pr) * 60, (0.6 + 0.4 * pr) * (1 - 0.1 * bump(t, T.pro - 0.04, 0.12)) * (1 + beat * 0.04), 2, clamp(pr * 2, 0, 1));
      const xd = x0 + wD / 2, xp = x0 + wD + wO + 2 * gap + wP / 2;
      if (t >= a + 0.3) { moveCursor(cur, t, [[a + 0.3, 1100, 1500], [a + 0.35, xd + 40, 1000], [T.deb + 0.35, xp + 20, 1000], [T.pro + 0.5, 760, 1210]], [T.deb, T.pro], a + 0.3, 1e9); curOn = true; clickAt = t < T.pro - 0.05 ? [T.deb, xd + 40, 1000] : [T.pro, xp + 20, 1000]; }
      drawBurst(debBurst, t, T.deb + 0.02, xd, 970, 1); drawBurst(proBurst, t, T.pro + 0.02, xp, 970, 1); }
    else { show(debBurst, false); show(proBurst, false); } }

  show(cur, curOn);
  { const on = clickAt && inWin(t, clickAt[0], clickAt[0] + 0.5); show(rip, !!on); if (on) { const k = (t - clickAt[0]) / 0.5; place(rip, clickAt[1], clickAt[2], 0.3 + k * 1.4, 0, (1 - k) * 0.9); } }
  demo.style.opacity = (HOOK === 'B' && t < H) || inWin(t, H, T.zoom) || inWin(t, T.note, T.sais) ? '1' : '0';
};

await document.fonts.ready;
await Promise.all([...document.querySelectorAll('img')].map(i => i.decode().catch(() => {})));
await document.fonts.load("800 150px 'Archivo'"); await document.fonts.load("italic 800 150px 'Archivo'"); await document.fonts.load("700 70px 'Archivo'");
// aucune ligne de texte plus large que la colonne 140 → 940 (800 px utiles, marge 20)
for (const C of CAPS) { const r = [...C.box.querySelectorAll('.w')].map(w => w.getBoundingClientRect()); const lines = {}; r.forEach(x => { const k = Math.round(x.top); lines[k] = [Math.min(lines[k]?.[0] ?? 1e9, x.left), Math.max(lines[k]?.[1] ?? -1e9, x.right)]; });
  const w = Math.max(...Object.values(lines).map(([a, b]) => b - a)); if (w > 760) C.box.style.fontSize = (parseFloat(getComputedStyle(C.box).fontSize) * 760 / w).toFixed(1) + 'px'; }
if (hk.giant) hk.gs = Math.min(1, 800 / hk.giant.offsetWidth);
window.seek(0);
window.filmReady = true;
