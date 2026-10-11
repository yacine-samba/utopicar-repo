"""MO9 « 974 € » : voix et musique mixées (méthode .claude/skills/motion-studio/references/sound-design.md).

Voix   : audio/vo-mo9/vo-placed.wav (Simon, prise A, répliques posées sur le film par scripts/vo-mo9.py)
Musique: audio/music/Controlled Drop.mp3, recalée à 120 BPM, comme MO5 : mesure 13 dès l'image 0, la musique garde sa
         basse et monte quand ça sonne, arrêt net à l'arrivée du kebab, silence (tampon, rire, chute), bande qui
         rembobine, remontée à l'envers puis mesure 55 sur « Tout s'est joué ».
         Grille de la première partie calée pour que « 974 » tombe sur un temps ; la reprise (mesure 55) repart de son
         premier temps sur « Tout s'est joué ». Tous les temps viennent de audio/vo-mo9/vo-timing.json.
Bruits : audio/bank/mo5 et mo6 (Mixkit, licence libre), repérés sur l'image (film-mo9/events.json), un son principal
         à la fois ; moteur et vibration fabriqués comme dans MO5.
Sortie : audio/mix-mo9.wav (lu par render.mjs), audio/stems-mo9/{voix,musique,bruitages,sans-musique}.wav,
         docs/mix_report-mo9.txt
"""
import os, json
import numpy as np, librosa, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
from scipy.ndimage import minimum_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
VT = __import__('json').load(open(A('vo-mo9', 'vo-timing.json')))
DUR = VT['dur']
N = int(DUR * SR)
mk = lambda k: VT['marks'][k]['t']; mke = lambda k: VT['marks'][k]['end']
T_BIG = mk('n974') - 0.06                  # « 974 € » à l'écran (film-mo9/film.js, T.big)
OFF = T_BIG % 0.5                          # premier temps de la grille : « 974 » tombe sur un temps
T_STOP = mke('euros') + 0.08               # le kebab arrive : la musique s'arrête net
T_BACK = mk('tout') + 0.05                 # « Tout s'est joué » : mesure 55, son premier temps sur la voix

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
vo = load(A('vo-mo9', 'vo-placed.wav'))[:N]
vo = np.pad(vo, (0, N - len(vo)))
vo = bp(vo, 80, 14000)
lines = [l for l in VT['lines'] if l['key'] != 'rire']
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
REW = (VT['marks']['prevu2']['end'] + 0.3, VT['marks']['prevu2']['end'] + 1.1)
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
# mise en scène : attaque à l'image 0, la musique monte quand ça sonne (elle garde sa basse), fondu de boucle
t_s = mk('sonne')
lvl = env_curve([(0, db(-1)), (t_s - 0.6, db(-1)), (T_BIG, db(0.5)), (T_STOP, db(0.5)), (T_BACK, db(0)), (DUR - 0.4, db(0)), (DUR, db(-3))])
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

# ---------- bruitages (repérés sur l'image : film-mo9/events.json, écrit par scripts/events.mjs) ----------
EV = json.load(open(os.path.join(ROOT, 'film-mo9', 'events.json')))
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
# ouverture : « 5 600 » s'écrit à la lumière, le virement se pose (sans choc), le ✓ se trace
cue(E_['b3900'] + 0.25, 2589, 'orn', 2, dur=0.9, gain=-3)                    # le point de lumière descend la flèche
cue(E_['w2'], 3005, 'orn', 2, dur=0.7, pan=0.1)                               # « 5 600 » s'écrit
cue(E_['notif'], 1490, 'whoosh', 2, dur=0.5, pan=0.45, lead=0.12)             # le virement arrive de la droite
cue(E_['notif'] + 0.04, 2354, 'ui', 1, st=2, pan=0.2, gain=-2)                # il se pose : une note, pas d'impact
cue(E_['chk'], 2589, 'orn', 2, st=5, dur=0.6, pan=-0.1)                       # le ✓ se trace
cue(E_['chk'] + 0.38, 1107, 'chime', 2, st=2)                                 # … et valide
cue(E_['ok2'], 2369, 'orn', 3, dur=0.6, gain=-4)                              # « d'accord. »
# jour 0
cue(E_['out'], 3120, 'whoosh', 2, dur=0.7, lead=0.08)                         # le calcul se replie
for k in range(5): cue(E_['j0'] + k * 0.07 + 0.12, 1119, 'tick', 3, pan=-0.35 + 0.17 * k)   # palettes JOUR 0
for k in range(5): cue(E_['ads'] + k * 0.2, 1384, 'tick', 3, st=2 * k, pan=-0.3 + 0.15 * k, gain=4)   # une note par annonce, qui monte
cue(E_['ring'], 2589, 'orn', 3, st=4, dur=0.5)                                # la médiane cerclée
cue(E_['card'], 1490, 'whoosh', 3, st=-2, dur=0.4, gain=-4, lead=0.08)        # la carte de la formule
for k in range(3): cue(E_['rows'] + k * 0.38, 2384, 'ui', 2, st=2 * k, gain=-5)   # les chiffres claquent
cue(E_['bar'], 2589, 'orn', 3, dur=0.5, gain=-2)                              # le trait de total
cue(E_['max'], 2909, 'accent', 1, dur=1.0, gain=-3)                           # « prix max 3 900 € », éclair
cue(E_['max'] + 0.02, 1107, 'chime', 1, st=5, gain=-3)                        # même geste que l'éclair : même priorité
# la visite
cue(E_['car'] - 0.05, 1492, 'whoosh', 2, dur=0.8, pan=0.4, lead=0.1)          # la Clio entre (le moteur : plus bas)
cue(E_['contour'], 2589, 'orn', 3, dur=0.8, pan=-0.1)                         # le contour se trace
for k, (lab, px) in enumerate([('Pneus lisses', 0.25), ('Phares jaunis', -0.25), ('Rayure', 0.15)]):
    cue(E_['pins'][lab], 1384, 'tick', 2, st=5 + 2 * k, pan=px, gain=6)       # trois pointes de lumière
cue(E_['strike'], 3005, 'orn', 2, st=-3, dur=0.5)                             # « 4 400 » barré
cue(E_['annN'], 2384, 'ui', 2, st=4, gain=-3)                                 # « 3 900 € »
cue(E_['hud'] + 0.1, 1054, 'tick', 2, dur=0.4, gain=6)                        # rouleaux qui s'enclenchent
for k in range(4): cue(E_['hud'] + k * 0.07, 1384, 'tick', 3, st=k, pan=-0.2 + 0.13 * k)
# les frais tombent, tous prévus : une note par débit, qui monte ; le tampon colle
for k, x in enumerate(E_['deb']):
    cue(x, 2354, 'ui', 1, st=k, pan=0.35)
    cue(x - 0.02, 1490, 'whoosh', 3, dur=0.35, pan=0.5, gain=-4, lead=0.1)
    cue(x + 0.22, 2380, 'tick', 3, dur=0.35, gain=5, st=k)                    # « prévu ✓ »
for k, x in enumerate(E_['deb'][4:]):
    cue(x + 0.13, 2646, 'tool', 2, st=2 * k, dur=0.6, start=1.0 + k, pan=-0.2 + 0.2 * k, gain=-2)   # le trait de lumière polit
cue(E_['deb'][6] + 0.3, 951, 'chime', 2, st=2, gain=-4)                       # la voiture brille
# ça sonne : le jour, les palettes, le téléphone
cue(E_['sonne'] - 0.3, 1492, 'whoosh', 2, dur=0.9, st=3, lead=0.1)            # plein jour
for k in range(3): cue(E_['sonne'] - 0.13 + k * 0.07 + 0.12, 1119, 'tick', 3, pan=-0.2 + 0.2 * k)
for k, x in enumerate(E_['tm'][::2]): cue(x, 2354, 'ui', 3, st=7 + k, pan=0.3 - 0.1 * (k % 2), gain=-9)   # un message sur deux
for x in E_['late'][:3]: cue(x + 0.1, 2380, 'tick', 3, dur=0.3, gain=2, pan=0.3)   # option, essence, assurance : prévues
# la vente
cue(E_['bubble'], 2354, 'ui', 1, st=4, pan=-0.2, gain=-2)                     # l'offre
cue(E_['reply'], 2384, 'ui', 2, st=7, pan=0.3, gain=-3)                       # « D'accord. »
cue(E_['credit'], 1490, 'whoosh', 2, dur=0.5, pan=0.45, lead=0.12)
cue(E_['credit'] + 0.04, 951, 'chime', 1, pan=0.2)                            # virement reçu
cue(E_['roll'], 1054, 'tick', 2, dur=0.55, gain=6)                            # 1 000 → 974
cue(E_['big'], 2909, 'accent', 1, dur=1.1, gain=-2)                                    # « 974 € »
cue(E_['big'] + 0.06, 1107, 'chime', 1, st=7, gain=-2)
# le kebab, seul dans le silence
cue(E_['keb'], 1490, 'whoosh', 3, dur=0.35, pan=0.45, gain=-6, lead=0.1)
cue(E_['keb'] + 0.03, 2354, 'ui', 1, st=9, pan=0.3)                           # le gag : la note la plus haute
cue(E_['stamp9'], 2380, 'tick', 1, dur=0.4, gain=10)                          # le tampon, seul
cue(E_['pk1'], 2369, 'orn', 2, dur=0.8, gain=-2)                              # « Même le kebab » s'écrit
# rembobinage, les trois décisions, la boucle
cue(E_['rew'][0], 1092, 'accent', 1, dur=1.45, gain=-6)
cue(E_['tout'] - 0.05, 3120, 'whoosh', 2, dur=0.7, lead=0.08)
cue(E_['jour0b'], 2589, 'orn', 3, dur=0.7, gain=-2)
for k, x in enumerate(E_['td']): cue(x, 2369, 'orn', 2, st=2 * k, dur=0.45, gain=-3)   # une note par carte, qui monte
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

# moteur de la Clio : régime qui monte à l'entrée, redescend au freinage, de la droite vers le centre (méthode MO5)
y = load(A('bank', 'mo5', 'sfx-1538.mp3'))
def varrate(seg, r0, r1):
    L_ = int(len(seg) / ((r0 + r1) / 2)); p = np.cumsum(np.linspace(r0, r1, L_)); p = p[p < len(seg) - 1]
    i = np.floor(p).astype(int); f = p - i; return seg[i] * (1 - f) + seg[i + 1] * f
ea = varrate(y[int(0.15 * SR):int(1.2 * SR)], 0.95, 1.35); eb = varrate(y[int(1.2 * SR):int(2.7 * SR)], 1.15, 0.85)
xf = int(0.04 * SR)
eng = np.concatenate([ea[:-xf], ea[-xf:] * np.linspace(1, 0, xf) + eb[:xf] * np.linspace(0, 1, xf), eb[xf:]])
eng = librosa.effects.pitch_shift(eng, sr=SR, n_steps=3)
eng = bp(eng, 150, 9000); e = np.ones(len(eng)); e[:int(0.25 * SR)] = np.linspace(0, 1, int(0.25 * SR)) ** 1.5; e[-int(0.6 * SR):] = np.linspace(1, 0, int(0.6 * SR)) ** 1.2
eng = eng * e / np.abs(eng).max() * db(ROLE['engine'][0] - 2)
fr = librosa.util.frame(np.pad(eng, (0, 2048)), frame_length=2048, hop_length=512)
ipk = int(np.argmax(np.abs(fr).max(0))) * 512
s0 = int((E_['car'] + 0.45) * SR) - ipk; seg = eng[max(0, -s0):]; s0 = max(0, s0); seg = seg[:N - s0]   # pic au freinage
tt = (np.arange(len(seg)) + s0) / SR; pan = np.interp(tt, [E_['car'], E_['car'] + 0.9], [0.85, 0.0])
fx[s0:s0 + len(seg), 0] += seg * np.cos((pan + 1) * np.pi / 4); fx[s0:s0 + len(seg), 1] += seg * np.sin((pan + 1) * np.pi / 4)
# le téléphone vibre sans arrêt quand ça sonne : bourdonnement court, trois fois
tv = np.arange(int(0.6 * SR)) / SR
buzz = np.sin(2 * np.pi * 165 * tv) * (np.sin(2 * np.pi * 24 * tv) > 0) * ((tv < 0.22) | (tv > 0.34))
buzz = bp(buzz, 120, 3000) * db(-16) * np.minimum(1, np.minimum(tv, 0.6 - tv) / 0.01)
for x in [E_['sonne'] + 0.02, E_['sonne'] + 0.42]:
    i = int(x * SR); fx[i:i + len(buzz), 0] += buzz * 0.8; fx[i:i + len(buzz), 1] += buzz

# les bruitages cèdent aussi à la voix (−7 dB pendant qu'elle parle) : « 3 900 », « ça sonne », « 974 » restent devant
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
os.makedirs(A('stems-mo9'), exist_ok=True)
sf.write(A('mix-mo9.wav'), mix, SR, subtype='PCM_24')
g = db(gain_total)
for name, x in [('voix', vo_st), ('musique', mus_st), ('bruitages', fx)]: sf.write(A('stems-mo9', f'{name}.wav'), x * g, SR, subtype='PCM_24')
# version sans musique (voix + bruitages) pour juger le sound design nu
nm = (vo_st + fx) * g; nm *= db(-14 - meter.integrated_loudness(nm)); nm = limit(nm, -5.0)
sf.write(A('stems-mo9', 'sans-musique.wav'), nm, SR, subtype='PCM_24')
Lm = meter.integrated_loudness(mix); up = librosa.resample(mix.T, orig_sr=SR, target_sr=4 * SR).T
rep = [f'MO9 · mix : {Lm:.1f} LUFS intégrés, true peak {20*np.log10(np.abs(up).max()):.1f} dBTP',
       f'bruitages placés : {len(kept)} · retirés pour collision : {len(dropped)} ' + ', '.join(f"{c['i']}@{c['t']:.2f}" for c in dropped)]
Lk = {l['key']: l for l in VT['lines']}
for a_, b_, nm in [(0, Lk['ok']['end'], 'ouverture'), (Lk['j0']['t'], Lk['acc']['end'], 'jour 0'), (Lk['frais']['t'], Lk['frais']['end'], 'frais'),
                   (Lk['sonne']['t'], T_BIG, 'ça sonne'), (T_BIG, Lk['keb']['end'], '974'), (T_BACK, VT['loop'], 'décisions')]:
    seg = mix[int(a_ * SR):int(b_ * SR)]; rep.append(f'RMS {nm:10s} {20*np.log10(np.sqrt((seg**2).mean())+1e-9):6.1f} dBFS')
open(os.path.join(ROOT, 'docs', 'mix_report-mo9.txt'), 'w').write('\n'.join(rep) + '\n')
print('\n'.join(rep))
