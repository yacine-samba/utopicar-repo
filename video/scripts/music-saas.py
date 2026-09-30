"""Musique originale du film produit (v4), 108 BPM, do mineur, synthétisée en numpy, déterministe.
Énergie et tempo inspirés du registre de la référence 2 (pop corporate), sans en reprendre aucun son ni aucune mélodie.
Structure calée sur timeline-saas.json : intro filtrée (lueur, mosaïque, mot-symbole tracé), drop au passage en 3D,
groove, respirations sous les titres, montée vers la fin, accord final et sortie propre.
Sorties : audio/music-saas.wav et audio/drums-saas.wav (kick, pour beats.py)."""
import json, os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'timeline-saas.json')))
M = TL['marks']; SR = 48000; BPM = TL['bpm']; BEAT = 60 / BPM; BAR = 4 * BEAT; DUR = TL['dur']
N = int(SR * (DUR + 1.0)); rng = np.random.default_rng(108)
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def buf(): return np.zeros((N, 2))
def put(dst, x, t, g=1.0, pan=0.0):
    i = int(round(t * SR)); x = np.asarray(x)
    if x.ndim == 1: x = np.stack([x * np.sqrt((1 - pan) / 2), x * np.sqrt((1 + pan) / 2)], 1) * np.sqrt(2)
    j = min(N, i + len(x)); dst[i:j] += x[:j - i] * g
def env(n, a, d): tt = np.arange(n) / SR; return np.minimum(1, tt / max(a, 1e-4)) * np.exp(-tt / d)

def kick():
    n = int(0.42 * SR); tt = np.arange(n) / SR; f = 46 + 120 * np.exp(-tt / 0.03)
    return np.tanh((np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.2) + hp(rng.standard_normal(n), 3000) * np.exp(-tt / 0.004) * 0.3) * 1.7) * 0.95
def clap():
    n = int(0.3 * SR); tt = np.arange(n) / SR; nz = bp(rng.standard_normal(n), 1000, 3500); x = np.zeros(n)
    for k, o in enumerate([0, 0.01, 0.021]): i = int(o * SR); x[i:] += nz[:n - i] * np.exp(-tt[:n - i] / (0.01 if k < 2 else 0.12))
    return x * 0.55
def shaker():
    n = int(0.07 * SR); return hp(rng.standard_normal(n), 6500, 4) * env(n, 0.006, 0.02) * 0.25
def bass(m, length):
    n = int(length * SR); tt = np.arange(n) / SR; f = NOTE(m)
    x = np.sign(np.sin(2 * np.pi * f * tt)) * 0.5 + np.sin(2 * np.pi * f * tt)
    return np.tanh(lp(x, 520) * 1.5) * np.minimum(1, tt / 0.004) * np.exp(-tt / (length * 1.3)) * 0.5
def pluck(m, d=0.25, bright=3200):
    n = int(d * 4 * SR); tt = np.arange(n) / SR; f = NOTE(m)
    x = sum(np.sin(2 * np.pi * f * h * tt + h * 0.7) * (0.62 ** h) for h in range(1, 7))
    return lp(x, bright) * env(n, 0.002, d) * 0.2
def stab(ms, d=0.5):
    return sum(pluck(m, d, 5200) for m in ms) * 0.8

# grille d'accords : do m, la♭, mi♭, si♭ (une mesure chacun), basse sur la fondamentale
CHORDS = [[60, 63, 67], [56, 60, 63], [63, 67, 70], [58, 62, 65]]
ROOTS = [36, 32, 39, 34]
drums, mus = buf(), buf()
K, CL = kick(), clap()
DROP, END = M['extrude'], M['end']
H1, H2 = M['h1'], M['h2']
nb = int(DUR / BEAT)
for b in range(nb):
    t = b * BEAT; pos = b % 4; bar = int(t // BAR)
    if t >= DUR - 0.5: break
    breath = (H1 <= t < H1 + BAR) or (H2 <= t < H2 + BAR)          # respiration sous les titres : kick seul, plus léger
    if t < DROP:
        if t >= M['mosaic']: put(drums, K, t, 0.55 if pos else 0.8)  # intro : kick doux, accentué sur le temps fort
    elif t < END + BAR:
        put(drums, K, t, (1.0 if pos == 0 else 0.8) * (0.7 if breath else 1.0))
        if not breath and pos in (1, 3): put(drums, CL, t, 0.8, 0.1)
        if not breath:
            for s16 in range(4): put(drums, shaker(), t + s16 * BEAT / 4, 0.9 if s16 % 2 else 0.5, -0.35)
    elif t < DUR - 1.2:
        if pos == 0: put(drums, K, t, 0.5)
# basse (croches) à partir du drop
for e in range(int(DUR / (BEAT / 2))):
    t = e * BEAT / 2; bar = int(t // BAR)
    if t < DROP or t >= END + BAR: continue
    if ((H1 <= t < H1 + BAR) or (H2 <= t < H2 + BAR)) and e % 2: continue
    put(mus, bass(ROOTS[bar % 4] + (12 if e % 4 == 3 else 0), BEAT / 2 * 0.85), t, 0.85)
# arpège pluck (doubles-croches) : filtré dans l'intro, ouvert après le drop
for e in range(int(DUR / (BEAT / 4))):
    t = e * BEAT / 4; bar = int(t // BAR)
    if t >= END + BAR or e % 2: continue
    ch = CHORDS[bar % 4]; m = ch[(e // 2) % 3] + (12 if (e // 6) % 2 else 0)
    bright = 900 + 2300 * min(1, t / DROP) if t < DROP else 3400
    put(mus, pluck(m, 0.16, bright), t, 0.65 if t >= DROP else 0.45, -0.35 if (e // 2) % 2 else 0.35)
# stabs d'accords sur les temps forts des moments clés
for key in ['extrude', 'button', 'cards', 'phone', 'pop', 'dash', 'end']:
    t = M[key]; bar = int(t // BAR); put(mus, stab([n + 12 for n in CHORDS[bar % 4]], 0.45), t, 0.55)
# montées (bruit filtré) vers le drop et vers la fin
def riser(len_s, g=0.2):
    n = int(len_s * SR); x = rng.standard_normal(n); out = np.zeros(n)
    for i in range(0, n, 2400): c = 400 + 7000 * (i / n) ** 2; out[i:i + 2400] = bp(x[i:i + 2400], c * 0.5, min(c * 1.5, 20000))
    return out * (np.arange(n) / n) ** 2 * g
put(mus, riser(BAR), DROP - BAR, 1.0); put(mus, riser(BAR), END - BAR, 1.0)
# accord final tenu + sortie
for i, m in enumerate([48, 55, 60, 63, 67, 72]): put(mus, pluck(m, 1.6, 4200), END + i * 0.02, 0.9, [-0.3, 0.2, -0.1, 0.3, -0.2, 0.35][i])
put(mus, bass(36, 2.5), END, 0.9)

# sidechain léger de la basse et de l'arpège par le kick
duck = np.ones(N)
for b in range(nb):
    t = b * BEAT
    if t < DROP or t >= END + BAR: continue
    i = int(t * SR); m = min(N - i, int(0.2 * SR)); duck[i:i + m] = np.minimum(duck[i:i + m], 1 - 0.5 * np.exp(-np.arange(m) / SR / 0.06))
mus *= duck[:, None]
out = drums + mus
fade = np.ones(N); e0, e1 = int((DUR - 0.8) * SR), int(DUR * SR); fade[e0:e1] = np.linspace(1, 0, e1 - e0) ** 2; fade[e1:] = 0
out *= fade[:, None]; drums *= fade[:, None]
pk = np.abs(out).max(); out /= pk / 0.89; drums /= pk / 0.89
os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
sf.write(os.path.join(ROOT, 'audio/music-saas.wav'), out[: int(DUR * SR)], SR, subtype='PCM_24')
sf.write(os.path.join(ROOT, 'audio/drums-saas.wav'), drums[: int(DUR * SR)].mean(1), SR, subtype='PCM_24')
print(f'audio/music-saas.wav, audio/drums-saas.wav ({DUR} s, {BPM} BPM)')
