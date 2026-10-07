"""MO8 : les cinq vraies voitures (Wikimedia Commons, versions exactes) → logos et plaques effacés, orientées vers la
gauche, détourées (BiRefNet), étalonnées dans la charte (ombres chaudes, fond noir).
    python3 scripts/photos-mo8.py   → assets/photos-mo8/car-<nom>.png (RGBA)
Originaux dans assets/photos-mo8/src/wm-<nom>.jpg (hors git, vignettes 1920 px de Commons) ; auteurs et licences :
assets/photos-mo8/CREDITS.tsv (CC0 / domaine public / CC BY 3.0 / CC BY-SA 3.0 de → crédit dans la légende du post).
"""
import numpy as np, cv2
from pathlib import Path
from PIL import Image
from rembg import new_session, remove
D = Path(__file__).resolve().parent.parent / 'assets' / 'photos-mo8'
# zones (pixels de l'original 1920 px) : ('logo', cx, cy, rx, ry) repeint ; ('plate', x0, y0, x1, y1) plaque vierge
CARS = {
    'bmw':    (False, [('logo', 588, 645, 40, 40), ('plate', 405, 840, 676, 1046)]),
    'golf':   (False, [('logo', 249, 718, 42, 44), ('plate', 108, 770, 346, 914)]),
    'fiesta': (False, [('logo', 282, 672, 46, 28), ('plate', 142, 818, 406, 948)]),
    'clio':   (True,  [('logo', 1662, 875, 46, 70), ('plate', 1596, 1060, 1742, 1150)]),
    'p208':   (True,  [('logo', 1651, 819, 36, 46), ('plate', 1618, 960, 1784, 1104)]),
}
ses = new_session('birefnet-general-lite')
for k, (flip, zones) in CARS.items():
    im = cv2.imread(str(D / 'src' / f'wm-{k}.jpg'))
    for z in zones:
        if z[0] == 'logo':
            _, cx, cy, rx, ry = z; m = np.zeros(im.shape[:2], np.uint8); cv2.ellipse(m, (cx, cy), (rx + 6, ry + 6), 0, 0, 360, 255, -1)
            im = cv2.inpaint(im, m, 12, cv2.INPAINT_TELEA)
        else:  # plaque vierge : couleur moyenne du bord, légère ombre interne
            _, x0, y0, x1, y1 = z; roi = im[y0:y1, x0:x1].astype(np.float32)
            base = np.median(np.concatenate([roi[:4].reshape(-1, 3), roi[-4:].reshape(-1, 3)]), 0) * .55
            patch = np.ones_like(roi) * base; patch = cv2.GaussianBlur(patch, (0, 0), 3)
            m = np.zeros(roi.shape[:2], np.float32); cv2.rectangle(m, (6, 6), (roi.shape[1] - 6, roi.shape[0] - 6), 1, -1); m = cv2.GaussianBlur(m, (0, 0), 3)[..., None]
            im[y0:y1, x0:x1] = (roi * (1 - m) + patch * m).astype(np.uint8)
    if flip: im = im[:, ::-1].copy()
    rgb = Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB))
    mask = np.asarray(remove(rgb, session=ses, only_mask=True)).astype(np.float32) / 255
    mask = cv2.GaussianBlur(mask, (0, 0), 1.2)
    # étalonnage : contraste, saturation −20 %, ombres réchauffées, lumière qui tombe du haut-gauche
    f = im.astype(np.float32) / 255
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV); hsv[..., 1] *= .8; f = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    f = np.clip((f - .5) * 1.15 + .5, 0, 1) * .78
    if k == 'clio': f = np.clip(f * 1.6 + .03, 0, 1)                    # voiture noire : on la remonte pour qu'elle se détache du fond
    lum = f.mean(2, keepdims=True); f = f * (np.array([.84, .93, 1.05], np.float32) * (1 - lum) + lum)
    H, W = f.shape[:2]; yy, xx = np.mgrid[0:H, 0:W] / max(H, W)
    f *= (1.08 - .45 * np.clip(yy * .9 + (xx if not flip else 1 - xx) * .2 - .25, 0, 1))[..., None]
    a = (mask * 255).astype(np.uint8)
    ys, xs = np.where(a > 20); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    out = np.dstack([np.clip(f[..., ::-1] * 255, 0, 255).astype(np.uint8), a])[max(0, y0 - 10):y1 + 10, max(0, x0 - 10):x1 + 10]
    Image.fromarray(out, 'RGBA').save(D / f'car-{k}.png', optimize=True)
    print(k, out.shape)
