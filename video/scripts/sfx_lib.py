"""Prépare les bruitages ElevenLabs (audio/sfx-lib/src/*.mp3) pour le montage : 48 kHz mono 16 bits, silence de
tête retiré (attaque exactement sur le repère), longueur bornée par type, fondu de sortie, crête à −3 dBFS.
usage : python3 scripts/sfx_lib.py → audio/sfx-lib/<nom>.wav"""
import glob, os
import numpy as np, soundfile as sf, librosa
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAXLEN = {'click': 0.25, 'whoosh': 0.9, 'ping': 0.9, 'scratch': 0.8, 'slide': 0.6, 'paste': 0.45}
for f in sorted(glob.glob(os.path.join(ROOT, 'audio/sfx-lib/src/*.mp3'))):
    name = os.path.basename(f)[:-4]; x, sr = librosa.load(f, sr=48000, mono=True)
    env = np.abs(x); thr = env.max() * 0.06
    i0 = max(0, int(np.argmax(env > thr)) - int(0.004 * sr))
    y = x[i0:i0 + int(MAXLEN.get(name, 1.0) * sr)].copy()
    n = min(len(y), int(0.06 * sr)); y[-n:] *= np.linspace(1, 0, n)
    y *= 10 ** (-3 / 20) / (np.abs(y).max() + 1e-9)
    sf.write(os.path.join(ROOT, f'audio/sfx-lib/{name}.wav'), y, sr, subtype='PCM_16')
    print(f'{name}: attaque à {i0 / sr:.3f} s, {len(y) / sr:.2f} s')
