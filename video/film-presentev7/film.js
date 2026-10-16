// Présentation utopicar v7 (9:16, voix de Simon espacée) : typographie lettre à lettre avec lueur, caméra 3D, chaque
// élément d'interface décomposé pièce par pièce.
// Retour de l'utilisateur sur la v6 : « quand il colle l'annonce, ça doit être un lien leboncoin et non la description ;
// l'écriture suit trop rapidement, des textes se superposent ; à "pour les trouver", l'animation est mal faite ; à la
// fin, anime l'icône du logo directement ; le plafond se voit mal ». Analyse image par image du MP4 v6 :
//  · les chiffres sur rouleaux et les signes qui se décodent, au flou de bougé, empilent 2 à 8 chiffres fantômes ;
//  · les sorties de scène qui foncent vers la caméra font passer l'ancienne interface, dédoublée, sous les nouveaux
//    sous-titres ; à « pour les trouver », les paliers de prix filent en traînées puis repassent par-dessus le mur ;
//  · « À ÉVITER » géant recouvrait la note et le titre de la carte ; la dalle PLAFOND, couchée, se lisait mal ;
//  · les panneaux de la route sortaient du cadre et se chevauchaient, les messages de la nuit s'empilaient.
// Grammaire v7 : un texte n'apparaît qu'une fois, monte d'un masque à son rythme, puis ne bouge plus vite ; une scène
// qui sort recule, se floute et s'éteint sous la suivante (aucun texte ne file) ; la suivante naît d'une forme
// (bouton → pastille → anneau, anneau couché → trait → carte, carte qui se retourne, écran qui s'ouvre) ; un chiffre
// qui change est figé sur l'image entière (net au flou de bougé). Contrat : window.seek(t) peint l'image t.
(async function () {
  const { spring, clamp, lerp } = Motion;
  const ST = document.getElementById('stage');
  const NS = 'http://www.w3.org/2000/svg';
  const J = async (u) => (await fetch(u)).json();
  const WD = await J('../audio/vo-presentev7/vo.words.json');
  const LISTE = await J('liste.json');
  const LOGO = await (await fetch('../assets/brand/official/utopicar-logo-horizontal-fond-sombre.svg')).text();
  await Promise.all(['500 80px Clash', '600 80px Clash', '700 80px Clash', '400 30px Satoshi', '500 30px Satoshi', '700 30px Satoshi', '900 30px Satoshi', 'italic 80px Instrument'].map((f) => document.fonts.load(f)));
  const w = (i) => WD[i].s;
  const VEND = WD[WD.length - 1].e;
  const DUR = Math.round((VEND + 2.5) * 30) / 30, TLOOP = DUR - 0.6;

  // ---------- courbes ----------
  const bez = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (s) => ((ax * s + bx) * s + cx) * s, Y = (s) => ((ay * s + by) * s + cy) * s, dX = (s) => (3 * ax * s + 2 * bx) * s + cx;
    return (x) => { if (x <= 0) return 0; if (x >= 1) return 1; let s = x; for (let i = 0; i < 10; i++) { const e = X(s) - x, d = dX(s); if (Math.abs(e) < 1e-7 || Math.abs(d) < 1e-7) break; s = clamp(s - e / d, 0, 1); } return Y(s); };
  };
  const doux = bez(0.2, 0.8, 0.2, 1);                                   // --ease-doux de l'app
  const eOut = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
  const eIn = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : Math.pow(2, 10 * p - 10));
  const eIO = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2);
  const eIn2 = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p);
  const eOut3 = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(1 - p, 3));
  const lisse = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p));
  const lin = (p) => clamp(p, 0, 1);
  const E = (t, t0, d, f = doux) => f(clamp((t - t0) / d, 0, 1));
  const SP = (t, t0, pr = 'default') => (t < t0 ? 0 : spring(t - t0, pr));
  const bump = (t, t0, d = 0.14) => clamp(spring(t - t0, 'snappy') - spring(t - t0 - d, 'snappy'), 0, 1);
  const mix = (a, b, p) => a.map((v, i) => lerp(v, b[i], p));
  const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const rgb = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  // contenu discret (un chiffre qui change) : figé sur l'image entière, donc identique dans toutes les sous-images du
  // flou de bougé (sinon deux valeurs se superposent)
  const fq = (t) => Math.round(t * 30) / 30;

  // ---------- éléments ----------
  const mk = (tag, cls, parent, css, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const show = (e, v) => { e.style.display = v ? '' : 'none'; return v; };
  // milliers et unités : espace insécable (U+00A0) ; l'espace fine U+202F n'existe ni dans Clash ni dans Satoshi et disparaît
  const nb = (h) => (typeof h === 'string' ? h.replace(/(\d) (?=\d{3}(?!\d))/g, '$1 ').replace(/ (€|%)/g, ' $1') : h);
  const tf = (e, x, y, o = {}) => {
    e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)${o.c ? ' translate(-50%,-50%)' : ''} rotate(${(o.r || 0).toFixed(2)}deg) scale(${(o.sx ?? o.s ?? 1).toFixed(4)},${(o.sy ?? o.s ?? 1).toFixed(4)})`;
    if (o.o != null) e.style.opacity = clamp(o.o, 0, 1).toFixed(3);
  };
  // pose 3D : le CENTRE de l'élément en (x, y, z) du monde, puis rotations autour de son centre
  const put = (e, x, y, z, o = {}) => {
    e.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) translate(-50%,-50%) rotateX(${(o.rx || 0).toFixed(2)}deg) rotateY(${(o.ry || 0).toFixed(2)}deg) rotateZ(${(o.rz || 0).toFixed(2)}deg) scale(${(o.sx ?? o.s ?? 1).toFixed(4)},${(o.sy ?? o.s ?? 1).toFixed(4)})`;
    if (o.o != null) e.style.opacity = clamp(o.o, 0, 1).toFixed(3);
    if (o.f != null) e.style.filter = o.f;
  };
  const scene = (persp = 1300) => {
    const root = mk('div', 'lay', ST, { perspective: persp + 'px', perspectiveOrigin: '540px 960px', overflow: 'hidden' });
    const cam = mk('div', 'lay', root, { transformStyle: 'preserve-3d', transformOrigin: '540px 960px' });
    return { root, cam, persp, cp: { cx: 540, cy: 960, cz: 0, tz: 0, rx: 0, ry: 0, rz: 0 } };
  };
  // la caméra pivote autour du point visé (cx, cy, tz)
  const camera = (S, { cx = 540, cy = 960, cz = 0, tz = 0, rx = 0, ry = 0, rz = 0 }) => {
    S.cp = { cx, cy, cz, tz, rx, ry, rz };
    S.cam.style.transform = `translateZ(${cz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) translate3d(${(540 - cx).toFixed(1)}px,${(960 - cy).toFixed(1)}px,${(-tz).toFixed(1)}px)`;
  };
  const RAD = Math.PI / 180;
  // point du monde qui s'affiche en (X, Y) de l'écran, à la profondeur q devant le plan net (inverse de la caméra)
  const versMonde = (S, X, Y, q) => {
    const { cx, cy, cz, tz, rx, ry, rz } = S.cp, k = (S.persp - q) / S.persp;
    let x = (X - 540) * k, y = (Y - 960) * k, z = q - cz, a;
    a = -rx * RAD; [y, z] = [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
    a = -ry * RAD; [x, z] = [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
    a = -rz * RAD; [x, y] = [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    return [cx + x, cy + y, tz + z];
  };
  // projection à l'écran d'un point du monde : [x, y, échelle]
  const proj = (S, X, Y, Z) => {
    const { cx, cy, cz, tz, rx, ry, rz } = S.cp;
    let x = X - cx, y = Y - cy, z = Z - tz, a;
    a = rz * RAD; [x, y] = [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    a = ry * RAD; [x, z] = [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
    a = rx * RAD; [y, z] = [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
    z += cz; const k = S.persp / (S.persp - z);
    return [540 + x * k, 960 + y * k, k];
  };
  // pose « face caméra » : l'objet passe de sa pose dans le monde (from, à plat) à (X, Y, q) face à l'objectif (k : 0 → 1)
  const putFace = (S, e, X, Y, q, k, from, o = {}) => {
    const [fx, fy, fz] = versMonde(S, X, Y, q), { rx, ry, rz } = S.cp;
    const x = lerp(from[0], fx, k), y = lerp(from[1], fy, k), z = lerp(from[2], fz, k);
    e.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) translate(-50%,-50%) rotateZ(${(-rz * k).toFixed(2)}deg) rotateY(${(-ry * k).toFixed(2)}deg) rotateX(${(-rx * k).toFixed(2)}deg) rotateX(${(o.rx || 0).toFixed(2)}deg) rotateY(${(o.ry || 0).toFixed(2)}deg) rotateZ(${(o.rz || 0).toFixed(2)}deg) scale(${(o.s ?? 1).toFixed(4)})`;
    if (o.o != null) e.style.opacity = clamp(o.o, 0, 1).toFixed(3);
  };
  const obj = (parent, wd, ht, css = {}, html) => mk('div', 'a', parent, { width: wd + 'px', height: ht + 'px', ...css }, html);
  const CUES = [], cue = (t, k, g = 1) => { if (t >= 0 && t < DUR) CUES.push({ t: +t.toFixed(3), k, g }); };
  const FAST = []; const win = (a, b) => FAST.push([a, b]);
  const milliers = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const eur = (n) => `${milliers(n)} €`;

  // =====================================================================================================
  // DÉCOMPOSITION : chaque élément se construit dans l'ordre où l'œil le lit. Le contenant naît d'un trait de lumière
  // (bords sur deux ressorts) ; libellés ET valeurs montent d'un masque lettre à lettre (v7 : plus de rouleaux ni de
  // signes qui se décodent : au flou de bougé ils empilaient des chiffres fantômes) ; barres qui se remplissent,
  // pastilles qui jaillissent, coches tracées ; un reflet traverse l'élément fini (l'animation « reflet » de l'app).
  // =====================================================================================================
  const naissance = (c, coul = '#ff8a4c') => {
    const W = c.offsetWidth, H = c.offsetHeight, r = parseFloat(getComputedStyle(c).borderTopLeftRadius) || 0;
    const T = mk('div', 'a', c, { left: '0', top: (H / 2 - 3) + 'px', width: W + 'px', height: '6px', borderRadius: '3px', background: `linear-gradient(90deg, transparent, ${coul} 16%, #fff6ec 50%, ${coul} 84%, transparent)`, pointerEvents: 'none', zIndex: 9 });
    return { c, W, H, r, T };
  };
  const nait = (N, t, t0) => {
    if (t < t0) { N.c.style.clipPath = 'inset(50% 50% 50% 50%)'; N.T.style.opacity = '0'; return 0; }
    const d = t - t0, R = spring(d, 'snappy'), L = spring(Math.max(0, d - 0.05), 'default'), V = spring(Math.max(0, d - 0.15), 'default');
    const hw = N.W / 2, hh = N.H / 2, top = Math.max(0, (hh - 3) * (1 - V));
    N.c.style.clipPath = d > 1.1 ? '' : `inset(${top.toFixed(1)}px ${(hw * (1 - R)).toFixed(1)}px ${top.toFixed(1)}px ${(hw * (1 - L)).toFixed(1)}px round ${Math.min(N.r, Math.max(3, hh - top)).toFixed(1)}px)`;
    N.T.style.opacity = (1 - E(t, t0 + 0.22, 0.28)).toFixed(3);
    return clamp(V, 0, 1);
  };
  // une ligne de texte : une boîte par lettre (largeur figée sur la lettre), dans un masque (la ligne elle-même)
  const lettres = (el) => {
    const txt = el.textContent; el.textContent = ''; el.style.overflow = 'hidden'; el.style.whiteSpace = 'nowrap';
    const L = [...txt].map((ch) => mk('span', '', el, { display: 'inline-block', whiteSpace: 'pre', textAlign: 'center' }, ch));
    L.forEach((s) => { s.style.width = s.getBoundingClientRect().width.toFixed(2) + 'px'; s._ch = s.textContent; });
    return L;
  };
  // chaque lettre monte de sous la ligne (easeOutCubic : départ doux, aucune traînée au flou de bougé), dl s entre deux
  const monte = (L, t, t0, dl = 0.03, d = 0.5) => L.forEach((s, i) => { const p = E(t, t0 + i * dl, d, eOut3); s.style.transform = `translateY(${((1 - p) * 112).toFixed(1)}%)`; s.style.opacity = p > 0 ? '1' : '0'; });
  // une valeur (prix, note) : même montée, un peu plus espacée
  const valeur = (L, t, t0, dl = 0.045) => monte(L, t, t0, dl, 0.52);
  // phrase de plusieurs lignes : une boîte par mot
  const motsDe = (el) => {
    const parts = el.innerHTML.split(/( +)/); el.innerHTML = '';
    return parts.filter((p) => p.length).map((p) => (/^ +$/.test(p) ? (el.appendChild(document.createTextNode(' ')), null) : mk('span', '', el, { display: 'inline-block' }, p))).filter(Boolean);
  };
  const leveMots = (M, t, t0, dl = 0.035, d = 0.45) => M.forEach((s, i) => { const p = E(t, t0 + i * dl, d, eOut3); s.style.transform = `translateY(${(22 * (1 - p)).toFixed(1)}px)`; s.style.opacity = Math.min(1, p * 1.4).toFixed(3); });
  const remplit = (F, t, t0, pct, d = 0.8) => { const p = E(t, t0, d, eOut3); F.style.width = (pct * p).toFixed(2) + '%'; F.style.boxShadow = p > 0 && p < 1 ? `6px 0 14px 1px rgba(255,246,236,${(0.7 * (1 - p)).toFixed(2)})` : ''; };
  const trace = (path, len, t, t0, d = 0.35) => { const p = E(t, t0, d, eOut3); path.setAttribute('stroke-dasharray', `${(len * p).toFixed(1)} ${len}`); return p; };
  const jaillit = (el, t, t0, s0 = 0.55) => { const p = t < t0 ? 0 : spring(t - t0, 'snappy'); el.style.transform = `scale(${(s0 + (1 - s0) * p).toFixed(3)})`; el.style.opacity = Math.min(1, p * 2).toFixed(3); return p; };
  const leve = (el, t, t0, dy = 22, d = 0.45) => { const p = E(t, t0, d, eOut3); el.style.transform = `translateY(${(dy * (1 - p)).toFixed(1)}px)`; el.style.opacity = Math.min(1, p * 1.5).toFixed(3); return p; };
  const reflet = (c) => { const box = mk('div', 'a', c, { left: '0', top: '0', width: '100%', height: '100%', borderRadius: 'inherit', overflow: 'hidden', pointerEvents: 'none', zIndex: 8 }); return mk('div', 'a', box, { left: '0', top: '-25%', width: '34%', height: '150%', background: 'linear-gradient(100deg, rgba(255,240,225,0), rgba(255,240,225,.1) 40%, rgba(255,255,255,.24) 50%, rgba(255,240,225,.1) 60%, rgba(255,240,225,0))', opacity: 0 }); };
  const passe = (B, t, t0, d = 0.75) => { const p = E(t, t0, d, eIO); B.style.transform = `translateX(${lerp(-130, 330, p).toFixed(1)}%) skewX(-14deg)`; B.style.opacity = p > 0 && p < 1 ? '1' : '0'; };
  // sortie d'une scène : elle recule, se floute et s'éteint sous la suivante (aucun texte ne file vers la caméra)
  const recul = (S, t, t0, d = 0.6) => {
    const p = E(t, t0, d, lisse);
    S.root.style.transform = p > 0 ? `scale(${(1 - 0.08 * p).toFixed(4)})` : '';
    S.root.style.filter = p > 0.004 ? `blur(${(26 * p).toFixed(1)}px) brightness(${(1 - 0.6 * p).toFixed(3)})` : '';
    S.root.style.opacity = (1 - E(t, t0 + d * 0.35, d * 0.65, lin)).toFixed(3);
    return p;
  };

  // =====================================================================================================
  // FOND : sombre de l'app + taches de couleur qui bougent (la couleur change avec la scène)
  // =====================================================================================================
  const FOND = mk('div', 'lay', ST, { background: '#0b0a09' });
  const blobs = (parent) => [0, 1, 2].map(() => mk('div', 'a', parent, { width: '1700px', height: '1700px', left: '-850px', top: '-850px' }));
  const BLOBS = blobs(FOND);
  const GRAIN = mk('div', 'lay', FOND, { background: 'radial-gradient(rgba(244,241,236,.07) 1.4px, transparent 1.6px) 0 0/34px 34px' });
  const PAL = {
    o: [[255, 90, 31, 0.5], [190, 40, 20, 0.42], [255, 160, 90, 0.22]],
    r: [[235, 45, 45, 0.55], [150, 15, 30, 0.5], [255, 90, 31, 0.25]],
    v: [[40, 200, 120, 0.42], [10, 100, 70, 0.45], [180, 230, 120, 0.18]],
    n: [[70, 90, 240, 0.5], [120, 60, 220, 0.38], [20, 30, 110, 0.6]],
    a: [[255, 130, 80, 0.48], [230, 70, 120, 0.36], [255, 200, 120, 0.22]],
  };
  let PALK = [[0, 'o']];
  function peintFond(B, G, t) {
    let c = PAL[PALK[0][1]];
    for (let i = 1; i < PALK.length; i++) { const [t0, k] = PALK[i]; c = c.map((v, j) => mix(v, PAL[k][j], E(t, t0, 0.35, eIO))); }
    const pos = [[300 + 320 * Math.sin(t * 0.55), 480 + 260 * Math.cos(t * 0.43)], [800 + 260 * Math.cos(t * 0.47 + 1), 1500 + 240 * Math.sin(t * 0.51)], [560 + 380 * Math.sin(t * 0.33 + 2), 1000 + 420 * Math.cos(t * 0.29)]];
    B.forEach((h, i) => { const [r, g, b, a] = c[i]; h.style.background = `radial-gradient(circle at 50% 50%, rgba(${r | 0},${g | 0},${b | 0},${a.toFixed(3)}) 0%, rgba(${r | 0},${g | 0},${b | 0},0) 58%)`; tf(h, pos[i][0], pos[i][1], { s: 1 + 0.15 * Math.sin(t * 0.7 + i * 2) }); });
    G.style.transform = `translateY(${(-(t * 22) % 34).toFixed(1)}px)`;
  }

  // =====================================================================================================
  // TYPOGRAPHIE de la voix : chaque lettre « tape » (toutes les 33 ms au plus), arrive petite et basse, se pose ; la
  // ligne se recentre à mesure qu'elle s'écrit ; une lueur parcourt chaque ligne de gauche à droite au rythme de la
  // voix (début → fin de chaque mot), traîne derrière elle, halo doux. Sortie : bascule vers le haut, floue.
  // =====================================================================================================
  const TXT = mk('div', 'lay', ST, { perspective: '1100px', perspectiveOrigin: '540px 600px', zIndex: 20 });
  const COL = { w: '#f4f1ec', k: '#ff8a4c', r: '#ff6b6b', g: '#3ecb7f', b: '#a9b8ff', o: '#ff5a1f' };
  const BLANC = [255, 246, 236];
  const tete = (K, t) => {
    if (t < K[0][0]) return null;
    for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const [t0, x0] = K[i - 1], [t1, x1] = K[i]; return t1 > t0 ? lerp(x0, x1, (t - t0) / (t1 - t0)) : x1; }
    const [tl, xl] = K[K.length - 1]; return xl + 2200 * (t - tl);
  };
  const lueur = (xc, X, size) => { if (X == null) return 0; const d = xc - X; return d > 0 ? Math.exp(-((d / (0.5 * size)) ** 2)) : Math.exp(d / (2.2 * size)); };
  const allume = (el, base, halo, g, size) => {
    el.style.color = rgb(mix(base, BLANC, 0.9 * g));
    const h = `${halo[0]},${halo[1]},${halo[2]}`;
    el.style.textShadow = g > 0.02
      ? `0 0 ${(0.04 * size + 0.1 * size * g).toFixed(1)}px rgba(255,250,240,${(0.9 * g).toFixed(3)}), 0 0 ${(0.25 * size + 0.3 * size * g).toFixed(1)}px rgba(${h},${(0.25 + 0.65 * g).toFixed(3)}), 0 0 ${(0.9 * size * g).toFixed(1)}px rgba(${h},${(0.4 * g).toFixed(3)})`
      : `0 0 ${(0.3 * size).toFixed(1)}px rgba(${h},0.22)`;
  };
  function phrase(lignes, o = {}) {
    const size = o.size ?? 116, lh = o.lh ?? 1.04, y0 = o.y ?? 250, font = o.font || `600 ${size}px Clash`;
    const box = mk('div', 'lay', o.parent || TXT, { transformStyle: 'preserve-3d', transformOrigin: `540px ${y0 + size}px` });
    const HW = Math.round(2.8 * size), HH = Math.round(1.7 * size);
    const HALO = mk('div', 'a', box, { width: HW + 'px', height: HH + 'px', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,160,100,.55), rgba(255,90,31,.22) 55%, rgba(255,90,31,0))', pointerEvents: 'none', opacity: 0 });
    const L = lignes.map((mots, li) => {
      const line = { y: y0 + li * size * lh, mots: [] };
      mots.forEach(([s, iv, col], mi) => {
        const t0 = w(iv) + (o.dt || 0), chars = [...nb(s)], dl = Math.min(0.033, 0.26 / Math.max(1, chars.length));
        const M = { col: col || 'w', t0, te: WD[iv].e + (o.dt || 0), L: [] };
        chars.forEach((ch, j) => {
          const sp = mk('span', 'a nw', box, { font, letterSpacing: o.ls ?? '-.03em', color: COL[col || 'w'], transformOrigin: '50% 90%', whiteSpace: 'pre', fontStyle: o.italic ? 'italic' : '' }, ch);
          M.L.push({ el: sp, x: 0, wd: 0, t: t0 - 0.07 + j * dl });
        });
        if (mi < mots.length - 1) M.space = true;
        line.mots.push(M);
      });
      return line;
    });
    const meas = mk('span', 'a nw', TXT, { font, letterSpacing: o.ls ?? '-.03em', visibility: 'hidden', whiteSpace: 'pre', fontStyle: o.italic ? 'italic' : '' });
    for (const line of L) {
      let x = 0; const all = [];
      line.mots.forEach((M) => {
        M.L.forEach((l) => { meas.textContent = l.el.textContent; l.wd = meas.getBoundingClientRect().width; l.x = x; x += l.wd; all.push(l); });
        if (M.space) { meas.textContent = ' '; x += meas.getBoundingClientRect().width * 1.15; }
      });
      line.wd = x; line.all = all;
      const K = []; let tp = -1;
      line.mots.forEach((M) => {
        const a = M.L[0], b = M.L[M.L.length - 1];
        const s = Math.max(M.t0, tp), e = Math.max(M.te, s + 0.12);
        K.push([s, a.x], [e, b.x + b.wd]); tp = e;
      });
      line.K = K;
    }
    meas.remove();
    const fit = Math.min(1, (o.maxW ?? 740) / Math.max(...L.map((l) => l.wd)));   // colonne sûre 140 → 940, moins la lueur qui grossit les lettres de 6 %
    const P = { box, L, size, fit, out: o.out ?? 99, t0: L[0].mots[0].t0, y0, first: L[0].mots[0].L[0].t, haut: !o.parent && y0 <= 260 };
    P.paint = (t) => {
      const on = t >= P.t0 - 0.12 && t < P.out + 0.3; if (!show(box, on)) return;
      const q = E(t, P.out, 0.2, (p) => p * p);
      let hb = 0, hxp = 0, hyp = 0;
      for (const line of L) {
        let vis = 0; line.mots.forEach((M) => M.L.forEach((l) => { vis += l.wd * E(t, l.t, 0.16, eOut3); }));
        const x0 = 540 - vis * fit / 2;
        const X = tete(line.K, t), fadeG = (1 - E(t, line.K[line.K.length - 1][0] + 0.1, 0.45)) * (1 - q);
        const k0 = line.K[0][0], k1 = line.K[line.K.length - 1][0];
        const ha = clamp((t - k0 + 0.06) / 0.12, 0, 1) * (1 - E(t, k1 + 0.04, 0.4)) * (1 - q);
        if (ha > hb) { hb = ha; hxp = x0 + (X == null ? line.K[0][1] : X) * fit; hyp = y0 + (line.y - y0) * fit + 0.6 * size * fit; }
        line.mots.forEach((M) => {
          const c = hx(COL[M.col]);
          const halo = M.col === 'w' ? [255, 138, 76] : hx(COL[M.col]);
          M.L.forEach((l) => {
            const p = E(t, l.t, 0.2, eOut3), pp = SP(t, l.t, 'snappy');
            show(l.el, t >= l.t - 0.01);
            const g = lueur(l.x + l.wd / 2, X, size) * fadeG;
            const yy = y0 + (line.y - y0) * fit + (1 - p) * size * 0.22 * fit - q * 60 - 0.05 * size * g * fit;
            allume(l.el, c, halo, g, size);
            l.el.style.transform = `translate(${(x0 + l.x * fit).toFixed(1)}px,${yy.toFixed(1)}px) rotateX(${(-60 * (1 - p) + 70 * q).toFixed(1)}deg) scale(${((0.35 + 0.65 * pp) * (1 + 0.06 * g) * fit).toFixed(3)})`;
            l.el.style.transformOrigin = '0 80%';
            l.el.style.opacity = (Math.min(1, p * 1.6) * (1 - q)).toFixed(3);
            const bl = 6 * (1 - p) + 10 * q; l.el.style.filter = bl > 0.2 ? `blur(${bl.toFixed(1)}px)` : '';
          });
        });
      }
      HALO.style.opacity = (0.95 * hb).toFixed(3);
      HALO.style.transform = `translate(${(hxp - HW / 2).toFixed(1)}px,${(hyp - HH / 2).toFixed(1)}px)`;
    };
    return P;
  }
  const PHR = [];
  const ph = (lignes, o) => { const p = phrase(lignes, o); PHR.push(p); return p; };

  // =====================================================================================================
  // S1 · ACCROCHE (validée) « Cette 208 à 7 190 € ? À la revente, tu perds 2 688 € » : la 208 devant un prix géant,
  //      le prix bascule chiffre par chiffre en −2 688 € rouge qui passe devant la voiture. Sortie v7 : la scène
  //      recule et se floute sous la feuille du champ qui monte (plus de plongée qui traîne le prix rouge sous
  //      « Colle »).
  // =====================================================================================================
  const S1 = scene(1200);
  // fond propre à S1, utilisé seulement à la boucle : S1 revient dans un cercle, sur le fond de l'image 0
  const F1 = mk('div', 'lay', null, { background: '#0b0a09' }); S1.root.insertBefore(F1, S1.cam);
  const F1B = blobs(F1), F1G = mk('div', 'lay', F1, { background: 'radial-gradient(rgba(244,241,236,.07) 1.4px, transparent 1.6px) 0 0/34px 34px' });
  const PRIX = obj(S1.cam, 1080, 400, { transformStyle: 'preserve-3d' });
  const PRold = [...'7 190 €'].map((ch) => mk('span', 'a nw', PRIX, { font: '600 300px Clash', letterSpacing: '-.05em', color: '#f7e7d6', whiteSpace: 'pre' }, ch === ' ' ? ' ' : ch));
  const PRnew = [...'−2 688 €'].map((ch) => mk('span', 'a nw', PRIX, { font: '600 228px Clash', letterSpacing: '-.05em', color: '#ff5f5f', whiteSpace: 'pre' }, ch === ' ' ? ' ' : ch));
  const lay1 = (arr) => { let x = 0; const ws = arr.map((s) => s.getBoundingClientRect().width); const tot = ws.reduce((a, b) => a + b, 0); arr.forEach((s, i) => { s._x = 540 - tot / 2 + x; s._w = ws[i]; x += ws[i]; }); return tot; };
  lay1(PRold);
  { const tot = lay1(PRnew); if (tot > 730) { PRnew.forEach((s) => { s.style.fontSize = (228 * 730 / tot).toFixed(1) + 'px'; }); lay1(PRnew); } }
  const PRz = PRnew[PRnew.length - 1], PRK = [[w(12) - 0.06, PRnew[0]._x], [WD[12].e, PRz._x], [WD[13].e, PRz._x + PRz._w]];
  const SHADOW = obj(S1.cam, 1000, 160, { borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.75), rgba(0,0,0,0) 70%)' });
  const CAR = mk('img', 'a', S1.cam, { width: '940px' }); CAR.src = '../assets/hooks-cut/208-annonce-cut-2x.png';
  await new Promise((r) => { if (CAR.complete) r(); else { CAR.onload = r; CAR.onerror = r; } });
  const CARH = CAR.getBoundingClientRect().height;
  const QM = obj(S1.cam, 900, 1100, {}, `<svg viewBox="0 0 100 120" width="900" height="1100"><text x="50" y="100" text-anchor="middle" font-family="Clash" font-weight="600" font-size="120" fill="none" stroke="rgba(255,138,76,.55)" stroke-width="1.1">?</text></svg>`);
  const FLASH = mk('div', 'lay', ST, { background: 'radial-gradient(circle at 50% 55%, rgba(255,70,70,.55), rgba(255,40,40,0) 65%)', opacity: 0, zIndex: 15 });
  const tFlip = w(9) - 0.12, tPerds = w(12) - 0.12, tS2out = WD[13].e - 0.1;
  ph([[['Cette', 0], ['208', 2, 'k']], [['à', 3], ['7 190 € ?', 4, 'k']]], { y: 236, size: 124, out: w(7) - 0.22 });
  ph([[['À', 7], ['la', 8], ['revente,', 9]], [['tu', 10], ['perds', 11, 'r']]], { y: 236, size: 124, out: w(14) - 0.24 });
  cue(0, 'impact', 1.1); cue(w(4) - 0.05, 'pop', 0.8); cue(w(6) - 0.05, 'whoosh', 0.5); cue(tFlip, 'whoosh', 1); cue(tFlip + 0.08, 'roll', 0.8); cue(tPerds, 'impact', 1.1); cue(tS2out, 'whoosh', 0.6);
  win(0, 0.5); win(tFlip - 0.02, tFlip + 0.5); win(tPerds - 0.02, tPerds + 0.25);
  function paintS1(t) {
    if (!show(S1.root, t < tS2out + 0.62)) return;
    const a = SP(t, -0.02, 'heavy'), flip = E(t, tFlip, 0.5, doux), shake = bump(t, tPerds, 0.12);
    camera(S1, {
      cx: 540 + 30 * Math.sin(t * 0.6), cy: 980,
      cz: lerp(110, 0, a) + 70 * lisse(clamp((t - 0.8) / 2.4, 0, 1)) + 20 * flip,
      rx: lerp(-10, 2, a) - 8 * flip + 2.5 * shake * Math.sin((t - tPerds) * 80),
      ry: lerp(12, -5, a) + 6 * Math.sin(t * 0.45) * (1 - flip) - 4 * flip,
      rz: lerp(-6, 0, a) + 1.5 * shake * Math.sin((t - tPerds) * 63),
    });
    const fwd = E(t, tFlip + 0.1, 0.6, doux);
    put(PRIX, 540, 760 + 40 * fwd, lerp(-260, 40, fwd), { rx: 4 * Math.sin(t * 0.7) });
    const glow = t >= w(4) - 0.05 ? 1 : 0;
    PRold.forEach((s, i) => {
      const k = E(t, tFlip + i * 0.03, 0.26, eIn);
      s.style.color = glow ? rgb(mix(hx('#f7e7d6'), hx('#ff8a4c'), E(t, w(4) - 0.05, 0.25) * (1 - E(t, w(6), 0.4) * 0.4))) : '#f7e7d6';
      s.style.transform = `translate(${s._x.toFixed(1)}px,${(30 - 380 * k).toFixed(1)}px) rotateX(${(80 * k).toFixed(1)}deg) scale(${(1 + 0.05 * bump(t, w(4) - 0.05 + i * 0.03, 0.1)).toFixed(3)})`;
      s.style.opacity = (1 - E(t, tFlip + 0.06 + i * 0.03, 0.18)).toFixed(3);
    });
    const XG = tete(PRK, t), fG = 1 - E(t, PRK[PRK.length - 1][0] + 0.1, 0.45);
    PRnew.forEach((s, i) => {
      const k = SP(t, tFlip + 0.3 + i * 0.045, 'default'), g = lueur(s._x + s._w / 2, XG, 200) * fG;   // après le départ de l'ancien prix
      s.style.transform = `translate(${s._x.toFixed(1)}px,${(40 + 360 * (1 - k) - 8 * g).toFixed(1)}px) rotateX(${(-80 * (1 - Math.min(1, k))).toFixed(1)}deg) scale(${(1 + 0.08 * bump(t, tPerds + i * 0.02, 0.12) + 0.05 * g).toFixed(3)})`;
      s.style.opacity = Math.min(1, k * 1.5).toFixed(3);
      allume(s, hx('#ff5f5f'), [255, 80, 80], g, 200);
    });
    const dim = E(t, tFlip + 0.2, 0.5);
    put(CAR, 540, 1180 + 10 * Math.sin(t * 1.1) + 40 * dim, 120 - 220 * dim, { ry: -6 + 4 * Math.sin(t * 0.5), s: 1.05 - 0.04 * dim });
    CAR.style.filter = `drop-shadow(0 40px 40px rgba(0,0,0,.55)) brightness(${(1 - 0.55 * dim).toFixed(3)}) saturate(${(1 - 0.6 * dim).toFixed(3)})`;
    put(SHADOW, 540, 1180 + CARH * 0.47, 80, { rx: 80, o: 0.8 });
    const qm = E(t, w(6) - 0.08, 0.4, doux);
    put(QM, 790, 880, -520, { rz: 12 - 20 * qm + 3 * Math.sin(t), s: 0.6 + 0.4 * qm, o: qm * (1 - E(t, tFlip, 0.25)) });
    FLASH.style.opacity = (0.85 * bump(t, tPerds - 0.02, 0.1) + 0.4 * E(t, tFlip + 0.2, 0.4) * (1 - E(t, tS2out, 0.35))).toFixed(3);
    recul(S1, t, tS2out, 0.6);
  }

  // =====================================================================================================
  // S3 · « Colle l'annonce dans utopicar. » : la carte « Lien de l'annonce » de l'app (vrai formulaire : libellé,
  //      champ, bouton « Analyser ce lien ») monte comme une feuille ; gros plan sur le champ : le lien leboncoin est
  //      COLLÉ (il apparaît d'un coup, de gauche à droite, surligné comme un texte collé, curseur au bout) ; recul :
  //      le bouton s'allume ; un doigt l'enfonce ; il se replie en pastille orange, qui devient le chrono.
  // =====================================================================================================
  const S3 = scene(1100);
  const CW3 = 1000, CH3 = 470;
  const CHAMP = obj(S3.cam, CW3, CH3, { borderRadius: '62px', background: 'linear-gradient(175deg,#1e1712,#120e0b 72%)', border: '3px solid rgba(244,241,236,.13)', boxShadow: '0 80px 160px -60px rgba(0,0,0,.9)' });
  const LAB3 = mk('div', 'a nw', CHAMP, { left: '64px', top: '40px', font: '500 46px Satoshi', color: 'rgba(244,241,236,.82)' }, "Lien de l'annonce");
  const INP = mk('div', 'a', CHAMP, { left: '50px', top: '118px', width: (CW3 - 100) + 'px', height: '124px', borderRadius: '30px', background: '#0c0907' });
  INP.innerHTML = `<svg width="${CW3 - 100}" height="124" style="position:absolute;left:0;top:0;overflow:visible"><rect x="1.5" y="1.5" width="${CW3 - 103}" height="121" rx="28.5" fill="none" stroke="rgba(255,170,120,.9)" stroke-width="3" pathLength="1000" stroke-dasharray="0 1000"/></svg>`;
  const IRECT = INP.querySelector('rect');
  const URL3 = 'https://www.leboncoin.fr/ad/voitures/2873461903';
  const SEL3 = mk('div', 'a', INP, { left: '28px', top: '28px', height: '68px', borderRadius: '10px', background: 'rgba(255,90,31,.4)' });
  // le lien, en grand : comme dans un vrai champ, ce qui dépasse est coupé par le bord du champ
  const URLC = mk('div', 'a', INP, { left: '28px', top: '0', width: (CW3 - 100 - 56) + 'px', height: '124px', overflow: 'hidden' });
  SEL3.remove(); URLC.appendChild(SEL3); SEL3.style.left = '0';
  const URLT = mk('div', 'a nw', URLC, { left: '6px', top: '28px', height: '68px', font: '500 46px/68px Satoshi', color: '#f4f1ec' }, URL3);
  const UW = URLT.getBoundingClientRect().width, UV = CW3 - 100 - 56 - 6; SEL3.style.width = (Math.min(UW, UV) + 12) + 'px';
  const CAR3 = mk('div', 'a', INP, { left: '0', top: '32px', width: '4px', height: '60px', borderRadius: '2px', background: '#ff5a1f' });
  const BW3 = CW3 - 100;
  const BTN3 = mk('div', 'a nw', CHAMP, { left: '50px', top: '288px', width: BW3 + 'px', height: '132px', borderRadius: '66px', boxSizing: 'border-box', border: '3px solid rgba(244,241,236,.16)', background: 'rgba(244,241,236,.06)', overflow: 'hidden' });
  const BTT = mk('div', 'a nw', BTN3, { left: '0', top: '0', width: '100%', height: '126px', textAlign: 'center', font: '600 58px/126px Clash', letterSpacing: '-.02em', color: 'rgba(244,241,236,.5)' }, 'Analyser ce lien');
  const BTB = reflet(BTN3);
  const RIP = mk('div', 'a', BTN3, { width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,.4)', opacity: 0 });
  const DOIGT3 = mk('div', 'a', S3.root, { width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,.3)', border: '3px solid rgba(255,255,255,.85)', boxShadow: '0 10px 30px rgba(0,0,0,.35)' });
  const tS3in = tS2out + 0.02, tPaste = w(16) - 0.08, tAct = tPaste + 0.34, tPB = tPaste + 0.45;
  const tTap = WD[18].e + 0.4, tCol = tTap + 0.24, tDet = tCol + 0.22;
  // cadrages : gros plan sur le début du lien (« https://www.leboncoin.fr/… »), puis la carte entière, face caméra
  const LOC3 = (lx, ly) => [540 - CW3 / 2 + lx, 960 - CH3 / 2 + ly];
  const [NX3, NY3] = LOC3(330, 180);
  const FAR3 = { cx: 540, cy: 1009, cz: 0, tz: 0, rx: 0, ry: 0, rz: 0 };
  // point de passage vers S4 : le centre du bouton replié, à l'écran, cadrage final
  const H3 = (() => { const keep = S3.cp; S3.cp = { ...FAR3 }; const [bx, by] = LOC3(50 + BW3 / 2, 288 + 66); const [x, y, k] = proj(S3, bx, by, 0); S3.cp = keep; return { x, y, d: 132 * k, k }; })();
  ph([[['Colle', 14], ["l'annonce", 15]], [['dans', 17], ['utopicar.', 18, 'k']]], { y: 236, size: 124, out: tDet });
  cue(tS3in, 'whoosh', 0.6); cue(tPaste, 'paste', 1); cue(tAct, 'pop', 0.6); cue(tPB, 'whoosh', 0.35); cue(tTap, 'click', 1); cue(tCol, 'whoosh', 0.5);
  function paintS3(t) {
    if (!show(S3.root, t >= tS3in && t < tDet + 0.62)) return;
    const into = SP(t, tS3in, 'default'), pb = E(t, tPB, 0.8, lisse);
    const near = { cx: NX3 + 30 * Math.sin(t * 0.8), cy: NY3, cz: lerp(150, 360, E(t, tS3in + 0.05, 0.75, doux)), rx: 12, ry: -12 + 3 * Math.sin(t * 0.7), rz: -3 };
    camera(S3, { cx: lerp(near.cx, FAR3.cx, pb), cy: lerp(near.cy, FAR3.cy, pb), cz: lerp(near.cz, FAR3.cz, pb), rx: lerp(near.rx, 0, pb), ry: lerp(near.ry, 0, pb), rz: lerp(near.rz, 0, pb) });
    // la feuille monte (sans texte encore : rien ne traîne au flou de bougé)
    put(CHAMP, 540, 960 + 1250 * (1 - into), 0, { rx: 28 * (1 - Math.min(1, into)) });
    leve(LAB3, t, tS3in + 0.16, 18, 0.45);
    IRECT.setAttribute('stroke-dasharray', `${(1000 * E(t, tS3in + 0.22, 0.55, eOut3)).toFixed(1)} 1000`);
    IRECT.setAttribute('stroke', `rgba(255,170,120,${(0.9 - 0.45 * E(t, tS3in + 0.8, 0.5)).toFixed(3)})`);
    INP.style.boxShadow = `0 0 0 ${(7 * E(t, tS3in + 0.6, 0.4)).toFixed(1)}px rgba(255,90,31,.14)`;
    leve(BTN3, t, tS3in + 0.42, 26, 0.5);
    // le collage : le lien apparaît d'un coup, de gauche à droite (0,28 s), surligné, puis le surlignage s'efface
    const pw = E(t, tPaste, 0.28, eOut3);
    URLT.style.clipPath = `inset(-10px ${(100 * (1 - pw)).toFixed(2)}% -10px 0)`;
    { const sw = Math.min(UW, UV) + 12; SEL3.style.clipPath = `inset(0 ${Math.max(0, sw - (UW * pw + 6)).toFixed(1)}px 0 0 round 10px)`; }
    SEL3.style.opacity = (pw > 0 ? 1 - E(t, tPaste + 0.5, 0.45) : 0).toFixed(3);
    const cx3 = 34 + UW * pw + 3;
    CAR3.style.transform = `translateX(${cx3.toFixed(1)}px)`;
    show(CAR3, t < tTap && cx3 < CW3 - 100 - 30 && (Math.floor((t - tS3in) / 0.27) % 2 === 0 || (t > tPaste - 0.02 && t < tPaste + 0.4)));
    // le bouton s'allume (lien valide), un reflet passe
    const act = E(t, tAct, 0.3);
    BTN3.style.background = act > 0 ? rgb(mix([33, 28, 24], [255, 90, 31], act)) : 'rgba(244,241,236,.06)';
    BTN3.style.borderColor = `rgba(244,241,236,${(0.16 * (1 - act)).toFixed(3)})`;
    BTN3.style.boxShadow = act > 0 ? `0 28px 80px -28px rgba(255,90,31,${(0.85 * act).toFixed(2)})` : '';
    BTT.style.color = act > 0 ? rgb(mix([150, 145, 140], [22, 9, 4], act)) : 'rgba(244,241,236,.5)';
    passe(BTB, t, tAct + 0.15, 0.7);
    // appui (bouton ×0,95, onde), puis repli en pastille ronde (largeur → hauteur), le texte part avant
    const pr = bump(t, tTap - 0.03, 0.12), col = SP(t, tCol, 'snappy');
    const bw = lerp(BW3, 132, Math.min(1, col));
    BTN3.style.width = bw.toFixed(1) + 'px'; BTN3.style.left = (50 + (BW3 - bw) / 2).toFixed(1) + 'px';
    BTN3.style.transform = `translateY(${(26 * (1 - E(t, tS3in + 0.42, 0.5, eOut3))).toFixed(1)}px) scale(${(1 - 0.05 * pr).toFixed(4)})`;
    BTT.style.opacity = (1 - E(t, tCol - 0.04, 0.1)).toFixed(3);
    BTB.parentNode.style.display = t < tCol ? '' : 'none';
    const rp = E(t, tTap, 0.5, eOut3);
    RIP.style.transform = `translate(${(BW3 / 2 + 180 - 160).toFixed(1)}px,${(66 - 160).toFixed(1)}px) scale(${(0.1 + 1.6 * rp).toFixed(3)})`;
    RIP.style.opacity = (t >= tTap && t < tCol ? 0.6 * (1 - rp) : 0).toFixed(3);
    show(BTN3, t < tDet);
    // le doigt : arrive, appuie, repart
    const dOn = t >= tTap - 0.35 && t < tTap + 0.32; show(DOIGT3, dOn);
    if (dOn) { const a = E(t, tTap - 0.35, 0.25), b = 1 - E(t, tTap + 0.1, 0.2); tf(DOIGT3, H3.x + 170 - 60, H3.y + 30 - 60 + 90 * (1 - a), { s: (1 - 0.18 * pr) * (0.85 + 0.15 * a), o: a * b }); }
    recul(S3, t, tDet, 0.6);
  }

  // =====================================================================================================
  // S4 · « En une minute, » : la pastille orange s'ouvre en anneau de chrono (le disque se creuse et grandit), la
  //      piste et ses 60 traits ; l'arc fait le tour pendant que le chrono compte 0:00 → 1:00 (chiffre figé sur
  //      chaque image) ; puis l'anneau se couche jusqu'à n'être plus qu'un trait, d'où naît la première carte.
  // =====================================================================================================
  const S4 = scene(1200);
  const RX4 = H3.x, RY4 = H3.y;
  const RING = obj(S4.cam, 900, 900, {});
  RING.innerHTML = `<svg viewBox="0 0 900 900" width="900" height="900" style="position:absolute;left:0;top:0;overflow:visible">
    <circle class="piste" cx="450" cy="450" r="30" fill="none" stroke="#ff5a1f" stroke-width="60"/>
    <circle class="arc" cx="450" cy="450" r="400" fill="none" stroke="#ff5a1f" stroke-width="44" stroke-linecap="round" stroke-dasharray="0 2513.3" transform="rotate(-90 450 450)"/>
    <g class="ticks">${Array.from({ length: 60 }, (_, i) => `<rect x="${i % 5 ? 447 : 445}" y="${i % 5 ? 4 : 0}" width="${i % 5 ? 6 : 10}" height="${i % 5 ? 22 : 34}" rx="3" fill="rgba(244,241,236,.22)" transform="rotate(${i * 6} 450 450)"/>`).join('')}</g></svg>`;
  const RPIST = RING.querySelector('.piste'), RARC = RING.querySelector('.arc'), TICKS = [...RING.querySelectorAll('.ticks rect')];
  const CNT4 = mk('div', 'a nw', RING, { left: '0', top: '290px', width: '900px', height: '320px', textAlign: 'center', font: '600 250px/320px Clash', color: '#f4f1ec' });
  const C4 = ['0', ':', '0', '0'].map((ch, i) => { const cell = mk('span', '', CNT4, { display: 'inline-block', position: 'relative', overflow: 'hidden', verticalAlign: 'top', height: '320px', width: i === 1 ? '0.32em' : '0.62em' }); return mk('span', '', cell, { position: 'absolute', left: '0', top: '0', width: '100%', textAlign: 'center' }, ch); });
  const tR0 = tDet, tRun = w(19) - 0.06, tRend = WD[21].e - 0.02, tS4out = w(22) - 0.62;
  ph([[['En', 19], ['une', 20, 'k'], ['minute,', 21, 'k']]], { y: 250, size: 132, out: tS4out });
  cue(tR0, 'whoosh', 0.6); for (let i = 0; i < 12; i++) cue(tR0 + 0.18 + i * 0.03, 'tick', 0.22); for (let i = 0; i < 10; i++) cue(tRun + i * (tRend - tRun) / 10, 'tick', 0.4); cue(tRend, 'ding', 0.8); cue(tS4out, 'whoosh', 0.6);
  win(tS4out, tS4out + 0.32);
  function paintS4(t) {
    if (!show(S4.root, t >= tR0 - 0.01 && t < tS4out + 0.32)) return;
    const p = SP(t, tR0, 'default'), run = E(fq(t), tRun, tRend - tRun, lin), couche = E(t, tS4out, 0.3, eIn2);
    camera(S4, { cx: 540, cy: 960, cz: 30 * E(t, tR0, 1.2, doux) });
    const wob = (1 - E(t, tS4out - 0.35, 0.3)) * Math.min(1, p);
    put(RING, RX4, RY4, 0, { rx: 90 * couche + 5 * Math.sin(t * 1.3) * wob, ry: 8 * Math.sin(t * 0.9) * wob, s: 1 + 0.09 * couche });
    // le disque (diamètre de la pastille) se creuse en anneau : rayon moyen et épaisseur
    const d0 = H3.d / 1.0, Ro = lerp(d0 / 2, 422, p), Ri = lerp(0, 378, p);
    RPIST.setAttribute('r', ((Ro + Ri) / 2).toFixed(2)); RPIST.setAttribute('stroke-width', Math.max(0.1, Ro - Ri).toFixed(2));
    const pc = E(t, tR0 + 0.12, 0.35);
    RPIST.setAttribute('stroke', `rgba(${lerp(255, 244, pc) | 0},${lerp(90, 241, pc) | 0},${lerp(31, 236, pc) | 0},${lerp(1, 0.1, pc).toFixed(3)})`);
    RARC.setAttribute('stroke-dasharray', `${(2513.3 * run).toFixed(1)} 2513.3`); RARC.setAttribute('opacity', run > 0 ? '1' : '0');   // un trait de longueur nulle à bouts ronds dessine un point
    TICKS.forEach((r, i) => { const k = E(t, tR0 + 0.18 + i * 0.006, 0.18, eOut); r.setAttribute('opacity', k.toFixed(3)); r.setAttribute('fill', run > 0 && i / 60 < run ? '#ff8a4c' : 'rgba(244,241,236,.22)'); });
    // le chrono : 0:00 → 1:00, une valeur par image
    const v = Math.min(60, Math.floor(60 * run + 1e-6)), txt = v >= 60 ? '1:00' : `0:${String(v).padStart(2, '0')}`;
    C4.forEach((s, i) => {
      s.textContent = txt[i];
      const q = E(t, tR0 + 0.3 + i * 0.05, 0.5, eOut3); s.style.transform = `translateY(${((1 - q) * 105).toFixed(1)}%)`;
    });
    const fini = t >= tRend;
    CNT4.style.color = fini ? rgb(mix(hx('#f4f1ec'), hx('#ff8a4c'), E(t, tRend, 0.15))) : '#f4f1ec';
    CNT4.style.transform = `scale(${(1 + 0.07 * bump(t, tRend, 0.14)).toFixed(3)})`;
  }

  // =====================================================================================================
  // S5 · « la cote, les travaux, ta marge… » : trois cartes du rapport, une par mot, nées au même endroit ; chaque
  //      nouvelle carte pousse la précédente vers le haut et le fond (un paquet : on lit encore le titre de chacune) ;
  //      « et le verdict. » : le paquet descend et s'efface, la carte du verdict naît devant et se construit ;
  //      « À éviter. » : son titre s'allume avec la voix, la carte tremble ; puis elle se retourne.
  // =====================================================================================================
  const S5 = scene(1200);
  const YF = RY4;
  function grandeCarte(lab, val, vcol, note, ncol, sub) {
    const c = obj(S5.cam, 920, 600, { borderRadius: '70px', background: 'linear-gradient(170deg,#211812,#120d0a 70%)', border: '3px solid rgba(244,241,236,.12)', boxShadow: '0 70px 140px -50px rgba(0,0,0,.95)' });
    const L = lettres(mk('div', 'a nw', c, { left: '70px', top: '58px', font: '500 52px Satoshi', color: 'rgba(244,241,236,.82)' }, lab));
    const CH = mk('div', 'a nw', c, { right: '64px', left: 'auto', top: '44px', font: '500 70px Satoshi', color: 'rgba(244,241,236,.5)' }, '›');
    const V = lettres(mk('div', 'a nw', c, { left: '64px', top: '158px', font: '600 158px/1.08 Clash', letterSpacing: '-.04em', color: vcol }, nb(val)));
    const PS = mk('div', 'a', c, { left: '70px', top: '370px', width: '780px', height: '22px', borderRadius: '11px', background: 'rgba(244,241,236,.08)', overflow: 'hidden', transformOrigin: '0 50%' }); const F = mk('i', 'a', PS, { left: '0', top: '0', bottom: '0', width: '0%', borderRadius: '11px', background: ncol });
    const SM = motsDe(mk('div', 'a', c, { left: '70px', top: '420px', width: '780px', font: '500 42px/1.3 Satoshi', color: 'rgba(244,241,236,.62)' }, nb(sub)));
    return { c, N: naissance(c, vcol), L, CH, V, PS, F, SM, B: reflet(c), note };
  }
  const CARTES = [
    grandeCarte('Bon prix ?', 'Trop cher', '#ff6b6b', 0, '#ff6b6b', '1 671 € de plus que les annonces comparables (+30 %)'),
    grandeCarte('Des travaux ?', '≈ 540 €', '#3ecb7f', 80, '#3ecb7f', 'Probable sur 12 mois, entre 0 € et 1 650 €'),
    grandeCarte('Ça rapporte ?', '−2 688 €', '#ff6b6b', 0, '#ff6b6b', "Vous perdriez de l'argent au prix affiché"),
  ];
  const CRY = [-5, 5, -3];
  // la carte du verdict (vrai rapport de la 208), décomposée
  const VERD = obj(S5.cam, 920, 960, { borderRadius: '70px', background: 'linear-gradient(170deg,#46221f,#120d0a 65%)', border: '3px solid rgba(255,107,107,.45)', boxShadow: '0 70px 140px -50px rgba(0,0,0,.95)', backfaceVisibility: 'hidden' });
  VERD.innerHTML = `<svg viewBox="0 0 120 120" width="330" height="330" style="position:absolute;left:70px;top:70px;transform:rotate(-90deg)"><circle class="pist" cx="60" cy="60" r="52" fill="none" stroke="rgba(244,241,236,.1)" stroke-width="10" stroke-dasharray="0 326.7"/><circle class="arc" cx="60" cy="60" r="52" fill="none" stroke="#ff6b6b" stroke-width="10" stroke-linecap="round" stroke-dasharray="0 326.7"/></svg>
    <div class="n a nw" style="left:70px;top:172px;width:330px;text-align:center;font:600 110px/1.08 Clash;letter-spacing:-.03em">23</div><div class="s a nw" style="left:70px;top:272px;width:330px;text-align:center;font:500 34px Satoshi;color:rgba(244,241,236,.6)">sur 100</div>
    <div class="k a nw" style="left:72px;top:448px;font:700 36px Satoshi;letter-spacing:.16em;color:rgba(244,241,236,.62)">AVANT LE PREMIER MESSAGE</div>
    <div class="ti a nw" style="left:66px;top:500px;font:600 130px/1.08 Clash;letter-spacing:-.03em;color:#ff6b6b">À éviter</div>
    <div class="x a" style="left:72px;top:668px;width:780px;font:500 40px/1.38 Satoshi;color:rgba(244,241,236,.8)">${nb("Même bien négociée, elle ne laisse pas votre minimum de 750 € (il faudrait l'acheter 3 750 € au plus).")}</div>
    <div class="f a" style="left:72px;top:860px;width:780px;font:500 40px/1.38 Satoshi;color:rgba(244,241,236,.8)"><b style="color:#f4f1ec;font-weight:700">À faire :</b> Passez à l'annonce suivante.</div>`;
  const VPIST = VERD.querySelector('.pist'), VARC = VERD.querySelector('.arc'), VNR = lettres(VERD.querySelector('.n')), VS = VERD.querySelector('.s');
  const VKL = lettres(VERD.querySelector('.k')), VTL = lettres(VERD.querySelector('.ti')), VXM = motsDe(VERD.querySelector('.x')), VF = VERD.querySelector('.f'), VB = reflet(VERD), VN = naissance(VERD, '#ff6b6b');
  VTL.forEach((s) => { s._x = s.offsetLeft; s._w = s.offsetWidth; });
  const tC = [w(22) - 0.35, w(24) - 0.2, w(26) - 0.2], tVer = w(30) - 0.3, tV = tVer + 0.3, tEv = w(31) - 0.04, tFlipA = WD[32].e + 0.3;
  const VTK = [[tEv, VTL[0]._x], [WD[32].e, VTL[VTL.length - 1]._x + VTL[VTL.length - 1]._w]];   // la lueur suit « À éviter »
  ph([[['la', 22], ['cote,', 23, 'k']]], { y: 236, size: 136, out: w(24) - 0.22 });
  ph([[['les', 24], ['travaux,', 25, 'k']]], { y: 236, size: 136, out: w(26) - 0.22 });
  ph([[['ta', 26], ['marge…', 27, 'k']]], { y: 236, size: 136, out: w(28) - 0.22 });
  ph([[['et', 28], ['le', 29], ['verdict.', 30, 'k']]], { y: 236, size: 136, out: w(31) - 0.24 });
  tC.forEach((t0, i) => { cue(t0, 'whoosh', 0.5); cue(t0 + 0.34, 'key', 0.5); cue(t0 + 0.72, 'tick', 0.4); cue(t0 + 1.35, 'shine', 0.3); });
  cue(tVer, 'whoosh', 0.7); cue(tV + 0.3, 'key', 0.5); cue(tV + 0.75, 'pop', 0.5); cue(tEv, 'impact', 1.2); cue(tFlipA, 'whoosh', 0.9);
  win(tEv - 0.02, tEv + 0.25); win(tFlipA - 0.02, tFlipA + 0.26);
  function paintS5(t) {
    if (!show(S5.root, t >= tC[0] - 0.02 && t < tFlipA + 0.26)) return;
    const shake = bump(t, tEv, 0.12), dv = E(t, tVer - 0.08, 0.6, doux);
    camera(S5, { cx: 540 + 6 * Math.sin(t * 0.5) + 6 * shake * Math.sin((t - tEv) * 90), cy: 960, cz: 30 * Math.sin(t * 0.4), rx: 1.5 * Math.sin(t * 0.7), ry: 2.5 * Math.sin(t * 0.5), rz: 1.2 * shake * Math.sin((t - tEv) * 70) });
    CARTES.forEach((C, i) => {
      let k = 0, kv = 0; for (let j = i + 1; j < 3; j++) { k += E(t, tC[j] - 0.06, 0.55, doux); kv += E(t, tC[j] - 0.1, 0.22, lisse); }
      const on = t >= tC[i] - 0.02 && dv < 0.999; show(C.c, on); if (!on) return;
      put(C.c, 540, YF - 150 * k + 560 * dv, -170 * k - 500 * dv, { rx: 3, ry: CRY[i] * (1 - 0.5 * k) });
      const br = 1 - 0.36 * kv - 0.4 * dv, bl = 3.5 * kv + 9 * dv;
      C.c.style.filter = br < 0.999 || bl > 0.1 ? `brightness(${br.toFixed(3)})${bl > 0.1 ? ` blur(${bl.toFixed(1)}px)` : ''}` : '';
      C.c.style.opacity = (1 - E(dv, 0.45, 0.5, lin)).toFixed(3);
      const t0 = tC[i];
      nait(C.N, t, t0);
      monte(C.L, t, t0 + 0.22, 0.03);
      const pc = E(t, t0 + 0.3, 0.4, eOut3); C.CH.style.transform = `translateX(${(-30 * (1 - pc)).toFixed(1)}px)`; C.CH.style.opacity = pc.toFixed(3);
      valeur(C.V, t, t0 + 0.34);
      C.PS.style.transform = `scaleX(${E(t, t0 + 0.62, 0.35, eOut3).toFixed(3)})`;
      remplit(C.F, t, t0 + 0.74, Math.max(3, C.note), 0.6);
      leveMots(C.SM, t, t0 + 0.84, 0.035);
      passe(C.B, t, t0 + 1.35);
    });
    // le verdict : naît devant le paquet, se construit pendant le silence après « verdict »
    const flipA = E(t, tFlipA, 0.24, eIn2);
    show(VERD, t >= tVer && flipA < 0.999);
    put(VERD, 540, 1000, 2, { ry: 90 * flipA });
    VERD.style.filter = flipA > 0.01 ? `blur(${(9 * flipA).toFixed(1)}px)` : '';   // flou de rotation : pas de cartes dédoublées au flou de bougé
    nait(VN, t, tVer);
    trace(VPIST, 326.7, t, tV, 0.4);
    VARC.setAttribute('stroke-dasharray', `${(326.7 * 0.23 * E(t, tV + 0.2, 0.8, eOut3)).toFixed(1)} 326.7`);
    valeur(VNR, t, tV + 0.28);
    leve(VS, t, tV + 0.42, 16);
    monte(VKL, t, tV + 0.5, 0.012, 0.4);
    monte(VTL, t, tV + 0.72, 0.045, 0.5);
    leveMots(VXM, t, tV + 0.98, 0.024);
    leve(VF, t, tV + 1.3);
    passe(VB, t, tV + 1.55);
    // « À éviter. » : le titre s'allume au rythme de la voix ; la carte tremble, son contour pulse (aucun texte en plus)
    const XV = tete(VTK, t), fV = 1 - E(t, VTK[1][0] + 0.15, 0.5);
    VTL.forEach((s) => { allume(s, hx('#ff6b6b'), [255, 90, 90], lueur(s._x + s._w / 2, XV, 130) * fV, 130); });
    const pul = t >= tEv ? E(t, tEv, 0.12) * (1 - 0.6 * E(t, tEv + 0.15, 0.5)) : 0;
    VERD.style.boxShadow = pul > 0 ? `0 0 0 ${(4 + 16 * pul).toFixed(1)}px rgba(255,107,107,${(0.3 + 0.5 * pul).toFixed(2)}), 0 70px 140px -50px rgba(0,0,0,.95)` : '0 70px 140px -50px rgba(0,0,0,.95)';
    FLASH.style.opacity = Math.max(+FLASH.style.opacity || 0, 0.7 * bump(t, tEv, 0.1)).toFixed(3);
  }

  // =====================================================================================================
  // S6 · « Une bonne affaire ? » : la carte se retourne : au dos, le verdict vert de la Clio (vrai rapport : 97 sur
  //      100, « Très bonne affaire », il vous resterait environ 1 450 €) ; « Ton prix d'offre… » : le verdict
  //      recule, les paliers de l'offre de l'app naissent (Ouverture 6 650 €, Objectif 6 900 €) ; « et le plafond » :
  //      la barre rouge PLAFOND 7 100 € tombe, face caméra, et s'écrase au-dessus ; « à ne pas dépasser » : l'objectif
  //      vient buter contre elle.
  // =====================================================================================================
  const S6 = scene(1200);
  const GV = obj(S6.cam, 920, 960, { borderRadius: '70px', background: 'linear-gradient(170deg,#163a26,#0d1410 65%)', border: '3px solid rgba(62,203,127,.5)', boxShadow: '0 70px 140px -50px rgba(0,0,0,.95)', backfaceVisibility: 'hidden' });
  GV.innerHTML = `<svg viewBox="0 0 120 120" width="330" height="330" style="position:absolute;left:70px;top:70px;transform:rotate(-90deg)"><circle class="pist" cx="60" cy="60" r="52" fill="none" stroke="rgba(244,241,236,.1)" stroke-width="10" stroke-dasharray="0 326.7"/><circle class="arc" cx="60" cy="60" r="52" fill="none" stroke="#3ecb7f" stroke-width="10" stroke-linecap="round" stroke-dasharray="0 326.7"/></svg>
    <div class="n a nw" style="left:70px;top:172px;width:330px;text-align:center;font:600 110px/1.08 Clash;letter-spacing:-.03em">97</div><div class="s a nw" style="left:70px;top:272px;width:330px;text-align:center;font:500 34px Satoshi;color:rgba(244,241,236,.6)">sur 100</div>
    <div class="k a nw" style="left:72px;top:448px;font:700 36px Satoshi;letter-spacing:.16em;color:rgba(244,241,236,.62)">AVANT LE PREMIER MESSAGE</div>
    <div class="ti a nw" style="left:66px;top:506px;font:600 104px/1.08 Clash;letter-spacing:-.03em;color:#3ecb7f">Très bonne affaire</div>
    <div class="x a" style="left:72px;top:660px;width:780px;font:500 40px/1.38 Satoshi;color:rgba(244,241,236,.8)">${nb('Il vous resterait environ 1 450 €, au-dessus de votre minimum, sur un marché qui se vend bien.')}</div>
    <div class="f a" style="left:72px;top:860px;width:780px;font:500 40px/1.38 Satoshi;color:rgba(244,241,236,.8)"><b style="color:#f4f1ec;font-weight:700">À faire :</b> Écrivez au vendeur maintenant.</div>`;
  { const ti = GV.querySelector('.ti'), wT = ti.getBoundingClientRect().width; if (wT > 750) ti.style.fontSize = (104 * 750 / wT).toFixed(1) + 'px'; }
  const GPIST = GV.querySelector('.pist'), GARC = GV.querySelector('.arc'), GNR = lettres(GV.querySelector('.n')), GS = GV.querySelector('.s');
  const GKL = lettres(GV.querySelector('.k')), GTL = lettres(GV.querySelector('.ti')), GXM = motsDe(GV.querySelector('.x')), GF = GV.querySelector('.f'), GB = reflet(GV);
  // les paliers de l'offre (bloc « Votre offre » du rapport de la Clio)
  const ECH = [['Ouverture', 6650, 'après la visite'], ['Objectif', 6900, 'prix à viser']].map(([lab, v, sub]) => {
    const c = obj(S6.cam, 900, 250, { borderRadius: '56px', background: 'linear-gradient(170deg,#211812,#120d0a 70%)', border: '3px solid rgba(244,241,236,.13)', boxShadow: '0 50px 110px -45px rgba(0,0,0,.95)' });
    const L = lettres(mk('div', 'a nw', c, { left: '62px', top: '38px', font: '500 46px Satoshi', color: 'rgba(244,241,236,.8)' }, lab));
    const S = mk('div', 'a nw', c, { right: '62px', left: 'auto', top: '42px', font: '500 38px Satoshi', color: 'rgba(244,241,236,.5)' }, sub);
    const V = lettres(mk('div', 'a nw', c, { left: '56px', top: '100px', font: '600 120px/1.08 Clash', letterSpacing: '-.04em', color: '#f4f1ec' }, nb(eur(v))));
    return { c, N: naissance(c, '#f4f1ec'), L, S, V, B: reflet(c) };
  });
  const BAR = obj(S6.cam, 860, 170, { borderRadius: '46px', background: 'linear-gradient(180deg,#ff5d5d,#d02a2a)', boxShadow: '0 34px 80px -24px rgba(208,42,42,.8), inset 0 2px 0 rgba(255,200,200,.5)' });
  const BARl = mk('div', 'a nw', BAR, { left: '58px', top: '0', height: '170px', font: '700 74px/170px Clash', letterSpacing: '.1em', color: '#fff' }, 'PLAFOND');
  const BARv = mk('div', 'a nw', BAR, { right: '58px', left: 'auto', top: '0', height: '170px', font: '600 100px/170px Clash', letterSpacing: '-.03em', color: '#fff' }, nb('7 100 €'));
  { const wl = BARl.getBoundingClientRect().width, wv = BARv.getBoundingClientRect().width; if (wl + wv > 860 - 116 - 40) { const k = (860 - 156) / (wl + wv); BARl.style.fontSize = (74 * k).toFixed(1) + 'px'; BARv.style.fontSize = (100 * k).toFixed(1) + 'px'; } }
  const BARf = mk('div', 'a', BAR, { left: '0', top: '0', width: '100%', height: '100%', borderRadius: '46px', background: '#fff', opacity: 0, pointerEvents: 'none' });
  const YB = 720, YO = [1258, 968];
  const tFlipB = tFlipA + 0.24, tGout = w(37) - 0.2, tOff = w(38) - 0.12, tObj = w(40) - 0.1, tPla = w(43) - 0.2, tImp = tPla + 0.2, tDep = w(47) + 0.02, tS6out = w(48) - 0.5;
  const GTK = [[w(34) - 0.04, GTL[0].offsetLeft], [WD[35].e, GTL[GTL.length - 1].offsetLeft + GTL[GTL.length - 1].offsetWidth]];
  GTL.forEach((s) => { s._x = s.offsetLeft; s._w = s.offsetWidth; });
  ph([[['Une', 33], ['bonne', 34, 'g']], [['affaire ?', 35, 'g']]], { y: 236, size: 128, out: w(37) - 0.22 });
  ph([[['Ton', 37], ['prix', 38, 'k']], [["d'offre…", 39, 'k']]], { y: 236, size: 128, out: w(41) - 0.22 });
  ph([[['et', 41], ['le', 42]], [['plafond', 43, 'r']]], { y: 236, size: 128, out: w(44) - 0.16 });
  ph([[['à', 44], ['ne', 45], ['pas', 46]], [['dépasser.', 47, 'r']]], { y: 236, size: 128, out: tS6out + 0.2 });
  cue(tFlipB, 'whoosh', 0.5); cue(tFlipB + 0.3, 'key', 0.5); cue(tFlipB + 1.0, 'ding', 0.7); cue(tGout, 'whoosh', 0.5); [tOff, tObj].forEach((t0) => { cue(t0, 'pop', 0.5); cue(t0 + 0.3, 'key', 0.5); }); cue(tPla, 'whoosh', 0.8); cue(tImp, 'impact', 1.3); cue(tDep, 'thud', 0.9); cue(tS6out, 'whoosh', 0.6);
  win(tFlipB - 0.02, tFlipB + 0.35); win(tPla - 0.02, tImp + 0.2); win(tDep - 0.02, tDep + 0.2);
  function paintS6(t) {
    if (!show(S6.root, t >= tFlipB - 0.01 && t < tS6out + 0.62)) return;
    const shake = bump(t, tImp, 0.12) + 0.5 * bump(t, tDep + 0.06, 0.1);
    camera(S6, { cx: 540 + 8 * shake * Math.sin((t - tImp) * 90), cy: 960, cz: 20 * Math.sin(t * 0.4), rx: 1.5 * Math.sin(t * 0.6), ry: 2.5 * Math.sin(t * 0.5), rz: 1.2 * shake * Math.sin((t - tImp) * 70) });
    // le verdict vert : se retourne (dos de la carte rouge), se construit avec la voix, puis recule et se floute
    const fl = SP(t, tFlipB, 'default'), go = E(t, tGout, 0.6, doux);
    show(GV, go < 0.999);
    put(GV, 540, 1012 - 60 * go, -620 * go, { ry: -90 * (1 - Math.min(1, fl)) - 4 * (1 - Math.min(1, fl)) });
    const gfl = t >= tFlipB ? 9 * Math.max(0, 1 - Math.min(1, fl) * 1.15) : 0;   // flou de rotation pendant qu'elle se retourne
    GV.style.filter = go > 0.01 || gfl > 0.1 ? `blur(${(10 * go + gfl).toFixed(1)}px) brightness(${(1 - 0.55 * go).toFixed(3)})` : '';
    GV.style.opacity = (1 - E(go, 0.5, 0.5, lin)).toFixed(3);
    const g0 = tFlipB;
    trace(GPIST, 326.7, t, g0 + 0.08, 0.4);
    GARC.setAttribute('stroke-dasharray', `${(326.7 * 0.97 * E(t, g0 + 0.22, 0.9, eOut3)).toFixed(1)} 326.7`);
    valeur(GNR, t, g0 + 0.26);
    leve(GS, t, g0 + 0.4, 16);
    monte(GKL, t, g0 + 0.44, 0.012, 0.4);
    monte(GTL, t, w(34) - 0.06, 0.03, 0.5);
    const XG = tete(GTK, t), fGl = 1 - E(t, GTK[1][0] + 0.15, 0.5);
    GTL.forEach((s) => allume(s, hx('#3ecb7f'), [62, 203, 127], lueur(s._x + s._w / 2, XG, 104) * fGl, 104));
    leveMots(GXM, t, WD[35].e - 0.1, 0.024);
    leve(GF, t, WD[35].e + 0.25);
    passe(GB, t, WD[35].e + 0.5);
    // paliers : chacun naît d'un trait, libellé lettre à lettre, prix qui monte, mention, reflet
    ECH.forEach((P, i) => {
      const t0 = [tOff, tObj][i];
      show(P.c, t >= t0 - 0.02);
      const dep = i === 1 ? -20 * bump(t, tDep, 0.16) + 12 * bump(t, tImp, 0.1) : 0;
      put(P.c, 540, YO[i] + dep, 0, { rx: 2 });
      nait(P.N, t, t0); monte(P.L, t, t0 + 0.2, 0.03); leve(P.S, t, t0 + 0.3, 14); valeur(P.V, t, t0 + 0.3); passe(P.B, t, t0 + 0.9);
    });
    // PLAFOND : la barre tombe vers sa place (elle grandit vers l'objectif), s'écrase (aplatie un instant), tient
    const fall = E(t, tPla, tImp - tPla, eIn2), hit = bump(t, tImp, 0.1);
    show(BAR, t >= tPla - 0.01);
    put(BAR, 540, YB, 420 * (1 - fall), { sx: 1 + 0.05 * hit, sy: 1 - 0.14 * hit, o: Math.min(1, E(t, tPla, 0.08, lin) * 1.2), f: t < tImp && fall > 0.02 ? `blur(${(6 * fall).toFixed(1)}px)` : '' });   // flou de chute
    BARf.style.opacity = (0.55 * bump(t, tImp, 0.08) + 0.35 * bump(t, tDep + 0.05, 0.1)).toFixed(3);
    FLASH.style.opacity = Math.max(+FLASH.style.opacity || 0, 0.55 * bump(t, tImp, 0.1)).toFixed(3);
    recul(S6, t, tS6out, 0.62);
  }

  // =====================================================================================================
  // S7 · « Et pour les trouver, arrête de scroller. » : un écran s'ouvre au centre (coins arrondis) sur le MUR
  //      d'annonces incliné, et grandit jusqu'au plein écran pendant que les paliers reculent et se floutent ; sur
  //      « arrête », le mur accélère (flou directionnel le long du défilement, jamais de chiffres dédoublés) ; sur
  //      « scroller », il s'arrête NET ; la meilleure annonce sort du mur, se construit, le mur s'assombrit.
  // =====================================================================================================
  const S7 = scene(1100);
  S7.root.style.background = '#0b0a09';
  const MUR = obj(S7.cam, 1560, 9000, {});
  const MW = 500, MH = 340, MG = 30;
  function mini(parent, it, x, y, best = false) {
    const c = mk('div', 'a', parent, { left: x + 'px', top: y + 'px', width: MW + 'px', height: MH + 'px', borderRadius: '44px', background: best ? 'linear-gradient(170deg,#1c3724,#120d0a 70%)' : 'linear-gradient(170deg,#211812,#120d0a 70%)', border: `3px solid ${best ? 'rgba(62,203,127,.7)' : 'rgba(244,241,236,.1)'}` });
    mk('div', 'a nw', c, { left: '36px', top: '32px', width: (MW - 72) + 'px', overflow: 'hidden', textOverflow: 'ellipsis', font: '700 36px Satoshi', color: '#f4f1ec' }, it[0].replace('Renault ', ''));
    mk('div', 'a nw', c, { left: '36px', top: '84px', width: (MW - 72) + 'px', overflow: 'hidden', textOverflow: 'ellipsis', font: '500 27px Satoshi', color: 'rgba(244,241,236,.55)' }, nb(it[1].split(' · ').slice(0, 2).join(' · ')));
    mk('div', 'a nw', c, { left: '34px', top: '150px', font: '600 86px/1.08 Clash', letterSpacing: '-.03em', color: '#f4f1ec' }, nb(it[3]));
    mk('div', 'a nw', c, { left: '36px', top: '262px', font: '700 32px Satoshi', color: '#3ecb7f', background: 'rgba(62,203,127,.14)', border: '2px solid rgba(62,203,127,.4)', borderRadius: '999px', padding: '6px 18px' }, nb(it[5]));
    return c;
  }
  const NROW = 24;
  for (let r = 0; r < NROW; r++) for (let col = 0; col < 3; col++) mini(MUR, LISTE[((r % 12) * 3 + col + 4) % LISTE.length], col * (MW + MG), r * (MH + MG));
  // flou directionnel du défilement : filtre SVG (le long de l'axe du mur), écart-type mis à jour à chaque image
  const SVGF = document.createElementNS(NS, 'svg'); SVGF.setAttribute('width', '0'); SVGF.setAttribute('height', '0'); SVGF.style.position = 'absolute';
  SVGF.innerHTML = '<filter id="vflou" x="-2%" y="-4%" width="104%" height="108%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0"/></filter>';
  ST.appendChild(SVGF); const VFG = SVGF.querySelector('feGaussianBlur');
  const BEST = obj(S7.cam, MW, MH, { transformStyle: 'flat' }); const BESTc = mini(BEST, LISTE[0], 0, 0, true);
  BESTc.style.boxShadow = '0 0 0 6px rgba(62,203,127,.25), 0 60px 120px -40px rgba(0,0,0,.95)';
  const [BTi, BSu, BPr, BBa] = [...BESTc.children];
  const BN = naissance(BESTc, '#3ecb7f'), BTTL = lettres(BTi), BPR = lettres(BPr), BB = reflet(BESTc);
  BESTc.insertAdjacentHTML('beforeend', `<svg width="${MW}" height="${MH}" style="position:absolute;left:-3px;top:-3px;overflow:visible;pointer-events:none"><rect x="1.5" y="1.5" width="${MW + 3}" height="${MH + 3}" rx="45" fill="none" stroke="#7dffb6" stroke-width="5" pathLength="1000" stroke-dasharray="0 1000"/></svg>`);
  const BLIS = BESTc.lastElementChild.querySelector('rect');
  const SCRIM = mk('div', 'lay', S7.root, { background: 'linear-gradient(180deg, rgba(11,10,9,.97) 0%, rgba(11,10,9,.96) 30%, rgba(11,10,9,.6) 37%, rgba(11,10,9,0) 45%)', pointerEvents: 'none' });
  const RIM7 = mk('div', 'a', S7.root, { boxSizing: 'border-box', border: '3px solid rgba(255,236,224,.45)', pointerEvents: 'none' });
  const tL0 = w(48) - 0.5, tScr = w(52) - 0.1, tStop = w(54) + 0.06, tPop = tStop + 0.08, tS7out = w(55) - 0.32;
  ph([[['Et', 48], ['pour', 49], ['les', 50]], [['trouver,', 51]]], { y: 236, size: 124, out: w(52) - 0.22 });
  ph([[['arrête', 52, 'k'], ['de', 53, 'k']], [['scroller.', 54, 'k']]], { y: 236, size: 150, out: tS7out + 0.1 });
  cue(tL0, 'whoosh', 0.8); cue(tL0 + 0.2, 'pop', 0.5); cue(tScr, 'riser', 1); cue(tStop - 0.02, 'tapestop', 1); cue(tStop, 'thud', 1.1); cue(tPop, 'pop', 0.9); cue(tPop + 0.32, 'key', 0.5); cue(tPop + 0.62, 'pop', 0.7);
  win(tL0 - 0.02, tL0 + 1.0); win(tScr, tStop + 0.06); win(tPop - 0.02, tPop + 0.35);
  const ROWH = MH + MG, MURY0 = 7 * ROWH, DERIVE = 70, COURSE = 3200;
  const TSC = tStop - tScr;
  function defile(t) {   // distance parcourue : dérive lente, accélération, arrêt net (petit rebond amorti)
    if (t < tScr) return DERIVE * Math.max(0, t - tL0);
    const base = DERIVE * (tScr - tL0);
    if (t < tStop) { const u = (t - tScr) / TSC; return base + DERIVE * (t - tScr) + COURSE * Math.pow(u, 2.4); }
    const u = t - tStop; return base + DERIVE * TSC + COURSE + 26 * Math.sin(Math.PI * clamp(u / 0.24, 0, 1)) * Math.exp(-u * 5);
  }
  const vitesse = (t) => (t < tScr || t >= tStop ? (t < tStop ? DERIVE : 0) : DERIVE + COURSE * 2.4 * Math.pow((t - tScr) / TSC, 1.4) / TSC);
  function paintS7(t) {
    if (!show(S7.root, t >= tL0 && t < tS7out + 0.62)) return;
    // l'écran : il apparaît (ressort), puis s'ouvre jusqu'au plein écran
    const pop = Math.min(1.02, SP(t, tL0, 'snappy')), o = E(t, tL0 + 0.16, 0.85, lisse);
    const Wc = lerp(400 * pop, 1100, o), Hc = lerp(700 * pop, 1960, o), yc = lerp(1000, 960, o), R = lerp(64, 0, o);
    const T = yc - Hc / 2, B = 1920 - (yc + Hc / 2), Lf = 540 - Wc / 2;
    S7.root.style.clipPath = o >= 0.999 ? '' : `inset(${T.toFixed(1)}px ${Lf.toFixed(1)}px ${B.toFixed(1)}px ${Lf.toFixed(1)}px round ${R.toFixed(1)}px)`;
    show(RIM7, o < 0.999); RIM7.style.left = Lf.toFixed(1) + 'px'; RIM7.style.top = T.toFixed(1) + 'px'; RIM7.style.width = Wc.toFixed(1) + 'px'; RIM7.style.height = Hc.toFixed(1) + 'px'; RIM7.style.borderRadius = R.toFixed(1) + 'px'; RIM7.style.opacity = (1 - o).toFixed(3);
    const sp = t > tScr && t < tStop ? Math.pow((t - tScr) / TSC, 1.2) : 0;
    camera(S7, { cx: 540, cy: 1000, cz: lerp(-260, 0, o) + 100 * sp, rx: 30 + 4 * sp, ry: -5 + 3 * Math.sin(t * 0.6), rz: -12 + 3 * sp + 2 * Math.sin(t * 0.4) });
    const dy = defile(t);
    put(MUR, 540, 1000 + 4500 - MURY0 - dy % (12 * ROWH), -200, {});
    // flou le long du défilement : la moitié du chemin parcouru pendant une image (comble les sous-images)
    const sig = Math.min(60, vitesse(t) / 30 * 0.5), foc = E(t, tStop + 0.05, 0.4);
    if (sig > 0.6) { VFG.setAttribute('stdDeviation', `0 ${sig.toFixed(1)}`); MUR.style.filter = 'url(#vflou)'; }
    else MUR.style.filter = foc > 0.01 ? `blur(${(2.5 * foc).toFixed(2)}px) brightness(${(1 - 0.45 * foc).toFixed(3)})` : '';
    // la meilleure annonce sort du mur vers la caméra et se construit
    const k = SP(t, tPop, 'default'), kk = Math.min(1, k);
    show(BEST, t >= tPop - 0.02);
    putFace(S7, BEST, 540, 1090, 240, k, [540, 1060, -190], { s: 1 + 0.25 * kk, rz: -3 * (1 - kk) + 1.2 * Math.sin(t * 1.2) });
    nait(BN, t, tPop - 0.04);
    BLIS.setAttribute('stroke-dasharray', `${(1000 * E(t, tPop + 0.12, 0.55, eOut3)).toFixed(1)} 1000`);
    BLIS.setAttribute('opacity', (1 - 0.7 * E(t, tPop + 0.7, 0.4)).toFixed(3));
    monte(BTTL, t, tPop + 0.16, 0.02); leve(BSu, t, tPop + 0.3, 14); valeur(BPR, t, tPop + 0.34);
    const bb = jaillit(BBa, t, tPop + 0.66, 0.4); BBa.style.boxShadow = bb > 0 ? `0 0 0 ${(8 * bump(t, tPop + 0.66, 0.2)).toFixed(1)}px rgba(62,203,127,.3)` : '';
    passe(BB, t, tPop + 0.9, 0.6);
    recul(S7, t, tS7out, 0.62);
  }

  // =====================================================================================================
  // S8 · « Ta recherche tourne toute seule. » : la recherche enregistrée naît au centre (vrais chiffres de l'app) ;
  //      des annonces tournent lentement DERRIÈRE elle (floues, jamais devant son texte) ; l'interrupteur « Alerte
  //      e-mail » s'allume sur « tourne », puis une lumière fait le tour de la carte.
  // =====================================================================================================
  const S8 = scene(1300);
  const RS = obj(S8.cam, 860, 560, { borderRadius: '64px', background: 'linear-gradient(170deg,#231912,#120d0a 70%)', border: '3px solid rgba(255,138,76,.45)', boxShadow: '0 70px 140px -50px rgba(0,0,0,.95)' });
  const RSN = naissance(RS);
  const RSt = lettres(mk('div', 'a nw', RS, { left: '64px', top: '46px', font: '600 96px/1.08 Clash', letterSpacing: '-.03em', color: '#f4f1ec' }, 'Renault Clio 4'));
  const ACT = mk('div', 'a nw', RS, { left: '64px', top: '176px', font: '700 40px Satoshi', color: '#3ecb7f', background: 'rgba(62,203,127,.14)', border: '2px solid rgba(62,203,127,.45)', borderRadius: '999px', padding: '8px 26px 8px 62px', transformOrigin: '20% 50%' }, 'Active');
  const ACTd = mk('div', 'a', ACT, { left: '28px', top: '23px', width: '22px', height: '22px', borderRadius: '50%', background: '#3ecb7f' });
  const RSsub = mk('div', 'a nw', RS, { left: '310px', top: '190px', font: '500 40px Satoshi', color: 'rgba(244,241,236,.6)' }, 'il y a 1 min · diesel');
  const RS1 = mk('div', 'a nw', RS, { left: '64px', top: '270px', font: '500 44px Satoshi', color: 'rgba(244,241,236,.88)' }, nb('220 annonces · 22 sous la cote'));
  const RS2 = mk('div', 'a nw', RS, { left: '64px', top: '334px', font: '500 40px Satoshi', color: '#3ecb7f' }, nb('meilleure : 7 650 € (23 % sous la cote)'));
  const OUV = mk('div', 'a nw', RS, { left: '64px', top: '424px', width: '190px', height: '92px', borderRadius: '999px', background: '#ff5a1f', color: '#160904', font: '600 40px/92px Clash', textAlign: 'center', boxShadow: '0 20px 60px -24px rgba(255,90,31,.85)' }, 'Ouvrir');
  const SW = mk('div', 'a', RS, { left: '276px', top: '424px', width: '470px', height: '92px', borderRadius: '999px', border: '3px solid rgba(244,241,236,.2)', background: 'rgba(244,241,236,.05)' });
  const SWR = mk('div', 'a', SW, { left: '22px', top: '20px', width: '92px', height: '50px', borderRadius: '999px', background: 'rgba(244,241,236,.18)' });
  const SWK = mk('div', 'a', SWR, { left: '5px', top: '5px', width: '40px', height: '40px', borderRadius: '50%', background: '#f4f1ec', boxShadow: '0 2px 6px rgba(0,0,0,.4)' });
  const SWL = lettres(mk('div', 'a nw', SW, { left: '134px', top: '18px', font: '600 44px/1.2 Clash', color: '#f4f1ec' }, 'Alerte e-mail'));
  const TOUR = mk('div', 'a', RS, { left: '-9px', top: '-9px', width: '878px', height: '578px', borderRadius: '72px', padding: '6px', boxSizing: 'border-box', WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none', opacity: 0 });
  const RSB = reflet(RS);
  const ORB = Array.from({ length: 10 }, (_, i) => { const o = obj(S8.cam, MW, MH, {}); mini(o, LISTE[(i * 4 + 1) % LISTE.length], 0, 0); return o; });
  const tS0 = w(55) - 0.3, tSw = w(57) - 0.05, tTour = WD[59].e - 0.1, tS8out = w(60) - 0.3;
  ph([[['Ta', 55], ['recherche', 56]], [['tourne', 57, 'k'], ['toute', 58, 'k']], [['seule.', 59, 'k']]], { y: 236, size: 112, out: tS8out + 0.1 });
  cue(tS0, 'whoosh', 0.6); cue(tS0 + 0.1, 'pop', 0.6); cue(tS0 + 0.42, 'pop', 0.5); cue(tSw, 'click', 1); cue(tSw + 0.06, 'ding', 0.6); cue(tSw + 0.5, 'pop', 0.6); cue(tTour, 'whoosh', 0.5);
  function paintS8(t) {
    if (!show(S8.root, t >= tS0 && t < tS8out + 0.62)) return;
    const a = SP(t, tS0 + 0.05, 'default'), sw = E(t, tSw, 0.3, eOut3);
    camera(S8, { cx: 540, cy: 1050, cz: lerp(-300, 0, E(t, tS0, 1.0, doux)), rx: -8 + 3 * Math.sin(t * 0.7), ry: 5 * Math.sin(t * 0.5) });
    put(RS, 540, 1050, 0, { ry: -6 + 4 * Math.sin(t * 0.9), rx: 5, s: 1 + 0.03 * bump(t, tSw, 0.12) });
    // l'anneau d'annonces tourne derrière la carte, lentement, flou (décor : aucun de ses textes ne doit se lire)
    const ang = (t - tS0) * 28 + 26 * (t > tSw ? (t - tSw) : 0);
    ORB.forEach((o, i) => {
      const th = ((i / ORB.length) * 360 + ang) * Math.PI / 180, R = 700;
      const x = 540 + R * Math.sin(th), z = 0.55 * R * Math.cos(th) - 560, y = 1050 + 380 * Math.cos(th);
      put(o, x, y, z, { ry: 22 * Math.sin(th), rx: -10, s: 0.8, o: Math.min(1, a * 1.2) * 0.7, f: 'blur(6px) brightness(.42)' });
    });
    nait(RSN, t, tS0 + 0.05);
    monte(RSt, t, tS0 + 0.22, 0.025);
    jaillit(ACT, t, tS0 + 0.42, 0.4); leve(RSsub, t, tS0 + 0.5, 16);
    leve(RS1, t, tS0 + 0.58, 18);
    leve(SW, t, tS0 + 0.62, 30, 0.35); monte(SWL, t, tS0 + 0.68, 0.015, 0.35);
    leve(RS2, t, tSw + 0.32, 18);
    jaillit(OUV, t, tSw + 0.5, 0.5);
    passe(RSB, t, tSw + 0.72, 0.7);
    SWK.style.transform = `translateX(${(42 * sw).toFixed(1)}px)`; SWR.style.background = sw > 0 ? `rgba(255,90,31,${(0.2 + 0.8 * sw).toFixed(3)})` : 'rgba(244,241,236,.18)';
    const pg = ((t - tS0) * 1.2) % 1;
    ACTd.style.boxShadow = `0 0 0 ${(14 * pg).toFixed(1)}px rgba(62,203,127,${(0.5 * (1 - pg)).toFixed(2)})`;
    const tu = Math.max(0, t - tTour);
    TOUR.style.opacity = E(t, tTour, 0.3).toFixed(3);
    TOUR.style.background = `conic-gradient(from ${((tu * 260 + tu * tu * 120) % 360).toFixed(1)}deg, transparent 0deg, transparent 230deg, rgba(255,138,76,.95) 330deg, #fff3e6 352deg, transparent 360deg)`;
    recul(S8, t, tS8out, 0.62);
  }

  // =====================================================================================================
  // S9 · « Toi, tu dors. » : la nuit tombe, horloge à volets 01:14. « Lui, il bosse. » : l'horloge monte, la liste
  //      des messages de la nuit se remplit, un message à la fois (le nouveau entre en haut, les autres descendent
  //      d'une ligne : aucun ne passe sur un autre), chacun « Envoyé » (option Messages, Benef Pro) ; l'horloge
  //      tombe sur l'heure de chaque message.
  // =====================================================================================================
  const S9 = scene(1200);
  const FLIP = obj(S9.cam, 1000, 380, { transformStyle: 'preserve-3d' });
  const moitie = (parent, bas, chiffre) => {
    const h = mk('div', 'a', parent, { left: '0', top: bas ? '145px' : '0', width: '185px', height: '145px', overflow: 'hidden', borderRadius: bas ? '0 0 30px 30px' : '30px 30px 0 0', background: bas ? 'linear-gradient(180deg,#0c1020,#121730)' : 'linear-gradient(180deg,#1c2340,#141a30)', transformOrigin: bas ? '50% 0' : '50% 100%', backfaceVisibility: 'hidden' });
    const n = mk('div', 'a nw num', h, { left: '0', top: (bas ? -145 + 18 : 18) + 'px', width: '185px', textAlign: 'center', font: '600 236px/1 Clash', letterSpacing: '-.04em', color: '#e4e9ff' }, chiffre);
    return { h, n };
  };
  const DIG = [0, 1, 2, 3].map((i) => {
    const d = mk('div', 'a', FLIP, { left: (i < 2 ? 70 + i * 200 : 530 + (i - 2) * 200) + 'px', top: '20px', width: '185px', height: '290px', borderRadius: '30px', border: '3px solid rgba(169,184,255,.25)', boxShadow: '0 30px 60px -20px rgba(0,0,0,.8)', transformStyle: 'preserve-3d' });
    const D = { d, haut: moitie(d, false, '0'), bas: moitie(d, true, '0'), vH: moitie(d, false, '0'), vB: moitie(d, true, '0') };
    mk('div', 'a', d, { left: '0', top: '143px', width: '185px', height: '4px', background: 'rgba(5,7,16,.9)' });
    return D;
  });
  const COLON = mk('div', 'a nw', FLIP, { left: '458px', top: '24px', font: '600 220px/1 Clash', color: '#a9b8ff' }, ':');
  const ZZ = [0, 1, 2].map((i) => mk('div', 'a nw', S9.cam, { font: `600 ${90 + i * 36}px Clash`, color: '#a9b8ff' }, 'z'));
  const ENV = [['Clio IV 1.5 dCi 90 Trend', '4 750 €', '01:14'], ['Clio IV 1.5 dCi 75 Intens', '5 750 €', '01:16'], ['Clio IV 1.5 dCi 75 Business', '6 000 €', '02:41'], ['Clio IV 1.5 dCi 75 Business', '6 450 €', '03:12'], ['Clio IV 1.5 dCi 90 Zen', '6 650 €', '04:37']];
  const MSG = ENV.map(([m, p, h]) => {
    const c = obj(S9.cam, 820, 116, { borderRadius: '42px', background: 'linear-gradient(180deg,#172040,#0f1428)', border: '3px solid rgba(169,184,255,.2)', boxShadow: '0 30px 60px -26px rgba(0,0,0,.9)' });
    const T = mk('div', 'a nw', c, { left: '40px', top: '14px', font: '700 40px Satoshi', color: '#f4f1ec' }, 'Renault ' + m);
    const D = mk('div', 'a nw', c, { left: '40px', top: '64px', font: '500 30px Satoshi', color: 'rgba(223,229,255,.62)' }, nb(`${p} · 14 oct., ${h}`));
    const S = mk('div', 'a nw', c, { right: '30px', left: 'auto', top: '31px', font: '700 34px Satoshi', color: '#3ecb7f', background: 'rgba(62,203,127,.15)', borderRadius: '999px', padding: '6px 58px 6px 22px', transformOrigin: '80% 50%' }, 'Envoyé');
    S.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" width="30" height="30" style="position:absolute;right:18px;top:10px"><path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke="#3ecb7f" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0 24"/></svg>');
    // le modèle ne doit jamais passer sous la pastille « Envoyé »
    { const wS = S.getBoundingClientRect().width, wT = T.getBoundingClientRect().width, mx = 820 - 40 - 30 - wS - 24; if (wT > mx) T.style.fontSize = (40 * mx / wT).toFixed(1) + 'px'; }
    return { c, N: naissance(c, '#a9b8ff'), T, D, S, K: S.querySelector('path') };
  });
  const PRO = obj(S9.cam, 600, 84, { borderRadius: '999px', background: 'rgba(11,10,9,.85)', border: '3px solid rgba(255,90,31,.85)', font: '700 38px/78px Satoshi', color: '#f4f1ec', textAlign: 'center' }, 'Benef Pro · option Messages');
  const tN = w(60) - 0.28, tLui = w(63) - 0.12, tS9out = w(66) - 0.32;
  const tMsg = (i) => tLui + 0.34 + i * 0.27;
  const HEURES = [[-1, '0000'], [tN + 0.62, '0114'], ...ENV.slice(1).map((e, i) => [tMsg(i + 1) - 0.04, e[2].replace(':', '')])];
  const Y9 = 1004, PAS9 = 128;
  ph([[['Toi,', 60]], [['tu', 61], ['dors.', 62, 'b']]], { y: 236, size: 150, out: tLui - 0.2 });
  ph([[['Lui,', 63], ['il', 64], ['bosse.', 65, 'k']]], { y: 236, size: 136, out: tS9out + 0.1 });
  cue(tN, 'nuit', 0.9); [0, 1, 2, 3].forEach((i) => cue(tN + 0.62 + i * 0.05, 'tick', 0.35)); MSG.forEach((m, i) => { cue(tMsg(i), 'sent', 0.55); cue(tMsg(i) + 0.3, 'tick', 0.3); }); cue(tLui, 'whoosh', 0.6);
  function volets(D, i, t) {
    let k = 0; while (k + 1 < HEURES.length && t >= HEURES[k + 1][0] + i * 0.05) k++;
    const neuf = HEURES[k][1][i], ancien = k ? HEURES[k - 1][1][i] : neuf, t0 = HEURES[k][0] + i * 0.05;
    const f = neuf === ancien ? 1 : clamp((t - t0) / 0.34, 0, 1);
    D.haut.n.textContent = neuf; D.vB.n.textContent = neuf; D.vH.n.textContent = ancien; D.bas.n.textContent = f >= 1 ? neuf : ancien;
    const a1 = eIn2(clamp(f / 0.5, 0, 1)), a2 = eOut3(clamp((f - 0.5) / 0.5, 0, 1));
    show(D.vH.h, f < 0.5); show(D.vB.h, f >= 0.5 && f < 1);
    D.vH.h.style.transform = `rotateX(${(-90 * a1).toFixed(2)}deg)`; D.vB.h.style.transform = `rotateX(${(90 * (1 - a2)).toFixed(2)}deg)`;
    D.vH.n.style.filter = `brightness(${(1 - 0.5 * a1).toFixed(3)})`; D.vB.n.style.filter = `brightness(${(0.6 + 0.4 * a2).toFixed(3)})`;
  }
  function paintS9(t) {
    if (!show(S9.root, t >= tN && t < tS9out + 0.62)) return;
    const a = SP(t, tN + 0.22, 'heavy'), up = E(t, tLui, 0.5, doux);   // l'horloge attend que la recherche soit floue
    camera(S9, { cx: 540, cy: 960, cz: lerp(-260, 0, Math.min(1, a)), rx: lerp(-14, -2, Math.min(1, a)) + 2 * Math.sin(t * 0.7), ry: lerp(-18, 0, Math.min(1, a)) + 3 * Math.sin(t * 0.5) });
    DIG.forEach((D, i) => volets(D, i, t));
    COLON.style.opacity = t < tMsg(0) && Math.floor((t - tN) / 0.5) % 2 ? '0.2' : '1';
    put(FLIP, 540, lerp(1000, 690, up), -700 * (1 - Math.min(1, a)), { rx: -10 + 3 * Math.sin(t * 0.8) * (1 - up), ry: 8 * Math.sin(t * 0.4) * (1 - up), s: lerp(0.9, 0.74, up), o: Math.min(1, a * 2.5) });
    ZZ.forEach((z, i) => { const t0 = tN + 0.3 + i * 0.22, u = (t - t0) / 1.2; const vis = u > 0 && t < tLui; show(z, vis); if (!vis) return; put(z, 640 + 64 * i + 22 * Math.sin(u * 5), 820 - 180 * u - 40 * i, 40 + 40 * i, { rz: -14 + 12 * Math.sin(u * 4), o: Math.min(1, u * 4) * (1 - E(t, tLui - 0.15, 0.15)) }); });
    // la liste : chaque nouveau message pousse les autres d'une ligne (ils descendent avant qu'il naisse)
    MSG.forEach((M, i) => {
      const t0 = tMsg(i); let slot = 0; for (let j = i + 1; j < MSG.length; j++) slot += Math.min(1, SP(t, tMsg(j) - 0.24, 'default'));
      const on = t >= t0 - 0.01 && slot < 3.95; show(M.c, on); if (!on) return;
      put(M.c, 540, Y9 + PAS9 * slot, 0, { o: 1 - E(slot, 3.15, 0.6, lin) });
      nait(M.N, t, t0); leve(M.T, t, t0 + 0.12, 14, 0.32); leve(M.D, t, t0 + 0.18, 12, 0.32);
      jaillit(M.S, t, t0 + 0.22, 0.4); trace(M.K, 24, t, t0 + 0.3, 0.22);
    });
    const pp = SP(t, tLui + 0.1, 'snappy'); show(PRO, t >= tLui + 0.1); put(PRO, 540, Y9 - 98, 0, { s: 0.6 + 0.4 * Math.min(1, pp), o: Math.min(1, pp * 2) });
    recul(S9, t, tS9out, 0.62);
  }

  // =====================================================================================================
  // S10 · « Une annonce passe sous la cote ? Tu reçois un mail. » : l'aube ; l'annonce sous la cote naît, son écart
  //       jaillit sur « sous » ; la notification tombe sur sa charnière ; l'e-mail d'alerte s'ouvre, grand, et se
  //       construit dans l'ordre de lecture pendant que l'annonce recule.
  // =====================================================================================================
  const S10 = scene(1200);
  const ANN = obj(S10.cam, MW, MH, {}); const ANc = mini(ANN, LISTE[0], 0, 0, true);
  const [ANt, ANs, ANp, ANb] = [...ANc.children], ANN_ = { N: naissance(ANc, '#3ecb7f'), T: lettres(ANt), P: lettres(ANp), B: reflet(ANc) };
  const NOTIF = obj(S10.cam, 960, 200, { borderRadius: '58px', background: 'rgba(42,34,30,.97)', boxShadow: '0 40px 90px -30px rgba(0,0,0,.85)', overflow: 'hidden', transformOrigin: '50% 0%' });
  const ico10 = mk('div', 'a', NOTIF, { left: '40px', top: '40px', width: '120px', height: '120px', borderRadius: '30px', overflow: 'hidden', background: '#1a1411' });
  ico10.innerHTML = LOGO; { const s = ico10.querySelector('svg'); s.style.height = '120px'; s.style.width = 'auto'; s.style.position = 'absolute'; s.style.left = '0'; s.style.top = '0'; }
  const NO1 = mk('div', 'a nw', NOTIF, { left: '196px', top: '40px', font: '700 40px Satoshi', color: '#f4f1ec' }, 'utopicar <span style="font-weight:500;color:rgba(244,241,236,.6);font-size:32px">· maintenant</span>');
  const NO2 = mk('div', 'a nw', NOTIF, { left: '196px', top: '104px', font: '500 36px Satoshi', color: 'rgba(244,241,236,.88)' }, nb('Clio IV · 7 650 € · <b style="color:#3ecb7f">2 300 € sous la cote</b>'));
  const MAIL = obj(S10.cam, 960, 820, { borderRadius: '44px', background: '#fff', overflow: 'hidden', boxShadow: '0 60px 120px -40px rgba(0,0,0,.8)', transformOrigin: '50% 0%' });
  MAIL.innerHTML = `<div style="padding:56px 56px 30px;font:38px Arial,sans-serif;color:#1d1d1f">
    <div class="m1" style="font-size:52px;font-weight:bold;margin-bottom:8px">1 nouvelle annonce</div><div class="m2" style="color:#555;margin-bottom:36px">Recherche « Renault Clio 4 »</div>
    <div style="display:flex;gap:32px;border-bottom:2px solid #e5e5e5;padding-bottom:36px"><img class="mi" src="../assets/presente-v/clio4-mail.jpg" style="width:300px;height:226px;object-fit:cover;border-radius:18px;flex:none">
    <div style="line-height:1.45"><div class="mt" style="color:#15307f;font-weight:bold">Renault Clio IV 1.5 dCi 75 Zen</div><div class="mp" style="font-size:50px;font-weight:bold;margin:4px 0;line-height:1.2">${nb('7 650 €')}</div><div class="md" style="color:#555">${nb('2018 · 88 500 km · Diesel')}</div><div class="ms" style="display:inline-block;color:#0a7a43;font-weight:bold;padding:0 8px;margin-left:-8px;border-radius:8px;background:linear-gradient(rgba(10,122,67,.16),rgba(10,122,67,.16)) no-repeat 0 0/0% 100%">${nb('2 300 € sous la cote')}</div><div class="mc" style="color:#777;font-size:30px">${nb('cote 9 950 € sur 220 annonces')}</div></div></div>
    <div class="mb" style="margin-top:40px;display:inline-block"><span style="display:inline-block;background:#ff5a1f;color:#fff;padding:24px 40px;border-radius:18px;font-weight:bold">Voir mes alertes sur utopicar</span></div></div>`;
  await new Promise((r) => { const im = MAIL.querySelector('img'); if (im.complete) r(); else { im.onload = r; im.onerror = r; } });
  const Q = (c) => MAIL.querySelector(c);
  const ML = { m1: lettres(Q('.m1')), m2: Q('.m2'), mi: Q('.mi'), mt: Q('.mt'), mp: lettres(Q('.mp')), md: Q('.md'), ms: Q('.ms'), mc: Q('.mc'), mb: Q('.mb'), B: reflet(MAIL) };
  Q('.mb').style.transformOrigin = '30% 50%';
  const tA0 = w(66) - 0.3, tSous = w(69) - 0.06, tNotif = w(71) - 0.12, tMail = w(73) - 0.14, tS10out = w(76) - 0.34;
  ph([[['Une', 66], ['annonce', 67]], [['passe', 68], ['sous', 69, 'g']], [['la', 70, 'g'], ['cote ?', 71, 'g']]], { y: 236, size: 112, out: w(72) - 0.22 });
  ph([[['Tu', 72], ['reçois', 73]], [['un', 74], ['mail.', 75, 'k']]], { y: 236, size: 124, out: tS10out + 0.1 });
  cue(tA0, 'whoosh', 0.6); cue(tA0 + 0.36, 'key', 0.5); cue(tSous, 'pop', 0.9); cue(tNotif, 'notif', 1.1); cue(tMail, 'whoosh', 0.8); cue(tMail + 0.22, 'key', 0.4); cue(tMail + 0.66, 'key', 0.5); cue(tMail + 1.0, 'tick', 0.5); cue(tMail + 1.2, 'pop', 0.7);
  win(tNotif - 0.02, tNotif + 0.3); win(tMail - 0.02, tMail + 0.4);
  function paintS10(t) {
    if (!show(S10.root, t >= tA0 && t < tS10out + 0.62)) return;
    const a = SP(t, tA0 + 0.04, 'default'), n = SP(t, tNotif, 'default'), m = SP(t, tMail, 'default');
    const dM = E(t, tMail + 0.4, 0.5, doux) * (1 - E(t, tMail + 1.15, 0.55, doux));
    camera(S10, { cx: 540 + 16 * dM, cy: 960 - 40 * dM, cz: lerp(-260, 0, E(t, tA0, 0.9, doux)) + 110 * dM, rx: 4 + 2 * Math.sin(t * 0.6), ry: -4 + 3 * Math.sin(t * 0.45) });
    const am = E(t, tMail, 0.5, doux);
    put(ANN, 540, 1150 + 60 * am, -560 * am, { rx: -4, ry: 8, s: 1.35 * (1 + 0.05 * bump(t, tSous, 0.14)) });
    ANN.style.filter = am > 0.01 ? `blur(${(9 * am).toFixed(1)}px) brightness(${(1 - 0.5 * am).toFixed(3)})` : '';
    ANN.style.opacity = (1 - E(am, 0.5, 0.5, lin)).toFixed(3);
    nait(ANN_.N, t, tA0 + 0.06); monte(ANN_.T, t, tA0 + 0.24, 0.02); leve(ANs, t, tA0 + 0.34, 14); valeur(ANN_.P, t, tA0 + 0.38);
    const bb = jaillit(ANb, t, tSous, 0.4); ANb.style.boxShadow = bb > 0 ? `0 0 0 ${(8 * bump(t, tSous, 0.22)).toFixed(1)}px rgba(62,203,127,.3)` : ''; passe(ANN_.B, t, tSous + 0.2, 0.6);
    // la notification : tombe sur sa charnière, puis remonte et s'efface quand l'e-mail s'ouvre
    const nOut = E(t, tMail - 0.2, 0.2, eIn2);   // la notification est partie avant que l'e-mail s'ouvre
    show(NOTIF, t >= tNotif - 0.02 && nOut < 0.999);
    put(NOTIF, 540, 712 - 40 * nOut, 40, { rx: -95 * (1 - Math.min(1.04, n)) + 40 * nOut, s: 0.88, o: 1 - nOut });
    const ic = jaillit(ico10, t, tNotif + 0.12, 0.3); ico10.style.transform += ` rotate(${(-140 * (1 - Math.min(1, ic))).toFixed(1)}deg)`;
    leve(NO1, t, tNotif + 0.18, 16, 0.32); leve(NO2, t, tNotif + 0.26, 16, 0.32);
    show(MAIL, t >= tMail - 0.02);
    put(MAIL, 540, 1030, 0, { rx: -90 * (1 - Math.min(1.03, m)), ry: 3 * Math.sin(t * 0.8) * Math.min(1, m), s: 0.95 });
    const tm = tMail;
    monte(ML.m1, t, tm + 0.22, 0.02); leve(ML.m2, t, tm + 0.4, 14);
    ML.mi.style.clipPath = `inset(0 ${(100 * (1 - E(t, tm + 0.48, 0.42, eOut3))).toFixed(2)}% 0 0 round 18px)`;
    leve(ML.mt, t, tm + 0.6, 14); valeur(ML.mp, t, tm + 0.68); leve(ML.md, t, tm + 0.86, 14);
    leve(ML.ms, t, tm + 0.96, 14); ML.ms.style.backgroundSize = `${(100 * E(t, tm + 1.04, 0.45, eOut3)).toFixed(1)}% 100%`;
    leve(ML.mc, t, tm + 1.06, 14); jaillit(ML.mb, t, tm + 1.22, 0.5); passe(ML.B, t, tm + 1.5, 0.7);
    recul(S10, t, tS10out, 0.62);
  }

  // =====================================================================================================
  // S11 · « Et chaque voiture, de l'achat à la vente : » : les étapes du parc de l'app en colonne, reliées par une
  //       route (Repérées, Achetées, En préparation, En vente, Vendues) ; elles naissent ensemble, éteintes, puis
  //       chacune s'allume sur son mot pendant que la route se remplit jusqu'à elle (tout reste dans le cadre).
  //       « ta vraie marge. » : la colonne recule, la marge du mois et la marge par voiture se construisent.
  // =====================================================================================================
  const S11 = scene(1100);
  const ETP = [['Repérées', '#9e968c', 1], ['Achetées', '#ff8a4c', 1], ['En préparation', '#ffc53d', 1], ['En vente', '#ff5a1f', 1], ['Vendues', '#3ecb7f', 2]];
  const PW = 740, PH = 800, RP = 160;
  const PIPE = obj(S11.cam, PW, PH, {});
  const ROUTE = mk('div', 'a', PIPE, { left: '61px', top: '85px', width: '14px', height: (4 * RP) + 'px', borderRadius: '7px', background: 'rgba(244,241,236,.1)', transformOrigin: '50% 0' });
  const RFILL = mk('div', 'a', PIPE, { left: '61px', top: '85px', width: '14px', height: '0px', borderRadius: '7px', background: 'linear-gradient(180deg,#9e968c,#ff8a4c 30%,#ffc53d 55%,#ff5a1f 78%,#3ecb7f)', backgroundSize: `14px ${4 * RP}px` });
  const TETE = mk('div', 'a', PIPE, { left: '48px', top: '72px', width: '40px', height: '40px', borderRadius: '50%', background: '#fff6ec', boxShadow: '0 0 0 8px rgba(255,138,76,.35)' });
  const ROWS = ETP.map(([lab, col, n], i) => {
    const r = mk('div', 'a', PIPE, { left: '0', top: (20 + i * RP) + 'px', width: PW + 'px', height: '130px' });
    const D = mk('div', 'a', r, { left: '44px', top: '41px', width: '48px', height: '48px', borderRadius: '50%', boxSizing: 'border-box', border: `5px solid ${col}`, background: '#120d0a' });
    const L = mk('div', 'a nw', r, { left: '130px', top: '18px', font: '600 70px/1.1 Clash', letterSpacing: '-.03em', color: '#f4f1ec' }, lab);
    const K = mk('div', 'a nw', r, { right: '10px', left: 'auto', top: '20px', height: '90px', minWidth: '90px', borderRadius: '45px', boxSizing: 'border-box', padding: '0 22px', background: 'rgba(244,241,236,.08)', font: '600 60px/90px Clash', textAlign: 'center', color: 'rgba(244,241,236,.35)', transformOrigin: '50% 50%' }, String(n));
    // le libellé ne touche jamais la pastille du compteur
    { const wl = L.getBoundingClientRect().width, kw = K.getBoundingClientRect().width, mx = PW - 10 - kw - 28 - 130; if (wl > mx) L.style.fontSize = (70 * mx / wl).toFixed(1) + 'px'; }
    return { r, D, LL: lettres(L), K, col };
  });
  // la marge du mois (carte « chaude » de l'app) puis la marge par voiture, décomposées
  const KPI = obj(S11.cam, 880, 500, { borderRadius: '62px', background: 'linear-gradient(160deg, rgba(255,90,31,.18), rgba(255,90,31,0) 55%), linear-gradient(180deg,#1d150f,#140f0b)', border: '3px solid rgba(255,90,31,.35)', boxShadow: '0 60px 120px -50px rgba(0,0,0,.95)' });
  const KPIi = mk('div', 'a', KPI, { left: '56px', top: '56px', width: '104px', height: '104px', borderRadius: '30px', background: '#ff5a1f' });
  KPIi.innerHTML = '<svg viewBox="0 0 24 24" width="104" height="104"><path class="c" d="M5 16l5-5 3 3 6-6" fill="none" stroke="#160904" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" pathLength="30" stroke-dasharray="0 30"/><path class="f" d="M15 8h4v4" fill="none" stroke="#160904" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" pathLength="10" stroke-dasharray="0 10"/></svg>';
  const KPIc = KPIi.querySelector('.c'), KPIf = KPIi.querySelector('.f');
  const KPIl = lettres(mk('div', 'a nw', KPI, { left: '192px', top: '80px', font: '500 42px/1.25 Satoshi', color: 'rgba(244,241,236,.85)' }, 'Marge réalisée ce mois'));
  const KPIv = mk('div', 'a nw', KPI, { left: '52px', top: '196px', font: '600 190px/1.08 Clash', letterSpacing: '-.04em', color: '#f4f1ec' }, nb('1 550 €'));
  const KPIvl = lettres(KPIv);
  const KPIb = mk('div', 'a nw', KPI, { left: '56px', top: '410px', font: '700 36px Satoshi', color: '#3ecb7f', background: 'rgba(62,203,127,.14)', borderRadius: '999px', padding: '10px 26px', transformOrigin: '20% 50%' }, nb('▲ +1 550 € par rapport à septembre'));
  const KN = naissance(KPI), KB = reflet(KPI);
  const MPV = obj(S11.cam, 880, 330, { borderRadius: '62px', background: 'linear-gradient(180deg,#1b140f,#140f0b)', border: '3px solid rgba(244,241,236,.12)', boxShadow: '0 60px 120px -50px rgba(0,0,0,.95)' });
  const MPVt = lettres(mk('div', 'a nw', MPV, { left: '56px', top: '38px', font: '600 50px/1.15 Clash', letterSpacing: '-.02em', color: '#f4f1ec' }, 'Marge par voiture'));
  const BARS = [['Polo V 1.2 TSI 90', 880, 92.59, '#3ecb7f'], ['Clio IV 1.5 dCi 90', 670, 70.5, '#ffc53d']].map(([lab, v, pc, col], i) => {
    const y = 128 + i * 76;
    const L = mk('div', 'a nw', MPV, { left: '56px', top: y + 'px', font: '500 34px Satoshi', color: 'rgba(244,241,236,.8)' }, lab);
    const P = mk('div', 'a', MPV, { left: '372px', top: (y + 8) + 'px', width: '300px', height: '28px', borderRadius: '14px', background: 'rgba(244,241,236,.08)', overflow: 'hidden', transformOrigin: '0 50%' });
    const F = mk('i', 'a', P, { left: '0', top: '0', bottom: '0', width: '0%', borderRadius: '14px', background: col });
    const S = mk('div', 'a', P, { left: '78.9%', top: '0', width: '6px', height: '28px', background: '#ff5a1f', transformOrigin: '50% 0' });
    const N = mk('div', 'a nw', MPV, { right: '56px', left: 'auto', top: (y - 6) + 'px', font: '600 48px/1.08 Clash', color: '#f4f1ec' }, nb(eur(v)));
    return { L, P, F, S, NL: lettres(N), pc };
  });
  const MPVs = mk('div', 'a nw', MPV, { left: '56px', top: '270px', font: '500 30px Satoshi', color: 'rgba(244,241,236,.6)' }, '<span style="display:inline-block;width:6px;height:26px;background:#ff5a1f;vertical-align:-5px;margin-right:12px"></span>' + nb('seuil de marge 750 €'));
  const MN = naissance(MPV), MB = reflet(MPV);
  const tP0 = w(76) - 0.3, tMg = w(85) - 0.1, tLg = w(88) - 0.55;
  const TPAN = [w(78) - 0.05, w(81) - 0.05, w(82) + 0.02, w(84) - 0.04, w(84) + 0.26];
  ph([[['Et', 76], ['chaque', 77], ['voiture,', 78]], [['de', 79], ["l'achat", 80, 'k']], [['à', 82], ['la', 83], ['vente :', 84, 'k']]], { y: 236, size: 104, out: tMg - 0.2 });
  ph([[['ta', 85], ['vraie', 86, 'g']], [['marge.', 87, 'g']]], { y: 236, size: 150, out: tLg - 0.05 });
  cue(tP0, 'whoosh', 0.6); ETP.forEach((e, i) => { cue(tP0 + 0.3 + i * 0.09, 'pop', 0.25); cue(TPAN[i], i === 4 ? 'ding' : 'tick', 0.6); }); cue(tMg, 'whoosh', 0.7); cue(tMg + 0.22, 'pop', 0.6); cue(tMg + 0.4, 'key', 0.6); cue(tMg + 0.95, 'ding', 0.8); cue(tMg + 0.7, 'pop', 0.5); cue(tMg + 1.12, 'key', 0.5);
  function paintS11(t) {
    if (!show(S11.root, t >= tP0 && t < tLg + 0.4)) return;
    const a = E(t, tP0, 0.8, doux), mg = E(t, tMg - 0.05, 0.55, doux);
    camera(S11, { cx: 540 + 10 * Math.sin(t * 0.6), cy: lerp(950, 990, E(t, tP0, 3.2, lisse)), cz: lerp(-240, 0, a), rx: 8 + 2 * Math.sin(t * 0.7), ry: -6 + 3 * Math.sin(t * 0.5) });
    // la colonne des étapes, face caméra, légèrement inclinée ; elle recule quand la marge arrive
    put(PIPE, 530, 996 - 40 * mg, -600 * mg, { rx: 10, ry: -6 });
    PIPE.style.filter = mg > 0.01 ? `blur(${(10 * mg).toFixed(1)}px) brightness(${(1 - 0.55 * mg).toFixed(3)})` : '';
    PIPE.style.opacity = (Math.min(1, E(t, tP0, 0.3) * 1.5) * (1 - E(mg, 0.5, 0.5, lin))).toFixed(3);
    ROUTE.style.transform = `scaleY(${E(t, tP0 + 0.05, 0.7, eOut3).toFixed(3)})`;
    // la route se remplit jusqu'à l'étape allumée (ressort à chaque mot), une tête claire la mène
    let lvl = 0; TPAN.forEach((t0, i) => { if (i) lvl += SP(t, t0 - 0.06, 'default'); });
    const lit0 = t >= TPAN[0] - 0.06;
    RFILL.style.height = (lit0 ? RP * lvl : 0).toFixed(1) + 'px';
    show(TETE, lit0); TETE.style.transform = `translateY(${(RP * lvl).toFixed(1)}px) scale(${(0.6 + 0.4 * SP(t, TPAN[0] - 0.06, 'snappy')).toFixed(3)})`;
    ROWS.forEach((R, i) => {
      const t0 = tP0 + 0.3 + i * 0.09, lit = t >= TPAN[i];
      leve(R.r, t, t0, 18, 0.5); monte(R.LL, t, t0 + 0.06, 0.02, 0.45);
      const on = lit ? E(t, TPAN[i], 0.18) : 0;
      R.LL.forEach((s) => { s.style.color = rgb(mix([110, 104, 98], [244, 241, 236], on)); });
      R.D.style.background = on > 0 ? rgb(mix([18, 13, 10], hx(R.col), on)) : '#120d0a';
      R.D.style.transform = `scale(${(1 + 0.35 * bump(t, TPAN[i], 0.16)).toFixed(3)})`;
      R.K.style.background = on > 0 ? `rgba(${hx(R.col).join(',')},${(0.08 + 0.2 * on).toFixed(3)})` : 'rgba(244,241,236,.08)';
      R.K.style.color = on > 0 ? rgb(mix([110, 104, 98], hx(R.col), on)) : 'rgba(244,241,236,.35)';
      R.K.style.transform = `scale(${(1 + 0.18 * bump(t, TPAN[i] + 0.02, 0.16)).toFixed(3)})`;
    });
    // marge du mois : naît sous la phrase et se construit ; puis la marge par voiture
    show(KPI, t >= tMg - 0.05);
    const km = SP(t, tMg, 'default'), kk = Math.min(1, km);
    put(KPI, 540, lerp(880, 846, kk), 0, { rx: lerp(10, 0, kk) });
    nait(KN, t, tMg);
    jaillit(KPIi, t, tMg + 0.22, 0.3); trace(KPIc, 30, t, tMg + 0.32, 0.4); trace(KPIf, 10, t, tMg + 0.6, 0.2);
    monte(KPIl, t, tMg + 0.26, 0.016);
    valeur(KPIvl, t, tMg + 0.4); KPIv.style.color = rgb(mix(hx('#f4f1ec'), hx('#3ecb7f'), E(t, tMg + 0.95, 0.3)));
    jaillit(KPIb, t, tMg + 0.95, 0.5); passe(KB, t, tMg + 1.2, 0.6);
    show(MPV, t >= tMg + 0.46);
    const kp = SP(t, tMg + 0.5, 'default');
    put(MPV, 540, lerp(1330, 1278, Math.min(1, kp)), 0, {});
    nait(MN, t, tMg + 0.5); monte(MPVt, t, tMg + 0.7, 0.02);
    BARS.forEach((B, i) => {
      const t0 = tMg + 0.84 + i * 0.12;
      leve(B.L, t, t0 - 0.06, 12); B.P.style.transform = `scaleX(${E(t, t0 - 0.04, 0.3, eOut3).toFixed(3)})`;
      remplit(B.F, t, t0 + 0.12, B.pc, 0.7); valeur(B.NL, t, t0 + 0.12, 0.04);
      B.S.style.transform = `scaleY(${E(t, t0 + 0.5, 0.25, eOut).toFixed(3)})`;
    });
    leve(MPVs, t, tMg + 1.3, 12); passe(MB, t, tMg + 1.45, 0.6);
    recul(S11, t, tLg - 0.28, 0.6);   // floue avant que la tuile du logo n'arrive
  }

  // =====================================================================================================
  // FIN · « Utopicar. Achète juste, revends mieux. » : l'icône officielle s'anime elle-même : la tuile se pose, la
  //       silhouette de la voiture se dessine d'un trait (du capot au toit, puis la ligne de caisse), la flèche orange
  //       part vers le haut, l'aileron se pose ; l'icône glisse à gauche et « utopicar » s'écrit à sa droite, lettre
  //       par lettre avec la voix ; la signature ; « lien en bio » ; la boucle repart sur la 208 dans un cercle.
  // =====================================================================================================
  const GL = mk('div', 'lay', ST, { zIndex: 13 });
  const YL = 700;                                    // centre du logo en (540, YL) ; 1 unité du SVG = U px (fixé plus bas)
  const holder = mk('div', 'a', GL, { width: '1061px' }); holder.innerHTML = LOGO;
  const svg = holder.querySelector('svg'); svg.style.width = '1061px'; svg.style.height = 'auto'; svg.style.display = 'block'; svg.style.overflow = 'visible';
  const [iconG, wordG] = svg.querySelectorAll(':scope > g');
  const tile = iconG.querySelector('rect'), carG = iconG.querySelector('g');
  const [pCar, pArr, pFin] = carG.querySelectorAll('path');
  const defs = document.createElementNS(NS, 'defs'); svg.insertBefore(defs, svg.firstChild);
  defs.innerHTML = `<mask id="mcar" maskUnits="userSpaceOnUse" x="0" y="0" width="2400" height="2400"><path class="mk" d="M292 1102 C380 1020 500 975 628 970 C760 880 880 828 1030 828 C1160 828 1280 868 1393 912 L1277 972 C1100 1000 880 1015 700 1017 C560 1019 450 1040 388 1102 Z" fill="none" stroke="#fff" stroke-width="118" stroke-linecap="round" stroke-linejoin="round"/></mask>
    <clipPath id="cword" clipPathUnits="userSpaceOnUse"><rect x="-300" y="-900" width="5200" height="1185"/></clipPath>`;
  pCar.setAttribute('mask', 'url(#mcar)');
  const MKP = defs.querySelector('.mk'); const MKL = MKP.getTotalLength() || 3200;
  // la tête du trait : un point clair qui court sur la silhouette pendant qu'elle se dessine
  const PEN = document.createElementNS(NS, 'g'); carG.appendChild(PEN);
  PEN.innerHTML = '<circle r="70" fill="rgba(255,138,76,.35)"/><circle r="30" fill="#fff6ec"/>';
  wordG.setAttribute('clip-path', 'url(#cword)');
  // le mot : une forme par lettre (sous-chemins regroupés par position)
  const wp = wordG.querySelector('path'), wfill = wp.getAttribute('fill');
  const subs = wp.getAttribute('d').split(/(?=M)/).filter(Boolean); wp.remove();
  const tmp = subs.map((d) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', wfill); wordG.appendChild(p); const b = p.getBBox(); return { p, x0: b.x, x1: b.x + b.width }; });
  tmp.sort((a, b) => a.x0 - b.x0); const letters = [];
  for (const s of tmp) { const L = letters[letters.length - 1]; if (L && s.x0 < L.x1 - 5) { L.ps.push(s.p); L.x1 = Math.max(L.x1, s.x1); } else letters.push({ ps: [s.p], x0: s.x0, x1: s.x1 }); }
  for (const L of letters) { const lg = document.createElementNS(NS, 'g'), one = document.createElementNS(NS, 'path'); one.setAttribute('d', L.ps.map((p) => p.getAttribute('d')).join(' ')); one.setAttribute('fill', wfill); L.ps.forEach((p) => p.remove()); lg.appendChild(one); wordG.appendChild(lg); L.g = lg; }
  // le logo est centré sur l'écran : son contenu va de x = 0 à XW unités
  const XW = (() => { const b = wordG.getBBox(), m = wordG.transform.baseVal.consolidate().matrix; return m.e + (b.x + b.width) * m.a; })();
  const XC = XW / 2;
  const U = 780 / XW, LW = 1061 * U;                 // le logo entier tient dans la colonne sûre (780 px)
  holder.style.width = LW + 'px'; svg.style.width = LW + 'px';
  const ICX = 540 + (120 - XC) * U;                  // centre de l'icône une fois le logo posé
  const tTile = tLg, tDraw = tLg + 0.26, tArr = tLg + 0.7, tFin2 = tLg + 0.82, tSl = w(88) - 0.04, tWd = w(88) + 0.4, tBio = w(92) + 0.4;
  const SIG1 = phrase([[['Achète', 89], ['juste.', 90]]], { y: 960, size: 124, out: 99, parent: GL });
  const SIG2 = phrase([[['Revends', 91, 'k'], ['mieux.', 92, 'k']]], { y: 1100, size: 140, out: 99, font: 'italic 400 140px Instrument', ls: '0em', parent: GL });
  const BIO = mk('div', 'a', GL, { height: '96px', borderRadius: '48px', background: '#f4f1ec', color: '#1c1612', font: '700 40px/96px Satoshi', padding: '0 0 0 46px', whiteSpace: 'nowrap', overflow: 'hidden' });
  const BIOT = mk('span', '', BIO, null, ''); const BIOC = mk('span', '', BIO, { display: 'inline-block', width: '4px', height: '44px', background: '#ff5a1f', marginLeft: '4px', verticalAlign: '-8px' });
  cue(tTile, 'impact', 0.9); cue(tDraw, 'whoosh', 0.5); cue(tArr, 'pop', 0.9); cue(tFin2, 'tick', 0.5); letters.forEach((L, i) => cue(tWd + i * 0.055, 'key', 0.4)); [...'lien en bio'].forEach((c, i) => { if (c !== ' ') cue(tBio + i * 0.055, 'key', 0.35); }); cue(TLOOP, 'whoosh', 0.9);
  win(tArr - 0.02, tArr + 0.3); win(TLOOP - 0.05, DUR);
  function paintFin(t) {
    const on = t >= tTile - 0.02 && t < DUR; show(GL, on); SIG1.paint(on ? t : -1); SIG2.paint(on ? t : -1); if (!on) return;
    // l'icône : grande et centrée, puis elle glisse à gauche et rapetisse (lisse : aucune traînée)
    const sl = E(t, tSl, 0.5, lisse), si = lerp(2.1, 1, sl), dx = lerp(XC - 120 * si, 0, sl), dy = 120 - 120 * si;
    iconG.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)}) scale(${(0.46875 * si).toFixed(5)})`);
    const ts = SP(t, tTile, 'heavy');
    tile.setAttribute('transform', `translate(256 256) rotate(${(-12 * (1 - ts)).toFixed(2)}) scale(${Math.max(0.001, ts).toFixed(4)}) translate(-256 -256)`);
    // la silhouette se dessine (masque qui suit son contour), la tête du trait la mène
    const pd = E(t, tDraw, 0.55, lisse);
    MKP.setAttribute('stroke-dasharray', `${(MKL * pd).toFixed(1)} ${MKL.toFixed(1)}`);
    show(pCar, pd > 0);
    const pt = MKP.getPointAtLength(MKL * pd);
    PEN.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    PEN.setAttribute('opacity', ((pd > 0 && pd < 1 ? 1 : 0) * (1 - E(t, tDraw + 0.5, 0.08))).toFixed(3));
    // la flèche part de sa base, l'aileron se pose
    const ka = SP(t, tArr, 'snappy'), kf = SP(t, tFin2, 'snappy');
    pArr.setAttribute('transform', `translate(${(1200 - 170 * (1 - Math.min(1, ka))).toFixed(1)} ${(1102 + 140 * (1 - Math.min(1, ka))).toFixed(1)}) scale(${Math.max(0.001, ka).toFixed(4)}) translate(-1200 -1102)`);   // elle file depuis l'arrière de la voiture
    pFin.setAttribute('transform', `translate(1525 1060) scale(${Math.max(0.001, kf).toFixed(4)}) translate(-1525 -1060)`);
    // le logo entier : centré en (540, YL), il s'éloigne un peu à la boucle
    const out = E(t, TLOOP - 0.12, 0.4, lisse), drift = 22 * E(t, w(91), TLOOP - w(91), (p) => p * (2 - p));   // la fin s'efface avant que le cercle de la boucle ne l'atteigne
    tf(holder, 540 - (XC + 40) * U, YL - 160 * U - drift, { o: 1 - out, s: 1 - 0.12 * out });
    holder.style.transformOrigin = `${((XC + 40) * U).toFixed(1)}px ${(160 * U).toFixed(1)}px`;
    // « utopicar » : chaque lettre monte de sous la ligne de base, au rythme de la voix
    letters.forEach((L, i) => { const p = E(t, tWd + i * 0.055, 0.42, eOut3); L.g.style.transform = `translateY(${(1150 * (1 - p)).toFixed(1)}px)`; });
    SIG1.box.style.transform = `translateY(${(-drift).toFixed(1)}px)`; SIG1.box.style.opacity = (1 - out).toFixed(3);
    SIG2.box.style.transform = `translateY(${(-drift).toFixed(1)}px)`; SIG2.box.style.opacity = (1 - out).toFixed(3);
    const n = clamp(Math.floor((t - tBio) / 0.055) + 1, 0, 11); BIOT.textContent = 'lien en bio'.slice(0, n);
    const bw = 100 + n * 21; show(BIO, t >= tBio - 0.15);
    BIO.style.width = bw + 'px'; tf(BIO, 540 - bw / 2, 1330 - drift, { s: SP(t, tBio - 0.15, 'snappy') * (1 - out), o: 1 - out });
    BIOC.style.opacity = n < 11 || Math.floor((t - tBio) / 0.4) % 2 === 0 ? '1' : '0';
  }

  // couleurs du fond, scène par scène
  PALK = [[0, 'o'], [tFlip, 'r'], [tS3in, 'o'], [tVer - 0.1, 'r'], [tFlipB - 0.1, 'v'], [tL0 + 0.2, 'o'], [tN, 'n'], [tA0, 'a'], [tP0, 'o'], [w(85) - 0.15, 'v'], [tLg, 'o']];

  // sous-titres du haut : chacun est sorti (0,2 s) avant que le suivant tape sa première lettre
  { const top = PHR.filter((p) => p.haut).sort((a, b) => a.first - b.first); for (let i = 0; i < top.length - 1; i++) top[i].out = Math.min(top[i].out, top[i + 1].first - 0.26); }

  // empilement : la scène qui arrive passe DEVANT celle qui recule (v7)
  [[S1, 2], [S3, 3], [S4, 5], [S5, 6], [S6, 7], [S7, 8], [S8, 9], [S9, 10], [S10, 11], [S11, 12]].forEach(([S, z]) => { S.root.style.zIndex = String(z); });

  // ---------- seek ----------
  window.seek = (t) => {
    const tt = t < TLOOP ? t : 0, boucle = t >= TLOOP;
    peintFond(BLOBS, GRAIN, t);
    FLASH.style.opacity = '0';
    paintS1(tt); paintS3(t); paintS4(t); paintS5(t); paintS6(t); paintS7(t); paintS8(t); paintS9(t); paintS10(t); paintS11(t); paintFin(t);
    for (const p of PHR) p.paint(tt);
    // la boucle : S1 (image 0, sur son propre fond) et ses sous-titres reviennent dans un cercle qui s'ouvre
    const cercle = boucle ? `circle(${(2300 * E(t, TLOOP + 0.06, DUR - TLOOP - 0.08, eIO)).toFixed(0)}px at ${ICX.toFixed(0)}px ${YL}px)` : '';   // depuis l'icône du logo
    S1.root.style.clipPath = cercle; TXT.style.clipPath = cercle;
    S1.root.style.zIndex = boucle ? '14' : '2';
    show(F1, boucle); if (boucle) peintFond(F1B, F1G, 0);
  };
  const inWin = (t) => FAST.some(([a, b]) => t >= a && t <= b);
  window.shutter = (t) => (inWin(t) ? 1 : 0.5);
  window.samples = (t) => (inWin(t) ? 8 : 4);
  window.filmDur = DUR;
  window.cues = CUES.sort((x, y) => x.t - y.t);
  window.seek(0);
  window.filmReady = true;
})().catch((e) => { console.error('FILM', e.message, e.stack); document.title = 'ERREUR ' + e.message; });
