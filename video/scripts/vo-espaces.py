# Voix espacée : insère des silences dans une prise de voix, aux points les plus calmes entre deux phrases,
# et décale le minutage mot à mot en conséquence. Sert à laisser au film le temps de construire un élément
# (présentation v6 : « c'est pas grave si la vidéo est plus longue »). La voix elle-même n'est pas touchée.
#   python3 scripts/vo-espaces.py audio/vo-presentev3 audio/vo-presentev6 audio/vo-presentev6/coupes.json
# coupes.json : [{"apres": index du mot, "gap": secondes}, …] ; le point de coupe est cherché automatiquement
# (énergie minimale par fenêtres de 10 ms entre la fin du mot et le début du suivant, ±80 ms).
import json, os, sys
import numpy as np
import soundfile as sf

src, dst, plan = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(dst, exist_ok=True)
x, sr = sf.read(os.path.join(src, 'vo.wav'), always_2d=True)
W = json.load(open(os.path.join(src, 'vo.words.json')))
P = json.load(open(plan))
hop = int(0.01 * sr)
mono = x.mean(1)
rms = np.array([np.sqrt(np.mean(mono[i:i + hop] ** 2) + 1e-12) for i in range(0, len(mono) - hop, hop)])
db = 20 * np.log10(rms + 1e-9)
PLANCHER = float(np.percentile(db, 10))   # bruit de fond de la prise

coupes = []
for p in P:
    i = p['apres']; a, b = W[i]['e'], W[i + 1]['s']
    lo, hi = int((min(a, b) - 0.08) * 100), int((max(a, b) + 0.08) * 100)
    # milieu de la plus longue plage calme (≤ plancher de la prise + 12 dB), loin des attaques de mots ;
    # à défaut de plage, le point le plus bas
    seg = db[lo:hi]; calme = seg <= max(seg.min() + 6, PLANCHER + 12); best, cur = None, None
    for j, v in enumerate(list(calme) + [False]):
        if v and cur is None: cur = j
        if not v and cur is not None:
            if best is None or j - cur > best[1] - best[0]: best = (cur, j)
            cur = None
    k = lo + ((best[0] + best[1] - 1) // 2 if best and best[1] - best[0] >= 2 else int(np.argmin(seg)))
    coupes.append({'apres': i, 'mot': W[i]['w'], 'suivant': W[i + 1]['w'], 't': (k + 0.5) / 100, 'gap': p['gap'], 'dB': round(float(db[k]), 1)})
coupes.sort(key=lambda c: c['t'])

# assemblage : morceaux de la prise séparés par des silences, fondus de 5 ms de part et d'autre de chaque coupe
fade = int(0.005 * sr); out = []; prev = 0
for c in coupes:
    n = int(round(c['t'] * sr)); seg = x[prev:n].copy()
    if prev > 0: seg[:fade] *= np.linspace(0, 1, fade)[:, None]
    seg[-fade:] *= np.linspace(1, 0, fade)[:, None]
    out += [seg, np.zeros((int(round(c['gap'] * sr)), x.shape[1]))]; prev = n
seg = x[prev:].copy(); seg[:fade] *= np.linspace(0, 1, fade)[:, None]; out.append(seg)
y = np.concatenate(out)
sf.write(os.path.join(dst, 'vo.wav'), y, sr, subtype='PCM_24')

# minutage : chaque mot après une coupe est décalé de la somme des silences insérés avant lui ;
# un mot dont la fin dépasse une coupe s'arrête à la coupe
def decale(t, fin=False):   # une fin de mot posée sur une coupe ne prend pas le silence qui suit
    return t + sum(c['gap'] for c in coupes if (c['t'] < t if fin else c['t'] <= t))
W2 = []
for w in W:
    s, e = w['s'], w['e']
    for c in coupes:
        if s < c['t'] < e: e = c['t']
    W2.append({**w, 's': round(decale(s), 3), 'e': round(max(decale(e, True), decale(s)), 3)})
json.dump(W2, open(os.path.join(dst, 'vo.words.json'), 'w'), ensure_ascii=False, indent=0)
json.dump(coupes, open(os.path.join(dst, 'coupes-appliquees.json'), 'w'), ensure_ascii=False, indent=1)
print(f'{len(coupes)} coupes, +{sum(c["gap"] for c in coupes):.2f} s ; voix {len(x) / sr:.2f} → {len(y) / sr:.2f} s')
for c in coupes: print(f"  après « {c['mot']} » ({c['t']:.2f} s, {c['dB']} dB) : +{c['gap']} s")
