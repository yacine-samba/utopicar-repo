"""Musique originale 120 BPM, synthétisée en code (numpy), déterministe.
Sorties : audio/music.wav (stéréo 48 kHz) et audio/drums.wav (stem batterie, pour beats.py).
Structure calée sur timeline.json : groove dès 0 s, montée 8–10 s, drop à 10 s, accord final sur le logo à 12 s."""
import json, os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'timeline.json')))
SR = 48000
BPM = TL['bpm']; BEAT = 60 / BPM; DUR = TL['dur']
N = int(SR * (DUR + 0.5))
rng = np.random.default_rng(7)

def buf(): return np.zeros((N, 2))
def place(dst, x, t, gain=1.0, pan=0.0):
    i = int(round(t * SR)); x = np.asarray(x)
    if x.ndim == 1: x = np.stack([x * np.sqrt(0.5 * (1 - pan)), x * np.sqrt(0.5 * (1 + pan))], 1) * np.sqrt(2)
    j = min(N, i + len(x)); dst[i:j] += x[:j - i] * gain
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def noise(n): return rng.standard_normal(n)
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------- sons ----------
def kick():
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 44 + 110 * np.exp(-t / 0.035); ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.22)
    click = hp(noise(n), 2500) * np.exp(-t / 0.004) * 0.25
    return np.tanh((body + click) * 1.6) * 0.9
def clap():
    n = int(0.3 * SR); x = np.zeros(n); t = np.arange(n) / SR
    nz = bp(noise(n), 900, 3200)
    for k, o in enumerate([0, 0.011, 0.022]):
        i = int(o * SR); x[i:] += nz[:n - i] * np.exp(-(t[:n - i]) / (0.012 if k < 2 else 0.13))
    return x * 0.5
def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    return hp(noise(n), 7500, 4) * env(n, 0.001, 0.09 if open_ else 0.018) * 0.35
def bass(m, length):
    n = int(length * SR); t = np.arange(n) / SR; f = NOTE(m)
    x = sum(np.sin(2 * np.pi * f * h * t) / h for h in range(1, 7))
    x = lp(x, 380) * np.minimum(1, t / 0.004) * np.exp(-t / (length * 0.9))
    x[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    return np.tanh(x * 1.4) * 0.55
def pluck(m, d=0.35):
    n = int(d * 3 * SR); t = np.arange(n) / SR; f = NOTE(m)
    x = sum(np.sin(2 * np.pi * f * h * t + h) * (0.6 ** h) for h in range(1, 5))
    return lp(x, 2600) * env(n, 0.002, d) * 0.22

# ---------- partition ----------
# accords par mesure (2 s) : Am, F, C, G, Am, F, C, Am
CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62], [57, 60, 64], [53, 57, 60], [48, 52, 55], [57, 60, 64]]
ROOTS = [33, 29, 36, 31, 33, 29, 36, 33]
drums, mus = buf(), buf()
K, C = kick(), clap()
LOGO = TL['marks']['logo']
for b in range(int(DUR / BEAT)):
    t = b * BEAT; bar = b // 4; pos = b % 4
    if t < LOGO:
        place(drums, K, t, 1.0)
        if bar >= 1 and pos in (1, 3): place(drums, C, t, 0.9, 0.1)
        if bar >= 2 and pos == 3: place(drums, K, t + BEAT * 0.75, 0.55)   # syncope
        for h in range(2): place(drums, hat(), t + h * BEAT / 2, 0.8 if h else 0.5, -0.3)
        if 8.0 <= t < 10.0:                                                 # montée : double-croches
            for h in (1, 3): place(drums, hat(), t + h * BEAT / 4, 0.35 + 0.2 * (t - 8) / 2, 0.3)
        if t >= 10.0 and pos == 1: place(drums, hat(True), t + BEAT / 2, 0.6, 0.4)
    elif t < DUR - 0.8 and t > LOGO:                                        # après le logo : pouls léger
        place(drums, hat(), t, 0.35, -0.3)
# basse : croches courtes sur la fondamentale, octave sur le contretemps
for b8 in range(int(LOGO / (BEAT / 2))):
    t = b8 * BEAT / 2; bar = int(t // 2)
    if bar == 0 and b8 % 2: continue
    m = ROOTS[bar] + (12 if b8 % 4 == 3 else 0)
    place(mus, bass(m, BEAT / 2 * 0.8), t, 0.9)
# arpège pluck (entrée à 2 s), en double-croches sur la montée
for b16 in range(int(LOGO / (BEAT / 4))):
    t = b16 * BEAT / 4; bar = int(t // 2)
    if t < 2.0 or (b16 % 2 and not (8 <= t < 12)): continue
    ch = CH[bar]; m = ch[(b16 // (1 if 8 <= t < 12 else 2)) % 3] + 12
    place(mus, pluck(m, 0.18), t, 0.8, -0.35 if b16 % 4 < 2 else 0.35)
# montée de bruit filtré 8,5 → 10 s
n = int(1.5 * SR); tt = np.arange(n) / SR
r = noise(n); r = np.concatenate([bp(r[i:i + 2400], 400 + 5000 * (i / n) ** 2, 1200 + 9000 * (i / n) ** 2) for i in range(0, n, 2400)])[:n]
place(mus, r * (tt / 1.5) ** 2 * 0.18, 8.5, 1.0)
# accord final sur le logo : basse tenue + accord pluck long
place(mus, bass(33, 2.4) * np.exp(-np.arange(int(2.4 * SR)) / SR / 1.2), LOGO, 0.9)
for i, m in enumerate(CH[-1] + [69]): place(mus, pluck(m + 12, 1.1), LOGO + i * 0.03, 0.9, [-0.4, 0, 0.4, 0.1][i])
place(drums, K, LOGO, 1.1)

# pompage léger de la basse et de l'arpège par le kick (sidechain)
duck = np.ones(N)
for b in range(int(LOGO / BEAT) + 1):
    i = int(b * BEAT * SR); m = min(N - i, int(0.22 * SR))
    duck[i:i + m] = np.minimum(duck[i:i + m], 1 - 0.55 * np.exp(-np.arange(m) / SR / 0.07))
mus *= duck[:, None]
out = drums + mus
# fin propre : silence à 15 s
fade = np.ones(N); e0, e1 = int((DUR - 0.6) * SR), int(DUR * SR); fade[e0:e1] = np.linspace(1, 0, e1 - e0) ** 2; fade[e1:] = 0
out *= fade[:, None]; drums *= fade[:, None]
peak = np.abs(out).max(); out /= peak / 0.89; drums /= peak / 0.89
os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
sf.write(os.path.join(ROOT, 'audio/music.wav'), out[:int(DUR * SR)], SR, subtype='PCM_24')
sf.write(os.path.join(ROOT, 'audio/drums.wav'), drums[:int(DUR * SR)].mean(1), SR, subtype='PCM_24')
print('audio/music.wav, audio/drums.wav', f'{DUR}s @ {BPM} BPM')
