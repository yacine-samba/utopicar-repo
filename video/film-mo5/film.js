// MO5 « 47 € » (29,6 s). Contrat : window.seek(t) peint la frame t, sans état entre les frames.
// window.shutter(t) / window.samples(t) : flou de bougé au rendu (MB=4).
// Minutage calé sur la voix (audio/vo-mo5/vo-timing.json) : chaque geste tombe sur le mot qui le nomme.
(async function () {
  const { spring, track, clamp, lerp, noise } = Motion;
  const stage = document.getElementById('stage');
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, cls, parent, style) => { const e = document.createElement(tag); if (cls) e.className = cls; if (style) e.setAttribute('style', style); (parent || stage).appendChild(e); return e; };
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const S = (t, t0, p) => spring(t - t0, p);
  const sm = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const f3 = (x) => x.toFixed(3);
  const DUR = 29.6;
  const P = {
    pen: { f: 1.05, z: 1 }, draw: { f: 1.35, z: 1 }, rise: { f: 1.9, z: 1 }, card: { f: 2.2, z: 0.78 }, soft: { f: 0.32, z: 1 },
    heavy: 'heavy', flip: { f: 2.4, z: 0.82 }, roll: { f: 1.7, z: 0.95 }, tag: { f: 2.0, z: 0.66 }, push: { f: 0.95, z: 1 }, drift: { f: 0.28, z: 1 },
  };

  await Promise.all([
    document.fonts.load('700 150px Clash'), document.fonts.load('600 50px Clash'), document.fonts.load('500 22px Satoshi'),
    document.fonts.load('700 34px Satoshi'), document.fonts.load('italic 230px Fraunces'),
  ]);

  // ---------- vidéos des cartes (30 i/s, préchargées) ----------
  const SEQ = { signe: 150, ct: 150, ct2: 120, pneu: 120, moteur: 120, moteur2: 90, lavage: 120, essence: 120, route: 120, batterie: 120, phone: 120, nuit: 120, calc: 150 };
  const IMG = {};
  const load = (src, tries = 4) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => (tries > 1 ? load(src, tries - 1).then(res, rej) : rej(new Error(src))); im.src = src; });
  for (const [k, n] of Object.entries(SEQ)) { IMG[k] = []; for (let i = 0; i < n; i++) IMG[k].push(await load(`../film-mo5da/seq/${k}/${String(i + 1).padStart(3, '0')}.jpg`)); }
  const polo = await load('../assets/photos-mo5/polo-cut.png');
  const coins = await load('frames/22168.jpg');
  function drawSeq(cv, key, tt) {
    const fr = IMG[key], n = fr.length; let i = Math.max(0, Math.floor(tt * 30)); const c = i % (2 * n - 2); i = c < n ? c : 2 * n - 2 - c;
    const im = fr[i], ctx = cv.getContext('2d'); const r = Math.max(cv.width / im.width, cv.height / im.height);
    const w = im.width * r, h = im.height * r; ctx.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
  }

  // ---------- temps du récit : il avance, puis se rembobine (20,9 → 22,3 s) jusqu'à la voiture garée, sans étiquettes ----------
  const REW = [20.9, 22.3], ST_FROM = 18.6, ST_TO = 5.9;
  const story = (t) => {
    if (t < REW[0]) return t;
    if (t < REW[1]) { const u = (t - REW[0]) / (REW[1] - REW[0]); const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; return lerp(ST_FROM, ST_TO, e); }
    return ST_TO;
  };
  const LOOP = 27.45; // retour vers l'image 0
  const back = (t) => sm(LOOP, LOOP + 1.3, t);

  // ---------- caméras (travellings) ----------
  const ID = { rx: 0, ry: 0, z: 0, x: 0, y: 0, f: 0 };
  const mixCam = (a, b, w) => { const o = {}; for (const k in ID) o[k] = lerp(a[k], b[k], w); return o; };
  // A : suit le trait de lumière, recule, glisse en arc vers le « ? »
  function camA(t) {
    return {
      rx: track(t, [[0, 10], [1.3, 7, { f: 0.5, z: 1 }], [2.5, 4, { f: 0.35, z: 1 }]]) + noise(1, t * 0.45) * 0.5,
      ry: track(t, [[0, -12], [0.2, -4, { f: 0.45, z: 1 }], [2.5, 7, { f: 0.3, z: 1 }]]) + noise(2, t * 0.4) * 0.7,
      z: track(t, [[0, 130], [1.35, -30, { f: 0.6, z: 1 }], [2.55, 140, { f: 0.35, z: 1 }]]),
      x: track(t, [[0, -100], [0.25, 150, { f: 0.6, z: 1 }], [1.4, 0, { f: 0.6, z: 1 }], [2.55, 70, { f: 0.35, z: 1 }]]),
      y: track(t, [[0, -120], [0.7, 120, { f: 0.6, z: 1 }], [1.4, 0, { f: 0.6, z: 1 }], [2.55, 90, { f: 0.35, z: 1 }]]), f: 0 };
  }
  // B : glisse le long des palettes « JOUR 1 »
  function camB(t) {
    return { rx: 4 + noise(3, t * 0.4) * 0.4, ry: track(t, [[4.0, -9], [4.05, 7, { f: 0.5, z: 1 }]]) + noise(4, t * 0.35) * 0.6,
      z: track(t, [[4.0, 0], [4.85, 700, P.push]]), x: track(t, [[4.0, -150], [4.05, 150, { f: 0.55, z: 1 }]]), y: 0, f: 0 };
  }
  // la Polo entre par la droite et freine (ressort critique : vite, puis de plus en plus doux)
  const carX = (st) => track(st, [[0, 1350], [4.85, 0, { f: 1.15, z: 1 }]]);
  // C : accompagne la voiture, remonte le long de la pile, glisse pendant l'attente, se rapproche à la revente
  function camC(st) {
    return {
      rx: track(st, [[4.7, 10], [4.7, 5, P.drift], [12.0, 8, { f: 0.3, z: 1 }], [15.7, 4, { f: 0.4, z: 1 }]]) + noise(5, st * 0.4) * 0.4,
      ry: track(st, [[4.7, -14], [4.7, -4, P.drift], [6.6, 3, { f: 0.22, z: 1 }], [12.0, -6, { f: 0.25, z: 1 }], [15.7, 2, { f: 0.4, z: 1 }]]) + noise(6, st * 0.35) * 0.6,
      z: track(st, [[4.7, -260], [4.7, 0, { f: 0.55, z: 1 }], [6.6, 90, { f: 0.25, z: 1 }], [12.0, 30, { f: 0.3, z: 1 }], [15.7, 160, { f: 0.4, z: 1 }]]),
      x: 0.32 * carX(st) + track(st, [[6.0, 0], [6.0, -40, { f: 0.25, z: 1 }], [12.0, 60, { f: 0.25, z: 1 }], [15.7, 0, { f: 0.4, z: 1 }]]),
      y: track(st, [[5.9, 0], [6.0, -110, { f: 0.28, z: 1 }], [12.0, 0, { f: 0.3, z: 1 }], [15.7, -60, { f: 0.4, z: 1 }]]), f: 0 };
  }
  // F : orbite lente qui descend le long de la formule pendant qu'elle s'écrit
  function camF(t) {
    return { rx: track(t, [[22.3, 8], [22.3, 3, { f: 0.3, z: 1 }]]) + noise(9, t * 0.4) * 0.4, ry: track(t, [[22.3, -12], [22.3, 6, { f: 0.22, z: 1 }]]) + noise(10, t * 0.35) * 0.5,
      z: track(t, [[22.3, -120], [22.3, 90, { f: 0.3, z: 1 }]]), x: track(t, [[22.3, 40], [22.3, -20, { f: 0.3, z: 1 }]]), y: track(t, [[22.3, -100], [22.3, 80, { f: 0.22, z: 1 }]]), f: 0 };
  }
  const tf = (c, z, extra = '') => `perspective(1700px) translateZ(${f3(c.z)}px) rotateX(${f3(c.rx)}deg) rotateY(${f3(c.ry)}deg) translate3d(${f3(-c.x)}px,${f3(-c.y)}px,${f3(z)}px) ${extra}`;
  const dof = (c, z) => clamp(Math.abs(z + c.z - c.f) * 0.008, 0, 9);

  // ---------- fonds ----------
  const bgA = el('div', 'L', stage);
  const bgImg = el('div', 'abs', bgA, `left:-160px;top:-260px;width:1400px;height:2440px;background:url(${coins.src}) center/cover;filter:blur(16px) brightness(.85) saturate(1.2)`);
  el('div', 'abs', bgA, 'left:0;top:0;width:1080px;height:1920px;background:radial-gradient(62% 40% at 50% 48%,rgba(8,7,10,.2),rgba(8,7,10,.93))');
  const bgC = el('div', 'L', stage, 'background:radial-gradient(70% 50% at 50% 62%,#1d1520,#08070a 75%)');
  const cone = el('div', 'abs', bgC, 'left:-210px;top:-300px;width:1500px;height:1500px;background:conic-gradient(from 180deg at 50% 0%,transparent 160deg,rgba(255,138,76,.10) 175deg,rgba(255,179,138,.17) 180deg,rgba(255,138,76,.10) 185deg,transparent 200deg);filter:blur(30px);mix-blend-mode:screen');
  const floor = el('div', 'abs', bgC, 'left:-300px;top:1500px;width:1680px;height:900px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.055) 0 2px,transparent 2px 120px),repeating-linear-gradient(0deg,rgba(255,255,255,.055) 0 2px,transparent 2px 120px);transform:perspective(900px) rotateX(72deg);transform-origin:50% 0;-webkit-mask-image:linear-gradient(transparent,#000 30%,#000 60%,transparent)');
  const glowC = el('div', 'glow', bgC, 'left:90px;top:1180px;width:900px;height:420px;background:radial-gradient(closest-side,rgba(255,110,40,.42),transparent)');
  const night = el('div', 'L', bgC, 'background:linear-gradient(180deg,rgba(30,50,110,.55),rgba(12,18,45,.35) 60%,rgba(8,7,10,.2))');   // l'attente : la nuit tombe
  const nightCv = el('canvas', 'abs', bgC, 'left:-200px;top:-200px;width:1480px;height:1100px;filter:blur(14px) brightness(.5) saturate(.6);-webkit-mask-image:radial-gradient(60% 55% at 50% 45%,#000,transparent)'); nightCv.width = 400; nightCv.height = 300;

  // ---------- couche A : le calcul écrit à la lumière ----------
  const LA = el('div', 'L', stage);
  const glowA = el('div', 'glow', LA, 'left:170px;top:760px;width:740px;height:560px;background:radial-gradient(closest-side,rgba(255,100,40,.55),transparent)');
  const svgA = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LA);
  const defs = sv('defs', {}, svgA);
  const sheen = sv('linearGradient', { id: 'sheen', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1080, y2: 0 }, defs);
  const sh = [0, 0, 0, 0].map(() => sv('stop', { 'stop-color': '#fff' }, sheen));
  const qg = sv('linearGradient', { id: 'qg', x1: 0, y1: 0, x2: 1, y2: 0.3 }, defs);
  sv('stop', { offset: 0, 'stop-color': '#ff5a1f' }, qg); sv('stop', { offset: 0.55, 'stop-color': '#ff8a4c' }, qg); sv('stop', { offset: 1, 'stop-color': '#ffb38a' }, qg);
  const blurF = sv('filter', { id: 'soft', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs); sv('feGaussianBlur', { stdDeviation: 7 }, blurF);
  const glowF = sv('filter', { id: 'gl', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
  sv('feGaussianBlur', { stdDeviation: 14, result: 'b' }, glowF); const mg = sv('feMerge', {}, glowF); sv('feMergeNode', { in: 'b' }, mg); sv('feMergeNode', { in: 'SourceGraphic' }, mg);

  const cv = document.createElement('canvas').getContext('2d');
  function word(parent, str, font, size, cx, base, opts = {}) {
    cv.font = font; const gap = size * 0.24; const items = []; let x = 0;
    for (const ch of str) { if (ch === ' ') { x += gap; continue; } const w = cv.measureText(ch).width; items.push({ ch, x, w }); x += w + (opts.track || 0); }
    const left = opts.align === 'right' ? cx - x : opts.align === 'left' ? cx : cx - x / 2;
    const fam = font.split(' ').slice(2).join(' '), wt = font.split(' ')[0], it = opts.italic ? 'italic' : 'normal';
    for (const g of items) {
      g.cx = left + g.x + g.w / 2; g.left = left + g.x; g.base = base;
      g.g = sv('g', {}, parent);
      const L = size * 7;
      g.stroke = sv('text', { x: left + g.x, y: base, 'font-family': fam, 'font-weight': wt, 'font-style': it, 'font-size': size, fill: 'none', stroke: opts.strokeColor || '#ffd9c2', 'stroke-width': opts.sw || 2.4, 'stroke-dasharray': `${L} ${L}`, 'stroke-dashoffset': L, 'stroke-linejoin': 'round' }, g.g);
      g.fill = sv('text', { x: left + g.x, y: base, 'font-family': fam, 'font-weight': wt, 'font-style': it, 'font-size': size, fill: opts.fill || '#f6efe7' }, g.g);
      g.stroke.textContent = g.ch; g.fill.textContent = g.ch; g.L = L;
    }
    return { items, left, width: x };
  }
  // écriture d'un mot : le contour se trace glyphe par glyphe, la couleur monte juste après
  function writeWord(w, t, t0, step = 0.05, dy = 26) {
    w.items.forEach((g, i) => {
      const ts = t0 + i * step, dr = S(t, ts, P.draw), fi = S(t, ts + 0.16, P.rise);
      g.stroke.setAttribute('stroke-dashoffset', f3(g.L * (1 - dr)));
      g.stroke.setAttribute('opacity', f3(sm(ts - 0.01, ts + 0.04, t) * (1 - 0.85 * fi)));
      g.fill.setAttribute('opacity', f3(fi));
      g.g.setAttribute('transform', `translate(0,${f3((1 - fi) * dy)})`);
    });
  }
  const wA = word(svgA, '5 000', '700 150px Clash', 150, 540, 700);
  const wB = word(svgA, '− 3 500', '700 150px Clash', 150, 540, 872);
  wB.items[0].fill.setAttribute('fill', '#ff8a4c');
  const shA = sv('g', {}, svgA);
  for (const w of [wA, wB]) for (const g of w.items) { const s = sv('text', { x: g.left, y: g.fill.getAttribute('y'), 'font-family': 'Clash', 'font-weight': 700, 'font-size': 150, fill: 'url(#sheen)' }, shA); s.textContent = g.ch; }
  const BAR = { x0: 196, x1: 884, y: 936 };
  const barGlow = sv('line', { x1: BAR.x0, y1: BAR.y, x2: BAR.x0, y2: BAR.y, stroke: '#ff8a4c', 'stroke-width': 16, 'stroke-linecap': 'round', filter: 'url(#soft)', opacity: 0.8 }, svgA);
  const bar = sv('line', { x1: BAR.x0, y1: BAR.y, x2: BAR.x0, y2: BAR.y, stroke: '#fff4ea', 'stroke-width': 7, 'stroke-linecap': 'round' }, svgA);
  const pen = sv('g', {}, svgA);
  sv('circle', { r: 46, fill: '#ff7a3a', opacity: 0.55, filter: 'url(#soft)' }, pen); sv('circle', { r: 11, fill: '#fff' }, pen);
  const flare = el('div', 'abs', LA, 'left:40px;top:930px;width:1000px;height:12px;border-radius:6px;background:linear-gradient(90deg,transparent,rgba(255,179,138,.85),#fff,rgba(255,179,138,.85),transparent);filter:blur(2px);mix-blend-mode:screen;transform-origin:540px 6px');

  // ---------- couche C : « 1 500 € ? » → compteur ----------
  const LC = el('div', 'L', stage);
  const glowCnum = el('div', 'glow', LC, 'left:140px;top:890px;width:800px;height:440px;background:radial-gradient(closest-side,rgba(255,100,40,.6),transparent)');
  const svgC = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LC);
  const wC = word(svgC, '1 500 €', '700 184px Clash', 184, 506, 1150);
  const Qx = wC.left + wC.width + 14;
  const qWord = word(svgC, '?', 'italic 500 210px Fraunces', 210, Qx + 40, 1150, { italic: true, fill: 'url(#qg)', strokeColor: '#ffb38a', sw: 2.6 });
  qWord.items[0].g.setAttribute('filter', 'url(#gl)');
  const slit = sv('g', {}, svgC);
  sv('rect', { x: -26, y: -180, width: 52, height: 300, rx: 26, fill: '#ff7a3a', opacity: 0.5, filter: 'url(#soft)' }, slit);
  sv('rect', { x: -3, y: -170, width: 6, height: 280, rx: 3, fill: '#fff' }, slit);
  const slitX = (t) => lerp(wC.left - 40, wC.left + wC.width + 30, S(t, 0.72, P.pen));
  for (const g of wC.items) { let tt = 0.72; while (tt < 3 && slitX(tt) < g.left + g.w) tt += 1 / 120; g.tEnd = tt; let ts = 0.72; while (ts < 3 && slitX(ts) < g.left) ts += 1 / 120; g.tStart = ts; }

  // ---------- compteur (HUD) ----------
  const CNT = { top: 300, w: 124, h: 172, gap: 12 };
  const LH = el('div', 'L', stage);
  const label = el('div', 'abs', LH, 'top:240px;left:0;width:1080px;text-align:center;font:700 30px Satoshi;letter-spacing:.32em;color:#a59a90');
  const labelL = [...'MARGE'].map((c) => { const s = el('span', '', label, 'display:inline-block'); s.textContent = c; return s; });
  const cells = [0, 1, 2, 3].map(() => {
    const c = el('div', 'cell glass', LH); el('div', 'sheen', c);
    const o = sv('svg', { width: 124, height: 172, style: 'position:absolute;left:0;top:0;overflow:visible' }, LH);
    const r = sv('rect', { x: 1, y: 1, width: 122, height: 170, rx: 23, fill: 'none', stroke: '#ffd2b8', 'stroke-width': 2.5, 'stroke-dasharray': '600 600', 'stroke-dashoffset': 600 }, o);
    const d = el('div', 'digit', LH); const col = el('div', 'col', d);
    for (let k = -60; k < 20; k++) { const s = el('span', '', col); s.textContent = ((k % 10) + 10) % 10; }
    return { c, o, r, d, col };
  });
  const euro = el('div', 'abs', LH, 'font:700 104px Clash;line-height:172px;white-space:nowrap'); euro.textContent = '€';
  // débits : pluie (9), attente (3), négociation (1)
  const T = [6.0, 6.8, 7.3, 7.81, 8.23, 8.74, 9.45, 9.95, 11.65];
  const TW = [13.1, 14.0, 14.8];
  const TNEG = 18.1;
  const VALS = [1500, 1314, 1236, 1211, 1051, 941, 801, 781, 741, 729, 689, 579, 547, 47];
  const TV = [...T, ...TW, TNEG];
  const digitAt = (v, p) => Math.floor(v / 10 ** p) % 10;
  const rollKeys = [0, 1, 2, 3].map((p) => {
    const keys = [[0, digitAt(1500, p)]]; let idx = digitAt(1500, p);
    for (let i = 1; i < VALS.length; i++) { const a = digitAt(VALS[i - 1], p), b = digitAt(VALS[i], p); if (a === b) continue; idx -= (a - b + 10) % 10; keys.push([TV[i - 1] + 0.06 + (3 - p) * (i === VALS.length - 1 ? 0.09 : 0.035), idx, P.roll]); }
    return keys;
  });

  // ---------- couche B : JOUR 1 ----------
  const LB = el('div', 'L', stage);
  const FL = ['J', 'O', 'U', 'R', '1']; const FX = [];
  { let x = 0; FL.forEach((c, i) => { if (i === 4) x += 40; FX.push(x); x += 132 + 10; }); const off = 540 - (x - 10) / 2; for (let i = 0; i < 5; i++) FX[i] += off; }
  const flaps = FL.map((c, i) => { const d = el('div', 'flapT glass', LB, `left:${FX[i]}px;top:690px`); el('div', 'sheen', d); const s = el('span', '', d); el('i', '', d); return { d, s }; });

  // ---------- couche P : la Polo ----------
  const LP = el('div', 'L', stage);
  const CAR = { left: 40, top: 1085, w: 1000 }; CAR.h = CAR.w * polo.height / polo.width;
  const shadow = el('div', 'abs', LP, `left:${CAR.left + 60}px;top:${CAR.top + CAR.h - 60}px;width:${CAR.w - 120}px;height:120px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.85),transparent)`);
  const refl = el('img', 'abs', LP, `left:${CAR.left}px;top:${CAR.top + CAR.h - 8}px;width:${CAR.w}px;transform-origin:50% 0;opacity:.2;filter:blur(3px);-webkit-mask-image:linear-gradient(to top,#000,transparent 40%)`); refl.src = polo.src;
  const car = el('img', 'abs', LP, `left:${CAR.left}px;top:${CAR.top}px;width:${CAR.w}px`); car.src = polo.src;
  const sweep = el('div', 'abs', LP, `left:${CAR.left}px;top:${CAR.top}px;width:${CAR.w}px;height:${CAR.h}px;-webkit-mask-image:url(${polo.src});-webkit-mask-size:100% 100%;mix-blend-mode:screen`);
  const PC = window.POLO_CONTOUR;
  const csv = sv('svg', { width: CAR.w, height: CAR.h, viewBox: `0 0 ${PC.w} ${PC.h}`, style: `position:absolute;left:${CAR.left}px;top:${CAR.top}px;overflow:visible` }, LP);
  const cdefs = sv('defs', {}, csv); const cf = sv('filter', { id: 'cblur', x: '-20%', y: '-20%', width: '140%', height: '140%' }, cdefs); sv('feGaussianBlur', { stdDeviation: 6 }, cf);
  const cGlow = sv('path', { d: PC.d, fill: 'none', stroke: '#ff7a3a', 'stroke-width': 12, 'stroke-linejoin': 'round', filter: 'url(#cblur)', 'stroke-dasharray': `${PC.len} ${PC.len}` }, csv);
  const cLine = sv('path', { d: PC.d, fill: 'none', stroke: '#ffe2cf', 'stroke-width': 3.2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': `${PC.len} ${PC.len}` }, csv);
  const cPen = sv('g', {}, csv); sv('circle', { r: 30, fill: '#ff7a3a', opacity: 0.6, filter: 'url(#cblur)' }, cPen); sv('circle', { r: 7, fill: '#fff' }, cPen);
  const trails = [[0.62, 5], [0.7, 3], [0.8, 2]].map(([fy, h]) => el('div', 'abs', LP, `left:0;top:${CAR.top + CAR.h * fy}px;height:${h}px;border-radius:${h}px;background:linear-gradient(90deg,rgba(255,230,210,.9),rgba(255,120,50,.5),transparent);filter:blur(1px)`));
  // 13 étiquettes : la voiture finit couverte de ses frais
  const TAGS = [[180, 330, -8, '186 €'], [430, 225, 6, '78 €'], [715, 300, -5, '25 €'], [600, 470, 9, '160 €'], [95, 470, -12, '110 €'], [335, 385, -3, '140 €'],
    [540, 140, 4, '20 €'], [810, 420, -7, '40 €'], [250, 200, 10, '12 €'],
    [880, 250, -9, '40 €'], [60, 330, 8, '110 €'], [700, 560, -4, '32 €'], [420, 560, 3, '− 500 €']];
  const TT = [...T, ...TW, TNEG];
  const tags = TAGS.map(([, , , txt], i) => { const d = el('div', 'tag', LP); d.textContent = txt; if (i === 12) d.style.background = 'linear-gradient(#ffb38a,#ff8a4c)'; return d; });

  // ---------- notifications ----------
  function notif(parent, seq, title, amt, app = 'Compte courant · maintenant', sign = '−') {
    const d = el('div', 'glass notif', parent); el('div', 'sheen', d);
    const c = el('canvas', '', d); c.width = 372; c.height = 276;
    const tx = el('div', '', d); const a = el('div', 'app', tx); a.textContent = app;
    const ti = el('div', 'ti', tx); ti.textContent = title; const am = el('div', 'am', tx); am.innerHTML = `<b>${sign}</b> ${amt} €`;
    return { d, c, seq };
  }
  const LN = el('div', 'L', stage);
  const hook = notif(LN, 'signe', 'Carte grise', '186,00');
  const NOTE = [['signe', 'Carte grise', '186,00'], ['ct', 'Contrôle technique', '78,00'], ['ct2', 'Contre-visite', '25,00'], ['pneu', '2 pneus', '160,00'], ['moteur', 'Vidange', '110,00'],
    ['moteur2', 'Plaquettes avant', '140,00'], ['lavage', 'Produits de nettoyage', '20,00'], ['essence', 'Essence · 6 visites', '40,00'], ['route', 'Kebab · après la 4e visite', '12,00']];
  const LS = el('div', 'L', stage);
  const stack = NOTE.map(([s, ti, am]) => notif(LS, s, ti, am));
  const WAIT = [['nuit', 'Assurance · 1 mois', '40,00'], ['batterie', 'Batterie à plat', '110,00'], ['phone', 'Annonce remontée', '32,00']];
  const waits = WAIT.map(([s, ti, am]) => notif(LS, s, ti, am));
  // l'attente : calendrier à palettes
  const LW = el('div', 'L', stage);
  const day = [0, 1, 2, 3].map((i) => { const d = el('div', 'flapT glass', LW, `left:${300 + i * 124}px;top:560px;width:116px;height:160px;font-size:112px`); el('div', 'sheen', d); const s = el('span', '', d); el('i', '', d); return { d, s }; });
  const quiet = el('div', 'abs', LW, 'left:0;width:1080px;top:760px;text-align:center;font:500 36px Satoshi;color:rgba(246,239,231,.75)');
  quiet.innerHTML = 'Toujours en vente. <span style="font-family:Fraunces;font-style:italic;font-size:46px;background:linear-gradient(100deg,#ff5a1f,#ff8a4c 55%,#ffb38a);-webkit-background-clip:text;color:transparent">Zéro appel.</span>';
  // la revente : message de l'acheteur, puis le virement
  const LR = el('div', 'L', stage);
  const bubble = el('div', 'glass', LR, 'left:150px;top:620px;width:780px;padding:30px 36px;border-radius:40px 40px 40px 12px');
  el('div', 'sheen', bubble);
  const bubTop = el('div', '', bubble, 'font:500 24px Satoshi;color:rgba(246,239,231,.7);margin-bottom:10px'); bubTop.textContent = 'Acheteur · message';
  const bubTx = el('div', '', bubble, 'font:700 46px Satoshi;line-height:1.2'); bubTx.innerHTML = '4 500 € et je la prends <span style="font-family:Fraunces;font-style:italic;font-weight:500;color:#ff8a4c">aujourd\'hui.</span>';
  const credit = notif(LR, 'phone', 'Virement reçu', '4 500,00', 'Compte courant · maintenant', '+');
  credit.d.querySelector('.am b').style.color = '#ffb38a';
  // le 47
  const L47 = el('div', 'L', stage);
  const glow47 = el('div', 'glow', L47, 'left:160px;top:520px;width:760px;height:600px;background:radial-gradient(closest-side,rgba(255,100,40,.55),transparent)');
  const lab47 = el('div', 'abs', L47, 'left:0;width:1080px;top:520px;text-align:center;font:700 30px Satoshi;letter-spacing:.34em;color:#a59a90'); lab47.textContent = 'BÉNÉFICE';
  const big47 = el('div', 'abs', L47, 'left:0;width:1080px;top:560px;text-align:center;font:700 430px Clash;line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:#f6efe7;text-shadow:0 1px 0 #d8cfc6,0 2px 0 #bfb5ab,0 3px 0 #a79c92,0 4px 0 #8f8479,0 5px 0 #786d63,0 6px 0 #61574e,0 16px 30px rgba(0,0,0,.6)');
  big47.innerHTML = '47<span style="font-size:230px;margin-left:12px">€</span>';
  const svg47 = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, L47);
  const wPlein = word(svg47, 'Même pas un plein.', 'italic 500 100px Fraunces', 100, 540, 1180, { italic: true, fill: 'url(#qg)', strokeColor: '#ffb38a', sw: 1.8 });
  // ---------- la formule ----------
  const LF = el('div', 'L', stage);
  const fBg = el('div', 'L', LF, `background:radial-gradient(75% 55% at 50% 46%,rgba(70,30,10,.35),rgba(8,7,10,.92))`);
  const fCv = el('canvas', 'abs', LF, 'left:-120px;top:-120px;width:1320px;height:2160px;filter:blur(22px) brightness(.26) saturate(.7) sepia(.5)'); fCv.width = 400; fCv.height = 300;
  const fGlow = el('div', 'glow', LF, 'left:160px;top:540px;width:760px;height:560px;background:radial-gradient(closest-side,rgba(255,120,50,.35),transparent)');
  const panel = el('div', 'glass', LF, 'left:110px;top:430px;width:860px;height:640px;border-radius:44px'); el('div', 'sheen', panel);
  const svgF = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LF);
  const labF = [['Revente', 560], ['− frais', 680], ['− marge voulue', 800]].map(([s, y]) => word(svgF, s, '600 50px Clash', 50, 168, y, { align: 'left', fill: 'rgba(246,239,231,.72)', sw: 1.6 }));
  const valF = [['4 500', 568], ['950', 688], ['800', 808]].map(([s, y]) => word(svgF, s, '700 90px Clash', 90, 912, y, { align: 'right', sw: 2 }));
  const fbarGlow = sv('line', { x1: 168, y1: 868, x2: 168, y2: 868, stroke: '#ff8a4c', 'stroke-width': 14, 'stroke-linecap': 'round', filter: 'url(#soft)' }, svgF);
  const fbar = sv('line', { x1: 168, y1: 868, x2: 168, y2: 868, stroke: '#ffe2cf', 'stroke-width': 6, 'stroke-linecap': 'round' }, svgF);
  const fpen = sv('g', {}, svgF); sv('circle', { r: 40, fill: '#ff7a3a', opacity: 0.55, filter: 'url(#soft)' }, fpen); sv('circle', { r: 10, fill: '#fff' }, fpen);
  const wMax = word(svgF, 'prix max', 'italic 500 80px Fraunces', 80, 168, 1010, { align: 'left', italic: true, fill: 'url(#qg)', strokeColor: '#ffb38a', sw: 1.8 });
  const res = el('div', 'abs', LF, 'left:540px;top:930px;width:390px;text-align:right;font:700 120px Clash;letter-spacing:-.02em;white-space:nowrap;filter:drop-shadow(0 0 26px rgba(255,120,50,.4))');
  res.innerHTML = '2<i style="display:inline-block;width:.24em"></i>750 €';
  const ann = el('div', 'glass', LF, 'left:200px;top:1190px;padding:16px 30px;border-radius:22px;white-space:nowrap;font:700 58px Clash;color:rgba(246,239,231,.85)');
  el('div', 'sheen', ann);
  const annTx = el('span', '', ann); annTx.innerHTML = 'Annonce · <span style="position:relative">3<i style="display:inline-block;width:.24em"></i>500 €</span>';
  const strike = sv('svg', { width: 300, height: 40, viewBox: '0 0 300 40', style: 'position:absolute;left:296px;top:22px;overflow:visible' }, ann);
  const stPath = sv('path', { d: 'M6 26 C 90 10, 200 32, 294 12', stroke: '#ff5a1f', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': '320 320', 'stroke-dashoffset': 320 }, strike);
  const tour = el('div', 'abs', LF, 'left:0;width:1080px;top:1350px;text-align:center;font:500 42px Satoshi;white-space:nowrap');
  tour.innerHTML = 'À 3<i style="display:inline-block;width:.24em"></i>500, tu <span style="font-family:Fraunces;font-style:italic;font-size:54px;background:linear-gradient(100deg,#ff5a1f,#ff8a4c 55%,#ffb38a);-webkit-background-clip:text;color:transparent">passes ton tour.</span>';

  const mention = el('div', 'abs', stage, 'left:0;width:1080px;top:1004px;text-align:center;font:500 22px Satoshi;color:rgba(246,239,231,.5)'); mention.textContent = 'Exemple · prix moyens constatés';
  const rewFx = el('div', 'L', stage, 'background:repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 2px,transparent 2px 6px);mix-blend-mode:screen');
  const flash = el('div', 'L', stage, 'background:radial-gradient(60% 45% at 50% 55%,#fff1e6,rgba(255,140,80,.6) 45%,transparent 75%);mix-blend-mode:screen');
  const grain = el('div', '', stage); grain.id = 'grain';
  const vign = el('div', '', stage); vign.id = 'vign';

  // opacité + visibilité : un élément invisible sort du calcul (le verre dépoli coûte cher au rendu)
  const set = (e, o) => { const v = clamp(o, 0, 1); e.style.opacity = f3(v); e.style.visibility = v < 0.002 ? 'hidden' : 'visible'; };

  // ---------- la frame t ----------
  function paint(t) {
    const st = story(t);                 // temps du récit (rembobiné après 20,9 s)
    const bk = back(t);                  // retour vers l'image 0
    const tA = t >= LOOP ? 0 : t;        // la scène A revient dans son état de l'image 0
    const tI = 2.44;
    const imp = tA > tI ? Math.exp(-(tA - tI) * 6.5) : 0;
    const shake = tA > tI ? 15 * Math.exp(-(tA - tI) * 7) * Math.sin((tA - tI) * 52) : 0;
    const out = t >= LOOP ? 0 : S(t, 3.95, P.heavy);
    const showA = t < LOOP ? 1 - sm(3.92, 4.3, t) : sm(LOOP + 0.45, LOOP + 1.3, t);
    const toC = (t < LOOP ? sm(4.55, 4.85, t) : 1 - sm(LOOP, LOOP + 0.8, t));
    const cA = camA(tA);

    // fonds
    bgA.style.transform = `translateY(${f3(260 * out)}px) scale(${f3(1.06 + 0.04 * S(tA, 0, P.soft))})`;
    bgImg.style.transform = `translate(${f3(noise(7, tA * 0.3) * 20)}px,${f3(noise(8, tA * 0.3) * 20)}px)`;
    set(bgA, t < LOOP ? 1 - sm(4.6, 4.9, t) : sm(LOOP + 0.3, LOOP + 1.2, t));
    const cC = camC(st);
    set(bgC, toC);
    bgC.style.transform = tf(cC, -500, 'scale(1.35)');
    const nt = sm(12.0, 12.8, st) * (1 - sm(15.6, 16.4, st));
    set(night, nt); set(nightCv, nt * 0.8); if (nt > 0.01) drawSeq(nightCv, 'nuit', st - 12);

    // scène A
    const zA = -700 * out;
    LA.style.transform = tf(cA, zA, `translateX(${f3(shake * (1 - out))}px)`);
    LA.style.filter = `blur(${f3(dof(cA, zA) + 6 * out + 10 * (1 - showA))}px)`;
    set(LA, showA);
    const spx = -300 + 1700 * S(tA, 0, { f: 0.9, z: 1 });
    [[spx - 160, 0], [spx - 40, 0.55], [spx + 40, 0.55], [spx + 160, 0]].forEach(([x, o], i) => { sh[i].setAttribute('offset', f3(clamp(x / 1080, 0, 1))); sh[i].setAttribute('stop-opacity', f3(o)); });
    const pb = S(tA, 0.22, P.pen), bx = lerp(BAR.x0, BAR.x1, pb);
    bar.setAttribute('x2', f3(bx)); barGlow.setAttribute('x2', f3(bx));
    pen.setAttribute('transform', `translate(${f3(bx)},${BAR.y})`);
    pen.setAttribute('opacity', f3(sm(0.18, 0.3, tA) * (1 - sm(0.95, 1.25, tA))));
    barGlow.setAttribute('opacity', f3(0.55 + 0.45 * imp));
    flare.style.transform = `scaleX(${f3(0.15 + 0.85 * pb + 0.2 * imp)})`;
    set(flare, (0.25 + 0.75 * imp) * pb);
    set(glowA, 0.25 + 0.55 * S(tA, 1.0, P.heavy) * (1 - out) + 0.5 * imp);

    // « 1 500 € ? » qui devient le compteur
    const wB2 = t >= LOOP ? 0 : S(t, 3.95, P.heavy);
    LC.style.transform = tf(mixCam(cA, ID, wB2), 0, `translateX(${f3(shake * 1.3 * (1 - wB2))}px)`);
    set(LC, t < LOOP ? 1 : 0);
    const sx = slitX(tA);
    slit.setAttribute('transform', `translate(${f3(sx)},1080)`);
    slit.setAttribute('opacity', f3(sm(0.66, 0.8, tA) * (1 - sm(1.25, 1.5, tA))));
    set(glowCnum, (0.15 + 0.75 * S(tA, 1.05, P.heavy) + 0.6 * imp) * (1 - sm(4.0, 4.6, t < LOOP ? t : 0)));
    // cases visibles : les milliers disparaissent à 941 €, les centaines à 47 €
    const vis4 = 1 - S(st, T[5] + 0.06, P.heavy), vis3 = 1 - S(st, TNEG + 0.3, P.heavy);
    const vis = [vis4, vis3, 1, 1];
    const nC = vis.reduce((a, b) => a + b, 0), totalW = nC * CNT.w + (nC - 1) * CNT.gap + 18 + 76;
    const cellX = []; let cx = 540 - totalW / 2;
    for (let i = 0; i < 4; i++) { cellX.push(cx); cx += (CNT.w + CNT.gap) * vis[i]; }
    const euroX = cx + 6;
    const mv = S(tA, 4.0, { f: 1.25, z: 1 }) * (t < LOOP ? 1 : 0), swap = t < LOOP ? sm(4.72, 4.84, t) : 0;
    wC.items.forEach((g, i) => {
      const p = clamp((sx - g.left) / g.w, 0, 1), dr = S(tA, g.tStart, P.draw);
      g.stroke.setAttribute('stroke-dashoffset', f3(g.L * (1 - dr)));
      g.stroke.setAttribute('opacity', f3(sm(0, 0.15, p) * (1 - sm(0.2, 0.6, S(tA, g.tEnd + 0.05, P.rise)))));
      const fi = S(tA, g.tEnd - 0.04, P.rise);
      g.fill.setAttribute('opacity', f3(fi * (1 - swap)));
      const s = lerp(1, 128 / 184, mv);
      const tx = i < 4 ? cellX[i] + CNT.w / 2 : euroX + 34, ty = CNT.top + CNT.h / 2 + 44 * (i < 4 ? 1 : 0.85);
      g.g.setAttribute('transform', `translate(${f3(lerp(g.cx, tx, mv))},${f3(lerp(1080, ty - 44, mv) + 70 * (1 - mv) + (1 - fi) * 34)}) scale(${f3(s)}) translate(${f3(-g.cx)},-1080)`);
    });
    const q = qWord.items[0], qd = S(tA, 1.28, P.draw);
    q.stroke.setAttribute('stroke-dashoffset', f3(q.L * (1 - qd)));
    q.stroke.setAttribute('opacity', f3(sm(1.26, 1.36, tA) * (1 - sm(1.7, 2.1, tA))));
    const qf = S(tA, 1.52, P.rise), qo = t < LOOP ? S(t, 3.9, { f: 1.6, z: 1 }) : 0;
    q.fill.setAttribute('opacity', f3(qf));
    q.g.setAttribute('opacity', f3(1 - qo));
    q.g.setAttribute('transform', `translate(${f3(q.cx)},${f3(1080 - 260 * qo + (1 - qf) * 30)}) scale(${f3(1 - 0.5 * qo)}) rotate(${f3(-10 * qo)}) translate(${f3(-q.cx)},-1080)`);

    // compteur : visible de 4,3 s à la fin du rembobinage
    const hud = t < LOOP ? 1 - sm(22.3, 22.7, t) : 0;
    const to47 = sm(18.55, 18.9, t) * (1 - sm(20.85, 21.2, t));   // le compteur se fond dans le grand 47
    cells.forEach((c, i) => {
      const k = vis[i], td = 4.32 + i * 0.07;
      const dr = S(t < LOOP ? t : 0, td, P.draw), gl = S(t < LOOP ? t : 0, td + 0.22, P.heavy);
      for (const e of [c.c, c.o, c.d]) { e.style.transform = `translate(${f3(cellX[i])}px,${CNT.top}px) scale(${f3(0.6 + 0.4 * k)})`; e.style.transformOrigin = '0 50%'; }
      c.r.setAttribute('stroke-dashoffset', f3(600 * (1 - dr)));
      c.o.style.opacity = f3(sm(td - 0.02, td + 0.06, t < LOOP ? t : 0) * (1 - 0.75 * gl) * k * hud * (1 - to47));
      set(c.c, gl * k * hud * (1 - to47));
      c.col.style.transform = `translateY(${f3(-(track(st, rollKeys[3 - i]) + 60) * CNT.h)}px)`;
      set(c.d, swap * k * k * k * hud * (1 - to47));
    });
    euro.style.transform = `translate(${f3(euroX)}px,${CNT.top}px)`; set(euro, swap * hud * (1 - to47));
    labelL.forEach((s, i) => { const p = S(t < LOOP ? t : 0, 4.6 + i * 0.045, P.rise); s.style.opacity = f3(p * hud * (1 - to47)); s.style.transform = `translateY(${f3((1 - p) * 18)}px)`; s.style.filter = `blur(${f3((1 - p) * 8)}px)`; });

    // JOUR 1 : les palettes tombent, puis s'envolent quand la voiture arrive
    const cB = camB(t);
    const away = S(t, 4.85, P.push);
    LB.style.transform = tf(cB, 0, `translateY(${f3(-420 * away)}px)`);
    LB.style.filter = `blur(${f3(8 * away)}px)`;
    set(LB, sm(4.0, 4.1, t) * (1 - sm(5.0, 5.3, t)));
    flaps.forEach((f, i) => {
      const p = S(t, 4.08 + i * 0.07, P.flip), letters = 'ARTVQMEZ';
      f.s.textContent = p < 0.72 ? letters[(Math.floor(p * 9) + i * 3) % letters.length] : FL[i];
      f.d.style.transform = `perspective(700px) rotateX(${f3((1 - p) * 92)}deg)`;
      f.d.style.opacity = f3(sm(0, 0.12, p));
    });

    // la notification du hook
    const hx = track(tA, [[0, 1320], [2.2, 0, P.card]]), hrz = track(tA, [[0, -16], [2.2, -4, P.card]]);
    const hy = 1300 + 1250 * out, hr2 = 14 * out;
    LN.style.transform = tf(cA, 160);
    hook.d.style.transform = `translate(${f3(150 + hx)}px,${f3(hy)}px) rotate(${f3(hrz + hr2)}deg)`;
    set(hook.d, t < LOOP ? sm(2.1, 2.16, t) * (1 - sm(4.4, 4.6, t)) : 0);
    if (t > 2.1 && t < 4.6) drawSeq(hook.c, 'signe', t - 2.1);

    // la Polo (récit : avance puis se rembobine)
    const cin = S(st, 4.7, P.heavy);
    const dim = 1 - 0.35 * sm(12.0, 12.8, st) * (1 - sm(15.6, 16.4, st)) - 0.75 * sm(18.6, 19.0, t) * (1 - sm(20.9, 21.3, t)) - 0.55 * sm(22.0, 22.6, t);
    LP.style.transform = tf(cC, -80, `translateY(${f3((1 - cin) * 60)}px) scale(${f3(0.96 + 0.04 * cin)})`);
    LP.style.filter = t > 22.0 && t < LOOP + 1 ? `blur(${f3(6 * sm(22.0, 22.6, t))}px)` : '';
    set(LP, toC * clamp(dim, 0, 1) + 0 * dim);
    const cx0 = carX(st), vel = (carX(st + 0.01) - carX(st - 0.01)) / 0.02;
    const dip = 1.7 * Math.sin(Math.PI * clamp((st - 5.1) / 0.7, 0, 1)) * (st > 5.1 ? 1 : 0);
    car.style.transformOrigin = '18% 92%';
    car.style.transform = `translateX(${f3(cx0)}px) rotate(${f3(-dip)}deg)`;
    for (const e of [shadow, sweep, csv]) e.style.transform = `translateX(${f3(cx0)}px)`;
    refl.style.transform = `scaleY(-1) translateX(${f3(cx0)}px)`;
    const spd = clamp(Math.abs(vel) / 2600, 0, 1);
    trails.forEach((tr, i) => { tr.style.transform = `translateX(${f3(CAR.left + CAR.w * 0.55 + cx0)}px)`; tr.style.width = `${f3(80 + 900 * spd)}px`; set(tr, spd * (0.9 - i * 0.2)); });
    car.style.filter = `brightness(${f3(0.15 + 0.82 * S(st, 4.85, { f: 0.9, z: 1 }))}) contrast(1.05) drop-shadow(0 0 2px rgba(255,170,120,${f3(0.85 * cin)})) drop-shadow(0 0 26px rgba(255,110,40,${f3(0.45 * cin)}))`;
    const swx = lerp(-60, 160, S(st, 5.75, { f: 0.8, z: 1 }));
    sweep.style.background = `linear-gradient(105deg,transparent ${f3(swx - 14)}%,rgba(255,220,190,.55) ${f3(swx)}%,transparent ${f3(swx + 14)}%)`;
    const cp = S(st, 5.6, { f: 0.62, z: 1 });
    for (const e of [cGlow, cLine]) e.setAttribute('stroke-dashoffset', f3(PC.len * (1 - cp)));
    cGlow.setAttribute('opacity', f3(sm(5.6, 5.65, st) * (0.9 - 0.45 * sm(6.6, 7.3, st))));
    const pt = cLine.getPointAtLength(PC.len * Math.min(cp, 0.9999));
    cPen.setAttribute('transform', `translate(${f3(pt.x)},${f3(pt.y)})`);
    cPen.setAttribute('opacity', f3(sm(5.6, 5.67, st) * (1 - sm(6.37, 6.65, st))));
    set(glowC, 0.5 + 0.5 * cin);
    cone.style.opacity = f3(0.6 + 0.4 * cin);
    floor.style.opacity = f3(cin);
    TAGS.forEach(([x, y, r], i) => {
      const t0 = TT[i] + 0.3, p = clamp(S(st, t0, P.tag), 0, 1), pr = S(st, t0, P.tag);
      const sx0 = 360 - CAR.left, sy0 = 700 - CAR.top;
      const px = lerp(sx0, x, p), py = lerp(sy0, y, p) - 260 * Math.sin(Math.PI * p);
      tags[i].style.transform = `translate(${f3(CAR.left + px + cx0)}px,${f3(CAR.top + py)}px) rotate(${f3(lerp(-20, r, pr))}deg) scale(${f3(1.3 - 0.3 * p)})`;
      set(tags[i], sm(t0, t0 + 0.06, st));
    });

    // la pile des débits : glisse depuis la droite, puis s'en va quand l'attente commence
    LS.style.transform = tf(cC, 0);
    set(LS, toC);
    const leave = S(st, 12.0, P.heavy);
    stack.forEach((n, k) => {
      let d = 0; for (let j = k + 1; j < T.length; j++) d += S(st, T[j], P.card);
      const ein = S(st, T[k], P.card);
      const y = 640 - 58 * d + (1 - ein) * 60 - 700 * leave, z = -210 * d, xin = lerp(1180, 150, ein), rz = (k % 2 ? 1.8 : -2.2) * ein + (1 - ein) * -9;
      n.d.style.transform = `translate(${f3(xin)}px,${f3(y)}px) perspective(1300px) translateZ(${f3(z)}px) rotateX(${f3(4 + 4 * d)}deg) rotate(${f3(rz)}deg)`;
      n.d.style.filter = `brightness(${f3(1 - 0.17 * d)}) blur(${f3(Math.min(6, d * 1.1 + 6 * leave))}px)`;
      set(n.d, sm(T[k] - 0.06, T[k], st) * (1 - sm(2.2, 3.2, d)) * (1 - sm(0.3, 0.8, leave)));
      if (n.d.style.visibility === 'visible') drawSeq(n.c, n.seq, st - T[k] + 0.5);
    });
    // les débits de l'attente : un à la fois, sous le calendrier
    waits.forEach((n, k) => {
      const ein = S(st, TW[k], P.card), eout = k < 2 ? S(st, TW[k + 1], P.card) : S(st, 15.6, P.heavy);
      n.d.style.transform = `translate(${f3(lerp(1180, 150, ein) - 900 * eout)}px,${f3(900 + 40 * eout)}px) rotate(${f3((1 - ein) * -8 + eout * -6)}deg)`;
      set(n.d, sm(TW[k] - 0.06, TW[k], st) * (1 - sm(0.2, 0.7, eout)));
      if (n.d.style.visibility === 'visible') drawSeq(n.c, n.seq, st - TW[k] + 0.4);
    });
    // calendrier : J+1 → J+23, les palettes accélèrent
    LW.style.transform = tf(cC, 40);
    const wv = sm(12.0, 12.25, st) * (1 - sm(15.6, 15.9, st));
    set(LW, wv);
    const dayN = Math.max(1, Math.min(23, Math.round(1 + 22 * Math.pow(clamp((st - 12.1) / 3.3, 0, 1), 1.6))));
    const txt = ['J', '+', String(dayN).padStart(2, ' ')[0], String(dayN).padStart(2, ' ')[1]];
    day.forEach((f, i) => {
      f.s.textContent = txt[i] === ' ' ? '' : txt[i];
      const pf = (st * (2 + 6 * clamp((st - 12.1) / 3.3, 0, 1))) % 1;   // battement des palettes
      f.d.style.transform = `perspective(600px) rotateX(${f3(i >= 2 && wv > 0.5 ? (1 - pf) * 18 : 0)}deg)`;
      f.d.style.display = i === 2 && dayN < 10 ? 'none' : 'flex';
    });
    quiet.style.transform = `translateY(${f3((1 - sm(12.6, 13.0, st)) * 16)}px)`; set(quiet, sm(12.6, 13.0, st) * wv);

    // la revente
    LR.style.transform = tf(cC, 60);
    const bin = S(st, 15.75, P.card), bout = S(st, 18.5, P.heavy);
    const buzz = st > 15.75 && st < 16.35 ? Math.sin((st - 15.75) * 90) * 6 * (1 - (st - 15.75) / 0.6) : 0;
    bubble.style.transform = `translate(${f3(lerp(700, 0, bin) + buzz)}px,${f3(-300 * bout)}px) scale(${f3(0.9 + 0.1 * bin)})`;
    set(bubble, sm(15.7, 15.78, st) * (1 - sm(0.2, 0.7, bout)));
    const crin = S(st, 17.35, P.card);
    credit.d.style.transform = `translate(${f3(lerp(1180, 150, crin))}px,${f3(930 - 300 * bout)}px) rotate(${f3((1 - crin) * -8)}deg)`;
    set(credit.d, sm(17.3, 17.36, st) * (1 - sm(0.2, 0.7, bout)));
    if (credit.d.style.visibility === 'visible') drawSeq(credit.c, 'phone', st - 17.3);

    // le 47 : le compteur se fond dans un 47 géant, puis « Même pas un plein. » s'écrit
    const g47 = sm(18.55, 18.95, t) * (1 - sm(20.85, 21.15, t));
    set(L47, g47);
    const s47 = S(t, 18.6, { f: 1.4, z: 0.85 });
    big47.style.transform = `translateY(${f3(-260 * (1 - s47))}px) scale(${f3(0.3 + 0.7 * s47)}) perspective(1500px) rotateX(${f3(10 - 4 * s47)}deg) rotateY(${f3(-14 + 6 * s47)}deg)`;
    big47.style.transformOrigin = '540px 200px';
    set(glow47, 0.4 + 0.6 * S(t, 18.7, P.heavy));
    writeWord(wPlein, t, 19.9, 0.035, 20);

    // le rembobinage : lignes de balayage, éclairs
    const rw = sm(REW[0], REW[0] + 0.15, t) * (1 - sm(REW[1] - 0.2, REW[1], t));
    set(rewFx, rw * 0.9);
    rewFx.style.transform = `translateY(${f3((t * 900) % 6)}px)`;

    // la formule
    const fin = sm(22.0, 22.5, t) * (1 - sm(LOOP, LOOP + 0.55, t));
    set(LF, fin);
    const cF = camF(t);
    for (const e of [panel, svgF, res, ann, tour, fGlow]) e.style.transform = tf(cF, 0);
    if (fin > 0.01) drawSeq(fCv, 'calc', t - 22);
    const pin = S(t, 22.2, P.card);
    panel.style.transform = tf(cF, 0, `translateY(${f3((1 - pin) * 120)}px) scale(${f3(0.94 + 0.06 * pin)})`);
    labF.forEach((w, i) => writeWord(w, t, 22.45 + i * 0.45, 0.03, 16));
    valF.forEach((w, i) => writeWord(w, t, 22.6 + i * 0.45, 0.05, 20));
    const fb = S(t, 23.75, P.pen), fx = lerp(168, 912, fb);
    fbar.setAttribute('x2', f3(fx)); fbarGlow.setAttribute('x2', f3(fx));
    set(fbar, sm(23.73, 23.78, t)); set(fbarGlow, sm(23.73, 23.78, t));
    fpen.setAttribute('transform', `translate(${f3(fx)},868)`); fpen.setAttribute('opacity', f3(sm(23.73, 23.8, t) * (1 - sm(24.4, 24.7, t))));
    writeWord(wMax, t, 23.05, 0.05, 18);
    const rs = S(t, 24.0, { f: 2.2, z: 0.7 });
    res.style.transform = tf(cF, 0, `translateY(${f3((1 - rs) * -60)}px) scale(${f3(1.25 - 0.25 * rs)})`);
    set(res, sm(23.98, 24.06, t));
    const ain = S(t, 25.5, P.card);
    ann.style.transform = tf(cF, 0, `translateX(${f3((1 - ain) * 700)}px) rotate(${f3(-2.5 + (1 - ain) * -6)}deg)`);
    set(ann, sm(25.45, 25.52, t));
    stPath.setAttribute('stroke-dashoffset', f3(320 * (1 - S(t, 26.0, P.pen))));
    tour.style.transform = tf(cF, 0, `translateY(${f3((1 - S(t, 26.55, P.rise)) * 24)}px)`);
    set(tour, S(t, 26.55, P.rise));

    set(mention, sm(6.2, 6.6, st) * (1 - sm(18.4, 18.7, st)) * (t < 20.9 ? 1 : 0));
    mention.style.transform = `translateY(${f3((1 - sm(6.2, 6.7, st)) * 12)}px)`;

    // éclairs : impact du hook, arrivée de la voiture, 2 750 €, retour à l'image 0
    set(flash, 0.18 * imp + 0.55 * sm(4.6, 4.8, t) * (1 - sm(4.8, 5.2, t)) + 0.25 * Math.exp(-Math.max(0, t - 24.0) * 8) * (t > 24.0 ? 1 : 0) + 0.5 * sm(LOOP, LOOP + 0.2, t) * (1 - sm(LOOP + 0.2, LOOP + 0.7, t)));
    grain.style.transform = `translate(${(Math.floor(t * 24) * 53) % 211}px,${(Math.floor(t * 24) * 97) % 173}px)`;
  }

  // flou de bougé : obturateur ouvert sur les gestes rapides
  const WIN = [[2.15, 2.55, 1], [3.9, 4.35, 0.6], [4.6, 5.6, 1], [0.2, 0.9, 0.35], [0.7, 1.3, 0.4], [REW[0], REW[1], 1], [23.95, 24.25, 0.6], [25.45, 25.8, 0.6], [15.7, 16.0, 0.6], [17.3, 17.6, 0.6], [18.0, 18.9, 0.5], [LOOP, LOOP + 0.8, 0.6]];
  [...T, ...TW].forEach((x) => { WIN.push([x - 0.06, x + 0.3, 0.7]); WIN.push([x + 0.3, x + 0.75, 0.35]); });
  const fast = (t) => { let s = 0; for (const [a, b, v] of WIN) s = Math.max(s, v * sm(a - 0.05, a + 0.05, t) * (1 - sm(b - 0.05, b + 0.05, t))); return s; };
  window.shutter = (t) => Math.max(0.12, fast(t));
  window.samples = (t) => (fast(t) > 0.3 ? 4 : 1);
  window.seek = (t) => paint(t >= DUR ? t - DUR : t);
  paint(0);
  window.filmReady = true;
})();
