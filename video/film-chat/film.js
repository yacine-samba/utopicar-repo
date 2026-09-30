// UTOPICAR — film « conversation » 60 s, 1080x1920, 30 i/s, 128 BPM (mesure = 1,875 s).
// Grammaire inspirée de la référence 4 : recherche tapée, phrases adressées au spectateur sur un aplat profond,
// pop du logo, anneau relié, essaim de bulles, fenêtre inclinée + pastille flottante, macro du logo,
// panneaux pastel par fonction, anneau d'icônes, pause noire, message tapé, kaléidoscope, bouton cliqué.
// Contenu original, vraies captures (données démo), logo fourni par l'utilisateur. window.seek(t) peint la frame t.
const { spring, clamp, lerp, noise } = Motion;
const { el, show, smooth, inOut, bump, place, crop, text, typeText, marker, cursor, moveCursor, hash } = Kit;
const TL = await (await fetch('../timeline-chat.json')).json();
const U1 = await (await fetch('../assets/ui/layout.json')).json();
const U2 = await (await fetch('../assets/ui2/layout.json')).json();
const ICONS = await (await fetch('../assets/ui2/dock-icons.json')).json();
const LOGO = (await (await fetch('../assets/brand/logo.svg')).text()).replace(/<!--.*?-->/s, '');
const M = TL.marks, B = 60 / TL.bpm, BAR = 4 * B;
const stage = document.getElementById('stage');
const inWin = (t, a, b) => t >= a && t < b;
const DEEP = '#2B1D16', WARM = '#FFF8F4', ORANGE = '#FF5A1F';

const SRC = {};
async function load(key, url) { const i = new Image(); i.src = url; await i.decode(); SRC[key] = { url, w: i.naturalWidth, h: i.naturalHeight }; }
for (const k of Object.keys(U2.shots)) await load(k, `../assets/ui2/${k}.png`);
for (const k of ['card-lv1']) await load(k, `../assets/ui/${k}.png`);
const PAD = { dcard1: [8, 22], dcard2: [8, 22], kpi1: [8, 18], kpi2: [8, 18], kpi3: [8, 18], kpi4: [8, 18], kpi5: [8, 18], kpi6: [8, 18],
  qsform: [10, 22], 'card-lv1': [6, 22], mchart: [10, 22], ticket: [0, 0], vrow1: [2, 0], vrow2: [2, 0], vrow3: [2, 0], vrow4: [2, 0], schip: [6, 17] };
const dims = (key, k) => { const pd = (PAD[key] || [0])[0]; return { w: (SRC[key].w / 3 - 2 * pd) * k, h: (SRC[key].h / 3 - 2 * pd) * k }; };
function card(parent, key, k, cls) {
  const [pd, rad] = PAD[key] || [0, 0]; const s = SRC[key];
  const e = el('div', 'abs' + (cls ? ' ' + cls : ''), parent); e.style.borderRadius = rad * k + 'px'; e.style.overflow = 'hidden';
  crop(e, s.url, s.w, s.h, { x: pd, y: pd, w: s.w / 3 - 2 * pd, h: s.h / 3 - 2 * pd }, k); return e;
}
const cropOf = (parent, key, r, k) => crop(parent, SRC[key].url, SRC[key].w, SRC[key].h, r, k);
const logoEl = (parent, w, cls) => { const e = el('div', 'abs logo' + (cls ? ' ' + cls : ''), parent); e.innerHTML = LOGO; e.style.width = w + 'px'; e.style.height = w * 1539 / 1612 + 'px'; e.style.borderRadius = w * 222 / 1612 + 'px'; return e; };
// sur l'aplat sombre, la tuile garde son bord (liseré clair) et décolle du fond
const onDark = (e) => { e.style.boxShadow = '0 0 0 3px rgba(255,255,255,.16), 0 40px 90px -30px rgba(0,0,0,.7)'; e.style.filter = ''; };
const txtAt = (b, y) => { b.style.transform = `translate(0px,${(y - b.offsetHeight / 2).toFixed(1)}px)`; };

/* ---------- fond ---------- */
const bg = el('div', 'bg', stage);

/* ---------- 1. recherche ---------- */
const s0 = el('div', 'layer', stage);
const sbar = el('div', 'sbar', s0);
const sLogo = logoEl(sbar, 96); Object.assign(sLogo.style, { left: '18px', top: '19px' });
const sQ = el('div', 'q', sbar); sQ.style.left = '138px';
const sCaret = el('div', 'caret', sbar);
const sIc = el('div', 'ic', sbar); sIc.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#1A1310" stroke-width="2.6" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>';
const Q0 = 'UTOPICAR en 60 secondes';
sQ.style.fontSize = '48px';

/* ---------- 2. aplat : phrases ---------- */
const s1 = el('div', 'layer', stage);
const T_BON = text(s1, [['Bon.', 'w']]);
const T_60 = text(s1, [['Tu as', 'w'], ['\n', ''], ['60 secondes ?', 'o']]); T_60.style.fontSize = '96px';
const ringSvg = el('div', 'abs', s1); ringSvg.innerHTML = `<svg width="1080" height="1920" viewBox="0 0 1080 1920"><circle id="rc" cx="540" cy="960" r="440" fill="none" stroke="${ORANGE}" stroke-width="10" stroke-linecap="round" transform="rotate(-90 540 960)"/>
  <g id="ticks" stroke="${ORANGE}" stroke-width="8" stroke-linecap="round"><line x1="540" y1="470" x2="540" y2="400"/><line x1="1030" y1="960" x2="1080" y2="960"/><line x1="540" y1="1450" x2="540" y2="1520"/><line x1="50" y1="960" x2="0" y2="960"/></g></svg>`;
const rc = ringSvg.querySelector('#rc'), ticks = ringSvg.querySelector('#ticks'); const RC = 2 * Math.PI * 440;
rc.setAttribute('stroke-dasharray', `${RC} ${RC}`);
const T_A1 = text(s1, [['Assez pour ne plus jamais', 'w']]); T_A1.style.fontSize = '80px';
const T_A2 = text(s1, [['acheter ', 'w'], ['trop cher.', 'o']]); T_A2.style.fontSize = '104px';

/* ---------- 3. logo, anneau, tableau ---------- */
const s2 = el('div', 'layer', stage);
const lines = el('div', 'abs', s2); lines.innerHTML = '<svg class="lines" width="1080" height="1920"></svg>';
const lsvg = lines.firstChild;
const CHIP_DEF = [
  ['dcard1', { x: 129, y: 122, w: 71, h: 23 }], ['vrow1', { x: 20, y: 15, w: 107, h: 23 }], ['dcard2', { x: 185, y: 122, w: 76, h: 23 }],
  ['dcard1', { x: 196, y: 155, w: 106, h: 22 }], ['vrow3', { x: 242, y: 15, w: 102, h: 23 }], ['vrow2', { x: 20, y: 15, w: 103, h: 23 }],
  ['dcard2', { x: 129, y: 122, w: 50, h: 23 }], ['dcard2', { x: 196, y: 155, w: 106, h: 22 }], ['vrow4', { x: 20, y: 15, w: 108, h: 23 }], ['dcard1', { x: 206, y: 122, w: 76, h: 23 }],
];
const ring = CHIP_DEF.map(([k, r], i) => { const c = el('div', 'chip', s2); cropOf(c, k, r, 2.3); const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line'); ln.setAttribute('stroke', 'rgba(255,255,255,.22)'); ln.setAttribute('stroke-width', '3'); lsvg.appendChild(ln); c._ln = ln; return c; });
const rip = el('div', 'abs', s2); rip.innerHTML = `<svg width="1080" height="1920">${[0, 1].map(() => `<circle cx="540" cy="960" r="0" fill="none" stroke="${ORANGE}" stroke-width="5"/>`).join('')}</svg>`;
const ripples = [...rip.querySelectorAll('circle')];
const bigLogo = logoEl(s2, 340); onDark(bigLogo);
const mchart = card(s2, 'mchart', 1.95, 'shadow');

/* ---------- 4. « D'abord : » ---------- */
const s3 = el('div', 'layer', stage);
const T_AB = text(s3, [["D'abord :", 'i']]); T_AB.style.fontSize = '120px';

/* ---------- 5. essaim ---------- */
const s4 = el('div', 'layer', stage);
const PRICES = ['6 400 €', '7 200 €', '8 400 €', '5 900 €', '9 500 €', '6 900 €', '7 800 €', '8 200 €'];
const bubs = Array.from({ length: 34 }, (_, i) => {
  const kind = i % 7 === 3 ? ' o2' : (i % 5 === 1 ? ' d2' : ''); const b = el('div', 'bub' + kind, s4); b.textContent = PRICES[i % PRICES.length];
  b._p = { s: M.swarm + hash(i) * 2.0, r: 300 + hash(i + 50) * 330, a0: hash(i + 9) * Math.PI * 2, y0: 300 + hash(i + 30) * 1320, sc: 0.75 + hash(i + 70) * 0.5, w: 0.55 + hash(i + 80) * 0.35 };
  return b;
});
const schip = card(s4, 'schip', 4.2); schip.style.boxShadow = '0 30px 70px -30px rgba(0,0,0,.6)'; schip.style.zIndex = 5;

/* ---------- 6. fenêtre inclinée ---------- */
const s5 = el('div', 'layer persp', stage);
const K6 = 1.55; const win = card(s5, 'card-lv1', K6, 'shadow'); const winD = dims('card-lv1', K6);
const winShade = el('div', 'shade', win);
Object.assign(winShade.style, { left: 15 * K6 + 'px', top: 679.6 * K6 + 'px', width: 129 * K6 + 'px', height: 33.5 * K6 + 'px' });
const LV = U1.shots['card-lv1'], sous = U1.cote.sous;
const winHl = el('div', 'hl', win);
Object.assign(winHl.style, { left: (sous.x - LV.x - 10) * K6 + 'px', top: (sous.y - LV.y - 7) * K6 + 'px', width: (sous.w + 8) * K6 + 'px', height: (sous.h + 2) * K6 + 'px' });
const plabel = el('div', 'plabel', s5); plabel.textContent = '1 450 € sous la cote';

/* ---------- 7. « Mais c'est pas tout. » ---------- */
const s6 = el('div', 'layer', stage);
const T_M1 = text(s6, [['Mais', 'w']]); T_M1.style.fontSize = '120px';
const T_M2 = text(s6, [["c'est pas ", 'w'], ['tout.', 'o']]); T_M2.style.fontSize = '120px';

/* ---------- 8. macro du logo ---------- */
const s7 = el('div', 'layer', stage);
const macro = logoEl(s7, 5600);

/* ---------- 9. panneaux pastel ---------- */
const s8 = el('div', 'layer', stage);
const CAP = [text(s8, [['Le prix à ', 'i'], ['ne pas dépasser', 'i']], 'cap'), text(s8, [['Ton parc, ', 'i'], ['à jour', 'i']], 'cap'),
  text(s8, [['Ta marge, ', 'i'], ['au centime', 'i']], 'cap'), text(s8, [['La bonne affaire, ', 'i'], ['en direct', 'i']], 'cap')];
CAP.forEach(b => b.style.fontSize = '64px');
const K7 = 1.75;
const tkC = el('div', 'abs shadow', s8); Object.assign(tkC.style, { background: '#FFFFFF', borderRadius: '44px', padding: '22px 22px 18px' });
crop(tkC, SRC.ticket.url, SRC.ticket.w, SRC.ticket.h, { x: 0, y: 0, w: SRC.ticket.w / 3, h: SRC.ticket.h / 3 }, K7).style.position = 'relative';
const pr = U2.ticketPlaf;
const plafL = el('div', 'abs', s8); plafL.style.borderRadius = 16 * K7 + 'px'; plafL.style.overflow = 'hidden'; cropOf(plafL, 'ticket', pr, K7).style.position = 'relative';
const plafHl = el('div', 'hl', plafL); Object.assign(plafHl.style, { left: 14 * K7 + 'px', top: 34 * K7 + 'px', width: 104 * K7 + 'px', height: 30 * K7 + 'px' });
const listC = el('div', 'abs shadow', s8); const rowD = dims('vrow1', K7);
Object.assign(listC.style, { background: '#FFFFFF', borderRadius: 22 * K7 + 'px', width: rowD.w + 20 + 'px', height: rowD.h * 4 + 24 + 'px', overflow: 'hidden' });
const rows = ['vrow1', 'vrow2', 'vrow3', 'vrow4'].map((k, i) => { const r = card(listC, k, K7); r.style.position = 'absolute'; r.style.left = '10px'; r.style.top = 12 + i * rowD.h + 'px'; return r; });
const rowShade = el('div', 'shade', listC); Object.assign(rowShade.style, { left: '10px', top: 12 + rowD.h + 'px', width: rowD.w + 'px', height: rowD.h + 'px', borderRadius: '0' });
const K8 = 1.95; const kd = dims('kpi1', K8);
const kpis = [1, 2, 3, 4, 5, 6].map(i => card(s8, 'kpi' + i, K8));
const K9 = 1.75; const qs = card(s8, 'qsform', K9, 'shadow'); const qd = dims('qsform', K9);
const qq = U2.qsQ, qg = U2.qsGo;
const typed = el('div', 'typed', qs);
Object.assign(typed.style, { left: (qq.x - 10 + 1) * K9 + 'px', top: (qq.y - 10 + 1) * K9 + 'px', width: (qq.w - 2) * K9 + 'px', height: (qq.h - 2) * K9 + 'px', borderRadius: 10 * K9 + 'px',
  fontSize: 16 * K9 + 'px', lineHeight: (qq.h - 2) * K9 + 'px', paddingLeft: 11 * K9 + 'px' });
const qShade = el('div', 'shade', qs); Object.assign(qShade.style, { left: (qg.x - 10) * K9 + 'px', top: (qg.y - 10) * K9 + 'px', width: qg.w * K9 + 'px', height: qg.h * K9 + 'px' });

/* ---------- 10. anneau d'icônes ---------- */
const s9 = el('div', 'layer', stage);
const ilines = el('div', 'abs', s9); ilines.innerHTML = '<svg class="lines" width="1080" height="1920"></svg>';
const icons = Object.values(ICONS).map(v => { const e = el('div', 'ico', s9); e.innerHTML = v.svg; const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line'); ln.setAttribute('stroke', 'rgba(26,19,16,.18)'); ln.setAttribute('stroke-width', '3'); ilines.firstChild.appendChild(ln); e._ln = ln; return e; });
const icLogo = logoEl(s9, 250); icLogo.style.filter = 'drop-shadow(0 26px 40px rgba(26,19,16,.3))';
const T_REL = text(s9, [['Tout est ', 'i'], ['relié.', 'i']], 'cap'); T_REL.style.fontSize = '64px';

/* ---------- pause noire : un curseur de texte qui clignote ---------- */
const sB = el('div', 'layer', stage); const bCaret = el('div', 'abs', sB); Object.assign(bCaret.style, { width: '8px', height: '96px', background: '#FFFFFF', borderRadius: '2px' });

/* ---------- 11. message ---------- */
const s10 = el('div', 'layer', stage);
const mbar = el('div', 'sbar msg', s10); mbar.style.width = '860px';
const mQ = el('div', 'q', mbar); mQ.style.lineHeight = '150px'; mQ.style.fontSize = '52px';
const mCaret = el('div', 'caret', mbar); mCaret.style.top = '44px';
const mIc = el('div', 'ic', mbar); mIc.style.top = '35px'; mIc.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#1A1310" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
const MQ = 'Mais en attendant…';
const sent = el('div', 'abs', s10); Object.assign(sent.style, { background: ORANGE, color: DEEP, fontWeight: 800, fontSize: '56px', borderRadius: '40px 40px 12px 40px', padding: '30px 44px', whiteSpace: 'nowrap' }); sent.textContent = MQ;
const dots = ['#FF5A1F', '#FFFFFF', '#FFC4A8'].map(c => { const d = el('div', 'dot', s10); d.style.background = c; return d; });

/* ---------- 12. kaléidoscope ---------- */
const s11 = el('div', 'layer', stage);
s11.innerHTML = '<svg width="1080" height="1920" viewBox="-540 -960 1080 1920"><g id="kal"></g><circle id="iris" cx="0" cy="0" r="0" fill="#FFF8F4"/></svg>';
const kal = s11.querySelector('#kal'), iris = s11.querySelector('#iris');
const PAL = ['#FF5A1F', '#1A1310', '#FFF8F4', '#FFC4A8', '#2A1F19', '#FF8A5C'];
const NW = 14;
const wedges = Array.from({ length: NW * 2 }, (_, i) => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); kal.appendChild(p); return p; });

/* ---------- 13. fin ---------- */
const s12 = el('div', 'layer', stage);
const lock = el('div', 'lock', s12); const ll = el('div', 'lg logo', lock); ll.innerHTML = LOGO; el('div', 'wm', lock).textContent = U1.logo.text;
const ctab = el('div', 'ctab', s12); ctab.innerHTML = 'Commente <b>GARAGE</b>';
const T_CTA2 = text(s12, [["pour recevoir l'accès.", 'g']]); T_CTA2.style.fontSize = '54px';

const cur = cursor(stage, false);

/* ================= seek ================= */
window.seek = function (t) {
  // fond
  let c = WARM;
  if (inWin(t, M.bon, M.dabord) || inWin(t, M.swarm, M.window) || inWin(t, M.mais, M.macro) || inWin(t, M.msg, M.kaleido)) c = DEEP;
  else if (inWin(t, M.dabord, M.swarm)) c = '#FFFFFF';
  else if (inWin(t, M.macro, M.pRap)) c = '#1A1310';
  else if (inWin(t, M.pRap, M.pParc)) c = '#E4F6EC';
  else if (inWin(t, M.pParc, M.pKpi)) c = '#EAEFFF';
  else if (inWin(t, M.pKpi, M.pSearch)) c = '#FFF2DA';
  else if (inWin(t, M.pSearch, M.icons)) c = '#FFE6DB';
  else if (inWin(t, M.black, M.msg)) c = '#000000';
  bg.style.background = c;
  let curOn = false;

  // ---- 1. recherche
  const on0 = t < M.bon; show(s0, on0);
  if (on0) {
    const a = spring(t - 0.0, 'heavy'), open = spring(t - 0.47, 'default');
    const w = lerp(132, 930, open), press = bump(t, M.click0 - 0.03, 0.12), zoom = smooth(M.click0 + 0.2, M.bon, t);
    sbar.style.width = w.toFixed(1) + 'px';
    place(sbar, 540, 960, (0.9 + 1.1 * a) * (1 - 0.48 * open) * (1 - press * 0.03) * (1 + zoom * 0.25 + smooth(0.5, M.click0, t) * 0.06), 0, clamp(a * 2, 0, 1));
    const n = clamp(Math.floor((t - M.type0) / 0.035) + 1, 0, Q0.length); sQ.textContent = t >= M.type0 ? Q0.slice(0, n) : '';
    sQ.style.opacity = open.toFixed(3);
    sCaret.style.left = 138 + sQ.offsetWidth + 4 + 'px'; show(sCaret, open > 0.9 && Math.floor(t * 2.6) % 2 === 0 || (t > M.type0 && t < M.type0 + Q0.length * 0.035));
    sIc.style.transform = `scale(${spring(t - 0.75, 'snappy').toFixed(3)})`;
    moveCursor(cur, t, [[1.6, 980, 1500], [1.75, 540 + 450 - 70, 975]], [M.click0], 1.6, M.bon); curOn = inWin(t, 1.6, M.bon);
  }

  // ---- 2. phrases sur l'aplat
  const on1 = inWin(t, M.bon, M.pop); show(s1, on1);
  if (on1) {
    typeText(T_BON, t, M.bon, M.t60 - 0.2, 0.05, 30); txtAt(T_BON, 960); show(T_BON, t < M.t60 + 0.3);
    show(T_60, inWin(t, M.t60 - 0.05, M.assez + 0.3)); typeText(T_60, t, M.t60, M.assez - 0.25, 0.035, 30); txtAt(T_60, 960);
    T_60.style.transformOrigin = '540px 110px'; T_60.style.transform += ` scale(${(1 + smooth(M.t60, M.assez, t) * 0.1).toFixed(4)})`;
    const rp = inOut(M.t60 + 0.2, M.assez - 0.3, t), ro = spring(t - (M.assez - 0.3), 'snappy');
    rc.setAttribute('stroke-dashoffset', (RC * (1 - rp)).toFixed(1)); ringSvg.style.opacity = (1 - ro).toFixed(3);
    const tk = spring(t - M.t60, 'default'); ticks.style.opacity = tk.toFixed(3);
    ringSvg.style.transform = `scale(${(0.9 + 0.1 * spring(t - M.t60, 'heavy') + ro * 0.15).toFixed(4)})`; ringSvg.style.transformOrigin = '540px 960px';
    show(T_A1, t >= M.assez - 0.05); show(T_A2, t >= M.trop - 0.05);
    typeText(T_A1, t, M.assez, M.pop - 0.25, 0.028, 30); txtAt(T_A1, 900);
    typeText(T_A2, t, M.trop, M.pop - 0.25, 0.035, 30); txtAt(T_A2, 1020);
  }

  // ---- 3. logo, anneau, tableau
  const on2 = inWin(t, M.pop, M.dabord); show(s2, on2);
  if (on2) {
    const p = spring(t - M.pop, 'heavy'), shrink = spring(t - M.ringUI, 'default'), out = inOut(M.table, M.table + 0.6, t);
    const beatBump = Math.max(...[1, 2, 3].map(k => bump(t, M.pop + k * B, 0.08))) * (t < M.ringUI ? 0.03 : 0);
    place(bigLogo, 540, 960 - out * 200, (0.3 + 0.7 * p) * (1 - 0.3 * shrink) * (1 + beatBump) * (1 + out * 1.4) * (1 + smooth(M.pop, M.ringUI, t) * 0.12 * (1 - shrink)), (1 - p) * -12 + noise(3, t * 0.5) * 2 * (1 - shrink), 1 - out * 1.2);
    ripples.forEach((r, i) => { const t0 = M.pop + (i + 1) * 2 * B; const u = clamp((t - t0) / 1.1, 0, 1); r.setAttribute('r', (190 + u * 420).toFixed(1)); r.setAttribute('opacity', (t >= t0 && t < M.ringUI ? (1 - u) * 0.8 : 0).toFixed(3)); });
    const rot = (t - M.ringUI) * 0.35;
    ring.forEach((e, i) => {
      const q = spring(t - (M.ringUI + i * B / 4), 'default'); const a = rot + i / ring.length * Math.PI * 2 - Math.PI / 2;
      const R = 400 * q * (1 + out * 1.3); const x = 540 + Math.cos(a) * R, y = 960 - out * 200 + Math.sin(a) * R * 1.12;
      place(e, x, y, (0.4 + 0.6 * q) * (1 + out * 0.6), 0, (t >= M.ringUI ? q : 0) * (1 - out * 1.3), out * 12);
      e._ln.setAttribute('x1', 540); e._ln.setAttribute('y1', 960 - out * 200); e._ln.setAttribute('x2', x.toFixed(1)); e._ln.setAttribute('y2', y.toFixed(1));
      e._ln.setAttribute('opacity', ((t >= M.ringUI ? q : 0) * (1 - out * 1.5)).toFixed(3));
    });
    const m = spring(t - (M.table + 0.1), 'default'); show(mchart, t >= M.table);
    place(mchart, 540, 960 + (1 - m) * 1300, 0.94 + 0.06 * m + smooth(M.table, M.dabord, t) * 0.03, 0, 1);
  }

  // ---- 4. D'abord
  const on3 = inWin(t, M.dabord, M.swarm); show(s3, on3);
  if (on3) { typeText(T_AB, t, M.dabord, null, 0.04, 40); txtAt(T_AB, 960); }

  // ---- 5. essaim
  const on4 = inWin(t, M.swarm, M.window); show(s4, on4);
  if (on4) {
    const cp = spring(t - M.swarm, 'heavy'), gulp = Math.max(0, ...bubs.map(b => bump(t, M.swarmIn + b._p.r / 2400, 0.05))) * 0.05;
    const out = spring(t - (M.window - 0.3), 'snappy');
    place(schip, 540, 960, (0.5 + 0.5 * cp) * (1 + gulp) * (1 - out * 0.2), 0, cp - out);
    bubs.forEach((b, i) => {
      const P = b._p; const u = t - P.s; if (u < 0) { b.style.opacity = '0'; return; }
      const ang = P.a0 + u * P.w; const inP = inOut(M.swarmIn, M.swarmIn + 0.45 + P.r / 2400, t);
      const ox = 540 + Math.cos(ang) * P.r * (1 - inP), oy = 960 + Math.sin(ang) * P.r * 1.35 * (1 - inP);
      const e = smooth(0, 1.4, u); const x = lerp(1250, ox, e), y = lerp(P.y0, oy, e);
      place(b, x, y, P.sc * (1 - inP * 0.8), 0, inP > 0.97 ? 0 : 1, 0);
    });
  }

  // ---- 6. fenêtre inclinée
  const on5 = inWin(t, M.window, M.mais); show(s5, on5);
  if (on5) {
    const t0 = M.window, a = spring(t - t0, 'default'), flat = spring(t - (M.pillLab + 0.9), 'default'), gone = spring(t - (M.mais - 0.32), 'default');
    const ry = lerp(-28, -12, spring(t - (t0 + 0.8), 'heavy')) * (1 - flat) + gone * 38, rx = 8 * (1 - flat);
    const x = 540 + (1 - a) * 900 + 60 * (1 - flat) - gone * 1300, y = 1000;
    win.style.transform = `translate(${x.toFixed(1)}px,${y}px) translate(-50%,-50%) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
    const pl = spring(t - M.pillLab, 'default'), plOut = spring(t - (M.mais - 0.4), 'default');
    plabel.style.transform = `translate(${(lerp(-500, 330, pl) - plOut * 900).toFixed(1)}px,${(560 + 30 * flat).toFixed(1)}px) translate(-50%,-50%) rotateY(${lerp(-40, -14, pl).toFixed(2)}deg) rotate(${(-6 + 3 * flat).toFixed(2)}deg)`;
    marker(t, winHl, M.pillLab + 0.35, null); winHl.style.opacity = '0.85';
    winShade.style.opacity = bump(t, M.winClick, 0.16).toFixed(3);
    const bx = 540 - winD.w / 2 + (15 + 129 * 0.55) * K6, by = 1000 - winD.h / 2 + (679.6 + 22) * K6;
    moveCursor(cur, t, [[M.pillLab + 0.9, 1000, 1760], [M.pillLab + 1.0, bx, by], [M.winClick + 0.7, bx + 60, by + 160]], [M.winClick], M.pillLab + 0.9, M.mais - 0.3);
    curOn = inWin(t, M.pillLab + 0.9, M.mais - 0.3);
  }

  // ---- 7. Mais c'est pas tout
  const on6 = inWin(t, M.mais, M.macro); show(s6, on6);
  if (on6) { typeText(T_M1, t, M.mais, null, 0.05, 30); txtAt(T_M1, 890); typeText(T_M2, t, M.pastout, null, 0.035, 30); txtAt(T_M2, 1030); }

  // ---- 8. macro du logo
  const on7 = inWin(t, M.macro, M.pRap); show(s7, on7);
  if (on7) {
    const p = inOut(M.macro - 0.1, M.pRap + 0.1, t), s = 5600 / 1612 * (1 + p * 0.18);
    const cx = lerp(820, 1500, p), cy = lerp(960, 930, p);
    macro.style.transformOrigin = '0 0';
    macro.style.transform = `translate(${(540 - (cx - 160) * s).toFixed(1)}px,${(960 - (cy - 173) * s).toFixed(1)}px) scale(${(1 + p * 0.18).toFixed(4)}) rotate(${lerp(-5, 2, p).toFixed(2)}deg)`;
  }

  // ---- 9. panneaux
  const on8 = inWin(t, M.pRap, M.icons); show(s8, on8);
  if (on8) {
    const seg = [M.pRap, M.pParc, M.pKpi, M.pSearch, M.icons]; let k = 0; while (k < 3 && t >= seg[k + 1]) k++;
    s8.style.transformOrigin = '540px 1000px'; s8.style.transform = `scale(${(1 + smooth(seg[k], seg[k + 1], t) * 0.06).toFixed(4)})`;
    const P = [M.pRap, M.pParc, M.pKpi, M.pSearch, M.icons];
    CAP.forEach((b, i) => { const a = P[i], o = P[i + 1]; const v = inWin(t, a, o); show(b, v); if (v) { typeText(b, t, a + 0.2, o - 0.25, 0.03, 26); txtAt(b, 330); } });
    // rapport
    const r0 = M.pRap, vR = inWin(t, r0, M.pParc); show(tkC, vR); show(plafL, vR);
    if (vR) {
      const a = spring(t - r0, 'default'), o = spring(t - (M.pParc - 0.3), 'snappy'), push = smooth(r0, M.pParc, t);
      const tw = SRC.ticket.w / 3 * K7 + 44, th = SRC.ticket.h / 3 * K7 + 40;
      const cy = 1080 + (1 - a) * 1300 - push * 60 - o * 200; place(tkC, 540, cy, 1, 0, 1 - o);
      const lift = spring(t - (r0 + 2 * BAR - 2 * B), 'default');
      const px = 540 - tw / 2 + 22 + (pr.x + pr.w / 2) * K7, py = cy - th / 2 + 22 + (pr.y + pr.h / 2) * K7;
      plafL.style.boxShadow = `0 ${(lift * 40).toFixed(1)}px ${(lift * 80).toFixed(1)}px -30px rgba(26,19,16,${(lift * 0.4).toFixed(3)})`;
      place(plafL, px, py - lift * 24, 1 + lift * 0.08, 0, (t > r0 + 2 * BAR - 2 * B - 0.05 ? 1 : 0) * (1 - o));
      marker(t, plafHl, r0 + 2 * BAR - B, null);
      moveCursor(cur, t, [[r0 + 0.8, 1000, 1760], [r0 + 1.0, px + 120, py + 10]], [r0 + 2 * BAR - 2 * B], r0 + 0.8, M.pParc - 0.2); curOn = curOn || inWin(t, r0 + 0.8, M.pParc - 0.2);
    }
    // parc
    const p0 = M.pParc, vP = inWin(t, p0, M.pKpi); show(listC, vP);
    if (vP) {
      const a = spring(t - p0, 'default'), o = spring(t - (M.pKpi - 0.3), 'snappy');
      const cy = 1060 + (1 - a) * 1200 - o * 200; place(listC, 540, cy, 1, 0, 1 - o);
      rows.forEach((r, i) => { const q = spring(t - (p0 + 0.2 + i * B / 2), 'default'); r.style.opacity = clamp(q * 1.5, 0, 1).toFixed(3); r.style.transform = `translateY(${((1 - q) * 70).toFixed(1)}px)`; });
      rowShade.style.opacity = (bump(t, p0 + BAR + 2 * B, 0.2) * 0.6).toFixed(3);
      const lh = rowD.h * 4 + 24; const rx = 540 + rowD.w / 2 - 120, ry = cy - lh / 2 + 12 + rowD.h * 1.2;
      moveCursor(cur, t, [[p0 + 0.9, 1000, 1760], [p0 + 1.0, rx, ry]], [p0 + BAR + 2 * B], p0 + 0.9, M.pKpi - 0.2); curOn = curOn || inWin(t, p0 + 0.9, M.pKpi - 0.2);
    }
    // KPI
    const k0 = M.pKpi, vK = inWin(t, k0, M.pSearch); kpis.forEach(e => show(e, vK));
    if (vK) {
      const o = spring(t - (M.pSearch - 0.3), 'snappy');
      kpis.forEach((e, i) => {
        const col = i % 2, row = Math.floor(i / 2); const x = 540 + (col ? 1 : -1) * (kd.w / 2 + 12), y = 1060 + (row - 1) * (kd.h + 24);
        const p = spring(t - (k0 + i * B / 4), 'default'), lift = i === 2 ? spring(t - (k0 + BAR), 'default') : 0;
        e.style.boxShadow = `0 ${(4 + lift * 36).toFixed(1)}px ${(20 + lift * 60).toFixed(1)}px -18px rgba(26,19,16,${(0.25 + lift * 0.25).toFixed(3)})`; e.style.zIndex = i === 2 ? 2 : 1;
        place(e, x, y + (1 - p) * 300 - lift * 20 - o * 200, (0.8 + 0.2 * p) * (1 + lift * 0.07), 0, p - o);
      });
      const kx = 540 - (kd.w / 2 + 12) + kd.w * 0.3, ky = 1060 + 20;
      moveCursor(cur, t, [[k0 + 0.6, 1000, 1760], [k0 + 0.7, kx, ky]], [k0 + BAR], k0 + 0.6, M.pSearch - 0.2); curOn = curOn || inWin(t, k0 + 0.6, M.pSearch - 0.2);
    }
    // recherche
    const q0 = M.pSearch, vQ = inWin(t, q0, M.icons); show(qs, vQ);
    if (vQ) {
      const a = spring(t - q0, 'default'), o = spring(t - (M.icons - 0.25), 'snappy');
      const cy = 1030 + (1 - a) * 1300 - o * 200; place(qs, 540, cy, 1, 0, 1 - o);
      const s = 'dCi 90', n = clamp(Math.floor((t - (q0 + 0.5)) / 0.07) + 1, 0, s.length);
      typed.textContent = t >= q0 + 0.5 ? s.slice(0, n) + (Math.floor(t * 2.6) % 2 === 0 ? '|' : '') : '';
      show(typed, t >= q0 + 0.45);
      qShade.style.opacity = bump(t, M.searchClick, 0.16).toFixed(3);
      const gx = 540 - qd.w / 2 + (qg.x - 10 + qg.w * 0.6) * K9, gy = cy - qd.h / 2 + (qg.y - 10 + qg.h * 0.6) * K9;
      moveCursor(cur, t, [[q0 + 0.3, 1000, 1760], [q0 + 0.4, gx, gy]], [M.searchClick], q0 + 0.3, M.icons - 0.2); curOn = curOn || inWin(t, q0 + 0.3, M.icons - 0.2);
    }
  }

  // ---- 10. anneau d'icônes
  const on9 = inWin(t, M.icons, M.black); show(s9, on9);
  if (on9) {
    const p = spring(t - M.icons, 'heavy'), cy = 880;
    place(icLogo, 540, cy, 0.4 + 0.6 * p, 0, clamp(p * 2, 0, 1));
    icons.forEach((e, i) => {
      const q = spring(t - (M.icons + 0.1 + i * B / 2), 'default'); const a = (t - M.icons) * 0.3 + i / icons.length * Math.PI * 2 - Math.PI / 2;
      const x = 540 + Math.cos(a) * 340 * q, y = cy + Math.sin(a) * 340 * q;
      place(e, x, y, 0.5 + 0.5 * q, 0, q);
      e._ln.setAttribute('x1', 540); e._ln.setAttribute('y1', cy); e._ln.setAttribute('x2', x.toFixed(1)); e._ln.setAttribute('y2', y.toFixed(1)); e._ln.setAttribute('opacity', q.toFixed(3));
    });
    typeText(T_REL, t, M.icons + 0.9, M.black - 0.25, 0.035, 26); txtAt(T_REL, 1380);
  }

  // ---- pause noire
  const onB = inWin(t, M.black, M.msg); show(sB, onB);
  if (onB) place(bCaret, 540, 960, 1, 0, t > M.black + 0.3 && Math.floor((t - M.black) / (B)) % 2 === 1 ? 1 : 0);

  // ---- 11. message
  const on10 = inWin(t, M.msg, M.kaleido); show(s10, on10);
  if (on10) {
    const a = spring(t - M.msg, 'default'), sendP = spring(t - M.send, 'default');
    place(mbar, 540, 1180 + (1 - a) * 300 + sendP * 60, 1, 0, a * (1 - spring(t - M.dots, 'snappy')));
    const n = clamp(Math.floor((t - (M.msg + 0.3)) / 0.06) + 1, 0, MQ.length);
    mQ.textContent = t >= M.msg + 0.3 && t < M.send ? MQ.slice(0, n) : '';
    mCaret.style.left = 56 + mQ.offsetWidth + 4 + 'px'; show(mCaret, t < M.send && Math.floor(t * 2.6) % 2 === 0);
    mIc.style.transform = `scale(${(1 - bump(t, M.send - 0.04, 0.1) * 0.15).toFixed(3)})`;
    show(sent, t >= M.send);
    const so = spring(t - (M.dots + B * 1.5), 'snappy');
    place(sent, lerp(540, 600, sendP), lerp(1180, 720, sendP) - so * 200, 0.8 + 0.2 * sendP, 0, sendP - so);
    dots.forEach((d, i) => {
      const q = spring(t - (M.dots + i * B / 2), 'default'), hop = Math.max(0, Math.sin((t - M.dots - i * 0.12) * 9)) * 40 * (t < M.kaleido - 0.5 ? 1 : 0);
      const grow = inOut(M.kaleido - 0.5, M.kaleido, t);
      place(d, 540 + (i - 1) * 150 * (1 - grow), 980 - hop, q * (1 + grow * 3), 0, q);
    });
  }

  // ---- 12. kaléidoscope
  const on11 = inWin(t, M.kaleido, M.logo); show(s11, on11);
  if (on11) {
    const k = Math.floor((t - M.kaleido) / B), rot = (t - M.kaleido) * 70 + k * 18;
    wedges.forEach((p, i) => {
      const ring2 = i >= NW, j = i % NW; const a0 = (j / NW) * 360 + rot * (ring2 ? -1 : 1), a1 = a0 + 360 / NW;
      const R0 = ring2 ? 0 : 520, R1 = ring2 ? 520 + 80 * Math.sin(t * 6 + j) : 1400;
      const P = (r, a) => `${(Math.cos(a * Math.PI / 180) * r).toFixed(1)},${(Math.sin(a * Math.PI / 180) * r).toFixed(1)}`;
      p.setAttribute('d', `M${P(R0, a0)} L${P(R1, a0)} L${P(R1, a1)} L${P(R0, a1)} Z`);
      p.setAttribute('fill', PAL[(j + k * (ring2 ? 2 : 1) + (ring2 ? 3 : 0)) % PAL.length]);
    });
    iris.setAttribute('r', (inOut(M.logo - 0.45, M.logo, t) * 1200).toFixed(1));
  }

  // ---- 13. fin
  const on12 = t >= M.logo; show(s12, on12);
  if (on12) {
    const push = smooth(M.logo, M.end, t), p = spring(t - M.logo, 'heavy');
    place(lock, 540, 830 - push * 20, (0.6 + 0.4 * p) * (1 + push * 0.09), 0, clamp(p * 2, 0, 1));
    const cb = spring(t - M.cta, 'default'), press = Math.max(bump(t, M.click - 0.03, 0.12), bump(t, M.end - 2.8125 - 0.03, 0.12));
    place(ctab, 540, 1060 + (1 - cb) * 60, (0.7 + 0.3 * cb) * (1 - press * 0.06) * (1 + push * 0.09), 0, cb);
    typeText(T_CTA2, t, M.cta2, null, 0.028, 24); txtAt(T_CTA2, 1200);
    moveCursor(cur, t, [[M.cta + 0.2, 1000, 1760], [M.cta + 0.3, 700, 1085], [M.click + 0.6, 880, 1340], [M.end - 3.6, 690, 1090], [M.end - 2.2, 900, 1360]], [M.click, M.end - 2.8125], M.cta + 0.2, M.end + 1);
    curOn = curOn || t >= M.cta + 0.2;
  }
  if (!curOn) show(cur, false);
};

await document.fonts.ready;
await document.fonts.load("800 92px 'Archivo'"); await document.fonts.load("600 50px 'Archivo'");
window.seek(0);
window.filmReady = true;
