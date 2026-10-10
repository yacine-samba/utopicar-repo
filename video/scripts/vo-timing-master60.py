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
        ('ahouais', 'ah', 23.0), ('quinze', '15', 24.0), ('pfff', 'pfff', 25.0), ('carnet', 'carnet', 26.5),
        ('calculette', 'calculette', 27.0), ('onglets', 'onglets', 28.0), ('hop', 'hop', 29.5), ('tableau', 'tableau', 30.0),
        ('matin', 'matin', 31.5), ('n308', '308', 33.0), ('n63', '63', 34.0), ('baisse', 'baisse', 35.5), ('a3', 'a3', 36.5),
        ('ding', 'ding', 37.5), ('alerte', 'alerte', 38.0), ('marge', 'marge', 39.5), ('voiture', 'voiture', 40.5),
        ('debutes', 'debutes', 41.5), ('starter', 'starter', 42.5), ('seule', 'seule', 43.5), ('ans', 'ans', 45.5),
        ('parc', 'parc', 46.5), ('pro', 'pro', 47.5), ('essaie', 'trois', 48.0), ('carte', 'carte', 48.5), ('bio', 'bio', 50.0),
        ('chiffres', 'chiffres', 50.5), ('appeler', 'appeler', 52.0), ('utopicar2', 'utopicar', 53.0)]

if __name__ == '__main__':
    A = mots(f'{OUT}/vo-placed-A.wav'); B = mots(f'{OUT}/vo-placed-B.wav')
    marks = {}
    for k, n, after in CLES:
        w = next((w for w in A if w['n'].startswith(n) and w['s'] >= after), None)
        if w: marks[k] = dict(t=w['s'], end=w['e'], mot=w['w'])
        else: print('absent :', k)
    hook = lambda W: dict(debut=W[0]['s'], fin=max(w['e'] for w in W if w['s'] < 4.1), mots=[w for w in W if w['s'] < 4.1])
    dur = sf.info(f'{OUT}/vo-placed-A.wav').duration
    json.dump(dict(dur=round(dur, 3), corps=4.23, hooks=dict(A=hook(A), B=hook(B)), marks=marks), open(f'{OUT}/vo-timing.json', 'w'), ensure_ascii=False, indent=1)
    for k, v in marks.items(): print(f"{k:11s} {v['t']:6.2f} {v['mot']}")
