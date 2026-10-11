"""Motions de 15 à 20 s (dico2, A01 à A07) : voix de Simon posée (audio/vo-c7/<id>.wav), musique et bruitages
ElevenLabs de master60 réutilisés (0 crédit), mixés avec la méthode de scripts/audio-master60w.py.

Musique : audio/master60w/eleven/musique-9u5qYooFTUQhwrkABfAS.mp3 (111,98 BPM ramenés à 112), repères dans
audio/c7-musique.json (communs avec le film) :
  - mesure 4 du morceau sur l'image 0 ;
  - stop  : arrêt de bande (la chute, le chiffre ou le chuchotement tombent dans le silence) ;
  - muf   : retour étouffé (filtre qui s'ouvre) qui mène au drop sans couture, quand le silence serait trop long ;
  - pivot : drop (mesure 16), précédé d'un souffle inversé ;
  - hit   : coup final (mesure 24) sur le carton de fin, et sa traîne.
Bruits  : audio/master60w/eleven/{type}-{id}.mp3 posés aux repères du film (audio/cues-c7-<id>.json).
Sortie  : audio/mix-c7-<id>.wav (lu par render.mjs avec HOOK=<id>), audio/stems-c7/<id>-{voix,musique,bruitages,sans-musique}.wav,
          docs/mix_report-c7-<id>.txt
usage (depuis video/) : ID=A01 python scripts/audio-c7.py
"""
import os, json
import numpy as np, librosa, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
from scipy.ndimage import minimum_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
ID = os.environ.get('ID', 'dico2')
MU = json.load(open(A('c7-musique.json'), encoding='utf8'))[ID]
DUR = MU['dur']; N = int(round(DUR * SR))
BEAT = 60 / 112
T_STOP, T_MUF, T_BAM, T_HIT = MU['stop'], MU['muf'], MU['pivot'], MU['hit']
EL = A('master60w', 'eleven')
CUES = json.load(open(A(f'cues-c7-{ID}.json')))
WORDS = json.load(open(A('vo-c7', ID + '.words.json'), encoding='utf8'))

def db(x): return 10 ** (x / 20)
def bp(y, lo=None, hi=None, order=4):
    if lo: y = sosfilt(butter(order, lo, 'hp', fs=SR, output='sos'), y, axis=0)
    if hi: y = sosfilt(butter(order, hi, 'lp', fs=SR, output='sos'), y, axis=0)
    return y
def curve(points, n=N):
    xs, ys = zip(*points)
    return np.interp(np.arange(n) / SR, xs, ys)
def follow(x, att, rel, step=16):
    v = x[::step]; out = np.empty_like(v); c = 0.0
    ka, kr = np.exp(-step / (att * SR)), np.exp(-step / (rel * SR))
    for i, s in enumerate(v):
        k = ka if s > c else kr; c = s + (c - s) * k; out[i] = c
    return np.repeat(out, step)[:len(x)]

# ---------- voix ----------
vo = librosa.load(A('vo-c7', ID + '.wav'), sr=SR, mono=True)[0][:N]
vo = bp(np.pad(vo, (0, N - len(vo))), 80, 14000)
ev = follow(np.abs(vo), 0.01, 0.12)
ref = np.percentile(ev[ev > 1e-3], 60)
vo = vo * np.clip((ref / np.maximum(ev, 1e-6)) ** 0.3, db(-4), db(6))          # compression douce
vo = vo + bp(vo, 2000, 5000, 2) * (db(3) - 1)                                     # présence 2–5 kHz
vo = vo / (np.abs(vo).max() + 1e-9) * db(-3)

# ---------- musique ----------
SRC_D0 = 0.008
src = librosa.load(os.path.join(EL, 'musique-9u5qYooFTUQhwrkABfAS.mp3'), sr=SR, mono=False)[0].T
src = resample_poly(src, 4869, 4870, axis=0)
D = lambda k: SRC_D0 * 4869 / 4870 + 4 * k * BEAT
mus = np.zeros((N, 2))
def put(t0, t1, s0, fi=0.003, fo=0.003, into=None):
    into = mus if into is None else into
    a, b = int(round(t0 * SR)), int(round(min(t1, DUR) * SR))
    i0 = int(round(s0 * SR)); seg = src[i0:i0 + (b - a)].copy(); b = a + len(seg)
    if fi: k = int(fi * SR); seg[:k] *= np.sin(np.linspace(0, np.pi / 2, k))[:, None]
    if fo: k = int(fo * SR); seg[-k:] *= np.cos(np.linspace(0, np.pi / 2, k))[:, None]
    into[a:b] += seg
T_TS = T_STOP - 0.06
put(0, T_TS, D(4), fi=0.002, fo=0)
# arrêt de bande : la bande ralentit et s'éteint en 0,34 s
ts = int(0.34 * SR); i0 = int(round((T_TS + D(4)) * SR)); tail = src[i0:i0 + ts]
rate = np.linspace(1, 0, ts) ** 1.6; pos = np.cumsum(rate); pos = pos[pos < len(tail) - 1]
stop = np.stack([np.interp(pos, np.arange(len(tail)), tail[:, c]) for c in range(2)], 1) * (np.linspace(1, 0, len(pos)) ** 1.3)[:, None]
a = int(round(T_TS * SR)); mus[a:a + len(stop)] += stop
if T_MUF is not None:     # retour étouffé : le morceau reprend avant le drop, filtré, sur la grille du drop
    muf = np.zeros((N, 2)); put(T_MUF, T_BAM, D(16) - (T_BAM - T_MUF), fi=0.25, fo=0.01, into=muf)
    op = curve([(0, 0), (T_MUF, 0), (T_BAM - 0.3, 1), (DUR, 1)])
    muf = bp(muf, None, 600) * (1 - op)[:, None] + bp(muf, None, 2400) * op[:, None]
    mus += muf * db(-7)
# souffle inversé qui monte jusqu'au drop
L = int(1.2 * SR); i0 = int(round(D(16) * SR)); rv = src[i0:i0 + L][::-1] * (np.linspace(0, 1, L) ** 2.4)[:, None]
swell = np.zeros((N, 2)); a = int(round(T_BAM * SR)) - L; swell[a:a + L] = bp(rv, 300, 9000) * db(-6)
if T_HIT is not None:
    put(T_BAM - 0.01, T_HIT, D(16) - 0.01, fi=0.003, fo=0.02)
    put(T_HIT - 0.01, DUR, D(24) - 0.01, fi=0.003, fo=0)
    lvl = curve([(0, db(0)), (T_TS, db(1)), (T_BAM, db(0.5)), (T_HIT, db(1)), (T_HIT + 0.6, db(3)), (DUR - 1.0, db(3)), (DUR - 0.05, db(-12)), (DUR, 0)])
else:
    put(T_BAM - 0.01, DUR, D(16) - 0.01, fi=0.003, fo=0)
    lvl = curve([(0, db(0)), (T_TS, db(1)), (T_BAM, db(0.5)), (T_BAM + 0.6, db(2)), (DUR - 1.0, db(2)), (DUR - 0.05, db(-12)), (DUR, 0)])
mus = (mus + swell) * lvl[:, None]
mlow = bp(mus, None, 150); mus = (mus - mlow) + mlow * db(-6)                   # téléphone : basse allégée
mus = bp(mus, 40, None, 2)
# la musique cède la place à la voix, sauf sur le drop et le coup final
venv = follow(np.abs(vo), 0.005, 0.03); venv /= np.percentile(venv[venv > 1e-4], 90)
duck = follow(np.clip(venv * 2.5, 0, 1), 0.02, 0.45)
punch = np.zeros(N)
for t0 in [x for x in (T_BAM, T_HIT) if x is not None]:
    a = int(t0 * SR); k = int(0.35 * SR); punch[a:a + k] = np.maximum(punch[a:a + k], np.linspace(1, 0, k) ** 0.5)
duck = duck * (1 - punch)
pres = bp(mus, 1200, 6000)
mus = mus - pres * (1 - db(-9)) * duck[:, None]
mus *= (1 - (1 - db(-7)) * duck)[:, None]

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
# les bruitages cèdent un peu à la voix (−4 dB), sauf les impacts, l'aspiration et l'arrêt de bande
fx *= (1 - (1 - db(-4)) * duck * (1 - acc))[:, None]
# réverbération courte commune (ils sonnent dans la même pièce)
ir = np.random.default_rng(5).standard_normal(int(0.45 * SR)) * np.exp(-np.arange(int(0.45 * SR)) / (0.08 * SR))
ir = bp(ir, 300, 7000); ir /= np.sqrt((ir ** 2).sum())
for ch in range(2): fx[:, ch] += fftconvolve(fx[:, ch], ir)[:N] * db(-15)

# ---------- somme, compression douce, loudness ----------
# niveau de la musique fixé par l'écart voix / musique mesuré par phrase (médiane visée 11 dB, la voix passe devant)
rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
words = WORDS
lines, cur = [], [words[0]]
for w in words[1:]:
    if w['s'] - cur[-1]['e'] < 0.25: cur.append(w)
    else: lines.append(cur); cur = [w]
lines.append(cur)
SPANS = [(int(l[0]['s'] * SR), int(l[-1]['e'] * SR)) for l in lines if l[-1]['e'] - l[0]['s'] > 0.15]
gap = lambda m: [rms(vo[a:b]) - rms(m[a:b]) for a, b in SPANS]
mus_st = mus * db(np.median(gap(mus)) - 11)
vo_st = np.stack([vo, vo], 1)
mix = vo_st + mus_st + fx
# rembobinage (PS2) : le mix déjà joué, relu à l'envers et en accéléré (lent, rapide, lent), comme une bande qu'on rembobine
if MU.get('rew'):
    r0, r1, rto = MU['rew']; i0, i1 = int(r0 * SR), int(r1 * SR); n = i1 - i0
    p = np.linspace(0, 1, n); e = np.where(p < 0.5, 4 * p ** 3, 1 - (-2 * p + 2) ** 3 / 2)
    pos = (r0 - e * (r0 - rto)) * SR
    rw = np.stack([np.interp(pos, np.arange(len(mix)), mix[:, c]) for c in range(2)], 1)
    rw = bp(rw, 250, 6500) * (np.sin(np.pi * p) ** 0.6)[:, None]
    rw = rw / (np.abs(rw).max() + 1e-9) * db(-14) * (1 - 0.5 * duck[i0:i1])[:, None]
    mix[i0:i1] += rw
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
os.makedirs(A('stems-c7'), exist_ok=True)
sf.write(A(f'mix-c7-{ID}.wav'), mix, SR, subtype='PCM_24')
g = db(gain)
for name, x in [('voix', vo_st), ('musique', mus_st), ('bruitages', fx)]:
    sf.write(A('stems-c7', f'{ID}-{name}.wav'), x * g, SR, subtype='PCM_24')
nm = (vo_st + fx) * g; nm *= db(-14 - meter.integrated_loudness(nm)); nm = limit(nm, -5.0)
sf.write(A('stems-c7', f'{ID}-sans-musique.wav'), nm, SR, subtype='PCM_24')

# ---------- rapport mesuré ----------
rep = [f'c7 {ID} · {meter.integrated_loudness(mix):.1f} LUFS intégrés, true peak {tp(mix):.1f} dBTP',
       f'bruitages posés : {len(kept)} · retirés pour collision : {len(dropped)} (' + ', '.join(f"{c['k']}@{c['t']:.2f}" for c in dropped) + ')']
gaps = gap(mus_st)
rep.append(f'écart voix / musique par phrase : min {min(gaps):.1f} dB, médiane {np.median(gaps):.1f} dB ({len(gaps)} phrases)')
ons = librosa.onset.onset_detect(y=mus_st.mean(1), sr=SR, hop_length=128, units='time', backtrack=False)
for nm_, t_ in [x for x in [('premier temps (image 0)', 0.0), ('drop', T_BAM), ('coup final (carton)', T_HIT)] if x[1] is not None]:
    o = ons[np.argmin(np.abs(ons - t_))]; rep.append(f'attaque {nm_:24s} prévue {t_:6.2f} s, mesurée {o:6.2f} s ({(o - t_) * 1000:+.0f} ms)')
for a, b, nm_ in [(0, T_TS, 'avant arrêt'), (T_BAM, T_HIT or DUR, 'drop'), (T_HIT or DUR - 0.01, DUR, 'carton final')]:
    rep.append(f'RMS {nm_:20s} mix {rms(mix[int(a * SR):int(b * SR)]):6.1f}  musique {rms(mus_st[int(a * SR):int(b * SR)] * g):6.1f} dBFS')
open(os.path.join(ROOT, 'docs', f'mix_report-c7-{ID}.txt'), 'w', encoding='utf8').write('\n'.join(rep) + '\n')
print('\n'.join(rep))
