// master60 « wow » (16:9, 1920×1080 ; 9:16, 1080×1920 avec ?fmt=vertical) — maquette validée (maquette-master60/), animée.
// Contrat : window.seek(t) peint la frame t, sans état entre les frames. ?hook=A|B.
// 9:16 : même film, même son ; chaque scène a sa mise en page verticale (h(16:9, 9:16)) : textes dans la colonne 140 → 940,
// sous les 220 px du haut, interface en bas au-dessus des 440 px réservés à TikTok / Reels / Shorts ; CTA « lien en bio ».
// Un écran plein par idée (blanc, noir, orange ; rouge pour « Non. »), la réplique de Simon écrite en géant, mot par mot
// sur sa syllabe (audio/vo-master60/vo-timing.json), la vraie interface de l'app. Ressorts et interpolation exponentielle,
// fonctions du temps ; flou de bougé directionnel : chaque mot, chiffre ou carte est flouté selon sa vitesse et sa direction.
(async function () {
  const { spring, clamp, lerp, noise } = Motion;
  const HOOK = (new URLSearchParams(location.search).get('hook') || 'A').toUpperCase();
  const V = new URLSearchParams(location.search).get('fmt') === 'vertical';
  const W = V ? 1080 : 1920, H = V ? 1920 : 1080, h = (a, b) => (V ? b : a);     // h(valeur 16:9, valeur 9:16)
  if (V) for (const e of [document.documentElement, document.body]) Object.assign(e.style, { width: W + 'px', height: H + 'px' });
  const ST = document.getElementById('stage'), FX = document.getElementById('fx'), NS = 'http://www.w3.org/2000/svg';
  const J = async (u) => (await fetch(u)).json();
  const VT = await J('../audio/vo-master60/vo-timing.json'), GR = await J('../audio/vo-master60/grille.json');
  const MUR = (await J('../assets/master60/annonces-mur.json')).annonces;
  const LOGO = await (await fetch('../assets/brand/official/utopicar-logo-horizontal-fond-sombre.svg')).text();
  await Promise.all(['700 200px Clash', '600 60px Clash', '700 40px Satoshi', '500 30px Satoshi', 'italic 200px Instrument'].map((f) => document.fonts.load(f)));
  const UI = '../film-master60/ui-blanc/', PH = '../assets/master60/photos/';
  const DUR = 59.0, END = VT.marks.utopicar2.t + 0.76;

  // ---------- temps : mots de la voix, grille ----------
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const fixW = (ws) => { let prev = -9; return ws.map((w) => { let s = w.s; if (s <= prev + 0.04) s = prev + 0.11; prev = s; return { ...w, s, n: norm(w.w) }; }); };
  const BODY = fixW(VT.mots), HKA = fixW(VT.hooks.A.mots), HKB = fixW(VT.hooks.B.mots);
  const Wt = (key, after = 0, list = BODY) => { const k = norm(key), w = list.find((w) => w.s >= after - 0.01 && w.n.startsWith(k)); if (!w) console.error('mot absent', key, after); return w ? w.s : after; };
  const BT = (n) => GR.ancre + n * GR.beat;
  // la musique (scripts/audio-master60w.py) garde un temps de silence avant « Hop ! » : ses premiers temps de mesure tombent
  // sur les temps 0, 4, 8… jusqu'au temps 48, puis sur 49, 53, 57… ; arrêt sur « Ah. » (temps 8 → 10) et avant le logo final
  const pulse = (t) => { if (t < 0 || (t >= BT(8) && t < BT(10)) || (t >= BT(48) && t < BT(49)) || (t >= BT(93) && t < BT(94))) return 0; const x = (t - GR.ancre) / GR.beat, n = Math.floor(x), m = n >= 49 ? n - 49 : n; return Math.exp(-((x - n) * GR.beat) / 0.11) * ((((m % 4) + 4) % 4) === 0 ? 1 : 0.55); };
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

  const T0 = VT.corps;
  // =====================================================================================================
  // OUVERTURE A : « Ta première voiture à revendre ? Tu peux la payer… deux fois. »
  // =====================================================================================================
  if (HOOK === 'A') {
    const tDeux = Wt('deux', 2, HKA), tFois = Wt('fois', 3, HKA);
    { const s = scene(-1, tDeux, 'var(--w)');
      const k1 = KT(s.cam, h(96, 140), h(250, 300), h(170, 150), 'Ta première'), k2 = KT(s.cam, h(96, 140), h(430, 470), h(210, 200), [['voiture ?', { i: 1, c: 'var(--o)' }]]);
      const k3 = brk(s.cam, h(100, 144), h(690, 720), [['[ à', {}], ['revendre', { c: 'var(--o)' }], ['? ]', {}]]);
      const k4 = V ? [KT(s.cam, 140, 300, 150, 'Tu peux'), KT(s.cam, 140, 460, 150, 'la payer…')] : KT(s.cam, 96, 300, 150, 'Tu peux la payer…');
      const card = lst(s.cam), mark = card.querySelector('.p i');
      const cur = cursor(s.cam, V ? [[-1, 1200, 1900], [1.25, 780, 900], [1.7, 460, 1380], [2.5, 470, 1390]] : [[-1, 2100, 1000], [1.25, 1440, 380], [1.7, 1300, 790], [2.5, 1320, 800]], [Wt('payer', 2, HKA)]);
      cue(Wt('payer', 2, HKA), 'click');
      s.paint = (t) => {
        ktP(k1, t, [-0.62, -0.52], 'rise', 1.66, 'up', { acc: [Wt('ta', 0, HKA), Wt('premiere', 0, HKA)] });
        ktP(k2, t, [-0.42, -0.42], 'rise', 1.7, 'up', { acc: [Wt('voiture', 0, HKA)] });
        ktP(k3, t, Wt('revendre', 0, HKA) - 0.1, 'rise', 1.66, 'up', { step: 0.07 });
        const t4 = [Wt('tu', 1.5, HKA), Wt('peux', 1.5, HKA), Wt('la', 1.5, HKA), Wt('payer', 1.5, HKA)];
        if (V) { ktP(k4[0], t, t4.slice(0, 2)); ktP(k4[1], t, t4.slice(2)); } else ktP(k4, t, t4);
        pose(card, t, (tt) => { const p = E(tt, -0.75, 0.7); return { x: h(lerp(2400, 1400, p), lerp(1700, 560, p)), y: h(520, 1110), c: 1, p: 1, rx: 10, ry: -22 - 34 * (1 - p), r: -3 }; });
        mark.style.transform = `scaleX(${E(t, 1.7, 0.45).toFixed(3)})`;
        cur(t);
      };
    }
    { const s = scene(tDeux, T0, 'var(--o)'); s.imp.push([tDeux + 0.18, 18]);
      cue(tDeux, 'impact'); cue(tDeux + 0.36, 'pop', 0.7); cue(tFois, 'whoosh', 0.6); cue(tFois + 0.4, 'pop', 0.7);
      const k1 = KT(s.cam, h(96, 140), h(150, 300), 380, [['Deux', { c: '#fff' }]]), k2 = KT(s.cam, h(110, 150), h(520, 640), 400, [['fois.', { i: 1, c: 'var(--k)' }]]);
      const t1 = mk('div', 'tag a', s.cam, null, '7 190 €<small>le prix affiché</small>');
      const t2 = mk('div', 'tag a', s.cam, { borderColor: 'var(--k)' }, '7 190 €<small>une 2e fois en réparations ?</small>');
      s.paint = (t) => {
        ktP(k1, t, tDeux, 'slam'); ktP(k2, t, tFois, 'rise');
        pose(t1, t, (tt) => { const p = E(tt, tDeux + 0.06, 0.4); return { x: h(1330, 600), y: lerp(-300, h(420, 1150), p), c: 1, r: -6 - 20 * (1 - p), s: h(1, 1.2) }; });
        pose(t2, t, (tt) => { if (tt < tFois - 0.02) return null; const p = E(tt, tFois, 0.42); return { x: lerp(h(1330, 600), h(1500, 680), p), y: lerp(h(420, 1150), h(640, 1330), p), c: 1, r: lerp(-6, 7, p), s: h(1, 1.2) }; });
      };
    }
  } else {
    // =====================================================================================================
    // OUVERTURE B : « T'es marchand ? Cinquante annonces ce matin… pfff. »
    // =====================================================================================================
    const s = scene(-1, T0, 'var(--k)');
    const M = MUR.map((a) => `<div class="ann" style="position:relative;display:inline-block;margin:0 30px 30px 0"><div class="m">${a.marque} ${a.modele}</div><div class="s">${a.annee} · ${a.km.toLocaleString('fr-FR')} km</div><div class="p">${a.prix.toLocaleString('fr-FR')} €</div></div>`);
    const wall = mk('div', 'a', s.cam, { width: '2000px', opacity: 0.85 }, `<div style="width:2000px;line-height:0">${M.concat(M).join('')}</div>`);
    mk('div', 'a', s.cam, { width: W + 'px', height: H + 'px', background: V ? 'linear-gradient(180deg,rgba(14,11,9,.96) 0,rgba(14,11,9,.88) 860px,rgba(14,11,9,0) 1240px)' : 'linear-gradient(90deg,rgba(14,11,9,.96) 0,rgba(14,11,9,.85) 720px,rgba(14,11,9,0) 1150px)' });
    const k0 = V ? [KT(s.cam, 140, 260, 150, [["T'es", { c: '#fff' }]]), KT(s.cam, 140, 410, 150, [['marchand ?', { c: '#fff' }]])] : KT(s.cam, 96, 140, 120, [["T'es", { c: '#fff' }], ['marchand ?', { c: '#fff' }]]);
    const r50 = ROLL(s.cam, h(90, 130), h(110, 240), h(560, 520), '00', '50', 'var(--o)');
    const k1 = KT(s.cam, h(100, 140), h(650, 770), h(120, 130), [['annonces.', { c: '#fff' }]]), k2 = KT(s.cam, h(104, 144), h(780, 890), h(140, 150), [['ce matin.', { i: 1, c: '#fff' }]]);
    const k3 = KT(s.cam, h(1260, 470), h(720, 1150), h(200, 230), [['Pfff…', { i: 1, c: 'rgba(251,249,245,.55)' }]]);
    // l'option Messages de Benef Pro : un premier message automatique part vers chaque vendeur
    const ok = [...Array(12)].map((_, i) => mk('div', 'a', s.cam, { padding: '10px 18px', borderRadius: '999px', background: 'var(--ok)', color: '#fff', font: '700 24px Satoshi', whiteSpace: 'nowrap', boxShadow: '0 12px 24px -8px rgba(0,0,0,.6)' }, '✓ Message envoyé'));
    const OKP = V ? [[250, 1200], [540, 1185], [800, 1215], [380, 1265], [660, 1255], [240, 1330], [530, 1325], [800, 1290], [350, 1395], [640, 1390], [810, 1360], [460, 1150]]
      : [[1180, 220], [1520, 170], [1820, 300], [1340, 420], [1660, 520], [1150, 600], [1480, 700], [1800, 760], [1250, 860], [1600, 330], [1880, 520], [1380, 980]];
    const pill = mk('div', 'a', s.cam, { padding: '18px 30px', borderRadius: '999px', background: 'rgba(251,249,245,.1)', border: '1.5px solid rgba(251,249,245,.2)', color: '#fff', font: '700 36px Satoshi', whiteSpace: 'nowrap' });
    const tMsg = Wt('matin', 1.5, HKB) + 0.3;
    cue(Wt('50', 0.8, HKB), 'roll'); for (let i = 0; i < 12; i++) cue(tMsg + i * GR.beat / 4, 'sent', i % 2 ? 0.45 : 0.6);
    mk('div', 'men a', s.el, { left: h(96, 140) + 'px', top: h(940, 1440) + 'px', color: '#fff' }, 'Option Messages de Benef Pro : un premier message automatique par annonce');
    s.paint = (t) => {
      let st = 0; for (let n = -8; n < 0; n++) st += E(t, BT(n), 0.38);
      pose(wall, t, () => ({ x: h(1250, 540), y: h(760, 1420) - st * 115, c: 1, p: 1, rx: 46, ry: 0, r: -14, s: 1.05 }));
      if (V) { ktP(k0[0], t, -0.5, 'rise', 1.0, 'up', { acc: [Wt('es', 0, HKB)] }); ktP(k0[1], t, -0.45, 'rise', 1.0, 'up', { acc: [Wt('marchand', 0, HKB)] }); }
      else ktP(k0, t, [-0.5, -0.45], 'rise', 1.0, 'up', { acc: [Wt('es', 0, HKB), Wt('marchand', 0, HKB)] });
      r50.box.style.visibility = t >= Wt('50', 0.8, HKB) - 0.05 ? '' : 'hidden'; rollP(r50, t, Wt('50', 0.8, HKB), 0.5, 0.08);
      ktP(k1, t, Wt('annonces', 1, HKB)); ktP(k2, t, [Wt('ce', 1.5, HKB), Wt('matin', 1.5, HKB)]);
      ktP(k3, t, Wt('pfff', 3, HKB), 'blur', null, 'up', { fx: (i, j, tt) => ({ y: E(tt, Wt('pfff', 3, HKB) + 0.2 + j * 0.05, 0.5) * (14 + j * 9), r: E(tt, Wt('pfff', 3, HKB) + 0.2, 0.5) * (j % 2 ? 5 : -4) }) });
      ok.forEach((e, i) => pose(e, t, (tt) => { const t0 = tMsg + i * GR.beat / 4; if (tt < t0) return null; const p = E(tt, t0, 0.3); return { x: OKP[i][0], y: OKP[i][1], c: 1, s: 0.4 + 0.6 * p, o: p * 2, r: (i % 3) - 1 }; }));
      const n = Math.round(50 * clamp((t - tMsg) / (Wt('pfff', 3, HKB) - 0.1 - tMsg), 0, 1));
      pill.innerHTML = `<span style="color:var(--ok)">✓</span> ${n} premiers messages envoyés`;
      pose(pill, t, (tt) => { if (tt < tMsg - 0.02) return null; const p = E(tt, tMsg, 0.35); return { x: h(1160, 140), y: h(60, 1060) + 40 * (1 - p), o: p }; });
    };
  }

  // =====================================================================================================
  // CORPS (identique pour A et B)
  // =====================================================================================================
  // « Celle-là… hum… tu l'achètes ? »
  { const s = scene(T0, Wt('colle', 7), 'var(--w)', { type: 'slab', d: 0.42 });
    const tTu = Wt('tu', 6), tAch = Wt('achetes', 6), tQ = tAch + 0.46;
    const k1 = KT(s.cam, h(96, 140), h(200, 280), h(170, 160), 'Celle-là…'), k2 = KT(s.cam, h(100, 144), h(420, 470), 120, [['hum…', { i: 1, c: '#b5aa9c' }]]);
    const k3 = KT(s.cam, h(110, 150), h(150, 280), 170, 'Tu'), k4 = KT(s.cam, h(80, 130), h(470, 470), h(300, 240), [["l'achètes", { i: 1, c: 'var(--o)' }], ['?', { i: 1, c: 'var(--o)' }]]);
    const card = lst(s.cam, 540), mark = card.querySelector('.p i');
    const cur = cursor(s.cam, V ? [[T0, 1200, 1900], [5.0, 780, 900], [5.9, 470, 1390], [7.0, 480, 1400]] : [[T0, 2100, 1000], [5.0, 1510, 380], [5.9, 1430, 800], [7.0, 1450, 810]]);
    s.paint = (t) => {
      ktP(k1, t, T0, 'rise', tTu - 0.12);
      ktP(k2, t, Wt('hum', 5), 'blur', tTu - 0.12, 'up', { fx: (i, j, tt) => ({ y: Math.sin(tt * 7 + j * 1.3) * 7 }) });
      ktP(k3, t, tTu); ktP(k4, t, [tAch, tQ], 'rise');
      pose(card, t, (tt) => { const p = E(tt, T0 + 0.05, 0.6); return { x: h(lerp(2400, 1520, p), lerp(1700, 560, p)), y: h(560, 1140), c: 1, p: 1, rx: 4, ry: 12 + 30 * (1 - p), r: 2 }; });
      mark.style.transform = `scaleX(${E(t, tAch, 0.45).toFixed(3)})`;
      cur(t);
    };
  }
  // « Je colle l'annonce. » : le lien glissé dans un champ géant, s'écrit, clic sur Analyser
  { const a = Wt('colle', 7) , s = scene(a, VT.marks.ah.t, 'var(--k)');
    const k1 = KT(s.cam, h(96, 140), h(140, 280), 170, [['Je', { c: '#fff' }], ['colle', { c: '#fff' }]]);
    const k2 = KT(s.cam, h(0, 140), h(132, 450), h(187, 200), [["l'annonce.", { i: 1, c: 'var(--o)' }]]);
    const field = mk('div', 'a', s.cam, { width: h(1600, 800) + 'px', height: h(190, 150) + 'px', borderRadius: '999px', background: '#fff', display: 'flex', alignItems: 'center', padding: h('0 24px 0 60px', '0 18px 0 36px'), gap: h('26px', '16px'), boxShadow: '0 50px 100px -30px rgba(0,0,0,.8)' },
      '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#1c1612" stroke-width="2.2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>');
    const txt = mk('div', '', field, { flex: '1', font: `500 ${h(46, 36)}px Satoshi`, color: '#1c1612', whiteSpace: 'nowrap', overflow: 'hidden' });
    const URL_ = h('…/annonce/peugeot-208-puretech-110', '…/annonce/peugeot-208'), chars = [...URL_].map((ch) => mk('span', '', txt, null, ch));
    const caret = mk('span', '', txt, { display: 'inline-block', width: '4px', height: h(52, 42) + 'px', background: 'var(--o)', verticalAlign: '-8px', marginLeft: '4px' });
    const BW = h(380, 270), BH = h(142, 114);
    const btn = mk('div', '', field, { height: BH + 'px', borderRadius: '999px', background: 'var(--o)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 ${h(56, 44)}px Clash`, color: '#1a1310', overflow: 'hidden', position: 'relative', flex: 'none' }, 'Analyser');
    const spin = mk('div', 'a', btn, { width: '70px', height: '70px', borderRadius: '50%', border: '9px solid rgba(26,19,16,.25)', borderTopColor: '#1a1310', left: '50%', top: '50%', display: 'none' });
    const chip = mk('div', 'pill a', s.cam, { background: '#fff', color: 'var(--ink)', font: '700 34px Satoshi', boxShadow: '0 20px 40px -10px rgba(0,0,0,.6)' }, '🔗 Lien de l\'annonce');
    const tType = a + 0.38, tClick = tType + chars.length * 0.012 + 0.12;
    const P = (t) => ({ x: W / 2, y: h(620, 1000) + h(360, 480) * (1 - E(t, a, 0.5)), c: 1, p: 1, rx: 14 + 20 * (1 - E(t, a, 0.5)), ry: 0, r: -2 });
    const cur = cursor(s.cam, V ? [[a - 0.5, 1150, 1950], [a + 0.05, 900, 1260], [tType - 0.02, 300, 1020], [tClick - 0.02, 790, 1025]] : [[a - 0.5, 1700, 1100], [a + 0.05, 1640, 960], [tType - 0.02, 560, 640], [tClick - 0.02, 1560, 650]], [tClick], true);
    cue(a, 'whoosh', 0.7); cue(tType, 'type'); cue(tClick, 'click');
    s.paint = (t) => {
      ktP(k1, t, [a, Wt('colle', 7) + 0.11]);
      if (!V) k2.box.style.left = (CX(96) + k1.box.offsetWidth + 46) + 'px'; ktP(k2, t, Wt('annonce', 7.6));
      pose(field, t, P);
      chars.forEach((c, i) => { c.style.opacity = t >= tType + i * 0.012 ? 1 : 0; });
      caret.style.opacity = t < tType ? 0 : (Math.floor(t * 4) % 2 ? 0.2 : 1);
      const m = E(t, tClick + 0.02, 0.25); btn.style.width = lerp(BW, BH, m) + 'px'; btn.style.color = m > 0.3 ? 'transparent' : '#1a1310';
      spin.style.display = m > 0.6 ? '' : 'none'; spin.style.transform = `translate(-50%,-50%) rotate(${((t - tClick) * 600) % 360}deg)`;
      pose(chip, t, (tt) => { if (tt < a + 0.05 || tt > tType + 0.1) return null; const cp = cur(tt); return { x: cp.x + 20, y: cp.y + 40, s: 1 - 0.5 * E(tt, tType - 0.1, 0.18), o: 1 - E(tt, tType - 0.05, 0.12) }; });
      cur(t);
    };
  }
  // « Ah. » : la musique coupe, tout se fige
  { const a = VT.marks.ah.t, s = scene(a, VT.marks.non.t, 'var(--k)', { type: 'cut' }, 0.09);
    const sp = mk('div', 'a', s.cam, { width: '110px', height: '110px', borderRadius: '50%', border: '12px solid rgba(255,90,31,.25)', borderTopColor: 'var(--o)', left: h(905, 485) + 'px', top: h(330, 740) + 'px', transform: 'rotate(140deg)' });
    const k = KT(s.cam, 0, h(520, 920), 150, [['Ah.', { c: '#6b625b' }]], {}, 0);
    cue(a - 0.06, 'tapestop');
    s.paint = (t) => { k.box.style.left = (W / 2 - k.box.offsetWidth / 2) + 'px'; ktP(k, t, a, 'blur'); };
  }
  // « Non. »
  { const a = VT.marks.non.t, s = scene(a, VT.marks.n1650.t, 'var(--r)'); s.imp.push([a + 0.2, 26]);
    const k = KT(s.cam, h(70, 130), h(300, 330), h(760, 420), [['Non.', { c: '#fff' }]]);
    cue(a, 'impact', 1.1); cue(a + 0.5, 'thud', 0.8);
    const f = crop(s.cam, 'fiche-208', { W: 1050, x: 0, y: 0, w: 1050, h: 700 }, h(620, 600), { background: '#fff' });
    s.paint = (t) => {
      ktP(k, t, a, 'slam');
      pose(f, t, (tt) => { const p = E(tt, a + 0.16, 0.45); if (tt < a + 0.14) return null; return { x: h(1480, 560), y: lerp(-500, h(380, 1120), p), c: 1, r: 6 + 14 * (1 - p) }; });
    };
  }
  // « 1 650 € de travaux… que le vendeur a oubliés. Bizarre. »
  { const a = VT.marks.n1650.t, tBz = VT.marks.bizarre.t, s = scene(a, VT.marks.utopicar.t, 'var(--w)');
    const R = ROLL(s.cam, h(96, 140), h(320, 270), h(230, 200), '+0 000 €', '+1 650 €', 'var(--r)');
    const kb = brk(s.cam, h(100, 144), h(660, 500), [['[ de travaux que le vendeur a', {}], ['oubliés', { c: 'var(--o)' }], [']', {}]]);
    const insB = [a + 0.62, Wt('de', a), Wt('travaux', a), Wt('que', a), Wt('le', 12.6), Wt('vendeur', a), Wt('a', 13.2), Wt('oublie', a), Wt('oublie', a) + 0.2];
    const fiche = crop(s.cam, 'fiche-208', { W: 1050, x: 0, y: 0, w: 1050, h: 1617 }, h(520, 500));
    const ring = mk('div', 'hl a', fiche, { left: '14px', top: (948 * fiche.k) + 'px', width: (1022 * fiche.k) + 'px', height: (172 * fiche.k) + 'px', transformOrigin: '50% 50%' });
    const kz = KT(s.cam, h(90, 130), h(300, 320), h(430, 280), [['Bizarre.', { i: 1 }]]);
    const tTr = Wt('travaux', a);
    cue(a, 'roll'); cue(a + 0.1, 'whoosh', 0.5); cue(tTr, 'pop', 0.8); cue(tBz + 0.3, 'whoosh', 0.45);
    const cur = cursor(s.cam, V ? [[a, 1200, 1900], [tTr + 0.1, 760, 1170], [tBz - 0.1, 780, 1180], [tBz + 0.4, 700, 760]] : [[a, 2100, 900], [tTr + 0.1, 1580, 640], [tBz - 0.1, 1600, 650], [tBz + 0.4, 1330, 420]]);
    s.paint = (t) => {
      pose(R.box, t, (tt) => (tt > tBz + 0.4 ? null : { x: 0, y: -E(tt, tBz - 0.14, 0.3, eIn) * 600, o: 1 - E(tt, tBz - 0.05, 0.2) }));
      rollP(R, t, a, 0.8, 0.09);
      ktP(kb, t, insB, 'rise', tBz - 0.14, 'up');
      pose(fiche, t, (tt) => { const p = E(tt, a + 0.1, 0.6), q = E(tt, tBz, 0.45); return { x: h(lerp(lerp(2400, 1430, p), 1580, q), lerp(lerp(1700, 540, p), 600, q)), y: h(540 + 20 * q, 1050 + 90 * q), c: 1, p: 1, rx: 12 * (1 - q), ry: -16 * (1 - q), r: lerp(-2, 9, q), s: 1 - 0.23 * q }; });
      const rp = E(t, tTr, 0.35); ring.style.opacity = rp; ring.style.transform = `scale(${(1.12 - 0.12 * rp).toFixed(3)})`;
      ktP(kz, t, tBz, 'rise');
      const tilt = E(t, tBz + 0.32, 0.3);
      kz.box.style.transform = `translateY(${(-24 * tilt).toFixed(1)}px) rotate(${(-6 * tilt).toFixed(2)}deg)`;
      cur(t);
    };
  }
  // « UTOPICAR, tu colles l'annonce… » : cercle orange depuis le curseur, logo animé
  { const a = VT.marks.utopicar.t, s = scene(a, VT.marks.bam.t, 'var(--o)', { type: 'circle', x: h(1330, 700), y: h(420, 760), d: 0.5 });
    const L = logo(s.cam, W / 2, h(470, 820), h(1100, 760));
    cue(a + 0.06, 'pop', 0.8); cue(a + 0.25, 'whoosh', 0.7); cue(a + 0.5, 'pop', 0.6);
    const kc = brk(s.cam, 0, h(720, 1050), [['Tu', { c: '#fff' }], ['colles', { c: '#fff' }], ["l'annonce…", { c: 'var(--k)' }]], '#fff', 54);
    s.paint = (t) => { L(t, a + 0.05); kc.box.style.left = (W / 2 - kc.box.offsetWidth / 2) + 'px'; ktP(kc, t, [Wt('tu', a), Wt('colles', a), Wt('annonce', 15.5)]); };
  }
  // « …et bam, ce qu'il te reste, frais déduits. »
  { const a = VT.marks.bam.t, s = scene(a, VT.marks.mercedes.t, 'var(--w)'); s.imp.push([a + 0.18, 16]);
    const kb = KT(s.cam, h(96, 140), h(90, 240), 330, [['Bam.', { i: 1, c: 'var(--o)' }]]);
    const line = mk('div', 'a', s.cam, V ? { left: '537px', top: '820px', width: '6px', height: '400px', borderRadius: '3px', background: 'rgba(28,22,18,.12)' } : { left: '210px', top: '687px', width: '1500px', height: '6px', borderRadius: '3px', background: 'rgba(28,22,18,.12)' });
    const lineOn = mk('div', 'a', line, { width: '100%', height: '100%', borderRadius: '3px', background: 'var(--ok)', transformOrigin: h('0 50%', '50% 0') });
    const tC = [Wt('ce', a), Wt('reste', a), Wt('frais', a)];
    const steps = [["Colle l'annonce", h(420, 820)], ['Frais déduits', h(960, 1020)], ['Ta marge nette', h(1500, 1220)]].map(([s_, x], i) => {
      const e = mk('div', 'step a', s.cam, null, `<i>${i + 1}</i>${s_}`); e.i = e.querySelector('i'); e.x = x; return e;
    });
    const kr = brk(s.cam, h(100, 144), h(840, 600), [['[ ce', {}], ["qu'il te reste,", {}], ['frais déduits', { c: 'var(--o)' }], [']', {}]]);
    const cur = cursor(s.cam, V ? [[a, 1200, 1900], [tC[0] - 0.02, 420, 835], [tC[1] - 0.02, 440, 1035], [tC[2] - 0.02, 450, 1232]] : [[a, 2000, 1000], [tC[0] - 0.02, 400, 720], [tC[1] - 0.02, 940, 720], [tC[2] - 0.02, 1370, 712]], tC);
    cue(a, 'impact'); tC.forEach((tc) => cue(tc, 'click'));
    s.paint = (t) => {
      ktP(kb, t, a, 'slam');
      lineOn.style.transform = `${h('scaleX', 'scaleY')}(${(E(t, tC[0], 0.4) * 0.5 + E(t, tC[1], 0.4) * 0.5).toFixed(4)})`;
      steps.forEach((e, i) => {
        const ck = t >= tC[i]; e.i.textContent = ck ? '✓' : String(i + 1); e.i.style.background = ck ? 'var(--ok)' : 'var(--o)';
        pose(e, t, (tt) => { const p = E(tt, a + 0.12 + i * 0.14, 0.4); return { x: h(e.x, W / 2), y: h(690, e.x) + 90 * (1 - p), c: 1, o: p, s: 1 + 0.08 * bump(tt, tC[i] - 0.02, 0.15) }; });
      });
      ktP(kr, t, [Wt('ce', a) - 0.06, Wt('ce', a), Wt('qu', a), Wt('il', a), Wt('te', a), Wt('reste', a), Wt('frais', a), Wt('deduit', a), Wt('deduit', a) + 0.15]);
      cur(t);
    };
  }
  // « Cette Mercedes ? Prix max : seize mille cinq. »
  { const a = VT.marks.mercedes.t, tP = VT.marks.prixmax.t, t165 = VT.marks.n16500.t, s = scene(a, VT.marks.attends.t, 'var(--k)');
    const k0 = KT(s.cam, h(96, 140), h(140, 260), 100, [['Cette', { c: '#fff' }], ['Mercedes', { c: '#fff' }], ['?', { c: 'var(--o)' }]]);
    const kg = KT(s.cam, h(96, 140), h(130, 250), 120, [['19 990 €', { c: 'rgba(251,249,245,.3)' }]]);
    const strike = mk('div', 'strike a', s.cam, { left: CX(h(96, 140)) + 'px', top: h(178, 298) + 'px', background: 'rgba(251,249,245,.55)' });
    const kp = KT(s.cam, h(100, 144), h(300, 410), 90, [['Prix', { c: '#fff' }], ['max', { c: '#fff' }]]);
    const R = ROLL(s.cam, h(90, 134), h(410, 520), h(190, 180), '19 990 €', '16 500 €', 'var(--o)');
    const kb = brk(s.cam, h(100, 144), h(720, 740), [['[ au-delà, tu', {}], ["perds de l'argent", { c: 'var(--o)' }], [']', {}]], '#fff');
    const photo = mk('div', 'card a', s.cam, { width: h(760, 640) + 'px', height: h(520, 438) + 'px' }, `<img src="${PH}mercedes-profil.jpg" style="width:100%;height:100%;object-fit:cover;position:static">`);
    const mx = crop(s.cam, 'merc-argent', { W: 1074, x: 66, y: 1960, w: 942, h: 286 }, h(740, 680));
    cue(a, 'whoosh', 0.7); cue(tP, 'whoosh', 0.5); cue(tP + 0.2, 'roll');
    s.paint = (t) => {
      ktP(k0, t, [a, Wt('mercedes', a) + 0.11, Wt('?', 19.6)], 'rise', tP - 0.1);
      ktP(kg, t, tP + 0.05); strike.style.width = (kg.box.offsetWidth) + 'px'; strike.style.transform = `scaleX(${E(t, t165, 0.3).toFixed(3)})`;
      ktP(kp, t, [tP, tP + 0.11]);
      R.box.style.visibility = t >= tP + 0.15 ? '' : 'hidden'; rollP(R, t, tP + 0.2, 0.7, 0.08);
      ktP(kb, t, t165 + 0.25, 'rise', null, 'up', { step: 0.06 });
      pose(photo, t, (tt) => { const p = E(tt, a + 0.04, 0.6); return { x: h(lerp(2400, 1390, p), lerp(1700, 540, p)), y: h(380, 1040), c: 1, p: 1, rx: 8, ry: -18 - 40 * (1 - p), r: -2 }; });
      pose(mx, t, (tt) => { if (tt < tP - 0.02) return null; const p = E(tt, tP, 0.5); return { x: h(1400, 540), y: h(770, 1360), c: 1, p: 1, rx: 8 + 82 * (1 - p), ry: -18, r: -2 }; });
    };
  }
  // « Attends… elle est en vente trois fois ? Ah ouais ! »
  { const a = VT.marks.attends.t, tTr = VT.marks.trois.t, s = scene(a, VT.marks.quinze.t, 'var(--w)', { type: 'slab', d: 0.4 }); s.imp.push([tTr + 0.2, 14]);
    const ka = KT(s.cam, h(96, 140), h(140, 260), 120, 'Attends…');
    const kx = KT(s.cam, h(80, 130), h(110, 230), h(560, 480), [['×3', { c: 'var(--o)' }]]);
    const ko = KT(s.cam, h(110, 150), h(700, 1330), h(150, 130), [['Ah ouais !', { i: 1 }]]);
    const hist = crop(s.cam, 'merc-historique', { W: 1074, x: 50, y: 860, w: 974, h: 280 }, 760);
    const tT = [tTr, Wt('fois', tTr), Wt('?', 23.5)];
    const tags = [['17 990 €', 'Bretagne', h(1150, 330), h(640, 1100), -6], ['19 990 €', 'cette annonce', h(1430, 540), h(700, 1225), 2], ['21 990 €', 'Tarn', h(1710, 750), h(630, 1090), 8]].map(([p, l, x, y, r], i) => {
      const e = mk('div', 'tag a', s.cam, i === 1 ? { borderColor: 'var(--o)', borderWidth: '5px' } : null, `${p}<small>${l}</small>`); Object.assign(e, { X: x, Y: y, R: r }); return e;
    });
    const tAh = Wt('ah', 23.5), tOu = Wt('ouais', 23.5);
    cue(tTr, 'impact', 0.9); tT.forEach((tt) => cue(tt + 0.3, 'pop'));
    const cur = cursor(s.cam, V ? [[a, 1200, 1900], [tOu + 0.1, 560, 1250], [tOu + 1, 570, 1260]] : [[a, 2000, 1050], [tOu + 0.1, 1450, 760], [tOu + 1, 1460, 770]]);
    s.paint = (t) => {
      ktP(ka, t, a, 'rise', tTr - 0.25);
      ktP(kx, t, tTr, 'slam');
      ktP(ko, t, [tAh, tOu, Wt('!', 24.2)]);
      pose(hist, t, (tt) => { const p = E(tt, Wt('elle', a), 0.55); return { x: h(lerp(2300, 1400, p), lerp(1600, 540, p)), y: lerp(-200, h(300, 870), p), c: 1, p: 1, rx: 12, ry: 10, r: 3 }; });
      tags.forEach((e, i) => pose(e, t, (tt) => { if (tt < tT[i] - 0.02) return null; const p = E(tt, tT[i], 0.36), h = i === 1 ? E(tt, tOu + 0.1, 0.3) : 0; return { x: e.X, y: lerp(-300, e.Y - 20 * h, p), c: 1, r: e.R - 18 * (1 - p), s: 1 + 0.08 * h }; }));
      cur(t);
    };
  }
  // 02 · « Quinze voitures en stock ? »
  { const a = VT.marks.quinze.t, s = scene(a, VT.marks.pfff.t, 'var(--k)'); s.imp.push([a + 0.2, 12]);
    const rows = [...Array(h(7, 13))].map((_, r) => mk('div', 'out a', s.cam, { top: (-40 + r * 160) + 'px' }, "APRÈS L'ACHAT · ".repeat(6)));
    cue(a, 'impact', 0.7); cue(a, 'whoosh', 0.6);
    const slab = mk('div', 'a', s.cam, { padding: '40px 70px', background: 'var(--o)', borderRadius: '30px' });
    mk('div', '', slab, { font: '700 44px Satoshi', color: '#fff', opacity: 0.85, marginBottom: '10px' }, "02 · Après l'achat");
    const k1 = KT(slab, 0, 0, 170, [['15 voitures', { c: '#fff' }]], { position: 'relative' }, h(0, 660)), k2 = KT(slab, 0, 0, 170, [['en stock ?', { i: 1, c: 'var(--k)' }]], { position: 'relative' }, h(0, 660));
    s.paint = (t) => {
      rows.forEach((e, r) => { e.style.transform = `translateX(${(-300 + (r % 2) * 420 + (r % 2 ? 1 : -1) * (t - a) * 180).toFixed(1)}px)`; });
      pose(slab, t, (tt) => { const p = E(tt, a, 0.45); return { x: W / 2, y: H / 2, c: 1, s: 0.55 + 0.45 * p, r: -3 - 12 * (1 - p) }; });
      ktP(k1, t, [a + 0.05, Wt('voitures', a)]); ktP(k2, t, [Wt('en', a), Wt('stock', a) - 0.05, Wt('?', 25.5)]);
    };
  }
  // « Pfff… » : 15 voitures en rafale, tout s'affaisse
  { const a = VT.marks.pfff.t, s = scene(a, VT.marks.carnet.t, 'var(--w)');
    const kp = KT(s.cam, h(160, 140), h(250, 290), h(520, 400), [['Pfff…', { i: 1, c: '#ddd4c8' }]]);
    const P = ['Clio IV', '308', 'Captur', 'A3', 'Yaris', 'Golf VI', '207', 'C4 Picasso', 'Mégane III', 'Fiesta', 'Auris', 'C3', 'Sandero', 'Clio III', 'Twingo II'];
    P.forEach((_, i) => cue(a + i * GR.beat / 4 - 0.25 + 0.3, 'pop', 0.35));
    const pu = P.map((m, i) => { const e = mk('div', 'puce a', s.cam, null, `<b>●</b>${m}`); const n = h(5, 3), c = i % n, r = Math.floor(i / n); Object.assign(e, V ? { X: 250 + c * 250 + (r % 2) * 25, Y: 800 + r * 125 + ((i * 37) % 40), R: ((i * 53) % 15) - 7 } : { X: 560 + c * 260 + (r % 2) * 60, Y: 560 + r * 120 + ((i * 37) % 40), R: ((i * 53) % 15) - 7 }); return e; });
    men(s, 'Données de démonstration');
    s.paint = (t) => {
      ktP(kp, t, a - 0.05, 'blur', null, 'up', { fx: (i, j, tt) => ({ y: E(tt, a + 0.35 + j * 0.06, 0.7) * (16 + j * 12), r: E(tt, a + 0.35, 0.7) * (j % 2 ? 6 : -5) }) });
      pu.forEach((e, i) => pose(e, t, (tt) => { const t0 = a + i * GR.beat / 4 - 0.25; if (tt < t0) return null; const p = E(tt, t0, 0.32), g = E(tt, a + 0.7 + i * 0.02, 0.6); return { x: e.X, y: lerp(-150, e.Y, p) + 28 * g, c: 1, r: e.R * (1 + g) - 20 * (1 - p), s: 1 - 0.04 * g }; }));
    };
  }
  // « Carnet, calculette, quatorze onglets… » : un mot et un objet par temps, le bureau tremble, puis tout est aspiré
  { const a = VT.marks.carnet.t, tCa = VT.marks.calculette.t, t14 = Wt('14', a), tHop = VT.marks.hop.t, s = scene(a, tHop, 'var(--beige)', { type: 'cut' }, 0.02);
    const k1 = KT(s.cam, h(96, 140), h(160, 250), 150, 'Carnet.'), k2 = KT(s.cam, h(96, 140), h(330, 410), 150, 'Calculette.'), k3 = KT(s.cam, h(96, 140), h(500, 570), 170, [['14 onglets…', { i: 1, c: 'var(--o)' }]]);
    const desk = mk('div', 'a', s.cam, { width: '1200px', height: '900px' });
    const note = mk('div', 'note a', desk, { left: '120px', top: '220px' }, 'Clio · 6 700 → marge ?<br>308 : CT ok ? <s>4 100</s> 3 900<br>Captur → baisser ??<br>A3 Lyon… rappeler<br>frais ≈ ?');
    const calc = mk('div', 'calc a', desk, { left: '640px', top: '330px' }, `<div class="e">0</div><div class="k">${'<span></span>'.repeat(15)}<span class="o"></span></div>`);
    const scr = calc.querySelector('.e');
    const TB = ['Annonce Clio', 'Cote 308', 'Carte grise : simulateur', 'Assurance', 'Annonce A3', 'Contrôle technique', 'Pneus prix', 'Annonce Captur', 'Messages', 'Tableur marges', 'Cote Captur', 'Banque', 'Annonce Polo', 'Calendrier']
      .map((x, i) => { const e = mk('div', 'tab a', desk, null, x); Object.assign(e, { X: (i % 4) * 270 + ((i * 53) % 40), Y: Math.floor(i / 4) * 80 + ((i * 29) % 30), R: ((i * 7) % 9) - 4 }); return e; });
    cue(a + 0.3, 'thud'); cue(tCa + 0.3, 'thud'); [0.27, 0.54, 0.8].forEach((d) => cue(tCa + d, 'click', 0.4));
    for (let i = 0; i < 14; i++) cue(t14 + i * 0.075 + 0.3, 'pop', 0.25);
    cue(tHop - 0.62, 'suck');
    const drop = (e, t0, x, y, r) => (tt) => { if (tt < t0) return null; const p = E(tt, t0, 0.3); return { x, y: y - 500 * (1 - p), r: r + 14 * (1 - p), s: 1 + 0.5 * (1 - p) }; };
    s.paint = (t) => {
      ktP(k1, t, a, 'drop'); ktP(k2, t, tCa, 'drop'); ktP(k3, t, [t14, Wt('onglets', a)], 'drop');
      const sh = E(t, t14 + 0.4, 0.8) * 10, imp = E(t, tHop - 0.14, 0.14, eIn);
      pose(desk, t, (tt) => ({ x: h(1420, 540) + noise(5, tt * 22) * sh, y: h(540, 1150) + noise(9, tt * 22) * sh, c: 1, p: 1, rx: 28, ry: 0, r: -8 + 30 * E(tt, tHop - 0.14, 0.14, eIn), s: h(0.82, 0.66) * (1 - 0.85 * E(tt, tHop - 0.14, 0.14, eIn)) }));
      pose(note, t, drop(note, a, 0, 0, -7)); pose(calc, t, drop(calc, tCa, 0, 0, 8));
      scr.textContent = t < tCa + 0.27 ? '0' : t < tCa + 0.54 ? '-1' : t < tCa + 0.8 ? '-13' : '-130';
      TB.forEach((e, i) => pose(e, t, drop(e, t14 + i * 0.075, e.X, e.Y, e.R)));
      s.cam.style.opacity = (1 - imp).toFixed(3);
    };
  }
  // « Hop ! »
  { const a = VT.marks.hop.t, s = scene(a, Wt('tu', a + 0.4), 'var(--o)', { type: 'cut' }, 0); s.imp.push([a + 0.14, 20]);
    const rays = mk('div', 'a', s.cam, { width: W + 'px', height: H + 'px', background: `repeating-conic-gradient(from 0deg at ${W / 2}px ${H / 2}px,rgba(255,255,255,.17) 0deg 1.2deg,transparent 1.2deg 9deg)`, webkitMaskImage: `radial-gradient(circle at ${W / 2}px ${H / 2}px,transparent 280px,#000 ${h(760, 900)}px)` });
    const k = KT(s.cam, 0, 0, 520, [['Hop', { c: '#fff' }], ['!', { c: '#fff' }]], {}, h(0, 860));
    const tEx = Wt('!', a + 0.1), tOut = Wt('tu', a + 0.4);
    cue(a, 'impact', 1.1); cue(tOut - 0.2, 'whoosh', 0.8);
    s.paint = (t) => {
      rays.style.transform = `rotate(${((t - a) * 14).toFixed(2)}deg)`;
      k.box.style.left = (W / 2 - k.box.offsetWidth / 2) + 'px'; k.box.style.top = (H / 2 - k.box.offsetHeight / 2) + 'px';
      ktP(k, t, [a, tEx], 'slam');
      const z = E(t, tOut - 0.16, 0.18, eIn); k.box.style.transform = `scale(${(1 + 7 * z).toFixed(3)})`; k.box.style.transformOrigin = '42% 55%'; k.box.style.opacity = (1 - z).toFixed(3);
    };
  }
  // « Tu ouvres ton tableau de bord, tu sais quoi faire ce matin. »
  { const a = Wt('tu', VT.marks.hop.t + 0.4) - 0.04, s = scene(a, VT.marks.n308.t - 0.5, 'var(--w)', { type: 'circle', x: W / 2, y: H / 2, d: 0.32 });
    const k1 = KT(s.cam, h(96, 140), h(210, 250), 150, 'Ton tableau'), k2 = KT(s.cam, h(96, 140), h(370, 400), 180, [['de bord.', { i: 1, c: 'var(--o)' }]]);
    const kb = brk(s.cam, h(100, 144), h(640, 620), [['[ tu sais quoi faire', {}], ['ce matin', { c: 'var(--o)' }], [']', {}]]);
    const DW = h(680, 620), dash = crop(s.cam, 'tb-entete', { W: 1074, x: 0, y: 0, w: 1074, h: 2640 }, DW, { height: (2215 * DW / 1074) + 'px' });
    const tS = [Wt('sais', a), Wt('faire', a), Wt('matin', a) - 0.05];
    men(s, 'Données de démonstration');
    s.paint = (t) => {
      ktP(k1, t, [Wt('ton', a), Wt('tableau', a)]); ktP(k2, t, [Wt('de', 31.8), Wt('bord', a)]);
      ktP(kb, t, [Wt('tu', 32.3) - 0.05, Wt('tu', 32.3), Wt('sais', a), Wt('quoi', a), Wt('faire', a), Wt('ce', 33), Wt('matin', a), Wt('matin', a) + 0.2]);
      pose(dash, t, (tt) => { const p = E(tt, a + 0.05, 0.7); return { x: h(1420, 560), y: h(640, 1320) + 500 * (1 - p), c: 1, p: 1, rx: 24 + 40 * (1 - p), ry: -16, r: h(-6, -3), s: 0.5 + 0.5 * p, b: 10 * (1 - p) }; });
      let sc = 0; tS.forEach((t0) => { sc += E(t, t0, 0.42); });
      dash.img.style.top = (-sc / 3 * 640 * dash.k).toFixed(1) + 'px';
    };
  }
  // « La 308 dort depuis 63 jours ? Baisse le prix. »
  { const a = VT.marks.n308.t - 0.5, t63 = VT.marks.n63.t, tB = VT.marks.baisse.t, s = scene(a, Wt('une', 37), 'var(--w)', { type: 'slab', d: 0.38 });
    const k1 = KT(s.cam, h(96, 140), h(110, 250), 76, 'La 308 dort depuis');
    const R = ROLL(s.cam, h(80, 130), h(190, 330), 480, '00', '63', 'var(--o)');
    const kj = KT(s.cam, h(640, 520), h(470, 650), 170, [['jours.', { i: 1 }]]);
    const card = crop(s.cam, 'tb-entete', { W: 1074, x: 40, y: 1330, w: 994, h: 450 }, 740);
    const hl = mk('div', 'hl a', card, { left: (230 * card.k) + 'px', top: (318 * card.k) + 'px', width: (300 * card.k) + 'px', height: (78 * card.k) + 'px' });
    const kb = brk(s.cam, h(100, 144), h(840, 1310), [['[', {}], ['Baisse le prix.', { c: 'var(--o)' }], [']', {}]]);
    const cur = cursor(s.cam, V ? [[a, 1200, 1900], [t63 + 0.3, 700, 1300], [tB - 0.05, 396, 1232]] : [[a, 2000, 1050], [t63 + 0.3, 1520, 820], [tB - 0.05, 1306, 712]], [tB], true);
    cue(t63 - 0.05, 'roll'); cue(tB, 'click');
    men(s, 'Données de démonstration');
    s.paint = (t) => {
      ktP(k1, t, [a + 0.5, VT.marks.n308.t, Wt('dort', a), Wt('depuis', a)]);
      R.box.style.visibility = t >= t63 - 0.1 ? '' : 'hidden'; rollP(R, t, t63 - 0.05, 0.6, 0.1);
      ktP(kj, t, Wt('jours', t63));
      pose(card, t, (tt) => { const p = E(tt, a + 0.25, 0.6); return { x: h(1450, 540), y: h(560, 1080) + 400 * (1 - p), c: 1, p: 1, rx: 6 + 50 * (1 - p), ry: -10, r: -1, o: p * 2, s: 1 - 0.03 * bump(tt, tB - 0.03, 0.14) }; });
      const hp = E(t, tB - 0.4, 0.3); hl.style.opacity = hp; hl.style.transform = `scale(${(1.1 - 0.1 * hp).toFixed(3)})`;
      ktP(kb, t, [tB - 0.05, tB, Wt('le', tB), Wt('prix', tB), Wt('prix', tB) + 0.15]);
      cur(t);
    };
  }
  // « Une A3 sous la cote ? Ding ! T'as l'alerte. »
  { const a = Wt('une', 37), tD = VT.marks.ding.t, tAl = VT.marks.alerte.t, s = scene(a, Wt('et', 40.3), 'var(--k)'); s.imp.push([tD + 0.18, 22]);
    const k1 = V ? [KT(s.cam, 140, 560, 92, [['Une A3', { c: '#fff' }]]), KT(s.cam, 140, 670, 92, [['sous la cote', { c: '#fff' }], ['?', { c: 'var(--o)' }]])] : KT(s.cam, 100, 560, 92, [['Une A3 sous la cote', { c: '#fff' }], ['?', { c: 'var(--o)' }]]);
    const kd = KT(s.cam, h(90, 130), h(100, 240), h(360, 330), [['Ding', { c: 'var(--o)' }], ['!', { c: 'var(--o)' }]]);
    const ka = brk(s.cam, h(100, 144), h(720, 790), [["[ T'as", {}], ["l'alerte.", { c: 'var(--o)' }], [']', {}]], '#fff');
    const a3 = crop(s.cam, 'tb-marche-annonce-1', { W: 840, x: 0, y: 500, w: 840, h: 760 }, h(520, 480), { opacity: 0.92 });
    const rings = [0, 1, 2].map(() => mk('div', 'a rip', s.cam, { width: '200px', height: '200px' }));
    const nf = mk('div', 'notif a', s.cam, null, '<div class="ic"><svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="#1a1310" stroke-width="2.4" stroke-linecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></div><div><div class="t">Audi A3 Sportback · −18 % sous la cote</div><div class="s">Nouvelle annonce · à analyser avant les autres</div></div>');
    const bell = nf.querySelector('.ic svg');
    cue(tD, 'ding'); cue(tD, 'impact', 0.6); cue(tAl, 'click');
    const cur = cursor(s.cam, V ? [[a, 1200, 1900], [tAl - 0.05, 640, 1010], [tAl + 0.8, 660, 1040]] : [[a, 2000, 1060], [tAl - 0.05, 1540, 610], [tAl + 0.8, 1560, 640]], [tAl]);
    men(s, 'Données de démonstration', '#fff');
    s.paint = (t) => {
      const t1 = [a, Wt('a3', a), Wt('sous', a), Wt('la', 38.3), Wt('cote', a), Wt('?', 38.7)];
      if (V) { ktP(k1[0], t, t1.slice(0, 2)); ktP(k1[1], t, t1.slice(2)); } else ktP(k1, t, t1);
      ktP(kd, t, [tD, Wt('!', tD + 0.1)], 'slam');
      ktP(ka, t, [Wt('t', 39.6) - 0.05, Wt('t', 39.6), tAl, tAl + 0.2]);
      pose(a3, t, (tt) => { const p = E(tt, Wt('a3', a) - 0.1, 0.6); return { x: h(lerp(2300, 1600, p), lerp(1600, 600, p)), y: h(760, 1230), c: 1, p: 1, rx: 8, ry: 16 + 30 * (1 - p), r: 2 }; });
      pose(nf, t, (tt) => { if (tt < tD - 0.02) return null; const p = E(tt, tD, 0.35); return { x: h(1450, 540), y: lerp(-200, h(560, 1000), p), c: 1, r: -3, s: 0.86 * (1 - 0.03 * bump(tt, tAl - 0.03, 0.14)) }; });
      const w = t - tD; bell.style.transform = `rotate(${(w > 0 ? 16 * Math.sin(w * 32) * Math.exp(-w * 5) : 0).toFixed(2)}deg)`;
      rings.forEach((e, i) => { const t0 = tD + i * GR.beat / 2, q = E(t, t0, 0.7); if (t < t0 || t > t0 + 0.7) { e.style.display = 'none'; return; } pose(e, t, () => ({ x: h(1135, 235), y: h(560, 1005), c: 1, s: 0.4 + 2.4 * q, o: 1 - q })); });
      cur(t);
    };
  }
  // « Et ta vraie marge, voiture par voiture. »
  { const a = Wt('et', 40.3), tM = VT.marks.marge.t, s = scene(a, VT.marks.debutes.t, 'var(--w)');
    const k1 = KT(s.cam, h(96, 140), h(120, 250), 110, 'Ta vraie marge,'), k2 = KT(s.cam, h(96, 140), h(250, 370), 120, [['voiture par voiture.', { i: 1, c: 'var(--o)' }]]);
    const R = ROLL(s.cam, h(90, 134), h(470, 500), h(230, 200), '0 000 €', '4 860 €', 'var(--ink)');
    const kg = brk(s.cam, h(100, 144), h(730, 730), [['▲ + 3 870 € par rapport à septembre', { c: 'var(--ok)' }]], 'var(--ok)');
    kg.box.style.fontWeight = 700;
    const mg = crop(s.cam, 'tb-marges', { W: 1074, x: 0, y: 0, w: 1074, h: 790 }, 680);
    const row = mk('div', 'hl a', mg, { left: (30 * mg.k) + 'px', width: (1014 * mg.k) + 'px', height: (74 * mg.k) + 'px' });
    const bub = mk('div', 'bub a', s.cam, null, 'Renault Mégane III<small>marge prévue + 1 410 €</small>');
    const tV = [Wt('voiture', tM), Wt('par', tM), Wt('voiture', tM + 0.4)];
    cue(a, 'whoosh', 0.5); cue(tM, 'roll'); cue(tV[2], 'pop');
    men(s, 'Données de démonstration');
    s.paint = (t) => {
      ktP(k1, t, [Wt('ta', a), Wt('vraie', a), tM]); ktP(k2, t, tV);
      R.box.style.visibility = t >= tM - 0.05 ? '' : 'hidden'; rollP(R, t, tM, 0.7, 0.07);
      ktP(kg, t, tV[2] - 0.1, 'rise', null, 'up', { step: 0.02 });
      pose(mg, t, (tt) => { const p = E(tt, a - 0.03, 0.6); return { x: h(lerp(2400, 1460, p), lerp(1700, 540, p)), y: h(540, 1110), c: 1, p: 1, rx: 14, ry: -12 - 30 * (1 - p), r: -2 }; });
      let rr = 0; for (let i = 0; i < 5; i++) rr += E(t, tM + i * GR.beat / 2, 0.22);
      row.style.top = ((318 - 37 + 84 * rr) * mg.k).toFixed(1) + 'px'; row.style.opacity = E(t, tM - 0.1, 0.2).toFixed(3);
      pose(bub, t, (tt) => { if (tt < tV[2] - 0.05) return null; const p = E(tt, tV[2], 0.3); return { x: h(1560, 640), y: h(470, 1040) + 30 * (1 - p), c: 1, r: -2, s: 0.7 + 0.3 * p, o: p }; });
    };
  }
  // formules : interrupteur « Je débute | J'ai un parc »
  const seg = (parent, dark) => { const e = mk('div', 'seg a', parent, { position: 'absolute', left: CX(h(96, 140)) + 'px', top: h(110, 250) + 'px', zIndex: 5 }, '<div class="a" style="top:10px;bottom:10px;border-radius:999px"></div><span style="position:relative;z-index:1">Je débute</span><span style="position:relative;z-index:1">J\'ai un parc</span>'); e.ind = e.firstChild; e.sp = e.querySelectorAll('span'); e.ind.style.background = dark ? 'var(--o)' : 'var(--k)'; return e; };
  // « Tu débutes ? Starter. »
  { const a = VT.marks.debutes.t, tS = VT.marks.starter.t, s = scene(a, Wt('une', 44.5), 'var(--o)');
    const sg = seg(s.cam, false), tClick = a + 0.36;
    const ks = KT(s.cam, h(90, 130), h(320, 390), h(250, 230), [['Starter.', { c: '#fff' }]]), kp = KT(s.cam, h(100, 144), h(620, 630), h(90, 84), [['14,99 € / mois', { c: 'var(--k)' }]]);
    const card = crop(s.cam, 'offre-starter', { W: 1050, x: 0, y: 0, w: 1050, h: 740 }, h(600, 640), { background: '#fff' });
    const cur = cursor(s.cam, V ? [[a - 0.4, 700, 1300], [tClick - 0.02, 255, 330]] : [[a - 0.4, 700, 700], [tClick - 0.02, 240, 190]], [tClick], true);
    cue(tClick, 'click'); cue(tS, 'whoosh', 0.6);
    men(s, 'Exemples chiffrés, pas une promesse de gain', '#fff');
    s.paint = (t) => {
      pose(sg, t, (tt) => { const p = E(tt, a, 0.35); return { x: 0, y: -40 * (1 - p), o: p }; });
      const s0 = sg.sp[0], ip = E(t, tClick, 0.25); Object.assign(sg.ind.style, { left: s0.offsetLeft + 'px', width: s0.offsetWidth + 'px', transform: `scale(${(0.5 + 0.5 * ip).toFixed(3)})`, opacity: ip });
      s0.style.color = ip > 0.5 ? '#fff' : '';
      ktP(ks, t, tS, 'rise'); ktP(kp, t, tS + 0.35, 'rise', null, 'up', { step: 0.05 });
      pose(card, t, (tt) => { if (tt < tS - 0.05) return null; const p = E(tt, tS, 0.55); return { x: h(1520, 540), y: h(560, 1070), c: 1, p: 1, rx: 8, ry: -14 + 100 * (1 - p), r: -2 }; });
      cur(t);
    };
  }
  // « Avec une seule voiture bien achetée, tu paies trois ans. »
  { const a = Wt('une', 44.5), tTrois = Wt('trois', 46), tAns = VT.marks.ans.t, s = scene(a, Wt('tu', 47.2), 'var(--w)');
    const k1 = KT(s.cam, h(90, 130), h(120, 250), h(260, 230), [['1', { c: 'var(--o)' }], ['voiture', {}]]);
    const k2 = KT(s.cam, h(100, 140), h(400, 520), h(230, 190), [['=', { i: 1 }], ['3', { i: 1, c: 'var(--o)', s: '1.25em' }], ['ans payés.', { i: 1 }]]);
    const gauge = mk('div', 'gauge a', s.cam, null, '<div class="h"><span>+ 670 € de marge</span><b>= 0 mois</b></div><div class="bar"><i style="width:100%"></i></div><div class="s">Exemple calculé : achetée 5 000 €, 630 € de frais, revendue 6 300 €</div>');
    const gb = gauge.querySelector('.bar i'), gm = gauge.querySelector('b'); gm.style.display = 'inline-block';
    const tG = [Wt('bien', a), Wt('achetee', a), Wt('tu', 46), tTrois];
    tG.forEach((tg) => cue(tg, 'pop', 0.55)); cue(tAns, 'pop');
    men(s, 'Exemples chiffrés, pas une promesse de gain');
    s.paint = (t) => {
      ktP(k1, t, [a - 0.06, Wt('voiture', a)]); ktP(k2, t, [Wt('tu', 46), tTrois, tAns, tAns + 0.12]);
      pose(gauge, t, (tt) => { const p = E(tt, Wt('seule', a), 0.5); return { x: h(1300, 540), y: h(790, 1120) + 300 * (1 - p), c: 1, p: 1, rx: 10 + 40 * (1 - p), ry: -10, r: -1, o: p * 2, s: h(1, 0.8) }; });
      let f = 0; tG.forEach((t0) => { f += E(t, t0, 0.4); }); f /= 4;
      gb.style.transformOrigin = '0 50%'; gb.style.transform = `scaleX(${f.toFixed(4)})`;
      gm.textContent = `= ${Math.round(44 * f)} mois`; gm.style.transform = `scale(${(1 + 0.15 * bump(t, tAns - 0.03, 0.16)).toFixed(3)})`;
    };
  }
  // « Tu gères un parc ? Pro. »
  { const a = Wt('tu', 47.2), tParc = VT.marks.parc.t, tPro = VT.marks.pro.t, s = scene(a, Wt('et', 48.6), 'var(--k)'); s.imp.push([tPro + 0.18, 18]);
    const sg = seg(s.cam, true);
    const kp = KT(s.cam, h(80, 130), h(250, 370), h(480, 420), [['Pro.', { c: '#fff' }]]), kq = KT(s.cam, h(100, 144), h(720, 770), 90, [['79 € / mois', { c: 'var(--o)' }]]);
    const st_ = crop(s.cam, 'offre-starter', { W: 1050, x: 0, y: 0, w: 1050, h: 740 }, h(520, 480), { background: '#fff', opacity: 0.5 });
    const pro = crop(s.cam, 'offre-pro', { W: 1050, x: 0, y: 0, w: 1050, h: 740 }, h(640, 600), { background: '#fff' });
    const cur = cursor(s.cam, V ? [[a - 0.3, 300, 340], [tParc - 0.02, 575, 330]] : [[a - 0.3, 400, 200], [tParc - 0.02, 560, 190]], [tParc], true);
    cue(tParc, 'click'); cue(tParc + 0.05, 'whoosh', 0.6); cue(tPro, 'impact');
    men(s, 'Exemples chiffrés, pas une promesse de gain', '#fff');
    s.paint = (t) => {
      const [s0, s1] = sg.sp, ind = Motion.indicator(t, [[0, s0.offsetLeft, s0.offsetLeft + s0.offsetWidth], [tParc, s1.offsetLeft, s1.offsetLeft + s1.offsetWidth]]);
      Object.assign(sg.ind.style, { left: ind.lo.toFixed(1) + 'px', width: (ind.hi - ind.lo).toFixed(1) + 'px' });
      s0.style.color = t < tParc ? '#fff' : ''; s1.style.color = t >= tParc ? '#1a1310' : '';
      ktP(kp, t, tPro, 'slam'); ktP(kq, t, tPro + 0.18, 'rise', null, 'up', { step: 0.05 });
      pose(st_, t, () => ({ x: h(1300, 470), y: h(470, 1060), c: 1, p: 1, rx: 8, ry: -14, r: -2, s: 0.92 }));
      pose(pro, t, (tt) => { if (tt < tParc) return null; const p = E(tt, tParc + 0.04, 0.5); return { x: h(lerp(2400, 1500, p), lerp(1700, 580, p)), y: h(600, 1170), c: 1, p: 1, rx: 8, ry: -14 - 30 * (1 - p), r: -2 }; });
      cur(t);
    };
  }
  // « Essaie trois jours, sans carte bancaire. utopicar.fr »
  { const a = Wt('et', 48.6), t3 = Wt('trois', 48.9), tSans = Wt('sans', 49.5), tLien = Wt('lien', 50), s = scene(a, VT.marks.chiffres.t, 'var(--w)');
    const k1 = KT(s.cam, h(96, 140), h(130, 250), 200, 'Essaie'), k2 = KT(s.cam, h(96, 140), h(330, 450), 260, [['3 jours.', { i: 1, c: 'var(--o)' }]]);
    const btn = mk('img', 'a', s.cam, { width: h(820, 720) + 'px' }); btn.src = UI + 'bouton-essai.png';
    const chk = (txt) => mk('div', 'a', s.cam, { font: '700 60px Satoshi', whiteSpace: 'nowrap' }, `<span style="display:inline-flex;width:76px;height:76px;border-radius:50%;background:var(--ok);color:#fff;align-items:center;justify-content:center;margin-right:20px">✓</span>${txt}`);
    const c1 = chk('Sans carte bancaire'), c2 = chk(h('utopicar.fr', 'Lien en bio'));
    const tClick = tSans - 0.08;
    const cur = cursor(s.cam, V ? [[a, 1200, 1900], [tClick - 0.02, 600, 1010], [tLien + 0.4, 660, 1090]] : [[a, 2000, 1000], [tClick - 0.02, 1430, 460], [tLien + 0.4, 1500, 560]], [tClick]);
    cue(tClick, 'click'); cue(tSans, 'pop'); cue(tLien, 'pop');
    men(s, 'Exemples chiffrés, pas une promesse de gain');
    s.paint = (t) => {
      ktP(k1, t, a + 0.02); ktP(k2, t, [t3, Wt('jours', t3)]);
      pose(btn, t, (tt) => { const p = E(tt, a + 0.2, 0.45); return { x: h(1360, 540), y: h(430, 990), c: 1, s: (0.6 + 0.4 * p) * (1 - 0.05 * bump(tt, tClick - 0.03, 0.14)), o: p * 2 }; });
      pose(c1, t, (tt) => { if (tt < tSans - 0.02) return null; const p = E(tt, tSans, 0.38); return { x: h(1010, 150), y: h(700, 1150) + 60 * (1 - p), o: p }; });
      pose(c2, t, (tt) => { if (tt < tLien - 0.02) return null; const p = E(tt, tLien, 0.38); return { x: h(1010, 150), y: h(810, 1270) + 60 * (1 - p), o: p }; });
      cur(t);
    };
  }
  // « Tu chiffres ta prochaine marge avant d'appeler. »
  { const a = VT.marks.chiffres.t, s = scene(a, VT.marks.utopicar2.t, 'var(--k)');
    const k0 = KT(s.cam, h(96, 140), h(120, 250), 90, [['Tu chiffres', { c: '#8a8178' }]]);
    const k1 = KT(s.cam, h(96, 140), h(250, 380), 200, [['Ta prochaine', { c: '#fff' }]]), k2 = KT(s.cam, h(96, 140), h(430, 530), 200, [['marge,', { c: '#fff' }]]);
    const k3 = V ? [KT(s.cam, 140, 760, 210, [['avant', { i: 1, c: 'var(--o)' }]]), KT(s.cam, 140, 960, 210, [["d'appeler.", { i: 1, c: 'var(--o)' }]])] : KT(s.cam, 96, 620, 210, [["avant d'appeler.", { i: 1, c: 'var(--o)' }]]);
    s.paint = (t) => {
      ktP(k0, t, [a, Wt('chiffres', a) + 0.11]);
      ktP(k1, t, [Wt('ta', a), Wt('prochaine', a)]); ktP(k2, t, Wt('marge', a));
      if (V) { ktP(k3[0], t, Wt('avant', a)); ktP(k3[1], t, Wt('appeler', a) - 0.1); } else ktP(k3, t, [Wt('avant', a), Wt('appeler', a) - 0.1]);
    };
  }
  // « UTOPICAR. » : carton final, logo animé, bouton cliqué qui bat au tempo
  { const a = VT.marks.utopicar2.t, s = scene(a, DUR + 1, 'var(--o)', { type: 'circle', x: W / 2, y: H / 2, d: 0.5 }, 0.015);
    const L = logo(s.cam, W / 2, h(430, 820), h(1000, 760));
    const cta = mk('div', 'pill a', s.cam, { background: '#fff', color: 'var(--ink)', fontSize: h(52, 46) + 'px', padding: h('30px 56px', '28px 48px') }, `<b style="color:var(--o)">3 jours offerts</b> · ${h('utopicar.fr', 'lien en bio')}`);
    const tCl = END + 1.2;
    cue(a + 0.06, 'pop', 0.8); cue(a + 0.25, 'whoosh', 0.7); cue(a + 0.5, 'pop', 0.6); cue(END, 'pop', 0.7); cue(tCl, 'click');
    const cur = cursor(s.cam, V ? [[END, 1200, 1900], [tCl - 0.02, 720, 1100], [tCl + 1.2, 790, 1150]] : [[END, 1700, 1100], [tCl - 0.02, 1150, 712], [tCl + 1.2, 1220, 760]], [tCl]);
    men(s, 'Exemples chiffrés, pas une promesse de gain', '#fff');
    s.paint = (t) => {
      L(t, a + 0.05);
      pose(cta, t, (tt) => { if (tt < END - 0.05) return null; const p = E(tt, END, 0.45); return { x: W / 2, y: h(690, 1080) + 80 * (1 - p), c: 1, o: p * 2, s: (1 + 0.025 * pulse(tt)) * (1 - 0.05 * bump(tt, tCl - 0.03, 0.14)) }; });
      cur(t);
    };
  }

  // ---------- seek ----------
  window.seek = (t) => { for (const s of SC) paintScene(s, t); };
  window.filmDur = DUR;
  window.cues = CUES.sort((x, y) => x.t - y.t);
  window.seek(0);
  window.filmReady = true;
})();
