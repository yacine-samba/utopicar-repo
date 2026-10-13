// Motions de 15 à 20 s dans la grammaire du film « wow » (master60w), un seul film pour 8 vidéos (?hook=<id>) :
// dico2 (Le dictionnaire du vendeur, version courte) et A01 à A07 (les carrousels de la semaine A, en motion).
// Moteur repris de film-master60w (texte cinétique, rouleaux, curseur, logo animé, flou directionnel) ; transitions
// nouvelles : portail par une lettre ou un chiffre, glissé de carrousel, zoom arrière, avec un vrai flou de bougé au rendu.
// Contrat : window.seek(t) peint la frame t, sans état entre les frames.
(async function () {
  const { spring, clamp, lerp, noise } = Motion;
  const V = true;   // film vertical seulement (TikTok, Reels, Shorts)
  const W = V ? 1080 : 1920, H = V ? 1920 : 1080, h = (a, b) => (V ? b : a);     // h(valeur 16:9, valeur 9:16)
  if (V) for (const e of [document.documentElement, document.body]) Object.assign(e.style, { width: W + 'px', height: H + 'px' });
  const ST = document.getElementById('stage'), FX = document.getElementById('fx'), NS = 'http://www.w3.org/2000/svg';
  const J = async (u) => (await fetch(u)).json();
  const ID = new URLSearchParams(location.search).get('hook') || 'dico2';
  const WD = await J('../audio/vo-c7/' + ID + '.words.json');   // voix posée de Simon (scripts/vo-c7-pose.py)
  const MU = (await J('../audio/c7-musique.json'))[ID];          // repères musicaux, communs avec scripts/audio-c7.py
  const LOGO = await (await fetch('../assets/brand/official/utopicar-logo-horizontal-fond-sombre.svg')).text();
  await Promise.all(['700 200px Clash', '600 60px Clash', '700 40px Satoshi', '500 30px Satoshi', 'italic 200px Instrument'].map((f) => document.fonts.load(f)));
  const UI = '../film-master60/ui-blanc/', PH = '../assets/master60/photos/';
  const DUR = MU.dur;

  // ---------- temps : mots de la voix, grille ----------
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const fixW = (ws) => { let prev = -9; return ws.map((w) => { let s = w.s; if (s <= prev + 0.04) s = prev + 0.11; prev = s; return { ...w, s, n: norm(w.w) }; }); };
  const BODY = fixW(WD);
  const Wt = (key, after = 0, list = BODY) => { const k = norm(key), w = list.find((w) => w.s >= after - 0.01 && w.n.startsWith(k)); if (!w) console.error('mot absent', key, after); return w ? w.s : after; };
  // musique de master60 (scripts/audio-c7.py) : mesure 4 sur l'image 0, arrêt de bande (stop), drop (pivot), coup final (hit)
  const BEAT = 60 / 112;
  const pulse = (t) => { let x; if (t >= 0 && t < MU.stop) x = t / BEAT; else if (t >= MU.pivot && (MU.hit == null || t < MU.hit)) x = (t - MU.pivot) / BEAT; else if (MU.hit != null && t >= MU.hit) x = (t - MU.hit) / BEAT; else return 0; const n = Math.floor(x); return Math.exp(-((x - n) * BEAT) / 0.11) * (n % 4 === 0 ? 1 : 0.55); };
  // interpolation exponentielle
  const eOut = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
  const eIn = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : Math.pow(2, 10 * p - 10));
  const eIO = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2);
  const E = (t, t0, d, f = eOut) => f(clamp((t - t0) / d, 0, 1));
  const bump = (t, t0, d = 0.14) => clamp(spring(t - t0, 'snappy') - spring(t - t0 - d, 'snappy'), 0, 1);

  // ---------- éléments ----------
  const mk = (tag, cls, parent, css, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  // flou de bougé directionnel : un filtre SVG par élément, écart-type (x, y) = vitesse × obturateur
  let FID = 0; const K = 0.0065; let KF = 1;   // KF : flou CSS réduit pendant les transitions (vrai flou de bougé au rendu)
  function mb(el, bx, by, b0 = 0) {
    bx = Math.min(40, (bx + b0) * KF); by = Math.min(40, (by + b0) * KF);
    if (bx < 0.3 && by < 0.3) { if (el._mb) el.style.filter = ''; return; }
    if (!el._mb) {
      const f = document.createElementNS(NS, 'filter'); f.id = 'mb' + FID++;
      for (const [a, v] of [['x', '-60%'], ['y', '-60%'], ['width', '220%'], ['height', '220%']]) f.setAttribute(a, v);
      const g = document.createElementNS(NS, 'feGaussianBlur'); f.appendChild(g); FX.appendChild(f); el._mb = { f, g };
    }
    el._mb.g.setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`); el.style.filter = `url(#${el._mb.f.id})`;
  }
  // pose d'un élément : P(t) → {x, y, s, r, o, rx, ry, b, c (centré), p (3D)} ; le flou suit la vitesse
  function pose(el, t, P) {
    if (el._d === undefined) el._d = el.style.display === 'none' ? '' : el.style.display;   // garde un display:flex posé à la création
    const a = P(t); if (!a) { el.style.display = 'none'; return null; }
    el.style.display = el._d;
    const z = P(t - 1 / 120) || a, s = a.s ?? 1;
    el.style.transform = `translate(${a.x.toFixed(1)}px,${a.y.toFixed(1)}px)${a.c ? ' translate(-50%,-50%)' : ''}${a.p ? ` perspective(1700px) rotateX(${(a.rx || 0).toFixed(2)}deg) rotateY(${(a.ry || 0).toFixed(2)}deg)` : ''} rotate(${(a.r || 0).toFixed(2)}deg) scale(${s.toFixed(4)})`;
    el.style.opacity = clamp(a.o ?? 1, 0, 1).toFixed(3);
    mb(el, Math.abs(a.x - z.x) * 120 * K, Math.abs(a.y - z.y) * 120 * K, (a.b || 0) + Math.abs(s - (z.s ?? 1)) * 120 * 0.9);
    return a;
  }

  // ---------- texte cinétique ----------
  // KT(parent, x, y, taille, segments) ; segments = [['texte', {i: italique, c: couleur, f: police}], …]
  // colonne de gauche décalée de MX : la poussée de caméra (zoom depuis le centre) ramènerait sinon les grands titres posés
  // à x = 96 jusqu'à x ≈ 70, dans la marge desktop de 96 px (contrôle qa_video.py)
  // en 9:16 les positions sont données telles quelles (colonne 140 → 940) et un titre trop large est réduit jusqu'à x = 910 :
  // la poussée de caméra (3 %) le ramène alors au plus à x ≈ 921, hors de la colonne des boutons TikTok (140 px à droite)
  const MX = 32, CX = (x) => (V ? x : x < 200 ? x + MX : x);
  function KT(parent, x, y, size, segs, css = {}, fitW = V ? 910 - x : 0) {
    if (typeof segs === 'string') segs = [[segs, {}]];
    const box = mk('div', 'kt', parent, { left: CX(x) + 'px', top: y + 'px', fontSize: size + 'px', ...css });
    const ln = mk('div', 'ln', box), words = [];
    for (const [txt, sty = {}] of segs) for (const wd of txt.split(' ')) {
      if (!wd) continue;
      const w = mk('span', 'w' + (sty.i ? ' i' : ''), ln, { ...(sty.c ? { color: sty.c } : {}), ...(sty.s ? { fontSize: sty.s } : {}) });
      words.push({ w, chars: [...wd].map((ch) => mk('span', 'c', w, null, ch.replace(/&/g, '&amp;').replace(/</g, '&lt;'))) });
    }
    const k = { box, words, size };
    if (fitW && box.offsetWidth > fitW) { k.size = Math.floor(size * fitW / box.offsetWidth); box.style.fontSize = k.size + 'px'; }
    return k;
  }
  const brk = (parent, x, y, segs, color = 'var(--ink)', size = 40) => KT(parent, x, y, size, segs, { font: `500 ${size}px Satoshi`, letterSpacing: '0', color });
  // état d'une lettre : montée hors du masque, chute, frappe, claque, flou ; sortie vers le haut, chute ou flou
  function cst(mode, S, ti, j, t, to, outMode) {
    let y = 0, r = 0, s = 1, o = 1;
    const tj = ti + j * (mode === 'type' ? 0.03 : 0.017);
    if (mode === 'rise') { const p = E(t, tj, 0.42); y = (1 - p) * S * 1.05; r = (1 - p) * 7; }
    else if (mode === 'drop') { const p = E(t, tj, 0.36); y = -(1 - p) * S * 1.25; r = -(1 - p) * 9; o = clamp(p * 4, 0, 1); }
    else if (mode === 'type') { o = t >= tj ? 1 : 0; s = t >= tj ? 1 + 0.3 * (1 - E(t, tj, 0.12)) : 1; }
    else if (mode === 'slam') { const p = E(t, ti, 0.22); s = 1 + 1.2 * (1 - p); o = clamp((t - ti) / 0.04, 0, 1); }
    else if (mode === 'blur') { const p = E(t, tj, 0.5); o = p; s = 1.14 - 0.14 * p; }
    if (to != null) {
      const q = E(t, to + j * 0.011, 0.3, eIn);
      if (outMode === 'up') y -= q * S * 1.15; else if (outMode === 'fall') { y += q * 1000; r += q * (((j * 37) % 21) - 10); } else o *= 1 - q;
    }
    return { y, r, s, o };
  }
  // peint un texte : ins = instant d'entrée de chaque mot (ou un seul instant + pas), accents = mots qui « sonnent » quand Simon les dit
  function ktP(k, t, ins, mode = 'rise', out = null, outMode = 'up', o2 = {}) {
    const S = k.size;
    k.words.forEach((W, i) => {
      const ti = Array.isArray(ins) ? ins[Math.min(i, ins.length - 1)] : ins + i * (o2.step ?? 0.08);
      const to = out == null ? null : Array.isArray(out) ? out[i] : out + i * 0.035;
      const masked = mode === 'rise' || (to != null && outMode === 'up');
      W.w.classList.toggle('m', masked);
      if (t < ti - 0.001 || (to != null && t > to + 0.6)) { W.w.style.visibility = 'hidden'; mb(W.w, 0, 0); return; }
      W.w.style.visibility = '';
      const acc = o2.acc ? bump(t, o2.acc[Math.min(i, o2.acc.length - 1)] - 0.03, 0.16) : 0;
      W.chars.forEach((c, j) => {
        const a = cst(mode, S, ti, j, t, to, outMode), extra = o2.fx ? o2.fx(i, j, t) : null;
        const y = a.y + (extra?.y || 0), r = a.r + (extra?.r || 0), s = a.s * (1 + 0.07 * acc);
        c.style.transform = `translateY(${y.toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(3)})`;
        c.style.opacity = a.o.toFixed(3);
      });
      const m = Math.floor(W.chars.length / 2), a1 = cst(mode, S, ti, m, t, to, outMode), a0 = cst(mode, S, ti, m, t - 1 / 120, to, outMode);
      mb(W.w, 0, Math.abs(a1.y - a0.y) * 120 * K, Math.abs(a1.s - a0.s) * 120 * 0.7);
    });
  }
  // compteur à rouleaux : chaque chiffre tourne (expo), les colonnes partent l'une après l'autre
  function ROLL(parent, x, y, size, from, to, color) {
    const box = mk('div', 'roll', parent, { left: CX(x) + 'px', top: y + 'px', fontSize: size + 'px', color }), cols = [];
    [...to].forEach((ch, k) => {
      if (/\d/.test(ch)) {
        const col = mk('span', 'col', box), strip = mk('span', 'strip', col);
        for (let r = 0; r < 30; r++) mk('span', '', strip, null, String(r % 10));
        cols.push({ col, strip, fd: /\d/.test(from[k] || '') ? +from[k] : 0, td: +ch });
      } else mk('span', '', box, { whiteSpace: 'pre' }, ch === ' ' ? '&nbsp;' : ch);
    });
    const R = { box, cols, size };
    if (V && box.offsetWidth > 910 - x) { R.size = Math.floor(size * (910 - x) / box.offsetWidth); box.style.fontSize = R.size + 'px'; }
    return R;
  }
  function rollP(R, t, t0, d = 0.75, stag = 0.07) {
    R.cols.forEach((c, k) => {
      const v = (tt) => c.fd + ((((c.td - c.fd) % 10) + 10) % 10 + 10) * E(tt, t0 + k * stag, d);
      const a = v(t), b = v(t - 1 / 120);
      c.strip.style.transform = `translateY(${(-a * R.size).toFixed(1)}px)`;
      mb(c.col, 0, Math.abs(a - b) * 120 * R.size * K);
    });
  }

  // ---------- interface ----------
  const crop = (parent, src, r, w, css = {}) => {
    const k = w / r.w, box = mk('div', 'card a', parent, { width: w + 'px', height: r.h * k + 'px', ...css });
    const i = mk('img', '', box, { position: 'absolute', width: r.W * k + 'px', left: -r.x * k + 'px', top: -r.y * k + 'px' }); i.src = UI + src + '.png';
    box.k = k; box.img = i; return box;
  };
  const lst = (parent, w = 560) => mk('div', 'lst a', parent, { width: w + 'px' },
    `<img src="${PH}208-annonce.jpg"><div class="b"><div class="m">Peugeot 208 1.2 PureTech 110</div><div class="s">2016 · 116 789 km · Essence</div><div class="p">7 190 €<i></i></div></div>`);
  const CUR = '<svg class="cur" viewBox="0 0 28 36"><path d="M3 2 L3 29 L10 22.5 L14.8 33 L19.4 31 L14.7 20.8 L24 20.3 Z" fill="FILL" stroke="STROKE" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  // curseur : arrivées [t, x, y] en expo, clics → appui + onde
  function cursor(parent, keys, clics = [], dark = false) {
    const e = mk('div', 'a', parent, { zIndex: 50 }, CUR.replace('FILL', dark ? '#fff' : '#0C0F14').replace('STROKE', dark ? '#0C0F14' : '#fff'));
    const rips = clics.map(() => mk('div', 'a rip', parent, { width: '170px', height: '170px', zIndex: 49 }));
    const P = (t) => { let x = keys[0][1], y = keys[0][2]; for (let i = 1; i < keys.length; i++) { const p = eIO(clamp((t - (keys[i][0] - 0.5)) / 0.5, 0, 1)); x += (keys[i][1] - keys[i - 1][1]) * p; y += (keys[i][2] - keys[i - 1][2]) * p; } return { x, y }; };
    return (t) => {
      const pr = clics.reduce((m, c) => Math.max(m, bump(t, c - 0.05, 0.11)), 0);
      pose(e, t, (tt) => { const p = P(tt); return { x: p.x - 6, y: p.y - 4, s: 1 - 0.16 * pr }; });
      clics.forEach((c, i) => { const a = t - c; if (a < 0 || a > 0.6) { rips[i].style.display = 'none'; return; } const p = P(c), q = eOut(a / 0.55); pose(rips[i], t, () => ({ x: p.x, y: p.y, c: 1, s: 0.2 + 1.5 * q, o: 1 - q })); });
      return P(t);
    };
  }
  const men = (s, txt, color = 'var(--ink)') => mk('div', 'men a', s.el, { left: h(96, 140) + 'px', top: h(940, 1440) + 'px', color }, txt);

  // ---------- logo animé (vrai fichier SVG, découpé en pièces) ----------
  function logo(parent, cx, cy, w) {
    const holder = mk('div', 'a', parent, { width: w + 'px' }); holder.innerHTML = LOGO;
    const svg = holder.querySelector('svg'); svg.style.width = w + 'px'; svg.style.height = 'auto'; svg.style.overflow = 'visible'; svg.style.display = 'block';
    const g = (el) => { const wr = document.createElementNS(NS, 'g'); el.parentNode.insertBefore(wr, el); wr.appendChild(el); wr.style.transformBox = 'fill-box'; wr.style.transformOrigin = 'center'; return wr; };
    const icon = svg.querySelector('g'), rect = icon.querySelector('rect'), car = icon.querySelector('g');
    const [body, slash, flick] = car.querySelectorAll('path');
    const W_rect = g(rect), W_body = g(body), W_slash = g(slash), W_flick = g(flick);
    // la voiture reste dans son carré
    const cp = document.createElementNS(NS, 'clipPath'); cp.id = 'lc' + FID++; cp.innerHTML = '<rect width="512" height="512" rx="52"/>'; FX.appendChild(cp);
    const carWrap = g(car); carWrap.setAttribute('clip-path', `url(#${cp.id})`); carWrap.style.transformBox = ''; carWrap.style.transformOrigin = '';
    // mot-symbole : un tracé par lettre (sous-chemins regroupés par recouvrement horizontal)
    const wordG = svg.querySelectorAll(':scope > g')[1], wp = wordG.querySelector('path'), fill = wp.getAttribute('fill');
    const subs = wp.getAttribute('d').split(/(?=M)/).filter(Boolean); wp.remove();
    const tmp = subs.map((d) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', fill); wordG.appendChild(p); const b = p.getBBox(); return { p, x0: b.x, x1: b.x + b.width }; });
    tmp.sort((a, b) => a.x0 - b.x0); const letters = [];
    for (const s of tmp) { const L = letters[letters.length - 1]; if (L && s.x0 < L.x1 - 5) { L.ps.push(s.p); L.x1 = Math.max(L.x1, s.x1); } else letters.push({ ps: [s.p], x0: s.x0, x1: s.x1 }); }
    const cp2 = document.createElementNS(NS, 'clipPath'); cp2.id = 'lw' + FID++; cp2.innerHTML = '<rect x="-100" y="-1000" width="5000" height="1400"/>'; FX.appendChild(cp2);
    wordG.setAttribute('clip-path', `url(#${cp2.id})`);
    for (const L of letters) {      // une seule forme par lettre : les creux du o, du p et du a restent vides
      const lg = document.createElementNS(NS, 'g'), one = document.createElementNS(NS, 'path');
      one.setAttribute('d', L.ps.map((p) => p.getAttribute('d')).join(' ')); one.setAttribute('fill', fill);
      L.ps.forEach((p) => p.remove()); lg.appendChild(one); wordG.appendChild(lg); L.g = lg;
    }
    holder.style.display = 'none';
    return (t, t0) => {
      if (t < t0 - 0.01) { holder.style.display = 'none'; return; }
      pose(holder, t, () => ({ x: cx, y: cy, c: 1, s: 1 + 0.03 * (1 - E(t, t0 + 0.6, 0.8)) }));
      const ps = E(t, t0, 0.45), pb = E(t, t0 + 0.18, 0.5), pz = E(t, t0 + 0.42, 0.32), pf = E(t, t0 + 0.6, 0.3);
      W_rect.style.transform = `rotate(${(-28 * (1 - ps)).toFixed(2)}deg) scale(${ps.toFixed(4)})`;
      W_body.style.transform = `translateX(${(-1500 * (1 - pb)).toFixed(1)}px)`;
      mb(W_body, Math.abs(1500 * (E(t, t0 + 0.18, 0.5) - E(t - 1 / 120, t0 + 0.18, 0.5))) * 120 * K * 0.1, 0);
      W_slash.style.transform = `translateX(${(900 * (1 - pz)).toFixed(1)}px)`; W_slash.style.opacity = pz > 0 ? 1 : 0;
      mb(W_slash, Math.abs(900 * (pz - E(t - 1 / 120, t0 + 0.42, 0.32))) * 120 * K * 0.1, 0);
      W_flick.style.transform = `scale(${pf.toFixed(3)})`;
      letters.forEach((L, i) => { const p = E(t, t0 + 0.3 + i * 0.045, 0.45); L.g.style.transform = `translateY(${((1 - p) * 1100).toFixed(1)}px)`; });
    };
  }


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

  // ---------- outils d'écriture des scénarios : chaque scène tient une liste de peintres ----------
  const S = (a, b, bg, tin, push) => { const s = scene(a, b, bg, tin, push); s.P = []; s.paint = (t) => s.P.forEach((f) => f(t)); return s; };
  const KA = (s, x, y, size, txt, c, it, ins, mode = 'rise', o2) => { const k = L1(s.cam, x, y, size, txt, c, it); ins = Array.isArray(ins) ? ins.map((v) => early(s, v)) : early(s, ins); s.P.push((t) => ktP(k, t, ins, mode, null, 'up', o2)); return k; };
  const BA = (s, x, y, txt, hot, ins, color = 'var(--ink)', size = 40, hc) => { const k = brk(s.cam, x, y, B(txt, hot, hc), color, size); ins = early(s, ins); s.P.push((t) => ktP(k, t, ins, 'rise', null, 'up', { step: 0.05 })); return k; };
  const cred = (s, txt, color = 'var(--ink)') => mk('div', 'men a', s.el, { left: '140px', top: '1418px', width: '780px', whiteSpace: 'normal', lineHeight: '1.3', color, fontSize: '19px' }, txt);   // tient dans la colonne sûre, sur deux lignes si besoin
  const hero = (s, img, w, hgt, x, y, t0, pos = '50% 45%') => { t0 = early(s, t0); const e = mk('div', 'card a', s.cam, { width: w + 'px', height: hgt + 'px', background: `url(${img}) ${pos}/cover` }); s.P.push((t) => pose(e, t, (tt) => { const p = E(tt, t0, 0.7); return { x: lerp(1600, x, p), y, c: 1, p: 1, rx: 6, ry: -14 - 30 * (1 - p), r: -2 }; })); return e; };
  const carIn = (s, src, w, x, y, t0, from = 1700) => { t0 = early(s, t0); const e = car(s.cam, src, w); s.P.push((t) => pose(e, t, (tt) => { const p = E(tt, t0, 0.65), f = Math.max(0, tt - t0 - 0.65); return { x: lerp(from, x, p) + 6 * Math.sin(f * 0.9), y: y + 5 * Math.sin(f * 1.4), c: 1, r: 0.35 * Math.sin(f * 1.1) }; })); return e; };   // la voiture flotte une fois arrivée
  const DEMO = '../assets/demo/', CAR = '../carousels-semaine/img/';
  const CREDIT = {
    clio: 'Photo Wikimedia Commons : OSX, domaine public', bmw: 'Photo Wikimedia Commons : Tokumeigakarinoaoshima, CC0',
    golf: 'Photo Wikimedia Commons : Thomas doerfer, CC BY 3.0, détourée', fiesta: 'Photo Wikimedia Commons : M 93, CC BY-SA 3.0 DE, détourée',
    p208: 'Photo Wikimedia Commons : OSX, domaine public',
  };
  // slide « moteur à fuir » (A01) : un écran par moteur, passés comme un carrousel
  function engineSlide(a, b, tin, n, kicker, brand, model, img, imgKey, pills, tCar) {
    const s = S(a, b, 'var(--w)', tin, 0.025);
    BA(s, 144, 250, kicker, [], a + 0.05, 'var(--ink)', 34);
    const k1 = KA(s, 140, 320, 170, brand, 'var(--ink)', false, a + 0.08);
    KA(s, 140, 490, 190, model, 'var(--o)', true, a + 0.2);
    const N = mk('div', 'a', s.cam, { font: '700 300px/1 Clash', color: 'rgba(28,22,18,.06)', left: '600px', top: '230px', letterSpacing: '-.05em' }, 'N°' + n);
    carIn(s, CAR + img, 760, 540, 1010, tCar ?? a + 0.1);
    const ps = pills.map(([txt, tone], i) => mk('div', 'pill a', s.cam, { background: tone === 'bad' ? 'var(--r)' : '#b26a00', color: '#fff', fontSize: '42px' }, txt));
    ps.forEach((e, i) => s.P.push((t) => pose(e, t, (tt) => { const t0 = (tCar ?? a) + 0.35 + i * 0.25; if (tt < t0 - 0.02) return null; const p = E(tt, t0, 0.3); return { x: 540, y: 1270 + i * 100, c: 1, s: 1 + 0.5 * (1 - p), o: p * 3, r: -2 + i * 3 }; })));
    pills.forEach((_, i) => cue((tCar ?? a) + 0.35 + i * 0.25, 'thud', 0.6));
    // points du carrousel
    const dots = mk('div', 'a', s.cam, { left: '540px', top: '1405px', display: 'flex', gap: '14px', transform: 'translateX(-50%)' }, [1, 2, 3, 4, 5].map((i) => `<i style="width:${6 - i === n ? 34 : 14}px;height:14px;border-radius:7px;background:${6 - i === n ? 'var(--o)' : 'rgba(28,22,18,.18)'}"></i>`).join(''));
    cred(s, CREDIT[imgKey] + ' · Coûts : ordres de grandeur, presse auto et propriétaires');
    s.P.push((t) => { N.style.transform = `translateX(${(-30 * E(t, a, 2.5)).toFixed(1)}px)`; });
    return { s, k1 };
  }

  const SPECS = {};
  // =====================================================================================================
  // LE DICTIONNAIRE DU VENDEUR (version courte, 20 s)
  // =====================================================================================================
  SPECS.dico2 = () => {
    const tP1 = T('1500', 3), tP2 = T('600', 6), tP3 = T('900', 8.5), tP5 = T('3000', 11);
    function entry(a, b, tin, head, tP, from, to, label, hot) {
      const s = S(a, b, 'var(--ink)', tin, 0.04); s.imp.push([tP + 0.05, 12]);
      KA(s, 140, 330, 72, head, '#fbf9f5', true, a - s.pre - 0.02);
      BA(s, 144, 440, 'expression de vendeur', [], a - s.pre + 0.05, 'rgba(251,249,245,.5)', 30);
      const PB = priceBlock(s, 560, "jusqu'à", tP, from, to, B(label, hot)); s.P.push(PB);
      men(s, 'Fourchettes de la grille de coûts UTOPICAR', '#fbf9f5');
      return s;
    }
    // « Juste un voyant… rien de grave. » Traduction :
    const s1 = S(-1, 3.3, 'var(--w)', { type: 'cut' }, 0.05);
    BA(s1, 144, 250, 'lu dans une annonce', ['annonce'], -0.6);
    const hl = mk('div', 'a', s1.cam, { left: '128px', top: '742px', width: '760px', height: '118px', borderRadius: '14px', background: 'rgba(255,90,31,.55)', transformOrigin: '0 50%' });
    KA(s1, 140, 330, 190, '« Juste un', 'var(--ink)', true, [-0.55, -0.45, -0.4]);
    const q2 = KA(s1, 140, 520, 190, 'voyant,', 'var(--ink)', true, T('voyant') - 0.05, 'rise', { acc: [T('voyant')] });
    KA(s1, 140, 712, 150, 'rien de grave. »', 'var(--ink)', true, [T('rien'), T('de', 1), T('grave')]);
    KA(s1, 140, 1010, 120, 'Traduction :', 'var(--o)', false, T('traduction', 2), 'slam');
    s1.P.push((t) => { hl.style.transform = `rotate(-2deg) scaleX(${E(t, 1.4, 0.55).toFixed(3)})`; });
    cue(1.4, 'whoosh', 0.45); cue(T('traduction', 2), 'thud', 0.6);
    // portail par le « o » de « voyant » → l'entrée du dictionnaire
    entry(3.3, T('petit', 4), { type: 'portal', ...at(q2, 0, 1, 0.3, 0.6) }, '« voyant allumé, rien de grave »', tP1, '0 000 €', '1 500 €', 'panne non diagnostiquée', ['diagnostiquée']);
    // « Petit bruit au démarrage ? » hmm…
    const a3 = T('petit', 4), s3 = S(a3, tP2 - 0.12, 'var(--w)', { type: 'pull', x: 230, y: 390 }, 0.05);
    const q3 = KA(s3, 140, 300, 180, '« Petit bruit', 'var(--ink)', true, [a3, a3, T('bruit', 4.5)]);
    KA(s3, 140, 490, 150, 'au démarrage ? »', 'var(--ink)', true, [T('au', 4.8), T('demarrage', 4.8)]);
    KA(s3, 140, 760, 130, 'hmm…', '#b5aa9c', true, 5.7, 'blur', { fx: (i, j, tt) => ({ y: Math.sin(tt * 7 + j * 1.3) * 8 }) });
    entry(tP2 - 0.12, T('embrayage', 7), { type: 'portal', ...at(q3, 2, 0, 0.2, 0.55) }, '« petit bruit au démarrage »', tP2, '000 €', '600 €', 'bruit signalé, origine inconnue', ['inconnue']);
    // « Embrayage un peu haut ? » (soupir)
    const a5 = T('embrayage', 7), s5 = S(a5, tP3 - 0.12, 'var(--w)', { type: 'pull', x: 260, y: 390 }, 0.05);
    const sag = (i, j, tt) => ({ y: E(tt, 8.45 + j * 0.03, 0.5) * (10 + j * 4), r: E(tt, 8.45, 0.5) * (j % 2 ? 3 : -2) });
    const q5 = KA(s5, 140, 300, 180, '« Embrayage', 'var(--ink)', true, a5, 'rise', { fx: sag });
    KA(s5, 140, 490, 160, 'un peu haut ? »', 'var(--ink)', true, [T('un', 7.6), T('peu', 7.6), T('haut', 7.6)], 'rise', { fx: sag });
    entry(tP3 - 0.12, T('tu', 9.8), { type: 'portal', ...at(q5, 1, 2, 0.2, 0.5) }, '« embrayage un peu haut »', tP3, '000 €', '900 €', 'embrayage à changer', ['changer']);
    // « Tu additionnes… pfff… »
    const a7 = T('tu', 9.8), s7 = S(a7, tP5 - 0.06, 'var(--o)', { type: 'slab' });
    KA(s7, 140, 270, 150, 'Tu', '#fff', false, a7, 'slam'); KA(s7, 140, 420, 150, 'additionnes…', '#fff', false, T('additionnes', 10));
    KA(s7, 140, 600, 220, 'Pfff…', 'var(--ink)', true, 11.0, 'blur', { fx: (i, j, tt) => ({ y: E(tt, 11.15 + j * 0.05, 0.5) * (14 + j * 9), r: E(tt, 11.15, 0.5) * (j % 2 ? 5 : -4) }) });
    [['1 500 €', 'voyant', 330, 1010, -7, 10.35], ['600 €', 'petit bruit', 740, 1060, 5, 10.55], ['900 €', 'embrayage', 520, 1260, 3, 10.75]].forEach(([p, l, x, y, r, t0]) => {
      const e = tag(s7.cam, p, l, 76); cue(t0, 'pop', 0.7); s7.P.push((t) => drop(e, t, t0, x, y + E(t, 11.15, 0.5) * 24, r)); });
    cue(10.92, 'tapestop');
    // « …trois mille euros. »
    const s8 = S(tP5 - 0.06, T('je', 12.3), 'var(--ink)', { type: 'cut' }, 0.04); s8.imp.push([tP5 + 0.04, 26]); cue(tP5, 'impact');
    s8.P.push(priceBlock(s8, 600, "jusqu'à", tP5, '0 000 €', '3 000 €', B('pour une seule annonce', ['annonce'])));
    men(s8, 'Fourchettes de la grille de coûts UTOPICAR', '#fbf9f5');
    // « Je colle l'annonce dans UTOPICAR… »
    const a9 = T('je', 12.3), tCl = 14.18, s9 = S(a9, T('bam', 14) - 0.02, 'var(--o)', { type: 'slab' });
    KA(s9, 140, 270, 150, 'Je colle', '#fff', false, [a9, T('colle', 12.5)]); KA(s9, 140, 420, 200, "l'annonce", 'var(--ink)', true, T('annonce', 12.9));
    const field = mk('div', 'a', s9.cam, { width: '800px', height: '150px', borderRadius: '999px', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 18px 0 36px', gap: '16px', boxShadow: '0 50px 100px -30px rgba(28,22,18,.45)' },
      '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#1c1612" stroke-width="2.2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>');
    const txt = mk('div', '', field, { flex: '1', font: '500 36px Satoshi', color: '#1c1612', whiteSpace: 'nowrap', overflow: 'hidden' });
    const chars = [...'…/annonce/peugeot-208'].map((ch) => mk('span', '', txt, null, ch));
    const btn = mk('div', '', field, { height: '114px', width: '270px', borderRadius: '999px', background: 'var(--o)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 44px Clash', color: '#1a1310', flex: 'none' }, 'Analyser');
    const L9 = logo(s9.cam, 540, 1200, 620), cur9 = cursor(s9.cam, [[a9, 1200, 1900], [tCl - 0.02, 800, 905], [tCl + 0.6, 815, 925]], [tCl]);
    cue(T('colle', 12.5) + 0.1, 'type'); cue(T('utopicar', 13), 'whoosh', 0.6); cue(tCl, 'click');
    s9.P.push((t) => { pose(field, t, (tt) => { const p = E(tt, a9 + 0.1, 0.55); return { x: 540, y: lerp(1500, 860, p), c: 1, p: 1, rx: 12 * (1 - p) + 6, r: -2 }; });
      chars.forEach((c, i) => { c.style.opacity = t >= T('colle', 12.5) + 0.1 + i * 0.018 ? 1 : 0; });
      btn.style.transform = `scale(${(1 - 0.08 * bump(t, tCl - 0.03, 0.14)).toFixed(3)})`; L9(t, T('utopicar', 13) - 0.05); cur9(t); });
    // « …et bam : les travaux, chiffrés avant d'appeler. »
    const aB = T('bam', 14) - 0.02, s10 = S(aB, T('t', 16.6), 'var(--w)', { type: 'circle', x: 800, y: 905 }, 0.03); s10.imp.push([aB + 0.03, 22]); cue(aB, 'impact');
    s10.P.push(((k) => (t) => ktP(k, t, aB, 'slam', T('les', 14.7) - 0.25, 'up'))(L1(s10.cam, 140, 230, 330, 'Bam.', 'var(--o)', true)));
    KA(s10, 140, 270, 130, 'Les travaux,', 'var(--ink)', false, [T('les', 14.7), T('travaux', 14.7)]);
    KA(s10, 140, 400, 130, 'chiffrés', 'var(--ink)', false, T('chiffres', 15));
    KA(s10, 140, 540, 170, "avant d'appeler.", 'var(--o)', true, [T('avant', 15.8), T('appeler', 15.8)], 'rise', { acc: [T('avant', 15.8), T('appeler', 15.8)] });
    const card = crop(s10.cam, 'fiche-208', { W: 1050, x: 0, y: 0, w: 1050, h: 1150 }, 560);
    const hlc = mk('div', 'hl a', card, { left: '18px', top: '486px', width: '524px', height: '124px' });
    const TG = ['1 500 €', '600 €', '900 €'].map((p) => tag(s10.cam, p, null, 60)), tIn = [T('les', 14.7), T('travaux', 14.7), T('chiffres', 15)];
    tIn.forEach((ti) => cue(ti, 'pop', 0.7)); cue(T('avant', 15.8) - 0.05, 'ding', 0.7);
    men(s10, 'Données de démonstration');
    s10.P.push((t) => { pose(card, t, (tt) => { const p = E(tt, aB + 0.12, 0.6); return { x: 540, y: lerp(2300, 1095, p), c: 1, p: 1, rx: 8 + 14 * (1 - p), ry: -10, r: 2 }; });
      hlc.style.opacity = E(t, tIn[0], 0.3).toFixed(3);
      TG.forEach((e, i) => pose(e, t, (tt) => { const t0 = tIn[i] - 0.35; if (tt < t0) return null; const p = E(tt, t0, 0.42, eIO);
        return { x: lerp([270, 770, 290][i], 600, p), y: lerp([1370, 1330, 840][i], 1110, p), c: 1, s: lerp(1, 0.25, p), o: 1 - E(tt, t0 + 0.32, 0.12), r: lerp([-10, 8, 6][i], 0, p) }; })); });
    // « T'as lu quoi, toi ? » (rire)
    const aT = T('t', 16.6), s11 = S(aT, T('ecris', 18), 'var(--ink)', { type: 'cut' }, 0.04); cue(aT, 'thud', 0.5);
    KA(s11, 140, 300, 210, "T'as lu", 'var(--o)', true, [aT, T('lu', 16.9)]); KA(s11, 140, 500, 210, 'quoi, toi ?', 'var(--o)', true, [T('quoi', 17), T('toi', 17.2)]);
    KA(s11, 640, 780, 110, 'ha !', 'rgba(251,249,245,.45)', true, 17.75, 'blur', { fx: (i, j, tt) => ({ y: Math.sin(tt * 20 + j) * 6 }) });
    const bub = mk('div', 'a', s11.cam, { width: '760px', padding: '30px 36px', borderRadius: '40px', background: '#fff', display: 'flex', gap: '24px', alignItems: 'center', boxShadow: '0 40px 80px -24px rgba(0,0,0,.7)' },
      '<div style="flex:none;width:84px;height:84px;border-radius:50%;background:var(--o)"></div><div style="flex:1"><div style="height:22px;width:42%;border-radius:11px;background:rgba(28,22,18,.18)"></div><div style="display:flex;gap:12px;margin-top:20px"><i style="width:22px;height:22px;border-radius:50%;background:var(--ink)"></i><i style="width:22px;height:22px;border-radius:50%;background:var(--ink)"></i><i style="width:22px;height:22px;border-radius:50%;background:var(--ink)"></i></div></div>');
    const dots = [...bub.querySelectorAll('i')], tB = T('toi', 17.2) + 0.15; cue(tB, 'sent', 0.6);
    s11.P.push((t) => { pose(bub, t, (tt) => { if (tt < tB - 0.05) return null; const p = E(tt, tB, 0.45); return { x: 540, y: lerp(1500, 1150, p), c: 1, o: p * 2, r: -2 * (1 - p) }; });
      dots.forEach((d, i) => { d.style.transform = `translateY(${(-8 * Math.max(0, Math.sin((t - tB) * 9 - i * 0.9))).toFixed(1)}px)`; }); });
    endCard(T('ecris', 18), 'var(--o)', [['Écris-le.', 300, 230, '#fff', false, T('ecris', 18)]], 'Écris ta phrase <b style="color:var(--o)">en commentaire</b>', T('ecris', 18) + 0.1, { type: 'circle', x: 540, y: 1150 });
  };

  // =====================================================================================================
  // A01 · 5 moteurs à fuir
  // =====================================================================================================
  SPECS.A01 = () => {
    const s1 = S(-1, 2.9, 'var(--w)', { type: 'cut' }, 0.04);
    KA(s1, 140, 270, 170, 'Clio à', 'var(--ink)', false, [-0.6, -0.5]);
    const R = ROLL(s1.cam, 130, 450, 240, '0 000 €', '5 900 €', 'var(--o)'); cue(T('5'), 'pop', 0.6);
    carIn(s1, CAR + 'car-clio.webp', 760, 540, 1110, -0.7);
    cred(s1, CREDIT.clio);
    s1.P.push((t) => { rollP(R, t, -0.75, 0.55, 0.06); pose(R.box, t, (tt) => ({ x: 0, y: 0, s: 1 + 0.07 * bump(tt, T('5'), 0.2) })); });
    const s2 = S(2.9, T('5', 4.5) - 0.05, 'var(--ink)', { type: 'portal', ...atEl(R.cols[1].col, 0.5, 0.5) }, 0.04); s2.imp.push([T('10', 3) + 0.05, 20]); cue(T('10', 3), 'impact', 0.8);
    s2.P.push(priceBlock(s2, 520, "jusqu'à", T('10', 3), '00 000 €', '10 000 €', B('de moteur', ['moteur'])));
    const a3 = T('5', 4.5) - 0.05, s3 = S(a3, 6.32, 'var(--o)', { type: 'slab' });
    KA(s3, 140, 300, 200, '5 moteurs', '#fff', false, [T('5', 4.5), T('moteurs', 4.5)], 'slam'); KA(s3, 140, 500, 260, 'à fuir.', 'var(--ink)', true, [T('a', 5.2), T('fuir', 5.2)]);
    engineSlide(6.32, 8.1, { type: 'swipe' }, 5, 'N° 5 · 1.6 N13 · 2011 à 2015', 'BMW', '116i', 'car-bmw.webp', 'bmw', [['Jusqu’à 5 000 €', 'bad']], T('bmw', 6));
    engineSlide(8.1, 10.55, { type: 'swipe' }, 4, 'N° 4 · 1.4 TSI 122 et 160 ch · 2008 à 2012', 'Golf', '6', 'car-golf.webp', 'golf', [['Jusqu’à 7 000 €', 'bad']], T('golf', 8));
    engineSlide(10.55, 12.0, { type: 'swipe' }, 3, 'N° 3 · 1.0 EcoBoost · 2011 à 2018', 'Fiesta et', 'Focus', 'car-fiesta.webp', 'fiesta', [['Jusqu’à 7 000 €', 'bad']], T('fiesta', 10.5));
    engineSlide(12.0, 14.45, { type: 'swipe' }, 2, 'N° 2 · 1.2 TCe 115 et 120 · fin 2012 à mi-2016', 'Clio', '4', 'car-clio.webp', 'clio', [['Jusqu’à 10 000 €', 'bad']], T('clio', 12));
    const s8 = S(14.45, 16.3, 'var(--ink)', { type: 'cut' }, 0.05); cue(14.45, 'thud', 0.6);
    KA(s8, 140, 330, 170, 'Et numéro', '#fff', false, [T('et', 14.4), T('numero', 14.4)]);
    const k1 = KA(s8, 140, 520, 420, '1…', 'var(--o)', false, T('1', 15), 'slam');
    const { s: s9 } = engineSlide(16.3, 17.95, { type: 'portal', ...at(k1, 0, 0, 0.5, 0.5) }, 1, 'N° 1 · 1.2 PureTech · 2013 à mi-2022', 'Peugeot', '208', 'car-p208.webp', 'p208', [['Courroie : 400 à 600 €', 'warn'], ['Sinon : le moteur', 'bad']], T('208', 16));
    s9.imp.push([T('208', 16) + 0.05, 18]); cue(T('208', 16), 'impact', 0.8);
    endCard(17.95, 'var(--o)', [['Enregistre', 300, 190, '#fff', false, T('enregistre', 17.5)], ['la liste.', 480, 230, 'var(--ink)', true, T('liste', 18)]], '<b style="color:var(--o)">5 moteurs</b> à vérifier avant d’acheter', T('enregistre', 17.5));
  };

  // =====================================================================================================
  // A02 · Golf achetée 9 500 €, revendue 9 800 €, et 1 200 € de perte
  // =====================================================================================================
  SPECS.A02 = () => {
    const s1 = S(-1, 4.1, 'var(--w)', { type: 'cut' }, 0.04);
    KA(s1, 140, 260, 190, 'Golf', 'var(--ink)', false, -0.6);
    carIn(s1, CAR + 'car-golf.webp', 760, 540, 1170, -0.7); cred(s1, CREDIT.golf);
    const t1 = tag(s1.cam, '9 500 €', 'achetée', 80), t2 = tag(s1.cam, '9 800 €', 'revendue', 80);
    cue(T('9') , 'pop', 0.7); cue(T('9', 2.4), 'pop', 0.7);
    s1.P.push((t) => { drop(t1, t, T('9'), 330, 690, -6); drop(t2, t, T('9', 2.4), 740, 780, 5); });
    const s2 = S(4.1, 5.85, 'var(--ink)', { type: 'portal', x: 740, y: 780 }, 0.04); s2.imp.push([T('1', 4.6) + 0.05, 22]); cue(T('1', 4.6), 'impact');
    KA(s2, 140, 400, 140, 'Et tu perds', '#fff', false, [T('et', 4), T('tu', 4), T('perds', 4)]);
    const R2 = ROLL(s2.cam, 130, 580, 300, '0 000 €', '1 200 €', '#ff5a4a'); cue(T('1', 4.6) + 0.12, 'roll', 0.8);
    s2.P.push((t) => { R2.box.style.visibility = t >= T('1', 4.6) - 0.12 ? '' : 'hidden'; rollP(R2, t, T('1', 4.6) - 0.1, 0.55, 0.06); });
    const s3 = S(5.85, 7.6, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s3, 140, 260, 130, 'Sur le papier,', 'var(--ink)', false, [T('sur', 5.8), T('le', 5.9), T('papier', 5.9)]);
    const tk3 = ticket(s3.cam, 780, [['Revente', '9 800 €', 6.2], ['Achat', '− 9 500 €', 6.45]], { lab: 'Écart', v: 300, sign: '+ ', t: T('300', 6.8), tone: 'g' });
    s3.P.push((t) => { rise(tk3, t, 5.9, 540, 860); tk3.paint(t); });
    const s4 = S(7.6, 13.75, 'var(--w)', { type: 'swipe' }, 0.03); s4.imp.push([T('1', 12.8) + 0.05, 18]); cue(T('1', 12.8), 'impact', 0.8);
    KA(s4, 140, 260, 130, 'Puis les frais.', 'var(--ink)', false, [T('puis', 7.7), T('les', 7.8), T('frais', 7.8)]);
    const tk4 = ticket(s4.cam, 780, [['Remise en état', '1 100 €', T('remise', 8.8)], ['Carte grise, 5 CV', '186 €', T('carte', 9.9)], ['Trajet, 128 km', '64 €', T('trajet', 10.9)], ['CT, nettoyage, annonce', '150 €', 11.6]], { lab: 'Frais', v: 1500, t: T('1', 12.8), tone: 'r' });
    s4.P.push((t) => { rise(tk4, t, 7.7, 540, 900); tk4.paint(t); });
    const s5 = S(13.75, 16.25, 'var(--ink)', { type: 'portal', ...atPose(tk4, 540, 900, 0.8, 0.9) }, 0.04);
    KA(s5, 140, 380, 130, 'Ton prix max', '#fff', false, [T('ton', 13.8), T('prix', 13.8), T('max', 13.8)]);
    const R5 = ROLL(s5.cam, 130, 540, 300, '0 000 €', '7 500 €', 'var(--o)'); cue(T('7', 14.9) + 0.12, 'roll', 0.8);
    BA(s5, 144, 900, "calculé avant d'appeler", ['avant'], 15.5, '#fbf9f5');
    s5.P.push((t) => { R5.box.style.visibility = t >= T('7', 14.9) - 0.12 ? '' : 'hidden'; rollP(R5, t, T('7', 14.9) - 0.1, 0.55, 0.06); });
    endCard(16.25, 'var(--o)', [['Commente', 300, 170, '#fff', false, T('commente', 16)], ['DÉBUTANT', 470, 200, 'var(--ink)', false, T('debut', 16.5)]], 'Le guide <b style="color:var(--o)">Ta 1re revente</b>', T('commente', 16));
  };

  // =====================================================================================================
  // A03 · l'arnaque au faux paiement sécurisé
  // =====================================================================================================
  SPECS.A03 = () => {
    const s1 = S(-1, 5.0, 'var(--ink)', { type: 'cut' }, 0.04);
    KA(s1, 140, 260, 150, 'Tu vends', '#fff', false, [-0.6, -0.5]); KA(s1, 140, 410, 200, 'ta 207', 'var(--o)', true, [T('ta'), T('207')]);
    const tg = tag(s1.cam, '3 900 €', null, 90); cue(T('3900'), 'pop', 0.7);
    const b1 = bubble(s1.cam, 900, 'Bonjour, je la prends sans visite. Je paie par le paiement sécurisé.', false, T('un', 2.6), 'Un acheteur · 21:14');
    const st = stamp(s1.cam, 'SANS LA VOIR', 'var(--o)', 96); cue(T('sans', 3.5), 'thud', 0.8);
    s1.P.push((t) => { drop(tg, t, T('3900'), 720, 700, 6); b1(t); slamAt(st, t, T('sans', 3.5), 540, 1330, -6); });
    const s2 = S(5.0, 8.75, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s2, 140, 260, 150, 'Puis un SMS.', 'var(--ink)', false, [T('puis', 5), T('un', 5.2), T('sms', 5.5)]);
    const nt = mk('div', 'notif2 a', s2.cam, null, '<div class="h"><i class="ic"></i>SMS · 21:31</div>Paiement de 3 900 € reçu. Validez vos coordonnées bancaires pour le recevoir : <u>ouvrir le lien</u>');
    cue(T('sms', 5.5), 'ding', 0.7);
    const cur2 = cursor(s2.cam, [[5.0, 1200, 1900], [8.3, 640, 1010], [8.8, 650, 1020]], [8.45]);
    s2.P.push((t) => { pose(nt, t, (tt) => { const p = E(tt, T('sms', 5.5), 0.5); return { x: 540, y: lerp(-400, 860, p), c: 1, r: -1.5 * (1 - p) }; }); cur2(t); });
    const u = nt.querySelector('u');
    const s3 = S(8.75, 10.58, 'var(--r)', { type: 'portal', x: 640, y: 1010 }, 0.04);
    KA(s3, 140, 260, 140, 'Le lien veut', '#fff', false, [T('le', 8.8), T('lien', 8.8), T('veut', 8.8)]); KA(s3, 140, 420, 230, 'ta carte.', '#fff', true, [T('ta', 9.4), T('carte', 9.4)]);
    const rows = [['Numéro de carte', 'demandé'], ['Date et cryptogramme', 'demandés'], ['Test de 0,01 €', '« pour valider »']].map(([l, v], i) => line(s3.cam, 140, 800 + i * 110, `${l} · <span style="color:#ffd0c8">${v}</span>`, 44, '#fff'));
    s3.P.push((t) => rows.forEach((r, i) => slideIn(r, t, 9.0 + i * 0.3)));
    const s4 = S(10.58, 14.1, 'var(--ink)', { type: 'cut' }, 0.05); cue(10.58, 'thud', 0.5);
    KA(s4, 140, 300, 90, "Pour recevoir de l'argent,", 'rgba(251,249,245,.75)', false, [T('pour', 10.5), T('recevoir', 10.5), T('de', 11), T('argent', 11)]);
    KA(s4, 140, 470, 160, 'personne', 'var(--o)', true, T('personne', 12)); KA(s4, 140, 640, 160, "n'a besoin", 'var(--o)', true, [T('n', 12.4), T('besoin', 12.4)]);
    KA(s4, 140, 810, 160, 'de ta carte.', '#fff', true, [T('de', 12.9), T('ta', 13), T('carte', 13)]);
    endCard(14.1, 'var(--o)', [['Envoie ça', 260, 170, '#fff', false, T('envoie', 14)], ['à ton pote', 420, 170, '#fff', false, T('ton', 14.6)], ['qui vend sa voiture.', 610, 110, 'var(--ink)', true, T('vend', 15)]], 'Carte donnée ? <b style="color:var(--o)">Fais-la opposer.</b>', T('envoie', 14));
  };

  // =====================================================================================================
  // A04 · Ta 1re revente, partie 1
  // =====================================================================================================
  const intro = (n, tPart) => { const s = S(-1, 0, 'var(--w)', { type: 'cut' }, 0.04);
    BA(s, 144, 250, 'POV : ta 1re revente', ['1re'], -0.6, 'var(--ink)', 34);
    KA(s, 140, 310, 140, 'Ta 1re revente,', 'var(--ink)', false, [-0.55, -0.5, -0.45]); KA(s, 140, 470, 210, 'partie ' + n, 'var(--o)', true, [tPart, tPart + 0.12]);
    hero(s, DEMO + 'clio-2.webp', 780, 520, 540, 1080, -0.7); cue(tPart, 'thud', 0.6); return s; };
  SPECS.A04 = () => {
    const s1 = intro(1, T('partie')); s1.b = 2.55;
    const s2 = S(2.55, 4.95, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s2, 140, 260, 150, 'Une Clio 4', 'var(--ink)', false, [T('une', 2.5), T('clio', 2.5), T('4', 2.8)]);
    const ls = listing(s2.cam, 640, DEMO + 'clio-2.webp', 'Renault Clio 4 TCe 90', '2016 · 112 000 km · Essence', '7 400 €'); const mk2 = ls.querySelector('.p i');
    s2.P.push((t) => { rise(ls, t, 2.65, 540, 930, 2); mk2.style.transform = `scaleX(${E(t, T('7400', 3.5), 0.45).toFixed(3)})`; });
    const s3 = S(4.95, 8.1, 'var(--ink)', { type: 'portal', x: 420, y: 1250 }, 0.04);
    KA(s3, 140, 260, 110, "Avant d'appeler,", '#fff', false, [T('avant', 5), T('appeler', 5)]); KA(s3, 140, 390, 150, 'ton prix max', 'var(--o)', true, [T('ton', 5.7), T('prix', 5.7), T('max', 5.7)]);
    const tk = ticket(s3.cam, 780, [['Revente estimée', '8 300 €', 5.6], ['Frais prévus', '− 640 €', 5.85], ['Ta marge minimum', '− 600 €', 6.1]], { lab: 'Prix max', v: 7060, t: T('7', 6.6), tone: 'o' });
    s3.P.push((t) => { rise(tk, t, 5.2, 540, 980); tk.paint(t); });
    const s4 = S(8.1, 11.75, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s4, 140, 260, 140, 'Au téléphone…', 'var(--ink)', false, [T('au', 8.1), T('telephone', 8.1)]);
    const bs = [bubble(s4.cam, 560, 'Je vous propose 6 700 €.', true, 8.6), bubble(s4.cam, 760, '7 000 et elle est à vous.', false, T('7000', 9.2), 'Le vendeur'),
      bubble(s4.cam, 1000, 'Avec le carnet et le double des clés ?', true, 10.6), bubble(s4.cam, 1220, 'Les deux.', false, 11.2)];
    s4.P.push((t) => bs.forEach((b) => b(t)));
    const s5 = S(11.75, 14.65, 'var(--o)', { type: 'slab' });
    KA(s5, 140, 280, 170, 'Tu achètes.', '#fff', false, [T('tu', 11.7), T('achetes', 11.7)], 'slam');
    const R = ROLL(s5.cam, 130, 470, 280, '0 000 €', '7 000 €', 'var(--ink)'); cue(12.1, 'roll', 0.8);
    BA(s5, 144, 820, '60 € sous ton plafond', ['60'], T('60', 12.5), 'var(--ink)', 40, '#fff');
    s5.P.push((t) => { R.box.style.visibility = t >= 11.85 ? '' : 'hidden'; rollP(R, t, 11.9, 0.55, 0.06); });
    endCard(14.65, 'var(--ink)', [['Partie 2,', 300, 190, '#fff', false, T('partie', 14.5)], ['samedi.', 480, 230, 'var(--o)', true, T('samedi', 15)]], '640 € de frais, <b style="color:var(--o)">5 jours sans appel</b>', T('partie', 14.5));
  };

  // =====================================================================================================
  // A05 · Tu gagnes 300 € en négo et tu rentres à −12 €
  // =====================================================================================================
  SPECS.A05 = () => {
    const s1 = S(-1, 3.0, 'var(--w)', { type: 'cut' }, 0.04);
    KA(s1, 140, 260, 160, 'Lille →', 'var(--ink)', false, [-0.6, -0.5]); KA(s1, 140, 420, 190, 'Marseille', 'var(--o)', true, T('marseille', 1.5));
    const map = mk('div', 'a', s1.cam, { left: '0px', top: '0px' }, `<svg width="1080" height="1920"><path id="rt" d="M300 760 C 520 820, 330 1040, 560 1110 S 760 1260, 780 1330" fill="none" stroke="#1c1612" stroke-width="10" stroke-linecap="round" stroke-dasharray="4 26"/>
      <circle cx="300" cy="760" r="22" fill="#1c1612"/><circle cx="780" cy="1330" r="26" fill="#ff5a1f"/><text x="340" y="772" font-family="Satoshi" font-weight="700" font-size="40" fill="#1c1612">Lille</text><text x="560" y="1408" font-family="Satoshi" font-weight="700" font-size="40" fill="#1c1612">Marseille · 1 000 km</text></svg>`);
    const path = map.querySelector('#rt'), PL = path.getTotalLength();
    const cr = car(s1.cam, CAR + 'car-clio.webp', 260);   // posée sur Marseille, dans la colonne sûre cred(s1, CREDIT.clio);
    s1.P.push((t) => { path.style.strokeDashoffset = '0'; path.setAttribute('stroke-dasharray', `4 26`); path.style.clipPath = ''; const p = E(t, -0.4, 2.2, eIO); path.setAttribute('stroke-dasharray', `${(PL * p).toFixed(0)} ${PL}`);
      pose(cr, t, (tt) => ({ x: 770, y: 1235 - 20 * E(tt, 1.7, 0.5), c: 1, o: E(tt, 1.6, 0.4) })); });
    const s2 = S(3.0, 4.85, 'var(--ink)', { type: 'swipe' }, 0.03);
    KA(s2, 140, 260, 120, 'Tu gagnes', '#fff', false, [T('tu', 3), T('gagnes', 3)]);
    const R2 = ROLL(s2.cam, 130, 400, 260, '+000 €', '+300 €', '#3ccf7a'); cue(T('300', 3.3) + 0.1, 'roll', 0.8);
    BA(s2, 144, 700, 'en négo', ['négo'], T('nego', 4), '#fbf9f5');
    const b2 = bubble(s2.cam, 900, 'Allez, 3 900 au lieu de 4 200.', false, 3.3, 'Le vendeur · Marseille');
    s2.P.push((t) => { R2.box.style.visibility = t >= T('300', 3.3) - 0.12 ? '' : 'hidden'; rollP(R2, t, T('300', 3.3) - 0.1, 0.5, 0.06); b2(t); });
    const s3 = S(4.85, 10.15, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s3, 140, 260, 130, 'Ton samedi :', 'var(--ink)', false, [4.9, 5.0]);
    const tk = ticket(s3.cam, 780, [['Train aller', '118 €', T('train', 4.9)], ['Gazole, 1 000 km', '96 €', T('gazole', 5.5)], ['Péages', '87 €', T('peage', 6.3)], ['Sandwich et café', '11 €', T('sandwich', 7)]], { lab: 'Trajet', v: 312, t: T('312', 8.5), tone: 'r' });
    s3.P.push((t) => { rise(tk, t, 4.95, 540, 900); tk.paint(t); });
    const s4 = S(10.15, 12.05, 'var(--ink)', { type: 'portal', ...atPose(tk, 540, 900, 0.82, 0.88) }, 0.04); s4.imp.push([T('moins', 11) + 0.05, 24]); cue(T('moins', 11), 'impact');
    KA(s4, 140, 300, 160, 'Ta négo ?', '#fff', false, [T('ta', 10.2), T('nego', 10.2)]);
    const R4 = ROLL(s4.cam, 130, 500, 320, '−00 €', '−12 €', '#ff5a4a'); cue(T('moins', 11) + 0.12, 'roll', 0.8);
    BA(s4, 144, 900, 'une fois le trajet payé', ['trajet'], 11.6, '#fbf9f5');
    s4.P.push((t) => { R4.box.style.visibility = t >= T('moins', 11) - 0.1 ? '' : 'hidden'; rollP(R4, t, T('moins', 11) - 0.08, 0.5, 0.06); });
    const s5 = S(12.05, 15.1, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s5, 140, 260, 140, 'Et la voiture ?', 'var(--ink)', false, [T('et', 12), T('la', 12.2), T('voiture', 12.2)]);
    KA(s5, 140, 410, 130, 'Faut encore', 'var(--o)', true, [T('faut', 13.2), T('encore', 13.2)]); KA(s5, 140, 540, 150, 'la revendre.', 'var(--o)', true, [T('la', 13.6), T('revendre', 13.6)]);
    carIn(s5, CAR + 'car-clio.webp', 760, 540, 1150, 12.1); cred(s5, CREDIT.clio);
    const ven = tag(s5.cam, 'À vendre', null, 64); cue(T('revendre', 13.6), 'pop', 0.7);
    s5.P.push((t) => drop(ven, t, T('revendre', 13.6), 760, 1000, 6));
    endCard(15.1, 'var(--o)', [['Envoie ça', 260, 170, '#fff', false, T('envoie', 15)], ['à ton pote', 420, 170, '#fff', false, T('ton', 15.6)], ['qui fait 1 000 km', 600, 110, 'var(--ink)', true, T('fait', 16.2)], ['pour 300 €.', 720, 110, 'var(--ink)', true, T('pour', 17)]], null, T('envoie', 15));
  };

  // =====================================================================================================
  // A06 · Ta 1re revente, partie 2
  // =====================================================================================================
  SPECS.A06 = () => {
    const s1 = intro(2, T('partie')); s1.b = 2.45;
    const s2 = S(2.45, 5.35, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s2, 140, 260, 150, 'Les frais.', 'var(--ink)', false, [2.5, 2.6]);
    const tk = ticket(s2.cam, 780, [['Carte grise, 5 CV', '290 €', 2.55], ['2 pneus avant', '160 €', 2.72], ['Plaquettes avant', '90 €', 2.89], ['Nettoyage', '40 €', 3.06], ['Trajet du jour 1', '60 €', 3.23]], { lab: 'Frais', v: 640, t: T('euros', 3), tone: '' });
    const st = stamp(s2.cam, 'PILE LE BUDGET', 'var(--ok)', 80); cue(T('pile', 4), 'thud', 0.8);
    s2.P.push((t) => { rise(tk, t, 2.5, 540, 880); tk.paint(t); slamAt(st, t, T('pile', 4), 560, 1360, -5); });
    const s3 = S(5.35, 7.55, 'var(--ink)', { type: 'portal', ...atPose(tk, 540, 880, 0.82, 0.9) }, 0.04);
    KA(s3, 140, 260, 130, 'Ton annonce :', '#fff', false, [T('annonce', 5.3), T('annonce', 5.3) + 0.1]);
    const ls = listing(s3.cam, 620, DEMO + 'clio-2.webp', 'Renault Clio 4 TCe 90', '2016 · 112 000 km · Essence', '8 490 €'); const mk3 = ls.querySelector('.p i');
    s3.P.push((t) => { rise(ls, t, 5.45, 540, 930, 2); mk3.style.transform = `scaleX(${E(t, T('8490', 5.8), 0.45).toFixed(3)})`; });
    const s4 = S(7.55, 10.35, 'var(--ink)', { type: 'swipe' }, 0.04);
    const R = ROLL(s4.cam, 130, 300, 420, '0', '5', '#fff'); cue(T('5', 7.5) + 0.1, 'roll', 0.8);
    KA(s4, 400, 420, 200, 'jours.', 'var(--o)', true, T('jours', 7.8));
    const z = mk('div', 'pill a', s4.cam, { background: 'var(--r)', color: '#fff', fontSize: '60px', padding: '24px 46px' }, '0 appel · 0 message'); cue(T('zero', 8.6), 'thud', 0.8);
    s4.P.push((t) => { rollP(R, t, T('5', 7.5) - 0.1, 0.6, 0); pose(z, t, (tt) => { const t0 = T('zero', 8.6); if (tt < t0 - 0.02) return null; const p = E(tt, t0, 0.25); return { x: 540, y: 1000, c: 1, s: 1 + 0.6 * (1 - p), o: p * 3, r: -3 }; }); });
    const s5 = S(10.35, 13.7, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s5, 140, 260, 150, 'Tu baisses ?', 'var(--ink)', false, [T('tu', 10.3), T('baisses', 10.3)]);
    const th = mk('div', 'a', s5.cam, { padding: '40px 56px', borderRadius: '70px', background: '#fff', font: 'italic 400 76px Instrument', color: 'var(--ink)', whiteSpace: 'nowrap', boxShadow: '0 40px 80px -30px rgba(28,22,18,.45)' }, '« Je baisse à 7 990 ? »');
    const no = stamp(s5.cam, 'NON.', 'var(--r)', 130); cue(T('non', 11.3), 'impact', 0.8); s5.imp.push([T('non', 11.3) + 0.03, 16]);
    KA(s5, 140, 1020, 130, 'Tu changes', 'var(--o)', true, [T('tu', 12), T('changes', 12)]); KA(s5, 140, 1160, 160, '4 lignes.', 'var(--o)', true, [T('4', 12.4), T('lignes', 12.4)]);
    s5.P.push((t) => { pose(th, t, (tt) => { const p = E(tt, 10.45, 0.5); return { x: 540, y: 640, c: 1, s: 0.8 + 0.2 * p, o: p * 2 }; }); slamAt(no, t, T('non', 11.3), 620, 700, -10); });
    endCard(13.7, 'var(--ink)', [['Partie 3,', 300, 190, '#fff', false, T('partie', 13.6)], ['demain.', 480, 230, 'var(--o)', true, T('demain', 14)]], 'Les <b style="color:var(--o)">4 lignes</b> qui font appeler', T('partie', 13.6));
  };

  // =====================================================================================================
  // A07 · Ta 1re revente, partie 3
  // =====================================================================================================
  SPECS.A07 = () => {
    const s1 = intro(3, T('partie')); s1.b = 2.38;
    const s2 = S(2.38, 5.65, 'var(--w)', { type: 'swipe' }, 0.03);
    KA(s2, 140, 250, 120, '4 lignes changées.', 'var(--ink)', false, [T('4', 2.3), T('lignes', 2.3), T('changees', 2.3)]);
    const av = mk('div', 'card2 a', s2.cam, { width: '760px', font: '600 34px Satoshi', color: 'rgba(28,22,18,.45)' }, '<div style="font:700 24px Satoshi;letter-spacing:.14em;margin-bottom:10px">AVANT</div><s>Très bon état</s> · <s>CT OK</s> · <s>Pas sérieux s’abstenir</s>');
    const ap = mk('div', 'card2 a', s2.cam, { width: '780px', font: '700 38px/1.55 Satoshi', color: 'var(--ink)' }, '<div style="font:700 24px Satoshi;letter-spacing:.14em;color:var(--o);margin-bottom:8px">APRÈS</div>' + ['112 000 km, 2 propriétaires', 'CT d’août, aucun défaut', 'Pneus et plaquettes neufs, factures', 'Carnet complet, 2 clés'].map((x) => `<div class="ln2">✓ ${x}</div>`).join(''));
    const lns = [...ap.querySelectorAll('.ln2')];
    const call = mk('div', 'pill a', s2.cam, { background: 'var(--o)', color: '#fff', fontSize: '50px' }, '3 appels en 2 jours'); cue(T('3', 3.8), 'ding', 0.8);
    s2.P.push((t) => { rise(av, t, 2.45, 540, 520, -1); rise(ap, t, 2.6, 540, 880, 1); lns.forEach((l, i) => slideIn(l, t, 2.75 + i * 0.18));
      pose(call, t, (tt) => { const t0 = T('3', 3.8); if (tt < t0 - 0.02) return null; const p = E(tt, t0, 0.3); return { x: 540, y: 1300, c: 1, s: 1 + 0.5 * (1 - p) + 0.04 * Math.sin((tt - t0) * 30) * Math.exp(-(tt - t0) * 3), o: p * 3 }; }); });
    const s3 = S(5.65, 9.95, 'var(--ink)', { type: 'swipe' }, 0.03);
    KA(s3, 140, 260, 150, 'Jour 10.', '#fff', false, [5.7, 5.8]);
    const bs = [bubble(s3.cam, 520, 'Bonjour, vous faites 7 900 ?', false, T('vous', 5.6), 'Un acheteur · 19:02'), bubble(s3.cam, 780, '8 300. Pneus et plaquettes neufs, factures à l’appui.', true, T('8003', 7)),
      bubble(s3.cam, 1120, 'Je passe samedi. 8 300.', false, 9.2)];
    s3.P.push((t) => bs.forEach((b) => b(t)));
    const s4 = S(9.95, 13.9, 'var(--o)', { type: 'slab' });
    const st = stamp(s4.cam, 'VENDUE', 'var(--ink)', 150); cue(T('vendu', 9.9), 'impact', 0.8); s4.imp.push([T('vendu', 9.9) + 0.03, 18]);
    const R = ROLL(s4.cam, 130, 640, 280, '+000 €', '+660 €', '#fff'); cue(T('660', 10.8) + 0.1, 'roll', 0.8);
    BA(s4, 144, 990, 'en 12 jours, frais payés', ['12'], T('12', 12), 'var(--ink)', 40, '#fff');
    s4.P.push((t) => { slamAt(st, t, T('vendu', 9.9), 540, 420, -6); R.box.style.visibility = t >= T('660', 10.8) - 0.12 ? '' : 'hidden'; rollP(R, t, T('660', 10.8) - 0.1, 0.55, 0.06); });
    const s5 = S(13.9, 16.72, 'var(--ink)', { type: 'portal', ...atEl(R.box, 0.5, 0.5) }, 0.04);
    KA(s5, 140, 260, 110, 'Le calcul du jour 1,', '#fff', false, [T('le', 13.9), T('calcul', 13.9), T('du', 14.3), T('jour', 14.3), T('1', 14.7)]);
    KA(s5, 140, 380, 150, 'étape par étape', 'var(--o)', true, [T('etape', 15.3), T('par', 15.6), T('etape', 15.8)]);
    const tk = ticket(s5.cam, 780, [['Revente estimée', '8 300 €', 14.4], ['Frais prévus', '− 640 €', 14.6], ['Ta marge minimum', '− 600 €', 14.8]], { lab: 'Prix max', v: 7060, t: 15.15, tone: 'o' });
    s5.P.push((t) => { rise(tk, t, 14.05, 540, 980); tk.paint(t); });
    endCard(16.72, 'var(--o)', [['Commente', 300, 170, '#fff', false, T('commente', 16.6)], ['DÉBUTANT', 470, 200, 'var(--ink)', false, T('debut', 16.9)]], 'Le guide <b style="color:var(--o)">Ta 1re revente</b>', T('commente', 16.6));
  };

  // =====================================================================================================
  // PS1 · Problème → solution : la Classe A en vente trois fois, à trois prix (vraie annonce analysée le 10 oct. 2026)
  // =====================================================================================================
  SPECS.PS1 = () => {
    const MERC = PH + 'mercedes-profil.jpg', SRC = 'Vraie annonce (Classe A 180d, 2018, 96 000 km), analysée par UTOPICAR le 10 oct. 2026';
    const tBam = T('bam', 13), tMax = T('ton', 13.5), t165 = T('16', 14.5), tJ = T('3', 15.5);
    // « Tu craques pour cette Classe A. » : l'annonce entre, le cœur se remplit
    const s1 = S(-1, 2.25, 'var(--w)', { type: 'cut' }, 0.04);
    KA(s1, 140, 250, 190, 'Tu craques', 'var(--ink)', false, [-0.6, -0.5], 'rise', { acc: [-1, T('craques')] });
    KA(s1, 140, 455, 96, 'pour cette Classe A.', 'var(--o)', true, [T('pour'), T('cette'), T('classe'), T('a', 1.2)]);
    const L1c = listing(s1.cam, 720, MERC, 'Mercedes Classe A 180d', '2018 · 96 000 km · Diesel', '19 990 €', '50% 58%');
    const heart = mk('div', 'a', L1c, { left: '600px', top: '24px', width: '92px', height: '92px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px -8px rgba(0,0,0,.4)' },
      '<svg width="52" height="52" viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 3.1 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.7 0 5.9 3.8 4.4 7.3C19.5 16.4 12 21 12 21z" fill="none" stroke="#1c1612" stroke-width="2"/></svg>');
    const hp = heart.querySelector('path'), mk1 = L1c.querySelector('.p i'), tH = T('craques') + 0.15;
    cue(tH, 'pop', 0.8);
    s1.P.push((t) => {
      pose(L1c, t, (tt) => { const p = E(tt, -0.75, 0.75), f = Math.max(0, tt + 0.75 - 0.75); return { x: lerp(1500, 540, p) + 6 * Math.sin(f * 0.9), y: 1010 + 6 * Math.sin(f * 1.3), c: 1, p: 1, rx: 6, ry: -12 - 34 * (1 - p), r: -2 + 0.4 * Math.sin(f) }; });
      const on = t >= tH; hp.setAttribute('fill', on ? 'var(--o)' : 'none'); hp.setAttribute('stroke', on ? 'var(--o)' : '#1c1612');
      heart.style.transform = `scale(${(1 + 0.45 * bump(t, tH, 0.22)).toFixed(3)})`;
      mk1.style.transform = `scaleX(${E(t, T('classe'), 0.45).toFixed(3)})`;
    });
    cred(s1, SRC);
    // « Elle est en vente trois fois… à trois prix. » (rire) : zoom arrière, la même annonce trois fois
    const a2 = 2.25, s2 = S(a2, 5.85, 'var(--w)', { type: 'pull', x: 540, y: 960 }, 0.03);
    KA(s2, 140, 240, 100, 'Elle est en vente', 'var(--ink)', false, [T('elle', 2), T('est', 2), T('en', 2.5), T('vente', 2.5)]);
    const k3 = KA(s2, 140, 370, 210, '3 fois.', 'var(--o)', true, [T('3', 2.8), T('fois', 2.8)], 'slam');
    KA(s2, 770, 430, 80, 'ha !', '#b5aa9c', true, 4.95, 'blur', { fx: (i, j, tt) => ({ y: Math.sin(tt * 20 + j) * 6 }) });
    const C = [0, 1, 2].map((i) => listing(s2.cam, 380, MERC, 'Mercedes Classe A', '2018 · 96 000 km', '', '50% 58%'));
    C[1].style.zIndex = 3; C.forEach((c) => { c.querySelector('.p').style.display = 'none'; });
    const tOut = [T('3', 2.8), T('fois', 2.8)], X = [330, 540, 750], R_ = [-7, 0, 7];
    tOut.forEach((ti) => cue(ti, 'whoosh', 0.45));
    const tP = [T('a', 3.9), T('3', 4.1) + 0.12, T('prix', 4.2) + 0.12];
    const TG = [['17 990 €', 'Bretagne'], ['19 990 €', 'cette annonce'], ['21 990 €', 'Tarn']].map(([p, l], i) => { const e = tag(s2.cam, p, l, 54); if (i === 1) { e.style.borderColor = 'var(--o)'; e.style.borderWidth = '5px'; e.style.zIndex = 4; } return e; });
    tP.forEach((ti) => cue(ti, 'pop', 0.7));
    s2.P.push((t) => {
      C.forEach((c, i) => pose(c, t, (tt) => { const p = i === 1 ? 1 : E(tt, tOut[i === 0 ? 0 : 1], 0.5); const f = tt - a2; return { x: lerp(540, X[i], p), y: 960 + 22 * p * (i === 1 ? -1 : 1) + 5 * Math.sin(f * 1.4 + i), c: 1, p: 1, rx: 4, ry: 0, r: R_[i] * p + 0.4 * Math.sin(f * 1.1 + i), s: i === 1 ? 1.06 : 0.97 }; }));
      TG.forEach((e, i) => drop(e, t, tP[i], X[i], 1255 + (i === 1 ? -10 : 18), [-6, 2, 7][i]));
    });
    cred(s2, SRC + ' · même voiture vue dans 2 autres annonces');
    // « Tu prends celle du milieu ? » : portail par le prix du milieu, le curseur va appeler
    const a3 = 5.85, s3 = S(a3, T('tu', 7.1), 'var(--w)', { type: 'portal', x: 540, y: 1255 }, 0.04);
    KA(s3, 140, 250, 170, 'Tu prends', 'var(--ink)', false, [T('tu', 5.8), T('prends', 5.8)]);
    KA(s3, 140, 440, 130, 'celle du milieu ?', 'var(--o)', true, [T('celle', 6), T('du', 6.2), T('milieu', 6.3), T('?', 6.6)]);
    const L3 = listing(s3.cam, 720, MERC, 'Mercedes Classe A 180d', '2018 · 96 000 km · Diesel', '19 990 €', '50% 58%');
    const btn3 = mk('div', 'a', L3, { left: 'auto', top: 'auto', right: '34px', bottom: '40px', padding: '22px 40px', borderRadius: '999px', background: 'var(--ink)', color: '#fff', font: '600 40px Clash' }, 'Appeler');
    const cur3 = cursor(s3.cam, [[a3, 1100, 1700], [6.5, 880, 1420], [7.1, 800, 1340]]);
    s3.P.push((t) => { pose(L3, t, (tt) => { const f = tt - a3; return { x: 540 + 6 * Math.sin(f * 0.9), y: 1060 + 6 * Math.sin(f * 1.3), c: 1, p: 1, rx: 5, ry: -8, r: -1.5 }; });
      btn3.style.transform = `scale(${(1 + 0.06 * Math.max(0, Math.sin((t - a3) * 9))).toFixed(3)})`; cur3(t); });
    // « Tu perds 2 700. » (soupir) Pfff. : coupe sur le rouge, le vrai calcul de l'outil, la musique s'arrête
    const a4 = T('tu', 7.1), t27 = T('2', 7.8), s4 = S(a4, 10.0, 'var(--r)', { type: 'cut' }, 0.04); s4.imp.push([t27 + 0.05, 22]);
    cue(a4, 'impact', 0.8); cue(t27, 'thud', 0.9); cue(MU.stop, 'tapestop');
    KA(s4, 140, 230, 170, 'Tu perds', '#fff', false, [a4, T('perds', 7.2)], 'slam');
    const tk = ticket(s4.cam, 780, [['Revente (1 à 2 mois)', '18 600 €', a4 + 0.05], ['Achat', '− 19 990 €', a4 + 0.2], ['Travaux', '− 500 €', a4 + 0.35], ['Carte grise', '− 427 €', a4 + 0.5], ['Trajet et frais', '− 383 €', a4 + 0.65]],
      { lab: 'Ce qui te reste', v: 2700, t: t27, tone: 'r', sign: '− ' });
    const kP = KA(s4, 140, 1190, 140, 'Pfff…', '#fff', true, 8.75, 'blur', { fx: (i, j, tt) => ({ y: E(tt, 8.95 + j * 0.05, 0.5) * (14 + j * 9), r: E(tt, 8.95, 0.5) * (j % 2 ? 5 : -4) }) });
    s4.P.push((t) => { rise(tk, t, a4 - 0.05, 540, 790, -1); tk.paint(t); });
    cred(s4, SRC + ' · revente normale estimée par l’outil', '#fff');
    // « Avant d'appeler, tu colles l'annonce dans UTOPICAR… »
    const a5 = 10.0, tCl = T('car', 12) + 0.2, s5 = S(a5, tBam - 0.03, 'var(--o)', { type: 'slab' });
    KA(s5, 140, 250, 170, "Avant", '#fff', false, T('avant', 9.9)); KA(s5, 140, 430, 190, "d'appeler,", 'var(--ink)', true, [T('d', 10.3)]);
    const field = mk('div', 'a', s5.cam, { width: '800px', height: '150px', borderRadius: '999px', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 18px 0 36px', gap: '16px', boxShadow: '0 50px 100px -30px rgba(28,22,18,.45)' },
      '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#1c1612" stroke-width="2.2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>');
    const txt = mk('div', '', field, { flex: '1', font: '500 36px Satoshi', color: '#1c1612', whiteSpace: 'nowrap', overflow: 'hidden' });
    const tTy = T('colles', 11.2), chars = [...'…/annonce/mercedes-classe-a'].map((ch) => mk('span', '', txt, null, ch));
    const btn = mk('div', '', field, { height: '114px', width: '270px', borderRadius: '999px', background: 'var(--o)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 44px Clash', color: '#1a1310', flex: 'none' }, 'Analyser');
    const L5 = logo(s5.cam, 540, 1200, 620), cur5 = cursor(s5.cam, [[a5, 1200, 1900], [tCl - 0.02, 800, 905], [tCl + 0.6, 815, 925]], [tCl]);
    cue(tTy + 0.05, 'type'); cue(T('dans', 11.5), 'whoosh', 0.6); cue(tCl, 'click');
    s5.P.push((t) => { pose(field, t, (tt) => { const p = E(tt, a5 + 0.15, 0.55); return { x: 540, y: lerp(1500, 860, p), c: 1, p: 1, rx: 12 * (1 - p) + 6, r: -2 }; });
      chars.forEach((c, i) => { c.style.opacity = t >= tTy + i * 0.016 ? 1 : 0; });
      btn.style.transform = `scale(${(1 - 0.08 * bump(t, tCl - 0.03, 0.14)).toFixed(3)})`; L5(t, T('dans', 11.5) + 0.1); cur5(t); });
    // « …et bam ! Ton prix max, 16 500. » : la vraie analyse, le prix qui descend jusqu'au plafond
    const s6 = S(tBam - 0.03, 15.9, 'var(--k)', { type: 'circle', x: 800, y: 905 }, 0.03); s6.imp.push([tBam + 0.03, 22]); cue(tBam, 'impact');
    s6.P.push(((k) => (t) => ktP(k, t, tBam, 'slam', tBam + 0.42, 'up'))(L1(s6.cam, 140, 520, 330, 'Bam.', 'var(--o)', true)));
    const vd = crop(s6.cam, 'merc-verdict', { W: 1074, x: 0, y: 0, w: 1074, h: 690 }, 780, { background: '#1c1712' });
    KA(s6, 140, 870, 80, 'Ton prix max', '#fff', false, [tMax, T('prix', 13.9), T('max', 14.1)]);
    const R6 = ROLL(s6.cam, 130, 975, 230, '19 990 €', '16 500 €', 'var(--o)');
    const kb = brk(s6.cam, 144, 1290, B('au-delà, tu perds de l’argent', ['perds']), '#fbf9f5', 38);
    cue(tMax, 'whoosh', 0.5); cue(t165 - 0.1, 'roll', 0.9); cue(T('500', 14.9) + 0.1, 'ding', 0.6);
    s6.P.push((t) => {
      pose(vd, t, (tt) => { const p = E(tt, tBam + 0.2, 0.6), f = Math.max(0, tt - tBam - 0.8); return { x: 540, y: lerp(1900, 560, p) + 5 * Math.sin(f * 1.5), c: 1, p: 1, rx: 6 + 30 * (1 - p), ry: -6, r: 1.5 * (1 - p) + 0.3 * Math.sin(f) }; });
      R6.box.style.visibility = t >= tMax ? '' : 'hidden'; rollP(R6, t, t165 - 0.15, 0.6, 0.07);
      pose(R6.box, t, (tt) => ({ x: 0, y: 0, s: 1 + 0.06 * bump(tt, t165 + 0.45, 0.2) }));
      ktP(kb, t, t165 + 0.4, 'rise', null, 'up', { step: 0.05 });
    });
    cred(s6, SRC, '#fbf9f5');
    // « Trois jours offerts. Lien en bio ! »
    endCard(15.9, 'var(--o)', [['3 jours', 260, 200, '#fff', false, tJ], ['offerts.', 450, 200, 'var(--ink)', true, T('offerts', 15.9)]], 'Lien en bio · <b style="color:var(--o)">sans carte bancaire</b>', T('lien', 16.6),
      { type: 'portal', ...atEl(R6.cols[1].col, 0.5, 0.5) });
  };

  // =====================================================================================================
  // PS2 · Problème → solution, avant / après sur la même annonce : la perte, un vrai rembobinage du film, puis la même
  // Classe A achetée avec UTOPICAR (vraie analyse du 10 oct. 2026 ; le + 1 290 € est calculé sur ses chiffres)
  // =====================================================================================================
  SPECS.PS2 = () => {
    const MERC = PH + 'mercedes-profil.jpg', SRC = 'Vraie annonce (Classe A 180d, 2018, 96 000 km) analysée par UTOPICAR le 10 oct. 2026';
    const tAch = T('achete'), t19 = T('19'), tRev = T('revendu', 3), t18 = T('18', 3.5), tCG = T('carte', 5), tTJ = T('trajet', 6), tTX = T('travaux', 7), tFR = tTX + 0.45;
    const tMo = T('moins', 8), t27 = T('2', 8.2), tRw = T('ramb', 10), tMe = T('meme', 11), tAv = T('avant', 12), tUt = T('utopi', 13.5);
    const tBam = T('bam', 14.5), tPx = T('prix', 15.5), t165 = T('16', 16), tNe = T('negocies', 17), t160 = T('16', 17.8), tPl = T('plus', 19), t1290 = T('1', 19.4);
    const RW = { a: 10.3, b: 11.42, to: 0.55 };
    const CARD = { x: 540, y: 1040 };
    // ---------- PROBLÈME : une seule scène, que le rembobinage rejoue à l'envers ----------
    const sP = S(-1, RW.a + 0.001, 'var(--w)', { type: 'cut' }, 0.03); sP.keep = 0;
    const red = mk('div', 'a', sP.el, { inset: '0', background: 'var(--r)', zIndex: 0 }); sP.el.insertBefore(red, sP.cam);
    const kA = L1(sP.cam, 140, 230, 160, 'Classe A', 'var(--ink)'), kB = L1(sP.cam, 140, 410, 150, 'achetée', 'var(--o)', true);
    const lab = brk(sP.cam, 144, 220, B('ce qui te reste', ['reste']), 'var(--ink)', 40);
    const cnt = mk('div', 'a', sP.cam, { left: '134px', top: '280px', font: '600 180px/1 Clash', letterSpacing: '-.04em', whiteSpace: 'nowrap', color: 'var(--r)' });
    const kP = L1(sP.cam, 140, 560, 120, 'Pfff…', '#fff', true);
    const kK = brk(sP.cam, 144, 580, B('et tu perds 2 700 € dessus', ['2', '700', '€']), 'var(--ink)', 44);   // l'enjeu dès l'image 0, pour ceux qui regardent sans le son
    const LP = listing(sP.cam, 720, MERC, 'Mercedes Classe A 180d', '2018 · 96 000 km · Diesel', '19 990 €', '50% 58%'), mkP = LP.querySelector('.p i');
    const rev = tag(sP.cam, '18 600 €', 'revendue', 56); rev.style.borderColor = 'var(--ok)';
    const FEES = [['− 427 €', 'carte grise', tCG, 250, 820, -8], ['− 233 €', 'trajet', tTJ, 765, 780, 7], ['− 500 €', 'travaux', tTX, 300, 1120, 5], ['− 150 €', 'frais', tFR, 755, 1150, -6]]
      .map(([p, l, t0, x, y, r]) => { const e = tag(sP.cam, p, l, 60); e.style.borderColor = 'var(--r)'; return { e, t0, x, y, r }; });
    const STEPS = [[t18 - 0.2, -1390], [tCG, -1817], [tTJ, -2050], [tTX, -2550], [tFR, -2700]];
    cue(tAch, 'thud', 0.5); cue(t19 + 0.1, 'roll', 0.7); cue(t18, 'pop', 0.8); FEES.forEach((f) => cue(f.t0, 'pop', 0.8));
    cue(t27, 'impact'); cue(MU.stop, 'tapestop'); sP.imp.push([t27 + 0.03, 24]);
    sP.P.push((t) => {
      // titre « Classe A achetée », remplacé par le compteur quand la voix dit « revendue »
      ktP(kA, t, -0.6, 'rise', tRev - 0.1); ktP(kB, t, tAch, 'rise', tRev - 0.05);
      ktP(lab, t, tRev + 0.05, 'rise', null, 'up', { step: 0.05 });
      ktP(kK, t, -0.5, 'rise', tRev - 0.15, 'up', { step: 0.03 });
      let v = 0; for (const [t0, val] of STEPS) { const p = E(t, t0, 0.35); v = lerp(v, val, p); }
      cnt.style.visibility = t >= t18 - 0.25 ? '' : 'hidden';
      cnt.textContent = (v < -0.5 ? '− ' : '') + fmt(v) + ' €';
      const bz = bump(t, t27, 0.25); cnt.style.transform = `scale(${(1 + 0.12 * bz + 0.05 * STEPS.reduce((m, [t0]) => Math.max(m, bump(t, t0, 0.16)), 0)).toFixed(3)})`; cnt.style.transformOrigin = '0 60%';
      const rp = E(t, t27, 0.3); red.style.clipPath = `circle(${(rp * 2400).toFixed(0)}px at 320px 400px)`; red.style.opacity = rp > 0 ? 1 : 0;
      cnt.style.color = rp > 0.3 ? '#fff' : 'var(--r)'; lab.box.style.color = rp > 0.3 ? '#fff' : 'var(--ink)';
      ktP(kP, t, 9.4, 'blur', null, 'up', { fx: (i, j, tt) => ({ y: E(tt, 9.6 + j * 0.05, 0.5) * (14 + j * 9), r: E(tt, 9.6, 0.5) * (j % 2 ? 5 : -4) }) });
      // la voiture : entre en mouvement, puis s'affaisse sur le soupir
      pose(LP, t, (tt) => { const p = E(tt, -0.8, 0.8), f = Math.max(0, tt), sg = E(tt, 9.5, 0.6); return { x: lerp(1500, CARD.x, p) + 6 * Math.sin(f * 0.9), y: CARD.y + 6 * Math.sin(f * 1.3) + 40 * sg, c: 1, p: 1, rx: 6, ry: -12 - 34 * (1 - p), r: -2 + 0.4 * Math.sin(f) + 3 * sg }; });
      mkP.style.transform = `scaleX(${E(t, t19, 0.5).toFixed(3)})`;
      drop(rev, t, t18, 745, 1300, -4);
      FEES.forEach((f) => drop(f.e, t, f.t0, f.x, f.y + 40 * E(t, 9.5, 0.6), f.r));
    });
    const crP = cred(sP, SRC + ' · revente 18 600 € et frais estimés par l’outil');
    sP.P.push((t) => { crP.style.color = E(t, t27, 0.3) > 0.3 ? '#fff' : 'var(--ink)'; });
    // ---------- REMBOBINAGE : seek() repeint la scène du problème à l'envers (voir REW plus bas) ----------
    win(RW.a, RW.b + 0.05); cue(RW.a, 'whoosh', 0.6);
    const ov = mk('div', 'a', ST, { inset: '0', zIndex: 90, pointerEvents: 'none', display: 'none',
      background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.10) 0 3px, transparent 3px 7px)' });
    const rwL = mk('div', 'a', ov, { left: '140px', top: '800px', font: '700 120px/1 Clash', color: '#fff', letterSpacing: '-.04em', textShadow: '6px 0 rgba(255,0,60,.55), -6px 0 rgba(0,200,255,.55), 0 10px 40px rgba(0,0,0,.35)' }, '◀◀');
    const rwT = mk('div', 'a', ov, { left: '350px', top: '840px', font: '700 44px Satoshi', color: '#fff', letterSpacing: '.18em', textShadow: '4px 0 rgba(255,0,60,.5), -4px 0 rgba(0,200,255,.5)' }, 'REMBOBINE');
    const band = mk('div', 'a', ov, { left: '0', width: '1080px', height: '90px', background: 'rgba(255,255,255,.16)', filter: 'blur(6px)' });
    REW = { ...RW, paint: (t) => {
      const on = t >= RW.a && t < RW.b; ov.style.display = on ? '' : 'none';
      if (!on) { sP.el.style.filter = ''; sP.el.style.translate = ''; return; }
      const p = (t - RW.a) / (RW.b - RW.a);
      sP.el.style.filter = 'saturate(1.45) contrast(1.12)';
      sP.el.style.translate = `${(noise(3, t * 40) * 10).toFixed(1)}px ${(noise(9, t * 33) * 4).toFixed(1)}px`;
      rwL.style.opacity = Math.floor(t * 8) % 2 ? 0.55 : 1; band.style.top = ((p * 3.2 % 1) * 2000 - 90).toFixed(0) + 'px';
    } };
    // ---------- SOLUTION ----------
    // « Même annonce. Avant d'appeler, tu la colles dans UTOPICAR… » : même cadre qu'au début, cette fois on colle le lien
    const tCl = tUt + 0.55, sS1 = S(RW.b, tBam - 0.03, 'var(--w)', { type: 'cut' }, 0.03); cue(RW.b, 'thud', 0.7); sS1.imp.push([RW.b + 0.02, 10]);
    const kM = KT(sS1.cam, 140, 230, 150, [['Même', {}], ['annonce.', { c: 'var(--o)', i: 1 }]]); sS1.P.push((t) => ktP(kM, t, [tMe - 0.05, T('annonce', 11.5)]));
    KA(sS1, 140, 410, 96, "Avant d'appeler,", 'var(--ink)', false, [tAv, T('d', 12.6)]);
    const LS = listing(sS1.cam, 720, MERC, 'Mercedes Classe A 180d', '2018 · 96 000 km · Diesel', '19 990 €', '50% 58%'); LS.querySelector('.p i').style.transform = 'scaleX(1)';
    const field = mk('div', 'a', sS1.cam, { width: '740px', height: '140px', borderRadius: '999px', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px 0 34px', gap: '14px', boxShadow: '0 50px 100px -30px rgba(28,22,18,.45)', zIndex: 5 },
      '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#1c1612" stroke-width="2.2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>');
    const txt = mk('div', '', field, { flex: '1', font: '500 34px Satoshi', color: '#1c1612', whiteSpace: 'nowrap', overflow: 'hidden' });
    const tTy = T('colles', 13.4), chars = [...'…/annonce/mercedes-classe-a'].map((ch) => mk('span', '', txt, null, ch));
    const btn = mk('div', '', field, { height: '108px', width: '250px', borderRadius: '999px', background: 'var(--o)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 42px Clash', color: '#1a1310', flex: 'none' }, 'Analyser');
    const spin = mk('div', 'a', btn, { width: '60px', height: '60px', borderRadius: '50%', border: '8px solid rgba(26,19,16,.25)', borderTopColor: '#1a1310', left: '50%', top: '50%', display: 'none' });
    const curS = cursor(sS1.cam, [[RW.b, 1150, 1900], [tTy - 0.1, 1000, 1150], [tCl - 0.02, 790, 655], [tCl + 0.8, 805, 675]], [tCl]);
    cue(tTy + 0.05, 'type'); cue(tCl, 'click'); cue(tAv, 'whoosh', 0.4);
    sS1.P.push((t) => {
      pose(LS, t, (tt) => { const p = E(tt, tAv, 0.6, eIO), f = tt; return { x: CARD.x + 6 * Math.sin(f * 0.9), y: lerp(CARD.y, 1130, p) + 6 * Math.sin(f * 1.3), c: 1, p: 1, rx: 6, ry: -12, r: -2 + 0.4 * Math.sin(f), s: lerp(1, 0.84, p) }; });
      pose(field, t, (tt) => { if (tt < tAv - 0.05) return null; const p = E(tt, tAv, 0.5); return { x: 540, y: lerp(420, 640, p), c: 1, p: 1, rx: 20 * (1 - p), o: Math.min(1, p * 3), r: -1 }; });
      chars.forEach((c, i) => { c.style.opacity = t >= tTy + i * 0.016 ? 1 : 0; });
      const m = E(t, tCl + 0.02, 0.22); btn.style.width = lerp(250, 108, m) + 'px'; btn.style.color = m > 0.3 ? 'transparent' : '#1a1310';
      spin.style.display = m > 0.6 ? '' : 'none'; spin.style.transform = `translate(-50%,-50%) rotate(${((t - tCl) * 600) % 360}deg)`;
      curS(t);
    });
    cred(sS1, SRC);
    // « …et bam : prix max, 16 500. » : la vraie analyse, le prix roule jusqu'au plafond
    const sS2 = S(tBam - 0.03, tNe - 0.25, 'var(--k)', { type: 'circle', x: 790, y: 640 }, 0.03); sS2.imp.push([tBam + 0.03, 22]); cue(tBam, 'impact');
    sS2.P.push(((k) => (t) => ktP(k, t, tBam, 'slam', tBam + 0.4, 'up'))(L1(sS2.cam, 140, 520, 330, 'Bam.', 'var(--o)', true)));
    const vd = crop(sS2.cam, 'merc-verdict', { W: 1074, x: 0, y: 0, w: 1074, h: 690 }, 780, { background: '#1c1712' });
    KA(sS2, 140, 870, 80, 'Prix max', '#fff', false, [tPx, T('max', 15.6)]);
    const R2 = ROLL(sS2.cam, 130, 975, 230, '19 990 €', '16 500 €', 'var(--o)');
    const kb2 = brk(sS2.cam, 144, 1290, B('au-delà, tu perds de l’argent', ['perds']), '#fbf9f5', 38);
    cue(tPx, 'whoosh', 0.5); cue(t165 - 0.1, 'roll', 0.9); cue(t165 + 0.55, 'ding', 0.6);
    sS2.P.push((t) => {
      pose(vd, t, (tt) => { const p = E(tt, tBam + 0.18, 0.6), f = Math.max(0, tt - tBam - 0.8); return { x: 540, y: lerp(1900, 560, p) + 5 * Math.sin(f * 1.5), c: 1, p: 1, rx: 6 + 30 * (1 - p), ry: -6, r: 1.5 * (1 - p) + 0.3 * Math.sin(f) }; });
      R2.box.style.visibility = t >= tPx ? '' : 'hidden'; rollP(R2, t, t165 - 0.15, 0.6, 0.07);
      pose(R2.box, t, (tt) => ({ x: 0, y: 0, s: 1 + 0.06 * bump(tt, t165 + 0.45, 0.2) }));
      ktP(kb2, t, t165 + 0.4, 'rise', null, 'up', { step: 0.05 });
    });
    cred(sS2, SRC, '#fbf9f5');
    // « Tu négocies à 16 000… (rire) Plus 1 290. » : la négo, puis le même compteur, cette fois en vert
    const sS3 = S(tNe - 0.25, 21.2, 'var(--w)', { type: 'swipe' }, 0.03);
    const green = mk('div', 'a', sS3.el, { inset: '0', background: 'var(--ok)' }); sS3.el.insertBefore(green, sS3.cam);
    const lab3 = brk(sS3.cam, 144, 220, B('ce qui te reste', ['reste']), 'var(--ink)', 40);
    const old = mk('div', 'a', sS3.cam, { left: '140px', top: '290px', font: '600 110px/1 Clash', color: 'rgba(200,30,30,.55)', letterSpacing: '-.03em', whiteSpace: 'nowrap' }, '− 2 700 €');
    const strike = mk('div', 'a', sS3.cam, { left: '134px', top: '345px', width: '520px', height: '10px', borderRadius: '5px', background: 'var(--ink)', transformOrigin: '0 50%' });
    const R3 = ROLL(sS3.cam, 130, 420, 250, '+0 000 €', '+1 290 €', 'var(--ok)');
    const b1 = bubble(sS3.cam, 870, 'Je vous propose 16 000.', true, tNe + 0.1), b2 = bubble(sS3.cam, 1050, 'Ok pour 16 000.', false, t160 + 0.35, 'Le vendeur');
    const kh = L1(sS3.cam, 720, 1230, 80, 'ha !', '#b5aa9c', true);
    const kx = brk(sS3.cam, 144, 712, B('achetée 16 000, mêmes frais', ['16 000,']), 'var(--ink)', 38);
    cue(tPl, 'impact', 0.9); cue(tPl + 0.1, 'roll', 0.9); sS3.imp.push([tPl + 0.03, 16]);
    sS3.P.push((t) => {
      ktP(lab3, t, early(sS3, tNe), 'rise', null, 'up', { step: 0.05 });
      const po = E(t, early(sS3, tNe), 0.4); old.style.opacity = po; strike.style.transform = `scaleX(${E(t, t160, 0.35).toFixed(3)})`;
      b1(t); b2(t); ktP(kh, t, 18.62, 'blur', 19.2, 'up', { fx: (i, j, tt) => ({ y: Math.sin(tt * 20 + j) * 6 }) });
      const gp = E(t, tPl, 0.32); green.style.clipPath = `circle(${(gp * 2400).toFixed(0)}px at 400px 560px)`; green.style.opacity = gp > 0 ? 1 : 0;
      const W3 = gp > 0.3; lab3.box.style.color = W3 ? '#fff' : 'var(--ink)'; R3.box.style.color = W3 ? '#fff' : 'var(--ok)'; old.style.color = W3 ? 'rgba(255,255,255,.45)' : 'rgba(200,30,30,.55)'; strike.style.background = W3 ? '#fff' : 'var(--ink)';
      R3.box.style.visibility = t >= tPl - 0.05 ? '' : 'hidden'; rollP(R3, t, tPl - 0.02, 0.6, 0.07);
      pose(R3.box, t, (tt) => ({ x: 0, y: 0, s: 1 + 0.08 * bump(tt, tPl + 0.85, 0.2) }));
      ktP(kx, t, tPl + 0.9, 'rise', null, 'up', { step: 0.05 }); kx.box.style.color = W3 ? '#fff' : 'var(--ink)';
    });
    const cr3 = cred(sS3, 'Exemple : achat à 16 000 € (objectif conseillé par l’outil), revente 18 600 € et frais 1 310 € estimés par l’outil');
    sS3.P.push((t) => { cr3.style.color = E(t, tPl, 0.32) > 0.3 ? '#fff' : 'var(--ink)'; });
    // « Trois jours offerts. Lien en bio ! »
    endCard(21.2, 'var(--o)', [['3 analyses', 250, 170, '#fff', false, T('trois', 21)], ['offertes', 430, 190, 'var(--ink)', true, T('offertes', 21.5)], ['avec le code TIKTOK', 640, 80, '#fff', false, T('code', 22.5)]],
      'Code <b style="color:var(--o)">TIKTOK</b> · lien en bio', T('code', 22.5),
      { type: 'circle', x: 540, y: 560 });
  };

  // =====================================================================================================
  // FI1 · « Test ADN de la Peugeot 107 » (moins de 8 s) : façon émission de test de paternité, le père est Toyota ;
  // 107, C1 et Aygo : même voiture, même moteur 1.0 VVT-i (fiche fiabilité de l'outil, lib/analyse/fiabilite.ts)
  // =====================================================================================================
  SPECS.FI1 = () => {
    const P = '../assets/photos-fi1/', CRED = 'Photos Wikimedia Commons : Vauxford (CC BY-SA 4.0), Rudolf Stricker (CC BY-SA 3.0), détourées · Fiche fiabilité UTOPICAR';
    const tPe = T('peugeot'), tPere = T('pere', 2.4), tTo = T('toyota', 3.3), tMe = T('meme', 4.3), tAy = T('aigo', 5.3), tC1 = T('c1', 5.8), tTu = T('tu', 6.5), tLa = T('laquelle', 6.8);
    const s = S(-1, DUR + 1, 'var(--k)', { type: 'cut' }, 0.03); s.imp.push([tTo + 0.04, 30]);
    // projecteurs du plateau
    const spot = mk('div', 'a', s.el, { inset: '0', background: 'radial-gradient(60% 38% at 50% 44%, rgba(255,90,31,.22), transparent 70%), radial-gradient(40% 30% at 50% 0%, rgba(255,255,255,.10), transparent 70%)' }); s.el.insertBefore(spot, s.cam);
    const flash = mk('div', 'a', s.el, { inset: '0', background: '#fff', opacity: 0, zIndex: 40, pointerEvents: 'none' });
    // « TEST ADN » : déjà là à l'image 0
    const st = stamp(s.cam, 'TEST ADN', 'var(--o)', 130);
    const k1 = L1(s.cam, 140, 470, 72, 'de la Peugeot 107', '#fbf9f5');
    // la 107 (l'enfant), puis la famille
    const c107 = car(s.cam, P + 'p107.webp', 820), cAy = car(s.cam, P + 'aygo.webp', 330), cC1 = car(s.cam, P + 'c1.webp', 330);
    c107.style.zIndex = 3;
    const t107 = tag(s.cam, 'Peugeot 107', "l'enfant", 54);
    // l'enveloppe, puis le résultat
    const env = mk('div', 'card2 a', s.cam, { width: '700px', textAlign: 'center', font: '700 34px Satoshi', letterSpacing: '.16em', color: 'var(--ink)' }, '✉&nbsp; RÉSULTAT DU TEST');
    const res = mk('div', 'card2 a', s.cam, { width: '760px', textAlign: 'center', zIndex: 6 }, '<div style="font:600 34px Satoshi;color:rgba(28,22,18,.55)">Le père</div><div style="font:700 150px/1 Clash;letter-spacing:-.03em;color:var(--r)">TOYOTA</div>');
    const dots = L1(s.cam, 140, 1180, 120, '…', 'rgba(251,249,245,.6)');
    // la famille : même moteur
    const kM = L1(s.cam, 140, 270, 150, 'Même moteur', '#fff'), kV = L1(s.cam, 140, 440, 96, '1.0 VVT-i Toyota', 'var(--o)', true);
    const lab = [['Toyota Aygo', 310], ['Peugeot 107', 540], ['Citroën C1', 770]].map(([n, x]) => { const e = mk('div', 'pill a', s.cam, { background: '#fff', color: 'var(--ink)', fontSize: '30px', padding: '12px 20px' }, n); e.X = x; return e; });
    const emb = mk('div', 'pill a', s.cam, { background: '#b26a00', color: '#fff', fontSize: '34px' }, 'À vérifier : l’embrayage');
    const kT = L1(s.cam, 140, 270, 150, 'Tu prends', '#fff'), kL = L1(s.cam, 140, 440, 150, 'laquelle ?', 'var(--o)', true);
    const bub = mk('div', 'bub2 a th', s.cam, { fontSize: '38px' }, '💬 <b>107</b>, <b>C1</b> ou <b>Aygo</b> ?<small>Réponds en commentaire</small>');
    cred(s, CRED, '#fbf9f5');
    cue(-0.2, 'thud', 0.8); cue(tPe, 'pop', 0.6); cue(1.9, 'whoosh', 0.6); cue(tPere, 'roll', 0.7); cue(MU.stop, 'tapestop');
    cue(tTo, 'impact'); cue(tMe, 'whoosh', 0.7); cue(tAy - 0.05, 'pop', 0.8); cue(tC1 - 0.05, 'pop', 0.8); cue(tC1 + 0.3, 'thud', 0.5); cue(tTu, 'whoosh', 0.6); cue(tLa + 0.2, 'sent', 0.8);
    const fam = tMe - 0.1;        // passage à la famille
    s.paint = (t) => {
      // phase 1 : le test
      slamAt(st, t, -0.6, 540, 330, -4); st.style.opacity = 1 - E(t, fam - 0.2, 0.2);
      ktP(k1, t, tPe - 0.1, 'rise', fam - 0.25);
      pose(c107, t, (tt) => {
        const p = E(tt, -0.85, 0.75), f = Math.max(0, tt), q = E(tt, fam, 0.55, eIO), sh = tt > tPere && tt < tTo ? 4 * Math.sin(tt * 70) : 0;
        return { x: lerp(1600, 540, p) + 6 * Math.sin(f * 0.9) + sh, y: lerp(860, 800, q) + 6 * Math.sin(f * 1.3), c: 1, s: lerp(1, 0.47, q), r: 0.4 * Math.sin(f) };
      });
      pose(t107, t, (tt) => { if (tt < tPe - 0.05 || tt > tTo) return null; const p = E(tt, tPe, 0.3); return { x: 540, y: 1150, c: 1, r: -3, s: 1 + 0.4 * (1 - p), o: p * 3 }; });
      pose(env, t, (tt) => { if (tt < 1.8 || tt > tTo + 0.1) return null; const p = E(tt, 1.85, 0.5), sh = tt > tPere ? 6 * Math.sin(tt * 55) * E(tt, tPere, 0.4) : 0; return { x: 540 + sh, y: lerp(1900, 1330, p), c: 1, r: -2 + sh * 0.3 }; });
      ktP(dots, t, tPere + 0.25, 'blur', tTo - 0.05, 'up', { fx: (i, j, tt) => ({ y: Math.sin(tt * 12 + j) * 10 }) });
      pose(res, t, (tt) => { if (tt < tTo - 0.02 || tt > fam + 0.5) return null; const p = E(tt, tTo, 0.25), q = E(tt, fam, 0.45, eIO); return { x: 540, y: lerp(1300, 1250, q), c: 1, r: -3, s: (1 + 1.4 * (1 - p)) * (1 - 0.6 * q), o: Math.min(1, (tt - tTo) / 0.05) * (1 - q) }; });
      flash.style.opacity = (0.75 * Math.max(0, 1 - (t - tTo) / 0.18) * (t >= tTo ? 1 : 0)).toFixed(3);
      // phase 2 : la famille, même moteur
      ktP(kM, t, tMe, 'slam', tTu - 0.15); ktP(kV, t, T('moteur', 4.5) + 0.1, 'rise', tTu - 0.15);
      [[cAy, tAy, 310, -1600], [cC1, tC1, 770, 1700]].forEach(([e, t0, x, from]) => pose(e, t, (tt) => { if (tt < t0 - 0.35) return null; const p = E(tt, t0 - 0.3, 0.45), f = Math.max(0, tt - t0); return { x: lerp(from, x, p) + 4 * Math.sin(f * 1.2), y: 900 + 5 * Math.sin(f * 1.6), c: 1, r: 0.3 * Math.sin(f) }; }));
      lab.forEach((e, i) => pose(e, t, (tt) => { const t0 = [tAy, fam + 0.3, tC1][i]; if (tt < t0) return null; const p = E(tt, t0, 0.3), hi = bump(tt, tLa + 0.15 + i * 0.22, 0.2); return { x: e.X, y: [1030, 975, 1030][i], c: 1, s: (1 + 0.4 * (1 - p)) * (1 + 0.15 * hi), o: p * 3 }; }));
      pose(emb, t, (tt) => { if (tt < tC1 + 0.3) return null; const p = E(tt, tC1 + 0.3, 0.3); return { x: 540, y: 1140, c: 1, r: -2, s: 1 + 0.4 * (1 - p), o: p * 3 }; });
      // phase 3 : la question
      ktP(kT, t, tTu, 'slam'); ktP(kL, t, tLa, 'rise');
      pose(bub, t, (tt) => { if (tt < tLa + 0.15) return null; const p = E(tt, tLa + 0.2, 0.35); return { x: 540, y: lerp(1500, 1290, p), c: 1, o: p * 2, r: -2 * (1 - p) }; });
    };
  };

  // =====================================================================================================
  // FI2 · « Recette du jour » (moins de 8 s) : on croit regarder une recette ; les ingrédients sont une carrosserie
  // Peugeot et un moteur Toyota, et c'est une 107 qui sort de la casserole. 107, C1, Aygo : même moteur Toyota 1.0
  // (fiche fiabilité de l'outil, lib/analyse/fiabilite.ts : embrayage souvent fatigué, à vérifier)
  // =====================================================================================================
  SPECS.FI2 = () => {
    const P = '../assets/photos-fi1/', CRED = 'Photos Wikimedia Commons : Vauxford (CC BY-SA 4.0), Rudolf Stricker (CC BY-SA 3.0), détourées · Fiche fiabilité UTOPICAR';
    const tCa = T('carrosserie'), tMo = T('moteur', 2.6), tVo = T('voila', 4), t107 = T('107', 4.6), tFi = T('fiable', 5.5), tTu = T('tu', 6.3), tLa = T('laquelle', 6.8);
    const s = S(-1, DUR + 1, '#f4ece0', { type: 'cut' }, 0.03); s.imp.push([tVo + 0.05, 26]);
    // la cuisine : carrelage, plan de travail en bois
    const mur = mk('div', 'a', s.el, { inset: '0', background: 'repeating-linear-gradient(0deg, transparent 0 126px, rgba(28,22,18,.07) 126px 130px), repeating-linear-gradient(90deg, transparent 0 126px, rgba(28,22,18,.07) 126px 130px), linear-gradient(#f7f0e6, #efe3d2)' });
    s.el.insertBefore(mur, s.cam);
    const plan = mk('div', 'a', s.cam, { left: '-200px', top: '1180px', width: '1480px', height: '1000px', background: 'repeating-linear-gradient(90deg, rgba(0,0,0,.035) 0 3px, transparent 3px 46px), linear-gradient(#c88f58, #a46c3b 60%, #8a5a31)', boxShadow: '0 -14px 0 #d9a571 inset, 0 -30px 60px -20px rgba(0,0,0,.25)' });
    // la casserole (dessinée), son couvercle et la vapeur
    const pot = mk('div', 'a', s.cam, { width: '600px', zIndex: 4 }, `<svg viewBox="0 0 600 360" width="600" height="360"><defs><linearGradient id="pg" x1="0" x2="1"><stop offset="0" stop-color="#2a2a2e"/><stop offset=".35" stop-color="#55555c"/><stop offset=".6" stop-color="#34343a"/><stop offset="1" stop-color="#1d1d21"/></linearGradient></defs>
      <rect x="0" y="70" width="80" height="34" rx="17" fill="#1d1d21"/><rect x="520" y="70" width="80" height="34" rx="17" fill="#1d1d21"/>
      <path d="M60 60 H540 V300 Q540 350 490 350 H110 Q60 350 60 300 Z" fill="url(#pg)"/><ellipse cx="300" cy="60" rx="240" ry="26" fill="#3d3d44"/><ellipse cx="300" cy="62" rx="222" ry="18" fill="#141416"/></svg>`);
    const lid = mk('div', 'a', s.cam, { width: '520px', zIndex: 5 }, `<svg viewBox="0 0 520 120" width="520" height="120"><rect x="225" y="0" width="70" height="34" rx="14" fill="#1d1d21"/><path d="M10 100 Q260 10 510 100 Z" fill="#4a4a52"/><rect x="0" y="94" width="520" height="16" rx="8" fill="#2b2b30"/></svg>`);
    const vap = [0, 1, 2, 3, 4].map((i) => mk('div', 'a', s.cam, { width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,.75)', filter: 'blur(26px)', zIndex: 6 }));
    // la fiche recette
    const kR = L1(s.cam, 140, 230, 170, 'Recette', 'var(--ink)'), kJ = L1(s.cam, 140, 410, 150, 'du jour', 'var(--o)', true);
    kR.box.style.zIndex = 7; kJ.box.style.zIndex = 7;
    const fiche = mk('div', 'card2 a', s.cam, { width: '780px', zIndex: 7 }, '<div style="display:flex;justify-content:space-between;font:700 26px Satoshi;letter-spacing:.14em;color:rgba(28,22,18,.5);margin-bottom:6px"><span>INGRÉDIENTS</span><span>FACILE · 2 MIN</span></div>');
    // cuillère en bois qui tourne dans la casserole, bulles qui éclatent
    const cuil = mk('div', 'a', s.cam, { width: '60px', zIndex: 3 }, '<svg viewBox="0 0 60 420" width="60" height="420"><rect x="24" y="0" width="12" height="330" rx="6" fill="#c8915a"/><ellipse cx="30" cy="365" rx="26" ry="50" fill="#b97f48"/></svg>');
    const bulles = [...Array(7)].map(() => mk('div', 'a', s.cam, { width: '26px', height: '26px', borderRadius: '50%', border: '4px solid rgba(255,255,255,.8)', zIndex: 6 }));
    const ING = [['1 carrosserie Peugeot', tCa], ['1 moteur Toyota 1.0', tMo], ['1 embrayage (à vérifier)', tMo + 0.75]].map(([l, t0]) => {
      const e = mk('div', '', fiche, { display: 'flex', alignItems: 'center', gap: '14px', font: '600 38px Satoshi', color: 'var(--ink)', padding: '8px 0', borderTop: '2px dashed rgba(28,22,18,.12)' }, `<i style="flex:none;width:34px;height:34px;border-radius:9px;border:3px solid var(--o);display:flex;align-items:center;justify-content:center;font:700 22px Satoshi;color:#fff;font-style:normal"></i><span>${l}</span>`);
      e.box = e.querySelector('i'); e.t0 = t0; return e; });
    // les ingrédients qui tombent dans la casserole
    const chips = [['carrosserie Peugeot', tCa + 0.15, -1], ['moteur Toyota', tMo + 0.15, 1]].map(([l, t0, d]) => { const e = mk('div', 'pill a', s.cam, { background: '#fff', color: 'var(--ink)', fontSize: '36px', zIndex: 3, boxShadow: '0 16px 30px -12px rgba(0,0,0,.35)' }, l); e.t0 = t0; e.d = d; return e; });
    // la 107 qui sort de la casserole, puis les variantes
    const c107 = car(s.cam, P + 'p107.webp', 820), cC1 = car(s.cam, P + 'c1.webp', 330), cAy = car(s.cam, P + 'aygo.webp', 330);
    c107.style.zIndex = 2; cC1.style.zIndex = 8; cAy.style.zIndex = 8;
    const st = stamp(s.cam, 'LA 107', 'var(--o)', 130); st.style.zIndex = 9;
    const fi = mk('div', 'pill a', s.cam, { background: 'var(--ok)', color: '#fff', fontSize: '44px', zIndex: 9 }, '✓ Fiable');
    const etoiles = [...Array(9)].map((_, i) => mk('div', 'a', s.cam, { font: '700 54px Satoshi', color: i % 2 ? 'var(--o)' : '#ffc928', zIndex: 9 }, '✦'));
    const kT = L1(s.cam, 140, 260, 150, 'Tu cuisines', 'var(--ink)'), kL = L1(s.cam, 140, 430, 150, 'laquelle ?', 'var(--o)', true);
    const lab = [['Citroën C1', 300], ['Peugeot 107', 540], ['Toyota Aygo', 780]].map(([n, x]) => { const e = mk('div', 'pill a', s.cam, { background: '#fff', color: 'var(--ink)', fontSize: '30px', padding: '12px 20px', zIndex: 9, boxShadow: '0 12px 24px -10px rgba(0,0,0,.35)' }, n); e.X = x; return e; });
    const mm = mk('div', 'pill a', s.cam, { background: 'var(--ink)', color: '#fff', fontSize: '34px', zIndex: 9 }, 'Même moteur Toyota 1.0');
    const cr = cred(s, CRED);
    cue(0.05, 'pop', 0.5); cue(tCa + 0.15, 'whoosh', 0.5); cue(tCa + 0.5, 'thud', 0.6); cue(tMo + 0.15, 'whoosh', 0.5); cue(tMo + 0.5, 'thud', 0.6); cue(tMo + 0.75, 'pop', 0.6);
    cue(MU.stop, 'tapestop'); cue(tVo, 'impact'); cue(t107 + 0.05, 'ding', 0.9); cue(tFi, 'pop', 0.8); cue(tTu, 'whoosh', 0.7); cue(tLa + 0.1, 'pop', 0.7);
    const POT = { x: 540, y: 1235 };
    s.paint = (t) => {
      const rv = E(t, tVo, 0.35);                                   // la révélation
      pose(pot, t, () => ({ x: POT.x, y: POT.y + 6 * bump(t, tVo, 0.2), c: 1, s: 1 + 0.03 * bump(t, tCa + 0.5, 0.2) + 0.03 * bump(t, tMo + 0.5, 0.2) }));
      // le couvercle : posé, tremble avant la révélation, puis s'envole
      pose(lid, t, (tt) => { const sh = tt > tVo - 0.6 && tt < tVo ? 10 * Math.sin(tt * 60) * E(tt, tVo - 0.6, 0.5) : 0, up = E(tt, tVo, 0.6); if (tt > tVo + 0.7) return null; return { x: POT.x + 260 * up + sh * 0.3, y: POT.y - 160 - 2200 * up + Math.abs(sh), c: 1, r: sh * 0.4 + 70 * up }; });
      vap.forEach((v, i) => { const ph = ((t * 0.55 + i / 5) % 1), burst = E(t, tVo, 0.3), o = (0.55 * Math.sin(ph * Math.PI)) * (1 - rv) + 0.8 * burst * (1 - E(t, tVo + 0.25, 0.35));   // pose() fixe l'opacité : elle passe par o
        pose(v, t, () => (o < 0.01 ? null : { x: POT.x - 160 + i * 80 + 30 * Math.sin(t * 1.3 + i), y: POT.y - 200 - ph * 380 - burst * 200, c: 1, s: 1 + ph * 0.8 + burst * 1.5, o })); });
      // fiche recette : arrive, coche ses ingrédients, puis s'envole à la révélation
      const out = E(t, tVo - 0.05, 0.4, eIn);
      ktP(kR, t, -0.6, 'rise'); ktP(kJ, t, [-0.5], 'rise');
      kR.box.style.transform = kJ.box.style.transform = `translateY(${(-900 * out).toFixed(1)}px)`;
      pose(fiche, t, (tt) => { const p = E(tt, -0.4, 0.5); return { x: 540, y: lerp(1900, 770, p) - 1300 * out, c: 1, r: -1.5, rx: 8 * (1 - p) }; });
      pose(cuil, t, (tt) => { if (tt > tVo) return null; const a = tt * 4.2; return { x: POT.x + 150 * Math.cos(a), y: POT.y - 210 + 18 * Math.sin(a), c: 1, r: 18 * Math.cos(a) }; });
      bulles.forEach((b, i) => { const ph = (t * 1.6 + i * 0.37) % 1; pose(b, t, () => (t > tVo ? null : { x: POT.x - 180 + ((i * 97) % 360), y: POT.y - 170 - ph * 40, c: 1, s: 0.5 + ph, o: Math.sin(ph * Math.PI) * 0.9 })); });
      ING.forEach((e) => { const p = E(t, e.t0, 0.3); e.style.opacity = t < e.t0 - 0.02 ? 0 : p.toFixed(3); e.style.transform = `translateX(${(-40 * (1 - p)).toFixed(1)}px)`;
        e.box.style.background = t > e.t0 + 0.15 ? 'var(--o)' : 'transparent'; e.box.textContent = t > e.t0 + 0.15 ? '✓' : ''; });
      chips.forEach((e) => pose(e, t, (tt) => { if (tt < e.t0 - 0.02 || tt > e.t0 + 0.42) return null; const p = E(tt, e.t0, 0.38, eIn); return { x: POT.x + e.d * 220 * (1 - p), y: lerp(720, POT.y - 120, p), c: 1, r: e.d * 25 * p, s: 1 - 0.5 * p }; }));
      // la 107 sort de la casserole
      const fam = tTu - 0.1;
      pose(c107, t, (tt) => { if (tt < tVo - 0.02) return null; const p = E(tt, tVo, 0.55), q = E(tt, fam, 0.5, eIO), f = Math.max(0, tt - tVo - 0.55);
        return { x: 540 + 5 * Math.sin(f * 0.9), y: lerp(1150, 760, p) + lerp(0, 40, q) + 6 * Math.sin(f * 1.4), c: 1, s: lerp(0.35, 1, p) * lerp(1, 0.47, q), r: -6 * (1 - p) + 0.4 * Math.sin(f) }; });
      etoiles.forEach((e, i) => pose(e, t, (tt) => { if (tt < tVo || tt > tVo + 1.2) return null; const a = i / 9 * Math.PI * 2, p = E(tt, tVo, 0.8); return { x: 540 + Math.cos(a) * 420 * p, y: 760 + Math.sin(a) * 320 * p, c: 1, s: 1.2 - 0.6 * p, o: 1 - E(tt, tVo + 0.6, 0.5), r: 90 * p }; }));
      slamAt(st, t, t107, 540, 330, -4); st.style.opacity = t < t107 ? 0 : 1 - E(t, fam - 0.2, 0.2);
      pose(fi, t, (tt) => { if (tt < tFi - 0.02 || tt > fam + 0.1) return null; const p = E(tt, tFi, 0.25); return { x: 540, y: 490, c: 1, r: -3, s: 1 + 0.6 * (1 - p), o: (1 - E(tt, fam - 0.1, 0.2)) }; });
      // la question : variantes C1 et Aygo
      [[cC1, 300, -1600], [cAy, 780, 1700]].forEach(([e, x, from], i) => pose(e, t, (tt) => { const t0 = fam + 0.05 + i * 0.12; if (tt < t0 - 0.02) return null; const p = E(tt, t0, 0.45), f = Math.max(0, tt - t0); return { x: lerp(from, x, p), y: 900 + 5 * Math.sin(f * 1.6), c: 1, r: 0.3 * Math.sin(f) }; }));
      ktP(kT, t, tTu, 'slam'); ktP(kL, t, tLa, 'rise');
      lab.forEach((e, i) => pose(e, t, (tt) => { const t0 = fam + 0.25 + i * 0.1; if (tt < t0) return null; const p = E(tt, t0, 0.3), hi = bump(tt, tLa + 0.3 + i * 0.2, 0.2); return { x: e.X, y: [1030, 975, 1030][i], c: 1, s: (1 + 0.4 * (1 - p)) * (1 + 0.15 * hi), o: p * 3 }; }));
      pose(mm, t, (tt) => { if (tt < tLa + 0.1) return null; const p = E(tt, tLa + 0.1, 0.3); return { x: 540, y: 1340, c: 1, r: -2, s: 1 + 0.4 * (1 - p), o: p * 3 }; });
      cr.style.opacity = (E(t, tVo, 0.4) * 0.6).toFixed(3);   // crédits photo : seulement une fois la voiture à l'écran
    };
  };

  // =====================================================================================================
  // FI3 · « Lamborghini… mais non ! » (moins de 8 s) : on croit regarder une vidéo de supercar (vraie vidéo Pexels de
  // l'utilisateur, plein écran) ; arrêt sur image, « Mais non ! », et la vraie première revente : la Peugeot 107,
  // moteur Toyota (fiche fiabilité de l'outil, lib/analyse/fiabilite.ts : « très demandé en ville »)
  // =====================================================================================================
  SPECS.FI3 = async () => {
    const P = '../assets/photos-fi1/', L = '../assets/fi3-lambo/', NF = 103;
    const CRED = 'Vidéo Pexels n° 3066451 · Photo de la 107 : Vauxford, Wikimedia Commons (CC BY-SA 4.0), détourée · Fiche fiabilité UTOPICAR';
    // les images de la vidéo, chargées et décodées avant le premier seek (drawImage est alors synchrone)
    const IM = await Promise.all([...Array(NF)].map((_, i) => new Promise((ok) => { const im = new Image(); im.onload = () => im.decode().then(() => ok(im), () => ok(im)); im.onerror = () => ok(null); im.src = `${L}f${String(i + 1).padStart(3, '0')}.jpg`; })));
    const tLe = T('le', 1.5), tMN = T('mais', 2.2) - 0.1, tTa = T('ta', 3.1), tEl = T('elle', 4.3), tMo = T('mot', 5), tTr = T('tres', 5.9), tTu = T('tu', 6.7), tLa = T('laquelle', 7);
    // phase 1 : la Lamborghini, plein écran
    const s = S(-1, DUR + 1, '#f4ece0', { type: 'cut' }, 0.02); s.imp.push([tMN + 0.03, 34]); s.imp.push([tEl + 0.05, 20]);
    const cv = mk('canvas', 'a', s.el, { left: '0', top: '0', width: '1080px', height: '1920px', zIndex: 0 }); cv.width = 1080; cv.height = 1920; const cx = cv.getContext('2d');
    const vig = mk('div', 'a', s.el, { inset: '0', zIndex: 1, background: 'linear-gradient(rgba(0,0,0,.55), transparent 30%, transparent 70%, rgba(0,0,0,.45))' });
    const kH = L1(s.el, 140, 250, 96, 'Lamborghini Huracán', '#fff'), kR = L1(s.el, 140, 380, 170, 'le rêve.', '#fff', true);
    [kH, kR].forEach((k) => { k.box.style.zIndex = 2; k.box.style.textShadow = '0 6px 30px rgba(0,0,0,.45)'; });
    const mn = stamp(s.el, 'MAIS NON', 'var(--r)', 128); mn.style.zIndex = 5; mn.style.background = 'rgba(255,255,255,.92)';
    const creme = mk('div', 'a', s.el, { inset: '0', zIndex: 3, background: '#f4ece0' });
    // phase 2 : la vraie première revente
    s.el.appendChild(s.cam); s.cam.style.zIndex = 4;
    const kT = L1(s.cam, 140, 250, 112, 'Ta première revente,', 'var(--ink)'), kE = L1(s.cam, 140, 390, 190, "c'est elle.", 'var(--o)', true);
    const c107 = car(s.cam, P + 'p107.webp', 840);
    const pills = [['Moteur Toyota 1.0', 'var(--ink)', tMo], ['Très demandée en ville', 'var(--ok)', tTr], ['À vérifier : l’embrayage', '#b26a00', tTr + 0.45]].map(([l, bg, t0], i) => { const e = mk('div', 'pill a', s.cam, { background: bg, color: '#fff', fontSize: '40px' }, l); e.t0 = t0; e.i = i; return e; });
    // phase 3 : la question
    const kQ = L1(s.cam, 140, 250, 150, 'Tu prends', 'var(--ink)'), kQ2 = L1(s.cam, 140, 420, 150, 'laquelle ?', 'var(--o)', true);
    const vign = mk('div', 'card a', s.cam, { width: '420px', height: '300px', background: `url(${L}f072.jpg) 50% 62%/cover` });
    const lab = [['Huracán', 330], ['Peugeot 107', 740]].map(([n, x]) => { const e = mk('div', 'pill a', s.cam, { background: '#fff', color: 'var(--ink)', fontSize: '34px', boxShadow: '0 12px 24px -10px rgba(0,0,0,.35)' }, n); e.X = x; return e; });
    const bub = mk('div', 'bub2 a th', s.cam, { fontSize: '38px' }, '💬 <b>Lambo</b> ou <b>107</b> ?<small>Réponds en commentaire</small>');
    const cr = cred(s, CRED); cr.style.zIndex = 6;
    cue(MU.stop, 'tapestop'); cue(tMN, 'impact'); cue(tMN + 0.65, 'whoosh', 0.8); cue(tEl, 'thud', 0.9); cue(tMo, 'pop', 0.7); cue(tTr, 'pop', 0.7); cue(tTr + 0.45, 'pop', 0.6); cue(tTu - 0.05, 'whoosh', 0.6); cue(tLa + 0.15, 'sent', 0.7);
    const fam = tTu - 0.1, tOut = tMN + 0.62;   // tOut : la Lambo laisse la place
    s.paint = (t) => {
      // la vidéo : joue jusqu'à « Mais », puis arrêt sur image (zoom, désaturation)
      const fz = Math.min(t, tMN), idx = clamp(Math.round(fz * 30), 0, NF - 1), im = IM[idx];
      const z = 1 + 0.06 * E(t, tMN, 0.25) + 0.02 * (fz / tMN);
      if (t < tOut + 0.4 && im) { cx.save(); cx.translate(540, 960); cx.scale(z, z); cx.translate(-540, -960); cx.drawImage(im, 0, 0, 1080, 1920); cx.restore(); }
      cv.style.filter = t >= tMN ? `grayscale(${(0.85 * E(t, tMN, 0.2)).toFixed(2)}) contrast(1.1)` : '';
      cv.style.display = vig.style.display = t < tOut + 0.4 ? '' : 'none';
      ktP(kH, t, [-0.6, -0.5], 'rise', tMN - 0.05); ktP(kR, t, tLe - 0.05, 'blur', tMN - 0.05);
      slamAt(mn, t, tMN, 540, 960, -7); mn.style.opacity = t < tMN ? 0 : (1 - E(t, tOut + 0.15, 0.2)).toFixed(3);
      // le fond creme remonte comme un rideau
      const cp = E(t, tOut, 0.35, eIO); creme.style.clipPath = `inset(${((1 - cp) * 100).toFixed(2)}% 0 0 0)`; creme.style.display = t >= tOut ? '' : 'none';
      s.cam.style.visibility = t >= tOut ? '' : 'hidden';
      ktP(kT, t, tTa, 'rise', fam - 0.15); ktP(kE, t, tEl - 0.08, 'slam', fam - 0.15);
      pose(c107, t, (tt) => { if (tt < tEl - 0.3) return null; const p = E(tt, tEl - 0.25, 0.45), q = E(tt, fam, 0.5, eIO), f = Math.max(0, tt - tEl);
        return { x: lerp(540, 740, q) + 5 * Math.sin(f * 0.9), y: lerp(1900, 900, p) + lerp(0, 0, q) + 6 * Math.sin(f * 1.4), c: 1, s: lerp(1, 0.52, q), r: -8 * (1 - p) + 0.4 * Math.sin(f) }; });
      pills.forEach((e) => pose(e, t, (tt) => { if (tt < e.t0 - 0.02 || tt > fam + 0.1) return null; const p = E(tt, e.t0, 0.28); return { x: 540, y: 1150 + e.i * 92, c: 1, r: [-2, 2, -1][e.i], s: 1 + 0.4 * (1 - p), o: Math.min(1, p * 3) * (1 - E(tt, fam - 0.1, 0.2)) }; }));
      ktP(kQ, t, tTu, 'slam'); ktP(kQ2, t, tLa, 'rise');
      pose(vign, t, (tt) => { if (tt < fam) return null; const p = E(tt, fam, 0.45); return { x: lerp(-300, 330, p), y: 860, c: 1, p: 1, r: -3, rx: 4 }; });
      lab.forEach((e, i) => pose(e, t, (tt) => { const t0 = fam + 0.2 + i * 0.1; if (tt < t0) return null; const p = E(tt, t0, 0.3), hi = bump(tt, tLa + 0.2 + i * 0.25, 0.2); return { x: e.X, y: 1060, c: 1, s: (1 + 0.4 * (1 - p)) * (1 + 0.15 * hi), o: Math.min(1, p * 3) }; }));
      pose(bub, t, (tt) => { if (tt < tLa + 0.1) return null; const p = E(tt, tLa + 0.12, 0.35); return { x: 540, y: lerp(1500, 1270, p), c: 1, o: p * 2, r: -2 * (1 - p) }; });
      cr.style.opacity = t < tOut + 0.3 ? 0 : 0.6;   // le crédit nomme la 107 : caché tant que la Lambo est à l'écran
    };
  };

  // =====================================================================================================
  // BO1 à BO3 · Débuts « bénéfice d'abord », v2 (retour du 11 oct. 2026 : « moins de texte, plus de visuels, plus
  // original »). Grammaire relevée sur Behance, dans la DA UTOPICAR : collage MINI JCW (voiture découpée en autocollant,
  // ombre en trame, disque de couleur, plan au trait avec la pièce en couleur), widgets chiffrés de FinData.
  // 0 s la voiture-autocollant tombe sur le disque orange, « POV ta 1re revente » ; l'étiquette de prix se balance
  // (achat) puis se retourne (revente) ; l'étoile verte « +978 € » claque sur le drop ; le scanner UTOPICAR passe, la
  // voiture devient un plan au trait, deux repères (moteur fiable, à vérifier) ; « Ton prix max » monte sur le coup final.
  // Vraies annonces sous le marché (base UTOPICAR, oct. 2026), calcul de l'outil : revente normale = médiane des
  // comparables × 0,95 ; bénéfice = revente − prix − carte grise − 20 € ; prix max = revente − frais − 750 €.
  // =====================================================================================================
  const BO = {
    BO1: { w: 'polo', n: 'polo5', cw: 900, buy: '5 000 €', rev: '6 150 €', ben: '+978 €', pm: '5 228 €', vf: 'embrayage', pins: [[0.84, 0.44, 1], [0.7, 0.7, 0]] },
    BO2: { w: 'clio', n: 'clio3', cw: 980, buy: '3 990 €', rev: '5 100 €', ben: '+938 €', pm: '4 178 €', vf: 'injecteurs', pins: [[0.5, 0.38, 1], [0.7, 0.55, 0]] },
    BO3: { w: 'twingo', n: 'twingo', cw: 800, buy: '3 000 €', rev: '4 000 €', ben: '+828 €', pm: '3 078 €', vf: 'courroie', pins: [[0.3, 0.42, 1], [0.66, 0.58, 0]] },
  };
  const BO_CSS = `
.bo-dots{position:absolute;inset:-60px;background:radial-gradient(circle,rgba(251,249,245,.07) 2px,transparent 2.5px) 0 0/30px 30px}
.bo-disc{position:absolute;left:0;top:0;width:840px;height:840px;border-radius:50%;background:var(--o)}
.bo-car{position:absolute;left:0;top:0}
.bo-car img{display:block;width:100%;position:relative}
.bo-car .ln{position:absolute;left:0;top:0}
.bo-car .ht{position:absolute;inset:0;background:radial-gradient(circle,#0e0b09 40%,transparent 44%) 0 0/15px 15px}
.bo-sw{position:absolute;left:0;top:0;width:400px;transform-origin:50% 0}
.bo-sw .str{position:absolute;left:198px;top:0;width:4px;background:rgba(251,249,245,.9);border-radius:2px}
.bo-tg{position:absolute;left:10px;width:380px;height:300px;transform-style:preserve-3d}
.bo-tg .fc{position:absolute;inset:0;backface-visibility:hidden;clip-path:polygon(24% 0,76% 0,100% 18%,100% 100%,0 100%,0 18%);
  display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:38px;color:var(--ink)}
.bo-tg .fc:before{content:'';position:absolute;left:170px;top:22px;width:40px;height:40px;border-radius:50%;background:#141110}
.bo-tg .fc small{font:700 28px Satoshi;letter-spacing:.14em;text-transform:uppercase;opacity:.62}
.bo-tg .fc b{font:600 78px/1.05 Clash;letter-spacing:-.03em;white-space:nowrap}
.bo-tg .fr{background:#efe6d8}
.bo-tg .bk{background:var(--o);color:#1a1310;transform:rotateY(180deg)}
.bo-star{position:absolute;left:0;top:0;width:600px;height:600px}
.bo-star svg{position:absolute;inset:0;overflow:visible;filter:drop-shadow(0 40px 50px rgba(0,0,0,.45))}
.bo-star .lb{position:absolute;left:0;right:0;top:350px;text-align:center;font:400 54px Instrument;font-style:italic;color:#0e0b09}
.bo-pin{position:absolute;width:0;height:0}
.bo-pin .dot{position:absolute;left:-26px;top:-26px;width:52px;height:52px;border-radius:50%;border:5px solid #fff;display:flex;align-items:center;justify-content:center;font:900 28px Satoshi;color:#fff;box-shadow:0 10px 24px rgba(0,0,0,.4)}
.bo-pin .rg{position:absolute;left:-26px;top:-26px;width:52px;height:52px;border-radius:50%;border:4px solid}
.bo-pin .ld{position:absolute;left:-2px;width:4px;background:#fff;border-radius:2px}
.bo-pin .lab{position:absolute;white-space:nowrap;padding:16px 26px;border-radius:999px;font:700 36px Satoshi;box-shadow:0 20px 40px -14px rgba(0,0,0,.55)}
.bo-pin.ok .dot,.bo-pin.ok .lab{background:#3ccf7a;color:#0e0b09}.bo-pin.ok .rg{border-color:#3ccf7a}
.bo-pin.wa .dot,.bo-pin.wa .lab{background:var(--o);color:#1a1310}.bo-pin.wa .rg{border-color:var(--o)}
.bo-scan{position:absolute;top:-90px;width:8px;margin-left:-4px;border-radius:4px;background:var(--o);box-shadow:0 0 30px 8px rgba(255,90,31,.7),0 0 90px 30px rgba(255,90,31,.25)}
.bo-scan span{position:absolute;left:50%;top:-58px;transform:translateX(-50%);padding:8px 18px;border-radius:999px;background:var(--o);color:#1a1310;font:700 26px Satoshi;letter-spacing:.06em;white-space:nowrap}
.bo-bar{position:absolute;left:0;top:0;width:830px;height:140px;border-radius:999px;background:#fff;display:flex;align-items:center;gap:16px;padding:0 14px 0 20px;box-shadow:0 40px 80px -24px rgba(0,0,0,.65)}
.bo-bar img{width:96px;height:96px;border-radius:20px;flex:none}
.bo-bar .tx{flex:1;overflow:hidden;white-space:nowrap;font:700 38px Satoshi;color:var(--ink)}.bo-bar .tx i{font-style:normal;opacity:.45;font-weight:500}
.bo-bar .go{flex:none;padding:26px 30px;border-radius:999px;background:var(--o);color:#1a1310;font:700 36px Satoshi}
.bo-pm{position:absolute;left:0;top:0;width:780px;padding:26px 40px 30px;border-radius:40px;background:#fff;color:var(--ink);box-shadow:0 50px 100px -30px rgba(0,0,0,.6)}
.bo-pm .hd{display:flex;justify-content:space-between;align-items:center;font:500 30px Satoshi;color:rgba(28,22,18,.6)}
.bo-pm .hd b{color:var(--o);font-weight:700}.bo-pm .hd i{font-style:normal;font:700 26px Satoshi;color:#fff;background:var(--ink);border-radius:999px;padding:8px 18px}
.bo-pm .rw{position:relative;height:118px;margin-top:10px;font:700 40px Satoshi;display:flex;align-items:center}
`;
  const star = (n, R, r) => { let d = ''; for (let i = 0; i < 2 * n; i++) { const a = -Math.PI / 2 + (i * Math.PI) / n, q = i % 2 ? r : R; d += (i ? 'L' : 'M') + (300 + q * Math.cos(a)).toFixed(1) + ' ' + (300 + q * Math.sin(a)).toFixed(1); } return d + 'Z'; };
  for (const id of Object.keys(BO)) SPECS[id] = () => {
    if (!document.getElementById('bo-css')) { const st = mk('style', '', document.head, null, BO_CSS); st.id = 'bo-css'; }
    // avec la voix de Simon, chaque geste tombe sur son mot ; sans voix (mots vides), le minutage de l'animatic
    const vo = BODY.length > 0, d = BO[id], CY = 960;
    // ordre « bénéfice d'abord » (voix : « Fais 978 de bénef avec ça ! Polo, 5 000. Revendue 6 150… ») : l'étoile verte claque
    // dès l'image 0 et le compteur s'arrête sur « 978 », puis l'étiquette (achat), son revers (revente), le scanner, le prix max
    const tStar = -0.15, tLand = vo ? T('de', T(d.ben.replace(/\D/g, ''))) : 0.7;   // le compteur s'arrête quand Simon finit le nombre
    const tTag = vo ? T(d.w) - 0.16 : 1.5, tCorner = Math.max(tTag - 0.4, tLand + 0.45), tFlip0 = 2.25;
    const tPaste = vo ? T('colles') - 0.15 : 2.9, tGo = vo ? T('utopicar') + 0.1 : 3.3;
    // l'analyse est la source : après le clic, le scanner passe, la barre devient « Analyse UTOPICAR ✓ », puis chaque
    // résultat tombe sur son mot (revente : l'étiquette se retourne, moteur fiable, à vérifier, prix max)
    const tFlip = vo ? T('reven', tGo) - 0.04 : tFlip0, tBadge = vo ? T('analys', tGo) - 0.1 : 3.4;
    const tOut = vo ? tGo : 2.85, tTagOut = vo ? T('moteur', tGo) - 0.25 : tOut, tS0 = vo ? tGo + 0.15 : 3.45, dS = vo ? 0.7 : 0.95, tPM = vo ? T('prix', tGo) - 0.4 : 4.5;
    const tW = vo ? [T('fiable'), T(d.vf)] : [0, 0];
    const s = S(-1, DUR + 1, '#141110', { type: 'cut' }, 0.03); s.imp.push([0.15, 18], [tLand, 26], [MU.hit, 14]);
    s.el.insertBefore(mk('div', 'bo-dots', s.el), s.cam);
    const disc = mk('div', 'bo-disc a', s.cam);
    // ---------- la voiture-autocollant (photo, plan au trait, ombre en trame, repères, scanner) ----------
    const box = mk('div', 'bo-car a', s.cam, { width: d.cw + 'px' });
    const src = `../assets/hooks-cut/${d.n}-sticker.png`;
    const ht = mk('div', 'ht', box, { WebkitMask: `url(${src}) 0 0/100% 100% no-repeat`, mask: `url(${src}) 0 0/100% 100% no-repeat` });
    const ph = mk('img', '', box); ph.src = src;
    const ln = mk('img', 'ln', box); ln.src = `../assets/hooks-cut/${d.n}-line.png`;
    const scan = mk('div', 'bo-scan', box, null, '<span>UTOPICAR</span>');
    const pins = d.pins.map(([fx, fy, ok]) => {
      const up = fy < 0.6, right = fx > 0.6, L = up ? 120 : 90;
      const p = mk('div', 'bo-pin ' + (ok ? 'ok' : 'wa'), box, { left: fx * 100 + '%', top: fy * 100 + '%' });
      const ld = mk('div', 'ld', p, up ? { bottom: '0px' } : { top: '0px' });
      const rg = mk('div', 'rg', p), dot = mk('div', 'dot', p, null, ok ? '✓' : '!');
      const lab = mk('div', 'lab', p, { [right ? 'right' : 'left']: '-34px', [up ? 'bottom' : 'top']: L + 'px' }, ok ? 'Moteur fiable' : `À vérifier : ${d.vf}`);
      return { fx, up, right, L, p, ld, rg, dot, lab, tc: null };
    });
    // ---------- contexte, étiquette, étoile, prix max ----------
    const pov = mk('div', 'pill a', s.cam, { background: 'var(--o)', color: '#1a1310', fontSize: '30px', padding: '8px 18px', letterSpacing: '.12em' }, 'POV');
    const k1 = L1(s.cam, 140, 300, 92, 'Ta 1re revente', '#fff'); k1.box.style.textShadow = '0 6px 28px rgba(0,0,0,.6)';
    const sw = mk('div', 'bo-sw a', s.cam), LS = 470;
    mk('div', 'str', sw, { height: LS + 30 + 'px' });
    const tg = mk('div', 'bo-tg', sw, { top: LS + 'px' }, `<div class="fc fr"><small>achat</small><b>${d.buy}</b></div><div class="fc bk"><small>UTOPICAR · revente</small><b>${d.rev}</b></div>`);
    const st = mk('div', 'bo-star a', s.cam, null, `<svg viewBox="0 0 600 600"><path d="${star(14, 300, 252)}" fill="#3ccf7a" stroke="#fff" stroke-width="14" stroke-linejoin="round"/></svg><div class="lb">de bénef</div>`);
    const RB = ROLL(st, 0, 196, 136, '+000 €', d.ben, '#0e0b09'); RB.box.style.left = (300 - RB.box.offsetWidth / 2) + 'px';
    // « Tu colles l'annonce dans UTOPICAR » : la barre d'analyse monte, le lien s'écrit, clic sur « Analyser »
    const bar = mk('div', 'bo-bar a', s.cam, null, `<img src="../assets/brand/official/utopicar-icone-orange.svg"><div class="tx"><span class="ba">Annonce <i>· ${d.w[0].toUpperCase() + d.w.slice(1)} · ${d.buy}</i></span><span class="bb">Analyse <b style="color:var(--o)">UTOPICAR</b> ✓</span></div><div class="go">Analyser</div>`);
    const bA = bar.querySelector('.ba'), bB = bar.querySelector('.bb');
    const btx = bar.querySelector('.tx'), bgo = bar.querySelector('.go');
    cue(tPaste, 'whoosh', 0.5); cue(tPaste + 0.25, 'type', 0.7); cue(tGo, 'click', 1);
    const pm = mk('div', 'bo-pm a', s.cam, null, '<div class="hd"><span>Analyse <b>UTOPICAR</b></span><i>⏱ 1 min</i></div><div class="rw">Ton prix max</div>');
    const RP = ROLL(pm.querySelector('.rw'), 0, 4, 110, '0 000 €', d.pm, 'var(--o)'); RP.box.style.left = (700 - RP.box.offsetWidth) + 'px';
    // ---------- sons ----------
    cue(0.1, 'thud', 1); cue(tTag, 'whoosh', 0.45); cue(tTag + 0.36, 'click', 0.7);
    cue(tFlip, 'whoosh', 0.5); cue(tFlip + 0.22, 'pop', 0.7); cue(0.02, 'roll', 1); cue(tLand, 'impact', 0.9); cue(tCorner, 'whoosh', 0.6);
    cue(vo ? tTagOut : tOut, 'whoosh', 0.7); cue(tS0, 'roll', 0.5); cue(tBadge, 'ding', 0.5); cue(tPM - 0.05, 'whoosh', 0.6); cue(tPM + 0.05, 'roll', 0.8);
    // instant où le scanner passe sur chaque repère
    const scanF = (t) => eIO(clamp((t - tS0) / dS, 0, 1));
    pins.forEach((q, i) => { for (let t = tS0; t < tS0 + dS + 0.01; t += 1 / 240) if ((-50 + (d.cw + 100) * scanF(t)) / d.cw >= q.fx) { q.tc = t; break; } q.tc = Math.max(q.tc, tW[i] - 0.05); cue(q.tc, 'pop', 0.8); });
    s.P.push((t) => {
      // fond : disque orange qui respire avec la musique, s'efface pendant l'analyse
      const pd = E(t, -0.3, 0.55);
      pose(disc, t, () => ({ x: 540, y: CY, c: 1, s: (0.35 + 0.65 * pd) * (1 + 0.015 * pulse(t)), o: 1 - 0.75 * E(t, tS0 - 0.1, 0.6) }));
      // voiture : déjà là à l'image 0, elle claque (zoom × 1,4 → 1) à 0,15 s, flotte, se redresse pour l'analyse
      const pf = E(t, -0.12, 0.27, eIn), land = Math.max(0, t - 0.15), rs = E(t, tOut, 0.6, eIO);
      pose(box, t, () => ({ x: 530, y: lerp(CY + 120, CY, pf) + 6 * Math.sin(land * 1.6) - 40 * rs, c: 1, r: lerp(-9, -3, pf) + 0.6 * Math.sin(land * 1.2) + 3 * rs, s: (1 + 0.4 * (1 - pf)) * (1 + 0.05 * bump(t, 0.15, 0.12)) * (1 + 0.05 * rs) }));
      ht.style.transform = `translate(${(22 - 10 * rs).toFixed(1)}px,${(30 - 10 * rs).toFixed(1)}px)`;
      // scanner : la photo laisse place au plan au trait
      const ps = scanF(t), bx = -50 + (d.cw + 100) * ps, f = clamp(bx / d.cw, 0, 1) * 100;
      ph.style.clipPath = `inset(0 0 0 ${f.toFixed(2)}%)`; ln.style.clipPath = `inset(0 ${(100 - f).toFixed(2)}% 0 0)`; ht.style.opacity = (1 - 0.7 * ps).toFixed(3);
      scan.style.display = t > tS0 - 0.05 && t < tS0 + dS + 0.25 ? '' : 'none';
      scan.style.left = bx.toFixed(1) + 'px'; scan.style.height = box.offsetHeight + 180 + 'px'; scan.style.opacity = (1 - E(t, tS0 + dS, 0.22)).toFixed(3);
      for (const q of pins) {
        const on = t >= q.tc - 0.01; q.p.style.display = on ? '' : 'none'; if (!on) continue;
        const u = t - q.tc;
        q.dot.style.transform = `scale(${clamp(spring(u, 'snappy'), 0, 2).toFixed(3)})`;
        const rp = (u % 0.9) / 0.9; q.rg.style.transform = `scale(${(1 + 1.8 * rp).toFixed(3)})`; q.rg.style.opacity = (0.9 * (1 - rp)).toFixed(3);
        q.ld.style.height = (q.L * E(t, q.tc + 0.06, 0.25)).toFixed(1) + 'px';
        const pl = E(t, q.tc + 0.18, 0.35);
        q.lab.style.opacity = Math.min(1, pl * 3).toFixed(3); q.lab.style.transform = `translateY(${((q.up ? 30 : -30) * (1 - pl)).toFixed(1)}px) scale(${(0.7 + 0.3 * spring(u - 0.18, 'snappy')).toFixed(3)})`;
        q.lab.style.transformOrigin = `${q.right ? '100%' : '0%'} ${q.up ? '100%' : '0%'}`;
      }
      // contexte
      slamAt(pov, t, -0.5, 190, 255, -3); ktP(k1, t, [-0.6, -0.5, -0.45], 'rise');
      // étiquette : descend au bout de sa ficelle, se balance, se retourne, remonte
      const pt = E(t, tTag, 0.42), po = E(t, tTagOut - 0.05, 0.4, eIn), u0 = Math.max(0, t - tTag - 0.3), u1 = Math.max(0, t - tFlip);
      const th = 11 * Math.exp(-2.4 * u0) * Math.sin(7.5 * u0 + 0.6) * (t > tTag + 0.3 ? 1 : 0) + 7 * Math.exp(-3 * u1) * Math.sin(9 * u1) * (t > tFlip ? 1 : 0);
      pose(sw, t, () => (t < tTag - 0.05 ? null : { x: 520, y: -40 - 900 * (1 - pt) - 1100 * po, r: th - 4 }));
      const fl = E(t, tFlip, 0.42, eOut);
      tg.style.transform = `perspective(1400px) rotateY(${(180 * fl).toFixed(2)}deg) scale(${(1 + 0.08 * Math.sin(Math.PI * fl)).toFixed(4)})`;
      // étoile verte : claque à tStar, le bénéfice roule jusqu'au drop, puis part se coller en haut à gauche
      const mv = E(t, tCorner, 0.5, eIO);
      pose(st, t, (tt) => (tt < tStar - 0.01 ? null : { x: lerp(540, 255, mv), y: lerp(CY + 20, 520, mv), c: 1, r: lerp(-8, -12, mv) + 2 * Math.sin(Math.max(0, tt - tLand) * 1.4), s: (1 + 1.2 * (1 - E(tt, tStar, 0.3))) * (1 + 0.1 * bump(tt, tLand, 0.2)) * lerp(1, 0.4, mv) }));
      st.querySelector('svg').style.transform = `rotate(${(t * 12).toFixed(2)}deg)`;
      rollP(RB, t, 0, tLand - 0.12, 0.04);
      // barre d'analyse : monte, le lien s'écrit, clic, puis elle descend quand le scanner part
      pose(bar, t, (tt) => (tt < tPaste - 0.05 || tt > tPM + 0.45 ? null : { x: 530, y: lerp(1500, 1330, E(tt, tPaste, 0.45)) + 40 * E(tt, tPM - 0.1, 0.4), c: 1, r: -1.5 * (1 - E(tt, tPaste, 0.5)), s: 1 + 0.06 * bump(tt, tBadge, 0.2), o: 1 - E(tt, tPM - 0.05, 0.3) }));
      const sw2 = t >= tBadge; bA.style.display = sw2 ? 'none' : ''; bB.style.display = sw2 ? '' : 'none'; bgo.textContent = sw2 ? '⏱ 1 min' : 'Analyser';
      btx.style.clipPath = `inset(0 ${(100 - 100 * E(t, tPaste + 0.25, 0.55, (p) => p)).toFixed(1)}% 0 0)`;
      pm.querySelector('.hd i').style.transform = `scale(${(1 + 0.25 * bump(t, vo ? T('minute', tPM) - 0.1 : 99, 0.25)).toFixed(3)})`;
      bgo.style.transform = `scale(${(1 - 0.12 * bump(t, tGo, 0.12)).toFixed(3)})`; bgo.style.background = t >= tGo ? '#1c1612' : ''; bgo.style.color = t >= tGo ? '#fff' : '';
      // carte « Ton prix max » : monte, le prix roule jusqu'au coup final
      rise(pm, t, tPM, 530, 1340, -1.5);
      rollP(RP, t, tPM + 0.08, MU.hit - tPM - 0.2, 0.05);
    });
    // vidéo complète (avec la voix) : « Trois analyses offertes avec le code TIKTOK. Lien en bio ! », carton orange et logo
    if (vo) { const tF = T('trois', tPM); endCard(tF - 0.12, 'var(--o)', [['3 analyses', 250, 170, '#fff', false, tF], ['offertes', 430, 190, 'var(--ink)', true, T('offertes', tF)], ['avec le code TIKTOK', 640, 80, '#fff', false, T('code', tF)]],
      'Code <b style="color:var(--o)">TIKTOK</b> · lien en bio', tF + 0.35, { type: 'circle', x: 530, y: 1340 }); }
  };

  // =====================================================================================================
  // S1V1 à S2V7 · les 14 vidéos des semaines du 12 et du 19 oct. 2026 (concept « l'analyse sort tout », planches
  // video/renders/maquette-hooks/planche-7-videos*.png). Un seul moteur, une config par vidéo : voitures-autocollants,
  // étoiles de bénéfice, étiquettes, barre UTOPICAR (« tu colles l'annonce »), scanner, repères, carte prix max,
  // tampons, bulles, compteur, ticket, puis le carton « 3 analyses offertes · code TIKTOK » avec le logo.
  // Chaque geste est calé sur un mot de Simon (T). Chiffres : vraies annonces de la base du marché, formule de l'outil
  // (bilan.ts) hors travaux probables, d'où la mention à l'écran.
  // =====================================================================================================
  const SEM_CSS = `
.sm-tk{position:absolute;left:0;top:0;width:830px;padding:26px 40px 30px;border-radius:40px;background:#fff;color:var(--ink);box-shadow:0 50px 100px -30px rgba(0,0,0,.6)}
.sm-tk .h{display:flex;justify-content:space-between;align-items:center;font:500 30px Satoshi;color:rgba(28,22,18,.6);margin-bottom:6px}.sm-tk .h b{color:var(--o);font-weight:700}
.sm-tk .h i{font-style:normal;font:700 26px Satoshi;color:#fff;background:var(--ink);border-radius:999px;padding:8px 18px}
.sm-tk .r{display:flex;justify-content:space-between;padding:14px 0;border-bottom:2px dashed rgba(28,22,18,.13);font:500 38px Satoshi;color:rgba(28,22,18,.75);white-space:nowrap}.sm-tk .r b{font:600 44px Clash;color:var(--ink)}
.sm-tk .t{display:flex;justify-content:space-between;align-items:baseline;margin-top:16px;font:700 40px Satoshi;white-space:nowrap}.sm-tk .t b{font:700 100px/1 Clash;letter-spacing:-.03em}
.sm-odo{position:absolute;left:0;top:0;width:800px;height:300px;border-radius:40px;background:#0b0908;border:8px solid #2a2420;box-shadow:0 40px 80px -20px rgba(0,0,0,.7)}
.sm-odo small{position:absolute;right:40px;bottom:46px;font:700 44px Satoshi;color:#ffb38f}
.sm-big{position:absolute;left:0;top:0;font:600 92px/1 Clash;letter-spacing:-.03em;white-space:nowrap;background:rgba(20,17,16,.82);padding:14px 26px 18px;border-radius:26px;box-shadow:0 20px 40px -14px rgba(0,0,0,.6)}
.sm-vs{position:absolute;left:0;top:0;width:150px;height:150px;border-radius:50%;background:#fff;color:var(--ink);font:700 64px Clash;display:flex;align-items:center;justify-content:center;box-shadow:0 20px 40px rgba(0,0,0,.5)}
.sm-demo{position:absolute;left:140px;top:410px;font:700 26px Satoshi;color:rgba(255,255,255,.7);background:rgba(0,0,0,.45);padding:8px 16px;border-radius:12px;white-space:nowrap}
.sm-strike{position:absolute;left:30px;right:30px;bottom:86px;height:10px;border-radius:5px;background:var(--r);transform-origin:0 50%}
`;
  const zero = (v) => v.replace(/\d/g, '0');
  const TA = (keys, after = 0) => { for (const w of BODY) if (w.s >= after - 0.01 && keys.some((k) => { const kn = norm(k); return /^\d{1,2}$/.test(kn) ? w.n === kn : w.n.startsWith(kn); })) return w.s; return after; };   // « 3 » seul : pas « 3100 »
  const SEM = {};
  function semaine(c) {
    if (!document.getElementById('bo-css')) { const st = mk('style', '', document.head, null, BO_CSS); st.id = 'bo-css'; }
    if (!document.getElementById('sm-css')) { const st = mk('style', '', document.head, null, SEM_CSS); st.id = 'sm-css'; }
    const s = S(-1, DUR + 1, '#141110', { type: 'cut' }, 0.03), P = [];
    s.el.insertBefore(mk('div', 'bo-dots', s.el), s.cam);
    const tGo = (c.goT ?? TA(['utopicar', 'utopic', 'utopik'], c.goAfter ?? 0)) + 0.1, tPaste = TA(['coll'], c.goAfter ?? 0) - 0.15, tF = c.endT ?? (() => { const a = TA(['trois'], tGo + 0.5); return a > tGo + 0.5 ? a : TA(['3'], tGo + 0.5); })();   // « trois » d'abord : « 3 000 » ne déclenche pas la fin
    const tBadge = c.badge ?? tGo + 0.7, tS0 = c.scanT ?? tGo + 0.15, dS = 0.7, scanF = (t) => eIO(clamp((t - tS0) / dS, 0, 1));
    s.imp.push([0.15, 16], [tGo, 20]);
    // fond : disque (orange ; rouge quand le verdict est négatif), qui s'efface pendant l'analyse
    const disc = mk('div', 'bo-disc a', s.cam);
    P.push((t) => { const pd = E(t, -0.3, 0.55); disc.style.background = c.disc ? c.disc(t) : c.red && t >= c.red ? 'var(--r)' : 'var(--o)';
      pose(disc, t, () => ({ x: 540, y: 960, c: 1, s: (0.35 + 0.65 * pd) * (1 + 0.015 * pulse(t)), o: 1 - (c.noFade ? 0 : 0.75 * E(t, tS0 - 0.1, 0.6)) })); });
    // contexte (image 0)
    const pov = mk('div', 'pill a', s.cam, { background: 'var(--o)', color: '#1a1310', fontSize: '30px', padding: '8px 18px', letterSpacing: '.12em' }, 'POV');
    const k1 = L1(s.cam, 140, 300, 92, c.title || 'Ta 1re revente', '#fff'); k1.box.style.textShadow = '0 6px 28px rgba(0,0,0,.6)';
    if (c.pov === false) pov.style.display = 'none';
    P.push((t) => { if (c.pov !== false) slamAt(pov, t, -0.5, 190, 255, -3); ktP(k1, t, [-0.6, -0.5, -0.45, -0.4], 'rise', c.titleOut ?? null, 'up'); });
    // voitures
    const cars = (c.cars || []).map((k) => {
      const box = mk('div', 'bo-car a', s.cam, { width: k.cw + 'px' }), src = `../assets/hooks-cut/${k.n}-sticker.png`;
      const ht = mk('div', 'ht', box, { WebkitMask: `url(${src}) 0 0/100% 100% no-repeat`, mask: `url(${src}) 0 0/100% 100% no-repeat` });
      const ph = mk('img', '', box); ph.src = src; const ln = mk('img', 'ln', box); ln.src = `../assets/hooks-cut/${k.n}-line.png`;
      const scan = k.scan ? mk('div', 'bo-scan', box, null, '<span>UTOPICAR</span>') : null;
      const pins = (k.pins || []).map(([fx, fy, kind, lab, w]) => {
        const up = fy < 0.6, right = fx > 0.6, L = up ? 120 : 90;
        const p = mk('div', 'bo-pin ' + kind, box, { left: fx * 100 + '%', top: fy * 100 + '%' });
        const ld = mk('div', 'ld', p, up ? { bottom: '0px' } : { top: '0px' }), rg = mk('div', 'rg', p), dot = mk('div', 'dot', p, null, kind === 'ok' ? '✓' : kind === 'ko' ? '✕' : '!');
        const lb = mk('div', 'lab', p, { [right ? 'right' : 'left']: '-34px', [up ? 'bottom' : 'top']: L + 'px' }, lab);
        let tc = w - 0.05; if (k.scan) for (let t = tS0; t < tS0 + dS + 0.01; t += 1 / 240) if ((-50 + (k.cw + 100) * scanF(t)) / k.cw >= fx) { tc = Math.max(t, w - 0.05); break; }
        cue(tc, 'pop', 0.8); return { up, right, L, p, ld, rg, dot, lb, tc };
      });
      if (k.from === 'slam') cue(k.tin + 0.05, 'thud', 1); else cue(k.tin, 'whoosh', 0.6);
      if (k.tout != null) cue(k.tout, 'whoosh', 0.5);
      if (k.scan) cue(tS0, 'roll', 0.5);
      P.push((t) => {
        const slam = k.from === 'slam', pf = slam ? E(t, k.tin - 0.12, 0.27, eIn) : E(t, k.tin, 0.45), po = k.tout != null ? E(t, k.tout, 0.42, eIn) : 0;
        const hide = t < k.tin - (slam ? 0.2 : 0.05) || po >= 1;
        pose(box, t, () => { if (hide) return null; let x = k.x, y = k.y, sc = 1, r = k.r ?? -3; const u = Math.max(0, t - k.tin);
          if (slam) { y = lerp(k.y + 120, k.y, pf); sc = 1 + 0.4 * (1 - pf); r = lerp(r - 6, r, pf); }
          else if (k.from === 'left') x = lerp(-800, k.x, pf); else if (k.from === 'right') x = lerp(1880, k.x, pf); else y = lerp(-900, k.y, pf);
          if (k.to === 'left') x -= 1500 * po; else if (k.to === 'right') x += 1500 * po; else if (k.to === 'up') y -= 1800 * po; else y += 1600 * po;
          const rs = k.scan ? E(t, tS0 - 0.3, 0.5, eIO) : 0;
          return { x, y: y + 6 * Math.sin(u * 1.6) - 30 * rs, c: 1, r: r + 0.6 * Math.sin(u * 1.2) + (k.scan ? 3 * rs : 0), s: sc * (1 + 0.05 * bump(t, k.tin + 0.15, 0.12)) * (k.s ?? 1) };
        });
        if (hide) return;
        const f = k.line ? 100 : k.scan ? clamp((-50 + (k.cw + 100) * scanF(t)) / k.cw, 0, 1) * 100 : 0;
        ph.style.clipPath = `inset(0 0 0 ${f.toFixed(2)}%)`; ln.style.clipPath = `inset(0 ${(100 - f).toFixed(2)}% 0 0)`; ht.style.opacity = (1 - 0.007 * f).toFixed(3);
        ht.style.transform = 'translate(20px,28px)';
        if (scan) { const bx = -50 + (k.cw + 100) * scanF(t); scan.style.display = t > tS0 - 0.05 && t < tS0 + dS + 0.25 ? '' : 'none'; scan.style.left = bx.toFixed(1) + 'px'; scan.style.height = box.offsetHeight + 180 + 'px'; scan.style.opacity = (1 - E(t, tS0 + dS, 0.22)).toFixed(3); }
        for (const q of pins) {
          const on = t >= q.tc - 0.01; q.p.style.display = on ? '' : 'none'; if (!on) continue; const u = t - q.tc;
          q.dot.style.transform = `scale(${clamp(spring(u, 'snappy'), 0, 2).toFixed(3)})`;
          const rp = (u % 0.9) / 0.9; q.rg.style.transform = `scale(${(1 + 1.8 * rp).toFixed(3)})`; q.rg.style.opacity = (0.9 * (1 - rp)).toFixed(3);
          q.ld.style.height = (q.L * E(t, q.tc + 0.06, 0.25)).toFixed(1) + 'px';
          const pl = E(t, q.tc + 0.18, 0.35); q.lb.style.opacity = Math.min(1, pl * 3).toFixed(3);
          q.lb.style.transform = `translateY(${((q.up ? 30 : -30) * (1 - pl)).toFixed(1)}px) scale(${(0.7 + 0.3 * spring(u - 0.18, 'snappy')).toFixed(3)})`; q.lb.style.transformOrigin = `${q.right ? '100%' : '0%'} ${q.up ? '100%' : '0%'}`;
        }
      });
      return box;
    });
    // étiquettes de prix (ficelle, balancement, retournement, prix barré)
    for (const g of c.tags || []) {
      const sw = mk('div', 'bo-sw a', s.cam), LS = g.ls ?? 470; mk('div', 'str', sw, { height: LS + 30 + 'px' });
      const tg = mk('div', 'bo-tg', sw, { top: LS + 'px' }, `<div class="fc fr"><small>${g.front[0]}</small><b>${g.front[1]}</b></div>` + (g.back ? `<div class="fc bk"><small>${g.back[0]}</small><b>${g.back[1]}</b></div>` : ''));
      const sk = g.strike ? mk('div', 'sm-strike', tg.firstChild) : null;
      cue(g.t, 'whoosh', 0.45); cue(g.t + 0.36, 'click', 0.7); if (g.flip) { cue(g.flip, 'whoosh', 0.5); cue(g.flip + 0.22, 'pop', 0.7); } if (g.strike) cue(g.strike, 'pop', 0.8); if (g.out) cue(g.out, 'whoosh', 0.6);
      P.push((t) => {
        const pt = E(t, g.t, 0.42), po = g.out ? E(t, g.out - 0.05, 0.4, eIn) : 0, u0 = Math.max(0, t - g.t - 0.3), u1 = g.flip ? Math.max(0, t - g.flip) : 0;
        const th = 11 * Math.exp(-2.4 * u0) * Math.sin(7.5 * u0 + 0.6) * (t > g.t + 0.3 ? 1 : 0) + (g.flip ? 7 * Math.exp(-3 * u1) * Math.sin(9 * u1) * (t > g.flip ? 1 : 0) : 0);
        pose(sw, t, () => (t < g.t - 0.05 ? null : { x: g.x ?? 520, y: -40 - 900 * (1 - pt) - 1100 * po, r: th - 4 }));
        const fl = g.flip ? E(t, g.flip, 0.42) : 0;
        tg.style.transform = `perspective(1400px) rotateY(${(180 * fl).toFixed(2)}deg) scale(${(1 + 0.08 * Math.sin(Math.PI * fl)).toFixed(4)})`;
        if (sk) sk.style.transform = `rotate(-8deg) scaleX(${E(t, g.strike, 0.3).toFixed(3)})`;
      });
    }
    // étoiles de bénéfice (roulent jusqu'au mot, puis se collent dans un coin ou sortent)
    for (const z of c.stars || []) {
      const st = mk('div', 'bo-star a', s.cam, null, `<svg viewBox="0 0 600 600"><path d="${star(14, 300, 252)}" fill="${z.color || '#3ccf7a'}" stroke="#fff" stroke-width="14" stroke-linejoin="round"/></svg><div class="lb">${z.lab ?? 'de bénef'}</div>`);
      const RB = ROLL(st, 0, 196, z.size ?? 136, z.land != null ? zero(z.v) : z.v, z.v, '#0e0b09'); RB.box.style.left = (300 - RB.box.offsetWidth / 2) + 'px';
      if (z.strike) mk('div', 'sm-strike', st, { left: '110px', right: '110px', bottom: 'auto', top: '262px' });
      cue(Math.max(0.02, z.t), 'pop', 0.9); if (z.land != null) { cue(Math.max(0.02, z.t + 0.02), 'roll', 1); cue(z.land, 'impact', 0.9); s.imp.push([z.land, 24]); }
      if (z.corner) cue(z.corner.t, 'whoosh', 0.6);
      P.push((t) => {
        const mv = z.corner ? E(t, z.corner.t, 0.5, eIO) : 0, po = z.out ? E(t, z.out, 0.4, eIn) : 0, cx = z.corner?.x ?? 255, cy = z.corner?.y ?? 520, cs = z.corner?.s ?? 0.4;
        pose(st, t, (tt) => (tt < z.t - 0.01 || po >= 1 ? null : { x: lerp(z.x ?? 540, cx, mv), y: lerp(z.y ?? 980, cy, mv) + 1400 * po, c: 1, r: lerp(z.r ?? -8, -12, mv) + 2 * Math.sin(Math.max(0, tt - (z.land ?? z.t)) * 1.4),
          s: (1 + 1.2 * (1 - E(tt, z.t, 0.28))) * (1 + 0.1 * bump(tt, z.land ?? z.t + 0.2, 0.2)) * lerp(z.s ?? 1, cs, mv) }));
        st.querySelector('svg').style.transform = `rotate(${(t * 12).toFixed(2)}deg)`;
        if (z.land != null) rollP(RB, t, Math.max(0, z.t), Math.max(0.3, z.land - z.t - 0.12), 0.04);
        if (z.strike) st.lastChild.style.transform = `rotate(-8deg) scaleX(${E(t, z.strike, 0.3).toFixed(3)})`;
      });
    }
    // barre UTOPICAR : « tu colles l'annonce », clic sur Analyser, puis « Analyse UTOPICAR ✓ » jusqu'à la carte
    if (c.bar !== false) {
      const bar = mk('div', 'bo-bar a', s.cam, null, `<img src="../assets/brand/official/utopicar-icone-orange.svg"><div class="tx"><span class="ba">Annonce <i>· ${c.ann}</i></span><span class="bb">Analyse <b style="color:var(--o)">UTOPICAR</b> ✓</span></div><div class="go">Analyser</div>`);
      const btx = bar.querySelector('.tx'), bgo = bar.querySelector('.go'), bA = bar.querySelector('.ba'), bB = bar.querySelector('.bb'), tOff = c.barOff ?? (c.card ? c.card.t : tF - 0.3);
      cue(tPaste, 'whoosh', 0.5); cue(tPaste + 0.25, 'type', 0.7); cue(tGo, 'click', 1); cue(tBadge, 'ding', 0.5);
      P.push((t) => {
        pose(bar, t, (tt) => (tt < tPaste - 0.05 || tt > tOff + 0.45 ? null : { x: 530, y: lerp(1500, c.barY ?? 1330, E(tt, tPaste, 0.45)) + 40 * E(tt, tOff - 0.1, 0.4), c: 1, r: -1.5 * (1 - E(tt, tPaste, 0.5)), s: 1 + 0.06 * bump(tt, tBadge, 0.2), o: 1 - E(tt, tOff - 0.05, 0.3) }));
        btx.style.clipPath = `inset(0 ${(100 - 100 * E(t, tPaste + 0.25, 0.55, (p) => p)).toFixed(1)}% 0 0)`;
        const sw2 = t >= tBadge; bA.style.display = sw2 ? 'none' : ''; bB.style.display = sw2 ? '' : 'none'; bgo.textContent = sw2 ? '⏱ 1 min' : 'Analyser';
        bgo.style.transform = `scale(${(1 - 0.12 * bump(t, tGo, 0.12)).toFixed(3)})`; bgo.style.background = t >= tGo ? '#1c1612' : ''; bgo.style.color = t >= tGo ? '#fff' : '';
      });
    }
    // carte « Ton prix max » (ou autre chiffre final)
    if (c.card) {
      const k = c.card, pm = mk('div', 'bo-pm a', s.cam, null, `<div class="hd"><span>Analyse <b>UTOPICAR</b></span><i>⏱ 1 min</i></div><div class="rw">${k.lab}</div>`);
      const RP = ROLL(pm.querySelector('.rw'), 0, 4, 110, zero(k.v), k.v, k.color || 'var(--o)'); RP.box.style.left = (700 - RP.box.offsetWidth) + 'px';
      cue(k.t - 0.05, 'whoosh', 0.6); cue(k.t + 0.05, 'roll', 0.8);
      P.push((t) => { rise(pm, t, k.t, 530, k.y ?? 1340, -1.5); rollP(RP, t, k.t + 0.08, Math.max(0.3, k.hit - k.t - 0.2), 0.05); });
    }
    // tampons, grands textes, VS, compteur, ticket, bulles, mention démo
    for (const m of c.stamps || []) { const e = stamp(s.cam, m.txt, m.color, m.size ?? 120); cue(m.t, 'impact', 0.7); s.imp.push([m.t, 18]); P.push((t) => { if (m.out && t > m.out) { e.style.display = 'none'; return; } slamAt(e, t, m.t, m.x, m.y, m.r ?? -8); }); }
    for (const b of c.bigs || []) { const e = mk('div', 'sm-big a', s.cam, { color: b.color || '#fff', fontSize: (b.size ?? 92) + 'px' }, b.txt); cue(b.t, 'pop', 0.6);
      P.push((t) => pose(e, t, (tt) => (tt < b.t - 0.02 || (b.out && tt > b.out + 0.3) ? null : { x: b.x ?? 140, y: (b.y ?? 1400) + 60 * (1 - E(tt, b.t, 0.4)) + (b.out ? 900 * E(tt, b.out, 0.3, eIn) : 0), o: E(tt, b.t, 0.25) * 1.5, s: 1 + 0.05 * bump(tt, b.t + 0.3, 0.2) }))); }
    if (c.vs) { const e = mk('div', 'sm-vs a', s.cam, null, 'VS'); cue(c.vs.t, 'pop', 0.8); P.push((t) => { if (c.vs.out && t > c.vs.out) { e.style.display = 'none'; return; } slamAt(e, t, c.vs.t, 540, c.vs.y ?? 960, 0); }); }
    if (c.odo) {
      const o = c.odo, e = mk('div', 'sm-odo a', s.cam, null, '<small>km</small>'), R = ROLL(e, 40, 52, 170, zero(o.km), o.km, '#ffb38f');
      R.box.style.left = (330 - R.box.offsetWidth / 2) + 'px'; R.box.style.textShadow = '0 0 30px rgba(255,90,31,.6)'; cue(o.t + 0.02, 'roll', 0.9);
      P.push((t) => { pose(e, t, (tt) => (tt < o.t - 0.05 || (o.out && tt > o.out + 0.4) ? null : { x: 540, y: (o.y ?? 760) + (o.out ? 1500 * E(tt, o.out, 0.4, eIn) : 0), c: 1, r: -2, s: (o.s ?? 1) * (1 + 0.3 * (1 - E(tt, o.t, 0.3))) })); rollP(R, t, o.t + 0.05, o.d ?? 0.9, 0.05); });
    }
    if (c.ticket) {
      const k = c.ticket, tk = mk('div', 'sm-tk a', s.cam, null, `<div class="h"><span>Analyse <b>UTOPICAR</b></span><i>⏱ 1 min</i></div>` + k.rows.map(([a, b]) => `<div class="r"><span>${a}</span><b>${b}</b></div>`).join('') + `<div class="t"><span>${k.tot[0]}</span><b style="color:${k.tot[2] || 'var(--o)'}">${k.tot[1]}</b></div>`);
      const rows = [...tk.querySelectorAll('.r')], tot = tk.querySelector('.t');
      k.rows.forEach((r) => cue(r[2], 'pop', 0.55)); cue(k.tot[3], 'impact', 0.8); cue(k.t - 0.05, 'whoosh', 0.6);
      P.push((t) => { rise(tk, t, k.t, 530, k.y ?? 1300, -1.5);
        rows.forEach((el, i) => { const p = E(t, k.rows[i][2], 0.32); el.style.opacity = (0.16 + 0.84 * p).toFixed(3); el.style.transform = `translateX(${(26 * (1 - p)).toFixed(1)}px)`; });
        const p = E(t, k.tot[3], 0.3); tot.style.opacity = p.toFixed(3); tot.style.transform = `scale(${(1 + 0.3 * (1 - p) + 0.07 * bump(t, k.tot[3] + 0.3, 0.18)).toFixed(3)})`; tot.style.transformOrigin = '100% 50%'; });
    }
    for (const b of c.msgs || []) { const f = bubble(s.cam, b.y, b.txt, b.me, b.t); P.push((t) => { if (b.out && t > b.out) { f(-99); return; } f(t); }); }
    if (c.demo) mk('div', 'sm-demo a', s.cam, { left: '140px', top: '410px' }, c.demo);
    if (c.extra) c.extra(s, P, { tGo, tF });   // scènes propres à une vidéo (recherche automatique, e-mail…)
    s.P.push((t) => P.forEach((f) => f(t)));
    // fin : « 3 analyses offertes avec le code TIKTOK », logo
    if (c.end) endCard(tF - 0.12, 'var(--o)', c.end.lines(tF), c.end.pill, tF + 0.35, { type: 'circle', x: 530, y: c.endY ?? 1340 });
    else endCard(tF - 0.12, 'var(--o)', [['3 analyses', 250, 170, '#fff', false, tF], ['offertes', 430, 190, 'var(--ink)', true, TA(['offert'], tF)], ['avec le code TIKTOK', 640, 80, '#fff', false, TA(['code'], tF)]],
      'Code <b style="color:var(--o)">TIKTOK</b> · lien en bio', tF + 0.35, { type: 'circle', x: 530, y: c.endY ?? 1340 });
    return { cars, tGo, tF };
  }
  const MEN = 'Exemple calculé avec l\'outil, hors travaux';
  // ---------- semaine du 12 oct. ----------
  SEM.S1V1 = () => {   // « Jusqu'à 2 048 de bénef avec ces 5 voitures » : compte à rebours, la n° 1 en dernier
    const L = [['twingo', 760, 'Twingo', '+698 €', 'twingo'], ['corsa', 900, 'Corsa', '+1 564 €', 'corsa'], ['polo5', 900, 'Polo', '+1 598 €', 'polo'], ['clio3g', 900, 'Clio', '+1 748 €', 'essence'], ['clio3', 900, 'Clio', '+2 048 €', 'diesel']];
    const ts = L.map(([, , , , w], i) => (i === 3 ? TA(['clio'], 9) : i === 4 ? TA(['diesel'], 12) - 0.4 : TA([w], 2.5)) - 0.15);
    const lands = [TA(['698']), TA(['1564']), TA(['1598']), TA(['1748']), TA(['2048'], 13)].map((x) => x + 0.45);
    const tC = TA(['coll'], 15);
    return { ann: 'Clio · 2 500 €', goAfter: 15, demo: MEN,
      cars: L.map(([n, cw], i) => ({ n, cw, x: 530, y: 940, r: i % 2 ? 3 : -3, tin: ts[i], tout: i < 4 ? ts[i + 1] - 0.05 : undefined, from: i === 0 ? 'slam' : i % 2 ? 'right' : 'left', to: i % 2 ? 'left' : 'right' })),
      stars: [{ v: '+2 048 €', t: -0.15, land: TA(['de'], 0.6), x: 540, y: 1000, corner: { t: ts[0] - 0.35, x: 255, y: 520, s: 0.38 }, lab: 'jusqu\'à' },
        ...L.map(([, , , v], i) => ({ v, t: lands[i] - 0.55, land: lands[i], x: 800, y: 1230, s: 0.55, out: i < 4 ? ts[i + 1] - 0.05 : tC - 0.3, r: 6 }))],
      bigs: L.map(([, , nom], i) => ({ txt: `<span style="color:var(--o)">${5 - i}</span> · ${nom}${i === 3 ? ' essence' : i === 4 ? ' diesel' : ''}`, x: 140, y: 1290, t: ts[i] + 0.1, out: i < 4 ? ts[i + 1] - 0.05 : tC - 0.3, size: 80 })),
      stamps: [{ txt: 'N° 1', color: 'var(--o)', x: 760, y: 830, t: TA(['numero'], 10) , r: 8, size: 110, out: tC - 0.3 }], bar: true, barOff: TA(['trois', '3'], 17) - 0.3 };
  };
  SEM.S1V2 = () => ({ ann: 'Twingo · 2 800 €', demo: MEN,   // deux Twingo : la moins chère rapporte moins
    cars: [{ n: 'twingo', cw: 470, x: 290, y: 760, r: -6, tin: -0.1, from: 'slam', tout: TA(['comment']) - 0.1, to: 'left' },
      { n: 'twingo', cw: 470, x: 790, y: 760, r: 6, tin: TA(['celle']) - 0.2, from: 'right', tout: TA(['coll']) - 0.4, to: 'up' },
      { n: 'twingo', cw: 760, x: 530, y: 780, r: 0, tin: TA(['coll']) - 0.3, from: 'up', scan: true, pins: [[0.3, 0.42, 'ok', 'Moteur fiable', TA(['fiable'])], [0.66, 0.58, 'wa', 'À vérifier : embrayage', TA(['embray'])]] }],
    stars: [{ v: '+298 €', t: TA(['298']) - 0.5, land: TA(['298']) + 0.4, x: 290, y: 1290, s: 0.55, color: '#cfc7bd', out: TA(['comment']) - 0.1 },
      { v: '+1 098 €', t: TA(['1098']) - 0.5, land: TA(['1098']) + 0.45, x: 790, y: 1290, s: 0.55, corner: { t: TA(['coll']) - 0.4, x: 255, y: 520, s: 0.4 } }],
    vs: { t: TA(['celle']) - 0.1, y: 880, out: TA(['coll']) - 0.4 }, card: { lab: 'Ton prix max', v: '3 100 €', t: TA(['prix'], 9) - 0.4, hit: TA(['3100']) + 0.3 } });
  SEM.S1V3 = () => ({ ann: 'Clio · 2 500 €', demo: MEN,   // 192 000 km et +2 048 €
    cars: [{ n: 'clio3', cw: 900, x: 530, y: 830, tin: -0.1, from: 'slam', scan: true, pins: [[0.5, 0.38, 'ok', 'Moteur fiable', TA(['fiable'])], [0.7, 0.55, 'wa', 'À vérifier : injecteurs', TA(['inject'])]] }],
    odo: { km: '192 000', t: -0.1, y: 1350, s: 0.7, d: 1.0, out: TA(['2048']) - 0.3 },
    stars: [{ v: '+2 048 €', t: TA(['2048']) - 0.2, land: TA(['de'], 2.6) + 0.1, x: 540, y: 1000, corner: { t: TA(['coll']) - 0.5, x: 255, y: 520, s: 0.4 } }],
    card: { lab: 'Ton prix max', v: '3 750 €', t: TA(['prix'], 8) - 0.4, hit: TA(['3750']) + 0.3 } });
  SEM.S1V4 = () => ({ ann: 'Polo · 4 500 €', demo: MEN,   // Polo trop chère de 350 €
    cars: [{ n: 'polo5', cw: 880, x: 530, y: 860, tin: -0.1, from: 'slam', scan: true, pins: [[0.62, 0.62, 'ok', 'Boîte manuelle : ok', TA(['manuel'])]] }],
    tags: [{ front: ['achat', '4 500 €'], x: 520, t: 0.15, strike: TA(['max'], 6) + 0.2 }],
    stamps: [{ txt: '+350 € trop chère', color: 'var(--r)', x: 540, y: 1330, t: TA(['trop']) + 0.1, r: -4, size: 84, out: TA(['coll']) - 0.3 }],
    card: { lab: 'Ton prix max', v: '4 150 €', t: TA(['prix'], 6) - 0.4, hit: TA(['4150']) + 0.3 } });
  SEM.S1V5 = () => ({ ann: '208 · 3 990 €', red: TA(['fuir']) - 0.4,   // 208 PureTech : à fuir
    cars: [{ n: 'p208i', cw: 820, x: 530, y: 830, tin: -0.1, from: 'slam', scan: true, pins: [[0.3, 0.36, 'ko', 'Moteur PureTech : à fuir', TA(['pure', 'motor']) + 0.1]] }],
    tags: [{ front: ['achat', '3 990 €'], x: 520, t: 0.2, out: TA(['coll']) - 0.2 }],
    bigs: [{ txt: 'Courroie <span style="color:var(--r)">dans l\'huile</span>', x: 140, y: 1150, t: TA(['courroie']) - 0.1, size: 70, out: TA(['trois', '3'], 9) - 0.4 }],
    stamps: [{ txt: 'PASSE', color: 'var(--r)', x: 540, y: 880, t: TA(['passe'], 8) - 0.05, r: -8, size: 170 }], barOff: TA(['passe'], 8) - 0.2 });
  SEM.S1V6 = () => ({ ann: 'Clio 4 · 3 000 €',   // Clio 4 à 3 000 : trop beau ?
    cars: [{ n: 'clio4', cw: 900, x: 530, y: 850, tin: -0.1, from: 'slam', scan: true, pins: [[0.45, 0.4, 'wa', 'Pourquoi ce prix ?', TA(['pourquoi'])]] }],
    tags: [{ front: ['achat', '3 000 €'], x: 520, t: 0.25, out: TA(['coll']) - 0.2 }],
    bigs: [{ txt: 'Les mêmes : <span style="color:var(--o)">6 800 €</span>', x: 140, y: 1190, t: TA(['memes']) - 0.1, size: 80, out: TA(['coll']) - 0.3 }],
    stamps: [{ txt: 'Trop beau ?', color: '#fff', x: 540, y: 1370, t: TA(['trop']) - 0.05, r: -6, size: 110, out: TA(['coll']) - 0.3 }],
    ticket: { t: TA(['vois']) - 0.3, rows: [['Voir la voiture', '✓', TA(['voiture'], 7)], ['Carte grise', '✓', TA(['carte'], 7)]], tot: ['Avant de payer', 'Rien', 'var(--r)', TA(['payer'])], y: 1270 }, barOff: TA(['vois']) - 0.3 });
  SEM.S1V7 = () => ({ ann: 'Clio · 3 250 €', demo: MEN,   // 3 250 € en poche
    bigs: [{ txt: '<span style="color:var(--o)">3 250 €</span> en poche', x: 140, y: 1290, t: -0.1, size: 96, out: TA(['coll']) - 0.3 }],
    cars: [{ n: 'clio3g', cw: 880, x: 530, y: 850, tin: -0.1, from: 'slam', scan: true, pins: [[0.42, 0.4, 'ok', 'Moteur fiable', TA(['fiable'])], [0.7, 0.62, 'wa', 'À prévoir : distribution', TA(['distrib'])]] }],
    stars: [{ v: '+798 €', t: TA(['fait']) - 0.2, land: TA(['de'], 3) + 0.1, x: 760, y: 780, s: 0.6, corner: { t: TA(['coll']) - 0.5, x: 255, y: 520, s: 0.4 } }],
    card: { lab: 'Ton prix max', v: '3 250 €', t: TA(['prix'], 7) - 0.4, hit: TA(['3250'], 8) + 0.3 }, bigs2: true,
    stamps: [{ txt: 'Pas 1 € de plus', color: '#fff', x: 540, y: 1150, t: TA(['pas'], 9) - 0.05, r: -5, size: 80 }] });
  // ---------- semaine du 19 oct. ----------
  SEM.S2V1 = () => ({ ann: 'Polo · données de démo', demo: 'Données de démonstration', red: TA(['186']) - 0.2,   // 1 sur 10 : compteur trafiqué
    odo: { km: '86 000', t: -0.1, y: 820, d: 0.8, out: TA(['coll']) - 0.4 },
    stamps: [{ txt: '1 sur 10', color: 'var(--r)', x: 540, y: 1250, t: TA(['10', 'dix']) - 0.05, r: -7, size: 130, out: TA(['coll']) - 0.4 }, { txt: 'PASSE', color: 'var(--r)', x: 540, y: 1150, t: TA(['passe'], 9) - 0.05, r: -8, size: 170 }],
    cars: [{ n: 'polo6', cw: 860, x: 530, y: 780, tin: TA(['coll']) - 0.3, from: 'up', scan: true, pins: [[0.32, 0.4, 'ko', 'Compteur : 186 000 ≠ 86 000', TA(['186'])]] }],
    bigs: [{ txt: 'HistoVec d\'abord', x: 140, y: 1330, t: TA(['passe'], 9) + 0.3, size: 80 }], barOff: TA(['passe'], 9) - 0.2 });
  SEM.S2V2 = () => ({ ann: 'Twingo auto · 7 490 €', demo: MEN, red: TA(['quick']) - 0.2,   // boîte automatique : −2 242 €
    cars: [{ n: 'twingo', cw: 780, x: 530, y: 830, r: 0, tin: -0.1, from: 'slam', scan: true, tout: TA(['dsg']) - 0.6, to: 'left', pins: [[0.5, 0.82, 'ko', 'Boîte Quickshift : à éviter', TA(['quick'])]] },
      { n: 'polo5', cw: 860, x: 530, y: 830, tin: TA(['dsg']) - 0.5, from: 'right', line: true, pins: [[0.6, 0.66, 'ko', 'DSG : à éviter', TA(['eviter'], TA(['dsg']))]] }],
    tags: [{ front: ['achat', '7 490 €'], x: 520, t: 0.2, out: TA(['coll']) - 0.2 }],
    stars: [{ v: '−2 242 €', t: TA(['moins']) - 0.3, land: TA(['2242']) + 0.4, x: 540, y: 1000, color: '#ff4d4d', lab: 'à la revente', corner: { t: TA(['dsg']) - 0.6, x: 255, y: 520, s: 0.4 } }],
    bigs: [{ txt: 'Prends-la en <span style="color:var(--g)">manuelle</span>', x: 140, y: 1330, t: TA(['prend']) - 0.1, size: 76 }], barOff: TA(['prend']) - 0.3 });
  SEM.S2V3 = () => ({ ann: 'Clio · 2 000 €', demo: MEN, goAfter: 10,   // ce qui te reste vraiment
    cars: [{ n: 'clio3', cw: 900, x: 530, y: 780, tin: -0.1, from: 'slam' }],
    stars: [{ v: '+1 750 €', t: TA(['1750']) - 0.4, land: TA(['1750']) + 0.45, x: 540, y: 940, lab: 'de bénef ?', strike: TA(['non']), out: TA(['carte']) - 0.1 }],
    ticket: { t: TA(['carte']) - 0.3, y: 1190, rows: [['Revente − achat', '+1 750 €', TA(['carte']) - 0.1], ['Carte grise', '−152 €', TA(['grise'])], ['Frais fixes', '−150 €', TA(['frais'])], ['Distribution à prévoir', '−? €', TA(['distrib'])]], tot: ['Il te reste', '+1 448 €', 'var(--ok,#137036)', TA(['1448'])] },
    bar: true, barY: 1330, barOff: TA(['trois', '3'], 13) - 0.3, scanT: 99 });
  SEM.S2V4 = () => ({ ann: 'Polo · 6 200 €', demo: MEN,   // « dernier prix »
    cars: [{ n: 'polo5', cw: 860, x: 530, y: 860, tin: -0.1, from: 'slam', tout: TA(['coll']) - 0.3, to: 'down' }],
    msgs: [{ txt: '6 200 €, dernier prix.', me: false, y: 520, t: TA(['dernier']) - 0.15, out: TA(['coll']) - 0.3 }],
    ticket: { t: TA(['ouvre']) - 0.4, y: 1000, rows: [['Tu ouvres à', '3 850 €', TA(['3850'])], ['Tu vises', '4 000 €', TA(['vise'])]], tot: ['Ton prix max', '4 100 €', 'var(--o)', TA(['4100'])] },
    stamps: [{ txt: 'Au-dessus : passe', color: '#fff', x: 540, y: 600, t: TA(['passe'], 7) - 0.05, r: -6, size: 100 }], barOff: TA(['ouvre']) - 0.4 });
  SEM.S2V5 = () => ({ ann: 'Clio · 4 990 €', demo: MEN, red: TA(['perd']) - 0.2,   // petit kilométrage, gros piège
    cars: [{ n: 'clio3', cw: 880, x: 530, y: 830, tin: -0.1, from: 'slam', scan: true }],
    odo: { km: '86 000', t: TA(['86']) - 0.2, y: 1330, s: 0.6, d: 0.7, out: TA(['coll']) - 0.4 },
    tags: [{ front: ['achat', '4 990 €'], x: 520, t: TA(['main']) - 0.1, strike: TA(['max'], 9) + 0.1 }],
    stars: [{ v: '−1 192 €', t: TA(['perd']) - 0.3, land: TA(['192'], 8) + 0.4, x: 540, y: 1000, color: '#ff4d4d', lab: 'à ce prix', corner: { t: TA(['ton'], 9.5) - 0.3, x: 255, y: 520, s: 0.4 } }],
    bigs: [{ txt: 'Revente : <span style="color:var(--o)">4 100 €</span>', x: 140, y: 1150, t: TA(['revente']) - 0.1, size: 70, out: TA(['perd']) - 0.3 }],
    card: { lab: 'Ton prix max', v: '3 000 €', t: TA(['ton'], 9.5) - 0.3, hit: TA(['000'], 11) + 0.3 } });
  SEM.S2V6 = () => ({ ann: 'Clio 4 · 7 000 €', demo: MEN,   // la vraie affaire
    cars: [{ n: 'clio4', cw: 900, x: 530, y: 850, tin: -0.1, from: 'slam', scan: true, pins: [[0.45, 0.4, 'ok', 'Moteur fiable', TA(['fiable'])], [0.72, 0.62, 'ok', '42 350 km, 1re main', TA(['revente'])]] }],
    tags: [{ front: ['achat', '7 000 €'], x: 520, t: TA(['main']) - 0.1, back: ['UTOPICAR · revente', '8 750 €'], flip: TA(['8'], 6.8) - 0.1, out: TA(['plus']) - 0.2 }],
    stars: [{ v: '+1 448 €', t: TA(['plus']) - 0.3, land: TA(['1448']) + 0.45, x: 540, y: 1000 }],
    stamps: [{ txt: 'FONCE', color: '#3ccf7a', x: 540, y: 1330, t: TA(['fonce']) - 0.05, r: -8, size: 150 }], barOff: TA(['fonce']) - 0.2 });
  SEM.S2V7 = () => ({ ann: 'messages d\'exemple', demo: 'Messages d\'exemple', red: TA(['arnaque']) - 0.3, noFade: true,   // les 3 messages d'un arnaqueur
    msgs: [{ txt: 'Je suis à l\'étranger 🙏', me: false, y: 540, t: 0.0, out: TA(['coll']) - 0.3 }, { txt: 'Je vous la fais livrer', me: false, y: 760, t: TA(['fais']) - 0.25, out: TA(['coll']) - 0.3 }, { txt: 'Un petit acompte ?', me: false, y: 980, t: TA(['un']) - 0.15, out: TA(['coll']) - 0.3 }],
    ticket: { t: TA(['arnaque']) - 0.5, y: 900, rows: [['Vendeur à l\'étranger', '⚠', TA(['arnaque']) - 0.3], ['Livraison sans visite', '⚠', TA(['arnaque']) - 0.1], ['Acompte avant visite', '⚠', TA(['arnaque']) + 0.1]], tot: ['Verdict', 'Arnaque', 'var(--r)', TA(['classique'])] },
    bigs: [{ txt: 'Rien avant d\'avoir <span style="color:var(--o)">vu</span>', x: 140, y: 1260, t: TA(['paie']) - 0.1, size: 76 }], barOff: TA(['arnaque']) - 0.5 });
  // ---------- présentation en 5 vidéos (oct. 2026) : fin « Achète juste. Revends mieux. » + logo + lien en bio ----------
  const FIN = { lines: (tF) => [['Achète juste.', 260, 130, '#fff', false, tF], ['Revends mieux.', 420, 130, 'var(--ink)', true, tF + 0.3]], pill: 'lien en bio' };
  const DEMO_P = 'Données de démonstration';
  // annonce collectée par une recherche suivie (carte sombre + verdict)
  const ANN = [['Volkswagen Golf VII', '2016 · 112 000 km', '9 490 €', 'GO', 'var(--ok)', '+1 180 €'], ['Volkswagen Golf VII', '2015 · 168 000 km', '8 990 €', 'NO GO', 'var(--r)', ''],
    ['Volkswagen Golf VII', '2017 · 96 000 km', '11 200 €', 'GO', 'var(--ok)', '+940 €'], ['Volkswagen Golf VII', '2014 · 201 000 km', '7 450 €', 'NO GO', 'var(--r)', ''],
    ['Volkswagen Golf VII', '2016 · 134 000 km', '9 990 €', 'NO GO', 'var(--r)', ''], ['Volkswagen Golf VII', '2018 · 88 000 km', '12 490 €', 'GO', 'var(--ok)', '+1 310 €'],
    ['Volkswagen Golf VII', '2015 · 145 000 km', '8 750 €', 'NO GO', 'var(--r)', ''], ['Volkswagen Golf VII', '2016 · 121 000 km', '9 200 €', 'NO GO', 'var(--r)', '']];
  const annCard = (cam, a, showV) => mk('div', 'a', cam, { width: '800px', padding: '22px 30px', borderRadius: '28px', background: '#1b1612', color: '#f4f1ec', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 24px 44px -16px rgba(0,0,0,.7)', border: '1.5px solid rgba(244,241,236,.1)' },
    `<div><div style="font:700 34px Satoshi">${a[0]}</div><div style="font:500 26px Satoshi;opacity:.55;margin-top:4px">${a[1]} · ${a[2]}</div></div>` + (showV ? `<div style="text-align:right"><b class="vd" style="font:700 28px Satoshi;padding:10px 18px;border-radius:14px;background:${a[4]};color:#fff;white-space:nowrap">${a[3]}</b>${a[5] ? `<div class="mg" style="font:700 30px Satoshi;color:#3ccf7a;margin-top:10px">${a[5]}</div>` : ''}</div>` : ''));
  const rechCard = (cam) => mk('div', 'a', cam, { width: '800px', padding: '28px 34px', borderRadius: '32px', background: '#fff', color: 'var(--ink)', boxShadow: '0 40px 80px -30px rgba(0,0,0,.6)' },
    `<div style="display:flex;justify-content:space-between;font:500 28px Satoshi;opacity:.6"><span>Recherche suivie · <b style="color:var(--o)">UTOPICAR</b></span><span>⟳</span></div><div style="font:700 46px Satoshi;margin-top:6px">Volkswagen Golf VII</div><div style="display:flex;gap:14px;margin-top:16px;font:600 28px Satoshi"><span style="padding:8px 18px;border-radius:999px;background:rgba(28,22,18,.07)">toutes les heures</span><span style="padding:8px 18px;border-radius:999px;background:rgba(19,112,54,.12);color:var(--ok)">● active</span></div>`);
  const mailCard = (cam) => mk('div', 'a', cam, { width: '820px', borderRadius: '34px', background: '#fff', color: 'var(--ink)', overflow: 'hidden', boxShadow: '0 50px 90px -30px rgba(0,0,0,.65)' },
    `<div style="display:flex;gap:18px;align-items:center;padding:26px 32px;border-bottom:1px solid rgba(28,22,18,.08)"><img src="../assets/brand/official/utopicar-icone-orange.svg" style="width:64px;height:64px;border-radius:16px"><div><div style="font:500 28px Satoshi;opacity:.55"><b style="opacity:1;color:var(--ink)">UTOPICAR</b> · 07:00</div><div style="font:700 38px Satoshi;margin-top:2px">3 annonces GO ce matin</div></div></div>`
    + [['Golf VII · 2016 · 9 490 €', '+1 180 €'], ['Golf VII · 2017 · 11 200 €', '+940 €'], ['Golf VII · 2018 · 12 490 €', '+1 310 €']].map(([m, g]) => `<div class="ml" style="display:flex;justify-content:space-between;align-items:center;padding:20px 32px;border-bottom:1px solid rgba(28,22,18,.06);font:500 30px Satoshi"><span>${m}</span><b style="color:var(--ok)">${g}</b></div>`).join(''));
  SEM.P1 = () => ({ ann: '208 · 7 190 €', demo: DEMO_P, pov: false, title: 'Ce prix ment.', end: FIN, endT: TA(['passe'], 16) + 0.75,   // le prix affiché cache la vraie facture
    cars: [{ n: 'p208', cw: 860, x: 530, y: 860, tin: -0.1, from: 'slam', pins: [[0.12, 0.42, 'wa', 'Courroie à changer', TA(['courroie'])], [0.24, 0.78, 'wa', 'Pneus à prévoir', TA(['pneu'])], [0.8, 0.72, 'wa', 'Carte grise', TA(['carte'])]] }],
    tags: [{ front: ['affiché', '7 190 €'], back: ['vraie facture', '8 840 €'], flip: TA(['8'], 9) - 0.15, x: 470, t: 0.6, out: TA(['coll']) - 0.2 }],
    card: { lab: 'Ton prix max', v: '6 300 €', t: TA(['ton'], 13) - 0.3, hit: TA(['300'], 14) + 0.3 },
    stamps: [{ txt: 'Au-dessus : PASSE', color: '#fff', x: 540, y: 1130, t: TA(['dessus']) - 0.05, r: -6, size: 90 }] });
  SEM.P2 = () => ({ ann: 'Clio 4 · 6 900 €', demo: DEMO_P, pov: false, title: 'Tu l\'aurais achetée ?', end: FIN, endT: TA(['5900']) + 0.9, red: TA(['rate']) - 0.05,   // le oui qui coûte 1 650 €
    cars: [{ n: 'clio4', cw: 880, x: 530, y: 850, tin: -0.1, from: 'slam', scan: true, pins: [[0.24, 0.45, 'wa', 'Embrayage à changer', TA(['utopic'])], [0.76, 0.66, 'wa', 'Pneus + vidange', TA(['utopic'])]] }],
    tags: [{ front: ['annonce', '6 900 €'], x: 470, t: TA(['clio']) - 0.1, out: TA(['coll']) - 0.2 }],
    stamps: [{ txt: 'OUI ✓', color: '#3ccf7a', x: 540, y: 1250, t: TA(['oui']) - 0.05, r: -6, size: 130, out: TA(['rate']) - 0.05 },
      { txt: '−1 650 € de travaux', color: '#fff', x: 540, y: 1250, t: TA(['1650']) - 0.05, r: -5, size: 80, out: TA(['coll']) - 0.3 }],
    card: { lab: 'Négocie à', v: '5 900 €', t: TA(['verdict']) - 0.3, hit: TA(['5900']) + 0.3 } });
  SEM.P3 = () => {   // trois annonces, une seule rapporte
    const c1 = TA(['celle']), c2 = TA(['celle'], c1 + 0.5), c3 = TA(['celle'], c2 + 0.5);
    return { ann: 'Clio · 4 990 €', demo: DEMO_P, pov: false, title: '3 annonces. 1 seule rapporte.', end: FIN, endT: TA(['minute']) + 0.8,
      cars: [{ n: 'twingo', cw: 640, x: 530, y: 840, r: -3, tin: -0.1, from: 'slam', tout: c2 - 0.1, to: 'left' },
        { n: 'polo5', cw: 860, x: 530, y: 840, r: 3, tin: c2 - 0.05, from: 'right', tout: c3 - 0.1, to: 'left' },
        { n: 'clio3g', cw: 880, x: 530, y: 840, r: -2, tin: c3 - 0.05, from: 'right', scan: true, pins: [[0.45, 0.4, 'ok', 'Moteur fiable', TA(['utopic'])], [0.72, 0.64, 'ok', 'Marge : +1 240 €', TA(['utopic'])]] }],
      stamps: [{ txt: 'NON', color: 'var(--r)', x: 540, y: 1250, t: TA(['non']) - 0.05, r: -8, size: 150, out: c2 - 0.1 }, { txt: 'NON PLUS', color: 'var(--r)', x: 540, y: 1250, t: TA(['non'], c2) - 0.05, r: 6, size: 130, out: c3 - 0.1 }],
      stars: [{ v: '+1 240 €', t: TA(['plus'], c3) - 0.2, land: TA(['1240']) + 0.45, x: 640, y: 1230, s: 0.7, corner: { t: TA(['coll']) - 0.5, x: 255, y: 575, s: 0.4 } }] };
  };
  SEM.P4 = () => {   // pendant que tu dormais : la recherche suivie tourne seule, l'e-mail de 7 h
    const tR = TA(['recherche']), tH = TA(['heures']), t7 = TA(['7'], 7), tM = TA(['mail']), tT = TA(['trois'], 9), tA = TA(['appeler']);
    return { bar: false, pov: false, title: 'Pendant que tu dormais…', demo: DEMO_P, end: FIN, endT: tA + 0.85, goT: tT - 0.1, scanT: 99, titleOut: tR - 0.2,
      disc: (t) => (t < t7 - 0.1 ? '#22305e' : 'var(--o)'),
      extra: (s, P) => {
        const clk = mk('div', 'sm-big a', s.cam, { color: '#fff', fontSize: '150px', background: 'rgba(20,17,16,.6)' }, '03:12');
        const rc = rechCard(s.cam), cards = ANN.slice(0, 4).map((a) => annCard(s.cam, a, true)), ml = mailCard(s.cam), rows = [...ml.querySelectorAll('.ml')];
        const tc = cards.map((_, i) => tH - 0.3 + i * 0.26);
        cue(0.4, 'pop', 0.7); cue(tR - 0.05, 'whoosh', 0.6); cue(tR + 0.35, 'click', 0.8); tc.forEach((x) => cue(x, 'pop', 0.6)); cue(t7, 'roll', 0.8); cue(tM - 0.05, 'ding', 1); rows.forEach((_, i) => cue(tT + 0.15 + i * 0.25, 'pop', 0.7));
        P.push((t) => {
          const hm = t < t7 ? Math.min(6 * 60 + 59, 3 * 60 + 12 + Math.floor(E(t, 0.6, t7 - 0.8, (p) => p) * (3 * 60 + 47))) : 7 * 60;
          clk.textContent = `${String(Math.floor(hm / 60)).padStart(2, '0')}:${String(hm % 60).padStart(2, '0')}`; clk.style.color = t >= t7 ? 'var(--o)' : '#fff';
          pose(clk, t, (tt) => (tt > tM + 0.3 ? null : { x: 540, y: (tt < tR - 0.2 ? 960 : 560) + 40 * (1 - E(tt, -0.4, 0.4)), c: 1, s: (tt < tR - 0.2 ? 1.25 : 0.62) * (1 + 0.12 * bump(tt, t7, 0.2)), o: 1 - E(tt, tM, 0.25) }));
          pose(rc, t, (tt) => (tt < tR - 0.05 || tt > tM + 0.3 ? null : { x: 540, y: 820 + 300 * (1 - E(tt, tR, 0.45)), c: 1, r: -1.5, o: E(tt, tR, 0.3) * 2 * (1 - E(tt, tM, 0.25)), s: 1 + 0.04 * bump(tt, tR + 0.35, 0.14) }));
          cards.forEach((e, i) => pose(e, t, (tt) => { if (tt < tc[i] - 0.02 || tt > tM + 0.3) return null; const p = E(tt, tc[i], 0.35), k = cards.filter((_, j) => tc[j] <= tt).length - 1 - i;
            return { x: 540, y: lerp(2000, 1040 + k * 112, p), c: 1, r: (i % 2 ? 1.5 : -1.5) * (1 - p), o: 1 - E(tt, tM, 0.25) }; }));
          pose(ml, t, (tt) => (tt < tM - 0.05 ? null : { x: 540, y: lerp(-500, 940, E(tt, tM, 0.45)), c: 1, r: -1.5, s: 1 + 0.05 * bump(tt, tT, 0.2) }));
          rows.forEach((r, i) => { const p = E(t, tT + 0.15 + i * 0.25, 0.3); r.style.opacity = (0.15 + 0.85 * p).toFixed(3); r.style.transform = `translateX(${(30 * (1 - p)).toFixed(1)}px)`; });
        });
      },
      stamps: [{ txt: 'Appelle.', color: '#fff', x: 540, y: 1360, t: TA(['plus'], 11) - 0.05, r: -6, size: 110 }] };
  };
  SEM.P5 = () => {   // tu scrolles encore ? la recherche suivie trie à ta place
    const tD = TA(['deux']), tMe = TA(['mets']), tR = TA(['recherche']), tTr = TA(['trie']), tMa = TA(['mauvaise']), tG = TA(['g'], 8), tMg = TA(['marge']);
    return { bar: false, pov: false, title: 'Tu scrolles encore ?', demo: DEMO_P, end: FIN, endT: TA(['choisi']) + 0.85, goT: TA(['utopicar', 'utopic']), scanT: 99, titleOut: tMe - 0.1,
      extra: (s, P) => {
        const feed = mk('div', 'a', null, { width: '1080px', height: '1000px', top: '480px', overflow: 'hidden', WebkitMaskImage: 'linear-gradient(transparent 0,#000 90px,#000 880px,transparent 1000px)' }); s.cam.insertBefore(feed, s.cam.children[1]);   // fenêtre du fil, sous le titre, au-dessus de la bande du bas
        const L = [...ANN, ...ANN].map((a) => annCard(feed, a, false));
        const timer = mk('div', 'sm-big a', s.cam, { color: '#fff', fontSize: '84px' }, '');
        const rc = rechCard(s.cam), sorted = ANN.slice(0, 6).map((a) => annCard(s.cam, a, true));
        const tOut = sorted.map((_, i) => tMa + 0.12 * i), keep = ANN.slice(0, 6).map((a) => a[3] === 'GO');
        const goIdx = keep.map((k, i) => (k ? i : -1)).filter((i) => i >= 0);
        cue(0.1, 'whoosh', 0.5); cue(tD - 0.05, 'pop', 0.8); cue(tMe - 0.05, 'impact', 0.8); cue(tR, 'whoosh', 0.6); cue(tR + 0.4, 'click', 0.8); cue(tTr, 'roll', 0.7);
        tOut.forEach((x, i) => { if (!keep[i]) cue(x, 'whoosh', 0.4); }); cue(tG, 'pop', 0.9); cue(tMg, 'pop', 0.8);
        P.push((t) => {
          // le fil d'annonces qui défile de plus en plus vite, puis s'arrête net sur « Mets »
          const sc = t < tMe ? 260 * t + 900 * Math.pow(Math.max(0, t - 1), 2) : 0;
          L.forEach((e, i) => pose(e, t, (tt) => { if (tt >= tMe) return null; const ss = tt < tMe ? 260 * tt + 900 * Math.pow(Math.max(0, tt - 1), 2) : 0; return { x: 540, y: 140 + i * 132 - (ss % (ANN.length * 132)), c: 1, o: 0.95 }; }));
          const h = Math.min(134, Math.floor(E(t, tD, 0.9, (p) => p) * 134));
          timer.textContent = `⏱ ${Math.floor(h / 60)} h ${String(h % 60).padStart(2, '0')} de scroll`;
          pose(timer, t, (tt) => (tt < tD - 0.05 || tt > tMe ? null : { x: 140, y: 1330 + 50 * (1 - E(tt, tD, 0.35)), o: E(tt, tD, 0.25) * 2 }));
          pose(rc, t, (tt) => (tt < tR - 0.05 ? null : { x: 540, y: 560 + 260 * (1 - E(tt, tR, 0.45)), c: 1, r: -1.5, o: E(tt, tR, 0.3) * 2, s: 1 + 0.04 * bump(tt, tR + 0.4, 0.14) }));
          sorted.forEach((e, i) => pose(e, t, (tt) => { if (tt < tTr - 0.1 + i * 0.06) return null; const p = E(tt, tTr - 0.1 + i * 0.06, 0.35);
            let y = lerp(2000, 820 + i * 120, p), x = 540;
            if (!keep[i]) x += 1300 * E(tt, tOut[i], 0.35, eIn);
            else { const k = goIdx.indexOf(i); y = lerp(y, 860 + k * 175, E(tt, tG - 0.2, 0.45)); }
            return { x, y, c: 1, r: !keep[i] ? 8 * E(tt, tOut[i], 0.35, eIn) : 0, s: keep[i] ? 1 + 0.06 * E(tt, tG - 0.2, 0.45) : 1 }; }));
          sorted.forEach((e, i) => { const mg = e.querySelector('.mg'); if (mg) mg.style.opacity = E(t, tMg - 0.1, 0.3).toFixed(3); });
        });
      } };
  };
  for (const id of Object.keys(SEM)) SPECS[id] = () => semaine(SEM[id]());

  if (!SPECS[ID]) throw new Error('vidéo inconnue : ' + ID);
  await SPECS[ID]();   // FI3 charge les images de sa vidéo avant le premier seek
  // intro des séries : la première scène finit à la deuxième
  // ---------- seek ----------
  window.seek = (t) => {
    KF = inWin(t) ? 0.3 : 1;
    let tt = t;   // rembobinage : le film repart à l'envers, lent puis rapide puis lent, de REW.a jusqu'à REW.to
    if (REW && t >= REW.a && t < REW.b) tt = REW.a - eIO((t - REW.a) / (REW.b - REW.a)) * (REW.a - REW.to);
    for (const s of SC) paintScene(s, tt);
    if (REW) REW.paint(t);
  };
  window.shutter = (t) => (inWin(t) ? 1 : 0);
  window.samples = (t) => 8;
  window.filmDur = DUR;
  window.cues = CUES.sort((x, y) => x.t - y.t);
  window.seek(0);
  window.filmReady = true;
})();
