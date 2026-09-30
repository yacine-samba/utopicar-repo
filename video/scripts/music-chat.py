"""Musique originale du film « conversation » (v6), 128 BPM, fa majeur, synthétisée en numpy, déterministe.
Registre inspiré de la référence 4 (pop enjouée, claps, plucks), sans en reprendre aucun son ni mélodie.
Structure calée sur timeline-chat.json : plucks sous la recherche, kick doux sous les phrases, groove au pop du logo,
break sur « Mais c'est pas tout », drop sur la macro, panneaux, silence sur la pause noire, claquements sous le message,
roulement sur le kaléidoscope, fin groovy et accord final.
Sorties : audio/music-chat.wav et audio/drums-chat.wav (kick, pour beats.py)."""
import json, os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'timeline-chat.json')))
M = TL['marks']; SR = 48000; BPM = TL['bpm']; BEAT = 60 / BPM; BAR = 4 * BEAT; DUR = TL['dur']
N = int(SR * (DUR + 1.0)); rng = np.random.default_rng(128)
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
def snap():
    n = int(0.08 * SR); return bp(rng.standard_normal(n), 1800, 5000) * env(n, 0.0005, 0.012) * 0.6
def marimba(m, d=0.35):
    n = int(d * 3 * SR); tt = np.arange(n) / SR; f = NOTE(m)
    return (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * f * 4 * tt) * np.exp(-tt / 0.03)) * env(n, 0.001, d * 0.5) * 0.28

# fa majeur : fa, ré m, si♭, do
CHORDS = [[65, 69, 72], [62, 65, 69], [58, 62, 65], [60, 64, 67]]
ROOTS = [41, 38, 34, 36]
drums, mus = buf(), buf()
K, CL = kick(), clap()
nb = int(DUR / BEAT)
def section(t):
    if t < M['bon']: return 'intro'
    if t < M['pop']: return 'talk'
    if M['mais'] <= t < M['macro']: return 'break'
    if M['black'] <= t < M['msg']: return 'silence'
    if M['msg'] <= t < M['kaleido']: return 'soft'
    if M['kaleido'] <= t < M['logo']: return 'fill'
    if t >= M['logo']: return 'end'
    if M['dabord'] <= t < M['swarm']: return 'stop'
    return 'full'
for b in range(nb):
    t = b * BEAT; pos = b % 4; sec = section(t)
    if t >= DUR - 1.4: break
    if sec == 'intro':
        if pos in (1, 3): put(drums, snap(), t, 0.7, 0.2)
    elif sec == 'talk':
        put(drums, K, t, 0.55 if pos else 0.75)
        if pos in (1, 3): put(drums, snap(), t, 0.6, 0.2)
    elif sec in ('full', 'end'):
        g = 1.0 if sec == 'full' else 0.8
        put(drums, K, t, g * (1.0 if pos == 0 else 0.85))
        if pos in (1, 3): put(drums, CL, t, 0.85 * g, 0.1)
        put(drums, hat(), t + BEAT / 2, 0.8 * g, -0.3)
        for s16 in (1, 3): put(drums, shaker(), t + s16 * BEAT / 4, 0.6 * g, 0.35)
    elif sec == 'break':
        if pos in (1, 3): put(drums, snap(), t, 0.7, 0.2)
    elif sec == 'soft':
        if pos in (1, 3): put(drums, snap(), t, 0.8, 0.2)
        if pos == 0 and t >= M['send']: put(drums, K, t, 0.6)
    elif sec == 'fill':
        put(drums, K, t, 0.95)
        for k in range(4): put(drums, CL, t + k * BEAT / 4, 0.25 + 0.15 * k + 0.1 * pos, 0.1)
    elif sec == 'stop':
        pass
# basse
for e in range(int(DUR / (BEAT / 2))):
    t = e * BEAT / 2; bar = int(t // BAR); sec = section(t)
    if t >= DUR - 1.4: break
    r = ROOTS[bar % 4]
    if sec in ('full', 'end', 'fill'): put(mus, bass(r + (12 if e % 4 == 3 else 0), BEAT / 2 * 0.8), t, 0.75)
    elif sec == 'talk' and e % 4 == 0: put(mus, bass(r, BEAT * 1.6), t, 0.6)
# plucks et marimba
for e in range(int(DUR / (BEAT / 2))):
    t = e * BEAT / 2; bar = int(t // BAR); sec = section(t)
    if t >= DUR - 1.4 or sec in ('silence', 'stop'): continue
    ch = CHORDS[bar % 4]; m = ch[e % 3] + (12 if (e // 3) % 2 else 0)
    if sec == 'intro': put(mus, pluck(m, 0.14, 1400 + 1200 * t / M['bon']), t, 0.5, 0.3 if e % 2 else -0.3)
    elif sec in ('talk', 'break', 'soft'): 
        if e % 2 == 0: put(mus, marimba(m), t, 0.55, 0.25 if e % 4 else -0.25)
    else:
        put(mus, pluck(m, 0.13, 3600), t, 0.55, 0.35 if e % 2 else -0.35)
        if e % 4 == 2: put(mus, marimba(m + 12, 0.25), t, 0.35, 0.1)
# stabs sur les grands moments
for key in ['pop', 'ringUI', 'window', 'macro', 'pRap', 'pParc', 'pKpi', 'pSearch', 'icons', 'logo']:
    t = M[key]; bar = int(t // BAR); put(mus, stab([n + 12 for n in CHORDS[bar % 4]], 0.4), t, 0.5)
def riser(len_s, g=0.2):
    n = int(len_s * SR); x = rng.standard_normal(n); out = np.zeros(n)
    for i in range(0, n, 2400): c = 400 + 7000 * (i / n) ** 2; out[i:i + 2400] = bp(x[i:i + 2400], c * 0.5, min(c * 1.5, 20000))
    return out * (np.arange(n) / n) ** 2 * g
put(mus, riser(BAR), M['pop'] - BAR, 0.9); put(mus, riser(BAR), M['macro'] - BAR, 0.9); put(mus, riser(BAR), M['logo'] - BAR, 0.9)
END = M['end']
for i, m in enumerate([41, 53, 60, 65, 69, 72]): put(mus, pluck(m, 1.7, 4200), END - 1.9 + i * 0.02, 0.8, [-0.3, 0.2, -0.1, 0.3, -0.2, 0.35][i])
# silence net sur la pause noire (queues coupées)
i0, i1 = int(M['black'] * SR), int(M['msg'] * SR); ramp = int(0.05 * SR)
for x in (mus, drums):
    x[i0:i0 + ramp] *= np.linspace(1, 0, ramp)[:, None]; x[i0 + ramp:i1] = 0
duck = np.ones(N)
for b in range(nb):
    t = b * BEAT
    if section(t) not in ('full', 'end'): continue
    i = int(t * SR); m = min(N - i, int(0.2 * SR)); duck[i:i + m] = np.minimum(duck[i:i + m], 1 - 0.45 * np.exp(-np.arange(m) / SR / 0.06))
mus *= duck[:, None]
out = drums + mus
fade = np.ones(N); e0, e1 = int((DUR - 1.1) * SR), int(DUR * SR); fade[e0:e1] = np.linspace(1, 0, e1 - e0) ** 2; fade[e1:] = 0
out *= fade[:, None]; drums *= fade[:, None]
pk = np.abs(out).max(); out /= pk / 0.89; drums /= pk / 0.89
os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
sf.write(os.path.join(ROOT, 'audio/music-chat.wav'), out[: int(DUR * SR)], SR, subtype='PCM_24')
sf.write(os.path.join(ROOT, 'audio/drums-chat.wav'), drums[: int(DUR * SR)].mean(1), SR, subtype='PCM_24')
print(f'audio/music-chat.wav, audio/drums-chat.wav ({DUR} s, {BPM} BPM)')
