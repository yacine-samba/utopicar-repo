"""Présentation v11 avec Simon : pose de la voix et mots horodatés.
Prise eleven_v4 v11 (17 oct. 2026, texte du parcours en 4 étapes ; 2 prises). Choix mesuré (compare-prises dans le
journal de la v11) : Uy7VO2vX, aucun mot faux à la transcription (les écarts restants sont des homophones : cette/cet,
paie/paye, payés/payé), « En quatre étapes. » détaché en phrase, « revendre » d'un seul tenant, 23,2 demi-tons,
silence le plus long 0,43 s. Accélérée × 1,05 (atempo, sous la limite de × 1,1 où ça s'entend) : 5,75 → 6,0 syllabes
par seconde, plus vif que la v10 (5,2) sans presser les chiffres. Aucun silence ajouté ni retiré (leçon NEGO).
40 ms de marge au début. Mots : faster-whisper medium, débuts recalés sur l'attaque de la voix (scripts/words_snap.py).
Sorties : audio/vo-presentev11/brut/vo.wav (48 kHz), vo.words.json.
usage : python3 scripts/vo-presentev11.py   (depuis video/)"""
import json, os, subprocess, sys, numpy as np, librosa, soundfile as sf, av
_o = av.open
def _p(*a, **k):
    k.pop('metadata_errors', None); return _o(*a, **k)
av.open = _p
from faster_whisper import WhisperModel
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from words_snap import snap
D, SR, TEMPO = 'audio/vo-presentev11/brut', 48000, 1.05; os.makedirs(D, exist_ok=True)
acc = os.path.join(D, 'prise-acceleree.wav')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(os.path.dirname(D), 'prise-Uy7VO2vXc3e6nBPnZBcR.mp3'),
                '-af', f'aresample={SR},atempo={TEMPO}', '-ac', '1', '-c:a', 'pcm_f32le', acc], check=True)
y = librosa.load(acc, sr=SR, mono=True)[0]; os.remove(acc)
a, b = librosa.effects.split(y, top_db=40)[[0, -1]][:, [0, 1]].T
y = np.concatenate([np.zeros(int(0.04 * SR)), y[max(0, a[0] - int(0.02 * SR)):min(len(y), b[1] + int(0.08 * SR))], np.zeros(int(0.1 * SR))])
sf.write(os.path.join(D, 'vo.wav'), y, SR, subtype='PCM_24')
segs, _ = WhisperModel('medium', device='cpu', compute_type='int8').transcribe(os.path.join(D, 'vo.wav'), language='fr', word_timestamps=True, vad_filter=False, initial_prompt='utopicar, Polo, Clio, achat-revente')
W = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
W, mv = snap(os.path.join(D, 'vo.wav'), W)
json.dump(W, open(os.path.join(D, 'vo.words.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
print(f'{len(y) / SR:.2f} s · recalés : {mv}'); print(' '.join(f"{w['w']}[{w['s']:.2f}]" for w in W))
