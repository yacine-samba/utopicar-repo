"""MO10 « La cote » : la voiture que le débutant affiche à 5 000 €, une vraie Renault Clio III (Wikimedia Commons,
version exacte : Clio III phase 1, 5 portes, gris platine, enjoliveurs) + six AUTRES Clio III de couleurs différentes
pour les vignettes de la grille d'annonces concurrentes.
    python3 scripts/photos-mo10.py              → les deux
    python3 scripts/photos-mo10.py voiture      → assets/photos-mo10/car-clio3.png (RGBA, rognée)
                                                  assets/photos-mo10/car-clio3-contour.js (window.CAR_CLIO3_CONTOUR, même rognage)
    python3 scripts/photos-mo10.py annonces     → assets/photos-mo10/annonce-1.jpg … annonce-6.jpg (800 × 600, non détourées)
Originaux dans assets/photos-mo10/src/wm-<nom>.jpg (hors git, vignettes 1920 / 1280 px de Commons) ; auteurs et
licences : assets/photos-mo10/CREDITS.tsv (domaine public, CC BY 3.0, CC BY-SA 3.0 → crédit dans la légende du post).
Logos Renault (calandre, enjoliveurs, voitures du fond), plaques, plaques de concessionnaire, autocollants et pancartes
effacés ; chaque retouche est sauvée en src/retouche-<nom>.png pour contrôle (hors git, comme src/).
Contour au format de film-mo5da/polo-contour.js : {w: 1000, h, d, len, n}, repère 1000 px de large = largeur du PNG.
"""
import json, sys
import numpy as np, cv2
from pathlib import Path
from PIL import Image, ImageFilter

D = Path(__file__).resolve().parent.parent / 'assets' / 'photos-mo10'
SRC = D / 'src'

# ---------------------------------------------------------------------------------------------------------------
# retouches ; zone = ellipse (cx, cy, rx, ry) ou polygone, en pixels de l'original (avant retournement / recadrage)
#   'band'  interpolation ligne à ligne entre les deux bords (logo posé sur une carrosserie unie)
#   'smooth' surface lisse tendue sur le bord de la zone (logo ET son cuvelage en relief : plus de forme fantôme)
#   'telea' inpainting classique (enjoliveur, vitre, fond)
#   'plate' plaque vierge : quadrilatère (haut-g, haut-d, bas-d, bas-g), ton d'origine ou gris neutre ('neutral')
#   'frame' support de plaque : quadrilatère extérieur repeint du noir du support (efface le texte du concessionnaire)
# ---------------------------------------------------------------------------------------------------------------
HERO = dict(src='wm-clio3.jpg', name='car-clio3', flip=True,      # sur la photo, l'avant regarde vers la droite
            fixes=[
    ('smooth', [(1474, 722), (1522, 716), (1580, 764), (1596, 830), (1586, 868), (1538, 882), (1500, 850),
                (1472, 795)]),                                             # losange de calandre et son cuvelage
    ('telea', (603, 1055, 14, 26)),                                        # losange de l'enjoliveur avant
    ('telea', (107, 675, 9, 18)),                                          # losange de l'enjoliveur arrière
    ('telea', (628, 390, 34, 24)),                                         # vignette verte collée au pare-brise
    ('telea', (1444, 899, 7, 12)),                                         # insecte écrasé sur le bouclier
    ('frame', [(1360, 931), (1723, 857), (1728, 977), (1399, 1057), (1377, 1050)]),   # support + texte du garage
    ('plate', [(1385, 943), (1720, 875), (1719, 959), (1384, 1038)]),     # plaque (déjà floutée) → plaque vierge
])

# vignettes : (nom, fichier, retouches, recadrage 4:3 (x0, y0, x1, y1) dans l'original)
ANNONCES = [
    ('annonce-1', 'wm-annonce-1.jpg', [                                    # rouge, phase 2, 3 portes (1280 × 960)
        ('band', [(258, 482), (310, 479), (312, 494), (294, 524), (272, 534), (250, 532), (249, 516)]),
        ('telea', (834, 711, 10, 11)),
        ('plate', [(142, 589), (352, 613), (352, 691), (143, 660)]),
    ], (0, 0, 1280, 960)),
    ('annonce-2', 'wm-annonce-2.jpg', [                                    # blanche, phase 2, 3 portes (1920 × 1354)
        ('band', [(1438, 668), (1478, 662), (1500, 668), (1522, 690), (1527, 755), (1500, 762), (1488, 758),
                  (1460, 728), (1445, 712), (1438, 690)]),
    ], (20, 0, 1825, 1354)),
    ('annonce-3', 'wm-annonce-3.jpg', [                                    # gris, phase 2, 5 portes (1920 × 1343)
        ('band', [(1450, 648), (1458, 638), (1482, 636), (1508, 650), (1540, 676), (1544, 726), (1524, 736),
                  (1508, 736), (1492, 723), (1468, 701), (1456, 691), (1450, 670)]),
    ], (50, 0, 1841, 1343)),
    ('annonce-4', 'wm-annonce-4.jpg', [                                    # noire, phase 2, 3 portes (1280 × 914)
        ('band', [(196, 478), (210, 451), (237, 434), (264, 434), (264, 451), (248, 471), (233, 488), (214, 498),
                  (198, 498)]),
        ('telea', [(528, 132), (548, 112), (572, 98), (600, 88), (646, 81), (649, 104), (615, 121), (565, 137),
                   (530, 142)]),                                   # autocollant d'offre sur le pare-brise
        ('telea', [(340, 0), (386, 0), (386, 22), (340, 22)]),             # enseigne Renault du concessionnaire
        ('plate', [(105, 541), (281, 602), (281, 666), (105, 598)]),
    ], (35, 0, 1254, 914)),
    ('annonce-5', 'wm-annonce-5.jpg', [                                    # beige, phase 1, 5 portes (1280 × 883)
        ('band', [(139, 470), (160, 462), (174, 465), (174, 505), (161, 523), (146, 533), (137, 523), (137, 490)]),
        ('plate', [(67, 531), (204, 595), (205, 662), (67, 600)], 'neutral'),    # plaque jaune du garage + texte
        ('telea', [(562, 235), (647, 235), (647, 285), (562, 285)]),       # pancarte « VERKAUFT »
        ('telea', (673, 684, 11, 15)), ('telea', (1186, 443, 7, 10)),      # losanges des enjoliveurs
        ('telea', (281, 146, 10, 12)),                                     # Clio bleue du fond : losange
        ('plate', [(251, 158), (301, 158), (301, 182), (251, 182)], 'neutral'),  #   et plaque du garage
        ('telea', (554, 179, 12, 14)),                                     # Clio grise vue à travers le pare-brise
        ('telea', [(518, 197), (588, 197), (588, 224), (518, 224)]),
        ('telea', [(102, 2), (137, 2), (137, 11), (102, 11)]),            # enseigne « KÄRCHER » du bâtiment (haut gauche)
    ], (49, 0, 1226, 883)),
    ('annonce-6', 'wm-annonce-6.jpg', [                                    # bleu saphir, phase 2, 3 portes (1280 × 937)
        ('band', [(1025, 482), (1040, 472), (1061, 474), (1082, 499), (1086, 529), (1075, 542), (1059, 540),
                  (1039, 521), (1029, 500)]),
        ('plate', [(997, 639), (1178, 578), (1177, 636), (997, 707)]),
        ('telea', [(386, 219), (448, 201), (472, 256), (409, 278)]),       # vignette collée au pare-brise
        ('telea', (468, 722, 12, 14)),
    ], (16, 0, 1265, 937)),
]


def zone_mask(shape, z):
    m = np.zeros(shape[:2], np.uint8)
    if isinstance(z, tuple): cx, cy, rx, ry = z; cv2.ellipse(m, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
    else: cv2.fillPoly(m, [np.array(z, np.int32)], 255)
    return m


def band_fill(im, m, seed=10):
    """Efface un badge posé sur une carrosserie unie : chaque ligne est interpolée entre ses deux bords."""
    ys = np.nonzero(m.any(1))[0]
    f = im.astype(np.float32); out = f.copy()
    for y in ys:
        xs = np.nonzero(m[y])[0]
        xa, xb = xs[0], xs[-1]
        L = np.median(f[y - 1:y + 2, max(xa - 7, 0):max(xa - 1, 1)].reshape(-1, 3), 0)
        R = np.median(f[y - 1:y + 2, xb + 2:xb + 8].reshape(-1, 3), 0)
        t = np.linspace(0, 1, xb - xa + 1)[:, None]
        out[y, xa:xb + 1] = L * (1 - t) + R * t
    sm = cv2.GaussianBlur(out, (0, 0), 1.6)                       # adoucit les marches entre lignes
    sm += np.random.default_rng(seed).normal(0, 2.0, sm.shape).astype(np.float32)   # rend le grain de la photo
    w = cv2.GaussianBlur((m > 0).astype(np.float32), (0, 0), 1.2)[..., None]
    return np.clip(f * (1 - w) + sm * w, 0, 255).astype(np.uint8)


def blank_plate(im, quad, base=None, seed=9, ref=None):
    """Plaque vierge : ton de la plaque d'origine (ou gris neutre), léger dégradé vertical, liseré plus sombre, grain.
    Le ton est lu sur `ref` (la photo avant retouches) : un support repeint juste avant ne le fausse pas."""
    q = np.array(quad, np.int32)
    m = np.zeros(im.shape[:2], np.uint8); cv2.fillPoly(m, [q], 255)
    inner = cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    f = im.astype(np.float32)
    med = np.median((im if ref is None else ref).astype(np.float32)[inner > 0], 0)
    if base is None: base = med
    elif isinstance(base, str) and base == 'neutral': base = np.full(3, np.clip(med.mean() * 1.05, 150, 215), np.float32)   # plaque du garage → vierge
    base = np.asarray(base, np.float32)
    y0, y1 = q[:, 1].min(), q[:, 1].max()
    yy = (np.arange(im.shape[0], dtype=np.float32)[:, None, None] - y0) / max(y1 - y0, 1)
    plate = np.broadcast_to(np.minimum(base * (1.06 - .14 * np.clip(yy, 0, 1)), 248), f.shape).copy()
    ring = ((m > 0) & (cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))) == 0)).astype(np.float32)
    plate *= (1 - .3 * cv2.GaussianBlur(ring, (0, 0), 1.0))[..., None]
    plate += np.random.default_rng(seed).normal(0, 1.8, f.shape).astype(np.float32)
    w = cv2.GaussianBlur((m > 0).astype(np.float32), (0, 0), 0.9)[..., None]
    return np.clip(f * (1 - w) + plate * w, 0, 255).astype(np.uint8)


def smooth_fill(im, m, seed=5):
    """Surface lisse (interpolation harmonique) tendue sur le bord de la zone, puis grain de la photo."""
    ys, xs = np.nonzero(m); p = 24
    y0, y1, x0, x1 = max(ys.min() - p, 0), ys.max() + p + 1, max(xs.min() - p, 0), xs.max() + p + 1
    f = im[y0:y1, x0:x1].astype(np.float32); hole = m[y0:y1, x0:x1] > 0
    known = (~hole).astype(np.float32)
    acc = np.zeros_like(f); wsum = np.zeros(f.shape[:2] + (1,), np.float32)
    for s in (6, 14, 30):                                           # première estimation : convolution normalisée
        acc += cv2.GaussianBlur(f * known[..., None], (0, 0), s)
        wsum += cv2.GaussianBlur(known, (0, 0), s)[..., None]
    g = f.copy(); g[hole] = (acc / np.maximum(wsum, 1e-4))[hole]
    for _ in range(400):                                            # puis diffusion : le trou devient une surface tendue
        b = cv2.GaussianBlur(g, (0, 0), 2.0); g[hole] = b[hole]
    g += np.random.default_rng(seed).normal(0, 1.8, g.shape).astype(np.float32) * hole[..., None]
    w = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 1.2)[..., None]
    out = im.copy(); out[y0:y1, x0:x1] = np.clip(f * (1 - w) + g * w, 0, 255).astype(np.uint8)
    return out


def frame_fill(im, poly, seed=7):
    """Support de plaque repeint de son noir (le texte blanc du concessionnaire disparaît)."""
    m = zone_mask(im.shape, poly)
    f = im.astype(np.float32)
    col = np.full(3, np.percentile(f[m > 0].mean(1), 15), np.float32)   # le plastique noir (neutre), pas les lettres
    paint = np.broadcast_to(col, f.shape) + np.random.default_rng(seed).normal(0, 2.0, f.shape).astype(np.float32)
    w = cv2.GaussianBlur((m > 0).astype(np.float32), (0, 0), 1.0)[..., None]
    return np.clip(f * (1 - w) + paint * w, 0, 255).astype(np.uint8)


def retouche(im, fixes):
    ref = im.copy()
    for i, fx in enumerate(fixes):
        kind, z = fx[0], fx[1]
        if kind == 'band': im = band_fill(im, zone_mask(im.shape, z), seed=10 + i)
        elif kind == 'smooth': im = smooth_fill(im, zone_mask(im.shape, z), seed=40 + i)
        elif kind == 'telea': im = cv2.inpaint(im, zone_mask(im.shape, z), 6, cv2.INPAINT_TELEA)
        elif kind == 'frame': im = frame_fill(im, z, seed=20 + i)
        elif kind == 'plate': im = blank_plate(im, z, fx[2] if len(fx) > 2 else None, seed=30 + i, ref=ref)
    return im


# ---------------------------------------------------------------------------------------------------------------
def voiture():
    from rembg import new_session, remove
    name = HERO['name']
    im = retouche(cv2.imread(str(SRC / HERO['src'])), HERO['fixes'])
    cv2.imwrite(str(SRC / f'retouche-{name}.png'), im)
    if HERO['flip']: im = im[:, ::-1].copy()
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

    # décontamination : la couleur des pixels du bord est remplacée par celle de l'intérieur voisin (pas de liseré gris)
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
    Image.fromarray(np.dstack([rgb * 255, alpha * 255]).clip(0, 255).astype(np.uint8), 'RGBA').save(D / f'{name}.png', optimize=True)

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
    var = name.upper().replace('-', '_')
    (D / f'{name}-contour.js').write_text(f'window.{var}_CONTOUR = {json.dumps(info)};\n')
    print(D / f'{name}.png', f'{W}x{H}', '· contour', info['n'], 'points,', round(L), 'px, h', info['h'])


# ---------------------------------------------------------------------------------------------------------------
def annonces():
    """Vignettes de la grille d'annonces : photo entière (non détourée), recadrée 4:3, étalonnage sobre et commun."""
    for name, src, fixes, (x0, y0, x1, y1) in ANNONCES:
        im = retouche(cv2.imread(str(SRC / src)), fixes)
        cv2.imwrite(str(SRC / f'retouche-{name}.png'), im)
        im = im[y0:y1, x0:x1]
        assert abs((x1 - x0) / (y1 - y0) - 4 / 3) < .005, (name, (x1 - x0) / (y1 - y0))
        f = im.astype(np.float32) / 255
        hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV); hsv[..., 1] *= .88; f = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        f = np.clip((f - .5) * 1.06 + .5, 0, 1) * .97                  # un peu de contraste, sans écraser les blancs
        lum = f.mean(2, keepdims=True)                                 # ombres légèrement chaudes (charte), à 35 %
        f = f * (1 - .35 * (1 - lum) * (1 - np.array([.90, .96, 1.04], np.float32)))
        H, W = f.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
        r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
        f *= (1 - .10 * np.clip(r - .55, 0, 1) ** 1.5)[..., None]      # vignettage très léger
        out = Image.fromarray(cv2.cvtColor(np.clip(f * 255, 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB))
        out = out.resize((800, 600), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.0, percent=35, threshold=2))
        out.save(D / f'{name}.jpg', quality=90, optimize=True, progressive=True)
        print(D / f'{name}.jpg', out.size, f'(depuis {x1 - x0}×{y1 - y0})')


if __name__ == '__main__':
    what = sys.argv[1] if len(sys.argv) > 1 else 'tout'
    if what in ('voiture', 'tout'): voiture()
    if what in ('annonces', 'tout'): annonces()
