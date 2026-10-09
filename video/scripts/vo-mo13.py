"""MO13 « Avec 1 500 € » : pose la voix off de Simon et en déduit la durée du film (≈ 31,4 s).

Sans prise (ElevenLabs a bloqué le compte le 9 octobre 2026) :
    python3 scripts/vo-mo13.py --provisoire [--unite syllabes|mots] [--debit …] [--pause-int …] [--coupes 0-2] [--essai]
        → audio/vo-mo13/vo-timing.json ("provisional": true), vo-placed.wav et vo-placed-B.wav muets, de la durée du film
Avec la prise (une seule génération, déposée en audio/vo-mo13/takeA.mp3) :
    python3 scripts/vo-mo13.py takeA.mp3 [--retenue] [--modele medium|small] [--retranscrire] [--coupes 0-2] [--sans-verif]
        → words.json, vo-placed-takeA.wav, vo-timing-takeA.json, vo-placed-B.wav (ouverture B à la place de A)
          --retenue : vo-placed.wav, vo-timing.json, durée dans timeline-mo13.json, puis retranscription de la pose
    python3 scripts/vo-mo13.py --calibre      → refait la mesure du débit sur les voix posées de MO9 et MO10

Méthode de MO9 et MO10 (scripts/vo-mo9.py, vo-mo10.py) : répliques définies par leurs mots, découpées aux pauses de
plus de 0,3 s, morceaux coupés au plus près du signal (−34 dB), pauses internes ramenées au maximum de la réplique,
accélération atempo (timbre conservé), × 1,2 au plus (retour « trop rapide » sur MO9 à × 1,25), 0,2 à 0,4 s entre
les phrases. Comme MO11 et MO12 (scripts/vo-mo11.py, vo-mo12.py) :
- les indices de mots des répliques ne sont pas recopiés à la main : le texte de chaque réplique est aligné sur la
  transcription (faster-whisper medium, en cache ; small s'il manque) ; les indices trouvés s'affichent, une réplique
  mal alignée se corrige dans SPAN, les bornes d'un mot dans FIX, après écoute ;
- les bornes des mots sont recalées sur l'enveloppe de la prise (trames de 20 ms) avant la pose : leçon de MO10,
  medium place parfois un mot 0,8 s trop tard ;
- la pose est retranscrite à la fin (--retenue) : aucun mot coupé ;
- les coupes du brief (--coupes 1, 2) s'appliquent si le film dépasse 31,5 s, sans regénérer ;
- le mode provisoire pose les mêmes répliques aux mêmes ancres, avec une durée estimée, au même format et avec les
  mêmes repères : le film (film-mo13/) se monte dessus et se recale seul quand la prise arrive.
Propre à MO13 : « mille quatre » s'écrit 1 400 (PARLE) ; l'ouverture B tient en deux répliques qui remplacent les
trois de A, et la version B n'a pas de réplique de boucle (brief, « Version B »).
"""
import argparse, difflib, json, os, re, subprocess, sys, tempfile, unicodedata
from pathlib import Path
import numpy as np, soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
D0 = ROOT / 'audio/vo-mo13'
D = Path(os.environ.get('VO_DIR', D0))                       # VO_DIR : essai dans un autre dossier
SR = 48000
DUR = 34.0                                                   # place de travail ; la durée du film est calculée à la fin
PLAFOND = 31.5                                               # MO9 : 31,4 s ; au-delà, les coupes du brief

# Le texte exact de la génération (brief-mo13.md, « Texte ElevenLabs ») : Simon, eleven_v3, generations_count 1.
VOIX, MODELE_TTS = 'mvhJVdVoTWVUtL4keT7W', 'eleven_v3'
TEXTE = """Dix mille pour ta première revente ? Tu en as mille cinq cents. [deadpan] La petite rouge d'en face demande mille quatre.
Tu gardes trois cents à côté.
Assurance, carte grise, essence.
Elle part à mille neuf cents.
La première paie la deuxième.
Une affaire passe.
Budget : [short pause] trois mille cent.
[deadpan] Et tu attendais d'avoir dix mille.
Ceux qui gagnent refont le calcul à chaque vente.
Ta quatrième : deux mille cinq cents max.
La prochaine fois que tu te dis…
[pause]
Tu pars avec mille cinq cents. Trois voitures plus tard : trois mille cent."""
# Comment un nombre écrit se dit quand ce n'est pas la lecture usuelle : « 1 400 » se dit « mille quatre ».
PARLE = {'1400': 'mille quatre'}

E = lambda k, v: float(os.environ.get(k, v))
TH, TV, TC, TF, TL = E('TH', 1.15), E('TV', 1.2), E('TC', 1.15), E('TF', 1.2), E('TL', 1.15)  # ouverture, montée, chute, méthode, boucle

# Répliques : (clé, texte écrit avec chiffres (sous-titres), ancre, tempo, pause interne max).
# Ancre : t fixe ; ('max', t, g) = t du brief, ou g s après la fin de la précédente si elle déborde ;
#         ('+', g) ; ('at', 'mot', t) = le mot tombe à t ; ('after', clé, g) = g s après le début de cette réplique.
# Les t sont ceux de la timeline du brief (brief-mo13.md, « La timeline seconde par seconde » et « La voix »).
LINES = [
    ('h1', "10 000 pour ta première revente ?", 0.10, TH, 0.1),
    ('h2', "Tu en as 1 500.", ('max', 1.65, 0.3), TH, 0.1),
    ('h3', "La petite rouge d'en face demande 1 400.", ('max', 2.85, 0.3), TH, 0.15),
    ('res', "Tu gardes 300 à côté.", ('max', 5.00, 0.3), TV, 0.12),           # marche 1 (palettes 4,8 s), puis la voix
    ('frais', "Assurance, carte grise, essence.", ('max', 6.75, 0.3), TV, 0.35),   # un débit par mot : laisser respirer
    ('part', "Elle part à 1 900.", ('max', 10.40, 0.3), TV, 0.12),            # après le gag seul (9,0 → 10,1)
    ('paie', "La première paie la deuxième.", ('max', 13.00, 0.3), TV, 0.12),  # la 206 part, la caméra monte, la Mégane
    ('affaire', "Une affaire passe.", ('max', 16.60, 0.3), TC, 0.1),          # le ticket, la vente, la Fiesta : sans voix
    ('budget', "Budget : 3 100.", ('max', 20.05, 1.2), TC, 0.35),             # la tentation : 2,6 s sans voix
    ('att', "Et tu attendais d'avoir 10 000.", ('max', 22.35, 0.8), TC, 0.12),  # la seule pause (0,8 s), sous « 3 100 € »
    ('ceux', "Ceux qui gagnent refont le calcul à chaque vente.", ('max', 24.25, 0.3), TF, 0.12),   # sur le rembobinage
    ('quat', "Ta quatrième : 2 500 max.", ('max', 27.00, 0.3), TF, 0.2),
    ('proch', "La prochaine fois que tu te dis…", ('max', 29.66, 0.3), TL, 0.12),
]
OUVERTURE = ('h1', 'h2', 'h3', 'hB1', 'hB2')
# Ouverture B, dite à la fin de la même prise après « [pause] » : hB1 et hB2 remplacent h1, h2 et h3 ; la version B
# n'a pas de réplique de boucle (« proch ») : le film finit sur la carte complète, qui se replie en l'image 0 de B.
HOOK_B = [
    ('hB1', "Tu pars avec 1 500.", 0.10, TH, 0.1),
    ('hB2', "Trois voitures plus tard : 3 100.", ('+', 0.3), TH, 0.2),
]
SANS_B = ('h1', 'h2', 'h3', 'proch')
FOLD = 0.9            # la carte et l'escalier se replient en 0,9 s vers l'image 0 (brief : 30,5 → 31,4)
FOLD_B = 0.5          # version B : repli en 0,5 s, sans réplique de boucle (brief : 30,5 → 31,0)
TAIL = 0.2            # le film finit 0,2 s après « dis… » : avec « Dix » à 0,10 s, 0,3 s entre les phrases à la boucle
GAP = 0.3             # entre deux phrases, au moins (ancres 'max', mode provisoire)

# Coupes du brief si le film dépasse 31,5 s, dans cet ordre (--coupes k applique les k premières), sans regénérer :
# d'abord la pause interne de la réplique 9 (« Budget : … »), ramenée à 0,08 s ; puis le silence de la tentation
# raccourci de 0,8 s (2,6 → 1,8 s : toutes les ancres à partir de « Budget » avancent). Jamais la seule pause.
COUPES = [('budget', 'pause', 0.08), ('budget', 'avance', 0.8)]

# Repères du film : clé → (réplique, mot écrit sans accent ni ponctuation). film-mo13 lit leurs temps dans
# vo-timing.json (marks[clé].t = début du mot, .end = sa fin). Le geste de chaque repère : brief-mo13.md, timeline.
MARKS = dict(
    dix=('h1', '10000'), revente=('h1', 'revente'),                  # image 0 ; le « ? » est écrit
    tuenas=('h2', 'tu'), b1500=('h2', '1500'),                       # la lumière passe sur « 1 500 » du brouillon
    petite=('h3', 'petite'), rouge=('h3', 'rouge'),                  # mise au point sur la 206, son contour se trace
    demande=('h3', 'demande'), b1400=('h3', '1400'),                 # l'étiquette « À VENDRE · 1 400 € » ; « 8 500 € ? » tremble
    marche1=('res', 'tu'), gardes=('res', 'gardes'),                 # le jour 1 de MO13 : « 1 400 € » se barre
    n300=('res', '300'), cote=('res', 'cote'),                       # « 1 200 € ✓ prix max » ; COMPTE 1 500 → 300 ; « réserve »
    assurance=('frais', 'assurance'), carte=('frais', 'carte'),      # les coups nommés : débit assurance, débit carte grise,
    grise=('frais', 'grise'), essence=('frais', 'essence'),          # le gag « Essence · elle était sur la réserve »
    elle=('part', 'elle'), part=('part', 'part'), b1900=('part', '1900'),   # la vente : bulle, virement + 1 900, l'arête
    premiere=('paie', 'premiere'), paie=('paie', 'paie'),            # 1 550 file du compte vers l'étiquette de la Mégane
    deuxieme=('paie', 'deuxieme'),
    une=('affaire', 'une'), affaire=('affaire', 'affaire'), passe=('affaire', 'passe'),   # l'annonce arrive et bute
    budget=('budget', 'budget'), b3100=('budget', '3100'),           # le chiffre final : COMPTE → 3 100, « 3 100 € » géant
    et=('att', 'et'), attendais=('att', 'attendais'),                # la chute : « Tu attendais d'avoir 10 000. »
    davoir=('att', 'davoir'), dixmille=('att', '10000'),
    ceux=('ceux', 'ceux'), gagnent=('ceux', 'gagnent'), refont=('ceux', 'refont'),     # la méthode : la carte se remplit
    calcul=('ceux', 'calcul'), chaque=('ceux', 'chaque'), vente=('ceux', 'vente'),
    ta=('quat', 'ta'), quatrieme=('quat', 'quatrieme'),              # le verdict : la marche vide, « prix max 2 500 € »
    b2500=('quat', '2500'), max=('quat', 'max'),
    prochaine=('proch', 'la'), dis=('proch', 'dis'),                 # la boucle
)
# Repères de l'ouverture B (vo-timing.json, hookB.marks) : le même film, seule la voix change avant « Tu gardes ».
MARKS_B = dict(
    parsB=('hB1', 'pars'), b1500B=('hB1', '1500'),
    troisB=('hB2', 'trois'), voituresB=('hB2', 'voitures'), tardB=('hB2', 'tard'), b3100B=('hB2', '3100'),
)
# Corrections à l'oreille, une fois la prise écoutée (indices de la transcription affichée) :
FIX = {}              # {indice: (début, fin)} en temps de prise, mesuré sur l'enveloppe à 20 ms
SPAN = {}             # {clé de réplique: (i0, i1)} si l'alignement automatique se trompe de mots

# Estimation provisoire : durée d'une réplique = syllabes dites / débit + pause par ponctuation interne, + correction
# d'ouverture, 0,55 s au moins (MO9 : « Il accepte. » 0,63 s) ; débit après accélération. Ajusté par --calibre sur les
# 25 répliques posées de MO9 et MO10 (même voix, mêmes tempos) : 5,90 syllabes/s + 0,45 s par ponctuation interne
# (écart type 0,25 s par réplique), ou 4,93 mots dits/s + 0,52 s (0,28 s). Les répliques d'ouverture vont plus vite
# que le modèle : − 0,09 s chacune en syllabes (− 0,20 s en mots).
# La règle « 2,6 mots dits par seconde » (--unite mots --debit 2.6 --pause-int 0) décrit un film entier, silences
# compris (MO5 : 65 mots pour 29,6 s) ; dans une réplique, Simon posé dit 3,5 mots par seconde pauses internes
# comprises, 4,9 hors pauses. Appliquée aux 77 mots dits de MO13, elle finit la voix à 34,7 s (film de 35,0 s, au-delà de 31,5 s).
DEBIT = {'syllabes': 5.90, 'mots': 4.93}
PAUSE_INT = {'syllabes': 0.45, 'mots': 0.52}
CORR_OUV = {'syllabes': -0.09, 'mots': -0.20}
PLANCHER = 0.55
PONCT = r'[,;:….?!]$'   # ponctuation interne : une pause dans la réplique


# ---------- le français dit ----------
_U = 'zéro un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize'.split()
_T = {2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante'}
_ESP = '   '                                       # espace, insécable, fine insécable


def n2w(n):
    """Un entier en toutes lettres (0 à 999 999), orthographe usuelle."""
    if n < 17: return _U[n]
    if n < 20: return 'dix-' + _U[n - 10]
    if n < 70:
        d, u = divmod(n, 10)
        return _T[d] + ('' if u == 0 else ' et un' if u == 1 else '-' + _U[u])
    if n < 80: return 'soixante' + (' et onze' if n == 71 else '-' + n2w(n - 60))
    if n < 100: return 'quatre-vingts' if n == 80 else 'quatre-vingt-' + n2w(n - 80)
    if n < 1000:
        c, r = divmod(n, 100)
        head = 'cent' if c == 1 else _U[c] + ' cent' + ('s' if r == 0 else '')
        return head + ('' if r == 0 else ' ' + n2w(r))
    m, r = divmod(n, 1000)
    head = 'mille' if m == 1 else re.sub(r'(cent|vingt)s$', r'\1', n2w(m)) + ' mille'
    return head + ('' if r == 0 else ' ' + n2w(r))


def dit(s):
    """Le texte tel qu'il se dit : nombres en lettres (« 2 500 » → « deux mille cinq cents »), avec les lectures de
    PARLE (« 1 400 » → « mille quatre »)."""
    s = re.sub(f'(\\d)[{_ESP}](?=\\d{{3}}\\b)', r'\1', s)
    for k, v in PARLE.items(): s = re.sub(rf'\b{k}\b', v, s)
    return re.sub(r'\d+', lambda m: n2w(int(m.group())), s)


def cle(s):
    """Minuscules sans accents, lettres et chiffres seulement."""
    s = unicodedata.normalize('NFD', s.lower())
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in s if not unicodedata.combining(c)))


def jetons(text):
    """Mots écrits d'une réplique ; un nombre à espaces (« 1 500. ») reste un seul jeton, la ponctuation isolée
    (« Budget : ») va avec le mot qui la précède."""
    out = []
    for j in re.findall(f'\\d{{1,3}}(?:[{_ESP}]\\d{{3}})+\\S*|\\S+', text):
        if out and not re.search(r'\w', j): out[-1] += ' ' + j
        else: out.append(j)
    return out


def mots_dits(s):
    """Mots tels qu'ils se disent, nombres en lettres ; un mot élidé (d'en, d'avoir) compte pour un."""
    return [w for w in dit(s).split() if re.search(r'\w', w)]


_VOY = 'aeiouyàâäéèêëîïôöùûüœæ'


def syllabes(mot):
    """Syllabes d'un mot dit : chaque groupe de voyelles prononcé, e muet final jamais, -ent des verbes muet."""
    m = re.sub(r"[^\w'\- ]", '', mot.lower()).replace("'", ' ').replace('-', ' ')
    n = 0
    for p in m.split():
        p = p.replace('qu', 'k').replace('gu', 'g')
        k = len(re.findall(f'[{_VOY}]+', p)) + len(re.findall(r'[ao]y[aeiouéèê]', p))
        if k > 1 and re.search(r'[^aeiouyéèêàâ](e|es)$', p): k -= 1
        elif k > 1 and re.search(r'[^aeiouy]ent$', p) and not p.endswith('ment'): k -= 1   # gagnent, pas virement
        n += max(1, k) if re.search(f'[{_VOY}]', p) else 0
    return max(1, n)


def ponct_int(text):
    """Ponctuations internes d'une réplique (la finale ne compte pas)."""
    return sum(1 for j in jetons(text)[:-1] if re.search(PONCT, j))


def texte(key):
    return next(L[1] for L in LINES + HOOK_B if L[0] == key)


def ref_tok(key, rang):
    return jetons(texte(key))[rang]


def verifie_texte():
    """Le texte des répliques (A puis B), dit, doit être exactement celui de la génération ; chaque repère vise un mot
    de sa réplique ; aucun tempo au-dessus de × 1,2."""
    a = cle(dit(' '.join(L[1] for L in LINES + HOOK_B)))
    b = cle(re.sub(r'\[[^\]]*\]', ' ', TEXTE))
    if a != b:
        i = next((k for k in range(min(len(a), len(b))) if a[k] != b[k]), min(len(a), len(b)))
        sys.exit(f'texte des répliques ≠ texte ElevenLabs vers « …{a[max(0, i - 20):i + 20]} » / « …{b[max(0, i - 20):i + 20]} »')
    for k, (key, w) in list(MARKS.items()) + list(MARKS_B.items()):
        if not any(cle(j) == w for j in jetons(texte(key))):
            sys.exit(f'repère {k} : « {w} » absent de la réplique {key}')
    for L in LINES + HOOK_B:
        if L[3] > 1.2: sys.exit(f'{L[0]} : tempo {L[3]}, × 1,2 au plus (MO9, « trop rapide » à × 1,25)')


def lignes(n_coupes):
    """LINES avec les n premières coupes du brief : [(clé, texte, ancre, tempo, pause interne, réduction de pause)].
    La réduction (s) sert au mode provisoire : la pause interne passe de la valeur de LINES à celle de la coupe."""
    C = COUPES[:n_coupes]
    out, avance = [], 0.0
    for key, text, anchor, tempo, inner in LINES:
        red = 0.0
        for k, quoi, v in C:
            if k != key: continue
            if quoi == 'pause': red, inner = max(0.0, inner - v), v
            if quoi == 'avance': avance = v
        if avance and isinstance(anchor, tuple) and anchor[0] == 'max': anchor = ('max', anchor[1] - avance, anchor[2])
        elif avance and isinstance(anchor, (int, float)): anchor = anchor - avance
        out.append((key, text, anchor, tempo, inner, red))
    return out


# ---------- placement ----------
def depart(anchor, t, lines, words):
    """Début d'une réplique : t = fin de la précédente, lines = répliques posées, words = [(jeton, début local, fin)]."""
    if isinstance(anchor, tuple) and anchor[0] == 'max':
        return max(anchor[1], t + anchor[2])
    if isinstance(anchor, tuple) and anchor[0] == 'at':
        return anchor[2] - next(w[1] for w in words if cle(w[0]) == anchor[1])
    if isinstance(anchor, tuple) and anchor[0] == 'after':
        return next(L['t'] for L in lines if L['key'] == anchor[1]) + anchor[2]
    if isinstance(anchor, tuple):
        return t + anchor[1]
    return anchor


def marques(M, where):
    """M (MARKS ou MARKS_B) → {clé: {line, t, end, w}} ; where(clé de réplique, rang du jeton) donne l'entrée du mot."""
    out = {}
    for k, (key, w) in M.items():
        rang = next(i for i, j in enumerate(jetons(texte(key))) if cle(j) == w)
        out[k] = where(key, rang)
    return out


def fin_du_film(timing, t_end):
    """Durée du film (0,2 s après la fin de la voix, arrondie au 1/20 s supérieur) et boucle (début du repli)."""
    timing['dur'] = round(float(np.ceil((t_end + TAIL) * 20) / 20), 2)
    timing['loop'] = round(timing['dur'] - FOLD, 2)
    return timing['dur']


def ouverture_b(timing, durees):
    """Pose de l'ouverture B : hB1 à 0,10 s, hB2 0,3 s après. durees = {clé: (durée, [(jeton, début, fin)])}, débuts
    et fins locaux à la réplique. Le film B finit sur la carte : boucle au même instant que A, repli en FOLD_B."""
    lines, words, pos, t = [], [], {}, 0.0
    for key, text, anchor, tempo, inner in HOOK_B:
        start = depart(anchor, t, lines, durees[key][1])
        d, ws = durees[key]
        lines.append({'key': key, 't': round(start, 3), 'end': round(start + d, 3), 'text': text})
        for rang, (w, a, b) in enumerate(ws):
            pos[key, rang] = {'line': key, 't': round(start + a, 3), 'end': round(start + b, 3), 'w': w}
            words.append(pos[key, rang])
        t = start + d
    B = {'t': lines[0]['t'], 'end': lines[-1]['end'], 'text': ' '.join(L['text'] for L in lines), 'lines': lines,
         'words': words, 'remplace': list(SANS_B), 'loop': timing['loop'], 'dur': round(timing['loop'] + FOLD_B, 2)}
    return B, pos


def controle(timing, L5):
    """Aucun chevauchement (0,2 s au moins entre deux phrases) ; tout ce qui précède la boucle finit avant elle ; la
    voix finit avant la fin du film ; l'ouverture B finit 0,2 s au moins avant « Tu gardes » ; le film tient sous le
    plafond ; la seule pause garde ses 0,8 s."""
    L, ok = timing['lines'], True
    for a, b in zip(L, L[1:]):
        if b['t'] < a['end'] + 0.2 - 1e-6:
            print(f"  ! {b['key']} commence {b['t'] - a['end']:.2f} s après la fin de {a['key']} (0,2 s au moins)"); ok = False
    if any(l['end'] > timing['loop'] for l in L[:-1]): print('  ! une réplique déborde sur la boucle'); ok = False
    if L[-1]['end'] > timing['dur'] - 0.1: print('  ! la voix dépasse la fin du film'); ok = False
    k = {l['key']: l for l in L}
    if 'budget' in k and 'att' in k and k['att']['t'] - k['budget']['end'] < 0.8 - 1e-6:
        print('  ! la seule pause (entre « 3 100 » et « Et tu attendais ») fait moins de 0,8 s'); ok = False
    B = timing.get('hookB')
    if B and 'res' in k and B['end'] > k['res']['t'] - 0.2:
        print(f"  ! l'ouverture B finit à {B['end']:.2f} s, trop près de « Tu gardes » ({k['res']['t']:.2f} s)"); ok = False
    if timing['dur'] > PLAFOND:
        print(f"  ! film de {timing['dur']} s : au-delà de {PLAFOND} s, relancer avec --coupes 1, puis 2"); ok = False
    for L0 in L:
        a = next(x for x in L5 if x[0] == L0['key'])[2]
        if isinstance(a, tuple) and a[0] == 'max' and L0['t'] > a[1] + 0.005:
            print(f"  · {L0['key']} posée à {L0['t']:.2f} s au lieu de {a[1]:.2f} s (la précédente déborde)")
    return ok


def resume(timing):
    for L in timing['lines']: print(f"{L['t']:6.2f}-{L['end']:6.2f} {L['key']:7} {L['text']}")
    B = timing.get('hookB')
    if B:
        for L in B['lines']: print(f"   B  {L['t']:6.2f}-{L['end']:6.2f} {L['key']:7} {L['text']}")
    parole = sum(L['end'] - L['t'] for L in timing['lines'])
    print(f"fin de la voix {timing['lines'][-1]['end']:.2f} s · parole {parole:.2f} s · boucle {timing['loop']} s · "
          f"film {timing['dur']} s" + (f" · version B {B['dur']} s" if B else ''))


# ---------- mode provisoire ----------
def estime(key, text, unite, debit, pause_int, corr, plancher, red=0.0):
    """Durée estimée d'une réplique et ses mots au prorata des syllabes : ([(jeton, début local, fin)], durée).
    red : pause interne retirée par une coupe (s), répartie sur ses ponctuations internes."""
    J = jetons(text)
    sy = [sum(syllabes(m) for m in mots_dits(j)) for j in J]
    n = sum(sy) if unite == 'syllabes' else sum(len(mots_dits(j)) for j in J)
    k = ponct_int(text)
    p = max(0.0, pause_int - (red / k if k else 0.0))
    d = max(plancher, n / debit + k * p + (corr if key in OUVERTURE else 0.0))
    u = (d - k * p) / sum(sy); words, x = [], 0.0
    for r, (j, s) in enumerate(zip(J, sy)):
        words.append((j, x, x + s * u)); x += s * u
        if r < len(J) - 1 and re.search(PONCT, j): x += p
    return words, d


def provisoire(unite, debit, pause_int, corr, plancher, n_coupes):
    """Chaque réplique à son ancre, durée estimée ; 0,3 s au moins entre les phrases ; même format que la prise."""
    timing = {'dur': DUR, 'take': 'provisoire', 'provisional': True, 'lines': [], 'words': [], 'marks': {},
              'estimate': {'unite': unite, 'debit': debit, 'pause_interne': pause_int, 'corr_ouverture': corr,
                           'plancher': plancher, 'entre_phrases': GAP, 'coupes': n_coupes,
                           'source': 'aucune prise : durées estimées par scripts/vo-mo13.py --provisoire (débit de '
                           'Simon après accélération, mesuré sur les voix posées de MO9 et MO10)'}}
    pos, t, L5 = {}, 0.0, lignes(n_coupes)
    for key, text, anchor, tempo, inner, red in L5:
        words, d = estime(key, text, unite, debit, pause_int, corr, plancher, red)
        start = depart(anchor, t, timing['lines'], words)
        if timing['lines'] and start < t + GAP - 1e-6:
            print(f'  ! {key} : à moins de {GAP} s de la réplique précédente, décalée')
            start = t + GAP
        for rang, (j, a, b) in enumerate(words):
            pos[key, rang] = {'line': key, 't': round(start + a, 3), 'end': round(start + b, 3), 'w': j}
            timing['words'].append(pos[key, rang])
        t = start + d
        timing['lines'].append({'key': key, 't': round(start, 3), 'end': round(t, 3), 'text': text})
    timing['marks'] = marques(MARKS, lambda key, rang: pos[key, rang])
    fin_du_film(timing, t)
    durees = {}
    for key, text, *_ in HOOK_B:
        words, d = estime(key, text, unite, debit, pause_int, corr, plancher); durees[key] = (d, words)
    timing['hookB'], posB = ouverture_b(timing, durees)
    timing['hookB']['marks'] = marques(MARKS_B, lambda key, rang: posB[key, rang])
    return timing, L5


# ---------- la prise : transcription, alignement, recalage ----------
def transcrire(path, modele):
    """Mots horodatés par faster-whisper ; le modèle demandé en cache, sinon téléchargé, sinon small en cache."""
    from faster_whisper import WhisperModel
    threads = int(os.environ.get('WHISPER_THREADS', 2))          # la machine est partagée
    m = None
    for nom, local in ((modele, True), (modele, False), ('small', True)):
        try:
            m = WhisperModel(nom, device='cpu', compute_type='int8', cpu_threads=threads, local_files_only=local)
            modele = nom; break
        except Exception as e:
            print(f'  faster-whisper {nom} ({"cache" if local else "téléchargement"}) indisponible : {str(e)[:80]}')
    if m is None: sys.exit('aucun modèle faster-whisper')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    segs, _ = m.transcribe(np.frombuffer(raw, np.float32), language='fr', word_timestamps=True, beam_size=5,
                           vad_filter=False)
    return [{'s': round(w.start, 2), 'e': round(w.end, 2), 'w': w.word.strip()} for s in segs for w in s.words], modele


def aligne(ref, hyp):
    """ref : [(clé de réplique, rang, jeton écrit)], hyp : mots de whisper. Alignement lettre à lettre, puis chaque
    mot de whisper va au seul jeton dont il partage le plus de lettres. Renvoie pour chaque jeton les indices (premier,
    dernier) de ses mots de whisper, ou None ; le jeton de chaque mot de whisper, ou None ; la part du texte retrouvée."""
    R, r_of = '', []
    for i, (_, _, j) in enumerate(ref):
        c = cle(dit(j)); R += c; r_of += [i] * len(c)
    hk = [cle(dit(w)) for w in hyp]
    for i in range(1, len(hk)):                                   # « 1 » « 500 » → « 1500 »
        if re.fullmatch(r'\d{3}[.,!?]?', hyp[i].strip()) and re.fullmatch(r'\d{1,3}', hyp[i - 1].strip()):
            hk[i - 1] = cle(dit(hyp[i - 1].strip() + hyp[i].strip())); hk[i] = ''
    H, h_of = '', []
    for i, c in enumerate(hk): H += c; h_of += [i] * len(c)
    cnt, n_ok = [{} for _ in hyp], 0
    for a, b, n in difflib.SequenceMatcher(None, R, H, autojunk=False).get_matching_blocks():
        for x in range(n):
            r = r_of[a + x]; d = cnt[h_of[b + x]]; d[r] = d.get(r, 0) + 1; n_ok += 1
    owner = [max(sorted(d), key=d.get) if d else None for d in cnt]
    got = [[h for h, o in enumerate(owner) if o == r] for r in range(len(ref))]
    return [(min(g), max(g)) if g else None for g in got], owner, n_ok / max(1, len(R))


def repliques_des_mots(ref, owner, W):
    """Réplique de chaque mot de whisper : celle de son jeton ; un mot sans jeton va à la réplique de son voisin le
    plus proche dans le temps."""
    line = [ref[o][0] if o is not None else None for o in owner]
    for h in range(len(line)):
        if line[h] is not None: continue
        p = next((k for k in range(h - 1, -1, -1) if line[k] is not None), None)
        n = next((k for k in range(h + 1, len(line)) if line[k] is not None), None)
        if p is None and n is None: continue
        gp = W[h][0] - W[p][1] if p is not None else np.inf
        gn = W[n][0] - W[h][1] if n is not None else np.inf
        line[h] = line[p] if gp <= gn else line[n]
    return line


def plages(x, hop=0.02, thr=-30.0, gap=0.16, mini=0.06):
    """Plages de voix de la prise : trames de 20 ms au-dessus de −30 dB du 99e centile, trous < 0,16 s comblés."""
    n = int(hop * SR); f = len(x) // n
    rms = np.sqrt(np.mean(x[:f * n].reshape(f, n) ** 2, axis=1))
    v = rms > np.percentile(rms, 99) * 10 ** (thr / 20)
    segs, i = [], 0
    while i < f:
        if v[i]:
            j = i
            while j < f and v[j]: j += 1
            if segs and i * hop - segs[-1][1] < gap: segs[-1][1] = j * hop
            else: segs.append([i * hop, j * hop])
            i = j
        else: i += 1
    return [s for s in segs if s[1] - s[0] >= mini]


def recale(W, isl, skip=1.0):
    """Range chaque mot, dans l'ordre, dans une plage de voix (programmation dynamique : coût = durée du mot hors de
    sa plage + skip × durée de chaque plage restée sans mot), puis étire les bornes de whisper sur la plage."""
    n, m = len(W), len(isl)
    if not n or not m: return W
    A = np.array([s[0] for s in isl]); B = np.array([s[1] for s in isl])
    cum = np.concatenate([[0.0], np.cumsum((B - A) * skip)])
    cost = np.array([[max(0.0, A[k] - w[0]) + max(0.0, w[1] - B[k]) for k in range(m)] for w in W])
    dp = np.zeros((n, m)); bk = np.zeros((n, m), int)
    dp[0] = cost[0] + cum[:m]
    for j in range(1, n):
        run, arg = np.inf, -1
        for k in range(m):
            stay, jump = dp[j - 1][k], (run + cum[k] if arg >= 0 else np.inf)
            if stay <= jump: dp[j][k], bk[j][k] = stay + cost[j][k], k
            else: dp[j][k], bk[j][k] = jump + cost[j][k], arg
            if dp[j - 1][k] - cum[k + 1] < run: run, arg = dp[j - 1][k] - cum[k + 1], k
    k = int(np.argmin(dp[-1] + (cum[m] - cum[1:])))
    g = [0] * n
    for j in range(n - 1, -1, -1): g[j] = k; k = bk[j][k]
    out = [list(w) for w in W]
    for k in sorted(set(g)):
        js = [j for j in range(n) if g[j] == k]
        s0, e0 = W[js[0]][0], max(W[j][1] for j in js); a, b = A[k], B[k]
        sc = (b - a) / (e0 - s0) if e0 > s0 else 0.0
        for j in js:
            out[j][0] = round(a + (W[j][0] - s0) * sc, 2); out[j][1] = round(a + (W[j][1] - s0) * sc, 2)
        out[js[0]][0] = round(a, 2); out[js[-1]][1] = round(b, 2)
    return out


def ffmpeg_mono(src, dst, af=None):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-ac', '1', '-ar', str(SR)] + (['-af', af] if af else [])
                   + [str(dst)], check=True)


def pose(take, args):
    words_path = D / 'words.json'
    WJ = json.load(open(words_path)) if words_path.exists() else {}
    if take not in WJ or args.retranscrire:
        print(f'transcription de {take} ({args.modele})…')
        WJ[take], modele = transcrire(D / take, args.modele)
        WJ.setdefault('_modele', {})[take] = modele
        json.dump(WJ, open(words_path, 'w'), ensure_ascii=False, indent=0)
    print(f"mots ({WJ.get('_modele', {}).get(take, '?')}) :", ' '.join(f"{i}:{w['w']}" for i, w in enumerate(WJ[take])))
    W0 = [[w['s'], w['e'], w['w']] for w in WJ[take]]

    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / 'a.wav'; ffmpeg_mono(D / take, src)
        x = sf.read(src)[0]
        sped = {}
        for tempo in sorted({L[3] for L in LINES + HOOK_B}):
            f = Path(tmp) / f'f{tempo}.wav'; ffmpeg_mono(src, f, f'atempo={tempo}'); sped[tempo] = sf.read(f)[0]

    W = recale([w[:2] for w in W0], plages(x)) if not args.sans_recalage else [w[:2] for w in W0]
    for i, (w, r) in enumerate(zip(W0, W)):
        if abs(w[0] - r[0]) > 0.08 or abs(w[1] - r[1]) > 0.08:
            print(f"  recalé sur l'enveloppe : {i}:{w[2]} {w[0]:.2f}-{w[1]:.2f} → {r[0]:.2f}-{r[1]:.2f}")
    W = [[a, b, w[2]] for (a, b), w in zip(W, W0)]
    for i, (a, b) in FIX.items(): W[i][:2] = [a, b]

    # les répliques par indices de mots : alignement du texte sur la transcription, SPAN l'emporte
    ref = [(L[0], r, j) for L in LINES + HOOK_B for r, j in enumerate(jetons(L[1]))]
    got, owner, part = aligne(ref, [w[2] for w in W])
    print(f'alignement : {part:.0%} du texte retrouvé')
    if part < 0.85: print('  ! moins de 85 % : réécouter la prise, corriger SPAN')
    idx = {}                                                       # (réplique, rang) → indices de whisper
    for (key, r, j), g in zip(ref, got):
        if g is None: print(f'  ! « {j} » ({key}) sans mot de whisper à lui : repère sur un voisin')
        else: idx[key, r] = g
    line_of = repliques_des_mots(ref, owner, W)
    spans, prev = {}, -1
    for L in LINES + HOOK_B:
        hs = [h for h, k in enumerate(line_of) if k == L[0]]
        if L[0] in SPAN: spans[L[0]] = SPAN[L[0]]
        elif not hs: sys.exit(f'réplique {L[0]} introuvable : la noter dans SPAN')
        else: spans[L[0]] = (max(min(hs), prev + 1), max(hs))
        prev = spans[L[0]][1]
        print(f"  {L[0]:7} mots {spans[L[0]][0]}-{spans[L[0]][1]} : {' '.join(W[i][2] for i in range(spans[L[0]][0], spans[L[0]][1] + 1))}")

    def cut(a, b, tempo, thr=-34):
        """Morceau [a, b] (temps de la prise) resserré sur le signal ; renvoie (audio, début effectif en temps de prise)."""
        sp = sped[tempo]; X = lambda s: int(s / tempo * SR)
        raw = sp[X(a):X(b)]
        env = np.sqrt(np.convolve(raw ** 2, np.ones(480) / 480, 'same'))
        on = np.nonzero(env > env.max() * 10 ** (thr / 20))[0]
        if not len(on): on = np.array([0, max(0, len(raw) - 1)])
        i0, i1 = max(0, on[0] - int(0.015 * SR)), min(len(raw), on[-1] + int(0.05 * SR))
        seg = raw[i0:i1].copy(); f, g = int(0.010 * SR), int(0.04 * SR)
        seg[:f] *= np.linspace(0, 1, f); seg[-g:] *= np.linspace(1, 0, g)
        return seg, a + i0 / SR * tempo

    def build(span, tempo, inner):
        """La réplique montée seule : (audio, [(indice du mot, début, fin)] en temps local)."""
        k0, k1 = span; chunks, cur = [], [k0]
        for k in range(k0 + 1, k1 + 1):
            if W[k][0] - W[k - 1][1] > 0.3: chunks.append(cur); cur = [k]
            else: cur.append(k)
        chunks.append(cur)
        parts, words, t = [], [], 0.0
        for ci, ch in enumerate(chunks):
            if ci:
                gap = min((W[ch[0]][0] - W[chunks[ci - 1][-1]][1]) / tempo, inner)
                parts.append(np.zeros(int(gap * SR))); t += gap
            prev_end = W[ch[0] - 1][1] if ch[0] > 0 else 0.0
            next_start = W[ch[-1] + 1][0] if ch[-1] + 1 < len(W) else W[ch[-1]][1] + 0.6
            a = max(prev_end, W[ch[0]][0] - 0.15); b = min(next_start, W[ch[-1]][1] + 0.25)
            seg, a_eff = cut(a, b, tempo)
            words += [(k, t + (W[k][0] - a_eff) / tempo, t + (W[k][1] - a_eff) / tempo) for k in ch]
            parts.append(seg); t += len(seg) / SR
        return np.concatenate(parts), words

    def tokens(key, words):
        """Jeton écrit de chaque mot de whisper de la réplique (pour les ancres 'at')."""
        tok = {idx[kk, r][0]: ref_tok(key, r) for kk, r in idx if kk == key}
        return [(tok.get(k, W[k][2]), a, b) for k, a, b in words]

    out = np.zeros(int(60 * SR))
    timing = {'dur': DUR, 'take': take, 'lines': [], 'words': [], 'marks': {}}
    WT, t, L5 = {}, 0.0, lignes(args.coupes)
    if args.coupes: timing['coupes'] = args.coupes
    for key, text, anchor, tempo, inner, _ in L5:
        seg, words = build(spans[key], tempo, inner)
        start = depart(anchor, t, timing['lines'], tokens(key, words))
        if timing['lines'] and start < t + 0.2:
            print(f'  ! {key} : à moins de 0,2 s de la réplique précédente ({start - t:.2f} s), décalée')
            start = t + 0.2
        i = int(start * SR); out[i:i + len(seg)] += seg
        for k, a, b in words:
            WT[k] = {'line': key, 't': round(start + a, 3), 'end': round(start + b, 3), 'w': W[k][2]}
            timing['words'].append(WT[k])
        t = start + len(seg) / SR
        timing['lines'].append({'key': key, 't': round(start, 3), 'end': round(t, 3), 'text': text})

    def where_in(T, key, rang):
        """Entrée posée du mot (réplique, rang) dans T ({indice de whisper: entrée}) ; mot voisin s'il manque."""
        g = idx.get((key, rang))
        if g is None:                                              # mot non retrouvé : le suivant, sinon le précédent
            n = len(jetons(texte(key)))
            g = next((idx[key, r] for r in list(range(rang, n)) + list(range(rang - 1, -1, -1)) if (key, r) in idx), None)
            print(f'  ! repère sur un mot non retrouvé ({key}, {rang}) : mot voisin')
        if g and g[0] in T: return T[g[0]]
        return T[min((i for i in T if T[i]['line'] == key), key=lambda i: abs(i - (g or [0])[0]))]
    timing['marks'] = marques(MARKS, lambda key, rang: where_in(WT, key, rang))
    DURf = fin_du_film(timing, t)

    # ouverture B : hB1 à 0,10 s, hB2 0,3 s après, à la place de h1, h2, h3 ; sans la réplique de boucle
    durees, segsB, kB = {}, {}, {}
    for key, text, anchor, tempo, inner in HOOK_B:
        seg, words = build(spans[key], tempo, inner)
        segsB[key] = seg; kB[key] = [k for k, a, b in words]
        durees[key] = (len(seg) / SR, [(W[k][2], a, b) for k, a, b in words])
    timing['hookB'], posB = ouverture_b(timing, durees)
    WTB = {k: posB[key, r] for key in kB for r, k in enumerate(kB[key])}
    timing['hookB']['marks'] = marques(MARKS_B, lambda key, rang: where_in(WTB, key, rang))
    k = {l['key']: l for l in timing['lines']}
    outB = out.copy(); outB[:int((k['res']['t'] - 0.02) * SR)] = 0; outB[int((k['proch']['t'] - 0.02) * SR):] = 0
    for L in timing['hookB']['lines']:
        i = int(L['t'] * SR); outB[i:i + len(segsB[L['key']])] += segsB[L['key']]
    tag = Path(take).stem
    sf.write(D / f'vo-placed-{tag}.wav', out[:int(DURf * SR)], SR)
    sf.write(D / 'vo-placed-B.wav', outB[:int(timing['hookB']['dur'] * SR)], SR)
    json.dump(timing, open(D / f'vo-timing-{tag}.json', 'w'), ensure_ascii=False, indent=1)
    return timing, out, L5


def verifie_pose(path, modele):
    """Retranscrit la pose et liste les mots que whisper n'y retrouve pas (coupés ou avalés)."""
    hyp, modele = transcrire(path, modele)
    ref = [(L[0], r, j) for L in LINES for r, j in enumerate(jetons(L[1]))]
    got, _, part = aligne(ref, [w['w'] for w in hyp])
    print(f'retranscription de la pose ({modele}) : {part:.0%} du texte retrouvé')
    print('  ', ' '.join(w['w'] for w in hyp))
    manque = [f'{j} ({k})' for (k, r, j), g in zip(ref, got) if g is None]
    print('  mots non retrouvés :', ', '.join(manque) if manque else 'aucun')
    return not manque


def calibre():
    """Débit (mots dits ou syllabes par seconde), pause par ponctuation interne et correction des répliques
    d'ouverture, ajustés sur les répliques posées de MO9 et MO10, sans le rire, le soupir, « La deuxième… reste. »
    ni « Bénéfice : … », dont le silence est voulu."""
    X, S, K, Y, O = [], [], [], [], []
    for ep in ('mo9', 'mo10'):
        for L in json.load(open(ROOT / f'audio/vo-{ep}/vo-timing.json'))['lines']:
            if L['text'].startswith('[') or L['key'] in ('deux2', 'reste', 'ben'): continue
            md = mots_dits(L['text']); X.append(len(md)); S.append(sum(syllabes(m) for m in md))
            K.append(ponct_int(L['text'])); Y.append(L['end'] - L['t'])
            O.append(L['key'] in ('h1', 'h2') or (ep == 'mo9' and L['key'] == 'ok'))
    O = np.array(O)
    for nom, F in (('mots dits', X), ('syllabes', S)):
        A = np.array([F, K], float).T; (b, p), *_ = np.linalg.lstsq(A, np.array(Y), rcond=None)
        res = A @ [b, p] - np.array(Y); rmse = float(np.sqrt(np.mean(res ** 2)))
        print(f'{len(Y)} répliques : {1 / b:.2f} {nom}/s + {p:.2f} s par ponctuation interne (écart type {rmse:.2f} s) ;'
              f' débit brut {sum(F) / sum(Y):.2f} {nom}/s ; ouverture : {-res[O].mean():+.2f} s par réplique')
    print(f'parole posée : MO9 + MO10, {sum(Y):.2f} s pour {sum(X)} mots dits')
    md = [m for L in LINES for m in mots_dits(L[1])]
    print(f'MO13 (ouverture A) : {len(md)} mots dits, {sum(syllabes(m) for m in md)} syllabes, '
          f'{sum(len(jetons(L[1])) for L in LINES)} jetons écrits')


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('take', nargs='?', default=None)
    ap.add_argument('--provisoire', action='store_true')
    ap.add_argument('--retenue', action='store_true')
    ap.add_argument('--unite', choices=('syllabes', 'mots'), default='syllabes')
    ap.add_argument('--debit', type=float, default=None, help='syllabes (ou mots dits) par seconde, après accélération')
    ap.add_argument('--pause-int', type=float, default=None, help='s par ponctuation interne')
    ap.add_argument('--corr-ouverture', type=float, default=None, help="s ajoutées à chaque réplique d'ouverture")
    ap.add_argument('--plancher', type=float, default=PLANCHER)
    ap.add_argument('--coupes', type=int, default=0, choices=range(len(COUPES) + 1), help='coupes du brief appliquées')
    ap.add_argument('--modele', default='medium')
    ap.add_argument('--retranscrire', action='store_true')
    ap.add_argument('--sans-recalage', action='store_true')
    ap.add_argument('--sans-verif', action='store_true')
    ap.add_argument('--calibre', action='store_true')
    ap.add_argument('--essai', action='store_true', help='mode provisoire sans rien écrire')
    ap.add_argument('--force', action='store_true', help='écraser une voix retenue par une voix provisoire')
    args = ap.parse_args()
    verifie_texte()
    if args.calibre: return calibre()
    D.mkdir(parents=True, exist_ok=True)
    if args.provisoire or not args.take:
        debit = args.debit or DEBIT[args.unite]
        pause = PAUSE_INT[args.unite] if args.pause_int is None else args.pause_int
        corr = args.corr_ouverture if args.corr_ouverture is not None else (CORR_OUV[args.unite] if args.debit is None else 0.0)
        timing, L5 = provisoire(args.unite, debit, pause, corr, args.plancher, args.coupes)
        resume(timing); ok = controle(timing, L5)
        print(f"estimation : {debit} {args.unite}/s + {pause} s par ponctuation interne, {corr:+.2f} s par réplique "
              f"d'ouverture" + ('' if ok else ' · CONTRÔLES EN ÉCHEC'))
        if args.essai: return
        vt = D / 'vo-timing.json'
        if vt.exists() and not json.load(open(vt)).get('provisional') and not args.force:
            sys.exit("vo-timing.json vient d'une vraie prise : --force pour le remplacer par une estimation")
        sf.write(D / 'vo-placed.wav', np.zeros(int(round(timing['dur'] * SR)), np.float32), SR, subtype='PCM_16')
        sf.write(D / 'vo-placed-B.wav', np.zeros(int(round(timing['hookB']['dur'] * SR)), np.float32), SR, subtype='PCM_16')
        json.dump(timing, open(vt, 'w'), ensure_ascii=False, indent=1)
        print(f"→ vo-timing.json (provisoire), vo-placed.wav muet de {timing['dur']} s, vo-placed-B.wav muet de "
              f"{timing['hookB']['dur']} s")
        return
    if not (D / args.take).exists(): sys.exit(f'{D / args.take} absent : déposer la prise, ou --provisoire')
    timing, out, L5 = pose(args.take, args)
    resume(timing); controle(timing, L5)
    if args.retenue:
        DURf = timing['dur']
        sf.write(D / 'vo-placed.wav', out[:int(DURf * SR)], SR)
        json.dump(timing, open(D / 'vo-timing.json', 'w'), ensure_ascii=False, indent=1)
        tl = ROOT / 'timeline-mo13.json'
        if D == D0 and tl.exists():                                # pas pendant un essai dans un autre dossier
            TLJ = json.load(open(tl)); TLJ['dur'] = DURf
            json.dump(TLJ, open(tl, 'w'), ensure_ascii=False, indent=1); open(tl, 'a').write('\n')
        print('→ vo-placed.wav, vo-timing.json' + (', timeline-mo13.json (durée)' if D == D0 and tl.exists() else ''))
        if not args.sans_verif: verifie_pose(D / 'vo-placed.wav', args.modele)


if __name__ == '__main__':
    main()
