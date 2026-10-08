"""MO9 « Le PV » : la voiture du débutant, une vraie Peugeot 206 d'occasion (Wikimedia Commons, version exacte :
206 L 1.1 3 portes de 2000, phase 1, finition de base à boucliers noirs) → lion de calandre, lions d'enjoliveurs,
autocollant AA et plaque effacés, orientée vers la gauche, détourée (BiRefNet), bords décontaminés, étalonnée dans la
charte comme MO8 (ombres chaudes, fond noir), plus son contour vectoriel pour le liseré de lumière.
    python3 scripts/photos-mo9.py   → assets/photos-mo9/car-206.png (RGBA, rognée)
                                      assets/photos-mo9/car-206-contour.js  (window.CAR_206_CONTOUR, même rognage)
Original dans assets/photos-mo9/src/wm-206.jpg (hors git, vignette 1920 px de Commons) ; auteur et licence :
assets/photos-mo9/CREDITS.tsv (Vauxford, CC BY-SA 4.0 → crédit dans la légende du post).
Contour au format de film-mo5da/polo-contour.js : {w: 1000, h, d, len, n}, repère 1000 px de large = largeur du PNG.
"""
import json
import numpy as np, cv2
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
NAME = 'car-206'
FLIP = True                         # sur la photo, l'avant regarde vers la droite
# retouches, en pixels de l'original 1920 × 1044 (avant retournement) ; zone = ellipse (cx, cy, rx, ry) ou polygone
#   'band'  interpolation ligne à ligne entre les deux bords (bandes horizontales : calandre / bouclier)
#   'telea' inpainting classique (surfaces unies : enjoliveur, pare-brise)
LOGOS = [
    ('band', [(1567, 611), (1600, 605), (1663, 605), (1665, 662), (1651, 675), (1589, 675), (1577, 652), (1562, 622)]),
    #        lion de calandre et tout son cadre chromé (le haut gauche évite le coin rouge du capot)
    ('telea', [(912, 803), (920, 801), (921, 812), (930, 814), (931, 822), (927, 828), (926, 838), (918, 839),
               (915, 832), (910, 828), (907, 820), (910, 815)]),    # lion de l'enjoliveur avant, entre les 4 écrous
    ('telea', (171, 680, 8, 12)),                                   # lion de l'enjoliveur arrière
    ('telea', (877, 355, 25, 16)),                                  # autocollant AA dans le coin du pare-brise
]
# plaque avant (déjà floutée en gris par l'auteur) → plaque vierge : quadrilatère (haut-g, haut-d, bas-d, bas-g)
PLATE = [(1476, 810), (1721, 788), (1713, 858), (1466, 881)]


def zone_mask(shape, z):
    m = np.zeros(shape[:2], np.uint8)
    if isinstance(z, tuple): cx, cy, rx, ry = z; cv2.ellipse(m, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
    else: cv2.fillPoly(m, [np.array(z, np.int32)], 255)
    return m


def band_fill(im, m):
    """Efface un badge posé sur des bandes horizontales : chaque ligne est interpolée entre ses deux bords."""
    ys = np.nonzero(m.any(1))[0]
    f = im.astype(np.float32); out = f.copy()
    for y in ys:
        xs = np.nonzero(m[y])[0]
        if len(xs) == 0: continue
        xa, xb = xs[0], xs[-1]
        L = np.median(f[y - 1:y + 2, xa - 7:xa - 1].reshape(-1, 3), 0)
        R = np.median(f[y - 1:y + 2, xb + 2:xb + 8].reshape(-1, 3), 0)
        t = np.linspace(0, 1, xb - xa + 1)[:, None]
        out[y, xa:xb + 1] = L * (1 - t) + R * t
    # adoucit les marches entre lignes, puis rend le grain de la photo
    sm = cv2.GaussianBlur(out, (0, 0), 1.6)
    rng = np.random.default_rng(206)
    sm += rng.normal(0, 2.2, sm.shape).astype(np.float32)
    w = cv2.GaussianBlur((m > 0).astype(np.float32), (0, 0), 1.2)[..., None]
    return np.clip(f * (1 - w) + sm * w, 0, 255).astype(np.uint8)


def blank_plate(im, quad):
    """Plaque vierge : ton de la plaque d'origine, léger dégradé vertical, liseré plus sombre, grain."""
    q = np.array(quad, np.int32)
    m = np.zeros(im.shape[:2], np.uint8); cv2.fillPoly(m, [q], 255)
    inner = cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    f = im.astype(np.float32)
    base = np.median(f[inner > 0], 0)
    y0, y1 = q[:, 1].min(), q[:, 1].max()
    yy = (np.arange(im.shape[0], dtype=np.float32)[:, None, None] - y0) / max(y1 - y0, 1)
    plate = np.broadcast_to(base * (1.10 - .16 * np.clip(yy, 0, 1)), f.shape).copy()
    ring = ((m > 0) & (cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))) == 0)).astype(np.float32)
    plate *= (1 - .28 * cv2.GaussianBlur(ring, (0, 0), 1.0))[..., None]
    plate += np.random.default_rng(9).normal(0, 2.0, f.shape).astype(np.float32)
    w = cv2.GaussianBlur((m > 0).astype(np.float32), (0, 0), 0.9)[..., None]
    return np.clip(f * (1 - w) + plate * w, 0, 255).astype(np.uint8)


im = cv2.imread(str(D / 'src' / 'wm-206.jpg'))
for kind, z in LOGOS:
    m = zone_mask(im.shape, z)
    im = band_fill(im, m) if kind == 'band' else cv2.inpaint(im, m, 5, cv2.INPAINT_TELEA)
im = blank_plate(im, PLATE)
cv2.imwrite(str(D / 'src' / 'retouche-206.png'), im)          # contrôle des retouches (hors git, comme src/)
if FLIP: im = im[:, ::-1].copy()
H, W = im.shape[:2]

# masque BiRefNet, puis silhouette de cutout.py : trous bouchés, poussières retirées, arête adoucie (≈ 1,5 px)
rgb = Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB))
m = np.asarray(remove(rgb, session=new_session('birefnet-general-lite'), only_mask=True)).astype(np.float32) / 255
hard = (m > 0.5).astype(np.uint8)
hard = cv2.morphologyEx(hard, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
hard = cv2.morphologyEx(hard, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
n, lab, st, _ = cv2.connectedComponentsWithStats(hard)
if n > 1: hard = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
alpha = np.minimum(m, cv2.GaussianBlur(hard.astype(np.float32), (0, 0), 1.5))
alpha = np.clip((alpha - 0.04) / 0.92, 0, 1)

# étalonnage MO8 : saturation −20 %, contraste, ombres réchauffées, lumière qui tombe du haut-gauche (côté capot)
f = im.astype(np.float32) / 255
hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV); hsv[..., 1] *= .8; f = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
f = np.clip((f - .5) * 1.15 + .5, 0, 1) * .78
lum = f.mean(2, keepdims=True); f = f * (np.array([.84, .93, 1.05], np.float32) * (1 - lum) + lum)
yy, xx = np.mgrid[0:H, 0:W] / max(H, W)
f *= (1.08 - .45 * np.clip(yy * .9 + xx * .2 - .25, 0, 1))[..., None]
rgb = np.clip(f[..., ::-1], 0, 1).astype(np.float32)

# décontamination : la couleur des pixels du bord est remplacée par celle de l'intérieur voisin (pas de liseré de mur)
inner = (alpha > 0.97).astype(np.float32)
acc = np.zeros_like(rgb); wsum = np.zeros((H, W, 1), np.float32)
for s in (2, 5, 11, 23):
    acc += cv2.GaussianBlur(rgb * inner[..., None], (0, 0), s)
    wsum += cv2.GaussianBlur(inner, (0, 0), s)[..., None]
fill = acc / np.maximum(wsum, 1e-4)
edge = ((alpha > 0.002) & (alpha < 0.97)).astype(np.float32)[..., None]
rgb = rgb * (1 - edge) + fill * edge

# rognage serré sur la silhouette (8 px de marge) : le PNG et le contour partagent ce rognage
ys, xs = np.nonzero(alpha > 0.01)
y0, y1, x0, x1 = max(ys.min() - 8, 0), min(ys.max() + 9, H), max(xs.min() - 8, 0), min(xs.max() + 9, W)
rgb, alpha = rgb[y0:y1, x0:x1], alpha[y0:y1, x0:x1]; H, W = alpha.shape
Image.fromarray(np.dstack([rgb * 255, alpha * 255]).clip(0, 255).astype(np.uint8), 'RGBA').save(D / f'{NAME}.png', optimize=True)

# contour vectoriel (cutout.py), légèrement à l'extérieur du bord pour le recouvrir
mm = (alpha > 0.43).astype(np.uint8)
mm = cv2.morphologyEx(mm, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
mm = cv2.morphologyEx(mm, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
mm = cv2.dilate(mm, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
cs, _ = cv2.findContours(mm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
c = max(cs, key=cv2.contourArea)[:, 0, :].astype(np.float32)
k = 9; pad = np.vstack([c[-k:], c, c[:k]]); ker = np.ones(2 * k + 1) / (2 * k + 1)
pts = np.stack([np.convolve(pad[:, 0], ker, 'valid'), np.convolve(pad[:, 1], ker, 'valid')], 1).astype(np.float32)
apx = cv2.approxPolyDP(pts.reshape(-1, 1, 2), 0.8, True)[:, 0, :]
apx = np.roll(apx, -int(np.argmin(apx[:, 0])), 0)          # le tracé part du point le plus à gauche (l'avant)
sc = 1000 / W
d = 'M' + ' L'.join(f'{x * sc:.1f} {y * sc:.1f}' for x, y in apx) + ' Z'
L = float(np.sum(np.linalg.norm(np.diff(np.vstack([apx, apx[:1]]), axis=0), axis=1)) * sc)
info = {'w': 1000, 'h': round(H * sc, 1), 'd': d, 'len': round(L, 1), 'n': int(len(apx))}
var = NAME.upper().replace('-', '_')
(D / f'{NAME}-contour.js').write_text(f'window.{var}_CONTOUR = {json.dumps(info)};\n')
print(D / f'{NAME}.png', f'{W}x{H}', '· contour', info['n'], 'points,', round(L), 'px, h', info['h'])
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
