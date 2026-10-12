"""Le dictionnaire du vendeur : transcription mot à mot des prises de Simon (faster-whisper medium) et mesures
(durée, débit, silences, hauteur). usage : python scripts/vo-dico-mots.py (depuis video/)"""
import json, glob, numpy as np, librosa, av
_o = av.open
def _p(*a, **k):
    k.pop('metadata_errors', None); return _o(*a, **k)
av.open = _p   # PyAV récent refuse metadata_errors (même correctif que vo-master60.py)
from faster_whisper import WhisperModel
M = WhisperModel('medium', device='cpu', compute_type='int8')
for f in sorted(glob.glob('audio/vo-dico/prise-*.mp3')):
    segs, _ = M.transcribe(f, language='fr', word_timestamps=True, vad_filter=False)
    W = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
    json.dump(W, open(f.replace('.mp3', '.words.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
    y, sr = librosa.load(f, sr=22050)
    f0, vf, _ = librosa.pyin(y, fmin=70, fmax=400, sr=sr)
    f0 = f0[~np.isnan(f0)]
    gaps = [(W[i]['e'], round(W[i + 1]['s'] - W[i]['e'], 2)) for i in range(len(W) - 1) if W[i + 1]['s'] - W[i]['e'] > 0.35]
    print(f'== {f} durée {len(y)/sr:.2f} s · {len(W)} mots · {len(W)/(W[-1]["e"]-W[0]["s"]):.2f} mots/s · premier mot {W[0]["s"]:.2f} s · hauteur médiane {np.median(f0):.0f} Hz, plage {12*np.log2(np.percentile(f0,95)/np.percentile(f0,5)):.1f} demi-tons')
    print(' '.join(f"{w['w']}[{w['s']:.2f}]" for w in W))
    print('silences > 0,35 s :', gaps)
