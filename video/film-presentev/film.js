// Présentation utopicar avec Simon (eleven_v4), 9:16 — planche validée (planche-presente-v/), grammaire motion-pro :
// un seul objet porteur, le point orange : trou de l'étiquette → champ → fiche du vrai site → point → onde dans le mur
// d'annonces → pépite → vrai e-mail d'alerte → flèche du logo → retour à l'étiquette de l'image 0 (boucle).
// Contrat : window.seek(t) peint l'image t, sans état entre les images ; tous les instants viennent des mots de la voix
// (audio/vo-presentev/vo.words.json). Flou de bougé : window.shutter / window.samples, rendu MB=8.
(async function () {
  const { spring, clamp, lerp, noise } = Motion;
  const W = 1080, H = 1920, ST = document.getElementById('stage');
  const J = async (u) => (await fetch(u)).json();
  const WORDS = await J('../audio/vo-presentev/vo.words.json');
  const SEQ = await J('../assets/presente-v/seq/seq.json');
  const MUR = (await J('../assets/master60/annonces-mur.json')).annonces;
  const LOGO = await (await fetch('../assets/brand/official/utopicar-logo-horizontal-fond-sombre.svg')).text();
  await Promise.all(['700 200px Clash', '600 60px Clash', '700 40px Satoshi', '500 30px Satoshi', 'italic 200px Instrument'].map((f) => document.fonts.load(f)));

  // ---------- temps ----------
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const BODY = WORDS.map((w) => ({ ...w, n: norm(w.w) }));
  const TA = (keys, after = 0) => { for (const w of BODY) if (w.s >= after - 0.01 && keys.some((k) => { const kn = norm(k); return /^\d{1,2}$/.test(kn) ? w.n === kn : w.n.startsWith(kn); })) return w.s; throw new Error('mot absent : ' + keys + ' après ' + after); };
  const VEND = Math.max(...WORDS.map((w) => w.e));
  const T = {};
  T.p208 = TA(['208']); T.p7190 = TA(['7190']); T.coute = TA(['couter']); T.p8840 = TA(['8840']);
  T.tu = TA(['tu'], 4); T.colles = TA(['colles']); T.dans = TA(['dans'], T.colles); T.uto = TA(['utopicar'], T.dans);
  T.deux = TA(['deux'], T.uto); T.cote = TA(['cote'], T.deux); T.trav = TA(['travaux']); T.vrai = TA(['vrai']); T.verdict = TA(['verdict']); T.passe = TA(['passe'], T.verdict);
  T.et = TA(['et'], T.passe); T.bonnes = TA(['bonnes'], T.et); T.arrete = TA(['arrete']); T.scroller = TA(['scroller']);
  T.rech = TA(['recherche'], T.scroller); T.tourne = TA(['tourne']); T.plus = TA(['plusieurs']); T.jour = TA(['jour']);
  T.toi = TA(['toi']); T.dors = TA(['dors']); T.lui = TA(['lui']); T.bosse = TA(['bosse']);
  T.une = TA(['une'], T.bosse); T.sous = TA(['sous'], T.une); T.cote2 = TA(['cote'], T.sous); T.recois = TA(['recois']); T.mail = TA(['mail'], T.recois);
  T.appeler = TA(['appeler']); T.uto2 = TA(['utopicar'], T.appeler); T.achete = TA(['achete']); T.revends = TA(['revends']); T.mieux = TA(['mieux']);
  const DUR = Math.round((VEND + 2.7) * 30) / 30;   // carton de fin, puis retour à l'image 0
  T.loop = DUR - 0.62;                             // tout se replie, le point repart vers l'étiquette

  // interpolations exponentielles (motion-pro : arrivées en eOut, départs en eIn, gestes en eIO)
  const eOut = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
  const eIn = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : Math.pow(2, 10 * p - 10));
  const eIO = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2);
  const E = (t, t0, d, f = eOut) => f(clamp((t - t0) / d, 0, 1));
  const bump = (t, t0, d = 0.14) => clamp(spring(t - t0, 'snappy') - spring(t - t0 - d, 'snappy'), 0, 1);
  const SP = (t, t0, pr = 'default') => (t < t0 ? 0 : spring(t - t0, pr));

  // ---------- éléments ----------
  const mk = (tag, cls, parent, css, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const show = (e, v) => { e.style.display = v ? '' : 'none'; return v; };
  const tf = (e, x, y, o = {}) => { e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)${o.c ? ' translate(-50%,-50%)' : ''}${o.p ? ` perspective(1600px) rotateX(${(o.rx || 0).toFixed(2)}deg) rotateY(${(o.ry || 0).toFixed(2)}deg)` : ''} rotate(${(o.r || 0).toFixed(2)}deg) scale(${(o.sx ?? o.s ?? 1).toFixed(4)},${(o.sy ?? o.s ?? 1).toFixed(4)})`; if (o.o != null) e.style.opacity = clamp(o.o, 0, 1).toFixed(3); };
  const BG = mk('div', 'lay', ST);
  const CAM = mk('div', 'lay', ST, { transformOrigin: '540px 900px' });    // caméra : poussée et orbite lentes, jamais à l'arrêt

  // texte cinétique (presente30) : mots dans un masque, lettres qui montent ; sortie vers le haut
  function KT(parent, y, size, segs, color = '#fff') {
    if (typeof segs === 'string') segs = [[segs, {}]];
    const box = mk('div', 'kt', parent, { top: y + 'px', fontSize: size + 'px', color });
    const ln = mk('div', 'ln', box), words = [];
    for (const [txt, sty = {}] of segs) for (const wd of txt.split(' ')) {
      if (!wd) continue;
      const w = mk('span', 'w m' + (sty.i ? ' i' : ''), ln, sty.c ? { color: sty.c } : null);
      words.push({ w, chars: [...wd].map((ch) => mk('span', 'c', w, null, ch.replace(/&/g, '&amp;').replace(/</g, '&lt;'))) });
    }
    const k = { box, words, size };
    if (box.offsetWidth > 740) { k.size = Math.floor(size * 740 / box.offsetWidth);   // 740 px : la poussée de caméra (× 1,08) reste dans la colonne 140 → 940
      box.style.fontSize = k.size + 'px'; }
    box.style.left = (540 - box.offsetWidth / 2) + 'px';
    return k;
  }
  function ktP(k, t, ins, out = null) {
    const S = k.size; let any = false;
    k.words.forEach((Wd, i) => {
      const ti = Array.isArray(ins) ? ins[Math.min(i, ins.length - 1)] : ins + i * 0.08;
      const to = out == null ? null : out + i * 0.035;
      const vis = t >= ti - 0.001 && !(to != null && t > to + 0.5); Wd.w.style.visibility = vis ? '' : 'hidden'; if (!vis) return; any = true;
      Wd.chars.forEach((c, j) => {
        const tj = ti + j * 0.022, p = E(t, tj, 0.42); let y = (1 - p) * S * 1.05; const r = (1 - p) * 7;
        if (to != null) y -= E(t, to + j * 0.011, 0.3, eIn) * S * 1.15;
        c.style.transform = `translateY(${y.toFixed(1)}px) rotate(${r.toFixed(2)}deg)`;
      });
    });
    k.box.style.display = any ? '' : 'none';
  }
  // compteur à rouleaux
  function ROLL(parent, size, from, to, color) {
    const box = mk('div', 'roll', parent, { fontSize: size + 'px', color }), cols = [];
    [...to].forEach((ch, k) => {
      if (/\d/.test(ch)) { const col = mk('span', 'col', box), strip = mk('span', 'strip', col); for (let r = 0; r < 30; r++) mk('span', '', strip, null, String(r % 10)); cols.push({ strip, fd: /\d/.test(from[k] || '') ? +from[k] : 0, td: +ch }); }
      else mk('span', '', box, { whiteSpace: 'pre' }, ch === ' ' ? '&nbsp;' : ch);
    });
    return { box, cols, size };
  }
  const rollP = (R, t, t0, d = 0.7, stag = 0.06) => R.cols.forEach((c, k) => { const v = c.fd + ((((c.td - c.fd) % 10) + 10) % 10 + (c.td === c.fd ? 0 : 10)) * E(t, t0 + k * stag, d); c.strip.style.transform = `translateY(${(-v * R.size).toFixed(1)}px)`; });

  // ---------- repères sonores publiés pour le mixage ----------
  const CUES = [], cue = (t, k, g = 1) => { if (t >= 0 && t < DUR) CUES.push({ t: +t.toFixed(3), k, g }); };
  // fenêtres de gestes rapides : obturateur ouvert (360°), 8 sous-images
  const FAST = [];
  const win = (a, b) => FAST.push([a, b]);

  // ---------- fond : coupes de couleur sur les temps forts (jamais de fondu) ----------
  const bgAt = (t) => (t < T.colles + 0.1 ? 'var(--k)' : t < T.passe ? 'var(--o)' : t < T.et ? 'var(--w)' : t < T.toi ? 'var(--k)' : t < T.une ? 'var(--nuit)' : t < T.recois ? 'var(--k)' : t < T.uto2 ? 'var(--w)' : 'var(--k)');

  // =====================================================================================================
  // A · 0 → « Tu colles » : la 208, l'étiquette percée, le prix qui ment ; zoom-éclair à travers le trou
  // =====================================================================================================
  const A = mk('div', 'lay', CAM);
  const flou = mk('img', 'a', A, { width: '1080px', height: '1920px', opacity: 0.55 }); flou.src = '../assets/presente-v/208-flou.jpg';
  const carW = mk('div', 'a', A, { width: '980px', height: '584px' });
  const car = mk('img', 'a', carW, { width: '980px', filter: 'drop-shadow(0 50px 40px rgba(0,0,0,.55))' }); car.src = '../assets/hooks-cut/208-annonce-cut.png';
  const ctx = mk('div', 'a ctx', A, { color: 'rgba(244,241,236,.72)', width: '1080px', textAlign: 'center', top: '236px' }, 'Achat-revente auto');
  const kA = KT(A, 300, 132, 'Ce prix ment.');
  const menA = mk('div', 'a men', A, { color: 'rgba(244,241,236,.8)', width: '1080px', textAlign: 'center', top: '1432px' }, 'Données de démonstration');
  // étiquette : le trou est un masque ; elle pend à sa ficelle et oscille autour du trou
  const HX = 612, HY = 684;                    // centre du trou à l'écran (= le point orange porteur)
  const str = mk('div', 'a', A, { width: '3px', height: HY + 'px', background: 'rgba(255,255,255,.75)', left: (HX - 1.5) + 'px', top: '0px', transformOrigin: '50% 100%' });
  const tag = mk('div', 'a', A, { width: '470px', height: '236px', left: (HX - 235) + 'px', top: (HY - 44) + 'px', borderRadius: '30px', background: '#fff', transformOrigin: '235px 44px',
    WebkitMaskImage: 'radial-gradient(circle at 235px 44px, transparent 22px, #000 23px)', boxShadow: '0 40px 80px -30px rgba(0,0,0,.6)', padding: '78px 0 0 40px' });
  const tagSub = mk('div', '', tag, { font: '700 24px Satoshi', letterSpacing: '.16em', opacity: 0.55, color: 'var(--ink)' }, 'ANNONCE');
  const tagRoll = ROLL(tag, 104, '7 190 €', '8 840 €', 'var(--ink)'); Object.assign(tagRoll.box.style, { position: 'relative', marginTop: '6px' });
  tagRoll.cols.forEach((c) => (c.fd = c.fd));
  // le prix affiché : 7 190 (rouleaux posés sur 7 1 9 0)
  const PRIX0 = [7, 1, 9, 0]; tagRoll.cols.forEach((c, k) => { c.fd = PRIX0[k]; });
  // goutte « +1 650 € » : formes pleines dans le filtre « goo », texte au-dessus (jamais de texte dans le filtre)
  const goo = mk('div', 'a', A, { left: (HX - 120) + 'px', top: (HY + 150) + 'px', width: '240px', height: '320px', filter: 'url(#goo)' });
  const gNeck = mk('div', 'a', goo, { left: '100px', top: '0px', width: '40px', height: '60px', borderRadius: '20px', background: 'var(--r)' });
  const gDrop = mk('div', 'a', goo, { left: '30px', top: '0px', width: '180px', height: '180px', borderRadius: '50%', background: 'var(--r)' });
  const gTxt = mk('div', 'a', A, { width: '240px', textAlign: 'center', font: '700 46px/1 Clash', color: '#fff', letterSpacing: '-.03em', left: (HX - 120) + 'px' }, '+1 650 €<div style="font:700 20px Satoshi;letter-spacing:.12em;opacity:.85;margin-top:8px">TRAVAUX</div>');
  cue(0, 'impact', 0.9); cue(T.p7190 - 0.05, 'pop', 0.7); cue(T.p8840 - 0.08, 'roll', 1); cue(T.p8840 + 0.45, 'thud', 0.8);
  const tZ = T.colles - 0.24;                   // zoom-éclair : ×28 en 0,28 s autour du trou
  win(tZ - 0.05, tZ + 0.4); cue(tZ - 0.02, 'whoosh', 1); cue(tZ + 0.3, 'impact', 0.7);
  const zoomS = (t) => 1 + 27 * E(t, tZ, 0.3, eIn);
  function paintA(t, tl) {   // tl : temps local (la boucle repeint A avec tl < 0, juste avant l'image 0)
    const vis = show(A, tl < tZ + 0.32); if (!vis) return;
    const sw = 7 * Math.exp(-Math.max(0, tl + 0.4) * 0.45) * Math.sin((tl + 0.4) * 3.4) + 2.5 * bump(tl, T.p8840 - 0.05, 0.3) * Math.sin(tl * 9);  // pendule amorti, relancé par le prix
    const Z = zoomS(tl);
    // caméra de la scène : poussée lente + orbite 3D de la voiture ; pendant le zoom tout grossit vers le trou
    const push = 1 + 0.08 * eIO(clamp((tl + 0.6) / 5.6, 0, 1)) + 0.02 * clamp((tl + 0.6) / 5.6, 0, 1);
    A.style.transformOrigin = `${HX}px ${HY}px`; A.style.transform = `scale(${(push * (1 + 0.6 * E(tl, tZ, 0.3, eIn))).toFixed(4)})`;
    tf(flou, -30 * clamp((tl + 0.6) / 5.6, 0, 1), 0, { s: 1.08 + 0.08 * clamp((tl + 0.6) / 5.6, 0, 1) });   // le fond glisse 3 fois moins vite que la voiture
    { const q = clamp((tl + 0.6) / 5.6, 0, 1); tf(carW, 50 + 90 * q - 45, 770 - 20 * q + 8 * Math.sin(tl * 0.7), { p: 1, ry: 26 - 36 * q, rx: 4 * Math.sin(tl * 0.5), r: -1.5 + 3 * q }); }
    // titre : sort du masque juste avant l'image 0 ; il s'efface vers le haut avant le zoom
    ktP(kA, tl, -0.32, tZ - 0.15);
    ctx.style.opacity = (tl < tZ - 0.1 ? 1 : 0);
    menA.style.opacity = (tl < tZ - 0.1 ? 1 : 0);
    // étiquette : oscille, puis grossit ×28 autour du trou
    str.style.transform = `rotate(${(-sw * 0.25).toFixed(2)}deg)`;
    tag.style.transform = `rotate(${(-7 + sw + 11 * E(tl, T.p8840 - 0.05, 0.4)).toFixed(2)}deg) scale(${Z.toFixed(3)})`;
    const red = tl >= T.p8840 - 0.02; tagSub.textContent = red ? 'PRIX RÉEL' : 'ANNONCE'; tagSub.style.color = red ? 'var(--r)' : 'var(--ink)';
    tagRoll.box.style.color = red ? 'var(--r)' : 'var(--ink)';
    rollP(tagRoll, tl, T.p8840 - 0.08, 0.7, 0.07);
    // goutte : naît dans l'étiquette, s'étire (pont), se détache, tombe en arc et rebondit légèrement
    const gp = E(tl, T.p8840 + 0.1, 0.55), gd = SP(tl, T.p8840 + 0.1, 'default');
    const gy = 40 + 170 * gd, nk = clamp(1 - E(tl, T.p8840 + 0.45, 0.2), 0, 1);
    show(goo, tl > T.p8840 + 0.05 && tl < tZ); show(gTxt, tl > T.p8840 + 0.3 && tl < tZ);
    gDrop.style.transform = `translateY(${gy.toFixed(1)}px) scale(${(0.35 + 0.65 * gp).toFixed(3)},${(0.35 + 0.65 * gp + 0.12 * bump(tl, T.p8840 + 0.5, 0.2)).toFixed(3)})`;
    gNeck.style.transform = `scaleY(${(1 + 2.2 * gd * nk).toFixed(3)})`; gNeck.style.opacity = nk.toFixed(3);
    gTxt.style.top = (HY + 150 + gy + 52) + 'px'; gTxt.style.opacity = E(tl, T.p8840 + 0.3, 0.2).toFixed(3);
  }

  // =====================================================================================================
  // B · « Tu colles l'annonce dans utopicar » : on débouche dans le trou (orange) ; le champ naît du point
  // =====================================================================================================
  const B = mk('div', 'lay', CAM);
  const kB = KT(B, 300, 132, [['Colle', {}], ["l'annonce.", { i: 1, c: 'var(--k)' }]]);
  const kB2 = KT(B, 1090, 64, 'dans utopicar', '#1a1310');
  const field = mk('div', 'a', B, { background: '#fff', boxShadow: '0 40px 80px -30px rgba(26,19,16,.55)', overflow: 'hidden' });
  const url = mk('div', 'a', field, { left: '44px', top: '43px', font: '500 34px Satoshi', color: '#1c1612', whiteSpace: 'nowrap' });
  const URL = '…/annonce/peugeot-208-1-2-puretech'; const urlC = [...URL].map((ch) => mk('span', '', url, null, ch));
  const caret = mk('span', '', url, { display: 'inline-block', width: '3px', height: '38px', background: 'var(--o)', verticalAlign: 'middle', marginLeft: '4px' });
  const btn = mk('div', 'a', field, { height: '104px', width: '220px', borderRadius: '999px', background: '#1a1310', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 38px Clash', top: '14px' }, 'Analyser');
  // la fiche du vrai site : séquence 30 i/s capturée en 3×, la carte prend la hauteur du contenu
  const card = mk('div', 'a', B, { overflow: 'hidden', background: '#fff' });
  const cimg = mk('img', 'a', card, { width: '680px' });
  const SEQI = SEQ.map((_, i) => { const im = new Image(); im.src = `../assets/presente-v/seq/f${String(i).padStart(3, '0')}.jpg`; return im; });
  await Promise.all(SEQI.map((im) => im.decode().catch(() => {})));
  const HL = [0, 1, 2, 3].map(() => mk('div', 'a', card, { border: '6px solid var(--o)', borderRadius: '16px', left: '10px', width: '660px' }));
  const kB3 = KT(B, 300, 132, '2 secondes.');
  const kB4 = KT(B, 290, 160, 'Passe.', 'var(--r)');
  const menB = mk('div', 'a men', B, { width: '1080px', textAlign: 'center', top: '1446px' }, 'Données de démonstration');
  // géométrie du champ puis de la carte : bords sur deux ressorts (le bord avant part, le bord arrière suit)
  const tF = T.colles + 0.05, tClick = T.uto + 0.42, tCard = tClick + 0.14;
  const SEQ0 = T.deux + 0.45 - 1.16;            // la fiche du site passe de la liste de contrôle à la fiche complète vers « secondes »
  const seqK = (t) => clamp(Math.floor((t - SEQ0) * 30), 0, SEQ.length - 1);
  const cardH = (t) => (CW / 360) * SEQ[seqK(t)].h;    // 360 px CSS → 680 px
  const CW = 680, CX0 = 200, CY0 = 470;
  // lignes de la fiche (séparateurs mesurés au pixel sur la dernière image de la séquence, en px de la carte 720)
  const ROWS = [[433, 548], [555, 700], [708, 822], [832, 976]].map(([a, b]) => [a * CW / 720, b * CW / 720]);   // séparateurs à 551 · 704 · 825 (carte de 720)
  cue(tF, 'whoosh', 0.7); cue(tClick, 'click', 1); cue(tCard + 0.05, 'whoosh', 0.7); win(tCard - 0.02, tCard + 0.35);
  for (let i = 0; i < 18; i += 3) cue(tF + 0.25 + i * 0.03, 'type', 0.5);
  cue(T.cote - 0.03, 'pop', 0.8); cue(T.trav - 0.03, 'pop', 0.8); cue(T.vrai - 0.03, 'pop', 0.8); cue(T.verdict - 0.03, 'pop', 0.9); cue(T.passe - 0.02, 'impact', 1.1);
  function rectAt(t) {   // rectangle de l'objet porteur pendant B (x, y, w, h, rayon)
    // point (centre du trou) → champ
    const P0 = { x: 540, y: 946, w: 0, h: 0, r: 66 }, F1 = { x: 140, y: 880, w: 800, h: 132, r: 66 };
    const lead = SP(t, tF, 'snappy'), trail = SP(t, tF + 0.06, 'default');
    let L = lerp(P0.x, F1.x, lead), R = lerp(P0.x, F1.x + F1.w, trail), Tt = lerp(P0.y - 6, F1.y, trail), Bb = lerp(P0.y + 6, F1.y + F1.h, lead), rad = F1.r;
    if (t >= tCard) {   // champ → carte : le haut part le premier, le bas suit (et suit ensuite la hauteur du contenu)
      const a = SP(t, tCard, 'snappy'), b = SP(t, tCard + 0.06, 'default');
      L = lerp(F1.x, CX0, a); R = lerp(F1.x + F1.w, CX0 + CW, b); Tt = lerp(F1.y, CY0, a); Bb = lerp(F1.y + F1.h, CY0 + cardH(t), b); rad = lerp(66, 30, a);
    }
    return { x: L, y: Tt, w: Math.max(0, R - L), h: Math.max(0, Bb - Tt), r: rad };
  }
  function paintB(t) {
    const vis = show(B, t >= tZ + 0.1 && t < T.et - 0.02); if (!vis) return;
    // on débouche dans le trou : la scène B est dévoilée par un cercle qui grandit depuis le trou
    const rv = 22 * zoomS(t) + 2400 * E(t, tZ + 0.18, 0.22, eIn); B.style.clipPath = rv < 2300 ? `circle(${rv.toFixed(0)}px at ${HX}px ${HY}px)` : '';
    B.style.transformOrigin = '540px 900px'; B.style.transform = `scale(${(1 + 0.03 * clamp((t - tZ) / (T.et - tZ), 0, 1)).toFixed(4)})`;
    ktP(kB, t, [T.colles, T.colles + 0.12], T.deux - 0.36);
    ktP(kB2, t, T.dans, tCard);
    ktP(kB3, t, T.deux, T.verdict - 0.1);
    ktP(kB4, t, T.passe, T.et + 0.05);
    menB.style.color = t >= T.passe ? 'rgba(28,22,18,.75)' : 'rgba(26,19,16,.75)'; show(menB, t > T.cote - 0.2 && t < T.et + 0.1);
    const r = rectAt(t), fieldMode = t < tCard;
    show(field, fieldMode && t > tF); show(card, !fieldMode);
    // à « Et » : la carte se replie en point (C reprend le point)
    if (fieldMode) {
      Object.assign(field.style, { width: r.w + 'px', height: r.h + 'px', borderRadius: r.r + 'px' }); tf(field, r.x, r.y);
      const n = Math.floor(clamp((t - (tF + 0.25)) / 0.55, 0, 1) * urlC.length); urlC.forEach((c, i) => (c.style.visibility = i < n ? '' : 'hidden'));
      caret.style.opacity = (Math.floor(t * 4) % 2 || n < urlC.length) ? 1 : 0; url.style.opacity = E(t, tF + 0.2, 0.15).toFixed(3);
      const sq = bump(t, tClick - 0.02, 0.1);   // écraser-étirer au clic
      btn.style.left = (r.w - 234) + 'px'; btn.style.opacity = E(t, tF + 0.3, 0.2).toFixed(3);
      btn.style.transform = `scale(${(1 + 0.18 * sq).toFixed(3)},${(1 - 0.28 * sq).toFixed(3)})`;
    } else {
      Object.assign(card.style, { width: r.w + 'px', height: r.h + 'px', borderRadius: r.r + 'px' });
      const fl = E(t, tCard + 0.3, 0.8);   // la carte posée flotte en 3D (rien ne s'arrête)
      tf(card, r.x, r.y + fl * 14 * Math.sin((t - tCard) * 1.3), { p: 1, ry: fl * 8 * Math.sin((t - tCard) * 1.1), rx: fl * 5 * Math.sin((t - tCard) * 0.9 + 1), r: fl * 1.2 * Math.sin((t - tCard) * 0.8) });
      card.style.boxShadow = '0 60px 110px -30px rgba(26,19,16,.55)';
      cimg.src = SEQI[seqK(t)].src; cimg.style.opacity = E(t, tCard + 0.08, 0.15).toFixed(3);
      // surlignages : un par mot ; bords sur deux ressorts depuis la gauche
      [T.cote, T.trav, T.vrai, T.verdict].forEach((tw, i) => {
        const [y0, y1] = ROWS[i], a = SP(t, tw - 0.04, 'snappy'), b = SP(t, tw + 0.02, 'default');
        show(HL[i], t > tw - 0.05);
        Object.assign(HL[i].style, { top: (y0 * 1) + 'px', height: (y1 - y0) + 'px', width: (660 * a) + 'px', borderColor: i === 3 ? 'var(--r)' : 'var(--o)', opacity: (0.35 + 0.65 * b).toFixed(2) });
      });
    }
  }

  // =====================================================================================================
  // C · le mur d'annonces : la fiche se replie en point, le mur défile, le point l'arrête ; l'onde, la nuit, la pépite
  // =====================================================================================================
  const C = mk('div', 'lay', CAM);
  const wall = mk('div', 'a', C, { width: '1080px', height: '1920px', WebkitMaskImage: 'linear-gradient(#000 1340px, transparent 1560px)' });
  const COLS = 3, ROWSN = 16, CWl = 250, CHl = 126, GX = 25, GY = 22, X0 = 540 - (COLS * CWl + (COLS - 1) * GX) / 2;
  const cells = [];
  for (let r = 0; r < ROWSN; r++) for (let c = 0; c < COLS; c++) {
    const m = MUR[(r * COLS + c * 7) % MUR.length];
    const e = mk('div', 'cell', wall, null, `<div class="m">${m.marque} ${m.modele}</div><div class="s">${m.annee} · ${m.km.toLocaleString('fr-FR').replace(/ /g, ' ')} km</div><div class="p">${m.prix.toLocaleString('fr-FR').replace(/ /g, ' ')} €</div>`);
    cells.push({ e, c, r, x: X0 + c * (CWl + GX), y: r * (CHl + GY) });
  }
  const shade = mk('div', 'a', C, { width: '1080px', height: '640px', background: 'linear-gradient(var(--k) 62%, transparent)' });
  const kC1 = KT(C, 300, 110, 'Les bonnes affaires ?');
  const kC2 = KT(C, 300, 110, 'Arrête de scroller.');
  const kC3 = KT(C, 270, 112, 'Ta recherche'), kC4 = KT(C, 390, 120, [['tourne seule.', { i: 1, c: 'var(--o)' }]]);
  const kC5 = KT(C, 470, 140, 'Toi, tu dors.'), kC6 = KT(C, 640, 150, [['Lui, il bosse.', { i: 1, c: 'var(--o)' }]]);
  const kC7 = KT(C, 300, 120, 'Sous la cote ?');
  const ring = mk('div', 'a', C, { width: '200px', height: '200px', borderRadius: '50%', border: '6px solid rgba(255,90,31,.3)', borderTopColor: 'var(--o)', borderRightColor: 'var(--o)' });
  const pillJ = mk('div', 'a pill', C, { font: '700 32px Satoshi', color: '#fff', background: 'rgba(14,11,9,.88)', border: '2px solid rgba(255,90,31,.6)' }, 'plusieurs fois par jour');
  const clock = ROLL(C, 150, '00:00', '03:12', '#fff'); clock.box.style.textShadow = '0 10px 30px rgba(0,0,0,.4)';
  const CLK0 = [2, 3, 4, 7]; clock.cols.forEach((c, k) => { c.fd = CLK0[k]; });
  const gem = mk('div', 'cell', C, { width: '560px', height: '300px', padding: '34px 40px', borderRadius: '40px', border: '6px solid #fff', boxShadow: '0 60px 120px -20px rgba(0,0,0,.8)' },
    `<div class="m" style="font-size:44px">Renault Clio IV</div><div class="s" style="font-size:30px;margin-top:8px">2016 · 112 000 km · Diesel</div><div class="p" style="font-size:72px;margin-top:20px">6 400 €</div>`);
  const pillC = mk('div', 'a pill', C, { background: 'var(--ok)', color: '#fff', fontSize: '36px' }, '1 450 € sous la cote');
  const menC = mk('div', 'a men', C, { color: 'rgba(244,241,236,.85)', background: 'rgba(14,11,9,.85)', padding: '6px 16px', borderRadius: '10px', left: '540px', top: '1440px' }, 'Données de démonstration');
  const DOT = mk('div', 'a', ST, { background: 'var(--o)' });     // le point porteur (au-dessus de tout)
  const DX = 540, DY = 1000;
  // défilement du mur : accélère depuis « Et », s'arrête net sur « scroller » (léger dépassement, ressort)
  const tStop = T.scroller + 0.02;
  const scrollY = (t) => { if (t < T.et) return 0; const v = (tt) => 900 * Math.pow(clamp(tt - T.et, 0, 9), 2) * 0.9 + 600 * clamp(tt - T.et, 0, 9);
    if (t < tStop) return v(t); return v(tStop) + 60 * SP(t, tStop, 'default') + 38 * Math.max(0, t - tStop - 0.4); };   // il dérive ensuite lentement (rien ne s'arrête)
  win(T.et, tStop + 0.15);
  cue(T.et - 0.02, 'whoosh', 0.8); cue(tStop - 0.02, 'tapestop', 1); cue(tStop, 'thud', 1);
  const waves = [T.tourne, T.plus, T.jour, T.lui, T.bosse];
  waves.forEach((w, i) => cue(w, 'roll', i < 3 ? 0.55 : 0.4));
  cue(T.toi - 0.02, 'whoosh', 0.7); cue(T.une, 'pop', 0.9); cue(T.cote2 - 0.03, 'ding', 0.9);
  // point porteur : géométrie selon le temps
  function dotAt(t) {
    if (t >= T.et - 0.02 && t < T.et + 0.5) {   // la carte se replie en point (bords sur deux ressorts)
      const r = rectAt(T.et - 0.02), a = SP(t, T.et - 0.02, 'snappy'), b = SP(t, T.et + 0.04, 'default');
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      const L = lerp(r.x, cx - 30, a), R = lerp(r.x + r.w, cx + 30, b), Tt = lerp(r.y, cy - 30, b), Bb = lerp(r.y + r.h, cy + 30, a);
      return { x: L, y: Tt, w: R - L, h: Bb - Tt, rad: 30, col: a < 0.55 ? '#fff' : 'var(--o)', o: 1 };   // la fiche (blanche) devient le point orange
    }
    if (t >= T.et + 0.5 && t < tStop + 0.6) {   // le point monte puis tombe en arc et arrête le mur (écraser à l'impact)
      const r = rectAt(T.et - 0.02), sx = r.x + r.w / 2, sy = r.y + r.h / 2;
      const q = clamp((t - (T.et + 0.5)) / (tStop - (T.et + 0.5)), 0, 1), qq = eIn(q) * 0.7 + q * 0.3;
      const x = lerp(sx, DX, qq), y = lerp(sy, DY, qq) - 260 * Math.sin(Math.PI * q);
      const im = bump(t, tStop - 0.01, 0.12), v = Math.abs(qq - (eIn(clamp(q - 0.02, 0, 1)) * 0.7 + (q - 0.02) * 0.3));
      const st = clamp(v * 25, 0, 0.6) * (1 - im);
      return { x: x - 30, y: y - 30, w: 60 * (1 + st + 0.18 * im), h: 60 * (1 - st * 0.5 - 0.28 * im), rad: 30, col: 'var(--o)', o: 1 };
    }
    if (t >= tStop + 0.6 && t < T.une + 0.1) return { x: DX - 30, y: DY - 30, w: 60, h: 60, rad: 30, col: 'var(--o)', o: 1, s: 1 + 0.12 * Math.max(...waves.map((w) => bump(t, w, 0.18))) };
    return null;
  }
  function paintC(t) {
    const vis = show(C, t >= T.et - 0.05 && t < T.recois + 0.6); if (!vis) return;
    C.style.transformOrigin = '540px 1000px'; C.style.transform = `scale(${(1 + 0.06 * clamp((t - tStop) / (T.recois - tStop), 0, 1)).toFixed(4)})`;
    const sY = scrollY(t), span = ROWSN * (CHl + GY);
    const night = t >= T.toi && t < T.une, gemOn = t >= T.une;
    cells.forEach((k) => {
      let y = ((k.y - sY) % span + span) % span + 380, s = 1, o = 0.85, bc = 'rgba(244,241,236,.09)';
      const cx = k.x + CWl / 2, cy = y + CHl / 2, d = Math.hypot(cx - DX, cy - DY);
      // ondes : retard = distance × 0,0015 s ; une onde par passage de la recherche
      let wv = 0; for (const w of waves) { const a = t - w - d * 0.0015; if (a > 0 && a < 0.6) wv = Math.max(wv, Math.sin(Math.PI * a / 0.6)); }
      s = 1 + 0.16 * wv; bc = `rgba(255,90,31,${(0.12 + 0.8 * wv).toFixed(2)})`; o = (night ? 0.35 : 0.85) * (0.75 + 0.25 * wv);
      if (gemOn) o *= 1 - 0.7 * E(t, T.une, 0.3);
      k.e.style.borderColor = bc; tf(k.e, k.x, y, { s, o });
    });
    shade.style.background = `linear-gradient(${bgAt(t)} 62%, transparent)`;
    ktP(kC1, t, T.bonnes, T.arrete - 0.36); ktP(kC2, t, T.arrete, T.rech - 0.36);
    ktP(kC3, t, T.rech, T.toi - 0.36); ktP(kC4, t, T.tourne, T.toi - 0.36);
    ktP(kC5, t, T.toi, T.une - 0.36); ktP(kC6, t, T.lui, T.une - 0.36);
    ktP(kC7, t, T.sous, T.recois - 0.1);
    // anneau qui tourne autour du point : un tour = un passage
    const rOn = t > T.rech - 0.1 && t < T.une;
    show(ring, rOn); if (rOn) { const ang = 360 * (t - T.rech) / 0.9; tf(ring, DX - 100, DY - 100, { r: ang, o: E(t, T.rech - 0.1, 0.3) * (1 - E(t, T.une - 0.25, 0.2)) }); }
    show(pillJ, t > T.plus - 0.05 && t < T.toi); tf(pillJ, 540, DY + 170, { c: 1, s: 0.6 + 0.4 * SP(t, T.plus - 0.05, 'default'), o: E(t, T.plus - 0.05, 0.15) });
    show(clock.box, night); if (night) { rollP(clock, t, T.toi + 0.2, 1.6, 0.12); tf(clock.box, 540, 1250, { c: 1, o: E(t, T.toi, 0.2) }); }
    show(gem, gemOn && t < T.recois + 0.05); show(pillC, t > T.cote2 - 0.05 && t < T.recois);
    if (gemOn) { const a = SP(t, T.une, 'default'), b = SP(t, T.une + 0.06, 'heavy');
      tf(gem, lerp(DX, 540, b), lerp(DY, 900, b), { c: 1, s: 0.18 + 0.82 * a, r: -3 * a }); tf(pillC, 540, 1110, { c: 1, r: -3, s: 0.6 + 0.4 * SP(t, T.cote2 - 0.05, 'snappy'), o: E(t, T.cote2 - 0.05, 0.12) }); }
    show(menC, gemOn); tf(menC, 0, 0, { c: 0 }); menC.style.transform = 'translateX(-50%)';
  }

  // =====================================================================================================
  // D · « Tu reçois un mail » : la pépite se déplie en vrai e-mail d'alerte ; clic sur « appeler »
  // =====================================================================================================
  const Dd = mk('div', 'lay', CAM);
  const kD = KT(Dd, 290, 120, 'Tu reçois', 'var(--ink)'), kD2 = KT(Dd, 410, 130, [['un mail.', { i: 1, c: 'var(--o)' }]], 'var(--ink)');
  const MAILH = `<div style="max-width:560px;margin:0 auto;font:14px Arial,sans-serif;color:#1d1d1f">
    <p style="font-size:18px;margin:0 0 4px"><b>1 nouvelle annonce</b></p><p style="margin:0 0 12px;color:#555">Recherche « Clio IV diesel »</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:10px 0;border-bottom:1px solid #e5e5e5"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="padding-right:12px;vertical-align:top"><img src="../assets/presente-v/clio4-mail.jpg" width="120" style="border-radius:6px;display:block;width:120px;height:auto" alt=""></td>
    <td style="vertical-align:top;font:14px/1.45 Arial,sans-serif;color:#1d1d1f"><a id="lien" style="color:#15307f;font-weight:bold;text-decoration:none">Renault Clio IV 1.5 dCi 90 Limited</a><br>
    <b style="font-size:16px">6 400 €</b><br><span style="color:#555">2016 · 112 000 km · Diesel · Manuelle</span><br><span style="color:#777">Lyon 69003</span><br>
    <span style="color:#0a7a43;font-weight:bold">1 450 € sous la cote</span> <span style="color:#777">(cote 7 850 € sur 23 annonces)</span></td></tr></table></td></tr></table>
    <p style="margin:18px 0"><a style="background:#ff5a1f;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:bold">Voir mes alertes sur utopicar</a></p></div>`;
  const mailBox = mk('div', 'a', Dd, { overflow: 'hidden', background: '#fff', boxShadow: '0 50px 90px -30px rgba(28,22,18,.5),0 0 0 1px rgba(28,22,18,.06)' });
  const mailIn = mk('div', 'a', mailBox, { width: '500px', padding: '26px 20px 8px', transformOrigin: '0 0', transform: 'scale(1.72)' }, MAILH);
  const MW = 860, MH = Math.ceil(mailIn.offsetHeight * 1.72), MX = 110, MY = 650;
  const menD = mk('div', 'a men', Dd, { color: 'rgba(28,22,18,.75)', width: '1080px', textAlign: 'center', top: '1432px' }, 'Données de démonstration');
  const CURS = mk('div', 'a', Dd, null, '<svg width="64" height="82" viewBox="0 0 28 36"><path d="M3 2 L3 29 L10 22.5 L14.8 33 L19.4 31 L14.7 20.8 L24 20.3 Z" fill="#0C0F14" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>');
  const rip = mk('div', 'a', Dd, { width: '170px', height: '170px', borderRadius: '50%', border: '6px solid var(--o)' });
  const lien = mailIn.querySelector('#lien');
  cue(T.recois - 0.02, 'whoosh', 0.7); cue(T.mail, 'ding', 1); cue(T.appeler, 'click', 1);
  function paintD(t) {
    const vis = show(Dd, t >= T.recois - 0.05 && t < T.uto2 + 0.5); if (!vis) return;
    ktP(kD, t, T.recois, T.uto2 - 0.1); ktP(kD2, t, T.mail, T.uto2 - 0.1);
    // la pépite (560×300 au centre) se déplie en e-mail : bords sur deux ressorts
    const g = { x: 540 - 280, y: 900 - 150, w: 560, h: 300 }, a = SP(t, T.recois, 'snappy'), b = SP(t, T.recois + 0.06, 'default');
    let L = lerp(g.x, MX, a), R = lerp(g.x + g.w, MX + MW, b), Tt = lerp(g.y, MY, b), Bb = lerp(g.y + g.h, MY + MH, a);
    // repli final en point (vers le centre du logo)
    if (t >= T.uto2 - 0.12) { const c = SP(t, T.uto2 - 0.12, 'snappy'), d = SP(t, T.uto2 - 0.06, 'default'), cx = 540, cy = 760;
      L = lerp(L, cx - 30, c); R = lerp(R, cx + 30, d); Tt = lerp(Tt, cy - 30, d); Bb = lerp(Bb, cy + 30, c); }
    Object.assign(mailBox.style, { width: (R - L) + 'px', height: (Bb - Tt) + 'px', borderRadius: (t >= T.uto2 - 0.12 ? lerp(26, 30, E(t, T.uto2 - 0.12, 0.2)) : 26) + 'px' });
    mailBox.style.background = t >= T.uto2 - 0.06 ? 'var(--o)' : '#fff';
    mailIn.style.opacity = (E(t, T.recois + 0.12, 0.2) * (1 - E(t, T.uto2 - 0.14, 0.08))).toFixed(3);
    const fl = E(t, T.recois + 0.4, 0.8);
    tf(mailBox, L, Tt + fl * 12 * Math.sin((t - T.recois) * 1.4), { p: 1, ry: fl * 9 * Math.sin((t - T.recois) * 1.1), rx: fl * 4 * Math.sin((t - T.recois) * 0.9), r: fl * 1 * Math.sin((t - T.recois) * 0.7) });
    Dd.style.transformOrigin = '540px 900px'; Dd.style.transform = `scale(${(1 + 0.05 * clamp((t - T.recois) / (T.uto2 - T.recois), 0, 1)).toFixed(4)})`;
    show(menD, t < T.uto2 - 0.1);
    // curseur : arrive en arc sur le titre de l'annonce, clic sur « appeler »
    const lr = lien.getBoundingClientRect(), tx = MX + (lr.left - mailBox.getBoundingClientRect().left) + 0.55 * lr.width, ty = MY + (lr.top - mailBox.getBoundingClientRect().top) + 0.6 * lr.height;
    const q = E(t, T.appeler - 0.55, 0.5, eIO), cx = lerp(1000, tx, q), cy = lerp(1500, ty, q) - 120 * Math.sin(Math.PI * q);
    show(CURS, t > T.appeler - 0.6 && t < T.uto2 - 0.1); tf(CURS, cx - 6, cy - 4, { s: 1 - 0.16 * bump(t, T.appeler - 0.05, 0.11) });
    const ra = t - T.appeler; show(rip, ra > 0 && ra < 0.6); if (ra > 0) { const qq = eOut(ra / 0.55); tf(rip, tx, ty, { c: 1, s: 0.2 + 1.5 * qq, o: 1 - qq }); }
  }

  // =====================================================================================================
  // E · fin : le point devient le logo, « Achète juste. Revends mieux. », lien en bio ; puis retour à l'image 0
  // =====================================================================================================
  const Ee = mk('div', 'lay', CAM);
  const kE = KT(Ee, 960, 110, 'Achète juste.'), kE2 = KT(Ee, 1080, 120, [['Revends mieux.', { i: 1, c: 'var(--o)' }]]);
  const bio = mk('div', 'a pill', Ee, { background: '#fff', color: 'var(--ink)' }, 'lien en bio');
  const NS = 'http://www.w3.org/2000/svg', FX = document.getElementById('fx'); let FID = 0;
  function logo(parent, cx, cy, w) {   // presente30 : le vrai SVG découpé en pièces
    const holder = mk('div', 'a', parent, { width: w + 'px' }); holder.innerHTML = LOGO;
    const svg = holder.querySelector('svg'); svg.style.width = w + 'px'; svg.style.height = 'auto'; svg.style.overflow = 'visible'; svg.style.display = 'block';
    const g = (el) => { const wr = document.createElementNS(NS, 'g'); el.parentNode.insertBefore(wr, el); wr.appendChild(el); wr.style.transformBox = 'fill-box'; wr.style.transformOrigin = 'center'; return wr; };
    const icon = svg.querySelector('g'), rect = icon.querySelector('rect'), carL = icon.querySelector('g');
    const [body, slash, flick] = carL.querySelectorAll('path');
    const W_rect = g(rect), W_body = g(body), W_slash = g(slash), W_flick = g(flick);
    const cp = document.createElementNS(NS, 'clipPath'); cp.id = 'lc' + FID++; cp.innerHTML = '<rect width="512" height="512" rx="52"/>'; FX.appendChild(cp);
    const carWrap = g(carL); carWrap.setAttribute('clip-path', `url(#${cp.id})`); carWrap.style.transformBox = ''; carWrap.style.transformOrigin = '';
    const wordG = svg.querySelectorAll(':scope > g')[1], wp = wordG.querySelector('path'), fill = wp.getAttribute('fill');
    const subs = wp.getAttribute('d').split(/(?=M)/).filter(Boolean); wp.remove();
    const tmp = subs.map((d) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', fill); wordG.appendChild(p); const b = p.getBBox(); return { p, x0: b.x, x1: b.x + b.width }; });
    tmp.sort((a, b) => a.x0 - b.x0); const letters = [];
    for (const s of tmp) { const L = letters[letters.length - 1]; if (L && s.x0 < L.x1 - 5) { L.ps.push(s.p); L.x1 = Math.max(L.x1, s.x1); } else letters.push({ ps: [s.p], x0: s.x0, x1: s.x1 }); }
    const cp2 = document.createElementNS(NS, 'clipPath'); cp2.id = 'lw' + FID++; cp2.innerHTML = '<rect x="-100" y="-1000" width="5000" height="1400"/>'; FX.appendChild(cp2);
    wordG.setAttribute('clip-path', `url(#${cp2.id})`);
    for (const L of letters) { const lg = document.createElementNS(NS, 'g'), one = document.createElementNS(NS, 'path'); one.setAttribute('d', L.ps.map((p) => p.getAttribute('d')).join(' ')); one.setAttribute('fill', fill); L.ps.forEach((p) => p.remove()); lg.appendChild(one); wordG.appendChild(lg); L.g = lg; }
    return (t, t0) => {
      if (show(holder, t >= t0 - 0.01) === false) return;
      tf(holder, cx, cy, { c: 1, s: 1 + 0.03 * (1 - E(t, t0 + 0.6, 0.8)) });
      const ps = E(t, t0, 0.45), pb = E(t, t0 + 0.18, 0.5), pz = E(t, t0 + 0.42, 0.32), pf = E(t, t0 + 0.6, 0.3);
      W_rect.style.transform = `rotate(${(-28 * (1 - ps)).toFixed(2)}deg) scale(${ps.toFixed(4)})`;
      W_body.style.transform = `translateX(${(-1500 * (1 - pb)).toFixed(1)}px)`;
      W_slash.style.transform = `translateX(${(900 * (1 - pz)).toFixed(1)}px)`; W_slash.style.opacity = pz > 0 ? 1 : 0;
      W_flick.style.transform = `scale(${pf.toFixed(3)})`;
      letters.forEach((L, i) => { const p = E(t, t0 + 0.3 + i * 0.045, 0.45); L.g.style.transform = `translateY(${((1 - p) * 1100).toFixed(1)}px)`; });
    };
  }
  const LG = logo(Ee, 540, 760, 760);
  cue(T.uto2, 'impact', 1.1); cue(T.achete, 'pop', 0.7); cue(T.revends, 'pop', 0.8); cue(T.mieux + 0.45, 'pop', 0.6);
  cue(T.loop, 'suck', 0.9); cue(DUR - 0.22, 'whoosh', 0.8); win(T.loop - 0.05, DUR);
  function paintE(t) {
    const vis = show(Ee, t >= T.uto2 - 0.02 && t < DUR); if (!vis) return;
    // tout se replie vers le point, qui file vers le trou de l'étiquette (image 0)
    const out = E(t, T.loop, 0.35, eIn);
    const pe = clamp((t - T.uto2) / (T.loop - T.uto2), 0, 1);
    Ee.style.transformOrigin = '540px 760px'; Ee.style.transform = `translateY(${(-24 * pe).toFixed(1)}px) rotate(${(1.2 * Math.sin((t - T.uto2) * 0.9)).toFixed(3)}deg) scale(${((1 + 0.07 * pe) * (1 - 0.94 * out)).toFixed(4)})`; Ee.style.opacity = (1 - E(t, T.loop + 0.25, 0.1)).toFixed(3);
    LG(t, T.uto2 + 0.02);
    ktP(kE, t, T.achete); ktP(kE2, t, T.revends);
    show(bio, t > T.mieux + 0.4); tf(bio, 540, 1300 + 10 * Math.sin((t - T.mieux) * 2.2), { c: 1, s: (0.6 + 0.4 * SP(t, T.mieux + 0.4, 'snappy')) * (1 + 0.04 * Math.sin((t - T.mieux) * 3.1)), o: E(t, T.mieux + 0.4, 0.15) });
  }
  // boucle : un point file du centre du logo vers le trou de l'étiquette ; la scène A s'ouvre depuis lui
  function paintLoop(t) {
    if (t < T.loop + 0.2) return null;
    const q = E(t, T.loop + 0.2, DUR - T.loop - 0.25, eIO);
    return { x: lerp(540, HX, q) - 22, y: lerp(760, HY, q) - 22 - 180 * Math.sin(Math.PI * q), w: 44, h: 44, rad: 22, col: 'var(--o)', o: 1 };
  }

  // ---------- caméra, point porteur, seek ----------
  function paintDot(t) {
    const d = dotAt(t) || paintLoop(t);
    if (!show(DOT, !!d)) return;
    Object.assign(DOT.style, { width: d.w + 'px', height: d.h + 'px', borderRadius: Math.min(d.rad, d.w / 2, d.h / 2) + 'px', background: d.col });
    tf(DOT, d.x, d.y, { s: d.s ?? 1, o: d.o });
  }
  window.seek = (t) => {
    BG.style.background = t >= DUR - 0.3 ? 'var(--k)' : bgAt(t);
    // caméra : orbite lente permanente + poussée (amplitude réduite : textes dans la colonne 140 → 940)
    const orb = `perspective(2200px) rotateY(${(1.6 * Math.sin(t * 0.42)).toFixed(3)}deg) rotateX(${(1.1 * Math.sin(t * 0.31 + 1)).toFixed(3)}deg)`;
    CAM.style.transform = `${orb} scale(${(1.0 + 0.012 * Math.sin(t * 0.5)).toFixed(4)})`;
    // A : début, puis la boucle repeint l'image 0 (temps local juste avant 0) dévoilée depuis le point
    if (t >= DUR - 0.3) { paintA(t, t - DUR); const q = E(t, DUR - 0.3, 0.27, eIO); A.style.clipPath = `circle(${(22 + 2300 * q).toFixed(0)}px at ${HX}px ${HY}px)`; }
    else { A.style.clipPath = ''; paintA(t, t); }
    paintB(t); paintC(t); paintD(t); paintE(t); paintDot(t);
  };
  // flou de bougé : obturateur 180° partout, 360° sur les gestes rapides
  const inWin = (t) => FAST.some(([a, b]) => t >= a && t <= b);
  window.shutter = (t) => (inWin(t) ? 1 : 0.5);
  window.samples = (t) => (inWin(t) ? 8 : 4);
  window.filmDur = DUR; window.T = T;
  window.cues = CUES.sort((x, y) => x.t - y.t);
  window.seek(0);
  window.filmReady = true;
})();
