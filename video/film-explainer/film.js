// UTOPICAR — film explicatif 60 s, 1080x1920, 30 i/s, 120 BPM (mesure = 2 s).
// Grammaire inspirée de la référence 3 : grille blanche, phrases tapées en deux graisses, aplat d'accent plein cadre,
// chapitres « mot géant + titre + interrupteur », curseur qui manipule la vraie interface, chiffres géants,
// Sans / Avec sur fond sombre, récap en trois phrases, cartes qui jaillissent, pastille logo cliquée.
// Contenu original, vraies captures (données démo). Contrat : window.seek(t) peint la frame t.
const { spring, track, clamp, lerp, noise } = Motion;
const { el, show, smooth, inOut, bump, place, crop, shot, text, typeText, marker, cursor, moveCursor, fit, hash } = Kit;
const TL = await (await fetch('../timeline-explainer.json')).json();
const U1 = await (await fetch('../assets/ui/layout.json')).json();
const U2 = await (await fetch('../assets/ui2/layout.json')).json();
const ICONS = await (await fetch('../assets/ui2/dock-icons.json')).json();
const M = TL.marks;
const stage = document.getElementById('stage');
// logo fourni par l'utilisateur (tuile sombre, voiture blanche, flèche orange), retracé en vecteur
const LOGO = (await (await fetch('../assets/brand/logo.svg')).text()).replace(/<!--.*?-->/s, '');
const CAR = LOGO;
const inWin = (t, a, b) => t >= a && t < b;

// dimensions réelles des captures
const SRC = {};
async function load(key, url) { const i = new Image(); i.src = url; await i.decode(); SRC[key] = { url, w: i.naturalWidth, h: i.naturalHeight }; }
for (const k of Object.keys(U2.shots)) await load(k, `../assets/ui2/${k}.png`);
for (const k of ['card-lv1', 'card-lv2', 'lg1', 'lg2', 'lg3', 'lg4', 'lg5', 'lg6']) await load(k, `../assets/ui/${k}.png`);
const cropOf = (parent, key, r, k, cls) => crop(parent, SRC[key].url, SRC[key].w, SRC[key].h, r, k, cls);
const full = (parent, key, k, cls) => { const s = SRC[key]; return crop(parent, s.url, s.w, s.h, { x: 0, y: 0, w: s.w / 3, h: s.h / 3 }, k, cls); };
const dims = (key, k, pad = 0) => ({ w: (SRC[key].w / 3 - 2 * pad) * k, h: (SRC[key].h / 3 - 2 * pad) * k });
// carte réelle détourée : on retire la marge de page capturée autour, coins arrondis du site (px CSS)
const PAD = { dcard1: [8, 22], dcard2: [8, 22], kpi1: [8, 18], kpi2: [8, 18], kpi3: [8, 18], kpi4: [8, 18], kpi5: [8, 18], kpi6: [8, 18], kpis: [8, 0],
  qsform: [10, 22], lu: [8, 16], 'card-lv1': [6, 22], 'card-lv2': [6, 22], best: [10, 22], pipe: [10, 22], alerts: [10, 22], mchart: [10, 22], lvmini: [10, 22],
  ticket: [0, 0], vrow1: [2, 0], vrow2: [2, 0], vrow3: [2, 0], vrow4: [2, 0], schip: [6, 17], tktop: [0, 0], plaf: [8, 16] };
function card(parent, key, k) {
  const [pd, rad] = PAD[key] || [0, 0]; const s = SRC[key];
  const e = el('div', 'abs', parent); e.style.borderRadius = rad * k + 'px'; e.style.overflow = 'hidden';
  crop(e, s.url, s.w, s.h, { x: pd, y: pd, w: s.w / 3 - 2 * pd, h: s.h / 3 - 2 * pd }, k); e._pad = pd; return e;
}

/* ================= calques de fond ================= */
const bgW = el('div', 'layer grid', stage);
const bgD = el('div', 'layer grid dark', stage);
const bgY = el('div', 'layer grid yel', stage);

/* ================= chips flottantes (vrais morceaux d'UI) ================= */
const CHIP_DEF = [
  ['dcard1', { x: 129, y: 122, w: 71, h: 23 }], ['dcard1', { x: 206, y: 122, w: 76, h: 23 }], ['dcard2', { x: 129, y: 122, w: 50, h: 23 }],
  ['vrow1', { x: 20, y: 15, w: 107, h: 23 }], ['dcard2', { x: 185, y: 122, w: 76, h: 23 }], ['vrow3', { x: 242, y: 15, w: 102, h: 23 }],
  ['vrow2', { x: 20, y: 15, w: 103, h: 23 }], ['schip', { x: 6, y: 6, w: 167, h: 34 }], ['vrow1', { x: 252, y: 15, w: 67, h: 23 }],
  ['vrow4', { x: 20, y: 15, w: 108, h: 23 }], ['dcard1', { x: 196, y: 155, w: 106, h: 22 }], ['dcard2', { x: 196, y: 155, w: 106, h: 22 }],
];
// positions de départ (hors bande centrale du texte), profondeur (échelle + flou)
const CHIP_POS = [[250, 420, 1.1], [820, 330, 0.8], [170, 700, 0.7], [760, 620, 1.15], [520, 250, 0.6], [880, 1260, 0.9],
  [230, 1250, 1.05], [600, 1450, 0.75], [140, 1540, 0.6], [900, 1560, 1.2], [360, 1700, 0.85], [800, 1760, 0.65]];
const chipL = el('div', 'layer', stage);
const chips = CHIP_DEF.map(([k, r]) => { const t = el('div', 'tile', chipL); cropOf(t, k, r, 2.9); return t; });
// lignes de calcul du vrai rapport (problème 2)
const ledL = el('div', 'layer', stage);
const leds = ['lg1', 'lg2', 'lg3', 'lg4', 'lg5', 'lg6'].map(k => { const t = el('div', 'tile', ledL); t.style.padding = '10px 16px'; full(t, k, 1.35); return t; });
const LED_POS = [[300, 470, -7], [790, 560, 5], [260, 1330, 4], [820, 1250, -5], [540, 380, 2], [560, 1560, -3]];

/* ================= textes ================= */
const txtL = el('div', 'layer', stage);
const P1 = text(txtL, [['Des annonces ', 'lt'], ['partout…', 'bd']]);
const P2 = text(txtL, [['Des calculs ', 'lt'], ['à la main…', 'bd']]);
const P3 = text(txtL, [['Et ta marge ? ', 'lt'], ['Au pif.', 'bd']]);
const P4 = text(txtL, [['Il est temps de', 'lt'], ['\n', ''], ['compter ', 'bd'], ['juste.', 'bd k']]);
const ALL = text(txtL, [['Tout ton achat-revente', 'lt'], ['\n', ''], ['dans un ', 'bd'], ['seul outil.', 'bd k']]);
for (const b of [P1, P2, P3, P4]) b.style.fontSize = '88px';
ALL.style.fontSize = '76px';
const addMark = (box) => { const w = box.querySelector('.k'); const m = el('div', 'mk', w); return m; };
const mkP4 = addMark(P4), mkALL = addMark(ALL);

/* ================= flash jaune + logo ================= */
const lockY = el('div', 'lock', stage); lockY.innerHTML = `<span class="logo">${LOGO.replace('<svg', '<svg width="150" height="143"')}</span><span class="wm" style="color:#1A1310">${U1.logo.text}</span>`;
const markB = el('div', 'mark', stage); markB.innerHTML = CAR;

/* ================= chapitres ================= */
function chapter(word, label) {
  const g = el('div', 'layer'); stage.appendChild(g);
  const giant = el('div', 'giant', g); giant.textContent = word;
  const lab = text(g, [[label, 'bd']], 'label');
  const tog = el('div', 'tog', g); const kn = el('div', 'kn', tog);
  return { g, giant, lab, tog, kn };
}
const CH = [chapter('Analyse', 'Analyser une annonce'), chapter('Recherche', 'Recherche en direct'), chapter('Parc', 'Parc et tableau de bord')];
const CH_T = [M.ch1, M.ch2, M.ch3];
function drawChapter(c, t, t0) {
  const on = inWin(t, t0, t0 + 2); show(c.g, on); if (!on) return;
  const gin = spring(t - t0, 'heavy'), gout = spring(t - (t0 + 1.55), 'default');
  place(c.giant, 540 + (1 - gin) * 260 - gout * 520 - (t - t0) * 40, 790, 1, 0, gin - gout);
  typeText(c.lab, t, t0 + 0.15, t0 + 1.55, 0.022);
  c.lab.style.transform = `translate(0px,${790 - 42}px)`;
  const tin = spring(t - (t0 + 0.3), 'default'), tout = spring(t - (t0 + 1.6), 'snappy');
  place(c.tog, 540, 1000 - tout * 40, 0.6 + 0.4 * tin - 0.2 * tout, 0, tin - tout);
  const on2 = spring(t - (t0 + 1.0), 'snappy');
  c.kn.style.transform = `translateX(${(on2 * 68).toFixed(2)}px)`;
  const a = clamp(on2, 0, 1); c.tog.style.background = `rgb(${lerp(230, 255, a) | 0},${lerp(233, 90, a) | 0},${lerp(238, 31, a) | 0})`;
}

/* ================= démo 1 : analyser ================= */
const d1 = el('div', 'layer', stage);
const K1 = 2.1;
const luC = card(d1, 'lu', K1);
const tkCard = el('div', 'card', d1); const tkD = dims('ticket', K1);
Object.assign(tkCard.style, { width: tkD.w + 40 + 'px', height: tkD.h + 30 + 'px' });
const tkImg = full(tkCard, 'ticket', K1); Object.assign(tkImg.style, { left: '20px', top: '14px' });
const plafLift = el('div', 'abs', d1); cropOf(plafLift, 'ticket', U2.ticketPlaf, K1);
plafLift.style.borderRadius = '28px'; plafLift.style.overflow = 'hidden';
const hlTotal = el('div', 'hl', tkCard);

/* ================= chiffres géants ================= */
function stat(num, pre, key, bg) {
  const g = el('div', 'layer'); stage.appendChild(g);
  const blurs = bg.map(([k, r, x, y, s, rot]) => { const e = el('div', 'tile', g); e.style.padding = '12px'; if (r) cropOf(e, k, r, 1.9); else full(e, k, 1.9); e._p = [x, y, s, rot]; return e; });
  const n = text(g, [[num, 'bd']]); n.style.fontSize = '250px'; n.style.letterSpacing = '-.03em'; n.style.fontStretch = '112%';
  const sub = text(g, [[pre, 'lt'], [key, 'bd k']]); sub.style.fontSize = '70px';
  const mk = addMark(sub);
  return { g, blurs, n, sub, mk };
}
const S1 = stat('7 500 €', 'à ne pas ', 'dépasser', [['plaf', null, 180, 430, 0.85, -6], ['tktop', null, 900, 1450, 0.9, 5], ['dcard1', null, 950, 380, 0.7, 4], ['lu', null, 120, 1500, 0.75, -4]]);
const S2 = stat('1 450 €', 'sous la ', 'cote', [['card-lv1', { x: 0, y: 0, w: 374, h: 200 }, 170, 420, 0.8, -5], ['schip', null, 930, 360, 1.1, 6], ['qsform', { x: 0, y: 400, w: 382, h: 150 }, 900, 1480, 0.8, 4], ['card-lv2', { x: 0, y: 360, w: 374, h: 150 }, 160, 1500, 0.75, -3]]);
const S3 = stat('14 820 €', 'de marge ', 'réalisée', [['kpi1', null, 170, 420, 0.9, -6], ['pipe', null, 930, 400, 0.7, 5], ['vrow2', null, 880, 1500, 0.8, 4], ['kpi4', null, 180, 1490, 0.85, -4]]);
const STATS = [[S1, M.stat1], [S2, M.stat2], [S3, M.stat3]];
function drawStat(s, t, t0) {
  const on = inWin(t, t0, t0 + 2); show(s.g, on); if (!on) return;
  const out = t0 + 1.75;
  s.blurs.forEach((e, i) => {
    const [x, y, sc, rot] = e._p; const p = spring(t - (t0 + i * 0.05), 'default'), q = spring(t - out, 'snappy');
    const dx = (x - 540) * (1 - p) * -0.6, dy = (y - 960) * (1 - p) * -0.6;
    place(e, x + dx + (t - t0) * (x < 540 ? -18 : 18), y + dy + (t - t0) * -14, sc * (0.7 + 0.3 * p), rot, (p - q) * 0.9, 7);
  });
  fit(s.n, 900, 250);
  const nIn = t0 + 0.05;
  s.n.chars.forEach((c, i) => {
    const p = spring(t - (nIn + i * 0.045), 'heavy'), q = spring(t - (out + i * 0.02), 'snappy');
    c.style.opacity = clamp(p * 1.8 - q * 1.5, 0, 1).toFixed(3); c.style.transform = `translateY(${((1 - p) * 120 - q * 90).toFixed(2)}px)`;
  });
  s.n.style.transform = `translate(0px,${800 - s.n.offsetHeight / 2}px)`;
  typeText(s.sub, t, t0 + 0.35, out, 0.025);
  s.sub.style.transform = `translate(0px,${1010}px)`;
  marker(t, s.mk, t0 + 0.8, out);
}

/* ================= démo 2 : recherche ================= */
const d2 = el('div', 'layer', stage);
const K2 = 1.9;
const qsC = card(d2, 'qsform', K2);
const qsShade = el('div', 'shade', qsC);
Object.assign(qsShade.style, { left: (U2.qsGo.x - 10) * K2 + 'px', top: (U2.qsGo.y - 10) * K2 + 'px', width: U2.qsGo.w * K2 + 'px', height: U2.qsGo.h * K2 + 'px' });
const lv2 = card(d2, 'card-lv2', K2);
const lv1 = card(d2, 'card-lv1', K2);
const LV = U1.shots['card-lv1'];
const hlSous = el('div', 'hl', lv1);
const sous = U1.cote.sous; Object.assign(hlSous.style, { left: (sous.x - LV.x - 10) * K2 + 'px', top: (sous.y - LV.y - 7) * K2 + 'px', width: (sous.w + 8) * K2 + 'px', height: (sous.h + 2) * K2 + 'px' });

/* ================= démo 3 : parc + tableau ================= */
const d3 = el('div', 'layer', stage);
const K3 = 1.95;
const listCard = el('div', 'card', d3); const rowD = dims('vrow1', K3);
Object.assign(listCard.style, { width: rowD.w + 24 + 'px', height: rowD.h * 4 + 28 + 'px' });
const rows = ['vrow1', 'vrow2', 'vrow3', 'vrow4'].map((k, i) => { const r = full(listCard, k, K3); r.style.left = '12px'; r.style.top = 14 + i * rowD.h + 'px'; return r; });
const K4 = 2.2;
const kpis = [1, 2, 3, 4, 5, 6].map(i => card(d3, 'kpi' + i, K4));

/* ================= sans / avec ================= */
const sa = el('div', 'layer', stage);
const tagSans = el('div', 'tag', sa); tagSans.textContent = 'Sans';
const tagAvec = el('div', 'tag', sa); tagAvec.innerHTML = `Avec <span class="mini">${CAR}</span><b>${U1.logo.text}</b>`;
const skel = el('div', 'skel', sa); el('div', 'ph', skel);
[[270, 56, 380], [270, 104, 300], [270, 152, 220]].forEach(([x, y, w]) => { const b = el('div', 'b', skel); Object.assign(b.style, { left: x + 'px', top: y + 'px', width: w + 'px' }); });
const skPr1 = el('div', 'pr', skel); skPr1.textContent = '9 500 €';
const skPr2 = el('div', 'pr', skel); skPr2.textContent = '6 400 €';
const skQ = el('div', 'q', skel); skQ.textContent = '?';
const K5 = 2.0;
const av1 = card(sa, 'dcard1', K5);
const av2 = card(sa, 'dcard2', K5);
const hlGo = el('div', 'hl', av2);
Object.assign(hlGo.style, { left: (U2.dcard2Fig.x - 12) * K5 + 'px', top: (U2.dcard2Fig.y - 9) * K5 + 'px', width: (U2.dcard2Fig.w + 8) * K5 + 'px', height: (U2.dcard2Fig.h + 3) * K5 + 'px' });

/* ================= récap ================= */
const recL = el('div', 'layer', stage);
const R1 = text(recL, [['Tu ', 'lt'], ['analyses.', 'bd']]);
const R2 = text(recL, [['Tu ', 'lt'], ['négocies.', 'bd']]);
const R3 = text(recL, [['Tu ', 'bd'], ['revends.', 'bd']]);
for (const b of [R1, R2, R3]) b.style.fontSize = '104px';

/* ================= explosion + fin ================= */
const burst = el('div', 'layer', stage);
const BURST_K = ['ticket', 'kpis', 'dcard1', 'vrow1', 'qsform', 'best', 'dcard2', 'mchart', 'kpi3', 'vrow3', 'lu', 'pipe', 'card-lv1', 'alerts', 'vrow2', 'lvmini', 'kpi2', 'schip'];
const bursts = BURST_K.map((k, i) => {
  const e = card(burst, k, 1.3);
  const a = (i / BURST_K.length) * Math.PI * 2 + hash(i) * 0.5, d = 900 + hash(i + 7) * 500;
  e._p = { a, d, t: hash(i + 3) * 0.7, r: (hash(i + 11) - 0.5) * 30 }; return e;
});
const endL = el('div', 'layer', stage);
const drift = ['dcard1', 'kpi3', 'vrow1', 'best', 'dcard2', 'kpi2'].map(k => card(endL, k, 1.5));
const DRIFT = [[180, 380, -8], [900, 330, 7], [140, 1480, 6], [930, 1560, -6], [560, 190, 3], [520, 1720, -4]];
const pill = el('div', 'pill', endL); pill.innerHTML = `${CAR}<span class="wm">${U1.logo.text}</span>`;
const CTA = text(endL, [['Commente ', 'bdw'], ['GARAGE', 'bd g']]); CTA.style.fontSize = '84px';
CTA.querySelector('.g').classList.add('ctaw'); const ctaBg = el('div', 'ctabg', CTA.querySelector('.g'));
const CTA2 = text(endL, [["pour recevoir l'accès.", 'lt onDark']]); CTA2.style.fontSize = '58px';

/* ================= curseurs ================= */
const cur = cursor(stage, false);
const curD = cursor(stage, true);

/* ================= seek ================= */
window.seek = function (t) {
  // fonds
  const dark = inWin(t, M.sans, M.r1) || t >= M.burst;
  const yel = inWin(t, M.flash, M.all) || inWin(t, M.r3, M.burst);
  show(bgD, dark); show(bgY, yel); show(bgW, !dark && !yel);

  // ---- problème : chips flottantes (0 → 6), aspirées vers la pastille (10 → 11.5)
  const chipOn = t < M.p4 || inWin(t, M.all, M.all + 2.2);
  show(chipL, chipOn);
  if (chipOn) chips.forEach((c, i) => {
    const [x0, y0, d] = CHIP_POS[i];
    const nx = noise(i + 1, t * 0.35) * 26, ny = noise(i + 21, t * 0.3) * 30;
    if (t < M.p4) {
      const pin = spring(t - (0.05 + i * 0.07), 'default');
      const fallT = Math.max(0, t - (M.p3 + 0.1 + hash(i) * 0.25));
      const fy = 900 * fallT * fallT * (0.8 + hash(i + 5) * 0.5), fr = fallT * (hash(i + 2) - 0.5) * 160;
      place(c, x0 + nx, y0 + ny + (1 - pin) * 80 + fy - t * 12, d * (0.85 + 0.15 * pin), noise(i + 40, t * 0.2) * 6 + fr, pin, Math.abs(d - 1) * 9);
    } else {
      // retour depuis les bords puis aspiration dans la pastille (540, 780)
      const ta = M.all + 0.5 + i * 0.12, p = inOut(ta - 0.45, ta + 0.25, t);
      const ex = x0 < 540 ? -200 : 1280, ey = y0 + (y0 < 960 ? -120 : 120);
      const x = lerp(ex, 540, p), y = lerp(ey, 790, p);
      place(c, x, y, d * (1 - p * 0.85), (1 - p) * (x0 < 540 ? -20 : 20), p < 0.98 ? 1 : 0, Math.abs(d - 1) * 6 * (1 - p));
    }
  });
  const ledOn = inWin(t, M.p2 - 0.1, M.p4); show(ledL, ledOn);
  if (ledOn) leds.forEach((e, i) => {
    const [x, y, r] = LED_POS[i]; const p = spring(t - (M.p2 + i * 0.12), 'default');
    const fallT = Math.max(0, t - (M.p3 + 0.15 + hash(i + 9) * 0.25)); const fy = 1000 * fallT * fallT;
    place(e, x + (1 - p) * (x < 540 ? -300 : 300) + noise(i + 60, t * 0.3) * 20, y + fy, 0.95, r + fallT * 40 * (i % 2 ? 1 : -1), p, i % 3 === 1 ? 4 : 0);
  });

  // ---- textes du problème
  const tx = [[P1, M.p1 + 0.2, M.p2 - 0.2, M.p2], [P2, M.p2 + 0.1, M.p3 - 0.2, M.p3], [P3, M.p3 + 0.1, M.p4 - 0.2, M.p4], [P4, M.p4 + 0.1, M.flash - 0.25, M.flash]];
  for (const [b, a, o, cut] of tx) { const on = inWin(t, a - 0.05, Math.min(o + 0.5, cut)); show(b, on); if (on) { typeText(b, t, a, o, 0.03); b.style.transformOrigin = '540px 60px'; b.style.transform = `translate(0px,${960 - b.offsetHeight / 2}px) scale(${(1 + smooth(a, o + 0.2, t) * 0.08).toFixed(4)})`; } }
  marker(t, mkP4, M.p4 + 1.0, M.flash - 0.25);

  // ---- flash jaune + logo monochrome
  const fOn = inWin(t, M.flash, M.all); show(lockY, fOn);
  if (fOn) { const p = spring(t - M.flash, 'heavy'); place(lockY, 540, 960 + (1 - p) * 40, (1.18 - 0.18 * p) * (1 + smooth(M.flash, M.all, t) * 0.06), 0, clamp(p * 2, 0, 1)); }

  // ---- tout-en-un : pastille, chips aspirées, phrase
  const bOn = inWin(t, M.all, M.ch1); show(markB, bOn);
  if (bOn) {
    const p = spring(t - M.all, 'heavy'); let gulp = 0;
    for (let i = 0; i < chips.length; i++) gulp = Math.max(gulp, bump(t, M.all + 0.72 + i * 0.12, 0.06) * 0.06);
    const q = spring(t - (M.ch1 - 0.3), 'snappy');
    const drift = smooth(M.all, M.ch1, t);
    place(markB, 540, 790 - drift * 40 + noise(5, t * 0.6) * 8, (0.2 + 0.8 * p) * (1 + gulp) * (1 - q) * (1 + drift * 0.12), (1 - p) * -14 + noise(6, t * 0.4) * 2, 1 - q);
  }
  const aOn = inWin(t, M.all + 1.4, M.ch1); show(ALL, aOn);
  if (aOn) { typeText(ALL, t, M.all + 1.5, M.ch1 - 0.35, 0.025); ALL.style.transform = `translate(0px,${1090 - smooth(M.all, M.ch1, t) * 30}px) scale(${1 + smooth(M.all + 1.5, M.ch1, t) * 0.05})`; ALL.style.transformOrigin = '540px 60px'; marker(t, mkALL, M.all + 2.7, M.ch1 - 0.35); }

  // ---- chapitres
  CH.forEach((c, i) => drawChapter(c, t, CH_T[i]));

  // ---- démo 1
  const d1On = inWin(t, M.demo1, M.stat1); show(d1, d1On);
  if (d1On) {
    const t0 = M.demo1;
    const li = spring(t - t0, 'default'), lo = spring(t - (t0 + 0.55), 'default');
    const lu = dims('lu', K1); place(luC, 540, 820 + (1 - li) * 240 - lo * 1400, 0.92 + 0.08 * li, 0, li - lo * 0.6, lo * 6);
    const ti = spring(t - (t0 + 0.5), 'default'), to = spring(t - (t0 + 3.6), 'default');
    const push = smooth(t0 + 0.5, t0 + 4, t);
    const tkH = tkD.h + 30;
    // le ticket monte, puis la caméra glisse doucement vers le bas du ticket
    const ty = 960 + (1 - ti) * 1500 - push * 170 + to * 1700;
    place(tkCard, 540, ty, 1 + push * 0.03, 0, 1);
    const top = ty - tkH / 2 * (1 + push * 0.03);
    const kk = K1 * (1 + push * 0.03);
    // surligneur sur « Il vous reste − 1 200 € »
    const tt = U2.ticketTotal;
    Object.assign(hlTotal.style, { left: 20 + (tt.x + 150) * K1 + 'px', top: 14 + (tt.y + 22) * K1 + 'px', width: 172 * K1 + 'px', height: 44 * K1 + 'px' });
    marker(t, hlTotal, t0 + 1.7, null); hlTotal.style.opacity = (0.55 * (1 - spring(t - (t0 + 3.6), 'snappy'))).toFixed(3);
    // la carte « Ne dépassez pas » se soulève au clic
    const lift = spring(t - (t0 + 2.5), 'default');
    const pr = U2.ticketPlaf; const px0 = 540 - (tkD.w + 40) / 2 * (1 + push * 0.03) + (20 + (pr.x + pr.w / 2) * K1) * (1 + push * 0.03);
    const py0 = top + (14 + (pr.y + pr.h / 2) * K1) * (1 + push * 0.03);
    show(plafLift, t >= t0 + 2.45);
    plafLift.style.boxShadow = `0 ${(lift * 40).toFixed(1)}px ${(lift * 80).toFixed(1)}px -30px rgba(12,15,20,${(lift * 0.4).toFixed(3)})`;
    place(plafLift, px0, py0 - lift * 26, (1 + push * 0.03) * (1 + lift * 0.07), 0, 1);
    const curK = [[t0 - 0.4, 820, 1500], [t0 + 0.1, 520, 900], [t0 + 1.3, 860, 0], [t0 + 2.1, 700, 0]];
    // cibles calculées sur la position réelle (la carte bouge)
    const totX = 540 - (tkD.w + 40) / 2 + (20 + (tt.x + 290) * K1), totY = 960 - tkH / 2 + (14 + (tt.y + 44) * K1) - 170 * smooth(t0 + 0.5, t0 + 4, t0 + 1.8);
    curK[2] = [t0 + 1.3, totX, totY];
    curK[3] = [t0 + 2.05, px0 + 40, py0 + 20];
    moveCursor(cur, t, curK, [t0 + 2.5], t0, M.stat1 - 0.3);
  }

  // ---- chiffres
  STATS.forEach(([s, t0]) => drawStat(s, t, t0));

  // ---- démo 2
  const d2On = inWin(t, M.demo2, M.stat2); show(d2, d2On);
  if (d2On) {
    const t0 = M.demo2; const qd = dims('qsform', K2, 10);
    const qi = spring(t - t0, 'default'), qo = spring(t - (t0 + 1.5), 'default');
    const qx = 540, qy = 900 + (1 - qi) * 1300 - qo * 700;
    place(qsC, qx, qy, (1 - qo * 0.25) * (1 + smooth(t0, t0 + 1.5, t) * 0.04), 0, 1 - qo * 0.9, qo * 8);
    qsShade.style.opacity = bump(t, t0 + 1.0, 0.15).toFixed(3);
    const li1 = spring(t - (t0 + 1.5), 'default'), li2 = spring(t - (t0 + 1.7), 'default');
    const push = smooth(t0 + 1.5, t0 + 4, t);
    const lvd = dims('card-lv1', K2, 6);
    place(lv2, 560 + 40 * li2, 1000 + (1 - li2) * 1500, 0.93, 3 * li2, 1, 2);
    place(lv1, 540, 1000 + (1 - li1) * 1500 - push * 90, 1 + push * 0.03, -0.6 * li1, 1);
    marker(t, hlSous, t0 + 3.0, null); hlSous.style.opacity = '0.75';
    const goX = qx - qd.w / 2 + (U2.qsGo.x - 10 + U2.qsGo.w * 0.62) * K2, goY = 900 - qd.h / 2 + (U2.qsGo.y - 10 + U2.qsGo.h * 0.6) * K2;
    const sX = 540 - lvd.w / 2 + (sous.x - LV.x - 6 + sous.w * 0.9) * K2, sY = 1000 - lvd.h / 2 + (sous.y - LV.y - 6 + 16) * K2 - 90 * smooth(t0 + 1.5, t0 + 4, t0 + 2.9);
    moveCursor(cur, t, [[t0 - 0.2, 900, 1700], [t0 + 0.2, goX, goY], [t0 + 2.2, sX, sY]], [t0 + 1.0], t0, M.stat2 - 0.3);
  }

  // ---- démo 3
  const d3On = inWin(t, M.demo3, M.stat3); show(d3, d3On);
  if (d3On) {
    const t0 = M.demo3;
    const ci = spring(t - t0, 'default'), co = spring(t - M.kpis, 'default');
    const lh = rowD.h * 4 + 28;
    place(listCard, 540 - co * 1100, 930 + (1 - ci) * 300, 1, 0, ci);
    rows.forEach((r, i) => { const p = spring(t - (t0 + 0.15 + i * 0.25), 'default'); r.style.opacity = clamp(p * 1.5, 0, 1).toFixed(3); r.style.transform = `translateY(${((1 - p) * 60).toFixed(2)}px)`; });
    const kd = dims('kpi1', K4, 8);
    kpis.forEach((e, i) => {
      const col = i % 2, row = Math.floor(i / 2); const x = 540 + (col ? 1 : -1) * (kd.w / 2 + 12), y = 960 + (row - 1) * (kd.h + 24);
      const p = spring(t - (M.kpis + i * 0.125), 'default'); const lift = i === 2 ? spring(t - (M.kpis + 1.2), 'default') : 0;
      e.style.boxShadow = lift > 0.01 ? `0 ${(lift * 36).toFixed(1)}px ${(lift * 70).toFixed(1)}px -28px rgba(12,15,20,${(lift * 0.45).toFixed(3)})` : '';
      e.style.zIndex = i === 2 ? 2 : 1;
      place(e, x + (1 - p) * (col ? 300 : -300), y + (1 - p) * 200 - lift * 20, (0.7 + 0.3 * p) * (1 + lift * 0.07), 0, p);
    });
    const r1X = 540 + rowD.w / 2 - 150, r1Y = 930 - lh / 2 + 14 + 40;
    const k3X = 540 - (kd.w / 2 + 12) + kd.w * 0.25, k3Y = 960 + 10;
    moveCursor(cur, t, [[t0 - 0.2, 980, 1750], [t0 + 0.9, r1X, r1Y], [M.kpis + 0.8, k3X, k3Y]], [M.kpis + 1.2], t0, M.stat3 - 0.3);
  }

  // ---- sans / avec
  const saOn = inWin(t, M.sans, M.r1); show(sa, saOn);
  if (saOn) {
    const t0 = M.sans, out = M.r1 - 0.3;
    const a = spring(t - t0, 'default'), q = spring(t - out, 'snappy'), ex = spring(t - out, 'default'), push = smooth(t0, M.r1, t);
    sa.style.transformOrigin = '540px 900px'; sa.style.transform = `scale(${(1 + push * 0.05).toFixed(4)})`;
    place(tagSans, 540, 330 - ex * 900, 1, 0, a - q); tagSans.style.transform += ` translateY(${((1 - a) * 30).toFixed(1)}px)`;
    place(skel, 540, 620 + (1 - a) * 160 - ex * 900 + noise(12, t * 0.5) * 6, 1, noise(13, t * 0.4) * 0.8, a - q * 0.5);
    skQ.style.transform = `rotate(${(noise(14, t * 1.2) * 10).toFixed(2)}deg) scale(${(1 + 0.08 * Math.max(0, noise(15, t * 1.5))).toFixed(3)})`;
    const sw = spring(t - M.swap, 'default');
    skPr1.style.opacity = (1 - sw).toFixed(3); skPr1.style.transform = `translateY(${(-sw * 60).toFixed(1)}px)`;
    skPr2.style.opacity = sw.toFixed(3); skPr2.style.transform = `translateY(${((1 - sw) * 60).toFixed(1)}px)`;
    const b = spring(t - (t0 + 1.0), 'default');
    place(tagAvec, 540, 960 + ex * 700, 1, 0, b - q); tagAvec.style.transform += ` translateY(${((1 - b) * 30).toFixed(1)}px)`;
    place(av1, 540 - sw * 1100, 1260 + (1 - b) * 400 - smooth(t0 + 1, M.swap, t) * 30, 1, 0, 1);
    place(av2, 540 + (1 - sw) * 1100, 1260 + ex * 900 - smooth(M.swap, out, t) * 30, 1, 0, 1);
    marker(t, hlGo, M.swap + 0.9, null); hlGo.style.opacity = (0.8 * (1 - q)).toFixed(3);
  }

  // ---- récap
  const rc = [[R1, M.r1 + 0.02, M.r2 - 0.25, M.r2], [R2, M.r2 + 0.02, M.r3 - 0.25, M.r3], [R3, M.r3 + 0.02, M.burst - 0.25, M.burst]];
  for (const [b, a, o, cut] of rc) { const on = inWin(t, a - 0.05, Math.min(o + 0.4, cut)); show(b, on); if (on) { typeText(b, t, a, o, 0.035, 40); b.style.transformOrigin = '540px 60px'; b.style.transform = `translate(0px,${960 - b.offsetHeight / 2}px) scale(${(1 + smooth(a, o + 0.25, t) * 0.12).toFixed(4)})`; } }
  R3.querySelectorAll('.bd').forEach(e => e.style.color = '#1A1310');

  // ---- explosion
  const bOn2 = inWin(t, M.burst, M.logo + 0.6); show(burst, bOn2);
  if (bOn2) bursts.forEach((e, i) => {
    const P = e._p; const p = inOut(M.burst + P.t, M.burst + P.t + 1.3, t);
    const s = 0.12 + p * p * 2.2; const x = 540 + Math.cos(P.a) * P.d * p * p, y = 960 + Math.sin(P.a) * P.d * 1.3 * p * p;
    e.style.zIndex = Math.round(s * 100);
    place(e, x, y, s, P.r * p, p < 0.02 ? p * 50 : 1, Math.max(0, (p - 0.55) * 22));
  });

  // ---- fin
  const eOn = t >= M.logo; show(endL, eOn);
  if (eOn) {
    const t0 = M.logo, push = smooth(t0, M.end, t);
    drift.forEach((e, i) => {
      const [x, y, r] = DRIFT[i]; const p = spring(t - (t0 + 0.1 + i * 0.06), 'default');
      const cx = 540 + (x - 540) * (1 + push * 0.12), cy = 960 + (y - 960) * (1 + push * 0.12);
      place(e, cx + noise(i + 70, t * 0.35) * 40, cy + noise(i + 90, t * 0.3) * 40 - (t - t0) * (i % 2 ? 14 : -10), 0.8 + 0.1 * p, r + noise(i + 99, t * 0.3) * 4, p * 0.28, 9);
    });
    const p = spring(t - t0, 'heavy'); const press = bump(t, M.click - 0.03, 0.11);
    place(pill, 540, 860 - push * 10, (0.55 + 0.45 * p) * (1 - press * 0.05) * (1 + push * 0.04), 0, clamp(p * 2, 0, 1));
    typeText(CTA, t, M.cta, null, 0.03, 30); marker(t, ctaBg, M.cta + 0.2, null); CTA.style.transform = `translate(0px,${1080}px)`;
    typeText(CTA2, t, M.cta2, null, 0.025, 24); CTA2.style.transform = `translate(0px,${1200}px)`;
    const gar = CTA.querySelector('.g'); const gp = bump(t, M.end - 3.0, 0.12);
    gar.style.transform = `scale(${(1 - gp * 0.08 + spring(t - (M.end - 3.0), 'snappy') * 0.06 - spring(t - (M.end - 2.6), 'default') * 0.06).toFixed(4)})`;
    moveCursor(curD, t, [[t0 + 0.5, 1000, 1760], [t0 + 0.9, 760, 930], [M.cta + 0.6, 830, 1020], [M.end - 3.8, 800, 1125], [M.end - 2.4, 900, 1330]], [M.click, M.end - 3.0], t0 + 0.5, M.end + 1);
  } else show(curD, false);
  if (!(inWin(t, M.demo1, M.stat1 - 0.3) || inWin(t, M.demo2, M.stat2 - 0.3) || inWin(t, M.demo3, M.stat3 - 0.3) || CH_T.some(c => inWin(t, c + 0.3, c + 2)))) show(cur, false);
  // curseur des chapitres
  CH_T.forEach(c => { if (inWin(t, c + 0.3, c + 2)) moveCursor(cur, t, [[c + 0.3, 1000, 1780], [c + 0.35, 575, 1012], [c + 1.3, 560, 1030]], [c + 1.0], c + 0.3, c + 2); });
};

await document.fonts.ready;
await document.fonts.load("800 76px 'Archivo'"); await document.fonts.load("400 76px 'Archivo'");
window.seek(0);
window.filmReady = true;
