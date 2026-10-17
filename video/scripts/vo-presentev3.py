"""Présentation avec Simon : pose de la voix et mots horodatés.
Prise eleven_v4 v3 (14 oct. 2026, refonte : prix d'offre, plafond, parc ; prise fOIx9, la plus expressive des 4 : 14,8 demi-tons), gardée telle quelle : respirations déjà courtes (≤ 0,31 s), aucun silence ajouté
ni retiré (leçon NEGO). 40 ms de marge au début. Mots : faster-whisper medium, débuts recalés sur l'attaque de la voix
(scripts/words_snap.py). Sorties : audio/vo-presentev3/vo.wav (48 kHz), vo.words.json.
usage : python3 scripts/vo-presentev3.py   (depuis video/)"""
import json, os, sys, numpy as np, librosa, soundfile as sf, av
_o = av.open
def _p(*a, **k):
    k.pop('metadata_errors', None); return _o(*a, **k)
av.open = _p
from faster_whisper import WhisperModel
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from words_snap import snap
D, SR = 'audio/vo-presentev3', 48000
y = librosa.load(os.path.join(D, 'prise-fOIx9W0e7dWf90q3jkaA.mp3'), sr=SR, mono=True)[0]
a, b = librosa.effects.split(y, top_db=40)[[0, -1]][:, [0, 1]].T
y = np.concatenate([np.zeros(int(0.04 * SR)), y[max(0, a[0] - int(0.02 * SR)):min(len(y), b[1] + int(0.08 * SR))], np.zeros(int(0.1 * SR))])
sf.write(os.path.join(D, 'vo.wav'), y, SR, subtype='PCM_24')
segs, _ = WhisperModel('medium', device='cpu', compute_type='int8').transcribe(os.path.join(D, 'vo.wav'), language='fr', word_timestamps=True, vad_filter=False)
W = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
W, mv = snap(os.path.join(D, 'vo.wav'), W)
json.dump(W, open(os.path.join(D, 'vo.words.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
print(f'{len(y) / SR:.2f} s · recalés : {mv}'); print(' '.join(f"{w['w']}[{w['s']:.2f}]" for w in W))
