"""Voix off de film-avatar1 : vraies prises de Simon (ElevenLabs, MO3) recoupées en 5 segments.
→ audio/vo-avatar1.wav (44,1 kHz mono), film-avatar1/words.json (mots recalés), film-avatar1/env.json (enveloppe 60 i/s)."""
import json, os, subprocess, numpy as np, soundfile as sf
V = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TK = os.path.join(V, 'audio', 'vo-takes', 'mo3')
SR = 44100
# (prise, début, fin, silence après) : début/fin choisis entre les mots (minutage Scribe des prises)
SEG = [('hookB-a', 0.00, 5.30, 0.28),   # Moins 1 200 € sur une voiture impeccable.
       ('body-a', 0.00, 7.40, 0.10),    # Ouais, les frais. Sur une voiture, parfaite.
       ('body-a', 7.72, 11.55, 0.16),   # Maintenant, avant d'acheter, je colle l'annonce dans Utopicar.
       ('body-a', 29.85, 33.60, 0.14),  # Je sais ce qu'il me reste avant d'acheter. Pas après.
       ('body-b', 31.98, 35.28, 0.00)]  # Commente débutant ou pro, je t'envoie le guide. (body-a coupe « guide » en fin de fichier)
def load(name):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(TK, name + '.mp3'), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
cache, out, words, t = {}, [], [], 0.0
fade = int(0.012 * SR)
for name, a, b, gap in SEG:
    x = cache.setdefault(name, load(name))[int(a * SR):int(b * SR)].copy()
    x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    for w, s, e in json.load(open(os.path.join(TK, name + '.words.json'), encoding='utf-8')):
        if w in ('«', '»') or e <= a or s >= b: continue
        words.append([w, round(t + max(s, a) - a, 3), round(t + min(e, b) - a, 3)])
    out.append(x); out.append(np.zeros(int(gap * SR), np.float32)); t += (b - a) + gap
y = np.concatenate(out)
sf.write(os.path.join(V, 'audio', 'vo-avatar1.wav'), y, SR, subtype='PCM_24')
# enveloppe pour la bouche : RMS sur 30 ms, 60 valeurs/s, normalisée au 95e centile
hop, win = SR // 60, int(0.03 * SR)
rms = np.array([np.sqrt(np.mean(y[max(0, i - win // 2):i + win // 2] ** 2) + 1e-12) for i in range(0, len(y), hop)])
db = 20 * np.log10(rms); lo, hi = np.percentile(db, 30), np.percentile(db, 97)
env = np.clip((db - lo) / (hi - lo), 0, 1)
json.dump(dict(fps=60, env=[round(float(v), 3) for v in env]), open(os.path.join(V, 'film-avatar1', 'env.json'), 'w'))
json.dump(dict(dur=round(len(y) / SR, 3), words=words), open(os.path.join(V, 'film-avatar1', 'words.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('VO', round(len(y) / SR, 2), 's,', len(words), 'mots')
print(' '.join(w[0] for w in words))
