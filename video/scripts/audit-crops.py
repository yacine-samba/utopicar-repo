"""Contrôle des recadrages de captures (carrousels) : rien ne doit toucher le bord d'une carte.
Pour chaque morceau de capture (r = [x, y, w, h] en px CSS, ×3 dans le PNG), on regarde une bande de 5 px CSS le long
de chaque bord, à l'intérieur du recadrage : un pixel « contenu » s'écarte nettement du fond de la bande (texte,
pastille, icône). La marge intérieure (pad) ajoutée par le gabarit compte comme de l'espace libre.
usage : python3 scripts/audit-crops.py [--fix]  → liste des recadrages à revoir."""
import json, os, sys
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UI1 = ['scan', 'launch', 'card-lv1', 'lg1', 'lg2', 'lg3', 'lg4', 'lg5', 'lg6', 'dock-scan']
D = json.load(open(os.path.join(ROOT, 'carousels/carousels.json')))['carousels']
cache = {}
def img(k):
    if k not in cache:
        cache[k] = np.asarray(Image.open(os.path.join(ROOT, 'assets', 'ui' if k in UI1 else 'ui2', k + '.png')).convert('L')).astype(float)
    return cache[k]
BAND, NEED = 5, 10   # px CSS : bande contrôlée, espace libre voulu entre le contenu et le bord de la carte
bad = []
for ci, c in enumerate(D):
    for si, s in enumerate(c['slides']):
        for u in (s.get('ui') or []):
            for spec in (u if isinstance(u, list) else [u]):
                a = img(spec['ui']); H, W = a.shape
                x, y, w, h = spec['r'] or [0, 0, W / 3, H / 3]
                X0, Y0, X1, Y1 = [int(round(v * 3)) for v in (x, y, x + w, y + h)]
                crop = a[Y0:Y1, X0:X1]
                pad = spec.get('pad') or 0
                if spec.get('bare'): continue
                # distance (px CSS) entre le bord du recadrage et le premier contenu, par côté
                def free(side):
                    for d in range(0, NEED * 3):
                        line = {'l': crop[:, d], 'r': crop[:, -1 - d], 't': crop[d, :], 'b': crop[-1 - d, :]}[side]
                        ref = np.median(line)
                        if (np.abs(line - ref) > 70).mean() > 0.01: return d / 3
                    return NEED
                gaps = {k: free(k) + pad for k in 'lrtb'}
                low = {k: round(v, 1) for k, v in gaps.items() if v < 8}
                if low: bad.append((f"{ci + 1:02d}-{c['slug']} image {si + 1}", spec['ui'], spec['r'], pad, low))
for b in bad: print(*b)
print(f'{len(bad)} recadrage(s) à revoir')
