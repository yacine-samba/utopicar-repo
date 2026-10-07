// MO5 · DA animée (9,5 s). Contrat : window.seek(t) peint la frame t, sans état entre les frames.
// window.shutter(t) / window.samples(t) : flou de bougé au rendu (MB=8).
(async function () {
  const { spring, track, clamp, lerp, noise } = Motion;
  const stage = document.getElementById('stage');
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, cls, parent, style) => { const e = document.createElement(tag); if (cls) e.className = cls; if (style) e.setAttribute('style', style); (parent || stage).appendChild(e); return e; };
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const S = (t, t0, p) => spring(t - t0, p);
  const sm = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const f3 = (x) => x.toFixed(3);
  // ressorts : tout arrive en douceur, sans rebond sur la typo
  const P = {
    pen: { f: 1.05, z: 1 }, draw: { f: 1.35, z: 1 }, rise: { f: 1.9, z: 1 }, card: { f: 2.2, z: 0.78 }, soft: { f: 0.32, z: 1 },
    heavy: 'heavy', flip: { f: 2.4, z: 0.82 }, roll: { f: 1.7, z: 0.95 }, tag: { f: 2.0, z: 0.66 }, push: { f: 0.95, z: 1 }, drift: { f: 0.28, z: 1 },
  };

  await Promise.all([
    document.fonts.load('700 150px Clash'), document.fonts.load('600 50px Clash'), document.fonts.load('500 22px Satoshi'),
    document.fonts.load('700 34px Satoshi'), document.fonts.load('italic 230px Fraunces'),
  ]);

  // ---------- vidéos des cartes : séquences d'images à 30 i/s, préchargées ----------
  const SEQ = { signe: 150, keys: 90, ct: 150, ct2: 120, pneu: 120, moteur: 120, moteur2: 90 };
  const IMG = {};
  // chargement robuste : une image à la fois par séquence, nouvel essai si le décodage échoue
  const load = (src, tries = 4) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => (tries > 1 ? load(src, tries - 1).then(res, rej) : rej(new Error(src))); im.src = src; });
  for (const [k, n] of Object.entries(SEQ)) { IMG[k] = []; for (let i = 0; i < n; i++) IMG[k].push(await load(`seq/${k}/${String(i + 1).padStart(3, '0')}.jpg`)); }
  const polo = new Image(); polo.src = '../assets/photos-mo5/polo-cut.png'; await polo.decode();
  const coins = new Image(); coins.src = '../film-mo5/frames/22168.jpg'; await coins.decode();
  function drawSeq(cv, key, tt) {
    const fr = IMG[key], n = fr.length; let i = Math.max(0, Math.floor(tt * 30)); const c = i % (2 * n - 2); i = c < n ? c : 2 * n - 2 - c;
    const im = fr[i], ctx = cv.getContext('2d'); const r = Math.max(cv.width / im.width, cv.height / im.height);
    const w = im.width * r, h = im.height * r; ctx.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
  }

  // ---------- caméra ----------
  // A (0–4) : orbite lente autour du calcul · B (4–5,95) : neutre, puis poussée dans la carte des clés · C (5,95–9,5) : contre-plongée sur la Polo
  // travellings : la caméra suit le trait de lumière, recule pour révéler, glisse en arc pendant l'attente
  function camA(t) {
    return {
      rx: track(t, [[0, 10], [1.3, 7, { f: 0.5, z: 1 }], [2.5, 4, { f: 0.35, z: 1 }]]) + noise(1, t * 0.45) * 0.5,
      ry: track(t, [[0, -12], [0.2, -4, { f: 0.45, z: 1 }], [2.5, 7, { f: 0.3, z: 1 }]]) + noise(2, t * 0.4) * 0.7,
      z: track(t, [[0, 130], [1.35, -30, { f: 0.6, z: 1 }], [2.55, 140, { f: 0.35, z: 1 }]]),
      x: track(t, [[0, -100], [0.25, 150, { f: 0.6, z: 1 }], [1.4, 0, { f: 0.6, z: 1 }], [2.55, 70, { f: 0.35, z: 1 }]]),
      y: track(t, [[0, -120], [0.7, 120, { f: 0.6, z: 1 }], [1.4, 0, { f: 0.6, z: 1 }], [2.55, 90, { f: 0.35, z: 1 }]]),
      f: 0 };
  }
  const ID = { rx: 0, ry: 0, z: 0, x: 0, y: 0, f: 0 };
  function mixCam(a, b, w) { const o = {}; for (const k in ID) o[k] = lerp(a[k], b[k], w); return o; }
  // B : glisse le long des palettes, puis pousse dans la carte des clés
  function camB(t) {
    return { rx: noise(3, t * 0.4) * 0.4 + 2 * S(t, 5.2, P.push), ry: track(t, [[4.3, -8], [4.35, 6, { f: 0.5, z: 1 }], [5.1, 0, { f: 0.8, z: 1 }]]) + noise(4, t * 0.35) * 0.6,
      z: track(t, [[0, 0], [5.3, 1420, P.push]]), x: track(t, [[4.3, -150], [4.35, 150, { f: 0.55, z: 1 }], [5.0, 0, { f: 0.8, z: 1 }]]), y: 0, f: 0 };
  }
  // la Polo entre par la droite et freine : rapide puis de plus en plus doux (ressort critique)
  const carX = (t) => track(t, [[0, 1350], [5.98, 0, { f: 1.15, z: 1 }]]);
  // C : la caméra accompagne la voiture, puis remonte le long de la pile en orbite lente
  function camC(t) {
    return { rx: track(t, [[5.95, 10], [5.95, 5, P.drift]]) + noise(5, t * 0.4) * 0.4, ry: track(t, [[5.95, -14], [5.95, -4, P.drift], [7.6, 3, { f: 0.22, z: 1 }]]) + noise(6, t * 0.35) * 0.6,
      z: track(t, [[5.95, -260], [5.95, 0, { f: 0.55, z: 1 }], [7.6, 90, { f: 0.25, z: 1 }]]), x: 0.32 * carX(t) + track(t, [[7.0, 0], [7.0, -40, { f: 0.25, z: 1 }]]),
      y: track(t, [[6.9, 0], [7.0, -110, { f: 0.28, z: 1 }]]), f: 0 };
  }
  const tf = (c, z, extra = '') => `perspective(1700px) translateZ(${f3(c.z)}px) rotateX(${f3(c.rx)}deg) rotateY(${f3(c.ry)}deg) translate3d(${f3(-c.x)}px,${f3(-c.y)}px,${f3(z)}px) ${extra}`;
  const dof = (c, z) => clamp(Math.abs(z + c.z - c.f) * 0.008, 0, 9);

  // ---------- couches ----------
  // fond A : pièces floues, chaudes
  const bgA = el('div', 'L', stage);
  const bgImg = el('div', 'abs', bgA, `left:-160px;top:-260px;width:1400px;height:2440px;background:url(${coins.src}) center/cover;filter:blur(16px) brightness(.85) saturate(1.2)`);
  el('div', 'abs', bgA, 'left:0;top:0;width:1080px;height:1920px;background:radial-gradient(62% 40% at 50% 48%,rgba(8,7,10,.2),rgba(8,7,10,.93))');
  // fond C : garage sombre, faisceau, sol quadrillé
  const bgC = el('div', 'L', stage, 'background:radial-gradient(70% 50% at 50% 62%,#1d1520,#08070a 75%)');
  const cone = el('div', 'abs', bgC, 'left:-210px;top:-300px;width:1500px;height:1500px;background:conic-gradient(from 180deg at 50% 0%,transparent 160deg,rgba(255,138,76,.10) 175deg,rgba(255,179,138,.17) 180deg,rgba(255,138,76,.10) 185deg,transparent 200deg);filter:blur(30px);mix-blend-mode:screen');
  const floor = el('div', 'abs', bgC, 'left:-300px;top:1500px;width:1680px;height:900px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.055) 0 2px,transparent 2px 120px),repeating-linear-gradient(0deg,rgba(255,255,255,.055) 0 2px,transparent 2px 120px);transform:perspective(900px) rotateX(72deg);transform-origin:50% 0;-webkit-mask-image:linear-gradient(transparent,#000 30%,#000 60%,transparent)');
  const glowC = el('div', 'glow', bgC, 'left:90px;top:1180px;width:900px;height:420px;background:radial-gradient(closest-side,rgba(255,110,40,.42),transparent)');

  // couche A : « 5 000 », « − 3 500 », la barre (écrite à la lumière)
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
    const left = cx - x / 2; const fam = font.split(' ').slice(2).join(' '), wt = font.split(' ')[0], it = opts.italic ? 'italic' : 'normal';
    for (const g of items) {
      g.cx = left + g.x + g.w / 2; g.left = left + g.x;
      g.g = sv('g', {}, parent);
      const L = size * 7;
      g.stroke = sv('text', { x: left + g.x, y: base, 'font-family': fam, 'font-weight': wt, 'font-style': it, 'font-size': size, fill: 'none', stroke: opts.strokeColor || '#ffd9c2', 'stroke-width': opts.sw || 2.4, 'stroke-dasharray': `${L} ${L}`, 'stroke-dashoffset': L, 'stroke-linejoin': 'round' }, g.g);
      g.fill = sv('text', { x: left + g.x, y: base, 'font-family': fam, 'font-weight': wt, 'font-style': it, 'font-size': size, fill: opts.fill || '#f6efe7' }, g.g);
      g.stroke.textContent = g.ch; g.fill.textContent = g.ch; g.L = L;
    }
    return { items, left, width: x };
  }
  const wA = word(svgA, '5 000', '700 150px Clash', 150, 540, 700);
  const wB = word(svgA, '− 3 500', '700 150px Clash', 150, 540, 872);
  wB.items[0].fill.setAttribute('fill', '#ff8a4c');
  // reflet qui balaie le calcul à l'image 0 (déjà lisible : le hook est composé dès la frame 0)
  const shA = sv('g', {}, svgA);
  for (const w of [wA, wB]) for (const g of w.items) { const s = sv('text', { x: g.left, y: g.fill.getAttribute('y'), 'font-family': 'Clash', 'font-weight': 700, 'font-size': 150, fill: 'url(#sheen)' }, shA); s.textContent = g.ch; }
  // la barre, tracée par un point de lumière
  const BAR = { x0: 196, x1: 884, y: 936 };
  const barGlow = sv('line', { x1: BAR.x0, y1: BAR.y, x2: BAR.x0, y2: BAR.y, stroke: '#ff8a4c', 'stroke-width': 16, 'stroke-linecap': 'round', filter: 'url(#soft)', opacity: 0.8 }, svgA);
  const bar = sv('line', { x1: BAR.x0, y1: BAR.y, x2: BAR.x0, y2: BAR.y, stroke: '#fff4ea', 'stroke-width': 7, 'stroke-linecap': 'round' }, svgA);
  const pen = sv('g', {}, svgA);
  sv('circle', { r: 46, fill: '#ff7a3a', opacity: 0.55, filter: 'url(#soft)' }, pen); sv('circle', { r: 11, fill: '#fff' }, pen);
  const flare = el('div', 'abs', LA, 'left:40px;top:930px;width:1000px;height:12px;border-radius:6px;background:linear-gradient(90deg,transparent,rgba(255,179,138,.85),#fff,rgba(255,179,138,.85),transparent);filter:blur(2px);mix-blend-mode:screen;transform-origin:540px 6px');

  // couche C : « 1 500 € ? », écrit par une fente de lumière, puis devient le compteur
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
  // instants où la fente quitte chaque glyphe (la couleur arrive juste après le trait)
  const slitX = (t) => lerp(wC.left - 40, wC.left + wC.width + 30, S(t, 0.72, P.pen));
  for (const g of wC.items) { let tt = 0.72; while (tt < 3 && slitX(tt) < g.left + g.w) tt += 1 / 120; g.tEnd = tt; let ts = 0.72; while (ts < 3 && slitX(ts) < g.left) ts += 1 / 120; g.tStart = ts; }

  // compteur : 4 cases de verre, tracées à la lumière ; les chiffres de « 1 500 » viennent s'y poser
  const CNT = { top: 300, w: 124, h: 172, gap: 12 };
  const LH = el('div', 'L', stage); // repère écran (HUD), sans caméra
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
  const VALS = [1500, 1314, 1236, 1211, 1051, 941, 801];
  const T = [7.0, 7.45, 7.9, 8.5, 8.95, 9.4];
  const digitAt = (v, p) => Math.floor(v / 10 ** p) % 10;
  const rollKeys = [0, 1, 2, 3].map((p) => {
    const keys = [[0, digitAt(1500, p)]]; let idx = digitAt(1500, p);
    for (let i = 1; i < VALS.length; i++) { const a = digitAt(VALS[i - 1], p), b = digitAt(VALS[i], p); if (a === b) continue; idx -= (a - b + 10) % 10; keys.push([T[i - 1] + 0.06 + (3 - p) * 0.035, idx, P.roll]); }
    return keys;
  });

  // couche B : JOUR 1 en palettes, la carte des clés qui s'ouvre d'un trait de lumière
  const LB = el('div', 'L', stage);
  const FL = ['J', 'O', 'U', 'R', '1']; const FX = [];
  { let x = 0; FL.forEach((c, i) => { if (i === 4) x += 40; FX.push(x); x += 132 + 10; }); const off = 540 - (x - 10) / 2; for (let i = 0; i < 5; i++) FX[i] += off; }
  const flaps = FL.map((c, i) => { const d = el('div', 'flapT glass', LB, `left:${FX[i]}px;top:690px`); el('div', 'sheen', d); const s = el('span', '', d); el('i', '', d); return { d, s }; });
  const keysLine = el('div', 'abs', LB, 'left:540px;top:1270px;height:6px;border-radius:3px;background:#fff;box-shadow:0 0 24px 6px rgba(255,120,50,.8)');
  const keysCard = el('div', 'glass', LB, 'left:180px;width:720px;padding:16px');
  const keysCv = el('canvas', '', keysCard, 'width:688px;height:100%;border-radius:24px;display:block'); keysCv.width = 688; keysCv.height = 400;

  // couche P : la Polo, son ombre, son reflet, le balayage de lumière, les étiquettes
  const LP = el('div', 'L', stage);
  const CAR = { left: 40, top: 1085, w: 1000 }; CAR.h = CAR.w * polo.height / polo.width;
  const shadow = el('div', 'abs', LP, `left:${CAR.left + 60}px;top:${CAR.top + CAR.h - 60}px;width:${CAR.w - 120}px;height:120px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.85),transparent)`);
  const refl = el('img', 'abs', LP, `left:${CAR.left}px;top:${CAR.top + CAR.h - 8}px;width:${CAR.w}px;transform:scaleY(-1);transform-origin:50% 0;opacity:.2;filter:blur(3px);-webkit-mask-image:linear-gradient(to top,#000,transparent 40%)`); refl.src = polo.src;
  const car = el('img', 'abs', LP, `left:${CAR.left}px;top:${CAR.top}px;width:${CAR.w}px`); car.src = polo.src;
  const sweep = el('div', 'abs', LP, `left:${CAR.left}px;top:${CAR.top}px;width:${CAR.w}px;height:${CAR.h}px;-webkit-mask-image:url(${polo.src});-webkit-mask-size:100% 100%;mix-blend-mode:screen`);
  // contour lumineux : tracé par la lumière à l'apparition, puis reste comme un liseré fin qui tient le bord
  const PC = window.POLO_CONTOUR;
  const csv = sv('svg', { width: CAR.w, height: CAR.h, viewBox: `0 0 ${PC.w} ${PC.h}`, style: `position:absolute;left:${CAR.left}px;top:${CAR.top}px;overflow:visible` }, LP);
  const cGlow = sv('path', { d: PC.d, fill: 'none', stroke: '#ff7a3a', 'stroke-width': 12, 'stroke-linejoin': 'round', filter: 'url(#cblur)', 'stroke-dasharray': `${PC.len} ${PC.len}` }, csv);
  const cdefs = sv('defs', {}, csv); const cf = sv('filter', { id: 'cblur', x: '-20%', y: '-20%', width: '140%', height: '140%' }, cdefs); sv('feGaussianBlur', { stdDeviation: 6 }, cf);
  const cLine = sv('path', { d: PC.d, fill: 'none', stroke: '#ffe2cf', 'stroke-width': 3.2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': `${PC.len} ${PC.len}` }, csv);
  const cPen = sv('g', {}, csv); sv('circle', { r: 30, fill: '#ff7a3a', opacity: 0.6, filter: 'url(#cblur)' }, cPen); sv('circle', { r: 7, fill: '#fff' }, cPen);
  // traînées de lumière derrière la voiture pendant qu'elle entre (feux et reflets étirés par la vitesse)
  const trails = [[0.62, 5], [0.7, 3], [0.8, 2]].map(([fy, h]) => el('div', 'abs', LP, `left:0;top:${CAR.top + CAR.h * fy}px;height:${h}px;border-radius:${h}px;background:linear-gradient(90deg,rgba(255,230,210,.9),rgba(255,120,50,.5),transparent);filter:blur(1px)`));
  const TAGS = [[180, 330, -8, '186 €'], [430, 225, 6, '78 €'], [715, 300, -5, '25 €'], [600, 470, 9, '160 €'], [95, 470, -12, '110 €'], [335, 385, -3, '140 €']];
  const tags = TAGS.map(([, , , txt]) => { const d = el('div', 'tag', LP); d.textContent = txt; return d; });

  // couche N : la notification du hook, puis la pile des débits
  const LN = el('div', 'L', stage);
  function notif(parent, seq, title, amt) {
    const d = el('div', 'glass notif', parent); el('div', 'sheen', d);
    const c = el('canvas', '', d); c.width = 372; c.height = 276;
    const tx = el('div', '', d); const a = el('div', 'app', tx); a.textContent = 'Compte courant · maintenant';
    const ti = el('div', 'ti', tx); ti.textContent = title; const am = el('div', 'am', tx); am.innerHTML = `<b>−</b> ${amt} €`;
    return { d, c, seq };
  }
  const hook = notif(LN, 'signe', 'Carte grise', '186,00');
  const NOTE = [['signe', 'Carte grise', '186,00'], ['ct', 'Contrôle technique', '78,00'], ['ct2', 'Contre-visite', '25,00'], ['pneu', '2 pneus', '160,00'], ['moteur', 'Vidange', '110,00'], ['moteur2', 'Plaquettes avant', '140,00']];
  const LS = el('div', 'L', stage);
  const stack = NOTE.map(([s, ti, am]) => notif(LS, s, ti, am));
  const mention = el('div', 'abs', stage, 'left:0;width:1080px;top:1004px;text-align:center;font:500 22px Satoshi;color:rgba(246,239,231,.5)'); mention.textContent = 'Exemple · prix moyens constatés';

  const flash = el('div', 'L', stage, 'background:radial-gradient(60% 45% at 50% 55%,#fff1e6,rgba(255,140,80,.6) 45%,transparent 75%);mix-blend-mode:screen');
  const grain = el('div', '', stage); grain.id = 'grain';
  const vign = el('div', '', stage); vign.id = 'vign';

  const set = (e, o) => { e.style.opacity = f3(clamp(o, 0, 1)); };

  // ---------- la frame t ----------
  function paint(t) {
    const tI = 2.44;                                     // impact de la notification
    const imp = t > tI ? Math.exp(-(t - tI) * 6.5) : 0; // énergie de l'impact
    const shake = t > tI ? 15 * Math.exp(-(t - tI) * 7) * Math.sin((t - tI) * 52) : 0;
    const out = S(t, 3.95, P.heavy);                     // sortie de la scène A
    const toC = sm(5.86, 5.98, t);                       // bascule vers la scène C (cachée par l'éclair)
    const cA = camA(t);

    // fonds
    bgA.style.transform = `translateY(${f3(260 * S(t, 3.95, P.heavy))}px) scale(${f3(1.06 + 0.04 * S(t, 0, P.soft) + 0.5 * S(t, 5.3, P.push))})`;
    bgImg.style.transform = `translate(${f3(noise(7, t * 0.3) * 20)}px,${f3(noise(8, t * 0.3) * 20)}px)`;
    set(bgA, 1 - toC);
    const cC = camC(t);
    set(bgC, toC);
    bgC.style.transform = tf(cC, -500, 'scale(1.35)');

    // scène A : calcul, barre, reflet
    const zA = -700 * out;
    LA.style.transform = tf(cA, zA, `translateX(${f3(shake * (1 - out))}px)`);
    LA.style.filter = `blur(${f3(dof(cA, zA) + 6 * out)}px)`;
    set(LA, 1 - sm(3.92, 4.3, t));
    const sp = -300 + 1700 * S(t, 0, { f: 0.9, z: 1 });     // reflet qui traverse le calcul
    const st = [[sp - 160, 0], [sp - 40, 0.55], [sp + 40, 0.55], [sp + 160, 0]];
    st.forEach(([x, o], i) => { sh[i].setAttribute('offset', f3(clamp(x / 1080, 0, 1))); sh[i].setAttribute('stop-opacity', f3(o)); });
    const pb = S(t, 0.22, P.pen);
    const bx = lerp(BAR.x0, BAR.x1, pb);
    bar.setAttribute('x2', f3(bx)); barGlow.setAttribute('x2', f3(bx));
    pen.setAttribute('transform', `translate(${f3(bx)},${BAR.y})`);
    pen.setAttribute('opacity', f3(sm(0.18, 0.3, t) * (1 - sm(0.95, 1.25, t))));
    barGlow.setAttribute('opacity', f3(0.55 + 0.45 * imp));
    flare.style.transform = `scaleX(${f3(0.15 + 0.85 * pb + 0.2 * imp)})`;
    set(flare, (0.25 + 0.75 * imp) * pb);
    set(glowA, 0.25 + 0.55 * S(t, 1.0, P.heavy) * (1 - out) + 0.5 * imp);

    // scène C du hook : « 1 500 € ? » → compteur
    const wB2 = S(t, 3.95, P.heavy);
    const cCnum = mixCam(cA, ID, wB2);
    LC.style.transform = tf(cCnum, 0, `translateX(${f3(shake * 1.3 * (1 - wB2))}px)`);
    const sx = slitX(t);
    slit.setAttribute('transform', `translate(${f3(sx)},1080)`);
    slit.setAttribute('opacity', f3(sm(0.66, 0.8, t) * (1 - sm(1.25, 1.5, t))));
    set(glowCnum, (0.15 + 0.75 * S(t, 1.05, P.heavy) + 0.6 * imp) * (1 - sm(4.0, 4.6, t)));
    // positions d'arrivée des chiffres dans le compteur
    const vis4 = 1 - S(t, T[4] + 0.06, P.heavy);          // la case des milliers disparaît à 941 €
    const nCells = 3 + vis4; const totalW = nCells * CNT.w + (nCells - 1) * CNT.gap + 18 + 76;
    const x0 = 540 - totalW / 2 - (1 - vis4) * 0; const cellX = [];
    let cx = x0; for (let i = 0; i < 4; i++) { const k = i === 0 ? vis4 : 1; cellX.push(cx); cx += (CNT.w + CNT.gap) * k; }
    const euroX = cx + 6;
    const mv = S(t, 4.0, { f: 1.25, z: 1 });               // les glyphes montent vers les cases
    const swap = sm(4.72, 4.84, t);                        // relais vers les vrais chiffres (identiques)
    wC.items.forEach((g, i) => {
      const p = clamp((sx - g.left) / g.w, 0, 1);
      const dr = S(t, g.tStart, P.draw);
      g.stroke.setAttribute('stroke-dashoffset', f3(g.L * (1 - dr)));
      g.stroke.setAttribute('opacity', f3(sm(0, 0.15, p) * (1 - sm(0.2, 0.6, S(t, g.tEnd + 0.05, P.rise)))));
      const fi = S(t, g.tEnd - 0.04, P.rise);
      g.fill.setAttribute('opacity', f3(fi * (1 - swap)));
      // cible : centre de la case i (le « € » va à droite des cases)
      const s = lerp(1, 128 / 184, mv);
      const tx = i < 4 ? cellX[i] + CNT.w / 2 : euroX + 34, ty = CNT.top + CNT.h / 2 + 44 * (i < 4 ? 1 : 0.85);
      const ox = lerp(g.cx, tx, mv), oy = lerp(1150 - 70, ty - 44, mv);
      g.g.setAttribute('transform', `translate(${f3(ox)},${f3(oy + 70 * (1 - mv) + (1 - fi) * 34)}) scale(${f3(s)}) translate(${f3(-g.cx)},-1080)`);
    });
    const q = qWord.items[0];
    const qd = S(t, 1.28, P.draw);
    q.stroke.setAttribute('stroke-dashoffset', f3(q.L * (1 - qd)));
    q.stroke.setAttribute('opacity', f3(sm(1.26, 1.36, t) * (1 - sm(1.7, 2.1, t))));
    const qf = S(t, 1.52, P.rise), qo = S(t, 3.9, { f: 1.6, z: 1 });
    q.fill.setAttribute('opacity', f3(qf));
    q.g.setAttribute('opacity', f3(1 - qo));
    q.g.setAttribute('transform', `translate(${f3(q.cx)},${f3(1080 - 260 * qo + (1 - qf) * 30)}) scale(${f3(1 - 0.5 * qo)}) rotate(${f3(-10 * qo)}) translate(${f3(-q.cx)},-1080)`);

    // compteur (HUD) : cases tracées, verre, chiffres
    cells.forEach((c, i) => {
      const k = i === 0 ? vis4 : 1;
      const td = 4.32 + i * 0.07;
      const dr = S(t, td, P.draw), gl = S(t, td + 0.22, P.heavy);
      const X = cellX[i], sc = i === 0 ? 0.6 + 0.4 * vis4 : 1;
      for (const e of [c.c, c.o, c.d]) { e.style.transform = `translate(${f3(X)}px,${CNT.top}px) scale(${f3(sc)})`; e.style.transformOrigin = '0 50%'; }
      c.r.setAttribute('stroke-dashoffset', f3(600 * (1 - dr)));
      c.o.style.opacity = f3(sm(td - 0.02, td + 0.06, t) * (1 - 0.75 * gl) * k);
      set(c.c, gl * k);
      // chiffres : position de rouleau (index continu) ; visibles quand « 1 500 » s'est posé
      const idx = track(t, rollKeys[3 - i]);
      c.col.style.transform = `translateY(${f3(-(idx + 60) * CNT.h)}px)`;
      set(c.d, swap * k);
    });
    euro.style.transform = `translate(${f3(euroX)}px,${CNT.top}px)`; set(euro, swap);
    labelL.forEach((s, i) => { const p = S(t, 4.6 + i * 0.045, P.rise); s.style.opacity = f3(p); s.style.transform = `translateY(${f3((1 - p) * 18)}px)`; s.style.filter = `blur(${f3((1 - p) * 8)}px)`; });

    // scène B : JOUR 1, la carte des clés, la poussée
    const cB = camB(t);
    const lift = track(t, [[0, 0], [5.25, -300, P.heavy]]);
    LB.style.transform = tf(cB, 0, `translateY(${f3(lift)}px)`);
    LB.style.filter = `blur(${f3(clamp((cB.z - 900) / 80, 0, 10))}px)`;
    set(LB, sm(4.3, 4.4, t) * (1 - toC));
    flaps.forEach((f, i) => {
      const p = S(t, 4.42 + i * 0.07, P.flip);
      const letters = 'ARTVQMEZ';
      f.s.textContent = p < 0.72 ? letters[(Math.floor(p * 9) + i * 3) % letters.length] : FL[i];
      f.d.style.transform = `perspective(700px) rotateX(${f3((1 - p) * 92)}deg)`;
      f.d.style.opacity = f3(sm(0, 0.12, p));
    });
    const lw = S(t, 4.95, P.pen) * 720, lh = S(t, 5.18, P.rise);
    keysLine.style.width = `${f3(lw)}px`; keysLine.style.transform = `translateX(${f3(-lw / 2)}px)`;
    set(keysLine, sm(4.93, 5.0, t) * (1 - sm(5.2, 5.35, t)));
    const kh = 8 + 424 * lh;
    keysCard.style.top = `${f3(1273 - kh / 2)}px`; keysCard.style.height = `${f3(kh)}px`;
    set(keysCard, sm(5.12, 5.2, t));
    if (t > 5.1) drawSeq(keysCv, 'keys', t - 5.15);

    // la notification du hook : entre, percute, repart
    const hx = track(t, [[0, 1320], [2.2, 0, P.card]]), hrz = track(t, [[0, -16], [2.2, -4, P.card]]);
    const hy = 1300 + 1250 * S(t, 3.92, P.heavy), hr2 = 14 * S(t, 3.92, P.heavy);
    LN.style.transform = tf(cA, 160);
    hook.d.style.transform = `translate(${f3(150 + hx)}px,${f3(hy)}px) rotate(${f3(hrz + hr2)}deg)`;
    set(hook.d, sm(2.1, 2.16, t) * (1 - sm(4.4, 4.6, t)));
    if (t > 2.1 && t < 4.6) drawSeq(hook.c, 'signe', t - 2.1);

    // scène C : la Polo et la pile de débits
    const cin = S(t, 5.95, P.heavy);
    LP.style.transform = tf(cC, -80, `translateY(${f3((1 - cin) * 60)}px) scale(${f3(0.96 + 0.04 * cin)})`);
    set(LP, toC);
    const cx0 = carX(t), vel = (carX(t + 0.01) - carX(t - 0.01)) / 0.02;   // vitesse (px/s, négative : vers la gauche)
    const dip = 1.7 * Math.sin(Math.PI * clamp((t - 6.25) / 0.7, 0, 1)) * (t > 6.25 ? 1 : 0);
    car.style.transformOrigin = '18% 92%';
    car.style.transform = `translateX(${f3(cx0)}px) rotate(${f3(-dip)}deg)`;
    for (const e of [shadow, refl, sweep, csv]) e.style.transform = (e === refl ? 'scaleY(-1) ' : '') + `translateX(${f3(cx0)}px)`;
    const spd = clamp(-vel / 2600, 0, 1);
    trails.forEach((tr, i) => { tr.style.transform = `translateX(${f3(CAR.left + CAR.w * 0.55 + cx0)}px)`; tr.style.width = `${f3(80 + 900 * spd)}px`; set(tr, spd * (0.9 - i * 0.2)); });
    car.style.filter = `brightness(${f3(0.15 + 0.82 * S(t, 6.0, { f: 0.9, z: 1 }))}) contrast(1.05) drop-shadow(0 0 2px rgba(255,170,120,${f3(0.85 * cin)})) drop-shadow(0 0 26px rgba(255,110,40,${f3(0.45 * cin)}))`;
    const swx = lerp(-60, 160, S(t, 6.95, { f: 0.8, z: 1 }));
    sweep.style.background = `linear-gradient(105deg,transparent ${f3(swx - 14)}%,rgba(255,220,190,.55) ${f3(swx)}%,transparent ${f3(swx + 14)}%)`;
    const cp = S(t, 6.85, { f: 0.62, z: 1 });
    for (const e of [cGlow, cLine]) e.setAttribute('stroke-dashoffset', f3(PC.len * (1 - cp)));
    cGlow.setAttribute('opacity', f3(sm(6.85, 6.9, t) * (0.9 - 0.45 * sm(7.8, 8.5, t))));
    const pt = cLine.getPointAtLength(PC.len * Math.min(cp, 0.9999));
    cPen.setAttribute('transform', `translate(${f3(pt.x)},${f3(pt.y)})`);
    cPen.setAttribute('opacity', f3(sm(6.85, 6.92, t) * (1 - sm(7.62, 7.9, t))));
    set(glowC, 0.5 + 0.5 * cin);
    cone.style.opacity = f3(0.6 + 0.4 * cin);
    floor.style.opacity = f3(cin);
    TAGS.forEach(([x, y, r], i) => {
      const t0 = T[i] + 0.3, p = clamp(S(t, t0, P.tag), 0, 1.2), pr = S(t, t0, P.tag);
      const sx0 = 360 - CAR.left, sy0 = 700 - CAR.top;  // départ : le montant de la carte de devant
      const px = lerp(sx0, x, Math.min(p, 1)), py = lerp(sy0, y, Math.min(p, 1)) - 260 * Math.sin(Math.PI * Math.min(p, 1));
      tags[i].style.transform = `translate(${f3(CAR.left + px)}px,${f3(CAR.top + py)}px) rotate(${f3(lerp(-20, r, pr))}deg) scale(${f3(1.3 - 0.3 * Math.min(p, 1))})`;
      tags[i].style.opacity = f3(sm(t0, t0 + 0.06, t));
    });

    LS.style.transform = tf(cC, 0);
    set(LS, toC);
    stack.forEach((n, k) => {
      let d = 0; for (let j = k + 1; j < T.length; j++) d += S(t, T[j], P.card);
      const ein = S(t, T[k], P.card);
      const y = 640 - 58 * d + (1 - ein) * 60, z = -210 * d, xin = lerp(1180, 150, ein), rz = (k % 2 ? 1.8 : -2.2) * ein + (1 - ein) * -9;
      n.d.style.transform = `translate(${f3(xin)}px,${f3(y)}px) translateZ(0) perspective(1300px) translateZ(${f3(z)}px) rotateX(${f3(4 + 4 * d)}deg) rotate(${f3(rz)}deg)`;
      n.d.style.filter = `brightness(${f3(1 - 0.17 * d)}) blur(${f3(Math.min(6, d * 1.1))}px)`;
      n.d.style.opacity = f3(sm(T[k] - 0.06, T[k], t) * (1 - sm(2.2, 3.2, d)));
      if (t > T[k] - 0.1) drawSeq(n.c, n.seq, t - T[k] + 0.5);
    });
    set(mention, sm(7.1, 7.5, t)); mention.style.transform = `translateY(${f3((1 - sm(7.1, 7.6, t)) * 12)}px)`;

    // éclair qui cache la bascule vers la scène C
    set(flash, 0.9 * sm(5.7, 5.93, t) * (1 - sm(5.95, 6.35, t)) + 0.18 * imp);
    grain.style.transform = `translate(${(Math.floor(t * 24) * 53) % 211}px,${(Math.floor(t * 24) * 97) % 173}px)`;
  }

  // flou de bougé : obturateur ouvert sur les gestes rapides
  const WIN = [[2.15, 2.55, 1], [3.9, 4.35, 0.6], [4.4, 4.75, 0.5], [5.35, 6.05, 1], [0.2, 0.9, 0.35], [0.7, 1.3, 0.4]];
  WIN.push([5.95, 6.75, 1]);
  T.forEach((x) => { WIN.push([x - 0.06, x + 0.3, 0.7]); WIN.push([x + 0.3, x + 0.75, 0.35]); });
  const fast = (t) => { let s = 0; for (const [a, b, v] of WIN) s = Math.max(s, v * sm(a - 0.05, a + 0.05, t) * (1 - sm(b - 0.05, b + 0.05, t))); return s; };
  window.shutter = (t) => Math.max(0.15, fast(t));
  window.samples = (t) => (fast(t) > 0.3 ? 4 : 2);
  window.seek = (t) => paint(t);
  paint(0);
  window.filmReady = true;
})();
