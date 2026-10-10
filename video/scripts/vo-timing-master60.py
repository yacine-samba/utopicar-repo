"""master60 : repères du film lus dans la voix posée (faster-whisper medium, mots horodatés).

Sortie : audio/vo-master60/vo-timing.json = { dur, corps, hooks: {A: {...}, B: {...}}, marks: {clé: {t, end, mot}} }.
Les repères du corps sont lus sur la version A (le corps est identique dans A et B, posé à 4,23 s).
usage : python3 scripts/vo-timing-master60.py   (depuis video/, après scripts/vo-master60.py)
"""
import json, re, unicodedata, av
_o = av.open
def _p(*a, **k):
    k.pop('metadata_errors', None); return _o(*a, **k)
av.open = _p
from faster_whisper import WhisperModel
import soundfile as sf
import librosa, numpy as np

def silences(y, SR=44100):
    """Silences de plus de 0,12 s (début, fin en s) d'après l'enveloppe à 10 ms."""
    hop = 441
    db = 20 * np.log10(librosa.feature.rms(y=y, frame_length=1764, hop_length=hop)[0] + 1e-9)
    act = db > db.max() - 40
    t = np.arange(len(act)) * hop / SR
    out, st = [], None
    for i, a in enumerate(act):
        if not a and st is None: st = t[i]
        if a and st is not None:
            if t[i] - st > 0.12: out.append((st, t[i]))
            st = None
    return out

M = WhisperModel('medium', device='cpu', compute_type='int8')
OUT = 'audio/vo-master60'
norm = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())

def mots(f):
    segs, _ = M.transcribe(f, language='fr', word_timestamps=True, initial_prompt="UTOPICAR, Mercedes, A3, Starter, Pro. Ah. Non. Ding ! Pfff. Hop !")
    return [dict(w=w.word.strip(), n=norm(w.word), s=round(w.start, 3), e=round(w.end, 3)) for s in segs for w in s.words]

# clé → (mot normalisé, à chercher après t)
CLES = [('celle', 'celle', 4.0), ('achetes', 'achetes', 4.0), ('colle', 'colle', 6.0), ('ah', 'ah', 7.5), ('non', 'non', 8.0),
        ('n1650', '1650', 9.5), ('vendeur', 'vendeur', 10.0), ('bizarre', 'bizarre', 12.0), ('utopicar', 'utopicar', 13.5),
        ('bam', 'bam', 15.0), ('reste', 'reste', 16.0), ('frais', 'frais', 16.5), ('mercedes', 'mercedes', 18.0),
        ('prixmax', 'prix', 19.5), ('n16500', '16500', 19.5), ('attends', 'attends', 21.0), ('trois', 'trois', 22.0),
        ('ahouais', 'ah', 23.0), ('quinze', ('15', 'quinze'), 24.0), ('pfff', ('pf', 'pff', 'pfff', 'pfff'), 25.0), ('carnet', 'carnet', 26.5),
        ('calculette', 'calculette', 27.0), ('onglets', 'onglets', 28.0), ('hop', 'hop', 29.5), ('tableau', 'tableau', 30.0),
        ('matin', 'matin', 31.5), ('n308', '308', 33.0), ('n63', '63', 34.0), ('baisse', 'baisse', 35.5), ('a3', 'a3', 36.5),
        ('ding', 'ding', 37.5), ('alerte', 'alerte', 38.0), ('marge', 'marge', 39.5), ('voiture', 'voiture', 40.5),
        ('debutes', 'debutes', 41.5), ('starter', 'starter', 42.5), ('seule', 'seule', 43.5), ('ans', 'ans', 45.5),
        ('parc', 'parc', 46.5), ('pro', 'pro', 47.5), ('essaie', 'trois', 48.0), ('carte', 'carte', 48.5), ('bio', 'bio', 50.0),
        ('chiffres', 'chiffres', 50.5), ('appeler', 'appeler', 52.0), ('utopicar2', 'utopicar', 53.0)]

if __name__ == '__main__':
    A = mots(f'{OUT}/vo-placed-A.wav'); B = mots(f'{OUT}/vo-placed-B.wav')
    y, _ = librosa.load(f'{OUT}/vo-placed-A.wav', sr=44100); SIL = silences(y)
    marks = {}
    for k, n, after in CLES:
        ns = n if isinstance(n, tuple) else (n,)
        w = next((w for w in A if any(w['n'].startswith(x) for x in ns) and w['s'] >= after), None)
        if w:
            t = w['s']
            # mot qui suit un silence : son attaque réelle (fin du silence) est plus précise que l'horodatage de Whisper
            att = [b for a_, b in SIL if t - 0.25 <= b <= t + 0.12]
            if att: t = round(att[-1], 3)
            marks[k] = dict(t=t, end=w['e'], mot=w['w'])
        else: print('absent :', k)
    hook = lambda W: dict(debut=W[0]['s'], fin=max(w['e'] for w in W if w['s'] < 4.1), mots=[w for w in W if w['s'] < 4.1])
    dur = sf.info(f'{OUT}/vo-placed-A.wav').duration
    json.dump(dict(dur=round(dur, 3), corps=4.23, hooks=dict(A=hook(A), B=hook(B)), marks=marks), open(f'{OUT}/vo-timing.json', 'w'), ensure_ascii=False, indent=1)
    for k, v in marks.items(): print(f"{k:11s} {v['t']:6.2f} {v['mot']}")
