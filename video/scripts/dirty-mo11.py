"""MO11 « La préparation » : les états de la Clio III (assets/cars-libres/car-clio3.png), posés sur la voiture propre.

    python3 scripts/dirty-mo11.py            → assets/photos-mo11/ (calques + SVG + copie de la voiture et du contour)
    python3 scripts/dirty-mo11.py --check D  → en plus, planches de contrôle dans le dossier D (fond #08070a)

Méthode de scripts/dirty-mo9.py et scripts/polo-dirty-mo6.py, copiée (pas importée) : bruit à graine fixe, résultat
identique à chaque exécution. Coordonnées en pixels de car-clio3.png (1 809 × 1 232, l'avant regarde à gauche),
relevées sur une grille de 25 à 50 px (planches z-*.jpg de la session du 9 octobre 2026).

Calques RGBA de la taille du PNG (le film les peint par-dessus la voiture propre, dans cet ordre, chacun effacé par sa
ligne de partage) :
  clio3-poussiere.png    la voiture entière, sale : poussière brune en dégradé (dense sur le tiers bas et le bas de
                         caisse), projections au-dessus des roues, coulures sous les vitres et sous les optiques, vernis
                         sans éclat, « LAVE-MOI » tracé au doigt sur la portière avant (la peinture propre réapparaît
                         dans les lettres). Opaque sur la carrosserie : il remplace la voiture tant que le lavage n'est
                         pas passé. Salissure exagérée exprès : la peinture grise (luminance 102 / 255) ne ferait que
                         foncer sous une poussière réaliste, et il faut lire « sale » à 200 px.
  clio3-phares.png       voile jaune saturé et laiteux sur les deux optiques
  clio3-pare-brise.png   voile gris sur la face intérieure du pare-brise, traces d'essuyage ; les sièges restent
                         devinables derrière
  clio3-vitres.png       voile jaunâtre du tabac sur les vitres latérales, plus dense sur les bords
Vectoriels (viewBox = pixels du PNG, nets à tout grossissement, la caméra va jusqu'à × 1,6) :
  clio3-rayure.svg              rayure claire et deux éraflures sur l'aile avant, au-dessus de la roue
  clio3-enjoliveurs.svg         les deux enjoliveurs à l'achat : bruns, poussière de frein, bord frotté, un rayon fendu
  clio3-enjoliveurs-neufs.svg   le reflet des enjoliveurs neufs (arc de lumière sur le bord, rien d'autre : la photo
                                montre déjà des enjoliveurs gris argent propres, losanges effacés)
Copies pour le film : car-clio3.png, car-clio3-contour.js (window.CAR_CLIO3_CONTOUR), crédits dans CREDITS.tsv.
"""
import shutil, sys
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIB = ROOT / 'assets/cars-libres'
OUT = ROOT / 'assets/photos-mo11'
OUT.mkdir(parents=True, exist_ok=True)
CHECK = Path(sys.argv[sys.argv.index('--check') + 1]) if '--check' in sys.argv else None

for f in ('car-clio3.png', 'car-clio3-contour.js'):
    shutil.copyfile(LIB / f, OUT / f)

rng = np.random.default_rng(11)
car = Image.open(LIB / 'car-clio3.png').convert('RGBA'); W, H = car.size
rgb = np.asarray(car).astype(np.float32)[..., :3] / 255
alpha = np.asarray(car)[..., 3].astype(np.float32) / 255

# ---------------------------------------------------------------------------------------------------------------
# zones relevées sur la photo
# ---------------------------------------------------------------------------------------------------------------
WINDSHIELD = [(782, 70), (1000, 72), (1200, 79), (1365, 86), (1352, 170), (1336, 260), (1320, 330), (1300, 385),
              (1100, 388), (940, 378), (800, 362), (700, 350), (600, 338), (500, 322), (530, 285), (600, 205), (700, 125)]
SIDE_FRONT = [(1450, 83), (1473, 76), (1500, 73), (1523, 100), (1545, 200), (1563, 290), (1578, 332), (1500, 333),
              (1440, 330), (1400, 325), (1388, 287), (1395, 190), (1420, 118)]
SIDE_REAR = [(1532, 68), (1590, 72), (1625, 88), (1658, 113), (1680, 190), (1692, 258), (1640, 290), (1600, 315),
             (1568, 200), (1545, 110)]
LAMP_BIG = [(672, 819), (775, 814), (900, 804), (1000, 776), (1056, 745), (1094, 701), (1112, 632), (1117, 576),
            (1109, 554), (1081, 542), (1025, 539), (987, 548), (944, 570), (887, 607), (825, 645), (756, 689), (706, 726),
            (675, 782)]
LAMP_SMALL = [(100, 526), (80, 560), (62, 600), (50, 632), (44, 664), (60, 690), (90, 716), (98, 712), (106, 670),
              (114, 628), (132, 572), (152, 520), (176, 488), (194, 462), (186, 452), (160, 470), (130, 492)]
HUBS = [(1256, 991, 67, 169, 10), (1750, 613, 22, 96, 4)]        # enjoliveurs : centre, demi-axes, rotation (°)
ARCHES = [(1270, 760, 150, 120), (1745, 600, 70, 160)]           # passages de roue : projections de boue autour
BELT = [(1395, 335), (1580, 334), (1700, 262)]                    # bas des vitres latérales : départ des coulures
LAVE_QUAD = [(1400, 520), (1600, 482), (1600, 570), (1402, 628)]  # « LAVE-MOI » : haut-g, haut-d, bas-d, bas-g


def poly_mask(polys, blur=0.0):
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    for p in polys: d.polygon(p, fill=255)
    if blur: m = m.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(m).astype(np.float32) / 255


def blur_noise(scale, sigma):
    n = rng.random((H // scale + 2, W // scale + 2)).astype(np.float32)
    im = Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return np.asarray(im.filter(ImageFilter.GaussianBlur(sigma))).astype(np.float32) / 255


def save(a_rgb, a_alpha, name):
    a8 = (np.clip(a_alpha, 0, 1) * 255).astype(np.uint8)
    c8 = (np.clip(a_rgb, 0, 1) * 255).astype(np.uint8) * (a8 > 0)[..., None]   # RGB nul hors calque : fichier léger
    Image.fromarray(np.dstack([c8, a8]), 'RGBA').save(OUT / name, optimize=True)


glass = poly_mask([WINDSHIELD, SIDE_FRONT, SIDE_REAR], 2)
lamps = poly_mask([LAMP_BIG, LAMP_SMALL], 3)
lum = rgb.mean(-1, keepdims=True)
dark = np.clip((0.22 - lum[..., 0]) / 0.12, 0, 1)                 # pneus, grilles, joints : moins de poussière visible

# ---------------------------------------------------------------------------------------------------------------
# 1. poussière : la voiture entière, sale
# ---------------------------------------------------------------------------------------------------------------
dull = 0.10 + (lum + (rgb - lum) * 0.45) * 0.74                   # vernis sans éclat, noirs relevés
light = np.array([0.70, 0.65, 0.55], np.float32)                  # poussière sèche, claire et mate (surfaces du haut)
mud = np.array([0.34, 0.25, 0.15], np.float32)                    # boue brune (bas de caisse, bouclier, passages de roue)
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
# 1a. voile de poussière claire, en plaques : le haut de la voiture devient mat et beige
patch = blur_noise(40, 26); patch = (patch - patch.min()) / (np.ptp(patch) + 1e-6)
film = np.clip(0.34 + 0.34 * patch + 0.10 * blur_noise(6, 3), 0, 0.85)
film *= 1 - 0.55 * glass - 0.45 * lamps - 0.6 * dark              # vitres et optiques : voile plus léger
out = dull * (1 - film[..., None]) + light * film[..., None]
# 1b. boue : mesurée depuis le bas de la voiture, colonne par colonne (bouclier, bas de caisse), bord irrégulier
bottom = np.where(alpha.any(0), H - 1 - np.argmax(alpha[::-1] > 0.5, 0), 0).astype(np.float32)
bottom = cv2.blur(cv2.erode(bottom[None], np.ones((1, 61), np.float32))[0][None], (121, 1))[0]
dist = bottom[None, :] - YY                                       # pixels au-dessus du bas de la voiture
edge_n = 70 * (blur_noise(18, 10) - 0.5) + 35 * (blur_noise(5, 2) - 0.5)
mudc = np.clip((300 + edge_n - dist) / 140, 0, 1) ** 1.1
for cx, cy, rx, ry in ARCHES:                                     # projections autour des passages de roue
    r = np.sqrt(((XX - cx) / rx) ** 2 + ((YY - cy) / ry) ** 2)
    mudc = np.maximum(mudc, np.clip(1.3 - np.abs(r - 1.08) * 2.4, 0, 1) * (0.35 + 0.5 * np.clip((blur_noise(2, 1.2) - 0.35) * 2.5, 0, 1)))
speck = np.clip((blur_noise(1, 0.8) - 0.52) * 4, 0, 1)            # éclaboussures au-dessus de la limite
splash = np.clip((420 - dist) / 260, 0, 1) * speck * (0.5 + 0.5 * blur_noise(12, 6))
mudc = np.clip(np.maximum(mudc * (0.75 + 0.25 * blur_noise(9, 4)), splash), 0, 0.92) * (1 - glass) * (1 - dark * 0.55)
out = out * (1 - mudc[..., None]) + mud * (0.85 + 0.3 * blur_noise(7, 3))[..., None] * mudc[..., None]
# 1c. coulures sombres, irrégulières et effilées : sous les vitres latérales, sous les optiques et la calandre
st = Image.new('L', (W, H), 0); d = ImageDraw.Draw(st)
def belt_y(x):
    return float(np.interp(x, [p[0] for p in BELT], [p[1] for p in BELT]))
def drip(x, y0, L, w, v):
    x1 = x + rng.normal(0, 2.0); x2 = x1 + rng.normal(0, 1.5)
    d.line([(x, y0), (x1, y0 + L * 0.55)], fill=v, width=w)
    d.line([(x1, y0 + L * 0.55), (x2, y0 + L)], fill=int(v * 0.6), width=max(1, w - 2))
for _ in range(42):                                               # sous les vitres latérales
    x = rng.uniform(1400, 1700); drip(x, belt_y(x) + rng.uniform(2, 30), rng.uniform(30, 200), int(rng.uniform(2, 6)), int(rng.uniform(60, 190)))
for _ in range(34):                                               # bouclier et calandre, sous les optiques
    x = rng.uniform(60, 1090); y0 = float(np.interp(x, [60, 400, 700, 1000, 1090], [720, 800, 822, 790, 760])) + rng.uniform(0, 60)
    drip(x, y0, rng.uniform(25, 140), int(rng.uniform(2, 5)), int(rng.uniform(50, 170)))
streak = np.asarray(st.filter(ImageFilter.GaussianBlur(1.8))).astype(np.float32) / 255 * (1 - glass) * (1 - dark)
fine = np.clip((blur_noise(1, 0.6) - 0.60) * 4, 0, 1) * (0.4 + 0.6 * blur_noise(30, 20)) * (1 - glass)
spots = np.clip(streak * 0.8 + fine * 0.3, 0, 1)[..., None]
out = np.clip(out * (1 - spots * 0.6) + mud * 0.75 * spots * 0.6, 0, 1)

# « LAVE-MOI » au doigt : lettres tracées dans la poussière, la peinture propre réapparaît
def quad_pt(u, v):
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = LAVE_QUAD
    top = (x0 + (x1 - x0) * u, y0 + (y1 - y0) * u); bot = (x3 + (x2 - x3) * u, y3 + (y2 - y3) * u)
    return (top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v)
GLYPHS = {   # traits dans une boîte unité (largeur, hauteur 1), avance en unités
    'L': (0.62, [[(0, 0), (0, 1), (0.6, 1)]]),
    'A': (0.70, [[(0, 1), (0.33, 0), (0.66, 1)], [(0.14, 0.62), (0.52, 0.62)]]),
    'V': (0.70, [[(0, 0), (0.33, 1), (0.66, 0)]]),
    'E': (0.62, [[(0.6, 0), (0, 0), (0, 1), (0.6, 1)], [(0, 0.5), (0.48, 0.5)]]),
    '-': (0.48, [[(0.06, 0.55), (0.40, 0.55)]]),
    'M': (0.84, [[(0, 1), (0, 0), (0.39, 0.62), (0.78, 0), (0.78, 1)]]),
    'O': (0.70, [[(0.33 + 0.33 * np.cos(a), 0.5 + 0.5 * np.sin(a)) for a in np.linspace(0, 2 * np.pi, 33)]]),
    'I': (0.22, [[(0.08, 0), (0.08, 1)]]),
}
TEXT = 'LAVE-MOI'; GAP = 0.20
total = sum(GLYPHS[c][0] for c in TEXT) + GAP * (len(TEXT) - 1)
lt = Image.new('L', (W, H), 0); d = ImageDraw.Draw(lt)
ux = 0.0
for c in TEXT:
    adv, strokes = GLYPHS[c]
    for s in strokes:
        pts = []
        for (gx, gy) in s:
            u = (ux + gx) / total; v = 0.08 + gy * 0.84
            px, py = quad_pt(u, v)
            pts.append((px + rng.normal(0, 0.7), py + rng.normal(0, 0.7)))
        d.line(pts, fill=255, width=11, joint='curve')
        for p in (pts[0], pts[-1]): d.ellipse([p[0] - 5.5, p[1] - 5.5, p[0] + 5.5, p[1] + 5.5], fill=255)
    ux += adv + GAP
letters = np.asarray(lt.filter(ImageFilter.GaussianBlur(1.1))).astype(np.float32) / 255
letters *= 0.82 + 0.18 * blur_noise(2, 1.0)                      # bord du doigt irrégulier, un peu de poussière reste
L3 = letters[..., None]
out = out * (1 - L3) + np.clip(rgb * 0.97, 0, 1) * L3
poussiere = out
save(poussiere, alpha, 'clio3-poussiere.png')

# ---------------------------------------------------------------------------------------------------------------
# 2. phares : voile jaune saturé, laiteux, craquelé
# ---------------------------------------------------------------------------------------------------------------
m = poly_mask([LAMP_BIG, LAMP_SMALL], 4)
haze = 0.62 + 0.38 * blur_noise(14, 9)
craze = np.clip((blur_noise(3, 1.2) - 0.5) * 3, 0, 1) * 0.15
a = m * np.clip(haze + craze, 0, 1) * 0.88
col = np.array([0.90, 0.70, 0.30], np.float32) * (0.88 + 0.12 * blur_noise(6, 2)[..., None])
col = col * (1 - 0.25 * lum) + 0.25 * lum * np.array([1.0, 0.86, 0.55], np.float32)   # reflets de l'optique conservés
save(col, a, 'clio3-phares.png')

# ---------------------------------------------------------------------------------------------------------------
# 3. pare-brise : voile gris sur la face intérieure, traces d'essuyage circulaires
# ---------------------------------------------------------------------------------------------------------------
m = poly_mask([WINDSHIELD], 3)
wipe = Image.new('L', (W, H), 0); d = ImageDraw.Draw(wipe)
for _ in range(16):                                               # arcs laissés par un chiffon sec
    cx, cy = rng.uniform(620, 1300), rng.uniform(130, 360); r = rng.uniform(40, 110)
    a0 = rng.uniform(0, 360)
    d.arc([cx - r, cy - r * 0.6, cx + r, cy + r * 0.6], a0, a0 + rng.uniform(80, 200), fill=int(rng.uniform(90, 180)), width=int(rng.uniform(6, 14)))
wipe = np.asarray(wipe.filter(ImageFilter.GaussianBlur(5))).astype(np.float32) / 255
a = m * np.clip(0.50 + 0.18 * blur_noise(16, 12) + 0.22 * wipe, 0, 0.85)
col = np.broadcast_to(np.array([0.66, 0.65, 0.62], np.float32), (H, W, 3)) * (0.92 + 0.08 * blur_noise(4, 2)[..., None])
save(col, a, 'clio3-pare-brise.png')

# ---------------------------------------------------------------------------------------------------------------
# 4. vitres latérales : voile jaunâtre du tabac, plus dense sur les bords et en haut
# ---------------------------------------------------------------------------------------------------------------
m = poly_mask([SIDE_FRONT, SIDE_REAR], 2)
inner = poly_mask([SIDE_FRONT, SIDE_REAR], 0)
edge = np.clip(1 - cv2.GaussianBlur(cv2.erode(inner, np.ones((3, 3), np.uint8), iterations=14), (0, 0), 10) * 1.0, 0, 1)
top = np.clip((260 - YY) / 220, 0, 1)
a = m * np.clip(0.52 + 0.20 * edge + 0.12 * top + 0.12 * (blur_noise(12, 8) - 0.5), 0, 0.88)
col = np.broadcast_to(np.array([0.74, 0.62, 0.36], np.float32), (H, W, 3)) * (0.9 + 0.1 * blur_noise(5, 2)[..., None])
save(col, a, 'clio3-vitres.png')

# ---------------------------------------------------------------------------------------------------------------
# 5. vectoriels : rayure, enjoliveurs à l'achat, reflet des enjoliveurs neufs
# ---------------------------------------------------------------------------------------------------------------
def svg(body, defs=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'<defs>{defs}</defs>{body}</svg>\n')

def path(pts, close=False):
    s = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    return s + (' Z' if close else '')

def jitter_line(x0, y0, x1, y1, n, j, bow=0.0):
    pts = []
    for i in range(n + 1):
        t = i / n; bx = -(y1 - y0) * bow * 4 * t * (1 - t); by = (x1 - x0) * bow * 4 * t * (1 - t)
        pts.append((x0 + (x1 - x0) * t + bx + rng.normal(0, j), y0 + (y1 - y0) * t + by + rng.normal(0, j)))
    return pts

# rayure : un trait principal clair (ombre portée dessous) et deux éraflures, sur l'aile avant au-dessus de la roue
main = jitter_line(1165, 657, 1346, 592, 36, 0.55, bow=0.03)
e1 = jitter_line(1192, 676, 1292, 641, 18, 0.5)
e2 = jitter_line(1218, 641, 1302, 613, 14, 0.45)
micro = [jitter_line(x, y, x + dx, y - dx * 0.36, 4, 0.3) for x, y, dx in [(1158, 668, 14), (1172, 662, 9), (1330, 604, 12), (1250, 660, 10)]]
body = (f'<g fill="none" stroke-linecap="round" stroke-linejoin="round">'
        f'<path d="{path([(x, y + 1.6) for x, y in main])}" stroke="#2a2420" stroke-opacity=".38" stroke-width="4.2"/>'
        f'<path d="{path(main)}" stroke="#efe9df" stroke-width="3.4"/>'
        f'<path d="{path(main)}" stroke="#ffffff" stroke-width="1.1"/>'
        f'<path d="{path([(x, y + 1.2) for x, y in e1])}" stroke="#2a2420" stroke-opacity=".3" stroke-width="2.2"/>'
        f'<path d="{path(e1)}" stroke="#ece5da" stroke-opacity=".9" stroke-width="1.6"/>'
        f'<path d="{path(e2)}" stroke="#ece5da" stroke-opacity=".8" stroke-width="1.1"/>'
        + ''.join(f'<path d="{path(p)}" stroke="#f3eee6" stroke-opacity=".75" stroke-width="1"/>' for p in micro)
        + '</g>')
(OUT / 'clio3-rayure.svg').write_text(svg(body))

def hub_pt(h, th, r):
    cx, cy, rx, ry, ang = h; a = np.radians(ang); x, y = rx * r * np.cos(np.radians(th)), ry * r * np.sin(np.radians(th))
    return (cx + x * np.cos(a) - y * np.sin(a), cy + x * np.sin(a) + y * np.cos(a))

defs = ('<radialGradient id="crasse" cx=".5" cy=".5" r=".5">'
        '<stop offset="0" stop-color="#7a5f41" stop-opacity=".42"/><stop offset=".55" stop-color="#5f4630" stop-opacity=".58"/>'
        '<stop offset=".86" stop-color="#46321f" stop-opacity=".78"/><stop offset="1" stop-color="#352619" stop-opacity=".9"/>'
        '</radialGradient><filter id="flou" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>')
body = ''
for k, h in enumerate(HUBS):
    cx, cy, rx, ry, ang = h; s = ry / 169                       # échelle : la roue arrière est plus petite
    body += f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" transform="rotate({ang} {cx} {cy})" fill="url(#crasse)"/>'
    # poussière de frein : taches sombres floues, surtout en bas et près du bord
    blobs = ''
    for _ in range(9 if k == 0 else 5):
        th = rng.uniform(10, 170) if rng.random() < 0.7 else rng.uniform(-170, -10); r = rng.uniform(0.55, 0.95)
        x, y = hub_pt(h, th, r); bw, bh = rng.uniform(10, 26) * s * (rx / 67 * 1.4 if k else 1), rng.uniform(18, 46) * s
        blobs += f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{bw:.1f}" ry="{bh:.1f}" transform="rotate({ang} {x:.1f} {y:.1f})" fill="#2e2117" fill-opacity="{rng.uniform(.25, .45):.2f}"/>'
    body += f'<g filter="url(#flou)">{blobs}</g>'
    # bord frotté contre le trottoir (en bas, côté avant) : éraflures claires sur l'anneau extérieur
    for _ in range(9 if k == 0 else 4):                          # le long de l'anneau, pas en travers
        th = rng.uniform(30, 120); r0 = rng.uniform(0.95, 0.985)
        arc = [hub_pt(h, t_, r0 + rng.normal(0, 0.004)) for t_ in np.linspace(th, th + rng.uniform(3, 8), 4)]
        body += f'<path d="{path(arc)}" stroke="#e9e3d8" stroke-opacity="{rng.uniform(.35, .65):.2f}" stroke-width="{1.2 * max(s, .6):.2f}" stroke-linecap="round" fill="none"/>'
    if k == 0:   # le rayon fendu : un éclat manquant au bord, une fissure qui part vers le centre
        chip = [hub_pt(h, th, r) for th, r in [(-52, 1.0), (-38, 1.0), (-40, 0.9), (-44, 0.86), (-49, 0.9)]]
        body += f'<path d="{path(chip, True)}" fill="#120e0b" fill-opacity=".92"/>'
        crack = [hub_pt(h, th, r) for th, r in [(-45, 0.87), (-47, 0.8), (-44, 0.73), (-48, 0.66), (-46, 0.6), (-50, 0.52), (-48, 0.46)]]
        body += f'<path d="{path(crack)}" stroke="#16110d" stroke-width="2.4" stroke-linejoin="round" fill="none"/>'
        body += f'<path d="{path([(x + 1.6, y + 0.4) for x, y in crack])}" stroke="#efe8dc" stroke-opacity=".55" stroke-width=".9" fill="none"/>'
        branch = [hub_pt(h, th, r) for th, r in [(-46, 0.6), (-38, 0.56), (-33, 0.5)]]
        body += f'<path d="{path(branch)}" stroke="#16110d" stroke-width="1.5" fill="none"/>'
(OUT / 'clio3-enjoliveurs.svg').write_text(svg(body, defs))

defs = ('<filter id="doux" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter>')
body = '<g filter="url(#doux)" fill="none" stroke-linecap="round">'
for h in HUBS:
    s = h[3] / 169
    arc = [hub_pt(h, th, 0.95) for th in np.linspace(-165, -75, 24)]
    body += f'<path d="{path(arc)}" stroke="#ffffff" stroke-opacity=".75" stroke-width="{5 * max(s, .5):.1f}"/>'
    arc2 = [hub_pt(h, th, 0.62) for th in np.linspace(-150, -110, 10)]
    body += f'<path d="{path(arc2)}" stroke="#ffffff" stroke-opacity=".45" stroke-width="{3 * max(s, .5):.1f}"/>'
body += '</g>'
(OUT / 'clio3-enjoliveurs-neufs.svg').write_text(svg(body, defs))
print('ok', OUT)

# ---------------------------------------------------------------------------------------------------------------
# contrôle : états composés sur fond #08070a, plein cadre et à 200 px de large
# ---------------------------------------------------------------------------------------------------------------
if CHECK:
    import subprocess, json
    CHECK.mkdir(parents=True, exist_ok=True)
    names = ['clio3-rayure.svg', 'clio3-enjoliveurs.svg', 'clio3-enjoliveurs-neufs.svg']
    # rendu par Chromium (Playwright de video/node_modules), comme dans le film ; un seul navigateur, fermé aussitôt
    js = ("import { chromium } from 'playwright'; import fs from 'fs';"
          "const [W, H, out, ...files] = JSON.parse(process.argv[1]); const b = await chromium.launch();"
          "const p = await b.newPage({ viewport: { width: W, height: H } });"
          "for (const f of files) { await p.setContent('<body style=\"margin:0;background:transparent\">' + fs.readFileSync(f, 'utf8') + '</body>');"
          "await p.screenshot({ path: out + '/' + f.split('/').pop() + '.png', omitBackground: true }); } await b.close();")
    subprocess.run(['node', '--input-type=module', '-e', js, json.dumps([W, H, str(CHECK), *[str(OUT / n) for n in names]])], cwd=ROOT, check=True)
    def svg_png(name):
        return Image.open(CHECK / f'{name}.png').convert('RGBA')
    clean = car
    def comp(layers):
        bg = Image.new('RGBA', (W, H), (8, 7, 10, 255)); bg.alpha_composite(clean)
        for L in layers: bg.alpha_composite(L)
        return bg
    P = {n: Image.open(OUT / n).convert('RGBA') for n in ('clio3-poussiere.png', 'clio3-phares.png', 'clio3-pare-brise.png', 'clio3-vitres.png')}
    R, E, N = svg_png('clio3-rayure.svg'), svg_png('clio3-enjoliveurs.svg'), svg_png('clio3-enjoliveurs-neufs.svg')
    sale = comp([P['clio3-poussiere.png'], P['clio3-phares.png'], P['clio3-pare-brise.png'], P['clio3-vitres.png'], R, E])
    lavee = comp([P['clio3-phares.png'], P['clio3-pare-brise.png'], P['clio3-vitres.png'], R, E])
    propre = comp([N])
    for n, im in [('sale', sale), ('lavee', lavee), ('propre', propre)]: im.convert('RGB').save(CHECK / f'mo11-etat-{n}.jpg', quality=90)
    small = [im.convert('RGB').resize((200, int(200 * H / W)), Image.LANCZOS) for im in (sale, propre)]
    S = Image.new('RGB', (420, small[0].height + 20), (8, 7, 10)); S.paste(small[0], (5, 10)); S.paste(small[1], (215, 10))
    S.save(CHECK / 'mo11-etat-200px.png')
    print('contrôle', CHECK)
