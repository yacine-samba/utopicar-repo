"""Détourage propre d'une photo réelle (voiture, objet) + contour vectoriel pour un liseré de lumière.

    python3 cutout.py photo.webp sortie/ [--scale 1.6] [--fade-bottom 0.06]

Sorties :
  sortie/<nom>-cut.png        détourage RGBA (bords décontaminés, silhouette lissée)
  sortie/<nom>-contour.json   contour vectoriel {w:1000, h, d, len, n} (repère 1000 px de large)
  sortie/<nom>-contour.js     même chose en `window.<NOM>_CONTOUR = {...}` pour un film chargé en file://

Méthode (MO5, après un détourage jugé « dégueulasse ») :
  1. masque BiRefNet (rembg, modèle birefnet-general-lite dans ~/.u2net) ; isnet donnait des bords mâchés ;
  2. agrandissement Lanczos ×scale avant le traitement des bords (moins d'escaliers au zoom de caméra) ;
  3. silhouette lissée : fermeture puis ouverture morphologiques, flou léger du masque ;
  4. décontamination : la couleur des pixels semi-transparents est remplacée par celle de l'intérieur voisin
     (sinon le fond d'origine, ciel ou herbe, laisse un liseré coloré) ;
  5. option : le bas (pneus posés au sol) s'efface sur quelques pour cent, pour éviter une coupe nette ;
  6. contour vectoriel (findContours, lissage circulaire, approxPolyDP) : un trait de lumière tracé dessus
     recouvre les défauts du bord. C'est lui qui a sauvé le détourage de MO5.
"""
import argparse, json
from pathlib import Path
import numpy as np, cv2
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--scale', type=float, default=1.6)
ap.add_argument('--fade-bottom', type=float, default=0.0, help='part de la hauteur effacée en bas (0 = aucune)')
ap.add_argument('--model', default='birefnet-general-lite')
a = ap.parse_args()
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
name = Path(a.src).stem

from rembg import new_session, remove
im = Image.open(a.src).convert('RGB')
mask = remove(im, session=new_session(a.model), only_mask=True)
W, H = int(im.width * a.scale), int(im.height * a.scale)
rgb = np.asarray(im.resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
m = np.asarray(mask.resize((W, H), Image.LANCZOS)).astype(np.float32) / 255

# silhouette : bouche les trous, retire les poussières, adoucit l'arête (≈ 1,5 px)
hard = (m > 0.5).astype(np.uint8)
hard = cv2.morphologyEx(hard, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
hard = cv2.morphologyEx(hard, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
n, lab, st, _ = cv2.connectedComponentsWithStats(hard)
if n > 1: hard = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
alpha = np.minimum(m, cv2.GaussianBlur(hard.astype(np.float32), (0, 0), 1.5))
alpha = np.clip((alpha - 0.04) / 0.92, 0, 1)

# décontamination : couleur de l'intérieur (alpha ≈ 1) diffusée vers le bord
inner = (alpha > 0.97).astype(np.float32)
acc = np.zeros_like(rgb); wsum = np.zeros((H, W, 1), np.float32)
for s in (2, 5, 11, 23):
    acc += cv2.GaussianBlur(rgb * inner[..., None], (0, 0), s)
    wsum += cv2.GaussianBlur(inner, (0, 0), s)[..., None]
fill = acc / np.maximum(wsum, 1e-4)
edge = ((alpha > 0.002) & (alpha < 0.97)).astype(np.float32)[..., None]
rgb = rgb * (1 - edge) + fill * edge

if a.fade_bottom > 0:
    ys, xs = np.nonzero(alpha > 0.5); y1 = ys.max(); h = (ys.max() - ys.min()) * a.fade_bottom
    yy = np.arange(H, dtype=np.float32)[:, None]
    alpha *= np.clip((y1 - yy) / max(h, 1), 0, 1) ** 0.7 * (yy > y1 - h) + (yy <= y1 - h)

# recadrage serré sur la silhouette (8 px de marge)
ys, xs = np.nonzero(alpha > 0.01)
y0, y1, x0, x1 = max(ys.min() - 8, 0), min(ys.max() + 9, H), max(xs.min() - 8, 0), min(xs.max() + 9, W)
rgb, alpha = rgb[y0:y1, x0:x1], alpha[y0:y1, x0:x1]; H, W = alpha.shape
Image.fromarray(np.dstack([rgb * 255, alpha * 255]).clip(0, 255).astype(np.uint8), 'RGBA').save(out / f'{name}-cut.png')

# contour vectoriel, légèrement à l'extérieur du bord pour le recouvrir
mm = (alpha > 0.43).astype(np.uint8)
mm = cv2.morphologyEx(mm, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
mm = cv2.morphologyEx(mm, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
mm = cv2.dilate(mm, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
cs, _ = cv2.findContours(mm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
c = max(cs, key=cv2.contourArea)[:, 0, :].astype(np.float32)
k = 9; pad = np.vstack([c[-k:], c, c[:k]]); ker = np.ones(2 * k + 1) / (2 * k + 1)
pts = np.stack([np.convolve(pad[:, 0], ker, 'valid'), np.convolve(pad[:, 1], ker, 'valid')], 1).astype(np.float32)
apx = cv2.approxPolyDP(pts.reshape(-1, 1, 2), 0.8, True)[:, 0, :]
apx = np.roll(apx, -int(np.argmin(apx[:, 0])), 0)          # le tracé part du point le plus à gauche
sc = 1000 / W
d = 'M' + ' L'.join(f'{x * sc:.1f} {y * sc:.1f}' for x, y in apx) + ' Z'
L = float(np.sum(np.linalg.norm(np.diff(np.vstack([apx, apx[:1]]), axis=0), axis=1)) * sc)
info = {'w': 1000, 'h': round(H * sc, 1), 'd': d, 'len': round(L, 1), 'n': int(len(apx))}
json.dump(info, open(out / f'{name}-contour.json', 'w'))
(out / f'{name}-contour.js').write_text(f'window.{name.upper().replace("-", "_")}_CONTOUR = {json.dumps(info)};\n')
print(out / f'{name}-cut.png', f'{W}x{H}', 'contour', info['n'], 'points,', round(L), 'px')
