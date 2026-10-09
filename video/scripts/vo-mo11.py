"""MO11 « La préparation » : pose la voix off de Simon et en déduit la durée du film (≈ 30,5 s).

Sans prise (ElevenLabs a bloqué le compte le 9 octobre 2026) :
    python3 scripts/vo-mo11.py --provisoire [--unite syllabes|mots] [--debit …] [--pause-int …]
        → audio/vo-mo11/vo-timing.json ("provisional": true) et vo-placed.wav muet, de la durée du film
Avec la prise (une seule génération, déposée en audio/vo-mo11/takeA.mp3) :
    python3 scripts/vo-mo11.py takeA.mp3 [--retenue] [--modele medium|small] [--retranscrire] [--sans-verif]
        → words.json, vo-placed-takeA.wav, vo-timing-takeA.json, vo-placed-B.wav (ouverture B à la place de A)
          --retenue : vo-placed.wav, vo-timing.json, durée dans timeline-mo11.json, puis retranscription de la pose
    python3 scripts/vo-mo11.py --calibre      → refait la mesure du débit sur les voix posées de MO9 et MO10

Méthode de MO9 et MO10 (scripts/vo-mo9.py, vo-mo10.py) : répliques découpées aux pauses de plus de 0,3 s, morceaux
coupés au plus près du signal (−34 dB), pauses internes ramenées au maximum de la réplique, accélération atempo
(timbre conservé), × 1,2 au plus (retour « trop rapide » sur MO9 à × 1,25). Ce que MO11 ajoute :
- les répliques sont écrites en texte, plus en indices : le script aligne le texte envoyé à ElevenLabs sur la
  transcription (faster-whisper medium, small s'il manque) et en tire les indices des mots. La transcription
  numérotée s'affiche ; une correction se note dans FIX ou SPAN après écoute ;
- les bornes des mots sont recalées sur l'enveloppe de la prise (trames de 20 ms) : chaque mot va dans une plage
  de voix, sans plage sautée si possible (leçon de MO10 : medium place parfois un mot 0,8 s trop tard) ;
- la pose est retranscrite à la fin (--retenue) pour vérifier qu'aucun mot n'est coupé ;
- COUPE applique les coupes du brief si le film dépasse 31,5 s, sans toucher au texte généré ;
- le mode provisoire pose les mêmes répliques aux mêmes ancres, avec une durée estimée, au même format.
Vérifié sur la prise de MO10 (9 oct.) : le recalage retrouve à 0,04 s près les huit bornes corrigées à l'oreille dans
vo-mo10.py, l'alignement retrouve 100 % du texte, la retranscription de la pose ne perd aucun mot.
"""
import argparse, difflib, json, os, re, subprocess, sys, tempfile, unicodedata
from pathlib import Path
import numpy as np, soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
D = Path(os.environ.get('VO_DIR', ROOT / 'audio/vo-mo11'))
SR = 48000
DUR = 34.0                                                   # place de travail ; la durée du film est calculée à la fin

# Le texte exact de la génération (brief-mo11.md, « Texte ElevenLabs ») : Simon, eleven_v3, generations_count 1.
VOIX, MODELE_TTS = 'mvhJVdVoTWVUtL4keT7W', 'eleven_v3'
TEXTE = """Tu l'achètes deux mille, tu la revends deux mille neuf cents. Ton aspirateur trouve ça donné.
Samedi, treize heures. Les sièges. L'odeur. Les enjoliveurs.
Et là… tu attends le soleil. Photo un.
Quatre jours. Quatre cents de plus. [short pause] Ton samedi le mieux payé.
Ceux qui gagnent ne réparent pas tout. L'ongle glisse sur la rayure ? Quinze euros de polish.
La prochaine fois que tu te dis…
[long pause]
La revendre sale t'économise un après-midi. Et ça peut te coûter quatre cents euros."""

E = lambda k, v: float(os.environ.get(k, v))
TH, TV, TC, TF, TL = E('TH', 1.15), E('TV', 1.2), E('TC', 1.15), E('TF', 1.2), E('TL', 1.15)  # ouverture, coups, attente et chute, méthode, boucle

# Répliques : (clé, texte écrit avec chiffres (sous-titres), ancre, tempo, pause interne max).
# Ancre : t fixe ; ('max', t, g) = t du brief, ou g s après la fin de la précédente si elle déborde ;
#         ('+', g) ; ('at', 'mot', t) = le mot tombe à t ; ('after', clé, g) = g s après le début de cette réplique.
LINES = [
    ('h1', "Tu l'achètes 2 000,", 0.10, TH, 0.1),
    ('h2', "tu la revends 2 900.", ('max', 1.20, 0.15), TH, 0.1),
    ('asp', "Ton aspirateur trouve ça donné.", ('max', 2.75, 0.25), TH, 0.12),
    ('sam', "Samedi, 13 heures.", ('max', 4.65, 0.3), TV, 0.2),
    ('sieg', "Les sièges.", ('max', 7.95, 0.3), TV, 0.1),          # les coups lavage et phares passent sans voix
    ('odeur', "L'odeur.", ('max', 9.25, 0.3), TV, 0.1),            # après la carte « une frite » (9,0 s)
    ('enjo', "Les enjoliveurs.", ('max', 10.75, 0.3), TV, 0.1),    # le coup rayure passe sans voix
    ('soleil', "Et là, tu attends le soleil.", ('max', 12.20, 0.3), TC, 0.3),
    ('photo', "Photo 1.", ('max', 14.25, 0.3), TC, 0.1),
    ('j4', "4 jours.", ('max', 15.95, 0.3), TC, 0.1),
    ('c400', "400 de plus.", ('max', 16.90, 0.3), TC, 0.1),
    ('paye', "Ton samedi le mieux payé.", ('max', 18.70, 1.0), TC, 0.12),    # la seule pause, sous « + 400 € »
    ('ceux', "Ceux qui gagnent ne réparent pas tout.", ('max', 21.15, 1.0), TF, 0.12),  # après le rembobinage
    ('ongle', "L'ongle glisse sur la rayure ?", ('max', 24.75, 0.3), TF, 0.15),
    ('polish', "15 euros de polish.", ('max', 26.25, 0.3), TF, 0.1),
    ('proch', "La prochaine fois que tu te dis…", ('max', 28.40, 1.0), TL, 0.12),   # la carte se replie avant
]
HOOK_B = ('hB', "La revendre sale t'économise un après-midi. Et ça peut te coûter 400 euros.", 0.10, TH, 0.3)
B_AVANT = 'sam'       # l'ouverture B remplace tout ce qui précède « Samedi, 13 heures. »
LOOP_LEAD = 0.6       # la carte se replie et la poussière revient 0,6 s avant « La prochaine fois » (brief : 27,8 → 28,4)
TAIL = 0.35           # le film finit 0,35 s après « dis… » (MO9, MO10)

# Repères du film : clé → (réplique, mot écrit sans accent ni ponctuation). film-mo11 lit leurs temps dans vo-timing.json.
MARKS = dict(
    achete=('h1', 'lachetes'), b2000=('h1', '2000'), revends=('h2', 'revends'), b2900=('h2', '2900'),
    ton=('asp', 'ton'), aspi=('asp', 'aspirateur'), donne=('asp', 'donne'),                      # l'embout ; « 2 ?00 »
    samedi=('sam', 'samedi'), treize=('sam', '13'), heures=('sam', 'heures'),                     # jour 1 : compteur, palettes
    sieges=('sieg', 'sieges'), odeur=('odeur', 'lodeur'), enjo=('enjo', 'enjoliveurs'),          # les coups nommés
    etla=('soleil', 'et'), attends=('soleil', 'attends'), soleil=('soleil', 'soleil'),           # 13:00 → 16:30
    photo=('photo', 'photo'), un=('photo', '1'),                                                  # viseur, déclic
    quatre=('j4', '4'), jours=('j4', 'jours'),                                                    # la vente : bulle, virement
    n400=('c400', '400'), plus=('c400', 'plus'),                                                  # le chiffre final : « + 400 € »
    ton2=('paye', 'ton'), samedi2=('paye', 'samedi'), mieux=('paye', 'mieux'), paye=('paye', 'paye'),   # la chute
    ceux=('ceux', 'ceux'), gagnent=('ceux', 'gagnent'), pas=('ceux', 'pas'), tout=('ceux', 'tout'),     # la méthode
    ongle=('ongle', 'longle'), glisse=('ongle', 'glisse'), rayure=('ongle', 'rayure'),                  # le verdict
    quinze=('polish', '15'), euros=('polish', 'euros'), polish=('polish', 'polish'),
    prochaine=('proch', 'la'), dis=('proch', 'dis'),                                              # la boucle
)
# Corrections à l'oreille, une fois la prise écoutée (indices de la transcription affichée) :
FIX = {}              # {indice: (début, fin)} en temps de prise, mesuré sur l'enveloppe à 20 ms
SPAN = {}             # {clé de réplique: (i0, i1)} si l'alignement automatique se trompe de mots
# Coupes du brief si le film dépasse 31,5 s, dans cet ordre : {'sam': 'Samedi.'}, puis {'sam': 'Samedi.', 'j4': ''}.
# Le texte gardé reprend le début de la réplique ; '' la retire (ses repères restent, sans durée, à sa place).
COUPE = {}

# Estimation provisoire : débit après accélération et pause par ponctuation interne, mesurés sur les 25 répliques
# posées de MO9 et MO10 (--calibre) : 5,96 syllabes/s + 0,34 s (écart type 0,23 s par réplique), ou 4,96 mots dits/s
# + 0,52 s (0,28 s). Les syllabes prédisent mieux : les mots de MO11 sont plus longs que les chiffres de MO9.
# Réplique de 0,55 s au moins (MO9 : « Il accepte. » 0,63 s), 0,3 s au moins entre les phrases (ancres 'max').
DEBIT = {'syllabes': 5.96, 'mots': 4.96}
PAUSE_INT = {'syllabes': 0.34, 'mots': 0.52}
PLANCHER, GAP = 0.55, 0.3
PONCT = r'[,;:….?!]$'   # ponctuation interne : une pause dans la réplique


# ---------- le français dit ----------
_U = 'zéro un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize'.split()
_T = {2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante'}


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
    """Le texte tel qu'il se dit : nombres en lettres (« 2 000 » → « deux mille »)."""
    s = re.sub(r'(\d)[ \u00a0\u202f](?=\d{3}\b)', r'\1', s)
    return re.sub(r'\d+', lambda m: n2w(int(m.group())), s)


def cle(s):
    """Minuscules sans accents, lettres et chiffres seulement."""
    s = unicodedata.normalize('NFD', s.lower())
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in s if not unicodedata.combining(c)))


def mots_dits(s):
    return [w for w in re.split(r"[\s\-]+", dit(s)) if re.search(r'\w', w)]


_VOY = 'aeiouyàâäéèêëîïôöùûüœæ'


def syllabes(mot):
    """Syllabes d'un mot dit (règle simple : groupes de voyelles, e muet final, -ent des verbes)."""
    m = re.sub(r"^\w'", '', mot.lower()).replace("'", '').replace('qu', 'k').replace('gu', 'g')
    n = len(re.findall(f'[{_VOY}]+', m)) + len(re.findall(r'[ao]y[aeiouéèê]', m))   # payé, rayure
    if n > 1 and re.search(r'[^aeiouyéèêàâ](e|es)$', m): n -= 1
    elif n > 1 and re.search(r'[^aeiouy]ent$', m): n -= 1                            # gagnent, réparent
    return max(1, n)


def jetons(text):
    """Mots écrits d'une réplique ; un nombre à espaces (« 2 000, ») reste un seul jeton, comme whisper l'écrit, et une
    ponctuation isolée (« rayure ? », « première : ») va avec le mot qui la précède."""
    out = []
    for j in re.findall(r'\d{1,3}(?:[ \u00a0\u202f]\d{3})+\S*|\S+', text):
        if out and not re.search(r'\w', j): out[-1] += ' ' + j
        else: out.append(j)
    return out


def texte(key):
    return next(L[1] for L in LINES + [HOOK_B] if L[0] == key)


def garde(key):
    """Le texte posé d'une réplique (COUPE) et son nombre de jetons (0 : réplique retirée)."""
    full = texte(key)
    if key not in COUPE: return full, len(jetons(full))
    G, J = jetons(COUPE[key]), jetons(full)
    if [cle(j) for j in G] != [cle(j) for j in J[:len(G)]]:
        sys.exit(f'COUPE {key} : « {COUPE[key]} » doit reprendre le début de « {full} »')
    return COUPE[key], len(G)


def verifie_texte():
    """Le texte des répliques (A puis B), dit, doit être exactement celui de la génération."""
    a = cle(dit(' '.join(L[1] for L in LINES + [HOOK_B])))
    b = cle(re.sub(r'\[[^\]]*\]', ' ', TEXTE))
    if a != b:
        i = next(k for k in range(min(len(a), len(b))) if a[k] != b[k])
        sys.exit(f'texte des répliques ≠ texte ElevenLabs vers « …{a[max(0, i - 20):i + 20]} » / « …{b[max(0, i - 20):i + 20]} »')


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


def marques(timing, where):
    """MARKS → {clé: {line, t, end, w}} ; where(clé de réplique, rang du jeton) donne l'entrée du mot."""
    out = {}
    for k, (key, w) in MARKS.items():
        rang = next((i for i, j in enumerate(jetons(texte(key))) if cle(j) == w), None)
        if rang is None: sys.exit(f'repère {k} : « {w} » absent de la réplique {key}')
        out[k] = where(key, rang)
    return out


def fin_du_film(timing, t_end):
    timing['loop'] = round(timing['lines'][-1]['t'] - LOOP_LEAD, 2)
    timing['dur'] = round(float(np.ceil((t_end + TAIL) * 20) / 20), 2)
    return timing['dur']


def controle(timing):
    """Aucun chevauchement ; tout ce qui précède la boucle finit avant elle ; la voix finit avant la fin du film."""
    L, ok = timing['lines'], True
    for a, b in zip(L, L[1:]):
        if b['t'] < a['end'] + 0.06: print(f"  ! {b['key']} chevauche {a['key']} ({a['end']:.2f} > {b['t']:.2f})"); ok = False
    if any(l['end'] > timing['loop'] for l in L[:-1]): print('  ! une réplique déborde sur la boucle'); ok = False
    if L[-1]['end'] > timing['dur']: print('  ! la voix dépasse la fin du film'); ok = False
    if timing['dur'] > 31.5: print(f"  ! film de {timing['dur']} s : au-delà de 31,5 s, appliquer les coupes du brief"); ok = False
    return ok


def resume(timing):
    for L in timing['lines']: print(f"{L['t']:6.2f}-{L['end']:6.2f} {L['key']:6} {L['text']}")
    parole = sum(L['end'] - L['t'] for L in timing['lines'])
    print(f"fin de la voix {timing['lines'][-1]['end']:.2f} s · parole {parole:.2f} s · boucle {timing['loop']} s · film {timing['dur']} s")


# ---------- mode provisoire ----------
def provisoire(unite, debit, pause_int, plancher):
    """Chaque réplique à son ancre, durée = syllabes (ou mots dits, nombres en lettres) / débit + pauses internes,
    0,55 s au moins ; mots au prorata des syllabes ; 0,3 s au moins entre les phrases (les ancres 'max')."""
    timing = {'dur': DUR, 'take': 'provisoire', 'provisional': True, 'lines': [], 'words': [], 'marks': {},
              'estimate': {'unite': unite, 'debit': debit, 'pause_interne': pause_int, 'plancher': plancher,
                           'entre_phrases': GAP, 'source': 'aucune prise : durées estimées (scripts/vo-mo11.py --provisoire), '
                           'débit mesuré sur les voix posées de MO9 et MO10'}}
    pos, t = {}, 0.0

    def estime(text):
        J = jetons(text)
        sy = [sum(syllabes(m) for m in mots_dits(j)) for j in J]
        n = sum(sy) if unite == 'syllabes' else sum(len(mots_dits(j)) for j in J)
        k = sum(1 for j in J[:-1] if re.search(PONCT, j))
        d = max(plancher, n / debit + k * pause_int)
        parole = d - k * pause_int; u = parole / sum(sy); words, x = [], 0.0
        for r, (j, s) in enumerate(zip(J, sy)):
            words.append((j, x, x + s * u)); x += s * u
            if r < len(J) - 1 and re.search(PONCT, j): x += pause_int
        return words, d

    for key, full, anchor, tempo, inner in LINES:
        text, nk = garde(key)
        if nk == 0:                                                # réplique retirée : repères sans durée à sa place
            start = depart(anchor, t, timing['lines'], [])
            for rang in range(len(jetons(full))): pos[key, rang] = {'line': key, 't': round(start, 3), 'end': round(start, 3), 'w': ''}
            continue
        words, d = estime(text)
        start = depart(anchor, t, timing['lines'], words)
        if start < t + 0.06:
            print(f'  ! {key} : chevauche la réplique précédente de {t + 0.06 - start:.2f} s, décalée')
            start = t + 0.06
        for rang, (j, a, b) in enumerate(words):
            pos[key, rang] = {'line': key, 't': round(start + a, 3), 'end': round(start + b, 3), 'w': j}
            timing['words'].append(pos[key, rang])
        for rang in range(nk, len(jetons(full))): pos[key, rang] = pos[key, nk - 1]     # mots coupés : le dernier gardé
        t = start + d
        timing['lines'].append({'key': key, 't': round(start, 3), 'end': round(t, 3), 'text': text})
    timing['marks'] = marques(timing, lambda key, rang: pos[key, rang])
    fin_du_film(timing, t)
    wB, dB = estime(HOOK_B[1])
    timing['hookB'] = {'t': HOOK_B[2], 'end': round(HOOK_B[2] + dB, 3), 'text': HOOK_B[1]}
    return timing


# ---------- la prise : transcription, alignement, recalage ----------
def transcrire(path, modele):
    """Mots horodatés par faster-whisper ; medium s'il est en cache ou téléchargeable, sinon small."""
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
    W = [{'s': round(w.start, 2), 'e': round(w.end, 2), 'w': w.word.strip()} for s in segs for w in s.words]
    return W, modele


def aligne(ref, hyp):
    """ref : [(clé de réplique, rang, jeton écrit)], hyp : mots de whisper. Renvoie pour chaque jeton de ref les
    indices (premier, dernier) des mots de whisper qui le disent, ou None, et la part du texte retrouvée."""
    R, r_of = '', []
    for i, (_, _, j) in enumerate(ref):
        c = cle(dit(j)); R += c; r_of += [i] * len(c)
    hk = [cle(dit(w)) for w in hyp]
    for i in range(1, len(hk)):                                   # « 2 » « 000 » → « 2000 »
        if re.fullmatch(r'\d{3}[.,!?]?', hyp[i].strip()) and re.fullmatch(r'\d{1,3}', hyp[i - 1].strip()):
            hk[i - 1] = cle(dit(hyp[i - 1].strip() + hyp[i].strip())); hk[i] = ''
    H, h_of = '', []
    for i, c in enumerate(hk): H += c; h_of += [i] * len(c)
    got = [[] for _ in ref]
    for a, b, n in difflib.SequenceMatcher(None, R, H, autojunk=False).get_matching_blocks():
        for x in range(n): got[r_of[a + x]].append(h_of[b + x])
    return [(min(g), max(g)) if g else None for g in got], sum(len(g) for g in got) / max(1, len(R))


def plages(x, hop=0.02, thr=-30.0, gap=0.16, mini=0.06):
    """Plages de voix de la prise (trames de 20 ms au-dessus de −30 dB du 99e centile, trous < 0,16 s comblés)."""
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
    """Range chaque mot (dans l'ordre) dans une plage de voix, par programmation dynamique : coût = durée du mot hors
    de sa plage + skip × durée de chaque plage restée sans mot. Dans une plage, les bornes de whisper sont étirées sur
    la plage. Renvoie les mots recalés."""
    n, m = len(W), len(isl)
    if not n or not m: return W
    A = np.array([s[0] for s in isl]); B = np.array([s[1] for s in isl])
    cum = np.concatenate([[0.0], np.cumsum((B - A) * skip)])       # cum[k1] - cum[k0] : plages k0..k1-1 sautées
    cost = np.array([[max(0.0, A[k] - w[0]) + max(0.0, w[1] - B[k]) for k in range(m)] for w in W])
    dp = np.zeros((n, m)); bk = np.zeros((n, m), int)
    dp[0] = cost[0] + cum[:m]
    for j in range(1, n):
        run, arg = np.inf, -1                                      # min sur k' < k de dp[j-1][k'] - cum[k'+1]
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
        for tempo in sorted({L[3] for L in LINES + [HOOK_B]}):
            if tempo > 1.2: sys.exit(f'tempo {tempo} : × 1,2 au plus')
            f = Path(tmp) / f'f{tempo}.wav'; ffmpeg_mono(src, f, f'atempo={tempo}'); sped[tempo] = sf.read(f)[0]

    W = recale([w[:2] for w in W0], plages(x)) if not args.sans_recalage else [w[:2] for w in W0]
    for i, (w, r) in enumerate(zip(W0, W)):
        if abs(w[0] - r[0]) > 0.08 or abs(w[1] - r[1]) > 0.08:
            print(f'  recalé sur l\'enveloppe : {i}:{w[2]} {w[0]:.2f}-{w[1]:.2f} → {r[0]:.2f}-{r[1]:.2f}')
    W = [[a, b, w[2]] for (a, b), w in zip(W, W0)]
    for i, (a, b) in FIX.items(): W[i][:2] = [a, b]

    ref = [(L[0], r, j) for L in LINES + [HOOK_B] for r, j in enumerate(jetons(L[1]))]
    got, part = aligne(ref, [w[2] for w in W])
    print(f'alignement : {part:.0%} du texte retrouvé')
    if part < 0.85: print('  ! moins de 85 % : réécouter la prise, corriger SPAN')
    idx = {}                                                       # (réplique, rang) → indice de whisper
    for (key, r, j), g in zip(ref, got):
        if g is None: print(f'  ! « {j} » ({key}) introuvable dans la transcription')
        else: idx[key, r] = g
    spans, prev = {}, -1
    for L in LINES + [HOOK_B]:
        gs = [idx[k] for k in idx if k[0] == L[0]]
        if L[0] in SPAN: spans[L[0]] = SPAN[L[0]]
        elif not gs: sys.exit(f'réplique {L[0]} introuvable : la noter dans SPAN')
        else: spans[L[0]] = (max(min(g[0] for g in gs), prev + 1), max(g[1] for g in gs))
        prev = spans[L[0]][1]
        print(f"  {L[0]:6} mots {spans[L[0]][0]}-{spans[L[0]][1]} : {' '.join(W[i][2] for i in range(spans[L[0]][0], spans[L[0]][1] + 1))}")

    def cut(a, b, tempo, thr=-34):
        """Morceau [a, b] (temps de la prise) resserré sur le signal ; renvoie (audio, début effectif en temps de prise)."""
        sp = sped[tempo]; X = lambda s: int(s / tempo * SR)
        raw = sp[X(a):X(b)]
        env = np.sqrt(np.convolve(raw ** 2, np.ones(480) / 480, 'same'))
        on = np.nonzero(env > env.max() * 10 ** (thr / 20))[0]
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

    out = np.zeros(int(DUR * SR) + 6 * SR)
    timing = {'dur': DUR, 'take': take, 'lines': [], 'words': [], 'marks': {}}
    WT, virt, t = {}, {}, 0.0
    for key, full, anchor, tempo, inner in LINES:
        text, nk = garde(key)
        if nk == 0:                                                # réplique retirée : repères sans durée à sa place
            start = depart(anchor, t, timing['lines'], [])
            for rang in range(len(jetons(full))): virt[key, rang] = {'line': key, 't': round(start, 3), 'end': round(start, 3), 'w': ''}
            print(f'  {key} retirée (COUPE) : repères à {start:.2f} s')
            continue
        span = spans[key]
        if nk < len(jetons(full)) and key not in SPAN:
            span = (span[0], max(g[1] for (kk, r), g in idx.items() if kk == key and r < nk))
        seg, words = build(span, tempo, inner)
        tok = {idx[kk, r][0]: ref_tok(key, r) for kk, r in idx if kk == key}      # mot de whisper → jeton écrit
        start = depart(anchor, t, timing['lines'], [(tok.get(k, W[k][2]), a, b) for k, a, b in words])
        if start < t + 0.06: print(f'  ! {key} : chevauche la réplique précédente de {t + 0.06 - start:.2f} s, décalée')
        start = max(start, t + 0.06)
        i = int(start * SR); out[i:i + len(seg)] += seg
        for k, a, b in words:
            WT[k] = {'line': key, 't': round(start + a, 3), 'end': round(start + b, 3), 'w': W[k][2]}
            timing['words'].append(WT[k])
        t = start + len(seg) / SR
        timing['lines'].append({'key': key, 't': round(start, 3), 'end': round(t, 3), 'text': text})

    def where(key, rang):
        if (key, rang) in virt: return virt[key, rang]
        rang = min(rang, garde(key)[1] - 1)                        # mot coupé : le dernier gardé
        g = idx.get((key, rang))
        if g is None:                                              # mot non retrouvé : le suivant de la réplique
            g = next((idx[key, r] for r in range(rang, 99) if (key, r) in idx), None)
            print(f'  ! repère sur un mot non retrouvé ({key}, {rang}) : mot voisin')
        k = g[0] if g and g[0] in WT else min((i for i in WT if WT[i]['line'] == key), key=lambda i: abs(i - (g or [0])[0]))
        return WT[k]
    timing['marks'] = marques(timing, where)
    fin_du_film(timing, t)
    DURf = timing['dur']
    # ouverture B : la phrase B posée à 0,10 s à la place de h1 + h2 + asp (le reste du film ne bouge pas)
    segB, _ = build(spans['hB'], HOOK_B[3], HOOK_B[4])
    sam = next(L for L in timing['lines'] if L['key'] == B_AVANT)
    outB = out.copy(); outB[:int((sam['t'] - 0.02) * SR)] = 0; iB = int(HOOK_B[2] * SR); outB[iB:iB + len(segB)] += segB
    timing['hookB'] = {'t': HOOK_B[2], 'end': round(HOOK_B[2] + len(segB) / SR, 3), 'text': HOOK_B[1]}
    if timing['hookB']['end'] > sam['t'] - 0.2: print(f"  ! l'ouverture B finit à {timing['hookB']['end']:.2f} s, trop près de « Samedi » ({sam['t']:.2f} s)")
    tag = Path(take).stem
    sf.write(D / f'vo-placed-{tag}.wav', out[:int(DURf * SR)], SR); sf.write(D / 'vo-placed-B.wav', outB[:int(DURf * SR)], SR)
    json.dump(timing, open(D / f'vo-timing-{tag}.json', 'w'), ensure_ascii=False, indent=1)
    return timing, out


def ref_tok(key, rang):
    return jetons(texte(key))[rang]


def verifie_pose(path, modele):
    """Retranscrit la pose et liste les mots que whisper n'y retrouve pas (coupés ou avalés)."""
    hyp, modele = transcrire(path, modele)
    ref = [(L[0], r, j) for L in LINES if garde(L[0])[1] for r, j in enumerate(jetons(garde(L[0])[0]))]
    got, part = aligne(ref, [w['w'] for w in hyp])
    print(f'retranscription de la pose ({modele}) : {part:.0%} du texte retrouvé')
    print('  ', ' '.join(w['w'] for w in hyp))
    manque = [f'{j} ({k})' for (k, r, j), g in zip(ref, got) if g is None]
    print('  mots non retrouvés :', ', '.join(manque) if manque else 'aucun')
    return not manque


def calibre():
    """Débit (syllabes ou mots dits par seconde) et pause par ponctuation interne, ajustés sur les répliques posées
    de MO9 et MO10 (sans le rire, le soupir ni « Bénéfice : … », dont le silence est voulu)."""
    X, S, K, Y = [], [], [], []
    for ep in ('mo9', 'mo10'):
        for L in json.load(open(ROOT / f'audio/vo-{ep}/vo-timing.json'))['lines']:
            if L['text'].startswith('[') or L['key'] in ('deux2', 'reste', 'ben'): continue
            md = mots_dits(L['text']); X.append(len(md)); S.append(sum(syllabes(m) for m in md))
            K.append(sum(1 for j in jetons(L['text'])[:-1] if re.search(PONCT, j)))
            Y.append(L['end'] - L['t'])
    for nom, F in (('syllabes', S), ('mots dits', X)):
        A = np.array([F, K], float).T; (b, p), *_ = np.linalg.lstsq(A, np.array(Y), rcond=None)
        rmse = float(np.sqrt(np.mean((A @ [b, p] - Y) ** 2)))
        print(f'{len(Y)} répliques : {1 / b:.2f} {nom}/s + {p:.2f} s par ponctuation interne (écart type {rmse:.2f} s) ;'
              f' débit moyen tout compris {sum(F) / sum(Y):.2f} {nom}/s')


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('take', nargs='?', default=None)
    ap.add_argument('--provisoire', action='store_true')
    ap.add_argument('--retenue', action='store_true')
    ap.add_argument('--unite', choices=('syllabes', 'mots'), default='syllabes')
    ap.add_argument('--debit', type=float, default=None, help='syllabes ou mots dits par seconde, après accélération')
    ap.add_argument('--pause-int', type=float, default=None, help='s par ponctuation interne')
    ap.add_argument('--plancher', type=float, default=PLANCHER)
    ap.add_argument('--modele', default='medium')
    ap.add_argument('--retranscrire', action='store_true')
    ap.add_argument('--sans-recalage', action='store_true')
    ap.add_argument('--sans-verif', action='store_true')
    ap.add_argument('--calibre', action='store_true')
    ap.add_argument('--force', action='store_true', help='écraser une voix retenue par une voix provisoire')
    args = ap.parse_args()
    verifie_texte()
    if args.calibre: return calibre()
    D.mkdir(parents=True, exist_ok=True)
    if args.provisoire or not args.take:
        vt = D / 'vo-timing.json'
        if vt.exists() and not json.load(open(vt)).get('provisional') and not args.force:
            sys.exit('vo-timing.json vient d\'une vraie prise : --force pour le remplacer par une estimation')
        debit = args.debit or DEBIT[args.unite]
        pause = PAUSE_INT[args.unite] if args.pause_int is None else args.pause_int
        timing = provisoire(args.unite, debit, pause, args.plancher)
        resume(timing); ok = controle(timing)
        sf.write(D / 'vo-placed.wav', np.zeros(int(timing['dur'] * SR)), SR)
        json.dump(timing, open(vt, 'w'), ensure_ascii=False, indent=1)
        print(f"→ vo-timing.json (provisoire, {debit} {args.unite}/s + {pause} s par pause interne), "
              f"vo-placed.wav muet de {timing['dur']} s · ouverture B estimée {timing['hookB']['t']}-{timing['hookB']['end']} s"
              + ('' if ok else ' · CONTRÔLES EN ÉCHEC'))
        return
    if not (D / args.take).exists(): sys.exit(f'{D / args.take} absent : déposer la prise, ou --provisoire')
    timing, out = pose(args.take, args)
    resume(timing); controle(timing)
    if args.retenue:
        DURf = timing['dur']
        sf.write(D / 'vo-placed.wav', out[:int(DURf * SR)], SR)
        json.dump(timing, open(D / 'vo-timing.json', 'w'), ensure_ascii=False, indent=1)
        tl = ROOT / 'timeline-mo11.json'
        if tl.exists():
            TLJ = json.load(open(tl)); TLJ['dur'] = DURf
            json.dump(TLJ, open(tl, 'w'), ensure_ascii=False, indent=1); open(tl, 'a').write('\n')
        print('→ vo-placed.wav, vo-timing.json' + (', timeline-mo11.json (durée)' if tl.exists() else ''))
        if not args.sans_verif: verifie_pose(D / 'vo-placed.wav', args.modele)


if __name__ == '__main__':
    main()
