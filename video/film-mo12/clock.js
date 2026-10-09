// MO12 « La pochette » : l'horloge à rouleaux (11:00 → 11:20) en verre, qui roule vers l'avant, centrée sur x = 540.
// Kit47.rollKeys est écrit pour un compteur qui descend (pour + 1, il recule de 9 chiffres) et Kit47.paintCounter réserve
// la place du « € » (horloge décalée d'environ 47 px, pas de deux-points) : d'où rollKeysUp et paintClock, sans toucher
// lib/kit47.js. Même matière que le compteur de MO5 (cases de verre, colonne de chiffres −60..19, liseré tracé).
(function (root) {
  const { track } = root.Motion;
  const { f3, sm, P, el, sv, set } = root.Kit47;

  // Indices de colonne déroulés (chiffre affiché = indice mod 10) pour une suite de minutes croissantes : chaque minute
  // avance la colonne des unités d'un cran, chaque dizaine celle des dizaines. Départ à −40 (le chiffre 0) : 11:00 → 11:20
  // fait deux tours d'unités sans sortir de la colonne. Renvoie [clés des dizaines, clés des unités] pour track().
  function rollKeysUp(vals, times, { base = -40, lag = 0.1, pr = P.roll } = {}) {
    return [1, 0].map((p) => {
      const at = (v) => base + Math.floor(v / 10 ** p);
      const keys = [[0, at(vals[0])]];
      for (let i = 1; i < vals.length; i++) if (at(vals[i]) !== at(vals[i - 1])) keys.push([times[i] + p * lag, at(vals[i]), pr]);
      return keys;
    });
  }

  // 4 cases (heures, minutes) + deux-points ; totalW = 4w + 2·gap + largeur des deux-points, centré sur 540
  function clock(parent, { top = 300, w = 124, h = 172, gap = 12, colon = 56, hours = '11' } = {}) {
    const totalW = 4 * w + 2 * gap + colon, x0 = 540 - totalW / 2;
    const xs = [x0, x0 + w + gap, x0 + 2 * w + gap + colon, x0 + 3 * w + 2 * gap + colon];
    const cells = xs.map((x, i) => {
      const b = el('div', 'ck-cell', parent, `width:${w}px;height:${h}px`);
      const g = el('div', 'glass', b, `inset:0;border-radius:24px`); el('div', 'sheen', g);
      const o = sv('svg', { width: w, height: h, style: 'position:absolute;left:0;top:0;overflow:visible' }, b);
      const r = sv('rect', { x: 1, y: 1, width: w - 2, height: h - 2, rx: 23, fill: 'none', stroke: '#ffd2b8', 'stroke-width': 2.5, 'stroke-dasharray': '600 600', 'stroke-dashoffset': 600 }, o);
      const d = el('div', 'digit', b); const col = el('div', 'col', d);
      if (i < 2) { const s = el('span', '', col); s.textContent = hours[i]; }
      else for (let k = -60; k < 20; k++) { const s = el('span', '', col); s.textContent = ((k % 10) + 10) % 10; }
      return { b, g, o, r, d, col, x, fixed: i < 2 };
    });
    const cx = xs[1] + w + colon / 2;
    const dots = [0.36, 0.64].map((f) => el('div', 'ck-dot', parent, `left:${cx - 8}px;top:${top + h * f - 8}px`));
    return { top, w, h, xs, cells, dots, cx };
  }
  // idx = [dizaines, unités] des minutes (indices de colonne) ; o.k : opacité globale ; o.cell(i) → {k, rx, dx, dy, sc}
  // (pour les retournements et la fonte dans « 20 min ») ; o.build : 0 → 1 (liseré tracé puis verre) ; o.blink : deux-points
  function paintClock(C, idx, { k = 1, cell = () => ({}), build = 1, blink = 1, colonK = 1, colonDx = 0 } = {}) {
    C.cells.forEach((c, i) => {
      const { k: ck = 1, rx = 0, dx = 0, dy = 0, sc = 1 } = cell(i);
      set(c.b, k * ck);
      if (c.b.style.visibility === 'hidden') return;
      c.b.style.transform = `translate(${f3(c.x + dx)}px,${f3(C.top + dy)}px) perspective(700px) rotateX(${f3(rx)}deg) scale(${f3(sc)})`;
      c.r.setAttribute('stroke-dashoffset', f3(600 * (1 - Math.min(1, build * 1.6))));
      c.o.style.opacity = f3(sm(0, 0.08, build) * (1 - 0.8 * sm(0.5, 1, build)));
      set(c.g, sm(0.35, 1, build)); set(c.d, sm(0.45, 1, build));
      if (!c.fixed) c.col.style.transform = `translateY(${f3(-(idx[i - 2] + 60) * C.h)}px)`;
    });
    C.dots.forEach((d) => { set(d, k * colonK * (0.55 + 0.45 * blink)); d.style.transform = `translateX(${f3(colonDx)}px)`; });
  }

  root.Clock47 = { rollKeysUp, clock, paintClock };
})(window);
