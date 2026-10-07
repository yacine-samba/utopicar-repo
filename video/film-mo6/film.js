// MO6 « Ce qui se voit, ce qui se cache » (30,0 s). Contrat : window.seek(t) peint la frame t, sans état entre les frames.
// window.shutter(t) / window.samples(t) : flou de bougé au rendu (MB=4).
// Minutage provisoire (docs/timeline-mo6.md) : recalé sur la voix à l'étape 4 en ne touchant que l'objet K.
(async function () {
  const { spring, track, clamp, lerp, noise } = Motion;
  const stage = document.getElementById('stage');
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, cls, parent, style) => { const e = document.createElement(tag); if (cls) e.className = cls; if (style) e.setAttribute('style', style); (parent || stage).appendChild(e); return e; };
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const S = (t, t0, p) => spring(t - t0, p);
  const sm = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  const eo = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return 1 - Math.pow(1 - u, 3); };
  const f3 = (x) => x.toFixed(3);
  const DUR = 30.0;
  const P = {
    pen: { f: 1.05, z: 1 }, draw: { f: 1.35, z: 1 }, rise: { f: 1.9, z: 1 }, card: { f: 2.2, z: 0.78 }, soft: { f: 0.32, z: 1 },
    heavy: 'heavy', roll: { f: 1.7, z: 0.95 }, cam: { f: 0.85, z: 1 }, camS: { f: 0.6, z: 1 }, wipe: { f: 0.9, z: 1 }, pop: { f: 2.0, z: 0.72 },
  };
  // ---------- minutage (seul endroit à recaler sur la voix) ----------
  // calé sur audio/vo-mo6/vo-timing.json (prise A, atempo 1,12) : chaque geste tombe sur le mot qui le nomme
  const K = {
    scan: 0.15, tags: 1.0, w100: 2.5, arrow: 3.3, w600: 3.85, hookOut: 4.75,
    ph: 4.75, phWipe: 5.35, ph20: 5.95, c20: 6.5,
    ra: 6.5, raWipe: 6.85, ra30: 7.45, c50: 7.95,
    inn: 7.9, in50: 8.9, c100: 9.4, dust: 9.3,
    back: 9.45, gain: 9.35,
    xr: 10.25, txtX: 10.4, txtX2: 11.45, xrOut: 12.3,
    eng: 12.25, dist: 12.7, fact: 14.0, emb: 15.15, gauge: 16.55, revs: 18.25, patine: 20.45, gaugeOut: 21.15,
    cul: 21.45, cap: 23.2, unscrew: 23.45, foam: 24.05, mef: 25.1,
    chute: 25.85, perso: 27.35, perso2: 28.3, out: 28.95,
  };

  await Promise.all([
    document.fonts.load('700 150px Clash'), document.fonts.load('600 50px Clash'), document.fonts.load('500 22px Satoshi'),
    document.fonts.load('700 34px Satoshi'), document.fonts.load('italic 230px Fraunces'),
  ]);

  // ---------- images et séquences (30 i/s, chargement séquentiel avec relance) ----------
  const load = (src, tries = 4) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => (tries > 1 ? load(src, tries - 1).then(res, rej) : rej(new Error(src))); im.src = src; });
  const SEQ = { polish: 120, moquette: 120, dash: 106, moteur: 120 };
  const IMG = {};
  for (const [k, n] of Object.entries(SEQ)) { IMG[k] = []; for (let i = 0; i < n; i++) IMG[k].push(await load(`seq/${k}/${String(i + 1).padStart(3, '0')}.jpg`)); }
  const polo = await load('../assets/photos-mo5/polo-cut.png');
  for (const f of ['crasse', 'phares', 'rayure']) await load(`../assets/photos-mo6/${f}.png`);
  function drawSeq(cv, key, tt, once = false) {
    const fr = IMG[key], n = fr.length; let i = Math.max(0, Math.floor(tt * 30));
    if (once) i = Math.min(i, n - 1); else { const c = i % (2 * n - 2); i = c < n ? c : 2 * n - 2 - c; }
    const im = fr[i], ctx = cv.getContext('2d'); const r = Math.max(cv.width / im.width, cv.height / im.height);
    const w = im.width * r, h = im.height * r; ctx.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
  }

  // ---------- caméra : un point du monde amené au point focal de l'écran ----------
  const FY = 1000;
  const C0 = { x: 540, y: 1040, s: 1.0, rx: 3, ry: -9 };
  const CAR = { left: 40, top: 760, w: 1000, h: 638 };
  const wp = (cx, cy) => [CAR.left + cx, CAR.top + cy];          // point de la voiture → monde
  const PT = { phare: wp(441, 394), rayure: wp(791, 307), pare: wp(520, 140), belt: wp(118, 300), clutch: wp(430, 369), culasse: wp(300, 262), bouchon: wp(320, 251) };
  const KEYS = {
    x: [[0, C0.x], [K.ph, PT.phare[0] + 40, P.cam], [K.ra, PT.rayure[0] - 20, P.cam], [K.inn, PT.pare[0], P.cam], [K.back, 540, P.camS], [K.eng, 400, P.cam], [K.dist, PT.belt[0] + 80, P.cam],
      [K.emb, PT.clutch[0], P.cam], [K.cul, PT.culasse[0] + 40, P.cam], [K.cap, PT.bouchon[0], P.cam], [K.chute, 540, P.camS]],
    y: [[0, C0.y], [K.ph, PT.phare[1] - 85, P.cam], [K.ra, PT.rayure[1] - 90, P.cam], [K.inn, PT.pare[1] - 30, P.cam], [K.back, 1040, P.camS], [K.eng, 1110, P.cam], [K.dist, PT.belt[1] + 30, P.cam],
      [K.emb, PT.clutch[1], P.cam], [K.cul, PT.culasse[1] + 40, P.cam], [K.cap, PT.bouchon[1], P.cam], [K.chute, 1050, P.camS]],
    s: [[0, 1.0], [0.3, 1.04, P.soft], [K.ph, 2.1, P.cam], [K.ra, 2.0, P.cam], [K.inn, 1.6, P.cam], [K.back, 0.94, P.camS], [K.xr, 1.0, P.soft], [K.eng, 1.65, P.cam], [K.dist, 1.95, P.cam],
      [K.emb, 2.05, P.cam], [K.gauge, 3.4, { f: 1.1, z: 1 }], [K.gaugeOut, 2.05, { f: 1.1, z: 1 }], [K.cul, 2.1, P.cam], [K.cap, 3.6, { f: 1.0, z: 1 }], [K.chute, 0.93, P.camS]],
    ry: [[0, C0.ry], [K.ph, -4, P.cam], [K.ra, -13, P.cam], [K.inn, -6, P.cam], [K.back, -15, P.camS], [K.xr, 11, { f: 0.3, z: 1 }], [K.eng, 4, P.cam], [K.emb, -3, P.cam], [K.cul, 5, P.cam], [K.chute, -7, P.camS]],
    rx: [[0, C0.rx], [K.ph, 2, P.cam], [K.back, 5, P.camS], [K.eng, 8, P.cam], [K.chute, 4, P.camS]],
  };
  function cam(t) {
    const c = {}; for (const k in KEYS) c[k] = track(t, KEYS[k]);
    const na = sm(0, 1.2, t); c.rx += noise(1, t * 0.45) * 0.5 * na; c.ry += noise(2, t * 0.4) * 0.7 * na; c.x += noise(3, t * 0.3) * 6 * na; c.y += noise(4, t * 0.3) * 6 * na;
    // retour exact à la pose de l'image 0
    const w = sm(K.out - 0.05, 29.95, t); for (const k in C0) c[k] = lerp(c[k], C0[k], w);
    if (t >= 29.95) for (const k in C0) c[k] = C0[k];
    return c;
  }
  // l'image 0 et la dernière image doivent porter le même bruit : on l'éteint aux bords
  const camT = (t) => { const c = cam(t); return c; };
  const camTf = (c) => `translate(540px,${FY}px) perspective(1700px) rotateX(${f3(c.rx)}deg) rotateY(${f3(c.ry)}deg) scale(${f3(c.s)}) translate(${f3(-c.x)}px,${f3(-c.y)}px)`;

  // ---------- fond ----------
  const bg = el('div', 'L', stage, 'background:radial-gradient(70% 45% at 50% 54%,#1d1512,#08070a 74%)');
  const cone = el('div', 'abs', bg, 'left:-210px;top:-260px;width:1500px;height:1500px;background:conic-gradient(from 180deg at 50% 0%,transparent 160deg,rgba(255,138,76,.10) 175deg,rgba(255,179,138,.17) 180deg,rgba(255,138,76,.10) 185deg,transparent 200deg);filter:blur(30px);mix-blend-mode:screen');
  const fullCv = el('canvas', 'abs', bg, 'left:-120px;top:-120px;width:1320px;height:2160px;filter:blur(18px) brightness(.32) saturate(.7)'); fullCv.width = 420; fullCv.height = 700;

  // ---------- le monde (voiture, sol, radiographie) ----------
  const W = el('div', 'L', stage, 'transform-origin:0 0');
  const floor = el('div', 'abs', W, 'left:-700px;top:1330px;width:2480px;height:1100px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.055) 0 2px,transparent 2px 120px),repeating-linear-gradient(0deg,rgba(255,255,255,.055) 0 2px,transparent 2px 120px);transform:perspective(900px) rotateX(72deg);transform-origin:50% 0;-webkit-mask-image:radial-gradient(50% 60% at 50% 20%,#000,transparent)');
  const glowW = el('div', 'glow', W, 'left:140px;top:1180px;width:800px;height:340px;background:radial-gradient(closest-side,rgba(255,100,40,.36),transparent)');

  function buildCar(parent, mirror) {
    const c = el('div', 'abs', parent, `left:${CAR.left}px;top:${CAR.top}px;width:${CAR.w}px;height:${CAR.h}px;${mirror ? 'transform-origin:50% 50%' : ''}`);
    const inner = el('div', 'abs', c, `width:${CAR.w}px;height:${CAR.h}px;${mirror ? 'transform:scaleX(-1)' : ''}`);
    const shadow = el('div', 'abs', inner, `left:60px;top:${CAR.h - 60}px;width:${CAR.w - 120}px;height:120px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.85),transparent)`);
    const refl = el('img', 'abs', inner, `top:${CAR.h - 8}px;width:${CAR.w}px;transform:scaleY(-1);transform-origin:50% 0;opacity:.16;filter:blur(4px);-webkit-mask-image:linear-gradient(to top,#000,transparent 30%)`); refl.src = polo.src;
    const photo = el('div', 'abs', inner, `width:${CAR.w}px;height:${CAR.h}px`);
    const clean = el('img', 'abs', photo, `width:${CAR.w}px`); clean.src = polo.src;
    const o = { c, inner, photo, clean, refl, shadow };
    if (!mirror) {
      for (const f of ['crasse', 'phares', 'rayure']) { o[f] = el('img', 'abs', photo, `width:${CAR.w}px`); o[f].src = `../assets/photos-mo6/${f}.png`; }
      o.reflDirty = el('img', 'abs', inner, `top:${CAR.h - 8}px;width:${CAR.w}px;transform:scaleY(-1);transform-origin:50% 0;opacity:.14;filter:blur(4px);-webkit-mask-image:linear-gradient(to top,#000,transparent 30%)`);
      o.reflDirty.src = '../assets/photos-mo6/crasse.png';
    } else {
      // plaque vierge (le miroir rendrait le texte à l'envers)
      const ps = sv('svg', { width: CAR.w, height: CAR.h, style: 'position:absolute;left:0;top:0' }, photo);
      sv('polygon', { points: '61,435 241,464 239,518 60,484', fill: '#e8e4dc', stroke: '#2a2622', 'stroke-width': 3 }, ps);
      sv('polygon', { points: '61,435 74,437 73,486 60,484', fill: '#2c4fa8' }, ps);
    }
    // bande de lumière qui balaie la carrosserie (masquée par la silhouette)
    o.band = el('div', 'abs', inner, `width:${CAR.w}px;height:${CAR.h}px;-webkit-mask-image:url(${polo.src});-webkit-mask-size:100% 100%;mix-blend-mode:screen`);
    return o;
  }
  const A = buildCar(W, false);       // ta Polo
  const B = buildCar(W, true);        // la voiture « comme neuve »

  // contour lumineux + radiographie (dans le repère de la voiture A)
  const PC = window.POLO_CONTOUR;
  const xsv = sv('svg', { width: CAR.w, height: CAR.h, viewBox: `0 0 ${PC.w} ${PC.h}`, style: 'position:absolute;left:0;top:0;overflow:visible' }, A.inner);
  const xdefs = sv('defs', {}, xsv);
  const gF = sv('filter', { id: 'xg', x: '-30%', y: '-30%', width: '160%', height: '160%' }, xdefs);
  sv('feGaussianBlur', { stdDeviation: 4, result: 'b' }, gF); { const m = sv('feMerge', {}, gF); sv('feMergeNode', { in: 'b' }, m); sv('feMergeNode', { in: 'b' }, m); sv('feMergeNode', { in: 'SourceGraphic' }, m); }
  const hF = sv('filter', { id: 'xh', x: '-60%', y: '-60%', width: '220%', height: '220%' }, xdefs);
  sv('feGaussianBlur', { stdDeviation: 9, result: 'b' }, hF); { const m = sv('feMerge', {}, hF); sv('feMergeNode', { in: 'b' }, m); sv('feMergeNode', { in: 'b' }, m); sv('feMergeNode', { in: 'SourceGraphic' }, m); }
  const rim = sv('path', { d: PC.d, fill: 'none', stroke: '#ffe2cf', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-dasharray': `${PC.len} ${PC.len}`, filter: 'url(#xg)' }, xsv);
  const XR = sv('g', { filter: 'url(#xg)' }, xsv);
  const st = { fill: 'none', stroke: '#ffd2b8', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const dim = { ...st, stroke: 'rgba(255,210,184,.38)', 'stroke-width': 1.6 };
  sv('path', { d: PC.d, ...st, fill: 'rgba(255,120,60,.05)' }, XR);
  sv('path', { d: 'M250 172 L405 42 L735 42 L690 205 Z M760 40 L800 36 L825 190 L700 200 Z', ...dim }, XR);
  for (const [cx, cy, r] of [[640, 500, 92], [958, 395, 62]]) { sv('circle', { cx, cy, r, ...st }, XR); sv('circle', { cx, cy, r: r * 0.45, ...dim }, XR); }
  const M = sv('g', { transform: 'translate(70 236) skewY(4)' }, XR);
  sv('rect', { x: 90, y: 52, width: 230, height: 110, rx: 10, ...st }, M);
  for (const x of [130, 190, 250]) sv('line', { x1: x, y1: 60, x2: x, y2: 154, ...dim }, M);
  sv('rect', { x: 410, y: 70, width: 120, height: 80, rx: 12, ...st }, M);
  sv('line', { x1: 530, y1: 110, x2: 575, y2: 250, ...dim }, M);
  sv('circle', { cx: 360, cy: 108, r: 18, ...dim }, M);
  const ORG = {
    distribution: 'M48 30 a22 22 0 1 1 0.1 0 M48 140 a30 30 0 1 1 0.1 0 M26 30 L18 140 M70 30 L78 140',
    embrayage: 'M406 108 a46 46 0 1 1 -0.1 0',
    culasse: 'M90 22 h230 a6 6 0 0 1 6 6 v18 a6 6 0 0 1 -6 6 h-230 a6 6 0 0 1 -6 -6 v-18 a6 6 0 0 1 6 -6 Z M261 14 a11 11 0 1 1 -0.1 0',
  };
  const org = {};
  for (const [k, d] of Object.entries(ORG)) {
    const base = sv('path', { d, ...st }, M);
    const hot = sv('path', { d, fill: 'none', stroke: '#ff5a1f', 'stroke-width': 5, 'stroke-linecap': 'round', filter: 'url(#xh)', opacity: 0 }, M);
    org[k] = { base, hot };
  }
  // repères (pour relier les étiquettes de l'écran aux pièces)
  const pinsA = {};
  for (const [k, [x, y]] of Object.entries({ phare: [441, 394], rayure: [791, 307], pare: [520, 120], belt: [118, 300], clutch: [430, 369], culasse: [300, 262] })) {
    pinsA[k] = el('div', 'pin', A.inner, `left:${x}px;top:${y}px`);
  }
  const pinB = el('div', 'pin', B.inner, 'left:300px;top:250px');

  const topFog = el('div', 'L', stage, 'background:linear-gradient(180deg,rgba(8,7,10,.92) 0,rgba(8,7,10,.82) 30%,rgba(8,7,10,0) 46%)');
  // ---------- écran : textes écrits à la lumière ----------
  const LT = el('div', 'L', stage);
  const svgT = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LT);
  const defs = sv('defs', {}, svgT);
  const qg = sv('linearGradient', { id: 'qg', x1: 0, y1: 0, x2: 1, y2: 0.3 }, defs);
  sv('stop', { offset: 0, 'stop-color': '#ff5a1f' }, qg); sv('stop', { offset: 0.55, 'stop-color': '#ff8a4c' }, qg); sv('stop', { offset: 1, 'stop-color': '#ffb38a' }, qg);
  const soft = sv('filter', { id: 'soft', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs); sv('feGaussianBlur', { stdDeviation: 7 }, soft);
  const glF = sv('filter', { id: 'gl', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
  sv('feGaussianBlur', { stdDeviation: 12, result: 'b' }, glF); { const m = sv('feMerge', {}, glF); sv('feMergeNode', { in: 'b' }, m); sv('feMergeNode', { in: 'SourceGraphic' }, m); }
  const cvm = document.createElement('canvas').getContext('2d');
  function word(parent, str, font, size, cx, base, opts = {}) {
    cvm.font = font; const gap = size * 0.24; const items = []; let x = 0;
    for (const ch of str) { if (ch === ' ') { x += gap; continue; } const w = cvm.measureText(ch).width; items.push({ ch, x, w }); x += w + (opts.track || 0); }
    const left = opts.align === 'right' ? cx - x : opts.align === 'left' ? cx : cx - x / 2;
    const fam = font.split(' ').slice(-1)[0], wt = opts.italic ? 500 : font.split(' ')[0], it = opts.italic ? 'italic' : 'normal';
    const grp = sv('g', {}, parent);
    for (const g of items) {
      g.cx = left + g.x + g.w / 2; g.left = left + g.x; g.base = base;
      g.g = sv('g', {}, grp);
      const L = size * 7;
      g.stroke = sv('text', { x: left + g.x, y: base, 'font-family': fam, 'font-weight': wt, 'font-style': it, 'font-size': size, fill: 'none', stroke: opts.strokeColor || '#ffd9c2', 'stroke-width': opts.sw || 2.4, 'stroke-dasharray': `${L} ${L}`, 'stroke-dashoffset': L, 'stroke-linejoin': 'round' }, g.g);
      g.fill = sv('text', { x: left + g.x, y: base, 'font-family': fam, 'font-weight': wt, 'font-style': it, 'font-size': size, fill: opts.fill || '#f6efe7' }, g.g);
      g.stroke.textContent = g.ch; g.fill.textContent = g.ch; g.L = L;
    }
    return { items, left, width: x, grp, cx, base };
  }
  function writeWord(w, t, t0, step = 0.05, dy = 26) {
    w.items.forEach((g, i) => {
      const ts = t0 + i * step, dr = S(t, ts, P.draw), fi = S(t, ts + 0.16, P.rise);
      g.stroke.setAttribute('stroke-dashoffset', f3(g.L * (1 - dr)));
      g.stroke.setAttribute('opacity', f3(sm(ts - 0.01, ts + 0.04, t) * (1 - 0.85 * fi)));
      g.fill.setAttribute('opacity', f3(fi));
      g.g.setAttribute('transform', `translate(0,${f3((1 - fi) * dy)})`);
    });
  }
  const IT = { italic: true, fill: 'url(#qg)', strokeColor: '#ffb38a', sw: 1.8 };
  const shadowTxt = 'filter:drop-shadow(0 0 26px rgba(255,120,50,.35)) drop-shadow(0 8px 18px rgba(0,0,0,.6))';
  // hook : 100 € → + 600 €
  const gHook = sv('g', { style: shadowTxt }, svgT);
  const w100 = word(gHook, '100 €', '700 150px Clash', 150, 540, 430);
  const arrow = sv('path', { d: 'M232 538 H332 M316 524 L336 538 L316 552', fill: 'none', stroke: '#ffb38a', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '200 200', 'stroke-dashoffset': 200, filter: 'url(#gl)' }, gHook);
  const w600 = word(gHook, '+ 600 €', 'italic 500 150px Fraunces', 150, 600, 590, IT);
  w600.grp.setAttribute('filter', 'url(#gl)');
  // prix des défauts visibles
  const gPrice = sv('g', { style: shadowTxt }, svgT);
  const wP = [['20 €', K.ph20], ['30 €', K.ra30], ['50 €', K.in50]].map(([s, t0]) => ({ w: word(gPrice, s, '700 170px Clash', 170, 540, 700), t0 }));
  const labP = el('div', 'abs', LT, 'left:0;width:1080px;top:480px;text-align:center;font:700 30px Satoshi;letter-spacing:.3em;color:#a59a90');
  const LABS = ['PHARES JAUNIS', 'RAYURE', 'INTÉRIEUR'];
  // l'écart gagné
  const wGain = word(gPrice, '+ 600 €', 'italic 500 190px Fraunces', 190, 540, 720, IT); wGain.grp.setAttribute('filter', 'url(#gl)');
  const labGain = el('div', 'abs', LT, 'left:0;width:1080px;top:470px;text-align:center;font:700 30px Satoshi;letter-spacing:.3em;color:#a59a90'); labGain.textContent = 'À LA REVENTE';
  // la bascule
  const gX = sv('g', { style: shadowTxt }, svgT);
  const wX1 = word(gX, 'Ce qui coûte', '700 112px Clash', 112, 540, 430);
  const wX2 = word(gX, 'ne se voit pas.', 'italic 500 118px Fraunces', 118, 540, 560, IT); wX2.grp.setAttribute('filter', 'url(#gl)');
  // les tests
  const wPat = word(svgT, 'Il patine.', 'italic 500 130px Fraunces', 130, 540, 1360, IT); wPat.grp.setAttribute('filter', 'url(#gl)');
  const wMef = word(svgT, 'Méfiance.', 'italic 500 130px Fraunces', 130, 540, 1400, IT); wMef.grp.setAttribute('filter', 'url(#gl)');
  // la chute
  const gC = sv('g', { style: shadowTxt }, svgT);
  const wC1 = word(gC, 'Personne n\'a regardé', '700 84px Clash', 84, 540, 360);
  const wC2 = word(gC, 'sous le bouchon.', 'italic 500 108px Fraunces', 108, 540, 480, IT); wC2.grp.setAttribute('filter', 'url(#gl)');

  // ---------- étiquettes de verre reliées aux pièces ----------
  const LL = el('div', 'L', stage);
  const leads = sv('svg', { width: 1080, height: 1920, style: 'position:absolute;left:0;top:0;overflow:visible' }, LL);
  function pill(k, v, x, y) {
    const d = el('div', 'glass pill', LL, `left:${x}px;top:${y}px`); el('div', 'sheen', d);
    const a = el('span', 'k', d); a.textContent = k; if (v) { const b = el('span', 'v', d); b.textContent = v; }
    const ln = sv('path', { fill: 'none', stroke: '#ffb38a', 'stroke-width': 2.6, filter: 'url(#gl)' }, leads);
    return { d, ln };
  }
  const tagPh = pill('Phares jaunis', '', 70, 1290), tagRa = pill('Rayure', '', 700, 690), tagIn = pill('Intérieur sale', '', 150, 690);
  const pDist = pill('Distribution', '600 €', 70, 690), pEmb = pill('Embrayage', '700 €', 560, 690), pCul = pill('Joint de culasse', '1 200 €', 330, 690);
  // relie une étiquette à un repère : le fil se trace depuis l'étiquette
  function link(p, pinEl, o, prog) {
    if (o < 0.002) { p.ln.setAttribute('opacity', 0); return; }
    const a = pinEl.getBoundingClientRect(), b = p.d.getBoundingClientRect();
    const px = a.left + a.width / 2, py = a.top + a.height / 2;
    const bx = clamp(px, b.left + 34, b.right - 34), by = py < b.top ? b.top : py > b.bottom ? b.bottom : b.top + b.height / 2;
    const ex = lerp(bx, px, prog), ey = lerp(by, py, prog);
    p.ln.setAttribute('d', `M${f3(bx)} ${f3(by)} Q${f3((bx + ex) / 2 + 30)} ${f3((by + ey) / 2)} ${f3(ex)} ${f3(ey)}`);
    p.ln.setAttribute('opacity', f3(o));
  }

  // ---------- compteur « Remise en état » ----------
  const LH = el('div', 'L', stage);
  const cLab = el('div', 'abs', LH, 'top:236px;left:0;width:1080px;text-align:center;font:700 28px Satoshi;letter-spacing:.3em;color:#a59a90'); cLab.textContent = 'REMISE EN ÉTAT';
  const CN = { top: 286, w: 104, h: 144, gap: 10 };
  const cells = [0, 1, 2].map(() => { const c = el('div', 'cell glass', LH); el('div', 'sheen', c); const d = el('div', 'digit', LH); const col = el('div', 'col', d); for (let k = 0; k < 20; k++) { const s = el('span', '', col); s.textContent = k % 10; } return { c, d, col }; });
  const euro = el('div', 'abs', LH, 'font:700 92px Clash;line-height:144px;white-space:nowrap'); euro.textContent = '€';
  // centaines, dizaines, unités : index déroulés (les dizaines passent 5 → 10 pour rouler vers l'avant)
  const ROLL = [[[0, 0], [K.c100 + 0.09, 1, P.roll]], [[0, 0], [K.c20 + 0.035, 2, P.roll], [K.c50 + 0.035, 5, P.roll], [K.c100 + 0.035, 10, P.roll]], [[0, 0]]];

  // ---------- cartes vidéo ----------
  const LV = el('div', 'L', stage);
  function vcard(w, h) { const d = el('div', 'glass card', LV); el('div', 'sheen', d); const c = el('canvas', '', d, `width:${w}px;height:${h}px`); c.width = w; c.height = h; return { d, c }; }
  const cPol = vcard(400, 250), cMoq = vcard(560, 350);
  // facture
  const fact = el('div', 'glass', LV, 'left:250px;top:1110px;width:580px;padding:28px 34px;border-radius:30px'); el('div', 'sheen', fact);
  fact.innerHTML += '<div style="font:700 24px Satoshi;letter-spacing:.24em;color:#a59a90">FACTURE</div><div style="font:700 34px Satoshi;margin-top:10px">Kit distribution + pompe à eau</div>';
  const fRows = ['Date du changement', 'Kilométrage'].map((s) => { const r = el('div', '', fact, 'display:flex;justify-content:space-between;align-items:center;margin-top:16px;font:500 30px Satoshi;color:rgba(246,239,231,.8)'); const a = el('span', '', r); a.textContent = s; const ck = sv('svg', { width: 44, height: 44, viewBox: '0 0 44 44' }, r); const p = sv('path', { d: 'M8 23 L18 33 L37 11', fill: 'none', stroke: '#ffb38a', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '60 60', 'stroke-dashoffset': 60, filter: 'url(#gl)' }, ck); return p; });

  // ---------- cadrans (embrayage) ----------
  const LG = el('div', 'L', stage);
  const gCard = el('div', 'glass', LG, 'left:90px;top:560px;width:900px;height:520px'); el('div', 'sheen', gCard);
  const gsv = sv('svg', { width: 900, height: 520, viewBox: '0 0 900 520', style: 'position:absolute;left:0;top:0' }, gCard);
  function dial(cx, cy, R, ticks, label) {
    sv('circle', { cx, cy, r: R, fill: 'rgba(8,7,10,.35)', stroke: 'rgba(255,255,255,.18)', 'stroke-width': 2 }, gsv);
    const A0 = 135, A1 = 405, ang = (v) => (A0 + (A1 - A0) * v) * Math.PI / 180;
    ticks.forEach((tk, i) => { const a = ang(i / (ticks.length - 1));
      sv('line', { x1: cx + Math.cos(a) * (R - 16), y1: cy + Math.sin(a) * (R - 16), x2: cx + Math.cos(a) * (R - 38), y2: cy + Math.sin(a) * (R - 38), stroke: '#f6efe7', 'stroke-width': 4, 'stroke-linecap': 'round' }, gsv);
      const tx = sv('text', { x: cx + Math.cos(a) * (R - 66), y: cy + Math.sin(a) * (R - 66) + 11, 'text-anchor': 'middle', fill: 'rgba(246,239,231,.8)', 'font-family': 'Clash', 'font-weight': 600, 'font-size': 30 }, gsv); tx.textContent = tk; });
    const trail = sv('path', { fill: 'none', stroke: '#ff5a1f', 'stroke-width': 14, 'stroke-linecap': 'round', opacity: 0.85, filter: 'url(#gl)' }, gsv);
    const needle = sv('line', { x1: cx, y1: cy, stroke: '#ffb38a', 'stroke-width': 7, 'stroke-linecap': 'round', filter: 'url(#gl)' }, gsv);
    sv('circle', { cx, cy, r: 14, fill: '#f6efe7' }, gsv);
    const lb = sv('text', { x: cx, y: cy + R + 50, 'text-anchor': 'middle', fill: 'rgba(246,239,231,.7)', 'font-family': 'Satoshi', 'font-weight': 700, 'font-size': 26, 'letter-spacing': 4 }, gsv); lb.textContent = label;
    return { cx, cy, R, ang, trail, needle };
  }
  const dRpm = dial(240, 240, 190, ['0', '1', '2', '3', '4', '5', '6', '7'], 'TOURS / MIN ×1000');
  const dKmh = dial(660, 240, 190, ['0', '40', '80', '120', '160', '200'], 'KM/H');
  dKmh.trail.setAttribute('opacity', 0); dKmh.needle.setAttribute('stroke', '#f6efe7');
  const setNeedle = (d, v, v0) => {
    const a = d.ang(v), r = d.R - 30; d.needle.setAttribute('x2', f3(d.cx + Math.cos(a) * r)); d.needle.setAttribute('y2', f3(d.cy + Math.sin(a) * r));
    if (v0 != null && v - v0 > 0.004) { const p0 = d.ang(v0), p1 = d.ang(v), rr = d.R - 24; d.trail.setAttribute('d', `M${f3(d.cx + Math.cos(p0) * rr)} ${f3(d.cy + Math.sin(p0) * rr)} A${rr} ${rr} 0 ${p1 - p0 > Math.PI ? 1 : 0} 1 ${f3(d.cx + Math.cos(p1) * rr)} ${f3(d.cy + Math.sin(p1) * rr)}`); }
    else d.trail.setAttribute('d', '');
  };
  const gTest = el('div', 'abs', LG, 'left:0;width:1080px;top:1170px;text-align:center;font:500 40px Satoshi;color:rgba(246,239,231,.85);white-space:nowrap');
  gTest.innerHTML = 'En 4<sup style="font-size:.6em">e</sup> à 50, plein gaz.';

  // ---------- la loupe (bouchon d'huile) ----------
  const LO = el('div', 'L', stage);
  const loupe = el('div', 'abs', LO, 'width:640px;height:640px;margin:-320px 0 0 -320px;border-radius:50%;overflow:hidden;background:radial-gradient(#221614,#08070a 75%);box-shadow:0 0 0 4px rgba(255,255,255,.35),0 0 0 22px rgba(255,255,255,.07),0 40px 80px rgba(0,0,0,.6),0 0 90px rgba(255,70,30,.4)');
  const lGlow = el('div', 'glow', loupe, 'left:140px;top:150px;width:360px;height:340px;background:radial-gradient(closest-side,rgba(255,50,20,.85),transparent)');
  const lsv = sv('svg', { width: 640, height: 640, viewBox: '0 0 320 320', style: 'position:absolute;left:0;top:0' }, loupe);
  // goulotte (dessous) : visible quand le bouchon s'en va
  const neck = sv('g', {}, lsv);
  sv('circle', { cx: 160, cy: 160, r: 70, fill: '#140d0c', stroke: '#ffd2b8', 'stroke-width': 2.5, filter: 'url(#xg)' }, neck);
  sv('circle', { cx: 160, cy: 160, r: 52, fill: '#0a0607', stroke: 'rgba(255,210,184,.4)', 'stroke-width': 1.5 }, neck);
  const FOAM = [[138, 172, 30, 20], [172, 186, 34, 21], [196, 160, 22, 17], [152, 146, 20, 13], [120, 148, 12, 9], [186, 208, 15, 9], [160, 165, 26, 18]];
  const foam = FOAM.map(([cx, cy, rx, ry]) => sv('ellipse', { cx, cy, rx, ry, fill: '#efe3cf' }, neck));
  const bub = [[132, 168, 4], [168, 180, 5], [196, 155, 3.5], [150, 142, 3]].map(([cx, cy, r]) => sv('circle', { cx, cy, r, fill: '#fff' }, neck));
  // bouchon (dessus) : se dévisse puis se soulève
  const cap = sv('g', {}, lsv);
  sv('circle', { cx: 160, cy: 160, r: 104, fill: '#191213', stroke: '#ffd2b8', 'stroke-width': 3, filter: 'url(#xg)' }, cap);
  sv('circle', { cx: 160, cy: 160, r: 84, fill: 'none', stroke: 'rgba(255,210,184,.5)', 'stroke-width': 2 }, cap);
  for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; sv('line', { x1: 160 + 104 * Math.cos(a), y1: 160 + 104 * Math.sin(a), x2: 160 + 118 * Math.cos(a), y2: 160 + 118 * Math.sin(a), stroke: 'rgba(255,210,184,.6)', 'stroke-width': 3, 'stroke-linecap': 'round' }, cap); }
  // pictogramme burette (huile)
  sv('path', { d: 'M118 170 h52 l22 -14 l18 6 l-10 4 l-30 24 h-52 z M130 170 v-12 h18 v12', fill: 'none', stroke: '#ffb38a', 'stroke-width': 3, 'stroke-linejoin': 'round' }, cap);
  sv('path', { d: 'M214 168 q4 8 0 12 q-4 -4 0 -12', fill: '#ffb38a' }, cap);
  const capRing = sv('circle', { cx: 160, cy: 160, r: 104, fill: 'none', stroke: '#ff5a1f', 'stroke-width': 5, filter: 'url(#xh)', opacity: 0 }, lsv);
  const lLead = sv('path', { fill: 'none', stroke: '#ffb38a', 'stroke-width': 2.6, filter: 'url(#gl)' }, leads);

  // ---------- carte « comme neuve » ----------
  const LB = el('div', 'L', stage);
  const neuve = el('div', 'glass', LB, 'left:560px;top:620px;padding:18px 28px;border-radius:26px;white-space:nowrap'); el('div', 'sheen', neuve);
  neuve.innerHTML += '<div style="font:700 34px Satoshi">Comme neuve</div><div style="font:500 26px Satoshi;color:rgba(246,239,231,.72);margin-top:6px">♥ <span id="hearts">0</span> personnes intéressées</div>';
  const hearts = neuve.querySelector('#hearts');

  const mention = el('div', 'abs', stage, 'left:0;width:1080px;top:1452px;text-align:center;font:500 22px Satoshi;color:rgba(246,239,231,.5)'); mention.textContent = 'Exemple · ordres de grandeur, petite citadine';
  const flash = el('div', 'L', stage, 'background:radial-gradient(60% 45% at 50% 55%,#fff1e6,rgba(255,140,80,.6) 45%,transparent 75%);mix-blend-mode:screen');
  const grain = el('div', '', stage); grain.id = 'grain';
  const vign = el('div', '', stage); vign.id = 'vign';

  const set = (e, o) => { const v = clamp(o, 0, 1); e.style.opacity = f3(v); e.style.visibility = v < 0.002 ? 'hidden' : 'visible'; };
  const setA = (e, o) => e.setAttribute('opacity', f3(clamp(o, 0, 1)));
  const fade = (t, a, b, c, d) => sm(a, b, t) * (1 - sm(c, d, t));

  // ---------- la frame t ----------
  function paint(t) {
    const c = camT(t);
    W.style.transform = camTf(c);
    const deep = sm(K.gauge, K.gauge + 0.4, t) * (1 - sm(K.gaugeOut - 0.1, K.gaugeOut + 0.3, t)) + sm(K.cap, K.cap + 0.45, t) * (1 - sm(K.chute - 0.1, K.chute + 0.4, t));
    set(topFog, sm(1.35, 1.9, c.s) * (1 - deep));
    W.style.filter = deep > 0.01 ? `blur(${f3(14 * deep)}px) brightness(${f3(1 - 0.55 * deep)})` : '';

    // fond : vidéo plein écran derrière les cadrans et la loupe
    const fv = fade(t, K.gauge, K.gauge + 0.5, K.gaugeOut - 0.2, K.gaugeOut + 0.2), fm = fade(t, K.cap, K.cap + 0.5, K.chute - 0.2, K.chute + 0.3);
    set(fullCv, Math.max(fv, fm));
    if (fv > 0.01) drawSeq(fullCv, 'dash', 0.2 + 0.85 * (t - K.gauge), true); else if (fm > 0.01) drawSeq(fullCv, 'moteur', t - K.cap);
    cone.style.opacity = f3(0.75 + 0.25 * Math.sin(2 * Math.PI * t / DUR));

    // --- voiture A : arrive par la gauche en fin de film, part à gauche à la chute
    const aOut = S(t, K.chute, { f: 0.9, z: 1 }), aIn = eo(K.out, 29.88, t);
    const ax = t < K.out ? -1500 * aOut : -1500 * (1 - aIn);
    A.c.style.transform = `translateX(${f3(ax)}px)`;
    set(A.c, t < K.out ? 1 - sm(K.chute + 0.6, K.chute + 0.9, t) : sm(K.out, K.out + 0.3, t));
    const reset = t > K.chute + 1.15;            // A est hors champ : elle redevient sale pour la boucle
    // nettoyages : chaque calque s'efface derrière la bande de lumière
    const wPh = reset ? 0 : S(t, K.phWipe, P.wipe), wRa = reset ? 0 : S(t, K.raWipe, P.wipe), wDu = reset ? 0 : S(t, K.dust, { f: 0.7, z: 1 });
    const mk = (p) => `linear-gradient(90deg,transparent ${f3(-8 + 116 * p)}%,#000 ${f3(-4 + 116 * p)}%)`;
    A.phares.style.webkitMaskImage = mk(wPh); A.rayure.style.webkitMaskImage = mk(wRa); A.crasse.style.webkitMaskImage = mk(wDu);
    A.reflDirty.style.webkitMaskImage = `linear-gradient(to top,#000,transparent 30%),${mk(wDu)}`; A.reflDirty.style.webkitMaskComposite = 'source-in';
    // bande : balayage du hook (0,15 → 1,4 s), puis chaque nettoyage ; immobile à l'image 0
    let bx = 0.28 + 0.84 * S(t, K.scan, { f: 0.62, z: 1 }), bo = 1 - sm(1.25, 1.55, t);
    const wins = [[K.phWipe, wPh], [K.raWipe, wRa], [K.dust, wDu]];
    for (const [t0, p] of wins) if (t > t0 - 0.05 && t < t0 + 1.4) { bx = -0.06 + 1.18 * p; bo = sm(t0 - 0.05, t0 + 0.05, t) * (1 - sm(t0 + 0.9, t0 + 1.3, t)); }
    if (t >= K.out) { bx = 0.28; bo = sm(K.out + 0.3, 29.9, t); }
    if (t < K.scan) { bx = 0.28; bo = 1; }
    const bp = bx * 100;
    A.band.style.background = `linear-gradient(100deg,transparent ${f3(bp - 7)}%,rgba(255,120,50,.35) ${f3(bp - 2.5)}%,rgba(255,240,228,.95) ${f3(bp)}%,rgba(255,120,50,.35) ${f3(bp + 2.5)}%,transparent ${f3(bp + 7)}%)`;
    set(A.band, bo);
    // brillance : la voiture propre gagne contraste et liseré
    const gloss = reset ? 0 : wDu;
    A.clean.style.filter = `contrast(${f3(1 + 0.12 * gloss)}) brightness(${f3(1 + 0.05 * gloss)}) drop-shadow(0 0 2px rgba(255,190,150,${f3(0.8 * gloss)})) drop-shadow(0 0 28px rgba(255,110,40,${f3(0.35 * gloss)}))`;
    const rimP = reset ? 0 : S(t, K.back + 0.1, { f: 0.62, z: 1 });
    rim.setAttribute('stroke-dashoffset', f3(PC.len * (1 - rimP)));
    setA(rim, sm(K.back + 0.1, K.back + 0.2, t) * (1 - sm(K.xr - 0.3, K.xr + 0.2, t)));
    // radiographie : une fente traverse la voiture, derrière elle la carrosserie devient transparente
    const xp = reset ? 0 : S(t, K.xr, { f: 0.55, z: 1 }), xback = 0;
    const xm = `linear-gradient(90deg,#000 ${f3(-10 + 125 * xp)}%,transparent ${f3(-3 + 125 * xp)}%)`;
    const pm = `linear-gradient(90deg,transparent ${f3(-10 + 125 * xp)}%,#000 ${f3(-3 + 125 * xp)}%)`;
    XR.style.webkitMaskImage = xm; XR.style.maskImage = xm;
    setA(XR, xp > 0.001 ? 1 : 0);
    A.photo.style.webkitMaskImage = xp > 0.001 ? pm : '';
    A.refl.style.opacity = f3(0.16 * (1 - xp)); A.reflDirty.style.opacity = f3(0.14 * (1 - xp));
    // organes chauds
    const heat = { distribution: fade(t, K.dist, K.dist + 0.25, K.emb - 0.2, K.emb + 0.2), embrayage: fade(t, K.emb, K.emb + 0.25, K.cul - 0.2, K.cul + 0.1), culasse: fade(t, K.cul, K.cul + 0.25, K.chute, K.chute + 0.4) };
    for (const k in org) { setA(org[k].hot, heat[k] * (0.85 + 0.15 * Math.sin(t * 9))); }
    // repères lumineux : allumés par le balayage du hook, puis sur la pièce chaude
    const lit = (x0) => sm(K.scan + 0.15 + x0 * 0.9, K.scan + 0.3 + x0 * 0.9, t) * (1 - sm(K.hookOut, K.hookOut + 0.3, t));
    set(pinsA.phare, lit(0.44) + fade(t, K.ph + 0.3, K.ph + 0.5, K.phWipe + 0.3, K.phWipe + 0.6));
    set(pinsA.rayure, lit(0.79) + fade(t, K.ra + 0.3, K.ra + 0.5, K.raWipe + 0.3, K.raWipe + 0.6));
    set(pinsA.pare, lit(0.52));
    set(pinsA.belt, heat.distribution); set(pinsA.clutch, heat.embrayage); set(pinsA.culasse, heat.culasse);

    // --- voiture B : « comme neuve »
    const bIn = S(t, K.chute + 0.15, { f: 0.85, z: 1 }), bOut = sm(K.out, K.out + 0.5, t);
    B.c.style.transform = `translateX(${f3(1500 * (1 - bIn) + 1500 * bOut)}px)`;
    set(B.c, sm(K.chute, K.chute + 0.2, t) * (1 - sm(K.out + 0.4, K.out + 0.55, t)));
    B.clean.style.filter = 'contrast(1.14) brightness(1.06) saturate(1.1) drop-shadow(0 0 2px rgba(255,190,150,.8)) drop-shadow(0 0 30px rgba(255,110,40,.35))';
    const bsw = lerp(-10, 120, S(t, K.chute + 0.5, { f: 0.7, z: 1 }));
    B.band.style.background = `linear-gradient(100deg,transparent ${f3(bsw - 7)}%,rgba(255,240,228,.6) ${f3(bsw)}%,transparent ${f3(bsw + 7)}%)`;
    set(B.band, fade(t, K.chute + 0.4, K.chute + 0.5, K.chute + 1.6, K.chute + 1.9));
    set(pinB, fade(t, K.perso - 0.2, K.perso, K.out, K.out + 0.3));
    set(glowW, 0.7 + 0.3 * gloss);

    // --- hook : étiquettes, puis 100 € → + 600 €
    const tagO = (t0) => sm(t0, t0 + 0.12, t) * (1 - sm(K.hookOut, K.hookOut + 0.25, t));
    [[tagPh, pinsA.phare, K.tags + 0.1], [tagIn, pinsA.pare, K.tags + 0.25], [tagRa, pinsA.rayure, K.tags]].forEach(([p, pin, t0]) => {
      const o = tagO(t0), s = S(t, t0, P.pop);
      p.d.style.transform = `translateY(${f3((1 - s) * 30)}px) scale(${f3(0.8 + 0.2 * s)})`; set(p.d, o);
      link(p, pin, o, S(t, t0 + 0.08, P.pen));
    });
    const hk = 1 - S(t, K.hookOut, P.heavy);
    gHook.setAttribute('transform', `translate(0,${f3(-120 * (1 - hk))})`); setA(gHook, hk);
    writeWord(w100, t, K.w100, 0.06, 26);
    arrow.setAttribute('stroke-dashoffset', f3(200 * (1 - S(t, K.arrow, P.pen))));
    setA(arrow, sm(K.arrow, K.arrow + 0.05, t));
    writeWord(w600, t, K.w600, 0.06, 26);

    // --- compteur
    const hud = fade(t, K.hookOut + 0.15, K.hookOut + 0.5, K.xr - 0.2, K.xr + 0.2);
    const val = t < K.c20 + 0.05 ? 0 : t < K.c50 + 0.05 ? 20 : t < K.c100 + 0.05 ? 50 : 100;
    const visH = S(t, K.c100 + 0.02, P.heavy), visT = S(t, K.c20, P.heavy);
    const vis = [visH, visT, 1];
    const nC = vis.reduce((a, b) => a + b, 0), totalW = nC * CN.w + (nC - 1) * CN.gap + 14 + 62;
    let cx = 540 - totalW / 2; const cellX = [];
    for (let i = 0; i < 3; i++) { cellX.push(cx); cx += (CN.w + CN.gap) * vis[i]; }
    cells.forEach((cc, i) => {
      for (const e of [cc.c, cc.d]) { e.style.transform = `translate(${f3(cellX[i])}px,${CN.top}px) scale(${f3(0.5 + 0.5 * vis[i])})`; e.style.transformOrigin = '0 50%'; }
      set(cc.c, hud * vis[i]); set(cc.d, hud * Math.pow(vis[i], 3));
      cc.col.style.transform = `translateY(${f3(-track(t, ROLL[i]) * CN.h)}px)`;
    });
    euro.style.transform = `translate(${f3(cx + 4)}px,${CN.top}px)`; set(euro, hud);
    set(cLab, hud); cLab.style.letterSpacing = `${f3(0.3 + 0.1 * (1 - hud))}em`;
    void val;

    // --- prix écrits, puis aspirés par le compteur
    const cnt = [K.c20, K.c50, K.c100];
    wP.forEach(({ w, t0 }, i) => {
      writeWord(w, t, t0, 0.06, 24);
      const fly = S(t, cnt[i] - 0.2, { f: 1.6, z: 1 });
      w.grp.setAttribute('transform', `translate(540,${f3(700 - 330 * fly)}) scale(${f3(1 - 0.6 * fly)}) translate(-540,-700)`);
      setA(w.grp, t > t0 - 0.05 ? 1 - sm(0.55, 0.95, fly) : 0);
    });
    const li = t < K.ra - 0.1 ? 0 : t < K.inn - 0.1 ? 1 : 2;
    labP.textContent = LABS[li];
    const lt = [K.ph20, K.ra30, K.in50][li], lc = cnt[li];
    set(labP, fade(t, lt - 0.1, lt + 0.15, lc - 0.25, lc));
    labP.style.transform = `translateY(${f3((1 - sm(lt - 0.1, lt + 0.2, t)) * 14)}px)`;
    // l'écart
    writeWord(wGain, t, K.gain, 0.06, 26);
    const gOut = sm(K.xr - 0.1, K.xr + 0.3, t);
    setA(wGain.grp, 1 - gOut); set(labGain, sm(K.gain - 0.1, K.gain + 0.2, t) * (1 - gOut));

    // --- cartes vidéo
    const pIn = S(t, K.ph + 0.45, P.card), pOut = S(t, K.inn - 0.1, P.heavy);
    cPol.d.style.transform = `translate(${f3(lerp(1180, 600, pIn) + 700 * pOut)}px,1180px) perspective(1200px) rotateY(${f3(-14 * (1 - pIn) - 6)}deg) rotate(${f3(2 - 3 * pOut)}deg)`;
    set(cPol.d, fade(t, K.ph + 0.4, K.ph + 0.5, K.inn + 0.2, K.inn + 0.45));
    if (cPol.d.style.visibility === 'visible') drawSeq(cPol.c, 'polish', t - K.ph);
    const mIn = S(t, K.inn + 0.1, P.card), mOut = S(t, K.back, P.heavy);
    cMoq.d.style.transform = `translate(${f3(lerp(1180, 250, mIn) - 900 * mOut)}px,${f3(1060 + 60 * mOut)}px) perspective(1200px) rotateY(${f3(-16 * (1 - mIn) + 8)}deg) rotate(${f3(-2 + 4 * mOut)}deg)`;
    set(cMoq.d, fade(t, K.inn + 0.05, K.inn + 0.15, K.back + 0.2, K.back + 0.5));
    if (cMoq.d.style.visibility === 'visible') drawSeq(cMoq.c, 'moquette', t - K.inn);

    // --- la bascule
    writeWord(wX1, t, K.txtX, 0.04, 22); writeWord(wX2, t, K.txtX2, 0.045, 22);
    const xOut = S(t, K.xrOut + 0.2, P.heavy);
    gX.setAttribute('transform', `translate(0,${f3(-90 * xOut)})`); setA(gX, 1 - xOut);
    // --- étiquettes des pièces
    [[pDist, pinsA.belt, K.dist, K.emb - 0.2], [pEmb, pinsA.clutch, K.emb + 0.05, K.gauge], [pCul, pinsA.culasse, K.cul + 0.05, K.cap]].forEach(([p, pin, t0, t1]) => {
      const o = fade(t, t0, t0 + 0.12, t1 - 0.2, t1 + 0.05), s = S(t, t0, P.pop);
      p.d.style.transform = `translateY(${f3((1 - s) * 30)}px) scale(${f3(0.8 + 0.2 * s)})`; set(p.d, o);
      link(p, pin, o, S(t, t0 + 0.08, P.pen));
    });
    // --- facture
    const fIn = S(t, K.fact, P.card), fOut = S(t, K.emb - 0.15, P.heavy);
    fact.style.transform = `translate(${f3(-800 * fOut)}px,${f3((1 - fIn) * 260)}px) perspective(1200px) rotateX(${f3(12 * (1 - fIn))}deg) rotate(${f3(-2 * fIn - 4 * fOut)}deg)`;
    set(fact, fade(t, K.fact - 0.02, K.fact + 0.1, K.emb - 0.05, K.emb + 0.2));
    fRows.forEach((p, i) => p.setAttribute('stroke-dashoffset', f3(60 * (1 - S(t, K.fact + 0.55 + i * 0.3, P.pen)))));

    // --- cadrans : le disque d'embrayage grandit et devient le compte-tours
    const gi = S(t, K.gauge, { f: 1.2, z: 0.9 }), go = S(t, K.gaugeOut, { f: 1.4, z: 1 });
    const g = gi * (1 - go);
    const cp = pinsA.clutch.getBoundingClientRect(), ccx = cp.left + cp.width / 2, ccy = cp.top + cp.height / 2;
    gCard.style.transformOrigin = '150px 240px';
    gCard.style.transform = `translate(${f3(lerp(ccx - 240, 0, g))}px,${f3(lerp(ccy - 800, 0, g))}px) scale(${f3(lerp(0.12, 1, g))}) perspective(1500px) rotateX(${f3(8 * g)}deg) rotateY(${f3(-6 * g)}deg)`;
    set(LG, sm(K.gauge, K.gauge + 0.15, t) * (1 - sm(K.gaugeOut + 0.1, K.gaugeOut + 0.35, t)));
    const rv = 0.3 + 0.56 * sm(K.revs, K.revs + 1.9, t) + noise(21, t * 6) * 0.012 * sm(K.revs, K.revs + 0.3, t);
    setNeedle(dRpm, rv, 0.3); setNeedle(dKmh, 0.25 + noise(22, t * 4) * 0.003, null);
    gTest.style.transform = `translateY(${f3((1 - S(t, K.gauge + 0.4, P.rise)) * 24)}px)`; set(gTest, S(t, K.gauge + 0.4, P.rise));
    writeWord(wPat, t, K.patine, 0.05, 24); setA(wPat.grp, 1 - sm(K.gaugeOut, K.gaugeOut + 0.3, t));
    const shake = t > K.revs && t < K.patine ? Math.sin(t * 70) * 2.2 * sm(K.revs, K.revs + 1.5, t) : 0;
    gsv.style.transform = `translate(${f3(shake)}px,0)`;

    // --- la loupe : le bouchon grandit depuis la radiographie, se dévisse, la mousse apparaît ; puis se pose sur la voiture B
    const li0 = S(t, K.cap, { f: 1.1, z: 0.92 }), ldock = S(t, K.chute + 0.3, { f: 0.9, z: 1 });
    const bp0 = pinsA.culasse.getBoundingClientRect(), pb = pinB.getBoundingClientRect();
    const fromX = bp0.left + bp0.width / 2, fromY = bp0.top + bp0.height / 2, dockX = 250, dockY = 700;
    let lx = lerp(fromX, 540, li0), ly = lerp(fromY, 900, li0), ls = lerp(0.06, 1, li0);
    lx = lerp(lx, dockX, ldock); ly = lerp(ly, dockY, ldock); ls = lerp(ls, 0.5, ldock);
    const lclose = S(t, K.out, { f: 1.3, z: 1 });
    ls *= 1 - lclose;
    loupe.style.transform = `translate(${f3(lx)}px,${f3(ly)}px) scale(${f3(Math.max(ls, 0.001))})`;
    set(LO, sm(K.cap, K.cap + 0.1, t) * (1 - sm(K.out + 0.3, K.out + 0.5, t)));
    const un = S(t, K.unscrew, { f: 0.9, z: 1 }), lift = S(t, K.foam - 0.1, { f: 1.2, z: 1 });
    cap.setAttribute('transform', `translate(160,160) rotate(${f3(-200 * un)}) scale(${f3(1 + 0.35 * lift)}) translate(-160,-160)`);
    setA(cap, 1 - sm(0.2, 0.7, lift));
    setA(capRing, 0.6 * sm(K.foam + 0.2, K.foam + 0.5, t));
    foam.forEach((f, i) => { const p = S(t, K.foam + 0.12 + i * 0.07, P.pop); f.setAttribute('transform', `translate(${FOAM[i][0]},${FOAM[i][1]}) scale(${f3(Math.max(p, 0.001))}) translate(${-FOAM[i][0]},${-FOAM[i][1]})`); });
    bub.forEach((b, i) => setA(b, 0.85 * sm(K.foam + 0.5 + i * 0.08, K.foam + 0.65 + i * 0.08, t)));
    set(lGlow, sm(K.foam, K.foam + 0.6, t) * (0.8 + 0.2 * Math.sin(t * 5)));
    // fil entre la loupe posée et le capot de B
    if (ldock > 0.02 && lclose < 0.98) {
      const r = 320 * ls, ang = Math.atan2(pb.top - ly, pb.left - lx), sx = lx + Math.cos(ang) * r, sy = ly + Math.sin(ang) * r;
      const px = pb.left + pb.width / 2, py = pb.top + pb.height / 2, pr = S(t, K.chute + 0.9, P.pen);
      lLead.setAttribute('d', `M${f3(sx)} ${f3(sy)} L${f3(lerp(sx, px, pr))} ${f3(lerp(sy, py, pr))}`); setA(lLead, sm(K.chute + 0.85, K.chute + 0.95, t) * (1 - lclose));
    } else setA(lLead, 0);
    writeWord(wMef, t, K.mef, 0.05, 24); setA(wMef.grp, 1 - sm(K.chute - 0.1, K.chute + 0.2, t));

    // --- la chute
    const nIn = S(t, K.chute + 0.55, P.card);
    neuve.style.transform = `translate(${f3((1 - nIn) * 500)}px,0) rotate(${f3((1 - nIn) * 6 - 1.5)}deg)`;
    set(neuve, fade(t, K.chute + 0.5, K.chute + 0.6, K.out, K.out + 0.3));
    hearts.textContent = String(Math.round(38 * sm(K.chute + 0.7, K.chute + 1.8, t)));
    writeWord(wC1, t, K.perso, 0.035, 20); writeWord(wC2, t, K.perso2, 0.045, 22);
    const cOut = S(t, K.out, P.heavy);
    gC.setAttribute('transform', `translate(0,${f3(-80 * cOut)})`); setA(gC, 1 - cOut);

    set(mention, fade(t, K.w100, K.w100 + 0.4, K.out, K.out + 0.3) * (1 - fade(t, K.gauge - 0.1, K.gauge + 0.1, K.gaugeOut, K.gaugeOut + 0.2)) * (1 - fade(t, K.cap, K.cap + 0.2, K.chute, K.chute + 0.3)));

    // éclairs : 600 €, voiture propre, bascule, culasse
    const pulse = (t0, a, k = 7) => (t > t0 ? a * Math.exp(-(t - t0) * k) : 0);
    set(flash, pulse(K.w600 + 0.35, 0.22) + pulse(K.dust + 0.5, 0.2) + pulse(K.xr + 0.6, 0.18) + pulse(K.cul + 0.05, 0.22) + pulse(K.foam + 0.3, 0.2));
    const gn = Math.floor(t * 24) % 720; grain.style.transform = `translate(${(gn * 53) % 211}px,${(gn * 97) % 173}px)`;
  }

  // flou de bougé : obturateur ouvert sur les grands mouvements de caméra et les entrées rapides
  const WIN = [[K.ph, K.ph + 0.7, 1], [K.ra, K.ra + 0.6, 1], [K.inn, K.inn + 0.6, 0.9], [K.back, K.back + 0.9, 0.8], [K.eng, K.eng + 0.7, 0.8], [K.dist, K.dist + 0.5, 0.5],
    [K.emb, K.emb + 0.6, 0.7], [K.gauge, K.gauge + 0.6, 1], [K.gaugeOut, K.gaugeOut + 0.6, 1], [K.cul, K.cul + 0.6, 0.8], [K.cap, K.cap + 0.6, 1], [K.chute, K.chute + 1.0, 1], [K.out, K.out + 1.2, 1],
    [K.fact, K.fact + 0.4, 0.5], [K.unscrew, K.unscrew + 0.5, 0.5]];
  const fast = (t) => { let s = 0; for (const [a, b, v] of WIN) s = Math.max(s, v * sm(a - 0.05, a + 0.05, t) * (1 - sm(b - 0.05, b + 0.05, t))); return s; };
  window.shutter = (t) => Math.max(0.12, fast(t));
  window.samples = (t) => (fast(t) > 0.3 ? 4 : 1);
  window.seek = (t) => paint(t >= DUR ? t - DUR : t);
  paint(0);
  window.filmReady = true;
})();
