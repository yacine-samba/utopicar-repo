// Éléments de vraie interface (captures, données démo) communs aux deux remakes. Chaque groupe est un bloc posé par son
// centre ; `frame(card)` permet au style d'habiller chaque carte (ombre sur fond marine, verre dépoli pour la réf. 2).
const { el, crop } = Kit;
const DPR = 3;
const SRC = {};
const UI1 = ['scan', 'card-lv1', 'lg3', 'lg4', 'lg5', 'lg6', 'dock-scan'];
export async function loadUI() {
  const keys = ['dcard1', 'dcard2', 'ticket', 'plaf', 'lvmini', 'vrow1', 'vrow2', 'kpis', 'mchart', ...UI1];
  for (const k of keys) {
    const i = new Image(); i.src = `../assets/${UI1.includes(k) ? 'ui' : 'ui2'}/${k}.png`; await i.decode();
    SRC[k] = { url: i.src, w: i.naturalWidth, h: i.naturalHeight };
  }
}
function card(parent, key, r, k, rad, frame, cls = 'card') {
  const s = SRC[key]; r = r || { x: 0, y: 0, w: s.w / DPR, h: s.h / DPR };
  const e = el('div', cls, parent);
  Object.assign(e.style, { width: r.w * k + 'px', height: r.h * k + 'px', borderRadius: rad * k + 'px', overflow: 'hidden' });
  const c = crop(e, s.url, s.w, s.h, r, k); c.style.position = 'absolute';
  e._k = k; e._r = r; e._w = r.w * k; e._h = r.h * k;
  if (frame) frame(e);
  return e;
}
function hl(c, x, y, w, h) {
  const e = el('div', 'hl', c); const k = c._k, r = c._r;
  Object.assign(e.style, { left: (x - r.x - 4) * k + 'px', top: (y - r.y - 3) * k + 'px', width: (w + 8) * k + 'px', height: (h + 6) * k + 'px' });
  return e;
}
// pose des cartes dans un bloc : items = [[carte, x, y, rot]] (centres relatifs au bloc)
function group(parent, items) {
  const g = el('div', 'abs', parent);
  let W = 0, H = 0;
  for (const [c] of items) { W = Math.max(W, c._w); H = Math.max(H, c._h); }
  const xs = items.map(([c, x]) => [x - c._w / 2, x + c._w / 2]), ys = items.map(([c, , y]) => [y - c._h / 2, y + c._h / 2]);
  const x0 = Math.min(...xs.map(a => a[0])), x1 = Math.max(...xs.map(a => a[1])), y0 = Math.min(...ys.map(a => a[0])), y1 = Math.max(...ys.map(a => a[1]));
  g.style.width = (x1 - x0) + 'px'; g.style.height = (y1 - y0) + 'px';
  for (const [c, x, y, rot = 0] of items) { g.appendChild(c); c.style.left = (x - c._w / 2 - x0) + 'px'; c.style.top = (y - c._h / 2 - y0) + 'px'; c.style.transform = `rotate(${rot}deg)`; c._x = x - x0; c._y = y - y0; }
  g._w = x1 - x0; g._h = y1 - y0; g.cards = items.map(([c]) => c); g.hls = [];
  return g;
}
export function makeUI(parent, key, frame, s = 1) {
  const C = (k, r, kk, rad = 22) => card(parent, k, r, kk * s, rad, frame);
  let g;
  switch (key) {
    case 'golf': { const c = C('dcard1', { x: 8, y: 8, w: 362, h: 110 }, 2.3); g = group(parent, [[c, 0, 0]]); g.hls = [hl(c, 211, 97, 44, 16)]; break; }
    case 'costs': { const cs = ['lg3', 'lg4', 'lg5', 'lg6'].map(k => C(k, null, 2.0, 10)); let y = 0; g = group(parent, cs.map((c, i) => { const it = [c, i % 2 ? 14 : -14, y + c._h / 2, i % 2 ? 1.5 : -1.5]; y += c._h + 16; return it; })); break; }
    case 'ads': { const a = C('card-lv1', { x: 6, y: 6, w: 362, h: 150 }, 1.45), b = C('dcard2', { x: 8, y: 8, w: 362, h: 110 }, 1.45); g = group(parent, [[a, -120, -40, -6], [b, 130, 170, 5]]); break; }
    case 'calc': { const a = C('lg4', null, 1.7, 10), b = C('lg5', null, 1.7, 10); g = group(parent, [[a, -60, -30, -5], [b, 80, 110, 4]]); break; }
    case 'dock': { const c = card(parent, 'dock-scan', null, 2.3 * s, 20, null, 'abs'); g = group(parent, [[c, 0, 0]]); break; }
    case 'texte': { const c = C('scan', { x: 30, y: 952, w: 345, h: 212 }, 2.25, 20); g = group(parent, [[c, 0, 0]]); break; }
    case 'tktop': { const c = C('ticket', { x: 10, y: 10, w: 320, h: 84 }, 2.6, 20); g = group(parent, [[c, 0, 0]]); g.hls = [hl(c, 110, 10, 100, 36)]; break; }
    case 'tktot': { const c = C('ticket', { x: 10, y: 432, w: 320, h: 88 }, 2.6, 20); g = group(parent, [[c, 0, 0]]); g.hls = [hl(c, 155, 454, 170, 44)]; break; }
    case 'plaf': { const c = C('plaf', { x: 8, y: 8, w: 320, h: 130 }, 2.5, 20); g = group(parent, [[c, 0, 0]]); g.hls = [hl(c, 18, 50, 108, 30)]; break; }
    case 'duo': { const a = C('dcard1', { x: 8, y: 8, w: 362, h: 215 }, 1.18), b = C('dcard2', { x: 8, y: 8, w: 362, h: 215 }, 1.18); g = group(parent, [[a, -222, 0, -2], [b, 222, 0, 2]]); break; }
    case 'golffull': { const c = C('dcard1', { x: 8, y: 8, w: 362, h: 215 }, 2.2); g = group(parent, [[c, 0, 0]]); g.hls = [hl(c, 184, 154, 120, 22)]; break; }
    case 'clio': { const c = C('dcard2', { x: 8, y: 8, w: 362, h: 215 }, 2.2); g = group(parent, [[c, 0, 0]]); g.hls = [hl(c, 184, 154, 120, 22)]; break; }
    case 'lvmini': { const c = C('lvmini', { x: 10, y: 10, w: 362, h: 432 }, 1.25); g = group(parent, [[c, 0, 0]]); g.hls = [hl(c, 125, 148, 82, 38)]; break; }
    case 'liveprix': { const c = C('card-lv1', { x: 6, y: 372, w: 362, h: 98 }, 2.35); g = group(parent, [[c, 0, 0]]); g.hls = [hl(c, 125, 446.75, 163, 19.5)]; break; }
    case 'rows': case 'rowsdays': { const a = C('vrow1', { x: 2, y: 2, w: 360, h: 145 }, 1.65, 20), b = C('vrow2', { x: 2, y: 2, w: 360, h: 145 }, 1.65, 20); g = group(parent, [[a, 0, 0], [b, 0, a._h + 18]]); if (key === 'rowsdays') g.hls = [hl(a, 251, 111, 54, 19), hl(b, 251, 111, 54, 19)]; break; }
    case 'kpis': { const c = C('kpis', { x: 8, y: 8, w: 362, h: 359 }, 1.35, 18); g = group(parent, [[c, 0, 0]]); break; }
    case 'mosaic': { const a = C('kpis', { x: 8, y: 8, w: 362, h: 359 }, 1.05, 18), b = C('mchart', { x: 10, y: 10, w: 362, h: 446 }, 0.86); g = group(parent, [[a, -205, 0], [b, 205, 0]]); break; }
    default: return null;
  }
  return g;
}
