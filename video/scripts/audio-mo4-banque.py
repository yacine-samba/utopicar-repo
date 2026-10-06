"""Son de MO4 avec une vraie banque de sons : bruitages et musiques Mixkit (licence Mixkit : usage commercial libre,
sans crédit obligatoire), dans audio/bank/. Aucun son généré.
usage : python3 scripts/audio-mo4-banque.py <id_musique> <temps_du_drop_dans_le_morceau> <bpm>
        → audio/mix-mo4.wav + docs/mix_report-mo4.txt
Musique : le morceau est choisi pour sa structure (tension qui monte puis drop, mesurés sur 173 morceaux Mixkit :
énergie avant / après, pente, attaque du drop, énergie dès la première seconde = hook). Il est ramené à 120 BPM et
placé pour que son drop tombe pile sur le pivot de l'image (6,0 s : la fiche se révèle). Avant le pivot : la tension
du morceau, une montée inversée, et 0,1 s de silence qui rend l'impact plus fort. Après : l'élan du morceau.
Bruitages calés sur l'image :
- clics, pops, coches : attaque du son (silence de tête retiré) posée sur l'image où l'action se produit ;
- souffles : le pic d'énergie du son tombe sur le pic de vitesse de la caméra, mesuré sur le rendu (ref-motion.py),
  et sa durée suit celle du mouvement.
Master −14 LUFS, plafond de travail −3,5 dBTP."""
import json, os, sys
import numpy as np, soundfile as sf, librosa, pyloudnorm as pyln
from scipy.signal import resample_poly, butter, sosfilt
from scipy.ndimage import minimum_filter1d, uniform_filter1d
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); B = os.path.join(ROOT, 'audio/bank')
TL = json.load(open(os.path.join(ROOT, 'timeline-mo4.json'))); E = TL['ev']; SR = 48000; DUR = TL['dur']; N = int(DUR * SR)
MID, DROP, BPM = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
PIVOT = 6.0
# pics de mouvement mesurés sur le rendu final (scripts/ref-motion.py) : (pic, début, fin) en secondes
MOVES = [(0.07, 0.0, 0.18), (1.63, 1.53, 1.72), (2.08, 2.0, 2.22), (3.52, 3.42, 3.62), (6.03, 5.95, 6.15), (9.57, 9.45, 9.82),
         (10.10, 10.0, 10.25), (12.12, 12.02, 12.28), (13.30, 13.2, 13.42), (14.57, 14.48, 14.63)]

def load(name):
    x, _ = librosa.load(os.path.join(B, name), sr=SR, mono=False)
    x = np.atleast_2d(x); x = np.vstack([x, x]) if x.shape[0] == 1 else x
    return x.T
def attack(x):                      # retire le silence de tête : l'attaque devient l'échantillon 0
    e = np.abs(x).max(1); i = int(np.argmax(e > e.max() * 0.08)); return x[max(0, i - int(0.002 * SR)):]
def peak(x):                        # position du pic d'énergie (fenêtre 20 ms)
    e = uniform_filter1d(np.abs(x).max(1), int(0.02 * SR)); return int(np.argmax(e))
def put(dst, x, t, g=1.0):
    i = int(round(t * SR))
    if i < 0: x = x[-i:]; i = 0
    j = min(len(dst), i + len(x))
    if j > i: dst[i:j] += x[:j - i] * g
def fadeout(x, d=0.05): n = min(len(x), int(d * SR)); x = x.copy(); x[-n:] *= np.linspace(1, 0, n)[:, None]; return x

# ---------- musique ----------
y, _ = librosa.load(os.path.join(B, f'music-{MID}.mp3'), sr=SR, mono=False)
rate = BPM / 120.0
y = np.vstack([librosa.effects.time_stretch(c, rate=rate) for c in y])
mono = librosa.to_mono(y); on = librosa.onset.onset_strength(y=mono, sr=SR, hop_length=256)
d0 = int(DROP / rate * SR); w = int(0.15 * SR)                                # recale le drop sur l'attaque réelle
k = np.argmax(on[(d0 - w) // 256:(d0 + w) // 256]); drop = (d0 - w) // 256 * 256 + k * 256
start = drop - int(PIVOT * SR)
mus = y[:, start:start + N].T.copy()
g = np.ones(N); a, b = int((PIVOT - 0.12) * SR), int((PIVOT - 0.01) * SR)      # 0,1 s de vide avant l'impact
g[a:b] = 0.12; g = uniform_filter1d(g, int(0.01 * SR)); mus *= g[:, None]
f = int(0.4 * SR); mus[-f:] *= np.linspace(1, 0, f)[:, None] ** 1.5

# ---------- bruitages ----------
sfx = np.zeros((N, 2)); S = lambda i: attack(load(f'sfx-{i}.mp3'))
def whoosh(i, pk, a_, b_, gain):   # pic du souffle sur le pic de vitesse ; longueur bornée au mouvement + traîne
    x = load(f'sfx-{i}.mp3'); p = peak(x); L = int((b_ - a_ + 0.35) * SR)
    x = x[max(0, p - int((pk - a_ + 0.12) * SR)):]; p2 = min(p, int((pk - a_ + 0.12) * SR))
    put(sfx, fadeout(x[:L + p2]), pk - p2 / SR, gain)
W = {0.07: (1492, .55), 1.63: (166, .3), 2.08: (1490, .55), 3.52: (3120, .5), 6.03: (174, .5), 9.57: (2608, .5),
     10.10: (3005, .45), 12.12: (166, .35), 13.30: (166, .25), 14.57: (1490, .5)}
for pk, a_, b_ in MOVES: i, gn = W[pk]; whoosh(i, pk, a_, b_, gn)
put(sfx, S(2909), 0.0, 0.7)                                                   # le point éclate
for t in E['hook']: put(sfx, S(1109), t + 0.03, 0.14)                         # chaque mot
put(sfx, S(2577), E['press'], 0.35)                                           # appui long
put(sfx, S(1120), E['paste'], 0.6)                                            # le doigt touche le champ : collage
put(sfx, S(2573), E['enable'] + 0.02, 0.4)                                    # le bouton s'allume
put(sfx, S(2568), E['tap'], 0.65)                                             # le doigt touche « Analyser ce lien »
for t in E['steps']: put(sfx, S(1107), t + 0.02, 0.45)                        # chaque coche
rev = load('sfx-1486.mp3')[::-1]; rev = rev[-int(1.0 * SR):]                  # montée inversée vers le pivot
put(sfx, rev, PIVOT - 0.12 - len(rev) / SR, 0.45)
put(sfx, S(2901), PIVOT, 1.0)                                                # pivot : la fiche se révèle
put(sfx, S(2357), E['pill'], 0.45); put(sfx, S(914), 6.98, 0.45)              # « Bon prix », 8/10
for t in E['rows']: put(sfx, S(2356), t + 0.02, 0.38)                         # chaque ligne
put(sfx, S(2919), E['pop'], 0.85)                                             # le prix sort de la carte
put(sfx, S(2357), E['affiche'] + 0.02, 0.3)
put(sfx, fadeout(load('sfx-1486.mp3')[::-1][-int(0.45 * SR):]), E['collapse'] - 0.42, 0.4)
put(sfx, S(2350), E['trail'], 0.45); put(sfx, S(869), E['trail'] + 0.35, 0.3)  # la traînée dessine
put(sfx, S(2909), E['fill'], 0.45)                                            # le symbole se remplit
for t in E['slogan']: put(sfx, S(1109), t + 0.03, 0.12)
put(sfx, S(2357), E['kicker'] + 0.02, 0.28); put(sfx, S(2356), E['button'] + 0.02, 0.3)
put(sfx, S(2568), E['tapEnd'], 0.65); put(sfx, S(2580), E['tapEnd'] + 0.06, 0.3)

# ---------- mix : automation de la musique, ducking, dynamique ----------
def autom(keys, n=N):            # courbe par points (temps, valeur), interpolée
    t = np.arange(n) / SR; ts, vs = zip(*keys); return np.interp(t, ts, vs)
def sweep_lp(x, cut):            # passe-bas dont la coupure suit la courbe cut (blocs de 512 échantillons)
    out = np.zeros_like(x); zi = None; B_ = 512
    for i in range(0, len(x), B_):
        c = float(np.clip(cut[i], 120, 19000)); sos = butter(2, c, 'low', fs=SR, output='sos')
        if zi is None: zi = np.zeros((sos.shape[0], 2, x.shape[1]))
        out[i:i + B_], zi = sosfilt(sos, x[i:i + B_], axis=0, zi=zi)
    return out
P = PIVOT
# tension : musique étouffée qui s'ouvre peu à peu ; vide avant le pivot ; pleine sur l'élan ;
# creux avant le prix puis retour ; respiration pendant la traînée (les bruitages passent devant) ; retour sur le symbole
cut = autom([(0, 900), (2.0, 1400), (3.5, 2400), (5.5, 6000), (5.85, 9000), (P, 19000), (9.3, 19000), (9.95, 2500),
             (10.0, 19000), (10.9, 19000), (11.1, 700), (11.9, 1800), (11.98, 19000), (14.3, 19000), (15, 1500)])
gain_db = autom([(0, -7), (1.9, -6), (2.1, -8), (3.4, -6), (5.6, -3), (5.86, -2), (5.88, -40), (5.99, -40), (P, 0), (9.3, -1),
                 (9.95, -7), (10.0, 0), (10.85, -1), (11.05, -13), (11.9, -9), (11.98, 0), (14.4, -1), (15, -30)])
m = sweep_lp(mus, cut) * (10 ** (gain_db / 20))[:, None]
# ducking : la musique s'efface sous chaque bruitage (attaque 5 ms, relâchement 180 ms, jusqu'à −6 dB)
env_ = uniform_filter1d(np.abs(sfx).max(1), int(0.01 * SR)); env_ = env_ / (env_.max() + 1e-9)
g = np.zeros(N); a_, r_ = np.exp(-1 / (0.005 * SR)), np.exp(-1 / (0.18 * SR)); y_ = 0.0
for i in range(N): x_ = env_[i]; k_ = a_ if x_ > y_ else r_; y_ = k_ * y_ + (1 - k_) * x_; g[i] = y_
m *= (10 ** (-6 * np.clip(g * 1.6, 0, 1) / 20))[:, None]
musg = 0 if os.environ.get('SANS_MUSIQUE') else float(os.environ.get('MUS_GAIN', 1.0))
mix = m * musg + sfx * 0.8
mix = sosfilt(butter(4, 70, 'high', fs=SR, output='sos'), mix, axis=0)
meter = pyln.Meter(SR); tp = lambda x: 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12); L = int(0.005 * SR)
for _ in range(12):
    mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
    if tp(mix) <= -3.5: break
    pk = np.abs(mix).max(1); gr = np.minimum(1, 10 ** (-4.2 / 20) / np.maximum(pk, 1e-9))
    mix *= uniform_filter1d(minimum_filter1d(gr, L * 2 + 1), L)[:, None]
sf.write(os.path.join(ROOT, 'audio/mix-mo4.wav'), mix, SR, subtype='PCM_24')
pre = meter.integrated_loudness(mix[int(1 * SR):int(5.8 * SR)]); post = meter.integrated_loudness(mix[int(6 * SR):int(11 * SR)])
rep = (f'MO4 banque Mixkit (musique {MID}, {BPM:.0f} → 120 BPM, drop du morceau sur {PIVOT} s) : '
       f'{meter.integrated_loudness(mix):.1f} LUFS · true peak {tp(mix):.1f} dBTP · tension {pre:.1f} LUFS → élan {post:.1f} LUFS · '
       f'première seconde {meter.integrated_loudness(mix[:SR + SR // 2]):.1f} LUFS\n')
open(os.path.join(ROOT, 'docs/mix_report-mo4.txt'), 'w').write(rep); print(rep, end='')
