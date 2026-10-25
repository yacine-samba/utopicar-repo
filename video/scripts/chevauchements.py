# Sous-titres sur fond chargé : pour chaque image relevée par scripts/chevauchements.mjs (rendue SANS les sous-titres,
# recadrée sur leur bande), mesure le détail net sous chaque lettre (gradient de luminance). Un texte d'interface net
# sous une lettre donne un fort gradient ; un fond uni, flou ou voilé n'en donne presque pas.
#   python3 scripts/chevauchements.py renders/_sous-presentev7 [seuil]
import json, os, sys
import numpy as np
from PIL import Image
D = sys.argv[1]; SEUIL = float(sys.argv[2]) if len(sys.argv) > 2 else 9.0
C = json.load(open(os.path.join(D, 'cadres.json')))
res = []
for c in C:
    im = np.asarray(Image.open(os.path.join(D, f"f{c['t']:.3f}.png")).convert('L'), dtype=np.float32)
    gx = np.abs(np.diff(im, axis=1))[:-1, :]; gy = np.abs(np.diff(im, axis=0))[:, :-1]; g = np.maximum(gx, gy)
    pire = 0
    for (l, t, r, b) in c['lettres']:
        # cœur de la lettre (son cadre déborde du dessin)
        w, h = r - l, b - t; l2, r2 = int(l + 0.12 * w), int(r - 0.12 * w); t2, b2 = int(t + 0.2 * h - c['y0']), int(b - 0.15 * h - c['y0'])
        l2, r2 = max(0, l2), min(g.shape[1], r2); t2, b2 = max(0, t2), min(g.shape[0], b2)
        if r2 - l2 < 4 or b2 - t2 < 4: continue
        z = g[t2:b2, l2:r2]
        v = float(np.percentile(z, 95))
        pire = max(pire, v)
    res.append((c['t'], round(pire, 1)))
mauvais = [(t, v) for t, v in res if v > SEUIL]
print(f'{len(res)} images avec sous-titres ; {len(mauvais)} au-dessus de {SEUIL} (détail net sous une lettre)')
# plages
pl = []
for t, v in mauvais:
    if pl and t - pl[-1][1] < 0.15: pl[-1][1] = t; pl[-1][2] = max(pl[-1][2], v)
    else: pl.append([t, t, v])
for a, b, v in pl: print(f'  {a:5.1f} → {b:5.1f} s   max {v}')
json.dump(res, open(os.path.join(D, 'detail.json'), 'w'))
