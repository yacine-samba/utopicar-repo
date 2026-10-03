"""Prépare la voix de MO3 : prises retenues, silences resserrés, repères de phrases mesurés sur l'énergie.
usage : python3 scripts/vo-mo3.py
Entrées : audio/vo-takes/mo3/<prise>.mp3 (+ .words.json de faster-whisper).
Sorties : audio/vo-mo3-<bloc>.wav (48 kHz mono) et audio/vo-mo3.json :
  {bloc: {"dur": s, "regions": [[t0, t1, "texte de la région"], …]}}
Les horodatages de whisper glissent aux pauses (jusqu'à 1 s sur les ouvertures) : on prend les débuts et fins de
parole sur l'enveloppe d'énergie (précision 10 ms), et whisper sert seulement à nommer chaque région."""
import json, os
import numpy as np, librosa, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAKES = os.path.join(ROOT, 'audio/vo-takes/mo3')
# prise retenue par bloc, pause max conservée entre deux régions de parole (s)
PICK = {'A': ('hookA-a', 0.30), 'B': ('hookB-a', 0.30), 'C': ('hookC-b', 0.32), 'body': ('body-a', 0.72)}
SR = 48000; HOP = 480                                  # 10 ms

def regions(y):
    r = librosa.feature.rms(y=y, frame_length=2048, hop_length=HOP)[0]; db = 20 * np.log10(r + 1e-9)
    on = db > db.max() - 35; t = np.arange(len(r)) * HOP / SR; reg = []; s = None
    for i, v in enumerate(on):
        if v and s is None: s = i
        if not v and s is not None: reg.append([t[s], t[i]]); s = None
    if s is not None: reg.append([t[s], t[-1]])
    out = []
    for a, b in reg:
        if out and a - out[-1][1] < 0.12: out[-1][1] = b
        else: out.append([a, b])
    return [r for r in out if r[1] - r[0] > 0.06]

meta = {}
for blk, (take, gmax) in PICK.items():
    y, _ = librosa.load(os.path.join(TAKES, take + '.mp3'), sr=SR)
    reg = regions(y); words = json.load(open(os.path.join(TAKES, take + '.words.json')))
    pieces = []; new = []; t = 0.0; pad = 0.04
    for k, (a, b) in enumerate(reg):
        a0 = max(0, a - pad); b0 = min(len(y) / SR, b + pad)
        if k:
            gap = min(gmax, a - reg[k - 1][1]) - 2 * pad
            if gap > 0: pieces.append(np.zeros(int(gap * SR))); t += gap
        seg = y[int(a0 * SR):int(b0 * SR)].copy()
        f = int(0.008 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        pieces.append(seg)
        # mots de whisper dont le milieu tombe dans la région (élargie de 0,35 s : whisper glisse aux pauses)
        prev_b = reg[k - 1][1] if k else -1; nxt_a = reg[k + 1][0] if k + 1 < len(reg) else 1e9
        txt = ' '.join(w for w, s0, s1 in words if max(prev_b, a - 0.35) <= (s0 + s1) / 2 < min(nxt_a, b + 0.35) and w not in '«»')
        new.append([round(t + (a - a0), 3), round(t + (b - a0), 3), txt]); t += b0 - a0
    out = np.concatenate(pieces); out = out / (np.abs(out).max() + 1e-9) * 0.89
    sf.write(os.path.join(ROOT, f'audio/vo-mo3-{blk}.wav'), out, SR)
    meta[blk] = {'take': take, 'dur': round(len(out) / SR, 3), 'regions': new}
    print(f'{blk}: {take} {len(y) / SR:.2f} s → {len(out) / SR:.2f} s, {len(new)} régions')
    for r in new: print(f'   {r[0]:6.2f}–{r[1]:6.2f}  {r[2]}')
json.dump(meta, open(os.path.join(ROOT, 'audio/vo-mo3.json'), 'w'), ensure_ascii=False, indent=1)
