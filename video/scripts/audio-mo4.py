"""Son de MO4 (15 s, sans voix) : musique 120 BPM synthétisée, bruitages calés sur timeline-mo4.json, mix et master.
usage : python3 scripts/audio-mo4.py → audio/mix-mo4.wav (+ music-mo4.wav, sfx-mo4.wav) et docs/mix_report-mo4.txt
Grammaire des références (docs/ref_motion_fluide.md) : un à deux bruitages par seconde, toujours sur une action ;
un souffle par déplacement, un « pop » par apparition ou clic, un seul coup grave au moment fort (le prix qui sort).
Grille : 120 BPM, un temps = 0,5 s ; les coches, les lignes et le prix tombent sur les temps.
Musique : la mineur → fa → do → sol (une mesure par accord), arpège en croches dès 0 s (le son accroche avec l'image),
basse et clap à partir du collage, temps fort au verdict (6 s) et au prix (10 s), coupure pendant la traînée,
accord de do sur le symbole. Le sol de la fin retombe sur le la de 0 s : la boucle se raccorde.
Bruitages de la bibliothèque déjà générée (audio/sfx-lib : clic, collage, souffle) et synthèse pour le reste.
Master : −14 LUFS intégrés, plafond de travail −3,5 dBTP (l'AAC ajoute jusqu'à 2 dB), coupé sous 80 Hz : basse jouée
une octave au-dessus de la fondamentale, grosse caisse courte, pour un haut-parleur de téléphone (moins de 50 % de
l'énergie sous 150 Hz).
Tout est déterministe (graine fixe)."""
import json, os
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly
from scipy.ndimage import minimum_filter1d, uniform_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, 'timeline-mo4.json'))); E = TL['ev']
SR = 48000; BPM = TL['bpm']; BEAT = 60 / BPM; BAR = 4 * BEAT; DUR = TL['dur']
N = int(DUR * SR); rng = np.random.default_rng(404)
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
lp = lambda x, f, o=2: sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x, axis=0)
hp = lambda x, f, o=2: sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)
bp = lambda x, lo, hi, o=2: sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)
def env(n, a, d): tt = np.arange(n) / SR; return np.minimum(1, tt / max(a, 1e-4)) * np.exp(-tt / d)
def put(dst, x, t, g=1.0, pan=0.0):
    i = int(round(t * SR)); x = np.asarray(x, float)
    if i >= N or i + len(x) <= 0: return
    if x.ndim == 1: x = np.stack([x * np.sqrt((1 - pan) / 2), x * np.sqrt((1 + pan) / 2)], 1) * np.sqrt(2)
    if i < 0: x = x[-i:]; i = 0
    j = min(N, i + len(x)); dst[i:j] += x[:j - i] * g
def lib(name):
    x, sr = sf.read(os.path.join(ROOT, f'audio/sfx-lib/{name}.wav')); assert sr == SR
    return x if x.ndim == 1 else x.mean(1)

# ---------------- instruments ----------------
def kick(g=1.0):            # court et claquant : un haut-parleur de téléphone ne rend pas le sub
    n = int(0.26 * SR); tt = np.arange(n) / SR; f = 66 + 150 * np.exp(-tt / 0.026)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.08)
    return np.tanh((body + bp(rng.standard_normal(n), 1800, 7000) * np.exp(-tt / 0.006) * 0.7) * 1.7) * 0.7 * g
def clap():
    n = int(0.3 * SR); tt = np.arange(n) / SR; nz = bp(rng.standard_normal(n), 1000, 3800); x = np.zeros(n)
    for k, o in enumerate([0, 0.011, 0.022]): i = int(o * SR); x[i:] += nz[:n - i] * np.exp(-tt[:n - i] / (0.01 if k < 2 else 0.11))
    return x * 0.45
def hat(open_=False):
    n = int((0.16 if open_ else 0.05) * SR)
    return hp(rng.standard_normal(n), 7800, 4) * env(n, 0.001, 0.05 if open_ else 0.012) * 0.26
def shaker(): n = int(0.07 * SR); return hp(rng.standard_normal(n), 6500, 4) * env(n, 0.006, 0.02) * 0.18
def bass(m, L):             # une octave au-dessus de la fondamentale (audible sur téléphone) + un sub discret
    n = int(L * SR); tt = np.arange(n) / SR; f = NOTE(m + 12)
    x = np.sin(2 * np.pi * f * tt) + 0.5 * np.sign(np.sin(2 * np.pi * f * tt)) * 0.6
    sub = np.sin(2 * np.pi * NOTE(m) * tt) * 0.45
    return (np.tanh(lp(x, 900) * 1.6) + sub) * np.minimum(1, tt / 0.004) * np.exp(-tt / (L * 1.4)) * 0.36
def pluck(m, d=0.22, bright=4200):
    n = int(d * 4 * SR); tt = np.arange(n) / SR; f = NOTE(m)
    return lp(sum(np.sin(2 * np.pi * f * h * tt + h * 0.7) * (0.6 ** h) for h in range(1, 7)), bright) * env(n, 0.002, d) * 0.2
def pad(ms, L, cut=1700):
    n = int(L * SR); tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * NOTE(m) * tt * (1 + 0.0035 * k)) for m in ms for k in (-1, 1))
    return lp(x, cut) * np.minimum(1, tt / 0.3) * np.minimum(1, np.maximum(0, L - tt) / 0.35) * 0.045
def stab(ms, g=1.0):
    n = int(0.9 * SR); tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * NOTE(m) * tt) + 0.3 * np.sin(2 * np.pi * NOTE(m) * 2 * tt) for m in ms)
    return lp(x, 3200) * env(n, 0.004, 0.32) * 0.12 * g
def riser(L, g=0.25, top=9000):
    n = int(L * SR); x = rng.standard_normal(n); out = np.zeros(n)
    for i in range(0, n, 1200):
        c = 300 + top * (i / n) ** 2; out[i:i + 1200] = bp(x[i:i + 1200], c * 0.5, min(c * 1.5, 20000))
    return out * (np.arange(n) / n) ** 2 * g

# accords : la mineur, fa, do, sol (une mesure de 2 s chacun)
CH = [[57, 60, 64], [57, 60, 65], [55, 60, 64], [55, 59, 62]]; RT = [45, 41, 48, 43]
ARP = [0, 1, 2, 1, 2, 0, 1, 2]                        # motif d'arpège en croches (indices dans l'accord)
drums = np.zeros((N, 2)); mus = np.zeros((N, 2))
def section(t):
    if t < 2.0: return 'hook'
    if t < 5.75: return 'build'
    if t < 6.0: return 'gap'
    if t < 11.0: return 'full'
    if t < 11.98: return 'break'
    if t < E['out']: return 'end'
    return 'out'
for b in range(int(DUR / BEAT) + 1):
    t = b * BEAT; pos = b % 4; bar = int(t // BAR) % 4; sec = section(t); ch = CH[bar]
    if sec == 'out': continue
    # batterie
    if sec in ('hook',):
        if pos in (0, 2): put(drums, kick(0.8), t)
        put(drums, hat(), t + BEAT / 2, 0.6, -0.3)
    elif sec in ('build', 'full', 'end'):
        g = {'build': 0.9, 'full': 1.0, 'end': 0.85}[sec]
        put(drums, kick(g), t)
        if pos in (1, 3): put(drums, clap(), t, 0.75 * g, 0.1)
        put(drums, hat(pos == 3 and sec == 'full'), t + BEAT / 2, 0.7 * g, -0.3)
        for s16 in (1, 3): put(drums, shaker(), t + s16 * BEAT / 4, 0.5 * g, 0.35)
    # basse
    if sec in ('build', 'full'):
        for e in range(2):
            oct_ = 12 if (sec == 'full' and (pos * 2 + e) % 4 == 3) else 0
            put(mus, bass(RT[bar] + oct_, BEAT / 2 * 0.85), t + e * BEAT / 2, 0.75)
    elif sec == 'end' and pos == 0:
        put(mus, bass(RT[bar], BAR * 0.9), t, 0.7)
    # arpège en croches, dès la première image
    if sec in ('hook', 'build', 'full', 'end'):
        for e in range(2):
            k = (pos * 2 + e); m = ch[ARP[k % 8]] + (12 if sec == 'full' and k % 4 == 2 else 0)
            put(mus, pluck(m + 12, 0.16 if sec != 'end' else 0.2, 4200 if sec == 'hook' else 5200), t + e * BEAT / 2, 0.62, 0.3 if e else -0.3)
# nappe sous tout le film (coupée à la sortie)
for i in range(8):
    t0 = i * BAR
    if t0 >= E['out']: break
    put(mus, pad(CH[i % 4], min(BAR + 0.3, E['out'] + 0.3 - t0)), t0, 1.0)
# trous et temps forts
put(mus, riser(0.75, 0.22), 5.25, 1.0)                                           # montée vers le verdict
put(mus, stab([69, 72, 76], 1.0), 6.0, 1.0); put(mus, stab([67, 71, 74], 0.8), 8.0, 1.0)
put(mus, riser(0.55, 0.26), E['pop'] - 0.55, 1.0)                                # montée vers le prix
roll_t = [E['pop'] - 0.5 + x for x in (0, 0.125, 0.25, 0.3125, 0.375, 0.4375)]   # roulement de claps avant le prix
for i, x in enumerate(roll_t): put(drums, clap(), x, 0.25 + 0.1 * i, 0.15 * (-1) ** i)
put(mus, stab([69, 72, 76, 81], 1.2), E['pop'], 1.0)
# la traînée : arpège rapide qui monte, sans batterie
for i in range(14):
    t = E['collapse'] + 0.12 + i * BEAT / 4
    if t >= E['fill'] - 0.04: break
    put(mus, pluck(CH[2][i % 3] + 24 + (12 if i > 9 else 0), 0.12, 6000), t, 0.32 + 0.02 * i, 0.4 * np.sin(i * 1.3))
put(mus, riser(E['fill'] - E['trail'], 0.2, 7000), E['trail'], 1.0)
put(mus, stab([60, 64, 67, 72], 1.3), E['fill'], 1.0)                             # do majeur sur le symbole
# filtre qui se referme avant la coupure (10,5 → 11 s), coupure nette sur la traînée
i0, i1 = int(10.5 * SR), int(11.0 * SR)
seg = drums[i0:i1].copy(); w = np.linspace(0, 1, i1 - i0)[:, None]; drums[i0:i1] = seg * (1 - w) + lp(seg, 900) * w
music = drums + mus
o0 = int(E['out'] * SR); fo = np.ones(N); fo[o0:] = np.linspace(1, 0, N - o0) ** 1.5
music *= fo[:, None]

# ---------------- bruitages ----------------
sfx = np.zeros((N, 2))
def whoosh(L=0.42, lo=300, hi=5200, g=0.45):
    n = int(L * SR); x = rng.standard_normal(n); out = np.zeros(n)
    for i in range(0, n, 1200):
        p = i / n; c = lo + hi * np.sin(np.pi * min(1, p * 1.25)) ** 2; out[i:i + 1200] = bp(x[i:i + 1200], max(60, c * 0.6), min(c * 1.6, 20000))
    return out * np.sin(np.pi * np.arange(n) / n) ** 1.5 * g
def suck(L=0.45):          # souffle inversé (tout se replie dans le point)
    return whoosh(L, 400, 6000, 0.5)[::-1] * np.linspace(0.3, 1, int(L * SR))
def pop(f0=900, g=0.5):
    n = int(0.12 * SR); ph = np.cumsum(f0 + 700 * np.exp(-np.arange(n) / (0.012 * SR))) * 2 * np.pi / SR
    return np.sin(ph) * env(n, 0.001, 0.03) * g
def tick(f=2100, g=0.5): n = int(0.04 * SR); return np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, 0.0005, 0.008) * g
def check(m):              # coche : deux notes rapides, claire
    n = int(0.5 * SR); tt = np.arange(n) / SR
    a = np.sin(2 * np.pi * NOTE(m) * tt) * env(n, 0.001, 0.09)
    b = np.sin(2 * np.pi * NOTE(m + 7) * tt) * env(n, 0.001, 0.14); b = np.concatenate([np.zeros(int(0.045 * SR)), b])[:n]
    return (a + b) * 0.28
def ding(m=84):
    n = int(1.0 * SR); tt = np.arange(n) / SR; f = NOTE(m)
    return (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt / 0.08)) * env(n, 0.002, 0.3) * 0.33
def impact(g=1.0, low=62):
    n = int(0.6 * SR); tt = np.arange(n) / SR; f = low + 20 + 170 * np.exp(-tt / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.11) * 0.75
    crack = bp(rng.standard_normal(n), 1200, 7000) * np.exp(-tt / 0.03) * 0.75
    return np.tanh((body + crack) * 1.8) * 0.75 * g
def shimmer(L=0.6, g=0.25):
    n = int(L * SR); tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * NOTE(m) * tt + k) for k, m in enumerate([88, 95, 100]))
    return x * env(n, 0.01, L * 0.4) * (1 + 0.5 * np.sin(2 * np.pi * 18 * tt)) * g * 0.2
def sizzle(L):             # la traînée qui dessine : souffle brillant, modulé
    n = int(L * SR); tt = np.arange(n) / SR; x = bp(rng.standard_normal(n), 2500, 9000, 3)
    return x * (0.6 + 0.4 * np.sin(2 * np.pi * 31 * tt)) * np.sin(np.pi * tt / L) ** 0.7 * 0.28
def rise_tone(L, f0, f1, g=0.18):
    n = int(L * SR); tt = np.arange(n) / SR; f = f0 * (f1 / f0) ** (tt / L)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, tt / 0.02) * np.minimum(1, (L - tt) / 0.03) * g
CLICK, PASTE, WH = lib('click'), lib('paste'), lib('whoosh')

# ouverture : le point éclate, la carte jaillit
put(sfx, impact(0.75, 70), 0.0, 1.0); put(sfx, shimmer(0.7, 0.3), 0.0, 1.0); put(sfx, whoosh(0.45, 500, 6000, 0.5), -0.05, 1.0)
for i, t in enumerate(E['hook']): put(sfx, tick(1800 + 150 * i, 0.32), t, 1.0, -0.2 + 0.13 * i)
put(sfx, whoosh(0.3, 600, 4000, 0.22), E['finger'], 1.0, 0.4)                    # le doigt entre
put(sfx, rise_tone(0.22, 520, 1040, 0.14), E['press'], 1.0)                       # appui long
put(sfx, whoosh(0.5, 300, 4800, 0.5), E['morph'] - 0.04, 1.0)                    # la carte se replie dans le champ
put(sfx, PASTE, E['paste'] - 0.01, 0.55); put(sfx, CLICK, E['paste'] - 0.02, 0.5)
put(sfx, pop(1150, 0.4), E['enable'], 1.0)                                        # le bouton s'allume
put(sfx, CLICK, E['tap'] - 0.02, 0.7)
put(sfx, whoosh(0.5, 250, 5200, 0.55), E['expand'] - 0.03, 1.0)                  # le bouton s'ouvre en fiche
for i, t in enumerate(E['steps']): put(sfx, check([81, 83, 84, 88][i]), t, 0.9, -0.15 + 0.1 * i)
put(sfx, whoosh(0.5, 300, 4500, 0.45), E['result'] - 0.05, 1.0)                  # la caméra recule
put(sfx, rise_tone(0.85, 440, 880, 0.08), E['ring'] + 0.15, 1.0)                 # l'anneau se remplit
put(sfx, ding(88), 6.98, 0.85)                                                    # 8/10
put(sfx, pop(900, 0.45), E['pill'], 1.0)
for i, t in enumerate(E['rows']):
    put(sfx, pop(1000 + 120 * i, 0.38), t, 1.0, 0.15 * (-1) ** i)
    for k in range(8): put(sfx, tick(2600 + 80 * i, 0.12 * (1 - k / 8)), t + 0.12 + k * 0.07, 1.0, 0.2 * (-1) ** k)
put(sfx, whoosh(0.55, 200, 3800, 0.4), E['push'], 1.0)                            # plongée sur la dernière ligne
put(sfx, impact(1.0, 55), E['pop'], 1.0); put(sfx, whoosh(0.4, 600, 6500, 0.5), E['pop'] - 0.06, 1.0)
put(sfx, pop(1200, 0.35), E['affiche'], 1.0)
put(sfx, suck(0.32), E['collapse'] - 0.2, 1.0)                                    # le prix se replie en point
put(sfx, sizzle(E['fill'] - E['trail']), E['trail'], 1.0); put(sfx, shimmer(0.9, 0.25), E['trail'] + 0.3, 1.0)
put(sfx, impact(0.7, 75), E['fill'], 1.0); put(sfx, shimmer(1.0, 0.35), E['fill'], 1.0)
for i, t in enumerate(E['slogan']): put(sfx, tick(1500 + 120 * i, 0.25), t, 1.0, -0.15 + 0.1 * i)
put(sfx, pop(950, 0.3), E['kicker'], 1.0); put(sfx, pop(800, 0.35), E['button'], 1.0)
put(sfx, CLICK, E['tapEnd'] - 0.02, 0.7); put(sfx, ding(91), E['tapEnd'] + 0.02, 0.35)
put(sfx, suck(0.5), E['out'], 1.0)                                                # tout rentre dans le point

# ---------------- mix et master ----------------
mix = music * 0.5 + sfx * 0.85
mix = hp(mix, 80, 4)
e = int(0.012 * SR); mix[-e:] *= np.linspace(1, 0, e)[:, None]
meter = pyln.Meter(SR)
def tp(x): return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12)
L = int(0.005 * SR)
for _ in range(12):   # −14 LUFS, puis limiteur à anticipation tant que la crête dépasse −3,5 dBTP
    mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
    if tp(mix) <= -3.5: break
    pk = np.abs(mix).max(1); gr = np.minimum(1, 10 ** (-4.2 / 20) / np.maximum(pk, 1e-9))
    gr = uniform_filter1d(minimum_filter1d(gr, L * 2 + 1), L); mix *= gr[:, None]
for _ in range(8):
    if tp(mix) <= -3.5: break
    pk = np.abs(mix).max(1); gr = np.minimum(1, 10 ** (-5.2 / 20) / np.maximum(pk, 1e-9))
    gr = uniform_filter1d(minimum_filter1d(gr, L * 2 + 1), L); mix *= gr[:, None]
lufs = meter.integrated_loudness(mix); peak = tp(mix); first = meter.integrated_loudness(mix[:2 * SR])
sf.write(os.path.join(ROOT, 'audio/mix-mo4.wav'), mix, SR, subtype='PCM_24')
sf.write(os.path.join(ROOT, 'audio/music-mo4.wav'), music * 0.5, SR, subtype='PCM_24')
sf.write(os.path.join(ROOT, 'audio/sfx-mo4.wav'), sfx * 0.85, SR, subtype='PCM_24')
rep = f'MO4 : {DUR:.2f} s · {lufs:.1f} LUFS intégrés · true peak {peak:.1f} dBTP (WAV) · 2 premières secondes {first:.1f} LUFS\n'
open(os.path.join(ROOT, 'docs/mix_report-mo4.txt'), 'w').write(rep); print(rep, end='')
