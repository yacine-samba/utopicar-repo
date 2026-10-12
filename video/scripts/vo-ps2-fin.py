"""PS2 : nouvelle fin de la voix (11 oct. 2026). « Trois jours offerts » annonçait un essai qui n'existe pas ; la fin
devient « Trois analyses offertes avec le code TIKTOK. Lien en bio ! » (prise trPt, l'autre dit « Liens »).
La voix posée par vo-c7-pose.py est coupée juste avant « Trois », la nouvelle fin est posée de la même façon
(silences ramenés à 0,34 s, × 1,12 comme le reste) et raccordée dans le silence. Puis transcription mot à mot.
usage (depuis video/, après python scripts/vo-c7-pose.py PS2) : python scripts/vo-ps2-fin.py"""
import json, os, subprocess, numpy as np, librosa, soundfile as sf, av
_o = av.open
def _p(*a, **k):
    k.pop('metadata_errors', None); return _o(*a, **k)
av.open = _p
from faster_whisper import WhisperModel

SR, D, RESPI, VITESSE = 48000, 'audio/vo-c7', 0.34, 1.12
FIN = 'PS2fin-trPtkZxUemkQGVw8ghlL'

W = json.load(open(os.path.join(D, 'PS2.words.json'), encoding='utf8'))
t3 = next(w['s'] for w in W if w['s'] > 20.5 and w['w'].strip(' ,.').lower() in ('3', 'trois'))   # « Trois jours offerts »
y = librosa.load(os.path.join(D, 'PS2.wav'), sr=SR)[0]
cut = int((t3 - 0.12) * SR); tete = y[:cut].copy(); f = int(0.01 * SR); tete[-f:] *= np.linspace(1, 0, f)

fin = librosa.load(os.path.join(D, FIN + '.mp3'), sr=SR)[0]
iv = librosa.effects.split(fin, top_db=40, frame_length=2048, hop_length=256)
parts, g = [], int(0.008 * SR)
for i, (a, b) in enumerate(iv):
    a = max(0, a - int(0.03 * SR)); b = min(len(fin), b + int(0.05 * SR)); s = fin[a:b].copy(); s[:g] *= np.linspace(0, 1, g); s[-g:] *= np.linspace(1, 0, g); parts.append(s)
    if i < len(iv) - 1: parts.append(np.zeros(int(max(0.0, min((iv[i + 1][0] - int(0.03 * SR) - b) / SR, RESPI)) * SR)))
tmp, tmp2 = os.path.join(D, '_fin.wav'), os.path.join(D, '_fin2.wav')
sf.write(tmp, np.concatenate(parts), SR, subtype='PCM_24')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-filter:a', f'atempo={VITESSE}', '-ar', str(SR), '-c:a', 'pcm_s24le', tmp2], check=True)
fin = librosa.load(tmp2, sr=SR)[0]; os.remove(tmp); os.remove(tmp2)

z = np.concatenate([tete, np.zeros(int(0.1 * SR)), fin, np.zeros(int(0.1 * SR))])
sf.write(os.path.join(D, 'PS2.wav'), z, SR, subtype='PCM_24')
M = WhisperModel('medium', device='cpu', compute_type='int8')
segs, _ = M.transcribe(os.path.join(D, 'PS2.wav'), language='fr', word_timestamps=True, vad_filter=False)
W = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
json.dump(W, open(os.path.join(D, 'PS2.words.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
print(f'PS2 : {len(z) / SR:5.2f} s · ' + ' '.join(f"{w['w']}[{w['s']:.2f}]" for w in W if w['s'] > 18))
