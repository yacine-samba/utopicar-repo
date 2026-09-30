// Bruitages des deux remakes (références 1 et 2), dérivés des battements de film-mo/beats.js et des animations de
// chaque style : cartes qui glissent, surlignages, gros mots, fleur (réf. 1), frappe dans la bulle, bulle-logo,
// chargement et rideau avant/après (réf. 2).
// usage : CUT=mo1|mo2 node scripts/cues-mo.mjs → écrit les repères dans timeline-<CUT>.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beats, segs } from '../film-mo/beats.js';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CUT = process.env.CUT;
const F = path.join(ROOT, `timeline-${CUT}.json`);
const TL = JSON.parse(fs.readFileSync(F, 'utf8'));
const M = TL.marks;
const HL = { golf: 1, tktop: 1, tktot: 1, plaf: 1, clio: 1, golffull: 1, lvmini: 1, liveprix: 1, rowsdays: 2 };
const r2 = x => Math.round(x * 1000) / 1000;
const cues = [];
const add = (t, sfx, o = {}) => cues.push({ t: r2(t), sfx, ...o });

for (const [i, b] of beats(M, true).entries()) {
  const first = b.a === 0;
  if (b.kind === 'big') { add(b.a, 's:whoosh', { pre: 0.3, g: 0.8 }); add(b.a, 'pop'); }
  else if (b.kind === 'red' || b.kind === 'green') add(b.a, 'hit');
  else if (b.kind === 'phrase' && !first) {
    if (CUT === 'mo2') {
      // frappe dans la bulle de verre : quelques touches au début de chaque phrase (pas tout le texte : la voix passe devant)
      const n = segs(b.text).map(s => s[0]).join('').length;
      const rate = Math.min(0.035, Math.max(0.018, (b.b - b.a - 0.6) / n));
      add(b.a + 0.12, 'type', { n: Math.min(n, 12), rate, g: 0.8 });
    } else if (!b.ui) add(b.a, 's:whoosh', { pre: 0.2, g: 0.35 });
  }
  if (b.ui) {
    add(b.a + (CUT === 'mo2' ? 0.1 : 0), 's:slide', { g: 0.6, pan: i % 2 ? 0.25 : -0.25 });
    for (let k = 0; k < (HL[b.ui] || 0); k++) add(b.a + (CUT === 'mo2' ? 0.5 : 0.45) + k * 0.15, 'tick');
  }
}
if (CUT === 'mo1') {
  // fleur orange qui envahit l'écran : montée (whoosh) puis impact sur le logo
  for (const T of [M.voici, M.logo]) { add(T, 's:whoosh', { pre: 0.4 }); add(T, 'thump'); }
} else {
  // bulle-logo + fonctions en orbite, chargement, rideau avant/après, logo final
  add(M.voici, 's:whoosh', { pre: 0.3 }); add(M.voici, 'thump');
  ['Analyser', 'Rapports', 'Recherche', 'Parc', 'Tableau'].forEach((_, i) => add(M.voici + 0.35 + i * 0.12, 'tick', { g: 0.8, pan: i % 2 ? 0.3 : -0.3 }));
  add(M.poche, 's:whoosh', { pre: 0.25, g: 0.5 });
  add(M.note - 0.35, 's:ping', { g: 0.7 });
  add(M.comparer - 0.1, 's:slide', { g: 0.8 });
  add(M.meilleure - 0.2, 'pop');
  add(M.logo, 's:whoosh', { pre: 0.3 }); add(M.logo, 'thump');
}
add(M.cta, 'pop');
add(M.cta + 1, 's:click');
add(M.end - 0.9, 's:click', { g: 0.8 });

TL.cues = cues.sort((a, b) => a.t - b.t);
fs.writeFileSync(F, JSON.stringify(TL, null, 1) + '\n');
console.log(`timeline-${CUT}.json : ${cues.length} repères`);
