"""MO8 : pose la voix off sur la timeline de 30 s.

    python3 scripts/vo-mo8.py takeB.mp3 [--retenue]   → audio/vo-mo8/vo-placed-<take>.wav, vo-timing-<take>.json
                                                         (--retenue : aussi vo-placed.wav et vo-timing.json, lus par le film)

Méthode (celle de MO6, scripts/vo-mo6.py) :
- chaque réplique est définie par ses mots (faster-whisper small, audio/vo-mo8/words.json) et posée à son ancre ;
  si la réplique précédente déborde, elle attend 0,08 s après ;
- découpe aux pauses internes de plus de 0,3 s, morceaux coupés au plus près du signal (seuil −34 dB) ;
- pauses internes ramenées à IN, accélération atempo (timbre conservé) : TL pour la liste, TC pour la chute.

Prise retenue : B. Les cylindrées se disent en litres (« un litre quatre TSI », « un litre deux PureTech ») : les
répliques n° 4, n° 2 et n° 1 viennent d'une seconde génération (fixC.mp3) et remplacent celles de la prise B.
Les repères du film sont donnés par réplique et rang du mot dans la réplique, donc indépendants de la prise.
"""
import json, os, subprocess, sys, tempfile
from pathlib import Path
import numpy as np, soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'audio/vo-mo8'
TAKE = sys.argv[1] if len(sys.argv) > 1 else 'takeB.mp3'
SR, DUR = 48000, 30.0
WJ = json.load(open(D / 'words.json'))
WORDS = {k: [(w['s'], w['e'], w['w']) for w in v] for k, v in WJ.items()}
TL, TC, IN = float(os.environ.get('TL', 1.2)), float(os.environ.get('TC', 1.25)), float(os.environ.get('IN', 0.12))

# répliques : (clé, prise, premier mot, dernier mot, texte, ancre (s), tempo)
LINES = [
    ('h1', TAKE, 0, 8, "Cinq voitures à ne jamais acheter en achat-revente.", 0.10, TL),
    ('h2', TAKE, 9, 14, "Enfin… pas la voiture. Le moteur.", 1.95, TL),
    ('n5', TAKE, 15, 21, "Cinq. BMW 116i : la chaîne s'allonge.", 5.10, TL),
    ('n4', TAKE, 22, 30, "Quatre. Golf 6, 1.4 TSI : chaîne et pistons.", 8.70, TL),
    ('n3', TAKE, 31, 36, "Trois. Le 1.0 EcoBoost : il chauffe.", 12.75, TL),
    ('n2', TAKE, 37, 46, "Deux. Clio 4, 1.2 TCe : il boit son huile.", 15.80, TL),
    ('n1', TAKE, 47, 59, "Et numéro un : le 1.2 PureTech. Sa courroie baigne dans l'huile.", 19.40, TL),
    ('six', TAKE, 60, 61, "Le six ?", 23.30, TL),
    ('meme', TAKE, 62, 68, "La même 208, courroie changée : cinq cents euros.", 23.95, TC),
    ('fuit', TAKE, 69, 74, "Tout le monde la fuit.", 26.75, TC),
    ('toi', TAKE, 75, 78, "Toi, tu l'achètes.", 27.68, TC),
]
# repères du film : (réplique, rang du mot dans la réplique ; négatif = depuis la fin)
MARKS = dict(cross=('h2', 0), strike=('h2', 3), moteur=('h2', 4),
             n5=('n5', 0), n5m=('n5', 1), n5d=('n5', 3), n4=('n4', 0), n4m=('n4', 1), n4d=('n4', 6),
             n3=('n3', 0), n3m=('n3', 1), n3d=('n3', 4), n2=('n2', 0), n2m=('n2', 1), n2d=('n2', 6),
             n1=('n1', 0), n1un=('n1', 2), n1m=('n1', 3), n1d=('n1', 7),
             six=('six', 0), meme=('meme', 0), cinqcents=('meme', 5), fuit=('fuit', 0), toi=('toi', 0), fin=('toi', -1))
if TAKE == 'takeB.mp3':
    over = {
        # « deux cent huit » transcrit en deux mots (« 200 vites ») : tout est décalé d'un mot après 64
        'meme': (TAKE, 62, 69, 23.95), 'fuit': (TAKE, 70, 74, 26.25), 'toi': (TAKE, 75, 78, 27.45),
        # cylindrées en litres : fixC.mp3 (« 4. Golfe 6, 1 .4 litre TSI, chêne épiston. 2. Clio 4, 1 .2 litre TCE, … »)
        'n4': ('fixC.mp3', 0, 8, 8.70), 'n2': ('fixC.mp3', 9, 19, 15.80), 'n1': ('fixC.mp3', 20, 33, 19.40),
    }
    LINES = [(k, *over[k][:3], txt, over[k][3], tp) if k in over else (k, tk, a, b, txt, anc, tp) for (k, tk, a, b, txt, anc, tp) in LINES]
    MARKS.update(n4d=('n4', -2), n2d=('n2', -4), n1d=('n1', -6), cinqcents=('meme', 6))

sped = {}
with tempfile.TemporaryDirectory() as tmp:
    for take in sorted({L[1] for L in LINES}):
        src = Path(tmp) / f'{take}.wav'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(D / take), '-ac', '1', '-ar', str(SR), str(src)], check=True)
        for tempo in sorted({L[6] for L in LINES if L[1] == take}):
            f = Path(tmp) / f'{take}-{tempo}.wav'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-af', f'atempo={tempo}', str(f)], check=True)
            sped[(take, tempo)] = sf.read(f)[0]


def cut(take, a, b, tempo):
    """Morceau [a, b] (temps de la prise) resserré sur le signal ; renvoie (audio, début effectif en temps de prise)."""
    sp = sped[(take, tempo)]; X = lambda s: int(s / tempo * SR)
    raw = sp[X(a):X(b)]
    env = np.sqrt(np.convolve(raw ** 2, np.ones(480) / 480, 'same'))
    on = np.nonzero(env > env.max() * 10 ** (-34 / 20))[0]
    i0, i1 = max(0, on[0] - int(0.015 * SR)), min(len(raw), on[-1] + int(0.05 * SR))
    seg = raw[i0:i1].copy(); f, g = int(0.010 * SR), int(0.04 * SR)
    seg[:f] *= np.linspace(0, 1, f); seg[-g:] *= np.linspace(1, 0, g)
    return seg, a + i0 / SR * tempo


out = np.zeros(int(DUR * SR) + 6 * SR)
timing = {'dur': DUR, 'take': TAKE, 'lines': [], 'words': [], 'marks': {}}
t = 0.0
for key, take, k0, k1, text, anchor, tempo in LINES:
    W = WORDS[take]
    chunks, cur = [], [k0]
    for k in range(k0 + 1, k1 + 1):
        if W[k][0] - W[k - 1][1] > 0.3: chunks.append(cur); cur = [k]
        else: cur.append(k)
    chunks.append(cur)
    t = max(anchor, t + 0.08); t_line = t
    for ci, ch in enumerate(chunks):
        if ci: t += min((W[ch[0]][0] - W[chunks[ci - 1][-1]][1]) / tempo, IN)
        prev_end = W[ch[0] - 1][1] if ch[0] > 0 else 0.0
        next_start = W[ch[-1] + 1][0] if ch[-1] + 1 < len(W) else W[ch[-1]][1] + 0.6
        a = max(prev_end, W[ch[0]][0] - 0.15); b = min(next_start, W[ch[-1]][1] + 0.25)
        seg, a_eff = cut(take, a, b, tempo)
        i = int(t * SR); out[i:i + len(seg)] += seg
        for k in ch:   # le début d'un mot ne précède jamais le son du morceau (whisper y compte parfois le silence d'avant)
            ws_ = max(t, t + (W[k][0] - a_eff) / tempo)
            timing['words'].append({'line': key, 't': round(ws_, 3), 'end': round(max(ws_, t + (W[k][1] - a_eff) / tempo), 3), 'w': W[k][2]})
        t += len(seg) / SR
    timing['lines'].append({'key': key, 'take': take, 't': round(t_line, 3), 'end': round(t, 3), 'text': text})
for name, (line, r) in MARKS.items():
    ws = [w for w in timing['words'] if w['line'] == line]; w = ws[r]
    timing['marks'][name] = {'t': w['t'], 'end': w['end'], 'w': w['w']}
tag = Path(TAKE).stem
sf.write(D / f'vo-placed-{tag}.wav', out[:int(DUR * SR)], SR)
json.dump(timing, open(D / f'vo-timing-{tag}.json', 'w'), ensure_ascii=False, indent=1)
for L in timing['lines']: print(f"{L['t']:6.2f}-{L['end']:6.2f} {L['key']:5} {L['take']:10} {L['text']}")
print('repères :', ', '.join(f"{k}={v['t']:.2f} {v['w']}" for k, v in timing['marks'].items()))
print('fin de la voix', round(t, 2), 's')
if len(sys.argv) > 2 and sys.argv[2] == '--retenue':
    sf.write(D / 'vo-placed.wav', out[:int(DUR * SR)], SR); json.dump(timing, open(D / 'vo-timing.json', 'w'), ensure_ascii=False, indent=1); print('→ vo-placed.wav, vo-timing.json')
