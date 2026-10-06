"""Son de MO4 avec une vraie banque de sons : bruitages et musique Mixkit (licence Mixkit : usage commercial libre,
sans crédit obligatoire), téléchargés dans audio/bank/. Aucun son généré.
usage : python3 scripts/audio-mo4-banque.py [id_musique] → audio/mix-mo4.wav + docs/mix_report-mo4.txt
La musique est ramenée à 120 BPM (étirement temporel < 3 %), et le passage de 15 s le plus dense est choisi en
commençant sur un temps fort ; fondu de 0,4 s à la fin pour la boucle. Master −14 LUFS, plafond −3,5 dBTP."""
import json, os, sys
import numpy as np, soundfile as sf, librosa, pyloudnorm as pyln
from scipy.signal import resample_poly, butter, sosfilt
from scipy.ndimage import minimum_filter1d, uniform_filter1d
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); B = os.path.join(ROOT, 'audio/bank')
TL = json.load(open(os.path.join(ROOT, 'timeline-mo4.json'))); E = TL['ev']; SR = 48000; DUR = TL['dur']; N = int(DUR * SR)
MID = sys.argv[1] if len(sys.argv) > 1 else '623'
def load(name, sr=SR):
    x, _ = librosa.load(os.path.join(B, name), sr=sr, mono=False)
    x = np.atleast_2d(x); x = np.vstack([x, x]) if x.shape[0] == 1 else x
    return x.T
def put(dst, x, t, g=1.0):
    i = int(round(t * SR))
    if i < 0: x = x[-i:]; i = 0
    j = min(len(dst), i + len(x)); dst[i:j] += x[:j - i] * g

# ---------- musique ----------
y, _ = librosa.load(os.path.join(B, f'music-{MID}.mp3'), sr=SR, mono=False)
bpm = float(np.atleast_1d(librosa.beat.beat_track(y=librosa.to_mono(y), sr=SR)[0])[0])
rate = bpm / 120.0
y = np.vstack([librosa.effects.time_stretch(c, rate=rate) for c in y])
mono = librosa.to_mono(y); _, beats = librosa.beat.beat_track(y=mono, sr=SR, units='samples')
env = librosa.feature.rms(y=mono, hop_length=512)[0]
best, bi = -1, 0
for k in range(0, len(beats) - 4, 4):                        # départs sur un temps fort (toutes les 4 pulsations)
    a = beats[k]; b = a + N
    if b > len(mono): break
    sc = env[a // 512:b // 512].mean() - 0.5 * env[a // 512:b // 512].std()
    if sc > best: best, bi = sc, a
mus = y[:, bi:bi + N].T.copy()
f = int(0.4 * SR); mus[-f:] *= np.linspace(1, 0, f)[:, None] ** 1.5; mus[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]

# ---------- bruitages (Mixkit) ----------
sfx = np.zeros((N, 2)); S = lambda i: load(f'sfx-{i}.mp3')
put(sfx, S(2909), 0.0, 0.7); put(sfx, S(1492), -0.05, 0.6)
for t in E['hook']: put(sfx, S(1109), t, 0.25)
put(sfx, S(166), E['finger'], 0.35)
put(sfx, S(1490), E['morph'] - 0.05, 0.55)
put(sfx, S(1120), E['paste'], 0.6)
put(sfx, S(2573), E['enable'], 0.45)
put(sfx, S(2568), E['tap'] - 0.01, 0.6)
put(sfx, S(3120), E['expand'] - 0.05, 0.5)
for t in E['steps']: put(sfx, S(1107), t, 0.45)
put(sfx, S(174), E['result'] - 0.05, 0.45)
put(sfx, S(2357), E['pill'], 0.45); put(sfx, S(914), 6.98, 0.5)
for t in E['rows']: put(sfx, S(2356), t, 0.4)
put(sfx, S(2608), E['push'], 0.5)
put(sfx, S(2901), E['pop'], 0.6); put(sfx, S(3005), E['pop'] - 0.05, 0.5)
put(sfx, S(1486)[::-1][-int(0.6 * SR):], E['collapse'] - 0.45, 0.45)
put(sfx, S(2350), E['trail'], 0.5); put(sfx, S(869), E['trail'] + 0.3, 0.35)
put(sfx, S(2919), E['fill'], 0.6)
for t in E['slogan']: put(sfx, S(1109), t, 0.2)
put(sfx, S(2357), E['kicker'], 0.3); put(sfx, S(2568), E['tapEnd'], 0.6); put(sfx, S(2580), E['tapEnd'] + 0.05, 0.35)
put(sfx, S(1486)[::-1][-int(0.5 * SR):], E['out'], 0.5)

# ---------- mix et master ----------
mix = mus * 0.55 + sfx * 0.9
mix = sosfilt(butter(4, 70, 'high', fs=SR, output='sos'), mix, axis=0)
meter = pyln.Meter(SR); tp = lambda x: 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12); L = int(0.005 * SR)
for _ in range(12):
    mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
    if tp(mix) <= -3.5: break
    pk = np.abs(mix).max(1); gr = np.minimum(1, 10 ** (-4.2 / 20) / np.maximum(pk, 1e-9))
    mix *= uniform_filter1d(minimum_filter1d(gr, L * 2 + 1), L)[:, None]
sf.write(os.path.join(ROOT, 'audio/mix-mo4.wav'), mix, SR, subtype='PCM_24')
rep = f'MO4 banque Mixkit (musique {MID}, {bpm:.1f} → 120 BPM, départ {bi / SR:.2f} s) : {meter.integrated_loudness(mix):.1f} LUFS · true peak {tp(mix):.1f} dBTP\n'
open(os.path.join(ROOT, 'docs/mix_report-mo4.txt'), 'w').write(rep); print(rep, end='')
