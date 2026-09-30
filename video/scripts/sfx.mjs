// Effets sonores synthétisés en Node à partir des repères de timeline.json.
// click (pressions), whoosh (morphs et poussées), pop (apparitions), hit / impact (moments clés),
// tick (compteurs), thump (logo). Sortie : audio/sfx.wav (48 kHz, stéréo, 24 bits).
import fs from 'fs';
import path from 'path';
import { ROOT } from './ui.mjs';

const CUT = process.env.CUT ? '-' + process.env.CUT : '';
// HOOK=A|B : garde les repères communs + ceux de l'ouverture choisie ; sortie audio/sfx<CUT>-<HOOK>.wav
const HOOK = process.env.HOOK || '';
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, `timeline${CUT}.json`), 'utf8'));
const SR = 48000, N = Math.ceil(TL.dur * SR);
const L = new Float32Array(N), R = new Float32Array(N);

// bruit déterministe
let seed = 1234567;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
// filtres simples
const onePoleLP = (x, fc) => { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; return x.map(v => (y = (1 - a) * v + a * y)); };
const onePoleHP = (x, fc) => { const lp = onePoleLP(Float32Array.from(x), fc); return x.map((v, i) => v - lp[i]); };
function bandNoise(n, lo, hi) { const x = new Float32Array(n).map(rnd); return onePoleLP(onePoleHP(x, lo), hi); }
const env = (i, a, d) => Math.min(1, i / (a * SR)) * Math.exp(-i / (d * SR));

const S = {
  click(n = 0.05 * SR) { const x = bandNoise(n, 2500, 7000); return x.map((v, i) => (v * 1.4 + Math.sin(2 * Math.PI * 3200 * i / SR) * 0.4) * env(i, 0.0012, 0.006)); },
  tick(n = 0.04 * SR) { return new Float32Array(n).map((_, i) => Math.sin(2 * Math.PI * 2100 * i / SR) * env(i, 0.0005, 0.008) * 0.6); },
  pop(n = 0.12 * SR) { let ph = 0; return new Float32Array(n).map((_, i) => { const f = 900 + 700 * Math.exp(-i / (0.012 * SR)); ph += 2 * Math.PI * f / SR; return Math.sin(ph) * env(i, 0.001, 0.03) * 0.55; }); },
  whoosh(n = 0.42 * SR) {
    const x = new Float32Array(n).map(rnd); let y1 = 0, y2 = 0;
    return x.map((v, i) => { const p = i / n; const fc = 300 + 5200 * Math.sin(Math.PI * Math.min(1, p * 1.25)) ** 2; const a = Math.exp(-2 * Math.PI * fc / SR);
      y1 = (1 - a) * v + a * y1; y2 = (1 - a) * y1 + a * y2; return (y1 - y2 * 0.6) * Math.sin(Math.PI * p) ** 1.5 * 0.9; });
  },
  hit(n = 0.5 * SR) { let ph = 0; const nz = bandNoise(n, 200, 3000);
    return new Float32Array(n).map((_, i) => { const f = 55 + 90 * Math.exp(-i / (0.03 * SR)); ph += 2 * Math.PI * f / SR; return Math.tanh(1.8 * Math.sin(ph) * env(i, 0.001, 0.16)) * 0.8 + nz[i] * env(i, 0.0005, 0.02) * 0.5; }); },
  impact(n = 0.8 * SR) { let ph = 0; const nz = bandNoise(n, 400, 6000);
    return new Float32Array(n).map((_, i) => { const f = 42 + 120 * Math.exp(-i / (0.04 * SR)); ph += 2 * Math.PI * f / SR; return Math.tanh(2 * Math.sin(ph) * env(i, 0.001, 0.28)) * 0.85 + nz[i] * env(i, 0.001, 0.06) * 0.45; }); },
  thump(n = 1.4 * SR) { let ph = 0; const nz = bandNoise(n, 150, 2500);
    return new Float32Array(n).map((_, i) => { const f = 36 + 70 * Math.exp(-i / (0.05 * SR)); ph += 2 * Math.PI * f / SR; return Math.tanh(2.2 * Math.sin(ph) * env(i, 0.002, 0.5)) * 0.95 + nz[i] * env(i, 0.001, 0.05) * 0.35; }); },
};
// frappe clavier douce : une touche par lettre (variation déterministe de hauteur et de niveau)
S.key = (n = 0.035 * SR) => { const f = 1400 + 900 * (rnd() * 0.5 + 0.5); const x = bandNoise(n, 1800, 7000);
  return x.map((v, i) => (v * 0.9 + Math.sin(2 * Math.PI * f * i / SR) * 0.25) * env(i, 0.0003, 0.004)); };
// bruitages réels (ElevenLabs, préparés par scripts/sfx_lib.py) : repère { sfx: 's:<nom>', pre?: s, g?: gain }
function readWav16(file) {
  const b = fs.readFileSync(file); let o = 12, data = null, ch = 1;
  while (o < b.length - 8) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'fmt ') ch = b.readUInt16LE(o + 10); if (id === 'data') { data = b.subarray(o + 8, o + 8 + sz); break; } o += 8 + sz; }
  const n = data.length / 2 / ch, x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = data.readInt16LE(i * 2 * ch) / 32768;
  return x;
}
const LIB = {};
const SGAIN = { click: 0.42, whoosh: 0.32, ping: 0.5, scratch: 0.62, slide: 0.34, paste: 0.45 };
const GAIN = { key: 0.16, click: 0.38, tick: 0.3, pop: 0.35, whoosh: 0.32, hit: 0.55, impact: 0.6, thump: 0.75 };
const PAN = { key: 0.05, click: 0.15, tick: -0.1, pop: 0.1, whoosh: 0, hit: 0, impact: 0, thump: 0 };

// une ligne tapée ({sfx:'type', n, rate}) devient une touche toutes les deux lettres
const CUES = TL.cues.filter(c => !c.hook || c.hook === HOOK).flatMap(c => c.sfx !== 'type' ? [c] : Array.from({ length: Math.ceil(c.n / 2) }, (_, i) => ({ t: c.t + i * 2 * c.rate, sfx: 'key', g: c.g })));
for (const c of CUES) {
  let x, g, p;
  if (c.sfx.startsWith('s:')) {
    const k = c.sfx.slice(2); LIB[k] ??= readWav16(path.join(ROOT, `audio/sfx-lib/${k}.wav`));
    x = LIB[k]; g = (c.g ?? 1) * (SGAIN[k] ?? 0.4); p = c.pan ?? 0;
    const start = Math.round((c.t - (c.pre ?? 0)) * SR);
    const gl = g * Math.sqrt((1 - p) / 2) * Math.SQRT2, gr = g * Math.sqrt((1 + p) / 2) * Math.SQRT2;
    for (let i = 0; i < x.length; i++) { const j = start + i; if (j < 0 || j >= N) continue; L[j] += x[i] * gl; R[j] += x[i] * gr; }
    continue;
  }
  x = S[c.sfx](); g = GAIN[c.sfx] * (c.g ?? 1); p = c.pan ?? PAN[c.sfx];
  // le whoosh démarre avant le repère pour que son sommet tombe dessus
  const start = Math.round((c.t - (c.sfx === 'whoosh' ? 0.18 : 0)) * SR);
  const gl = g * Math.sqrt((1 - p) / 2) * Math.SQRT2, gr = g * Math.sqrt((1 + p) / 2) * Math.SQRT2;
  for (let i = 0; i < x.length; i++) { const j = start + i; if (j < 0 || j >= N) continue; L[j] += x[i] * gl; R[j] += x[i] * gr; }
}
// WAV 24 bits
const buf = Buffer.alloc(44 + N * 6);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 6, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 6, 28); buf.writeUInt16LE(6, 32); buf.writeUInt16LE(24, 34); buf.write('data', 36); buf.writeUInt32LE(N * 6, 40);
for (let i = 0; i < N; i++) for (const [k, ch] of [[0, L], [1, R]]) {
  const v = Math.max(-1, Math.min(1, ch[i])) * 8388607 | 0; buf.writeIntLE(v, 44 + i * 6 + k * 3, 3);
}
fs.mkdirSync(path.join(ROOT, 'audio'), { recursive: true });
const OUTF = `audio/sfx${CUT}${HOOK ? '-' + HOOK : ''}.wav`;
fs.writeFileSync(path.join(ROOT, OUTF), buf);
console.log(`${OUTF} : ${CUES.length} effets`);
