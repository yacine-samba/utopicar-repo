// Présentation utopicar v8 (9:16, même voix que la v7 : vo-presentev7) : plus aucun cadre d'interface, film immersif.
// Retour de l'utilisateur sur la v7 : « retire les cadres des interfaces, faut que ça soit beaucoup plus immersif ».
// Grammaire v8 :
//  · aucune carte : ni fond, ni bordure, ni boîte, ni ombre autour d'un élément d'interface. Chaque pièce (libellé,
//    valeur, barre, phrase, anneau, lien collé) flotte seule dans l'espace, en grand, dans la colonne 140 → 940 ; les
//    séparations sont des filets fins qui se tracent ; les commandes restent pleines (bouton orange, interrupteur,
//    étiquette Benef Pro) : ce sont des commandes, pas des cadres ;
//  · vue éclatée : les pièces d'un bloc sont posées à des profondeurs différentes (libellé devant, barre derrière),
//    compensées pour donner la mise en page voulue caméra au repos ; la caméra tourne lentement (parallaxe) et le fond
//    pointillé bouge avec elle ;
//  · la caméra circule : filé horizontal d'un critère au suivant (flou directionnel), verdict qui se retourne pièce
//    par pièce (tambour), bande PLAFOND plein cadre, mur révélé par un iris doux, radar couché au sol ;
//  · ce que la v7 a réglé tient : un texte n'apparaît qu'une fois et monte d'un masque, aucun texte ne file vers la
//    caméra, une scène qui sort recule et se floute sous la suivante, aucun texte posé sur un autre.
// Contrat : window.seek(t) peint l'image t.
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
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };   // bruit fixe

  // ---------- éléments ----------
  const mk = (tag, cls, parent, css, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const show = (e, v) => { e.style.display = v ? '' : 'none'; return v; };
  // milliers et unités : espace insécable (U+00A0) ; l'espace fine U+202F n'existe ni dans Clash ni dans Satoshi et disparaît
  const nb = (h) => (typeof h === 'string' ? h.replace(/(\d) (?=\d{3}(?!\d))/g, '$1 ').replace(/ (€|%)/g, ' $1') : h);
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
    return { root, cam, persp, cp: { cx: 540, cy: 960, cz: 0, tz: 0, rx: 0, ry: 0, rz: 0 }, rb: 0, rk: 1, fs: 0 };
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
  // rotation d'un vecteur dans l'ordre de CSS « rotateX rotateY rotateZ » (rotateZ s'applique d'abord)
  const rot3 = (x, y, z, rx, ry, rz) => {
    let a = rz * RAD; [x, y] = [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    a = ry * RAD; [x, z] = [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
    a = rx * RAD; [y, z] = [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
    return [x, y, z];
  };
  const obj = (parent, wd, ht, css = {}, html) => mk('div', 'a', parent, { width: wd + 'px', height: ht + 'px', ...css }, html);
  const CUES = [], cue = (t, k, g = 1) => { if (t >= 0 && t < DUR) CUES.push({ t: +t.toFixed(3), k, g }); };
  const FAST = []; const win = (a, b) => FAST.push([a, b]);
  const milliers = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const eur = (n) => `${milliers(n)} €`;
  const largeur = (el) => el.getBoundingClientRect().width;

  // =====================================================================================================
  // BLOC SANS CADRE : des pièces posées une à une dans le monde, chacune à sa profondeur (vue éclatée). Aucun conteneur
  // commun, donc aucun fond : la place de chaque pièce est calculée. On dessine la mise en page à l'écran (l, haut) ;
  // une pièce à la profondeur z est reculée/rapetissée d'autant, si bien que caméra au repos elle tombe exactement à
  // sa place, et qu'en mouvement les plans glissent les uns sur les autres. Chaque pièce = un support (posé en 3D,
  // porte le flou et l'opacité du bloc) + son contenu (animé à part). Les pièces « d3 » (qui se retournent) gardent un
  // support 3D : leur flou et leur opacité sont portés par le contenu.
  // =====================================================================================================
  function bloc(S, ox = 540, oy = 960) {
    const B = { S, ox, oy, P: [] };
    B.add = (l, tp, z, css, html, cls = 'a nw', o = {}) => {
      const sup = mk('div', 'a', S.cam, { transformOrigin: '0 0', transformStyle: o.d3 ? 'preserve-3d' : 'flat' });
      const el = mk('div', cls, sup, css, html);
      B.P.push({ sup, el, l, tp, z, d3: !!o.d3 }); return el;
    };
    B.droite = (el, xr) => { const p = B.P.find((q) => q.el === el); p.l = xr - largeur(el); };   // aligne à droite sur xr
    B.pose = (x, y, z, o = {}) => {
      const rx = o.rx || 0, ry = o.ry || 0, rz = o.rz || 0, s = o.s ?? 1;
      for (const p of B.P) {
        const k = S.persp / (S.persp - p.z);
        const [dx, dy, dz] = rot3((540 + (p.l - 540) / k - B.ox) * s, (960 + (p.tp - 960) / k - B.oy) * s, p.z * s, rx, ry, rz);
        p.sup.style.transform = `translate3d(${(x + dx).toFixed(1)}px,${(y + dy).toFixed(1)}px,${(z + dz).toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${(s / k).toFixed(4)})`;
      }
    };
    B.fx = (op, f = '', sauf = null) => { for (const p of B.P) if (!p.d3 && p.el !== sauf) { p.sup.style.opacity = op; p.sup.style.filter = f; } };
    B.vis = (v) => { for (const p of B.P) show(p.sup, v); return v; };
    return B;
  }

  // =====================================================================================================
  // DÉCOMPOSITION : chaque pièce se construit dans l'ordre où l'œil la lit. Libellés ET valeurs montent d'un masque
  // lettre à lettre (aucun rouleau : au flou de bougé ils empilaient des chiffres fantômes) ; barres qui se remplissent,
  // filets qui se tracent menés par une tête claire, coches tracées, pastilles qui jaillissent.
  // =====================================================================================================
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
  // reflet qui traverse un bouton plein (l'animation « reflet » de l'app)
  const reflet = (c) => { const box = mk('div', 'a', c, { left: '0', top: '0', width: '100%', height: '100%', borderRadius: 'inherit', overflow: 'hidden', pointerEvents: 'none', zIndex: 8 }); return mk('div', 'a', box, { left: '0', top: '-25%', width: '34%', height: '150%', background: 'linear-gradient(100deg, rgba(255,240,225,0), rgba(255,240,225,.1) 40%, rgba(255,255,255,.3) 50%, rgba(255,240,225,.1) 60%, rgba(255,240,225,0))', opacity: 0 }); };
  const passe = (B, t, t0, d = 0.75) => { const p = E(t, t0, d, eIO); B.style.transform = `translateX(${lerp(-130, 330, p).toFixed(1)}%) skewX(-14deg)`; B.style.opacity = p > 0 && p < 1 ? '1' : '0'; };
  // filet : ligne fine qui se trace de gauche à droite, menée par une tête claire (remplace les bords des cartes)
  const filet = (parent, l, tp, wd, col = 'rgba(244,241,236,.16)', h = 2) => {
    const box = mk('div', 'a', parent, { left: l + 'px', top: tp + 'px', width: wd + 'px', height: h + 'px' });
    const L = mk('div', 'a', box, { left: '0', top: '0', width: '100%', height: '100%', borderRadius: (h / 2) + 'px', background: col, transformOrigin: '0 50%', transform: 'scaleX(0)' });
    const T = mk('div', 'a', box, { left: '-40px', top: (h / 2 - 6) + 'px', width: '80px', height: '12px', background: 'radial-gradient(closest-side, rgba(255,246,236,.95), rgba(255,170,120,.45) 55%, rgba(255,138,76,0))', opacity: 0 });
    return { box, L, T, wd };
  };
  const filetB = (B, l, tp, z, wd, col, h = 2) => filet(B.add(l, tp, z, { width: wd + 'px', height: h + 'px' }, '', 'a'), 0, 0, wd, col, h);
  const trait = (F, t, t0, d = 0.55) => { const p = E(t, t0, d, eOut3); F.L.style.transform = `scaleX(${p.toFixed(4)})`; F.T.style.transform = `translateX(${(F.wd * p).toFixed(1)}px)`; F.T.style.opacity = (p > 0 && p < 1 ? Math.min(1, (1 - p) * 5) : 0).toFixed(3); return p; };

  // flous directionnels (filé de caméra, défilement du mur, fond) : un filtre SVG par usage, écart-type mis à jour à
  // chaque image (la moitié du chemin parcouru en une image : comble les sous-images du flou de bougé)
  const SVGF = document.createElementNS(NS, 'svg'); SVGF.setAttribute('width', '0'); SVGF.setAttribute('height', '0'); SVGF.style.position = 'absolute';
  ST.appendChild(SVGF);
  const filtre = (id, m = 5) => { const f = document.createElementNS(NS, 'filter'); f.setAttribute('id', id); f.setAttribute('x', -m + '%'); f.setAttribute('y', -m + '%'); f.setAttribute('width', (100 + 2 * m) + '%'); f.setAttribute('height', (100 + 2 * m) + '%'); f.setAttribute('color-interpolation-filters', 'sRGB'); const g = document.createElementNS(NS, 'feGaussianBlur'); g.setAttribute('stdDeviation', '0 0'); f.appendChild(g); SVGF.appendChild(f); return g; };
  // filtre de la racine d'une scène : filé (SVG, sur un axe) puis recul (flou, assombri)
  const fx = (S) => {
    const f = [];
    if (S.fl && S.fs > 0.6) { S.fl.setAttribute('stdDeviation', S.fd === 'y' ? `0 ${S.fs.toFixed(1)}` : `${S.fs.toFixed(1)} 0`); f.push(`url(#${S.fid})`); }
    if (S.rb > 0.05) f.push(`blur(${S.rb.toFixed(1)}px)`);
    if (S.rk < 0.999) f.push(`brightness(${S.rk.toFixed(3)})`);
    S.root.style.filter = f.join(' ');
  };
  // sortie d'une scène : elle recule, se floute et s'éteint sous la suivante (aucun texte ne file vers la caméra)
  const recul = (S, t, t0, d = 0.6) => {
    const p = E(t, t0, d, lisse);
    S.root.style.transform = p > 0 ? `scale(${(1 - 0.08 * p).toFixed(4)})` : '';
    S.rb = 26 * p; S.rk = 1 - 0.6 * p;
    S.root.style.opacity = (1 - E(t, t0 + d * 0.35, d * 0.65, lin)).toFixed(3);
    fx(S);
    return p;
  };

  // =====================================================================================================
  // FOND : sombre de l'app + taches de couleur qui bougent (la couleur change avec la scène) ; la trame pointillée
  // suit la caméra (filé des critères, défilement du mur) : l'espace bouge, pas seulement les objets
  // =====================================================================================================
  const FOND = mk('div', 'lay', ST, { background: '#0b0a09' });
  const blobs = (parent) => [0, 1, 2].map(() => mk('div', 'a', parent, { width: '1700px', height: '1700px', left: '-850px', top: '-850px' }));
  const trame = (parent) => mk('div', 'a', parent, { left: '-68px', top: '-68px', width: '1216px', height: '2056px', background: 'radial-gradient(rgba(244,241,236,.07) 1.4px, transparent 1.6px) 0 0/34px 34px' });
  const BLOBS = blobs(FOND), GRAIN = trame(FOND);
  const GFL = filtre('fgrain', 2);
  const PAL = {
    o: [[255, 90, 31, 0.5], [190, 40, 20, 0.42], [255, 160, 90, 0.22]],
    r: [[235, 45, 45, 0.55], [150, 15, 30, 0.5], [255, 90, 31, 0.25]],
    v: [[40, 200, 120, 0.42], [10, 100, 70, 0.45], [180, 230, 120, 0.18]],
    n: [[70, 90, 240, 0.5], [120, 60, 220, 0.38], [20, 30, 110, 0.6]],
    a: [[255, 130, 80, 0.48], [230, 70, 120, 0.36], [255, 200, 120, 0.22]],
  };
  let PALK = [[0, 'o']];
  let FDX = () => 0, FDY = () => 0, FDV = () => [0, 0];   // parallaxe du fond (définie après les scènes)
  const mod34 = (v) => ((v % 34) + 34) % 34;
  function peintFond(B, G, t, suit = true) {
    let c = PAL[PALK[0][1]];
    for (let i = 1; i < PALK.length; i++) { const [t0, k] = PALK[i]; c = c.map((v, j) => mix(v, PAL[k][j], E(t, t0, 0.35, eIO))); }
    const pos = [[300 + 320 * Math.sin(t * 0.55), 480 + 260 * Math.cos(t * 0.43)], [800 + 260 * Math.cos(t * 0.47 + 1), 1500 + 240 * Math.sin(t * 0.51)], [560 + 380 * Math.sin(t * 0.33 + 2), 1000 + 420 * Math.cos(t * 0.29)]];
    B.forEach((h, i) => { const [r, g, b, a] = c[i]; h.style.background = `radial-gradient(circle at 50% 50%, rgba(${r | 0},${g | 0},${b | 0},${a.toFixed(3)}) 0%, rgba(${r | 0},${g | 0},${b | 0},0) 58%)`; tf(h, pos[i][0], pos[i][1], { s: 1 + 0.15 * Math.sin(t * 0.7 + i * 2) }); });
    const ox = suit ? FDX(t) : 0, oy = (suit ? FDY(t) : 0) - t * 22;
    G.style.transform = `translate(${(mod34(ox) - 34).toFixed(1)}px,${(mod34(oy) - 34).toFixed(1)}px)`;
    const [sx, sy] = suit ? FDV(t) : [0, 0];
    if (sx > 0.6 || sy > 0.6) { GFL.setAttribute('stdDeviation', `${sx.toFixed(1)} ${sy.toFixed(1)}`); G.style.filter = 'url(#fgrain)'; } else G.style.filter = '';
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
  // lueur qui suit la voix sur un titre de l'interface (lettres d'une ligne, images clés [t, x])
  const allumeLigne = (L, K, t, base, halo, size) => { const X = tete(K, t), f = 1 - E(t, K[K.length - 1][0] + 0.15, 0.5); L.forEach((s) => allume(s, base, halo, lueur(s._x + s._w / 2, X, size) * f, size)); };

  // =====================================================================================================
  // S1 · ACCROCHE (validée) « Cette 208 à 7 190 € ? À la revente, tu perds 2 688 € » : la 208 devant un prix géant,
  //      le prix bascule chiffre par chiffre en −2 688 € rouge qui passe devant la voiture (déjà sans cadre).
  // =====================================================================================================
  const S1 = scene(1200);
  // fond propre à S1, utilisé seulement à la boucle : S1 revient dans un cercle, sur le fond de l'image 0
  const F1 = mk('div', 'lay', null, { background: '#0b0a09' }); S1.root.insertBefore(F1, S1.cam);
  const F1B = blobs(F1), F1G = trame(F1);
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
  // S3 · « Colle l'annonce dans utopicar. » : ni carte ni champ encadré. Le libellé « Lien de l'annonce », puis le lien
  //      leboncoin COLLÉ en très grand (quatre lignes qui remplissent la colonne, surlignées comme un texte collé,
  //      curseur au bout) au-dessus du filet du champ, qui passe à l'orange ; la caméra part de tout près, de biais, et
  //      recule face au formulaire ; « Analyser ce lien » n'est d'abord qu'un mot : le bouton orange se remplit
  //      derrière lui quand le lien est valide ; un doigt l'enfonce ; il se replie en pastille.
  // =====================================================================================================
  const S3 = scene(1100);
  const F3 = bloc(S3);
  const LAB3 = lettres(F3.add(140, 590, 70, { font: '500 52px Satoshi', color: 'rgba(244,241,236,.72)' }, "Lien de l'annonce"));
  const URLL = ['https://www.', 'leboncoin.fr', '/ad/voitures/', '2873461903'];
  const FU = (() => { const m = mk('span', 'a nw', ST, { font: '500 100px Satoshi', letterSpacing: '-.02em', visibility: 'hidden' }); const wm = Math.max(...URLL.map((s) => { m.textContent = s; return largeur(m); })); m.remove(); return Math.min(106, Math.floor(100 * 790 / wm)); })();
  const LU = Math.round(FU * 1.16), YU = 676;
  const ULN = URLL.map((s, i) => {
    const el = F3.add(140, YU + i * LU, 0, { width: '800px', height: LU + 'px', font: `500 ${FU}px/${LU}px Satoshi`, letterSpacing: '-.02em', color: '#f4f1ec' }, '', 'a nw');
    const SEL = mk('div', 'a', el, { left: '-10px', top: (LU * 0.12).toFixed(1) + 'px', height: (LU * 0.78).toFixed(1) + 'px', borderRadius: '12px', background: 'rgba(255,90,31,.42)' });
    const T = mk('div', 'a nw', el, { left: '0', top: '0' }, s);
    const wd = largeur(T); SEL.style.width = (wd + 20) + 'px';
    return { el, SEL, T, wd };
  });
  const YF3 = YU + 4 * LU + 22;                       // le filet du champ, sous le lien
  const FIL3 = filetB(F3, 140, YF3, -40, 800, 'rgba(244,241,236,.24)', 4);
  const CAR3 = F3.add(140, YU, 10, { width: '7px', height: (LU * 0.7).toFixed(1) + 'px', borderRadius: '4px', background: '#ff5a1f' }, '', 'a');
  const YB3 = YF3 + 74;
  const BTN3 = F3.add(140, YB3, 0, { width: '800px', height: '150px', borderRadius: '75px' }, '', 'a');
  const CAP = mk('div', 'a', BTN3, { left: '0', top: '0', width: '800px', height: '150px', borderRadius: '75px', background: '#ff5a1f', boxShadow: '0 30px 90px -30px rgba(255,90,31,.9)' });
  const BTl = mk('div', 'a nw', BTN3, { left: '0', top: '0', width: '800px', height: '150px', textAlign: 'center', font: '600 62px/150px Clash', letterSpacing: '-.02em', color: 'rgba(244,241,236,.46)' }, 'Analyser ce lien');
  const BTd = mk('div', 'a nw', BTN3, { left: '0', top: '0', width: '800px', height: '150px', textAlign: 'center', font: '600 62px/150px Clash', letterSpacing: '-.02em', color: '#160904' }, 'Analyser ce lien');
  const BTB = reflet(CAP);
  const RIP = mk('div', 'a', BTN3, { width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,.4)', opacity: 0 });
  const DOIGT3 = mk('div', 'a', S3.root, { width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,.3)', border: '3px solid rgba(255,255,255,.85)', boxShadow: '0 10px 30px rgba(0,0,0,.35)' });
  const tS3in = tS2out + 0.02, tPaste = w(16) - 0.08, tPB = tPaste + 0.45, tAct = tPB + 0.55;
  const tTap = WD[18].e + 0.4, tCol = tTap + 0.24, tDet = tCol + 0.22;
  const FAR3 = { cx: 540, cy: 960, cz: 0, tz: 0, rx: 0, ry: 0, rz: 0 };
  // point de passage vers S4 : le centre du bouton replié, à l'écran, cadrage final
  const H3 = (() => { const keep = S3.cp; S3.cp = { ...FAR3 }; const [x, y, k] = proj(S3, 540, YB3 + 75, 0); S3.cp = keep; return { x, y, d: 150 * k, k }; })();
  ph([[['Colle', 14], ["l'annonce", 15]], [['dans', 17], ['utopicar.', 18, 'k']]], { y: 236, size: 124, out: tDet });
  cue(tS3in, 'whoosh', 0.6); cue(tPaste, 'paste', 1); cue(tPB, 'whoosh', 0.35); cue(tAct, 'pop', 0.6); cue(tTap, 'click', 1); cue(tCol, 'whoosh', 0.5);
  win(tPaste - 0.02, tPaste + 0.3);
  function paintS3(t) {
    if (!show(S3.root, t >= tS3in && t < tDet + 0.62)) return;
    const into = E(t, tS3in, 0.7, doux), pb = E(t, tPB, 0.85, lisse), calme = 1 - E(t, tTap - 0.5, 0.4);
    const near = { cx: 430 + 30 * Math.sin(t * 0.8), cy: 800, cz: lerp(140, 380, E(t, tS3in + 0.05, 0.75, doux)), rx: 13, ry: -15 + 3 * Math.sin(t * 0.7), rz: -3 };
    camera(S3, { cx: lerp(near.cx, FAR3.cx, pb), cy: lerp(near.cy, FAR3.cy, pb), cz: lerp(near.cz, FAR3.cz, pb), rx: lerp(near.rx, 0, pb) + 1.5 * Math.sin(t * 0.9) * pb * calme, ry: lerp(near.ry, 0, pb) + 3 * Math.sin(t * 0.6) * pb * calme, rz: lerp(near.rz, 0, pb) });
    F3.pose(540, 960 + 90 * (1 - into), -120 * (1 - into));
    // mise au point sur le bouton quand le doigt appuie : tout le reste du formulaire se floute (l'anneau qui va
    // naître de la pastille ne croise que du flou)
    const mp = E(t, tTap - 0.05, 0.35, doux);
    F3.fx((1 - 0.35 * mp).toFixed(3), mp > 0.01 ? `blur(${(11 * mp).toFixed(1)}px) brightness(${(1 - 0.4 * mp).toFixed(3)})` : '', BTN3);
    monte(LAB3, t, tS3in + 0.3, 0.025);   // pas de texte tant que l'accroche n'est pas floue
    trait(FIL3, t, tS3in + 0.25, 0.6);
    // le filet du champ passe à l'orange quand le lien est collé (le champ a le focus)
    const foc = E(t, tPaste, 0.3);
    FIL3.L.style.background = foc > 0 ? `rgba(${lerp(244, 255, foc) | 0},${lerp(241, 90, foc) | 0},${lerp(236, 31, foc) | 0},${lerp(0.24, 0.95, foc).toFixed(3)})` : 'rgba(244,241,236,.24)';
    // le collage : chaque ligne apparaît d'un coup, de gauche à droite, surlignée ; puis le surlignage s'efface
    ULN.forEach((U, i) => {
      const pw = E(t, tPaste + i * 0.05, 0.16, eOut3);
      U.T.style.clipPath = `inset(-12px ${(100 * (1 - pw)).toFixed(2)}% -12px 0)`;
      U.SEL.style.clipPath = `inset(0 ${(100 * (1 - pw)).toFixed(2)}% 0 0 round 12px)`;
      U.SEL.style.opacity = (pw > 0 ? 1 - E(t, tPaste + 0.5, 0.45) : 0).toFixed(3);
    });
    // le curseur : au début du champ, puis au bout du lien collé
    const pl = E(t, tPaste + 0.15, 0.16, eOut3), colle = t >= tPaste;
    CAR3.style.transform = colle ? `translate(${(ULN[3].wd * pl + 8).toFixed(1)}px,${(3 * LU + LU * 0.15).toFixed(1)}px)` : `translate(0px,${(LU * 0.15).toFixed(1)}px)`;
    show(CAR3, t >= tS3in + 0.3 && t < tTap && (Math.floor((t - tS3in) / 0.27) % 2 === 0 || (t > tPaste - 0.02 && t < tPaste + 0.45)));
    // le bouton : d'abord le seul mot, qui monte quand la caméra recule ; il se remplit d'orange depuis le centre
    // quand le lien est valide
    leve(BTN3, t, tPB + 0.45, 26, 0.5);   // quand il est entré dans le cadre (pas dans la bande du bas)
    const act = SP(t, tAct, 'snappy'), pr = bump(t, tTap - 0.03, 0.12), col = SP(t, tCol, 'snappy');
    const cw = col > 0 ? lerp(800, 150, Math.min(1, col)) : 800 * Math.min(1, act), m = (800 - cw) / 2;
    CAP.style.clipPath = `inset(0 ${m.toFixed(1)}px 0 ${m.toFixed(1)}px round 75px)`;
    CAP.style.opacity = act > 0.001 ? '1' : '0';
    BTd.style.clipPath = CAP.style.clipPath;
    BTl.style.opacity = (1 - Math.min(1, act * 1.4)).toFixed(3);
    BTd.style.opacity = (1 - E(t, tCol - 0.04, 0.1)).toFixed(3);
    BTN3.style.transform += ` scale(${(1 - 0.05 * pr).toFixed(4)})`;
    BTB.parentNode.style.display = t < tCol ? '' : 'none';
    passe(BTB, t, tAct + 0.2, 0.7);
    const rp = E(t, tTap, 0.5, eOut3);
    RIP.style.transform = `translate(${(400 + 180 - 160).toFixed(1)}px,${(75 - 160).toFixed(1)}px) scale(${(0.1 + 1.6 * rp).toFixed(3)})`;
    RIP.style.opacity = (t >= tTap && t < tCol ? 0.6 * (1 - rp) : 0).toFixed(3);
    show(BTN3, t < tDet);
    // le doigt : arrive, appuie, repart
    const dOn = t >= tTap - 0.35 && t < tTap + 0.32; show(DOIGT3, dOn);
    if (dOn) { const a = E(t, tTap - 0.35, 0.25), b = 1 - E(t, tTap + 0.1, 0.2); tf(DOIGT3, H3.x + 170 - 60, H3.y + 30 - 60 + 90 * (1 - a), { s: (1 - 0.18 * pr) * (0.85 + 0.15 * a), o: a * b }); }
    recul(S3, t, tDet, 0.6);
  }

  // =====================================================================================================
  // S4 · « En une minute, » : la pastille orange monte au centre en s'ouvrant en anneau de chrono (le disque se creuse
  //      et grandit), la piste et ses 60 traits ; l'arc fait le tour pendant que le chrono compte 0:00 → 1:00 (chiffre
  //      figé sur chaque image) ; puis l'anneau se couche jusqu'à n'être plus qu'un trait : la barre du premier critère.
  // =====================================================================================================
  const S4 = scene(1200);
  const YBAR = 1030;                                 // hauteur des barres des critères (le trait de l'anneau couché)
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
  win(tR0, tR0 + 0.4); win(tS4out, tS4out + 0.32);
  function paintS4(t) {
    if (!show(S4.root, t >= tR0 - 0.01 && t < tS4out + 0.32)) return;
    const p = SP(t, tR0, 'default'), mv = E(t, tR0, 0.55, doux), run = E(fq(t), tRun, tRend - tRun, lin), couche = E(t, tS4out, 0.3, eIn2);
    camera(S4, { cx: 540, cy: 960, cz: 24 * E(t, tR0, 1.2, doux) * (1 - couche) });
    const wob = (1 - E(t, tS4out - 0.35, 0.3)) * Math.min(1, p);
    // l'anneau se couche jusqu'à la largeur de la barre (760 px) : c'est elle qui prend le relais
    put(RING, 540 + (H3.x - 540) * (1 - mv), lerp(H3.y, YBAR, mv), 0, { rx: 90 * couche + 5 * Math.sin(t * 1.3) * wob, ry: 8 * Math.sin(t * 0.9) * wob, s: 1 - 0.1 * couche });
    // le disque (diamètre de la pastille) se creuse en anneau : rayon moyen et épaisseur
    const Ro = lerp(H3.d / 2, 422, p), Ri = lerp(0, 378, p);
    RPIST.setAttribute('r', ((Ro + Ri) / 2).toFixed(2)); RPIST.setAttribute('stroke-width', Math.max(0.1, Ro - Ri).toFixed(2));
    const pc = E(t, tR0 + 0.12, 0.35);
    RPIST.setAttribute('stroke', `rgba(${lerp(255, 244, pc) | 0},${lerp(90, 241, pc) | 0},${lerp(31, 236, pc) | 0},${lerp(1, 0.1, pc).toFixed(3)})`);
    RARC.setAttribute('stroke-dasharray', `${(2513.3 * run).toFixed(1)} 2513.3`); RARC.setAttribute('opacity', run > 0 ? '1' : '0');   // un trait de longueur nulle à bouts ronds dessine un point
    TICKS.forEach((r, i) => { const k = E(t, tR0 + 0.18 + i * 0.006, 0.18, eOut); r.setAttribute('opacity', k.toFixed(3)); r.setAttribute('fill', run > 0 && i / 60 < run ? '#ff8a4c' : 'rgba(244,241,236,.22)'); });
    // le chrono : 0:00 → 1:00, une valeur par image
    const v = Math.min(60, Math.floor(60 * run + 1e-6)), txt = v >= 60 ? '1:00' : `0:${String(v).padStart(2, '0')}`;
    C4.forEach((s, i) => {
      s.textContent = txt[i];
      const q = E(t, tR0 + 0.45 + i * 0.05, 0.5, eOut3); s.style.transform = `translateY(${((1 - q) * 105).toFixed(1)}%)`;
    });
    const fini = t >= tRend;
    CNT4.style.color = fini ? rgb(mix(hx('#f4f1ec'), hx('#ff8a4c'), E(t, tRend, 0.15))) : '#f4f1ec';
    CNT4.style.transform = `scale(${(1 + 0.07 * bump(t, tRend, 0.14)).toFixed(3)})`;
  }

  // =====================================================================================================
  // S5 · « la cote, les travaux, ta marge… » : trois critères du rapport, sans carte, posés côte à côte dans l'espace ;
  //      la caméra FILE de l'un à l'autre (flou directionnel, elle tourne un peu dans le sens du mouvement, le fond
  //      suit). Chaque critère : libellé, valeur géante, barre pleine largeur, phrase, chacun à sa profondeur.
  //      « et le verdict. » : le dernier critère recule et s'éteint, le verdict naît à sa place, pièce par pièce ;
  //      « À éviter. » : son titre s'allume avec la voix, l'anneau bat ; puis chaque pièce se retourne (tambour).
  // =====================================================================================================
  const S5 = scene(1200);
  S5.fid = 'file5'; S5.fl = filtre('file5'); S5.fd = 'x';
  const GAP = 1000;                                  // juste hors champ au repos : le filé enchaîne un critère sur l'autre sans vide
  // dérive commune de la caméra des critères et des verdicts (S5 et S6 se raccordent image pour image)
  const derive = (t) => ({ dx: 8 * Math.sin(t * 0.5), dy: 6 * Math.sin(t * 0.37), cz: 30 * Math.sin(t * 0.4), rx: 2.5 * Math.sin(t * 0.7), ry: 5 * Math.sin(t * 0.45), rz: 0.5 * Math.sin(t * 0.3) });
  const CRIT = [
    ['Bon prix ?', 'Trop cher', '#ff6b6b', 3, '1 671 € de plus que les annonces comparables (+30 %)'],
    ['Des travaux ?', '≈ 540 €', '#3ecb7f', 80, 'Probable sur 12 mois, entre 0 € et 1 650 €'],
    ['Ça rapporte ?', '−2 688 €', '#ff6b6b', 3, "Vous perdriez de l'argent au prix affiché"],
  ].map(([lab, val, col, pct, sub], i) => {
    const B = bloc(S5);
    // la valeur, la plus grande possible dans la colonne ; son pied à 40 px de la barre
    const m = mk('span', 'a nw', ST, { font: '600 230px Clash', letterSpacing: '-.045em', visibility: 'hidden' }, nb(val)); const fs = Math.min(230, Math.floor(230 * 750 / largeur(m))); m.remove();
    const yv = YBAR - 46 - Math.round(fs * 1.08);
    const L = lettres(B.add(160, yv - 84, 110, { font: '500 62px Satoshi', color: 'rgba(244,241,236,.8)' }, lab));
    const V = lettres(B.add(152, yv, 0, { font: `600 ${fs}px/1.08 Clash`, letterSpacing: '-.045em', color: col }, nb(val)));
    const PS = B.add(160, YBAR - 11, -60, { width: '760px', height: '22px', borderRadius: '11px', background: 'rgba(244,241,236,.1)', overflow: 'hidden', transformOrigin: i ? '0 50%' : '50% 50%' }, '', 'a');
    const F = mk('i', 'a', PS, { left: '0', top: '0', bottom: '0', width: '0%', borderRadius: '11px', background: col });
    const SM = motsDe(B.add(160, YBAR + 46, 50, { width: '760px', font: '500 50px/1.3 Satoshi', color: 'rgba(244,241,236,.68)', whiteSpace: 'normal' }, nb(sub), 'a'));
    return { B, L, V, PS, F, SM, pct, X0: i * GAP };
  });
  // le verdict, sans carte : anneau de la note, surtitre, titre géant, explication, « À faire ». Chaque pièce se
  // retourne seule autour de son axe horizontal (support 3D, flou et opacité portés par la pièce)
  function verdict(S, o) {
    const B = bloc(S), P = [];
    const pc = (l, tp, z, css, html, cls) => { const el = B.add(l, tp, z, { transformOrigin: '50% 50%', ...css }, html, cls, { d3: true }); P.push(el); return el; };
    const ring = pc(160, 560, 60, { width: '260px', height: '260px' }, `<svg viewBox="0 0 120 120" width="260" height="260" style="position:absolute;left:0;top:0;transform:rotate(-90deg);overflow:visible"><circle class="pist" cx="60" cy="60" r="52" fill="none" stroke="rgba(244,241,236,.12)" stroke-width="9" stroke-dasharray="0 326.7"/><circle class="arc" cx="60" cy="60" r="52" fill="none" stroke="${o.col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="0 326.7"/></svg><div class="n a nw" style="left:0;top:62px;width:260px;text-align:center;font:600 104px/1.08 Clash;letter-spacing:-.03em">${o.note}</div><div class="s a nw" style="left:0;top:174px;width:260px;text-align:center;font:500 30px Satoshi;color:rgba(244,241,236,.6)">sur 100</div>`, 'a');
    const kick = pc(472, 644, 30, { font: '700 34px/1.36 Satoshi', letterSpacing: '.16em', color: 'rgba(244,241,236,.62)' }, '<div style="width:max-content">AVANT LE</div><div style="width:max-content">PREMIER MESSAGE</div>', 'a nw');
    // titre : la plus grande taille qui tient dans la colonne
    const m = mk('div', 'a nw', ST, { font: `600 ${o.fs}px Clash`, letterSpacing: '-.035em', visibility: 'hidden' }); const wm = Math.max(...o.titre.map((s) => { m.textContent = s; return largeur(m); })); m.remove();
    const fs = Math.min(o.fs, Math.floor(o.fs * 730 / wm)), lt = Math.round(fs * 1.04);
    const ti = pc(152, 866, 0, { font: `600 ${fs}px/${lt}px Clash`, letterSpacing: '-.035em', color: o.col }, o.titre.map((s) => `<div style="width:max-content">${s}</div>`).join(''), 'a nw');
    const yTx = 866 + o.titre.length * lt + 22;
    const tx = pc(160, yTx, -20, { width: '760px', font: '500 40px/1.38 Satoshi', color: 'rgba(244,241,236,.82)', whiteSpace: 'normal' }, `<div>${nb(o.texte)}</div>`, 'a');
    const yFa = yTx + Math.round(tx.getBoundingClientRect().height) + 18;
    const fa = pc(160, yFa, -20, { width: '760px', font: '500 40px/1.38 Satoshi', color: 'rgba(244,241,236,.82)', whiteSpace: 'normal' }, `<div><b style="color:#f4f1ec;font-weight:700">À faire :</b> ${o.faire}</div>`, 'a');
    const TL = [...ti.children].map((d) => { const L = lettres(d); L.forEach((s) => { s._x = s.offsetLeft; s._w = s.offsetWidth; }); return L; });
    return { B, P, ring, pist: ring.querySelector('.pist'), arc: ring.querySelector('.arc'), NR: lettres(ring.querySelector('.n')), S: ring.querySelector('.s'), K1: lettres(kick.children[0]), K2: lettres(kick.children[1]), TL, fs, TXM: motsDe(tx.firstChild), FA: fa.firstChild, note: o.note, yFa };
  }
  // construction d'un verdict, dans l'ordre de lecture : anneau, note et surtitre à g0, arc à tArc, titre à tTi,
  // explication à tTx
  const batit = (V, t, { g0, tArc, tTi, tTx }) => {
    trace(V.pist, 326.7, t, g0, 0.4);
    V.arc.setAttribute('stroke-dasharray', `${(326.7 * V.note / 100 * E(t, tArc, 0.8, eOut3)).toFixed(1)} 326.7`);
    V.arc.setAttribute('opacity', t >= tArc ? '1' : '0');   // un trait de longueur nulle à bouts ronds dessine un point
    valeur(V.NR, t, g0 + 0.2); leve(V.S, t, g0 + 0.34, 16);
    monte(V.K1, t, g0 + 0.36, 0.012, 0.4); monte(V.K2, t, g0 + 0.42, 0.012, 0.4);
    V.TL.forEach((L, j) => monte(L, t, tTi + j * 0.14, 0.04, 0.5));
    leveMots(V.TXM, t, tTx, 0.024); leve(V.FA, t, tTx + 0.32);
  };
  const VR = verdict(S5, { col: '#ff6b6b', note: 23, fs: 210, titre: ['À éviter'], texte: "Même bien négociée, elle ne laisse pas votre minimum de 750 € (il faudrait l'acheter 3 750 € au plus).", faire: "Passez à l'annonce suivante." });
  const tC = [w(22) - 0.35, w(24) - 0.2, w(26) - 0.2], tVer = w(30) - 0.3, tV = tVer + 0.3, tEv = w(31) - 0.04, tFlipA = WD[32].e + 0.3;
  const DW = 0.52, tWh = [tC[1] - 0.26, tC[2] - 0.26];
  const filP = (t) => tWh.reduce((s, t0) => s + E(t, t0, DW, lisse), 0);
  const filV = (t) => tWh.reduce((s, t0) => { const u = (t - t0) / DW; return s + (u > 0 && u < 1 ? 6 * u * (1 - u) / DW : 0); }, 0);
  const VTK = [[tEv, VR.TL[0][0]._x], [WD[32].e, VR.TL[0][VR.TL[0].length - 1]._x + VR.TL[0][VR.TL[0].length - 1]._w]];   // la lueur suit « À éviter »
  ph([[['la', 22], ['cote,', 23, 'k']]], { y: 236, size: 136, out: w(24) - 0.22 });
  ph([[['les', 24], ['travaux,', 25, 'k']]], { y: 236, size: 136, out: w(26) - 0.22 });
  ph([[['ta', 26], ['marge…', 27, 'k']]], { y: 236, size: 136, out: w(28) - 0.22 });
  ph([[['et', 28], ['le', 29], ['verdict.', 30, 'k']]], { y: 236, size: 136, out: w(31) - 0.24 });
  cue(tC[0], 'whoosh', 0.4); tWh.forEach((t0) => cue(t0, 'whoosh', 0.9)); tC.forEach((t0, i) => { cue(t0 + (i ? 0.2 : 0.3), 'key', 0.5); cue(t0 + (i ? 0.5 : 0.6), 'tick', 0.4); });
  cue(tVer, 'whoosh', 0.6); cue(tV + 0.2, 'key', 0.5); cue(tV + 0.7, 'pop', 0.5); cue(tEv, 'impact', 1.2); cue(tFlipA, 'whoosh', 0.9);
  tWh.forEach((t0) => win(t0, t0 + DW)); win(tEv - 0.02, tEv + 0.25); win(tFlipA - 0.02, tFlipA + 0.45);
  function paintS5(t) {
    if (!show(S5.root, t >= tC[0] - 0.02 && t < tFlipA + 0.45)) return;
    const shake = bump(t, tEv, 0.12), D = derive(t);
    let arc = 0; tWh.forEach((t0) => { const u = (t - t0) / DW; if (u > 0 && u < 1) arc += Math.sin(Math.PI * u); });
    camera(S5, { cx: 540 + GAP * filP(t) + D.dx + 6 * shake * Math.sin((t - tEv) * 90), cy: 960 + D.dy, cz: D.cz - 160 * arc + 70 * pousse(t), rx: D.rx, ry: D.ry + 9 * arc, rz: D.rz + 1.2 * shake * Math.sin((t - tEv) * 70) });
    S5.fs = Math.min(60, 0.5 * GAP * filV(t) / 30);
    const dv = E(t, tVer - 0.08, 0.5, doux);   // le dernier critère recule quand le verdict naît
    CRIT.forEach((C, i) => {
      const vis = Math.abs(S5.cp.cx - (540 + C.X0)) < 1750 && (i < 2 || dv < 0.999); if (!C.B.vis(vis)) return;
      const rec = i === 2 ? dv : 0;
      C.B.pose(540 + C.X0, 960 + 40 * rec, -520 * rec);
      C.B.fx((1 - E(rec, 0.45, 0.5, lin)).toFixed(3), rec > 0.01 ? `blur(${(12 * rec).toFixed(1)}px) brightness(${(1 - 0.5 * rec).toFixed(3)})` : '');
      // le premier critère naît du trait de l'anneau couché ; les suivants ont libellé et barre en place quand la
      // caméra arrive, la valeur monte quand elle se pose
      const tL = i ? tWh[i - 1] + 0.04 : tC[0] + 0.12, tv = i ? tC[i] + 0.2 : tC[0] + 0.3;
      monte(C.L, t, tL, 0.03);
      if (i) { C.PS.style.transform = `scaleX(${E(t, tWh[i - 1] + 0.1, 0.5, eOut3).toFixed(4)})`; C.PS.style.background = 'rgba(244,241,236,.1)'; }
      else { const b = E(t, tC[0] + 0.02, 0.4); C.PS.style.opacity = t >= tC[0] ? '1' : '0'; C.PS.style.background = `rgba(${lerp(255, 244, b) | 0},${lerp(138, 241, b) | 0},${lerp(76, 236, b) | 0},${lerp(0.95, 0.1, b).toFixed(3)})`; }
      valeur(C.V, t, tv);
      remplit(C.F, t, tv + 0.3, C.pct, 0.6);
      leveMots(C.SM, t, tv + 0.42, 0.035);
    });
    // le verdict : naît à la place du dernier critère, se construit pendant le silence après « verdict »
    const on = t >= tVer - 0.02; VR.B.vis(on);
    if (on) {
      VR.B.pose(540 + 2 * GAP, 960, 0);
      batit(VR, t, { g0: tV, tArc: tV + 0.15, tTi: tV + 0.62, tTx: tV + 0.95 });
      // « À éviter. » : le titre s'allume au rythme de la voix, l'anneau bat (aucun texte en plus)
      allumeLigne(VR.TL[0], VTK, t, hx('#ff6b6b'), [255, 90, 90], VR.fs);
      const pul = t >= tEv ? E(t, tEv, 0.12) * (1 - E(t, tEv + 0.15, 0.5)) : 0;
      VR.arc.setAttribute('stroke-width', (9 + 5 * pul).toFixed(2));
      VR.ring.style.transform = `scale(${(1 + 0.08 * bump(t, tEv, 0.14)).toFixed(4)})`;
      // le tambour : chaque pièce bascule en arrière, de haut en bas ; flou de rotation (rien de dédoublé)
      VR.P.forEach((P, i) => {
        if (i === 0 && t < tFlipA) return;
        const f = E(t, tFlipA + i * 0.045, 0.22, eIn2);
        if (i) P.style.transform = `rotateX(${(90 * f).toFixed(2)}deg)`;
        else P.style.transform = `rotateX(${(90 * f).toFixed(2)}deg) scale(${(1 + 0.08 * bump(t, tEv, 0.14)).toFixed(4)})`;
        P.style.filter = f > 0.01 ? `blur(${(10 * f).toFixed(1)}px)` : '';
        P.style.opacity = (1 - E(f, 0.6, 0.4, lin)).toFixed(3);
      });
    }
    FLASH.style.opacity = Math.max(+FLASH.style.opacity || 0, 0.7 * bump(t, tEv, 0.1)).toFixed(3);
    fx(S5);
  }

  // =====================================================================================================
  // S6 · « Une bonne affaire ? » : les pièces du verdict finissent de tourner : au dos, le verdict vert de la Clio
  //      (vrai rapport : 97 sur 100, « Très bonne affaire »). « Ton prix d'offre… » : le verdict recule, les paliers
  //      de l'offre naissent, sans carte (libellé, prix géant, filet) : Ouverture 6 650 €, Objectif 6 900 € ; « et le
  //      plafond » : une bande rouge plein cadre PLAFOND 7 100 € tombe de devant la caméra et s'écrase au-dessus ;
  //      « à ne pas dépasser » : l'objectif monte buter contre elle.
  // =====================================================================================================
  const S6 = scene(1200);
  const VG = verdict(S6, { col: '#3ecb7f', note: 97, fs: 160, titre: ['Très bonne', 'affaire'], texte: 'Il vous resterait environ 1 450 €, au-dessus de votre minimum, sur un marché qui se vend bien.', faire: 'Écrivez au vendeur maintenant.' });
  // les paliers de l'offre (bloc « Votre offre » du rapport de la Clio) : le plus cher le plus haut ; un bloc par
  // palier (l'objectif monte d'une pièce buter contre le plafond, libellé compris)
  const ECH = [['Ouverture', 6650, 'après la visite', 1166], ['Objectif', 6900, 'prix à viser', 872]].map(([lab, v, sub, y0]) => {
    const B = bloc(S6);
    const L = lettres(B.add(160, y0, 60, { font: '500 54px Satoshi', color: 'rgba(244,241,236,.82)' }, lab));
    const Sb = B.add(0, y0 + 8, 30, { font: '500 42px Satoshi', color: 'rgba(244,241,236,.5)' }, sub); B.droite(Sb, 900);
    const Vp = B.add(150, y0 + 58, 0, { font: '600 180px/1.08 Clash', letterSpacing: '-.04em', color: '#f4f1ec' }, nb(eur(v)));
    return { B, L, S: Sb, V: lettres(Vp), F: filetB(B, 160, y0 + 270, -30, 760, 'rgba(244,241,236,.2)') };
  });
  const YB = 730, BW = 1600;
  const BAR = obj(S6.cam, BW, 190, { background: 'linear-gradient(180deg,#ff5d5d,#d02a2a)', boxShadow: '0 40px 90px -30px rgba(208,42,42,.85), inset 0 2px 0 rgba(255,200,200,.5)' });
  const BARl = mk('div', 'a nw', BAR, { left: (180 + (BW - 1080) / 2) + 'px', top: '0', height: '190px', font: '700 80px/190px Clash', letterSpacing: '.1em', color: '#fff' }, 'PLAFOND');
  const BARv = mk('div', 'a nw', BAR, { right: (180 + (BW - 1080) / 2) + 'px', left: 'auto', top: '0', height: '190px', font: '600 112px/190px Clash', letterSpacing: '-.03em', color: '#fff' }, nb('7 100 €'));
  { const wl = largeur(BARl), wv = largeur(BARv); if (wl + wv > 680) { const k = 680 / (wl + wv); BARl.style.fontSize = (80 * k).toFixed(1) + 'px'; BARv.style.fontSize = (112 * k).toFixed(1) + 'px'; } }
  const BARf = mk('div', 'a', BAR, { left: '0', top: '0', width: '100%', height: '100%', background: '#fff', opacity: 0, pointerEvents: 'none' });
  const tFlipB = tFlipA + 0.24, tGout = w(37) - 0.2, tOff = w(38) - 0.12, tObj = w(40) - 0.1, tPla = w(43) - 0.2, tImp = tPla + 0.2, tDep = w(47) + 0.02, tS6out = WD[47].e + 0.22;
  // la caméra ne s'arrête jamais : pendant chaque tenue elle pousse lentement vers le bloc, et revient pendant la
  // transition suivante (filé, recul, retournement) ; commune à S5 et S6 (le tambour se raccorde image pour image)
  const TENUES = [[tC[0], tWh[0]], [tWh[0] + DW, tWh[1]], [tWh[1] + DW, tVer - 0.08], [tVer, tFlipA], [tFlipB, tGout], [tGout, tS6out]];
  const pousse = (t) => TENUES.reduce((s, [a, b]) => s + E(t, a, b - a, lin) * (1 - E(t, b, 0.5, lisse)), 0);
  // la lueur suit « bonne » puis « affaire »
  const GTK = [[[w(34) - 0.04, VG.TL[0][5]._x], [WD[34].e, VG.TL[0][VG.TL[0].length - 1]._x + VG.TL[0][VG.TL[0].length - 1]._w]], [[w(35) - 0.02, VG.TL[1][0]._x], [WD[35].e, VG.TL[1][VG.TL[1].length - 1]._x + VG.TL[1][VG.TL[1].length - 1]._w]]];
  ph([[['Une', 33], ['bonne', 34, 'g']], [['affaire ?', 35, 'g']]], { y: 236, size: 128, out: w(37) - 0.22 });
  ph([[['Ton', 37], ['prix', 38, 'k']], [["d'offre…", 39, 'k']]], { y: 236, size: 128, out: w(41) - 0.22 });
  ph([[['et', 41], ['le', 42]], [['plafond', 43, 'r']]], { y: 236, size: 128, out: w(44) - 0.16 });
  ph([[['à', 44], ['ne', 45], ['pas', 46]], [['dépasser.', 47, 'r']]], { y: 236, size: 128, out: tS6out + 0.2 });
  cue(tFlipB, 'whoosh', 0.5); cue(tFlipB + 0.3, 'key', 0.5); cue(tFlipB + 1.0, 'ding', 0.7); cue(tGout, 'whoosh', 0.5); [tOff, tObj].forEach((t0) => { cue(t0, 'pop', 0.5); cue(t0 + 0.3, 'key', 0.5); }); cue(tPla, 'whoosh', 0.8); cue(tImp, 'impact', 1.3); cue(tDep, 'thud', 0.9); cue(tS6out, 'whoosh', 0.6);
  win(tFlipB - 0.02, tFlipB + 0.5); win(tPla - 0.02, tImp + 0.2); win(tDep - 0.02, tDep + 0.2);
  function paintS6(t) {
    if (!show(S6.root, t >= tFlipB - 0.01 && t < tS6out + 0.62)) return;
    const shake = bump(t, tImp, 0.12) + 0.5 * bump(t, tDep + 0.06, 0.1), D = derive(t);
    camera(S6, { cx: 540 + D.dx + 8 * shake * Math.sin((t - tImp) * 90), cy: 960 + D.dy, cz: D.cz + 70 * pousse(t), rx: D.rx, ry: D.ry, rz: D.rz + 1.2 * shake * Math.sin((t - tImp) * 70) });
    // le verdict vert : chaque pièce arrive en tournant (dos des pièces rouges), se construit avec la voix, puis
    // recule et se floute
    const go = E(t, tGout, 0.6, doux);
    if (VG.B.vis(go < 0.999)) {
      VG.B.pose(540, 960 - 60 * go, -620 * go);
      VG.P.forEach((P, i) => {
        const t0 = tFlipB + i * 0.045, f = Math.min(1, SP(t, t0, 'default')), rb = t >= t0 ? 9 * Math.max(0, 1 - f * 1.15) : 0, bl = rb + 10 * go;
        P.style.visibility = t >= t0 ? 'visible' : 'hidden';
        P.style.transform = `rotateX(${(-90 * (1 - f)).toFixed(2)}deg)`;
        P.style.filter = bl > 0.1 || go > 0.01 ? `blur(${bl.toFixed(1)}px) brightness(${(1 - 0.55 * go).toFixed(3)})` : '';
        P.style.opacity = (Math.min(1, f * 3) * (1 - E(go, 0.5, 0.5, lin))).toFixed(3);
      });
      // le dos est déjà imprimé (anneau, note, surtitre, titre) : seul l'arc se remplit, puis l'explication monte
      batit(VG, t, { g0: tFlipB - 2, tArc: tFlipB + 0.3, tTi: tFlipB - 2, tTx: WD[35].e - 0.1 });
      GTK.forEach((K, j) => allumeLigne(VG.TL[j], K, t, hx('#3ecb7f'), [62, 203, 127], VG.fs));
    }
    // paliers : libellé lettre à lettre, mention, prix qui monte, filet tracé ; « à ne pas dépasser » : l'objectif
    // monte buter contre le plafond (son libellé touche la bande) et retombe
    ECH.forEach((P, i) => {
      const t0 = [tOff, tObj][i];
      if (!P.B.vis(t >= t0 - 0.02)) return;
      P.B.pose(540, 960 + (i === 1 ? -36 * bump(t, tDep, 0.2) + 10 * bump(t, tImp, 0.1) : 0), 0);
      monte(P.L, t, t0 + 0.04, 0.03); leve(P.S, t, t0 + 0.16, 14); valeur(P.V, t, t0 + 0.18); trait(P.F, t, t0 + 0.1, 0.6);
    });
    // PLAFOND : la bande plein cadre tombe de devant la caméra, s'écrase (aplatie un instant), tient
    const fall = E(t, tPla, tImp - tPla, eIn2), hit = bump(t, tImp, 0.1);
    show(BAR, t >= tPla - 0.01);
    put(BAR, 540, YB - 16 * bump(t, tDep + 0.04, 0.12), 420 * (1 - fall), { sx: 1 + 0.03 * hit, sy: 1 - 0.16 * hit, o: Math.min(1, E(t, tPla, 0.08, lin) * 1.2), f: t < tImp && fall > 0.02 ? `blur(${(7 * fall).toFixed(1)}px)` : '' });   // flou de chute
    BARf.style.opacity = (0.55 * bump(t, tImp, 0.08) + 0.35 * bump(t, tDep + 0.05, 0.1)).toFixed(3);
    FLASH.style.opacity = Math.max(+FLASH.style.opacity || 0, 0.55 * bump(t, tImp, 0.1)).toFixed(3);
    recul(S6, t, tS6out, 0.62);
  }

  // =====================================================================================================
  // S7 · « Et pour les trouver, arrête de scroller. » : un iris doux (bord fondu, aucun cadre) s'ouvre au centre sur le
  //      MUR d'annonces incliné, sans cartes : modèle, kilométrage, prix géant, écart en vert, des filets entre les
  //      rangées ; sur « arrête », le mur accélère (flou directionnel le long du défilement) ; sur « scroller », il
  //      s'arrête NET ; la meilleure annonce sort du mur vers la caméra, soulignée d'un trait vert.
  // =====================================================================================================
  const S7 = scene(1100);
  S7.root.style.background = '#0b0a09';
  const MUR = obj(S7.cam, 1560, 9000, {});
  const MW = 500, MH = 340, MG = 30;
  function mini(parent, it, x, y) {
    const c = mk('div', 'a', parent, { left: x + 'px', top: y + 'px', width: MW + 'px', height: MH + 'px' });
    mk('div', 'a nw', c, { left: '20px', top: '26px', width: (MW - 40) + 'px', overflow: 'hidden', textOverflow: 'ellipsis', font: '700 38px Satoshi', color: '#f4f1ec' }, it[0].replace('Renault ', ''));
    mk('div', 'a nw', c, { left: '20px', top: '80px', width: (MW - 40) + 'px', overflow: 'hidden', textOverflow: 'ellipsis', font: '500 28px Satoshi', color: 'rgba(244,241,236,.55)' }, nb(it[1].split(' · ').slice(0, 2).join(' · ')));
    mk('div', 'a nw', c, { left: '16px', top: '124px', font: '600 104px/1.08 Clash', letterSpacing: '-.035em', color: '#f4f1ec' }, nb(it[3]));
    mk('div', 'a nw', c, { left: '20px', top: '262px', font: '700 38px Satoshi', color: '#3ecb7f' }, nb(it[5]));
    return c;
  }
  const NROW = 24, ROWH = MH + MG;
  for (let r = 0; r < NROW; r++) {
    for (let col = 0; col < 3; col++) mini(MUR, LISTE[((r % 12) * 3 + col + 4) % LISTE.length], col * (MW + MG), r * ROWH);
    mk('div', 'a', MUR, { left: '0', top: (r * ROWH + MH + MG / 2 - 1) + 'px', width: '1560px', height: '2px', background: 'rgba(244,241,236,.1)' });
  }
  S7.fid = 'file7'; S7.fl = filtre('file7', 2); S7.fd = 'y';
  const VFG = filtre('vflou', 4);
  // derrière la meilleure annonce, le mur s'assombrit en douceur (une ombre ronde, sans bord) : aucun texte du mur ne
  // reste lisible sous les siens
  const OMBRE = obj(S7.cam, 1500, 1100, { background: 'radial-gradient(closest-side, rgba(11,10,9,.94), rgba(11,10,9,.82) 50%, rgba(11,10,9,0))' });
  const BEST = obj(S7.cam, MW, MH, { transformStyle: 'flat' }); const BESTc = mini(BEST, LISTE[0], 0, 0);
  const [BTi, BSu, BPr, BBa] = [...BESTc.children];
  const BTTL = lettres(BTi), BPR = lettres(BPr);
  BBa.style.transformOrigin = '20% 50%';
  const BLIS = mk('div', 'a', BESTc, { left: '20px', top: '322px', width: (MW - 40) + 'px', height: '6px', borderRadius: '3px', background: '#3ecb7f', transformOrigin: '0 50%', transform: 'scaleX(0)' });
  const SCRIM = mk('div', 'lay', S7.root, { background: 'linear-gradient(180deg, rgba(11,10,9,.97) 0%, rgba(11,10,9,.96) 30%, rgba(11,10,9,.6) 37%, rgba(11,10,9,0) 45%)', pointerEvents: 'none' });
  const tL0 = w(48) - 0.5, tScr = w(52) - 0.1, tStop = w(54) + 0.06, tPop = tStop + 0.08, tS7out = w(55) - 0.32;
  ph([[['Et', 48], ['pour', 49], ['les', 50]], [['trouver,', 51]]], { y: 236, size: 124, out: w(52) - 0.22 });
  ph([[['arrête', 52, 'k'], ['de', 53, 'k']], [['scroller.', 54, 'k']]], { y: 236, size: 150, out: tS7out + 0.1 });
  cue(tL0, 'whoosh', 0.8); cue(tL0 + 0.2, 'pop', 0.5); cue(tScr, 'riser', 1); cue(tStop - 0.02, 'tapestop', 1); cue(tStop, 'thud', 1.1); cue(tPop, 'pop', 0.9); cue(tPop + 0.32, 'key', 0.5); cue(tPop + 0.62, 'pop', 0.7);
  win(tL0 - 0.02, tL0 + 1.0); win(tScr, tStop + 0.06); win(tPop - 0.02, tPop + 0.35);
  const MURY0 = 7 * ROWH, DERIVE = 70, COURSE = 3200;
  const TSC = tStop - tScr;
  function defile(t) {   // distance parcourue : dérive lente, accélération, arrêt net (petit rebond amorti)
    if (t < tScr) return DERIVE * Math.max(0, t - tL0);
    const base = DERIVE * (tScr - tL0);
    if (t < tStop) { const u = (t - tScr) / TSC; return base + DERIVE * (t - tScr) + COURSE * Math.pow(u, 2.4); }
    const u = t - tStop; return base + DERIVE * TSC + COURSE + 26 * Math.sin(Math.PI * clamp(u / 0.24, 0, 1)) * Math.exp(-u * 5);
  }
  const vitesse = (t) => (t < tL0 || t >= tStop ? 0 : t < tScr ? DERIVE : DERIVE + COURSE * 2.4 * Math.pow((t - tScr) / TSC, 1.4) / TSC);
  function paintS7(t) {
    if (!show(S7.root, t >= tL0 && t < tS7out + 0.62)) return;
    // l'iris : un disque au bord fondu qui s'ouvre jusqu'au plein écran (aucun contour)
    const o = E(t, tL0, 1.0, lisse), R = 60 + 2300 * o;
    const msk = o >= 0.999 ? '' : `radial-gradient(circle at 540px 1000px, #000 ${Math.max(0, R - 320).toFixed(0)}px, rgba(0,0,0,0) ${R.toFixed(0)}px)`;
    S7.root.style.maskImage = msk; S7.root.style.webkitMaskImage = msk;
    const sp = t > tScr && t < tStop ? Math.pow((t - tScr) / TSC, 1.2) : 0;
    camera(S7, { cx: 540, cy: 1000, cz: lerp(-320, 0, E(t, tL0, 1.1, doux)) + 100 * sp, rx: 30 + 4 * sp, ry: -5 + 3 * Math.sin(t * 0.6), rz: -12 + 3 * sp + 2 * Math.sin(t * 0.4) });
    const dy = defile(t);
    put(MUR, 540, 1000 + 4500 - MURY0 - dy % (12 * ROWH), -200, {});
    // flou le long du défilement : la moitié du chemin parcouru pendant une image (comble les sous-images)
    // le mur arrive flou et se met au point pendant que l'iris s'ouvre (au bord fondu de l'iris, rien de net ne
    // croise les paliers qui reculent) ; à l'arrêt, la mise au point passe sur la meilleure annonce
    const sig = Math.min(60, vitesse(t) / 30 * 0.5), foc = E(t, tStop + 0.05, 0.4), mise = 16 * (1 - E(t, tL0 + 0.2, 0.75, doux));
    const fm = [];
    if (sig > 0.6) { VFG.setAttribute('stdDeviation', `0 ${sig.toFixed(1)}`); fm.push('url(#vflou)'); }
    const blm = mise + 11 * foc; if (blm > 0.05) fm.push(`blur(${blm.toFixed(2)}px)`);
    if (foc > 0.01) fm.push(`brightness(${(1 - 0.62 * foc).toFixed(3)})`);
    MUR.style.filter = fm.join(' ');
    // la meilleure annonce sort du mur vers la caméra et se construit ; un trait vert la souligne
    const k = SP(t, tPop, 'default'), kk = Math.min(1, k);
    show(BEST, t >= tPop - 0.02); show(OMBRE, t >= tPop - 0.02);
    putFace(S7, OMBRE, 540, 1100, 40, 1, [540, 1100, 40], { o: 0.95 * Math.min(1, E(t, tPop - 0.02, 0.3)) });
    putFace(S7, BEST, 540, 1090, 240, k, [540, 1060, -190], { s: 1 + 0.4 * kk, rz: -3 * (1 - kk) + 1.2 * Math.sin(t * 1.2) });
    monte(BTTL, t, tPop + 0.12, 0.02); leve(BSu, t, tPop + 0.26, 14); valeur(BPR, t, tPop + 0.3);
    jaillit(BBa, t, tPop + 0.62, 0.4);
    BLIS.style.transform = `scaleX(${E(t, tPop + 0.5, 0.5, eOut3).toFixed(4)})`;
    recul(S7, t, tS7out, 0.62);
  }

  // =====================================================================================================
  // S8 · « Ta recherche tourne toute seule. » : la recherche enregistrée, sans carte (vrais chiffres de l'app), flotte
  //      au-dessus d'un RADAR couché au sol, en perspective : son faisceau balaie, les annonces s'allument au passage
  //      (en vert celles sous la cote) ; sur « tourne », l'interrupteur « Alerte e-mail » s'allume et le faisceau
  //      accélère.
  // =====================================================================================================
  const S8 = scene(1300);
  const RSB = bloc(S8);
  const fs8 = (() => { const m = mk('span', 'a nw', ST, { font: '600 130px Clash', letterSpacing: '-.035em', visibility: 'hidden' }, 'Renault Clio 4'); const v = Math.min(130, Math.floor(130 * 796 / largeur(m))); m.remove(); return v; })();
  const RSt = lettres(RSB.add(134, 624, 90, { font: `600 ${fs8}px/1.08 Clash`, letterSpacing: '-.035em', color: '#f4f1ec' }, 'Renault Clio 4'));
  const ACT = RSB.add(140, 792, 50, { font: '700 42px Satoshi', color: '#3ecb7f', padding: '0 0 0 40px', transformOrigin: '10% 50%' }, 'Active');
  const ACTd = mk('div', 'a', ACT, { left: '2px', top: '16px', width: '22px', height: '22px', borderRadius: '50%', background: '#3ecb7f' });
  const RSsub = RSB.add(140 + largeur(ACT) + 26, 792, 50, { font: '500 42px Satoshi', color: 'rgba(244,241,236,.6)' }, '· il y a 1 min · diesel');
  const RS1 = RSB.add(140, 862, 20, { font: '500 48px Satoshi', color: 'rgba(244,241,236,.92)' }, nb('220 annonces · 22 sous la cote'));
  const RS2 = RSB.add(140, 930, 20, { font: '500 44px Satoshi', color: '#3ecb7f' }, nb('meilleure : 7 650 € (23 % sous la cote)'));
  const OUV = RSB.add(140, 1018, 60, { width: '210px', height: '100px', borderRadius: '999px', background: '#ff5a1f', color: '#160904', font: '600 44px/100px Clash', textAlign: 'center', boxShadow: '0 20px 60px -24px rgba(255,90,31,.85)' }, 'Ouvrir', 'a nw');
  const SW = RSB.add(392, 1018, 60, { width: '560px', height: '100px' }, '', 'a');
  const SWR = mk('div', 'a', SW, { left: '0', top: '20px', width: '108px', height: '60px', borderRadius: '999px', background: 'rgba(244,241,236,.18)' });
  const SWK = mk('div', 'a', SWR, { left: '6px', top: '6px', width: '48px', height: '48px', borderRadius: '50%', background: '#f4f1ec', boxShadow: '0 2px 6px rgba(0,0,0,.4)' });
  const SWL = lettres(mk('div', 'a nw', SW, { left: '132px', top: '20px', font: '600 50px/1.2 Clash', color: '#f4f1ec' }, 'Alerte e-mail'));
  // le radar : une plaque couchée au sol (cercles, croix, faisceau, annonces)
  const RR = 840;
  const RADR = obj(S8.cam, 2 * RR, 2 * RR, {});
  RADR.innerHTML = `<svg viewBox="${-RR} ${-RR} ${2 * RR} ${2 * RR}" width="${2 * RR}" height="${2 * RR}" style="position:absolute;left:0;top:0;overflow:visible">
    ${[280, 560, 840].map((r) => `<circle class="cr" r="${r}" fill="none" stroke="rgba(244,241,236,.24)" stroke-width="5"/>`).join('')}
    <line class="cr" x1="${-RR}" y1="0" x2="${RR}" y2="0" stroke="rgba(244,241,236,.13)" stroke-width="4"/><line class="cr" x1="0" y1="${-RR}" x2="0" y2="${RR}" stroke="rgba(244,241,236,.13)" stroke-width="4"/></svg>`;
  const RCR = [...RADR.querySelectorAll('.cr')];
  const SWEEP = mk('div', 'a', RADR, { left: '0', top: '0', width: 2 * RR + 'px', height: 2 * RR + 'px', borderRadius: '50%' });
  const BEAM = mk('div', 'a', RADR, { left: RR + 'px', top: (RR - 3) + 'px', width: RR + 'px', height: '6px', borderRadius: '3px', background: 'linear-gradient(90deg, rgba(255,214,190,.95), rgba(255,138,76,.25))', transformOrigin: '0 50%' });
  const DOTS = Array.from({ length: 64 }, (_, i) => {
    const r = 120 + 700 * Math.sqrt(hash(i)), a = 360 * hash(i + 100), vert = i % 6 === 0;
    const d = mk('div', 'a', RADR, { left: (RR + r * Math.sin(a * RAD) - 14) + 'px', top: (RR - r * Math.cos(a * RAD) - 14) + 'px', width: '28px', height: '28px', borderRadius: '50%', background: vert ? '#3ecb7f' : 'rgba(244,241,236,.75)', boxShadow: vert ? '0 0 0 10px rgba(62,203,127,.22)' : '' });
    return { d, a, vert };
  });
  const tS0 = w(55) - 0.3, tSw = w(57) - 0.05, tS8out = w(60) - 0.3;
  // angle du faisceau (degrés, depuis midi, sens horaire) : il tourne doucement, accélère sur « tourne »
  const angle = (t) => { const u = Math.max(0, t - tS0 - 0.3); const v = Math.max(0, t - tSw); return 80 * u + 170 * v * v / (v + 0.6); };
  ph([[['Ta', 55], ['recherche', 56]], [['tourne', 57, 'k'], ['toute', 58, 'k']], [['seule.', 59, 'k']]], { y: 236, size: 112, out: tS8out + 0.1 });
  cue(tS0, 'whoosh', 0.6); cue(tS0 + 0.1, 'pop', 0.6); cue(tS0 + 0.42, 'pop', 0.5); cue(tSw, 'click', 1); cue(tSw + 0.06, 'ding', 0.6); cue(tSw + 0.5, 'pop', 0.6); cue(WD[59].e - 0.1, 'whoosh', 0.5);
  function paintS8(t) {
    if (!show(S8.root, t >= tS0 && t < tS8out + 0.62)) return;
    const sw = E(t, tSw, 0.3, eOut3), dolly = E(t, tS0, 1.3, doux);
    camera(S8, { cx: 540 + 10 * Math.sin(t * 0.5), cy: 960, cz: lerp(-320, 0, dolly), rx: lerp(-10, 0, dolly) + 2 * Math.sin(t * 0.7), ry: 4 * Math.sin(t * 0.45) });
    RSB.pose(540, 960, 0, { ry: -3 + 2 * Math.sin(t * 0.8) });
    monte(RSt, t, tS0 + 0.16, 0.025);
    jaillit(ACT, t, tS0 + 0.42, 0.4); leve(RSsub, t, tS0 + 0.5, 16);
    leve(RS1, t, tS0 + 0.58, 18);
    leve(SW, t, tS0 + 0.66, 30, 0.35); monte(SWL, t, tS0 + 0.72, 0.015, 0.35);
    leve(RS2, t, tSw + 0.32, 18);
    jaillit(OUV, t, tSw + 0.5, 0.5);
    SWK.style.transform = `translateX(${(48 * sw).toFixed(1)}px)`; SWR.style.background = sw > 0 ? `rgba(255,90,31,${(0.2 + 0.8 * sw).toFixed(3)})` : 'rgba(244,241,236,.18)';
    const pg = ((t - tS0) * 1.2) % 1;
    ACTd.style.boxShadow = `0 0 0 ${(14 * pg).toFixed(1)}px rgba(62,203,127,${(0.5 * (1 - pg)).toFixed(2)})`;
    // le radar au sol : il s'ouvre depuis son centre, le faisceau balaie, les annonces s'allument à son passage
    const ro = E(t, tS0 + 0.2, 0.8, eOut3);
    put(RADR, 540, 1560, -260, { rx: 76, s: 0.3 + 0.7 * ro, o: Math.min(1, ro * 1.5) });
    const A = angle(t), on = t >= tS0 + 0.3;
    SWEEP.style.background = on ? `conic-gradient(from ${(A - 70).toFixed(1)}deg, rgba(255,138,76,0) 0deg, rgba(255,138,76,.26) 68deg, rgba(255,190,150,.5) 70deg, rgba(255,138,76,0) 70.5deg)` : 'none';
    BEAM.style.transform = `rotate(${(A - 90).toFixed(1)}deg)`; show(BEAM, on);
    DOTS.forEach((D) => {
      const da = A - D.a, n = da >= 0 && on ? Math.floor(da / 360) : -1, since = da - 360 * Math.max(0, n);
      const g = n >= 0 ? Math.exp(-since / (D.vert ? 300 : 150)) : 0;
      D.d.style.opacity = (n >= 0 ? (D.vert ? 0.35 + 0.65 * g : 0.12 + 0.88 * g) : 0).toFixed(3);
      D.d.style.transform = `scale(${(1 + 0.8 * Math.exp(-since / 40) * (n >= 0 ? 1 : 0)).toFixed(3)})`;
    });
    recul(S8, t, tS8out, 0.62);
  }

  // =====================================================================================================
  // S9 · « Toi, tu dors. » : la nuit tombe, horloge à volets 01:14 (volets sans contour). « Lui, il bosse. » : l'horloge
  //      monte, la liste des messages de la nuit se remplit, un à la fois (le nouveau entre en haut, les autres
  //      descendent d'une ligne : aucun ne passe sur un autre), sans carte : modèle, prix et heure, « Envoyé » coché en
  //      vert, un filet sous chaque ligne (option Messages, Benef Pro) ; l'horloge tombe sur l'heure de chaque message.
  // =====================================================================================================
  const S9 = scene(1200);
  const FLIP = obj(S9.cam, 1000, 380, { transformStyle: 'preserve-3d' });
  const moitie = (parent, bas, chiffre) => {
    const h = mk('div', 'a', parent, { left: '0', top: bas ? '145px' : '0', width: '185px', height: '145px', overflow: 'hidden', borderRadius: bas ? '0 0 30px 30px' : '30px 30px 0 0', background: bas ? 'linear-gradient(180deg,#0c1020,#121730)' : 'linear-gradient(180deg,#1c2340,#141a30)', transformOrigin: bas ? '50% 0' : '50% 100%', backfaceVisibility: 'hidden' });
    const n = mk('div', 'a nw num', h, { left: '0', top: (bas ? -145 + 18 : 18) + 'px', width: '185px', textAlign: 'center', font: '600 236px/1 Clash', letterSpacing: '-.04em', color: '#e4e9ff' }, chiffre);
    return { h, n };
  };
  const DIG = [0, 1, 2, 3].map((i) => {
    const d = mk('div', 'a', FLIP, { left: (i < 2 ? 70 + i * 200 : 530 + (i - 2) * 200) + 'px', top: '20px', width: '185px', height: '290px', borderRadius: '30px', transformStyle: 'preserve-3d' });
    const D = { d, haut: moitie(d, false, '0'), bas: moitie(d, true, '0'), vH: moitie(d, false, '0'), vB: moitie(d, true, '0') };
    mk('div', 'a', d, { left: '0', top: '143px', width: '185px', height: '4px', background: 'rgba(5,7,16,.9)' });
    return D;
  });
  const COLON = mk('div', 'a nw', FLIP, { left: '458px', top: '24px', font: '600 220px/1 Clash', color: '#a9b8ff' }, ':');
  const ZZ = [0, 1, 2].map((i) => mk('div', 'a nw', S9.cam, { font: `600 ${90 + i * 36}px Clash`, color: '#a9b8ff' }, 'z'));
  const ENV = [['Clio IV 1.5 dCi 90 Trend', '4 750 €', '01:14'], ['Clio IV 1.5 dCi 75 Intens', '5 750 €', '01:16'], ['Clio IV 1.5 dCi 75 Business', '6 000 €', '02:41'], ['Clio IV 1.5 dCi 75 Business', '6 450 €', '03:12'], ['Clio IV 1.5 dCi 90 Zen', '6 650 €', '04:37']];
  const MW9 = 800, MH9 = 140;
  const MSG = ENV.map(([m, p, h]) => {
    const c = obj(S9.cam, MW9, MH9, {});
    const T = mk('div', 'a nw', c, { left: '0', top: '6px', font: '700 50px Satoshi', color: '#f4f1ec' }, 'Renault ' + m);
    const D = mk('div', 'a nw', c, { left: '0', top: '72px', font: '500 38px Satoshi', color: 'rgba(223,229,255,.62)' }, nb(`${p} · 14 oct., ${h}`));
    const S = mk('div', 'a nw', c, { right: '0', left: 'auto', top: '74px', font: '700 40px Satoshi', color: '#3ecb7f', padding: '0 52px 0 0', transformOrigin: '80% 50%' }, 'Envoyé');
    S.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" width="40" height="40" style="position:absolute;right:0;top:4px"><path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke="#3ecb7f" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0 24"/></svg>');
    // « Envoyé » sur la ligne du prix : le modèle a toute la largeur ; le détail ne passe jamais sous « Envoyé »
    { const wT = largeur(T); if (wT > MW9 - 30) T.style.fontSize = (50 * (MW9 - 30) / wT).toFixed(1) + 'px'; const wS = largeur(S), wD = largeur(D), mx = MW9 - wS - 28; if (wD > mx) D.style.fontSize = (38 * mx / wD).toFixed(1) + 'px'; }
    return { c, T, D, S, K: S.querySelector('path'), F: filet(c, 0, MH9 - 6, MW9, 'rgba(169,184,255,.22)', 2) };
  });
  const PRO = obj(S9.cam, 10, 84, { borderRadius: '999px', background: '#ff5a1f', font: '700 38px/84px Satoshi', color: '#160904', textAlign: 'center', whiteSpace: 'nowrap', padding: '0 34px', width: 'auto' }, 'Benef Pro · option Messages');
  const tN = w(60) - 0.28, tLui = w(63) - 0.12, tS9out = w(66) - 0.32;
  const tMsg = (i) => tLui + 0.34 + i * 0.27;
  const HEURES = [[-1, '0000'], [tN + 0.62, '0114'], ...ENV.slice(1).map((e, i) => [tMsg(i + 1) - 0.04, e[2].replace(':', '')])];
  const Y9 = 1040, PAS9 = 156;
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
    const a = SP(t, tN + 0.3, 'heavy'), up = E(t, tLui, 0.5, doux);   // l'horloge attend que la recherche soit floue
    camera(S9, { cx: 540, cy: 960, cz: lerp(-300, 0, Math.min(1, a)), rx: lerp(-16, -2, Math.min(1, a)) + 2 * Math.sin(t * 0.7), ry: lerp(-20, 0, Math.min(1, a)) + 4 * Math.sin(t * 0.5) });
    DIG.forEach((D, i) => volets(D, i, t));
    COLON.style.opacity = t < tMsg(0) && Math.floor((t - tN) / 0.5) % 2 ? '0.2' : '1';
    put(FLIP, 540, lerp(1000, 690, up), -700 * (1 - Math.min(1, a)), { rx: -10 + 3 * Math.sin(t * 0.8) * (1 - up), ry: 8 * Math.sin(t * 0.4) * (1 - up), s: lerp(0.9, 0.74, up), o: Math.min(1, a * 2.5) });
    ZZ.forEach((z, i) => { const t0 = tN + 0.3 + i * 0.22, u = (t - t0) / 1.2; const vis = u > 0 && t < tLui; show(z, vis); if (!vis) return; put(z, 640 + 64 * i + 22 * Math.sin(u * 5), 820 - 180 * u - 40 * i, 40 + 40 * i, { rz: -14 + 12 * Math.sin(u * 4), o: Math.min(1, u * 4) * (1 - E(t, tLui - 0.15, 0.15)) }); });
    // la liste : chaque nouveau message pousse les autres d'une ligne (ils descendent avant qu'il naisse)
    MSG.forEach((M, i) => {
      const t0 = tMsg(i); let slot = 0; for (let j = i + 1; j < MSG.length; j++) slot += Math.min(1, SP(t, tMsg(j) - 0.24, 'default'));
      const on = t >= t0 - 0.01 && slot < 2.95; show(M.c, on); if (!on) return;
      put(M.c, 540, Y9 + PAS9 * slot, 0, { o: 1 - E(slot, 2.15, 0.6, lin) });
      leve(M.T, t, t0, 16, 0.32); leve(M.D, t, t0 + 0.06, 14, 0.32);
      jaillit(M.S, t, t0 + 0.14, 0.4); trace(M.K, 24, t, t0 + 0.24, 0.22); trait(M.F, t, t0 + 0.02, 0.4);
    });
    const pp = SP(t, tLui + 0.1, 'snappy'); show(PRO, t >= tLui + 0.1); put(PRO, 540, Y9 - 128, 0, { s: 0.6 + 0.4 * Math.min(1, pp), o: Math.min(1, pp * 2) });
    recul(S9, t, tS9out, 0.62);
  }

  // =====================================================================================================
  // S10 · « Une annonce passe sous la cote ? Tu reçois un mail. » : l'aube ; l'annonce sous la cote, sans carte et en
  //       grand, son écart jaillit sur « sous » ; la notification tombe d'en haut (l'icône de l'app et deux lignes,
  //       aucune bannière), l'annonce lui fait de la place ; l'e-mail d'alerte s'ouvre, mis en page en sombre à même
  //       l'espace (titre, photo, prix, écart surligné, bouton), pendant que le reste recule.
  // =====================================================================================================
  const S10 = scene(1200);
  const ANB = bloc(S10);
  const AN0 = LISTE[0];
  const fsA = (() => { const m = mk('span', 'a nw', ST, { font: '600 220px Clash', letterSpacing: '-.04em', visibility: 'hidden' }, nb(AN0[3])); const v = Math.min(220, Math.floor(220 * 796 / largeur(m))); m.remove(); return v; })();
  const ANt = lettres(ANB.add(140, 680, 60, { font: '700 50px Satoshi', color: '#f4f1ec' }, AN0[0]));
  const ANs = ANB.add(140, 748, 40, { font: '500 40px Satoshi', color: 'rgba(244,241,236,.58)' }, nb('2018 · 88 500 km · Diesel'));
  const ANp = lettres(ANB.add(132, 806, 0, { font: `600 ${fsA}px/1.08 Clash`, letterSpacing: '-.04em', color: '#f4f1ec' }, nb(AN0[3])));
  const ANb = ANB.add(140, 806 + Math.round(fsA * 1.08) + 16, 30, { font: '700 64px Satoshi', color: '#3ecb7f', transformOrigin: '15% 50%' }, nb(AN0[5]));
  const ANc = ANB.add(140, 806 + Math.round(fsA * 1.08) + 108, 10, { font: '500 42px Satoshi', color: 'rgba(244,241,236,.52)' }, nb(AN0[4]));
  const ANF = filetB(ANB, 140, 806 + Math.round(fsA * 1.08) + 96, -20, 800, 'rgba(62,203,127,.55)', 3);
  const NOB = bloc(S10, 540, 612);
  const ico10 = NOB.add(140, 612, 60, { width: '128px', height: '128px', borderRadius: '32px', overflow: 'hidden', background: '#1a1411' }, '', 'a');
  ico10.innerHTML = LOGO; { const s = ico10.querySelector('svg'); s.style.height = '128px'; s.style.width = 'auto'; s.style.position = 'absolute'; s.style.left = '0'; s.style.top = '0'; }
  const NO1 = NOB.add(300, 606, 40, { font: '700 46px Satoshi', color: '#f4f1ec' }, 'utopicar <span style="font-weight:500;color:rgba(244,241,236,.6);font-size:38px">· maintenant</span>');
  const NO2 = NOB.add(300, 666, 30, { font: '500 42px Satoshi', color: 'rgba(244,241,236,.92)' }, nb('Clio IV · 7 650 €'));
  const NO3 = NOB.add(300, 720, 30, { font: '700 42px Satoshi', color: '#3ecb7f' }, nb('2 300 € sous la cote'));
  // l'e-mail, à même l'espace (aucune page blanche) : la mise en page de l'alerte, en sombre
  const MLB = bloc(S10);
  const m1 = lettres(MLB.add(140, 590, 70, { font: '700 80px Satoshi', color: '#f4f1ec' }, '1 nouvelle annonce'));
  const m2 = MLB.add(140, 694, 50, { font: '500 44px Satoshi', color: 'rgba(244,241,236,.6)' }, 'Recherche « Renault Clio 4 »');
  const mi = MLB.add(140, 790, 0, { width: '420px', height: '316px', borderRadius: '28px', overflow: 'hidden' }, '<img src="../assets/presente-v/clio4-mail.jpg" style="width:100%;height:100%;object-fit:cover;display:block">', 'a');
  await new Promise((r) => { const im = mi.querySelector('img'); if (im.complete) r(); else { im.onload = r; im.onerror = r; } });
  const XR = 592, WR = 930 - XR;
  const mt = MLB.add(XR, 788, 30, { width: WR + 'px', font: '700 36px/1.28 Satoshi', color: '#a9b8ff', whiteSpace: 'normal' }, 'Renault Clio IV 1.5 dCi 75 Zen', 'a');
  const mp = lettres(MLB.add(XR - 4, 890, 40, { font: '600 100px/1.08 Clash', letterSpacing: '-.035em', color: '#f4f1ec' }, nb('7 650 €')));
  const md = MLB.add(XR, 1006, 20, { font: '500 34px Satoshi', color: 'rgba(244,241,236,.6)' }, nb('2018 · 88 500 km'));
  const ms = MLB.add(XR - 8, 1054, 30, { font: '700 36px Satoshi', color: '#3ecb7f', padding: '0 8px', borderRadius: '8px', background: 'linear-gradient(rgba(62,203,127,.2),rgba(62,203,127,.2)) no-repeat 0 0/0% 100%' }, nb('2 300 € sous la cote'));
  const mc = MLB.add(140, 1134, 20, { font: '500 36px Satoshi', color: 'rgba(244,241,236,.5)' }, nb('cote 9 950 € sur 220 annonces'));
  const mb = MLB.add(140, 1210, 60, { font: '700 46px Satoshi', color: '#fff', background: '#ff5a1f', padding: '32px 50px', borderRadius: '26px', transformOrigin: '30% 50%', boxShadow: '0 24px 70px -26px rgba(255,90,31,.85)' }, 'Voir mes alertes sur utopicar');
  { const wd = largeur(md); if (wd > WR) md.style.fontSize = (32 * WR / wd).toFixed(1) + 'px'; const wm = largeur(ms); if (wm > WR - 4) ms.style.fontSize = (36 * (WR - 4) / wm).toFixed(1) + 'px'; }
  const MLR = reflet(mb);
  const tA0 = w(66) - 0.3, tSous = w(69) - 0.06, tNotif = w(71) - 0.12, tMail = w(73) - 0.14, tS10out = w(76) - 0.34;
  ph([[['Une', 66], ['annonce', 67]], [['passe', 68], ['sous', 69, 'g']], [['la', 70, 'g'], ['cote ?', 71, 'g']]], { y: 236, size: 112, out: w(72) - 0.22 });
  ph([[['Tu', 72], ['reçois', 73]], [['un', 74], ['mail.', 75, 'k']]], { y: 236, size: 124, out: tS10out + 0.1 });
  cue(tA0, 'whoosh', 0.6); cue(tA0 + 0.36, 'key', 0.5); cue(tSous, 'pop', 0.9); cue(tNotif, 'notif', 1.1); cue(tMail, 'whoosh', 0.8); cue(tMail + 0.22, 'key', 0.4); cue(tMail + 0.66, 'key', 0.5); cue(tMail + 1.0, 'tick', 0.5); cue(tMail + 1.2, 'pop', 0.7);
  win(tNotif - 0.02, tNotif + 0.3); win(tMail - 0.02, tMail + 0.4);
  function paintS10(t) {
    if (!show(S10.root, t >= tA0 && t < tS10out + 0.62)) return;
    const n = SP(t, tNotif, 'default'), nd = E(t, tNotif - 0.06, 0.5, doux), am = E(t, tMail - 0.1, 0.5, doux);
    const dM = E(t, tMail + 0.4, 0.5, doux) * (1 - E(t, tMail + 1.15, 0.55, doux));
    camera(S10, { cx: 540 + 12 * dM, cy: 960 - 30 * dM, cz: lerp(-280, 0, E(t, tA0, 0.9, doux)) + 30 * dM, rx: 3 + 2 * Math.sin(t * 0.6), ry: -4 + 4 * Math.sin(t * 0.45) });
    // l'annonce : se construit, fait de la place à la notification, puis recule et se floute
    ANB.pose(540, 960 + 190 * nd + 60 * am, -150 * nd - 560 * am, { ry: 4 * Math.sin(t * 0.7) * (1 - am), s: 1 + 0.04 * bump(t, tSous, 0.14) });
    ANB.vis(am < 0.999);
    ANB.fx((1 - E(am, 0.5, 0.5, lin)).toFixed(3), am > 0.01 || nd > 0.01 ? `blur(${(1.5 * nd + 10 * am).toFixed(1)}px) brightness(${(1 - 0.15 * nd - 0.45 * am).toFixed(3)})` : '');
    monte(ANt, t, tA0 + 0.2, 0.016); leve(ANs, t, tA0 + 0.34, 14); valeur(ANp, t, tA0 + 0.4);
    jaillit(ANb, t, tSous, 0.4); trait(ANF, t, tSous + 0.1, 0.5); leve(ANc, t, tSous + 0.22, 14);
    // la notification : tombe d'en haut sur sa charnière, puis remonte et s'efface quand l'e-mail s'ouvre
    const nOut = E(t, tMail - 0.2, 0.22, eIn2);
    if (NOB.vis(t >= tNotif - 0.02 && nOut < 0.999)) {
      NOB.pose(540, 612 - 120 * (1 - Math.min(1, n)) - 50 * nOut, 0, { rx: -70 * (1 - Math.min(1.04, n)) + 30 * nOut });
      NOB.fx((Math.min(1, n * 2.5) * (1 - nOut)).toFixed(3));
      const ic = jaillit(ico10, t, tNotif + 0.08, 0.3); ico10.style.transform += ` rotate(${(-140 * (1 - Math.min(1, ic))).toFixed(1)}deg)`;
      leve(NO1, t, tNotif + 0.14, 16, 0.32); leve(NO2, t, tNotif + 0.22, 16, 0.32); leve(NO3, t, tNotif + 0.28, 16, 0.32);
    }
    // l'e-mail se construit dans l'ordre de lecture
    const tm = tMail;
    if (MLB.vis(t >= tm)) {
      MLB.pose(540, 960, 0, { ry: 3 * Math.sin(t * 0.8) });
      monte(m1, t, tm + 0.22, 0.02); leve(m2, t, tm + 0.4, 14);
      mi.style.clipPath = `inset(0 ${(100 * (1 - E(t, tm + 0.48, 0.42, eOut3))).toFixed(2)}% 0 0 round 26px)`;
      leve(mt, t, tm + 0.6, 14); valeur(mp, t, tm + 0.68); leve(md, t, tm + 0.86, 14);
      leve(ms, t, tm + 0.96, 14); ms.style.backgroundSize = `${(100 * E(t, tm + 1.04, 0.45, eOut3)).toFixed(1)}% 100%`;
      leve(mc, t, tm + 1.06, 14); jaillit(mb, t, tm + 1.22, 0.5); passe(MLR, t, tm + 1.5, 0.7);
    }
    recul(S10, t, tS10out, 0.62);
  }

  // =====================================================================================================
  // S11 · « Et chaque voiture, de l'achat à la vente : » : les étapes du parc de l'app en colonne, reliées par une
  //       route (Repérées, Achetées, En préparation, En vente, Vendues), sans pastilles : le nombre seul, en couleur
  //       quand l'étape s'allume ; chacune s'allume sur son mot pendant que la route se remplit jusqu'à elle.
  //       « ta vraie marge. » : la colonne recule, la marge du mois et la marge par voiture se construisent, sans carte.
  // =====================================================================================================
  const S11 = scene(1100);
  const ETP = [['Repérées', '#9e968c', 1], ['Achetées', '#ff8a4c', 1], ['En préparation', '#ffc53d', 1], ['En vente', '#ff5a1f', 1], ['Vendues', '#3ecb7f', 2]];
  const PW = 720, PH = 800, RP = 160;
  const PIPE = obj(S11.cam, PW, PH, {});
  const ROUTE = mk('div', 'a', PIPE, { left: '61px', top: '85px', width: '14px', height: (4 * RP) + 'px', borderRadius: '7px', background: 'rgba(244,241,236,.1)', transformOrigin: '50% 0' });
  const RFILL = mk('div', 'a', PIPE, { left: '61px', top: '85px', width: '14px', height: '0px', borderRadius: '7px', background: 'linear-gradient(180deg,#9e968c,#ff8a4c 30%,#ffc53d 55%,#ff5a1f 78%,#3ecb7f)', backgroundSize: `14px ${4 * RP}px` });
  const TETE = mk('div', 'a', PIPE, { left: '48px', top: '72px', width: '40px', height: '40px', borderRadius: '50%', background: '#fff6ec', boxShadow: '0 0 0 8px rgba(255,138,76,.35)' });
  const ROWS = ETP.map(([lab, col, n], i) => {
    const r = mk('div', 'a', PIPE, { left: '0', top: (20 + i * RP) + 'px', width: PW + 'px', height: '130px' });
    const D = mk('div', 'a', r, { left: '44px', top: '41px', width: '48px', height: '48px', borderRadius: '50%', boxSizing: 'border-box', border: `5px solid ${col}`, background: '#120d0a' });
    const L = mk('div', 'a nw', r, { left: '130px', top: '18px', font: '600 72px/1.1 Clash', letterSpacing: '-.03em', color: '#f4f1ec' }, lab);
    const K = mk('div', 'a nw', r, { right: '6px', left: 'auto', top: '14px', font: '600 84px/1.1 Clash', textAlign: 'right', color: 'rgba(244,241,236,.3)', transformOrigin: '70% 50%' }, String(n));
    // le libellé ne touche jamais le nombre
    { const wl = largeur(L), kw = largeur(K), mx = PW - 6 - kw - 40 - 130; if (wl > mx) L.style.fontSize = (72 * mx / wl).toFixed(1) + 'px'; }
    return { r, D, LL: lettres(L), K, col };
  });
  // la marge du mois puis la marge par voiture, sans carte
  const KB = bloc(S11);
  const KPIi = KB.add(140, 596, 80, { width: '108px', height: '108px', borderRadius: '30px', background: '#ff5a1f' }, '<svg viewBox="0 0 24 24" width="108" height="108"><path class="c" d="M5 16l5-5 3 3 6-6" fill="none" stroke="#160904" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" pathLength="30" stroke-dasharray="0 30"/><path class="f" d="M15 8h4v4" fill="none" stroke="#160904" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" pathLength="10" stroke-dasharray="0 10"/></svg>', 'a');
  const KPIc = KPIi.querySelector('.c'), KPIf = KPIi.querySelector('.f');
  const KPIl = lettres(KB.add(280, 622, 60, { font: '500 50px/1.25 Satoshi', color: 'rgba(244,241,236,.85)' }, 'Marge réalisée ce mois'));
  const fsK = (() => { const m = mk('span', 'a nw', ST, { font: '600 240px Clash', letterSpacing: '-.04em', visibility: 'hidden' }, nb('1 550 €')); const v = Math.min(240, Math.floor(240 * 796 / largeur(m))); m.remove(); return v; })();
  const KPIv = KB.add(130, 712, 0, { font: `600 ${fsK}px/1.08 Clash`, letterSpacing: '-.04em', color: '#f4f1ec' }, nb('1 550 €'));
  const KPIvl = lettres(KPIv);
  const yKb = 712 + Math.round(fsK * 1.08) + 10;
  const KPIb = KB.add(140, yKb, 40, { font: '700 40px Satoshi', color: '#3ecb7f', transformOrigin: '10% 50%' }, nb('▲ +1 550 € par rapport à septembre'));
  const yM = yKb + 104;
  const MPVt = lettres(KB.add(140, yM, 50, { font: '600 56px/1.15 Clash', letterSpacing: '-.02em', color: '#f4f1ec' }, 'Marge par voiture'));
  const BARS = [['Polo V 1.2 TSI 90', 880, 92.59, '#3ecb7f'], ['Clio IV 1.5 dCi 90', 670, 70.5, '#ffc53d']].map(([lab, v, pc, col], i) => {
    const y = yM + 96 + i * 80;
    const L = KB.add(140, y, 20, { font: '500 38px Satoshi', color: 'rgba(244,241,236,.82)' }, lab);
    const P = KB.add(486, y + 10, -20, { width: '286px', height: '28px', borderRadius: '14px', background: 'rgba(244,241,236,.1)', overflow: 'hidden', transformOrigin: '0 50%' }, '', 'a');
    const F = mk('i', 'a', P, { left: '0', top: '0', bottom: '0', width: '0%', borderRadius: '14px', background: col });
    const S = mk('div', 'a', P, { left: '78.9%', top: '0', width: '6px', height: '28px', background: '#ff5a1f', transformOrigin: '50% 0' });
    const Nn = KB.add(0, y - 8, 20, { font: '600 54px/1.08 Clash', color: '#f4f1ec' }, nb(eur(v))); KB.droite(Nn, 905);
    return { L, P, F, S, NL: lettres(Nn), pc };
  });
  const MPVs = KB.add(140, yM + 96 + 2 * 80 + 4, 10, { font: '500 34px Satoshi', color: 'rgba(244,241,236,.6)' }, '<span style="display:inline-block;width:6px;height:30px;background:#ff5a1f;vertical-align:-6px;margin-right:14px"></span>' + nb('seuil de marge 750 €'));
  const tP0 = w(76) - 0.3, tMg = w(85) - 0.1, tLg = w(88) - 0.55;
  const TPAN = [w(78) - 0.05, w(81) - 0.05, w(82) + 0.02, w(84) - 0.04, w(84) + 0.26];
  ph([[['Et', 76], ['chaque', 77], ['voiture,', 78]], [['de', 79], ["l'achat", 80, 'k']], [['à', 82], ['la', 83], ['vente :', 84, 'k']]], { y: 236, size: 104, out: tMg - 0.2 });
  ph([[['ta', 85], ['vraie', 86, 'g']], [['marge.', 87, 'g']]], { y: 236, size: 150, out: tLg - 0.05 });
  cue(tP0, 'whoosh', 0.6); ETP.forEach((e, i) => { cue(tP0 + 0.3 + i * 0.09, 'pop', 0.25); cue(TPAN[i], i === 4 ? 'ding' : 'tick', 0.6); }); cue(tMg, 'whoosh', 0.7); cue(tMg + 0.22, 'pop', 0.6); cue(tMg + 0.4, 'key', 0.6); cue(tMg + 0.95, 'ding', 0.8); cue(tMg + 0.7, 'pop', 0.5); cue(tMg + 1.12, 'key', 0.5);
  function paintS11(t) {
    if (!show(S11.root, t >= tP0 && t < tLg + 0.4)) return;
    const a = E(t, tP0, 0.8, doux), mg = E(t, tMg - 0.05, 0.55, doux);
    camera(S11, { cx: 540 + 10 * Math.sin(t * 0.6), cy: lerp(950, 990, E(t, tP0, 3.2, lisse)), cz: lerp(-260, 0, a), rx: 10 + 2 * Math.sin(t * 0.7), ry: -8 + 4 * Math.sin(t * 0.5) });
    // la colonne des étapes, face caméra, inclinée ; elle recule quand la marge arrive
    put(PIPE, 506, 996 - 40 * mg, -600 * mg, { rx: 10, ry: -6 });   // la colonne inclinée avance à droite : son bord reste sous 940
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
      R.K.style.color = on > 0 ? rgb(mix([110, 104, 98], hx(R.col), on)) : 'rgba(244,241,236,.3)';
      R.K.style.transform = `scale(${(1 + 0.22 * bump(t, TPAN[i] + 0.02, 0.16)).toFixed(3)})`;
    });
    // marge du mois : naît sous la phrase et se construit ; puis la marge par voiture
    const km = SP(t, tMg, 'default'), kk = Math.min(1, km);
    if (KB.vis(t >= tMg - 0.05)) {
      KB.pose(540, 960 + 40 * (1 - kk), -160 * (1 - kk), { rx: 6 * (1 - kk) + 1.5 * Math.sin(t * 0.7), ry: -3 + 3 * Math.sin(t * 0.5) });
      jaillit(KPIi, t, tMg + 0.12, 0.3); trace(KPIc, 30, t, tMg + 0.24, 0.4); trace(KPIf, 10, t, tMg + 0.52, 0.2);
      monte(KPIl, t, tMg + 0.18, 0.016);
      valeur(KPIvl, t, tMg + 0.34); KPIv.style.color = rgb(mix(hx('#f4f1ec'), hx('#3ecb7f'), E(t, tMg + 0.95, 0.3)));
      jaillit(KPIb, t, tMg + 0.95, 0.5);
      monte(MPVt, t, tMg + 0.6, 0.02);
      BARS.forEach((B, i) => {
        const t0 = tMg + 0.8 + i * 0.12;
        leve(B.L, t, t0 - 0.06, 12); B.P.style.transform = `scaleX(${E(t, t0 - 0.04, 0.3, eOut3).toFixed(3)})`;
        remplit(B.F, t, t0 + 0.12, B.pc, 0.7); valeur(B.NL, t, t0 + 0.12, 0.04);
        B.S.style.transform = `scaleY(${E(t, t0 + 0.5, 0.25, eOut).toFixed(3)})`;
      });
      leve(MPVs, t, tMg + 1.3, 12);
    }
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
  // la trame du fond suit la caméra : le filé des critères (horizontal) et le défilement du mur (vertical)
  const KFX = 0.2, KFY = 0.14;
  FDX = (t) => -KFX * GAP * filP(t);
  FDY = (t) => -KFY * defile(t);
  FDV = (t) => [0.5 * KFX * GAP * filV(t) / 30, 0.5 * KFY * vitesse(t) / 30];

  // sous-titres du haut : chacun est sorti (0,2 s) avant que le suivant tape sa première lettre
  { const top = PHR.filter((p) => p.haut).sort((a, b) => a.first - b.first); for (let i = 0; i < top.length - 1; i++) top[i].out = Math.min(top[i].out, top[i + 1].first - 0.26); }

  // empilement : la scène qui arrive passe DEVANT celle qui recule
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
    show(F1, boucle); if (boucle) peintFond(F1B, F1G, 0, false);
  };
  const inWin = (t) => FAST.some(([a, b]) => t >= a && t <= b);
  window.shutter = (t) => (inWin(t) ? 1 : 0.5);
  window.samples = (t) => (inWin(t) ? 8 : 4);
  window.filmDur = DUR;
  window.cues = CUES.sort((x, y) => x.t - y.t);
  window.seek(0);
  window.filmReady = true;
})().catch((e) => { console.error('FILM', e.message, e.stack); document.title = 'ERREUR ' + e.message; });
