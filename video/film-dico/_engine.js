(async function () {
  const { spring, clamp, lerp, noise } = Motion;
  const V = true;   // film vertical seulement (TikTok, Reels, Shorts)
  const W = V ? 1080 : 1920, H = V ? 1920 : 1080, h = (a, b) => (V ? b : a);     // h(valeur 16:9, valeur 9:16)
  if (V) for (const e of [document.documentElement, document.body]) Object.assign(e.style, { width: W + 'px', height: H + 'px' });
  const ST = document.getElementById('stage'), FX = document.getElementById('fx'), NS = 'http://www.w3.org/2000/svg';
  const J = async (u) => (await fetch(u)).json();
  const WD = await J('../audio/vo-dico/prise-1.words.json');   // mots horodatés de la prise 1 de Simon (scripts/vo-dico-mots.py)
  const LOGO = await (await fetch('../assets/brand/official/utopicar-logo-horizontal-fond-sombre.svg')).text();
  await Promise.all(['700 200px Clash', '600 60px Clash', '700 40px Satoshi', '500 30px Satoshi', 'italic 200px Instrument'].map((f) => document.fonts.load(f)));
  const UI = '../film-master60/ui-blanc/', PH = '../assets/master60/photos/';
  const DUR = 33.0;

  // ---------- temps : mots de la voix, grille ----------
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const fixW = (ws) => { let prev = -9; return ws.map((w) => { let s = w.s; if (s <= prev + 0.04) s = prev + 0.11; prev = s; return { ...w, s, n: norm(w.w) }; }); };
  const BODY = fixW(WD);
  const Wt = (key, after = 0, list = BODY) => { const k = norm(key), w = list.find((w) => w.s >= after - 0.01 && w.n.startsWith(k)); if (!w) console.error('mot absent', key, after); return w ? w.s : after; };
  // musique de master60 (scripts/audio-dico.py) : mesure 4 du morceau sur l'image 0, arrêt de bande avant le « pfff »,
  // silence, puis le drop (mesure 16) sur « bam » et le coup final (mesure 24) après « traduis ».
  const BEAT = 60 / 112, T_STOP = 19.45, T_BAM = 24.46, T_HIT = T_BAM + 12 * BEAT;
  const pulse = (t) => { let x; if (t >= 0 && t < T_STOP) x = t / BEAT; else if (t >= T_BAM && t < T_HIT) x = (t - T_BAM) / BEAT; else if (t >= T_HIT) x = (t - T_HIT) / BEAT; else return 0; const n = Math.floor(x); return Math.exp(-((x - n) * BEAT) / 0.11) * (n % 4 === 0 ? 1 : 0.55); };
  // interpolation exponentielle
  const eOut = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
  const eIn = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : Math.pow(2, 10 * p - 10));
  const eIO = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2);
  const E = (t, t0, d, f = eOut) => f(clamp((t - t0) / d, 0, 1));
  const bump = (t, t0, d = 0.14) => clamp(spring(t - t0, 'snappy') - spring(t - t0 - d, 'snappy'), 0, 1);

  // ---------- éléments ----------
  const mk = (tag, cls, parent, css, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  // flou de bougé directionnel : un filtre SVG par élément, écart-type (x, y) = vitesse × obturateur
  let FID = 0; const K = 0.0065;
  function mb(el, bx, by, b0 = 0) {
    bx = Math.min(40, bx + b0); by = Math.min(40, by + b0);
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

  // ---------- scènes : un écran plein chacune ; transition d'entrée : coupe, cercle, volet diagonal ----------
  // repères sonores : le film publie ses propres événements (window.cues) pour le mixage (scripts/mix-master60w.py)
  const CUES = [], cue = (t, k, g = 1) => { if (t >= 0 && t < DUR) CUES.push({ t: +t.toFixed(3), k, g }); };
  const SC = [];
  function scene(a, b, bg, tin = { type: 'cut' }, push = 0.03) {
    const el = mk('div', 'scene', ST, { background: bg }), cam = mk('div', 'cam', el, { transformOrigin: `${W / 2}px ${H / 2}px` });
    const s = { a, b, el, cam, tin, push, imp: [], paint: () => {} }; SC.push(s);
    if (tin.type === 'slab' || tin.type === 'circle') cue(a, 'whoosh', 0.8);
    return s;
  }
  function paintScene(s, t) {
    const vis = t >= s.a - 0.001 && t < s.b + (s.keep ?? 0.75);
    s.el.style.display = vis ? '' : 'none'; if (!vis) return;
    const d = s.tin.d || 0.42, p = eIO(clamp((t - s.a) / d, 0, 1));
    if (s.tin.type === 'circle' && p < 1) s.el.style.clipPath = `circle(${(p * 2300).toFixed(0)}px at ${s.tin.x}px ${s.tin.y}px)`;
    else if (s.tin.type === 'slab' && p < 1) { const X = lerp(W + 580, -600 - (H - 1080) * 0.43, p), dx = Math.round(H * 0.426); s.el.style.clipPath = `polygon(${X}px 0,${W + 680}px 0,${W + 680}px ${H}px,${X - dx}px ${H}px)`; }
    else s.el.style.clipPath = '';
    let sx = 0, sy = 0;
    for (const [ti, amp] of s.imp) if (t >= ti) { const e = Math.exp(-(t - ti) * 10) * amp; sx += noise(31 + ti * 7, t * 28) * e; sy += noise(57 + ti * 7, t * 28) * e; }
    const push = 1 + s.push * clamp((t - s.a) / (s.b - s.a + 0.75), 0, 1);
    s.cam.style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) scale(${(push * (1 + 0.0045 * pulse(t))).toFixed(4)})`;
    s.paint(t);
  }

