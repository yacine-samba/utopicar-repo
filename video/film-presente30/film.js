// présentation UTOPICAR 30 s, sans voix, tout en sound design (moteur du master60 « wow » ; 16:9 et ?fmt=vertical) — maquette validée (maquette-master60/), animée.
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
  const GR = { ancre: 0, beat: 0.5 };   // 120 BPM, premier temps à 0 (la musique est calée dessus)
  const MUR = (await J('../assets/master60/annonces-mur.json')).annonces;
  const LOGO = await (await fetch('../assets/brand/official/utopicar-logo-horizontal-fond-sombre.svg')).text();
  await Promise.all(['700 200px Clash', '600 60px Clash', '700 40px Satoshi', '500 30px Satoshi', 'italic 200px Instrument'].map((f) => document.fonts.load(f)));
  const UI = '../film-master60/ui-blanc/', PH = '../assets/master60/photos/';
  const DUR = 30.0;

  // ---------- temps : mots de la voix, grille ----------
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const fixW = (ws) => { let prev = -9; return ws.map((w) => { let s = w.s; if (s <= prev + 0.04) s = prev + 0.11; prev = s; return { ...w, s, n: norm(w.w) }; }); };
  const BT = (n) => GR.ancre + n * GR.beat;
  const BRK = [12, 14];   // coupure musicale
  const pulse = (t) => { if (t < 0 || (t >= BRK[0] && t < BRK[1])) return 0; const x = t / GR.beat, n = Math.floor(x); return Math.exp(-((x - n) * GR.beat) / 0.11) * (n % 4 === 0 ? 1 : 0.55); };
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

  // =====================================================================================================
  // Présentation 30 s, sans voix : chaque idée dite par un texte géant, posée sur la grille (1 temps = 0,5 s)
  // 0 accroche · 3 logo · 5 analyse · 8 marge · 12 coupure « Marchand ? » · 14 drop recherches suivies
  // 18 e-mail · 21 messages automatiques · 24 tableau de bord · 26 carton final
  // =====================================================================================================
  const T = { logo: 3, ana: 5, mar: 8, cut: 12, rec: 14, mail: 18, msg: 21, tb: 24, fin: 26 };
  const C = h(96, 140), Y = (a, b) => h(a, b);
  // ---------- 0–3 s : « Ce prix cache 1 650 €. »
  { const s = scene(-1, T.logo, 'var(--w)');
    const k1 = KT(s.cam, C, Y(170, 280), h(170, 160), 'Ce prix'), k2 = KT(s.cam, C, Y(350, 440), h(190, 170), [['cache', { i: 1 }]]);
    const R = ROLL(s.cam, h(90, 134), Y(560, 620), h(220, 200), '+0 000 €', '+1 650 €', 'var(--r)');
    const card = lst(s.cam), mark = card.querySelector('.p i'), price = card.querySelector('.p');
    const crack = mk('div', 'a', card, { left: '20px', right: '20px', bottom: '58px', height: '4px', background: 'var(--r)', transformOrigin: '0 50%' });
    const cur = cursor(s.cam, V ? [[-1, 1200, 1900], [0.9, 460, 1380], [3, 470, 1390]] : [[-1, 2100, 1000], [0.9, 1300, 790], [3, 1310, 800]], [1.0]);
    cue(0, 'impact', 0.9); cue(0.5, 'pop', 0.6); cue(1.0, 'click'); cue(1.5, 'thud', 0.8); cue(2.0, 'roll'); cue(2.5, 'impact', 0.7);
    s.paint = (t) => {
      ktP(k1, t, [-0.3, 0.25], 'rise', 2.8, 'up'); ktP(k2, t, 1.0, 'slam', 2.8, 'up');
      R.box.style.visibility = t >= 1.95 ? '' : 'hidden'; rollP(R, t, 2.0, 0.6, 0.06);
      pose(card, t, (tt) => { const p = E(tt, -0.6, 0.6), sh = E(tt, 1.5, 0.12) * (1 - E(tt, 1.62, 0.4)); return { x: h(lerp(2400, 1400, p), lerp(1700, 560, p)) + noise(3, tt * 40) * 14 * sh, y: h(540, 1110), c: 1, p: 1, rx: 10, ry: -22 - 34 * (1 - p), r: -3 + 3 * E(tt, 1.5, 0.3) }; });
      mark.style.transform = `scaleX(${E(t, 0.5, 0.4).toFixed(3)})`;
      crack.style.transform = `scaleX(${E(t, 1.5, 0.25).toFixed(3)})`; price.style.color = t >= 1.5 ? 'var(--r)' : '';
      cur(t);
    };
  }
  // ---------- 3–5 s : logo
  { const a = T.logo, s = scene(a, T.ana, 'var(--o)', { type: 'circle', x: h(1310, 470), y: h(800, 1390), d: 0.5 });
    const L = logo(s.cam, W / 2, h(470, 820), h(1100, 760));
    const kc = brk(s.cam, 0, h(720, 1050), [["L'achat-revente auto,", { c: '#fff' }], ['au chiffre près.', { c: 'var(--k)' }]], '#fff', 54);
    cue(a + 0.06, 'pop', 0.8); cue(a + 0.25, 'whoosh', 0.7); cue(a + 0.5, 'pop', 0.6);
    s.paint = (t) => { L(t, a + 0.05); kc.box.style.left = (W / 2 - kc.box.offsetWidth / 2) + 'px'; ktP(kc, t, a + 1.0, 'rise', null, 'up', { step: 0.12 }); };
  }
  // ---------- 5–8 s : on colle l'annonce, prix max
  { const a = T.ana, s = scene(a, T.mar, 'var(--k)', { type: 'slab', d: 0.42 });
    const k1 = KT(s.cam, C, Y(140, 280), 150, [['Colle', { c: '#fff' }], ["l'annonce.", { i: 1, c: 'var(--o)' }]]);
    const field = mk('div', 'a', s.cam, { width: h(1500, 800) + 'px', height: h(170, 140) + 'px', borderRadius: '999px', background: '#fff', display: 'flex', alignItems: 'center', padding: h('0 20px 0 56px', '0 16px 0 36px'), gap: '20px', boxShadow: '0 50px 100px -30px rgba(0,0,0,.8)' });
    const txt = mk('div', '', field, { flex: '1', font: `500 ${h(44, 34)}px Satoshi`, color: '#1c1612', whiteSpace: 'nowrap', overflow: 'hidden' });
    const chars = [...h('…/annonce/volkswagen-golf-vii-tdi', '…/annonce/golf-vii')].map((ch) => mk('span', '', txt, null, ch));
    const BW = h(340, 250), BH = h(130, 108);
    const btn = mk('div', '', field, { flex: 'none', height: BH + 'px', borderRadius: '999px', background: 'var(--o)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 ${h(52, 40)}px Clash`, color: '#1a1310', overflow: 'hidden', position: 'relative' }, 'Analyser');
    const spin = mk('div', 'a', btn, { width: '60px', height: '60px', borderRadius: '50%', border: '8px solid rgba(26,19,16,.25)', borderTopColor: '#1a1310', left: '50%', top: '50%', display: 'none' });
    const kp = KT(s.cam, C, Y(640, 1130), 80, [['Prix', { c: '#fff' }], ['max', { c: '#fff' }]]);
    const R = ROLL(s.cam, h(90, 134), Y(740, 1230), h(190, 180), '00 000 €', '16 500 €', 'var(--o)');
    const tType = a + 0.5, tClick = a + 1.5, tR = a + 2.0;
    const cur = cursor(s.cam, V ? [[a, 1150, 1900], [tClick - 0.02, 800, 760]] : [[a, 1800, 1100], [tClick - 0.02, 1500, 470]], [tClick], true);
    cue(tType, 'type'); cue(tClick, 'click'); cue(tR, 'roll'); cue(tR + 0.5, 'impact', 0.6);
    s.paint = (t) => {
      ktP(k1, t, [a + 0.05, a + 0.3]);
      pose(field, t, (tt) => ({ x: W / 2, y: h(460, 740) + 300 * (1 - E(tt, a, 0.5)), c: 1, p: 1, rx: 14 + 20 * (1 - E(tt, a, 0.5)), r: -2 }));
      chars.forEach((c, i) => { c.style.opacity = t >= tType + i * 0.025 ? 1 : 0; });
      const m = E(t, tClick + 0.02, 0.25); btn.style.width = lerp(BW, BH, m) + 'px'; btn.style.color = m > 0.3 ? 'transparent' : '#1a1310';
      spin.style.display = m > 0.6 && t < tR ? '' : 'none'; spin.style.transform = `translate(-50%,-50%) rotate(${((t - tClick) * 600) % 360}deg)`;
      ktP(kp, t, [tR - 0.1, tR]); R.box.style.visibility = t >= tR - 0.05 ? '' : 'hidden'; rollP(R, t, tR, 0.6, 0.06);
      cur(t);
    };
  }
  // ---------- 8–12 s : ta vraie marge
  { const a = T.mar, s = scene(a, T.cut, 'var(--w)', { type: 'slab', d: 0.4 }); s.imp.push([a + 2.0 + 0.18, 12]);
    const k1 = KT(s.cam, C, Y(120, 250), 120, 'Ta vraie marge.');
    const tC = [a + 0.5, a + 1.0, a + 1.5];
    const steps = [["Prix de l'annonce", h(400, 470)], ['Frais déduits', h(560, 590)], ['Marge nette', h(720, 710)]].map(([s_, y], i) => { const e = mk('div', 'step a', s.cam, null, `<i>${i + 1}</i>${s_}`); e.i = e.querySelector('i'); e.y = y; return e; });
    const R = ROLL(s.cam, h(90, 134), Y(790, 870), h(160, 210), '0 000 €', '4 860 €', 'var(--ok)');
    const mg = crop(s.cam, 'tb-marges', { W: 1074, x: 0, y: 0, w: 1074, h: 790 }, h(680, 640));
    tC.forEach((tc) => cue(tc, 'click', 0.7)); cue(a + 2.0, 'roll'); cue(a + 2.0, 'impact', 0.6); cue(a + 0.05, 'whoosh', 0.5);
    men(s, 'Données de démonstration');
    s.paint = (t) => {
      ktP(k1, t, [a + 0.05, a + 0.2, a + 0.35]);
      steps.forEach((e, i) => { const ck = t >= tC[i]; e.i.textContent = ck ? '✓' : String(i + 1); e.i.style.background = ck ? 'var(--ok)' : 'var(--o)';
        pose(e, t, (tt) => { const p = E(tt, a + 0.1 + i * 0.12, 0.4); return { x: C, y: e.y + 60 * (1 - p), o: p, s: 1 + 0.08 * bump(tt, tC[i] - 0.02, 0.15) }; }); });
      R.box.style.visibility = t >= a + 1.95 ? '' : 'hidden'; rollP(R, t, a + 2.0, 0.7, 0.07);
      pose(mg, t, (tt) => { const p = E(tt, a + 0.3, 0.6); return { x: h(lerp(2400, 1440, p), lerp(1700, 540, p)), y: h(560, 1280), c: 1, p: 1, rx: 14, ry: -12 - 30 * (1 - p), r: -2, s: h(1, 0.62) }; });
    };
  }
  // ---------- 12–14 s : coupure « Marchand ? »
  { const a = T.cut, s = scene(a, T.rec, 'var(--k)', { type: 'cut' }, 0.08);
    const k = KT(s.cam, 0, h(420, 820), h(220, 170), [['Marchand', { c: '#fff' }], ['?', { c: 'var(--o)' }]], {}, h(0, 800));
    cue(a, 'tapestop'); cue(T.rec - 0.62, 'suck');
    s.paint = (t) => { k.box.style.left = (W / 2 - k.box.offsetWidth / 2) + 'px'; ktP(k, t, [a + 0.5, a + 1.0], 'blur');
      const z = E(t, T.rec - 0.16, 0.16, eIn); k.box.style.transform = `scale(${(1 - 0.6 * z).toFixed(3)})`; };
  }
  // ---------- 14–18 s : drop · les recherches tournent seules
  { const a = T.rec, s = scene(a, T.mail, 'var(--o)', { type: 'cut' }, 0.03); s.imp.push([a + 0.14, 20]);
    const k1 = KT(s.cam, C, Y(110, 250), h(130, 120), [['Tes recherches', { c: '#fff' }]]), k2 = KT(s.cam, C, Y(250, 380), h(150, 140), [['tournent seules.', { i: 1, c: 'var(--k)' }]]);
    const rc = mk('div', 'a', s.cam, { width: h(620, 760) + 'px', padding: '28px 34px', borderRadius: '30px', background: '#fff', boxShadow: '0 40px 80px -30px rgba(0,0,0,.5)', font: '700 40px Satoshi', color: 'var(--ink)' },
      `<div style="font:500 24px Satoshi;opacity:.55">Recherche suivie</div>Volkswagen Golf VII<div style="display:flex;gap:14px;margin-top:16px;font:600 24px Satoshi"><span style="padding:8px 16px;border-radius:999px;background:rgba(28,22,18,.07)">toutes les heures</span><span style="padding:8px 16px;border-radius:999px;background:rgba(19,112,54,.12);color:var(--ok)">● active</span></div>`);
    const V_ = [['GO', 'var(--ok)'], ['NO GO', 'var(--r)'], ['GO SI NÉGOCIÉ', '#b5651d'], ['GO', 'var(--ok)'], ['NO GO', 'var(--r)'], ['GO', 'var(--ok)']];
    const an = MUR.slice(0, 6).map((m, i) => mk('div', 'a', s.cam, { width: h('440px', '760px'), padding: '20px 26px', borderRadius: '24px', background: '#1b1612', color: '#f4f1ec', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 24px 40px -18px rgba(0,0,0,.6)' },
      `<div><div style="font:700 28px Satoshi">${m.marque} ${m.modele}</div><div style="font:500 20px Satoshi;opacity:.55">${m.annee} · ${m.km.toLocaleString('fr-FR')} km · ${m.prix.toLocaleString('fr-FR')} €</div></div><b style="font:700 22px Satoshi;padding:8px 14px;border-radius:12px;background:${V_[i][1]};color:#fff;white-space:nowrap">${V_[i][0]}</b>`));
    const tA = an.map((_, i) => a + 1.0 + i * 0.5);
    cue(a, 'impact', 1.1); cue(a + 0.5, 'click', 0.7); tA.forEach((t0, i) => cue(t0, 'pop', 0.7));
    men(s, 'Données de démonstration', '#fff');
    s.paint = (t) => {
      ktP(k1, t, a + 0.02, 'slam'); ktP(k2, t, a + 0.3, 'rise');
      pose(rc, t, (tt) => { const p = E(tt, a + 0.1, 0.5); return V ? { x: 540, y: 680 + 300 * (1 - p), c: 1, o: p * 2, r: -1, s: 1 + 0.04 * bump(tt, a + 0.48, 0.14) } : { x: 560, y: 650 + 300 * (1 - p), c: 1, o: p * 2, r: -1, s: 1 + 0.04 * bump(tt, a + 0.48, 0.14) }; });
      an.forEach((e, i) => pose(e, t, (tt) => { if (tt < tA[i] - 0.02) return null; const p = E(tt, tA[i], 0.35), k = (t - tA[i]) >= 0 ? an.filter((_, j) => tA[j] <= t).length - 1 - i : 0;
        return V ? { x: 540, y: lerp(-200, 900 + k * 110, p), c: 1, r: (i % 2 ? 2 : -2) * (1 - p) } : { x: 1400, y: lerp(-200, 220 + k * 120, p), c: 1, r: (i % 2 ? 2 : -2) * (1 - p) }; }));
    };
  }
  // ---------- 18–21 s : les bonnes affaires par e-mail
  { const a = T.mail, s = scene(a, T.msg, 'var(--w)', { type: 'slab', d: 0.4 });
    const k1 = KT(s.cam, C, Y(110, 250), h(120, 110), 'Les bonnes affaires,'), k2 = KT(s.cam, C, Y(240, 370), h(150, 140), [['par e-mail.', { i: 1, c: 'var(--o)' }]]);
    const ml = mk('div', 'a', s.cam, { width: h('760px', '780px'), borderRadius: '30px', background: '#fff', boxShadow: '0 50px 90px -30px rgba(28,22,18,.45),0 0 0 1px rgba(28,22,18,.06)', overflow: 'hidden', font: '500 26px Satoshi', color: 'var(--ink)' },
      `<div style="display:flex;gap:18px;align-items:center;padding:24px 30px;border-bottom:1px solid rgba(28,22,18,.08)"><div style="width:60px;height:60px;border-radius:16px;background:var(--o);display:flex;align-items:center;justify-content:center;color:#fff;font:700 30px Satoshi">U</div><div><b style="font:700 28px Satoshi">UTOPICAR</b> <span style="opacity:.5">· 7:02</span><div style="font:700 32px Satoshi;margin-top:4px">3 annonces GO ce matin</div></div></div>`
      + [['Peugeot 308 1.5 BlueHDi', '+1 240 €'], ['Renault Clio V TCe 90', '+860 €'], ['Audi A3 Sportback', '+1 410 €']].map(([m, g]) => `<div class="ml" style="display:flex;justify-content:space-between;padding:20px 30px;border-bottom:1px solid rgba(28,22,18,.06)"><span>${m}</span><b style="color:var(--ok)">marge ${g}</b></div>`).join(''));
    const rows = ml.querySelectorAll('.ml');
    cue(a, 'whoosh', 0.6); cue(a + 0.5, 'ding'); [1.0, 1.25, 1.5].forEach((d) => cue(a + d, 'pop', 0.6));
    men(s, 'Données de démonstration');
    s.paint = (t) => {
      ktP(k1, t, [a + 0.05, a + 0.2, a + 0.35]); ktP(k2, t, [a + 0.5, a + 0.65]);
      pose(ml, t, (tt) => { const p = E(tt, a + 0.45, 0.45); return { x: h(1400, 540), y: lerp(h(-400, -500), h(600, 960), p), c: 1, p: 1, rx: 8, ry: h(-14, 0), r: h(-2, -1), s: h(0.9, 1) }; });
      rows.forEach((r, i) => { const p = E(t, a + 1.0 + i * 0.25, 0.3); r.style.opacity = p; r.style.transform = `translateX(${(40 * (1 - p)).toFixed(1)}px)`; });
    };
  }
  // ---------- 21–24 s : le vendeur est contacté
  { const a = T.msg, s = scene(a, T.tb, 'var(--k)', { type: 'cut' }); s.imp.push([a + 0.18, 10]);
    const k1 = KT(s.cam, C, Y(110, 250), h(120, 110), [['Le vendeur', { c: '#fff' }]]), k2 = KT(s.cam, C, Y(240, 370), h(150, 140), [['est contacté.', { i: 1, c: 'var(--o)' }]]);
    const N = 12, P_ = V ? [...Array(N)].map((_, i) => [240 + (i % 3) * 255 + (Math.floor(i / 3) % 2) * 25, 700 + Math.floor(i / 3) * 150 + ((i * 37) % 40)]) : [...Array(N)].map((_, i) => [1050 + (i % 3) * 300 + (Math.floor(i / 3) % 2) * 40, 230 + Math.floor(i / 3) * 170 + ((i * 37) % 50)]);
    const ok = P_.map(() => mk('div', 'a', s.cam, { padding: '14px 24px', borderRadius: '999px', background: 'var(--ok)', color: '#fff', font: '700 30px Satoshi', whiteSpace: 'nowrap', boxShadow: '0 12px 24px -8px rgba(0,0,0,.6)' }, '✓ Message envoyé'));
    const tM = ok.map((_, i) => a + 0.5 + i * 0.125);
    tM.forEach((t0, i) => cue(t0, 'sent', i % 2 ? 0.45 : 0.6));
    const kb = brk(s.cam, h(100, 144), Y(560, 1380), [['Un premier message,', {}], ['automatiquement.', { c: 'var(--o)' }]], '#fff');
    s.paint = (t) => {
      ktP(k1, t, [a + 0.02, a + 0.15]); ktP(k2, t, [a + 0.35, a + 0.5]); ktP(kb, t, a + 2.0, 'rise', null, 'up', { step: 0.1 });
      ok.forEach((e, i) => pose(e, t, (tt) => { if (tt < tM[i]) return null; const p = E(tt, tM[i], 0.3); return { x: P_[i][0], y: P_[i][1], c: 1, s: 0.4 + 0.6 * p, o: p * 2, r: (i % 3) - 1 }; }));
    };
  }
  // ---------- 24–26 s : tableau de bord
  { const a = T.tb, s = scene(a, T.fin, 'var(--w)', { type: 'circle', x: W / 2, y: H / 2, d: 0.32 });
    const k1 = KT(s.cam, C, Y(150, 250), h(140, 130), 'Tout ton parc,'), k2 = KT(s.cam, C, Y(300, 400), h(160, 150), [['sous les yeux.', { i: 1, c: 'var(--o)' }]]);
    const DW = h(680, 620), dash = crop(s.cam, 'tb-entete', { W: 1074, x: 0, y: 0, w: 1074, h: 2640 }, DW, { height: (2215 * DW / 1074) + 'px' });
    cue(a + 0.5, 'whoosh', 0.5); cue(a + 1.0, 'roll', 0.7);
    men(s, 'Données de démonstration');
    s.paint = (t) => {
      ktP(k1, t, [a + 0.05, a + 0.2, a + 0.35]); ktP(k2, t, [a + 0.5, a + 0.65, a + 0.8]);
      pose(dash, t, (tt) => { const p = E(tt, a + 0.05, 0.6); return { x: h(1420, 560), y: h(640, 1320) + 500 * (1 - p), c: 1, p: 1, rx: 24 + 40 * (1 - p), ry: -16, r: h(-6, -3), s: 0.5 + 0.5 * p }; });
      dash.img.style.top = (-E(t, a + 1.0, 0.8) * 640 * dash.k).toFixed(1) + 'px';
    };
  }
  // ---------- 26–30 s : carton final
  { const a = T.fin, s = scene(a, DUR + 1, 'var(--o)', { type: 'circle', x: W / 2, y: H / 2, d: 0.5 }, 0.09);
    const L = logo(s.cam, W / 2, h(430, 820), h(1000, 760));
    const kt = KT(s.cam, 0, h(600, 1000), h(84, 72), [['Achète juste.', { c: '#fff' }], ['Revends mieux.', { c: 'var(--k)' }]], {}, h(0, 800));
    const url = mk('div', 'pill a', s.cam, { background: '#fff', color: 'var(--ink)', fontSize: h(48, 44) + 'px', padding: '24px 48px' }, h('utopicar.fr', 'lien en bio'));
    cue(a, 'impact', 1.1); cue(a + 0.06, 'pop', 0.8); cue(a + 0.25, 'whoosh', 0.7); cue(a + 1.0, 'pop', 0.6); cue(a + 1.5, 'pop', 0.7);
    s.paint = (t) => {
      L(t, a + 0.05);
      kt.box.style.left = (W / 2 - kt.box.offsetWidth / 2) + 'px'; ktP(kt, t, [a + 1.0, a + 1.12, a + 1.5, a + 1.62]);
      pose(url, t, (tt) => { if (tt < a + 1.95) return null; const p = E(tt, a + 2.0, 0.45); return { x: W / 2, y: h(800, 1230) + 60 * (1 - p), c: 1, o: p * 2, s: 1 + 0.025 * pulse(tt) }; });
    };
  }

  // ---------- seek ----------
  window.seek = (t) => { for (const s of SC) paintScene(s, t); };
  window.filmDur = DUR;
  window.cues = CUES.sort((x, y) => x.t - y.t);
  window.seek(0);
  window.filmReady = true;
})();
