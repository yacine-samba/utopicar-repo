"""Musique originale de l'explainer 60 s (v8, voix de Simon) — même instrumentarium que la v7, 120 BPM, do majeur (la m – fa – do – sol), numpy, déterministe.
Pop légère et lumineuse pensée pour un haut-parleur de téléphone (sub contenu, plucks et claps dans les médiums).
Structure calée sur timeline-explainer60.json : attaque franche à 0 s, groove sous l'ouverture, **arrêt net façon disque qui
ralentit** juste avant le verdict (le gag), silence, reprise basse + kick sur « − 1 200 € », groove complet sur le logo,
montée avant la bonne affaire, accent sur « Pas après », accord final sous le CTA.
Sorties : audio/music-explainer60.wav et audio/drums-explainer60.wav (kick, pour beats.py)."""
import json, os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'timeline-explainer60.json')))
M = TL['marks']; SR = 48000; BPM = TL['bpm']; BEAT = 60 / BPM; BAR = 4 * BEAT; DUR = TL['dur']
N = int(SR * (DUR + 1.0)); rng = np.random.default_rng(730)
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

# kick pensé téléphone : attaque plus haute et courte, clic audible, peu de sub
def kick():
    n = int(0.3 * SR); tt = np.arange(n) / SR; f = 68 + 150 * np.exp(-tt / 0.025)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.09)
    click = bp(rng.standard_normal(n), 1500, 6000) * np.exp(-tt / 0.006) * 0.5
    return np.tanh((body + click) * 1.6) * 0.9
# la m, fa, do, sol
CHORDS = [[69, 72, 76], [65, 69, 72], [67, 72, 76], [67, 71, 74]]
ROOTS = [45, 41, 48, 43]
drums, mus = buf(), buf()
K, CL = kick(), clap()
nb = int(DUR / BEAT)
# repères issus de la voix : sections basculées sur le temps le plus proche
grid = lambda t: round(t / (BEAT / 2)) * (BEAT / 2)
M = dict(M); M['stop'] = M['fini'] - 0.15; M['drop'] = grid(M['voici'])
def section(t):
    if t < M['annonce']: return 'intro'
    if t < M['stop']: return 'low'
    if t < M['drop']: return 'silence'
    if t >= M['logo']: return 'end'
    return 'full'
for b in range(nb):
    t = b * BEAT; pos = b % 4; sec = section(t)
    if sec == 'intro':
        put(drums, K, t, 0.8 if pos in (0, 2) else 0.0)
        if pos in (1, 3): put(drums, CL, t, 0.75, 0.1)
        put(drums, hat(), t + BEAT / 2, 0.7, -0.3)
    elif sec == 'low':
        put(drums, K, t, 0.8)
        if pos in (1, 3): put(drums, snap(), t, 0.8, 0.2)
    elif sec in ('full', 'end'):
        g = 1.0 if sec == 'full' else 0.85
        put(drums, K, t, g * (1.0 if pos == 0 else 0.85))
        if pos in (1, 3): put(drums, CL, t, 0.85 * g, 0.1)
        put(drums, hat(), t + BEAT / 2, 0.8 * g, -0.3)
        for s16 in (1, 3): put(drums, shaker(), t + s16 * BEAT / 4, 0.6 * g, 0.35)
    elif sec == 'fill':
        put(drums, K, t, 0.9)
        for k in range(4): put(drums, CL, t + k * BEAT / 4, 0.2 + 0.12 * k + 0.08 * pos, 0.1)
# basse (médiums : octave haute + harmonique, sub contenu)
for e in range(int(DUR / (BEAT / 2))):
    t = e * BEAT / 2; bar = int(t // BAR); sec = section(t)
    r = ROOTS[bar % 4] + 12
    if sec in ('full', 'end', 'fill', 'low'): put(mus, bass(r + (12 if e % 4 == 3 else 0), BEAT / 2 * 0.8), t, 0.7 if sec != 'low' else 0.8)
    elif sec == 'intro' and e % 4 == 0: put(mus, bass(r, BEAT * 1.6), t, 0.6)
# plucks et marimba
for e in range(int(DUR / (BEAT / 2))):
    t = e * BEAT / 2; bar = int(t // BAR); sec = section(t)
    if sec in ('silence', 'low'): continue
    ch = CHORDS[bar % 4]; m = ch[e % 3] + (12 if (e // 3) % 2 else 0)
    if sec == 'intro': put(mus, pluck(m, 0.14, 3000), t, 0.55, 0.3 if e % 2 else -0.3)
    else:
        put(mus, pluck(m, 0.13, 3800), t, 0.55, 0.35 if e % 2 else -0.35)
        if e % 4 == 2: put(mus, marimba(m + 12, 0.25), t, 0.35, 0.1)
# marimba discrète sous « − 1 200 € » (tension, sans plucks)
for e in range(int((M['stop'] - M['annonce']) / BEAT)):
    t = grid(M['annonce']) + e * BEAT; bar = int(t // BAR)
    if e % 2 == 1: put(mus, marimba(CHORDS[bar % 4][0], 0.3), t, 0.4, 0.2)
# stabs sur les grands moments (attaque à 0 s)
for key in ['drop', 'f1', 'f2', 'f3', 'mille', 'f4', 'f5', 'sais', 'logo']:
    t = grid(M[key]); bar = int(t // BAR); put(mus, stab([n + 12 for n in CHORDS[bar % 4]], 0.4), t, 0.5)
put(mus, stab([n + 12 for n in CHORDS[0]], 0.5), 0.0, 0.65); put(drums, K, 0.0, 1.0)
def riser(len_s, g=0.2):
    n = int(len_s * SR); x = rng.standard_normal(n); out = np.zeros(n)
    for i in range(0, n, 2400): c = 400 + 7000 * (i / n) ** 2; out[i:i + 2400] = bp(x[i:i + 2400], c * 0.5, min(c * 1.5, 20000))
    return out * (np.arange(n) / n) ** 2 * g
put(mus, riser(M['drop'] - M['stop']), M['stop'], 0.6); put(mus, riser(BAR), grid(M['logo']) - BAR, 0.8)
FIN = M['end']
for i, m in enumerate([48, 60, 64, 67, 72, 76]): put(mus, pluck(m, 1.6, 4200), grid(M['cta'] + 1.0) + i * 0.02, 0.8, [-0.3, 0.2, -0.1, 0.3, -0.2, 0.35][i])
duck = np.ones(N)
for b in range(nb):
    t = b * BEAT
    if section(t) not in ('full', 'end', 'low'): continue
    i = int(t * SR); m = min(N - i, int(0.2 * SR)); duck[i:i + m] = np.minimum(duck[i:i + m], 1 - 0.4 * np.exp(-np.arange(m) / SR / 0.06))
mus *= duck[:, None]
out = drums + mus
# arrêt net : le son ralentit jusqu'à l'arrêt en 0,3 s (disque qui ralentit), puis silence jusqu'à « − 1 200 € »
def tape_stop(x, n):
    idx = np.cumsum(np.linspace(1, 0, n)); idx = idx[idx < len(x) - 1]
    y = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(x.shape[1])], 1)
    return y * np.linspace(1, 0, len(y))[:, None] ** 0.7
i0 = int(M['stop'] * SR); n0 = int(0.3 * SR); i1 = int(M['drop'] * SR)
for x in (out, drums):
    ts = tape_stop(x[i0:i0 + SR].copy(), n0); x[i0:i1] = 0; x[i0:i0 + len(ts)] = ts
# fin : dernière demi-seconde en fondu court (le carton reste lisible jusqu'à la dernière image)
fade = np.ones(N); e0, e1 = int((FIN - 0.45) * SR), int(FIN * SR); fade[e0:e1] = np.linspace(1, 0, e1 - e0) ** 2; fade[e1:] = 0
out *= fade[:, None]; drums *= fade[:, None]
out = hp(out.T, 75, 4).T; drums = hp(drums, 75, 4)  # sub inutile sur téléphone
pk = np.abs(out).max(); out /= pk / 0.89; drums /= pk / 0.89
os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
sf.write(os.path.join(ROOT, 'audio/music-explainer60.wav'), out[: int(DUR * SR)], SR, subtype='PCM_24')
sf.write(os.path.join(ROOT, 'audio/drums-explainer60.wav'), drums[: int(DUR * SR)].mean(1), SR, subtype='PCM_24')
print(f'audio/music-explainer60.wav, audio/drums-explainer60.wav ({DUR} s, {BPM} BPM)')
