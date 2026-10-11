// « Le dictionnaire du vendeur » (9:16, 1080×1920, 33 s) : concept 1 de docs/concepts_motion_oct2026.md, dans la
// grammaire du film « wow » (master60w) dont il reprend le moteur : écrans pleins, répliques de Simon en géant mot par mot
// (prise 1, eleven_v4, audio/vo-dico/), vraie interface, curseur, flou de bougé directionnel par élément.
// Geste propre au film : chaque phrase de vendeur s'écrit en italique géant, puis la caméra plonge dans le trait d'une
// lettre ; son encre remplit l'écran et le prix roule (grille de coûts de l'outil, web/src/lib/analyse/defauts.ts).
// Contrat : window.seek(t) peint la frame t, sans état entre les frames.
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


  // ---------- plongée à travers une lettre : la caméra fonce dans le trait d'une lettre, son encre remplit l'écran ----------
  // dv : calque de contenu de la scène ; k : texte (KT), wi / ci : mot et lettre visés, fx / fy : point du trait dans la
  // lettre (fraction de sa boîte) ; t0 → t1 : la plongée (l'échelle monte en expo jusqu'à × 90)
  function dive(s, k, wi, ci, fx, fy, t0, t1) {
    const c = k.words[wi].chars[ci], r = c.getBoundingClientRect(), br = s.cam.getBoundingClientRect();
    const px = r.left - br.left + r.width * fx, py = r.top - br.top + r.height * fy;
    s.dv.style.transformOrigin = `${px.toFixed(1)}px ${py.toFixed(1)}px`;
    const disc = mk('div', 'a', s.dv, { left: px - 9 + 'px', top: py - 9 + 'px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--ink)' });
    cue(t0, 'whoosh', 0.9);
    return (t) => {
      // approche : la caméra avance déjà vers la lettre 1,4 s avant la plongée (× 1,04 : au-delà, les phrases larges entrent dans la zone des boutons TikTok), puis fonce (× 90)
      const p = clamp((t - t0) / (t1 - t0), 0, 1), sc = (tt) => (1 + 0.04 * eIO(clamp((tt - t0 + 1.4) / 1.4, 0, 1))) * Math.pow(90, Math.pow(clamp((tt - t0) / (t1 - t0), 0, 1), 2.4));
      // le disque d'encre grandit dans le calque : à × 90 il couvre l'écran, même si le point tombe au bord du trait
      disc.style.opacity = clamp((p - 0.42) * 4, 0, 1).toFixed(3);
      disc.style.transform = `scale(${(1 + 3.2 * Math.pow(p, 2)).toFixed(3)})`;
      // flou d'après la vitesse relative du zoom (écart des logarithmes d'une demi-image), plafonné à 10 px
      const v = Math.log(sc(t)) - Math.log(sc(t - 1 / 120));
      s.dv.style.transform = `scale(${sc(t).toFixed(4)})`;
      const b = Math.min(10, v * 120 * 0.45); mb(s.dv, b, b);
    };
  }
  // scène avec calque de contenu (pour la plongée)
  function sceneD(a, b, bg, tin, push) { const s = scene(a, b, bg, tin, push); s.dv = mk('div', 'a', s.cam, { width: W + 'px', height: H + 'px' }); return s; }
  // écran du prix : « jusqu'à », le prix qui roule, la ligne de la grille de coûts
  function priceScene(a, b, tP, from, to, label, extra) {
    const s = scene(a, b, 'var(--ink)', { type: 'cut' }, 0.04); s.imp.push([tP + 0.05, 14]);
    if (a < tP - 0.15) cue(a, 'thud', 0.6); cue(tP + 0.13, 'roll');   // le roulement juste après le choc ou l'impact, pour qu'il s'entende
    const k0 = KT(s.cam, 140, 600, 96, [["jusqu'à", { c: 'rgba(251,249,245,.7)' }]]);
    const R = ROLL(s.cam, 130, 720, 300, from, to, 'var(--o)');
    const k1 = brk(s.cam, 144, 1090, [['[', {}], ...label, [']', {}]], '#fbf9f5', 38);
    men(s, 'Fourchettes de la grille de coûts UTOPICAR', '#fbf9f5');
    s.paint = (t) => {
      ktP(k0, t, a - 0.02, 'rise');
      R.box.style.visibility = t >= tP - 0.12 ? '' : 'hidden'; rollP(R, t, tP - 0.1, 0.55, 0.06);
      pose(R.box, t, (tt) => ({ x: 0, y: 0, s: 1 + 0.06 * bump(tt, tP + 0.3, 0.2) }));
      ktP(k1, t, tP + 0.25, 'rise', null, 'up', { step: 0.05 });
      if (extra) extra(t);
    };
    return s;
  }
  // phrase du vendeur entre guillemets, en italique géant, sur fond crème
  const quote = (s, lines) => lines.map(([txt, y, size]) => KT(s.dv, 140, y, size, [[txt, { i: 1, c: 'var(--ink)' }]]));

  // =====================================================================================================
  // 1 · « Juste un voyant… rien de grave. Dans une annonce, cette phrase peut te coûter mille cinq cents euros. »
  // =====================================================================================================
  const tP1 = Wt('1500', 4);
  { const s = sceneD(-1, tP1, 'var(--w)', { type: 'cut' }, 0.05);
    const kb = brk(s.dv, 144, 250, [['[', {}], ['lu', {}], ['dans', {}], ['une', {}], ['annonce', { c: 'var(--o)' }], [']', {}]]);
    const hl = mk('div', 'a', s.dv, { left: '128px', top: '742px', width: '760px', height: '118px', borderRadius: '14px', background: 'rgba(255,90,31,.55)', transformOrigin: '0 50%' });
    const [q1, q2, q3] = quote(s, [['« Juste un', 330, 190], ['voyant,', 520, 190], ['rien de grave. »', 712, 150]]);
    const kc = brk(s.dv, 144, 1010, [['[', {}], ['cette', {}], ['phrase', {}], ['peut', {}], ['te', {}], ['coûter…', { c: 'var(--o)' }], [']', {}]]);
    const D = dive(s, q2, 0, 1, 0.24, 0.62, 4.22, tP1);
    cue(1.42, 'whoosh', 0.45); cue(tP1, 'impact', 0.8);
    s.paint = (t) => {
      ktP(kb, t, -0.6, 'rise', null, 'up', { step: 0.05 });
      ktP(q1, t, [-0.55, -0.45], 'rise', null, 'up', { acc: [Wt('juste'), Wt('un')] });
      ktP(q2, t, Wt('voyant') - 0.05, 'rise', null, 'up', { acc: [Wt('voyant')] });
      ktP(q3, t, [Wt('rien'), Wt('de'), Wt('grave')], 'rise');
      hl.style.transform = `rotate(-2deg) scaleX(${E(t, 1.42, 0.55).toFixed(3)})`;
      ktP(kc, t, [Wt('cette', 2), Wt('cette', 2), Wt('phrase', 2), Wt('peut', 2), Wt('te', 4), Wt('couter', 2), Wt('couter', 2)], 'rise');
      D(t);
    };
  }
  priceScene(tP1, Wt('allez', 6), tP1, '0 000 €', '1 500 €', [['voyant', {}], ['allumé,', {}], ['panne', {}], ['non', {}], ['diagnostiquée', { c: 'var(--o)' }]]);
  // le petit rire de Simon (6,26 s) s'écrit sous le prix
  { const s = SC[SC.length - 1], kh = KT(s.cam, 140, 1230, 120, [['hé hé…', { i: 1, c: 'rgba(251,249,245,.45)' }]]);
    const p0 = s.paint; s.paint = (t) => { p0(t); ktP(kh, t, 6.26, 'blur', null, 'up', { fx: (i, j, tt) => ({ y: Math.sin(tt * 18 + j) * 5 * (1 - E(tt, 6.3, 0.8)) }) }); }; }

  // =====================================================================================================
  // 2 · « Allez, je te traduis le vendeur. »
  // =====================================================================================================
  const tPetit = Wt('petit', 8);
  { const a = Wt('allez', 6), s = scene(a, tPetit, 'var(--o)', { type: 'slab', d: 0.4 });
    const k1 = KT(s.cam, 140, 280, 150, [['Allez,', { c: '#fff' }]]);
    const k2 = KT(s.cam, 140, 440, 130, [['je te traduis', { c: 'var(--ink)' }]]);
    const k3 = KT(s.cam, 140, 590, 210, [['le vendeur.', { i: 1, c: '#fff' }]]);
    const k4 = brk(s.cam, 144, 900, [['[', {}], ['le', {}], ['dictionnaire', { c: '#fff' }], ['du', {}], ['vendeur', { c: '#fff' }], [']', {}]], 'var(--ink)');
    cue(Wt('vendeur', 7) + 0.25, 'pop', 0.6);
    s.paint = (t) => {
      ktP(k1, t, a, 'slam'); ktP(k2, t, [Wt('je', 7), Wt('te', 7), Wt('traduis', 7)]);
      ktP(k3, t, [Wt('le', 7.5), Wt('vendeur', 7.5)], 'rise', null, 'up', { acc: [Wt('le', 7.5), Wt('vendeur', 7.5)] });
      ktP(k4, t, Wt('vendeur', 7) + 0.25, 'rise', null, 'up', { step: 0.05 });
    };
  }

  // =====================================================================================================
  // 3 · « "Petit bruit au démarrage"… hmm… jusqu'à six cents. »
  // =====================================================================================================
  const tP2 = Wt('jusqu', 11);
  { const s = sceneD(tPetit, tP2, 'var(--w)', { type: 'cut' }, 0.05); cue(tPetit, 'thud', 0.5);
    const [q1, q2] = quote(s, [['« Petit bruit', 300, 180], ['au démarrage. »', 490, 150]]);
    const kh = KT(s.dv, 140, 760, 130, [['hmm…', { i: 1, c: '#b5aa9c' }]]);
    const D = dive(s, q1, 2, 0, 0.18, 0.55, 10.72, tP2);   // le trait du « b » de « bruit »
    s.paint = (t) => {
      ktP(q1, t, [tPetit, Wt('bruit', 8.5)], 'rise'); ktP(q2, t, [Wt('au', 9), Wt('demarrage', 9)], 'rise');
      ktP(kh, t, 10.41, 'blur', null, 'up', { fx: (i, j, tt) => ({ y: Math.sin(tt * 7 + j * 1.3) * 8 }) });
      D(t);
    };
  }
  priceScene(tP2, Wt('embrayage', 12), Wt('600', 11), '000 €', '600 €', [['bruit', {}], ['signalé,', {}], ['origine', {}], ['inconnue', { c: 'var(--o)' }]]);

  // =====================================================================================================
  // 4 · « "Embrayage un peu haut" ? (soupir) Neuf cents. »
  // =====================================================================================================
  const tEmb = Wt('embrayage', 12), tP3 = Wt('900', 14);
  { const s = sceneD(tEmb, tP3, 'var(--w)', { type: 'cut' }, 0.05); cue(tEmb, 'thud', 0.5);
    const [q1, q2] = quote(s, [['« Embrayage', 300, 180], ['un peu haut. »', 490, 160]]);
    const D = dive(s, q1, 1, 2, 0.2, 0.5, 14.0, tP3);    // le trait du « b » d'« Embrayage »
    // le soupir (13,94 s) : les mots s'affaissent
    const sag = (i, j, tt) => ({ y: E(tt, 13.94 + j * 0.03, 0.5) * (10 + j * 4), r: E(tt, 13.94, 0.5) * (j % 2 ? 3 : -2) });
    s.paint = (t) => {
      ktP(q1, t, tEmb, 'rise', null, 'up', { fx: sag });
      ktP(q2, t, [Wt('un', 12.8), Wt('peu', 12.8), Wt('haut', 12.8)], 'rise', null, 'up', { fx: sag });
      D(t);
    };
  }
  priceScene(tP3, Wt('climat', 15), tP3, '000 €', '900 €', [['embrayage', {}], ['à', {}], ['changer', { c: 'var(--o)' }]]);

  // =====================================================================================================
  // 5 · « "Clim à recharger" ? Quatre cent cinquante, au pire. »
  // =====================================================================================================
  const tClim = Wt('climat', 15), tP4 = Wt('450', 16);
  { const s = sceneD(tClim, tP4, 'var(--w)', { type: 'cut' }, 0.05); cue(tClim, 'thud', 0.5);
    const [q1, q2] = quote(s, [['« Clim à', 300, 190], ['recharger. »', 490, 190]]);
    const D = dive(s, q2, 0, 1, 0.3, 0.62, 16.42, tP4);
    s.paint = (t) => { ktP(q1, t, [tClim, tClim + 0.11], 'rise'); ktP(q2, t, Wt('recharge', 15.6), 'rise'); D(t); };
  }
  { const tPire = Wt('pire', 17);
    let kp; const s = priceScene(tP4, Wt('tu', 18), tP4, '000 €', '450 €', [['clim', {}], ['à', {}], ['recharger', {}], ['ou', {}], ['réparer', { c: 'var(--o)' }]], (t) => ktP(kp, t, [Wt('au', 17.4), tPire], 'rise'));
    kp = KT(s.cam, 140, 1210, 170, [['au pire.', { i: 1, c: '#fbf9f5' }]]); cue(tPire, 'pop', 0.6); }

  // =====================================================================================================
  // 6 · « Tu additionnes… pfff… trois mille quatre cent cinquante euros. »
  // =====================================================================================================
  const tTu = Wt('tu', 18), tPf = 20.25, tP5 = 20.84;
  { const s = scene(tTu, tP5, 'var(--o)', { type: 'slab', d: 0.4 });
    const k1 = KT(s.cam, 140, 270, 150, [['Tu', { c: '#fff' }]]), k2 = KT(s.cam, 140, 420, 150, [['additionnes…', { c: '#fff' }]]);
    const kp = KT(s.cam, 140, 600, 220, [['Pfff…', { i: 1, c: 'var(--ink)' }]]);
    const TG = [['1 500 €', 'voyant'], ['600 €', 'petit bruit'], ['900 €', 'embrayage'], ['450 €', 'clim']];
    const tg = TG.map(([p, l]) => mk('div', 'tag a', s.cam, { fontSize: '76px' }, `${p}<small style="font-size:28px">${l}</small>`));
    const XY = [[330, 1010, -7], [740, 1050, 5], [330, 1250, 4], [740, 1290, -5]], tIn = [18.62, 18.89, 19.16, 19.43];
    tIn.forEach((ti) => cue(ti, 'pop', 0.7)); cue(T_STOP - 0.05, 'tapestop');
    s.paint = (t) => {
      ktP(k1, t, tTu, 'slam'); ktP(k2, t, Wt('additionnes', 18), 'rise');
      ktP(kp, t, tPf - 0.05, 'blur', null, 'up', { fx: (i, j, tt) => ({ y: E(tt, tPf + 0.15 + j * 0.05, 0.5) * (14 + j * 9), r: E(tt, tPf + 0.15, 0.5) * (j % 2 ? 5 : -4) }) });
      tg.forEach((e, i) => pose(e, t, (tt) => { if (tt < tIn[i] - 0.3) return null; const p = E(tt, tIn[i] - 0.25, 0.32), f = E(tt, tPf + 0.1 + i * 0.04, 0.5);
        return { x: XY[i][0], y: lerp(-300, XY[i][1], p) + f * 26, c: 1, r: XY[i][2] - 18 * (1 - p) + f * (i % 2 ? 4 : -4) }; }));
    };
  }
  { const s = priceScene(tP5, Wt('moi', 21.5), tP5, '0 000 €', '3 450 €', [['pour', {}], ['une', {}], ['seule', {}], ['annonce', { c: 'var(--o)' }]]);
    s.imp.push([tP5 + 0.04, 26]); cue(tP5, 'impact'); }

  // =====================================================================================================
  // 7 · « Moi, je colle l'annonce dans UTOPICAR… »
  // =====================================================================================================
  { const a = Wt('moi', 21.5), s = scene(a, T_BAM, 'var(--o)', { type: 'slab', d: 0.4 });   // orange : le mot du logo est blanc
    const k1 = KT(s.cam, 140, 270, 150, [['Moi, je colle', { c: '#fff' }]]), k2 = KT(s.cam, 140, 420, 200, [["l'annonce", { i: 1, c: 'var(--ink)' }]]);
    const field = mk('div', 'a', s.cam, { width: '800px', height: '150px', borderRadius: '999px', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 18px 0 36px', gap: '16px', boxShadow: '0 50px 100px -30px rgba(28,22,18,.45),0 0 0 1px rgba(28,22,18,.06)' },
      '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#1c1612" stroke-width="2.2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>');
    const txt = mk('div', '', field, { flex: '1', font: '500 36px Satoshi', color: '#1c1612', whiteSpace: 'nowrap', overflow: 'hidden' });
    const chars = [...'…/annonce/peugeot-208'].map((ch) => mk('span', '', txt, null, ch));
    const btn = mk('div', '', field, { height: '114px', width: '270px', borderRadius: '999px', background: 'var(--o)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 44px Clash', color: '#1a1310', flex: 'none' }, 'Analyser');
    const L = logo(s.cam, 540, 1200, 620);
    const tType = Wt('colle', 22) + 0.1, tUto = Wt('utopicar', 23), tCl = 24.1;
    cue(tType, 'type'); cue(tUto, 'whoosh', 0.6); cue(tCl, 'click');
    const cur = cursor(s.cam, [[a, 1200, 1900], [tCl - 0.02, 800, 905], [tCl + 0.6, 815, 925]], [tCl]);
    s.paint = (t) => {
      ktP(k1, t, [a, Wt('je', 22.4), Wt('colle', 22.4)], 'rise'); ktP(k2, t, Wt('annonce', 22.8), 'rise');
      pose(field, t, (tt) => { const p = E(tt, a + 0.1, 0.55); return { x: 540, y: lerp(1500, 860, p), c: 1, p: 1, rx: 12 * (1 - p) + 6, r: -2 }; });
      chars.forEach((c, i) => { c.style.opacity = t >= tType + i * 0.018 ? 1 : 0; });
      btn.style.transform = `scale(${(1 - 0.08 * bump(t, tCl - 0.03, 0.14)).toFixed(3)})`;
      L(t, tUto - 0.05); cur(t);
    };
  }

  // =====================================================================================================
  // 8 · « …et bam : chaque phrase a son prix. Avant d'appeler. »
  // =====================================================================================================
  { const a = T_BAM, s = scene(a, Wt('et', 27), 'var(--w)', { type: 'circle', x: 540, y: 900, d: 0.42 }, 0.03); s.imp.push([a + 0.03, 22]);
    cue(a, 'impact');
    const kb = KT(s.cam, 140, 230, 330, [['Bam.', { i: 1, c: 'var(--o)' }]]);
    const k1 = KT(s.cam, 140, 270, 130, 'Chaque phrase'), k2 = KT(s.cam, 140, 400, 130, 'a son prix,');
    const k3 = KT(s.cam, 140, 540, 170, [["avant d'appeler.", { i: 1, c: 'var(--o)' }]]);
    const card = crop(s.cam, 'fiche-208', { W: 1050, x: 0, y: 0, w: 1050, h: 1150 }, 560);
    const hl = mk('div', 'hl a', card, { left: '18px', top: '486px', width: '524px', height: '124px' });
    const TG = ['1 500 €', '600 €', '900 €', '450 €'].map((p) => mk('div', 'tag a', s.cam, { fontSize: '60px' }, p));
    const tIn = [Wt('chaque', 24.8), Wt('phrase', 24.8), Wt('son', 24.8), Wt('prix', 24.8)];
    tIn.forEach((ti, i) => cue(ti, 'pop', 0.7)); cue(Wt('avant', 26) - 0.05, 'ding', 0.7);
    men(s, 'Données de démonstration');
    s.paint = (t) => {
      ktP(kb, t, a, 'slam', Wt('chaque', 24.8) - 0.3, 'up');
      ktP(k1, t, [tIn[0], tIn[1]], 'rise'); ktP(k2, t, [Wt('a', 25.4), Wt('son', 25.4), Wt('prix', 25.4)], 'rise');
      ktP(k3, t, [Wt('avant', 26), Wt('appeler', 26)], 'rise', null, 'up', { acc: [Wt('avant', 26), Wt('appeler', 26)] });
      pose(card, t, (tt) => { const p = E(tt, a + 0.12, 0.6); return { x: 540, y: lerp(2300, 1095, p), c: 1, p: 1, rx: 8 + 14 * (1 - p), ry: -10, r: 2 }; });
      hl.style.opacity = E(t, tIn[0], 0.3).toFixed(3);
      TG.forEach((e, i) => pose(e, t, (tt) => { const t0 = tIn[i] - 0.35; if (tt < t0) return null; const p = E(tt, t0, 0.42, eIO);
        return { x: lerp([270, 770, 290, 760][i], 600, p), y: lerp([1370, 1330, 840, 880][i], 1110, p), c: 1, s: lerp(1, 0.25, p), o: 1 - E(tt, t0 + 0.32, 0.12), r: lerp([-10, 8, 6, -7][i], 0, p) }; }));
    };
  }

  // =====================================================================================================
  // 9 · « Et toi, t'as lu quoi ? (rire) Écris-le, je te le traduis. »
  // =====================================================================================================
  const tEt = Wt('et', 27), tEc = Wt('ecris', 29);
  { const s = scene(tEt, tEc, 'var(--ink)', { type: 'cut' }, 0.04); cue(tEt, 'thud', 0.5);
    const k1 = KT(s.cam, 140, 280, 160, [['Et toi,', { c: '#fff' }]]);
    const k2 = KT(s.cam, 140, 450, 210, [["t'as lu", { i: 1, c: 'var(--o)' }]]), k3 = KT(s.cam, 140, 650, 210, [['quoi ?', { i: 1, c: 'var(--o)' }]]);
    const kh = KT(s.cam, 640, 720, 110, [['ha !', { i: 1, c: 'rgba(251,249,245,.45)' }]]);
    const bub = mk('div', 'a', s.cam, { width: '760px', padding: '30px 36px', borderRadius: '40px', background: '#fff', display: 'flex', gap: '24px', alignItems: 'center', boxShadow: '0 40px 80px -24px rgba(0,0,0,.7)' },
      '<div style="flex:none;width:84px;height:84px;border-radius:50%;background:var(--o)"></div><div style="flex:1"><div style="height:22px;width:42%;border-radius:11px;background:rgba(28,22,18,.18)"></div><div style="display:flex;gap:12px;margin-top:20px"><i style="width:22px;height:22px;border-radius:50%;background:var(--ink)"></i><i style="width:22px;height:22px;border-radius:50%;background:var(--ink)"></i><i style="width:22px;height:22px;border-radius:50%;background:var(--ink)"></i></div></div>');
    const dots = [...bub.querySelectorAll('i')]; const tB = Wt('quoi', 28) + 0.2; cue(tB, 'sent', 0.6);
    s.paint = (t) => {
      ktP(k1, t, [tEt, Wt('toi', 27.4)], 'rise'); ktP(k2, t, [Wt('t', 27.8), Wt('lu', 27.8)], 'rise'); ktP(k3, t, [Wt('quoi', 28), Wt('quoi', 28) + 0.2], 'rise');
      ktP(kh, t, 28.66, 'blur', null, 'up', { fx: (i, j, tt) => ({ y: Math.sin(tt * 20 + j) * 6 }) });
      pose(bub, t, (tt) => { if (tt < tB - 0.05) return null; const p = E(tt, tB, 0.45); return { x: 540, y: lerp(1500, 1150, p), c: 1, o: p * 2, r: -2 * (1 - p) }; });
      dots.forEach((d, i) => { d.style.transform = `translateY(${(-8 * Math.max(0, Math.sin((t - tB) * 9 - i * 0.9))).toFixed(1)}px)`; });
    };
  }
  { const s = scene(tEc, DUR + 1, 'var(--o)', { type: 'circle', x: 540, y: 1150, d: 0.45 }, 0.02);
    const k1 = KT(s.cam, 140, 270, 170, [['Écris-le,', { c: '#fff' }]]);
    const k2 = KT(s.cam, 140, 440, 200, [['je te le', { i: 1, c: 'var(--ink)' }]]), k3 = KT(s.cam, 140, 630, 200, [['traduis.', { i: 1, c: 'var(--ink)' }]]);
    const L = logo(s.cam, 540, 1060, 700);
    const pill = mk('div', 'pill a', s.cam, { background: '#fff', color: 'var(--ink)', fontSize: '42px', padding: '26px 44px' }, 'Écris ta phrase <b style="color:var(--o)">en commentaire</b>');
    const tL = T_HIT, tPill = tL + 0.7, tCl = tL + 1.5;
    cue(tL, 'pop', 0.8); cue(tL + 0.2, 'whoosh', 0.6); cue(tPill, 'pop', 0.6); cue(tCl, 'click');
    const cur = cursor(s.cam, [[tPill, 1200, 1900], [tCl - 0.02, 760, 1290], [tCl + 1, 800, 1330]], [tCl]);
    s.paint = (t) => {
      ktP(k1, t, [tEc, Wt('le', 29.5)], 'rise'); ktP(k2, t, [Wt('je', 30), Wt('te', 30), Wt('le', 30.2)], 'rise'); ktP(k3, t, Wt('traduis', 30.3), 'rise');
      L(t, tL);
      pose(pill, t, (tt) => { if (tt < tPill - 0.05) return null; const p = E(tt, tPill, 0.45); return { x: 540, y: 1290 + 70 * (1 - p), c: 1, o: p * 2, s: (1 + 0.025 * pulse(tt)) * (1 - 0.05 * bump(tt, tCl - 0.03, 0.14)) }; });
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
