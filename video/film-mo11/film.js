// MO11 « La préparation » (≈ 30,1 s). Contrat : window.seek(t) peint la frame t, sans état entre les frames.
// window.shutter(t) / window.samples(t) : flou de bougé au rendu (MB=4).
// Minutage lu dans la voix (audio/vo-mo11/vo-timing.json, scripts/vo-mo11.py ; provisoire tant que la prise de Simon
// n'existe pas) : chaque geste suit son mot, rien n'est recopié en dur. Construit sur lib/kit47.js (modules de MO5) et
// lib/kit47-etats.js (états de la voiture : ligne de partage avant / après, lumière de 16 h 30).
// Variable de l'épisode : chaque coup est un avant / après sur la voiture, son débit tombe en notification et pousse le
// compteur « PRIX AFFICHÉ » vers le haut, sans qu'il se pose entre 2 900 et 3 330 €.
(async function () {
  const { spring, track, clamp, lerp, noise } = Motion;
  const { f3, S, sm, P, el, sv, set, defs, word, fullWord, notif, load, loadSeqs, drawSeq, flaps, paintFlaps, counter, paintCounter } = Kit47;
  const E = KitEtats;
  const stage = document.getElementById('stage');
  const eo = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return 1 - (1 - u) * (1 - u) * (1 - u); };

  // ---------- minutage ----------
  const VT = await (await fetch('../audio/vo-mo11/vo-timing.json')).json();
  const DUR = VT.dur, LOOP = VT.loop;
  const M = (k) => VT.marks[k].t, ME = (k) => VT.marks[k].end;
  const LT = (k) => VT.lines.find((l) => l.key === k);
  const T = {
    sh1: M('achete') - 0.12, arr: M('revends') - 0.04, sh2: M('b2900') - 0.06, q: ME('b2900') + 0.04,
    dive: M('ton') - 0.13, vac0: M('aspi') - 0.03, vac1: ME('aspi') + 0.02,   // l'embout aspire la bande du flanc
    donne: M('donne') - 0.05, rw: M('trouve') - 0.05,                          // « 2 ?00 » ; la fente réécrit « C'est donné. »
    fold: M('samedi') + 0.13, sam: M('samedi') + 0.17,                         // le calcul devient le compteur, palettes
    lav: ME('heures') - 0.05,                                                  // le lavage part quand « treize heures » finit
    si: M('sieges') - 0.33, od: M('odeur') - 0.2, en: LT('enjo').t - 0.2,      // l'arrêt de la ligne tombe sur le mot
    sun0: M('etla') - 0.3, sun1: ME('soleil') + 0.02, sbas: M('etla') + 0.4, heure: M('soleil') - 0.35,
    vf: ME('soleil') - 0.04, lab1: M('photo') - 0.06, click: M('un') - 0.1,
    ann: M('un') + 0.16, j4: M('un') + 0.3, msg1: ME('un') + 0.5, msg2: M('quatre') - 0.3,
    bubble: M('quatre') - 0.05, credit: M('n400') - 0.12, big: M('plus') - 0.12, prepa: M('plus') + 0.25,
    pay1: M('ton2') - 0.03, pay2: M('mieux') - 0.2,
    ceux: M('ceux') - 0.04, pas: M('pas') - 0.04,
    nail: M('glisse') + 0.04, verd: ME('rayure') + 0.06, pol: M('quinze') + 0.04, carr: M('polish') - 0.03,
  };
  T.ph = (T.lav + T.si) / 2; T.ra = (T.od + T.en) / 2;
  T.gag = (T.si + 0.7 + T.od) / 2 + 0.05;
  T.l = [ME('tout') + 0.02, ME('tout') + 0.52, ME('tout') + 1.02]; T.x = T.l[2] + 0.42;
  T.dive2 = M('ongle') - 0.3; T.cw = LOOP + 0.42;                     // le calcul se réécrit pendant « La prochaine fois… »
  const REW = [ME('paye') + 0.36, M('ceux') - 0.05];
  T.card = REW[1];

  // ---------- les six coups (pixels de la photo ; docs/timeline-mo11.md, « La voiture ») ----------
  const COUPS = [
    { key: 'lavage', t0: T.lav, x0: 0, xm: 905, x1: 1809, y0: -30, y1: 1262, seq: 'lavage', ti: 'Lavage · haute pression', am: '8,00', P: [905, 640], s: 1.06, Y: 960, ry: 2, rx: 2 },
    { key: 'phares', t0: T.ph, x0: 30, xm: 895, x1: 1130, y0: 425, y1: 850, lay: ['phares'], seq: 'phares', ti: 'Phares · kit + vernis', am: '25,00', P: [895, 636], s: 2.2, Y: 900, ry: -5, rx: 1 },
    { key: 'sieges', t0: T.si, x0: 488, xm: 1140, x1: 1380, y0: 46, y1: 412, lay: ['parebrise'], seq: 'sieges', ti: 'Sièges · injecteur loué', am: '30,00', P: [1140, 225], s: 1.9, Y: 900, ry: -1, rx: 4 },
    { key: 'odeur', t0: T.od, x0: 1378, xm: 1540, x1: 1704, y0: 46, y1: 356, lay: ['vitres'], seq: 'odeur', ti: 'Odeur · filtre à charbon', am: '15,00', P: [1540, 200], s: 2.5, Y: 900, ry: 4, rx: 3 },
    { key: 'rayure', t0: T.ra, x0: 1150, xm: 1252, x1: 1356, y0: 556, y1: 712, seq: 'rayure', ti: 'Rayure · polish', am: '15,00', P: [1252, 634], s: 2.75, Y: 900, ry: 5, rx: -1 },
    { key: 'enjo', t0: T.en, x0: 1170, xm: 1256, x1: 1792, y0: 800, y1: 1186, lay: ['enjo'], after: ['neufs'], seq: 'roue', ti: 'Enjoliveurs · jeu de 4', am: '20,00', P: [1256, 991], s: 2.3, Y: 900, ry: 3, rx: -4 },
  ];
  const TD = COUPS.map((c) => c.t0 + 0.72);            // le débit tombe quand la ligne a fini
  const TI = TD.map((x) => x + 0.33);                   // l'étincelle arrive au compteur : impulsion
  const DV = [80, 90, 90, 60, 70, 40];                  // 2 900 → 3 330 € ; aucune valeur n'est lue à un coup
  const DM = [10, 30, 40, 15, 25, 20];                  // l'horloge avance à chaque coup : 13:00 → 15:20
  T.leaveN = TD[5] + 0.62; T.pose = TI[5] + 0.62;
  const ST_FROM = T.big - 0.15, ST_TO = T.ph - 0.06;    // rembobinage jusqu'à 13:10 : lavée, encore rayée

  await Promise.all([
    document.fonts.load('700 150px Clash'), document.fonts.load('600 50px Clash'), document.fonts.load('500 22px Satoshi'),
    document.fonts.load('700 34px Satoshi'), document.fonts.load('italic 104px Fraunces'),
  ]);

  // ---------- vidéos (Mixkit, 30 i/s ; film-mo11/seq-mo11.py) et voiture ----------
  const SEQ = await (await fetch('seq.json')).json();
  const IMG = await loadSeqs('seq', SEQ);
  const PE = await (await fetch('photo-ecran.json')).json();
  const MASK = []; for (let i = 0; i < SEQ.photo; i++) MASK.push(await load(`seq/photo-masque/${String(i + 1).padStart(3, '0')}.png`));
  const A = '../assets/photos-mo11/';
  // les SVG passent par un Blob : les serveurs de scripts/at.mjs, sheet.mjs et events.mjs ne servent pas image/svg+xml
  const svgURL = async (n) => URL.createObjectURL(new Blob([await (await fetch(A + n)).text()], { type: 'image/svg+xml' }));
  const SVGU = { rayure: await svgURL('clio3-rayure.svg'), enjo: await svgURL('clio3-enjoliveurs.svg'), neufs: await svgURL('clio3-enjoliveurs-neufs.svg') };
  const carI = await load(A + 'car-clio3.png');
  const neufI = await load(SVGU.neufs);

  // ---------- temps du récit : il avance, puis se rembobine (après la chute) jusqu'à 13:10 ----------
  const story = (t) => {
    if (t < REW[0]) return t;
    if (t < REW[1]) { const u = (t - REW[0]) / (REW[1] - REW[0]); const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; return lerp(ST_FROM, ST_TO, e); }
    return ST_TO;
  };
  // prix affiché : impulsions qui se chevauchent (le compteur ne se pose qu'à 2 900 et à 3 330)
  const IMP = { f: 0.7, z: 1 };
  const price = (st) => 2900 + DV.reduce((s, d, i) => s + d * Math.min(1, spring(st - TI[i], i === 5 ? { f: 1.3, z: 1 } : IMP) / 0.985), 0);
  const clockM = (st) => 780 + DM.reduce((s, d, i) => s + d * sm(TD[i] - 0.1, TD[i] + 0.12, st), 0) + 70 * Math.pow(clamp((st - T.sun0) / (T.sun1 - 0.2 - T.sun0), 0, 1), 1.6);
  const sunK = (st) => sm(T.sun0, T.sun1, st);

  // ---------- fonds (parallaxe lente) ----------
  const LB = el('div', 'L', stage, 'transform-origin:0 0');
  el('div', 'abs', LB, 'left:-500px;top:-500px;width:2080px;height:2920px;background:radial-gradient(48% 34% at 50% 50%,#1d1520,#08070a 78%)');
  const cone = el('div', 'abs', LB, 'left:-210px;top:-320px;width:1500px;height:1500px;background:conic-gradient(from 180deg at 50% 0%,transparent 160deg,rgba(255,138,76,.10) 175deg,rgba(255,179,138,.17) 180deg,rgba(255,138,76,.10) 185deg,transparent 200deg);filter:blur(30px);mix-blend-mode:screen');
  // décor du soir : le plan « soleil » réduit à 64 × 58 et agrandi (flou sans filtre), puis la terre sombre dessous
  const dec = el('div', 'abs', LB, 'left:-420px;top:-300px;width:1920px;height:2200px;visibility:hidden');
  const decCv = el('canvas', 'abs', dec, 'left:0;top:0;width:1920px;height:1700px'); decCv.width = 64; decCv.height = 58;
  el('div', 'abs', dec, 'left:0;top:0;width:1920px;height:2200px;background:linear-gradient(rgba(8,7,10,.92) 12%,rgba(8,7,10,.55) 26%,rgba(8,7,10,.12) 40%,rgba(40,18,8,.35) 54%,#0b0806 68%,#08070a)');

  // ---------- le monde : la voiture et son sol (caméra à point focal) ----------
  const FY = 960;
  const LW = el('div', 'L', stage, 'transform-origin:0 0');
  const floor = el('div', 'abs', LW, 'left:-900px;top:1290px;width:2880px;height:1000px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 120px),repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 2px,transparent 2px 120px);transform:perspective(900px) rotateX(72deg);transform-origin:50% 0;-webkit-mask-image:radial-gradient(45% 60% at 50% 0%,#000,transparent)');
  const glowCar = el('div', 'glow', LW, 'left:60px;top:1160px;width:960px;height:360px;background:radial-gradient(closest-side,rgba(255,110,40,.36),transparent)');
  const pool = el('div', 'glow', LW, 'left:-260px;top:1040px;width:1600px;height:620px;background:radial-gradient(closest-side,rgba(255,170,90,.42),rgba(255,120,50,.12) 60%,transparent);visibility:hidden');
  const CAR = { left: 40, top: 650, w: 1000 };
  const C = E.car(LW, { img: carI, w: CAR.w, left: CAR.left, top: CAR.top, reflect: 0, layers: [
    ['poussiere', A + 'clio3-poussiere.png'], ['phares', A + 'clio3-phares.png'], ['parebrise', A + 'clio3-pare-brise.png'],
    ['vitres', A + 'clio3-vitres.png'], ['rayure', SVGU.rayure], ['enjo', SVGU.enjo], ['neufs', SVGU.neufs]] });
  E.prepSun(C, carI);
  await Promise.all([C.base, ...Object.values(C.L)].map((e) => e.decode().catch(() => 0)));
  const full = `position:absolute;left:0;top:0;width:${C.w}px;height:${f3(C.h)}px`;
  // la bande nette et brillante que laisse l'embout : vernis propre, plus clair que la poussière autour, avec un reflet
  // le long de la bande (masquée sur la silhouette de la voiture, plus seulement sur ses zones claires : sur la peinture
  // grise de la portière, la bande se lisait comme un ruban sombre)
  const band = el('div', '', C.body, `${full};mix-blend-mode:screen;visibility:hidden;-webkit-mask-image:url(${A}car-clio3.png);-webkit-mask-size:100% 100%`);
  // la voiture propre, découpée sur la bande et posée juste au-dessus de la poussière (les calques phares, rayure… restent
  // au-dessus). Remplace le trou « evenodd » dans la découpe de la poussière : au rendu séquentiel (render.mjs), ce trou
  // faisait dessiner une tuile du bas de la voiture sur le capot une image sur deux (3,13 → 3,58 s), en pleine définition.
  const bandBase = el('img', '', C.body, `${full};visibility:hidden`); bandBase.src = carI.src; C.L.poussiere.after(bandBase);
  const CC = window.CAR_CLIO3_CONTOUR;
  const csv = sv('svg', { width: C.w, height: f3(C.h), viewBox: `0 0 ${CC.w} ${CC.h}`, style: 'position:absolute;left:0;top:0;overflow:visible' }, C.box); defs(csv, 'c');
  const cGlow = sv('path', { d: CC.d, fill: 'none', stroke: '#ff7a3a', 'stroke-width': 13, 'stroke-linejoin': 'round', filter: 'url(#softc)', 'stroke-dasharray': `${CC.len} ${CC.len}` }, csv);
  const cLine = sv('path', { d: CC.d, fill: 'none', stroke: '#ffe2cf', 'stroke-width': 3.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': `${CC.len} ${CC.len}` }, csv);
  const cPen = sv('g', {}, csv); sv('circle', { r: 26, fill: '#ff7a3a', opacity: 0.6, filter: 'url(#softc)' }, cPen); sv('circle', { r: 6.5, fill: '#fff' }, cPen);
  // outils de la plume, dans les pixels de la photo : embout d'aspirateur (hook), ongle (verdict), poussière aspirée
  const tools = sv('g', {}, C.svg); defs(C.svg, 't');
  const BAND = { x0: 1150, x1: 1650, c: (x) => 600 - 80 * (x - 1150) / 500, hw: 96 };
  // reflet de la bande : dégradé perpendiculaire à la bande (pente − 0,16), positions en pixels de la boîte de la voiture
  const BN = (() => {
    const th = Math.PI - Math.atan(0.16), sx = Math.sin(th), sy = -Math.cos(th), L = Math.abs(C.w * sx) + Math.abs(C.h * sy);
    const px = 1400 * C.k, py = BAND.c(1400) * C.k;
    return { deg: f3(th * 180 / Math.PI), p: L / 2 + (px - C.w / 2) * sx + (py - C.h / 2) * sy, hw: BAND.hw * C.k * Math.cos(Math.atan(0.16)) };
  })();
  // contour du passage de l'embout entre xs et xe : bords qui ondulent, attaque arrondie
  const bandPoly = (xs, xe) => {
    const n = Math.max(2, Math.ceil((xe - xs) / 18)), top = [], bot = [];
    for (let i = 0; i <= n; i++) { const x = lerp(xs, xe, i / n); top.push([x, BAND.c(x) - BAND.hw + 7 * noise(21, x / 40)]); bot.push([x, BAND.c(x) + BAND.hw + 7 * noise(22, x / 37)]); }
    const cy = BAND.c(xe), lead = [0.35, 0.7, 0.92].map((a) => [xe + 16 * Math.sin(Math.PI * a), cy - BAND.hw * Math.cos(Math.PI * a)]);
    return [...top, ...lead, ...bot.reverse()];
  };
  const dust = Array.from({ length: 38 }, (_, i) => {
    const h = (k) => { const s = Math.sin((i + 1) * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
    const x = BAND.x0 + 12 + 476 * h(1), y = BAND.c(x) + (h(2) - 0.5) * 2 * BAND.hw * 0.9;
    return { x, y, r: 5 + 7 * h(3), j: (h(4) - 0.5) * 60, e: sv('circle', { fill: h(5) > 0.5 ? '#b49c7a' : '#8c7556' }, tools) };
  });
  // l'embout : une tête de suceur (trapèze 40 × 120, poils sur le grand côté, contre la peinture), son col, et le
  // flexible annelé qui sort du cadre en haut à droite ; tracé à la lumière comme l'ongle du verdict
  const noz = sv('g', { display: 'none' }, tools);
  const HOSE = 'M40 0 C 140 0, 250 -16, 330 -70 S 520 -210, 720 -330';     // sort à droite, sous le calcul
  const HEAD = 'M-20 -60 L20 -46 L20 46 L-20 60 Z';
  sv('path', { d: HOSE, fill: 'none', stroke: '#ff7a3a', 'stroke-width': 40, filter: 'url(#softt)', opacity: 0.45, 'stroke-linecap': 'round' }, noz);
  sv('path', { d: HOSE, fill: 'none', stroke: '#ffe2cf', 'stroke-width': 30, 'stroke-linecap': 'round' }, noz);
  sv('path', { d: HOSE, fill: 'none', stroke: '#1a1416', 'stroke-width': 21, 'stroke-linecap': 'round' }, noz);
  sv('path', { d: HOSE, fill: 'none', stroke: '#ffe2cf', 'stroke-width': 21, 'stroke-dasharray': '3.5 9', opacity: 0.55 }, noz);   // anneaux
  sv('path', { d: HEAD, fill: 'none', stroke: '#ff7a3a', 'stroke-width': 16, filter: 'url(#softt)', opacity: 0.7 }, noz);
  sv('rect', { x: 14, y: -14, width: 30, height: 28, rx: 6, fill: '#1a1416', stroke: '#ffe2cf', 'stroke-width': 4.5 }, noz);   // col
  sv('path', { d: HEAD, fill: 'rgba(26,20,22,.82)', stroke: '#ffe2cf', 'stroke-width': 5, 'stroke-linejoin': 'round' }, noz);
  sv('path', { d: 'M-8 -44 L-8 44', stroke: '#ffe2cf', 'stroke-width': 3, opacity: 0.6, 'stroke-linecap': 'round' }, noz);     // fente d'aspiration
  sv('path', { d: Array.from({ length: 15 }, (_, i) => { const y = -56 + i * 8; return `M-21 ${y} L-31 ${y + 2}`; }).join(' '), stroke: '#fff4ea', 'stroke-width': 3.2, 'stroke-linecap': 'round' }, noz);   // poils
  const nail = sv('g', { display: 'none' }, tools);
  const nTrail = sv('path', { fill: 'none', stroke: '#ffe2cf', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.8 }, tools);
  const FING = 'M-34 -150 L-34 -10 C -34 30, 34 30, 34 -10 L34 -150', NAILP = 'M-21 -40 L-21 -2 C -21 20, 21 20, 21 -2 L21 -40 C 8 -46, -8 -46, -21 -40 Z';
  sv('path', { d: FING, fill: 'none', stroke: '#ff7a3a', 'stroke-width': 14, filter: 'url(#softt)', opacity: 0.55 }, nail);
  sv('path', { d: FING, fill: 'rgba(8,7,10,.35)', stroke: '#ffe2cf', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, nail);
  sv('path', { d: NAILP, fill: 'rgba(255,226,207,.22)', stroke: '#fff4ea', 'stroke-width': 4, 'stroke-linejoin': 'round' }, nail);
  sv('circle', { cy: 16, r: 6.5, fill: '#fff' }, nail);
  const twk = sv('path', { d: 'M0 -34 L6 -6 L34 0 L6 6 L0 34 L-6 6 L-34 0 L-6 -6 Z', fill: '#fff4ea', display: 'none' }, tools);

  // ---------- caméras ----------
  const camTf = (c) => `translate(540px,${FY}px) perspective(1700px) rotateX(${f3(c.rx)}deg) rotateY(${f3(c.ry)}deg) scale(${f3(c.s)}) translate(${f3(-c.x)}px,${f3(-c.y)}px)`;
  const aim = (p, s, Y) => { const [wx, wy] = E.at(C, p[0], p[1]); return { x: wx, y: wy - (Y - FY) / s, s }; };
  const C0 = { x: 540, y: FY, s: 1, rx: 0, ry: 0 };
  const AX = ['x', 'y', 's', 'rx', 'ry'];
  const keysOf = (list) => Object.fromEntries(AX.map((a) => [a, list.map(([t, c, p]) => (p ? [t, c[a], p] : [t, c[a]]))]));
  // R : le récit, une seule prise ; l'accumulation tourne autour de la voiture dans le sens des aiguilles d'une montre
  // (phare → pare-brise → vitres → aile → roue), sans retour en arrière, au plus 1,52 pixel d'écran par pixel de photo
  const CAMP = { f: 0.85, z: 1 };
  const RK = [[0, C0],
    [0.25, { x: 556, y: 972, s: 1.03, rx: 1.5, ry: -1.5 }, { f: 0.3, z: 1 }],
    [T.vac0 - 0.35, { x: 600, y: 985, s: 1.07, rx: 2, ry: 1.5 }, { f: 0.55, z: 1 }],
    [T.fold - 0.1, { x: 540, y: 966, s: 1.0, rx: 1.5, ry: 0 }, { f: 0.5, z: 1 }],
    [T.fold + 0.4, { x: 516, y: 992, s: 1.035, rx: 3, ry: -4 }, { f: 0.5, z: 1 }],   // la caméra glisse avant le lavage : pas de plan figé
    ...COUPS.map((c, i) => { const a = aim(c.P, c.s, c.Y); return [c.t0 - (i ? 0.38 : 0.45), { ...a, rx: c.rx, ry: c.ry }, i ? CAMP : { f: 0.6, z: 1 }]; }),
    [T.en + 0.78, { x: 540, y: 985, s: 1.0, rx: 2, ry: 0 }, { f: 0.6, z: 1 }],
    [T.sun0 + 0.15, { x: 540, y: 818, s: 0.95, rx: 3, ry: -2 }, { f: 0.38, z: 1 }],
    [T.vf - 0.15, { x: 548, y: 838, s: 1.02, rx: 2, ry: 0.5 }, { f: 0.42, z: 1 }],
    [T.click + 0.1, { x: 540, y: 850, s: 1.06, rx: 2, ry: 1.5 }, { f: 0.3, z: 1 }],
    [T.big, { x: 540, y: 870, s: 1.12, rx: 3, ry: -1 }, { f: 0.22, z: 1 }]];
  const RKs = keysOf(RK);
  const camR = (st) => {
    const c = {}; for (const a of AX) c[a] = track(st, RKs[a]);
    const nk = sm(0, 1.2, st);                                                    // bruit nul à l'image 0
    c.x += nk * noise(5, st * 0.35) * 7 / c.s; c.y += nk * noise(6, st * 0.3) * 7 / c.s;
    c.rx += nk * noise(7, st * 0.4) * 0.45; c.ry += nk * noise(8, st * 0.35) * 0.55;
    return c;
  };
  // F : le renversement (t) : recul pendant le rembobinage, plongée sur l'aile, retour exact au cadre de l'image 0
  const cr0 = camR(REW[0]);
  // pendant la carte : orbite lente (ry − 3° → + 5°) et poussée (0,90 → 0,98), la caméra ne se pose plus (round 1)
  const FKs = keysOf([[REW[0], cr0], [REW[0] + 0.05, { x: 540, y: 930, s: 0.9, rx: 4, ry: -3 }, { f: 0.6, z: 1 }],
    [T.card + 0.1, { x: 548, y: 905, s: 0.98, rx: 3.5, ry: 5 }, { f: 0.22, z: 1 }],
    [T.dive2, { ...aim([1252, 634], 2.7, 960), rx: 1, ry: 3 }, { f: 0.75, z: 1 }],
    [T.verd, { ...aim([1262, 630], 2.8, 950), rx: 1.8, ry: 4.5 }, { f: 0.22, z: 1 }]]);           // poussée lente sur le verdict
  const camF = (t) => {
    const c = {}; for (const a of AX) c[a] = track(t, FKs[a]);
    c.x += noise(9, t * 0.3) * 6 / c.s; c.y += noise(10, t * 0.3) * 6 / c.s; c.ry += noise(11, t * 0.3) * 0.5;
    c.y += 6 * lineNudge(t) * (1 - sm(T.dive2, T.dive2 + 0.6, t)) / c.s;     // un pas vers chaque règle qui entre
    if (t >= LOOP) { const u = sm(LOOP, DUR - 0.15, t); for (const a of AX) c[a] = lerp(c[a], C0[a], u); }
    return c;
  };
  const cam = (t) => (t < REW[0] ? camR(t) : camF(t));
  function lineNudge(t) { return T.l.reduce((a, tl) => a + S(t, tl - 0.06, { f: 1.4, z: 1 }), 0); }
  // A : le calcul du hook, dérive légère, ramenée à l'identité pendant le repli et à la pose de l'image 0 à la fin
  const camA0 = (t) => ({
    x: track(t, [[0, 540], [0.2, 548, { f: 0.3, z: 1 }], [2.6, 534, { f: 0.3, z: 1 }]]) + sm(0, 1, t) * noise(1, t * 0.4) * 4,
    y: track(t, [[0, FY], [0.2, FY + 10, { f: 0.3, z: 1 }]]) + sm(0, 1, t) * noise(2, t * 0.4) * 4,
    s: track(t, [[0, 1], [0.2, 1.02, { f: 0.25, z: 1 }]]),
    rx: track(t, [[0, 2], [0.2, 0.6, { f: 0.3, z: 1 }]]) + sm(0, 1, t) * noise(3, t * 0.4) * 0.4,
    ry: track(t, [[0, -2], [0.2, 1.4, { f: 0.3, z: 1 }], [2.6, -1, { f: 0.3, z: 1 }]]) + sm(0, 1, t) * noise(4, t * 0.4) * 0.5,
  });
  const ID = { x: 540, y: FY, s: 1, rx: 0, ry: 0 };
  const camA = (t) => {
    const a0 = camA0(0);
    if (t >= LOOP) { const c = camA0(t); const u = sm(LOOP + 0.3, DUR - 0.15, t); for (const k of AX) c[k] = lerp(c[k], a0[k], u); return c; }
    const c = camA0(t), mv = S(t, T.fold - 0.08, { f: 1.4, z: 1 }); for (const k of AX) c[k] = lerp(c[k], ID[k], mv); return c;
  };
  const toA = (cA, sx, sy) => [(sx - 540) / cA.s + cA.x, (sy - FY) / cA.s + cA.y];   // écran → calque A (sans les rotations)
  const toScreen = (c, wx, wy) => [540 + (wx - c.x) * c.s, FY + (wy - c.y) * c.s];

  // ---------- voile du haut (texte lisible quand la caméra est près de la carrosserie) ----------
  const veil = el('div', 'L', stage, 'background:linear-gradient(#08070a,rgba(8,7,10,.9) 22%,rgba(8,7,10,.5) 32%,transparent 42%)');
  const dimW = el('div', 'L', stage, 'background:rgba(8,7,10,.74)');

  // ---------- A : le calcul « 2 000 → 2 900 · telle quelle ? », déjà composé à l'image 0 ----------
  const LA = el('div', 'L', stage, 'transform-origin:0 0');
  const svgA = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LA);
  const dA = defs(svgA, 'a');
  const sheen = sv('linearGradient', { id: 'sheenA', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1080, y2: 0 }, dA);
  const shS = [0, 0, 0, 0].map(() => sv('stop', { 'stop-color': '#fff' }, sheen));
  const mcv = document.createElement('canvas').getContext('2d');
  const wW = (str, font, size) => { mcv.font = font; let x = 0; for (const ch of str) x += ch === ' ' ? size * 0.24 : mcv.measureText(ch).width; return x; };
  let SZ = 118; const gapA = () => SZ * 0.3, arW = () => SZ * 0.78;
  const totA = () => wW('2 000', `700 ${SZ}px Clash`, SZ) + wW('2 900', `700 ${SZ}px Clash`, SZ) + 2 * gapA() + arW();
  while (totA() > 760) SZ -= 2;
  const BASE = 452, BASE2 = 580, FA = `700 ${SZ}px Clash`;
  const leftA = 540 - totA() / 2, w1W = wW('2 000', FA, SZ);
  const gOut = sv('g', {}, svgA);                             // ce qui sort au repli : « 2 000 → », « telle quelle ? »
  const W1 = word(gOut, '2 000', FA, SZ, leftA, BASE, { align: 'left' });
  const AR = { x0: leftA + w1W + gapA(), y: BASE - SZ * 0.36 }; AR.x1 = AR.x0 + arW();
  const arG = sv('g', { filter: 'url(#gla)' }, gOut);
  const arrow = sv('path', { d: `M${f3(AR.x0)} ${f3(AR.y)} H${f3(AR.x1)} M${f3(AR.x1 - 26)} ${f3(AR.y - 22)} L${f3(AR.x1)} ${f3(AR.y)} L${f3(AR.x1 - 26)} ${f3(AR.y + 22)}`, stroke: '#ffb38a', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '260 260' }, arG);
  const W2 = word(svgA, '2 900', FA, SZ, AR.x1 + gapA(), BASE, { align: 'left' });
  for (const g of W2.items) { g.wrap = sv('g', {}, svgA); g.wrap.appendChild(g.g); }
  const shine = [W1, W2].map((w, j) => { const gS = sv('g', {}, j ? svgA : gOut); for (const g of w.items) { const s = sv('text', { x: g.left, y: g.base, 'font-family': 'Clash', 'font-weight': 700, 'font-size': SZ, fill: 'url(#sheenA)' }, gS); s.textContent = g.ch; } return gS; });
  // le chiffre des centaines roule jusqu'au « ? » (sur « donné »), puis revient à 9 au repli
  const g9 = W2.items[1], RD = SZ * 1.08;
  const rc = sv('clipPath', { id: 'rollc' }, dA); sv('rect', { x: f3(g9.left - 8), y: f3(BASE - SZ * 0.86), width: f3(g9.w + 16), height: f3(SZ * 1.02) }, rc);
  const rollG = sv('g', { 'clip-path': 'url(#rollc)', visibility: 'hidden' }, g9.wrap);
  const rollC = sv('g', {}, rollG);
  const ROLL = ['9', '0', '1', '2', '3', '?', '9'];
  const rollT = ROLL.map((ch, j) => { const e = sv('text', { x: f3(g9.cx), y: f3(BASE + j * RD), 'text-anchor': 'middle', 'font-family': ch === '?' ? 'Fraunces' : 'Clash', 'font-weight': ch === '?' ? 500 : 700, 'font-style': ch === '?' ? 'italic' : 'normal', 'font-size': ch === '?' ? SZ * 1.12 : SZ, fill: ch === '?' ? 'url(#qga)' : '#f6efe7' }, rollC); e.textContent = ch; return e; });
  const FQ = '500 92px Fraunces';                          // word() lit la famille au 3e mot : pas de « italic » en tête (opts.italic)
  const Q = word(gOut, 'telle quelle ?', FQ, 92, 540, BASE2, { italic: true, fill: 'url(#qga)', strokeColor: '#ffb38a', sw: 1.8, track: -1 });
  const Qq = Q.items[Q.items.length - 1];
  const Cd = word(gOut, "C'est donné.", FQ, 92, 540, BASE2, { italic: true, fill: 'url(#qga)', strokeColor: '#ffb38a', sw: 1.8, track: -1 });
  const slit = sv('g', {}, svgA);
  sv('rect', { x: -22, y: -150, width: 44, height: 200, rx: 22, fill: '#ff7a3a', opacity: 0.5, filter: 'url(#softa)' }, slit);
  sv('rect', { x: -3, y: -140, width: 6, height: 180, rx: 3, fill: '#fff' }, slit);
  const pen = sv('g', {}, svgA); sv('circle', { r: 30, fill: '#ff7a3a', opacity: 0.6, filter: 'url(#softa)' }, pen); sv('circle', { r: 8, fill: '#fff' }, pen);
  // écrire à la lumière, sans contour résiduel (la boucle doit retomber exactement sur l'image 0)
  function writeW(w, t, t0, step = 0.05, dy = 24) {
    w.items.forEach((g, i) => {
      const ts = t0 + i * step, dr = S(t, ts, P.draw), fi = S(t, ts + 0.16, P.rise);
      g.stroke.setAttribute('stroke-dashoffset', f3(g.L * (1 - dr)));
      g.stroke.setAttribute('opacity', f3(sm(ts - 0.01, ts + 0.04, t) * (1 - fi)));
      g.fill.setAttribute('opacity', f3(fi));
      g.g.setAttribute('transform', `translate(0,${f3((1 - fi) * dy)})`);
    });
  }
  const mixC = (a, b, u) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], u))).join(',')})`;

  // ---------- H : compteur « PRIX AFFICHÉ », repère, palettes ----------
  const LH = el('div', 'L', stage);
  const glowH = el('div', 'glow', LH, 'left:190px;top:236px;width:700px;height:300px;background:radial-gradient(closest-side,rgba(255,110,40,.5),transparent)');
  const CT = 296;
  const Cn = counter(LH, { top: CT, label: 'PRIX\u00a0AFFICHÉ', labelTop: 246 });
  const CELLX = [0, 1, 2, 3].map((i) => 540 - 313 + i * 136 + 62);
  const rep = el('div', 'abs', LH, 'left:0;width:1080px;top:478px;text-align:center;white-space:nowrap;font:500 36px Satoshi;color:rgba(246,239,231,.82)');
  rep.innerHTML = 'Propre, chez un pro · <b style="font-weight:700;color:rgba(246,239,231,.96)">3 490 €</b>';
  const FL = ['S', 'A', 'M', 'E', 'D', 'I', '1', '3', ':', '0', '0'];
  const fl1 = flaps(LH, FL, { y: 540, w: 56, h: 72, fs: 50, g: 6, gapAt: 6, gap: 34 });
  const dot = el('div', 'abs', LH, `left:${f3(fl1[5].d.offsetLeft + 56 + 14)}px;top:568px;width:12px;height:12px;border-radius:6px;background:#ffb38a`);
  const fl2 = flaps(LH, ['J', '+', '4'], { y: 532, w: 74, h: 92, fs: 66, g: 8 });
  // palettes : verre teinté sans flou d'arrière-plan (14 tuiles floutées coûtaient cher au rendu, l'œil ne voit pas l'écart)
  for (const f of [...fl1, ...fl2]) { f.d.style.backdropFilter = 'none'; f.d.style.webkitBackdropFilter = 'none'; f.d.style.background = 'linear-gradient(160deg,rgba(62,52,48,.88),rgba(24,19,18,.9) 55%,rgba(36,29,27,.9))'; }
  // l'attente : la règle, sous la palette
  const LTx = el('div', 'L', stage);
  const heure = el('div', 'abs', LTx, 'left:0;width:1080px;top:628px;text-align:center;font:500 38px Satoshi;color:rgba(246,239,231,.85);white-space:nowrap'); heure.textContent = "l'heure avant le coucher";
  const sbas = el('div', 'abs', LTx, 'left:0;width:1080px;top:690px;text-align:center;white-space:nowrap;font:500 46px Satoshi');
  const sb1 = el('span', '', sbas, 'display:inline-block'); sb1.textContent = 'Soleil bas,';
  const sb2 = el('span', 'serif', sbas, 'display:inline-block;font-size:62px;margin-left:12px'); sb2.textContent = 'dans ton dos.';
  const lab1 = el('div', 'abs', LTx, 'left:0;width:1080px;top:684px;text-align:center;white-space:nowrap;font:700 44px Satoshi');
  lab1.innerHTML = 'Photo 1 <span style="font-weight:500;color:rgba(246,239,231,.7)">· trois quarts avant</span>';

  // ---------- N : les débits, l'étincelle vers le compteur, la carte « trouvé » ----------
  const LN = el('div', 'L', stage);
  const debs = COUPS.map((c) => { const w = el('div', 'abs', LN, 'width:780px;height:184px'); const n = notif(w, c.ti, c.am); n.d.style.left = '0'; n.d.style.top = '0'; return { w, n, c }; });
  const gag = el('div', 'glass notif', LN, 'left:0;top:0;width:600px;height:150px;padding:16px 26px 16px 16px'); el('div', 'sheen', gag);
  const gagC = el('canvas', '', gag, 'width:150px;height:112px'); gagC.width = 300; gagC.height = 224;
  const gagT = el('div', '', gag);
  el('div', 'app', gagT).textContent = 'Trouvé';
  el('div', 'ti', gagT, 'font-size:32px').textContent = 'Sous les sièges';
  el('div', 'am', gagT, 'font-size:46px').innerHTML = '3,40 € <span class="serif" style="font-size:48px">· une frite</span>';
  const svgN = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LN); defs(svgN, 'n');
  const sparks = TD.map(() => { const g = sv('g', { visibility: 'hidden' }, svgN); const tr = [0.5, 0.3, 0.16].map((o, j) => sv('circle', { r: 9 - 2 * j, fill: '#ffd2b8', opacity: o }, g)); sv('circle', { r: 26, fill: '#ff7a3a', opacity: 0.55, filter: 'url(#softn)' }, g); const h = sv('circle', { r: 7, fill: '#fff' }, g); return { g, tr, h }; });
  const SPK = [[700, 1318], [930, 820], [540, 392]];
  const bez = (u) => { const [a, b, c] = SPK, v = 1 - u; return [v * v * a[0] + 2 * v * u * b[0] + u * u * c[0], v * v * a[1] + 2 * v * u * b[1] + u * u * c[1]]; };

  // ---------- S : photo 1, l'annonce, les messages, l'offre, le virement ----------
  const LS = el('div', 'L', stage);
  const svgV = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LS); defs(svgV, 'v');
  const brk = [0, 1, 2, 3].map(() => { const g = sv('g', { visibility: 'hidden' }, svgV); sv('path', { fill: 'none', stroke: '#ff7a3a', 'stroke-width': 14, filter: 'url(#softv)', opacity: 0.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); sv('path', { fill: 'none', stroke: '#fff4ea', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); return g; });
  const ANN = { left: 140, top: 636, w: 800, sx: 20, sy: 20, cw: 760, ch: 760 * 406 / 720 };
  const ann = el('div', 'glass card', LS, `left:${ANN.left}px;top:${ANN.top}px;width:${ANN.w}px;height:${f3(ANN.ch + 128)}px`); el('div', 'sheen', ann);
  const annCv = el('canvas', 'abs', ann, `left:${ANN.sx}px;top:${ANN.sy}px;width:${ANN.cw}px;height:${f3(ANN.ch)}px;border-radius:24px`); annCv.width = 720; annCv.height = 406;
  const annRow = el('div', 'abs', ann, `left:0;top:${f3(ANN.sy + ANN.ch + 18)}px;width:${ANN.w}px;text-align:center;white-space:nowrap`);
  const annP = el('span', '', annRow, 'font:700 66px Clash;letter-spacing:-.01em;vertical-align:middle'); annP.textContent = '3 330 €';
  el('span', '', annRow, 'font:500 32px Satoshi;color:rgba(246,239,231,.62);margin-left:26px;vertical-align:middle').textContent = '2008 · 150 000 km';
  const annSh = el('div', 'abs', ann, `left:0;top:0;width:${ANN.w}px;height:100%;mix-blend-mode:screen`);
  const msgs = ['Belle photo. Toujours dispo ?', 'Je passe demain ?'].map((m) => { const d = el('div', 'glass msg', LS, 'left:176px;top:0'); d.textContent = m; return d; });
  const bubble = el('div', 'glass', LS, 'left:150px;top:1086px;width:780px;padding:26px 34px;border-radius:40px 40px 40px 12px'); el('div', 'sheen', bubble);
  el('div', '', bubble, 'font:500 24px Satoshi;color:rgba(246,239,231,.7);margin-bottom:8px').textContent = 'Acheteur · message';
  el('div', '', bubble, 'font:700 46px Satoshi;line-height:1.2;white-space:nowrap').innerHTML = '3 300 et je <span style="font-family:Fraunces;font-style:italic;font-weight:500;color:#ff8a4c">la prends.</span>';
  const credit = notif(LS, 'Virement reçu', '3 300,00', { sign: '+' });
  // la photo 1 telle qu'elle part dans l'annonce : la Clio dorée sur le soir, calculée une fois
  const photo = document.createElement('canvas'); photo.width = 920; photo.height = 400;
  {
    const c = photo.getContext('2d'), g = c.createLinearGradient(0, 0, 0, 400);
    g.addColorStop(0, '#2a1610'); g.addColorStop(0.42, '#a8521f'); g.addColorStop(0.5, '#e98a3e'); g.addColorStop(0.56, '#5b2e17'); g.addColorStop(1, '#120c09');
    c.fillStyle = g; c.fillRect(0, 0, 920, 400);
    const rg = c.createRadialGradient(560, 205, 10, 560, 205, 260); rg.addColorStop(0, 'rgba(255,214,150,.75)'); rg.addColorStop(1, 'rgba(255,160,80,0)');
    c.fillStyle = rg; c.fillRect(0, 0, 920, 400);
    const h = 352, w = h * C.W / C.H, x = (920 - w) / 2, y = 380 - h;
    c.save(); c.globalAlpha = 0.55; c.filter = 'blur(10px)'; c.fillStyle = '#000'; c.beginPath(); c.ellipse(460, 372, w * 0.46, 22, 0, 0, Math.PI * 2); c.fill(); c.restore();
    c.drawImage(C.gold, x, y, w, h); c.drawImage(neufI, x, y, w, h);
  }
  // la photo peinte dans l'écran du téléphone (deux triangles affines, puis le masque de la paume)
  const tmp = document.createElement('canvas'); tmp.width = 720; tmp.height = 406; const tc = tmp.getContext('2d');
  function tri(ctx, img, s, d) {
    const [[x0, y0], [x1, y1], [x2, y2]] = s, [[u0, v0], [u1, v1], [u2, v2]] = d;
    const det = x0 * (y1 - y2) - x1 * (y0 - y2) + x2 * (y0 - y1);
    const a = (u0 * (y1 - y2) - u1 * (y0 - y2) + u2 * (y0 - y1)) / det, b = (v0 * (y1 - y2) - v1 * (y0 - y2) + v2 * (y0 - y1)) / det;
    const c = -(u0 * (x1 - x2) - u1 * (x0 - x2) + u2 * (x0 - x1)) / det, dd = -(v0 * (x1 - x2) - v1 * (x0 - x2) + v2 * (x0 - x1)) / det;
    const e = u0 - a * x0 - c * y0, f = v0 - b * x0 - dd * y0;
    const cx = (u0 + u1 + u2) / 3, cy = (v0 + v1 + v2) / 3, grow = (p, q) => [p + (p - cx) * 0.02, q + (q - cy) * 0.02];
    ctx.save(); ctx.beginPath(); ctx.moveTo(...grow(u0, v0)); ctx.lineTo(...grow(u1, v1)); ctx.lineTo(...grow(u2, v2)); ctx.closePath(); ctx.clip();
    ctx.setTransform(a, b, c, dd, e, f); ctx.drawImage(img, 0, 0); ctx.restore();
  }
  const pingpong = (tt, n) => { const i = Math.max(0, Math.floor(tt * 30)); const c = i % (2 * n - 2); return c < n ? c : 2 * n - 2 - c; };
  function drawPhone(tt) {
    const n = IMG.photo.length, i = pingpong(tt, n), q = PE.quads[i], ctx = annCv.getContext('2d');
    ctx.drawImage(IMG.photo[i], 0, 0, 720, 406);
    tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalCompositeOperation = 'source-over'; tc.clearRect(0, 0, 720, 406);
    const pw = photo.width, ph = photo.height;
    tri(tc, photo, [[0, 0], [pw, 0], [pw, ph]], [q[0], q[1], q[2]]); tri(tc, photo, [[0, 0], [pw, ph], [0, ph]], [q[0], q[2], q[3]]);
    tc.globalCompositeOperation = 'destination-in'; tc.drawImage(MASK[i], 0, 0, 720, 406); tc.globalCompositeOperation = 'source-over';
    ctx.drawImage(tmp, 0, 0);
    return q;
  }

  // ---------- la chute : « + 400 € » ----------
  const dim = el('div', 'L', stage, 'background:rgba(8,7,10,.9)');
  const L4 = el('div', 'L', stage);
  const glow4 = el('div', 'glow', L4, 'left:160px;top:470px;width:760px;height:560px;background:radial-gradient(closest-side,rgba(255,100,40,.55),transparent)');
  const lab4 = el('div', 'abs', L4, 'left:0;width:1080px;top:566px;text-align:center;font:700 30px Satoshi;letter-spacing:.34em;color:#a59a90'); lab4.textContent = 'SUR TON PLAN';
  const big4 = el('div', 'abs', L4, 'left:0;width:1080px;top:604px;text-align:center;white-space:nowrap;font:700 250px Clash;line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:#f6efe7;transform-origin:540px 120px;text-shadow:0 1px 0 #d8cfc6,0 2px 0 #bfb5ab,0 3px 0 #a79c92,0 4px 0 #8f8479,0 5px 0 #786d63,0 6px 0 #61574e,0 16px 30px rgba(0,0,0,.6)');
  big4.innerHTML = '<span style="font-size:150px;margin-right:16px;color:#ffb38a">+</span>400<span style="font-size:140px;margin-left:12px">€</span>';
  const prepa = el('div', 'abs', L4, 'left:0;width:1080px;top:878px;text-align:center;white-space:nowrap;font:700 46px Satoshi;color:rgba(246,239,231,.82)');
  prepa.innerHTML = '<span style="color:#ff8a4c">−</span> 109,60 € de prépa';
  const svg4 = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, L4); defs(svg4, '4');
  const pay1 = word(svg4, 'Ton samedi', '500 98px Fraunces', 98, 540, 1086, { italic: true, fill: 'url(#qg4)', strokeColor: '#ffb38a', sw: 1.8 });
  const pay2 = word(svg4, 'le mieux payé.', '500 98px Fraunces', 98, 540, 1192, { italic: true, fill: 'url(#qg4)', strokeColor: '#ffb38a', sw: 1.8 });

  // ---------- le renversement : la carte « Avant la photo 1 », puis l'ongle et le verdict ----------
  const LC = el('div', 'L', stage);
  const fit = (parts, max) => { let k = 1; const w = () => parts.reduce((s, [txt, font, size]) => s + (mcv.font = font.replace('SZ', size * k), mcv.measureText(txt).width), 0); while (w() > max) k -= 0.02; return k; };
  const ARW = '<svg width="46" height="26" viewBox="0 0 46 26" style="display:inline-block;vertical-align:middle;margin:0 14px 6px"><path d="M2 13 H40 M29 3 L42 13 L29 23" stroke="#ffb38a" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const cardW = el('div', 'abs', LC, 'left:0;top:0;width:1080px;height:1920px;transform-origin:540px 300px');
  const card = el('div', 'glass card', cardW, 'left:140px;top:300px;width:800px;height:470px'); el('div', 'sheen', card);
  const kT = fit([['Avant la photo 1', '700 SZpx Satoshi', 46], ['Pas tout.', 'italic 500 SZpx Fraunces', 66]], 640);
  const cT = el('div', 'abs', cardW, `left:140px;top:334px;width:800px;text-align:center;white-space:nowrap;font:700 ${f3(46 * kT)}px Satoshi`);
  const cT1 = el('span', '', cT, 'display:inline-block'); cT1.textContent = 'Avant la photo 1';
  const cT2 = el('span', 'serif', cT, `display:inline-block;font-size:${f3(66 * kT)}px;margin-left:14px`); cT2.textContent = 'Pas tout.';
  const rule = el('div', 'abs', cardW, 'left:200px;top:428px;width:680px;height:2px;background:linear-gradient(90deg,transparent,rgba(255,179,138,.6),transparent);transform-origin:50% 50%');
  const LINES = [['Ça se voit', 'tu le fais'], ['Travaux > 15 % du prix', "en l'état"], ['Ici : 500 € max ·', 'Pare-chocs · 600 €']];
  const kL = Math.min(...LINES.map(([a, b], i) => fit([[a, '700 SZpx Satoshi', 40], [b, (i < 2 ? 'italic 500 SZpx Fraunces' : '700 SZpx Satoshi'), i < 2 ? 54 : 40], ['→→', '700 SZpx Satoshi', 40]], 700)));
  const lines = LINES.map(([a, b], i) => {
    const r = el('div', 'abs', cardW, `left:140px;top:${452 + i * 100}px;width:800px;text-align:center;white-space:nowrap;font:700 ${f3(40 * kL)}px Satoshi;line-height:76px`);
    const s1 = el('span', '', r, 'display:inline-block'); s1.innerHTML = i < 2 ? a + ARW : a;
    const s2 = el('span', i < 2 ? 'serif' : '', r, `display:inline-block;${i < 2 ? `font-size:${f3(54 * kL)}px` : 'margin-left:12px;position:relative;color:rgba(246,239,231,.9)'}`); s2.textContent = b;
    return { r, s1, s2 };
  });
  const xSvg = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, cardW); defs(xSvg, 'x');
  const xG = sv('path', { fill: 'none', stroke: '#ff8a4c', 'stroke-width': 14, 'stroke-linecap': 'round', filter: 'url(#softx)', opacity: 0.6, 'stroke-dasharray': '1200 1200' }, xSvg);
  const xL = sv('path', { fill: 'none', stroke: '#ff5a1f', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '1200 1200' }, xSvg);
  const xPen = sv('g', {}, xSvg); sv('circle', { r: 24, fill: '#ff7a3a', opacity: 0.6, filter: 'url(#softx)' }, xPen); sv('circle', { r: 7, fill: '#fff' }, xPen);
  // le verdict, sous la rayure
  const kV = fit([["L'ongle glisse ?", '700 SZpx Satoshi', 48], ['Tu lustres.', 'italic 500 SZpx Fraunces', 66]], 700);
  const veilB = el('div', 'abs', LC, 'left:0;top:900px;width:1080px;height:620px;background:linear-gradient(transparent,rgba(8,7,10,.62) 38%,rgba(8,7,10,.7) 80%,transparent)');
  const verd = el('div', 'abs', LC, `left:0;width:1080px;top:1118px;text-align:center;white-space:nowrap;font:700 ${f3(48 * kV)}px Satoshi`);
  const vd1 = el('span', '', verd, 'display:inline-block'); vd1.textContent = "L'ongle glisse ?";
  const vd2 = el('span', 'serif', verd, `display:inline-block;font-size:${f3(66 * kV)}px;margin-left:12px`); vd2.textContent = 'Tu lustres.';
  const pPol = el('div', 'glass pill', LC, 'left:0;top:1236px'); pPol.innerHTML = 'Polish · <span style="font-family:Clash">15 €</span>';
  const pCar = el('div', 'glass pill', LC, 'left:0;top:1236px;color:rgba(246,239,231,.75)'); pCar.innerHTML = 'Carrossier · <span style="font-family:Clash">300 €</span>';
  const pcSvg = sv('svg', { width: 400, height: 40, viewBox: '0 0 400 40', style: 'position:absolute;left:24px;top:28px;overflow:visible' }, pCar);
  const pcL = sv('path', { d: 'M4 24 C 120 8, 260 30, 396 12', stroke: '#ff5a1f', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': '420 420', 'stroke-dashoffset': 420 }, pcSvg);

  const mention = el('div', 'abs', stage, 'left:0;width:1080px;top:1430px;text-align:center;font:500 24px Satoshi;color:rgba(246,239,231,.55)'); mention.textContent = 'Exemple · prix moyens constatés';
  const rewFx = el('div', 'L', stage, 'background:repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 2px,transparent 2px 6px);mix-blend-mode:screen');
  const flash = el('div', 'L', stage, 'background:radial-gradient(60% 45% at 50% 52%,#fff1e6,rgba(255,140,80,.6) 45%,transparent 75%);mix-blend-mode:screen');
  const grain = el('div', '', stage); grain.id = 'grain'; el('div', '', stage).id = 'vign';

  // largeurs mesurées une fois (pilules du verdict, centrées sur x = 540)
  const wPol = pPol.offsetWidth, wCar = pCar.offsetWidth, gP = 26, xP0 = 540 - (wPol + gP + wCar) / 2;
  pPol.style.left = `${f3(xP0)}px`; pCar.style.left = `${f3(xP0 + wPol + gP)}px`;
  pcSvg.setAttribute('width', wCar - 48); pcSvg.setAttribute('viewBox', `0 0 400 40`); pcSvg.setAttribute('preserveAspectRatio', 'none');
  const l3 = lines[2].s2; const l3x = () => [l3.offsetLeft + lines[2].r.offsetLeft, l3.offsetWidth];

  // ---------- la frame t ----------
  function paint(t) {
    const st = story(t);
    const tA = t >= LOOP ? 0 : t;                          // l'état du hook revient à celui de l'image 0
    const loopK = t >= LOOP ? 1 : 0;
    const c = cam(t), sc = c.s * C.k;
    const k = sunK(st);

    // fonds : parallaxe lente, décor du soir quand le soleil baisse
    const bx = 540 + (c.x - 540) * 0.22, by = FY + (c.y - FY) * 0.22, bs = 1 + (c.s - 1) * 0.16;
    LB.style.transform = `translate(540px,${FY}px) scale(${f3(bs)}) translate(${f3(-bx)}px,${f3(-by)}px)`;
    set(dec, k * 0.95); if (k > 0.01) drawSeq(decCv, IMG.soleil, st - T.sun0 + 1);
    cone.style.opacity = f3(1 - 0.7 * k);

    // le monde
    LW.style.transform = camTf(c);
    set(glowCar, 0.85 * (1 - k)); set(pool, k * 0.85);
    floor.style.opacity = f3(0.9 - 0.4 * k);
    E.reset(C);
    // poussière : bande de l'embout (hook), lavage (ligne de partage), retour en front inverse (boucle)
    const nzK = Math.min(1, S(st, T.vac0, { f: 1.3, z: 1 }) / 0.985), xN = lerp(BAND.x0, BAND.x1, nzK);
    const lav = COUPS[0], xLav = E.lineAt(st, lav);
    const fr = loopK ? lerp(C.W, 0, sm(LOOP + 0.3, LOOP + 1.35, t)) : 0;
    if (loopK) { E.clip(C, C.L.poussiere, fr, C.W); bandBase.style.visibility = 'hidden'; bandBase.style.clipPath = ''; E.drawLine(C, fr, -30, 1262, sm(LOOP + 0.25, LOOP + 0.35, t) * (1 - sm(LOOP + 1.3, LOOP + 1.45, t)), sc); }
    else {
      const xs = Math.max(BAND.x0, xLav), hole = xN > xs + 1;
      E.clip(C, C.L.poussiere, xLav, C.W);
      bandBase.style.visibility = hole ? 'visible' : 'hidden';
      bandBase.style.clipPath = hole ? `polygon(${bandPoly(xs, xN).map(([x, y]) => `${f3(100 * x / C.W)}% ${f3(100 * y / C.H)}%`).join(',')})` : '';
      E.drawLine(C, xLav, lav.y0, lav.y1, E.lineOn(st, lav), sc);
    }
    E.wet(C, xLav, 0.55 * sm(lav.t0, lav.t0 + 0.08, st) * (1 - sm(lav.t0 + 0.9, lav.t0 + 1.9, st)) * (1 - loopK));
    // bande brillante derrière l'embout, jusqu'au lavage
    const bK = sm(T.vac0, T.vac0 + 0.06, st) * (1 - sm(lav.t0 + 0.1, lav.t0 + 0.5, st)) * (1 - loopK);
    if (bK > 0.002) {
      const xs = Math.max(BAND.x0, xLav);
      E.clip(C, band, 0, C.W, null);
      band.style.clipPath = xN > xs + 1 ? `polygon(${bandPoly(xs, xN).map(([x, y]) => `${f3(100 * x / C.W)}% ${f3(100 * y / C.H)}%`).join(',')})` : 'inset(50%)';
      const { deg, p: bp0, hw: bh } = BN;                   // reflet le long du haut de la bande, puis éclaircie qui sèche
      band.style.background = `linear-gradient(${deg}deg,transparent ${f3(bp0 - 0.78 * bh)}px,rgba(255,250,244,.85) ${f3(bp0 - 0.5 * bh)}px,rgba(255,250,244,.2) ${f3(bp0 - 0.2 * bh)}px,transparent ${f3(bp0 + 0.1 * bh)}px),`
        + `linear-gradient(90deg,rgba(255,240,225,.24) ${f3(100 * BAND.x0 / C.W)}%,rgba(255,246,236,.5) ${f3(100 * xN / C.W)}%)`;
    }
    set(band, bK);
    // les coups suivants (le temps du récit les défait au rembobinage)
    for (const cp of COUPS.slice(1)) if (cp.lay) E.split(st, C, { ...cp, layers: cp.lay, sc });
    // rayure : coup du récit, polish du verdict, retour avec la poussière
    const ra = COUPS[4], xR = E.lineAt(st, ra), POL = { t0: T.pol, x0: 1150, xm: 1356, x1: 1356, go: 0.24, hold: 0 };
    const xPol = t >= T.pol - 0.05 ? E.lineAt(t, POL) : 0;
    if (loopK) E.clip(C, C.L.rayure, fr, C.W);
    // sans découpe avant le coup : l'image 0 et la fin de la boucle peignent le calque de la même façon
    else { const xRc = Math.max(xR, xPol); E.clip(C, C.L.rayure, xRc > 1151 ? xRc : 0, C.W); E.drawLine(C, xR, ra.y0, ra.y1, E.lineOn(st, ra), sc); E.drawLine(C, xPol, ra.y0, ra.y1, t > T.pol - 0.05 ? E.lineOn(t, POL) : 0, sc); }
    E.sun(C, k, { rake: sm(T.sbas - 0.1, T.sbas + 1.1, st), rakeK: 0.85 * Math.sin(Math.PI * sm(T.sbas - 0.1, T.sbas + 1.1, st)) });
    // contour de lumière : entier à l'image 0, discret pendant le récit, retracé à la boucle
    let cK, cd = 1;
    if (loopK) { cd = sm(LOOP + 0.55, LOOP + 1.75, t); cK = sm(LOOP + 0.5, LOOP + 0.6, t); }
    else { const base = (1 - 0.62 * sm(T.fold, T.fold + 0.9, st)) * (1 - 0.75 * sm(1.15, 1.7, c.s)) * (1 - k); cK = t < REW[0] ? base : (1 - 0.62) * (1 - sm(REW[0], REW[0] + 0.35, t)) * (1 - sm(1.15, 1.7, c.s)); }
    for (const e of [cGlow, cLine]) e.setAttribute('stroke-dashoffset', f3(CC.len * (1 - cd)));
    cLine.setAttribute('opacity', f3(0.95 * cK)); cGlow.setAttribute('opacity', f3(0.8 * cK));
    const pt = cLine.getPointAtLength(CC.len * Math.min(cd, 0.9999));
    cPen.setAttribute('transform', `translate(${f3(pt.x)},${f3(pt.y)})`); cPen.setAttribute('opacity', f3(loopK * sm(LOOP + 0.52, LOOP + 0.6, t) * (1 - sm(LOOP + 1.65, LOOP + 1.85, t))));
    // l'embout d'aspirateur et la poussière qui part dedans
    const nzOn = sm(T.vac0 - 0.04, T.vac0 + 0.04, st) * (1 - sm(T.vac1 - 0.06, T.vac1 + 0.06, st)) * (1 - loopK);
    // display (et non visibility) : un outil caché ne compte plus dans le débord du SVG de la voiture, sinon sa position
    // (le flexible fait 1 400 px de photo) changeait la rastérisation de la voiture entre la fin et l'image 0
    noz.setAttribute('display', nzOn > 0.002 ? 'inline' : 'none'); noz.setAttribute('opacity', f3(nzOn));
    noz.setAttribute('transform', `translate(${f3(xN)},${f3(BAND.c(xN))}) rotate(-9) scale(${f3(lerp(1.3, 2.0, sm(T.vac0 - 0.04, T.vac0 + 0.1, st)))})`);
    for (const d of dust) {
      const u = clamp((xN - (d.x - 120)) / 120, 0, 1), on = nzOn > 0.01 && u > 0 && u < 1;
      d.e.setAttribute('display', on ? 'inline' : 'none'); if (!on) continue;
      const e = Math.pow(u, 1.7), tx = xN - 6, ty = BAND.c(xN) + d.j;
      d.e.setAttribute('cx', f3(lerp(d.x, tx, e))); d.e.setAttribute('cy', f3(lerp(d.y, ty, e) - 18 * Math.sin(Math.PI * u)));
      d.e.setAttribute('r', f3(d.r * (1 - 0.6 * u))); d.e.setAttribute('opacity', f3(sm(0, 0.12, u) * (1 - sm(0.8, 1, u)) * 0.95));
    }
    // l'ongle sur la rayure, puis l'éclat
    const nu = clamp((t - T.nail) / 0.46, 0, 1), ne = nu * nu * (3 - 2 * nu), NA = [1236, 566], NB = [1274, 700];
    const nOn = sm(T.nail - 0.12, T.nail, t) * (1 - sm(T.nail + 0.5, T.nail + 0.7, t)) * (1 - loopK);
    const nx = lerp(NA[0], NB[0], ne), ny = lerp(NA[1], NB[1], ne);
    nail.setAttribute('display', nOn > 0.002 ? 'inline' : 'none'); nail.setAttribute('opacity', f3(nOn)); nTrail.setAttribute('display', nOn > 0.002 ? 'inline' : 'none');
    nail.setAttribute('transform', `translate(${f3(nx)},${f3(ny)}) rotate(-24) translate(0,-16) scale(${f3(0.9 / (sc / 1.4))})`);
    nTrail.setAttribute('d', `M${f3(lerp(NA[0], NB[0], Math.max(0, ne - 0.35)))} ${f3(lerp(NA[1], NB[1], Math.max(0, ne - 0.35)))} L${f3(nx)} ${f3(ny)}`);
    nTrail.setAttribute('opacity', f3(0.85 * nOn * sm(0.02, 0.1, nu))); nTrail.setAttribute('stroke-width', f3(5 / (sc / 1.4)));
    const tw = Math.exp(-Math.max(0, t - T.nail - 0.2) * 7) * sm(T.nail + 0.16, T.nail + 0.22, t) * (1 - loopK);
    twk.setAttribute('display', tw > 0.01 ? 'inline' : 'none');
    twk.setAttribute('transform', `translate(1256,626) rotate(${f3(20 * (t - T.nail))}) scale(${f3((0.4 + 0.8 * tw) / (sc / 1.4))})`); twk.setAttribute('opacity', f3(tw));

    // voiles
    set(veil, sm(1.15, 1.7, c.s));                        // y compris à la boucle : « 2 000 → » se réécrit sur ce voile
    set(dimW, Math.max(0.74 * sm(T.click + 0.06, T.ann + 0.25, st), 0.6 * sm(REW[1] - 0.1, REW[1] + 0.3, t) * (1 - sm(T.dive2, T.dive2 + 0.5, t)) * (1 - loopK)));

    // A : le calcul
    const cA = camA(t);
    LA.style.transform = camTf(cA);
    const mv = tA > 0 ? S(tA, T.fold, { f: 1.25, z: 1 }) : 0;
    const swap = sm(T.fold + 0.46, T.fold + 0.58, tA);
    set(LA, loopK ? sm(LOOP, LOOP + 0.05, t) : 1 - swap);
    if (loopK) {                                          // « La prochaine fois que tu te dis… » : le calcul se réécrit
      writeW(W1, t, T.cw, 0.05); writeW(W2, t, T.cw + 0.42, 0.05); writeW(Q, t, T.cw + 0.78, 0.035, 20);
      arrow.setAttribute('stroke-dashoffset', f3(260 * (1 - S(t, T.cw + 0.26, P.pen))));
      arG.setAttribute('opacity', f3(sm(T.cw + 0.24, T.cw + 0.3, t)));
      for (const g of Cd.items) { g.g.setAttribute('opacity', '0'); }
    } else {
      fullWord(W1); fullWord(W2); arrow.setAttribute('stroke-dashoffset', '0'); arG.setAttribute('opacity', '1');
      // « telle quelle ? » : présent, puis effacé par la fente sur « trouve » ; « C'est donné. » s'écrit derrière
      Q.items.forEach((g) => {
        const tp = T.rw + 0.05 + 0.36 * (g.cx - Q.left) / Q.width, e = sm(tp, tp + 0.08, tA);
        g.stroke.setAttribute('opacity', '0'); g.fill.setAttribute('opacity', f3(1 - e)); g.g.setAttribute('opacity', '1');
        let tr = `translate(0,${f3(-22 * e)})`;
        if (g === Qq) { const dq = tA - T.q; if (dq > 0) tr += ` rotate(${f3(10 * Math.sin(dq * 21) * Math.exp(-dq * 3.2))},${f3(g.cx)},${f3(BASE2 - 30)})`; }
        g.g.setAttribute('transform', tr);
      });
      Cd.items.forEach((g, i) => {
        const ts = T.rw + 0.08 + 0.36 * (g.cx - Cd.left) / Cd.width, dr = S(tA, ts, P.draw), fi = S(tA, ts + 0.12, P.rise);
        g.stroke.setAttribute('stroke-dashoffset', f3(g.L * (1 - dr))); g.stroke.setAttribute('opacity', f3(sm(ts - 0.01, ts + 0.04, tA) * (1 - fi)));
        g.fill.setAttribute('opacity', f3(fi)); g.g.setAttribute('opacity', '1'); g.g.setAttribute('transform', `translate(0,${f3((1 - fi) * 22)})`);
      });
    }
    gOut.setAttribute('transform', `translate(0,${f3(-120 * mv)})`); gOut.setAttribute('opacity', f3(1 - sm(0.05, 0.45, mv)));
    // la lumière rallume « 2 000 », puis « 2 900 »
    const tSh = tA < T.sh2 - 0.2 ? T.sh1 : T.sh2, sx = lerp(-300, 1500, S(tA, tSh, { f: 0.85, z: 1 }));
    [[sx - 220, 0], [sx - 60, 0.85], [sx + 60, 0.85], [sx + 220, 0]].forEach(([x, o], i) => { shS[i].setAttribute('offset', f3(clamp(x / 1080, 0, 1))); shS[i].setAttribute('stop-opacity', f3(o)); });
    const sh1 = 0.55 * sm(T.sh1 - 0.04, T.sh1 + 0.06, tA) * (1 - sm(T.sh1 + 0.7, T.sh1 + 1.0, tA)), sh2 = 0.55 * sm(T.sh2 - 0.04, T.sh2 + 0.06, tA) * (1 - sm(T.sh2 + 0.8, T.sh2 + 1.1, tA));
    shine[0].setAttribute('opacity', f3(sh1)); shine[1].setAttribute('opacity', f3(sh2 * (1 - mv)));
    // « 2 900 » : gris et « 2 ?00 » sur « donné », puis repli vers le compteur (le « ? » revient à 9)
    const gr = sm(T.donne, T.donne + 0.25, tA) * (1 - sm(T.fold + 0.05, T.fold + 0.4, tA));
    const roll = 5 * Math.min(1, S(tA, T.donne - 0.02, { f: 1.9, z: 1 }) / 0.99) + Math.min(1, S(tA, T.fold + 0.04, { f: 1.7, z: 1 }) / 0.99);
    const rolling = roll > 0.002 && roll < 5.998 + (tA > T.fold ? 0 : 1);
    rollG.setAttribute('visibility', rolling && !loopK ? 'visible' : 'hidden');
    rollC.setAttribute('transform', `translate(0,${f3(-roll * RD)})`);
    const ink = [246, 239, 231], gry = [138, 128, 121];
    W2.items.forEach((g, i) => {
      g.fill.setAttribute('fill', mixC(ink, gry, gr));
      if (!loopK) g.fill.setAttribute('opacity', i === 1 && rolling ? '0' : '1');
      const tx = CELLX[i], ty = CT + 130, s = lerp(1, 128 / SZ, mv);
      g.wrap.setAttribute('transform', `translate(${f3(lerp(g.cx, tx, mv))},${f3(lerp(BASE, ty, mv))}) scale(${f3(s)}) translate(${f3(-g.cx)},${-BASE})`);
    });
    rollT.forEach((e, j) => { if (ROLL[j] !== '?') e.setAttribute('fill', mixC(ink, gry, gr)); });
    // la plume : « 2 000 », la flèche, « 2 900 », le « ? », plonge vers l'aile, remonte au « 9 », fente sur la phrase
    const PM = { f: 1.9, z: 1 };
    const [fx0, fy0] = toScreen(cam(T.vac0), ...E.at(C, BAND.x0, BAND.c(BAND.x0))), [fx1, fy1] = toScreen(cam(T.vac1), ...E.at(C, BAND.x1, BAND.c(BAND.x1)));
    const a0 = toA(camA(T.vac0), fx0, fy0), a1 = toA(camA(T.vac1), fx1, fy1);
    const qx = Q.left + Q.width, qy = BASE2 - 40;
    const pX = track(tA, [[0, W1.left - 40], [T.sh1, W1.left + W1.width + 10, PM], [T.arr, AR.x1, PM], [T.sh2, W2.left + W2.width + 20, PM], [T.q - 0.32, qx + 10, PM], [T.dive, a0[0], { f: 2.6, z: 1 }], [T.vac0 + 0.1, a1[0], { f: 1.3, z: 1 }], [T.vac1 + 0.02, g9.cx, { f: 2.8, z: 1 }]]);
    const pY = track(tA, [[0, BASE - SZ * 0.36], [T.sh1, BASE - SZ * 0.36, PM], [T.q - 0.32, qy, PM], [T.dive, a0[1], { f: 2.6, z: 1 }], [T.vac0 + 0.1, a1[1], { f: 1.3, z: 1 }], [T.vac1 + 0.02, BASE - SZ * 0.42, { f: 2.8, z: 1 }]]);
    pen.setAttribute('transform', `translate(${f3(pX)},${f3(pY)})`);
    const penOn = sm(T.sh1 - 0.08, T.sh1, tA) * (1 - sm(T.vac0 - 0.06, T.vac0 + 0.02, tA)) + sm(T.vac1 - 0.06, T.vac1 + 0.02, tA) * (1 - sm(T.donne + 0.04, T.donne + 0.12, tA));
    pen.setAttribute('opacity', f3(clamp(penOn, 0, 1) * (1 - loopK)));
    const slP = clamp((tA - T.rw - 0.05) / 0.4, 0, 1);
    slit.setAttribute('transform', `translate(${f3(lerp(Q.left - 30, Q.left + Q.width + 30, slP))},${BASE2})`);
    slit.setAttribute('opacity', f3(sm(T.rw + 0.03, T.rw + 0.08, tA) * (1 - sm(T.rw + 0.42, T.rw + 0.55, tA)) * (1 - loopK)));

    // H : compteur, repère, palettes
    const hudIn = sm(T.fold, T.fold + 0.05, st);
    const fuse = sm(T.big - 0.08, T.big + 0.22, st) * (t < REW[0] ? 1 : 0);        // le compteur se fond dans le « + 400 € »
    const rewK = t >= REW[0] && t < REW[1] + 0.6 ? 1 : 0;
    const toCard = sm(REW[1] - 0.12, REW[1] + 0.32, t);                             // il se replie dans le titre de la carte
    const hud = (t < REW[0] ? hudIn * (1 - fuse) : rewK * sm(REW[0] + 0.05, REW[0] + 0.2, t) * (1 - toCard)) * (1 - loopK);
    const hd = sm(T.fold + 0.6, T.fold + 1.6, t);
    const hc = { x: 540 + hd * noise(12, t * 0.3) * 3, y: FY + hd * noise(13, t * 0.3) * 3, s: 1, rx: hd * noise(14, t * 0.25) * 0.5, ry: hd * noise(15, t * 0.25) * 0.7 };
    if (rewK) { const s2 = 1 - 0.36 * toCard; hc.s = s2; hc.y = lerp(hc.y, 382 - (367 - FY) / s2, toCard); }   // le compteur (y 382) vient sur le titre (y 367)
    LH.style.transform = camTf(hc);
    set(LH, t < REW[0] ? hudIn * (t < LOOP ? 1 : 0) : rewK * (1 - toCard * 0.999));
    const v = price(st);
    const posU = v % 10, posT = (v / 10) % 10, posH = (Math.floor(v / 100) + sm(90, 100, v % 100)) % 10, posK = (Math.floor(v / 1000) + sm(990, 1000, v % 1000)) % 10;
    const keys = [posU, posT, posH, posK].map((p) => [[0, p]]);
    const tb = t < REW[0] ? st : T.fold + 2;
    paintCounter(Cn, tb, keys, [1, 1, 1, 1], (i) => ({ draw: S(tb, T.fold + 0.06 + i * 0.06, P.draw), glass: S(tb, T.fold + 0.2 + i * 0.06, P.heavy) }), hud);
    const digK = (t < REW[0] ? sm(T.fold + 0.46, T.fold + 0.58, st) : 1) * hud;
    Cn.cells.forEach((cc) => set(cc.d, digK));
    set(Cn.lab, hud);
    Cn.labL.forEach((s, i) => { const p = S(tb, T.fold + 0.3 + i * 0.04, P.rise); s.style.opacity = f3(p); s.style.transform = `translateY(${f3((1 - p) * 18)}px)`; });
    const imp = Math.max(0, ...TI.map((x) => Math.exp(-Math.max(0, st - x) * 5) * sm(x - 0.02, x + 0.03, st)), 1.2 * Math.exp(-Math.max(0, st - T.pose) * 4) * sm(T.pose - 0.02, T.pose + 0.04, st));
    set(glowH, hud * (0.25 + 0.6 * imp));
    const rp = S(st, T.fold + 0.55, P.rise);
    set(rep, rp * (1 - fuse) * (t < REW[0] ? 1 : 0) * (1 - loopK)); rep.style.transform = `translateY(${f3((1 - rp) * 16)}px)`;
    // palettes : SAMEDI · 13:00, l'horloge avance à chaque coup, puis jusqu'à 16:30, puis J+4 ; 13:10 au rembobinage
    const m = clockM(st), mi = Math.floor(m + 1e-6), hh = String(Math.floor(mi / 60)).padStart(2, '0'), mm = String(mi % 60).padStart(2, '0');
    const dmdt = Math.abs(clockM(st + 0.01) - clockM(st - 0.01)) / 0.02;
    const fIn = T.sam, fOut1 = S(st, T.j4, { f: 2.2, z: 1 });
    const palK = (t < REW[0] ? 1 - fuse : 1 - sm(REW[1] + 0.05, REW[1] + 0.3, t)) * (1 - loopK);
    paintFlaps(fl1, st, fIn, 0.05);
    const txt = ['S', 'A', 'M', 'E', 'D', 'I', hh[0], hh[1], ':', mm[0], mm[1]];
    const fr2 = [mi / 600, mi / 60, 0, mi / 10, mi];
    fl1.forEach((f, i) => {
      const p = S(st, fIn + i * 0.05, P.flip);
      if (p >= 0.72) f.s.textContent = txt[i];
      let rot = (1 - p) * 92;
      if (i >= 6 && i !== 8) { const ph = (fr2[i - 6] % 1); rot += sm(1, 6, dmdt) * (1 - Math.min(1, ph * 3)) * 70; }
      const o = S(st, T.j4 + i * 0.025, { f: 2.4, z: 1 });
      rot += -95 * o;
      f.d.style.transform = `perspective(700px) rotateX(${f3(rot)}deg)`;
      set(f.d, sm(0, 0.12, p) * (1 - sm(0.75, 0.95, o)) * palK);
    });
    set(dot, sm(fIn + 0.3, fIn + 0.4, st) * (1 - fOut1) * palK);
    paintFlaps(fl2, st, T.j4 + 0.16, 0.06);
    fl2.forEach((f) => set(f.d, (st > T.j4 + 0.1 ? +f.d.style.opacity : 0) * palK));

    // l'attente : la règle et le soleil dans le dos ; photo 1
    set(LTx, t < REW[0] ? 1 : 1 - sm(REW[0], REW[0] + 0.2, t));
    const hI = S(st, T.heure, P.rise), hO = sm(T.click, T.click + 0.25, st);
    set(heure, hI * (1 - hO)); heure.style.transform = `translateY(${f3((1 - hI) * 18 - 30 * hO)}px)`;
    const s1 = S(st, T.sbas, P.rise), s2 = S(st, T.sbas + 0.22, P.rise), sO = sm(T.vf - 0.1, T.vf + 0.15, st);
    set(sbas, 1 - sO); sbas.style.transform = `translateY(${f3(-28 * sO)}px)`;
    sb1.style.opacity = f3(s1); sb1.style.transform = `translateY(${f3((1 - s1) * 24)}px)`;
    sb2.style.opacity = f3(s2); sb2.style.transform = `translateY(${f3((1 - s2) * 24)}px)`;
    const l1 = S(st, T.lab1, P.rise), l1o = sm(T.click + 0.1, T.click + 0.35, st);
    set(lab1, l1 * (1 - l1o)); lab1.style.transform = `translateY(${f3((1 - l1) * 22 - 40 * l1o)}px)`;

    // N : les débits ; tout ce qui n'est pas « + 400 € » s'éteint pendant la chute
    const bigOff = 1 - sm(T.big - 0.05, T.big + 0.35, st) * (1 - sm(REW[0] - 0.05, REW[0] + 0.15, t));
    const stackOut = S(st, T.leaveN, { f: 1.7, z: 1 }), nGate = t < REW[1] ? 1 - sm(REW[1] - 0.25, REW[1] - 0.05, t) : 0;
    set(LN, (t < REW[0] ? 1 : nGate) * (1 - loopK) * bigOff);
    debs.forEach((d, i) => {
      const Td = TD[i], a = S(st, Td, P.card);
      let kk = 0; for (let j = i + 1; j < TD.length; j++) kk += S(st, TD[j], P.card);
      const o = sm(Td - 0.06, Td, st) * clamp(1 - 0.75 * Math.max(0, kk - 0.6), 0, 1) * (1 - sm(T.leaveN - 0.02, T.leaveN + 0.18, st));
      d.w.style.transform = `translate(${f3(150 + 1150 * (1 - a))}px,${f3(1236 - 46 * kk + 380 * stackOut)}px) rotate(${f3((1 - a) * -7)}deg) scale(${f3(1 - 0.06 * kk)})`;
      d.w.style.transformOrigin = '50% 0';
      d.w.style.filter = kk > 0.05 ? `brightness(${f3(1 - 0.25 * Math.min(1, kk))})` : '';
      set(d.w, o);
      if (o > 0.01) drawSeq(d.n.c, IMG[d.c.seq], Math.max(0, st - Td + 0.3));
    });
    sparks.forEach((sp, i) => {
      const a = TD[i] + 0.06, u = clamp((st - a) / 0.27, 0, 1), on = u > 0 && u < 1;
      sp.g.setAttribute('visibility', on ? 'visible' : 'hidden'); if (!on) return;
      const e = u * u * (3 - 2 * u), [x, y] = bez(e);
      sp.g.setAttribute('transform', `translate(${f3(x)},${f3(y)})`); sp.g.setAttribute('opacity', f3(sm(0, 0.08, u) * (1 - sm(0.88, 1, u))));
      sp.tr.forEach((c2, j) => { const [x2, y2] = bez(Math.max(0, e - 0.07 * (j + 1))); c2.setAttribute('cx', f3(x2 - x)); c2.setAttribute('cy', f3(y2 - y)); });
    });
    const ga = S(st, T.gag, P.card), gOut2 = S(st, TD[3] - 0.05, P.push);
    gag.style.transform = `translate(${f3(240 - 1100 * (1 - ga) - 700 * gOut2)}px,${f3(990 - 260 * gOut2)}px) rotate(${f3(-3 + (1 - ga) * 8 - 8 * gOut2)}deg)`;
    set(gag, sm(T.gag - 0.05, T.gag + 0.01, st) * (1 - sm(0.3, 0.7, gOut2)));
    if (gag.style.visibility === 'visible') drawSeq(gagC, IMG.pieces, Math.max(0, st - T.gag + 0.2));

    // S : le viseur, l'annonce, les messages, l'offre, le virement
    set(LS, (t < REW[0] ? 1 : nGate) * (1 - loopK) * bigOff);
    const annIn = S(st, T.ann - 0.08, P.card), annUp = S(st, T.bubble - 0.05, P.card), annC = S(st, T.credit - 0.05, P.card);
    // quand l'offre arrive, l'annonce se resserre vers son bord haut (qui ne bouge pas : J+4 est juste au-dessus) : son
    // prix « 3 330 € » remonte de 55 px, puis de 33 px au virement, et reste lisible au-dessus de la bulle (round 1)
    const sB = 0.92 + 0.08 * annIn, sF = sB * (1 - 0.16 * annUp - 0.06 * annC), H2 = (ANN.ch + 128) / 2;
    ann.style.transform = `perspective(1500px) translateY(${f3((1 - annIn) * 360 + H2 * (sF - sB) - 29 * annUp)}px) rotateX(${f3((1 - annIn) * 26)}deg) scale(${f3(sF)})`;
    set(ann, sm(T.ann - 0.1, T.ann - 0.02, st));
    let q = PE.quads[0];
    if (ann.style.visibility === 'visible') q = drawPhone(Math.max(0, st - T.ann + 0.3));
    const ash = sm(T.ann + 0.25, T.ann + 0.3, st) * (1 - sm(T.ann + 0.3, T.ann + 0.75, st));
    set(annSh, ash); annSh.style.background = `linear-gradient(110deg,transparent ${f3(lerp(-30, 120, sm(T.ann + 0.25, T.ann + 0.75, st)) - 12)}%,rgba(255,236,220,.35) ${f3(lerp(-30, 120, sm(T.ann + 0.25, T.ann + 0.75, st)))}%,transparent ${f3(lerp(-30, 120, sm(T.ann + 0.25, T.ann + 0.75, st)) + 12)}%)`;
    // viseur : se referme sur la voiture, déclic, puis ses coins vont se poser sur l'écran du téléphone
    const box = [[CAR.left, CAR.top], [CAR.left + CAR.w, CAR.top], [CAR.left + CAR.w, CAR.top + C.h], [CAR.left, CAR.top + C.h]].map(([x, y]) => toScreen(c, x, y));
    const mg = 30, carR = [Math.max(140, box[0][0] - mg), box[0][1] - mg, Math.min(940, box[2][0] + mg), box[2][1] + mg / 2];   // colonne 140 → 940
    const BIG = [140, 650, 940, 1480], vc = S(st, T.vf, { f: 1.2, z: 1 }), snap = Math.exp(-Math.max(0, st - T.click) * 9) * sm(T.click - 0.01, T.click + 0.02, st);
    let R = BIG.map((b, i) => lerp(b, carR[i], vc)); const cxR = (R[0] + R[2]) / 2, cyR = (R[1] + R[3]) / 2;
    R = [cxR + (R[0] - cxR) * (1 - 0.04 * snap), cyR + (R[1] - cyR) * (1 - 0.04 * snap), cxR + (R[2] - cxR) * (1 - 0.04 * snap), cyR + (R[3] - cyR) * (1 - 0.04 * snap)];
    const rect = [[R[0], R[1]], [R[2], R[1]], [R[2], R[3]], [R[0], R[3]]];
    const sxA = ANN.cw / 720, syA = ANN.ch / 406, annY = (1 - annIn) * 360 - 46 * annUp;
    const quad = q.map(([x, y]) => [ANN.left + ANN.sx + x * sxA, ANN.top + ANN.sy + y * syA + annY]);
    const fly = S(st, T.click + 0.08, { f: 1.5, z: 1 });
    const vOn = sm(T.vf - 0.04, T.vf + 0.06, st) * (1 - sm(T.ann + 0.3, T.ann + 0.5, st));
    const arm = lerp(70, 30, fly);
    brk.forEach((g, i) => {
      g.setAttribute('visibility', vOn > 0.002 ? 'visible' : 'hidden'); if (vOn < 0.002) return;
      const p = [0, 1].map((j) => lerp(rect[i][j], quad[i][j], fly)), nx2 = [0, 1].map((j) => lerp(rect[(i + 1) % 4][j], quad[(i + 1) % 4][j], fly)), pv = [0, 1].map((j) => lerp(rect[(i + 3) % 4][j], quad[(i + 3) % 4][j], fly));
      const dir = (a2) => { const dx = a2[0] - p[0], dy = a2[1] - p[1], l = Math.hypot(dx, dy) || 1; return [p[0] + dx / l * arm, p[1] + dy / l * arm]; };
      const [ax, ay] = dir(pv), [bx2, by2] = dir(nx2);
      const d = `M${f3(ax)} ${f3(ay)} L${f3(p[0])} ${f3(p[1])} L${f3(bx2)} ${f3(by2)}`;
      g.childNodes.forEach((e) => e.setAttribute('d', d)); g.setAttribute('opacity', f3(vOn));
    });
    msgs.forEach((d, i) => {
      const Tm = i ? T.msg2 : T.msg1, a = S(st, Tm, P.card), o2 = S(st, T.bubble - 0.02, P.push);
      d.style.transform = `translate(${f3(-(1 - a) * 640)}px,${f3((i ? 976 : 896) + annY - 120 * o2)}px) scale(${f3(0.92 + 0.08 * a)})`;
      d.style.transformOrigin = '0 50%';
      set(d, sm(Tm - 0.04, Tm + 0.02, st) * (1 - sm(0.2, 0.6, o2)));
    });
    const bz = st > T.bubble && st < T.bubble + 0.5 ? Math.sin((st - T.bubble) * 90) * 6 * (1 - (st - T.bubble) / 0.5) : 0, bi = S(st, T.bubble, P.card), bU = S(st, T.credit - 0.05, P.card);
    bubble.style.transform = `translate(${f3(bz + (1 - bi) * 700)}px,${f3(-40 * bU)}px) scale(${f3(0.9 + 0.1 * bi)})`;
    set(bubble, sm(T.bubble - 0.06, T.bubble + 0.02, st));
    const ca = S(st, T.credit, P.card);
    credit.d.style.transform = `translate(${f3(150 + 1150 * (1 - ca))}px,1236px) rotate(${f3((1 - ca) * -7)}deg)`; set(credit.d, sm(T.credit - 0.02, T.credit + 0.04, st));
    if (credit.d.style.visibility === 'visible') drawSeq(credit.c, IMG.cles, st - T.credit + 0.2);

    // la chute : le compteur se fond dans « + 400 € », la seule pause, « Ton samedi le mieux payé. »
    const bigK = sm(T.big - 0.05, T.big + 0.25, st) * (1 - sm(REW[0] - 0.05, REW[0] + 0.2, t)) * (1 - loopK);
    set(dim, bigK * 0.92);
    set(L4, bigK);
    const s9 = S(st, T.big, { f: 1.3, z: 1 }), push = sm(T.big + 0.4, REW[0], st);
    big4.style.transform = `translateY(${f3(-300 * (1 - s9))}px) scale(${f3((0.42 + 0.58 * s9) * (1 + 0.05 * push))})`;
    L4.style.transform = `translateY(${f3(-160 * sm(REW[0] - 0.05, REW[0] + 0.2, t))}px)`;
    set(glow4, 0.4 + 0.6 * S(st, T.big + 0.12, P.heavy));
    const lb = S(st, T.big + 0.1, P.rise); lab4.style.opacity = f3(lb); lab4.style.transform = `translateY(${f3((1 - lb) * 20)}px)`;
    const pp = S(st, T.prepa, P.rise); prepa.style.opacity = f3(pp); prepa.style.transform = `translateY(${f3((1 - pp) * 26)}px)`;
    writeW(pay1, st, T.pay1, 0.04, 20); writeW(pay2, st, T.pay2, 0.04, 20);

    // le renversement : la carte, ses trois lignes, la barre ; l'ongle et le verdict
    const cIn = S(t, T.card, P.card), cmp = S(t, T.dive2, { f: 1.2, z: 1 }), cOut = loopK ? S(t, LOOP, P.push) : 0;
    set(LC, sm(T.card - 0.05, T.card + 0.03, t) * (1 - sm(LOOP + 0.1, LOOP + 0.45, t)));
    const cdr = sm(T.card, T.card + 0.8, t);                                       // dérive lente : la carte ne se fige pas
    // parallaxe : la carte tourne en sens inverse de l'orbite (− 0,5 ×) et monte de 12 px à chaque règle (la voiture, 6)
    const cRy = -0.5 * (c.ry - 1) * cIn * (1 - cmp), cNy = -12 * lineNudge(t) * (1 - cmp);
    cardW.style.transform = `translateY(${f3((1 - cIn) * 240 - 64 * cmp + 90 * cOut + cNy - 10 * cdr * (1 - cmp) * noise(31, t * 0.35))}px) perspective(1500px) rotateX(${f3((1 - cIn) * 24 + 1.6 * cdr * noise(32, t * 0.3))}deg) rotateY(${f3(cRy + 2.2 * cdr * noise(33, t * 0.27))}deg) scale(${f3((0.94 + 0.06 * cIn) * (1 - 0.12 * cmp) * (1 - 0.45 * cOut) * (1 + 0.012 * cdr * (1 - cmp)))})`;
    const tt1 = S(t, T.ceux + 0.1, P.rise), tt2 = S(t, T.pas, P.rise);
    cT1.style.opacity = f3(tt1); cT1.style.transform = `translateY(${f3((1 - tt1) * 22)}px)`;
    cT2.style.opacity = f3(tt2); cT2.style.transform = `translateY(${f3((1 - tt2) * 26)}px)`; cT2.style.filter = `blur(${f3((1 - tt2) * 6)}px)`;
    rule.style.transform = `scaleX(${f3(S(t, T.pas + 0.1, P.pen))})`;
    // la carte grandit ligne par ligne (le texte entre une fois le conteneur ouvert) : jamais de verre vide
    card.style.height = `${f3(150 + 108 * S(t, T.l[0] - 0.12, P.card) + 100 * S(t, T.l[1] - 0.12, P.card) + 112 * S(t, T.l[2] - 0.12, P.card))}px`;
    lines.forEach((L, i) => {
      const a = S(t, T.l[i], P.rise), b = S(t, T.l[i] + 0.14, P.rise);
      L.s1.style.opacity = f3(a); L.s1.style.transform = `translateY(${f3((1 - a) * 24)}px)`;
      L.s2.style.opacity = f3(b); L.s2.style.transform = `translateY(${f3((1 - b) * 24)}px)`;
    });
    const [lx, lw] = l3x(), ly = 452 + 200 + 40, xp = S(t, T.x, P.pen);
    const xd = `M${f3(lx - 6)} ${ly + 4} C ${f3(lx + lw * 0.35)} ${ly - 8}, ${f3(lx + lw * 0.7)} ${ly + 10}, ${f3(lx + lw + 8)} ${ly - 4} M${f3(lx + lw + 26)} ${ly - 22} L${f3(lx + lw + 58)} ${ly + 14} M${f3(lx + lw + 58)} ${ly - 22} L${f3(lx + lw + 26)} ${ly + 14}`;
    xL.setAttribute('d', xd); xG.setAttribute('d', xd);
    const xLen = lw + 14 + 2 * 48 + 40;
    for (const e of [xL, xG]) { e.setAttribute('stroke-dasharray', `${f3(xLen)} ${f3(xLen)}`); e.setAttribute('stroke-dashoffset', f3(xLen * (1 - xp))); e.setAttribute('opacity', f3((e === xL ? 1 : 0.6) * sm(T.x - 0.02, T.x + 0.03, t))); }
    const xpt = xL.getPointAtLength(xLen * Math.min(0.999, xp) * 0.98);
    xPen.setAttribute('transform', `translate(${f3(xpt.x)},${f3(xpt.y)})`); xPen.setAttribute('opacity', f3(sm(T.x - 0.02, T.x + 0.04, t) * (1 - sm(T.x + 0.55, T.x + 0.8, t))));
    lines[2].s2.style.color = `rgba(246,239,231,${f3(0.9 - 0.4 * sm(T.x + 0.1, T.x + 0.4, t))})`;
    const vI = S(t, T.verd, P.rise), vI2 = S(t, T.verd + 0.24, P.rise), vO = loopK ? S(t, LOOP - 0.02, P.push) : 0;
    verd.style.transform = `translateY(${f3(120 * vO)}px)`;
    set(veilB, sm(T.verd - 0.2, T.verd + 0.2, t) * (1 - sm(LOOP, LOOP + 0.4, t)));
    vd1.style.opacity = f3(vI); vd1.style.transform = `translateY(${f3((1 - vI) * 24)}px)`;
    vd2.style.opacity = f3(vI2); vd2.style.transform = `translateY(${f3((1 - vI2) * 26)}px)`; vd2.style.filter = `blur(${f3((1 - vI2) * 6)}px)`;
    const pa = S(t, T.verd + 0.3, P.card), pl = sm(T.pol, T.pol + 0.12, t), pc = S(t, T.carr, P.pen);
    for (const [e, d2] of [[pPol, 0], [pCar, 0.08]]) { const a2 = S(t, T.verd + 0.3 + d2, P.card); e.style.transform = `translateY(${f3((1 - a2) * 60 + 140 * vO)}px) scale(${f3(0.9 + 0.1 * a2)})`; set(e, sm(T.verd + 0.28 + d2, T.verd + 0.34 + d2, t) * (1 - sm(0.2, 0.6, vO))); }
    pPol.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,.45),0 0 0 ${f3(3 * pl)}px rgba(255,179,138,${f3(0.95 * pl)}),0 0 ${f3(36 * pl)}px rgba(255,110,40,${f3(0.55 * pl)})`;
    pPol.style.color = pl > 0.5 ? '#ffd2b8' : '#f6efe7';
    pcL.setAttribute('stroke-dashoffset', f3(420 * (1 - pc)));
    pCar.style.opacity = f3(+pCar.style.opacity * (1 - 0.35 * sm(T.carr + 0.1, T.carr + 0.4, t)));

    // mention, effets
    const mI = S(st, T.fold + 0.7, P.rise), mO = loopK ? sm(LOOP, LOOP + 0.35, t) : 0;
    set(mention, mI * (1 - mO)); mention.style.transform = `translateY(${f3((1 - mI) * 12 - 24 * mO)}px)`;
    set(rewFx, sm(REW[0], REW[0] + 0.12, t) * (1 - sm(REW[1] - 0.15, REW[1], t)) * 0.9);
    rewFx.style.transform = `translateY(${f3((t * 900) % 6)}px)`;
    set(flash, 0.75 * Math.exp(-Math.max(0, st - T.click) * 11) * sm(T.click - 0.01, T.click + 0.015, st) * (t < REW[0] ? 1 : 0)
      + 0.3 * Math.exp(-Math.max(0, t - T.big) * 7) * sm(T.big - 0.01, T.big + 0.03, t) * (t < REW[0] ? 1 : 0));
    const gi = t > DUR - 0.12 ? 0 : Math.floor(t * 24);
    grain.style.transform = `translate(${(gi * 53) % 211}px,${(gi * 97) % 173}px)`;
  }

  // flou de bougé : obturateur ouvert sur les gestes rapides
  const WIN = [[T.dive, T.vac0 + 0.1, 0.6], [T.vac0, T.vac1, 0.45], [T.vac1, T.donne, 0.5], [T.fold, T.fold + 0.6, 0.6], [TI[0], TI[5] + 0.5, 0.35],
    [T.click, T.ann + 0.45, 0.6], [T.big - 0.05, T.big + 0.45, 0.6], [REW[0], REW[1], 0.75], [T.card - 0.05, T.card + 0.4, 0.5], [T.dive2, T.dive2 + 0.7, 0.5],
    [T.nail, T.nail + 0.45, 0.5], [LOOP, LOOP + 1.4, 0.5]];
  COUPS.forEach((cp) => { WIN.push([cp.t0, cp.t0 + 0.25, 0.6]); WIN.push([cp.t0 + 0.5, cp.t0 + 0.75, 0.6]); });
  [...TD, T.gag, T.msg1, T.msg2, T.bubble, T.credit].forEach((x) => WIN.push([x - 0.04, x + 0.35, 0.6]));
  const fast = (t) => { let s = 0; for (const [a, b, v] of WIN) s = Math.max(s, v * sm(a - 0.05, a + 0.05, t) * (1 - sm(b - 0.05, b + 0.05, t))); return s; };
  window.shutter = (t) => Math.max(0.12, fast(t));
  window.samples = (t) => (fast(t) > 0.3 ? 4 : 1);
  // temps des événements, pour poser les bruitages (scripts/events.mjs → film-mo11/events.json)
  window.EVENTS = {
    ...T, coups: COUPS.map((cp) => ({ key: cp.key, t0: cp.t0, hold: [cp.t0 + 0.2, cp.t0 + 0.5], end: cp.t0 + 0.7 })),
    deb: TD, imp: TI, pose: T.pose, sparks: TD.map((x) => x + 0.06), gag: T.gag, leaveN: T.leaveN,
    rew: REW, stFrom: ST_FROM, stTo: ST_TO, loop: LOOP, dur: DUR, front: [LOOP + 0.3, LOOP + 1.35], contour: [LOOP + 0.55, LOOP + 1.75],
    calc: [T.cw, T.cw + 0.42, T.cw + 0.78], provisional: !!VT.provisional,
  };
  window.seek = (t) => paint(t >= DUR ? t - DUR : t);
  paint(0);
  window.filmReady = true;
})();
