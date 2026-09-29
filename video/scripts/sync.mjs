// Vérifie et aligne timeline.json sur la grille mesurée (beats.json).
// Chaque repère « beat: true » doit tomber à moins de 15 ms d'un beat ou d'un demi-beat mesuré ;
// un écart plus grand (≤ 80 ms) est signalé et recalé avec --apply, au-delà c'est une erreur.
import fs from 'fs';
import path from 'path';
import { ROOT } from './ui.mjs';
const CUT = process.env.CUT ? '-' + process.env.CUT : '';
const TLp = path.join(ROOT, `timeline${CUT}.json`);
const TL = JSON.parse(fs.readFileSync(TLp, 'utf8'));
const B = JSON.parse(fs.readFileSync(path.join(ROOT, `beats${CUT}.json`), 'utf8'));
const grid = []; B.beats.forEach((b, i) => { grid.push(b); if (i < B.beats.length - 1) grid.push((b + B.beats[i + 1]) / 2); });
const near = t => grid.reduce((a, g) => Math.abs(g - t) < Math.abs(a - t) ? g : a, grid[0]);
let bad = 0, moved = 0; const rows = [];
for (const c of TL.cues.filter(c => c.beat)) {
  const g = near(c.t); const d = (c.t - g) * 1000;
  if (Math.abs(d) > 80) { bad++; rows.push(`✗ ${c.sfx} ${c.t}s : ${d.toFixed(1)} ms du beat`); continue; }
  if (Math.abs(d) > 15) { c.t = +g.toFixed(3); moved++; }
  rows.push(`✓ ${c.sfx.padEnd(6)} ${c.t.toFixed(3)} s  (écart ${d.toFixed(1)} ms)`);
}
const down = B.downbeats.filter(d => d < TL.dur).map(d => d.toFixed(2));
const logoOnDown = B.downbeats.some(d => Math.abs(d - TL.marks.logo) < 0.015);
const ctaOnBeat = B.beats.some(d => Math.abs(d - TL.marks.cta) < 0.015);
if (moved && !bad && process.argv.includes('--apply')) fs.writeFileSync(TLp, JSON.stringify(TL, null, 2) + '\n');
console.log(rows.join('\n'));
console.log(`downbeats : ${down.join(', ')}`);
console.log(`logo (${TL.marks.logo} s) sur un downbeat : ${logoOnDown ? 'oui' : 'NON'} · CTA (${TL.marks.cta} s) sur un beat : ${ctaOnBeat ? 'oui' : 'NON'}`);
console.log(`${TL.cues.filter(c => c.beat).length - bad} repères alignés, ${moved} recalés, ${bad} hors grille`);
if (bad || !logoOnDown) process.exit(1);
