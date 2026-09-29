"""Mesure la grille rythmique réelle de la musique.
usage : python3 scripts/beats.py audio/music.wav --stem audio/drums.wav
1. attaques du stem batterie (résolution ~3 ms) ; 2. tempo initial librosa ;
3. grille ajustée par moindres carrés sur les attaques proches d'un beat ;
4. downbeats : phase (sur 4) où le contenu harmonique (chroma) change le plus.
Sortie : beats.json {bpm, beats, downbeats, hits}."""
import argparse, json, os
import numpy as np
import librosa

ap = argparse.ArgumentParser(); ap.add_argument('music'); ap.add_argument('--stem'); a = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR, HOP, PAD = 44100, 128, 0.2
y, _ = librosa.load(a.stem or a.music, sr=SR, mono=True)
dur = len(y) / SR
y = np.concatenate([np.zeros(int(PAD * SR)), y])           # silence devant : l'attaque à 0 s est détectable
from scipy.signal import butter, sosfiltfilt
yk = sosfiltfilt(butter(4, 150, 'low', fs=SR, output='sos'), y)   # kick seul : c'est lui qui porte le beat
onset = librosa.onset.onset_strength(y=yk, sr=SR, hop_length=HOP, lag=1, max_size=1)
hits = librosa.onset.onset_detect(onset_envelope=onset, sr=SR, hop_length=HOP, units='time', backtrack=False) - PAD
# attaques du kick : montées de l'enveloppe d'énergie (la queue d'un kick ne monte pas), 350 ms d'écart minimum (moins qu'un beat)
from scipy.signal import find_peaks
env = sosfiltfilt(butter(2, 60, 'low', fs=SR, output='sos'), np.abs(yk))
rise = np.maximum(0, np.diff(env, prepend=env[0]))
pk, pr = find_peaks(rise, height=0.3 * rise.max(), distance=int(0.35 * SR))
strong = pk / SR - PAD
tempo = float(np.atleast_1d(librosa.beat.beat_track(onset_envelope=onset, sr=SR, hop_length=HOP)[0])[0])
per = 60 / tempo
# tempo à ±3 % près : on essaie les périodes voisines et on garde celle qui explique le mieux les attaques
best = None
for p in np.linspace(per * 0.97, per * 1.03, 241):
    ph = np.angle(np.mean(np.exp(2j * np.pi * strong / p))) / (2 * np.pi) * p
    err = np.abs(((strong - ph) / p + 0.5) % 1 - 0.5) * p
    sc = np.mean(np.exp(-(err / 0.012) ** 2))
    if best is None or sc > best[0] + 1e-9: best = (sc, p, ph)
_, per, ph = best
idx = np.round((strong - ph) / per); ok = np.abs(strong - (ph + idx * per)) < 0.03
period, phase = np.polyfit(idx[ok], strong[ok], 1)
phase = phase - np.floor((phase + 0.01) / period) * period
beats = [float(phase + k * period) for k in range(int(dur / period) + 2) if -0.005 <= phase + k * period < dur]
# downbeats : changement d'accord (chroma) le plus fort
ym, _ = librosa.load(a.music, sr=SR, mono=True)
chroma = librosa.feature.chroma_cqt(y=ym, sr=SR, hop_length=512)
def chroma_at(t0, t1):
    i0, i1 = int(t0 * SR / 512), max(int(t0 * SR / 512) + 1, int(t1 * SR / 512)); return chroma[:, i0:i1].mean(1)
nov = [np.linalg.norm(chroma_at(b, b + period) - chroma_at(max(0, b - period), b)) if i else 0 for i, b in enumerate(beats)]
# accents de la batterie (hauteur des montées d'énergie sur chaque beat) : s'ils désignent nettement un temps fort, ils priment
acc = [np.mean([pr['peak_heights'][np.argmin(np.abs(strong - b))] for b in beats[q::4] if np.min(np.abs(strong - b)) < 0.03] or [0]) for q in range(4)]
srt = sorted(acc)
if srt[-1] > 1.15 * srt[-2]: bp = int(np.argmax(acc)); how = 'accents'
else: bp = max(range(4), key=lambda q: np.mean([nov[i] for i in range(q, len(beats), 4) if i])); how = 'harmonie'
jit = np.abs(strong[ok] - (phase + idx[ok] * period)).max() * 1000
out = {'bpm': round(60 / period, 3), 'period': round(float(period), 5), 'beats': [round(b, 4) for b in beats],
       'downbeats': [round(b, 4) for b in beats[bp::4]], 'hits': [round(float(h), 4) for h in hits if h >= -0.005]}
CUT = '-' + os.environ['CUT'] if os.environ.get('CUT') else ''
json.dump(out, open(os.path.join(ROOT, f'beats{CUT}.json'), 'w'), indent=1)
print(f"BPM {out['bpm']} (librosa brut {tempo:.2f}), {len(beats)} beats, premier {beats[0]:.3f} s, "
      f"downbeats {out['downbeats'][:4]}… ({how}), {ok.sum()} attaques sur la grille, écart max {jit:.1f} ms")
