// La Polo en 3D : le modèle du dépôt (assets/models-3D, « Volkswagen Polo GTI Mk5 Typ 6R 2012 », FBX), rendu par
// Three.js dans un canevas transparent que le film place comme l'était la photo de la 208. Pure fonction de la pose :
// pose({ az, el, dist }) repeint l'image, rien n'est conservé d'une image à l'autre.
// Le modèle arrive avec des matières perdues (la moitié des panneaux sans matière, en blanc, les vitres opaques) : on
// les refait toutes par nom de pièce et de matière. Les signes de la GTI sont retirés (étriers rouges, filet rouge et
// lettres de la calandre, lettres du hayon), parce que l'annonce analysée est une Polo ordinaire. Les lettres d'origine
// des plaques sont masquées : les plaques portent « utopicar » (logotype officiel, en minuscules).
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const MODELE = '../assets/models-3D/' + encodeURIComponent('Volkswagen Polo GTI Mk5 Typ 6R 2012.fbx');

function matieres(peinture) {
  const P = (o) => new THREE.MeshPhysicalMaterial(o), St = (o) => new THREE.MeshStandardMaterial(o);
  return {
    peinture: P({ color: peinture, metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.05 }),
    vitre: P({ color: 0x07090c, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.82, envMapIntensity: 1.6 }),
    noir: St({ color: 0x0c0c0d, roughness: 0.6 }),
    noirBrillant: P({ color: 0x060606, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 }),
    chrome: St({ color: 0xdedede, metalness: 1, roughness: 0.1 }),
    alu: St({ color: 0x8f949a, metalness: 1, roughness: 0.3 }),                       // jantes : alliage, pas un disque blanc
    pneu: St({ color: 0x151515, roughness: 0.88 }),
    etrier: St({ color: 0x2c2d30, metalness: 0.35, roughness: 0.5 }),
    phare: P({ color: 0xffffff, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.22, envMapIntensity: 2 }),
    feu: P({ color: 0x8e0b0b, roughness: 0.12, transparent: true, opacity: 0.9, emissive: 0x1c0000 }),
    clignotant: P({ color: 0xc9671f, roughness: 0.15, transparent: true, opacity: 0.85 }),
    plaque: St({ color: 0xefefef, roughness: 0.45 }),
    bleu: St({ color: 0x1b3a8c, roughness: 0.45 }),
    interieur: St({ color: 0x18181a, roughness: 0.82 }),
  };
}

// une matière du modèle → la nôtre (nom de la pièce, nom de la matière d'origine)
function choisir(M, piece, nom, orig) {
  if (/^(NP|200|WOB|D#1)_/.test(piece)) return null;                                  // lettres de la plaque
  if (nom.includes('skp6854_002')) return M.peinture;                                   // la carrosserie (rouge d'origine)
  if (nom.includes('bump_fro01_002')) return M.noirBrillant;                            // filet rouge GTI de la calandre
  if (nom.includes('Plate 048_002')) return M.bleu;                                     // bande européenne
  if (nom.includes('Plate 048')) return M.plaque;
  if (nom.includes('lights_gla_001')) return M.feu;
  if (nom.includes('lights_gla_002') || nom.includes('sides_rear_001') || nom.includes('lights_008')) return M.phare;   // glaces des phares
  if (/lights_00[4-7]|lights_010/.test(nom)) return orig.color && orig.color.r > 0.9 && orig.color.g > 0.3 ? M.clignotant : M.feu;
  if (/lights_0(0[1-3]|11)/.test(nom)) return M.chrome;                                 // réflecteurs des optiques
  if (nom.includes('wheel_stoc_001')) return M.pneu;
  if (nom.includes('interior_007') && /^Group_00[2468]$/.test(piece)) return M.etrier;  // étriers rouges GTI
  if (nom.includes('interior_016') && piece === 'bump_fro01_001') return M.noir;          // lettres GTI de la calandre
  if (nom.includes('interior_016') && piece === 'boot_ok_001') return M.peinture;         // lettres GTI du hayon
  if (nom.includes('interior_016') || nom.includes('lights_009')) return M.chrome;
  if (nom.includes('interior_012')) return M.alu;
  if (nom === '__DEFAULT') {
    if (/Front_Fender|Body_Panel|Roof_Half|Running_Board|Door_Lining/.test(piece)) return M.peinture;
    if (/windscre|door_lf_gl|boot_glass|Rear_Quarter_Window/.test(piece)) return M.vitre;
    if (/Projector_Reflector/.test(piece)) return M.chrome;
    if (/Projector_Cover|bump_glass/.test(piece)) return M.phare;
    if (/Bumper_Lights_Cover/.test(piece)) return M.feu;
    if (/exhaust/.test(piece)) return M.alu;
    if (/Grills|Lower_Bumper_Grill|Plastic_Trim|Wipers|Windshield_Black|sides_rear/.test(piece)) return M.noir;
    return M.interieur;
  }
  // le reste garde sa teinte, en matière physique (plastiques, joints, intérieur, optiques)
  const c = orig.color ? orig.color.clone() : new THREE.Color(0x202020);
  return new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: /lights_/.test(nom) ? 0.6 : 0 });
}

// ombre de contact : une tache sombre, douce, sous la voiture (rendue en 3D, elle suit la perspective). Le dégradé est
// tracé dans un carré et s'éteint avant les bords de la texture : une texture plus large que haute coupait l'ellipse en
// haut et en bas, et la coupe se voyait au sol comme une arête droite
function ombre(L, l) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512;
  const g = cv.getContext('2d'), d = g.createRadialGradient(256, 256, 0, 256, 256, 250);
  d.addColorStop(0, 'rgba(0,0,0,.9)'); d.addColorStop(0.4, 'rgba(0,0,0,.62)'); d.addColorStop(0.75, 'rgba(0,0,0,.2)'); d.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = d; g.fillRect(0, 0, 512, 512);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(L, l), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.2; m.renderOrder = -1;
  return m;
}

// le mot « utopicar » du logotype officiel (version fond clair, tracés vectoriels, tel quel), sans le symbole, recadré
// au plus juste dans un canevas
async function motUtopicar(hauteur = 220) {
  const svg = await (await fetch('../assets/brand/official/utopicar-logo-ligne-fond-clair.svg')).text();
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml'), racine = doc.documentElement;
  racine.querySelector('g').remove();                                                   // le premier groupe : le symbole
  const [vx, vy, vw, vh] = racine.getAttribute('viewBox').split(/\s+/).map(Number), k = 4;
  racine.setAttribute('width', String(vw * k)); racine.setAttribute('height', String(vh * k));
  const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(racine));
  await img.decode();
  const big = document.createElement('canvas'); big.width = vw * k; big.height = vh * k;
  const g = big.getContext('2d'); g.drawImage(img, 0, 0);
  const px = g.getImageData(0, 0, big.width, big.height).data;
  let x0 = big.width, y0 = big.height, x1 = 0, y1 = 0;
  for (let y = 0; y < big.height; y++) for (let x = 0; x < big.width; x++) if (px[(y * big.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const out = document.createElement('canvas'); out.height = hauteur; out.width = Math.round(hauteur * (x1 - x0 + 1) / (y1 - y0 + 1));
  out.getContext('2d').drawImage(big, x0, y0, x1 - x0 + 1, y1 - y0 + 1, 0, 0, out.width, out.height);
  return out;
}

// pose le mot sur une plaque du modèle : on lit le plan réel de son fond blanc (sommets de cette matière), la bande
// européenne à sa gauche, et on y colle un rectangle texturé, à peine décollé de la surface
function plaque(voiture, nomPiece, mot, mat) {
  const m = voiture.getObjectByName(nomPiece); if (!m) return null;
  const orig = m.userData.orig || [], pos = m.geometry.attributes.position, groupes = m.geometry.groups;
  const points = (motif) => {
    const pts = [];
    groupes.forEach((gr) => { if (!motif.test(orig[gr.materialIndex] || '')) return; for (let i = gr.start; i < gr.start + gr.count; i++) { const j = m.geometry.index ? m.geometry.index.getX(i) : i; pts.push(new THREE.Vector3().fromBufferAttribute(pos, j).applyMatrix4(m.matrixWorld)); } });
    return pts;
  };
  const fond = points(/Plate 048_00[134]/), bande = points(/Plate 048_002/);
  if (fond.length < 3) return null;
  const ctr = fond.reduce((a, p) => a.add(p), new THREE.Vector3()).divideScalar(fond.length);
  const n = new THREE.Vector3();
  for (let i = 0; i + 2 < fond.length; i += 3) n.add(new THREE.Vector3().subVectors(fond[i + 1], fond[i]).cross(new THREE.Vector3().subVectors(fond[i + 2], fond[i])));
  n.normalize(); if (n.dot(new THREE.Vector3(ctr.x, 0, ctr.z)) < 0) n.negate();          // vers l'extérieur de la voiture
  const haut = new THREE.Vector3(0, 1, 0).addScaledVector(n, -n.y).normalize(), droite = new THREE.Vector3().crossVectors(haut, n);
  const etendue = (pts, ax) => pts.reduce(([a, b], p) => { const v = p.clone().sub(ctr).dot(ax); return [Math.min(a, v), Math.max(b, v)]; }, [Infinity, -Infinity]);
  const [d0, d1] = etendue(fond, droite), [h0, h1] = etendue(fond, haut), bd = bande.length ? etendue(bande, droite)[1] : d0;
  const L = d1 - Math.max(d0, bd), H = h1 - h0;
  const hm = H * 0.5, lm = Math.min(L * 0.8, hm * mot.width / mot.height);               // le mot : la moitié de la hauteur
  const plan = new THREE.Mesh(new THREE.PlaneGeometry(lm, lm * mot.height / mot.width), mat);
  plan.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(droite, haut, n));
  plan.position.copy(ctr).addScaledVector(droite, (Math.max(d0, bd) + d1) / 2).addScaledVector(haut, (h0 + h1) / 2).addScaledVector(n, 0.06);
  return plan;
}

export async function polo({ largeur = 1000, hauteur = 620, echelle = 2, peinture = 0x3b3e43, marquer = null } = {}) {
  const canvas = document.createElement('canvas');
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  R.setPixelRatio(echelle); R.setSize(largeur, hauteur, false);
  canvas.style.width = largeur + 'px'; canvas.style.height = hauteur + 'px';
  R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.setClearColor(0x000000, 0);
  const S = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(R); S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  // une clé chaude par l'avant, un liseré orange par l'arrière (la couleur du film), un ciel doux
  const cle = new THREE.DirectionalLight(0xfff1e6, 1.9); cle.position.set(-120, 160, 90); S.add(cle);
  const lis = new THREE.DirectionalLight(0xff8a4c, 2.6); lis.position.set(150, 70, -120); S.add(lis);
  S.add(new THREE.HemisphereLight(0xffe9d8, 0x1a0e08, 0.45));

  const M = matieres(peinture);
  const voiture = await new Promise((ok, ko) => new FBXLoader().load(MODELE, ok, undefined, ko));
  voiture.traverse((o) => {
    if (!o.isMesh) return;
    const src = Array.isArray(o.material) ? o.material : [o.material];
    o.userData.orig = src.map((m) => m.name || '__DEFAULT');
    const nv = src.map((m) => (marquer && marquer.test(m.name || '__DEFAULT') ? new THREE.MeshBasicMaterial({ color: 0x00ff66 }) : choisir(M, o.name, m.name || '__DEFAULT', m)));   // marquer : repérage d'une matière
    if (nv.every((m) => m === null)) { o.visible = false; return; }
    o.material = Array.isArray(o.material) ? nv.map((m) => m || M.noir) : nv[0];
  });
  const box = new THREE.Box3().setFromObject(voiture), ctr = box.getCenter(new THREE.Vector3());
  voiture.position.set(-ctr.x, -box.min.y, -ctr.z);                                   // centrée, roues au sol (y = 0)
  const taille = box.getSize(new THREE.Vector3());
  S.add(voiture); S.add(ombre(taille.x * 1.12, taille.z * 1.5));
  // « utopicar » sur les deux plaques
  voiture.updateMatrixWorld(true);
  const mot = await motUtopicar(), tex = new THREE.CanvasTexture(mot);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const encre = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 });
  for (const nom of ['Plate_048_001', 'Plate_048_002']) { const p = plaque(voiture, nom, mot, encre); if (p) S.add(p); }

  const C = new THREE.PerspectiveCamera(22, largeur / hauteur, 5, 4000);
  // la silhouette à l'écran, mesurée sur un échantillon des sommets (cadrage : la voiture centrée dans le canevas)
  const pts = [];
  voiture.traverse((o) => { if (!o.isMesh || !o.visible) return; const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i += 23) pts.push(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld)); });
  const silhouette = () => {
    C.updateMatrixWorld(); C.updateProjectionMatrix();
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; const v = new THREE.Vector3();
    for (const p of pts) { v.copy(p).project(C); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
    return { x0: ((x0 + 1) / 2) * largeur, x1: ((x1 + 1) / 2) * largeur, y0: ((1 - y1) / 2) * hauteur, y1: ((1 - y0) / 2) * hauteur };
  };
  let zoom = 1;
  // az : 0 = de face, positif = on tourne vers le flanc gauche ; el : hauteur de la caméra ; dist : en longueurs de voiture.
  // La voiture est recentrée dans le canevas à chaque pose (décalage de la vue, sans changer la perspective).
  const placer = ({ az = 0.75, el = 0.12, dist = 2.6, cy = 0.36 } = {}) => {
    const r = taille.x * dist, y0 = taille.y * cy;
    C.position.set(-r * Math.cos(el) * Math.cos(az), y0 + r * Math.sin(el), r * Math.cos(el) * Math.sin(az));
    C.lookAt(0, y0, 0); C.clearViewOffset(); C.zoom = zoom;
    const b = silhouette();
    C.setViewOffset(largeur, hauteur, (b.x0 + b.x1) / 2 - largeur / 2, (b.y0 + b.y1) / 2 - hauteur / 2, largeur, hauteur);
    return silhouette();
  };
  const pose = (o) => { const b = placer(o); R.render(S, C); return b; };
  // cadrer(pose, part) : fixe une fois le grossissement pour que la voiture occupe cette part de la largeur
  const cadrer = (o, part) => { zoom = 1; const b = placer(o); zoom = (part * largeur) / (b.x1 - b.x0); };
  // pique(x, y) : la pièce et la matière d'origine sous un pixel de la dernière pose (repérage)
  const ray = new THREE.Raycaster();
  const pique = (x, y) => {
    ray.setFromCamera(new THREE.Vector2((x / largeur) * 2 - 1, -(y / hauteur) * 2 + 1), C);
    return ray.intersectObject(voiture, true).filter((h) => h.object.visible).slice(0, 4).map((h) => ({ piece: h.object.name, idx: h.face.materialIndex, nom: (h.object.userData.orig || [])[h.face.materialIndex] }));
  };
  return { canvas, pose, cadrer, taille, pique };
}
