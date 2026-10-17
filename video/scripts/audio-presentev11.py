"""Présentation utopicar v11 : voix de Simon (eleven_v4, audio/vo-presentev11, × 1,05) devant, même musique que la v10
(audio/presente30/eleven/musique-SUMYsl1ZLq0kvbuCQLXI.mp3, pop hip-hop instrumental, 119,96 BPM, 50 s : intro mesures
0 → 8, couplet 9 → 14, mesure 15 presque vide, chute 16 → 23), montée mesure par mesure sur le parcours en quatre étapes,
bruitages ElevenLabs du master60 posés aux repères publiés par le film (window.cues → audio/cues-presentev11.json).
Montage de la musique (chaque coupe tombe sous l'impact d'une grosse couleur, fondu croisé de 12 ms) :
- accroche : l'intro, telle quelle ; « 2 458 » tombe sur le premier temps de la mesure 2 ;
- Étape 1 (couverte à 8,96 s) : le couplet, 7 mesures plus loin (le temps reste sur la grille) ; la mesure presque vide
  passe sous « 1 533 euros au-dessus de la cote » ; la chute (mesure 16) tombe juste avant « Verdict » ;
- Étapes 3 et 4 : la chute reprend 4 mesures plus tôt à chaque grosse couleur (même place dans la mesure) ;
- fin (couverte à 47,9 s) : décalée pour que « utopicar » tombe sur le premier temps de la mesure 21, la plus forte ;
  elle s'efface dans la dernière seconde, avant la boucle.
Moments : la musique s'efface sous « à éviter » (−7 dB) ; l'e-mail (« tu reçois un mail ») est filtré (passe-bas).
usage (depuis video/) : CUT=presentev11 node scripts/cues-presentev3.mjs && python3 scripts/audio-presentev11.py
  → audio/mix-presentev11.wav, audio/stems-presentev11/, docs/mix_report-presentev11.txt
"""
import os, json
import numpy as np, librosa, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
from scipy.ndimage import minimum_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
CUT = 'presentev11'
CJ = json.load(open(A(f'cues-{CUT}.json')))
CUES, DUR = CJ['cues'], CJ['dur']
N = int(round(DUR * SR))
EL = A('master60w', 'eleven')
def db(x): return 10 ** (x / 20)
def bp(y, lo=None, hi=None, order=4):
    if lo: y = sosfilt(butter(order, lo, 'hp', fs=SR, output='sos'), y, axis=0)
    if hi: y = sosfilt(butter(order, hi, 'lp', fs=SR, output='sos'), y, axis=0)
    return y
def curve(points, n=N):
    xs, ys = zip(*points); return np.interp(np.arange(n) / SR, xs, ys)

# ---------- voix ----------
VOD = 'vo-presentev11'
vo = librosa.load(A(VOD, 'vo.wav'), sr=SR, mono=True)[0][:N]; vo = np.pad(vo, (0, N - len(vo)))
vo = bp(vo, 80, None, 2)
WORDS = json.load(open(A(VOD, 'vo.words.json'), encoding='utf8'))
w = lambda i: WORDS[i]['s']; we = lambda i: WORDS[i]['e']
# instants des grosses couleurs (écran couvert), relus dans les repères du film : un « impact » chacune
IMP = sorted(c['t'] for c in CUES if c['k'] == 'impact')
R1c, R3c, R4c, R5c = [min(IMP, key=lambda x: abs(x - v)) for v in (8.96, 31.5, 41.62, 47.9)]

# ---------- musique ----------
src = librosa.load(A('presente30', 'eleven', 'musique-SUMYsl1ZLq0kvbuCQLXI.mp3'), sr=SR, mono=False)[0].T
BAR = 4 * 60 / 119.958
D = lambda k: 0.010 + BAR * k                                    # premier temps de la mesure k du morceau
mus = np.zeros((N, 2))
def put(t0, t1, s0, fi=0.012, fo=0.012):
    a, b = int(round(t0 * SR)), int(round(min(t1, DUR) * SR)); i0 = int(round(s0 * SR))
    seg = src[i0:i0 + (b - a)].copy(); b = a + len(seg)
    if fi: k = int(fi * SR); seg[:k] *= np.sin(np.linspace(0, np.pi / 2, k))[:, None]
    if fo: k = int(fo * SR); seg[-k:] *= np.cos(np.linspace(0, np.pi / 2, k))[:, None]
    mus[a:b] += seg
o1 = 7 * BAR                                                     # Étape 1 : 7 mesures plus loin, même grille
o4 = D(21) - w(166)                                              # fin : « utopicar » sur la mesure 21
SEGS = [(0, R1c, 0.0), (R1c, R3c, o1), (R3c, R4c, o1 - 4 * BAR), (R4c, R5c, o1 - 8 * BAR), (R5c, DUR, o4)]
for i, (t0, t1, o) in enumerate(SEGS):
    put(t0 - (0.006 if i else 0), t1 + 0.006, t0 - (0.006 if i else 0) + o, fi=0.012 if i else 0.002, fo=0.012 if t1 < DUR else 0)
    print(f'musique {t0:5.2f} → {t1:5.2f} s : morceau {t0 + o:5.2f} → {t1 + o:5.2f} s (mesures {(t0 + o - 0.01) / BAR:4.1f} → {(t1 + o - 0.01) / BAR:4.1f})')
print(f'chute (mesure 16) à {D(16) - o1:.2f} s ; « Verdict » à {w(61):.2f} s ; « utopicar » à {w(166):.2f} s')
mus *= curve([(0, 1), (DUR - 1.2, 1), (DUR - 0.15, db(-10)), (DUR, 0)])[:, None]
# « à éviter » : la musique s'efface sous le mot (−7 dB), la voix passe devant
tp_ = w(62); mus *= curve([(0, 1), (tp_ - 0.06, 1), (tp_ - 0.01, db(-7)), (we(63) + 0.1, db(-7)), (we(63) + 0.28, 1), (DUR, 1)])[:, None]
# « tu reçois un mail » : la musique passe derrière une porte (passe-bas) pendant l'e-mail, jusqu'à la grosse couleur
a, b = int((w(95) - 0.1) * SR), int((R3c - 0.3) * SR)
k_ = int(0.1 * SR); seg_ = mus[a:b].copy(); low_ = bp(seg_, None, 800, 2) * db(-1)
m_ = np.ones(b - a); m_[:k_] = np.linspace(0, 1, k_); m_[-k_:] = np.linspace(1, 0, k_); mus[a:b] = seg_ * (1 - m_[:, None]) + low_ * m_[:, None]
mlow = bp(mus, None, 150); mus = (mus - mlow) + mlow * db(-11); mus = bp(mus, 60, None, 2)
mus = mus + bp(mus, 1500, 5000, 2) * (db(3) - 1)          # téléphone : présence remontée
# niveau de la musique fixé par l'écart voix / musique mesuré par phrase (médiane 11 dB, aucune sous 8,5 dB)
rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
lines, cur = [], [WORDS[0]]
for x in WORDS[1:]:
    if x['s'] - cur[-1]['e'] < 0.25: cur.append(x)
    else: lines.append(cur); cur = [x]
lines.append(cur)
SPANS = [(int(l[0]['s'] * SR), int(l[-1]['e'] * SR)) for l in lines if l[-1]['e'] - l[0]['s'] > 0.15]
gap = lambda m_: [rms(vo[a_:b_]) - rms(m_[a_:b_].mean(1)) for a_, b_ in SPANS]
mus_st = mus * db(np.median(gap(mus)) - 11)
g_, r_ = np.ones(N), int(0.15 * SR)
for (a_, b_), gp in zip(SPANS, gap(mus_st)):
    if gp >= 8.5: continue
    att = db(gp - 8.5); t_ = np.arange(max(0, a_ - r_), min(N, b_ + r_))
    env_ = np.minimum(np.clip((t_ - (a_ - r_)) / r_, 0, 1), np.clip(((b_ + r_) - t_) / r_, 0, 1))
    g_[t_] = np.minimum(g_[t_], 1 - (1 - att) * env_)
mus_st = mus_st * g_[:, None]
# voix : enveloppe lissée pour que les bruitages lui cèdent
env = np.convolve(np.abs(vo), np.ones(int(0.05 * SR)) / int(0.05 * SR), 'same'); duck = np.clip(env / (env.max() * 0.08), 0, 1)

# ---------- bruitages ElevenLabs (banque du master60, aucun crédit dépensé) ----------
# type → variations (id ElevenLabs), découpe utile (s), crête visée (dBFS), bande, priorité
SFX = {
    'impact':   (['XdL5urufpCbm871pFAXd', 'Qdtw6bl4Rb3MmwEPmotC'], 0.75, -5, (35, 16000), 1),
    'click':    (['yymFsXmOF34a0Wx700Oo', 'ATLKrH4q8zBksXS7koPd'], 0.065, -11, (400, 14000), 1),
    'ding':     (['I926zzANA0Hq7GyKfqPI'], 1.0, -12, (400, 14000), 1),
    'paste':    (['XtZtq66yXHh6OhsRKxCq', 'BlZUEwp3CHcFL3D0IIls'], 0.09, -12, (300, 14000), 1),
    'roll':     (['zyrCN5AGZ4ifzBraCncB'], 0.75, -17, (700, 14000), 2),
    'whoosh':   (['9uu5N0f4jSpDE4efetVC', 'rdvOxecFEfq2CQ7LjUnD', 'Nbw8qeLBXWPnq51JF6jO'], 0.4, -15, (200, 10000), 2),
    'tick':     (['yymFsXmOF34a0Wx700Oo', 'ATLKrH4q8zBksXS7koPd'], 0.05, -18, (600, 14000), 2),
    'key':      (['N9LZRN6RiuOK2Hkzf2UJ', 'U1njFRc5kQcmYciwB2Q2', 'WnpLcSfxTRYV9IUmV8mi'], 0.07, -20, (500, 14000), 2),
    'pop':      (['gt26tFt4uO98tnaurlYo', 'DTF1oItCkJVPcWDY2S7H'], 0.12, -19, (600, 14000), 3),
}
FILEK = {'paste': 'click', 'tick': 'click', 'key': 'type'}   # type → prise source
KEYS = []
for gid in SFX['key'][0]:
    y_ = librosa.load(os.path.join(EL, f'type-{gid}.mp3'), sr=SR, mono=True)[0]
    for o in librosa.onset.onset_detect(y=y_, sr=SR, units='samples', backtrack=True):
        sl = y_[o:o + int(0.07 * SR)].copy()
        if len(sl) < int(0.05 * SR) or np.abs(sl).max() < 0.15 * np.abs(y_).max(): continue
        f_ = int(0.015 * SR); sl[-f_:] *= np.linspace(1, 0, f_); KEYS.append(sl)
cache = {}
def clip(k, gid, st=0.0, j=0):
    key = (k, gid, round(st, 2), j if k == 'key' else 0)
    if key not in cache:
        fk = FILEK.get(k, k)
        y = KEYS[(j * 7) % len(KEYS)].copy() if k == 'key' else librosa.load(os.path.join(EL, f'{fk}-{gid}.mp3'), sr=SR, mono=True)[0]
        if k != 'key':
            nz = np.where(np.abs(y) > 0.05 * np.abs(y).max())[0]
            y = y[max(0, nz[0] - int(0.002 * SR)):][:int(SFX[k][1] * SR)]   # attaque calée, découpe utile
        if st: y = librosa.effects.pitch_shift(y, sr=SR, n_steps=st)
        f = min(int(0.03 * SR), len(y) // 3); y[-f:] *= np.linspace(1, 0, f)
        y = bp(y, *SFX[k][3], order=2)
        if k == 'impact':                                   # harmoniques pour un haut-parleur de téléphone
            y = y / np.abs(y).max(); y = y + 0.45 * bp(np.tanh(5 * y) / np.tanh(5), 300, 6000, 2)
        cache[key] = y / (np.abs(y).max() + 1e-9)
    return cache[key]
# suites : chaque son d'une même suite monte (pops et ticks sur une gamme, clics +0 +2 +4 +7)
SCALE = [0, 2, 4, 5, 7, 9, 11, 12]
cues = sorted(CUES, key=lambda c: c['t'])
run, last = {}, {}
for c in cues:
    k = c['k']; gp_ = {'click': 0.7, 'pop': 0.42, 'tick': 0.5, 'key': 0.3}.get(k)
    i = run.get(k, -1) + 1 if gp_ and k in last and c['t'] - last[k] < gp_ else 0
    run[k], last[k] = i, c['t']
    c['st'] = {'pop': SCALE[i % 8], 'click': [0, 2, 4, 7][min(i, 3)], 'tick': SCALE[i % 8], 'key': [0, 0.4, -0.3, 0.6, -0.5, 0.2][i % 6]}.get(k, 0) if gp_ else 0
    c['pan'] = (0.12 if i % 2 else -0.12) if i else 0.0
# un son moins prioritaire à moins de 0,12 s d'un plus prioritaire est retiré
kept, dropped = [], []
for c in cues:
    clash = any(o is not c and abs(o['t'] - c['t']) < 0.12 and SFX[o['k']][4] < SFX[c['k']][4] for o in cues)
    (dropped if clash else kept).append(c)
fx = np.zeros((N, 2)); acc = np.zeros(N); rr = {}
for c in kept:
    ids = SFX[c['k']][0]; j = rr.get(c['k'], 0); rr[c['k']] = j + 1
    y = clip(c['k'], ids[j % len(ids)], c['st'], j) * db(SFX[c['k']][2]) * c['g']
    t0 = c['t'] - (0.03 if c['k'] == 'whoosh' else 0)
    i = int(round(t0 * SR)); y = y[:max(0, N - i)]
    if i < 0: y = y[-i:]; i = 0
    p = (c['pan'] + 1) * np.pi / 4
    fx[i:i + len(y), 0] += y * np.cos(p) * np.sqrt(2); fx[i:i + len(y), 1] += y * np.sin(p) * np.sqrt(2)
    if c['k'] == 'impact': acc[i:i + len(y)] = 1
fx *= (1 - (1 - db(-4)) * duck * (1 - acc))[:, None]   # les bruitages cèdent 4 dB à la voix (sauf impacts)
ir = np.random.default_rng(5).standard_normal(int(0.45 * SR)) * np.exp(-np.arange(int(0.45 * SR)) / (0.08 * SR))
ir = bp(ir, 300, 7000); ir /= np.sqrt((ir ** 2).sum())
for ch in range(2): fx[:, ch] += fftconvolve(fx[:, ch], ir)[:N] * db(-15)

# ---------- somme : la voix devant ----------
vo_st = np.stack([vo, vo], 1) / (np.abs(vo).max() + 1e-9) * db(-6)
mus_st = mus_st / (np.abs(vo).max() + 1e-9) * db(-6)
mix = vo_st + mus_st + fx
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
os.makedirs(A(f'stems-{CUT}'), exist_ok=True)
sf.write(A(f'mix-{CUT}.wav'), mix, SR, subtype='PCM_24')
g = db(gain)
for name, x in [('voix', vo_st), ('musique', mus_st), ('bruitages', fx)]: sf.write(A(f'stems-{CUT}', f'{name}.wav'), x * g, SR, subtype='PCM_24')
rep = [f'{CUT} · {meter.integrated_loudness(mix):.1f} LUFS, true peak {tp(mix):.1f} dBTP · bruitages {len(kept)} posés, {len(dropped)} retirés']
gg = [rms(vo_st[a_:b_, 0]) - rms(mus_st[a_:b_].mean(1)) for a_, b_ in SPANS]
rep.append(f'écart voix / musique par phrase : min {min(gg):.1f} dB, médiane {np.median(gg):.1f} dB ({len(gg)} phrases)')
e50 = [rms(vo[i_:i_ + int(0.05 * SR)]) for i_ in range(int(0.1 * SR), int(WORDS[-1]['e'] * SR), int(0.05 * SR))]
run_, mx_ = 0, 0
for v_ in e50: run_ = run_ + 1 if v_ < -50 else 0; mx_ = max(mx_, run_)
rep.append(f'plus long blanc dans la voix : {mx_ * 0.05:.2f} s')
open(os.path.join(ROOT, 'docs', f'mix_report-{CUT}.txt'), 'w').write('\n'.join(rep) + '\n'); print('\n'.join(rep))
