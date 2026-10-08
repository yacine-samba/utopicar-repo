"""MO10 « Deux voitures » : voix et musique mixées (méthode .claude/skills/motion-studio/references/sound-design.md).

Voix   : audio/vo-mo10/vo-placed.wav (Simon, prise unique, répliques posées sur le film par scripts/vo-mo10.py) ;
         HOOK=B : audio/vo-mo10/vo-placed-B.wav (ouverture B) → audio/mix-mo10-B.wav
Musique: audio/music/Controlled Drop.mp3, recalée à 120 BPM, mêmes passages que MO5 : mesure 13 dès l'image 0 ;
         pendant l'attente de la 207 la musique perd sa basse et son haut (comme la nuit de MO5), la basse revient
         avec l'offre ; arrêt de bande sur « 120 € », silence (la seule pause), bande qui rembobine, remontée à
         l'envers puis mesure 55 sur « Ceux qui gagnent ». Tous les temps viennent de audio/vo-mo10/vo-timing.json
         et de film-mo10/events.json.
Bruits : audio/bank/mo5 et mo6 (Mixkit, licence libre), repérés sur l'image, un son principal à la fois ; moteur de la
         Twingo qui part, horloge de l'attente, vibration du téléphone, fabriqués comme dans MO5.
Sortie : audio/mix-mo10.wav (lu par render.mjs), audio/stems-mo10/{voix,musique,bruitages,sans-musique}.wav,
         docs/mix_report-mo10.txt
"""
import os, json
import numpy as np, librosa, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
from scipy.ndimage import minimum_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
VT = __import__('json').load(open(A('vo-mo10', 'vo-timing.json')))
HOOK = os.environ.get('HOOK', 'A').upper()
EV = json.load(open(os.path.join(ROOT, 'film-mo10', 'events.json')))
DUR = VT['dur']
N = int(DUR * SR)
mk = lambda k: VT['marks'][k]['t']; mke = lambda k: VT['marks'][k]['end']
T_BIG = EV['big']                          # « 120 € » à l'écran (film-mo10/film.js, T.big)
OFF = T_BIG % 0.5                          # premier temps de la grille : « 120 » tombe sur un temps
T_STOP = T_BIG + 0.08                      # la musique s'arrête net sur « 120 € »
T_BACK = mk('ceux') + 0.03                 # « Ceux qui gagnent » : mesure 55, son premier temps sur la voix
T_W0, T_W1 = EV['d2'] - 0.3, EV['bubble']  # l'attente de la 207 : de « La deuxième… » à l'offre

def load(path, sr=SR, mono=True):
    y, _ = librosa.load(path, sr=sr, mono=mono)
    return y

def db(x): return 10 ** (x / 20)

def bp(y, lo=None, hi=None, order=4):
    if lo: y = sosfilt(butter(order, lo, 'hp', fs=SR, output='sos'), y)
    if hi: y = sosfilt(butter(order, hi, 'lp', fs=SR, output='sos'), y)
    return y

def env_curve(points, n=N):
    t = np.arange(n) / SR
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)

# ---------- voix ----------
vo = load(A('vo-mo10', 'vo-placed.wav' if HOOK == 'A' else 'vo-placed-B.wav'))[:N]
vo = np.pad(vo, (0, N - len(vo)))
vo = bp(vo, 80, 14000)
lines = [l for l in VT['lines'] if l['key'] != 'soupir']
# chaque réplique ramenée au même niveau (± 6 dB max) : la voix ne disparaît jamais ; le rire reste plus bas
rm = lambda x: np.sqrt((x ** 2).mean() + 1e-12)
lv = [rm(vo[int(l['t'] * SR):int(l['end'] * SR)]) for l in lines]; ref = np.median(lv)
for l, r_ in zip(lines, lv):
    a_, b_ = int((l['t'] - 0.03) * SR), int((l['end'] + 0.05) * SR)
    vo[a_:b_] *= np.clip(ref / r_, db(-6), db(6))

# ---------- musique ----------
src = load(A('music', 'Controlled Drop.mp3'))
RATE = 120 / 123.05                       # 1 mesure = 2,000 s
def stretch(seg):
    return librosa.effects.time_stretch(seg, rate=RATE)
BAR_SRC = 4 * 60 / 123.05
s1 = 13 * BAR_SRC - OFF * RATE            # la mesure 13 tombe sur le premier temps de la grille
m1 = stretch(src[int(s1 * SR):int((s1 + (T_STOP + 0.8) * RATE) * SR)])
m2 = stretch(src[int(55 * BAR_SRC * SR):int((55 * BAR_SRC + (DUR - T_BACK + 0.5) * RATE) * SR)])
REW = tuple(EV['rew'])
mus = np.zeros(N)
a = m1[:int(T_STOP * SR)]
mus[:len(a)] = a
# arrêt net : une bande qui ralentit en 0,22 s (tape stop)
ts = int(0.22 * SR); tail = m1[int(T_STOP * SR):int(T_STOP * SR) + int(0.45 * SR)]
pos = np.cumsum(np.linspace(1.0, 0.05, ts)); pos = pos[pos < len(tail) - 1]
stop = np.interp(pos, np.arange(len(tail)), tail) * np.linspace(1, 0, len(pos)) ** 1.5
mus[len(a):len(a) + len(stop)] = stop
# la bande qui rembobine (pendant le retour au jour 0) : la fin de m1 à l'envers, deux fois plus vite
rw = m1[int((T_STOP - 1.6) * SR):int(T_STOP * SR)][::-1]
L = int((REW[1] - REW[0]) * SR); rw = np.interp(np.linspace(0, len(rw) - 1, L), np.arange(len(rw)), rw)
rw = bp(rw, 300, 6000) * np.interp(np.arange(L), [0, 0.15 * SR, L - 0.2 * SR, L], [0, 1, 1, 0]) * db(-8)
mus[int(REW[0] * SR):int(REW[0] * SR) + L] += rw
# remontée : 0,9 s du début de la reprise, à l'envers, qui monte jusqu'au premier temps
rv = m2[:int(0.9 * SR)][::-1] * np.linspace(0, 1, int(0.9 * SR)) ** 2
i0 = int(T_BACK * SR) - len(rv); mus[i0:i0 + len(rv)] += bp(rv, 300, 9000) * 0.7
b = m2[:N - int(T_BACK * SR)]
mus[int(T_BACK * SR):int(T_BACK * SR) + len(b)] = b
# mise en scène (MO5) : attaque à l'image 0 ; l'attente retire la basse et le haut ; la basse revient avec l'offre ;
# fondu de boucle
lo_cut = env_curve([(0, 1), (T_W0, 1), (T_W0 + 0.5, 0), (T_W1 - 0.1, 0), (T_W1 + 0.2, 1), (DUR, 1)])
low = bp(mus, None, 200); mus = (mus - low) + low * lo_cut
dark = env_curve([(0, 0), (T_W0, 0), (T_W0 + 0.5, 1), (T_W1 - 0.1, 1), (T_W1 + 0.2, 0), (DUR, 0)])
mus = mus * (1 - dark) + bp(mus, None, 1400) * dark
lvl = env_curve([(0, db(-1)), (T_W0, db(-1)), (T_W0 + 0.5, db(-5)), (T_W1 - 0.1, db(-5)), (T_W1 + 0.2, db(-1)), (T_BIG, db(0.5)),
                 (T_STOP, db(0.5)), (T_BACK, db(0)), (DUR - 0.4, db(0)), (DUR, db(-3))])
mus *= lvl
# la musique cède sa place à la voix (bande de présence et niveau global)
venv = np.abs(vo); k = int(0.03 * SR); venv = np.convolve(venv, np.ones(k) / k, 'same')
venv = venv / (venv.max() + 1e-9)
duck = np.clip(venv * 6, 0, 1)
att, rel = np.exp(-1 / (0.02 * SR)), np.exp(-1 / (0.35 * SR))
d2 = np.zeros_like(duck); s = 0.0
for i, x in enumerate(duck):
    s = att * s + (1 - att) * x if x > s else rel * s + (1 - rel) * x
    d2[i] = s
pres = bp(mus, 1500, 6000)
mus = mus - pres * (1 - db(-10)) * d2
mus *= 1 - (1 - db(-8)) * d2

# ---------- bruitages (repérés sur l'image : film-mo10/events.json, écrit par CUT=mo10 node scripts/events.mjs) ----------
cache = {}
def sfx(i, st=0, dur=None, fade=0.04, rev=False, start=0.0):
    key = (i, st, dur, rev, start)
    if key not in cache:
        p = A('bank', 'mo5', f'sfx-{i}.mp3'); p = p if os.path.exists(p) else A('bank', 'mo6', f'sfx-{i}.mp3')
        y = load(p)
        if start: y = y[int(start * SR):]
        nz = np.where(np.abs(y) > 0.01 * np.abs(y).max())[0]
        y = y[nz[0]:] if len(nz) else y               # attaque calée : silence de tête retiré
        if st: y = librosa.effects.pitch_shift(y, sr=SR, n_steps=st)
        if dur: y = y[:int(dur * SR)]
        f = int(fade * SR); y[-f:] *= np.linspace(1, 0, f)
        if rev: y = y[::-1]
        cache[key] = y / (np.abs(y).max() + 1e-9)
    return cache[key]

ROLE = {  # crête visée (dBFS) et bande
    'accent': (-4, 40, 16000), 'ui': (-10, 400, 14000), 'chime': (-13, 500, 12000), 'whoosh': (-14, 250, 9000),
    'orn': (-17, 1500, 15000), 'tick': (-22, 1500, 12000), 'engine': (-11, 140, 9000), 'tool': (-15, 200, 10000),
}
CUES = []
def cue(t, i, role, prio=2, st=0, dur=None, pan=0.0, gain=0, rev=False, lead=0.0, start=0.0):
    CUES.append(dict(t=t - lead, i=i, role=role, prio=prio, st=st, dur=dur, pan=pan, gain=gain, rev=rev, start=start))

E_ = EV
# ouverture : la lumière passe sur le calcul, « = 2 000 € ? » s'écrit, les bâtons du voisin
if HOOK == 'A':
    cue(E_['sh1'], 2589, 'orn', 2, dur=0.8, gain=-3, pan=-0.2)                  # la lumière sur « 2 × »
    cue(E_['sh2'], 2589, 'orn', 3, st=3, dur=0.8, gain=-4, pan=0.2)             # … puis sur « 1 000 € »
    cue(E_['w2'], 3005, 'orn', 2, dur=0.7, pan=0.1)                             # « = 2 000 € » s'écrit
    cue(E_['q'], 2369, 'orn', 3, st=2, dur=0.5, gain=-3)                        # le « ? »
    for k, x in enumerate(E_['tally']):                                         # quinze bâtons, de plus en plus vite
        cue(x, 1384, 'tick', 3, st=(k % 5) * 2 - 2, pan=-0.3 + 0.04 * k, gain=3 if k % 5 == 4 else 0)
    cue(E_['cap'] + 0.28, 2369, 'orn', 3, dur=0.6, gain=-4)                     # « compte les jours. »
# jour 1 : le calcul se replie, palettes, compteur
cue(E_['out'], 3120, 'whoosh', 2, dur=0.7, lead=0.08)
for k in range(5): cue(E_['j1'] + k * 0.06 + 0.12, 1119, 'tick', 3, pan=-0.35 + 0.17 * k)
cue(E_['hud'] + 0.1, 1054, 'tick', 2, dur=0.4, gain=6)
for k in range(4): cue(E_['hud'] + k * 0.07, 1384, 'tick', 3, st=k, pan=-0.2 + 0.13 * k)
# les débits du jour 1 : une note par débit qui descend (la marge fond), le tampon « × 2 » colle deux fois
for k, (x, x2) in enumerate(zip(E_['deb'], E_['x2'])):
    cue(x, 2354, 'ui', 1, st=-k, pan=0.35)
    cue(x - 0.02, 1490, 'whoosh', 3, dur=0.35, pan=0.5, gain=-4, lead=0.1)
    if x2:
        cue(x + 0.22, 2380, 'tick', 2, dur=0.3, gain=6, st=-2)                 # × 2 : deux coups de tampon
        cue(x + 0.30, 2380, 'tick', 3, dur=0.3, gain=4, st=-2, pan=0.2)
    cue(x + 0.25, 1054, 'tick', 3, dur=0.3, gain=2)                              # le compteur roule
# la Twingo part au jour 8 ; « vendue ✓ »
for k in range(7): cue(E_['d0'] + 0.05 + k * (E_['d1'] - E_['d0']) / 7, 1119, 'tick', 3, st=k % 2, pan=0.2)
cue(E_['sold'], 1490, 'whoosh', 2, dur=0.5, pan=0.45, lead=0.12)
cue(E_['sold'] + 0.04, 951, 'chime', 1, pan=0.2)
cue(E_['sold'] + 0.27, 2380, 'tick', 2, dur=0.35, gain=8)
# l'attente : la 207 seule, la nuit, les jours, les débits, le gag seul
cue(E_['wait0'], 1492, 'whoosh', 2, dur=0.9, st=-4, lead=0.1)                    # la 207 vient au centre
for k, x in enumerate(E_['marks'][7:]):                                           # un bâton par jour, très bas
    if k % 2 == 0: cue(x, 1384, 'tick', 3, st=6, gain=-6, pan=0.15 - 0.01 * k)
for k, x in enumerate(E_['wait']):
    gag = abs(x - E_['gag']) < 1e-3
    cue(x, 2354, 'ui', 1 if gag else 2, st=9 if gag else -6 - (k % 3), pan=0.35, gain=0 if gag else -5)
    cue(x - 0.02, 1490, 'whoosh', 3, dur=0.3, pan=0.5, gain=-8, lead=0.1)
cue(E_['gag'] + 0.3, 2380, 'tick', 1, dur=0.4, gain=10)                          # « le voisin a compté » : le tampon, seul
for x in E_['drops']:
    cue(x - 0.05, 3005, 'orn', 2, st=-3, dur=0.5)                                # le prix se barre
    cue(x + 0.22, 2384, 'ui', 3, st=-4, gain=-5)
# la vente de la 207
cue(E_['bubble'], 2354, 'ui', 1, st=4, pan=-0.2, gain=-2)
cue(E_['reply'], 2384, 'ui', 2, st=2, pan=0.3, gain=-4)
cue(E_['credit'], 1490, 'whoosh', 2, dur=0.5, pan=0.45, lead=0.12)
cue(E_['credit'] + 0.04, 951, 'chime', 1, pan=0.2, st=-3)                         # le virement, un ton plus bas que celui de la Twingo
cue(E_['roll'], 1054, 'tick', 2, dur=0.55, gain=6)                               # 220 → 120
cue(E_['big'], 2909, 'accent', 1, dur=1.1, gain=-2)                               # « 120 € »
cue(E_['big'] + 0.06, 1107, 'chime', 1, st=-5, gain=-4)
cue(E_['pk1'], 2369, 'orn', 2, dur=0.8, gain=-2)                                  # « Moins qu'avec une seule. » s'écrit
# rembobinage, ceux qui gagnent comptent en jours, la boucle
cue(E_['rew'][0], 1092, 'accent', 1, dur=1.45, gain=-6)
cue(E_['ceux'] - 0.05, 3120, 'whoosh', 2, dur=0.7, lead=0.08)
cue(E_['comptent'], 2589, 'orn', 3, dur=0.7, gain=-2)
cue(E_['r1'], 2369, 'orn', 2, dur=0.45, gain=-3); cue(E_['r2'], 2369, 'orn', 2, st=2, dur=0.45, gain=-3)
cue(E_['v1'], 1054, 'tick', 2, dur=0.7, gain=6); cue(E_['v1'] + 0.62, 1107, 'chime', 1, st=4, gain=-3)   # 55 € par jour
cue(E_['v2'], 1054, 'tick', 2, dur=0.35, gain=4); cue(E_['v2'] + 0.3, 2384, 'ui', 2, st=-5, gain=-4)    # 3 € par jour
cue(E_['verd2'], 2369, 'orn', 2, st=4, dur=0.6, gain=-2)                         # « au jour 8. »
cue(E_['loop'], 3120, 'whoosh', 2, dur=0.8, lead=0.08)

# priorité : un son moins prioritaire à moins de 0,12 s d'un plus prioritaire est retiré
CUES.sort(key=lambda c: c['t'])
kept, dropped = [], []
for c in CUES:
    clash = [o for o in CUES if o is not c and abs(o['t'] - c['t']) < 0.12 and o['prio'] < c['prio']]
    (dropped if clash else kept).append(c)
fx = np.zeros((N, 2))
for c in kept:
    y = sfx(c['i'], c['st'], c['dur'], rev=c['rev'], start=c['start'])
    pk, lo, hi = ROLE[c['role']]
    y = bp(y, lo, hi, 2) * db(pk + c['gain'])
    i = int(c['t'] * SR); y = y[:max(0, N - i)]
    if i < 0: y = y[-i:]; i = 0
    p = (c['pan'] + 1) * np.pi / 4
    fx[i:i + len(y), 0] += y * np.cos(p); fx[i:i + len(y), 1] += y * np.sin(p)

# moteur de la Twingo qui part : régime qui monte, du centre vers la gauche (méthode MO5)
y = load(A('bank', 'mo5', 'sfx-1538.mp3'))
def varrate(seg, r0, r1):
    L_ = int(len(seg) / ((r0 + r1) / 2)); p = np.cumsum(np.linspace(r0, r1, L_)); p = p[p < len(seg) - 1]
    i = np.floor(p).astype(int); f = p - i; return seg[i] * (1 - f) + seg[i + 1] * f
ea = varrate(y[int(0.15 * SR):int(1.0 * SR)], 0.9, 1.1); eb = varrate(y[int(1.0 * SR):int(2.7 * SR)], 1.1, 1.55)
xf = int(0.04 * SR)
eng = np.concatenate([ea[:-xf], ea[-xf:] * np.linspace(1, 0, xf) + eb[:xf] * np.linspace(0, 1, xf), eb[xf:]])
eng = librosa.effects.pitch_shift(eng, sr=SR, n_steps=3)
eng = bp(eng, 150, 9000); e = np.ones(len(eng)); e[:int(0.25 * SR)] = np.linspace(0, 1, int(0.25 * SR)) ** 1.5; e[-int(0.6 * SR):] = np.linspace(1, 0, int(0.6 * SR)) ** 1.2
eng = eng * e / np.abs(eng).max() * db(ROLE['engine'][0] - 2)
fr = librosa.util.frame(np.pad(eng, (0, 2048)), frame_length=2048, hop_length=512)
ipk = int(np.argmax(np.abs(fr).max(0))) * 512
s0 = int((E_['leave'] + 0.5) * SR) - ipk; seg = eng[max(0, -s0):]; s0 = max(0, s0); seg = seg[:N - s0]   # pic quand elle sort
tt = (np.arange(len(seg)) + s0) / SR; pan = np.interp(tt, [E_['leave'], E_['leave'] + 0.9], [-0.1, -0.9])
fx[s0:s0 + len(seg), 0] += seg * np.cos((pan + 1) * np.pi / 4); fx[s0:s0 + len(seg), 1] += seg * np.sin((pan + 1) * np.pi / 4)
# le téléphone vibre une fois : l'offre arrive
tv = np.arange(int(0.6 * SR)) / SR
buzz = np.sin(2 * np.pi * 165 * tv) * (np.sin(2 * np.pi * 24 * tv) > 0) * ((tv < 0.22) | (tv > 0.34))
buzz = bp(buzz, 120, 3000) * db(-16) * np.minimum(1, np.minimum(tv, 0.6 - tv) / 0.01)
for x in [E_['bubble'] - 0.15]:
    i = int(x * SR); fx[i:i + len(buzz), 0] += buzz * 0.8; fx[i:i + len(buzz), 1] += buzz
# l'horloge de l'attente (MO5) : elle accélère avec les jours, de « La deuxième… » à l'offre
clk = sfx(1063)
i0, i1 = int((E_['d2'] - 0.1) * SR), int((E_['bubble'] - 0.2) * SR)
seg = np.tile(clk, 1 + (i1 - i0) // len(clk) + 1)[:i1 - i0]
seg = bp(seg, 1500, 12000) * db(ROLE['tick'][0] + 1) * np.interp(np.arange(len(seg)), [0, 0.3 * SR, len(seg) - 0.3 * SR, len(seg)], [0, 1, 1, 0])
fx[i0:i0 + len(seg), 0] += seg * 0.9; fx[i0:i0 + len(seg), 1] += seg

# les bruitages cèdent aussi à la voix (−7 dB pendant qu'elle parle)
fx *= (1 - (1 - db(-7)) * d2)[:, None]

# réverbération courte commune aux bruitages (ils sonnent dans la même pièce)
ir = np.random.default_rng(5).standard_normal(int(0.45 * SR)) * np.exp(-np.arange(int(0.45 * SR)) / (0.08 * SR))
ir = bp(ir, 300, 7000); ir /= np.sqrt((ir ** 2).sum())
from scipy.signal import fftconvolve
for ch in range(2): fx[:, ch] += fftconvolve(fx[:, ch], ir)[:N] * db(-15)

# ---------- somme, compression douce, loudness ----------
# téléphone : la basse de la musique allégée sous 150 Hz (un haut-parleur de téléphone ne la rend pas)
mlow = bp(mus, None, 150); mus = (mus - mlow) + mlow * db(-9)
mus = bp(mus, 45, None, 2)
mus_st = np.stack([mus, mus], 1) * db(-6)
# voix : présence 2–5 kHz légèrement remontée
vo = vo + bp(vo, 2000, 5000, 2) * (db(3) - 1)
vo_st = np.stack([vo, vo], 1)
vo_st = vo_st / (np.abs(vo_st).max() + 1e-9) * db(-3)
mix = vo_st + mus_st + fx
def comp(x, thr=-14, ratio=1.8):
    envl = np.abs(x).max(1); k = int(0.01 * SR); envl = np.convolve(envl, np.ones(k) / k, 'same')
    l = 20 * np.log10(envl + 1e-9); g = np.where(l > thr, (thr + (l - thr) / ratio) - l, 0)
    return x * db(g)[:, None]
mix = comp(mix)
meter = pyln.Meter(SR)
def limit(x, ceil_db=-4.0, look=0.004, rel=0.08):
    # limiteur à anticipation : la réduction de gain commence 4 ms avant la crête et relâche en 80 ms
    c = db(ceil_db); pk = np.abs(x).max(1)
    need = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    la = int(look * SR); g = minimum_filter1d(need, size=2 * la + 1)
    r = np.exp(-1 / (rel * SR)); out = np.empty_like(g); s_ = 1.0
    for i, v in enumerate(g):
        s_ = v if v < s_ else r * s_ + (1 - r) * v
        out[i] = s_
    return x * out[:, None]
gain_total = 0.0
for _ in range(4):
    gl = -14 - meter.integrated_loudness(mix); mix *= db(gl); gain_total += gl
    mix = limit(mix, -5.0)
up = librosa.resample(mix.T, orig_sr=SR, target_sr=4 * SR).T
tp = 20 * np.log10(np.abs(up).max())
if tp > -3.5: mix *= db(-3.5 - tp)
TAG = '' if HOOK == 'A' else '-B'
os.makedirs(A('stems-mo10'), exist_ok=True)
sf.write(A(f'mix-mo10{TAG}.wav'), mix, SR, subtype='PCM_24')
g = db(gain_total)
for name, x in [('voix', vo_st), ('musique', mus_st), ('bruitages', fx)]: sf.write(A('stems-mo10', f'{name}{TAG}.wav'), x * g, SR, subtype='PCM_24')
# version sans musique (voix + bruitages) pour juger le sound design nu
nm = (vo_st + fx) * g; nm *= db(-14 - meter.integrated_loudness(nm)); nm = limit(nm, -5.0)
sf.write(A('stems-mo10', f'sans-musique{TAG}.wav'), nm, SR, subtype='PCM_24')
Lm = meter.integrated_loudness(mix); up = librosa.resample(mix.T, orig_sr=SR, target_sr=4 * SR).T
rep = [f'MO10 {HOOK} · mix : {Lm:.1f} LUFS intégrés, true peak {20*np.log10(np.abs(up).max()):.1f} dBTP',
       f'bruitages placés : {len(kept)} · retirés pour collision : {len(dropped)} ' + ', '.join(f"{c['i']}@{c['t']:.2f}" for c in dropped)]
Lk = {l['key']: l for l in VT['lines']}
for a_, b_, nm in [(0, Lk['h2']['end'], 'ouverture'), (Lk['deb']['t'], Lk['part']['t'], 'débits'), (Lk['part']['t'], Lk['deux2']['t'], 'jour 8'),
                   (Lk['deux2']['t'], T_W1, 'attente'), (T_W1, T_BIG, 'vente'), (T_BIG, Lk['moins']['end'], '120'), (T_BACK, VT['loop'], 'par jour')]:
    seg = mix[int(a_ * SR):int(b_ * SR)]; rep.append(f'RMS {nm:10s} {20*np.log10(np.sqrt((seg**2).mean())+1e-9):6.1f} dBFS')
open(os.path.join(ROOT, 'docs', f'mix_report-mo10{TAG}.txt'), 'w').write('\n'.join(rep) + '\n')
print('\n'.join(rep))
