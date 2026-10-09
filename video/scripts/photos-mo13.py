"""MO13 « Avec 1 500 € » : les trois voitures de l'escalier, une par marche, trois vraies photos Wikimedia Commons du
même photographe (Vauxford, CC BY-SA 4.0), même angle (trois quarts avant, objectif bas), retournées pour que l'avant
regarde vers la gauche :
  car-206-mo13  marche 1 · Peugeot 206 L 1.1, 3 portes, rouge (photo de 2000)       src : ../cars-libres/src/wm-206.jpg
  car-megane2   marche 2 · Renault Mégane II phase 2, 3 portes, gris (photo de 2007) src : src/wm-megane2.jpg
  car-fiesta6   marche 3 · Ford Fiesta VI, 5 portes, bleue (photo de 2010)          src : src/wm-fiesta6.jpg

    python3 scripts/photos-mo13.py                → assets/photos-mo13/ (voitures, contours, repères, 206 floue, CREDITS.tsv)
    python3 scripts/photos-mo13.py --retouche     → src/retouche-<nom>.png seulement (contrôle des zones effacées)
    python3 scripts/photos-mo13.py --check D      → en plus, planches de contrôle dans D (fond #08070a, zooms des zones)

Retouches (en pixels de l'original 1920 px, avant retournement ; méthode de scripts/cars-libres-twingo-c3.py) :
  206      celles de scripts/cars-libres-206.py (lion de calandre et d'enjoliveurs, autocollant AA, plaque), plus ce
           que le pare-brise laissait voir (vignette, permis de stationnement, antivol jaune, mur de briques,
           horodateur) : il devient une vitre teintée avec le reflet du ciel ; gilet jaune de la plage avant effacé,
           autocollant de la custode effacé. La version partagée (assets/cars-libres/car-206.png) n'est pas modifiée.
  Mégane   losange de calandre, losanges des deux enjoliveurs, inscription « 1.6 16V » du badge de portière (elle se
           lirait à l'envers une fois l'image retournée), texte du concessionnaire du cadre de plaque, plaque.
  Fiesta   ovale de calandre, ovales embossés des deux enjoliveurs, plaque.
Les voitures garées derrière (Mégane : plaque partielle « FS… » au bord gauche de l'original), poubelles et caisse
restent hors du masque (contrôlé sur la planche).

Étalonnage commun : la Mégane est photographiée par temps gris d'automne, la Fiesta en plein soleil, la 206 par temps
couvert. Avant l'étalonnage de la charte (celui de MO8, inchangé), chaque voiture passe par (1) une balance des blancs
mesurée sur ses pixels neutres (pneus, chromes, vitres, gris : saturation < 0,14), (2) une remise à la même plage de
luminance (centiles 3 et 97 du masque ramenés à 0,05 et 0,82, à 70 %). Contrôle : les trois voitures côte à côte.

Échelle : la hauteur de caisse est la mesure qui ne dépend pas de l'angle de prise de vue (l'empattement, vu de trois
quarts, est raccourci de 48 à 57 % selon la photo : cos 0,43 à 0,52, ce qui fausserait l'échelle de ± 10 %).
Hauteurs (fr.wikipedia.org, infobox, consultées le 9 octobre 2026) : 206 berline 1 430 mm, Mégane II berline 1 457 mm,
Fiesta VI 1 480 mm ; longueurs 3 835, 4 210 et 3 950 mm. Repères dans car-<nom>-reperes.js (« echelle »).

Sorties (assets/photos-mo13/) :
  car-<nom>.png, car-<nom>-contour.js   RGBA rognée ; window.CAR_<NOM>_CONTOUR {w: 1000, h, d, len, n}
  car-<nom>-reperes.js                  window.CAR_<NOM>_REPERES : rétroviseur (point d'attache du fil de l'étiquette),
                                        contacts des roues au sol, centres des roues, haut du toit, boîte, plaque,
                                        échelle ; en pixels du PNG et dans le repère du contour (1000 px de large)
  car-206-mo13-flou.png                 la 206 floutée d'avance (image 0 : la voiture d'en face, floue), demi-résolution,
                                        flou sur couleurs prémultipliées (sigma 14 px en pleine résolution)
"""
import json, sys
import numpy as np, cv2
from pathlib import Path
from PIL import Image, ImageDraw
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'photos-mo13'
LIB = ROOT / 'assets' / 'cars-libres'
CHECK = Path(sys.argv[sys.argv.index('--check') + 1]) if '--check' in sys.argv else None


# ---------- zones à effacer ----------
# 'band'    interpolation ligne à ligne entre les deux bords, le long d'une pente optionnelle (calandre, barrette)
# 'smooth'  surface lisse ajustée sur l'anneau autour de la zone (centre d'enjoliveur, tôle)
# 'strokes' traits plus sombres que leur voisinage (inscription en relief) repérés puis inpaintés, le reste intact
# 'rowfit'  face d'un badge : chaque ligne (le long d'une pente) remplacée par une droite ajustée sur ses pixels
# 'yellow'  pixels jaune-vert fluo (gilet) repérés dans la zone puis inpaintés
# 'telea'   inpainting classique (petites zones)
# 'glass'   vitre teintée sombre et reflet doux à la place de ce qu'on voyait à travers
# plaque : quadrilatère (haut-g, haut-d, bas-d, bas-g) → plaque vierge, cadre compris
CARS = {
    '206-mo13': dict(src=LIB / 'src' / 'wm-206.jpg', title='Peugeot 206 L 1.1, 3 portes (2000)', logos=[
        # repris de scripts/cars-libres-206.py
        ('band', [(1567, 611), (1600, 605), (1663, 605), (1665, 662), (1651, 675), (1589, 675), (1577, 652),
                  (1562, 622)]),                                            # lion de calandre et son cadre chromé
        ('telea', [(912, 803), (920, 801), (921, 812), (930, 814), (931, 822), (927, 828), (926, 838), (918, 839),
                   (915, 832), (910, 828), (907, 820), (910, 815)]),        # lion de l'enjoliveur avant
        ('telea', (171, 680, 8, 12)),                                       # lion de l'enjoliveur arrière
        ('telea', (877, 355, 25, 16)),                                      # autocollant AA (pare-brise)
        # propres à MO13
        ('telea', (341, 316, 13, 17)),                                      # autocollant de la custode arrière
        ('yellow', [(430, 236), (575, 236), (575, 312), (430, 312)]),       # gilet jaune sur la plage avant
        ('glass', [(703, 140), (930, 129), (1150, 136), (1185, 152), (1300, 228), (1400, 296), (1458, 344),
                   (1300, 343), (1150, 350), (1080, 362), (950, 366), (862, 363), (820, 318), (775, 255),
                   (735, 196)]),                                            # pare-brise → vitre teintée
    ], plate=[(1476, 810), (1721, 788), (1713, 858), (1466, 881)],
        hubs={'avant': (913, 817), 'arriere': (170, 680)}, mirror=(648, 404),
        height_mm=1430, length_mm=3835, wheelbase_mm=2440),
    'megane2': dict(src=OUT / 'src' / 'wm-megane2.jpg', title='Renault Mégane II phase 2, 3 portes (2007)', logos=[
        ('smooth', [(1590, 521), (1598, 507), (1621, 510), (1650, 547), (1652, 605), (1617, 606), (1588, 557)]),
        #                                                                     losange de calandre et son ombre
        ('smooth', (900, 752, 18, 23)),                                     # losange de l'enjoliveur avant
        ('smooth', (128, 616, 11, 16)),                                     # losange de l'enjoliveur arrière
        ('rowfit', [(663, 572), (712, 580), (712, 603), (663, 599)], lambda x: 0.17 * (x - 663)),
        #                                                                     « 1.6 16V » sur la face du badge de portière
        ('telea', (871, 321, 6, 5)),                                        # petite marque collée au pare-brise
    ], plate=[(1510, 645), (1752, 630), (1755, 704), (1513, 723)],      # plaque et texte du concessionnaire
        hubs={'avant': (900, 752), 'arriere': (128, 616)}, mirror=(642, 352),
        height_mm=1457, length_mm=4210, wheelbase_mm=None),
    'fiesta6': dict(src=OUT / 'src' / 'wm-fiesta6.jpg', title='Ford Fiesta VI, 5 portes (2010)', logos=[
        ('band', (1656, 543, 48, 34)),                                      # ovale de calandre, sur sa barrette
        ('smooth', (1003, 756, 12, 17)),                                    # ovale embossé de l'enjoliveur avant
        ('smooth', (164, 683, 10, 14)),                                     # ovale embossé de l'enjoliveur arrière
    ], plate=[(1570, 663), (1782, 656), (1780, 723), (1570, 731)],
        hubs={'avant': (1003, 756), 'arriere': (164, 683)}, mirror=(765, 392),
        height_mm=1480, length_mm=3950, wheelbase_mm=2490),
}


def zone_mask(shape, z):
    m = np.zeros(shape[:2], np.uint8)
    if isinstance(z, tuple): cx, cy, rx, ry = z; cv2.ellipse(m, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
    else: cv2.fillPoly(m, [np.array(z, np.int32)], 255)
    return m


def band_fill(im, m, slope=None, seed=11):
    """Efface un badge posé sur des bandes : l'image est redressée (pente optionnelle), chaque ligne est interpolée
    entre ses deux bords, puis l'image est remise en place."""
    H, W = im.shape[:2]
    xx, yy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    off = slope(xx).astype(np.float32) if slope else np.zeros_like(xx)
    f0 = im.astype(np.float32)
    f = cv2.remap(f0, xx, yy + off, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    ms = cv2.remap(m, xx, yy + off, cv2.INTER_NEAREST)
    out = f.copy()
    for y in np.nonzero(ms.any(1))[0]:
        xs = np.nonzero(ms[y])[0]
        xa, xb = xs[0], xs[-1]
        L = np.median(f[y - 1:y + 2, xa - 7:xa - 1].reshape(-1, 3), 0)
        R = np.median(f[y - 1:y + 2, xb + 2:xb + 8].reshape(-1, 3), 0)
        t = np.linspace(0, 1, xb - xa + 1)[:, None]
        out[y, xa:xb + 1] = L * (1 - t) + R * t
    sm = cv2.GaussianBlur(out, (0, 0), sigmaX=1.4, sigmaY=0.35)      # lissage le long des bandes seulement :
    sm += np.random.default_rng(seed).normal(0, 2.0, sm.shape).astype(np.float32)   # les liserés restent nets
    back = cv2.remap(sm, xx, yy - off, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    w = cv2.GaussianBlur((m > 0).astype(np.float32), (0, 0), 1.2)[..., None]
    return np.clip(f0 * (1 - w) + back * w, 0, 255).astype(np.uint8)


def smooth_fill(im, m):
    """Surface quadratique ajustée (robuste) sur un anneau de 10 px autour de la zone, plus le grain de la photo."""
    ring = (cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21))) > 0) & (m == 0)
    ys, xs = np.nonzero(ring); f = im.astype(np.float32)
    cx, cy, s = xs.mean(), ys.mean(), max(np.ptp(xs), np.ptp(ys)) / 2

    def basis(x, y):
        u, v = (x - cx) / s, (y - cy) / s
        return np.stack([np.ones_like(u), u, v, u * u, u * v, v * v], 1)
    A = basis(xs.astype(np.float32), ys.astype(np.float32)); out = f.copy()
    my, mx = np.nonzero(m); B = basis(mx.astype(np.float32), my.astype(np.float32))
    for ch in range(3):
        b = f[ys, xs, ch]; keep = np.ones(len(b), bool)
        for _ in range(4):                                       # rejette reflets, trous et liserés
            c, *_ = np.linalg.lstsq(A[keep], b[keep], rcond=None)
            r = b - A @ c; keep = np.abs(r) < 2.0 * max(np.std(r[keep]), 1.0)
        out[my, mx, ch] = B @ c
    out += np.random.default_rng(int(cx)).normal(0, 2.6, f.shape).astype(np.float32) * (m > 0)[..., None]
    w = cv2.GaussianBlur((m > 0).astype(np.float32), (0, 0), 2.0)[..., None]
    return np.clip(f * (1 - w) + out * w, 0, 255).astype(np.uint8)


def strokes_fill(im, m):
    """Inscription en relief (badge chromé) : les traits sont les pixels plus sombres de 10 niveaux que la médiane
    locale (9 px) ; ils sont élargis d'un pixel et inpaintés, le chrome autour reste."""
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    med = cv2.medianBlur(g, 9).astype(np.float32)
    ink = ((med - g.astype(np.float32) > 10) & (m > 0)).astype(np.uint8) * 255
    ink = cv2.dilate(ink, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
    out = cv2.inpaint(im, ink, 4, cv2.INPAINT_TELEA)
    # deuxième passe douce : le relief clair qui bordait les traits disparaît aussi
    sm = cv2.bilateralFilter(out, 7, 18, 5)
    w = cv2.GaussianBlur((m > 0).astype(np.float32), (0, 0), 1.0)[..., None] * 0.8
    return np.clip(out * (1 - w) + sm * w, 0, 255).astype(np.uint8)


def rowfit_fill(im, m, slope):
    """Face d'un badge chromé (inscription en relief) : l'image est redressée le long du badge, chaque ligne de la zone
    est remplacée par une droite ajustée (robuste : les traits de l'inscription sont rejetés) sur ses propres pixels,
    ce qui garde le dégradé du chrome sans rien tirer du jonc noir voisin ; puis remise en place, grain compris."""
    H, W = im.shape[:2]
    xx, yy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    off = slope(xx).astype(np.float32)
    f0 = im.astype(np.float32)
    f = cv2.remap(f0, xx, yy + off, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    ms = cv2.remap(m, xx, yy + off, cv2.INTER_NEAREST)
    out = f.copy()
    for y in np.nonzero(ms.any(1))[0]:
        xs = np.nonzero(ms[y])[0]
        if len(xs) < 6: continue
        A = np.stack([np.ones(len(xs)), (xs - xs.mean()) / 20], 1)
        for ch in range(3):
            b = f[y, xs, ch]; keep = np.ones(len(b), bool)
            for _ in range(4):
                c, *_ = np.linalg.lstsq(A[keep], b[keep], rcond=None)
                r = b - A @ c; keep = np.abs(r) < 1.5 * max(np.std(r[keep]), 1.0)
            out[y, xs, ch] = A @ c
    sm = cv2.GaussianBlur(out, (0, 0), 0.9)
    sm += np.random.default_rng(7).normal(0, 1.6, sm.shape).astype(np.float32)
    back = cv2.remap(sm, xx, yy - off, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    w = cv2.GaussianBlur((m > 0).astype(np.float32), (0, 0), 0.8)[..., None]
    return np.clip(f0 * (1 - w) + back * w, 0, 255).astype(np.uint8)


def yellow_fill(im, m):
    """Gilet fluo vu à travers la vitre : pixels jaune-vert saturés de la zone, élargis de 4 px, inpaintés."""
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    # vu à travers la vitre bleutée, le jaune fluo tire sur le vert (teinte 55 à 75 sur 180) ; la vitre seule est
    # cyan (88 à 100) et peu saturée
    y = ((hsv[..., 0] > 30) & (hsv[..., 0] < 84) & (hsv[..., 1] > 45) & (hsv[..., 2] > 60) & (m > 0)).astype(np.uint8)
    y = cv2.dilate(y * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    return cv2.inpaint(im, y, 6, cv2.INPAINT_TELEA)


def glass_fill(im, m, seed=13):
    """Vitre teintée : ce qu'on voyait à travers est désaturé, flouté (sigma 16 px) et n'en garde que 45 % des
    variations, sur un gris sombre à peine bleuté ; par-dessus, le ciel qui se reflète en haut, deux traînées
    diagonales douces et le grain de la photo. Aucun détail (vignette, antivol, mur, horodateur) ne survit au flou."""
    f = im.astype(np.float32)
    mf = (m > 0).astype(np.float32)
    lum = f.mean(2)
    bl = cv2.GaussianBlur(lum * mf, (0, 0), 16) / np.maximum(cv2.GaussianBlur(mf, (0, 0), 16), 1e-3)
    ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    yy, xx = np.mgrid[0:im.shape[0], 0:im.shape[1]].astype(np.float32)
    t = np.clip((yy - y0) / (y1 - y0), 0, 1); u = np.clip((xx - x0) / (x1 - x0), 0, 1)
    base = np.array([62, 57, 54], np.float32)                     # BGR : gris sombre, à peine bleuté
    glass = base + 0.45 * (bl - bl[m > 0].mean())[..., None] - (12 * t)[..., None]
    sky = 64 * (1 - t) ** 1.5                                     # le ciel se reflète en haut du pare-brise
    d = u * 0.85 + t * 0.55
    streak = (36 * np.exp(-((d - 0.80) / 0.08) ** 2) + 20 * np.exp(-((d - 0.47) / 0.05) ** 2)) * (1 - 0.5 * t)
    glass += (sky + streak)[..., None] * np.array([1.08, 1.0, 0.92], np.float32)
    glass += np.random.default_rng(seed).normal(0, 2.0, f.shape).astype(np.float32)
    w = cv2.GaussianBlur(mf, (0, 0), 1.6)[..., None]
    return np.clip(f * (1 - w) + glass * w, 0, 255).astype(np.uint8)


def blank_plate(im, quad):
    """Plaque vierge : ton de la plaque d'origine, léger dégradé vertical, liseré plus sombre, grain."""
    q = np.array(quad, np.int32)
    m = np.zeros(im.shape[:2], np.uint8); cv2.fillPoly(m, [q], 255)
    inner = cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    f = im.astype(np.float32)
    base = np.median(f[inner > 0], 0)
    y0, y1 = q[:, 1].min(), q[:, 1].max()
    yy = (np.arange(im.shape[0], dtype=np.float32)[:, None, None] - y0) / max(y1 - y0, 1)
    plate = np.broadcast_to(base * (1.06 - .14 * np.clip(yy, 0, 1)), f.shape).copy()
    ring = ((m > 0) & (cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))) == 0)).astype(np.float32)
    plate *= (1 - .55 * cv2.GaussianBlur(ring, (0, 0), 1.2))[..., None]
    plate += np.random.default_rng(9).normal(0, 2.0, f.shape).astype(np.float32)
    w = cv2.GaussianBlur((m > 0).astype(np.float32), (0, 0), 0.9)[..., None]
    return np.clip(f * (1 - w) + plate * w, 0, 255).astype(np.uint8)


def retouch(car):
    im = cv2.imread(str(car['src']))
    for kind, z, *rest in car['logos']:
        m = zone_mask(im.shape, z)
        if kind == 'band': im = band_fill(im, m, *rest)
        elif kind == 'smooth': im = smooth_fill(im, m)
        elif kind == 'strokes': im = strokes_fill(im, m)
        elif kind == 'rowfit': im = rowfit_fill(im, m, *rest)
        elif kind == 'yellow': im = yellow_fill(im, m)
        elif kind == 'glass': im = glass_fill(im, m)
        else: im = cv2.inpaint(im, m, 5, cv2.INPAINT_TELEA)
    return blank_plate(im, car['plate'])


def contour_of(alpha):
    """Contour vectoriel (cutout.py), légèrement à l'extérieur du bord pour le recouvrir ; départ à l'avant."""
    mm = (alpha > 0.43).astype(np.uint8)
    mm = cv2.morphologyEx(mm, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    mm = cv2.morphologyEx(mm, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    mm = cv2.dilate(mm, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    cs, _ = cv2.findContours(mm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea)[:, 0, :].astype(np.float32)
    k = 9; pad = np.vstack([c[-k:], c, c[:k]]); ker = np.ones(2 * k + 1) / (2 * k + 1)
    pts = np.stack([np.convolve(pad[:, 0], ker, 'valid'), np.convolve(pad[:, 1], ker, 'valid')], 1).astype(np.float32)
    apx = cv2.approxPolyDP(pts.reshape(-1, 1, 2), 0.8, True)[:, 0, :]
    apx = np.roll(apx, -int(np.argmin(apx[:, 0])), 0)
    W = alpha.shape[1]; sc = 1000 / W
    d = 'M' + ' L'.join(f'{x * sc:.1f} {y * sc:.1f}' for x, y in apx) + ' Z'
    L = float(np.sum(np.linalg.norm(np.diff(np.vstack([apx, apx[:1]]), axis=0), axis=1)) * sc)
    return {'w': 1000, 'h': round(alpha.shape[0] * sc, 1), 'd': d, 'len': round(L, 1), 'n': int(len(apx))}


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    ses = None if '--retouche' in sys.argv else new_session('birefnet-general-lite')
    made = {}
    for key, car in CARS.items():
        NAME = f'car-{key}'
        im = retouch(car)
        cv2.imwrite(str(OUT / 'src' / f'retouche-{key}.png'), im)       # contrôle des retouches (hors git, comme src/)
        if '--retouche' in sys.argv: print('retouche', key); continue
        H0, W0 = im.shape[:2]
        im = im[:, ::-1].copy()                                          # les trois photos regardent vers la droite
        H, W = im.shape[:2]

        # masque BiRefNet, puis silhouette de cutout.py : trous bouchés, poussières retirées, arête adoucie (≈ 1,5 px)
        rgb = Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB))
        m = np.asarray(remove(rgb, session=ses, only_mask=True)).astype(np.float32) / 255
        hard = (m > 0.5).astype(np.uint8)
        hard = cv2.morphologyEx(hard, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
        hard = cv2.morphologyEx(hard, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
        n, lab, st, _ = cv2.connectedComponentsWithStats(hard)
        if n > 1: hard = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
        alpha = np.minimum(m, cv2.GaussianBlur(hard.astype(np.float32), (0, 0), 1.5))
        alpha = np.clip((alpha - 0.04) / 0.92, 0, 1)

        # étalonnage commun, (1) balance des blancs sur les pixels neutres de la voiture, (2) même plage de luminance
        f = im.astype(np.float32) / 255
        inside = alpha > 0.9
        hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
        lum = f.mean(2)
        neutral = inside & (hsv[..., 1] < 0.14) & (lum > 0.12) & (lum < 0.88)
        mean = f[neutral].mean(0); gains = np.clip(mean.mean() / mean, 0.88, 1.12)
        f = np.clip(f * gains.astype(np.float32), 0, 1)
        lum = f.mean(2); p3, p97 = np.percentile(lum[inside], [3, 97])
        a_ = (0.82 - 0.05) / max(p97 - p3, 1e-3); b_ = 0.05 - a_ * p3
        f = np.clip(0.3 * f + 0.7 * (f * a_ + b_), 0, 1).astype(np.float32)
        # étalonnage MO8 : saturation −20 %, contraste, ombres réchauffées, lumière qui tombe du haut-gauche (capot)
        hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV); hsv[..., 1] *= .8; f = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        f = np.clip((f - .5) * 1.15 + .5, 0, 1) * .78
        lum = f.mean(2, keepdims=True); f = f * (np.array([.84, .93, 1.05], np.float32) * (1 - lum) + lum)
        yy, xx = np.mgrid[0:H, 0:W] / max(H, W)
        f *= (1.08 - .45 * np.clip(yy * .9 + xx * .2 - .25, 0, 1))[..., None]
        rgb = np.clip(f[..., ::-1], 0, 1).astype(np.float32)

        # décontamination : la couleur des pixels du bord est remplacée par celle de l'intérieur voisin
        inner = (alpha > 0.97).astype(np.float32)
        acc = np.zeros_like(rgb); wsum = np.zeros((H, W, 1), np.float32)
        for s in (2, 5, 11, 23):
            acc += cv2.GaussianBlur(rgb * inner[..., None], (0, 0), s)
            wsum += cv2.GaussianBlur(inner, (0, 0), s)[..., None]
        fill = acc / np.maximum(wsum, 1e-4)
        edge = ((alpha > 0.002) & (alpha < 0.97)).astype(np.float32)[..., None]
        rgb = rgb * (1 - edge) + fill * edge

        # rognage serré sur la silhouette (8 px de marge) : le PNG, le contour et les repères partagent ce rognage
        ys, xs = np.nonzero(alpha > 0.01)
        y0, y1, x0, x1 = max(ys.min() - 8, 0), min(ys.max() + 9, H), max(xs.min() - 8, 0), min(xs.max() + 9, W)
        rgb, alpha = rgb[y0:y1, x0:x1], alpha[y0:y1, x0:x1]; H, W = alpha.shape
        png = np.dstack([rgb * 255, alpha * 255]).clip(0, 255).astype(np.uint8)
        Image.fromarray(png, 'RGBA').save(OUT / f'{NAME}.png', optimize=True)
        info = contour_of(alpha)
        var = NAME.upper().replace('-', '_')
        (OUT / f'{NAME}-contour.js').write_text(f'window.{var}_CONTOUR = {json.dumps(info)};\n')

        # repères : original (avant retournement) → PNG
        P = lambda p: (float(W0 - 1 - p[0] - x0), float(p[1] - y0))
        K = 1000 / W
        r1 = lambda p: [round(p[0], 1), round(p[1], 1)]
        k1 = lambda p: [round(p[0] * K, 1), round(p[1] * K, 1)]
        solid = alpha > 0.5
        sol = {}
        for k, hub in car['hubs'].items():                              # contact au sol : bas du pneu sous le moyeu
            hx = int(round(P(hub)[0])); cols = solid[:, max(hx - 40, 0):hx + 41]
            rows = np.nonzero(cols.any(1))[0]; yb = int(rows.max())
            xb = float(np.nonzero(cols[yb])[0].mean() + max(hx - 40, 0))
            sol[k] = (xb, float(yb))
        widths = solid.sum(1); top = int(np.nonzero(widths > 0.05 * W)[0].min())   # toit, sans l'antenne
        xt = float(np.nonzero(solid[top])[0].mean())
        hubs = {k: P(v) for k, v in car['hubs'].items()}
        ground = max(v[1] for v in sol.values())
        h_px = sol['avant'][1] - top                                    # du toit au contact de la roue avant
        wb_px = float(np.hypot(*np.subtract(hubs['avant'], hubs['arriere'])))
        ys_, xs_ = np.nonzero(png[..., 3] > 128)
        R = {
            'voiture': car['title'], 'png': {'w': W, 'h': H}, 'contour_w': 1000, 'contour_h': info['h'],
            'avant': 'gauche',
            'retro': {'px': r1(P(car['mirror'])), 'contour': k1(P(car['mirror'])),
                      'note': 'bas du boîtier du rétroviseur : point d\'attache du fil de l\'étiquette'},
            'sol': {k: {'px': r1(v), 'contour': k1(v)} for k, v in sol.items()},
            'centres_roues': {k: {'px': r1(v), 'contour': k1(v)} for k, v in hubs.items()},
            'toit': {'px': r1((xt, top)), 'contour': k1((xt, top))},
            'plaque': {'px': [r1(P(p)) for p in car['plate']], 'contour': [k1(P(p)) for p in car['plate']]},
            'boite': {'px': [int(xs_.min()), int(ys_.min()), int(xs_.max()), int(ys_.max())],
                      'contour': [round(v * K, 1) for v in (xs_.min(), ys_.min(), xs_.max(), ys_.max())]},
            'echelle': {'hauteur_mm': car['height_mm'], 'longueur_mm': car['length_mm'],
                        'hauteur_px': round(h_px, 1), 'px_par_m': round(h_px / car['height_mm'] * 1000, 1),
                        'empattement_px_vu': round(wb_px, 1),
                        'source': 'fr.wikipedia.org (infobox), 9 oct. 2026 ; hauteur mesurée du toit au contact '
                                  'de la roue avant'},
        }
        made[key] = R
        print(OUT / f'{NAME}.png', f'{W}x{H}', '· contour', info['n'], 'points · h', round(h_px), 'px ·',
              R['echelle']['px_par_m'], 'px/m · gains', np.round(gains, 3), '· plage', round(p3, 3), round(p97, 3))

    if made:
        # échelle relative : chaque voiture affichée à sa taille réelle par rapport à la 206 (marche 1)
        ref = made['206-mo13']['echelle']['px_par_m']
        for key, R in made.items():
            R['echelle']['facteur_vs_206'] = round(ref / R['echelle']['px_par_m'], 4)
            R['echelle']['note'] = ('à multiplier à l\'échelle d\'affichage de la 206 pour que les trois voitures '
                                    'soient à la même échelle réelle (même nombre de px par mètre)')
            var = f'CAR_{key.upper().replace("-", "_")}_REPERES'
            (OUT / f'car-{key}-reperes.js').write_text(
                f'// MO13 : repères de car-{key}.png (scripts/photos-mo13.py). px = pixels du PNG ; contour = repère '
                f'du contour (1000 px de large).\nwindow.{var} = ' + json.dumps(R, ensure_ascii=False) + ';\n')

        # la 206 floue de l'image 0 : demi-résolution, flou sur couleurs prémultipliées (pas de halo sombre au bord)
        a = np.asarray(Image.open(OUT / 'car-206-mo13.png').convert('RGBA')).astype(np.float32) / 255
        Wf, Hf = a.shape[1], a.shape[0]
        half = cv2.resize(a, (Wf // 2, Hf // 2), interpolation=cv2.INTER_AREA)
        pm = cv2.GaussianBlur(half[..., :3] * half[..., 3:4], (0, 0), 7.0)
        al = cv2.GaussianBlur(half[..., 3], (0, 0), 7.0)
        fl = np.dstack([np.clip(pm / np.maximum(al[..., None], 1e-4), 0, 1), al]) * 255
        Image.fromarray(fl.round().astype(np.uint8), 'RGBA').save(OUT / 'car-206-mo13-flou.png', optimize=True)
        R = made['206-mo13']; R['flou'] = {'fichier': 'car-206-mo13-flou.png', 'echelle': 0.5,
                                           'sigma_px_pleine_resolution': 14}
        (OUT / 'car-206-mo13-reperes.js').write_text(
            '// MO13 : repères de car-206-mo13.png (scripts/photos-mo13.py). px = pixels du PNG ; contour = repère du '
            'contour (1000 px de large).\n// Pour car-206-mo13-flou.png, multiplier les px par 0,5.\n'
            'window.CAR_206_MO13_REPERES = ' + json.dumps(R, ensure_ascii=False) + ';\n')

        # crédits
        (OUT / 'CREDITS.tsv').write_text(
            'voiture\tfichier\tauteur\tlicence\tpage\tsource locale\tmodifications\n'
            '206-mo13\t2000 Peugeot 206 L 1.1 Front.jpg\tVauxford\tCC BY-SA 4.0\t'
            'https://commons.wikimedia.org/wiki/File%3A2000_Peugeot_206_L_1.1_Front.jpg\t'
            '../cars-libres/src/wm-206.jpg (hors git, vignette Commons 1920 px)\t'
            'logos, autocollants et plaque effacés, pare-brise teinté, gilet effacé, retournée, détourée, étalonnée\n'
            'megane2\t2007 Renault Megane Dynamique 1.6 Front.jpg\tVauxford\tCC BY-SA 4.0\t'
            'https://commons.wikimedia.org/wiki/File%3A2007_Renault_Megane_Dynamique_1.6_Front.jpg\t'
            'src/wm-megane2.jpg (hors git, vignette Commons 1920 px, téléchargée le 9 oct. 2026)\t'
            'logos, inscription du badge, texte du cadre et plaque effacés, retournée, détourée, étalonnée\n'
            'fiesta6\t2010 Ford Fiesta Edge 1.2 Front.jpg\tVauxford\tCC BY-SA 4.0\t'
            'https://commons.wikimedia.org/wiki/File%3A2010_Ford_Fiesta_Edge_1.2_Front.jpg\t'
            'src/wm-fiesta6.jpg (hors git, vignette Commons 1920 px, téléchargée le 9 oct. 2026)\t'
            'logos et plaque effacés, retournée, détourée, étalonnée\n')
        print('→', OUT, sorted(p.name for p in OUT.iterdir() if p.is_file()))

    # contrôle : les trois voitures côte à côte, à la même échelle réelle, sur le fond du film ; zooms des zones
    if CHECK and made:
        CHECK.mkdir(parents=True, exist_ok=True)
        BG = (8, 7, 10, 255)
        ims = {k: Image.open(OUT / f'car-{k}.png').convert('RGBA') for k in made}
        sc0 = 560 / ims['206-mo13'].width
        row = []
        for k, im in ims.items():
            s = sc0 * made[k]['echelle']['facteur_vs_206']
            row.append((k, im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS), s))
        gl = max(r[1].height for r in row)
        S = Image.new('RGBA', (sum(r[1].width for r in row) + 40 * (len(row) + 1), gl + 80), BG)
        d = ImageDraw.Draw(S); x = 40
        for k, im, s in row:
            yb = 30 + gl - im.height
            # posées sur la même ligne de sol (contact de la roue avant)
            off = int(gl - made[k]['sol']['avant']['px'][1] * s)
            S.alpha_composite(im, (x, 30 + off)); d.text((x, 8), f'{k}  x{s:.3f}', fill=(255, 255, 255, 255))
            gy = 30 + off + made[k]['sol']['avant']['px'][1] * s
            d.line([(x, gy), (x + im.width, gy)], fill=(80, 255, 120, 255), width=1)
            rx, ry = made[k]['retro']['px']; d.ellipse([x + rx * s - 5, 30 + off + ry * s - 5, x + rx * s + 5,
                                                        30 + off + ry * s + 5], outline=(255, 120, 40, 255), width=2)
            x += im.width + 40
        S.convert('RGB').save(CHECK / 'mo13-voitures.jpg', quality=90)
        # zooms (× 2) des zones effacées, sur le PNG final
        Z = []
        for key, car in CARS.items():
            R = made[key]; im = ims[key]
            H0 = Image.open(car['src']).height
            W0 = Image.open(car['src']).width
            for kind, z, *_ in car['logos'] + [('plaque', car['plate'])]:
                pts = [(z[0] - z[2], z[1] - z[3]), (z[0] + z[2], z[1] + z[3])] if isinstance(z, tuple) else z
                xs_ = [W0 - 1 - p[0] for p in pts]; ys_ = [p[1] for p in pts]
                # repère PNG : on retrouve le décalage du rognage par le rétroviseur
                dx = R['retro']['px'][0] - (W0 - 1 - car['mirror'][0]); dy = R['retro']['px'][1] - car['mirror'][1]
                box = (int(min(xs_) - 30 + dx), int(min(ys_) - 30 + dy), int(max(xs_) + 30 + dx), int(max(ys_) + 30 + dy))
                c = Image.new('RGBA', (box[2] - box[0], box[3] - box[1]), BG)
                c.alpha_composite(im.crop(box)); c = c.convert('RGB')
                c = c.resize((c.width * 2, c.height * 2), Image.LANCZOS) if c.width < 400 else c
                Z.append((f'{key} {kind}', c))
        Wz = 1600; xs_, ys_, rh = 0, 0, 0; pos = []
        for lab, c in Z:
            if xs_ + c.width > Wz: xs_, ys_ = 0, ys_ + rh + 22; rh = 0
            pos.append((lab, c, xs_, ys_)); xs_ += c.width + 10; rh = max(rh, c.height)
        SZ = Image.new('RGB', (Wz, ys_ + rh + 22), (8, 7, 10)); dz = ImageDraw.Draw(SZ)
        for lab, c, x_, y_ in pos: SZ.paste(c, (x_, y_ + 18)); dz.text((x_ + 2, y_ + 3), lab, fill='white')
        SZ.save(CHECK / 'mo13-voitures-zones.jpg', quality=90)
        for k, im in ims.items():
            b = Image.new('RGBA', im.size, BG); b.alpha_composite(im)
            b.convert('RGB').resize((im.width // 2, im.height // 2), Image.LANCZOS).save(CHECK / f'mo13-{k}.jpg', quality=90)
        fl = Image.open(OUT / 'car-206-mo13-flou.png'); b = Image.new('RGBA', fl.size, BG); b.alpha_composite(fl)
        b.convert('RGB').save(CHECK / 'mo13-206-flou.jpg', quality=90)
        print('contrôle →', CHECK)
