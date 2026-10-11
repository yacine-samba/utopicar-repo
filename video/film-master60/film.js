// master60 « UTOPICAR, la pub d'une minute » (58,5 s). Contrat : window.seek(t) peint la frame t, sans état entre les frames.
// Paramètres : ?fmt=vertical|desktop (mise en page recomposée, pas recadrée), ?hook=A|B (0–4,23 s, même corps ensuite).
// Minutage : audio/vo-master60/vo-timing.json (scripts/vo-timing-master60.py) ; chaque plan part sur le mot de Simon.
// Interface : vraies captures des composants de l'app (video/capture-web, données démo) dans film-master60/ui/.
(async function () {
  const { spring, track, clamp, lerp, noise } = Motion;
  const { el, show, text, typeText, cursor, moveCursor, bump } = Kit;
  const Q = new URLSearchParams(location.search);
  const FMT = Q.get('fmt') || 'vertical', HOOK = (Q.get('hook') || 'A').toUpperCase();
  const BLANC = ['blanc', 'clair'].includes(Q.get('theme'));      // version blanche : fond et pages publiques clairs, cartes de l'app sombres
  if (BLANC) document.documentElement.dataset.theme = 'blanc';
  const V = FMT !== 'desktop';
  const W = V ? 1080 : 1920, H = V ? 1920 : 1080;
  const L = (v, d) => (V ? v : d);
  for (const e of [document.documentElement, document.body]) Object.assign(e.style, { width: W + 'px', height: H + 'px' });
  const stage = document.getElementById('stage');

  // ---------- minutage (voix posée) ----------
  const VT = await (await fetch('../audio/vo-master60/vo-timing.json')).json();
  const M = (k) => VT.marks[k].t, ME = (k) => VT.marks[k].end;
  const HW = (h, i) => VT.hooks[h].mots[i].s;
  const T0 = VT.corps;              // 4,23 s : raccord des deux ouvertures
  const END = VT.marks.utopicar2.t + 0.76, DUR = Math.round((END + 3.7) * 10) / 10;   // carton final de END à DUR
  const MUR = (await (await fetch('../assets/master60/annonces-mur.json')).json()).annonces;

  await Promise.all(['600 96px Clash', '700 30px Satoshi', '500 24px Satoshi', 'italic 96px Instrument'].map((f) => document.fonts.load(f)));

  // ---------- images ----------
  const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(i); i.src = src; });
  const UI = {};
  for (const n of ['fiche-208', 'merc-rapporte', 'merc-argent', 'merc-verdict', 'merc-historique', 'offre-starter', 'offre-pro', 'bouton-essai',
    'tb-entete', 'tb-marche-annonce-1', 'tb-marges', 'tb-chiffre-1']) UI[n] = await load(`${BLANC ? 'ui-blanc' : 'ui'}/${n}.png`);
  const LOGO = await load(`../assets/brand/official/utopicar-logo-horizontal-fond-${BLANC ? 'clair' : 'sombre'}.svg`);

  // ---------- décor : fond chaud, lueur orange lente, grain ----------
  const glow = el('div', 'glow', stage, { width: '1400px', height: '1400px', mixBlendMode: BLANC ? 'multiply' : 'screen',
    background: BLANC ? 'radial-gradient(closest-side,rgba(255,138,76,.07),rgba(255,138,76,0))' : 'radial-gradient(closest-side,rgba(255,90,31,.20),rgba(255,90,31,0))' });
  const world = el('div', 'world', stage, { width: W + 'px', height: H + 'px', transformOrigin: '0 0' });   // origine 0,0 : la caméra pousse autour du point visé
  // voile sombre derrière la bande des titres (MO6) : les cartes passent dessous quand la caméra pousse
  const VC = BLANC ? '251,249,245' : '11,10,9';
  const veil = el('div', 'abs', stage, { width: W + 'px', height: H + 'px', pointerEvents: 'none', background: V
    ? (BLANC ? `linear-gradient(180deg,rgba(${VC},.98) 0,rgba(${VC},.96) 440px,rgba(${VC},0) 530px)`
      : `linear-gradient(180deg,rgba(${VC},.94) 0,rgba(${VC},.88) 470px,rgba(${VC},0) 640px)`)
    : `linear-gradient(90deg,rgba(${VC},.94) 0,rgba(${VC},.86) 820px,rgba(${VC},0) 1020px)` });
  const over = el('div', 'abs', stage, { width: W + 'px', height: H + 'px' });     // titres, mentions : hors caméra (zones sûres)
  el('div', '', stage).id = 'vign';
  const grain = el('div', '', stage); grain.id = 'grain';

  // pose par le centre dans l'espace de la scène ; o = opacité, b = flou, z = profondeur (vers la caméra si > 0)
  function put(e, x, y, s = 1, o = 1, b = 0, r = 0, rx = 0, ry = 0, z = 0) {
    e.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) translate(-50%,-50%)${Math.abs(z) > 0.01 ? ` translateZ(${z.toFixed(1)}px)` : ''} rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
    e.style.opacity = clamp(o, 0, 1).toFixed(3);
    e.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : '';
  }
  // entrée et sortie en mouvement (jamais une opacité seule) : from / to = décalages {x, y, z, s, r, rx, ry, b}
  function life(e, t, a, b, at, from = { y: 60, s: -0.06, b: 10 }, to = { y: -60, s: -0.04, b: 10 }, pin = 'default') {
    const vis = t >= a - 0.02 && (b == null || t < b + 1.1);
    show(e, vis); if (!vis) return 0;
    const i = spring(t - a, pin), o = b == null ? 0 : spring(t - b, 'snappy');
    const d = (k) => (1 - i) * (from[k] || 0) + o * (to[k] || 0);
    { const h = 1 / 240, i2 = spring(t - h - a, pin), o2 = b == null ? 0 : spring(t - h - b, 'snappy');
      const d2 = (k) => (1 - i2) * (from[k] || 0) + o2 * (to[k] || 0);
      VMAX = Math.max(VMAX, Math.hypot(d('x') - d2('x'), d('y') - d2('y'), (d('z') - d2('z')) * 0.6) / h); }
    put(e, at.x + d('x'), at.y + d('y'), (at.s || 1) * (1 + d('s')), clamp(i * 1.6, 0, 1) * (1 - clamp(o * 1.4, 0, 1)), d('b'),
      (at.r || 0) + d('r'), (at.rx || 0) + d('rx'), (at.ry || 0) + d('ry'), (at.z || 0) + d('z'));
    return i * (1 - o);
  }
  // image d'interface affichée à une largeur donnée (px film)
  function ui(n, w, parent = world, cls = 'ui') { const e = el('img', cls, parent); e.src = UI[n].src; e.style.width = w + 'px'; return e; }
  // morceau d'une capture : rect en px de l'image source (densité 3), affiché à la largeur w
  function cut(n, r, w, parent = world) {
    const k = w / r.w, box = el('div', 'card', parent, { width: w + 'px', height: r.h * k + 'px', borderRadius: '34px' });
    const i = el('img', 'ui', box); i.src = UI[n].src; Object.assign(i.style, { width: UI[n].width * k + 'px', left: -r.x * k + 'px', top: -r.y * k + 'px' });
    return box;
  }
  // même chose avec profondeur de champ (plan incliné : net au point visé, flou devant et derrière)
  function cutDof(n, r, w) {
    const box = cut(n, r, w), sharp = box.firstChild, soft = sharp.cloneNode();
    soft.style.filter = 'blur(7px)'; box.insertBefore(soft, sharp); box.sharp = sharp; return box;
  }
  function focus(box, fy, hw, fade = 260) {
    const m = `linear-gradient(180deg,transparent ${(fy - hw - fade).toFixed(0)}px,#000 ${(fy - hw).toFixed(0)}px,#000 ${(fy + hw).toFixed(0)}px,transparent ${(fy + hw + fade).toFixed(0)}px)`;
    box.sharp.style.webkitMaskImage = m; box.sharp.style.maskImage = m;
  }
  // titre en deux tons : segs = [['Payée', ''], ['deux fois ?', 'it']] ; écrit lettre à lettre, sort en montant
  function title(segs, size) { const b = text(over, segs); b.style.fontSize = (size || L(96, 84)) + 'px'; b.style.display = 'none'; return b; }
  let TV = 0;     // présence d'un titre à cette frame (0 → 1) : le voile ne s'assombrit que sous un titre
  function writeTitle(b, t, a, z, at) {
    TV = Math.max(TV, clamp(spring(t - (a - 0.35), 'default') * (1 - spring(t - (z + 0.15), 'default')), 0, 1));
    const vis = t >= a - 0.02 && t < z + 0.8; show(b, vis); if (!vis) return;
    put(b, at.x, at.y + (1 - spring(t - a, 'heavy')) * 18, 1, 1);
    typeText(b, t, a, z, 0.028, 30);
  }

  // ---------- caméra 3D à point focal (le monde est un plan posé autour de 0,0) ----------
  // écran : le point visé tombe au centre de la zone d'image (sous le titre en 9:16, à droite du titre en 16:9).
  // Grammaire des films produit de prompt-motion.com (Taxtello, RedShip, Distilbook) : l'interface est un grand plan
  // incliné (rx vers l'arrière, ry de côté, rz en biais), la caméra glisse dessus d'un point à l'autre ; les éléments
  // qui flottent ont une profondeur z (parallaxe) ; les titres restent à plat par-dessus.
  const SX = L(540, 1340), SY = L(980, 560);
  stage.style.perspective = L(1700, 2000) + 'px';
  stage.style.perspectiveOrigin = `${SX}px ${SY}px`;
  const K = (t, x, y, s, rx = 0, ry = 0, rz = 0, pr) => ({ t, x, y, s, rx, ry, rz, pr });
  const CAMP = ['x', 'y', 's', 'rx', 'ry', 'rz'];
  const camK = [];    // cibles K(...) ; chacune part sur un spring
  const cam = (t) => {
    const c = { ...camK[0] };
    for (let i = 1; i < camK.length; i++) {
      const k = camK[i], p = k.pr && k.pr.ex ? expoInOut(clamp((t - k.t) / k.pr.ex, 0, 1)) : spring(t - k.t, k.pr || { f: 0.9, z: 1 });
      for (const q of CAMP) c[q] += (k[q] - camK[i - 1][q]) * p;
    }
    return { ...c, x: c.x + noise(1, t * 0.35) * 6, y: c.y + noise(2, t * 0.3) * 6, r: noise(3, t * 0.25) * 0.35,
      rx: c.rx + noise(5, t * 0.22) * 0.8, ry: c.ry + noise(4, t * 0.2) * 1.2 };
  };

  // ---------- grille de la musique (112 BPM, voix calée dessus : scripts/cale-master60.py) ----------
  // Chaque temps porte un événement ; chacun part de l'état laissé par le précédent. Tout est fonction du temps.
  const GR = await (await fetch('../audio/vo-master60/grille.json')).json();
  const BEAT = GR.beat, B0 = GR.ancre;
  const BT = (n) => B0 + n * BEAT;                       // instant du temps n (négatif dans l'ouverture)
  const nb = (t) => (t - B0) / BEAT;                     // position en temps
  // interpolation exponentielle
  const expoOut = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
  const expoIn = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : Math.pow(2, 10 * p - 10));
  const expoInOut = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2);
  const ex = (t, t0, d = BEAT * 0.8, f = expoOut) => f(clamp((t - t0) / d, 0, 1));
  // escalier : avance d'un cran à chaque temps, de n0 à n0 + cnt (chaque cran en expo) ; pas = 1 ou 0,5 (croches)
  const stair = (t, n0, cnt, pas = 1, d = 0.7) => { let v = 0; for (let i = 0; i < cnt; i++) v += ex(t, BT(n0 + i * pas), BEAT * pas * d); return v; };
  // pulsation : retombée exponentielle après chaque temps, plus forte sur le temps fort de la mesure
  const SILENCE = [[BT(8), BT(10) - 0.02]];             // « Ah. » : la musique coupe jusqu'à « Non. »
  const pulse = (t) => {
    if (t < BT(-8) || SILENCE.some(([a, b]) => t >= a && t < b)) return 0;
    const x = nb(t), n = Math.floor(x), f = (x - n) * BEAT;
    return Math.exp(-f / 0.11) * (((n % 4) + 4) % 4 === 0 ? 1 : 0.55);
  };

  // ---------- couche interactive : curseur, clics, survols, bulles ----------
  // chemin du curseur : [arrivée, x, y] ; il part (expo) pour arriver pile à l'instant donné
  function path(keys, d = 0.5) {
    return (t) => {
      let x = keys[0][1], y = keys[0][2];
      for (let i = 1; i < keys.length; i++) {
        const p = expoInOut(clamp((t - (keys[i][0] - d)) / d, 0, 1));
        x += (keys[i][1] - keys[i - 1][1]) * p; y += (keys[i][2] - keys[i - 1][2]) * p;
      }
      return { x, y };
    };
  }
  const press = (t, clics) => clics.reduce((m, c) => Math.max(m, bump(t, c - 0.05, 0.11)), 0);
  // onde de clic : anneau qui s'ouvre (expo) là où le curseur a cliqué
  function ripples(t, parent, clics, pos, z = 30, RIP = parent.rips || (parent.rips = [])) {
    let k = 0;
    for (const c of clics) {
      const a = t - c; if (a < 0 || a > 0.6) continue;
      const e = RIP[k] || (RIP[k] = el('div', 'rip', parent)); k++;
      const p = pos(c), q = expoOut(a / 0.55);
      show(e, true); put(e, p.x, p.y, 0.25 + 1.5 * q, 1 - q, 0, 0, 0, 0, z);
    }
    for (; k < RIP.length; k++) show(RIP[k], false);
  }
  // survol : cadre qui s'allume sur une zone d'un élément (coordonnées en px de l'élément)
  function hov(parent, x, y, w, h) { const e = el('div', 'hov', parent, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); e.style.opacity = 0; return e; }
  function lit(e, t, a, b) {
    const i = spring(t - a, 'snappy'), o = b == null ? 0 : spring(t - b, 'snappy');
    e.style.opacity = clamp(i * 1.4 - o * 1.4, 0, 1).toFixed(3);
    e.style.transform = `scale(${(1.06 - 0.06 * i).toFixed(4)})`;
  }
  // bulle d'info : texte réel de l'interface, qui flotte au-dessus du plan
  function bubble(html, parent = world) { const e = el('div', 'bub', parent); e.innerHTML = html; return e; }
  // vitesse de ce qui bouge le plus à cette frame (px/s) → ouverture de l'obturateur au rendu (flou de bougé)
  let VMAX = 0;

  // =====================================================================================================
  // OUVERTURES (0 → 4,23 s)
  // A : la vraie annonce de la 208 pleine image dès la frame 0. B : un mur de 50 annonces, la 208 en sort.
  // =====================================================================================================
  const CW = L(640, 520);                                    // largeur de la fiche d'annonce
  const lst = el('div', 'lst', world, { width: CW + 'px' });
  const lstImg = el('img', '', lst); lstImg.src = '../assets/master60/photos/208-annonce.jpg';
  const lb = el('div', 'b', lst);
  el('div', 'm', lb).textContent = 'Peugeot 208 1.2 PureTech 110';
  el('div', 'i', lb).textContent = '2016 · 116 789 km · Essence';
  const pr = el('div', 'p', lb); pr.textContent = '7 190 €';
  const mk = el('i', 'mark', pr);
  if (!V) { lst.querySelector('.m').style.fontSize = '42px'; pr.style.fontSize = '88px'; }

  const tiles = [];
  if (HOOK === 'B') {
    MUR.forEach((a, i) => {
      const e = el('div', 'ann', world);
      el('div', 'm', e).textContent = `${a.marque} ${a.modele}`;
      el('div', 'i', e).textContent = `${a.annee} · ${a.km.toLocaleString('fr-FR')} km`;
      el('div', 'p', e).textContent = `${a.prix.toLocaleString('fr-FR')} €`;
      tiles.push(e);
    });
  }
  // « deux fois » : le prix se dédouble (une 2e fois en réparations)
  const ghost = el('div', 'tag', world, { borderColor: 'var(--bad)' }); ghost.innerHTML = `7 190 €<small>une 2e fois ?</small>`;
  const tA = title([['Payée', ''], ['deux fois ?', 'it']]);
  const tB = title([['50 annonces.', ''], ['\n', ''], ['Ce matin.', 'it']]);
  const tBuy = title([['Tu', ''], ["l'achètes ?", 'it']]);

  // =====================================================================================================
  // 01 · AVANT D'ACHETER
  // =====================================================================================================
  const chap1 = el('div', 'pill', over); chap1.innerHTML = '<b>01</b> · Avant d\'acheter';
  const chip = el('div', 'chip', world); chip.textContent = '🔗  Lien de l\'annonce';
  const btn = el('div', 'btn', world, { width: '520px' }); btn.textContent = 'Analyser';
  const spin = el('div', 'spin', btn); spin.style.display = 'none';
  const FW = L(560, 470);
  const fK = FW / UI['fiche-208'].width, fH = UI['fiche-208'].height * fK;
  const fiche = el('div', 'abs shadow', world, { width: FW + 'px', height: fH + 'px' });
  ui('fiche-208', FW, fiche, 'ui');
  // « Travaux à prévoir + 1 650 € » : lignes 955–1115 de la capture
  const ring = el('div', 'ring', fiche, { left: 34 * fK + 'px', top: 950 * fK + 'px', width: (1050 - 68) * fK + 'px', height: 170 * fK + 'px' });
  // lignes de la fiche que le curseur survole (px de la capture) : verdict, cote, prix réel, prix à proposer
  const fY = (y) => (y - UI['fiche-208'].height / 2) * fK;                // y capture → y monde (fiche centrée)
  const hF = [[24, 84, 1002, 610], [34, 760, 982, 118], [34, 1166, 982, 118], [34, 1328, 982, 222]].map(([x, y, w, h]) => hov(fiche, x * fK, y * fK, w * fK, h * fK));
  const bF = bubble('');
  const tNo = title([["N'achète pas", ''], ['\n', ''], ['à ce prix.', 'it bad']]);
  const tWork = title([['+ 1 650 €', 'bad'], ['\n', ''], ['de travaux', 'it']]);

  const logo = el('img', 'ui', world); logo.src = LOGO.src; logo.style.width = L(760, 720) + 'px';
  const steps = [['1', "Colle l'annonce"], ['2', 'Frais déduits'], ['3', 'Ta marge nette']].map(([n, s]) => {
    const e = el('div', 'step', world); e.innerHTML = `<i>${n}<span class="c">✓</span></i>${s}`; e.check = e.querySelector('.c'); return e;
  });
  const tMarge = title([['Ta marge,', ''], ['\n', ''], ['frais déduits.', 'it']]);

  // Mercedes : vraie photo (profil, ni plaque ni filigrane) + vrai bilan de l'app
  const mPhoto = el('div', 'card', world, { width: L(720, 620) + 'px', height: L(492, 424) + 'px', borderRadius: '44px' });
  const mImg = el('img', 'ui', mPhoto); mImg.src = '../assets/master60/photos/mercedes-profil.jpg'; Object.assign(mImg.style, { width: '100%', height: '100%', objectFit: 'cover' });
  const mRap = cut('merc-rapporte', { x: 0, y: 0, w: 1074, h: 387 }, L(720, 620));
  const mMax = cut('merc-argent', { x: 66, y: 1960, w: 942, h: 286 }, L(720, 620));       // « Prix à ne pas dépasser 16 500 € »
  const hMax = hov(mMax, 10, 10, L(700, 600), 286 * L(720, 620) / 942 - 20);
  const tMax = title([['Ton prix max :', ''], ['\n', ''], ['16 500 €', 'it']]);
  const mHist = cut('merc-historique', { x: 50, y: 860, w: 974, h: 280 }, L(780, 640));   // « Même voiture ailleurs : 2 annonces »
  const hHist = hov(mHist, 12, 12, L(756, 616), 280 * L(780, 640) / 974 - 24);
  const tags = [['17 990 €', 'Bretagne'], ['19 990 €', 'cette annonce'], ['21 990 €', 'Tarn']].map(([p, s], i) => {
    const e = el('div', 'tag', world); e.innerHTML = `${p}<small>${s}</small>`; if (i === 1) e.style.borderColor = 'var(--o)'; return e;
  });
  const t3 = title([['3 annonces.', ''], ['\n', ''], ['3 prix.', 'it']]);

  // =====================================================================================================
  // 02 · APRÈS L'ACHAT
  // =====================================================================================================
  const chap2 = el('div', 'pill', over); chap2.innerHTML = '<b>02</b> · Après l\'achat';
  const t15 = title([['15 voitures', ''], ['\n', ''], ['en stock ?', 'it']]);
  // les 15 voitures du parc de démo (mêmes modèles que le tableau de bord)
  const PARC = ['Clio IV', '308', 'Captur', 'A3', 'Yaris', 'Golf VI', '207', 'C4 Picasso', 'Mégane III', 'Fiesta', 'Auris', 'C3', 'Sandero', 'Clio III', 'Twingo II'];
  const puces = PARC.map((m) => { const e = el('div', 'puce', world); e.innerHTML = `<b>●</b>${m}`; return e; });
  const note = el('div', 'note', world);
  note.innerHTML = 'Clio · 6 700 → marge ?<br>308 : CT ok ? <s>4 100</s> 3 900<br>Captur → baisser ??<br>A3 Lyon… rappeler<br>frais ≈ ?';
  const calc = el('div', 'calc', world); calc.innerHTML = '<div class="ecran">-130</div><div class="k">' + '<span></span>'.repeat(15) + '<span class="o"></span></div>';
  const TABN = ['Annonce Clio', 'Cote 308', 'Carte grise : simulateur', 'Assurance', 'Annonce A3', 'Contrôle technique', 'Pneus prix', 'Annonce Captur',
    'Messages', 'Tableur marges', 'Cote Captur', 'Banque', 'Annonce Polo', 'Calendrier'];
  const tabs = TABN.map((s) => { const e = el('div', 'tab', world); e.textContent = s; return e; });

  const DW = L(820, 600), DK = DW / 1074, DH = 2640 * DK;            // densité de la capture : px film par px image
  const tbHead = cutDof('tb-entete', { x: 0, y: 0, w: 1074, h: 2640 }, DW);   // en-tête + 3 premières décisions
  const dY = (y) => -DH / 2 + y * DK;                                  // y image → y monde (capture centrée sur 0,0)
  const t308 = title([['La 308', ''], ['dort.', 'it']]);
  // survols dans le panneau du tableau de bord (px de la capture, suivent le rognage)
  const hD = { carte: [66, 1350, 942, 405], badge: [270, 1372, 330, 60], lien: [270, 1650, 300, 76] };
  for (const k of Object.keys(hD)) { const [x, y, w, h] = hD[k]; hD[k] = { e: hov(tbHead, x * DK, y * DK, w * DK, h * DK), y: y * DK }; }
  const cur = cursor(world, !BLANC);
  const tbMk = cut('tb-marche-annonce-1', { x: 0, y: 500, w: 840, h: 760 }, L(700, 520));   // sans la vignette photo vide
  const mkK = L(700, 520) / 840, hMkP = hov(tbMk, 40 * mkK, 50 * mkK, 760 * mkK, 100 * mkK), hMkB = hov(tbMk, 60 * mkK, 222 * mkK, 320 * mkK, 92 * mkK);
  const notif = el('div', 'notif', world);
  notif.innerHTML = '<div class="ic"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1a1310" stroke-width="2.4" stroke-linecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></div><div><div class="t">Audi A3 Sportback · −18 % sous la cote</div><div class="s">Nouvelle annonce de « Audi A3 » · à analyser avant les autres</div></div>';
  notif.style.width = L(780, 640) + 'px';
  const tA3 = title([['Une A3', ''], ['\n', ''], ['sous la cote.', 'it']]);
  const tbMarges = cut('tb-marges', { x: 0, y: 0, w: 1074, h: 790 }, L(760, 600));        // en-tête + 6 premières voitures
  const mgK = L(760, 600) / 1074, hRow = hov(tbMarges, 30 * mgK, 0, 1014 * mgK, 74 * mgK);
  const bRow = bubble('Renault Mégane III<small>marge prévue + 1 410 €</small>');
  const tbC1 = ui('tb-chiffre-1', L(300, 300), world, 'ui shadow');
  const tVoit = title([['Ta marge,', ''], ['\n', ''], ['voiture par voiture.', 'it']], L(88, 76));

  // =====================================================================================================
  // LES FORMULES, L'ESSAI, LA SIGNATURE
  // =====================================================================================================
  const oS = cut('offre-starter', { x: 0, y: 0, w: 1050, h: 740 }, L(720, 560));          // nom, prix, 3 premières lignes
  const ofK = L(720, 560) / 1050;
  const hS = [[30, 270, 990, 130], [30, 548, 990, 86], [30, 656, 990, 86]].map(([x, y, w, h]) => hov(oS, x * ofK, y * ofK, w * ofK, h * ofK));
  // interrupteur du film « Je débute | J'ai un parc » (le curseur choisit la formule)
  const seg = el('div', 'seg', over); seg.innerHTML = '<div class="ind"></div><span>Je débute</span><span>J\'ai un parc</span>';
  const segI = seg.querySelector('.ind'), segS = seg.querySelectorAll('span');
  const curO = cursor(over, !BLANC);
  const gauge = el('div', 'gauge', world, { width: L(780, 560) + 'px' });
  gauge.innerHTML = '<div class="h"><span>+ 670 € de marge</span><b>= 44 mois</b></div><div class="bar"><i></i></div><div class="s">Exemple calculé : achetée 5 000 €, 630 € de frais, revendue 6 300 €</div>';
  const gBar = gauge.querySelector('.bar i');
  const tDeb = title([['Tu débutes ?', ''], ['\n', ''], ['Starter.', 'it']]);
  const t3ans = title([['1 voiture', ''], ['\n', ''], ['= 3 ans payés.', 'it']]);
  const oP = cut('offre-pro', { x: 0, y: 0, w: 1050, h: 740 }, L(720, 560));
  const hP = [[30, 270, 990, 130], [30, 548, 990, 86], [30, 656, 990, 86]].map(([x, y, w, h]) => hov(oP, x * ofK, y * ofK, w * ofK, h * ofK));
  const tPro = title([['Un parc ?', ''], ['\n', ''], ['Pro.', 'it']]);
  const bEss = ui('bouton-essai', L(640, 520), world, 'ui');
  const checks = ['3 jours offerts', 'Sans carte bancaire'].map((s) => { const e = el('div', 'check', world); e.innerHTML = `<i>✓</i>${s}`; return e; });
  const tBio = title([[V ? 'Lien en bio' : 'utopicar.fr', 'it'], [' ↑', 'it']], L(88, 80));
  const tFin = title([['Ta prochaine marge,', ''], ['\n', ''], ["avant d'appeler.", 'it']], L(72, 80));
  const endLogo = el('img', 'ui', over); endLogo.src = LOGO.src; endLogo.style.width = L(700, 640) + 'px';
  const endCta = el('div', 'pill', over, { fontSize: L(40, 36) + 'px', padding: '22px 40px' });
  endCta.innerHTML = `<b>3 jours offerts</b> · ${V ? 'Lien en bio' : 'utopicar.fr'}`;

  // mentions (petites, dans la zone sûre)
  const men1 = el('div', 'mention', over); men1.textContent = 'Vraies annonces, analysées par UTOPICAR · 3 et 10 oct. 2026';
  const men2 = el('div', 'mention', over); men2.textContent = 'Données de démonstration';
  const men3 = el('div', 'mention', over); men3.textContent = 'Exemples chiffrés, pas une promesse de gain';

  // ---------- caméra : une cible par plan ----------
  // K(t, x, y, échelle, rx, ry, rz, ressort) : rx > 0 couche le plan vers l'arrière, ry > 0 recule son bord droit
  camK.push(HOOK === 'A' ? K(0, 0, 0, 1.0, 16, -18, -3) : K(0, 0, 0, 1.0, 36, 0, -12));   // A : la 208 de biais ; B : le mur couché
  const C = {
    hook: HOOK === 'A' ? K(0.3, 0, 10, 1.03, 8, -8, -1, { f: 0.35, z: 1 }) : K(2.0, 0, 10, 1.03, 8, -8, -1, { f: 0.8, z: 1 }),
    buy: K(T0 - 0.2, 0, 50, 1.07, 6, 8, 1, { f: 0.7, z: 1 }),                 // poussée vers le prix, la carte pivote
    btn: K(M('colle') - 0.1, 0, 0, 1.0, 4, -4, 0),
    ah: K(BT(8), 0, L(150, 90), 1.12, 3, -2, 0, { f: 0.25, z: 1 }),            // « Ah. » : silence, la caméra s'approche lentement
    no: K(M('non') - 0.05, 0, 0, 1.0, 12, 12, 2, { ex: BEAT * 0.55 }),          // « Non. » : coup de fouet (expo), la fiche de biais
    work: K(M('n1650') - 0.2, 0, L(40, 40), 1.04, 16, 4, 1, { f: 0.8, z: 1 }),  // on glisse vers les lignes chiffrées
    logo: K(M('utopicar') - 0.15, 0, 0, 1.0, 0, 0, 0, { f: 1.0, z: 1 }),      // la marque à plat
    merc: K(M('mercedes') - 0.15, 0, 0, 1.0, 10, -14, -2, { ex: BEAT * 0.7 }), max: K(M('prixmax') - 0.1, 0, L(30, 60), 1.04, 14, -6, -1),
    hist: K(M('attends') - 0.15, 0, 0, 1.0, 16, 10, 3),
    chaos: K(M('quinze') - 0.1, 0, 0, 1.0, 26, 0, -8), chaos2: K(M('onglets'), 0, 0, 0.94, 30, 4, -10),   // le bureau vu de haut
    // « Hop ! » : le tableau de bord, grand plan incliné ; « ce matin » : on glisse sur Votre journée ; « la 308 » : à plat pour le clic
    dash: K(M('hop'), 0, L(-358, -257), 1.0, 22, -14, -5, { f: 1.6, z: 0.9 }),
    jour1: K(BT(51.6), 0, L(-20, 30), 1.0, 21, -12, -4, { ex: BEAT * 0.9 }), jour2: K(BT(53.6), 0, L(334, 326), 1.0, 20, -10, -4, { ex: BEAT * 0.9 }),
    a1: K(M('n308') - 0.15, 0, L(dY(1740), dY(1600)), L(1.1, 1.15), 3, -4, 0),
    mk: K(M('a3') - 0.15, 0, 0, 1.0, 8, 16, 2, { ex: BEAT * 0.7 }), marg: K(M('marge') - 0.15, 0, 0, 1.0, 14, -8, -2, { ex: BEAT * 0.7 }),
    deb: K(M('debutes') - 0.15, 0, 0, 1.0, 8, 12, 1), pro: K(M('parc') - 0.15, 0, 0, 1.0, 10, -10, -1),
    cta: K(M('essaie') - 0.3, 0, 0, 1.04, 0, 0, 0), fin: K(M('chiffres') - 0.2, 0, 0, 1.0, 0, 0, 0),
  };
  for (const k of Object.keys(C)) camK.push(C[k]);
  camK.sort((a, b) => a.t - b.t);

  // ---------- curseurs : arrivées sur les temps (expo), clics → onde ----------
  const yB = L(345, 320), pxP = L(-100, -90), pyP = L(285, 235);
  const sX = -150, sY = (i) => L(30 + i * 115, -10 + i * 108);
  const mY = L(-150, -130), mY2 = mY + L(400, 330);
  const dX = (x) => -DW / 2 + x * DK;
  const mkC = { x: L(0, -60), y: L(80, 60) }, mkX = (x) => mkC.x + (x - 420) * mkK, mkY = (y) => mkC.y + (y - 380) * mkK;
  const mgC = { x: L(-22, 0), y: L(130, 40) }, mgRow = (i) => mgC.y + (-395 + 318 + 84 * i) * mgK;
  const oSY = L(-150, -80), ofX = (x) => (x - 525) * ofK, ofY = (y) => oSY + (y - 370) * ofK;
  const bEY = L(-140, -100);
  const CP = path([
    [0, L(760, 700), L(900, 640)],
    [BT(-6), L(150, 130), L(-90, -70)], [BT(-5), pxP, pyP], [BT(-1), pxP + 20, pyP + 10],             // la 208 : photo, prix, clic
    [BT(1), L(120, 100), L(-120, -100)], [BT(2.5), pxP, pyP],                                       // « Celle-là… » : photo, prix
    [BT(4.6), L(170, 150), pyP - 10], [BT(6), 30, yB + 10], [BT(7), 40, yB + 6], [BT(7.7), L(230, 210), yB + 140],   // glisse le lien, Analyser
    [BT(10.6), L(170, 150), fY(390)], [BT(12), L(200, 170), fY(818)], [BT(13), L(200, 170), fY(1030)],   // la fiche, ligne par ligne
    [BT(14), L(200, 170), fY(1225)], [BT(16), L(200, 170), fY(1440)], [BT(19), L(420, 380), fY(1300)],
    [M('bam') - 0.05, sX, sY(0)], [BT(25) - 0.05, sX, sY(1)], [BT(26) - 0.05, sX, sY(2)],          // coche les 3 étapes
    [BT(29.4), L(200, 180), mY2], [BT(31), L(-120, -100), mY2 + 10],                               // bilan → retourne → 16 500 €
    [BT(33.4), L(-200, -180), L(-160, -140)], [BT(37.5), 20, L(200, 160)], [BT(38.4), L(500, 450), L(300, 260)],
    [BT(50.5), dX(300), dY(140)], [BT(51.5), dX(540), dY(990)], [BT(53.5), dX(260), dY(1260)],     // le tableau de bord
    [BT(56), dX(420), dY(1395)], [BT(58.5), dX(412), dY(1690)], [BT(61.5), dX(700), dY(1900)],
    [BT(63.5), mkX(560), mkY(100)], [BT(65.8), 0, L(-290, -290)], [BT(67.3), mkX(216), mkY(268)], [BT(68.3), L(420, 380), L(300, 260)],
    [BT(71), L(150, 140), mgRow(3)], [BT(72), L(460, 420), mgRow(4) + 100],
    [BT(74), ofX(700), ofY(335)], [BT(75), ofX(600), ofY(591)], [BT(76), ofX(600), ofY(699)], [BT(77), 0, L(310, 270)], [BT(79.5), L(460, 420), L(420, 330)],
    [BT(84.6), 30, bEY + 20], [BT(86.2), L(260, 240), bEY + 220],
  ]);
  const CLICS = [BT(-1), BT(7), M('bam'), BT(25), BT(26), BT(30), BT(60), BT(66), BT(67.5), BT(85)];
  const CWIN = [[0.5, BT(8.2)], [BT(10.3), BT(19.4)], [BT(22.9), BT(26.6)], [BT(28.9), BT(38.2)], [BT(50), BT(61.8)], [BT(62.9), BT(68.5)],
    [BT(70.5), BT(72)], [BT(73.6), BT(79.6)], [BT(84.1), BT(86.4)]];
  // second curseur, à plat (interrupteur des formules, bouton final)
  const segP = L({ x: 540, y: 560 }, { x: 560, y: 700 });
  const segX = (i) => segP.x + segS[i].offsetLeft + segS[i].offsetWidth / 2 - seg.offsetWidth / 2;
  const ctaP = L({ x: 540, y: 1150 }, { x: 960, y: 840 });
  const COP = path([[0, W + 120, H * 0.75], [BT(72.4), segX(0), segP.y], [BT(73.4), segX(0) + 60, segP.y + 170], [BT(80.8), segX(1), segP.y],
    [BT(82), segX(1) + 70, segP.y + 190], [BT(96.4), ctaP.x + 40, ctaP.y], [BT(98), ctaP.x + 160, ctaP.y + 150]]);
  const CLICO = [BT(72.6), BT(81), BT(97)];
  const OWIN = [[BT(71.8), BT(73.6)], [BT(80.2), BT(82.2)], [BT(95.8), 99]];
  const drawCur = (e, t, P, clics, wins, z) => {
    const on = wins.some(([a, b]) => t >= a && t < b); show(e, on); if (!on) return;
    const p = P(t);
    e.style.transform = `translate(${(p.x - 6).toFixed(2)}px,${(p.y - 4).toFixed(2)}px)${z ? ` translateZ(${z}px)` : ''} scale(${(1 - 0.16 * press(t, clics)).toFixed(4)})`;
  };
  const fmtE = (v) => Math.round(v).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ');

  // ---------- seek ----------
  window.seek = function (t) {
    VMAX = 0;
    const c = cam(t);
    { const c2 = cam(t - 1 / 240);                               // vitesse de la caméra (px/s) pour le flou de bougé
      VMAX = Math.max(VMAX, (Math.hypot(c.x - c2.x, c.y - c2.y) * c.s + (Math.abs(c.rx - c2.rx) + Math.abs(c.ry - c2.ry) + Math.abs(c.rz - c2.rz)) * 14) * 240); }
    c.s *= 1 + 0.006 * pulse(t);                               // chaque temps pousse la caméra d'un cheveu
    world.style.transform = `translate(${SX}px,${SY}px) rotateX(${c.rx.toFixed(3)}deg) rotateY(${c.ry.toFixed(3)}deg) rotateZ(${(c.rz + c.r).toFixed(3)}deg) scale(${c.s.toFixed(4)}) translate(${(-c.x).toFixed(2)}px,${(-c.y).toFixed(2)}px)`;
    glow.style.transform = `translate(${(L(-160, 560) + noise(7, t * 0.15) * 120).toFixed(1)}px,${(L(260, -240) + noise(8, t * 0.12) * 140).toFixed(1)}px)`;
    grain.style.transform = `translate(${((t * 977) % 200 - 100).toFixed(0)}px,${((t * 613) % 200 - 100).toFixed(0)}px)`;
    const TT = L({ x: 540, y: 400 }, { x: 560, y: 540 });       // titres : haut de la colonne (9:16), colonne de gauche (16:9)
    TV = 0;

    // ----- ouvertures -----
    const a = HOOK === 'A';
    const pl = spring(t - (M('colle') - 0.15), 'default');
    const atL = { x: 0, y: L(-130, -100) * pl, s: (1 - L(0.16, 0.22) * pl) * (1 - 0.03 * press(t, [BT(-1)])),
      z: 40 * ex(t, BT(-6)) * (1 - ex(t, BT(0))) };                           // le curseur survole : la carte se soulève
    life(ghost, t, BT(-3) - 0.05, T0 - 0.1, { x: L(220, 230), y: L(250, 230), r: 7, z: 90, s: 1 + 0.08 * bump(t, BT(-2) - 0.05, 0.16) },
      { x: -200, y: 40, r: -8, s: -0.4, b: 6 }, { y: -60, z: -100, b: 10 }, 'snappy');
    if (a) {
      life(lst, t, -1, M('non') - 0.08, atL, {}, { y: -40, s: -0.12, b: 16 });
      writeTitle(tA, t, -0.9, T0 - 0.15, TT);            // image 0 : l'accroche est déjà écrite
    } else {
      // le mur défile vers le haut, la 208 sort du mur et vient au centre
      const cols = L(3, 5), gx = L(330, 330), gy = 200, sc = (t < 2.2 ? 0 : spring(t - 2.2, { f: 0.9, z: 1 }));
      tiles.forEach((e, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const x = (c - (cols - 1) / 2) * gx, y0 = r * gy - L(700, 500), y = y0 - stair(t, -8, 8) * 130;
        const z = 1 - 0.18 * ((i * 37) % 5) / 4, s = z * (1 - 0.25 * sc);
        put(e, x * (1 + 0.5 * sc), y, s, (1 - sc * 0.85) * clamp(1 - Math.abs(y) / L(1400, 900), 0, 1), (1 - z) * 10 + sc * 8);
      });
      const p = spring(t - 2.0, { f: 1.1, z: 0.9 });
      show(lst, t >= 1.6 && t < M('non') + 1.1);
      if (t < T0) put(lst, 0, lerp(420, 0, p), lerp(0.4, 1, p), clamp(p * 2, 0, 1), (1 - p) * 8);
      else life(lst, t, -1, M('non') - 0.08, atL, {}, { y: -40, s: -0.12, b: 16 });
      writeTitle(tB, t, -0.9, T0 - 0.15, TT);
    }
    mk.style.transform = `scaleX(${clamp(spring(t - (M('achetes') - 0.25), 'default'), 0, 1.02).toFixed(4)})`;
    writeTitle(tBuy, t, M('celle') + 0.15, M('colle') - 0.1, TT);

    // ----- 01 : la 208 analysée -----
    life(chap1, t, M('colle') - 0.1, M('quinze') - 0.2, L({ x: 540, y: 258 }, { x: 260, y: 120 }), { y: -30, b: 6 }, { y: -30, b: 6 }, 'snappy');
    { // le lien sort de la carte sous le curseur, suit le glisser, se pose dans Analyser
      const cp = CP(t), g = { x: cp.x + 50, y: cp.y + 30 };
      life(chip, t, BT(4.6), BT(6) + 0.05, { x: g.x, y: g.y, z: 50 }, { s: -0.6, z: -40, b: 4 }, { s: -0.6, b: 4 }, 'snappy');
    }
    const bw = 520 - 408 * spring(t - BT(7), 'snappy');
    btn.style.width = bw.toFixed(1) + 'px';
    btn.style.color = bw < 300 ? 'transparent' : '#1a1310';
    show(spin, bw < 200); spin.style.transform = `rotate(${((Math.min(t, BT(8)) - BT(7)) * 540) % 360}deg)`;   // « Ah. » : le chargement se fige
    life(btn, t, BT(5.4), M('non') - 0.06, { x: 0, y: yB, z: 60, s: 1 + 0.06 * bump(t, BT(6) - 0.02, 0.14) }, { y: 80, z: 200, b: 6 }, { s: -0.4, b: 8 }, 'snappy');
    life(fiche, t, M('non') - 0.06, M('utopicar') - 0.25, { x: 0, y: 0, rx: 4, ry: -4 }, { y: 120, s: -0.08, b: 12 }, { x: L(-80, -200), y: -60, s: -0.1, b: 14 });
    fiche.style.transform += ` rotate(${(3 * spring(t - M('bizarre'), 'default') - 3 * spring(t - M('bizarre') - 0.45, 'heavy')).toFixed(2)}deg)`;
    { const p = spring(t - (M('n1650') - 0.1), 'snappy');
      ring.style.transform = `scale(${(1.12 - 0.12 * p).toFixed(4)})`; ring.style.opacity = clamp(p * 1.5, 0, 1).toFixed(3); }
    lit(hF[0], t, BT(10.4), BT(11.8)); lit(hF[1], t, BT(12) - 0.05, BT(12.9)); lit(hF[2], t, BT(14) - 0.05, BT(15.8)); lit(hF[3], t, BT(16) - 0.05, BT(18.4));
    { const v = 7190 + 1650 * ex(t, BT(14), BEAT * 1.4);               // prix réel : 7 190 + 1 650, compté en expo
      bF.innerHTML = `${fmtE(v)} €<small>prix réel = 7 190 € + 1 650 € de travaux</small>`;
      life(bF, t, BT(14) - 0.05, BT(18.4), { x: L(0, FW / 2 + 190), y: fY(1166) - L(150, 40), z: 70 }, { y: 30, s: -0.3, b: 4 }, { y: -30, b: 6 }, 'snappy'); }
    writeTitle(tNo, t, M('non') + 0.1, M('n1650') - 0.2, TT);
    writeTitle(tWork, t, M('n1650') - 0.05, M('utopicar') - 0.3, TT);

    life(logo, t, M('utopicar') - 0.1, M('mercedes') - 0.3, { x: 0, y: -170 }, { s: -0.3, b: 12 }, { y: -80, b: 10 }, 'heavy');
    steps.forEach((e, i) => {
      const ck = [M('bam'), BT(25), BT(26)][i];
      life(e, t, BT(21 + i * 0.5), M('mercedes') - 0.3, L({ x: 0, y: 30 + i * 115, s: 1 + 0.05 * bump(t, ck, 0.14) }, { x: 0, y: -10 + i * 108, s: 1 + 0.05 * bump(t, ck, 0.14) }), { y: 50, s: -0.2, b: 8 }, { y: -60, b: 8 }, 'snappy');
      const q = ex(t, ck, BEAT * 0.6); e.check.style.transform = `scale(${q.toFixed(3)})`; e.check.style.opacity = clamp(q * 2, 0, 1).toFixed(3);
    });
    writeTitle(tMarge, t, M('reste') - 0.1, M('mercedes') - 0.3, TT);

    life(mPhoto, t, M('mercedes') - 0.1, M('attends') - 0.25, { x: 0, y: mY }, { x: 200, ry: -30, b: 12 }, { y: -80, s: -0.1, b: 12 });
    const fl = clamp((t - BT(30)) / 0.22, 0, 1), fl2 = clamp((t - BT(30) - 0.22) / 0.4, 0, 1);   // retournement : expo in, puis expo out
    life(mRap, t, BT(28.6), BT(30) + 0.24, { x: L(-8, 0), y: mY2, z: 30, ry: 90 * expoIn(fl) }, { y: 60, z: 300, b: 8 }, { b: 2 }, 'snappy');
    life(mMax, t, BT(30) + 0.2, M('attends') - 0.25, { x: L(-8, 0), y: mY2, z: 30, ry: -90 * (1 - expoOut(fl2)) }, { b: 2 }, { y: -60, b: 10 }, 'snappy');
    lit(hMax, t, BT(31), BT(32.6)); lit(hHist, t, BT(34), BT(35.2));
    writeTitle(tMax, t, M('prixmax') - 0.05, M('attends') - 0.3, TT);
    life(mHist, t, M('attends') - 0.1, M('quinze') - 0.25, { x: 0, y: L(-160, -140) }, { y: 80, b: 10 }, { y: -80, b: 10 });
    tags.forEach((e, i) => {                                   // une étiquette par temps ; celle du milieu se soulève au survol
      const hv = i === 1 ? ex(t, BT(37.5)) : 0;
      life(e, t, BT(35 + i) - 0.08, M('quinze') - 0.25, L({ x: (i - 1) * 262, y: 200, z: 80 + 50 * hv, s: 1 + 0.06 * hv }, { x: (i - 1) * 280, y: 160, z: 80 + 50 * hv, s: 1 + 0.06 * hv }), { y: -80, z: 700, b: 6 }, { y: 120, b: 8 }, 'snappy');
    });
    writeTitle(t3, t, M('trois') - 0.2, M('quinze') - 0.3, TT);

    // ----- 02 : le chaos, puis le tableau de bord -----
    life(chap2, t, M('quinze') - 0.05, END - 0.2, L({ x: 540, y: 258 }, { x: 260, y: 120 }), { y: -30, b: 6 }, { y: -30, b: 6 }, 'snappy');
    writeTitle(t15, t, M('quinze') + 0.05, M('carnet') - 0.15, TT);
    puces.forEach((e, i) => {
      const cl = L(3, 5), cc = i % cl, rr = Math.floor(i / cl);
      const sag = spring(t - (M('pfff') + i * 0.02), 'default'), fall = ex(t, BT(43) + i * BEAT / 8, BEAT, expoIn);
      life(e, t, BT(38) + i * BEAT / 4, BT(44.2), { x: (cc - (cl - 1) / 2) * L(250, 230) + ((i * 37) % 30) - 15, y: (rr - (L(5, 3) - 1) / 2) * L(100, 110) + L(60, 40) + 40 * sag + 700 * fall,
        r: (((i * 53) % 13) - 6) * sag, z: 40 - 300 * fall, s: 1 - 0.05 * sag }, { z: 500, y: -60, b: 6 }, {}, 'snappy');
    });
    const hop = M('hop');
    const k = spring(t - hop, { f: 2.4, z: 0.85 });          // « Hop ! » : tout se range d'un coup
    const kc = expoIn(clamp((t - hop + 0.06) / 0.2, 0, 1));    // « Hop ! » : tout est aspiré au centre (expo)
    if (t > hop - 0.1 && t < hop + 0.3) VMAX = Math.max(VMAX, 2600);
    const shake = ex(t, BT(48.3), BEAT * 0.7) * (1 - kc) * 9;   // trop d'onglets : le bureau tremble
    const chaos = (e, a0, at) => {
      const at2 = { ...at, x: at.x + noise(11 + (at.r || 0), t * 9) * shake, y: at.y + noise(17 + (at.r || 0), t * 9) * shake };
      const v = life(e, t, a0, null, at2, { z: 900, y: -160, r: -12, b: 6 }, {}, { f: 2.2, z: 0.6 });
      if (t >= hop - 0.06) put(e, lerp(at.x, 0, kc), lerp(at.y, 0, kc), 1 - 0.9 * kc, 1 - kc, kc * 8, (at.r || 0) * (1 - kc), 0, 0, -300 * kc);
      show(e, t >= a0 - 0.02 && kc < 0.98); return v;
    };
    chaos(note, BT(44) - 0.08, L({ x: -115, y: -20, r: -6 }, { x: -260, y: 0, r: -6 }));
    chaos(calc, BT(45) - 0.08, L({ x: 205, y: 130, r: 7 }, { x: 240, y: 40, r: 7 }));
    calc.firstChild.textContent = t < BT(45.5) ? '0' : t < BT(46) ? '-1' : t < BT(46.5) ? '-13' : '-130';
    tabs.forEach((e, i) => chaos(e, BT(46) + i * BEAT * 3 / 14, { x: L(-248, -600) + (i % 4) * L(150, 300) + ((i * 53) % 40), y: L(-560, -380) + Math.floor(i / 4) * 92 + ((i * 29) % 30), r: ((i * 7) % 9) - 4 }));

    // « La 308 » : le haut du panneau (bonjour, bouton) se rogne jusqu'à « Votre journée » ; le contenu ne bouge pas
    const pr8 = spring(t - (M('n308') - 0.25), 'default'), rog = 1215 * DK * pr8, rogB = 425 * DK * pr8;   // bas : après la 2e décision
    tbHead.style.height = (DH - rog - rogB).toFixed(2) + 'px';
    for (const im of tbHead.children) if (im.tagName === 'IMG') im.style.top = (-rog).toFixed(2) + 'px';
    for (const k of Object.keys(hD)) hD[k].e.style.top = (hD[k].y - rog).toFixed(2) + 'px';
    lit(hD.carte.e, t, BT(56) - 0.05, BT(61.6)); lit(hD.badge.e, t, BT(57), BT(58.6)); lit(hD.lien.e, t, BT(58.6), BT(61.2));
    life(tbHead, t, hop - 0.02, M('a3') - 0.25, { x: 0, y: (rog - rogB) / 2 }, { z: -1400, b: 8 }, { y: -100, b: 10 }, { f: 2.0, z: 0.9 });
    focus(tbHead, c.y + DH / 2 - 120, 420 + (1 - clamp(c.rx / 16, 0, 1)) * 2400);   // net un peu au-dessus du point visé (ce qu'on lit)
    writeTitle(t308, t, M('n308') - 0.05, M('a3') - 0.3, TT);
    // le curseur appuie sur « Ajuster le prix → » de la 1re décision (coordonnées de la capture)
    drawCur(cur, t, CP, CLICS, CWIN, 40);
    ripples(t, world, CLICS, (c) => CP(c), 45);

    life(tbMk, t, M('a3') - 0.15, M('marge') - 0.25, { x: L(0, -60), y: L(80, 60) }, { x: 240, b: 10 }, { x: -240, b: 10 });
    lit(hMkP, t, BT(63.4), BT(64.8)); lit(hMkB, t, BT(67.2), BT(68.6));
    life(notif, t, M('ding') - 0.08, M('marge') - 0.25, { x: 0, y: L(-290, -290), z: 80, r: 3 * Math.sin((t - M('ding')) * 40) * Math.exp(-Math.max(0, t - M('ding')) * 7),
      s: 1 - 0.03 * press(t, [BT(66)]) }, { y: -80, z: 600, s: -0.1, b: 6 }, { y: -80, b: 6 }, 'snappy');
    writeTitle(tA3, t, M('a3') - 0.05, M('marge') - 0.3, TT);

    life(tbMarges, t, M('marge') - 0.15, M('debutes') - 0.25, { x: L(-22, 0), y: L(130, 40) }, { y: 120, b: 10 }, { y: -100, b: 10 });
    { const row = stair(t, 69, 5, 0.5); hRow.style.top = ((318 - 37 + 84 * row) * mgK).toFixed(2) + 'px'; lit(hRow, t, BT(69), BT(72.2));
      life(bRow, t, BT(71) - 0.05, BT(72), { x: L(60, 60), y: mgRow(3) - 80, z: 70 }, { y: 30, s: -0.3, b: 4 }, { y: -30, b: 6 }, 'snappy'); }
    life(tbC1, t, M('voiture') - 0.1, M('debutes') - 0.25, { x: L(222, 260), y: L(-230, -240), z: L(140, 80) }, { z: 500, s: -0.2, b: 8 }, { y: -80, b: 8 }, 'snappy');
    writeTitle(tVoit, t, M('marge') - 0.05, M('debutes') - 0.3, TT);

    // ----- formules -----
    // Starter seule, puis Pro arrive : 9:16 empilées (Starter monte), 16:9 côte à côte
    const pp = spring(t - (M('parc') - 0.2), 'default');
    life(oS, t, M('debutes') - 0.1, M('essaie') - 0.35, L({ x: 0, y: -150 - 65 * pp, s: 1 - 0.22 * pp }, { x: -120 * pp, y: -80 - 50 * pp, s: 1 - 0.2 * pp }), { y: 140, b: 10 }, { x: -200, b: 10 });
    life(gauge, t, M('seule') - 0.1, M('parc') - 0.3, { x: 0, y: L(290, 250), z: 30 }, { y: 80, z: 300, b: 8 }, { y: 80, b: 8 }, 'snappy');
    const gf = stair(t, 76, 4) / 4;                                 // la jauge monte d'un quart par temps
    gBar.style.transform = `scaleX(${gf.toFixed(4)})`;
    gauge.querySelector('b').textContent = `= ${Math.round(44 * gf)} mois`;
    gauge.querySelector('b').style.transform = `scale(${(1 + 0.12 * bump(t, BT(80) - 0.05, 0.16)).toFixed(4)})`;
    gauge.querySelector('b').style.display = 'inline-block';
    lit(hS[0], t, BT(74) - 0.05, BT(74.9)); lit(hS[1], t, BT(75) - 0.05, BT(75.9)); lit(hS[2], t, BT(76) - 0.05, BT(76.9));
    lit(hP[0], t, BT(82.4), BT(83.2)); lit(hP[1], t, BT(83.2), BT(84));
    { // interrupteur : « Je débute » puis « J'ai un parc », l'indicateur glisse (bord avant plus raide)
      life(seg, t, BT(72) - 0.05, M('essaie') - 0.35, segP, { y: -30, s: -0.2, b: 6 }, { y: -30, b: 6 }, 'snappy');
      const a0 = segS[0].offsetLeft, a1 = a0 + segS[0].offsetWidth, b0 = segS[1].offsetLeft, b1 = b0 + segS[1].offsetWidth;
      const ind = Motion.indicator(t, [[0, a0, a1], [BT(81), b0, b1]]);
      Object.assign(segI.style, { left: ind.lo.toFixed(1) + 'px', width: (ind.hi - ind.lo).toFixed(1) + 'px', opacity: ex(t, BT(72.6), 0.2).toFixed(3),
        transform: `scale(${(0.6 + 0.4 * ex(t, BT(72.6), 0.3)).toFixed(3)})` });
      segS[0].style.color = t < BT(81) && t > BT(72.6) ? '#1a1310' : ''; segS[1].style.color = t >= BT(81) ? '#1a1310' : '';
    }
    writeTitle(tDeb, t, M('debutes') - 0.05, M('seule') - 0.3, TT);
    writeTitle(t3ans, t, M('seule') - 0.05, M('parc') - 0.3, TT);
    life(oP, t, M('parc') - 0.1, M('essaie') - 0.35, L({ x: 0, y: 215, s: 0.78, z: 60 }, { x: 130, y: 100, s: 0.9, z: 90 }), L({ y: 300, z: 400, b: 10 }, { x: 400, z: 400, b: 10 }), { x: 200, b: 10 });
    writeTitle(tPro, t, M('parc') - 0.05, M('essaie') - 0.4, TT);

    // ----- essai -----
    life(bEss, t, M('essaie') - 0.3, M('chiffres') - 0.25, { x: 0, y: L(-140, -100) }, { s: -0.3, b: 10 }, { y: -80, b: 10 }, 'snappy');
    bEss.style.transform += ` scale(${(1 - 0.06 * press(t, [BT(85)])).toFixed(4)})`;
    checks.forEach((e, i) => life(e, t, BT(86 + i) - 0.06, M('chiffres') - 0.25, { x: L(0, -40), y: L(80 + i * 100, 60 + i * 90) }, { x: -60, b: 6 }, { y: 60, b: 6 }, 'snappy'));
    writeTitle(tBio, t, M('bio') - 0.2, M('chiffres') - 0.3, TT);
    writeTitle(tFin, t, M('chiffres') - 0.1, END - 0.2, L({ x: 540, y: 700 }, { x: 960, y: 420 }));

    // ----- carton final -----
    life(endLogo, t, M('utopicar2') - 0.1, null, L({ x: 540, y: 960 }, { x: 960, y: 700 }), { y: 40, s: -0.2, b: 8 }, {}, 'heavy');
    life(endCta, t, END - 0.1, null, { ...ctaP, s: (1 + 0.025 * pulse(t)) * (1 - 0.05 * press(t, [BT(97)])) }, { y: 40, b: 6 }, {}, 'snappy');
    drawCur(curO, t, COP, CLICO, OWIN);
    ripples(t, over, CLICO, (c) => COP(c), 0);

    // ----- mentions -----
    const mPos = L({ x: 540, y: 1452 }, { x: 560, y: 946 });      // 16:9 : sous le titre, à gauche de l'interface
    life(men1, t, 0, M('quinze') - 0.3, mPos, { y: 10 }, { y: 10 }, 'snappy');
    life(men2, t, hop, M('debutes') - 0.3, mPos, { y: 10 }, { y: 10 }, 'snappy');
    // 16:9 : la dernière mention glisse au centre avec le carton final
    life(men3, t, M('debutes'), null, { x: mPos.x + L(0, 400) * spring(t - (M('chiffres') - 0.1), 'default'), y: mPos.y }, { y: 10 }, {}, 'snappy');
    veil.style.opacity = (0.3 + 0.7 * TV).toFixed(3);
  };

  // flou de bougé au rendu (MB=8) : l'obturateur s'ouvre avec la vitesse, dans sa direction (sous-images accumulées)
  window.shutter = (t) => { window.seek(t); return VMAX < 260 ? 0 : clamp((VMAX - 260) / 2000, 0.2, 0.9); };
  window.samples = (t) => { window.seek(t); return VMAX > 1400 ? 8 : 4; };
  window.filmDur = DUR;
  window.seek(0);
  window.filmReady = true;
})();
