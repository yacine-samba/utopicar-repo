"""MO6 : pose la voix off sur la timeline de 30 s.

Prise A d'ElevenLabs (eleven_v3, Simon), 44,9 s avec ses pauses. On découpe chaque réplique sur le minutage
mot à mot (faster-whisper, audio/vo-mo6/words.json), on accélère de 12 % (atempo 1,12, timbre conservé), on retire
« Eux fuient. Toi, tu achètes. » (prévu comme première coupe) et on repose les répliques avec des silences courts.
Sorties : audio/vo-mo6/vo-placed.wav (48 kHz mono) et audio/vo-mo6/vo-timing.json (répliques + mots, temps du film).
"""
import json, subprocess, tempfile
from pathlib import Path
import numpy as np, soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'audio/vo-mo6'
SR, TEMPO, DUR = 48000, 1.12, 30.0
words = json.load(open(D / 'words.json'))['takeA.mp3']

# répliques : (clé, début, fin dans la prise A, texte, silence avant la réplique dans le film)
LINES = [
    ('s1', 0.00, 2.34, "Cette voiture a fait fuir tout le monde.", 0.10),
    ('s2', 4.20, 6.66, "Cent euros plus tard, elle vaut six cents de plus.", 0.22),
    ('ph', 8.02, 9.74, "Phares jaunis : vingt euros.", 0.32),
    ('ra', 10.44, 11.70, "Rayure : trente.", 0.22),
    ('in', 12.34, 13.80, "Intérieur : cinquante.", 0.20),
    ('cqc', 18.52, 20.56, "Ce qui coûte vraiment ne se voit pas.", 0.75),
    ('dist', 21.86, 23.34, "La distribution : six cents.", 0.38),
    ('fact', 24.00, 24.92, "Demande la facture.", 0.14),
    ('emb', 26.10, 27.52, "Embrayage : sept cents.", 0.34),
    ('q4', 27.52, 29.78, "En quatrième, plein gaz :", 0.10),
    ('tours', 30.24, 32.58, "les tours montent, pas la vitesse ?", 0.08),
    ('pat', 32.58, 33.38, "Il patine.", 0.24),
    ('cul', 34.24, 36.18, "Joint de culasse : mille deux cents.", 0.34),
    ('mousse', 37.08, 38.56, "Mousse blanche sous le bouchon d'huile ?", 0.14),
    ('mef', 39.26, 39.78, "Méfiance.", 0.29),
    ('parf', 41.22, 42.52, "Et la voiture parfaite ?", 0.40),
    ('perso', 43.22, 44.86, "Personne n'a regardé sous le bouchon.", 0.14),
]
PAD_IN, PAD_OUT = 0.04, 0.10          # marge autour de chaque réplique (attaque et queue de la voix)

with tempfile.TemporaryDirectory() as tmp:
    src = Path(tmp) / 'a.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(D / 'takeA.mp3'), '-ac', '1', '-ar', str(SR), str(src)], check=True)
    full, _ = sf.read(src)
    fast = Path(tmp) / 'f.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-af', f'atempo={TEMPO}', str(fast)], check=True)
    sped, _ = sf.read(fast)

out = np.zeros(int(DUR * SR) + 4 * SR)
timing = {'dur': DUR, 'tempo': TEMPO, 'take': 'takeA.mp3', 'lines': [], 'words': []}
t = 0.0
for key, a, b, text, gap in LINES:
    a0, b0 = max(0, a - PAD_IN), b + PAD_OUT
    # bornes resserrées sur le signal : enveloppe 10 ms, seuil −38 dB sous le pic de la réplique
    raw = sped[int(a0 / TEMPO * SR):int(b0 / TEMPO * SR)]
    env = np.sqrt(np.convolve(raw ** 2, np.ones(480) / 480, 'same')); thr = env.max() * 10 ** (-38 / 20)
    on = np.nonzero(env > thr)[0]; i0, i1 = max(0, on[0] - int(0.015 * SR)), min(len(raw), on[-1] + int(0.05 * SR))
    a0 = a0 + i0 / SR * TEMPO
    seg = raw[i0:i1].copy()
    n = len(seg); f = int(0.012 * SR)
    seg[:f] *= np.linspace(0, 1, f); seg[-int(0.06 * SR):] *= np.linspace(1, 0, int(0.06 * SR))
    t += gap
    i = int(t * SR); out[i:i + n] += seg
    timing['lines'].append({'key': key, 't': round(t, 3), 'end': round(t + len(seg) / SR, 3), 'text': text})
    for ws, we, w in words:
        if ws >= a - 0.02 and we <= b + 0.15:
            timing['words'].append({'line': key, 't': round(t + (ws - a0) / TEMPO, 3), 'end': round(t + (we - a0) / TEMPO, 3), 'w': w})
    t += n / SR
out = out[:int(DUR * SR)]
sf.write(D / 'vo-placed.wav', out, SR)
json.dump(timing, open(D / 'vo-timing.json', 'w'), ensure_ascii=False, indent=1)
for L in timing['lines']: print(f"{L['t']:6.2f}-{L['end']:6.2f} {L['key']:6} {L['text']}")
print('fin de la voix', round(t, 2), 's')
