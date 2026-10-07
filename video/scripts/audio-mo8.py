"""MO8 « Les 5 moteurs » : voix, musique et bruitages, mixés (recettes de audio-mo6.py).

Voix   : audio/vo-mo8/vo-placed.wav (Simon, prise B retenue, accélérée de 20 % et 25 % sur la chute)
Musique: audio/music/Controlled Drop.mp3 recalée à 120 BPM :
         mesure 13 → hook (plein régime) ; mesures 2 à 9 → la liste, filtre qui s'ouvre du n° 5 au n° 1, niveau qui monte ;
         arrêt de bande sur « Le six ? », nappe grave sous la facture, souffle inversé, drop (mesure 55) sur « Toi, tu l'achètes ».
Bruits : audio/bank/mo8 (+ mo6, mo5), Mixkit, licence libre. Un son principal à la fois.
Sortie : audio/mix-mo8.wav, audio/stems-mo8/, docs/mix_report-mo8.txt
Le minutage vient de audio/vo-mo8/vo-timing.json, avec les mêmes formules que film-mo8/film.js.
"""
import os, re, json
import numpy as np, librosa, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.ndimage import minimum_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
DUR = 30.0
N = int(DUR * SR)

VT = json.load(open(A('vo-mo8', 'vo-timing.json'))); Mk = lambda k: VT['marks'][k]['t']
K = dict(cross=Mk('cross') + 0.05, moteur=Mk('moteur'), strike=Mk('strike'), six=Mk('six') - 0.08, fact=Mk('meme') + 0.05,
         cinqcents=Mk('cinqcents'), fuit=Mk('fuit') - 0.35, affaire=Mk('toi') + 0.12)
NN = [Mk(k) - 0.12 for k in ('n5', 'n4', 'n3', 'n2', 'n1')]
K['hookOut'] = NN[0] - 0.55; K['out'] = max(28.45, VT['lines'][-1]['end'] + 0.05)
NUM = []
for i, k in enumerate(('n5', 'n4', 'n3', 'n2', 'n1')):
    t0 = NN[i]; t1 = NN[i + 1] if i < 4 else K['six']; dock = max(0.55, Mk(k + 'm') - 0.1 - t0); defect = Mk(k + 'd') - t0; ex = t1 - t0 - 0.45
    NUM.append(dict(t0=t0, sweep=t0 + max(0.15, dock - 0.45), dock=t0 + dock, defect=t0 + defect, cost=t0 + min(defect + 0.4, ex - 1.25), exit=t0 + ex))
FLIP1 = Mk('n1un') - 0.08
def load(path, sr=SR, mono=True):
    y, _ = librosa.load(path, sr=sr, mono=mono)
    return y
def db(x): return 10 ** (x / 20)
def bp(y, lo=None, hi=None, order=4):
    if lo: y = sosfilt(butter(order, lo, 'hp', fs=SR, output='sos'), y)
    if hi: y = sosfilt(butter(order, hi, 'lp', fs=SR, output='sos'), y)
    return y
def env_curve(points, n=N):
    xs, ys = zip(*points); return np.interp(np.arange(n) / SR, xs, ys)

# ---------- voix ----------
vo = load(A('vo-mo8', 'vo-placed.wav'))[:N]; vo = np.pad(vo, (0, N - len(vo)))
vo = bp(vo, 80, 14000)
lines = VT['lines']
rm = lambda x: np.sqrt((x ** 2).mean() + 1e-12)
lv = [rm(vo[int(l['t'] * SR):int(l['end'] * SR)]) for l in lines]; ref = np.median(lv)
for l, r_ in zip(lines, lv):                     # chaque réplique ramenée au même niveau (± 6 dB)
    a_, b_ = int((l['t'] - 0.03) * SR), int((l['end'] + 0.05) * SR)
    vo[a_:b_] *= np.clip(ref / r_, db(-6), db(6))

# ---------- musique ----------
src = load(A('music', 'Controlled Drop.mp3'))
RATE = 120 / 123.05                              # 1 mesure = 2,000 s
BAR_SRC = 4 * 60 / 123.05
stretch = lambda seg: librosa.effects.time_stretch(seg, rate=RATE)
PIV, STOP, DROP = NN[0] - 0.02, K['six'] + 0.02, K['affaire'] - 0.02
m1 = stretch(src[int(13 * BAR_SRC * SR):int((13 * BAR_SRC + (PIV + 0.3) * RATE) * SR)])
m2 = stretch(src[int(2 * BAR_SRC * SR):int((2 * BAR_SRC + (STOP - PIV + 0.6) * RATE) * SR)])
m3 = stretch(src[int(55 * BAR_SRC * SR):int((55 * BAR_SRC + (DUR - DROP + 0.2) * RATE) * SR)])
mus = np.zeros(N)
def put(seg, t0, t1, fin=0.01, fout=0.02):
    i0, n = int(t0 * SR), int((t1 - t0) * SR); s = seg[:n].copy()
    s[:int(fin * SR)] *= np.linspace(0, 1, int(fin * SR)); s[-int(fout * SR):] *= np.linspace(1, 0, int(fout * SR))
    mus[i0:i0 + len(s)] += s
put(m1, 0, PIV, fin=0.001)
# la liste : section sombre, le filtre s'ouvre à chaque numéro, le niveau monte jusqu'au n° 1
sec2 = m2[:int((STOP - PIV) * SR) + int(0.45 * SR)].copy()
tt = np.arange(len(sec2)) / SR
low = bp(sec2, None, 200); sec2 = (sec2 - low) + low * db(-3)
cut_hz = np.interp(tt + PIV, [PIV] + [n['t0'] for n in NUM[1:]] + [STOP], [1000, 1700, 2600, 3800, 5200, 7500])
blocks = []
for b0 in range(0, len(sec2), int(0.05 * SR)):
    seg = sec2[max(0, b0 - 2048):b0 + int(0.05 * SR)]
    f = bp(seg, None, float(cut_hz[min(b0, len(cut_hz) - 1)]), 2)
    blocks.append(f[(b0 - max(0, b0 - 2048)):])
sec2 = np.concatenate(blocks)[:len(sec2)] * np.interp(tt, [0, STOP - PIV], [db(-5), db(0)])
body = sec2[:int((STOP - PIV) * SR)]; tail = sec2[len(body):len(body) + int(0.45 * SR)]
ts = int(0.22 * SR); pos = np.cumsum(np.linspace(1.0, 0.05, ts)); pos = pos[pos < len(tail) - 1]
stop = np.interp(pos, np.arange(len(tail)), tail) * np.linspace(1, 0, len(pos)) ** 1.5
i0 = int(PIV * SR); mus[i0:i0 + len(body)] += body; mus[i0 + len(body):i0 + len(body) + len(stop)] += stop
# sous la facture : nappe grave tirée du drop (passe-bas 220 Hz), qui monte doucement
pad = m3[:int((DROP - STOP) * SR) + SR]; pad = bp(pad, 40, 220, 4)[:int((DROP - STOP - 0.3) * SR)]
pad *= np.interp(np.arange(len(pad)), [0, 0.6 * SR, len(pad) - 0.2 * SR, len(pad)], [0, db(-10), db(-6), 0])
i0 = int((STOP + 0.3) * SR); mus[i0:i0 + len(pad)] += pad
rv = m3[:int(0.7 * SR)][::-1] * np.linspace(0, 1, int(0.7 * SR)) ** 2
i0 = int(DROP * SR) - len(rv); mus[i0:i0 + len(rv)] += bp(rv, 400, 9000) * 0.5
put(m3, DROP, DUR, fin=0.004, fout=0.25)
lvl = env_curve([(0, db(-1)), (PIV - 0.05, db(-1)), (PIV + 0.05, db(0)), (DROP, db(0)), (DROP + 1.0, db(-1)), (DUR - 0.3, db(-3)), (DUR, db(-4))])
mus *= lvl
# la musique cède sa place à la voix (bande de présence et niveau global)
venv = np.abs(vo); k = int(0.03 * SR); venv = np.convolve(venv, np.ones(k) / k, 'same'); venv /= venv.max() + 1e-9
duck = np.clip(venv * 6, 0, 1); att, rel = np.exp(-1 / (0.02 * SR)), np.exp(-1 / (0.35 * SR))
d2 = np.zeros_like(duck); s = 0.0
for i, x in enumerate(duck):
    s = att * s + (1 - att) * x if x > s else rel * s + (1 - rel) * x
    d2[i] = s
pres = bp(mus, 1500, 6000); mus = mus - pres * (1 - db(-10)) * d2; mus *= 1 - (1 - db(-8)) * d2

# ---------- bruitages ----------
cache = {}
def sfx(i, st=0, dur=None, fade=0.04, rev=False, start=0.0):
    key = (i, st, dur, rev, start)
    if key not in cache:
        p = next((q for q in (A('bank', d, f'sfx-{i}.mp3') for d in ('mo8', 'mo6', 'mo5')) if os.path.exists(q)))
        y = load(p)
        nz = np.where(np.abs(y) > 0.01 * np.abs(y).max())[0]
        y = y[nz[0]:] if len(nz) else y                 # attaque calée : silence de tête retiré
        y = y[int(start * SR):]
        if st: y = librosa.effects.pitch_shift(y, sr=SR, n_steps=st)
        if dur: y = y[:int(dur * SR)]
        f = int(min(fade, len(y) / SR / 3) * SR); y[-f:] *= np.linspace(1, 0, f)
        g = int(0.006 * SR); y[:g] *= np.linspace(0, 1, g)
        if rev: y = y[::-1]
        cache[key] = y / (np.abs(y).max() + 1e-9)
    return cache[key]

ROLE = {  # crête visée (dBFS) et bande
    'accent': (-4, 40, 16000), 'ui': (-10, 400, 14000), 'chime': (-13, 500, 12000), 'whoosh': (-14, 250, 9000),
    'orn': (-17, 1500, 15000), 'tick': (-22, 1500, 12000), 'tool': (-15, 200, 10000), 'scan': (-13, 300, 12000),
    'sub': (-9, 30, 300), 'hum': (-24, 120, 6000),
}
CUES = []
def cue(t, i, role, prio=2, st=0, dur=None, pan=0.0, gain=0, rev=False, lead=0.0, start=0.0):
    CUES.append(dict(t=t - lead, i=i, role=role, prio=prio, st=st, dur=dur, pan=pan, gain=gain, rev=rev, start=start))

# hook : un « tic » de phare par bandeau sous le trait de lumière, le mot barré, « moteur » écrit
for j in range(5): cue(0.5 + 0.25 * j + 0.27, 1384, 'tick', 3, st=2 * j - 4, pan=-0.3 + 0.15 * j)
cue(K['strike'], 2384, 'ui', 2, gain=-2, pan=0.2)
cue(K['moteur'] + 0.1, 2909, 'accent', 1, dur=1.0, gain=-5)
cue(K['moteur'] + 0.12, 1107, 'chime', 2, st=-3)
cue(K['hookOut'], 3120, 'whoosh', 2, dur=0.7, lead=0.06)
# chaque numéro : palette, voiture qui entre, balayage, rangement, défaut, compteur, sortie
FLIPS = [n['t0'] for n in NUM[:4]] + [FLIP1, K['six']]
for t_ in FLIPS: cue(t_, 1131, 'ui', 1, gain=-1, dur=0.35)
for j, n in enumerate(NUM):
    cue(n['t0'] + 0.03, 2909, 'accent', 1, st=-4 - j, dur=0.9, gain=-6)
    cue(n['t0'] - 0.25, 1490, 'whoosh', 2, dur=0.6, pan=0.5)
    cue(n['sweep'], 2589, 'orn', 3, st=2 + j, dur=0.6, pan=-0.2)
    cue(n['dock'], 1492, 'whoosh', 3, st=-2, dur=0.5)
    for q in range(6): cue(n['cost'] + 0.12 * q + 0.05, 1054, 'tick', 3, st=q - 2, gain=2)
    cue(n['exit'], 3120, 'whoosh', 3, dur=0.5, pan=-0.5)
# les défauts
n = NUM[0]; cue(n['defect'], 2858, 'tool', 1, gain=2); cue(n['defect'] + 0.42, 2857, 'tool', 2, gain=0); cue(n['defect'] + 0.7, 2858, 'tool', 2, st=-2)
n = NUM[1]; cue(n['defect'], 2183, 'tool', 1, st=-6, gain=3); cue(n['defect'] + 0.05, 833, 'sub', 2, st=-8, gain=-4)
n = NUM[2]; cue(n['defect'], 849, 'tool', 1, dur=1.4, gain=-1); cue(n['defect'] + 1.3, 3179, 'tool', 2, dur=0.6, gain=-2)
n = NUM[3]; cue(n['defect'] - 0.5, 2799, 'tool', 2, dur=0.7, gain=-3); cue(n['defect'] + 1.15, 1317, 'tool', 1, gain=0)
n = NUM[4]; cue(n['defect'] - 0.3, 3117, 'tool', 2, dur=2.0, gain=-3); cue(n['defect'] + 0.6, 3000, 'orn', 2, gain=2)
cue(FLIP1 - 0.55, 1131, 'tick', 3, st=-3, gain=-2)          # la palette hésite
# la chute
cue(K['six'] + 0.02, 2297, 'sub', 1, dur=1.6, gain=-2)
cue(K['six'] + 0.15, 1490, 'whoosh', 2, st=-3, dur=0.6)
cue(K['fact'], 1530, 'ui', 1, gain=-2, pan=-0.1)
for j in range(3): cue(K['fact'] + 0.35 + 0.28 * j, 1384, 'tick', 3, st=6 + 2 * j, gain=4)
cue(K['cinqcents'], 3005, 'orn', 2, st=2, dur=0.6)
cue(K['fuit'] + 0.1, 1492, 'whoosh', 2, dur=0.8, pan=-0.6); cue(K['fuit'] + 0.3, 1490, 'whoosh', 3, dur=0.8, pan=0.6)
cue(K['affaire'], 2182, 'accent', 1, gain=0); cue(K['affaire'] + 0.01, 2299, 'sub', 1, gain=-1)
cue(K['out'], 3120, 'whoosh', 2, dur=0.8, lead=0.08)
# priorité : un son moins prioritaire à moins de 0,12 s d'un plus prioritaire est retiré
CUES.sort(key=lambda c: c['t'])
kept, dropped = [], []
for c in CUES:
    clash = [o for o in CUES if o is not c and abs(o['t'] - c['t']) < 0.12 and o['prio'] < c['prio']]
    (dropped if clash else kept).append(c)
fx = np.zeros((N, 2))
def place(y, t0, pan=0.0):
    i = int(t0 * SR)
    if i < 0: y = y[-i:]; i = 0
    y = y[:max(0, N - i)]; p = (pan + 1) * np.pi / 4
    fx[i:i + len(y), 0] += y * np.cos(p); fx[i:i + len(y), 1] += y * np.sin(p)
for c in kept:
    y = sfx(c['i'], c['st'], c['dur'], rev=c['rev'], start=c['start'])
    pk, lo, hi = ROLE[c['role']]
    place(bp(y, lo, hi, 2) * db(pk + c['gain']), c['t'], c['pan'])

# réverbération courte commune aux bruitages (ils sonnent dans la même pièce)
ir = np.random.default_rng(5).standard_normal(int(0.45 * SR)) * np.exp(-np.arange(int(0.45 * SR)) / (0.08 * SR))
ir = bp(ir, 300, 7000); ir /= np.sqrt((ir ** 2).sum())
for ch in range(2): fx[:, ch] += fftconvolve(fx[:, ch], ir)[:N] * db(-15)

# ---------- somme, compression douce, loudness ----------
mlow = bp(mus, None, 150); mus = (mus - mlow) + mlow * db(-9); mus = bp(mus, 45, None, 2)   # téléphone
mus_st = np.stack([mus, mus], 1) * db(-6)
vo = vo + bp(vo, 2000, 5000, 2) * (db(3) - 1)                                             # présence de la voix
vo_st = np.stack([vo, vo], 1); vo_st = vo_st / (np.abs(vo_st).max() + 1e-9) * db(-3)
mix = vo_st + mus_st + fx
def comp(x, thr=-14, ratio=1.8):
    envl = np.abs(x).max(1); k = int(0.01 * SR); envl = np.convolve(envl, np.ones(k) / k, 'same')
    l = 20 * np.log10(envl + 1e-9); g = np.where(l > thr, (thr + (l - thr) / ratio) - l, 0)
    return x * db(g)[:, None]
mix = comp(mix)
meter = pyln.Meter(SR)
def limit(x, ceil_db=-4.0, look=0.004, rel=0.08):
    # limiteur à anticipation : la réduction de gain commence 4 ms avant la crête et relâche en 80 ms
    c = db(ceil_db); need = np.minimum(1.0, c / np.maximum(np.abs(x).max(1), 1e-9))
    g = minimum_filter1d(need, size=2 * int(look * SR) + 1)
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
os.makedirs(A('stems-mo8'), exist_ok=True)
sf.write(A('mix-mo8.wav'), mix, SR, subtype='PCM_24')
g = db(gain_total)
for name, x in [('voix', vo_st), ('musique', mus_st), ('bruitages', fx)]: sf.write(A('stems-mo8', f'{name}.wav'), x * g, SR, subtype='PCM_24')

# ---------- rapport ----------
L_ = meter.integrated_loudness(mix); up = librosa.resample(mix.T, orig_sr=SR, target_sr=4 * SR).T
rep = [f'MO8 · mix : {L_:.1f} LUFS intégrés, true peak {20*np.log10(np.abs(up).max()):.1f} dBTP (WAV, avant AAC)',
       f'bruitages placés : {len(kept)} · retirés pour collision : {len(dropped)} ' + ', '.join(f"{c['i']}@{c['t']:.2f}" for c in dropped)]
vs, ms = vo_st[:, 0] * g, mus_st[:, 0] * g
marg = []
for l in lines:
    a_, b_ = int(l['t'] * SR), int(l['end'] * SR)
    marg.append(20 * np.log10(rm(vs[a_:b_]) / (rm(ms[a_:b_]) + 1e-9)))
rep.append(f'écart voix/musique par réplique : min {min(marg):.1f} dB, médiane {np.median(marg):.1f} dB')
for a_, b_, nm in [(0, PIV, 'hook'), (PIV, STOP, 'liste'), (STOP + 0.25, DROP, 'facture'), (DROP, DUR, 'drop')]:
    seg = mix[int(a_ * SR):int(b_ * SR)]; rep.append(f'RMS {nm:9s} {20*np.log10(np.sqrt((seg**2).mean())+1e-9):6.1f} dBFS')
spec = np.abs(np.fft.rfft(mix.mean(1))) ** 2; fr = np.fft.rfftfreq(N, 1 / SR)
rep.append(f'énergie sous 150 Hz : {100 * spec[fr < 150].sum() / spec.sum():.0f} %')
open(os.path.join(ROOT, 'docs', 'mix_report-mo8.txt'), 'w').write('\n'.join(rep) + '\n')
print('\n'.join(rep))
