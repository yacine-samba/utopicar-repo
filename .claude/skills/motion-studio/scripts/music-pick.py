"""Choisir et préparer une musique générée (ElevenLabs Music) : chaque prise est mesurée, mesure par mesure.
Vient de master60 (oct. 2026) : 4 prises demandées à 112 BPM ; une ne tenait pas le tempo (résidu 133 ms) et une
seule avait la forme qui servait le film (montée → coupure → drop → coup final).

usage : python3 scripts/music-pick.py prise1.mp3 [prise2.mp3 …] --bpm 112 [--out dossier] [--sim 16-23] [--take N]
Sorties : <out>/musique.md (rapport), <out>/musique.png (spectrogrammes, une ligne par prise, secondes marquées).

Pour chaque prise :
- tempo réel : régression linéaire sur les temps détectés (librosa, start_bpm = --bpm), résidu max en ms. Au-delà de
  30 ms, la prise ne tient pas le tempo : les coupes et les impacts glisseront ;
- rééchantillonnage vers le BPM du montage : resample_poly(y, up, down, axis=0), écart de hauteur inaudible (< 0,5 %) ;
- phase de la grille (instant du premier temps), par maximum de la force d'attaque sur la grille ;
- premier temps de mesure : celui des 4 temps où le grave (< 120 Hz) frappe le plus fort ;
- tableau mesure par mesure : grave, médium, aigu (dB) ; coupure = grave à 3 dB ou plus sous la médiane, drop =
  première mesure pleine après une coupure ou un trou, trou = 0,25 s au moins 12 dB sous la médiane de sa mesure
  (le silence juste avant un drop ; si plus de 30 % des mesures en ont, ce sont des arrêts du groove, signalés à part),
  fin = dernière mesure à moins de 30 dB du maximum.
Avec --sim a-b : distance entre mesures (chroma + MFCC) de la prise --take (1 = la première ; par défaut la plus
stable). Pour sauter de la fin de la mesure i au début de la mesure j sans que ça s'entende, j doit ressembler à i+1
(distance basse) ; une boucle de 4 mesures se voit à ses diagonales (16≈20, 17≈21…).
"""
import os, argparse
from fractions import Fraction
import numpy as np, librosa
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser()
ap.add_argument('src', nargs='+'); ap.add_argument('--bpm', type=float, required=True)
ap.add_argument('--out', default=None); ap.add_argument('--sim', default=None); ap.add_argument('--take', type=int, default=0)
A = ap.parse_args()
OUT = A.out or os.path.join(os.path.dirname(os.path.abspath(A.src[0])), 'musique')
os.makedirs(OUT, exist_ok=True)
SR = 22050
name = lambda p: os.path.splitext(os.path.basename(p))[0]


def analyse(path):
    y, _ = librosa.load(path, sr=SR, mono=True); dur = len(y) / SR
    oenv = librosa.onset.onset_strength(y=y, sr=SR, hop_length=128)
    _, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=SR, hop_length=128, start_bpm=A.bpm, tightness=400)
    bt = librosa.frames_to_time(beats, sr=SR, hop_length=128)
    n = np.arange(len(bt)); per, ph = np.polyfit(n, bt, 1); res = float(np.abs(bt - (per * n + ph)).max())
    oe = librosa.onset.onset_strength(y=y, sr=SR, hop_length=64); ts = librosa.times_like(oe, sr=SR, hop_length=64)
    phase = max(np.arange(0, per, 0.002), key=lambda q: np.interp(np.arange(q, dur - 1, per), ts, oe).sum())
    S = np.abs(librosa.stft(y, n_fft=4096, hop_length=512)); fr = librosa.fft_frequencies(sr=SR, n_fft=4096)
    tt = librosa.times_like(S, sr=SR, hop_length=512)
    def band(lo, hi, a, b):
        m = (tt >= a) & (tt < b)
        return 10 * np.log10((S[(fr >= lo) & (fr < hi)][:, m] ** 2).mean() + 1e-12) if m.any() else -120.0
    rms = librosa.feature.rms(y=y, frame_length=1102, hop_length=551)[0]
    rdb = 20 * np.log10(np.convolve(rms, np.ones(10) / 10, 'same') + 1e-9); rt = np.arange(len(rdb)) * 551 / SR
    grid = np.arange(phase, dur, per)
    hit = [np.mean([band(20, 120, b - 0.02, b + 0.08) for b in grid[k::4]]) for k in range(4)]
    d0 = float(grid[int(np.argmax(hit))]) % (4 * per)
    bars = []
    a = d0
    while a + 4 * per <= dur + 0.01:
        b = a + 4 * per
        seg = rdb[(rt >= a) & (rt < b)]
        bars.append(dict(t=a, g=band(20, 150, a, b), m=band(150, 2000, a, b), h=band(2000, 11000, a, b),
                         trou=bool(len(seg) and np.median(seg) - seg.min() > 12)))
        a = b
    top = max(x['g'] for x in bars); med = float(np.median([x['g'] for x in bars if x['g'] > top - 30]))
    regular = sum(x['trou'] for x in bars) > 0.3 * len(bars)      # arrêts dans le groove (toutes les 2 mesures…) : pas des drops
    if regular:
        for x in bars: x['trou'] = False
    prev_cut = False
    for i, x in enumerate(bars):
        x['mark'] = ''
        if prev_cut and x['g'] >= med - 1.5: x['mark'] = 'drop'; prev_cut = False
        if x['g'] < med - 3 and x['g'] > top - 30: x['mark'] = (x['mark'] + ' coupure').strip(); prev_cut = True
        if x['trou'] and x['g'] > top - 30: x['mark'] = (x['mark'] + ' trou').strip(); prev_cut = True
    alive = [i for i, x in enumerate(bars) if max(x['g'], x['m']) > top - 30]
    if alive: bars[alive[-1]]['mark'] = (bars[alive[-1]]['mark'] + ' fin').strip()
    bpm = 60 / per
    fr_ = Fraction(bpm / A.bpm).limit_denominator(6000)
    stable = res < 0.03 and abs(bpm - A.bpm) / A.bpm < 0.03
    return dict(path=path, y=y, dur=dur, bpm=bpm, res=res, phase=float(phase), d0=d0, per=per, bars=bars, regular=regular,
                up=fr_.numerator, down=fr_.denominator, stable=stable)


R = [analyse(p) for p in A.src]
L = ['# Musiques générées : mesure des prises', '',
     f'Tempo visé : {A.bpm:g} BPM. Prise stable = résidu < 30 ms et tempo à moins de 3 % du visé.', '',
     '| Prise | Durée | Tempo réel | Résidu max | 1er temps de mesure | Rééchantillonnage | Verdict |', '|---|---|---|---|---|---|---|']
for r in R:
    L.append(f"| {name(r['path'])} | {r['dur']:.1f} s | {r['bpm']:.3f} BPM | {r['res'] * 1000:.0f} ms | {r['d0']:.3f} s | "
             f"resample_poly(y, {r['up']}, {r['down']}) | {'stable' if r['stable'] else 'NE TIENT PAS LE TEMPO'} |")
for r in R:
    L += ['', f"## {name(r['path'])}", ''] + (['Arrêts réguliers dans le groove (trous dans plus de 30 % des mesures) : non marqués.', ''] if r['regular'] else [])
    L += ['| Mesure | Début (s) | Grave | Médium | Aigu | Repère |', '|---|---|---|---|---|---|']
    L += [f"| {i} | {x['t']:.2f} | {x['g']:.1f} | {x['m']:.1f} | {x['h']:.1f} | {x['mark']} |" for i, x in enumerate(r['bars'])]

if A.sim:
    lo, hi = map(int, A.sim.split('-'))
    r = R[A.take - 1] if A.take else min(R, key=lambda r: (not r['stable'], r['res']))
    y = r['y']
    def feat(k):
        a, b = r['d0'] + 4 * r['per'] * k, r['d0'] + 4 * r['per'] * (k + 1)
        seg = y[int(a * SR):int(b * SR)]
        c = librosa.feature.chroma_cqt(y=seg, sr=SR).mean(1); m = librosa.feature.mfcc(y=seg, sr=SR, n_mfcc=20).mean(1)
        return np.concatenate([c / (np.linalg.norm(c) + 1e-9) * 3, m / (np.linalg.norm(m) + 1e-9)])
    ks = [k for k in range(lo, hi + 1) if k < len(r['bars'])]
    F = {k: feat(k) for k in ks}
    L += ['', f"## Ressemblance des mesures {lo}–{hi} ({name(r['path'])})", '',
          'Distance chroma + MFCC (0 = identique ; < 0,4 = interchangeables).', '',
          '| | ' + ' | '.join(map(str, ks)) + ' |', '|---|' + '---|' * len(ks)]
    L += [f'| {i} | ' + ' | '.join(f'{np.linalg.norm(F[i] - F[j]):.2f}' for j in ks) + ' |' for i in ks]

# spectrogrammes : une ligne par prise, secondes marquées, premiers temps de mesure en jaune
W_, H_ = 1500, 160
img = Image.new('RGB', (W_, (H_ + 6) * len(R)), (20, 20, 20))
for i, r in enumerate(R):
    S = librosa.power_to_db(librosa.feature.melspectrogram(y=r['y'], sr=SR, n_mels=128, hop_length=441), ref=np.max)
    S = np.clip((S + 70) / 70, 0, 1)[::-1]
    im = Image.fromarray((np.stack([S ** 0.8, S ** 1.6, S ** 3], -1) * 255).astype(np.uint8)).resize((W_, H_))
    d = ImageDraw.Draw(im); k = W_ / r['dur']
    for x in r['bars']: d.line([(x['t'] * k, H_ - 10), (x['t'] * k, H_)], fill=(255, 220, 0))
    for s in range(0, int(r['dur']) + 1, 2): d.line([(s * k, 0), (s * k, 8)], fill=(255, 255, 255)); d.text((s * k + 2, 8), str(s), fill=(255, 255, 255))
    d.text((5, H_ - 28), name(r['path'])[:40] + ('' if r['stable'] else '  (tempo instable)'), fill=(255, 255, 0))
    img.paste(im, (0, i * (H_ + 6)))
img.save(os.path.join(OUT, 'musique.png'))
open(os.path.join(OUT, 'musique.md'), 'w').write('\n'.join(L) + '\n')
for r in R:
    marks = ', '.join(f"{x['mark']} m{i} ({x['t']:.2f} s)" for i, x in enumerate(r['bars']) if x['mark'])
    print(f"{name(r['path'])[:28]:28s} {r['bpm']:8.3f} BPM  résidu {r['res'] * 1000:4.0f} ms  1er temps {r['d0']:.3f} s  "
          f"{'stable' if r['stable'] else 'INSTABLE'}  {marks}{'  (arrêts réguliers dans le groove)' if r['regular'] else ''}")
print('→', os.path.join(OUT, 'musique.md'), '+ musique.png')
