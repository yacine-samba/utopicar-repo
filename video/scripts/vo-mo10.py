"""MO10 « Deux voitures » : pose la voix off et en déduit la durée du film (≈ 31 s).

    python3 scripts/vo-mo10.py takeA.mp3 [--retenue]  → audio/vo-mo10/vo-placed-<take>.wav, vo-timing-<take>.json
                                                         (+ vo-placed-B.wav : la même pose avec l'ouverture B)

Une seule génération de Simon (eleven_v3, 580 crédits, 40,8 s brute), ouverture B dite à la fin de la même prise.
Mots horodatés par faster-whisper *medium* (scripts/words-mo10.py → audio/vo-mo10/words.json) : il relit le texte
exact ; des bornes recalées à l'oreille sur l'enveloppe (mesure à 20 ms) :
- « deuxième… » s'arrête à 15,30 s ; le soupir occupe 16,16-16,72 s, « reste » commence à 16,74 s ;
- « un » finit à 7,94 s ; « Ta » commence à 28,54 s ; l'ouverture B commence à 38,30 s ;
- « acceptes » finit à 20,36 s, « Bénéfice » occupe 20,96-21,70 s, « cent vingt » commence à 22,44 s.
Méthode de MO9 (scripts/vo-mo9.py) : répliques définies par leurs mots, découpées aux pauses de plus de 0,3 s,
coupées au plus près du signal (−34 dB), pauses internes ramenées au maximum de la réplique, accélération atempo
(timbre conservé) : × 1,2 partout, pas plus (retour « trop rapide » sur MO9 à × 1,25).
« Jour un. » est dans la prise mais pas dans le film : sans lui, la parole tient en 24,4 s (MO9 : 23,8 s).
"""
import json, os, subprocess, sys, tempfile
from pathlib import Path
import numpy as np, soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'audio/vo-mo10'
TAKE = sys.argv[1] if len(sys.argv) > 1 else 'takeA.mp3'
SR = 48000
DUR = 34.0                                                   # place de travail ; la durée du film est calculée à la fin
W = [[w['s'], w['e'], w['w']] for w in json.load(open(D / 'words.json'))[TAKE]]
W[32][1] = 15.30; W[33][0] = 16.74; W[17][1] = 7.94; W[52][0] = 28.54; W[77][0] = 38.30   # bornes recalées (voir plus haut)
W[37][1] = 20.36; W[38][:2] = [20.96, 21.70]; W[39][0] = 22.44                              # « Bénéfice » : medium le place 0,8 s trop tard
E = lambda k, v: float(os.environ.get(k, v))
TH, TV, TC, TF = E('TH', 1.2), E('TV', 1.2), E('TC', 1.2), E('TF', 1.2)   # tempos : ouverture, récit, chute, fin

# répliques : (clé, mots (i0, i1) ou ('raw', a, b), texte, ancre, tempo, pause interne max)
LINES = [
    ('h1', (0, 9), "Tu en achètes deux, mille de marge chacune : deux mille.", 0.10, TH, 0.14),
    ('h2', (10, 15), "Ton voisin, lui, compte les jours.", ('+', 0.26), TH, 0.16),
    ('deb', (18, 24), "Deux cartes grises, deux contrôles, deux assurances.", ('+', 0.45), TV, 0.12),
    ('part', (25, 30), "La première part en huit jours.", ('+', 0.95), TV, 0.12),       # après la pluie des cinq autres débits
    ('deux2', (31, 32), "La deuxième…", ('+', 0.42), TV, 0.1),
    ('soupir', ('raw', 16.12, 16.74), "[soupir]", ('+', 0.22), TV, 0.0),
    ('reste', (33, 33), "reste.", ('+', 0.02), TV, 0.1),
    ('neg', (34, 37), "Il négocie. Tu acceptes.", ('+', 2.4), TV, 0.25),            # l'attente : J+9 → J+40, sans voix
    ('ben', (38, 40), "Bénéfice : 120 euros.", ('+', 0.25), TC, 0.22),
    ('moins', (41, 45), "Moins qu'avec une seule.", ('+', 0.62), TC, 0.1),          # la seule pause du film, sur « 120 € »
    ('ceux', (46, 51), "Ceux qui gagnent comptent en jours.", ('+', 0.82), TF, 0.12),  # après le rembobinage
    ('prem', (52, 57), "Ta première : 55 euros par jour.", ('+', 0.25), TF, 0.16),
    ('ens', (58, 61), "Les deux ensemble : 3.", ('+', 0.22), TF, 0.18),
    ('verd', (62, 69), "La deuxième, tu l'achètes au jour 8.", ('+', 0.32), TF, 0.16),
    ('proch', (70, 76), "La prochaine fois que tu te dis…", ('+', 0.62), TF, 0.12),
]
HOOK_B = ('hB', (77, 86), "Ta deuxième voiture va manger la marge de la première.", 0.10, TH, 0.14)
# repères du film (indices de mots) : film-mo10/film.js lit leurs temps dans vo-timing.json
MARKS = dict(tu=0, deux=3, mille=4, chacune=7, deuxm=8, total=9, ton=10, voisin=11, lui=12, compte=13, jours=15,
             deuxc=18, cartes=19, controles=22, assur=24, la1=25, premiere=26, part=27, huit=29, la2a=31, deuxieme=32, reste=33,
             il=34, negocie=35, tuacc=36, acceptes=37, benef=38, n120=39, euros=40, moins=41, seule=45,
             ceux=46, gagnent=48, comptent=49, enjours=51, ta=52, n55=54, parjour=57, lesdeux=58, ensemble=60, trois=61,
             la3=62, achetes=66, jour8=68, huit8=69, prochaine=70, dis=76)
LINES_ALL = LINES + [HOOK_B]

sped = {}
with tempfile.TemporaryDirectory() as tmp:
    src = Path(tmp) / 'a.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(D / TAKE), '-ac', '1', '-ar', str(SR), str(src)], check=True)
    for tempo in sorted({L[4] for L in LINES_ALL}):
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
# la boucle : la carte se replie 0,45 s avant « La prochaine fois », le film finit 0,35 s après « dis… »
timing['loop'] = round(timing['lines'][-1]['t'] - 0.45, 2)
DUR = timing['dur'] = round(np.ceil((t + 0.35) * 20) / 20, 2)
# ouverture B : la phrase B posée à 0,10 s à la place de h1 + h2 (le reste du film ne bouge pas)
segB, _ = build(HOOK_B[1], HOOK_B[4], HOOK_B[5])
outB = out.copy(); j1 = next(L for L in timing['lines'] if L['key'] == 'deb')
outB[:int((j1['t'] - 0.02) * SR)] = 0; iB = int(0.10 * SR); outB[iB:iB + len(segB)] += segB
timing['hookB'] = {'t': 0.10, 'end': round(0.10 + len(segB) / SR, 3), 'text': HOOK_B[2]}
tag = Path(TAKE).stem
sf.write(D / f'vo-placed-{tag}.wav', out[:int(DUR * SR)], SR); sf.write(D / 'vo-placed-B.wav', outB[:int(DUR * SR)], SR)
json.dump(timing, open(D / f'vo-timing-{tag}.json', 'w'), ensure_ascii=False, indent=1)
for L in timing['lines']: print(f"{L['t']:6.2f}-{L['end']:6.2f} {L['key']:5} {L['text']}")
print('fin de la voix', round(t, 2), 's · parole', round(sum(L['end'] - L['t'] for L in timing['lines']), 2), 's · boucle', timing['loop'], 's · film', DUR, 's')
if '--retenue' in sys.argv:
    sf.write(D / 'vo-placed.wav', out[:int(DUR * SR)], SR); json.dump(timing, open(D / 'vo-timing.json', 'w'), ensure_ascii=False, indent=1)
    tl = ROOT / 'timeline-mo10.json'; TLJ = json.load(open(tl)); TLJ['dur'] = DUR; json.dump(TLJ, open(tl, 'w'), ensure_ascii=False, indent=1); open(tl, 'a').write('\n')
    print('→ vo-placed.wav, vo-timing.json, timeline-mo10.json (durée)')
