// UTOPICAR — pub TikTok 15 s, 1080x1920, version minimale.
// Un titre et un extrait réel du site par plan ; une carte blanche qui se transforme d'un extrait à l'autre, puis en logo.
// Contrat : window.seek(t) peint la frame t. Aucune transition CSS, aucune minuterie, aucun état entre frames.
(async function () {
  const { spring, track, clamp, noise } = Motion;
  const TL = await (await fetch('../timeline.json')).json();
  const L = await (await fetch('../assets/ui/layout.json')).json();
  const M = TL.marks;
  const UI = '../assets/ui/';
  const fmtEur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const eurS = n => (n > 0 ? '+ ' : n < 0 ? '− ' : '') + fmtEur.format(Math.abs(n)); // même formatage que l'app

  const $ = s => document.querySelector(s);
  const el = (tag, cls, parent, css) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (parent) parent.appendChild(e); return e; };
  const px = v => v + 'px';
  const imgs = [];
  // extrait : le rectangle r (px CSS de la page) de la capture `src`, agrandi s fois
  function crop(parent, src, r, s, pad = 0) {
    const sh = L.shots[src], ox = sh.x || 0, oy = sh.y || 0;
    const w = (r.w + 2 * pad) * s, h = (r.h + 2 * pad) * s;
    const d = el('div', 'crop', parent, { width: px(w), height: px(h) });
    const i = el('img', null, d, { left: px(-(r.x - pad - ox) * s), top: px(-(r.y - pad - oy) * s), width: px(sh.w * s), height: px(sh.h * s) });
    i.src = UI + src + '.png'; imgs.push(i);
    d.w = w; d.h = h; return d;
  }
  const place = (e, x, y) => { e.style.left = px(x); e.style.top = px(y); e.x = x; e.y = y; return e; };

  /* ---------------- carte et extraits ---------------- */
  const S = 2.5, PAD = 34, CX = 72, CW = 868, CY = 940; // extraits agrandis 2,5 fois, carte centrée sur y = 940
  const card = $('#card'), content = $('#content'), markEl = $('#mark');
  const group = () => el('div', 'group', content, { left: px(PAD), top: px(PAD) });

  // plan 1 : verdict NO GO + « Il vous reste − 1 200 € » (le montant compte comme dans l'app)
  const g1 = group();
  const chip = place(crop(g1, 'rapport', L.verdict, S, 3), 0, 0);
  const RT = L.shots.lgTotalNoV, rowR = { ...RT, y: RT.y + 16, h: RT.h - 19 }; // sans la double ligne du ticket
  const row = place(crop(g1, 'lgTotalNoV', rowR, S), 0, chip.h + 28);
  const T = L.total, f = v => parseFloat(v) * S + 'px';
  const tot = el('div', 'counter', row, { left: px((T.x - rowR.x) * S), top: px((T.y - rowR.y) * S), width: px(T.w * S), height: px(T.h * S),
    fontSize: f(T.fontSize), fontWeight: T.fontWeight, fontStretch: T.fontStretch, letterSpacing: f(T.letterSpacing), color: T.color, lineHeight: f(T.lineHeight), textAlign: 'right' });
  const h1 = row.y + row.h;
  const underline = (g, x, y, w) => el('div', 'uline', g, { left: px(x), top: px(y), width: px(w) });
  // le montant est aligné à droite : on mesure sa largeur réelle une fois la police chargée
  const u1 = underline(g1, 0, row.y + (T.y - rowR.y + T.h) * S - 6, 0);

  // plan 2 : « Ne dépassez pas 7 500 € » seul (l'intérieur du bloc, sans la phrase d'explication), agrandi 4,6 fois
  const g2 = group(), S2 = 4.6;
  const PF = L.plafFig, PL = L.plafLabel, PR = L.shots.plafond;
  const PC = { x: PR.x + 14, y: PR.y + 14, w: Math.max(PF.x + PF.w, PL.x + PL.w) + 4 - (PR.x + 14), h: PF.y + PF.h + 4 - (PR.y + 14) }; // à l'intérieur du bloc, sans ses coins
  const plaf = place(crop(g2, 'plafond', PC, S2), 0, 0);
  const h2 = plaf.h;
  const u2 = underline(g2, (PF.x - PC.x) * S2, (PF.y + PF.h - PC.y) * S2 - 4, PF.w * S2);

  // plan 3 : l'annonce de la Clio, son prix et sa position face à la cote
  const C = L.cote, g3 = group(), S3 = 3.4; // l'annonce est étroite : agrandie davantage
  const aTitle = place(crop(g3, 'live', C.title, S3), 0, 0);
  const aAgo = place(crop(g3, 'live', C.ago, S3), 0, aTitle.h + 10);
  const aPrix = place(crop(g3, 'live', C.prix, S3), 0, aAgo.y + aAgo.h + 40);
  const aCote = place(crop(g3, 'live', C.cote, S3), 0, aPrix.y + aPrix.h + 14);
  const aSous = place(crop(g3, 'live', C.sous, S3), 0, aCote.y + aCote.h + 8);
  const aVraie = place(crop(g3, 'live', C.vraie, S3, 2), 0, aSous.y + aSous.h + 30);
  const h3 = aVraie.y + aVraie.h;
  const u3 = underline(g3, 0, aSous.y + aSous.h + 2, aSous.w);

  const rect = (w, h) => ({ x: CX, y: CY - (h + 2 * PAD) / 2, w: Math.min(CW, w + 2 * PAD), h: h + 2 * PAD, r: 36 });
  const R1 = rect(row.w, h1), R2 = rect(plaf.w, h2), R3 = rect(aTitle.w, h3);
  const MS = 176, MX = 72, MY = 730;
  const R4 = { x: MX, y: MY, w: MS, h: MS, r: MS * 9 / 32 };
  const keys = k => [[0, R1[k]], [M.morph2, R2[k], 'default'], [M.morph3, R3[k], 'default'], [M.logo, R4[k], 'default']];
  const KX = keys('x'), KY = keys('y'), KW = keys('w'), KH = keys('h'), KR = keys('r');
  markEl.innerHTML = L.logo.markHTML.replace(/^<span[^>]*>/, '').replace(/<\/span>$/, '');

  /* ---------------- titres ---------------- */
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const keyify = (txt, key) => { const i = key ? txt.indexOf(key) : -1; return i < 0 ? esc(txt) : esc(txt.slice(0, i)) + '<span class="key">' + esc(key) + '</span>' + esc(txt.slice(i + key.length)); };
  const titles = TL.titles.map(Ti => {
    const d = el('div', 'title', $('#titles'));
    const ls = Ti.lines.map(txt => { const m = el('div', 'tl', d); const s = el('span', null, m); s.innerHTML = keyify(txt.replace(/ (?=\d|€|\?|:)/g, ' '), Ti.key.replace(/ (?=\d|€)/g, ' ')); return s; });
    return { t: Ti.t, d, ls };
  });

  /* ---------------- logo + CTA ---------------- */
  const word = $('#word'); word.textContent = L.logo.text || 'UTOPICAR';
  const ctaPre = $('#ctaPre'), ctaPill = $('#ctaPill'), ctaPost = $('#ctaPost');
  ctaPre.firstChild.textContent = TL.cta.pre; ctaPill.textContent = TL.cta.word; ctaPost.firstChild.textContent = TL.cta.post;

  await document.fonts.load("800 100px 'Archivo'");
  await document.fonts.ready;
  for (const Ti of titles) {
    Ti.d.style.fontSize = '112px';
    const w = Math.max(1, ...Ti.ls.map(s => s.getBoundingClientRect().width));
    Ti.d.style.fontSize = px(Math.min(112, Math.floor(112 * 860 / w)));
  }
  word.style.fontSize = '100px';
  const wsize = Math.min(104, Math.floor(100 * (940 - (MX + MS + 40)) / word.getBoundingClientRect().width));
  Object.assign(word.style, { fontSize: px(wsize), left: px(MX + MS + 40), top: px(MY + MS / 2 - wsize * 0.5) });
  Object.assign(ctaPre.style, { top: px(1000), fontSize: '92px' });
  Object.assign(ctaPill.style, { top: px(1118), fontSize: '100px', padding: '22px 36px 20px' });
  Object.assign(ctaPost.style, { top: px(1286), fontSize: '58px' });
  await Promise.all(imgs.map(i => i.decode().catch(() => {})));
  // largeur réelle du montant (le bloc du total est aligné à droite dans sa boîte)
  const probe = el('span', null, tot); probe.textContent = eurS(-1200);
  const pw = probe.getBoundingClientRect().width; probe.remove();
  Object.assign(u1.style, { left: px((T.x - rowR.x + T.w) * S - pw), width: px(pw) });

  /* ---------------- seek ---------------- */
  const stage = $('#stage'), light = $('#light');
  const show = (e, on) => { e.style.display = on ? '' : 'none'; };
  // fond de carte : blanc (#FFFFFF), puis la couleur réelle du bloc plafond (#F5F6F8) au plan 2, puis blanc
  const BG = [[0, 0], [M.morph2, 1, 'default'], [M.morph3, 0, 'default']];
  const bgAt = t => { const q = clamp(track(t, BG), 0, 1); return [255 - 10 * q, 255 - 9 * q, 255 - 7 * q]; };
  const mix = (a, b, p) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * p)).join(',')})`;
  // entrée d'un élément (déplacement + opacité, jamais l'opacité seule)
  function enter(e, t, t0, preset = 'default', dy = 24, sc = 1) {
    const p = spring(t - t0, preset);
    show(e, t >= t0);
    e.style.transform = `translateY(${(1 - p) * dy}px) scale(${sc + (1 - sc) * p})`;
    e.style.opacity = clamp(p * 1.6, 0, 1);
  }
  // sortie d'un groupe avant le morph suivant
  function leave(g, t, t0) {
    const x = clamp(spring(t - t0, 'snappy'), 0, 1);
    show(g, x < 0.999);
    g.style.transform = `translateY(${-x * 18}px)`; g.style.opacity = 1 - x;
  }

  function seek(t) {
    /* carte : rectangle qui morphe d'un extrait à l'autre, puis devient le carré du logo */
    const ce = spring(t - M.card, 'heavy');
    const drift = t < M.logo ? noise(3, t * 0.35) * 6 : 0;
    const x = track(t, KX), y = track(t, KY), w = track(t, KW), h = track(t, KH), r = track(t, KR);
    const fp = clamp(spring(t - M.logo, 'snappy') * 1.8, 0, 1);
    show(card, t >= M.card);
    Object.assign(card.style, { left: px(x), top: px(y), width: px(w), height: px(h), borderRadius: px(r),
      background: mix(bgAt(t), [255, 201, 40], fp), opacity: clamp(ce * 1.6, 0, 1),
      transform: `translateY(${(1 - ce) * 48 + drift}px) scale(${0.94 + 0.06 * ce})` });
    content.style.opacity = 1 - fp;
    const t0s = t < M.morph2 ? M.card : t < M.morph3 ? M.morph2 : M.morph3;
    content.style.transform = `scale(${1 + 0.035 * clamp((t - t0s) / 3.8, 0, 1)})`;
    light.style.opacity = clamp(1 - spring(t - M.logo, 'default'), 0, 1);

    // plan 1
    enter(chip, t, M.verdict, 'snappy', 12, 0.85);
    enter(row, t, M.total, 'default', 24);
    const tp = spring(t - M.total, 'heavy');
    tot.textContent = eurS(Math.round(-1200 * Math.min(1, tp / 0.99)));
    const line_ = (u, t0) => { const p = clamp(spring(t - t0, 'snappy'), 0, 1.05); show(u, t >= t0); u.style.transform = `scaleX(${p})`; };
    line_(u1, M.mark1);
    leave(g1, t, M.out1);
    // plan 2
    enter(plaf, t, M.plafond, 'default', 24);
    line_(u2, M.mark2);
    leave(g2, t, M.out2);
    // plan 3
    enter(aTitle, t, M.annonce, 'default', 20); enter(aAgo, t, M.annonce + 0.08, 'default', 20);
    enter(aPrix, t, M.prix, 'default', 20); enter(aCote, t, M.prix + 0.08, 'default', 20);
    enter(aSous, t, M.sous, 'snappy', 14);
    enter(aVraie, t, M.vraie, 'snappy', 10, 0.8);
    line_(u3, M.mark3);
    leave(g3, t, M.out3);
    show(g2, t >= M.morph2 && t < M.out2 + 0.4); show(g3, t >= M.morph3 && t < M.out3 + 0.4);

    // icône du logo (vraie proportion 19/32)
    const mp = spring(t - (M.logo + 0.3), 'snappy'), ms = w * 19 / 32;
    show(markEl, t >= M.logo + 0.3);
    Object.assign(markEl.style, { width: px(ms), height: px(ms), marginLeft: px(-ms / 2), marginTop: px(-ms / 2), transform: `scale(${0.6 + 0.4 * mp})`, opacity: clamp(mp * 1.5, 0, 1) });

    /* titres : masque de ligne, sortie avant le titre suivant */
    titles.forEach((Ti, i) => {
      const tn = i + 1 < titles.length ? titles[i + 1].t : 99;
      const on = t >= Ti.t && t < tn + 0.35 && Ti.ls.length;
      show(Ti.d, on); if (!on) return;
      const xo = spring(t - (tn - 0.2), 'snappy');
      Ti.ls.forEach((s, j) => {
        const e = spring(t - (Ti.t + 0.08 * j), 'heavy');
        s.style.transform = `translateY(${(1 - e) * 108 - xo * 46}%)`;
        s.style.opacity = clamp(e * 2.2, 0, 1) * (1 - xo);
      });
    });

    /* carton final : poussée lente et continue */
    stage.style.scale = t > M.logo ? 1 + 0.03 * clamp((t - M.logo) / (TL.dur - M.logo), 0, 1) : 1;
    stage.style.transformOrigin = '420px 1000px';
    const wp = spring(t - M.wordmark, 'heavy');
    show(word, t >= M.wordmark);
    word.style.clipPath = `inset(-20% ${(1 - wp) * 100}% -20% 0)`;
    word.style.transform = `translateX(${(1 - wp) * -36}px)`;
    const line = (e, t0) => { const p = spring(t - t0, 'heavy'); show(e, t >= t0); e.firstChild.style.transform = `translateY(${(1 - p) * 108}%)`; e.firstChild.style.opacity = clamp(p * 2.2, 0, 1); };
    line(ctaPre, M.cta);
    const pp = spring(t - (M.cta + 0.12), 'snappy');
    show(ctaPill, t >= M.cta + 0.12);
    ctaPill.style.transform = `scale(${0.82 + 0.18 * pp})`; ctaPill.style.transformOrigin = '0 50%';
    ctaPill.style.clipPath = `inset(0 ${(1 - clamp(pp * 1.2, 0, 1)) * 100}% 0 0 round 28px)`;
    line(ctaPost, M.cta + 0.3);
  }

  window.TL = TL;
  window.seek = seek;
  seek(0);
  window.filmReady = true;

  // aperçu interactif hors rendu uniquement
  if (!/render/.test(location.search)) {
    const t0 = performance.now();
    const loop = () => { seek(((performance.now() - t0) / 1000) % TL.dur); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
})();
