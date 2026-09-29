"""Sound design original du film de lancement (v3), synthétisé en numpy, déterministe.
Registre inspiré de la référence 1 (sans en reprendre aucun son ni aucune mélodie) :
nappe tonale en ré mineur, souffles graves, notes cristallines sur l'apparition des mots, impact grave sur le logo,
coups sourds sur les alignements, montée vers le flash blanc, accord final. Pulsation grave très discrète à 120 BPM
(3,5–11,5 s), sentie plus qu'entendue, qui sert à mesurer la grille (beats.py).
Sorties : audio/music-launch.wav (bande-son complète) et audio/drums-launch.wav (pulsation + impacts)."""
import json, os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'timeline-launch.json')))
M = TL['marks']; SR = 48000; DUR = TL['dur']; N = int(SR * (DUR + 3.0))
rng = np.random.default_rng(26)
T = np.arange(N) / SR
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x, axis=0)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)
def st(x, pan=0.0): return np.stack([x * np.sqrt((1 - pan) / 2), x * np.sqrt((1 + pan) / 2)], 1) * np.sqrt(2)
def put(dst, x, t, g=1.0):
    i = int(round(t * SR)); x = x if x.ndim == 2 else st(x); j = min(len(dst), i + len(x))
    if i < 0: x = x[-i:]; j = min(len(dst), len(x)); i = 0
    dst[i:j] += x[:j - i] * g
def env_pts(pts):  # enveloppe par points (temps, gain) interpolée
    ts, gs = zip(*pts); return np.interp(T, ts, gs)
# réverbération : réponse impulsionnelle synthétique (bruit à décroissance exponentielle), stéréo décorrélée
def reverb(x, decay=2.6, wet=0.35, tone=5500):
    n = int(decay * 1.4 * SR); tt = np.arange(n) / SR
    ir = np.stack([rng.standard_normal(n), rng.standard_normal(n)], 1) * np.exp(-tt / (decay / 6.9))[:, None]
    ir = lp(ir, tone); ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]; ir /= np.abs(ir).sum(0).max() / 12
    y = np.stack([fftconvolve(x[:, k], ir[:, k])[: len(x)] for k in range(2)], 1)
    return x * (1 - wet) + y * wet

bus = {k: np.zeros((N, 2)) for k in ['pad', 'sub', 'fx', 'bell', 'pulse']}

# 1. nappe en ré mineur (ré, la, fa, puis mi = add9), voix légèrement désaccordées, filtre qui respire
pad = np.zeros(N)
for m, g, det in [(38, 0.9, 0.0), (45, 0.7, 0.13), (53, 0.5, -0.11), (57, 0.35, 0.07), (64, 0.22, 0.05)]:
    for d in (-det, det):
        f = NOTE(m) * 2 ** (d / 12)
        pad += g * (np.sin(2 * np.pi * f * T) + 0.35 * np.sin(2 * np.pi * 2 * f * T + 1.3) + 0.15 * np.sin(2 * np.pi * 3 * f * T + 0.4))
pad = lp(pad, 1400)
LG = M['logo']
pad_env = env_pts([(0, 0.0), (0.3, 0.12), (LG - 0.05, 0.22), (LG + 0.1, 0.35), (3.4, 0.3), (3.6, 0.18), (5.8, 0.3), (6.1, 0.22), (8.5, 0.42),
                   (8.9, 0.3), (11.4, 0.7), (11.55, 0.0), (12.25, 0.0), (12.4, 0.0), (DUR + 3, 0.0)])
bus['pad'] += st(pad * pad_env, 0.0)
# légère modulation stéréo (chorus lent)
bus['pad'][:, 0] *= 1 + 0.08 * np.sin(2 * np.pi * 0.21 * T); bus['pad'][:, 1] *= 1 + 0.08 * np.sin(2 * np.pi * 0.17 * T + 1)

# 2. souffles graves (sub) qui montent vers les moments forts
sub = np.sin(2 * np.pi * NOTE(26) * T) * env_pts([(0, 0), (LG - 0.2, 0.55), (LG + 0.05, 0.0), (5.5, 0.0), (7.4, 0.35), (7.6, 0.0), (9.5, 0.0), (11.45, 0.8), (11.55, 0), (DUR + 3, 0)])
bus['sub'] += st(sub)

# 3. impact grave sur le logo (+ montée inversée juste avant)
def boom(len_s=3.0, f0=55, f1=31, g=1.0):
    n = int(len_s * SR); tt = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-tt / 0.08)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.9)
    crack = hp(rng.standard_normal(n), 900) * np.exp(-tt / 0.03) * 0.5
    return np.tanh((body + crack) * 1.6) * g
def reverse_swell(len_s=1.2):
    n = int(len_s * SR); x = bp(rng.standard_normal(n), 300, 6000) * np.exp(-np.arange(n) / SR / 0.35)
    return x[::-1] * 0.5
put(bus['fx'], reverse_swell(1.2), M['logo'] - 1.2, 0.9)
put(bus['fx'], boom(3.0), M['logo'], 1.0)

# 4. souffles d'air sur les changements de scène
def air(len_s=1.6):
    n = int(len_s * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n)
    out = np.zeros(n); step = 2400
    for i in range(0, n, step):
        c = 500 + 4500 * np.sin(np.pi * min(1, i / n)) ** 2
        out[i:i + step] = bp(x[i:i + step], c * 0.6, min(c * 1.6, 20000))
    return out * np.sin(np.pi * tt / len_s) ** 2 * 0.35
for c in TL['cues']:
    if c['sfx'] == 'air': put(bus['fx'], st(air(1.6), -0.2), c['t'] - 0.8, 1.0)

# 5. coups sourds (arcs qui se referment, blocs alignés)
def thud():
    n = int(1.2 * SR); tt = np.arange(n) / SR; f = 48 + 60 * np.exp(-tt / 0.03)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.28) + lp(rng.standard_normal(n), 900) * np.exp(-tt / 0.02) * 0.3) * 0.8
for c in TL['cues']:
    if c['sfx'] == 'thud': put(bus['fx'], thud(), c['t'], 0.9)

# 6. notes cristallines : une par lettre de l'accroche et par mot (gamme de ré mineur, aiguë)
SCALE = [74, 77, 81, 84, 86, 88, 89, 93]
def bell(m, len_s=1.8, g=0.22):
    n = int(len_s * SR); tt = np.arange(n) / SR; f = NOTE(m)
    x = np.sin(2 * np.pi * f * tt + 1.8 * np.sin(2 * np.pi * f * 3.5 * tt) * np.exp(-tt / 0.18))
    x += 0.3 * np.sin(2 * np.pi * f * 2.01 * tt)
    return x * np.minimum(1, tt / 0.004) * np.exp(-tt / 0.55) * g
k = 0
events = [M['voici'] + 0.06 * i for i in range(5)]
for P in TL['phrases']: events += [P['t'] + 0.2 * i for i in range(len(P['words']))]
events += [TL['cta']['t'] + 0.2 * i for i in range(len(TL['cta']['words']))]
for i, te in enumerate(sorted(events)):
    put(bus['bell'], st(bell(SCALE[(i * 3) % len(SCALE)], g=0.16 if te < 1.5 else 0.2), [-0.4, 0.3, -0.1, 0.45][i % 4]), te)

# 7. montée vers le flash (bruit filtré qui s'ouvre + ton qui monte), puis éclat et coupure
n = int(2.0 * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n); rise = np.zeros(n)
for i in range(0, n, 2400):
    c = 300 + 9000 * (i / n) ** 2.2; rise[i:i + 2400] = bp(x[i:i + 2400], c * 0.5, min(c * 1.4, 20000))
tone = np.sin(2 * np.pi * np.cumsum(NOTE(50) * 2 ** (2 * tt / 2.0)) / SR) * 0.25
put(bus['fx'], st((rise * 0.5 + tone) * (tt / 2.0) ** 2.5), M['flash'] - 2.0, 1.0)
flash_n = int(1.5 * SR); ft = np.arange(flash_n) / SR
put(bus['fx'], st(hp(rng.standard_normal(flash_n), 2500) * np.exp(-ft / 0.25) * 0.45), M['flash'], 1.0)
put(bus['fx'], boom(2.5, 70, 36, 0.7), M['flash'], 1.0)

# 8. accord final (ré mineur add9), façon piano doux, longue queue
def piano(m, len_s=3.2, g=0.25):
    n = int(len_s * SR); tt = np.arange(n) / SR; f = NOTE(m)
    x = sum(np.sin(2 * np.pi * f * h * tt * (1 + 0.0004 * h * h)) * (0.55 ** (h - 1)) * np.exp(-tt * (0.9 + 0.5 * h)) for h in range(1, 7))
    return x * np.minimum(1, tt / 0.003) * g
for i, m in enumerate([50, 57, 62, 65, 69, 76]):
    put(bus['bell'], st(piano(m, g=0.2 if m > 60 else 0.26), [-0.3, 0.2, -0.1, 0.3, -0.25, 0.35][i]), M['end'] + 0.03 * i)

# 9. pulsation grave très discrète (sentie, pas entendue), sur la grille 120 BPM de 3,5 à 11,5 s
def pulse():
    n = int(0.35 * SR); tt = np.arange(n) / SR; f = 50 + 40 * np.exp(-tt / 0.02)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.09)
b = M['shot3']
while b < M['flash'] - 0.01:
    put(bus['pulse'], pulse(), b, 0.16 if (round(b * 2) % 4) else 0.22); b += 0.5

# mix des bus, réverbération sur les éléments aériens
out = (reverb(bus['pad'], 3.2, 0.3) * 0.9 + bus['sub'] * 0.55 + reverb(bus['fx'], 2.4, 0.28) + reverb(bus['bell'], 3.0, 0.45) * 0.9 + bus['pulse'] * 0.9)
fade = np.ones(N); e0, e1 = int((DUR - 0.9) * SR), int(DUR * SR); fade[e0:e1] = np.linspace(1, 0, e1 - e0) ** 2; fade[e1:] = 0
out *= fade[:, None]
out = out[: int(DUR * SR)]; out /= np.abs(out).max() / 0.89
drums = (bus['pulse'] + bus['fx'] * 0.0).mean(1)[: int(DUR * SR)]
drums /= np.abs(drums).max() / 0.89
os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
sf.write(os.path.join(ROOT, 'audio/music-launch.wav'), out, SR, subtype='PCM_24')
sf.write(os.path.join(ROOT, 'audio/drums-launch.wav'), drums, SR, subtype='PCM_24')
print(f'audio/music-launch.wav, audio/drums-launch.wav ({DUR} s, {len(events)} notes cristallines)')
