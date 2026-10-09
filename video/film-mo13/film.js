// MO13 « Avec 1 500 € » (série recette 47, épisode 6). Contrat : window.seek(t) peint la frame t, sans état entre les frames.
// window.shutter(t) / window.samples(t) : flou de bougé au rendu (MB=4). window.EVENTS : temps des gestes pour le son.
// Minutage lu dans la voix (audio/vo-mo13/vo-timing.json, scripts/vo-mo13.py ; provisoire tant qu'ElevenLabs est bloqué) :
// chaque geste suit son mot. Construit sur lib/kit47.js (lu, jamais modifié) et film-mo13/kit-mo13.js (modules nouveaux).
// La variable de l'épisode : trois reventes enchaînées sur un escalier de verre ; le compteur COMPTE suit l'argent du
// compte (il tombe à l'achat, descend aux frais, remonte du montant exact de chaque virement).
// Fabrication : un backdrop-filter par groupe (plaque du compteur, carte de devant, plaque des palettes ou carte finale),
// fonds flous peints dans de petits canvas, aucun filter CSS sur un grand calque ni sur une voiture qui bouge.
(async function () {
  const { track, clamp, lerp, noise } = Motion;
  const { f3, S, sm, P, el, sv, set, defs, word, writeWord, fullWord, notif, load, loadSeqs, drawSeq } = Kit47;
  const K = Kit13;
  const stage = document.getElementById('stage');
  const HB = new URLSearchParams(location.search).get('hook') === 'B';

  // ---------- minutage : la voix ----------
  const VT = await (await fetch('../audio/vo-mo13/vo-timing.json')).json();
  const DUR = HB ? VT.hookB.dur : VT.dur, LOOP = HB ? VT.hookB.loop : VT.loop;
  const FO = DUR - LOOP;                          // durée du repli vers l'image 0 (A : 0,9 s ; B : 0,5 s)
  const M = (k) => VT.marks[k].t, ME = (k) => VT.marks[k].end;
  const MB = (k) => VT.hookB.marks[k].t, MBE = (k) => VT.hookB.marks[k].end;
  const LE = (k) => VT.lines.find((l) => l.key === k).end;          // fin d'une réplique
  const T = {};
  // l'ouverture (A : son calcul, puis la petite rouge d'en face ; B : le résultat d'abord)
  if (!HB) {
    T.q = 0.2;                                   // la plume repasse le « ? »
    T.sh = M('b1500') - 0.2;                     // la lumière passe sur « 1 500 » dans le brouillon
    T.dix = M('dix') + 0.02;                     // puis sur « 10 000 », sur « Dix mille »
    T.focus = M('petite') - 0.2;                 // mise au point sur la 206
    T.contour = M('rouge') - 0.35;
    T.tag = M('demande') + 0.04;                 // l'étiquette « À VENDRE · 1 400 € »
    T.mention = M('demande') + 0.14;
    T.trem = M('b1400') + 0.1;                   // « 8 500 € ? » tremble
  } else {
    T.q = 99; T.sh = MB('b1500B') - 0.15; T.sh2 = MB('b3100B') - 0.1;
    T.focus = MB('voituresB') - 0.1; T.contour = T.focus + 0.17; T.tag = MBE('b3100B') + 0.25; T.mention = -1; T.trem = 99;
  }
  T.out = ME('b1400') + 0.3;                     // le calcul se replie, « 1 500 » devient le compteur, la 206 monte sur la marche 1
  T.flap1 = T.out + 0.02; T.hud = T.out + 0.05;
  // marche 1 : le prix max, puis trois débits (le dernier est le gag)
  T.strike1 = M('gardes') + 0.08; T.pay1 = T.strike1 + 0.25; T.neu1 = T.pay1 + 0.32; T.res = M('cote') + 0.1; T.max1 = T.neu1 + 0.42;
  T.d1 = M('assurance') - 0.05; T.d2 = M('carte') - 0.05; T.gag = M('essence') - 0.05; T.toi = T.gag + 0.5;
  // vente 1, la caméra monte, marche 2
  T.sem3 = M('elle') - 0.45; T.vir1 = M('part') - 0.05; T.up1 = M('b1900') - 0.05; T.edge1 = M('b1900') + 0.15;
  T.leave1 = LE('part') + 0.33; T.rise1 = T.leave1 + 0.05; T.arr2 = T.leave1 + 0.25; T.brake2 = T.arr2 + 0.5;
  T.strike2 = M('premiere') - 0.4; T.pay2 = M('premiere') - 0.15; T.neu2 = T.pay2 + 0.32;
  // le ticket de la marche 2 suit l'achat (0,32 s) pour rester lisible ≈ 0,5 s avant la bulle de SEMAINE 7
  T.tk2 = Math.min(M('paie') + 0.05, T.pay2 + 0.32); T.sem7 = T.tk2 + 0.7; T.vir2 = T.sem7 + 0.45; T.up2 = T.vir2 + 0.25; T.edge2 = T.vir2 + 0.12;
  T.leave2 = T.vir2 + 0.24; T.rise2 = T.leave2 + 0.05; T.arr3 = T.leave2 + 0.25; T.brake3 = T.arr3 + 0.5;
  T.strike3 = T.arr3 + 0.5; T.pay3 = T.strike3 + 0.25; T.neu3 = T.pay3 + 0.32; T.tk3 = T.pay3 + 0.15;
  // la tentation : SEMAINE 8 → 11, une annonce bute sur le compte
  T.sem8 = M('une') - 0.15; T.ann = M('une') + 0.15; T.bump = M('passe') + 0.4; T.une = T.bump + 0.5; T.annOut = T.une + 0.3;
  // SEMAINE 9 et 10 tombent avant que l'annonce ne couvre les palettes, SEMAINE 11 quand elle les découvre
  T.sem9 = T.sem8 + 0.27; T.sem10 = T.sem9 + 0.3; T.sem11 = T.annOut + 0.3;
  T.msg = [0, 1, 2, 3, 4].map((i) => T.annOut + 0.3 + i * 0.15); T.sem12 = T.msg[4] + 0.1;
  // la vente 3, la chute
  T.bub3 = M('budget') - 0.55; T.vir3 = M('budget') - 0.05; T.edge3 = T.vir3 + 0.12; T.up3 = M('budget') + 0.2;
  T.pull = T.up3 + 0.1; T.leave3 = T.vir3 + 0.6; T.big = ME('b3100') - 0.1; T.stop = T.big + 0.3;
  T.att = M('et'); T.att2 = M('dixmille') - 0.1;
  // le rembobinage, la carte
  const REW = [LE('att') + 0.23, LE('att') + 1.53]; const ST_TO = 5.2;
  T.card = REW[1]; T.l1 = M('vente') + 0.06; T.l2 = T.l1 + 0.5; T.l3 = T.l1 + 1.0;
  T.step4 = M('quatrieme'); T.l4 = M('quatrieme') + 0.25; T.claque = M('b2500') - 0.02;
  // marches, dans l'ordre : quand elles apparaissent (pâles), quand une voiture s'y pose, quand l'arête se trace
  const story = (t) => {
    if (t < REW[0]) return t;
    if (t < REW[1]) { const u = (t - REW[0]) / (REW[1] - REW[0]); const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; return lerp(REW[0], ST_TO, e); }
    return ST_TO;
  };

  await Promise.all([
    document.fonts.load('700 150px Clash'), document.fonts.load('600 50px Clash'), document.fonts.load('500 22px Satoshi'),
    document.fonts.load('700 34px Satoshi'), document.fonts.load('italic 104px Fraunces'),
  ]);

  // ---------- images ----------
  const SEQ = await (await fetch('seq.json')).json();
  const IMG = await loadSeqs('seq', SEQ);
  const im206 = await load('../assets/photos-mo13/car-206-mo13.png'), im206f = await load('../assets/photos-mo13/car-206-mo13-flou.png');
  const imMeg = await load('../assets/photos-mo13/car-megane2.png'), imFie = await load('../assets/photos-mo13/car-fiesta6.png');

  // ---------- fonds ----------
  // le puits de lumière est peint dans le fond lui-même (un calque de 800 × 2300 px en mode screen coûtait ≈ 0,3 s de CPU par image)
  const bgW = el('div', 'L', stage, 'background:linear-gradient(90deg,transparent 12.96%,rgba(255,150,90,.07) 35.19%,rgba(255,190,150,.11) 50%,rgba(255,150,90,.07) 64.81%,transparent 87.04%),radial-gradient(70% 50% at 50% 56%,#1d1520,#08070a 75%)');
  const semCv = K.blurCanvas(bgW, 160, 284, 'left:-60px;top:-80px;width:1200px;height:2130px;opacity:0');     // le calendrier de l'attente
  const cool = el('div', 'L', bgW, 'background:radial-gradient(80% 60% at 50% 40%,rgba(60,90,170,.30),rgba(15,20,50,.25))');
  const bgD = el('div', 'L', stage, 'background:#08070a');                                                  // fond chaud du calcul refait
  const calcCv = K.blurCanvas(bgD, 160, 284, 'left:-80px;top:-100px;width:1240px;height:2200px;opacity:.65');
  el('div', 'abs', bgD, 'left:-80px;top:-100px;width:1240px;height:2200px;background:radial-gradient(48% 40% at 50% 50%,rgba(90,40,12,.22),rgba(8,7,10,.78) 72%,#08070a)');
  const glowD = el('div', 'glow', bgD, 'left:140px;top:560px;width:800px;height:820px;background:radial-gradient(closest-side,rgba(255,120,50,.30),transparent)');
  const bgA = el('div', 'L', stage);                                                                        // la rue d'en face, le soir
  const rueCv = K.blurCanvas(bgA, 216, 384, 'left:-60px;top:-107px;width:1200px;height:2133px');
  el('div', 'abs', bgA, 'left:0;top:0;width:1080px;height:1920px;background:linear-gradient(rgba(8,7,10,.62),rgba(8,7,10,.5) 45%,rgba(8,7,10,.38) 70%,rgba(8,7,10,.55))');
  const glowA = el('div', 'glow', bgA, 'left:150px;top:520px;width:780px;height:640px;background:radial-gradient(closest-side,rgba(255,100,40,.42),transparent)');

  // ---------- le monde : l'escalier de verre et les trois voitures (caméra : translation verticale pure) ----------
  const LW = el('div', 'W', stage);
  const STEPX = [432, 540, 648, 756], STEPY = [1310, 1010, 710, 410];
  const LAB = ['1 200 → 1 900 ✓', '1 550 → 2 450 ✓', '2 000 → 2 950 ✓', null];
  const glows = STEPX.map((x, i) => el('div', 'glow', LW, `left:${x - 420}px;top:${STEPY[i] - 230}px;width:840px;height:330px;background:radial-gradient(closest-side,rgba(255,110,40,.42),transparent)`));
  const steps = [3, 2, 1, 0].map((i) => K.glassStep(LW, { X: STEPX[i], Y: STEPY[i], id: 'm' + i, label: LAB[i] })).reverse();
  const ta4 = word(steps[3].txt, 'Ta 4e', 'italic 500 100px Fraunces', 100, 0, 64 + 104, { italic: true, fill: 'url(#qgw)', strokeColor: '#ffb38a', sw: 1.8 });
  defs(steps[3].s, 'w');
  // voitures : boîte à l'échelle de la marche (206 : 700 px), même échelle réelle (repères : facteur_vs_206)
  const S206 = 700 / 1801;
  const mkCar = (img, R, C, fac, k, opts = {}) => {
    const s = S206 * fac, w = img.width * s, h = img.height * s;
    const fx = R.sol.avant.px[0] * s, fy = R.sol.avant.px[1] * s, rx = R.sol.arriere.px[0] * s, ry = R.sol.arriere.px[1] * s;
    const mid = [(fx + rx) / 2, (fy + ry) / 2];
    const pose = { x: STEPX[k] - mid[0] + 90, y: STEPY[k] - mid[1] };            // le centre du dessus de la marche sous les roues
    const box = el('div', 'abs', LW, `width:${f3(w)}px;height:${f3(h)}px;transform-origin:0 0`);
    const refl = K.reflection(img, w); refl.className = 'abs';
    refl.setAttribute('style', `left:0;top:${f3(Math.max(fy, ry) - 6)}px;width:${f3(w)}px;height:${f3(h)}px;opacity:.13;-webkit-mask-image:linear-gradient(#000,transparent 34%)`);
    box.appendChild(refl);
    const shad = [[fx, fy, 170, 34], [rx, ry, 150, 28], [(fx + rx) / 2, (fy + ry) / 2 + 6, w * 0.62, 70]].map(([x, y, ww, hh]) => el('div', 'abs', box, `left:${f3(x - ww / 2)}px;top:${f3(y - hh / 2)}px;width:${f3(ww)}px;height:${f3(hh)}px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.78),transparent)`));
    const blurI = opts.flou ? el('img', 'abs', box, `left:0;top:0;width:${f3(w)}px;height:${f3(h)}px`) : null; if (blurI) blurI.src = opts.flou.src;
    const im = document.createElement('canvas'); im.width = Math.round(w * 1.05); im.height = Math.round(h * 1.05); im.className = 'abs';
    { const x = im.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, im.width, im.height); }
    im.setAttribute('style', `left:0;top:0;width:${f3(w)}px;height:${f3(h)}px`); box.appendChild(im);
    const silC = K.silhouette(img, Math.round(w)); silC.className = 'abs'; silC.setAttribute('style', `left:0;top:0;width:${f3(w)}px;height:${f3(h)}px`); box.appendChild(silC);
    const csv = sv('svg', { width: w, height: h, viewBox: `0 0 ${C.w} ${C.h}`, style: 'position:absolute;left:0;top:0;overflow:visible' }, box); defs(csv, 'c' + k);
    // lueur du contour sans filtre SVG : trois traits translucides ; halo de la plume en dégradé radial
    const pgc = sv('radialGradient', { id: 'pgc' + k }, csv.firstChild); sv('stop', { offset: 0, 'stop-color': '#ff7a3a', 'stop-opacity': 0.75 }, pgc); sv('stop', { offset: 0.45, 'stop-color': '#ff7a3a', 'stop-opacity': 0.35 }, pgc); sv('stop', { offset: 1, 'stop-color': '#ff7a3a', 'stop-opacity': 0 }, pgc);
    const cGlow = sv('g', {}, csv);
    const cGlowP = [[28, 0.12], [16, 0.22], [8, 0.4]].map(([sw, o]) => sv('path', { d: C.d, fill: 'none', stroke: '#ff7a3a', 'stroke-width': sw, 'stroke-opacity': o, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': `${C.len} ${C.len}` }, cGlow));
    const cLine = sv('path', { d: C.d, fill: 'none', stroke: '#ffe2cf', 'stroke-width': 3.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': `${C.len} ${C.len}` }, csv);
    const cPen = sv('g', {}, csv); sv('circle', { r: 34, fill: `url(#pgc${k})` }, cPen); sv('circle', { r: 7, fill: '#fff' }, cPen);
    const trails = [[0.55, 5], [0.68, 3], [0.8, 2]].map(([fy2, hh]) => el('div', 'trail', LW, `height:${hh}px`));
    const mir = [R.retro.px[0] * s, R.retro.px[1] * s];
    return { img, s, w, h, box, refl, shad, blurI, im, silC, csv, cGlow, cGlowP, cLine, cPen, C, trails, mir, pose, front: [fx, fy], k };
  };
  const cars = [
    mkCar(im206, window.CAR_206_MO13_REPERES, window.CAR_206_MO13_CONTOUR, 1, 0, { flou: im206f }),
    mkCar(imMeg, window.CAR_MEGANE2_REPERES, window.CAR_MEGANE2_CONTOUR, window.CAR_MEGANE2_REPERES.echelle.facteur_vs_206, 1),
    mkCar(imFie, window.CAR_FIESTA6_REPERES, window.CAR_FIESTA6_CONTOUR, window.CAR_FIESTA6_REPERES.echelle.facteur_vs_206, 2),
  ];
  // la 206 garée en face (image 0) : plus petite, centrée, roues au-dessus de y = 1480
  const STREET = { k: 0.8 }; STREET.x = 540 - cars[0].w * STREET.k / 2; STREET.y = 1404 - ((cars[0].front[1] + window.CAR_206_MO13_REPERES.sol.arriere.px[1] * cars[0].s) / 2) * STREET.k;
  // étiquettes en papier (dans le monde, à taille fixe : ≥ 260 px de large, chiffres ≥ 70 px)
  const tags = [K.paperTag(LW, { old: '1 400 €', neu: '1 200 € ✓', max: true }), K.paperTag(LW, { old: '1 800 €', neu: '1 550 € ✓' }), K.paperTag(LW, { old: '2 300 €', neu: '2 000 € ✓' })];
  tags.forEach((g) => {
    const ow = g.oldE.offsetWidth; g.ow = ow;
    g.pen2 = sv('g', {}, g.pen.parentNode); sv('circle', { r: 24, fill: '#ff7a3a', opacity: 0.55 }, g.pen2); sv('circle', { r: 6, fill: '#fff' }, g.pen2);
    const st = g.stP.parentNode; g.oldE.appendChild(st); st.setAttribute('width', ow + 10); st.setAttribute('preserveAspectRatio', 'none'); st.style.left = '-6px'; st.style.top = '18px';
  });
  const CARV = [
    { strike: T.strike1, neu: T.neu1, max: T.max1, arr: -1, brake: -1, leave: T.leave1 },
    { strike: T.strike2, neu: T.neu2, arr: T.arr2, brake: T.brake2, leave: T.leave2 },
    { strike: T.strike3, neu: T.neu3, arr: T.arr3, brake: T.brake3, leave: T.leave3 },
  ];

  // ---------- A : le calcul (image 0 déjà composée) ----------
  const LA = el('div', 'L', stage);
  const svgA = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LA);
  defs(svgA, 'a');
  const sheenA = sv('linearGradient', { id: 'sheenA', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1080, y2: 0 }, svgA.firstChild);
  const shS = [0, 0, 0, 0].map(() => sv('stop', { 'stop-color': '#fff' }, sheenA));
  const LC = el('div', 'L', stage);                              // « 1 500 » qui monte devenir le compteur
  const svgC = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LC);
  let A = {};
  const mcv = document.createElement('canvas').getContext('2d');
  const mw = (str, font, size) => { mcv.font = font; let x = 0; for (const ch of str) x += ch === ' ' ? size * 0.24 : mcv.measureText(ch).width; return x; };
  if (!HB) {
    // « 10 000 − 1 500 » en brouillon, « Il te manque », « 8 500 € ? » géant
    const w1 = mw('10 000 −', '600 64px Clash', 64), w2 = mw('1 500', '600 64px Clash', 64), dL = 540 - (w1 + 64 * 0.24 + w2) / 2;
    A.dr1 = word(svgA, '10 000 −', '600 64px Clash', 64, dL, 616, { align: 'left', fill: 'rgba(246,239,231,.58)', sw: 1.4 });
    A.dr2 = word(svgC, '1 500', '600 64px Clash', 64, dL + w1 + 64 * 0.24, 616, { align: 'left', fill: 'rgba(246,239,231,.58)', sw: 1.4 });
    A.sh = sv('g', {}, svgC); for (const g of A.dr2.items) { const s = sv('text', { x: g.left, y: 616, 'font-family': 'Clash', 'font-weight': 600, 'font-size': 64, fill: 'url(#sheenA)' }, A.sh); s.textContent = g.ch; }
    A.il = word(svgA, 'Il te manque', '700 120px Clash', 120, 540, 806);
    A.big = sv('g', {}, svgA);
    // encre mesurée sur l'image 0 (seuil de luminance) : ≤ 760 px, « ? » compris (à 196 px, la ligne faisait 830 px)
    const w85 = mw('8 500', '700 176px Clash', 176), wE = mw('€', '700 104px Clash', 104), wQ = 78;   // « ? » italique : encre ≈ 78 px
    const tot = w85 + 10 + wE + 14 + wQ, L0 = 540 - tot / 2 - 13;     // l'italique du « ? » déborde à droite : recentré sur l'encre
    A.n85 = word(A.big, '8 500', '700 176px Clash', 176, L0, 1040, { align: 'left' });
    A.eur = word(A.big, '€', '700 104px Clash', 104, L0 + w85 + 10, 1040, { align: 'left' });
    A.q = word(A.big, '?', 'italic 500 164px Fraunces', 164, L0 + w85 + 10 + wE + 14, 1040, { align: 'left', italic: true, fill: 'url(#qga)', strokeColor: '#ffb38a', sw: 2.2 });
    A.q.items[0].g.setAttribute('filter', 'url(#gla)');
    A.qPen = sv('g', {}, svgA); sv('circle', { r: 26, fill: '#ff7a3a', opacity: 0.6, filter: 'url(#softa)' }, A.qPen); sv('circle', { r: 8, fill: '#fff' }, A.qPen);
    A.inkW = tot;
    A.mv = A.dr2; A.mvEuro = null; A.mvSize = 64;
  } else {
    // B : « 1 500 € → 3 100 € », le résultat d'abord
    A.w1 = word(svgC, '1 500 €', '700 176px Clash', 176, 540, 716);
    A.sh = sv('g', {}, svgC); for (const g of A.w1.items) { const s = sv('text', { x: g.left, y: 716, 'font-family': 'Clash', 'font-weight': 700, 'font-size': 176, fill: 'url(#sheenA)' }, A.sh); s.textContent = g.ch; }
    A.w2 = word(svgA, '3 100 €', '700 176px Clash', 176, 540, 1046);
    const sheenB = sv('linearGradient', { id: 'sheenB', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1080, y2: 0 }, svgA.firstChild);
    A.shS2 = [0, 0, 0, 0].map(() => sv('stop', { 'stop-color': '#fff' }, sheenB));
    A.sh2 = sv('g', {}, svgA); for (const g of A.w2.items) { const s = sv('text', { x: g.left, y: 1046, 'font-family': 'Clash', 'font-weight': 700, 'font-size': 176, fill: 'url(#sheenB)' }, A.sh2); s.textContent = g.ch; }
    const arG = sv('g', { transform: 'translate(510,752)', filter: 'url(#gla)' }, svgA);
    sv('path', { d: 'M30 6 V74 M8 52 L30 78 L52 52', stroke: '#ffb38a', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arG);
    A.mv = A.w1; A.mvSize = 176;
  }

  // ---------- HUD : compteur COMPTE (une plaque de verre), réserve, mention, palettes ----------
  const LH = el('div', 'L', stage);
  const VALS = [1500, 300, 260, 108, 50, 1950, 400, 50, 2500, 500, 150, 3100];
  const TV = [0, T.pay1, T.d1 + 0.25, T.d2 + 0.25, T.toi, T.up1, T.pay2, T.tk2 + 0.12, T.up2, T.pay3, T.tk3 + 0.12, T.up3];
  const PRE = VALS.map((v, i) => (i === VALS.length - 1 ? { f: 0.85, z: 1 } : P.roll));
  const RK = K.rollKeys2(VALS, TV, 4, PRE);
  const C = K.plateCounter(LH, { top: 300, w: 108, h: 150, gap: 10, fs: 112, efs: 92, lo: RK.lo, hi: RK.hi, labelTop: 246 });
  const visKeys = [1000, 100].map((th) => { const k = [[0, VALS[0] >= th ? 1 : 0]]; for (let i = 1; i < VALS.length; i++) { const a = VALS[i - 1] >= th, b = VALS[i] >= th; if (a !== b) k.push([TV[i] + (b ? 0 : 0.12), b ? 1 : 0, P.heavy]); } return k; });
  const svgH = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LH); defs(svgH, 'h');
  const resG = sv('g', {}, svgH); const resW = word(resG, 'réserve', 'italic 500 44px Fraunces', 44, 0, 0, { align: 'left', italic: true, fill: 'url(#qgh)', strokeColor: '#ffb38a', sw: 1.4 });
  const RESW = [[T.res, T.up1], [T.pay2 + 0.45, T.up2], [T.pay3 + 0.45, T.up3]];
  const F = K.plateFlaps(LH, { y: 536, w: 70, h: 88, fs: 60, g: 6, gap: 22 });
  const FEV = [[T.flap1, 'MARCHE', '1'], [T.sem3, 'SEMAINE', '3'], [T.sem7, 'SEMAINE', '7'], [T.sem8, 'SEMAINE', '8'], [T.sem9, 'SEMAINE', '9'], [T.sem10, 'SEMAINE', '10'], [T.sem11, 'SEMAINE', '11'], [T.sem12, 'SEMAINE', '12']];
  const mention = el('div', 'abs', stage, 'left:0;width:1080px;top:478px;text-align:center;font:500 24px Satoshi;color:rgba(246,239,231,.55);white-space:nowrap'); mention.textContent = 'Exemple · prix moyens constatés';

  // ---------- N : débits, gag, bulles, virements, tickets, l'annonce, les messages ----------
  const LN = el('div', 'L', stage);
  const NY = 660;
  const mkN = (title, amt, seq, o = {}) => { const w = el('div', 'abs', LN, 'width:780px;height:184px;transform-origin:50% 0'); const n = notif(w, title, amt, o); n.d.style.left = '0'; n.d.style.top = '0'; return { w, n, seq }; };
  const D = [mkN('Assurance · 1 mois', '40,00', 'assur'), mkN('Carte grise · 4 CV', '152,00', 'signe'), mkN('Essence · elle était sur la réserve', '58,00', 'essence')];
  K.fit(D[2].n.d.querySelector('.ti'), 496);
  const toi = el('div', 'stamp serif2', D[2].w, 'left:522px;top:100px'); toi.textContent = 'toi aussi';   // à droite du montant : le « € » reste lisible
  const mkBubble = (txt) => { const b = el('div', 'glass', LN, 'left:0;top:0;width:780px;padding:28px 36px;border-radius:40px 40px 40px 12px;transform-origin:0 50%'); el('div', 'sheen', b);
    el('div', '', b, 'font:500 24px Satoshi;color:rgba(246,239,231,.7);margin-bottom:8px').textContent = 'Acheteur · message';
    el('div', '', b, 'font:700 48px Satoshi;line-height:1.2;white-space:nowrap').innerHTML = txt; return b; };
  const bub = [mkBubble('1 900 et je la prends.'), mkBubble('2 450 et je la prends.'), mkBubble('2 950 et je la prends.')];
  const vir = [mkN('Virement reçu', '1 900,00', 'cles', { sign: '+' }), mkN('Virement reçu', '2 450,00', 'contact', { sign: '+' }), mkN('Virement reçu', '2 950,00', 'cles', { sign: '+' })];
  const mkT = (lines, total, seq) => { const w = el('div', 'abs', LN, 'width:780px;transform-origin:50% 0'); const n = K.ticket(w, lines, total); n.d.style.left = '0'; n.d.style.top = '0'; n.ls.forEach((l) => K.fit(l, 520)); return { w, n, seq }; };
  const tk = [mkT(['Assurance <b>40</b> · Vidange <b>55</b>', 'Carte grise · 7 CV <b>255</b>'], '350', 'moteur'),
    mkT(['Assurance <b>40</b> · 2 pneus <b>100</b>', 'Contre-visite <b>24</b> · Carte grise · 5 CV <b>186</b>'], '350', 'pneu')];
  const ann = mkN('Une affaire ?', '', null, { app: 'Annonce · maintenant' });
  ann.n.d.querySelector('.am').innerHTML = '1 600 €';
  { const sil = K.silhouette(im206, 300, '#4a4048', '#1e1820'); const cx = ann.n.c.getContext('2d'); const g = cx.createLinearGradient(0, 0, 0, 276); g.addColorStop(0, '#2a2430'); g.addColorStop(1, '#141018'); cx.fillStyle = g; cx.fillRect(0, 0, 372, 276); cx.save(); cx.translate(372, 0); cx.scale(-1, 1); cx.drawImage(sil, 36, 70, 300, 300 * sil.height / sil.width); cx.restore(); }
  const une = el('div', 'stamp serif2', ann.w, 'left:470px;top:64px'); une.textContent = 'une à la fois';
  // « Toujours dispo ? » : une pile de notifications ; la plus récente devant, les anciennes passent derrière et ne montrent que leur bord
  const msgs = T.msg.map((_, i) => { const d = el('div', 'glass msg', LN, `left:${150 + [0, 46, 18, 64, 30][i]}px;top:0;font-size:44px;transform-origin:50% 0`); d.textContent = 'Toujours dispo ?'; return d; });
  // le montant qui file du compteur vers l'étiquette
  const LX = el('div', 'L', stage);
  const chips = ['1 200 €', '1 550 €', '2 000 €'].map((s) => { const c = el('div', 'chip', LX); c.innerHTML = '− ' + s; return c; });

  // ---------- la chute : « 3 100 € » géant, « Tu attendais d'avoir 10 000. » ----------
  const dim = el('div', 'L', stage, 'background:rgba(8,7,10,.8);pointer-events:none');
  const L9 = el('div', 'L', stage);
  const glow9 = el('div', 'glow', L9, 'left:150px;top:470px;width:780px;height:620px;background:radial-gradient(closest-side,rgba(255,100,40,.55),transparent)');
  const big9 = el('div', 'abs', L9, 'left:0;width:1080px;top:610px;text-align:center;font:700 234px Clash;line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:#f6efe7;white-space:nowrap;transform-origin:540px 120px;text-shadow:0 1px 0 #d8cfc6,0 2px 0 #bfb5ab,0 3px 0 #a79c92,0 4px 0 #8f8479,0 5px 0 #786d63,0 6px 0 #61574e,0 16px 30px rgba(0,0,0,.6)');
  big9.innerHTML = '3<i style="display:inline-block;width:.24em"></i>100<span style="font-size:130px;margin-left:14px">€</span>';
  const svg9 = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, L9); defs(svg9, '9');
  const att1 = word(svg9, "Tu attendais d'avoir", '600 76px Clash', 76, 540, 1010);
  const att2 = word(svg9, '10 000.', 'italic 500 132px Fraunces', 132, 540, 1162, { italic: true, fill: 'url(#qg9)', strokeColor: '#ffb38a', sw: 2 });

  // ---------- le calcul refait : une carte, quatre lignes ----------
  const LD = el('div', 'L', stage);
  const card = el('div', 'glass card', LD, 'top:582px;height:846px'); el('div', 'sheen', card);
  const svgD = sv('svg', { width: 860, height: 846, viewBox: '0 0 860 846', style: 'position:absolute;left:0;top:0;overflow:visible' }, card); defs(svgD, 'd');
  const hd1 = word(svgD, 'budget − réserve =', '600 46px Clash', 46, 52, 96, { align: 'left', fill: 'rgba(246,239,231,.86)', sw: 1.4 });
  const hd2 = word(svgD, 'prix max', 'italic 500 60px Fraunces', 60, 52 + hd1.width + 14, 98, { align: 'left', italic: true, fill: 'url(#qgd)', strokeColor: '#ffb38a', sw: 1.4 });
  const sub = el('div', 'abs', card, 'left:52px;top:122px;font:500 28px Satoshi;color:rgba(246,239,231,.66);white-space:nowrap'); sub.textContent = 'réserve = budget ÷ 5, arrondie à la centaine';
  const rule = (y) => el('div', 'abs', card, `left:52px;top:${y}px;width:756px;height:2px;background:linear-gradient(90deg,rgba(255,255,255,.04),rgba(255,255,255,.28),rgba(255,255,255,.04));transform-origin:0 50%`);
  const rules = [rule(178), rule(566)];
  const LINES = [['1 500 − 300 =', '1 200', 'frais 250 ✓'], ['1 950 − 400 =', '1 550', 'frais 350 ✓'], ['2 500 − 500 =', '2 000', 'frais 350 ✓']];
  const lines = LINES.map(([l, r, f], i) => {
    const y = 262 + i * 118;
    const wl = word(svgD, l, '700 64px Clash', 64, 52, y, { align: 'left', sw: 1.6 });
    const wr = word(svgD, r, '700 64px Clash', 64, 808, y, { align: 'right', fill: '#ffd2b8', sw: 1.6 });
    const fr = el('div', 'abs', card, `left:0;width:808px;top:${y + 14}px;text-align:right;font:500 26px Satoshi;color:rgba(246,239,231,.62);white-space:nowrap`);
    fr.innerHTML = f.replace('✓', '<span style="color:#ff8a4c">✓</span>');
    return { wl, wr, fr };
  });
  const l4 = word(svgD, '3 100 − 600 =', '700 64px Clash', 64, 52, 650, { align: 'left', sw: 1.6 });
  const resRow = el('div', 'abs', card, 'left:60px;top:676px;width:736px;display:flex;justify-content:space-between;align-items:baseline;white-space:nowrap;transform-origin:50% 60%');
  // « prix max » et « 2 500 € » : au moins 40 px d'écart (à 76 / 116 px, ils se touchaient presque)
  const resMax = el('span', 'serif', resRow, 'font-size:72px;padding:.05em .14em .12em .3em;margin-left:-.3em'); resMax.textContent = 'prix max';
  const resV = el('span', '', resRow, 'font:700 108px Clash;letter-spacing:-.02em'); resV.innerHTML = '2<i style="display:inline-block;width:.24em"></i>500 €';
  const dM = el('div', 'abs', card, 'left:0;width:860px;top:806px;text-align:center;font:500 22px Satoshi;color:rgba(246,239,231,.5);white-space:nowrap'); dM.textContent = 'Exemple · prix moyens constatés';

  const rewFx = el('div', 'L', stage, 'background:repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 2px,transparent 2px 6px);mix-blend-mode:screen');
  const flash = el('div', 'L', stage, 'background:radial-gradient(60% 45% at 50% 50%,#fff1e6,rgba(255,140,80,.6) 45%,transparent 75%);mix-blend-mode:screen');
  const grain = el('div', '', stage); grain.id = 'grain'; el('div', '', stage).id = 'vign';
  { // grain : le bruit de MO5 et MO9 (feTurbulence, graine 9, tuile de 256 px), tiré une fois dans un canvas au chargement.
    // Le premier essai (bruit gris à forte amplitude) était 2 à 3 fois plus fort que celui de MO9 et coûtait ≈ 0,8 s par image.
    const svgN = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`;
    const gi = await load('data:image/svg+xml;utf8,' + svgN);
    const g = document.createElement('canvas'); g.width = g.height = 256; g.getContext('2d').drawImage(gi, 0, 0, 256, 256);
    grain.style.backgroundImage = `url(${g.toDataURL()})`;
  }
  // ordre des couches : fond du monde, fond chaud, rue, monde, calcul, « 1 500 » qui monte, HUD, notifications, montants, voile, 3 100, carte
  stage.insertBefore(bgW, stage.firstChild); stage.insertBefore(bgD, bgW.nextSibling); stage.insertBefore(bgA, bgD.nextSibling);
  stage.insertBefore(LW, bgA.nextSibling); stage.insertBefore(LA, LW.nextSibling); stage.insertBefore(LC, LA.nextSibling);
  stage.insertBefore(LH, LC.nextSibling); stage.insertBefore(LN, LH.nextSibling);
  stage.insertBefore(LX, LN.nextSibling); stage.insertBefore(dim, LX.nextSibling); stage.insertBefore(mention, dim.nextSibling); stage.insertBefore(L9, mention.nextSibling); stage.insertBefore(LD, L9.nextSibling);

  // ---------- caméras ----------
  const tf = (c, z = 0, extra = '') => `perspective(1700px) translateZ(${f3(c.z)}px) rotateX(${f3(c.rx)}deg) rotateY(${f3(c.ry)}deg) translate(${f3(-c.x)}px,${f3(-c.y)}px)${z ? ` translateZ(${f3(z)}px)` : ''} ${extra}`;
  // A : avance lente vers le calcul, glisse vers le « ? »
  // pose de l'image 0 presque neutre : le texte y est mesuré (encre dans la colonne 140 → 940, centrée sur x = 540)
  const camA = (t) => ({
    rx: track(t, [[0, 3], [0.3, 2, { f: 0.5, z: 1 }], [2.4, 1, { f: 0.35, z: 1 }]]) + (noise(1, t * 0.45) - noise(1, 0)) * 0.4,
    ry: track(t, [[0, 0], [0.2, -1.5, { f: 0.45, z: 1 }], [2.4, 1.5, { f: 0.3, z: 1 }]]) + (noise(2, t * 0.4) - noise(2, 0)) * 0.5,
    z: track(t, [[0, 0], [0.2, -24, { f: 0.4, z: 1 }], [2.4, 18, { f: 0.35, z: 1 }]]),
    x: track(t, [[0, 0], [0.2, 6, { f: 0.4, z: 1 }], [2.4, 0, { f: 0.35, z: 1 }]]),
    y: track(t, [[0, 0], [0.2, 8, { f: 0.4, z: 1 }], [2.4, 20, { f: 0.35, z: 1 }]]),
  });
  // H : le HUD, une respiration permanente (petite : il reste dans la bande sûre)
  const camH = (t) => ({ rx: 3 + noise(5, t * 0.4) * 0.5, ry: noise(6, t * 0.35) * 0.9, z: 0, x: noise(7, t * 0.3) * 5, y: noise(8, t * 0.3) * 4 });
  // monde : point visé (x, y) amené en (540, 1310), échelle s ; montée d'une marche par vente, recul pour la chute
  const CAMR = { f: 0.95, z: 1 }, CAMP = { f: 0.5, z: 1 };
  const OV = { s: 0.56, x: 594, y: 860 + 300 / 0.56 };
  const RV = { s: 0.62, x: STEPX[3] - 50 / 0.62, y: STEPY[3] - (400 - 1310) / 0.62 };
  const camS = (st, tA) => ({
    x: track(st, [[0, 540], [T.pull, OV.x, CAMP]]) + noise(11, tA * 0.3) * 5,
    y: track(st, [[0, 1310], [T.rise1, 1010, CAMR], [T.rise2, 710, CAMR], [T.pull, OV.y, CAMP]]) + noise(12, tA * 0.28) * 7 - 14 * (S(st, T.out, { f: 0.3, z: 1 }) - S(st, T.pull, CAMP)),
    s: track(st, [[0, 1], [T.focus, 1.04, { f: 0.8, z: 1 }], [T.out, 1, { f: 0.7, z: 1 }], [T.pull, OV.s, CAMP]]) + 0.006 * noise(13, tA * 0.25)
      + 0.03 * (S(st, T.out + 0.6, { f: 0.14, z: 1 }) - S(st, T.rise1, CAMR)) + 0.03 * (S(st, T.rise1 + 0.6, { f: 0.2, z: 1 }) - S(st, T.rise2, CAMR))
      + 0.03 * (S(st, T.rise2 + 0.6, { f: 0.14, z: 1 }) - S(st, T.pull, CAMP)),
  });
  // F : la carte, une orbite lente
  const f0 = REW[1] - 0.15;
  // La carte se pose (ressorts), puis la caméra ne fait plus que glisser à l'écran : une carte qui change d'échelle ou
  // d'angle à chaque image se repeint en entier (≈ 2 s de CPU par image mesurées le 9 octobre), une carte qui glisse non.
  const camF = (t) => (t > f0 + 2.4 ? { rx: 2.5, ry: 2, z: 20, x: -4, y: 10 } : {   // posée : valeurs exactes (le reste du ressort, < 0,1 %, ferait repeindre la carte)
    rx: track(t, [[f0, 5], [f0, 2.5, { f: 0.7, z: 1 }]]), ry: track(t, [[f0, -5], [f0, 2, { f: 0.6, z: 1 }]]),
    z: track(t, [[f0, -60], [f0, 20, { f: 0.7, z: 1 }]]), x: track(t, [[f0, 14], [f0, -4, { f: 0.6, z: 1 }]]), y: track(t, [[f0, -50], [f0, 10, { f: 0.6, z: 1 }]]),
  });
  const driftF = (t) => [noise(9, t * 0.3) * 7, noise(10, t * 0.25) * 6 - 5 * Math.max(0, t - f0)];

  // ---------- outils ----------
  const swing = (st, ev) => ev.reduce((a, [t0, amp]) => (st > t0 ? a + amp * Math.exp(-3.2 * (st - t0)) * Math.sin(2 * Math.PI * 1.25 * (st - t0)) : a), 0);
  const win = (st, W) => Math.max(0, ...W.map(([a, b]) => sm(a, a + 0.15, st) * (1 - sm(b - 0.1, b + 0.05, st))));
  const shine = (stops, sx) => { [[sx - 260, 0], [sx - 60, 0.85], [sx + 60, 0.85], [sx + 260, 0]].forEach(([x, o], i) => { stops[i].setAttribute('offset', f3(clamp(x / 1080, 0, 1))); stops[i].setAttribute('stop-opacity', f3(o)); }); };
  const ink = (w, k) => K.fullWord(w, k);

  // ---------- la frame t ----------
  function paint(t) {
    const st = story(t);
    const tA = t >= LOOP ? 0 : t;                          // l'ouverture revient dans son état de l'image 0
    const inRew = t >= REW[0];
    const back = t >= LOOP ? sm(LOOP + 0.3 * FO, DUR - 0.06, t) : 0;    // retour vers l'image 0, une fois la carte partie
    const out = t >= LOOP ? 0 : S(t, T.out, P.heavy);
    const showA = t < LOOP ? 1 - sm(T.out, T.out + 0.3, t) : back;
    const cA = camA(tA);
    if (t >= LOOP) { const u = sm(LOOP, DUR - 0.02, t); cA.z += 160 * (1 - u); cA.ry += -5 * (1 - u); cA.y += -40 * (1 - u); }

    // fonds
    const street = t < LOOP ? 1 - sm(T.out + 0.05, T.out + 0.6, t) : back;
    set(bgA, street);
    const vt = t >= LOOP ? 1.5 + t - DUR + 1 / 60 + 1e-4 : 1.5 + t;       // la rue : même image de la vidéo au début et à la fin (1e-4 : l'arrondi de t ne doit pas tomber sur l'image d'avant)
    if (street > 0.002) K.paintSeq(rueCv, IMG.rue, vt, 'blur(2px) brightness(.8) saturate(1.1)');
    const push = 1 + 0.04 * S(tA, T.focus, { f: 0.8, z: 1 }) * (t < LOOP ? 1 - S(t, T.out, { f: 0.7, z: 1 }) : 1);
    if (street > 0.002) rueCv.style.transform = `translate(${f3(noise(7, tA * 0.3) * 14)}px,${f3(noise(8, tA * 0.3) * 14)}px) scale(${f3(push)})`;
    rueCv.style.transformOrigin = '540px 1400px';
    set(glowA, (0.45 + 0.4 * S(tA, 0.5, P.heavy)) * showA);
    const world = t < LOOP ? sm(T.out, T.out + 0.5, t) : 1 - sm(LOOP, LOOP + 0.55 * FO, t);
    set(bgW, world);
    const coolK = sm(T.sem8 - 0.1, T.sem8 + 0.5, st) * (1 - sm(T.msg[0] - 0.1, T.msg[0] + 0.5, st));
    set(cool, coolK * 0.7); set(semCv, coolK * 0.3);
    if (coolK > 0.01) K.paintSeq(semCv, IMG.semaines, st - T.sem8 + 0.5, 'blur(2px) brightness(.42) saturate(.5)');
    const dIn = sm(REW[1] - 0.35, REW[1] + 0.25, t) * (t < LOOP ? 1 : 1 - sm(LOOP + 0.1 * FO, LOOP + 0.78 * FO, t));
    set(bgD, dIn);
    if (dIn > 0.01) K.paintSeq(calcCv, IMG.calc, t - REW[1] + 0.4, 'blur(3px) brightness(.5) saturate(.8) sepia(.55)');
    set(glowD, dIn * (0.3 + 0.35 * S(t, T.claque, P.heavy)));

    // le monde : caméra
    let cw = camS(t >= LOOP ? 0 : st, tA);
    // pendant la carte, l'escalier se pose et ne bouge plus (c'est la carte qui glisse devant lui : parallaxe, et l'escalier
    // n'est plus repeint à chaque image)
    if (t >= REW[1] - 0.25 && t < LOOP) { let w = S(t, REW[1] - 0.25, { f: 0.8, z: 1 }); if (w > 0.9999) w = 1; cw = { x: lerp(cw.x, RV.x, w), y: lerp(cw.y, RV.y, w), s: lerp(cw.s, RV.s, w) }; }
    if (t >= LOOP) {   // l'escalier se replie (il descend et rétrécit), puis la caméra revient sur la rue, quand plus rien ne s'y voit
      const u = sm(LOOP, LOOP + 0.5 * FO, t), w = 1 - sm(LOOP + 0.51 * FO, LOOP + 0.62 * FO, t);
      const rv = { x: RV.x, y: RV.y - 260 * u, s: RV.s * (1 - 0.18 * u) };
      cw = { x: lerp(cw.x, rv.x, w), y: lerp(cw.y, rv.y, w), s: lerp(cw.s, rv.s, w) };
    }
    LW.style.transform = `translate(540px,1310px) scale(${f3(cw.s)}) translate(${f3(-cw.x)}px,${f3(-cw.y)}px)`;
    const W2S = (x, y) => [540 + (x - cw.x) * cw.s, 1310 + (y - cw.y) * cw.s];
    const fold = t >= LOOP ? 1 - sm(LOOP, LOOP + 0.5 * FO, t) : 1;
    const big = sm(T.big, T.big + 0.3, st);                 // « 3 100 € » plein écran (temps du récit : il se défait au rembobinage)
    const dimK = big * (0.78 + 0.12 * sm(T.att - 0.1, T.att + 0.4, st));   // l'escalier s'efface un peu plus sous « Tu attendais d'avoir 10 000. »

    // marches : pâles quand elles attendent, allumées quand une voiture s'y pose, arête tracée à la vente
    const SV = [
      { on: sm(T.out, T.out + 0.5, st), lit: sm(T.out, T.out + 0.5, st), edge: T.edge1 },
      { on: sm(T.vir1, T.vir1 + 0.5, st), lit: sm(T.arr2 + 0.2, T.brake2, st), edge: T.edge2 },
      { on: sm(T.vir2, T.vir2 + 0.5, st), lit: sm(T.arr3 + 0.2, T.brake3, st), edge: T.edge3 },
      { on: sm(T.vir3, T.vir3 + 0.5, st), lit: t >= REW[1] ? sm(T.step4 - 0.05, T.step4 + 0.25, t) : 0, edge: null },
    ];
    steps.forEach((s, i) => {
      const v = SV[i], rise = (1 - S(st, T.out, { f: 1.2, z: 1 })) * (i === 0 ? 1 : 0);
      const inD = t >= REW[1] - 0.3 && t < LOOP + 1 ? sm(REW[1] - 0.3, REW[1] + 0.3, t) : 0;
      const after = inD > 0 ? (i === 3 ? 1 : lerp(1, 0.6, inD)) : 1;
      const on = Math.max(v.on, inD), lt = Math.max(v.lit, i < 3 ? inD : 0);
      // la marche quittée reste à l'écran, en retrait, sous la barre des 1 480 px (décor, sans texte : son inscription s'efface avant) ;
      // elle ne disparaît qu'au bord de l'image
      const [, sy] = W2S(s.X, s.Y);
      const o = (0.28 + 0.72 * lt) * on * fold * after * (i === 0 ? Math.max(sm(T.out, T.out + 0.35, st), inD) : 1) * (1 - 0.45 * sm(1490, 1640, sy)) * (1 - sm(1840, 1990, sy));
      set(s.s, o);
      s.g.setAttribute('transform', `translate(${s.a + 70},${f3(s.b + 70 + 160 * rise)})`);
      const te = t >= REW[1] ? [T.l1, T.l2, T.l3, T.step4][i] : (i === 3 ? 99 : v.edge), tt = t >= REW[1] ? t : st;
      const ep = S(tt, te, P.pen);
      for (const e of [s.edge, ...s.glowP]) e.setAttribute('stroke-dashoffset', f3(s.L * (1 - ep)));
      set(s.glow, sm(te - 0.02, te + 0.05, tt) * 0.9); set(s.edge, sm(te - 0.02, te + 0.05, tt));   // invisible = hors du calcul
      const pt = s.edge.getPointAtLength(s.L * clamp(ep, 0, 0.9999));
      s.pen.setAttribute('transform', `translate(${f3(pt.x)},${f3(pt.y)})`);
      set(s.pen, sm(te - 0.02, te + 0.06, tt) * (1 - sm(te + 0.55, te + 0.8, tt)));
      // l'inscription s'écrit sur la contremarche, et s'efface avant de passer sous y = 1480
      const [, iy] = W2S(s.X, s.Y + s.b + 58);
      const safe = 1 - sm(1440, 1474, iy);
      if (s.w) { K.writeWord(s.w, tt, te + 0.42, 0.03, 12, safe); }
      if (i === 3) { K.writeWord(ta4, t, T.claque + 0.05, 0.05, 16, t >= REW[1] ? 1 : 0); }
      set(glows[i], (i === 3 ? sm(T.step4, T.step4 + 0.4, t) * (t >= REW[1] ? 1 : 0) : v.lit * 0.85 * (1 - 0.6 * big) * (1 - inD)) * fold);
    });

    // voitures
    const sil = inRew && t < LOOP ? sm(REW[0], REW[0] + 0.3, t) : 0;
    const gone = t >= REW[1] - 0.3 && t < LOOP ? 1 - sm(REW[1] - 0.3, REW[1] + 0.2, t) : 1;
    cars.forEach((c, i) => {
      const v = CARV[i];
      let stc = t >= LOOP ? 0 : st;
      let x, y, k = 1;
      if (i === 0) {
        const g = S(inRew && t < LOOP ? Math.max(stc, 5.75) : stc, T.out, { f: 1.5, z: 1 });
        x = lerp(STREET.x, c.pose.x, g); y = lerp(STREET.y, c.pose.y, g); k = lerp(STREET.k, 1, g);
      } else { x = c.pose.x + track(stc, [[0, 1150], [v.arr, 0, { f: 1.15, z: 1 }]]); y = c.pose.y; }
      const dep = track(stc, [[0, 0], [v.leave, -1400, { f: 0.75, z: 1 }]]); x += dep;
      const xx = (u) => (i === 0 ? 0 : track(u, [[0, 1150], [v.arr, 0, { f: 1.15, z: 1 }]])) + track(u, [[0, 0], [v.leave, -1400, { f: 0.75, z: 1 }]]);
      const vel = (xx(stc + 0.01) - xx(stc - 0.01)) / 0.02;
      const dip = v.brake > 0 ? 1.4 * Math.sin(Math.PI * clamp((stc - v.brake + 0.15) / 0.6, 0, 1)) * (stc > v.brake - 0.15 ? 1 : 0) : 0;
      c.box.style.transform = `translate(${f3(x)}px,${f3(y)}px) scale(${f3(k)}) translate(${f3(c.front[0])}px,${f3(c.front[1])}px) rotate(${f3(-dip)}deg) translate(${f3(-c.front[0])}px,${f3(-c.front[1])}px)`;
      const onS = i === 0 ? 1 : sm(v.arr - 0.02, v.arr + 0.05, stc);
      const vis = onS * (1 - sm(v.leave + 0.55, v.leave + 0.9, stc)) * (t >= LOOP ? (i === 0 ? sm(LOOP + 0.62 * FO, DUR - 0.06, t) : 0) : gone);
      set(c.box, vis);
      // la 206 de l'image 0 est floue ; mise au point sur « la petite rouge »
      const foc = i === 0 ? (t >= LOOP ? 0 : S(st, T.focus, { f: 1.1, z: 1 })) : 1;
      if (c.blurI) set(c.blurI, (1 - foc) * (1 - sil));
      set(c.im, foc * (1 - sil));
      set(c.silC, sil);
      set(c.refl, (i === 0 ? sm(T.out + 0.2, T.out + 0.6, stc) * (t >= LOOP ? 0 : 1) : 1) * 0.13 * (1 - sil));
      c.shad.forEach((e) => set(e, (i === 0 ? 0.55 + 0.45 * sm(T.out, T.out + 0.6, stc) : 1) * (1 - 0.5 * sil)));
      const tc = i === 0 ? T.contour : v.brake - 0.1, cp = S(t >= LOOP ? 0 : st, tc, { f: i === 0 ? 0.75 : 1.0, z: 1 });
      for (const e of [...c.cGlowP, c.cLine]) e.setAttribute('stroke-dashoffset', f3(c.C.len * (1 - cp)));
      const cOn = sm(tc - 0.02, tc + 0.05, t >= LOOP ? 0 : st) * (1 - 0.6 * sm(tc + 0.9, tc + 1.6, st));
      set(c.cGlow, cOn * 0.85 * (1 - sm(tc + 0.9, tc + 1.6, t >= LOOP ? 0 : st)) + sil * 0.5); set(c.cLine, cOn * (0.95 - 0.4 * sil));   // la lueur s'éteint une fois le contour tracé
      const pt = c.cLine.getPointAtLength(c.C.len * clamp(cp, 0, 0.9999));
      c.cPen.setAttribute('transform', `translate(${f3(pt.x)},${f3(pt.y)})`);
      set(c.cPen, sm(tc - 0.02, tc + 0.06, st) * (1 - sm(tc + 0.55, tc + 0.85, st)) * (t >= LOOP ? 0 : 1));
      const spd = clamp(Math.abs(vel) / 2600, 0, 1);
      c.trails.forEach((tr, j) => {
        const ty = y + c.h * k * [0.55, 0.68, 0.8][j];
        const lead = vel < 0 ? x + c.w * k * 0.5 : x + c.w * k * 0.4;
        const tv = spd * (0.9 - j * 0.2) * vis; set(tr, tv);
        if (tv > 0.002) { tr.style.transform = `translate(${f3(lead)}px,${f3(ty)}px) scaleX(${vel < 0 ? 1 : -1})`; tr.style.transformOrigin = '0 0'; tr.style.width = `${f3(80 + 900 * spd)}px`; }
      });
      // l'étiquette, suspendue au rétroviseur
      const g = tags[i];
      const ax = x + c.mir[0] * k, ay = y + c.mir[1] * k;
      const th = swing(stc, [[i === 0 ? T.tag : v.arr + 0.35, i === 0 ? 5 : -7], [i === 0 ? T.out + 0.05 : v.brake, -6], [v.strike, 2.5], [v.leave, 9]]);
      g.hang.style.transform = `translate(${f3(ax)}px,${f3(ay)}px) rotate(${f3(th)}deg)`;
      const tagIn = i === 0 ? (t >= LOOP ? 0 : S(st, T.tag, P.card)) : 1;
      set(g.hang, vis * (i === 0 ? sm(T.tag - 0.02, T.tag + 0.06, t >= LOOP ? 0 : st) : 1) * (1 - sil * 0.65));
      g.tag.style.transform = `translateY(${f3(-40 * (1 - tagIn))}px) scale(${f3(0.85 + 0.15 * tagIn)})`; g.tag.style.transformOrigin = '50% 0';
      g.fil.style.transform = `scaleY(${f3(tagIn)})`; g.fil.style.transformOrigin = '50% 0';
      if (i === 0) {   // la plume écrit « 1 400 € » quand l'étiquette arrive
        const wp = t >= LOOP ? 0 : clamp(S(stc, T.tag + 0.12, { f: 1.1, z: 1 }), 0, 1);
        g.oldE.style.clipPath = wp > 0.999 ? '' : `inset(-10px ${f3((1 - wp) * 100)}% -10px -10px)`;
        g.pen2.setAttribute('transform', `translate(${f3(22 + g.ow * wp)},${f3(84)})`);
        set(g.pen2, sm(T.tag + 0.1, T.tag + 0.16, stc) * (1 - sm(T.tag + 0.7, T.tag + 0.9, stc)) * (t >= LOOP ? 0 : 1));
      }
      const sp = S(stc, v.strike, P.pen);
      g.stP.setAttribute('stroke-dashoffset', f3(260 * (1 - sp)));
      const mv = S(stc, v.strike + 0.22, P.card);
      g.oldE.style.transform = `translate(${f3(mv * (g.W - 20 - g.ow * 0.42 - 22))}px,${f3(-mv * 28)}px) scale(${f3(1 - 0.58 * mv)})`;
      g.oldE.style.opacity = f3(1 - 0.35 * mv);
      K.writeWord(g.nw, stc, v.neu, 0.04, 10);
      if (g.mw) K.writeWord(g.mw, stc, v.max, 0.04, 8);
      const np = clamp((stc - v.neu) / (0.04 * g.nw.items.length + 0.2), 0, 1), it = g.nw.items[Math.min(g.nw.items.length - 1, Math.floor(np * g.nw.items.length))];
      g.pen.setAttribute('transform', `translate(${f3(it.cx)},${f3(it.base - 22)})`);
      set(g.pen, sm(v.neu - 0.02, v.neu + 0.05, stc) * (1 - sm(v.neu + 0.45, v.neu + 0.65, stc)));
      // le montant qui file du compteur vers l'étiquette
      const pay = [T.pay1, T.pay2, T.pay3][i], cpos = S(stc, pay, { f: 1.4, z: 1 });
      const [ex, ey] = W2S(ax - g.W / 2 + 120, ay + g.Lf + 82);
      const [sx0, sy0] = [540, 372], cx0 = lerp(sx0, ex, 0.5) + 220, cy0 = lerp(sy0, ey, 0.5) - 60;
      const bx = (1 - cpos) * (1 - cpos) * sx0 + 2 * (1 - cpos) * cpos * cx0 + cpos * cpos * ex, by = (1 - cpos) * (1 - cpos) * sy0 + 2 * (1 - cpos) * cpos * cy0 + cpos * cpos * ey;
      chips[i].style.transform = `translate(${f3(bx)}px,${f3(by)}px) translate(-50%,-50%) scale(${f3(1 - 0.35 * cpos)})`;
      set(chips[i], sm(pay - 0.02, pay + 0.06, stc) * (1 - sm(0.82, 0.97, cpos)) * (t >= LOOP ? 0 : 1));
    });

    // A : le calcul
    if (showA > 0.002) LA.style.transform = tf(cA, 0, `translateY(${f3(-420 * out)}px) scale(${f3(1 + 0.08 * out)})`);
    set(LA, showA);
    const sx = lerp(-300, 1500, S(tA, T.sh, { f: 0.85, z: 1 }));
    shine(shS, sx);
    const shK = 0.55 * sm(T.sh - 0.05, T.sh + 0.05, tA) * (1 - sm(T.sh + 0.8, T.sh + 1.1, tA));
    set(A.sh, shK);
    if (!HB) {
      ink(A.dr1, 1); ink(A.il, 1); ink(A.n85, 1); ink(A.eur, 1);
      const dk = sm(T.dix - 0.03, T.dix + 0.08, tA) * (1 - sm(T.dix + 0.45, T.dix + 0.9, tA));
      A.dr1.items.forEach((g, i) => { if (i < 5) { g.fill.setAttribute('fill', dk > 0.01 ? `rgba(255,${f3(236 - 60 * dk)},${f3(220 - 110 * dk)},${f3(0.58 + 0.42 * dk)})` : 'rgba(246,239,231,.58)'); } });
      const lk = S(tA, T.sh + 0.15, { f: 1.4, z: 1 });
      A.dr2.items.forEach((g) => g.fill.setAttribute('fill', `rgba(246,239,231,${f3(0.58 + 0.42 * lk)})`));
      A.lift = lk;
      // la plume repasse le « ? » (il est déjà là à l'image 0)
      const q = A.q.items[0], qd = S(tA, T.q, P.draw);
      q.stroke.setAttribute('stroke-dashoffset', f3(q.L * (1 - qd))); q.stroke.setAttribute('opacity', f3(sm(T.q - 0.02, T.q + 0.06, tA) * (1 - sm(T.q + 0.6, T.q + 0.95, tA))));
      q.fill.setAttribute('opacity', '1');
      A.qPen.setAttribute('transform', `translate(${f3(q.cx + 30 * Math.cos(qd * 5.5 - 1))},${f3(q.base - 90 + 70 * Math.sin(qd * 3))})`);
      set(A.qPen, sm(T.q - 0.02, T.q + 0.06, tA) * (1 - sm(T.q + 0.5, T.q + 0.75, tA)));
      // « 8 500 € ? » tremble sur « mille quatre »
      const tr = tA > T.trem ? 14 * Math.exp(-(tA - T.trem) * 6.5) * Math.sin((tA - T.trem) * 50) : 0;
      A.big.setAttribute('transform', `translate(${f3(tr)},0)`);
      q.g.setAttribute('transform', `rotate(${f3(tr * 0.6)} ${f3(q.cx)} ${f3(q.base - 60)})`);
    } else {
      ink(A.w2, 1);
      const sx2 = lerp(-300, 1500, S(tA, T.sh2, { f: 0.85, z: 1 }));
      set(A.sh2, 0.55 * sm(T.sh2 - 0.05, T.sh2 + 0.05, tA) * (1 - sm(T.sh2 + 0.8, T.sh2 + 1.1, tA)));
      shine(A.shS2, sx2);
    }

    // « 1 500 » qui monte devenir le compteur (comme le « 1 500 € » de MO5)
    const mvp = t >= LOOP ? 0 : S(t, T.out, { f: 1.25, z: 1 }), swap = t >= LOOP ? 0 : sm(T.out + 0.36, T.out + 0.5, t);
    const cMix = { rx: lerp(cA.rx, 0, mvp), ry: lerp(cA.ry, 0, mvp), z: lerp(cA.z, 0, mvp), x: lerp(cA.x, 0, mvp), y: lerp(cA.y, 0, mvp) };
    const lcK = (t < LOOP ? 1 : back) * (1 - swap);
    if (lcK > 0.002) LC.style.transform = tf(cMix, 0);
    set(LC, lcK);
    const vis0 = [clamp(track(st, visKeys[0]), 0, 1), clamp(track(st, visKeys[1]), 0, 1), 1, 1];
    const nC = vis0.reduce((a, b) => a + b, 0), totW = nC * C.w + (nC - 1) * C.gap + 16 + C.efs * 0.62;
    const cellX = []; { let cx = 540 - totW / 2; for (let i = 0; i < 4; i++) { cellX.push(cx); cx += (C.w + C.gap) * vis0[i]; } cellX.push(cx + 4); }
    let gi = 0;
    A.mv.items.forEach((g) => {
      const isE = g.ch === '€', idx = isE ? 4 : gi++;
      const tx = isE ? cellX[4] + C.efs * 0.31 : cellX[idx] + C.w / 2, ty = 300 + C.h / 2 + 38;
      const pul = HB ? 0 : 0.14 * Math.exp(-3 * Math.max(0, tA - T.sh - 0.15)) * S(tA, T.sh + 0.15, { f: 1.6, z: 1 }) * (1 - mvp);
      const sc = lerp(1, (isE ? C.efs : 112) / A.mvSize, mvp) * (1 + pul);
      g.stroke.style.visibility = 'hidden';
      g.g.setAttribute('transform', `translate(${f3(lerp(g.cx, tx, mvp))},${f3(lerp(g.base, ty, mvp))}) scale(${f3(sc)}) translate(${f3(-g.cx)},${f3(-g.base)})`);
    });

    // HUD : compteur, réserve, palettes
    const cH = camH(t);
    const hudOn = (t < LOOP ? 1 : 0) * (1 - big) * (t >= REW[1] - 0.3 ? 1 - sm(REW[1] - 0.3, REW[1] + 0.1, t) : 1);
    const lhK = hudOn * sm(T.out - 0.02, T.out + 0.02, t < LOOP ? t : 0);
    if (lhK > 0.002) LH.style.transform = tf(cH, 0);
    set(LH, lhK);
    const lit = sm(T.bump - 0.02, T.bump + 0.04, st) * (1 - sm(T.bump + 0.5, T.bump + 0.9, st));
    const pc = K.paintPlateCounter(C, st, RK.keys, vis0, (i) => ({ draw: S(st, T.hud + i * 0.07, P.draw), glass: S(st, T.hud + 0.22 + i * 0.07, P.heavy) }), 1, lit, t >= LOOP ? 0 : swap);
    C.labL.forEach((s, i) => { const p = S(st, T.hud + 0.2 + i * 0.045, P.rise); s.style.opacity = f3(p); s.style.transform = `translateY(${f3((1 - p) * 18)}px)`; });
    // « réserve » à droite du compteur, quand il ne reste que la réserve
    const rk = win(st, RESW), rcur = RESW.filter(([a]) => st >= a - 0.02).pop();
    resG.setAttribute('transform', `translate(${f3(pc.right + 24)},${f3(392)})`);
    if (rcur) K.writeWord(resW, st, rcur[0], 0.035, 14, rk); else K.writeWord(resW, st, 99, 0.035, 14, 0);
    const flT = inRew ? Math.max(st, 5.6) : st;
    const annUp = S(st, T.ann + 0.35, { f: 1.1, z: 1 }) * (1 - S(st, T.annOut, { f: 1.1, z: 1 }));   // l'annonce monte sur les palettes : elles s'effacent dessous
    K.paintPlateFlaps(F, flT, FEV, 1 - 0.85 * clamp(annUp, 0, 1), 0.04);

    // mention : de l'étiquette (4,0 s) à la carte, qui a la sienne
    const mOn = HB ? (t < REW[1] ? 1 : (t >= LOOP ? back : 0)) : sm(T.mention - 0.02, T.mention + 0.3, t) * (t < REW[1] ? 1 : 0);
    set(mention, mOn * (t < REW[1] - 0.3 ? 1 : 1 - sm(REW[1] - 0.3, REW[1], t) + (HB && t >= LOOP ? 1 : 0)));
    mention.style.transform = `translateY(${f3((1 - sm(T.mention, T.mention + 0.35, t)) * 14)}px)`;

    // N : notifications
    const nOn = t < LOOP ? 1 : 0;
    if (nOn * (1 - big) > 0.002) LN.style.transform = tf(cH, 60);
    set(LN, nOn * (1 - big));
    // débits de la marche 1 : deux s'empilent, puis le gag arrive seul (les deux autres partent dans le compteur)
    const away = S(st, T.gag - 0.08, P.push);
    D.forEach((d, i) => {
      const t0 = [T.d1, T.d2, T.gag][i]; let k = 0; if (i === 0) k = S(st, T.d2, P.card);
      const a = S(st, t0, P.card);
      const up = i < 2 ? away : 0, outL = i === 2 ? S(st, T.sem3 - 0.28, P.push) : 0;
      d.w.style.transform = `translate(${f3(150 + 1150 * (1 - a) - 1250 * outL)}px,${f3(NY + 34 * k - 520 * up)}px) scale(${f3((1 - 0.06 * k) * (1 - 0.45 * up))})`;
      set(d.w, sm(t0 - 0.06, t0, st) * (1 - sm(0.25, 0.7, up)) * (1 - sm(0.3, 0.7, outL)));
      K.flat(d.n.d, k > 0.05 || up > 0.05);
      if (d.w.style.visibility !== 'hidden') drawSeq(d.n.c, IMG[d.seq], Math.max(0, st - t0));
    });
    { const ss = S(st, T.toi, P.stamp); set(toi, sm(T.toi - 0.02, T.toi + 0.04, st)); toi.style.transform = `rotate(-8deg) scale(${f3(lerp(1.8, 1, ss))})`; }
    // ventes : la bulle de l'acheteur, puis le virement (qui part dans le compteur quand il roule)
    const VB = [[T.sem3, T.vir1, T.up1], [T.sem7, T.vir2, T.up2], [T.bub3, T.vir3, T.up3]];
    VB.forEach(([tb, tv, tu], i) => {
      const b = bub[i], v = vir[i];
      const k = S(st, tv, P.card), lb = S(st, tu - 0.05, P.push);
      const ba = S(st, tb, P.card), buzz = st > tb && st < tb + 0.5 ? Math.sin((st - tb) * 90) * 6 * (1 - (st - tb) / 0.5) : 0;
      b.style.transform = `translate(${f3(150 + buzz - 1250 * lb)}px,${f3(NY + 34 * k + 170 * (1 - ba))}px) scale(${f3(0.9 + 0.1 * ba - 0.06 * k)})`;
      set(b, sm(tb - 0.06, tb, st) * (1 - sm(0.3, 0.7, lb)));
      K.flat(b, k > 0.05);
      const va = S(st, tv, P.card);
      v.w.style.transform = `translate(${f3(150 + 1150 * (1 - va))}px,${f3(NY - 430 * lb)}px) scale(${f3(1 - 0.55 * lb)})`;
      set(v.w, sm(tv - 0.06, tv, st) * (1 - sm(0.35, 0.8, lb)));
      if (v.w.style.visibility !== 'hidden') drawSeq(v.n.c, IMG[v.seq], Math.max(0, st - tv));
    });
    // tickets des marches 2 et 3 : une seule arrivée
    // le ticket reste jusqu'à l'arrivée de la bulle (marche 2) ou de l'annonce (marche 3), qui le chassent à gauche
    [[T.tk2, T.sem7 - 0.1], [T.tk3, T.ann - 0.1]].forEach(([t0, t1], i) => {
      const d = tk[i], a = S(st, t0, P.card), o = S(st, t1, P.push);
      d.w.style.transform = `translate(${f3(150 + 1150 * (1 - a) - 1250 * o)}px,${NY}px)`;
      set(d.w, sm(t0 - 0.06, t0, st) * (1 - sm(0.3, 0.7, o)));
      if (d.w.style.visibility !== 'hidden') drawSeq(d.n.c, IMG[d.seq], Math.max(0, st - t0));
    });
    // l'annonce glisse vers le compte, bute sur ses 150 €, prend son tampon et repart
    {
      const a = S(st, T.ann, P.card), up = S(st, T.ann + 0.35, { f: 1.1, z: 1 }), rec = st > T.bump ? 34 * Math.exp(-(st - T.bump) * 6) * Math.sin((st - T.bump) * 26) : 0;
      const o = S(st, T.annOut, { f: 1.1, z: 1 });
      const yy = lerp(NY, 474, up) + 40 * S(st, T.bump, P.card) + rec;
      ann.w.style.transform = `translate(${f3(150 + 1150 * (1 - a) + 1300 * o)}px,${f3(yy)}px) scale(${f3(1 - 0.12 * up)}) rotate(${f3(-1.5 * up + (1 - a) * 6)}deg)`;
      set(ann.w, sm(T.ann - 0.06, T.ann, st) * (1 - sm(0.4, 0.8, o)));
      K.flat(ann.n.d, up > 0.3);                     // montée sur les palettes : fond opaque, pas de lettres floues derrière le verre
      const us = S(st, T.une, P.stamp); set(une, sm(T.une - 0.02, T.une + 0.04, st)); une.style.transform = `rotate(-8deg) scale(${f3(lerp(1.8, 1, us))})`;
    }
    // « Toujours dispo ? » : les messages s'empilent, puis laissent la place à l'offre
    msgs.forEach((m, i) => {
      const a = S(st, T.msg[i], P.card); let k = 0; for (let j = i + 1; j < T.msg.length; j++) k += S(st, T.msg[j], P.card);
      const dy = 92 * Math.min(k, 1) + 18 * Math.max(0, k - 1), go = S(st, T.bub3 - 0.2 + 0.05 * (4 - i), P.push);
      m.style.transform = `translate(${f3((1 - a) * 620 - 1300 * go)}px,${f3(NY + 200 - dy + 60 * (1 - a))}px) scale(${f3((0.86 + 0.14 * a) * (1 - 0.06 * k))})`;
      set(m, sm(T.msg[i] - 0.04, T.msg[i] + 0.02, st) * clamp(1 - 0.2 * k, 0, 1) * (1 - sm(0.3, 0.7, go)));
      K.flat(m, k > 0.05 || go > 0.05);
    });

    // la chute : le compteur se fond dans « 3 100 € »
    set(dim, dimK * (t < LOOP ? 1 : 0));
    set(L9, big * (t < LOOP ? 1 : 0));
    const s9 = S(st, T.big, { f: 1.3, z: 1 });
    big9.style.transform = `translateY(${f3(-330 * (1 - s9))}px) scale(${f3(0.42 + 0.58 * s9 + 0.018 * sm(T.big + 0.3, REW[0], st))})`;
    if (big * (t < LOOP ? 1 : 0) > 0.002) L9.style.transform = `translateY(${f3(noise(15, t * 0.3) * 4)}px)`;
    set(glow9, 0.4 + 0.6 * S(st, T.big + 0.1, P.heavy));
    const attK = 1 - sm(REW[0] - 0.05, REW[0] + 0.2, t);
    K.writeWord(att1, t, T.att, 0.03, 18, attK); K.writeWord(att2, t, T.att2, 0.05, 22, attK);

    // le calcul refait : la carte
    const cF = camF(t);
    const cOut = t >= LOOP ? S(t, LOOP, { f: 1.6, z: 1 }) : 0;
    const [fdx, fdy] = driftF(t), ldK = (t >= REW[1] - 0.2 ? 1 : 0) * (1 - sm(LOOP + 0.05 * FO, LOOP + 0.34 * FO, t));
    // un calque caché dont la transformation change à chaque image se fait quand même repeindre : on ne l'écrit que visible
    if (ldK > 0.002) LD.style.transform = `translate(${f3(fdx)}px,${f3(fdy)}px) ` + tf(cF, 0, `translateY(${f3(-520 * cOut)}px) scale(${f3(1 - 0.3 * cOut)})`);
    set(LD, ldK);
    const ci = S(t, T.card, P.card);
    card.style.transform = `perspective(1500px) translateY(${f3((1 - ci) * 260)}px) rotateX(${f3((1 - ci) * 26)}deg)`;
    set(card, sm(T.card - 0.02, T.card + 0.06, t));
    K.writeWord(hd1, t, T.card + 0.15, 0.025, 16); K.writeWord(hd2, t, T.card + 0.55, 0.04, 16);
    { const p = S(t, T.card + 0.75, P.rise); sub.style.opacity = f3(p); sub.style.transform = `translateY(${f3((1 - p) * 18)}px)`; }
    rules.forEach((r, i) => { const p = S(t, [T.card + 0.6, T.l4 - 0.2][i], P.pen); r.style.transform = `scaleX(${f3(p)})`; });
    lines.forEach((l, i) => {
      const t0 = [T.l1, T.l2, T.l3][i];
      K.writeWord(l.wl, t, t0, 0.022, 14); K.writeWord(l.wr, t, t0 + 0.24, 0.04, 14);
      const p = S(t, t0 + 0.32, P.rise); l.fr.style.opacity = f3(p); l.fr.style.transform = `translateY(${f3((1 - p) * 14)}px)`;
    });
    K.writeWord(l4, t, T.l4, 0.03, 14);
    { const rs = S(t, T.claque, { f: 2.4, z: 1 }); set(resRow, sm(T.claque - 0.02, T.claque + 0.05, t)); resRow.style.transform = `translateY(${f3(-44 * (1 - rs))}px) scale(${f3(1.06 - 0.06 * rs)})`; }
    set(dM, S(t, T.card + 0.9, P.rise));

    // effets
    set(rewFx, sm(REW[0], REW[0] + 0.15, t) * (1 - sm(REW[1] - 0.15, REW[1], t)) * 0.9);
    if (t >= REW[0] && t < REW[1]) rewFx.style.transform = `translateY(${f3((t * 900) % 6)}px)`;
    set(flash, 0.32 * sm(T.big, T.big + 0.08, st) * (1 - sm(T.big + 0.08, T.big + 0.5, st)) * (inRew ? 0 : 1) + 0.45 * sm(T.claque, T.claque + 0.07, t) * (1 - sm(T.claque + 0.07, T.claque + 0.5, t))
      + 0.28 * sm(LOOP + 0.15 * FO, LOOP + 0.3 * FO, t) * (1 - sm(LOOP + 0.3 * FO, LOOP + 0.75 * FO, t)) + 0.3 * sm(T.out, T.out + 0.08, t) * (1 - sm(T.out + 0.08, T.out + 0.45, t)));
    // grain fixe (comme MO9) : le déplacer à chaque image coûtait ≈ 0,15 s par image au rendu (mesure du 9 octobre)
  }

  // flou de bougé : obturateur ouvert sur les gestes rapides. Rendu plus court : 4 sous-images seulement sur la partie
  // rapide d'un geste (les 0,17 premières secondes d'un glissement, les voitures, la caméra, le rembobinage, la boucle),
  // 2 sur sa fin et sur les gestes moyens (montants qui filent, tampons, arrivée de la carte), aucune sur les bulles qui
  // montent de 170 px. Captures du rendu final (MB = 4) : 4 530 → 3 714 (copie de MO9 : 3 504).
  const WIN = [[T.out, T.out + 0.7, 0.7], [LOOP, DUR, 0.6], [T.leave1, T.leave1 + 0.9, 0.8], [T.arr2, T.arr2 + 0.55, 0.8], [T.leave2, T.leave2 + 0.9, 0.8], [T.arr3, T.arr3 + 0.55, 0.8],
    [T.leave3, T.leave3 + 0.85, 0.7], [T.pull, T.pull + 0.9, 0.45], [T.big - 0.05, T.big + 0.4, 0.6], [REW[0], REW[1], 0.8], [T.ann, T.ann + 0.5, 0.6], [T.annOut, T.annOut + 0.4, 0.6]];
  // glissements (≈ 1 150 px) : arrivées des débits, virements et tickets, montées dans le compteur, messages, départs à gauche
  [T.d1, T.d2, T.gag, T.vir1, T.tk2, T.vir2, T.tk3, T.vir3, T.up1, T.up2, T.up3, ...T.msg, T.gag - 0.08, T.sem3 - 0.28, T.sem7 - 0.1, T.ann - 0.1, T.bub3 - 0.2]
    .forEach((x) => { WIN.push([x - 0.03, x + 0.17, 0.6]); WIN.push([x - 0.03, x + 0.3, 0.45]); });
  [T.pay1, T.pay2, T.pay3, T.toi, T.une, T.card].forEach((x) => WIN.push([x - 0.03, x + 0.28, 0.45]));
  const fast = (t) => { const st = story(t); let s = 0; for (const [a, b, v] of WIN) { const u = a < REW[0] && t >= REW[1] ? -1 : (a < REW[0] ? st : t); if (u < 0) continue; s = Math.max(s, v * sm(a - 0.05, a + 0.05, u) * (1 - sm(b - 0.05, b + 0.05, u))); } return s; };
  window.shutter = (t) => Math.max(0.12, fast(t));
  window.samples = (t) => { const f = fast(t); return f > 0.55 ? 4 : f > 0.3 ? 2 : 1; };
  // temps des événements, lus par scripts/audio-mo13.py pour poser les bruitages (scripts/events.mjs → film-mo13/events.json)
  window.EVENTS = { ...T, hook: HB ? 'B' : 'A', rew: REW, stTo: ST_TO, loop: LOOP, dur: DUR,
    debits: [T.d1, T.d2, T.gag], tickets: [T.tk2, T.tk3], ventes: [T.vir1, T.vir2, T.vir3], bulles: [T.sem3, T.sem7, T.bub3], achats: [T.pay1, T.pay2, T.pay3],
    barres: [T.strike1, T.strike2, T.strike3], prix: [T.neu1, T.neu2, T.neu3], aretes: [T.edge1, T.edge2, T.edge3], departs: [T.leave1, T.leave2, T.leave3],
    arrivees: [T.arr2, T.arr3], freins: [T.brake2, T.brake3], montees: [T.rise1, T.rise2], tampons: [T.toi, T.une], palettes: FEV.map((e) => e[0]),
    rouleaux: TV.slice(1), compte: VALS, lignes: [T.l1, T.l2, T.l3, T.l4] };
  window.seek = (t) => paint(t >= DUR ? t - DUR : t);
  paint(0);
  window.filmReady = true;
})();
