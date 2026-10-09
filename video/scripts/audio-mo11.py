"""MO11 « La préparation » : voix, musique et bruitages mixés (méthode .claude/skills/motion-studio/references/sound-design.md,
modèle scripts/audio-mo9.py).

Voix   : audio/vo-mo11/vo-placed.wav (Simon, posée par scripts/vo-mo11.py ; tant que ElevenLabs reste bloqué, une piste
         muette au minutage provisoire). HOOK=B : audio/vo-mo11/vo-placed-B.wav → audio/mix-mo11-B.wav.
Musique: audio/music/Controlled Drop.mp3, les passages de MO5 et MO9 (la chute de la mesure 13 à l'image 0, la reprise
         de la mesure 55), ramenés à 120 BPM. Mesuré le 9 octobre 2026 sur le fichier : le morceau est à 124,0 BPM et non
         123,05 (peigne de temps sur les attaques : score 5,5 à 124,0 contre 1,9 à 123,05 ; 169,0 temps exacts entre les
         deux chutes), et ses deux chutes (la basse revient) tombent à 25,805 s et 107,572 s du fichier. On étire donc
         de 120/124 et on cale sur ces chutes elles-mêmes, et non plus sur des positions de mesure calculées à
         123,05 BPM (qui mettaient la chute 0,46 s après l'image 0 et la reprise 0,31 s après son « premier temps »).
         Première partie : le passage de la chute, placé pour que « + 400 € » tombe un nombre entier de mesures après
         elle (la chute tombe entre 1,5 s avant et 0,5 s après l'image 0 : la musique vit déjà à l'image 0) ; ses
         mesures sans basse sont remplacées par des mesures pleines de même harmonie (SWAP).
         Dynamique : élan pendant les six coups ; la musique se resserre (passe-bas) quand le soleil commence à
         baisser et s'ouvre jusqu'au déclic de la photo 1 (la basse reste) ; elle monte un peu sur la vente ; arrêt de
         bande sur « + 400 € » (la seule pause), silence sous « Ton samedi le mieux payé. », bande qui rembobine,
         souffle inversé, reprise sur le premier temps de la méthode (« Ceux qui gagnent… ») ; fondu de boucle.
Instants : film-mo11/events.json (écrit par CUT=mo11 node scripts/events.mjs) et audio/vo-mo11/vo-timing.json, jamais
         recopiés ici : le script se relance tel quel quand la prise de Simon remplace le minutage provisoire.
Bruits : Mixkit (licence libre) : audio/bank/mo5, mo6, mo8, puis mo11 (SOURCES.tsv). Un son par geste, un seul son
         principal à la fois ; vibration du téléphone fabriquée (méthode de MO9).
Sortie : audio/mix-mo11.wav (lu par render.mjs), audio/stems-mo11/{voix,musique,bruitages,sans-musique}.wav,
         docs/mix_report-mo11.txt
"""
import os, json
import numpy as np, librosa, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.ndimage import minimum_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
FPS = json.load(open(os.path.join(ROOT, 'timeline-mo11.json')))['fps']
VT = json.load(open(A('vo-mo11', 'vo-timing.json')))
EV = json.load(open(os.path.join(ROOT, 'film-mo11', 'events.json')))
HOOK = os.environ.get('HOOK', 'A').upper()
TAG = '' if HOOK == 'A' else '-B'
DUR = VT['dur']
N = int(round(DUR * SR))
mk = lambda k: VT['marks'][k]['t']
if abs(EV['dur'] - DUR) > 1e-3:
    raise SystemExit(f"film-mo11/events.json ({EV['dur']} s) ne suit pas vo-timing.json ({DUR} s) : relancer CUT=mo11 node scripts/events.mjs")

T_BIG = EV['big']                          # « + 400 € » à l'écran (film-mo11/film.js, T.big)
T_STOP = T_BIG                             # l'arrêt de bande part sur l'image du chiffre
# la chute de la mesure 13 (premier temps de sa mesure) tombe à OFF, entre −1,5 et 0,5 s, un nombre entier de mesures
# avant « + 400 € » : le chiffre final tombe sur un premier temps (video/CLAUDE.md : les grands moments sur les
# downbeats) et la musique vit déjà pleinement à l'image 0 (au plus 0,5 s de la cassure qui précède la chute)
OFF = (T_BIG + 1.5) % 2.0 - 1.5
T_BACK = mk('ceux') + 0.03                 # « Ceux qui gagnent » : la reprise, son premier temps sur la voix
REW = tuple(EV['rew'])                     # le rembobinage du film
COUPS = {c['key']: c for c in EV['coups']}
LAST_IMP = min(EV['imp'][-1], EV['sun0'] - 0.15)   # dernière impulsion du compteur : fin de l'élan (avant le soleil)

def load(path, sr=SR, mono=True):
    y, _ = librosa.load(path, sr=sr, mono=mono)
    return y

def db(x): return 10 ** (x / 20)

def bp(y, lo=None, hi=None, order=4):
    if lo: y = sosfilt(butter(order, lo, 'hp', fs=SR, output='sos'), y)
    if hi: y = sosfilt(butter(order, hi, 'lp', fs=SR, output='sos'), y)
    return y

# Séparation en bandes par filtres de Linkwitz-Riley d'ordre 4 (copiés de scripts/audio-mo12.py) : le grave et l'aigu
# restent en phase et leur somme est plate, donc une bande baissée l'est vraiment. La soustraction « x − passe-bas(x) »
# laissait passer la basse à cause du retard de phase (round 1, mesuré : − 1,0 dB à 60 Hz et + 3,3 dB à 150 Hz au lieu
# de − 9 dB ; 65 % de l'énergie du mix sous 150 Hz).
def lr4(x, fc):
    lo = butter(2, fc, 'lowpass', fs=SR, output='sos'); hi = butter(2, fc, 'highpass', fs=SR, output='sos')
    return sosfilt(np.vstack([lo, lo]), x), sosfilt(np.vstack([hi, hi]), x)
def shelf(x, fc, g_lo=1.0, g_hi=1.0):
    """Gains (constants ou courbes) sous et au-dessus de fc."""
    lo, hi = lr4(x, fc)
    return lo * g_lo + hi * g_hi

def env_curve(points, n=N):
    t = np.arange(n) / SR
    xs, ys = zip(*points)
    if any(b_ <= a_ for a_, b_ in zip(xs, xs[1:])):
        raise SystemExit(f'courbe d\'automation non croissante : {[round(x, 2) for x in xs]}')
    return np.interp(t, xs, ys)

def lp_sweep(x, fc, block=256):
    # passe-bas d'ordre 2 dont la coupure suit fc (Hz, par échantillon), état conservé d'un bloc à l'autre
    out = np.empty_like(x); zi = np.zeros((1, 2))
    for i in range(0, len(x), block):
        sos = butter(2, min(float(fc[i]), 20000.0), 'lp', fs=SR, output='sos')
        out[i:i + block], zi = sosfilt(sos, x[i:i + block], zi=zi)
    return out

# ---------- voix ----------
vo_file = A('vo-mo11', 'vo-placed.wav' if HOOK == 'A' else 'vo-placed-B.wav')
if not os.path.exists(vo_file):
    raise SystemExit(f'{vo_file} manque : HOOK=B demande la prise posée par scripts/vo-mo11.py')
vo = load(vo_file)[:N]
vo = np.pad(vo, (0, N - len(vo)))
vo = bp(vo, 80, 14000)
lines = [l for l in VT['lines'] if l['end'] - l['t'] > 0.05]          # une réplique coupée (COUPE) garde ses repères, sans durée
if HOOK == 'B' and 'hookB' in VT:
    hb = VT['hookB']; lines = [l for l in lines if l['t'] >= hb['end']] + [dict(key='hookB', t=hb['t'], end=hb['end'])]
# chaque réplique ramenée au même niveau (± 6 dB max) : la voix ne disparaît jamais
rm = lambda x: np.sqrt((x ** 2).mean() + 1e-12)
lv = [rm(vo[int(l['t'] * SR):int(l['end'] * SR)]) for l in lines]; ref = np.median(lv)
for l, r_ in zip(lines, lv):
    a_, b_ = int((l['t'] - 0.03) * SR), int((l['end'] + 0.05) * SR)
    vo[a_:b_] *= np.clip(ref / r_, db(-6), db(6))
VOICED = np.abs(vo).max() > 1e-4                                       # faux tant que la voix provisoire est muette

# ---------- musique ----------
src = load(A('music', 'Controlled Drop.mp3'))
BPM_SRC = 124.0
RATE = 120 / BPM_SRC                        # 1 temps = 0,500 s, 1 mesure = 2,000 s
DROP_A, DROP_B = 25.805, 107.572            # attaques des deux chutes dans le fichier (pleine bande, −10 dB du maximum local)

def stretched(anchor, before, after):
    # étire autour d'une attaque du fichier : l'attaque tombe à `before` secondes dans le résultat (marge de 0,3 s de
    # chaque côté pour que les bords de la fenêtre d'analyse ne touchent pas la partie gardée)
    a = anchor - (before + 0.3) * RATE; b = anchor + (after + 0.3) * RATE
    y = librosa.effects.time_stretch(src[int(a * SR):int(b * SR)], rate=RATE)
    i0 = int(round(0.3 * SR))
    return y[i0:i0 + int((before + after) * SR)]

m1 = stretched(DROP_A, OFF, T_STOP + 1.0 - OFF)                  # la chute de la mesure 13 à t = OFF
# Le passage de la mesure 13 n'est pas égal (mesuré mesure par mesure depuis la chute, comptées de 0) : la 4 est une
# cassure sans basse (−63 dB sous 150 Hz sur trois temps), la 3 s'y éteint sur ses deux derniers temps, la 7 n'a
# presque plus de basse (−24 à −34 dB), la 9 casse aussi. Telles quelles, la 3 et la 4 tombaient sur les six coups et
# la 7 sous le soleil. Chacune est remplacée par une mesure pleine de même harmonie (chroma de la mesure entière :
# 3 et 4 → 8, 0,97 et 0,95 ; 7 → 1, 0,96 ; 9 → 8, 0,92), fondu de 25 ms qui finit sur chaque premier temps.
# La 9 ne sert que si le chiffre final arrive plus tard (prise plus lente).
SWAP = {3: 8, 4: 8, 7: 1, 9: 8}
def swap_bars(x):
    # la mesure k de la sortie (de OFF + 2k à OFF + 2k + 2 s) joue la mesure SWAP.get(k, k) du passage ; là où le
    # décalage change, fondu à puissance constante de 25 ms qui finit sur le premier temps
    L, X = int(round(2.0 * SR)), int(0.025 * SR)
    nb = int((len(x) / SR - OFF) // 2) + 1
    off = [(SWAP.get(k, k) - k) * L if int(round((OFF + 2 * SWAP.get(k, k) + 2) * SR)) <= len(x) else 0 for k in range(nb)]
    y = x.copy(); used = []
    for k in range(nb):
        a_, b_ = max(0, int(round((OFF + 2 * k) * SR))), min(len(x), int(round((OFF + 2 * k + 2) * SR)))
        if off[k] and b_ > a_:
            y[a_:b_] = x[a_ + off[k]:b_ + off[k]]; used.append((k, SWAP[k]))
        if k and off[k] != off[k - 1] and a_ - X >= 0:
            th = np.linspace(0, np.pi / 2, X)
            y[a_ - X:a_] = x[a_ - X + off[k - 1]:a_ + off[k - 1]] * np.cos(th) + x[a_ - X + off[k]:a_ + off[k]] * np.sin(th)
    return y, used
m1, BARS_SWAPPED = swap_bars(m1)
PRE = 1.0
m2 = stretched(DROP_B, PRE, DUR - T_BACK + 0.5)                   # la chute de la mesure 55 à PRE dans m2
post = m2[int(PRE * SR):]
mus = np.zeros(N)
i_s = int(round(T_STOP * SR))
mus[:i_s] = m1[:i_s]
# arrêt net : une bande qui ralentit en 0,22 s (tape stop), depuis l'image du chiffre
ts = int(0.22 * SR); tail = m1[i_s:i_s + int(0.45 * SR)]
pos = np.cumsum(np.linspace(1.0, 0.05, ts)); pos = pos[pos < len(tail) - 1]
stop = np.interp(pos, np.arange(len(tail)), tail) * np.linspace(1, 0, len(pos)) ** 1.5
mus[i_s:i_s + len(stop)] = stop
# la bande qui rembobine (pendant le rembobinage de l'image) : la fin de m1 à l'envers, deux fois plus vite
L = int((REW[1] - REW[0]) * SR)
rw = m1[i_s - 2 * L:i_s][::-1]; rw = np.interp(np.linspace(0, len(rw) - 1, L), np.arange(len(rw)), rw)
rw = bp(rw, 300, 6000) * np.interp(np.arange(L), [0, 0.15 * SR, L - 0.2 * SR, L], [0, 1, 1, 0]) * db(-8)
mus[int(REW[0] * SR):int(REW[0] * SR) + L] += rw
# remontée : le début de la reprise, à l'envers, qui monte jusqu'à son premier temps (au plus 0,9 s, pas avant le rembobinage)
Lr = int(min(0.9, T_BACK - REW[0]) * SR)
rv = post[:Lr][::-1] * np.linspace(0, 1, Lr) ** 2
i_b = int(round(T_BACK * SR)); mus[i_b - Lr:i_b] += bp(rv, 300, 9000) * 0.7
b = post[:N - i_b]
mus[i_b:i_b + len(b)] = b
# mise en scène : attaque à l'image 0 ; élan sur les coups ; le soleil : passe-bas qui se ferme puis s'ouvre jusqu'au
# déclic (la basse reste) ; la vente monte d'un demi-dB ; fondu de boucle
c0 = EV['coups'][0]['t0']
fc = np.exp(env_curve([(0, np.log(20000)), (LAST_IMP, np.log(20000)), (EV['sun0'], np.log(1800)),
                       (EV['sun1'], np.log(6000)), (EV['click'], np.log(20000)), (DUR, np.log(20000))]))
mus = lp_sweep(mus, fc)
lvl = env_curve([(0, db(-2.5)), (0.25, db(-1)), (c0 - 0.3, db(-1)), (c0, db(0)), (LAST_IMP, db(0)), (EV['sun0'], db(-2)), (EV['click'], db(0)),
                 (T_BIG, db(0.5)), (T_STOP + 0.3, db(0.5)), (T_STOP + 0.31, db(0)), (EV['loop'], db(0)), (EV['loop'] + 0.6, db(-1.5)), (DUR - 0.8, db(-1.5)), (DUR, db(-5))])
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
gP = 1 - (1 - db(-10)) * d2                                # bande de présence 1,5–6 kHz : − 10 dB sous la voix
mus = shelf(shelf(mus, 1500, g_hi=gP), 6000, g_hi=1 / gP)
mus *= 1 - (1 - db(-9)) * d2

# ---------- bruitages (repérés sur l'image : film-mo11/events.json) ----------
cache = {}
def sfx(i, st=0, dur=None, fade=0.04, rev=False, start=0.0):
    key = (i, st, dur, rev, start, fade)
    if key not in cache:
        p = next(A('bank', b_, f'sfx-{i}.mp3') for b_ in ('mo5', 'mo6', 'mo8', 'mo11') if os.path.exists(A('bank', b_, f'sfx-{i}.mp3')))
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
    'orn': (-17, 1500, 15000), 'tick': (-22, 1500, 12000), 'tool': (-15, 200, 10000), 'coin': (-12, 600, 14000),
}
CUES = []
def cue(t, i, role, prio=2, st=0, dur=None, pan=0.0, gain=0, rev=False, lead=0.0, start=0.0, pan2=None, lo=None, dry=False, fade=0.04, what=''):
    CUES.append(dict(t=t - lead, i=i, role=role, prio=prio, st=st, dur=dur, pan=pan, pan2=pan, gain=gain, rev=rev, start=start,
                     lo=lo, dry=dry, fade=fade, what=what) | ({'pan2': pan2} if pan2 is not None else {}))

E_ = EV
# ouverture : la plume rallume le calcul, l'embout aspire la bande du flanc, « 2 ?00 », « C'est donné. »
cue(E_['sh1'], 2589, 'orn', 2, dur=0.9, gain=-3, pan=-0.15, what='la plume rallume « 2 000 »')
cue(E_['arr'], 2589, 'orn', 3, st=3, dur=0.5, gain=-5, what='… descend la flèche')
cue(E_['sh2'], 3005, 'orn', 2, dur=0.7, pan=0.1, what='« 2 900 » se rallume')
cue(E_['q'], 2369, 'orn', 3, st=2, dur=0.5, gain=-3, what='le « ? » vacille')
cue(E_['vac0'], 2608, 'whoosh', 2, dur=0.5, lead=0.30, pan=-0.2, gain=2, what="la plume plonge et devient l'embout (crête sur l'aspiration)")
cue(E_['vac0'], 1465, 'tool', 2, start=0.85, dur=E_['vac1'] - E_['vac0'] + 0.15, pan=-0.25, pan2=0.25, gain=2,
    what="l'embout aspire la bande, de l'aile à la portière")
cue(E_['donne'], 1054, 'tick', 2, dur=0.4, gain=6, what='« 2 ?00 » : le rouleau tourne')
cue(E_['rw'] + 0.14, 3005, 'orn', 2, dur=0.6, gain=-2, what='la fente efface « telle quelle ? », « C\'est donné. » s\'écrit')
cue(E_['fold'], 3120, 'whoosh', 2, dur=0.7, lead=0.08, what='le calcul se replie en compteur')
for k in range(5): cue(E_['sam'] + 0.12 + k * 0.07, 1119, 'tick', 3, pan=-0.3 + 0.15 * k, what='palettes SAMEDI · 13:00')
# les six coups : chaque préparation a son outil, sa ligne de partage, puis son débit sur une note qui monte
C_ = COUPS
cue(C_['lavage']['t0'], 3215, 'tool', 2, st=-2, dur=0.7, pan=-0.2, pan2=0.2, what='lavage : le jet suit la ligne')
cue(C_['phares']['t0'] + 0.1, 850, 'tool', 2, start=2.0, dur=0.6, pan=-0.1, what='phares : ponçage court (+ 0,1 s : le débit du lavage, sur la croche, tombe 0,1 s avant le départ)')
cue(C_['sieges']['t0'], 1835, 'tool', 2, start=3.0, dur=0.65, what='sièges : aspiration humide')
cue(C_['odeur']['t0'] + 0.13, 1832, 'tool', 2, dur=0.6, pan=0.15, what="odeur : la molette, puis le souffle (après les pièces)")
cue(C_['rayure']['t0'] + 0.13, 3087, 'tool', 2, dur=0.65, pan=0.1, what='rayure : le polish passé à la main')
cue(C_['rayure']['hold'][1], 2589, 'orn', 3, st=7, dur=0.4, gain=-2, what='… la rayure disparaît, scintillement')
cue(C_['enjo']['hold'][0], 486, 'tool', 2, start=0.33, dur=0.3, gain=3, pan=0.1, what="enjoliveurs : le neuf se clipse à l'arrêt de la ligne")
for k, (x, xi) in enumerate(zip(E_['deb'], E_['imp'])):
    cue(x, 2354, 'ui', 1, st=k, pan=0.3, what=f'débit {k + 1} (note + {k})')
    cue(x, 1490, 'whoosh', 3, dur=0.35, pan=0.35, gain=-4, lead=0.14, what='la notification arrive')
    cue(xi, 1054, 'tick', 3, dur=0.3, gain=2, what='impulsion : le compteur roule')
# le gag, seul : quatre pièces sous les sièges (2 €, 1 €, 20 c, 20 c : la plus grosse sonne le plus grave)
for k, st_ in enumerate([0, 2, 6, 7]):
    cue(E_['gag'] + 0.07 * k, 3183, 'coin', 1, st=st_, start=0.42, dur=0.35, pan=-0.15 + 0.1 * k, gain=-2 * (k > 1), what='une pièce')
# le soleil baisse : la pile part, la lumière tombe, l'horloge accélère, ambiance du soir
cue(E_['sun0'], 1492, 'whoosh', 2, st=-2, dur=0.9, lead=0.1, gain=-4, what='la lumière tombe')
cue(E_['leaveN'], 1490, 'whoosh', 3, st=-3, dur=0.4, gain=-6, what='la pile de débits sort')
cue(E_['pose'], 2384, 'ui', 2, st=2, gain=-4, what='le compteur se pose à 3 330 €')
# palettes 15:20 → 16:30 : un tic par dizaine de minutes, sur la courbe de l'horloge du film (film.js, clockM :
# 70 minutes, puissance 1,6, de sun0 à sun1 − 0,2)
for k in range(1, 8):
    cue(E_['sun0'] + (E_['sun1'] - 0.2 - E_['sun0']) * (10 * k / 70) ** (1 / 1.6), 1119, 'tick', 3, st=k % 2, pan=0.1, gain=-2,
        what="l'horloge accélère")
cue(E_['vf'], 2589, 'orn', 3, st=3, dur=0.5, gain=-3, what='le viseur se referme')
cue(E_['click'], 1133, 'ui', 1, gain=2, dry=True, what='déclic de la photo 1 (sec)')
cue(E_['ann'], 1490, 'whoosh', 2, dur=0.45, lead=0.1, gain=-2, what="la photo part dans l'écran du téléphone")
for k in range(4): cue(E_['j4'] + 0.16 + k * 0.06, 1119, 'tick', 3, pan=-0.2 + 0.13 * k, what='palettes J+4')
cue(E_['msg1'], 2354, 'ui', 2, st=7, pan=-0.25, gain=-5, what='« Belle photo. Toujours dispo ? »')
cue(E_['msg2'], 2384, 'ui', 2, st=9, pan=-0.25, gain=-5, what='« Je passe demain ? »')
cue(E_['bubble'], 2354, 'ui', 1, st=4, pan=-0.2, gain=-2, what='« 3 300 et je la prends. »')
cue(E_['credit'], 1490, 'whoosh', 2, dur=0.5, pan=0.3, lead=0.12, what='virement reçu')
cue(E_['credit'] + 0.04, 951, 'chime', 1, pan=0.2, dur=0.7, fade=0.2, what='… + 3 300,00 € (traîne coupée : « Quatre cents de plus » passe devant)')
# « + 400 € » : l'accent sur le chiffre, l'arrêt de bande, la seule pause
cue(E_['big'], 2909, 'accent', 1, dur=0.5, fade=0.15, gain=-4, what='« + 400 € » (le premier coup seul : le second, à 0,75 s dans le fichier, romprait la pause)')
cue(E_['big'] + 0.06, 1107, 'chime', 1, st=7, gain=-2, what='« + 400 € », carillon')
cue(E_['prepa'], 2354, 'ui', 2, st=-3, gain=-8, what='« − 109,60 € de prépa » : une note basse, seule')
cue(E_['pay1'], 2369, 'orn', 2, dur=0.8, gain=-2, what='« Ton samedi le mieux payé. » s\'écrit')
cue(E_['pay2'], 2589, 'orn', 3, st=4, dur=0.5, gain=-4, what='… « le mieux payé »')
# rembobinage, la méthode, le verdict, la boucle
cue(REW[0], 1092, 'accent', 1, dur=REW[1] - REW[0] + 0.1, gain=-6, what='rembobinage')
cue(E_['card'], 3120, 'whoosh', 2, dur=0.7, lead=0.08, what='carte « Avant la photo 1 »')
cue(E_['pas'], 3005, 'orn', 2, dur=0.6, gain=-1, what='« Pas tout. » s\'écrit')
for k, x in enumerate(E_['l']): cue(x, 2369, 'orn', 2, st=2 * k, dur=0.45, gain=-3, what=f'règle {k + 1}')
cue(E_['pc'] + 0.25, 2589, 'orn', 3, st=5, dur=0.45, gain=-5, what="la plume entoure l'éraflure du pare-chocs (round 2)")
cue(E_['x'], 3005, 'orn', 2, st=-3, dur=0.5, what='« tu le laisses » : la lumière barre « Pare-chocs · 600 € » et le bouclier')
cue(E_['dive2'], 1492, 'whoosh', 2, st=2, dur=0.7, lead=0.1, gain=-3, what="plongée sur l'aile")
cue(E_['nail'], 1898, 'tool', 2, start=0.65, dur=0.4, lo=2000, gain=-2, what="l'ongle glisse sur la rayure")
cue(E_['nail'] + 0.2, 2589, 'orn', 3, st=7, dur=0.35, gain=-4, what='… petit scintillement')
cue(E_['verd'], 2369, 'orn', 2, dur=0.7, gain=-2, what='« L\'ongle glisse ? Tu lustres. »')
cue(E_['pol'], 2384, 'ui', 2, st=4, gain=-3, what='« Polish · 15 € »')
cue(E_['pol'] + 0.14, 3087, 'tool', 3, dur=0.5, gain=-5, what='… le polish efface la rayure')
cue(E_['carr'], 3005, 'orn', 2, st=-3, dur=0.5, what='« Carrossier · 300 € » barré')
cue(E_['carr'] + 0.22, 2384, 'ui', 3, st=-4, gain=-5, what='… note grave')
cue(E_['loop'], 3120, 'whoosh', 2, dur=0.8, lead=0.08, what="retour au cadre de l'image 0")
cue(E_['front'][0], 1465, 'tool', 3, start=0.85, dur=1.0, rev=True, gain=-5, pan=0.2, pan2=-0.2, what='la poussière revient')
cue(E_['contour'][0], 2589, 'orn', 3, dur=0.9, gain=-3, what='le contour se retrace')
for k, x in enumerate(E_['calc'][::2]): cue(x, 3005, 'orn', 3, st=2 * k, dur=0.5, gain=-4, what='le calcul se réécrit')

# priorité : un son moins prioritaire à moins de 0,12 s d'un plus prioritaire est retiré
CUES.sort(key=lambda c: c['t'])
kept, dropped = [], []
for c in CUES:
    clash = [o for o in CUES if o is not c and abs(o['t'] - c['t']) < 0.12 and o['prio'] < c['prio']]
    (dropped if clash else kept).append(c)
fx = np.zeros((N, 2)); fx_dry = np.zeros((N, 2))
for c in kept:
    y = sfx(c['i'], c['st'], c['dur'], fade=c['fade'], rev=c['rev'], start=c['start'])
    pk, lo, hi = ROLE[c['role']]
    y = bp(y, c['lo'] or lo, hi, 2) * db(pk + c['gain'])
    i = int(round(c['t'] * SR)); y = y[:max(0, N - i)]
    if i < 0: y = y[-i:]; i = 0
    p = (np.linspace(c['pan'], c['pan2'], len(y)) + 1) * np.pi / 4
    bus = fx_dry if c['dry'] else fx
    bus[i:i + len(y), 0] += y * np.cos(p); bus[i:i + len(y), 1] += y * np.sin(p)

# le téléphone vibre une fois, juste avant le premier message (vibration fabriquée, méthode de MO9)
tv = np.arange(int(0.6 * SR)) / SR
buzz = np.sin(2 * np.pi * 165 * tv) * (np.sin(2 * np.pi * 24 * tv) > 0) * ((tv < 0.22) | (tv > 0.34))
buzz = bp(buzz, 120, 3000) * db(-16) * np.minimum(1, np.minimum(tv, 0.6 - tv) / 0.01)
i = int((E_['msg1'] - 0.14) * SR); fx[i:i + len(buzz), 0] += buzz * 0.8; fx[i:i + len(buzz), 1] += buzz
# ambiance du soir légère pendant que le soleil baisse (oiseaux, circulation lointaine), jusqu'au déclic
amb_a, amb_b = E_['sun0'] - 0.2, E_['click'] + 0.25
amb = load(A('bank', 'mo11', 'sfx-2932.mp3'))[int(3.6 * SR):][:int((amb_b - amb_a) * SR)]
amb = bp(amb, 300, 12000) / rm(amb) * db(-34)
amb *= np.interp(np.arange(len(amb)), [0, 0.5 * SR, len(amb) - 0.3 * SR, len(amb)], [0, 1, 1, 0])
i = int(amb_a * SR); fx[i:i + len(amb), 0] += amb; fx[i:i + len(amb), 1] += amb * 0.9

# réverbération courte commune aux bruitages (ils sonnent dans la même pièce) ; le déclic reste sec
ir = np.random.default_rng(5).standard_normal(int(0.45 * SR)) * np.exp(-np.arange(int(0.45 * SR)) / (0.08 * SR))
ir = bp(ir, 300, 7000); ir /= np.sqrt((ir ** 2).sum())
for ch in range(2): fx[:, ch] += fftconvolve(fx[:, ch], ir)[:N] * db(-15)
fx += fx_dry
# les bruitages cèdent aussi à la voix (−7 dB pendant qu'elle parle)
fx *= (1 - (1 - db(-7)) * d2)[:, None]

# ---------- somme, compression douce, loudness ----------
# téléphone : la basse de la musique allégée sous 150 Hz (un haut-parleur de téléphone ne la rend pas)
mus = shelf(mus, 150, g_lo=db(-9))
mus = bp(mus, 45, None, 2)
mus_st = np.stack([mus, mus], 1) * db(-8)            # 2 dB sous MO9 : voix ≥ 7 dB au-dessus (brief)
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
tpk = lambda x: 20 * np.log10(np.abs(librosa.resample(x.T, orig_sr=SR, target_sr=4 * SR)).max() + 1e-12)
gain_total = 0.0
for _ in range(4):
    gl = -14 - meter.integrated_loudness(mix); mix *= db(gl); gain_total += gl
    mix = limit(mix, -5.0)
# la boucle : la piste part et finit sur zéro (pas de clic quand le lecteur reboucle)
mix[:int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))[:, None]; mix[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))[:, None]
tp = tpk(mix)
if tp > -3.5: mix *= db(-3.5 - tp); gain_total += -3.5 - tp
os.makedirs(A('stems-mo11'), exist_ok=True)
sf.write(A(f'mix-mo11{TAG}.wav'), mix, SR, subtype='PCM_24')
g = db(gain_total)
stems = {'voix': vo_st * g, 'musique': mus_st * g, 'bruitages': fx * g}
for name, x in stems.items(): sf.write(A('stems-mo11', f'{name}{TAG}.wav'), x, SR, subtype='PCM_24')
# version sans musique (voix + bruitages) pour juger le sound design nu
nm = (vo_st + fx) * g; nm *= db(-14 - meter.integrated_loudness(nm)); nm = limit(nm, -5.0)
sf.write(A('stems-mo11', f'sans-musique{TAG}.wav'), nm, SR, subtype='PCM_24')

# ---------- rapport ----------
dbs = lambda v: 20 * np.log10(v + 1e-12)
rms = lambda x: np.sqrt((x ** 2).mean() + 1e-20)
Lm = meter.integrated_loudness(mix)
rep = [f'MO11 {HOOK} · mix : {Lm:.1f} LUFS intégrés, true peak {tpk(mix):.1f} dBTP (avant AAC)',
       f"voix : {'prise posée' if not VT.get('provisional') else 'PROVISOIRE'}" + ('' if VOICED else ' — piste muette : ducking, écart voix/musique et niveau final à refaire avec la prise'),
       f'musique : Controlled Drop à {BPM_SRC:.1f} BPM ramené à 120 (× {RATE:.4f}) ; chute de la mesure 13 à {OFF:.3f} s, reprise (mesure 55) à {T_BACK:.3f} s']
# calage mesuré sur la piste musique : attaque des deux chutes
M = stems['musique'].mean(1)
def attack(x, tg, w=0.25, th=-10):
    a, b = int((tg - w) * SR), int((tg + w) * SR); k = int(0.002 * SR)
    e = np.sqrt(np.convolve(x[a:b] ** 2, np.ones(k) / k, 'same')); return (a + np.argmax(e > e.max() * db(th))) / SR
fr = lambda dt: f'{dt * 1000:+.0f} ms ({dt * FPS:+.1f} image)'
rep.append('  mesures remplacées (sortie ← passage) : ' + (', '.join(f'{o} ({OFF + 2 * o:.2f} s) ← {s_}' for o, s_ in BARS_SWAPPED) or 'aucune'))
if OFF > 0.05:
    rep.append(f'  attaque mesurée de la chute A : {attack(M, OFF):.3f} s (visée {OFF:.3f}, {fr(attack(M, OFF) - OFF)})')
# le temps sous « + 400 € » : attaque la plus forte de la musique non arrêtée (m1) à ± 0,1 s du chiffre
oe = librosa.onset.onset_strength(y=m1[int((T_BIG - 0.3) * SR):int((T_BIG + 0.3) * SR)], sr=SR, hop_length=48)
ot = (T_BIG - 0.3) + librosa.times_like(oe, sr=SR, hop_length=48); w_ = np.abs(ot - T_BIG) < 0.1
rep.append(f'  « + 400 € » : {(T_BIG - OFF) / 2:.1f} mesures après la chute (premier temps) ; attaque de la musique la plus forte à ± 0,1 s : '
           f'{fr(ot[w_][np.argmax(oe[w_])] - T_BIG)}')
rep.append(f'  attaque mesurée de la reprise : {attack(M, T_BACK):.3f} s (visée {T_BACK:.3f}, {fr(attack(M, T_BACK) - T_BACK)})')
# l'arrêt sur le chiffre final
k5 = int(0.005 * SR); eM = np.sqrt(np.convolve(M ** 2, np.ones(k5) / k5, 'same'))
refM = np.median(eM[int((T_BIG - 1.0) * SR):int((T_BIG - 0.02) * SR)])
after = lambda th: (int(T_BIG * SR) - int(0.1 * SR) + np.argmax(np.convolve(eM[int(T_BIG * SR) - int(0.1 * SR):] < refM * db(th), np.ones(int(0.03 * SR)), 'valid') >= int(0.03 * SR))) / SR
rep.append(f'arrêt de bande : départ {T_STOP:.3f} s, « + 400 € » à {T_BIG:.3f} s → écart {fr(T_STOP - T_BIG)} ; '
           f'musique −6 dB à {fr(after(-6) - T_BIG)}, −20 dB à {fr(after(-20) - T_BIG)}, muette (−50 dB) à {fr(after(-50) - T_BIG)}')
mute = M[int((T_BIG + 0.3) * SR):int(REW[0] * SR)]
rep.append(f'la seule pause : musique {T_BIG + 0.3:.2f} → {REW[0]:.2f} s à {dbs(np.abs(mute).max()):.0f} dBFS crête ; reprise à {T_BACK:.2f} s')
# son dès l'image 0
mono = mix.mean(1)
rep.append(f"son dès 0 s : RMS 0–0,1 s {dbs(rms(mono[:int(0.1 * SR)])):.1f} dBFS, 0–0,5 s {dbs(rms(mono[:int(0.5 * SR)])):.1f} dBFS ; "
           f"2 premières s {meter.integrated_loudness(mix[:2 * SR]):.1f} LUFS contre {meter.integrated_loudness(mix[2 * SR:]):.1f} sur le reste")
rep.append(f'bruitages placés : {len(kept)} · retirés pour collision : {len(dropped)} ' + ', '.join(f"{c['i']}@{c['t']:.2f}" for c in dropped))
Y = np.abs(np.fft.rfft(mono)) ** 2; fq = np.fft.rfftfreq(len(mono), 1 / SR)
rep.append(f'téléphone : {Y[fq < 150].sum() / Y.sum() * 100:.0f} % de l\'énergie sous 150 Hz, {Y[(fq >= 1000) & (fq < 5000)].sum() / Y.sum() * 100:.1f} % entre 1 et 5 kHz')
C0 = EV['coups']
for a_, b_, nm_ in [(0, EV['fold'], 'ouverture'), (C0[0]['t0'], LAST_IMP, 'six coups'), (EV['sun0'], EV['click'], 'soleil'),
                    (EV['click'], T_BIG, 'vente'), (T_BIG, T_BIG + 0.5, '+ 400 €'), (T_BIG + 0.5, EV['pay1'], 'pause'), (EV['pay1'], REW[0], 'samedi'),
                    (T_BACK, EV['loop'], 'méthode'), (EV['loop'], DUR, 'boucle')]:
    seg = mono[int(a_ * SR):int(b_ * SR)]; rep.append(f'RMS {nm_:10s} {a_:5.2f} → {b_:5.2f} s {dbs(rms(seg)):6.1f} dBFS')
if VOICED:
    gaps = []
    for l in lines:
        a_, b_ = int(l['t'] * SR), int(l['end'] * SR)
        v_, m_, f_ = (dbs(rms(stems[n_][a_:b_])) for n_ in ('voix', 'musique', 'bruitages'))
        if v_ > -60: gaps.append((l['key'], v_ - m_ if m_ > -60 else None, v_ - f_ if f_ > -60 else None))
    sh = lambda x: 'seule' if x is None else f'{x:.0f}'
    rep.append('voix au-dessus de la musique / des bruitages, par réplique (dB) : ' + ', '.join(f'{k_} {sh(a)}/{sh(b)}' for k_, a, b in gaps))
    gm = [x[1] for x in gaps if x[1] is not None]; gf = [x[2] for x in gaps if x[2] is not None]
    rep.append(f'  musique : minimum {min(gm):.1f} dB, médiane {np.median(gm):.1f} dB ; bruitages : minimum {min(gf):.1f} dB, médiane {np.median(gf):.1f} dB (visé : ≥ 7 dB)')
rep.append('repérage (t, son, rôle, priorité) :')
for c in CUES:
    rep.append(f"  {c['t']:6.2f}  {c['i']:>5}  {c['role']:6s} p{c['prio']}  {'RETIRÉ ' if c in dropped else ''}{c['what']}")
open(os.path.join(ROOT, 'docs', f'mix_report-mo11{TAG}.txt'), 'w').write('\n'.join(rep) + '\n')
print('\n'.join(rep[:20]))
