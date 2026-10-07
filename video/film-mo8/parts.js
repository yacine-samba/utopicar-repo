// MO8 : la scène 3D commune (un seul éclairage, une seule surface) et les pièces réalistes.
// Copie de film-mo8/da.html (DA validée), avec la chaîne et la courroie animables (update(phase, bow)).
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export { THREE };
export function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function createStage(canvas) {
// ---------- 3D : un seul éclairage, une seule surface ----------
const W = 1080, H = 1920;
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();

// fond : le même noir chaud que MO5/MO6
{ const c = document.createElement('canvas'); c.width = 270; c.height = 480; const g = c.getContext('2d');
  g.fillStyle = '#08070a'; g.fillRect(0, 0, 270, 480);
  const r = g.createRadialGradient(135, 200, 0, 135, 200, 260); r.addColorStop(0, '#1f1612'); r.addColorStop(.7, '#0b090b'); r.addColorStop(1, '#08070a');
  g.fillStyle = r; g.fillRect(0, 0, 270, 480);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }

// environnement : boîte à lumière orange en haut à gauche, liseré froid derrière, plafond très faible
{ const env = new THREE.Scene(); env.background = new THREE.Color(0x020202);
  const panel = (w, h, col, I, pos, look) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(I), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(...look); env.add(m); };
  panel(6, 4, 0xffa066, 5, [-6, 6, 5], [0, 0, 0]);         // boîte à lumière chaude, haut gauche
  panel(16, 9, 0xffd6bd, .9, [0, 2, 12], [0, 1, 0]);      // carton de remplissage derrière la caméra
  panel(1.2, 8, 0xa9c8ff, 2.6, [2.5, 2, -7], [0, 1, 0]);   // liseré froid derrière
  panel(10, 10, 0xffe6d4, .22, [0, 10, 0], [0, 0, 0]);     // plafond très faible
  panel(3, 1.5, 0xff7a3a, 1.0, [6, 1.5, 3], [0, 1, 0]);    // rebond orange à droite
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(env, 0.03).texture; scene.environmentIntensity = 0.9; }

const key = new THREE.SpotLight(0xffa36b, 260, 0, 0.42, 0.9, 2); key.position.set(-4.2, 6.5, 4.2);
key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.radius = 6; key.shadow.camera.near = 2; key.shadow.camera.far = 20;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0xa9c8ff, 3.6); rim.position.set(3.5, 3, -5); scene.add(rim);
scene.add(new THREE.HemisphereLight(0xffe2cc, 0x050404, 0.12));

// sol : reflet flou qui s'éteint vers les bords, ombre de contact, flaque de lumière chaude
const FLOOR_R = 7, floorParts = [];
{ const dark = new THREE.Mesh(new THREE.CircleGeometry(FLOOR_R, 96), new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    uniforms: { R: { value: FLOOR_R } }, vertexShader: 'varying vec2 p; void main(){ p=position.xy; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform float R; varying vec2 p; void main(){ float r=length(p)/R; gl_FragColor=vec4(0.012,0.010,0.011,0.55*(1.-smoothstep(.25,1.,r))); }' }));
  dark.rotation.x = -Math.PI / 2; dark.renderOrder = 1; scene.add(dark);
  const shader = { name: 'BlurFade', uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, R: { value: FLOOR_R } },
    vertexShader: `uniform mat4 textureMatrix; varying vec4 vUv; varying vec2 lp; void main(){ vUv=textureMatrix*vec4(position,1.); lp=position.xy; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 color; uniform sampler2D tDiffuse; uniform float R; varying vec4 vUv; varying vec2 lp;
      void main(){ vec2 uv=vUv.xy/vUv.w; vec3 acc=vec3(0.); float s=0.;
        for(int i=0;i<24;i++){ float a=float(i)*2.39996; float rr=sqrt(float(i)/24.)*0.006; vec2 o=vec2(cos(a),sin(a))*rr*vec2(1.,0.56); acc+=texture2D(tDiffuse,uv+o).rgb; s+=1.; }
        float r=length(lp)/R; float a=0.22*(1.-smoothstep(.0,.42,r));
        gl_FragColor=vec4(acc/s*color,a); }` };
  const refl = new Reflector(new THREE.CircleGeometry(FLOOR_R, 96), { shader, textureWidth: 540, textureHeight: 960, color: 0xffffff, clipBias: 0.002 });
  refl.material.transparent = true; refl.material.depthWrite = false; refl.rotation.x = -Math.PI / 2; refl.position.y = 0.001; refl.renderOrder = 2; scene.add(refl);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.7, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = 0.002; sh.receiveShadow = true; sh.renderOrder = 3; scene.add(sh);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(3, 64), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 p; void main(){ p=position.xy; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'varying vec2 p; void main(){ float r=length(p*vec2(1.,1.4))/3.; gl_FragColor=vec4(vec3(1.,.42,.16)*0.05*pow(1.-clamp(r,0.,1.),2.),1.); }' }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(-0.3, 0.003, 0.2); pool.renderOrder = 4; scene.add(pool); floorParts.push(dark, refl, sh, pool); }

// ---------- matières (textures de brossage déterministes) ----------
function brushed(kind, seed) {
  const N = 512, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = '#8c8c8c'; g.fillRect(0, 0, N, N);
  for (let i = 0; i < 2400; i++) { const v = 100 + r() * 90 | 0; g.strokeStyle = `rgba(${v},${v},${v},${.18 + r() * .25})`; g.lineWidth = .6 + r() * 1.4; g.beginPath();
    if (kind === 'radial') { const rad = r() * N * .5, a = r() * 6.28; g.arc(N / 2, N / 2, rad, a, a + .4 + r() * 1.6); } else { const y = r() * N, x = r() * N; g.moveTo(x - 60 - r() * 200, y); g.lineTo(x + 60 + r() * 200, y); }
    g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const LIN = brushed('lin', 3), RAD = brushed('radial', 5);
const M = {
  steel: new THREE.MeshPhysicalMaterial({ color: 0xb2aea9, metalness: 1, roughness: .34, roughnessMap: RAD }),
  steelLin: new THREE.MeshPhysicalMaterial({ color: 0xa8a49f, metalness: 1, roughness: .3, roughnessMap: LIN }),
  plate: new THREE.MeshPhysicalMaterial({ color: 0x7d7975, metalness: 1, roughness: .28, roughnessMap: LIN }),
  roller: new THREE.MeshPhysicalMaterial({ color: 0xc9c4bd, metalness: 1, roughness: .22 }),
  alu: new THREE.MeshPhysicalMaterial({ color: 0xcfccc8, metalness: 1, roughness: .46, roughnessMap: RAD }),
  forged: new THREE.MeshPhysicalMaterial({ color: 0x8a857f, metalness: 1, roughness: .55 }),
  rubber: new THREE.MeshPhysicalMaterial({ color: 0x141313, metalness: 0, roughness: .62, clearcoat: .18, clearcoatRoughness: .5 }),
  plastic: new THREE.MeshPhysicalMaterial({ color: 0x221d1a, metalness: 0, roughness: .38, clearcoat: .5, clearcoatRoughness: .3 }),
  carbon: new THREE.MeshPhysicalMaterial({ color: 0x2b2420, metalness: .4, roughness: .82 }),
  handle: new THREE.MeshPhysicalMaterial({ color: 0xff6a24, metalness: 0, roughness: .34, clearcoat: .7, clearcoatRoughness: .2 }),
  hot: new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, .55, .25).multiplyScalar(10), toneMapped: false }),
  coolant: new THREE.MeshPhysicalMaterial({ color: 0xffb070, metalness: 0, roughness: .04, transmission: .92, thickness: .08, ior: 1.36, attenuationColor: new THREE.Color(0xff6a1a), attenuationDistance: .12, clearcoat: 1 }),
  oil: new THREE.MeshPhysicalMaterial({ emissive: 0x6a3006, emissiveIntensity: .6, color: 0xffd9a8, metalness: 0, roughness: .03, transmission: 1, thickness: .9, ior: 1.47, attenuationColor: new THREE.Color(0xa85a10), attenuationDistance: .55, clearcoat: 1, side: THREE.DoubleSide }),
  glassBox: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: .02, transmission: 1, thickness: .02, ior: 1.5, transparent: true, opacity: .25, side: THREE.DoubleSide, depthWrite: false }),
};
const HALO = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,170,110,1)'); r.addColorStop(.25, 'rgba(255,110,40,.45)'); r.addColorStop(1, 'rgba(255,90,31,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
function halo(parent, pos, size, o = .6) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: HALO, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: o })); sp.position.copy(pos); sp.scale.setScalar(size); parent.add(sp); return sp; }
const shadowAll = o => o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });

// ---------- boucle de transmission (chaîne ou courroie) : deux cercles + tangentes ----------
function loop(c1, r1, c2, r2, bow = 0) { // c1 en haut, c2 en bas (dans le plan xy) ; bow : brin gauche détendu
  const d = c1.distanceTo(c2), ny = (r1 - r2) / d, nx = Math.sqrt(1 - ny * ny);
  const aR = Math.atan2(ny, nx), aL = Math.atan2(ny, -nx);
  const P1 = new THREE.Vector2(c1.x + r1 * nx, c1.y + r1 * ny), P2 = new THREE.Vector2(c2.x + r2 * nx, c2.y + r2 * ny);
  const Q1 = new THREE.Vector2(c1.x - r1 * nx, c1.y + r1 * ny), Q2 = new THREE.Vector2(c2.x - r2 * nx, c2.y + r2 * ny);
  const segs = [
    { t: 'l', a: P2, b: P1 },
    { t: 'a', c: c1, r: r1, a0: aR, a1: aL },
    { t: 'l', a: Q1, b: Q2, bow },
    { t: 'a', c: c2, r: r2, a0: aL, a1: aR + Math.PI * 2 },
  ];
  segs.forEach(s => s.len = s.t === 'l' ? s.a.distanceTo(s.b) : s.r * (s.a1 - s.a0));
  const L = segs.reduce((a, s) => a + s.len, 0);
  function at(u) { u = ((u % L) + L) % L; for (const s of segs) { if (u <= s.len) {
      if (s.t === 'l') { const k = u / s.len, p = s.a.clone().lerp(s.b, k), t = s.b.clone().sub(s.a).normalize();
        if (s.bow) { const nrm = new THREE.Vector2(t.y, -t.x); p.addScaledVector(nrm, s.bow * Math.sin(Math.PI * k)); }
        return { p, t }; }
      const a = s.a0 + u / s.r; return { p: new THREE.Vector2(s.c.x + s.r * Math.cos(a), s.c.y + s.r * Math.sin(a)), t: new THREE.Vector2(-Math.sin(a), Math.cos(a)) };
    } u -= s.len; } }
  return { L, at };
}

// pignon de chaîne
function sprocket(N, p, th, holes = 0) {
  const R = p / (2 * Math.sin(Math.PI / N)), rr = .32 * p, Rt = R + .34 * p, sh = new THREE.Shape();
  for (let i = 0; i < N; i++) {
    const a = i * 2 * Math.PI / N, cx = R * Math.cos(a), cy = R * Math.sin(a);
    for (let k = 0; k <= 8; k++) { const f = a + Math.PI + 1.25 - 2.5 * k / 8, x = cx + rr * Math.cos(f), y = cy + rr * Math.sin(f); i === 0 && k === 0 ? sh.moveTo(x, y) : sh.lineTo(x, y); }
    const am = a + Math.PI / N; for (const da of [-.045, .045]) sh.lineTo(Rt * Math.cos(am + da * 12 / N), Rt * Math.sin(am + da * 12 / N));
  }
  sh.closePath();
  const hole = new THREE.Path(); hole.absarc(0, 0, R * .16, 0, Math.PI * 2, true); sh.holes.push(hole);
  for (let i = 0; i < holes; i++) { const a = i * 2 * Math.PI / holes + .4, h = new THREE.Path(); h.absarc(Math.cos(a) * R * .52, Math.sin(a) * R * .52, R * .17, 0, Math.PI * 2, true); sh.holes.push(h); }
  const g = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: true, bevelThickness: .006, bevelSize: .006, bevelSegments: 2, curveSegments: 10 }); g.translate(0, 0, -th / 2);
  const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, M.steel));
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(R * .3, R * .3, th * 1.8, 48), M.steel); hub.rotation.x = Math.PI / 2; grp.add(hub);
  const bolt = new THREE.Mesh(new THREE.CylinderGeometry(R * .14, R * .14, th * 2.6, 6), M.steelLin); bolt.rotation.x = Math.PI / 2; grp.add(bolt);
  grp.userData.R = R; return grp;
}
// chaîne à rouleaux instanciée le long d'une boucle ; update(lp, phase) la fait défiler (phase = longueur parcourue)
function chain(lp0, p) {
  const n = Math.floor(lp0.L / p);
  const rl = .38 * p, ws = .2 * p, plate = new THREE.Shape();
  plate.absarc(0, 0, rl, Math.PI / 3, Math.PI * 5 / 3, false); plate.quadraticCurveTo(p / 2, -ws, p - rl * .5, -rl * .866);
  plate.absarc(p, 0, rl, -Math.PI * 2 / 3, Math.PI * 2 / 3, false); plate.quadraticCurveTo(p / 2, ws, rl * .5, rl * .866);
  const pg = new THREE.ExtrudeGeometry(plate, { depth: .1 * p, bevelEnabled: true, bevelThickness: .015 * p, bevelSize: .02 * p, bevelSegments: 2, curveSegments: 12 });
  const grp = new THREE.Group(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), qr = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), one = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3(), sc3 = new THREE.Vector3();
  const inner = new THREE.InstancedMesh(pg, M.plate, n), outer = new THREE.InstancedMesh(pg, M.plate, n);
  const rol = new THREE.InstancedMesh(new THREE.CylinderGeometry(.3 * p, .3 * p, .56 * p, 24), M.roller, n);
  const pin = new THREE.InstancedMesh(new THREE.CylinderGeometry(.15 * p, .15 * p, 1.12 * p, 16), M.steelLin, n);
  // la parité des maillons suit la phase : un pas de chaîne = deux maillons (intérieur, extérieur)
  function update(lp, phase) {
    const step = lp.L / n, k0 = Math.floor(phase / step), off = phase - k0 * step;
    const pts = []; for (let k = 0; k < n; k++) pts.push(lp.at(k * step + off).p);
    let ii = 0, oi = 0;
    for (let k = 0; k < n; k++) {
      const a = pts[k], b = pts[(k + 1) % n], ang = Math.atan2(b.y - a.y, b.x - a.x), sc = a.distanceTo(b) / p;
      m4.compose(v.set(a.x, a.y, 0), qr, one); rol.setMatrixAt(k, m4); pin.setMatrixAt(k, m4);
      q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), ang);
      const odd = ((k + k0) % 2 + 2) % 2 === 1, list = odd ? outer : inner, z = odd ? .4 * p : .29 * p;
      for (const sg of [-1, 1]) { m4.compose(v.set(a.x, a.y, sg * z - (sg < 0 ? .1 * p : 0)), q, sc3.set(sc, 1, 1)); list.setMatrixAt(odd ? oi++ : ii++, m4); }
    }
    inner.count = ii; outer.count = oi;
    for (const m of [inner, outer, rol, pin]) m.instanceMatrix.needsUpdate = true;
  }
  update(lp0, 0);
  grp.add(inner, outer, rol, pin); shadowAll(grp); grp.userData.update = update; return grp;
}
// rail de tension (plastique) le long du brin gauche
function guide(lp, u0, u1, off, w) {
  const sh = new THREE.Shape(), N = 30, a = [], b = [];
  for (let i = 0; i <= N; i++) { const { p, t } = lp.at(u0 + (u1 - u0) * i / N), nrm = new THREE.Vector2(-t.y, t.x); a.push(p.clone().addScaledVector(nrm, -off)); b.push(p.clone().addScaledVector(nrm, -off - .06)); }
  sh.moveTo(a[0].x, a[0].y); a.forEach(v => sh.lineTo(v.x, v.y)); b.reverse().forEach(v => sh.lineTo(v.x, v.y)); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: true, bevelThickness: .008, bevelSize: .008, bevelSegments: 2 }); g.translate(0, 0, -w / 2);
  return new THREE.Mesh(g, M.plastic);
}
function chainSet() {
  const p = .085, A = sprocket(36, p, .07, 5), B = sprocket(18, p, .07, 0), RA = A.userData.R, RB = B.userData.R;
  const cA = new THREE.Vector2(0, 1.66), cB = new THREE.Vector2(0, .5); A.position.set(cA.x, cA.y, 0); B.position.set(cB.x, cB.y, 0);
  const lp = loop(cA, RA, cB, RB, .07), grp = new THREE.Group();
  // aligne un creux de chaque pignon sur un rouleau
  const n = Math.floor(lp.L / p); const near = (c, R) => { let best; for (let k = 0; k < n; k++) { const q = lp.at(k * lp.L / n).p; if (Math.abs(q.distanceTo(c) - R) < .01) { best = q; break; } } return best; };
  const ra = near(cA, RA), rb = near(cB, RB); if (ra) A.rotation.z = Math.atan2(ra.y - cA.y, ra.x - cA.x); if (rb) B.rotation.z = Math.atan2(rb.y - cB.y, rb.x - cB.x);
  const ch = chain(lp, p); grp.add(A, B, ch);
  const a0 = A.rotation.z, b0 = B.rotation.z;
  grp.userData.update = (phase, bow) => { const l = loop(cA, RA, cB, RB, bow); ch.userData.update(l, phase); A.rotation.z = a0 + phase / RA; B.rotation.z = b0 + phase / RB; grp.userData.lp = l; };
  const g1 = guide(lp, lp.L * .5 + .12, lp.L * .5 + 1.05, .045, .1); grp.add(g1);
  const g2 = new THREE.Mesh(new RoundedBoxGeometry(.06, .8, .1, 3, .02), M.plastic); const pr = lp.at(.55).p; g2.position.set(pr.x + .09, pr.y, 0); g2.rotation.z = Math.atan2(lp.at(.6).t.y, lp.at(.6).t.x) - Math.PI / 2; grp.add(g2);
  shadowAll(grp); grp.userData.lp = lp; grp.userData.p = p; return grp;
}

// piston et bielle
function pistonSet() {
  const prof = [[0, .62], [.2, .628], [.36, .617], [.392, .6], [.392, .586], [.372, .586], [.372, .568], [.392, .568], [.392, .55], [.372, .55], [.372, .532], [.392, .532], [.392, .512], [.366, .512], [.366, .482], [.392, .482], [.39, .06], [.384, 0], [.34, 0], [.34, .36], [0, .41]].reverse().map(([x, y]) => new THREE.Vector2(x, y));
  const grp = new THREE.Group(), body = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), M.alu); grp.add(body);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(.355, .36, .012, 96), M.carbon); crown.position.y = .624; grp.add(crown);
  const wp = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .77, 32), M.steelLin); wp.rotation.z = Math.PI / 2; wp.position.y = .27; grp.add(wp);
  const rod = new THREE.Shape(); rod.absarc(0, .27, .17, 0, Math.PI * 2, false);
  const rs = new THREE.Shape(); rs.moveTo(-.11, .2); rs.lineTo(.11, .2); rs.lineTo(.17, -.62); rs.lineTo(-.17, -.62); rs.closePath();
  const big = new THREE.Shape(); big.absarc(0, -.8, .3, 0, Math.PI * 2, false);
  for (const s of [rod, rs, big]) { const g = new THREE.ExtrudeGeometry(s, { depth: .13, bevelEnabled: true, bevelThickness: .015, bevelSize: .015, bevelSegments: 2, curveSegments: 32 }); g.translate(0, 0, -.065); grp.add(new THREE.Mesh(g, M.forged)); }
  const bore = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .16, 48), M.steelLin); bore.rotation.x = Math.PI / 2; bore.position.y = -.8; grp.add(bore);
  // fissure lumineuse sur la tête
  const r = rng(11), pts = []; for (let i = 0; i <= 14; i++) { const a = -.5 + i * .07, y = .6 - i * .009 + (r() - .5) * .012; pts.push(new THREE.Vector3(Math.sin(a) * .394, y, Math.cos(a) * .394)); }
  const crack = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, .006, 6), M.hot); grp.add(crack);
  grp.userData.crack = pts[7].clone(); shadowAll(grp); crack.castShadow = false;
  const hs = pts.filter((p, i) => i % 3 === 0).map(p => halo(grp, p, .14, .45));
  const total = crack.geometry.index.count;
  grp.userData.setCrack = (k) => { crack.geometry.setDrawRange(0, Math.floor(total * k / 6) * 6); crack.visible = k > 0.01; hs.forEach((h, i) => { h.material.opacity = .45 * Math.max(0, Math.min(1, k * hs.length - i)); }); };
  return grp;
}

// durite (nervurée), colliers, embouts alu, fuite de liquide
function hoseSet(withLeak = true) {
  const pts = [[-1.15, .62, .1], [-.7, .74, .25], [-.15, .58, .38], [.45, .82, .2], [1.05, .86, -.05]].map(a => new THREE.Vector3(...a));
  const curve = new THREE.CatmullRomCurve3(pts), g = new THREE.TubeGeometry(curve, 240, .13, 48, false);
  const pos = g.attributes.position, nor = g.attributes.normal, v = new THREE.Vector3(), nn = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) { const ring = Math.floor(i / 49), u = ring / 240, rib = .006 * Math.pow(Math.max(0, Math.sin(u * 240 * .55)), 3) * (u > .08 && u < .92 ? 1 : 0);
    v.fromBufferAttribute(pos, i); nn.fromBufferAttribute(nor, i); v.addScaledVector(nn, rib); pos.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals();
  const grp = new THREE.Group(); grp.add(new THREE.Mesh(g, M.rubber));
  for (const u of [0, 1]) {
    const p = curve.getPointAt(u), t = curve.getTangentAt(u), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), t);
    const stub = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .36, 48), M.alu); stub.quaternion.copy(q); stub.position.copy(p).addScaledVector(t, u ? .17 : -.17); grp.add(stub);
    const fl = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .04, 48), M.alu); fl.quaternion.copy(q); fl.position.copy(p).addScaledVector(t, u ? .34 : -.34); grp.add(fl);
    const cp = curve.getPointAt(u ? .965 : .035), ct = curve.getTangentAt(u ? .965 : .035), cq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), ct);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(.148, .148, .05, 48, 1, true), M.steelLin); band.material.side = THREE.DoubleSide; band.quaternion.copy(cq); band.position.copy(cp); grp.add(band);
    const scr = new THREE.Mesh(new RoundedBoxGeometry(.07, .06, .16, 2, .012), M.steelLin); scr.quaternion.copy(cq); scr.position.copy(cp).add(new THREE.Vector3(0, .16, 0)); grp.add(scr);
  }
  shadowAll(grp);
  if (withLeak) {
    const cp = curve.getPointAt(.965);
    const d1 = new THREE.Mesh(new THREE.SphereGeometry(.03, 32, 16), M.coolant); d1.scale.set(1, 1.5, 1); d1.position.set(cp.x - .02, cp.y - .17, cp.z + .04); grp.add(d1);
    const d2 = new THREE.Mesh(new THREE.SphereGeometry(.024, 32, 16), M.coolant); d2.scale.set(1, 1.7, 1); d2.position.set(cp.x - .02, cp.y - .5, cp.z + .04); grp.add(d2);
    const pud = new THREE.Mesh(new THREE.CircleGeometry(.3, 64), M.coolant); pud.rotation.x = -Math.PI / 2; pud.scale.set(1.3, .8, 1); pud.position.set(cp.x - .02, .006, cp.z + .04); grp.add(pud);
    grp.userData.leak = new THREE.Vector3(cp.x, cp.y - .1, cp.z); grp.userData.drops = [d1, d2]; grp.userData.puddle = pud; grp.userData.clamp = cp.clone();
  }
  grp.userData.curve = curve; return grp;
}
// jauge de température réelle : cadran, aiguille, dôme de verre
function gaugeSet(val) {
  const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d');
  const rad = g.createRadialGradient(512, 470, 0, 512, 512, 520); rad.addColorStop(0, '#17141a'); rad.addColorStop(1, '#09080b'); g.fillStyle = rad; g.fillRect(0, 0, 1024, 1024);
  const A = v => (-210 + 240 * v) * Math.PI / 180;
  g.lineCap = 'round';
  g.strokeStyle = '#ff5a1f'; g.lineWidth = 34; g.beginPath(); g.arc(512, 540, 360, A(.78), A(1)); g.stroke();
  for (let i = 0; i <= 20; i++) { const a = A(i / 20), big = i % 5 === 0; g.strokeStyle = i >= 16 ? '#ff8a4c' : '#f6efe7'; g.lineWidth = big ? 12 : 6;
    g.beginPath(); g.moveTo(512 + Math.cos(a) * 400, 540 + Math.sin(a) * 400); g.lineTo(512 + Math.cos(a) * (big ? 330 : 360), 540 + Math.sin(a) * (big ? 330 : 360)); g.stroke(); }
  g.fillStyle = '#f6efe7'; g.font = '600 92px Clash'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('C', 512 + Math.cos(A(0)) * 250, 540 + Math.sin(A(0)) * 250); g.fillStyle = '#ff8a4c'; g.fillText('H', 512 + Math.cos(A(1)) * 250, 540 + Math.sin(A(1)) * 250);
  g.fillStyle = 'rgba(246,239,231,.75)'; g.font = '700 54px Satoshi'; g.fillText('90', 512 + Math.cos(A(.5)) * 250, 540 + Math.sin(A(.5)) * 250);
  g.font = '700 40px Satoshi'; g.fillStyle = 'rgba(246,239,231,.5)'; g.fillText('°C', 512, 760);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const grp = new THREE.Group();
  const face = new THREE.Mesh(new THREE.CircleGeometry(.5, 96), new THREE.MeshPhysicalMaterial({ map: tex, roughness: .7, metalness: 0 })); face.position.z = .02; grp.add(face);
  const bez = new THREE.Mesh(new THREE.TorusGeometry(.53, .045, 32, 128), M.steel); bez.position.z = .04; grp.add(bez);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(.56, .56, .16, 96), M.plastic); cup.rotation.x = Math.PI / 2; cup.position.z = -.06; grp.add(cup);
  const ang = (-210 + 240 * val) * Math.PI / 180; // angle écran (y vers le bas) → repère 3D
  const nd = new THREE.Mesh(new RoundedBoxGeometry(.4, .028, .012, 2, .006), M.hot); nd.geometry.translate(.16, 0, 0); nd.position.set(0, -.04 * 0, .04); nd.rotation.z = -ang; nd.position.y = -(540 - 512) / 1024; grp.add(nd);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .04, 32), M.steel); cap.rotation.x = Math.PI / 2; cap.position.set(0, nd.position.y, .05); grp.add(cap);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(.53, 64, 32, 0, Math.PI * 2, 0, .45), M.glassBox); dome.rotation.x = Math.PI / 2; dome.scale.z = .35; dome.position.z = -.01; grp.add(dome);
  const hs = [1, 2, 3, 4, 5].map(i => halo(grp, new THREE.Vector3(), .2, .5));
  grp.userData.setNeedle = (v, glow = 1) => { const a = -(-210 + 240 * v) * Math.PI / 180; nd.rotation.z = a; hs.forEach((h, i) => { const d = .06 * (i + 1); h.position.set(Math.cos(a) * d, nd.position.y + Math.sin(a) * d, .06); h.material.opacity = .5 * glow; }); };
  grp.userData.setNeedle(val);
  shadowAll(grp); return grp;
}
// jauge d'huile : poignée orange, lame d'acier, huile sous le MIN
function dipstickSet() {
  const grp = new THREE.Group();
  const blade = new THREE.Mesh(new RoundedBoxGeometry(1.9, .05, .012, 2, .005), M.steelLin); blade.position.x = .95; grp.add(blade);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.12, .035, 24, 64), M.handle); ring.position.x = -.12; grp.add(ring);
  const neck = new THREE.Mesh(new RoundedBoxGeometry(.18, .09, .06, 3, .02), M.handle); neck.position.x = .04; grp.add(neck);
  for (const x of [1.62, 1.76]) { const mk = new THREE.Mesh(new THREE.BoxGeometry(.012, .052, .014), M.plate); mk.position.x = x; grp.add(mk); }
  const film = new THREE.Mesh(new RoundedBoxGeometry(.06, .054, .016, 2, .006), M.oil); film.position.x = 1.875; grp.add(film);
  shadowAll(grp); return grp;
}
// poulie crantée avec flasques
function pulley(R, th, teeth) {
  const grp = new THREE.Group(), sh = new THREE.Shape(), N = teeth * 4;
  for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, r = R - (Math.floor(i / 2) % 2 ? .022 : 0); i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const hole = new THREE.Path(); hole.absarc(0, 0, R * .2, 0, Math.PI * 2, true); sh.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false }); g.translate(0, 0, -th / 2); grp.add(new THREE.Mesh(g, M.steel));
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(R + .05, R + .05, .014, 64), M.steel); f.rotation.x = Math.PI / 2; f.position.z = s * (th / 2 + .007); grp.add(f); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(R * .32, R * .32, th * 1.6, 6), M.steelLin); hub.rotation.x = Math.PI / 2; grp.add(hub);
  return grp;
}
// courroie crantée (ruban + dents) ; update(phase) fait défiler les dents, dents manquantes sur [gap0, gap1] (elles voyagent)
function belt(lp, w, t, pitch, gap0 = -1, gap1 = -1) {
  const N = 900, pos = [], idx = [], grp = new THREE.Group();
  for (let i = 0; i <= N; i++) { const s = lp.at(i / N * lp.L), nrm = new THREE.Vector2(s.t.y, -s.t.x);
    const o = s.p.clone().addScaledVector(nrm, t), inn = s.p;
    pos.push(o.x, o.y, -w / 2, o.x, o.y, w / 2, inn.x, inn.y, w / 2, inn.x, inn.y, -w / 2); }
  for (let i = 0; i < N; i++) for (let f = 0; f < 4; f++) { const a = i * 4 + f, b = i * 4 + (f + 1) % 4, c = (i + 1) * 4 + (f + 1) % 4, d = (i + 1) * 4 + f; idx.push(a, d, b, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  grp.add(new THREE.Mesh(g, M.rubber));
  const n = Math.floor(lp.L / pitch), tooth = new THREE.InstancedMesh(new RoundedBoxGeometry(pitch * .5, .022, w, 2, .006), M.rubber, n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1), one = new THREE.Vector3(1, 1, 1);
  const pitchL = lp.L / n;
  function update(phase) {
    let k = 0;
    for (let i = 0; i < n; i++) { const u0 = i * pitchL; if (u0 > gap0 && u0 < gap1 && i % 3) continue;
      const s = lp.at(u0 + phase), nrm = new THREE.Vector2(s.t.y, -s.t.x), c = s.p.clone().addScaledVector(nrm, -.008);
      q.setFromAxisAngle(Z, Math.atan2(s.t.y, s.t.x)); m4.compose(new THREE.Vector3(c.x, c.y, 0), q, one); tooth.setMatrixAt(k++, m4); }
    tooth.count = k; tooth.instanceMatrix.needsUpdate = true;
  }
  update(0);
  grp.add(tooth); shadowAll(grp); grp.userData.update = update; return grp;
}
function chips(n, seed, place) { // morceaux de courroie : petits éclats irréguliers
  const r = rng(seed), grp = new THREE.Group();
  for (let i = 0; i < n; i++) { const sh = new THREE.Shape(), k = 5 + (r() * 3 | 0), s = .018 + r() * .03;
    for (let j = 0; j < k; j++) { const a = j / k * Math.PI * 2, rr = s * (.6 + r() * .6); j ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .012 + r() * .012, bevelEnabled: false }), M.rubber);
    place(m, r, i); m.castShadow = true; grp.add(m); }
  return grp;
}
// crépine de pompe à huile : tube + coupelle + grille
function strainerSet() {
  const grp = new THREE.Group();
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(.24, .26, .07, 64), M.steel); cup.position.y = .05; grp.add(cup);
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#fff';
  for (let y = 0; y < 256; y += 10) for (let x = 0; x < 256; x += 10) g.fillRect(x + 2, y + 2, 6, 6);
  const am = new THREE.CanvasTexture(c);
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(.22, 64), new THREE.MeshPhysicalMaterial({ color: 0x1a1816, metalness: 1, roughness: .4, alphaMap: am, alphaTest: .5, side: THREE.DoubleSide })); mesh.rotation.x = -Math.PI / 2; mesh.position.y = .0875; grp.add(mesh);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.23, .012, 12, 64), M.steelLin); rim.rotation.x = Math.PI / 2; rim.position.y = .088; grp.add(rim);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0, .08, 0], [0, .4, 0], [.08, .62, 0], [.32, .7, 0]].map(a => new THREE.Vector3(...a))), 60, .045, 24), M.steelLin); grp.add(tube);
  shadowAll(grp); return grp;
}
function beltSet(withOil = true, wear = true) {
  const cA = new THREE.Vector2(0, 1.5), cB = new THREE.Vector2(0, .46), RA = .42, RB = .23;
  const lp = loop(cA, RA + .022, cB, RB + .022), grp = new THREE.Group();
  const A = pulley(RA, .16, 36), B = pulley(RB, .16, 18); A.position.set(cA.x, cA.y, 0); B.position.set(cB.x, cB.y, 0); grp.add(A, B); shadowAll(A); shadowAll(B);
  const L = lp.L, bl = belt(lp, .15, .035, .055, wear ? L * .62 : -1, wear ? L * .74 : -1); grp.add(bl);
  if (withOil) {
    const tw = 1.9, td = .95, th = .66;
    const oil = new THREE.Mesh(new THREE.BoxGeometry(tw - .02, th - .1, td - .02), M.oil); oil.position.set(.3, (th - .1) / 2 + .005, 0); grp.add(oil);
    const box = new THREE.Mesh(new THREE.BoxGeometry(tw, th, td), M.glassBox); box.position.set(.3, th / 2, 0); grp.add(box);
    const ed = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(tw, th, td)), new THREE.LineBasicMaterial({ color: 0xffd2b8, transparent: true, opacity: .35 })); ed.position.copy(box.position); grp.add(ed);
    const lamp = new THREE.PointLight(0xff9a4a, 3, 2.2, 2); lamp.position.set(.3, .3, .1); grp.add(lamp);
    const st = strainerSet(); st.position.set(.86, 0, 0); st.scale.setScalar(.9); grp.add(st);
    // éclats : dans le sillage de la courroie, en suspension, puis collés sur la crépine
    const ch = chips(46, 21, (m, r, i) => {
      if (i < 18) { const a = r(); m.position.set(-.25 + a * 1.0, .1 + (1 - a) * .38 + r() * .06, (r() - .5) * .6); }
      else { const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * .19; m.position.set(.86 + Math.cos(a) * rr * .9, .09 + r() * .02, Math.sin(a) * rr * .9); }
      m.rotation.set(r() * 6, r() * 6, r() * 6); m.userData.p0 = m.position.clone(); m.userData.r0 = m.rotation.clone(); m.userData.k = r(); });
    grp.add(ch);
    // les éclats en suspension glissent vers la crépine et y restent ; ceux déjà collés frémissent
    grp.userData.chips = (ph) => ch.children.forEach((m, i) => { const p0 = m.userData.p0; if (i < 18) { const u = ((m.userData.k + ph * .25) % 1); m.position.set(p0.x + (0.86 - p0.x) * u, p0.y + (.1 - p0.y) * u * u, p0.z * (1 - .6 * u)); m.rotation.set(m.userData.r0.x + ph * 2, m.userData.r0.y + ph, m.userData.r0.z); } });
    grp.userData.strainer = new THREE.Vector3(.86, .1, 0);
  }
  grp.userData.lp = lp; grp.userData.gap = lp.at(L * .68).p;
  grp.userData.update = (phase) => { bl.userData.update(phase); A.rotation.z = phase / RA; B.rotation.z = phase / RB; grp.userData.gap = lp.at(L * .68 + phase).p; if (grp.userData.chips) grp.userData.chips(phase); };
  return grp;
}

// ---------- caméra : même focale partout ; le point visé tombe sur y = FY à l'écran ----------
const camera = new THREE.PerspectiveCamera(22, W / H, .1, 100);
function frame(target, dist, elev, az, FY = 800) {
  const pad = 2 * (H - FY) - H; // décale le centre optique sans changer la focale
  camera.setViewOffset(W, H + Math.abs(pad), 0, pad > 0 ? pad : 0, W, H);
  const e = elev * Math.PI / 180, a = az * Math.PI / 180;
  camera.position.set(target.x + dist * Math.cos(e) * Math.sin(a), target.y + dist * Math.sin(e), target.z + dist * Math.cos(e) * Math.cos(a));
  camera.lookAt(target); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
  key.target.position.copy(target);
}
const world = new THREE.Group(); scene.add(world);
  return { renderer, scene, camera, frame, key, rim, M, halo, shadowAll, world, chainSet, pistonSet, hoseSet, gaugeSet, dipstickSet, beltSet, strainerSet, floorParts };
}
