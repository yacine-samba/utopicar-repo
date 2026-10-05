// utopicar — MO4 : motion fluide de 15 s sans voix.
// Grammaire mesurée sur les 9 références (docs/ref_motion_fluide.md) : une chaîne sans coupe (annonce → champ → bouton →
// fiche → prix → point orange), une caméra 3D qui ne s'arrête jamais, un doigt qui mène l'histoire, des verbes courts en
// haut mot à mot, le prix à proposer qui sort de la carte, une traînée qui dessine le symbole, une fin qui rejoint le début.
// Vraie interface du site (Demo.tsx, formulaire /analyse, globals.css) et vraie annonce Clio analysée par l'outil.
// Contrat : window.seek(t) peint la frame t. window.shutter(t) donne l'ouverture de l'obturateur pour le flou de bougé
// (0 = image nette, 1 = ouvert sur toute la durée de l'image), lue par scripts/render.mjs quand MB est fixé (MB=8).
const { spring, track, clamp, lerp, noise } = Motion;
const { el, smooth } = Kit;
const TL = await (await fetch('../timeline-mo4.json')).json();
const E = TL.ev;
const stage = document.getElementById('stage');
const NB = ' ';
const P = {
  slow: { f: 0.45, z: 1 }, drift: { f: 0.32, z: 1 }, soft: { f: 1.5, z: 0.9 }, morph: { f: 1.9, z: 0.84 },
  fly: { f: 2.4, z: 0.86 }, word: { f: 2.6, z: 0.92 }, out: { f: 3.0, z: 1 }, snap: 'snappy', finger: { f: 2.3, z: 0.92 },
};
const S = (t, t0, p = 'default') => spring(t - t0, p);
const ease3 = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const euros = (v) => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NB) + NB + '€';
const mixRGB = (a, b, k) => `rgba(${a.map((v, i) => (i < 3 ? Math.round(v + (b[i] - v) * k) : (v + (b[i] - v) * k).toFixed(3))).join(',')})`;
const px = (v) => v.toFixed(2) + 'px';
function rect(e, r) { e.style.left = px(r.x); e.style.top = px(r.y); e.style.width = px(r.w); e.style.height = px(r.h); if (r.r != null) e.style.borderRadius = px(r.r); }
const R = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k), r: lerp(a.r, b.r, k) });
const addR = (a, b, c, k) => ({ x: a.x + (c.x - b.x) * k, y: a.y + (c.y - b.y) * k, w: a.w + (c.w - b.w) * k, h: a.h + (c.h - b.h) * k, r: a.r + (c.r - b.r) * k });
// transformation par le centre (espace écran ou monde) : x, y = position du centre
function put(e, x, y, { s = 1, r = 0, o = 1, blur = 0 } = {}) {
  e.style.transform = `translate(${px(x)},${px(y)}) translate(-50%,-50%) scale(${s.toFixed(4)}) rotate(${r.toFixed(3)}deg)`;
  e.style.opacity = clamp(o, 0, 1).toFixed(3);
  e.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
}
function fade(e, o, blur = 0, dy = 0, s = 1) {
  e.style.opacity = clamp(o, 0, 1).toFixed(3);
  e.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
  e.style.transform = dy || s !== 1 ? `translateY(${px(dy)}) scale(${s.toFixed(4)})` : '';
}

await Promise.all(['600 76px "Clash Display"', '500 31px "Satoshi"', '400 28px "Satoshi"', '700 33px "Satoshi"', 'italic 400 88px "Instrument Serif"']
  .map((f) => document.fonts.load(f)));

/* ================= fond : lumière orange qui suit le sujet ================= */
const glow = el('div', '', stage); glow.id = 'glow';

/* ================= monde (vraie interface), filmé par la caméra ================= */
const cam = el('div', '', stage); cam.id = 'cam';
const world = el('div', '', cam); world.id = 'world';
const annG = el('div', 'abs', world); Object.assign(annG.style, { width: '1080px', height: '1920px' });

// carte annonce (Demo.tsx, colonne de gauche), photo 2 de l'annonce (la Clio entière)
const annShell = el('div', 'shell', annG);
const annBody = el('div', '', annG); annBody.id = 'annBody';
annBody.innerHTML = `<div class="hdr"><span>Annonce Leboncoin</span><span>Particulier · Barcelonnette (04)</span></div>
<div class="slot"></div><h3>Renault Clio IV 0.9 TCe 90</h3><p class="prix num">${euros(6700)}</p>
<p class="infos">2013 · 57${NB}840 km · Essence · Manuelle</p>
<blockquote>«${NB}Seulement 57${NB}840 km, 2 pneus avant neufs. Distribution à contrôler. À signaler${NB}: un choc sur le passage de roue avant gauche. Vendu en l'état.${NB}»</blockquote>`;
const annPhoto = el('div', '', annG); annPhoto.id = 'annPhoto';
annPhoto.innerHTML = '<img src="../assets/demo/clio-2.webp" alt=""><span class="badge">3 photos</span>';
await annPhoto.querySelector('img').decode();

// formulaire /analyse : « Lien de l'annonce Leboncoin », champ, bouton « Analyser ce lien »
const lbl = el('div', '', world); lbl.id = 'lbl'; lbl.textContent = "Lien de l'annonce Leboncoin";
const field = el('div', '', world); field.id = 'field';
const sel = el('div', '', field); sel.id = 'sel';
const url = el('div', '', field); url.id = 'url'; url.textContent = 'https://www.leboncoin.fr/ad/voitures/…';

// le bouton devient la fiche : un seul objet
const fiche = el('div', 'shell', world); fiche.id = 'fiche';
const btnLbl = el('div', '', fiche); btnLbl.id = 'btnLbl'; btnLbl.textContent = 'Analyser ce lien';
const fhdr = el('div', 'fhdr', world);
fhdr.innerHTML = '<span>Fiche Utopicar</span><span><span id="enc">Analyse en cours…</span><span id="fin" style="position:absolute;right:0">Analyse terminée</span></span>';
fhdr.lastChild.style.position = 'relative';
const enc = fhdr.querySelector('#enc'), fin = fhdr.querySelector('#fin');
const ETAPES = ['Lecture du texte et des photos', 'Estimation de la cote du marché', 'Recherche des 38 défauts qui coûtent cher', 'Calcul du prix à proposer'];
const steps = ETAPES.map((s) => {
  const r = el('div', 'step', world);
  r.innerHTML = `<span class="c"><span class="burst"></span><span class="k">✓</span></span><span class="t">${s}</span>`;
  return { r, c: r.querySelector('.c'), k: r.querySelector('.k'), b: r.querySelector('.burst'), t: r.querySelector('.t') };
});
const res = el('div', '', world); res.id = 'res';
res.innerHTML = `<svg id="ring" viewBox="0 0 86 86"><circle cx="43" cy="43" r="38" fill="none" stroke="rgba(244,241,236,.1)" stroke-width="7"/>
<circle id="arc" cx="43" cy="43" r="38" fill="none" stroke="#3ecb7f" stroke-width="7" stroke-linecap="round" transform="rotate(-90 43 43)"/></svg>
<div id="ringTxt"><b class="num"><span id="score">0</span><small>/10</small></b><i>fiabilité</i></div>
<div id="rcol"><span class="pill" id="pill">Bon prix</span><p id="phrase">Moins chère que les Clio comparables, choc compris. Moteur de la liste fiable.</p><p id="moteur">Moteur 0.9 TCe 90${NB}: 8 / 10</p></div>`;
const ringSvg = res.querySelector('#ring'), ringTxt = res.querySelector('#ringTxt'), arc = res.querySelector('#arc'), score = res.querySelector('#score');
const pill = res.querySelector('#pill'), phrase = res.querySelector('#phrase'), moteur = res.querySelector('#moteur');
const CIRC = 2 * Math.PI * 38;
arc.setAttribute('stroke-dasharray', CIRC.toFixed(3));
const LIGNES = [
  { l: 'Cote du marché', s: '174 Clio IV comparables en vente', v: 7550, c: 'var(--ink)' },
  { l: 'Défauts repérés dans le texte', s: `Choc de carrosserie (150 à 700${NB}€)`, v: 425, c: 'var(--bad)', avant: '+' + NB },
  { l: 'Prix réel (prix + réparations)', s: 'Sous la cote', v: 7125, c: 'var(--ok)' },
  { l: 'Prix à proposer', s: 'Ouverture conseillée, sans vexer le vendeur', v: 6250, c: 'var(--o2)', cle: true },
];
const rows = LIGNES.map((L) => {
  const r = el('div', 'row' + (L.cle ? ' cle' : ''), world);
  r.innerHTML = `<span class="l">${L.l}<small>${L.s}</small></span><span class="v num" style="color:${L.c}">${(L.avant || '') + euros(L.v)}</span>`;
  return { r, v: r.querySelector('.v'), L };
});
const mention = el('div', '', world); mention.id = 'mention';
mention.textContent = "Vraie annonce Leboncoin du 3 octobre 2026, analysée par l'outil. Chiffres arrondis.";

/* ================= mise en page mesurée (caméra neutre) ================= */
const LIST = { x: 140, y: 450, w: 800, h: annBody.offsetHeight, r: 26 };
const slot = annBody.querySelector('.slot');
const SLOT = { x: 174, y: 450 + slot.offsetTop, w: 732, h: 510, r: 20 };
const FORM = { x: 140, y: 786, w: 800, h: 338, r: 26 };
const FIELD = { x: 174, y: 874, w: 732, h: 92, r: 16 };
const BTN = { x: 174, y: 990, w: 732, h: 100, r: 50 };
const ANA = { x: 140, y: 690, w: 800, h: 520, r: 26 };
const RES_TOP = 91, ROW0 = 331, ROWH = 112;
const RESULT = { x: 140, y: 470, w: 800, h: ROW0 + 4 * ROWH + 34, r: 26 };
const STEP0 = 104, STEPH = 96;
const urlW = url.offsetWidth;
// valeur de la ligne « Prix à proposer » : position dans la fiche finale
const keyV = rows[3].v;
rows.forEach((o) => { o.r.style.left = px(RESULT.x + 34); o.r.style.top = '0px'; });
const KEYV = { x: RESULT.x + 34 + 732 - 26 - keyV.offsetWidth / 2, y: RESULT.y + ROW0 + 3 * ROWH + ROWH / 2, fs: 46 };

/* ================= caméra ================= */
const CAM = {
  s: [[0, 1.0], [0.2, 1.09, { f: 0.28, z: 1 }], [1.98, 1.14, P.morph], [3.42, 1.0, P.morph], [3.6, 1.2, P.soft], [5.95, 1.08, P.morph], [6.35, 0.98, { f: 0.35, z: 1 }],
    [8.6, 1.06, { f: 0.4, z: 1 }], [9.45, 1.1, P.soft], [10.0, 0.86, P.soft], [10.5, 0.78, { f: 0.35, z: 1 }]],
  ry: [[0, -7], [0, 3, P.slow], [1.98, -3, P.morph], [3.42, 0, P.morph], [3.6, 9, P.soft], [5.95, -2, P.morph], [6.3, 2.2, P.drift], [9.45, 0, P.soft], [10.0, -4, P.soft]],
  rx: [[0, 10], [0, 2, P.slow], [1.98, 0, P.morph], [3.6, 5, P.soft], [5.95, 0, P.morph], [6.3, 1.5, P.drift], [9.45, 0, P.soft], [10.0, 3, P.soft]],
  rz: [[0, -2.2], [0.2, 1.4, { f: 0.28, z: 1 }], [3.6, -1.2, P.soft], [5.95, 0.8, P.morph], [6.35, -0.8, { f: 0.35, z: 1 }], [10.0, 1.2, P.soft]],
  cx: [[0, 540], [3.6, 505, P.soft], [5.95, 540, P.morph], [9.45, 568, P.soft], [10.0, 540, P.soft]],
  cy: [[0, 948], [1.98, 960, P.morph], [3.6, ANA.y + STEP0 + 23, P.soft], [3.75, ANA.y + STEP0 + 3 * STEPH + 50, { f: 0.3, z: 1 }], [5.95, RESULT.y + RES_TOP + 105 + 70, P.morph],
    ...E.rows.map((r, i) => [r, RESULT.y + (ROW0 + 34 + (i + 1) * ROWH) / 2 + 60, { f: 0.6, z: 1 }]), [9.45, KEYV.y - 40, P.soft], [10.0, 980, P.soft]],
};
const PERSP = 1800, D2R = Math.PI / 180;
const TAU = 2 * Math.PI;
function orbit(t) {
  return { ry: 6.5 * Math.sin(TAU * t / 5.2) + noise(23, t * 0.3) * 0.8, rx: 2.6 * Math.sin(TAU * t / 4.1 + 0.8) + noise(11, t * 0.35) * 0.6,
    rz: 1.0 * Math.sin(TAU * t / 6.3 + 2), x: 8 * Math.sin(TAU * t / 3.7 + 1.3), y: 28 * Math.sin(TAU * t / 4.6 + 0.4), s: 1 + 0.025 * Math.sin(TAU * t / 5.9 + 0.5) };
}
function camAt(t) {
  const c = {}; for (const k in CAM) c[k] = track(t, CAM[k]);
  // orbite permanente : la caméra ne s'arrête jamais (références : 39 à 64 % des images en panoramique, 51 à 73 % en zoom)
  const o = orbit(t);
  c.rx += o.rx; c.ry += o.ry; c.rz += o.rz; c.cx += o.x; c.cy += o.y; c.s *= o.s * 0.95;   // 5 % de marge pour l'orbite
  return c;
}
function camCSS(c) {
  return `translate(540px,960px) rotateX(${c.rx.toFixed(3)}deg) rotateY(${c.ry.toFixed(3)}deg) rotateZ(${c.rz.toFixed(3)}deg) scale(${c.s.toFixed(4)}) translate(${(-c.cx).toFixed(2)}px,${(-c.cy).toFixed(2)}px)`;
}
// projection d'un point du monde sur l'écran (même calcul que le CSS ci-dessus)
function project(c, x, y) {
  let X = (x - c.cx) * c.s, Y = (y - c.cy) * c.s, Z = 0;
  const z = c.rz * D2R, a = c.ry * D2R, b = c.rx * D2R;
  [X, Y] = [X * Math.cos(z) - Y * Math.sin(z), X * Math.sin(z) + Y * Math.cos(z)];
  [X, Z] = [X * Math.cos(a) + Z * Math.sin(a), -X * Math.sin(a) + Z * Math.cos(a)];
  [Y, Z] = [Y * Math.cos(b) - Z * Math.sin(b), Y * Math.sin(b) + Z * Math.cos(b)];
  const k = PERSP / (PERSP - Z);
  return { x: 540 + X * k, y: 960 + Y * k, k: k * c.s };
}

/* ================= espace écran : prix qui sort, fin, textes, doigt ================= */
const full = (e, o) => Object.assign(e.style, { width: '1080px', height: '1920px', transformOrigin: o });
const popG = el('div', 'abs', stage); full(popG, '540px 985px');
const popL = el('div', 'scr', popG); popL.id = 'popL'; popL.textContent = 'Prix à proposer';
const popV = el('div', 'scr num', popG); popV.id = 'popV'; popV.textContent = euros(6250);
const popA = el('div', 'scr', popG); popA.id = 'popA'; popA.textContent = `Prix affiché${NB}: ${euros(6700)}`;
// la fin a sa propre caméra (même orbite, décalée) : le plan final bouge aussi
const endG = el('div', 'abs', stage); full(endG, '540px 955px');

// fin : la dernière section de la page d'accueil (symbole, « Votre prochaine voiture, au bon prix », bouton)
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
const PATHS = {
  car: 'M292 1102 C380 1020 500 975 628 970 C760 880 880 828 1030 828 C1160 828 1280 868 1393 912 L1277 972 C1100 1000 880 1015 700 1017 C560 1019 450 1040 388 1102 Z',
  win: 'M710 970 C800 910 900 870 1020 870 C1100 870 1180 887 1242 905 C1216 929 1192 939 1170 942 C1030 960 860 970 710 970 Z',
  sw1: 'M1102 1102 L1297 1102 L1640 830 L1425 862 L1503 896 Z',
  sw2: 'M1490 997 L1553 946 C1561 962 1546 986 1552 1010 C1564 1048 1570 1080 1561 1103 L1554 1103 C1540 1062 1520 1030 1490 997 Z',
};
const SYMW = 560, SYMK = SYMW / 1348, SYMH = 295 * SYMK, SYMY = 690;
const SYMD = { y: 940, k: 760 / 560 };   // le symbole se dessine en grand au centre, puis remonte au-dessus du slogan
const sym = sv('svg', { id: 'sym', width: SYMW, height: SYMH.toFixed(2), viewBox: '292 818 1348 295' }, endG);
const defs = sv('defs', {}, sym);
const fl = sv('filter', { id: 'gl', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs); sv('feGaussianBlur', { stdDeviation: '9' }, fl);
const fillG = sv('g', {}, sym);
sv('path', { d: PATHS.car + ' ' + PATHS.win, fill: '#f4f1ec', 'fill-rule': 'evenodd' }, fillG);
sv('path', { d: PATHS.sw1, fill: '#ff5a1f' }, fillG); sv('path', { d: PATHS.sw2, fill: '#ff5a1f' }, fillG);
const TR = [['car', 11.14, 11.72], ['win', 11.44, 11.8], ['sw1', 11.56, 11.86], ['sw2', 11.63, 11.9]].map(([k, a, b]) => {
  const g = sv('path', { d: PATHS[k], fill: 'none', stroke: '#ff5a1f', 'stroke-width': 26, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'url(#gl)', opacity: 0.75 }, sym);
  const c = sv('path', { d: PATHS[k], fill: 'none', stroke: '#ffb38a', 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sym);
  const L = c.getTotalLength(); for (const p of [g, c]) p.setAttribute('stroke-dasharray', `${L.toFixed(1)} ${(L + 10).toFixed(1)}`);
  return { k, a, b, g, c, L };
});
const head = sv('circle', { r: 15, fill: '#fff4ec', filter: 'url(#gl)' }, sym);
const headCore = sv('circle', { r: 8, fill: '#ffffff' }, sym);

const kick = el('div', 'scr', endG); kick.innerHTML = '<span class="kicker">Première analyse offerte</span>';
const btnEnd = el('div', 'scr', endG); btnEnd.innerHTML = '<span class="btn-o">Estimer une affaire <span id="arr">→</span></span>';
const arr = btnEnd.querySelector('#arr'); arr.style.display = 'inline-block';
const urlEnd = el('div', 'scr', endG); urlEnd.id = 'urlEnd'; urlEnd.textContent = 'utopicar.fr';

// textes du haut, mot par mot ; *mot* = mot mis en avant (Instrument Serif italique dégradé), | = retour à la ligne
function mkCap(src, parent = stage) {
  const box = el('div', 'cap', parent); const words = [];
  for (const tok of src.split(' ')) {
    if (tok === '|') { el('br', '', box); continue; }
    const it = tok.startsWith('*'); const w = el('span', 'w' + (it ? ' it' : ''), box);
    w.textContent = tok.replace(/\*/g, '').replace(/_/g, NB); words.push(w); box.appendChild(document.createTextNode(' '));
  }
  box.words = words; return box;
}
const CAPS = [
  { b: mkCap('Bonne affaire | ou *piège_?*'), ts: E.hook, out: E.hookOut },
  { b: mkCap("Collez l'annonce."), ts: [E.colle, E.colle + 0.15], out: E.colleOut },
  { b: mkCap("L'outil vérifie tout."), ts: [E.verifie, E.verifie + 0.15, E.verifie + 0.3], out: E.verifieOut },
  { b: mkCap('Vous savez quoi | *proposer.*'), ts: [E.propose, E.propose + 0.15, E.propose + 0.3, E.propose + 0.5], out: E.proposeOut },
];
const slogan = mkCap('Votre prochaine | voiture, *au_bon_prix*', endG);
for (const c of [...CAPS.map((x) => x.b), slogan]) { const w = c.scrollWidth; if (w > 800) c.style.fontSize = (76 * 800 / w).toFixed(1) + 'px'; }
const CAPY = 330;
function capPaint(t, box, ts, tOut, y = CAPY, sc = 1) {
  const h = box.offsetHeight; box.style.top = px(y - h / 2);
  if (tOut != null) { const k = smooth(ts[0], tOut + 0.3, t); box.style.transform = `translateY(${px(-14 * k)}) scale(${(1 + 0.045 * k).toFixed(4)})`; }
  box.words.forEach((w, i) => {
    const p = S(t, ts[Math.min(i, ts.length - 1)], P.word);
    const q = tOut == null ? 0 : S(t, tOut + i * 0.04, P.out);
    const o = clamp(p * 1.5, 0, 1) * (1 - clamp(q * 1.4, 0, 1));
    w.style.opacity = o.toFixed(3);
    w.style.transform = `translateY(${px((1 - p) * 36 - q * 46)}) scale(${(sc * (0.94 + 0.06 * p)).toFixed(4)})`;
    const bl = (1 - clamp(p, 0, 1)) * 16 + q * 16; w.style.filter = bl > 0.1 ? `blur(${bl.toFixed(2)}px)` : '';
  });
}

// doigt : appui long (copier), toucher (coller), toucher (bouton)
const finger = el('div', '', stage); finger.id = 'finger';
const hold = sv('svg', { id: 'hold', viewBox: '0 0 120 120' }, stage);
const holdC = sv('circle', { cx: 60, cy: 60, r: 52, fill: 'none', stroke: '#ff5a1f', 'stroke-width': 6, 'stroke-linecap': 'round', transform: 'rotate(-90 60 60)' }, hold);
const HOLDL = 2 * Math.PI * 52; holdC.setAttribute('stroke-dasharray', HOLDL.toFixed(2));
const TAPS = [E.paste, E.tap];
const ripples = TAPS.map(() => el('div', 'ripple', stage));
const finger2 = el('div', 'finger', endG), ripple2 = el('div', 'ripple', endG);   // le doigt de la fin bouge avec la fin
const dot = el('div', '', endG); dot.id = 'dot';
const shock = el('div', '', stage); shock.id = 'shock';
const ENDY = { slogan: 893, kick: 1052, btn: 1176, url: 1302 };

/* ================= la frame t ================= */
function fingerAt(t, c) {
  const W = (x, y) => () => project(c, x, y), Sx = (x, y) => () => ({ x, y });
  const K = [[-1, Sx(990, 2060)], [E.finger, W(560, SLOT.y + 300)], [E.morph + 0.03, W(470, FIELD.y + 46)], [E.paste + 0.08, Sx(880, 1270)],
    [E.tap - 0.32, W(560, BTN.y + 50)], [E.tap + 0.14, Sx(1010, 1820)]];
  let p0 = K[0][1](), x = p0.x, y = p0.y;
  for (let i = 1; i < K.length; i++) { const a = K[i - 1][1](), b = K[i][1](), s = S(t, K[i][0], P.finger); x += (b.x - a.x) * s; y += (b.y - a.y) * s; }
  return { x, y };
}

function paint(t) {
  const c = camAt(t);
  world.style.transform = camCSS(c);

  /* --- lumière de fond --- */
  const gx = 540 + noise(5, t * 0.2) * 40, gy = track(t, [[0, 955], [3.45, 920, P.soft], [5.95, 880, P.morph], [10.0, 985, P.soft], [11.0, SYMD.y, P.soft], [E.symMove, SYMY + 40, P.morph], [14.45, 955, P.out]]);
  const gi = track(t, [[0, 1.0], [10.0, 1.3, P.snap], [10.6, 1.0, P.soft], [11.95, 1.25, P.snap], [12.4, 0.95, P.soft]]);
  put(glow, gx, gy, { s: 0.9 + 0.1 * gi, o: 0.75 * gi });

  /* --- ouverture : le point éclate, la carte jaillit --- */
  const born = S(t, -0.11, P.fly);
  const fly = 1 - born;
  annG.style.transformOrigin = '540px 955px';
  annG.style.transform = fly > 0.001 ? `perspective(1400px) rotateX(${(fly * 42).toFixed(3)}deg) rotateZ(${(-fly * 11).toFixed(3)}deg) scale(${(0.08 + 0.92 * born).toFixed(4)})` : '';
  const dIn = t < 7 ? 1 - smooth(-0.02, 0.22, t) : smooth(14.7, 14.95, t);
  const dEnd = t >= E.collapse - 0.02 && t < E.trail + 0.02 ? 1 : 0;
  const shockP = clamp((t + 0.09) / 0.55, 0, 1);
  const sr = 30 + 1100 * ease3(shockP); Object.assign(shock.style, { width: px(sr * 2), height: px(sr * 2) });
  put(shock, 540, 955, { o: (t < 1 ? (1 - shockP) * 0.85 : 0) });

  /* --- carte annonce → formulaire --- */
  const m = S(t, E.morph, P.morph);
  const press = S(t, E.press, P.snap) - S(t, E.morph - 0.02, P.snap);
  const shellR = R(LIST, FORM, m);
  rect(annShell, shellR);
  const recede = S(t, E.expand + 0.05, P.soft);
  const formO = 1 - recede;
  annShell.style.opacity = formO.toFixed(3);
  const holdS = 1 - 0.025 * clamp(press, 0, 1);
  annG.style.transform = annG.style.transform || (holdS < 0.9999 ? `scale(${holdS.toFixed(4)})` : '');
  const bodyK = clamp(m * 2.6, 0, 1);
  fade(annBody, 1 - bodyK, bodyK * 12, -bodyK * 30);
  rect(annPhoto, R(SLOT, FIELD, m));
  annPhoto.style.opacity = (1 - smooth(0.45, 0.85, m)).toFixed(3);
  annPhoto.querySelector('.badge').style.opacity = (1 - clamp(m * 3, 0, 1)).toFixed(3);
  // libellé, champ, collage
  const fIn = S(t, E.morph + 0.12, P.soft);
  fade(lbl, fIn * formO, (1 - fIn) * 8 + recede * 6, (1 - fIn) * 18);
  field.style.opacity = (smooth(0.3, 0.8, m) * formO).toFixed(3);
  field.style.filter = recede > 0.01 ? `blur(${(recede * 6).toFixed(2)}px)` : '';
  const pst = clamp((t - E.paste - 0.02) / 0.2, 0, 1);
  url.style.clipPath = `inset(0 ${((1 - ease3(pst)) * 100).toFixed(2)}% 0 0)`;
  const selO = pst > 0 ? 1 - smooth(E.paste + 0.35, E.paste + 0.55, t) : 0;
  sel.style.width = px(urlW + 8); sel.style.opacity = selO.toFixed(3); sel.style.clipPath = url.style.clipPath;
  url.style.color = mixRGB([244, 241, 236, 1], [22, 9, 4, 1], selO);

  /* --- bouton → fiche (analyse) → fiche (résultat) --- */
  const bIn = S(t, E.paste - 0.03, P.soft);
  const en = S(t, E.enable, P.snap);
  const p1 = S(t, E.expand, P.morph), p2 = S(t, E.result, { f: 1.6, z: 0.86 });
  const RH = ROW0 + 34 + ROWH * E.rows.reduce((a, r) => a + S(t, r - 0.04, P.soft), 0);
  let FR = addR(BTN, BTN, ANA, p1); FR = addR(FR, ANA, { ...RESULT, h: ROW0 + 34 }, p2); FR.h += (RH - (ROW0 + 34)) * (p2 > 0.001 ? 1 : 0);
  const tapB = clamp(S(t, E.tap - 0.04, P.snap) - S(t, E.tap + 0.08, P.snap), 0, 1);
  if (p1 < 0.001) { const k = 1 - 0.04 * tapB; FR = { x: BTN.x + BTN.w * (1 - k) / 2, y: BTN.y + BTN.h * (1 - k) / 2 + (1 - bIn) * 24, w: BTN.w * k, h: BTN.h * k, r: BTN.r * k }; }
  rect(fiche, FR);
  const colP = clamp(p1 * 1.4, 0, 1);
  const btnBg = mixRGB([244, 241, 236, 0.05], [255, 90, 31, 1], en);
  fiche.style.background = p1 > 0.001 ? mixRGB([255, 90, 31, 1], [22, 16, 12, 0.86], colP) : btnBg;
  fiche.style.borderColor = p1 > 0.001 ? mixRGB([255, 90, 31, 1], [244, 241, 236, 0.1], colP) : mixRGB([244, 241, 236, 0.2], [255, 90, 31, 1], en);
  fiche.style.boxShadow = p1 > 0.001 ? 'none' : `0 26px 75px -26px rgba(255,90,31,${(0.85 * en).toFixed(3)})`;
  fiche.style.opacity = (t < E.paste - 0.1 ? 0 : clamp(bIn * 1.6, 0, 1)).toFixed(3);
  btnLbl.style.color = mixRGB([244, 241, 236, 0.62], [22, 9, 4, 1], en);
  btnLbl.style.opacity = (1 - clamp(p1 * 4, 0, 1)).toFixed(3);
  btnLbl.style.top = px((FR.h - 100) / 2);
  // en-tête de la fiche
  const hIn = S(t, E.expand + 0.06, P.soft);
  fhdr.style.left = px(FR.x + 34); fhdr.style.top = px(FR.y + 34);
  const foc = S(t, E.focus, P.soft), dimO = 1 - 0.62 * foc;
  fade(fhdr, hIn * dimO, (1 - hIn) * 8, (1 - hIn) * 14);
  const sw = S(t, E.result, P.snap);
  enc.style.opacity = (1 - sw).toFixed(3); fin.style.opacity = sw.toFixed(3);
  // les 4 vraies étapes, une par temps
  steps.forEach((s, i) => {
    const ci = E.steps[i], a = ci - 0.5;
    const sIn = S(t, E.expand + 0.1 + i * 0.06, P.soft);
    const sOut = S(t, E.result + i * 0.035, P.out);
    s.r.style.left = px(FR.x + 34); s.r.style.top = px(FR.y + STEP0 + i * STEPH);
    fade(s.r, sIn * (1 - sOut), (1 - sIn) * 8 + sOut * 10, (1 - sIn) * 20 - sOut * 40);
    const done = S(t, ci, P.snap), active = t >= a && t < ci;
    const pulse = active ? 0.55 + 0.45 * Math.cos(2 * Math.PI * (t - a) * 1.6) : 1;
    s.c.style.borderColor = done > 0.02 ? mixRGB([255, 90, 31, 1], [62, 203, 127, 1], done) : active ? `rgba(255,90,31,${pulse.toFixed(3)})` : 'rgba(244,241,236,.2)';
    s.c.style.background = `rgba(62,203,127,${(0.2 * done).toFixed(3)})`;
    s.k.style.color = '#3ecb7f'; s.k.style.opacity = clamp(done, 0, 1).toFixed(3); s.k.style.transform = `scale(${(0.4 + 0.6 * done).toFixed(4)})`;
    s.k.style.display = 'inline-block';
    const bp = clamp((t - ci) / 0.45, 0, 1); s.b.style.transform = `scale(${(1 + 1.6 * ease3(bp)).toFixed(4)})`; s.b.style.opacity = (bp > 0 && bp < 1 ? 0.9 * (1 - bp) : 0).toFixed(3);
    s.t.style.color = done > 0.5 ? 'rgba(244,241,236,.8)' : active ? '#f4f1ec' : 'rgba(244,241,236,.37)';
  });
  // résultat : anneau, verdict, lignes
  const rIn = S(t, E.ring, P.soft);
  res.style.left = px(FR.x + 34); res.style.top = px(FR.y + RES_TOP);
  res.style.opacity = t < E.result ? '0' : dimO.toFixed(3);
  const rk = ease3((t - E.ring - 0.15) / 1.3), sc = 8 * rk;
  ringSvg.style.opacity = ringTxt.style.opacity = clamp(rIn * 1.4, 0, 1).toFixed(3);
  ringSvg.style.transform = ringTxt.style.transform = `scale(${(0.86 + 0.14 * rIn).toFixed(4)})`;
  arc.setAttribute('stroke-dashoffset', (CIRC * (1 - sc / 10)).toFixed(3));
  score.textContent = String(Math.round(sc));
  const pl = S(t, E.pill, P.snap); pill.style.opacity = clamp(pl * 1.5, 0, 1).toFixed(3); pill.style.transform = `scale(${(0.6 + 0.4 * pl).toFixed(4)})`; pill.style.transformOrigin = '0 50%';
  const ph = S(t, E.phrase, P.soft); fade(phrase, ph, (1 - ph) * 8, (1 - ph) * 14);
  const mo = S(t, E.moteur, P.soft); fade(moteur, mo, (1 - mo) * 6, (1 - mo) * 10);
  const popK = S(t, E.pop, P.fly);
  rows.forEach((o, i) => {
    const ri = E.rows[i], k = S(t, ri, P.soft);
    o.r.style.left = px(FR.x + 34); o.r.style.top = px(FR.y + ROW0 + i * ROWH);
    fade(o.r, t < E.result ? 0 : k * (o.L.cle ? 1 : dimO), (1 - k) * 8, (1 - k) * 34);
    if (o.L.cle) { o.r.style.background = `rgba(255,90,31,${(0.1 + 0.12 * foc).toFixed(3)})`; o.r.style.boxShadow = `inset 0 0 0 2px rgba(255,90,31,${(0.5 * foc).toFixed(3)})`; }
    const v = o.L.v * ease3((t - ri - 0.1) / 1.0);
    o.v.textContent = (o.L.avant || '') + euros(v);
    if (o.L.cle) o.v.style.opacity = popK > 0.001 ? '0' : '1';
  });
  mention.style.top = px(FR.y + FR.h + 30);
  const mn = S(t, E.mention, P.soft); fade(mention, t < E.result ? 0 : mn * dimO, (1 - mn) * 6, (1 - mn) * 10);

  // la fiche recule quand le prix sort, puis disparaît
  const dim = S(t, E.pop, P.soft), gone = S(t, E.collapse, P.out);
  world.style.opacity = ((1 - 0.84 * dim) * (1 - gone)).toFixed(3);

  /* --- le prix à proposer sort de la carte, puis dérive doucement --- */
  const pd = smooth(E.pop + 0.25, E.collapse, t);
  popG.style.transform = pd > 0.001 ? `translateY(${px(-18 * pd)}) scale(${(1 + 0.14 * pd).toFixed(4)}) rotate(${(1.2 * pd).toFixed(3)}deg)` : '';
  const kp = project(c, KEYV.x, KEYV.y);
  const col = S(t, E.collapse, P.out);
  const vx = lerp(kp.x, 540, popK), vy = lerp(kp.y, 985, popK) * (1 - col) + 985 * col;
  const vs = lerp(KEYV.fs * kp.k / 150, 1, popK) * (1 - col * 0.97);
  put(popV, vx, vy, { s: vs, o: t < E.pop ? 0 : 1 - smooth(0.85, 1, col), blur: col * 10 });
  const la = S(t, E.pop + 0.15, P.soft), lb = S(t, E.affiche, P.soft);
  put(popL, 540, 868 - (1 - la) * 20, { o: la * (1 - col * 1.3), blur: (1 - la) * 10 + col * 12 });
  put(popA, 540, 1100 + (1 - lb) * 20, { o: lb * (1 - col * 1.3), blur: (1 - lb) * 10 + col * 12 });

  /* --- point orange, traînée, symbole --- */
  const symL = 540 - SYMW / 2, symT = SYMY - SYMH / 2;
  sym.style.left = px(symL); sym.style.top = px(symT);
  const mv = S(t, E.symMove, P.morph), symY = lerp(SYMD.y, SYMY, mv), symK = lerp(SYMD.k, 1, mv);
  const st = { x: 540 - SYMW * SYMD.k / 2, y: SYMD.y - SYMH * SYMD.k / 2 + (1102 - 818) * SYMK * SYMD.k };
  const toStart = S(t, E.collapse + 0.06, P.fly);
  if (dIn > 0.001) put(dot, 540, 955, { s: 0.6 + 0.6 * dIn, o: dIn });
  else if (dEnd) put(dot, lerp(540, st.x, toStart), lerp(985, st.y, toStart), { s: clamp(S(t, E.collapse, P.snap), 0, 1.2), o: 1 });
  else put(dot, 540, 955, { o: 0 });
  let hx = null, hy = null;
  for (const tr of TR) {
    const k = ease3((t - tr.a) / (tr.b - tr.a));
    const off = (tr.L * (1 - k)).toFixed(1);
    tr.g.setAttribute('stroke-dashoffset', off); tr.c.setAttribute('stroke-dashoffset', off);
    const so = t < tr.a ? 0 : 1 - smooth(E.fill + 0.02, E.fill + 0.32, t);
    tr.g.setAttribute('opacity', (0.75 * so).toFixed(3)); tr.c.setAttribute('opacity', so.toFixed(3));
    if (t >= tr.a && t < tr.b) { const q = tr.c.getPointAtLength(tr.L * k); hx = q.x; hy = q.y; }
  }
  const hv = hx != null && t < E.fill;
  head.setAttribute('opacity', hv ? '1' : '0'); headCore.setAttribute('opacity', hv ? '1' : '0');
  if (hv) { head.setAttribute('cx', hx.toFixed(1)); head.setAttribute('cy', hy.toFixed(1)); headCore.setAttribute('cx', hx.toFixed(1)); headCore.setAttribute('cy', hy.toFixed(1)); }
  const fp = S(t, E.fill, P.snap);
  fillG.setAttribute('opacity', clamp(fp * 1.3, 0, 1).toFixed(3));

  /* --- fin : slogan, offre, bouton, adresse ; tout se replie dans le point --- */
  const out = S(t, E.out, P.out);
  const ea = smooth(E.collapse, E.collapse + 0.9, t) * (1 - out), eo = orbit(t + 3.1);
  endG.style.transform = ea > 0.001 ? `perspective(1600px) rotateX(${(eo.rx * ea).toFixed(3)}deg) rotateY(${(eo.ry * ea).toFixed(3)}deg) rotateZ(${(eo.rz * ea).toFixed(3)}deg) translate(${px(eo.x * ea)},${px(eo.y * 0.8 * ea)}) scale(${(1 + (eo.s - 1) * ea).toFixed(4)})` : '';
  const endS = (1 + 0.09 * smooth(E.collapse + 0.3, E.out + 0.3, t)) * (1 - out * 0.96);
  const endPt = (x, y) => ({ x: 540 + (x - 540) * endS, y: 955 + (y - 955) * endS });
  const sp = endPt(540, symY);
  sym.style.transformOrigin = '50% 50%';
  sym.style.transform = `translate(${px(sp.x - 540)},${px(sp.y - SYMY)}) scale(${(endS * symK * (0.965 + 0.035 * fp)).toFixed(4)})`;
  sym.style.opacity = (t < E.trail - 0.05 ? 0 : 1 - smooth(0.7, 1, out)).toFixed(3);
  sym.style.filter = out > 0.01 ? `blur(${(out * 8).toFixed(2)}px)` : '';
  capPaint(t, slogan, E.slogan, null, ENDY.slogan);
  slogan.style.transformOrigin = `400px ${px(955 - parseFloat(slogan.style.top))}`;
  slogan.style.transform = `scale(${endS.toFixed(4)})`;
  slogan.style.opacity = (1 - smooth(0.6, 1, out)).toFixed(3);
  const ki = S(t, E.kicker, P.soft), bi = S(t, E.button, P.soft), ui = S(t, E.url, P.soft);
  const kp2 = endPt(540, ENDY.kick), bp2 = endPt(540, ENDY.btn), up2 = endPt(540, ENDY.url);
  const tapE = clamp(S(t, E.tapEnd - 0.04, P.snap) - S(t, E.tapEnd + 0.09, P.snap), 0, 1);
  put(kick, kp2.x, kp2.y + (1 - ki) * 22, { s: endS * (0.92 + 0.08 * ki), o: ki * (1 - smooth(0.6, 1, out)), blur: (1 - ki) * 10 + out * 8 });
  put(btnEnd, bp2.x, bp2.y + (1 - bi) * 26, { s: endS * (0.94 + 0.06 * bi) * (1 - 0.04 * tapE), o: bi * (1 - smooth(0.6, 1, out)), blur: (1 - bi) * 10 + out * 8 });
  arr.style.transform = `translateX(${px(10 * clamp(S(t, E.tapEnd + 0.05, P.snap) - S(t, E.tapEnd + 0.45, 'default'), 0, 1))})`;
  put(urlEnd, up2.x, up2.y + (1 - ui) * 18, { s: endS, o: ui * (1 - smooth(0.6, 1, out)), blur: (1 - ui) * 10 + out * 8 });

  /* --- textes du haut --- */
  for (const k of CAPS) capPaint(t, k.b, k.ts, k.out);

  /* --- doigt --- */
  const fv = clamp(smooth(E.finger, E.finger + 0.12, t) - smooth(E.tap + 0.18, E.tap + 0.4, t), 0, 1);
  const fp2 = fingerAt(t, c);
  const tapF = TAPS.reduce((mx, T) => Math.max(mx, clamp(S(t, T - 0.05, P.snap) - S(t, T + 0.07, P.snap), 0, 1)), 0);
  const holdK = clamp((t - E.press) / 0.2, 0, 1) * (1 - smooth(E.morph, E.morph + 0.08, t));
  put(finger, fp2.x, fp2.y, { s: 1 - 0.16 * Math.max(tapF, holdK > 0 ? 1 : 0), o: fv });
  put(hold, fp2.x, fp2.y, { o: holdK > 0 ? 1 : 0 });
  holdC.setAttribute('stroke-dashoffset', (HOLDL * (1 - ease3(holdK))).toFixed(2));
  TAPS.forEach((T, i) => {
    const q = clamp((t - T) / 0.5, 0, 1), d = 70 + 200 * ease3(q), at = fingerAt(T, camAt(T));
    const r = ripples[i]; Object.assign(r.style, { width: px(d), height: px(d), marginLeft: px(-d / 2), marginTop: px(-d / 2) });
    r.style.transform = `translate(${px(at.x)},${px(at.y)})`; r.style.opacity = (q > 0 && q < 1 ? 0.9 * (1 - q) : 0).toFixed(3);
  });
  // doigt de la fin (dans le repère de la fin) : entre, touche « Estimer une affaire », repart
  const f2 = track(t, [[0, 1010], [E.tapEnd - 0.4, 540, P.finger], [E.tapEnd + 0.16, 1010, P.finger]]);
  const f2y = track(t, [[0, 1840], [E.tapEnd - 0.4, ENDY.btn + 4, P.finger], [E.tapEnd + 0.16, 1840, P.finger]]);
  const fv2 = clamp(smooth(E.tapEnd - 0.42, E.tapEnd - 0.3, t) - smooth(E.tapEnd + 0.2, E.tapEnd + 0.42, t), 0, 1);
  const tap2 = clamp(S(t, E.tapEnd - 0.05, P.snap) - S(t, E.tapEnd + 0.07, P.snap), 0, 1);
  put(finger2, f2, f2y, { s: 1 - 0.16 * tap2, o: fv2 });
  const q2 = clamp((t - E.tapEnd) / 0.5, 0, 1), d2 = 70 + 200 * ease3(q2);
  Object.assign(ripple2.style, { width: px(d2), height: px(d2), marginLeft: px(-d2 / 2), marginTop: px(-d2 / 2) });
  ripple2.style.transform = `translate(540px,${px(ENDY.btn + 4)})`; ripple2.style.opacity = (q2 > 0 && q2 < 1 ? 0.9 * (1 - q2) : 0).toFixed(3);
}

const fast = (t) => { let s = 0; for (const [a, b, v] of TL.shutter) s = Math.max(s, v * smooth(a - 0.05, a + 0.05, t) * (1 - smooth(b - 0.05, b + 0.05, t))); return s; };
window.shutter = (t) => Math.max(TL.shutterBase || 0, fast(t));
// sous-images distinctes par image : 8 sur les gestes rapides, 4 ailleurs (la caméra bouge toujours)
window.samples = (t) => (fast(t) > 0.3 ? 8 : 4);
window.seek = (t) => { paint(t); };
paint(0);
window.filmReady = true;
