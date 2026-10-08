"""MO10 « Deux voitures » : les deux photos libres de Wikimedia Commons → logo et plaque effacés, tournées vers la
gauche (elles entrent par la droite), détourées (BiRefNet), bords décontaminés, étalonnées dans la charte, contour
vectoriel pour le trait de lumière.
    python3 scripts/photos-mo10.py [twingo-a] → assets/photos-mo10/<nom>.png (RGBA) + film-mo10/cars-contour.js
Originaux dans assets/photos-mo10/src/wm-<nom>.jpg (vignettes 1920 px de Commons, hors dépôt) ; auteurs et licences :
assets/photos-mo10/CREDITS.tsv (les deux en CC0 : aucun crédit obligatoire).
Méthode de scripts/photos-mo9.py et de motion-studio/scripts/cutout.py (silhouette nettoyée, décontamination, contour).
"""
import json, sys
import numpy as np, cv2
from pathlib import Path
from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
D = ROOT / 'assets' / 'photos-mo10'
# zones (pixels de l'original 1920 px) : ('logo', cx, cy, rx, ry) repeint ; ('plate', [(x, y)…]) plaque vierge en perspective
CARS = {
    # Twingo II bleue (phase 2) : la voiture qui part en neuf jours
    'twingo-a': dict(sat=.55, gain=1.0, zones=[('logo', 1460, 597, 34, 44), ('logo', 915, 792, 16, 20),
                                               ('plate', [(1383, 724), (1570, 689), (1572, 760), (1386, 790)])],
                     post=[(570, 162, 62, 42)]),   # monogramme d'une autre voiture, vu à travers le pare-brise
    # 207 blanche, de profil : celle qui reste garée
    'p207-a': dict(sat=.8, gain=.94, zones=[],
                   # la berline garée derrière, que BiRefNet colle au pare-brise (repère : premier détourage, avant nettoyage)
                   erase=[[(0, 0), (800, 0), (742, 40), (560, 118), (382, 186), (230, 222), (40, 262), (0, 262)]]),
}
ONLY = sys.argv[1:]
ses = new_session('birefnet-general-lite')
contours = {}
for k, c in CARS.items():
    if ONLY and k not in ONLY: continue
    im = cv2.imread(str(D / 'src' / f'wm-{k}.jpg'))
    for z in c['zones']:
        if z[0] == 'logo':
            _, cx, cy, rx, ry = z; m = np.zeros(im.shape[:2], np.uint8); cv2.ellipse(m, (cx, cy), (rx + 6, ry + 6), 0, 0, 360, 255, -1)
            im = cv2.inpaint(im, m, 12, cv2.INPAINT_TELEA)
        else:  # plaque vierge : couleur sombre du support, bords adoucis, suit la perspective de la plaque
            poly = np.array(z[1], np.int32); m = np.zeros(im.shape[:2], np.float32); cv2.fillPoly(m, [poly], 1.0)
            m = cv2.GaussianBlur(m, (0, 0), 2.5)[..., None]
            patch = np.ones_like(im, np.float32) * np.array([30, 29, 31], np.float32)
            im = (im.astype(np.float32) * (1 - m) + patch * m).astype(np.uint8)
    im = im[:, ::-1].copy()                                    # tournée vers la gauche
    rgb8 = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
    m = np.asarray(remove(Image.fromarray(rgb8), session=ses, only_mask=True)).astype(np.float32) / 255
    # silhouette : une seule pièce, trous bouchés, arête adoucie (cutout.py)
    hard = (m > 0.5).astype(np.uint8)
    hard = cv2.morphologyEx(hard, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    hard = cv2.morphologyEx(hard, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(hard)
    if n > 1: hard = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    alpha = np.minimum(m, cv2.GaussianBlur(hard.astype(np.float32), (0, 0), 1.2))
    alpha = np.clip((alpha - 0.04) / 0.92, 0, 1)
    # repère commun aux retouches : le cadre du premier détourage (bord de la silhouette brute − 8 px)
    ys, xs = np.nonzero(alpha > 0.01); ox, oy = max(xs.min() - 8, 0), max(ys.min() - 8, 0)
    for poly in c.get('erase', []):
        e = np.zeros(alpha.shape, np.float32); cv2.fillPoly(e, [np.array([(x + ox, y + oy) for x, y in poly], np.int32)], 1.0)
        alpha *= 1 - cv2.GaussianBlur(e, (0, 0), 1.5)
    for cx, cy, rx, ry in c.get('post', []):
        m8 = np.zeros(im.shape[:2], np.uint8); cv2.ellipse(m8, (cx + ox, cy + oy), (rx, ry), 0, 0, 360, 255, -1)
        im = cv2.inpaint(im, m8, 10, cv2.INPAINT_TELEA)
    # étalonnage (photos-mo9.py) : saturation retenue, contraste, ombres froides, lumière du haut-gauche
    f = im.astype(np.float32) / 255
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV); hsv[..., 1] *= c['sat']; f = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    f = np.clip((f - .5) * 1.12 + .5, 0, 1) * .9 * c['gain']
    lum = f.mean(2, keepdims=True); f = f * (np.array([.86, .94, 1.04], np.float32) * (1 - lum) + lum)
    H, W = f.shape[:2]; yy, xx = np.mgrid[0:H, 0:W] / max(H, W)
    f *= (1.06 - .40 * np.clip(yy * .9 + xx * .2 - .25, 0, 1))[..., None]
    rgb = f[..., ::-1].copy()
    # décontamination : la couleur de l'intérieur remplace celle du fond d'origine sur le bord
    inner = (alpha > 0.97).astype(np.float32); acc = np.zeros_like(rgb); ws = np.zeros((H, W, 1), np.float32)
    for s in (2, 5, 11, 23):
        acc += cv2.GaussianBlur(rgb * inner[..., None], (0, 0), s); ws += cv2.GaussianBlur(inner, (0, 0), s)[..., None]
    edge = ((alpha > 0.002) & (alpha < 0.97)).astype(np.float32)[..., None]
    rgb = rgb * (1 - edge) + acc / np.maximum(ws, 1e-4) * edge
    ys, xs = np.nonzero(alpha > 0.01)
    y0, y1, x0, x1 = max(ys.min() - 8, 0), min(ys.max() + 9, H), max(xs.min() - 8, 0), min(xs.max() + 9, W)
    rgb, alpha = rgb[y0:y1, x0:x1], alpha[y0:y1, x0:x1]; H, W = alpha.shape
    Image.fromarray(np.dstack([rgb * 255, alpha * 255]).clip(0, 255).astype(np.uint8), 'RGBA').save(D / f'{k}.png', optimize=True)
    # contour vectoriel, un peu à l'extérieur du bord (en pixels de la photo détourée)
    mm = (alpha > 0.43).astype(np.uint8)
    mm = cv2.morphologyEx(mm, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    mm = cv2.morphologyEx(mm, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    mm = cv2.dilate(mm, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    cs, _ = cv2.findContours(mm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cc = max(cs, key=cv2.contourArea)[:, 0, :].astype(np.float32)
    kk = 9; pad = np.vstack([cc[-kk:], cc, cc[:kk]]); ker = np.ones(2 * kk + 1) / (2 * kk + 1)
    pts = np.stack([np.convolve(pad[:, 0], ker, 'valid'), np.convolve(pad[:, 1], ker, 'valid')], 1).astype(np.float32)
    apx = cv2.approxPolyDP(pts.reshape(-1, 1, 2), 0.8, True)[:, 0, :]
    apx = np.roll(apx, -int(np.argmin(apx[:, 0])), 0)
    d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in apx) + ' Z'
    L = float(np.sum(np.linalg.norm(np.diff(np.vstack([apx, apx[:1]]), axis=0), axis=1)))
    contours[k] = {'w': W, 'h': H, 'd': d, 'len': round(L, 1)}
    print(k, f'{W}x{H}', 'contour', len(apx), 'points')
js = ROOT / 'film-mo10' / 'cars-contour.js'
old = {}
if js.exists() and ONLY:
    old = json.loads(js.read_text().split('=', 1)[1].rstrip().rstrip(';'))
old.update(contours); js.parent.mkdir(exist_ok=True)
js.write_text('// contours des deux voitures (scripts/photos-mo10.py) : tracés à la lumière quand elles freinent\nwindow.CARS_CONTOUR = ' + json.dumps(old) + ';\n')
