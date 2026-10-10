"""MO12 « La pochette » : voix, musique et bruitages mixés (méthode .claude/skills/motion-studio/references/sound-design.md,
modèle scripts/audio-mo9.py).

Voix   : audio/vo-mo12/vo-placed.wav, posée sur le film par scripts/vo-mo12.py. Tant que la prise n'existe pas
         (compte ElevenLabs bloqué), c'est la piste muette du mode --provisoire : le script tourne pareil, le ducking
         et les écarts voix/musique s'activeront d'eux-mêmes quand la vraie voix sera posée.
         HOOK=B : audio/vo-mo12/vo-placed-B.wav (ouverture B) → audio/mix-mo12-B.wav
Musique: audio/music/Controlled Drop.mp3, recalée à 120 BPM, les passages de MO5 : mesure 13 dès l'image 0, grille
         calée pour que « 20 min » tombe sur un temps (méthode MO9) ; l'élan : basse et aigus retirés pendant l'attente
         du virement, la basse revient sur le premier temps après la notification, la musique monte jusqu'au chiffre ;
         arrêt de bande sur l'image de « 20 min » ; silence (la seule pause, la tasse) ; bande qui rembobine, remontée à
         l'envers, puis mesure 55 dont le premier temps ouvre la méthode (« Mardi ») ; fondu de boucle.
         Chaque premier temps est recalé sur l'attaque réelle du morceau, mesurée, pas sur la mesure théorique.
Bruits : audio/bank/mo12 (14 sons Mixkit, docs/timeline-mo12.md « Bruitages ») et les banques de MO5, MO6, MO8 ; un son
         par geste, attaché à son repère de film-mo12/events.json (CUT=mo12 node scripts/events.mjs), un son principal
         à la fois ; moteur, vibration et tic-tac fabriqués comme dans MO5.
Sortie : audio/mix-mo12.wav (lu par render.mjs), audio/stems-mo12/{voix,musique,bruitages,sans-musique}.wav,
         docs/mix_report-mo12.txt
Aucun temps n'est recopié : tout vient de audio/vo-mo12/vo-timing.json et de film-mo12/events.json.
"""
import os, json
import numpy as np, librosa, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.ndimage import minimum_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
FPS = 60
HOOK = os.environ.get('HOOK', 'A').upper()
TAG = '' if HOOK == 'A' else '-B'
VT = json.load(open(A('vo-mo12', 'vo-timing.json')))
EV = json.load(open(os.path.join(ROOT, 'film-mo12', 'events.json')))
# events.json doit venir du même minutage que la voix (sinon : relancer CUT=mo12 node scripts/events.mjs)
for k in ('dur', 'loop', 'provisional'):
    if (bool(EV.get(k)) != bool(VT.get(k))) if k == 'provisional' else (EV.get(k) != VT.get(k)):
        raise SystemExit(f'film-mo12/events.json périmé ({k} : film {EV.get(k)} ≠ voix {VT.get(k)}) : '
                         'relancer « CUT=mo12 node scripts/events.mjs » après la pose de la voix')
DUR = VT['dur']
N = int(round(DUR * SR))
mk = lambda k: VT['marks'][k]['t']

# ---------- les instants qui règlent la musique ----------
T_BIG = EV['big']                          # « 20 min » à l'écran (film-mo12/film.js, T.big) : le chiffre final
OFF = T_BIG % 0.5                          # premier temps de la grille : « 20 min » tombe sur un temps
T_STOP = T_BIG                             # arrêt de bande sur l'image du chiffre (à ±1 image, mesuré plus bas)
T_BACK = EV['mdocs'][0] - 0.5              # mesure 55 : son premier temps ouvre la méthode, les cinq cartes tombent
                                           # sur les temps suivants (film : T.m = « Mardi » + 0,45 + 0,5 i)
T_W0, T_W1 = EV['wait'], EV['recu']        # l'attente du virement : de la fin de « virement. » à la notification
BEAT = 0.5
next_beat = lambda t: OFF + BEAT * np.ceil((t - OFF) / BEAT - 1e-9)
T_BASS = next_beat(T_W1 - 0.03)            # la basse revient sur le premier temps qui suit la notification

def load(path, sr=SR, mono=True):
    y, _ = librosa.load(path, sr=sr, mono=mono)
    return y

def db(x): return 10 ** (x / 20)

def bp(y, lo=None, hi=None, order=4):
    if lo: y = sosfilt(butter(order, lo, 'hp', fs=SR, output='sos'), y, axis=0)
    if hi: y = sosfilt(butter(order, hi, 'lp', fs=SR, output='sos'), y, axis=0)
    return y

def env_curve(points, n=N):
    t = np.arange(n) / SR
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)

rms_db = lambda x: 20 * np.log10(np.sqrt((np.asarray(x) ** 2).mean() + 1e-20))

# ---------- voix ----------
vo_file = A('vo-mo12', 'vo-placed.wav' if HOOK == 'A' else 'vo-placed-B.wav')
if not os.path.exists(vo_file):
    raise SystemExit(f'{os.path.relpath(vo_file, ROOT)} absent : l\'ouverture B n\'existe qu\'avec une prise posée (scripts/vo-mo12.py)')
vo = load(vo_file)[:N]
vo = np.pad(vo, (0, N - len(vo)))
vo = bp(vo, 80, 14000)
LINES = VT['lines'] if HOOK == 'A' else VT['hookB']['lines'] + [l for l in VT['lines'] if l['key'] not in ('h1', 'h2', 'h3')]
VO_ON = np.abs(vo).max() > 1e-4            # faux tant que la voix est la piste muette du mode provisoire
# chaque réplique ramenée au même niveau (± 6 dB max) : la voix ne disparaît jamais
if VO_ON:
    lv = [np.sqrt((vo[int(l['t'] * SR):int(l['end'] * SR)] ** 2).mean() + 1e-12) for l in LINES]; ref = np.median(lv)
    for l, r_ in zip(LINES, lv):
        a_, b_ = int((l['t'] - 0.03) * SR), int((l['end'] + 0.05) * SR)
        vo[a_:b_] *= np.clip(ref / r_, db(-6), db(6))

# ---------- musique ----------
src = load(A('music', 'Controlled Drop.mp3'))
RATE = 120 / 123.05                        # 1 mesure = 2,000 s
BAR_SRC = 4 * 60 / 123.05
def stretch(seg):
    return librosa.effects.time_stretch(seg, rate=RATE)
def attack(m):
    """Attaque réelle du premier temps de la mesure m (s, dans le morceau) : franchissement de la moitié du maximum
    local de l'enveloppe (2 ms), dans ± 60 ms autour de la mesure théorique (MO5 : l'attaque, pas le temps théorique)."""
    a = int((m * BAR_SRC - 0.06) * SR); seg = np.abs(src[a:a + int(0.10 * SR)])
    k = int(0.002 * SR); e = np.convolve(seg, np.ones(k) / k, 'same')
    return (a + int(np.argmax(e > 0.5 * e.max()))) / SR
PRE = 0.004                                # 4 ms gardées avant chaque attaque (rien n'est coupé dans le transitoire)
A13, A55 = attack(13), attack(55)
s1 = A13 - OFF * RATE                      # l'attaque de la mesure 13 tombe sur le premier temps de la grille
m1 = stretch(src[int(s1 * SR):int((s1 + (T_STOP + 0.8) * RATE) * SR)])
s2 = A55 - PRE * RATE
m2 = stretch(src[int(s2 * SR):int((s2 + (DUR - T_BACK + 1.0) * RATE) * SR)])
i_back = int(round((T_BACK - PRE) * SR))   # l'attaque de la mesure 55 sur T_BACK

def tape_stop(x, i, dur=0.22):
    """Arrêt de bande (MO5) : la musique qui suit l'instant i ralentit et s'éteint en 0,22 s."""
    ts = int(dur * SR); tail = x[i:i + int(0.45 * SR)]
    pos = np.cumsum(np.linspace(1.0, 0.05, ts)); pos = pos[pos < len(tail) - 1]
    return np.interp(pos, np.arange(len(tail)), tail) * np.linspace(1, 0, len(pos)) ** 1.5

def music_raw(stop=True):
    """La musique assemblée. stop=False : la même sans l'arrêt (référence pour mesurer où l'arrêt tombe)."""
    mus = np.zeros(N)
    iS = int(round(T_STOP * SR))
    if not stop:
        a = m1[:N]; mus[:len(a)] = a
        return mus
    mus[:iS] = m1[:iS]
    st = tape_stop(m1, iS); mus[iS:iS + len(st)] = st
    # la bande qui rembobine pendant que l'histoire revient en arrière (film : rw) : la fin de m1 à l'envers, ≈ 3 ×
    r0, r1 = EV['rw']
    rw = m1[max(0, iS - int(2.4 * SR)):iS][::-1]
    L = int((r1 - r0) * SR); rw = np.interp(np.linspace(0, len(rw) - 1, L), np.arange(len(rw)), rw)
    rw = bp(rw, 300, 6000) * np.interp(np.arange(L), [0, 0.12 * SR, L - 0.2 * SR, L], [0, 1, 1, 0]) * db(-8)
    mus[int(r0 * SR):int(r0 * SR) + L] += rw
    # remontée : 0,9 s du début de la reprise, à l'envers, qui monte jusqu'au premier temps
    rv = m2[:int(0.9 * SR)][::-1] * np.linspace(0, 1, int(0.9 * SR)) ** 2
    i0 = i_back - len(rv); mus[i0:i0 + len(rv)] += bp(rv, 300, 9000) * 0.7
    b = m2[:N - i_back]
    mus[i_back:i_back + len(b)] = b
    return mus

# la musique cède sa place à la voix : enveloppe de la voix (attaque 20 ms, relâchement 350 ms)
venv = np.abs(vo); k = int(0.03 * SR); venv = np.convolve(venv, np.ones(k) / k, 'same')
venv = venv / (venv.max() + 1e-9)
duck = np.clip(venv * 6, 0, 1)
att, rel = np.exp(-1 / (0.02 * SR)), np.exp(-1 / (0.35 * SR))
d2 = np.zeros_like(duck); s = 0.0
for i, x in enumerate(duck):
    s = att * s + (1 - att) * x if x > s else rel * s + (1 - rel) * x
    d2[i] = s

# Séparation en bandes par filtres de Linkwitz-Riley d'ordre 4 : le grave et l'aigu restent en phase et leur somme est
# plate, donc une bande baissée l'est vraiment. (La soustraction « x − passe-bas(x) » de audio-mo5/9/10 laisse passer la
# basse à cause du retard de phase : mesuré, son « −9 dB sous 150 Hz » ne fait que −1 dB à 60 Hz et +3 dB à 150 Hz.)
def lr4(x, fc):
    lo = butter(2, fc, 'lowpass', fs=SR, output='sos'); hi = butter(2, fc, 'highpass', fs=SR, output='sos')
    return sosfilt(np.vstack([lo, lo]), x), sosfilt(np.vstack([hi, hi]), x)
def shelf(x, fc, g_lo=1.0, g_hi=1.0):
    """Gains (constants ou courbes) sous et au-dessus de fc."""
    lo, hi = lr4(x, fc)
    return lo * g_lo + hi * g_hi

LV = {}                                    # courbe d'élan (dB), lue par les étages de crête (round 3)
def music_shape(mus, keep=False):
    """Mise en scène, ducking par bande, réglage téléphone : identique pour la musique et sa référence sans arrêt."""
    # l'attente : la basse sort et le son passe sous 1 400 Hz ; les aigus reviennent avec la notification, la basse
    # sur le premier temps qui la suit
    lo_cut = env_curve([(0, 1), (T_W0, 1), (T_W0 + 0.4, 0), (T_BASS - 0.03, 0), (T_BASS + 0.01, 1), (DUR, 1)])
    mus = shelf(mus, 200, g_lo=lo_cut)
    dark = env_curve([(0, 0), (T_W0, 0), (T_W0 + 0.4, 1), (T_W1 - 0.02, 1), (T_W1 + 0.12, 0), (DUR, 0)])
    mus = shelf(mus, 1400, g_hi=1 - dark)
    # l'élan : attaque à l'image 0, creux de l'attente, montée jusqu'au chiffre, retrait sous le gag (bruitage seul),
    # reprise pleine, fondu de boucle
    g = EV['gag']
    lvl = (env_curve([(0, -1), (T_W1 + 0.12, -1), (T_BIG, 0.5), (T_BIG + 0.01, 0), (DUR - 0.4, 0), (DUR, -3)])
           + env_curve([(0, 0), (T_W0, 0), (T_W0 + 0.4, -4), (T_W1 - 0.02, -4), (T_W1 + 0.12, 0), (DUR, 0)])
           + env_curve([(0, 0), (g - 0.05, 0), (g + 0.05, -3), (g + 0.5, -3), (g + 0.8, 0), (DUR, 0)])
           # retour de la basse : −3 dB pendant 0,4 s (le limiteur y creusait tout de 10 dB, round 3)
           + env_curve([(0, 0), (T_BASS - 0.03, 0), (T_BASS + 0.01, -3), (T_BASS + 0.4, -3), (T_BASS + 0.6, 0), (DUR, 0)]))
    if keep: LV['lvl'] = lvl
    mus = mus * db(lvl)
    # ducking par bande sous la voix : présence (1,5–6 kHz) −10 dB (tout ce qui dépasse 1,5 kHz baissé, puis ce qui
    # dépasse 6 kHz rendu), niveau −8 dB
    gP = 1 - (1 - db(-10)) * d2
    mus = shelf(shelf(mus, 1500, g_hi=gP), 6000, g_hi=1 / gP)
    mus *= 1 - (1 - db(-8)) * d2
    # téléphone : la basse allégée sous 150 Hz (−9 dB), passe-haut 45 Hz
    mus = shelf(mus, 150, g_lo=db(-9))
    mus = bp(mus, 45, None, 2)
    return mus * db(-6)

mus = music_shape(music_raw(), keep=True)
mus_ref = music_shape(music_raw(stop=False))

# ---------- bruitages (repérés sur l'image : film-mo12/events.json) ----------
BANKS = ['mo12', 'mo5', 'mo6', 'mo8']
cache = {}
def sfx(i, st=0, dur=None, fade=0.04, rev=False, start=0.0):
    key = (i, st, dur, fade, rev, start)
    if key not in cache:
        p = next(A('bank', b, f'sfx-{i}.mp3') for b in BANKS if os.path.exists(A('bank', b, f'sfx-{i}.mp3')))
        y = load(p)
        if start: y = y[int(start * SR):]
        nz = np.where(np.abs(y) > 0.01 * np.abs(y).max())[0]
        y = y[nz[0]:] if len(nz) else y               # attaque calée : silence de tête retiré
        if st: y = librosa.effects.pitch_shift(y, sr=SR, n_steps=st)
        if dur: y = y[:int(dur * SR)]
        f = min(int(fade * SR), len(y) // 3); y[-f:] *= np.linspace(1, 0, f)
        if rev: y = y[::-1]
        cache[key] = y / (np.abs(y).max() + 1e-9)
    return cache[key]

ROLE = {  # crête visée (dBFS) et bande
    'accent': (-7, 40, 16000), 'ui': (-10, 400, 14000), 'chime': (-13, 500, 12000), 'whoosh': (-14, 250, 9000),
    'orn': (-17, 1500, 15000), 'tick': (-22, 1500, 12000), 'engine': (-11, 140, 9000), 'tool': (-15, 200, 10000),
    'amb': (-24, 200, 8000),
}
# voix provisoire muette : la normalisation monte tout d'environ 15 dB, et les notes des cartes passaient le plafond du
# limiteur de 9 à 10 dB (la musique se creusait sous chacune). Tant que la voix manque, les rôles qui frappent le plus
# (accent, ui, chime) sont baissés de 4 dB ; à remesurer avec la vraie prise (round 3).
if not VO_ON:
    for k_ in ('accent', 'ui', 'chime'): ROLE[k_] = (ROLE[k_][0] - 4,) + ROLE[k_][1:]
CUES = []
def cue(t, i, role, prio=2, st=0, dur=None, pan=0.0, gain=0, rev=False, lead=0.0, start=0.0, fade=0.04, peak=False,
        bed=False, what=''):
    """Un son par geste : son attaque perçue (la moitié de sa première crête, pas le premier échantillon audible) tombe
    sur t. peak : le pic d'énergie du son (souffle) tombe sur t. rev / bed : le début du son tombe sur t (souffle
    inversé qui monte jusqu'au geste, nappe sans attaque hors règle de collision)."""
    y = sfx(i, st, dur, fade, rev, start)
    k = int(0.003 * SR); e = np.convolve(np.abs(y), np.ones(k) / k, 'same')
    if peak: off = int(np.argmax(e)) / SR
    elif rev or bed: off = 0.0
    else: e3 = e[:int(0.3 * SR)]; off = int(np.argmax(e3 >= 0.5 * e3.max())) / SR
    # tc : l'instant où le son se fait entendre, celui que compare la règle de collision (pour un souffle aligné sur son
    # pic, son début)
    CUES.append(dict(t=t - lead - off, tc=t - lead - (off if peak else 0.0), i=i, role=role, prio=prio, y=y, pan=pan,
                     gain=gain, bed=bed, what=what))

E_ = EV
# la scène : la bulle vibre, ça sonne, 11:00 → 11:20, VENDUE, la C3 part, la bulle du beau-frère
cue(E_['sonne'], 113, 'chime', 1, dur=1.2, fade=0.35, what='sonnette')                       # « ding-dong »
cue(E_['roll'], 1054, 'tick', 2, dur=0.45, gain=6, what='rouleaux 11:00 → 11:20')
cue(E_['stamp'], 2182, 'accent', 1, start=0.06, dur=0.12, gain=-4, what='tampon VENDUE (coup)')
cue(E_['stamp'], 2380, 'tick', 1, dur=0.4, gain=10, what='tampon VENDUE (papier)')
cue(E_['bf'] + 0.06, 2356, 'ui', 2, st=-2, dur=0.22, pan=0.3, what='bulle du beau-frère')     # arrive de la droite
# retour court : souffle inversé, rouleaux qui redescendent ; l'essai : la route, l'horloge court 11:01 → 11:09
r0, r1 = E_['r1']
cue(r0, 3120, 'whoosh', 2, dur=r1 - r0, rev=True, what='retour court (souffle inversé)')
cue(r0 + 0.1, 1054, 'tick', 2, st=-2, dur=0.35, gain=4, what='rouleaux 11:20 → 11:00')
cue(E_['essai'], 1554, 'amb', 3, start=3.0, dur=E_['essaiOut'] - E_['essai'], fade=0.25, bed=True, pan=-0.1, what='route (essai)')
cue(E_['essTicks'][0] - 0.02, 1054, 'tick', 2, dur=E_['essTicks'][-1] - E_['essTicks'][0] + 0.12, gain=4, what='horloge 11:01 → 11:09')
# les papiers : la caméra plonge, la pochette monte et s'ouvre ; une question par temps, une carte qui répond
cue(E_['blur'], 3120, 'whoosh', 2, dur=0.6, gain=-4, what='la caméra plonge vers la pochette')
cue(E_['poch'], 1530, 'ui', 2, start=0.17, dur=0.23, gain=-4, what='la pochette monte (papier)')
cue(E_['rabat'], 1105, 'ui', 2, start=0.26, dur=0.25, gain=-2, what='le rabat s\'ouvre')
# (round 2 : plus de tic sur les questions ; la carte sort 0,1 s avant sa question, sa note porte la paire)
for k, x in enumerate(E_['c']): cue(x, 2354, 'ui', 1, st=[0, 2, 4, 5][k], pan=0.1, what=f'carte {k + 1} répond')   # une note qui monte
# l'attente : ses mains sur son téléphone ; le tic-tac (fabriqué plus bas) ; la notification
cue(E_['phone'], 1393, 'tool', 2, dur=1.0, fade=0.2, pan=0.2, what='tapotements (virement lancé)')
cue(E_['recu'] + 0.03, 951, 'chime', 1, pan=0.2, what='virement reçu')
# les signatures : deux traits de stylo (le son quand le trait prend de la vitesse ; les tampons « signé » restent
# muets, le stylo porte le geste), la carte grise barrée, « Vendu le… », signée
for k, (x, (a_, d_)) in enumerate(zip(E_['sig'], [(0.01, 0.16), (0.49, 0.20)])):
    cue(x - 0.06, 2370, 'tool', 2, start=a_, dur=d_, pan=-0.1 + 0.2 * k, what=f'signature {k + 1}')
cue(E_['cg'], 2998, 'ui', 2, dur=0.3, gain=-3, what='carte grise barrée')
cue(E_['cgW'], 2369, 'orn', 3, dur=0.6, gain=-4, what='« Vendu le… » s\'écrit')
cue(E_['cgS'], 2370, 'tool', 2, start=0.90, dur=0.25, what='carte grise signée')
cue(E_['decl'], 2997, 'ui', 2, dur=0.12, gain=-3, what='déclaration : le clic')
cue(E_['zero'], 1107, 'chime', 2, st=2, gain=-4, what='« 0,00 € » s\'allume')
cue(E_['code'], 2354, 'ui', 2, st=7, pan=0.1, what='code de cession remis')                  # la note la plus haute
# le gag, seul : la cloche de comptoir et la monnaie font la caisse, la notification arrive de la droite
cue(E_['gag'] + 0.05, 1490, 'whoosh', 3, start=0.35, gain=-6, pan=0.3, peak=True, what='gag : arrivée')
cue(E_['gag'] + 0.05, 931, 'chime', 1, dur=1.0, fade=0.3, pan=0.25, what='gag : cloche')
cue(E_['gag'] + 0.10, 1939, 'orn', 1, start=0.04, dur=0.36, gain=2, pan=0.25, what='gag : monnaie')
# la chute : les clés, la C3 part (moteur fabriqué), 11:19 → 11:20, « 20 min »
cue(E_['cles'], 1558, 'tool', 2, dur=0.6, fade=0.15, pan=0.15, what='les clés')
cue(E_['roll20'], 1054, 'tick', 2, dur=0.2, gain=6, what='rouleaux 11:19 → 11:20')
cue(E_['big'], 2909, 'accent', 1, dur=0.35, fade=0.2, gain=-3, what='« 20 min »')           # coupé avant « Vingt minutes » (round 1)
cue(E_['big'] + 0.06, 1107, 'chime', 1, st=4, gain=-4, what='« 20 min » (note)')
# la seule pause : la tasse revient, « encore chaud. » s'écrit
cue(E_['tasse'], 2835, 'orn', 2, start=1.05, dur=0.25, gain=-3, what='la cuillère contre la tasse')
cue(E_['chaud'], 2369, 'orn', 2, dur=0.6, gain=-2, what='« encore chaud. » s\'écrit')
# rembobinage jusqu'au mardi, palettes « MAR 6 OCT »
w0, w1 = E_['rew']
cue(w0, 1092, 'accent', 1, dur=w1 - w0 + 0.15, fade=0.2, gain=-8, what='bande qui rembobine')
for k in range(7): cue(E_['flaps'] + 0.08 + 0.05 * k + 0.1, 1119, 'tick', 3, pan=-0.3 + 0.1 * k, what=f'palette {k + 1}')
# mardi : cinq cartes entrent dans la pochette, une par temps (une note qui monte), puis tombent dedans
for k, (x, xd) in enumerate(zip(E_['mdocs'], E_['mdrops'])):
    cue(x, 2369, 'orn', 2, st=[0, 2, 4, 5, 7][k], dur=0.45, gain=-3, what=f'pochette : carte {k + 1}')
    cue(xd, 2380, 'tick', 3, dur=0.3, gain=2, what=f'pochette : carte {k + 1} rangée')
cue(E_['l2'] + 0.2, 1107, 'chime', 2, gain=-4, what='« 2 ans pour rouler »')     # la ligne entre une fois le bandeau agrandi
cue(E_['total'], 3005, 'orn', 2, dur=0.18, what='trait de total')
cue(E_['total'] + 0.3, 2384, 'ui', 2, gain=-3, what='« Pochette : 78 € »')
cue(E_['l6'] + 0.2, 1107, 'chime', 2, st=3, gain=-4, what='« < 6 mois à sa carte grise »')
cue(E_['achat'] + 0.2, 1490, 'whoosh', 3, start=0.35, gain=-5, pan=0.3, peak=True, what='contrôle d\'achat (arrive)')
cue(E_['strike'], 2998, 'ui', 2, dur=0.3, gain=-3, what='contrôle d\'achat barré')
cue(E_['refait'], 2369, 'orn', 2, st=2, dur=0.6, gain=-2, what='« refait le 6 oct. » s\'écrit')
cue(E_['eclair'], 3005, 'orn', 2, st=3, dur=0.18, what='« tu le refais » : le bandeau du contrôle s\'allume')
cue(E_['close'], 1105, 'ui', 2, start=0.26, dur=0.25, rev=True, gain=-2, what='le rabat se ferme')
cue(E_['pret'], 2182, 'accent', 1, start=0.06, dur=0.12, gain=-4, what='tampon PRÊTE (coup)')
cue(E_['pret'], 2380, 'tick', 1, st=2, dur=0.4, gain=10, what='tampon PRÊTE (papier)')     # répond à VENDUE
# la boucle : tout se replie dans l'image 0
cue(E_['loop'], 3120, 'whoosh', 2, dur=0.8, lead=0.08, what='retour à l\'image 0')

# priorité : un son moins prioritaire qui attaque à moins de 0,12 s d'un plus prioritaire est retiré (pas baissé)
CUES.sort(key=lambda c: c['tc'])
kept, dropped = [], []
for c in CUES:
    clash = [o for o in CUES if o is not c and not o['bed'] and not c['bed'] and abs(o['tc'] - c['tc']) < 0.12 and o['prio'] < c['prio']]
    (dropped if clash else kept).append(c)
fx = np.zeros((N, 2))
def put(y, t, pan):
    i = int(round(t * SR))
    if i < 0: y = y[-i:]; i = 0
    y = y[:max(0, N - i)]
    p = (np.clip(pan, -1, 1) + 1) * np.pi / 4
    fx[i:i + len(y), 0] += y * np.cos(p); fx[i:i + len(y), 1] += y * np.sin(p)
for c in kept:
    pk, lo, hi = ROLE[c['role']]
    put(bp(c['y'], lo, hi, 2) * db(pk + c['gain']), c['t'], c['pan'])

# moteur de la C3 qui part par la gauche (méthode MO5/MO10) : la fin d'un passage, régime qui monte, du centre vers
# la gauche ; la seconde sortie s'éteint avec la musique sur « 20 min »
y_eng = load(A('bank', 'mo5', 'sfx-1538.mp3'))
fr = librosa.util.frame(np.pad(y_eng, (0, 2048)), frame_length=2048, hop_length=512)
pk_src = int(np.argmax(np.sqrt((fr ** 2).mean(0)))) * 512
def varrate(seg, r0, r1):
    L_ = int(len(seg) / ((r0 + r1) / 2)); p = np.cumsum(np.linspace(r0, r1, L_)); p = p[p < len(seg) - 1]
    i = np.floor(p).astype(int); f = p - i; return seg[i] * (1 - f) + seg[i + 1] * f
eng = varrate(y_eng[max(0, pk_src - int(0.35 * SR)):pk_src + int(1.1 * SR)], 1.0, 1.3)
eng = librosa.effects.pitch_shift(eng, sr=SR, n_steps=3)
eng = bp(eng, 150, 9000)
e = np.ones(len(eng)); e[:int(0.1 * SR)] = np.linspace(0, 1, int(0.1 * SR)) ** 1.5; e[-int(0.5 * SR):] = np.linspace(1, 0, int(0.5 * SR)) ** 1.2
eng = eng * e / np.abs(eng).max() * db(ROLE['engine'][0] - 2)
fr = librosa.util.frame(np.pad(eng, (0, 2048)), frame_length=2048, hop_length=512)
ipk = int(np.argmax(np.abs(fr).max(0))) * 512 / SR
def depart(t_go, until=None):
    s0 = t_go + 0.3 - ipk                                         # le pic quand la C3 file vers le bord
    seg = eng.copy(); tt = s0 + np.arange(len(seg)) / SR
    if until is not None: seg *= np.interp(tt, [until - 0.08, until], [1, 0])
    pan = np.interp(tt, [t_go, t_go + 0.6], [0.0, -0.7])
    i = int(round(s0 * SR)); seg = seg[:N - i]; pan = pan[:len(seg)]
    fx[i:i + len(seg), 0] += seg * np.cos((pan + 1) * np.pi / 4); fx[i:i + len(seg), 1] += seg * np.sin((pan + 1) * np.pi / 4)
depart(E_['go'])
depart(E_['go2'], until=T_STOP + 0.05)
# vibrations (MO5) : la bulle « Je suis devant. » vibre (trois secousses en 0,25 s), celle du beau-frère aussi ; le
# téléphone, deux fois, au virement
def buzz(dur, gap=None):
    tv = np.arange(int(dur * SR)) / SR
    b = np.sin(2 * np.pi * 165 * tv) * (np.sin(2 * np.pi * 24 * tv) > 0)
    if gap: b *= (tv < gap[0]) | (tv > gap[1])
    return bp(b, 120, 3000) * np.minimum(1, np.minimum(tv, dur - tv) / 0.01)
put(buzz(0.25) * db(-15), E_['shake'], 0.0)
put(buzz(0.25) * db(-18), E_['croit'], 0.3)                       # la bulle du beau-frère tremble (« il n'y croit pas »)
put(buzz(0.6, (0.22, 0.34)) * db(-16), E_['recu'] - 0.02, 0.2)
# tic-tac de l'attente (MO5) : l'horloge hésite, de la fin de « virement. » à la notification
clk = sfx(1063)
i0, i1 = int(T_W0 * SR), int((T_W1 - 0.15) * SR)
seg = np.tile(clk, 2 + (i1 - i0) // len(clk))[:i1 - i0]
seg = bp(seg, 1500, 12000) * db(ROLE['tick'][0] + 1) * np.interp(np.arange(len(seg)), [0, 0.2 * SR, len(seg) - 0.2 * SR, len(seg)], [0, 1, 1, 0])
fx[i0:i0 + len(seg), 0] += seg * 0.9; fx[i0:i0 + len(seg), 1] += seg

# les bruitages cèdent aussi à la voix (−7 dB pendant qu'elle parle)
fx *= (1 - (1 - db(-7)) * d2)[:, None]
# réverbération courte commune aux bruitages (ils sonnent dans la même pièce)
ir = np.random.default_rng(5).standard_normal(int(0.45 * SR)) * np.exp(-np.arange(int(0.45 * SR)) / (0.08 * SR))
ir = bp(ir, 300, 7000); ir /= np.sqrt((ir ** 2).sum())
for ch in range(2): fx[:, ch] += fftconvolve(fx[:, ch], ir)[:N] * db(-15)

# ---------- étages de crête (round 3, méthode de audio-mo13.py) ----------
# Voix provisoire muette : la normalisation remonte tout d'environ 15 dB, et les coups de la batterie comme les notes
# des cartes passaient le plafond du limiteur de 9 à 10 dB (22 % du film à plus de 3 dB de réduction : la musique
# pompait sous chaque note). Musique : compresseur doux (moyenné sur 10 ms) puis détecteur de crête (attaque 3 ms,
# relâche 150 ms, 4:1), qui lisent la musique sans sa courbe d'élan (elle monte toujours jusqu'au chiffre) ; même étage,
# plus rapide, sur le bus des bruitages. Seuils en dBFS avant normalisation. Seulement sans voix : avec la vraie prise,
# le gain de normalisation baisse, à remesurer.
MUS_SOFT = float(os.environ.get('MUS_SOFT', -28)); MUS_THR = float(os.environ.get('MUS_THR', -22))
FX_THR = float(os.environ.get('FX_THR', -24))
def comp_gain(det, thr=-14, ratio=1.8):
    """Gain (dB) du compresseur doux : enveloppe moyennée sur 10 ms, sans attaque ni relâche."""
    envl = np.abs(det); envl = envl.max(1) if envl.ndim > 1 else envl
    k = int(0.01 * SR); envl = np.convolve(envl, np.ones(k) / k, 'same')
    l = 20 * np.log10(envl + 1e-9); return np.where(l > thr, (thr + (l - thr) / ratio) - l, 0)
def pcomp_gain(det, thr, ratio, att=0.003, rel=0.15, look=0.003):
    """Gain (dB) du compresseur de crête : crête anticipée de look, attaque att, relâche rel."""
    a = np.abs(det); a = a.max(1) if a.ndim > 1 else a
    pk = -minimum_filter1d(-a, size=2 * int(look * SR) + 1)
    l = 20 * np.log10(pk + 1e-9); gt = np.where(l > thr, (thr + (l - thr) / ratio) - l, 0.0)
    a_, r_ = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR)); out = np.empty_like(gt); s_ = 0.0
    for i, v in enumerate(gt):
        s_ = a_ * s_ + (1 - a_) * v if v < s_ else r_ * s_ + (1 - r_) * v
        out[i] = s_
    return out
if not VO_ON:
    _lv = db(LV['lvl'])
    g_c = comp_gain(mus / _lv, thr=MUS_SOFT, ratio=2.5)
    g_p = pcomp_gain(mus * db(g_c) / _lv, thr=MUS_THR, ratio=4)
    MUS_G = db(g_c + g_p); mus = mus * MUS_G; mus_ref = mus_ref * MUS_G
    FX_GDB = pcomp_gain(fx, thr=FX_THR, ratio=3, att=0.001, rel=0.08, look=0.002); fx = fx * db(FX_GDB)[:, None]
    PK_REP = (f'étages de crête (sans voix ; doux {MUS_SOFT:.0f}, crête {MUS_THR:.0f}, bruitages {FX_THR:.0f} dBFS) : musique '
              f'{np.median(g_c + g_p):.1f} dB en médiane, {np.percentile(g_c + g_p, 5):.1f} dB au 95e centile ; '
              f'bruitages {FX_GDB.min():.1f} dB au plus')

# ---------- somme, compression douce, loudness ----------
mus_st = np.stack([mus, mus], 1)
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
GR = np.ones(N)                            # réduction de gain cumulée du limiteur (pour le rapport)
def limit(x, ceil_db=-4.0, look=0.004, rel=0.08, track=False):
    # limiteur à anticipation : la réduction de gain commence 4 ms avant la crête et relâche en 80 ms
    c = db(ceil_db); pk = np.abs(x).max(1)
    need = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    la = int(look * SR); g = minimum_filter1d(need, size=2 * la + 1)
    r = np.exp(-1 / (rel * SR)); out = np.empty_like(g); s_ = 1.0
    for i, v in enumerate(g):
        s_ = v if v < s_ else r * s_ + (1 - r) * v
        out[i] = s_
    if track: GR[:len(out)] *= out
    return x * out[:, None]
gain_total = 0.0
for _ in range(4):
    gl = -14 - meter.integrated_loudness(mix); mix *= db(gl); gain_total += gl
    mix = limit(mix, -5.0, track=True)
truepeak = lambda x: 20 * np.log10(np.abs(librosa.resample(x.T, orig_sr=SR, target_sr=4 * SR)).max())
tp = truepeak(mix)
if tp > -3.5: mix *= db(-3.5 - tp)
# 2 ms de fondu aux deux bouts : la boucle ne claque pas, l'attaque reste à l'image 0
f = int(0.002 * SR); mix[:f] *= np.linspace(0, 1, f)[:, None]; mix[-f:] *= np.linspace(1, 0, f)[:, None]
os.makedirs(A('stems-mo12'), exist_ok=True)
sf.write(A(f'mix-mo12{TAG}.wav'), mix, SR, subtype='PCM_24')
g = db(gain_total)
# les pistes sont prises avant compression et limiteur : un gain commun les garde sous −1 dBFS (sans écrêter), même
# équilibre entre elles ; il est noté dans le rapport
STEMS = [('voix', vo_st), ('musique', mus_st), ('bruitages', fx)]
h = min(1.0, db(-1) / max(np.abs(x * g).max() for _, x in STEMS))
for name, x in STEMS: sf.write(A('stems-mo12', f'{name}{TAG}.wav'), x * g * h, SR, subtype='PCM_24')
# version sans musique (voix + bruitages) pour juger le sound design nu
nm = (vo_st + fx) * g; nm *= db(-14 - meter.integrated_loudness(nm)); nm = limit(nm, -5.0)
sf.write(A('stems-mo12', f'sans-musique{TAG}.wav'), nm, SR, subtype='PCM_24')

# ---------- mesures, relues sur les fichiers écrits ----------
mixw, _ = sf.read(A(f'mix-mo12{TAG}.wav')); musw, _ = sf.read(A('stems-mo12', f'musique{TAG}.wav'))
fxw, _ = sf.read(A('stems-mo12', f'bruitages{TAG}.wav')); vow, _ = sf.read(A('stems-mo12', f'voix{TAG}.wav'))
musw, fxw, vow = musw / h, fxw / h, vow / h                      # mesures à l'échelle du mix
Lm = meter.integrated_loudness(mixw)
rep = [f'MO12 {HOOK} · mix : {Lm:.1f} LUFS intégrés, true peak {truepeak(mixw):.1f} dBTP (4× suréchantillonné, avant AAC) ; '
       f'pistes séparées écrites à {20 * np.log10(h):+.1f} dB du mix (gain commun, aucune n\'écrête)',
       f'gain de normalisation {gain_total:+.1f} dB ; limiteur (plafond −5 dBFS) : réduction max '
       + ', '.join(f'{20 * np.log10(GR[i]):.1f} dB à {i / SR:.2f} s' for i in
                   sorted({int(np.argmin(GR[j:j + SR // 2])) + j for j in range(0, N, SR // 2)}, key=lambda i: GR[i])[:4])
       + f' ; {100 * (GR < db(-3)).mean():.1f} % du film à plus de 3 dB ; '
       + f'{int(np.count_nonzero(np.diff((GR < db(-6)).astype(np.int8)) == 1))} coups à plus de 6 dB',
       f'minutage : {"PROVISOIRE (voix " + str(VT.get("take")) + ", muette)" if not VO_ON else "voix " + str(VT.get("take"))} · film-mo12/events.json '
       f'{"provisoire" if EV.get("provisional") else "définitif"} · durée {DUR:.2f} s',
       *([PK_REP] if not VO_ON else []),
       f'bruitages placés : {len(kept)} (+ moteur ×2, vibrations ×3, tic-tac) · retirés pour collision : {len(dropped)} '
       + ', '.join(f"{c['i']}@{c['tc']:.2f} ({c['what']})" for c in dropped)]
# l'attaque à 0 s
fr1 = int(SR / FPS)
first_hit = int(np.argmax(np.abs(musw[:int(0.5 * SR)]).max(1) > 0.5 * np.abs(musw[:int(0.5 * SR)]).max())) / SR
def lufs(x):
    try: return meter.integrated_loudness(x)
    except Exception: return float('nan')
rep.append(f'attaque : 1re image {rms_db(mixw[:fr1]):.1f} dBFS RMS, 0–0,1 s {rms_db(mixw[:int(0.1 * SR)]):.1f}, 0–0,5 s '
           f'{rms_db(mixw[:int(0.5 * SR)]):.1f} ; musique dès l\'échantillon 0 ({rms_db(musw[:fr1]):.1f} dBFS sur la 1re image), '
           f'premier temps (mesure 13) à {first_hit:.3f} s (grille : {OFF:.3f} s) ; 2 premières secondes {lufs(mixw[:2 * SR]):.1f} LUFS '
           f'contre {lufs(mixw[2 * SR:]):.1f} sur le reste')
tail = mixw[-int(0.1 * SR):]; head = mixw[:int(0.1 * SR)]
rep.append(f'boucle : 0,1 s avant la fin {rms_db(tail):.1f} dBFS → 0,1 s du début {rms_db(head):.1f} dBFS ; grille : dernier temps '
           f'de la reprise à {T_BACK + BEAT * np.floor((DUR - T_BACK) / BEAT):.2f} s, premier temps du début à {OFF:.2f} s')
# l'arrêt de bande : premier échantillon où la musique écrite quitte la même musique sans arrêt
refw = np.stack([mus_ref, mus_ref], 1) * g
a_, b_ = int((T_STOP - 0.5) * SR), int((T_STOP + 0.4) * SR)
res = np.abs(musw[a_:b_, 0] - refw[a_:b_, 0]); lvl_ref = np.sqrt((refw[a_:int(T_STOP * SR), 0] ** 2).mean())
t_stop = (a_ + int(np.argmax(res > 0.01 * lvl_ref))) / SR
k10 = int(0.01 * SR); e10 = np.sqrt(np.convolve(musw[:, 0] ** 2, np.ones(k10) / k10, 'same'))
after = np.arange(int(T_STOP * SR), int(EV['rw'][0] * SR))
t_sil = after[np.argmax(e10[after] < db(-60))] / SR
rep.append(f'arrêt de bande : {t_stop:.3f} s, « 20 min » à l\'écran {T_BIG:.3f} s → écart {(t_stop - T_BIG) * FPS:+.2f} image '
           f'(tolérance ±1) ; musique sous −60 dBFS à {t_sil:.3f} s ; « Vingt minutes » dit à {mk("vingt2"):.2f} s ; '
           f'« 20 min » sur le temps {round((T_BIG - OFF) / BEAT) + 1} de la grille (mesure {13 + int((T_BIG - OFF) // 2)})')
# la reprise : attaque de la mesure 55
seg = musw[int((T_BACK - 0.05) * SR):int((T_BACK + 0.25) * SR), 0]
tpl = (m2[int((PRE - 0.002) * SR):int((PRE + 0.15) * SR)])
xc = np.correlate(seg, tpl, 'valid'); t_back = T_BACK - 0.05 + int(np.argmax(xc)) / SR + 0.002
rep.append(f'reprise : mesure 55 à {t_back:.3f} s (premier temps visé {T_BACK:.3f} s), « Mardi » dit à {mk("mardi"):.2f} s, '
           f'cartes de la pochette à ' + ', '.join(f'{x:.2f}' for x in EV['mdocs']) + ' s (sur les temps) ; basse de retour à '
           f'{T_BASS:.2f} s (notification {T_W1:.2f} s) ; attaques mesurées dans le morceau : mesure 13 à {(A13 - 13 * BAR_SRC) * 1000:+.0f} ms, '
           f'mesure 55 à {(A55 - 55 * BAR_SRC) * 1000:+.0f} ms de la mesure théorique')
# réglage téléphone et attente, mesurés sur la piste musique écrite (filtres d'analyse à phase nulle)
from scipy.signal import sosfiltfilt
mm = musw[:, 0]
sub = lambda x, fc: sosfiltfilt(butter(6, fc, 'lp', fs=SR, output='sos'), x)
L150, L200 = sub(mm, 150), sub(mm, 200)
pre = slice(int((T_W0 - 2.0) * SR), int(T_W0 * SR)); dur_w = slice(int((T_W0 + 0.4) * SR), int((T_W1 - 0.02) * SR))
rep.append(f'musique : {100 * (L150 ** 2).sum() / (mm ** 2).sum():.0f} % de l\'énergie sous 150 Hz (téléphone) ; pendant l\'attente, '
           f'grave < 200 Hz {rms_db(L200[dur_w]) - rms_db(L200[pre]):+.1f} dB et niveau {rms_db(mm[dur_w]) - rms_db(mm[pre]):+.1f} dB '
           f'par rapport aux 2 s qui précèdent')
# RMS par temps (brief, « L'histoire en 7 temps ») : mix, musique, bruitages
Lk = {l['key']: l for l in LINES}
TEMPS = [(0, EV['r1'][0], 'la scène'), (EV['r1'][0], EV['essaiOut'], 'retour, essai'), (EV['essaiOut'], EV['phone'], 'les papiers'),
         (EV['phone'], T_W1, 'l\'attente'), (T_W0, T_W1, '  dont silence'), (T_W1, EV['cles'], 'signatures, gag'),
         (EV['cles'], T_STOP, 'la chute'), (T_STOP + 0.25, EV['rew'][0], 'la pause'), (EV['rew'][0], T_BACK, 'rembobinage'),
         (T_BACK, VT['loop'], 'mardi, pochette'), (VT['loop'], DUR, 'la boucle')]
rep.append(f'{"RMS (dBFS)":26s} {"mix":>7s} {"musique":>8s} {"bruitages":>10s}')
for a_, b_, nm_ in TEMPS:
    sl = slice(int(a_ * SR), int(b_ * SR))
    rep.append(f'  {nm_:16s} {a_:5.2f}–{b_:5.2f} {rms_db(mixw[sl]):7.1f} {rms_db(musw[sl]):8.1f} {rms_db(fxw[sl]):10.1f}')
# la voix devant : écart voix/musique (≥ 4 dB, médiane ≈ 10) et voix/bruitages (≥ 7 dB) par réplique
if VO_ON:
    gm, gf = [], []
    for l in LINES:
        sl = slice(int(l['t'] * SR), int(l['end'] * SR))
        gm.append(rms_db(vow[sl]) - rms_db(musw[sl])); gf.append(rms_db(vow[sl]) - rms_db(fxw[sl]))
    rep.append(f'voix/musique par réplique : min {min(gm):.1f} dB, médiane {np.median(gm):.1f} dB ; voix/bruitages : min {min(gf):.1f} dB '
               f'({LINES[int(np.argmin(gf))]["key"]}), médiane {np.median(gf):.1f} dB')
else:
    rep.append('voix/musique et voix/bruitages : non mesurables (voix provisoire muette) ; le ducking jouera dès la vraie voix')
open(os.path.join(ROOT, 'docs', f'mix_report-mo12{TAG}.txt'), 'w').write('\n'.join(rep) + '\n')
print('\n'.join(rep))
