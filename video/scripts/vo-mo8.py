"""MO8 : pose la voix off sur la timeline de 30 s.

    python3 scripts/vo-mo8.py takeA.mp3   → audio/vo-mo8/vo-placed-<take>.wav, vo-timing-<take>.json

Méthode (celle de MO6, scripts/vo-mo6.py) :
- chaque réplique est définie par ses mots (faster-whisper small, audio/vo-mo8/words.json) et posée à son ancre :
  le premier temps de son numéro ; si la réplique précédente déborde, elle attend 0,08 s après ;
- découpe aux pauses internes de plus de 0,3 s, morceaux coupés au plus près du signal (seuil −34 dB) ;
- pauses internes ramenées à INNER_MAX, accélération atempo (timbre conservé) : 1,15 pour la liste, 1,22 pour la chute
  pour que la voix finisse avant le retour à l'image 0.
"""
import json, os, subprocess, sys, tempfile
from pathlib import Path
import numpy as np, soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'audio/vo-mo8'
TAKE = sys.argv[1] if len(sys.argv) > 1 else 'takeA.mp3'
SR, DUR = 48000, 30.0
W = [(w['s'], w['e'], w['w']) for w in json.load(open(D / 'words.json'))[TAKE]]
TL, TC, IN = float(os.environ.get('TL', 1.2)), float(os.environ.get('TC', 1.25)), float(os.environ.get('IN', 0.12))   # tempo liste, tempo chute, pause interne max

# répliques : (clé, premier mot, dernier mot, texte, ancre (s), tempo, pause interne max)
LINES = [
    ('h1', 0, 8, "Cinq voitures à ne jamais acheter en achat-revente.", 0.10, TL, IN),
    ('h2', 9, 14, "Enfin… pas la voiture. Le moteur.", 1.95, TL, IN),
    ('n5', 15, 21, "Cinq. BMW 116i : la chaîne s'allonge.", 5.10, TL, IN),
    ('n4', 22, 30, "Quatre. Golf 6, 1.4 TSI : chaîne et pistons.", 8.70, TL, IN),
    ('n3', 31, 36, "Trois. Le 1.0 EcoBoost : il chauffe.", 12.75, TL, IN),
    ('n2', 37, 46, "Deux. Clio 4, 1.2 TCe : il boit son huile.", 15.80, TL, IN),
    ('n1', 47, 59, "Et numéro un : le 1.2 PureTech. Sa courroie baigne dans l'huile.", 19.40, TL, IN),
    ('six', 60, 61, "Le six ?", 23.30, TL, IN),
    ('meme', 62, 68, "La même 208, courroie changée : cinq cents euros.", 23.95, TC, IN),
    ('fuit', 69, 74, "Tout le monde la fuit.", 26.75, TC, IN),
    ('toi', 75, 78, "Toi, tu l'achètes.", 27.68, TC, IN),
]

sped = {}
with tempfile.TemporaryDirectory() as tmp:
    src = Path(tmp) / 'a.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(D / TAKE), '-ac', '1', '-ar', str(SR), str(src)], check=True)
    for tempo in sorted({L[5] for L in LINES}):
        f = Path(tmp) / f'f{tempo}.wav'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-af', f'atempo={tempo}', str(f)], check=True)
        sped[tempo] = sf.read(f)[0]


def cut(a, b, tempo):
    """Morceau [a, b] (temps de la prise) resserré sur le signal ; renvoie (audio, début effectif en temps de prise)."""
    sp = sped[tempo]; X = lambda s: int(s / tempo * SR)
    raw = sp[X(a):X(b)]
    env = np.sqrt(np.convolve(raw ** 2, np.ones(480) / 480, 'same'))
    on = np.nonzero(env > env.max() * 10 ** (-34 / 20))[0]
    i0, i1 = max(0, on[0] - int(0.015 * SR)), min(len(raw), on[-1] + int(0.05 * SR))
    seg = raw[i0:i1].copy(); f, g = int(0.010 * SR), int(0.04 * SR)
    seg[:f] *= np.linspace(0, 1, f); seg[-g:] *= np.linspace(1, 0, g)
    return seg, a + i0 / SR * tempo


out = np.zeros(int(DUR * SR) + 6 * SR)
timing = {'dur': DUR, 'take': TAKE, 'lines': [], 'words': []}
t = 0.0
for key, k0, k1, text, anchor, tempo, inner in LINES:
    chunks, cur = [], [k0]
    for k in range(k0 + 1, k1 + 1):
        if W[k][0] - W[k - 1][1] > 0.3: chunks.append(cur); cur = [k]
        else: cur.append(k)
    chunks.append(cur)
    t = max(anchor, t + 0.08); t_line = t
    for ci, ch in enumerate(chunks):
        if ci: t += min((W[ch[0]][0] - W[chunks[ci - 1][-1]][1]) / tempo, inner)
        prev_end = W[ch[0] - 1][1] if ch[0] > 0 else 0.0
        next_start = W[ch[-1] + 1][0] if ch[-1] + 1 < len(W) else W[ch[-1]][1] + 0.6
        a = max(prev_end, W[ch[0]][0] - 0.15); b = min(next_start, W[ch[-1]][1] + 0.25)
        seg, a_eff = cut(a, b, tempo)
        i = int(t * SR); out[i:i + len(seg)] += seg
        for k in ch:
            timing['words'].append({'line': key, 't': round(t + (W[k][0] - a_eff) / tempo, 3), 'end': round(t + (W[k][1] - a_eff) / tempo, 3), 'w': W[k][2]})
        t += len(seg) / SR
    timing['lines'].append({'key': key, 't': round(t_line, 3), 'end': round(t, 3), 'text': text})
tag = Path(TAKE).stem
sf.write(D / f'vo-placed-{tag}.wav', out[:int(DUR * SR)], SR)
json.dump(timing, open(D / f'vo-timing-{tag}.json', 'w'), ensure_ascii=False, indent=1)
for L in timing['lines']: print(f"{L['t']:6.2f}-{L['end']:6.2f} {L['key']:5} {L['text']}")
print('fin de la voix', round(t, 2), 's')
