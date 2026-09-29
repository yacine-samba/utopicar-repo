// UTOPICAR — film de lancement 15 s, 1080x1920, 24 i/s.
// Grammaire inspirée de la référence 1 (monochrome, 3D mate, profondeur de champ, halo, grain, texte fin mot à mot) ;
// contenu, formes et textes originaux. Contrat : window.seek(t) peint la frame t, aucune horloge, aucun état entre frames.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const { spring, track, clamp, lerp, noise } = Motion;
const TL = await (await fetch('../timeline-launch.json')).json();
const L = await (await fetch('../assets/ui/layout.json')).json();
const M = TL.marks, W = 1080, H = 1920;
const $ = s => document.querySelector(s);
const el = (tag, cls, parent, css) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); if (parent) parent.appendChild(e); return e; };
const px = v => v + 'px';
const smooth = (a, b, t) => { const x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }; // dérive continue de caméra (pas une entrée)
const bump = (t, c, w) => Math.exp(-(((t - c) / w) ** 2));

/* ---------------- panneaux : vrais extraits du site, composés dans un canvas ---------------- */
const loadImg = src => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
const IMG = { rapport: await loadImg('../assets/ui/rapport.png'), live: await loadImg('../assets/ui/live.png') };
const DPR = 3;
function panel(parts, w, h, bg, radius = 22) {
  const c = document.createElement('canvas'); c.width = w * DPR; c.height = h * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  g.beginPath(); g.roundRect(0, 0, w, h, radius); g.fillStyle = bg; g.fill(); g.clip();
  for (const p of parts) g.drawImage(IMG[p.src], p.r.x * DPR, p.r.y * DPR, p.r.w * DPR, p.r.h * DPR, p.x, p.y, p.r.w, p.r.h);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { tex, aspect: h / w };
}
const pad = (r, p) => ({ x: r.x - p, y: r.y - p, w: r.w + 2 * p, h: r.h + 2 * p });
// 1. verdict + « Il vous reste − 1 200 € »
const RT = L.shots.lgTotalNoV, rowR = { x: RT.x, y: RT.y + 16, w: RT.w, h: RT.h - 19 }, chipR = pad(L.verdict, 3);
const P1 = panel([{ src: 'rapport', r: chipR, x: 20, y: 22 }, { src: 'rapport', r: rowR, x: 20, y: 22 + chipR.h + 16 }], rowR.w + 40, 22 + chipR.h + 16 + rowR.h + 18, '#FFFFFF');
// 2. « Ne dépassez pas 7 500 € » (intérieur du bloc)
const PF = L.plafFig, PL = L.plafLabel, PR = L.shots.plafond;
const PC = { x: PR.x + 14, y: PR.y + 14, w: Math.max(PF.x + PF.w, PL.x + PL.w) + 4 - (PR.x + 14), h: PF.y + PF.h + 4 - (PR.y + 14) };
const P2 = panel([{ src: 'rapport', r: PC, x: 22, y: 22 }], PC.w + 44, PC.h + 44, '#F5F6F8');
// 3. annonce Clio : titre, fraîcheur, prix, cote, écart, « Vraie affaire »
const C = L.cote; let y3 = 22; const p3 = [];
for (const [r, gap] of [[C.title, 8], [C.ago, 22], [C.prix, 8], [C.cote, 4], [C.sous, 14], [pad(C.vraie, 2), 0]]) { p3.push({ src: 'live', r, x: 22, y: y3 }); y3 += r.h + gap; }
const P3 = panel(p3, Math.max(C.title.w, C.cote.w) + 44, y3 + 22, '#FFFFFF');

/* ---------------- 3D ---------------- */
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.Fog(0x050505, 14, 34);
const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 100);
scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a1a, 0.55));
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-4, 6, 6); scene.add(key);
const rim = new THREE.DirectionalLight(0xffffff, 1.1); rim.position.set(5, -2, -4); scene.add(rim);

// grande lumière douce de fond (texture radiale)
function radial(stops) { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); const gr = g.createRadialGradient(256, 256, 0, 256, 256, 256); stops.forEach(([o, a]) => gr.addColorStop(o, `rgba(255,255,255,${a})`)); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const glowMat = new THREE.MeshBasicMaterial({ map: radial([[0, 0.3], [0.35, 0.09], [1, 0]]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false });
const glow = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), glowMat); glow.position.set(-3.5, 5, -9); scene.add(glow);

const mkPanel = (P, width) => new THREE.Mesh(new THREE.PlaneGeometry(width, width * P.aspect), new THREE.MeshBasicMaterial({ map: P.tex, color: new THREE.Color(0.8, 0.8, 0.8), transparent: true, toneMapped: false, fog: false }));
const white = (o = 1, hdr = 2.6) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hdr, hdr, hdr), transparent: o < 1, opacity: o, toneMapped: false });

// plans 1–2 : anneau lumineux, traînée de lumière
const gIntro = new THREE.Group(); scene.add(gIntro);
const ring = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.007, 8, 420), white()); gIntro.add(ring);
const streak = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 16), white()); gIntro.add(streak);

// plan 3 : annonce (point lumineux en orbite) → verdict (arcs qui se referment)
const g3 = new THREE.Group(); scene.add(g3);
const pan1 = mkPanel(P1, 2.25); g3.add(pan1);
const arcMat = new THREE.MeshStandardMaterial({ color: 0x3c3c3c, roughness: 0.42, metalness: 0.15 });
const arcs = [1.42, 1.56, 1.7].map((r, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.055, 24, 160, 1.75), arcMat); g3.add(m); return m; });
const orbPath = new THREE.EllipseCurve(0, 0, 1.85, 0.95, 0, Math.PI * 2);
const orbPts = orbPath.getPoints(200).map(p => new THREE.Vector3(p.x, p.y * 0.6, p.y));
const ribbon = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(orbPts, true), 400, 0.006, 6, true), white(0.35)); g3.add(ribbon);
const orb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), white()); g3.add(orb);

// plan 4 : blocs mats qui s'alignent autour du prix max
const g4 = new THREE.Group(); scene.add(g4);
const pan2 = mkPanel(P2, 2.0); pan2.position.z = 0.6; g4.add(pan2);
const boxMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.78, metalness: 0.05 });
const blocks = [];
for (let i = 0; i < 14; i++) {
  const col = i % 2 ? 1 : -1, row = Math.floor(i / 2) - 3;
  const s = 0.5 + 0.16 * (0.5 + 0.5 * noise(i, 1.3));
  const b = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), boxMat);
  b.userData = { to: new THREE.Vector3(col * 1.32, row * 0.8, -0.6 - 0.5 * (0.5 + 0.5 * noise(i, 2.7))),
    from: new THREE.Vector3(col * (3 + 2 * (0.5 + 0.5 * noise(i, 4.1))), row * 1.6 + 2 * noise(i, 5.9), -9 - 5 * (0.5 + 0.5 * noise(i, 7.3))),
    rot: new THREE.Euler(noise(i, 8.1) * 2, noise(i, 9.4) * 2, noise(i, 3.3)), delay: 0.06 * i };
  g4.add(b); blocks.push(b);
}

// plan 5 : sphères sombres qui s'écartent et révèlent la bonne affaire
const g5 = new THREE.Group(); scene.add(g5);
const pan3 = mkPanel(P3, 2.15); pan3.material.color.setRGB(1, 1, 1); g5.add(pan3); // scène claire : carte à pleine luminosité pour se détacher du fond
const sphMat = new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.32, metalness: 0.25 });
const spheres = [];
for (let i = 0; i < 18; i++) {
  const r = 0.2 + 0.4 * (0.5 + 0.5 * noise(i, 11.2));
  const a = i * 2.39996, d = 0.7 + 1.5 * Math.sqrt((i + 0.5) / 18);
  const z = -3 + 8.5 * (0.5 + 0.5 * noise(i, 13.7));
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), sphMat);
  m.userData = { a, d, z, y: 1.3 * noise(i, 17.1) };
  g5.add(m); spheres.push(m);
}

/* ---------------- post-traitement ---------------- */
const composer = new EffectComposer(renderer);
composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bokeh = new BokehPass(scene, camera, { focus: 9, aperture: 0.0022, maxblur: 0.012 });
composer.addPass(bokeh);
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 1.0, 0.6, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());
// étalonnage monochrome + courbe douce + vignettage + exposition du flash
const grade = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uExpo: { value: 1 }, uVig: { value: 0.35 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uExpo; uniform float uVig; varying vec2 vUv;
    void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb; float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      l = l * uExpo; l = l / (1.0 + max(0.0, l - 1.0));
      l = mix(l, l * l * (3.0 - 2.0 * l), 0.35); l = 0.018 + l * 0.975;
      vec2 d = vUv - 0.5; d.x *= 0.7; float v = 1.0 - uVig * smoothstep(0.25, 0.8, length(d));
      gl_FragColor = vec4(vec3(l * v), 1.0); }`,
});
composer.addPass(grade);

/* ---------------- textes DOM ---------------- */
const TONE = { dark: '#D8D8D8', mid: '#F2F2F2', light: '#1A1A1A' };
const phrases = TL.phrases.map(P => {
  const d = el('div', 'phrase', $('#texts'), { top: px(P.y), color: TONE[P.tone] });
  const words = P.words.map((w, i) => { const s = el('span', null, d); s.textContent = w; if (i < P.words.length - 1) d.appendChild(document.createTextNode(' ')); return s; });
  return { ...P, d, words };
});
const voici = $('#voici'); const letters = [...'Voici'].map(ch => { const s = el('span', null, voici); s.textContent = ch; return s; });
const markSVG = L.logo.markHTML.replace(/^<span[^>]*>/, '').replace(/<\/span>$/, '');
for (const id of ['#logoDark', '#logoEnd']) { $(id + ' .mk').innerHTML = markSVG; $(id + ' .wd').textContent = L.logo.text || 'UTOPICAR'; }
$('#logoDark .mk svg').setAttribute('stroke', '#0A0A0A');
const cta = $('#cta'); const ctaWords = TL.cta.words.map((w, i) => { const s = el('span', w === TL.cta.strong ? 'strong' : null, cta); s.textContent = w; if (w === TL.cta.strong) el('br', null, cta); else if (i < TL.cta.words.length - 1) cta.appendChild(document.createTextNode(' ')); return s; });

await document.fonts.load("italic 300 70px 'Archivo'"); await document.fonts.load("800 92px 'Archivo'"); await document.fonts.ready;

/* ---------------- grain de film (seedé par numéro d'image) ---------------- */
const gc = $('#grain').getContext('2d'); const gImg = gc.createImageData(540, 960);
function grain(frame) {
  let s = (frame * 2654435761) >>> 0; const d = gImg.data;
  for (let i = 0; i < d.length; i += 4) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; const v = 128 + ((s & 255) - 128) * 0.9; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  gc.putImageData(gImg, 0, 0);
}

/* ---------------- seek ---------------- */
const show = (e, on) => { e.style.display = on ? '' : 'none'; };
// mot qui sort du flou : flou + opacité + glissement (jamais l'opacité seule)
function wordIn(e, t, t0, blur = 14, dx = 22) {
  const p = spring(t - t0, 'heavy');
  e.style.filter = `blur(${((1 - p) * blur).toFixed(2)}px)`;
  e.style.opacity = clamp(p * 1.3, 0, 1).toFixed(3);
  e.style.transform = `translateX(${((1 - p) * dx).toFixed(2)}px)`;
}
function lineOut(e, t, t0, blur = 16) {
  const q = clamp(spring(t - t0, 'default'), 0, 1);
  e.style.filter = `blur(${(q * blur).toFixed(2)}px)`; e.style.opacity = (1 - q).toFixed(3); e.style.transform = `translateY(${(-q * 10).toFixed(2)}px)`;
}
const gray = v => new THREE.Color(v, v, v);
const tmp = new THREE.Vector3();

function seek(t) {
  const frame = Math.round(t * TL.fps);
  /* fond, brouillard, halo, profondeur de champ selon la scène (sombre → gris moyen → gris clair) */
  const lum = track(t, [[0, 0.018], [M.shot4, 0.2, 'heavy'], [M.shot5, 0.74, 'heavy']]);
  scene.background = gray(lum); scene.fog.color.setRGB(lum, lum, lum);
  bloom.strength = track(t, [[0, 1.15], [M.shot4, 0.45, 'heavy'], [M.shot5, 0.1, 'heavy']]);
  glowMat.opacity = track(t, [[0, 0.0], [0.05, 0.55, 'heavy'], [M.logo, 0.8, 'default'], [M.shot3, 0.3, 'heavy'], [M.shot4, 0.25, 'heavy'], [M.shot5, 0.0, 'heavy']]);
  glow.position.x = -3.5 + 1.4 * Math.sin(t * 0.25);
  const shot = t < M.shot3 ? 1 : t < M.shot4 ? 3 : t < M.shot5 ? 4 : 5;
  gIntro.visible = shot === 1; g3.visible = shot === 3; g4.visible = shot === 4; g5.visible = shot === 5;

  /* caméra : dérive continue, jamais d'arrêt */
  let cp, look = new THREE.Vector3(0, 0, 0), focusOn = null;
  if (shot === 1) {
    cp = new THREE.Vector3(0.3 * Math.sin(t * 0.4), 0.15, lerp(9.4, 8.2, smooth(0, M.shot3, t)));
    ring.rotation.set(1.15 + 0.12 * Math.sin(t * 0.6), 0.35 + t * 0.22, t * 0.1);
    const rs = spring(t - 0.1, 'heavy'); ring.scale.setScalar(0.72 + 0.28 * rs); ring.material.opacity = 1;
    // point lumineux qui traverse l'anneau et éclate au logo
    const sp = smooth(M.streak - 0.1, M.logo, t);
    streak.position.set(lerp(-2.6, 0, sp), lerp(1.8, 0, sp), lerp(-3, 0.5, sp));
    const burst = bump(t, M.logo, 0.12);
    streak.scale.set(1 + 5 * (1 - sp) * (sp > 0 ? 1 : 0) + 7 * burst, 1 + 7 * burst, 1 + 7 * burst);
    streak.rotation.z = Math.atan2(1.8, 2.6);
    streak.visible = t > M.streak - 0.1 && t < M.logo + 0.35;
    focusOn = ring;
  } else if (shot === 3) {
    const k = smooth(M.shot3, M.shot4, t);
    cp = new THREE.Vector3(lerp(0.7, -0.25, k), lerp(0.35, -0.05, k), lerp(9.8, 8.4, k));
    const pp = spring(t - M.panel1, 'default');
    pan1.position.set(0, 0.25, lerp(-7, 0, pp)); pan1.rotation.set(0, lerp(-0.35, -0.06, pp), 0);
    arcs.forEach((a, i) => { const c = spring(t - (M.arcsClose - 0.55 + i * 0.12), 'default');
      a.position.set(0, 0.25, lerp(-2.5 - i, -0.4 - 0.18 * i, c)); a.rotation.set(0.25 - 0.08 * i, 0.1 * i, lerp(i * 2.1 + 1.2, i * 2.094 + 0.6, c) + t * 0.08 * (i % 2 ? -1 : 1)); a.scale.setScalar(lerp(1.35, 1, c)); });
    const oa = -0.4 + (t - M.shot3) * 1.6; orb.position.set(1.85 * Math.cos(oa), 0.95 * Math.sin(oa) * 0.6 + 0.25, 0.95 * Math.sin(oa));
    ribbon.rotation.set(0, 0, 0); ribbon.position.y = 0.25;
    focusOn = pan1;
  } else if (shot === 4) {
    const k = smooth(M.shot4, M.shot5, t);
    cp = new THREE.Vector3(lerp(1.1, -0.7, k), lerp(0.5, 0.1, k), lerp(9.4, 8.6, k));
    const pp = spring(t - M.panel2, 'default');
    pan2.position.set(0, lerp(-1.2, 0.1, pp), lerp(-3, 0.6, pp)); pan2.rotation.set(lerp(0.35, 0, pp), lerp(0.3, 0.05, pp), 0);
    blocks.forEach(b => { const U = b.userData; const c = spring(t - (M.shot4 + 0.15 + U.delay * 1.4), 'default');
      b.position.lerpVectors(U.from, U.to, c); b.rotation.set(U.rot.x * (1 - c), U.rot.y * (1 - c) + 0.12, U.rot.z * (1 - c)); });
    focusOn = pan2;
  } else {
    const k = smooth(M.shot5, M.flash + 0.4, t);
    cp = new THREE.Vector3(lerp(-0.4, 0.2, k), lerp(0.2, 0, k), lerp(10.2, 7.9, k));
    const pp = spring(t - M.shot5, 'default');
    pan3.position.set(0, 0.15, lerp(-2, 0, pp)); pan3.rotation.set(0, lerp(0.25, 0, pp), 0);
    const part = spring(t - M.part, 'default');
    spheres.forEach(s => { const U = s.userData; const d = U.d * lerp(0.55, 1.9, part);
      s.position.set(Math.cos(U.a + t * 0.07) * d, Math.sin(U.a + t * 0.07) * d * 1.45 + U.y * 0.3, U.z); });
    focusOn = pan3;
  }
  camera.position.copy(cp); camera.lookAt(look);
  focusOn.getWorldPosition(tmp);
  const fd = camera.position.distanceTo(tmp);
  // bascule de mise au point entre les scènes : flou large au passage
  const pull = Math.max(bump(t, M.shot3, 0.2), bump(t, M.shot4, 0.2), bump(t, M.shot5, 0.2));
  bokeh.uniforms.focus.value = fd + pull * 6;
  bokeh.uniforms.aperture.value = track(t, [[0, 0.0022], [M.shot5, 0.0036, 'heavy']]) * (1 + pull * 3);
  bokeh.uniforms.maxblur.value = 0.012 + pull * 0.02;
  grade.uniforms.uExpo.value = 1 + 3.5 * clamp(spring(t - (M.flash - 0.2), 'snappy'), 0, 1) * (t < M.end + 0.5 ? 1 : 0);
  grade.uniforms.uVig.value = track(t, [[0, 0.42], [M.shot5, 0.18, 'heavy']]);
  composer.render();

  /* textes */
  const vIn = t >= M.voici - 0.01 && t < M.voiciOut + 0.5;
  show(voici, vIn);
  if (vIn) { letters.forEach((s, i) => { wordIn(s, t, M.voici + 0.06 * i, 18, 0); s.style.transform += ` translateY(${((1 - spring(t - (M.voici + 0.06 * i), 'heavy')) * 14).toFixed(2)}px)`; });
    if (t >= M.voiciOut) lineOut(voici, t, M.voiciOut, 20); else Object.assign(voici.style, { filter: '', opacity: 1, transform: '' }); }
  const ld = $('#logoDark'); const lOn = t >= M.logo && t < M.logoOut + 0.5; show(ld, lOn);
  if (lOn) { const p = spring(t - M.logo, 'heavy');
    if (t < M.logoOut) Object.assign(ld.style, { filter: `blur(${((1 - p) * 26).toFixed(2)}px)`, opacity: clamp(p * 1.4, 0, 1), transform: `scale(${(1.08 - 0.08 * p + 0.012 * (t - M.logo)).toFixed(4)})` });
    else lineOut(ld, t, M.logoOut, 24); }
  phrases.forEach(P => { const on = t >= P.t - 0.01 && t < P.out + 0.6; show(P.d, on); if (!on) return;
    P.words.forEach((w, i) => wordIn(w, t, P.t + 0.2 * i));
    if (t >= P.out) lineOut(P.d, t, P.out); else Object.assign(P.d.style, { filter: '', opacity: 1, transform: '' }); });
  // flash : la caméra traverse la lumière, puis la fin sur fond clair
  const fl = clamp(spring(t - (M.flash - 0.1), 'snappy'), 0, 1) * (1 - clamp(spring(t - M.end, 'default'), 0, 1));
  show($('#flash'), fl > 0.001); $('#flash').style.opacity = fl.toFixed(3);
  const endOn = t >= M.end - 0.05; show($('#end'), endOn);
  if (endOn) {
    const p = spring(t - M.endLogo, 'heavy'); const le = $('#logoEnd');
    Object.assign(le.style, { filter: `blur(${((1 - p) * 16).toFixed(2)}px)`, opacity: clamp(p * 1.4, 0, 1) });
    ctaWords.forEach((w, i) => { show(w, t >= TL.cta.t + 0.2 * i - 0.01); wordIn(w, t, TL.cta.t + 0.2 * i); });
    $('#endIn').style.transform = `scale(${(1 + 0.025 * clamp((t - M.end) / (TL.dur - M.end), 0, 1)).toFixed(4)})`;
  }
  grain(frame);
}

window.TL = TL;
window.seek = seek;
seek(0);
window.filmReady = true;
if (!/render/.test(location.search)) { const t0 = performance.now(); const loop = () => { seek(((performance.now() - t0) / 1000) % TL.dur); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
