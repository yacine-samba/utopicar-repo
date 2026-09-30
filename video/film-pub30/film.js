// UTOPICAR — pub TikTok 28 s « Ah ouais », sans voix, 1080x1920, 30 i/s, 120 BPM (mesure = 2 s).
// Une démo réelle racontée par l'écran : la « bonne affaire » est collée dans UTOPICAR, le verdict tombe en moins de
// 2 s (NO GO, − 1 200 €), la musique s'arrête net ; puis la vraie affaire sous la cote (GO, + 1 932 €) : « Ah ouais. »
// Deux ouvertures (?hook=A « le test », ?hook=B « le défi »), même corps à partir de 3,5 s.
// Mise en page dans la zone sûre TikTok : x 60 → 940 (centre 500), y 220 → 1480.
// Corrige les défauts de la v5 : image 0 pleine, textes mesurés, coupes nettes, sorties en mouvement, démo pas à pas,
// mention « Données de démonstration », CTA avant la fin, carton final ≤ 3 s. Contrat : window.seek(t) peint la frame t.
const { spring, clamp, lerp, noise } = Motion;
const { el, show, smooth, inOut, bump, place, crop, text, typeText, marker, cursor, moveCursor } = Kit;
const TL = await (await fetch('../timeline-pub30.json')).json();
const U1 = await (await fetch('../assets/ui/layout.json')).json();
const U2 = await (await fetch('../assets/ui2/layout.json')).json();
const M = TL.marks;
const HOOK = (new URLSearchParams(location.search).get('hook') || 'A').toUpperCase();
const stage = document.getElementById('stage');
const LOGO = (await (await fetch('../assets/brand/logo.svg')).text()).replace(/<!--.*?-->/s, '');
const CX = 500;                                   // centre horizontal de la zone sûre
const inWin = (t, a, b) => t >= a && t < b;

/* ================= captures ================= */
const SRC = {};
async function load(key, url) { const i = new Image(); i.src = url; await i.decode(); SRC[key] = { url, w: i.naturalWidth, h: i.naturalHeight }; }
for (const k of ['dcard1', 'dcard2', 'ticket', 'plaf', 'tktop']) await load(k, `../assets/ui2/${k}.png`);
for (const k of ['scan', 'launch', 'card-lv1', 'lg3', 'lg4', 'lg5', 'lg6']) await load(k, `../assets/ui/${k}.png`);
// morceau d'une capture dans une carte blanche arrondie (r en px CSS de la capture)
function cardR(parent, key, r, k, rad = 22, cls = 'abs') {
  const s = SRC[key]; const e = el('div', cls, parent);
  Object.assign(e.style, { borderRadius: rad * k + 'px', overflow: 'hidden', width: r.w * k + 'px', height: r.h * k + 'px', background: '#FFFFFF' });
  const c = crop(e, s.url, s.w, s.h, r, k); c.style.position = 'absolute'; e._k = k; e._r = r; e._w = r.w * k; e._h = r.h * k;
  return e;
}
const SHADOW = '0 4px 12px rgba(12,15,20,.06),0 60px 120px -48px rgba(12,15,20,.32)';
const lift = (e) => { e.style.boxShadow = SHADOW; return e; };
// marge intérieure autour d'une ligne du rapport capturée bord à bord
function padR(e, px = 22, py = 12) { const c = e.firstChild; c.style.left = px + 'px'; c.style.top = py + 'px'; e._w += 2 * px; e._h += 2 * py; e.style.width = e._w + 'px'; e.style.height = e._h + 'px'; return e; }
// position d'un point (px CSS de la capture) une fois la carte posée en (x, y) à l'échelle s
const pt = (e, x, y, px, py, s = 1) => [x + ((px - e._r.x) * e._k - e._w / 2) * s, y + ((py - e._r.y) * e._k - e._h / 2) * s];
function hlOn(card, r, pad = [6, 4]) {                // surligneur réel (multiply) sur une zone de la capture
  const h = el('div', 'hl', card); const k = card._k;
  Object.assign(h.style, { left: (r.x - card._r.x - pad[0]) * k + 'px', top: (r.y - card._r.y - pad[1]) * k + 'px', width: (r.w + 2 * pad[0]) * k + 'px', height: (r.h + 2 * pad[1]) * k + 'px' });
  return h;
}
// texte posé par son centre vertical (largeur mesurée dans sa boîte de 880 px : réduit s'il dépasse)
// (mesure l'étendue réelle des mots affichés, espaces compris, transformations neutralisées)
function fitW(box, base, max = 830) {
  const tf = box.style.transform; box.style.transform = 'none'; box.style.fontSize = base + 'px';
  const w = Math.max(...[...box.querySelectorAll('.ln')].map(l => { const r = [...l.querySelectorAll('.ch')].map(c => c.getBoundingClientRect()).filter(r => r.width > 0); return r.length ? Math.max(...r.map(x => x.right)) - Math.min(...r.map(x => x.left)) : 0; }));
  if (w > max) box.style.fontSize = (base * max / w).toFixed(1) + 'px'; box.style.transform = tf;
}
const at = (box, y, s = 1, dx = 0) => { box.style.transform = `translate(${dx.toFixed(1)}px,${(y - box.offsetHeight / 2).toFixed(1)}px) scale(${s.toFixed(4)})`; };
const T = (parent, segs, size) => { const b = text(parent, segs); fitW(b, size); return b; };
const addMark = (box, sel = '.k') => el('div', 'mk', box.querySelector(sel));

/* ================= fonds ================= */
const bgW = el('div', 'layer grid', stage);
const bgD = el('div', 'layer grid dark', stage);
const bgY = el('div', 'layer grid yel', stage);

/* ================= 0 → 3,5 : ouverture ================= */
const hk = el('div', 'layer', stage);
const golf = lift(cardR(hk, 'dcard1', { x: 8, y: 8, w: 362, h: 110 }, 2.35));
const hlPrix = hlOn(golf, { x: 211, y: 97, w: 44, h: 16 }, [5, 3]);
// A : le test
const A1 = T(hk, [['9 500 €.', 'bd']], 190);
const A2 = T(hk, [['Bonne affaire ?', 'bd']], 104);
const A3 = T(hk, [['On ', 'bd'], ['vérifie ?', 'bd k']], 104); const mkA3 = addMark(A3);
// B : le défi
const B1 = T(hk, [['Bonne affaire', 'lt'], ['\n', ''], ['ou pas ?', 'bd']], 124);
const B2 = T(hk, [['UTOPICAR, lui, ', 'lt'], ['sait.', 'bd k']], 104); const mkB2 = addMark(B2);
const ring = el('div', 'ring', hk);
ring.innerHTML = '<svg width="190" height="190" viewBox="0 0 190 190"><circle cx="95" cy="95" r="80" fill="#FFFFFF" stroke="#E6E9EE" stroke-width="16"/><circle class="arc" cx="95" cy="95" r="80" fill="none" stroke="#FF5A1F" stroke-width="16" stroke-linecap="round" transform="rotate(-90 95 95)" stroke-dasharray="502.65" stroke-dashoffset="0"/></svg><div class="dg">2</div>';
const arc = ring.querySelector('.arc'), dg = ring.querySelector('.dg');
ring.style.filter = 'drop-shadow(0 20px 30px rgba(12,15,20,.16))';

/* ================= 2,4 → 5 : UTOPICAR, coller, analyser ================= */
const sc = el('div', 'layer', stage);
const TA = { x: 30, y: 952, w: 345, h: 212 };               // « Texte de l'annonce » + zone de texte (page Analyser)
const area = lift(cardR(sc, 'scan', TA, 2.45, 20));
const mask = el('div', 'mask', area);
Object.assign(mask.style, { left: (38.6 - TA.x) * 2.45 + 'px', top: (986.6 - TA.y) * 2.45 + 'px', width: (368 - 38.6) * 2.45 + 'px', height: (1146 - 986.6) * 2.45 + 'px' });
const caret = el('div', 'caret', area); Object.assign(caret.style, { left: (47 - TA.x) * 2.45 + 'px', top: (996 - TA.y) * 2.45 + 'px', height: 48 + 'px' });
const LA = { x: 0, y: 0, w: 379, h: 72 };
const bar = cardR(sc, 'launch', LA, 2.2, 18); bar.style.background = 'transparent';
const cnt = el('div', 'cnt', sc);

/* ================= 5 → 6 : verdict ================= */
const vd = el('div', 'layer', stage);
const tk = lift(cardR(vd, 'ticket', { x: 10, y: 10, w: 320, h: 84 }, 2.65, 20));
const AH = T(vd, [['Ah.', 'lt']], 150);
const NON = T(vd, [['Non.', 'bd']], 190);

/* ================= 6 → 10 : − 1 200 € et les frais ================= */
const mn = el('div', 'layer', stage);
const MIN = T(mn, [['− 1 200 €', 'rd']], 210); MIN.style.fontStretch = '112%'; fitW(MIN, 210);
const FR = T(mn, [['frais compris.', 'lt onDark']], 80);
const costs = ['lg3', 'lg4', 'lg5', 'lg6'].map(k => { const s = SRC[k]; return padR(cardR(mn, k, { x: 0, y: 0, w: s.w / 3, h: s.h / 3 }, 2.45, 10)); });

/* ================= 10 → 12 : UTOPICAR ================= */
const br = el('div', 'layer', stage);
const pill = el('div', 'pill', br); pill.innerHTML = `${LOGO}<span class="wm">${U1.logo.text}</span>`;
const C1 = T(br, [["Colle l'annonce.", 'lt']], 92);
const C2 = T(br, [['2 secondes.', 'bd k']], 170); const mkC2 = addMark(C2);

/* ================= 12 → 14,7 : les frais, ta marge, ton prix max ================= */
const tr = el('div', 'layer', stage);
const R1 = T(tr, [['Les frais.', 'bd']], 100);
const R2 = T(tr, [['Ta vraie marge.', 'bd']], 100);
const R3 = T(tr, [['Ton prix max.', 'bd']], 100);
const t1 = lift(padR(cardR(tr, 'lg4', { x: 0, y: 0, w: SRC.lg4.w / 3, h: SRC.lg4.h / 3 }, 2.0, 10), 20, 10));
const t2 = lift(cardR(tr, 'dcard2', { x: 8, y: 146, w: 362, h: 42 }, 2.15, 12));
const t3 = lift(cardR(tr, 'plaf', { x: 8, y: 8, w: 320, h: 70 }, 2.2, 14));

/* ================= chiffres géants ================= */
function stat(num, cls, pre, key, bg) {
  const g = el('div', 'layer'); stage.appendChild(g);
  const tiles = bg.map(([k, r, x, y, s, rot]) => { const e = lift(cardR(g, k, r, 1.9, 14)); e._p = [x, y, s, rot]; return e; });
  const n = T(g, [[num, cls]], 250); n.style.fontStretch = '112%'; fitW(n, 250);
  const sub = T(g, [[pre, 'lt'], [key, 'bd k']], 84); const mk = addMark(sub);
  return { g, tiles, n, sub, mk };
}
const S1 = stat('7 500 €', 'bd', 'à ne pas ', 'dépasser', [['plaf', { x: 8, y: 8, w: 320, h: 130 }, 190, 470, 0.8, -6], ['ticket', { x: 10, y: 432, w: 320, h: 88 }, 830, 1330, 0.85, 5], ['dcard1', { x: 8, y: 8, w: 362, h: 110 }, 820, 360, 0.7, 4]]);
const S2 = stat('1 450 €', 'gr', 'sous la ', 'cote', [['card-lv1', { x: 6, y: 6, w: 362, h: 150 }, 200, 420, 0.8, -5], ['card-lv1', { x: 120, y: 370, w: 250, h: 110 }, 830, 1320, 0.9, 4], ['dcard2', { x: 8, y: 8, w: 362, h: 110 }, 820, 380, 0.65, 6]]);
function drawStat(s, t, t0, t1) {
  const on = inWin(t, t0, t1); show(s.g, on); if (!on) return;
  const out = t1 - 0.3;
  s.tiles.forEach((e, i) => {
    const [x, y, sc0, rot] = e._p; const p = spring(t - (t0 + i * 0.06), 'default'), q = spring(t - out, 'snappy');
    place(e, x + (x - CX) * (1 - p) * -0.5 + (t - t0) * (x < CX ? -16 : 16), y + (y - 850) * (1 - p) * -0.5 - (t - t0) * 12 - q * 300, sc0 * (0.75 + 0.25 * p), rot, (p - q) * 0.85, 6);
  });
  s.n.chars.forEach((c, i) => {
    const p = spring(t - (t0 + 0.04 + i * 0.04), 'heavy'), q = spring(t - (out + i * 0.02), 'snappy');
    c.style.opacity = clamp(p * 1.8 - q * 1.5, 0, 1).toFixed(3); c.style.transform = `translateY(${((1 - p) * 120 - q * 110).toFixed(2)}px)`;
  });
  at(s.n, 760, 1 + smooth(t0, t1, t) * 0.04);
  typeText(s.sub, t, t0 + 0.3, out, 0.025); at(s.sub, 950);
  marker(t, s.mk, t0 + 0.75, out);
}

/* ================= 16,3 → 18 : « Et celle-là ? » ================= */
const nx = el('div', 'layer', stage);
const LV = { x: 6, y: 6, w: 362, h: 462 };
const live = lift(el('div', 'abs', nx)); const LVK = 2.2, LVH = 300;
Object.assign(live.style, { width: LV.w * LVK + 'px', height: LVH * LVK + 'px', borderRadius: 22 * LVK + 'px', overflow: 'hidden', background: '#FFFFFF' });
const liveIn = cardR(live, 'card-lv1', LV, LVK, 0); liveIn.style.position = 'absolute'; liveIn.style.left = '0px';
live._k = LVK; live._r = { x: LV.x, y: LV.y }; live._w = LV.w * LVK; live._h = LVH * LVK;
const LV0 = U1.shots['card-lv1'];
const sous = U1.cote.sous;
const hlS = hlOn(liveIn, { x: sous.x - LV0.x, y: sous.y - LV0.y, w: sous.w, h: sous.h }, [5, 3]);
const N1 = T(nx, [['Et celle-là ?', 'bd']], 110);

/* ================= 20 → 22 : GO, « Ah ouais. » ================= */
const gw = el('div', 'layer', stage);
const clio = lift(cardR(gw, 'dcard2', { x: 8, y: 8, w: 362, h: 215 }, 2.25, 22));
const hlGo = hlOn(clio, { x: U2.dcard2Fig.x - 12, y: U2.dcard2Fig.y - 1, w: U2.dcard2Fig.w + 14, h: U2.dcard2Fig.h }, [4, 3]);
const OU = T(gw, [['Ah ', 'lt'], ['ouais.', 'bd k']], 170); const mkOU = addMark(OU);

/* ================= 22 → 25 : « Tu sais avant d'acheter. Pas après. » ================= */
const tg = el('div', 'layer yel', stage); tg.style.background = 'transparent';
const G1 = T(tg, [['Tu sais', 'lt'], ['\n', ''], ["avant d'acheter.", 'bd']], 116);
const G2 = T(tg, [['Pas après.', 'bdw']], 150);

/* ================= 25 → 28 : fin ================= */
const en = el('div', 'layer', stage);
const pill2 = el('div', 'pill', en); pill2.innerHTML = `${LOGO}<span class="wm">${U1.logo.text}</span>`;
const CTA = T(en, [['Commente ', 'bdw'], ['GARAGE', 'bd g']], 92);
CTA.querySelector('.g').classList.add('ctaw'); const ctaBg = el('div', 'ctabg', CTA.querySelector('.g'));
const CTA2 = T(en, [["pour l'essayer.", 'lt onDark']], 62);

/* ================= mention + curseurs ================= */
const demo = el('div', 'demo', stage); demo.textContent = 'Données de démonstration';
const cur = cursor(stage, false);
const curD = cursor(stage, true);

// lettres visibles dès l'image 0 : entrée à t < 0
const HOLD = -3;

window.seek = function (t) {
  const dark = inWin(t, M.minus, M.brand) || t >= M.end;
  const yel = inWin(t, M.tag, M.end);
  show(bgD, dark); show(bgY, yel); show(bgW, !dark && !yel);
  demo.style.color = dark ? '#6B7482' : yel ? '#8A3A14' : '#8C95A3';
  let curOn = false, curDOn = false;

  /* ---------- ouverture ---------- */
  const hkOn = t < M.paste; show(hk, hkOn);
  const g0 = HOOK === 'A' ? M.grab : M.grabB;       // prise de la carte par le curseur
  if (hkOn) {
    const push = smooth(0, 3.5, t) * 2;
    // carte Golf : déjà en place à l'image 0, flotte, puis glissée dans la zone de texte
    const drag = inOut(g0 + 0.1, M.paste - 0.12, t), sq = smooth(M.paste - 0.4, M.paste - 0.05, t);
    const gx = lerp(CX, CX, drag), gy = lerp(HOOK === 'A' ? 930 : 860, 1000, drag);
    place(golf, gx + noise(1, t * 0.5) * 6, gy + noise(2, t * 0.4) * 6 - push * 20, (1 + push * 0.03) * (1 - bump(t, g0 - 0.02, 0.1) * 0.03) * (1 - 0.72 * sq), noise(3, t * 0.3) * 0.8 - drag * 2, 1 - smooth(M.paste - 0.15, M.paste - 0.02, t));
    golf.style.zIndex = 3;
    if (HOOK === 'A') {
      show(B1, false); show(B2, false); show(ring, false);
      marker(t, hlPrix, 0.45, null); hlPrix.style.opacity = '0.8';
      // « 9 500 €. » + « Bonne affaire ? » lisibles dès l'image 0 ; « On vérifie ? » remplace la question
      typeText(A1, t, HOLD, M.paste - 0.35, 0.02); at(A1, 420 - push * 10, 1 + push * 0.03);
      const qOut = 1.35; typeText(A2, t, HOLD, qOut, 0.02); show(A2, t < qOut + 0.4); at(A2, 610);
      show(A3, t >= 1.5); typeText(A3, t, 1.55, M.paste - 0.35, 0.03); at(A3, 610); marker(t, mkA3, 2.0, M.paste - 0.35);
    } else {
      show(A1, false); show(A2, false); show(A3, false);
      marker(t, hlPrix, 0.3, null); hlPrix.style.opacity = '0.8';
      typeText(B1, t, HOLD, 2.45, 0.02); show(B1, t < 2.9); at(B1, 480, 1 + push * 0.03);
      show(B2, t >= 2.6); typeText(B2, t, 2.65, M.paste - 0.3, 0.025); at(B2, 480); marker(t, mkB2, 3.0, M.paste - 0.3);
      // compte à rebours : 2 s, anneau qui se vide, chiffre qui change sur les tics
      const rin = spring(t + 1, 'default'), rout = spring(t - 2.62, 'snappy');
      const p = clamp((t - 0.6) / 2.0, 0, 1);
      arc.setAttribute('stroke-dashoffset', (502.65 * p).toFixed(1));
      dg.textContent = t < 1.6 ? '2' : t < 2.6 ? '1' : '0';
      const tickB = Math.max(bump(t, 0.6, 0.08), bump(t, 1.1, 0.08), bump(t, 1.6, 0.08), bump(t, 2.1, 0.08));
      place(ring, CX, 1270 + rout * 120, (0.8 + 0.2 * rin) * (1 + tickB * 0.06) * (1 - rout * 0.4), 0, 1 - rout);
    }
    // curseur : vient prendre la carte, la glisse dans UTOPICAR
    const tIn = g0 - 0.55;
    const [px, py] = [CX + 90, (HOOK === 'A' ? 930 : 860) + 20];
    moveCursor(cur, t, [[tIn, 1000, 1700], [tIn + 0.05, px, py], [g0 + 0.1, px, 1010]], [g0, M.paste - 0.05], tIn, M.paste);
    curOn = t >= tIn;
  }

  /* ---------- UTOPICAR : coller puis analyser ---------- */
  const scOn = inWin(t, (HOOK === 'A' ? M.scan : 3.0), M.verdict); show(sc, scOn);
  if (scOn) {
    const t0 = HOOK === 'A' ? M.scan : 3.0;
    const ai = spring(t - t0, 'default'), up = spring(t - (M.paste + 0.05), 'default'), work = smooth(M.go + 0.4, M.verdict, t);
    const ay = 1000 + (1 - ai) * 900 - up * 150;
    place(area, CX, ay, (1 + smooth(t0, M.verdict, t) * 0.03) * (1 - work * 0.04), 0, 1, work * 3);
    // coller : le texte apparaît d'un coup (Ctrl+V) ; avant, zone vide avec curseur texte
    const pasted = t >= M.paste; show(mask, !pasted); show(caret, !pasted);
    caret.style.opacity = (Math.floor(t * 2.5) % 2 ? 0.15 : 1).toString();
    area.style.boxShadow = pasted ? `0 0 0 ${(8 * (1 - spring(t - M.paste, 'snappy'))).toFixed(1)}px rgba(255,90,31,.35),${SHADOW}` : SHADOW;
    // barre « Analyser le dossier » qui monte après le collage
    const bi = spring(t - (M.paste + 0.1), 'default');
    const by = ay + area._h / 2 + 30 + bar._h / 2 + (1 - bi) * 500;
    const press = bump(t, M.go - 0.03, 0.12);
    place(bar, CX, by, (1 - press * 0.04) * (1 - work * 0.04), 0, bi, work * 3);
    // chrono : la réponse arrive en moins de 2 s
    const ci = spring(t - (M.go + 0.05), 'snappy');
    const v = clamp((t - M.go) / (M.verdict - M.go - 0.08), 0, 1) * 1.8;
    cnt.innerHTML = `${v.toFixed(1).replace('.', ',')}<small>s</small>`;
    place(cnt, CX, 390 - (1 - ci) * 60, 0.8 + 0.2 * ci, 0, ci);
    const gx = CX - bar._w / 2 + (13 + 97) * bar._k, gy = by - bar._h / 2 + (12 + 25) * bar._k;
    if (t >= M.paste) { moveCursor(cur, t, [[M.paste, CX + 60, ay - area._h / 2 + 330], [M.paste + 0.15, gx, gy]], [M.go], M.paste, M.go + 0.35); curOn = t < M.go + 0.35; }
  }

  /* ---------- verdict : NO GO, la musique s'arrête ---------- */
  const vdOn = inWin(t, M.verdict, M.minus); show(vd, vdOn);
  if (vdOn) {
    const p = spring(t - M.verdict, 'snappy'), shake = Math.exp(-(t - M.verdict) / 0.12);
    place(tk, CX + noise(7, t * 30) * 14 * shake, 900 + noise(8, t * 30) * 10 * shake, 1.25 - 0.25 * p, 0, clamp(p * 3, 0, 1));
    typeText(AH, t, M.ah, null, 0.04, 30); at(AH, 440);
    typeText(NON, t, M.non, null, 0.04, 40); at(NON, 620, 1 + smooth(M.non, M.minus, t) * 0.04);
  }

  /* ---------- − 1 200 € ---------- */
  const mnOn = inWin(t, M.minus, M.brand); show(mn, mnOn);
  if (mnOn) {
    const out = M.brand - 0.35, q = spring(t - out, 'default');
    MIN.chars.forEach((c, i) => {
      const p = spring(t - (M.minus + i * 0.035), 'heavy');
      c.style.opacity = clamp(p * 1.8, 0, 1).toFixed(3); c.style.transform = `translateY(${((1 - p) * 130).toFixed(2)}px)`;
    });
    at(MIN, 480 - q * 700, 1 + smooth(M.minus, M.brand, t) * 0.05);
    typeText(FR, t, M.minus + 0.3, null, 0.025); at(FR, 650 - q * 700);
    let y = 770;
    costs.forEach((e, i) => {
      const t0 = M.costs + i * 0.5, p = spring(t - t0, 'default');
      const h = e._h; const cy = y + h / 2; y += h + 12;
      place(e, CX + (1 - p) * 700, cy - q * 700 - smooth(M.costs, M.brand, t) * 30, 1, (1 - p) * 8, p);
    });
  }

  /* ---------- UTOPICAR ---------- */
  const brOn = inWin(t, M.brand, M.f1); show(br, brOn);
  if (brOn) {
    const p = spring(t - M.brand, 'heavy'), q = spring(t - (M.f1 - 0.3), 'default');
    place(pill, CX, 640 - q * 800, 0.85 * (0.55 + 0.45 * p) * (1 + smooth(M.brand, M.f1, t) * 0.04), 0, clamp(p * 2, 0, 1));
    typeText(C1, t, M.colle, null, 0.025); at(C1, 880 - q * 800);
    typeText(C2, t, M.deux, null, 0.035, 36); at(C2, 1050 - q * 800); marker(t, mkC2, M.deux + 0.45, null);
  }

  /* ---------- les frais, ta marge, ton prix max ---------- */
  const trOn = inWin(t, M.f1, M.max); show(tr, trOn);
  if (trOn) {
    const q = spring(t - (M.max - 0.3), 'default'), up = q * 900;
    const rows = [[R1, t1, M.f1, 380, 520], [R2, t2, M.f2, 700, 830], [R3, t3, M.f3, 1020, 1170]];
    rows.forEach(([b, tile, t0, yT, yC], i) => {
      typeText(b, t, t0, null, 0.025, 30); at(b, yT - up);
      const next = i < 2 ? rows[i + 1][2] : 1e9; const dim = spring(t - next, 'default');
      b.querySelectorAll('.bd').forEach(w => w.style.color = `rgb(${lerp(12, 154, dim) | 0},${lerp(15, 161, dim) | 0},${lerp(20, 173, dim) | 0})`);
      const p = spring(t - (t0 + 0.3), 'default');
      place(tile, CX + (i % 2 ? -1 : 1) * (1 - p) * 700, yC - up, 1, (1 - p) * (i % 2 ? -6 : 6), p);
    });
  }
  drawStat(S1, t, M.max, M.next);

  /* ---------- « Et celle-là ? » ---------- */
  const nxOn = inWin(t, M.next, M.cote); show(nx, nxOn);
  if (nxOn) {
    const p = spring(t - M.next, 'default'), q = spring(t - (M.cote - 0.3), 'default');
    const push = smooth(M.next, M.cote, t);
    const x = CX + (1 - p) * 900, y = 920 - q * 900, s = 1 + push * 0.04;
    place(live, x, y, s, (1 - p) * 10, 1);
    const scroll = inOut(M.next + 0.45, M.hlSous - 0.1, t) * (LV.h - LVH) * LVK; liveIn.style.top = (-scroll).toFixed(1) + 'px';
    typeText(N1, t, M.next + 0.15, null, 0.03); at(N1, 400 - q * 900);
    marker(t, hlS, M.hlSous, null); hlS.style.opacity = '0.85';
    const [sx, sy0] = pt(live, x, y, sous.x - LV0.x + sous.w * 0.85, sous.y - LV0.y + 14, s); const sy = sy0 - (LV.h - LVH) * LVK * s;
    moveCursor(cur, t, [[M.next + 0.4, 1000, 1700], [M.next + 0.45, sx, sy]], [M.hlSous], M.next + 0.4, M.cote - 0.3);
    curOn = curOn || inWin(t, M.next + 0.4, M.cote - 0.3);
  }
  drawStat(S2, t, M.cote, M.go2);

  /* ---------- GO + « Ah ouais. » ---------- */
  const gwOn = inWin(t, M.go2, M.tag); show(gw, gwOn);
  if (gwOn) {
    const p = spring(t - M.go2, 'default'), joy = bump(t, M.go2 + 0.35, 0.18), q = spring(t - (M.tag - 0.3), 'default');
    place(clio, CX, 930 - q * 900, (0.7 + 0.3 * p) * (1 + joy * 0.04) * (1 + smooth(M.go2, M.tag, t) * 0.04), (1 - p) * -6, clamp(p * 2, 0, 1));
    marker(t, hlGo, M.go2 + 0.4, null); hlGo.style.opacity = '0.8';
    typeText(OU, t, M.ouais, null, 0.045, 40); at(OU, 460 - q * 900); marker(t, mkOU, M.ouais + 0.5, null);
  }

  /* ---------- « Tu sais avant d'acheter. Pas après. » ---------- */
  const tgOn = inWin(t, M.tag, M.end); show(tg, tgOn);
  if (tgOn) {
    const push = smooth(M.tag, M.end, t), q = spring(t - (M.end - 0.3), 'default');
    typeText(G1, t, M.tag - 0.3, null, 0.025, 36); at(G1, 760 - q * 900 - push * 50, 1 + push * 0.1);
    typeText(G2, t, M.pas, null, 0.04, 46); at(G2, 1010 - q * 900 - push * 30, 1 + push * 0.1);
  }

  /* ---------- fin ---------- */
  const enOn = t >= M.end; show(en, enOn);
  if (enOn) {
    const p = spring(t - M.end, 'heavy'), push = smooth(M.end, M.fin, t), press = bump(t, M.click - 0.03, 0.11);
    en.style.transformOrigin = '500px 850px'; en.style.transform = `scale(${(1 + push * 0.035).toFixed(4)})`;
    place(pill2, CX, 660 - push * 16, 0.85 * (0.55 + 0.45 * p) * (1 + bump(t, M.fin - 1.0, 0.16) * 0.05), 0, clamp(p * 2, 0, 1));
    typeText(CTA, t, M.cta, null, 0.03, 30); at(CTA, 900); marker(t, ctaBg, M.cta + 0.25, null);
    const gar = CTA.querySelector('.g'); gar.style.display = 'inline-block';
    gar.style.transform = `scale(${(1 - press * 0.08 + spring(t - M.click, 'snappy') * 0.05 - spring(t - (M.click + 0.4), 'default') * 0.05 + bump(t, M.fin - 1.0, 0.16) * 0.06).toFixed(4)})`;
    typeText(CTA2, t, M.cta + 0.6, null, 0.025); at(CTA2, 1030);
    moveCursor(curD, t, [[M.end + 0.4, 1000, 1700], [M.end + 0.45, 760, 930], [M.click + 0.35, 850, 1080], [M.fin - 1.15, 770, 935]], [M.click, M.fin - 1.0], M.end + 0.4, M.fin + 1);
    curDOn = t >= M.end + 0.4;
  }
  if (!curOn) show(cur, false);
  if (!curDOn) show(curD, false);
};

await document.fonts.ready;
await document.fonts.load("800 76px 'Archivo'"); await document.fonts.load("400 76px 'Archivo'"); await document.fonts.load("600 27px 'Archivo'");
// re-mesure après chargement des polices
for (const [b, s] of [[A1, 190], [A2, 104], [A3, 104], [B1, 124], [B2, 104], [AH, 150], [NON, 190], [MIN, 210], [FR, 80], [C1, 92], [C2, 170], [R1, 100], [R2, 100], [R3, 100], [N1, 110], [OU, 170], [G1, 116], [G2, 150], [CTA, 92], [CTA2, 62], [S1.n, 250], [S1.sub, 84], [S2.n, 250], [S2.sub, 84]]) fitW(b, s);
window.seek(0);
window.filmReady = true;
