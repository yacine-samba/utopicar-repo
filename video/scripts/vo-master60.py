"""master60 : pose de la voix de Simon (prise corps-2 + ouvertures A1 / B2).

Les prises eleven_v3 laissent de longs silences (28 s sur 74 s). On garde chaque morceau de parole tel quel et on
ramène les silences à une respiration (0,26 s), sauf les silences voulus : avant « Non. » (le gag) et avant les
changements de partie. Puis légère accélération (× 1,08, inaudible sur le timbre).
Sorties : audio/vo-master60/vo-placed-A.wav, vo-placed-B.wav, words-*.json (mots horodatés, faster-whisper medium).

usage : python3 scripts/vo-master60.py            (depuis video/)
"""
import json, subprocess, sys, os
import numpy as np, soundfile as sf, librosa, av

D = 'audio/vo-master60/v2'
OUT = 'audio/vo-master60'
SR = 44100
SPEED = 1.08
RESPI = 0.26        # silence courant après pose (respiration)
LONGS = {           # mot qui SUIT le silence → durée voulue (s)
    'Non': 0.65, 'UTOPICAR': 0.45, 'Cette': 0.5, 'Quinze': 0.45, 'Hop': 0.45, 'Tu débutes': 0.45, 'Essaie': 0.5, 'Tu chiffres': 0.5,
}

_o = av.open
def _p(*a, **k):
    k.pop('metadata_errors', None); return _o(*a, **k)
av.open = _p
from faster_whisper import WhisperModel
M = WhisperModel('medium', device='cpu', compute_type='int8')

def words(f):
    segs, _ = M.transcribe(f, language='fr', word_timestamps=True, initial_prompt="UTOPICAR, Mercedes, A3, Starter, Pro.")
    return [dict(w=w.word.strip(), s=round(w.start, 3), e=round(w.end, 3)) for s in segs for w in s.words]

def silences(y):
    """Silences de plus de 0,12 s (début, fin en s) d'après l'enveloppe à 10 ms."""
    hop = 441
    db = 20 * np.log10(librosa.feature.rms(y=y, frame_length=1764, hop_length=hop)[0] + 1e-9)
    act = db > db.max() - 40
    t = np.arange(len(act)) * hop / SR
    out, st = [], None
    for i, a in enumerate(act):
        if not a and st is None: st = t[i]
        if a and st is not None:
            if t[i] - st > 0.12: out.append((st, t[i]))
            st = None
    return out

def pose(f, ws):
    """Ramène chaque silence à sa durée voulue ; ne rallonge jamais un silence."""
    y, _ = librosa.load(f, sr=SR)
    parts, pos = [], 0.0
    S = silences(y)
    for k, (a, b) in enumerate(S):
        if a < 0.05:            # silence de tête : on coupe
            pos = b - 0.03; continue
        nxt = next((w['w'] for w in ws if w['s'] >= b - 0.3), '')
        cible = RESPI
        for mot, v in LONGS.items():
            if nxt.startswith(mot.split()[0]): cible = max(cible, v)
        garde = min(b - a, cible)
        parts.append(y[int(pos * SR):int((a + garde / 2) * SR)])
        pos = b - garde / 2
    fin = S[-1][0] + 0.15 if S and S[-1][1] >= len(y) / SR - 0.05 else len(y) / SR   # silence de queue coupé
    parts.append(y[int(pos * SR):int(fin * SR)])
    z = np.concatenate(parts)
    tmp = f + '.pose.wav'; sf.write(tmp, z, SR)
    return tmp

def accel(src, dst):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', f'atempo={SPEED}', '-ar', str(SR), dst], check=True)
    os.remove(src)

if __name__ == '__main__':
    W = {k: words(f'{D}/{k}.mp3') for k in ('corps-2', 'hookA-1', 'hookB-2')}
    corps = pose(f'{D}/corps-2.mp3', W['corps-2'])
    for h, nom in (('hookA-1', 'A'), ('hookB-2', 'B')):
        hk = pose(f'{D}/{h}.mp3', W[h])
        a, _ = librosa.load(hk, sr=SR); c, _ = librosa.load(corps, sr=SR); os.remove(hk)
        tmp = f'{OUT}/vo-placed-{nom}.tmp.wav'
        sf.write(tmp, np.concatenate([a, np.zeros(int(0.30 * SR)), c]), SR)
        accel(tmp, f'{OUT}/vo-placed-{nom}.wav')
        print(nom, round(sf.info(f'{OUT}/vo-placed-{nom}.wav').duration, 2), 's')
    os.remove(corps)
    json.dump(W, open(f'{OUT}/words-prises.json', 'w'), ensure_ascii=False, indent=1)
