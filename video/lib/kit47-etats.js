// Kit de la recette 47 : les états d'une voiture (MO11 « La préparation »), en complément de lib/kit47.js (inchangé).
// Calques « sale » posés sur la photo détourée, chacun effacé par une ligne de partage verticale (avant / après) ;
// lumière de fin de journée : étalonnage selon la luminance, ombre portée tirée du masque alpha, reflet rasant masqué
// sur les zones claires. Comme le kit : les éléments sont créés une fois, le film les peint à chaque frame à partir du
// temps, sans rien garder d'une frame à l'autre. Coordonnées en pixels de la photo (x vers la droite, y vers le bas).
//
//   const C = KitEtats.car(parent, { img, w, left, top, layers: [['poussiere', url], …] });   // une fois
//   KitEtats.prepSun(C, img);                                // une fois : calques de lumière calculés sur la photo
//   KitEtats.reset(C);                                       // à chaque frame, avant les coups
//   const x = KitEtats.split(t, C, { layers, after, t0, x0, xm, x1, y0, y1, hold, sc });   // un coup
//   KitEtats.sun(C, k, { rake, rakeK });                     // la lumière de 16 h 30 (k = 0 → 1)
(function (root) {
  const { spring, clamp, lerp } = root.Motion;
  const { f3, sm, el, sv, set } = root.Kit47;
  const pct = (v, n) => f3((100 * v) / n) + '%';

  // ---------- la voiture et ses calques (images pleine taille, alignées sur la photo) ----------
  function car(parent, opts) {
    const { img, w, left = 0, top = 0, layers = [], reflect = 0.15 } = opts;
    const W = img.naturalWidth, H = img.naturalHeight, k = w / W, h = H * k;
    const box = el('div', 'abs', parent, `left:${left}px;top:${top}px;width:${w}px;height:${f3(h)}px`);
    const full = `position:absolute;left:0;top:0;width:${w}px;height:${f3(h)}px`;
    // ombre portée (soleil bas) : silhouette tirée du masque alpha, couchée derrière la voiture
    const shadow = el('canvas', '', box, `${full};transform-origin:50% 100%;visibility:hidden`);
    const body = el('div', '', box, full + (reflect ? `;-webkit-box-reflect:below -6px linear-gradient(transparent 64%,rgba(255,255,255,${reflect}))` : ''));
    const base = el('img', '', body, full); base.src = img.src;
    const gold = el('canvas', '', body, `${full};visibility:hidden`);
    const L = {};
    for (const [key, url] of layers) { const e = el('img', '', body, full); e.src = url; L[key] = e; }
    // brillance : bande mouillée, reflet rasant (masqués sur les zones claires une fois prepSun passé)
    const wet = el('div', '', body, `${full};mix-blend-mode:screen;visibility:hidden`);
    const rake = el('div', '', body, `${full};mix-blend-mode:screen;visibility:hidden`);
    const svg = sv('svg', { width: w, height: f3(h), viewBox: `0 0 ${W} ${H}`, style: 'position:absolute;left:0;top:0;overflow:visible' }, box);
    const d = sv('defs', {}, svg);
    const fl = sv('filter', { id: 'etl', x: '-200%', y: '-20%', width: '500%', height: '140%' }, d); sv('feGaussianBlur', { stdDeviation: 6 }, fl);
    // ligne de partage : liseré orange flou, trait clair, poignée (la plume au milieu)
    const line = sv('g', { visibility: 'hidden' }, svg);
    const lGlow = sv('line', { stroke: '#ff7a3a', 'stroke-linecap': 'round', filter: 'url(#etl)', opacity: 0.85 }, line);
    const lCore = sv('line', { stroke: '#fff4ea', 'stroke-linecap': 'round' }, line);
    const knob = sv('g', {}, line);
    const kRing = sv('circle', { fill: 'rgba(8,7,10,.35)', stroke: '#ffe2cf' }, knob);
    const kHalo = sv('circle', { fill: '#ff7a3a', opacity: 0.55, filter: 'url(#etl)' }, knob);
    const kDot = sv('circle', { fill: '#fff' }, knob);
    const kArr = sv('path', { fill: 'none', stroke: '#ffe2cf', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, knob);
    return { box, body, base, gold, shadow, wet, rake, L, svg, W, H, k, w, h, left, top, line: { g: line, lGlow, lCore, knob, kRing, kHalo, kDot, kArr } };
  }
  // point de la photo → coordonnées du monde (le parent de la voiture)
  const at = (C, x, y) => [C.left + x * C.k, C.top + y * C.k];

  // ---------- calques de lumière, calculés une fois sur la photo propre ----------
  function prepSun(C, img) {
    const { W, H } = C;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d', { willReadFrequently: true }); c.drawImage(img, 0, 0);
    const src = c.getImageData(0, 0, W, H), p = src.data;
    const gd = c.createImageData(W, H), g = gd.data, md = c.createImageData(W, H), m = md.data;
    const ss = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
    for (let i = 0; i < p.length; i += 4) {
      const a = p[i + 3]; if (!a) continue;
      const r = p[i], gg = p[i + 1], b = p[i + 2], Lm = (0.2126 * r + 0.7152 * gg + 0.0722 * b) / 255;
      const hi = ss(0.3, 0.86, Lm), lo = 1 - ss(0.06, 0.42, Lm);
      // hautes lumières dorées, ombres froides, un peu plus de contraste : une lumière, pas un filtre orange
      g[i] = clamp(r * (0.94 + 0.5 * hi) + 34 * hi - 10 * lo, 0, 255);
      g[i + 1] = clamp(gg * (0.9 + 0.2 * hi) + 12 * hi - 6 * lo, 0, 255);
      g[i + 2] = clamp(b * (0.84 - 0.2 * hi) + 16 * lo, 0, 255);
      g[i + 3] = a;
      m[i] = m[i + 1] = m[i + 2] = 255; m[i + 3] = a * ss(0.5, 0.86, Lm);
    }
    C.gold.width = W; C.gold.height = H; C.gold.getContext('2d').putImageData(gd, 0, 0);
    // masque des zones claires (reflet rasant, bande mouillée)
    const mc = document.createElement('canvas'); mc.width = W; mc.height = H; mc.getContext('2d').putImageData(md, 0, 0);
    const url = mc.toDataURL('image/png');
    for (const e of [C.wet, C.rake]) { e.style.webkitMaskImage = `url(${url})`; e.style.webkitMaskSize = '100% 100%'; }
    // silhouette floutée, à demi-résolution
    const sh = C.shadow; sh.width = W >> 1; sh.height = H >> 1; const sc = sh.getContext('2d');
    sc.filter = 'blur(7px)'; sc.drawImage(img, 0, 0, sh.width, sh.height); sc.filter = 'none';
    sc.globalCompositeOperation = 'source-in'; sc.fillStyle = '#000'; sc.fillRect(0, 0, sh.width, sh.height);
    C.hiMask = url;
    return C;
  }

  // ---------- découpe d'un calque : visible pour x dans [a, b], moins un trou (polygone de la photo) ----------
  function clip(C, e, a, b, hole) {
    const { W, H } = C;
    a = Math.max(0, a); b = Math.min(W, b);
    if (b - a < 0.5) { e.style.visibility = 'hidden'; return; }
    e.style.visibility = 'visible';
    if (a <= 0 && b >= W && !hole) { e.style.clipPath = ''; return; }
    const r = [[a, 0], [b, 0], [b, H], [a, H], [a, 0]];
    const pts = hole ? [...r, ...hole, hole[0], [a, 0]] : r;
    e.style.clipPath = `polygon(evenodd,${pts.map(([x, y]) => `${pct(x, W)} ${pct(y, H)}`).join(',')})`;
  }

  // ---------- ligne de partage : 0,2 s jusqu'au milieu, arrêt (hold), 0,2 s jusqu'au bout ----------
  const GO = { f: 3.2, z: 1 };
  function lineAt(t, o) {
    const { t0, x0, xm, x1, go = 0.2, hold = 0.3 } = o;
    return x0 + (xm - x0) * spring(t - t0, GO) + (x1 - xm) * spring(t - t0 - go - hold, GO);
  }
  function lineOn(t, o) { const { t0, go = 0.2, hold = 0.3 } = o, te = t0 + 2 * go + hold; return sm(t0 - 0.03, t0 + 0.03, t) * (1 - sm(te + 0.02, te + 0.16, t)); }
  function reset(C) { C.line.g.setAttribute('visibility', 'hidden'); }
  // trace le liseré en x (photo), de y0 à y1, opacité on ; sc = pixels d'écran par pixel de photo (épaisseurs constantes)
  function drawLine(C, x, y0, y1, on, sc = 1) {
    const L = C.line; if (on < 0.002) return;
    L.g.setAttribute('visibility', 'visible'); L.g.setAttribute('opacity', f3(on));
    const u = 1 / sc, ym = (y0 + y1) / 2;
    for (const [e, sw] of [[L.lGlow, 14], [L.lCore, 3.2]]) { e.setAttribute('x1', f3(x)); e.setAttribute('x2', f3(x)); e.setAttribute('y1', f3(y0)); e.setAttribute('y2', f3(y1)); e.setAttribute('stroke-width', f3(sw * u)); }
    L.knob.setAttribute('transform', `translate(${f3(x)},${f3(ym)}) scale(${f3(u)})`);
    L.kRing.setAttribute('r', 26); L.kRing.setAttribute('stroke-width', 3);
    L.kHalo.setAttribute('r', 30); L.kDot.setAttribute('r', 6.5);
    L.kArr.setAttribute('d', 'M-12 -7 L-18 0 L-12 7 M12 -7 L18 0 L12 7'); L.kArr.setAttribute('stroke-width', 3);
  }
  // un coup : les calques de o.layers restent à droite de la ligne (pas encore faits), ceux de o.after apparaissent à
  // gauche (le neuf) ; renvoie la position de la ligne. Le film combine lui-même les calques touchés plusieurs fois.
  function split(t, C, o) {
    const x = lineAt(t, o);
    for (const k of o.layers || []) clip(C, C.L[k], x, C.W);
    for (const k of o.after || []) clip(C, C.L[k], 0, x);
    drawLine(C, x, o.y0, o.y1, lineOn(t, o), o.sc);
    return x;
  }

  // ---------- la lumière de 16 h 30 ----------
  // k : 0 (lumière de l'atelier) → 1 (soleil bas dans le dos) ; rake : position du reflet rasant (0 → 1), rakeK : son
  // intensité ; ang : rotation de l'ombre (degrés), qui tourne avec l'heure
  function sun(C, k, o = {}) {
    set(C.gold, k);
    // couchée sous la voiture et tirée vers l'arrière droit ; elle s'allonge et tourne quand le soleil baisse
    const len = 0.08 + 0.14 * k, ang = o.ang == null ? -26 - 26 * k : o.ang;
    set(C.shadow, 0.72 * sm(0, 0.4, k));
    C.shadow.style.transform = `translate(${f3(90 * k)}px,-12px) scaleY(${f3(-len)}) skewX(${f3(ang)}deg)`;
    const rk = (o.rakeK || 0);
    set(C.rake, rk);
    if (rk > 0.002) { const x = lerp(-30, 130, o.rake || 0); C.rake.style.background = `linear-gradient(104deg,transparent ${f3(x - 16)}%,rgba(255,214,160,.75) ${f3(x)}%,transparent ${f3(x + 16)}%)`; }
  }
  // brillance mouillée derrière une ligne de partage (x en photo), qui sèche en ~1 s
  function wet(C, x, k) {
    set(C.wet, k); if (k < 0.002) return;
    C.wet.style.background = `linear-gradient(90deg,rgba(255,244,232,.18),rgba(255,244,232,.55) ${pct(Math.max(0, x - 40), C.W)},rgba(255,244,232,0) ${pct(x, C.W)})`;
  }

  root.KitEtats = { car, at, prepSun, clip, lineAt, lineOn, reset, drawLine, split, sun, wet };
})(window);
