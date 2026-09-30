// UTOPICAR — explainer pub ~60 s, voix de Simon, 1080x1920, 30 i/s.
// Le besoin (une « bonne » annonce qui fait perdre de l'argent, les calculs au pif), puis UTOPICAR et ses cinq fonctions
// numérotées sur la vraie interface : 1 Analyser, 2 Rapports, 3 Recherche en direct, 4 Parc, 5 Tableau de bord ; promesse
// et CTA. Tous les repères viennent de la voix (timeline-explainer60.json, calculés par scripts/vo_marks.py à partir de
// l'horodatage mot à mot) : changer de prise ne demande que de relancer vo_marks.py.
// Zone sûre TikTok : x 60 → 940 (centre 500), y 220 → 1480. Contrat : window.seek(t) peint la frame t.
const { spring, clamp, lerp, noise } = Motion;
const { el, show, smooth, inOut, bump, place, crop, text, typeText, marker, cursor, moveCursor, hash } = Kit;
const TL = await (await fetch('../timeline-explainer60.json')).json();
const U1 = await (await fetch('../assets/ui/layout.json')).json();
const U2 = await (await fetch('../assets/ui2/layout.json')).json();
const ICONS = await (await fetch('../assets/ui2/dock-icons.json')).json();
const M = TL.marks;
const stage = document.getElementById('stage');
const LOGO = (await (await fetch('../assets/brand/logo.svg')).text()).replace(/<!--.*?-->/s, '');
const CX = 500, CY = 850;
const inWin = (t, a, b) => t >= a && t < b;

/* ================= captures ================= */
const SRC = {};
async function load(key, url) { const i = new Image(); i.src = url; await i.decode(); SRC[key] = { url, w: i.naturalWidth, h: i.naturalHeight }; }
for (const k of ['dcard1', 'dcard2', 'ticket', 'plaf', 'qsform', 'schip', 'lvmini', 'filters', 'vrow1', 'vrow2', 'vrow3', 'kpi1', 'kpi2', 'kpi3', 'kpi4', 'kpi5', 'kpi6', 'best', 'pipe', 'alerts', 'mchart'])
  await load(k, `../assets/ui2/${k}.png`);
for (const k of ['scan', 'launch', 'card-lv1', 'card-lv2', 'lg3', 'lg4', 'lg5', 'lg6', 'dock-scan']) await load(k, `../assets/ui/${k}.png`);
const full = (k) => ({ x: 0, y: 0, w: SRC[k].w / 3, h: SRC[k].h / 3 });
function cardR(parent, key, r, k, rad = 22, bg = '#FFFFFF') {
  const s = SRC[key]; const e = el('div', 'abs', parent);
  Object.assign(e.style, { borderRadius: rad * k + 'px', overflow: 'hidden', width: r.w * k + 'px', height: r.h * k + 'px', background: bg });
  const c = crop(e, s.url, s.w, s.h, r, k); c.style.position = 'absolute'; e._k = k; e._r = r; e._w = r.w * k; e._h = r.h * k;
  return e;
}
const SHADOW = '0 4px 12px rgba(12,15,20,.06),0 60px 120px -48px rgba(12,15,20,.32)';
const lift = (e) => { e.style.boxShadow = SHADOW; return e; };
function padR(e, px = 22, py = 12) { const c = e.firstChild; c.style.left = px + 'px'; c.style.top = py + 'px'; e._w += 2 * px; e._h += 2 * py; e.style.width = e._w + 'px'; e.style.height = e._h + 'px'; return e; }
const card = (parent, key, k, pd = 8, rad = 22) => lift(cardR(parent, key, { x: pd, y: pd, w: SRC[key].w / 3 - 2 * pd, h: SRC[key].h / 3 - 2 * pd }, k, rad));
const line = (parent, key, k) => lift(padR(cardR(parent, key, full(key), k, 10)));
// point de la capture (px CSS) une fois la carte posée en (x, y) à l'échelle s
const pt = (e, x, y, px, py, s = 1) => [x + ((px - e._r.x) * e._k - e._w / 2) * s, y + ((py - e._r.y) * e._k - e._h / 2) * s];
function hlOn(c, r, pad = [6, 4]) {
  const h = el('div', 'hl', c); const k = c._k;
  Object.assign(h.style, { left: (r.x - c._r.x - pad[0]) * k + 'px', top: (r.y - c._r.y - pad[1]) * k + 'px', width: (r.w + 2 * pad[0]) * k + 'px', height: (r.h + 2 * pad[1]) * k + 'px' });
  return h;
}
function fitW(box, base, max = 830) {
  const tf = box.style.transform; box.style.transform = 'none'; box.style.fontSize = base + 'px';
  const w = Math.max(...[...box.querySelectorAll('.ln')].map(l => { const r = [...l.querySelectorAll('.ch')].map(c => c.getBoundingClientRect()).filter(r => r.width > 0); return r.length ? Math.max(...r.map(x => x.right)) - Math.min(...r.map(x => x.left)) : 0; }));
  if (w > max) box.style.fontSize = (base * max / w).toFixed(1) + 'px'; box.style.transform = tf;
}
const at = (box, y, s = 1, dx = 0) => { box.style.transform = `translate(${dx.toFixed(1)}px,${(y - box.offsetHeight / 2).toFixed(1)}px) scale(${s.toFixed(4)})`; };
const FITS = [];
const T = (parent, segs, size) => { const b = text(parent, segs); fitW(b, size); FITS.push([b, size]); return b; };
const addMark = (box, sel = '.k') => el('div', 'mk', box.querySelector(sel));
// entrée/sortie d'un bloc : glisse depuis le bas, sort vers le haut (jamais un simple fondu)
const inOutY = (t, a, b, d = 900) => { const p = spring(t - a, 'default'), q = spring(t - (b - 0.3), 'default'); return { p, q, dy: (1 - p) * d * 0.5 - q * d, o: clamp(p * 2, 0, 1) }; };

/* ================= fonds ================= */
const bgW = el('div', 'layer grid', stage);
const bgD = el('div', 'layer grid dark', stage);
const bgY = el('div', 'layer grid yel', stage);

/* ================= en-tête de chapitre : pastille numérotée + nom + icône réelle ================= */
function header(parent, n, label, icon) {
  const h = el('div', 'hd', parent);
  h.innerHTML = `<div class="n">${n}</div><div class="l">${label}</div><div class="ic">${ICONS[icon] ? ICONS[icon].svg : ''}</div>`;
  if (label.length > 12) h.querySelector('.l').style.fontSize = '64px';
  return h;
}
function drawHeader(h, t, t0, t1) {
  t0 -= 0.15;                                            // déjà visible à la frame de coupe
  const p = spring(t - t0, 'snappy'), q = spring(t - (t1 - 0.3), 'default');
  const n = h.querySelector('.n'), l = h.querySelector('.l'), ic = h.querySelector('.ic');
  n.style.transform = `scale(${(0.2 + 0.8 * p).toFixed(3)}) rotate(${((1 - p) * -40).toFixed(1)}deg)`;
  const lp = spring(t - (t0 + 0.08), 'default');
  l.style.transform = `translateX(${((1 - lp) * 60).toFixed(1)}px)`; l.style.opacity = clamp(lp * 1.6, 0, 1).toFixed(3);
  ic.style.transform = `translateX(${((1 - spring(t - (t0 + 0.16), 'default')) * 80).toFixed(1)}px)`;
  place(h, CX, 300 - q * 400, 1, 0, 1 - q);
}

/* ================= 0 : accroche ================= */
const s0 = el('div', 'layer', stage);
const CHIPS = [['dcard1', { x: 129, y: 122, w: 71, h: 23 }], ['vrow1', { x: 20, y: 15, w: 107, h: 23 }], ['dcard2', { x: 129, y: 122, w: 50, h: 23 }],
  ['schip', { x: 6, y: 6, w: 167, h: 34 }], ['vrow3', { x: 242, y: 15, w: 102, h: 23 }], ['dcard1', { x: 196, y: 155, w: 106, h: 22 }],
  ['vrow2', { x: 20, y: 15, w: 103, h: 23 }], ['dcard2', { x: 196, y: 155, w: 106, h: 22 }]];
const CHIP_POS = [[230, 470, 1.0], [760, 400, 0.85], [190, 1180, 0.9], [720, 1260, 1.05], [520, 330, 0.7], [800, 1080, 0.8], [260, 1390, 0.75], [700, 560, 0.9]];
const chips = CHIPS.map(([k, r]) => { const c = lift(cardR(s0, k, r, 2.7, 8)); c.style.padding = '0'; return c; });
const H1 = T(s0, [['Achat-revente', 'lt'], ['\n', ''], ['auto ?', 'bd']], 150);
const H2 = T(s0, [['Écoute ', 'lt'], ['bien.', 'bd k']], 150); const mkH2 = addMark(H2);

/* ================= 1 : l'annonce « top » ================= */
const s1 = el('div', 'layer', stage);
const golf = lift(cardR(s1, 'dcard1', { x: 8, y: 8, w: 362, h: 110 }, 2.35));
const hlPrix = hlOn(golf, { x: 211, y: 97, w: 44, h: 16 }, [5, 3]);
const TOP = T(s1, [["L'air ", 'lt'], ['top…', 'bd']], 130);
const costs = ['lg3', 'lg4', 'lg5', 'lg6'].map(k => line(s1, k, 1.85));
const RIEN = T(s1, [['− 1 200 €', 'rd']], 210); RIEN.style.fontStretch = '112%';

/* ================= 2 : les douleurs ================= */
const s2 = el('div', 'layer', stage);
const s2b = el('div', 'layer', s2);
const P1 = T(s2, [['Des annonces ', 'lt'], ['partout.', 'bd']], 96);
const P2 = T(s2, [['Des calculs ', 'lt'], ['à la main.', 'bd']], 96);
const P3 = T(s2, [['Une marge ', 'lt'], ['au pif.', 'bd']], 96);
const FINI = T(s2, [["C'est ", 'bd'], ['fini.', 'bd k']], 190); const mkFini = addMark(FINI);
const ads = [['card-lv1', { x: 6, y: 6, w: 362, h: 150 }, 250, 470, -7], ['card-lv2', { x: 6, y: 6, w: 362, h: 150 }, 760, 560, 6], ['lvmini', { x: 8, y: 60, w: 366, h: 120 }, 300, 1300, 5], ['dcard2', { x: 8, y: 8, w: 362, h: 110 }, 740, 1360, -5]]
  .map(([k, r, x, y, rot]) => { const c = lift(cardR(s2b, k, r, 1.4, 16)); c._p = [x, y, rot]; return c; });
const calc = ['lg3', 'lg4', 'lg5'].map((k, i) => { const c = line(s2b, k, 1.5); c._p = [[220, 760, 1220][i] ? [230, 780, 300][i] : 0, [900, 1000, 1150][i], [-6, 5, -3][i]]; return c; });

/* ================= 3 : voici UTOPICAR ================= */
const s3 = el('div', 'layer', stage);
const lockY = el('div', 'lock', s3); lockY.innerHTML = `<span class="logo">${LOGO.replace('<svg', '<svg width="150" height="143"')}</span><span class="wm" style="color:#1A1310">${U1.logo.text}</span>`;
const OUT1 = T(s3, [["Ton outil d'achat-revente,", 'lt'], ['\n', ''], ['dans ta poche.', 'bd']], 84);
const dockK = 2.25; const dock = cardR(s3, 'dock-scan', full('dock-scan'), dockK, 20, 'transparent');
dock.style.filter = 'drop-shadow(0 30px 40px rgba(26,19,16,.25))';
const DOCK_I = [0, 1, 3, 4, 5].map(i => 12 + i * 58.5 + 29);   // centres des 5 onglets montrés (Analyser, Recherche, Rapports, Parc, Tableau)
const dockHl = el('div', 'abs', dock); Object.assign(dockHl.style, { width: 56 * dockK + 'px', height: 52 * dockK + 'px', borderRadius: 16 * dockK + 'px', boxShadow: `0 0 0 ${3 * dockK}px #1A1310 inset`, opacity: 0 });

/* ================= 4 : 1 Analyser ================= */
const s4 = el('div', 'layer', stage);
const hd1 = header(s4, 1, 'Analyser', 'scan');
const TA = { x: 30, y: 952, w: 345, h: 212 };
const area = lift(cardR(s4, 'scan', TA, 2.4, 20));
const mask = el('div', 'mask', area);
Object.assign(mask.style, { left: (38.6 - TA.x) * 2.4 + 'px', top: (986.6 - TA.y) * 2.4 + 'px', width: (368 - 38.6) * 2.4 + 'px', height: (1146 - 986.6) * 2.4 + 'px' });
const bar = cardR(s4, 'launch', full('launch'), 2.15, 18, 'transparent');
const tkTop = lift(cardR(s4, 'ticket', U2.ticketTop, 2.55, 20));
const hlVerdict = hlOn(tkTop, { x: U1.verdict.x - U1.ticket.x + 10, y: U1.verdict.y - U1.ticket.y + 10, w: U1.verdict.w, h: U1.verdict.h }, [3, 2]);
const tkTot = lift(cardR(s4, 'ticket', U2.ticketTotal, 2.55, 20));
const hlTot = hlOn(tkTot, { x: 180 - 35 + 10 - 4, y: U2.ticketTotal.y + 22, w: 178, h: 44 }, [2, 2]);
const tkPlaf = lift(cardR(s4, 'plaf', { x: 8, y: 8, w: 320, h: 130 }, 2.55, 20));
const hlPlaf = hlOn(tkPlaf, { x: U1.plafFig.x - 27 + 8 - 6, y: U1.plafFig.y - 710.4 + 8 - 4, w: U1.plafFig.w + 10, h: U1.plafFig.h + 4 }, [3, 2]);
const D2S = T(s4, [['2 ', 'bd k'], ['secondes.', 'bd']], 120); const mkD2 = addMark(D2S);

/* ================= 5 : 2 Rapports ================= */
const s5 = el('div', 'layer', stage);
const hd2 = header(s5, 2, 'Rapports', 'dossiers');
const r1 = card(s5, 'dcard1', 2.25), r2 = card(s5, 'dcard2', 2.25);
const hlR2 = hlOn(r2, { x: U2.dcard2Fig.x - 12, y: U2.dcard2Fig.y - 1, w: U2.dcard2Fig.w + 14, h: U2.dcard2Fig.h }, [4, 3]);
const BEST = T(s5, [['La ', 'lt'], ['meilleure', 'bd k'], [' affaire.', 'bd']], 88); const mkBest = addMark(BEST);

/* ================= 6 : 3 Recherche en direct ================= */
const s6 = el('div', 'layer', stage);
const hd3 = header(s6, 3, 'Recherche en direct', 'live');
const chip = lift(cardR(s6, 'schip', { x: 4, y: 4, w: SRC.schip.w / 3 - 8, h: SRC.schip.h / 3 - 8 }, 2.6, 20));
const lvm = card(s6, 'lvmini', 1.95, 10);
const LV = { x: 6, y: 6, w: 362, h: 462 }, LVK = 2.15, LVH = 300;
const live = lift(el('div', 'abs', s6));
Object.assign(live.style, { width: LV.w * LVK + 'px', height: LVH * LVK + 'px', borderRadius: 22 * LVK + 'px', overflow: 'hidden', background: '#FFFFFF' });
const liveIn = cardR(live, 'card-lv1', LV, LVK, 0); liveIn.style.position = 'absolute'; liveIn.style.left = '0px';
live._k = LVK; live._r = { x: LV.x, y: LV.y }; live._w = LV.w * LVK; live._h = LVH * LVK;
const LV0 = U1.shots['card-lv1'], sous = U1.cote.sous;
const hlS = hlOn(liveIn, { x: sous.x - LV0.x, y: sous.y - LV0.y, w: sous.w, h: sous.h }, [5, 3]);
const N1450 = T(s6, [['1 450 €', 'gr']], 250); N1450.style.fontStretch = '112%';
const SOUS = T(s6, [['sous la ', 'lt'], ['cote', 'bd k']], 88); const mkSous = addMark(SOUS);
const PREM = T(s6, [["T'es le ", 'lt'], ['premier.', 'bd']], 96);

/* ================= 7 : 4 Parc ================= */
const s7 = el('div', 'layer', stage);
const hd4 = header(s7, 4, 'Parc', 'parc');
const filt = card(s7, 'filters', 2.2, 6);
const rows = ['vrow1', 'vrow2', 'vrow3'].map(k => lift(cardR(s7, k, { x: 2, y: 2, w: SRC[k].w / 3 - 4, h: SRC[k].h / 3 - 4 }, 1.75, 20)));
const hlDays = rows.map(r => hlOn(r, { x: 251, y: 111, w: 54, h: 19 }, [4, 2]));
const hlMarge = rows.map(r => hlOn(r, { x: 20, y: 111, w: 80, h: 19 }, [4, 2]));

/* ================= 8 : 5 Tableau de bord ================= */
const s8 = el('div', 'layer', stage);
const hd5 = header(s8, 5, 'Tableau de bord', 'dash');
const kp = [1, 2, 3, 4, 5, 6].map(i => card(s8, 'kpi' + i, 2.05, 8, 18));
const panels = ['best', 'mchart', 'alerts', 'pipe'].map(k => card(s8, k, 1.0, 10));

/* ================= 9 : promesse + fin ================= */
const s9 = el('div', 'layer', stage);
const SAIS = T(s9, [['Tu sais ', 'lt'], ["avant d'acheter.", 'bd']], 100);
const REV = T(s9, [['Tu revends ', 'lt'], ['avec de la marge.', 'bdw']], 100);
const en = el('div', 'layer', stage);
const pill = el('div', 'pill', en); pill.innerHTML = `${LOGO}<span class="wm">${U1.logo.text}</span>`;
const CTA = T(en, [['Commente ', 'bdw'], ['GARAGE', 'bd g']], 92);
CTA.querySelector('.g').classList.add('ctaw'); const ctaBg = el('div', 'ctabg', CTA.querySelector('.g'));
const CTA2 = T(en, [["pour recevoir l'accès.", 'lt onDark']], 62);

const demo = el('div', 'demo', stage); demo.textContent = 'Données de démonstration';
const cur = cursor(stage, false), curD = cursor(stage, true);
const HOLD = -3;
const E = (p) => (p > 0.0005 ? 1 : 0);

const push = (layer, t, a, b, k = 0.045) => { layer.style.transformOrigin = '500px 850px'; layer.style.transform = `translateY(${(-smooth(a, b, t) * 24).toFixed(1)}px) scale(${(1 + smooth(a, b, t) * k).toFixed(4)})`; };
window.seek = function (t) {
  const dark = inWin(t, M.logo, 1e9);
  const yel = inWin(t, M.voici, M.f1) || inWin(t, M.sais, M.logo);
  show(bgD, dark); show(bgY, yel); show(bgW, !dark && !yel);
  demo.style.color = dark ? '#6B7482' : yel ? '#8A3A14' : '#8C95A3';
  let curOn = false;

  /* ---------- 0 : accroche ---------- */
  const s0On = t < M.annonce; show(s0, s0On);
  if (s0On) {
    chips.forEach((c, i) => {
      const [x, y, d] = CHIP_POS[i]; const p = spring(t + 0.8 - i * 0.05, 'default');
      const out = spring(t - (M.annonce - 0.3), 'default');
      place(c, x + noise(i + 1, t * 0.4) * 24 + (x < CX ? -1 : 1) * out * 600, y + noise(i + 11, t * 0.35) * 28 - t * 10, d * (0.9 + 0.1 * p), noise(i + 21, t * 0.3) * 5, p, Math.abs(d - 1) * 8);
    });
    const q1 = M.ecoute - 0.25;
    typeText(H1, t, HOLD, q1, 0.02); show(H1, t < q1 + 0.4); at(H1, CY, 1 + smooth(0, M.ecoute, t) * 0.05);
    show(H2, t >= M.ecoute - 0.05); typeText(H2, t, M.ecoute, M.annonce - 0.3, 0.03); at(H2, CY); marker(t, mkH2, M.ecoute + 0.35, M.annonce - 0.3);
  }

  /* ---------- 1 : l'annonce « top », les frais, − 1 200 € ---------- */
  const s1On = inWin(t, M.annonce, M.p1); show(s1, s1On);
  if (s1On) {
    push(s1, t, M.annonce, M.p1);
    const { dy, q } = inOutY(t, M.annonce, M.p1);
    const dim = spring(t - M.rien, 'default');
    place(golf, CX, 760 + dy + dim * -80, (1 + smooth(M.annonce, M.p1, t) * 0.04) * (1 - dim * 0.1), 0, 1 - dim * 0.5, dim * 4);
    marker(t, hlPrix, M.annonce + 0.3, null); hlPrix.style.opacity = '0.8';
    typeText(TOP, t, M.annonce + 0.05, M.rien - 0.2, 0.03); show(TOP, t < M.rien + 0.3); at(TOP, 460 + dy);
    let y = 960;
    costs.forEach((c, i) => {
      const t0 = M.frais + i * 0.25, p = spring(t - t0, 'default'); const cy = y + c._h / 2; y += c._h + 10;
      place(c, CX + (1 - p) * (i % 2 ? -700 : 700), cy + dy - dim * 40, 1 - dim * 0.06, (1 - p) * (i % 2 ? -8 : 8), p, dim * 3);
    });
    RIEN.chars.forEach((c, i) => { const p = spring(t - (M.rien + i * 0.035), 'heavy'); c.style.opacity = clamp(p * 1.8, 0, 1).toFixed(3); c.style.transform = `translateY(${((1 - p) * 120).toFixed(1)}px)`; });
    show(RIEN, t >= M.rien - 0.05); at(RIEN, 470 + dy, 1 + smooth(M.rien, M.p1, t) * 0.05);
  }

  /* ---------- 2 : les douleurs, « C'est fini. » ---------- */
  const s2On = inWin(t, M.p1, M.voici); show(s2, s2On);
  if (s2On) {
    const fall = Math.max(0, t - M.fini);
    const rowsP = [[P1, M.p1, 560], [P2, M.p2, 720], [P3, M.p3, 880]];
    const gone = spring(t - (M.fini - 0.05), 'snappy');
    rowsP.forEach(([b, t0, y], i) => {
      typeText(b, t, t0, null, 0.025, 30);
      at(b, y - gone * (500 + i * 120), 1 - gone * 0.1); b.style.opacity = (1 - gone).toFixed(3);
    });
    ads.forEach((c, i) => {
      const [x, y, rot] = c._p; const p = spring(t - (M.p1 + 0.1 + i * 0.12), 'default'); const fy = 1800 * fall * fall * (0.7 + hash(i) * 0.5);
      place(c, x + (1 - p) * (x < CX ? -500 : 500) + noise(i + 3, t * 0.4) * 16, y + fy + noise(i + 7, t * 0.4) * 16, 0.95, rot + fall * 60 * (i % 2 ? 1 : -1), p * 0.95, 1.5);
    });
    calc.forEach((c, i) => {
      const [x, y, rot] = c._p; const p = spring(t - (M.p2 + 0.1 + i * 0.12), 'default'); const fy = 1800 * fall * fall * (0.8 + hash(i + 4) * 0.4);
      place(c, x + (1 - p) * (x < CX ? -600 : 600), y + 220 + fy, 0.8, rot + fall * 50, p * 0.9, 1);
    });
    const fp = spring(t - M.fini, 'heavy'); show(FINI, t >= M.fini - 0.05);
    FINI.chars.forEach((c, i) => { const p = spring(t - (M.fini + i * 0.03), 'heavy'); c.style.opacity = clamp(p * 1.8, 0, 1).toFixed(3); c.style.transform = `translateY(${((1 - p) * 110).toFixed(1)}px)`; });
    at(FINI, CY, 1 + smooth(M.fini, M.voici, t) * 0.05); marker(t, mkFini, M.fini + 0.35, null);
    void fp;
  }

  /* ---------- 3 : voici UTOPICAR, dans ta poche ---------- */
  const s3On = inWin(t, M.voici, M.f1); show(s3, s3On);
  if (s3On) {
    const p = spring(t - M.voici, 'heavy'), q = spring(t - (M.f1 - 0.3), 'default');
    place(lockY, CX, 620 - q * 900, (1.2 - 0.2 * p) * (1 + smooth(M.voici, M.f1, t) * 0.05), 0, clamp(p * 2, 0, 1));
    typeText(OUT1, t, M.voici + 0.5, null, 0.022); at(OUT1, 860 - q * 900);
    const dp = spring(t - M.poche, 'default');
    place(dock, CX, 1200 + (1 - dp) * 700 - q * 900, 1, 0, E(dp));
    // les cinq onglets s'allument l'un après l'autre (le sommaire du film)
    const k = Math.floor(clamp((t - (M.poche + 0.35)) / 0.16, 0, 4.99));
    dockHl.style.opacity = t > M.poche + 0.35 ? '1' : '0';
    dockHl.style.left = ((DOCK_I[k] - 28) * dockK) + 'px'; dockHl.style.top = (8 * dockK) + 'px';
    dockHl.style.transform = `scale(${(1 + bump(t, M.poche + 0.35 + k * 0.16, 0.08) * 0.08).toFixed(3)})`;
  }

  /* ---------- 4 : 1 Analyser ---------- */
  const s4On = inWin(t, M.f1, M.f2); show(s4, s4On);
  if (s4On) {
    push(s4, t, M.f1, M.f2);
    drawHeader(hd1, t, M.f1, M.f2);
    const out = spring(t - (M.f2 - 0.3), 'default');
    // zone de texte : entre, reçoit l'annonce (Ctrl+V), bouton « Analyser le dossier »
    const ai = spring(t - (M.f1 + 0.2), 'default'), go = spring(t - (M.note - 0.1), 'default');
    const ay = 700 + (1 - ai) * 1000 - go * 1300;
    place(area, CX, ay, 1, 0, E(ai));
    const pasted = t >= M.colle + 0.55; show(mask, !pasted);
    area.style.boxShadow = pasted ? `0 0 0 ${(8 * (1 - spring(t - (M.colle + 0.55), 'snappy'))).toFixed(1)}px rgba(255,90,31,.35),${SHADOW}` : SHADOW;
    const bi = spring(t - (M.colle + 0.2), 'default'); const by = ay + area._h / 2 + 40 + bar._h / 2 + (1 - bi) * 600;
    const clickT = M.deux + 0.1; const press = bump(t, clickT - 0.03, 0.12);
    place(bar, CX, by, 1 - press * 0.04, 0, E(bi));
    typeText(D2S, t, M.deux, M.note - 0.25, 0.035, 34); show(D2S, inWin(t, M.deux - 0.05, M.note + 0.2)); at(D2S, 1360 - go * 1300);
    marker(t, mkD2, M.deux + 0.3, M.note - 0.25);
    const bx = CX - bar._w / 2 + (13 + 97) * bar._k, byy = by - bar._h / 2 + 36 * bar._k;
    if (inWin(t, M.colle, M.note)) { moveCursor(cur, t, [[M.colle, 980, 1600], [M.colle + 0.05, CX + 120, ay + 40], [M.colle + 0.7, bx, byy]], [M.colle + 0.5, clickT], M.colle, M.note); curOn = true; }
    // rapport : note + verdict, reste, plafond
    const ti = spring(t - M.note, 'default');
    place(tkTop, CX, 620 + (1 - ti) * 1300 - out * 1300, 1, 0, E(ti));
    marker(t, hlVerdict, M.verdict, null); hlVerdict.style.opacity = '0.9';
    const ri = spring(t - M.reste, 'default');
    place(tkTot, CX, 900 + (1 - ri) * 1300 - out * 1300, 1, 0, E(ri));
    marker(t, hlTot, M.reste + 0.35, null); hlTot.style.opacity = '0.8';
    const pi = spring(t - M.plafond, 'default'), pl = spring(t - (M.plafond + 0.5), 'default');
    tkPlaf.style.zIndex = 2;
    place(tkPlaf, CX, 1210 + (1 - pi) * 1300 - pl * 40 - out * 1300, 1 + pl * 0.06, 0, E(pi));
    marker(t, hlPlaf, M.plafond + 0.7, null); hlPlaf.style.opacity = '0.85';
  }

  /* ---------- 5 : 2 Rapports ---------- */
  const s5On = inWin(t, M.f2, M.f3); show(s5, s5On);
  if (s5On) {
    push(s5, t, M.f2, M.f3);
    drawHeader(hd2, t, M.f2, M.f3);
    const out = spring(t - (M.f3 - 0.3), 'default');
    const a = spring(t - M.dossiers, 'default'), b = spring(t - (M.dossiers + 0.2), 'default');
    const cmp = spring(t - M.comparer, 'default'), best = spring(t - M.meilleure, 'default');
    // les deux dossiers, puis côte à côte (comparer), puis le meilleur reste seul
    place(r1, CX - cmp * 30 - best * 900, 680 + (1 - a) * 1300 - out * 1300, 1 - cmp * 0.06, -cmp * 3, E(a));
    place(r2, CX + cmp * 30, 1140 + (1 - b) * 1300 - best * 280 - out * 1300, (1 - cmp * 0.06) * (1 + best * 0.1), cmp * 3 * (1 - best), E(b));
    r2.style.zIndex = 2;
    marker(t, hlR2, M.meilleure + 0.2, null); hlR2.style.opacity = '0.85';
    typeText(BEST, t, M.meilleure + 0.1, null, 0.028); at(BEST, 1300 - out * 1300); marker(t, mkBest, M.meilleure + 0.6, null);
  }

  /* ---------- 6 : 3 Recherche en direct ---------- */
  const s6On = inWin(t, M.f3, M.f4); show(s6, s6On);
  if (s6On) {
    push(s6, t, M.f3, M.f4);
    const toStat = spring(t - (M.mille - 0.2), 'default');
    drawHeader(hd3, t, M.f3, Math.min(M.f4, M.mille + 0.1));
    const out = spring(t - (M.f4 - 0.18), 'default');
    const ci = spring(t - (M.f3 + 0.35), 'default'), toLive = spring(t - M.sous, 'default');
    place(chip, CX, 480 + (1 - ci) * 1300 - toLive * 1800, 1 + bump(t, M.surveille + 0.2, 0.12) * 0.05, 0, E(ci) * (1 - toLive));
    const li = spring(t - M.surveille, 'default');
    place(lvm, CX, 1000 + (1 - li) * 1300 - toLive * 1800, 1, 0, E(li) * (1 - toLive));
    // clic sur la nouvelle annonce → sa fiche, qui défile jusqu'à « sous la cote »
    const x = CX + (1 - toLive) * 1000, y = 830 - toStat * 1300;
    place(live, x, y, 1, (1 - toLive) * 8, E(toLive) * (1 - toStat));
    const scroll = inOut(M.sous + 0.3, M.sous + 0.9, t) * (LV.h - LVH) * LVK; liveIn.style.top = (-scroll).toFixed(1) + 'px';
    marker(t, hlS, M.sous + 1.0, null); hlS.style.opacity = '0.85';
    if (inWin(t, M.surveille + 0.5, M.mille - 0.2)) {
      const [ix, iy] = [CX + 120, 1000 - lvm._h / 2 + 150];
      const [sx, sy0] = pt(live, CX, 830, sous.x - LV0.x + sous.w * 0.85, sous.y - LV0.y + 14); const sy = sy0 - (LV.h - LVH) * LVK;
      moveCursor(cur, t, [[M.surveille + 0.5, 980, 1650], [M.surveille + 0.55, ix, iy], [M.sous + 0.9, sx, sy]], [M.sous - 0.05], M.surveille + 0.5, M.mille - 0.2); curOn = true;
    }
    // chiffre géant
    show(N1450, t >= M.mille - 0.05);
    N1450.chars.forEach((c, i) => { const p = spring(t - (M.mille + i * 0.04), 'heavy'); c.style.opacity = clamp(p * 1.8, 0, 1).toFixed(3); c.style.transform = `translateY(${((1 - p) * 120).toFixed(1)}px)`; });
    at(N1450, 720 - out * 1300, 1 + smooth(M.mille, M.f4, t) * 0.04);
    typeText(SOUS, t, M.mille + 0.3, null, 0.025); at(SOUS, 900 - out * 1300); marker(t, mkSous, M.mille + 0.7, null);
    typeText(PREM, t, M.premier, null, 0.03); at(PREM, 1120 - out * 1300);
  }

  /* ---------- 7 : 4 Parc ---------- */
  const s7On = inWin(t, M.f4, M.f5); show(s7, s7On);
  if (s7On) {
    push(s7, t, M.f4, M.f5);
    drawHeader(hd4, t, M.f4, M.f5);
    const out = spring(t - (M.f5 - 0.3), 'default');
    const fi = spring(t - (M.f4 + 0.3), 'default');
    place(filt, CX, 500 + (1 - fi) * 1300 - out * 1300, 1, 0, E(fi));
    rows.forEach((r, i) => {
      const p = spring(t - (M.chaque + i * 0.22), 'default');
      place(r, CX + (1 - p) * (i % 2 ? -900 : 900), 790 + i * (r._h + 16) - out * 1300, 1, (1 - p) * (i % 2 ? -5 : 5), E(p));
      marker(t, hlMarge[i], M.chaque + 1.0 + i * 0.1, null); hlMarge[i].style.opacity = '0.7';
      marker(t, hlDays[i], M.dort + 0.4 + i * 0.12, null); hlDays[i].style.opacity = '0.85';
    });
  }

  /* ---------- 8 : 5 Tableau de bord ---------- */
  const s8On = inWin(t, M.f5, M.sais); show(s8, s8On);
  if (s8On) {
    push(s8, t, M.f5, M.sais);
    drawHeader(hd5, t, M.f5, M.coup + 0.2);
    const out = spring(t - (M.sais - 0.3), 'default');
    const zoom = spring(t - M.coup, 'default');
    const kw = kp[0]._w, kh = kp[0]._h;
    const when = [M.stock, M.argent, M.marge, M.marge + 0.35, M.marge + 0.5, M.marge + 0.65];
    kp.forEach((c, i) => {
      const col = i % 2, row = Math.floor(i / 2), p = spring(t - when[i], 'default');
      const x0 = CX + (col ? 1 : -1) * (kw / 2 + 10), y0 = 620 + row * (kh + 20);
      // vue d'ensemble : la grille rétrécit en haut, les panneaux arrivent autour
      const x = lerp(x0, CX + (col ? 1 : -1) * (kw * 0.55 / 2 + 6) - 210, zoom), y = lerp(y0, 470 + row * (kh * 0.55 + 10), zoom);
      const pop = i === 2 ? bump(t, M.marge + 0.1, 0.16) * 0.06 : 0;
      place(c, x + (1 - p) * (col ? 700 : -700), y - out * 1400, (0.8 + 0.2 * p) * lerp(1, 0.55, zoom) * (1 + pop), 0, p);
    });
    const PP = [[720, 500], [720, 1010], [290, 960], [290, 1270]];
    panels.forEach((c, i) => {
      const p = spring(t - (M.coup + 0.1 + i * 0.12), 'default');
      place(c, PP[i][0] + (1 - p) * 700, PP[i][1] + (1 - p) * 300 - out * 1400, 0.9 + 0.1 * p, 0, p);
    });
  }

  /* ---------- 9 : promesse ---------- */
  const s9On = inWin(t, M.sais, M.logo); show(s9, s9On);
  if (s9On) {
    const push = smooth(M.sais, M.logo, t);
    typeText(SAIS, t, M.sais - 0.25, null, 0.025, 34); at(SAIS, 760 - push * 40, 1 + push * 0.08);
    typeText(REV, t, M.revends, null, 0.025, 34); at(REV, 940 - push * 30, 1 + push * 0.08);
  }
  const enOn = t >= M.logo; show(en, enOn);
  if (enOn) {
    const p = spring(t - M.logo, 'heavy'), push = smooth(M.logo, M.end, t);
    const click = M.cta + 1.0, press = bump(t, click - 0.03, 0.11);
    en.style.transformOrigin = '500px 850px'; en.style.transform = `scale(${(1 + push * 0.04).toFixed(4)})`;
    place(pill, CX, 660, 0.85 * (0.55 + 0.45 * p), 0, clamp(p * 2, 0, 1));
    typeText(CTA, t, M.cta, null, 0.03, 30); at(CTA, 900); marker(t, ctaBg, M.cta + 0.25, null);
    const gar = CTA.querySelector('.g'); gar.style.display = 'inline-block';
    gar.style.transform = `scale(${(1 - press * 0.08 + spring(t - click, 'snappy') * 0.05 - spring(t - (click + 0.4), 'default') * 0.05).toFixed(4)})`;
    typeText(CTA2, t, M.cta + 0.6, null, 0.025); at(CTA2, 1030);
    moveCursor(curD, t, [[M.logo + 0.4, 1000, 1700], [M.logo + 0.45, 760, 930], [click + 0.4, 850, 1080]], [click], M.logo + 0.4, 1e9);
  } else show(curD, false);
  if (!curOn) show(cur, false);
};

await document.fonts.ready;
await document.fonts.load("800 76px 'Archivo'"); await document.fonts.load("400 76px 'Archivo'"); await document.fonts.load("600 27px 'Archivo'");
for (const [b, s] of FITS) fitW(b, s);
window.seek(0);
window.filmReady = true;
