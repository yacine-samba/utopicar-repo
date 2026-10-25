// Présentation utopicar v3 (9:16, voix de Simon eleven_v4), grammaire 1600.agency étudiée image par image :
// un vrai téléphone qui flotte sur des fonds en dégradé ; la VRAIE app dedans (pages figées par
// scripts/app-demo/figer.mjs : même code que la production, base de démonstration) ; les composants qui comptent
// SORTENT de l'écran en grandes cartes 3D (le vrai bloc de l'app, agrandi, vectoriel) ; sous-titres de la voix mot à mot ;
// le logo se tape dans une pastille. Contrat : window.seek(t) peint l'image t, sans état entre les images ; tous les
// instants viennent des mots de la voix (audio/vo-presentev3/vo.words.json). Flou de bougé : shutter/samples, MB=8.
(async function () {
  const { spring, clamp, lerp } = Motion;
  const ST = document.getElementById('stage');
  const J = async (u) => (await fetch(u)).json();
  const WD = await J('../audio/vo-presentev3/vo.words.json');
  const LOGO = await (await fetch('../assets/brand/official/utopicar-logo-horizontal-fond-sombre.svg')).text();
  await Promise.all(['600 150px Clash', '700 150px Clash', '700 40px Satoshi', '500 30px Satoshi', 'italic 150px Instrument'].map((f) => document.fonts.load(f)));
  const w = (i) => WD[i].s;                     // instants des mots (index fixes : la prise est figée)
  const VEND = WD[WD.length - 1].e;
  const DUR = Math.round((VEND + 2.5) * 30) / 30;
  const TLOOP = DUR - 0.6;

  // ---------- courbes ----------
  const eOut = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
  const eIn = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : Math.pow(2, 10 * p - 10));
  const eIO = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2);
  const eOut3 = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(1 - p, 3)), eOut4 = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : 1 - Math.pow(1 - p, 4));
  const E = (t, t0, d, f = eOut) => f(clamp((t - t0) / d, 0, 1));
  const SP = (t, t0, pr = 'default') => (t < t0 ? 0 : spring(t - t0, pr));
  const bump = (t, t0, d = 0.14) => clamp(spring(t - t0, 'snappy') - spring(t - t0 - d, 'snappy'), 0, 1);
  const tr = (t, keys) => Motion.track(t, keys);
  const mix = (a, b, p) => a.map((v, i) => lerp(v, b[i], p));

  // ---------- éléments ----------
  const mk = (tag, cls, parent, css, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const show = (e, v) => { e.style.display = v ? '' : 'none'; return v; };
  const tf = (e, x, y, o = {}) => { e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)${o.c ? ' translate(-50%,-50%)' : ''}${o.p ? ` perspective(${o.p}px) rotateX(${(o.rx || 0).toFixed(2)}deg) rotateY(${(o.ry || 0).toFixed(2)}deg)` : ''} rotate(${(o.r || 0).toFixed(2)}deg) scale(${(o.sx ?? o.s ?? 1).toFixed(4)},${(o.sy ?? o.s ?? 1).toFixed(4)})`; if (o.o != null) e.style.opacity = clamp(o.o, 0, 1).toFixed(3); };
  const CUES = [], cue = (t, k, g = 1) => { if (t >= 0 && t < DUR) CUES.push({ t: +t.toFixed(3), k, g }); };
  const FAST = []; const win = (a, b) => FAST.push([a, b]);

  // =====================================================================================================
  // FOND : trois halos en dégradé (pas de flou CSS : des dégradés radiaux), couleur par partie, dérive lente
  // =====================================================================================================
  const FOND = mk('div', 'lay', ST, { background: '#0b0a09' });
  const HALOS = [0, 1, 2].map(() => mk('div', 'a', FOND, { width: '1700px', height: '1700px', left: '-850px', top: '-850px' }));
  const PAL = {   // [halo 1, halo 2, halo 3] en rgba
    hook: [[255, 90, 31, 0.42], [190, 40, 30, 0.38], [255, 150, 90, 0.16]],
    perte: [[230, 50, 50, 0.5], [150, 20, 30, 0.45], [255, 90, 31, 0.2]],
    app: [[255, 90, 31, 0.36], [120, 45, 15, 0.42], [255, 179, 138, 0.14]],
    rouge: [[240, 60, 60, 0.5], [140, 20, 30, 0.42], [255, 90, 31, 0.18]],
    vert: [[62, 203, 127, 0.36], [20, 90, 60, 0.44], [255, 179, 138, 0.12]],
    ambre: [[255, 150, 40, 0.34], [150, 60, 10, 0.4], [255, 90, 31, 0.16]],
    nuit: [[70, 90, 220, 0.4], [110, 60, 200, 0.32], [20, 30, 90, 0.5]],
    fin: [[255, 90, 31, 0.44], [150, 40, 10, 0.4], [255, 179, 138, 0.16]],
  };
  // changements de teinte sur la voix (glissés en 0,35 s, jamais un fondu de plans)
  const PALK = [[0, 'hook'], [w(11) - 0.1, 'perte'], [w(14) - 0.2, 'app'], [w(31) - 0.08, 'rouge'], [w(33) - 0.15, 'vert'], [w(48) - 0.1, 'ambre'],
    [w(60) - 0.1, 'nuit'], [w(66) - 0.15, 'app'], [w(85) - 0.15, 'vert'], [w(88) - 0.15, 'fin']];
  function fond(t) {
    let c = PAL[PALK[0][1]];
    for (let i = 1; i < PALK.length; i++) { const [t0, k] = PALK[i]; c = c.map((v, j) => mix(v, PAL[k][j], E(t, t0, 0.35, eIO))); }
    const pos = [[540 + 260 * Math.sin(t * 0.21), 560 + 140 * Math.cos(t * 0.17)], [300 + 180 * Math.cos(t * 0.15 + 1), 1500 + 120 * Math.sin(t * 0.19)], [860 + 160 * Math.sin(t * 0.13 + 2), 1150 + 200 * Math.cos(t * 0.11)]];
    HALOS.forEach((h, i) => { const [r, g, b, a] = c[i]; h.style.background = `radial-gradient(circle at 50% 50%, rgba(${r | 0},${g | 0},${b | 0},${a.toFixed(3)}) 0%, rgba(${r | 0},${g | 0},${b | 0},0) 60%)`; tf(h, pos[i][0], pos[i][1], { s: 1 + 0.08 * Math.sin(t * 0.3 + i) }); });
  }
  const CAM = mk('div', 'lay', ST, { transformOrigin: '540px 960px' });   // caméra : orbite lente, jamais à l'arrêt
  const CARDS = mk('div', 'lay', ST);                                        // cartes sorties du téléphone (devant)
  const TXT = mk('div', 'lay', ST);                                          // sous-titres au-dessus de tout

  // =====================================================================================================
  // SOUS-TITRES de la voix, mot à mot (Juicebox, lemlist) : chaque mot monte de 26 px et s'allume 0,08 s avant d'être
  // dit ; le groupe part mot après mot (0,025 s) quand le suivant commence. Mots clés : Clash, couleur de la partie.
  // =====================================================================================================
  const COL = { k: '#ff8a4c', r: '#ff7a7a', g: '#3ecb7f', b: '#a9b8ff', w: '#f4f1ec' };
  const G = (y, size, words) => ({ y, size, words });
  const CAPS = [
    G(270, 74, [['Cette', 0], ['208', 2, 'k'], ['à', 3], ['7 190 € ?', 4, 'k']]),
    G(270, 74, [['À', 7], ['la', 8], ['revente,', 9], ['tu', 10], ['perds', 11, 'r'], ['2 688 €.', 12, 'r']]),
    G(270, 74, [['Colle', 14], ["l'annonce", 15], ['dans', 17], ['utopicar.', 18, 'k']]),
    G(270, 74, [['En', 19], ['une', 20, 'k'], ['minute :', 21, 'k']]),
    G(270, 74, [['la', 22], ['cote,', 23, 'k'], ['les', 24], ['travaux,', 25, 'k'], ['ta', 26], ['marge…', 27, 'k']]),
    G(270, 74, [['et', 28], ['le', 29], ['verdict.', 30, 'k']]),
    G(262, 118, [['À', 31, 'r'], ['éviter.', 32, 'r']]),
    G(270, 74, [['Une', 33], ['bonne', 34, 'g'], ['affaire ?', 35, 'g']]),
    G(270, 74, [['Ton', 37], ['prix', 38, 'k'], ["d'offre…", 39, 'k']]),
    G(270, 74, [['et', 41], ['le', 42], ['plafond', 43, 'k'], ['à', 44], ['ne', 45], ['pas', 46], ['dépasser.', 47]]),
    G(270, 74, [['Et', 48], ['pour', 49], ['les', 50], ['trouver,', 51], ['arrête', 52, 'k'], ['de', 53, 'k'], ['scroller.', 54, 'k']]),
    G(270, 74, [['Ta', 55], ['recherche', 56], ['tourne', 57, 'k'], ['toute', 58, 'k'], ['seule.', 59, 'k']]),
    G(270, 80, [['Toi,', 60], ['tu', 61], ['dors.', 62, 'b']]),
    G(270, 80, [['Lui,', 63], ['il', 64], ['bosse.', 65, 'k']]),
    G(270, 74, [['Une', 66], ['annonce', 67], ['passe', 68], ['sous', 69, 'g'], ['la', 70, 'g'], ['cote ?', 71, 'g']]),
    G(270, 74, [['Tu', 72], ['reçois', 73], ['un', 74], ['mail.', 75, 'k']]),
    G(270, 74, [['Et', 76], ['chaque', 77], ['voiture,', 78], ['de', 79], ["l'achat", 80, 'k'], ['à', 82], ['la', 83], ['vente :', 84, 'k']]),
    G(262, 110, [['ta', 85], ['vraie', 86, 'g'], ['marge.', 87, 'g']]),
  ];
  CAPS.forEach((g, gi) => {
    g.box = mk('div', 'a', TXT, { left: '110px', top: g.y + 'px', width: '860px', textAlign: 'center', lineHeight: 1.12 });
    g.sp = g.words.map(([txt, i, k], j) => ({ t: w(i), el: mk('span', '', g.box, { display: 'inline-block', font: k ? `600 ${(g.size * 1.06).toFixed(0)}px/1.12 Clash` : `700 ${g.size}px/1.12 Satoshi`, letterSpacing: k ? '-.02em' : '-.01em', color: COL[k || 'w'], whiteSpace: 'nowrap', margin: `0 ${(g.size * 0.13).toFixed(0)}px` }, txt) }));
    // sortie rapide (0,1 s, décalage ≤ 0,04 s), finie avant que le premier mot du groupe suivant n'apparaisse
    // (0,07 s avant d'être dit) : la parole est continue, deux groupes ne sont jamais à l'écran ensemble
    g.t0 = g.sp[0].t; const nxt = gi + 1 < CAPS.length ? w(CAPS[gi + 1].words[0][1]) : w(88) + 0.1;
    g.tEnd = nxt - 0.22; g.dOut = 0.1; g.stag = Math.min(0.008, 0.04 / g.sp.length);
  });
  function sousTitres(t) {
    for (const g of CAPS) {
      const on = t >= g.t0 - 0.12 && t < g.tEnd + 0.2; if (!show(g.box, on)) continue;
      g.sp.forEach((s, j) => {
        const p = E(t, s.t - 0.07, 0.3), q = E(t, g.tEnd + j * g.stag, g.dOut, eIO);
        s.el.style.opacity = (p * (1 - q)).toFixed(3);
        s.el.style.transform = `translateY(${(26 * (1 - p) - 30 * q).toFixed(1)}px) scale(${(0.96 + 0.04 * p).toFixed(3)})`;
        // mise au point du mot (1600 : chaque mot entre flou et se pose net) ; flou aussi à la sortie
        const bl = 7 * (1 - p) + 5 * q; s.el.style.filter = bl > 0.15 ? `blur(${bl.toFixed(2)}px)` : '';
      });
    }
  }

  // =====================================================================================================
  // LE TÉLÉPHONE et ses pages (iframes de 390 px CSS, la vraie app figée)
  // =====================================================================================================
  const K = 1.32;                                   // écran : 390 × 844 px CSS → 515 × 1114 px
  const SW = Math.round(390 * K), SH = Math.round(844 * K), BZ = 13, PW = SW + 2 * BZ, PHH = SH + 2 * BZ;
  const PH = mk('div', 'a', CAM, { width: PW + 'px', height: PHH + 'px', borderRadius: '74px', background: '#161210', boxShadow: '0 0 0 2px #3a302a, 0 0 0 5px #0d0b0a, 0 70px 120px -50px rgba(0,0,0,.9)', transformOrigin: '50% 50%' });
  const SCREEN = mk('div', 'a', PH, { left: BZ + 'px', top: BZ + 'px', width: SW + 'px', height: SH + 'px', borderRadius: '62px', overflow: 'hidden', background: '#0b0a09' });
  mk('div', 'a', PH, { left: (PW / 2 - 64) + 'px', top: (BZ + 16) + 'px', width: '128px', height: '38px', borderRadius: '19px', background: '#000', zIndex: 20 });
  const VEILLE = mk('div', 'a', SCREEN, { width: SW + 'px', height: SH + 'px', background: '#020308', opacity: 0, zIndex: 15, pointerEvents: 'none' });
  const nt = (s) => (s || '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim();
  function chercher(d, txt, { exact = false, nth = 0 } = {}) {
    const want = nt(txt); const all = [...d.body.querySelectorAll('*')].filter((e) => { const s = nt(e.textContent); return exact ? s === want : s.includes(want); });
    const leaves = all.filter((e) => ![...e.children].some((c) => all.includes(c)));
    if (!leaves[nth]) throw new Error(`« ${txt} » introuvable`); return leaves[nth];
  }
  const carteDe = (e) => e.closest('details, section, article, li, .carte, [class*="rounded-2xl"], [class*="rounded-3xl"]') || e;
  const CSS_IFR = 'html{scrollbar-width:none}html::-webkit-scrollbar{display:none}*,*::before,*::after{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}';
  async function ouvrir(ifr, nom) {
    await new Promise((res) => { ifr.addEventListener('load', res, { once: true }); ifr.src = `../assets/presente-v3/ui/${nom}.html`; });
    const d = ifr.contentDocument; await d.fonts.ready;
    const st = d.createElement('style'); st.textContent = CSS_IFR; d.head.appendChild(st);
    if (nom === 'recherche') [...d.querySelectorAll('ul > li.carte')].slice(45).forEach((e) => e.remove());
    return d;
  }
  class Page {   // une page de l'app dans l'écran du téléphone
    constructor(nom) { this.nom = nom; this.box = mk('div', 'a', SCREEN, { width: SW + 'px', height: SH + 'px', overflow: 'hidden', background: '#0b0a09' }); this.fr = mk('iframe', '', this.box, { width: '390px', height: '844px', border: '0', transformOrigin: '0 0', transform: `scale(${K})` }); this.fr.setAttribute('scrolling', 'no'); }
    async init() { this.d = await ouvrir(this.fr, this.nom); this.win = this.fr.contentWindow; return this; }
    el(txt, o) { return chercher(this.d, txt, o); }
    r(e) { const b = e.getBoundingClientRect(); return { x: b.left + this.win.scrollX, y: b.top + this.win.scrollY, w: b.width, h: b.height }; }
    scroll(y) { this.d.documentElement.scrollTop = Math.max(0, y); }
    get sy() { return this.d.documentElement.scrollTop; }
  }
  // un composant de l'app SORTI du téléphone : une iframe de la même page, cadrée au pixel sur le bloc, agrandie
  class Morceau {
    constructor(nom, trouver, zoom = 2.0, hMax = null) { this.nom = nom; this.trouver = trouver; this.Z = zoom; this.hMax = hMax; this.box = mk('div', 'a', CARDS, { overflow: 'hidden', transformOrigin: '50% 50%', boxShadow: '0 50px 90px -35px rgba(0,0,0,.85), 0 0 0 1.5px rgba(244,241,236,.10)', background: '#0b0a09' }); this.fr = mk('iframe', '', this.box, { width: '390px', border: '0', transformOrigin: '0 0' }); this.fr.setAttribute('scrolling', 'no'); }
    async init() {
      // aucune dépendance au défilement (perdu quand l'iframe est masquée) : l'iframe a la hauteur de toute la page
      this.fr.style.height = '844px';
      const d = this.d = await ouvrir(this.fr, this.nom);
      this.e = this.trouver(d);
      [...d.querySelectorAll('body *')].forEach((e) => { const p = getComputedStyle(e).position; if ((p === 'fixed' || p === 'sticky') && !e.contains(this.e)) e.style.visibility = 'hidden'; });
      this.fr.style.height = (d.documentElement.scrollHeight + 40) + 'px';
      const b = this.e.getBoundingClientRect(), hm = typeof this.hMax === 'function' ? this.hMax(d, this.e) : this.hMax;
      this.rr = { x: b.left, y: b.top, w: b.width, h: hm ? Math.min(b.height, hm) : b.height }; this.sy = 0;
      this.w = this.rr.w * this.Z; this.h = this.rr.h * this.Z;
      const rad = parseFloat(getComputedStyle(this.e).borderTopLeftRadius) || 20;
      Object.assign(this.box.style, { width: this.w + 'px', height: this.h + 'px', borderRadius: (rad * this.Z).toFixed(1) + 'px' });
      this.fr.style.transform = `translate(${(-this.rr.x * this.Z).toFixed(2)}px,${(-this.rr.y * this.Z).toFixed(2)}px) scale(${this.Z})`;
      show(this.box, false);
      return this;
    }
    // pose : centre (cx, cy) en px du film, échelle relative s (1 = zoom Z), rotations 3D
    pose(cx, cy, { s = 1, rx = 0, ry = 0, rz = 0, o = 1 } = {}) { tf(this.box, cx - this.w / 2, cy - this.h / 2, { p: 1800, rx, ry, r: rz, s, o }); }
  }

  const P = {};
  for (const n of ['analyser-208', 'rapport-208', 'rapport-clio', 'recherche', 'alertes-off', 'messages', 'accueil']) P[n] = await new Page(n).init();
  const ALL_PAGES = Object.values(P);

  // pose du téléphone : centre (cx, cy), échelle, inclinaisons
  let PHX = 540, PHY = 1000, PHS = 1;
  function poseTel(cx, cy, { s = 1, rx = 0, ry = 0, rz = 0 } = {}) { PHX = cx; PHY = cy; PHS = s; tf(PH, cx - PW / 2, cy - PHH / 2, { p: 2000, rx, ry, r: rz, s }); }
  // centre d'un rect de la page (px CSS, défilement compris) → px du film (téléphone supposé de face)
  const versFilm = (pg, r) => ({ x: PHX + (BZ + (r.x + r.w / 2) * K - PW / 2) * PHS, y: PHY + (BZ + (r.y - pg.sy + r.h / 2) * K - PHH / 2) * PHS });
  // une carte sortie : de son emplacement dans l'écran à sa place dans le film (arc, bords sur ressorts, flottement)
  function sortie(m, t, t0, from, to, { s0 = K * PHS / m.Z, rz = 0, ry = 0, tBack = null, backTo = null, pr = 'default' } = {}) {
    if (t < t0 - 0.01 || (tBack != null && t > tBack + 0.4)) { show(m.box, false); return 0; }
    const a = SP(t, t0, pr), b = SP(t, t0 + 0.05, 'snappy'); show(m.box, true);
    let cx = lerp(from.x, to.x, b), cy = lerp(from.y, to.y, a) - 90 * Math.sin(Math.PI * clamp(a, 0, 1)), s = lerp(s0, to.s ?? 1, a);
    const RZ = lerp(0, rz, a) + 0.8 * Math.sin((t - t0) * 1.3), RY = lerp(-18, ry, a) + 3 * Math.sin((t - t0) * 0.9), RX = lerp(14, 0, a) + 2 * Math.sin((t - t0) * 0.7 + 1);
    let o = 1;
    if (tBack != null && t >= tBack) { const k = E(t, tBack, m.dBack || 0.35, eIn); cx = lerp(cx, backTo.x, k); cy = lerp(cy, backTo.y, k); s = lerp(s, backTo.s, k); o = 1 - E(t, tBack + 0.22, 0.12); }
    m.pose(cx, cy + 8 * Math.sin((t - t0) * 1.6), { s, rx: RX, ry: RY, rz: RZ, o });
    return a;
  }
  const zoneCarte = (d, txt, exact = true) => carteDe(chercher(d, txt, { exact }));
  // carte verdict coupée juste sous « À faire : … » (pas au milieu de la ligne suivante)
  const jusquAFaire = (d, e) => { const p = chercher(d, 'À faire :', { exact: true }).closest('p'); return p.getBoundingClientRect().bottom - e.getBoundingClientRect().top + 24; };
  const VERDICT = (d) => d.querySelector('section[aria-labelledby="bilan-verdict"]') || carteDe(chercher(d, 'Avant le premier message'));
  const ringOf = (m) => ({ c: m.d.querySelector('[aria-label^="Note"] svg circle:nth-of-type(2)'), n: m.d.querySelector('[aria-label^="Note"] .num') });
  // la note se remplit (anneau + chiffre) comme dans l'app quand le rapport arrive
  const remplir = (R, note, p) => { R.c.setAttribute('stroke-dasharray', `${(326.73 * note / 100 * p).toFixed(2)} 326.73`); R.n.textContent = String(Math.round(note * p)); };
  const eur = (v) => `${Math.round(v).toLocaleString('fr-FR').replace(/\s/g, '\u202f')}\u00a0€`;

  // =====================================================================================================
  // A · ACCROCHE (0 → « Colle ») : la 208 détourée, son étiquette de prix ; « à la revente » → l'étiquette bascule
  // =====================================================================================================
  const A = mk('div', 'lay', CAM);
  const A0 = mk('div', 'lay', null); CAM.insertBefore(A0, PH);           // la voiture passe DERRIÈRE le téléphone
  const carW = mk('div', 'a', A0, { width: '1000px' });
  const car = mk('img', 'a', carW, { width: '1000px', filter: 'drop-shadow(0 60px 50px rgba(0,0,0,.6))' }); car.src = '../assets/hooks-cut/208-annonce-cut.png';
  const TAG = mk('div', 'a', A, { width: '620px', height: '270px', transformStyle: 'preserve-3d' });
  const face = (col) => mk('div', 'a', TAG, { width: '620px', height: '270px', borderRadius: '44px', background: '#f7f2ea', color: col, padding: '44px 50px 0', backfaceVisibility: 'hidden', boxShadow: '0 50px 90px -35px rgba(0,0,0,.8)' });
  const recto = face('#1c1612'), verso = face('#c81e1e'); verso.style.transform = 'rotateX(180deg)';
  mk('div', '', recto, { font: '700 26px Satoshi', letterSpacing: '.16em', opacity: 0.55, whiteSpace: 'nowrap' }, 'ANNONCE · PEUGEOT 208');
  mk('div', '', recto, { font: '600 150px/1.05 Clash', letterSpacing: '-.035em', whiteSpace: 'nowrap', marginTop: '10px' }, '7 190 €');
  mk('div', '', verso, { font: '700 26px Satoshi', letterSpacing: '.16em', whiteSpace: 'nowrap' }, 'À LA REVENTE');
  const versoN = mk('div', '', verso, { font: '600 150px/1.05 Clash', letterSpacing: '-.035em', whiteSpace: 'nowrap', marginTop: '10px' }, '−2 688 €');
  const milliers = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const menA = mk('div', 'a', A, { width: '1080px', textAlign: 'center', top: '1440px', font: '500 24px Satoshi', color: 'rgba(244,241,236,.6)' }, 'Données de démonstration');
  const tFlip = w(9) - 0.1, tA1 = w(14) - 0.32;
  cue(0, 'impact', 1); cue(w(4) - 0.04, 'pop', 0.7); cue(tFlip, 'whoosh', 0.8); cue(w(12) - 0.03, 'thud', 1);
  win(tFlip - 0.02, tFlip + 0.3); win(tA1, w(16));
  function paintA(t) {
    show(A0, t < tA1 + 0.45); if (!show(A, t < tPaste + 0.05)) return;
    // image 0 : tout est là ; la caméra recule déjà (premier mouvement avant 0,4 s)
    const q = clamp(t / tA1, 0, 1), push = 1 + 0.07 * (1 - E(t, 0, 0.8, eOut3));
    tf(carW, 40, 760 + 10 * Math.sin(t * 0.8) + 1000 * E(t, tA1, 0.4, eIn), { p: 1600, ry: 24 - 34 * q, rx: 3 * Math.sin(t * 0.6), r: -1 + 2 * q, s: (1.0 + 0.06 * q) * push });
    const flip = SP(t, tFlip, 'default');
    const hit = 0.07 * bump(t, w(4) - 0.04, 0.12) + 0.06 * bump(t, w(12) - 0.15, 0.14), doute = bump(t, w(6) - 0.05, 0.12);
    // la perte compte pendant « tu perds » et se pose 0,15 s avant d'être dite
    versoN.textContent = '−' + milliers(Math.round(2688 * E(t, tFlip + 0.1, w(12) - 0.15 - tFlip - 0.1, eOut3))) + ' €';
    // « Colle l'annonce dans utopicar » : l'étiquette (l'annonce) vole dans le champ de texte du téléphone
    const go = E(t, tA1, tPaste - 0.06 - tA1, eIO), dst = versFilm(PA, taR);
    const cx = lerp(540, dst.x, go), cy = lerp(655, dst.y, go) - 220 * Math.sin(Math.PI * go) + 12 * Math.sin(t * 1.3) * (1 - go);
    tf(TAG, cx - 310, cy - 135, { p: 1400, rx: 180 * flip + 180 * SP(t, tA1 + 0.05, 'default') + 6 * Math.sin(t * 0.9) * (1 - go), ry: -10 + 6 * Math.sin(t * 0.7) + 10 * go, r: -3 + 2 * Math.sin(t * 0.5) + 3 * doute, s: (1 + hit) * lerp(push, 0.42, go), o: 1 - E(t, tPaste - 0.1, 0.1) });
    menA.style.opacity = (1 - E(t, tA1, 0.25)).toFixed(3);
  }

  // =====================================================================================================
  // B · « Colle l'annonce dans utopicar » → le téléphone monte, l'annonce se colle, un doigt touche « Analyser »,
  //     le rapport : la cote, les travaux, la marge SORTENT de l'écran ; le verdict « À éviter » vient au premier plan
  // =====================================================================================================
  const PA = P['analyser-208'], PR = P['rapport-208'];
  const ta = PA.d.querySelector('textarea'), TXTA = ta.textContent; const taR = PA.r(ta);
  const btn = PA.el("Analyser l'annonce", { exact: true }); const btnR = PA.r(btn);
  const tPh = w(14) - 0.3, tPaste = w(16) - 0.05, tTap = w(18) + 0.3, tRap = tTap + 0.32;
  cue(tPh, 'whoosh', 0.8); cue(tPaste, 'paste', 1); cue(tTap, 'click', 1); cue(tRap, 'whoosh', 0.6);
  win(tPh, tPh + 0.4);
  const DOIGT = mk('div', 'a', ST, { width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(255,255,255,.34)', border: '3px solid rgba(255,255,255,.85)', boxShadow: '0 10px 30px rgba(0,0,0,.35)' });
  const ONDE = mk('div', 'a', ST, { width: '96px', height: '96px', borderRadius: '50%', border: '4px solid rgba(255,255,255,.9)' });
  function doigt(t, x, y, tIn, tTapX, tOut) {
    const on = t >= tIn && t < tOut; show(DOIGT, on); show(ONDE, on && t >= tTapX && t < tTapX + 0.5); if (!on) return;
    const a = E(t, tIn, 0.25), b = 1 - E(t, tOut - 0.2, 0.2), pr = bump(t, tTapX - 0.04, 0.12);
    tf(DOIGT, x, y + 60 * (1 - a), { c: 1, s: (1 - 0.22 * pr) * (0.8 + 0.2 * a), o: a * b });
    const u = clamp((t - tTapX) / 0.45, 0, 1); tf(ONDE, x, y, { c: 1, s: 0.6 + 1.6 * eOut(u), o: (1 - u) * 0.9 });
  }
  const M = {};
  M.cote = await new Morceau('rapport-208', (d) => zoneCarte(d, 'Trop cher'), 2.0).init();
  M.trav = await new Morceau('rapport-208', (d) => zoneCarte(d, 'Des travaux ?', false), 2.0).init();
  M.marge = await new Morceau('rapport-208', (d) => zoneCarte(d, 'Ça rapporte ?', false), 2.0).init();
  M.ver = await new Morceau('rapport-208', VERDICT, 1.62, jusquAFaire).init();
  const RV = ringOf(M.ver), RVp = ringOf(PR);
  const inPh = { cote: carteDe(PR.el('Trop cher', { exact: true })), trav: carteDe(PR.el('Des travaux ?')), marge: carteDe(PR.el('Ça rapporte ?')) };
  const verPh = VERDICT(PR.d), verR = { ...PR.r(verPh), h: M.ver.rr.h };
  const inR = Object.fromEntries(Object.entries(inPh).map(([k, e]) => [k, PR.r(e)]));
  const tCote = w(23) - 0.15, tTrav = w(25) - 0.15, tMarge = w(27) - 0.15, tVer = w(30) - 0.2, tEv = w(31) - 0.06, tBOut = w(33) - 0.32;
  cue(tCote, 'pop', 0.8); cue(tTrav, 'pop', 0.8); cue(tMarge, 'pop', 0.9); cue(tVer, 'whoosh', 0.7); cue(tEv, 'impact', 1.2);
  win(tCote - 0.02, tCote + 0.3); win(tTrav - 0.02, tTrav + 0.3); win(tMarge - 0.02, tMarge + 0.3); win(tVer - 0.05, tVer + 0.35);
  function paintB(t) {
    const on = t >= tPh - 0.02 && t < w(33) + 0.4;
    if (!on) { ['cote', 'trav', 'marge', 'ver'].forEach((k) => show(M[k].box, false)); show(DOIGT, false); show(ONDE, false); return; }
    ta.textContent = TXTA.slice(0, Math.round(TXTA.length * E(t, tPaste, 0.32, eIO)));
    ta.style.boxShadow = t >= tPaste ? `0 0 0 ${(3 * (1 - E(t, tPaste + 0.3, 0.4))).toFixed(2)}px #ff5a1f` : '';
    btn.style.transform = `scale(${(1 - 0.05 * bump(t, tTap - 0.03, 0.12)).toFixed(3)})`;
    const nV = E(t, tRap + 0.15, 0.8, eOut3); remplir(RVp, 23, nV); remplir(RV, 23, nV);
    const bp = versFilm(PA, btnR); doigt(t, bp.x, bp.y, tTap - 0.4, tTap, tRap + 0.15);
    const fr = (k) => versFilm(PR, inR[k]);
    const sorti = (t0) => (t >= t0 && t < tVer + 0.3 ? 'hidden' : '');
    inPh.cote.style.visibility = sorti(tCote); inPh.trav.style.visibility = sorti(tTrav); inPh.marge.style.visibility = sorti(tMarge);
    verPh.style.visibility = t >= tVer + 0.14 ? 'hidden' : '';   // le verdict a quitté l'écran : sa place reste vide
    const backTo = { x: 540, y: 1200, s: 0.4 };
    sortie(M.cote, t, tCote, fr('cote'), { x: 540, y: 620, s: 1 }, { rz: -2.5, ry: 6, tBack: tVer, backTo });
    sortie(M.trav, t, tTrav, fr('trav'), { x: 540, y: 905, s: 1 }, { rz: 1.8, ry: -6, tBack: tVer + 0.04, backTo });
    sortie(M.marge, t, tMarge, fr('marge'), { x: 540, y: 1190, s: 1 }, { rz: -1.5, ry: 5, tBack: tVer + 0.08, backTo });
    // « Une bonne affaire ? » : le verdict file à gauche (le nouveau rapport arrive de droite, comme la page)
    const hitV = bump(t, tEv, 0.14), vOut = E(t, tBOut, 0.32, eIn);
    sortie(M.ver, t, tVer + 0.15, versFilm(PR, verR), { x: 540 - 1250 * vOut, y: 960, s: 1 + 0.06 * hitV }, { rz: -1.2, ry: 4 });
    M.ver.box.style.boxShadow = t >= tEv ? `0 0 0 ${(4 + 10 * hitV).toFixed(1)}px rgba(255,122,122,${(0.55 + 0.4 * hitV).toFixed(2)}), 0 50px 90px -35px rgba(0,0,0,.85)` : '';
  }

  // =====================================================================================================
  // C · « Une bonne affaire ? Ton prix d'offre… et le plafond » → le rapport de la Clio glisse dans le téléphone ;
  //     son verdict arrive de droite, l'offre et le plafond sortent en comptant
  // =====================================================================================================
  const PC = P['rapport-clio'];
  M.cver = await new Morceau('rapport-clio', VERDICT, 1.62, jusquAFaire).init();
  const cverPh = VERDICT(PC.d), cverR = { ...PC.r(cverPh), h: M.cver.rr.h };
  M.off = await new Morceau('rapport-clio', (d) => carteDe(chercher(d, "Offre d'ouverture", { exact: true })), 2.6).init();
  M.plaf = await new Morceau('rapport-clio', (d) => carteDe(chercher(d, 'Prix à ne pas dépasser', { exact: true })), 2.6).init();
  const RC = ringOf(M.cver), RCp = ringOf(PC);
  const offN = M.off.e.querySelector('.num'), plafN = M.plaf.e.querySelector('.num');
  const tC0 = w(33) - 0.25, tCv = w(34) + 0.02, tOff = w(38) - 0.12, tPla = w(43) - 0.12;
  cue(tC0, 'whoosh', 1); cue(tCv + 0.2, 'ding', 0.8); cue(tOff, 'pop', 0.9); cue(tPla, 'pop', 0.9); cue(w(47), 'thud', 0.8);
  win(tBOut, tCv + 0.35); win(tOff - 0.02, tOff + 0.3); win(tPla - 0.02, tPla + 0.3);
  const PLAF = mk('div', 'a', CARDS, { height: '6px', borderRadius: '3px', background: '#ff5a1f', width: '1080px', transformOrigin: '50% 50%' });
  const PLAFL = mk('div', 'a', CARDS, { font: '700 28px Satoshi', letterSpacing: '.14em', color: '#ff8a4c', whiteSpace: 'nowrap' }, 'PLAFOND');
  function paintC(t) {
    const on = t >= tC0 - 0.02 && t < w(48) + 0.45;
    if (!on) { ['cver', 'off', 'plaf'].forEach((k) => show(M[k].box, false)); show(PLAF, false); show(PLAFL, false); return; }
    const nC = E(t, tC0 + 0.15, 0.85, eOut3); remplir(RCp, 97, nC); remplir(RC, 97, nC);
    cverPh.style.visibility = t >= tCv - 0.01 ? 'hidden' : '';
    const vUp = E(t, tOff - 0.1, 0.4, eIO), vOut = E(t, w(48) - 0.3, 0.35, eIn);
    sortie(M.cver, t, tCv, versFilm(PC, cverR), { x: 540 - 1250 * vOut, y: lerp(930, 660, vUp), s: lerp(1, 0.62, vUp) }, { rz: 1.2, ry: -4 });
    offN.textContent = eur(lerp(5200, 6650, E(t, tOff, 0.55, eOut3))); plafN.textContent = eur(lerp(5600, 7100, E(t, tPla, 0.55, eOut3)));
    const gone = { x: 540, y: 2400, s: 0.8 };
    sortie(M.off, t, tOff, { x: 540, y: 1300 }, { x: 540, y: 1000, s: 1 }, { s0: 0.4, rz: -1.5, ry: 5, tBack: w(48) - 0.25, backTo: gone });
    sortie(M.plaf, t, tPla, { x: 540, y: 1400 }, { x: 540, y: 1280, s: 1 }, { s0: 0.4, rz: 1.2, ry: -5, tBack: w(48) - 0.2, backTo: gone });
    const lp = E(t, w(47) - 0.1, 0.4, eOut), lo = 1 - E(t, w(48) - 0.2, 0.2);
    show(PLAF, lp > 0 && lo > 0); show(PLAFL, lp > 0 && lo > 0);
    tf(PLAF, 0, 1280 - M.plaf.h / 2 - 34, { sx: lp, sy: 1, o: lo }); tf(PLAFL, 140, 1280 - M.plaf.h / 2 - 84, { o: lo * E(t, w(47), 0.2) });
  }

  // =====================================================================================================
  // D · « Et pour les trouver, arrête de scroller » → la recherche défile vite, s'arrête net ; la meilleure affaire sort.
  //     « Ta recherche tourne toute seule » → la carte suivie sort, son interrupteur s'allume, une boucle tourne.
  //     « Toi, tu dors » → écran éteint, nuit, « z z z ». « Lui, il bosse » → les messages partent un par un.
  // =====================================================================================================
  const PS = P['recherche'], PL = P['alertes-off'], PM = P['messages'];
  M.toast = await new Morceau('recherche', (d) => carteDe(chercher(d, 'Recherche terminée')), 1.9).init();
  M.best = await new Morceau('recherche', (d) => carteDe(chercher(d, '2 300 € sous', { exact: true })), 1.85).init();
  M.alOff = await new Morceau('alertes-off', (d) => carteDe(chercher(d, 'Renault Clio 4', { exact: true })), 1.9).init();
  M.alOn = await new Morceau('alertes-on', (d) => carteDe(chercher(d, 'Renault Clio 4', { exact: true })), 1.9).init();
  const bestPh = carteDe(PS.el('2 300 € sous', { exact: true })); const bestR = PS.r(bestPh);
  const LIST_END = Math.max(0, PS.d.documentElement.scrollHeight - 1200);
  const tD0 = w(48) - 0.25, tScr = w(52) - 0.08, tStop = w(54) + 0.18, tBest = tStop + 0.05, tAl = w(55) - 0.2, tSw = w(57) - 0.03, tNuit = w(60) - 0.1, tLui = w(63) - 0.08;
  cue(tD0, 'whoosh', 0.8); cue(tScr, 'riser', 0.9); cue(tStop - 0.02, 'tapestop', 1); cue(tStop, 'thud', 1); cue(tBest + 0.05, 'pop', 0.8);
  cue(tAl, 'whoosh', 0.6); cue(tSw, 'click', 1); cue(tSw + 0.06, 'ding', 0.5); cue(tNuit, 'nuit', 0.8); cue(tLui, 'whoosh', 0.6);
  win(tScr, tStop + 0.1); win(tAl - 0.02, tAl + 0.35);
  const LIST0 = bestR.y - 300;
  function scrollList(t) {   // la liste file de plus en plus vite puis revient d'un coup sur la meilleure affaire (léger dépassement)
    if (t < tScr) return LIST0 + 30 * E(t, tD0, 0.6);
    if (t < tStop) { const u = (t - tScr) / (tStop - tScr); return LIST0 + 30 + (LIST_END - LIST0) * Math.sin(Math.PI * Math.min(1, u)) * Math.pow(1 - u, 0.35); }
    const u = t - tStop; return LIST0 - 26 * Math.sin(Math.PI * clamp(u / 0.26, 0, 1)) * Math.exp(-u * 3);
  }
  const alY = PL.r(PL.el('Renault Clio 4', { exact: true })).y - 300;
  const BOUCLE = mk('div', 'a', CARDS, { width: '150px', height: '150px' }, `<svg viewBox="0 0 100 100" width="150" height="150"><circle cx="50" cy="50" r="40" fill="none" stroke="#ff5a1f" stroke-width="7" stroke-linecap="round" stroke-dasharray="190 251"/><path d="M84 30 L92 50 L72 46 Z" fill="#ff5a1f"/></svg>`);
  const ZZ = [0, 1, 2].map((i) => mk('div', 'a', CARDS, { font: `600 ${150 + i * 50}px Clash`, color: '#a9b8ff', letterSpacing: '-.02em' }, 'z'));
  const envoi = (d, i) => { const det = chercher(d, 'Détail des 9 annonces'); const box = det.closest('details') || carteDe(det); const c = [...box.querySelectorAll('li')].filter((e) => /\d\d:\d\d/.test(e.textContent) && /Envoy/.test(e.textContent)); return c.filter((e) => !c.some((o) => o !== e && e.contains(o)))[i]; };
  M.env = []; for (let i = 0; i < 4; i++) M.env.push(await new Morceau('messages', (d) => envoi(d, i), 2.05).init());
  const msgY = PM.r(envoi(PM.d, 0)).y - 420;
  const PRO = mk('div', 'a', CARDS, { padding: '16px 30px', borderRadius: '999px', font: '700 30px Satoshi', color: '#f4f1ec', background: 'rgba(11,10,9,.85)', border: '2px solid rgba(255,90,31,.85)', whiteSpace: 'nowrap' }, 'Benef Pro · option Messages');
  M.env.forEach((m, i) => cue(tLui + 0.35 + i * 0.16, 'sent', 0.6));
  function paintD(t) {
    const on = t >= tD0 - 0.02 && t < w(66) + 0.2;
    if (!on) { ['toast', 'best', 'alOff', 'alOn'].forEach((k) => show(M[k].box, false)); M.env.forEach((m) => show(m.box, false)); show(BOUCLE, false); ZZ.forEach((z) => show(z, false)); show(PRO, false); return; }
    const tT = tD0 + 0.35, toastOut = E(t, tScr - 0.1, 0.3, eIn);
    if (t >= tT && t < tScr + 0.3) { show(M.toast.box, true); const a = SP(t, tT, 'snappy'); M.toast.pose(540, lerp(420, 520, a) + 200 * toastOut, { s: lerp(0.6, 1, a) * (1 - 0.45 * toastOut), rx: 18 * (1 - a), o: 1 - toastOut }); } else show(M.toast.box, false);
    bestPh.style.visibility = t >= tBest && t < tAl ? 'hidden' : '';
    sortie(M.best, t, tBest, versFilm(PS, bestR), { x: 540, y: 980, s: 1 }, { s0: K / M.best.Z * 0.92, rz: -1.5, ry: 4, tBack: tAl - 0.15, backTo: { x: -700, y: 980, s: 0.9 } });
    sortie(M.alOff, t, tAl + 0.12, { x: 540, y: 1100 }, { x: 540, y: 960, s: 1 }, { s0: 0.45, rz: 1.2, ry: -4, tBack: tNuit - 0.05, backTo: { x: 540, y: 1150, s: 0.3 } });
    if (t >= tSw && t < tNuit + 0.3) {
      show(M.alOn.box, true); const sw = M.alOn.d.querySelector('[role="switch"]') || chercher(M.alOn.d, 'Alerte e-mail', { exact: true });
      const b = sw.getBoundingClientRect(), Z = M.alOn.Z, x0 = (b.left - M.alOn.rr.x - 10) * Z, y0 = (b.top + M.alOn.sy - M.alOn.rr.y - 8) * Z, ww = (b.width + 20) * Z, hh = (b.height + 16) * Z, pp = E(t, tSw, 0.3, eOut4);
      M.alOn.box.style.clipPath = `inset(${y0.toFixed(0)}px ${(M.alOn.w - x0 - ww * pp).toFixed(0)}px ${(M.alOn.h - y0 - hh).toFixed(0)}px ${x0.toFixed(0)}px round 30px)`;
      M.alOn.box.style.transform = M.alOff.box.style.transform; M.alOn.box.style.opacity = M.alOff.box.style.opacity; M.alOn.box.style.boxShadow = 'none';
      show(BOUCLE, true); tf(BOUCLE, 540 + M.alOff.w / 2 - 90, 960 - M.alOff.h / 2 - 70, { r: 400 * (t - tSw), s: SP(t, tSw, 'snappy') * (1 - E(t, tNuit - 0.1, 0.2)) });
    } else { show(M.alOn.box, false); show(BOUCLE, false); }
    ZZ.forEach((z, i) => { const t0 = tNuit + 0.15 + i * 0.22, u = (t - t0) / 1.4; const vis = u > 0 && t < tLui + 0.2; show(z, vis); if (!vis) return; tf(z, 600 + 120 * i + 30 * Math.sin(u * 5), 760 - 380 * u - 40 * i, { r: -12 + 10 * Math.sin(u * 4), s: 0.7 + 0.4 * eOut(Math.min(1, u * 2)), o: Math.min(1, u * 4) * (1 - E(t, tLui - 0.1, 0.2)) }); });
    M.env.forEach((m, i) => { const t0 = tLui + 0.35 + i * 0.16; sortie(m, t, t0, { x: 540, y: 1200 }, { x: 540 + (i % 2 ? 26 : -26), y: 640 + i * (m.h + 26), s: 1 }, { s0: 0.5, rz: i % 2 ? 1.2 : -1.2, ry: i % 2 ? -4 : 4, tBack: w(66) - 0.2 + i * 0.03, backTo: { x: 540, y: 2400, s: 0.8 } }); });
    if (t >= tLui + 0.2 && t < w(66)) { show(PRO, true); const a = SP(t, tLui + 0.2, 'snappy'); tf(PRO, 540, 520 - 30 * (1 - a), { c: 1, s: 0.8 + 0.2 * a, o: a * (1 - E(t, w(66) - 0.25, 0.2)) }); } else show(PRO, false);
  }

  // =====================================================================================================
  // E · « Une annonce passe sous la cote ? Tu reçois un mail. » → la notification NAÎT de l'île du téléphone
  //     (pastille noire → bannière) sur « sous la cote », puis s'ouvre en e-mail sur « tu reçois »
  // =====================================================================================================
  const NOTIF = mk('div', 'a', CARDS, { overflow: 'hidden', boxShadow: '0 30px 70px -20px rgba(0,0,0,.7), 0 0 0 1.5px rgba(244,241,236,.08)' });
  const NOTIN = mk('div', 'a', NOTIF, { width: '880px', height: '178px', padding: '30px 36px', display: 'flex', gap: '26px', alignItems: 'center' });
  const ico = mk('div', '', NOTIN, { width: '104px', height: '104px', borderRadius: '26px', background: '#1a1411', flex: 'none', overflow: 'hidden', position: 'relative' });
  ico.innerHTML = LOGO; { const s = ico.querySelector('svg'); s.style.height = '104px'; s.style.width = 'auto'; s.style.position = 'absolute'; s.style.left = '0'; s.style.top = '0'; }
  mk('div', '', NOTIN, { minWidth: 0 }, `<div style="font:700 31px Satoshi;color:#f4f1ec;white-space:nowrap">utopicar <span style="font-weight:500;color:rgba(244,241,236,.6);font-size:25px">· maintenant</span></div><div style="font:500 29px/1.3 Satoshi;color:rgba(244,241,236,.85);white-space:nowrap">Clio IV 1.5 dCi · 7 650 € · <b style="color:#3ecb7f">2 300 € sous la cote</b></div>`);
  const MAILH = `<div style="font:15px Arial,sans-serif;color:#1d1d1f;padding:26px 22px 12px">
    <p style="font-size:19px;margin:0 0 4px"><b>1 nouvelle annonce</b></p><p style="margin:0 0 12px;color:#555">Recherche « Renault Clio 4 »</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #e5e5e5;width:100%"><tr>
    <td style="padding:0 12px 12px 0;vertical-align:top"><img src="../assets/presente-v/clio4-mail.jpg" width="120" style="border-radius:6px;display:block;width:120px;height:auto" alt=""></td>
    <td style="vertical-align:top;font:15px/1.45 Arial,sans-serif;padding-bottom:12px"><a style="color:#15307f;font-weight:bold;text-decoration:none">Renault Clio IV 1.5 dCi 75 Zen</a><br>
    <b style="font-size:17px">7 650 €</b><br><span style="color:#555">2018 · 88 500 km · Diesel · Manuelle</span><br><span style="color:#777">Villeurbanne 69100</span><br>
    <span style="color:#0a7a43;font-weight:bold">2 300 € sous la cote</span> <span style="color:#777">(cote 9 950 € sur 220 annonces)</span></td></tr></table>
    <p style="margin:16px 0 6px"><a style="background:#ff5a1f;color:#fff;padding:11px 17px;border-radius:7px;text-decoration:none;font-weight:bold">Voir mes alertes sur utopicar</a></p></div>`;
  const MS = 1.7;   // e-mail à 884 px de large : la largeur de la bannière
  const MAIL = mk('div', 'a', CARDS, { width: '520px', background: '#fff', borderRadius: '14px', overflow: 'hidden', transformOrigin: '50% 0', boxShadow: '0 60px 100px -35px rgba(0,0,0,.75)' }, MAILH);
  await new Promise((r) => { const im = MAIL.querySelector('img'); if (im.complete) r(); else { im.onload = r; im.onerror = r; } });
  const MH = MAIL.offsetHeight;
  const tE0 = w(66) - 0.15, tNotif = w(69) - 0.12, tMail = w(73) - 0.12, tEOut = w(77) - 0.22, NCY = 610;
  cue(tE0, 'whoosh', 0.6); cue(tNotif, 'notif', 1); cue(tMail, 'whoosh', 0.7); cue(tEOut, 'whoosh', 0.6);
  win(tNotif - 0.02, tNotif + 0.3); win(tMail - 0.02, tMail + 0.35); win(tEOut, tEOut + 0.32);
  function paintE(t) {
    const on = t >= tE0 - 0.02 && t < tEOut + 0.45;
    if (!on) { show(NOTIF, false); show(MAIL, false); return; }
    bestPh.style.boxShadow = t >= tE0 && t < tMail ? `0 0 0 ${(3 * E(t, w(69) - 0.1, 0.2)).toFixed(1)}px #3ecb7f` : '';
    const k = SP(t, tNotif, 'default'), kc = clamp(k, 0, 1), op = E(t, tMail, 0.3, eIO);
    const isl = { x: PHX, y: PHY + (BZ + 35 - PHH / 2) * PHS };            // centre de l'île du téléphone
    const Wd = lerp(128 * PHS, 880, k), Hd = lerp(38 * PHS, 178, kc);
    show(NOTIF, t >= tNotif && t < tMail + 0.22);
    NOTIF.style.width = Wd.toFixed(1) + 'px'; NOTIF.style.height = Hd.toFixed(1) + 'px'; NOTIF.style.borderRadius = Math.min(Hd / 2, 48).toFixed(1) + 'px';
    const c0 = E(t, tNotif + 0.04, 0.22); NOTIF.style.background = `rgba(${(38 * c0) | 0},${(32 * c0) | 0},${(28 * c0) | 0},.97)`;
    tf(NOTIF, lerp(isl.x, 540, kc) - Wd / 2, lerp(isl.y, NCY, kc) - Hd / 2 + 30 * op, { o: 1 - E(t, tMail + 0.06, 0.14), s: 1 + 0.03 * bump(t, tNotif + 0.3, 0.1) });
    NOTIN.style.opacity = E(t, tNotif + 0.13, 0.18).toFixed(3); NOTIN.style.transform = `translate(${((Wd - 880) / 2).toFixed(1)}px,${((Hd - 178) / 2).toFixed(1)}px)`;
    // l'e-mail s'ouvre depuis la bannière (même largeur, même haut) : tiroir qui descend
    show(MAIL, t >= tMail - 0.01 && t < tEOut + 0.4);
    const r = clamp(SP(t, tMail, 'default'), 0, 1.02), h0 = 178 / (MH * MS), up = E(t, tEOut, 0.3, eIn);
    MAIL.style.clipPath = `inset(0 0 ${((1 - clamp(lerp(h0, 1, r), 0, 1)) * 100).toFixed(2)}% 0 round 14px)`;
    tf(MAIL, 540 - 260 - 1300 * up, NCY - 89 + 8 * Math.sin((t - tMail) * 1.5) + 60 * up, { p: 1800, rx: 6 * (1 - r), ry: 3 * Math.sin((t - tMail) * 1.1) + 14 * up, r: -4 * up, s: MS, o: E(t, tMail, 0.08) });
  }

  // =====================================================================================================
  // F · « Et chaque voiture, de l'achat à la vente : ta vraie marge. » → les cinq étapes du parc (une vague les
  //     parcourt, « achat » puis « vente » s'allument) ; la marge par voiture se remplit ; la marge du mois compte
  // =====================================================================================================
  const PE = P['accueil'];
  M.parc = await new Morceau('accueil', (d) => chercher(d, 'Repérées', { exact: true }).closest('ol'), 2.0).init();
  M.mpv = await new Morceau('accueil', (d) => d.querySelector('section[aria-labelledby="tb-marges"]') || carteDe(chercher(d, 'Marge par voiture', { exact: true })), 2.2).init();
  M.kpi = await new Morceau('accueil', (d) => carteDe(chercher(d, 'Marge réalisée ce mois')), 2.3).init();
  M.mpv.dBack = M.kpi.dBack = 0.28;
  const etapes = [...M.parc.e.querySelectorAll(':scope > li > a')];
  const olPh = chercher(PE.d, 'Repérées', { exact: true }).closest('ol'), olR = PE.r(olPh);
  const parcY = PE.r(PE.el('Votre parc', { exact: true })).y - 200;
  const barres = [...M.mpv.e.querySelectorAll('a')].map((a) => ({ f: a.querySelector('.rounded-full.bg-ok, .rounded-full.bg-warn'), n: a.querySelector('.num') })).filter((b) => b.f && b.n)
    .map((b) => ({ ...b, w: parseFloat(b.f.style.width), v: parseInt(nt(b.n.textContent).replace(/\D/g, ''), 10) }));
  const kpiN = [...M.kpi.e.querySelectorAll('*')].find((e) => /^1\s?550\s?€$/.test(nt(e.textContent)) && !e.children.length);
  const tF0 = w(77) - 0.15, tParc = tF0 + 0.2, tW = (i) => w(78) + 0.02 + i * 0.1, tAch = w(81) - 0.06, tVen = w(84) - 0.06, tMpv = w(84) + 0.16, tKpi = w(85) - 0.1, tOutF = w(88) - 0.2;
  [0, 1, 2, 3, 4].forEach((i) => cue(tW(i), 'tick', 0.5)); cue(tAch, 'pop', 0.6); cue(tVen, 'ding', 0.7);
  cue(tMpv, 'whoosh', 0.6); cue(tKpi, 'pop', 0.9); cue(tKpi + 0.05, 'roll', 0.9); cue(tKpi + 0.6, 'ding', 0.8); cue(tOutF, 'whoosh', 0.8);
  win(tParc - 0.02, tParc + 0.3); win(tMpv - 0.05, tMpv + 0.35); win(tKpi - 0.02, tKpi + 0.3); win(tOutF, tOutF + 0.4);
  function paintF(t) {
    const on = t >= tF0 - 0.02 && t < tOutF + 0.45;
    if (!on) { show(M.parc.box, false); show(M.mpv.box, false); show(M.kpi.box, false); return; }
    olPh.style.visibility = t >= tParc + 0.02 ? 'hidden' : '';
    const gone = { x: 540, y: 2500, s: 0.8 };
    // la grille des étapes sort du téléphone ; quand la marge par voiture arrive, elle file vers le haut
    sortie(M.parc, t, tParc, versFilm(PE, olR), { x: 540, y: 1010, s: 1 }, { s0: K / M.parc.Z, rz: -1.2, ry: 4, tBack: tMpv - 0.04, backTo: { x: -700, y: 980, s: 0.85 } });
    etapes.forEach((e, i) => {
      const vague = bump(t, tW(i), 0.1), cle = i === 1 ? bump(t, tAch, 0.35) : i === 4 ? Math.max(bump(t, tVen, 0.3), 0.55 * E(t, tVen + 0.3, 0.3)) : 0;
      const k = Math.max(vague, cle), col = i === 4 && t >= tVen - 0.05 ? '62,203,127' : '255,90,31';
      e.style.transform = `scale(${(1 + 0.05 * vague + 0.06 * (i === 4 || i === 1 ? bump(t, i === 1 ? tAch : tVen, 0.12) : 0)).toFixed(3)})`;
      e.style.borderColor = k > 0.004 ? `rgba(${col},${(0.25 + 0.75 * k).toFixed(2)})` : '';
      e.style.background = k > 0.004 ? `rgba(${col},${(0.04 + 0.22 * k).toFixed(2)})` : '';
    });
    sortie(M.mpv, t, tMpv, { x: 540, y: 1350 }, { x: 540, y: 745, s: 1 }, { s0: 0.5, rz: 1.2, ry: -4, tBack: tOutF, backTo: gone });
    barres.forEach((b, i) => { const g = E(t, tMpv + 0.1 + i * 0.08, 0.5, eOut3); b.f.style.width = (b.w * g).toFixed(2) + '%'; b.n.textContent = `${Math.round(b.v * g)} €`; });
    if (kpiN) kpiN.textContent = `${Math.round(1550 * E(t, tKpi + 0.05, 0.55, eOut3)).toLocaleString('fr-FR').replace(/\s/g, '\u202f')} €`;
    sortie(M.kpi, t, tKpi, { x: 540, y: 1500 }, { x: 540, y: 1215, s: 1 }, { s0: 0.4, rz: -1.5, ry: 5, tBack: tOutF + 0.04, backTo: gone });
  }

  // =====================================================================================================
  // LE TÉLÉPHONE, d'un bout à l'autre : un seul plan continu, jamais de saut. Les parties changent de page DANS le
  // téléphone (glissé « push » d'iOS, ou retour) ; la caméra s'approche et recule sur des ressorts.
  // =====================================================================================================
  const SEQ = [[0, 'analyser-208'], [tRap, 'rapport-208'], [tC0, 'rapport-clio'], [tD0, 'recherche'], [tAl, 'alertes-off'], [tLui, 'messages'], [tE0, 'recherche', 'retour'], [tF0, 'accueil']];
  const SCROLL = {
    'analyser-208': (t) => tr(t, [[0, taR.y - 170], [tTap - 0.55, btnR.y - 520, 'default']]),
    'rapport-208': (t) => tr(t, [[0, 0], [tCote - 0.1, inR.cote.y - 260], [tMarge - 0.1, inR.marge.y - 330], [tVer - 0.1, 0]]),
    'rapport-clio': (t) => tr(t, [[0, 0], [tOff - 0.1, 420]]),
    recherche: (t) => (t < tE0 - 1 ? scrollList(t) : LIST0),
    'alertes-off': () => alY, messages: () => msgY, accueil: () => parcY,
  };
  function pagesTel(t) {
    let cur = 0; for (let i = 0; i < SEQ.length; i++) if (t >= SEQ[i][0]) cur = i;
    for (const pg of ALL_PAGES) show(pg.box, false);
    const [t0, n, dir] = SEQ[cur], p = cur === 0 ? 1 : E(t, t0, 0.42, eOut), back = dir === 'retour', nw = P[n];
    show(nw.box, true); nw.box.style.zIndex = back ? 1 : 2;
    nw.box.style.transform = `translateX(${(back ? -SW * 0.28 * (1 - p) : SW * (1 - p)).toFixed(1)}px)`;
    nw.scroll(SCROLL[n](t));
    if (cur > 0 && p < 1) {
      const pn = SEQ[cur - 1][1], pv = P[pn];
      if (pv !== nw) { show(pv.box, true); pv.box.style.zIndex = back ? 2 : 1; pv.box.style.transform = `translateX(${(back ? SW * p : -SW * 0.28 * p).toFixed(1)}px)`; pv.scroll(SCROLL[pn](t)); }
    }
  }
  const tOutPh = tOutF;
  function telephone(t) {
    const y = tr(t, [[0, 2300], [tPh, 1175], [tTap - 0.6, 1000], [tCote - 0.05, 1070], [tVer, 1060], [tC0, 1045], [tD0, 1030], [tAl, 1040], [tE0, 1080], [tF0, 1090]]) + 1450 * E(t, tOutPh, 0.4, eIn);
    const s = tr(t, [[0, 0.98], [tPh, 1.25], [tTap - 0.6, 0.98], [tCote - 0.05, 0.88], [tVer, 0.92], [tC0, 0.9], [tD0, 0.95], [tScr, 1.02], [tStop + 0.12, 0.92], [tF0, 0.9]]);
    const sp = t > tScr && t < tStop ? Math.sin(Math.PI * (t - tScr) / (tStop - tScr)) : 0;
    const swing = bump(t, tC0, 0.12) + bump(t, tD0, 0.12) + bump(t, tF0, 0.12) - bump(t, tE0, 0.12) + 0.6 * (bump(t, tAl, 0.1) + bump(t, tLui, 0.1));
    poseTel(540 + 10 * Math.sin(t * 0.23), y, { s, rx: 28 * (1 - SP(t, tPh, 'default')) + 6 * sp + 3 * Math.sin(t * 0.6), ry: -5 * Math.sin(t * 0.4) + 7 * swing, rz: -1.2 * Math.sin(t * 0.33) - 1.2 * sp });
  }
  // voile sur l'écran du téléphone quand une carte est sortie (le regard va à la carte), nuit sur « tu dors »
  function veille(t) {
    const f = (a, b, v, da = 0.3, db = 0.25) => v * E(t, a, da) * (1 - E(t, b, db));
    return Math.max(f(tCote, tC0 + 0.05, 0.45), f(tCv, tD0, 0.42), f(tBest, tAl, 0.4, 0.3, 0.2), f(tAl + 0.1, tNuit, 0.4, 0.3, 0.2), f(tNuit, tLui, 0.94, 0.25, 0.3),
      f(tLui + 0.3, tE0, 0.38), f(tMail, tF0, 0.4), f(tParc, 99, 0.6));
  }

  // =====================================================================================================
  // G · fin : « utopicar » se tape dans une pastille (lettres du vrai logo), signature, « lien en bio » ; boucle
  // =====================================================================================================
  const NS = 'http://www.w3.org/2000/svg';
  const GL = mk('div', 'lay', ST);
  const PILL = mk('div', 'a', GL, { height: '200px', borderRadius: '100px', background: 'rgba(244,241,236,.07)', boxShadow: '0 0 0 2px rgba(244,241,236,.14)' });
  const holder = mk('div', 'a', GL, { width: '640px' }); holder.innerHTML = LOGO;
  const svg = holder.querySelector('svg'); svg.style.width = '640px'; svg.style.height = 'auto'; svg.style.display = 'block'; svg.style.overflow = 'visible';
  // l'icône garde son attribut transform (échelle 0,46875) : on l'anime par un groupe parent, sinon le CSS l'écrase
  const iconG0 = svg.querySelector('g'), iconG = document.createElementNS(NS, 'g'); svg.insertBefore(iconG, iconG0); iconG.appendChild(iconG0);
  const wordG = svg.querySelectorAll(':scope > g')[1], wp = wordG.querySelector('path'), fill = wp.getAttribute('fill');
  const subs = wp.getAttribute('d').split(/(?=M)/).filter(Boolean); wp.remove();
  const tmp = subs.map((d) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', fill); wordG.appendChild(p); const b = p.getBBox(); return { p, x0: b.x, x1: b.x + b.width }; });
  tmp.sort((a, b) => a.x0 - b.x0); const letters = [];
  for (const s of tmp) { const L = letters[letters.length - 1]; if (L && s.x0 < L.x1 - 5) { L.ps.push(s.p); L.x1 = Math.max(L.x1, s.x1); } else letters.push({ ps: [s.p], x0: s.x0, x1: s.x1 }); }
  for (const L of letters) { const lg = document.createElementNS(NS, 'g'), one = document.createElementNS(NS, 'path'); one.setAttribute('d', L.ps.map((p) => p.getAttribute('d')).join(' ')); one.setAttribute('fill', fill); L.ps.forEach((p) => p.remove()); lg.appendChild(one); wordG.appendChild(lg); L.g = lg; lg.style.transformBox = 'fill-box'; lg.style.transformOrigin = '50% 100%'; }
  const vb = svg.viewBox.baseVal, LH = vb.height * (640 / vb.width);
  { const hb = holder.getBoundingClientRect(); for (const L of letters) { const r = L.g.getBoundingClientRect(); L.px0 = r.left - hb.left; L.px1 = r.right - hb.left; } }
  const CARET = mk('div', 'a', GL, { width: '9px', height: '110px', borderRadius: '5px', background: '#ff5a1f' });
  const SIG1 = mk('div', 'a', GL, { width: '1080px', textAlign: 'center', top: '1010px', font: '600 112px/1 Clash', letterSpacing: '-.03em', color: '#f4f1ec' }, 'Achète juste.');
  const SIG2 = mk('div', 'a', GL, { width: '1080px', textAlign: 'center', top: '1140px', font: 'italic 400 128px/1 Instrument', color: '#ff8a4c' }, 'Revends mieux.');
  const BIO = mk('div', 'a', GL, { height: '96px', borderRadius: '48px', background: '#f4f1ec', color: '#1c1612', font: '700 40px/96px Satoshi', padding: '0 0 0 46px', whiteSpace: 'nowrap', overflow: 'hidden' });
  const BIOT = mk('span', '', BIO, null, ''); const BIOC = mk('span', '', BIO, { display: 'inline-block', width: '4px', height: '44px', background: '#ff5a1f', marginLeft: '4px', verticalAlign: '-8px' });
  const tG0 = w(88) - 0.06, tTy = tG0 + 0.28, tBio = w(92) + 0.35, HX = 30;
  cue(tG0, 'impact', 1.1); letters.forEach((L, i) => cue(tTy + i * 0.07, 'key', 0.45)); cue(w(89), 'pop', 0.6); cue(w(91), 'pop', 0.7); [...'lien en bio'].forEach((c, i) => { if (c !== ' ') cue(tBio + i * 0.055, 'key', 0.35); }); cue(TLOOP, 'whoosh', 0.9);
  win(TLOOP - 0.05, DUR);
  function paintG(t) {
    const on = t >= tG0 - 0.05 && t < DUR; show(GL, on); if (!on) return;
    const out = E(t, TLOOP, 0.42, eIn);
    const a = SP(t, tG0, 'snappy'), nL = letters.filter((L, i) => t >= tTy + i * 0.07).length;
    const cy = 700 - 30 * E(t, w(89) - 0.2, 0.6);
    const lastX = nL ? letters[nL - 1].px1 : letters[0].px0 - 30;
    const wNow = Math.max(200, (lastX + HX + 60) * a);
    const x0 = 540 - wNow / 2;
    PILL.style.width = wNow.toFixed(1) + 'px';
    tf(PILL, x0, cy - 100, { o: a * (1 - out), s: 1 - 0.9 * out });
    tf(holder, x0 + HX, cy - LH / 2, { o: 1 - out, s: 1 - 0.9 * out });
    iconG.style.transformBox = 'fill-box'; iconG.style.transformOrigin = 'center'; iconG.style.transform = `rotate(${(-90 * (1 - SP(t, tG0 + 0.05, 'default'))).toFixed(2)}deg) scale(${SP(t, tG0 + 0.05, 'snappy').toFixed(3)})`;
    letters.forEach((L, i) => { const p = E(t, tTy + i * 0.07, 0.16); L.g.style.opacity = p.toFixed(3); L.g.style.transform = `translateY(${(20 * (1 - p)).toFixed(1)}px) scale(${(0.7 + 0.3 * p).toFixed(3)})`; });
    const typing = t < tTy + letters.length * 0.07 + 0.2;
    show(CARET, (typing || Math.floor((t - tTy) / 0.4) % 2 === 0) && t < w(89));
    tf(CARET, x0 + HX + lastX + 14, cy - 55, { o: 1 - out });
    const s1 = E(t, w(89) - 0.06, 0.35), s2 = E(t, w(91) - 0.06, 0.35);
    tf(SIG1, 0, 30 * (1 - s1), { o: s1 * (1 - out) }); tf(SIG2, 0, 30 * (1 - s2), { o: s2 * (1 - out) });
    const n = clamp(Math.floor((t - tBio) / 0.055) + 1, 0, 11); BIOT.textContent = 'lien en bio'.slice(0, n);
    const bw = 100 + n * 21; show(BIO, t >= tBio - 0.15);
    BIO.style.width = bw + 'px'; tf(BIO, 540 - bw / 2, 1330, { s: SP(t, tBio - 0.15, 'snappy') * (1 - out), o: 1 - out });
    BIOC.style.opacity = n < 11 || Math.floor((t - tBio) / 0.4) % 2 === 0 ? '1' : '0';
  }

  // ---------- caméra, seek ----------
  window.seek = (t) => {
    fond(t);
    CAM.style.transform = `perspective(2400px) rotateY(${(1.2 * Math.sin(t * 0.37)).toFixed(3)}deg) rotateX(${(0.8 * Math.sin(t * 0.29 + 1)).toFixed(3)}deg) scale(${(1.0 + 0.012 * Math.sin(t * 0.5)).toFixed(4)})`;
    const telOn = show(PH, t >= tPh - 0.05 && t < tOutPh + 0.45);
    if (telOn) { telephone(t); pagesTel(t); VEILLE.style.opacity = veille(t).toFixed(3); }
    paintA(t < TLOOP ? t : 0);
    paintB(t); paintC(t); paintD(t); paintE(t); paintF(t); paintG(t);
    sousTitres(t < TLOOP ? t : 0);
    A.style.clipPath = A0.style.clipPath = t >= TLOOP ? `circle(${(2300 * E(t, TLOOP + 0.12, DUR - TLOOP - 0.14, eIO)).toFixed(0)}px at 540px 900px)` : '';
  };
  const inWin = (t) => FAST.some(([a, b]) => t >= a && t <= b);
  window.shutter = (t) => (inWin(t) ? 1 : 0.5);
  window.samples = (t) => (inWin(t) ? 8 : 4);
  window.filmDur = DUR; window.DBG = { M, P };
  window.cues = CUES.sort((x, y) => x.t - y.t);
  window.seek(0);
  window.filmReady = true;
})().catch((e) => { console.error('FILM', e.message, e.stack); document.title = 'ERREUR ' + e.message; });
