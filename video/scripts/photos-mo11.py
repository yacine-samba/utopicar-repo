"""MO11 « Deux voitures » : les deux voitures du débutant (~2 500 € chacune), deux vraies photos Wikimedia Commons,
versions exactes, même angle (trois quarts avant, avant vers la gauche), couleurs nettement différentes :
  car-twingo  Renault Twingo II phase 1, 2009, 1.1 Freeway 3 portes, rouge (Vauxford, CC BY-SA 4.0)
  car-c3      Citroën C3 I phase 1 (2002-2005), 5 portes, bleu clair métallisé (M 93, domaine public)
→ logos (losange, chevrons, centres d'enjoliveurs) et plaques effacés (plaques vierges, texte du cadre de concession),
vignette de stationnement et plaque vue à travers le pare-brise effacées, détourées (BiRefNet), bords décontaminés,
étalonnées dans la charte comme MO8 (ombres chaudes, fond noir), plus leur contour vectoriel pour le liseré de lumière.
    python3 scripts/photos-mo11.py   → assets/photos-mo11/car-<nom>.png (RGBA, rognée)
                                       assets/photos-mo11/car-<nom>-contour.js (window.CAR_<NOM>_CONTOUR, même rognage)
    python3 scripts/photos-mo11.py --retouche   → src/retouche-<nom>.png seulement (contrôle des zones effacées)
Originaux dans assets/photos-mo11/src/wm-<nom>.jpg (hors git, vignettes 1920 px de Commons) ; auteurs et licences :
assets/photos-mo11/CREDITS.tsv (crédit dans la légende du post pour la Twingo, CC BY-SA 4.0).
Contour au format de film-mo5da/polo-contour.js : {w: 1000, h, d, len, n}, repère 1000 px de large = largeur du PNG.
"""
import json, sys
import numpy as np, cv2
from pathlib import Path
from PIL import Image
from rembg import new_session, remove

D = Path(__file__).resolve().parent.parent / 'assets' / 'photos-mo11'


def c3_slats(x):
    """Décalage vertical des lamelles de calandre de la C3 (pente mesurée : 0,21 à x = 390 → 0,12 à x = 560)."""
    u = x - 390.0
    return 0.21 * u - 0.000265 * u * u


# retouches, en pixels de l'original 1920 px (avant retournement) ; zone = ellipse (cx, cy, rx, ry) ou polygone
#   'clone'  copie d'une tôle voisine décalée de (dx, dy), fondue par Poisson (garde le grain et les reflets)
#   'band'   interpolation ligne à ligne entre les deux bords, le long des lamelles (fonction de pente optionnelle)
#   'smooth' surface lisse ajustée sur l'anneau autour de la zone (centre d'enjoliveur)
#   'text'   bandeau sombre assombri jusqu'à son noir (le texte clair disparaît) : cadre de plaque du concessionnaire
#   'telea'  inpainting classique (petites zones : enjoliveur arrière, pare-brise)
# plaque : quadrilatère (haut-g, haut-d, bas-d, bas-g) → plaque vierge
CARS = {
    'twingo': dict(src='wm-twingo.jpg', flip=False, logos=[
        ('clone', [(196, 586), (276, 546), (300, 550), (305, 580), (291, 630), (263, 668), (240, 683), (200, 681),
                   (193, 640)], (125, 0)),                                  # losange Renault et son logement
        ('smooth', (1115, 997, 30, 36)),                                    # losange de l'enjoliveur avant
        ('telea', (1806, 667, 11, 17)),                                     # losange de l'enjoliveur arrière
        ('telea', [(1110, 266), (1198, 274), (1190, 330), (1082, 320)]),    # vignette de stationnement (pare-brise)
        ('telea', [(932, 196), (1006, 198), (1008, 232), (930, 230)]),      # plaque jaune vue à travers la vitre
    ], plate=[(108, 736), (346, 838), (344, 944), (112, 832)]),
    'c3': dict(src='wm-c3.jpg', flip=False, logos=[
        ('band', [(402, 868), (403, 844), (413, 810), (485, 752), (507, 754), (541, 801), (545, 842), (533, 884),
                  (511, 886)], c3_slats),                                   # double chevron et son ombre portée
        ('text', [(257, 1041), (290, 1047), (400, 1074), (470, 1089), (550, 1102), (605, 1112), (605, 1131),
                  (550, 1123), (470, 1105), (400, 1090), (290, 1084), (257, 1056)]),  # texte du cadre de plaque
        ('smooth', (1296, 1104, 19, 36)),                                   # chevrons de l'enjoliveur avant
        ('telea', (1772, 773, 10, 21)),                                     # chevrons de l'enjoliveur arrière
    ], plate=[(261, 960), (611, 1028), (613, 1108), (262, 1038)]),          # plaque, bande UE comprise
}


def zone_mask(shape, z):
    m = np.zeros(shape[:2], np.uint8)
    if isinstance(z, tuple): cx, cy, rx, ry = z; cv2.ellipse(m, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
    else: cv2.fillPoly(m, [np.array(z, np.int32)], 255)
    return m


def band_fill(im, m, slope=None):
    """Efface un badge posé sur des bandes (calandre) : l'image est redressée pour que les lamelles soient
    horizontales, chaque ligne est interpolée entre ses deux bords, puis l'image est remise en place."""
    H, W = im.shape[:2]
    xx, yy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    off = slope(xx).astype(np.float32) if slope else np.zeros_like(xx)
    f0 = im.astype(np.float32)
    f = cv2.remap(f0, xx, yy + off, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)       # redressée
    ms = cv2.remap(m, xx, yy + off, cv2.INTER_NEAREST)
    out = f.copy()
    for y in np.nonzero(ms.any(1))[0]:
        xs = np.nonzero(ms[y])[0]
        xa, xb = xs[0], xs[-1]
        L = np.median(f[y - 1:y + 2, xa - 7:xa - 1].reshape(-1, 3), 0)
        R = np.median(f[y - 1:y + 2, xb + 2:xb + 8].reshape(-1, 3), 0)
        t = np.linspace(0, 1, xb - xa + 1)[:, None]
        out[y, xa:xb + 1] = L * (1 - t) + R * t
    sm = cv2.GaussianBlur(out, (0, 0), 1.2)
    sm += np.random.default_rng(11).normal(0, 2.0, sm.shape).astype(np.float32)               # grain de la photo
    back = cv2.remap(sm, xx, yy - off, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)       # remise en place
    w = cv2.GaussianBlur((m > 0).astype(np.float32), (0, 0), 1.2)[..., None]
    return np.clip(f0 * (1 - w) + back * w, 0, 255).astype(np.uint8)


def smooth_fill(im, m):
    """Remplit la zone par une surface quadratique ajustée (robuste) sur un anneau de 10 px autour d'elle, plus le
    grain de la photo : un logo collé sur une tôle peinte ou un enjoliveur disparaît sans tache d'inpainting."""
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
        for _ in range(4):                                       # rejette reflets et trous d'enjoliveur
            c, *_ = np.linalg.lstsq(A[keep], b[keep], rcond=None)
            r = b - A @ c; keep = np.abs(r) < 2.0 * max(np.std(r[keep]), 1.0)
        out[my, mx, ch] = B @ c
    out += np.random.default_rng(int(cx)).normal(0, 3.0, f.shape).astype(np.float32) * (m > 0)[..., None]
    w = cv2.GaussianBlur((m > 0).astype(np.float32), (0, 0), 2.0)[..., None]
    return np.clip(f * (1 - w) + out * w, 0, 255).astype(np.uint8)


def clone_fill(im, m, off):
    """Recouvre la zone par la tôle voisine décalée de off = (dx, dy), fondue par Poisson (seamlessClone)."""
    dx, dy = off
    src = cv2.warpAffine(im, np.float32([[1, 0, -dx], [0, 1, -dy]]), (im.shape[1], im.shape[0]),
                         borderMode=cv2.BORDER_REFLECT)
    mm = cv2.dilate(m, np.ones((5, 5), np.uint8))
    x, y, w, h = cv2.boundingRect(mm)
    return cv2.seamlessClone(src, im, mm, (x + w // 2, y + h // 2), cv2.NORMAL_CLONE)


def text_fill(im, m):
    """Efface le texte clair d'un bandeau sombre (cadre de plaque) : la zone est assombrie jusqu'au noir du bandeau,
    sans rien tirer du liseré blanc de la plaque ni des lamelles voisines."""
    f = im.astype(np.float32)
    base = np.percentile(f[m > 0], 20, axis=0)
    dark = np.minimum(f, base + np.random.default_rng(5).normal(0, 1.5, f.shape).astype(np.float32))
    w = cv2.GaussianBlur((m > 0).astype(np.float32), (0, 0), 0.8)[..., None]
    return np.clip(f * (1 - w) + dark * w, 0, 255).astype(np.uint8)


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


ses = new_session('birefnet-general-lite')
for key, car in CARS.items():
    NAME = f'car-{key}'
    im = cv2.imread(str(D / 'src' / car['src']))
    for kind, z, *rest in car['logos']:
        m = zone_mask(im.shape, z)
        if kind == 'band': im = band_fill(im, m, *rest)
        elif kind == 'clone': im = clone_fill(im, m, *rest)
        elif kind == 'smooth': im = smooth_fill(im, m)
        elif kind == 'text': im = text_fill(im, m, *rest)
        else: im = cv2.inpaint(im, m, 5, cv2.INPAINT_TELEA)
    im = blank_plate(im, car['plate'])
    cv2.imwrite(str(D / 'src' / f'retouche-{key}.png'), im)          # contrôle des retouches (hors git, comme src/)
    if '--retouche' in sys.argv: continue                            # retouches seules (réglage des zones)
    flip = car['flip']
    if flip: im = im[:, ::-1].copy()
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

    # étalonnage MO8 : saturation −20 %, contraste, ombres réchauffées, lumière qui tombe du haut-gauche (côté capot)
    f = im.astype(np.float32) / 255
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV); hsv[..., 1] *= .8; f = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    f = np.clip((f - .5) * 1.15 + .5, 0, 1) * .78
    lum = f.mean(2, keepdims=True); f = f * (np.array([.84, .93, 1.05], np.float32) * (1 - lum) + lum)
    yy, xx = np.mgrid[0:H, 0:W] / max(H, W)
    f *= (1.08 - .45 * np.clip(yy * .9 + xx * .2 - .25, 0, 1))[..., None]
    rgb = np.clip(f[..., ::-1], 0, 1).astype(np.float32)

    # décontamination : la couleur des pixels du bord est remplacée par celle de l'intérieur voisin (pas de liseré)
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
    Image.fromarray(np.dstack([rgb * 255, alpha * 255]).clip(0, 255).astype(np.uint8), 'RGBA').save(
        D / f'{NAME}.png', optimize=True)

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
