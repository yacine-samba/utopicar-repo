// Présentation utopicar avec Simon (eleven_v4), 9:16, grammaire motion-pro : un seul objet porteur, le point orange :
// trou de l'étiquette → carte « écran » de la VRAIE app (web/, lancée en local sur une base de démonstration, captures 3×
// dans assets/presente-v/app/) : annonce collée → rapport de la 208 → liste de recherche → alerte e-mail → messages de la
// nuit → l'annonce sous la cote → vrai e-mail d'alerte → point → flèche du logo → retour à l'étiquette (boucle).
// Contrat : window.seek(t) peint l'image t, sans état entre les images ; tous les instants viennent des mots de la voix
// (audio/vo-presentev/vo.words.json). Flou de bougé : window.shutter / window.samples, rendu MB=8.
(async function () {
  const { spring, clamp, lerp, noise } = Motion;
  const W = 1080, H = 1920, ST = document.getElementById('stage');
  // ?fmt=desktop : même film recomposé en 1920×1080 — le monde vertical dans la colonne de droite (une caméra le suit),
  // titres et mentions dans la colonne de gauche, carton de fin centré
  const DESK = new URLSearchParams(location.search).get('fmt') === 'desktop';
  if (DESK) { for (const e of [document.documentElement, document.body]) Object.assign(e.style, { width: '1920px', height: '1080px' });
    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: '#stage .lay{overflow:visible}' })); }
  const J = async (u) => (await fetch(u)).json();
  const WORDS = await J('../audio/vo-presentev/vo.words.json');
  const RECT = await J('../assets/presente-v/app/rects.json');   // positions des blocs dans les captures (px CSS)
  const LOGO = await (await fetch('../assets/brand/official/utopicar-logo-horizontal-fond-sombre.svg')).text();
  await Promise.all(['700 200px Clash', '600 60px Clash', '700 40px Satoshi', '500 30px Satoshi', 'italic 200px Instrument'].map((f) => document.fonts.load(f)));

  // ---------- temps ----------
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const BODY = WORDS.map((w) => ({ ...w, n: norm(w.w) }));
  const TA = (keys, after = 0) => { for (const w of BODY) if (w.s >= after - 0.01 && keys.some((k) => { const kn = norm(k); return /^\d{1,2}$/.test(kn) ? w.n === kn : w.n.startsWith(kn); })) return w.s; throw new Error('mot absent : ' + keys + ' après ' + after); };
  const VEND = Math.max(...WORDS.map((w) => w.e));
  const T = {};
  T.p208 = TA(['208']); T.p7190 = TA(['7190']); T.revente = TA(['revente']); T.perds = TA(['perds']); T.p2688 = TA(['2688', '2'], T.perds);
  T.colles = TA(['colles']); T.dans = TA(['dans'], T.colles); T.uto = TA(['utopicar'], T.dans);
  T.en = TA(['en'], T.uto); T.minute = TA(['minute']); T.cote = TA(['cote'], T.minute); T.trav = TA(['travaux']); T.marge = TA(['marge']); T.verdict = TA(['verdict']); T.eviter = TA(['eviter']);
  T.et = TA(['et'], T.eviter); T.bonnes = TA(['bonnes'], T.et); T.arrete = TA(['arrete']); T.scroller = TA(['scroller']);
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
  const VIEW = mk('div', 'a', ST, { width: W + 'px', height: H + 'px', transformOrigin: '0 0' });   // le monde vertical (1080×1920)
  const CAM = mk('div', 'lay', VIEW, { transformOrigin: '540px 900px' });    // caméra : poussée et orbite lentes, jamais à l'arrêt

  // texte cinétique (presente30) : mots dans un masque, lettres qui montent ; sortie vers le haut
  const KTS = [];
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
    KTS.push({ k, parent });
    const CAP = DESK ? 700 : 740;
    if (box.offsetWidth > CAP) { k.size = Math.floor(size * CAP / box.offsetWidth);   // 740 px : la poussée de caméra (× 1,08) reste dans la colonne 140 → 940
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
  const bgAt = (t) => (t < T.colles + 0.1 ? 'var(--k)' : t < T.toi ? 'var(--o)' : t < T.une ? 'var(--nuit)' : t < T.recois ? 'var(--o)' : t < T.uto2 ? 'var(--w)' : 'var(--k)');

  // =====================================================================================================
  // A · 0 → « Tu colles » : la 208, l'étiquette percée ; 7 190 € → « à la revente : −2 688 € » ; zoom-éclair dans le trou
  // =====================================================================================================
  const A = mk('div', 'lay', CAM);
  const flou = mk('img', 'a', A, DESK ? { left: '-900px', width: '2900px', height: '1920px', objectFit: 'cover', opacity: 0.55 } : { width: '1080px', height: '1920px', opacity: 0.55 }); flou.src = '../assets/presente-v/208-flou.jpg';
  const carW = mk('div', 'a', A, { width: '980px', height: '584px' });
  const car = mk('img', 'a', carW, { width: '980px', filter: 'drop-shadow(0 50px 40px rgba(0,0,0,.55))' }); car.src = '../assets/hooks-cut/208-annonce-cut.png';
  const ctx = mk('div', 'a ctx', A, { color: 'rgba(244,241,236,.72)', width: '1080px', textAlign: 'center', top: '268px' }, 'Achat-revente auto');
  const kA = KT(A, 318, 132, 'Ce prix ment.');
  const menA = mk('div', 'a men', A, { color: 'rgba(244,241,236,.8)', width: '1080px', textAlign: 'center', top: '1432px' }, 'Données de démonstration');
  // étiquette : le trou est un masque ; elle pend à sa ficelle et oscille autour du trou
  const HX = 612, HY = 684;                    // centre du trou à l'écran (= le point orange porteur)
  const str = mk('div', 'a', A, { width: '3px', height: HY + 'px', background: 'rgba(255,255,255,.75)', left: (HX - 1.5) + 'px', top: '0px', transformOrigin: '50% 100%' });
  const tag = mk('div', 'a', A, { width: '470px', height: '236px', left: (HX - 235) + 'px', top: (HY - 44) + 'px', borderRadius: '30px', background: '#fff', transformOrigin: '235px 44px',
    WebkitMaskImage: 'radial-gradient(circle at 235px 44px, transparent 22px, #000 23px)', boxShadow: '0 40px 80px -30px rgba(0,0,0,.6)', padding: '78px 0 0 36px' });
  const tagSub = mk('div', '', tag, { font: '700 24px Satoshi', letterSpacing: '.16em', opacity: 0.6, color: 'var(--ink)', whiteSpace: 'nowrap' }, 'ANNONCE');
  const tagRow = mk('div', '', tag, { display: 'flex', alignItems: 'flex-start', marginTop: '6px', height: '104px' });
  const minus = mk('span', '', tagRow, { font: '700 104px/1 Clash', letterSpacing: '-.04em', color: 'var(--r)', display: 'inline-block', overflow: 'hidden', whiteSpace: 'pre' }, '−');
  const tagRoll = ROLL(tagRow, 104, '7 190 €', '2 688 €', 'var(--ink)'); Object.assign(tagRoll.box.style, { position: 'relative' });
  const PRIX0 = [7, 1, 9, 0]; tagRoll.cols.forEach((c, k) => { c.fd = PRIX0[k]; });   // le prix affiché : 7 190
  const tRoll = T.p2688 - 0.12;
  cue(0, 'impact', 0.9); cue(T.p7190 - 0.05, 'pop', 0.7); cue(T.perds - 0.04, 'pop', 0.6); cue(tRoll, 'roll', 1); cue(tRoll + 0.7, 'thud', 0.8);
  const tZ = T.colles - 0.24;                   // zoom-éclair : ×28 en 0,28 s autour du trou
  win(tZ - 0.05, tZ + 0.4); cue(tZ - 0.02, 'whoosh', 1); cue(tZ + 0.3, 'impact', 0.7);
  const zoomS = (t) => 1 + 27 * E(t, tZ, 0.3, eIn);
  function paintA(t, tl) {   // tl : temps local (la boucle repeint A avec tl < 0, juste avant l'image 0)
    const vis = show(A, tl < tZ + 0.32); if (!vis) return;
    const sw = 7 * Math.exp(-Math.max(0, tl + 0.4) * 0.45) * Math.sin((tl + 0.4) * 3.4) + 2.5 * bump(tl, tRoll, 0.3) * Math.sin(tl * 9);  // pendule amorti, relancé par le prix
    const Z = zoomS(tl);
    const push = 1 + 0.08 * eIO(clamp((tl + 0.6) / 5.6, 0, 1)) + 0.02 * clamp((tl + 0.6) / 5.6, 0, 1);
    A.style.transformOrigin = `${HX}px ${HY}px`; A.style.transform = `scale(${(push * (1 + 0.6 * E(tl, tZ, 0.3, eIn))).toFixed(4)})`;
    tf(flou, -30 * clamp((tl + 0.6) / 5.6, 0, 1), 0, { s: 1.08 + 0.08 * clamp((tl + 0.6) / 5.6, 0, 1) });   // le fond glisse 3 fois moins vite que la voiture
    { const q = clamp((tl + 0.6) / 5.6, 0, 1); tf(carW, 50 + 90 * q - 45, 770 - 20 * q + 8 * Math.sin(tl * 0.7), { p: 1, ry: 26 - 36 * q, rx: 4 * Math.sin(tl * 0.5), r: -1.5 + 3 * q }); }
    ktP(kA, tl, -0.32, tZ - 0.15);
    ctx.style.opacity = (tl < tZ - 0.1 ? 1 : 0); menA.style.opacity = (tl < tZ - 0.1 ? 1 : 0);
    str.style.transform = `rotate(${(-sw * 0.25).toFixed(2)}deg)`;
    tag.style.transform = `rotate(${(-7 + sw + 11 * E(tl, tRoll, 0.4)).toFixed(2)}deg) scale(${Z.toFixed(3)})`;
    // « À la revente » : l'étiquette change de sens, le prix roule jusqu'à la perte, le signe moins se glisse devant
    const red = tl >= T.revente - 0.02; tagSub.textContent = red ? 'À LA REVENTE' : 'ANNONCE'; tagSub.style.color = red ? 'var(--r)' : 'var(--ink)';
    tagRoll.box.style.color = tl >= tRoll ? 'var(--r)' : 'var(--ink)';
    minus.style.width = (48 * E(tl, tRoll + 0.2, 0.35)).toFixed(1) + 'px';
    rollP(tagRoll, tl, tRoll, 0.7, 0.07);
  }

  // =====================================================================================================
  // B · la carte « écran » : la VRAIE app. Elle naît du trou, change de contenu par masque, ne coupe jamais.
  // =====================================================================================================
  const B = mk('div', 'lay', CAM);
  const KX = 800 / 390;                                  // px du film par px CSS des captures (390 px de large, 3×)
  const CR = { x: 140, y: 520, w: 800, h: 920 };         // carte posée dans la colonne 140 → 940 (bas à 1 440 : au-dessus des 440 px réservés)
  const card = mk('div', 'a', B, { overflow: 'hidden', background: '#0b0908', boxShadow: '0 60px 120px -30px rgba(0,0,0,.65),0 0 0 2px rgba(255,255,255,.1)' });
  const CAPS = {};
  for (const n of ['analyser', 'rapport', 'recherche', 'alerte-off', 'alerte-on', 'messages']) {
    const lay = mk('div', 'a', card, { width: '800px' }); const im = mk('img', 'a', lay, { width: '800px' }); im.src = `../assets/presente-v/app/${n}.png`;
    CAPS[n] = { lay, im };
  }
  await Promise.all(Object.values(CAPS).map((c) => c.im.decode().catch(() => {})));
  // surlignages (dans le calque du rapport : ils défilent avec lui) ; bords sur deux ressorts
  const hlBox = (lay, r, col) => mk('div', 'a', lay, { left: ((r.x - 5) * KX) + 'px', top: ((r.y - 5) * KX) + 'px', width: ((r.w + 10) * KX) + 'px', height: ((r.h + 10) * KX) + 'px', border: `7px solid ${col}`, borderRadius: '30px', transformOrigin: '0 50%' });
  const HL = { prix: hlBox(CAPS.rapport.lay, RECT.rapport.prix, 'var(--o)'), trav: hlBox(CAPS.rapport.lay, RECT.rapport.travaux, 'var(--o)'), marge: hlBox(CAPS.rapport.lay, RECT.rapport.marge, 'var(--o)'), verdict: hlBox(CAPS.rapport.lay, RECT.rapport.verdict, 'var(--r)') };
  // interrupteur « Alerte e-mail » : la partie allumée de la capture, dévoilée de gauche à droite
  const SWR = RECT.alerte.interrupteur;
  const swOn = mk('div', 'a', CAPS['alerte-off'].lay, { left: ((SWR.x - 2) * KX) + 'px', top: ((SWR.y - 2) * KX) + 'px', width: ((SWR.w + 4) * KX) + 'px', height: ((SWR.h + 4) * KX) + 'px', overflow: 'hidden' });
  const swIm = mk('img', 'a', swOn, { width: '800px', left: (-(SWR.x - 2) * KX) + 'px', top: (-(SWR.y - 2) * KX) + 'px' }); swIm.src = '../assets/presente-v/app/alerte-on.png';
  // titres
  const kB1 = KT(B, 290, 132, [['Colle', {}], ["l'annonce.", { i: 1, c: 'var(--k)' }]]);
  const kB2 = KT(B, 290, 132, 'En une minute.');
  const kB3 = KT(B, 280, 160, 'À éviter.', 'var(--k)');
  const kB4 = KT(B, 300, 110, 'Les bonnes affaires ?'), kB5 = KT(B, 300, 110, 'Arrête de scroller.');
  const kB6 = KT(B, 236, 104, 'Ta recherche'), kB7 = KT(B, 340, 112, [['tourne seule.', { i: 1, c: 'var(--k)' }]]);
  const kB8 = KT(B, 236, 118, 'Toi, tu dors.'), kB9 = KT(B, 346, 124, [['Lui, il bosse.', { i: 1, c: 'var(--o)' }]]);
  const kB10 = KT(B, 300, 120, 'Sous la cote ?');
  const pro = mk('div', 'a pill', B, { font: '700 30px Satoshi', padding: '12px 26px', background: 'var(--k)', color: '#fff', border: '2px solid rgba(255,90,31,.8)' }, 'Benef Pro');
  const menB = mk('div', 'a men', B, { width: '1080px', textAlign: 'center', top: '1450px' }, 'Données de démonstration');
  // instants
  const tCard = tZ + 0.22;                      // la carte naît du point, au fond du trou
  const tPaste = T.dans - 0.05;                 // le texte de l'annonce se colle
  const tRap = T.en - 0.08;                     // le rapport remplace le formulaire
  const tList = T.et - 0.05, tStop = T.scroller + 0.02;
  const tAl = T.rech - 0.12, tSw = T.tourne - 0.02;
  const tMsg = T.toi - 0.06;
  const tGem = T.une - 0.05;
  cue(tCard, 'whoosh', 0.7); cue(tPaste, 'type', 0.8); cue(tPaste + 0.25, 'type', 0.6); cue(T.uto + 0.3, 'click', 1);
  cue(tRap, 'whoosh', 0.6); cue(T.cote - 0.03, 'pop', 0.8); cue(T.trav - 0.03, 'pop', 0.8); cue(T.marge - 0.03, 'pop', 0.9); cue(T.eviter - 0.03, 'impact', 1.1);
  cue(tList, 'whoosh', 0.9); cue(tStop - 0.02, 'tapestop', 1); cue(tStop, 'thud', 1);
  cue(tAl, 'whoosh', 0.6); cue(tSw, 'click', 1); cue(T.plus, 'pop', 0.5); cue(T.jour, 'pop', 0.5);
  cue(T.toi - 0.02, 'whoosh', 0.7); cue(T.lui, 'pop', 0.6); cue(T.bosse, 'sent', 0.8); cue(T.bosse + 0.2, 'sent', 0.7);
  cue(tGem, 'pop', 0.9); cue(T.cote2 - 0.03, 'ding', 0.6);
  win(tZ + 0.15, tCard + 0.45); win(tList, tStop + 0.12); win(tRap - 0.02, tRap + 0.3); win(T.eviter - 0.55, T.eviter);
  // contenu affiché : [capture, défilement (px CSS), hauteur visible (px CSS)]
  const RP = RECT.rapport;
  const scrollRap = (t) => {   // haut du rapport → les trois blocs (cote, travaux, marge) → le verdict
    const s0 = 0, s1 = Math.round(RP.travaux.y - 70), s2 = Math.round(RP.verdict.y - 120);
    return s0 + (s1 - s0) * SP(t, T.minute - 0.15, 'default') + (s2 - s1) * SP(t, T.verdict - 0.2, 'default');
  };
  // zoom dans le rapport : sur le bloc de chaque mot (cote, travaux, marge), puis sur le verdict
  const centre = (r) => ({ fx: 195, fy: r.y + r.h / 2 });   // centré sur la largeur de la page : le bloc entier reste dans la carte
  function zoomRap(t) {
    const P = [[T.cote - 0.12, RP.prix], [T.trav - 0.12, RP.travaux], [T.marge - 0.12, RP.marge], [T.verdict - 0.05, RP.verdict]];
    let k = -1; P.forEach(([t0], i) => { if (t >= t0) k = i; });
    const z = 1 + 0.12 * SP(t, T.cote - 0.12, 'default') - 0.04 * SP(t, T.verdict - 0.05, 'default');
    if (k < 0) return { z: 1, ...centre(RP.prix) };
    const a = centre(P[Math.max(0, k - 1)][1]), b = centre(P[k][1]), q = k === 0 ? 1 : SP(t, P[k][0], 'default');
    return { z, fx: lerp(a.fx, b.fx, q), fy: lerp(a.fy, b.fy, q) };
  }
  const LIST0 = 6300, LIST1 = RECT.recherche.carte1.y - 30;   // au-dessus de la carte 1 : rien de cadré au-dessus (lien vers une plateforme tierce)
  const scrollList = (t) => {   // la liste file vers le haut, de plus en plus vite, et s'arrête net sur « scroller » (léger dépassement)
    if (t < tStop) return LIST0 + (LIST1 - LIST0) * Math.pow(clamp((t - tList) / (tStop - tList), 0, 1), 1.25);
    const u = t - tStop; return LIST1 - 34 * Math.sin(Math.PI * clamp(u / 0.3, 0, 1)) * Math.exp(-u * 3) - 9 * u;
  };
  function contenu(t) {
    if (t < tRap) return { n: 'analyser', s: RECT.form.champ.y - 40, h: RECT.form.champ.h + 46 };   // le champ seul : l'aide en dessous nomme des plateformes
    if (t < tList) return { n: 'rapport', s: scrollRap(t), h: CR.h / KX };
    if (t < tAl) return { n: 'recherche', s: scrollList(t), h: CR.h / KX };
    if (t < tMsg) return { n: 'alerte-off', s: RECT.alerte.carte.y - 40 + 14 * (t - tAl), h: CR.h / KX };
    if (t < tGem) return { n: 'messages', s: RECT.messages.envois.y - 330 + 160 * SP(t, T.lui - 0.1, 'default') + 8 * (t - tMsg), h: CR.h / KX };
    return { n: 'recherche', s: RECT.recherche.carte1.y, h: RECT.recherche.carte1.h };
  }
  const SWAPS = [tRap, tList, tAl, tMsg, tGem];
  function rectCarte(t) {   // la carte : naît du point, prend la hauteur de son contenu, devient la pépite, puis l'e-mail
    const c = contenu(t), hh = Math.min(CR.h, c.h * KX);
    let R = { x: CR.x, y: CR.y, w: CR.w, h: hh, r: 44 };
    if (t < tCard + 0.6) {   // naissance : point → carte (bords sur deux ressorts)
      const a = SP(t, tCard, 'snappy'), b = SP(t, tCard + 0.06, 'default');
      const L = lerp(HX - 23, CR.x, a), Rr = lerp(HX + 23, CR.x + CR.w, b), T0 = lerp(HY - 23, CR.y, b), B0 = lerp(HY + 23, CR.y + hh, a);
      R = { x: L, y: T0, w: Rr - L, h: B0 - T0, r: lerp(23, 44, a) };
    }
    if (t >= tGem) {   // la carte se resserre sur l'annonce sous la cote : elle devient cette carte de résultat
      const g = RECT.recherche.carte1, a = SP(t, tGem, 'snappy'), b = SP(t, tGem + 0.06, 'default');
      const tw = (g.w + 8) * KX * 0.98, th = (g.h + 8) * KX * 0.98, tx = 540 - tw / 2, ty = 900 - th / 2;
      const L = lerp(CR.x, tx, a), Rr = lerp(CR.x + CR.w, tx + tw, b), T0 = lerp(CR.y, ty, b), B0 = lerp(CR.y + CR.h, ty + th, a);
      R = { x: L, y: T0, w: Rr - L, h: B0 - T0, r: lerp(44, 40, a) };
    }
    return R;
  }
  function paintB(t) {
    const vis = show(B, t >= tZ + 0.1 && t < T.recois + 0.05); if (!vis) return;
    const rv = 22 * zoomS(t) + 2400 * E(t, tZ + 0.18, 0.22, eIn); B.style.clipPath = rv < 2300 ? `circle(${rv.toFixed(0)}px at ${HX}px ${HY}px)` : '';
    B.style.transformOrigin = '540px 900px'; B.style.transform = `scale(${(1 + 0.03 * Math.sin((t - tZ) * 0.35)).toFixed(4)})`;
    // titres
    ktP(kB1, t, [T.colles, T.colles + 0.12], T.en - 0.36); ktP(kB2, t, T.en, T.verdict - 0.3); ktP(kB3, t, T.eviter, T.et - 0.15);
    ktP(kB4, t, T.bonnes, T.arrete - 0.36); ktP(kB5, t, T.arrete, T.rech - 0.36);
    ktP(kB6, t, T.rech, T.toi - 0.36); ktP(kB7, t, T.tourne, T.toi - 0.36);
    ktP(kB8, t, T.toi, T.une - 0.36); ktP(kB9, t, T.lui, T.une - 0.36);
    ktP(kB10, t, T.sous, T.recois - 0.12);
    // carte : géométrie, flottement 3D, contenu
    const R = rectCarte(t), c = contenu(t), fl = E(t, tCard + 0.5, 0.8) * (1 - E(t, tGem, 0.2));
    Object.assign(card.style, { width: R.w + 'px', height: R.h + 'px', borderRadius: R.r + 'px' });
    card.style.boxShadow = t >= tGem ? '0 60px 120px -20px rgba(0,0,0,.8),0 0 0 6px #fff' : '0 60px 120px -30px rgba(0,0,0,.65),0 0 0 2px rgba(255,255,255,.1)';
    tf(card, R.x, R.y + fl * 10 * Math.sin((t - tCard) * 1.2), { p: 1, ry: fl * 6 * Math.sin((t - tCard) * 0.9), rx: fl * 3 * Math.sin((t - tCard) * 0.7 + 1), r: (t >= tGem ? -2.5 * SP(t, tGem, 'default') : 0) });
    // le contenu change par masque : le nouveau monte du bas, l'ancien part vers le haut
    const sw = SWAPS.filter((x) => t >= x).pop() ?? -9, ps = E(t, sw, 0.32, eIO);
    const prevT = sw - 0.001, prev = sw > 0 ? contenu(prevT) : null;
    for (const [n, cp] of Object.entries(CAPS)) {
      const on = n === c.n, wasOn = prev && n === prev.n && ps < 1 && !on;
      if (!show(cp.lay, on || wasOn)) continue;
      const cc = on ? c : prev, dy = on ? (1 - ps) * R.h * (prev ? 1 : 0) : -ps * R.h * 0.35;
      const zc = on && n === 'rapport' ? zoomRap(t) : null;
      cp.lay.style.transformOrigin = zc ? `${(zc.fx * KX).toFixed(1)}px ${(zc.fy * KX).toFixed(1)}px` : '0 0';
      cp.lay.style.transform = `translate(${t >= tGem && on ? (-(RECT.recherche.carte1.x - 4) * KX) : 0}px, ${(-cc.s * KX + dy).toFixed(1)}px)${zc ? ` scale(${zc.z.toFixed(4)})` : ''}`;
      cp.lay.style.opacity = on ? 1 : (1 - ps).toFixed(3);
    }
    // collage de l'annonce : le texte apparaît de haut en bas dans le champ
    const fr = RECT.form.champ;
    CAPS.analyser.im.style.clipPath = t < tPaste ? `inset(0 0 ${(100 - 100 * (fr.y + 34) / 1570).toFixed(2)}% 0)` : `inset(0 0 ${(100 - 100 * (fr.y + 34 + (fr.h - 34) * E(t, tPaste, 0.45, eIO)) / 1570).toFixed(2)}% 0)`;
    // clic « Analyser » : la carte s'écrase puis rebondit (écraser-étirer)
    const sq = bump(t, T.uto + 0.28, 0.1); if (sq > 0) card.style.transform += ` scale(${(1 + 0.04 * sq).toFixed(3)},${(1 - 0.06 * sq).toFixed(3)})`;
    // surlignages sur leur mot
    [['prix', T.cote], ['trav', T.trav], ['marge', T.marge], ['verdict', T.eviter]].forEach(([k, tw]) => {
      const e = HL[k], a = SP(t, tw - 0.05, 'snappy'), b = SP(t, tw + 0.01, 'default');
      show(e, t > tw - 0.06); e.style.transform = `scaleX(${clamp(a, 0, 1.05).toFixed(3)})`; e.style.opacity = (0.4 + 0.6 * b).toFixed(2);
    });
    // l'interrupteur s'allume sur « tourne »
    swOn.style.clipPath = `inset(0 ${(100 - 100 * E(t, tSw, 0.25)).toFixed(1)}% 0 0)`;
    // pastille Benef Pro : recherche suivie et messages
    const pOn = t > tAl + 0.15 && t < tGem - 0.1; show(pro, pOn);
    if (pOn) pro.textContent = t < tMsg ? 'Benef Pro' : 'Benef Pro · option Messages';
    if (pOn) tf(pro, 940 - pro.offsetWidth, 456 - 14 * (1 - SP(t, tAl + 0.15, 'snappy')), { o: E(t, tAl + 0.15, 0.15) * (1 - E(t, tGem - 0.3, 0.15)), s: 1 + 0.05 * bump(t, tSw, 0.2) });
    menB.style.color = t >= T.toi && t < T.une ? 'rgba(244,241,236,.8)' : 'rgba(26,19,16,.8)'; show(menB, t > tRap && t < T.recois);
  }

  // =====================================================================================================
  // C · « Tu reçois un mail » : la carte de résultat se déplie en vrai e-mail d'alerte (modèle de supabase/functions/veille)
  // =====================================================================================================
  const Dd = mk('div', 'lay', CAM);
  const kD = KT(Dd, 290, 120, 'Tu reçois', 'var(--ink)'), kD2 = KT(Dd, 410, 130, [['un mail.', { i: 1, c: 'var(--o)' }]], 'var(--ink)');
  // mêmes chiffres que la carte de résultat de l'app (annonce de démonstration 7 650 €, cote 9 950 €)
  const MAILH = `<div style="max-width:560px;margin:0 auto;font:14px Arial,sans-serif;color:#1d1d1f">
    <p style="font-size:18px;margin:0 0 4px"><b>1 nouvelle annonce</b></p><p style="margin:0 0 12px;color:#555">Recherche « Renault Clio 4 »</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:10px 0;border-bottom:1px solid #e5e5e5"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="padding-right:12px;vertical-align:top"><img src="../assets/presente-v/clio4-mail.jpg" width="120" style="border-radius:6px;display:block;width:120px;height:auto" alt=""></td>
    <td style="vertical-align:top;font:14px/1.45 Arial,sans-serif;color:#1d1d1f"><a id="lien" style="color:#15307f;font-weight:bold;text-decoration:none">Renault Clio IV 1.5 dCi 75 Zen</a><br>
    <b style="font-size:16px">7 650 €</b><br><span style="color:#555">2018 · 88 500 km · Diesel · Manuelle</span><br><span style="color:#777">Villeurbanne 69100</span><br>
    <span style="color:#0a7a43;font-weight:bold">2 300 € sous la cote</span> <span style="color:#777">(cote 9 950 € sur 220 annonces)</span></td></tr></table></td></tr></table>
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
    const g = rectCarte(T.recois - 0.05), a = SP(t, T.recois, 'snappy'), b = SP(t, T.recois + 0.06, 'default');
    let L = lerp(g.x, MX, a), R = lerp(g.x + g.w, MX + MW, b), Tt = lerp(g.y, MY, b), Bb = lerp(g.y + g.h, MY + MH, a);
    if (t >= T.uto2 - 0.12) { const c = SP(t, T.uto2 - 0.12, 'snappy'), d = SP(t, T.uto2 - 0.06, 'default'), cx = 540, cy = 760;
      L = lerp(L, cx - 30, c); R = lerp(R, cx + 30, d); Tt = lerp(Tt, cy - 30, d); Bb = lerp(Bb, cy + 30, c); }
    Object.assign(mailBox.style, { width: (R - L) + 'px', height: (Bb - Tt) + 'px', borderRadius: (t >= T.uto2 - 0.12 ? 30 : 26) + 'px' });
    mailBox.style.background = t >= T.uto2 - 0.06 ? 'var(--o)' : '#fff';
    mailIn.style.opacity = (E(t, T.recois + 0.12, 0.2) * (1 - E(t, T.uto2 - 0.14, 0.08))).toFixed(3);
    const fl = E(t, T.recois + 0.4, 0.8);
    tf(mailBox, L, Tt + fl * 12 * Math.sin((t - T.recois) * 1.4), { p: 1, ry: fl * 9 * Math.sin((t - T.recois) * 1.1), rx: fl * 4 * Math.sin((t - T.recois) * 0.9), r: fl * 1 * Math.sin((t - T.recois) * 0.7) });
    Dd.style.transformOrigin = '540px 900px'; Dd.style.transform = `scale(${(1 + 0.05 * clamp((t - T.recois) / (T.uto2 - T.recois), 0, 1)).toFixed(4)})`;
    show(menD, t < T.uto2 - 0.1);
    const lr = lien.getBoundingClientRect(), mr = mailBox.getBoundingClientRect(), tx = MX + (lr.left - mr.left) + 0.55 * lr.width, ty = MY + (lr.top - mr.top) + 0.6 * lr.height;
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
    Ee.style.transformOrigin = '540px 760px'; Ee.style.transform = `translateY(${(-24 * pe).toFixed(1)}px) rotate(${(1.2 * Math.sin((t - T.uto2) * 0.9)).toFixed(3)}deg) scale(${((1 + 0.07 * pe) * (1 - 0.8 * out)).toFixed(4)})`; Ee.style.opacity = (1 - E(t, T.loop + 0.3, 0.12)).toFixed(3);
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

  // ---------- caméra, point de la boucle, seek ----------
  const DOT = mk('div', 'a', VIEW, { background: 'var(--o)' });
  // 16:9 : titres et mentions passent dans la colonne de gauche (un calque par scène, visible avec elle)
  const TLS = [];
  if (DESK) {
    const TL = mk('div', 'lay', ST), sub = new Map();
    const into = (own, e) => { if (!sub.has(own)) { const s = mk('div', 'lay', TL); sub.set(own, s); TLS.push([own, s]); } sub.get(own).appendChild(e); };
    for (const { k, parent } of KTS) if (parent !== Ee) { into(parent, k.box); k.box.style.top = (parseFloat(k.box.style.top) + 180) + 'px'; k.box.style.left = (500 - k.box.offsetWidth / 2) + 'px'; }
    into(A, ctx); ctx.style.top = '448px'; ctx.style.left = '-40px';
    for (const [own, m] of [[A, menA], [B, menB], [Dd, menD]]) { into(own, m); m.style.top = '930px'; m.style.left = '-40px'; }
  }
  // caméra 16:9 : [x écran du centre du monde, y du monde au centre de l'écran, échelle]
  const mix3 = (a, b, q) => a.map((v, i) => lerp(v, b[i], q));
  const CA = [1340, 1000, 0.95], CB = [1360, 950, 0.84], CE = [960, 1030, 0.95];
  const deskCam = (t) => mix3(mix3(mix3(CA, CB, E(t, tZ + 0.1, 0.6, eIO)), CE, E(t, T.uto2 - 0.15, 0.55, eIO)), CA, E(t, T.loop, DUR - T.loop - 0.02, eIO));
  function paintDot(t) {
    const d = paintLoop(t);
    if (!show(DOT, !!d)) return;
    Object.assign(DOT.style, { width: d.w + 'px', height: d.h + 'px', borderRadius: Math.min(d.rad, d.w / 2, d.h / 2) + 'px', background: d.col });
    tf(DOT, d.x, d.y, { o: d.o });
  }
  window.seek = (t) => {
    BG.style.background = t >= DUR - 0.36 ? 'var(--k)' : bgAt(t);
    const orb = `perspective(2200px) rotateY(${(1.6 * Math.sin(t * 0.42)).toFixed(3)}deg) rotateX(${(1.1 * Math.sin(t * 0.31 + 1)).toFixed(3)}deg)`;
    CAM.style.transform = `${orb} scale(${(1.0 + 0.012 * Math.sin(t * 0.5)).toFixed(4)})`;
    if (t >= DUR - 0.36) { paintA(t, t - DUR); const q = E(t, DUR - 0.36, 0.33, eIO); A.style.clipPath = `circle(${(22 + 2300 * q).toFixed(0)}px at ${HX}px ${HY}px)`; }
    else { A.style.clipPath = ''; paintA(t, t); }
    paintB(t); paintD(t); paintE(t); paintDot(t);
    if (DESK) { const c = deskCam(t); VIEW.style.transform = `translate(${(c[0] - 540 * c[2]).toFixed(1)}px,${(540 - c[1] * c[2]).toFixed(1)}px) scale(${c[2].toFixed(4)})`;
      for (const [own, s] of TLS) s.style.display = own.style.display; }
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
