"""Musique originale du film explicatif (v5), 120 BPM, la majeur, synthétisée en numpy, déterministe.
Registre inspiré de la référence 3 (pop électronique claire, percussions nettes), sans en reprendre aucun son ni mélodie.
Structure calée sur timeline-explainer.json : intro filtrée sous le problème, kick qui entre, drop au flash,
groove sous les chapitres, respiration sous Sans / Avec, montée du récap, drop « Tu revends », fin posée.
Sorties : audio/music-explainer.wav et audio/drums-explainer.wav (kick, pour beats.py)."""
import json, os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'timeline-explainer.json')))
M = TL['marks']; SR = 48000; BPM = TL['bpm']; BEAT = 60 / BPM; BAR = 4 * BEAT; DUR = TL['dur']
N = int(SR * (DUR + 1.0)); rng = np.random.default_rng(120)
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

def hat(open_=False):
    n = int((0.16 if open_ else 0.05) * SR); return hp(rng.standard_normal(n), 7500, 4) * env(n, 0.001, 0.05 if open_ else 0.012) * 0.3
def pad(ms, length, bright=1800):
    n = int(length * SR); tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * NOTE(m) * tt * (1 + d)) for m in ms for d in (-0.003, 0.003)) / (2 * len(ms))
    return lp(x, bright) * np.minimum(1, tt / 0.3) * np.minimum(1, (length - tt) / 0.4).clip(0) * 0.35

# la majeur : la, fa# m, ré, mi (une mesure chacun)
CHORDS = [[69, 73, 76], [66, 69, 73], [62, 66, 69], [64, 68, 71]]
ROOTS = [45, 42, 38, 40]
drums, mus = buf(), buf()
K, CL = kick(), clap()
DROP, SANS, R1, R3, BURST, LOGO, END = M['flash'], M['sans'], M['r1'], M['r3'], M['burst'], M['logo'], M['end']
nb = int(DUR / BEAT)
full_on = lambda t: (DROP <= t < SANS) or (R3 <= t < LOGO)
for b in range(nb):
    t = b * BEAT; pos = b % 4
    if t >= DUR - 1.5: break
    if t < M['p3']: pass
    elif t < DROP: put(drums, K, t, 0.5 if pos else 0.7)                        # kick doux sous le problème
    elif full_on(t):
        put(drums, K, t, 1.0 if pos == 0 else 0.85)
        if pos in (1, 3): put(drums, CL, t, 0.8, 0.1)
        put(drums, hat(), t + BEAT / 2, 0.8, -0.3)
        if pos == 3: put(drums, hat(True), t + BEAT / 2, 0.5, 0.3)
    elif SANS <= t < R1:                                                           # respiration : kick sur le 1, charleston
        if pos == 0: put(drums, K, t, 0.75)
        put(drums, hat(), t + BEAT / 2, 0.45, -0.3)
    elif R1 <= t < R3:                                                             # récap : ça remonte
        put(drums, K, t, 0.9 if pos == 0 else 0.7)
        if pos in (1, 3): put(drums, CL, t, 0.6, 0.1)
    else:                                                                          # fin : groove léger
        put(drums, K, t, 0.7 if pos == 0 else 0.45)
        put(drums, hat(), t + BEAT / 2, 0.4, -0.3)
    for s16 in range(4):
        if full_on(t): put(drums, shaker(), t + s16 * BEAT / 4, 0.7 if s16 % 2 else 0.35, 0.35)
# roulement de caisse claire avant le drop « Tu revends »
for i in range(16):
    t = R3 - 2 * BEAT + i * BEAT / 8; put(drums, CL, t, 0.15 + 0.5 * i / 16, 0.1)
# basse (croches) sous les sections pleines, rondes sous la respiration
for e in range(int(DUR / (BEAT / 2))):
    t = e * BEAT / 2; bar = int(t // BAR)
    if t >= DUR - 1.5: break
    r = ROOTS[bar % 4]
    if full_on(t) or (R1 <= t < R3): put(mus, bass(r + (12 if e % 4 == 3 else 0), BEAT / 2 * 0.85), t, 0.8)
    elif SANS <= t < R1 and e % 8 == 0: put(mus, bass(r, BAR * 0.9), t, 0.7)
    elif t >= LOGO and e % 4 == 0: put(mus, bass(r, BEAT * 1.6), t, 0.6)
# arpège pluck (doubles-croches) : filtré au début, ouvert au drop, discret sous la respiration
for e in range(int(DUR / (BEAT / 4))):
    t = e * BEAT / 4; bar = int(t // BAR)
    if t >= DUR - 1.5 or e % 2: continue
    ch = CHORDS[bar % 4]; m = ch[(e // 2) % 3] + (12 if (e // 6) % 2 else 0)
    if t < DROP: bright, g = 700 + 2200 * (t / DROP) ** 1.5, 0.5
    elif SANS <= t < R1: bright, g = 1600, 0.35
    elif t >= LOGO: bright, g = 2600, 0.4
    else: bright, g = 3600, 0.6
    put(mus, pluck(m, 0.15, bright), t, g, -0.35 if (e // 2) % 2 else 0.35)
# nappes sous la respiration et la fin
for bar in range(int(DUR / BAR)):
    t = bar * BAR
    if SANS <= t < R1 or t >= LOGO: put(mus, pad([n - 12 for n in CHORDS[bar % 4]], BAR + 0.3), t, 0.9)
# stabs d'accords sur les grands moments
for key in ['flash', 'stat1', 'stat2', 'stat3', 'r3', 'logo']:
    t = M[key]; bar = int(t // BAR); put(mus, stab([n + 12 for n in CHORDS[bar % 4]], 0.45), t, 0.55)
# cloches sur les bascules d'interrupteur (quinte au-dessus)
for key in ['ch1', 'ch2', 'ch3']:
    t = M[key] + 1.0; put(mus, pluck(88, 0.5, 6000), t, 0.35, 0.2); put(mus, pluck(93, 0.5, 6000), t + BEAT / 2, 0.3, -0.2)
def riser(len_s, g=0.2):
    n = int(len_s * SR); x = rng.standard_normal(n); out = np.zeros(n)
    for i in range(0, n, 2400): c = 400 + 7000 * (i / n) ** 2; out[i:i + 2400] = bp(x[i:i + 2400], c * 0.5, min(c * 1.5, 20000))
    return out * (np.arange(n) / n) ** 2 * g
put(mus, riser(BAR), DROP - BAR, 1.0); put(mus, riser(BAR), R3 - BAR, 1.0); put(mus, riser(BAR), LOGO - BAR, 0.9)
# accord final tenu
for i, m in enumerate([45, 57, 64, 69, 73, 76]): put(mus, pluck(m, 1.8, 4200), END - 2.0 + i * 0.02, 0.8, [-0.3, 0.2, -0.1, 0.3, -0.2, 0.35][i])
duck = np.ones(N)
for b in range(nb):
    t = b * BEAT
    if not (full_on(t) or R1 <= t < R3): continue
    i = int(t * SR); m = min(N - i, int(0.2 * SR)); duck[i:i + m] = np.minimum(duck[i:i + m], 1 - 0.45 * np.exp(-np.arange(m) / SR / 0.06))
mus *= duck[:, None]
out = drums + mus
fade = np.ones(N); e0, e1 = int((DUR - 1.2) * SR), int(DUR * SR); fade[e0:e1] = np.linspace(1, 0, e1 - e0) ** 2; fade[e1:] = 0
out *= fade[:, None]; drums *= fade[:, None]
pk = np.abs(out).max(); out /= pk / 0.89; drums /= pk / 0.89
os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
sf.write(os.path.join(ROOT, 'audio/music-explainer.wav'), out[: int(DUR * SR)], SR, subtype='PCM_24')
sf.write(os.path.join(ROOT, 'audio/drums-explainer.wav'), drums[: int(DUR * SR)].mean(1), SR, subtype='PCM_24')
print(f'audio/music-explainer.wav, audio/drums-explainer.wav ({DUR} s, {BPM} BPM)')
