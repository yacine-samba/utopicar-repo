"""master60 : cale la voix posée sur la grille de la musique (112 BPM).

Chaque mot fort qui suit un silence (« Ah. », « Non. », « Hop ! », « Ding ! »…) est amené sur le temps le plus proche en
allongeant ou en raccourcissant ce silence (jamais sous 0,12 s, jamais plus d'un demi-temps). La prise, le débit et la
diction ne changent pas : seules les pauses bougent. Les mêmes coupes s'appliquent aux ouvertures A et B (même corps).
Grille : premier temps sur « Celle-là » (début du corps), puis tous les 60/112 s. Sortie : audio/vo-master60/grille.json.

usage (depuis video/) : python3 scripts/vo-master60.py && python3 scripts/cale-master60.py && python3 scripts/vo-timing-master60.py
"""
import json, os, shutil
import numpy as np, librosa, soundfile as sf

OUT = 'audio/vo-master60'
SR = 44100
BPM = 112
BEAT = 60 / BPM
# repères de la pose d'origine (avant calage) : le script repart toujours de là
VT = json.load(open(f'{OUT}/vo-timing.avant-cale.json' if os.path.exists(f'{OUT}/vo-timing.avant-cale.json') else f'{OUT}/vo-timing.json'))
M = {k: v['t'] for k, v in VT['marks'].items()}
ANCRE = M['celle']           # premier temps du corps (recalé sur l'attaque réelle plus bas)
CIBLES = ['colle', 'ah', 'non', 'n1650', 'bizarre', 'utopicar', 'bam', 'mercedes', 'prixmax', 'attends', 'trois', 'ahouais', 'quinze',
          'pfff', 'carnet', 'calculette', 'onglets', 'hop', 'tableau', 'n308', 'baisse', 'a3', 'ding', 'alerte', 'marge', 'debutes',
          'starter', 'seule', 'parc', 'pro', 'essaie', 'bio', 'chiffres', 'utopicar2']

def silences(y):
    hop = 441
    db = 20 * np.log10(librosa.feature.rms(y=y, frame_length=1764, hop_length=hop)[0] + 1e-9)
    act = db > db.max() - 40
    t = np.arange(len(act)) * hop / SR
    out, st = [], None
    for i, a in enumerate(act):
        if not a and st is None: st = t[i]
        if a and st is not None:
            if t[i] - st > 0.12: out.append((st, t[i]))
            st = None
    return out

if __name__ == '__main__':
    src = {h: f'{OUT}/vo-placed-{h}.avant-cale.wav' for h in 'AB'}
    for h in 'AB':                                   # on repart toujours de la pose d'origine
        if not os.path.exists(src[h]): shutil.copy(f'{OUT}/vo-placed-{h}.wav', src[h])
    y, _ = librosa.load(src['A'], sr=SR)
    SA = silences(y)
    ANCRE = next((b for a, b in SA if M['celle'] - 0.25 <= b <= M['celle'] + 0.12), M['celle'])   # attaque réelle de « Celle »
    print('premier temps :', round(ANCRE, 3))
    S = [s for s in SA if s[0] > VT['corps'] - 0.05]
    edits, decal = [], 0.0                            # (instant du silence dans l'original, durée ajoutée)
    for k in sorted(CIBLES, key=lambda k: M[k]):
        t = M[k]
        sil = [s for s in S if t - 0.45 <= s[1] <= t + 0.03]
        if not sil: continue
        a, b = sil[-1]
        if any(abs(e[0] - (a + b) / 2) < 1e-3 for e in edits): continue
        tn = b + decal                                # attaque réelle du mot (fin du silence), plus précise que Whisper
        cible = ANCRE + round((tn - ANCRE) / BEAT) * BEAT
        d = float(np.clip(cible - tn, 0.12 - (b - a), BEAT / 2))
        if abs(d) < 0.01: continue
        edits.append(((a + b) / 2, d)); decal += d
        print(f'{k:10s} attaque {b:6.2f} → {b + decal:6.2f}  ({d:+.2f} s, silence {b - a:.2f} s)')
    for h in 'AB':
        z, _ = librosa.load(src[h], sr=SR)
        parts, pos = [], 0
        for c, d in edits:
            i = int(c * SR)
            parts.append(z[pos:i])
            if d > 0: parts.append(np.zeros(int(d * SR), dtype=z.dtype)); pos = i
            else: pos = i + int(-d * SR)               # on retire du silence au milieu de la pause
        parts.append(z[pos:])
        sf.write(f'{OUT}/vo-placed-{h}.wav', np.concatenate(parts), SR)
        print(h, round(sf.info(f'{OUT}/vo-placed-{h}.wav').duration, 2), 's')
    json.dump(dict(bpm=BPM, beat=round(BEAT, 6), ancre=ANCRE, coupes=[dict(t=round(c, 3), ajout=round(d, 3)) for c, d in edits]),
              open(f'{OUT}/grille.json', 'w'), indent=1)
