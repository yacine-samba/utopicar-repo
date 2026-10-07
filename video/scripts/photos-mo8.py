"""MO8 : photos réelles des cinq voitures (Pexels, licence libre) → plaques et logos effacés, étalonnage de la charte.
    python3 scripts/photos-mo8.py   → assets/photos-mo8/car-<nom>.jpg
Sources (licence Pexels : usage libre, commercial compris) ; les originaux vont dans assets/photos-mo8/src/ (hors git) :
  curl -o src/<id>.jpg "https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=1600"
 BMW 15655458 · Golf 18158530 · Fiesta 12310882 · Captur 691138 · 208 23156446
"""
import numpy as np, cv2
from pathlib import Path
D = Path(__file__).resolve().parent.parent / 'assets' / 'photos-mo8'
# zones en coordonnées du recadrage : ('inp', x, y, w, h) = logo repeint ; ('plate', ...) = plaque floutée et assombrie
CARS = {
    'bmw':    ('15655458', (150, 1000, 1450, 1900), [('inp', 618, 398, 66, 62)]),
    'golf':   ('18158530', (0, 1150, 1600, 2350), [('inp', 1128, 628, 80, 84), ('inp', 966, 598, 42, 36), ('plate', 1030, 735, 300, 84)]),
    'fiesta': ('12310882', (180, 360, 1520, 940), [('inp', 108, 330, 50, 38), ('plate', 108, 405, 86, 76)]),
    'captur': ('691138',   (0, 650, 1600, 2133), [('plate', 0, 1110, 110, 200)]),
    '208':    ('23156446', (250, 800, 1350, 1700), [('inp', 520, 418, 64, 64), ('plate', 438, 506, 230, 90)]),
}
for k, (src, box, zones) in CARS.items():
    im = cv2.imread(str(D / 'src' / f'{src}.jpg'))
    x0, y0, x1, y1 = box; im = im[y0:y1, x0:x1].copy()
    for z, x, y, w, h in zones:
        if z == 'inp':
            m = np.zeros(im.shape[:2], np.uint8); cv2.ellipse(m, (x + w // 2, y + h // 2), (w // 2 + 4, h // 2 + 4), 0, 0, 360, 255, -1)
            im = cv2.inpaint(im, m, 9, cv2.INPAINT_TELEA)
        else:
            roi = im[y:y + h, x:x + w]; b = cv2.GaussianBlur(roi, (0, 0), 14) * .55
            im[y:y + h, x:x + w] = b.astype(np.uint8)
    # étalonnage : ombres chaudes, hautes lumières tenues, saturation −25 %, vignettage
    f = im.astype(np.float32) / 255
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV); hsv[..., 1] *= .75; f = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    lum = f.mean(2, keepdims=True)
    f = f * .9; f = f / (1 + .25 * f)                                     # tient les hautes lumières
    f = np.clip((f - .42) * 1.18 + .42, 0, 1)                            # contraste
    warm = np.array([.80, .90, 1.06], np.float32)                        # BGR : réchauffe
    f = f * (warm * (1 - lum) + 1 * lum)
    H, W = f.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
    v = 1 - .35 * np.clip(((xx - W / 2) / (W * .62)) ** 2 + ((yy - H * .48) / (H * .62)) ** 2, 0, 1)
    f = f * v[..., None]
    cv2.imwrite(str(D / f'car-{k}.jpg'), np.clip(f * 255, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92])
    print(k, f.shape)
