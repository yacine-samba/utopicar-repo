"""Pose des voix des motions (A01 à A07, dico2) : prise choisie, silences ramenés à une respiration, mots horodatés.

Les silences se repèrent à l'énergie (sous −40 dB du pic), pas aux mots : les « hmm », « pfff », soupirs et rires de
Simon ne sont pas transcrits mais ont de l'énergie, ils restent donc intacts. Chaque silence de plus de RESPI est
ramené à RESPI (fondus de 8 ms), le premier son est calé à 0,04 s.
dico2 : la prise ldpO (« Utopicar » bien dit) jusqu'à « avant d'appeler », puis la fin de la prise CWBq (« t'as lu
quoi », la ldpO dit « t'as du quoi »), raccordées dans le silence.
Sorties : audio/vo-c7/<id>.wav (48 kHz) et <id>.words.json (faster-whisper medium sur la voix posée).
usage : python scripts/vo-c7-pose.py [id1,id2…] (depuis video/)"""
import json, os, subprocess, numpy as np, librosa, soundfile as sf, av
_o = av.open
def _p(*a, **k):
    k.pop('metadata_errors', None); return _o(*a, **k)
av.open = _p
from faster_whisper import WhisperModel

SR, RESPI, D = 48000, 0.26, 'audio/vo-c7'
MAXV = 19.0      # voix posée la plus longue (s) : avec le carton de fin, la vidéo tient en 20 s
CHOIX = {'A01': 'A01-riIzFaIBI0Mr7cu3XfqQ', 'A02': 'A02-oMjM1I0oV22N7fv5tZuS', 'A03': 'A03-yw3T4LOfM2BVqd26GhtC',
         'A04': 'A04-nHQsTNusoCjPEmHB3RNB', 'A05': 'A05-7Q63qkM9njXNMyXD9eSe', 'A06': 'A06-7yn5gdp4TDpuq1sdBcE1',
         'A07': 'A07-eB1wSqxwLhiMxG8E5ept', 'PS1': 'PS1-imM817FTKxWtMDJg6Eb3', 'PS2': 'PS2-czjz141OTKyHEiTDv6fM', 'FI1': 'FI1-ugx5MlWqn8XV1oU4ZxbH'}
RESPI_ID = {'PS1': 0.42, 'PS2': 0.34, 'FI1': 0.3}
MAXV_ID = {'PS2': 20.6, 'FI1': 7.1}   # FI1 : vidéo de moins de 8 s   # PS2 : film de 22 s environ, carton compris   # PS1 (problème → solution, ≈ 22 s) : les pauses et le soupir portent la chute, on les laisse respirer
import sys
ONLY = sys.argv[1].split(',') if len(sys.argv) > 1 else None
load = lambda n: librosa.load(os.path.join(D, n + '.mp3'), sr=SR, mono=True)[0]
words = lambda n: json.load(open(os.path.join(D, n + '.words.json'), encoding='utf8'))

def tighten(y, respi=RESPI):
    iv = librosa.effects.split(y, top_db=40, frame_length=2048, hop_length=256)   # 40 dB : soupirs, « pfff » et respirations gardés (un seuil à 32 dB les coupait)
    f = int(0.008 * SR); out = [np.zeros(int(0.04 * SR))]
    for i, (a, b) in enumerate(iv):
        a = max(0, a - int(0.03 * SR)); b = min(len(y), b + int(0.05 * SR))      # marge : attaques et queues de mots
        seg = y[a:b].copy(); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        out.append(seg)
        if i < len(iv) - 1:
            gap = (iv[i + 1][0] - int(0.03 * SR) - b) / SR
            out.append(np.zeros(int(max(0.0, min(gap, respi)) * SR)))
    out.append(np.zeros(int(0.1 * SR)))
    return np.concatenate(out)

src = {k: load(v) for k, v in CHOIX.items() if not ONLY or k in ONLY}
# dico2 : raccord des deux prises dans le silence avant « T'as »
a, b = 'dico2-ldpOIbqnncmYLg6f1UsX', 'dico2-CWBqdPsl9tYR7NGTikGJ'
wa, wb = words(a), words(b)
cut_a = next(w for w in wa if w['w'].lower().startswith("'appeler"))['e'] + 0.12
cut_b = next(w for w in wb if w['w'].lower() == 't')['s'] - 0.06
ya, yb = load(a), load(b)
if not ONLY or 'dico2' in ONLY: src['dico2'] = np.concatenate([ya[:int(cut_a * SR)], np.zeros(int(0.2 * SR)), yb[int(cut_b * SR):]])

M = WhisperModel('medium', device='cpu', compute_type='int8')
for k, y in src.items():
    z = tighten(y, RESPI_ID.get(k, RESPI))
    sf.write(os.path.join(D, k + '.wav'), z, SR, subtype='PCM_24')
    mx = MAXV_ID.get(k, MAXV)
    if len(z) / SR > mx:    # légère accélération sans changer la hauteur (ffmpeg atempo), plafonnée à × 1,12
        sp = min(1.12, len(z) / SR / mx); tmp = os.path.join(D, k + '.lent.wav'); os.replace(os.path.join(D, k + '.wav'), tmp)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-filter:a', f'atempo={sp:.4f}', '-ar', str(SR), '-c:a', 'pcm_s24le', os.path.join(D, k + '.wav')], check=True)
        os.remove(tmp); z = librosa.load(os.path.join(D, k + '.wav'), sr=SR)[0]; print(f'{k}: accéléré × {sp:.3f}')
    segs, _ = M.transcribe(os.path.join(D, k + '.wav'), language='fr', word_timestamps=True, vad_filter=False)
    W = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
    json.dump(W, open(os.path.join(D, k + '.words.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
    print(f'{k}: {len(y) / SR:5.2f} s → {len(z) / SR:5.2f} s · ' + ' '.join(f"{w['w']}[{w['s']:.2f}]" for w in W))
