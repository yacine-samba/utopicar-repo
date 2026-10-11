"""MO6 : pose la voix off sur la timeline de 30 s.

    python3 scripts/vo-mo6.py [takeB.mp3]

Prise B d'ElevenLabs (eleven_v3, Simon), choisie par l'utilisateur : 46,8 s avec ses pauses. Méthode :
- chaque réplique est définie par ses mots (minutage faster-whisper, audio/vo-mo6/words.json) ;
- elle est découpée en morceaux aux pauses internes de plus de 0,3 s, chaque morceau coupé au plus près du signal
  (enveloppe 10 ms, seuil −34 dB sous le pic, qui retire les souffles de fin de mot) ;
- les pauses internes sont ramenées à 0,16 s au plus, l'ensemble accéléré de 15 % (atempo 1,15, timbre conservé) ;
- « Eux fuient. Toi, tu achètes. » est retirée (première coupe prévue) ;
- les répliques sont reposées avec le silence choisi avant chacune.
Sorties : audio/vo-mo6/vo-placed.wav (48 kHz mono) et audio/vo-mo6/vo-timing.json (répliques + mots, temps du film).
"""
import json, subprocess, sys, tempfile
from pathlib import Path
import numpy as np, soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'audio/vo-mo6'
TAKE = sys.argv[1] if len(sys.argv) > 1 else 'takeB.mp3'
SR, TEMPO, DUR = 48000, 1.15, 30.0
INNER_MAX = 0.16                       # pause interne maximale (temps du film)
W = json.load(open(D / 'words.json'))[TAKE]

# répliques : (clé, premier mot, dernier mot, texte, silence avant la réplique)
LINES = [
    ('s1', 0, 7, "Cette voiture a fait fuir tout le monde.", 0.10),
    ('s2', 8, 15, "Cent euros plus tard, elle vaut six cents de plus.", 0.22),
    ('ph', 16, 17, "Phares jaunis : vingt euros.", 0.30),
    ('ra', 18, 19, "Rayure : trente.", 0.22),
    ('in', 20, 21, "Intérieur : cinquante.", 0.20),
    ('cqc', 27, 34, "Ce qui coûte vraiment ne se voit pas.", 0.55),
    ('dist', 35, 37, "La distribution : six cents.", 0.36),
    ('fact', 38, 40, "Demande la facture.", 0.14),
    ('emb', 41, 42, "Embrayage : sept cents.", 0.32),
    ('q4', 43, 46, "En quatrième, plein gaz :", 0.12),
    ('tours', 47, 53, "les tours montent, pas la vitesse ?", 0.12),
    ('pat', 54, 55, "Il patine.", 0.22),
    ('cul', 56, 59, "Joint de culasse : mille deux cents.", 0.32),
    ('mousse', 60, 66, "Mousse blanche sous le bouchon d'huile ?", 0.14),
    ('mef', 67, 67, "Méfiance.", 0.22),
    ('parf', 68, 72, "Et la voiture parfaite ?", 0.30),
    ('perso', 73, 79, "Personne n'a regardé sous le bouchon.", 0.14),
]

with tempfile.TemporaryDirectory() as tmp:
    src, fast = Path(tmp) / 'a.wav', Path(tmp) / 'f.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(D / TAKE), '-ac', '1', '-ar', str(SR), str(src)], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-af', f'atempo={TEMPO}', str(fast)], check=True)
    sped, _ = sf.read(fast)
X = lambda s: int(s / TEMPO * SR)     # temps de la prise → échantillon de la prise accélérée


def cut(a, b):
    """Morceau [a, b] (temps de la prise) resserré sur le signal ; renvoie (audio, début effectif en temps de prise)."""
    raw = sped[X(a):X(b)]
    env = np.sqrt(np.convolve(raw ** 2, np.ones(480) / 480, 'same'))
    on = np.nonzero(env > env.max() * 10 ** (-34 / 20))[0]
    i0, i1 = max(0, on[0] - int(0.015 * SR)), min(len(raw), on[-1] + int(0.05 * SR))
    seg = raw[i0:i1].copy(); f, g = int(0.010 * SR), int(0.04 * SR)
    seg[:f] *= np.linspace(0, 1, f); seg[-g:] *= np.linspace(1, 0, g)
    return seg, a + i0 / SR * TEMPO


out = np.zeros(int(DUR * SR) + 6 * SR)
timing = {'dur': DUR, 'tempo': TEMPO, 'take': TAKE, 'lines': [], 'words': []}
t = 0.0
for key, k0, k1, text, gap in LINES:
    # morceaux : on coupe aux pauses internes de plus de 0,3 s
    chunks, cur = [], [k0]
    for k in range(k0 + 1, k1 + 1):
        if W[k][0] - W[k - 1][1] > 0.3: chunks.append(cur); cur = [k]
        else: cur.append(k)
    chunks.append(cur)
    t += gap; t_line = t
    for ci, ch in enumerate(chunks):
        if ci:
            pause = (W[ch[0]][0] - W[chunks[ci - 1][-1]][1]) / TEMPO
            t += min(pause, INNER_MAX)
        prev_end = W[ch[0] - 1][1] if ch[0] > 0 else 0.0
        next_start = W[ch[-1] + 1][0] if ch[-1] + 1 < len(W) else W[ch[-1]][1] + 0.6
        a = max(prev_end, W[ch[0]][0] - 0.15); b = min(next_start, W[ch[-1]][1] + 0.25)
        seg, a_eff = cut(a, b)
        i = int(t * SR); out[i:i + len(seg)] += seg
        for k in ch:
            timing['words'].append({'line': key, 't': round(t + (W[k][0] - a_eff) / TEMPO, 3), 'end': round(t + (W[k][1] - a_eff) / TEMPO, 3), 'w': W[k][2]})
        t += len(seg) / SR
    timing['lines'].append({'key': key, 't': round(t_line, 3), 'end': round(t, 3), 'text': text})
end = t
out = out[:int(DUR * SR)]
sf.write(D / 'vo-placed.wav', out, SR)
json.dump(timing, open(D / 'vo-timing.json', 'w'), ensure_ascii=False, indent=1)
for L in timing['lines']: print(f"{L['t']:6.2f}-{L['end']:6.2f} {L['key']:6} {L['text']}")
print('fin de la voix', round(end, 2), 's')
