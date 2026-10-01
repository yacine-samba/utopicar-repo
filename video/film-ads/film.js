// UTOPICAR — trois pubs TikTok de 10 à 15 s, voix de Simon, 1080x1920, 30 i/s. Une idée par pub, hook lisible dès
// l'image 0, preuve sur la vraie interface, CTA « Commente GARAGE » (carton ≤ 3 s).
//   ads1 « Ne l'achète pas. »          : la Golf collée, NO GO, − 1 200 €, « en 2 secondes, tu sais ».
//   ads2 « 1 450 € sous la cote. »     : nouvelle annonce il y a 12 min, recherche suivie, GO + 1 932 €.
//   ads3 « 14 820 € de marge. »        : zéro tableur, le tableau de bord et le parc se calculent tout seuls.
// Repères posés sur les mots de Simon par scripts/vo_marks.py (timeline-ads<N>.json). Zone sûre : x 60 → 940, y 220 → 1480.
const { spring, clamp, lerp, noise } = Motion;
const { el, show, smooth, inOut, bump, place, crop, text, typeText, marker, cursor, moveCursor } = Kit;
const V = document.body.dataset.v;
const TL = await (await fetch(`../timeline-ads${V}.json`)).json();
const U1 = await (await fetch('../assets/ui/layout.json')).json();
const U2 = await (await fetch('../assets/ui2/layout.json')).json();
const M = TL.marks;
const stage = document.getElementById('stage');
const LOGO = (await (await fetch('../assets/brand/logo.svg')).text()).replace(/<!--.*?-->/s, '');
const CX = 500;
const inWin = (t, a, b) => t >= a && t < b;

/* ================= outils (mêmes règles que l'explainer) ================= */
const SRC = {};
async function load(key, url) { const i = new Image(); i.src = url; await i.decode(); SRC[key] = { url, w: i.naturalWidth, h: i.naturalHeight }; }
for (const k of ['dcard1', 'dcard2', 'ticket', 'plaf', 'schip', 'lvmini', 'vrow1', 'vrow2', 'kpi1', 'kpi2', 'kpi3', 'kpi4', 'kpi5', 'kpi6', 'pipe', 'best']) await load(k, `../assets/ui2/${k}.png`);
for (const k of ['scan', 'launch', 'card-lv1']) await load(k, `../assets/ui/${k}.png`);
const full = (k) => ({ x: 0, y: 0, w: SRC[k].w / 3, h: SRC[k].h / 3 });
function cardR(parent, key, r, k, rad = 22, bg = '#FFFFFF') {
  const s = SRC[key]; const e = el('div', 'abs', parent);
  Object.assign(e.style, { borderRadius: rad * k + 'px', overflow: 'hidden', width: r.w * k + 'px', height: r.h * k + 'px', background: bg });
  const c = crop(e, s.url, s.w, s.h, r, k); c.style.position = 'absolute'; e._k = k; e._r = r; e._w = r.w * k; e._h = r.h * k;
  return e;
}
const SHADOW = '0 4px 12px rgba(12,15,20,.06),0 60px 120px -48px rgba(12,15,20,.32)';
const lift = (e) => { e.style.boxShadow = SHADOW; return e; };
const card = (parent, key, k, pd = 8, rad = 22) => lift(cardR(parent, key, { x: pd, y: pd, w: SRC[key].w / 3 - 2 * pd, h: SRC[key].h / 3 - 2 * pd }, k, rad));
function hlOn(c, r, pad = [6, 4]) {
  const h = el('div', 'hl', c); const k = c._k;
  Object.assign(h.style, { left: (r.x - c._r.x - pad[0]) * k + 'px', top: (r.y - c._r.y - pad[1]) * k + 'px', width: (r.w + 2 * pad[0]) * k + 'px', height: (r.h + 2 * pad[1]) * k + 'px' });
  return h;
}
function fitW(box, base, max = 830) {
  const tf = box.style.transform; box.style.transform = 'none'; box.style.fontSize = base + 'px';
  const w = Math.max(...[...box.querySelectorAll('.ln')].map(l => { const r = [...l.querySelectorAll('.ch')].map(c => c.getBoundingClientRect()).filter(r => r.width > 0); return r.length ? Math.max(...r.map(x => x.right)) - Math.min(...r.map(x => x.left)) : 0; }));
  if (w > max) box.style.fontSize = (base * max / w).toFixed(1) + 'px'; box.style.transform = tf;
}
const at = (box, y, s = 1) => { box.style.transform = `translate(0px,${(y - box.offsetHeight / 2).toFixed(1)}px) scale(${s.toFixed(4)})`; };
const FITS = [];
const T = (parent, segs, size) => { const b = text(parent, segs); fitW(b, size); FITS.push([b, size]); return b; };
const addMark = (box, sel = '.k') => el('div', 'mk', box.querySelector(sel));
const E = (p) => (p > 0.0005 ? 1 : 0);
// chiffre géant : lettres qui montent (heavy), sans rebond
function giant(b, t, t0) { b.chars.forEach((c, i) => { const p = spring(t - (t0 + i * 0.035), 'heavy'); c.style.opacity = clamp(p * 1.8, 0, 1).toFixed(3); c.style.transform = `translateY(${((1 - p) * 120).toFixed(1)}px)`; }); }
const HOLD = -3;
const push = (layer, t, a, b, k = 0.05) => { layer.style.transformOrigin = '500px 850px'; layer.style.transform = `translateY(${(-smooth(a, b, t) * 26).toFixed(1)}px) scale(${(1 + smooth(a, b, t) * k).toFixed(4)})`; };

/* ================= fonds + fin commune ================= */
const bgW = el('div', 'layer grid', stage);
const bgD = el('div', 'layer grid dark', stage);
const S = el('div', 'layer', stage);                      // scène de la pub
const en = el('div', 'layer', stage);
const pill = el('div', 'pill', en); pill.innerHTML = `${LOGO}<span class="wm">${U1.logo.text}</span>`;
const CTA = T(en, [['Commente ', 'bdw'], ['GARAGE', 'bd g']], 84);
CTA.querySelector('.g').classList.add('ctaw'); const ctaBg = el('div', 'ctabg', CTA.querySelector('.g'));
const CTA2 = T(en, [["pour recevoir l'accès.", 'lt onDark']], 62);
const demo = el('div', 'demo', stage); demo.textContent = 'Données de démonstration';
const cur = cursor(stage, false), curD = cursor(stage, true);

/* ================= les trois scènes ================= */
let draw;
if (V === '1') {
  // « Stop. Ne l'achète pas. Cette Golf à 9 500 €, je la colle dans UTOPICAR… moins 1 200 €, frais compris.
  //   En deux secondes, tu sais. Commente GARAGE. »
  const H = T(S, [["Ne l'achète ", 'rd'], ['pas.', 'rd k']], 150); const mkH = addMark(H);
  const golf = lift(cardR(S, 'dcard1', { x: 8, y: 8, w: 362, h: 110 }, 2.35));
  const hlPrix = hlOn(golf, { x: 211, y: 97, w: 44, h: 16 }, [5, 3]);
  const TA = { x: 30, y: 952, w: 345, h: 212 };
  const area = lift(cardR(S, 'scan', TA, 2.4, 20));
  const mask = el('div', 'mask', area);
  Object.assign(mask.style, { left: (38.6 - TA.x) * 2.4 + 'px', top: (986.6 - TA.y) * 2.4 + 'px', width: (368 - 38.6) * 2.4 + 'px', height: (1146 - 986.6) * 2.4 + 'px' });
  const bar = cardR(S, 'launch', full('launch'), 2.15, 18, 'transparent');
  const tk = lift(cardR(S, 'ticket', U2.ticketTop, 2.6, 20));
  const MIN = T(S, [['− 1 200 €', 'rd']], 220); MIN.style.fontStretch = '112%';
  const FR = T(S, [['frais ', 'lt'], ['compris.', 'bd']], 88);
  const D2 = T(S, [['En ', 'lt'], ['2 secondes', 'bd k'], [',', 'lt'], ['\n', ''], ['tu sais.', 'bd']], 120); const mkD2 = addMark(D2);
  draw = (t) => {
    push(S, t, 0, M.cta);
    // accroche : pleine dès l'image 0, secousse sur « Stop »
    const hq = spring(t - (M.colle - 0.3), 'default');
    const shake = Math.exp(-Math.max(0, t) / 0.18) * (t < 0.6 ? 1 : 0);
    typeText(H, t, HOLD, M.colle - 0.3, 0.02); show(H, t < M.colle + 0.2);
    at(H, 470 + noise(3, t * 30) * 10 * shake, 1 + bump(t, 0.02, 0.1) * 0.06);
    marker(t, mkH, 0.25, M.colle - 0.3); mkH.style.background = '#1A1310'; mkH.style.opacity = '0.08';
    // la carte Golf, puis glissée dans la zone de texte
    const drop = inOut(M.colle - 0.2, M.colle + 0.35, t), gone = smooth(M.colle + 0.2, M.colle + 0.4, t);
    place(golf, CX + noise(1, t * 0.5) * 6, lerp(820, 830, drop) + noise(2, t * 0.4) * 6, (1 + smooth(0, M.colle, t) * 0.05) * (1 - 0.7 * drop), 0, 1 - gone);
    marker(t, hlPrix, M.golf + 0.2, null); hlPrix.style.opacity = '0.85';
    const ai = spring(t - (M.colle - 0.25), 'default'), out = spring(t - (M.moins - 0.12), 'default');
    const ay = 820 + (1 - ai) * 1100 - out * 1400;
    place(area, CX, ay, 1, 0, E(ai)); area.style.zIndex = 0; golf.style.zIndex = 2;
    show(mask, t < M.colle + 0.4);
    const bi = spring(t - (M.colle + 0.25), 'default'); const by = ay + area._h / 2 + 30 + bar._h / 2 + (1 - bi) * 600;
    const click = Math.min(M.moins - 0.35, M.colle + 0.9); const press = bump(t, click - 0.03, 0.12);
    place(bar, CX, by, 1 - press * 0.04, 0, E(bi));
    const bx = CX - bar._w / 2 + (13 + 97) * bar._k, byy = by - bar._h / 2 + 36 * bar._k;
    if (inWin(t, M.colle - 0.2, M.moins)) { moveCursor(cur, t, [[M.colle - 0.2, CX + 120, 860], [M.colle + 0.4, bx, byy]], [M.colle - 0.1, click], M.colle - 0.2, M.moins); } else show(cur, false);
    // verdict : NO GO puis − 1 200 €
    const vi = spring(t - M.moins, 'snappy'), vq = spring(t - (M.deux - 0.42), 'default');
    const sh = Math.exp(-Math.max(0, t - M.moins) / 0.12);
    place(tk, CX + noise(7, t * 30) * 12 * sh, 1080 + (1 - vi) * 200 - vq * 1400, 1.2 - 0.2 * vi, 0, E(vi));
    show(MIN, t >= M.moins - 0.05); giant(MIN, t, M.moins + 0.05); at(MIN, 560 - vq * 1400, 1 + smooth(M.moins, M.deux, t) * 0.05);
    typeText(FR, t, M.frais, null, 0.025); show(FR, t >= M.frais - 0.05); at(FR, 740 - vq * 1400);
    // « En 2 secondes, tu sais. »
    show(D2, inWin(t, M.deux - 0.3, M.cta)); typeText(D2, t, M.deux - 0.25, M.cta - 0.3, 0.03, 36); at(D2, 820); marker(t, mkD2, M.deux + 0.4, M.cta - 0.3);
  };
} else if (V === '2') {
  // « 1 450 € sous la cote. Publiée il y a douze minutes. UTOPICAR surveille les annonces et te prévient avant tout le
  //   monde. Presque deux mille euros de marge. Commente GARAGE. »
  const N = T(S, [['1 450 €', 'gr']], 250); N.style.fontStretch = '112%';
  const SOUS = T(S, [['sous la ', 'lt'], ['cote.', 'bd k']], 96); const mkSous = addMark(SOUS);
  const LV = { x: 6, y: 372, w: 362, h: 98 };
  const live = lift(cardR(S, 'card-lv1', LV, 2.4, 22));
  const LV0 = U1.shots['card-lv1'], sous = U1.cote.sous;
  const hlS = hlOn(live, { x: sous.x - LV0.x, y: sous.y - LV0.y, w: sous.w, h: sous.h }, [5, 3]);
  const lvm = card(S, 'lvmini', 2.05, 10);
  const hlNew = hlOn(lvm, { x: 125, y: 148, w: 82, h: 38 }, [4, 3]);
  const PUB = T(S, [['Publiée il y a ', 'lt'], ['12 min.', 'bd k']], 92); const mkPub = addMark(PUB);
  const chip = lift(cardR(S, 'schip', { x: 4, y: 4, w: SRC.schip.w / 3 - 8, h: SRC.schip.h / 3 - 8 }, 3.3, 20));
  const SURV = T(S, [['Il surveille ', 'lt'], ['pour toi.', 'bd']], 92);
  const clio = card(S, 'dcard2', 2.25);
  const hlGo = hlOn(clio, { x: U2.dcard2Fig.x - 12, y: U2.dcard2Fig.y - 1, w: U2.dcard2Fig.w + 14, h: U2.dcard2Fig.h }, [4, 3]);
  const MARGE = T(S, [['+ 1 932 €', 'gr']], 200); MARGE.style.fontStretch = '112%';
  const DM = T(S, [['de ', 'lt'], ['marge.', 'bd']], 88);
  draw = (t) => {
    push(S, t, 0, M.cta);
    // accroche : le chiffre et la fiche sont là dès l'image 0
    const q1 = spring(t - (M.publiee - 0.3), 'default');
    giant(N, t, HOLD); at(N, 500 - q1 * 1400, 1 + smooth(0, M.publiee, t) * 0.05);
    typeText(SOUS, t, HOLD, null, 0.02); at(SOUS, 680 - q1 * 1400); marker(t, mkSous, 0.3, null);
    place(live, CX + noise(1, t * 0.5) * 6, 1050 - q1 * 1400, 1 + smooth(0, M.publiee, t) * 0.04, noise(2, t * 0.3) * 0.8, 1);
    marker(t, hlS, 0.5, null); hlS.style.opacity = '0.85';
    // « Publiée il y a 12 minutes » : la liste des nouvelles annonces
    const li = spring(t - (M.publiee - 0.25), 'default'), q2 = spring(t - (M.presque - 0.3), 'default');
    place(lvm, CX, 1010 + (1 - li) * 1200 - q2 * 1500, 1, 0, E(li));
    marker(t, hlNew, M.publiee + 0.4, null); hlNew.style.opacity = '0.85';
    show(PUB, inWin(t, M.publiee - 0.05, M.surveille)); typeText(PUB, t, M.publiee, M.surveille - 0.3, 0.025); at(PUB, 420); marker(t, mkPub, M.publiee + 0.5, M.surveille - 0.3);
    const ci = spring(t - M.surveille, 'default');
    place(chip, CX, 460 + (1 - ci) * -300 - q2 * 1500, 1 + bump(t, M.surveille + 0.5, 0.12) * 0.05, 0, E(ci) * (1 - q2));
    show(SURV, inWin(t, M.surveille + 0.1, M.presque)); typeText(SURV, t, M.surveille + 0.15, M.presque - 0.3, 0.025); at(SURV, 300);
    // la marge
    const gi = spring(t - (M.presque - 0.1), 'default');
    place(clio, CX, 1080 + (1 - gi) * 1100, (0.8 + 0.2 * gi) * (1 + bump(t, M.presque + 0.4, 0.16) * 0.04), (1 - gi) * -5, E(gi));
    marker(t, hlGo, M.presque + 0.35, null); hlGo.style.opacity = '0.85';
    show(MARGE, t >= M.presque - 0.05); giant(MARGE, t, M.presque); at(MARGE, 540, 1 + smooth(M.presque, M.cta, t) * 0.05);
    typeText(DM, t, M.presque + 0.3, null, 0.025); show(DM, t >= M.presque + 0.25); at(DM, 710);
    show(cur, false);
  };
} else {
  // « Ton stock, ton argent immobilisé, ta marge réalisée… tout, en un coup d'œil. Tu sais avant d'acheter. Tu revends
  //   avec de la marge. UTOPICAR. Commente GARAGE pour recevoir l'accès. »  (hook écrit : « Zéro tableur. »)
  const ZERO = T(S, [['Zéro ', 'bd'], ['tableur.', 'bd k']], 150); const mkZero = addMark(ZERO);
  const k1 = card(S, 'kpi1', 2.15, 8, 18), k2 = card(S, 'kpi2', 2.15, 8, 18), k3 = card(S, 'kpi3', 2.9, 8, 18);
  const COUP = T(S, [['Tout, ', 'lt'], ["d'un coup d'œil.", 'bd']], 88);
  const panels = [['best', 1.0, 720, 520], ['pipe', 1.0, 290, 1250], ['vrow1', 1.0, 290, 980]].map(([k, sc, x, y]) => { const c = k === 'vrow1' ? lift(cardR(S, k, { x: 2, y: 2, w: SRC[k].w / 3 - 4, h: SRC[k].h / 3 - 4 }, sc, 20)) : card(S, k, sc, 10); c._p = [x, y]; return c; });
  const kmini = [1, 2, 3, 4, 5, 6].map(i => card(S, 'kpi' + i, 1.05, 8, 18));
  const SAIS = T(S, [['Tu sais ', 'lt'], ["avant d'acheter.", 'bd']], 100);
  const REV = T(S, [['Tu revends ', 'lt'], ['avec de la marge.', 'bd k']], 100); const mkRev = addMark(REV);
  const clio = card(S, 'dcard2', 2.2);
  const hlGo = hlOn(clio, { x: U2.dcard2Fig.x - 12, y: U2.dcard2Fig.y - 1, w: U2.dcard2Fig.w + 14, h: U2.dcard2Fig.h }, [4, 3]);
  draw = (t) => {
    push(S, t, 0, M.cta);
    // accroche : « Zéro tableur. » + le vrai stock, dès l'image 0
    const q1 = spring(t - (M.coup - 0.25), 'default');
    typeText(ZERO, t, HOLD, null, 0.02); at(ZERO, 420 - q1 * 1400, 1 + bump(t, 0.02, 0.1) * 0.05); marker(t, mkZero, 0.2, null);
    const kw = k1._w;
    const p1 = spring(t + 1, 'default'), p2 = spring(t - M.argent, 'default'), p3 = spring(t - M.marge, 'default');
    place(k1, CX - kw / 2 - 12, 700 - q1 * 1400, 1 + bump(t, M.stock, 0.14) * 0.05, 0, E(p1));
    place(k2, CX + kw / 2 + 12 + (1 - p2) * 700, 700 - q1 * 1400, 1, 0, E(p2));
    place(k3, CX, 1110 + (1 - p3) * 900 - q1 * 1400, 1 + bump(t, M.marge + 0.3, 0.16) * 0.04, 0, E(p3));
    // « tout, en un coup d'œil » : le tableau de bord entier
    const q2 = spring(t - (M.sais - 0.25), 'default');
    const kmw = kmini[0]._w, kmh = kmini[0]._h;
    kmini.forEach((c, i) => {
      const col = i % 2, row = Math.floor(i / 2), p = spring(t - (M.coup + i * 0.06), 'default');
      place(c, 290 + (col ? 1 : -1) * (kmw / 2 + 6) + (1 - p) * -600, 440 + row * (kmh + 10) - q2 * 1500, 1, 0, E(p));
    });
    panels.forEach((c, i) => { const [x, y] = c._p; const p = spring(t - (M.coup + 0.15 + i * 0.12), 'default'); place(c, x + (1 - p) * 700, y - q2 * 1500, 1, 0, E(p)); });
    show(COUP, inWin(t, M.coup - 0.05, M.sais)); typeText(COUP, t, M.coup, M.sais - 0.3, 0.025); at(COUP, 1420 - q2 * 1500);
    // promesse + la bonne affaire
    const si = spring(t - M.sais, 'default');
    show(SAIS, t >= M.sais - 0.05); typeText(SAIS, t, M.sais, null, 0.025, 30); at(SAIS, 420);
    show(REV, t >= M.revends - 0.05); typeText(REV, t, M.revends, null, 0.025, 30); at(REV, 1330); marker(t, mkRev, M.revends + 0.5, null);
    place(clio, CX, 850 + (1 - si) * 1100, (0.85 + 0.15 * si) * (1 + bump(t, M.revends + 0.3, 0.16) * 0.04), (1 - si) * -5, E(si));
    marker(t, hlGo, M.revends + 0.4, null); hlGo.style.opacity = '0.85';
    show(cur, false);
  };
}

window.seek = function (t) {
  const endOn = t >= M.cta;
  show(bgD, endOn); show(bgW, !endOn); show(S, !endOn); show(en, endOn);
  demo.style.color = endOn ? '#6B7482' : '#8C95A3';
  if (!endOn) draw(t); else show(cur, false);
  if (endOn) {
    const p = spring(t - (M.cta - 0.2), 'heavy'), pu = smooth(M.cta, M.end, t);
    const click = M.cta + 0.9, press = bump(t, click - 0.03, 0.11), beat = bump(t, M.end - 0.7, 0.16);
    en.style.transformOrigin = '500px 850px'; en.style.transform = `translateY(${(-pu * 24).toFixed(1)}px) scale(${(1 + pu * 0.035).toFixed(4)})`;
    place(pill, CX, 660, 0.85 * (0.55 + 0.45 * p), 0, clamp(p * 2, 0, 1));
    typeText(CTA, t, M.cta - 0.12, null, 0.03, 30); at(CTA, 900); marker(t, ctaBg, M.cta + 0.3, null);
    const gar = CTA.querySelector('.g'); gar.style.display = 'inline-block';
    gar.style.transform = `scale(${(1 - press * 0.08 + spring(t - click, 'snappy') * 0.05 - spring(t - (click + 0.4), 'default') * 0.05 + beat * 0.07).toFixed(4)})`;
    typeText(CTA2, t, M.cta + 0.5, null, 0.025); at(CTA2, 1030);
    moveCursor(curD, t, [[M.cta + 0.3, 1000, 1700], [M.cta + 0.35, 760, 930], [click + 0.4, 850, 1080], [M.end - 1.0, 780, 935]], [click, M.end - 0.7], M.cta + 0.3, 1e9);
  } else show(curD, false);
};

await document.fonts.ready;
await document.fonts.load("800 76px 'Archivo'"); await document.fonts.load("400 76px 'Archivo'"); await document.fonts.load("600 27px 'Archivo'");
for (const [b, s] of FITS) fitW(b, s);
// recentrage : le film était composé autour de x = 500 (centre de la zone sûre) et paraissait décalé à gauche sur un
// téléphone. Tout le contenu (hors fonds plein écran) passe sur l'axe de l'écran x = 540, colonne 140 → 940 (× 0,909).
const view = el('div', 'layer', stage); view.style.overflow = 'visible';
view.style.transformOrigin = '500px 850px'; view.style.transform = 'translate(40px,0px) scale(0.9091)';
for (const c of [...stage.children]) if (c !== view && !c.classList.contains('grid')) { view.appendChild(c); if (c.classList.contains('layer')) c.style.overflow = 'visible'; }
window.seek(0);
window.filmReady = true;
