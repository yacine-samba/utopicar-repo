"""MO9 « 974 € » : voix et musique mixées (méthode .claude/skills/motion-studio/references/sound-design.md).

Voix   : audio/vo-mo9/vo-placed.wav (Simon, prise A, répliques posées sur le film par scripts/vo-mo9.py)
Musique: audio/music/Controlled Drop.mp3, recalée à 120 BPM, comme MO5 : mesure 13 dès l'image 0, la musique garde sa
         basse et monte quand ça sonne, arrêt net à l'arrivée du kebab, silence (tampon, rire, chute), bande qui
         rembobine, remontée à l'envers puis mesure 55 sur « Tout s'est joué ».
         Grille de la première partie calée pour que « 974 » tombe sur un temps ; la reprise (mesure 55) repart de son
         premier temps sur « Tout s'est joué ». Tous les temps viennent de audio/vo-mo9/vo-timing.json.
Bruits : étape 5 (pas encore placés : cette version sert à valider la voix).
Sortie : audio/mix-mo9.wav (lu par render.mjs), audio/stems-mo9/{voix,musique}.wav, docs/mix_report-mo9.txt
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

# ---------- somme, compression douce, loudness ----------
# téléphone : la basse de la musique allégée sous 150 Hz (un haut-parleur de téléphone ne la rend pas)
mlow = bp(mus, None, 150); mus = (mus - mlow) + mlow * db(-9)
mus = bp(mus, 45, None, 2)
mus_st = np.stack([mus, mus], 1) * db(-6)
# voix : présence 2–5 kHz légèrement remontée
vo = vo + bp(vo, 2000, 5000, 2) * (db(3) - 1)
vo_st = np.stack([vo, vo], 1)
vo_st = vo_st / (np.abs(vo_st).max() + 1e-9) * db(-3)
mix = vo_st + mus_st
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
for name, x in [('voix', vo_st), ('musique', mus_st)]: sf.write(A('stems-mo9', f'{name}.wav'), x * g, SR, subtype='PCM_24')
Lm = meter.integrated_loudness(mix); up = librosa.resample(mix.T, orig_sr=SR, target_sr=4 * SR).T
rep = [f'MO9 · mix voix + musique (bruitages à l\'étape 5) : {Lm:.1f} LUFS intégrés, true peak {20*np.log10(np.abs(up).max()):.1f} dBTP']
Lk = {l['key']: l for l in VT['lines']}
for a_, b_, nm in [(0, Lk['ok']['end'], 'ouverture'), (Lk['j0']['t'], Lk['acc']['end'], 'jour 0'), (Lk['frais']['t'], Lk['frais']['end'], 'frais'),
                   (Lk['sonne']['t'], T_BIG, 'ça sonne'), (T_BIG, Lk['keb']['end'], '974'), (T_BACK, VT['loop'], 'décisions')]:
    seg = mix[int(a_ * SR):int(b_ * SR)]; rep.append(f'RMS {nm:10s} {20*np.log10(np.sqrt((seg**2).mean())+1e-9):6.1f} dBFS')
open(os.path.join(ROOT, 'docs', 'mix_report-mo9.txt'), 'w').write('\n'.join(rep) + '\n')
print('\n'.join(rep))
