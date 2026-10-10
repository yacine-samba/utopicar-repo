// MO12 « La pochette » (31,05 s, minutage provisoire). Contrat : window.seek(t) peint la frame t, sans état entre les frames.
// window.shutter(t) / window.samples(t) : flou de bougé au rendu (MB=4). window.EVENTS : temps des gestes, pour le son.
// Minutage lu dans audio/vo-mo12/vo-timing.json (provisoire tant que la prise n'est pas posée par scripts/vo-mo12.py) :
// chaque geste suit son mot (marks). Construit sur lib/kit47.js (lu, jamais modifié), lib/kit47-pochette.js (cartes de
// document, badge de validité, pochette) et film-mo12/clock.js (horloge à rouleaux). Variable de l'épisode (É4) :
// l'ouverture est une scène (l'acheteur, l'heure, la vente bouclée) au lieu du calcul du débutant.
(async function () {
  const { track, clamp, lerp, noise } = Motion;
  const { f3, S, sm, P, el, sv, set, defs, word, writeWord, notif, load, loadSeqs, drawSeq } = Kit47;
  const KP = Kit47Pochette, CK = Clock47;
  const stage = document.getElementById('stage');
  const eo = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return 1 - Math.pow(1 - u, 3); };
  const io = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const bump = (x, a, w) => (x > a && x < a + w ? Math.sin(Math.PI * (x - a) / w) : 0);
  // zones sûres : une carte qui glisse depuis le bord se révèle derrière un masque posé à x = 920 (ou 72 à gauche),
  // aucun texte net ne passe jamais dans les marges (left/right : bords à l'écran, sc : échelle de l'élément)
  const clipX = (e, left, right, sc = 1) => { const L = Math.max(0, 72 - left) / sc, R = Math.max(0, right - 920) / sc; const v = L || R ? `inset(-80px ${f3(R)}px -80px ${f3(L)}px)` : ''; if (e.style.clipPath !== v) e.style.clipPath = v; };

  // ---------- minutage (repères de la voix) ----------
  const VT = await (await fetch('../audio/vo-mo12/vo-timing.json')).json();
  const DUR = VT.dur, LOOP = VT.loop;                     // 31,05 s ; la boucle part à 29,45 s (scripts/vo-mo12.py)
  const M = (k) => VT.marks[k].t, ME = (k) => VT.marks[k].end;
  const T = {
    shake: M('onze'),                     // la bulle « Je suis devant. » vibre
    sonne: M('sonne') - 0.03,             // elle pulse sur « sonne »
    roll: M('vingt') - 0.04,              // 11:00 → 11:20 sur « vingt »
    stamp: M('vendue') - 0.08,            // VENDUE frappe l'étiquette sur « vendu » (2,64 s, avant la mesure à 3 s ; voix réelle)
    go: ME('vendue') + 0.05,              // la C3 garde VENDUE à l'arrêt 0,45 s, puis sort par la gauche une fois « vendu. » dit
    bf: Math.max(M('beaufrere') - 0.28, ME('vendue') + 0.43),   // bulle du beau-frère : elle entre par la droite quand la C3 a presque quitté l'image (3,48 s)
    croit: M('croit'),                    // « il n'y croit pas » : sa bulle tremble (comme le gag)
    ask: M('demande') - 0.05,             // la bulle : « Les papiers ? » (« Il demande les papiers »)
    blur: M('papiers') + 0.05,            // la caméra plonge, la C3 passe en décor flou
    poch: M('tends') - 0.15,              // la pochette monte (« tu tends la pochette »)
    rabat: M('pochette') - 0.05,          // le rabat s'ouvre
    phone: M('attends'),                  // ses mains sur son téléphone, « Virement · en cours »
    wait: ME('virement') + 0.02,          // l'attente
    decl: M('declaration') + 0.08, zero: M('zero') - 0.02, code: ME('euro') - 0.35,
    gag: M('gag') - 0.15,                 // la notification du gag se pose 0,15 s avant « Ton beau-frère »
    cles: ME('payee') + 0.12,
    roll20: M('vingt2') - 0.5, big: M('vingt2') - 0.3,
    tasse: M('tasse'), chaud: M('encore') - 0.25,   // « encore chaud. » complet et immobile 0,5 s avant le rembobinage
    mardi: M('mardi'), ctl: M('controle') - 0.04, l2: M('deuxans') - 0.05, total: M('rouler') - 0.1, l6: M('sixmois') - 0.22,
    achat: M('letien') - 0.12, vide: M('sept') - 0.05, strike: M('mois'), refait: ME('mois') + 0.1,   // « refait le 6 oct. · 78 € » juste après « sept mois : » (complet vers 28,7 s)
  };
  const R1 = [ME('retour') + 0.04, ME('retour') + 0.54];   // retour court (grammaire du rembobinage)
  T.essai = R1[1]; T.essaiOut = M('papiers') - 0.02;
  T.recu = M('declaration') - 1.4;                           // « Virement reçu » sur la mesure, 1,4 s avant « Déclaration »
  T.sig = [T.recu + 0.25, T.recu + 0.5]; T.cg = T.recu + 0.75; T.cgW = T.cg + 0.18; T.cgS = T.cg + 0.95;
  T.go2 = T.cles + 0.17;
  // la bulle pose une question par temps ; la carte qui répond sort de la pochette 0,1 s avant : son texte est plein vers
  // T.q + 0,18 s, la question à T.q + 0,16 s, et chaque paire reste ensemble jusqu'à la question suivante (T.q + 0,40 s)
  T.q = [0, 1, 2, 3].map((i) => T.rabat + 0.42 + 0.45 * i);
  T.c = T.q.map((x) => x - 0.1);
  const REW = [ME('chaud') + 0.3, M('mardi') - 0.1];        // grand rembobinage jusqu'au mardi d'avant (1,1 s)
  T.flaps = REW[1] - 0.5; T.pochM = REW[1] - 0.15;
  // cinq cartes entrent dans la pochette, une par temps (la grille de la reprise part de T.m[0] − 0,5 : audio-mo12.py) ;
  // voix réelle : la première entre sur « Mardi » (0,22 s après au lieu de 0,45) pour que la 5e soit posée vers « deux ans »
  // (pas plus serré : à 0,45 s, la note d'une carte tombe à 0,09 s du « rangée » de la précédente, que le mix retire)
  T.m = [0, 1, 2, 3, 4].map((i) => T.mardi + 0.22 + 0.5 * i);
  T.l2 = Math.max(T.l2, T.m[4] + 0.36 + 0.3);                 // la liste grandit une fois la 5e carte posée (25,06 s)
  T.eclair = M('tu') + 0.25;   // « tu le refais » : le bandeau « Contrôle · 78 € » pulse et s'allume (nom gardé pour le son)
  T.close = ME('refais') - 0.25; T.pret = ME('refais') - 0.02;

  // l'horloge : une minute par geste (scénario chiffré du brief)
  const ESS = Array.from({ length: 9 }, (_, i) => T.essai + 0.1 + i * (T.essaiOut - T.essai - 0.15) / 8);
  const VALS = [0, ...ESS.map((_, i) => i + 1), 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const TIMES = [0, ...ESS, ...T.c, T.phone, T.recu, T.cg, T.decl, T.code, T.cles, T.roll20];
  const KH = CK.rollKeysUp([0, 20], [0, T.roll]), KV = CK.rollKeysUp(VALS, TIMES);

  await Promise.all([
    document.fonts.load('700 150px Clash'), document.fonts.load('600 50px Clash'), document.fonts.load('500 24px Satoshi'),
    document.fonts.load('700 48px Satoshi'), document.fonts.load('italic 104px Fraunces'),
  ]);

  // ---------- vidéos (Mixkit, 30 i/s ; docs/timeline-mo12.md, « Les plans réels ») ----------
  const N = await (await fetch('seq.json')).json();
  const IMG = await loadSeqs('seq', { essai: N.essai, ct2: N.ct2, phone: N.phone, signe: N.signe, cles: N.cles, jours: N.jours });
  const carI = await load('../assets/photos-mo12/car-c3.png'), carF = await load('../assets/photos-mo12/car-c3-flou.png');
  const coins = await load('../film-mo5/frames/22168.jpg');
  // cadrage d'une séquence dans un canvas (cover + recentrage), lecture en aller-retour
  function drawCrop(cv, frames, tt, fx = 0.5, fy = 0.5, zoom = 1) {
    const n = frames.length; let i = Math.max(0, Math.floor(tt * 30)); const c = i % (2 * n - 2); i = c < n ? c : 2 * n - 2 - c;
    const im = frames[i], ctx = cv.getContext('2d'), r = Math.max(cv.width / im.width, cv.height / im.height) * zoom;
    const w = im.width * r, h = im.height * r; ctx.drawImage(im, clamp(cv.width / 2 - fx * w, cv.width - w, 0), clamp(cv.height / 2 - fy * h, cv.height - h, 0), w, h);
  }

  // ---------- temps du récit : la scène avance, se rembobine après la chute jusqu'au début de la visite ----------
  const ST_FROM = T.big + 0.45, ST_TO = T.essai - 0.06, RW = [REW[0], REW[0] + 0.85];
  // retour du « 20 » dans l'horloge (ressort critique ramené à 1 à 96 %) : BKL, l'instant où il se pose
  const BK0 = REW[0] - 0.06, BKF = { f: 3.4, z: 1 }; let BKL = BK0; while (S(BKL, BK0, BKF) < 0.96) BKL += 0.001;
  const story = (t) => {
    if (t >= LOOP) return ST_TO;
    if (t < RW[0]) return t;
    if (t < RW[1]) return lerp(ST_FROM, ST_TO, io((t - RW[0]) / (RW[1] - RW[0])));
    return ST_TO;
  };
  // temps de l'ouverture (le flash-forward 11:00 → 11:20) : il avance, puis le retour court le ramène à l'image 0
  const hook = (t) => (t < R1[0] ? t : t < R1[1] ? lerp(R1[0], 0, io((t - R1[0]) / (R1[1] - R1[0]))) : 0);

  // ---------- caméra : une seule prise, jamais immobile ; même pose à l'image 0 et à la dernière image ----------
  const CS = { f: 0.3, z: 1 }, CF = { f: 0.55, z: 1 }, CL = { f: 0.16, z: 1 };
  const cam0 = (t) => ({
    rx: track(t, [[0, 3], [T.blur - 0.25, 6.5, CS], [T.big - 0.25, 2.5, CF], [REW[1] - 0.3, 7, CS], [T.m[0], 4, CL]]),
    ry: track(t, [[0, -4], [0.02, 0.5, { f: 0.3, z: 1 }], [T.go, -4.5, CS], [T.bf, 1.5, CS], [R1[0] + 0.2, -1, CF], [T.blur, -3, CL], [T.phone, 2.5, CL], [T.gag, -1.5, CS], [T.big - 0.25, 0, CF], [REW[1] - 0.3, -6, CS], [T.m[1], 4, CL]]),
    z: track(t, [[0, 0], [0.02, 130, { f: 0.28, z: 1 }], [R1[0], 10, CF], [T.essai, 40, CS], [T.blur, 120, { f: 0.35, z: 1 }], [T.phone, 80, CL], [T.wait, 120, CS], [T.recu + 0.05, 75, CS], [T.big - 0.25, 0, CF], [REW[0], -90, CF], [REW[1] - 0.2, -50, CS], [T.m[0], 40, CL]]),
    x: track(t, [[0, 0], [0.02, 24, { f: 0.3, z: 1 }], [T.go, -28, CS], [T.bf, 22, CS], [R1[0], 0, CF], [T.phone, 14, CL], [T.gag, -10, CS], [T.big - 0.25, 0, CF], [T.m[1], -12, CL]]),
    y: track(t, [[0, 0], [T.blur - 0.1, 150, { f: 0.35, z: 1 }], [T.phone, 200, CL], [T.big - 0.25, 0, CF], [REW[1] - 0.2, 30, CS], [T.m[0], 70, CL]]),
  });
  const C0 = cam0(0);
  const cam = (t) => {
    const c = cam0(t), env = sm(0, 1.5, t) * (1 - sm(LOOP, DUR - 0.25, t));
    c.rx += noise(1, t * 0.4) * 0.5 * env; c.ry += noise(2, t * 0.35) * 0.7 * env; c.x += noise(3, t * 0.3) * 6 * env; c.y += noise(4, t * 0.3) * 5 * env;
    if (t >= LOOP) { const u = eo(LOOP, DUR - 0.05, t); for (const k in c) c[k] = lerp(c[k], C0[k], u); }
    return c;
  };
  const part = (c, kr, kz, kx, ky) => ({ rx: c.rx * kr, ry: c.ry * kr, z: c.z * kz, x: c.x * kx, y: c.y * ky });
  const tf = (c, extra = '') => `perspective(1700px) translateZ(${f3(c.z)}px) rotateX(${f3(c.rx)}deg) rotateY(${f3(c.ry)}deg) translate(${f3(-c.x)}px,${f3(-c.y)}px) ${extra}`;

  // ---------- fonds ----------
  const bg = el('div', 'L', stage, 'background:radial-gradient(70% 50% at 50% 56%,#1d1520,#08070a 75%)');
  const calCv = el('canvas', 'abs', bg, 'left:-220px;top:-260px;width:1520px;height:2440px'); calCv.width = 300; calCv.height = 480;
  calCv.getContext('2d').filter = 'blur(3px) brightness(.5) saturate(.6) sepia(.35)';
  const calShade = el('div', 'abs', bg, 'left:-220px;top:-260px;width:1520px;height:2440px;background:radial-gradient(48% 40% at 50% 46%,rgba(60,26,10,.25),rgba(8,7,10,.9) 72%,#08070a)');
  const warm = el('div', 'L', bg, 'background:radial-gradient(75% 52% at 50% 54%,rgba(150,64,22,.42),rgba(60,24,10,.32) 48%,transparent 82%)');   // mardi : fond chaud
  el('div', 'abs', bg, 'left:-210px;top:-320px;width:1500px;height:1500px;background:conic-gradient(from 180deg at 50% 0%,transparent 160deg,rgba(255,138,76,.10) 175deg,rgba(255,179,138,.17) 180deg,rgba(255,138,76,.10) 185deg,transparent 200deg);filter:blur(30px);mix-blend-mode:screen');
  // lumière de fin de matinée, en biais
  const sun = el('div', 'abs', bg, 'left:-420px;top:80px;width:1900px;height:1300px;background:linear-gradient(118deg,transparent 34%,rgba(255,200,150,.07) 44%,rgba(255,176,120,.14) 50%,rgba(255,200,150,.06) 56%,transparent 66%);mix-blend-mode:screen');
  const floor = el('div', 'abs', bg, 'left:-300px;top:1300px;width:1680px;height:900px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 120px),repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 2px,transparent 2px 120px);transform:perspective(900px) rotateX(72deg);transform-origin:50% 0;-webkit-mask-image:linear-gradient(transparent,#000 30%,#000 60%,transparent)');
  const glowCar = el('div', 'glow', bg, 'left:90px;top:1040px;width:900px;height:380px;background:radial-gradient(closest-side,rgba(255,110,40,.34),transparent)');

  // ---------- P : la C3 (photo du domaine public, détourée), contour de lumière, étiquette « 2 700 € » ----------
  const LP = el('div', 'L', stage);
  const CAR = { w: 800, top: 716 }; CAR.h = CAR.w * carI.height / carI.width; CAR.left = 540 - CAR.w / 2; const cs = CAR.w / carI.width;
  const carBox = el('div', 'abs', LP, `left:${CAR.left}px;top:${CAR.top}px;width:${CAR.w}px;height:${f3(CAR.h)}px;transform-origin:50% 90%`);
  el('div', 'abs', carBox, `left:${f3(40)}px;top:${f3(CAR.h - 120)}px;width:${f3(CAR.w * 0.78)}px;height:150px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.85),transparent);transform:rotate(-4deg)`);
  el('div', 'abs', carBox, `left:${f3(CAR.w * 0.55)}px;top:${f3(CAR.h * 0.6)}px;width:${f3(CAR.w * 0.45)}px;height:120px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.7),transparent);transform:rotate(-32deg)`);
  const carImg = el('img', 'abs', carBox, `left:0;top:0;width:${CAR.w}px`); carImg.src = carI.src;
  const carBl = el('img', 'abs', carBox, `left:0;top:0;width:${CAR.w}px;height:${f3(CAR.h)}px`); carBl.src = carF.src;
  const CC = window.CAR_C3_CONTOUR;
  const csv = sv('svg', { width: CAR.w, height: CAR.h, viewBox: `0 0 ${CC.w} ${CC.h}`, style: 'position:absolute;left:0;top:0;overflow:visible' }, carBox); defs(csv, 'c');
  const cGlow = sv('path', { d: CC.d, fill: 'none', stroke: '#ff7a3a', 'stroke-width': 15, 'stroke-linejoin': 'round', filter: 'url(#softc)', opacity: 0.75 }, csv);
  const cLine = sv('path', { d: CC.d, fill: 'none', stroke: '#ffe2cf', 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.9 }, csv);
  // l'étiquette de papier posée en perspective sur le pare-brise (repères de scripts/photos-mo12.py)
  const RP = window.CAR_C3_REPERES, WS = RP.pare_brise.px.map(([x, y]) => [x * cs, y * cs]);
  const ETQ = KP.sub(WS, 0.05, 0.25, 0.49, 0.79);
  const etiq = el('div', 'etiq', carBox); etiq.innerHTML = KP.clash('2 700 €'); etiq.style.transform = KP.quad(340, 160, ETQ);
  const vendue = el('div', 'stamp', etiq); vendue.textContent = 'VENDUE';
  const glintW = el('div', 'abs', carBox, `left:0;top:0;width:${CAR.w}px;height:${f3(CAR.h)}px;-webkit-mask-image:url(${carI.src});-webkit-mask-size:100% 100%;mix-blend-mode:screen`);
  const glint = el('div', 'abs', glintW, `left:0;top:-80px;width:180px;height:${f3(CAR.h + 160)}px;background:linear-gradient(90deg,rgba(255,200,150,0),rgba(255,214,180,.38) 45%,rgba(255,244,232,.7) 50%,rgba(255,214,180,.38) 55%,rgba(255,200,150,0));transform-origin:50% 50%`);

  // ---------- la pochette de la scène (fond sous les cartes, face au-dessus) et les cartes ----------
  const LPb = el('div', 'L', stage), LC = el('div', 'L', stage), LPf = el('div', 'L', stage);
  const PS = KP.folder(LPb, LPf, { flapH: 92 });
  const POS = { x: 160, y: 1200, w: 760, h: 220 };
  // l'essai : une carte de verre, mains sur un volant, route de jour
  const ess = el('div', 'glass', LC, 'width:600px;height:338px;border-radius:34px;transform-origin:50% 50%');
  const essCv = el('canvas', 'abs', ess, 'width:600px;height:338px'); essCv.width = 600; essCv.height = 338;
  const essL = el('div', 'pill', ess, 'left:22px;top:20px'); essL.textContent = 'Essai';
  // les cartes : une sortie par entrée ; la plus récente en haut, la plus ancienne rentre dans la pochette en bandeau
  const SD = [
    { t: T.c[0], from: 'p', d: KP.doc(LC, { name: 'Contrôle', value: '6 oct.', ring: { num: '6', unit: 'mois' }, thumb: 'right' }), seq: 'ct2', rem: 0.978, fx: 0.62, fy: 0.45 },
    { t: T.c[1], from: 'p', d: KP.doc(LC, { name: 'Situation adm.', value: '0 €', ring: { num: '15', unit: 'j' } }), rem: 11 / 15 },
    { t: T.c[2], from: 'p', d: KP.doc(LC, { name: 'Cession', value: '× 2', ring: { num: '15', unit: 'j' }, thumb: 'right' }), seq: 'signe', rem: 1, fx: 0.62, fy: 0.55 },
    { t: T.c[3], from: 'p', d: KP.doc(LC, { name: 'Carte grise', value: 'à barrer', ring: { num: '1', unit: 'mois' } }), rem: 1 },
    { t: T.phone, from: 'r', d: KP.doc(LC, { name: 'Virement', value: 'en cours', thumb: 'left', name2: 'Virement reçu', value2: '<b>+ 2 700,00 €</b>' }), seq: 'phone', fx: 0.5, fy: 0.42 },
    { t: T.decl, from: 'p', d: KP.doc(LC, { name: 'Déclaration de cession', value: '0,00 €', ring: { num: '15', unit: 'j' } }), rem: 1 },
    { t: T.code, from: 'r', d: KP.doc(LC, { name: 'Code de cession', value: 'remis', ring: { num: '15', unit: 'j' } }), rem: 1 },
    { t: T.gag, from: 'r', gag: true },
    { t: T.cles, from: 'r', cles: true },
  ];
  const ST = SD.map((s) => s.t);
  SD.forEach((s) => { if (s.d && s.d.badge) s.d.badgeT = [...s.d.badge.r.querySelectorAll('.kp-num,.kp-unit')]; });
  const [dCtrl, , dCes, dCg, dVir, dDecl] = SD.map((s) => s.d);
  // le virement : un cercle de lumière se trace pendant l'attente
  const virRing = KP.badge(dVir.root, { size: 110 });
  // la cession : deux signatures tracées à la lumière, deux tampons « signé »
  const SIGP = ['M0 34 C8 8 18 2 20 24 C22 44 30 12 40 16 C50 20 42 40 54 32 C64 24 70 10 78 22 C84 32 92 40 112 18', 'M0 30 C12 4 24 34 30 20 C36 6 44 6 46 26 C48 44 58 14 68 20 C78 26 74 38 88 30 C98 24 104 26 116 22'];
  const sigs = SIGP.map((d, i) => KP.stroke(dCes.fx, d, { w: 4.5, gw: 13 }));
  sigs.forEach((s, i) => { for (const e of [s.g, s.l]) e.setAttribute('transform', `translate(${300 + i * 132},${70 + i * 4})`); });
  const signed = [0, 1].map((i) => { const s = el('div', 'stamp', dCes.root, `left:${318 + i * 132}px;top:118px;font-size:22px;padding:2px 12px 4px;border-width:3px;border-radius:10px`); s.textContent = 'signé'; return s; });
  // la carte grise : barrée, « Vendu le 10/10/2026 · 11 h 16 » écrit à la lumière, signée
  const cgStrike = KP.stroke(dCg.fx, 'M150 150 C300 112 520 64 740 22', { w: 7, color: '#ff8a4c', glow: '#ff5a1f', gw: 18 });
  const cgW = word(dCg.fx, 'Vendu le 10/10/2026 · 11 h 16', '700 34px Satoshi', 34, 168, 140, { align: 'left', strokeColor: '#ffd9c2', sw: 1.6 });
  const cgSig = KP.stroke(dCg.fx, 'M0 30 C10 4 20 30 28 14 C36 0 40 30 52 22 C62 16 66 28 80 18', { w: 4, gw: 12 });
  for (const e of [cgSig.g, cgSig.l]) e.setAttribute('transform', 'translate(648,96)');
  // le gag : seul (les autres cartes passent en retrait), plus haut que les cartes, de travers, qui tremble ;
  // 760 px de large comme les cartes (rotation et tremblement compris : de 147 à 933, dans la colonne)
  const GAG = { w: 760, h: 212 };
  const gagW = el('div', 'abs', LC, `width:${GAG.w}px;height:${GAG.h}px;transform-origin:50% 50%`);
  const gagN = notif(gagW, "Site qui imite l'officiel", '49,90', { app: 'ton beau-frère' });
  Object.assign(gagN.d.style, { left: '0', top: '0', width: `${GAG.w}px`, height: `${GAG.h}px` });
  gagN.c.getContext('2d').drawImage(coins, 0, 0, 372, 276);
  const gagAm = gagN.d.querySelector('.am'); gagAm.innerHTML = `<b>−</b>${KP.clash(' 49,90 €')}`; gagAm.style.font = '700 64px Clash'; gagAm.style.lineHeight = '66px';
  const gagApp = gagN.d.querySelector('.app'); Object.assign(gagApp.style, { font: '700 40px Satoshi', lineHeight: '42px', color: '#ffb38a', marginBottom: '4px' });
  Object.assign(gagN.d.querySelector('.ti').style, { font: '700 46px Satoshi', lineHeight: '52px' });
  SD[7].el = gagW;
  // les clés
  const clesW = el('div', 'glass', LC, 'width:760px;height:170px;border-radius:30px;transform-origin:50% 50%');
  const clesCv = el('canvas', 'abs', clesW, 'width:760px;height:170px;filter:brightness(.68) saturate(.85)'); clesCv.width = 760; clesCv.height = 170;
  SD[8].el = clesW;
  // chemin des cartes : case 1 (y 652, 20 px sous la bulle), case 2 (838), case 3 (1024 → 1194, au-dessus de la pochette),
  // puis bandeaux de la pochette (1216, 1312)
  // (round 2 : le bandeau qui sort, de 1312 à 1380, s'enfonce derrière la face de la pochette avant que le suivant le couvre)
  const PY = [652, 838, 1024, 1216, 1312, 1380];

  // ---------- B : la bulle de l'acheteur, la bulle du beau-frère, la tasse ----------
  const LB = el('div', 'L', stage);
  const BUB = { x: 215, y: 528, h: 104, s: 1.22 };   // échelle 1,22 : « Je suis devant. » à 16 px sur un écran de 360 px
  const ripple = el('div', 'ripple', LB, `height:${BUB.h}px`);
  const bub = el('div', 'glass bub', LB, `height:${BUB.h}px`); el('div', 'sheen', bub);
  el('div', 'n', bub).textContent = 'Acheteur';
  const QT = ['Je suis devant.', 'Les papiers ?', 'Le contrôle ?', 'Pas de gage ?', 'La cession ?', 'La carte grise ?'];
  const QIN = [-1, T.ask, ...T.q];                               // la question j entre à QIN[j], sort à QIN[j + 1]
  const qEl = QT.map((s) => { const e = el('div', 't', bub); e.textContent = s; return e; });
  const QW = QT.map((s) => Math.max(KP.textW('700 40px Satoshi', s), KP.textW('500 30px Satoshi', 'Acheteur')) + 64);
  const QK = [[0, QW[0]], ...QIN.slice(1).map((x, i) => [x, QW[i + 1], P.flip])];
  const bfW = KP.textW('700 40px Satoshi', '20 min ? ') + KP.textW('italic 500 46px Fraunces', 'Impossible.') + 70;
  const bf = el('div', 'glass bub', LB, `width:${f3(bfW)}px;height:${BUB.h}px;border-radius:34px 34px 10px 34px;transform-origin:50% 50%`); el('div', 'sheen', bf);
  const bfN = el('div', 'n', bf); bfN.textContent = 'Beau-frère';
  const bfT = el('div', 't', bf); bfT.innerHTML = '20 min ? <span class="serif" style="font-size:46px;font-weight:500">Impossible.</span>';
  // la tasse au trait de lumière (même épaisseur que le contour de la voiture), deux volutes à graine fixe, périodiques
  function cup(parent, id) {
    const s = sv('svg', { width: 200, height: 240, viewBox: '-40 -80 200 240', style: 'position:absolute;left:0;top:0;overflow:visible;transform-origin:0 0' }, parent);
    const d = sv('defs', {}, s), g = sv('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: 0, y1: 34, x2: 0, y2: -70 }, d);
    sv('stop', { offset: 0, 'stop-color': '#ffe2cf', 'stop-opacity': 0.95 }, g); sv('stop', { offset: 1, 'stop-color': '#ffb38a', 'stop-opacity': 0 }, g);
    const parts = ['M16 40 L24 98 Q28 118 48 118 L80 118 Q100 118 104 98 L112 40', 'M10 40 L118 40', 'M108 54 C136 52 136 98 102 96', 'M-6 128 Q64 148 134 128'].map((p) => KP.stroke(s, p, { w: 4, gw: 14 }));
    const steam = [0, 1].map(() => sv('path', { fill: 'none', stroke: `url(#${id})`, 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-dasharray': '13 8' }, s));
    return { s, parts, steam };
  }
  const SV = 21 * Math.round(34 * DUR / 21) / DUR;                         // vitesse de la vapeur : un nombre entier de motifs par boucle
  const wv = (t, n, ph) => Math.sin(2 * Math.PI * n * t / DUR + ph);
  function paintCup(C, { x, y, sc = 1, k = 1, draw = 1, steam = 1, t }) {
    C.s.style.transform = `translate(${f3(x - 40 * sc)}px,${f3(y - 80 * sc)}px) scale(${f3(sc)})`; set(C.s, k);
    if (C.s.style.visibility === 'hidden') return;
    C.parts.forEach((p, i) => KP.paintStroke(p, clamp(draw * 1.5 - i * 0.16, 0, 1)));
    C.steam.forEach((p, i) => {
      const x0 = 46 + 34 * i;
      p.setAttribute('d', `M${x0} 30 C${f3(x0 - 12 + 5 * wv(t, 13, i))} 14 ${f3(x0 + 12 + 5 * wv(t, 17, 1 + i))} 0 ${f3(x0 + 3 * wv(t, 11, 2 + i))} -16 S${f3(x0 - 12 + 6 * wv(t, 19, 3 + i))} -46 ${f3(x0 + 5 * wv(t, 7, i))} -64`);
      p.setAttribute('stroke-dashoffset', f3(-((t * SV + 9 * i) % 21)));
      p.setAttribute('opacity', f3(steam));
    });
  }
  const cupA = cup(LB, 'stmA');

  // ---------- M : mardi 6 octobre, la pochette se remplit ----------
  const LMb = el('div', 'L', stage), LMc = el('div', 'L', stage), LMf = el('div', 'L', stage);
  const PM = KP.folder(LMb, LMf, { flapH: 72 });                 // le rabat fermé ne couvre plus la ligne du contrôle
  const POM = { x: 150, y: 630, w: 780, h: 780 };
  const MY0 = 686;                                              // premier bandeau, sous le rabat fermé (630 → 702)
  // dans le bandeau, l'anneau cède la place à sa durée écrite (« 15 j » : 12,7 px à 360, l'anneau réduit n'y faisait que
  // 9,5 px pour le chiffre et 5,4 px pour l'unité) ; les noms partent tous de x = 184
  const MD = [
    { name: 'Contrôle', value: '78 €', ring: { num: '6', unit: 'mois' }, dur: '6 mois' },
    { name: 'Situation adm.', value: '0 €', ring: { num: '15', unit: 'j' }, dur: '15 j' },
    { name: 'Cession', value: '× 2', ring: { num: '15', unit: 'j' }, dur: '15 j' },
    { name: 'Carte grise', value: 'à barrer', ring: { num: '1', unit: 'mois' }, dur: '1 mois' },
    { name: 'Déclaration · ANTS', value: '0 €', ring: { num: '15', unit: 'j' }, dur: '15 j' },
  ].map((s) => KP.doc(LMc, { ...s, wb: 740, durX: 184 }));
  const xl2 = el('div', 'xl', MD[0].root, 'color:rgba(246,239,231,.85)'); xl2.textContent = '2 ans pour rouler';
  const xl6 = el('div', 'xl', MD[0].root, 'color:#ffb38a'); xl6.textContent = '< 6 mois à sa carte grise';
  const mSvg = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LMc);
  const totBar = KP.stroke(mSvg, 'M190 0 L890 0', { w: 5, gw: 14 });
  const tot = el('div', 'tot', LMc); const totA = el('span', 'a', tot); totA.textContent = 'Pochette :'; const totB = el('span', 'b', tot); totB.innerHTML = KP.clash('78 €');
  // le verdict : le contrôle reçu à l'achat (10 mars) n'est plus bon pour vendre
  const ach = KP.doc(LMc, { name: "Contrôle d'achat", value: '10 mars', ring: { num: '6', unit: 'mois' }, h: 250 });
  const achSub = el('div', 'kp-sub', ach.root, 'font:700 38px Satoshi;line-height:38px;color:rgba(246,239,231,.85)'); achSub.textContent = 'vendre ≤ 9 sept.';   // 10 mars → 9 sept. : six mois pour vendre avec ce contrôle
  const achStrike = KP.stroke(ach.fx, 'M150 128 C320 108 540 84 742 52', { w: 7, color: '#ff8a4c', glow: '#ff5a1f', gw: 18 });
  defs(ach.fx, 'ach');
  const achW1 = word(ach.fx, 'refait', '500 54px Fraunces', 54, 168, 222, { align: 'left', italic: true, fill: 'url(#qgach)', strokeColor: '#ffb38a', sw: 1.6 });
  const achW2 = word(ach.fx, 'le 6 oct. · 78 €', '700 48px Satoshi', 48, 168 + achW1.width + 16, 222, { align: 'left', strokeColor: '#ffd9c2', sw: 1.6 });
  // (round 3 : l'éclair de 26 px entre le verdict et la liste, perdu à 360 px, est retiré ; sur « tu le refais », c'est
  // le bandeau « Contrôle · 78 € » qui pulse et dont le prix s'allume : le contrôle refait, c'est lui)

  // ---------- chute : tout s'éteint, « 20 min » géant, la tasse revient ----------
  const dim = el('div', 'L', stage, 'background:rgba(8,7,10,.95)');
  // ---------- H : libellé, horloge, palettes ----------
  const LH = el('div', 'L', stage);
  const lab = el('div', 'lab', LH, 'top:248px');
  const LW = ['1<sup>re</sup>', 'REVENTE', '·', 'SAMEDI'].map((s, i) => { const w = el('span', 'w', lab); w.innerHTML = s; if (i) w.style.marginLeft = '.62em'; return w; });
  const CKC = CK.clock(LH, { top: 300 });
  const FLG = el('div', 'abs', LH, 'width:1080px;height:1920px;transform-origin:540px 386px');
  const FL = (() => { let x = 540 - 376; const out = []; for (const c of 'MAR 6 OCT') { if (c === ' ') { x += 30; continue; } const d = el('div', 'flapT glass', FLG, `left:${x}px;top:326px;width:92px;height:120px;font-size:84px;border-radius:13px`); el('div', 'sheen', d); const s = el('span', '', d); el('i', '', d); out.push({ d, s, c }); x += 100; } return out; })();
  const L20 = el('div', 'L', stage);
  const glow20 = el('div', 'glow', L20, 'left:150px;top:420px;width:780px;height:560px;background:radial-gradient(closest-side,rgba(255,100,40,.5),transparent)');
  const W20 = KP.textW('700 280px Clash', '20'), WMIN = KP.textW('700 130px Clash', 'min'), X20 = 540 - (W20 + 26 + WMIN) / 2 + W20 / 2;
  const big20 = el('div', 'abs big20', L20, `left:0;top:520px;width:1080px;text-align:center;transform-origin:${f3(X20)}px 140px`);
  big20.innerHTML = '20<span>min</span>'; const minS = big20.querySelector('span');
  const LT = el('div', 'L', stage);
  const cupB = cup(LT, 'stmB');
  const svgT = sv('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' }, LT); defs(svgT, 't');
  const wChaud = word(svgT, 'encore chaud.', '500 100px Fraunces', 100, 540, 1218, { italic: true, fill: 'url(#qgt)', strokeColor: '#ffb38a', sw: 1.8 });

  const mention = el('div', 'abs', stage, 'left:0;width:1080px;top:1428px;text-align:center;font:500 32px Satoshi;color:rgba(246,239,231,.72);white-space:nowrap'); mention.textContent = 'Exemple · prix moyens constatés';
  const rewFx = el('div', 'L', stage, 'background:repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 2px,transparent 2px 6px);mix-blend-mode:screen');
  const flash = el('div', 'L', stage, 'background:radial-gradient(60% 45% at 50% 50%,#fff1e6,rgba(255,140,80,.6) 45%,transparent 75%);mix-blend-mode:screen');
  el('div', '', stage).id = 'grain'; el('div', '', stage).id = 'vign';

  // ---------- la frame t ----------
  function paint(t) {
    const st = story(t), hk = hook(t), c = cam(t);
    const cW = part(c, 1, 1, 1, 1), cB = part(c, 0.6, 0.4, 0.5, 0.5), cU = part(c, 0.45, 0.22, 0.25, 0.08), cH = part(c, 0.3, 0.1, 0.15, 0.04);
    // présence des éléments de l'image 0 (horloge, libellé, bulle, tasse) : ils cèdent la place au mardi, puis reviennent
    const pOut = sm(T.flaps, T.flaps + 0.35, t), pIn = eo(LOOP + 0.45, DUR - 0.08, t);
    const pres = t < LOOP ? 1 - pOut : pIn;
    const mIn = sm(REW[1] - 0.35, REW[1] + 0.3, t) * (t < LOOP ? 1 : 1 - eo(LOOP + 0.36, LOOP + 1.15, t));    // le mardi ; la C3 revient sur un fond vide
    // « 20 min » : tout s'éteint. Au rembobinage, le chiffre revient en deux temps, comme à l'aller (temps du film : le
    // temps du récit ne recule presque pas au début) : il rapetisse et remonte dans la case des minutes, l'horloge le
    // reprend, puis seulement le voile se lève sur la scène qui se rembobine (jamais deux scènes superposées)
    const back = Math.min(1, S(t, BK0, BKF) / 0.96);             // 0 → 1, posé dans la case à BKL (21,0 s)
    const on20 = t < REW[0] ? sm(T.big, T.big + 0.25, st) : 1, st20 = t < REW[0] ? st : REW[0];
    const big0 = on20 * (1 - sm(BKL, BKL + 0.16, t));
    const rew = sm(REW[0], REW[0] + 0.12, t) * (1 - sm(REW[1] - 0.12, REW[1], t)) + sm(R1[0], R1[0] + 0.06, t) * (1 - sm(R1[1] - 0.06, R1[1], t));

    // fonds
    bg.style.transform = tf(cB);
    const calK = sm(REW[0], REW[0] + 0.25, t) * (1 - sm(REW[1] + 0.1, REW[1] + 0.5, t));      // le calendrier ne passe que derrière le rembobinage
    set(calCv, calK); set(calShade, calK);
    if (calK > 0.01) drawCrop(calCv, IMG.jours, t - REW[0] + 0.4);
    set(warm, mIn);
    sun.style.transform = `translateX(${f3(30 * Math.sin(2 * Math.PI * t / DUR))}px)`; set(sun, 1 - 0.7 * mIn);
    floor.style.transform = `perspective(900px) rotateX(72deg) translateX(${f3(-cW.x * 0.6)}px)`;
    set(glowCar, 0.85 * (1 - sm(T.blur, T.blur + 0.6, st)) * (1 - mIn) + 0.4 * mIn);

    // P : la C3 — sortie de l'ouverture (temps hk), seconde sortie (temps du récit), retrait flou au mardi
    const u1 = clamp((hk - T.go) / 0.55, 0, 1), u2 = clamp((st - T.go2) / 0.6, 0, 1);
    const carX = -1250 * Math.pow(u1, 1.8) - 1350 * Math.pow(u2, 1.8);
    const spd = Math.max(u1 > 0 && u1 < 1 ? Math.pow(u1, 1.4) : 0, u2 > 0 && u2 < 1 ? Math.pow(u2, 1.2) : 0);
    const sB = sm(T.blur, T.blur + 0.5, st), blurK = clamp(Math.max(sB, mIn), 0, 1);
    LP.style.transform = tf(cW);
    set(LP, (1 - 0.82 * big0) * (u2 < 1 ? 1 : 0) * (1 - 0.72 * mIn) * (1 - 0.25 * sB));
    const squat = bump(hk, T.go - 0.05, 0.35) + bump(st, T.go2 - 0.05, 0.35);
    carBox.style.transform = `translate(${f3(carX)}px,${f3(-90 * mIn)}px) scale(${f3(1 - 0.24 * mIn)}) rotate(${f3(-0.8 * squat)}deg)`;
    carBox.style.filter = spd > 0.02 ? `blur(${f3(5 * spd)}px)` : '';
    set(carImg, 1 - blurK); set(carBl, blurK);
    cLine.setAttribute('opacity', f3(0.9 * (1 - blurK))); cGlow.setAttribute('opacity', f3(0.75 * (1 - 0.7 * blurK)));
    set(etiq, 1 - blurK);
    const gl = eo(0.3, 1.45, hk);
    set(glintW, sm(0.3, 0.42, hk) * (1 - sm(1.2, 1.45, hk)) * (1 - blurK)); glint.style.transform = `translateX(${f3(-220 + (CAR.w + 260) * gl)}px) rotate(14deg)`;
    const vs = S(hk, T.stamp, P.stamp);
    set(vendue, sm(T.stamp - 0.02, T.stamp + 0.04, hk));
    vendue.style.transform = `translate(-50%,-50%) rotate(-12deg) scale(${f3(lerp(1.9, 1, vs))})`;

    // la pochette de la scène et les cartes
    for (const L of [LPb, LC, LPf]) { L.style.transform = tf(cU, `scale(${f3(1 - 0.04 * big0)})`); set(L, 1 - sm(0.2, 1, big0)); }   // tout s'éteint sous « 20 min »
    const pa = S(st, T.poch, P.card), pK = sm(T.poch - 0.02, T.poch + 0.1, st);
    KP.paintFolder(PS, { x: POS.x, y: lerp(1580, POS.y, pa), w: POS.w, h: POS.h, k: pK, open: S(st, T.rabat, { f: 1.6, z: 0.9 }) });
    // l'essai : 11:01 → 11:09, la C3 reste garée
    const ea = S(st, T.essai, P.card), eb = S(st, T.essaiOut, P.push);
    set(ess, sm(T.essai - 0.02, T.essai + 0.08, st) * (1 - sm(T.essaiOut + 0.25, T.essaiOut + 0.4, st)));
    if (ess.style.visibility !== 'hidden') {
      const esc = 0.86 + 0.14 * ea;
      ess.style.transform = `translate(${f3(240 - 1150 * eb)}px,${f3(672 + 90 * (1 - ea))}px) perspective(1200px) rotateX(${f3(18 * (1 - ea))}deg) rotateY(${f3(-14 * eb)}deg) scale(${f3(esc)})`;
      clipX(ess, 240 - 1150 * eb + 300 * (1 - esc) - 40 * eb, 840 - 1150 * eb, esc);
      drawCrop(essCv, IMG.essai, st - T.essai + 0.6, 0.5, 0.45);
    }
    // l'attente : tout se met en retrait autour du virement
    const focus = sm(T.wait - 0.25, T.wait + 0.2, st) * (1 - sm(T.recu - 0.1, T.recu + 0.2, st));
    // le gag arrive seul : la pile passe en retrait jusqu'à l'extinction de « 20 min » (la seconde sortie de la C3 se voit
    // derrière) ; le gag grandit, puis rentre dans le rang quand les clés arrivent, et reste plein jusqu'à l'extinction
    const gagF = sm(T.gag + 0.1, T.gag + 0.3, st) * (1 - sm(T.cles - 0.1, T.cles + 0.1, st));
    const pileF = sm(T.gag + 0.1, T.gag + 0.3, st);
    SD.forEach((s, i) => {
      const dimF = s.cles || s.gag ? 0 : pileF;
      const a = S(st, s.t, P.card), k = KP.depth(st, ST, i), on = sm(s.t - 0.02, s.t + 0.06, st) * (1 - sm(4.0, 4.3, k)) * (s.d === dVir ? 1 : 1 - 0.75 * focus) * (1 - 0.72 * dimF);
      const bk = clamp(k - 2, 0, 1), y = KP.along(PY, k) + (s.from === 'p' ? (1 - a) * 600 : 0), x = (s.from === 'r' ? 1150 * (1 - a) : 0) + 160;
      const b = s.from === 'p' ? Math.max(1 - a, bk) : bk, sc = (1 - 0.05 * clamp(k - 4, 0, 1)) * (1 - 0.04 * dimF);
      if (s.d) {
        const remK = s.rem == null ? null : [lerp(1, s.rem, S(st, s.t + 0.35, { f: 1.2, z: 1 })) * S(st, s.t + 0.02, P.draw), sm(s.t, s.t + 0.05, st) * (1 - sm(s.t + 0.65, s.t + 0.85, st))];
        const sw = s.d === dVir ? S(st, T.recu, { f: 2.2, z: 1 }) : 0;
        const shk = s.d === dVir ? bump(st, T.recu, 0.32) * Math.sin((st - T.recu) * 110) * 7 : 0;
        KP.paintDoc(s.d, { x: x + shk, y, b, k: on, sc, ring: remK, swap: sw, lit: s.d === dDecl ? sm(T.zero, T.zero + 0.12, st) : 0 });
        clipX(s.d.root, x, x + 760 - 20 * b);
        // une carte qui sort de la pochette : son texte n'entre qu'une fois la carte sortie et passée devant (a ≥ 0,95 : jamais
        // lu à travers le verre des autres, ni coupé par la carte qui descend d'une case, round 3)
        if (s.from === 'p') { const tk = sm(0.95, 1, a); for (const e of [s.d.name.e, s.d.value.e]) e.style.opacity = f3(+e.style.opacity * tk); }
        // une carte qui glisse depuis la droite : son texte n'entre qu'une fois sorti du masque de x = 920 (plus de « en cour »
        // coupé à 9,7 s) ; il glisse avec la carte
        if (s.from === 'r') { const tk = sm(0.75, 0.92, a); for (const e of [s.d.name.e, s.d.value.e]) e.style.opacity = f3(+e.style.opacity * tk); }
        // la carte se replie en bandeau en passant le liseré de la pochette (k de 2 à 3) : son texte sort au début du
        // repli et revient une fois le bandeau rangé (règle du conteneur qui se transforme, comme au mardi)
        s.fold = sm(2.02, 2.2, k) * (1 - sm(2.8, 2.98, k));
        if (s.fold > 0.001) for (const e of [s.d.name.e, s.d.value.e, s.d.name2 && s.d.name2.e, s.d.value2 && s.d.value2.e]) if (e) e.style.opacity = f3(+e.style.opacity * (1 - s.fold));
        if (s.d.badgeT) for (const e of s.d.badgeT) e.style.opacity = f3(1 - (s.fold || 0));   // « 6 », « mois » de l'anneau aussi
        // « 0,00 € » : appui d'échelle 1,12 → 1 sur « 0 » (ressort amorti, sans dépassement)
        if (s.d === dDecl) { const zp = sm(T.zero - 0.06, T.zero + 0.02, st) * (1 - S(st, T.zero + 0.02, { f: 2.4, z: 1 })); if (zp > 0.001) s.d.value.e.style.transform += ` scale(${f3(1 + 0.12 * zp)})`; }
        // la carte qui sort de la pochette monte derrière les autres (verre dépoli devant), puis passe au premier plan
        s.d.root.style.zIndex = s.from === 'p' && a < 0.95 ? 1 : 100 - Math.round(10 * k);
        s.b = b;
        if (s.seq && on > 0.01) drawCrop(s.d.cv, IMG[s.seq], st - s.t + 0.5, s.fx, s.fy);
      } else {
        const el2 = s.el, gg = !!s.gag;
        const tr = gg ? sm(s.t + 0.25, s.t + 0.35, st) * (1 - sm(s.t + 1.0, s.t + 1.3, st)) : 0;
        const rot = gg ? -4 + noise(21, st * 9) * 1.8 * tr : 0, jx = gg ? noise(22, st * 11) * 7 * tr : 0;
        set(el2, on);
        if (el2.style.visibility !== 'hidden') {
          el2.style.zIndex = 100 - Math.round(10 * k);
          const gsc = gg ? (0.92 + 0.08 * gagF) * (1 - 0.04 * dimF) : 1, gy = y - (GAG.h - 170) / 2 - 20 * gagF;   // posé 20 px plus haut : la carte du dessous reste à découvert
          el2.style.transform = gg ? `translate(${f3(x + jx)}px,${f3(gy)}px) rotate(${f3(rot)}deg) scale(${f3(gsc)})` : `translate(${f3(x)}px,${f3(y)}px) scale(${f3(sc)})`;
          if (gg) clipX(el2, x + jx + GAG.w * (1 - gsc) / 2, x + jx + GAG.w * (1 + gsc) / 2 + 8, gsc); else clipX(el2, x, x + 760);
          if (s.cles) drawCrop(clesCv, IMG.cles, st - s.t + 0.4, 0.5, 0.45, 2.2);   // cadré sur l'anneau et les clés
        }
      }
    });
    // le virement : le cercle de lumière se trace pendant l'attente, se ferme sur « Virement reçu »
    const vr = sm(T.wait - 0.3, T.wait + 0.1, st) * (1 - sm(T.recu + 0.15, T.recu + 0.4, st));
    set(virRing.r, vr); virRing.r.style.transformOrigin = '50% 50%';
    virRing.r.style.transform = `translate(593px,30px) scale(${f3(1.6 * (1 + 0.2 * sm(T.recu, T.recu + 0.4, st)))})`;
    KP.paintBadge(virRing, Math.min(1, 0.08 + 0.8 * clamp((st - T.wait) / (T.recu - T.wait), 0, 1) + 0.12 * S(st, T.recu - 0.05, P.snappy || { f: 3, z: 1 })), sm(T.wait - 0.2, T.wait, st) * (1 - sm(T.recu, T.recu + 0.15, st)));
    // la cession : deux signatures, deux tampons
    const cb = SD[2].b || 0, cf = 1 - (SD[2].fold || 0);
    sigs.forEach((g, i) => KP.paintStroke(g, S(st, T.sig[i] - 0.12, { f: 1.6, z: 1 }), (1 - 0.6 * cb) * cf));
    signed.forEach((s, i) => { const p = S(st, T.sig[i] + 0.12, P.stamp); set(s, sm(T.sig[i] + 0.1, T.sig[i] + 0.16, st) * (1 - cb) * cf); s.style.transform = `translateY(${f3(-70 * cb)}px) rotate(-8deg) scale(${f3(lerp(1.8, 1, p) * (1 - 0.4 * cb))})`; });
    // la carte grise : barrée, mention écrite, signée
    KP.paintStroke(cgStrike, S(st, T.cg, P.pen));
    const cgK = 1 - sm(2.02, 2.2, KP.depth(st, ST, 3));             // « Vendu le… » et la signature sortent au début du repli
    writeWord(cgW, st, T.cgW, 0.022, 14, cgK);
    KP.paintStroke(cgSig, S(st, T.cgS, { f: 1.6, z: 1 }), cgK);
    const vOut = sm(T.cgW - 0.1, T.cgW + 0.1, st);
    dCg.value.e.style.opacity = f3(+dCg.value.e.style.opacity * (1 - vOut)); dCg.value.e.style.transform += ` translateY(${f3(-24 * vOut)}px)`;

    // B : bulles et tasse
    LB.style.transform = tf(cU);
    const bOut = S(st, T.phone - 0.08, P.push);
    const shake = bump(hk, T.shake, 0.26) * Math.sin((hk - T.shake) * 2 * Math.PI * 12) * 7;
    const pulse = bump(hk, T.sonne, 0.3);
    const bw = track(st, QK), bPres = pres * (1 - sm(T.phone - 0.05, T.phone + 0.2, st));
    set(bub, bPres);
    bub.style.width = `${f3(bw)}px`;
    bub.style.transform = `translate(${f3(BUB.x + shake)}px,${f3(BUB.y - 70 * bOut + 40 * (1 - pres))}px) scale(${f3(BUB.s * (1 + 0.1 * pulse) * (1 - 0.12 * bOut) * (0.92 + 0.08 * pres))})`;
    const qPop = Math.max(...QIN.slice(1).map((x) => bump(st, x, 0.22)));
    if (qPop > 0) bub.style.transform += ` scale(${f3(1 + 0.04 * qPop)})`;
    qEl.forEach((e, j) => {
      const tin = QIN[j], tout = j + 1 < QIN.length ? QIN[j + 1] : 99;
      const a = j ? sm(tin + 0.06, tin + 0.16, st) : 1, o = sm(tout - 0.05, tout + 0.04, st);
      set(e, a * (1 - o)); e.style.transform = `translateY(${f3(12 * (1 - a) - 12 * o)}px)`;
    });
    const rp = clamp((hk - T.sonne) / 0.5, 0, 1);
    set(ripple, (rp > 0 && rp < 1 ? 0.9 * (1 - rp) : 0) * bPres); ripple.style.width = `${f3(bw)}px`;
    ripple.style.transform = `translate(${f3(BUB.x + bw * (BUB.s - 1) / 2)}px,${f3(BUB.y - BUB.h * (BUB.s - 1) / 2)}px) scale(${f3(BUB.s * (1 + 0.5 * rp))})`;
    const bfa = S(hk, T.bf, P.card);
    set(bf, sm(T.bf - 0.02, T.bf + 0.06, hk));
    const btr = bump(t, T.croit, 0.32), bjx = noise(24, t * 11) * 8 * btr;   // temps du film : le tremblement ne rejoue pas au retour court
    const BFS = 1.35, bfX = 540 - bfW / 2 + 380 * (1 - bfa) + bjx;
    bf.style.transform = `translate(${f3(bfX)}px,900px) rotate(${f3(-4 - 6 * (1 - bfa) + noise(23, t * 9) * 2.2 * btr)}deg) scale(${BFS})`;
    clipX(bf, bfX + bfW * (1 - BFS) / 2, bfX + bfW * (1 + BFS) / 2 + 10, BFS);
    { const k = f3(sm(0.72, 0.9, bfa)); bfN.style.opacity = k; bfT.style.opacity = k; }   // texte entier une fois sorti du masque (jamais « Impossib »)
    const cOut = S(st, T.c[0] - 0.15, P.push);
    paintCup(cupA, { x: 745 + 120 * cOut, y: 542 + 30 * (1 - pres) - 40 * cOut, sc: 0.86 * (1 - 0.2 * cOut) * (0.9 + 0.1 * pres), k: pres * (1 - sm(T.c[0] - 0.1, T.c[0] + 0.15, st)), t });

    // M : mardi, la pochette se remplit
    const mOut = t < LOOP ? 0 : S(t, LOOP - 0.02, P.push), mK = sm(REW[1] - 0.3, REW[1] - 0.1, t) * (1 - sm(LOOP + 0.22, LOOP + 0.36, t));   // il monte et rapetisse d'abord, puis disparaît
    const cM = part(c, 0.5, 0.3, 0.3, 0.1);
    for (const L of [LMb, LMc, LMf]) { L.style.transform = tf(cM, `translateY(${f3(-240 * mOut)}px) scale(${f3(1 - 0.4 * mOut)})`); set(L, mK); }
    if (mK > 0.002) {
      const ma = S(t, T.pochM, P.card);
      KP.paintFolder(PM, { x: POM.x, y: lerp(1500, POM.y, ma), w: POM.w, h: POM.h, k: sm(T.pochM - 0.02, T.pochM + 0.1, t), open: 1 - S(t, T.close, { f: 1.5, z: 0.85 }),
        stamp: S(t, T.pret, P.stamp), stampK: sm(T.pret - 0.02, T.pret + 0.05, t) });
      const g2 = S(t, T.l2, P.card), g6 = S(t, T.l6, P.card), grow = 52 * g2 + 52 * g6;
      MD.forEach((d, i) => {
        const t0 = T.m[i] - 0.12, a = S(t, t0, P.card), dr = S(t, T.m[i] + 0.36, P.card);
        const yb = MY0 + i * 102 + (i ? grow : 0);
        const mx = lerp(160 + 1150 * (1 - a), 160, dr); clipX(d.root, mx, mx + 760 - 10 * dr);
        KP.paintDoc(d, { x: mx, y: lerp(400, yb, dr), b: dr, k: sm(t0 - 0.02, t0 + 0.06, t), hx: i ? 0 : grow * dr, lit: i ? 0 : sm(T.eclair, T.eclair + 0.12, t),
          ring: [S(t, t0 + 0.05, P.draw), sm(t0 + 0.04, t0 + 0.1, t) * (1 - sm(t0 + 0.5, t0 + 0.7, t))] });
        // la carte se replie en bandeau en tombant sur les autres : son texte sort au début du repli et ne revient qu'à la
        // fin de la chute (dr ≥ 0,9 : moins de 35 px au-dessus de sa place, jamais sur le texte du bandeau d'au-dessus)
        // et à l'entrée par la droite, il n'apparaît qu'une fois sorti du masque de x = 920 (plus de « Situation adr » coupé)
        const dk = (1 - sm(0.02, 0.22, dr) * (1 - sm(0.9, 1, dr))) * sm(0.75, 0.92, a);
        if (dk < 0.999) for (const e of [d.name.e, d.value.e]) e.style.opacity = f3(+e.style.opacity * dk);
        // « Contrôle : » (pendant que la carte grise entre en haut), puis « tu le refais » : le bandeau du contrôle pulse,
        // « 6 mois » grossit
        const pu = i ? 0 : bump(t, T.ctl, 0.36) + bump(t, T.eclair, 0.4);
        if (pu > 0) { d.root.style.transform += ` scale(${f3(1 + 0.03 * pu)})`; d.dur.style.transform += ` scale(${f3(1 + 0.2 * pu)})`; }
      });
      // les deux lignes du contrôle : deux ans pour rouler, moins de six mois à la carte grise de l'acheteur
      // (règle du conteneur qui se transforme : la ligne entre une fois le bandeau agrandi, g ≥ 0,85, jamais sur le suivant)
      const a2 = sm(0.85, 1, g2), a6 = sm(0.85, 1, g6);
      set(xl2, a2); xl2.style.transform = `translate(184px,${f3(94 + 14 * (1 - a2))}px)`;
      set(xl6, a6); xl6.style.transform = `translate(184px,${f3(146 + 14 * (1 - a6))}px)`;
      const yTot = MY0 + 4 * 102 + 90 + 104 + 20;
      KP.paintStroke(totBar, S(t, T.total, P.pen)); totBar.l.parentNode && [totBar.g, totBar.l].forEach((e) => e.setAttribute('transform', `translate(0,${yTot})`));
      const ta = S(t, T.total + 0.12, P.rise), tb = S(t, T.total + 0.3, { f: 2.4, z: 0.85 });
      tot.style.top = `${yTot + 16}px`; set(tot, ta); totA.style.transform = `translateY(${f3(22 * (1 - ta))}px)`;
      totB.style.transform = `translateY(${f3(22 * (1 - tb))}px) scale(${f3(1.25 - 0.25 * tb)})`; totB.style.opacity = f3(sm(T.total + 0.28, T.total + 0.36, t));
      // le contrôle d'achat : posé, l'anneau se vide, barré, refait
      const aa = S(t, T.achat, P.card);
      clipX(ach.root, 160 + 1150 * (1 - aa), 920 + 1150 * (1 - aa));
      KP.paintDoc(ach, { x: 160 + 1150 * (1 - aa), y: 340, k: sm(T.achat - 0.02, T.achat + 0.06, t), ring: [S(t, T.achat + 0.04, P.draw) * (1 - S(t, T.vide, { f: 0.9, z: 1 })), sm(T.achat, T.achat + 0.06, t) * (1 - sm(T.vide + 0.7, T.vide + 0.9, t))] });
      achSub.style.transform = `translate(${f3(168 + 256 + 24)}px,106px)`;
      KP.paintStroke(achStrike, S(t, T.strike, P.pen));
      writeWord(achW1, t, T.refait, 0.045, 18); writeWord(achW2, t, T.refait + 0.22, 0.018, 18);
    }

    // chute : tout s'éteint
    set(dim, big0);
    // H : libellé, horloge, palettes
    LH.style.transform = tf(cH);
    const labK = (t < LOOP ? 1 - pOut : 1) * (1 - 0.78 * big0);
    LW.forEach((w, i) => {
      const r = t < LOOP ? 1 : eo(LOOP + 0.38 + 0.07 * i, LOOP + 0.83 + 0.07 * i, t);
      set(w, labK * r); w.style.transform = `translateY(${f3(18 * (1 - r) - 14 * (t < LOOP ? pOut : 0))}px)`;
    });
    const idx = t < R1[1] ? [track(hk, KH[0]), track(hk, KH[1])] : [track(st, KV[0]), track(st, KV[1])];
    idx[1] += 0.3 * Math.abs(Math.sin(Math.PI * 1.5 * (st - T.wait))) * sm(T.wait, T.wait + 0.15, st) * (1 - sm(T.recu - 0.2, T.recu - 0.02, st));   // la colonne hésite entre 4 et 5
    const ckB = 1 - sm(0.96, 1, back);                           // les cases reviennent quand le 20 s'y pose
    const mg = sm(T.big - 0.02, T.big + 0.16, st20) * ckB, hg = sm(T.big - 0.05, T.big + 0.22, st20) * ckB;
    const cfOut = (i) => sm(T.flaps + 0.05 * i, T.flaps + 0.3 + 0.05 * i, t), cfIn = (i) => eo(LOOP + 0.3 + 0.07 * i, LOOP + 0.95 + 0.07 * i, t);   // après le départ du mardi (LOOP + 0,36)
    CK.paintClock(CKC, idx, {
      k: 1, colonK: (1 - hg) * (t < LOOP ? 1 - cfOut(1.5) : cfIn(1.5)), colonDx: -70 * hg, blink: 0.5 + 0.5 * Math.cos(2 * Math.PI * Math.round(DUR) * t / DUR),
      cell: (i) => {
        const f = t < LOOP ? cfOut(i) : 1 - cfIn(i);
        return i < 2 ? { k: (1 - hg) * (1 - f), dx: -70 * hg, rx: 90 * f } : { k: (1 - mg) * (1 - f), sc: 1 + 0.35 * mg, dy: 40 * mg, rx: 90 * f };
      },
    });
    // palettes « MAR 6 OCT » : elles prennent la place de l'horloge, puis se réduisent en libellé
    const fShrink = S(t, T.mardi - 0.05, P.heavy);
    FLG.style.transform = `translateY(${f3(-111 * fShrink)}px) scale(${f3(1 - 0.5 * fShrink)})`;   // lettres de 42 px (14 px à 360)
    FL.forEach((f, i) => {
      const p = S(t, T.flaps + 0.08 + i * 0.05, P.flip), q = t < LOOP ? 0 : eo(LOOP + 0.02 * i, LOOP + 0.3 + 0.02 * i, t);
      f.s.textContent = p < 0.72 ? 'ARTVQMEZ'[(Math.floor(p * 9) + i * 3) % 8] : f.c;
      f.d.style.transform = `perspective(700px) rotateX(${f3((1 - p) * 92 - 90 * q)}deg)`;
      set(f.d, sm(0, 0.12, p) * (1 - q) * (t > T.flaps ? 1 : 0));
    });

    // 20 min : l'horloge se fond dans le chiffre géant
    // au retour, le calque du chiffre reprend la caméra de l'horloge : le 20 se pose exactement dans sa case
    const c20 = part(c, 0.5, 0.35, 0.3, 0.1), cMix = {}; for (const k in c20) cMix[k] = lerp(c20[k], cH[k], back);
    L20.style.transform = tf(cMix, `scale(${f3(1 + 0.035 * sm(T.big + 0.4, REW[0], t) * (1 - back))})`);
    set(L20, on20 * (1 - sm(0.97, 1, back)));
    const s20 = S(st20, T.big + 0.02, { f: 1.5, z: 0.92 }) * (1 - back);
    big20.style.transform = `translate(${f3((698 - X20) * (1 - s20))}px,${f3((386 - 660) * (1 - s20))}px) scale(${f3(lerp(0.457, 1, s20))})`;
    minS.style.opacity = f3(sm(0.25, 0.75, s20)); minS.style.transform = `translateX(${f3(-40 * (1 - s20))}px)`;
    set(glow20, (0.4 + 0.6 * S(st20, T.big + 0.15, P.heavy)) * (1 - back));
    // la tasse revient sous le 20, « encore chaud. » s'écrit
    const tOut = sm(REW[0] - 0.08, REW[0] + 0.14, t), tOs = S(t, REW[0] - 0.1, { f: 1.8, z: 1 });
    LT.style.transform = `${L20.style.transform} translateY(${f3(-160 * tOs)}px) scale(${f3(1 - 0.25 * tOs)})`;
    const cupK = sm(T.tasse - 0.02, T.tasse + 0.06, t) * (1 - tOut);
    set(LT, cupK);
    paintCup(cupB, { x: 540 - 64 * 1.55, y: 868 - 30 * tOut + 16 * (1 - S(t, T.tasse, P.rise)), sc: 1.55 * (1 - 0.15 * tOut), k: 1, draw: S(t, T.tasse, { f: 1.3, z: 1 }), steam: sm(T.tasse + 0.3, T.tasse + 0.8, t), t });
    writeWord(wChaud, t, T.chaud, 0.025);

    // effets
    set(mention, 1);
    set(rewFx, 0.9 * rew); rewFx.style.transform = `translateY(${f3((t * 900) % 6)}px)`;
    set(flash, 0.35 * sm(T.stamp, T.stamp + 0.05, hk) * (1 - sm(T.stamp + 0.05, T.stamp + 0.4, hk)) + 0.35 * sm(T.big + 0.05, T.big + 0.13, st) * (1 - sm(T.big + 0.13, T.big + 0.55, st)) * (t < REW[0] ? 1 : 0)
      + 0.4 * sm(T.recu, T.recu + 0.06, st) * (1 - sm(T.recu + 0.06, T.recu + 0.4, st)) * (t < REW[0] ? 1 : 0) + 0.45 * sm(T.eclair + 0.1, T.eclair + 0.16, t) * (1 - sm(T.eclair + 0.16, T.eclair + 0.5, t))
      + 0.3 * sm(LOOP, LOOP + 0.15, t) * (1 - sm(LOOP + 0.15, LOOP + 0.6, t)));
  }

  // flou de bougé : obturateur ouvert sur les gestes rapides
  const WIN = [[T.go, T.go + 0.6, 0.8], [R1[0], R1[1], 0.7], [T.go2, T.go2 + 0.65, 0.8], [T.essaiOut, T.essaiOut + 0.4, 0.6], [T.big - 0.05, T.big + 0.45, 0.6], [REW[0], REW[1], 0.7],
    [T.blur - 0.1, T.blur + 0.6, 0.5], [T.flaps, T.mardi + 0.4, 0.5], [LOOP, LOOP + 0.7, 0.6], [T.roll, T.roll + 0.4, 0.6]];
  [...ST, T.bf, T.poch, T.essai, ...T.m, ...T.m.map((x) => x + 0.36), T.achat].forEach((x) => WIN.push([x - 0.04, x + 0.35, 0.6]));
  const fast = (t) => { let s = 0; for (const [a, b, v] of WIN) s = Math.max(s, v * sm(a - 0.05, a + 0.05, t) * (1 - sm(b - 0.05, b + 0.05, t))); return s; };
  window.shutter = (t) => Math.max(0.12, fast(t));
  window.samples = (t) => (fast(t) > 0.3 ? 4 : 1);
  // temps des événements, lus par scripts/audio-mo12.py pour poser les bruitages (scripts/events.mjs → film-mo12/events.json)
  window.EVENTS = { ...T, provisional: !!VT.provisional, r1: R1, rew: REW, rw: RW, loop: LOOP, dur: DUR, stTo: ST_TO, stFrom: ST_FROM,
    ticks: TIMES.slice(1), mins: VALS.slice(1), essTicks: ESS, docs: ST, docKeys: ['controle', 'situation', 'cession', 'carteGrise', 'virement', 'declaration', 'code', 'gag', 'cles'],
    mdocs: T.m, mdrops: T.m.map((x) => x + 0.36), flapsIn: T.flaps };
  window.seek = (t) => paint(t >= DUR ? t - DUR : t);
  paint(0);
  window.filmReady = true;
})();
