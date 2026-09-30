// Bruitages de MO1 v2, calés sur les événements du film (film-mo1b/film.js) : mêmes repères, mêmes mots de Simon.
// usage : node scripts/cues-mo1b.mjs → écrit "cues" dans timeline-mo1b.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const F = path.join(ROOT, 'timeline-mo1b.json');
const TL = JSON.parse(fs.readFileSync(F, 'utf8')); const M = TL.marks;
const norm = s => s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
const Wd = (key, after = 0) => { const k = norm(key); const w = TL.words.find(w => w[1] >= after && norm(w[0]).startsWith(k)); return w ? w[1] : after; };
const cues = []; const add = (t, sfx, o = {}) => cues.push({ t: Math.round(t * 1000) / 1000, sfx, ...o });

// changements de plan : souffle discret
for (const k of ['golf', 'frais', 'note', 'reste', 'prix', 'tel', 'deuxv', 'dors', 'clio', 'parc', 'tableur', 'revends']) add(M[k], 's:whoosh', { pre: 0.25, g: 0.45 });
add(M.ecoute, 's:whoosh', { pre: 0.3, g: 0.7 }); add(M.ecoute, 'pop');
// Golf : la carte glisse, les compliments s'affichent
add(M.golf + 0.1, 's:slide', { g: 0.7 });
for (const k of ['propre', 'entretenue', 'adorable']) add(Wd(k, M.golf), 'tick', { g: 1.2 });
// frais qui tombent (ticket), compteur qui plonge
const feeT0 = M.frais + 0.55, feeStep = Math.min(0.42, (M.moins - feeT0 - 0.2) / 4);
for (let i = 0; i < 4; i++) add(feeT0 + i * feeStep + 0.1, 's:paste', { g: 0.7, pan: i % 2 ? 0.3 : -0.3 });
// « Moins mille deux cents » : impact + fissure
add(M.moins, 'hit'); add(M.moins + 0.05, 's:scratch', { g: 0.45 });
// fleur orange puis collage de l'annonce, clic sur « Analyser »
add(M.colle, 's:whoosh', { pre: 0.4 }); add(M.colle, 'thump');
const tPaste = Wd('colle', M.colle) + 0.25, tClick = M.deux - 0.35;
add(tPaste - 0.15, 's:click'); add(tPaste, 's:paste'); add(tClick, 's:click');
// anneau de chargement : tic-tac, puis validation
for (let k = 0; k < 4; k++) add(M.deux + 0.2 + k * 0.3, 'tick', { g: 0.7 });
add(M.note - 0.25, 's:ping', { g: 0.6 });
// jauge + tampon NO GO
add(M.note + 0.15, 's:slide', { g: 0.5 }); add(Wd('verdict', M.note), 'thump', { g: 0.8 });
// cercle tracé à la main
add(Wd('vraiment', M.reste), 's:scratch', { g: 0.25 });
// réglette : le curseur glisse jusqu'au plafond
add(Wd('dépasser', M.prix), 's:slide', { g: 0.6 }); add(Wd('dépasser', M.prix) + 1.0, 'tick', { g: 1.2 });
// téléphone qui sonne, offre et plafond
for (let k = 0; k < 3; k++) add(M.tel + k * 0.14, 'tick', { g: 0.9 });
add(Wd('toi', M.tel) - 0.1, 'pop'); add(Wd('chiffre', M.tel), 'pop');
// duel : les barres montent, le tampon GO
add(Wd('compar', M.deuxv) - 0.1, 's:slide', { g: 0.7 }); add(Wd('meilleure', M.deuxv), 's:click'); add(Wd('meilleure', M.deuxv) + 0.05, 'pop');
// radar de nuit, point repéré
add(M.dors + 0.4, 's:ping', { g: 0.35 }); add(M.dors + 1.9, 's:ping', { g: 0.35 });
// courbe « sous la cote »
add(Wd('sous', M.clio) - 0.2, 's:slide', { g: 0.5 }); add(Wd('sous', M.clio) + 0.1, 'pop');
// notification
add(M.premier - 0.35, 's:ping', { g: 0.9 });
// parc : lignes, calendrier, tableau de bord
add(M.parc + 0.1, 's:slide', { g: 0.6 }); add(Wd('jours', M.parc), 'tick'); add(Wd('tout', M.parc), 'pop');
// tableur barré qui tombe
const tS = Wd('dimanche', M.tableur) + 0.1; add(tS - 0.15, 's:scratch', { g: 0.5 }); add(tS + 0.4, 's:whoosh', { g: 0.5 });
// « Tu sais avant d'acheter » / courbe de marge
add(M.sais, 'pop'); add(M.revends + 0.15, 's:slide', { g: 0.5 });
// CTA : fleur, clics sur DÉBUTANT puis PRO
add(M.cta, 's:whoosh', { pre: 0.4 }); add(M.cta, 'thump');
add(M.cta + 1.5, 's:click'); add(M.end - 1.1, 's:click', { g: 0.8 });

TL.cues = cues.sort((a, b) => a.t - b.t);
fs.writeFileSync(F, JSON.stringify(TL, null, 1) + '\n');
console.log(`timeline-mo1b.json : ${cues.length} bruitages`);
