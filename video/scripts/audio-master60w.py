"""master60 « wow » (16:9) : voix de Simon, musique et bruitages ElevenLabs, mixés
(méthode .claude/skills/motion-studio/references/sound-design.md).

Voix    : audio/vo-master60/vo-placed-{A,B}.wav (calée sur la grille de 112 BPM par scripts/cale-master60.py).
Musique : audio/master60w/eleven/musique-9u5qYooFTUQhwrkABfAS.mp3 (eleven_music_v2_5, 111,98 BPM ramenés à 112 ;
          montée → coupure → drop à 34,3 s → coup final à 51,45 s). Calée sur la grille de la voix (grille.json) :
          - avant « Hop ! » : un seul passage continu, ses premiers temps de mesure sur les temps 0, 4, 8… du film.
            Arrêt de bande sur « Ah. », silence, reprise étouffée sur « Non. », pleine bande sur le logo. La coupure du
            morceau tombe sur « 14 onglets », puis un temps de silence où passe le souffle inversé ;
          - drop sur « Hop ! » (temps 49). Mesures 16 → 22, 19 → 21, puis 23 (onze mesures). Les coupes tombent sur des
            premiers temps et se font entre mesures qui se ressemblent (chroma + MFCC). Un temps d'arrêt après
            « avant d'appeler. », puis le coup final du morceau sur le logo (temps 94) et sa traîne jusqu'à la fin.
Bruits  : audio/master60w/eleven/{type}-{id}.mp3 (eleven_text_to_sound_v2), posés aux instants que publie le film
          (window.cues → audio/cues-master60w-{A,B}.json, scripts/cues-master60w.mjs). Un son principal à la fois. Les
          suites (pops, clics, messages envoyés) montent d'un ton à chaque son. Les impacts sont saturés pour s'entendre
          sur un téléphone.
Sortie  : audio/mix-master60w-{A,B}.wav (lu par render.mjs), audio/stems-master60w/{voix,musique,bruitages,sans-musique}-{A,B}.wav,
          docs/mix_report-master60w-{A,B}.txt
usage (depuis video/) : HOOK=A python3 scripts/audio-master60w.py && HOOK=B python3 scripts/audio-master60w.py
"""
import os, json
import numpy as np, librosa, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
from scipy.ndimage import minimum_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
HOOK = os.environ.get('HOOK', 'A').upper()
VT = json.load(open(A('vo-master60', 'vo-timing.json')))
GR = json.load(open(A('vo-master60', 'grille.json')))
DUR = json.load(open(os.path.join(ROOT, 'timeline-master60w.json')))['dur']
N = int(round(DUR * SR))
BEAT = GR['beat']
BT = lambda n: GR['ancre'] + n * BEAT
mk = lambda k: VT['marks'][k]['t']
EL = A('master60w', 'eleven')
CUES = json.load(open(A(f'cues-master60w-{HOOK}.json')))

def db(x): return 10 ** (x / 20)
def bp(y, lo=None, hi=None, order=4):
    if lo: y = sosfilt(butter(order, lo, 'hp', fs=SR, output='sos'), y, axis=0)
    if hi: y = sosfilt(butter(order, hi, 'lp', fs=SR, output='sos'), y, axis=0)
    return y
def curve(points, n=N):
    xs, ys = zip(*points)
    return np.interp(np.arange(n) / SR, xs, ys)
def follow(x, att, rel, step=16):
    """suiveur d'enveloppe (attaque / relâchement en s), calculé tous les `step` échantillons"""
    v = x[::step]; out = np.empty_like(v); c = 0.0
    ka, kr = np.exp(-step / (att * SR)), np.exp(-step / (rel * SR))
    for i, s in enumerate(v):
        k = ka if s > c else kr; c = s + (c - s) * k; out[i] = c
    return np.repeat(out, step)[:len(x)]

# ---------- voix ----------
vo = librosa.load(A('vo-master60', f'vo-placed-{HOOK}.wav'), sr=SR, mono=True)[0][:N]
vo = bp(np.pad(vo, (0, N - len(vo))), 80, 14000)
ev = follow(np.abs(vo), 0.01, 0.12)
ref = np.percentile(ev[ev > 1e-3], 60)
vo = vo * np.clip((ref / np.maximum(ev, 1e-6)) ** 0.3, db(-4), db(6))          # compression douce, ± quelques dB
vo = vo + bp(vo, 2000, 5000, 2) * (db(3) - 1)                                     # présence 2–5 kHz
vo = vo / (np.abs(vo).max() + 1e-9) * db(-3)

# ---------- musique ----------
SRC_BPM, SRC_D0 = 111.977, 0.008      # tempo mesuré (régression sur 91 temps, résidu < 9 ms) et premier temps de mesure 0
src = librosa.load(os.path.join(EL, 'musique-9u5qYooFTUQhwrkABfAS.mp3'), sr=SR, mono=False)[0].T     # (n, 2)
src = resample_poly(src, 4869, 4870, axis=0)                                       # 111,977 → 112 BPM (lue 0,02 % plus vite)
D = lambda k: SRC_D0 * 4869 / 4870 + 4 * k * BEAT                                 # premier temps de la mesure k du morceau
T_AH, T_NON, T_LOGO, T_HOP = mk('ah'), mk('non'), mk('utopicar'), BT(49)
T_TS = T_AH - 0.06                                                                 # arrêt de bande (repère « tapestop » du film)
T_HIT = BT(94)                                                                     # coup final sur le logo
OFF1 = D(16) - BT(48)                                                              # avant le drop : temps 4k du film = mesure du morceau
mus = np.zeros((N, 2))
def put(t0, t1, s0, fi=0.003, fo=0.003, tail=0.0):
    """copie le morceau à partir de s0 sur le film entre t0 et t1, fondus d'entrée / sortie (s) ; tail : déborde après t1"""
    a, b = int(round(t0 * SR)), int(round((t1 + tail) * SR))
    i0 = int(round(s0 * SR)); seg = src[i0:i0 + (b - a)].copy(); b = a + len(seg)
    if fi: k = int(fi * SR); seg[:k] *= np.sin(np.linspace(0, np.pi / 2, k))[:, None]
    if fo: k = int(fo * SR); seg[-k:] *= np.cos(np.linspace(0, np.pi / 2, k))[:, None]
    mus[a:b] += seg
XF = 0.02                              # fondu enchaîné aux coupes (centré sur le premier temps)
put(0, T_TS, OFF1, fi=0.004, fo=0)
# arrêt de bande : la bande ralentit et s'éteint en 0,34 s
ts = int(0.34 * SR); i0 = int(round((T_TS + OFF1) * SR)); tail = src[i0:i0 + ts]
rate = np.linspace(1, 0, ts) ** 1.6; pos = np.cumsum(rate); pos = pos[pos < len(tail) - 1]
stop = np.stack([np.interp(pos, np.arange(len(tail)), tail[:, c]) for c in range(2)], 1) * (np.linspace(1, 0, len(pos)) ** 1.3)[:, None]
a = int(round(T_TS * SR)); mus[a:a + len(stop)] += stop
# « Non. » : la musique revient (étouffée plus bas), même calage
put(T_NON, BT(48), T_NON + OFF1, fi=0.12, fo=0.01)
# souffle inversé sur « Bizarre » : la mesure du logo jouée à l'envers, qui monte jusqu'au logo
L = int(0.9 * SR); i0 = int(round(D(9) * SR)); rv = src[i0:i0 + L][::-1] * (np.linspace(0, 1, L) ** 2.2)[:, None]
swell = np.zeros((N, 2)); a = int(round(T_LOGO * SR)) - L; swell[a:a + L] = bp(rv, 300, 9000) * db(-7)   # ajouté après le filtre
# après le drop : onze mesures, puis un temps d'arrêt et le coup final
SEQ = [(16, 7), (19, 3), (23, 1)]      # (première mesure du morceau, nombre de mesures)
t = T_HOP
for j, (k, n) in enumerate(SEQ):
    t1 = t + 4 * n * BEAT
    if j == 0: put(t - 0.01, t1, D(k) - 0.01, fi=0.003, fo=XF, tail=XF / 2)
    elif j < len(SEQ) - 1: put(t - XF / 2, t1, D(k) - XF / 2, fi=XF, fo=XF, tail=XF / 2)
    else: put(t - XF / 2, t1 - 0.005, D(k) - XF / 2, fi=XF, fo=0.03)
    t = t1
put(T_HIT - 0.01, DUR, D(24) - 0.01, fi=0.003, fo=0)
# mise en scène : étouffée de « Non. » au logo (filtre qui s'ouvre), pleine bande ensuite, traîne finale
dark = curve([(0, 0), (T_NON - 0.01, 0), (T_NON, 1), (T_LOGO - 0.25, 1), (T_LOGO, 0), (DUR, 0)])
lp_lo, lp_hi = bp(mus, None, 650), bp(mus, None, 2600)
openk = curve([(0, 0), (T_NON, 0), (T_LOGO - 0.4, 1), (DUR, 1)])
muff = lp_lo * (1 - openk)[:, None] + lp_hi * openk[:, None]
mus = mus * (1 - dark)[:, None] + muff * dark[:, None]
lvl = curve([(0, db(0)), (T_NON - 0.01, db(0)), (T_NON, db(-5)), (T_LOGO - 0.3, db(-3)), (T_LOGO, db(0)), (T_HOP, db(0.5)), (T_HIT, db(1)),
             (T_HIT + 0.6, db(3)), (DUR - 1.4, db(3)), (DUR - 0.1, db(-9)), (DUR, 0)])      # traîne finale remontée, fondu sur 1,4 s
mus = (mus + swell) * lvl[:, None]
# téléphone : la basse du morceau allégée sous 150 Hz, passe-haut 40 Hz
mlow = bp(mus, None, 150); mus = (mus - mlow) + mlow * db(-6)
mus = bp(mus, 40, None, 2)

# la musique cède la place à la voix (présence et niveau global), sauf sur le drop et le coup final
venv = follow(np.abs(vo), 0.005, 0.03); venv /= np.percentile(venv[venv > 1e-4], 90)
duck = follow(np.clip(venv * 2.5, 0, 1), 0.02, 0.45)
punch = np.zeros(N)
for t0 in (T_HOP, T_HIT, T_LOGO):
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
words = VT['hooks'][HOOK]['mots'] + VT['mots']
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
os.makedirs(A('stems-master60w'), exist_ok=True)
sf.write(A(f'mix-master60w-{HOOK}.wav'), mix, SR, subtype='PCM_24')
g = db(gain)
for name, x in [('voix', vo_st), ('musique', mus_st), ('bruitages', fx)]:
    sf.write(A('stems-master60w', f'{name}-{HOOK}.wav'), x * g, SR, subtype='PCM_24')
nm = (vo_st + fx) * g; nm *= db(-14 - meter.integrated_loudness(nm)); nm = limit(nm, -5.0)
sf.write(A('stems-master60w', f'sans-musique-{HOOK}.wav'), nm, SR, subtype='PCM_24')

# ---------- rapport mesuré ----------
rep = [f'master60w {HOOK} · {meter.integrated_loudness(mix):.1f} LUFS intégrés, true peak {tp(mix):.1f} dBTP',
       f'bruitages posés : {len(kept)} · retirés pour collision : {len(dropped)} (' + ', '.join(f"{c['k']}@{c['t']:.2f}" for c in dropped) + ')']
gaps = gap(mus_st)
rep.append(f'écart voix / musique par phrase : min {min(gaps):.1f} dB, médiane {np.median(gaps):.1f} dB ({len(gaps)} phrases)')
# calage : attaques de la musique mesurées sur la piste musique, aux temps prévus
ons = librosa.onset.onset_detect(y=mus_st.mean(1), sr=SR, hop_length=128, units='time', backtrack=False)
for nm_, t_ in [('drop « Hop ! »', T_HOP), ('logo (pleine bande)', T_LOGO), ('« Ah. » (premier temps)', BT(8)), ('coup final', T_HIT)]:
    o = ons[np.argmin(np.abs(ons - t_))]; rep.append(f'attaque {nm_:24s} prévue {t_:6.2f} s, mesurée {o:6.2f} s ({(o - t_) * 1000:+.0f} ms)')
for a, b, nm_ in [(0, GR['ancre'], 'ouverture'), (GR['ancre'], T_TS, 'annonce'), (T_AH + 0.3, T_NON, 'silence « Ah. »'),
                  (T_NON, T_LOGO, 'étouffée'), (T_LOGO, BT(48), 'logo → onglets'), (BT(48), T_HOP, 'temps d\'arrêt'),
                  (T_HOP, BT(93), 'drop → appeler'), (BT(93), T_HIT, 'arrêt final'), (T_HIT, DUR, 'logo final')]:
    rep.append(f'RMS {nm_:16s} mix {rms(mix[int(a * SR):int(b * SR)]):6.1f}  musique {rms(mus_st[int(a * SR):int(b * SR)] * g):6.1f} dBFS')
open(os.path.join(ROOT, 'docs', f'mix_report-master60w-{HOOK}.txt'), 'w').write('\n'.join(rep) + '\n')
print('\n'.join(rep))
