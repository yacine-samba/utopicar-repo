"""Mix final : musique + effets, cible -14 LUFS intégrés, true peak <= -1 dBTP.
usage : python3 scripts/mix.py → audio/mix.wav + docs/mix_report.txt
Loudness mesurée selon ITU-R BS.1770 (pyloudnorm) ; true peak mesuré sur signal suréchantillonné x4 ;
limiteur à anticipation appliqué seulement si nécessaire. Vérification indépendante par ffmpeg ebur128."""
import os, subprocess, re
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import resample_poly

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUT = '-' + os.environ['CUT'] if os.environ.get('CUT') else ''
A = lambda p: os.path.join(ROOT, p)
# HOOK=A|B : effets de l'ouverture choisie (audio/sfx<CUT>-<HOOK>.wav) → audio/mix<CUT>-<HOOK>.wav
HK = '-' + os.environ['HOOK'] if os.environ.get('HOOK') else ''
music, sr = sf.read(A(f'audio/music{CUT}.wav'))
if os.path.exists(A(f'audio/sfx{CUT}{HK}.wav')):
    sfx, sr2 = sf.read(A(f'audio/sfx{CUT}{HK}.wav')); assert sr == sr2 == 48000
    # SFX_HP=Hz : allège le sub des impacts pour un haut-parleur de téléphone
    if os.environ.get('SFX_HP'):
        from scipy.signal import butter, sosfilt
        sfx = sosfilt(butter(4, float(os.environ['SFX_HP']), 'high', fs=sr, output='sos'), sfx, axis=0)
    n = min(len(music), len(sfx)); mix = music[:n] * 0.72 + sfx[:n] * 0.9
else:  # bande-son complète déjà dans la musique (sound design)
    n = len(music); mix = music.copy()

# voix off (audio/vo<CUT>.wav|mp3) : posée à voLead, filtrée sous 80 Hz, légèrement compressée, devant la musique
# (la musique et les effets baissent sous la voix : attaque 20 ms, relâchement 250 ms, ≈ −9 dB)
# NO_VO=1 : version sans voix (même film, sous-titres seuls)
VO = None if os.environ.get('NO_VO') else next((A(f'audio/vo{CUT}.{e}') for e in ('wav', 'mp3') if os.path.exists(A(f'audio/vo{CUT}.{e}'))), None)
if VO:
    import json, librosa
    from scipy.signal import butter, sosfilt
    lead = json.load(open(A(f'timeline{CUT}.json'))).get('voLead', 0.15)
    v, _ = librosa.load(VO, sr=sr, mono=True)
    v = sosfilt(butter(2, 80, 'high', fs=sr, output='sos'), v)
    v = np.concatenate([np.zeros(int(lead * sr)), v])[:n]; v = np.pad(v, (0, n - len(v)))
    def follow(x, a, r):
        out = np.empty_like(x); c = 0.0; ka, kr = np.exp(-1 / (a * sr)), np.exp(-1 / (r * sr))
        for i, s_ in enumerate(np.abs(x)):
            k = ka if s_ > c else kr; c = s_ + (c - s_) * k; out[i] = c
        return out
    step = 16; ev = np.repeat(follow(v[::step], 0.02 / step * step, 0.25), step)[:n]
    ref = np.percentile(ev[ev > 1e-4], 70) if np.any(ev > 1e-4) else 1
    comp = np.minimum(1, (ref / np.maximum(ev, 1e-6)) ** 0.35)          # compression douce ≈ 1:1,5 au-dessus du niveau typique
    v = v * comp
    duck = 1 - 0.65 * np.clip(ev / ref, 0, 1)
    vr = np.sqrt(np.mean(v[np.abs(v) > 1e-4] ** 2)); mr = np.sqrt(np.mean(mix ** 2)) + 1e-9
    mix = mix * duck[:, None] + (v * (mr * 2.4 / vr))[:, None]
    print(f'voix : {os.path.relpath(VO, ROOT)} posée à {lead:.2f} s, musique baissée sous la voix')

TARGET, CEIL = -14.0, -1.0
# plafond de travail plus bas que la cible : l'encodage AAC ajoute jusqu'à ~2 dB de dépassement sur les crêtes
# (mesuré sur le MP4 de la v5) ; MIX_CEIL permet de régler cette marge.
WORK = float(os.environ.get('MIX_CEIL', CEIL))
meter = pyln.Meter(sr)
def true_peak_db(x):
    up = resample_poly(x, 4, 1, axis=0)
    return 20 * np.log10(np.abs(up).max() + 1e-12)
def limit(x, ceil_db):
    # gain calculé sur le pic suréchantillonné, anticipation 2 ms, relâchement 60 ms
    c = 10 ** (ceil_db / 20)
    up = np.abs(resample_poly(x, 4, 1, axis=0)).max(1).reshape(-1, 4).max(1)[:len(x)]
    g = np.minimum(1, c / np.maximum(up, 1e-9))
    la = int(0.002 * sr)
    g = np.minimum.reduce([np.roll(g, -k) for k in range(la)])
    rel = np.exp(-1 / (0.06 * sr)); out = np.empty_like(g); cur = 1.0
    for i, v in enumerate(g):
        cur = v if v < cur else v + (cur - v) * rel
        out[i] = cur
    return x * out[:, None]

for it in range(6):
    lufs = meter.integrated_loudness(mix)
    mix = mix * 10 ** ((TARGET - lufs) / 20)
    tp = true_peak_db(mix)
    if tp <= WORK - 0.05: break
    mix = limit(mix, WORK - 0.3)
lufs, tp = meter.integrated_loudness(mix), true_peak_db(mix)
sf.write(A(f'audio/mix{CUT}{HK}.wav'), mix, sr, subtype='PCM_24')

# vérification indépendante
r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', A(f'audio/mix{CUT}{HK}.wav'), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
I = re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]; TP = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)[-1]
rep = (f"Mix : {n / sr:.2f} s, 48 kHz stéréo 24 bits\n"
       f"pyloudnorm : {lufs:.2f} LUFS intégrés, true peak {tp:.2f} dBTP (x4)\n"
       f"ffmpeg ebur128 : I = {I} LUFS, true peak = {TP} dBTP\n"
       f"Cible : -14 LUFS, true peak <= -1 dBTP → {'OK' if abs(float(I) + 14) <= 0.5 and float(TP) <= -1.0 else 'HORS CIBLE'}\n")
os.makedirs(A('docs'), exist_ok=True)
open(A(f'docs/mix_report{CUT}{HK}.txt'), 'w').write(rep)
print(rep, end='')
