"""Présentation UTOPICAR 30 s, sans voix : musique ElevenLabs montée sur la grille du film (120 BPM, 1 temps = 0,5 s),
bruitages ElevenLabs du master60 posés aux repères publiés par le film (window.cues → audio/cues-presente30.json).
Musique : audio/presente30/eleven/musique-1gY50EWAhzOq5mE0bh5D.mp3 (120,00 BPM, résidu 19 ms, aucune voix détectée) :
mesures 8 → 13 de 0 à 12 s, la mesure 15 (coupure) étouffée de 12 à 14 s, drop (mesure 16) sur 14 s, mesures 16 → 21
jusqu'à 26 s, un temps d'arrêt, coup final du morceau (64,0 s) sur le logo de 26 s et sa traîne.
usage (depuis video/) : node scripts/cues-presente30.mjs && python3 scripts/audio-presente30.py → audio/mix-presente30.wav
"""
import os, json
import numpy as np, librosa, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
from scipy.ndimage import minimum_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
DUR = json.load(open(os.path.join(ROOT, 'timeline-presente30.json')))['dur']
N = int(round(DUR * SR))
EL = A('master60w', 'eleven')
CUES = json.load(open(A('cues-presente30.json')))
def db(x): return 10 ** (x / 20)
def bp(y, lo=None, hi=None, order=4):
    if lo: y = sosfilt(butter(order, lo, 'hp', fs=SR, output='sos'), y, axis=0)
    if hi: y = sosfilt(butter(order, hi, 'lp', fs=SR, output='sos'), y, axis=0)
    return y
def curve(points, n=N):
    xs, ys = zip(*points); return np.interp(np.arange(n) / SR, xs, ys)

# ---------- musique ----------
src = librosa.load(A('presente30', 'eleven', 'musique-1gY50EWAhzOq5mE0bh5D.mp3'), sr=SR, mono=False)[0].T
D = lambda k: 0.774 + 2.0 * k                      # premier temps de la mesure k du morceau
HIT = 64.006                                       # coup final du morceau (onset mesuré)
mus = np.zeros((N, 2))
def put(t0, t1, s0, fi=0.003, fo=0.003):
    a, b = int(round(t0 * SR)), int(round(t1 * SR)); i0 = int(round(s0 * SR)); seg = src[i0:i0 + (b - a)].copy(); b = a + len(seg)
    if fi: k = int(fi * SR); seg[:k] *= np.sin(np.linspace(0, np.pi / 2, k))[:, None]
    if fo: k = int(fo * SR); seg[-k:] *= np.cos(np.linspace(0, np.pi / 2, k))[:, None]
    mus[a:b] += seg
put(0, 12.01, D(8), fi=0.004, fo=0.02)
brk = np.zeros((N, 2)); a, b = int(12 * SR), int(14 * SR); brk[a:b] = src[int(D(15) * SR):int(D(15) * SR) + (b - a)]
brk = bp(brk, None, 900) * curve([(0, 0), (11.99, 0), (12.0, 1), (13.5, 1), (13.9, 0), (DUR, 0)])[:, None] * db(-4)
mus += brk
put(13.99, 25.5, D(16) - 0.01, fi=0.003, fo=0.03)            # drop sur 14 s ; arrêt d'un temps avant le logo
put(26.0 - 0.01, DUR, HIT - 0.01, fi=0.003, fo=0)
mus *= curve([(0, 1), (25.9, 1), (26.0, db(2)), (28.0, db(2)), (DUR - 0.15, db(-10)), (DUR, 0)])[:, None]
mlow = bp(mus, None, 150); mus = (mus - mlow) + mlow * db(-11); mus = bp(mus, 60, None, 2)
mus = mus + bp(mus, 1500, 5000, 2) * (db(3) - 1)          # téléphone : présence remontée
duck = np.zeros(N)
# ---------- bruitages ElevenLabs ----------
# type → variations (id ElevenLabs), découpe utile (s), crête visée (dBFS), bande, priorité
SFX = {
    'impact':   (['XdL5urufpCbm871pFAXd', 'Qdtw6bl4Rb3MmwEPmotC'], 0.75, -4, (35, 16000), 1),
    'tapestop': (['9S1S23qAwZKl50lrsqud'], 0.6, -16, (60, 12000), 1),
    'suck':     (['ZU05VchCIh1GQ312Ouej'], None, -11, (200, 14000), 1),
    'thud':     (['7rKx4W4iGqWrZ0jz2wFP', 'ucv1scUU7EL0TlaKDswz'], 0.4, -9, (80, 12000), 1),
    'click':    (['yymFsXmOF34a0Wx700Oo', 'ATLKrH4q8zBksXS7koPd'], 0.065, -11, (400, 14000), 1),
    'ding':     (['I926zzANA0Hq7GyKfqPI'], 1.0, -11, (400, 14000), 1),
    'roll':     (['zyrCN5AGZ4ifzBraCncB'], 0.75, -17, (700, 14000), 2),
    'whoosh':   (['9uu5N0f4jSpDE4efetVC', 'rdvOxecFEfq2CQ7LjUnD', 'Nbw8qeLBXWPnq51JF6jO'], 0.4, -15, (200, 10000), 2),
    'type':     (['N9LZRN6RiuOK2Hkzf2UJ'], 0.5, -16, (500, 14000), 2),
    'sent':     (['Jtt9zqJ9hz3LHM9TSuHV'], 0.16, -17, (500, 14000), 2),
    'pop':      (['gt26tFt4uO98tnaurlYo', 'DTF1oItCkJVPcWDY2S7H'], 0.12, -19, (600, 14000), 3),
}
cache = {}
def clip(k, gid, st=0.0):
    key = (k, gid, round(st, 2))
    if key not in cache:
        y = librosa.load(os.path.join(EL, f'{k}-{gid}.mp3'), sr=SR, mono=True)[0]
        dur = SFX[k][1]
        if k == 'suck':                                     # aspiration : coupée juste après son pic
            ip = int(np.argmax(np.abs(y))); y = y[:ip + int(0.02 * SR)]
        else:
            nz = np.where(np.abs(y) > 0.05 * np.abs(y).max())[0]
            y = y[max(0, nz[0] - int(0.002 * SR)):]           # attaque calée : silence de tête retiré
            y = y[:int(dur * SR)]
        if st: y = librosa.effects.pitch_shift(y, sr=SR, n_steps=st)
        f = int(0.005 * SR) if k == 'suck' else min(int(0.03 * SR), len(y) // 3); y[-f:] *= np.linspace(1, 0, f)
        y = bp(y, *SFX[k][3], order=2)
        if k == 'impact':                                   # harmoniques pour un haut-parleur de téléphone
            y = y / np.abs(y).max(); y = y + 0.45 * bp(np.tanh(5 * y) / np.tanh(5), 300, 6000, 2)
        cache[key] = y / (np.abs(y).max() + 1e-9)
    return cache[key]
# suites : chaque son d'une même suite monte (pops sur une gamme, clics +0 +2 +4 +7, messages +½ ton)
SCALE = [0, 2, 4, 5, 7, 9, 11, 12]
cues = sorted(CUES, key=lambda c: c['t'])
run, last = {}, {}
for c in cues:
    k = c['k']; gap = {'click': 0.7, 'sent': 0.3, 'pop': 0.42}.get(k)
    i = run.get(k, -1) + 1 if gap and k in last and c['t'] - last[k] < gap else 0
    run[k], last[k] = i, c['t']
    c['st'] = {'pop': SCALE[i % 8], 'click': [0, 2, 4, 7][min(i, 3)], 'sent': 0.5 * i}.get(k, 0) if gap else 0
    c['pan'] = (0.12 if i % 2 else -0.12) if i else 0.0
# un son moins prioritaire à moins de 0,12 s d'un plus prioritaire est retiré
kept, dropped = [], []
for c in cues:
    clash = any(o is not c and abs(o['t'] - c['t']) < 0.12 and SFX[o['k']][4] < SFX[c['k']][4] for o in cues)
    (dropped if clash else kept).append(c)
fx = np.zeros((N, 2)); acc = np.zeros(N); rr = {}
for c in kept:
    ids, _, pk, _, _ = SFX[c['k']]
    j = rr.get(c['k'], 0); rr[c['k']] = j + 1
    y = clip(c['k'], ids[j % len(ids)], c['st']) * db(pk) * c['g']
    t0 = c['t']
    if c['k'] == 'suck': t0 = c['t'] + 0.62 - len(y) / SR + 0.02        # le pic de l'aspiration sur « Hop ! »
    if c['k'] == 'whoosh': t0 -= 0.03
    i = int(round(t0 * SR)); y = y[:max(0, N - i)]
    if i < 0: y = y[-i:]; i = 0
    p = (c['pan'] + 1) * np.pi / 4
    fx[i:i + len(y), 0] += y * np.cos(p) * np.sqrt(2); fx[i:i + len(y), 1] += y * np.sin(p) * np.sqrt(2)
    if c['k'] in ('impact', 'suck', 'tapestop'): acc[i:i + len(y)] = 1
ir = np.random.default_rng(5).standard_normal(int(0.45 * SR)) * np.exp(-np.arange(int(0.45 * SR)) / (0.08 * SR))
ir = bp(ir, 300, 7000); ir /= np.sqrt((ir ** 2).sum())
for ch in range(2): fx[:, ch] += fftconvolve(fx[:, ch], ir)[:N] * db(-15)

# ---------- somme : la musique porte, les bruitages dessinent (musique 4 dB sous les bruitages au bus) ----------
mus_st = mus / (np.abs(mus).max() + 1e-9) * db(-8)
mix = mus_st + fx
def comp(x, thr=-14, ratio=1.8):
    e = np.abs(x).max(1); k = int(0.01 * SR); e = np.convolve(e, np.ones(k) / k, 'same')
    l = 20 * np.log10(e + 1e-9); g = np.where(l > thr, (thr + (l - thr) / ratio) - l, 0)
    return x * db(g)[:, None]
mix = comp(mix)
meter = pyln.Meter(SR)
def limit(x, ceil_db=-5.0, look=0.004, rel=0.08):
    """limiteur à anticipation : la réduction commence 4 ms avant la crête, relâchement 80 ms"""
    c = db(ceil_db); pk = np.abs(x).max(1)
    need = np.minimum(1.0, c / np.maximum(pk, 1e-9)); la = int(look * SR)
    g = minimum_filter1d(need, size=2 * la + 1)
    r = np.exp(-1 / (rel * SR)); out = np.empty_like(g); s_ = 1.0
    for i, v in enumerate(g):
        s_ = v if v < s_ else r * s_ + (1 - r) * v
        out[i] = s_
    return x * out[:, None]
gain = 0.0
for _ in range(4):
    gl = -14 - meter.integrated_loudness(mix); mix *= db(gl); gain += gl
    mix = limit(mix, -5.0)
tp = lambda x: 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max())
mix *= db(min(-14 - meter.integrated_loudness(mix), -3.5 - tp(mix)))      # dernier réglage : −14 LUFS sans dépasser −3,5 dBTP
os.makedirs(A('stems-presente30'), exist_ok=True)
sf.write(A('mix-presente30.wav'), mix, SR, subtype='PCM_24')
g = db(gain)
for name, x in [('musique', mus_st), ('bruitages', fx)]: sf.write(A('stems-presente30', f'{name}.wav'), x * g, SR, subtype='PCM_24')
ons = librosa.onset.onset_detect(y=(mus_st).mean(1), sr=SR, hop_length=128, units='time')
rep = [f'presente30 · {meter.integrated_loudness(mix):.1f} LUFS, true peak {tp(mix):.1f} dBTP · bruitages {len(kept)} posés, {len(dropped)} retirés']
for nm_, t_ in [('premier temps', 0.0), ('drop', 14.0), ('coup final', 26.0)]:
    o = ons[np.argmin(np.abs(ons - t_))]; rep.append(f'attaque {nm_:14s} prévue {t_:5.2f} s, mesurée {o:5.2f} s ({(o - t_) * 1000:+.0f} ms)')
open(os.path.join(ROOT, 'docs', 'mix_report-presente30.txt'), 'w').write('\n'.join(rep) + '\n'); print('\n'.join(rep))
