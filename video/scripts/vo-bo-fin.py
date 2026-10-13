"""Fin des débuts BO (vidéo complète) : après « …ton prix max, en une minute », la prise de Simon déjà enregistrée pour
PS2 (« Trois analyses offertes avec le code TIKTOK. Lien en bio ! », prise trPt) est raccordée à la voix posée, sans
nouvelle génération. Silences de la fin ramenés à 0,3 s, même vitesse que le début (× 1,2), puis transcription mot à mot.
usage (depuis video/, après python scripts/vo-c7-pose.py BO1) : python scripts/vo-bo-fin.py BO1"""
import json, os, sys, subprocess, numpy as np, librosa, soundfile as sf, av
_o = av.open
def _p(*a, **k):
    k.pop('metadata_errors', None); return _o(*a, **k)
av.open = _p
from faster_whisper import WhisperModel

ID = sys.argv[1]
SR, D, RESPI, VITESSE, PAUSE = 48000, 'audio/vo-c7', 0.3, 1.2, 0.45
FIN = 'PS2fin-trPtkZxUemkQGVw8ghlL'
tete = librosa.load(os.path.join(D, ID + '.wav'), sr=SR)[0]
tete = tete[:len(tete) - np.argmax(np.abs(tete[::-1]) > 1e-3)]          # sans le silence de fin
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
fin *= np.sqrt(np.mean(tete ** 2) / max(np.mean(fin ** 2), 1e-9))       # même niveau que le début
z = np.concatenate([tete, np.zeros(int(PAUSE * SR)), fin, np.zeros(int(0.1 * SR))])
sf.write(os.path.join(D, ID + '.wav'), z, SR, subtype='PCM_24')
M = WhisperModel('medium', device='cpu', compute_type='int8')
segs, _ = M.transcribe(os.path.join(D, ID + '.wav'), language='fr', word_timestamps=True, vad_filter=False)
W = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
json.dump(W, open(os.path.join(D, ID + '.words.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
print(f'{ID} : {len(z) / SR:5.2f} s · ' + ' '.join(f"{w['w']}[{w['s']:.2f}]" for w in W))
