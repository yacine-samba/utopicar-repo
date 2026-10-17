// Présentation utopicar v4 (9:16, voix de Simon) : « dans l'interface ».
// Demande de l'utilisateur : ne plus montrer l'app dans un téléphone ; le film EST l'interface. Chaque composant
// d'utopicar est recodé à l'échelle du film avec les textes, les chiffres de la base démo, les couleurs, les polices
// et les courbes d'animation de l'app (ease-doux, ease-ressort, « remplit », « surligne », « ping »). Tout s'anime de
// A à Z, la caméra passe d'un écran à l'autre sans coupe (chaque élément devient le suivant), et les paroles de la voix
// deviennent de la grande typographie animée (grammaire 1600.agency : Juicebox, lemlist).
// Contrat : window.seek(t) peint l'image t, sans état entre les images ; tous les instants viennent des mots de la voix
// (audio/vo-presentev3/vo.words.json). Flou de bougé : window.shutter / window.samples (MB=8).
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

  // ---------- courbes : celles de l'app (cubic-bezier) et quelques classiques ----------
  const bez = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (s) => ((ax * s + bx) * s + cx) * s, Y = (s) => ((ay * s + by) * s + cy) * s, dX = (s) => (3 * ax * s + 2 * bx) * s + cx;
    return (x) => { if (x <= 0) return 0; if (x >= 1) return 1; let s = x; for (let i = 0; i < 10; i++) { const e = X(s) - x, d = dX(s); if (Math.abs(e) < 1e-7 || Math.abs(d) < 1e-7) break; s = clamp(s - e / d, 0, 1); } return Y(s); };
  };
  const doux = bez(0.2, 0.8, 0.2, 1), ressort = bez(0.34, 1.56, 0.64, 1);            // --ease-doux, --ease-ressort de l'app
  const eOut = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
  const eIn = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : Math.pow(2, 10 * p - 10));
  const eIO = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2);
  const eOut3 = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(1 - p, 3)), eOut4 = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(1 - p, 4));
  const E = (t, t0, d, f = doux) => f(clamp((t - t0) / d, 0, 1));
  const SP = (t, t0, pr = 'default') => (t < t0 ? 0 : spring(t - t0, pr));
  const bump = (t, t0, d = 0.14) => clamp(spring(t - t0, 'snappy') - spring(t - t0 - d, 'snappy'), 0, 1);
  const tr = (t, keys) => Motion.track(t, keys);
  const mix = (a, b, p) => a.map((v, i) => lerp(v, b[i], p));

  // ---------- éléments ----------
  const mk = (tag, cls, parent, css, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const show = (e, v) => { e.style.display = v ? '' : 'none'; return v; };
  // pose : translation (coin haut-gauche, ou centre si c), perspective + rotations 3D, rotation, échelle, opacité, flou
  const tf = (e, x, y, o = {}) => {
    e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)${o.c ? ' translate(-50%,-50%)' : ''}${o.p ? ` perspective(${o.p}px) rotateX(${(o.rx || 0).toFixed(2)}deg) rotateY(${(o.ry || 0).toFixed(2)}deg)` : ''} rotate(${(o.r || 0).toFixed(2)}deg) scale(${(o.sx ?? o.s ?? 1).toFixed(4)},${(o.sy ?? o.s ?? 1).toFixed(4)})`;
    if (o.o != null) e.style.opacity = clamp(o.o, 0, 1).toFixed(3);
    if (o.b != null) e.style.filter = o.b > 0.15 ? `blur(${o.b.toFixed(2)}px)` : '';
  };
  const CUES = [], cue = (t, k, g = 1) => { if (t >= 0 && t < DUR) CUES.push({ t: +t.toFixed(3), k, g }); };
  const FAST = []; const win = (a, b) => FAST.push([a, b]);
  const milliers = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const eur = (n) => `${milliers(n)} €`;
  const nb = (h) => (typeof h === 'string' ? h.replace(/(\d) (?=\d{3}(?!\d))/g, '$1\u202f').replace(/ (€|%)/g, '\u00a0$1').replace(/\((\+|−|-)?(\d+)\u00a0%\)/g, '($1$2\u00a0%)') : h);
  const txt = (parent, css, html, cls = 'a nw') => mk('div', cls, parent, css, nb(html));
  const flot = (t, i = 0) => ({ y: 6 * Math.sin(t * 1.25 + i * 1.7), r: 0.4 * Math.sin(t * 0.8 + i * 2.3) });

  // ---------- instants (mots de la voix) ----------
  const tFlip = w(9) - 0.12, tCnt1 = w(12) - 0.15, tP3 = w(14) - 0.3, tPaste = w(14) + 0.02, tBtn = w(17) - 0.12, tTap = w(18) + 0.4;
  const tLoad = tTap + 0.14, tMin = w(19), tRing = w(21) + 0.08, tCards = w(22) - 0.12, tC = [w(23) - 0.12, w(25) - 0.12, w(27) - 0.12];
  const tPile = w(28) - 0.04, tVer = w(30) - 0.12, tEv = w(31) - 0.04, tCl = w(33) - 0.3;
  const tOff = w(38) - 0.12, tObj = w(41) - 0.1, tPla = w(43) - 0.12, tLine = w(44) - 0.04;
  const tL0 = w(48) - 0.25, tScr = w(52) - 0.08, tStop = w(54) + 0.18, tS0 = w(55) - 0.12, tSw = w(57) - 0.03;
  const tN = w(60) - 0.12, tLui = w(63) - 0.1, tAube = w(66) - 0.2, tAnn = w(66) - 0.08, tSous = w(69) - 0.05, tNotif = w(71) - 0.12, tMail = w(73) - 0.12;
  const tParc = w(76) - 0.05, tAch = w(81) - 0.06, tVen = w(84) - 0.06, tKpi = w(85) - 0.12, tLogo = w(88) - 0.08;

  // =====================================================================================================
  // FOND : celui de l'app (lueur orange en haut, dégradé bg0 → bg1) + deux halos qui prennent la couleur de la partie
  // =====================================================================================================
  const FOND = mk('div', 'lay', ST, { background: 'linear-gradient(160deg,#0b0a09,#17100b 60%,#0b0a09)' });
  const HALOS = [0, 1].map(() => mk('div', 'a', FOND, { width: '1900px', height: '1900px', left: '-950px', top: '-950px' }));
  const GLOW = mk('div', 'lay', FOND, { background: 'radial-gradient(ellipse 70% 40% at 50% -10%, rgba(255,90,31,.2), transparent 70%)' });
  const NUIT = mk('div', 'lay', FOND, { background: 'linear-gradient(180deg,#070b1c,#0b1226 55%,#060814)', opacity: 0 });
  const PAL = {
    app: [[255, 90, 31, 0.2], [140, 45, 15, 0.26]], rouge: [[235, 55, 55, 0.36], [140, 20, 30, 0.32]], vert: [[62, 203, 127, 0.24], [20, 90, 60, 0.3]],
    nuit: [[80, 100, 230, 0.3], [70, 50, 170, 0.3]], aube: [[255, 160, 70, 0.26], [160, 70, 25, 0.26]],
  };
  const PALK = [[0, 'app'], [tFlip, 'rouge'], [tP3, 'app'], [tPile, 'rouge'], [tCl, 'vert'], [tL0, 'app'], [tN, 'nuit'], [tAube, 'aube'], [tParc, 'app'], [tKpi, 'vert'], [tLogo, 'app']];
  function fond(t) {
    let c = PAL[PALK[0][1]];
    for (let i = 1; i < PALK.length; i++) { const [t0, k] = PALK[i]; c = c.map((v, j) => mix(v, PAL[k][j], E(t, t0, 0.4, eIO))); }
    const pos = [[540 + 280 * Math.sin(t * 0.21), 520 + 160 * Math.cos(t * 0.17)], [380 + 220 * Math.cos(t * 0.15 + 1), 1450 + 140 * Math.sin(t * 0.19)]];
    HALOS.forEach((h, i) => { const [r, g, b, a] = c[i]; h.style.background = `radial-gradient(circle at 50% 50%, rgba(${r | 0},${g | 0},${b | 0},${a.toFixed(3)}) 0%, rgba(${r | 0},${g | 0},${b | 0},0) 60%)`; tf(h, pos[i][0], pos[i][1], { s: 1 + 0.08 * Math.sin(t * 0.3 + i) }); });
    NUIT.style.opacity = (0.92 * E(t, tN - 0.1, 0.4, eIO) * (1 - E(t, tAube, 0.5, eIO))).toFixed(3);
  }
  const CAM = mk('div', 'lay', ST, { transformOrigin: '540px 960px' });   // caméra : légère orbite, jamais à l'arrêt
  const plan = () => mk('div', 'lay', CAM);
  const TXT = mk('div', 'lay', ST);                                       // paroles au-dessus de tout
  const DEMO = txt(ST, { width: '1080px', textAlign: 'center', top: '1446px', font: '500 24px Satoshi', color: 'rgba(244,241,236,.5)' }, 'Données de démonstration', 'a');

  // =====================================================================================================
  // LES PAROLES : chaque mot de la voix entre flou, monte et se pose net 0,08 s avant d'être dit (Clash, couleur de la
  // partie sur les mots clés) ; la phrase part mot après mot avant que la suivante n'arrive. Phrases chocs en géant.
  // =====================================================================================================
  const COL = { k: '#ff8a4c', r: '#ff7a7a', g: '#3ecb7f', b: '#a9b8ff', w: '#f4f1ec' };
  const G = (words, o = {}) => ({ words, y: o.y ?? 250, size: o.size ?? 92, w: o.w ?? 820 });
  const CAPS = [
    G([['Cette', 0], ['208', 2, 'k'], ['à', 3], ['7 190 € ?', 4, 'k']]),
    G([['À', 7], ['la', 8], ['revente,', 9], ['tu', 10], ['perds', 11, 'r'], ['2 688 €.', 12, 'r']]),
    G([['Colle', 14], ["l'annonce", 15], ['dans', 17], ['utopicar.', 18, 'k']]),
    G([['En', 19], ['une', 20, 'k'], ['minute :', 21, 'k']], { y: 440, size: 140 }),
    G([['la', 22], ['cote,', 23, 'k'], ['les', 24], ['travaux,', 25, 'k'], ['ta', 26], ['marge…', 27, 'k']]),
    G([['et', 28], ['le', 29], ['verdict.', 30, 'k']]),
    G([['À', 31, 'r'], ['éviter.', 32, 'r']], { y: 232, size: 160 }),
    G([['Une', 33], ['bonne', 34, 'g'], ['affaire ?', 35, 'g']]),
    G([['Ton', 37], ['prix', 38, 'k'], ["d'offre…", 39, 'k']]),
    G([['et', 41], ['le', 42], ['plafond', 43, 'k'], ['à', 44], ['ne', 45], ['pas', 46], ['dépasser.', 47, 'r']]),
    G([['Et', 48], ['pour', 49], ['les', 50], ['trouver,', 51]]),
    G([['arrête', 52, 'k'], ['de', 53, 'k'], ['scroller.', 54, 'k']], { y: 228, size: 118 }),
    G([['Ta', 55], ['recherche', 56], ['tourne', 57, 'k'], ['toute', 58, 'k'], ['seule.', 59, 'k']]),
    G([['Toi,', 60], ['tu', 61], ['dors.', 62, 'b']], { y: 400, size: 170 }),
    G([['Lui,', 63], ['il', 64], ['bosse.', 65, 'k']], { y: 236, size: 100 }),
    G([['Une', 66], ['annonce', 67], ['passe', 68], ['sous', 69, 'g'], ['la', 70, 'g'], ['cote ?', 71, 'g']]),
    G([['Tu', 72], ['reçois', 73], ['un', 74], ['mail.', 75, 'k']]),
    G([['Et', 76], ['chaque', 77], ['voiture,', 78], ['de', 79], ["l'achat", 80, 'k'], ['à', 82], ['la', 83], ['vente :', 84, 'k']]),
    G([['ta', 85], ['vraie', 86, 'g'], ['marge.', 87, 'g']], { y: 232, size: 150 }),
  ];
  CAPS.forEach((g, gi) => {
    g.box = mk('div', 'a', TXT, { left: (540 - g.w / 2) + 'px', top: g.y + 'px', width: g.w + 'px', textAlign: 'center', lineHeight: 1.04 });
    g.sp = g.words.map(([s, i, k]) => ({ t: w(i), k, el: mk('span', 'mot', g.box, { letterSpacing: '-.025em', color: COL[k || 'w'] }, s) }));
    const taille = (z) => g.sp.forEach((sp) => { sp.el.style.font = `600 ${sp.k ? Math.round(z * 1.04) : z}px Clash`; sp.el.style.margin = `0 ${Math.round(z * 0.12)}px`; });
    let z = g.size; taille(z);
    while (g.box.offsetHeight > z * 1.04 * 2.4 && z > 64) { z -= 4; taille(z); }
    g.size = z;
    g.t0 = g.sp[0].t; const nxt = gi + 1 < CAPS.length ? w(CAPS[gi + 1].words[0][1]) : tLogo + 0.05;
    g.tEnd = nxt - 0.24; g.stag = Math.min(0.012, 0.05 / g.sp.length);
  });
  function paroles(t) {
    for (const g of CAPS) {
      if (!show(g.box, t >= g.t0 - 0.14 && t < g.tEnd + 0.22)) continue;
      g.sp.forEach((s, j) => {
        const p = E(t, s.t - 0.09, 0.34), q = E(t, g.tEnd + j * g.stag, 0.12, eIn);
        tf(s.el, 0, 34 * (1 - p) - 28 * q, { s: 0.92 + 0.08 * p, o: p * (1 - q), b: 9 * (1 - p) + 6 * q });
      });
    }
  }

  // =====================================================================================================
  // COMPOSANTS recodés d'après l'app (échelle ×2,2 : une carte de 364 px de l'app fait 800 px dans le film)
  // =====================================================================================================
  const CW = 800, CX = 140;                  // colonne des cartes : 140 → 940 (zone sûre)
  // une pile qui grandit : le groupe reste centré sur yc ; la caméra est serrée sur la première carte (zoomMax) et
  // recule à mesure que les suivantes arrivent (ressorts : le recadrage est continu)
  function pile(t, times, H, gap, yc, zoomMax) {
    const ks = times.map((t0) => SP(t, t0, 'default')), n = ks.reduce((a, b) => a + b, 0), c = Math.max(0, n - 1) / 2;
    return { ks, n, y: (i) => yc + (i - c) * (H + gap) - H / 2, z: lerp(zoomMax, 1, clamp((n - 1) / Math.max(1, times.length - 1), 0, 1)) };
  }
  // anneau de note de l'app (cercle r = 52 dans 120 × 120, trait 10)
  function anneau(parent, size, col) {
    const box = mk('div', 'a', parent, { width: size + 'px', height: size + 'px' });
    box.innerHTML = `<svg viewBox="0 0 120 120" width="${size}" height="${size}" style="position:absolute;left:0;top:0;transform:rotate(-90deg)"><circle cx="60" cy="60" r="52" fill="none" stroke="rgba(244,241,236,.1)" stroke-width="10"/><circle class="arc" cx="60" cy="60" r="52" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="0 326.73"/></svg>`;
    const n = txt(box, { width: size + 'px', textAlign: 'center', top: (size * 0.3) + 'px', font: `600 ${Math.round(size * 0.3)}px Clash`, letterSpacing: '-.02em' }, '0', 'a nw num');
    const s = txt(box, { width: size + 'px', textAlign: 'center', top: (size * 0.63) + 'px', font: `500 ${Math.round(size * 0.1)}px Satoshi`, color: 'var(--ink3)' }, 'sur 100', 'a nw');
    const arc = box.querySelector('.arc');
    return { box, n, s, arc, set(note, p, c) { arc.setAttribute('stroke-dasharray', `${(326.73 * note / 100 * p).toFixed(2)} 326.73`); n.textContent = String(Math.round(note * p)); if (c) arc.setAttribute('stroke', c); } };
  }
  // carte de note du rapport : « Bon prix ? », « Des travaux ? », « Ça rapporte ? »
  const NH = 304;
  function carteNote(parent, { lab, val, vcol, note, ncol, sub, h = NH }) {
    const c = mk('div', 'carte', parent, { width: CW + 'px', height: h + 'px' });
    const L = txt(c, { left: '50px', top: '36px', font: '500 37px Satoshi', color: 'var(--ink2)' }, lab);
    txt(c, { right: '46px', left: 'auto', top: '26px', font: '500 50px Satoshi', color: 'var(--ink3)' }, '›');
    const V = txt(c, { left: '48px', top: '84px', font: '600 86px Clash', letterSpacing: '-.025em', color: vcol }, val, 'a nw num');
    const P = mk('div', 'a piste', c, { left: '50px', top: '196px', width: (CW - 100) + 'px', height: '14px' }); const F = mk('i', '', P, { width: '0%', background: ncol });
    const S = txt(c, { left: '50px', top: '224px', width: (CW - 100) + 'px', font: '500 29px/1.3 Satoshi', color: 'var(--ink3)', whiteSpace: 'normal' }, sub, 'a');
    return { c, L, V, P, F, S, note };
  }
  // carte verdict : anneau, « AVANT LE PREMIER MESSAGE », verdict, explication, « À faire »
  function carteVerdict(parent, { cls, note, col, titre, texte, faire }) {
    const c = mk('div', 'carte ' + cls, parent, { width: CW + 'px', height: '740px' });
    const R = anneau(c, 230, col); tf(R.box, 50, 50);
    const K = txt(c, { left: '50px', top: '318px' }, 'Avant le premier message', 'a nw kick');
    const T = txt(c, { left: '50px', top: '360px', font: '600 84px Clash', letterSpacing: '-.025em', color: col }, titre);
    const X = txt(c, { left: '50px', top: '472px', width: (CW - 100) + 'px', font: '500 33px/1.4 Satoshi', color: 'var(--ink2)', whiteSpace: 'normal' }, texte, 'a');
    const F = txt(c, { left: '50px', top: '624px', width: (CW - 100) + 'px', font: '500 33px/1.4 Satoshi', color: 'var(--ink2)', whiteSpace: 'normal' }, `<b style="color:var(--ink);font-weight:700">À faire :</b> ${faire}`, 'a');
    return { c, R, K, T, X, F };
  }

  // =====================================================================================================
  // P1 · « Cette 208 à 7 190 € ? » : l'annonce (photo, modèle, puces, prix) ; « À la revente » → la carte se retourne :
  //      « Ça rapporte ? −2 688 € » (la perte compte pendant « tu perds » et se pose avant d'être dite)
  // =====================================================================================================
  const P1 = plan();
  const FLIP = mk('div', 'a', P1, { width: CW + 'px', height: '860px', transformStyle: 'preserve-3d' });
  const AN = mk('div', 'carte', FLIP, { width: CW + 'px', height: '860px', overflow: 'hidden', backfaceVisibility: 'hidden' });
  const ANph = mk('div', 'a', AN, { width: CW + 'px', height: '440px', background: 'radial-gradient(ellipse 75% 70% at 50% 62%, #4a3426, #1a130e 72%)', overflow: 'hidden' });
  const ANcar = mk('img', 'a', ANph, { width: '760px' }); ANcar.src = '../assets/hooks-cut/208-annonce-cut.png';
  await new Promise((r) => { if (ANcar.complete) r(); else { ANcar.onload = r; ANcar.onerror = r; } });
  const ANt = txt(AN, { left: '50px', top: '476px', font: '600 76px Clash', letterSpacing: '-.025em' }, 'Peugeot <span>208</span>');
  const AN208 = ANt.querySelector('span');
  const ANs = txt(AN, { left: '50px', top: '566px', font: '500 32px Satoshi', color: 'var(--ink3)' }, '1.2 PureTech 110 Allure · Vitrolles · professionnel');
  const ANchips = ['2016', '116 789 km', 'Essence', 'Manuelle'].map((s) => mk('span', 'pillule', AN, { position: 'absolute', top: '626px', left: '0px' }, s));
  { let x = 50; for (const e of ANchips) { e.style.left = x + 'px'; x += e.offsetWidth + 14; } }
  const ANp = txt(AN, { left: '50px', top: '712px', font: '600 112px Clash', letterSpacing: '-.03em' }, '7 190 €', 'a nw num');
  const ANhl = mk('div', 'a', AN, { left: '44px', top: '806px', height: '14px', width: '0px', borderRadius: '7px', background: 'var(--o)' });
  // dos : « Ça rapporte ? » (carte de note de l'app) + la ligne « Vente normale » de « Ce qu'il vous resterait »
  const RA = mk('div', 'carte mauvais', FLIP, { width: CW + 'px', height: '860px', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' });
  txt(RA, { left: '56px', top: '54px', font: '500 40px Satoshi', color: 'var(--ink2)' }, 'Ça rapporte ?');
  txt(RA, { right: '52px', left: 'auto', top: '44px', font: '500 52px Satoshi', color: 'var(--ink3)' }, '›');
  const RAv = txt(RA, { left: '50px', top: '130px', font: '600 176px Clash', letterSpacing: '-.04em', color: 'var(--bad)' }, '−2 688 €', 'a nw num');
  const RAbar = mk('div', 'a piste', RA, { left: '56px', top: '356px', width: (CW - 112) + 'px', height: '16px' }); mk('i', '', RAbar, { width: '2%', background: 'var(--bad)' });
  txt(RA, { left: '56px', top: '398px', width: (CW - 112) + 'px', font: '500 36px/1.35 Satoshi', color: 'var(--ink2)', whiteSpace: 'normal' }, "Vous perdriez de l'argent au prix affiché", 'a');
  const RAsep = mk('div', 'a', RA, { left: '56px', top: '536px', width: (CW - 112) + 'px', height: '2px', background: 'var(--line)' });
  const RAl1 = txt(RA, { left: '56px', top: '574px', font: '500 32px Satoshi', color: 'var(--ink3)' }, 'Vente normale · 1 à 2 mois');
  const RAl2 = txt(RA, { left: '56px', top: '628px', font: '600 60px Clash', letterSpacing: '-.02em' }, 'Revente 5 300 €', 'a nw num');
  const RAl3 = txt(RA, { left: '56px', top: '714px', font: '500 32px Satoshi', color: 'var(--ink3)' }, 'Achat 7 190 € · frais et travaux compris');
  const tCnt0 = tFlip + 0.12;
  cue(0, 'impact', 1); cue(w(4) - 0.06, 'pop', 0.8); cue(tFlip, 'whoosh', 0.9); cue(tCnt0, 'roll', 0.8); cue(tCnt1, 'thud', 1.1);
  win(tFlip - 0.02, tFlip + 0.36); win(tP3 - 0.02, tPaste + 0.12);
  function paintP1(t) {
    if (!show(P1, t < tPaste + 0.1)) return;
    // image 0 : tout est là ; la caméra recule déjà, la carte se redresse (premier mouvement avant 0,4 s)
    const a = SP(t, -0.25, 'heavy'), flip = SP(t, tFlip, 'default');
    const hit = 0.05 * bump(t, w(4) - 0.06, 0.12) + 0.05 * bump(t, tCnt1 - 0.02, 0.14), doute = bump(t, w(6) - 0.05, 0.12);
    // vers « Colle » : la carte se retourne sur l'annonce, rapetisse et plonge dans le champ du plan 3
    const go = E(t, tP3, tPaste - tP3, eIO), back = SP(t, tP3, 'default');
    const cx = 540, cy = lerp(950 - 30 * (1 - a), CHAMP_C.y, go), sc = lerp(1, 0.32, go) * (1 + hit) * (1.06 - 0.06 * a);
    const push = E(t, 0.15, tFlip - 0.15, (p) => p * p * (3 - 2 * p)), fl = flot(t);
    tf(FLIP, cx - CW / 2, cy - 430 - 60 * push * (1 - go) + fl.y, { p: 2200, rx: 10 * (1 - a) + 2 * Math.sin(t * 0.7) + 25 * go - 4 * push, ry: 180 * flip + 180 * back + 4 * Math.sin(t * 0.5), r: -1.5 * doute + fl.r, s: sc * (1 + 0.08 * push * (1 - go)), o: 1 - E(t, tPaste - 0.08, 0.12) });
    AN208.style.color = t >= w(2) - 0.06 ? 'var(--o2)' : ''; AN208.style.display = 'inline-block'; AN208.style.transform = `scale(${(1 + 0.12 * bump(t, w(2) - 0.06, 0.12)).toFixed(3)})`;
    tf(ANcar, 20 + 18 * Math.sin(t * 0.6) - 30 * q01(t), 30 + 6 * Math.sin(t * 0.9), { s: 1.02 + 0.04 * q01(t) });
    ANchips.forEach((e, i) => { const p = E(t, 0.35 + i * 0.07, 0.4); e.style.opacity = p.toFixed(3); e.style.transform = `translateY(${(14 * (1 - p)).toFixed(1)}px)`; });
    ANhl.style.width = (300 * E(t, w(4) - 0.06, 0.45)).toFixed(1) + 'px';                 // « surligne » sous le prix
    ANp.style.color = t >= w(4) - 0.06 ? 'var(--o2)' : '';
    const n = E(t, tCnt0, tCnt1 - tCnt0, eOut3); RAv.textContent = '−' + eur(2688 * n);
    [RAsep, RAl1, RAl2, RAl3].forEach((e, i) => { const p = E(t, tCnt1 + 0.1 + i * 0.06, 0.4); e.style.opacity = p.toFixed(3); e.style.transform = `translateY(${(16 * (1 - p)).toFixed(1)}px)`; });
  }
  const q01 = (t) => clamp(t / tFlip, 0, 1);

  // =====================================================================================================
  // P2 · « Colle l'annonce dans utopicar. » : le formulaire de l'app plein cadre ; l'annonce se colle dans le champ,
  //      ligne à ligne sous la sélection orange ; le bouton « Analyser l'annonce » arrive, un doigt l'enfonce
  // =====================================================================================================
  const P2 = plan();
  const H2 = txt(P2, { font: '600 74px Clash', letterSpacing: '-.025em' }, 'Analyser une annonce');
  const CH = mk('div', 'carte', P2, { width: CW + 'px', height: '700px' });
  txt(CH, { left: '50px', top: '40px', font: '500 33px Satoshi', color: 'var(--ink2)' }, "L'annonce");
  const CHf = mk('div', 'a', CH, { left: '40px', top: '96px', width: (CW - 80) + 'px', height: '560px', borderRadius: '34px', background: 'rgba(0,0,0,.3)', border: '2.4px solid var(--line2)', overflow: 'hidden' });
  const LIGNES = ['Peugeot 208 1.2 PureTech 110 Allure', 'Prix : 7 190 €', 'Marque : Peugeot', 'Modèle : 208', 'Année : 2016', 'Kilométrage : 116 789 km', 'Énergie : Essence', 'Boîte de vitesse : Manuelle', 'Vendeur : professionnel'];
  const CHl = LIGNES.map((s, i) => txt(CHf, { left: '34px', top: (28 + i * 58) + 'px', font: '500 37px Satoshi', padding: '0 6px', borderRadius: '6px' }, s));
  const CHcaret = mk('div', 'a', CHf, { left: '40px', top: '32px', width: '4px', height: '44px', background: 'var(--o)' });
  const CHAMP_C = { x: 540, y: 0 };                        // centre du champ dans le film (posé par paintP2)
  const BT = mk('div', 'btno', P2, { width: '560px', height: '120px' }, "Analyser l'annonce");
  const DOIGT = mk('div', 'a', P2, { width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(255,255,255,.32)', border: '3px solid rgba(255,255,255,.85)', boxShadow: '0 10px 30px rgba(0,0,0,.35)' });
  const ONDE = mk('div', 'a', P2, { width: '110px', height: '110px', borderRadius: '50%', border: '4px solid rgba(255,255,255,.9)' });
  cue(tPaste, 'paste', 1); cue(tBtn, 'whoosh', 0.5); cue(tTap, 'click', 1);
  function paintP2(t) {
    const on = t >= tP3 - 0.05 && t < tMin + 0.6; if (!show(P2, on)) { CHAMP_C.y = 1120; return; }
    // le formulaire monte depuis le bas (la caméra descend dans la page), puis recule quand l'analyse démarre
    const up = SP(t, tP3, 'default'), out = E(t, tLoad, 0.45, eIn);
    const y0 = lerp(1500, 0, up) - 900 * out;
    show(H2, false);
    const chY = 610 + y0; tf(CH, CX, chY, { p: 2400, rx: 14 * (1 - up), o: 1 - out });
    CHAMP_C.y = chY + 96 + 280;
    // collage : la sélection orange balaie les lignes, puis s'efface
    CHl.forEach((e, i) => { const p = E(t, tPaste + i * 0.025, 0.18); e.style.opacity = p.toFixed(3); const hl = E(t, tPaste + 0.35 + i * 0.03, 0.4, eOut3); e.style.background = p > 0 ? `rgba(255,90,31,${(0.42 * (1 - hl)).toFixed(3)})` : ''; });
    show(CHcaret, t < tPaste || Math.floor((t - tPaste) / 0.4) % 2 === 0);
    tf(CHcaret, t < tPaste ? 40 : 40 + CHl[CHl.length - 1].offsetWidth + 6, t < tPaste ? 32 : 28 + (CHl.length - 1) * 58 + 4);
    // bouton : arrive sur « dans », enfoncé (×0,95) au toucher, puis se change en chrono (P3)
    const bIn = SP(t, tBtn, 'default'), pr = bump(t, tTap - 0.04, 0.12);
    const bx = 540, by = 1390 + y0 * 0.0 + 160 * (1 - bIn);
    show(BT, t < tLoad + 0.02);
    tf(BT, bx - 280, by - 60, { s: (0.9 + 0.1 * bIn) * (1 - 0.05 * pr), o: bIn });
    BTC.x = bx; BTC.y = by;
    // le doigt
    const dOn = t >= tTap - 0.4 && t < tTap + 0.35; show(DOIGT, dOn); show(ONDE, dOn && t >= tTap);
    if (dOn) {
      const a = E(t, tTap - 0.4, 0.25), b = 1 - E(t, tTap + 0.15, 0.2);
      tf(DOIGT, bx + 120, by + 20 + 80 * (1 - a), { c: 1, s: (1 - 0.2 * pr) * (0.85 + 0.15 * a), o: a * b });
      const u = clamp((t - tTap) / 0.4, 0, 1); tf(ONDE, bx + 120, by + 20, { c: 1, s: 0.6 + 1.6 * eOut(u), o: (1 - u) * 0.9 });
    }
  }
  const BTC = { x: 540, y: 1390 };

  // =====================================================================================================
  // P3 · « En une minute : » : le bouton se replie en cercle et devient un chrono (60 s qui défilent) ;
  //      le cercle se remplit : c'est l'anneau de note du rapport, qui file en haut à gauche
  // =====================================================================================================
  const P3 = plan();
  const MORPH = mk('div', 'a', P3, { borderRadius: '999px', background: 'var(--o)', boxShadow: '0 28px 80px -28px rgba(255,90,31,.85)' });
  const CHRONO = anneau(P3, 420, '#ff5a1f');
  const CHs = txt(CHRONO.box, { width: '420px', textAlign: 'center', top: '138px', font: '600 128px Clash', letterSpacing: '-.03em' }, '60 s', 'a nw num');
  CHRONO.n.style.display = 'none'; CHRONO.s.style.display = 'none';
  cue(tLoad, 'whoosh', 0.6); for (let i = 0; i < 6; i++) cue(tMin + 0.1 + i * 0.09, 'tick', 0.45); cue(tRing, 'ding', 0.7);
  win(tLoad - 0.02, tLoad + 0.3); win(tCards - 0.02, tCards + 0.35);
  function paintP3(t) {
    const on = t >= tLoad - 0.02 && t < tVer + 0.6; if (!show(P3, on)) return;
    // le bouton (560 × 120) se replie en disque de 300 px, centré dans le cadre
    const m = E(t, tLoad, 0.38, doux), cxm = lerp(BTC.x, 540, m), cym = lerp(BTC.y, 1000, m);
    const Wm = lerp(560, 420, m), Hm = lerp(120, 420, m);
    show(MORPH, t < tLoad + 0.5);
    MORPH.style.width = Wm.toFixed(1) + 'px'; MORPH.style.height = Hm.toFixed(1) + 'px';
    tf(MORPH, cxm - Wm / 2, cym - Hm / 2, { o: 1 - E(t, tLoad + 0.3, 0.18) });
    // chrono : 60 s → 0 s pendant « En une minute », l'anneau se remplit ; puis il devient la note du rapport
    const run = E(t, tMin - 0.05, tRing - tMin + 0.05, (p) => p);
    const toBack = E(t, tCards, 0.32, eIn);
    tf(CHRONO.box, 540 - 210, 1000 - 210 - 60 * toBack, { s: (1 - 0.5 * toBack) * (0.6 + 0.4 * SP(t, tLoad + 0.15, 'snappy')), o: E(t, tLoad + 0.2, 0.15) * (1 - toBack), b: 10 * toBack });
    CHRONO.arc.setAttribute('stroke-dasharray', `${(326.73 * run).toFixed(2)} 326.73`);
    CHs.textContent = t < tRing ? `${Math.max(0, Math.ceil(60 * (1 - run)))} s` : '1 min';
    CHs.style.color = t >= tRing ? 'var(--o2)' : '';
  }

  // =====================================================================================================
  // P4 · « la cote, les travaux, ta marge… » : les trois cartes du rapport arrivent une par une (de droite, en 3D),
  //      leur valeur se pose, leur barre de note se remplit ; « et le verdict » : elles se rangent en pile
  // =====================================================================================================
  const P4 = plan();
  const S4 = mk('div', 'lay', P4, { transformOrigin: '540px 965px' });
  const NOTES = [
    carteNote(S4, { lab: 'Bon prix ?', val: 'Trop cher', vcol: 'var(--bad)', note: 0, ncol: 'var(--bad)', sub: '1 671 € de plus que les annonces comparables (+30 %)' }),
    carteNote(S4, { lab: 'Des travaux ?', val: '≈ 540 €', vcol: 'var(--ok)', note: 80, ncol: 'var(--ok)', sub: 'Probable sur 12 mois, entre 0 € et 1 650 €' }),
    carteNote(S4, { lab: 'Ça rapporte ?', val: '−2 688 €', vcol: 'var(--bad)', note: 0, ncol: 'var(--bad)', sub: "Vous perdriez de l'argent au prix affiché" }),
  ];
  tC.forEach((t0) => { cue(t0, 'pop', 0.85); }); cue(tPile, 'whoosh', 0.7);
  tC.forEach((t0) => win(t0 - 0.02, t0 + 0.3)); win(tPile - 0.02, tVer + 0.3);
  function paintP4(t) {
    const on = t >= tC[0] - 0.02 && t < tVer + 0.5; if (!show(P4, on)) return;
    const pile_ = E(t, tPile, 0.42, doux), gone = E(t, tVer + 0.05, 0.25, eIn), st = pile(t, tC, NH, 22, 965, 1.15);
    tf(S4, 0, 0, { s: lerp(st.z, 1, pile_) });
    NOTES.forEach((N, i) => {
      const t0 = tC[i], a = st.ks[i], b = SP(t, t0 + 0.04, 'snappy');
      show(N.c, t >= t0 - 0.01);
      // pile : les cartes glissent vers le centre, l'une sur l'autre, légèrement tournées
      const pile = pile_, yy = lerp(st.y(i), 965 - NH / 2 + (i - 1) * 22, pile), rz = lerp(0, [-4, 3, -1.5][i], pile);
      tf(N.c, CX + 640 * (1 - b), yy + 30 * (1 - a), { p: 2000, ry: -28 * (1 - a) + 2 * Math.sin(t * 0.8 + i), rx: 3 * Math.sin(t * 0.6 + i), r: rz, s: (0.92 + 0.08 * a) * lerp(1, 0.9, pile) * (1 - 0.2 * gone), o: Math.min(1, a * 1.4) * (1 - gone) });
      N.F.style.width = (Math.max(2, N.note) * E(t, t0 + 0.18, 0.5, eOut3)).toFixed(1) + '%';
      N.V.style.transform = `scale(${(1 + 0.06 * bump(t, t0 + 0.12, 0.1)).toFixed(3)})`; N.V.style.transformOrigin = '0 60%';
    });
  }

  // =====================================================================================================
  // P5 · « et le verdict. À éviter. » : la pile devient la carte verdict ; l'anneau revient s'y loger et se remplit
  //      jusqu'à 23 ; « À éviter » claque (tampon rouge, secousse)
  // =====================================================================================================
  const P5 = plan();
  const V208 = carteVerdict(P5, { cls: 'mauvais', note: 23, col: '#ff7a7a', titre: 'À éviter', texte: "Même bien négociée, elle ne laisse pas votre minimum de 750 € (il faudrait l'acheter 3 750 € au plus).", faire: "Passez à l'annonce suivante." });
  cue(tVer, 'pop', 0.7); cue(tEv, 'impact', 1.2); cue(tCl, 'whoosh', 1);
  win(tVer - 0.02, tVer + 0.3); win(tCl - 0.02, tCl + 0.4);
  function paintP5(t) {
    const on = t >= tVer - 0.02 && t < tCl + 0.5; if (!show(P5, on)) return;
    const a = SP(t, tVer, 'default'), hit = bump(t, tEv, 0.16), out = E(t, tCl, 0.4, eIn);
    const shake = hit * 10 * Math.sin((t - tEv) * 70);
    const fl = flot(t, 1);
    tf(V208.c, CX - 1300 * out + shake, 560 + 40 * (1 - a) + fl.y, { p: 2000, rx: 8 * (1 - a), ry: 20 * out, r: -1.5 * hit + fl.r, s: (0.9 + 0.1 * a) * (1 + 0.04 * hit), o: Math.min(1, a * 1.5) });
    V208.R.set(23, E(t, tVer + 0.1, 0.7, eOut3));
    [V208.K, V208.T, V208.X, V208.F].forEach((e, i) => { const p = E(t, tVer + 0.12 + i * 0.05, 0.4); e.style.opacity = p.toFixed(3); e.style.transform = `translateY(${(18 * (1 - p)).toFixed(1)}px)`; });
    V208.T.style.transform += ` scale(${(1 + 0.12 * hit).toFixed(3)})`; V208.T.style.transformOrigin = '0 60%';
    V208.c.style.boxShadow = t >= tEv ? `0 0 0 ${(3 + 9 * hit).toFixed(1)}px rgba(255,122,122,${(0.5 + 0.4 * hit).toFixed(2)}), 0 50px 100px -45px rgba(0,0,0,.9)` : '';
  }

  // =====================================================================================================
  // P6 · « Une bonne affaire ? » : balayage vers la gauche, le rapport de la Clio arrive de droite ; l'anneau monte à 97
  // P7 · « Ton prix d'offre… et le plafond à ne pas dépasser. » : le verdict monte et rapetisse ; les trois cartes de
  //      négociation de l'app arrivent ; « à ne pas dépasser » : la ligne PLAFOND claque au-dessus du prix maximum
  // =====================================================================================================
  const P6 = plan();
  const ENT = txt(P6, {}, '<span class="pillule" style="font-size:30px">Renault Clio IV 1.5 dCi 90 Business · 2016 · 112 000 km</span>');
  const VCL = carteVerdict(P6, { cls: 'bon', note: 97, col: '#3ecb7f', titre: 'Très bonne affaire', texte: 'Il vous resterait environ 1 450 €, au-dessus de votre minimum, sur un marché qui se vend bien.', faire: 'Écrivez au vendeur maintenant.' });
  const S6 = mk('div', 'lay', P6, { transformOrigin: '540px 965px' }), OH = 244;
  const OFF = [['Offre d\'ouverture', 6650, 'après la visite'], ['Objectif', 6900, 'prix à viser'], ['Prix à ne pas dépasser', 7100, 'pour garder 750 €']].map(([lab, v, sub], i) => {
    const c = mk('div', 'carte' + (i === 2 ? ' chaude' : ''), S6, { width: CW + 'px', height: OH + 'px' });
    txt(c, { left: '50px', top: '34px', font: '500 37px Satoshi', color: 'var(--ink2)' }, lab);
    const V = txt(c, { left: '48px', top: '86px', font: '600 100px Clash', letterSpacing: '-.03em' }, eur(v), 'a nw num');
    txt(c, { left: 'auto', right: '50px', top: '134px', font: '500 32px Satoshi', color: 'var(--ink3)' }, sub);
    return { c, V, v };
  });
  const OT = [tOff, tObj, tPla];
  const PLAF = mk('div', 'a', S6, { height: '8px', borderRadius: '4px', background: 'var(--bad)', width: '1080px', transformOrigin: '50% 50%', boxShadow: '0 0 24px rgba(255,122,122,.6)' });
  const PLAFL = txt(S6, { font: '700 28px Satoshi', letterSpacing: '.16em', color: '#2a0c0c', background: 'var(--bad)', borderRadius: '999px', padding: '8px 22px', boxShadow: '0 0 24px rgba(255,122,122,.5)' }, 'PLAFOND');
  cue(tCl + 0.36, 'ding', 0.8); OT.forEach((t0) => cue(t0, 'pop', 0.85)); cue(tLine, 'thud', 1); cue(tL0, 'whoosh', 0.8);
  OT.forEach((t0) => win(t0 - 0.02, t0 + 0.3)); win(tLine - 0.02, tLine + 0.2); win(tL0 - 0.02, tL0 + 0.4);
  function paintP6(t) {
    const on = t >= tCl - 0.02 && t < tL0 + 0.5; if (!show(P6, on)) return;
    const a = SP(t, tCl, 'default'), b = SP(t, tCl + 0.03, 'snappy'), up = E(t, tOff - 0.12, 0.45, doux), out = E(t, tL0, 0.4, eIn);
    // verdict de la Clio : arrive de droite, puis monte et rapetisse quand les prix arrivent
    const fl = flot(t, 2);
    tf(VCL.c, CX + 1300 * (1 - b), 640 - 1400 * up + fl.y, { p: 2000, ry: -24 * (1 - a), rx: 18 * up, r: fl.r, s: 1 - 0.2 * up, o: 1 - E(t, tOff + 0.1, 0.2) });
    VCL.R.set(97, E(t, tCl + 0.15, 0.8, eOut3));
    [VCL.K, VCL.T, VCL.X, VCL.F].forEach((e, i) => { const p = E(t, tCl + 0.2 + i * 0.05, 0.4); e.style.opacity = p.toFixed(3); e.style.transform = `translateY(${(18 * (1 - p)).toFixed(1)}px)`; });
    tf(ENT, CX + 1300 * (1 - b), 530 - 1400 * up, { o: E(t, tCl + 0.25, 0.3) * (1 - up) });
    // cartes de négociation (le chiffre compte jusqu'à sa valeur)
    const st = pile(t, OT, OH, 30, 965, 1.15); tf(S6, 0, 0, { s: st.z });
    OFF.forEach((O, i) => {
      const t0 = OT[i], k = st.ks[i], kk = SP(t, t0 + 0.03, 'snappy');
      show(O.c, t >= t0 - 0.01);
      const ox = E(t, tL0 - 0.12 + i * 0.04, 0.3, eIn), fl = flot(t, i + 3);
      tf(O.c, CX - 1300 * ox, st.y(i) + 160 * (1 - kk) + fl.y, { p: 2000, rx: -22 * (1 - k), ry: 18 * ox, r: fl.r, s: 0.9 + 0.1 * k, o: Math.min(1, k * 1.5) });
      O.V.textContent = eur(lerp(O.v - 1500, O.v, E(t, t0 + 0.05, 0.5, eOut3)));
    });
    const lp = E(t, tLine, 0.3, eOut4), lo = 1 - E(t, tL0 - 0.12, 0.15);
    show(PLAF, lp > 0 && lo > 0); show(PLAFL, lp > 0 && lo > 0);
    tf(PLAF, 0, st.y(2) - 24 + 8 * bump(t, tLine, 0.1), { sx: lp, sy: 1 + bump(t, tLine, 0.08), o: lo });
    const pl = SP(t, tLine + 0.06, 'snappy'); tf(PLAFL, 540, st.y(2) - 20, { c: 1, s: 0.6 + 0.4 * pl, o: lo * Math.min(1, pl * 1.5) });
    OFF[2].c.style.boxShadow = t >= tLine ? `0 0 0 ${(3 + 6 * bump(t, tLine, 0.12)).toFixed(1)}px rgba(255,122,122,.7), 0 50px 100px -45px rgba(0,0,0,.9)` : '';
  }

  // =====================================================================================================
  // P8 · « Et pour les trouver, arrête de scroller. » : la recherche de l'app ; la liste file de plus en plus vite
  //      (inclinée, flou de bougé), puis s'arrête net sur la meilleure affaire, qui s'allume en vert
  // =====================================================================================================
  const P8 = plan();
  const LSTH = mk('div', 'a', P8, { width: CW + 'px' });
  txt(LSTH, { left: '0px', top: '0px', font: '600 64px Clash', letterSpacing: '-.025em' }, '220 annonces · Clio 4');
  txt(LSTH, { left: '0px', top: '84px', font: '500 31px Satoshi', color: 'var(--ink3)' }, '22 à 5 % ou plus sous la cote · diesel');
  const LCLIP = mk('div', 'a', P8, { width: '1080px', height: '780px', overflow: 'hidden' });
  const LST = mk('div', 'a', LCLIP, { left: CX + 'px', width: CW + 'px' });
  const LH = 286, LG = 22;
  function carteListe(parent, it, css = {}) {
    const c = mk('div', 'carte', parent, { width: CW + 'px', height: LH + 'px', ...css });
    txt(c, { left: '44px', top: '34px', font: '700 36px Satoshi' }, it[0]);
    txt(c, { left: '44px', top: '84px', width: (CW - 88) + 'px', font: '500 27px Satoshi', color: 'var(--ink3)', overflow: 'hidden', textOverflow: 'ellipsis' }, it[1]);
    txt(c, { left: '44px', top: '124px', font: '500 27px Satoshi', color: 'var(--ink3)' }, it[2]);
    txt(c, { left: '44px', top: '174px', font: '600 64px Clash', letterSpacing: '-.02em' }, it[3], 'a nw num');
    txt(c, { left: '300px', top: '200px', font: '500 29px Satoshi', color: 'var(--ink3)' }, it[4]);
    const B = txt(c, { left: 'auto', right: '40px', top: '186px', font: '700 31px Satoshi', color: 'var(--ok)', background: 'rgba(62,203,127,.14)', border: '2.4px solid rgba(62,203,127,.4)', borderRadius: '999px', padding: '10px 24px' }, it[5]);
    return { c, B };
  }
  const ITEMS = LISTE.slice(0, 40).map((it, i) => carteListe(LST, it, { top: (i * (LH + LG)) + 'px', boxShadow: 'none' }));
  const LMAX = 34 * (LH + LG);
  cue(tScr, 'riser', 0.9); cue(tStop - 0.02, 'tapestop', 1); cue(tStop, 'thud', 1); cue(tStop + 0.1, 'pop', 0.8);
  win(tL0 - 0.02, tL0 + 0.4); win(tScr, tStop + 0.12);
  // défilement : la liste part du fond (34e annonce) et remonte de plus en plus vite, puis freine net sur la 1re
  function defile(t) {
    if (t < tScr) return LMAX - 140 * E(t, tL0, 1.0, eOut3);
    if (t < tStop) { const u = (t - tScr) / (tStop - tScr); return (LMAX - 140) * (1 - Math.pow(u, 1.6)); }
    const u = t - tStop; return -40 * Math.sin(Math.PI * clamp(u / 0.3, 0, 1)) * Math.exp(-u * 3);
  }
  function paintP8(t) {
    const on = t >= tL0 - 0.02 && t < tS0 + 0.5; if (!show(P8, on)) return;
    const a = SP(t, tL0, 'default'), sp = t > tScr && t < tStop ? Math.sin(Math.PI * (t - tScr) / (tStop - tScr)) : 0;
    const out = E(t, tS0, 0.4, eIn);
    tf(LSTH, CX, 556 + 600 * (1 - a) - 900 * out, { o: Math.min(1, a * 1.5) * (1 - out) });
    tf(LCLIP, 0, 700 + 900 * (1 - a), { p: 1800, rx: 16 * sp + 6 * (1 - a), s: 1 - 0.04 * sp, o: 1 - out });
    LCLIP.style.transformOrigin = '540px 300px';
    LST.style.transform = `translateY(${(-defile(t)).toFixed(1)}px)`;
    const best = E(t, tStop + 0.05, 0.3);
    ITEMS[0].c.style.borderColor = best > 0 ? `rgba(62,203,127,${(0.15 + 0.75 * best).toFixed(2)})` : '';
    ITEMS[0].c.style.background = best > 0 ? `linear-gradient(180deg,rgba(62,203,127,${(0.18 * best).toFixed(3)}),#140f0b 75%)` : '';
    ITEMS[0].c.style.transform = `scale(${(1 + 0.04 * bump(t, tStop + 0.05, 0.16)).toFixed(3)})`;
    ITEMS[0].B.style.transform = `scale(${(1 + 0.15 * bump(t, tStop + 0.1, 0.14)).toFixed(3)})`;
  }

  // =====================================================================================================
  // P9 · « Ta recherche tourne toute seule. » : la recherche enregistrée de l'app (Active, 220 annonces…) ; gros plan
  //      sur l'interrupteur « Alerte e-mail » qui s'allume ; une lumière fait le tour de la carte (elle tourne seule)
  // =====================================================================================================
  const P9 = plan();
  const RS = mk('div', 'carte', P9, { width: CW + 'px', height: '560px' });
  txt(RS, { left: '50px', top: '44px', font: '600 72px Clash', letterSpacing: '-.025em' }, 'Renault Clio 4');
  const ACT = txt(RS, { left: '50px', top: '146px', font: '700 30px Satoshi', color: 'var(--ok)', background: 'rgba(62,203,127,.14)', border: '2.4px solid rgba(62,203,127,.4)', borderRadius: '999px', padding: '8px 22px 8px 50px' }, 'Active');
  const ACTd = mk('div', 'a', ACT, { left: '22px', top: '20px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--ok)' });
  const ACTp = mk('div', 'a', ACT, { left: '22px', top: '20px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--ok)' });
  txt(RS, { left: '230px', top: '156px', font: '500 30px Satoshi', color: 'var(--ink3)' }, 'il y a 1 min · diesel');
  txt(RS, { left: '50px', top: '226px', width: (CW - 100) + 'px', font: '500 33px/1.4 Satoshi', color: 'var(--ink2)', whiteSpace: 'normal' }, '220 annonces · 22 sous la cote · meilleure : 7 650 € (23 % sous la cote)', 'a');
  const RSb = mk('div', 'btno', RS, { width: '190px', height: '84px', fontSize: '31px', left: '50px', top: '390px' }, 'Ouvrir'); 
  const SWW = mk('div', 'a', RS, { left: '0px', top: '0px', width: '400px', height: '84px', border: '2.4px solid var(--line2)', background: 'var(--glass)', borderRadius: '999px' });
  const SWR = mk('div', 'a', SWW, { left: '22px', top: '20px', width: '76px', height: '42px', borderRadius: '999px', background: 'rgba(244,241,236,.18)' });
  const SWK = mk('div', 'a', SWR, { left: '4px', top: '4px', width: '34px', height: '34px', borderRadius: '50%', background: '#f4f1ec', boxShadow: '0 2px 6px rgba(0,0,0,.4)' });
  txt(SWW, { left: '116px', top: '19px', font: '600 32px Clash' }, 'Alerte e-mail');
  tf(SWW, 270, 390);
  const RING = mk('div', 'a', P9, { width: (CW + 16) + 'px', height: '576px', borderRadius: '70px', padding: '5px', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 250deg, rgba(255,138,76,.95) 330deg, transparent 360deg)', WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' });
  cue(tS0, 'whoosh', 0.7); cue(tSw, 'click', 1); cue(tSw + 0.06, 'ding', 0.5);
  win(tS0 - 0.02, tS0 + 0.35);
  function paintP9(t) {
    const on = t >= tS0 - 0.02 && t < tN + 0.7; if (!show(P9, on)) return;
    const a = SP(t, tS0, 'default'), b = SP(t, tS0 + 0.04, 'snappy');
    // gros plan sur l'interrupteur pendant « tourne », puis recul ; la nuit tombe : la carte s'éteint et descend
    const z = E(t, tSw - 0.3, 0.3, doux) * (1 - E(t, tSw + 0.32, 0.4, doux)), night = E(t, tN, 0.5, doux);
    const fx = CX + 270 + 200, fy = 760 + 390 + 42;                     // centre de l'interrupteur dans le film
    const sc = 1 + 0.12 * z, ox = 0, oy = 0;
    P9.style.transformOrigin = `540px ${fy}px`;
    tf(P9, ox, oy + 500 * night, { s: sc * (1 - 0.15 * night), o: 1 - 0.75 * night });
    const fl = flot(t, 4);
    tf(RS, CX + 300 * (1 - b), 760 + 80 * (1 - a) + fl.y, { p: 2000, ry: -20 * (1 - a), r: fl.r, s: 0.94 + 0.06 * a, o: Math.min(1, a * 1.5) });
    const k = E(t, tSw, 0.3, eOut4);                                   // interrupteur : pastille en 0,3 s (easeOutQuart)
    SWK.style.transform = `translateX(${(34 * k).toFixed(1)}px)`;
    SWR.style.background = k > 0 ? `rgba(255,90,31,${(0.18 + 0.82 * E(t, tSw + 0.1, 0.2)).toFixed(3)})` : 'rgba(244,241,236,.18)';
    const pg = ((t - tS0) % 1.2) / 1.2;                                // « ping » de l'app sur le point Actif
    tf(ACTp, 0, 0, { s: 1 + 1.2 * pg, o: (1 - pg) * 0.8 });
    show(RING, t >= tSw);
    tf(RING, CX - 8 + 300 * (1 - b), 752 + 80 * (1 - a), { o: E(t, tSw + 0.05, 0.3) * (1 - night) });
    RING.style.background = `conic-gradient(from ${(((t - tSw) * 300) % 360).toFixed(1)}deg, transparent 0deg, transparent 250deg, rgba(255,138,76,.95) 330deg, transparent 360deg)`;
  }

  // =====================================================================================================
  // P10 · « Toi, tu dors. » : la nuit tombe ; une horloge géante défile (01:14 → 02:41)
  // P11 · « Lui, il bosse. » : l'horloge monte ; les messages de la nuit partent un par un, chacun à son heure
  //       (les vraies lignes « Détail des 9 annonces » de l'app), « Envoyé » s'allume ; option Messages (Benef Pro)
  // =====================================================================================================
  const P10 = plan();
  const S10 = mk('div', 'lay', P10, { transformOrigin: '540px 1028px' });
  const CLK = txt(P10, { width: '1080px', textAlign: 'center', font: '600 250px Clash', letterSpacing: '-.04em', color: '#dfe5ff' }, '<span>01</span><span>:</span><span>14</span>', 'a nw num');
  const [CLh, CLc, CLm] = CLK.querySelectorAll('span');
  const ENV = [['Renault Clio IV 1.5 dCi 90 Trend', '4 750 €', '01:14'], ['Renault Clio IV 1.5 dCi 75 Intens', '5 750 €', '01:16'], ['Renault Clio IV 1.5 dCi 75 Business', '6 000 €', '02:41'],
    ['Renault Clio IV 1.5 dCi 90 Limited', '6 350 €', '02:43'], ['Renault Clio IV 1.5 dCi 75 Business', '6 450 €', '03:12'], ['Renault Clio IV 1.5 dCi 90 Business', '6 600 €', '03:14'], ['Renault Clio IV 1.5 dCi 90 Zen', '6 650 €', '04:37']];
  const ROWS = ENV.map(([m, p, h]) => {
    const c = mk('div', 'carte', S10, { width: CW + 'px', height: '104px', borderRadius: '38px', background: 'linear-gradient(180deg,#141a2e,#0f1322)', borderColor: 'rgba(169,184,255,.16)' });
    txt(c, { left: '36px', top: '14px', font: '700 30px Satoshi' }, m);
    txt(c, { left: '36px', top: '56px', font: '500 26px Satoshi', color: 'rgba(223,229,255,.6)' }, `${p} · 14 oct., ${h}`);
    const S = txt(c, { left: 'auto', right: '30px', top: '28px', font: '700 27px Satoshi', color: 'var(--ok)', background: 'rgba(62,203,127,.14)', borderRadius: '999px', padding: '8px 18px' }, 'Envoyé');
    return { c, S, h };
  });
  const PRO = txt(P10, { padding: '14px 30px', borderRadius: '999px', font: '700 30px Satoshi', color: '#f4f1ec', background: 'rgba(11,10,9,.8)', border: '2.4px solid rgba(255,90,31,.85)' }, 'Benef Pro · option Messages');
  const mins = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const tRow = (i) => tLui + 0.3 + i * 0.1;
  cue(tN, 'nuit', 0.8); ROWS.forEach((r, i) => cue(tRow(i), 'sent', 0.55)); cue(tAube, 'whoosh', 0.6);
  win(tLui - 0.02, tLui + 0.4);
  function paintP10(t) {
    const on = t >= tN - 0.02 && t < tAube + 0.5; if (!show(P10, on)) return;
    // horloge : 01:14 pendant « Toi, tu dors », puis le temps file jusqu'à 04:37 pendant que les messages partent
    const m0 = mins('01:14'), m1 = mins('04:37');
    const m = t < tRow(0) ? m0 : t < tRow(ROWS.length - 1) ? lerp(m0, m1, (t - tRow(0)) / (tRow(ROWS.length - 1) - tRow(0))) : m1;
    const hh = Math.floor(m / 60), mm = Math.floor(m % 60);
    CLh.textContent = String(hh).padStart(2, '0'); CLm.textContent = String(mm).padStart(2, '0');
    CLc.style.opacity = t < tRow(0) && Math.floor((t - tN) / 0.5) % 2 === 1 ? '0.15' : '1';
    const a = SP(t, tN + 0.1, 'heavy'), up = E(t, tLui, 0.45, doux), out = E(t, tAube, 0.45, eIn);
    tf(CLK, 0, lerp(860, 330, up) + 40 * (1 - a), { s: lerp(1, 0.5, up) * (0.9 + 0.1 * a) * (1 - 0.2 * out) * (1 + 0.012 * Math.sin(t * 2.2)), o: Math.min(1, a * 1.4) * (1 - out), b: 8 * (1 - a) + 10 * out });
    CLK.style.transformOrigin = '540px 125px';
    const st = pile(t, ROWS.map((R, i) => tRow(i)), 104, 14, 1028, 1.15); tf(S10, 0, 0, { s: st.z });
    ROWS.forEach((R, i) => {
      const t0 = tRow(i), k = st.ks[i]; show(R.c, t >= t0 - 0.01);
      tf(R.c, CX - 1250 * E(t, tAube + i * 0.025, 0.35, eIn), st.y(i) + 60 * (1 - k), { p: 2000, rx: -20 * (1 - k), s: 0.94 + 0.06 * k, o: Math.min(1, k * 1.5) });
      R.S.style.transform = `scale(${(1 + 0.18 * bump(t, t0 + 0.15, 0.1)).toFixed(3)})`;
    });
    show(PRO, t >= tLui + 0.1 && t < tAube + 0.3);
    tf(PRO, 540, 566 - 30 * (1 - SP(t, tLui + 0.1, 'snappy')), { c: 1, o: E(t, tLui + 0.1, 0.25) * (1 - out), b: 8 * out });
  }

  // =====================================================================================================
  // P12 · « Une annonce passe sous la cote ? Tu reçois un mail. » : le jour se lève ; la notification d'utopicar
  //       descend sur « sous la cote » ; sur « tu reçois », elle s'ouvre en e-mail (le vrai gabarit de l'alerte)
  // =====================================================================================================
  const P12 = plan();
  const ANL = carteListe(P12, LISTE[0]);
  const NOTIF = mk('div', 'a', P12, { width: '860px', height: '176px', borderRadius: '50px', background: 'rgba(40,33,29,.97)', boxShadow: '0 30px 70px -20px rgba(0,0,0,.7), 0 0 0 1.5px rgba(244,241,236,.08)', overflow: 'hidden' });
  const ico = mk('div', 'a', NOTIF, { left: '34px', top: '36px', width: '104px', height: '104px', borderRadius: '26px', overflow: 'hidden', background: '#1a1411' });
  ico.innerHTML = LOGO; { const s = ico.querySelector('svg'); s.style.height = '104px'; s.style.width = 'auto'; s.style.position = 'absolute'; s.style.left = '0'; s.style.top = '0'; }
  txt(NOTIF, { left: '166px', top: '34px', font: '700 32px Satoshi' }, 'utopicar <span style="font-weight:500;color:rgba(244,241,236,.6);font-size:26px">· maintenant</span>');
  txt(NOTIF, { left: '166px', top: '86px', font: '500 29px Satoshi', color: 'rgba(244,241,236,.88)' }, 'Clio IV 1.5 dCi · 7 650 € · <b style="color:var(--ok)">2 300 € sous la cote</b>');
  const MAIL = mk('div', 'a', P12, { width: '860px', background: '#fff', borderRadius: '36px', overflow: 'hidden', boxShadow: '0 60px 100px -35px rgba(0,0,0,.75)', color: '#1d1d1f' });
  MAIL.innerHTML = `<div style="padding:46px 46px 30px;font:30px Arial,sans-serif">
    <div style="font-size:40px;font-weight:bold;margin-bottom:6px">1 nouvelle annonce</div><div style="color:#555;margin-bottom:28px">Recherche « Renault Clio 4 »</div>
    <div style="display:flex;gap:26px;border-bottom:2px solid #e5e5e5;padding-bottom:28px">
      <img src="../assets/presente-v/clio4-mail.jpg" style="width:250px;height:188px;object-fit:cover;border-radius:14px;flex:none">
      <div style="font:30px/1.45 Arial,sans-serif"><div style="color:#15307f;font-weight:bold">Renault Clio IV 1.5 dCi 75 Zen</div><div style="font-size:36px;font-weight:bold">7 650 €</div>
      <div style="color:#555">2018 · 88 500 km · Diesel</div><div style="color:#0a7a43;font-weight:bold">2 300 € sous la cote</div><div style="color:#777;font-size:26px">cote 9 950 € sur 220 annonces</div></div></div>
    <div style="margin-top:30px"><span style="display:inline-block;background:#ff5a1f;color:#fff;padding:20px 32px;border-radius:14px;font-weight:bold">Voir mes alertes sur utopicar</span></div></div>`;
  await new Promise((r) => { const im = MAIL.querySelector('img'); if (im.complete) r(); else { im.onload = r; im.onerror = r; } });
  const MH = MAIL.offsetHeight;
  cue(tAnn, 'whoosh', 0.5); cue(tSous, 'pop', 0.8); cue(tNotif, 'notif', 1); cue(tMail, 'whoosh', 0.7); cue(tParc, 'whoosh', 0.7);
  win(tNotif - 0.02, tNotif + 0.3); win(tMail - 0.02, tMail + 0.35); win(tParc - 0.02, tParc + 0.4);
  function paintP12(t) {
    const on = t >= tAnn - 0.02 && t < tParc + 0.5; if (!show(P12, on)) return;
    const k = SP(t, tNotif, 'default'), op = SP(t, tMail, 'default'), out = E(t, tParc, 0.38, eIn);
    // l'annonce monte du bas, son écart à la cote s'allume sur « sous », elle recule quand la notification arrive
    const ka = SP(t, tAnn, 'default'), hs = E(t, tSous, 0.25), rec = E(t, tNotif, 0.4, doux);
    show(ANL.c, t < tMail + 0.4);
    tf(ANL.c, CX, 900 + 500 * (1 - ka) + 120 * rec, { p: 2000, rx: -18 * (1 - ka), s: (0.92 + 0.08 * ka) * (1 + 0.14 * (1 - rec) * ka) * (1 - 0.1 * rec), o: Math.min(1, ka * 1.5) * (1 - E(t, tMail + 0.1, 0.25)) });
    ANL.c.style.borderColor = hs > 0 ? `rgba(62,203,127,${(0.15 + 0.7 * hs).toFixed(2)})` : '';
    ANL.B.style.transform = `scale(${(1 + 0.2 * bump(t, tSous, 0.14)).toFixed(3)})`;
    ANL.B.style.boxShadow = hs > 0 ? `0 0 0 ${(6 * hs).toFixed(1)}px rgba(62,203,127,.25)` : '';
    show(NOTIF, t < tMail + 0.25);
    tf(NOTIF, 110, lerp(-200, 560, clamp(k, 0, 1.05)) + 60 * clamp(op, 0, 1), { o: 1 - E(t, tMail + 0.05, 0.15), s: 1 + 0.03 * bump(t, tNotif + 0.3, 0.1) });
    // l'e-mail s'ouvre depuis la bannière : même largeur, tiroir qui descend
    show(MAIL, t >= tMail - 0.01);
    const h0 = 176 / MH, r = clamp(op, 0, 1.02);
    MAIL.style.clipPath = `inset(0 0 ${((1 - clamp(lerp(h0, 1, r), 0, 1)) * 100).toFixed(2)}% 0 round 36px)`;
    tf(MAIL, 110 - 1300 * out, 560 + 8 * Math.sin((t - tMail) * 1.5), { p: 1800, rx: 6 * (1 - r), ry: 14 * out + 2 * Math.sin(t * 0.9), r: -4 * out + 0.4 * Math.sin(t * 0.8), o: E(t, tMail, 0.08) });
  }

  // =====================================================================================================
  // P13 · « Et chaque voiture, de l'achat à la vente : » : les cinq étapes du parc de l'app en colonne, reliées ;
  //       un repère descend la ligne, « achat » puis « vente » s'allument
  // P14 · « ta vraie marge. » : « Vendues » s'ouvre en « Marge réalisée ce mois », qui compte jusqu'à 1 550 € ;
  //       la marge par voiture se remplit (Polo 880 €, Clio 670 €, seuil 750 €)
  // =====================================================================================================
  const P13 = plan();
  const ETP = [['Repérées', 1, '#9e968c'], ['Achetées', 1, '#ff8a4c'], ['En préparation', 1, '#ffc53d'], ['En vente', 1, '#ff5a1f'], ['Vendues', 2, '#3ecb7f']];
  const EH = 150, EG = 26, EY0 = 560;
  const LIGNE = mk('div', 'a', P13, { left: (CX + 62) + 'px', top: (EY0 + EH / 2) + 'px', width: '6px', height: (4 * (EH + EG)) + 'px', borderRadius: '3px', background: 'rgba(244,241,236,.12)', transformOrigin: '50% 0' });
  const LIGNEo = mk('div', 'a', P13, { left: (CX + 62) + 'px', top: (EY0 + EH / 2) + 'px', width: '6px', height: (4 * (EH + EG)) + 'px', borderRadius: '3px', background: 'linear-gradient(180deg,#ff8a4c,#3ecb7f)', transformOrigin: '50% 0' });
  const ETAPES = ETP.map(([lab, n, col], i) => {
    const c = mk('div', 'carte', P13, { width: CW + 'px', height: EH + 'px', borderRadius: '44px' });
    const D = mk('div', 'a', c, { left: '46px', top: (EH / 2 - 15) + 'px', width: '30px', height: '30px', borderRadius: '50%', background: col });
    txt(c, { left: '110px', top: (EH / 2 - 26) + 'px', font: '600 46px Clash', letterSpacing: '-.02em' }, lab);
    const N = txt(c, { left: 'auto', right: '50px', top: (EH / 2 - 44) + 'px', font: '600 76px Clash' }, String(n), 'a nw num');
    txt(c, { left: 'auto', right: '110px', top: (EH / 2 - 12) + 'px', font: '500 28px Satoshi', color: 'var(--ink3)' }, n > 1 ? 'voitures' : 'voiture');
    return { c, D, col };
  });
  const TOK = mk('div', 'a', P13, { width: '44px', height: '44px', borderRadius: '50%', background: '#f4f1ec', boxShadow: '0 0 0 8px rgba(255,90,31,.35), 0 0 30px rgba(255,138,76,.8)' });
  const tE = (i) => [tParc + 0.25, tAch, (tAch + tVen) / 2 - 0.05, tVen - 0.12, tVen][i];
  const KPI = mk('div', 'carte chaude', P13, { width: CW + 'px', height: '440px' });
  const KPIi = mk('div', 'a', KPI, { left: '50px', top: '50px', width: '88px', height: '88px', borderRadius: '24px', background: 'var(--o)' });
  KPIi.innerHTML = '<svg viewBox="0 0 24 24" width="88" height="88"><path d="M5 16l5-5 3 3 6-6" fill="none" stroke="#160904" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 8h4v4" fill="none" stroke="#160904" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  txt(KPI, { left: '166px', top: '60px', font: '500 36px/1.2 Satoshi', color: 'var(--ink2)' }, 'Marge réalisée ce mois');
  const KPIv = txt(KPI, { left: '50px', top: '168px', font: '600 168px Clash', letterSpacing: '-.04em' }, '0 €', 'a nw num');
  const KPIb = txt(KPI, { left: '50px', top: '346px', font: '700 30px Satoshi', color: 'var(--ok)', background: 'rgba(62,203,127,.14)', borderRadius: '999px', padding: '12px 24px' }, '▲ +1 550 € par rapport à septembre');
  const MPV = mk('div', 'carte', P13, { width: CW + 'px', height: '300px' });
  txt(MPV, { left: '50px', top: '38px', font: '600 46px Clash', letterSpacing: '-.02em' }, 'Marge par voiture');
  const BARS = [['Polo V 1.2 TSI 90', 880, 92.59, 'var(--ok)'], ['Clio IV 1.5 dCi 90', 670, 70.5, 'var(--warn)']].map(([lab, v, pc, col], i) => {
    const y = 116 + i * 70;
    txt(MPV, { left: '50px', top: y + 'px', font: '500 30px Satoshi', color: 'var(--ink2)' }, lab);
    const P = mk('div', 'a piste', MPV, { left: '330px', top: (y + 10) + 'px', width: '280px', height: '24px' }); const F = mk('i', '', P, { width: '0%', background: col });
    mk('div', 'a', P, { left: '78.9%', top: '0px', width: '5px', height: '24px', background: 'var(--o)' });
    const N = txt(MPV, { left: 'auto', right: '50px', top: (y - 4) + 'px', font: '600 40px Clash' }, '0 €', 'a nw num');
    return { F, N, v, pc };
  });
  txt(MPV, { left: '50px', top: '250px', font: '500 26px Satoshi', color: 'var(--ink3)' }, '<span style="display:inline-block;width:5px;height:24px;background:var(--o);vertical-align:-4px;margin-right:10px"></span>seuil de marge 750 €');
  ETAPES.forEach((e, i) => cue(tE(i), i === 4 ? 'ding' : 'tick', i === 4 ? 0.7 : 0.55)); cue(tKpi, 'pop', 0.9); cue(tKpi + 0.05, 'roll', 0.9); cue(tKpi + 0.62, 'ding', 0.8); cue(tLogo - 0.1, 'whoosh', 0.8);
  win(tKpi - 0.05, tKpi + 0.35); win(tLogo - 0.12, tLogo + 0.3);
  function paintP13(t) {
    const on = t >= tParc - 0.02 && t < tLogo + 0.4; if (!show(P13, on)) return;
    const gone = E(t, tLogo - 0.12, 0.3, eIn), kUp = E(t, tKpi - 0.08, 0.4, doux);
    const pp = E(t, tParc + 0.2, tKpi - tParc - 0.2, (p) => p * p * (3 - 2 * p)) * (1 - kUp);
    P13.style.transformOrigin = '540px 900px'; tf(P13, 0, -24 * pp, { s: 1 + 0.035 * pp });
    // étapes : arrivent en cascade (33 ms), puis s'effacent quand la marge arrive (sauf « Vendues » qui devient la marge)
    ETAPES.forEach((E_, i) => {
      const k = SP(t, tParc + 0.05 + i * 0.05, 'default'); const lit = t >= tE(i) ? 1 : 0;
      const hl = bump(t, tE(i), 0.22) + (i === 4 ? 0.6 * E(t, tVen + 0.2, 0.3) : 0) + (i === 1 ? 0.4 * E(t, tAch + 0.25, 0.3) * (1 - E(t, tVen, 0.3)) : 0);
      const y = EY0 + i * (EH + EG);
      const fade = i === 4 ? 0 : kUp;
      tf(E_.c, CX + 260 * (1 - k), y + 20 * (1 - k) - 220 * kUp * (i < 4 ? 1 : 0), { p: 2000, ry: -18 * (1 - k), s: (0.94 + 0.06 * k) * (1 + 0.02 * bump(t, tE(i), 0.12)), o: Math.min(1, k * 1.5) * (1 - fade) * (1 - gone) });
      E_.c.style.borderColor = hl > 0.01 ? `${E_.col}` : '';
      E_.c.style.background = hl > 0.01 ? `linear-gradient(90deg, ${E_.col}${Math.round(40 * clamp(hl, 0, 1)).toString(16).padStart(2, '0')}, #140f0b 70%)` : '';
      E_.D.style.boxShadow = lit ? `0 0 0 ${(10 * bump(t, tE(i), 0.15)).toFixed(1)}px ${E_.col}55` : '';
      if (i === 4) show(E_.c, t < tKpi + 0.05);
    });
    const lineK = E(t, tE(0), tE(4) - tE(0), (p) => p);
    tf(LIGNE, 0, 0, { o: E(t, tParc + 0.1, 0.3) * (1 - kUp) }); tf(LIGNEo, 0, 0, { sy: Math.max(0.001, lineK), o: (1 - kUp) });
    // le repère descend la ligne d'étape en étape
    let ty = EY0 + EH / 2; for (let i = 1; i < 5; i++) ty += (EH + EG) * E(t, tE(i) - 0.12, 0.16, eIO);
    show(TOK, t >= tE(0) - 0.05 && t < tKpi); tf(TOK, CX + 65 - 19, ty - 22, { s: SP(t, tE(0) - 0.05, 'snappy') });
    // « Vendues » (dernière étape) s'ouvre en carte « Marge réalisée ce mois »
    show(KPI, t >= tKpi - 0.02);
    const yV = EY0 + 4 * (EH + EG), kk = SP(t, tKpi, 'default');
    const fl = flot(t, 5);
    tf(KPI, CX, lerp(yV, 650, kk) + 900 * gone + fl.y, { p: 2000, rx: -8 * (1 - kk), r: fl.r, s: lerp(0.9, 1, kk) * (1 - 0.2 * gone), o: Math.min(1, kk * 2) * (1 - gone) });
    KPIv.textContent = eur(1550 * E(t, tKpi + 0.05, 0.55, eOut3));
    KPIb.style.opacity = E(t, tKpi + 0.5, 0.3).toFixed(3);
    show(MPV, t >= tKpi + 0.12);
    const km = SP(t, tKpi + 0.14, 'default');
    tf(MPV, CX, 1118 + 120 * (1 - km) + 900 * gone, { p: 2000, rx: -16 * (1 - km), o: Math.min(1, km * 1.5) * (1 - gone) });
    BARS.forEach((B, i) => { const g = E(t, tKpi + 0.3 + i * 0.08, 0.5, eOut3); B.F.style.width = (B.pc * g).toFixed(2) + '%'; B.N.textContent = eur(B.v * g); });
  }

  // =====================================================================================================
  // P15 · fin : « utopicar » se tape dans une pastille (lettres du vrai logo), « Achète juste. Revends mieux. »,
  //       « lien en bio » ; la boucle repart sur l'annonce
  // =====================================================================================================
  const NS = 'http://www.w3.org/2000/svg';
  const GL = mk('div', 'lay', ST);
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
  const CARET = mk('div', 'a', GL, { width: '9px', height: '110px', borderRadius: '5px', background: '#ff5a1f' });
  const SIG1 = txt(GL, { width: '1080px', textAlign: 'center', top: '1010px', font: '600 112px/1 Clash', letterSpacing: '-.03em', color: '#f4f1ec' }, 'Achète juste.', 'a');
  const SIG2 = txt(GL, { width: '1080px', textAlign: 'center', top: '1140px', font: 'italic 400 128px/1 Instrument', color: '#ff8a4c' }, 'Revends mieux.', 'a');
  const BIO = mk('div', 'a', GL, { height: '96px', borderRadius: '48px', background: '#f4f1ec', color: '#1c1612', font: '700 40px/96px Satoshi', padding: '0 0 0 46px', whiteSpace: 'nowrap', overflow: 'hidden' });
  const BIOT = mk('span', '', BIO, null, ''); const BIOC = mk('span', '', BIO, { display: 'inline-block', width: '4px', height: '44px', background: '#ff5a1f', marginLeft: '4px', verticalAlign: '-8px' });
  const tTy = tLogo + 0.28, tBio = w(92) + 0.35, HX = 30;
  cue(tLogo, 'impact', 1.1); letters.forEach((L, i) => cue(tTy + i * 0.07, 'key', 0.45)); cue(w(89), 'pop', 0.6); cue(w(91), 'pop', 0.7); [...'lien en bio'].forEach((c, i) => { if (c !== ' ') cue(tBio + i * 0.055, 'key', 0.35); }); cue(TLOOP, 'whoosh', 0.9);
  win(TLOOP - 0.05, DUR);
  function paintFin(t) {
    const on = t >= tLogo - 0.05 && t < DUR; show(GL, on); if (!on) return;
    const out = E(t, TLOOP, 0.42, eIn);
    const a = SP(t, tLogo, 'snappy'), nL = letters.filter((L, i) => t >= tTy + i * 0.07).length;
    const drift = 26 * E(t, w(91), TLOOP - w(91), (p) => p * (2 - p)), cy = 700 - 30 * E(t, w(89) - 0.2, 0.6) - drift;
    const lastX = nL ? letters[nL - 1].px1 : letters[0].px0 - 30;
    const wNow = Math.max(200, (lastX + HX + 60) * a), x0 = 540 - wNow / 2;
    PILL.style.width = wNow.toFixed(1) + 'px';
    tf(PILL, x0, cy - 100, { o: a * (1 - out), s: 1 - 0.9 * out });
    tf(holder, x0 + HX, cy - LHh / 2, { o: 1 - out, s: 1 - 0.9 * out });
    iconG.style.transformBox = 'fill-box'; iconG.style.transformOrigin = 'center'; iconG.style.transform = `rotate(${(-90 * (1 - SP(t, tLogo + 0.05, 'default'))).toFixed(2)}deg) scale(${SP(t, tLogo + 0.05, 'snappy').toFixed(3)})`;
    letters.forEach((L, i) => { const p = E(t, tTy + i * 0.07, 0.16); L.g.style.opacity = p.toFixed(3); L.g.style.transform = `translateY(${(20 * (1 - p)).toFixed(1)}px) scale(${(0.7 + 0.3 * p).toFixed(3)})`; });
    const typing = t < tTy + letters.length * 0.07 + 0.2;
    show(CARET, (typing || Math.floor((t - tTy) / 0.4) % 2 === 0) && t < w(89));
    tf(CARET, x0 + HX + lastX + 14, cy - 55, { o: 1 - out });
    const s1 = E(t, w(89) - 0.06, 0.35), s2 = E(t, w(91) - 0.06, 0.35);
    tf(SIG1, 0, 30 * (1 - s1) - drift, { o: s1 * (1 - out), b: 8 * (1 - s1) }); tf(SIG2, 0, 30 * (1 - s2) - drift, { o: s2 * (1 - out), b: 8 * (1 - s2) });
    tf(REFLET, lerp(-260, wNow + 80, E(t, w(92) + 1.0, 0.7, eIO)), 0, { r: 18 });
    const n = clamp(Math.floor((t - tBio) / 0.055) + 1, 0, 11); BIOT.textContent = 'lien en bio'.slice(0, n);
    const bw = 100 + n * 21; show(BIO, t >= tBio - 0.15);
    BIO.style.width = bw + 'px'; tf(BIO, 540 - bw / 2, 1330 - drift, { s: SP(t, tBio - 0.15, 'snappy') * (1 - out), o: 1 - out });
    BIOC.style.opacity = n < 11 || Math.floor((t - tBio) / 0.4) % 2 === 0 ? '1' : '0';
  }

  // ---------- caméra, seek ----------
  window.seek = (t) => {
    const tt = t < TLOOP ? t : 0;          // la boucle : l'annonce revient sous le rideau de fin
    fond(t);
    CAM.style.transform = `perspective(2400px) rotateY(${(1.2 * Math.sin(t * 0.37)).toFixed(3)}deg) rotateX(${(0.8 * Math.sin(t * 0.29 + 1)).toFixed(3)}deg) scale(${(1.0 + 0.012 * Math.sin(t * 0.5)).toFixed(4)})`;
    paintP2(t); paintP1(tt); paintP3(t); paintP4(t); paintP5(t); paintP6(t); paintP8(t); paintP9(t); paintP10(t); paintP12(t); paintP13(t); paintFin(t);
    paroles(tt);
    P1.style.clipPath = t >= TLOOP ? `circle(${(2300 * E(t, TLOOP + 0.12, DUR - TLOOP - 0.14, eIO)).toFixed(0)}px at 540px 950px)` : '';
    DEMO.style.opacity = (0.5 * (1 - E(t, tLogo, 0.3)) + 0.5 * E(t, TLOOP + 0.2, 0.3)).toFixed(3);
  };
  const inWin = (t) => FAST.some(([a, b]) => t >= a && t <= b);
  window.shutter = (t) => (inWin(t) ? 1 : 0.5);
  window.samples = (t) => (inWin(t) ? 8 : 4);
  window.filmDur = DUR;
  window.cues = CUES.sort((x, y) => x.t - y.t);
  window.seek(0);
  window.filmReady = true;
})().catch((e) => { console.error('FILM', e.message, e.stack); document.title = 'ERREUR ' + e.message; });
