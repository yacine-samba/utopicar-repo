// UTOPICAR — film produit 30 s, 1080x1920, 30 i/s, 108 BPM.
// Grammaire inspirée de la référence 2 (fond clair, accent saturé en aplats et volets, mosaïque, mot-symbole tracé
// puis extrudé, survols 3D de la vraie interface, cartes épaisses, téléphone) ; contenu original, vraies captures.
// Contrat : window.seek(t) peint la frame t, aucune horloge, aucun état entre frames.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import * as OT from 'opentype';

const opentype = OT.parse ? OT : OT.default;
const { spring, track, clamp, lerp, noise } = Motion;
const TL = await (await fetch('../timeline-saas.json')).json();
const L = await (await fetch('../assets/ui/layout.json')).json();
const M = TL.marks, W = 1080, H = 1920, BEAT = 60 / TL.bpm, BAR = 4 * BEAT;
const $ = s => document.querySelector(s);
const el = (tag, cls, parent, css) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (parent) parent.appendChild(e); return e; };
const px = v => v + 'px';
const smooth = (a, b, t) => { const x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }; // travelling continu (pas une entrée)
const show = (e, on) => { e.style.display = on ? '' : 'none'; };
const YEL = '#FFC928';

/* ---------------- captures réelles ---------------- */
const loadImg = src => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
const IMG = {};
for (const k of ['scan', 'rapport', 'live', 'dash', 'launch']) IMG[k] = await loadImg(`../assets/ui/${k}.png`);
const DPR = 3;
// compose une carte à partir de morceaux de captures (px CSS), fond et coins arrondis
function compose(parts, w, h, bg = '#FFFFFF', radius = 18) {
  const c = document.createElement('canvas'); c.width = Math.round(w * DPR); c.height = Math.round(h * DPR);
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  g.beginPath(); g.roundRect(0, 0, w, h, radius); g.fillStyle = bg; g.fill(); g.clip();
  for (const p of parts) { const o = L.shots[p.src] || { x: 0, y: 0 }; g.drawImage(IMG[p.src], (p.r.x - (o.x || 0)) * DPR, (p.r.y - (o.y || 0)) * DPR, p.r.w * DPR, p.r.h * DPR, p.x, p.y, p.r.w, p.r.h); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { tex, w, h };
}
// texture d'une zone de page entière
function pageTex(src, y0, h) { return compose([{ src, r: { x: 0, y: y0, w: 390, h }, x: 0, y: 0 }], 390, h, '#F2F4F7', 0); }

/* ---------------- 3D ---------------- */
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 200);
scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 1.9));
const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(-3, 6, 9); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 40 }); sun.shadow.radius = 6; sun.shadow.bias = -0.0005;
scene.add(sun); scene.add(sun.target);
const shadowCatcher = (w, h, o = 0.16) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShadowMaterial({ opacity: o })); m.receiveShadow = true; return m; };

// plan texturé (interface à plat, couleurs exactes)
function plane(T, width) { const m = new THREE.Mesh(new THREE.PlaneGeometry(width, width * T.h / T.w), new THREE.MeshBasicMaterial({ map: T.tex })); return m; }
// carte épaisse : forme arrondie extrudée, face avant = capture, bords clairs
function thick(T, width, depth = 0.1, radius = 0.1, side = 0xEEEEEA) {
  const w = width, h = width * T.h / T.w, s = new THREE.Shape(), r = Math.min(radius, w / 2, h / 2);
  s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 10 });
  geo.translate(0, 0, -depth);
  const tex = T.tex.clone(); tex.needsUpdate = true; tex.repeat.set(1 / w, 1 / h); tex.offset.set(0.5, 0.5);
  const mesh = new THREE.Mesh(geo, [new THREE.MeshBasicMaterial({ map: tex }), new THREE.MeshStandardMaterial({ color: side, roughness: 0.6 })]);
  mesh.castShadow = true; return mesh;
}

// --- mot-symbole : vrais contours d'Archivo 800 / 125 %
const font = opentype.parse(await (await fetch('../assets/site/Archivo-800-125.ttf')).arrayBuffer());
const WORD = L.logo.text || 'UTOPICAR';
function shapesOf(path) {
  const sp = new THREE.ShapePath();
  for (const c of path.commands) {
    if (c.type === 'M') sp.moveTo(c.x, -c.y); else if (c.type === 'L') sp.lineTo(c.x, -c.y);
    else if (c.type === 'Q') sp.quadraticCurveTo(c.x1, -c.y1, c.x, -c.y); else if (c.type === 'C') sp.bezierCurveTo(c.x1, -c.y1, c.x2, -c.y2, c.x, -c.y);
  }
  return sp.toShapes(false);
}
const gWord = new THREE.Group(); scene.add(gWord);
{
  const path = font.getPath(WORD, 0, 0, 1, { letterSpacing: 0.02 }); const bb = path.getBoundingBox();
  const geo = new THREE.ExtrudeGeometry(shapesOf(path), { depth: 0.22, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 2, curveSegments: 8 });
  geo.translate(-(bb.x1 + bb.x2) / 2, (bb.y1 + bb.y2) / 2, 0);
  const s = 3.5 / (bb.x2 - bb.x1); geo.scale(s, s, s);
  const word3 = new THREE.Mesh(geo, [new THREE.MeshStandardMaterial({ color: 0x1b1b19, roughness: 0.5 }), new THREE.MeshStandardMaterial({ color: 0x3a3a36, roughness: 0.6 })]);
  word3.castShadow = true; word3.position.z = 0.02; gWord.add(word3);
  const band = new THREE.Mesh(new THREE.BoxGeometry(22, 1.5, 0.08), new THREE.MeshStandardMaterial({ color: YEL, roughness: 0.7 }));
  band.position.set(0, -0.95, -0.06); band.receiveShadow = true; gWord.add(band); gWord.userData.band = band;
  const floor = shadowCatcher(40, 40, 0.14); floor.position.z = -0.1; gWord.add(floor);
}

// --- survol de la page « Analyser » + bouton en relief
const gScan = new THREE.Group(); scene.add(gScan);
const SCAN = pageTex('scan', 0, 1400), scanW = 4.2; const scanPlane = plane(SCAN, scanW); gScan.add(scanPlane);
const scanH = scanW * SCAN.h / SCAN.w; const pageToWorld = (x, y, Wd, Hd, pw) => [(x / 390 - 0.5) * pw, (0.5 - y / Hd) * (pw * Hd / 390)];
const LA = L.shots.launch, AG = L.aGo;
const BTN = compose([{ src: 'launch', r: { x: AG.x, y: AG.y, w: AG.w, h: AG.h }, x: 0, y: 0 }], AG.w, AG.h, YEL, 11);
const button = thick(BTN, 2.2, 0.26, 0.28, 0xE5AE00); gScan.add(button);
const [bx, by] = pageToWorld(195, 1210, 390, 1400, scanW); button.position.set(bx, by, 0.3);
const scanShadow = shadowCatcher(scanW, scanH, 0.2); scanShadow.position.z = 0.002; gScan.add(scanShadow);

// --- cartes épaisses : verdict, total, plafond
const gCards = new THREE.Group(); scene.add(gCards);
const TK = L.tkTop, RT = L.shots.lgTotalNoV, PL = L.shots.plafond;
const cardVerdict = thick(compose([{ src: 'rapport', r: { x: TK.x - 16, y: TK.y - 14, w: TK.w + 32, h: TK.h + 28 }, x: 0, y: 0 }], TK.w + 32, TK.h + 28), 3.6, 0.14, 0.2);
const cardTotal = thick(compose([{ src: 'rapport', r: { x: RT.x - 16, y: RT.y + 14, w: RT.w + 32, h: RT.h - 2 }, x: 0, y: 0 }], RT.w + 32, RT.h - 2), 3.6, 0.14, 0.2);
const cardPlaf = thick(compose([{ src: 'rapport', r: PL, x: 0, y: 0 }], PL.w, PL.h, '#F5F6F8', 16), 3.6, 0.14, 0.2);
const cards3 = [cardVerdict, cardTotal, cardPlaf]; cards3.forEach(c => gCards.add(c));
const cardsShadow = shadowCatcher(30, 30, 0.22); cardsShadow.position.z = -1.2; gCards.add(cardsShadow);

// --- téléphone : boîtier générique + vraie page Recherche à l'écran ; la bonne affaire sort de l'écran
const gPhone = new THREE.Group(); scene.add(gPhone);
const pw = 2.3, ph = pw * 844 / 390 * 1.02;
{
  const s = new THREE.Shape(), w = pw + 0.16, h = ph + 0.16, r = 0.36;
  s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4, curveSegments: 16 }), new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.35, metalness: 0.4 }));
  body.position.z = -0.21; body.castShadow = true; gPhone.add(body);
}
const LIVE_H = Math.ceil(L.cardTop + 900);
const LIVE = pageTex('live', 0, LIVE_H); LIVE.tex.wrapT = THREE.ClampToEdgeWrapping;
const screenMat = new THREE.MeshBasicMaterial({ map: LIVE.tex });
const screen = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), screenMat); screen.position.z = 0.07; gPhone.add(screen);
const notch = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.17), new THREE.MeshBasicMaterial({ color: 0x0a0a0a })); notch.position.set(0, ph / 2 - 0.16, 0.075); gPhone.add(notch);
const C = L.cote;
const DEAL = compose([{ src: 'live', r: { x: 120, y: C.prix.y - 12, w: 250, h: C.sous.y + C.sous.h + 12 - (C.prix.y - 12) }, x: 0, y: 0 },
  { src: 'live', r: { x: C.vraie.x - 2, y: C.vraie.y - 2, w: C.vraie.w + 4, h: C.vraie.h + 4 }, x: 12, y: C.sous.y + C.sous.h + 18 - (C.prix.y - 12) }],
  250, C.sous.y + C.sous.h + 12 - (C.prix.y - 12) + C.vraie.h + 22);
const dealCard = thick(DEAL, 2.4, 0.12, 0.16); gPhone.add(dealCard);
const phoneShadow = shadowCatcher(30, 30, 0.22); phoneShadow.position.z = -1.0; gPhone.add(phoneShadow);

// --- tableau de bord : les KPI se soulèvent de la page
const gDash = new THREE.Group(); scene.add(gDash);
const DASH = pageTex('dash', 180, 820), dashW = 4.4; const dashPlane = plane(DASH, dashW); gDash.add(dashPlane);
const dashShadow = shadowCatcher(dashW, dashW * 820 / 390, 0.22); dashShadow.position.z = 0.002; gDash.add(dashShadow);
const kpiCards = [2, 4].map(i => { const R = L.kpiRects[i]; const T = compose([{ src: 'dash', r: R, x: 0, y: 0 }], R.w, R.h, '#FFFFFF', 18);
  const m = thick(T, R.w / 390 * dashW, 0.1, 0.16); const [x, y] = pageToWorld(R.x + R.w / 2, R.y + R.h / 2 - 180, 390, 820, dashW); m.position.set(x, y, 0.1); m.userData.base = [x, y]; gDash.add(m); return m; });

/* ---------------- post : profondeur de champ ---------------- */
const composer = new EffectComposer(renderer); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bokeh = new BokehPass(scene, camera, { focus: 10, aperture: 0.0018, maxblur: 0.01 }); composer.addPass(bokeh);
composer.addPass(new OutputPass());

/* ---------------- DOM : lueur, mosaïque, mot-symbole tracé, titres, fin ---------------- */
const markSVG = L.logo.markHTML.replace(/^<span[^>]*>/, '').replace(/<\/span>$/, '');
// mosaïque : carrés 120 px, opacités seedées, apparition depuis le centre
const mosaic = $('#mosaic'), sqs = [];
for (let r = 0; r < 16; r++) for (let c = 0; c < 9; c++) {
  const v = 0.5 + 0.5 * noise(r * 9 + c, 3.7); if (v < 0.45) continue;
  const s = el('div', 'sq', mosaic, { left: px(c * 120), top: px(r * 120), opacity: (0.25 + 0.6 * v).toFixed(2) });
  sqs.push({ s, d: Math.hypot(c * 120 + 60 - 540, r * 120 + 60 - 960) });
}
const tile = $('#tile'); Object.assign(tile.style, { left: '420px', top: '840px', width: '240px', height: '240px' }); tile.innerHTML = markSVG;
Object.assign(tile.firstChild.style, { width: '150px', height: '150px' }); mosaic.appendChild(tile);
// mot-symbole tracé au trait puis rempli (contours réels)
const draw = $('#draw');
const wPath = font.getPath(WORD, 0, 0, 150, { letterSpacing: 0.02 }); const wb = wPath.getBoundingBox();
const wScale = 860 / (wb.x2 - wb.x1), wx = 540 - (wb.x1 + wb.x2) / 2 * wScale, wy = 960 - (wb.y1 + wb.y2) / 2 * wScale;
const NS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('width', W); svg.setAttribute('height', H); draw.appendChild(svg);
const guides = [wb.y1, wb.y2].map(y => { const l = document.createElementNS(NS, 'line'); l.setAttribute('x1', 40); l.setAttribute('x2', 1040); l.setAttribute('y1', wy + y * wScale); l.setAttribute('y2', wy + y * wScale);
  l.setAttribute('stroke', '#E5AE00'); l.setAttribute('stroke-width', 3); l.setAttribute('stroke-dasharray', '14 12'); svg.appendChild(l); return l; });
const gp = document.createElementNS(NS, 'path'); gp.setAttribute('d', wPath.toPathData(3)); gp.setAttribute('transform', `translate(${wx} ${wy}) scale(${wScale})`);
gp.setAttribute('fill', '#141413'); gp.setAttribute('stroke', '#141413'); gp.setAttribute('stroke-width', (3 / wScale).toFixed(3)); gp.setAttribute('stroke-linejoin', 'round'); svg.appendChild(gp);
const gpLen = gp.getTotalLength();
// titres
const heads = TL.headlines.map(Hd => {
  const d = el('div', 'head', $('#heads'), { top: '760px' });
  const lines = Hd.lines.map(txt => { const ln = el('span', 'ln', d); const s = el('span', null, ln); const i = txt.indexOf(Hd.key);
    let mark = null;
    if (i >= 0) { s.appendChild(document.createTextNode(txt.slice(0, i))); const k = el('span', 'key', s); k.textContent = txt.slice(i, i + Hd.key.length); mark = el('span', 'mark', k); s.appendChild(document.createTextNode(txt.slice(i + Hd.key.length))); k.style.position = 'relative'; k.style.zIndex = 1; }
    else s.textContent = txt;
    return { s, mark }; });
  return { ...Hd, d, lines };
});
// fin : logo + CTA
$('#lock .mk').innerHTML = markSVG; $('#lock').style.top = '800px';
const cta = $('#cta'); const ctaL1 = el('span', 'ln', cta); const c1 = el('span', null, ctaL1); c1.innerHTML = `${TL.cta.pre} <span id="ctaPill">${TL.cta.word}</span>`;
const ctaL2 = el('span', 'ln', cta, { fontSize: '52px', color: '#5b5b55', marginTop: '10px' }); const c2 = el('span', null, ctaL2); c2.textContent = TL.cta.post;
// volets diagonaux
const wipes = [0, 1, 2].map(() => el('div', 'wipe', $('#wipes')));
function band(e, p, width = 900, ang = 0.62) { // bande diagonale : p = -1 (hors champ bas-gauche) → +1 (hors champ haut-droite)
  const span = 3200, c = p * span / 2; const dx = Math.cos(ang), dy = -Math.sin(ang);
  const cx = 540 + c * dx, cy = 960 + c * dy, nx = -dy, ny = dx, hw = width / 2, L2 = 3000;
  const pts = [[cx - dx * hw - nx * L2, cy - dy * hw - ny * L2], [cx + dx * hw - nx * L2, cy + dy * hw - ny * L2], [cx + dx * hw + nx * L2, cy + dy * hw + ny * L2], [cx - dx * hw + nx * L2, cy - dy * hw + ny * L2]];
  e.style.clipPath = `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
}

await document.fonts.load("800 124px 'Archivo'"); await document.fonts.load("italic 800 124px 'Archivo'"); await document.fonts.ready;

/* ---------------- seek ---------------- */
const tmp = new THREE.Vector3();
function lineIn(s, t, t0) { const p = spring(t - t0, 'heavy'); s.style.transform = `translateY(${((1 - p) * 110).toFixed(2)}%)`; }
function lineOut(s, t, t0) { const q = clamp(spring(t - t0, 'snappy'), 0, 1); return q; }

function seek(t) {
  /* --- couches DOM --- */
  // 1. lueur puis mosaïque
  const orbOn = t < M.mosaic + 0.15; show($('#orbL'), orbOn);
  if (orbOn) { const g = spring(t - 0.05, 'heavy'), pulse = 1 + 0.04 * Math.sin(t * 9);
    const d = (40 + 190 * g) * pulse, hd = (120 + 760 * g);
    Object.assign($('#orb').style, { width: px(d), height: px(d), marginLeft: px(-d / 2), marginTop: px(-d / 2), transform: `scale(${1 + 6 * clamp(spring(t - (M.mosaic - 0.12), 'snappy'), 0, 1)})` });
    Object.assign($('#halo').style, { width: px(hd), height: px(hd), marginLeft: px(-hd / 2), marginTop: px(-hd / 2) }); }
  const mosOn = (t >= M.mosaic && t < M.wipe1 + 0.5) || (t >= M.end && t < M.endWord);
  show(mosaic, mosOn);
  if (mosOn) { const t0 = t >= M.end ? M.end : M.mosaic;
    sqs.forEach(({ s, d }) => { const p = clamp(spring(t - t0 - d * 0.00045, 'snappy'), 0, 1.1); s.style.transform = `scale(${p.toFixed(3)})`; });
    const tp = spring(t - t0 - 0.05, 'heavy'); tile.style.transform = `scale(${(0.6 + 0.4 * tp).toFixed(3)})`;
    mosaic.style.transform = `scale(${(1 + 0.03 * (t - t0)).toFixed(4)})`; }
  // 2. volet diagonal → mot-symbole tracé puis rempli
  const drawOn = t >= M.wipe1 && t < M.extrude; show(draw, drawOn);
  if (drawOn) {
    guides.forEach((l, i) => { const p = smooth(M.wipe1 + 0.1 + 0.1 * i, M.wipe1 + 0.7 + 0.1 * i, t); l.setAttribute('stroke-dashoffset', 0); l.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`; l.style.opacity = 1 - smooth(M.fill, M.extrude, t); });
    const dp = smooth(M.draw, M.fill - 0.1, t); gp.setAttribute('stroke-dasharray', `${(gpLen * dp).toFixed(1)} ${gpLen}`);
    const fp = clamp(spring(t - M.fill, 'snappy'), 0, 1); gp.setAttribute('fill-opacity', fp.toFixed(3));
    svg.style.transform = `scale(${(1 + 0.02 * fp + 0.01 * (t - M.wipe1)).toFixed(4)})`; svg.style.transformOrigin = '540px 960px';
  }
  // volets : ouverture (mosaïque → mot-symbole) et fermeture (titre 2 → fin)
  const w1 = clamp(spring(t - (M.wipe1 - 0.2), 'default'), 0, 1.02);
  show(wipes[0], t >= M.wipe1 - 0.2 && t < M.wipe1 + 0.8); band(wipes[0], lerp(-1.2, 1.25, w1), 1100);
  const w2 = [0, 1].map(i => clamp(spring(t - (M.wipe2 + 0.09 * i), 'default'), 0, 1.02));
  show(wipes[1], t >= M.wipe2 && t < M.end); band(wipes[1], lerp(-1.2, 0.0, w2[0]), 1400);
  show(wipes[2], t >= M.wipe2 + 0.09 && t < M.end); band(wipes[2], lerp(-1.3, 0.35, w2[1]), 1600);
  // 3. titres
  heads.forEach(Hd => { const on = t >= Hd.t - 0.01 && t < Hd.out + 0.35; show(Hd.d, on); if (!on) return;
    const q = lineOut(null, t, Hd.out);
    Hd.lines.forEach((l, i) => { const p = spring(t - (Hd.t + 0.08 * i), 'heavy'); l.s.style.transform = `translateY(${((1 - p) * 110 - q * 110).toFixed(2)}%)`;
      if (l.mark) l.mark.style.transform = `scaleX(${clamp(spring(t - Hd.lines.length * 0 - (TL.marks[Hd === heads[0] ? 'h1mark' : 'h2mark']), 'snappy'), 0, 1).toFixed(3)})`; });
    Hd.d.style.transform = `scale(${(1 + 0.02 * (t - Hd.t)).toFixed(4)})`; });
  const headOn = heads.some(Hd => t >= Hd.t && t < Hd.out + 0.35); show($('#heads'), headOn);
  // 4. fin
  const endOn = t >= M.endWord - 0.01; show($('#endL'), endOn);
  if (endOn) { const mp = spring(t - M.endWord, 'snappy'), wp = spring(t - (M.endWord + 0.12), 'heavy');
    $('#lock .mk').style.transform = `scale(${(0.5 + 0.5 * mp).toFixed(3)})`;
    Object.assign($('#lock .wd').style, { clipPath: `inset(-20% ${((1 - wp) * 100).toFixed(2)}% -20% 0)`, transform: `translateX(${((1 - wp) * -30).toFixed(2)}px)` });
    lineIn(c1, t, M.cta); lineIn(c2, t, M.cta + 0.12);
    $('#endL').style.transform = `scale(${(1 + 0.02 * (t - M.endWord) / 3).toFixed(4)})`;
    // lueur finale derrière le logo
    const og = spring(t - M.orbEnd, 'heavy'); show($('#orbL'), t >= M.orbEnd);
    if (t >= M.orbEnd) { const d = 190 * og, hd = 700 * og; $('#orbL').style.zIndex = 0;
      Object.assign($('#orb').style, { width: px(d), height: px(d), marginLeft: px(-d / 2), marginTop: px(-d / 2), transform: 'none', left: '540px', top: '1500px' });
      Object.assign($('#halo').style, { width: px(hd), height: px(hd), marginLeft: px(-hd / 2), marginTop: px(-hd / 2), left: '540px', top: '1500px' }); }
  }
  $('#stage').style.background = t >= M.wipe1 && t < M.extrude ? '#FAF9F5' : '#FFFFFF';

  /* --- 3D --- */
  const shot = t >= M.extrude && t < M.fly ? 'word' : t >= M.fly && t < M.h1 ? 'scan' : t >= M.cards && t < M.phone ? 'cards' : t >= M.phone && t < M.dash ? 'phone' : t >= M.dash && t < M.h2 ? 'dash' : null;
  show(canvas, !!shot);
  if (!shot) return;
  gWord.visible = shot === 'word'; gScan.visible = shot === 'scan'; gCards.visible = shot === 'cards'; gPhone.visible = shot === 'phone'; gDash.visible = shot === 'dash';
  let focus = null; const look = new THREE.Vector3();
  if (shot === 'word') {
    scene.background = new THREE.Color('#FAF9F5');
    const k = smooth(M.extrude, M.fly, t), e = spring(t - M.extrude, 'heavy');
    gWord.rotation.set(-0.9 * e, 0, 0.78 * e); gWord.position.set(0, 0, 0);
    gWord.userData.band.scale.x = clamp(spring(t - (M.extrude + 0.15), 'default'), 0.001, 1);
    camera.position.set(lerp(-0.5, 0.4, k), lerp(-3.2, -2.4, k), lerp(12.5, 11.0, k)); look.set(0, lerp(-0.3, 0.0, k), 0); focus = gWord;
    sun.position.set(-4, 5, 9);
  } else if (shot === 'scan') {
    scene.background = new THREE.Color('#EDEAE2');
    gScan.rotation.set(t < M.button ? -0.72 : -0.45, 0, t < M.button ? 0.3 : 0.12);
    const k = smooth(M.fly, M.button, t), k2 = smooth(M.button, M.h1, t);
    const [ , yTop] = pageToWorld(195, 250, 390, 1400, scanW);
    const target = t < M.button ? lerp(yTop, by + 1.2, k) : lerp(by + 0.4, by, k2);
    tmp.set(t < M.button ? 0 : bx, target, 0); gScan.localToWorld(tmp); look.copy(tmp);
    const dist = t < M.button ? lerp(8.6, 7.4, k) : lerp(6.4, 5.4, k2);
    camera.position.set(look.x + (t < M.button ? 0.8 : 0.3), look.y - dist * (t < M.button ? 0.5 : 0.28), look.z + dist * (t < M.button ? 0.87 : 0.96));
    const press = t >= M.button ? clamp(spring(t - (M.press - 0.08), 'snappy') - spring(t - (M.press + 0.12), 'snappy'), 0, 1) : 0;
    const rise = clamp(spring(t - M.button, 'default'), 0, 1.05);
    button.position.z = 0.02 + 0.3 * rise - 0.22 * press; button.visible = t >= M.button - 0.3;
    focus = t < M.button ? scanPlane : button; sun.position.set(-3, 6, 9);
  } else if (shot === 'cards') {
    scene.background = new THREE.Color(YEL);
    const times = [M.card1, M.card2, M.card3];
    cards3.forEach((c, i) => { const p = spring(t - times[i], 'default');
      c.position.set(lerp(3.2 * (i % 2 ? 1 : -1), 0, p), lerp(-4, [2.3, 0.55, -1.3][i], p), lerp(-3, 0.25 * i, p));
      c.rotation.set(-0.35 + 0.1 * Math.sin(t * 0.8 + i), 0.28 * (i % 2 ? -1 : 1) * (1 - p) + 0.12 * Math.sin(t * 0.6 + i), -0.06 + 0.04 * i); c.visible = t >= times[i] - 0.01; });
    const k = smooth(M.cards, M.phone, t);
    camera.position.set(lerp(0.3, -0.3, k), lerp(-2.0, -1.4, k), lerp(14.2, 12.8, k)); look.set(0, lerp(0.35, 0.15, k), 0); focus = cards3[1];
    sun.position.set(-3, 6, 9);
  } else if (shot === 'phone') {
    scene.background = new THREE.Color(YEL);
    const e = spring(t - M.phone, 'default'), k = smooth(M.phone, M.dash, t);
    gPhone.rotation.set(-0.12 + 0.05 * Math.sin(t * 0.7), lerp(-0.9, 0.28, e) + 0.1 * k, lerp(0.1, -0.04, e)); gPhone.position.set(0, lerp(-3, 0, e), 0);
    // défilement réel de la page à l'écran
    const vis = 844 / LIVE_H, scrollCSS = track(t, [[0, 0], [M.phone + 0.6, L.cardTop - 60, 'default'], [M.pop - 0.6, L.cote.prix.y - 300, 'default']]);
    screenMat.map.repeat.set(1, vis); screenMat.map.offset.set(0, 1 - vis - scrollCSS / LIVE_H);
    const pp = spring(t - M.pop, 'default');
    dealCard.visible = t >= M.pop - 0.02; dealCard.position.set(lerp(0, 0.35, pp), lerp(-0.2, -0.6, pp), lerp(0.1, 1.9, pp)); dealCard.scale.setScalar(lerp(0.85, 1.12, pp));
    dealCard.rotation.set(0.08 * pp, -0.28 * pp, 0.03 * pp);
    camera.position.set(lerp(1.4, 0.6, k), lerp(-1.0, -0.4, k), lerp(12.5, 10.2, k)); look.set(0, 0, 0); focus = t >= M.pop ? dealCard : screen;
    sun.position.set(-3, 5, 10);
  } else if (shot === 'dash') {
    scene.background = new THREE.Color('#EDEAE2');
    gDash.rotation.set(-0.55, 0, -0.18);
    const k = smooth(M.dash, M.h2, t);
    kpiCards.forEach((c, i) => { const p = clamp(spring(t - [M.kpi1, M.kpi2][i], 'default'), 0, 1.05); c.position.z = 0.02 + 0.55 * p; c.rotation.x = 0.12 * p; });
    tmp.set(lerp(-0.6, 0.4, k), lerp(0.9, -0.2, k), 0); gDash.localToWorld(tmp); look.copy(tmp);
    camera.position.set(look.x - 0.4, look.y - 3.0, look.z + 7.4); focus = kpiCards[0];
    sun.position.set(-3, 6, 9);
  }
  camera.lookAt(look);
  focus.getWorldPosition(tmp);
  bokeh.uniforms.focus.value = camera.position.distanceTo(tmp);
  bokeh.uniforms.aperture.value = shot === 'word' ? 0.0012 : shot === 'scan' ? 0.0026 : 0.0018;
  composer.render();
}

window.TL = TL;
window.seek = seek;
seek(0);
window.filmReady = true;
if (!/render/.test(location.search)) { const t0 = performance.now(); const loop = () => { seek(((performance.now() - t0) / 1000) % TL.dur); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
