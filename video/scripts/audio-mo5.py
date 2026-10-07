"""MO5 « 47 € » : voix, musique et bruitages, mixés (méthode .claude/skills/motion-studio/references/sound-design.md).

Voix   : audio/vo-mo5/vo-placed.wav (Simon, prise B accélérée de 10 %, répliques placées sur le film)
Musique: audio/music/Controlled Drop.mp3 (fournie par l'utilisateur), recalée à 120 BPM :
         mesure 13 → 0–18,65 s (l'attente retire la basse), arrêt net sur « 47 », silence,
         remontée à l'envers puis mesure 55 → 22,0–29,6 s.
Bruits : audio/bank/mo5/sfx-*.mp3 (Mixkit, licence libre), un son principal à la fois.
Sortie : audio/mix-mo5.wav, audio/stems-mo5/{voix,musique,bruitages}.wav, docs/mix_report-mo5.txt
"""
import os, json, subprocess
import numpy as np, librosa, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, sosfiltfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
DUR = 29.6
N = int(DUR * SR)

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
vo = load(A('vo-mo5', 'vo-placed.wav'))[:N]
vo = np.pad(vo, (0, N - len(vo)))
vo = bp(vo, 80, 14000)
lines = json.load(open(A('vo-mo5', 'vo-timing.json')))['lines']
# chaque réplique ramenée au même niveau (± 6 dB max) : la voix ne disparaît jamais
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
m1 = stretch(src[int(13 * BAR_SRC * SR):int((13 * BAR_SRC + 19.2 * RATE) * SR)])
m2 = stretch(src[int(55 * BAR_SRC * SR):int((55 * BAR_SRC + 8.0 * RATE) * SR)])
mus = np.zeros(N)
a = m1[:int(18.65 * SR)]
# arrêt net sur « 47 » : une bande qui ralentit en 0,22 s (tape stop)
ts = int(0.22 * SR); tail = m1[int(18.65 * SR):int(18.65 * SR) + int(0.45 * SR)]
pos = np.cumsum(np.linspace(1.0, 0.05, ts)); pos = pos[pos < len(tail) - 1]
stop = np.interp(pos, np.arange(len(tail)), tail) * np.linspace(1, 0, len(pos)) ** 1.5
mus[:len(a)] = a
mus[len(a):len(a) + len(stop)] = stop
# remontée : 0,9 s du début de la reprise, à l'envers, qui monte jusqu'au premier temps (22,0 s)
rv = m2[:int(0.9 * SR)][::-1] * np.linspace(0, 1, int(0.9 * SR)) ** 2
i0 = int(22.0 * SR) - len(rv); mus[i0:i0 + len(rv)] += bp(rv, 300, 9000) * 0.7
b = m2[:N - int(22.0 * SR)]
mus[int(22.0 * SR):int(22.0 * SR) + len(b)] = b
# mise en scène : attaque à l'image 0, l'attente retire la basse et le haut, fondu de boucle
lo_cut = env_curve([(0, 1), (11.9, 1), (12.4, 0), (15.5, 0), (15.8, 1), (DUR, 1)])
low = bp(mus, None, 200); rest = mus - low
mus = rest + low * lo_cut
dark = env_curve([(0, 0), (11.9, 0), (12.4, 1), (15.5, 1), (15.8, 0), (DUR, 0)])
mus = mus * (1 - dark) + bp(mus, None, 1400) * dark
lvl = env_curve([(0, db(-1)), (11.9, db(-1)), (12.4, db(-5)), (15.5, db(-5)), (15.8, db(-1)), (18.6, db(-1)), (22.0, db(0)), (29.2, db(0)), (DUR, db(-3))])
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

# ---------- bruitages ----------
BANK = A('bank', 'mo5')
cache = {}
def sfx(i, st=0, dur=None, fade=0.04, rev=False):
    key = (i, st, dur, rev)
    if key not in cache:
        y = load(os.path.join(BANK, f'sfx-{i}.mp3'))
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
    'orn': (-17, 1500, 15000), 'tick': (-22, 1500, 12000), 'engine': (-11, 140, 9000),
}
CUES = []
def cue(t, i, role, prio=2, st=0, dur=None, pan=0.0, gain=0, rev=False, lead=0.0):
    CUES.append(dict(t=t - lead, i=i, role=role, prio=prio, st=st, dur=dur, pan=pan, gain=gain, rev=rev))

# hook
cue(0.22, 2589, 'orn', 2, dur=0.9, pan=-0.2)                  # le point de lumière trace la barre
cue(0.72, 3005, 'orn', 2, dur=0.7, pan=-0.15)                 # la fente écrit « 1 500 € »
cue(1.28, 3005, 'orn', 3, st=5, dur=0.5, pan=0.25)            # le « ? »
cue(2.24, 1490, 'whoosh', 2, dur=0.5, pan=0.45, lead=0.12)    # la notification arrive de la droite
cue(2.44, 2909, 'accent', 1, dur=1.2)                         # impact
cue(2.46, 2354, 'ui', 1, pan=0.2)                             # le « pop » de la notification
cue(3.95, 3120, 'whoosh', 2, dur=0.7, lead=0.08)              # « 1 500 » monte au compteur
for i, x in enumerate([4.32, 4.39, 4.46, 4.53]): cue(x, 1384, 'tick', 3, st=2 * i, pan=-0.3 + 0.2 * i)   # les cases se tracent
for i in range(5): cue(4.08 + i * 0.07 + 0.12, 1119, 'tick', 3, pan=-0.35 + 0.17 * i)                      # palettes JOUR 1
cue(4.62, 1492, 'whoosh', 2, dur=0.8, pan=0.3, lead=0.1)      # éclair, la Polo arrive
cue(5.6, 2589, 'orn', 3, dur=0.8, pan=-0.2)                   # le contour se trace
# pluie de débits : chaque débit joue une note plus grave ; le kebab, une note plus haute (le gag)
T = [6.0, 6.8, 7.3, 7.81, 8.23, 8.74, 9.45, 9.95, 11.65]
for k, x in enumerate(T):
    cue(x, 2354, 'ui', 1, st=(5 if k == 8 else -k), pan=0.35)
    cue(x - 0.02, 1490, 'whoosh', 3, dur=0.35, pan=0.5, gain=-4, lead=0.1)
    cue(x + 0.3 + 0.45, 2380, 'tick', 3, dur=0.35, pan=0.0, gain=4)   # l'étiquette se colle
# attente
cue(12.0, 1492, 'whoosh', 2, dur=0.9, st=-3, lead=0.1)
for k, x in enumerate([13.1, 14.0, 14.8]): cue(x, 2354, 'ui', 1, st=-9 - k, pan=0.35)
# revente
cue(17.35, 951, 'chime', 1, pan=0.3)
cue(18.12, 1054, 'tick', 2, dur=0.55, gain=6)                 # le compteur dégringole
cue(18.62, 2909, 'accent', 1, dur=1.4, st=-2)                 # « 47 »
cue(18.75, 946, 'ui', 2, gain=-3)                             # petite note qui tombe
cue(19.9, 2369, 'orn', 2, dur=0.8, gain=-2)                   # « Même pas un plein » s'écrit
# rembobinage, formule
cue(20.9, 1092, 'accent', 1, dur=1.45, gain=-6)
cue(22.2, 3120, 'whoosh', 2, dur=0.7, lead=0.08)
for x in [22.45, 22.9, 23.35]: cue(x, 2369, 'orn', 3, dur=0.45, gain=-3)
cue(23.75, 2589, 'orn', 2, dur=0.8)
cue(24.0, 2909, 'accent', 1, dur=1.0)
cue(24.02, 1107, 'chime', 2, st=0)
cue(25.5, 1490, 'whoosh', 2, dur=0.45, pan=0.45, lead=0.1)
cue(26.0, 2384, 'ui', 2, pan=-0.1)
cue(LOOP := 27.45, 3120, 'whoosh', 2, dur=0.8, lead=0.08)

# priorité : un son moins prioritaire à moins de 0,12 s d'un plus prioritaire est retiré
CUES.sort(key=lambda c: c['t'])
kept, dropped = [], []
for c in CUES:
    clash = [o for o in CUES if o is not c and abs(o['t'] - c['t']) < 0.12 and o['prio'] < c['prio']]
    (dropped if clash else kept).append(c)

fx = np.zeros((N, 2))
for c in kept:
    y = sfx(c['i'], c['st'], c['dur'], rev=c['rev'])
    pk, lo, hi = ROLE[c['role']]
    y = bp(y, lo, hi, 2) * db(pk + c['gain'])
    i = int(c['t'] * SR); y = y[:max(0, N - i)]
    if i < 0: y = y[-i:]; i = 0
    p = (c['pan'] + 1) * np.pi / 4
    fx[i:i + len(y), 0] += y * np.cos(p); fx[i:i + len(y), 1] += y * np.sin(p)

# moteur de la Polo : régime qui monte à l'entrée (4,85 s), redescend au freinage, de la droite vers le centre
y = load(os.path.join(BANK, 'sfx-1538.mp3'))
def varrate(seg, r0, r1):
    L = int(len(seg) / ((r0 + r1) / 2)); p = np.cumsum(np.linspace(r0, r1, L)); p = p[p < len(seg) - 1]
    i = np.floor(p).astype(int); f = p - i; return seg[i] * (1 - f) + seg[i + 1] * f
ea = varrate(y[int(0.15 * SR):int(1.2 * SR)], 0.95, 1.35); eb = varrate(y[int(1.2 * SR):int(2.7 * SR)], 1.15, 0.85)
xf = int(0.04 * SR)
eng = np.concatenate([ea[:-xf], ea[-xf:] * np.linspace(1, 0, xf) + eb[:xf] * np.linspace(0, 1, xf), eb[xf:]])
eng = librosa.effects.pitch_shift(eng, sr=SR, n_steps=3)
eng = bp(eng, 150, 9000); e = np.ones(len(eng)); e[:int(0.25 * SR)] = np.linspace(0, 1, int(0.25 * SR)) ** 1.5; e[-int(0.6 * SR):] = np.linspace(1, 0, int(0.6 * SR)) ** 1.2
eng = eng * e / np.abs(eng).max() * db(ROLE['engine'][0])
fr = librosa.util.frame(np.pad(eng, (0, 2048)), frame_length=2048, hop_length=512)
ipk = int(np.argmax(np.abs(fr).max(0))) * 512
s0 = int(5.15 * SR) - ipk; seg = eng[max(0, -s0):]; s0 = max(0, s0); seg = seg[:N - s0]
tt = (np.arange(len(seg)) + s0) / SR; pan = np.interp(tt, [4.6, 5.8], [0.85, 0.0])
fx[s0:s0 + len(seg), 0] += seg * np.cos((pan + 1) * np.pi / 4); fx[s0:s0 + len(seg), 1] += seg * np.sin((pan + 1) * np.pi / 4)
# vibration du téléphone (15,75 s) : un bourdonnement court, deux fois
tv = np.arange(int(0.6 * SR)) / SR
buzz = np.sin(2 * np.pi * 165 * tv) * (np.sin(2 * np.pi * 24 * tv) > 0) * ((tv < 0.22) | (tv > 0.34))
buzz = bp(buzz, 120, 3000) * db(-15) * np.minimum(1, np.minimum(tv, 0.6 - tv) / 0.01)
i = int(15.75 * SR); fx[i:i + len(buzz), 0] += buzz * 0.8; fx[i:i + len(buzz), 1] += buzz
# tic-tac de l'attente : une horloge qui accélère
clk = sfx(1063, dur=None)
i0 = int(12.3 * SR); i1 = int(15.6 * SR); seg = clk[:i1 - i0] if len(clk) >= i1 - i0 else np.tile(clk, 3)[:i1 - i0]
seg = bp(seg, 1500, 12000) * db(ROLE['tick'][0] + 2) * np.interp(np.arange(len(seg)), [0, 0.3 * SR, len(seg) - 0.3 * SR, len(seg)], [0, 1, 1, 0])
fx[i0:i0 + len(seg), 0] += seg; fx[i0:i0 + len(seg), 1] += seg

# réverbération courte commune aux bruitages (ils sonnent dans la même pièce)
ir = np.random.default_rng(5).standard_normal(int(0.45 * SR)) * np.exp(-np.arange(int(0.45 * SR)) / (0.08 * SR))
ir = bp(ir, 300, 7000); ir /= np.sqrt((ir ** 2).sum())
from scipy.signal import fftconvolve
for ch in range(2): fx[:, ch] += fftconvolve(fx[:, ch], ir)[:N] * db(-15)

# ---------- somme, compression douce, loudness ----------
mus_st = np.stack([mus, mus], 1) * db(-6)
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
    la = int(look * SR); need = np.minimum.accumulate(np.r_[need[la:], np.ones(la)][::-1])[::-1] if False else np.array([need[i:i + la + 1].min() for i in range(0, len(need))]) if len(need) < 0 else need
    from scipy.ndimage import minimum_filter1d
    g = minimum_filter1d(need, size=2 * la + 1)
    r = np.exp(-1 / (rel * SR)); out = np.empty_like(g); s_ = 1.0
    for i, v in enumerate(g):
        s_ = v if v < s_ else r * s_ + (1 - r) * v
        out[i] = s_
    return x * out[:, None]
gain_total = 0.0
for _ in range(4):
    gl = -14 - meter.integrated_loudness(mix); mix *= db(gl); gain_total += gl
    mix = limit(mix, -4.0)
up = librosa.resample(mix.T, orig_sr=SR, target_sr=4 * SR).T
tp = 20 * np.log10(np.abs(up).max())
if tp > -3.5: mix *= db(-3.5 - tp)
gain = gain_total
os.makedirs(A('stems-mo5'), exist_ok=True)
sf.write(A('mix-mo5.wav'), mix, SR, subtype='PCM_24')
g = db(gain)
for name, x in [('voix', vo_st), ('musique', mus_st), ('bruitages', fx)]: sf.write(A('stems-mo5', f'{name}.wav'), x * g, SR, subtype='PCM_24')
L = meter.integrated_loudness(mix); up = librosa.resample(mix.T, orig_sr=SR, target_sr=4 * SR).T
rep = [f'MO5 · mix : {L:.1f} LUFS intégrés, true peak {20*np.log10(np.abs(up).max()):.1f} dBTP',
       f'bruitages placés : {len(kept)} · retirés pour collision : {len(dropped)} ' + ', '.join(f"{c['i']}@{c['t']:.2f}" for c in dropped)]
for a_, b_, nm in [(0, 4, 'hook'), (6, 11.8, 'pluie'), (12.3, 15.5, 'attente'), (18.7, 20.9, '47'), (22.0, 27.4, 'formule')]:
    seg = mix[int(a_ * SR):int(b_ * SR)]; rep.append(f'RMS {nm:8s} {20*np.log10(np.sqrt((seg**2).mean())+1e-9):6.1f} dBFS')
open(os.path.join(ROOT, 'docs', 'mix_report-mo5.txt'), 'w').write('\n'.join(rep) + '\n')
print('\n'.join(rep))
