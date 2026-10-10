// master60 « UTOPICAR, la pub d'une minute » (58,5 s). Contrat : window.seek(t) peint la frame t, sans état entre les frames.
// Paramètres : ?fmt=vertical|desktop (mise en page recomposée, pas recadrée), ?hook=A|B (0–4,23 s, même corps ensuite).
// Minutage : audio/vo-master60/vo-timing.json (scripts/vo-timing-master60.py) ; chaque plan part sur le mot de Simon.
// Interface : vraies captures des composants de l'app (video/capture-web, données démo) dans film-master60/ui/.
(async function () {
  const { spring, track, clamp, lerp, noise } = Motion;
  const { el, show, text, typeText, cursor, moveCursor, bump } = Kit;
  const Q = new URLSearchParams(location.search);
  const FMT = Q.get('fmt') || 'vertical', HOOK = (Q.get('hook') || 'A').toUpperCase();
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
  const DUR = 58.5, END = 54.7;      // carton final de END à DUR
  const MUR = (await (await fetch('../assets/master60/annonces-mur.json')).json()).annonces;

  await Promise.all(['600 96px Clash', '700 30px Satoshi', '500 24px Satoshi', 'italic 96px Instrument'].map((f) => document.fonts.load(f)));

  // ---------- images ----------
  const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(i); i.src = src; });
  const UI = {};
  for (const n of ['fiche-208', 'merc-rapporte', 'merc-argent', 'merc-verdict', 'merc-historique', 'offre-starter', 'offre-pro', 'bouton-essai',
    'tb-entete', 'tb-marche-annonce-1', 'tb-marges', 'tb-chiffre-1']) UI[n] = await load(`ui/${n}.png`);
  const LOGO = await load('../assets/brand/official/utopicar-logo-horizontal-fond-sombre.svg');

  // ---------- décor : fond chaud, lueur orange lente, grain ----------
  const glow = el('div', 'glow', stage, { width: '1400px', height: '1400px', background: 'radial-gradient(closest-side,rgba(255,90,31,.20),rgba(255,90,31,0))' });
  const world = el('div', 'world', stage, { width: W + 'px', height: H + 'px', transformOrigin: '0 0' });   // origine 0,0 : la caméra pousse autour du point visé
  // voile sombre derrière la bande des titres (MO6) : les cartes passent dessous quand la caméra pousse
  const veil = el('div', 'abs', stage, { width: W + 'px', height: H + 'px', pointerEvents: 'none', background: V
    ? 'linear-gradient(180deg,rgba(11,10,9,.94) 0,rgba(11,10,9,.86) 470px,rgba(11,10,9,0) 640px)'
    : 'linear-gradient(90deg,rgba(11,10,9,.94) 0,rgba(11,10,9,.84) 820px,rgba(11,10,9,0) 1020px)' });
  const over = el('div', 'abs', stage, { width: W + 'px', height: H + 'px' });     // titres, mentions : hors caméra (zones sûres)
  el('div', '', stage).id = 'vign';
  const grain = el('div', '', stage); grain.id = 'grain';

  // pose par le centre, avec un léger 3D ; o = opacité, b = flou
  function put(e, x, y, s = 1, o = 1, b = 0, r = 0, rx = 0, ry = 0) {
    e.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) translate(-50%,-50%) perspective(1800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
    e.style.opacity = clamp(o, 0, 1).toFixed(3);
    e.style.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : '';
  }
  // entrée et sortie en mouvement (jamais une opacité seule) : from / to = décalages {x, y, s, r, b}
  function life(e, t, a, b, at, from = { y: 60, s: -0.06, b: 10 }, to = { y: -60, s: -0.04, b: 10 }, pin = 'default') {
    const vis = t >= a - 0.02 && (b == null || t < b + 1.1);
    show(e, vis); if (!vis) return 0;
    const i = spring(t - a, pin), o = b == null ? 0 : spring(t - b, 'snappy');
    const d = (k) => (1 - i) * (from[k] || 0) + o * (to[k] || 0);
    put(e, at.x + d('x'), at.y + d('y'), (at.s || 1) * (1 + d('s')), clamp(i * 1.6, 0, 1) * (1 - clamp(o * 1.4, 0, 1)), d('b'),
      (at.r || 0) + d('r'), at.rx || 0, at.ry || 0);
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
  // titre en deux tons : segs = [['Payée', ''], ['deux fois ?', 'it']] ; écrit lettre à lettre, sort en montant
  function title(segs, size) { const b = text(over, segs); b.style.fontSize = (size || L(96, 84)) + 'px'; b.style.display = 'none'; return b; }
  let TV = 0;     // présence d'un titre à cette frame (0 → 1) : le voile ne s'assombrit que sous un titre
  function writeTitle(b, t, a, z, at) {
    TV = Math.max(TV, clamp(spring(t - (a - 0.35), 'default') * (1 - spring(t - (z + 0.15), 'default')), 0, 1));
    const vis = t >= a - 0.02 && t < z + 0.8; show(b, vis); if (!vis) return;
    put(b, at.x, at.y + (1 - spring(t - a, 'heavy')) * 18, 1, 1);
    typeText(b, t, a, z, 0.028, 30);
  }

  // ---------- caméra à point focal (le monde est posé autour de 0,0) ----------
  // écran : le point visé tombe au centre de la zone d'image (sous le titre en 9:16, à droite du titre en 16:9)
  const SX = L(540, 1340), SY = L(980, 560);
  const camK = [];    // [t, x, y, s] ; chaque cible part sur un spring lent
  const cam = (t) => {
    let x = camK[0][1], y = camK[0][2], s = camK[0][3];
    for (let i = 1; i < camK.length; i++) {
      const [ti, xi, yi, si, pr] = camK[i], p = spring(t - ti, pr || { f: 0.9, z: 1 });
      x += (xi - camK[i - 1][1]) * p; y += (yi - camK[i - 1][2]) * p; s += (si - camK[i - 1][3]) * p;
    }
    return { x: x + noise(1, t * 0.35) * 6, y: y + noise(2, t * 0.3) * 6, s, r: noise(3, t * 0.25) * 0.35 };
  };

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
  const tNo = title([["N'achète pas", ''], ['\n', ''], ['à ce prix.', 'it bad']]);
  const tWork = title([['+ 1 650 €', 'bad'], ['\n', ''], ['de travaux', 'it']]);

  const logo = el('img', 'ui', world); logo.src = LOGO.src; logo.style.width = L(760, 720) + 'px';
  const steps = [['1', "Colle l'annonce"], ['2', 'Frais déduits'], ['3', 'Ta marge nette']].map(([n, s]) => {
    const e = el('div', 'step', world); e.innerHTML = `<i>${n}</i>${s}`; return e;
  });
  const tMarge = title([['Ta marge,', ''], ['\n', ''], ['frais déduits.', 'it']]);

  // Mercedes : vraie photo (profil, ni plaque ni filigrane) + vrai bilan de l'app
  const mPhoto = el('div', 'card', world, { width: L(720, 620) + 'px', height: L(492, 424) + 'px', borderRadius: '44px' });
  const mImg = el('img', 'ui', mPhoto); mImg.src = '../assets/master60/photos/mercedes-profil.jpg'; Object.assign(mImg.style, { width: '100%', height: '100%', objectFit: 'cover' });
  const mRap = ui('merc-rapporte', L(720, 620), world, 'ui shadow');
  const mMax = cut('merc-argent', { x: 66, y: 1960, w: 942, h: 286 }, L(720, 620));       // « Prix à ne pas dépasser 16 500 € »
  const tMax = title([['Ton prix max :', ''], ['\n', ''], ['16 500 €', 'it']]);
  const mHist = cut('merc-historique', { x: 50, y: 860, w: 974, h: 280 }, L(780, 640));   // « Même voiture ailleurs : 2 annonces »
  const tags = [['17 990 €', 'Bretagne'], ['19 990 €', 'cette annonce'], ['21 990 €', 'Tarn']].map(([p, s], i) => {
    const e = el('div', 'tag', world); e.innerHTML = `${p}<small>${s}</small>`; if (i === 1) e.style.borderColor = 'var(--o)'; return e;
  });
  const t3 = title([['3 annonces.', ''], ['\n', ''], ['3 prix.', 'it']]);

  // =====================================================================================================
  // 02 · APRÈS L'ACHAT
  // =====================================================================================================
  const chap2 = el('div', 'pill', over); chap2.innerHTML = '<b>02</b> · Après l\'achat';
  const t15 = title([['15 voitures', ''], ['\n', ''], ['en stock ?', 'it']]);
  const note = el('div', 'note', world);
  note.innerHTML = 'Clio · 6 700 → marge ?<br>308 : CT ok ? <s>4 100</s> 3 900<br>Captur → baisser ??<br>A3 Lyon… rappeler<br>frais ≈ ?';
  const calc = el('div', 'calc', world); calc.innerHTML = '<div class="ecran">-130</div><div class="k">' + '<span></span>'.repeat(15) + '<span class="o"></span></div>';
  const TABN = ['Annonce Clio', 'Cote 308', 'Carte grise : simulateur', 'Assurance', 'Annonce A3', 'Contrôle technique', 'Pneus prix', 'Annonce Captur',
    'Messages', 'Tableur marges', 'Cote Captur', 'Banque', 'Annonce Polo', 'Calendrier'];
  const tabs = TABN.map((s) => { const e = el('div', 'tab', world); e.textContent = s; return e; });

  const DW = L(820, 600), DK = DW / 1074, DH = 2215 * DK;            // densité de la capture : px film par px image
  const tbHead = cut('tb-entete', { x: 0, y: 0, w: 1074, h: 2215 }, DW);
  const dY = (y) => -DH / 2 + y * DK;                                  // y image → y monde (capture centrée sur 0,0)
  const t308 = title([['La 308', ''], ['dort.', 'it']]);
  const cur = cursor(world, true);
  const tbMk = cut('tb-marche-annonce-1', { x: 0, y: 500, w: 840, h: 760 }, L(700, 520));   // sans la vignette photo vide
  const notif = el('div', 'notif', world);
  notif.innerHTML = '<div class="ic"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1a1310" stroke-width="2.4" stroke-linecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></div><div><div class="t">Audi A3 Sportback · −18 % sous la cote</div><div class="s">Nouvelle annonce de « Audi A3 » · à analyser avant les autres</div></div>';
  notif.style.width = L(780, 640) + 'px';
  const tA3 = title([['Une A3', ''], ['\n', ''], ['sous la cote.', 'it']]);
  const tbMarges = cut('tb-marges', { x: 0, y: 0, w: 1074, h: 790 }, L(760, 600));        // en-tête + 6 premières voitures
  const tbC1 = ui('tb-chiffre-1', L(300, 300), world, 'ui shadow');
  const tVoit = title([['Ta marge,', ''], ['\n', ''], ['voiture par voiture.', 'it']], L(88, 76));

  // =====================================================================================================
  // LES FORMULES, L'ESSAI, LA SIGNATURE
  // =====================================================================================================
  const oS = cut('offre-starter', { x: 0, y: 0, w: 1050, h: 740 }, L(720, 560));          // nom, prix, 3 premières lignes
  const gauge = el('div', 'gauge', world, { width: L(780, 560) + 'px' });
  gauge.innerHTML = '<div class="h"><span>+ 670 € de marge</span><b>= 44 mois</b></div><div class="bar"><i></i></div><div class="s">Exemple calculé : achetée 5 000 €, 630 € de frais, revendue 6 300 €</div>';
  const gBar = gauge.querySelector('.bar i');
  const tDeb = title([['Tu débutes ?', ''], ['\n', ''], ['Starter.', 'it']]);
  const t3ans = title([['1 voiture', ''], ['\n', ''], ['= 3 ans payés.', 'it']]);
  const oP = cut('offre-pro', { x: 0, y: 0, w: 1050, h: 740 }, L(720, 560));
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
  camK.push([0, 0, 0, 1.0]);
  const C = {
    hook: [0, 0, 10, 1.03],
    buy: [T0 - 0.2, 0, 50, 1.07, { f: 0.7, z: 1 }],                // poussée vers le prix
    btn: [M('colle') - 0.1, 0, 0, 1.0],
    no: [M('non') - 0.05, 0, 0, 1.0, { f: 1.4, z: 0.9 }],                 // la fiche entière (verdict en haut)
    work: [M('n1650') - 0.2, 0, L(20, 30), 1.04, { f: 0.8, z: 1 }],       // légère poussée vers les lignes chiffrées
    logo: [M('utopicar') - 0.15, 0, 0, 1.0, { f: 1.0, z: 1 }],
    merc: [M('mercedes') - 0.15, 0, 0, 1.0], max: [M('prixmax') - 0.1, 0, L(30, 60), 1.04],
    hist: [M('attends') - 0.15, 0, 0, 1.0],
    chaos: [M('quinze') - 0.1, 0, 0, 1.0], chaos2: [M('onglets'), 0, 0, 0.94],
    // « Hop ! » : le haut du tableau de bord ; « ce matin » : on descend sur Votre journée ; « la 308 » : zoom sur la 1re décision
    dash: [M('hop'), 0, L(-196, -139), 1.0, { f: 1.6, z: 0.9 }], jour: [M('tableau') + 0.3, 0, L(520, 380), 1.0, { f: 0.8, z: 1 }],
    a1: [M('n308') - 0.15, 0, dY(1600), L(1.1, 1.15)],
    mk: [M('a3') - 0.15, 0, 0, 1.0], marg: [M('marge') - 0.15, 0, 0, 1.0],
    deb: [M('debutes') - 0.15, 0, 0, 1.0], pro: [M('parc') - 0.15, 0, 0, 1.0], cta: [M('essaie') - 0.3, 0, 0, 1.04],
    fin: [M('chiffres') - 0.2, 0, 0, 1.0],
  };
  for (const k of Object.keys(C)) camK.push(C[k]);
  camK.sort((a, b) => a[0] - b[0]);

  // ---------- seek ----------
  window.seek = function (t) {
    const c = cam(t);
    world.style.transform = `translate(${SX}px,${SY}px) rotate(${c.r.toFixed(3)}deg) scale(${c.s.toFixed(4)}) translate(${(-c.x).toFixed(2)}px,${(-c.y).toFixed(2)}px)`;
    glow.style.transform = `translate(${(L(-160, 560) + noise(7, t * 0.15) * 120).toFixed(1)}px,${(L(260, -240) + noise(8, t * 0.12) * 140).toFixed(1)}px)`;
    grain.style.transform = `translate(${((t * 977) % 200 - 100).toFixed(0)}px,${((t * 613) % 200 - 100).toFixed(0)}px)`;
    const TT = L({ x: 540, y: 400 }, { x: 560, y: 540 });       // titres : haut de la colonne (9:16), colonne de gauche (16:9)
    TV = 0;

    // ----- ouvertures -----
    const a = HOOK === 'A';
    const pl = spring(t - (M('colle') - 0.15), 'default');
    const atL = { x: 0, y: L(-130, -100) * pl, s: 1 - L(0.16, 0.22) * pl };
    if (a) {
      life(lst, t, -1, M('ah') - 0.05, atL, {}, { y: -40, s: -0.12, b: 16 });
      writeTitle(tA, t, -0.9, T0 - 0.15, TT);            // image 0 : l'accroche est déjà écrite
    } else {
      // le mur défile vers le haut, la 208 sort du mur et vient au centre
      const cols = L(3, 5), gx = L(330, 330), gy = 200, sc = (t < 2.2 ? 0 : spring(t - 2.2, { f: 0.9, z: 1 }));
      tiles.forEach((e, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const x = (c - (cols - 1) / 2) * gx, y0 = r * gy - L(700, 500), y = y0 - t * 240;
        const z = 1 - 0.18 * ((i * 37) % 5) / 4, s = z * (1 - 0.25 * sc);
        put(e, x * (1 + 0.5 * sc), y, s, (1 - sc * 0.85) * clamp(1 - Math.abs(y) / L(1400, 900), 0, 1), (1 - z) * 10 + sc * 8);
      });
      const p = spring(t - 2.0, { f: 1.1, z: 0.9 });
      show(lst, t >= 1.6 && t < M('ah') + 1.1);
      if (t < T0) put(lst, 0, lerp(420, 0, p), lerp(0.4, 1, p), clamp(p * 2, 0, 1), (1 - p) * 8);
      else life(lst, t, -1, M('ah') - 0.05, atL, {}, { y: -40, s: -0.12, b: 16 });
      writeTitle(tB, t, -0.9, T0 - 0.15, TT);
    }
    mk.style.transform = `scaleX(${clamp(spring(t - (M('achetes') - 0.25), 'default'), 0, 1.02).toFixed(4)})`;
    writeTitle(tBuy, t, M('celle') + 0.15, M('colle') - 0.1, TT);

    // ----- 01 : la 208 analysée -----
    life(chap1, t, M('colle') - 0.1, M('quinze') - 0.2, L({ x: 540, y: 258 }, { x: 260, y: 120 }), { y: -30, b: 6 }, { y: -30, b: 6 }, 'snappy');
    const yB = L(345, 320);
    life(chip, t, M('colle') - 0.15, M('colle') + 0.55, { x: 0, y: yB - L(115, 110) }, { x: -260, y: 40, b: 6 }, { y: 90, s: -0.5, b: 4 }, 'snappy');
    const bw = 520 - 408 * spring(t - (M('colle') + 0.5), 'snappy');
    btn.style.width = bw.toFixed(1) + 'px';
    btn.style.color = bw < 300 ? 'transparent' : '#1a1310';
    show(spin, bw < 200); spin.style.transform = `rotate(${(t * 540) % 360}deg)`;
    life(btn, t, M('colle') - 0.05, M('ah') - 0.02, { x: 0, y: yB }, { y: 80, b: 6 }, { s: -0.4, b: 8 }, 'snappy');
    life(fiche, t, M('non') - 0.06, M('utopicar') - 0.25, { x: 0, y: 0, rx: 4, ry: -4 }, { y: 120, s: -0.08, b: 12 }, { x: L(-80, -200), y: -60, s: -0.1, b: 14 });
    fiche.style.transform += ` rotate(${(3 * spring(t - M('bizarre'), 'default') - 3 * spring(t - M('bizarre') - 0.45, 'heavy')).toFixed(2)}deg)`;
    { const p = spring(t - (M('n1650') - 0.1), 'snappy');
      ring.style.transform = `scale(${(1.12 - 0.12 * p).toFixed(4)})`; ring.style.opacity = clamp(p * 1.5, 0, 1).toFixed(3); }
    writeTitle(tNo, t, M('non') + 0.1, M('n1650') - 0.2, TT);
    writeTitle(tWork, t, M('n1650') - 0.05, M('utopicar') - 0.3, TT);

    life(logo, t, M('utopicar') - 0.1, M('mercedes') - 0.3, { x: 0, y: -170 }, { s: -0.3, b: 12 }, { y: -80, b: 10 }, 'heavy');
    steps.forEach((e, i) => life(e, t, M('bam') - 0.05 + i * 0.16, M('mercedes') - 0.3, L({ x: 0, y: 30 + i * 115 }, { x: 0, y: -10 + i * 108 }), { y: 50, s: -0.2, b: 8 }, { y: -60, b: 8 }, 'snappy'));
    writeTitle(tMarge, t, M('reste') - 0.1, M('mercedes') - 0.3, TT);

    const mY = L(-150, -130), mY2 = mY + L(400, 330);
    life(mPhoto, t, M('mercedes') - 0.1, M('attends') - 0.25, { x: 0, y: mY }, { x: 200, b: 12 }, { y: -80, s: -0.1, b: 12 });
    life(mRap, t, M('mercedes') + 0.25, M('prixmax') - 0.1, { x: 0, y: mY2 }, { y: 60, b: 8 }, { y: -30, s: -0.1, b: 10 }, 'snappy');
    life(mMax, t, M('prixmax') - 0.05, M('attends') - 0.25, { x: 0, y: mY2 }, { y: 60, s: -0.1, b: 8 }, { y: -60, b: 10 }, 'snappy');
    writeTitle(tMax, t, M('prixmax') - 0.05, M('attends') - 0.3, TT);
    life(mHist, t, M('attends') - 0.1, M('quinze') - 0.25, { x: 0, y: L(-160, -140) }, { y: 80, b: 10 }, { y: -80, b: 10 });
    tags.forEach((e, i) => life(e, t, M('trois') - 0.35 + i * 0.17, M('quinze') - 0.25, L({ x: (i - 1) * 262, y: 200 }, { x: (i - 1) * 280, y: 160 }), { y: -220, b: 6 }, { y: 120, b: 8 }, 'snappy'));
    writeTitle(t3, t, M('trois') - 0.2, M('quinze') - 0.3, TT);

    // ----- 02 : le chaos, puis le tableau de bord -----
    life(chap2, t, M('quinze') - 0.05, END - 0.2, L({ x: 540, y: 258 }, { x: 260, y: 120 }), { y: -30, b: 6 }, { y: -30, b: 6 }, 'snappy');
    writeTitle(t15, t, M('quinze') + 0.05, M('carnet') - 0.15, TT);
    const hop = M('hop');
    const k = spring(t - hop, { f: 2.4, z: 0.85 });          // « Hop ! » : tout se range d'un coup
    const chaos = (e, a0, at) => { const v = life(e, t, a0, null, at, { y: -700, r: -12, b: 4 }, {}, { f: 2.2, z: 0.6 }); if (t >= hop) put(e, lerp(at.x, 0, k), lerp(at.y, 0, k), (1 - k) * 1, 1 - k, k * 6, (at.r || 0) * (1 - k)); show(e, t >= a0 - 0.02 && k < 0.98); return v; };
    chaos(note, M('carnet') - 0.1, L({ x: -115, y: -20, r: -6 }, { x: -260, y: 0, r: -6 }));
    chaos(calc, M('calculette') - 0.1, L({ x: 205, y: 130, r: 7 }, { x: 240, y: 40, r: 7 }));
    tabs.forEach((e, i) => chaos(e, M('calculette') + 0.35 + i * 0.075, { x: L(-248, -600) + (i % 4) * L(150, 300) + ((i * 53) % 40), y: L(-560, -380) + Math.floor(i / 4) * 92 + ((i * 29) % 30), r: ((i * 7) % 9) - 4 }));

    life(tbHead, t, hop - 0.02, M('a3') - 0.25, { x: 0, y: 0 }, { s: -0.7, b: 10 }, { y: -100, b: 10 }, { f: 2.0, z: 0.9 });
    writeTitle(t308, t, M('n308') - 0.05, M('a3') - 0.3, TT);
    // le curseur appuie sur « Ajuster le prix → » de la 1re décision (coordonnées de la capture)
    moveCursor(cur, t, [[M('n308'), L(360, 380), dY(1900)], [M('baisse') - 0.45, -DW / 2 + 412 * DK, dY(1690)]], [M('baisse') + 0.05], M('n308'), M('a3') - 0.2);

    life(tbMk, t, M('a3') - 0.15, M('marge') - 0.25, { x: L(0, -60), y: L(80, 60) }, { x: 240, b: 10 }, { x: -240, b: 10 });
    life(notif, t, M('ding') - 0.08, M('marge') - 0.25, { x: 0, y: L(-330, -360) }, { y: -120, s: -0.1, b: 6 }, { y: -80, b: 6 }, 'snappy');
    writeTitle(tA3, t, M('a3') - 0.05, M('marge') - 0.3, TT);

    life(tbMarges, t, M('marge') - 0.15, M('debutes') - 0.25, { x: 0, y: L(130, 40) }, { y: 120, b: 10 }, { y: -100, b: 10 });
    life(tbC1, t, M('voiture') - 0.1, M('debutes') - 0.25, { x: L(240, 260), y: L(-230, -300) }, { s: -0.3, b: 8 }, { y: -80, b: 8 }, 'snappy');
    writeTitle(tVoit, t, M('marge') - 0.05, M('debutes') - 0.3, TT);

    // ----- formules -----
    // Starter seule, puis Pro arrive : 9:16 empilées (Starter monte), 16:9 côte à côte
    const pp = spring(t - (M('parc') - 0.2), 'default');
    life(oS, t, M('debutes') - 0.1, M('essaie') - 0.35, L({ x: 0, y: -150 - 65 * pp, s: 1 - 0.22 * pp }, { x: -120 * pp, y: -80 - 50 * pp, s: 1 - 0.2 * pp }), { y: 140, b: 10 }, { x: -200, b: 10 });
    life(gauge, t, M('seule') - 0.1, M('parc') - 0.3, { x: 0, y: L(290, 250) }, { y: 80, b: 8 }, { y: 80, b: 8 }, 'snappy');
    gBar.style.transform = `scaleX(${clamp(spring(t - M('seule'), { f: 0.6, z: 1 }), 0, 1).toFixed(4)})`;
    writeTitle(tDeb, t, M('debutes') - 0.05, M('seule') - 0.3, TT);
    writeTitle(t3ans, t, M('seule') - 0.05, M('parc') - 0.3, TT);
    life(oP, t, M('parc') - 0.1, M('essaie') - 0.35, L({ x: 0, y: 215, s: 0.78 }, { x: 130, y: 100, s: 0.9 }), L({ y: 300, b: 10 }, { x: 400, b: 10 }), { x: 200, b: 10 });
    writeTitle(tPro, t, M('parc') - 0.05, M('essaie') - 0.4, TT);

    // ----- essai -----
    life(bEss, t, M('essaie') - 0.3, M('chiffres') - 0.25, { x: 0, y: L(-140, -100) }, { s: -0.3, b: 10 }, { y: -80, b: 10 }, 'snappy');
    bEss.style.transform += ` scale(${(1 - 0.06 * bump(t, M('essaie') + 0.25, 0.14)).toFixed(4)})`;
    checks.forEach((e, i) => life(e, t, M('essaie') + 0.35 + i * 0.25, M('chiffres') - 0.25, { x: L(0, -40), y: L(80 + i * 100, 60 + i * 90) }, { x: -60, b: 6 }, { y: 60, b: 6 }, 'snappy'));
    writeTitle(tBio, t, M('bio') - 0.2, M('chiffres') - 0.3, TT);
    writeTitle(tFin, t, M('chiffres') - 0.1, END - 0.2, L({ x: 540, y: 700 }, { x: 960, y: 420 }));

    // ----- carton final -----
    life(endLogo, t, M('utopicar2') - 0.1, null, L({ x: 540, y: 960 }, { x: 960, y: 700 }), { y: 40, s: -0.2, b: 8 }, {}, 'heavy');
    life(endCta, t, END - 0.1, null, L({ x: 540, y: 1150 }, { x: 960, y: 840 }), { y: 40, b: 6 }, {}, 'snappy');

    // ----- mentions -----
    const mPos = L({ x: 540, y: 1452 }, { x: 560, y: 946 });      // 16:9 : sous le titre, à gauche de l'interface
    life(men1, t, 0, M('quinze') - 0.3, mPos, { y: 10 }, { y: 10 }, 'snappy');
    life(men2, t, hop, M('debutes') - 0.3, mPos, { y: 10 }, { y: 10 }, 'snappy');
    // 16:9 : la dernière mention glisse au centre avec le carton final
    life(men3, t, M('debutes'), null, { x: mPos.x + L(0, 400) * spring(t - (M('chiffres') - 0.1), 'default'), y: mPos.y }, { y: 10 }, {}, 'snappy');
    veil.style.opacity = (0.3 + 0.7 * TV).toFixed(3);
  };

  window.filmDur = DUR;
  window.seek(0);
  window.filmReady = true;
})();
