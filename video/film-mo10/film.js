// MO10 « Deux voitures » (32,6 s). Contrat : window.seek(t) peint la frame t, sans état entre les frames.
// window.shutter(t) / window.samples(t) : flou de bougé au rendu (MB=4).
// Minutage lu dans la voix retenue (audio/vo-mo10/vo-timing.json, scripts/vo-mo10.py) : chaque événement suit son mot.
// Construit sur lib/kit47.js (modules de MO5), même architecture que film-mo9/film.js.
(async function () {
  const { track, clamp, lerp, noise } = Motion;
  const { f3, S, sm, P, el, sv, set, defs, word, writeWord, fullWord, notif, load, loadSeqs, drawSeq, counter, rollKeys, paintCounter } = Kit47;
  const stage = document.getElementById('stage');
  // Clash rend l'espace normale très étroite : « 4 000 » se lit « 4000 ». Espaces des milliers et avant « € » élargies.
  const TH = (str) => str.replace(/(\d) (\d{3})/g, '$1<i class="th"></i>$2').replace(/ €/g, '<i class="th"></i>€');
  const fixAm = (n) => { const a = n.d.querySelector('.am'); a.innerHTML = TH(a.innerHTML); return n; };

  // ---------- minutage ----------
  const VT = await (await fetch('../audio/vo-mo10/vo-timing.json')).json();
  const DUR = VT.dur, LOOP = VT.loop;                     // 32,6 s, boucle à 30,3 s (scripts/vo-mo10.py)
  const M = (k) => VT.marks[k].t, ME = (k) => VT.marks[k].end;
  const T = {
    sh1: M('deux') - 0.05, sh2: M('mille') - 0.05,      // la lumière passe sur « 2 × » puis sur « 1 000 »
    w2: M('deuxm') - 0.06, q: ME('total') + 0.02,        // « = 2 000 € » s'écrit sur « deux mille », puis le « ? »
    tally: M('voisin') - 0.02, tallyEnd: ME('jours') - 0.05, cap: M('compte') - 0.12,
    out: ME('jours') + 0.12,                              // le calcul se replie, le monde s'allume
    deb0: M('cartes') - 0.05, deb1: M('controles') - 0.05, deb2: M('assur') - 0.05,
    d0: M('premiere') - 0.12, leave: M('part') - 0.02, sold: M('huit') + 0.12,
    wait0: M('la2a') - 0.05,                              // « La deuxième… » : la 207 vient au centre
    bubble: M('il') - 0.04, reply: M('tuacc') - 0.03, credit: ME('acceptes') + 0.02,
    big: M('n120') - 0.06, pk1: M('moins') - 0.05,
    ceux: M('ceux') - 0.02, comptent: M('comptent') - 0.05,
    r1: M('ta') - 0.1, v1: M('n55') - 0.08, r2: M('lesdeux') - 0.1, v2: M('trois') - 0.06,
    verd: M('la3') - 0.05, verd2: M('jour8') - 0.06,
  };
  T.hud = T.out + 0.12; T.j1 = T.out + 0.04; T.roll = T.credit + 0.3;
  T.d1 = M('huit') + 0.15; T.d2 = T.wait0 + 0.15; T.d3 = T.bubble - 0.25;
  const REW = [ME('seule') + 0.12, ME('seule') + 0.82];
  T.deb = [T.deb0, T.deb1, T.deb2]; for (let k = 0; k < 5; k++) T.deb.push(T.deb2 + 0.5 + 0.32 * k);

  // ---------- les jours : JOUR 1 → 8 (la Twingo part), puis 8 → 40 qui accélère (la 207 reste) ----------
  const dayAt = (st) => {
    if (st < T.d0) return 1;
    if (st < T.d1) { const u = (st - T.d0) / (T.d1 - T.d0); return 1 + 7 * u * u * (3 - 2 * u); }
    if (st < T.d2) return 8;
    if (st < T.d3) return 8 + 32 * Math.pow((st - T.d2) / (T.d3 - T.d2), 1.3);
    return 40;
  };
  const tOfDay = (d) => d <= 8 ? T.d0 + (T.d1 - T.d0) * (d - 1) / 7 : T.d2 + (T.d3 - T.d2) * Math.pow((d - 8) / 32, 1 / 1.3);

  await Promise.all([
    document.fonts.load('700 150px Clash'), document.fonts.load('600 50px Clash'), document.fonts.load('500 22px Satoshi'),
    document.fonts.load('700 34px Satoshi'), document.fonts.load('italic 104px Fraunces'),
  ]);

  // ---------- vidéos (Mixkit, 30 i/s ; docs/timeline-mo10.md) ----------
  const SEQ = { signe: 120, assur: 120, ct: 120, ct2: 120, moteur: 120, moteur2: 108, pneu: 120, eponge: 120, essence: 120,
    phone: 120, capot: 120, cles: 120, calc: 120, jours: 120, garee: 120 };
  const IMG = await loadSeqs('seq', SEQ);
  const twI = await load('../assets/photos-mo10/twingo-a.png'), pgI = await load('../assets/photos-mo10/p207-a.png');

  // ---------- temps du récit : il avance, puis se rembobine (après la chute) jusqu'au jour 1 ----------
  const ST_FROM = REW[0] - 0.9, ST_TO = T.deb0 - 0.35;
  const story = (t) => {
    if (t >= LOOP) return 0;                                   // retour à l'image 0
    if (t < REW[0]) return t;
    if (t < REW[1]) { const u = (t - REW[0]) / (REW[1] - REW[0]); const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; return lerp(ST_FROM, ST_TO, e); }
    return ST_TO;
  };

  // ---------- caméras ----------
  const tf = (c, z = 0, extra = '') => `perspective(1700px) translateZ(${f3(c.z)}px) rotateX(${f3(c.rx)}deg) rotateY(${f3(c.ry)}deg) translate(${f3(-c.x)}px,${f3(-c.y)}px)${z ? ` translateZ(${f3(z)}px)` : ''} ${extra}`;
  // A : avance lente vers le calcul, puis glisse vers les bâtons du voisin
  const camA = (t) => ({
    rx: track(t, [[0, 6], [0.3, 3, { f: 0.45, z: 1 }], [T.tally, 1, { f: 0.35, z: 1 }]]) + noise(1, t * 0.45) * 0.5,
    ry: track(t, [[0, -6], [0.2, 2, { f: 0.4, z: 1 }], [T.tally, -2, { f: 0.3, z: 1 }]]) + noise(2, t * 0.4) * 0.6,
    z: track(t, [[0, 0], [0.2, 30, { f: 0.3, z: 1 }], [T.tally, 10, { f: 0.35, z: 1 }]]),
    x: track(t, [[0, -20], [0.2, 10, { f: 0.35, z: 1 }]]),
    y: track(t, [[0, -30], [0.2, 0, { f: 0.35, z: 1 }], [T.tally, 50, { f: 0.35, z: 1 }]]),
  });
  // W : le monde (les deux voitures, les débits, l'attente, la vente), une seule prise ; même pose à l'image 0 et à la fin
  const [w1, w2, w3, w4] = [T.out, T.leave - 0.1, T.wait0, T.big - 0.05];
  const camW0 = (t) => ({
    rx: 4 + noise(5, t * 0.4) * 0.45,
    ry: track(t, [[0, -3], [w1, 3, { f: 0.25, z: 1 }], [w2, -2, { f: 0.3, z: 1 }], [w3, 2, { f: 0.22, z: 1 }], [w4, 0, { f: 0.4, z: 1 }]]) + noise(6, t * 0.35) * 0.6,
    z: track(t, [[0, -40], [w1, 10, { f: 0.35, z: 1 }], [w2, -10, { f: 0.4, z: 1 }], [w3, 25, { f: 0.22, z: 1 }], [w4, -40, { f: 0.45, z: 1 }]]),
    x: track(t, [[0, 0], [w1, 30, { f: 0.25, z: 1 }], [w2, -40, { f: 0.3, z: 1 }], [w3, 0, { f: 0.25, z: 1 }]]),
    y: track(t, [[0, 0], [w1, -20, { f: 0.3, z: 1 }], [w3, -10, { f: 0.25, z: 1 }], [w4, 0, { f: 0.4, z: 1 }]]),
  });
  const C0 = camW0(0);
  const camW = (t) => { const c = camW0(t); if (t < LOOP) return c; const u = sm(LOOP, DUR - 0.12, t); for (const k in c) c[k] = lerp(c[k], C0[k], u); return c; };
  // F : orbite lente qui descend le long de la carte « par jour »
  const f0 = REW[1] - 0.15;
  const camF = (t) => ({
    rx: track(t, [[f0, 8], [f0, 3, { f: 0.3, z: 1 }]]) + noise(9, t * 0.4) * 0.4, ry: track(t, [[f0, -10], [f0, 4, { f: 0.22, z: 1 }]]) + noise(10, t * 0.35) * 0.5,
    z: track(t, [[f0, -120], [f0, 60, { f: 0.3, z: 1 }]]) + 7 * Math.max(0, t - f0), x: track(t, [[f0, 30], [f0, -10, { f: 0.3, z: 1 }]]),
    y: track(t, [[f0, -80], [f0, 40, { f: 0.22, z: 1 }]]) - 14 * Math.max(0, t - f0),
  });

  // ---------- fonds ----------
  const bgW = el('div', 'L', stage, 'background:radial-gradient(70% 50% at 50% 60%,#1d1520,#08070a 75%)');
  const nightCv = el('canvas', 'abs', bgW, 'left:-200px;top:-200px;width:1480px;height:2320px;filter:blur(20px) brightness(.34) saturate(.6)'); nightCv.width = 360; nightCv.height = 560;
  const night = el('div', 'L', bgW, 'background:linear-gradient(#0a0f1e,rgba(10,14,30,.55) 45%,rgba(8,7,10,.9))');   // la nuit tombe pendant l'attente
  el('div', 'abs', bgW, 'left:-210px;top:-320px;width:1500px;height:1500px;background:conic-gradient(from 180deg at 50% 0%,transparent 160deg,rgba(255,138,76,.10) 175deg,rgba(255,179,138,.17) 180deg,rgba(255,138,76,.10) 185deg,transparent 200deg);filter:blur(30px);mix-blend-mode:screen');
  const floor = el('div', 'abs', bgW, 'left:-300px;top:1400px;width:1680px;height:900px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 120px),repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 2px,transparent 2px 120px);transform:perspective(900px) rotateX(72deg);transform-origin:50% 0;-webkit-mask-image:linear-gradient(transparent,#000 30%,#000 60%,transparent)');
  const glowCar = el('div', 'glow', bgW, 'left:60px;top:1140px;width:960px;height:380px;background:radial-gradient(closest-side,rgba(255,110,40,.38),transparent)');

  // ---------- P : les deux voitures ----------
  const LP = el('div', 'L', stage);
  const CC = window.CARS_CONTOUR;
  function carBox(img, key, w) {
    const h = w * img.height / img.width, b = el('div', 'abs', LP, `width:${w}px;height:${h}px;transform-origin:50% 100%`);
    el('div', 'abs', b, `left:40px;top:${h - 44}px;width:${w - 80}px;height:90px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.85),transparent)`);
    const refl = el('img', 'abs', b, `left:0;top:${h - 6}px;width:${w}px;transform:scaleY(-1);transform-origin:50% 0;opacity:.15;filter:blur(3px);-webkit-mask-image:linear-gradient(to top,#000,transparent 40%)`); refl.src = img.src;
    const im = el('img', 'abs', b, `left:0;top:0;width:${w}px`); im.src = img.src;
    const c = CC[key], csv = sv('svg', { width: w, height: h, viewBox: `0 0 ${c.w} ${c.h}`, style: 'position:absolute;left:0;top:0;overflow:visible' }, b); defs(csv, key[0]);
    const g = sv('path', { d: c.d, fill: 'none', stroke: '#ff7a3a', 'stroke-width': 14 * c.w / w, 'stroke-linejoin': 'round', filter: `url(#soft${key[0]})`, 'stroke-dasharray': `${c.len} ${c.len}` }, csv);
    const l = sv('path', { d: c.d, fill: 'none', stroke: '#ffe2cf', 'stroke-width': 3.4 * c.w / w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': `${c.len} ${c.len}` }, csv);
    return { b, im, w, h, csv, g, l, len: c.len, k: c.w / w };
  }
  // 207 derrière (à droite), Twingo devant (à gauche) ; au jour 8, la 207 seule vient au centre et grandit
  const PG = carBox(pgI, 'p207-a', 820), TW = carBox(twI, 'twingo-a', 520);
  const BOX = { tw: { x: 80, y: 1150, s: 1 }, pg: { x: 395, y: 1080, s: 540 / 820 }, pgC: { x: 140, y: 1112, s: 800 / 820 } };   // tout reste entre x = 60 et 940
  // poussière sur la 207 (la photo elle-même sert de masque) et bâtons du voisin sur ses vitres
  // la poussière se dépose surtout en haut (toit, capot, vitres) : masque = la photo × un dégradé vertical
  const dust = el('div', 'dust', PG.b, `width:${PG.w}px;height:${PG.h}px;-webkit-mask-image:url(${pgI.src}),linear-gradient(#000 0%,rgba(0,0,0,.75) 45%,rgba(0,0,0,.2) 75%,transparent 92%);-webkit-mask-composite:source-in;-webkit-mask-size:100% 100%,100% 100%`);
  PG.b.appendChild(PG.csv);
  const tsv = sv('svg', { width: PG.w, height: PG.h, viewBox: `0 0 ${CC['p207-a'].w} ${CC['p207-a'].h}`, style: 'position:absolute;left:0;top:0;overflow:visible' }, PG.b); defs(tsv, 't');
  function tally(svg, n, groups, h, sp, sw, glowW) {
    const marks = [];
    for (let k = 0; k < n; k++) {
      const [gx, gy] = groups[Math.floor(k / 5)], i = k % 5, j = noise(40 + k, 0.5) * 3;
      const d = i < 4 ? `M${gx + i * sp + j} ${gy + 2 * j} L${gx + i * sp - j * 0.6 + h * 0.06} ${gy + h}` : `M${gx - sp * 0.5} ${gy + h * 0.78} L${gx + 3 * sp + sp * 0.5} ${gy + h * 0.2}`;
      const L = i < 4 ? h * 1.05 : Math.hypot(4 * sp, h * 0.58) + 4;
      const gl = sv('path', { d, stroke: '#ff8a4c', 'stroke-width': glowW, fill: 'none', 'stroke-linecap': 'round', filter: `url(#soft${svg === tsv ? 't' : 'a'})`, opacity: 0.6, 'stroke-dasharray': `${L} ${L}`, 'stroke-dashoffset': L }, svg);
      const ln = sv('path', { d, stroke: '#ffe8d8', 'stroke-width': sw, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': `${L} ${L}`, 'stroke-dashoffset': L }, svg);
      marks.push({ gl, ln, L });
    }
    return marks;
  }
  const drawMark = (m, p, k = 1) => { for (const e of [m.gl, m.ln]) { e.setAttribute('stroke-dashoffset', f3(m.L * (1 - p))); e.setAttribute('opacity', f3((e === m.gl ? 0.6 : 1) * sm(0, 0.05, p) * k)); } };
  // vitres latérales de la 207 (repère de la photo détourée, 1705 × 729) : deux rangées de quatre paquets de cinq
  const PGT = tally(tsv, 40, [[640, 96], [780, 96], [1010, 96], [1150, 96], [640, 176], [780, 176], [1010, 176], [1150, 176]], 62, 20, 8, 20);
  const tMark = PGT.map((_, k) => tOfDay(1 + (k + 1) * 39 / 40));
  // un point de lumière par voiture : chaque débit en double allume les deux
  const pinTW = el('div', 'pin', TW.b, `left:${TW.w * 0.24}px;top:${TW.h * 0.42}px`), pinPG = el('div', 'pin', PG.b, `left:${PG.w * 0.12}px;top:${PG.h * 0.33}px`);
  // ouverture : « +1 000 € » sur chaque voiture (« mille… chacune »), puis les deux montent se fondre dans « = 2 000 € »
  T.tag = [M('mille') - 0.06, M('chacune') - 0.04]; T.tagUp = T.w2 - 0.12;
  const TAGS = [[366, 1080], [665, 1008]].map(([x, y]) => {
    const d = el('div', 'glass pill', LP, 'left:0;top:0;font:700 54px Clash;color:#ffb38a;padding:10px 26px'); d.innerHTML = TH('+1 000 €');
    return { d, x, y };
  });
  // l'annonce de la 207 pendant l'attente : 4 000 → 3 800 → 3 700
  const annP = el('div', 'glass pill', LP, 'left:0;top:0;font:700 40px Clash;padding:12px 26px');
  el('span', '', annP, 'color:rgba(246,239,231,.75);font:500 30px Satoshi').textContent = 'Annonce · ';
  const annV = el('span', '', annP, 'display:inline-block;position:relative;width:196px;height:46px;vertical-align:-6px;overflow:hidden');
  const PRICES = ['4 000 €', '3 800 €', '3 700 €'];
  const annS = PRICES.map((p) => { const s = el('span', '', annV, 'position:absolute;left:0;top:0;white-space:nowrap'); s.innerHTML = TH(p); return s; });
  const annStk = sv('svg', { width: 160, height: 40, viewBox: '0 0 160 40', style: 'position:absolute;left:0;top:4px;overflow:visible' }, annV);
  const stP = sv('path', { d: 'M2 24 C 50 10, 100 30, 156 12', stroke: '#ff5a1f', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': '180 180', 'stroke-dashoffset': 180 }, annStk);

  // ---------- H : compteur « MARGE » et mention ----------
  const LH = el('div', 'L', stage);
  const C = counter(LH, { top: 352, label: 'MARGE', labelTop: 302 });     // sous la bande du haut, caméra comprise
  const mention = el('div', 'abs', LH, 'left:0;width:1080px;top:546px;text-align:center;font:500 26px Satoshi;color:rgba(246,239,231,.55)'); mention.textContent = 'Exemple · prix moyens constatés';

  // ---------- J : les jours (palettes « JOUR n ») ----------
  const LJ = el('div', 'L', stage);
  const JT = ['J', 'O', 'U', 'R', '1', '0'].map((c) => {
    const d = el('div', 'flapT glass', LJ, 'left:0;top:612px;width:86px;height:116px;font-size:80px;border-radius:13px');
    el('div', 'sheen', d); const s = el('span', '', d); s.textContent = c; el('i', '', d); return { d, s };
  });

  // ---------- N : les débits ----------
  const LN = el('div', 'L', stage);
  // [vidéo, titre, montant, ×2, voitures touchées] ; les montants : docs/timeline-mo10.md
  const DEB = [['signe', 'Cartes grises', 338, 1, 'tp'], ['ct', 'Contrôles techniques', 156, 1, 'tp'], ['assur', 'Assurances', 80, 1, 'tp'],
    ['moteur', 'Vidanges', 220, 1, 'tp'], ['pneu', '2 pneus', 160, 0, 't'], ['moteur2', 'Plaquettes avant', 140, 0, 'p'],
    ['ct2', 'Contre-visite', 25, 0, 'p'], ['eponge', 'Nettoyage', 40, 1, 'tp']].map((d, i) => [T.deb[i], ...d]);
  // l'attente : les débits de la 207 au jour où ils tombent ; les deux baisses de prix ; le gag arrive seul
  const WAIT = [[12, 'phone', 'Annonce remontée', 32], [15, 'capot', 'Batterie à plat', 110], [19, 'essence', 'Essence · visites', 40],
    [26, 'garee', 'Amende', 35, 'Stationnement abusif · jour 26'], [31, 'assur', 'Assurance · 2e mois', 40], [34, 'phone', 'Annonce remontée', 32], [37, 'phone', 'Annonce remontée', 32]]
    .map(([d, s, ti, a, app]) => ({ t: tOfDay(d), d, s, ti, a, app: app || `Compte courant · jour ${d}`, gag: d === 26 }));
  const DROPS = [[tOfDay(18), 200], [tOfDay(30), 100]];
  const mk = (title, amt, opts, stampTxt, stampX = 520, stampY = 62, fs = 34) => {
    const w = el('div', 'abs', LN, 'width:780px;height:184px');
    const n = fixAm(notif(w, title, amt, opts)); n.d.style.left = '0'; n.d.style.top = '0';
    const st = stampTxt ? el('div', 'stamp', w, `left:${stampX}px;top:${stampY}px;font-size:${fs}px`) : null; if (st) st.textContent = stampTxt;
    return { w, n, st };
  };
  const debs = DEB.map(([, s, ti, a, x2]) => ({ ...mk(ti, `${a},00`, { app: 'Compte courant · jour 1' }, x2 ? '× 2' : null, 600), s }));
  const waits = WAIT.map((x) => ({ ...mk(x.ti, `${x.a},00`, { app: x.app }, x.gag ? 'le voisin a compté' : null, 500, 100, 26), s: x.s, x }));
  const sold = mk('Virement reçu', '4 000,00', { sign: '+', app: 'Compte courant · jour 8' }, 'vendue ✓', 500, 30);

  // ---------- R : la vente de la 207 ----------
  const LR = el('div', 'L', stage);
  const bubble = el('div', 'glass', LR, 'left:150px;top:640px;width:780px;padding:30px 36px;border-radius:40px 40px 40px 12px'); el('div', 'sheen', bubble);
  el('div', '', bubble, 'font:500 24px Satoshi;color:rgba(246,239,231,.7);margin-bottom:10px').textContent = 'Acheteur · message · jour 40';
  el('div', '', bubble, 'font:700 46px Satoshi;line-height:1.2').innerHTML = '3 600 € et je la prends <span style="font-family:Fraunces;font-style:italic;font-weight:500;color:#ff8a4c">ce soir.</span>';
  const reply = el('div', 'glass msg', LR, 'right:150px;top:884px;border-radius:34px 34px 10px 34px;background:linear-gradient(140deg,rgba(255,120,50,.42),rgba(255,90,31,.16));font-size:42px');
  reply.textContent = "D'accord.";
  const credit = fixAm(notif(LR, 'Virement reçu', '3 600,00', { sign: '+', app: 'Compte courant · jour 40' }));

  // ---------- 9 : 120 € ----------
  const L9 = el('div', 'L', stage);
  const glow9 = el('div', 'glow', L9, 'left:160px;top:480px;width:760px;height:600px;background:radial-gradient(closest-side,rgba(255,100,40,.55),transparent)');
  const lab9 = el('div', 'abs', L9, 'left:0;width:1080px;top:500px;text-align:center;font:700 30px Satoshi;letter-spacing:.3em;color:#a59a90'); lab9.textContent = 'BÉNÉFICE · LES DEUX';
  const big9 = el('div', 'abs', L9, 'left:0;width:1080px;top:560px;text-align:center;font:700 300px Clash;line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:#f6efe7;text-shadow:0 1px 0 #d8cfc6,0 2px 0 #bfb5ab,0 3px 0 #a79c92,0 4px 0 #8f8479,0 5px 0 #786d63,0 6px 0 #61574e,0 16px 30px rgba(0,0,0,.6)');
  big9.innerHTML = '120<span style="font-size:160px;margin-left:10px">€</span>';
  const svg9 = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, L9); defs(svg9, '9');
  const pk1 = word(svg9, "Moins qu'avec", 'italic 500 104px Fraunces', 104, 540, 1000, { italic: true, fill: 'url(#qg9)', strokeColor: '#ffb38a', sw: 1.8 });
  const pk2 = word(svg9, 'une seule.', 'italic 500 104px Fraunces', 104, 540, 1108, { italic: true, fill: 'url(#qg9)', strokeColor: '#ffb38a', sw: 1.8 });
  const dim = el('div', 'L', stage, 'background:rgba(8,7,10,.78);pointer-events:none');
  stage.insertBefore(dim, L9);

  // ---------- A : le calcul (image 0 déjà composée), les bâtons du voisin ----------
  const LA = el('div', 'L', stage);
  el('div', 'abs', LA, 'left:-200px;top:120px;width:1480px;height:1000px;background:radial-gradient(48% 46% at 50% 45%,rgba(8,7,10,.86),rgba(8,7,10,.55) 60%,transparent)');
  const glowA = el('div', 'glow', LA, 'left:170px;top:300px;width:740px;height:560px;background:radial-gradient(closest-side,rgba(255,100,40,.5),transparent)');
  const svgA = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LA);
  defs(svgA, 'a');
  const sheen = sv('linearGradient', { id: 'sheenA', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 1080, y2: 0 }, svgA.firstChild);
  const shS = [0, 0, 0, 0].map(() => sv('stop', { 'stop-color': '#fff' }, sheen));
  // « 2 × 1 000 € » puis « = 2 000 € ? », chacun centré sur x = 540 et ramené à 700 px de large au plus (caméra comprise, rien au-delà de x = 940)
  const gW1 = sv('g', {}, svgA), gW2 = sv('g', {}, svgA);
  const W1 = word(gW1, '2 × 1  000 €', '700 150px Clash', 150, 0, 520, { align: 'left' });   // deux espaces : l'espace des milliers se voit
  const W2 = word(gW2, '= 2  000 €', '700 150px Clash', 150, 0, 700, { align: 'left' });
  const WQ = word(gW2, '?', 'italic 500 150px Fraunces', 150, W2.width + 34, 700, { italic: true, align: 'left', fill: 'url(#qga)', strokeColor: '#ffb38a', sw: 2 });
  const shine = (() => { const gS = sv('g', {}, gW1); for (const g of W1.items) { const s = sv('text', { x: g.left, y: g.base, 'font-family': 'Clash', 'font-weight': 700, 'font-size': 150, fill: 'url(#sheenA)' }, gS); s.textContent = g.ch; } return gS; })();
  const fitW = (g, w, base) => { const k = Math.min(1, 700 / w); g.setAttribute('transform', `translate(${f3(540 - w * k / 2)},${f3(base * (1 - k))}) scale(${f3(k)})`); };
  fitW(gW1, W1.width, 520); fitW(gW2, W2.width + 34 + WQ.width, 700);
  const HT = tally(svgA, 15, [[372, 800], [522, 800], [672, 800]], 92, 26, 7, 20);
  const tTal = HT.map((_, k) => T.tally + 1.5 * Math.pow(k / 15, 0.72));
  const cap = el('div', 'abs', LA, 'left:0;width:1080px;top:926px;text-align:center;white-space:nowrap;font:500 48px Satoshi');
  const cap1 = el('span', '', cap, 'display:inline-block'); cap1.textContent = 'Ton voisin';
  const cap2 = el('span', 'serif', cap, 'display:inline-block;font-size:66px;margin-left:12px'); cap2.textContent = 'compte les jours.';

  // ---------- D : ceux qui gagnent comptent en jours ----------
  const LD = el('div', 'L', stage);
  const dCv = el('canvas', 'abs', LD, 'left:-400px;top:-400px;width:1880px;height:2720px;filter:blur(22px) brightness(.26) saturate(.7) sepia(.5)'); dCv.width = 400; dCv.height = 300;
  el('div', 'abs', LD, 'left:-400px;top:-400px;width:1880px;height:2720px;background:radial-gradient(42% 38% at 50% 46%,rgba(70,30,10,.35),rgba(8,7,10,.92) 70%,#08070a)');
  el('div', 'glow', LD, 'left:160px;top:520px;width:760px;height:700px;background:radial-gradient(closest-side,rgba(255,120,50,.32),transparent)');
  const dT = el('div', 'abs', LD, 'left:0;width:1080px;top:240px;text-align:center;white-space:nowrap;font:700 64px Satoshi;line-height:1.1');
  const dT1 = el('div', '', dT); dT1.textContent = 'Ceux qui gagnent';
  const dT2 = el('div', 'serif', dT, 'font-size:90px;display:inline-block;margin-top:2px'); dT2.textContent = 'comptent en jours.';
  const vcard = el('div', 'glass vcard', LD, 'top:500px'); el('div', 'sheen', vcard);
  el('div', '', vcard, 'font:700 26px Satoshi;letter-spacing:.3em;color:#a59a90;text-align:center;margin-bottom:6px').textContent = 'MARGE ÷ JOURS';
  function vrow(title, sub, digits) {
    const r = el('div', 'vrow', vcard); const a = el('div', '', r);
    el('div', 't', a).textContent = title; el('div', 's', a).textContent = sub;
    const o = el('div', 'odo', r); const cols = [];
    for (let i = 0; i < digits; i++) {
      const w = el('div', 'win', o); const c = el('div', 'col', w);
      for (let k = 0; k <= 9; k++) { const s = el('span', '', c); s.textContent = k; }
      cols.push({ w, c });
    }
    const u = el('span', 'u', o); u.textContent = '€'; const pj = el('span', 'pj', o); pj.textContent = '/ jour';
    return { r, o, cols, u, pj };
  }
  const R1 = vrow('Ta première', '440 € ÷ 8 jours', 2);
  el('div', '', vcard, 'height:2px;margin:4px 0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)');
  const R2 = vrow('Les deux ensemble', '120 € ÷ 40 jours', 1);
  // chaque chiffre roule de 0 à sa valeur (comme le compteur MARGE), les dizaines un peu avant les unités ;
  // la position finale tombe exactement sur le chiffre (min(1, p / 0.99))
  const paintOdo = (R, target, t, t0) => {
    const ds = String(target).padStart(R.cols.length, '0').split('').map(Number);
    R.cols.forEach((c, i) => {
      const p = S(t, t0 + 0.12 * i, { f: 1.1, z: 1 }), q = p >= 0.99 ? 1 : p / 0.99, pos = ds[i] * q;
      c.c.style.transform = `translateY(${f3(-pos * 170)}px)`;
      c.w.style.filter = p > 0.02 && p < 0.97 ? `blur(${f3(4 * Math.sin(Math.PI * p))}px)` : '';
    });
    R.o.style.opacity = f3(sm(t0 - 0.06, t0 + 0.06, t));          // rien avant le roulement
  };
  const verd = el('div', 'abs', LD, 'left:0;width:1080px;top:1170px;text-align:center;white-space:nowrap');
  const vd1 = el('div', '', verd, 'font:700 46px Satoshi'); vd1.textContent = "La deuxième, tu l'achètes";
  const vd2 = el('div', 'serif', verd, 'font-size:96px;display:inline-block;margin-top:4px'); vd2.textContent = 'au jour 8.';
  const dM = el('div', 'abs', LD, 'left:0;width:1080px;top:1404px;text-align:center;font:500 26px Satoshi;color:rgba(246,239,231,.55)'); dM.textContent = 'Exemple · prix moyens constatés';

  const rewFx = el('div', 'L', stage, 'background:repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 2px,transparent 2px 6px);mix-blend-mode:screen');
  const flash = el('div', 'L', stage, 'background:radial-gradient(60% 45% at 50% 50%,#fff1e6,rgba(255,140,80,.6) 45%,transparent 75%);mix-blend-mode:screen');
  el('div', '', stage).id = 'grain'; el('div', '', stage).id = 'vign';

  // ---------- la marge, temps du récit ----------
  const VALS = [2000], TIMES = [0];
  let v = 2000;
  DEB.forEach(([t, , , a]) => { v -= a; VALS.push(v); TIMES.push(t + 0.25); });
  const EVW = [...WAIT.map((x) => [x.t, x.a]), ...DROPS].sort((a, b) => a[0] - b[0]);
  EVW.forEach(([t, a]) => { v -= a; VALS.push(v); TIMES.push(t + 0.2); });
  v -= 100; VALS.push(v); TIMES.push(T.roll);                  // l'offre : 3 600 au lieu de 3 700 → 120 €
  const keys = rollKeys(VALS, TIMES);
  const tBelow1000 = TIMES[VALS.findIndex((x) => x < 1000)];

  // ---------- la frame t ----------
  function paint(t) {
    const st = story(t);
    const tA = t >= LOOP ? 0 : t;
    const out = t >= LOOP ? 0 : S(t, T.out, P.heavy);
    const showA = t < LOOP ? 1 - sm(T.out, T.out + 0.45, t) : sm(LOOP + 0.12, LOOP + 0.75, t);
    const cA = camA(tA), cW = camW(t);
    if (t >= LOOP) { const u = sm(LOOP, DUR, t); cA.z += 90 * (1 - u); cA.ry += -5 * (1 - u); cA.y += -40 * (1 - u); }
    const day = dayAt(st);
    const waitK = sm(T.d2 - 0.2, T.d2 + 0.6, st) * (1 - sm(T.big - 0.2, T.big + 0.3, st));     // l'attente (nuit)

    // fonds : la nuit tombe pendant que la 207 attend ; le calendrier qu'on raye passe derrière, flou
    const pOut = sm(REW[1] - 0.25, REW[1] + 0.2, t) * (t < LOOP ? 1 : 1 - sm(LOOP, LOOP + 0.6, t));
    set(bgW, 1 - pOut);
    set(night, waitK * 0.85); set(nightCv, waitK * 0.9);
    if (waitK > 0.01) drawSeq(nightCv, IMG.jours, st - T.d2);
    floor.style.transform = `perspective(900px) rotateX(72deg) translateX(${f3(-cW.x * 0.6)}px)`;
    set(glowCar, (0.55 + 0.35 * sm(T.out, T.out + 0.6, st)) * (1 - 0.5 * waitK));

    // P : les voitures
    LP.style.transform = tf(cW, 0);
    const big0 = sm(T.big, T.big + 0.35, st) * (1 - sm(REW[0] - 0.05, REW[0] + 0.2, t));
    set(LP, (1 - pOut) * (1 - 0.85 * big0) * (t < LOOP ? 1 : sm(LOOP + 0.05, LOOP + 0.6, t)));
    // « +1 000 € » : chaque voiture reçoit sa marge, puis les deux montent vers le total
    const up = S(tA, T.tagUp, P.push);
    TAGS.forEach((g, i) => {
      const a = S(tA, T.tag[i], P.tag), w = 270;
      g.d.style.transform = `translate(${f3(lerp(g.x - w / 2, 540 - w / 2, up))}px,${f3(lerp(g.y + (1 - a) * 30, 600, up))}px) scale(${f3((0.85 + 0.15 * a) * (1 - 0.45 * up))})`;
      set(g.d, sm(T.tag[i] - 0.02, T.tag[i] + 0.06, tA) * (1 - sm(0.55, 0.85, up)) * (t < LOOP || tA === 0 ? 1 : 0));
    });
    // Twingo : part vers la gauche au jour 8 (accélère), revient au rembobinage
    const go = clamp((st - T.leave) / 0.95, 0, 1), twX = -1350 * go * go * go;
    TW.b.style.transform = `translate(${f3(BOX.tw.x + twX)}px,${BOX.tw.y}px)`;
    TW.b.style.filter = go > 0.02 && go < 0.98 ? `blur(${f3(6 * Math.sin(Math.PI * go))}px)` : '';
    set(TW.b, 1 - sm(0.92, 1, go));
    // 207 : derrière à droite, puis seule au centre
    const c207 = S(st, T.wait0, { f: 0.7, z: 1 });
    const px = lerp(BOX.pg.x, BOX.pgC.x, c207), py = lerp(BOX.pg.y, BOX.pgC.y, c207), ps = lerp(BOX.pg.s, BOX.pgC.s, c207);
    PG.b.style.transform = `translate(${f3(px)}px,${f3(py - PG.h * (1 - ps))}px) scale(${f3(ps)})`;
    PG.b.style.transformOrigin = '0 100%';
    const dimP = (1 - c207) * 0.18;
    PG.im.style.filter = `brightness(${f3(0.9 - dimP - 0.25 * waitK)}) saturate(${f3(1 - 0.45 * waitK)})`;
    TW.im.style.filter = `brightness(${f3(0.92)})`;
    // contours : déjà tracés à l'image 0, ils s'éteignent quand le monde s'allume
    const cK = 0.95 - 0.55 * sm(T.out, T.out + 0.8, st);
    for (const C_ of [TW, PG]) { C_.l.setAttribute('stroke-dashoffset', '0'); C_.g.setAttribute('stroke-dashoffset', '0'); C_.l.setAttribute('opacity', f3(cK)); C_.g.setAttribute('opacity', f3(cK * 0.8)); }
    // poussière et bâtons du voisin (un par jour)
    set(dust, 0.8 * sm(T.d2, T.d3, st));
    PGT.forEach((m, k) => drawMark(m, S(st, tMark[k], P.draw), 1));
    // points : chaque débit allume la voiture qu'il touche
    const pinK = (who) => Math.max(0, ...DEB.filter((d) => d[5].includes(who)).map(([tt]) => sm(tt + 0.18, tt + 0.24, st) * (1 - sm(tt + 0.5, tt + 0.75, st))));
    const pT = pinK('t'), pP = pinK('p');
    set(pinTW, pT); pinTW.style.transform = `scale(${f3(1 + 1.2 * (1 - pT))})`;
    set(pinPG, pP); pinPG.style.transform = `scale(${f3(1 + 1.2 * (1 - pP))})`;
    // annonce de la 207 et ses deux baisses
    const aIn = S(st, T.d2 + 0.3, P.rise);
    const aX = px + 820 * ps / 2 - 205, aY = py - 96;
    annP.style.transform = `translate(${f3(aX)}px,${f3(aY + (1 - aIn) * 24)}px)`;
    set(annP, sm(T.d2 + 0.28, T.d2 + 0.36, st) * (1 - sm(T.bubble - 0.1, T.bubble + 0.15, st)));
    const dr = DROPS.map(([tt]) => S(st, tt + 0.22, P.rise));
    annS.forEach((s, i) => {
      const inP = i === 0 ? 1 : dr[i - 1], outP = i < 2 ? dr[i] : 0;
      s.style.transform = `translateY(${f3((1 - inP) * 46 - outP * 46)}px)`; s.style.opacity = f3(inP * (1 - outP));
    });
    const sk = DROPS.map(([tt]) => S(st, tt - 0.05, P.pen) * (1 - sm(tt + 0.2, tt + 0.26, st))).reduce((a, b) => Math.max(a, b), 0);
    stP.setAttribute('stroke-dashoffset', f3(180 * (1 - sk)));

    // H : compteur et mention
    const hud = sm(T.hud - 0.05, T.hud + 0.05, st) * (1 - big0) * (1 - pOut) * (t < LOOP ? 1 : 0);
    LH.style.transform = tf(cW, 60);                                          // près du plan : le compteur ne monte pas dans la bande du haut
    set(LH, hud);
    const vis0 = 1 - S(st, tBelow1000 + 0.05, P.heavy);
    paintCounter(C, st, keys, [vis0, 1, 1, 1], (i) => ({ draw: S(st, T.hud + i * 0.07, P.draw), glass: S(st, T.hud + 0.22 + i * 0.07, P.heavy) }), 1);
    C.labL.forEach((s, i) => { const p = S(st, T.hud + 0.2 + i * 0.045, P.rise); s.style.opacity = f3(p); s.style.transform = `translateY(${f3((1 - p) * 18)}px)`; });
    set(mention, sm(T.hud + 0.2, T.hud + 0.6, st) * (1 - sm(T.big - 0.15, T.big + 0.05, st)) * (t < REW[0] ? 1 : 0));

    // J : JOUR n, une palette par chiffre ; le groupe se recentre quand le nombre passe à deux chiffres
    LJ.style.transform = tf(cW, 140);
    set(LJ, sm(T.j1 - 0.05, T.j1 + 0.05, st) * (1 - sm(T.bubble - 0.1, T.bubble + 0.2, st)) * (t < REW[0] ? 1 : 0));
    const di = Math.floor(day + 1e-6), fr = day - di, two = sm(9.5, 10.2, day);
    const counting = (st > T.d0 && st < T.d1) || (st > T.d2 && st < T.d3);
    const tot = 4 * 86 + 3 * 8 + 26 + 86 + two * (86 + 8), x0 = 540 - tot / 2;
    const dig = [String(di).slice(-1), String(Math.floor(di / 10))];
    JT.forEach((j, i) => {
      const x = i < 4 ? x0 + i * 94 : i === 4 ? x0 + 4 * 94 + 26 + two * 94 : x0 + 4 * 94 + 26;
      let rot = 0, o = 1;
      if (i < 4) { const p = S(st, T.j1 + i * 0.06, P.flip); rot = (1 - p) * 92; o = sm(0, 0.12, p); }
      else if (i === 4) { j.s.textContent = dig[0]; const p = S(st, T.j1 + 0.3, P.flip); rot = (1 - p) * 92 + (counting ? (1 - Math.min(1, fr * 3)) * 70 : 0); o = sm(0, 0.12, p); }
      else { j.s.textContent = dig[1]; o = two; rot = (1 - two) * 80; }
      j.d.style.transform = `translateX(${f3(x)}px) perspective(700px) rotateX(${f3(rot)}deg)`; j.d.style.opacity = f3(o);
    });

    // N : les débits du jour 1 (en double), la vente de la Twingo, puis ceux de l'attente
    LN.style.transform = tf(cW, 60);
    const tl = T.deb[7] + 0.35, leave = S(st, tl, P.push);
    debs.forEach((d, i) => {
      const T0 = DEB[i][0], a = S(st, T0, P.card);
      let k = 0; for (let j = i + 1; j < DEB.length; j++) k += S(st, DEB[j][0], P.card);
      const o = sm(T0 - 0.06, T0, st) * clamp(1 - 0.45 * k, 0, 1) * (1 - sm(tl + 0.05, tl + 0.3, st));
      d.w.style.transform = `translate(${f3(150 + 1150 * (1 - a))}px,${f3(800 - 44 * k - 900 * leave)}px) scale(${f3(1 - 0.07 * k)})`;
      d.w.style.transformOrigin = '50% 0';
      d.w.style.filter = k > 0.05 ? `blur(${f3(1.6 * k)}px)` : '';
      set(d.w, o);
      if (o > 0.01) drawSeq(d.n.c, IMG[d.s], Math.max(0, st - T0));
      if (d.st) { const ss = S(st, T0 + 0.22, P.stamp); set(d.st, sm(T0 + 0.2, T0 + 0.26, st)); d.st.style.transform = `rotate(-8deg) scale(${f3(lerp(1.8, 1, ss))})`; }
    });
    { const a = S(st, T.sold, P.card), lv = S(st, T.wait0 + 0.15, P.push), o = sm(T.sold - 0.04, T.sold + 0.02, st) * (1 - sm(T.wait0 + 0.35, T.wait0 + 0.55, st));
      sold.w.style.transform = `translate(${f3(150 + 1150 * (1 - a) - 1300 * lv)}px,800px)`; set(sold.w, o);   // elle part à gauche, comme la Twingo
      if (o > 0.01) drawSeq(sold.n.c, IMG.cles, st - T.sold);
      const ss = S(st, T.sold + 0.25, P.stamp); set(sold.st, sm(T.sold + 0.23, T.sold + 0.29, st)); sold.st.style.transform = `rotate(-8deg) scale(${f3(lerp(1.8, 1, ss))})`; }
    waits.forEach((d, i) => {
      const T0 = d.x.t, a = S(st, T0, P.card), nx = i + 1 < waits.length ? waits[i + 1].x.t : T.bubble;
      const gone = S(st, nx, P.push);                    // chaque débit cède la place au suivant en tombant
      const o = sm(T0 - 0.05, T0, st) * (1 - sm(nx + 0.05, nx + 0.25, st));
      const rot = d.x.gag ? -3 : 0, sc = d.x.gag ? 0.92 : 0.86;
      d.w.style.transform = `translate(${f3(150 + 1150 * (1 - a) - 1100 * gone)}px,820px) rotate(${rot}deg) scale(${f3(sc - 0.08 * gone)})`;
      d.w.style.transformOrigin = '50% 50%';
      set(d.w, o * (1 - 0.6 * gone));
      if (o > 0.01) drawSeq(d.n.c, IMG[d.s], Math.max(0, st - T0));
      if (d.st) { const ss = S(st, T0 + 0.3, P.stamp); set(d.st, sm(T0 + 0.28, T0 + 0.34, st)); d.st.style.transform = `rotate(-8deg) scale(${f3(lerp(1.8, 1, ss))})`; }
    });

    // R : la vente de la 207
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

    // 9 : 120 €
    set(dim, big0 * 0.9);
    L9.style.transform = tf(cW, 160, `scale(${f3(1 + 0.05 * sm(T.big + 0.3, REW[0], st))})`);
    set(L9, big0);
    const s9 = S(st, T.big + 0.05, { f: 1.4, z: 0.85 });
    big9.style.transform = `scale(${f3(0.86 + 0.14 * s9)})`; set(glow9, 0.4 + 0.6 * S(st, T.big + 0.15, P.heavy));
    writeWord(pk1, st, T.pk1, 0.035); writeWord(pk2, st, T.pk1 + 0.42, 0.035);

    // A : le calcul et les bâtons du voisin
    LA.style.transform = tf(cA, 0, `translateY(${f3(-300 * out)}px)`);
    set(LA, showA);
    fullWord(W1); writeWord(W2, tA, T.w2, 0.055, 28); writeWord(WQ, tA, T.q, 0.05, 28);
    // la lumière passe sur « 2 × » quand la voix dit « deux », puis sur « 1 000 € »
    const sx = tA < T.sh2 - 0.05 ? lerp(-300, 640, S(tA, T.sh1, { f: 0.9, z: 1 })) : lerp(380, 1500, S(tA, T.sh2, { f: 0.8, z: 1 }));
    shS[0].setAttribute('offset', f3(clamp((sx - 260) / 1080, 0, 1))); shS[0].setAttribute('stop-opacity', '0');
    shS[1].setAttribute('offset', f3(clamp((sx - 60) / 1080, 0, 1))); shS[1].setAttribute('stop-opacity', '.85');
    shS[2].setAttribute('offset', f3(clamp((sx + 60) / 1080, 0, 1))); shS[2].setAttribute('stop-opacity', '.85');
    shS[3].setAttribute('offset', f3(clamp((sx + 260) / 1080, 0, 1))); shS[3].setAttribute('stop-opacity', '0');
    shine.setAttribute('opacity', f3(0.55 * sm(T.sh1 - 0.05, T.sh1 + 0.05, tA) * (1 - sm(T.sh2 + 0.9, T.sh2 + 1.2, tA))));
    if (t >= LOOP) {                                                             // « tu te dis… » : la lumière repasse sur le calcul
      const tl2 = M('prochaine') + 0.2, sx2 = lerp(-300, 1500, S(t, tl2, { f: 0.55, z: 1 }));
      shS[0].setAttribute('offset', f3(clamp((sx2 - 260) / 1080, 0, 1))); shS[1].setAttribute('offset', f3(clamp((sx2 - 60) / 1080, 0, 1)));
      shS[2].setAttribute('offset', f3(clamp((sx2 + 60) / 1080, 0, 1))); shS[3].setAttribute('offset', f3(clamp((sx2 + 260) / 1080, 0, 1)));
      shine.setAttribute('opacity', f3(0.5 * sm(tl2 - 0.05, tl2 + 0.1, t) * (1 - sm(DUR - 0.5, DUR - 0.08, t))));
    }
    set(glowA, 0.35 + 0.35 * S(tA, T.w2, P.heavy) * (1 - out));
    HT.forEach((m, k) => drawMark(m, S(tA, tTal[k], P.draw)));
    const c1 = S(tA, T.cap, P.rise), c2 = S(tA, T.cap + 0.28, P.rise);
    cap1.style.opacity = f3(c1); cap1.style.transform = `translateY(${f3((1 - c1) * 24)}px)`; cap1.style.filter = `blur(${f3((1 - c1) * 8)}px)`;
    cap2.style.opacity = f3(c2); cap2.style.transform = `translateY(${f3((1 - c2) * 24)}px)`; cap2.style.filter = `blur(${f3((1 - c2) * 8)}px)`;

    // D : ceux qui gagnent comptent en jours
    const dIn = sm(REW[1] - 0.25, REW[1] + 0.25, t) * (t < LOOP ? 1 : 1 - sm(LOOP, LOOP + 0.6, t));
    const ldOut = t < LOOP ? 0 : S(t, LOOP - 0.05, P.push);                  // la carte part vers le haut, le calcul revient
    LD.style.transform = tf(camF(t), 0, `translateY(${f3(-900 * ldOut)}px) scale(${f3(1 + 0.12 * ldOut)})`);
    LD.style.filter = ldOut > 0.01 ? `blur(${f3(12 * ldOut)}px)` : '';
    set(LD, dIn);
    if (dIn > 0.01) drawSeq(dCv, IMG.calc, t - REW[1] + 0.25);
    const t1 = S(t, T.ceux, P.rise), t2 = S(t, T.comptent, P.rise);
    dT1.style.opacity = f3(t1); dT1.style.transform = `translateY(${f3((1 - t1) * 26)}px)`;
    dT2.style.opacity = f3(t2); dT2.style.transform = `translateY(${f3((1 - t2) * 26)}px)`;
    const tc = REW[1] + 0.02, vc = S(t, tc, P.card);                          // la carte arrive dès la fin du rembobinage
    vcard.style.transform = `perspective(1500px) translateY(${f3((1 - vc) * 220)}px) rotateX(${f3((1 - vc) * 28)}deg)`; set(vcard, sm(tc - 0.02, tc + 0.06, t));
    const rr = (R, t0) => { const p = S(t, t0, P.rise); R.r.style.opacity = f3(p); R.r.style.transform = `translateY(${f3((1 - p) * 26)}px)`; R.r.style.filter = `blur(${f3((1 - p) * 6)}px)`; };
    rr(R1, T.r1); rr(R2, T.r2);
    paintOdo(R1, 55, t, T.v1); paintOdo(R2, 3, t, T.v2);
    const v1 = S(t, T.verd, P.rise), v2 = S(t, T.verd2, P.rise);
    vd1.style.opacity = f3(v1); vd1.style.transform = `translateY(${f3((1 - v1) * 26)}px)`;
    vd2.style.opacity = f3(v2); vd2.style.transform = `translateY(${f3((1 - v2) * 26)}px) scale(${f3(0.94 + 0.06 * v2)})`;
    set(dM, S(t, T.r1, P.rise));

    // effets
    set(rewFx, sm(REW[0], REW[0] + 0.15, t) * (1 - sm(REW[1] - 0.15, REW[1], t)) * 0.9);
    rewFx.style.transform = `translateY(${f3((t * 900) % 6)}px)`;
    set(flash, 0.35 * sm(T.big + 0.05, T.big + 0.13, st) * (1 - sm(T.big + 0.13, T.big + 0.55, st)) * (t < REW[0] ? 1 : 0)
      + 0.4 * sm(T.v1 + 0.6, T.v1 + 0.68, t) * (1 - sm(T.v1 + 0.68, T.v1 + 1.1, t)) + 0.5 * sm(LOOP, LOOP + 0.2, t) * (1 - sm(LOOP + 0.2, LOOP + 0.7, t)));
  }

  // flou de bougé : obturateur ouvert sur les gestes rapides
  const WIN = [[T.leave, T.leave + 0.95, 0.8], [T.out, T.out + 0.5, 0.5], [T.wait0, T.wait0 + 0.6, 0.5], [T.big - 0.05, T.big + 0.45, 0.6], [REW[0], REW[1], 0.7]];
  [...DEB.map((d) => d[0]), ...WAIT.map((x) => x.t), T.sold, T.bubble, T.reply, T.credit, T.r1, T.verd].forEach((x) => WIN.push([x - 0.04, x + 0.35, 0.6]));
  const fast = (t) => { let s = 0; for (const [a, b, v_] of WIN) s = Math.max(s, v_ * sm(a - 0.05, a + 0.05, t) * (1 - sm(b - 0.05, b + 0.05, t))); return s; };
  window.shutter = (t) => Math.max(0.12, fast(t));
  window.samples = (t) => (fast(t) > 0.3 ? 4 : 1);
  // temps des événements, lus par scripts/audio-mo10.py pour poser les bruitages (scripts/events.mjs → film-mo10/events.json)
  window.EVENTS = { ...T, tag: T.tag, deb: DEB.map((d) => d[0]), x2: DEB.map((d) => d[4]), wait: WAIT.map((x) => x.t), gag: WAIT.find((x) => x.gag).t,
    drops: DROPS.map((d) => d[0]), marks: tMark, tally: tTal, rew: REW, loop: LOOP, dur: DUR, stTo: ST_TO };
  window.seek = (t) => paint(t >= DUR ? t - DUR : t);
  paint(0);
  window.filmReady = true;
})();
