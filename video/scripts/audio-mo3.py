"""Son de MO3, par ouverture : voix de Simon, musique 108 BPM synthétisée, bruitages, mix et master.
usage : python3 scripts/audio-mo3.py [A B C] → audio/mix-mo3-<H>.wav (+ music-, sfx-, vo-) et docs/mix_report-mo3-<H>.txt
Grammaire de la réf. 5 (docs/ref5_style_guide.md) :
- le son dessine le mouvement : un souffle par grand déplacement, un pop par carte, un clic par action, un impact par tampon ;
- la musique se tait pendant la pluie de frais (le gag se joue dans le silence) ;
- elle repart sur le logo (temps fort calé sur la révélation) et s'allège sous « Pas après » ;
- voix devant : la musique s'efface de 10 dB sous chaque mot.
Master : −14 LUFS intégrés, plafond de travail −3,5 dBTP (l'AAC ajoute jusqu'à 2 dB), sub coupé sous 75 Hz pour le
téléphone. Tout est déterministe (graine fixe)."""
import json, os, sys
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'timeline-mo3.json')))
SR = 48000; BPM = TL['bpm']; BEAT = 60 / BPM; BAR = 4 * BEAT
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
lp = lambda x, f, o=2: sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x, axis=0)
hp = lambda x, f, o=2: sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)
bp = lambda x, lo, hi, o=2: sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)
def env(n, a, d): tt = np.arange(n) / SR; return np.minimum(1, tt / max(a, 1e-4)) * np.exp(-tt / d)

def render(HOOK):
    hk = TL['hooks'][HOOK]; H, B0, DUR, HR = hk['H'], hk['B0'], hk['dur'], hk['regions']
    T = {k: B0 + v for k, v in TL['ev'].items()}; BR = [[B0 + a, B0 + b] for a, b in TL['body']]
    N = int(DUR * SR) + SR; rng = np.random.default_rng(108)
    def put(dst, x, t, g=1.0, pan=0.0):
        i = int(round(t * SR)); x = np.asarray(x, float)
        if i >= N or i + len(x) <= 0: return
        if x.ndim == 1: x = np.stack([x * np.sqrt((1 - pan) / 2), x * np.sqrt((1 + pan) / 2)], 1) * np.sqrt(2)
        if i < 0: x = x[-i:]; i = 0
        j = min(N, i + len(x)); dst[i:j] += x[:j - i] * g

    # ---------- instruments ----------
    def kick():
        n = int(0.3 * SR); tt = np.arange(n) / SR; f = 66 + 150 * np.exp(-tt / 0.025)
        return np.tanh((np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.09) + bp(rng.standard_normal(n), 1500, 6000) * np.exp(-tt / 0.006) * 0.5) * 1.6) * 0.9
    def clap():
        n = int(0.3 * SR); tt = np.arange(n) / SR; nz = bp(rng.standard_normal(n), 1000, 3500); x = np.zeros(n)
        for k, o in enumerate([0, 0.01, 0.021]): i = int(o * SR); x[i:] += nz[:n - i] * np.exp(-tt[:n - i] / (0.01 if k < 2 else 0.12))
        return x * 0.5
    def hat(): n = int(0.05 * SR); return hp(rng.standard_normal(n), 7500, 4) * env(n, 0.001, 0.012) * 0.28
    def shaker(): n = int(0.07 * SR); return hp(rng.standard_normal(n), 6500, 4) * env(n, 0.006, 0.02) * 0.22
    def bass(m, L):
        n = int(L * SR); tt = np.arange(n) / SR; f = NOTE(m); x = np.sign(np.sin(2 * np.pi * f * tt)) * 0.5 + np.sin(2 * np.pi * f * tt)
        return np.tanh(lp(x, 560) * 1.5) * np.minimum(1, tt / 0.004) * np.exp(-tt / (L * 1.3)) * 0.45
    def pluck(m, d=0.25, bright=3600):
        n = int(d * 4 * SR); tt = np.arange(n) / SR; f = NOTE(m)
        return lp(sum(np.sin(2 * np.pi * f * h * tt + h * 0.7) * (0.62 ** h) for h in range(1, 7)), bright) * env(n, 0.002, d) * 0.2
    def marimba(m, d=0.3):
        n = int(d * 3 * SR); tt = np.arange(n) / SR; f = NOTE(m)
        return (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * f * 4 * tt) * np.exp(-tt / 0.03)) * env(n, 0.001, d * 0.5) * 0.28
    def pad(ms, L):
        n = int(L * SR); tt = np.arange(n) / SR
        x = sum(np.sin(2 * np.pi * NOTE(m) * tt * (1 + 0.003 * k)) for m in ms for k in (-1, 1))
        return lp(x, 1800) * np.minimum(1, tt / 0.4) * np.minimum(1, (L - tt) / 0.5) * 0.05
    # mi mineur → do → sol → ré (sombre puis lumineux), plucks dans les médiums
    CH = [[64, 67, 71], [60, 64, 67], [67, 71, 74], [62, 66, 69]]; RT = [40, 36, 43, 38]
    drums = np.zeros((N, 2)); mus = np.zeros((N, 2)); K, CL = kick(), clap()
    g0 = T['logo']                                                     # temps fort sur la révélation du logo
    grid = lambda t: g0 + round((t - g0) / (BEAT / 2)) * (BEAT / 2)
    def section(t):
        if t < H: return 'hook'
        if t < T['voiture'] - 0.2: return 'silence'
        if t < T['logo']: return 'tension'
        if t < T['sais']: return 'full'
        if t < T['cta']: return 'low'
        return 'end'
    b0 = int(np.floor(-g0 / BEAT))
    for b in range(b0, int((DUR - g0) / BEAT) + 1):
        t = g0 + b * BEAT
        if t < 0: continue
        pos = b % 4; sec = section(t); bar = (b // 4) % 4
        if sec == 'hook':
            if HOOK != 'C':
                if pos in (0, 2): put(drums, K, t, 0.55)
                put(drums, hat(), t + BEAT / 2, 0.55, -0.3)
            if b % 2 == 0: put(mus, pluck(CH[bar][b % 3] + 12, 0.14, 2800), t, 0.4, 0.25 if b % 4 else -0.25)
        elif sec == 'tension':
            if b % 2 == 1: put(mus, marimba(CH[0][0], 0.3), t, 0.45, 0.2)
        elif sec in ('full', 'end'):
            g = 1.0 if sec == 'full' else 0.85
            put(drums, K, t, g * (1.0 if pos == 0 else 0.8))
            if pos in (1, 3): put(drums, CL, t, 0.8 * g, 0.1)
            put(drums, hat(), t + BEAT / 2, 0.75 * g, -0.3)
            for s16 in (1, 3): put(drums, shaker(), t + s16 * BEAT / 4, 0.5 * g, 0.35)
            for e in range(2):
                tt = t + e * BEAT / 2; ch = CH[bar]
                put(mus, bass(RT[bar] + 12 + (12 if (pos * 2 + e) % 4 == 3 else 0), BEAT / 2 * 0.8), tt, 0.7)
                put(mus, pluck(ch[(pos * 2 + e) % 3] + (12 if pos % 2 else 0), 0.13, 3800), tt, 0.5, 0.35 if e else -0.35)
            if pos == 2: put(mus, marimba(CH[bar][0] + 24, 0.25), t, 0.3, 0.1)
        elif sec == 'low':
            put(drums, K, t, 0.8 if pos == 0 else 0.55)
            if pos == 0: put(mus, bass(RT[bar] + 12, BEAT * 1.6), t, 0.7)
    if HOOK == 'C': put(mus, pad([52, 59, 64, 67], H + 0.4), 0.0, 1.0)
    else: put(mus, pad([52, 59, 64], H + 0.3), 0.0, 0.6)
    def riser(L, g=0.25):
        n = int(L * SR); x = rng.standard_normal(n); out = np.zeros(n)
        for i in range(0, n, 2400): c = 400 + 7000 * (i / n) ** 2; out[i:i + 2400] = bp(x[i:i + 2400], c * 0.5, min(c * 1.5, 20000))
        return out * (np.arange(n) / n) ** 2 * g
    put(mus, riser(T['logo'] - T['zoom'] + 0.25), T['zoom'] - 0.25, 0.9)
    for key, k in (('logo', 0.6), ('sept', 0.45), ('apres', 0.5), ('cta', 0.55)):
        t = grid(T[key]); bar = int(np.floor((t - g0) / BAR)) % 4
        put(mus, sum(pluck(m + 12, 0.45, 5200) for m in CH[bar]) * 0.8, t, k)
    for i, m in enumerate([43, 55, 59, 62, 67, 71]): put(mus, pluck(m, 1.6, 4200), T['guide'] + i * 0.02, 0.7, [-0.3, 0.2, -0.1, 0.3, -0.2, 0.35][i])
    # coupure nette à la fin de l'ouverture : la musique tombe, il ne reste que les tickets
    i0 = int((H + 0.04) * SR); i1 = int((T['voiture'] - 0.2) * SR)
    for x in (mus, drums): x[i0:i0 + int(0.08 * SR)] *= np.linspace(1, 0, int(0.08 * SR))[:, None]; x[i0 + int(0.08 * SR):i1] = 0
    music = drums + mus

    # ---------- bruitages ----------
    sfx = np.zeros((N, 2))
    def whoosh(L=0.42, lo=300, hi=5200):
        n = int(L * SR); x = rng.standard_normal(n); out = np.zeros(n)
        for i in range(0, n, 1200):
            p = i / n; c = lo + hi * np.sin(np.pi * min(1, p * 1.25)) ** 2; out[i:i + 1200] = bp(x[i:i + 1200], max(60, c * 0.6), min(c * 1.6, 20000))
        return out * np.sin(np.pi * np.arange(n) / n) ** 1.5 * 0.45
    def pop(f0=900):
        n = int(0.12 * SR); ph = np.cumsum(f0 + 700 * np.exp(-np.arange(n) / (0.012 * SR))) * 2 * np.pi / SR
        return np.sin(ph) * env(n, 0.001, 0.03) * 0.5
    def click():
        n = int(0.05 * SR); x = bp(rng.standard_normal(n), 2500, 7000)
        return (x * 1.4 + np.sin(2 * np.pi * 3200 * np.arange(n) / SR) * 0.4) * env(n, 0.0012, 0.006) * 0.6
    def slap():   # ticket qui tombe sur la pile : papier + petit choc
        n = int(0.16 * SR); tt = np.arange(n) / SR
        return (bp(rng.standard_normal(n), 900, 4500) * np.exp(-tt / 0.018) * 0.6 + np.sin(2 * np.pi * (180 + 160 * np.exp(-tt / 0.02)) * tt) * np.exp(-tt / 0.05) * 0.5)
    def impact(g=1.0):
        n = int(0.6 * SR); tt = np.arange(n) / SR; f = 70 + 160 * np.exp(-tt / 0.03)
        body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.16)
        crack = bp(rng.standard_normal(n), 1200, 6000) * np.exp(-tt / 0.03) * 0.5
        return np.tanh((body + crack) * 1.8) * 0.75 * g
    def scribble(L=0.42):   # trait de stylo : frottement bande moyenne, modulé
        n = int(L * SR); tt = np.arange(n) / SR; x = bp(rng.standard_normal(n), 1800, 6500, 3)
        return x * (0.55 + 0.45 * np.sin(2 * np.pi * 23 * tt)) * np.sin(np.pi * tt / L) ** 0.8 * 0.35
    def ding(m=84):
        n = int(0.9 * SR); tt = np.arange(n) / SR; f = NOTE(m)
        return (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt / 0.08)) * env(n, 0.002, 0.25) * 0.35
    def tick(): n = int(0.04 * SR); return np.sin(2 * np.pi * 2100 * np.arange(n) / SR) * env(n, 0.0005, 0.008) * 0.5
    W, P = [], []
    if HOOK == 'A':
        tc = HR[4][0] + 0.12
        W += [(0.0, 0.5, 0.35)]; P += [(HR[1][0] + 0.05, 1000), (HR[2][0] + 0.1, 1100), (HR[3][0] - 0.25, 800)]
        put(sfx, click(), tc, 1.0); put(sfx, impact(0.7), tc + 0.02, 1.0); put(sfx, scribble(0.4), tc + 0.02, 0.8); W += [(H - 0.05, 0.45, 0.8)]
    elif HOOK == 'B':
        put(sfx, impact(0.9), 0.0, 1.0); W += [(0.0, 0.5, 0.7), (H - 0.18, 0.4, 0.6)]
        put(sfx, scribble(0.5), HR[2][0] + 0.25, 0.9)
    else:
        put(sfx, riser(HR[1][0], 0.12), 0.0, 1.0); put(sfx, impact(0.85), HR[1][0] + 0.02, 1.0); W += [(H - 0.1, 0.4, 0.6)]
    for i in range(4): put(sfx, slap(), T['fee0'] + i * 0.27 + 0.13, 0.9, -0.2 if i % 2 else 0.2)
    W += [(T['voiture'] - 0.2, 0.45, 0.6), (T['zoom'] - 0.05, 0.55, 1.0), (T['colle'] - 0.15, 0.4, 0.6), (T['deux'] - 0.1, 0.35, 0.5),
          (T['note'] - 0.1, 0.35, 0.5), (T['dit'] - 0.15, 0.4, 0.6), (T['prix'] - 0.1, 0.35, 0.5), (T['sept'] - 0.12, 0.3, 1.0),
          (T['clio'] - 0.1, 0.4, 0.6), (T['sais'] - 0.15, 0.45, 0.6), (T['cta'] - 0.15, 0.45, 0.7)]
    P += [(T['voiture'] + 0.33, 1000), (T['voiture'] + 0.63, 1150), (T['dit'] + 0.25, 800), (T['cote'] + 0.7, 1000), (T['cta'] + 0.3, 900), (T['cta'] + 0.45, 1100)]
    P += [(T['clio'] + 0.15 + i * 0.07, 1300 + 60 * i) for i in range(8)]
    for t, L, g in W: put(sfx, whoosh(L), t, g, 0.0)
    for t, f in P: put(sfx, pop(f), t, 0.8, 0.15 * np.sin(t * 7))
    put(sfx, impact(0.8), T['logo'] + 0.02, 1.0); put(sfx, scribble(0.5), T['logo'] + 0.05, 0.9)
    put(sfx, click(), T['paste'] - 0.12, 1.0); put(sfx, click(), T['clic'], 1.0); put(sfx, scribble(0.35), T['clic'] + 0.03, 0.6)
    k0 = T['deux'] + 0.1; kd = T['note'] - T['deux'] - 0.35
    put(sfx, tick(), k0 + 0.02, 1.0); put(sfx, tick(), k0 + kd * 0.5, 1.0); put(sfx, ding(88), k0 + kd, 0.9)
    put(sfx, impact(1.0), T['nogo'] + 0.04, 1.0)
    put(sfx, scribble(0.5), BR[11][1] - 0.2, 0.8)
    for i in range(6): put(sfx, tick(), T['slide'] + i * 0.16, 0.5)
    put(sfx, impact(0.6), T['sept'] + 0.12, 1.0); put(sfx, scribble(0.5), T['sept'] + 0.3, 0.8)
    put(sfx, ding(81), T['prem'] + 0.05, 1.0)
    put(sfx, scribble(0.4), BR[18][1] - 0.05, 0.8)
    for key in ('deb', 'pro'): put(sfx, click(), T[key], 1.0); put(sfx, scribble(0.4), T[key] + 0.03, 0.7)

    # ---------- voix ----------
    vo = np.zeros(N)
    for blk, t0 in ((HOOK, 0.0), ('body', B0)):
        x, sr = sf.read(os.path.join(ROOT, f'audio/vo-mo3-{blk}.wav')); assert sr == SR
        i = int(t0 * SR); vo[i:i + len(x)] += x[:N - i]
    vo = hp(vo, 80, 2)
    # ducking : la musique descend de 10 dB sous la voix (attaque 20 ms, relâchement 250 ms)
    e = np.abs(vo); win = int(0.02 * SR); e = np.convolve(e, np.ones(win) / win, 'same'); act = (e > 0.02).astype(float)
    g = np.zeros(N); a_, r_ = np.exp(-1 / (0.02 * SR)), np.exp(-1 / (0.25 * SR)); y = 0.0
    for i in range(N): x = act[i]; y = (a_ if x > y else r_) * y + (1 - (a_ if x > y else r_)) * x; g[i] = y
    duck = 10 ** (-10 * g / 20)
    mix = np.stack([vo, vo], 1) * 1.0 + music * 0.42 * duck[:, None] + sfx * 0.55
    mix = hp(mix, 75, 4)
    fade = np.ones(N); e0, e1 = int((DUR - 0.4) * SR), int(DUR * SR); fade[e0:e1] = np.linspace(1, 0, e1 - e0) ** 2; fade[e1:] = 0
    mix = (mix * fade[:, None])[:int(DUR * SR)]
    # ---------- master ----------
    meter = pyln.Meter(SR)
    def tp(x): return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12)
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    L = int(0.005 * SR)
    for _ in range(12):   # normalise à −14 LUFS, puis limiteur à anticipation (gain lissé) tant que la crête dépasse −3,5 dBTP
        mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
        if tp(mix) <= -3.5: break
        pk = np.abs(mix).max(1); gr = np.minimum(1, 10 ** (-4.2 / 20) / np.maximum(pk, 1e-9))
        gr = uniform_filter1d(minimum_filter1d(gr, L * 2 + 1), L); mix *= gr[:, None]
    for _ in range(8):    # dernières crêtes : limiteur seul, sans renormaliser (la loudness reste dans ±0,5 LU)
        if tp(mix) <= -3.5: break
        pk = np.abs(mix).max(1); gr = np.minimum(1, 10 ** (-5.2 / 20) / np.maximum(pk, 1e-9))
        gr = uniform_filter1d(minimum_filter1d(gr, L * 2 + 1), L); mix *= gr[:, None]
    lufs = meter.integrated_loudness(mix); peak = tp(mix)
    os.makedirs(os.path.join(ROOT, 'docs'), exist_ok=True)
    sf.write(os.path.join(ROOT, f'audio/mix-mo3-{HOOK}.wav'), mix, SR, subtype='PCM_24')
    sf.write(os.path.join(ROOT, f'audio/music-mo3-{HOOK}.wav'), (music * 0.42)[:int(DUR * SR)], SR, subtype='PCM_24')
    first = meter.integrated_loudness(mix[:int(2 * SR)]) if DUR > 2 else lufs
    rep = f'MO3 ouverture {HOOK} : {DUR:.2f} s · {lufs:.1f} LUFS intégrés · true peak {peak:.1f} dBTP (WAV) · 2 premières secondes {first:.1f} LUFS\n'
    open(os.path.join(ROOT, f'docs/mix_report-mo3-{HOOK}.txt'), 'w').write(rep); print(rep, end='')

for h in (sys.argv[1:] or ['A', 'B', 'C']): render(h)
