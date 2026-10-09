// Modules propres à MO13 « Avec 1 500 € », posés sur lib/kit47.js (lu, jamais modifié).
// Fabrication : verre dépoli compté par groupes. Un seul backdrop-filter par groupe (la plaque du compteur, la plaque
// des palettes, la carte de devant) ; tout le reste est du verre « peint » (dégradé, reflet, liseré), sans flou.
// Les fonds flous sont peints dans de petits canvas (ctx.filter) puis affichés agrandis, sans filter CSS.
(function (root) {
  const { spring, track, clamp, lerp } = root.Motion;
  const { f3, S, sm, P, el, sv, set, word } = root.Kit47;

  // ---------- fonds flous : petit canvas, flou au dessin, agrandi par le CSS ----------
  function blurCanvas(parent, cw, ch, style) { const c = el('canvas', 'abs', parent, style); c.width = cw; c.height = ch; return c; }
  // peint une image de séquence (lecture en aller-retour, comme Kit47.drawSeq) floutée dans le petit canvas
  function paintSeq(cv, frames, tt, filter = '', fps = 30) {
    const n = frames.length; let i = Math.max(0, Math.floor(tt * fps)); const c = i % (2 * n - 2); i = c < n ? c : 2 * n - 2 - c;
    const im = frames[i], ctx = cv.getContext('2d'); const r = Math.max(cv.width / im.width, cv.height / im.height);
    const w = im.width * r, h = im.height * r;
    ctx.filter = filter || 'none'; ctx.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h); ctx.filter = 'none';
  }

  // ---------- compteur : clés de roulement dans le sens de l'argent (descend aux débits, monte aux virements) ----------
  const digitAt = (v, p) => Math.floor(Math.abs(v) / 10 ** p) % 10;
  function rollKeys2(vals, times, n = 4, pre = P.roll) {
    let lo = 0, hi = 9;
    const keys = Array.from({ length: n }, (_, p) => {
      let idx = digitAt(vals[0], p); const k = [[0, idx]];
      for (let i = 1; i < vals.length; i++) {
        const a = digitAt(vals[i - 1], p), b = digitAt(vals[i], p); if (a === b) continue;
        idx += vals[i] > vals[i - 1] ? (b - a + 10) % 10 : -((a - b + 10) % 10);
        const pr = Array.isArray(pre) ? pre[i] : pre, stg = pr && pr.f < 1.2 ? 0.09 : 0.035;
        k.push([times[i] + (n - 1 - p) * stg, idx, pr]); lo = Math.min(lo, idx); hi = Math.max(hi, idx);
      }
      return k;
    });
    return { keys, lo: lo - 2, hi: hi + 2 };
  }
  // une seule plaque de verre (backdrop-filter) sous des cases peintes
  function plateCounter(parent, o) {
    const { top, w = 108, h = 150, gap = 10, n = 4, fs = 112, efs = 90, lo, hi, label = 'COMPTE', labelTop = top - 50, pad = 14 } = o;
    const lab = el('div', 'abs', parent, `top:${labelTop}px;left:0;width:1080px;text-align:center;font:700 28px Satoshi;letter-spacing:.32em;color:#a59a90;white-space:nowrap`);
    const labL = [...label].map((c) => { const s = el('span', '', lab, 'display:inline-block'); s.textContent = c; return s; });
    const plate = el('div', 'glass cplate', parent, `left:0;top:${top - pad}px;height:${h + 2 * pad}px;border-radius:${30 + pad}px`); el('div', 'sheen', plate);
    const ring = el('div', 'ring', parent, `left:0;top:${top - pad}px;height:${h + 2 * pad}px;border-radius:${30 + pad}px`);
    const cells = Array.from({ length: n }, () => {
      const c = el('div', 'pcell', parent, `width:${w}px;height:${h}px`);
      const ov = sv('svg', { width: w, height: h, style: 'position:absolute;left:0;top:0;overflow:visible' }, parent);
      const r = sv('rect', { x: 1, y: 1, width: w - 2, height: h - 2, rx: 21, fill: 'none', stroke: '#ffd2b8', 'stroke-width': 2.5, 'stroke-dasharray': '600 600', 'stroke-dashoffset': 600 }, ov);
      const d = el('div', 'digit', parent, `width:${w}px;height:${h}px`); const col = el('div', 'col', d, `width:${w}px`);
      for (let k = lo; k <= hi; k++) { const s = el('span', '', col, `height:${h}px;line-height:${h}px;font-size:${fs}px`); s.textContent = ((k % 10) + 10) % 10; }
      return { c, o: ov, r, d, col };
    });
    const euro = el('div', 'abs', parent, `font:700 ${efs}px Clash;line-height:${h}px;white-space:nowrap`); euro.textContent = '€';
    return { top, w, h, gap, n, lo, lab, labL, plate, ring, cells, euro, pad, efs };
  }
  // vis[i] (0..1) par case ; build(i) = {draw, glass[, digit, euro]} (digit et euro : opacité des chiffres et du « € »,
  // celle du verre par défaut) ; k = opacité globale ; lit = anneau orange (0..1)
  function paintPlateCounter(C, st, keys, vis, build, k, lit = 0, dk = 1) {
    const ew = C.efs * 0.62, nC = vis.reduce((a, b) => a + b, 0), totalW = nC * C.w + Math.max(0, nC - 1) * C.gap + 16 + ew;
    let cx = 540 - totalW / 2; const xs = [];
    for (let i = 0; i < C.n; i++) { xs.push(cx); cx += (C.w + C.gap) * vis[i]; }
    const left = 540 - totalW / 2 - C.pad, W = totalW + 2 * C.pad;
    const b3 = build(C.n - 1), g0 = b3.glass, eu = b3.euro ?? g0;
    C.plate.style.left = `${f3(left)}px`; C.plate.style.width = `${f3(W)}px`; set(C.plate, g0 * k);
    C.ring.style.left = `${f3(left)}px`; C.ring.style.width = `${f3(W)}px`; set(C.ring, lit * k);
    C.cells.forEach((c, i) => {
      const { draw: dr, glass: gl, digit: dg = gl } = build(i), kk = vis[i];
      for (const e of [c.c, c.o, c.d]) { e.style.transform = `translate(${f3(xs[i])}px,${C.top}px) scale(${f3(0.6 + 0.4 * kk)})`; e.style.transformOrigin = '0 50%'; }
      c.r.setAttribute('stroke-dashoffset', f3(600 * (1 - dr)));
      c.o.style.opacity = f3(sm(0, 0.08, dr) * (1 - 0.75 * gl) * kk * k);
      set(c.c, gl * kk * k);
      c.col.style.transform = `translateY(${f3(-(track(st, keys[C.n - 1 - i]) - C.lo) * C.h)}px)`;
      set(c.d, dg * kk * kk * kk * k * dk);
    });
    C.euro.style.transform = `translate(${f3(cx + 4)}px,${C.top}px)`; set(C.euro, eu * k * dk);
    return { left, W, right: left + W };
  }

  // ---------- palettes : une plaque de verre, des cases peintes ; mot (7 cases) + nombre (2 cases) ----------
  const SCR = 'ARTVQMEZNSOLC';
  function plateFlaps(parent, o) {
    const { y, w = 72, h = 96, fs = 64, g = 6, gap = 22, nW = 7, nN = 2, pad = 12 } = o;
    const plate = el('div', 'glass fplate', parent, `left:0;top:${y - pad}px;height:${h + 2 * pad}px;border-radius:${18 + pad}px`); el('div', 'sheen', plate);
    const cells = Array.from({ length: nW + nN }, (_, i) => {
      const d = el('div', 'pflap', parent, `left:0;top:${y}px;width:${w}px;height:${h}px;font-size:${fs}px`);
      const s = el('span', '', d); el('i', '', d); return { d, s, num: i >= nW };
    });
    return { y, w, h, g, gap, nW, nN, pad, plate, cells };
  }
  // ev = [[t, 'MARCHE', '1'], ...] (temps du récit) ; une case qui change de lettre retourne, une case vide se replie
  function paintPlateFlaps(F, t, ev, k, step = 0.05) {
    const slots = (e) => { const a = []; for (let i = 0; i < F.nW; i++) a.push(e[1][i] || ''); const nn = String(e[2]); for (let i = 0; i < F.nN; i++) a.push(nn[i] || ''); return a; };
    const S0 = ev.map(slots);
    let x = 0; const xs = []; let tot = 0; const vis = [];
    F.cells.forEach((c, i) => {
      const keys = [[0, 0]]; let prev = '', last = null;
      // le nombre tombe à l'heure de l'événement (sans attendre la vague du mot) : « SEMAINE 8 → 11 » suit la voix
      ev.forEach((e, j) => { const ch = S0[j][i]; const ts = e[0] + (c.num ? i - F.nW : i) * step; if (ch !== prev) { keys.push([ts, ch ? 1 : 0, P.heavy]); if (t >= ts) last = { ts, ch, from: prev }; prev = ch; } });
      vis[i] = clamp(track(t, keys), 0, 1.2);
      c.last = last;
    });
    F.cells.forEach((c, i) => { if (i === F.nW) tot += F.gap; tot += (F.w + F.g) * vis[i]; });
    tot -= F.g;
    x = 540 - tot / 2;
    F.cells.forEach((c, i) => {
      if (i === F.nW) x += F.gap;
      xs[i] = x; x += (F.w + F.g) * vis[i];
      const L = c.last; let ch = '', p = 1;
      // les lettres défilent pendant le retournement ; un chiffre, lui, se déplie directement (un chiffre de passage se lirait comme une autre semaine)
      if (L) { p = S(t, L.ts, P.flip); ch = c.num ? (L.ch || L.from) : p < 0.72 ? (L.ch || L.from ? SCR[(Math.floor(p * 9) + i * 3) % SCR.length] : '') : (L.ch || L.from); }
      c.s.textContent = ch;
      const vv = clamp(vis[i], 0, 1);
      // perspective seulement pendant le retournement : une case posée reste un calque 2D (moins cher à composer)
      const rx = (1 - clamp(p, 0, 1.05)) * 92;
      c.d.style.transform = Math.abs(rx) < 0.05 ? `translateX(${f3(xs[i])}px) scale(${f3(0.7 + 0.3 * vv)})` : `translateX(${f3(xs[i])}px) perspective(700px) rotateX(${f3(rx)}deg) scale(${f3(0.7 + 0.3 * vv)})`;
      set(c.d, sm(0, 0.12, p) * vv * k);
    });
    F.plate.style.left = `${f3(540 - tot / 2 - F.pad)}px`; F.plate.style.width = `${f3(tot + 2 * F.pad)}px`;
    // toutes cases repliées, tot vaut encore gap − g (16 px) : la plaque vide ne s'allume pas (round 2 : pastille à 8 %
    // sous « 1 500 » de 4,8 à 5,1 s)
    set(F.plate, k * clamp((tot - (F.gap - F.g)) / 200, 0, 1));
  }

  const STEP_LAB_FS = 56, STEP_LAB_Y = 74;          // inscription de la contremarche : taille et ligne de base sous le bord avant
  // ---------- marche de verre peint : dessus elliptique, contremarche qui s'efface, arête tracée à la lumière ----------
  function glassStep(parent, o) {
    const { X, Y, a = 440, b = 64, R = 170, id, label } = o;
    const PADX = 70, PADY = 70, W = 2 * a + 2 * PADX, H = 2 * b + R + 160;
    const s = sv('svg', { width: W, height: H, style: `position:absolute;left:${X - a - PADX}px;top:${Y - b - PADY}px;overflow:visible` }, parent);
    const d = sv('defs', {}, s);
    const gTop = sv('linearGradient', { id: 'st' + id, x1: 0, y1: 0, x2: 0.2, y2: 1 }, d);
    sv('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 0.05 }, gTop); sv('stop', { offset: 0.6, 'stop-color': '#ffe2cf', 'stop-opacity': 0.16 }, gTop); sv('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0.26 }, gTop);
    const gRis = sv('linearGradient', { id: 'sr' + id, x1: 0, y1: 0, x2: 0, y2: 1 }, d);
    sv('stop', { offset: 0, 'stop-color': '#ffd9c2', 'stop-opacity': 0.30 }, gRis); sv('stop', { offset: 0.12, 'stop-color': '#fff', 'stop-opacity': 0.12 }, gRis); sv('stop', { offset: 0.45, 'stop-color': '#fff', 'stop-opacity': 0.05 }, gRis); sv('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }, gRis);
    const gSh = sv('linearGradient', { id: 'ss' + id, x1: 0, y1: 0, x2: 1, y2: 0 }, d);
    sv('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 0 }, gSh); sv('stop', { offset: 0.42, 'stop-color': '#fff', 'stop-opacity': 0 }, gSh); sv('stop', { offset: 0.5, 'stop-color': '#fff', 'stop-opacity': 0.22 }, gSh); sv('stop', { offset: 0.58, 'stop-color': '#fff', 'stop-opacity': 0 }, gSh); sv('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }, gSh);
    // lueur sans filtre SVG (le flou gaussien se recalculait à chaque image : la caméra bouge le monde) : traits larges translucides, halo en dégradé radial
    const pg = sv('radialGradient', { id: 'pg' + id }, d); sv('stop', { offset: 0, 'stop-color': '#ff7a3a', 'stop-opacity': 0.75 }, pg); sv('stop', { offset: 0.45, 'stop-color': '#ff7a3a', 'stop-opacity': 0.35 }, pg); sv('stop', { offset: 1, 'stop-color': '#ff7a3a', 'stop-opacity': 0 }, pg);
    const g = sv('g', { transform: `translate(${a + PADX},${b + PADY})` }, s);
    const ris = `M${-a} 0 A${a} ${b} 0 0 0 ${a} 0 L${a} ${R} A${a} ${b} 0 0 1 ${-a} ${R} Z`;
    const riser = sv('path', { d: ris, fill: `url(#sr${id})` }, g);
    const sheen = sv('path', { d: ris, fill: `url(#ss${id})` }, g);
    const top = sv('ellipse', { cx: 0, cy: 0, rx: a, ry: b, fill: `url(#st${id})`, stroke: 'rgba(255,255,255,.42)', 'stroke-width': 1.8 }, g);
    sv('ellipse', { cx: 0, cy: 3, rx: a - 18, ry: b - 9, fill: 'none', stroke: 'rgba(255,255,255,.12)', 'stroke-width': 1.2 }, g);
    const edgeD = `M${-a} 0 A${a} ${b} 0 0 0 ${a} 0`;
    const lis = sv('path', { d: edgeD, fill: 'none', stroke: 'rgba(255,236,224,.55)', 'stroke-width': 2.2 }, g);
    const glow = sv('g', {}, g);
    const glowP = [[30, 0.12], [17, 0.22], [9, 0.4]].map(([w, o]) => sv('path', { d: edgeD, fill: 'none', stroke: '#ff7a3a', 'stroke-width': w, 'stroke-opacity': o, 'stroke-linecap': 'round' }, glow));
    const edge = sv('path', { d: edgeD, fill: 'none', stroke: '#ffe8d8', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    const L = edge.getTotalLength();
    for (const e of [...glowP, edge]) { e.setAttribute('stroke-dasharray', `${f3(L)} ${f3(L)}`); e.setAttribute('stroke-dashoffset', f3(L)); }
    const pen = sv('g', {}, g); sv('circle', { r: 34, fill: `url(#pg${id})` }, pen); sv('circle', { r: 7, fill: '#fff' }, pen);
    const txt = sv('g', {}, g);
    // l'inscription « achat → revente ✓ » : 56 px (round 1 : 40 px, ≈ 7 px de haut à 360 px au recul)
    const w = label ? word(txt, label, `600 ${STEP_LAB_FS}px Clash`, STEP_LAB_FS, 0, b + STEP_LAB_Y, { sw: 1.8 }) : null;
    if (w) { const ck = w.items[w.items.length - 1]; if (ck && ck.ch === '✓') { ck.fill.setAttribute('fill', '#ffb38a'); } }
    return { s, g, X, Y, a, b, R, riser, sheen, top, lis, glow, glowP, edge, L, pen, txt, w };
  }

  // ---------- étiquette en papier, suspendue au rétroviseur par un fil ----------
  // ancrée dans le monde (elle ne grandit pas avec la voiture) ; old = prix affiché, neu = prix payé, max = « prix max »
  function paperTag(parent, o) {
    const { old, neu, max = false, W = 320 } = o;
    const H = max ? 196 : 158, Lf = 34;
    const hang = el('div', 'abs', parent, 'transform-origin:0 0');
    const fil = el('div', 'abs', hang, `left:-1.5px;top:0;width:3px;height:${Lf + 14}px;border-radius:2px;background:linear-gradient(#f4ebdd,#cbbba3)`);
    const tag = el('div', 'ptag', hang, `left:${-W / 2}px;top:${Lf}px;width:${W}px;height:${H}px`);
    const top = el('div', 'pt-top', tag); top.textContent = 'À VENDRE';
    const oldE = el('div', 'pt-old', tag); oldE.innerHTML = old.replace(' ', '<i style="display:inline-block;width:.24em"></i>');
    const stS = sv('svg', { width: 230, height: 40, viewBox: '0 0 230 40', style: 'position:absolute;left:18px;top:62px;overflow:visible' }, tag);
    const stP = sv('path', { d: 'M4 26 C 70 8, 150 32, 226 10', stroke: '#ff5a1f', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': '260 260', 'stroke-dashoffset': 260 }, stS);
    const wsv = sv('svg', { width: W, height: H, style: 'position:absolute;left:0;top:0;overflow:visible' }, tag);
    const nw = word(wsv, neu, '700 64px Clash', 64, 22, 116, { align: 'left', fill: '#1c140e', strokeColor: '#6b4a33', sw: 1.6 });
    const ck = nw.items[nw.items.length - 1]; if (ck && ck.ch === '✓') ck.fill.setAttribute('fill', '#ff5a1f');
    const mw = max ? word(wsv, 'prix max', 'italic 500 40px Fraunces', 40, 24, 168, { align: 'left', italic: true, fill: '#ff5a1f', strokeColor: '#ff8a4c', sw: 1.2 }) : null;
    const pen = sv('g', {}, wsv); sv('circle', { r: 22, fill: '#ff7a3a', opacity: 0.55 }, pen); sv('circle', { r: 6, fill: '#fff' }, pen);
    return { hang, fil, tag, top: top, oldE, stP, nw, mw, pen, W, H, Lf };
  }

  // ---------- le ticket de frais (marches 2 et 3) : une seule notification qui liste ses lignes et son total ----------
  function ticket(parent, lines, total, app = 'Compte courant · maintenant') {
    const d = el('div', 'glass notif ticket', parent); el('div', 'sheen', d);
    const c = el('canvas', '', d); c.width = 372; c.height = 276;
    const tx = el('div', '', d, 'min-width:0');
    el('div', 'app', tx).textContent = app;
    const ls = lines.map((l) => { const r = el('div', 'tl', tx); r.innerHTML = l; return r; });
    const am = el('div', 'am', tx); am.innerHTML = `<b>−</b> ${total} €`;
    return { d, c, ls };
  }

  // texte qui tient dans sa largeur : on réduit la police jusqu'à ce qu'il rentre (mesuré une fois au chargement)
  function fit(e, maxW, minFs = 18) { let fs = parseFloat(getComputedStyle(e).fontSize); while (e.scrollWidth > maxW && fs > minFs) { fs -= 1; e.style.fontSize = fs + 'px'; } return fs; }

  // la carte de devant garde son verre ; celles qui passent derrière perdent leur backdrop-filter (fond opaque équivalent)
  const flat = (e, on) => { if (on) e.classList.add('flat'); else e.classList.remove('flat'); };

  // silhouette d'une voiture tirée de l'alpha du PNG (rembobinage, annonce) ; reflet flouté d'avance en petit
  function silhouette(img, w, top = '#3a3036', bot = '#17121a', rim = 'rgba(255,190,150,.85)') {
    const c = document.createElement('canvas'); c.width = w; c.height = Math.round(w * img.height / img.width); const x = c.getContext('2d');
    x.drawImage(img, 0, 0, c.width, c.height); x.globalCompositeOperation = 'source-in';
    const g = x.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, top); g.addColorStop(1, bot); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    // liseré : l'alpha décalé d'un pixel vers le bas, retiré
    const r = document.createElement('canvas'); r.width = c.width; r.height = c.height; const y = r.getContext('2d');
    y.drawImage(img, 0, 0, c.width, c.height); y.globalCompositeOperation = 'source-in'; y.fillStyle = rim; y.fillRect(0, 0, c.width, c.height);
    y.globalCompositeOperation = 'destination-out'; y.drawImage(img, 0, 3, c.width, c.height);
    x.globalCompositeOperation = 'source-over'; x.drawImage(r, 0, 0);
    return c;
  }
  function reflection(img, w, blur = 3) {
    const c = document.createElement('canvas'); c.width = Math.round(w / 3); c.height = Math.round(c.width * img.height / img.width); const x = c.getContext('2d');
    x.filter = `blur(${blur}px)`; x.translate(0, c.height); x.scale(1, -1); x.drawImage(img, 0, 0, c.width, c.height); return c;
  }

  // ---------- écriture à la lumière, sans calque d'opacité ----------
  // Même rendu que Kit47.writeWord, mais en fill-opacity / stroke-opacity : l'attribut opacity ouvrait un calque par
  // glyphe (≈ 200 glyphes sur la carte). Une fois le glyphe écrit, le contour pointillé se cache et le léger liseré
  // restant (15 %) passe sur le glyphe lui-même (paint-order : contour sous le remplissage, comme avant).
  function prep(g) {
    if (g._p) return; g._p = 1;
    for (const a of ['stroke', 'stroke-width']) g.fill.setAttribute(a, g.stroke.getAttribute(a));
    g.fill.setAttribute('stroke-linejoin', 'round'); g.fill.setAttribute('paint-order', 'stroke'); g.fill.setAttribute('stroke-opacity', '0');
  }
  function writeWord(w, t, t0, step = 0.05, dy = 26, k = 1) {
    w.items.forEach((g, i) => {
      prep(g);
      const ts = t0 + i * step, dr = S(t, ts, P.draw), fi = S(t, ts + 0.16, P.rise);
      const so = sm(ts - 0.01, ts + 0.04, t) * (1 - 0.85 * fi) * k, done = fi >= 0.999 && dr >= 0.999;
      g.stroke.setAttribute('stroke-dashoffset', f3(g.L * (1 - dr)));
      g.stroke.setAttribute('stroke-opacity', f3(so));
      g.stroke.style.visibility = done || so < 0.002 ? 'hidden' : 'visible';
      g.fill.setAttribute('fill-opacity', f3(fi * k)); g.fill.setAttribute('stroke-opacity', done ? f3(so) : '0');
      g.fill.style.visibility = fi * k < 0.002 ? 'hidden' : 'visible';
      g.g.setAttribute('transform', `translate(0,${f3((1 - fi) * dy)})`);
    });
  }
  // un mot déjà écrit : tout plein, aucun contour
  function fullWord(w, k = 1) { w.items.forEach((g) => { g.stroke.style.visibility = 'hidden'; g.fill.setAttribute('fill-opacity', f3(k)); g.fill.style.visibility = k < 0.002 ? 'hidden' : 'visible'; g.g.setAttribute('transform', ''); }); }

  root.Kit13 = { STEP_LAB_Y, writeWord, fullWord, blurCanvas, paintSeq, rollKeys2, plateCounter, paintPlateCounter, plateFlaps, paintPlateFlaps, glassStep, paperTag, ticket, fit, flat, silhouette, reflection };
})(window);
