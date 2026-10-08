// MO9 « 974 € » (31,4 s). Contrat : window.seek(t) peint la frame t, sans état entre les frames.
// window.shutter(t) / window.samples(t) : flou de bougé au rendu (MB=4).
// Minutage lu dans la voix retenue (audio/vo-mo9/vo-timing.json, scripts/vo-mo9.py) : chaque événement suit son mot.
// Construit sur lib/kit47.js (modules de MO5) ; la mise en page reprend film-mo9/tests.html, validée à l'étape 2.
(async function () {
  const { track, clamp, lerp, noise } = Motion;
  const { f3, S, sm, P, el, sv, set, defs, word, writeWord, fullWord, notif, load, loadSeqs, drawSeq, flaps, paintFlaps, counter, rollKeys, paintCounter } = Kit47;
  const stage = document.getElementById('stage');

  // ---------- minutage ----------
  const VT = await (await fetch('../audio/vo-mo9/vo-timing.json')).json();
  const DUR = VT.dur, LOOP = VT.loop;                     // 31,4 s, boucle à 29,24 s (scripts/vo-mo9.py)
  const M = (k) => VT.marks[k].t, ME = (k) => VT.marks[k].end;
  const T = {
    b3900: M('b3900'), w2: M('revends') - 0.05,   // la lumière sur « 3 900 » ; « 5 600 » s'écrit sur « tu la revends »
    notif: ME('b5600') - 0.05,                // le virement se pose quand « 5 600 » finit
    ok1: M('cette'), chk: M('cette') + 0.8, ok2: M('accord') - 0.08,
    out: ME('accord') + 0.2,                  // le calcul se replie
    j0: M('jour0') - 0.2, ads: M('jour0') + 0.25, capJ: M('annonces') - 0.15,
    ring: M('v5650') - 0.45, card: M('v5650') - 0.27, rows: M('v5650') - 0.05, bar: M('m3900') - 0.65, max: M('m3900') - 0.05,
    car: ME('m3900') - 0.28,                  // la Clio entre pendant que « 3 900 » finit
    pins: { 'Phares jaunis': M('phares') - 0.05, Rayure: M('rayure') - 0.05, 'Pneus lisses': M('pneus') - 0.05 },
    strike: M('il') - 0.05, annN: M('accepte') + 0.07,
    sonne: M('sonne'), bubble: M('negocie'), reply: M('tuacc') - 0.03, credit: ME('acceptes') + 0.02,
    big: M('n974') - 0.06, keb: ME('euros') + 0.08,
    pk1: M('meme') - 0.05, pk2: M('etait') - 0.04,
    tout: M('tout'), jour0b: M('jour0b') - 0.1,
  };
  T.jOut = T.car + 0.2; T.ann = T.car + 0.55; T.contour = T.car + 0.8; T.dip = T.car + 0.85;
  T.hud = T.strike + 0.05; T.roll = T.credit + 0.35; T.stamp9 = T.keb + 0.25;
  // les frais : les trois premiers sur leur mot, les quatre autres en pluie qui accélère (le trait de lumière sur les trois derniers)
  const d2 = M('pneu') - 0.05;
  T.deb = [M('carte') - 0.05, M('controle') - 0.05, d2, d2 + 0.36, d2 + 0.68, d2 + 1.0, d2 + 1.32];
  T.rew = [ME('prevu2') + 0.3, ME('prevu2') + 1.1];
  T.td = [T.jour0b + 0.08, T.jour0b + 0.68, T.jour0b + 1.28];

  await Promise.all([
    document.fonts.load('700 150px Clash'), document.fonts.load('600 50px Clash'), document.fonts.load('500 22px Satoshi'),
    document.fonts.load('700 34px Satoshi'), document.fonts.load('italic 104px Fraunces'),
  ]);

  // ---------- vidéos (Mixkit, 30 i/s ; docs/timeline-mo9.md) ----------
  const SEQ = { signe: 120, ct: 120, moteur: 120, pneu: 120, phares: 120, interieur: 120, essence: 120, phone: 120, cles: 120, calc: 120 };
  const IMG = await loadSeqs('seq', SEQ);
  const car = await load('../assets/photos-mo9/clio-a.png');
  const coins = await load('../film-mo5/frames/22168.jpg');

  // ---------- temps du récit : il avance, puis se rembobine (après la chute) jusqu'à la visite ----------
  const REW = T.rew, ST_FROM = REW[0] - 0.9, ST_TO = T.car + 0.65;
  const story = (t) => {
    if (t < REW[0]) return t;
    if (t < REW[1]) { const u = (t - REW[0]) / (REW[1] - REW[0]); const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; return lerp(ST_FROM, ST_TO, e); }
    return ST_TO;
  };

  // ---------- caméras ----------
  const tf = (c, z = 0, extra = '') => `perspective(1700px) translateZ(${f3(c.z)}px) rotateX(${f3(c.rx)}deg) rotateY(${f3(c.ry)}deg) translate(${f3(-c.x)}px,${f3(-c.y)}px)${z ? ` translateZ(${f3(z)}px)` : ''} ${extra}`;
  // A : avance lente vers le calcul, glisse en arc vers le ✓
  const cA2 = T.ok1 + 0.1;
  const camA = (t) => ({
    rx: track(t, [[0, 9], [0.4, 6, { f: 0.5, z: 1 }], [cA2, 3, { f: 0.35, z: 1 }]]) + noise(1, t * 0.45) * 0.5,
    ry: track(t, [[0, -10], [0.2, -3, { f: 0.45, z: 1 }], [cA2, 5, { f: 0.3, z: 1 }]]) + noise(2, t * 0.4) * 0.7,
    z: track(t, [[0, 60], [0.2, -40, { f: 0.4, z: 1 }], [cA2, 110, { f: 0.35, z: 1 }]]),
    x: track(t, [[0, -60], [0.2, 40, { f: 0.4, z: 1 }], [cA2, 30, { f: 0.35, z: 1 }]]),
    y: track(t, [[0, -60], [0.2, 20, { f: 0.4, z: 1 }], [cA2, 120, { f: 0.35, z: 1 }]]),
  });
  // W : le monde du récit (jour 0, visite, frais, attente, vente), une seule prise
  // les annonces descendent au centre pendant qu'on les compte, la visite se cadre sur la voiture, puis on recule pour le compteur
  const [w0, w1, w2, w3, w4, w5] = [T.out, T.jOut, T.strike - 0.35, T.sonne - 0.15, T.big - 0.05, REW[0]];
  const [a0, a1] = [T.ads - 0.1, T.card - 0.1];
  const camW = (t) => ({
    rx: 5 + noise(5, t * 0.4) * 0.45,
    ry: track(t, [[w0, -8], [w0, 4, { f: 0.22, z: 1 }], [w1, -4, { f: 0.25, z: 1 }], [w2, 3, { f: 0.25, z: 1 }], [w3, -3, { f: 0.3, z: 1 }], [w4, 0, { f: 0.4, z: 1 }]]) + noise(6, t * 0.35) * 0.6,
    z: track(t, [[w0, -240], [w0, 0, { f: 0.5, z: 1 }], [a0, 40, { f: 0.3, z: 1 }], [a1, 0, { f: 0.35, z: 1 }], [w1, 90, { f: 0.3, z: 1 }], [w2, 0, { f: 0.6, z: 1 }], [w3, 30, { f: 0.3, z: 1 }], [w4, -40, { f: 0.45, z: 1 }], [w5, 40, { f: 0.3, z: 1 }]]),
    x: track(t, [[w0, -120], [w0, 50, { f: 0.25, z: 1 }], [w1, 0, { f: 0.3, z: 1 }], [w2, -30, { f: 0.25, z: 1 }], [w3, 30, { f: 0.3, z: 1 }], [w4, 0, { f: 0.4, z: 1 }]]),
    y: track(t, [[w0, -80], [w0, 30, { f: 0.25, z: 1 }], [a0, -300, { f: 0.3, z: 1 }], [a1, 30, { f: 0.35, z: 1 }], [w1, 230, { f: 0.3, z: 1 }], [w2, -40, { f: 0.6, z: 1 }], [w3, -40, { f: 0.3, z: 1 }]]),
  });
  // F : orbite lente qui descend le long des trois décisions
  const f0 = REW[1] - 0.15;
  const camF = (t) => ({
    rx: track(t, [[f0, 8], [f0, 3, { f: 0.3, z: 1 }]]) + noise(9, t * 0.4) * 0.4, ry: track(t, [[f0, -10], [f0, 5, { f: 0.22, z: 1 }]]) + noise(10, t * 0.35) * 0.5,
    z: track(t, [[f0, -120], [f0, 70, { f: 0.3, z: 1 }]]) + 8 * Math.max(0, t - f0), x: track(t, [[f0, 30], [f0, -15, { f: 0.3, z: 1 }]]),
    y: track(t, [[f0, -90], [f0, 60, { f: 0.22, z: 1 }]]) - 18 * Math.max(0, t - f0),      // dérive continue : pas de plan figé avant la boucle
  });

  // ---------- fonds ----------
  const bgA = el('div', 'L', stage);
  const bgImg = el('div', 'abs', bgA, `left:-160px;top:-260px;width:1400px;height:2440px;background:url(${coins.src}) center/cover;filter:blur(16px) brightness(.8) saturate(1.2)`);
  el('div', 'abs', bgA, 'left:0;top:0;width:1080px;height:1920px;background:radial-gradient(62% 40% at 50% 40%,rgba(8,7,10,.15),rgba(8,7,10,.93))');
  const bgW = el('div', 'L', stage, 'background:radial-gradient(70% 50% at 50% 58%,#1d1520,#08070a 75%)');
  el('div', 'abs', bgW, 'left:-210px;top:-320px;width:1500px;height:1500px;background:conic-gradient(from 180deg at 50% 0%,transparent 160deg,rgba(255,138,76,.10) 175deg,rgba(255,179,138,.17) 180deg,rgba(255,138,76,.10) 185deg,transparent 200deg);filter:blur(30px);mix-blend-mode:screen');
  const floor = el('div', 'abs', bgW, 'left:-300px;top:1430px;width:1680px;height:900px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 120px),repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 2px,transparent 2px 120px);transform:perspective(900px) rotateX(72deg);transform-origin:50% 0;-webkit-mask-image:linear-gradient(transparent,#000 30%,#000 60%,transparent)');
  const glowCar = el('div', 'glow', bgW, 'left:90px;top:1150px;width:900px;height:360px;background:radial-gradient(closest-side,rgba(255,110,40,.40),transparent)');
  const day = el('div', 'L', bgW, 'background:radial-gradient(90% 60% at 50% 30%,rgba(255,196,150,.30),rgba(255,140,80,.10) 55%,transparent 80%);mix-blend-mode:screen');   // l'attente se passe le jour

  // ---------- A : le calcul (image 0 déjà composée) ----------
  const LA = el('div', 'L', stage);
  const glowA = el('div', 'glow', LA, 'left:170px;top:380px;width:740px;height:640px;background:radial-gradient(closest-side,rgba(255,100,40,.55),transparent)');
  const svgA = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LA);
  defs(svgA, 'a');
  const sheen = sv('linearGradient', { id: 'sheenA', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1080, y2: 0 }, svgA.firstChild);
  const shS = [0, 0, 0, 0].map(() => sv('stop', { 'stop-color': '#fff' }, sheen));
  const W1 = word(svgA, '3 900', '700 190px Clash', 190, 540, 568);
  const W2 = word(svgA, '5 600', '700 190px Clash', 190, 540, 852);
  const shine = [W1, W2].map((w) => { const gS = sv('g', {}, svgA); for (const g of w.items) { const s = sv('text', { x: g.left, y: g.base, 'font-family': 'Clash', 'font-weight': 700, 'font-size': 190, fill: 'url(#sheenA)' }, gS); s.textContent = g.ch; } return gS; });
  const arrowG = sv('g', { transform: 'translate(510,592)', filter: 'url(#gla)' }, svgA);
  const arrow = sv('path', { d: 'M30 6 V70 M10 50 L30 74 L50 50', stroke: '#ffb38a', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '140 140' }, arrowG);
  // un point de lumière descend la flèche, de « 3 900 » vers « 5 600 » (la revente)
  const arPen = sv('g', {}, svgA); sv('circle', { r: 24, fill: '#ff7a3a', opacity: 0.65, filter: 'url(#softa)' }, arPen); sv('circle', { r: 7, fill: '#fff' }, arPen);
  const CHK = { x: 420, y: 880, d: 'M18 92 L88 150 L222 18', L: 279.1 };
  const chkG = sv('g', { transform: `translate(${CHK.x},${CHK.y}) scale(1,.82)` }, svgA);
  const chkGlow = sv('path', { d: CHK.d, stroke: '#ff8a4c', 'stroke-width': 22, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'url(#softa)', opacity: 0.7, 'stroke-dasharray': `${CHK.L} ${CHK.L}` }, chkG);
  const chk = sv('path', { d: CHK.d, stroke: '#ffe2cf', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': `${CHK.L} ${CHK.L}` }, chkG);
  const chkPen = sv('g', {}, chkG); sv('circle', { r: 30, fill: '#ff7a3a', opacity: 0.6, filter: 'url(#softa)' }, chkPen); sv('circle', { r: 9, fill: '#fff' }, chkPen);
  const chkAt = (u) => { const l = u * CHK.L, a = 90.9; return l < a ? [18 + 70 * l / a, 92 + 58 * l / a] : [88 + 134 * (l - a) / 188.2, 150 - 132 * (l - a) / 188.2]; };
  const LAN = el('div', 'L', stage);
  const hookN = notif(LAN, 'Virement reçu', '5 600,00', { sign: '+' });
  const ok = el('div', 'abs', LA, 'left:0;width:1080px;top:1300px;text-align:center;white-space:nowrap;font:500 46px Satoshi');
  const ok1 = el('span', '', ok, 'display:inline-block'); ok1.textContent = 'Cette fois,';
  const ok2 = el('span', 'serif', ok, 'display:inline-block;font-size:62px;margin-left:14px'); ok2.textContent = "d'accord.";

  // ---------- J : jour 0, les annonces d'à côté et la formule ----------
  const LJ = el('div', 'L', stage);
  const fl0 = flaps(LJ, ['J', 'O', 'U', 'R', '0'], { y: 236, w: 92, h: 120, fs: 84, g: 8, gapAt: 4, gap: 28 });
  const ADS = [['5 490', '162 000 km', 'pneu'], ['5 590', '155 000 km', 'moteur'], ['5 700', '158 000 km', 'ct'], ['5 750', '150 000 km', 'phares'], ['5 900', '146 000 km', 'interieur']];
  const ads = ADS.map(([p, k, s], i) => {
    const d = el('div', 'glass ad', LJ, `left:${140 + i * 162}px;top:${i === 2 ? 430 : 446}px`);
    const c = el('canvas', '', d); c.width = 268; c.height = 168; drawSeq(c, IMG[s], 1.2);
    const pp = el('div', 'p', d); pp.textContent = p + ' €'; if (i === 2) pp.style.color = '#ffb38a';
    el('div', 'k', d).textContent = k; return d;
  });
  const ring = el('div', 'ring', LJ, 'left:464px;top:430px;width:152px;height:184px');
  const capJ = el('div', 'abs', LJ, 'left:0;width:1080px;top:652px;text-align:center;font:500 30px Satoshi;color:rgba(246,239,231,.75);white-space:nowrap');
  capJ.textContent = "Annonces d'à côté · même moteur, même boîte, même année";
  const glowF = el('div', 'glow', LJ, 'left:180px;top:800px;width:720px;height:520px;background:radial-gradient(closest-side,rgba(255,110,40,.35),transparent)');
  const card = el('div', 'glass', LJ, 'left:110px;top:730px;width:860px;height:652px;border-radius:44px;padding:52px 58px'); el('div', 'sheen', card);
  const row = (lab, val, mt) => { const r = el('div', '', card, `display:flex;justify-content:space-between;align-items:baseline;white-space:nowrap;margin-top:${mt}px;font:600 50px Clash;color:rgba(246,239,231,.75)`); el('span', '', r).textContent = lab; const v = el('span', '', r, 'font:700 86px Clash;letter-spacing:-.02em;color:#f6efe7'); v.textContent = val; return r; };
  const rows = [row('Revente visée', '5 650', 0), row('− frais prévus', '750', 18), row('− marge voulue', '1 000', 18)];
  const barSvg = sv('svg', { width: 744, height: 30, style: 'display:block;margin-top:22px;overflow:visible' }, card); defs(barSvg, 'b');
  const barGlow = sv('line', { x1: 0, y1: 15, x2: 744, y2: 15, stroke: '#ff8a4c', 'stroke-width': 14, 'stroke-linecap': 'round', filter: 'url(#softb)', opacity: 0.6, 'stroke-dasharray': '760 760' }, barSvg);
  const barL = sv('line', { x1: 0, y1: 15, x2: 744, y2: 15, stroke: '#ffe2cf', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-dasharray': '760 760' }, barSvg);
  const rMax = el('div', '', card, 'display:flex;justify-content:space-between;align-items:baseline;white-space:nowrap;margin-top:20px');
  const pMax = el('span', 'serif', rMax, 'font-size:84px;padding:.05em .14em .12em .3em;margin-left:-.3em'); pMax.textContent = 'prix max';
  const vMax = el('span', '', rMax, 'font:700 118px Clash;letter-spacing:-.02em;filter:drop-shadow(0 0 26px rgba(255,120,50,.35)) drop-shadow(0 0 2px rgba(255,200,170,.6))'); vMax.textContent = '3 900 €';

  // ---------- P : la voiture (récit : avance puis se rembobine) ----------
  const LP = el('div', 'L', stage);
  const CAR = { left: 150, top: 1050, w: 780 }; CAR.h = CAR.w * car.height / car.width;
  const carBox = el('div', 'abs', LP, `left:${CAR.left}px;top:${CAR.top}px;width:${CAR.w}px;height:${CAR.h}px`);
  el('div', 'abs', carBox, `left:50px;top:${CAR.h - 50}px;width:${CAR.w - 100}px;height:100px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.85),transparent)`);
  const refl = el('img', 'abs', carBox, `left:0;top:${CAR.h - 6}px;width:${CAR.w}px;transform:scaleY(-1);transform-origin:50% 0;opacity:.16;filter:blur(3px);-webkit-mask-image:linear-gradient(to top,#000,transparent 40%)`); refl.src = car.src;
  const carImg = el('img', 'abs', carBox, `left:0;top:0;width:${CAR.w}px`); carImg.src = car.src;
  const lay = ['terne', 'phares', 'rayure'].map((k) => { const i = el('img', 'abs', carBox, `left:0;top:0;width:${CAR.w}px`); i.src = `../assets/photos-mo9/clio-a-${k}.png`; return i; });
  const CC = window.CAR_CONTOUR;
  const csv = sv('svg', { width: CAR.w, height: CAR.h, viewBox: `0 0 ${CC.w} ${CC.h}`, style: 'position:absolute;left:0;top:0;overflow:visible' }, carBox); defs(csv, 'c');
  const cGlow = sv('path', { d: CC.d, fill: 'none', stroke: '#ff7a3a', 'stroke-width': 14, 'stroke-linejoin': 'round', filter: 'url(#softc)', 'stroke-dasharray': `${CC.len} ${CC.len}` }, csv);
  const cLine = sv('path', { d: CC.d, fill: 'none', stroke: '#ffe2cf', 'stroke-width': 3.6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': `${CC.len} ${CC.len}` }, csv);
  const sweep = el('div', 'sweep', carBox, `top:-60px;height:${CAR.h + 120}px`);
  // les trois défauts de la visite (coordonnées dans la voiture)
  const DEF = [['Phares jaunis', 319, 202, -310, -110], ['Rayure', 440, 198, 40, -128], ['Pneus lisses', 435, 317, 70, 52]];
  const pins = DEF.map(([lab, x, y, dx, dy]) => {
    const p = el('div', 'pin', carBox, `left:${x}px;top:${y}px`);
    const l = el('div', 'glass pill', carBox, `left:${x + dx}px;top:${y + dy}px`); l.textContent = lab; return { p, l };
  });
  const annP = el('div', 'glass pill', LP, 'left:170px;top:968px;font:700 40px Clash');
  const annT = el('span', '', annP, 'position:relative;color:rgba(246,239,231,.88)'); annT.innerHTML = 'Annonce · <span style="position:relative">4<i style="display:inline-block;width:.24em"></i>400 €</span>';
  const annN = el('span', '', annP, 'display:inline-block;margin-left:18px;color:#ffb38a'); annN.textContent = '3 900 €';
  const strike = sv('svg', { width: 180, height: 40, viewBox: '0 0 180 40', style: 'position:absolute;left:196px;top:20px;overflow:visible' }, annP);
  const stPath = sv('path', { d: 'M4 26 C 60 10, 120 32, 176 12', stroke: '#ff5a1f', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': '200 200', 'stroke-dashoffset': 200 }, strike);

  // ---------- H : compteur « MARGE », jauge des frais, mention ----------
  const LH = el('div', 'L', stage);
  const C = counter(LH, { top: 282, label: 'MARGE', labelTop: 232 });
  const keys = rollKeys([1000, 974], [0, T.roll]);
  const gauge = el('div', 'glass', LH, 'left:190px;top:478px;width:700px;height:70px;border-radius:35px;padding:0');
  const gFill = el('div', 'abs', gauge, 'left:6px;top:6px;width:0;height:58px;border-radius:29px;background:linear-gradient(90deg,rgba(255,90,31,.55),rgba(255,138,76,.85));box-shadow:0 0 24px rgba(255,110,40,.6)');
  const gTxt = el('div', 'abs', gauge, 'left:0;top:0;width:700px;line-height:70px;text-align:center;font:700 30px Satoshi;white-space:nowrap');
  const gStamp = el('div', 'stamp', LH, 'left:760px;top:466px;font-size:24px;padding:4px 14px 6px;border-width:3px'); gStamp.textContent = 'prévu ✓';
  const mention = el('div', 'abs', stage, 'left:0;width:1080px;top:566px;text-align:center;font:500 26px Satoshi;color:rgba(246,239,231,.55)'); mention.textContent = 'Exemple · prix moyens constatés';

  // ---------- N : les frais tombent, chacun prévu ----------
  const LN = el('div', 'L', stage);
  const DEB = [['signe', 'Carte grise', 152], ['ct', 'Contrôle technique', 78], ['pneu', '2 pneus', 160], ['moteur', 'Vidange', 110],
    ['phares', 'Phares · kit', 20], ['phares', 'Rayure · kit', 30], ['interieur', 'Intérieur', 50]].map((d, i) => [T.deb[i], ...d]);
  const LATE = [[T.sonne + 0.1, 34], [T.sonne + 0.45, 40], [T.sonne + 0.8, 40], [T.keb, 12]];      // option de l'annonce, essence, assurance, kebab
  const debs = DEB.map(([, s, ti, a]) => {
    const w = el('div', 'abs', LN, 'width:780px;height:184px');
    const n = notif(w, ti, `${a},00`); n.d.style.left = '0'; n.d.style.top = '0';
    const st = el('div', 'stamp', w, 'left:520px;top:62px'); st.textContent = 'prévu ✓';
    return { w, n, st, s };
  });
  const spent = (st) => DEB.reduce((s, [T, , , a]) => s + a * S(st, T + 0.25, P.roll), 0) + LATE.reduce((s, [T, a]) => s + a * S(st, T + 0.2, P.roll), 0);

  // ---------- W : ça sonne (le jour, les messages) ----------
  const LW = el('div', 'L', stage);
  const flD = flaps(LW, ['J', '+', '1'], { y: 600, w: 116, h: 156, fs: 104, g: 10 });
  const MSG = ['Toujours dispo ?', 'Toujours dispo ?', 'Elle est encore là ?', 'Toujours dispo ?', 'Je peux passer samedi ?', 'Toujours dispo ?',
    'Toujours dispo ?', 'Dispo ce soir ?', 'Toujours dispo ?', 'Toujours dispo ?', 'Encore dispo ?', 'Toujours dispo ?'];
  const TM = MSG.map((_, i) => T.sonne + i * 0.075);              // le téléphone sonne sans arrêt jusqu'à l'offre
  const msgs = MSG.map((m, i) => { const d = el('div', 'glass msg', LW, `left:${i % 2 ? 250 : 190}px;top:0`); d.textContent = m; return d; });
  const mCount = el('div', 'glass pill', LW, 'left:640px;top:790px;font:700 34px Satoshi;color:#ffb38a');

  // ---------- R : la vente ----------
  const LR = el('div', 'L', stage);
  const bubble = el('div', 'glass', LR, 'left:150px;top:640px;width:780px;padding:30px 36px;border-radius:40px 40px 40px 12px'); el('div', 'sheen', bubble);
  el('div', '', bubble, 'font:500 24px Satoshi;color:rgba(246,239,231,.7);margin-bottom:10px').textContent = 'Acheteur · message';
  el('div', '', bubble, 'font:700 46px Satoshi;line-height:1.2').innerHTML = '5 600 € et je la prends <span style="font-family:Fraunces;font-style:italic;font-weight:500;color:#ff8a4c">aujourd\'hui.</span>';
  const reply = el('div', 'glass msg', LR, 'right:150px;top:884px;border-radius:34px 34px 10px 34px;background:linear-gradient(140deg,rgba(255,120,50,.42),rgba(255,90,31,.16));font-size:42px');
  reply.textContent = "D'accord.";                                   // répond à l'offre, en écho à l'ouverture
  const credit = notif(LR, 'Virement reçu', '5 600,00', { sign: '+' });

  // ---------- 9 : 974 € ----------
  const L9 = el('div', 'L', stage);
  const glow9 = el('div', 'glow', L9, 'left:160px;top:480px;width:760px;height:600px;background:radial-gradient(closest-side,rgba(255,100,40,.55),transparent)');
  const lab9 = el('div', 'abs', L9, 'left:0;width:1080px;top:500px;text-align:center;font:700 30px Satoshi;letter-spacing:.34em;color:#a59a90'); lab9.textContent = 'BÉNÉFICE';
  const big9 = el('div', 'abs', L9, 'left:0;width:1080px;top:560px;text-align:center;font:700 290px Clash;line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:#f6efe7;text-shadow:0 1px 0 #d8cfc6,0 2px 0 #bfb5ab,0 3px 0 #a79c92,0 4px 0 #8f8479,0 5px 0 #786d63,0 6px 0 #61574e,0 16px 30px rgba(0,0,0,.6)');
  big9.innerHTML = '974<span style="font-size:160px;margin-left:10px">€</span>';      // tient dans la colonne 140 → 940, caméra comprise
  const svg9 = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, L9); defs(svg9, '9');
  const pk1 = word(svg9, 'Même le kebab', 'italic 500 104px Fraunces', 104, 540, 1000, { italic: true, fill: 'url(#qg9)', strokeColor: '#ffb38a', sw: 1.8 });
  const pk2 = word(svg9, 'était prévu.', 'italic 500 104px Fraunces', 104, 540, 1108, { italic: true, fill: 'url(#qg9)', strokeColor: '#ffb38a', sw: 1.8 });
  const kebW = el('div', 'abs', L9, 'left:150px;top:1192px;width:780px;height:184px;transform-origin:50% 0');
  const keb = notif(kebW, 'Kebab · pour fêter', '12,00', { app: 'Compte courant · samedi' }); keb.d.style.left = '0'; keb.d.style.top = '0';
  keb.c.getContext('2d').drawImage(coins, 0, 0, 372, 276);
  const kebSt = el('div', 'stamp', kebW, 'left:520px;top:62px'); kebSt.textContent = 'prévu ✓';
  const dim = el('div', 'L', stage, 'background:rgba(8,7,10,.78);pointer-events:none');    // tout s'éteint autour du 974 (placé sous L9)
  stage.insertBefore(dim, L9);

  // ---------- D : ce qui a fait la marge ----------
  const LD = el('div', 'L', stage);
  const dCv = el('canvas', 'abs', LD, 'left:-400px;top:-400px;width:1880px;height:2720px;filter:blur(22px) brightness(.26) saturate(.7) sepia(.5)'); dCv.width = 400; dCv.height = 300;
  el('div', 'abs', LD, 'left:-400px;top:-400px;width:1880px;height:2720px;background:radial-gradient(42% 38% at 50% 46%,rgba(70,30,10,.35),rgba(8,7,10,.92) 70%,#08070a)');
  el('div', 'glow', LD, 'left:160px;top:560px;width:760px;height:700px;background:radial-gradient(closest-side,rgba(255,120,50,.32),transparent)');
  const dT = el('div', 'abs', LD, 'left:0;width:1080px;top:250px;text-align:center;white-space:nowrap;font:700 62px Satoshi');
  const dT1 = el('span', '', dT, 'display:inline-block'); dT1.textContent = "Tout s'est joué";
  const dT2 = el('span', 'serif', dT, 'display:inline-block;font-size:86px;margin-left:12px'); dT2.textContent = 'au jour 0.';
  const DECS = [['1', 'Le prix de revente', "les annonces d'à côté", '5 650 €'], ['2', 'Le prix max', 'revente − frais − marge', '3 900 €'], ['3', 'À la visite', 'chaque défaut chiffré', '4 400 → 3 900 €']];
  const decs = DECS.map(([n, ti, s, v], i) => {
    const d = el('div', 'glass dec', LD, `top:${420 + i * 302}px`); el('div', 'sheen', d);
    el('div', 'num', d).textContent = n; const b = el('div', '', d);
    el('div', 't', b).textContent = ti; el('div', 's', b).textContent = s; el('div', 'v', b).textContent = v; return d;
  });
  const dM = el('div', 'abs', LD, 'left:0;width:1080px;top:1330px;text-align:center;font:500 26px Satoshi;color:rgba(246,239,231,.55)'); dM.textContent = 'Exemple · prix moyens constatés';
  const TD = T.td;

  const rewFx = el('div', 'L', stage, 'background:repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 2px,transparent 2px 6px);mix-blend-mode:screen');
  const flash = el('div', 'L', stage, 'background:radial-gradient(60% 45% at 50% 50%,#fff1e6,rgba(255,140,80,.6) 45%,transparent 75%);mix-blend-mode:screen');
  el('div', '', stage).id = 'grain'; el('div', '', stage).id = 'vign';

  // ---------- la frame t ----------
  function paint(t) {
    const st = story(t);
    const tA = t >= LOOP ? 0 : t;
    const out = t >= LOOP ? 0 : S(t, T.out, P.heavy);
    const showA = t < LOOP ? 1 - sm(T.out, T.out + 0.45, t) : sm(LOOP + 0.45, LOOP + 1.3, t);
    const world = t < LOOP ? sm(T.out + 0.05, T.out + 0.55, t) : 1 - sm(LOOP, LOOP + 0.8, t);
    const cA = camA(tA), cW = camW(t);
    if (t >= LOOP) { const u = sm(LOOP, DUR, t); cA.z += 160 * (1 - u); cA.ry += -5 * (1 - u); cA.y += -40 * (1 - u); }

    // fonds
    set(bgA, showA);
    bgImg.style.transform = `translate(${f3(noise(7, tA * 0.3) * 20)}px,${f3(noise(8, tA * 0.3) * 20)}px) scale(${f3(1.04 + 0.03 * S(tA, 0, P.soft))})`;
    set(bgW, world);
    const dayK = sm(T.sonne - 0.45, T.sonne + 0.25, st) * (1 - sm(T.big - 0.15, T.big + 0.25, st));
    set(day, dayK);
    floor.style.transform = `perspective(900px) rotateX(72deg) translateX(${f3(-cW.x * 0.6)}px)`;
    set(glowCar, sm(T.car - 0.05, T.car + 0.65, st) * 0.9);

    // A : le calcul
    LA.style.transform = tf(cA, 0, `translateY(${f3(-300 * out)}px)`);
    set(LA, showA);
    fullWord(W1); writeWord(W2, tA, T.w2, 0.07, 30);
    // la lumière passe sur « 3 900 » quand la voix le dit, puis sur les deux chiffres une fois « 5 600 » écrit
    const tSh = T.w2 + 0.45, sx = tA < tSh - 0.2 ? lerp(-300, 1500, S(tA, T.b3900, { f: 0.9, z: 1 })) : lerp(-300, 1500, S(tA, tSh, { f: 0.7, z: 1 }));
    shS[0].setAttribute('offset', f3(clamp((sx - 260) / 1080, 0, 1))); shS[0].setAttribute('stop-opacity', '0');
    shS[1].setAttribute('offset', f3(clamp((sx - 60) / 1080, 0, 1))); shS[1].setAttribute('stop-opacity', '.85');
    shS[2].setAttribute('offset', f3(clamp((sx + 60) / 1080, 0, 1))); shS[2].setAttribute('stop-opacity', '.85');
    shS[3].setAttribute('offset', f3(clamp((sx + 260) / 1080, 0, 1))); shS[3].setAttribute('stop-opacity', '0');
    const sh1 = 0.5 * sm(T.b3900 - 0.05, T.b3900 + 0.05, tA) * (1 - sm(T.b3900 + 0.75, T.b3900 + 1.0, tA)), sh2 = 0.55 * sm(tSh - 0.05, tSh + 0.05, tA) * (1 - sm(tSh + 1.1, tSh + 1.5, tA));
    shine[0].setAttribute('opacity', f3(Math.max(sh1, sh2))); shine[1].setAttribute('opacity', f3(sh2));
    const ap = S(tA, T.b3900 + 0.25, { f: 0.75, z: 1 });
    arPen.setAttribute('transform', `translate(540,${f3(598 + 70 * ap)})`);
    arPen.setAttribute('opacity', f3(sm(T.b3900 + 0.2, T.b3900 + 0.32, tA) * (1 - sm(T.w2 + 0.05, T.w2 + 0.3, tA))));
    arrow.setAttribute('stroke-dashoffset', '0'); arrowG.setAttribute('opacity', f3(0.85 + 0.15 * Math.sin(Math.PI * clamp((tA - 0.4) / 0.8, 0, 1))));
    set(glowA, 0.35 + 0.45 * S(tA, 0.6, P.heavy) + 0.35 * S(tA, T.chk, P.heavy) * (1 - out));
    const cp = S(tA, T.chk, P.pen);
    chk.setAttribute('stroke-dashoffset', f3(CHK.L * (1 - cp))); chkGlow.setAttribute('stroke-dashoffset', f3(CHK.L * (1 - cp)));
    const [px, py] = chkAt(cp); chkPen.setAttribute('transform', `translate(${f3(px)},${f3(py)})`);
    chkPen.setAttribute('opacity', f3(sm(T.chk - 0.02, T.chk + 0.06, tA) * (1 - sm(T.chk + 0.5, T.chk + 0.8, tA))));
    const o1 = S(tA, T.ok1, P.rise), o2 = S(tA, T.ok2, P.rise);
    ok1.style.opacity = f3(o1); ok1.style.transform = `translateY(${f3((1 - o1) * 24)}px)`; ok1.style.filter = `blur(${f3((1 - o1) * 8)}px)`;
    ok2.style.opacity = f3(o2); ok2.style.transform = `translateY(${f3((1 - o2) * 24)}px)`; ok2.style.filter = `blur(${f3((1 - o2) * 8)}px)`;
    // la notification se pose sous le calcul, sans le percuter
    const hx = track(tA, [[0, 1250], [T.notif, 0, P.card]]), hr = track(tA, [[0, -10], [T.notif, 0, P.card]]);
    LAN.style.transform = tf(cA, 120, `translateY(${f3(-300 * out)}px)`);
    hookN.d.style.transform = `translate(${f3(150 + hx)}px,1080px) rotate(${f3(hr)}deg)`;
    set(hookN.d, t < LOOP ? sm(T.notif - 0.02, T.notif + 0.04, t) * (1 - sm(T.out, T.out + 0.35, t)) : 0);
    if (t > T.notif - 0.05 && t < T.out + 0.45) drawSeq(hookN.c, IMG.cles, t - T.notif);

    // J : jour 0
    const jIn = sm(T.out + 0.05, T.out + 0.2, t), jOut = S(t, T.jOut, P.push);
    LJ.style.transform = tf(cW, -60, `translateY(${f3(-1300 * jOut)}px)`);
    LJ.style.filter = jOut > 0.01 ? `blur(${f3(10 * jOut)}px)` : '';
    set(LJ, jIn * (1 - sm(T.jOut + 0.4, T.jOut + 0.7, t)) * (t < LOOP ? 1 : 0));
    paintFlaps(fl0, t, T.j0);
    ads.forEach((d, i) => {
      const ta = T.ads + i * 0.2, a = S(t, ta, P.card);
      d.style.transform = `perspective(1200px) translateY(${f3((1 - a) * 140)}px) rotateX(${f3((1 - a) * 50)}deg) scale(${f3(0.85 + 0.15 * a)})`;
      set(d, sm(ta - 0.02, ta + 0.06, t) * (i === 2 ? 1 : 0.85 + 0.15 * (1 - sm(T.ring - 0.05, T.ring + 0.25, t))));
    });
    const rg = S(t, T.ring, P.tag); set(ring, sm(T.ring - 0.02, T.ring + 0.05, t)); ring.style.transform = `scale(${f3(lerp(1.25, 1, rg))})`;
    const cj = S(t, T.capJ, P.rise); set(capJ, cj); capJ.style.transform = `translateY(${f3((1 - cj) * 20)}px)`;
    const ci = S(t, T.card, P.card);
    card.style.transform = `perspective(1500px) translateY(${f3((1 - ci) * 260)}px) rotateX(${f3((1 - ci) * 28)}deg)`;
    set(card, sm(T.card - 0.02, T.card + 0.06, t)); set(glowF, 0.4 + 0.6 * S(t, T.max, P.heavy));
    rows.forEach((r, i) => { const p = S(t, T.rows + i * 0.38, P.rise); r.style.opacity = f3(p); r.style.transform = `translateY(${f3((1 - p) * 26)}px)`; r.style.filter = `blur(${f3((1 - p) * 6)}px)`; });
    const bp = S(t, T.bar, P.pen); barL.setAttribute('stroke-dashoffset', f3(760 * (1 - bp))); barGlow.setAttribute('stroke-dashoffset', f3(760 * (1 - bp)));
    const pm = S(t, T.max, P.rise); rMax.style.opacity = f3(pm); rMax.style.transform = `translateY(${f3((1 - pm) * 30)}px) scale(${f3(0.96 + 0.04 * pm)})`;

    // P : la voiture
    const carX = track(st, [[0, 1350], [T.car, 0, { f: 1.15, z: 1 }]]);
    const pOut = sm(REW[1] - 0.25, REW[1] + 0.2, t);
    LP.style.transform = tf(cW, 0, `translateX(${f3(carX * 0.15)}px)`);
    const big0 = sm(T.big, T.big + 0.35, st) * (1 - sm(REW[0] - 0.05, REW[0] + 0.2, t));
    set(LP, sm(T.car - 0.05, T.car + 0.05, st) * (1 - pOut) * (1 - 0.85 * big0) * (t < LOOP ? 1 : 0));
    const dip = 1.6 * Math.sin(Math.PI * clamp((st - T.dip) / 0.7, 0, 1)) * (st > T.dip ? 1 : 0);
    carBox.style.transform = `translateX(${f3(carX)}px) rotate(${f3(dip * 0.6)}deg)`;
    carBox.style.filter = LP.style.visibility === 'hidden' ? '' : `blur(${f3(clamp(Math.abs(carX) / 900, 0, 1) * 6)}px)`;
    // remise en état sous le trait de lumière : phares, rayure, tout le vernis (avec leurs débits)
    const [dP, dR, dT] = [T.deb[4], T.deb[5], T.deb[6]], SW = { f: 1.5, z: 1 };
    const sP = S(st, dP, SW), sR = S(st, dR, SW), sT = S(st, dT, { f: 0.8, z: 1 });
    const posP = lerp(-6, 56, sP), posR = lerp(46, 68, sR), posT = lerp(-6, 106, sT);
    const mask = (p) => (p <= -5 ? '' : `linear-gradient(90deg,transparent ${f3(p)}%,#000 ${f3(p + 3)}%)`);
    lay[0].style.webkitMaskImage = mask(posT); lay[1].style.webkitMaskImage = mask(Math.max(posP, posT)); lay[2].style.webkitMaskImage = mask(Math.max(posR > 46.5 ? posR : -6, posT));
    const swOn = Math.max(sm(dP - 0.02, dP + 0.05, st) * (1 - sm(dR - 0.1, dR, st)), sm(dR - 0.02, dR + 0.05, st) * (1 - sm(dT - 0.1, dT, st)), sm(dT - 0.02, dT + 0.05, st) * (1 - sm(dT + 0.6, dT + 0.8, st)));
    const swPos = st < dR - 0.02 ? posP : st < dT - 0.02 ? posR : posT;
    sweep.style.left = `${f3(CAR.w * swPos / 100)}px`; sweep.style.transform = 'rotate(5deg)'; set(sweep, swOn);
    const cd = S(st, T.contour, P.draw);
    cLine.setAttribute('stroke-dashoffset', f3(CC.len * (1 - cd))); cGlow.setAttribute('stroke-dashoffset', f3(CC.len * (1 - cd)));
    cLine.setAttribute('opacity', f3(sm(T.contour - 0.02, T.contour + 0.05, st) * (0.95 - 0.55 * sm(T.strike + 0.3, T.strike + 1.1, st))));
    cGlow.setAttribute('opacity', f3(sm(T.contour - 0.02, T.contour + 0.05, st) * (0.8 - 0.5 * sm(T.strike + 0.3, T.strike + 1.1, st))));
    pins.forEach(({ p, l }, i) => {
      const tp = T.pins[DEF[i][0]], a = S(st, tp, P.tag), o = sm(tp - 0.02, tp + 0.06, st) * (1 - sm(T.strike + 0.5, T.strike + 0.8, st));
      set(p, o); p.style.transform = `scale(${f3(lerp(2.2, 1, a))})`;
      set(l, o); l.style.transform = `translateY(${f3((1 - a) * 18)}px) scale(${f3(0.9 + 0.1 * a)})`;
    });
    const an = S(st, T.ann, P.rise);
    set(annP, sm(T.ann - 0.02, T.ann + 0.06, st) * (1 - sm(T.strike + 0.65, T.strike + 0.85, st))); annP.style.transform = `translateY(${f3((1 - an) * 24)}px)`;
    stPath.setAttribute('stroke-dashoffset', f3(200 * (1 - S(st, T.strike, P.pen))));
    const nn = S(st, T.annN, P.rise); annN.style.opacity = f3(nn); annN.style.transform = `translateY(${f3((1 - nn) * 20)}px)`;

    // H : compteur, jauge, mention
    const big = big0;
    const hud = sm(T.hud - 0.05, T.hud + 0.05, st) * (1 - big) * (1 - pOut) * (t < LOOP ? 1 : 0);
    LH.style.transform = tf(cW, 200);
    set(LH, hud);
    const vis4 = 1 - S(st, T.roll + 0.05, P.heavy);
    paintCounter(C, st, keys, [vis4, 1, 1, 1], (i) => ({ draw: S(st, T.hud + i * 0.07, P.draw), glass: S(st, T.hud + 0.22 + i * 0.07, P.heavy) }), 1);
    C.labL.forEach((s, i) => { const p = S(st, T.hud + 0.2 + i * 0.045, P.rise); s.style.opacity = f3(p); s.style.transform = `translateY(${f3((1 - p) * 18)}px)`; });
    const tg = T.hud + 0.3, gIn = S(st, tg, P.card); gauge.style.transform = `scaleX(${f3(0.6 + 0.4 * gIn)})`; set(gauge, sm(tg - 0.02, tg + 0.06, st));
    const sp = spent(st); gFill.style.width = `${f3(688 * clamp(sp / 750, 0, 1))}px`;
    gTxt.textContent = `Frais prévus · ${Math.round(sp)} / 750 €`;
    const lateK = Math.max(...LATE.map(([T]) => sm(T + 0.1, T + 0.16, st) * (1 - sm(T + 0.42, T + 0.55, st))));
    set(gStamp, lateK); gStamp.style.transform = `rotate(-8deg) scale(${f3(1 + 0.4 * (1 - lateK))})`;
    set(mention, sm(T.hud + 0.2, T.hud + 0.6, st) * (1 - sm(T.big - 0.15, T.big + 0.05, st)) * (1 - pOut) * (t < REW[0] ? 1 : 0));

    // N : les frais
    LN.style.transform = tf(cW, 120);
    const tl = T.deb[6] + 0.35, leave = S(st, tl, P.push);
    set(LN, sm(T.deb[0] - 0.05, T.deb[0], st) * (1 - sm(tl + 0.05, tl + 0.3, st)));      // la pile s'efface avant d'atteindre le compteur
    debs.forEach((d, i) => {
      const T = DEB[i][0], a = S(st, T, P.card);
      let k = 0; for (let j = i + 1; j < DEB.length; j++) k += S(st, DEB[j][0], P.card);
      const o = sm(T - 0.06, T, st) * clamp(1 - 0.34 * k, 0, 1);
      d.w.style.transform = `translate(${f3(150 + 1150 * (1 - a))}px,${f3(800 - 100 * k - 900 * leave)}px) scale(${f3(1 - 0.08 * k)})`;
      d.w.style.transformOrigin = '50% 0';
      d.w.style.filter = k > 0.05 ? `blur(${f3(1.6 * k)}px)` : '';
      set(d.w, o);
      if (o > 0.01) drawSeq(d.n.c, IMG[d.s], Math.max(0, st - T));
      const ss = S(st, T + 0.22, P.stamp);
      set(d.st, sm(T + 0.2, T + 0.26, st)); d.st.style.transform = `rotate(-8deg) scale(${f3(lerp(1.8, 1, ss))})`;
    });

    // W : ça sonne
    LW.style.transform = tf(cW, 80);
    const tw = T.sonne - 0.13;
    set(LW, sm(tw - 0.05, tw + 0.1, st) * (1 - sm(T.bubble, T.bubble + 0.3, st)));
    const u = clamp((st - tw - 0.1) / (T.bubble - tw - 0.25), 0, 1), dv = 1 + Math.min(5, Math.floor(5 * Math.pow(u, 0.8) + 1e-6)), pf = (5 * Math.pow(u, 0.8)) % 1;
    paintFlaps(flD.slice(0, 2), st, tw);
    flD[2].s.textContent = String(dv); flD[2].d.style.opacity = f3(sm(tw, tw + 0.1, st));
    flD[2].d.style.transform = `perspective(700px) rotateX(${f3(u < 1 ? (1 - Math.min(1, pf * 3)) * 70 : 0)}deg)`;
    msgs.forEach((m, i) => {
      const a = S(st, TM[i], P.card); let k = 0; for (let j = i + 1; j < TM.length; j++) k += S(st, TM[j], P.card);
      m.style.transform = `translate(${f3((1 - a) * 700)}px,${f3(940 - 78 * k)}px) scale(${f3(1 - 0.05 * k)})`;
      m.style.transformOrigin = '0 50%';
      set(m, sm(TM[i] - 0.04, TM[i] + 0.02, st) * clamp(1 - 0.22 * k, 0, 1));
    });
    const nm = TM.filter((x) => st >= x + 0.05).length;
    mCount.textContent = `Messages · ${nm}`; set(mCount, sm(TM[0] - 0.02, TM[0] + 0.06, st)); mCount.style.transform = `scale(${f3(1 + 0.08 * Math.max(...TM.map((x) => sm(x, x + 0.04, st) * (1 - sm(x + 0.04, x + 0.16, st)))))})`;

    // R : la vente
    LR.style.transform = tf(cW, 100);
    set(LR, sm(T.bubble - 0.06, T.bubble + 0.04, st) * (1 - sm(T.big - 0.05, T.big + 0.15, st)));
    const bz = st > T.bubble && st < T.bubble + 0.5 ? Math.sin((st - T.bubble) * 90) * 6 * (1 - (st - T.bubble) / 0.5) : 0;
    const bi = S(st, T.bubble, P.card);
    bubble.style.transform = `translate(${f3(bz)}px,${f3((1 - bi) * 120)}px) scale(${f3(0.9 + 0.1 * bi)})`;
    const rb = S(st, T.reply, P.card), rOut = S(st, T.credit - 0.05, P.push);
    reply.style.transform = `translate(${f3((1 - rb) * 320)}px,${f3(-60 * rOut)}px) scale(${f3(0.9 + 0.1 * rb)})`;
    set(reply, sm(T.reply - 0.02, T.reply + 0.06, st) * (1 - sm(T.credit - 0.05, T.credit + 0.15, st)));
    const ca = S(st, T.credit, P.card);
    credit.d.style.transform = `translate(${f3(150 + 1150 * (1 - ca))}px,860px)`; set(credit.d, sm(T.credit - 0.02, T.credit + 0.04, st));
    if (st > T.credit - 0.05 && st < T.big + 0.25) drawSeq(credit.c, IMG.cles, st - T.credit);

    // 9 : 974 €
    set(dim, big * 0.9);
    L9.style.transform = tf(cW, 160, `scale(${f3(1 + 0.05 * sm(T.big + 0.3, REW[0], st))})`);      // poussée lente jusqu'au rembobinage
    set(L9, big);
    const s9 = S(st, T.big + 0.05, { f: 1.4, z: 0.85 });
    big9.style.transform = `scale(${f3(0.86 + 0.14 * s9)})`; set(glow9, 0.4 + 0.6 * S(st, T.big + 0.15, P.heavy));
    const kb = S(st, T.keb, P.card);
    kebW.style.transform = `translate(${f3(1150 * (1 - kb))}px,0) scale(.82)`; set(kebW, sm(T.keb - 0.02, T.keb + 0.04, st));
    const ks = S(st, T.stamp9, P.stamp); set(kebSt, sm(T.stamp9 - 0.02, T.stamp9 + 0.04, st)); kebSt.style.transform = `rotate(-8deg) scale(${f3(lerp(1.8, 1, ks))})`;
    writeWord(pk1, st, T.pk1, 0.035); writeWord(pk2, st, T.pk2, 0.035);

    // D : ce qui a fait la marge
    const dIn = sm(REW[1] - 0.25, REW[1] + 0.25, t) * (t < LOOP ? 1 : 1 - sm(LOOP, LOOP + 0.6, t));
    const cF = camF(t);
    LD.style.transform = tf(cF, 0);
    set(LD, dIn);
    if (dIn > 0.01) drawSeq(dCv, IMG.calc, t - REW[1] + 0.25);
    const t1 = S(t, T.tout, P.rise), t2 = S(t, T.jour0b, P.rise);
    dT1.style.opacity = f3(t1); dT1.style.transform = `translateY(${f3((1 - t1) * 26)}px)`;
    dT2.style.opacity = f3(t2); dT2.style.transform = `translateY(${f3((1 - t2) * 26)}px)`;
    decs.forEach((d, i) => {
      const a = S(t, TD[i], P.card);
      d.style.transform = `perspective(1400px) translateY(${f3((1 - a) * 220)}px) rotateX(${f3((1 - a) * 35)}deg)`;
      set(d, sm(TD[i] - 0.02, TD[i] + 0.06, t));
    });
    set(dM, S(t, TD[0], P.rise));

    // effets
    set(rewFx, sm(REW[0], REW[0] + 0.15, t) * (1 - sm(REW[1] - 0.15, REW[1], t)) * 0.9);
    rewFx.style.transform = `translateY(${f3((t * 900) % 6)}px)`;
    set(flash, 0.5 * sm(T.max, T.max + 0.08, t) * (1 - sm(T.max + 0.08, T.max + 0.5, t)) + 0.35 * sm(T.big + 0.05, T.big + 0.13, st) * (1 - sm(T.big + 0.13, T.big + 0.55, st)) * (t < REW[0] ? 1 : 0) + 0.5 * sm(LOOP, LOOP + 0.2, t) * (1 - sm(LOOP + 0.2, LOOP + 0.7, t)));
  }

  // flou de bougé : obturateur ouvert sur les gestes rapides
  const WIN = [[T.car, T.car + 0.95, 0.8], [T.jOut, T.jOut + 0.6, 0.6], [T.big - 0.05, T.big + 0.45, 0.6], [REW[0], REW[1], 0.7], [T.out, T.out + 0.5, 0.5]];
  [...DEB.map((d) => d[0]), ...TM, T.bubble, T.reply, T.credit, T.keb, ...TD].forEach((x) => WIN.push([x - 0.04, x + 0.35, 0.6]));
  const fast = (t) => { let s = 0; for (const [a, b, v] of WIN) s = Math.max(s, v * sm(a - 0.05, a + 0.05, t) * (1 - sm(b - 0.05, b + 0.05, t))); return s; };
  window.shutter = (t) => Math.max(0.12, fast(t));
  window.samples = (t) => (fast(t) > 0.3 ? 4 : 1);
  // temps des événements, lus par scripts/audio-mo9.py pour poser les bruitages (scripts/events.mjs → film-mo9/events.json)
  window.EVENTS = { ...T, deb: DEB.map((d) => d[0]), late: LATE.map((d) => d[0]), tm: TM, td: TD, rew: REW, loop: LOOP, dur: DUR, stTo: ST_TO };
  window.seek = (t) => paint(t >= DUR ? t - DUR : t);
  paint(0);
  window.filmReady = true;
})();
