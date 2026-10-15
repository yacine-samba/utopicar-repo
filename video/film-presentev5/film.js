// Présentation utopicar v5 (9:16, voix de Simon) : typographie cinétique lettre à lettre + caméra 3D.
// Retour de l'utilisateur sur la v4 : « trop plat, trop d'interface, peu de dynamisme, pas de hook ; les textes
// doivent apparaître mot à mot, lettre par lettre ; je veux des mouvements de caméra, de la perspective ; si tu fais
// défiler des recherches, ça doit prendre tout l'écran, BEAUCOUP plus immersif ». Grammaire étudiée image par image
// chez 1600.agency : lemlist (texte qui arrive énorme puis se pose, mot neuf en couleur, ligne qui se recentre),
// Juicebox (lettres toutes les 33 ms, petites puis à leur taille), Notion (texte tapé dans une pastille qui bascule
// en 3D, interface inclinée en très gros plan), appli de rencontre (mots géants derrière l'objet, photos en 3D).
// Monde en 3D CSS : chaque scène a une perspective et une caméra (dolly, orbite, bascule) ; l'interface n'apparaît
// qu'en objets (carte, liste, horloge), jamais en écran plein et plat. Contrat : window.seek(t) peint l'image t.
(async function () {
  const { spring, clamp, lerp } = Motion;
  const ST = document.getElementById('stage');
  const J = async (u) => (await fetch(u)).json();
  const WD = await J('../audio/vo-presentev3/vo.words.json');
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
  const eIn2 = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p);                 // sortie de scène : part tout de suite, accélère
  const eOut3 = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(1 - p, 3));
  const lisse = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p));
  const E = (t, t0, d, f = doux) => f(clamp((t - t0) / d, 0, 1));
  const SP = (t, t0, pr = 'default') => (t < t0 ? 0 : spring(t - t0, pr));
  const bump = (t, t0, d = 0.14) => clamp(spring(t - t0, 'snappy') - spring(t - t0 - d, 'snappy'), 0, 1);
  const tr = (t, keys) => Motion.track(t, keys);
  const mix = (a, b, p) => a.map((v, i) => lerp(v, b[i], p));
  const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const rgb = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

  // ---------- éléments ----------
  const mk = (tag, cls, parent, css, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const show = (e, v) => { e.style.display = v ? '' : 'none'; return v; };
  const nb = (h) => (typeof h === 'string' ? h.replace(/(\d) (?=\d{3}(?!\d))/g, '$1 ').replace(/ (€|%)/g, ' $1') : h);
  // pose 2D (coin haut-gauche ou centre)
  const tf = (e, x, y, o = {}) => {
    e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)${o.c ? ' translate(-50%,-50%)' : ''} rotate(${(o.r || 0).toFixed(2)}deg) scale(${(o.sx ?? o.s ?? 1).toFixed(4)},${(o.sy ?? o.s ?? 1).toFixed(4)})`;
    if (o.o != null) e.style.opacity = clamp(o.o, 0, 1).toFixed(3);
    if (o.b != null) e.style.filter = o.b > 0.15 ? `blur(${o.b.toFixed(2)}px)` : '';
  };
  // pose 3D : le CENTRE de l'élément en (x, y, z) du monde, puis rotations autour de son centre
  const put = (e, x, y, z, o = {}) => {
    e.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) translate(-50%,-50%) rotateX(${(o.rx || 0).toFixed(2)}deg) rotateY(${(o.ry || 0).toFixed(2)}deg) rotateZ(${(o.rz || 0).toFixed(2)}deg) scale(${(o.s ?? 1).toFixed(4)})`;
    if (o.o != null) e.style.opacity = clamp(o.o, 0, 1).toFixed(3);
    if (o.b != null) e.style.filter = o.b > 0.15 ? `blur(${o.b.toFixed(2)}px)` : '';
  };
  // une scène 3D : perspective, caméra (cible cx, cy, tz ; recul cz ; bascules), monde en preserve-3d
  const scene = (persp = 1300) => {
    const root = mk('div', 'lay', ST, { perspective: persp + 'px', perspectiveOrigin: '540px 960px', overflow: 'hidden' });
    const cam = mk('div', 'lay', root, { transformStyle: 'preserve-3d', transformOrigin: '540px 960px' });
    return { root, cam, persp, cp: { cx: 540, cy: 960, cz: 0, tz: 0, rx: 0, ry: 0, rz: 0 } };
  };
  // la caméra pivote autour du point visé (cx, cy, tz) : un traveling en profondeur garde la cible au centre
  const camera = (S, { cx = 540, cy = 960, cz = 0, tz = 0, rx = 0, ry = 0, rz = 0 }) => {
    S.cp = { cx, cy, cz, tz, rx, ry, rz };
    S.cam.style.transform = `translateZ(${cz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) translate3d(${(540 - cx).toFixed(1)}px,${(960 - cy).toFixed(1)}px,${(-tz).toFixed(1)}px)`;
  };
  // point du monde qui s'affiche en (X, Y) de l'écran, à la profondeur q devant le plan net (inverse de la caméra)
  const RAD = Math.PI / 180;
  const versMonde = (S, X, Y, q) => {
    const { cx, cy, cz, tz, rx, ry, rz } = S.cp, k = (S.persp - q) / S.persp;
    let x = (X - 540) * k, y = (Y - 960) * k, z = q - cz, a;
    a = -rx * RAD; [y, z] = [y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
    a = -ry * RAD; [x, z] = [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)];
    a = -rz * RAD; [x, y] = [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    return [cx + x, cy + y, tz + z];
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
  const milliers = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const eur = (n) => `${milliers(n)} €`;

  // =====================================================================================================
  // FOND : sombre de l'app + taches de couleur qui bougent (appli de rencontre de 1600 : gros dégradés vivants)
  // =====================================================================================================
  const FOND = mk('div', 'lay', ST, { background: '#0b0a09' });
  const BLOBS = [0, 1, 2].map(() => mk('div', 'a', FOND, { width: '1700px', height: '1700px', left: '-850px', top: '-850px' }));
  const GRAIN = mk('div', 'lay', FOND, { background: 'radial-gradient(rgba(244,241,236,.07) 1.4px, transparent 1.6px) 0 0/34px 34px' });   // grille de points (lemlist)
  const PAL = {
    o: [[255, 90, 31, 0.5], [190, 40, 20, 0.42], [255, 160, 90, 0.22]],
    r: [[235, 45, 45, 0.55], [150, 15, 30, 0.5], [255, 90, 31, 0.25]],
    v: [[40, 200, 120, 0.42], [10, 100, 70, 0.45], [180, 230, 120, 0.18]],
    n: [[70, 90, 240, 0.5], [120, 60, 220, 0.38], [20, 30, 110, 0.6]],
    a: [[255, 130, 80, 0.48], [230, 70, 120, 0.36], [255, 200, 120, 0.22]],
  };
  const tFlip = w(9) - 0.12;
  const PALK = [[0, 'o'], [tFlip, 'r'], [w(14) - 0.2, 'o'], [w(28), 'r'], [w(33) - 0.25, 'v'], [w(48) - 0.25, 'o'], [w(60) - 0.15, 'n'], [w(66) - 0.25, 'a'], [w(76) - 0.2, 'o'], [w(85) - 0.15, 'v'], [w(88) - 0.1, 'o']];
  function fond(t) {
    let c = PAL[PALK[0][1]];
    for (let i = 1; i < PALK.length; i++) { const [t0, k] = PALK[i]; c = c.map((v, j) => mix(v, PAL[k][j], E(t, t0, 0.35, eIO))); }
    const pos = [[300 + 320 * Math.sin(t * 0.55), 480 + 260 * Math.cos(t * 0.43)], [800 + 260 * Math.cos(t * 0.47 + 1), 1500 + 240 * Math.sin(t * 0.51)], [560 + 380 * Math.sin(t * 0.33 + 2), 1000 + 420 * Math.cos(t * 0.29)]];
    BLOBS.forEach((h, i) => { const [r, g, b, a] = c[i]; h.style.background = `radial-gradient(circle at 50% 50%, rgba(${r | 0},${g | 0},${b | 0},${a.toFixed(3)}) 0%, rgba(${r | 0},${g | 0},${b | 0},0) 58%)`; tf(h, pos[i][0], pos[i][1], { s: 1 + 0.15 * Math.sin(t * 0.7 + i * 2) }); });
    GRAIN.style.transform = `translateY(${(-(t * 22) % 34).toFixed(1)}px)`;
  }

  // =====================================================================================================
  // TYPOGRAPHIE : chaque lettre « tape » (toutes les 33 ms au plus), arrive petite, floue et basse, et se pose à sa
  // taille (Juicebox) ; la ligne se recentre à mesure qu'elle s'écrit (Notion, lemlist) ; chaque mot s'allume au
  // passage de la lueur, les mots clés gardent leur couleur. Sortie : bascule 3D vers le haut, floue.
  // LUEUR (demande de l'utilisateur) : une tête de lumière parcourt chaque ligne de gauche à droite au rythme de la
  // voix (début → fin de chaque mot dans vo.words.json), avec une traîne derrière elle ; halo doux permanent.
  // =====================================================================================================
  const TXT = mk('div', 'lay', ST, { perspective: '1100px', perspectiveOrigin: '540px 600px', zIndex: 20 });
  const COL = { w: '#f4f1ec', k: '#ff8a4c', r: '#ff6b6b', g: '#3ecb7f', b: '#a9b8ff', o: '#ff5a1f' };
  const BLANC = [255, 246, 236];
  // position de la tête de lumière sur une ligne : clés [[t, x], …] (début et fin de chaque mot), puis elle file au-delà
  const tete = (K, t) => {
    if (t < K[0][0]) return null;
    for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const [t0, x0] = K[i - 1], [t1, x1] = K[i]; return t1 > t0 ? lerp(x0, x1, (t - t0) / (t1 - t0)) : x1; }
    const [tl, xl] = K[K.length - 1]; return xl + 2200 * (t - tl);
  };
  // intensité de la lueur sur une lettre centrée en xc : front court devant la tête, traîne longue derrière
  const lueur = (xc, X, size) => { if (X == null) return 0; const d = xc - X; return d > 0 ? Math.exp(-((d / (0.5 * size)) ** 2)) : Math.exp(d / (2.2 * size)); };
  // applique la lueur g (0 → 1) à une lettre : cœur chauffé à blanc, halo de sa couleur, large rayonnement, petite vague
  const allume = (el, base, halo, g, size) => {
    el.style.color = rgb(mix(base, BLANC, 0.9 * g));
    const h = `${halo[0]},${halo[1]},${halo[2]}`;
    el.style.textShadow = g > 0.02
      ? `0 0 ${(0.04 * size + 0.1 * size * g).toFixed(1)}px rgba(255,250,240,${(0.9 * g).toFixed(3)}), 0 0 ${(0.25 * size + 0.3 * size * g).toFixed(1)}px rgba(${h},${(0.25 + 0.65 * g).toFixed(3)}), 0 0 ${(0.9 * size * g).toFixed(1)}px rgba(${h},${(0.4 * g).toFixed(3)})`
      : `0 0 ${(0.3 * size).toFixed(1)}px rgba(${h},0.22)`;
  };
  // lignes : [[mot, index du mot de la voix, couleur], …] ; une phrase = plusieurs lignes
  function phrase(lignes, o = {}) {
    const size = o.size ?? 116, lh = o.lh ?? 1.04, y0 = o.y ?? 250, font = o.font || `600 ${size}px Clash`;
    const box = mk('div', 'lay', TXT, { transformStyle: 'preserve-3d', transformOrigin: `540px ${y0 + size}px` });
    // halo de la lueur : une source de lumière douce derrière les lettres, qui glisse avec la voix
    const HW = Math.round(2.8 * size), HH = Math.round(1.7 * size);
    const HALO = mk('div', 'a', box, { width: HW + 'px', height: HH + 'px', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,160,100,.55), rgba(255,90,31,.22) 55%, rgba(255,90,31,0))', pointerEvents: 'none', opacity: 0 });
    const L = lignes.map((mots, li) => {
      const line = { y: y0 + li * size * lh, mots: [] };
      let x = 0;
      mots.forEach(([s, iv, col], mi) => {
        const t0 = w(iv) + (o.dt || 0), chars = [...nb(s)], dl = Math.min(0.033, 0.26 / Math.max(1, chars.length));
        const M = { col: col || 'w', t0, te: WD[iv].e + (o.dt || 0), L: [] };
        chars.forEach((ch, j) => {
          const sp = mk('span', 'a nw', box, { font, letterSpacing: o.ls ?? '-.03em', color: COL[col || 'w'], transformOrigin: '50% 90%', whiteSpace: 'pre', fontStyle: o.italic ? 'italic' : '' }, ch);
          M.L.push({ el: sp, x, wd: 0, t: t0 - 0.07 + j * dl });
          x += 0; // mesuré plus bas
        });
        if (mi < mots.length - 1) M.space = true;
        line.mots.push(M);
      });
      return line;
    });
    // mesures : avance de chaque lettre (espace compris) dans la police réelle
    const meas = mk('span', 'a nw', TXT, { font, letterSpacing: o.ls ?? '-.03em', visibility: 'hidden', whiteSpace: 'pre', fontStyle: o.italic ? 'italic' : '' });
    for (const line of L) {
      let x = 0; const all = [];
      line.mots.forEach((M) => {
        M.L.forEach((l) => { meas.textContent = l.el.textContent; l.wd = meas.getBoundingClientRect().width; l.x = x; x += l.wd; all.push(l); });
        if (M.space) { meas.textContent = ' '; x += meas.getBoundingClientRect().width * 1.15; }
      });
      line.wd = x; line.all = all;
      // trajet de la lueur : du premier au dernier caractère de chaque mot pendant qu'il est dit
      const K = []; let tp = -1;
      line.mots.forEach((M) => {
        const a = M.L[0], b = M.L[M.L.length - 1];
        let s = Math.max(M.t0, tp), e = Math.max(M.te, s + 0.12);
        K.push([s, a.x], [e, b.x + b.wd]); tp = e;
      });
      line.K = K;
    }
    meas.remove();
    const fit = Math.min(1, (o.maxW ?? 880) / Math.max(...L.map((l) => l.wd)));
    const P = { box, L, size, fit, out: o.out ?? 99, kind: o.kind || 'bascule', t0: L[0].mots[0].t0, y0, first: L[0].mots[0].L[0].t };
    P.paint = (t) => {
      const on = t >= P.t0 - 0.12 && t < P.out + 0.3; if (!show(box, on)) return;
      const q = E(t, P.out, 0.2, (p) => p * p);
      let hb = 0, hxp = 0, hyp = 0;
      for (const line of L) {
        // largeur visible (lettres déjà posées) → la ligne se recentre en douceur
        let vis = 0; line.mots.forEach((M) => M.L.forEach((l) => { vis += l.wd * E(t, l.t, 0.16, eOut3); }));
        const last = line.mots[line.mots.length - 1]; const full = E(t, last.L[last.L.length - 1].t, 0.2);
        vis = lerp(vis, line.wd, full * 0);
        const x0 = 540 - vis * fit / 2;
        const X = tete(line.K, t), fadeG = (1 - E(t, line.K[line.K.length - 1][0] + 0.1, 0.45)) * (1 - q);
        // le halo suit la tête de la ligne en cours, puis file vers la droite et s'éteint en fin de ligne
        const k0 = line.K[0][0], k1 = line.K[line.K.length - 1][0];
        const ha = clamp((t - k0 + 0.06) / 0.12, 0, 1) * (1 - E(t, k1 + 0.04, 0.4)) * (1 - q);
        if (ha > hb) { hb = ha; hxp = x0 + (X == null ? line.K[0][1] : X) * fit; hyp = y0 + (line.y - y0) * fit + 0.6 * size * fit; }
        line.mots.forEach((M) => {
          // la lumière remplace l'ancien flash orange du mot neuf : c'est elle qui « allume » chaque mot dit
          const c = hx(COL[M.col]);
          const halo = M.col === 'w' ? [255, 138, 76] : hx(COL[M.col]);
          M.L.forEach((l, j) => {
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
  // S1 · ACCROCHE « Cette 208 à 7 190 € ? » : la 208 en gros plan devant un prix GÉANT (le chiffre derrière l'objet,
  //      comme les mots derrière le téléphone chez 1600) ; image 0 en mouvement : la caméra recule et tourne.
  // S2 · « À la revente, tu perds 2 688 € » : le prix bascule chiffre par chiffre (rouleau) en −2 688 € rouge qui
  //      passe DEVANT la voiture ; secousse sur « 2 688 ».
  // =====================================================================================================
  const S1 = scene(1200);
  const PRIX = obj(S1.cam, 1080, 400, { transformStyle: 'preserve-3d' });
  const PRold = [...'7 190 €'].map((ch) => mk('span', 'a nw', PRIX, { font: '600 300px Clash', letterSpacing: '-.05em', color: '#f7e7d6', whiteSpace: 'pre' }, ch === ' ' ? ' ' : ch));
  const PRnew = [...'−2 688 €'].map((ch) => mk('span', 'a nw', PRIX, { font: '600 228px Clash', letterSpacing: '-.05em', color: '#ff5f5f', whiteSpace: 'pre' }, ch === ' ' ? ' ' : ch));
  const lay1 = (arr) => { let x = 0; const ws = arr.map((s) => s.getBoundingClientRect().width); const tot = ws.reduce((a, b) => a + b, 0); arr.forEach((s, i) => { s._x = 540 - tot / 2 + x; s._w = ws[i]; x += ws[i]; }); return tot; };
  lay1(PRold);
  // −2 688 € : la plus grande taille qui tient dans la colonne sûre une fois la caméra posée (≈ ×1,12)
  { const tot = lay1(PRnew); if (tot > 730) { PRnew.forEach((s) => { s.style.fontSize = (228 * 730 / tot).toFixed(1) + 'px'; }); lay1(PRnew); } }
  const PRz = PRnew[PRnew.length - 1], PRK = [[w(12) - 0.06, PRnew[0]._x], [WD[12].e, PRz._x], [WD[13].e, PRz._x + PRz._w]];   // « 2688 » puis « euros »
  const SHADOW = obj(S1.cam, 1000, 160, { borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.75), rgba(0,0,0,0) 70%)' });
  const CAR = mk('img', 'a', S1.cam, { width: '940px' }); CAR.src = '../assets/hooks-cut/208-annonce-cut-2x.png';
  await new Promise((r) => { if (CAR.complete) r(); else { CAR.onload = r; CAR.onerror = r; } });
  const CARH = CAR.getBoundingClientRect().height;
  const QM = obj(S1.cam, 900, 1100, {}, `<svg viewBox="0 0 100 120" width="900" height="1100"><text x="50" y="100" text-anchor="middle" font-family="Clash" font-weight="600" font-size="120" fill="none" stroke="rgba(255,138,76,.55)" stroke-width="1.1">?</text></svg>`);
  const FLASH = mk('div', 'lay', ST, { background: 'radial-gradient(circle at 50% 55%, rgba(255,70,70,.55), rgba(255,40,40,0) 65%)', opacity: 0, zIndex: 15 });
  const tPerds = w(12) - 0.12, tS2out = w(14) - 0.32;
  ph([[['Cette', 0], ['208', 2, 'k']], [['à', 3], ['7 190 € ?', 4, 'k']]], { y: 236, size: 124, out: w(7) - 0.22 });
  ph([[['À', 7], ['la', 8], ['revente,', 9]], [['tu', 10], ['perds', 11, 'r']]], { y: 236, size: 124, out: w(14) - 0.24 });
  cue(0, 'impact', 1.1); cue(w(4) - 0.05, 'pop', 0.8); cue(w(6) - 0.05, 'whoosh', 0.5); cue(tFlip, 'whoosh', 1); cue(tFlip + 0.08, 'roll', 0.8); cue(tPerds, 'impact', 1.1); cue(tS2out, 'whoosh', 0.9);
  win(0, 0.5); win(tFlip - 0.02, tFlip + 0.5); win(tPerds - 0.02, tPerds + 0.25); win(tS2out, tS2out + 0.45);
  function paintS1(t) {
    if (!show(S1.root, t < tS2out + 0.5)) return;
    // caméra : image 0 tout près, recul et rotation (ressort lourd) ; orbite lente ; bascule sur « revente » ; plongée finale
    const a = SP(t, -0.02, 'heavy'), flip = E(t, tFlip, 0.5, doux), shake = bump(t, tPerds, 0.12), dive = E(t, tS2out, 0.45, eIn2);
    camera(S1, {
      cx: 540 + 30 * Math.sin(t * 0.6), cy: 980 + 900 * dive,
      cz: lerp(110, 0, a) + 70 * lisse(clamp((t - 0.8) / 2.4, 0, 1)) + 20 * flip + 900 * dive,
      rx: lerp(-10, 2, a) - 8 * flip + 50 * dive + 2.5 * shake * Math.sin((t - tPerds) * 80),
      ry: lerp(12, -5, a) + 6 * Math.sin(t * 0.45) * (1 - flip) - 4 * flip,
      rz: lerp(-6, 0, a) + 1.5 * shake * Math.sin((t - tPerds) * 63),
    });
    // le prix, derrière ; puis le rouleau : chaque ancien chiffre monte et bascule, chaque nouveau arrive d'en bas
    const fwd = E(t, tFlip + 0.1, 0.6, doux);
    put(PRIX, 540, 760 + 40 * fwd, lerp(-260, 40, fwd), { rx: 4 * Math.sin(t * 0.7) });
    const glow = t >= w(4) - 0.05 ? 1 : 0;
    PRold.forEach((s, i) => {
      const k = E(t, tFlip + i * 0.04, 0.32, eIn);
      s.style.color = glow ? rgb(mix(hx('#f7e7d6'), hx('#ff8a4c'), E(t, w(4) - 0.05, 0.25) * (1 - E(t, w(6), 0.4) * 0.4))) : '#f7e7d6';
      s.style.transform = `translate(${s._x.toFixed(1)}px,${(30 - 380 * k).toFixed(1)}px) rotateX(${(80 * k).toFixed(1)}deg) scale(${(1 + 0.05 * bump(t, w(4) - 0.05 + i * 0.03, 0.1)).toFixed(3)})`;
      s.style.opacity = (1 - E(t, tFlip + 0.12 + i * 0.04, 0.2)).toFixed(3);
    });
    // lueur : balaie « −2 688 € » de gauche à droite pendant que la voix dit « 2 688 euros »
    const XG = tete(PRK, t), fG = 1 - E(t, PRK[PRK.length - 1][0] + 0.1, 0.45);
    PRnew.forEach((s, i) => {
      const k = SP(t, tFlip + 0.16 + i * 0.045, 'default'), g = lueur(s._x + s._w / 2, XG, 200) * fG;
      s.style.transform = `translate(${s._x.toFixed(1)}px,${(40 + 360 * (1 - k) - 8 * g).toFixed(1)}px) rotateX(${(-80 * (1 - Math.min(1, k))).toFixed(1)}deg) scale(${(1 + 0.08 * bump(t, tPerds + i * 0.02, 0.12) + 0.05 * g).toFixed(3)})`;
      s.style.opacity = Math.min(1, k * 1.5).toFixed(3);
      allume(s, hx('#ff5f5f'), [255, 80, 80], g, 200);
    });
    // la voiture : devant le prix, puis elle recule et s'assombrit quand la perte passe devant
    const dim = E(t, tFlip + 0.2, 0.5);
    put(CAR, 540, 1180 + 10 * Math.sin(t * 1.1) + 40 * dim, 120 - 220 * dim, { ry: -6 + 4 * Math.sin(t * 0.5), s: 1.05 - 0.04 * dim });
    CAR.style.filter = `drop-shadow(0 40px 40px rgba(0,0,0,.55)) brightness(${(1 - 0.55 * dim).toFixed(3)}) saturate(${(1 - 0.6 * dim).toFixed(3)})`;
    put(SHADOW, 540, 1180 + CARH * 0.47, 80, { rx: 80, o: 0.8 });
    // le « ? » géant, derrière, à partir du point d'interrogation
    const qm = E(t, w(6) - 0.08, 0.4, doux);
    put(QM, 790, 880, -520, { rz: 12 - 20 * qm + 3 * Math.sin(t), s: 0.6 + 0.4 * qm, o: qm * (1 - E(t, tFlip, 0.25)) });
    FLASH.style.opacity = (0.85 * bump(t, tPerds - 0.02, 0.1) + 0.4 * E(t, tFlip + 0.2, 0.4) * (1 - E(t, tS2out, 0.3))).toFixed(3);
  }

  // =====================================================================================================
  // S3 · « Colle l'annonce dans utopicar. » : très gros plan sur le champ « L'annonce », plan incliné qui remplit
  //      l'écran (Notion) ; le texte de l'annonce se tape lettre à lettre, la caméra suit le curseur ;
  //      « utopicar » : la pastille du logo bascule devant et le nom se tape.
  // =====================================================================================================
  const S3 = scene(1100);
  const CHAMP = obj(S3.cam, 1500, 1500, { borderRadius: '90px', background: 'linear-gradient(170deg,#211812,#130e0a 60%)', border: '4px solid rgba(244,241,236,.12)', boxShadow: '0 80px 160px -60px rgba(0,0,0,.9)', transformStyle: 'preserve-3d' });
  mk('div', 'a nw', CHAMP, { left: '110px', top: '90px', font: '500 64px Satoshi', color: 'rgba(244,241,236,.8)' }, "L'annonce");
  const FIELD = mk('div', 'a', CHAMP, { left: '80px', top: '200px', width: '1340px', height: '1200px', borderRadius: '60px', background: 'rgba(0,0,0,.32)', border: '4px solid rgba(244,241,236,.18)' });
  const LIGNES = ['Peugeot 208 1.2 PureTech 110 Allure', 'Prix : 7 190 €', 'Année : 2016', 'Kilométrage : 116 789 km', 'Énergie : Essence', 'Boîte de vitesse : Manuelle', 'Vendeur : professionnel'];
  const tPaste = w(14) - 0.02, tLogo3 = w(18) - 0.1, tS3out = w(19) - 0.16;
  let tt0 = tPaste; const TYP = [];
  LIGNES.forEach((s, li) => {
    const chars = [...nb(s)]; let x = 0;
    const row = { y: 300 + li * 150, L: [] };
    chars.forEach((ch, j) => { const sp = mk('span', 'a nw', CHAMP, { font: '500 82px Satoshi', color: '#f4f1ec', whiteSpace: 'pre' }, ch); row.L.push({ el: sp, t: tt0 + j * 0.011 }); });
    tt0 += chars.length * 0.011 + 0.02; TYP.push(row);
  });
  { const meas = mk('span', 'a nw', CHAMP, { font: '500 82px Satoshi', whiteSpace: 'pre', visibility: 'hidden' }); for (const row of TYP) { let x = 120; for (const l of row.L) { meas.textContent = l.el.textContent; l.x = x; x += meas.getBoundingClientRect().width; } row.end = x; } meas.remove(); }
  const CARET = mk('div', 'a', CHAMP, { width: '8px', height: '96px', borderRadius: '4px', background: '#ff5a1f' });
  // voile en haut (les sous-titres passent au-dessus des lignes tapées) ; la pastille vit hors du monde incliné,
  // devant lui, pour ne jamais passer derrière le champ
  mk('div', 'lay', S3.root, { background: 'linear-gradient(180deg, rgba(11,10,9,.9) 0%, rgba(11,10,9,.62) 19%, rgba(11,10,9,0) 33%)', pointerEvents: 'none' });
  const PILL3 = obj(S3.root, 760, 200, { borderRadius: '100px', background: 'rgba(28,22,18,.92)', border: '3px solid rgba(255,138,76,.55)', boxShadow: '0 40px 90px -30px rgba(0,0,0,.8), 0 0 60px rgba(255,90,31,.25)', overflow: 'hidden', transformStyle: 'flat' });
  const ICO3 = mk('div', 'a', PILL3, { left: '40px', top: '30px', width: '140px', height: '140px', borderRadius: '34px', overflow: 'hidden', background: '#1a1411' });
  ICO3.innerHTML = LOGO; { const s = ICO3.querySelector('svg'); s.style.height = '140px'; s.style.width = 'auto'; s.style.position = 'absolute'; s.style.left = '0'; s.style.top = '0'; }
  const NOM3 = [...'utopicar'].map((ch) => mk('span', 'a nw', PILL3, { font: '600 112px Clash', letterSpacing: '-.03em', color: '#f4f1ec' }, ch));
  { let x = 214; const meas = mk('span', 'a nw', PILL3, { font: '600 112px Clash', letterSpacing: '-.03em', visibility: 'hidden' }); NOM3.forEach((s) => { meas.textContent = s.textContent; s._x = x; x += meas.getBoundingClientRect().width; }); meas.remove(); PILL3._end = x + 50; }
  ph([[['Colle', 14], ["l'annonce", 15]], [['dans', 17], ['utopicar.', 18, 'k']]], { y: 236, size: 124, out: tS3out });
  cue(tPaste, 'paste', 1); TYP.forEach((r, i) => cue(r.L[0].t, 'key', 0.35)); cue(tLogo3, 'pop', 0.9); NOM3.forEach((s, i) => cue(tLogo3 + 0.12 + i * 0.04, 'key', 0.3));
  win(tS2out, tPaste + 0.3); win(tS3out, tS3out + 0.4);
  function paintS3(t) {
    if (!show(S3.root, t >= tS2out + 0.05 && t < tS3out + 0.45)) return;
    // le curseur : fin de la ligne en cours de frappe
    let cur = TYP[0], cx = 120;
    for (const row of TYP) { const n = row.L.filter((l) => t >= l.t).length; if (n > 0) { cur = row; cx = n < row.L.length ? row.L[n].x : row.end; } }
    const into = SP(t, tS2out + 0.1, 'default'), out = E(t, tS3out, 0.42, eIn2);
    // la caméra suit le curseur sur le plan incliné (le centre du champ est en 540, 1100)
    const fx = 540 - 750 + cx * 0.45, fy = 1100 - 750 + cur.y + 40;
    camera(S3, { cx: lerp(540, fx, 0.55), cy: lerp(1600, fy - 60, into) - 1400 * out, cz: lerp(-200, 260, into) + 600 * out, rx: 26 - 14 * into + 40 * out, ry: -10 + 6 * Math.sin(t * 0.7), rz: -7 + 3 * Math.sin(t * 0.5) });
    put(CHAMP, 540, 1100, -200, { rx: 18, rz: -4 });
    TYP.forEach((row) => row.L.forEach((l) => {
      const p = E(t, l.t, 0.12, eOut3); show(l.el, t >= l.t - 0.01);
      l.el.style.transform = `translate(${l.x.toFixed(1)}px,${(row.y + 18 * (1 - p)).toFixed(1)}px) scale(${(0.5 + 0.5 * p).toFixed(3)})`;
      l.el.style.opacity = p.toFixed(3);
      l.el.style.color = rgb(mix(hx('#ff8a4c'), hx('#f4f1ec'), E(t, l.t + 0.08, 0.3)));
    }));
    show(CARET, Math.floor(t / 0.25) % 2 === 0 || t < tt0);
    CARET.style.transform = `translate(${(cx + 6).toFixed(1)}px,${(cur.y + 8).toFixed(1)}px)`;
    // pastille du logo : bascule depuis le plan (rotateX 90° → 0), le nom se tape
    const pk = SP(t, tLogo3, 'default');
    show(PILL3, t >= tLogo3 - 0.02);
    const nL = NOM3.filter((s, i) => t >= tLogo3 + 0.12 + i * 0.04).length;
    const pw = nL ? PILL3._end - (NOM3.length - nL ? (PILL3._end - 50 - NOM3[nL - 1]._x - 0) * 0 : 0) : 214;
    const pwNow = nL ? Math.min(PILL3._end, (nL < NOM3.length ? NOM3[nL]._x : PILL3._end - 50) + 50) : 214;
    PILL3.style.width = pwNow.toFixed(1) + 'px';
    put(PILL3, 540, 1300 - 700 * out, 300 * out, { rx: 90 * (1 - Math.min(1, pk)) + 6 * Math.sin(t * 1.3), ry: 7 * Math.sin(t * 0.9), rz: -2, s: 0.8 + 0.2 * Math.min(1, pk), o: 1 - out, b: 8 * out });
    NOM3.forEach((s, i) => { const p = E(t, tLogo3 + 0.12 + i * 0.04, 0.14, eOut3); s.style.opacity = p.toFixed(3); s.style.transform = `translate(${s._x.toFixed(1)}px,${(26 + 20 * (1 - p)).toFixed(1)}px) scale(${(0.4 + 0.6 * p).toFixed(3)})`; });
    ICO3.style.transform = `rotate(${(-120 * (1 - SP(t, tLogo3 + 0.05, 'default'))).toFixed(1)}deg)`;
    void pw;
  }

  // =====================================================================================================
  // S4 · « En une minute : » : un anneau géant en 3D (lemlist « 60 s »), 60 traits de chrono qui s'allument,
  //      le compte à rebours ; la caméra traverse l'anneau vers les cartes du rapport
  // =====================================================================================================
  const S4 = scene(1200);
  const RING = obj(S4.cam, 900, 900, { transformStyle: 'preserve-3d' });
  RING.innerHTML = `<svg viewBox="0 0 900 900" width="900" height="900" style="position:absolute;left:0;top:0;overflow:visible">
    <circle cx="450" cy="450" r="400" fill="none" stroke="rgba(244,241,236,.08)" stroke-width="44"/>
    <circle class="arc" cx="450" cy="450" r="400" fill="none" stroke="#ff5a1f" stroke-width="44" stroke-linecap="round" stroke-dasharray="0 2513.3" transform="rotate(-90 450 450)"/>
    <g class="ticks">${Array.from({ length: 60 }, (_, i) => `<rect x="447" y="${i % 5 ? 4 : 0}" width="${i % 5 ? 6 : 10}" height="${i % 5 ? 22 : 34}" rx="3" fill="rgba(244,241,236,.22)" transform="rotate(${i * 6} 450 450)"/>`).join('')}</g></svg>`;
  const RARC = RING.querySelector('.arc'), TICKS = [...RING.querySelectorAll('.ticks rect')];
  const CNT = mk('div', 'a nw', RING, { left: '0px', top: '250px', width: '900px', textAlign: 'center', font: '600 330px Clash', letterSpacing: '-.05em', color: '#f4f1ec' }, '60');
  const CNTs = mk('div', 'a nw', RING, { left: '0px', top: '590px', width: '900px', textAlign: 'center', font: '600 80px Clash', color: '#ff8a4c' }, 'secondes');
  const tR0 = w(19) - 0.06, tRun = w(19) + 0.05, tRend = w(21) + 0.22, tS4out = w(22) - 0.18;
  ph([[['En', 19], ['une', 20, 'k'], ['minute :', 21, 'k']]], { y: 250, size: 132, out: tS4out });
  cue(tR0, 'whoosh', 0.7); for (let i = 0; i < 8; i++) cue(tRun + i * 0.075, 'tick', 0.45); cue(tRend, 'ding', 0.8); cue(tS4out, 'whoosh', 1);
  win(tR0 - 0.02, tR0 + 0.35); win(tS4out - 0.02, tS4out + 0.4);
  function paintS4(t) {
    if (!show(S4.root, t >= tR0 - 0.02 && t < tS4out + 0.45)) return;
    const a = SP(t, tR0, 'default'), run = E(t, tRun, tRend - tRun, (p) => p), through = E(t, tS4out, 0.4, eIn2);
    camera(S4, { cx: 540, cy: 1050, cz: lerp(-900, 0, a) + 1500 * through, rx: 6 * Math.sin(t * 0.8), ry: 10 * Math.sin(t * 0.6) });
    put(RING, 540, 1050, 0, { rx: lerp(62, 12, a) + 6 * Math.sin(t * 1.1), ry: -14 + 10 * Math.sin(t * 0.7), rz: lerp(-40, 0, a) });
    RARC.setAttribute('stroke-dasharray', `${(2513.3 * run).toFixed(1)} 2513.3`);
    TICKS.forEach((r, i) => r.setAttribute('fill', i / 60 <= run && run > 0 ? '#ff8a4c' : 'rgba(244,241,236,.22)'));
    CNT.textContent = t < tRend ? String(Math.max(0, Math.ceil(60 * (1 - run)))) : '1';
    CNTs.textContent = t < tRend ? 'secondes' : 'minute';
    const vide = 1 - E(t, tS4out - 0.08, 0.14, eIn2);
    CNT.style.transform = `scale(${((1 + 0.08 * bump(t, tRend, 0.12)) * (0.6 + 0.4 * vide)).toFixed(3)})`; CNT.style.opacity = vide.toFixed(3); CNTs.style.opacity = vide.toFixed(3);
    CNT.style.color = t >= tRend ? '#ff8a4c' : '#f4f1ec';
  }

  // =====================================================================================================
  // S5 · « la cote, les travaux, ta marge… » : trois grandes cartes du rapport plantées en profondeur, la caméra
  //      avance de l'une à l'autre (chaque carte remplit l'écran sur son mot) ;
  //      « et le verdict » : la dernière se retourne : verdict, anneau 23 ; « À éviter. » claque en géant
  // =====================================================================================================
  const S5 = scene(1200);
  function grandeCarte(lab, val, vcol, note, ncol, sub) {
    const c = obj(S5.cam, 920, 600, { borderRadius: '70px', background: 'linear-gradient(170deg,#211812,#120d0a 70%)', border: '3px solid rgba(244,241,236,.12)', boxShadow: '0 70px 140px -50px rgba(0,0,0,.95)' });
    mk('div', 'a nw', c, { left: '70px', top: '64px', font: '500 50px Satoshi', color: 'rgba(244,241,236,.8)' }, lab);
    mk('div', 'a nw', c, { right: '64px', left: 'auto', top: '50px', font: '500 70px Satoshi', color: 'rgba(244,241,236,.5)' }, '›');
    const V = mk('div', 'a nw', c, { left: '64px', top: '150px', font: '600 170px Clash', letterSpacing: '-.04em', color: vcol }, nb(val));
    const PS = mk('div', 'a', c, { left: '70px', top: '370px', width: '780px', height: '22px', borderRadius: '11px', background: 'rgba(244,241,236,.08)', overflow: 'hidden' }); const F = mk('i', 'a', PS, { left: '0', top: '0', bottom: '0', width: '0%', borderRadius: '11px', background: ncol });
    mk('div', 'a', c, { left: '70px', top: '420px', width: '780px', font: '500 42px/1.3 Satoshi', color: 'rgba(244,241,236,.62)' }, nb(sub));
    return { c, V, F, note };
  }
  const CARTES = [
    grandeCarte('Bon prix ?', 'Trop cher', '#ff6b6b', 0, '#ff6b6b', '1 671 € de plus que les annonces comparables (+30 %)'),
    grandeCarte('Des travaux ?', '≈ 540 €', '#3ecb7f', 80, '#3ecb7f', 'Probable sur 12 mois, entre 0 € et 1 650 €'),
    grandeCarte('Ça rapporte ?', '−2 688 €', '#ff6b6b', 0, '#ff6b6b', "Vous perdriez de l'argent au prix affiché"),
  ];
  const CZ = [0, -1500, -3000], CXs = [540, 540, 540], CRY = [-14, 12, -10];
  // dos de la 3e carte : le verdict
  const VERD = obj(S5.cam, 920, 980, { borderRadius: '70px', background: 'linear-gradient(170deg,#46221f,#120d0a 65%)', border: '3px solid rgba(255,107,107,.45)', boxShadow: '0 70px 140px -50px rgba(0,0,0,.95)', backfaceVisibility: 'hidden' });
  VERD.innerHTML = `<svg viewBox="0 0 120 120" width="330" height="330" style="position:absolute;left:70px;top:70px;transform:rotate(-90deg)"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(244,241,236,.1)" stroke-width="10"/><circle class="arc" cx="60" cy="60" r="52" fill="none" stroke="#ff6b6b" stroke-width="10" stroke-linecap="round" stroke-dasharray="0 326.7"/></svg>
    <div class="n a nw" style="left:70px;top:150px;width:330px;text-align:center;font:600 110px Clash;letter-spacing:-.03em">0</div><div class="a nw" style="left:70px;top:270px;width:330px;text-align:center;font:500 34px Satoshi;color:rgba(244,241,236,.6)">sur 100</div>
    <div class="a nw" style="left:72px;top:450px;font:700 36px Satoshi;letter-spacing:.16em;color:rgba(244,241,236,.62)">AVANT LE PREMIER MESSAGE</div>
    <div class="a nw" style="left:66px;top:510px;font:600 130px Clash;letter-spacing:-.03em;color:#ff6b6b">À éviter</div>
    <div class="a" style="left:72px;top:680px;width:780px;font:500 44px/1.38 Satoshi;color:rgba(244,241,236,.8)">${nb("Même bien négociée, elle ne laisse pas votre minimum de 750 € (il faudrait l'acheter 3 750 € au plus).")}</div>`;
  const VARC = VERD.querySelector('.arc'), VN = VERD.querySelector('.n');
  const BIG = mk('div', 'a nw', S5.cam, { font: '700 176px Clash', letterSpacing: '-.04em', color: '#ff6b6b', textShadow: '0 30px 80px rgba(0,0,0,.6)', transformStyle: 'preserve-3d' });
  const BIGL = [...'À ÉVITER'].map((ch) => mk('span', '', BIG, { display: 'inline-block', whiteSpace: 'pre' }, ch));
  { const wB = BIG.getBoundingClientRect().width; if (wB > 720) BIG.style.fontSize = (176 * 720 / wB).toFixed(1) + 'px'; }
  BIGL.forEach((s) => { s._x = s.offsetLeft; s._w = s.offsetWidth; });
  const BIGK = [[w(31) - 0.04, 0], [WD[32].e, BIGL[BIGL.length - 1]._x + BIGL[BIGL.length - 1]._w]];   // la lueur suit « À éviter »
  const tC = [w(23) - 0.16, w(25) - 0.16, w(27) - 0.16], tVer = w(30) - 0.2, tEv = w(31) - 0.05, tS5out = w(33) - 0.3;
  ph([[['la', 22], ['cote,', 23, 'k']]], { y: 236, size: 136, out: w(24) - 0.22 });
  ph([[['les', 24], ['travaux,', 25, 'k']]], { y: 236, size: 136, out: w(26) - 0.22 });
  ph([[['ta', 26], ['marge…', 27, 'k']]], { y: 236, size: 136, out: w(28) - 0.22 });
  ph([[['et', 28], ['le', 29], ['verdict.', 30, 'k']]], { y: 236, size: 136, out: tEv - 0.2 });
  tC.forEach((t0) => { cue(t0, 'whoosh', 0.8); cue(t0 + 0.18, 'pop', 0.8); }); cue(tVer, 'whoosh', 0.8); cue(tEv, 'impact', 1.3); cue(tS5out, 'whoosh', 1);
  tC.forEach((t0) => win(t0 - 0.02, t0 + 0.42)); win(tVer - 0.02, tVer + 0.5); win(tEv - 0.02, tEv + 0.25); win(tS5out, tS5out + 0.4);
  function paintS5(t) {
    if (!show(S5.root, t >= tC[0] - 0.4 && t < tS5out + 0.45)) return;
    // caméra : de carte en carte (traveling avant), puis recul sur le verdict, puis balayage vers la droite
    const k1 = E(t, tC[1], 0.42, eIO), k2 = E(t, tC[2], 0.42, eIO), kv = E(t, tVer, 0.5, doux), out = E(t, tS5out, 0.4, eIn2);
    const zc = lerp(lerp(0, CZ[1], k1), CZ[2], k2), xc = lerp(lerp(CXs[0], CXs[1], k1), CXs[2], k2);
    const enter = E(t, tC[0] - 0.4, 0.45, doux), shake = bump(t, tEv, 0.12);
    camera(S5, { cx: xc + 8 * shake * Math.sin((t - tEv) * 90), cy: 1040 - 40 * kv, tz: zc, cz: lerp(-900, 0, enter) - 180 * kv, rx: 4 * Math.sin(t * 0.7) - 6 * kv, ry: 8 * Math.sin(t * 0.5) - 70 * out, rz: 1.5 * shake * Math.sin((t - tEv) * 70) });
    CARTES.forEach((C, i) => {
      const passed = i < 2 ? (i === 0 ? k1 : k2) : 0;
      const flipV = i === 2 ? kv : 0;
      put(C.c, CXs[i], 1040, CZ[i], { ry: CRY[i] + 180 * flipV, rx: 4, o: 1 - E(passed, 0.6, 0.4, (p) => p) });
      C.c.style.backfaceVisibility = 'hidden';
      C.F.style.width = (Math.max(3, C.note) * E(t, tC[i] + 0.2, 0.6, eOut3)).toFixed(1) + '%';
      C.V.style.transform = `scale(${(1 + 0.08 * bump(t, tC[i] + 0.18, 0.12)).toFixed(3)})`; C.V.style.transformOrigin = '0 60%';
    });
    // verdict : dos de la 3e carte (même pose, retournée)
    put(VERD, CXs[2], 1040, CZ[2] - 1, { ry: CRY[2] + 180 * kv - 180, rx: 4 });
    const nv = E(t, tVer + 0.25, 0.7, eOut3); VARC.setAttribute('stroke-dasharray', `${(326.7 * 0.23 * nv).toFixed(1)} 326.7`); VN.textContent = String(Math.round(23 * nv));
    VERD.style.boxShadow = t >= tEv ? `0 0 0 ${(6 + 18 * shake).toFixed(1)}px rgba(255,107,107,${(0.45 + 0.4 * shake).toFixed(2)}), 0 70px 140px -50px rgba(0,0,0,.95)` : '0 70px 140px -50px rgba(0,0,0,.95)';
    // « À ÉVITER » : claque depuis la caméra, lettre par lettre
    show(BIG, t >= tEv - 0.05);
    put(BIG, CXs[2], 700, CZ[2] + 250, { rz: -4, s: 1 });
    const XB = tete(BIGK, t), fB = 1 - E(t, BIGK[1][0] + 0.1, 0.5);
    BIGL.forEach((s, i) => {
      const p = SP(t, tEv - 0.03 + i * 0.025, 'snappy'), g = lueur(s._x + s._w / 2, XB, 150) * fB;
      s.style.transform = `translateZ(${(900 * (1 - Math.min(1, p))).toFixed(0)}px) translateY(${(-8 * g).toFixed(1)}px) scale(${(2.2 - 1.2 * Math.min(1, p) + 0.05 * g).toFixed(3)})`; s.style.opacity = Math.min(1, p * 2).toFixed(3);
      allume(s, hx('#ff6b6b'), [255, 90, 90], g, 150);
    });
    FLASH.style.opacity = Math.max(+FLASH.style.opacity || 0, 0.9 * bump(t, tEv, 0.1)).toFixed(3);
  }

  // =====================================================================================================
  // S6 · « Une bonne affaire ? » : balayage vers la gauche, vert : l'anneau géant monte à 97, « Très bonne affaire »
  //      se tape ; « Ton prix d'offre… et le plafond » : une échelle de prix en 3D, la caméra monte de palier en
  //      palier (6 650 → 6 900 → 7 100 €) ; « à ne pas dépasser » : la dalle rouge PLAFOND s'écrase dessus
  // =====================================================================================================
  const S6 = scene(1200);
  const R97 = obj(S6.cam, 860, 860, { transformStyle: 'flat' });
  R97.innerHTML = `<svg viewBox="0 0 120 120" width="860" height="860" style="position:absolute;left:0;top:0;transform:rotate(-90deg)"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(244,241,236,.09)" stroke-width="7"/><circle class="arc" cx="60" cy="60" r="52" fill="none" stroke="#3ecb7f" stroke-width="7" stroke-linecap="round" stroke-dasharray="0 326.7"/></svg>
    <div class="n a nw" style="left:0;top:210px;width:860px;text-align:center;font:600 360px Clash;letter-spacing:-.05em;color:#f4f1ec">0</div><div class="a nw" style="left:0;top:600px;width:860px;text-align:center;font:500 54px Satoshi;color:rgba(244,241,236,.6)">sur 100</div>`;
  const R97a = R97.querySelector('.arc'), R97n = R97.querySelector('.n');
  const ECH = [['Offre d\'ouverture', 6650, 'après la visite'], ['Objectif', 6900, 'prix à viser'], ['Prix à ne pas dépasser', 7100, 'pour garder 750 €']].map(([lab, v, sub], i) => {
    const c = obj(S6.cam, 940, 350, { borderRadius: '60px', background: i === 2 ? 'linear-gradient(170deg,#4e210f,#130e0a 70%)' : 'linear-gradient(170deg,#211812,#120d0a 70%)', border: `3px solid ${i === 2 ? 'rgba(255,138,76,.6)' : 'rgba(244,241,236,.12)'}`, boxShadow: '0 60px 120px -50px rgba(0,0,0,.95)' });
    mk('div', 'a nw', c, { left: '64px', top: '44px', font: '500 46px Satoshi', color: 'rgba(244,241,236,.8)' }, lab);
    const V = mk('div', 'a nw', c, { left: '58px', top: '104px', font: '600 150px/1 Clash', letterSpacing: '-.04em', color: '#f4f1ec' }, eur(v));
    mk('div', 'a nw', c, { left: '64px', top: '270px', font: '500 40px Satoshi', color: 'rgba(244,241,236,.6)' }, nb(sub));
    return { c, V, v };
  });
  const EY = [1500, 1050, 600];
  // le bord de la dalle qui vient vers la caméra s'efface (masque) : il ne passe plus sous les sous-titres
  const DALLE = obj(S6.cam, 1500, 900, { background: 'linear-gradient(180deg, rgba(255,80,80,.55), rgba(255,60,60,.12))', border: '4px solid rgba(255,120,120,.9)', borderRadius: '40px', boxShadow: '0 0 120px rgba(255,80,80,.5)', WebkitMaskImage: 'linear-gradient(0deg, #000 58%, transparent 96%)', maskImage: 'linear-gradient(0deg, #000 58%, transparent 96%)' });
  mk('div', 'a nw', DALLE, { left: '0', top: '360px', width: '1500px', textAlign: 'center', font: '700 150px Clash', letterSpacing: '.12em', color: 'rgba(255,240,240,.95)' }, 'PLAFOND');
  const tCl = w(33) - 0.28, tOff = w(38) - 0.14, tObj = w(41) - 0.12, tPla = w(43) - 0.14, tDal = w(45) - 0.06, tS6out = w(48) - 0.28;
  ph([[['Une', 33], ['bonne', 34, 'g']], [['affaire ?', 35, 'g']]], { y: 236, size: 128, out: w(37) - 0.22 });
  ph([[['Ton', 37], ['prix', 38, 'k']], [["d'offre…", 39, 'k']]], { y: 236, size: 128, out: w(41) - 0.22 });
  ph([[['et', 41], ['le', 42]], [['plafond', 43, 'k']]], { y: 236, size: 128, out: w(44) - 0.16 });
  ph([[['à', 44], ['ne', 45], ['pas', 46]], [['dépasser.', 47, 'r']]], { y: 236, size: 128, out: tS6out });
  const TBA = phrase([[['Très', 34, 'g'], ['bonne', 35, 'g'], ['affaire', 35, 'g']]], { y: 1350, size: 100, out: tOff - 0.1, dt: 0.15 }); PHR.push(TBA);
  cue(tCl, 'whoosh', 1); cue(tCl + 0.5, 'ding', 0.8); cue(tOff, 'whoosh', 0.7); cue(tObj, 'whoosh', 0.6); cue(tPla, 'whoosh', 0.6); cue(tDal, 'impact', 1.2); cue(tS6out, 'whoosh', 0.9);
  win(tCl - 0.02, tCl + 0.4); win(tOff - 0.02, tOff + 0.42); win(tObj - 0.02, tObj + 0.4); win(tPla - 0.02, tPla + 0.4); win(tDal - 0.02, tDal + 0.25); win(tS6out, tS6out + 0.4);
  function paintS6(t) {
    if (!show(S6.root, t >= tCl + 0.06 && t < tS6out + 0.45)) return;
    const a = E(t, tCl + 0.06, 0.5, doux), up = E(t, tOff - 0.08, 0.45, doux), k1 = E(t, tObj, 0.4, eIO), k2 = E(t, tPla, 0.4, eIO), out = E(t, tS6out, 0.4, eIn2);
    const yc = lerp(lerp(lerp(1050, EY[0], up), EY[1], k1), EY[2], k2), shake = bump(t, tDal, 0.12);
    camera(S6, { cx: 540 + 8 * shake * Math.sin((t - tDal) * 90), cy: yc - 40 + 1500 * out, cz: lerp(-400, 0, a) - 250 * up + 100 * k2, rx: lerp(0, 22, up) + 4 * Math.sin(t * 0.6) - 30 * out, ry: lerp(60, 0, a) + lerp(0, -18, up) + 4 * Math.sin(t * 0.5), rz: 1.5 * shake * Math.sin((t - tDal) * 70) });
    // anneau 97 : face caméra, s'éloigne vers le fond quand l'échelle arrive
    put(R97, 540, 900, -600 * up, { ry: -10 * (1 - a) + 4 * Math.sin(t * 0.8), o: 1 - E(t, tOff + 0.1, 0.3) });
    const n97 = E(t, tCl + 0.15, 0.8, eOut3); R97a.setAttribute('stroke-dasharray', `${(326.7 * 0.97 * n97).toFixed(1)} 326.7`); R97n.textContent = String(Math.round(97 * n97));
    ECH.forEach((P, i) => {
      const t0 = [tOff, tObj, tPla][i], k = SP(t, t0 - 0.05, 'default');
      show(P.c, t >= t0 - 0.1);
      put(P.c, 540, EY[i], 0, { rx: -8, ry: 14, rz: -2, s: 0.85 + 0.15 * Math.min(1, k), o: Math.min(1, k * 1.5) });
      P.V.textContent = eur(lerp(P.v - 900, P.v, E(t, t0, 0.5, eOut3)));
    });
    // la dalle PLAFOND : tombe d'en haut, à plat, et s'écrase juste au-dessus du dernier palier
    const d = E(t, tDal, 0.22, eIn);
    show(DALLE, t >= tDal - 0.25);
    put(DALLE, 540, lerp(EY[2] - 900, EY[2] - 190, d), 0, { rx: -72, o: E(t, tDal - 0.25, 0.15) });
  }

  // =====================================================================================================
  // S7 · « Et pour les trouver, arrête de scroller. » : MUR d'annonces plein écran (trois colonnes, incliné en 3D,
  //      qui déborde du cadre), qui défile de plus en plus vite (flou de bougé) puis s'arrête NET ; la meilleure
  //      annonce sort du mur et vient vers la caméra
  // =====================================================================================================
  const S7 = scene(1100);
  const MUR = obj(S7.cam, 1560, 9000, { transformStyle: 'preserve-3d' });
  const MW = 500, MH = 340, MG = 30;
  function mini(parent, it, x, y, best = false) {
    const c = mk('div', 'a', parent, { left: x + 'px', top: y + 'px', width: MW + 'px', height: MH + 'px', borderRadius: '44px', background: best ? 'linear-gradient(170deg,#1c3724,#120d0a 70%)' : 'linear-gradient(170deg,#211812,#120d0a 70%)', border: `3px solid ${best ? 'rgba(62,203,127,.7)' : 'rgba(244,241,236,.1)'}` });
    mk('div', 'a nw', c, { left: '36px', top: '32px', width: (MW - 72) + 'px', overflow: 'hidden', textOverflow: 'ellipsis', font: '700 36px Satoshi', color: '#f4f1ec' }, it[0].replace('Renault ', ''));
    mk('div', 'a nw', c, { left: '36px', top: '84px', width: (MW - 72) + 'px', overflow: 'hidden', textOverflow: 'ellipsis', font: '500 27px Satoshi', color: 'rgba(244,241,236,.55)' }, nb(it[1].split(' · ').slice(0, 2).join(' · ')));
    mk('div', 'a nw', c, { left: '34px', top: '150px', font: '600 86px Clash', letterSpacing: '-.03em', color: '#f4f1ec' }, nb(it[3]));
    mk('div', 'a nw', c, { left: '36px', top: '262px', font: '700 32px Satoshi', color: '#3ecb7f', background: 'rgba(62,203,127,.14)', border: '2px solid rgba(62,203,127,.4)', borderRadius: '999px', padding: '6px 18px' }, nb(it[5]));
    return c;
  }
  const NROW = 24;
  for (let r = 0; r < NROW; r++) for (let col = 0; col < 3; col++) mini(MUR, LISTE[((r % 12) * 3 + col + 4) % LISTE.length], col * (MW + MG), r * (MH + MG));
  const BEST = obj(S7.cam, MW, MH, { transformStyle: 'flat' }); const BESTc = mini(BEST, LISTE[0], 0, 0, true);
  BESTc.style.boxShadow = '0 0 0 6px rgba(62,203,127,.25), 0 60px 120px -40px rgba(0,0,0,.95)';
  const SCRIM = mk('div', 'lay', S7.root, { background: 'linear-gradient(180deg, rgba(11,10,9,.88) 0%, rgba(11,10,9,.55) 26%, rgba(11,10,9,0) 40%)', pointerEvents: 'none' });
  const tL0 = w(48) - 0.28, tScr = w(52) - 0.1, tStop = w(54) + 0.06, tPop = tStop + 0.06, tS7out = w(55) - 0.14;
  ph([[['Et', 48], ['pour', 49], ['les', 50]], [['trouver,', 51]]], { y: 236, size: 124, out: w(52) - 0.22 });
  ph([[['arrête', 52, 'k'], ['de', 53, 'k']], [['scroller.', 54, 'k']]], { y: 236, size: 150, out: tS7out });
  cue(tL0, 'whoosh', 0.9); cue(tScr, 'riser', 1); cue(tStop - 0.02, 'tapestop', 1); cue(tStop, 'thud', 1.1); cue(tPop, 'pop', 0.9);
  win(tL0 - 0.02, tL0 + 0.4); win(tScr, tStop + 0.05); win(tPop - 0.02, tPop + 0.35);
  const ROWH = MH + MG, MURY0 = 7 * ROWH;
  function defile(t) {   // distance parcourue par le mur : dérive, accélération, arrêt net (léger rebond)
    if (t < tScr) return 120 * E(t, tL0, 1.2, (p) => p);
    if (t < tStop) { const u = (t - tScr) / (tStop - tScr); return 120 + 5200 * Math.pow(u, 2.2); }
    const u = t - tStop; return 5320 - 30 * Math.sin(Math.PI * clamp(u / 0.25, 0, 1)) * Math.exp(-u * 4);
  }
  function paintS7(t) {
    if (!show(S7.root, t >= tL0 + 0.08 && t < tS7out + 0.45)) return;
    const a = E(t, tL0 + 0.08, 0.5, doux), sp = t > tScr && t < tStop ? Math.pow((t - tScr) / (tStop - tScr), 1.2) : 0, out = E(t, tS7out, 0.4, eIn2);
    camera(S7, { cx: 540, cy: 1000, cz: lerp(-600, 0, a) + 120 * sp + 900 * out, rx: 34 + 6 * sp, ry: -6 + 3 * Math.sin(t * 0.6), rz: -16 + 4 * sp + 2 * Math.sin(t * 0.4) });
    const dy = defile(t);
    put(MUR, 540, 1000 + 4500 - MURY0 - dy % (12 * ROWH), -200, {});
    // la meilleure annonce sort du mur vers la caméra
    const k = SP(t, tPop, 'default'), kk = Math.min(1, k);
    show(BEST, t >= tPop - 0.02);
    const vole = E(t, tS7out - 0.02, 0.28, eIn2);   // elle s'envole vers le haut avant que la recherche n'arrive
    putFace(S7, BEST, 540, 1185 - 1100 * vole, 240 + 200 * vole, k, [540, 1060, -190], { s: 1 + 0.25 * kk, rz: -3 * (1 - kk) + 1.5 * Math.sin(t * 1.2) - 8 * vole, o: 1 - vole });
    SCRIM.style.opacity = '1';
  }

  // =====================================================================================================
  // S8 · « Ta recherche tourne toute seule. » : la recherche enregistrée au centre, les annonces tournent autour en
  //      anneau 3D (elle tourne toute seule) ; l'interrupteur « Alerte e-mail » s'allume sur « tourne »
  // =====================================================================================================
  const S8 = scene(1300);
  const RS = obj(S8.cam, 860, 520, { borderRadius: '64px', background: 'linear-gradient(170deg,#231912,#120d0a 70%)', border: '3px solid rgba(255,138,76,.45)', boxShadow: '0 70px 140px -50px rgba(0,0,0,.95), 0 0 80px rgba(255,90,31,.18)' });
  mk('div', 'a nw', RS, { left: '64px', top: '56px', font: '600 100px Clash', letterSpacing: '-.03em', color: '#f4f1ec' }, 'Renault Clio 4');
  mk('div', 'a nw', RS, { left: '64px', top: '190px', font: '700 40px Satoshi', color: '#3ecb7f', background: 'rgba(62,203,127,.14)', border: '2px solid rgba(62,203,127,.45)', borderRadius: '999px', padding: '8px 26px 8px 62px' }, 'Active');
  const ACTd = mk('div', 'a', RS, { left: '92px', top: '217px', width: '22px', height: '22px', borderRadius: '50%', background: '#3ecb7f' });
  mk('div', 'a nw', RS, { left: '310px', top: '204px', font: '500 40px Satoshi', color: 'rgba(244,241,236,.6)' }, 'il y a 1 min · diesel');
  mk('div', 'a nw', RS, { left: '64px', top: '290px', font: '500 44px Satoshi', color: 'rgba(244,241,236,.85)' }, nb('220 annonces · 22 sous la cote'));
  const SW = mk('div', 'a', RS, { left: '64px', top: '380px', width: '470px', height: '96px', borderRadius: '999px', border: '3px solid rgba(244,241,236,.2)', background: 'rgba(244,241,236,.05)' });
  const SWR = mk('div', 'a', SW, { left: '24px', top: '22px', width: '92px', height: '50px', borderRadius: '999px', background: 'rgba(244,241,236,.18)' });
  const SWK = mk('div', 'a', SWR, { left: '5px', top: '5px', width: '40px', height: '40px', borderRadius: '50%', background: '#f4f1ec' });
  mk('div', 'a nw', SW, { left: '138px', top: '22px', font: '600 44px Clash', color: '#f4f1ec' }, 'Alerte e-mail');
  const ORB = Array.from({ length: 10 }, (_, i) => { const o = obj(S8.cam, MW, MH, {}); mini(o, LISTE[(i * 4 + 1) % LISTE.length], 0, 0); return o; });
  const tS0 = w(55) - 0.14, tSw = w(57) - 0.05, tS8out = w(60) - 0.16;
  ph([[['Ta', 55], ['recherche', 56]], [['tourne', 57, 'k'], ['toute', 58, 'k']], [['seule.', 59, 'k']]], { y: 236, size: 112, out: tS8out });
  cue(tS0, 'whoosh', 0.8); cue(tSw, 'click', 1); cue(tSw + 0.06, 'ding', 0.6);
  win(tS0 - 0.02, tS0 + 0.4); win(tS8out, tS8out + 0.4);
  function paintS8(t) {
    if (!show(S8.root, t >= tS0 + 0.1 && t < tS8out + 0.45)) return;
    const a = SP(t, tS0 + 0.1, 'default'), out = E(t, tS8out, 0.45, eIn2), sw = E(t, tSw, 0.3, eOut3);
    camera(S8, { cx: 540, cy: 1050, cz: lerp(-500, 0, Math.min(1, a)) + 950 * out, rx: -10 + 4 * Math.sin(t * 0.7) + 14 * out, ry: 6 * Math.sin(t * 0.5) });
    put(RS, 540, 1050, 0, { ry: -8 + 5 * Math.sin(t * 0.9), rx: 6, s: 1 + 0.03 * bump(t, tSw, 0.12) });
    // l'anneau d'annonces tourne autour (plus vite une fois l'alerte allumée)
    const ang = (t - tS0) * (40 + 80 * sw) + 200 * sw;
    ORB.forEach((o, i) => {
      const th = ((i / ORB.length) * 360 + ang) * Math.PI / 180, R = 760;
      const x = 540 + R * Math.sin(th), z = R * Math.cos(th) - 380, y = 1050 + 440 * Math.cos(th);
      put(o, x, y, z, { ry: 22 * Math.sin(th), rx: -10, s: 0.8, o: Math.min(1, a * 1.3) * (z < -900 ? 0.6 : 1), b: z < -850 ? 3 : 0 });
    });
    SWK.style.transform = `translateX(${(42 * sw).toFixed(1)}px)`; SWR.style.background = sw > 0 ? `rgba(255,90,31,${(0.2 + 0.8 * sw).toFixed(3)})` : 'rgba(244,241,236,.18)';
    ACTd.style.boxShadow = `0 0 0 ${(14 * ((t * 1.2) % 1)).toFixed(1)}px rgba(62,203,127,${(0.5 * (1 - (t * 1.2) % 1)).toFixed(2)})`;
  }

  // =====================================================================================================
  // S9 · « Toi, tu dors. » : la nuit tombe, horloge à volets géante 01:14 en 3D, des « z » montent.
  //      « Lui, il bosse. » : l'horloge file jusqu'à 04:37 pendant que les messages de la nuit tombent du fond
  //      en cascade vers la caméra, chacun « Envoyé » (option Messages, Benef Pro)
  // =====================================================================================================
  const S9 = scene(1200);
  const FLIP = obj(S9.cam, 1000, 380, { transformStyle: 'preserve-3d' });
  const DIG = [0, 1, 2, 3].map((i) => { const d = mk('div', 'a', FLIP, { left: (i < 2 ? 70 + i * 200 : 530 + (i - 2) * 200) + 'px', top: '20px', width: '185px', height: '290px', borderRadius: '30px', background: 'linear-gradient(180deg,#1c2340 0%,#141a30 49.5%,#0c1020 50.5%,#121730 100%)', border: '3px solid rgba(169,184,255,.25)', boxShadow: '0 30px 60px -20px rgba(0,0,0,.8)' }); const n = mk('div', 'a nw num', d, { left: '0', top: '18px', width: '185px', textAlign: 'center', font: '600 236px/1 Clash', letterSpacing: '-.04em', color: '#e4e9ff' }, '0'); return { d, n }; });
  const COLON = mk('div', 'a nw', FLIP, { left: '458px', top: '24px', font: '600 220px/1 Clash', color: '#a9b8ff' }, ':');
  const ZZ = [0, 1, 2].map((i) => mk('div', 'a nw', S9.cam, { font: `600 ${90 + i * 36}px Clash`, color: '#a9b8ff' }, 'z'));
  const ENV = [['Clio IV 1.5 dCi 90 Trend', '4 750 €', '01:14'], ['Clio IV 1.5 dCi 75 Intens', '5 750 €', '01:16'], ['Clio IV 1.5 dCi 75 Business', '6 000 €', '02:41'], ['Clio IV 1.5 dCi 90 Limited', '6 350 €', '02:43'], ['Clio IV 1.5 dCi 75 Business', '6 450 €', '03:12'], ['Clio IV 1.5 dCi 90 Business', '6 600 €', '03:14'], ['Clio IV 1.5 dCi 90 Zen', '6 650 €', '04:37']];
  const MSG = ENV.map(([m, p, h]) => { const c = obj(S9.cam, 860, 150, { borderRadius: '50px', background: 'linear-gradient(180deg,#172040,#0f1428)', border: '3px solid rgba(169,184,255,.2)', boxShadow: '0 40px 80px -30px rgba(0,0,0,.9)' }); mk('div', 'a nw', c, { left: '44px', top: '26px', font: '700 44px Satoshi', color: '#f4f1ec' }, 'Renault ' + m); mk('div', 'a nw', c, { left: '44px', top: '86px', font: '500 34px Satoshi', color: 'rgba(223,229,255,.6)' }, nb(`${p} · 14 oct., ${h}`)); const S = mk('div', 'a nw', c, { right: '40px', left: 'auto', top: '46px', font: '700 38px Satoshi', color: '#3ecb7f', background: 'rgba(62,203,127,.15)', borderRadius: '999px', padding: '8px 24px' }, 'Envoyé ✓'); return { c, S, h }; });
  const PRO = obj(S9.cam, 560, 90, { borderRadius: '999px', background: 'rgba(11,10,9,.85)', border: '3px solid rgba(255,90,31,.85)', font: '700 40px/84px Satoshi', color: '#f4f1ec', textAlign: 'center' }, 'Benef Pro · option Messages');
  const tN = w(60) - 0.16, tLui = w(63) - 0.12, tS9out = w(66) - 0.24;
  const tMsg = (i) => tLui + 0.22 + i * 0.1;
  ph([[['Toi,', 60]], [['tu', 61], ['dors.', 62, 'b']]], { y: 236, size: 150, out: tLui - 0.2 });
  ph([[['Lui,', 63], ['il', 64], ['bosse.', 65, 'k']]], { y: 236, size: 136, out: tS9out });
  cue(tN, 'nuit', 0.9); MSG.forEach((m, i) => cue(tMsg(i), 'sent', 0.55)); cue(tLui, 'whoosh', 0.7); cue(tS9out, 'whoosh', 0.8);
  win(tN - 0.02, tN + 0.4); win(tLui - 0.02, tMsg(6) + 0.4); win(tS9out, tS9out + 0.4);
  const mins = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  function paintS9(t) {
    if (!show(S9.root, t >= tN + 0.1 && t < tS9out + 0.45)) return;
    const a = SP(t, tN + 0.1, 'heavy'), up = E(t, tLui, 0.45, doux), out = E(t, tS9out, 0.4, eIn2);
    camera(S9, { cx: 540, cy: lerp(1000, 1060, up), cz: lerp(-500, 0, Math.min(1, a)) - 120 * up + 700 * out, rx: lerp(-18, -4, Math.min(1, a)) + 3 * Math.sin(t * 0.7), ry: lerp(-24, 8, Math.min(1, a)) + 4 * Math.sin(t * 0.5) });
    // heure : 01:14 pendant « Toi, tu dors », puis le temps file pendant que les messages partent
    const m0 = mins('01:14'), m1 = mins('04:37'), mm = t < tMsg(0) ? m0 : lerp(m0, m1, clamp((t - tMsg(0)) / (tMsg(6) - tMsg(0)), 0, 1));
    const s = String(Math.floor(mm / 60)).padStart(2, '0') + String(Math.floor(mm % 60)).padStart(2, '0');
    DIG.forEach((D, i) => { D.n.textContent = s[i]; });
    COLON.style.opacity = t < tMsg(0) && Math.floor((t - tN) / 0.5) % 2 ? '0.2' : '1';
    put(FLIP, 540, lerp(1040, 640, up), lerp(0, -120, up), { rx: -14 + 4 * Math.sin(t * 0.8), ry: 10 * Math.sin(t * 0.4), s: lerp(1, 0.86, up) });
    // les « z » montent entre la phrase et l'horloge, côté droit
    ZZ.forEach((z, i) => { const t0 = tN + 0.3 + i * 0.22, u = (t - t0) / 1.2; const vis = u > 0 && t < tLui; show(z, vis); if (!vis) return; put(z, 700 + 80 * i + 26 * Math.sin(u * 5), 840 - 200 * u - 36 * i, 80 + 60 * i, { rz: -14 + 12 * Math.sin(u * 4), o: Math.min(1, u * 4) * (1 - E(t, tLui - 0.15, 0.15)) }); });
    // messages : tombent du fond, se rangent en colonne sous l'horloge
    MSG.forEach((M, i) => {
      const k = SP(t, tMsg(i), 'default'), kk = Math.min(1, k); show(M.c, t >= tMsg(i) - 0.01);
      let d = 0; for (let j = i + 1; j < MSG.length; j++) d += Math.min(1, SP(t, tMsg(j), 'default'));   // messages plus récents devant
      // pile de notifications : opaques, la plus récente devant ; les anciennes montent, reculent et s'assombrissent
      put(M.c, 540 + (i % 2 ? 10 : -10), 1240 - d * 92, lerp(-1800, 140, kk) - d * 90, { rx: lerp(-50, -8, kk), rz: i % 2 ? 1.2 : -1.2, s: 0.92, o: Math.min(1, k * 2) });
      M.c.style.filter = d > 0.02 ? `brightness(${(1 - 0.11 * Math.min(d, 6)).toFixed(3)})` : '';
      M.S.style.transform = `scale(${(1 + 0.2 * bump(t, tMsg(i) + 0.2, 0.1)).toFixed(3)})`;
    });
    show(PRO, t >= tLui + 0.1); put(PRO, 540, 1420, 80, { s: 0.85 + 0.15 * Math.min(1, SP(t, tLui + 0.1, 'snappy')), o: E(t, tLui + 0.1, 0.2) });
  }

  // =====================================================================================================
  // S10 · « Une annonce passe sous la cote ? Tu reçois un mail. » : l'aube ; la meilleure annonce arrive, son écart
  //       à la cote claque ; la notification tombe d'en haut sur sa charnière ; elle s'ouvre en e-mail (3D)
  // =====================================================================================================
  const S10 = scene(1200);
  const ANN = obj(S10.cam, MW, MH, {}); mini(ANN, LISTE[0], 0, 0, true);
  const NOTIF = obj(S10.cam, 960, 200, { borderRadius: '58px', background: 'rgba(42,34,30,.97)', boxShadow: '0 40px 90px -30px rgba(0,0,0,.85)', overflow: 'hidden', transformOrigin: '50% 0%' });
  const ico10 = mk('div', 'a', NOTIF, { left: '40px', top: '40px', width: '120px', height: '120px', borderRadius: '30px', overflow: 'hidden', background: '#1a1411' });
  ico10.innerHTML = LOGO; { const s = ico10.querySelector('svg'); s.style.height = '120px'; s.style.width = 'auto'; s.style.position = 'absolute'; s.style.left = '0'; s.style.top = '0'; }
  mk('div', 'a nw', NOTIF, { left: '196px', top: '40px', font: '700 40px Satoshi', color: '#f4f1ec' }, 'utopicar <span style="font-weight:500;color:rgba(244,241,236,.6);font-size:32px">· maintenant</span>');
  mk('div', 'a nw', NOTIF, { left: '196px', top: '104px', font: '500 36px Satoshi', color: 'rgba(244,241,236,.88)' }, nb('Clio IV · 7 650 € · <b style="color:#3ecb7f">2 300 € sous la cote</b>'));
  const MAIL = obj(S10.cam, 960, 760, { borderRadius: '44px', background: '#fff', overflow: 'hidden', boxShadow: '0 60px 120px -40px rgba(0,0,0,.8)', transformOrigin: '50% 0%' });
  MAIL.innerHTML = `<div style="padding:56px 56px 30px;font:38px Arial,sans-serif;color:#1d1d1f">
    <div style="font-size:52px;font-weight:bold;margin-bottom:8px">1 nouvelle annonce</div><div style="color:#555;margin-bottom:36px">Recherche « Renault Clio 4 »</div>
    <div style="display:flex;gap:32px;border-bottom:2px solid #e5e5e5;padding-bottom:36px"><img src="../assets/presente-v/clio4-mail.jpg" style="width:300px;height:226px;object-fit:cover;border-radius:18px;flex:none">
    <div style="line-height:1.45"><div style="color:#15307f;font-weight:bold">Clio IV 1.5 dCi 75 Zen</div><div style="font-size:50px;font-weight:bold">${nb('7 650 €')}</div><div style="color:#555">${nb('2018 · 88 500 km')}</div><div style="color:#0a7a43;font-weight:bold">${nb('2 300 € sous la cote')}</div></div></div>
    <div style="margin-top:40px"><span style="display:inline-block;background:#ff5a1f;color:#fff;padding:24px 40px;border-radius:18px;font-weight:bold">Voir mes alertes sur utopicar</span></div></div>`;
  await new Promise((r) => { const im = MAIL.querySelector('img'); if (im.complete) r(); else { im.onload = r; im.onerror = r; } });
  const tA0 = w(66) - 0.2, tSous = w(69) - 0.06, tNotif = w(71) - 0.12, tMail = w(73) - 0.12, tS10out = w(77) - 0.24;
  ph([[['Une', 66], ['annonce', 67]], [['passe', 68], ['sous', 69, 'g']], [['la', 70, 'g'], ['cote ?', 71, 'g']]], { y: 236, size: 112, out: w(72) - 0.22 });
  ph([[['Tu', 72], ['reçois', 73]], [['un', 74], ['mail.', 75, 'k']]], { y: 236, size: 124, out: tS10out });
  cue(tA0, 'whoosh', 0.7); cue(tSous, 'pop', 0.9); cue(tNotif, 'notif', 1.1); cue(tMail, 'whoosh', 0.8); cue(tS10out, 'whoosh', 0.9);
  win(tA0 - 0.02, tA0 + 0.4); win(tNotif - 0.02, tNotif + 0.3); win(tMail - 0.02, tMail + 0.4); win(tS10out, tS10out + 0.4);
  function paintS10(t) {
    if (!show(S10.root, t >= tA0 + 0.06 && t < tS10out + 0.45)) return;
    const a = SP(t, tA0 + 0.06, 'default'), n = SP(t, tNotif, 'default'), m = SP(t, tMail, 'default'), out = E(t, tS10out, 0.4, eIn2);
    // sortie : l'e-mail bascule et file par le bas (jamais sous les sous-titres), la route apparaît derrière lui
    camera(S10, { cx: 540, cy: lerp(1050, 950, Math.min(1, m)) - 1300 * out, cz: lerp(-600, 60, Math.min(1, a)) + 80 * Math.min(1, m) + 200 * out, rx: 8 + 4 * Math.sin(t * 0.6) - 30 * out, ry: -10 + 6 * Math.sin(t * 0.45) + 24 * out });
    put(ANN, 540, 1150 + 120 * Math.min(1, n), 0, { rx: -6, ry: 12, s: 1.35 * (1 + 0.06 * bump(t, tSous, 0.14)) - 0.2 * Math.min(1, m), o: 1 - E(t, tMail + 0.1, 0.3) });
    show(NOTIF, t >= tNotif - 0.02 && t < tMail + 0.3);
    put(NOTIF, 540, 880, 60, { rx: -95 * (1 - Math.min(1.04, n)), s: 0.75, o: 1 - E(t, tMail + 0.08, 0.15) });
    show(MAIL, t >= tMail - 0.02);
    put(MAIL, 540, 1060, 0, { rx: -90 * (1 - Math.min(1.03, m)), ry: 4 * Math.sin(t * 0.8) * Math.min(1, m), s: 0.7 });
  }

  // =====================================================================================================
  // S11 · « Et chaque voiture, de l'achat à la vente : » : une route en perspective ; les étapes du parc sont des
  //       panneaux plantés le long ; la caméra roule, chaque panneau s'allume quand on le passe
  // S12 · « ta vraie marge. » : la marge du mois GÉANTE, chiffres qui roulent jusqu'à 1 550 €
  // =====================================================================================================
  const S11 = scene(1000);
  const ROUTE = obj(S11.cam, 1000, 9000, { background: 'linear-gradient(180deg, rgba(244,241,236,.04), rgba(244,241,236,.11))', borderLeft: '8px solid rgba(244,241,236,.3)', borderRight: '8px solid rgba(244,241,236,.3)' });
  const LIGNE = mk('div', 'a', ROUTE, { left: '489px', top: '0', width: '22px', height: '9000px', background: 'repeating-linear-gradient(180deg, #ff8a4c 0 220px, transparent 220px 400px)' });
  const ETP = [['Repérée', '#9e968c'], ['Achetée', '#ff8a4c'], ['En préparation', '#ffc53d'], ['En vente', '#ff5a1f'], ['Vendue', '#3ecb7f']];
  // panneaux au bord de la route (largeur selon le mot), chacun sur un poteau planté dans la chaussée
  const PAN = ETP.map(([lab, col]) => {
    const c = obj(S11.cam, 100, 180, { borderRadius: '44px', background: 'linear-gradient(170deg,#211812,#120d0a 70%)', border: '3px solid rgba(244,241,236,.14)', boxShadow: '0 50px 100px -40px rgba(0,0,0,.95)' });
    const D = mk('div', 'a', c, { left: '48px', top: '70px', width: '40px', height: '40px', borderRadius: '50%', background: col });
    const L = mk('div', 'a nw', c, { left: '112px', top: '44px', font: '600 72px Clash', letterSpacing: '-.03em', color: '#f4f1ec' }, lab);
    const wd = Math.round(112 + L.getBoundingClientRect().width + 56); c.style.width = wd + 'px';
    mk('div', 'a', c, { left: (wd / 2 - 5) + 'px', top: '180px', width: '10px', height: '390px', borderRadius: '5px', background: 'linear-gradient(180deg, rgba(244,241,236,.32), rgba(244,241,236,.05))' });
    return { c, D, col, wd };
  });
  const PZ = [-700, -1500, -2000, -2500, -3000], COTE = [-1, 1, -1, 1, 0];
  const PX = PAN.map((P, i) => 540 + COTE[i] * (70 + P.wd / 2));
  // la marge : hors du monde, devant la route, toujours au centre de l'image
  const MARGE = obj(S11.root, 1000, 540, {});
  const MLAB = mk('div', 'a nw', MARGE, { left: '0', top: '20px', width: '1000px', textAlign: 'center', font: '700 46px Satoshi', color: '#3ecb7f' }, '<span style="background:rgba(62,203,127,.14);border:2px solid rgba(62,203,127,.45);border-radius:999px;padding:12px 34px">Marge réalisée ce mois</span>');
  const MVAL = mk('div', 'a nw num', MARGE, { left: '0', top: '150px', width: '1000px', textAlign: 'center', font: '600 250px/1 Clash', letterSpacing: '-.05em', color: '#f4f1ec' }, '0 €');
  const MSUB = mk('div', 'a nw', MARGE, { left: '0', top: '440px', width: '1000px', textAlign: 'center', font: '500 42px Satoshi', color: 'rgba(244,241,236,.7)' }, nb('▲ +1 550 € par rapport à septembre'));
  const tP0 = w(76) - 0.24, tMg = w(85) - 0.06, tFin = w(88) - 0.12;
  // chaque étape s'allume sur son mot : « voiture », « l'achat », « à », « vente », puis « Vendue » à la fin de « vente »
  const TPAN = [w(78) - 0.05, w(81) - 0.05, w(82) + 0.02, w(84) - 0.04, w(84) + 0.2], tPan = (i) => TPAN[i];
  // la caméra roule : chaque panneau est à 480 px devant le plan net quand il s'allume (vitesse continue)
  const hermite = (T, V, mEnd) => {
    const n = T.length, d = [], m = [];
    for (let i = 0; i < n - 1; i++) d.push((V[i + 1] - V[i]) / (T[i + 1] - T[i]));
    m[0] = d[0]; m[n - 1] = mEnd;
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]);
    return (t) => {
      if (t <= T[0]) return V[0];
      if (t >= T[n - 1]) return V[n - 1] + mEnd * (t - T[n - 1]);
      let i = 0; while (t > T[i + 1]) i++;
      const h = T[i + 1] - T[i], s = (t - T[i]) / h, s2 = s * s, s3 = s2 * s;
      return (2 * s3 - 3 * s2 + 1) * V[i] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * V[i + 1] + (s3 - s2) * h * m[i + 1];
    };
  };
  const ROULE = hermite([tP0 - 0.1, ...TPAN, 27.6], [380, ...PZ.map((z) => z + 480), -2760], -150);
  ph([[['Et', 76], ['chaque', 77], ['voiture,', 78]], [['de', 79], ["l'achat", 80, 'k']], [['à', 82], ['la', 83], ['vente :', 84, 'k']]], { y: 236, size: 104, out: tMg - 0.2 });
  ph([[['ta', 85], ['vraie', 86, 'g']], [['marge.', 87, 'g']]], { y: 236, size: 150, out: tFin - 0.1 });
  cue(tP0, 'whoosh', 0.8); ETP.forEach((e, i) => cue(tPan(i), i === 4 ? 'ding' : 'tick', 0.6)); cue(tMg, 'whoosh', 0.8); cue(tMg + 0.1, 'roll', 0.9); cue(tMg + 0.72, 'ding', 0.9);
  win(tP0 - 0.02, tPan(4) + 0.3); win(tMg - 0.02, tMg + 0.4); win(tFin - 0.1, tFin + 0.3);
  function paintS11(t) {
    if (!show(S11.root, t >= tP0 - 0.02 && t < tFin + 0.35)) return;
    const a = E(t, tP0, 0.5, doux), mg = E(t, tMg, 0.35, doux), gone = E(t, tFin - 0.1, 0.3, eIn2);
    // regard plongeant (horizon sous les sous-titres), la caméra vise toujours la route devant elle
    camera(S11, { cx: 540 + 26 * Math.sin(t * 0.7), cy: 1000, tz: ROULE(t), cz: lerp(-400, 0, a), rx: -15 + 6 * (1 - a) + 2 * Math.sin(t * 0.9), ry: 4 * Math.sin(t * 0.5), rz: -1.5 + 1.5 * Math.sin(t * 0.4) });
    put(ROUTE, 540, 1500, -4000, { rx: 90 });
    PAN.forEach((P, i) => {
      const lit = t >= tPan(i), hl = lit ? (i === 4 ? 1 : 1 - 0.5 * E(t, tPan(i) + 0.3, 0.3)) : 0;
      put(P.c, PX[i], 1020, PZ[i], { ry: -24 * COTE[i], s: 1 + 0.08 * bump(t, tPan(i), 0.14), o: 1 - mg });
      P.c.style.borderColor = hl > 0 ? P.col : 'rgba(244,241,236,.14)';
      P.c.style.boxShadow = hl > 0 ? `0 0 ${(70 * hl).toFixed(0)}px ${P.col}88, 0 50px 100px -40px rgba(0,0,0,.95)` : '0 50px 100px -40px rgba(0,0,0,.95)';
    });
    // marge : sort de « Vendue » (même axe), monte au centre, chiffres qui roulent
    show(MARGE, t >= tMg - 0.05);
    const km = SP(t, tMg, 'default'), kk = Math.min(1, km);
    put(MARGE, 540, lerp(900, 1080, kk), lerp(-800, 0, km), { rx: lerp(24, 0, kk), o: Math.min(1, km * 2) * (1 - gone), b: 6 * gone });
    MVAL.textContent = eur(1550 * E(t, tMg + 0.1, 0.6, eOut3));
    MVAL.style.color = t > tMg + 0.7 ? '#3ecb7f' : '#f4f1ec';
    MSUB.style.opacity = E(t, tMg + 0.5, 0.3).toFixed(3);
  }

  // =====================================================================================================
  // S13 · fin : l'icône du logo pivote, « utopicar » se tape dans la pastille ; « Achète juste. Revends mieux. »
  //       lettre à lettre ; « lien en bio » ; la boucle repart sur la 208
  // =====================================================================================================
  const NS = 'http://www.w3.org/2000/svg';
  const GL = mk('div', 'lay', ST, { zIndex: 18 });
  const PILL = mk('div', 'a', GL, { height: '200px', borderRadius: '100px', background: 'rgba(244,241,236,.07)', boxShadow: '0 0 0 2px rgba(244,241,236,.14)', overflow: 'hidden' });
  const REFLET = mk('div', 'a', PILL, { width: '180px', height: '420px', top: '-110px', background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,236,220,.22), rgba(255,255,255,0))' });
  const holder = mk('div', 'a', GL, { width: '640px' }); holder.innerHTML = LOGO;
  const svg = holder.querySelector('svg'); svg.style.width = '640px'; svg.style.height = 'auto'; svg.style.display = 'block'; svg.style.overflow = 'visible';
  const iconG0 = svg.querySelector('g'), iconG = document.createElementNS(NS, 'g'); svg.insertBefore(iconG, iconG0); iconG.appendChild(iconG0);
  const wordG = svg.querySelectorAll(':scope > g')[1], wp = wordG.querySelector('path'), fill = wp.getAttribute('fill');
  const subs = wp.getAttribute('d').split(/(?=M)/).filter(Boolean); wp.remove();
  const tmp = subs.map((d) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', fill); wordG.appendChild(p); const b = p.getBBox(); return { p, x0: b.x, x1: b.x + b.width }; });
  tmp.sort((a, b) => a.x0 - b.x0); const letters = [];
  for (const s of tmp) { const L = letters[letters.length - 1]; if (L && s.x0 < L.x1 - 5) { L.ps.push(s.p); L.x1 = Math.max(L.x1, s.x1); } else letters.push({ ps: [s.p], x0: s.x0, x1: s.x1 }); }
  for (const L of letters) { const lg = document.createElementNS(NS, 'g'), one = document.createElementNS(NS, 'path'); one.setAttribute('d', L.ps.map((p) => p.getAttribute('d')).join(' ')); one.setAttribute('fill', fill); L.ps.forEach((p) => p.remove()); lg.appendChild(one); wordG.appendChild(lg); L.g = lg; lg.style.transformBox = 'fill-box'; lg.style.transformOrigin = '50% 100%'; }
  const vb = svg.viewBox.baseVal, LHh = vb.height * (640 / vb.width);
  { const hb = holder.getBoundingClientRect(); for (const L of letters) { const r = L.g.getBoundingClientRect(); L.px0 = r.left - hb.left; L.px1 = r.right - hb.left; } }
  const CAR2 = mk('div', 'a', GL, { width: '9px', height: '110px', borderRadius: '5px', background: '#ff5a1f' });
  const tLg = w(88) - 0.08, tTy = tLg + 0.28, tBio = w(92) + 0.35, HX = 30;
  const SIG1 = phrase([[['Achète', 89], ['juste.', 90]]], { y: 960, size: 124, out: 99 });
  const SIG2 = phrase([[['Revends', 91, 'k'], ['mieux.', 92, 'k']]], { y: 1100, size: 140, out: 99, font: 'italic 400 140px Instrument', ls: '0em' });
  const BIO = mk('div', 'a', GL, { height: '96px', borderRadius: '48px', background: '#f4f1ec', color: '#1c1612', font: '700 40px/96px Satoshi', padding: '0 0 0 46px', whiteSpace: 'nowrap', overflow: 'hidden' });
  const BIOT = mk('span', '', BIO, null, ''); const BIOC = mk('span', '', BIO, { display: 'inline-block', width: '4px', height: '44px', background: '#ff5a1f', marginLeft: '4px', verticalAlign: '-8px' });
  cue(tLg, 'impact', 1.1); letters.forEach((L, i) => cue(tTy + i * 0.07, 'key', 0.45)); [...'lien en bio'].forEach((c, i) => { if (c !== ' ') cue(tBio + i * 0.055, 'key', 0.35); }); cue(TLOOP, 'whoosh', 0.9);
  win(TLOOP - 0.05, DUR);
  function paintFin(t) {
    const on = t >= tLg - 0.05 && t < DUR; show(GL, on); SIG1.paint(on ? t : -1); SIG2.paint(on ? t : -1); if (!on) return;
    const out = E(t, TLOOP, 0.42, eIn), drift = 26 * E(t, w(91), TLOOP - w(91), (p) => p * (2 - p));
    const a = SP(t, tLg, 'snappy'), nL = letters.filter((L, i) => t >= tTy + i * 0.07).length;
    const cy = 700 - 30 * E(t, w(89) - 0.2, 0.6) - drift;
    const lastX = nL ? letters[nL - 1].px1 : letters[0].px0 - 30;
    const wNow = Math.max(200, (lastX + HX + 60) * a), x0 = 540 - wNow / 2;
    PILL.style.width = wNow.toFixed(1) + 'px';
    tf(PILL, x0, cy - 100, { o: a * (1 - out), s: 1 - 0.9 * out });
    tf(holder, x0 + HX, cy - LHh / 2, { o: 1 - out, s: 1 - 0.9 * out });
    iconG.style.transformBox = 'fill-box'; iconG.style.transformOrigin = 'center'; iconG.style.transform = `rotate(${(-200 * (1 - SP(t, tLg + 0.05, 'default'))).toFixed(2)}deg) scale(${SP(t, tLg + 0.05, 'snappy').toFixed(3)})`;
    letters.forEach((L, i) => { const p = E(t, tTy + i * 0.07, 0.16); L.g.style.opacity = p.toFixed(3); L.g.style.transform = `translateY(${(20 * (1 - p)).toFixed(1)}px) scale(${(0.4 + 0.6 * p).toFixed(3)})`; });
    const typing = t < tTy + letters.length * 0.07 + 0.2;
    show(CAR2, (typing || Math.floor((t - tTy) / 0.4) % 2 === 0) && t < w(89));
    tf(CAR2, x0 + HX + lastX + 14, cy - 55, { o: 1 - out });
    tf(REFLET, lerp(-260, wNow + 80, E(t, w(92) + 1.0, 0.7, eIO)), 0, { r: 18 });
    SIG1.box.style.transform = `translateY(${(-drift).toFixed(1)}px)`; SIG1.box.style.opacity = (1 - out).toFixed(3);
    SIG2.box.style.transform = `translateY(${(-drift).toFixed(1)}px)`; SIG2.box.style.opacity = (1 - out).toFixed(3);
    const n = clamp(Math.floor((t - tBio) / 0.055) + 1, 0, 11); BIOT.textContent = 'lien en bio'.slice(0, n);
    const bw = 100 + n * 21; show(BIO, t >= tBio - 0.15);
    BIO.style.width = bw + 'px'; tf(BIO, 540 - bw / 2, 1330 - drift, { s: SP(t, tBio - 0.15, 'snappy') * (1 - out), o: 1 - out });
    BIOC.style.opacity = n < 11 || Math.floor((t - tBio) / 0.4) % 2 === 0 ? '1' : '0';
  }

  // sous-titres du haut : chacun est sorti (0,2 s) quand le suivant tape sa première lettre
  { const top = PHR.filter((p) => p.y0 === 236).sort((a, b) => a.first - b.first); for (let i = 0; i < top.length - 1; i++) top[i].out = Math.min(top[i].out, top[i + 1].first - 0.16); }

  // empilement des scènes : celle qui sort passe devant la caméra et découvre la suivante (traversées)
  [[S1, 12], [S3, 11], [S4, 10], [S5, 9], [S6, 8], [S7, 7], [S8, 6], [S9, 5], [S10, 3], [S11, 2]].forEach(([S, z]) => { S.root.style.zIndex = String(z); });

  // ---------- seek ----------
  window.seek = (t) => {
    const tt = t < TLOOP ? t : 0;
    fond(t);
    FLASH.style.opacity = '0';
    paintS1(tt); paintS3(t); paintS4(t); paintS5(t); paintS6(t); paintS7(t); paintS8(t); paintS9(t); paintS10(t); paintS11(t); paintFin(t);
    for (const p of PHR) p.paint(tt);
    S1.root.style.clipPath = t >= TLOOP ? `circle(${(2300 * E(t, TLOOP + 0.12, DUR - TLOOP - 0.14, eIO)).toFixed(0)}px at 540px 950px)` : '';
  };
  const inWin = (t) => FAST.some(([a, b]) => t >= a && t <= b);
  window.shutter = (t) => (inWin(t) ? 1 : 0.5);
  window.samples = (t) => (inWin(t) ? 8 : 4);
  window.filmDur = DUR;
  window.cues = CUES.sort((x, y) => x.t - y.t);
  window.seek(0);
  window.filmReady = true;
})().catch((e) => { console.error('FILM', e.message, e.stack); document.title = 'ERREUR ' + e.message; });
