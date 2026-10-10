// Kit de la recette 47, extension « pochette » (MO12 « La pochette ») : les documents officiels en cartes de verre de
// la charte, leur nom écrit en texte (jamais leur interface ni leur logo), un badge de validité à anneau qui se vide,
// et la pochette qui se remplit. Réutilisable pour tout épisode qui montre des papiers (PV, situation adm., factures).
// Même contrat que lib/kit47.js (lu, jamais modifié) : chaque module crée ses éléments une fois ; les fonctions paint*
// les peignent à partir de valeurs calculées pour la frame t. Aucun état, aucune transition CSS, aucun Math.random.
// Classes CSS attendues dans la page : .glass, .sheen, .stamp (kit47) et .kp-* (voir film-mo12/index.html).
(function (root) {
  const { clamp, lerp } = root.Motion;
  const { f3, S, sm, P, el, sv, set } = root.Kit47;
  const mcv = document.createElement('canvas').getContext('2d');
  const textW = (font, s) => { mcv.font = font; return mcv.measureText(String(s).replace(/<[^>]+>/g, '')).width; };
  // Clash Display n'a pas d'espace visible (« 2 700 € » s'affiche « 2700€ ») : une espace fine en bloc, comme dans MO9
  const SP = 0.26;
  const clash = (s) => String(s).replace(/ (?![^<]*>)/g, '<i class="kp-sp"></i>');
  const clashW = (font, s) => { const px = parseFloat(font.split(' ')[1]); const plain = String(s).replace(/<[^>]+>/g, ''); return textW(font, plain.replace(/ /g, '')) + (plain.split(' ').length - 1) * SP * px; };

  // ---------- perspective : un rectangle w × h posé sur un quadrilatère [haut-g, haut-d, bas-d, bas-g] ----------
  // (homographie exacte ; l'élément doit avoir transform-origin: 0 0)
  function quad(w, h, q) {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1, g = (dx3 * dy2 - dx2 * dy3) / den, k = (dx1 * dy3 - dx3 * dy1) / den;
    const a = x1 - x0 + g * x1, b = x3 - x0 + k * x3, d = y1 - y0 + g * y1, e = y3 - y0 + k * y3;
    return `matrix3d(${[a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1].map((v) => +v.toFixed(9)).join(',')})`;
  }
  // point (u, v) d'un quadrilatère, interpolation bilinéaire (pour tailler une étiquette dans un pare-brise)
  const bilin = (q, u, v) => [0, 1].map((c) => (1 - v) * ((1 - u) * q[0][c] + u * q[1][c]) + v * ((1 - u) * q[3][c] + u * q[2][c]));
  const sub = (q, u0, v0, u1, v1) => [bilin(q, u0, v0), bilin(q, u1, v0), bilin(q, u1, v1), bilin(q, u0, v1)];

  // ---------- badge de validité : un anneau de 110 px qui se trace, puis se vide jusqu'à la part qui reste ----------
  const R = 47, CIRC = 2 * Math.PI * R;
  function badge(parent, { num = '', unit = '', size = 110 } = {}) {
    const r = el('div', 'kp-badge', parent, `width:${size}px;height:${size}px`);
    const s = sv('svg', { width: size, height: size, viewBox: '0 0 110 110', class: 'kp-ring' }, r);
    sv('circle', { cx: 55, cy: 55, r: R, fill: 'rgba(8,7,10,.42)', stroke: 'rgba(246,239,231,.15)', 'stroke-width': 6 }, s);
    const glow = sv('circle', { cx: 55, cy: 55, r: R, fill: 'none', stroke: 'rgba(255,122,58,.38)', 'stroke-width': 14, 'stroke-linecap': 'round', transform: 'rotate(-90 55 55)' }, s);
    const arc = sv('circle', { cx: 55, cy: 55, r: R, fill: 'none', stroke: '#ffc3a0', 'stroke-width': 6.5, 'stroke-linecap': 'round', transform: 'rotate(-90 55 55)' }, s);
    const penG = sv('circle', { r: 15, fill: '#ff7a3a', opacity: 0 }, s), pen = sv('circle', { r: 6, fill: '#fff', opacity: 0 }, s);
    if (num !== '') { const n = el('div', 'kp-num', r); n.textContent = num; const u = el('div', 'kp-unit', r); u.textContent = unit; }
    return { r, arc, glow, pen, penG, size };
  }
  // frac : part de l'anneau tracée (0..1) ; pen : opacité de la plume au bout du tracé
  function paintBadge(B, frac, pen = 0) {
    const u = clamp(frac, 0, 1), L = u * CIRC, da = `${f3(L)} ${f3(CIRC + 1)}`;
    B.arc.setAttribute('stroke-dasharray', da); B.glow.setAttribute('stroke-dasharray', da);
    B.arc.setAttribute('opacity', u > 0.004 ? '1' : '0'); B.glow.setAttribute('opacity', u > 0.004 ? '1' : '0');
    const a = -Math.PI / 2 + 2 * Math.PI * u, px = f3(55 + R * Math.cos(a)), py = f3(55 + R * Math.sin(a));
    for (const c of [B.pen, B.penG]) { c.setAttribute('cx', px); c.setAttribute('cy', py); }
    B.pen.setAttribute('opacity', f3(pen)); B.penG.setAttribute('opacity', f3(0.5 * pen));
  }

  // ---------- trait de lumière (rature, barre, signature, éclair) : version floue orange dessous, nette claire dessus ----------
  function stroke(svg, d, { w = 6, color = '#ffe2cf', glow = '#ff8a4c', gw = 16 } = {}) {
    const g = sv('path', { d, fill: 'none', stroke: glow, 'stroke-width': gw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, svg);
    const l = sv('path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, svg);
    const L = l.getTotalLength() + 2;
    for (const e of [g, l]) e.setAttribute('stroke-dasharray', `${f3(L)} ${f3(L)}`);
    return { g, l, L };
  }
  function paintStroke(T, p, k = 1) {
    const o = sm(0, 0.03, p) * k;
    for (const e of [T.g, T.l]) e.setAttribute('stroke-dashoffset', f3(T.L * (1 - clamp(p, 0, 1))));
    T.g.setAttribute('opacity', f3(0.5 * o)); T.l.setAttribute('opacity', f3(o));
  }

  // ---------- carte de document : 760 × 170 (nom Satoshi 700 48 px, valeur Clash 64 px), qui se replie en bandeau ----------
  // spec : { name, value, ring: {num, unit} | null, thumb: 'left' | 'right' | null, name2, value2, sub2, w, h, wb, hb,
  //         dur, durX }
  // À gauche : le badge (ou une vignette vidéo) ; à droite : une vignette vidéo facultative. name2 / value2 / sub2 :
  // second état du texte (« Virement · en cours » → « Virement reçu · + 2 700,00 € »), échangé par paintDoc(swap).
  // dur : durée écrite (« 15 j ») qui remplace l'anneau dans le bandeau, où l'anneau réduit ne se lit plus à 360 px ;
  // durX : départ du nom dans ce bandeau (même colonne pour toute une liste).
  const FN = '700 48px Satoshi', FV = '700 64px Clash', FD = '700 38px Clash';
  function doc(parent, spec) {
    const o = { w: 760, h: 170, wb: 720, hb: 90, ...spec };
    const D = { o, root: el('div', 'kp-doc', parent, `width:${o.w}px;height:${o.h}px`) };
    D.bg = el('div', 'glass kp-bg', D.root); el('div', 'sheen', D.bg);
    if (o.ring) D.badge = badge(D.root, o.ring);
    if (o.dur) { D.dur = el('div', 'kp-dur', D.root); D.dur.innerHTML = clash(o.dur); D.durW = clashW(FD, o.dur); }
    if (o.thumb) { D.cv = el('canvas', 'kp-thumb', D.root); D.cv.width = 300; D.cv.height = 210; D.tw = o.thumb === 'left' ? 150 : 180; D.th = o.thumb === 'left' ? 118 : 126; D.cv.style.width = `${D.tw}px`; D.cv.style.height = `${D.th}px`; }
    const txt = (cls, s, font) => { const e = el('div', cls, D.root); e.innerHTML = s || ''; return { e, w: textW(font, s || '') }; };
    const val = (s) => { const e = el('div', 'kp-value', D.root); e.innerHTML = clash(s || ''); return { e, w: clashW(FV, s || '') }; };
    D.name = txt('kp-name', o.name, FN); D.value = val(o.value);
    if (o.name2 != null) { D.name2 = txt('kp-name', o.name2, FN); D.value2 = val(o.value2); }
    if (o.sub2) { D.sub2 = el('div', 'kp-sub', D.root); D.sub2.textContent = o.sub2; }
    D.fx = sv('svg', { width: o.w, height: o.h, viewBox: `0 0 ${o.w} ${o.h}`, class: 'kp-fx' }, D.root);
    return D;
  }
  // o : { x, y (coin haut-gauche de la carte), b (0 carte → 1 bandeau), k (opacité), sc, rot, swap (0..1), hx (hauteur ajoutée
  //       sous le bandeau : lignes de détail), ring: [frac, pen], valueColor }
  function paintDoc(D, { x = 0, y = 0, b = 0, k = 1, sc = 1, rot = 0, swap = 0, hx = 0, ring = null, lit = 0 } = {}) {
    const o = D.o, W = lerp(o.w, o.wb, b), H0 = lerp(o.h, o.hb, b), H = H0 + hx;
    set(D.root, k);
    if (D.root.style.visibility === 'hidden') return;
    D.root.style.width = `${f3(W)}px`; D.root.style.height = `${f3(H)}px`;
    D.root.style.transform = `translate(${f3(x + (o.w - W) / 2)}px,${f3(y)}px) rotate(${f3(rot)}deg) scale(${f3(sc)})`;
    D.bg.style.borderRadius = `${f3(lerp(30, 22, b))}px`;
    // bandeau rangé dans la pochette : posé sur le fond de la pochette, le flou d'arrière-plan ne se voit plus (et coûte cher)
    const bd = b > 0.98 ? 'none' : ''; if (D.bg.style.backdropFilter !== bd) { D.bg.style.backdropFilter = bd; D.bg.style.webkitBackdropFilter = bd; }
    const left = D.badge || (D.cv && o.thumb === 'left');
    const x0 = left ? lerp(D.badge ? 168 : 196, D.dur ? o.durX || 184 : D.badge ? 104 : 112, b) : lerp(40, 34, b);
    // durée écrite : elle entre une fois le bandeau formé (b de 0,85 à 1), l'anneau rapetisse et sort en même temps
    const dB = D.dur ? sm(0.85, 1, b) : 0;
    if (D.badge) {
      const s = lerp(1, 0.62, b) * (1 - 0.3 * dB);
      D.badge.r.style.transform = `translate(${f3(lerp(30, 22, b) + 110 * 0.62 * 0.15 * dB)}px,${f3((H0 - 110 * s) / 2)}px) scale(${f3(s)})`;
      if (D.dur) set(D.badge.r, 1 - dB);
      if (ring) paintBadge(D.badge, ring[0], ring[1] || 0);
    }
    if (D.dur) {
      set(D.dur, dB);
      D.dur.style.transform = `translate(${f3(22 - 16 * (1 - dB))}px,${f3((H0 - 38) / 2)}px) scale(${f3(0.86 + 0.14 * dB)})`;
    }
    if (D.cv) {
      if (o.thumb === 'left') { const s = lerp(1, 0.56, b); D.cv.style.transform = `translate(${f3(lerp(22, 18, b))}px,${f3((H0 - D.th * s) / 2)}px) scale(${f3(s)})`; }
      else { const s = lerp(1, 0.7, b); D.cv.style.transform = `translate(${f3(W - 22 - D.tw * s + 40 * b)}px,${f3((H0 - D.th * s) / 2)}px) scale(${f3(s)})`; set(D.cv, (1 - b) * (1 - b)); }
    }
    // texte : sortie de l'ancien avant l'entrée du nouveau (jamais les deux pleins en même temps)
    const aOut = 1 - sm(0, 0.45, swap), aIn = sm(0.4, 1, swap);
    const place = (N, V, a, dy) => {
      const sn = lerp(1, 0.83, b), sw = lerp(1, 0.72, b);
      N.e.style.transform = `translate(${f3(x0)}px,${f3(lerp(24, (o.hb - 48 * sn) / 2, b) + dy)}px) scale(${f3(sn)})`;
      const vx = lerp(x0, W - 28 - V.w * sw, b), vy = lerp(86, (o.hb - 64 * sw) / 2, b);
      V.e.style.transform = `translate(${f3(vx)}px,${f3(vy + dy)}px) scale(${f3(sw)})`;
      set(N.e, a); set(V.e, a);
    };
    place(D.name, D.value, D.name2 ? aOut : 1, -16 * (1 - aOut));
    if (D.name2) place(D.name2, D.value2, aIn, 16 * (1 - aIn));
    if (D.sub2) { D.sub2.style.transform = `translate(${f3(x0 + D.name2.w + 22)}px,${f3(lerp(38, 32, b) + 16 * (1 - aIn))}px)`; set(D.sub2, aIn * (1 - b)); }
    // lit : la valeur s'allume ; à 0, la couleur d'origine est rendue (la frame ne dépend que de t, même en reculant)
    const lv = (D.value2 || D.value).e;
    if (lit) { const c = lit; lv.style.color = `rgb(${Math.round(lerp(246, 255, c))},${Math.round(lerp(239, 179, c))},${Math.round(lerp(231, 138, c))})`; lv.style.textShadow = `0 0 ${f3(26 * c)}px rgba(255,120,50,${f3(0.55 * c)})`; }
    else if (lv.style.color) { lv.style.color = ''; lv.style.textShadow = ''; }
    D.fx.style.transform = `scale(${f3(W / o.w)},${f3(H0 / o.h)})`;
  }

  // ---------- la pochette : fond de verre dépoli, face claire, liseré orange à l'ouverture, rabat, tampon ----------
  // Les cartes se peignent entre F.back (calque du dessous) et F.front (calque du dessus) : elles entrent « dans » la
  // pochette et restent lisibles à travers la face claire.
  function folder(backParent, frontParent, { flapH = 110, label = 'PRÊTE' } = {}) {
    const back = el('div', 'glass kp-back', backParent); el('div', 'sheen', back);
    const front = el('div', 'kp-front', frontParent); el('div', 'sheen', front);
    const lip = el('div', 'kp-lip', frontParent);
    const flap = el('div', 'glass kp-flap', frontParent, `height:${flapH}px`); el('div', 'sheen', flap);
    const flapLip = el('div', 'kp-lip', flap, 'top:auto;bottom:0');
    const stamp = el('div', 'stamp kp-stamp', flap); stamp.textContent = label;
    return { back, front, lip, flap, flapLip, stamp, flapH };
  }
  // open : 0 rabat fermé (posé sur la face) → 1 ouvert (basculé derrière) ; st : progression du tampon (ressort P.stamp)
  function paintFolder(F, { x, y, w, h, k = 1, open = 0, stamp = 0, stampK = 0, sc = 1, rot = 0 }) {
    const tf = `translate(${f3(x)}px,${f3(y)}px) rotate(${f3(rot)}deg) scale(${f3(sc)})`;
    for (const e of [F.back, F.front]) { e.style.width = `${f3(w)}px`; e.style.height = `${f3(h)}px`; e.style.transform = tf; e.style.transformOrigin = `${f3(w / 2)}px 0`; set(e, k); }
    F.lip.style.width = `${f3(w - 40)}px`; F.lip.style.transform = `${tf} translate(20px,-2px)`; F.lip.style.transformOrigin = `${f3(w / 2 - 20)}px 2px`; set(F.lip, k);
    F.flap.style.width = `${f3(w)}px`; F.flap.style.transformOrigin = `${f3(w / 2)}px 0`;
    F.flap.style.transform = `${tf} perspective(1100px) rotateX(${f3(-100 * open)}deg)`;
    set(F.flap, k * (1 - 0.55 * sm(0.55, 1, open)));
    F.stamp.style.left = `${f3(w / 2)}px`; F.stamp.style.top = `${f3(F.flapH / 2)}px`;
    F.stamp.style.transform = `translate(-50%,-50%) rotate(-7deg) scale(${f3(lerp(1.9, 1, stamp))})`;
    set(F.stamp, stampK * k);
  }

  // ---------- la pile : chaque entrée pousse les autres d'une case, la plus ancienne rentre dans la pochette ----------
  // profondeur continue de l'entrée i : nombre d'entrées arrivées après elle (somme de ressorts : 0 = la plus récente)
  const depth = (st, times, i, pr = P.card) => { let k = 0; for (let j = i + 1; j < times.length; j++) k += S(st, times[j], pr); return k; };
  // valeur le long d'un chemin de cases [v0, v1, …] pour une profondeur continue k
  const along = (path, k) => { const i = clamp(Math.floor(k), 0, path.length - 2), u = clamp(k - i, 0, 1); return lerp(path[i], path[i + 1], u); };

  root.Kit47Pochette = { quad, bilin, sub, badge, paintBadge, stroke, paintStroke, doc, paintDoc, folder, paintFolder, depth, along, textW, clash, clashW };
})(window);
