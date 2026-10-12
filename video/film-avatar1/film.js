// Avatar 1 · « Moins 1 200 € sur une voiture impeccable » (24,9 s). Contrat : window.seek(t) peint la frame t.
// L'avatar est une séquence d'images (frames/, 30 i/s, face.py) ; tout le reste est fonction de t, calé sur words.json.
(async function () {
  const { spring, clamp } = Motion;
  const stage = document.getElementById('stage'), cam = document.getElementById('cam'), av = document.getElementById('av');
  const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; (parent || stage).appendChild(e); return e; };
  const S = (t, t0, p) => spring(t - t0, p || 'default');
  const P = { rise: { f: 2.1, z: 1 }, card: { f: 2.2, z: 0.8 }, pop: { f: 3.4, z: 0.72 }, out: { f: 2.6, z: 1 }, push: { f: 1.2, z: 1 } };
  // entrée (glisse + échelle) et sortie (glisse), jamais un simple fondu ; coupe nette après la sortie
  const show = (e, t, tin, tout, { dy = 60, dx = 0, s0 = 0.92, pin = P.rise, pout = P.out, oy = -50 } = {}) => {
    const a = tin == null ? 1 : S(t, tin, pin), b = tout == null ? 0 : S(t, tout, pout);
    const vis = (tin == null || t >= tin) && (tout == null || t < tout + 0.45);
    e.style.display = vis ? '' : 'none';
    if (!vis) return;
    const y = (1 - a) * dy + b * oy, x = (1 - a) * dx, s = s0 + (1 - s0) * a;
    e.style.opacity = clamp(Math.min(a * 1.6, 1) * (1 - b * 1.4), 0, 1).toFixed(3);
    e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${s.toFixed(4)})`;
  };

  await Promise.all(['700 228px Clash', '600 92px Clash', '700 60px Satoshi', '900 66px Satoshi', '500 24px Satoshi', 'italic 84px Serif'].map(f => document.fonts.load(f)));
  const W = await (await fetch('words.json')).json();
  const FR = await (await fetch('frames/index.json')).json();
  const img = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = src; });
  const UI = { launch: '../assets/ui/launch.png', lu: '../assets/ui2/lu.png', total: '../assets/ui/lg7.png', plaf: '../assets/ui/plafond.png' };
  for (const k in UI) await img(UI[k]);

  // ---------- mots : les élisions (« d », « 'acheter ») sont recollées ----------
  const T = [];
  for (const [w, a, b] of W.words) { if (w.startsWith("'") && T.length) { T[T.length - 1].w += w; T[T.length - 1].b = b; } else T.push({ w, a, b }); }
  const at = (i) => T[i].a;

  // ---------- 1. accroche (0 → 5,3 s) : lisible dès l'image 0 ----------
  const hook = el('div', 'abs hook'); hook.style.top = '262px';
  const big = el('div', 'big', hook, '−1&nbsp;200&nbsp;€');
  const sub = el('div', 'sub', hook); sub.style.marginTop = '26px'; hook.insertBefore(document.createElement('br'), sub);
  const s1 = el('span', '', sub, 'sur une voiture '), s2 = el('span', 'it', sub, 'impeccable.'); s2.style.fontSize = '84px'; s2.style.marginLeft = '18px';

  // ---------- 2. les frais (pendant le soupir, 5,9 → 9,1 s) ----------
  // deux lignes centrées sur x = 540
  const rows = [300, 420].map(y => { const r = el('div', 'abs'); Object.assign(r.style, { top: y + 'px', left: '140px', width: '800px', display: 'flex', justifyContent: 'center', gap: '18px' }); return r; });
  const chips = [['Contrôle technique', 0], ['Pneus', 0], ['Embrayage', 1], ['Carte grise', 1]].map(([txt, r]) => el('div', 'chip', rows[r], `<i>−</i>${txt}`));
  const tChip = [5.95, 6.4, 6.85, 7.3];

  // ---------- 3. l'outil (13,3 → 20 s) : vraies captures, données de démonstration ----------
  const card = (src, top) => { const c = el('div', 'abs card'); c.style.top = top + 'px'; el('img', '', c).src = src; return c; };
  const cLaunch = card(UI.launch, 330), cLu = card(UI.lu, 250), cTot = card(UI.total, 300), cPlaf = card(UI.plaf, 262);
  
  const press = el('div', 'press', cLaunch);
  const note = el('div', 'abs note', null, 'Données de démonstration'); note.style.top = '668px';

  // ---------- 4. « Pas après. » et CTA ----------
  const pas = el('div', 'abs pas', null, 'Pas <span class="it">après.</span>'); pas.style.top = '330px';
  const cta = el('div', 'abs cta'); cta.style.top = '256px';
  const l1 = el('div', 'l1', cta, 'Commente');
  const kwr = el('div', '', cta); kwr.style.marginTop = '22px';
  const kw = el('span', 'kw', kwr, 'DÉBUTANT');
  const kw2r = el('div', '', cta); kw2r.style.marginTop = '22px';
  const kw2 = el('span', 'kw2', kw2r, 'ou PRO');
  const l3 = el('div', 'l3', cta, 'je t’envoie le guide'); l3.style.marginTop = '24px';

  // ---------- sous-titres ----------
  const cap = document.getElementById('cap') || el('div', '', stage); cap.id = 'cap';
  const G = [[6, 8, 5.5, 9.15], [9, 12, 9.25, 12.95], [13, 15, 13.1, 15.05], [16, 20, 15.05, 17.05], [21, 26, 17.15, 18.15], [27, 28, 18.15, 19.95]];
  const EM = new Set(['parfaite.']), HL = new Set(['frais.', 'Utopicar.']);
  const spans = [];
  for (const [i0, i1, ta, tb] of G) for (let i = i0; i <= i1; i++) {
    const s = el('span', EM.has(T[i].w) ? 'em' : '', cap, T[i].w); spans.push({ s, i, ta, tb });
  }

  async function paint(t) {
    // avatar : image de la séquence ; caméra : poussée lente + coups de zoom sur les temps forts
    const f = Math.min(FR.n - 1, Math.max(0, Math.round(t * FR.fps)));
    const src = `frames/f${String(f).padStart(4, '0')}.jpg`;
    if (av.dataset.src !== src) { av.src = src; av.dataset.src = src; await av.decode(); }
    const punch = (t0, k) => k * (S(t, t0, P.pop) - S(t, t0 + 0.35, P.push));
    const sc = 1 + 0.045 * clamp(t / 24, 0, 1) + punch(5.42, 0.05) + punch(at(12), 0.045) + punch(at(29), 0.06);
    cam.style.transform = `scale(${sc.toFixed(4)})`;

    // 1. accroche
    show(hook, t, null, 5.25, { oy: -70 });
    big.style.transform = `scale(${(1.04 - 0.04 * S(t, 0, P.rise)).toFixed(4)})`;
    show(s1, t, at(3) - 0.05, null, { dy: 24, s0: 0.96 }); show(s2, t, at(5) - 0.04, null, { dy: 24, s0: 0.9, pin: P.pop });
    s1.style.display = s1.style.display === 'none' ? 'inline-block' : 'inline-block'; s2.style.display = 'inline-block';
    if (t < at(3) - 0.05) s1.style.opacity = 0; if (t < at(5) - 0.04) s2.style.opacity = 0;

    // 2. frais : arrivent un par un, tremblent sur « frais », sortent avant « Sur une voiture »
    chips.forEach((c, k) => {
      show(c, t, tChip[k], 9.05 + k * 0.04, { dy: -80, s0: 0.7, pin: P.pop, oy: -60 });
      if (t > at(8) && t < at(8) + 0.5 && c.style.display !== 'none') {
        const sh = Math.sin((t - at(8)) * 70 + k) * 7 * (1 - (t - at(8)) / 0.5);
        c.style.transform += ` translateX(${sh.toFixed(1)}px)`;
      }
    });

    // 3. l'outil : bouton « Analyser le dossier » (pression sur « colle »), ce que l'outil a lu, puis le verdict
    const tPaste = at(17);
    show(cLaunch, t, 13.35, tPaste + 0.45, { dx: 140, dy: 0, s0: 0.95, pin: P.card });
    const pr = S(t, tPaste, P.pop) - S(t, tPaste + 0.18, P.out);
    if (t >= tPaste && t < tPaste + 0.6) {
      const r = 30 + 160 * clamp((t - tPaste) / 0.45, 0, 1);
      Object.assign(press.style, { display: '', left: (18 + 764 * 0.29 - r) + 'px', top: (18 + 72 - r) + 'px', width: 2 * r + 'px', height: 2 * r + 'px', opacity: (0.6 * (1 - (t - tPaste) / 0.6)).toFixed(3) });
    } else press.style.display = 'none';
    if (cLaunch.style.display !== 'none') cLaunch.style.transform += ` scale(${(1 - 0.035 * pr).toFixed(4)})`;
    show(cLu, t, tPaste + 0.5, 17.05, { dy: 70, s0: 0.94, pin: P.card });
    show(cTot, t, at(21) + 0.05, at(27) - 0.05, { dy: 70, s0: 0.94, pin: P.card });
    show(cPlaf, t, at(27), 19.95, { dy: 70, s0: 0.94, pin: P.card });
    show(note, t, 13.35, 19.95, { dy: 10, s0: 1 });

    // 4. « Pas après. » puis CTA
    show(pas, t, at(29) - 0.04, at(31) - 0.12, { dy: 0, s0: 1.18, pin: P.pop, oy: -60 });
    show(cta, t, at(31) - 0.06, null, { dy: 40, s0: 0.96 });
    show(kwr, t, at(32) - 0.04, null, { dy: 30, s0: 0.75, pin: P.pop });
    show(kw2r, t, at(33) - 0.02, null, { dy: 26, s0: 0.85, pin: P.pop });
    show(l3, t, at(35) - 0.04, null, { dy: 24, s0: 0.96 });

    // sous-titres : la phrase en cours, mot par mot ; le mot dit est en orange
    for (const { s, i, ta, tb } of spans) {
      const on = t >= ta && t < tb && t >= T[i].a - 0.03;
      s.style.display = t >= ta && t < tb ? '' : 'none';
      if (s.style.display === 'none') continue;
      const a = S(t, T[i].a - 0.03, P.pop);
      s.style.opacity = on ? clamp(a * 2, 0, 1).toFixed(3) : '0';
      s.style.transform = `translateY(${((1 - a) * 18).toFixed(1)}px) scale(${(0.9 + 0.1 * a).toFixed(4)})`;
      const speaking = t >= T[i].a && t < Math.max(T[i].b, T[i].a + 0.22);
      if (!EM.has(T[i].w)) s.className = speaking || HL.has(T[i].w) ? 'hl' : '';
    }
  }

  // textes de l'accroche : réduits jusqu'à tenir dans la colonne sûre (800 px), mesurés sur le texte lui-même
  const fit = (e, max) => { for (let k = 0; k < 6; k++) { const w = e.getBoundingClientRect().width; if (w <= max) break; e.style.fontSize = (parseFloat(getComputedStyle(e).fontSize) * max / w * 0.98).toFixed(1) + 'px'; } };
  big.style.display = 'inline-block'; fit(big, 790);
  sub.style.display = 'inline-block'; s2.style.display = 'inline-block';
  for (let k = 0; k < 6 && sub.getBoundingClientRect().width > 790; k++) { const r = 790 / sub.getBoundingClientRect().width * 0.98; sub.style.fontSize = (parseFloat(getComputedStyle(sub).fontSize) * r).toFixed(1) + 'px'; s2.style.fontSize = (parseFloat(getComputedStyle(s2).fontSize) * r).toFixed(1) + 'px'; }
  window.seek = (t) => paint(t);
  await paint(0);
  window.filmReady = true;
})();
