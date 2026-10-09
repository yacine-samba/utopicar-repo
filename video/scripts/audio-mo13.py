"""MO13 « Avec 1 500 € » : voix, musique et bruitages mixés (méthode .claude/skills/motion-studio/references/sound-design.md,
modèle scripts/audio-mo9.py).

Voix   : audio/vo-mo13/vo-placed.wav, posée sur le film par scripts/vo-mo13.py. Tant que la prise n'existe pas (compte
         ElevenLabs bloqué), c'est la piste muette du mode --provisoire : le script tourne pareil ; nivellement par
         réplique, ducking par bande et écarts voix/musique s'activent d'eux-mêmes quand la vraie voix est posée.
         Ouverture A seulement : film-mo13/events.json est celui du film A (scripts/events.mjs ne lit pas ?hook=B).
Musique: audio/music/Controlled Drop.mp3, recalée à 120 BPM, les passages de MO5 : mesure 13 dès l'image 0, grille calée
         pour que l'arrêt tombe sur un temps (le premier temps de la mesure 13 sur la première image, ou juste avant).
         L'élan : la musique monte d'un cran à chaque virement (le compteur grandit, elle aussi) ; la tentation
         (SEMAINE 8 → 11) retire la basse et passe le son sous 1 400 Hz, l'aigu revient avec les messages, la basse sur
         le premier temps de la bulle « 2 950 » ; arrêt de bande quand « 3 100 € » géant est posé : la seule pause, en
         silence ; la bande rembobine avec l'histoire, remontée à l'envers, puis mesure 55 dont le premier temps tombe
         sur la première ligne de la méthode (une ligne par temps) ; fondu de boucle.
         Chaque premier temps est recalé sur l'attaque réelle du morceau (mesurée), pas sur la mesure théorique.
Bruits : audio/bank/mo13 (5 sons Mixkit, SOURCES.tsv) et les banques de MO5, MO6, MO8 ; un son par geste, attaché à son
         repère de film-mo13/events.json (CUT=mo13 node scripts/events.mjs), rôle, priorité et panoramique ; un son
         principal à la fois. Moteurs (départ, arrivée et freinage) et vibrations fabriqués comme dans MO9 et MO12.
Sortie : audio/mix-mo13.wav (lu par render.mjs), audio/stems-mo13/{voix,musique,bruitages,sans-musique}.wav,
         docs/mix_report-mo13.txt
Aucun temps n'est recopié : tout vient de audio/vo-mo13/vo-timing.json et de film-mo13/events.json.
"""
import os, json, shutil, subprocess, tempfile, re
import numpy as np, librosa, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, sosfiltfilt, fftconvolve
from scipy.ndimage import minimum_filter1d

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
FPS = 60                                   # rendu final à 60 i/s : la tolérance d'« une image » vaut 1/60 s
VT_PATH, EV_PATH = A('vo-mo13', 'vo-timing.json'), os.path.join(ROOT, 'film-mo13', 'events.json')
VT = json.load(open(VT_PATH))
EV = json.load(open(EV_PATH))
# events.json doit venir du même minutage que la voix (sinon : relancer CUT=mo13 node scripts/events.mjs)
for k in ('dur', 'loop'):
    if EV.get(k) != VT.get(k):
        raise SystemExit(f'film-mo13/events.json périmé ({k} : film {EV.get(k)} ≠ voix {VT.get(k)}) : '
                         'relancer « CUT=mo13 node scripts/events.mjs » après la pose de la voix')
if EV.get('hook', 'A') != 'A':
    raise SystemExit('film-mo13/events.json vient de l\'ouverture B : ce mix est celui de l\'ouverture A')
STALE = os.path.getmtime(VT_PATH) > os.path.getmtime(EV_PATH) + 1
DUR = VT['dur']
N = int(round(DUR * SR))
LOOP = VT['loop']
mark = lambda k, end=False: VT['marks'][k]['end' if end else 't'] if k in VT.get('marks', {}) else None

# ---------- les instants qui règlent la musique ----------
T_BIG = EV['big']                          # le compteur atteint 3 100 et se fond dans « 3 100 € » géant (film : T.big)
T_STOP = EV['stop']                        # « 3 100 € » géant posé, l'image s'arrête : arrêt de bande, la seule pause
BEAT, BAR = 0.5, 2.0                       # 120 BPM
OFF = T_STOP % BEAT                        # la grille : l'arrêt tombe sur un temps
# premier temps de la mesure 13 : sur la grille, à la première image ou juste avant (le son attaque à 0 s)
B13 = OFF if OFF <= 0.12 else OFF - BEAT
next_beat = lambda t: OFF + BEAT * np.ceil((t - OFF) / BEAT - 1e-9)
REW = EV['rew']                            # rembobinage (film : REW)
T_BACK = EV['lignes'][0]                   # mesure 55 : son premier temps écrit la première ligne de la méthode
T_T0 = EV['sem8']                          # la tentation : SEMAINE 8 → 11
T_MSG = EV['msg'][0]                       # les messages « Toujours dispo ? » : l'aigu revient
T_BUB = EV['bub3']                         # la bulle « 2 950 et je la prends » : la basse revient sur le temps qui suit
T_BASS = next_beat(T_BUB - 0.03)
V1, V2, V3 = EV['ventes']                  # les trois virements : la musique monte d'un cran à chaque fois

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
vo = load(A('vo-mo13', 'vo-placed.wav'))[:N]
vo = np.pad(vo, (0, N - len(vo)))
vo = bp(vo, 80, 14000)
LINES = VT['lines']
VO_ON = np.abs(vo).max() > 1e-4            # faux tant que la voix est la piste muette du mode provisoire
# chaque réplique ramenée au même niveau (± 6 dB max) : la voix ne disparaît jamais
if VO_ON:
    lv = [np.sqrt((vo[int(l['t'] * SR):int(l['end'] * SR)] ** 2).mean() + 1e-12) for l in LINES]; ref = np.median(lv)
    for l, r_ in zip(LINES, lv):
        a_, b_ = int((l['t'] - 0.03) * SR), int((l['end'] + 0.05) * SR)
        vo[a_:b_] *= np.clip(ref / r_, db(-6), db(6))

# ---------- musique ----------
src = load(A('music', 'Controlled Drop.mp3'))
RATE = 120 / 123.05                        # 1 mesure = 2,000 s (étirement de 2,5 %)
BAR_SRC = 4 * 60 / 123.05
def stretch(seg):
    return librosa.effects.time_stretch(seg, rate=RATE)
def attack(m):
    """Attaque réelle du premier temps de la mesure m (s, dans le morceau) : franchissement de la moitié du maximum
    local de l'enveloppe (2 ms), dans ± 60 ms autour de la mesure théorique."""
    a = int((m * BAR_SRC - 0.06) * SR); seg = np.abs(src[a:a + int(0.12 * SR)])
    k = int(0.002 * SR); e = np.convolve(seg, np.ones(k) / k, 'same')
    return (a + int(np.argmax(e > 0.5 * e.max()))) / SR
PRE = 0.004                                # 4 ms gardées avant chaque attaque (rien n'est coupé dans le transitoire)
A13, A55 = attack(13), attack(55)
s1 = A13 - B13 * RATE                      # l'attaque de la mesure 13 tombe sur B13
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
    # la bande rembobine avec l'histoire (film : REW) : la montée qui précède l'arrêt, à l'envers, deux fois plus vite
    r0, r1 = REW
    L = int((r1 - r0) * SR)
    rw = m1[max(0, iS - 2 * L):iS][::-1]
    rw = np.interp(np.linspace(0, len(rw) - 1, L), np.arange(len(rw)), rw)
    rw = bp(rw, 300, 6000) * np.interp(np.arange(L), [0, 0.15 * SR, L - 0.2 * SR, L], [0, 1, 1, 0]) * db(-8)
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

# Bandes séparées par filtres de Linkwitz-Riley d'ordre 4 : grave et aigu restent en phase et leur somme est plate,
# donc une bande baissée l'est vraiment (la soustraction « x − passe-bas(x) » de audio-mo9.py laisse passer la basse
# à cause du retard de phase : mesuré dans la session MO12, −1 dB à 60 Hz au lieu de −9).
def lr4(x, fc):
    lo = butter(2, fc, 'lowpass', fs=SR, output='sos'); hi = butter(2, fc, 'highpass', fs=SR, output='sos')
    return sosfilt(np.vstack([lo, lo]), x), sosfilt(np.vstack([hi, hi]), x)
def shelf(x, fc, g_lo=1.0, g_hi=1.0):
    """Gains (constants ou courbes) sous et au-dessus de fc."""
    lo, hi = lr4(x, fc)
    return lo * g_lo + hi * g_hi

PHONE = {}
def music_shape(mus, keep=False):
    """Mise en scène, ducking par bande, réglage téléphone : identique pour la musique et sa référence sans arrêt."""
    # la tentation : la basse sort et le son passe sous 1 400 Hz ; l'aigu revient avec les messages, la basse sur le
    # premier temps qui suit la bulle « 2 950 »
    lo_cut = env_curve([(0, 1), (T_T0, 1), (T_T0 + 0.4, 0), (T_BASS - 0.03, 0), (T_BASS + 0.01, 1), (DUR, 1)])
    mus = shelf(mus, 200, g_lo=lo_cut)
    dark = env_curve([(0, 0), (T_T0, 0), (T_T0 + 0.4, 1), (T_MSG - 0.02, 1), (T_MSG + 0.12, 0), (DUR, 0)])
    mus = shelf(mus, 1400, g_hi=1 - dark)
    # l'élan : attaque à l'image 0, un cran de plus à chaque virement jusqu'au chiffre ; retrait sous le gag
    # (bruitage seul) ; creux de la tentation ; reprise pleine ; fondu de boucle
    g0, g1 = EV['gag'], EV['toi']
    lvl = (env_curve([(0, -1.5), (V1, -1.5), (V1 + 0.3, -1.0), (V2, -1.0), (V2 + 0.3, -0.5), (V3, -0.5), (V3 + 0.3, 0),
                      (T_STOP, 0.5), (T_STOP + 0.01, 0), (DUR - 0.6, 0), (DUR, -6)])
           + env_curve([(0, 0), (g0 - 0.05, 0), (g0 + 0.05, -2), (g1 + 0.4, -2), (g1 + 0.7, 0), (DUR, 0)])
           + env_curve([(0, 0), (T_T0, 0), (T_T0 + 0.4, -4), (T_MSG - 0.02, -4), (T_MSG + 0.12, 0), (DUR, 0)]))
    mus = mus * db(lvl)
    # ducking par bande sous la voix : présence (1,5–6 kHz) −10 dB, niveau −8 dB
    gP = 1 - (1 - db(-10)) * d2
    mus = shelf(shelf(mus, 1500, g_hi=gP), 6000, g_hi=1 / gP)
    mus *= 1 - (1 - db(-8)) * d2
    if keep: PHONE['avant'] = mus.copy()
    # téléphone : la basse allégée sous 150 Hz (−9 dB), passe-haut 45 Hz
    mus = shelf(mus, 150, g_lo=db(-9))
    mus = bp(mus, 45, None, 2)
    if keep: PHONE['apres'] = mus.copy()
    return mus * db(-6)

mus = music_shape(music_raw(), keep=True)
mus_ref = music_shape(music_raw(stop=False))

# ---------- bruitages (repérés sur l'image : film-mo13/events.json) ----------
BANKS = ['mo13', 'mo5', 'mo6', 'mo8']
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
    'accent': (-4, 40, 16000), 'ui': (-10, 400, 14000), 'chime': (-13, 500, 12000), 'whoosh': (-14, 250, 9000),
    'orn': (-17, 1500, 15000), 'tick': (-22, 1500, 12000), 'engine': (-11, 150, 9000), 'tool': (-15, 200, 10000),
    'thud': (-10, 40, 1000),               # le choc sourd (2150) : sous 1 kHz, comme la tentation
    'squeak': (-14, 200, 3000),            # le pneu qui couine sur la marche de verre (1013, SOURCES.tsv)
}
CUES = []
def cue(t, i, role, prio=2, st=0, dur=None, pan=0.0, gain=0, rev=False, start=0.0, fade=0.04, peak=False,
        bed=False, what=''):
    """Un son par geste : son attaque perçue (la moitié de sa première crête, pas le premier échantillon audible) tombe
    sur t. peak : le pic d'énergie du son (souffle) tombe sur t. rev / bed : le début du son tombe sur t (souffle
    inversé qui monte jusqu'au geste, nappe sans attaque hors règle de collision)."""
    y = sfx(i, st, dur, fade, rev, start)
    k = int(0.003 * SR); e = np.convolve(np.abs(y), np.ones(k) / k, 'same')
    if peak: off = int(np.argmax(e)) / SR
    elif rev or bed: off = 0.0
    else: e3 = e[:int(0.3 * SR)]; off = int(np.argmax(e3 >= 0.5 * e3.max())) / SR
    # tc : l'instant où le son se fait entendre, celui que compare la règle de collision (souffle aligné sur son pic :
    # son début)
    CUES.append(dict(t=t - off, tc=t - (off if peak else 0.0), i=i, role=role, prio=prio, y=y, pan=pan, gain=gain,
                     bed=bed, what=what))

E_ = EV
def flaps(t0, n, st=0, gap=0.04, prio=3, what='palettes'):
    """Palettes : un tic par case qui se retourne (le film retourne les cases à gap s d'écart, film-mo13/kit-mo13.js) ;
    le tic tombe quand la case se pose (≈ 0,1 s après son départ)."""
    for j in range(n): cue(t0 + 0.1 + gap * j, 1119, 'tick', prio, st=st, pan=-0.3 + 0.6 * j / max(1, n - 1), what=f'{what} {j + 1}')
def note_debit(x, k, what):
    """Un débit : la notification arrive de la droite (souffle), une note un demi-ton plus bas à chaque débit."""
    cue(x - 0.03, 1490, 'whoosh', 3, start=0.35, gain=-6, pan=0.4, peak=True, what=f'{what} (arrive)')
    cue(x, 2354, 'ui', 1, st=-k, pan=0.35, what=what)
def bulle(x, st, what):
    """Une bulle d'acheteur ou une annonce qui arrive : le pop (la vibration est fabriquée plus bas)."""
    cue(x + 0.03, 2356, 'ui', 2, st=st, start=0.03, dur=0.19, pan=0.3, what=what)
def virement(x, st, what):
    cue(x - 0.02, 1490, 'whoosh', 3, start=0.35, gain=-6, pan=0.45, peak=True, what=f'{what} (arrive)')
    cue(x + 0.03, 951, 'chime', 1, pan=0.2, what=what)
    cue(x + 0.05, 1107, 'chime', 1, st=st, gain=-4, pan=0.2, what=f'{what} (note)')   # une note par vente, qui monte
def tampon(x, what, note=None):
    cue(x, 2182, 'accent', 1, start=0.06, dur=0.12, gain=-10, what=f'{what} (coup)')
    cue(x, 2380, 'tick', 1, dur=0.4, gain=10, what=f'{what} (papier)')
    if note is not None: cue(x + 0.04, 2354, 'ui', 1, st=note, pan=0.1, what=f'{what} (note)')
KEYS = [(1558, 0.0, 0.6), (2838, 0.25, 0.42), (1558, 0.0, 0.6)]   # les clés, en alternance (SOURCES.tsv : 2838 0,27 → 0,67 s)

# l'ouverture : son calcul, la petite rouge d'en face
cue(E_['q'], 3005, 'orn', 2, st=5, pan=0.2, what='la plume repasse le « ? »')
cue(E_['sh'], 2589, 'orn', 2, st=3, dur=0.6, gain=-3, pan=-0.15, what='la lumière passe sur « 1 500 »')
cue(E_['focus'] + 0.4, 1436, 'whoosh', 2, start=0.6, dur=0.45, fade=0.12, gain=-6, peak=True, what='mise au point sur la 206')
cue(E_['contour'], 2589, 'orn', 2, dur=0.8, pan=-0.1, what='le contour de la 206 se trace')
cue(E_['tag'] + 0.1, 2369, 'orn', 2, dur=0.8, pan=-0.15, what='l\'étiquette « À VENDRE · 1 400 € » s\'écrit')
cue(E_['trem'], 2150, 'thud', 1, start=0.1, dur=0.3, gain=-4, what='« 8 500 € ? » tremble')
# marche 1 : le calcul se replie, « 1 500 » devient le compteur, palettes MARCHE 1 ; le prix max, la réserve
cue(E_['out'] + 0.1, 3120, 'whoosh', 2, dur=0.7, peak=True, what='le calcul se replie')
flaps(E_['flap1'], 6, what='palettes MARCHE 1')
cue(E_['hud'] + 0.3, 1054, 'tick', 2, dur=0.4, gain=6, what='les rouleaux s\'enclenchent')
for k, (x, xn) in enumerate(zip(E_['barres'], E_['prix'])):
    cue(x, 3005, 'orn', 2, st=-3, pan=-0.15, what=f'prix annoncé barré ({k + 1})')
    cue(xn, 2384, 'ui', 2, st=2 * k, pan=-0.1, what=f'prix payé écrit ✓ ({k + 1})')            # une note qui monte
for k, x in enumerate(E_['achats']):
    i, a_, d_ = KEYS[k]
    cue(x, i, 'tool', 2, start=a_, dur=d_, fade=0.15, pan=-0.1, what=f'achat {k + 1} : les clés')
cue(E_['max1'], 2369, 'orn', 3, dur=0.5, gain=-4, what='« prix max » s\'écrit')
# les frais de la marche 1 : deux débits, puis le gag seul et son tampon
for k, (x, what) in enumerate(zip(E_['debits'][:2], ['assurance − 40', 'carte grise − 152'])):
    note_debit(x, k, what)
    cue(x + 0.25, 1054, 'tick', 3, st=-1 - k, dur=0.4, gain=4, what=f'{what} : le compte roule')
cue(E_['gag'] - 0.03, 1490, 'whoosh', 3, start=0.35, gain=-6, pan=0.4, peak=True, what='gag (arrive)')
cue(E_['gag'], 2849, 'tool', 1, start=0.12, dur=0.35, fade=0.1, pan=0.3, what='gag : le pistolet de pompe décroché')
tampon(E_['toi'], 'tampon « toi aussi »', note=9)                                             # la note la plus haute
# vente 1, la caméra monte, marche 2 ; vente 2, marche 3 (les moteurs sont fabriqués plus bas)
for k, (xb, xv, st) in enumerate(zip(E_['bulles'][:2], E_['ventes'][:2], [0, 3])):
    bulle(xb, 2 * k, f'bulle {k + 1} « … et je la prends »')
    virement(xv, st, f'virement {k + 1}')
flaps(E_['sem3'], 7, what='palettes SEMAINE 3')
for k, x in enumerate([E_['up1'], E_['up2']]):
    cue(x, 1054, 'tick', 2, st=2 + 2 * k, dur=0.5, gain=6, what=f'le compte remonte ({k + 1})')
for k, x in enumerate(E_['aretes']):
    cue(x, 2589, 'orn', 2, dur=0.8, gain=-2, pan=-0.2, what=f'arête {k + 1} : « achat → revente ✓ »')
for k, x in enumerate(E_['montees']):
    cue(x + 0.17, 1492, 'whoosh', 3, st=3, dur=0.8, gain=-6, peak=True, what=f'la caméra monte d\'une marche ({k + 1})')
for k, x in enumerate(E_['freins']):
    cue(x, 1013, 'squeak', 3, st=-4, start=0.55, dur=0.12, fade=0.04, pan=0.15, what=f'le pneu couine sur la marche ({k + 2})')
for k, x in enumerate(E_['tickets']):
    cue(x, 1530, 'ui', 1, start=0.17, dur=0.23, pan=0.35, what=f'ticket de frais {k + 2} (papier)')
    cue(x, 2384, 'ui', 1, st=-2 - k, gain=-3, pan=0.35, what=f'ticket de frais {k + 2} (note)')
# la tentation : SEMAINE 8 → 11, de plus en plus lentes (une note plus basse à chaque semaine) ; l'annonce bute
for k, x in enumerate([E_['sem8'], E_['sem9'], E_['sem10'], E_['sem11']]):
    flaps(x, 2 if k >= 2 else 1, st=-k, what=f'palettes SEMAINE {8 + k}')
bulle(E_['ann'], -2, 'l\'annonce à 1 600 € arrive')
cue(E_['ann'] + 0.35 + 0.15, 1490, 'whoosh', 3, start=0.35, gain=-8, pan=0.15, peak=True, what='l\'annonce glisse vers le compte')
cue(E_['bump'], 2150, 'thud', 1, start=0.1, dur=0.3, what='l\'annonce bute sur les 150 €')
tampon(E_['une'], 'tampon « une à la fois »')
cue(E_['annOut'] + 0.15, 1490, 'whoosh', 2, start=0.35, gain=-6, pan=0.45, peak=True, what='l\'annonce repart')
for k, x in enumerate(E_['msg']):
    cue(x, 2356, 'ui', 2, st=[2, 4, 5, 7, 9][k % 5], start=0.03, dur=0.2, gain=-6, pan=0.25 * (-1) ** k, what=f'« Toujours dispo ? » {k + 1}')
flaps(E_['sem12'], 1, what='palettes SEMAINE 12')
# la vente 3, la chute : le compte roule jusqu'à 3 100, la caméra recule, « 3 100 € » géant, l'arrêt
bulle(E_['bulles'][2], 4, 'bulle 3 « 2 950 et je la prends »')
virement(E_['ventes'][2], 5, 'virement 3')
cue(E_['up3'], 1054, 'tick', 2, st=5, dur=1.0, gain=6, what='le compte roule 150 → 3 100')
cue(E_['pull'], 3120, 'whoosh', 2, dur=T_STOP - E_['pull'], rev=True, gain=-4, what='la caméra recule (souffle inversé jusqu\'à l\'arrêt)')
cue(T_STOP, 2909, 'accent', 1, dur=0.7, fade=0.35, gain=-2, what='« 3 100 € » posé')
cue(T_STOP + 0.04, 1107, 'chime', 1, st=7, gain=-2, what='« 3 100 € » (note)')
# la seule pause : « Tu attendais d'avoir 10 000. » s'écrit
cue(E_['att'], 2369, 'orn', 2, dur=0.8, gain=-3, what='« Tu attendais d\'avoir » s\'écrit')
cue(E_['att2'], 2369, 'orn', 2, st=3, dur=0.45, gain=-4, what='« 10 000. » s\'écrit')
# rembobinage, la carte, une ligne par temps, le verdict, la boucle
cue(REW[0], 1092, 'accent', 1, dur=REW[1] - REW[0] + 0.15, fade=0.2, gain=-8, what='bande qui rembobine')
cue(E_['card'] + 0.05, 1490, 'whoosh', 3, st=-2, start=0.35, gain=-6, peak=True, what='la carte se pose')
cue(E_['card'] + 0.15, 2369, 'orn', 3, dur=0.6, gain=-5, what='« budget − réserve = prix max » s\'écrit')
for k, x in enumerate(E_['lignes'][:3]):
    cue(x, 2384, 'ui', 2, st=2 * k, gain=-3, what=f'ligne {k + 1} de la carte')                # une note par temps
cue(E_['step4'], 2589, 'orn', 2, st=7, dur=0.6, gain=-2, what='la 4e marche s\'allume')
cue(E_['lignes'][3], 2384, 'ui', 2, st=5, gain=-3, what='ligne 4 « 3 100 − 600 = »')
cue(E_['claque'], 2909, 'accent', 1, dur=1.0, gain=-3, what='« prix max 2 500 € » claque')
cue(E_['claque'] + 0.02, 1107, 'chime', 1, st=5, gain=-3, what='« prix max 2 500 € » (note)')
cue(E_['loop'] + 0.1, 3120, 'whoosh', 2, dur=0.8, peak=True, what='tout se replie vers l\'image 0')

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

# moteurs (méthode MO9 et MO12), un timbre par voiture (206 1.1 : +3 demi-tons ; Mégane 1.6 : +1 ; Fiesta 1.25 : +2)
y_eng = load(A('bank', 'mo5', 'sfx-1538.mp3'))
def varrate(seg, r0, r1):
    L_ = int(len(seg) / ((r0 + r1) / 2)); p = np.cumsum(np.linspace(r0, r1, L_)); p = p[p < len(seg) - 1]
    i = np.floor(p).astype(int); f = p - i; return seg[i] * (1 - f) + seg[i + 1] * f
def finish(eng, st, a, r):
    eng = librosa.effects.pitch_shift(eng, sr=SR, n_steps=st)
    eng = bp(eng, ROLE['engine'][1], ROLE['engine'][2])
    e = np.ones(len(eng)); e[:int(a * SR)] = np.linspace(0, 1, int(a * SR)) ** 1.5; e[-int(r * SR):] = np.linspace(1, 0, int(r * SR)) ** 1.2
    eng = eng * e / np.abs(eng).max() * db(ROLE['engine'][0] - 2)
    fr = librosa.util.frame(np.pad(eng, (0, 2048)), frame_length=2048, hop_length=512)
    return eng, int(np.argmax(np.abs(fr).max(0))) * 512 / SR       # le son, et l'instant de son pic
fr_ = librosa.util.frame(np.pad(y_eng, (0, 2048)), frame_length=2048, hop_length=512)
pk_src = int(np.argmax(np.sqrt((fr_ ** 2).mean(0)))) * 512
def put_moving(seg, s0, pan_pts):
    tt = s0 + np.arange(len(seg)) / SR
    pan = np.interp(tt, *zip(*pan_pts))
    i = int(round(s0 * SR))
    if i < 0: seg, pan, i = seg[-i:], pan[-i:], 0
    seg = seg[:N - i]; pan = pan[:len(seg)]
    fx[i:i + len(seg), 0] += seg * np.cos((pan + 1) * np.pi / 4); fx[i:i + len(seg), 1] += seg * np.sin((pan + 1) * np.pi / 4)
ENG_ST = [3, 1, 2]
def depart(t_go, st, until=None):
    """La voiture part par la gauche : régime qui monte, du centre vers la gauche, pic quand elle file vers le bord."""
    eng, ipk = finish(varrate(y_eng[max(0, pk_src - int(0.35 * SR)):pk_src + int(1.1 * SR)], 1.0, 1.3), st, 0.1, 0.5)
    s0 = t_go + 0.3 - ipk
    if until is not None:
        tt = s0 + np.arange(len(eng)) / SR; eng = eng * np.interp(tt, [until - 0.08, until], [1, 0])
    put_moving(eng, s0, [(t_go, 0.0), (t_go + 0.6, -0.7)])
def arrivee(t_in, t_brake, st):
    """La voiture entre par la droite et freine sur sa marche : régime qui monte, puis redescend, pic au freinage."""
    ea = varrate(y_eng[int(0.15 * SR):int(1.2 * SR)], 0.95, 1.35); eb = varrate(y_eng[int(1.2 * SR):int(2.7 * SR)], 1.15, 0.85)
    xf = int(0.04 * SR)
    eng = np.concatenate([ea[:-xf], ea[-xf:] * np.linspace(1, 0, xf) + eb[:xf] * np.linspace(0, 1, xf), eb[xf:]])
    eng, ipk = finish(eng, st, 0.25, 0.6)
    put_moving(eng, t_brake - ipk, [(t_in, 0.85), (t_brake, 0.0)])
for k, x in enumerate(E_['departs']):
    depart(x, ENG_ST[k], until=T_STOP + 0.03 if x < T_STOP < x + 2.5 else None)   # la Fiesta se tait avec l'arrêt
for k, (x, xb) in enumerate(zip(E_['arrivees'], E_['freins'])):
    arrivee(x, xb, ENG_ST[k + 1])
# vibrations (MO9) : chaque bulle d'acheteur et l'annonce vibrent (trois secousses en 0,25 s)
def buzz(dur, gap=None):
    tv = np.arange(int(dur * SR)) / SR
    b = np.sin(2 * np.pi * 165 * tv) * (np.sin(2 * np.pi * 24 * tv) > 0)
    if gap: b *= (tv < gap[0]) | (tv > gap[1])
    return bp(b, 120, 3000) * np.minimum(1, np.minimum(tv, dur - tv) / 0.01)
for x in E_['bulles']: put(buzz(0.25) * db(-15), x, 0.3)
put(buzz(0.25) * db(-17), E_['ann'], 0.3)

# les bruitages cèdent aussi à la voix (−7 dB pendant qu'elle parle)
fx *= (1 - (1 - db(-7)) * d2)[:, None]
# réverbération courte commune aux bruitages (ils sonnent dans la même pièce)
ir = np.random.default_rng(5).standard_normal(int(0.45 * SR)) * np.exp(-np.arange(int(0.45 * SR)) / (0.08 * SR))
ir = bp(ir, 300, 7000); ir /= np.sqrt((ir ** 2).sum())
for ch in range(2): fx[:, ch] += fftconvolve(fx[:, ch], ir)[:N] * db(-15)

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
os.makedirs(A('stems-mo13'), exist_ok=True)
sf.write(A('mix-mo13.wav'), mix, SR, subtype='PCM_24')
g = db(gain_total)
# les pistes sont prises avant compression et limiteur : un gain commun les garde sous −1 dBFS (sans écrêter), même
# équilibre entre elles ; il est noté dans le rapport
STEMS = [('voix', vo_st), ('musique', mus_st), ('bruitages', fx)]
h = min(1.0, db(-1) / max(np.abs(x * g).max() for _, x in STEMS))
for name, x in STEMS: sf.write(A('stems-mo13', f'{name}.wav'), x * g * h, SR, subtype='PCM_24')
# version sans musique (voix + bruitages) pour juger le sound design nu
nm = (vo_st + fx) * g; nm *= db(-14 - meter.integrated_loudness(nm)); nm = limit(nm, -5.0)
sf.write(A('stems-mo13', 'sans-musique.wav'), nm, SR, subtype='PCM_24')

# ---------- mesures, relues sur les fichiers écrits ----------
mixw, _ = sf.read(A('mix-mo13.wav')); musw, _ = sf.read(A('stems-mo13', 'musique.wav'))
fxw, _ = sf.read(A('stems-mo13', 'bruitages.wav')); vow, _ = sf.read(A('stems-mo13', 'voix.wav'))
musw, fxw, vow = musw / h, fxw / h, vow / h                      # mesures à l'échelle du mix
Lm = meter.integrated_loudness(mixw)
def lufs(x):
    try: return meter.integrated_loudness(x)
    except Exception: return float('nan')
rep = [f'MO13 A · mix : {Lm:.1f} LUFS intégrés, true peak {truepeak(mixw):.1f} dBTP (4× suréchantillonné, avant AAC) ; '
       f'pistes séparées écrites à {20 * np.log10(h):+.1f} dB du mix (gain commun, aucune n\'écrête)']
# l'AAC ajoute jusqu'à 2 dB sur les crêtes : contrôle sur un encodage AAC 256 k (le vrai contrôle reste celui du MP4)
if shutil.which('ffmpeg'):
    with tempfile.TemporaryDirectory() as td:
        m4a = os.path.join(td, 'mix.m4a')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', A('mix-mo13.wav'), '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', m4a], check=True)
        eb = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', m4a, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
        summ = eb[eb.rfind('Summary'):]
        rep[0] += (f' ; après AAC 256 k : {float(re.findall(r"I:\s+(-?[\d.]+) LUFS", summ)[0]):.1f} LUFS, '
                   f'true peak {float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", summ)[0]):.1f} dBTP (cible MP4 ≤ −1)')
rep.append(f'gain de normalisation {gain_total:+.1f} dB ; limiteur (plafond −5 dBFS) : réduction max '
           + ', '.join(f'{20 * np.log10(GR[i]):.1f} dB à {i / SR:.2f} s' for i in
                       sorted({int(np.argmin(GR[j:j + SR // 2])) + j for j in range(0, N, SR // 2)}, key=lambda i: GR[i])[:4])
           + f' ; {100 * (GR < db(-3)).mean():.1f} % du film à plus de 3 dB')
rep.append(f'minutage : {"PROVISOIRE (voix " + str(VT.get("take")) + ", muette)" if not VO_ON else "voix " + str(VT.get("take"))} · '
           f'durée {DUR:.2f} s, boucle {LOOP:.2f} s'
           + (' · ATTENTION : vo-timing.json est plus récent que film-mo13/events.json (relancer CUT=mo13 node scripts/events.mjs)' if STALE else ''))
by_role = {}
for c in kept: by_role[c['role']] = by_role.get(c['role'], 0) + 1
rep.append(f'bruitages placés : {len(kept)} (' + ', '.join(f'{r} {n}' for r, n in sorted(by_role.items(), key=lambda x: -x[1]))
           + f') + moteurs (3 départs, 2 arrivées), vibrations ×{len(E_["bulles"]) + 1} · retirés pour collision : {len(dropped)}'
           + ('' if not dropped else ' : ' + ', '.join(f"{c['i']}@{c['tc']:.2f} ({c['what']})" for c in dropped)))
# l'attaque à 0 s
fr1 = int(SR / FPS)
seg0 = np.abs(musw[:int(0.3 * SR)]).max(1); k3 = int(0.003 * SR); e0 = np.convolve(seg0, np.ones(k3) / k3, 'same')
first_hit = int(np.argmax(e0 > 0.5 * e0.max())) / SR
rep.append(f'attaque : 1re image {rms_db(mixw[:fr1]):.1f} dBFS RMS, 0–0,1 s {rms_db(mixw[:int(0.1 * SR)]):.1f}, 0–0,5 s '
           f'{rms_db(mixw[:int(0.5 * SR)]):.1f} ; musique dès l\'échantillon 0 ({rms_db(musw[:fr1]):.1f} dBFS sur la 1re image), '
           f'premier temps de la mesure 13 entendu à {first_hit:.3f} s (visé {B13:.3f} s) ; 2 premières secondes '
           f'{lufs(mixw[:2 * SR]):.1f} LUFS contre {lufs(mixw[2 * SR:]):.1f} sur le reste (qa_video : écart ≤ 8)')
# l'arrêt de bande : premier échantillon où la musique écrite quitte la même musique sans arrêt
refw = np.stack([mus_ref, mus_ref], 1) * g
a_, b_ = int((T_STOP - 0.5) * SR), int((T_STOP + 0.4) * SR)
res = np.abs(musw[a_:b_, 0] - refw[a_:b_, 0]); lvl_ref = np.sqrt((refw[a_:int(T_STOP * SR), 0] ** 2).mean())
t_stop = (a_ + int(np.argmax(res > 0.01 * lvl_ref))) / SR
k10 = int(0.01 * SR); e10 = np.sqrt(np.convolve(musw[:, 0] ** 2, np.ones(k10) / k10, 'same'))
after = np.arange(int(T_STOP * SR), int(REW[0] * SR))
t_sil = after[np.argmax(e10[after] < db(-60))] / SR
bar_stop = (T_STOP - B13) / BAR
rep.append(f'arrêt de bande : {t_stop:.3f} s ; « 3 100 € » géant posé {T_STOP:.3f} s → écart {(t_stop - T_STOP) * FPS:+.2f} image '
           f'(tolérance ±1 à {FPS} i/s) ; le compteur touche 3 100 à {T_BIG:.3f} s ; musique sous −60 dBFS à {t_sil:.3f} s, '
           f'silence jusqu\'au rembobinage ({REW[0]:.2f} s) ; « trois mille cent » dit {mark("b3100"):.2f}–{mark("b3100", True):.2f} s ; '
           f'arrêt sur le temps {int(round((bar_stop % 1) * 4)) + 1} de la mesure {13 + int(bar_stop)}')
# la reprise : attaque de la mesure 55, et la méthode sur la grille
seg = musw[int((T_BACK - 0.05) * SR):int((T_BACK + 0.25) * SR), 0]
tpl = m2[int((PRE - 0.002) * SR):int((PRE + 0.15) * SR)]
xc = np.correlate(seg, tpl, 'valid'); t_back = T_BACK - 0.05 + int(np.argmax(xc)) / SR + 0.002
grid2 = lambda t: (t - T_BACK) - BEAT * round((t - T_BACK) / BEAT)
rep.append(f'reprise : mesure 55 à {t_back:.3f} s (premier temps visé {T_BACK:.3f} s = ligne 1 de la carte) ; lignes de la carte '
           + ', '.join(f'{x:.2f} s ({grid2(x) * 1000:+.0f} ms du temps)' for x in E_['lignes'])
           + f' ; « prix max 2 500 € » claque {E_["claque"]:.2f} s ({grid2(E_["claque"]) * 1000:+.0f} ms du temps, '
           f'premier temps de la mesure 56 à {T_BACK + BAR:.2f} s) ; attaques mesurées dans le morceau : mesure 13 à '
           f'{(A13 - 13 * BAR_SRC) * 1000:+.0f} ms, mesure 55 à {(A55 - 55 * BAR_SRC) * 1000:+.0f} ms de la mesure théorique')
grid1 = lambda t: (t - OFF) - BEAT * round((t - OFF) / BEAT)
rep.append('grille de l\'élan : ' + ', '.join(f'{nm_} {x:.2f} s ({grid1(x) * 1000:+.0f} ms)' for nm_, x in
           [('calcul replié', E_['out']), ('virement 1', V1), ('virement 2', V2), ('SEMAINE 8', T_T0), ('virement 3', V3), ('« Budget »', mark('budget') or V3)])
           + f' ; basse de retour à {T_BASS:.2f} s (bulle « 2 950 » {T_BUB:.2f} s)')
tail = mixw[-int(0.1 * SR):]; head = mixw[:int(0.1 * SR)]
last_beat = T_BACK + BEAT * np.floor((DUR - T_BACK) / BEAT)
rep.append(f'boucle : 0,1 s avant la fin {rms_db(tail):.1f} dBFS → 0,1 s du début {rms_db(head):.1f} dBFS ; dernier temps de la '
           f'reprise à {last_beat:.2f} s, fin à {DUR:.2f} s, premier temps du début à {B13:.3f} s : '
           f'{(DUR - last_beat + B13) * 1000:.0f} ms entre les deux temps de la jointure (500 sur la grille), masqués par le fondu de boucle (−6 dB) '
           f'et le souffle du repli')
# réglage téléphone et tentation, mesurés sur la piste musique (filtres d'analyse à phase nulle)
mm = musw[:, 0]
sub = lambda x, fc: sosfiltfilt(butter(6, fc, 'lp', fs=SR, output='sos'), x)
L150, L200 = sub(mm, 150), sub(mm, 200)
pa, pb = PHONE['avant'], PHONE['apres']
drop150 = rms_db(sub(pb, 150)) - rms_db(sub(pa, 150)); drop100 = rms_db(sub(pb, 100)) - rms_db(sub(pa, 100))
pre = slice(int((T_T0 - 2.0) * SR), int(T_T0 * SR)); dur_w = slice(int((T_T0 + 0.4) * SR), int((T_MSG - 0.02) * SR))
H1400 = sosfiltfilt(butter(6, 1400, 'hp', fs=SR, output='sos'), mm)
rep.append(f'musique : réglage téléphone {drop150:+.1f} dB sous 150 Hz ({drop100:+.1f} dB sous 100 Hz), {100 * (L150 ** 2).sum() / (mm ** 2).sum():.0f} % '
           f'de son énergie sous 150 Hz ; pendant la tentation ({T_T0:.2f}–{T_MSG:.2f} s), grave < 200 Hz '
           f'{rms_db(L200[dur_w]) - rms_db(L200[pre]):+.1f} dB, aigu > 1 400 Hz {rms_db(H1400[dur_w]) - rms_db(H1400[pre]):+.1f} dB, '
           f'niveau {rms_db(mm[dur_w]) - rms_db(mm[pre]):+.1f} dB par rapport aux 2 s qui précèdent')
Y = np.abs(np.fft.rfft(mixw.mean(1))) ** 2; frq = np.fft.rfftfreq(N, 1 / SR)
rep.append(f'mix (téléphone, mesure de qa_video) : {100 * Y[frq < 150].sum() / Y.sum():.0f} % de l\'énergie sous 150 Hz, '
           f'{100 * Y[(frq >= 1000) & (frq < 5000)].sum() / Y.sum():.1f} % entre 1 et 5 kHz')
# RMS par temps (brief, « L'histoire en 7 temps ») : mix, musique, bruitages
TEMPS = [(0, E_['out'], 'le calcul'), (E_['out'], E_['debits'][0] - 0.05, 'marche 1'), (E_['debits'][0] - 0.05, T_T0, 'la montée'),
         (T_T0, T_MSG, 'la tentation'), (T_MSG, T_BUB, '  messages'), (T_BUB, T_STOP, 'la chute'),
         (T_STOP + 0.25, E_['att'], 'la seule pause'), (E_['att'], REW[0], '  « 10 000 »'), (REW[0], T_BACK, 'rembobinage'),
         (T_BACK, LOOP, 'la méthode'), (LOOP, DUR, 'la boucle')]
rep.append(f'{"RMS (dBFS)":28s} {"mix":>7s} {"musique":>8s} {"bruitages":>10s}')
for a_, b_, nm_ in TEMPS:
    sl = slice(int(a_ * SR), int(b_ * SR))
    rep.append(f'  {nm_:16s} {a_:5.2f}–{b_:5.2f} {rms_db(mixw[sl]):7.1f} {rms_db(musw[sl]):8.1f} {rms_db(fxw[sl]):10.1f}')
# la voix devant : écart voix/musique (≥ 4 dB, médiane ≈ 10) et voix/bruitages (≥ 7 dB) par réplique
if VO_ON:
    gm, gf = [], []
    for l in LINES:
        sl = slice(int(l['t'] * SR), int(l['end'] * SR))
        gm.append(rms_db(vow[sl]) - rms_db(musw[sl])); gf.append(rms_db(vow[sl]) - rms_db(fxw[sl]))
    rep.append(f'voix/musique par réplique : min {min(gm):.1f} dB ({LINES[int(np.argmin(gm))]["key"]}), médiane {np.median(gm):.1f} dB ; '
               f'voix/bruitages : min {min(gf):.1f} dB ({LINES[int(np.argmin(gf))]["key"]}), médiane {np.median(gf):.1f} dB')
else:
    rep.append('voix/musique et voix/bruitages : non mesurables (voix provisoire muette) ; le ducking jouera dès la vraie voix')
open(os.path.join(ROOT, 'docs', 'mix_report-mo13.txt'), 'w').write('\n'.join(rep) + '\n')
print('\n'.join(rep))
