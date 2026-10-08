"""MO9 « 974 € » : la Clio IV noire retenue (et la Sandero II des images tests), photos libres de Wikimedia Commons → logo et plaque effacés, tournée vers la gauche
(elle entre par la droite), détourée (BiRefNet), étalonnée dans la charte.
    python3 scripts/photos-mo9.py [clio-a]   → assets/photos-mo9/<nom>.png (RGBA)
Originaux dans assets/photos-mo9/src/wm-<nom>.jpg (vignettes 1920 px de Commons) ; auteurs et licences :
assets/photos-mo9/CREDITS.tsv (clio-a et sandero-a en CC0 : aucun crédit obligatoire).
"""
import numpy as np, cv2, sys
from pathlib import Path
from PIL import Image
from rembg import new_session, remove

D = Path(__file__).resolve().parent.parent / 'assets' / 'photos-mo9'
# zones (pixels de l'original 1920 px) : ('logo', cx, cy, rx, ry) repeint ; ('plate', x0, y0, x1, y1) plaque vierge
CARS = {
    'sandero-a': (True, [('logo', 1535, 708, 48, 58), ('logo', 857, 200, 42, 46), ('plate', 1452, 826, 1672, 992)]),  # logo, affichette vue par le pare-brise, plaque
    'clio-a': (True, [('logo', 1556, 640, 42, 62), ('plate', 1432, 818, 1704, 918)]),  # Clio IV noire retenue le 8 oct. 2026 : logo, plaque
}
ONLY = sys.argv[1:]  # python3 scripts/photos-mo9.py clio-a : une seule voiture
ses = new_session('birefnet-general-lite')
for k, (flip, zones) in CARS.items():
    if ONLY and k not in ONLY: continue
    im = cv2.imread(str(D / 'src' / f'wm-{k}.jpg'))
    for z in zones:
        if z[0] == 'logo':
            _, cx, cy, rx, ry = z; m = np.zeros(im.shape[:2], np.uint8); cv2.ellipse(m, (cx, cy), (rx + 6, ry + 6), 0, 0, 360, 255, -1)
            im = cv2.inpaint(im, m, 12, cv2.INPAINT_TELEA)
        else:  # plaque vierge : couleur sombre du support, légère ombre interne
            _, x0, y0, x1, y1 = z; roi = im[y0:y1, x0:x1].astype(np.float32)
            base = np.array([34, 33, 35], np.float32)
            patch = np.ones_like(roi) * base; patch = cv2.GaussianBlur(patch, (0, 0), 3)
            m = np.zeros(roi.shape[:2], np.float32); cv2.rectangle(m, (6, 6), (roi.shape[1] - 6, roi.shape[0] - 6), 1, -1); m = cv2.GaussianBlur(m, (0, 0), 3)[..., None]
            im[y0:y1, x0:x1] = (roi * (1 - m) + patch * m).astype(np.uint8)
    if flip: im = im[:, ::-1].copy()
    rgb = Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB))
    mask = np.asarray(remove(rgb, session=ses, only_mask=True)).astype(np.float32) / 255
    mask = cv2.GaussianBlur(mask, (0, 0), 1.2)
    # étalonnage : voiture blanche → on garde du relief (blancs à 0,9), ombres réchauffées, lumière du haut-gauche
    f = im.astype(np.float32) / 255
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV); hsv[..., 1] *= .8; f = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    f = np.clip((f - .5) * 1.12 + .5, 0, 1) * .9
    if k.startswith('clio'): f = np.clip(f * 1.55 + .03, 0, 1)   # voiture noire : on la remonte pour qu'elle se détache du fond (comme MO8)
    lum = f.mean(2, keepdims=True); f = f * (np.array([.86, .94, 1.04], np.float32) * (1 - lum) + lum)
    H, W = f.shape[:2]; yy, xx = np.mgrid[0:H, 0:W] / max(H, W)
    f *= (1.06 - .40 * np.clip(yy * .9 + (xx if not flip else 1 - xx) * .2 - .25, 0, 1))[..., None]
    a = (mask * 255).astype(np.uint8)
    ys, xs = np.where(a > 20); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    out = np.dstack([np.clip(f[..., ::-1] * 255, 0, 255).astype(np.uint8), a])[max(0, y0 - 10):y1 + 10, max(0, x0 - 10):x1 + 10]
    Image.fromarray(out, 'RGBA').save(D / f'{k}.png', optimize=True)
    print(k, out.shape)
