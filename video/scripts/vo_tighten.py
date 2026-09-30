"""Resserre une prise de voix off pour tenir une durée : raccourcit les silences, puis accélère légèrement sans changer
la hauteur (ffmpeg atempo). usage : python3 scripts/vo_tighten.py <prise.mp3> <sortie.wav> <durée cible s> [pause s]
Silence = énergie sous −30 dB (SIL_DB) du niveau de crête lissé pendant plus de 0,25 s (SIL_MIN) ; chaque silence est ramené à `pause`
(défaut 0,28 s) avec des fondus de 10 ms. L'accélération est bornée à 1,10 pour garder une voix naturelle."""
import sys, subprocess
import numpy as np, soundfile as sf, librosa

src, dst, target = sys.argv[1], sys.argv[2], float(sys.argv[3])
PAUSE = float(sys.argv[4]) if len(sys.argv) > 4 else 0.28
SR = 48000
v, _ = librosa.load(src, sr=SR, mono=True)
hop = int(0.01 * SR)
rms = np.sqrt(np.convolve(v ** 2, np.ones(hop) / hop, 'same'))[::hop]
db = 20 * np.log10(rms + 1e-9); thr = np.percentile(db, 95) - float(__import__('os').environ.get('SIL_DB', 30))
silent = db < thr
runs, i = [], 0
while i < len(silent):
    if silent[i]:
        j = i
        while j < len(silent) and silent[j]: j += 1
        if (j - i) * 0.01 > float(__import__('os').environ.get('SIL_MIN', 0.25)) and i > 0 and j < len(silent): runs.append((i * hop, j * hop))
        i = j
    else: i += 1
out, last, fade = [], 0, int(0.01 * SR)
keep = int(PAUSE * SR)
for a, b in runs:
    seg = v[last:a + keep // 2].copy(); seg[-fade:] *= np.linspace(1, 0, fade)
    out.append(seg)
    nxt = b - keep // 2; last = nxt
    out.append(np.zeros(0))
    v[nxt:nxt + fade] *= np.linspace(0, 1, fade)
out.append(v[last:])
y = np.concatenate(out)
dur = len(y) / SR
tempo = min(1.10, max(1.0, dur / target))
tmp = dst + '.tmp.wav'; sf.write(tmp, y, SR, subtype='PCM_24')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af', f'atempo={tempo:.4f}', '-ar', str(SR), dst], check=True)
subprocess.run(['rm', tmp])
print(f'{len(runs)} silences ramenés à {PAUSE} s : {len(v) / SR:.2f} s → {dur:.2f} s ; atempo {tempo:.3f} → {dur / tempo:.2f} s')
