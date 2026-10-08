"""MO9 « 974 € » : pose la voix off et en déduit la durée du film (30,5 s environ).

    python3 scripts/vo-mo9.py takeA.mp3 [--retenue]  → audio/vo-mo9/vo-placed-<take>.wav, vo-timing-<take>.json

Méthode de MO8 (scripts/vo-mo8.py), avec trois ajouts :
- une ancre peut viser un mot : ('at', i, t) pose la réplique pour que le mot i tombe à t (« 3 900 » sur le prix max) ;
  ('+', g) la pose g s après la précédente ;
- une réplique peut être un morceau brut de la prise (le rire, que la transcription mange dans « Même ») ;
- deux mots recalés à l'oreille sur l'enveloppe : faster-whisper étale « Même le » sur 28,74-30,38 s alors que le rire
  occupe 29,34-30,0 s et que la phrase commence à 30,02 s.
Découpe aux pauses de plus de 0,3 s, morceaux coupés au plus près du signal (seuil −34 dB), pauses internes ramenées
au maximum de la réplique, accélération atempo (timbre conservé).
"""
import json, os, subprocess, sys, tempfile
from pathlib import Path
import numpy as np, soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'audio/vo-mo9'
TAKE = sys.argv[1] if len(sys.argv) > 1 else 'takeA.mp3'
SR = 48000
DUR = 32.0                                                   # place de travail ; la durée du film est calculée à la fin
W = [[w['s'], w['e'], w['w']] for w in json.load(open(D / 'words.json'))[TAKE]]
W[52][:2] = [30.02, 30.2]; W[53][:2] = [30.2, 30.38]          # « Même le » (voir plus haut)
W[49][1] = 26.48                                              # « Bénéfice » finit à 26,48 s (enveloppe)
E = lambda k, v: float(os.environ.get(k, v))
TH, TV, TC, TF = E('TH', 1.15), E('TV', 1.2), E('TC', 1.15), E('TF', 1.15)   # tempos : ouverture, récit, chute, fin

# répliques : (clé, mots (i0, i1) ou ('raw', a, b), texte, ancre, tempo, pause interne max)
LINES = [
    ('h1', (0, 3), "Tu l'achètes 3 900,", 0.10, TH, 0.1),
    ('h2', (4, 7), "tu la revends 5 600.", ('+', 0.12), TH, 0.1),
    ('ok', (8, 15), "Cette fois, ton compte en banque est d'accord.", ('+', 0.25), TH, 0.15),
    ('j0', (16, 19), "Jour 0, tu comptes.", ('+', 0.3), TV, 0.15),
    ('ann', (20, 26), "Les annonces d'à côté : 5 650.", ('+', 0.2), TV, 0.18),
    ('max', (27, 30), "Ton prix max : 3 900.", ('+', 0.2), TV, 0.18),
    ('def', (31, 33), "Pneus lisses, phares jaunis, rayure.", ('+', 0.35), TV, 0.15),
    ('acc', (34, 35), "Il accepte.", ('+', 0.2), TV, 0.1),
    ('frais', (36, 40), "Carte grise, contrôle, pneus : prévu.", ('+', 0.2), TV, 0.15),
    ('sonne', (41, 44), "Et là, ça sonne.", ('+', 0.3), TV, 0.3),
    ('neg', (45, 48), "Il négocie. Tu acceptes.", ('+', 0.4), TV, 0.25),
    ('ben', (49, 51), "Bénéfice : 974 euros.", ('+', 0.2), TC, 0.22),
    ('rire', ('raw', 29.34, 30.0), "[rire]", ('+', 0.45), TC, 0.0),
    ('keb', (52, 56), "Même le kebab était prévu.", ('+', 0.06), TC, 0.1),
    ('joue', (57, 63), "Tout s'est joué au jour 0.", ('+', 1.1), TF, 0.12),          # après le rembobinage (0,8 s)
    ('proch', (64, 70), "La prochaine fois que tu te dis…", ('after', 'joue', 4.0), TF, 0.12),   # titre + trois décisions, puis la boucle
]
# repères du film (indices de mots) : film-mo9/film.js lit leurs temps dans vo-timing.json
MARKS = dict(achete=2, b3900=3, revends=6, b5600=7, cette=8, accord=15, jour0=16, annonces=21, v5650=25, prix=28, m3900=30,
             pneus=31, phares=32, rayure=33, il=34, accepte=35, carte=36, controle=38, pneu=39, prevu=40,
             etla=41, sonne=43, negocie=45, tuacc=47, acceptes=48, benef=49, n974=50, euros=51, meme=52, kebab=54, etait=55, prevu2=56,
             tout=57, jour0b=62, prochaine=64, dis=70)

sped = {}
with tempfile.TemporaryDirectory() as tmp:
    src = Path(tmp) / 'a.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(D / TAKE), '-ac', '1', '-ar', str(SR), str(src)], check=True)
    for tempo in sorted({L[4] for L in LINES}):
        f = Path(tmp) / f'f{tempo}.wav'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-af', f'atempo={tempo}', str(f)], check=True)
        sped[tempo] = sf.read(f)[0]


def cut(a, b, tempo, thr=-34):
    """Morceau [a, b] (temps de la prise) resserré sur le signal ; renvoie (audio, début effectif en temps de prise)."""
    sp = sped[tempo]; X = lambda s: int(s / tempo * SR)
    raw = sp[X(a):X(b)]
    env = np.sqrt(np.convolve(raw ** 2, np.ones(480) / 480, 'same'))
    on = np.nonzero(env > env.max() * 10 ** (thr / 20))[0]
    i0, i1 = max(0, on[0] - int(0.015 * SR)), min(len(raw), on[-1] + int(0.05 * SR))
    seg = raw[i0:i1].copy(); f, g = int(0.010 * SR), int(0.04 * SR)
    seg[:f] *= np.linspace(0, 1, f); seg[-g:] *= np.linspace(1, 0, g)
    return seg, a + i0 / SR * tempo


def build(span, tempo, inner):
    """La réplique montée seule : (audio, [(indice du mot, début, fin)] en temps local)."""
    if span[0] == 'raw':
        seg, _ = cut(span[1], span[2], tempo, -40)
        return seg, []
    k0, k1 = span; chunks, cur = [], [k0]
    for k in range(k0 + 1, k1 + 1):
        if W[k][0] - W[k - 1][1] > 0.3: chunks.append(cur); cur = [k]
        else: cur.append(k)
    chunks.append(cur)
    parts, words, t = [], [], 0.0
    for ci, ch in enumerate(chunks):
        if ci:
            gap = min((W[ch[0]][0] - W[chunks[ci - 1][-1]][1]) / tempo, inner)
            parts.append(np.zeros(int(gap * SR))); t += gap
        prev_end = W[ch[0] - 1][1] if ch[0] > 0 else 0.0
        next_start = W[ch[-1] + 1][0] if ch[-1] + 1 < len(W) else W[ch[-1]][1] + 0.6
        a = max(prev_end, W[ch[0]][0] - 0.15); b = min(next_start, W[ch[-1]][1] + 0.25)
        seg, a_eff = cut(a, b, tempo)
        words += [(k, t + (W[k][0] - a_eff) / tempo, t + (W[k][1] - a_eff) / tempo) for k in ch]
        parts.append(seg); t += len(seg) / SR
    return np.concatenate(parts), words


out = np.zeros(int(DUR * SR) + 6 * SR)
timing = {'dur': DUR, 'take': TAKE, 'lines': [], 'words': [], 'marks': {}}
WT, t = {}, 0.0
for key, span, text, anchor, tempo, inner in LINES:
    seg, words = build(span, tempo, inner)
    if isinstance(anchor, tuple) and anchor[0] == 'at':
        start = anchor[2] - next(w[1] for w in words if w[0] == anchor[1])
    elif isinstance(anchor, tuple) and anchor[0] == 'after':
        start = next(L['t'] for L in timing['lines'] if L['key'] == anchor[1]) + anchor[2]
    elif isinstance(anchor, tuple):
        start = t + anchor[1]
    else:
        start = anchor
    if start < t + 0.06: print(f'  ! {key} : chevauche la réplique précédente de {t + 0.06 - start:.2f} s, décalée')
    start = max(start, t + 0.06)
    i = int(start * SR); out[i:i + len(seg)] += seg
    for k, a, b in words:
        WT[k] = {'line': key, 't': round(start + a, 3), 'end': round(start + b, 3), 'w': W[k][2]}
        timing['words'].append(WT[k])
    t = start + len(seg) / SR
    timing['lines'].append({'key': key, 't': round(start, 3), 'end': round(t, 3), 'text': text})
timing['marks'] = {k: WT[i] for k, i in MARKS.items()}
# la boucle : les cartes se replient 0,45 s avant « La prochaine fois », le film finit 0,35 s après « dis… »
timing['loop'] = round(timing['lines'][-1]['t'] - 0.45, 2)
DUR = timing['dur'] = round(np.ceil((t + 0.35) * 20) / 20, 2)
tag = Path(TAKE).stem
sf.write(D / f'vo-placed-{tag}.wav', out[:int(DUR * SR)], SR)
json.dump(timing, open(D / f'vo-timing-{tag}.json', 'w'), ensure_ascii=False, indent=1)
for L in timing['lines']: print(f"{L['t']:6.2f}-{L['end']:6.2f} {L['key']:5} {L['text']}")
print('fin de la voix', round(t, 2), 's · parole', round(sum(L['end'] - L['t'] for L in timing['lines']), 2), 's · boucle', timing['loop'], 's · film', DUR, 's')
if '--retenue' in sys.argv:
    sf.write(D / 'vo-placed.wav', out[:int(DUR * SR)], SR); json.dump(timing, open(D / 'vo-timing.json', 'w'), ensure_ascii=False, indent=1)
    tl = ROOT / 'timeline-mo9.json'; TLJ = json.load(open(tl)); TLJ['dur'] = DUR; json.dump(TLJ, open(tl, 'w'), ensure_ascii=False, indent=1); open(tl, 'a').write('\n')
    print('→ vo-placed.wav, vo-timing.json, timeline-mo9.json (durée)')
