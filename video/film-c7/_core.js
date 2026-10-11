
  // =====================================================================================================
  // Scènes et transitions. Chaque transition finit (ou commence) sur l'instant a de la scène :
  //   portal : la caméra fonce dans un point de la scène précédente (lettre, chiffre, lien) ; la scène suivante
  //            apparaît dans un cercle qui s'ouvre depuis ce point, déjà zoomée, puis se pose (l'élan continue) ;
  //   swipe  : glissé de carrousel, les deux écrans passent de droite à gauche avec une rotation 3D ;
  //   pull   : zoom arrière, la scène arrive de très près (× 6) sur un point et recule jusqu'au cadre ;
  //   circle / slab / cut : comme master60w.
  // Pendant chaque transition, window.shutter(t) ouvre l'obturateur : render.mjs (MB=8) moyenne 8 sous-images, un vrai
  // flou de bougé ; le flou CSS par élément est réduit (KF) pour ne pas flouter deux fois.
  // =====================================================================================================
  const WIN = [], win = (a, b) => WIN.push([a, b]);
  let REW = null;   // rembobinage (PS2) : { a, b, to, paint } — seek() repeint les scènes à l'envers entre a et b
  const inWin = (t) => WIN.some(([a, b]) => t >= a && t <= b);
  const CUES = [], cue = (t, k, g = 1) => { if (t >= 0 && t < DUR) CUES.push({ t: +t.toFixed(3), k, g }); };
  const SC = [], SCN = new Map();   // SCN : élément de scène → scène
  const DT = { portal: 0.5, swipe: 0.55, pull: 0.5, slab: 0.42, circle: 0.45, cut: 0 };
  function scene(a, b, bg, tin = { type: 'cut' }, push = 0.03) {
    const el = mk('div', 'scene', ST, { background: bg }), cam = mk('div', 'cam', el, { transformOrigin: `${W / 2}px ${H / 2}px` });
    const d = tin.d ?? DT[tin.type] ?? 0, prev = SC[SC.length - 1];
    const s = { a, b, el, cam, tin, push, d, pre: 0, imp: [], paint: () => {} }; SC.push(s); SCN.set(el, s);
    if (tin.type === 'portal') { s.pre = d; if (prev) prev.out = { type: 'portal', t0: a - d, t1: a, x: tin.x, y: tin.y }; win(a - d, a + 0.3); cue(a - d + 0.05, 'whoosh', 0.9); }
    else if (tin.type === 'swipe') { s.pre = d; if (prev) prev.out = { type: 'swipe', t0: a - d, t1: a }; win(a - d, a + 0.05); cue(a - d + 0.04, 'whoosh', 0.7); }
    else if (tin.type === 'pull') { win(a, a + 0.4); cue(a, 'whoosh', 0.6); }
    else if (tin.type === 'slab' || tin.type === 'circle') { win(a, a + 0.32); cue(a, 'whoosh', 0.8); }
    return s;
  }
  function paintScene(s, t) {
    const vis = t >= s.a - s.pre - 0.001 && t < s.b + (s.keep ?? 0.6);
    s.el.style.display = vis ? '' : 'none'; if (!vis) return;
    let tr = '', org = `${W / 2}px ${H / 2}px`, clip = '';
    const ty = s.tin.type, d = s.d;
    if (ty === 'portal') {
      const p = clamp((t - (s.a - d)) / d, 0, 1);
      if (p < 1) clip = `circle(${(2400 * Math.pow(p, 2.6) + 1).toFixed(0)}px at ${s.tin.x}px ${s.tin.y}px)`;
      const L = E(t, s.a - d, d + 0.55, eOut);                                          // atterrissage : × 1,7 → 1
      tr = `scale(${(1 + 0.7 * (1 - L)).toFixed(4)})`; org = `${s.tin.x}px ${s.tin.y}px`;
    } else if (ty === 'swipe') {
      const p = eIO(clamp((t - (s.a - d)) / d, 0, 1));
      if (p < 1) tr = `perspective(2000px) translateX(${(W * 1.04 * (1 - p)).toFixed(1)}px) rotateY(${(-24 * (1 - p)).toFixed(2)}deg)`;
    } else if (ty === 'pull') {
      const p = E(t, s.a, d, eOut); tr = `scale(${(1 + 5 * (1 - p)).toFixed(4)})`; org = `${s.tin.x}px ${s.tin.y}px`;
    } else if (ty === 'circle') {
      const p = eIO(clamp((t - s.a) / d, 0, 1)); if (p < 1) clip = `circle(${(p * 2300).toFixed(0)}px at ${s.tin.x ?? W / 2}px ${s.tin.y ?? H / 2}px)`;
    } else if (ty === 'slab') {
      const p = eIO(clamp((t - s.a) / d, 0, 1));
      if (p < 1) { const X = lerp(W + 580, -600 - (H - 1080) * 0.43, p), dx = Math.round(H * 0.426); clip = `polygon(${X}px 0,${W + 680}px 0,${W + 680}px ${H}px,${X - dx}px ${H}px)`; }
    }
    if (s.out && t > s.out.t0) {                                                         // sortie de la scène
      const p = clamp((t - s.out.t0) / (s.out.t1 - s.out.t0), 0, 1);
      if (s.out.type === 'portal') { tr = `scale(${Math.pow(16, Math.pow(p, 2.2)).toFixed(4)})`; org = `${s.out.x}px ${s.out.y}px`; }
      else if (s.out.type === 'swipe') { const q = eIO(p); tr = `perspective(2000px) translateX(${(-W * 1.04 * q).toFixed(1)}px) rotateY(${(24 * q).toFixed(2)}deg)`; }
    }
    s.el.style.transformOrigin = org; s.el.style.transform = tr; s.el.style.clipPath = clip;
    let sx = 0, sy = 0;
    for (const [ti, amp] of s.imp) if (t >= ti) { const e = Math.exp(-(t - ti) * 10) * amp; sx += noise(31 + ti * 7, t * 28) * e; sy += noise(57 + ti * 7, t * 28) * e; }
    // caméra qui ne s'arrête jamais : poussée (≤ 3 % : au-delà, les titres du haut entrent dans les 220 px réservés),
    // dérive latérale lente, légère rotation et contenu qui descend de 34 px (vers le bas : le haut garde ses 220 px) (fluidite.md)
    const q = clamp((t - s.a) / (s.b - s.a + 0.6), 0, 1), push = 1 + Math.min(s.push, 0.03) * eIO(q);
    sx += 9 * Math.sin((t - s.a) * 0.55 + s.a); sy += 34 * eIO(q); const rz = 0.35 * Math.sin((t - s.a) * 0.42 + s.a * 1.7);
    s.cam.style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) rotate(${rz.toFixed(3)}deg) scale(${(push * (1 + 0.0045 * pulse(t))).toFixed(4)})`;
    s.paint(t);
  }
  // point d'une lettre (mot wi, lettre ci, fraction fx, fy de sa boîte) : cible d'un portail
  const at = (k, wi, ci, fx = 0.5, fy = 0.55) => { const r = k.words[wi].chars[ci].getBoundingClientRect(); return { x: Math.round(r.left + r.width * fx), y: Math.round(r.top + r.height * fy) }; };
  const atEl = (e, fx = 0.5, fy = 0.5) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width * fx), y: Math.round(r.top + r.height * fy) }; };
  // point d'une carte posée par pose() au centre (cx, cy) : sa boîte n'est pas encore à sa place quand on construit
  const atPose = (e, cx, cy, fx, fy) => ({ x: Math.round(cx - e.offsetWidth / 2 + e.offsetWidth * fx), y: Math.round(cy - e.offsetHeight / 2 + e.offsetHeight * fy) });
  // glissé de carrousel : ce qui entre dans les 0,7 premières secondes est déjà en place quand la slide arrive
  const early = (s, t0) => (s && s.tin.type === 'swipe' && t0 < s.a + 0.7 ? s.a - s.d + 0.02 : s && s.tin.type === 'portal' && t0 < s.a + 0.45 ? s.a - s.d * 0.6 : t0);   // portail : le titre est déjà là quand le cercle s'ouvre
  const earlyEl = (el, t0) => early(SCN.get(el.closest('.scene')), t0);

  // ---------- composants (ceux des carrousels de la semaine, animés) ----------
  const T = (k, after = 0) => Wt(k, after);
  const fmt = (v) => Math.abs(Math.round(v)).toLocaleString('fr-FR').replace(/[  ]/g, ' ');
  const L1 = (parent, x, y, size, txt, c = 'var(--ink)', it = false) => KT(parent, x, y, size, [[txt, { c, i: it ? 1 : 0 }]]);
  // carte qui monte du bas et se pose, inclinée
  const rise = (el, t, t0, x, y, r = -1.5, rx = 4) => { t0 = earlyEl(el, t0); return pose(el, t, (tt) => { if (tt < t0 - 0.05) return null; const p = E(tt, t0, 0.55); const f = Math.max(0, tt - t0 - 0.55); return { x, y: y + 260 * (1 - p) + 7 * Math.sin(f * 1.7), c: 1, p: 1, rx: rx + 16 * (1 - p) + 1.2 * Math.sin(f * 1.3), r: r + 0.45 * Math.sin(f * 1.1), o: Math.min(1, p * 3) }; }); };   // posée, la carte flotte
  // ticket : lignes qui entrent une à une, total qui compte jusqu'à sa valeur
  function ticket(parent, w, rows, tot) {
    const box = mk('div', 'tkt a', parent, { width: w + 'px' });
    const R = rows.map(([l, v, t]) => ({ el: mk('div', 'tr', box, null, `<span>${l}</span><b>${v}</b>`), t }));
    const TT = tot ? mk('div', 'tt ' + (tot.tone || ''), box, null, `<span>${tot.lab}</span><b>&nbsp;</b>`) : null;
    if (tot) cue(tot.t, 'roll', 0.8);
    R.forEach((r) => cue(r.t, 'pop', 0.55));
    box.paint = (t) => {
      R.forEach((r) => { const p = E(t, r.t, 0.32); r.el.style.opacity = (0.16 + 0.84 * p).toFixed(3); r.el.style.transform = `translateX(${(26 * (1 - p)).toFixed(1)}px)`; });   // lignes en gris dès l'arrivée du ticket, allumées quand la voix les dit
      if (TT) { const p = E(t, tot.t, 0.6); TT.style.opacity = t >= tot.t - 0.03 ? 1 : 0; TT.querySelector('b').textContent = (tot.sign || '') + fmt(tot.v * p) + ' €'; TT.style.transform = `scale(${(1 + 0.07 * bump(t, tot.t + 0.55, 0.18)).toFixed(3)})`; }
    };
    return box;
  }
  // bulle de messagerie : th = l'autre (blanche, à gauche), me = toi (orange, à droite)
  function bubble(parent, y, txt, me, t0, small) {
    const e = mk('div', 'bub2 a ' + (me ? 'me' : 'th'), parent, null, txt + (small ? `<small>${small}</small>` : ''));
    const x = me ? 940 - e.offsetWidth : 140; cue(t0, me ? 'sent' : 'pop', 0.6);
    return (t) => pose(e, t, (tt) => { if (tt < t0 - 0.02) return null; const p = E(tt, t0, 0.38); return { x, y: y + 50 * (1 - p), s: 0.86 + 0.14 * p, o: p * 2.5, r: (me ? 3 : -3) * (1 - p) }; });
  }
  // voiture détourée (vraie photo), avec son ombre
  function car(parent, src, w) { const hd = mk('div', 'a', parent, { width: w + 'px' }); const i = mk('img', '', hd, { width: w + 'px', display: 'block', filter: 'drop-shadow(0 46px 34px rgba(28,22,18,.38))' }); i.src = src; return hd; }
  // annonce (photo, titre, prix surligné)
  const listing = (parent, w, img, m, s, p, pos = '50% 50%') => mk('div', 'lst a', parent, { width: w + 'px' },
    `<div style="height:${Math.round(w * 0.62)}px;background:url(${img}) ${pos}/cover"></div><div class="b"><div class="m" style="font-size:${Math.round(w * 0.066)}px">${m}</div><div class="s" style="font-size:${Math.round(w * 0.046)}px">${s}</div><div class="p" style="font-size:${Math.round(w * 0.15)}px">${p}<i></i></div></div>`);
  // étiquette de prix
  const tag = (parent, p, l, size = 72) => mk('div', 'tag a', parent, { fontSize: size + 'px' }, `${p}${l ? `<small style="font-size:${Math.round(size * 0.38)}px">${l}</small>` : ''}`);
  const drop = (el, t, t0, x, y, r = 0) => pose(el, t, (tt) => { if (tt < t0 - 0.3) return null; const p = E(tt, t0 - 0.25, 0.34); return { x, y: lerp(-320, y, p), c: 1, r: r - 20 * (1 - p) }; });
  // tampon qui claque
  const stamp = (parent, txt, color = 'var(--r)', size = 120) => mk('div', 'stamp2 a', parent, { color, borderColor: color, fontSize: size + 'px' }, txt);
  const slamAt = (el, t, t0, x, y, r = -8) => pose(el, t, (tt) => { if (tt < t0 - 0.01) return null; const p = E(tt, t0, 0.22); return { x, y, c: 1, r, s: 1 + 1.3 * (1 - p), o: Math.min(1, (tt - t0) / 0.05) }; });
  // ligne de texte simple (Satoshi), entrée par la gauche
  const line = (parent, x, y, html, size = 40, color = 'var(--ink)') => mk('div', 'a', parent, { font: `700 ${size}px Satoshi`, color, whiteSpace: 'nowrap', left: x + 'px', top: y + 'px' }, html);
  const slideIn = (el, t, t0) => { const p = E(t, t0, 0.35); el.style.opacity = t < t0 - 0.02 ? 0 : p.toFixed(3); el.style.transform = `translateX(${(-60 * (1 - p)).toFixed(1)}px)`; };
  // carton de fin : texte, logo animé, bouton qui bat au tempo
  function endCard(a, bg, lines, pill, tHit, tin = { type: 'circle' }) {
    const s = scene(a, DUR + 1, bg, tin, 0.02);
    const ks = lines.map(([txt, y, size, c, it]) => L1(s.cam, 140, y, size, txt, c, it));
    const L = logo(s.cam, 540, 1190, 560);
    const pl = pill ? mk('div', 'pill a', s.cam, { background: '#fff', color: 'var(--ink)', fontSize: '40px', padding: '24px 42px' }, pill) : null;
    const tL = tHit, tP = tHit + 0.55;
    cue(tL, 'pop', 0.8); if (pl) cue(tP, 'pop', 0.6);
    s.paint = (t) => {
      ks.forEach((k, i) => ktP(k, t, lines[i][5] ?? a + i * 0.12, 'rise'));
      L(t, tL);
      if (pl) pose(pl, t, (tt) => { if (tt < tP - 0.05) return null; const p = E(tt, tP, 0.45); return { x: 540, y: 1360 + 70 * (1 - p), c: 1, o: p * 2, s: 1 + 0.025 * pulse(tt) }; });
    };
    return s;
  }
  // écran « prix » : petit texte au-dessus, prix qui roule, ligne entre crochets
  function priceBlock(s, y, small, tP, from, to, label, color = 'var(--o)', smallColor = 'rgba(251,249,245,.7)', labColor = '#fbf9f5') {
    const k0 = small ? L1(s.cam, 140, y, 96, small, smallColor) : null;
    const R = ROLL(s.cam, 130, y + 120, 280, from, to, color);
    const k1 = label ? brk(s.cam, 144, y + 450, label, labColor, 38) : null;
    cue(tP + 0.12, 'roll', 0.9);
    return (t) => {
      if (k0) ktP(k0, t, s.a - s.pre - 0.02, 'rise');   // visible dans le cercle du portail qui s'ouvre
      R.box.style.visibility = t >= tP - 0.12 ? '' : 'hidden'; rollP(R, t, tP - 0.1, 0.55, 0.06);
      pose(R.box, t, (tt) => ({ x: 0, y: 0, s: 1 + 0.06 * bump(tt, tP + 0.3, 0.2) }));
      if (k1) ktP(k1, t, tP + 0.25, 'rise', null, 'up', { step: 0.05 });
    };
  }
  const B = (txt, hot = [], hc = 'var(--o)') => [['[', {}], ...txt.split(' ').map((w) => [w, hot.includes(w) ? { c: hc } : {}]), [']', {}]];   // hc : blanc sur fond orange
