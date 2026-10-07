// MO8 « Les 5 moteurs » (30,0 s). Contrat : window.seek(t) peint la frame t, sans état entre les frames.
// window.shutter(t) / window.samples(t) : flou de bougé au rendu. Minutage : docs/timeline-mo8.md (objet K, recalé sur
// la voix à l'étape 4). Pièces 3D : parts.js (copie de la DA validée, chaîne et courroie animables).
import { THREE, createStage } from './parts.js';
const { spring, track, clamp, lerp, noise } = window.Motion;
const stage = document.getElementById('stage');
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, cls, parent, style) => { const e = document.createElement(tag); if (cls) e.className = cls; if (style) e.setAttribute('style', style); (parent || stage).appendChild(e); return e; };
const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const S = (t, t0, p) => spring(t - t0, p);
const sm = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const eo = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return 1 - Math.pow(1 - u, 3); };
const f3 = (x) => (+x).toFixed(3);
const set = (e, o) => { const v = clamp(o, 0, 1); e.style.opacity = f3(v); e.style.visibility = v < 0.002 ? 'hidden' : 'visible'; };
const setA = (e, o) => e.setAttribute('opacity', f3(clamp(o, 0, 1)));
const fade = (t, a, b, c, d) => sm(a, b, t) * (1 - sm(c, d, t));
const DUR = 30.0, W = 1080, H = 1920;
const P = {
  pen: { f: 1.05, z: 1 }, draw: { f: 1.35, z: 1 }, rise: { f: 1.9, z: 1 }, card: { f: 1.6, z: 0.82 }, dock: { f: 1.2, z: 1 },
  heavy: 'heavy', roll: { f: 0.9, z: 1 }, cam: { f: 0.7, z: 1 }, pop: { f: 2.0, z: 0.72 }, part: { f: 1.3, z: 0.86 }, out: { f: 1.4, z: 1 },
};

// ---------- minutage (seul endroit à recaler sur la voix) ----------
const K = {
  sweep: 0.5, cross: 2.0, moteur: 2.4, hookOut: 3.5,
  N: [4.0, 8.0, 12.0, 16.0, 20.0],
  six: 24.0, fact: 24.5, fuit: 26.8, affaire: 27.8, out: 28.6, loopIn: 28.75,
};
// un numéro : entrée de la voiture +0, balayage +0.6, rangement +1.0, défaut +1.5, coût +2.0, sortie +3.4
const D = { sweep: 0.6, dock: 1.0, defect: 1.5, cost: 2.0, exit: 3.55 };

await document.fonts.ready;
await Promise.all(['700 120px Clash', '600 40px Clash', '700 40px Satoshi', '500 40px Satoshi', 'italic 160px Fraunces'].map(f => document.fonts.load(f)));
const load = (src, tries = 4) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => (tries > 1 ? load(src, tries - 1).then(res, rej) : rej(new Error(src))); im.src = src; });

// ---------- les voitures (photos réelles détourées, Wikimedia Commons) ----------
const PH = { bmw: ['car-bmw.png', 1682, 1177, .56], golf: ['car-golf.png', 1841, 1021, .57], fiesta: ['car-fiesta.png', 1806, 996, .55], clio: ['car-clio.png', 1795, 970, .53], p208: ['car-p208.png', 1833, 1118, .52] };
for (const k in PH) await load(`../assets/photos-mo8/${PH[k][0]}`);
const url = (k) => `../assets/photos-mo8/${PH[k][0]}`;
const phBg = (k, h, sw, x) => { const [, w, hh, fy] = PH[k], Hh = sw * hh / w; return `background:url(${url(k)}) no-repeat ${x}px ${h / 2 - fy * Hh}px / ${sw}px auto,radial-gradient(60% 120% at 30% 50%,#2a1d17,#0d0b0d 70%)`; };

// ---------- les cinq numéros ----------
const NUM = [
  { d: 5, car: 'bmw', m: 'BMW 116i', e: '1.6 N13 · 2011 – 2015', k: 'la chaîne', v: "s'allonge", j: "jusqu'à", cost: '5 000 €', part: 'chain' },
  { d: 4, car: 'golf', m: 'Golf 6 · 1.4 TSI', e: '122 · 160 CH · 2008 – 2012', k: 'piston', v: 'fissuré', j: "jusqu'à", cost: '7 000 €', part: 'piston' },
  { d: 3, car: 'fiesta', m: 'Ford 1.0 EcoBoost', e: 'FIESTA · FOCUS · 2011 – 2018', k: 'il', v: 'chauffe', j: "jusqu'à", cost: '7 000 €', part: 'hose' },
  { d: 2, car: 'clio', m: 'Clio 4 · 1.2 TCe', e: 'CAPTUR · MÉGANE 3 · 2012 – 2016', k: 'il boit', v: 'son huile', j: "jusqu'à", cost: '10 000 €', part: 'dip' },
  { d: 1, car: 'p208', m: '1.2 PureTech', e: '208 · 2008 · 308 · 2013 – 2022', k: 'la courroie', v: "s'effrite", j: 'courroie', cost: '≈ 500 €', part: 'belt' },
];
NUM.forEach((n, i) => { n.t0 = K.N[i]; n.t1 = i < 4 ? K.N[i + 1] : K.six; });

// ---------- 3D ----------
const G = createStage(document.getElementById('gl'));
const { scene, camera, frame, world, M } = G;
// chaque pièce : un support animé (glissement, échelle) qui porte la pose de la DA
function holder(obj) { const h = new THREE.Group(); h.add(obj); world.add(h); h.visible = false; return h; }
const chainS = G.chainSet(); chainS.rotation.y = -.42; const hChain = holder(chainS);
const pist = G.pistonSet(); pist.position.set(0, 1.12, 0); pist.rotation.y = .5; const hPist = holder(pist);
const hoseG = new THREE.Group(); const hose = G.hoseSet(true); hose.position.set(0, 0, .55); hose.rotation.y = -.15; hoseG.add(hose);
const gauge = G.gaugeSet(.5); gauge.position.set(-.3, .9, -.75); gauge.rotation.y = .22; gauge.rotation.x = -.06; hoseG.add(gauge);
const stand = new THREE.Mesh(new THREE.CylinderGeometry(.05, .09, .5, 32), M.plastic); stand.position.set(-.3, .25, -.84); hoseG.add(stand); G.shadowAll(stand);
const hHose = holder(hoseG);
const dipG = new THREE.Group(); const dip = G.dipstickSet(); dip.scale.setScalar(.9); dipG.add(dip);
const tube = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .5, 24, 1, true), M.steel); tube.material.side = THREE.DoubleSide; dipG.add(tube); G.shadowAll(tube);
const oilDrop = new THREE.Mesh(new THREE.SphereGeometry(.035, 32, 16), M.oil); oilDrop.scale.set(1, 1.6, 1); dipG.add(oilDrop);
const oilPud = new THREE.Mesh(new THREE.CircleGeometry(.26, 64), M.oil); oilPud.rotation.x = -Math.PI / 2; dipG.add(oilPud);
const hDip = holder(dipG);
const beltS = G.beltSet(true, true); beltS.rotation.y = -.5; const hBelt = holder(beltS);
const HOLD = { chain: hChain, piston: hPist, hose: hHose, dip: hDip, belt: hBelt };
// cadrage de chaque numéro (DA) : [cible x, y, z, distance, élévation, azimut, FY]
const CAM = {
  hook: [0, .9, 0, 14, 12, 0, 900],
  chain: [0, 1.1, 0, 16.5, 12, 0, 875], piston: [0, .85, 0, 16, 12, 0, 850], hose: [0, .8, 0, 12.5, 9, 0, 860],
  dip: [0, .45, 0, 9, 14, 0, 800], belt: [.18, .95, 0, 18.5, 13, 0, 815], six: [0, .9, 0, 14, 12, 0, 900],
};
const camKeys = (() => {
  const seq = [[0, CAM.hook]]; NUM.forEach((n, i) => seq.push([n.t0 - 0.35, CAM[n.part]])); seq.push([K.six - 0.2, CAM.six]);
  const ks = []; for (let j = 0; j < 7; j++) ks.push(seq.map(([tt, c], i) => i === 0 ? [0, c[j]] : [tt, c[j], P.cam]));
  return ks;
})();
const CAM0 = CAM.hook;
function camAt(t) {
  const c = camKeys.map(k => track(t, k));
  const na = sm(0, 1.2, t) * (1 - sm(28.8, 29.9, t));
  c[5] += 3.2 * Math.sin(t * 0.55) * na + noise(5, t * .35) * 1.2 * na;   // dérive lente : la caméra ne s'arrête jamais
  c[4] += noise(6, t * .3) * .8 * na;
  const w = sm(K.out, 29.9, t); for (let j = 0; j < 7; j++) c[j] = lerp(c[j], CAM0[j], w);
  return c;
}
// pose fixe des pièces (DA) pour les ancres
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- DOM ----------
const bgCone = el('div', 'cone', stage);
const LCar = el('div', 'L', stage);          // grande voiture du numéro + reflet
const LUI = el('div', 'L', stage);           // bandeaux, palette, coûts
const svgT = sv('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, style: 'position:absolute;left:0;top:0;overflow:visible' }, stage);
const defs = sv('defs', {}, svgT);
const qg = sv('linearGradient', { id: 'qg', x1: 0, y1: 0, x2: 1, y2: 0.3 }, defs);
sv('stop', { offset: 0, 'stop-color': '#ff5a1f' }, qg); sv('stop', { offset: 0.55, 'stop-color': '#ff8a4c' }, qg); sv('stop', { offset: 1, 'stop-color': '#ffb38a' }, qg);
const glF = sv('filter', { id: 'gl', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
sv('feGaussianBlur', { stdDeviation: 10, result: 'b' }, glF); { const m = sv('feMerge', {}, glF); sv('feMergeNode', { in: 'b' }, m); sv('feMergeNode', { in: 'SourceGraphic' }, m); }
const lg = sv('filter', { id: 'lg', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
sv('feGaussianBlur', { stdDeviation: 4, result: 'b' }, lg); { const m = sv('feMerge', {}, lg); sv('feMergeNode', { in: 'b' }, m); sv('feMergeNode', { in: 'b' }, m); sv('feMergeNode', { in: 'SourceGraphic' }, m); }
const ink = sv('filter', { id: 'ink', x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs);
sv('feTurbulence', { type: 'fractalNoise', baseFrequency: '.06 .09', numOctaves: 3, seed: 4, result: 't' }, ink); sv('feDisplacementMap', { in: 'SourceGraphic', in2: 't', scale: 7, result: 'd' }, ink);
sv('feTurbulence', { type: 'fractalNoise', baseFrequency: '.8', numOctaves: 2, seed: 9, result: 'g' }, ink); sv('feColorMatrix', { in: 'g', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.55', result: 'm' }, ink); sv('feComposite', { in: 'd', in2: 'm', operator: 'in' }, ink);
const LTop = el('div', 'L', stage);          // étiquettes, fils, tampon (au-dessus des textes)
const svgL = sv('svg', { width: W, height: H, style: 'position:absolute;left:0;top:0;overflow:visible' }, LTop);
const grain = el('div', '', stage); grain.id = 'grain';
el('div', '', stage).id = 'vign';

// --- écriture à la lumière (recette MO6)
const cvm = document.createElement('canvas').getContext('2d');
function word(parent, str, font, size, cx, base, opts = {}) {
  cvm.font = font; const gap = size * 0.24; const items = []; let x = 0;
  for (const ch of str) { if (ch === ' ') { x += gap; continue; } const w = cvm.measureText(ch).width; items.push({ ch, x, w }); x += w + (opts.track || 0); }
  const left = opts.align === 'left' ? cx : cx - x / 2;
  const fam = font.split(' ').slice(-1)[0], wt = opts.italic ? 500 : font.split(' ')[0], it = opts.italic ? 'italic' : 'normal';
  const grp = sv('g', {}, parent);
  for (const g of items) {
    g.left = left + g.x; g.g = sv('g', {}, grp); const L = size * 7;
    g.stroke = sv('text', { x: g.left, y: base, 'font-family': fam, 'font-weight': wt, 'font-style': it, 'font-size': size, fill: 'none', stroke: opts.strokeColor || '#ffd9c2', 'stroke-width': opts.sw || 2.4, 'stroke-dasharray': `${L} ${L}`, 'stroke-dashoffset': L, 'stroke-linejoin': 'round' }, g.g);
    g.fill = sv('text', { x: g.left, y: base, 'font-family': fam, 'font-weight': wt, 'font-style': it, 'font-size': size, fill: opts.fill || '#f6efe7' }, g.g);
    g.stroke.textContent = g.ch; g.fill.textContent = g.ch; g.L = L;
  }
  return { items, left, width: x, grp, base };
}
// écrit le mot à partir de t0 (exact : arrivée cubique, pour la boucle)
function writeWord(w, t, t0, step = 0.05, dy = 26, exact = false) {
  w.items.forEach((g, i) => {
    const ts = t0 + i * step, dr = exact ? eo(ts, ts + 0.45, t) : S(t, ts, P.draw), fi = exact ? eo(ts + 0.12, ts + 0.55, t) : S(t, ts + 0.16, P.rise);
    g.stroke.setAttribute('stroke-dashoffset', f3(g.L * (1 - dr)));
    g.stroke.setAttribute('opacity', f3(sm(ts - 0.01, ts + 0.04, t) * (1 - 0.85 * fi)));
    g.fill.setAttribute('opacity', f3(fi));
    g.g.setAttribute('transform', `translate(0,${f3((1 - fi) * dy)})`);
  });
}
const IT = { italic: true, fill: 'url(#qg)', strokeColor: '#ffb38a', sw: 1.8 };
const txtShadow = 'filter:drop-shadow(0 0 26px rgba(255,120,50,.35)) drop-shadow(0 8px 18px rgba(0,0,0,.6))';

// --- hook : « 5 voitures à fuir » → « Pas la voiture. Le moteur. »
const gA = sv('g', { style: txtShadow }, svgT), gB = sv('g', { style: txtShadow }, svgT);
const wA = word(gA, '5 voitures', '700 120px Clash', 120, 540, 340);
const wB = word(gB, 'à fuir.', 'italic 500 170px Fraunces', 170, 540, 520, IT); wB.grp.setAttribute('filter', 'url(#gl)');
const gC = sv('g', { style: txtShadow }, svgT), gD = sv('g', { style: txtShadow }, svgT);
const wC = word(gC, 'Pas la voiture.', '700 104px Clash', 104, 540, 340);
cvm.font = '700 104px Clash'; const wLe = cvm.measureText('Le').width; cvm.font = 'italic 500 170px Fraunces'; const wMo = cvm.measureText('moteur.').width;
const dLeft = 540 - (wLe + 104 * 0.3 + wMo) / 2;
const wD1 = word(gD, 'Le', '700 104px Clash', 104, dLeft, 520, { align: 'left' });
const wD2 = word(gD, 'moteur.', 'italic 500 170px Fraunces', 170, dLeft + wLe + 104 * 0.3, 520, { ...IT, align: 'left' }); wD2.grp.setAttribute('filter', 'url(#gl)');
const vi = wC.items.slice(5, 12), sx0 = vi[0].left - 8, sx1 = vi[vi.length - 1].left + vi[vi.length - 1].w + 8;
const strike = sv('path', { d: `M${sx0} 312 C${sx0 + (sx1 - sx0) * .3} 300 ${sx0 + (sx1 - sx0) * .66} 308 ${sx1} 296`, stroke: '#ff5a1f', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round', filter: 'url(#gl)', 'stroke-dasharray': '900 900', 'stroke-dashoffset': 900 }, svgT);

// --- les cinq bandeaux du hook (phares), 5 → 1
const ORDER = ['bmw', 'golf', 'fiesta', 'clio', 'p208'];
const hookStrips = ORDER.map((k, i) => {
  const d = el('div', 'strip rev', LUI, `top:${640 + i * 166}px;height:150px;${phBg(k, 150, 1250, 20)}`);
  el('div', 'num', d).textContent = String(5 - i);
  const sw = el('div', 'sweep', d);
  const pin = el('div', 'pin', LUI, `left:${300}px;top:${640 + i * 166 + 60}px`);
  return { d, sw, pin };
});

// --- palette
const flapBox = el('div', 'flapbox', LUI);
const fTop = el('div', 'half top', flapBox), fBot = el('div', 'half bot', flapBox), vFront = el('div', 'half top', flapBox), vBack = el('div', 'half bot', flapBox);
const fs = [fTop, fBot, vFront, vBack].map(h => el('span', '', h));
const noLbl = el('div', 'no', LUI); noLbl.textContent = 'N°';
const FLIPS = [[NUM[0].t0, 5], [NUM[1].t0, 4], [NUM[2].t0, 3], [NUM[3].t0, 2], [NUM[4].t0 + 0.5, 1], [K.six, 6]];
function paintFlap(t) {
  let i = -1; for (let j = 0; j < FLIPS.length; j++) if (t >= FLIPS[j][0]) i = j;
  const cur = i < 0 ? 5 : FLIPS[i][1], prev = i <= 0 ? cur : FLIPS[i - 1][1];
  const p = i < 0 ? 1 : clamp((t - FLIPS[i][0]) / 0.34, 0, 1);
  // l'hésitation du n° 1 : le volet part, revient, puis tombe un demi-temps plus tard
  let hes = 0; if (t > NUM[4].t0 && t < NUM[4].t0 + 0.5) hes = Math.sin(Math.PI * clamp((t - NUM[4].t0) / 0.45, 0, 1)) * 38;
  fs[0].textContent = cur; fs[1].textContent = p < 1 ? prev : cur; fs[2].textContent = prev; fs[3].textContent = cur;
  const a1 = p < 0.5 ? -180 * p : -90, a2 = p < 0.5 ? 90 : 90 - 180 * (p - 0.5);
  vFront.style.transform = `rotateX(${f3(hes ? -hes : a1)}deg)`; vFront.style.visibility = (p < 0.5 && p < 1) || hes ? 'visible' : 'hidden';
  if (hes) { fs[2].textContent = cur === 1 ? 2 : prev; }
  vBack.style.transform = `rotateX(${f3(a2)}deg)`; vBack.style.visibility = p >= 0.5 && p < 1 ? 'visible' : 'hidden';
  if (hes) { fs[0].textContent = 2; fs[1].textContent = 2; }
}

// --- grande voiture du numéro (photo détourée + reflet + balayage lumineux masqué par la carrosserie)
const bigCars = ORDER.map(k => {
  const [, w, h] = PH[k], cw = 880, ch = cw * h / w;
  const box = el('div', 'car', LCar, `width:${cw}px;height:${ch * 2}px`);
  const img = el('img', '', box, `position:absolute;left:0;top:0;width:${cw}px`); img.src = url(k);
  const refl = el('img', '', box, `position:absolute;left:0;top:${ch}px;width:${cw}px;transform:scaleY(-1);transform-origin:50% 0;opacity:.16;-webkit-mask-image:linear-gradient(transparent 55%,#000);filter:blur(2px)`); refl.src = url(k);
  refl.style.transformOrigin = '50% 0'; refl.style.top = `${ch}px`; refl.style.transform = `translateY(${ch}px) scaleY(-1)`;
  const sweep = el('div', '', box, `position:absolute;left:0;top:0;width:${cw}px;height:${ch}px;-webkit-mask-image:url(${url(k)});-webkit-mask-size:${cw}px ${ch}px;mix-blend-mode:screen`);
  return { k, box, img, refl, sweep, cw, ch };
});

// --- bandeau du numéro (nom + photo) : la grande voiture vient s'y ranger
const strips = NUM.map(n => {
  const d = el('div', 'strip', LUI, `top:1110px;height:190px;${phBg(n.car, 190, 720, 470)}`);
  const tt = el('div', 't', d); const m = el('div', 'm n ext', tt); m.textContent = n.m; const e = el('div', 'e', tt); e.textContent = n.e;
  return { d, tt };
});

// --- étiquette reliée à la pièce
function mkPill(k, v) {
  const d = el('div', 'pill glass', LTop); el('div', 'sheen', d); const a = el('span', 'k', d); a.textContent = k; const b = el('span', 'v serif', d); b.textContent = v;
  const ln = sv('path', { stroke: '#ffb38a', 'stroke-width': 2.5, fill: 'none', filter: 'url(#lg)' }, svgL);
  const pin = el('div', 'pin', LTop); return { d, ln, pin };
}
const pills = NUM.map(n => mkPill(n.k, n.v));
const pillCrep = mkPill('crépine', 'bouchée');
const PILLPOS = [[640, 760], [600, 560], [560, 1000], [520, 560], [150, 540]];
pillCrep.pos = [610, 560];
function link(p, x, y, o, prog, pos) {
  set(p.d, o); set(p.pin, o * sm(0.2, 0.5, prog)); if (o < 0.002) { setA(p.ln, 0); return; }
  p.d.style.left = pos[0] + 'px'; p.d.style.top = pos[1] + 'px';
  p.pin.style.left = f3(x) + 'px'; p.pin.style.top = f3(y) + 'px';
  const bw = p.d.offsetWidth, bh = p.d.offsetHeight, l = pos[0], tp = pos[1];
  const bx = clamp(x, l + 30, l + bw - 30), by = y < tp ? tp : y > tp + bh ? tp + bh : tp + bh / 2;
  const ex = lerp(bx, x, prog), ey = lerp(by, y, prog);
  p.ln.setAttribute('d', `M${f3(bx)} ${f3(by)} Q${f3((bx + ex) / 2 + 40)} ${f3((by + ey) / 2)} ${f3(ex)} ${f3(ey)}`); setA(p.ln, o);
}

// --- compteurs à rouleaux
function mkRoll(parent, str) {
  const r = el('div', 'roll n ext lit', parent); const cols = [];
  let di = 0; const nd = [...str].filter(c => /\d/.test(c)).length;
  for (const ch of str) {
    if (/\d/.test(ch)) {
      const d = el('span', 'd', r); const g = el('span', 'ghost', d); g.textContent = '0';
      const col = el('span', 'col', d); const turns = 1 + (nd - 1 - di);
      for (let k = 0; k <= 10 * turns + +ch; k++) el('span', '', col).textContent = String(k % 10);
      cols.push({ col, steps: 10 * turns + +ch }); di++;
    } else if (ch === ' ') { const s = el('span', '', r, 'display:inline-block;width:.24em'); }
    else { const s = el('span', '', r); s.textContent = ch; if (ch === '€') s.style.marginLeft = '.12em'; }
  }
  return { r, cols };
}
function setRoll(R, p) { R.cols.forEach(c => { c.col.style.transform = `translateY(${f3(-110 * c.steps * p)}px)`; }); }
const costs = NUM.map(n => { const d = el('div', 'cost', LUI); const j = el('span', 'j', d); j.textContent = n.j; return { d, R: mkRoll(d, n.cost) }; });
const mention = el('div', 'mention', LUI); mention.textContent = 'Coûts : ordres de grandeur relevés · presse spécialisée et propriétaires';

// --- vapeur (n° 3)
const wisps = [0, 1, 2].map(() => el('div', 'wisp', LTop));

// --- la chute : la 208, la facture, les autres qui s'écartent, le tampon
const LCh = el('div', 'L', stage); stage.insertBefore(LCh, LUI);
const chOthers = [['bmw', -1, 560, 520, .6], ['golf', 1, 590, 520, .6], ['fiesta', -1, 760, 470, .45], ['clio', 1, 790, 470, .45]].map(([k, side, y, w, o]) => {
  const im = el('img', '', LCh, `position:absolute;left:0;top:${y}px;width:${w}px`); im.src = url(k); return { im, side, w, o };
});
const chGlow = el('div', 'glow', LCh, 'left:240px;top:840px;width:600px;height:160px;background:rgba(255,110,40,.35)');
const ch208r = el('img', '', LCh, 'position:absolute;left:170px;top:0;width:740px;opacity:.18;-webkit-mask-image:linear-gradient(transparent 55%,#000);filter:blur(2px)'); ch208r.src = url('p208');
const ch208 = el('img', '', LCh, 'position:absolute;left:170px;top:0;width:740px;transform-origin:370px 450px;filter:drop-shadow(0 30px 40px rgba(0,0,0,.8))'); ch208.src = url('p208');
const ch208s = el('div', '', LCh, `position:absolute;left:170px;top:0;width:740px;height:${740 * 1118 / 1833}px;transform-origin:370px 450px;-webkit-mask-image:url(${url('p208')});-webkit-mask-size:100% 100%;mix-blend-mode:screen;opacity:.5`);
const fact = el('div', 'glass', LCh, 'left:190px;top:1030px;width:700px;height:400px;padding:38px 46px');
fact.innerHTML = `<div class="sheen"></div><div style="display:flex;justify-content:space-between;font:700 24px Satoshi;letter-spacing:5px;color:rgba(246,239,231,.6)"><span>FACTURE · 208 1.2 PURETECH</span><span style="letter-spacing:3px;color:rgba(246,239,231,.45)">EXEMPLE</span></div>
<div class="fr" style="display:flex;justify-content:space-between;margin-top:30px;font:500 32px Satoshi;color:rgba(246,239,231,.85)"><span>Kit courroie + pompe à eau</span><span class="n" style="font-size:34px">322 €</span></div>
<div class="fr" style="display:flex;justify-content:space-between;margin-top:16px;font:500 32px Satoshi;color:rgba(246,239,231,.85)"><span>Main-d'œuvre</span><span class="n" style="font-size:34px">190 €</span></div>
<div class="fl" style="height:2px;margin:26px 0 18px;background:linear-gradient(90deg,rgba(255,179,138,.7),rgba(255,179,138,.1));transform-origin:0 50%"></div>
<div class="fr" style="display:flex;justify-content:space-between;align-items:baseline"><span style="font:700 34px Satoshi">Courroie changée</span><span class="n ext lit" style="font-size:96px">512 €</span></div>`;
const fRows = [...fact.querySelectorAll('.fr')], fLine = fact.querySelector('.fl');
const stamp = el('div', 'abs', LTop, 'left:560px;top:930px;filter:url(#ink)');
const stampIn = el('div', '', stamp, 'padding:8px 34px 18px;border:7px solid #ff5a1f;border-radius:22px;font:italic 500 120px/1 Fraunces;color:#ff5a1f;transform-origin:50% 50%');
stampIn.textContent = 'affaire';
const flash = el('div', 'L', stage, 'background:radial-gradient(60% 40% at 50% 45%,rgba(255,170,110,.5),rgba(255,120,50,0));mix-blend-mode:screen;pointer-events:none');
stage.appendChild(grain); stage.appendChild(document.getElementById('vign'));

// ---------- projection d'un point 3D d'une pièce ----------
const proj = (obj, local) => { obj.updateMatrixWorld(true); const p = local.clone().applyMatrix4(obj.matrixWorld).project(camera); return [(p.x * .5 + .5) * W, (-p.y * .5 + .5) * H]; };

// ---------- peinture ----------
function paint(t) {
  const tL = t < 15 ? t + DUR : t;   // tout ce qui revient à l'image 0 se lit sur ce temps : image 0 = image 30 s

  // --- caméra
  const c = camAt(t); frame(v3(c[0], c[1], c[2]), c[3], c[4], c[5], c[6]);
  bgCone.style.transform = `translateX(${f3(Math.sin(2 * Math.PI * t / DUR) * 40)}px)`;

  // --- hook
  const hOut = t < 15 ? S(t, K.cross, P.out) : 1;
  const inA = t < 15 ? 1 : 0;
  // « 5 voitures à fuir » : présent à l'image 0, sort à 2,0 s, se réécrit pendant le retour (exact pour la boucle)
  if (t < 15) { writeWord(wA, tL, K.loopIn, 0.04, 22, true); writeWord(wB, tL, K.loopIn + 0.35, 0.05, 22, true); }
  else { writeWord(wA, t, K.loopIn, 0.04, 22, true); writeWord(wB, t, K.loopIn + 0.35, 0.05, 22, true); }
  const aOut = t < 15 ? S(t, K.cross - 0.1, P.out) : 0;
  gA.setAttribute('transform', `translate(0,${f3(-60 * aOut)})`); setA(gA, (1 - aOut) * (t < 15 || t > K.out ? 1 : 0));
  gB.setAttribute('transform', `translate(0,${f3(-60 * aOut)})`); setA(gB, (1 - aOut) * (t < 15 || t > K.out ? 1 : 0));
  writeWord(wC, t, K.cross + 0.05, 0.035, 22); writeWord(wD1, t, K.moteur, 0.05, 22); writeWord(wD2, t, K.moteur + 0.12, 0.05, 22);
  strike.setAttribute('stroke-dashoffset', f3(900 * (1 - S(t, K.cross + 0.65, P.pen))));
  const cdOut = sm(K.hookOut, K.hookOut + 0.45, t);
  const cdOn = t > K.cross - 0.1 && t < 15 ? 1 : 0;
  gC.setAttribute('transform', `translate(0,${f3(-80 * cdOut)})`); setA(gC, cdOn * (1 - cdOut));
  gD.setAttribute('transform', `translate(0,${f3(-80 * cdOut)})`); setA(gD, cdOn * (1 - cdOut));
  setA(strike, cdOn * (1 - cdOut));
  const push = t < 15 ? 1 + 0.035 * sm(0, K.hookOut, t) : 1;
  LUI.style.transformOrigin = '540px 900px'; LUI.style.transform = t < K.hookOut + 0.6 ? `scale(${f3(push)})` : 'none';
  for (const g of [gA, gB, gC, gD]) g.style.transformOrigin = '540px 900px';
  // bandeaux : entrent pendant le retour (lus sur tL), sortent vers la gauche à 3,5 s
  hookStrips.forEach((s, i) => {
    const inn = eo(K.loopIn + 0.1 + i * 0.09, K.loopIn + 0.75 + i * 0.09, tL);
    const out = t < 15 ? S(t, K.hookOut + i * 0.06, P.out) : 0;
    const x = 1100 * (1 - inn) - 1300 * out;
    s.d.style.transform = `translateX(${f3(x)}px)`; set(s.d, (t < 15 || t > K.out) ? 1 : 0);
    const sp = (t - (K.sweep + i * 0.25)) / 0.55; s.sw.style.left = f3(-120 + 1100 * clamp(sp, 0, 1)) + 'px'; set(s.sw, sp > 0 && sp < 1 && t < 15 ? 1 : 0);
    set(s.pin, fade(t, K.moteur + 0.1 + i * 0.06, K.moteur + 0.25 + i * 0.06, K.hookOut + i * 0.06, K.hookOut + 0.2 + i * 0.06));
    s.pin.style.transform = `translateX(${f3(-1300 * out)}px)`;
  });

  // --- palette (apparaît au n° 5, reste jusqu'à la sortie)
  const flIn = S(t, NUM[0].t0 - 0.15, P.card), flOut = S(t, K.out, P.out);
  flapBox.style.transform = `translateY(${f3(-260 * (1 - flIn) - 560 * flOut)}px)`; set(flapBox, sm(NUM[0].t0 - 0.2, NUM[0].t0, t) * (1 - flOut));
  noLbl.style.transform = flapBox.style.transform; set(noLbl, sm(NUM[0].t0, NUM[0].t0 + 0.2, t) * (1 - flOut));
  paintFlap(t);

  // --- les numéros
  for (const h of Object.values(HOLD)) h.visible = false;
  NUM.forEach((n, i) => {
    const t0 = n.t0, a = t - t0, car = bigCars[i], strip = strips[i], last = i === 4;
    const tEx = t0 + D.exit + (last ? 0.1 : 0);
    // grande voiture : entre par la droite, balayage, devient transparente, se range dans le bandeau
    const cin = S(t, t0 - 0.3, P.card), dock = S(t, t0 + D.dock, P.dock);
    const cx0 = (W - car.cw) / 2, cy0 = 1100 - car.ch;
    const sw = 720, sx = 110 + 470, sy = 1110 + 95 - PH[n.car][3] * (sw * car.ch / car.cw);
    const x = lerp(cx0 + 1150 * (1 - cin), sx, dock), y = lerp(cy0, sy, dock), sc = lerp(1, sw / car.cw, dock);
    car.box.style.transform = `translate(${f3(x)}px,${f3(y)}px) scale(${f3(sc)})`;
    const vis = a > -0.35 && a < D.dock + 0.9;
    car.box.style.visibility = vis ? 'visible' : 'hidden';
    car.img.style.opacity = f3(1 - 0.55 * sm(D.sweep + 0.25, D.sweep + 0.5, a) * (1 - dock));
    car.refl.style.opacity = f3(.16 * (1 - dock));
    car.box.style.opacity = f3(1 - sm(D.dock + 0.3, D.dock + 0.55, a));
    const swp = (a - D.sweep) / 0.45;
    car.sweep.style.background = `linear-gradient(90deg,transparent ${f3(swp * 140 - 40)}%,rgba(255,170,110,.85) ${f3(swp * 140 - 20)}%,rgba(255,250,240,1) ${f3(swp * 140 - 14)}%,rgba(255,170,110,.85) ${f3(swp * 140 - 8)}%,transparent ${f3(swp * 140 + 10)}%)`;
    car.sweep.style.visibility = swp > 0 && swp < 1.2 ? 'visible' : 'hidden'; car.sweep.style.opacity = '.6';
    // bandeau
    const sIn = sm(D.dock + 0.25, D.dock + 0.5, a), sOut = S(t, tEx, P.out);
    strip.d.style.transform = `translateX(${f3(-1250 * sOut)}px)`; set(strip.d, sIn * (t < tEx + 1.2 ? 1 : 0));
    strip.tt.style.transform = `translateY(-50%) translateX(${f3(-40 * (1 - S(t, t0 + D.dock + 0.4, P.rise)))}px)`; set(strip.tt, S(t, t0 + D.dock + 0.4, P.rise));
    // pièce 3D : grandit dans le compartiment, monte au centre, part vers la gauche
    const h = HOLD[n.part], pIn = S(t, t0 + D.sweep + 0.1, P.part), pOut = S(t, tEx, P.out);
    if (a > D.sweep && t < tEx + 1.0) {
      h.visible = true; const s = lerp(.25, 1, pIn);
      h.scale.setScalar(Math.max(s, .001)); h.position.set(-4.5 * pOut, .35 * (1 - pIn), 0); h.rotation.y = -.5 * (1 - pIn) + .25 * pOut;
    }
    // étiquette
    const po = fade(t, t0 + D.defect, t0 + D.defect + 0.15, tEx - 0.1, tEx + 0.15), pr = S(t, t0 + D.defect + 0.08, P.pen);
    const pp = pills[i];
    let anc = null;
    if (h.visible) {
      if (n.part === 'chain') { const lp = chainS.userData.lp; const q = lp.at(lp.L * .5 + .5).p; anc = proj(chainS, v3(q.x - .05, q.y, .04)); }
      if (n.part === 'piston') anc = proj(pist, pist.userData.crack);
      if (n.part === 'hose') anc = proj(hose, hose.userData.leak);
      if (n.part === 'dip') anc = proj(dip, v3(1.86, 0, 0));
      if (n.part === 'belt') { const g = beltS.userData.gap; anc = proj(beltS, v3(g.x - .03, g.y, .07)); }
    }
    pp.d.style.transform = `translateY(${f3((1 - S(t, t0 + D.defect, P.pop)) * 26)}px)`;
    if (anc) link(pp, anc[0], anc[1], po, pr, PILLPOS[i]); else link(pp, 0, 0, 0, 0, PILLPOS[i]);
    if (last) {
      const po2 = fade(t, t0 + D.defect + 0.5, t0 + D.defect + 0.65, tEx - 0.1, tEx + 0.15);
      const a2 = h.visible ? proj(beltS, beltS.userData.strainer) : null;
      pillCrep.d.style.transform = `translateY(${f3((1 - S(t, t0 + D.defect + 0.5, P.pop)) * 26)}px)`;
      if (a2) link(pillCrep, a2[0], a2[1], po2, S(t, t0 + D.defect + 0.58, P.pen), pillCrep.pos); else link(pillCrep, 0, 0, 0, 0, pillCrep.pos);
    }
    // coût
    const co = costs[i], cIn = S(t, t0 + D.cost - 0.1, P.rise), cOut = S(t, tEx, P.out);
    co.d.style.transform = `translateX(-50%) translate(${f3(-1250 * cOut)}px,${f3(30 * (1 - cIn))}px)`; set(co.d, sm(t0 + D.cost - 0.15, t0 + D.cost + 0.05, t) * (t < tEx + 1.2 ? 1 : 0));
    setRoll(co.R, last ? eo(t0 + D.cost + 0.5, t0 + D.cost + 1.6, t) : eo(t0 + D.cost, t0 + D.cost + 1.25, t));
  });
  set(mention, fade(t, NUM[0].t0 + D.cost, NUM[0].t0 + D.cost + 0.3, K.six - 0.4, K.six - 0.1));

  // --- les défauts
  { // n° 5 : la chaîne défile, le brin gauche se détend et bat, claque
    const a = t - NUM[0].t0, bow = .03 + .06 * sm(D.defect, D.defect + 0.6, a) + .018 * Math.sin(a * 2 * Math.PI * 3.2) * sm(D.defect, D.defect + 0.4, a) * (1 - sm(3.2, 3.8, a));
    if (hChain.visible) chainS.userData.update(.22 * a + .12 * Math.max(0, a - D.defect), bow);
  }
  { // n° 4 : la fissure court sur la tête du piston
    const a = t - NUM[1].t0; if (hPist.visible) pist.userData.setCrack(eo(D.defect, D.defect + 0.7, a));
    pist.rotation.y = .5 + .15 * Math.sin(a * .8);
  }
  { // n° 3 : l'aiguille monte dans le rouge, une goutte perle et tombe, la vapeur monte
    const a = t - NUM[2].t0, v = lerp(.5, .93, eo(D.defect - 0.3, D.defect + 1.0, a)) + noise(31, t * 7) * .006 * sm(D.defect + 0.8, D.defect + 1, a);
    gauge.userData.setNeedle(v, .3 + .7 * sm(D.defect, D.defect + 1, a));
    const [d1, d2] = hose.userData.drops, cp = hose.userData.clamp;
    const g1 = eo(D.defect, D.defect + 0.6, a), fall = Math.max(0, a - (D.defect + 0.75));
    d1.scale.set(g1 + .001, 1.5 * g1 + .001, g1 + .001); d1.position.set(cp.x - .02, cp.y - .17 - 3.2 * fall * fall, cp.z + .04); d1.visible = d1.position.y > .02;
    d2.visible = false;
    hose.userData.puddle.scale.set(1.3 * (.3 + .7 * eo(D.defect + 1.0, D.defect + 2.0, a)), .8 * (.3 + .7 * eo(D.defect + 1.0, D.defect + 2.0, a)), 1);
    const wa = hHose.visible ? proj(hose, cp) : [0, 0];
    wisps.forEach((w, j) => { const ph = ((a - D.defect) * .7 + j / 3) % 1; const o = hHose.visible ? fade(a, D.defect, D.defect + 0.4, 3.2, 3.6) * Math.sin(Math.PI * clamp(ph, 0, 1)) * .55 : 0;
      w.style.transform = `translate(${f3(wa[0] + noise(40 + j, t * .8) * 30)}px,${f3(wa[1] - 40 - 260 * ph)}px) scale(${f3(.6 + ph)})`; set(w, o); });
  }
  { // n° 2 : la jauge sort du tube, son huile est sous le MIN, une goutte tombe
    const a = t - NUM[3].t0, out = eo(D.sweep + 0.4, D.defect + 0.4, a);
    dip.rotation.set(0, -.55, -.22); const dir = v3(1, 0, 0).applyEuler(dip.rotation);
    dip.position.set(-.75, .62, 0).addScaledVector(dir, -.9 * (1 - out));
    tube.visible = false;
    dip.updateMatrixWorld(true); const tip = v3(1.9, 0, 0).applyMatrix4(dip.matrix);
    const fall = Math.max(0, a - (D.defect + 0.9)), g1 = eo(D.defect + 0.3, D.defect + 0.8, a);
    oilDrop.scale.set(g1 + .001, 1.6 * g1 + .001, g1 + .001); oilDrop.position.set(tip.x, tip.y - .06 - 3.2 * fall * fall, tip.z); oilDrop.visible = oilDrop.position.y > .02 && g1 > .01;
    const pg = eo(D.defect + 1.2, D.defect + 2.0, a); oilPud.position.set(tip.x, .006, tip.z); oilPud.scale.set(1.3 * pg + .001, .8 * pg + .001, 1); oilPud.visible = pg > .01;
  }
  { // n° 1 : la courroie tourne dans l'huile, ses morceaux filent vers la crépine
    const a = t - NUM[4].t0; if (hBelt.visible) beltS.userData.update(.35 * a);
  }

  // --- la chute
  const six = K.six, cIn = S(t, six + 0.15, P.card), cOut = S(t, K.out, P.out);
  const onCh = t > six - 0.1 && t < 29.9;
  set(LCh, onCh ? 1 : 0);
  if (onCh) {
    const y208 = 530 + 600 * (1 - cIn), sc = (1 - .3 * cOut) * (1 + .05 * sm(six + 0.5, K.out, t));
    ch208.style.transform = `translate(${f3(-1300 * cOut)}px,${f3(y208 - 0)}px) scale(${f3(sc)})`; ch208.style.top = '0px';
    ch208s.style.transform = ch208.style.transform; { const swp = (t - (six + 1.3)) / 0.7; ch208s.style.background = `linear-gradient(90deg,transparent ${f3(swp * 140 - 40)}%,rgba(255,170,110,.8) ${f3(swp * 140 - 20)}%,rgba(255,250,240,1) ${f3(swp * 140 - 14)}%,rgba(255,170,110,.8) ${f3(swp * 140 - 8)}%,transparent ${f3(swp * 140 + 10)}%)`; ch208s.style.visibility = swp > 0 && swp < 1.2 ? 'visible' : 'hidden'; }
    ch208r.style.transform = `translate(${f3(-1300 * cOut)}px,${f3(y208 + 450 + 450 * 0)}px) scaleY(-1)`; ch208r.style.opacity = f3(.18 * cIn);
    ch208.style.opacity = f3(sm(six, six + 0.2, t));
    set(chGlow, sm(six + 0.3, six + 0.8, t) * (1 - cOut));
    const fu = S(t, K.fuit, { f: 0.9, z: 1 }), fu2 = S(t, K.fuit + 0.25, { f: 0.7, z: 1 });
    chOthers.forEach((o, j) => {
      const inn = S(t, K.fuit - 0.5 + j * 0.06, P.card);
      const base = o.side < 0 ? 40 : 1080 - o.w - 40, away = o.side < 0 ? -380 : 380;
      const xx = base + o.side * 700 * (1 - inn) + away * fu2 - 1300 * cOut;
      o.im.style.transform = `translateX(${f3(xx)}px)`; o.im.style.opacity = f3(o.o * inn * (1 - cOut));
      o.im.style.filter = `blur(${f3(3 + 10 * fu)}px) brightness(.75)`;
    });
    const fIn = S(t, K.fact, P.card);
    fact.style.transform = `translate(${f3(-1300 * cOut)}px,${f3((1 - fIn) * 320)}px) perspective(1200px) rotateX(${f3(14 * (1 - fIn))}deg)`;
    set(fact, sm(K.fact - 0.05, K.fact + 0.15, t));
    fRows.forEach((r, j) => { const p = S(t, K.fact + 0.35 + j * 0.28, P.rise); r.style.transform = `translateY(${f3((1 - p) * 18)}px)`; r.style.opacity = f3(p); });
    fLine.style.transform = `scaleX(${f3(S(t, K.fact + 0.8, P.pen))})`;
  }
  const st = S(t, K.affaire, { f: 2.4, z: 0.55 }), stOut = S(t, K.out, P.out);
  stampIn.style.transform = `rotate(-9deg) scale(${f3(lerp(2.4, 1, st))})`;
  stamp.style.transform = `translateX(${f3(-1300 * stOut)}px)`;
  set(stamp, sm(K.affaire - 0.02, K.affaire + 0.06, t) * (t < 29.9 ? 1 : 0));

  const pulse = (t0, a, k = 7) => (t > t0 ? a * Math.exp(-(t - t0) * k) : 0);
  set(flash, pulse(K.moteur + 0.2, .18) + NUM.reduce((s, n) => s + pulse(n.t0, .12, 9), 0) + pulse(K.affaire, .28, 6));
  const gn = Math.floor(t * 24) % 720; grain.style.transform = `translate(${(gn * 53) % 211}px,${(gn * 97) % 173}px)`;

  G.renderer.render(scene, camera);
}

// flou de bougé : entrées de voiture, rangements, sorties
const WIN = [[K.hookOut, K.hookOut + 0.7, 1], [K.loopIn, K.loopIn + 0.9, 0.8], [K.out, K.out + 0.6, 1], [K.fuit - 0.2, K.fuit + 0.9, 0.8]];
NUM.forEach((n, i) => { WIN.push([n.t0, n.t0 + 0.5, 1], [n.t0 + D.dock, n.t0 + D.dock + 0.6, 0.8], [n.t0 + D.exit, n.t0 + D.exit + 0.6, 1]); });
const fast = (t) => { let s = 0; for (const [a, b, v] of WIN) s = Math.max(s, v * sm(a - 0.05, a + 0.05, t) * (1 - sm(b - 0.05, b + 0.05, t))); return s; };
window.shutter = (t) => Math.max(0.1, fast(t));
window.samples = (t) => (fast(t) > 0.3 ? 4 : 1);
window.seek = (t) => paint(t >= DUR ? t - DUR : t);
window.K = K;
paint(0);
window.filmReady = true;
