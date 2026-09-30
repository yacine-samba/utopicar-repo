// utopicar — MO1 v2 : la grammaire de la référence 1 (fond marine, typo lettre à lettre, fleur, goutte orange), plus
// vivante : chaque phrase de Simon a son élément graphique animé (compteurs, jauge, tampon, barres, courbe, radar,
// notification, tableur qui s'effondre, courbe de marge), un curseur qui agit vraiment (trajets courbes, clics avec
// onde), une caméra qui respire (poussées, secousses sur les chocs) et le logo officiel (pack utopicar-logo).
// Repères = mots de Simon (timeline-mo1b.json, prise v3 A). ?hook=voix | sansvoix. Contrat : window.seek(t) peint t.
import { loadUI, makeUI } from '../film-mo/ui.js';
const { spring, clamp, lerp, noise } = Motion;
const { el, show, smooth, inOut, bump, place, crop, text, marker, cursor, moveCursor } = Kit;
const TL = await (await fetch('../timeline-mo1b.json')).json();
const M = TL.marks;
const VOICE = (new URLSearchParams(location.search).get('hook') || 'voix') !== 'sansvoix';
const stage = document.getElementById('stage');
const CX = 540, CY = 900;
const inWin = (t, a, b) => t >= a && t < b;
await loadUI();
const NS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const svgBox = (parent, w, h) => { const s = sv('svg', { class: 'g', width: w, height: h, viewBox: `0 0 ${w} ${h}` }); parent.appendChild(s); s._w = w; s._h = h; return s; };
// temps d'un mot de Simon (premier mot qui commence par `key` après `after`)
const norm = s => s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
const Wd = (key, after = 0) => { const k = norm(key); const w = TL.words.find(w => w[1] >= after && norm(w[0]).startsWith(k)); return w ? w[1] : after; };
const fmt = v => (v < 0 ? '− ' : v > 0 ? '+ ' : '') + Math.abs(Math.round(v)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
const fmtN = v => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/* ================= fond, caméra ================= */
const bgL = el('div', 'layer', stage);
const halos = [[260, 420, 700, '#0E2E48'], [820, 1300, 800, '#0B2740'], [540, 1800, 900, '#0A2238']].map(([x, y, s, c]) => {
  const h = el('div', 'abs', bgL); Object.assign(h.style, { width: s + 'px', height: s + 'px', borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, transparent 70%)` }); h._p = [x, y]; return h;
});
const cam = el('div', '', stage); cam.id = 'cam';
const FLOWER = (fill) => `<svg viewBox="-100 -100 200 200"><path fill="${fill}" d="${(() => { let d = ''; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, b = (i + 0.5) / 8 * Math.PI * 2, c2 = (i + 1) / 8 * Math.PI * 2; const p = (r, t) => `${(Math.cos(t) * r).toFixed(1)} ${(Math.sin(t) * r).toFixed(1)}`; d += (i ? ' ' : 'M ' + p(58, a)) + ` Q ${p(118, a + 0.18)} ${p(96, b)} Q ${p(118, c2 - 0.18)} ${p(58, c2)}`; } return d + ' Z'; })()}"/></svg>`;
const blobL = el('div', 'layer', cam);
const blob = el('div', 'flower', blobL); blob.innerHTML = FLOWER('#12314A');
const uiL = el('div', 'layer', cam);
const gL = el('div', 'layer', cam);
const txtL = el('div', 'layer', cam);
const topL = el('div', 'layer', stage);   // hors caméra : curseur, fleur de transition, mention démo

/* ================= textes ================= */
const segs = (s) => { const out = []; const re = /\[(.+?)\]/g; let last = 0, m; while ((m = re.exec(s))) { if (m.index > last) out.push([s.slice(last, m.index), '']); out.push([m[1], 'o']); last = re.lastIndex; } if (last < s.length) out.push([s.slice(last), '']); return out.flatMap(([t, c]) => t.split('\n').flatMap((p, i) => (i ? [['\n', ''], [p, c]] : [[p, c]]))).filter(([t]) => t !== ''); };
const T = (s, cls = 'ph') => text(txtL, segs(s), cls);
const fitW = (box, max = 760) => { const tf = box.style.transform; box.style.transform = 'none'; const r = [...box.querySelectorAll('.ch')].map(c => c.getBoundingClientRect()).filter(r => r.width); const w = r.length ? Math.max(...r.map(x => x.right)) - Math.min(...r.map(x => x.left)) : 0; if (w > max) box.style.fontSize = (parseFloat(getComputedStyle(box).fontSize) * max / w).toFixed(1) + 'px'; box.style.transform = tf; };
const at = (box, y, s = 1) => { box.style.transform = `translate(0px,${(y - box.offsetHeight / 2).toFixed(1)}px) scale(${s.toFixed(4)})`; };
function letters(box, t, a, b, rate = 0.018, rise = 30, blur = 12) {
  box.chars.forEach((c, i) => {
    const p = spring(t - (a + i * rate), 'snappy'), q = spring(t - (b - 0.24 + i * rate * 0.4), 'snappy');
    c.style.opacity = clamp(p * 1.6 - q * 1.6, 0, 1).toFixed(3);
    c.style.transform = `translateY(${((1 - p) * rise - q * rise).toFixed(1)}px)`;
    const bl = (1 - clamp(p, 0, 1)) * blur + q * blur; c.style.filter = bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : '';
  });
}
const TEXTS = [];   // [box, a, b, y, opts]
const say = (s, a, b, y, cls = 'ph', o = {}) => { const box = T(s, cls); TEXTS.push({ box, a, b, y, ...o }); return box; };

/* ================= entrée / sortie d'un élément graphique ================= */
function pop(e, t, a, b, x, y, o = {}) {
  const on = t >= a - 0.05 && t < b + 0.1; show(e, on); if (!on) return 0;
  const p = spring(t - a, o.pre || 'default'), q = spring(t - (b - 0.22), 'snappy');
  const dy = o.dy ?? 110, s0 = o.s0 ?? 0.86;
  place(e, x + (o.dx || 0) * (1 - p), y + (1 - p) * dy - q * 90, (s0 + (1 - s0) * p) * (o.s || 1) * (1 + (o.drift || 0) * smooth(a, b, t)), (o.r || 0) * (1 - p) + (o.rot || 0), clamp(p * 1.8 - q * 1.8, 0, 1), (1 - clamp(p, 0, 1)) * 14 + q * 14);
  return clamp(p, 0, 1);
}

/* ================= S0 · hook ================= */
const kick = el('div', 'kick', txtL); kick.innerHTML = `<img src="../assets/brand/official/utopicar-logo-horizontal-fond-sombre.svg"><span>· achat-revente auto</span>`;
say("Tu fais de\nl'[achat-revente] auto ?", -3, M.ecoute, 880, 'ph', { size: 96 });

/* ================= S1 · « Écoute. » + chrono 2 s ================= */
const bigE = say(VOICE ? 'Écoute.' : 'Regarde.', M.ecoute, M.golf, 900, 'big', { big: true, maxW: 590 });
const chrono = svgBox(gL, 760, 760);
const chR = sv('circle', { cx: 380, cy: 380, r: 330, fill: 'none', stroke: '#FF5A1F', 'stroke-width': 14, 'stroke-linecap': 'round', transform: 'rotate(-90 380 380)' }, chrono);
const chB = sv('circle', { cx: 380, cy: 380, r: 330, fill: 'none', stroke: 'rgba(255,255,255,.08)', 'stroke-width': 14 }, chrono); chrono.insertBefore(chB, chR);
const chT = sv('text', { x: 380, y: 88, 'text-anchor': 'middle', class: 'lbl', 'font-size': 40, fill: '#FF7A45' }, chrono); chT.textContent = '2 s';
const CIRC = 2 * Math.PI * 330;

/* ================= S2 · la Golf « parfaite » ================= */
const golf = makeUI(uiL, 'golf', c => { c.style.boxShadow = '0 40px 90px -24px rgba(0,0,0,.75)'; }, 0.95);
say('Une Golf.', M.golf, M.frais, 520, 'ph');
const praise = [['Propre', '✓', 'propre'], ['Entretenue', '✓', 'entretenue'], ['Vendeur adorable', '♥', 'adorable']].map(([s, i, k], n) => {
  const e = el('div', 'pillg' + (n === 2 ? ' or' : ''), gL); e.innerHTML = `<i>${i}</i>${s}`; e._t = Wd(k, M.golf); return e;
});

/* ================= S3 · les frais tombent, le compteur plonge ================= */
say('Et une fois\nles [frais] payés ?', M.frais, M.moins, 420, 'ph');
const FEES = [['Remise en état', -1100], ['Carte grise', -186], ['Trajet', -64], ['Frais fixes', -150]];
const feeT0 = M.frais + 0.55, feeStep = Math.min(0.42, (M.moins - feeT0 - 0.2) / 4);
const fees = FEES.map(([s, v], i) => { const e = el('div', 'chip', gL); e.innerHTML = `<span>${s}</span><b>${fmt(v)}</b>`; e._t = feeT0 + i * feeStep; e._v = v; return e; });
const cnt = el('div', 'count', gL);

/* ================= S4 · − 1 200 € + fissures, « Magnifique. » ================= */
const slam = say('− 1 200 €', M.moins, M.colle - 0.35, 820, 'big', { big: true, red: true }); slam.style.color = '#FF5C5C';
const crack = svgBox(gL, 900, 520);
const CRACKS = ['M450 260 L380 200 L330 214 L262 150', 'M450 260 L540 190 L600 206 L668 120', 'M450 260 L430 350 L372 400 L350 470', 'M450 260 L560 330 L610 322 L700 410', 'M450 260 L300 280 L230 250'];
const cracks = CRACKS.map(d => { const p = sv('path', { d, fill: 'none', stroke: 'rgba(255,92,92,.8)', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, crack); p._len = 400; p.setAttribute('stroke-dasharray', 400); return p; });
const magni = say('Magnifique.', M.magni, M.colle - 0.35, 1130, 'ph ital');

/* ================= S5 · tu colles l'annonce ================= */
say("Tu colles l'annonce\ndans [utopicar].", M.colle, M.deux, 420, 'ph');
const pasteCard = makeUI(uiL, 'texte', c => { c.style.boxShadow = '0 40px 90px -24px rgba(0,0,0,.75)'; }, 0.9);
const pasteMask = el('div', 'abs', pasteCard.cards[0]); Object.assign(pasteMask.style, { left: '0', width: '100%', background: '#FFFFFF' });
const launchImg = new Image(); launchImg.src = '../assets/ui/launch.png'; await launchImg.decode();
const launch = el('div', 'abs', uiL);
const lk = 700 / (launchImg.naturalWidth / 3); crop(launch, launchImg.src, launchImg.naturalWidth, launchImg.naturalHeight, { x: 0, y: 0, w: launchImg.naturalWidth / 3, h: launchImg.naturalHeight / 3 }, lk);
Object.assign(launch.style, { width: 700 + 'px', height: launchImg.naturalHeight / 3 * lk + 'px' });

/* ================= S6 · « Deux secondes… » : anneau de chargement ================= */
const load = svgBox(gL, 520, 520);
const ldB = sv('circle', { cx: 260, cy: 260, r: 200, fill: 'none', stroke: 'rgba(255,255,255,.08)', 'stroke-width': 26 }, load);
const ldR = sv('circle', { cx: 260, cy: 260, r: 200, fill: 'none', stroke: '#FF5A1F', 'stroke-width': 26, 'stroke-linecap': 'round', transform: 'rotate(-90 260 260)', 'stroke-dasharray': 2 * Math.PI * 200 }, load);
const ldT = sv('text', { x: 260, y: 300, 'text-anchor': 'middle', class: 'lbl', 'font-size': 130, 'font-weight': 800, fill: '#FFFFFF' }, load);
const ldS = sv('text', { x: 260, y: 360, 'text-anchor': 'middle', class: 'lbl', 'font-size': 34, fill: '#8FA3B8' }, load); ldS.textContent = 'analyse…';
say('Deux secondes…', M.deux, M.note, 470, 'ph');

/* ================= S7 · une note, un verdict ================= */
const gauge = svgBox(gL, 620, 620);
sv('circle', { cx: 310, cy: 310, r: 240, fill: 'none', stroke: 'rgba(255,255,255,.08)', 'stroke-width': 34 }, gauge);
const gR = sv('circle', { cx: 310, cy: 310, r: 240, fill: 'none', stroke: '#FF5C5C', 'stroke-width': 34, 'stroke-linecap': 'round', transform: 'rotate(-90 310 310)', 'stroke-dasharray': 2 * Math.PI * 240 }, gauge);
const gT = sv('text', { x: 310, y: 340, 'text-anchor': 'middle', class: 'lbl', 'font-size': 170, 'font-weight': 800, fill: '#FFFFFF' }, gauge);
const gS = sv('text', { x: 310, y: 410, 'text-anchor': 'middle', class: 'lbl', 'font-size': 40, fill: '#8FA3B8' }, gauge); gS.textContent = 'sur 100';
const stamp = el('div', 'stamp', gL); stamp.textContent = 'NO GO';
say('Une [note].\nUn [verdict].', M.note, M.reste, 420, 'ph');
const tVerdict = Wd('verdict', M.note);

/* ================= S8 · ce qu'il te reste, vraiment ================= */
say("Ce qu'il te reste,\n[VRAIMENT].", M.reste, M.prix, 460, 'ph');
const tktot = makeUI(uiL, 'tktot', c => { c.style.boxShadow = '0 40px 90px -24px rgba(0,0,0,.75)'; }, 0.97);
const circ = svgBox(gL, 520, 220);
const circP = sv('path', { d: 'M40 120 C 40 40, 470 20, 480 100 C 490 190, 80 210, 50 140 C 36 100, 120 50, 250 44', fill: 'none', stroke: '#FF7A45', 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-dasharray': 1400 }, circ);

/* ================= S9 · le prix à ne jamais dépasser : réglette ================= */
say('Le prix à ne jamais\n[dépasser].', M.prix, M.tel, 440, 'ph');
const ruler = svgBox(gL, 800, 420);
const RX = v => 40 + (v - 6000) / (10000 - 6000) * 720;
sv('rect', { x: RX(7500), y: 150, width: RX(10000) - RX(7500), height: 70, rx: 12, fill: 'rgba(255,92,92,.16)' }, ruler);
const rTrack = sv('line', { x1: 40, y1: 185, x2: 760, y2: 185, stroke: 'rgba(255,255,255,.25)', 'stroke-width': 6, 'stroke-linecap': 'round' }, ruler);
[6000, 7000, 8000, 9000, 10000].forEach(v => { sv('line', { x1: RX(v), y1: 165, x2: RX(v), y2: 205, stroke: 'rgba(255,255,255,.35)', 'stroke-width': 3 }, ruler); const l = sv('text', { x: RX(v), y: 266, 'text-anchor': 'middle', class: 'lbl', 'font-size': 34, fill: '#8FA3B8' }, ruler); l.textContent = (v / 1000) + ' k€'; });
const rLim = sv('line', { x1: RX(7500), y1: 100, x2: RX(7500), y2: 270, stroke: '#FF5C5C', 'stroke-width': 7, 'stroke-dasharray': 170 }, ruler);
const rLimT = sv('text', { x: RX(7500), y: 80, 'text-anchor': 'middle', class: 'lbl', 'font-size': 38, fill: '#FF5C5C' }, ruler); rLimT.textContent = 'ton plafond 7 500 €';
const rKnob = sv('g', {}, ruler);
sv('circle', { cx: 0, cy: 185, r: 30, fill: '#FF5A1F', stroke: '#FFFFFF', 'stroke-width': 6 }, rKnob);
const rKnobT = sv('text', { x: 0, y: 350, 'text-anchor': 'middle', class: 'lbl', 'font-size': 44, 'font-weight': 800, fill: '#FFFFFF' }, rKnob);
const rOver = sv('text', { x: RX(8750), y: 140, 'text-anchor': 'middle', class: 'lbl', 'font-size': 30, fill: '#FF8F8F' }, ruler); rOver.textContent = 'au-dessus : tu perds';

/* ================= S10 · au téléphone, c'est toi qui tiens le chiffre ================= */
say("Au téléphone,\nc'est [toi] qui tiens le chiffre.", M.tel, M.deuxv, 440, 'ph');
const phone = svgBox(gL, 260, 260);
const phG = sv('g', { transform: 'translate(130 130)' }, phone);
sv('circle', { r: 118, fill: '#12314A' }, phG);
sv('path', { d: 'M-46 -52 C-40 -60 -28 -60 -22 -52 L-10 -34 C-6 -27 -8 -19 -14 -14 L-22 -8 C-12 14 6 32 26 42 L33 34 C38 28 46 26 53 30 L71 42 C79 48 79 60 71 66 L60 76 C44 88 -2 70 -34 36 C-66 2 -78 -38 -64 -54 Z', fill: '#FF7A45' }, phG);
const waves = [0, 1, 2].map(i => sv('path', { d: `M${70 + i * 22} -40 A ${60 + i * 22} ${60 + i * 22} 0 0 1 ${110 + i * 18} 0`, fill: 'none', stroke: '#FF7A45', 'stroke-width': 8, 'stroke-linecap': 'round' }, phG));
const offer = el('div', 'pillg or', gL); offer.innerHTML = `<i>€</i>Ta 1<sup style="font-size:.6em">re</sup> offre : 7 050 €`;
const ceil = el('div', 'pillg', gL); ceil.innerHTML = `<i style="background:#FF5C5C;color:#2a0a0a">!</i>Ton plafond : 7 500 €`;

/* ================= S11 · deux voitures : le duel ================= */
say('Deux voitures en tête ?', M.deuxv, M.dors, 380, 'ph');
const duel = svgBox(gL, 760, 760);
const base = 380, UNIT = 0.14;   // px par €
sv('line', { x1: 60, y1: base, x2: 700, y2: base, stroke: 'rgba(255,255,255,.3)', 'stroke-width': 4 }, duel);
const barG = sv('rect', { x: 150, width: 170, rx: 18, fill: '#FF5C5C' }, duel);
const barC = sv('rect', { x: 440, width: 170, rx: 18, fill: '#2FD597' }, duel);
const lblG = sv('text', { x: 235, 'text-anchor': 'middle', class: 'lbl', 'font-size': 52, 'font-weight': 800, fill: '#FF5C5C' }, duel);
const lblC = sv('text', { x: 525, 'text-anchor': 'middle', class: 'lbl', 'font-size': 52, 'font-weight': 800, fill: '#2FD597' }, duel);
const nG = sv('text', { x: 235, y: base - 26, 'text-anchor': 'middle', class: 'lbl', 'font-size': 40, fill: '#DCE6F0' }, duel); nG.textContent = 'Golf';
const nC = sv('text', { x: 525, y: base + 58, 'text-anchor': 'middle', class: 'lbl', 'font-size': 40, fill: '#DCE6F0' }, duel); nC.textContent = 'Clio';
const goStamp = el('div', 'stamp go', gL); goStamp.textContent = 'GO';
const tCompare = Wd('compar', M.deuxv), tBest = Wd('meilleure', M.deuxv);

/* ================= S12 · pendant que tu dors : radar ================= */
say('Pendant que tu [dors],\nil surveille les annonces.', M.dors, M.clio, 420, 'ph');
const radar = svgBox(gL, 640, 640);
const rdG = sv('g', { transform: 'translate(320 320)' }, radar);
[100, 190, 280].forEach(r => sv('circle', { r, fill: 'none', stroke: 'rgba(255,255,255,.12)', 'stroke-width': 3 }, rdG));
sv('line', { x1: -290, y1: 0, x2: 290, y2: 0, stroke: 'rgba(255,255,255,.08)', 'stroke-width': 3 }, rdG);
sv('line', { x1: 0, y1: -290, x2: 0, y2: 290, stroke: 'rgba(255,255,255,.08)', 'stroke-width': 3 }, rdG);
const defs = sv('defs', {}, radar); const lg = sv('linearGradient', { id: 'sw', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
sv('stop', { offset: 0, 'stop-color': '#FF5A1F', 'stop-opacity': 0 }, lg); sv('stop', { offset: 1, 'stop-color': '#FF5A1F', 'stop-opacity': 0.55 }, lg);
const sweep = sv('path', { d: 'M0 0 L280 0 A280 280 0 0 0 242 -140 Z', fill: 'url(#sw)' }, rdG);
const DOTS = [[-150, -80], [120, -170], [210, 60], [-60, 190], [40, -60], [-230, 110], [170, 200]].map(([x, y], i) => { const d = sv('circle', { cx: x, cy: y, r: i === 4 ? 16 : 11, fill: i === 4 ? '#FF7A45' : '#8FA3B8' }, rdG); d._a = Math.atan2(y, x); return d; });
const moon = svgBox(gL, 160, 160);
sv('path', { d: 'M110 20 A 62 62 0 1 0 140 118 A 50 50 0 1 1 110 20 Z', fill: '#DCE6F0' }, moon);

/* ================= S13 · la Clio sous la cote : courbe ================= */
say('Une Clio, [1 450 €]\nsous la cote ?', M.clio, M.premier, 400, 'ph');
const chart = svgBox(gL, 800, 600);
const CY0 = 500, PY = v => CY0 - (v - 5500) * 0.16;
sv('line', { x1: 40, y1: CY0, x2: 770, y2: CY0, stroke: 'rgba(255,255,255,.2)', 'stroke-width': 3 }, chart);
const coteL = sv('line', { x1: 40, y1: PY(7850), x2: 770, y2: PY(7850), stroke: '#8FA3B8', 'stroke-width': 4, 'stroke-dasharray': '14 12' }, chart);
const coteT = sv('text', { x: 770, y: PY(7850) + 46, 'text-anchor': 'end', class: 'lbl', 'font-size': 34, fill: '#8FA3B8' }, chart); coteT.textContent = 'cote 7 850 €';
const LIST = [[110, 8200], [210, 7900], [310, 8050], [410, 7700], [520, 6400], [630, 8100], [720, 7950]];
const pts = LIST.map(([x, v], i) => { const c = sv('circle', { cx: x, cy: PY(v), r: i === 4 ? 22 : 15, fill: i === 4 ? '#FF5A1F' : '#DCE6F0' }, chart); c._v = v; return c; });
const gap = sv('line', { x1: 520, y1: PY(7850), x2: 520, y2: PY(6400), stroke: '#2FD597', 'stroke-width': 6, 'stroke-dasharray': 240 }, chart);
const gapT = sv('text', { x: 548, y: (PY(7850) + PY(6400)) / 2 + 14, class: 'lbl', 'font-size': 48, 'font-weight': 800, fill: '#2FD597' }, chart); gapT.textContent = '− 1 450 €';

/* ================= S14 · t'es le premier au courant : notification ================= */
const note = el('div', 'toast', gL);
note.innerHTML = `<img src="../assets/brand/official/utopicar-icone-noir.svg"><div><div class="t1">Nouvelle affaire · Clio IV 1.5 dCi</div><div class="t2">6 400 € · <b>1 450 € sous la cote</b> · à l'instant</div></div>`;
const pings = [0, 1, 2].map(() => { const r = el('div', 'ripple', gL); return r; });
const whisper = say("t'es le premier au courant.", M.premier, M.parc, 1180, 'whisper');

/* ================= S15 · ton parc, ta marge, les jours en stock ================= */
say('Ton parc. Ta marge.\nTes jours en stock.', M.parc, M.tableur, 400, 'ph');
const rows = makeUI(uiL, 'rowsdays', c => { c.style.boxShadow = '0 40px 90px -24px rgba(0,0,0,.75)'; }, 0.9);
const cal = svgBox(gL, 300, 300);
sv('rect', { x: 20, y: 30, width: 260, height: 250, rx: 30, fill: '#F4F1EC' }, cal);
sv('rect', { x: 20, y: 30, width: 260, height: 70, rx: 30, fill: '#FF5A1F' }, cal); sv('rect', { x: 20, y: 70, width: 260, height: 30, fill: '#FF5A1F' }, cal);
[80, 220].forEach(x => sv('rect', { x: x - 8, y: 12, width: 16, height: 44, rx: 8, fill: '#15110d' }, cal));
const calN = sv('text', { x: 150, y: 222, 'text-anchor': 'middle', class: 'lbl', 'font-size': 110, 'font-weight': 800, fill: '#15110d' }, cal);
const calL = sv('text', { x: 150, y: 262, 'text-anchor': 'middle', class: 'lbl', 'font-size': 28, fill: '#6b6259' }, cal); calL.textContent = 'jours en stock';
const tMarge = Wd('marge', M.parc), tJours = Wd('jours', M.parc), tLa = Wd('tout', M.parc);
const kpis = makeUI(uiL, 'kpis', c => { c.style.boxShadow = '0 40px 90px -24px rgba(0,0,0,.75)'; }, 1.0);

/* ================= S16 · fini le tableur du dimanche ================= */
say('Fini le tableur\ndu [dimanche].', M.tableur, M.sais, 400, 'ph');
const sheet = svgBox(gL, 720, 520);
const shG = sv('g', {}, sheet);
sv('rect', { x: 10, y: 10, width: 700, height: 500, rx: 20, fill: '#E9EEF2' }, shG);
const grid = [];
for (let i = 0; i <= 6; i++) grid.push(sv('line', { x1: 10, y1: 10 + i * 83, x2: 710, y2: 10 + i * 83, stroke: '#9FB0BF', 'stroke-width': 3 }, shG));
for (let j = 0; j <= 5; j++) grid.push(sv('line', { x1: 10 + j * 140, y1: 10, x2: 10 + j * 140, y2: 510, stroke: '#9FB0BF', 'stroke-width': 3 }, shG));
const CELLS = ['=SOMME(B2:B9)', '#REF!', '9 500', '??', '=B4-C4', '1 100 ?'];
const cells = CELLS.map((s, i) => { const x = sv('text', { x: [30, 330, 560][i % 3], y: 130 + Math.floor(i / 3) * 170, class: 'lbl', 'font-size': 34, fill: i === 1 ? '#D93A2B' : '#34424f' }, shG); x.textContent = s; return x; });
const strike = sv('line', { x1: 40, y1: 470, x2: 680, y2: 60, stroke: '#FF5C5C', 'stroke-width': 18, 'stroke-linecap': 'round', 'stroke-dasharray': 800 }, sheet);

/* ================= S17–S18 · tu sais avant d'acheter, tu revends avec de la marge ================= */
say("Tu sais avant\nd'[acheter].", M.sais, M.revends, 820, 'ph', { size: 110 });
say('Tu revends\navec de la [marge].', M.revends, M.cta - 0.2, 420, 'ph');
const area = svgBox(gL, 800, 600);
const AX = i => 40 + i * 120, AV = [0.1, 0.22, 0.2, 0.38, 0.5, 0.62, 0.86];
const areaPath = (k) => `M${AX(0)} 520 ` + AV.map((v, i) => `L${AX(i)} ${520 - v * 420 * k}`).join(' ') + ` L${AX(6)} 520 Z`;
const linePath = (k) => AV.map((v, i) => `${i ? 'L' : 'M'}${AX(i)} ${520 - v * 420 * k}`).join(' ');
const areaF = sv('path', { fill: 'rgba(47,213,151,.18)' }, area);
const areaL = sv('path', { fill: 'none', stroke: '#2FD597', 'stroke-width': 8, 'stroke-linejoin': 'round' }, area);
const areaT = sv('text', { x: 400, y: 60, 'text-anchor': 'middle', class: 'lbl', 'font-size': 88, 'font-weight': 800, fill: '#2FD597' }, area);
const areaS = sv('text', { x: 400, y: 110, 'text-anchor': 'middle', class: 'lbl', 'font-size': 34, fill: '#8FA3B8' }, area); areaS.textContent = 'marge réalisée';

/* ================= S19 · CTA ================= */
const lockE = el('img', 'lock', txtL); lockE.src = '../assets/brand/official/utopicar-logo-horizontal-fond-sombre.svg';
const cta = el('div', 'cta', txtL); cta.innerHTML = `Commente<br><span class="g">DÉBUTANT</span> ou <span class="g">PRO</span>`;
const cta2 = el('div', 'cta2', txtL); cta2.innerHTML = `tu reçois le guide qui va avec<br>+ ta place sur la liste d'attente.`;
const ctaRip = el('div', 'ripple', topL);

/* ================= goutte, fleur, curseur, mention ================= */
const dropL = el('div', 'layer', cam);
const ghosts = [0.06, 0.12, 0.18].map((d, i) => { const g = el('div', 'ghost', dropL); g._d = d; g.style.width = g.style.height = (30 - i * 8) + 'px'; return g; });
const drop = el('div', 'drop', dropL);
const burst = el('div', 'flower', topL); burst.innerHTML = FLOWER('#FF5A1F');
const cur = cursor(topL, true);
const rip = el('div', 'ripple', topL);
const demo = el('div', 'demo', topL); demo.textContent = 'Données de démonstration';
const BURSTS = [M.colle, M.cta];

/* ================= caméra : poussées par plan, secousses sur les chocs ================= */
const CUTS = [0, M.ecoute, M.golf, M.frais, M.moins, M.colle, M.deux, M.note, M.reste, M.prix, M.tel, M.deuxv, M.dors, M.clio, M.premier, M.parc, M.tableur, M.sais, M.revends, M.cta];
const SHAKES = [[M.moins, 1], [tVerdict, 0.7], [Wd('dimanche', M.tableur) + 0.2, 0.5]];
function camera(t) {
  let s = 1, x = 0, y = 0, r = 0;
  const i = CUTS.findLastIndex(c => c <= t); const a = CUTS[i], b = CUTS[i + 1] ?? M.end;
  s = 1.035 - 0.035 * spring(t - a, 'heavy') + 0.03 * smooth(a, b, t);   // chaque plan arrive un peu près puis respire
  x = noise(21, t * 0.25) * 6; y = noise(22, t * 0.22) * 6; r = noise(23, t * 0.2) * 0.25;
  for (const [ts, k] of SHAKES) { const e = clamp(t - ts, 0, 1); if (e > 0 && e < 0.6) { const d = Math.exp(-e * 9) * k; x += Math.sin(e * 70) * 16 * d; y += Math.cos(e * 55) * 12 * d; r += Math.sin(e * 40) * 0.8 * d; } }
  cam.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) scale(${s.toFixed(4)}) rotate(${r.toFixed(3)}deg)`;
}

/* ================= seek ================= */
window.seek = function (t) {
  halos.forEach((h, i) => place(h, h._p[0] + noise(i + 1, t * 0.12) * 80, h._p[1] + noise(i + 7, t * 0.1) * 80, 1 + noise(i + 3, t * 0.2) * 0.08, 0, 1));
  camera(t);
  // textes
  let bigOn = null;
  for (const X of TEXTS) {
    const on = inWin(t, X.a - 0.05, X.b); show(X.box, on); if (!on) continue;
    letters(X.box, t, X.a === -3 ? -3 : X.a, X.b, X.big ? 0.035 : 0.016, X.big ? 60 : 30, X.big ? 22 : 12);
    at(X.box, X.y, (X.big ? 1.06 - 0.06 * spring(t - X.a, 'heavy') : 1) + smooth(X.a, X.b, t) * 0.04);
    if (X.big) bigOn = X;
  }
  // kicker (logo officiel) sur le hook
  const kq = spring(t - (M.ecoute - 0.3), 'default'); show(kick, t < M.ecoute + 0.4); place(kick, CX, 330 - kq * 60, 1, 0, clamp(1 - kq * 1.4, 0, 1));
  // fleur derrière les gros mots
  const bo = bigOn ? spring(t - bigOn.a, 'default') - spring(t - (bigOn.b - 0.2), 'snappy') : 0;
  show(blob, bo > 0.01); if (bo > 0.01) place(blob, CX, bigOn.y, (0.4 + 0.8 * clamp(bo, 0, 1)) * (1 + noise(2, t * 0.5) * 0.04), t * 18, clamp(bo, 0, 1) * (bigOn.red ? 0.55 : 0.9), 2);
  blob.firstChild.firstChild.setAttribute('fill', bigOn && bigOn.red ? '#3A1420' : '#12314A');

  // S1 · chrono autour de « Écoute. »
  { const on = inWin(t, M.ecoute, M.golf); show(chrono, on);
    if (on) { const p = spring(t - M.ecoute, 'default'), q = spring(t - (M.golf - 0.25), 'snappy'); place(chrono, CX, 900, 0.8 + 0.2 * p, 0, clamp(p * 2 - q * 2, 0, 1));
      chR.setAttribute('stroke-dashoffset', (CIRC * (1 - clamp((t - M.ecoute - 0.2) / 2, 0, 1))).toFixed(1)); } }

  // S2 · Golf + compliments
  { const a = M.golf, b = M.frais; const p = pop(golf, t, a + 0.1, b, CX, 900, { dx: 420, dy: 0, r: 8, drift: 0.03 });
    praise.forEach((e, i) => pop(e, t, e._t, b, [330, 740, 520][i], [1150, 1260, 1370][i], { pre: 'snappy', dy: 60, s0: 0.5, rot: [-4, 3, -2][i] })); }

  // S3 · frais qui tombent + compteur
  { const a = M.frais, b = M.moins; let val = 300;
    fees.forEach((e, i) => { const k = pop(e, t, e._t, b + 0.3, CX + (i % 2 ? 26 : -26), 590 + i * 118, { pre: 'snappy', dy: -260, s0: 0.9, r: i % 2 ? 6 : -6, rot: i % 2 ? 1.5 : -1.5 }); if (t >= e._t + 0.12) val += e._v * clamp((t - e._t - 0.12) / 0.3, 0, 1); });
    const on = inWin(t, a + 0.3, b + 0.25); show(cnt, on);
    if (on) { const p = spring(t - (a + 0.3), 'default'), q = spring(t - b, 'snappy'); cnt.innerHTML = `${fmt(val)}<small>ce qu'il te reste</small>`; cnt.style.color = val < 0 ? '#FF5C5C' : '#2FD597';
      cnt.style.transform = `translate(0px,${(1080 + (1 - p) * 80).toFixed(1)}px) scale(${(0.9 + 0.1 * p + bump(t, (fees.find(f => f._t + 0.12 <= t && t < f._t + 0.4)?._t ?? -9.12) + 0.12, 0.12) * 0.05).toFixed(4)})`; cnt.style.opacity = clamp(p * 2 - q * 3, 0, 1).toFixed(3); cnt.style.transformOrigin = '400px 50%'; } }

  // S4 · fissures sous « − 1 200 € »
  { const on = inWin(t, M.moins, M.colle - 0.3); show(crack, on);
    if (on) { place(crack, CX, 820, 1, 0, 1 - smooth(M.colle - 0.8, M.colle - 0.3, t)); cracks.forEach((c, i) => c.setAttribute('stroke-dashoffset', (400 * (1 - inOut(M.moins + 0.08 + i * 0.03, M.moins + 0.45 + i * 0.03, t))).toFixed(1))); } }

  // S5 · l'annonce se colle, clic sur « Analyser »
  const tPaste = Wd('colle', M.colle) + 0.25, tClick = M.deux - 0.35;
  { const b = M.deux; pop(pasteCard, t, M.colle + 0.2, b, CX, 880, { dy: 160 });
    pasteMask.style.top = (pasteCard.cards[0]._h * 0.28 + pasteCard.cards[0]._h * 0.72 * inOut(tPaste, tPaste + 0.5, t)).toFixed(1) + 'px'; pasteMask.style.height = pasteCard.cards[0]._h + 'px';
    pop(launch, t, M.colle + 0.5, b, CX, 1280, { dy: 120, s: 1 - 0.05 * bump(t, tClick - 0.04, 0.12) }); }

  // S6 · anneau « deux secondes »
  { const on = inWin(t, M.deux - 0.05, M.note + 0.1); show(load, on);
    if (on) { const p = spring(t - M.deux, 'default'), q = spring(t - (M.note - 0.2), 'snappy'); place(load, CX, 1000, 0.7 + 0.3 * p - q * 0.2, 0, clamp(p * 2 - q * 2, 0, 1), q * 12);
      const k = clamp((t - M.deux - 0.1) / (M.note - M.deux - 0.35), 0, 1); ldR.setAttribute('stroke-dashoffset', (2 * Math.PI * 200 * (1 - k)).toFixed(1)); ldT.textContent = k < 0.5 ? '2' : k < 1 ? '1' : '✓'; } }

  // S7 · jauge 38/100 + tampon NO GO
  { const a = M.note, b = M.reste; const on = inWin(t, a - 0.05, b); show(gauge, on);
    if (on) { const p = spring(t - a, 'default'), q = spring(t - (b - 0.22), 'snappy'); place(gauge, CX, 950, 0.8 + 0.2 * p, 0, clamp(p * 2 - q * 2, 0, 1), q * 12);
      const k = 0.38 * inOut(a + 0.15, a + 1.0, t); gR.setAttribute('stroke-dashoffset', (2 * Math.PI * 240 * (1 - k)).toFixed(1)); gT.textContent = Math.round(k * 100); }
    const so = inWin(t, tVerdict - 0.05, b); show(stamp, so);
    if (so) { const s = spring(t - tVerdict, 'snappy'), q = spring(t - (b - 0.22), 'snappy'); place(stamp, CX + 90, 1250, 2.2 - 1.2 * s, -12, clamp(s * 3 - q * 2, 0, 1)); } }

  // S8 · ce qu'il te reste : carte + cercle tracé à la main
  { const a = M.reste, b = M.prix; pop(tktot, t, a + 0.1, b, CX, 940, { dy: 140, drift: 0.02 });
    const on = inWin(t, a + 0.5, b); show(circ, on); if (on) { place(circ, CX + 140, 945, 0.98, 0, 1 - smooth(b - 0.3, b, t)); circP.setAttribute('stroke-dashoffset', (1400 * (1 - inOut(Wd('vraiment', a), Wd('vraiment', a) + 0.7, t))).toFixed(1)); } }

  // S9 · réglette : le prix glisse de 9 500 € à 7 500 €
  { const a = M.prix, b = M.tel; const on = inWin(t, a - 0.05, b); show(ruler, on);
    if (on) { const p = spring(t - a, 'default'), q = spring(t - (b - 0.22), 'snappy'); place(ruler, CX, 920, 0.98, 0, clamp(p * 2 - q * 2, 0, 1), (1 - clamp(p, 0, 1)) * 10 + q * 12);
      rLim.setAttribute('stroke-dashoffset', (170 * (1 - inOut(a + 0.3, a + 0.8, t))).toFixed(1)); rLimT.style.opacity = smooth(a + 0.6, a + 0.9, t);
      const v = lerp(9500, 7500, inOut(Wd('dépasser', a), Wd('dépasser', a) + 1.0, t)); rKnob.setAttribute('transform', `translate(${RX(v).toFixed(1)} 0)`); rKnobT.textContent = fmtN(v) + ' €';
      rOver.style.opacity = smooth(a + 0.9, a + 1.2, t); } }

  // S10 · téléphone qui sonne + offre / plafond
  { const a = M.tel, b = M.deuxv; const on = inWin(t, a - 0.05, b); show(phone, on);
    if (on) { const p = spring(t - a, 'snappy'), q = spring(t - (b - 0.22), 'snappy'); const ring = Math.sin(t * 40) * 9 * clamp(1 - (t - a) / 1.2, 0, 1);
      place(phone, CX, 820, 0.6 + 0.4 * p, ring, clamp(p * 2 - q * 2, 0, 1)); waves.forEach((w, i) => w.style.opacity = (0.3 + 0.7 * Math.max(0, Math.sin(t * 8 - i * 0.9))).toFixed(2)); }
    pop(offer, t, Wd('toi', a) - 0.1, b, CX, 1090, { pre: 'snappy', dy: 60, dx: -300 }); pop(ceil, t, Wd('chiffre', a), b, CX, 1220, { pre: 'snappy', dy: 60, dx: 300 }); }

  // S11 · duel Golf / Clio
  { const a = M.deuxv, b = M.dors; const on = inWin(t, a - 0.05, b); show(duel, on);
    if (on) { const p = spring(t - a, 'default'), q = spring(t - (b - 0.22), 'snappy'); place(duel, CX, 1010, 1.3, 0, clamp(p * 2 - q * 2, 0, 1), q * 12);
      const k = inOut(tCompare - 0.1, tCompare + 0.9, t); const hg = 1200 * UNIT * k, hc = 1932 * UNIT * k;
      barG.setAttribute('y', base); barG.setAttribute('height', Math.max(0.01, hg)); barC.setAttribute('y', base - hc); barC.setAttribute('height', Math.max(0.01, hc));
      lblG.setAttribute('y', base + hg + 62); lblG.textContent = fmt(-1200 * k); lblC.setAttribute('y', base - hc - 22); lblC.textContent = fmt(1932 * k);
      const dim = smooth(tBest, tBest + 0.4, t); barG.style.opacity = 1 - 0.55 * dim; lblG.style.opacity = 1 - 0.55 * dim; }
    const so = inWin(t, tBest - 0.05, b); show(goStamp, so); if (so) { const s = spring(t - tBest, 'snappy'), q = spring(t - (b - 0.22), 'snappy'); place(goStamp, CX + 200, 1010 + (380 - 1932 * UNIT - 380) * 1.3 - 120, 2 - s, 8, clamp(s * 3 - q * 2, 0, 1)); } }

  // S12 · radar de nuit
  { const a = M.dors, b = M.clio; const on = inWin(t, a - 0.05, b); show(radar, on); show(moon, on);
    if (on) { const p = spring(t - a, 'default'), q = spring(t - (b - 0.22), 'snappy'); const o = clamp(p * 2 - q * 2, 0, 1); place(radar, CX, 1010, (0.85 + 0.15 * p) * 1.2, 0, o, q * 12);
      place(moon, 850, 640, 0.7 + 0.3 * p, -10 + noise(5, t * 0.4) * 6, o); const ang = (t - a) * 2.6; sweep.setAttribute('transform', `rotate(${(ang * 180 / Math.PI).toFixed(1)})`);
      DOTS.forEach((d, i) => { const da = ((ang - d._a) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); const lit = Math.exp(-da * 1.6) * (t - a > 0.3 ? 1 : 0); d.setAttribute('opacity', (0.25 + 0.75 * lit).toFixed(2)); if (i === 4) d.setAttribute('r', (16 + 8 * lit).toFixed(1)); }); } }

  // S13 · courbe « sous la cote »
  { const a = M.clio, b = M.premier; const on = inWin(t, a - 0.05, b); show(chart, on);
    if (on) { const p = spring(t - a, 'default'), q = spring(t - (b - 0.22), 'snappy'); place(chart, CX, 1010, 1.05, 0, clamp(p * 2 - q * 2, 0, 1), q * 12);
      coteL.setAttribute('x2', (40 + 730 * inOut(a + 0.1, a + 0.7, t)).toFixed(1)); coteT.style.opacity = smooth(a + 0.5, a + 0.8, t);
      pts.forEach((c, i) => { const s = spring(t - (a + 0.2 + i * 0.08), 'snappy'); c.setAttribute('opacity', clamp(s, 0, 1).toFixed(2)); c.setAttribute('cy', (PY(c._v) - (1 - clamp(s, 0, 1)) * 40).toFixed(1)); });
      const tg = Wd('sous', a); gap.setAttribute('stroke-dashoffset', (240 * (1 - inOut(tg - 0.3, tg + 0.2, t))).toFixed(1)); gapT.style.opacity = smooth(tg, tg + 0.3, t);
      pts[4].setAttribute('r', (22 + 7 * Math.max(0, Math.sin((t - a) * 9))).toFixed(1)); } }

  // S14 · notification qui tombe + ondes
  { const a = M.premier - 0.35, b = M.parc; pop(note, t, a, b, CX, 820, { pre: 'snappy', dy: -380, s0: 0.95 });
    pings.forEach((r, i) => { const on = inWin(t, a + 0.3, b); show(r, on); if (on) { const k = ((t - a - 0.3 - i * 0.35) % 1.05 + 1.05) % 1.05; place(r, CX - 322, 820, 0.8 + k * 1.6, 0, (1 - k / 1.05) * 0.8); } }); }

  // S15 · parc : lignes, calendrier qui défile, tableau de bord
  { const a = M.parc, b = M.tableur; pop(rows, t, a + 0.1, tLa + 0.1, CX - 70, 900, { dy: 140 });
    const on = inWin(t, tJours - 0.1, tLa + 0.1); show(cal, on);
    if (on) { const p = spring(t - (tJours - 0.1), 'snappy'), q = spring(t - (tLa - 0.12), 'snappy'); place(cal, 790, 760, (0.6 + 0.4 * p) * 0.8, 6 * (1 - p), clamp(p * 2 - q * 2, 0, 1)); calN.textContent = Math.round(lerp(1, 12, inOut(tJours, tJours + 0.9, t))); }
    pop(kpis, t, tLa, b, CX, 930, { dy: 160, s0: 0.7, drift: 0.04 }); }

  // S16 · tableur barré qui s'effondre
  { const a = M.tableur, b = M.sais; const on = inWin(t, a - 0.05, b); show(sheet, on);
    if (on) { const p = spring(t - a, 'default'); const tS = Wd('dimanche', a) + 0.1; const fall = inOut(tS + 0.35, tS + 0.95, t);
      place(sheet, CX, 980 + fall * 520, (0.85 + 0.15 * p) * (1 - fall * 0.5), fall * -24, clamp(p * 2, 0, 1) * (1 - fall), fall * 6);
      grid.forEach((g, i) => g.style.opacity = smooth(a + i * 0.03, a + 0.2 + i * 0.03, t)); cells.forEach((c, i) => c.style.opacity = smooth(a + 0.3 + i * 0.07, a + 0.5 + i * 0.07, t));
      strike.setAttribute('stroke-dashoffset', (800 * (1 - inOut(tS - 0.15, tS + 0.3, t))).toFixed(1)); } }

  // S18 · courbe de marge qui monte
  { const a = M.revends, b = M.cta - 0.1; const on = inWin(t, a - 0.05, b); show(area, on);
    if (on) { const p = spring(t - a, 'default'), q = spring(t - (b - 0.22), 'snappy'); place(area, CX, 1040, 1.05, 0, clamp(p * 2 - q * 2, 0, 1), q * 12);
      const k = inOut(a + 0.15, a + 1.4, t); areaF.setAttribute('d', areaPath(k)); areaL.setAttribute('d', linePath(k)); areaT.textContent = fmt(14820 * k); } }

  // S19 · CTA : logo officiel, DÉBUTANT / PRO
  const eOn = t >= M.cta; show(lockE, eOn); show(cta, eOn && t >= M.cta + 0.2); show(cta2, eOn && t >= Wd('reçois', M.cta) - 0.1);
  if (eOn) {
    const p = spring(t - M.cta, 'heavy'), push = smooth(M.cta, M.end, t);
    lockE.style.transform = `translate(${(CX - lockE.offsetWidth / 2).toFixed(1)}px,${(600 - 85).toFixed(1)}px) scale(${((1.15 - 0.15 * p) * (1 + push * 0.03)).toFixed(4)})`; lockE.style.opacity = clamp(p * 2, 0, 1);
    const c = spring(t - (M.cta + 0.2), 'default'); const beat = Math.max(...[2.4, 1.6, 0.8].map(d => bump(t, M.end - d, 0.16)));
    place(cta, CX, 900 + (1 - c) * 60, (0.9 + 0.1 * c) * (1 + beat * 0.04), 0, clamp(c * 2, 0, 1), (1 - clamp(c, 0, 1)) * 8);
    const c2 = spring(t - Wd('reçois', M.cta), 'default'); cta2.style.transform = `translate(0px,${(1110 + (1 - c2) * 40).toFixed(1)}px)`; cta2.style.opacity = clamp(c2 * 2, 0, 1);
  }

  // curseur : plans d'interface et CTA (trajets courbes, clics avec onde)
  let cOn = false, clickAt = null;
  if (inWin(t, M.golf + 0.4, M.frais - 0.1)) { moveCursor(cur, t, [[M.golf + 0.4, 1000, 1500], [M.golf + 0.45, 760, 1060], [M.golf + 1.3, 560, 900], [M.golf + 2.4, 700, 960]], [], M.golf + 0.4, M.frais - 0.1); cOn = true; }
  else if (inWin(t, M.colle + 0.3, M.deux + 0.1)) { const cl = [tPaste - 0.15, tClick]; moveCursor(cur, t, [[M.colle + 0.3, 1000, 1550], [M.colle + 0.35, 760, 980], [tPaste + 0.5, 640, 1240], [tClick - 0.5, 560, 1290]], cl, M.colle + 0.3, M.deux + 0.1); cOn = true; clickAt = t < tClick - 0.05 ? [tPaste - 0.15, 700, 1000] : [tClick, 560, 1290]; }
  else if (inWin(t, tCompare + 0.3, M.dors - 0.1)) { moveCursor(cur, t, [[tCompare + 0.3, 1000, 1500], [tCompare + 0.35, 820, 1100], [tBest - 0.3, 700, 680]], [tBest], tCompare + 0.3, M.dors - 0.1); cOn = true; clickAt = [tBest, 700, 680]; }
  else if (t >= M.cta + 0.8) { const tD = M.cta + 1.5; moveCursor(cur, t, [[M.cta + 0.8, 1000, 1500], [M.cta + 0.85, 460, 1000], [tD + 1.4, 800, 1000], [M.end - 1.4, 440, 1000]], [tD, M.end - 1.1], M.cta + 0.8, 1e9); cOn = true; clickAt = t < M.end - 1.15 ? [tD, 460, 1000] : [M.end - 1.1, 440, 1000]; }
  show(cur, cOn);
  { const on = clickAt && inWin(t, clickAt[0], clickAt[0] + 0.5); show(rip, !!on); if (on) { const k = (t - clickAt[0]) / 0.5; place(rip, clickAt[1], clickAt[2], 0.3 + k * 1.4, 0, (1 - k) * 0.9); } }
  show(ctaRip, false);

  // goutte orange : guide l'œil de plan en plan
  const dOn = t < M.cta - 0.3 && !inWin(t, M.colle - 0.35, M.colle + 0.4);
  show(dropL, dOn || t >= M.cta + 0.4);
  dropL.style.zIndex = t >= M.cta ? '1' : ''; txtL.style.zIndex = t >= M.cta ? '2' : '';   // au CTA, la goutte tourne derrière le logo
  const DROP = CUTS.map((c, i) => [c, [820, 220, 860, 200, 840, 240][i % 6], [600, 560, 1000, 1040, 640, 560][i % 6]]);
  const dropAt = u => { let x = DROP[0][1], y = DROP[0][2]; for (let i = 1; i < DROP.length; i++) { const s = spring(u - DROP[i][0], { f: 1.4, z: 0.9 }); x += (DROP[i][1] - DROP[i - 1][1]) * s; y += (DROP[i][2] - DROP[i - 1][2]) * s; } return [x + noise(4, u * 0.8) * 14, y + noise(5, u * 0.7) * 14]; };
  const orb = u => { const k = spring(u - (M.cta + 0.4), 'default'), an = (u - M.cta) * 2.2 - 1.5; return [CX + Math.cos(an) * 390 * k, 850 + Math.sin(an) * 330 * k]; };
  const pos = t >= M.cta + 0.4 ? orb : dropAt;
  const [dx, dy] = pos(t); place(drop, dx, dy, 1, 0, 1); ghosts.forEach(g => { const [gx, gy] = pos(t - g._d); place(g, gx, gy, 1, 0, 0.35); });
  // transitions fleur
  let bs = 0, bo2 = 0;
  for (const TT of BURSTS) { if (inWin(t, TT - 0.4, TT + 0.35)) { const g = clamp((t - (TT - 0.4)) / 0.4, 0, 1); bs = g < 1 ? g * g * 5.5 : 5.5 + (t - TT) * 8; bo2 = g < 1 ? 1 : 1 - clamp((t - TT) / 0.35, 0, 1); } }
  show(burst, bo2 > 0.01); if (bo2 > 0.01) place(burst, CX, 900, bs, t * 40, bo2);
  demo.style.opacity = (t >= M.golf - 0.1 && t < M.sais) || inWin(t, M.revends, M.cta) ? '1' : '0';
};

await document.fonts.ready;
await Promise.all([...document.querySelectorAll('img')].map(i => i.decode().catch(() => {})));
await document.fonts.load("800 190px 'Archivo'"); await document.fonts.load("700 74px 'Archivo'");
for (const X of TEXTS) { if (X.size) X.box.style.fontSize = X.size + 'px'; fitW(X.box, X.maxW || (X.big ? 800 : 760)); }
window.seek(0);
window.filmReady = true;
