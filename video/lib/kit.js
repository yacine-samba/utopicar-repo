// Outils communs aux films 60 s (v5 explicatif, v6 conversation) : éléments DOM posés une fois,
// puis réglés par des fonctions pures du temps. Aucun état entre deux frames.
(function (root) {
  const { spring, clamp } = root.Motion;
  const DPR = 3; // densité des captures (px image par px CSS)

  const el = (tag, cls, parent, css) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (parent) parent.appendChild(e); return e; };
  const show = (e, on) => { e.style.display = on ? '' : 'none'; };
  const smooth = (a, b, t) => { const x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  const inOut = (a, b, t) => { const x = clamp((t - a) / (b - a), 0, 1); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  // bosse courte (pression d'un clic) : 0 → 1 → 0
  const bump = (t, t0, len = 0.12) => clamp(spring(t - t0, 'snappy') - spring(t - t0 - len, 'snappy'), 0, 1);
  // pose un élément par son centre
  function place(e, x, y, s = 1, r = 0, o = 1, blur = 0) {
    e.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) translate(-50%,-50%) scale(${s.toFixed(4)}) rotate(${r.toFixed(3)}deg)`;
    e.style.opacity = clamp(o, 0, 1).toFixed(3);
    e.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '';
  }

  // morceau d'une capture réelle (rect en px CSS dans l'image), affiché à l'échelle k (px film par px CSS)
  function crop(parent, src, imgW, imgH, r, k, cls) {
    const e = el('div', 'crop' + (cls ? ' ' + cls : ''), parent);
    Object.assign(e.style, { left: '0', top: '0', width: r.w * k + 'px', height: r.h * k + 'px',
      backgroundImage: `url(${src})`, backgroundRepeat: 'no-repeat',
      backgroundSize: `${imgW / DPR * k}px ${imgH / DPR * k}px`, backgroundPosition: `${-r.x * k}px ${-r.y * k}px` });
    return e;
  }
  // capture entière
  function shot(parent, src, w, h, k, cls) { return crop(parent, src, w * DPR, h * DPR, { x: 0, y: 0, w, h }, k, cls); }

  // texte lettre à lettre. segs = [[texte, classe], ...] ; '\n' = retour à la ligne.
  function text(parent, segs, cls) {
    const box = el('div', 'txt' + (cls ? ' ' + cls : ''), parent); const chars = [];
    let line = el('div', 'ln', box);
    for (const [s, c] of segs) {
      for (const w of s.split(/(\s+|\n)/)) {
        if (w === '\n') { line = el('div', 'ln', box); continue; }
        if (!w) continue;
        const word = el('span', 'wd' + (c ? ' ' + c : ''), line);
        for (const ch of w) { const sp = el('span', 'ch', word); sp.textContent = ch === ' ' ? ' ' : ch; chars.push(sp); }
      }
    }
    box.chars = chars; return box;
  }
  // frappe : chaque lettre monte et apparaît ; sortie : les lettres montent et partent, décalées
  function typeText(box, t, tIn, tOut, rate = 0.03, rise = 26) {
    const n = box.chars.length;
    box.chars.forEach((c, i) => {
      const p = spring(t - (tIn + i * rate), 'snappy');
      const q = tOut == null ? 0 : spring(t - (tOut + i * rate * 0.35), 'snappy');
      c.style.opacity = clamp(p * 1.6 - q * 1.4, 0, 1).toFixed(3);
      c.style.transform = `translateY(${((1 - p) * rise - q * rise * 1.4).toFixed(2)}px)`;
    });
    return tIn + n * rate;
  }
  // temps de frappe de chaque lettre (pour les SFX)
  const typeTimes = (box, tIn, rate = 0.03) => box.chars.map((_, i) => tIn + i * rate);

  // surligneur : barre qui se trace sous un mot (scaleX)
  function marker(t, e, t0, t1) {
    const p = spring(t - t0, 'default'), q = t1 == null ? 0 : spring(t - t1, 'snappy');
    e.style.transform = `scaleX(${clamp(p, 0, 1.02).toFixed(4)})`; e.style.opacity = (1 - q).toFixed(3);
  }

  // curseur : flèche vectorielle, keys = [[t, x, y], ...], clics = [t, ...]
  const ARROW = '<svg viewBox="0 0 28 36" width="64" height="82"><path d="M3 2 L3 29 L10 22.5 L14.8 33 L19.4 31 L14.7 20.8 L24 20.3 Z" fill="FILL" stroke="STROKE" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  function cursor(parent, dark) {
    const e = el('div', 'cursor', parent);
    e.innerHTML = ARROW.replace('FILL', dark ? '#FFFFFF' : '#0C0F14').replace('STROKE', dark ? '#0C0F14' : '#FFFFFF');
    Object.assign(e.style, { left: '0', top: '0', width: '64px', height: '82px', transformOrigin: '6px 4px', filter: 'drop-shadow(0 6px 10px rgba(12,15,20,.25))' });
    return e;
  }
  const CUR = { f: 1.5, z: 0.92 };
  function moveCursor(e, t, keys, clicks = [], a = -1, b = 1e9) {
    const on = t >= a && t < b; show(e, on); if (!on) return;
    let x = keys[0][1], y = keys[0][2];
    for (let i = 1; i < keys.length; i++) { const s = spring(t - keys[i][0], CUR); x += (keys[i][1] - keys[i - 1][1]) * s; y += (keys[i][2] - keys[i - 1][2]) * s; }
    const press = clicks.reduce((m, c) => Math.max(m, bump(t, c - 0.04, 0.1)), 0);
    e.style.transform = `translate(${(x - 6).toFixed(2)}px,${(y - 4).toFixed(2)}px) scale(${(1 - 0.16 * press).toFixed(4)})`;
    return { x, y };
  }

  // ajuste la taille d'un bloc de texte pour qu'il tienne dans maxW (mesure réelle, polices chargées)
  function fit(box, maxW, base) { box.style.fontSize = base + 'px'; const w = box.scrollWidth; if (w > maxW) box.style.fontSize = (base * maxW / w).toFixed(1) + 'px'; }

  // bruit déterministe en graine → [0,1)
  const hash = (n) => { const s = Math.sin(n * 91.345 + 12.9898) * 43758.5453; return s - Math.floor(s); };

  root.Kit = { el, show, smooth, inOut, bump, place, crop, shot, text, typeText, typeTimes, marker, cursor, moveCursor, fit, hash, DPR };
})(window);
