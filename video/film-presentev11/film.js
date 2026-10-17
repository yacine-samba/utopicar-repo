// Présentation utopicar v11 (9:16). Demande : « repars de la vidéo de base qu'on a créée et copie cette animation pour les
// interfaces » (l'animation de la planche v11) ; voix : nouveau texte, nouvelle voix de Simon.
// Retour de l'utilisateur sur la v10 : « l'animation du scroll s'arrête net, un des textes chiffrés coupe, et il n'y a
// aucun dynamisme : on ne comprend rien, pas de contexte, pas de parcours, pas d'UX ».
// Ce qui reste de la v10 (film-presentev10) :
//  · l'accroche : la Polo en vraie 3D (polo3d.js) devant son prix, qui bascule chiffre par chiffre en perte rouge ;
//  · la voix qui s'écrit (ph : lettres qui tapent, lueur qui suit Simon), une grosse couleur à chaque changement de
//    chapitre, le fond vivant, la fin (logo officiel qui s'anime, signature, pastille) et la boucle.
// Ce qui change (la planche v11) : le parcours en quatre étapes, Analyser → Trouver → Négocier → Revendre.
//  · Le fil des étapes en haut de l'écran (contexte permanent, comme le titre fixe et le numéro de @flo.vma) : il naît
//    sur « en quatre étapes » ; à chaque « Étape N », la grosse couleur sort de son rond, prend l'écran avec le nom de
//    l'étape, puis rentre dans le rond, qui reste allumé ; l'étape finie se coche.
//  · Les interfaces sont les VRAIS écrans de l'app (main, base démo, captures 2×) dans un téléphone en 3D qui ne s'arrête
//    jamais : l'écran défile (accélère puis se pose en douceur, jamais d'arrêt net), passe d'un écran à l'autre comme
//    l'app (l'analyse qui se coche, le rapport qui monte, un onglet), et le bloc qui compte SORT de l'écran vers nous,
//    en gros plan (capture 3×), depuis sa place exacte à l'écran (pubs d'applis : Qonto, Drive…). Pendant qu'il est
//    sorti, l'écran recule un peu dans l'ombre.
//  · Les chiffres sont ceux de l'app sur les annonces d'essai (Polo 2873461903, Clio 2870558214), avec la cote réelle relue
//    le 17 oct. 2026 : −2 458 €, 268 annonces, +1 533 € (+21 %), 5 750 € ; 2 064 € sous la cote, 7 400 € / 7 900 € ; vendue
//    9 350 €, marge réelle 1 300 € (montrée, jamais dite).
// Contrat : window.seek(t) peint l'image t.
(async function () {
  const { spring, clamp, lerp } = Motion;
  const ST = document.getElementById('stage');
  const NS = 'http://www.w3.org/2000/svg';
  const J = async (u) => (await fetch(u)).json();
  // la voix v11 (vo-presentev11.py) : mots horodatés, désignés par leur numéro
  const WD = await J('../audio/vo-presentev11/vo.words.json');
  const NW = WD.length;
  const sur = (a, b) => ({ w: WD.slice(a, b + 1).map((x) => x.w).join(' '), s: WD[a].s, e: WD[b].e });
  const mot = (a, b) => { WD.push(sur(a, b)); return WD.length - 1; };   // plusieurs mots lus comme un seul (« 5 750 € »)
  const GEO = await J('../assets/presente-v11/film/geo.json');
  const LOGO = await (await fetch('../assets/brand/official/utopicar-logo-horizontal-fond-sombre.svg')).text();
  await Promise.all(['500 80px Clash', '600 80px Clash', '700 80px Clash', '400 30px Satoshi', '500 30px Satoshi', '700 30px Satoshi', '900 30px Satoshi', 'italic 80px Instrument'].map((f) => document.fonts.load(f)));
  const w = (i) => WD[i].s, we = (i) => WD[i].e;
  const VEND = WD[NW - 1].e;
  const DUR = Math.round((VEND + 2.5) * 30) / 30, TLOOP = DUR - 0.6;
  // changements de chapitre : [début, écran couvert, début du retrait, fin] de chaque grosse couleur, calés sur la voix
  const RT = (t0, dc, tient, dr) => ({ t0, dc, dr, c: t0 + dc, r: t0 + dc + tient, e: t0 + dc + tient + dr });
  const R1 = RT(8.66, 0.3, we(33) - 8.96 - 0.34, 0.34);            // accroche → Étape 1 (sort du rond 1, y rentre)
  const R2 = RT(we(75) + 0.08, 0.3, we(78) - we(75) - 0.38 - 0.1, 0.32);   // Étape 2, après « …au plus. »
  const R3 = RT(we(98) + 0.1, 0.3, we(101) - we(98) - 0.4 - 0.02, 0.32);   // Étape 3, après « …un mail. »
  const R4 = RT(we(129) + 0.04, 0.3, we(132) - we(129) - 0.34 - 0.04, 0.32); // Étape 4, après « …est prêt. »
  const R5 = RT(we(155) - 0.06, 0.28, 0.12, 0.32);                // la marge → la fin (le logo)

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
  let VOILE_A = () => null;                                // grosse couleur à l'écran, point par point (définie avec le voile)
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
    const P = { box, L, size, fit, out: o.out ?? 99, t0: L[0].mots[0].t0, y0, first: L[0].mots[0].L[0].t, haut: !o.parent && y0 <= 400 };   // sous-titres du haut : au-dessus du téléphone (y 236 dans l'accroche, 380 sous le fil des étapes)
    P.paint = (t) => {
      const on = t >= P.t0 - 0.12 && t < P.out + 0.3; if (!show(box, on)) return;
      const q = E(t, P.out, 0.2, (p) => p * p);
      // sur une grosse couleur, les mots en couleur (rose sur orange, vert sur vert…) passent au foncé, lettre par
      // lettre, là où passe le bord ; les mots blancs restent blancs
      const va = VOILE_A(t);
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
            const g = o.encre ? 0 : lueur(l.x + l.wd / 2, X, size) * fadeG;   // encre : le nom de l'étape, foncé sur l'orange, sans lueur
            const yy = y0 + (line.y - y0) * fit + (1 - p) * size * 0.22 * fit - q * (y0 > 300 ? 18 : 60) - 0.05 * size * g * fit;   // sous le fil des étapes, la sortie monte peu : elle ne touche pas ses libellés
            const [a, sur] = va && M.col !== 'w' ? va(x0 + (l.x + l.wd / 2) * fit, yy + 0.55 * size * fit) : [0];
            if (o.encre) { l.el.style.color = '#160904'; l.el.style.textShadow = 'none'; } else allume(l.el, a > 0 ? mix(c, sur, a) : c, halo, g, size);
            l.el.style.transform = `translate(${(x0 + l.x * fit).toFixed(1)}px,${yy.toFixed(1)}px) rotateX(${(-60 * (1 - p) + 70 * q).toFixed(1)}deg) scale(${((0.35 + 0.65 * pp) * (1 + 0.06 * g) * fit).toFixed(3)})`;
            l.el.style.transformOrigin = '0 80%';
            l.el.style.opacity = (Math.min(1, p * 1.6) * (1 - q)).toFixed(3);
            const bl = 6 * (1 - p) + 10 * q; l.el.style.filter = bl > 0.2 ? `blur(${bl.toFixed(1)}px)` : '';
          });
        });
      }
      HALO.style.opacity = (o.encre ? 0 : 0.95 * hb).toFixed(3);
      if (o.zoom) box.style.transform = `scale(${(1 + o.zoom[2] * E(t, o.zoom[0], o.zoom[1], lin)).toFixed(4)})`;
      HALO.style.transform = `translate(${(hxp - HW / 2).toFixed(1)}px,${(hyp - HH / 2).toFixed(1)}px)`;
    };
    return P;
  }
  const PHR = [];
  const ph = (lignes, o) => { const p = phrase(lignes, o); PHR.push(p); return p; };
  // lueur qui suit la voix sur un titre de l'interface (lettres d'une ligne, images clés [t, x])
  const allumeLigne = (L, K, t, base, halo, size) => { const X = tete(K, t), f = 1 - E(t, K[K.length - 1][0] + 0.15, 0.5); L.forEach((s) => allume(s, base, halo, lueur(s._x + s._w / 2, X, size) * f, size)); };

  // =====================================================================================================
  // S1 · ACCROCHE (v10, texte v11) « Tu fais de l'achat-revente ? Cette Polo à 8 990 euros te ferait perdre 2 458 euros.
  //      Je te montre comment le voir avant d'appeler, en quatre étapes. » : notre Polo en vraie 3D (polo3d.js,
  //      « utopicar » sur la plaque), qui tourne lentement devant un prix géant ; le prix bascule chiffre par chiffre en
  //      −2 458 € rouge (« à la revente » dessous), qui passe devant la voiture ; la caméra recule pendant la promesse,
  //      et le fil des quatre étapes naît en haut. Chiffres de l'app (main) sur l'annonce d'essai de la Polo (1.2 TSI 90
  //      Confortline, 2012, 118 400 km, 8 990 €, vendeur pro), cote réelle relue le 17 oct. 2026 (268 annonces).
  // =====================================================================================================
  const S1 = scene(1200);
  // fond propre à S1, utilisé seulement à la boucle : S1 revient dans un cercle, sur le fond de l'image 0
  const F1 = mk('div', 'lay', null, { background: '#0b0a09' }); S1.root.insertBefore(F1, S1.cam);
  const F1B = blobs(F1), F1G = trame(F1);
  const PRIX = obj(S1.cam, 1080, 400, { transformStyle: 'preserve-3d' });
  const PRold = [...'8 990 €'].map((ch) => mk('span', 'a nw', PRIX, { font: '600 300px Clash', letterSpacing: '-.05em', color: '#f7e7d6', whiteSpace: 'pre' }, ch === ' ' ? ' ' : ch));
  const PRnew = [...'−2 458 €'].map((ch) => mk('span', 'a nw', PRIX, { font: '600 228px Clash', letterSpacing: '-.05em', color: '#ff5f5f', whiteSpace: 'pre' }, ch === ' ' ? ' ' : ch));
  const lay1 = (arr) => { let x = 0; const ws = arr.map((s) => s.getBoundingClientRect().width); const tot = ws.reduce((a, b) => a + b, 0); arr.forEach((s, i) => { s._x = 540 - tot / 2 + x; s._w = ws[i]; x += ws[i]; }); return tot; };
  // le prix garde la largeur de celui de la 208 (« 7 190 € »), dont la mise en page était validée : « 8 990 € », plus
  // large, sortait de l'écran à la première image et passait la marge de droite
  { const ref = [...'7 190 €'].map((ch) => mk('span', 'a nw', PRIX, { font: '600 300px Clash', letterSpacing: '-.05em', whiteSpace: 'pre', visibility: 'hidden' }, ch === ' ' ? ' ' : ch));
    const lr = lay1(ref); ref.forEach((s) => s.remove());
    const tot = lay1(PRold); if (tot > lr) { PRold.forEach((s) => { s.style.fontSize = ((300 * lr) / tot).toFixed(1) + 'px'; }); lay1(PRold); } }
  // la perte : 680 px au plus, décalée de 30 px vers la gauche, parce que la caméra qui avance et tourne la pousse à droite
  // (à 730 px, son « € » entrait dans la marge réservée de droite, jusqu'à 995 px)
  { const tot = lay1(PRnew); if (tot > 680) { PRnew.forEach((s) => { s.style.fontSize = (228 * 680 / tot).toFixed(1) + 'px'; }); lay1(PRnew); } PRnew.forEach((s) => { s._x -= 30; }); }
  const PRz = PRnew[PRnew.length - 1], PRK = [[w(16) - 0.06, PRnew[0]._x], [we(17), PRz._x], [we(18), PRz._x + PRz._w]];   // la lueur suit « 2 458 euros »
  // « à la revente » sous la perte (la voix dit « te ferait perdre » : l'écran dit quand)
  const PRlab = mk('div', 'a nw', PRIX, { left: '0', top: '300px', width: '1020px', textAlign: 'center', font: '500 46px Satoshi', color: 'rgba(244,241,236,.78)' }, 'à la revente');
  const SHADOW = obj(S1.cam, 1000, 160, { borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.75), rgba(0,0,0,0) 70%)' });
  const P3D = await (await import('./polo3d.js')).polo({ largeur: 1000, hauteur: 600, echelle: 2 });
  const CAR = P3D.canvas; CAR.className = 'a'; S1.cam.appendChild(CAR);
  P3D.cadrer({ az: 0.5, el: 0.09, dist: 1.6 }, 0.69);   // 69 % du canevas : avancée vers la caméra, la Polo tient dans la colonne 140 → 940
  const CARH = 600;
  const QM = obj(S1.cam, 900, 1100, {}, `<svg viewBox="0 0 100 120" width="900" height="1100"><text x="50" y="100" text-anchor="middle" font-family="Clash" font-weight="600" font-size="120" fill="none" stroke="rgba(255,138,76,.55)" stroke-width="1.1">?</text></svg>`);
  const FLASH = mk('div', 'lay', ST, { background: 'radial-gradient(circle at 50% 55%, rgba(255,70,70,.55), rgba(255,40,40,0) 65%)', opacity: 0, zIndex: 15 });
  const tFlip = w(13) - 0.12, tPerds = w(16) - 0.1, tLab = we(18) - 0.3, tRecul = w(22) - 0.3;
  ph([[['Tu', 0], ['fais', 1], ['de', 2]], [["l'achat-revente ?", mot(3, 6), 'k']]], { y: 236, size: 124 });
  ph([[['Cette', 7], ['Polo', 8, 'k']], [['à', 9], ['8 990 €', mot(10, 12), 'k']]], { y: 236, size: 124 });
  ph([[['te', 13], ['ferait', 14]], [['perdre', 15, 'r']]], { y: 236, size: 124 });
  // la promesse : « Je te montre » n'est pas écrit ; « comment le voir avant d'appeler » l'est (le bénéfice), puis le fil
  // des étapes naît à sa place sur « en quatre étapes »
  ph([[['Comment', 22], ['le', 23], ['voir', 24, 'k']], [['avant', 25], ["d'appeler,", mot(26, 27), 'k']]], { y: 236, size: 124, out: we(27) + 0.06 });
  cue(0, 'impact', 1.1); cue(w(10) - 0.05, 'pop', 0.8); cue(w(6) - 0.05, 'whoosh', 0.5); cue(tFlip, 'whoosh', 1); cue(tFlip + 0.08, 'roll', 0.8); cue(tPerds, 'impact', 1.1); cue(tLab, 'key', 0.4); cue(tRecul, 'whoosh', 0.5);
  win(0, 0.5); win(tFlip - 0.02, tFlip + 0.5); win(tPerds - 0.02, tPerds + 0.25);
  function paintS1(t) {
    if (!show(S1.root, t < R1.c + 0.02)) return;
    const a = SP(t, -0.02, 'heavy'), flip = E(t, tFlip, 0.5, doux), shake = bump(t, tPerds, 0.12);
    const rec = E(t, tRecul, 2.6, lisse);   // pendant la promesse, la caméra recule et monte un peu : la scène laisse la place au fil
    camera(S1, {
      cx: 540 + 30 * Math.sin(t * 0.6), cy: 980 - 30 * rec,
      cz: lerp(110, 0, a) + 70 * lisse(clamp((t - 0.8) / 2.4, 0, 1)) + 20 * flip - 150 * rec,
      rx: lerp(-10, 2, a) - 8 * flip + 2.5 * shake * Math.sin((t - tPerds) * 80),
      ry: lerp(12, -5, a) + 6 * Math.sin(t * 0.45) * (1 - flip) - 4 * flip,
      rz: lerp(-6, 0, a) + 1.5 * shake * Math.sin((t - tPerds) * 63),
    });
    const fwd = E(t, tFlip + 0.25, 0.6, doux);   // le prix avance quand ses anciens chiffres sont partis (sinon le « € » grossissait dans la marge)
    // à l'arrivée, la caméra tournée pousse le prix à gauche : il est décalé d'autant, le temps qu'elle se pose (à la
    // première image, son premier chiffre touchait le bord de l'écran)
    put(PRIX, 540 + 70 * (1 - Math.min(1, a)), 760 + 40 * fwd, lerp(-260, 40, fwd), { rx: 4 * Math.sin(t * 0.7) });
    const glow = t >= w(10) - 0.05 ? 1 : 0;
    // au basculement, la caméra tourne et pousse le prix à droite (jusqu'à 971 px) : l'ancien prix est décalé d'autant
    PRold.forEach((s, i) => {
      const k = E(t, tFlip + i * 0.03, 0.26, eIn);
      s.style.color = glow ? rgb(mix(hx('#f7e7d6'), hx('#ff8a4c'), E(t, w(10) - 0.05, 0.25) * (1 - E(t, w(12), 0.4) * 0.4))) : '#f7e7d6';
      s.style.transform = `translate(${(s._x - 70 * flip).toFixed(1)}px,${(30 - 380 * k).toFixed(1)}px) rotateX(${(80 * k).toFixed(1)}deg) scale(${(1 + 0.05 * bump(t, w(10) - 0.05 + i * 0.03, 0.1)).toFixed(3)})`;
      s.style.opacity = (1 - E(t, tFlip + 0.02 + i * 0.03, 0.14)).toFixed(3);   // s'éteint dès qu'il bascule (en tournant vers la caméra, il grossissait jusque dans la marge)
    });
    const XG = tete(PRK, t), fG = 1 - E(t, PRK[PRK.length - 1][0] + 0.1, 0.45);
    PRnew.forEach((s, i) => {
      const k = SP(t, tFlip + 0.3 + i * 0.045, 'default'), g = lueur(s._x + s._w / 2, XG, 200) * fG;   // après le départ de l'ancien prix
      s.style.transform = `translate(${s._x.toFixed(1)}px,${(40 + 360 * (1 - k) - 8 * g).toFixed(1)}px) rotateX(${(-80 * (1 - Math.min(1, k))).toFixed(1)}deg) scale(${(1 + 0.08 * bump(t, tPerds + i * 0.02, 0.12) + 0.05 * g).toFixed(3)})`;
      s.style.opacity = Math.min(1, k * 1.5).toFixed(3);
      allume(s, hx('#ff5f5f'), [255, 80, 80], g, 200);
    });
    leve(PRlab, t, tLab, 24, 0.5);
    const dim = E(t, tFlip + 0.2, 0.5);
    // la Polo tourne lentement sur elle-même (vraie 3D : reflets et roues bougent) ; elle recule et s'éteint au basculement
    P3D.pose({ az: 0.62 - 0.05 * t + 0.03 * Math.sin(t * 0.5), el: 0.09, dist: 1.6 });
    put(CAR, 540, 1180 + 10 * Math.sin(t * 1.1) + 40 * dim, 120 - 220 * dim, { s: 1.05 - 0.04 * dim });
    CAR.style.filter = `drop-shadow(0 40px 40px rgba(0,0,0,.55)) brightness(${(1 - 0.55 * dim).toFixed(3)}) saturate(${(1 - 0.6 * dim).toFixed(3)})`;
    put(SHADOW, 540, 1180 + CARH * 0.47, 80, { rx: 80, o: 0.8 });
    const qm = E(t, w(6) - 0.08, 0.4, doux);
    put(QM, 790, 880, -520, { rz: 12 - 20 * qm + 3 * Math.sin(t), s: 0.6 + 0.4 * qm, o: qm * (1 - E(t, tFlip, 0.25)) });
    FLASH.style.opacity = (0.85 * bump(t, tPerds - 0.02, 0.1) + 0.4 * E(t, tFlip + 0.2, 0.4) * (1 - E(t, tRecul, 0.8))).toFixed(3);
  }
  // =====================================================================================================
  // LE FIL DES ÉTAPES (planche v11) : quatre ronds reliés par un trait, en haut de l'écran (236 → 333), centrés sur
  // x = 540 (ronds à 240, 440, 640, 840). Il naît sur « en quatre étapes » : le trait se trace, les ronds jaillissent un
  // à un avec leur numéro, les libellés montent. États :
  //  · à venir : rond sombre cerclé de gris, numéro gris ;
  //  · en cours : rond orange plein, numéro foncé, halo ; la grosse couleur du chapitre sort de lui et y rentre ;
  //  · fini : rond brun cerclé d'orange, coche tracée ; le trait se remplit d'orange jusqu'à l'étape suivante.
  // =====================================================================================================
  const ETAPES = ['Analyser', 'Trouver', 'Négocier', 'Revendre'];
  const RAIL = mk('div', 'lay', ST, { zIndex: 12, pointerEvents: 'none' });
  const RX = (i) => 240 + 200 * i, RY = 264;
  const RFIL0 = mk('div', 'a', RAIL, { left: '240px', top: (RY - 2) + 'px', width: '600px', height: '4px', borderRadius: '2px', background: 'rgba(244,241,236,.14)', transformOrigin: '0 50%', transform: 'scaleX(0)' });
  const RFIL1 = mk('div', 'a', RAIL, { left: '240px', top: (RY - 2) + 'px', width: '600px', height: '4px', borderRadius: '2px', background: '#ff5a1f', transformOrigin: '0 50%', transform: 'scaleX(0)' });
  const NOEUDS = ETAPES.map((lab, i) => {
    const d = mk('div', 'a', RAIL, { left: (RX(i) - 30) + 'px', top: (RY - 30) + 'px', width: '60px', height: '60px', borderRadius: '50%', boxSizing: 'border-box', borderWidth: '2px', borderStyle: 'solid' });
    const nu = mk('div', 'a nw', d, { left: '-2px', top: '-2px', width: '60px', height: '60px', textAlign: 'center', font: '600 30px/60px Clash' }, String(i + 1));
    d.insertAdjacentHTML('beforeend', '<svg class="a" viewBox="0 0 60 60" width="60" height="60" style="left:-2px;top:-2px;overflow:visible"><path d="M19 31l8 8 15-17" fill="none" stroke="#ff8a4c" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" pathLength="30" stroke-dasharray="0 30"/></svg>');
    const l = mk('div', 'a nw', RAIL, { left: (RX(i) - 100) + 'px', top: (RY + 40) + 'px', width: '200px', height: '34px', textAlign: 'center', font: '700 27px/34px Satoshi', letterSpacing: '-.01em' }, lab);
    return { d, nu, ck: d.querySelector('path'), l, L: lettres(l) };
  });
  const RR = [R1, R2, R3, R4];
  const tNe = (i) => 8.02 + 0.08 * i;                                  // sur « quatre étapes »
  const tAct = (i) => RR[i].t0 - 0.08;                                // le rond s'allume, la couleur sort de lui
  const tFait = (i) => (i < 3 ? RR[i + 1].t0 - 0.42 : R5.t0 - 0.36);  // coché, le trait file vers le suivant
  const rgba = (c) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${(c[3] ?? 1).toFixed(3)})`;
  cue(tNe(0) - 0.02, 'whoosh', 0.35); ETAPES.forEach((e, i) => { cue(tNe(i), 'pop', 0.4); cue(tAct(i), 'tick', 0.6); cue(tFait(i) + 0.06, 'tick', 0.45); });
  function paintRail(t) {
    if (!show(RAIL, t >= tNe(0) - 0.06)) return;
    RFIL0.style.transform = `scaleX(${E(t, tNe(0) - 0.04, 0.5, eOut3).toFixed(4)})`;
    let f = 0; for (let i = 0; i < 3; i++) f += E(t, tFait(i), tAct(i + 1) - tFait(i), eOut3);
    RFIL1.style.transform = `scaleX(${(f / 3).toFixed(4)})`;
    NOEUDS.forEach((N, i) => {
      const nait = SP(t, tNe(i), 'snappy'), act = E(t, tAct(i), 0.14), fait = E(t, tFait(i), 0.22);
      N.d.style.background = rgb(mix(mix(hx('#0b0a09'), hx('#ff5a1f'), act), hx('#3a1a0d'), fait));
      N.d.style.borderColor = rgba(mix([244, 241, 236, 0.28], [255, 90, 31, 1], Math.max(act, fait)));
      N.nu.style.color = rgba(mix([244, 241, 236, 0.5], [22, 9, 4, 1], act));
      N.nu.style.opacity = (1 - fait).toFixed(3);
      trace(N.ck, 30, t, tFait(i) + 0.06, 0.3); N.ck.setAttribute('opacity', t >= tFait(i) + 0.06 ? '1' : '0');   // un trait de longueur nulle à bouts ronds dessine un point
      const halo = act * (1 - fait);
      N.d.style.boxShadow = halo > 0.01 ? `0 0 0 ${(8 * halo).toFixed(1)}px rgba(255,90,31,${(0.2 * halo).toFixed(3)})` : '';
      N.d.style.transform = `scale(${(Math.max(0, nait) * (1 + 0.22 * bump(t, tAct(i), 0.16) + 0.14 * bump(t, tFait(i), 0.14))).toFixed(4)})`;
      N.d.style.opacity = Math.min(1, nait * 2).toFixed(3);
      monte(N.L, t, tNe(i) + 0.06, 0.02, 0.4);
      N.l.style.color = rgba(mix(mix([244, 241, 236, 0.45], [244, 241, 236, 1], act), [244, 241, 236, 0.72], fait));
    });
  }

  // =====================================================================================================
  // LE TÉLÉPHONE (planche v11) : boîtier en 3D (bord de 16 px, rayon 78), écran de 560 × 1212 px où passent les VRAIES
  // captures de l'app (2× de 390 × 844 px CSS : 780 × 1688, échelle 560 / 780). Dans l'écran, tout est en px de capture :
  // barre du haut (0 → 128), page à plat qui défile (bande), barre du bas (1540 → 1688). Le téléphone se tourne d'un côté
  // à l'autre (±12°) pour laisser la place au bloc qui sort, dérive sans cesse, et arrive à chaque chapitre pendant que
  // la grosse couleur rentre dans son rond.
  // =====================================================================================================
  const SPH = scene(2400);
  const PW = 592, PHH = 1244, KS = 560 / 780, YT = 1242;              // centre du téléphone : haut à 620 (planche)
  const PH = obj(SPH.cam, PW, PHH, { borderRadius: '78px', background: 'linear-gradient(145deg,#2b2522,#110e0d 40%,#1d1816)', boxShadow: '0 0 0 2px rgba(255,255,255,.06) inset, 0 70px 140px -20px rgba(0,0,0,.75)' });
  const SCR = mk('div', 'a', PH, { left: '16px', top: '16px', width: '560px', height: '1212px', borderRadius: '62px', overflow: 'hidden', background: '#0b0a09' });
  const CT = mk('div', 'a', SCR, { left: '0', top: '0', width: '780px', height: '1688px', transformOrigin: '0 0', transform: `scale(${KS.toFixed(6)})` });
  const DOS = '../assets/presente-v11/film/', IMGS = [];
  const im = (parent, src, css = {}) => { const e = mk('img', 'a', parent, { left: '0', top: '0', ...css }); e.src = DOS + src; e.draggable = false; IMGS.push(e); return e; };
  const ecran = () => mk('div', 'a', CT, { left: '0', top: '0', width: '780px', height: '1688px', overflow: 'hidden', background: '#0b0a09', display: 'none' });
  // une page qui défile : barre du haut, bande à plat (y0 : px CSS de sa première ligne), barre du bas
  const page = (bande, y0, bas) => {
    const e = ecran(), clip = mk('div', 'a', e, { left: '0', top: '128px', width: '780px', height: '1412px', overflow: 'hidden' });
    return { e, clip, b: im(clip, bande), hd: im(e, 'haut.png'), nv: im(e, bas, { top: '1540px' }), y0, S: y0 };
  };
  const posePage = (P, S) => { P.S = S; P.b.style.transform = `translateY(${(-(S - P.y0) * 2).toFixed(1)}px)`; };
  // un morceau d'écran qui réagit à l'appui (bouton, onglet, interrupteur) : il s'écrase et s'éclaire, sans doigt
  const appui = (parent, src, r) => mk('div', 'a', parent, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px', backgroundImage: `url(${DOS}${src})`, backgroundPosition: `${-r.x}px ${-r.y}px`, backgroundSize: '780px 1688px', borderRadius: (r.h / 2) + 'px', transformOrigin: '50% 50%' });
  const appuie = (el, t, t0) => { const b = bump(t, t0, 0.14); el.style.transform = `scale(${(1 - 0.07 * b).toFixed(4)})`; el.style.filter = b > 0.01 ? `brightness(${(1 + 0.25 * b).toFixed(3)})` : ''; return b; };

  // les écrans
  const E1 = ecran(); im(E1, 'ecran-analyser.png');
  // le lien collé (champ) et le bouton devenu orange : découverts à part sur l'écran vide (mesurés par différence)
  const E1c = im(E1, 'ecran-colle.png'), E1b = im(E1, 'ecran-colle.png');
  const ES = ecran(); const SEQ = GEO.analyse.map(([f]) => im(ES, 'analyse/' + f, { display: 'none' }));
  const EP = page('bande-polo.png', GEO['bande-polo'].y0, 'bas-rapports.png');
  const ER = page('bande-recherche.png', GEO['bande-recherche'].y0, 'bas-recherche.png');
  const EM = ecran(); im(EM, 'ecran-mes-recherches-off.png'); const EMon = im(EM, 'ecran-mes-recherches.png');
  const EMt = appui(EM, 'ecran-mes-recherches.png', { x: 66, y: 1384, w: 280, h: 68 });   // l'interrupteur « Alerte e-mail »
  const EML = ecran(); im(EML, 'ecran-mail.png');
  const EC = page('bande-clio.png', GEO['bande-clio'].y0, 'bas-rapports.png');
  const EA = ecran(); im(EA, 'parc-avant.png'); const EAp = im(EA, 'parc-apres.png');
  const EAb = appui(EA, 'parc-avant.png', { x: Math.round(GEO.acheter.x), y: Math.round(GEO.acheter.y), w: Math.round(GEO.acheter.width), h: Math.round(GEO.acheter.height) });   // « Acheter »
  const EAo = appui(EA, 'parc-apres.png', { x: Math.round(GEO['onglet-vendues'].x), y: Math.round(GEO['onglet-vendues'].y), w: Math.round(GEO['onglet-vendues'].width), h: Math.round(GEO['onglet-vendues'].height) });   // onglet « Vendues »
  const EAv = im(EA, 'avis.png', { left: GEO.avis.x + 'px', top: GEO.avis.y + 'px' });
  const EV = page('bande-vendues.png', GEO['bande-vendues'].y0, 'bas-parc.png');
  const ECRANS = [E1, ES, EP.e, ER.e, EM, EML, EC.e, EA, EV.e];

  // défilements : [début, fin, de (px CSS), à] ; la courbe accélère puis se pose longuement, jamais d'arrêt net
  const glisse = bez(0.42, 0, 0.12, 1);
  const defil = (P, S0, segs) => (t) => segs.reduce((S, [a, b, from, to]) => S + (to - from) * glisse(clamp((t - a) / (b - a), 0, 1)), S0);
  const DEFILS = [];
  const scroll = (P, S0, segs) => { segs.forEach(([a, b, from, to]) => { win(a - 0.02, b); if (Math.abs(to - from) > 1000) cue(a, 'whoosh', clamp(Math.abs(to - from) / 2600, 0.3, 0.6)); DEFILS.push([a, b, Math.abs(to - from)]); }); return defil(P, S0, segs); };

  // ---------- Étape 1 · Analyser ----------
  const tPaste = w(36) + 0.02, tBtn = tPaste + 0.42, tTap = we(42) - 0.04, tSeq = tTap + 0.5;
  const tRap = w(53) - 0.12;                                           // le rapport monte, sur « 1 533 »
  const KSEQ = GEO.analyse[GEO.analyse.length - 1][1] / (tRap - tSeq); // l'attente réelle (9,8 s) passe en accéléré
  const SPolo = scroll(EP, 505, [[tRap + 0.3, tRap + 0.74, 505, 1348], [w(61) - 0.16, w(61) + 0.28, 1348, 505], [w(64) + 0.04, w(64) + 1.14, 505, 3214]]);
  cue(tPaste, 'paste', 1); cue(tBtn, 'pop', 0.5); cue(tTap, 'click', 1); cue(tRap, 'whoosh', 0.6);
  [1.0, 3.1, 5.4, 7.2, 8.6].forEach((r) => cue(tSeq + r / KSEQ, 'tick', 0.35));
  // ---------- Étape 2 · Trouver ----------
  const SRech = scroll(ER, GEO['bande-recherche'].y0, [[we(83) - 0.08, we(83) + 0.36, GEO['bande-recherche'].y0, 1376]]);
  const tEM = we(90) - 0.02, tTog = w(92) - 0.06, tMail = w(95) + 0.02;   // l'e-mail descend sur « tu reçois », l'alerte est rentrée avant
  cue(tEM, 'whoosh', 0.5); cue(tTog, 'click', 0.8); cue(tMail, 'whoosh', 0.6); cue(tMail + 0.32, 'ding', 0.8);
  win(tEM - 0.02, tEM + 0.4); win(tMail - 0.02, tMail + 0.45);
  // ---------- Étape 3 · Négocier ----------
  const SClio = scroll(EC, 505, [[w(103) - 0.02, w(103) + 0.42, 505, 1232], [we(109) - 0.12, we(109) + 0.26, 1232, 505], [we(112) + 0.08, we(112) + 0.64, 505, 3010], [we(121) + 0.16, we(121) + 0.56, 3010, 2304]]);
  // ---------- Étape 4 · Revendre ----------
  const tAch = w(135) - 0.02, tApres = tAch + 0.12, tOng = w(142) + 0.02, tVend = tOng + 0.14;
  const SVend = scroll(EV, GEO['bande-vendues'].y0, [[tVend + 0.1, tVend + 0.7, GEO['bande-vendues'].y0, 1440]]);
  cue(tAch, 'click', 1); cue(tApres + 0.2, 'ding', 0.8); cue(tOng, 'click', 0.8); win(tApres - 0.02, tApres + 0.36);

  // ---------- poses du téléphone ----------
  // chaque chapitre part d'une pose cachée sous la grosse couleur et arrive quand elle rentre dans son rond ; ensuite le
  // téléphone se tourne d'un côté à l'autre (ressort « default ») pour laisser la place au bloc qui sort
  const CHAPS = [
    [R1.c, [{ t: R1.c, x: 540, y: YT + 1150, z: 0, rx: 34, ry: -34, rz: 6 }, { t: R1.r - 0.1, y: YT, rx: 4, ry: -12, rz: 0 }, { t: tSeq - 0.1, x: 520, ry: 12 }, { t: tRap - 0.04, x: 500, ry: 9 }, { t: w(61) - 0.2, x: 470, ry: -12 }, { t: w(64), x: 520, ry: -9 }]],
    [R2.c, [{ t: R2.c, x: 1490, y: YT, z: -200, rx: 6, ry: -46, rz: 0 }, { t: R2.r - 0.1, x: 540, z: 0, rx: 4, ry: 12 }, { t: tEM - 0.06, x: 610, ry: -12 }, { t: tMail - 0.04, x: 570, ry: -6 }]],
    [R3.c, [{ t: R3.c, x: 540, y: YT + 1050, z: 0, rx: 36, ry: 0, rz: -9 }, { t: R3.r - 0.1, y: YT, rx: 4, ry: 12, rz: 0 }, { t: we(109) - 0.16, x: 480, ry: -12 }, { t: we(112) + 0.04, x: 470, ry: -13 }, { t: we(121) + 0.12, x: 480, ry: -8 }]],
    [R4.c, [{ t: R4.c, x: 540, y: YT, z: -1900, rx: 12, ry: 40, rz: 0 }, { t: R4.r - 0.1, x: 460, z: 0, rx: 4, ry: -12 }, { t: tOng - 0.06, x: 470, ry: -10 }]],
  ];
  CHAPS.forEach(([, K]) => K.slice(1).forEach((k) => win(k.t - 0.02, k.t + 0.5)));
  function telPose(t) {
    let C = null; for (const c of CHAPS) if (t >= c[0]) C = c;
    if (!C || t >= R5.c + 0.02) return null;
    const o = {};
    for (const p of ['x', 'y', 'z', 'rx', 'ry', 'rz']) o[p] = Motion.track(t, C[1].filter((k) => k[p] != null).map((k) => [k.t, k[p], 'default']));
    o.rx += 1.2 * Math.sin(t * 0.43); o.ry += 2.2 * Math.sin(t * 0.55 + 0.5); o.y += 7 * Math.sin(t * 0.8); o.rz += 0.4 * Math.sin(t * 0.37); o.s = 1;
    return o;
  }

  // =====================================================================================================
  // LES BLOCS QUI SORTENT DE L'ÉCRAN : le gros plan du bloc (capture 3×) part de sa place exacte sur l'écran du téléphone
  // (même taille, même inclinaison), sort vers nous jusqu'à sa place à l'écran (planche : bord droit ≤ 920, bas ≤ 1460),
  // à 260 px devant le plan net, face caméra, tourné de 8° ; un reflet le balaie ; il flotte ; il rentre à sa place quand
  // la voix passe à autre chose. Pendant qu'il est sorti, l'écran du téléphone recule dans l'ombre (plus sombre, flou).
  // =====================================================================================================
  const ZP = 260, POPS = [];
  // place d'un bloc à l'écran du téléphone (px de capture) : sur une page, à partir de sa place dans la page à plat
  const dansPage = (P, r) => () => ({ x: r.x * 2, y: 128 + (r.y - P.S) * 2, w: r.w * 2 });
  const RP = GEO.rects;
  const pop = (nom, t0, t1, src, cible, o = {}) => {
    const [iw, ih] = GEO['pop-' + nom], kz = SPH.persp / (SPH.persp - ZP), wd = cible.w / kz, ht = wd * ih / iw;
    const rcss = o.r ?? 26, ech = o.x2 ? 2 : 3;
    const box = obj(SPH.cam, wd, ht, { borderRadius: (rcss * wd / (iw / ech)).toFixed(1) + 'px', overflow: 'hidden', background: '#0b0a09' });
    im(box, 'pop-' + nom + '.png', { width: '100%', height: '100%' });
    const P = { nom, t0, t1, src, cible, box, wd, ht, iw, ih, B: reflet(box), ry: o.ry ?? 8 };
    POPS.push(P); win(t0 - 0.02, t0 + 0.42); win(t1 - 0.02, t1 + 0.34);
    cue(t0, 'pop', 0.7);   // un son par geste : le bloc qui sort ; il rentre sans bruit
    return P;
  };
  const tLien = tPaste + 0.24;
  const PLIEN = pop('lien', tLien, tTap + 0.16, () => ({ x: 50, y: 585, w: 680 }), { x: 320, y: 1180, w: 600 }, { x2: true, r: 14 });
  pop('cote268', w(50) - 0.06, we(52) - 0.04, () => ({ x: 60, y: 652, w: 660 }), { x: 280, y: 1180, w: 640 });   // de l'étape « Cote sur les annonces comparables »
  pop('polo-prix', tRap + 0.76, w(61) - 0.2, dansPage(EP, RP.polo.prix), { x: 280, y: 1210, w: 640 });
  pop('polo-verdict', w(61) + 0.28, w(64) - 0.06, dansPage(EP, RP.polo.verdict), { x: 380, y: 860, w: 540 });
  pop('polo-plafond', w(64) + 1.18, R2.c + 0.1, dansPage(EP, RP.polo.plafond), { x: 220, y: 1250, w: 700 });
  pop('generation', w(82) + 0.02, we(83) + 0.12, dansPage(ER, RP.recherche.generation), { x: 220, y: 1120, w: 700 }, { x2: true, r: 14 });
  pop('souscote', w(86) - 0.02, we(90) - 0.04, dansPage(ER, RP.recherche.souscote), { x: 220, y: 1250, w: 700 }, { x2: true, r: 14 });
  pop('alerte', tTog + 0.1, tMail - 0.3, () => ({ x: RP.mesrecherches.carte.x * 2, y: RP.mesrecherches.carte.y * 2, w: RP.mesrecherches.carte.w * 2 }), { x: 120, y: 1100, w: 540 }, { ry: -8 });
  pop('clio-prix', w(105) - 0.06, we(109) - 0.12, dansPage(EC, RP.clio.prix), { x: 280, y: 1250, w: 640 });
  pop('clio-verdict', we(109) + 0.26, we(112) + 0.04, dansPage(EC, RP.clio.verdict), { x: 380, y: 880, w: 540 });
  pop('clio-offre', w(116) - 0.08, we(121) + 0.08, dansPage(EC, RP.clio.offre), { x: 260, y: 1020, w: 660 });
  pop('clio-plafond', w(120) - 0.08, we(121) + 0.14, dansPage(EC, RP.clio.plafond), { x: 260, y: 1220, w: 660 });
  pop('clio-message', w(124) - 0.02, R4.c + 0.1, dansPage(EC, { x: 16, y: RP.clio.msglabel.y - 18, w: 358 }), { x: 380, y: 1040, w: 540 });
  pop('avis', tApres + 0.34, we(141) + 0.1, () => ({ x: GEO.avis.x, y: GEO.avis.y, w: GEO.avis.w }), { x: 300, y: 960, w: 600 });
  const PVEND = pop('vendue', w(148) - 0.02, R5.c + 0.1, dansPage(EV, { x: 16, y: RP.vendue.y + 265, w: 358 }), { x: 400, y: 960, w: 520 });
  // la marge réelle sur la fiche vendue : d'où part la couleur de la fin
  const MARGE = mk('div', 'a', PVEND.box, { left: '62%', top: '66%', width: '2px', height: '2px' });
  // le bouton « Analyser ce lien » du gros plan : appui (il s'écrase et s'éclaire, une onde part de sous son texte)
  const LBT = mk('div', 'a', PLIEN.box, { left: (24 / 680 * 100).toFixed(2) + '%', top: (125 / 235 * 100).toFixed(2) + '%', width: (632 / 680 * 100).toFixed(2) + '%', height: (100 / 235 * 100).toFixed(2) + '%', borderRadius: '999px', overflow: 'hidden', pointerEvents: 'none' });
  const LRP = mk('div', 'a', LBT, { left: '50%', top: '50%', width: '200px', height: '200px', marginLeft: '-100px', marginTop: '-100px', borderRadius: '50%', background: 'rgba(255,255,255,.45)', opacity: 0 });
  const LFL = mk('div', 'a', LBT, { left: '0', top: '0', width: '100%', height: '100%', background: '#fff', opacity: 0 });

  function paintPop(P, t, T) {
    const kin = SP(t, P.t0, 'default'), kout = SP(t, P.t1, 'snappy');
    const fini = t > P.t1 + 0.1 && kout > 0.985;
    if (!show(P.box, t >= P.t0 && !fini && T)) return 0;
    const k = Math.max(0, kin * (1 - Math.min(1, kout)) - Math.max(0, kout - 1));
    // départ : le bloc à sa place sur l'écran du téléphone (même taille, même inclinaison), juste devant l'écran
    const r = P.src(t), lw = r.w * KS, lh = lw * P.ih / P.iw;
    const lx = 16 + r.x * KS + lw / 2 - PW / 2, ly = 16 + r.y * KS + lh / 2 - PHH / 2;
    const [dx, dy, dz] = rot3(lx * T.s, ly * T.s, 3, T.rx, T.ry, T.rz);
    const A = [T.x + dx, T.y + dy, T.z + dz], sA = T.s * lw / P.wd;
    // arrivée : sa place à l'écran, à ZP devant le plan net, face caméra, tournée de P.ry
    const ys = P.cible.y + P.cible.w * P.ih / P.iw / 2 + 6 * Math.sin((t - P.t0) * 1.3) * Math.min(1, k);
    const Bp = versMonde(SPH, P.cible.x + P.cible.w / 2, ys, ZP), c = SPH.cp;
    put(P.box, lerp(A[0], Bp[0], k), lerp(A[1], Bp[1], k), lerp(A[2], Bp[2], k), { rx: lerp(T.rx, -c.rx, k), ry: lerp(T.ry, P.ry - c.ry + 1.5 * Math.sin((t - P.t0) * 0.9), k), rz: lerp(T.rz, -c.rz, k), s: lerp(sA, 1, k) });
    const kk = clamp(k, 0, 1);
    P.box.style.boxShadow = kk > 0.02 ? `0 ${(50 * kk).toFixed(0)}px ${(100 * kk).toFixed(0)}px -10px rgba(0,0,0,${(0.8 * kk).toFixed(3)}), 0 0 0 2px rgba(255,255,255,${(0.07 * kk).toFixed(3)})` : '';
    passe(P.B, t, P.t0 + 0.12, 0.62);
    return kk;
  }

  function paintTel(t) {
    const T = telPose(t);
    if (!show(SPH.root, !!T)) { POPS.forEach((P) => show(P.box, false)); return; }
    camera(SPH, { cx: 540 + 6 * Math.sin(t * 0.31), cy: 960 + 5 * Math.sin(t * 0.27), cz: 30 * Math.sin(t * 0.22), rx: 0.8 * Math.sin(t * 0.35), ry: 1.2 * Math.sin(t * 0.29), rz: 0 });
    put(PH, T.x, T.y, T.z, { rx: T.rx, ry: T.ry, rz: T.rz, s: T.s });
    // quel écran, à quel endroit
    ECRANS.forEach((e) => show(e, false));
    const pousse = (e, p, dir) => { e.style.transform = dir === 'haut' ? `translateY(${(1688 * (1 - p)).toFixed(1)}px)` : dir === 'bas' ? `translateY(${(-1688 * (1 - p)).toFixed(1)}px)` : `translateX(${(780 * (1 - p)).toFixed(1)}px)`; };
    const fond = (e, p, dir) => { e.style.transform = dir === 'gauche' ? `translateX(${(-240 * p).toFixed(1)}px)` : ''; e.style.filter = p > 0.01 ? `brightness(${(1 - 0.5 * p).toFixed(3)})` : ''; };
    ECRANS.forEach((e) => { e.style.transform = ''; e.style.filter = ''; });
    if (t < R2.c) {
      // Étape 1 : coller le lien, l'attente qui se coche, le rapport de la Polo
      if (t < tSeq) {
        show(E1, true);
        const pw = E(t, tPaste, 0.3, eOut3);
        E1c.style.clipPath = `polygon(90px 618px, ${(90 + 612 * pw).toFixed(1)}px 618px, ${(90 + 612 * pw).toFixed(1)}px 684px, 90px 684px)`;
        show(E1c, t >= tPaste);
        const ab = SP(t, tBtn, 'snappy'), m = 350 * (1 - Math.min(1, ab));
        E1b.style.clipPath = `inset(700px ${m.toFixed(1)}px 846px ${m.toFixed(1)}px round 60px)`;
        show(E1b, t >= tBtn);
      } else {
        const pr = E(t, tRap, 0.42, doux);
        if (pr < 1) {
          show(ES, true);
          const r = (fq(t) - tSeq) * KSEQ; let i = 0; while (i < GEO.analyse.length - 1 && GEO.analyse[i + 1][1] <= r) i++;
          SEQ.forEach((e, j) => show(e, j === i));
          fond(ES, pr);
        }
        if (t >= tRap) { show(EP.e, true); posePage(EP, SPolo(t)); pousse(EP.e, pr, 'haut'); }
      }
    } else if (t < R3.c) {
      // Étape 2 : la recherche, l'alerte allumée, l'e-mail
      const pm = E(t, tEM, 0.38, doux), pl = E(t, tMail, 0.42, doux);
      if (pm < 1) { show(ER.e, true); posePage(ER, SRech(t)); fond(ER.e, pm, 'gauche'); }
      if (t >= tEM && pl < 1) {
        show(EM, true); pousse(EM, pm, 'droite'); fond(EM, pl);
        show(EMon, t >= tTog); appuie(EMt, t, tTog); show(EMt, t >= tTog);
      }
      if (t >= tMail) { show(EML, true); pousse(EML, pl, 'bas'); }
    } else if (t < R4.c) {
      // Étape 3 : le rapport de la Clio
      show(EC.e, true); posePage(EC, SClio(t));
    } else {
      // Étape 4 : le parc, « Acheter », l'onglet « Vendues »
      if (t < tVend) {
        show(EA, true);
        show(EAp, t >= tApres); show(EAb, t < tApres); appuie(EAb, t, tAch);
        show(EAo, t >= tOng - 0.02); appuie(EAo, t, tOng);
        const av = E(t, tApres, 0.32, eOut3);
        show(EAv, t >= tApres); EAv.style.transform = `translateY(${(-220 * (1 - av)).toFixed(1)}px)`;
      } else { show(EV.e, true); posePage(EV, SVend(t)); }
    }
    // les blocs qui sortent ; l'écran recule dans l'ombre pendant qu'un bloc est sorti
    let dim = 0; POPS.forEach((P) => { dim = Math.max(dim, paintPop(P, t, T)); });
    SCR.style.filter = dim > 0.01 ? `brightness(${(1 - 0.34 * dim).toFixed(3)}) blur(${(2.4 * dim).toFixed(2)}px)` : '';
    // l'appui sur « Analyser ce lien » (dans le gros plan)
    const b = bump(t, tTap, 0.14), rp = E(t, tTap, 0.5, eOut3);
    PLIEN.box.style.transform += ` scale(${(1 - 0.035 * b).toFixed(4)})`;
    LFL.style.opacity = (0.22 * b).toFixed(3);
    LRP.style.transform = `scale(${(0.1 + 4 * rp).toFixed(3)})`; LRP.style.opacity = (t >= tTap && t < tTap + 0.5 ? 0.55 * (1 - rp) : 0).toFixed(3);
  }

  // ---------- les sous-titres des chapitres ----------
  // sur la grosse couleur, au centre : « Étape N » et le verbe, à l'encre foncée sur l'orange ; ils partent quand elle
  // rentre dans son rond
  ph([[['Étape', 31, 'k'], ['1', 32, 'k']], [['Analyser.', 33, 'k']]], { y: 690, size: 170, out: R1.r - 0.12, encre: true, zoom: [R1.c, R1.r - R1.c, 0.06] });
  ph([[['Étape', 76, 'k'], ['2', 77, 'k']], [['Trouver.', 78, 'k']]], { y: 690, size: 170, out: R2.r - 0.12, encre: true, zoom: [R2.c, R2.r - R2.c, 0.06] });
  ph([[['Étape', 99, 'k'], ['3', 100, 'k']], [['Négocier.', 101, 'k']]], { y: 690, size: 170, out: R3.r - 0.12, encre: true, zoom: [R3.c, R3.r - R3.c, 0.06] });
  ph([[['Étape', 130, 'k'], ['4', 131, 'k']], [['Revendre.', 132, 'k']]], { y: 690, size: 170, out: R4.r - 0.12, encre: true, zoom: [R4.c, R4.r - R4.c, 0.06] });
  // sous le fil des étapes (y 380) : les mots qui portent, 3 à 6 par écran
  ph([[['Copie', 34], ['le', 35], ['lien,', 36, 'k']], [['colle-le.', mot(41, 42), 'k']]], { y: 380, size: 104 });
  ph([[['268', 50, 'k'], ['Polo', 51]], [['comparables,', 52]]], { y: 380, size: 104 });
  ph([[['1 533 €', mot(53, 55), 'r'], ['au-dessus', mot(56, 57)]], [['de', 58], ['la', 59], ['cote.', 60]]], { y: 380, size: 104 });
  ph([[['Verdict :', 61]], [['à', 62, 'r'], ['éviter.', 63, 'r']]], { y: 380, size: 110 });
  ph([[['Pour', 64], ['garder', 65]], [['750 €', mot(66, 67), 'g'], ['de', 68], ['marge,', 69]]], { y: 380, size: 104 });
  ph([[['paie-la', mot(70, 71)]], [['5 750 €', mot(72, 73), 'g'], ['au', 74], ['plus.', 75]]], { y: 380, size: 104, out: R2.c - 0.02 });
  ph([[['Lance', 79], ['une', 80]], [['recherche.', 81, 'k']]], { y: 380, size: 104 });
  ph([[['Clio 4,', mot(82, 83), 'k']], [['15 %', mot(84, 87), 'g'], ['sous', 88], ['la', 89], ['cote.', 90]]], { y: 380, size: 104 });
  ph([[['Une annonce', 92]], [['passe', 93], ['dessous,', 94, 'g']]], { y: 380, size: 104 });   // « Une annonce » s'écrit sur « annonce » : « …sous la cote. » a le temps d'apparaître
  ph([[['Tu', 95], ['reçois', 96]], [['un', 97], ['mail.', 98, 'k']]], { y: 380, size: 104, out: R3.c - 0.02 });
  ph([[['Cette', 102], ['Clio,', 103, 'k']], [['2 064 €', mot(105, 106), 'g'], ['sous', 107], ['la', 108], ['cote.', 109]]], { y: 380, size: 104 });
  ph([[['Très bonne', 111, 'g']], [['affaire.', 112, 'g']]], { y: 380, size: 120 });   // « Très bonne » s'écrit sur « bonne » : « …sous la cote. » a le temps d'apparaître
  ph([[['Tu', 113], ['ouvres', 114]], [['à', 115], ['7 400 €,', mot(116, 117), 'k']]], { y: 380, size: 104 });
  ph([[['sans', 118], ['dépasser', 119, 'r']], [['7 900 €.', mot(120, 121), 'r']]], { y: 380, size: 104 });
  ph([[['Ton', 123], ['1er', 124], ['message', 125, 'k']], [['est', 128], ['prêt.', 129, 'g']]], { y: 380, size: 104, out: R4.c - 0.02 });
  ph([[['Tu', 133], ["l'achètes,", mot(134, 135), 'k']], [['tu', 136], ["l'ajoutes.", mot(137, 141)]]], { y: 380, size: 104 });
  ph([[['Et', 142], ['à', 143], ['la', 144], ['vente,', 145, 'k']]], { y: 380, size: 110 });
  ph([[['Ce', 148], ["qu'elle", mot(149, 150)]], [["t'a", mot(151, 152)], ['rapporté.', 153, 'g']]], { y: 380, size: 110 });
  ph([[['Ta', 156], ['1re', 157], ['analyse', 158]], [['est', 159], ['offerte.', 160, 'g']]], { y: 380, size: 110 });
  ph([[['Le', 161], ['lien', 162, 'k']], [['est', 163], ['en', 164], ['bio.', 165, 'k']]], { y: 380, size: 110, out: w(166) - 0.1 });

  // =====================================================================================================
  // FIN · « Ta première analyse est offerte : le lien est en bio. utopicar. Achète juste, revends mieux. » : la couleur
  //       part de la marge réelle ; l'icône officielle s'anime sur l'orange (la tuile se pose, la silhouette se dessine
  //       d'un trait, la flèche file, l'aileron se pose) ; la pastille « Ta 1re analyse offerte · lien en bio » s'écrit
  //       avec la voix ; l'icône glisse à gauche et « utopicar » s'écrit à sa droite ; la signature ; le fil des quatre
  //       étapes, toutes cochées, reste en haut ; la boucle repart sur la Polo dans un cercle.
  // =====================================================================================================
  const GL = mk('div', 'lay', ST, { zIndex: 14 });
  const YL = 760;                                    // centre du logo en (540, YL) ; 1 unité du SVG = U px (fixé plus bas)
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
  const tTile = R5.c + 0.02, tDraw = tTile + 0.26, tArr = tTile + 0.7, tFin2 = tTile + 0.82, tSl = w(166) - 0.3, tWd = w(166) + 0.1, tBio = w(156) + 0.12;   // la pastille s'écrit avec « Ta première analyse est offerte : le lien est en bio »
  const SIG1 = phrase([[['Achète', 167], ['juste.', 168]]], { y: 1000, size: 124, out: 99, parent: GL });
  const SIG2 = phrase([[['Revends', 169, 'k'], ['mieux.', 170, 'k']]], { y: 1140, size: 140, out: 99, font: 'italic 400 140px Instrument', ls: '0em', parent: GL });
  // la pastille de l'appel à l'action (planche) : elle s'élargit à mesure qu'elle s'écrit (largeur de chaque début de texte mesurée)
  const BIOTXT = 'Ta 1re analyse offerte · lien en bio', DLB = 0.058;
  const BIO = mk('div', 'a', GL, { height: '96px', borderRadius: '48px', background: '#f4f1ec', color: '#1c1612', font: '700 36px/96px Satoshi', padding: '0 0 0 44px', whiteSpace: 'nowrap', overflow: 'hidden' });
  const BIOW = (() => { const m = mk('span', 'a nw', GL, { font: '700 36px Satoshi', visibility: 'hidden', whiteSpace: 'pre' }); const r = [...BIOTXT].map((c, i) => { m.textContent = BIOTXT.slice(0, i + 1); return largeur(m); }); m.remove(); return [0, ...r]; })();
  const BIOT = mk('span', '', BIO, null, ''); const BIOC = mk('span', '', BIO, { display: 'inline-block', width: '4px', height: '44px', background: '#ff5a1f', marginLeft: '4px', verticalAlign: '-8px' });
  cue(tTile, 'impact', 0.9); cue(tDraw, 'whoosh', 0.5); cue(tArr, 'pop', 0.9); cue(tFin2, 'tick', 0.5); letters.forEach((L, i) => cue(tWd + i * 0.055, 'key', 0.4)); [...BIOTXT].forEach((c, i) => { if (c !== ' ' && i % 2 === 0) cue(tBio + i * DLB, 'key', 0.3); }); cue(TLOOP, 'whoosh', 0.9);
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
    const out = E(t, TLOOP - 0.12, 0.4, lisse), drift = 22 * E(t, w(169), TLOOP - w(169), (p) => p * (2 - p));   // la fin s'efface avant que le cercle de la boucle ne l'atteigne
    tf(holder, 540 - (XC + 40) * U, YL - 160 * U - drift, { o: 1 - out, s: 1 - 0.12 * out });
    holder.style.transformOrigin = `${((XC + 40) * U).toFixed(1)}px ${(160 * U).toFixed(1)}px`;
    // « utopicar » : chaque lettre monte de sous la ligne de base, au rythme de la voix
    letters.forEach((L, i) => { const p = E(t, tWd + i * 0.055, 0.42, eOut3); L.g.style.transform = `translateY(${(1150 * (1 - p)).toFixed(1)}px)`; });
    SIG1.box.style.transform = `translateY(${(-drift).toFixed(1)}px)`; SIG1.box.style.opacity = (1 - out).toFixed(3);
    SIG2.box.style.transform = `translateY(${(-drift).toFixed(1)}px)`; SIG2.box.style.opacity = (1 - out).toFixed(3);
    const NB = BIOTXT.length, n = clamp(Math.floor((t - tBio) / DLB) + 1, 0, NB); BIOT.textContent = BIOTXT.slice(0, n);
    const bw = 44 + BIOW[n] + 8 + 46; show(BIO, t >= tBio - 0.15);
    BIO.style.width = bw.toFixed(1) + 'px'; tf(BIO, 540 - bw / 2, 1340 - drift, { s: SP(t, tBio - 0.15, 'snappy') * (1 - out), o: 1 - out });
    BIOC.style.opacity = n < NB || Math.floor((t - tBio) / 0.4) % 2 === 0 ? '1' : '0';
  }
  // =====================================================================================================
  // CHANGEMENTS DE CHAPITRE (v9, v11) : une grosse couleur prend tout l'écran en partant d'un objet ; en v11 elle sort du
  // rond de l'étape qui commence, porte le nom de l'étape, puis rentre dans ce rond (son disque se resserre jusqu'à lui)
  // et découvre le téléphone ; à la fin, elle part de la marge réelle et s'ouvre en trou sur le logo. Le voile est un calque plein au-dessus des scènes (sous la fin et les sous-titres) : un dégradé radial
  // pour la couleur qui entre, un second pour le trou qui la retire, croisés (mask-composite) ; un centre lointain
  // donne un bord presque droit. Le bord est flou en proportion de sa vitesse (la moitié du chemin d'une image).
  // =====================================================================================================
  const VOILE = mk('div', 'lay', ST, { zIndex: 13, pointerEvents: 'none', display: 'none' });
  const VCOL = { o: '#ff5a1f', r: '#d92d34', v: '#139a57', n: '#1f2a7c', a: '#ff6f4f' };
  const vif = bez(0.55, 0.05, 0.2, 1);                // la couleur part vite et se pose
  const centre = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const couvre = ([x, y]) => 30 + Math.max(...[[0, 0], [1080, 0], [0, 1920], [1080, 1920]].map(([a, b]) => Math.hypot(x - a, y - b)));
  const BAS = [540, 3400], HAUT = [540, -1480], GAUCHE = [-2440, 960];
  // les objets d'où partent les couleurs, mesurés à l'image où elles partent (seek repeint tout ensuite)
  paintTel(R5.t0); const P5 = centre(MARGE);
  paintFin(tTile + 0.45); const Q5 = centre(tile);
  const LOIN = [-6000, -6000];                          // pas de trou : la couleur rentre dans le rond
  const RIDEAUX = [
    ...RR.map((R, i) => ({ ...R, col: VCOL.o, lum: true, c1: [RX(i), RY], r1: [30, couvre([RX(i), RY])], r1fin: 30, c2: LOIN, r2: [0, 0] })),   // l'orange sort du rond de l'étape et y rentre
    { ...R5, col: VCOL.o, c1: P5, r1: [40, couvre(P5)], c2: Q5, r2: [0, couvre(Q5)] },                                                // l'orange part de la marge réelle, s'ouvre sur le logo
  ];
  RIDEAUX.forEach((R) => { cue(R.t0, 'whoosh', 1); cue(R.c, 'impact', 0.5); cue(R.r, 'pop', 0.5); win(R.t0 - 0.02, R.c + 0.02); win(R.r - 0.02, R.e + 0.02); });
  // l'état du voile à l'instant t : la couleur, son disque (centre, rayon, flou du bord) et le trou qui la retire
  function voile(t) {
    const R = RIDEAUX.find((q) => t >= q.t0 && t < q.e);
    if (!R) return null;
    const r1f = (u) => { let r = lerp(R.r1[0], R.r1[1], E(u, R.t0, R.dc, vif)); if (R.r1fin != null) r = lerp(r, R.r1fin, E(u, R.r, R.dr, eOut3)); return r; };
    const r2f = (u) => lerp(R.r2[0], R.r2[1], E(u, R.r, R.dr, eOut3));
    const flou = (f) => clamp(Math.abs(f(t + 0.004) - f(t - 0.004)) / 0.008 / 60, 1.5, 140);   // la moitié du chemin d'une image
    const [cx, cy] = typeof R.c1 === 'function' ? R.c1(E(t, R.t0, R.dc, vif)) : R.c1;
    const V = { R, cx, cy, r1: r1f(t), f1: flou(r1f) };
    if (t >= R.r) { V.r2 = r2f(t); V.f2 = Math.max(R.doux || 0, flou(r2f)); }
    return V;
  }
  function peintVoile(t) {
    const V = voile(t);
    if (!show(VOILE, !!V)) return;
    const { R, cx, cy, r1, f1 } = V;
    const L = [`radial-gradient(circle at ${cx.toFixed(1)}px ${cy.toFixed(1)}px, #000 ${Math.max(0, r1 - f1).toFixed(1)}px, rgba(0,0,0,0) ${r1.toFixed(1)}px)`];
    if (V.r2 != null) L.push(`radial-gradient(circle at ${R.c2[0].toFixed(1)}px ${R.c2[1].toFixed(1)}px, rgba(0,0,0,0) ${V.r2.toFixed(1)}px, #000 ${(V.r2 + V.f2).toFixed(1)}px)`);
    const m = L.join(', ');
    const u = t - R.t0;
    VOILE.style.background = R.lum ? `radial-gradient(circle at ${(540 + 240 * Math.sin(u * 1.2)).toFixed(1)}px ${(900 + 220 * Math.cos(u * 0.9)).toFixed(1)}px, #ff7f4c 0%, ${R.col} 62%)` : R.col;
    VOILE.style.maskImage = m; VOILE.style.webkitMaskImage = m;
    VOILE.style.maskComposite = 'intersect'; VOILE.style.webkitMaskComposite = 'source-in';
  }
  // part de couleur en un point de l'écran (mêmes masques que ci-dessus) et la teinte qui se lit dessus : le foncé de
  // l'encre, ou le blanc sur le bleu nuit
  VOILE_A = (t) => {
    const V = voile(t); if (!V) return null;
    const sur = V.R.col === VCOL.n ? [244, 241, 236] : [22, 9, 4];
    return (x, y) => {
      let a = clamp((V.r1 - Math.hypot(x - V.cx, y - V.cy)) / Math.max(1, V.f1), 0, 1);
      if (V.r2 != null) a *= clamp((Math.hypot(x - V.R.c2[0], y - V.R.c2[1]) - V.r2) / Math.max(1, V.f2), 0, 1);
      return [a, sur];
    };
  };
  // couleurs du fond, scène par scène (elles changent sous la grosse couleur)
  // (sauf trois moments dits par la voix : « à éviter » au rouge, « un mail » à la nuit, « ce qu'elle t'a rapporté » au vert)
  PALK = [[0, 'o'], [tFlip, 'r'], [R1.c, 'o'], [w(62) - 0.1, 'r'], [R2.c, 'o'], [w(97) - 0.1, 'n'], [R3.c, 'v'], [R4.c, 'o'], [w(148) - 0.1, 'v'], [R5.c, 'o']];
  // la trame du fond suit le téléphone (il glisse d'un côté à l'autre) et chaque défilement de l'écran (l'espace bouge)
  const telX = (t) => { const T = telPose(t); return T ? T.x - 540 : 0; };
  const cumul = (t) => DEFILS.reduce((a, [t0, t1, d]) => a + d * glisse(clamp((t - t0) / (t1 - t0), 0, 1)), 0);
  FDX = (t) => -0.25 * telX(t);
  FDY = (t) => -0.12 * cumul(t);
  FDV = (t) => [0.5 * Math.abs(telX(t + 0.017) - telX(t - 0.017)) * 0.25, 0.5 * Math.abs(cumul(t + 0.017) - cumul(t - 0.017)) * 0.12];

  // sous-titres du haut : chacun est sorti (0,2 s) avant que le suivant tape sa première lettre
  { const top = PHR.filter((p) => p.haut).sort((a, b) => a.first - b.first); for (let i = 0; i < top.length - 1; i++) top[i].out = Math.min(top[i].out, top[i + 1].first - 0.26); }

  // empilement : la scène qui arrive passe DEVANT celle qui recule
  S1.root.style.zIndex = '2'; SPH.root.style.zIndex = '5';

  // ---------- seek ----------
  window.seek = (t) => {
    const tt = t < TLOOP ? t : 0, boucle = t >= TLOOP;
    peintFond(BLOBS, GRAIN, t);
    FLASH.style.opacity = '0';
    paintS1(tt); paintRail(t); paintTel(t); paintFin(t);
    peintVoile(t);
    for (const p of PHR) p.paint(tt);
    // la boucle : S1 (image 0, sur son propre fond) et ses sous-titres reviennent dans un cercle qui s'ouvre
    const cercle = boucle ? `circle(${(2300 * E(t, TLOOP + 0.06, DUR - TLOOP - 0.08, eIO)).toFixed(0)}px at ${ICX.toFixed(0)}px ${YL}px)` : '';   // depuis l'icône du logo
    S1.root.style.clipPath = cercle; TXT.style.clipPath = cercle;
    S1.root.style.zIndex = boucle ? '16' : '2';
    show(F1, boucle); if (boucle) peintFond(F1B, F1G, 0, false);
  };
  const inWin = (t) => FAST.some(([a, b]) => t >= a && t <= b);
  window.shutter = (t) => (inWin(t) ? 1 : 0.5);
  window.samples = (t) => (inWin(t) ? 8 : 4);
  window.filmDur = DUR;
  window.cues = CUES.sort((x, y) => x.t - y.t);
  await Promise.all(IMGS.map((e) => e.decode().catch(() => {})));   // toutes les captures prêtes avant la première image
  window.seek(0);
  window.filmReady = true;
})().catch((e) => { console.error('FILM', e.message, e.stack); document.title = 'ERREUR ' + e.message; });

