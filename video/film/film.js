// UTOPICAR — pub TikTok 15 s, 1080x1920.
// Contrat : window.seek(t) peint la frame t. Aucune transition CSS, aucune minuterie, aucun état entre frames.
(async function () {
  const { spring, track, clamp } = Motion;
  const TL = await (await fetch('../timeline.json')).json();
  const L = await (await fetch('../assets/ui/layout.json')).json();
  const M = TL.marks;
  const VW = L.viewport.w, VH = L.viewport.h;          // viewport réel de l'app (px CSS)
  const DEV = { x: 90, y: 520, w: 900, h: 1309, r: 56 }; // écran de l'app dans le cadre 1080x1920
  const UI = '../assets/ui/';
  const fmtEur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const eur = n => fmtEur.format(n);                   // même formatage que l'app
  const eurS = n => (n > 0 ? '+ ' : n < 0 ? '− ' : '') + fmtEur.format(Math.abs(n));

  const $ = s => document.querySelector(s);
  const el = (tag, cls, parent, css) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (parent) parent.appendChild(e); return e; };
  const px = v => v + 'px';
  const imgs = [];
  function img(name, parent, r) {
    r = r || L.shots[name];
    const i = el('img', 'lay', parent, { left: px(r.x || 0), top: px(r.y || 0), width: px(r.w), height: px(r.h) });
    i.src = UI + name + '.png'; imgs.push(i); return i;
  }
  // calque en verre : même backdrop-filter que le site sous le PNG transparent capturé
  function glass(name, parent) {
    const r = L.shots[name];
    const g = el('div', 'glass', parent, { left: px(r.x), top: px(r.y), width: px(r.w), height: px(r.h) });
    el('div', 'bd', g, { borderRadius: r.glass.radius, backdropFilter: r.glass.backdrop, webkitBackdropFilter: r.glass.backdrop });
    const i = el('img', null, g); i.src = UI + name + '.png'; imgs.push(i);
    return g;
  }

  /* ---------------- écran de l'app ---------------- */
  const stage = $('#stage'), light = $('#light'), device = $('#device'), cam = $('#cam'), fill = $('#fill'), markEl = $('#mark');
  function makeView(base) {
    const v = el('div', 'view', cam); const s = el('div', 'scroll', v);
    const sh = L.shots[base]; s.style.height = px(sh.h);
    img(base, s, { x: 0, y: 0, w: sh.w, h: sh.h });
    return { v, s };
  }
  const vScan = makeView('scan');
  glass('launch', vScan.v);
  const vRep = makeView('rapport-base');
  const lines = L.ledger.slice(0, -1).map(n => img(n, vRep.s));
  const totRow = img('lgTotalNoV', vRep.s);
  const T = L.total;
  const tot = el('div', 'counter', vRep.s, { left: px(T.x), top: px(T.y), width: px(T.w), height: px(T.h), fontSize: T.fontSize, fontWeight: T.fontWeight,
    fontStretch: T.fontStretch, letterSpacing: T.letterSpacing, color: T.color, lineHeight: T.lineHeight, textAlign: 'right', fontVariantNumeric: 'tabular-nums' });
  const plafond = img('plafond', vRep.s), pos = img('pos', vRep.s);
  const walkRows = [...L.ledger.slice(0, -1).map(n => L.shots[n]), L.shots.lgTotalNoV];
  const hl = el('div', null, vRep.s, { position: 'absolute', left: px(walkRows[0].x - 8), width: px(walkRows[0].w + 16), borderRadius: '8px', background: 'rgba(255,201,40,.22)', mixBlendMode: 'multiply' });
  const ind = el('div', null, vRep.s, { position: 'absolute', left: px(walkRows[0].x - 14), width: '5px', borderRadius: '3px', background: '#FFC928' });
  const vLive = makeView('live-base');
  const cards = L.cards.map(n => img(n, vLive.s));
  const vDash = makeView('dash-base');
  const kpis = L.kpis.map(K => {
    const d = el('div', 'counter', vDash.s, { left: px(K.x), top: px(K.y), height: px(K.h), fontSize: K.fontSize, fontWeight: K.fontWeight,
      fontStretch: K.fontStretch, letterSpacing: K.letterSpacing, color: K.color, lineHeight: K.lineHeight, fontVariantNumeric: 'tabular-nums' });
    const n = Number(K.text.replace(/[^\d]/g, '')); const isEur = /€/.test(K.text), isJ = /j\s*$/.test(K.text);
    return { d, n, fmt: v => isEur ? eur(Math.round(v)) : Math.round(v) + (isJ ? ' j' : '') };
  });
  const bar = glass('bar', cam);
  const docks = { scan: glass('dock-scan', cam), rapport: glass('dock-rapport', cam), live: glass('dock-live', cam), dash: glass('dock-dash', cam) };
  markEl.innerHTML = L.logo.markHTML.replace(/^<span[^>]*>/, '').replace(/<\/span>$/, '');

  const views = [
    { ...vScan, t0: -9, scroll: () => 760 },
    { ...vRep, t0: M.report, scroll: t => track(t, [[0, 100], [1.3, 300, 'default'], [M.dezoom, 250, 'default'], [M.scrollPlafond, 470, 'default']]) },
    { ...vLive, t0: M.tapLive + 0.05, scroll: t => track(t, [[0, 0], [M.liveScroll, L.cardTop - 70, 'default'], [M.cardScroll, L.cote.prix.y - 230, 'default']]) },
    { ...vDash, t0: M.tapDash + 0.05, scroll: () => 190 },
  ];

  // caméra dans l'écran : zoom z autour du point (fx, fy) du viewport
  const yTot = L.total.y + L.total.h / 2;
  const cz = [[0, 1.3], [0.05, 1.12, 'heavy'], [M.report, 1.35, 'heavy'], [1.3, 1.3, 'default'], [M.dezoom, 1.0, 'default'], [M.walk[0], 1.12, 'default'], [M.zoomTotal, 1.3, 'heavy'], [M.scrollPlafond, 1.0, 'default'],
    [M.zoomPlafond, 1.22, 'heavy'], [6.7, 1.0, 'default'], [M.zoomCote, 1.55, 'heavy'], [9.6, 1.0, 'default'], [M.kpiZoom, 1.12, 'heavy'], [M.logo, 1.0, 'default']];
  const cfx = [[0, 195], [M.report, 195, 'heavy'], [1.3, 228, 'default'], [M.dezoom, 195, 'default'], [M.walk[0], 185, 'default'], [M.walk[3], 205, 'default'], [M.zoomTotal, 228, 'heavy'], [M.scrollPlafond, 195, 'default'],
    [M.zoomPlafond, 196, 'heavy'], [6.7, 195, 'default'], [M.zoomCote, 226, 'heavy'], [9.6, 195, 'default']];
  const cfy = [[0, 330], [0.05, 320, 'heavy'], [M.report, 200, 'heavy'], [1.3, yTot - 300, 'default'], [M.dezoom, VH / 2, 'default'], ...M.walk.slice(0, 6).map((tw, i) => [tw, clamp(walkRows[i].y + walkRows[i].h / 2 - 250, 250, 330), 'default']), [M.zoomTotal, yTot - 250, 'heavy'], [M.scrollPlafond, VH / 2, 'default'],
    [M.zoomPlafond, 300, 'heavy'], [6.7, VH / 2, 'default'], [M.zoomCote, 270, 'heavy'], [9.6, VH / 2, 'default'], [M.kpiZoom, 240, 'heavy'], [M.logo, VH / 2, 'default']];
  function camera(t) {
    const z = track(t, cz);
    const fx = clamp(track(t, cfx), VW / (2 * z), VW - VW / (2 * z));
    const fy = clamp(track(t, cfy), VH / (2 * z), VH - VH / (2 * z));
    return { z, fx, fy };
  }

  // pressions du curseur (coordonnées du viewport)
  const ctr = r => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
  const taps = [{ t: M.tapAnalyse, x: L.aGo.x + L.aGo.w * 0.8, y: L.aGo.y + L.aGo.h * 0.7 }, { t: M.tapLive, ...ctr(L.dockBtns.live) }, { t: M.tapDash, ...ctr(L.dockBtns.dash) }];
  const impacts = [M.report, M.zoomTotal, M.zoomPlafond, 9.0, M.kpiZoom];

  /* ---------------- titres ---------------- */
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const keyify = (txt, key) => { const i = key ? txt.indexOf(key) : -1; return i < 0 ? esc(txt) : esc(txt.slice(0, i)) + '<span class="key">' + esc(key) + '</span>' + esc(txt.slice(i + key.length)); };
  const titles = TL.titles.map((Ti, i) => {
    const d = el('div', 'title', $('#titles'));
    const ls = Ti.lines.map(txt => { const m = el('div', 'tl', d); const s = el('span', null, m); s.innerHTML = keyify(txt.replace(/ (?=\d|€|\?|:)/g, ' '), Ti.key.replace(/ /g, ' ')); return s; });
    return { t: i === 0 ? -0.4 : Ti.t, d, ls };
  });

  /* ---------------- logo + CTA ---------------- */
  const word = $('#word'); word.textContent = L.logo.text || 'UTOPICAR';
  const MS = 176, MX = 72, MY = 730;
  const ctaPre = $('#ctaPre'), ctaPill = $('#ctaPill'), ctaPost = $('#ctaPost');
  ctaPre.firstChild.textContent = TL.cta.pre; ctaPill.textContent = TL.cta.word; ctaPost.firstChild.textContent = TL.cta.post;

  await document.fonts.load("800 100px 'Archivo'");
  await document.fonts.ready;
  // tailles de titres ajustées à la largeur utile (x 72 → 940)
  for (const T of titles) {
    T.d.style.fontSize = '118px';
    const w = Math.max(1, ...T.ls.map(s => s.getBoundingClientRect().width));
    T.d.style.fontSize = px(Math.min(118, Math.floor(118 * 860 / w)));
  }
  word.style.fontSize = '100px';
  const ww = word.getBoundingClientRect().width;
  const wsize = Math.min(104, Math.floor(100 * (940 - (MX + MS + 40)) / ww));
  Object.assign(word.style, { fontSize: px(wsize), left: px(MX + MS + 40), top: px(MY + MS / 2 - wsize * 0.5) });
  Object.assign(ctaPre.style, { top: px(1000), fontSize: '92px' });
  Object.assign(ctaPill.style, { top: px(1118), fontSize: '100px', padding: '22px 36px 20px' });
  Object.assign(ctaPost.style, { top: px(1286), fontSize: '58px' });
  await Promise.all(imgs.map(i => i.decode().catch(() => {})));

  /* ---------------- seek ---------------- */
  const show = (e, on) => { e.style.display = on ? '' : 'none'; };
  function enter(e, t, t0, preset, dy, dx) {
    const p = spring(t - t0, preset || 'default');
    show(e, t >= t0);
    e.style.transform = `translate(${(1 - p) * (dx || 0)}px, ${(1 - p) * (dy == null ? 16 : dy)}px)`;
    e.style.opacity = clamp(p * 1.6, 0, 1);
  }

  function seek(t) {
    /* écran : rectangle, morph vers le carré du logo */
    const dx = track(t, [[0, DEV.x], [M.logo, MX, 'default']]), dy = track(t, [[0, DEV.y], [M.logo, MY, 'default']]);
    const dw = track(t, [[0, DEV.w], [M.logo, MS, 'default']]), dh = track(t, [[0, DEV.h], [M.logo, MS, 'default']]);
    const dr = track(t, [[0, DEV.r], [M.logo, MS * 9 / 32, 'default']]);
    let punch = 0; if (t < M.logo) for (const ti of impacts) punch += 0.016 * (spring(t - ti, 'snappy') - spring(t - ti - 0.07, 'default'));
    const zc = t < M.logo ? track(t, cz) : 1;
    Object.assign(device.style, { left: px(dx), top: px(dy), width: px(dw), height: px(dh), borderRadius: px(dr), transform: `scale(${1 + punch + (zc - 1) * 0.035})` });
    light.style.opacity = clamp(1 - spring(t - M.logo, 'default'), 0, 1);
    const k = dw / VW;
    const { z, fx, fy } = camera(t);
    const ox = (dw - VW * k) / 2, oy = (dh - VH * k) / 2;
    cam.style.transform = `translate(${ox}px, ${oy}px) scale(${k}) translate(${VW / 2}px, ${VH / 2}px) scale(${z}) translate(${-fx}px, ${-fy}px)`;
    show(cam, t < M.logo + 0.8);
    const fp = clamp(spring(t - M.logo, 'snappy') * 1.8, 0, 1);
    show(fill, t >= M.logo);
    fill.style.opacity = fp; cam.style.opacity = 1 - fp;
    const mp = spring(t - (M.logo + 0.3), 'snappy'), ms = dw * 19 / 32;
    show(markEl, t >= M.logo + 0.3);
    Object.assign(markEl.style, { width: px(ms), height: px(ms), marginLeft: px(-ms / 2), marginTop: px(-ms / 2), transform: `scale(${0.6 + 0.4 * mp})`, opacity: clamp(mp * 1.5, 0, 1) });

    /* vues : poussée verticale d'une vue sur la précédente */
    views.forEach((V, i) => {
      const next = views[i + 1];
      const on = t >= V.t0 && !(next && t > next.t0 + 1.2);
      show(V.v, on); if (!on) return;
      const p = V.t0 < 0 ? 1 : spring(t - V.t0, 'snappy');
      const pn = next ? spring(t - next.t0, 'snappy') : 0;
      V.v.style.zIndex = i;
      V.v.style.transform = `translateY(${(1 - p) * VH - pn * VH * 0.3}px)`;
      V.s.style.transform = `translateY(${-V.scroll(t)}px)`;
    });
    // rapport : cascade des lignes (comme l'animation lgIn de l'app), total, plafond
    lines.forEach((e, i) => enter(e, t, M.lines[i], 'default', 14));
    const W = M.walk; show(ind, t >= W[0] - 0.12 && t < M.scrollPlafond + 0.4);
    if (t >= W[0] - 0.12) {
      const { lo, hi } = Motion.indicator(t, W.map((tw, i) => [tw, walkRows[i].y + 4, walkRows[i].y + walkRows[i].h - 4]));
      const a = spring(t - (W[0] - 0.12), 'snappy') - spring(t - M.scrollPlafond, 'snappy');
      Object.assign(ind.style, { top: px(lo), height: px(Math.max(2, hi - lo)), transform: `scaleX(${clamp(a, 0, 1)})`, opacity: clamp(a * 2, 0, 1) });
      Object.assign(hl.style, { top: px(lo - 6), height: px(Math.max(2, hi - lo + 12)), opacity: clamp(a, 0, 1) });
    }
    show(hl, t >= W[0] - 0.12 && t < M.scrollPlafond + 0.4);
    enter(totRow, t, M.total, 'default', 14);
    const tp = spring(t - M.total, 'heavy');
    show(tot, t >= M.total); tot.textContent = eurS(Math.round(-1200 * Math.min(1, tp / 0.99))); tot.style.opacity = clamp(tp * 3, 0, 1);
    enter(plafond, t, M.plafond, 'default', 20);
    enter(pos, t, M.plafond + 0.25, 'default', 12);
    // recherche : l'annonce nouvelle arrive
    cards.forEach((e, i) => enter(e, t, M.card + i * 0.25, 'default', 0, 400));
    // tableau de bord : compteurs des KPI
    kpis.forEach((K, i) => { const p = spring(t - M.kpis[i], 'heavy'); show(K.d, t >= M.kpis[i]); K.d.textContent = K.fmt(K.n * Math.min(1, p / 0.99)); K.d.style.transform = `translateY(${(1 - p) * 10}px)`; K.d.style.opacity = clamp(p * 3, 0, 1); });
    // dock : l'onglet actif change au moment de la pression
    const cur = t < M.report ? 'scan' : t < M.tapLive + 0.05 ? 'rapport' : t < M.tapDash + 0.05 ? 'live' : 'dash';
    for (const kx in docks) show(docks[kx], kx === cur);
    bar.style.zIndex = docks[cur].style.zIndex = 10;

    /* curseur */
    const cursor = $('#cursor');
    const tap = taps.find(a => t >= a.t - 0.55 && t <= a.t + 0.6);
    show(cursor, !!tap && t < M.logo);
    if (tap) {
      const sx = dx + k * ((tap.x - fx) * z + VW / 2), sy = dy + k * ((tap.y - fy) * z + VH / 2);
      const mv = spring(t - (tap.t - 0.5), 'default');
      const cx = sx + (1 - mv) * 110, cy = sy + (1 - mv) * 170;
      const vis = spring(t - (tap.t - 0.52), 'snappy') - spring(t - (tap.t + 0.22), 'snappy');
      const press = track(t, [[0, 1], [tap.t - 0.07, 0.74, 'snappy'], [tap.t + 0.05, 1, 'snappy']]);
      cursor.style.transform = `translate(${cx}px, ${cy}px) scale(${Math.max(0, vis) * press})`;
      cursor.style.opacity = clamp(vis * 2, 0, 1);
    }

    /* titres : masque de ligne, sortie avant le titre suivant ; parallaxe avec le zoom de l'écran */
    $('#titles').style.transform = `translateY(${-(z - 1) * 90}px)`;
    titles.forEach((Ti, i) => {
      const tn = i + 1 < titles.length ? titles[i + 1].t : 99;
      const on = t >= Ti.t && t < tn + 0.35 && Ti.ls.length;
      show(Ti.d, on); if (!on) return;
      const x = spring(t - (tn - 0.16), 'snappy');
      Ti.ls.forEach((s, j) => {
        const e = spring(t - (Ti.t + 0.06 * j), 'heavy');
        s.style.transform = `translateY(${(1 - e) * 108 - x * 46}%)`;
        s.style.opacity = clamp(e * 2.2, 0, 1) * (1 - x);
      });
    });

    /* carton final : poussée lente et continue (aucune frame figée) */
    const drift = t > M.logo ? 1 + 0.03 * clamp((t - M.logo) / (TL.dur - M.logo), 0, 1) : 1;
    stage.style.scale = drift; stage.style.transformOrigin = '420px 1000px';
    /* mot-symbole et appel à l'action */
    const wp = spring(t - M.wordmark, 'heavy');
    show(word, t >= M.wordmark);
    word.style.clipPath = `inset(-20% ${(1 - wp) * 100}% -20% 0)`;
    word.style.transform = `translateX(${(1 - wp) * -36}px)`;
    const line = (e, t0) => { const p = spring(t - t0, 'heavy'); show(e, t >= t0); e.firstChild.style.transform = `translateY(${(1 - p) * 108}%)`; e.firstChild.style.opacity = clamp(p * 2.2, 0, 1); };
    line(ctaPre, M.cta);
    const pp = spring(t - (M.cta + 0.12), 'snappy');
    show(ctaPill, t >= M.cta + 0.12);
    ctaPill.style.transform = `scale(${0.82 + 0.18 * pp})`; ctaPill.style.transformOrigin = '0 50%';
    ctaPill.style.clipPath = `inset(0 ${(1 - clamp(pp * 1.2, 0, 1)) * 100}% 0 0 round 28px)`;
    line(ctaPost, M.cta + 0.3);
  }

  window.TL = TL;
  window.seek = seek;
  seek(0);
  window.filmReady = true;

  // aperçu interactif hors rendu uniquement
  if (!/render/.test(location.search)) {
    const t0 = performance.now();
    const loop = () => { seek(((performance.now() - t0) / 1000) % TL.dur); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
})();
