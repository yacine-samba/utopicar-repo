"""Démo de casting voix : pose un extrait de voix off sur un lit musical léger calé sur ses mots.
usage : python3 scripts/voice_demo.py audio/voix-choix/v4/<voix>.mp3 [...]
Transcrit l'extrait (faster-whisper, horodatage mot à mot), puis : groove pop (musique v6) dès 0 s, arrêt net façon
« disque qui ralentit » sur le premier « Ah » (la surprise), reprise sur mot après « Non », petite montée et accent sur le
dernier « Ah ouais ». Sortie : <voix>-demo.mp3 à −14 LUFS. Sert à choisir une voix en l'entendant dans son contexte."""
import sys, os, re, subprocess
import numpy as np, soundfile as sf, librosa, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
from faster_whisper import WhisperModel

SR = 48000; ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rng = np.random.default_rng(7)
hp = lambda x, f: sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def tape_stop(x, dur=0.35):                         # le son ralentit jusqu'à l'arrêt
    n = int(dur * SR); idx = np.cumsum(np.linspace(1, 0, n)); idx = idx[idx < len(x) - 1]
    return np.interp(idx, np.arange(len(x)), x) * np.linspace(1, 0.2, len(idx))
def riser(dur):
    n = int(dur * SR); x = rng.standard_normal(n); out = np.zeros(n)
    for i in range(0, n, 2400):
        c = 800 + 7000 * (i / n) ** 2; out[i:i + 2400] = bp(x[i:i + 2400], c * 0.6, min(c * 1.4, 20000))
    return out * (np.arange(n) / n) ** 2 * 0.25
def pop():
    n = int(0.25 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * (900 + 700 * np.exp(-t / 0.03)) * t) + 0.5 * np.sin(2 * np.pi * 1760 * t)) * env(n, 0.002, 0.06) * 0.6
def put(dst, x, t):
    i = int(t * SR); j = min(len(dst), i + len(x))
    if 0 <= i < len(dst): dst[i:j] += x[:j - i]

model = WhisperModel('small', device='cpu', compute_type='int8')
groove, gsr = sf.read(os.path.join(ROOT, 'audio/music-chat.wav')); groove = groove.mean(1)
if gsr != SR: groove = librosa.resample(groove, orig_sr=gsr, target_sr=SR)
groove = groove[int(28.125 * SR):]                  # section pleine du morceau
for path in sys.argv[1:]:
    v, _ = librosa.load(path, sr=SR, mono=True)
    lead = 0.15; v = np.concatenate([np.zeros(int(lead * SR)), v])
    segs, _ = model.transcribe(path, language='fr', word_timestamps=True)
    W = [(w.word.strip().lower().strip('.,…?!'), w.start + lead, w.end + lead) for s in segs for w in s.words]
    ahs = [w for w in W if re.fullmatch(r'ah+|a', w[0])]
    t_ah = ahs[0][1] if ahs else W[len(W) // 3][1]
    i_non = next((i for i, w in enumerate(W) if w[0] == 'non' and w[1] > t_ah), None)
    t_fr = W[i_non + 1][1] if i_non is not None and i_non + 1 < len(W) else t_ah + 1.2
    t_last = ahs[-1][1] if len(ahs) > 1 else W[-2][1]
    L = len(v) + int(2.0 * SR); bed = np.zeros(L)
    a = int((t_ah - 0.05) * SR)
    bed[:a] = groove[:a]
    put(bed, tape_stop(groove[a:a + SR]), t_ah - 0.05)
    b = int(t_fr * SR); put(bed, groove[a:a + L - b] * np.minimum(1, np.arange(L - b) / (0.02 * SR)), t_fr)
    put(bed, riser(1.2), t_last - 1.2); put(bed, pop() * 1.5, t_last)
    # voix devant : la musique baisse sous la voix
    e = np.convolve(np.abs(v), np.ones(int(0.05 * SR)) / int(0.05 * SR), 'same'); e = np.pad(e, (0, L - len(e)))
    duck = 1 - 0.55 * np.clip(e / (np.percentile(e, 90) + 1e-9), 0, 1)
    duck = np.convolve(duck, np.ones(int(0.1 * SR)) / int(0.1 * SR), 'same')
    vv = np.pad(hp(v, 80), (0, L - len(v)))
    mix = vv / (np.sqrt(np.mean(vv[vv != 0] ** 2)) + 1e-9) * 0.12 + bed * 0.14 * duck
    fade = np.ones(L); fade[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR)); mix *= fade
    mix *= 10 ** ((-14 - pyln.Meter(SR).integrated_loudness(mix)) / 20)
    mix = np.tanh(mix * 1.2) / 1.2
    out = path.replace('.mp3', '-demo.wav'); sf.write(out, np.stack([mix, mix], 1), SR)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', out, '-af', 'loudnorm=I=-14:TP=-1.5', '-ar', '48000',
                    '-b:a', '192k', out.replace('.wav', '.mp3')]); os.remove(out)
    print(os.path.basename(path), f'« Ah » {t_ah:.2f} s, mot après « Non » {t_fr:.2f} s, dernier « Ah » {t_last:.2f} s,',
          f'{len(W)} mots / {W[-1][2] - W[0][1]:.1f} s :', ' '.join(w[0] for w in W))
