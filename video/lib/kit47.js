// Kit de la recette 47 : les modules de MO5 « 47 € » rendus réutilisables (écriture à la lumière, compteur à rouleaux,
// notifications bancaires, palettes, tampon « prévu ✓ », séquences vidéo peintes sur canvas).
// Chaque module crée ses éléments une fois ; le film les peint à chaque frame à partir du temps (window.seek(t)).
// Utilisé par film-mo9 ; MO5 garde son code d'origine (film-mo5/film.js) tant que le kit n'a pas été vérifié sur lui.
(function (root) {
  const { spring, track, clamp, lerp } = root.Motion;
  const NS = 'http://www.w3.org/2000/svg';
  const f3 = (x) => x.toFixed(3);
  const S = (t, t0, p) => spring(t - t0, p);
  const sm = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
  // ressorts de MO5 (une seule famille pour tout le film)
  const P = {
    pen: { f: 1.05, z: 1 }, draw: { f: 1.35, z: 1 }, rise: { f: 1.9, z: 1 }, card: { f: 2.2, z: 0.78 }, soft: { f: 0.32, z: 1 },
    heavy: 'heavy', flip: { f: 2.4, z: 0.82 }, roll: { f: 1.7, z: 0.95 }, tag: { f: 2.0, z: 0.66 }, push: { f: 0.95, z: 1 }, drift: { f: 0.28, z: 1 },
    stamp: { f: 2.6, z: 0.7 },
  };
  const el = (tag, cls, parent, style) => { const e = document.createElement(tag); if (cls) e.className = cls; if (style) e.setAttribute('style', style); parent.appendChild(e); return e; };
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  // opacité + visibilité : un élément invisible sort du calcul (le verre dépoli coûte cher au rendu)
  const set = (e, o) => { const v = clamp(o, 0, 1); e.style.opacity = f3(v); e.style.visibility = v < 0.002 ? 'hidden' : 'visible'; };

  // dégradé orange du mot porteur et filtres de lueur, une fois par svg
  function defs(svg, id = '') {
    const d = sv('defs', {}, svg);
    const qg = sv('linearGradient', { id: 'qg' + id, x1: 0, y1: 0, x2: 1, y2: 0.3 }, d);
    sv('stop', { offset: 0, 'stop-color': '#ff5a1f' }, qg); sv('stop', { offset: 0.55, 'stop-color': '#ff8a4c' }, qg); sv('stop', { offset: 1, 'stop-color': '#ffb38a' }, qg);
    const soft = sv('filter', { id: 'soft' + id, x: '-50%', y: '-50%', width: '200%', height: '200%' }, d); sv('feGaussianBlur', { stdDeviation: 7 }, soft);
    const gl = sv('filter', { id: 'gl' + id, x: '-50%', y: '-50%', width: '200%', height: '200%' }, d);
    sv('feGaussianBlur', { stdDeviation: 14, result: 'b' }, gl); const mg = sv('feMerge', {}, gl); sv('feMergeNode', { in: 'b' }, mg); sv('feMergeNode', { in: 'SourceGraphic' }, mg);
    return d;
  }

  // ---------- écriture à la lumière (MO5) : un contour par glyphe, puis la couleur monte ----------
  const mcv = document.createElement('canvas').getContext('2d');
  function word(parent, str, font, size, cx, base, opts = {}) {
    mcv.font = font; const gap = size * 0.24; const items = []; let x = 0;
    for (const ch of str) { if (ch === ' ') { x += gap; continue; } const w = mcv.measureText(ch).width; items.push({ ch, x, w }); x += w + (opts.track || 0); }
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
  function writeWord(w, t, t0, step = 0.05, dy = 26, k = 1) {
    w.items.forEach((g, i) => {
      const ts = t0 + i * step, dr = S(t, ts, P.draw), fi = S(t, ts + 0.16, P.rise);
      g.stroke.setAttribute('stroke-dashoffset', f3(g.L * (1 - dr)));
      g.stroke.setAttribute('opacity', f3(sm(ts - 0.01, ts + 0.04, t) * (1 - 0.85 * fi) * k));
      g.fill.setAttribute('opacity', f3(fi * k));
      g.g.setAttribute('transform', `translate(0,${f3((1 - fi) * dy)})`);
    });
  }
  // un mot déjà écrit (image 0) : tout plein, aucun contour
  function fullWord(w, k = 1) { w.items.forEach((g) => { g.stroke.setAttribute('opacity', '0'); g.fill.setAttribute('opacity', f3(k)); g.g.setAttribute('transform', ''); }); }

  // ---------- notification bancaire (MO5) ----------
  function notif(parent, title, amt, opts = {}) {
    const d = el('div', 'glass notif', parent); el('div', 'sheen', d);
    const c = el('canvas', '', d); c.width = 372; c.height = 276;
    const tx = el('div', '', d); const a = el('div', 'app', tx); a.textContent = opts.app || 'Compte courant · maintenant';
    const ti = el('div', 'ti', tx); ti.textContent = title; const am = el('div', 'am', tx); am.innerHTML = `<b${opts.sign === '+' ? ' style="color:#ffb38a"' : ''}>${opts.sign || '−'}</b> ${amt} €`;
    return { d, c };
  }

  // ---------- séquences vidéo (30 i/s, JPG) chargées l'une après l'autre (le decode() parallèle échoue) ----------
  const load = (src, tries = 4) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => (tries > 1 ? load(src, tries - 1).then(res, rej) : rej(new Error(src))); im.src = src; });
  async function loadSeqs(base, map, step = 1) {
    const IMG = {};
    for (const [k, n] of Object.entries(map)) { IMG[k] = []; for (let i = 0; i < n; i += step) IMG[k].push(await load(`${base}/${k}/${String(i + 1).padStart(3, '0')}.jpg`)); }
    return IMG;
  }
  // lecture en aller-retour : jamais de saut quand la séquence se termine
  function drawSeq(cv, frames, tt, fps = 30) {
    const n = frames.length; let i = Math.max(0, Math.floor(tt * fps)); const c = i % (2 * n - 2); i = c < n ? c : 2 * n - 2 - c;
    const im = frames[i], ctx = cv.getContext('2d'); const r = Math.max(cv.width / im.width, cv.height / im.height);
    const w = im.width * r, h = im.height * r; ctx.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
  }

  // ---------- palettes (split-flap) ----------
  function flaps(parent, letters, opts) {
    const { y, w, h, fs, g = 10, gapAt = -1, gap = 0 } = opts;
    let tot = letters.length * w + (letters.length - 1) * g + (gapAt >= 0 ? gap : 0), x = 540 - tot / 2;
    return letters.map((c, i) => {
      if (i === gapAt) x += gap;
      const d = el('div', 'flapT glass', parent, `left:${x}px;top:${y}px;width:${w}px;height:${h}px;font-size:${fs}px;border-radius:${Math.round(h / 9)}px`);
      el('div', 'sheen', d); const s = el('span', '', d); el('i', '', d); x += w + g;
      return { d, s, c };
    });
  }
  function paintFlaps(fl, t, t0, step = 0.07, scramble = 'ARTVQMEZ') {
    fl.forEach((f, i) => {
      const p = S(t, t0 + i * step, P.flip);
      f.s.textContent = p < 0.72 ? scramble[(Math.floor(p * 9) + i * 3) % scramble.length] : f.c;
      f.d.style.transform = `perspective(700px) rotateX(${f3((1 - p) * 92)}deg)`;
      f.d.style.opacity = f3(sm(0, 0.12, p));
    });
  }

  // ---------- compteur à rouleaux (MO5) : colonnes −60..19, jamais à vide ----------
  function counter(parent, opts) {
    const { top, w = 124, h = 172, gap = 12, n = 4, label = 'MARGE', labelTop = top - 60 } = opts;
    const lab = el('div', 'abs', parent, `top:${labelTop}px;left:0;width:1080px;text-align:center;font:700 30px Satoshi;letter-spacing:.32em;color:#a59a90`);
    const labL = [...label].map((c) => { const s = el('span', '', lab, 'display:inline-block'); s.textContent = c; return s; });
    const cells = Array.from({ length: n }, () => {
      const c = el('div', 'cell glass', parent); el('div', 'sheen', c);
      const o = sv('svg', { width: w, height: h, style: 'position:absolute;left:0;top:0;overflow:visible' }, parent);
      const r = sv('rect', { x: 1, y: 1, width: w - 2, height: h - 2, rx: 23, fill: 'none', stroke: '#ffd2b8', 'stroke-width': 2.5, 'stroke-dasharray': '600 600', 'stroke-dashoffset': 600 }, o);
      const d = el('div', 'digit', parent); const col = el('div', 'col', d);
      for (let k = -60; k < 20; k++) { const s = el('span', '', col); s.textContent = ((k % 10) + 10) % 10; }
      return { c, o, r, d, col };
    });
    const euro = el('div', 'abs', parent, `font:700 104px Clash;line-height:${h}px;white-space:nowrap`); euro.textContent = '€';
    return { top, w, h, gap, n, lab, labL, cells, euro };
  }
  const digitAt = (v, p) => Math.floor(Math.abs(v) / 10 ** p) % 10;
  // clés de roulement par chiffre (p = 0 unités … n−1) : [[t, valeur]] → index de colonne suivi par track()
  function rollKeys(vals, times, n = 4) {
    return Array.from({ length: n }, (_, p) => {
      const keys = [[0, digitAt(vals[0], p)]]; let idx = digitAt(vals[0], p);
      for (let i = 1; i < vals.length; i++) { const a = digitAt(vals[i - 1], p), b = digitAt(vals[i], p); if (a === b) continue; idx -= (a - b + 10) % 10; keys.push([times[i] + (n - 1 - p) * 0.035, idx, P.roll]); }
      return keys;
    });
  }
  // peint le compteur : vis[i] (0..1) par case, de gauche à droite ; build = tracé puis verre ; k = opacité globale
  function paintCounter(C, st, keys, vis, build, k) {
    const nC = vis.reduce((a, b) => a + b, 0), totalW = nC * C.w + (nC - 1) * C.gap + 18 + 76;
    let cx = 540 - totalW / 2; const xs = [];
    for (let i = 0; i < C.n; i++) { xs.push(cx); cx += (C.w + C.gap) * vis[i]; }
    C.cells.forEach((c, i) => {
      const dr = build(i).draw, gl = build(i).glass, kk = vis[i];
      for (const e of [c.c, c.o, c.d]) { e.style.transform = `translate(${f3(xs[i])}px,${C.top}px) scale(${f3(0.6 + 0.4 * kk)})`; e.style.transformOrigin = '0 50%'; }
      c.r.setAttribute('stroke-dashoffset', f3(600 * (1 - dr)));
      c.o.style.opacity = f3(sm(0, 0.08, dr) * (1 - 0.75 * gl) * kk * k);
      set(c.c, gl * kk * k);
      c.col.style.transform = `translateY(${f3(-(track(st, keys[C.n - 1 - i]) + 60) * C.h)}px)`;
      set(c.d, gl * kk * kk * kk * k);
    });
    C.euro.style.transform = `translate(${f3(cx + 6)}px,${C.top}px)`; set(C.euro, build(C.n - 1).glass * k);
  }

  root.Kit47 = { NS, f3, S, sm, P, el, sv, set, defs, word, writeWord, fullWord, notif, load, loadSeqs, drawSeq, flaps, paintFlaps, counter, rollKeys, paintCounter, digitAt };
})(window);
