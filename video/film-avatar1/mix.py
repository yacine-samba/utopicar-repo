"""Mix de film-avatar1 → audio/mix-avatar1.wav (48 kHz stéréo, −14 LUFS, plafond de travail −3,5 dBTP).
Voix devant ; musique (Mixkit 614, à partir de 48 s) filtrée pour le téléphone, qui s'efface sous la voix ;
le scratch coupe la musique (le soupir « Ouais… les frais » tombe dans le silence), elle revient sur « Maintenant ».
Bruitages Mixkit (audio/sfx-lib) calés sur les apparitions de film.js (temps tirés de words.json)."""
import json, os, subprocess
import numpy as np, pyloudnorm as pyln, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

V = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SR = 48000
TL = json.load(open(os.path.join(V, 'timeline-avatar1.json'), encoding='utf-8'))
N = int(TL['dur'] * SR)
W = json.load(open(os.path.join(V, 'film-avatar1', 'words.json'), encoding='utf-8'))['words']
def at(word, n=1):
    k = 0
    for w, a, b in W:
        if w.lstrip("'").startswith(word):
            k += 1
            if k == n: return a
    raise KeyError(word)

def load(p, start=0.0, dur=None):
    args = ['ffmpeg', '-v', 'error', '-ss', str(start), '-i', os.path.join(V, p)] + (['-t', str(dur)] if dur else []) + ['-f', 'f32le', '-ac', '1', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, dtype=np.float32).copy()
def db(x): return 10 ** (x / 20)
def place(buf, x, t, g):
    i = int(t * SR); j = min(len(buf), i + len(x)); buf[i:j] += x[:j - i] * g

# ---------- voix : légère présence 2-5 kHz, coupe-bas 80 Hz ----------
vo = np.zeros(N, np.float32); place(vo, load('audio/vo-avatar1.wav'), 0.0, 1.0)
vo = sosfilt(butter(2, 80, 'hp', fs=SR, output='sos'), vo)
pres = sosfilt(butter(2, [2000, 5000], 'bp', fs=SR, output='sos'), vo); vo = vo + 0.18 * pres

# ---------- musique : coupe-bas 140 Hz (le téléphone ne rend pas le sub), coupée par le scratch ----------
mu = load('audio/bank/music-614.mp3', 48.0, TL['dur'] + 1)[:N]
mu = np.pad(mu, (0, N - len(mu)))
mu = sosfilt(butter(2, 140, 'hp', fs=SR, output='sos'), mu)
t = np.arange(N) / SR
T_SCR, T_BACK = 5.36, at('Maintenant') - 0.25
gate = np.clip((T_SCR + 0.08 - t) / 0.08, 0, 1) + np.clip((t - T_BACK) / 0.6, 0, 1)   # coupe nette, retour en 0,6 s
gate *= np.clip(t / 0.05, 0, 1) * np.clip((TL['dur'] - t) / 0.9, 0, 1)
# effacement sous la voix (attaque 40 ms, relâche 300 ms) : −7 dB quand la voix parle
env = np.sqrt(np.convolve(vo ** 2, np.ones(int(0.03 * SR)) / int(0.03 * SR), 'same'))
act = np.clip((20 * np.log10(env + 1e-9) + 48) / 12, 0, 1)
duck = np.empty_like(act); g = 0.0
a_up, a_dn = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (0.30 * SR))
for i, v in enumerate(act):
    g = v + (g - v) * (a_up if v > g else a_dn); duck[i] = g
mu = mu * gate * db(-7 * duck)

# ---------- bruitages ----------
fx = np.zeros(N, np.float32)
S = lambda n: load(f'audio/sfx-lib/{n}.wav')
place(fx, S('scratch'), T_SCR, db(-9))
for k, tc in enumerate([5.95, 6.4, 6.85, 7.3]):                       # étiquettes de frais
    p = S('ping'); p = resample_poly(p, 100, 100 + 6 * k)               # chaque ping un peu plus aigu
    place(fx, p, tc, db(-20))
place(fx, S('whoosh'), 13.30, db(-17))                                  # bouton « Analyser le dossier »
tp = at('colle'); place(fx, S('paste'), tp - 0.02, db(-12)); place(fx, S('click'), tp + 0.02, db(-13))
place(fx, S('slide'), tp + 0.48, db(-17))                               # ce que l'outil a lu
place(fx, S('whoosh'), at('Je', 1) + 0.03, db(-17))                     # « Il vous reste »
place(fx, S('slide'), at('avant', 2) - 0.02, db(-17))                   # « Ne dépassez pas »
place(fx, S('whoosh'), at('Pas') - 0.06, db(-11))                       # « Pas après. »
place(fx, S('click'), at('débutant') - 0.03, db(-11)); place(fx, S('click'), at('ou') - 0.02, db(-14))

# ---------- bus, niveaux, master ----------
mix = vo * 1.0 + mu * db(-15) + fx
meter = pyln.Meter(SR)
mix = mix * db(-14 - meter.integrated_loudness(mix))
def tpeak(x):
    return 20 * np.log10(np.max(np.abs(resample_poly(x, 4, 1))) + 1e-12)
# limiteur doux simple : on comprime au-dessus de −6 dBFS, puis on vérifie le true peak (4× suréchantillonné)
for _ in range(12):
    p = tpeak(mix)
    if p <= -3.5: break
    thr = db(-8); a = np.abs(mix); over = a > thr
    mix[over] = np.sign(mix[over]) * (thr + (a[over] - thr) * 0.25)
    mix = mix * db(-14 - meter.integrated_loudness(mix))
st = np.stack([mix, mix], 1).astype(np.float32)
st = st * db(-14 - meter.integrated_loudness(st))          # mesure sur la stéréo réelle (mono dupliqué = +3 dB)
sf.write(os.path.join(V, 'audio', 'mix-avatar1.wav'), st, SR, subtype='PCM_24')
nm = np.stack([vo + fx] * 2, 1).astype(np.float32); sf.write(os.path.join(V, 'audio', 'mix-avatar1-sans-musique.wav'), nm * db(-14 - meter.integrated_loudness(nm)), SR, subtype='PCM_24')
print(f'mix : {meter.integrated_loudness(st):.1f} LUFS (stéréo), true peak {tpeak(st[:, 0]):.1f} dBTP, {len(mix) / SR:.2f} s')
print('scratch', T_SCR, '· retour musique', round(T_BACK, 2), '· colle', tp, '· Pas', at('Pas'))
